/**
 * Didar Gold Platform - Domain K01 Express Router
 * Implements REST endpoints for People, Organizations, Memberships, Documents & Audit
 */

import { Router, Request, Response } from 'express';
import {
  loadStore,
  createPerson,
  updatePerson,
  createOrganization,
  updateOrganization,
  createMembership,
  addDocument,
  saveStore
} from '../storage.js';
import { checkSupabaseHealth, syncSnapshotToSupabase } from '../lib/supabase.js';

export const k01Router = Router();

// GET /api/admin/kernel/k01
k01Router.get('/', (req: Request, res: Response) => {
  try {
    const store = loadStore();
    return res.json({
      success: true,
      data: store
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({
      error: { code: 'K01_FETCH_FAILED', message }
    });
  }
});

// POST /api/admin/kernel/k01
k01Router.post('/', async (req: Request, res: Response) => {
  try {
    const { resource, ...payload } = req.body;
    const actorName = req.headers['x-actor-name'] ? String(req.headers['x-actor-name']) : 'مدیر عملیات دیدار';

    if (!resource) {
      return res.status(400).json({
        error: { code: 'INVALID_RESOURCE', message: 'تعیین فیلد resource (person, organization, membership, document) الزامی است.' }
      });
    }

    if (resource === 'person') {
      const person = await createPerson(payload, actorName);
      return res.status(201).json({ success: true, data: person });
    }

    if (resource === 'organization') {
      const org = await createOrganization(payload, actorName);
      return res.status(201).json({ success: true, data: org });
    }

    if (resource === 'membership') {
      const mem = await createMembership(payload, actorName);
      return res.status(201).json({ success: true, data: mem });
    }

    if (resource === 'document') {
      const doc = await addDocument(payload, actorName);
      return res.status(201).json({ success: true, data: doc });
    }

    return res.status(400).json({
      error: { code: 'UNKNOWN_RESOURCE', message: `منبع ${resource} معتبر نیست.` }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای سرور';
    const statusCode = message.includes('تکراری') || message.includes('تعارض') ? 409 : 400;
    return res.status(statusCode).json({
      error: { code: 'K01_CREATION_FAILED', message }
    });
  }
});

// PATCH /api/admin/kernel/k01/:resource/:id
k01Router.patch('/:resource/:id', async (req: Request, res: Response) => {
  try {
    const { resource, id } = req.params;
    const updates = req.body;
    const actorName = req.headers['x-actor-name'] ? String(req.headers['x-actor-name']) : 'مدیر عملیات دیدار';

    if (resource === 'person' || resource === 'persons') {
      const updated = await updatePerson(id, updates, actorName);
      return res.json({ success: true, data: updated });
    }

    if (resource === 'organization' || resource === 'organizations') {
      const updated = await updateOrganization(id, updates, actorName);
      return res.json({ success: true, data: updated });
    }

    if (resource === 'membership' || resource === 'memberships') {
      const store = loadStore();
      const index = store.memberships.findIndex(m => m.id === id);
      if (index === -1) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'عضویت مورد نظر یافت نشد.' } });
      }
      store.memberships[index] = {
        ...store.memberships[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await saveStore(store);
      return res.json({ success: true, data: store.memberships[index] });
    }

    if (resource === 'document' || resource === 'documents') {
      const store = loadStore();
      const index = store.documents.findIndex(d => d.id === id);
      if (index === -1) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'مدرک مورد نظر یافت نشد.' } });
      }
      store.documents[index] = {
        ...store.documents[index],
        ...updates
      };
      await saveStore(store);
      return res.json({ success: true, data: store.documents[index] });
    }

    return res.status(400).json({
      error: { code: 'INVALID_RESOURCE', message: 'منبع نامعتبر است.' }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای به‌روزرسانی';
    const statusCode = message.includes('یافت نشد') ? 404 : message.includes('تعارض') ? 409 : 400;
    return res.status(statusCode).json({
      error: { code: 'K01_UPDATE_FAILED', message }
    });
  }
});

