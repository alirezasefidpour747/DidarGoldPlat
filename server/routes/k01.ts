/**
 * Didar Gold Platform - Domain K01 Express Router
 * Implements REST endpoints for People, Organizations, Memberships, Documents & Audit.
 * Backed by PostgreSQL K01Repository with full contract preservation.
 */

import { Router, Request, Response } from 'express';
import { K01Repository } from '../repositories/k01.repository.js';
import { checkDatabaseHealth, createIndependentBackup } from '../lib/database.js';
import { AuditEvent } from '../../src/types/k01.js';

export const k01Router = Router();

// GET /api/admin/kernel/k01
k01Router.get('/', async (req: Request, res: Response) => {
  try {
    const store = await K01Repository.getFullStore();

    // If request is authenticated and user is not internal staff, scope to user's organization
    if (req.user && !req.user.isInternalStaff) {
      const userOrgId = req.user.organizationId;
      const filteredOrgs = store.organizations.filter((o) => o.id === userOrgId);
      const filteredMemberships = store.memberships.filter((m) => m.organizationId === userOrgId);
      const memberPartyIds = new Set(filteredMemberships.map((m) => m.partyId));
      memberPartyIds.add(req.user.partyId);
      const filteredPersons = store.persons.filter((p) => memberPartyIds.has(p.id));
      const filteredDocs = store.documents.filter((d) => d.targetId === userOrgId || memberPartyIds.has(d.targetId));
      const filteredAudit = store.auditLogs.filter((a) => a.targetId === userOrgId || a.actorId === req.user!.partyId);

      return res.json({
        success: true,
        data: {
          persons: filteredPersons,
          organizations: filteredOrgs,
          memberships: filteredMemberships,
          documents: filteredDocs,
          auditLogs: filteredAudit,
          counts: {
            totalPersons: filteredPersons.length,
            totalOrganizations: filteredOrgs.length,
            totalMemberships: filteredMemberships.length,
            activePersons: filteredPersons.filter((p) => p.status === 'active').length,
            activeOrganizations: filteredOrgs.filter((o) => o.status === 'active').length,
            verifiedPersons: filteredPersons.filter((p) => p.verificationStatus === 'verified').length,
            verifiedOrganizations: filteredOrgs.filter((o) => o.verificationStatus === 'verified').length,
          },
        },
      });
    }

    return res.json({
      success: true,
      data: store,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({
      error: { code: 'K01_FETCH_FAILED', message },
    });
  }
});

// POST /api/admin/kernel/k01
k01Router.post('/', async (req: Request, res: Response) => {
  try {
    const { resource, ...payload } = req.body;
    const actorName = req.headers['x-actor-name'] ? String(req.headers['x-actor-name']) : 'مدیر عملیات دیدار';
    const now = new Date().toISOString();

    if (!resource) {
      return res.status(400).json({
        error: { code: 'INVALID_RESOURCE', message: 'تعیین فیلد resource (person, organization, membership, document) الزامی است.' },
      });
    }

    if (resource === 'person') {
      const normalizedMobile = (payload.mobile || '').replace(/\D/g, '');
      if (!normalizedMobile || normalizedMobile.length < 10) {
        return res.status(400).json({
          error: { code: 'VALIDATION_FAILED', message: 'شماره همراه معتبر الزامی است.' },
        });
      }
      if (!payload.firstName || !payload.lastName) {
        return res.status(400).json({
          error: { code: 'VALIDATION_FAILED', message: 'نام و نام خانوادگی الزامی است.' },
        });
      }

      const personId = payload.id || `party-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const audit: AuditEvent = {
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'create',
        targetType: 'party',
        targetId: personId,
        targetName: `${payload.firstName} ${payload.lastName}`,
        description: `ثبت شخص جدید با عنوان «${payload.firstName} ${payload.lastName}» و نوع «${payload.partyType || 'consumer'}»`,
        timestamp: now,
      };

      const person = await K01Repository.createPerson(
        {
          id: personId,
          partyType: payload.partyType || 'consumer',
          firstName: payload.firstName,
          lastName: payload.lastName,
          nationalId: payload.nationalId,
          mobile: normalizedMobile,
          email: payload.email,
          status: payload.status || 'pending',
          verificationStatus: payload.verificationStatus || 'unverified',
          notes: payload.notes,
          consumerProfile: payload.consumerProfile,
          agentProfile: payload.agentProfile,
          internalProfile: payload.internalProfile,
          representativeProfile: payload.representativeProfile,
          version: 1,
          createdAt: now,
          updatedAt: now,
        },
        audit
      );

      return res.status(201).json({ success: true, data: person });
    }

    if (resource === 'organization') {
      if (!payload.legalName || !payload.displayName) {
        return res.status(400).json({
          error: { code: 'VALIDATION_FAILED', message: 'نام رسمی و نام تابلویی سازمان الزامی است.' },
        });
      }

      const orgId = payload.id || `org-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const audit: AuditEvent = {
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'create',
        targetType: 'organization',
        targetId: orgId,
        targetName: payload.displayName,
        description: `تعریف سازمان جدید با عنوان «${payload.displayName}» و نوع «${payload.organizationType || 'retailer'}»`,
        timestamp: now,
      };

      const org = await K01Repository.createOrganization(
        {
          id: orgId,
          legalName: payload.legalName,
          displayName: payload.displayName,
          organizationType: payload.organizationType || 'retailer',
          registrationNumber: payload.registrationNumber || '',
          nationalLegalId: payload.nationalLegalId || '',
          economicCode: payload.economicCode || '',
          website: payload.website || '',
          phone: payload.phone || '',
          email: payload.email || '',
          province: payload.province || '',
          city: payload.city || '',
          address: payload.address || '',
          postalCode: payload.postalCode || '',
          status: payload.status || 'pending',
          verificationStatus: payload.verificationStatus || 'unverified',
          notes: payload.notes || '',
          retailerProfile: payload.retailerProfile,
          manufacturerProfile: payload.manufacturerProfile,
          wholesalerProfile: payload.wholesalerProfile,
          supplierProfile: payload.supplierProfile,
          agentOfficeProfile: payload.agentOfficeProfile,
          servicePartnerProfile: payload.servicePartnerProfile,
          createdAt: now,
          updatedAt: now,
          version: 1,
        },
        audit
      );

      return res.status(201).json({ success: true, data: org });
    }

    if (resource === 'membership') {
      if (!payload.partyId || !payload.organizationId) {
        return res.status(400).json({
          error: { code: 'VALIDATION_FAILED', message: 'مشخص کردن شخص و سازمان برای برقراری رابطه عضویت الزامی است.' },
        });
      }

      if (req.user && !req.user.isInternalStaff && payload.organizationId !== req.user.organizationId) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN_CROSS_ORG', message: 'دسترسی غیرمجاز: شما مجاز به ایجاد عضویت در سازمان‌های دیگر نیستید.' },
        });
      }

      const memId = payload.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const audit: AuditEvent = {
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'membership_link',
        targetType: 'membership',
        targetId: memId,
        targetName: `${payload.partyName || payload.partyId} -> ${payload.organizationName || payload.organizationId}`,
        description: `برقراری پیوند عضویت برای کاربر در سازمان با نقش «${payload.roleKey || 'staff'}»`,
        timestamp: now,
      };

      const mem = await K01Repository.createMembership(
        {
          id: memId,
          partyId: payload.partyId,
          organizationId: payload.organizationId,
          roleKey: payload.roleKey || 'staff',
          title: payload.title || 'عضو سازمانی',
          authorities: payload.authorities || [],
          isPrimary: Boolean(payload.isPrimary),
          status: payload.status || 'active',
          validFrom: payload.validFrom || now.split('T')[0],
          validTo: payload.validTo,
          notes: payload.notes || '',
          partyName: payload.partyName,
          organizationName: payload.organizationName,
          createdAt: now,
          updatedAt: now,
        },
        audit
      );

      return res.status(201).json({ success: true, data: mem });
    }

    if (resource === 'document') {
      if (!payload.targetType || !payload.targetId || !payload.fileName) {
        return res.status(400).json({
          error: { code: 'VALIDATION_FAILED', message: 'اطلاعات مدرک ارسالی ناقص است.' },
        });
      }

      const docId = payload.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const audit: AuditEvent = {
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'document_upload',
        targetType: 'document',
        targetId: docId,
        targetName: payload.fileName,
        description: `بارگذاری مدرک «${payload.fileName}» برای موجودیت ${payload.targetType}`,
        timestamp: now,
      };

      const doc = await K01Repository.addDocument(
        {
          id: docId,
          targetType: payload.targetType,
          targetId: payload.targetId,
          documentType: payload.documentType || 'other',
          fileName: payload.fileName,
          fileSize: payload.fileSize || 1024 * 50,
          mimeType: payload.mimeType || 'application/pdf',
          fileUri: payload.fileUri || `secure://party-documents/${payload.targetId}/${payload.fileName}`,
          verificationStatus: payload.verificationStatus || 'pending',
          uploadedBy: payload.uploadedBy || 'actor-admin',
          notes: payload.notes || '',
          createdAt: now,
        },
        audit
      );

      return res.status(201).json({ success: true, data: doc });
    }

    return res.status(400).json({
      error: { code: 'UNKNOWN_RESOURCE', message: `منبع ${resource} معتبر نیست.` },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای سرور';
    const statusCode = message.includes('تکراری') || message.includes('تعارض') ? 409 : 400;
    return res.status(statusCode).json({
      error: { code: 'K01_CREATION_FAILED', message },
    });
  }
});

// PATCH /api/admin/kernel/k01/:resource/:id
k01Router.patch('/:resource/:id', async (req: Request, res: Response) => {
  try {
    const { resource, id } = req.params;
    const updates = req.body;
    const actorName = req.headers['x-actor-name'] ? String(req.headers['x-actor-name']) : 'مدیر عملیات دیدار';
    const now = new Date().toISOString();

    if (resource === 'person' || resource === 'persons') {
      const audit: AuditEvent = {
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'update',
        targetType: 'party',
        targetId: id,
        targetName: `${updates.firstName || ''} ${updates.lastName || ''}`.trim() || id,
        description: `ویرایش اطلاعات پرونده شخص در PostgreSQL`,
        timestamp: now,
      };
      const updated = await K01Repository.updatePerson(id, updates, audit);
      return res.json({ success: true, data: updated });
    }

    if (resource === 'organization' || resource === 'organizations') {
      const audit: AuditEvent = {
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'update',
        targetType: 'organization',
        targetId: id,
        targetName: updates.displayName || id,
        description: `ویرایش اطلاعات پرونده سازمان در PostgreSQL`,
        timestamp: now,
      };
      const updated = await K01Repository.updateOrganization(id, updates, audit);
      return res.json({ success: true, data: updated });
    }

    if (resource === 'membership' || resource === 'memberships') {
      const audit: AuditEvent = {
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'update',
        targetType: 'membership',
        targetId: id,
        description: `ویرایش اطلاعات پیوند عضویت در PostgreSQL`,
        timestamp: now,
      };
      const updated = await K01Repository.updateMembership(id, updates, audit);
      return res.json({ success: true, data: updated });
    }

    if (resource === 'document' || resource === 'documents') {
      const updated = await K01Repository.updateDocument(id, updates);
      return res.json({ success: true, data: updated });
    }

    return res.status(400).json({
      error: { code: 'INVALID_RESOURCE', message: 'منبع نامعتبر است.' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای به‌روزرسانی';
    const statusCode = message.includes('یافت نشد') ? 404 : message.includes('تعارض') ? 409 : 400;
    return res.status(statusCode).json({
      error: { code: 'K01_UPDATE_FAILED', message },
    });
  }
});

// POST /api/admin/kernel/k01/:resource/:id/status
k01Router.post('/:resource/:id/status', async (req: Request, res: Response) => {
  try {
    const { resource, id } = req.params;
    const { status, verificationStatus, reason } = req.body;
    const actorName = req.headers['x-actor-name'] ? String(req.headers['x-actor-name']) : 'مدیر عملیات دیدار';
    const now = new Date().toISOString();

    if (resource === 'person' || resource === 'persons') {
      const existing = await K01Repository.getPersonById(id);
      if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'شخص یافت نشد.' } });

      const audit: AuditEvent = {
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'status_change',
        targetType: 'party',
        targetId: existing.id,
        targetName: `${existing.firstName} ${existing.lastName}`,
        description: `تغییر وضعیت شخص «${existing.firstName} ${existing.lastName}» از (${existing.status}/${existing.verificationStatus}) به (${status || existing.status}/${verificationStatus || existing.verificationStatus}). علت: ${reason || 'اقدام مجاز پنل ادمین'}`,
        timestamp: now,
      };

      const updated = await K01Repository.updatePerson(
        id,
        {
          status: status || existing.status,
          verificationStatus: verificationStatus || existing.verificationStatus,
        },
        audit
      );

      return res.json({ success: true, data: updated });
    }

    if (resource === 'organization' || resource === 'organizations') {
      const existing = await K01Repository.getOrganizationById(id);
      if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'سازمان یافت نشد.' } });

      const audit: AuditEvent = {
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'status_change',
        targetType: 'organization',
        targetId: existing.id,
        targetName: existing.displayName,
        description: `تغییر وضعیت سازمان «${existing.displayName}» از (${existing.status}/${existing.verificationStatus}) به (${status || existing.status}/${verificationStatus || existing.verificationStatus}). علت: ${reason || 'اقدام مجاز پنل ادمین'}`,
        timestamp: now,
      };

      const updated = await K01Repository.updateOrganization(
        id,
        {
          status: status || existing.status,
          verificationStatus: verificationStatus || existing.verificationStatus,
        },
        audit
      );

      return res.json({ success: true, data: updated });
    }

    if (resource === 'membership' || resource === 'memberships') {
      const existing = await K01Repository.getMembershipById(id);
      if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'پیوند عضویت یافت نشد.' } });

      const audit: AuditEvent = {
        id: `audit-${Date.now()}`,
        actorId: 'actor-admin',
        actorName,
        action: 'status_change',
        targetType: 'membership',
        targetId: existing.id,
        targetName: `${existing.partyName || existing.partyId} -> ${existing.organizationName || existing.organizationId}`,
        description: `تغییر وضعیت پیوند عضویت از ${existing.status} به ${status || existing.status}. علت: ${reason || 'اقدام مجاز پنل ادمین'}`,
        timestamp: now,
      };

      const updated = await K01Repository.updateMembership(
        id,
        {
          status: status || existing.status,
        },
        audit
      );

      return res.json({ success: true, data: updated });
    }

    return res.status(400).json({ error: { code: 'INVALID_RESOURCE', message: 'منبع نامعتبر است.' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای تغییر وضعیت';
    return res.status(500).json({ error: { code: 'STATUS_CHANGE_FAILED', message } });
  }
});

