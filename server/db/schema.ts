import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
  doublePrecision
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==========================================
// 1. DOMAIN K01: PARTIES & ORGANIZATIONS
// ==========================================

export const k01Persons = pgTable(
  'k01_persons',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    partyType: varchar('party_type', { length: 64 }).notNull(),
    firstName: varchar('first_name', { length: 128 }).notNull(),
    lastName: varchar('last_name', { length: 128 }).notNull(),
    nationalId: varchar('national_id', { length: 32 }),
    mobile: varchar('mobile', { length: 32 }).notNull().unique(),
    email: varchar('email', { length: 255 }),
    status: varchar('status', { length: 32 }).notNull().default('pending'),
    verificationStatus: varchar('verification_status', { length: 32 }).notNull().default('unverified'),
    notes: text('notes'),
    consumerProfile: jsonb('consumer_profile'),
    agentProfile: jsonb('agent_profile'),
    internalProfile: jsonb('internal_profile'),
    representativeProfile: jsonb('representative_profile'),
    version: integer('version').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_k01_persons_national_id').on(table.nationalId),
    index('idx_k01_persons_status').on(table.status),
    index('idx_k01_persons_party_type').on(table.partyType),
  ]
);

export const k01Organizations = pgTable(
  'k01_organizations',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    legalName: varchar('legal_name', { length: 255 }).notNull(),
    displayName: varchar('display_name', { length: 255 }).notNull(),
    organizationType: varchar('organization_type', { length: 64 }).notNull(),
    registrationNumber: varchar('registration_number', { length: 64 }),
    nationalLegalId: varchar('national_legal_id', { length: 64 }),
    economicCode: varchar('economic_code', { length: 64 }),
    website: varchar('website', { length: 255 }),
    phone: varchar('phone', { length: 64 }).notNull(),
    email: varchar('email', { length: 255 }),
    province: varchar('province', { length: 64 }),
    city: varchar('city', { length: 64 }),
    address: text('address'),
    postalCode: varchar('postal_code', { length: 32 }),
    status: varchar('status', { length: 32 }).notNull().default('pending'),
    verificationStatus: varchar('verification_status', { length: 32 }).notNull().default('unverified'),
    notes: text('notes'),
    retailerProfile: jsonb('retailer_profile'),
    manufacturerProfile: jsonb('manufacturer_profile'),
    wholesalerProfile: jsonb('wholesaler_profile'),
    supplierProfile: jsonb('supplier_profile'),
    agentOfficeProfile: jsonb('agent_office_profile'),
    servicePartnerProfile: jsonb('service_partner_profile'),
    version: integer('version').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_k01_orgs_national_legal_id').on(table.nationalLegalId),
    index('idx_k01_orgs_org_type').on(table.organizationType),
    index('idx_k01_orgs_status').on(table.status),
  ]
);

export const k01Memberships = pgTable(
  'k01_memberships',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    partyId: varchar('party_id', { length: 128 })
      .notNull()
      .references(() => k01Persons.id, { onDelete: 'cascade' }),
    organizationId: varchar('organization_id', { length: 128 })
      .notNull()
      .references(() => k01Organizations.id, { onDelete: 'cascade' }),
    roleKey: varchar('role_key', { length: 64 }).notNull(),
    title: varchar('title', { length: 128 }).notNull(),
    authorities: jsonb('authorities').notNull().default([]),
    isPrimary: boolean('is_primary').notNull().default(false),
    status: varchar('status', { length: 32 }).notNull().default('active'),
    validFrom: varchar('valid_from', { length: 32 }).notNull(),
    validTo: varchar('valid_to', { length: 32 }),
    notes: text('notes'),
    partyName: varchar('party_name', { length: 255 }),
    organizationName: varchar('organization_name', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_k01_memberships_party_org').on(table.partyId, table.organizationId),
    index('idx_k01_memberships_party').on(table.partyId),
    index('idx_k01_memberships_org').on(table.organizationId),
    index('idx_k01_memberships_status').on(table.status),
  ]
);

export const k01Documents = pgTable(
  'k01_documents',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    targetType: varchar('target_type', { length: 32 }).notNull(),
    targetId: varchar('target_id', { length: 128 }).notNull(),
    documentType: varchar('document_type', { length: 64 }).notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileSize: integer('file_size').notNull().default(0),
    mimeType: varchar('mime_type', { length: 128 }).notNull().default('application/pdf'),
    fileUri: text('file_uri'),
    verificationStatus: varchar('verification_status', { length: 32 }).notNull().default('pending'),
    uploadedBy: varchar('uploaded_by', { length: 128 }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_k01_documents_target').on(table.targetType, table.targetId),
  ]
);

