/**
 * Didar Gold Platform - Domain Authentication & Session Security Service
 * Implements server-side identity derivation, cryptographic sessions,
 * permission mapping, and initial administrator provisioning.
 */

import crypto from 'crypto';
import { eq, and, gt, sql, inArray } from 'drizzle-orm';
import { getDatabase } from '../db/index.js';
import {
  k01Persons,
  k01Organizations,
  k01Memberships,
  k01AuditLogs,
  rbacRoles,
  rbacRolePermissions,
  rbacAssignments,
  authSessions,
  authCredentials,
  authOtpCodes,
} from '../db/schema.js';
import { PersonParty, OrganizationParty, Membership } from '../../src/types/k01.js';

export interface AuthenticatedUser {
  partyId: string;
  person: PersonParty;
  organizationId: string;
  organizationName: string;
  organizationType: string;
  isInternalStaff: boolean;
  roleKeys: string[];
  permissions: string[];
  memberships: Membership[];
  sessionId: string;
}

export interface LoginResult {
  token: string;
  session: {
    id: string;
    partyId: string;
    personName: string;
    mobile: string;
    organizationId: string;
    organizationName: string;
    organizationType: string;
    roleKeys: string[];
    permissions: string[];
    expiresAt: string;
  };
}

export class AuthService {
  /**
   * Password hashing using cryptographic scrypt algorithm
   */
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const s = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, s, 64).toString('hex');
    return { hash, salt: s };
  }

  /**
   * Timing-safe password verification
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const bufA = Buffer.from(computedHash, 'hex');
    const bufB = Buffer.from(hash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Hash a session token using SHA-256 for secure lookup
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Check whether an administrator account has already been provisioned
   */
  static async isAdministratorProvisioned(): Promise<boolean> {
    const db = (await getDatabase()) as any;
    const creds = await db.select().from(authCredentials);
    if (creds.length === 0) return false;

    // Check if any credential belongs to an internal user or admin role assignment
    const adminAssignments = await db
      .select()
      .from(rbacAssignments)
      .where(
        and(
          inArray(rbacAssignments.roleKey, [
            'governance.identity_access_manager',
            'governance.platform_owner',
            'governance.security_officer',
            'super_admin',
          ]),
          eq(rbacAssignments.status, 'active')
        )
      );

    const adminPartyIds = new Set(adminAssignments.map((a: any) => a.partyId));

    // Also check for persons with partyType === 'internal_user'
    const internalPersons = await db
      .select()
      .from(k01Persons)
      .where(eq(k01Persons.partyType, 'internal_user'));

    for (const p of internalPersons) {
      adminPartyIds.add(p.id);
    }

    for (const c of creds) {
      if (adminPartyIds.has(c.partyId) && c.status === 'active') {
        return true;
      }
    }

    return false;
  }

  /**
   * Explicit Initial Administrator Provisioning Procedure
   * Does NOT use hardcoded credentials or automatic demo accounts.
   */
  static async provisionInitialAdministrator(params: {
    firstName: string;
    lastName: string;
    mobile: string;
    nationalId?: string;
    email?: string;
    password: string;
    organizationName?: string;
  }): Promise<LoginResult> {
    const alreadyProvisioned = await this.isAdministratorProvisioned();
    if (alreadyProvisioned) {
      throw new Error('ADMIN_ALREADY_PROVISIONED: حساب کاربری مدیر ارشد قبلاً در سیستم مقداردهی شده است.');
    }

    if (!params.password || params.password.length < 8) {
      throw new Error('رمز عبور باید حداقل ۸ کاراکتر باشد.');
    }

    if (!params.mobile || !params.firstName || !params.lastName) {
      throw new Error('نام، نام خانوادگی و شماره موبایل الزامی است.');
    }

    const db = (await getDatabase()) as any;

    // Find or create admin person
    let person: any = null;
    const existingPersons = await db
      .select()
      .from(k01Persons)
      .where(eq(k01Persons.mobile, params.mobile));

    if (existingPersons.length > 0) {
      person = existingPersons[0];
      await db
        .update(k01Persons)
        .set({
          partyType: 'internal_user',
          firstName: params.firstName,
          lastName: params.lastName,
          status: 'active',
          verificationStatus: 'verified',
          updatedAt: new Date(),
        })
        .where(eq(k01Persons.id, person.id));
    } else {
      const personId = `party-admin-${Date.now()}`;
      await db.insert(k01Persons).values({
        id: personId,
        partyType: 'internal_user',
        firstName: params.firstName,
        lastName: params.lastName,
        mobile: params.mobile,
        nationalId: params.nationalId || null,
        email: params.email || null,
        status: 'active',
        verificationStatus: 'verified',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      person = { id: personId, firstName: params.firstName, lastName: params.lastName, mobile: params.mobile };
    }

    // Find or create Root Didar Platform Organization
    let rootOrg: any = null;
    const existingOrgs = await db
      .select()
      .from(k01Organizations)
      .where(eq(k01Organizations.id, 'org-didar-core-001'));

    if (existingOrgs.length > 0) {
      rootOrg = existingOrgs[0];
    } else {
      const orgId = 'org-didar-core-001';
      const legalName = params.organizationName || 'هسته مرکزی پلتفرم دیدار';
      await db.insert(k01Organizations).values({
        id: orgId,
        legalName,
        displayName: legalName,
        organizationType: 'didar',
        phone: params.mobile,
        email: params.email || null,
        status: 'active',
        verificationStatus: 'verified',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      rootOrg = { id: orgId, legalName, displayName: legalName, organizationType: 'didar' };
    }

    // Link Membership
    const existingMems = await db
      .select()
      .from(k01Memberships)
      .where(
        and(
          eq(k01Memberships.partyId, person.id),
          eq(k01Memberships.organizationId, rootOrg.id)
        )
      );

    let membershipId = '';
    if (existingMems.length > 0) {
      membershipId = existingMems[0].id;
    } else {
      membershipId = `mem-admin-${Date.now()}`;
      await db.insert(k01Memberships).values({
        id: membershipId,
        partyId: person.id,
        organizationId: rootOrg.id,
        roleKey: 'governance.identity_access_manager',
        title: 'مدیر ارشد سامانه و امنیت',
        isPrimary: true,
        status: 'active',
        validFrom: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Ensure canonical RBAC roles exist in database
    const { importRbacData } = await import('../db/import.js');
    await importRbacData().catch((e) => console.warn('[AuthService] RBAC import notice:', e.message));

    // Assign Governance Role
    const roleKey = 'governance.identity_access_manager';
    const assignId = `assign-admin-root-${Date.now()}`;
    await db
      .insert(rbacAssignments)
      .values({
        id: assignId,
        membershipId,
        partyId: person.id,
        organizationId: rootOrg.id,
        roleKey,
        scopeType: 'global',
        scopeIds: ['*'],
        scopeLabelFa: 'سراسر پلتفرم دیدار',
        validFrom: new Date().toISOString().split('T')[0],
        reason: 'تنظیم و راه‌اندازی اولیه مدیر ارشد سامانه',
        status: 'active',
        version: 1,
        assignedByPartyId: person.id,
        assignedAt: new Date(),
      })
      .onConflictDoNothing();

    // Store Hashed Credentials
    const { hash, salt } = this.hashPassword(params.password);
    await db
      .insert(authCredentials)
      .values({
        partyId: person.id,
        passwordHash: hash,
        salt,
        status: 'active',
        failedAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: authCredentials.partyId,
        set: {
          passwordHash: hash,
          salt,
          status: 'active',
          failedAttempts: 0,
          lockedUntil: null,
          updatedAt: new Date(),
        },
      });

    // Record Immutable Audit Log
    await db.insert(k01AuditLogs).values({
      id: `audit-admin-init-${Date.now()}`,
      actorId: person.id,
      actorName: `${params.firstName} ${params.lastName}`,
      action: 'INITIAL_ADMIN_PROVISIONED',
      targetType: 'auth_credentials',
      targetId: person.id,
      targetName: 'حساب مدیر ارشد',
      description: `مقداردهی اولیه امن حساب مدیر ارشد با شماره ${params.mobile}`,
      changes: { mobile: params.mobile, organizationId: rootOrg.id, roleKey },
      timestamp: new Date(),
    });

    // Issue Session
    return this.createSession(person.id, rootOrg.id);
  }

  /**
   * Login with Identifier (Mobile / National ID / Party ID) and Password or OTP
   */
  static async login(params: {
    identifier: string;
    password?: string;
    otp?: string;
    organizationId?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<LoginResult> {
    const { identifier, password, otp, organizationId, userAgent, ipAddress } = params;

    if (!identifier) {
      throw new Error('شناسه کاربری (شماره موبایل یا کدملی) الزامی است.');
    }

    if (!password && !otp) {
      throw new Error('رمز عبور یا کد یکبارمصرف الزامی است.');
    }

    const db = (await getDatabase()) as any;

    // Find person
    const persons = await db
      .select()
      .from(k01Persons)
      .where(
        sql`${k01Persons.mobile} = ${identifier} OR ${k01Persons.nationalId} = ${identifier} OR ${k01Persons.id} = ${identifier} OR ${k01Persons.email} = ${identifier}`
      );

    if (persons.length === 0) {
      throw new Error('INVALID_CREDENTIALS: نام کاربری یا رمز عبور اشتباه است.');
    }

    const person = persons[0];

    if (person.status !== 'active') {
      throw new Error('ACCOUNT_INACTIVE: حساب کاربری شما غیرفعال یا معلق است.');
    }

    // Verify Password
    if (password) {
      const creds = await db
        .select()
        .from(authCredentials)
        .where(eq(authCredentials.partyId, person.id));

      if (creds.length === 0) {
        throw new Error('INVALID_CREDENTIALS: اعتبارنامه ورود برای این کاربر ثبت نشده است.');
      }

      const cred = creds[0];

      if (cred.lockedUntil && new Date(cred.lockedUntil) > new Date()) {
        const remainingMinutes = Math.ceil((new Date(cred.lockedUntil).getTime() - Date.now()) / 60000);
        throw new Error(`ACCOUNT_LOCKED: حساب کاربری به دلیل تلاش‌های ناموفق مکرر تا ${remainingMinutes} دقیقه دیگر قفل است.`);
      }

      const isValid = this.verifyPassword(password, cred.passwordHash, cred.salt);
      if (!isValid) {
        const newFailed = (cred.failedAttempts || 0) + 1;
        let lockedUntil = null;
        if (newFailed >= 5) {
          lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock 15 mins
        }
        await db
          .update(authCredentials)
          .set({ failedAttempts: newFailed, lockedUntil, updatedAt: new Date() })
          .where(eq(authCredentials.partyId, person.id));

        throw new Error('INVALID_CREDENTIALS: نام کاربری یا رمز عبور اشتباه است.');
      }

      // Reset failed attempts on success
      await db
        .update(authCredentials)
        .set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date(), updatedAt: new Date() })
        .where(eq(authCredentials.partyId, person.id));
    } else if (otp) {
      // Verify OTP
      const otpCodeHash = crypto.createHash('sha256').update(otp).digest('hex');
      const otps = await db
        .select()
        .from(authOtpCodes)
        .where(
          and(
            eq(authOtpCodes.mobile, person.mobile),
            eq(authOtpCodes.codeHash, otpCodeHash),
            eq(authOtpCodes.consumed, false),
            gt(authOtpCodes.expiresAt, new Date())
          )
        );

      if (otps.length === 0) {
        throw new Error('INVALID_OTP: کد یکبارمصرف نامعتبر یا منقضی شده است.');
      }

      // Mark OTP consumed
      await db
        .update(authOtpCodes)
        .set({ consumed: true })
        .where(eq(authOtpCodes.id, otps[0].id));
    }

    // Resolve Active Organization
    const activeOrgId = await this.resolveTargetOrganization(person.id, organizationId);

    // Create session
    return this.createSession(person.id, activeOrgId, userAgent, ipAddress);
  }

  /**
   * Request OTP code for a mobile number
   */
  static async requestOtp(mobile: string): Promise<{ success: boolean; message: string; debugCode?: string }> {
    const db = (await getDatabase()) as any;
    const persons = await db.select().from(k01Persons).where(eq(k01Persons.mobile, mobile));
    if (persons.length === 0) {
      throw new Error('کاربری با این شماره موبایل در سیستم یافت نشد.');
    }

    // Generate 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const otpId = `otp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(authOtpCodes).values({
      id: otpId,
      mobile,
      codeHash,
      expiresAt,
      attempts: 0,
      consumed: false,
      createdAt: new Date(),
    });

    console.log(`[AUTH OTP] Code generated for ${mobile}: ${code} (Expires in 5m)`);

    const isDevelopment = process.env.NODE_ENV !== 'production';
    return {
      success: true,
      message: 'کد تایید یکبارمصرف پیامک شد.',
      debugCode: isDevelopment ? code : undefined,
    };
  }

  /**
   * Validate a session bearer token and derive complete authenticated user context
   */
  static async validateToken(token: string): Promise<AuthenticatedUser | null> {
    if (!token) return null;

    const tokenHash = this.hashToken(token);
    const db = (await getDatabase()) as any;

    const sessions = await db
      .select()
      .from(authSessions)
      .where(
        and(
          eq(authSessions.tokenHash, tokenHash),
          sql`${authSessions.revokedAt} IS NULL`,
          gt(authSessions.expiresAt, new Date())
        )
      );

    if (sessions.length === 0) return null;

    const sess = sessions[0];

    // Update lastActiveAt
    await db
      .update(authSessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(authSessions.id, sess.id));

    // Load Person
    const persons = await db.select().from(k01Persons).where(eq(k01Persons.id, sess.partyId));
    if (persons.length === 0 || persons[0].status !== 'active') return null;
    const person = persons[0];

    // Load active Organization
    const orgs = await db.select().from(k01Organizations).where(eq(k01Organizations.id, sess.organizationId));
    const activeOrg = orgs.length > 0 ? orgs[0] : { id: sess.organizationId, displayName: 'سازمان', organizationType: 'other' };

    // Load Memberships
    const memberships = await db
      .select()
      .from(k01Memberships)
      .where(and(eq(k01Memberships.partyId, person.id), eq(k01Memberships.status, 'active')));

    // Re-derive permissions dynamically from PostgreSQL
    const { roleKeys, permissions } = await this.deriveRolesAndPermissions(person.id, sess.organizationId);

    const isInternalStaff =
      person.partyType === 'internal_user' ||
      roleKeys.some(
        (r) =>
          r.startsWith('governance.') ||
          r.startsWith('ops.') ||
          r.startsWith('audit.') ||
          r === 'super_admin' ||
          r === 'internal_user'
      ) ||
      activeOrg.organizationType === 'didar' ||
      activeOrg.organizationType === 'platform_operator';

    return {
      partyId: person.id,
      person,
      organizationId: sess.organizationId,
      organizationName: activeOrg.displayName || activeOrg.legalName || 'سازمان',
      organizationType: activeOrg.organizationType,
      isInternalStaff,
      roleKeys,
      permissions,
      memberships,
      sessionId: sess.id,
    };
  }

  /**
   * Switch session organization context (WorkContext Switcher)
   */
  static async switchOrganization(sessionId: string, newOrgId: string): Promise<LoginResult> {
    const db = (await getDatabase()) as any;
    const sessions = await db.select().from(authSessions).where(eq(authSessions.id, sessionId));
    if (sessions.length === 0) {
      throw new Error('نشست یافت نشد.');
    }
    const sess = sessions[0];

    // Verify person is allowed in newOrgId
    const validatedOrgId = await this.resolveTargetOrganization(sess.partyId, newOrgId);

    // Derive new roles and permissions for target organization
    const { roleKeys, permissions } = await this.deriveRolesAndPermissions(sess.partyId, validatedOrgId);

    await db
      .update(authSessions)
      .set({
        organizationId: validatedOrgId,
        roleKeys,
        permissions,
        lastActiveAt: new Date(),
      })
      .where(eq(authSessions.id, sessionId));

    const orgs = await db.select().from(k01Organizations).where(eq(k01Organizations.id, validatedOrgId));
    const org = orgs[0];
    const persons = await db.select().from(k01Persons).where(eq(k01Persons.id, sess.partyId));
    const person = persons[0];

    return {
      token: '', // Existing token remains valid
      session: {
        id: sessionId,
        partyId: sess.partyId,
        personName: `${person.firstName} ${person.lastName}`,
        mobile: person.mobile,
        organizationId: validatedOrgId,
        organizationName: org?.displayName || org?.legalName || validatedOrgId,
        organizationType: org?.organizationType || 'other',
        roleKeys,
        permissions,
        expiresAt: sess.expiresAt instanceof Date ? sess.expiresAt.toISOString() : String(sess.expiresAt),
      },
    };
  }

  /**
   * Revoke session (Logout)
   */
  static async logout(sessionId: string): Promise<void> {
    const db = (await getDatabase()) as any;
    await db
      .update(authSessions)
      .set({ revokedAt: new Date() })
      .where(eq(authSessions.id, sessionId));
  }

  // ==================== INTERNAL HELPERS ====================

  private static async resolveTargetOrganization(partyId: string, requestedOrgId?: string): Promise<string> {
    const db = (await getDatabase()) as any;

    const persons = await db.select().from(k01Persons).where(eq(k01Persons.id, partyId));
    const isInternalUser = persons.length > 0 && persons[0].partyType === 'internal_user';

    const memberships = await db
      .select()
      .from(k01Memberships)
      .where(and(eq(k01Memberships.partyId, partyId), eq(k01Memberships.status, 'active')));

    if (memberships.length === 0 && !isInternalUser) {
      throw new Error('NO_ORGANIZATION: شما عضو هیچ سازمان فعالی نیستید.');
    }

    if (requestedOrgId) {
      const isMember = memberships.some((m: any) => m.organizationId === requestedOrgId);
      if (isMember || isInternalUser) {
        return requestedOrgId;
      }
      throw new Error('FORBIDDEN_ORG: شما عضویت فعالی در سازمان درخواستی ندارید.');
    }

    // Default: Primary membership or first active membership
    const primary = memberships.find((m: any) => m.isPrimary);
    if (primary) return primary.organizationId;
    if (memberships.length > 0) return memberships[0].organizationId;

    return 'org-didar-core-001';
  }

  private static async deriveRolesAndPermissions(
    partyId: string,
    organizationId: string
  ): Promise<{ roleKeys: string[]; permissions: string[] }> {
    const db = (await getDatabase()) as any;

    // Fetch active assignments for this person in this organization or global scope
    const assignments = await db
      .select()
      .from(rbacAssignments)
      .where(
        and(
          eq(rbacAssignments.partyId, partyId),
          sql`(${rbacAssignments.organizationId} = ${organizationId} OR ${rbacAssignments.scopeType} = 'global')`,
          eq(rbacAssignments.status, 'active')
        )
      );

    const roleKeys = Array.from(new Set(assignments.map((a: any) => a.roleKey))) as string[];

    // If person has memberships, also fallback to membership roleKey if no assignments exist
    if (roleKeys.length === 0) {
      const mems = await db
        .select()
        .from(k01Memberships)
        .where(
          and(
            eq(k01Memberships.partyId, partyId),
            eq(k01Memberships.organizationId, organizationId),
            eq(k01Memberships.status, 'active')
          )
        );
      if (mems.length > 0 && mems[0].roleKey) {
        roleKeys.push(mems[0].roleKey);
      }
    }

    // If still empty and internal user: default to basic viewer
    if (roleKeys.length === 0) {
      roleKeys.push('viewer');
    }

    // Fetch permissions for these roles
    let permissions: string[] = [];
    if (roleKeys.length > 0) {
      const rolePerms = await db
        .select()
        .from(rbacRolePermissions)
        .where(inArray(rbacRolePermissions.roleKey, roleKeys));

      const permKeys = rolePerms.map((rp: any) => rp.permissionKey);
      permissions = Array.from(new Set(permKeys));
    }

    return { roleKeys, permissions };
  }

  private static async createSession(
    partyId: string,
    organizationId: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<LoginResult> {
    const db = (await getDatabase()) as any;

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    const { roleKeys, permissions } = await this.deriveRolesAndPermissions(partyId, organizationId);

    await db.insert(authSessions).values({
      id: sessionId,
      tokenHash,
      partyId,
      organizationId,
      roleKeys,
      permissions,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      expiresAt,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    });

    const persons = await db.select().from(k01Persons).where(eq(k01Persons.id, partyId));
    const person = persons[0];

    const orgs = await db.select().from(k01Organizations).where(eq(k01Organizations.id, organizationId));
    const org = orgs[0] || { displayName: organizationId, organizationType: 'other' };

    return {
      token,
      session: {
        id: sessionId,
        partyId,
        personName: `${person.firstName} ${person.lastName}`,
        mobile: person.mobile,
        organizationId,
        organizationName: org.displayName || org.legalName || organizationId,
        organizationType: org.organizationType || 'other',
        roleKeys,
        permissions,
        expiresAt: expiresAt.toISOString(),
      },
    };
  }
}
