/**
 * Didar Gold Platform - Domain K01 PostgreSQL Repository
 * Type-safe data access layer for Persons, Organizations, Memberships, Documents, and Audit Logs.
 * Runs on PostgreSQL with ACID transactions and constraints.
 */

import { eq, and, sql, desc } from 'drizzle-orm';
import { getDatabase } from '../db/index.js';
import {
  k01Persons,
  k01Organizations,
  k01Memberships,
  k01Documents,
  k01AuditLogs,
} from '../db/schema.js';
import {
  PersonParty,
  OrganizationParty,
  Membership,
  DocumentItem,
  AuditEvent,
  K01DataPayload,
} from '../../src/types/k01.js';

export class K01Repository {
  /**
   * Fetch full K01 store from PostgreSQL
   */
  static async getFullStore(): Promise<K01DataPayload> {
    const db = (await getDatabase()) as any;

    const [persons, organizations, memberships, documents, auditLogs] = await Promise.all([
      db.select().from(k01Persons),
      db.select().from(k01Organizations),
      db.select().from(k01Memberships),
      db.select().from(k01Documents),
      db.select().from(k01AuditLogs).orderBy(desc(k01AuditLogs.timestamp)),
    ]);

    const mappedPersons = persons.map(this.mapPersonFromDb);
    const mappedOrganizations = organizations.map(this.mapOrganizationFromDb);
    const mappedMemberships = memberships.map(this.mapMembershipFromDb);
    const mappedDocuments = documents.map(this.mapDocumentFromDb);
    const mappedAuditLogs = auditLogs.map(this.mapAuditLogFromDb);

    return {
      persons: mappedPersons,
      organizations: mappedOrganizations,
      memberships: mappedMemberships,
      documents: mappedDocuments,
      auditLogs: mappedAuditLogs,
      counts: {
        totalPersons: mappedPersons.length,
        totalOrganizations: mappedOrganizations.length,
        totalMemberships: mappedMemberships.length,
        activePersons: mappedPersons.filter((p: any) => p.status === 'active').length,
        activeOrganizations: mappedOrganizations.filter((o: any) => o.status === 'active').length,
        verifiedPersons: mappedPersons.filter((p: any) => p.verificationStatus === 'verified').length,
        verifiedOrganizations: mappedOrganizations.filter((o: any) => o.verificationStatus === 'verified').length,
      },
    };
  }

  // ==================== PERSONS ====================

  static async getPersonById(id: string): Promise<PersonParty | null> {
    const db = (await getDatabase()) as any;
    const res = await db.select().from(k01Persons).where(eq(k01Persons.id, id));
    if (res.length === 0) return null;
    return this.mapPersonFromDb(res[0]);
  }

  static async getPersonByMobile(mobile: string): Promise<PersonParty | null> {
    const db = (await getDatabase()) as any;
    const res = await db.select().from(k01Persons).where(eq(k01Persons.mobile, mobile));
    if (res.length === 0) return null;
    return this.mapPersonFromDb(res[0]);
  }

  static async getPersonByNationalId(nationalId: string): Promise<PersonParty | null> {
    const db = (await getDatabase()) as any;
    const res = await db.select().from(k01Persons).where(eq(k01Persons.nationalId, nationalId));
    if (res.length === 0) return null;
    return this.mapPersonFromDb(res[0]);
  }

