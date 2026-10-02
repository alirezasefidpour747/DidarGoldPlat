import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';
import request from 'supertest';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  closeDatabasePool,
  executeQuery,
  getDatabase,
  resetDatabaseForTests,
  withTransaction
} from '../../server/database/client.js';
import {
  k01AuditEvents,
  k01Documents,
  k01Memberships,
  k01Organizations,
  k01Parties
} from '../../server/database/schema.js';
import { checkDatabaseHealth } from '../../server/lib/database.js';
import { k01Repository } from '../../server/repositories/k01-service.repository.js';
import { k01Router } from '../../server/routes/k01.js';
import { importK01Json } from '../../server/services/k01-import.service.js';
import { k01Service, K01ServiceError } from '../../server/services/k01.service.js';
import type { K01DataPayload } from '../../src/types/k01.js';

const fixturePath = path.resolve('tests/fixtures/k01-import.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as K01DataPayload;

let temporaryDirectory = '';
let backupDirectory = '';
let createdPersonId = '';
let createdOrganizationId = '';

const hasExternalDatabase = Boolean(process.env.DATABASE_URL?.trim());

beforeAll(async () => {
  if (!hasExternalDatabase) {
    console.warn('[Integration Test] Skipped: DATABASE_URL is not configured (requires docker-compose up k01-test-db).');
    return;
  }
  process.env.NODE_ENV = 'test';
  temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'didar-k01-integration-'));
  backupDirectory = path.join(temporaryDirectory, 'backups');
  await migrate(getDatabase(), { migrationsFolder: path.resolve('drizzle') });
});

afterAll(async () => {
  if (hasExternalDatabase) {
    await closeDatabasePool();
  }
});