export const k01AuditLogs = pgTable(
  'k01_audit_logs',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    actorId: varchar('actor_id', { length: 128 }).notNull(),
    actorName: varchar('actor_name', { length: 128 }).notNull(),
    action: varchar('action', { length: 64 }).notNull(),
    targetType: varchar('target_type', { length: 64 }).notNull(),
    targetId: varchar('target_id', { length: 128 }).notNull(),
    targetName: varchar('target_name', { length: 255 }),
    description: text('description').notNull(),
    changes: jsonb('changes'),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_k01_audit_actor').on(table.actorId),
    index('idx_k01_audit_target').on(table.targetType, table.targetId),
    index('idx_k01_audit_timestamp').on(table.timestamp),
  ]
);

// ==========================================
// 2. DOMAIN RBAC: CATALOG & ASSIGNMENTS
// ==========================================

export const rbacRoles = pgTable(
  'rbac_roles',
  {
    roleKey: varchar('role_key', { length: 128 }).primaryKey(),
    analysisCode: varchar('analysis_code', { length: 32 }).notNull(),
    titleFa: varchar('title_fa', { length: 255 }).notNull(),
    titleEn: varchar('title_en', { length: 255 }).notNull(),
    category: varchar('category', { length: 64 }).notNull(),
    targetEnvironment: varchar('target_environment', { length: 16 }).notNull(),
    mainBoundaryFa: text('main_boundary_fa').notNull(),
    lifecycle: varchar('lifecycle', { length: 32 }).notNull().default('active'),
    capabilityStatus: varchar('capability_status', { length: 32 }).notNull().default('verified'),
    isCatalogOnly: boolean('is_catalog_only').notNull().default(false),
    ownerStatus: varchar('owner_status', { length: 64 }).notNull().default('verified'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_rbac_roles_category').on(table.category),
    index('idx_rbac_roles_environment').on(table.targetEnvironment),
  ]
);

export const rbacPermissions = pgTable(
  'rbac_permissions',
  {
    key: varchar('key', { length: 128 }).primaryKey(),
    domain: varchar('domain', { length: 32 }).notNull(),
    action: varchar('action', { length: 32 }).notNull(),
    resource: varchar('resource', { length: 64 }).notNull(),
    titleFa: varchar('title_fa', { length: 255 }).notNull(),
    titleEn: varchar('title_en', { length: 255 }).notNull(),
    descriptionFa: text('description_fa').notNull(),
    isSensitive: boolean('is_sensitive').notNull().default(false),
    requiresMfa: boolean('requires_mfa').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_rbac_permissions_domain').on(table.domain),
    index('idx_rbac_permissions_resource').on(table.resource),
  ]
);

export const rbacRolePermissions = pgTable(
  'rbac_role_permissions',
  {
    roleKey: varchar('role_key', { length: 128 })
      .notNull()
      .references(() => rbacRoles.roleKey, { onDelete: 'cascade' }),
    permissionKey: varchar('permission_key', { length: 128 })
      .notNull()
      .references(() => rbacPermissions.key, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.roleKey, table.permissionKey] }),
    index('idx_rbac_rp_role').on(table.roleKey),
    index('idx_rbac_rp_permission').on(table.permissionKey),
  ]
);

export const rbacAssignments = pgTable(
  'rbac_assignments',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    membershipId: varchar('membership_id', { length: 128 })
      .notNull()
      .references(() => k01Memberships.id, { onDelete: 'cascade' }),
    partyId: varchar('party_id', { length: 128 })
      .notNull()
      .references(() => k01Persons.id, { onDelete: 'cascade' }),
    organizationId: varchar('organization_id', { length: 128 })
      .notNull()
      .references(() => k01Organizations.id, { onDelete: 'cascade' }),
    roleKey: varchar('role_key', { length: 128 })
      .notNull()
      .references(() => rbacRoles.roleKey, { onDelete: 'restrict' }),
    scopeType: varchar('scope_type', { length: 32 }).notNull(),
    scopeIds: jsonb('scope_ids').notNull().default([]),
    scopeLabelFa: varchar('scope_label_fa', { length: 255 }),
    validFrom: varchar('valid_from', { length: 32 }).notNull(),
    validTo: varchar('valid_to', { length: 32 }),
    reason: text('reason').notNull(),
    status: varchar('status', { length: 32 }).notNull().default('active'),
    version: integer('version').notNull().default(1),
    approvalRequestId: varchar('approval_request_id', { length: 128 }),
    assignedByPartyId: varchar('assigned_by_party_id', { length: 128 }).notNull(),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokedByPartyId: varchar('revoked_by_party_id', { length: 128 }),
    revocationReason: text('revocation_reason'),
  },
  (table) => [
    index('idx_rbac_assign_party').on(table.partyId),
    index('idx_rbac_assign_membership').on(table.membershipId),
    index('idx_rbac_assign_org').on(table.organizationId),
    index('idx_rbac_assign_role').on(table.roleKey),
    index('idx_rbac_assign_status').on(table.status),
  ]
);

