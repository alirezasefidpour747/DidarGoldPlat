import { and, desc, eq } from 'drizzle-orm';
import { getDatabase, type DatabaseTransaction } from '../database/client.js';
import {
  k01AuditEvents,
  k01Documents,
  k01Memberships,
  k01Organizations,
  k01Parties,
  type K01AuditEventRow,
  type K01DocumentRow,
  type K01MembershipRow,
  type K01OrganizationRow,
  type K01PartyRow
} from '../database/schema.js';
import type {
  AuditEvent,
  K01DataPayload,
  Membership,
  Organization,
  Party,
  PartyDocument
} from '../../src/types/k01.js';

type Executor = ReturnType<typeof getDatabase> | DatabaseTransaction;
type PartyInsert = typeof k01Parties.$inferInsert;
type OrganizationInsert = typeof k01Organizations.$inferInsert;
type MembershipInsert = typeof k01Memberships.$inferInsert;
type DocumentInsert = typeof k01Documents.$inferInsert;
type AuditInsert = typeof k01AuditEvents.$inferInsert;

const executor = (transaction?: DatabaseTransaction) => (transaction ?? getDatabase()) as any;
const iso = (value: Date) => value.toISOString();

export function mapParty(row: K01PartyRow): Party {
  return {
    id: row.id,
    partyType: row.partyType as Party['partyType'],
    firstName: row.firstName,
    lastName: row.lastName,
    nationalId: row.nationalId ?? undefined,
    mobile: row.mobile,
    email: row.email ?? undefined,
    status: row.status as Party['status'],
    verificationStatus: row.verificationStatus as Party['verificationStatus'],
    notes: row.notes ?? undefined,
    consumerProfile: row.consumerProfile ?? undefined,
    agentProfile: row.agentProfile ?? undefined,
    internalProfile: row.internalProfile ?? undefined,
    representativeProfile: row.representativeProfile ?? undefined,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    version: row.version
  };
}

export function mapOrganization(row: K01OrganizationRow): Organization {
  return {
    id: row.id,
    legalName: row.legalName,
    displayName: row.displayName,
    organizationType: row.organizationType as Organization['organizationType'],
    registrationNumber: row.registrationNumber ?? undefined,
    nationalLegalId: row.nationalLegalId ?? undefined,
    economicCode: row.economicCode ?? undefined,
    website: row.website ?? undefined,
    phone: row.phone,
    email: row.email ?? undefined,
    province: row.province ?? undefined,
    city: row.city ?? undefined,
    address: row.address ?? undefined,
    postalCode: row.postalCode ?? undefined,
    status: row.status as Organization['status'],
    verificationStatus: row.verificationStatus as Organization['verificationStatus'],
    notes: row.notes ?? undefined,
    retailerProfile: row.retailerProfile ?? undefined,
    manufacturerProfile: row.manufacturerProfile ?? undefined,
    wholesalerProfile: row.wholesalerProfile ?? undefined,
    supplierProfile: row.supplierProfile ?? undefined,
    agentOfficeProfile: row.agentOfficeProfile ?? undefined,
    servicePartnerProfile: row.servicePartnerProfile ?? undefined,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    version: row.version
  };
}

export function mapMembership(
  row: K01MembershipRow,
  partyName?: string,
  organizationName?: string
): Membership {
  return {
    id: row.id,
    partyId: row.partyId,
    organizationId: row.organizationId,
    roleKey: row.roleKey,
    title: row.title,
    authorities: row.authorities as Membership['authorities'],
    isPrimary: row.isPrimary,
    status: row.status as Membership['status'],
    validFrom: row.validFrom,
    validTo: row.validTo ?? undefined,
    notes: row.notes ?? undefined,
    partyName,
    organizationName,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt)
  };
}

export function mapDocument(row: K01DocumentRow): PartyDocument {
  return {
    id: row.id,
    targetType: row.targetType as PartyDocument['targetType'],
    targetId: row.targetId,
    documentType: row.documentType as PartyDocument['documentType'],
    fileName: row.fileName,
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    fileUri: row.fileUri ?? undefined,
    verificationStatus: row.verificationStatus as PartyDocument['verificationStatus'],
    uploadedBy: row.uploadedBy,
    notes: row.notes ?? undefined,
    createdAt: iso(row.createdAt)
  };
}

export function mapAuditEvent(row: K01AuditEventRow): AuditEvent {
  return {
    id: row.id,
    actorId: row.actorId,
    actorName: row.actorName,
    action: row.action as AuditEvent['action'],
    targetType: row.targetType as AuditEvent['targetType'],
    targetId: row.targetId,
    targetName: row.targetName ?? undefined,
    description: row.description,
    changes: row.changes ?? undefined,
    timestamp: iso(row.occurredAt)
  };
}

