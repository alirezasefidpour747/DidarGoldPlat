import fs from 'fs';
import path from 'path';
import {
  RoleDefinition,
  PermissionDefinition,
  RoleAssignment,
  RolePolicyRevision,
  GrantAuthorityRule,
  EffectiveAccessResult,
  WorkContext
} from '../src/types/rbac.js';
import {
  CANONICAL_ROLES,
  CANONICAL_PERMISSIONS,
  DEFAULT_GRANT_AUTHORITY_RULES
} from '../src/data/rbacCatalog.js';
import { loadStore } from './storage.js';
import { k04Storage } from './storage-k04.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const RBAC_FILE = path.join(DATA_DIR, 'didar-rbac-store.json');

export interface RbacStoreData {
  roles: RoleDefinition[];
  permissions: PermissionDefinition[];
  assignments: RoleAssignment[];
  policyRevisions: RolePolicyRevision[];
  grantAuthorityRules: GrantAuthorityRule[];
}

let cachedRbacStore: RbacStoreData | null = null;

function getInitialRbacData(): RbacStoreData {
  const now = new Date().toISOString();

  // Initial canonical assignments mapped to existing initial members
  const initialAssignments: RoleAssignment[] = [
    {
      id: 'assign-admin-01',
      membershipId: 'mem-admin-didar-001',
      partyId: 'party-admin-001',
      organizationId: 'org-didar-core-001',
      roleKey: 'governance.identity_access_manager',
      scope: { type: 'global', ids: ['*'], labelFa: 'سراسری پلتفرم دیدار' },
      validFrom: '2023-01-01',
      validTo: '2028-12-31',
      reason: 'مدیر ارشد هویت، دسترسی و حکمرانی پلتفرم',
      status: 'active',
      version: 1,
      assignedByPartyId: 'system',
      assignedAt: now
    },
    {
      id: 'assign-owner-parnia-01',
      membershipId: 'mem-owner-parnia-002',
      partyId: 'party-owner-003',
      organizationId: 'org-ret-parnia-003',
      roleKey: 'retailer.account_manager',
      scope: { type: 'organization', ids: ['org-ret-parnia-003'], labelFa: 'گالری طلای پرنیا' },
      validFrom: '2023-05-01',
      validTo: '2027-05-01',
      reason: 'مالک و مدیر تجاری فروشگاه پرنیا',
      status: 'active',
      version: 1,
      assignedByPartyId: 'party-admin-001',
      assignedAt: now
    },
    {
      id: 'assign-agent-01',
      membershipId: 'mem-agent-didar-003',
      partyId: 'party-agent-002',
      organizationId: 'org-didar-core-001',
      roleKey: 'agent.ordering',
      scope: { type: 'territory', ids: ['ter-01'], labelFa: 'بازار بزرگ تهران و سبزه میدان' },
      validFrom: '2024-01-01',
      validTo: '2026-12-31',
      reason: 'عامل میدانی سفارش‌گیر به نمایندگی از خرده‌فروشان قلمرو',
      status: 'active',
      version: 1,
      assignedByPartyId: 'party-admin-001',
      assignedAt: now
    }
  ];

  return {
    roles: CANONICAL_ROLES,
    permissions: CANONICAL_PERMISSIONS,
    assignments: initialAssignments,
    policyRevisions: [],
    grantAuthorityRules: DEFAULT_GRANT_AUTHORITY_RULES
  };
}

export function loadRbacStore(): RbacStoreData {
  if (cachedRbacStore) {
    return cachedRbacStore;
  }

  if (fs.existsSync(RBAC_FILE)) {
    try {
      const raw = fs.readFileSync(RBAC_FILE, 'utf-8');
      cachedRbacStore = JSON.parse(raw);
      // Ensure all canonical roles exist if catalog expanded
      if (cachedRbacStore) {
        if (!cachedRbacStore.roles || cachedRbacStore.roles.length < CANONICAL_ROLES.length) {
          cachedRbacStore.roles = CANONICAL_ROLES;
        }
        if (!cachedRbacStore.permissions || cachedRbacStore.permissions.length === 0) {
          cachedRbacStore.permissions = CANONICAL_PERMISSIONS;
        }
        if (!cachedRbacStore.grantAuthorityRules || cachedRbacStore.grantAuthorityRules.length === 0) {
          cachedRbacStore.grantAuthorityRules = DEFAULT_GRANT_AUTHORITY_RULES;
        }
        return cachedRbacStore;
      }
    } catch (e) {
      console.error('[RBAC Storage] Failed to read store file, reinitializing with seed:', e);
    }
  }

  const initial = getInitialRbacData();
  saveRbacStore(initial);
  return initial;
}