export const rbacPolicyRevisions = pgTable(
  'rbac_policy_revisions',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    roleKey: varchar('role_key', { length: 128 })
      .notNull()
      .references(() => rbacRoles.roleKey, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    status: varchar('status', { length: 32 }).notNull().default('draft'),
    permissions: jsonb('permissions').notNull().default([]),
    proposerPartyId: varchar('proposer_party_id', { length: 128 }).notNull(),
    proposerName: varchar('proposer_name', { length: 128 }).notNull(),
    proposedAt: timestamp('proposed_at', { withTimezone: true }).notNull().defaultNow(),
    approverPartyId: varchar('approver_party_id', { length: 128 }),
    approverName: varchar('approver_name', { length: 128 }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    changelogNotes: text('changelog_notes').notNull(),
    affectedMembershipsCount: integer('affected_memberships_count').notNull().default(0),
  },
  (table) => [
    index('idx_rbac_policy_role').on(table.roleKey),
  ]
);

export const rbacGrantAuthorityRules = pgTable(
  'rbac_grant_authority_rules',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    assignerRoleKey: varchar('assigner_role_key', { length: 128 }).notNull(),
    targetOrganizationType: varchar('target_organization_type', { length: 64 }),
    allowedAssignableRoles: jsonb('allowed_assignable_roles').notNull().default([]),
    allowedScopeTypes: jsonb('allowed_scope_types').notNull().default([]),
    requiresFourEyesApproval: boolean('requires_four_eyes_approval').notNull().default(false),
    maxValidityDays: integer('max_validity_days'),
  },
  (table) => [
    index('idx_rbac_gar_assigner').on(table.assignerRoleKey),
  ]
);

// Relations
export const k01PersonsRelations = relations(k01Persons, ({ many }) => ({
  memberships: many(k01Memberships),
  assignments: many(rbacAssignments),
}));

export const k01OrganizationsRelations = relations(k01Organizations, ({ many }) => ({
  memberships: many(k01Memberships),
  assignments: many(rbacAssignments),
}));

export const k01MembershipsRelations = relations(k01Memberships, ({ one, many }) => ({
  person: one(k01Persons, {
    fields: [k01Memberships.partyId],
    references: [k01Persons.id],
  }),
  organization: one(k01Organizations, {
    fields: [k01Memberships.organizationId],
    references: [k01Organizations.id],
  }),
  assignments: many(rbacAssignments),
}));

export const rbacRolesRelations = relations(rbacRoles, ({ many }) => ({
  permissions: many(rbacRolePermissions),
  assignments: many(rbacAssignments),
  policyRevisions: many(rbacPolicyRevisions),
}));

export const rbacPermissionsRelations = relations(rbacPermissions, ({ many }) => ({
  roles: many(rbacRolePermissions),
}));

export const rbacAssignmentsRelations = relations(rbacAssignments, ({ one }) => ({
  person: one(k01Persons, {
    fields: [rbacAssignments.partyId],
    references: [k01Persons.id],
  }),
  organization: one(k01Organizations, {
    fields: [rbacAssignments.organizationId],
    references: [k01Organizations.id],
  }),
  membership: one(k01Memberships, {
    fields: [rbacAssignments.membershipId],
    references: [k01Memberships.id],
  }),
  role: one(rbacRoles, {
    fields: [rbacAssignments.roleKey],
    references: [rbacRoles.roleKey],
  }),
}));

// ==========================================
// 3. AUTH & SESSIONS
// ==========================================

