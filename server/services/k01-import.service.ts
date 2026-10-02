import fs from 'fs';
import path from 'path';
import { withTransaction } from '../database/client.js';
import { k01Repository, mapAuditEvent, mapDocument, mapMembership, mapOrganization, mapParty } from '../repositories/k01-service.repository.js';
import type { AuditEvent, K01DataPayload, Membership, Organization, Party, PartyDocument } from '../../src/types/k01.js';

type EntityKind = 'person' | 'organization' | 'membership' | 'document' | 'auditLog';
type Counts = Record<EntityKind, number>;

export interface ImportRejection {
  entity: EntityKind;
  id: string;
  reason: 'invalid' | 'conflict' | 'missing_reference';
}

export interface K01ImportResult {
  sourcePath: string;
  backupPath: string;
  source: Counts;
  inserted: Counts;
  skipped: Counts;
  rejected: ImportRejection[];
  destination: Counts;
}

const zeroCounts = (): Counts => ({ person: 0, organization: 0, membership: 0, document: 0, auditLog: 0 });
const partyTypes = new Set(['consumer', 'field_agent', 'internal_user', 'external_representative', 'retailer_owner', 'supplier_representative', 'platform_admin']);
const organizationTypes = new Set(['didar', 'retailer', 'manufacturer', 'wholesaler', 'supplier', 'agent_office', 'service_partner', 'other']);
const entityStatuses = new Set(['active', 'pending', 'suspended', 'archived']);
const verificationStatuses = new Set(['unverified', 'pending', 'verified', 'rejected']);
const documentTypes = new Set(['national_id_card', 'guild_license', 'company_registration', 'partnership_contract', 'tax_certificate', 'warranty_certificate', 'other']);
const auditActions = new Set(['create', 'update', 'status_change', 'document_upload', 'membership_link', 'suspend', 'archive']);
const auditTargetTypes = new Set(['party', 'organization', 'membership', 'document']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validDate(value: unknown): value is string {
  return validString(value) && !Number.isNaN(new Date(value).getTime());
}

function validatePerson(value: unknown): value is Party {
  return isRecord(value) && validString(value.id) && partyTypes.has(String(value.partyType)) &&
    typeof value.firstName === 'string' && typeof value.lastName === 'string' &&
    validString(value.mobile) && value.mobile.replace(/\D/g, '').length >= 10 &&
    entityStatuses.has(String(value.status)) && verificationStatuses.has(String(value.verificationStatus)) &&
    validDate(value.createdAt) && validDate(value.updatedAt) && Number.isInteger(value.version) && Number(value.version) > 0;
}

function validateOrganization(value: unknown): value is Organization {
  return isRecord(value) && validString(value.id) && validString(value.legalName) && validString(value.displayName) &&
    organizationTypes.has(String(value.organizationType)) && typeof value.phone === 'string' &&
    entityStatuses.has(String(value.status)) && verificationStatuses.has(String(value.verificationStatus)) &&
    validDate(value.createdAt) && validDate(value.updatedAt) &&
    Number.isInteger(value.version) && Number(value.version) > 0;
}

function validateMembership(value: unknown): value is Membership {
  return isRecord(value) && validString(value.id) && validString(value.partyId) && validString(value.organizationId) &&
    validString(value.roleKey) && validString(value.title) && Array.isArray(value.authorities) &&
    value.authorities.every((authority) => validString(authority)) &&
    typeof value.isPrimary === 'boolean' && entityStatuses.has(String(value.status)) && validDate(value.validFrom) &&
    (value.validTo === undefined || value.validTo === null || validDate(value.validTo)) &&
    (!validString(value.validTo) || String(value.validTo) >= String(value.validFrom)) &&
    validDate(value.createdAt) && validDate(value.updatedAt);
}

function validateDocument(value: unknown): value is PartyDocument {
  return isRecord(value) && validString(value.id) && (value.targetType === 'party' || value.targetType === 'organization') &&
    validString(value.targetId) && documentTypes.has(String(value.documentType)) && validString(value.fileName) &&
    Number.isInteger(value.fileSize) && Number(value.fileSize) >= 0 && validString(value.mimeType) &&
    verificationStatuses.has(String(value.verificationStatus)) && validString(value.uploadedBy) && validDate(value.createdAt);
}

function validateAudit(value: unknown): value is AuditEvent {
  return isRecord(value) && validString(value.id) && validString(value.actorId) && validString(value.actorName) &&
    auditActions.has(String(value.action)) && auditTargetTypes.has(String(value.targetType)) && validString(value.targetId) &&
    validString(value.description) && validDate(value.timestamp);
}

function normalized(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalized);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined && item !== null && item !== '')
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalized(item)])
    );
  }
  return value;
}

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(normalized(left)) === JSON.stringify(normalized(right));
}

function readSource(sourcePath: string): K01DataPayload {
  const parsed: unknown = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  if (!isRecord(parsed)) throw new Error('K01 import source must contain a JSON object.');
  for (const key of ['persons', 'organizations', 'memberships', 'documents', 'auditLogs']) {
    if (!Array.isArray(parsed[key])) throw new Error(`K01 import source is missing array: ${key}.`);
  }
  return parsed as unknown as K01DataPayload;
}