// GET /api/admin/kernel/k01/export
k01Router.get('/export', async (req: Request, res: Response) => {
  try {
    const format = req.query.format === 'csv' ? 'csv' : 'json';
    const store = await K01Repository.getFullStore();

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="didar-k01-export.json"');
      return res.send(JSON.stringify(store, null, 2));
    }

    // CSV format
    let csv = 'Type,ID,Title,Classification,Mobile/Phone,Status,VerificationStatus,CreatedAt\n';
    store.persons.forEach((p) => {
      csv += `"Person","${p.id}","${p.firstName} ${p.lastName}","${p.partyType}","${p.mobile}","${p.status}","${p.verificationStatus}","${p.createdAt}"\n`;
    });
    store.organizations.forEach((o) => {
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

// GET /api/admin/kernel/k01/database/health (and legacy alias /supabase/health)
k01Router.get(['/database/health', '/supabase/health'], async (req: Request, res: Response) => {
  try {
    const health = await checkDatabaseHealth();
    return res.json({ success: true, data: health });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای بررسی سلامت پایگاه‌داده مستقل';
    return res.status(500).json({ error: { code: 'DATABASE_HEALTH_ERROR', message } });
  }
});

// POST /api/admin/kernel/k01/database/backup (and legacy alias /supabase/sync)
k01Router.post(['/database/backup', '/supabase/sync'], async (req: Request, res: Response) => {
  try {
    const result = await createIndependentBackup();
    return res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای پشتیبان‌گیری مستقل در سرور';
    return res.status(500).json({ success: false, message });
  }
});