export const authSessions = pgTable(
  'auth_sessions',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
    partyId: varchar('party_id', { length: 128 })
      .notNull()
      .references(() => k01Persons.id, { onDelete: 'cascade' }),
    organizationId: varchar('organization_id', { length: 128 })
      .notNull()
      .references(() => k01Organizations.id, { onDelete: 'cascade' }),
    roleKeys: jsonb('role_keys').notNull().default([]),
    permissions: jsonb('permissions').notNull().default([]),
    userAgent: text('user_agent'),
    ipAddress: varchar('ip_address', { length: 64 }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_auth_sessions_party').on(table.partyId),
    index('idx_auth_sessions_org').on(table.organizationId),
    index('idx_auth_sessions_token').on(table.tokenHash),
    index('idx_auth_sessions_expires').on(table.expiresAt),
  ]
);

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  person: one(k01Persons, {
    fields: [authSessions.partyId],
    references: [k01Persons.id],
  }),
  organization: one(k01Organizations, {
    fields: [authSessions.organizationId],
    references: [k01Organizations.id],
  }),
}));

export const authCredentials = pgTable(
  'auth_credentials',
  {
    partyId: varchar('party_id', { length: 128 })
      .primaryKey()
      .references(() => k01Persons.id, { onDelete: 'cascade' }),
    passwordHash: varchar('password_hash', { length: 256 }).notNull(),
    salt: varchar('salt', { length: 64 }).notNull(),
    status: varchar('status', { length: 32 }).notNull().default('active'),
    failedAttempts: integer('failed_attempts').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_auth_credentials_status').on(table.status),
  ]
);

export const authCredentialsRelations = relations(authCredentials, ({ one }) => ({
  person: one(k01Persons, {
    fields: [authCredentials.partyId],
    references: [k01Persons.id],
  }),
}));

export const authOtpCodes = pgTable(
  'auth_otp_codes',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    mobile: varchar('mobile', { length: 32 }).notNull(),
    codeHash: varchar('code_hash', { length: 128 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    consumed: boolean('consumed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_auth_otp_mobile').on(table.mobile),
    index('idx_auth_otp_expires').on(table.expiresAt),
  ]
);

// ==========================================
// 4. P01: PRODUCT CORE & TAXONOMY
// ==========================================

export const b2bCategories = pgTable(
  'b2b_categories',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    parentId: varchar('parent_id', { length: 128 }),
    level: integer('level').notNull(), // 1: Main Category, 2: Product Category, 3: Subcategory
    code: varchar('code', { length: 128 }).notNull().unique(),
    nameFa: varchar('name_fa', { length: 255 }).notNull(),
    nameEn: varchar('name_en', { length: 255 }),
    descriptionFa: text('description_fa'),
    imageUrl: text('image_url'),
    status: varchar('status', { length: 32 }).notNull().default('ACTIVE'), // ACTIVE, INACTIVE
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_b2b_categories_code').on(table.code),
    index('idx_b2b_categories_parent_id').on(table.parentId),
    index('idx_b2b_categories_level').on(table.level),
    index('idx_b2b_categories_status').on(table.status),
  ]
);

export const b2bCategoriesRelations = relations(b2bCategories, ({ one, many }) => ({
  parent: one(b2bCategories, {
    fields: [b2bCategories.parentId],
    references: [b2bCategories.id],
    relationName: 'categoryHierarchy',
  }),
  children: many(b2bCategories, {
    relationName: 'categoryHierarchy',
  }),
  products: many(b2bProducts),
}));