// POST /api/admin/kernel/k01/:resource/:id/status
k01Router.post('/:resource/:id/status', async (req: Request, res: Response) => {
  try {
    const { resource, id } = req.params;
    const { status, verificationStatus, reason } = req.body;
    const actorName = req.headers['x-actor-name'] ? String(req.headers['x-actor-name']) : 'مدیر عملیات دیدار';

    const store = loadStore();

    if (resource === 'person' || resource === 'persons') {
      const person = store.persons.find(p => p.id === id);
      if (!person) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'شخص یافت نشد.' } });

      const oldStatus = person.status;
      const oldVerif = person.verificationStatus;

      if (status) person.status = status;
      if (verificationStatus) person.verificationStatus = verificationStatus;
      person.updatedAt = new Date().toISOString();
      person.version += 1;

      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'status_change',
        targetType: 'party',
        targetId: person.id,
        targetName: `${person.firstName} ${person.lastName}`,
        description: `تغییر وضعیت شخص «${person.firstName} ${person.lastName}» از (${oldStatus}/${oldVerif}) به (${person.status}/${person.verificationStatus}). علت: ${reason || 'اقدام مجاز پنل ادمین'}`,
        timestamp: new Date().toISOString()
      });

      await saveStore(store);
      return res.json({ success: true, data: person });
    }

    if (resource === 'organization' || resource === 'organizations') {
      const org = store.organizations.find(o => o.id === id);
      if (!org) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'سازمان یافت نشد.' } });

      const oldStatus = org.status;
      const oldVerif = org.verificationStatus;

      if (status) org.status = status;
      if (verificationStatus) org.verificationStatus = verificationStatus;
      org.updatedAt = new Date().toISOString();
      org.version += 1;

      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'status_change',
        targetType: 'organization',
        targetId: org.id,
        targetName: org.displayName,
        description: `تغییر وضعیت سازمان «${org.displayName}» از (${oldStatus}/${oldVerif}) به (${org.status}/${org.verificationStatus}). علت: ${reason || 'اقدام مجاز پنل ادمین'}`,
        timestamp: new Date().toISOString()
      });

      await saveStore(store);
      return res.json({ success: true, data: org });
    }

    if (resource === 'membership' || resource === 'memberships') {
      const mem = store.memberships.find(m => m.id === id);
      if (!mem) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'پیوند عضویت یافت نشد.' } });

      const oldStatus = mem.status;
      if (status) mem.status = status;
      mem.updatedAt = new Date().toISOString();

      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'status_change',
        targetType: 'membership',
        targetId: mem.id,
        targetName: `${mem.partyName || mem.partyId} -> ${mem.organizationName || mem.organizationId}`,
        description: `تغییر وضعیت پیوند عضویت «${mem.partyName} - ${mem.organizationName}» از ${oldStatus} به ${mem.status}. علت: ${reason || 'اقدام مجاز پنل ادمین'}`,
        timestamp: new Date().toISOString()
      });

      await saveStore(store);
      return res.json({ success: true, data: mem });
    }

    return res.status(400).json({ error: { code: 'INVALID_RESOURCE', message: 'منبع نامعتبر است.' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای تغییر وضعیت';
    return res.status(500).json({ error: { code: 'STATUS_CHANGE_FAILED', message } });
  }
});

// GET /api/admin/kernel/k01/export
k01Router.get('/export', (req: Request, res: Response) => {
  try {
    const format = req.query.format === 'csv' ? 'csv' : 'json';
    const store = loadStore();

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="didar-k01-export.json"');
      return res.send(JSON.stringify(store, null, 2));
    }

    // CSV format
    let csv = 'Type,ID,Title,Classification,Mobile/Phone,Status,VerificationStatus,CreatedAt\n';
    store.persons.forEach(p => {
      csv += `"Person","${p.id}","${p.firstName} ${p.lastName}","${p.partyType}","${p.mobile}","${p.status}","${p.verificationStatus}","${p.createdAt}"\n`;
    });
    store.organizations.forEach(o => {
      csv += `"Organization","${o.id}","${o.displayName}","${o.organizationType}","${o.phone}","${o.status}","${o.verificationStatus}","${o.createdAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="didar-k01-export.csv"');
    return res.send('\uFEFF' + csv);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای استخراج داده';
    return res.status(500).json({ error: { code: 'EXPORT_FAILED', message } });
  }
});

// GET /api/admin/kernel/k01/supabase/health
k01Router.get('/supabase/health', async (req: Request, res: Response) => {
  try {
    const health = await checkSupabaseHealth();
    return res.json({ success: true, data: health });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای بررسی سلامت Supabase';
    return res.status(500).json({ error: { code: 'SUPABASE_HEALTH_ERROR', message } });
  }
});

// POST /api/admin/kernel/k01/supabase/sync
k01Router.post('/supabase/sync', async (req: Request, res: Response) => {
  try {
    const store = loadStore();
    const result = await syncSnapshotToSupabase(store);
    return res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای پشتیبان‌گیری ابری';
    return res.status(500).json({ success: false, message });
  }
});

