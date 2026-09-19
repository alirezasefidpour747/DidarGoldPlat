/**
 * Didar Gold Platform - Enterprise Role-Based Access Control (RBAC) & Kernel Access Specification
 * Document Reference: DIDAR-KERNEL-ACCESS-CHANGE-001
 * Covers: K01 (Identity & Assignments), K02 (Effective Access & Policies),
 * K03 (Sessions & Verified Context), K04 (Dual-Authorization & Auditing)
 */

export type RoleCategory =
  | 'individual'
  | 'retailer'
  | 'supplier'
  | 'agent'
  | 'operations'
  | 'warehouse'
  | 'finance'
  | 'service'
  | 'content'
  | 'communications'
  | 'governance';

export type RoleLifecycle = 'proposed' | 'configured' | 'approved' | 'active' | 'deprecated';

export type CapabilityStatus = 'not_present' | 'partial' | 'verified';

export type TargetEnvironment = 'X01' | 'X02' | 'X03' | 'X04' | 'X05';

export interface RoleDefinition {
  analysisCode: string;             // U01, B01, S01, A01, O01, W01, F01, C01, M01, G01...
  roleKey: string;                  // Namespaced, e.g., 'retailer.buyer', 'finance.pricing_operator'
  titleFa: string;
  titleEn: string;
  category: RoleCategory;
  targetEnvironment: TargetEnvironment;
  mainBoundaryFa: string;           // Descriptive security/operational boundary
  lifecycle: RoleLifecycle;
  capabilityStatus: CapabilityStatus;
  isCatalogOnly: boolean;           // True if proposed without verified live execution logic
  ownerStatus: string;              // Business owner or 'needs_decision'
  defaultPermissions: string[];     // Array of canonical permission keys (e.g. 'k01.membership.read')
}

export type ScopeType = 'global' | 'organization' | 'branch' | 'territory' | 'bag' | 'warehouse' | 'assigned_customer';

export interface AccessScope {
  type: ScopeType;
  ids: string[];                    // Array of entity IDs in scope
  labelFa?: string;
}

export interface RoleAssignment {
  id: string;
  membershipId: string;             // Linked to K01 Membership
  partyId: string;                  // Linked to K01 Person
  organizationId: string;           // Linked to K01 Organization
  roleKey: string;
  scope: AccessScope;
  validFrom: string;                // ISO Date
  validTo?: string | null;          // ISO Date or null (requires approved policy for open-ended)
  reason: string;
  status: 'active' | 'pending_approval' | 'suspended' | 'revoked' | 'expired';
  version: number;
  approvalRequestId?: string;       // Linked to K04 approval
  assignedByPartyId: string;
  assignedAt: string;
  revokedAt?: string;
  revokedByPartyId?: string;
  revocationReason?: string;
}

export interface PermissionDefinition {
  key: string;                      // Namespaced: e.g., 'k01.membership.read', 'k02.effective_access.read'
  domain: 'K01' | 'K02' | 'K03' | 'K04' | 'K05' | 'K10' | 'K11' | 'K12' | 'COMMON';
  action: 'read' | 'create' | 'update' | 'request' | 'approve' | 'revoke' | 'export' | 'manage';
  resource: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  isSensitive: boolean;             // If true, changes require K04 dual-approval
  requiresMfa: boolean;             // If true, requires verified step-up MFA
}

export interface WorkContext {
  contextType: 'personal' | 'organization';
  partyId: string;
  organizationId?: string;
  branchId?: string;
  activeRoleKeys: string[];
  membershipId?: string;
}

export interface EffectiveAccessResult {
  partyId: string;
  context: WorkContext;
  roles: {
    roleKey: string;
    titleFa: string;
    scope: AccessScope;
    validFrom: string;
    validTo?: string | null;
  }[];
  permissions: {
    permissionKey: string;
    titleFa: string;
    domain: string;
    grantedViaRoles: string[];
    scope: AccessScope;
    isSensitive: boolean;
  }[];
  evaluatedAt: string;
  explanationFa: string[];
}

export interface RolePolicyRevision {
  id: string;
  roleKey: string;
  version: number;
  status: 'draft' | 'proposed' | 'approved' | 'published' | 'superseded';
  permissions: string[];
  proposerPartyId: string;
  proposerName: string;
  proposedAt: string;
  approverPartyId?: string;
  approverName?: string;
  approvedAt?: string;
  changelogNotes: string;
  affectedMembershipsCount: number;
}

export interface GrantAuthorityRule {
  id: string;
  assignerRoleKey: string;          // Who is attempting to grant
  targetOrganizationType?: string;  // Allowed org type
  allowedAssignableRoles: string[]; // List of roleKeys they have authority to assign
  allowedScopeTypes: ScopeType[];
  requiresFourEyesApproval: boolean;
  maxValidityDays?: number;
}
