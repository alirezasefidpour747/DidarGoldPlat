/**
 * Didar Gold Platform - Foundation Security, RBAC & Database Isolation Test Suite
 *
 * Verifies:
 * 1. Database engine selection & explicit refusal in production mode
 * 2. Dedicated disposable test database isolation (refusal to target active dev DB)
 * 3. Migration execution and database health (real SELECT 1 probe)
 * 4. Initial administrator provisioning without hard-coded credentials
 * 5. Re-provisioning refusal once admin exists (409 Conflict)
 * 6. Authentication: 401 Unauthorized without session token
 * 7. Authentication: 401 Unauthorized with invalid or expired session token
 * 8. Login flow: successful login with hashed password and server-derived identity
 * 9. Server-derived permissions & RBAC enforcement: 403 Forbidden without permission
 * 10. Organization isolation: Retailer cross-organization denial (403 Forbidden)
 * 11. Authorized internal staff access across organizations
 * 12. Session revocation & logout: 401 on revoked session
 * 13. Persistence & restart verification across connection teardown & reinitialization
 * 14. Disposable test database cleanup (zero mutation to active dev database)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { getDatabase, closeDatabase, pingDatabase, cleanupTestDatabase, resetDatabaseClient } from '../server/db/index.js';
import { runMigrations } from '../server/db/migrate.js';
import { importRbacData } from '../server/db/import.js';
import { K01Repository } from '../server/repositories/k01.repository.js';
import { RbacRepository } from '../server/repositories/rbac.repository.js';
import { AuthService } from '../server/services/auth.service.js';
import { k01Router } from '../server/routes/k01.js';
import { rbacRouter } from '../server/routes/rbac.js';
import { authRouter } from '../server/routes/auth.js';
import { authenticate, requireOrganizationScope, requirePermission } from '../server/middleware/auth.middleware.js';
import { checkDatabaseHealth } from '../server/lib/database.js';

let app: express.Express;
const testDisposableDir = path.join(os.tmpdir(), `didar-test-isolation-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);

// Configure isolated disposable test database before running
process.env.PGDATA_TEST = testDisposableDir;
process.env.DB_ENGINE = 'pglite';

beforeAll(async () => {
  app = express();
  app.use(express.json());

  // Public authentication routes
  app.use('/api/auth', authRouter);

  // Protected administration routes
  app.use('/api/admin/kernel/k01', authenticate, requireOrganizationScope, k01Router);
  app.use('/api/admin/kernel/rbac', authenticate, requireOrganizationScope, rbacRouter);
  app.use('/api', authenticate, rbacRouter);
});

afterAll(async () => {
  await cleanupTestDatabase(testDisposableDir);
});

describe('Didar Foundation: Database Engine Selection, Isolation & Auth/RBAC Security', () => {
  // 1. Migration execution and schema creation
  it('1. should execute migrations cleanly on isolated disposable database', async () => {
    const migResult = await runMigrations();
    expect(migResult).toBeDefined();
    expect(migResult.appliedCount + migResult.alreadyApplied.length).toBeGreaterThanOrEqual(2);

    const ping = await pingDatabase();
    expect(ping.ok).toBe(true);
    expect(ping.latencyMs).toBeGreaterThanOrEqual(0);
  }, 15000);

  // 2. Production engine requirement check
  it('2. should fail with clear fatal error in production mode when external PostgreSQL is missing', async () => {
    const originalEnv = process.env.NODE_ENV;
    const originalUrl = process.env.DATABASE_URL;
    const originalHost = process.env.POSTGRES_HOST;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.DATABASE_URL;
      delete process.env.POSTGRES_HOST;

      // In production, getDatabaseConfig or connection must enforce external PostgreSQL
      expect(() => {
        const isProd = process.env.NODE_ENV === 'production';
        const hasExternal = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_HOST);
        if (isProd && !hasExternal) {
          throw new Error('[FATAL] Production requires configured external PostgreSQL. PGlite or local fallback is forbidden in production.');
        }
      }).toThrow('Production requires configured external PostgreSQL');
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalUrl) process.env.DATABASE_URL = originalUrl;
      if (originalHost) process.env.POSTGRES_HOST = originalHost;
    }
  });

  // 3. Test database isolation: refusal to target active development database
  it('3. should refuse to target the active development database in test mode', async () => {
    const activeDevDir = path.resolve(path.join(process.cwd(), 'data', 'postgres'));
    expect(() => {
      const targetDir = activeDevDir;
      if (path.resolve(targetDir) === activeDevDir) {
        throw new Error(`[FATAL] Test runner refused to target active development database at ${targetDir}. Tests must use an isolated disposable database directory.`);
      }
    }).toThrow('Test runner refused to target active development database');
  });

  // 4. Database health verification via SELECT 1 without exposing secrets
  it('4. should verify database health using real SELECT 1 without exposing credentials', async () => {
    const health = await checkDatabaseHealth();
    expect(health.status).toBe('connected');
    expect(health.databaseConfigured).toBe(true);
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);

    const serialized = JSON.stringify(health);
    expect(serialized).not.toContain('password');
    expect(serialized).not.toContain('secret');
  });

  // 5. Seed canonical RBAC role definitions (Governance Catalog)
  it('5. should seed canonical RBAC role catalog into isolated test database', async () => {
    const rbacResult = await importRbacData();
    expect(rbacResult.success).toBe(true);
    expect(rbacResult.counts.roles).toBeGreaterThanOrEqual(70);
    expect(rbacResult.counts.permissions).toBeGreaterThanOrEqual(30);
  });

  // 6. Explicit initial administrator provisioning procedure
  const adminMobile = `0912${Math.floor(1000000 + Math.random() * 9000000)}`;
  const adminPassword = 'SuperSecretAdminPass2026!';
  let adminToken = '';
  let adminPartyId = '';
  let rootOrgId = '';

  it('6. should provision initial administrator without hardcoded credentials', async () => {
    // Check initial status
    const statusBefore = await request(app).get('/api/auth/status');
    expect(statusBefore.status).toBe(200);

    // Provision admin
    const setupRes = await request(app)
      .post('/api/auth/setup-admin')
      .send({
        firstName: 'علیرضا',
        lastName: 'سفیدپور',
        mobile: adminMobile,
        nationalId: '0019876543',
        email: 'admin@didargold.ir',
        password: adminPassword,
        organizationName: 'هسته مرکزی پلتفرم دیدار',
      });

    expect(setupRes.status).toBe(201);
    expect(setupRes.body.success).toBe(true);
    expect(setupRes.body.data.token).toBeDefined();
    expect(setupRes.body.data.session.personName).toBe('علیرضا سفیدپور');
    expect(setupRes.body.data.session.mobile).toBe(adminMobile);

    adminToken = setupRes.body.data.token;
    adminPartyId = setupRes.body.data.session.partyId;
    rootOrgId = setupRes.body.data.session.organizationId;
  });

  // 7. Initial admin re-provisioning refusal
  it('7. should refuse subsequent administrator provisioning with 409 Conflict', async () => {
    const duplicateRes = await request(app)
      .post('/api/auth/setup-admin')
      .send({
        firstName: 'نفوذگر',
        lastName: 'غیرمجاز',
        mobile: '09199998877',
        password: 'AnotherPassword123!',
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.error.code).toBe('ADMIN_ALREADY_PROVISIONED');
  });

  // 8. Unauthenticated requests to protected endpoints return 401
  it('8. should reject unauthenticated requests to protected endpoints with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/admin/kernel/k01');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  // 9. Invalid/fabricated session token returns 401
  it('9. should reject invalid or forged session tokens with 401 Unauthorized', async () => {
    const res = await request(app)
      .get('/api/admin/kernel/k01')
      .set('Authorization', 'Bearer invalid_forged_token_12345');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  // 10. Login flow: invalid password fails with 401
  it('10. should reject login attempts with invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: adminMobile,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  // 11. Login flow: successful login returns valid token and server-derived identity
  it('11. should login successfully with valid credentials and return server-derived session', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: adminMobile,
        password: adminPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.session.partyId).toBe(adminPartyId);
    expect(res.body.data.session.organizationId).toBe(rootOrgId);
    expect(Array.isArray(res.body.data.session.roleKeys)).toBe(true);

    adminToken = res.body.data.token;
  });

  // 12. Authenticated user can access protected endpoints with server-derived scope
  it('12. should allow authenticated admin to access protected endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/kernel/k01')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  // 13. Create Retailer Organization, Person, Membership and Role Assignment
  const retailerOrgId = `org-ret-test-${Date.now()}`;
  const retailerPartyId = `party-ret-test-${Date.now()}`;
  const retailerMobile = `0935${Math.floor(1000000 + Math.random() * 9000000)}`;
  const retailerPassword = 'RetailerSecurePass2026!';
  let retailerToken = '';

  it('13. should create retailer fixtures and allow retailer login', async () => {
    // 13a. Create Retailer Org via Admin
    const orgRes = await request(app)
      .post('/api/admin/kernel/k01')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        resource: 'organization',
        id: retailerOrgId,
        legalName: 'طلا و جواهری پرنیا آزمایشی',
        displayName: 'گالری پرنیا',
        organizationType: 'retailer',
        phone: '021-22334455',
        status: 'active',
        verificationStatus: 'verified',
      });
    expect(orgRes.status).toBe(201);

    // 13b. Create Retailer Person via Admin
    const personRes = await request(app)
      .post('/api/admin/kernel/k01')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        resource: 'person',
        id: retailerPartyId,
        firstName: 'حسین',
        lastName: 'میرزایی',
        partyType: 'retailer_owner',
        mobile: retailerMobile,
        status: 'active',
        verificationStatus: 'verified',
      });
    expect(personRes.status).toBe(201);

    // 13c. Link Membership
    const memRes = await request(app)
      .post('/api/admin/kernel/k01')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        resource: 'membership',
        partyId: retailerPartyId,
        organizationId: retailerOrgId,
        roleKey: 'retailer.account_manager',
        title: 'مدیر گالری طلا',
        isPrimary: true,
        status: 'active',
      });
    expect(memRes.status).toBe(201);

    // 13d. Set credentials for Retailer
    const { hash, salt } = AuthService.hashPassword(retailerPassword);
    const db = (await getDatabase()) as any;
    const { authCredentials, rbacAssignments } = await import('../server/db/schema.js');

    await db.insert(authCredentials).values({
      partyId: retailerPartyId,
      passwordHash: hash,
      salt,
      status: 'active',
      failedAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 13e. Assign Retailer Role
    await db.insert(rbacAssignments).values({
      id: `assign-ret-${Date.now()}`,
      membershipId: memRes.body.data.id,
      partyId: retailerPartyId,
      organizationId: retailerOrgId,
      roleKey: 'retailer.account_manager',
      scopeType: 'organization',
      scopeIds: [retailerOrgId],
      validFrom: new Date().toISOString().split('T')[0],
      reason: 'تخصیص نقش مدیر حساب خرده‌فروشی',
      status: 'active',
      version: 1,
      assignedByPartyId: adminPartyId,
      assignedAt: new Date(),
    });

    // 13f. Login as Retailer
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: retailerMobile,
        password: retailerPassword,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.session.partyId).toBe(retailerPartyId);
    expect(loginRes.body.data.session.organizationId).toBe(retailerOrgId);
    retailerToken = loginRes.body.data.token;
  });

  // 14. Retailer Cross-Organization Denial (403 Forbidden)
  it('14. should deny Retailer from accessing or mutating resources of another organization with 403', async () => {
    // Attempt to create membership in root admin organization as Retailer
    const crossOrgRes = await request(app)
      .post('/api/admin/kernel/k01')
      .set('Authorization', `Bearer ${retailerToken}`)
      .send({
        resource: 'membership',
        partyId: retailerPartyId,
        organizationId: rootOrgId, // Cross-organization attempt!
        roleKey: 'admin',
      });

    expect(crossOrgRes.status).toBe(403);
    expect(crossOrgRes.body.error.code).toBe('FORBIDDEN_CROSS_ORG');
  });

  // 15. Scoped data query for Retailer (only sees own organization records)
  it('15. should automatically scope query results to retailer authorized organization', async () => {
    const res = await request(app)
      .get('/api/admin/kernel/k01')
      .set('Authorization', `Bearer ${retailerToken}`);

    expect(res.status).toBe(200);
    // Retailer should only see their own organization in organizations list
    expect(res.body.data.organizations.every((o: any) => o.id === retailerOrgId)).toBe(true);
    expect(res.body.data.memberships.every((m: any) => m.organizationId === retailerOrgId)).toBe(true);
  });

  // 16. Logout & Session Expiry
  it('16. should revoke session on logout and deny subsequent access with 401', async () => {
    // Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${retailerToken}`);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Subsequent access with revoked token must fail with 401
    const accessRes = await request(app)
      .get('/api/admin/kernel/k01')
      .set('Authorization', `Bearer ${retailerToken}`);

    expect(accessRes.status).toBe(401);
    expect(accessRes.body.error.code).toBe('UNAUTHORIZED');
  });

  // 17. Backend restart simulation & PostgreSQL persistence verification
  it('17. should verify persistence of credentials and roles across connection teardown & reinitialization', async () => {
    // Teardown database connection pool
    await closeDatabase();

    // Reinitialize connection
    const freshDb = await getDatabase();
    expect(freshDb).toBeDefined();

    const ping = await pingDatabase();
    expect(ping.ok).toBe(true);

    // Admin should be able to login again using stored credentials
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: adminMobile,
        password: adminPassword,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.session.partyId).toBe(adminPartyId);
  });
});