  static async createPerson(person: PersonParty, audit?: AuditEvent): Promise<PersonParty> {
    const db = (await getDatabase()) as any;

    // Check unique constraints
    const existingMobile = await this.getPersonByMobile(person.mobile);
    if (existingMobile) {
      throw new Error(`شخصی با شماره موبایل ${person.mobile} از قبل در سیستم وجود دارد (تکراری).`);
    }

    if (person.nationalId) {
      const existingNat = await this.getPersonByNationalId(person.nationalId);
      if (existingNat) {
        throw new Error(`شخصی با کدملی ${person.nationalId} از قبل در سیستم ثبت شده است (تکراری).`);
      }
    }

    await db.transaction(async (tx: any) => {
      await tx.insert(k01Persons).values({
        id: person.id,
        partyType: person.partyType,
        firstName: person.firstName,
        lastName: person.lastName,
        nationalId: person.nationalId || null,
        mobile: person.mobile,
        email: person.email || null,
        status: person.status,
        verificationStatus: person.verificationStatus,
        notes: person.notes || null,
        consumerProfile: person.consumerProfile || null,
        agentProfile: person.agentProfile || null,
        internalProfile: person.internalProfile || null,
        representativeProfile: person.representativeProfile || null,
        version: person.version || 1,
        createdAt: new Date(person.createdAt),
        updatedAt: new Date(person.updatedAt),
      });

      if (audit) {
        await tx.insert(k01AuditLogs).values({
          id: audit.id,
          actorId: audit.actorId,
          actorName: audit.actorName,
          action: audit.action,
          targetType: audit.targetType,
          targetId: audit.targetId,
          targetName: audit.targetName || null,
          description: audit.description,
          changes: audit.changes || null,
          timestamp: new Date(audit.timestamp),
        });
      }
    });

    const created = await this.getPersonById(person.id);
    return created!;
  }

  static async updatePerson(id: string, updates: Partial<PersonParty>, audit?: AuditEvent): Promise<PersonParty> {
    const db = (await getDatabase()) as any;
    const existing = await this.getPersonById(id);
    if (!existing) {
      throw new Error(`شخص با شناسه ${id} یافت نشد.`);
    }

    // Check unique conflict on update
    if (updates.mobile && updates.mobile !== existing.mobile) {
      const conflict = await this.getPersonByMobile(updates.mobile);
      if (conflict && conflict.id !== id) {
        throw new Error(`شماره موبایل ${updates.mobile} متعلق به شخص دیگری است (تعارض).`);
      }
    }

    if (updates.nationalId && updates.nationalId !== existing.nationalId) {
      const conflict = await this.getPersonByNationalId(updates.nationalId);
      if (conflict && conflict.id !== id) {
        throw new Error(`کدملی ${updates.nationalId} متعلق به شخص دیگری است (تعارض).`);
      }
    }

    const newVersion = (existing.version || 1) + 1;
    const updatedAt = new Date();

    await db.transaction(async (tx: any) => {
      const dbValues: Record<string, any> = {
        version: newVersion,
        updatedAt,
      };

      if (updates.firstName !== undefined) dbValues.firstName = updates.firstName;
      if (updates.lastName !== undefined) dbValues.lastName = updates.lastName;
      if (updates.mobile !== undefined) dbValues.mobile = updates.mobile;
      if (updates.nationalId !== undefined) dbValues.nationalId = updates.nationalId;
      if (updates.email !== undefined) dbValues.email = updates.email;
      if (updates.status !== undefined) dbValues.status = updates.status;
      if (updates.verificationStatus !== undefined) dbValues.verificationStatus = updates.verificationStatus;
      if (updates.notes !== undefined) dbValues.notes = updates.notes;
      if (updates.partyType !== undefined) dbValues.partyType = updates.partyType;
      if (updates.consumerProfile !== undefined) dbValues.consumerProfile = updates.consumerProfile;
      if (updates.agentProfile !== undefined) dbValues.agentProfile = updates.agentProfile;
      if (updates.internalProfile !== undefined) dbValues.internalProfile = updates.internalProfile;
      if (updates.representativeProfile !== undefined) dbValues.representativeProfile = updates.representativeProfile;

      await tx.update(k01Persons).set(dbValues).where(eq(k01Persons.id, id));

      if (audit) {
        await tx.insert(k01AuditLogs).values({
          id: audit.id,
          actorId: audit.actorId,
          actorName: audit.actorName,
          action: audit.action,
          targetType: audit.targetType,
          targetId: audit.targetId,
          targetName: audit.targetName || null,
          description: audit.description,
          changes: audit.changes || null,
          timestamp: new Date(audit.timestamp),
        });
      }
    });

    const updated = await this.getPersonById(id);
    return updated!;
  }

