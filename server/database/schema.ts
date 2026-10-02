import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import type {
  AgentOfficeProfile,
  AuditEvent,
  ConsumerProfile,
  ExternalRepresentativeProfile,
  FieldAgentProfile,
  InternalUserProfile,
  ManufacturerProfile,
  RetailerProfile,
  ServicePartnerProfile,
  SupplierProfile,
  WholesalerProfile
} from '../../src/types/k01.js';

const entityStatusCheck = (column: { name: string }) =>
  sql.raw(`${column.name} in ('active', 'pending', 'suspended', 'archived')`);
const verificationStatusCheck = (column: { name: string }) =>
  sql.raw(`${column.name} in ('unverified', 'pending', 'verified', 'rejected')`);

export const k01Parties = pgTable(
  'k01_parties',
  {
    id: text('id').primaryKey().default(sql`'party-' || gen_random_uuid()::text`),
    partyType: text('party_type').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    nationalId: text('national_id'),
    mobile: text('mobile').notNull(),
    email: text('email'),
    status: text('status').notNull().default('pending'),
    verificationStatus: text('verification_status').notNull().default('unverified'),
    notes: text('notes'),
    consumerProfile: jsonb('consumer_profile').$type<ConsumerProfile>(),
    agentProfile: jsonb('agent_profile').$type<FieldAgentProfile>(),
    internalProfile: jsonb('internal_profile').$type<InternalUserProfile>(),
    representativeProfile: jsonb('representative_profile').$type<ExternalRepresentativeProfile>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    version: integer('version').notNull().default(1)
  },
  (table) => [
    check(
      'k01_parties_party_type_check',
      sql`${table.partyType} in ('consumer', 'field_agent', 'internal_user', 'external_representative', 'retailer_owner', 'supplier_representative', 'platform_admin')`
    ),
    check('k01_parties_status_check', entityStatusCheck(table.status)),
    check('k01_parties_verification_status_check', verificationStatusCheck(table.verificationStatus)),
    check('k01_parties_version_check', sql`${table.version} > 0`),
    check('k01_parties_mobile_check', sql`length(${table.mobile}) >= 10`),
    uniqueIndex('k01_parties_mobile_uidx').on(table.mobile),
    uniqueIndex('k01_parties_national_id_uidx')
      .on(table.nationalId)
      .where(sql`${table.nationalId} is not null and ${table.nationalId} <> ''`),
    index('k01_parties_status_idx').on(table.status),
    index('k01_parties_verification_status_idx').on(table.verificationStatus)
  ]
);

export const k01Organizations = pgTable(
  'k01_organizations',
  {
    id: text('id').primaryKey().default(sql`'org-' || gen_random_uuid()::text`),
    legalName: text('legal_name').notNull(),
    displayName: text('display_name').notNull(),
    organizationType: text('organization_type').notNull(),
    registrationNumber: text('registration_number'),
    nationalLegalId: text('national_legal_id'),
    economicCode: text('economic_code'),
    website: text('website'),
    phone: text('phone').notNull(),
    email: text('email'),
    province: text('province'),
    city: text('city'),
    address: text('address'),
    postalCode: text('postal_code'),
    status: text('status').notNull().default('pending'),
    verificationStatus: text('verification_status').notNull().default('unverified'),
    notes: text('notes'),
    retailerProfile: jsonb('retailer_profile').$type<RetailerProfile>(),
    manufacturerProfile: jsonb('manufacturer_profile').$type<ManufacturerProfile>(),
    wholesalerProfile: jsonb('wholesaler_profile').$type<WholesalerProfile>(),
    supplierProfile: jsonb('supplier_profile').$type<SupplierProfile>(),
    agentOfficeProfile: jsonb('agent_office_profile').$type<AgentOfficeProfile>(),
    servicePartnerProfile: jsonb('service_partner_profile').$type<ServicePartnerProfile>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    version: integer('version').notNull().default(1)
  },
  (table) => [
    check(
      'k01_organizations_type_check',
      sql`${table.organizationType} in ('didar', 'retailer', 'manufacturer', 'wholesaler', 'supplier', 'agent_office', 'service_partner', 'other')`
    ),
    check('k01_organizations_status_check', entityStatusCheck(table.status)),
    check('k01_organizations_verification_status_check', verificationStatusCheck(table.verificationStatus)),
    check('k01_organizations_version_check', sql`${table.version} > 0`),
    uniqueIndex('k01_organizations_national_legal_id_uidx')
      .on(table.nationalLegalId)
      .where(sql`${table.nationalLegalId} is not null and ${table.nationalLegalId} <> ''`),
    index('k01_organizations_status_idx').on(table.status),
    index('k01_organizations_verification_status_idx').on(table.verificationStatus)
  ]
);

