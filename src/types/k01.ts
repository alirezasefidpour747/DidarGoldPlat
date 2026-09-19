/**
 * Didar Gold Platform - Domain K01 Types
 * People, Organizations, Memberships, Documents & Audit Log
 */

export type PartyType =
  | 'consumer'
  | 'field_agent'
  | 'internal_user'
  | 'external_representative'
  | 'retailer_owner'
  | 'supplier_representative'
  | 'platform_admin';

export type OrganizationType =
  | 'didar'
  | 'retailer'
  | 'manufacturer'
  | 'wholesaler'
  | 'supplier'
  | 'agent_office'
  | 'service_partner'
  | 'other';

export type EntityStatus = 'active' | 'pending' | 'suspended' | 'archived';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type MembershipRoleKey =
  | 'owner'
  | 'manager'
  | 'authorized_signatory'
  | 'retailer_owner'
  | 'supplier_representative'
  | 'staff'
  | 'sales'
  | 'accountant'
  | 'agent'
  | 'operator'
  | 'service_contact'
  | 'other'
  | (string & {});

export type MembershipAuthority =
  | 'can_order'
  | 'can_sign'
  | 'can_manage_members'
  | 'can_view_finance';

export type OperatingMode = 'mobile_gallery' | 'assisted_order' | 'hybrid';

export type EmploymentType = 'employed' | 'contractor' | 'partner';

export type StoreType = 'boutique' | 'gallery' | 'mall_store' | 'online';

export type ServiceSpecialty = 'repair' | 'stone_setting' | 'qc_assay' | 'polishing';

export type DocumentType =
  | 'national_id_card'
  | 'guild_license'
  | 'company_registration'
  | 'partnership_contract'
  | 'tax_certificate'
  | 'warranty_certificate'
  | 'other';

// Specialized Profiles for Persons
export interface ConsumerProfile {
  birthDate?: string;
  preferredContactMethod?: 'sms' | 'call' | 'whatsapp';
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export interface FieldAgentProfile {
  agentCode: string;
  operatingMode: OperatingMode;
  territory: string;
  supervisorId?: string;
  employmentType: EmploymentType;
  commissionRatePercent?: number;
  startDate?: string;
}

export interface InternalUserProfile {
  personnelCode: string;
  department: string;
  jobTitle: string;
  employmentType: EmploymentType;
  startDate?: string;
}

export interface ExternalRepresentativeProfile {
  organizationId?: string;
  title: string;
  authorityScope: string;
  validUntil?: string;
}

export interface Party {
  id: string;
  partyType: PartyType;
  firstName: string;
  lastName: string;
  nationalId?: string;
  mobile: string;
  email?: string;
  status: EntityStatus;
  verificationStatus: VerificationStatus;
  notes?: string;
  consumerProfile?: ConsumerProfile;
  agentProfile?: FieldAgentProfile;
  internalProfile?: InternalUserProfile;
  representativeProfile?: ExternalRepresentativeProfile;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Specialized Profiles for Organizations
export interface RetailerProfile {
  retailerCode: string;
  guildLicenseNumber: string;
  guildUnionName?: string;
  storeType: StoreType;
  salesChannels?: string[];
  storefrontAddress?: string;
  displayCapacityPieces?: number;
}

export interface ManufacturerProfile {
  supplierCode: string;
  brandName: string;
  productionLicenseNumber: string;
  productCategories: string;
  monthlyCapacityGrams: number;
  workshopAddress?: string;
  purityStandards?: string[];
}

export interface WholesalerProfile {
  supplierCode: string;
  brandName: string;
  licenseNumber?: string;
  productCategories: string;
  coverageTerritory: string;
  warehouseAddress?: string;
  goldInventoryCapacityGrams?: number;
}

export interface SupplierProfile {
  supplierCode: string;
  supplyType: string;
  description?: string;
}

export interface AgentOfficeProfile {
  officeCode: string;
  jurisdictionTerritory: string;
  assignedAgentsCount?: number;
  managerName?: string;
}

export interface ServicePartnerProfile {
  partnerCode: string;
  serviceSpecialty: ServiceSpecialty;
  certificationNumber?: string;
  workshopAddress?: string;
}

export interface Organization {
  id: string;
  legalName: string;
  displayName: string;
  organizationType: OrganizationType;
  registrationNumber?: string;
  nationalLegalId?: string;
  economicCode?: string;
  website?: string;
  phone: string;
  email?: string;
  province?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  status: EntityStatus;
  verificationStatus: VerificationStatus;
  notes?: string;
  retailerProfile?: RetailerProfile;
  manufacturerProfile?: ManufacturerProfile;
  wholesalerProfile?: WholesalerProfile;
  supplierProfile?: SupplierProfile;
  agentOfficeProfile?: AgentOfficeProfile;
  servicePartnerProfile?: ServicePartnerProfile;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Membership {
  id: string;
  partyId: string;
  organizationId: string;
  roleKey: MembershipRoleKey;
  title: string;
  authorities: MembershipAuthority[];
  isPrimary: boolean;
  status: EntityStatus;
  validFrom: string;
  validTo?: string;
  notes?: string;
  partyName?: string;
  organizationName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartyDocument {
  id: string;
  targetType: 'party' | 'organization';
  targetId: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUri?: string;
  verificationStatus: VerificationStatus;
  uploadedBy: string;
  notes?: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  action: 'create' | 'update' | 'status_change' | 'document_upload' | 'membership_link' | 'suspend' | 'archive';
  targetType: 'party' | 'organization' | 'membership' | 'document';
  targetId: string;
  targetName?: string;
  description: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  timestamp: string;
}

export interface K01DataPayload {
  persons: Party[];
  organizations: Organization[];
  memberships: Membership[];
  documents: PartyDocument[];
  auditLogs: AuditEvent[];
  counts: {
    totalPersons: number;
    totalOrganizations: number;
    totalMemberships: number;
    activePersons: number;
    activeOrganizations: number;
    verifiedPersons: number;
    verifiedOrganizations: number;
  };
}