  // ==================== ORGANIZATIONS ====================

  static async getOrganizationById(id: string): Promise<OrganizationParty | null> {
    const db = (await getDatabase()) as any;
    const res = await db.select().from(k01Organizations).where(eq(k01Organizations.id, id));
    if (res.length === 0) return null;
    return this.mapOrganizationFromDb(res[0]);
  }

  static async getOrganizationByNationalLegalId(id: string): Promise<OrganizationParty | null> {
    const db = (await getDatabase()) as any;
    const res = await db.select().from(k01Organizations).where(eq(k01Organizations.nationalLegalId, id));
    if (res.length === 0) return null;
    return this.mapOrganizationFromDb(res[0]);
  }

  static async createOrganization(org: OrganizationParty, audit?: AuditEvent): Promise<OrganizationParty> {
    const db = (await getDatabase()) as any;

    if (org.nationalLegalId) {
      const existing = await this.getOrganizationByNationalLegalId(org.nationalLegalId);
      if (existing) {
        throw new Error(`سازمانی با شناسه ملی ${org.nationalLegalId} از قبل ثبت شده است (تکراری).`);
      }
    }

    await db.transaction(async (tx: any) => {
      await tx.insert(k01Organizations).values({
        id: org.id,
        legalName: org.legalName,
        displayName: org.displayName || org.legalName,
        organizationType: org.organizationType,
        registrationNumber: org.registrationNumber || null,
        nationalLegalId: org.nationalLegalId || null,
        economicCode: org.economicCode || null,
        website: org.website || null,
        phone: org.phone,
        email: org.email || null,
        province: org.province || null,
        city: org.city || null,
        address: org.address || null,
        postalCode: org.postalCode || null,
        status: org.status,
        verificationStatus: org.verificationStatus,
        notes: org.notes || null,
        retailerProfile: org.retailerProfile || null,
        manufacturerProfile: org.manufacturerProfile || null,
        wholesalerProfile: org.wholesalerProfile || null,
        supplierProfile: org.supplierProfile || null,
        agentOfficeProfile: org.agentOfficeProfile || null,
        servicePartnerProfile: org.servicePartnerProfile || null,
        version: org.version || 1,
        createdAt: new Date(org.createdAt),
        updatedAt: new Date(org.updatedAt),
      });

      if (audit) {
        await tx.insert(k01AuditLogs).values({
          id: audit.id,
          actorId: audit.actorId,
          actorName: audit.actorName,
          action: audit.action,
          targetType: audit.targetType,
          targetId: audit.targetId,
          targetName: audit.targetName || null,
          description: audit.description,
          changes: audit.changes || null,
          timestamp: new Date(audit.timestamp),
        });
      }
    });

    const created = await this.getOrganizationById(org.id);
    return created!;
  }