describe.skipIf(!hasExternalDatabase)('PostgreSQL foundation and K01 pilot', () => {
  it('applies migrations on an empty database', async () => {
    const result = await executeQuery<{ count: string }>(
      "select count(*)::text as count from information_schema.tables where table_schema='public' and table_name like 'k01_%'"
    );
    expect(Number(result.rows[0].count)).toBe(5);
    const counts = await executeQuery<{
      parties: string; organizations: string; memberships: string; documents: string; audits: string;
    }>(`select
      (select count(*)::text from k01_parties) as parties,
      (select count(*)::text from k01_organizations) as organizations,
      (select count(*)::text from k01_memberships) as memberships,
      (select count(*)::text from k01_documents) as documents,
      (select count(*)::text from k01_audit_events) as audits`);
    expect(counts.rows[0]).toEqual({ parties: '0', organizations: '0', memberships: '0', documents: '0', audits: '0' });
  });

  it('imports a K01 JSON aggregate transactionally and creates a timestamped backup', async () => {
    const result = await importK01Json({ sourcePath: fixturePath, backupDirectory });
    expect(result.inserted).toEqual({ person: 1, organization: 1, membership: 1, document: 1, auditLog: 1 });
    expect(result.rejected).toEqual([]);
    expect(fs.existsSync(result.backupPath)).toBe(true);
    expect(fs.readFileSync(result.backupPath, 'utf8')).toBe(fs.readFileSync(fixturePath, 'utf8'));
  });

  it('repeats the import without duplication', async () => {
    const result = await importK01Json({ sourcePath: fixturePath, backupDirectory });
    expect(result.inserted).toEqual({ person: 0, organization: 0, membership: 0, document: 0, auditLog: 0 });
    expect(result.skipped).toEqual({ person: 1, organization: 1, membership: 1, document: 1, auditLog: 1 });
    expect(result.destination).toEqual({ person: 1, organization: 1, membership: 1, document: 1, auditLog: 1 });
  });

  it('reports invalid and conflicting import records without duplicating them', async () => {
    const conflicting = structuredClone(fixture) as unknown as Record<string, unknown>;
    (conflicting.persons as Array<Record<string, unknown>>)[0].firstName = 'Changed';
    (conflicting.persons as Array<Record<string, unknown>>).push({ id: 'party-invalid' });
    const invalidPath = path.join(temporaryDirectory, 'k01-conflicts.json');
    fs.writeFileSync(invalidPath, JSON.stringify(conflicting), 'utf8');
    const result = await importK01Json({ sourcePath: invalidPath, backupDirectory });
    expect(result.rejected).toEqual(expect.arrayContaining([
      { entity: 'person', id: 'party-import-001', reason: 'conflict' },
      { entity: 'person', id: 'party-invalid', reason: 'invalid' }
    ]));
    expect(result.destination.person).toBe(1);
  });

  it('creates persons and organizations using database-generated UUID-based IDs', async () => {
    const person = await k01Service.createPerson({
      partyType: 'consumer', firstName: 'Runtime', lastName: 'Person', mobile: '09000000002'
    }, 'Integration Test');
    const organization = await k01Service.createOrganization({
      legalName: 'Runtime Legal', displayName: 'Runtime Org', organizationType: 'other', phone: '02100000002'
    }, 'Integration Test');
    createdPersonId = person.id;
    createdOrganizationId = organization.id;
    expect(person.id).toMatch(/^party-[0-9a-f-]{36}$/);
    expect(organization.id).toMatch(/^org-[0-9a-f-]{36}$/);
  });

  it('creates memberships with enforced foreign keys and reads joined names', async () => {
    const membership = await k01Service.createMembership({
      partyId: createdPersonId, organizationId: createdOrganizationId, roleKey: 'staff', title: 'Runtime member'
    }, 'Integration Test');
    expect(membership.partyName).toBe('Runtime Person');
    expect(membership.organizationName).toBe('Runtime Org');
    await expect(executeQuery(
      "insert into k01_memberships (party_id, organization_id, role_key, title, valid_from) values ($1,$2,'staff','invalid','2026-01-01')",
      ['party-missing', createdOrganizationId]
    )).rejects.toMatchObject({ code: '23503' });
  });

  it('updates and reads K01 data with optimistic versioning', async () => {
    const updated = await k01Service.updatePerson(createdPersonId, { firstName: 'Updated', version: 1 }, 'Integration Test');
    expect(updated.firstName).toBe('Updated');
    expect(updated.version).toBe(2);
    const payload = await k01Service.getPayload();
    expect(payload.persons.find((person) => person.id === createdPersonId)?.firstName).toBe('Updated');
  });

  it('enforces uniqueness', async () => {
    await expect(k01Service.createPerson({
      partyType: 'consumer', firstName: 'Duplicate', lastName: 'Mobile', mobile: '09000000002'
    }, 'Integration Test')).rejects.toMatchObject({ status: 409 });
  });

  it('rolls back a failed multi-row transaction completely', async () => {
    const rollbackId = 'party-rollback-001';
    await expect(withTransaction(async (transaction) => {
      await k01Repository.insertParty({
        id: rollbackId, partyType: 'consumer', firstName: 'Rollback', lastName: 'Test',
        mobile: '09000000003', status: 'pending', verificationStatus: 'unverified'
      }, transaction);
      throw new Error('intentional rollback');
    })).rejects.toThrow('intentional rollback');
    expect(await k01Repository.findParty(rollbackId)).toBeUndefined();
  });

  it('retains K01 data after the backend database pool is closed and reopened', async () => {
    await closeDatabasePool();
    resetDatabaseForTests();
    const persisted = await k01Repository.findParty(createdPersonId);
    expect(persisted).toMatchObject({ id: createdPersonId, firstName: 'Updated', version: 2 });
  });

  it('preserves the K01 API response contract', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/admin/kernel/k01', k01Router);
    const response = await request(app).get('/api/admin/kernel/k01').expect(200);
    expect(response.body).toMatchObject({ success: true, data: { persons: expect.any(Array), counts: expect.any(Object) } });
  });

  it('reports a successful real readiness query', async () => {
    const health = await checkDatabaseHealth();
    expect(health).toMatchObject({ status: 'ready', ready: true, connectivityVerified: true });
  });

  it('reports outage and never falls back to JSON', async () => {
    const originalUrl = process.env.DATABASE_URL;
    await closeDatabasePool();
    process.env.DATABASE_URL = 'postgresql://test-user:local-placeholder@127.0.0.1:1/unavailable';
    process.env.DATABASE_CONNECT_TIMEOUT_MS = '250';
    process.env.DATABASE_READINESS_TIMEOUT_MS = '300';
    resetDatabaseForTests();
    const health = await checkDatabaseHealth();
    expect(health).toMatchObject({ status: 'unavailable', ready: false, connectivityVerified: false });
    await expect(k01Service.getPayload()).rejects.toMatchObject({
      code: 'DATABASE_UNAVAILABLE',
      status: 503,
    } satisfies Partial<K01ServiceError>);
    expect(fs.existsSync(path.resolve('data/didar-kernel-store.json'))).toBe(false);
    await closeDatabasePool();
    process.env.DATABASE_URL = originalUrl;
    delete process.env.DATABASE_CONNECT_TIMEOUT_MS;
    delete process.env.DATABASE_READINESS_TIMEOUT_MS;
    resetDatabaseForTests();
  });

  it('removes all isolated test records and leaves the K01 schema empty', async () => {
    await withTransaction(async (transaction) => {
      await transaction.delete(k01AuditEvents);
      await transaction.delete(k01Documents);
      await transaction.delete(k01Memberships);
      await transaction.delete(k01Organizations);
      await transaction.delete(k01Parties);
    });
    const payload = await k01Service.getPayload();
    expect(payload).toMatchObject({
      persons: [], organizations: [], memberships: [], documents: [], auditLogs: [],
      counts: {
        totalPersons: 0, totalOrganizations: 0, totalMemberships: 0,
        activePersons: 0, activeOrganizations: 0, verifiedPersons: 0, verifiedOrganizations: 0
      }
    });
  });
});