function createBackup(sourcePath: string, backupDirectory: string): string {
  fs.mkdirSync(backupDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDirectory, `${path.basename(sourcePath, '.json')}-${timestamp}.json`);
  fs.copyFileSync(sourcePath, backupPath, fs.constants.COPYFILE_EXCL);
  return backupPath;
}

export async function importK01Json(options: { sourcePath: string; backupDirectory: string }): Promise<K01ImportResult> {
  const sourcePath = path.resolve(options.sourcePath);
  const backupDirectory = path.resolve(options.backupDirectory);
  if (!fs.existsSync(sourcePath)) throw new Error(`K01 import source does not exist: ${sourcePath}`);
  const backupPath = createBackup(sourcePath, backupDirectory);
  const source = readSource(sourcePath);
  const sourceCounts: Counts = {
    person: source.persons.length,
    organization: source.organizations.length,
    membership: source.memberships.length,
    document: source.documents.length,
    auditLog: source.auditLogs.length
  };
  const inserted = zeroCounts();
  const skipped = zeroCounts();
  const rejected: ImportRejection[] = [];

  await withTransaction(async (transaction) => {
    const destination = await k01Repository.getPayload(transaction);
    const partiesById = new Map(destination.persons.map((record) => [record.id, record]));
    const partyMobile = new Map(destination.persons.map((record) => [record.mobile, record.id]));
    const partyNationalId = new Map(destination.persons.filter((record) => record.nationalId).map((record) => [record.nationalId!, record.id]));
    const organizationsById = new Map(destination.organizations.map((record) => [record.id, record]));
    const organizationNationalId = new Map(destination.organizations.filter((record) => record.nationalLegalId).map((record) => [record.nationalLegalId!, record.id]));
    const membershipsById = new Map(destination.memberships.map((record) => [record.id, record]));
    const documentsById = new Map(destination.documents.map((record) => [record.id, record]));
    const auditById = new Map(destination.auditLogs.map((record) => [record.id, record]));

    for (const candidate of source.persons) {
      const id = isRecord(candidate) && validString(candidate.id) ? candidate.id : '[missing-id]';
      if (!validatePerson(candidate)) { rejected.push({ entity: 'person', id, reason: 'invalid' }); continue; }
      const existing = partiesById.get(candidate.id);
      if (existing) {
        if (same(existing, candidate)) skipped.person += 1;
        else rejected.push({ entity: 'person', id, reason: 'conflict' });
        continue;
      }
      if ((partyMobile.has(candidate.mobile) && partyMobile.get(candidate.mobile) !== candidate.id) ||
          (candidate.nationalId && partyNationalId.has(candidate.nationalId) && partyNationalId.get(candidate.nationalId) !== candidate.id)) {
        rejected.push({ entity: 'person', id, reason: 'conflict' });
        continue;
      }
      const row = await k01Repository.insertParty({
        id: candidate.id, partyType: candidate.partyType, firstName: candidate.firstName, lastName: candidate.lastName,
        nationalId: candidate.nationalId || null, mobile: candidate.mobile.replace(/\D/g, ''), email: candidate.email || null,
        status: candidate.status, verificationStatus: candidate.verificationStatus, notes: candidate.notes || null,
        consumerProfile: candidate.consumerProfile, agentProfile: candidate.agentProfile, internalProfile: candidate.internalProfile,
        representativeProfile: candidate.representativeProfile, createdAt: new Date(candidate.createdAt),
        updatedAt: new Date(candidate.updatedAt), version: candidate.version
      }, transaction);
      const mapped = mapParty(row);
      partiesById.set(mapped.id, mapped); partyMobile.set(mapped.mobile, mapped.id);
      if (mapped.nationalId) partyNationalId.set(mapped.nationalId, mapped.id);
      inserted.person += 1;
    }

    for (const candidate of source.organizations) {
      const id = isRecord(candidate) && validString(candidate.id) ? candidate.id : '[missing-id]';
      if (!validateOrganization(candidate)) { rejected.push({ entity: 'organization', id, reason: 'invalid' }); continue; }
      const existing = organizationsById.get(candidate.id);
      if (existing) {
        if (same(existing, candidate)) skipped.organization += 1;
        else rejected.push({ entity: 'organization', id, reason: 'conflict' });
        continue;
      }
      if (candidate.nationalLegalId && organizationNationalId.has(candidate.nationalLegalId)) {
        rejected.push({ entity: 'organization', id, reason: 'conflict' }); continue;
      }
      const row = await k01Repository.insertOrganization({
        id: candidate.id, legalName: candidate.legalName, displayName: candidate.displayName,
        organizationType: candidate.organizationType, registrationNumber: candidate.registrationNumber || null,
        nationalLegalId: candidate.nationalLegalId || null, economicCode: candidate.economicCode || null,
        website: candidate.website || null, phone: candidate.phone, email: candidate.email || null,
        province: candidate.province || null, city: candidate.city || null, address: candidate.address || null,
        postalCode: candidate.postalCode || null, status: candidate.status, verificationStatus: candidate.verificationStatus,
        notes: candidate.notes || null, retailerProfile: candidate.retailerProfile,
        manufacturerProfile: candidate.manufacturerProfile, wholesalerProfile: candidate.wholesalerProfile,
        supplierProfile: candidate.supplierProfile, agentOfficeProfile: candidate.agentOfficeProfile,
        servicePartnerProfile: candidate.servicePartnerProfile, createdAt: new Date(candidate.createdAt),
        updatedAt: new Date(candidate.updatedAt), version: candidate.version
      }, transaction);
      const mapped = mapOrganization(row); organizationsById.set(mapped.id, mapped);
      if (mapped.nationalLegalId) organizationNationalId.set(mapped.nationalLegalId, mapped.id);
      inserted.organization += 1;
    }

    for (const candidate of source.memberships) {
      const id = isRecord(candidate) && validString(candidate.id) ? candidate.id : '[missing-id]';
      if (!validateMembership(candidate)) { rejected.push({ entity: 'membership', id, reason: 'invalid' }); continue; }
      const existing = membershipsById.get(candidate.id);
      if (existing) {
        if (same(existing, candidate)) skipped.membership += 1;
        else rejected.push({ entity: 'membership', id, reason: 'conflict' });
        continue;
      }
      if (!partiesById.has(candidate.partyId) || !organizationsById.has(candidate.organizationId)) {
        rejected.push({ entity: 'membership', id, reason: 'missing_reference' }); continue;
      }
      const row = await k01Repository.insertMembership({
        id: candidate.id, partyId: candidate.partyId, organizationId: candidate.organizationId,
        roleKey: candidate.roleKey, title: candidate.title, authorities: candidate.authorities,
        isPrimary: candidate.isPrimary, status: candidate.status, validFrom: candidate.validFrom,
        validTo: candidate.validTo, notes: candidate.notes || null, createdAt: new Date(candidate.createdAt),
        updatedAt: new Date(candidate.updatedAt)
      }, transaction);
      const mapped = mapMembership(row, candidate.partyName, candidate.organizationName);
      membershipsById.set(mapped.id, mapped); inserted.membership += 1;
    }

    for (const candidate of source.documents) {
      const id = isRecord(candidate) && validString(candidate.id) ? candidate.id : '[missing-id]';
      if (!validateDocument(candidate)) { rejected.push({ entity: 'document', id, reason: 'invalid' }); continue; }
      const existing = documentsById.get(candidate.id);
      if (existing) {
        if (same(existing, candidate)) skipped.document += 1;
        else rejected.push({ entity: 'document', id, reason: 'conflict' });
        continue;
      }
      const targetExists = candidate.targetType === 'party' ? partiesById.has(candidate.targetId) : organizationsById.has(candidate.targetId);
      if (!targetExists) { rejected.push({ entity: 'document', id, reason: 'missing_reference' }); continue; }
      const row = await k01Repository.insertDocument({
        id: candidate.id, targetType: candidate.targetType, targetId: candidate.targetId,
        documentType: candidate.documentType, fileName: candidate.fileName, fileSize: candidate.fileSize,
        mimeType: candidate.mimeType, fileUri: candidate.fileUri, verificationStatus: candidate.verificationStatus,
        uploadedBy: candidate.uploadedBy, notes: candidate.notes || null, createdAt: new Date(candidate.createdAt)
      }, transaction);
      const mapped = mapDocument(row); documentsById.set(mapped.id, mapped); inserted.document += 1;
    }

    for (const candidate of source.auditLogs) {
      const id = isRecord(candidate) && validString(candidate.id) ? candidate.id : '[missing-id]';
      if (!validateAudit(candidate)) { rejected.push({ entity: 'auditLog', id, reason: 'invalid' }); continue; }
      const existing = auditById.get(candidate.id);
      if (existing) {
        if (same(existing, candidate)) skipped.auditLog += 1;
        else rejected.push({ entity: 'auditLog', id, reason: 'conflict' });
        continue;
      }
      const row = await k01Repository.insertAudit({
        id: candidate.id, actorId: candidate.actorId, actorName: candidate.actorName,
        action: candidate.action, targetType: candidate.targetType, targetId: candidate.targetId,
        targetName: candidate.targetName, description: candidate.description, changes: candidate.changes,
        occurredAt: new Date(candidate.timestamp)
      }, transaction);
      const mapped = mapAuditEvent(row); auditById.set(mapped.id, mapped); inserted.auditLog += 1;
    }
  });

  const after = await k01Repository.getPayload();
  return {
    sourcePath,
    backupPath,
    source: sourceCounts,
    inserted,
    skipped,
    rejected,
    destination: {
      person: after.persons.length,
      organization: after.organizations.length,
      membership: after.memberships.length,
      document: after.documents.length,
      auditLog: after.auditLogs.length
    }
  };
}