  static async updateOrganization(id: string, updates: Partial<OrganizationParty>, audit?: AuditEvent): Promise<OrganizationParty> {
    const db = (await getDatabase()) as any;
    const existing = await this.getOrganizationById(id);
    if (!existing) {
      throw new Error(`سازمان با شناسه ${id} یافت نشد.`);
    }

    const newVersion = (existing.version || 1) + 1;
    const updatedAt = new Date();

    await db.transaction(async (tx: any) => {
      const dbValues: Record<string, any> = {
        version: newVersion,
        updatedAt,
      };

      if (updates.legalName !== undefined) dbValues.legalName = updates.legalName;
      if (updates.displayName !== undefined) dbValues.displayName = updates.displayName;
      if (updates.organizationType !== undefined) dbValues.organizationType = updates.organizationType;
      if (updates.registrationNumber !== undefined) dbValues.registrationNumber = updates.registrationNumber;
      if (updates.nationalLegalId !== undefined) dbValues.nationalLegalId = updates.nationalLegalId;
      if (updates.economicCode !== undefined) dbValues.economicCode = updates.economicCode;
      if (updates.website !== undefined) dbValues.website = updates.website;
      if (updates.phone !== undefined) dbValues.phone = updates.phone;
      if (updates.email !== undefined) dbValues.email = updates.email;
      if (updates.province !== undefined) dbValues.province = updates.province;
      if (updates.city !== undefined) dbValues.city = updates.city;
      if (updates.address !== undefined) dbValues.address = updates.address;
      if (updates.postalCode !== undefined) dbValues.postalCode = updates.postalCode;
      if (updates.status !== undefined) dbValues.status = updates.status;
      if (updates.verificationStatus !== undefined) dbValues.verificationStatus = updates.verificationStatus;
      if (updates.notes !== undefined) dbValues.notes = updates.notes;
      if (updates.retailerProfile !== undefined) dbValues.retailerProfile = updates.retailerProfile;
      if (updates.manufacturerProfile !== undefined) dbValues.manufacturerProfile = updates.manufacturerProfile;
      if (updates.wholesalerProfile !== undefined) dbValues.wholesalerProfile = updates.wholesalerProfile;
      if (updates.supplierProfile !== undefined) dbValues.supplierProfile = updates.supplierProfile;
      if (updates.agentOfficeProfile !== undefined) dbValues.agentOfficeProfile = updates.agentOfficeProfile;
      if (updates.servicePartnerProfile !== undefined) dbValues.servicePartnerProfile = updates.servicePartnerProfile;

      await tx.update(k01Organizations).set(dbValues).where(eq(k01Organizations.id, id));

      if (audit) {
        await tx.insert(k01AuditLogs).values({
          id: audit.id,
          actorId: audit.actorId,
          actorName: audit.actorName,
          action: audit.action,
          targetType: audit.targetType,
          targetId: audit.targetId,
          targetName: audit.targetName || null,
          description: audit.description,
          changes: audit.changes || null,
          timestamp: new Date(audit.timestamp),
        });
      }
    });

    const updated = await this.getOrganizationById(id);
    return updated!;
  }

  // ==================== MEMBERSHIPS ====================

  static async getMembershipById(id: string): Promise<Membership | null> {
    const db = (await getDatabase()) as any;
    const res = await db.select().from(k01Memberships).where(eq(k01Memberships.id, id));
    if (res.length === 0) return null;
    return this.mapMembershipFromDb(res[0]);
  }

  static async getMembershipByPartyAndOrg(partyId: string, organizationId: string): Promise<Membership | null> {
    const db = (await getDatabase()) as any;
    const res = await db
      .select()
      .from(k01Memberships)
      .where(and(eq(k01Memberships.partyId, partyId), eq(k01Memberships.organizationId, organizationId)));
    if (res.length === 0) return null;
    return this.mapMembershipFromDb(res[0]);
  }

  static async createMembership(mem: Membership, audit?: AuditEvent): Promise<Membership> {
    const db = (await getDatabase()) as any;

    // Check party and org exist
    const person = await this.getPersonById(mem.partyId);
    if (!person) {
      throw new Error(`شخص با شناسه ${mem.partyId} یافت نشد.`);
    }

    const org = await this.getOrganizationById(mem.organizationId);
    if (!org) {
      throw new Error(`سازمان با شناسه ${mem.organizationId} یافت نشد.`);
    }

    // Check duplicate membership
    const existing = await this.getMembershipByPartyAndOrg(mem.partyId, mem.organizationId);
    if (existing) {
      throw new Error(`این شخص قبلاً در این سازمان عضویت دارد (عضویت تکراری مجاز نیست).`);
    }

    const partyName = mem.partyName || `${person.firstName} ${person.lastName}`;
    const organizationName = mem.organizationName || org.displayName || org.legalName;

    await db.transaction(async (tx: any) => {
      await tx.insert(k01Memberships).values({
        id: mem.id,
        partyId: mem.partyId,
        organizationId: mem.organizationId,
        roleKey: mem.roleKey,
        title: mem.title,
        authorities: mem.authorities || [],
        isPrimary: Boolean(mem.isPrimary),
        status: mem.status || 'active',
        validFrom: mem.validFrom,
        validTo: mem.validTo || null,
        notes: mem.notes || null,
        partyName,
        organizationName,
        createdAt: new Date(mem.createdAt),
        updatedAt: new Date(mem.updatedAt),
      });

      if (audit) {
        await tx.insert(k01AuditLogs).values({
          id: audit.id,
          actorId: audit.actorId,
          actorName: audit.actorName,
          action: audit.action,
          targetType: audit.targetType,
          targetId: audit.targetId,
          targetName: audit.targetName || null,
          description: audit.description,
          changes: audit.changes || null,
          timestamp: new Date(audit.timestamp),
        });
      }
    });

    const created = await this.getMembershipById(mem.id);
    return created!;
  }

