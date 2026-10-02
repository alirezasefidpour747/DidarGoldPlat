/**
 * Didar Gold Platform - Authentication & Session Management Router
 * Provides RESTful API endpoints for Login, Initial Admin Provisioning,
 * OTP verification, Session Inspection, WorkContext switching, and Logout.
 */

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { RbacService } from '../storage-rbac.js';

export const authRouter = Router();

// GET /api/auth/status - Check if initial administrator has been provisioned
authRouter.get('/status', async (req: Request, res: Response) => {
  try {
    const isProvisioned = await AuthService.isAdministratorProvisioned();
    res.json({
      success: true,
      data: {
        isProvisioned,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای بررسی وضعیت پیکربندی مدیر';
    res.status(500).json({ success: false, error: { message } });
  }
});

// POST /api/auth/setup-admin - Explicit initial administrator provisioning
authRouter.post('/setup-admin', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, mobile, nationalId, email, password, organizationName } = req.body;

    const result = await AuthService.provisionInitialAdministrator({
      firstName,
      lastName,
      mobile,
      nationalId,
      email,
      password,
      organizationName,
    });

    res.status(201).json({
      success: true,
      message: 'حساب کاربری مدیر ارشد سامانه با موفقیت راه‌اندازی و فعال گردید.',
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای راه‌اندازی اولیه مدیر ارشد';
    const isConflict = message.includes('ADMIN_ALREADY_PROVISIONED');
    const isValidation = message.includes('الزامی') || message.includes('حداقل');

    res.status(isConflict ? 409 : isValidation ? 400 : 500).json({
      success: false,
      error: {
        code: isConflict ? 'ADMIN_ALREADY_PROVISIONED' : isValidation ? 'VALIDATION_FAILED' : 'SETUP_FAILED',
        message,
      },
    });
  }
});

// POST /api/auth/login - Authenticate with mobile/nationalId and password or OTP
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password, otp, organizationId } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

    const result = await AuthService.login({
      identifier,
      password,
      otp,
      organizationId,
      userAgent,
      ipAddress,
    });

    res.json({
      success: true,
      message: 'ورود به سامانه با موفقیت انجام شد.',
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای احراز هویت';
    const isInvalidCreds = message.includes('INVALID_CREDENTIALS') || message.includes('INVALID_OTP');
    const isLocked = message.includes('ACCOUNT_LOCKED');
    const isInactive = message.includes('ACCOUNT_INACTIVE');
    const isForbiddenOrg = message.includes('FORBIDDEN_ORG');

    const status = isLocked ? 423 : isForbiddenOrg ? 403 : isInvalidCreds ? 401 : 400;

    res.status(status).json({
      success: false,
      error: {
        code: isLocked
          ? 'ACCOUNT_LOCKED'
          : isForbiddenOrg
          ? 'FORBIDDEN_ORG'
          : isInvalidCreds
          ? 'INVALID_CREDENTIALS'
          : 'LOGIN_FAILED',
        message,
      },
    });
  }
});

// POST /api/auth/otp/request - Request one-time SMS verification code
authRouter.post('/otp/request', async (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'شماره موبایل الزامی است.' },
      });
    }

    const result = await AuthService.requestOtp(mobile);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای ارسال کد تایید';
    res.status(400).json({ success: false, error: { message } });
  }
});

// POST /api/auth/otp/verify - Verify one-time SMS code and login
authRouter.post('/otp/verify', async (req: Request, res: Response) => {
  try {
    const { mobile, code, organizationId } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

    const result = await AuthService.login({
      identifier: mobile,
      otp: code,
      organizationId,
      userAgent,
      ipAddress,
    });

    res.json({
      success: true,
      message: 'ورود با کد یکبارمصرف با موفقیت انجام شد.',
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای اعتبارسنجی کد یکبارمصرف';
    res.status(401).json({ success: false, error: { message } });
  }
});

// GET /api/auth/session (or /api/auth/me) - Retrieve current authenticated session
authRouter.get(['/session', '/me'], authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const workspaces = RbacService.getUserAvailableWorkspaces(user.partyId);

    res.json({
      success: true,
      data: {
        partyId: user.partyId,
        personName: `${user.person.firstName} ${user.person.lastName}`,
        mobile: user.person.mobile,
        email: user.person.email,
        partyType: user.person.partyType,
        organizationId: user.organizationId,
        organizationName: user.organizationName,
        organizationType: user.organizationType,
        isInternalStaff: user.isInternalStaff,
        roleKeys: user.roleKeys,
        permissions: user.permissions,
        memberships: user.memberships,
        sessionId: user.sessionId,
        workspaces,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطا در واکشی مشخصات نشست';
    res.status(500).json({ success: false, error: { message } });
  }
});

// POST /api/auth/switch-organization - Switch active workspace/organization context
authRouter.post('/switch-organization', authenticate, async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.body;
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'شناسه سازمان الزامی است.' },
      });
    }

    const user = req.user!;
    const result = await AuthService.switchOrganization(user.sessionId, organizationId);

    res.json({
      success: true,
      message: 'زمینه کاری سازمان با موفقیت تغییر یافت.',
      data: result.session,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای تغییر سازمان زمینه کاری';
    const isForbidden = message.includes('FORBIDDEN_ORG');
    res.status(isForbidden ? 403 : 400).json({ success: false, error: { message } });
  }
});

// POST /api/auth/logout - Revoke active session
authRouter.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    await AuthService.logout(user.sessionId);

    res.json({
      success: true,
      message: 'خروج از سامانه با موفقیت انجام شد.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای خروج از سامانه';
    res.status(500).json({ success: false, error: { message } });
  }
});