export function saveRbacStore(data: RbacStoreData): void {
  cachedRbacStore = data;
  try {
    fs.writeFileSync(RBAC_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[RBAC Storage] Failed to write store file:', err);
  }
}

export class RbacService {
  /**
   * Get all 70 roles with metadata and search filters
   */
  static getRoles(filter?: { category?: string; targetEnvironment?: string; query?: string }): RoleDefinition[] {
    const store = loadRbacStore();
    let result = store.roles;

    if (filter?.category) {
      result = result.filter(r => r.category === filter.category);
    }
    if (filter?.targetEnvironment) {
      result = result.filter(r => r.targetEnvironment === filter.targetEnvironment);
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      result = result.filter(
        r =>
          r.roleKey.toLowerCase().includes(q) ||
          r.titleFa.includes(q) ||
          r.titleEn.toLowerCase().includes(q) ||
          r.analysisCode.toLowerCase().includes(q)
      );
    }

    return result;
  }

  static getRoleByKey(roleKey: string): RoleDefinition | undefined {
    const store = loadRbacStore();
    return store.roles.find(r => r.roleKey === roleKey);
  }

  /**
   * Get all permission definitions
   */
  static getPermissions(): PermissionDefinition[] {
    const store = loadRbacStore();
    return store.permissions;
  }

  /**
   * Get assignments with optional filters
   */
  static getAssignments(filter?: { partyId?: string; organizationId?: string; membershipId?: string }): RoleAssignment[] {
    const store = loadRbacStore();
    let result = store.assignments;

    if (filter?.partyId) {
      result = result.filter(a => a.partyId === filter.partyId);
    }
    if (filter?.organizationId) {
      result = result.filter(a => a.organizationId === filter.organizationId);
    }
    if (filter?.membershipId) {
      result = result.filter(a => a.membershipId === filter.membershipId);
    }

    return result;
  }

  /**
   * Request or Grant a role assignment
   * AT08/AT09: Validates GrantAuthority
   * AT11: Sensitive or internal roles create pending K04 approval requests
   */
  static requestRoleAssignment(params: {
    membershipId: string;
    roleKey: string;
    scope: { type: any; ids: string[]; labelFa?: string };
    validFrom?: string;
    validTo?: string | null;
    reason: string;
    expectedVersion?: number;
    actorPartyId: string;
    actorRoleKey: string;
  }): { assignment?: RoleAssignment; pendingApproval?: boolean; approvalRequestId?: string } {
    const rbacStore = loadRbacStore();
    const k01Store = loadStore();

    // 1. Verify Membership exists in K01
    const membership = k01Store.memberships.find(m => m.id === params.membershipId);
    if (!membership) {
      throw new Error('عضویت سازمانی مورد نظر در K01 یافت نشد.');
    }
    if (membership.status !== 'active') {
      throw new Error('عضویت هدف در وضعیت فعال قرار ندارد.');
    }

    // 2. Verify Role exists in catalog
    const roleDef = rbacStore.roles.find(r => r.roleKey === params.roleKey);
    if (!roleDef) {
      throw new Error(`نقش کاری ${params.roleKey} در کاتالوگ شناخته‌شده سامانه موجود نیست.`);
    }

    // 3. Grant Authority Check (AT08, AT09)
    // Rule: assigner must have a matching GrantAuthority rule
    const matchingRule = rbacStore.grantAuthorityRules.find(rule => {
      if (rule.assignerRoleKey !== params.actorRoleKey) return false;
      return rule.allowedAssignableRoles.includes(params.roleKey);
    });

    if (!matchingRule) {
      throw new Error(
        `شما با نقش فعلی (${params.actorRoleKey}) اختیار واگذاری نقش ${roleDef.titleFa} را ندارید. (نقض قاعده GrantAuthority)`
      );
    }

    // 4. Scope validation (AT28: Empty scope cannot be treated as all)
    if (!params.scope || !params.scope.type || !params.scope.ids || params.scope.ids.length === 0) {
      throw new Error('تعیین محدوده دسترسی (Scope) صریح و غیرخالی الزامی است. محدوده خالی به عنوان دسترسی کامل پذیرفته نمی‌شود.');
    }

    // 5. Retailer cannot grant Didar internal roles (AT09)
    if (params.actorRoleKey.startsWith('retailer.') && !params.roleKey.startsWith('retailer.')) {
      throw new Error('مدیر فروشگاه خرده‌فروشی مجاز به انتصاب نقش‌های داخلی دیدار یا سایر مجموعه‌ها نیست.');
    }

    const now = new Date().toISOString();
    const validFrom = params.validFrom || now;

    // 6. Check if approval required (K04 Four-Eyes Principle)
    const isSensitiveRole =
      roleDef.category === 'governance' ||
      roleDef.category === 'finance' ||
      matchingRule.requiresFourEyesApproval;

    const assignmentId = `assign-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (isSensitiveRole) {
      // Create Approval Request in K04
      const approvalReq = k04Storage.createApprovalRequest({
        category: 'kyc_tier_override', // Used as generalized administrative permission approval
        title: `درخواست انتصاب نقش حساس: ${roleDef.titleFa}`,
        description: `تخصیص نقش ${roleDef.titleFa} (${roleDef.roleKey}) به کاربر با دلیل: ${params.reason}`,
        urgency: 'high',
        goldWeightGrams: 0,
        goldPurityCarat: 750,
        financialValueIrr: 0,
        partyNameFa: membership.partyName || 'عضو سازمانی',
        initiatorId: params.actorPartyId,
        initiatorName: 'مقام واگذارکننده',
        initiatorRoleFa: params.actorRoleKey
      });

      const pendingAssignment: RoleAssignment = {
        id: assignmentId,
        membershipId: params.membershipId,
        partyId: membership.partyId,
        organizationId: membership.organizationId,
        roleKey: params.roleKey,
        scope: params.scope,
        validFrom,
        validTo: params.validTo || null,
        reason: params.reason,
        status: 'pending_approval',
        version: 1,
        approvalRequestId: approvalReq.id,
        assignedByPartyId: params.actorPartyId,
        assignedAt: now
      };

      rbacStore.assignments.push(pendingAssignment);
      saveRbacStore(rbacStore);

      // Audit Log
      k04Storage.logAudit({
        actorId: params.actorPartyId,
        actorName: 'مقام واگذارکننده',
        actorRoleFa: params.actorRoleKey,
        domainCode: 'K01',
        actionCode: 'ROLE_ASSIGNMENT_REQUESTED',
        actionTitleFa: 'درخواست انتصاب نقش سازمانی',
        targetEntity: 'role_assignment',
        targetId: assignmentId,
        severity: 'warning',
        details: {
          membershipId: params.membershipId,
          roleKey: params.roleKey,
          scope: params.scope,
          approvalRequestId: approvalReq.id,
          reason: params.reason
        }
      });

      return {
        assignment: pendingAssignment,
        pendingApproval: true,
        approvalRequestId: approvalReq.id
      };
    }

    // Direct active assignment
    const activeAssignment: RoleAssignment = {
      id: assignmentId,
      membershipId: params.membershipId,
      partyId: membership.partyId,
      organizationId: membership.organizationId,
      roleKey: params.roleKey,
      scope: params.scope,
      validFrom,
      validTo: params.validTo || null,
      reason: params.reason,
      status: 'active',
      version: 1,
      assignedByPartyId: params.actorPartyId,
      assignedAt: now
    };

    rbacStore.assignments.push(activeAssignment);
    saveRbacStore(rbacStore);

    // Audit Log
    k04Storage.logAudit({
      actorId: params.actorPartyId,
      actorName: 'مقام واگذارکننده',
      actorRoleFa: params.actorRoleKey,
      domainCode: 'K01',
      actionCode: 'ROLE_ASSIGNED_ACTIVE',
      actionTitleFa: 'انتصاب مستقیم نقش سازمانی',
      targetEntity: 'role_assignment',
      targetId: assignmentId,
      severity: 'info',
      details: {
        membershipId: params.membershipId,
        roleKey: params.roleKey,
        scope: params.scope,
        reason: params.reason
      }
    });

    return { assignment: activeAssignment, pendingApproval: false };
  }

  /**
   * Immediate revocation of role assignment (AT18, AT20)
   */
  static revokeRoleAssignment(assignmentId: string, actorPartyId: string, reason: string): RoleAssignment {
    const store = loadRbacStore();
    const index = store.assignments.findIndex(a => a.id === assignmentId);
    if (index === -1) {
      throw new Error('انتساب نقش مورد نظر یافت نشد.');
    }

    const assignment = store.assignments[index];
    if (assignment.status === 'revoked') {
      return assignment;
    }

    assignment.status = 'revoked';
    assignment.revokedAt = new Date().toISOString();
    assignment.revokedByPartyId = actorPartyId;
    assignment.revocationReason = reason;
    assignment.version += 1;

    store.assignments[index] = assignment;
    saveRbacStore(store);

    // Immediate immutable Audit Log
    k04Storage.logAudit({
      actorId: actorPartyId,
      actorName: 'مقام ابطال‌کننده',
      actorRoleFa: 'مدیر دسترسی',
      domainCode: 'K01',
      actionCode: 'ROLE_ASSIGNMENT_REVOKED',
      actionTitleFa: 'لغو و ابطال فوری انتساب نقش',
      targetEntity: 'role_assignment',
      targetId: assignmentId,
      severity: 'security',
      details: {
        roleKey: assignment.roleKey,
        membershipId: assignment.membershipId,
        partyId: assignment.partyId,
        reason
      }
    });

    return assignment;
  }

  /**
   * Apply approved K04 request to pending assignment
   */
  static applyApprovedAssignment(approvalRequestId: string, decision: 'approved' | 'rejected'): RoleAssignment | null {
    const store = loadRbacStore();
    const assignment = store.assignments.find(a => a.approvalRequestId === approvalRequestId);
    if (!assignment) return null;

    if (decision === 'approved') {
      assignment.status = 'active';
      assignment.version += 1;
    } else {
      assignment.status = 'revoked';
      assignment.revocationReason = 'رد درخواست در کارتابل اصل چهارچشم K04';
    }

    saveRbacStore(store);
    return assignment;
  }

  /**
   * Evaluate Effective Access (K02) for a given party within a specific WorkContext
   * Evaluates roleAssignments + rolePolicies + scope + expiration + membership status
   * Enforces AT03 (Multi-tenancy separation), AT06 (Scope separation: Read in A does not allow Approve in A),
   * AT18 (Expired/revoked assignments have zero effective access).
   */
  static evaluateEffectiveAccess(partyId: string, context: WorkContext): EffectiveAccessResult {
    const store = loadRbacStore();
    const k01Store = loadStore();
    const now = new Date();

    const explanations: string[] = [];

    // Check Party
    const person = k01Store.persons.find(p => p.id === partyId);
    if (!person) {
      return {
        partyId,
        context,
        roles: [],
        permissions: [],
        evaluatedAt: now.toISOString(),
        explanationFa: ['شخص مورد نظر در پایگاه هویت K01 یافت نشد. هیچ دسترسی صادر نمی‌گردد.']
      };
    }

    // If context is Personal
    if (context.contextType === 'personal') {
      const personalPerms = [
        'common.workspace.select',
        'k03.session.read_own',
        'k03.session.revoke_own',
        'k03.mfa.enroll_self'
      ];

      explanations.push('زمینه کاری شخصی فعال است: دسترسی صرفاً به پرونده و تنظیمات ورود خود شخص محدود است.');

      const perms = personalPerms.map(pKey => {
        const def = store.permissions.find(d => d.key === pKey);
        return {
          permissionKey: pKey,
          titleFa: def?.titleFa || pKey,
          domain: def?.domain || 'COMMON',
          grantedViaRoles: ['individual.member'],
          scope: { type: 'global' as const, ids: [partyId], labelFa: 'پرونده خود شخص' },
          isSensitive: def?.isSensitive || false
        };
      });

      return {
        partyId,
        context,
        roles: [
          {
            roleKey: 'individual.member',
            titleFa: 'عضو فردی',
            scope: { type: 'global', ids: [partyId], labelFa: 'پرونده خود شخص' },
            validFrom: person.createdAt
          }
        ],
        permissions: perms,
        evaluatedAt: now.toISOString(),
        explanationFa: explanations
      };
    }

    // Context is Organization
    const targetOrgId = context.organizationId;
    if (!targetOrgId) {
      return {
        partyId,
        context,
        roles: [],
        permissions: [],
        evaluatedAt: now.toISOString(),
        explanationFa: ['زمینه سازمانی بدون تعیین شناسه سازمان معتبر نیست. دسترسی رد شد.']
      };
    }

    // 1. Verify Active Membership in this specific Organization (AT03, AT04)
    const membership = k01Store.memberships.find(
      m => m.partyId === partyId && m.organizationId === targetOrgId && m.status === 'active'
    );

    if (!membership) {
      explanations.push(`شخص هیچ عضویت فعالی در سازمان هدف (${targetOrgId}) ندارد.`);
      return {
        partyId,
        context,
        roles: [],
        permissions: [],
        evaluatedAt: now.toISOString(),
        explanationFa: explanations
      };
    }

    // 2. Fetch Active Role Assignments for this Membership
    const activeAssignments = store.assignments.filter(a => {
      if (a.membershipId !== membership.id) return false;
      if (a.status !== 'active') return false;

      // Expiration check
      const fromDate = new Date(a.validFrom);
      if (now < fromDate) return false;
      if (a.validTo) {
        const toDate = new Date(a.validTo);
        if (now > toDate) return false;
      }
      return true;
    });

    if (activeAssignments.length === 0) {
      explanations.push('عضویت در این سازمان فعال است، اما هیچ نقش عملیاتی فعالی با تاریخ معتبر انتساب نیافته است.');
    }

    const rolesSummary = activeAssignments.map(a => {
      const def = store.roles.find(r => r.roleKey === a.roleKey);
      return {
        roleKey: a.roleKey,
        titleFa: def?.titleFa || a.roleKey,
        scope: a.scope,
        validFrom: a.validFrom,
        validTo: a.validTo
      };
    });

    // 3. Aggregate permissions strictly with their bound scopes (AT06)
    const permissionMap = new Map<
      string,
      {
        permissionKey: string;
        titleFa: string;
        domain: string;
        grantedViaRoles: string[];
        scope: any;
        isSensitive: boolean;
      }
    >();

    for (const assign of activeAssignments) {
      const roleDef = store.roles.find(r => r.roleKey === assign.roleKey);
      if (!roleDef) continue;

      for (const pKey of roleDef.defaultPermissions) {
        const permDef = store.permissions.find(p => p.key === pKey);
        if (!permDef) continue;

        if (permissionMap.has(pKey)) {
          const existing = permissionMap.get(pKey)!;
          if (!existing.grantedViaRoles.includes(assign.roleKey)) {
            existing.grantedViaRoles.push(assign.roleKey);
          }
        } else {
          permissionMap.set(pKey, {
            permissionKey: pKey,
            titleFa: permDef.titleFa,
            domain: permDef.domain,
            grantedViaRoles: [assign.roleKey],
            scope: assign.scope, // Scopes are bound to the specific assignment
            isSensitive: permDef.isSensitive
          });
        }
      }
    }

    explanations.push(
      `تعداد ${rolesSummary.length} نقش فعال در سازمان «${membership.organizationName || targetOrgId}» شناسایی شد.`,
      `تعداد ${permissionMap.size} مجوز عملیاتی معتبر بر اساس سیاست‌های ثبت‌شده محاسبه شد.`
    );

    return {
      partyId,
      context,
      roles: rolesSummary,
      permissions: Array.from(permissionMap.values()),
      evaluatedAt: now.toISOString(),
      explanationFa: explanations
    };
  }

  /**
   * Get all workspaces (personal + organizations) available to a user
   */
  static getUserAvailableWorkspaces(partyId: string): {
    personal: { partyId: string; name: string };
    organizations: {
      organizationId: string;
      displayName: string;
      membershipId: string;
      title: string;
      activeRoleCount: number;
    }[];
  } {
    const k01Store = loadStore();
    const rbacStore = loadRbacStore();
    const person = k01Store.persons.find(p => p.id === partyId);

    const userMemberships = k01Store.memberships.filter(
      m => m.partyId === partyId && m.status === 'active'
    );

    const orgs = userMemberships.map(m => {
      const org = k01Store.organizations.find(o => o.id === m.organizationId);
      const activeRoles = rbacStore.assignments.filter(
        a => a.membershipId === m.id && a.status === 'active'
      );
      return {
        organizationId: m.organizationId,
        displayName: org?.displayName || m.organizationName || m.organizationId,
        membershipId: m.id,
        title: m.title,
        activeRoleCount: activeRoles.length
      };
    });

    return {
      personal: {
        partyId,
        name: person ? `${person.firstName} ${person.lastName}` : 'فضای شخصی'
      },
      organizations: orgs
    };
  }
}