  static async updateMembership(id: string, updates: Partial<Membership>, audit?: AuditEvent): Promise<Membership> {
    const db = (await getDatabase()) as any;
    const existing = await this.getMembershipById(id);
    if (!existing) {
      throw new Error(`عضویت با شناسه ${id} یافت نشد.`);
    }

    await db.transaction(async (tx: any) => {
      const dbValues: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (updates.roleKey !== undefined) dbValues.roleKey = updates.roleKey;
      if (updates.title !== undefined) dbValues.title = updates.title;
      if (updates.authorities !== undefined) dbValues.authorities = updates.authorities;
      if (updates.isPrimary !== undefined) dbValues.isPrimary = updates.isPrimary;
      if (updates.status !== undefined) dbValues.status = updates.status;
      if (updates.validFrom !== undefined) dbValues.validFrom = updates.validFrom;
      if (updates.validTo !== undefined) dbValues.validTo = updates.validTo;
      if (updates.notes !== undefined) dbValues.notes = updates.notes;

      await tx.update(k01Memberships).set(dbValues).where(eq(k01Memberships.id, id));

      if (audit) {
        await tx.insert(k01AuditLogs).values({
          id: audit.id,
          actorId: audit.actorId,
          actorName: audit.actorName,
          action: audit.action,
          targetType: audit.targetType,
          targetId: audit.targetId,
          targetName: audit.targetName || null,
          description: audit.description,
          changes: audit.changes || null,
          timestamp: new Date(audit.timestamp),
        });
      }
    });

    const updated = await this.getMembershipById(id);
    return updated!;
  }

  // ==================== DOCUMENTS ====================

  static async getDocumentById(id: string): Promise<DocumentItem | null> {
    const db = (await getDatabase()) as any;
    const res = await db.select().from(k01Documents).where(eq(k01Documents.id, id));
    if (res.length === 0) return null;
    return this.mapDocumentFromDb(res[0]);
  }

  static async addDocument(doc: DocumentItem, audit?: AuditEvent): Promise<DocumentItem> {
    const db = (await getDatabase()) as any;

    await db.transaction(async (tx: any) => {
      await tx.insert(k01Documents).values({
        id: doc.id,
        targetType: doc.targetType,
        targetId: doc.targetId,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileSize: doc.fileSize || 0,
        mimeType: doc.mimeType || 'application/pdf',
        fileUri: doc.fileUri || null,
        verificationStatus: doc.verificationStatus || 'pending',
        uploadedBy: doc.uploadedBy,
        notes: doc.notes || null,
        createdAt: new Date(doc.createdAt),
      });

      if (audit) {
        await tx.insert(k01AuditLogs).values({
          id: audit.id,
          actorId: audit.actorId,
          actorName: audit.actorName,
          action: audit.action,
          targetType: audit.targetType,
          targetId: audit.targetId,
          targetName: audit.targetName || null,
          description: audit.description,
          changes: audit.changes || null,
          timestamp: new Date(audit.timestamp),
        });
      }
    });

    const created = await this.getDocumentById(doc.id);
    return created!;
  }