export const b2bProducts = pgTable(
  'b2b_products',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    subcategoryId: varchar('subcategory_id', { length: 128 })
      .notNull()
      .references(() => b2bCategories.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    productCode: varchar('product_code', { length: 64 }).notNull().unique(),
    description: text('description'),
    technicalDescription: text('technical_description'),
    primaryImage: text('primary_image'),
    gallery: jsonb('gallery').notNull().default('[]'),
    karat: integer('karat').notNull().default(18),
    material: varchar('material', { length: 64 }).notNull().default('gold'),
    status: varchar('status', { length: 32 }).notNull().default('DRAFT'), // DRAFT, SUBMITTED, CHANGES_REQUESTED, APPROVED, REJECTED, PUBLISHED, INACTIVE
    createdBy: varchar('created_by', { length: 128 }).notNull(),
    createdByOrgId: varchar('created_by_org_id', { length: 128 })
      .notNull()
      .references(() => k01Organizations.id, { onDelete: 'restrict' }),
    updatedBy: varchar('updated_by', { length: 128 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_b2b_products_slug').on(table.slug),
    uniqueIndex('idx_b2b_products_product_code').on(table.productCode),
    index('idx_b2b_products_subcategory_id').on(table.subcategoryId),
    index('idx_b2b_products_status').on(table.status),
    index('idx_b2b_products_created_by_org_id').on(table.createdByOrgId),
  ]
);

export const b2bProductsRelations = relations(b2bProducts, ({ one, many }) => ({
  subcategory: one(b2bCategories, {
    fields: [b2bProducts.subcategoryId],
    references: [b2bCategories.id],
  }),
  organization: one(k01Organizations, {
    fields: [b2bProducts.createdByOrgId],
    references: [k01Organizations.id],
  }),
  supplierOffers: many(b2bSupplierOffers),
  lifecycleHistory: many(b2bProductLifecycleHistory),
}));

export const b2bSupplierOffers = pgTable(
  'b2b_supplier_offers',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    productId: varchar('product_id', { length: 128 })
      .notNull()
      .references(() => b2bProducts.id, { onDelete: 'cascade' }),
    supplierId: varchar('supplier_id', { length: 128 })
      .notNull()
      .references(() => k01Organizations.id, { onDelete: 'restrict' }),
    supplierProductCode: varchar('supplier_product_code', { length: 128 }),
    weightType: varchar('weight_type', { length: 32 }).notNull(), // EXACT, RANGE
    weightMin: doublePrecision('weight_min'),
    weightMax: doublePrecision('weight_max'),
    exactWeight: doublePrecision('exact_weight'),
    makingFeeType: varchar('making_fee_type', { length: 32 }).notNull(), // PERCENT, RANGE_PERCENT, FIXED
    makingFeeValue: doublePrecision('making_fee_value'),
    makingFeeMin: doublePrecision('making_fee_min'),
    makingFeeMax: doublePrecision('making_fee_max'),
    availabilityType: varchar('availability_type', { length: 32 }).notNull().default('AVAILABLE'), // AVAILABLE, MADE_TO_ORDER, UNAVAILABLE
    leadTimeDays: integer('lead_time_days').notNull().default(0),
    status: varchar('status', { length: 32 }).notNull().default('ACTIVE'), // DRAFT, SUBMITTED, ACTIVE, INACTIVE, REJECTED
    createdBy: varchar('created_by', { length: 128 }).notNull(),
    updatedBy: varchar('updated_by', { length: 128 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_b2b_supplier_offers_product_id').on(table.productId),
    index('idx_b2b_supplier_offers_supplier_id').on(table.supplierId),
    index('idx_b2b_supplier_offers_status').on(table.status),
  ]
);

export const b2bSupplierOffersRelations = relations(b2bSupplierOffers, ({ one }) => ({
  product: one(b2bProducts, {
    fields: [b2bSupplierOffers.productId],
    references: [b2bProducts.id],
  }),
  supplier: one(k01Organizations, {
    fields: [b2bSupplierOffers.supplierId],
    references: [k01Organizations.id],
  }),
}));

export const b2bProductLifecycleHistory = pgTable(
  'b2b_product_lifecycle_history',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    productId: varchar('product_id', { length: 128 })
      .notNull()
      .references(() => b2bProducts.id, { onDelete: 'cascade' }),
    fromStatus: varchar('from_status', { length: 32 }).notNull(),
    toStatus: varchar('to_status', { length: 32 }).notNull(),
    changedBy: varchar('changed_by', { length: 128 }).notNull(),
    changedByOrgId: varchar('changed_by_org_id', { length: 128 }).notNull(),
    reason: text('reason'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_b2b_lifecycle_product_id').on(table.productId),
  ]
);

export const b2bProductAuditLogs = pgTable(
  'b2b_product_audit_logs',
  {
    id: varchar('id', { length: 128 }).primaryKey(),
    entityType: varchar('entity_type', { length: 64 }).notNull(), // PRODUCT, SUPPLIER_OFFER, TAXONOMY
    entityId: varchar('entity_id', { length: 128 }).notNull(),
    action: varchar('action', { length: 64 }).notNull(),
    actorId: varchar('actor_id', { length: 128 }).notNull(),
    actorOrgId: varchar('actor_org_id', { length: 128 }).notNull(),
    payload: jsonb('payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_b2b_product_audit_entity').on(table.entityType, table.entityId),
    index('idx_b2b_product_audit_actor').on(table.actorId),
  ]
);