export const k01Memberships = pgTable(
  'k01_memberships',
  {
    id: text('id').primaryKey().default(sql`'mem-' || gen_random_uuid()::text`),
    partyId: text('party_id')
      .notNull()
      .references(() => k01Parties.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    organizationId: text('organization_id')
      .notNull()
      .references(() => k01Organizations.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    roleKey: text('role_key').notNull(),
    title: text('title').notNull(),
    authorities: text('authorities').array().notNull().default(sql`'{}'::text[]`),
    isPrimary: boolean('is_primary').notNull().default(false),
    status: text('status').notNull().default('active'),
    validFrom: date('valid_from', { mode: 'string' }).notNull(),
    validTo: date('valid_to', { mode: 'string' }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    check('k01_memberships_status_check', entityStatusCheck(table.status)),
    check(
      'k01_memberships_date_range_check',
      sql`${table.validTo} is null or ${table.validTo} >= ${table.validFrom}`
    ),
    index('k01_memberships_party_id_idx').on(table.partyId),
    index('k01_memberships_organization_id_idx').on(table.organizationId),
    index('k01_memberships_party_organization_idx').on(table.partyId, table.organizationId),
    index('k01_memberships_status_idx').on(table.status)
  ]
);

export const k01Documents = pgTable(
  'k01_documents',
  {
    id: text('id').primaryKey().default(sql`'doc-' || gen_random_uuid()::text`),
    targetType: text('target_type').notNull(),
    targetId: text('target_id').notNull(),
    documentType: text('document_type').notNull(),
    fileName: text('file_name').notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: text('mime_type').notNull(),
    fileUri: text('file_uri'),
    verificationStatus: text('verification_status').notNull().default('pending'),
    uploadedBy: text('uploaded_by').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    check('k01_documents_target_type_check', sql`${table.targetType} in ('party', 'organization')`),
    check(
      'k01_documents_document_type_check',
      sql`${table.documentType} in ('national_id_card', 'guild_license', 'company_registration', 'partnership_contract', 'tax_certificate', 'warranty_certificate', 'other')`
    ),
    check('k01_documents_verification_status_check', verificationStatusCheck(table.verificationStatus)),
    check('k01_documents_file_size_check', sql`${table.fileSize} >= 0`),
    index('k01_documents_target_idx').on(table.targetType, table.targetId),
    index('k01_documents_verification_status_idx').on(table.verificationStatus)
  ]
);

export const k01AuditEvents = pgTable(
  'k01_audit_events',
  {
    id: text('id').primaryKey().default(sql`'audit-' || gen_random_uuid()::text`),
    actorId: text('actor_id').notNull(),
    actorName: text('actor_name').notNull(),
    action: text('action').notNull(),
    targetType: text('target_type').notNull(),
    targetId: text('target_id').notNull(),
    targetName: text('target_name'),
    description: text('description').notNull(),
    changes: jsonb('changes').$type<AuditEvent['changes']>(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    check(
      'k01_audit_events_action_check',
      sql`${table.action} in ('create', 'update', 'status_change', 'document_upload', 'membership_link', 'suspend', 'archive')`
    ),
    check(
      'k01_audit_events_target_type_check',
      sql`${table.targetType} in ('party', 'organization', 'membership', 'document')`
    ),
    index('k01_audit_events_target_idx').on(table.targetType, table.targetId),
    index('k01_audit_events_occurred_at_idx').on(table.occurredAt)
  ]
);

export type K01PartyRow = typeof k01Parties.$inferSelect;
export type K01OrganizationRow = typeof k01Organizations.$inferSelect;
export type K01MembershipRow = typeof k01Memberships.$inferSelect;
export type K01DocumentRow = typeof k01Documents.$inferSelect;
export type K01AuditEventRow = typeof k01AuditEvents.$inferSelect;
