import { Router, Request, Response } from 'express';
import { RbacService } from '../storage-rbac.js';
import { k04Storage } from '../storage-k04.js';

export const rbacRouter = Router();

// GET /api/admin/kernel/rbac/roles - List all 70 roles with category/environment filters
rbacRouter.get('/roles', (req: Request, res: Response) => {
  try {
    const { category, targetEnvironment, query } = req.query;
    const roles = RbacService.getRoles({
      category: category as string,
      targetEnvironment: targetEnvironment as string,
      query: query as string
    });

    res.json({
      success: true,
      data: roles,
      total: roles.length
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای بارگذاری کاتالوگ نقش‌ها';
    res.status(500).json({ success: false, error: { message } });
  }
});

// GET /api/admin/kernel/rbac/roles/:roleKey - Single role definition details
rbacRouter.get('/roles/:roleKey', (req: Request, res: Response) => {
  try {
    const { roleKey } = req.params;
    const role = RbacService.getRoleByKey(roleKey);
    if (!role) {
      return res.status(404).json({ success: false, error: { message: `نقش ${roleKey} یافت نشد.` } });
    }
    res.json({ success: true, data: role });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطا در دریافت مشخصات نقش';
    res.status(500).json({ success: false, error: { message } });
  }
});

// GET /api/admin/kernel/rbac/permissions - List all canonical permission definitions
rbacRouter.get('/permissions', (req: Request, res: Response) => {
  try {
    const permissions = RbacService.getPermissions();
    res.json({ success: true, data: permissions, total: permissions.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای بارگذاری مجوزها';
    res.status(500).json({ success: false, error: { message } });
  }
});

// GET /api/admin/kernel/rbac/assignments - List role assignments with filter
rbacRouter.get('/assignments', (req: Request, res: Response) => {
  try {
    const { partyId, organizationId, membershipId } = req.query;
    const assignments = RbacService.getAssignments({
      partyId: partyId as string,
      organizationId: organizationId as string,
      membershipId: membershipId as string
    });
    res.json({ success: true, data: assignments, total: assignments.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای بارگذاری انتساب‌ها';
    res.status(500).json({ success: false, error: { message } });
  }
});

// POST /api/admin/kernel/rbac/assignments/request - Request a role assignment (AT08, AT09, AT11, AT28)
rbacRouter.post('/assignments/request', (req: Request, res: Response) => {
  try {
    const {
      membershipId,
      roleKey,
      scope,
      validFrom,
      validTo,
      reason,
      expectedVersion
    } = req.body;

    const actorPartyId = req.headers['x-actor-party-id']
      ? String(req.headers['x-actor-party-id'])
      : 'party-admin-001';

    const actorRoleKey = req.headers['x-actor-role-key']
      ? String(req.headers['x-actor-role-key'])
      : 'governance.identity_access_manager';

    if (!membershipId || !roleKey || !reason) {
      return res.status(400).json({
        success: false,
        error: { code: 'validation_failed', message: 'عضویت، کلید نقش و دلیل انتساب الزامی است.' }
      });
    }

    const result = RbacService.requestRoleAssignment({
      membershipId,
      roleKey,
      scope,
      validFrom,
      validTo,
      reason,
      expectedVersion,
      actorPartyId,
      actorRoleKey
    });

    if (result.pendingApproval) {
      return res.status(202).json({
        success: true,
        status: 'pending_approval',
        applied: false,
        message: 'درخواست انتصاب نقش حساس ثبت و جهت تصویب مستقل به کارتابل اصل چهارچشم K04 ارجاع گردید.',
        data: result.assignment,
        approvalRequestId: result.approvalRequestId
      });
    }

    res.status(201).json({
      success: true,
      status: 'active',
      applied: true,
      message: 'نقش کاری با موفقیت به عضویت سازمانی انتساب یافت و فعال گردید.',
      data: result.assignment
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطا در درخواست انتساب نقش';
    const isForbidden = message.includes('اختیار واگذاری') || message.includes('مجاز به انتصاب');
    const isValidation = message.includes('محدوده دسترسی') || message.includes('الزامی');

    res.status(isForbidden ? 403 : isValidation ? 400 : 500).json({
      success: false,
      error: {
        code: isForbidden ? 'forbidden' : isValidation ? 'validation_failed' : 'server_error',
        message
      }
    });
  }
});

// POST /api/admin/kernel/rbac/assignments/:id/revoke - Immediate revocation of a role assignment (AT18, AT20)
rbacRouter.post('/assignments/:id/revoke', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const actorPartyId = req.headers['x-actor-party-id']
      ? String(req.headers['x-actor-party-id'])
      : 'party-admin-001';

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: { code: 'validation_failed', message: 'ثبت دلیل لغو انتساب الزامی است.' }
      });
    }

    const revoked = RbacService.revokeRoleAssignment(id, actorPartyId, reason);
    res.json({
      success: true,
      message: 'انتساب نقش با موفقیت ابطال و سوابق آن در زنجیره ممیزی ثبت گردید.',
      data: revoked
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطا در ابطال انتساب نقش';
    res.status(400).json({ success: false, error: { message } });
  }
});

// POST /api/admin/kernel/rbac/effective-access - Evaluate effective permissions in a given WorkContext (K02)
rbacRouter.post('/effective-access', (req: Request, res: Response) => {
  try {
    const { partyId, context } = req.body;
    if (!partyId || !context) {
      return res.status(400).json({
        success: false,
        error: { code: 'validation_failed', message: 'شناسه شخص و ساختار زمینه کاری الزامی است.' }
      });
    }

    const effective = RbacService.evaluateEffectiveAccess(partyId, context);
    res.json({
      success: true,
      data: effective
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطا در محاسبه دسترسی مؤثر';
    res.status(500).json({ success: false, error: { message } });
  }
});

// GET /api/me/workspaces - Discover allowed personal and organizational workspaces
rbacRouter.get('/me/workspaces', (req: Request, res: Response) => {
  try {
    const partyId = req.headers['x-actor-party-id']
      ? String(req.headers['x-actor-party-id'])
      : 'party-admin-001';

    const workspaces = RbacService.getUserAvailableWorkspaces(partyId);
    res.json({
      success: true,
      data: workspaces
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطا در بارگذاری زمینه‌های کاری';
    res.status(500).json({ success: false, error: { message } });
  }
});
