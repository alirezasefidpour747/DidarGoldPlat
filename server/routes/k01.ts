/** K01 PostgreSQL-backed API. Authentication remains intentionally out of scope. */

import { Router, type Request, type Response } from 'express';
import { checkDatabaseHealth } from '../lib/database.js';
import { k01Service, K01ServiceError } from '../services/k01.service.js';

export const k01Router = Router();

function actorName(req: Request): string {
  return req.headers['x-actor-name'] ? String(req.headers['x-actor-name']) : 'مدیر عملیات دیدار';
}

function sendError(res: Response, error: unknown, fallbackCode: string): Response {
  if (error instanceof K01ServiceError) {
    return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  }
  return res.status(503).json({
    error: { code: fallbackCode, message: 'ذخیره‌سازی PostgreSQL در دسترس نیست.' }
  });
}

k01Router.get('/', async (_req, res) => {
  try {
    return res.json({ success: true, data: await k01Service.getPayload() });
  } catch (error) {
    return sendError(res, error, 'K01_FETCH_FAILED');
  }
});

k01Router.post('/', async (req, res) => {
  try {
    const { resource, ...payload } = req.body ?? {};
    if (!resource) {
      return res.status(400).json({
        error: { code: 'INVALID_RESOURCE', message: 'تعیین فیلد resource (person, organization, membership, document) الزامی است.' }
      });
    }
    if (resource === 'person') return res.status(201).json({ success: true, data: await k01Service.createPerson(payload, actorName(req)) });
    if (resource === 'organization') return res.status(201).json({ success: true, data: await k01Service.createOrganization(payload, actorName(req)) });
    if (resource === 'membership') return res.status(201).json({ success: true, data: await k01Service.createMembership(payload, actorName(req)) });
    if (resource === 'document') return res.status(201).json({ success: true, data: await k01Service.createDocument(payload, actorName(req)) });
    return res.status(400).json({ error: { code: 'UNKNOWN_RESOURCE', message: `منبع ${resource} معتبر نیست.` } });
  } catch (error) {
    return sendError(res, error, 'K01_CREATION_FAILED');
  }
});

k01Router.patch('/:resource/:id', async (req, res) => {
  try {
    const { resource, id } = req.params;
    if (resource === 'person' || resource === 'persons') {
      return res.json({ success: true, data: await k01Service.updatePerson(id, req.body, actorName(req)) });
    }
    if (resource === 'organization' || resource === 'organizations') {
      return res.json({ success: true, data: await k01Service.updateOrganization(id, req.body, actorName(req)) });
    }
    if (resource === 'membership' || resource === 'memberships') {
      return res.json({ success: true, data: await k01Service.updateMembership(id, req.body) });
    }
    if (resource === 'document' || resource === 'documents') {
      return res.json({ success: true, data: await k01Service.updateDocument(id, req.body) });
    }
    return res.status(400).json({ error: { code: 'INVALID_RESOURCE', message: 'منبع نامعتبر است.' } });
  } catch (error) {
    return sendError(res, error, 'K01_UPDATE_FAILED');
  }
});

k01Router.post('/:resource/:id/status', async (req, res) => {
  try {
    const data = await k01Service.changeStatus(req.params.resource, req.params.id, req.body ?? {}, actorName(req));
    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error, 'STATUS_CHANGE_FAILED');
  }
});

k01Router.get('/export', async (req, res) => {
  try {
    const store = await k01Service.getPayload();
    if (req.query.format !== 'csv') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="didar-k01-export.json"');
      return res.send(JSON.stringify(store, null, 2));
    }
    let csv = 'Type,ID,Title,Classification,Mobile/Phone,Status,VerificationStatus,CreatedAt\n';
    for (const person of store.persons) {
      csv += `"Person","${person.id}","${person.firstName} ${person.lastName}","${person.partyType}","${person.mobile}","${person.status}","${person.verificationStatus}","${person.createdAt}"\n`;
    }
    for (const organization of store.organizations) {
      csv += `"Organization","${organization.id}","${organization.displayName}","${organization.organizationType}","${organization.phone}","${organization.status}","${organization.verificationStatus}","${organization.createdAt}"\n`;
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="didar-k01-export.csv"');
    return res.send('\uFEFF' + csv);
  } catch (error) {
    return sendError(res, error, 'EXPORT_FAILED');
  }
});

k01Router.get(['/database/health', '/supabase/health'], async (_req, res) => {
  const health = await checkDatabaseHealth();
  return res.status(health.ready ? 200 : 503).json({ success: health.ready, data: health });
});

k01Router.post(['/database/backup', '/supabase/sync'], (_req, res) =>
  res.status(501).json({
    success: false,
    message: 'Application-level JSON backup is disabled. Use PostgreSQL backup/restore procedures.'
  })
);