  static async updateDocument(id: string, updates: Partial<DocumentItem>): Promise<DocumentItem> {
    const db = (await getDatabase()) as any;
    const existing = await this.getDocumentById(id);
    if (!existing) {
      throw new Error(`سند با شناسه ${id} یافت نشد.`);
    }

    const dbValues: Record<string, any> = {};
    if (updates.verificationStatus !== undefined) dbValues.verificationStatus = updates.verificationStatus;
    if (updates.notes !== undefined) dbValues.notes = updates.notes;
    if (updates.fileUri !== undefined) dbValues.fileUri = updates.fileUri;

    await db.update(k01Documents).set(dbValues).where(eq(k01Documents.id, id));
    const updated = await this.getDocumentById(id);
    return updated!;
  }

  // ==================== AUDIT LOGS ====================

  static async addAuditLog(audit: AuditEvent): Promise<AuditEvent> {
    const db = (await getDatabase()) as any;
    await db.insert(k01AuditLogs).values({
      id: audit.id,
      actorId: audit.actorId,
      actorName: audit.actorName,
      action: audit.action,
      targetType: audit.targetType,
      targetId: audit.targetId,
      targetName: audit.targetName || null,
      description: audit.description,
      changes: audit.changes || null,
      timestamp: new Date(audit.timestamp),
    });
    return audit;
  }

  // ==================== MAPPERS ====================

  private static mapPersonFromDb(row: any): PersonParty {
    return {
      id: row.id,
      partyType: row.partyType,
      firstName: row.firstName,
      lastName: row.lastName,
      nationalId: row.nationalId || undefined,
      mobile: row.mobile,
      email: row.email || undefined,
      status: row.status,
      verificationStatus: row.verificationStatus,
      notes: row.notes || undefined,
      consumerProfile: row.consumerProfile || undefined,
      agentProfile: row.agentProfile || undefined,
      internalProfile: row.internalProfile || undefined,
      representativeProfile: row.representativeProfile || undefined,
      version: row.version,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    };
  }

  private static mapOrganizationFromDb(row: any): OrganizationParty {
    return {
      id: row.id,
      legalName: row.legalName,
      displayName: row.displayName,
      organizationType: row.organizationType,
      registrationNumber: row.registrationNumber || undefined,
      nationalLegalId: row.nationalLegalId || undefined,
      economicCode: row.economicCode || undefined,
      website: row.website || undefined,
      phone: row.phone,
      email: row.email || undefined,
      province: row.province || undefined,
      city: row.city || undefined,
      address: row.address || undefined,
      postalCode: row.postalCode || undefined,
      status: row.status,
      verificationStatus: row.verificationStatus,
      notes: row.notes || undefined,
      retailerProfile: row.retailerProfile || undefined,
      manufacturerProfile: row.manufacturerProfile || undefined,
      wholesalerProfile: row.wholesalerProfile || undefined,
      supplierProfile: row.supplierProfile || undefined,
      agentOfficeProfile: row.agentOfficeProfile || undefined,
      servicePartnerProfile: row.servicePartnerProfile || undefined,
      version: row.version,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    };
  }

  private static mapMembershipFromDb(row: any): Membership {
    return {
      id: row.id,
      partyId: row.partyId,
      organizationId: row.organizationId,
      roleKey: row.roleKey,
      title: row.title,
      authorities: row.authorities || [],
      isPrimary: row.isPrimary,
      status: row.status,
      validFrom: row.validFrom,
      validTo: row.validTo || undefined,
      notes: row.notes || undefined,
      partyName: row.partyName || undefined,
      organizationName: row.organizationName || undefined,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
    };
  }

  private static mapDocumentFromDb(row: any): DocumentItem {
    return {
      id: row.id,
      targetType: row.targetType,
      targetId: row.targetId,
      documentType: row.documentType,
      fileName: row.fileName,
      fileSize: row.fileSize,
      mimeType: row.mimeType,
      fileUri: row.fileUri || undefined,
      verificationStatus: row.verificationStatus,
      uploadedBy: row.uploadedBy,
      notes: row.notes || undefined,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    };
  }

  private static mapAuditLogFromDb(row: any): AuditEvent {
    return {
      id: row.id,
      actorId: row.actorId,
      actorName: row.actorName,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      targetName: row.targetName || undefined,
      description: row.description,
      changes: row.changes || undefined,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : String(row.timestamp),
    };
  }
}