export class K01Repository {
  async getPayload(transaction?: DatabaseTransaction): Promise<K01DataPayload> {
    const db = executor(transaction);
    // node-postgres transactions use one client and must not issue concurrent queries.
    const rows = transaction
      ? [
          await db.select().from(k01Parties).orderBy(desc(k01Parties.createdAt)),
          await db.select().from(k01Organizations).orderBy(desc(k01Organizations.createdAt)),
          await db.select().from(k01Memberships).orderBy(desc(k01Memberships.createdAt)),
          await db.select().from(k01Documents).orderBy(desc(k01Documents.createdAt)),
          await db.select().from(k01AuditEvents).orderBy(desc(k01AuditEvents.occurredAt))
        ]
      : await Promise.all([
          db.select().from(k01Parties).orderBy(desc(k01Parties.createdAt)),
          db.select().from(k01Organizations).orderBy(desc(k01Organizations.createdAt)),
          db.select().from(k01Memberships).orderBy(desc(k01Memberships.createdAt)),
          db.select().from(k01Documents).orderBy(desc(k01Documents.createdAt)),
          db.select().from(k01AuditEvents).orderBy(desc(k01AuditEvents.occurredAt))
        ]);
    const [partyRows, organizationRows, membershipRows, documentRows, auditRows] = rows;
    const persons = (partyRows as K01PartyRow[]).map(mapParty);
    const organizations = (organizationRows as K01OrganizationRow[]).map(mapOrganization);
    const partyNames = new Map(persons.map((person) => [person.id, `${person.firstName} ${person.lastName}`]));
    const organizationNames = new Map(organizations.map((organization) => [organization.id, organization.displayName]));
    const memberships = (membershipRows as K01MembershipRow[]).map((row) =>
      mapMembership(row, partyNames.get(row.partyId), organizationNames.get(row.organizationId))
    );
    return {
      persons,
      organizations,
      memberships,
      documents: (documentRows as K01DocumentRow[]).map(mapDocument),
      auditLogs: (auditRows as K01AuditEventRow[]).map(mapAuditEvent),
      counts: {
        totalPersons: persons.length,
        totalOrganizations: organizations.length,
        totalMemberships: memberships.length,
        activePersons: persons.filter((person) => person.status === 'active').length,
        activeOrganizations: organizations.filter((organization) => organization.status === 'active').length,
        verifiedPersons: persons.filter((person) => person.verificationStatus === 'verified').length,
        verifiedOrganizations: organizations.filter((organization) => organization.verificationStatus === 'verified').length
      }
    };
  }

  async findParty(id: string, transaction?: DatabaseTransaction): Promise<K01PartyRow | undefined> {
    const rows = await executor(transaction).select().from(k01Parties).where(eq(k01Parties.id, id)).limit(1);
    return rows[0];
  }

  async findOrganization(id: string, transaction?: DatabaseTransaction): Promise<K01OrganizationRow | undefined> {
    const rows = await executor(transaction).select().from(k01Organizations).where(eq(k01Organizations.id, id)).limit(1);
    return rows[0];
  }

  async findMembership(id: string, transaction?: DatabaseTransaction): Promise<K01MembershipRow | undefined> {
    const rows = await executor(transaction).select().from(k01Memberships).where(eq(k01Memberships.id, id)).limit(1);
    return rows[0];
  }

  async findDocument(id: string, transaction?: DatabaseTransaction): Promise<K01DocumentRow | undefined> {
    const rows = await executor(transaction).select().from(k01Documents).where(eq(k01Documents.id, id)).limit(1);
    return rows[0];
  }

  async insertParty(values: PartyInsert, transaction?: DatabaseTransaction): Promise<K01PartyRow> {
    const [row] = await executor(transaction).insert(k01Parties).values(values).returning();
    return row;
  }

  async insertOrganization(values: OrganizationInsert, transaction?: DatabaseTransaction): Promise<K01OrganizationRow> {
    const [row] = await executor(transaction).insert(k01Organizations).values(values).returning();
    return row;
  }

  async insertMembership(values: MembershipInsert, transaction?: DatabaseTransaction): Promise<K01MembershipRow> {
    const [row] = await executor(transaction).insert(k01Memberships).values(values).returning();
    return row;
  }

  async insertDocument(values: DocumentInsert, transaction?: DatabaseTransaction): Promise<K01DocumentRow> {
    const [row] = await executor(transaction).insert(k01Documents).values(values).returning();
    return row;
  }

  async insertAudit(values: AuditInsert, transaction?: DatabaseTransaction): Promise<K01AuditEventRow> {
    const [row] = await executor(transaction).insert(k01AuditEvents).values(values).returning();
    return row;
  }

  async updateParty(
    id: string,
    expectedVersion: number,
    values: Partial<PartyInsert>,
    transaction?: DatabaseTransaction
  ): Promise<K01PartyRow | undefined> {
    const [row] = await executor(transaction)
      .update(k01Parties)
      .set(values)
      .where(and(eq(k01Parties.id, id), eq(k01Parties.version, expectedVersion)))
      .returning();
    return row;
  }

  async updateOrganization(
    id: string,
    expectedVersion: number,
    values: Partial<OrganizationInsert>,
    transaction?: DatabaseTransaction
  ): Promise<K01OrganizationRow | undefined> {
    const [row] = await executor(transaction)
      .update(k01Organizations)
      .set(values)
      .where(and(eq(k01Organizations.id, id), eq(k01Organizations.version, expectedVersion)))
      .returning();
    return row;
  }

  async updateMembership(
    id: string,
    values: Partial<MembershipInsert>,
    transaction?: DatabaseTransaction
  ): Promise<K01MembershipRow | undefined> {
    const [row] = await executor(transaction)
      .update(k01Memberships)
      .set(values)
      .where(eq(k01Memberships.id, id))
      .returning();
    return row;
  }

  async updateDocument(
    id: string,
    values: Partial<DocumentInsert>,
    transaction?: DatabaseTransaction
  ): Promise<K01DocumentRow | undefined> {
    const [row] = await executor(transaction)
      .update(k01Documents)
      .set(values)
      .where(eq(k01Documents.id, id))
      .returning();
    return row;
  }
}

export const k01Repository = new K01Repository();
