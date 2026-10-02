/**
 * Didar Gold Platform - Authentication, Permissions & Scope Enforcement Middleware
 * Ensures all protected administration routes enforce authenticated sessions,
 * server-side derived permissions, and organization-scoped resource boundaries.
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthenticatedUser } from '../services/auth.service.js';

// Extend Express Request interface with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      scopedOrgId?: string;
    }
  }
}

/**
 * Authentication Guard
 * Requires a valid, active session token in Authorization header or x-session-token.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-session-token']) {
      token = String(req.headers['x-session-token']).trim();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'احراز هویت الزامی است. لطفاً وارد حساب کاربری خود شوید.',
        },
      });
    }

    const user = await AuthService.validateToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'نشست کاربری نامعتبر یا منقضی شده است.',
        },
      });
    }

    req.user = user;
    req.scopedOrgId = user.organizationId;
    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای اعتبارسنجی نشست';
    return res.status(500).json({
      success: false,
      error: { code: 'AUTH_INTERNAL_ERROR', message },
    });
  }
}

/**
 * Optional Authentication Guard
 * Attaches user if valid token present, but does not block if unauthenticated.
 */
export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-session-token']) {
      token = String(req.headers['x-session-token']).trim();
    }

    if (token) {
      const user = await AuthService.validateToken(token);
      if (user) {
        req.user = user;
        req.scopedOrgId = user.organizationId;
      }
    }
    next();
  } catch {
    next();
  }
}

/**
 * Server-Side Permission Guard
 * Enforces that user holds at least one of the specified permissions or super-admin role.
 */
export function requirePermission(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'احراز هویت الزامی است.' },
      });
    }

    const user = req.user;

    // Super Admin & Platform Owner bypass specific granular permission checks
    if (
      user.roleKeys.includes('super_admin') ||
      user.roleKeys.includes('DIDAR_SUPER_ADMIN') ||
      user.roleKeys.includes('governance.platform_owner') ||
      user.roleKeys.includes('governance.identity_access_manager')
    ) {
      return next();
    }

    // Check if user holds any of the required permissions
    const hasPermission = requiredPermissions.some((perm) =>
      user.permissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `دسترسی غیرمجاز: شما فاقد مجوز (${requiredPermissions.join(' یا ')}) هستید.`,
          requiredPermissions,
        },
      });
    }

    next();
  };
}

/**
 * Organization Resource Scope Guard
 * Retailers and Suppliers are strictly confined to their own organization's resources.
 * Cross-organization access is rejected with 403 Forbidden.
 * Internal Didar Staff may access across organizations when authorized.
 */
export function requireOrganizationScope(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'احراز هویت الزامی است.' },
    });
  }

  const user = req.user;

  // Didar internal staff have cross-organization operational authority
  if (user.isInternalStaff) {
    // If query specifies target org, use it; otherwise default to staff active org
    const targetOrg = (req.query.organizationId as string) || (req.body?.organizationId as string) || user.organizationId;
    req.scopedOrgId = targetOrg;
    return next();
  }

  // Non-internal parties (Retailers, Suppliers, Agents): Strict isolation
  const targetOrgInParams = req.params.orgId || req.params.organizationId;
  const targetOrgInQuery = req.query.organizationId as string | undefined;
  const targetOrgInBody = req.body?.organizationId as string | undefined;

  const attemptedOrgId = targetOrgInParams || targetOrgInQuery || targetOrgInBody;

  if (attemptedOrgId && attemptedOrgId !== user.organizationId) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN_CROSS_ORG',
        message: 'دسترسی غیرمجاز: دسترسی به منابع سایر سازمان‌ها امکان‌پذیر نیست.',
        authorizedOrganizationId: user.organizationId,
        attemptedOrganizationId: attemptedOrgId,
      },
    });
  }

  // Enforce user's authorized organization
  req.scopedOrgId = user.organizationId;
  next();
}
