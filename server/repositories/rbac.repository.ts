/**
 * Didar Gold Platform - Domain RBAC PostgreSQL Repository
 * Type-safe data access layer for Roles, Permissions, Role-Permission mappings,
 * Assignments, Policy Revisions, and Grant Authority Rules.
 */

import { eq, and, sql, desc, inArray } from 'drizzle-orm';
import { getDatabase } from '../db/index.js';
import {
  rbacRoles,
  rbacPermissions,
  rbacRolePermissions,
  rbacAssignments,
  rbacPolicyRevisions,
  rbacGrantAuthorityRules,
  k01AuditLogs,
} from '../db/schema.js';
import {
  RoleDefinition,
  PermissionDefinition,
  RoleAssignment,
  RolePolicyRevision,
  GrantAuthorityRule,
} from '../../src/types/rbac.js';
import { AuditEvent } from '../../src/types/k01.js';

export class RbacRepository {
  // ==================== ROLES ====================

  static async getRoles(filters?: {
    category?: string;
    targetEnvironment?: string;
    query?: string;
  }): Promise<RoleDefinition[]> {
    const db = (await getDatabase()) as any;

    let query = db.select().from(rbacRoles);

    const conditions = [];
    if (filters?.category && filters.category !== 'all') {
      conditions.push(eq(rbacRoles.category, filters.category));
    }
    if (filters?.targetEnvironment && filters.targetEnvironment !== 'all') {
      conditions.push(eq(rbacRoles.targetEnvironment, filters.targetEnvironment));
    }
    if (filters?.query) {
      const q = `%${filters.query.toLowerCase()}%`;
      conditions.push(
        sql`(${rbacRoles.titleFa} ILIKE ${q} OR ${rbacRoles.titleEn} ILIKE ${q} OR ${rbacRoles.roleKey} ILIKE ${q} OR ${rbacRoles.analysisCode} ILIKE ${q})`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const rows = await query;
    if (rows.length === 0) return [];

    // Fetch permissions mapping for all retrieved roles
    const roleKeys = rows.map((r: any) => r.roleKey);
    const rolePerms = await db
      .select()
      .from(rbacRolePermissions)
      .where(inArray(rbacRolePermissions.roleKey, roleKeys));

    const permsMap = new Map<string, string[]>();
    for (const rp of rolePerms) {
      if (!permsMap.has(rp.roleKey)) {
        permsMap.set(rp.roleKey, []);
      }
      permsMap.get(rp.roleKey)!.push(rp.permissionKey);
    }

    return rows.map((row: any) => ({
      roleKey: row.roleKey,
      analysisCode: row.analysisCode,
      titleFa: row.titleFa,
      titleEn: row.titleEn,
      category: row.category,
      targetEnvironment: row.targetEnvironment,
      mainBoundaryFa: row.mainBoundaryFa,
      lifecycle: row.lifecycle,
      capabilityStatus: row.capabilityStatus,
      isCatalogOnly: row.isCatalogOnly,
      ownerStatus: row.ownerStatus,
      defaultPermissions: permsMap.get(row.roleKey) || [],
    }));
  }

  static async getRoleByKey(roleKey: string): Promise<RoleDefinition | null> {
    const db = (await getDatabase()) as any;
    const rows = await db.select().from(rbacRoles).where(eq(rbacRoles.roleKey, roleKey));
    if (rows.length === 0) return null;

    const row = rows[0];
    const rolePerms = await db
      .select()
      .from(rbacRolePermissions)
      .where(eq(rbacRolePermissions.roleKey, roleKey));

    return {
      roleKey: row.roleKey,
      analysisCode: row.analysisCode,
      titleFa: row.titleFa,
      titleEn: row.titleEn,
      category: row.category,
      targetEnvironment: row.targetEnvironment,
      mainBoundaryFa: row.mainBoundaryFa,
      lifecycle: row.lifecycle,
      capabilityStatus: row.capabilityStatus,
      isCatalogOnly: row.isCatalogOnly,
      ownerStatus: row.ownerStatus,
      defaultPermissions: rolePerms.map((rp: any) => rp.permissionKey),
    };
  }

  // ==================== PERMISSIONS ====================

  static async getPermissions(): Promise<PermissionDefinition[]> {
    const db = (await getDatabase()) as any;
    const rows = await db.select().from(rbacPermissions);
    return rows.map((r: any) => ({
      key: r.key,
      domain: r.domain,
      action: r.action,
      resource: r.resource,
      titleFa: r.titleFa,
      titleEn: r.titleEn,
      descriptionFa: r.descriptionFa,
      isSensitive: r.isSensitive,
      requiresMfa: r.requiresMfa,
    }));
  }

  static async getPermissionByKey(key: string): Promise<PermissionDefinition | null> {
    const db = (await getDatabase()) as any;
    const rows = await db.select().from(rbacPermissions).where(eq(rbacPermissions.key, key));
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      key: r.key,
      domain: r.domain,
      action: r.action,
      resource: r.resource,
      titleFa: r.titleFa,
      titleEn: r.titleEn,
      descriptionFa: r.descriptionFa,
      isSensitive: r.isSensitive,
      requiresMfa: r.requiresMfa,
    };
  }

  // ==================== ASSIGNMENTS ====================

  static async getAssignments(filters?: {
    partyId?: string;
    organizationId?: string;
    membershipId?: string;
    status?: string;
  }): Promise<RoleAssignment[]> {
    const db = (await getDatabase()) as any;
    let query = db.select().from(rbacAssignments);

    const conditions = [];
    if (filters?.partyId) conditions.push(eq(rbacAssignments.partyId, filters.partyId));
    if (filters?.organizationId) conditions.push(eq(rbacAssignments.organizationId, filters.organizationId));
    if (filters?.membershipId) conditions.push(eq(rbacAssignments.membershipId, filters.membershipId));
    if (filters?.status) conditions.push(eq(rbacAssignments.status, filters.status));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const rows = await query;
    return rows.map(this.mapAssignmentFromDb);
  }

  static async getAssignmentById(id: string): Promise<RoleAssignment | null> {
    const db = (await getDatabase()) as any;
    const rows = await db.select().from(rbacAssignments).where(eq(rbacAssignments.id, id));
    if (rows.length === 0) return null;
    return this.mapAssignmentFromDb(rows[0]);
  }

  static async createAssignment(assignment: RoleAssignment, audit?: AuditEvent): Promise<RoleAssignment> {
    const db = (await getDatabase()) as any;

    await db.transaction(async (tx: any) => {
      await tx.insert(rbacAssignments).values({
        id: assignment.id,
        membershipId: assignment.membershipId,
        partyId: assignment.partyId,
        organizationId: assignment.organizationId,
        roleKey: assignment.roleKey,
        scopeType: assignment.scope?.type || 'global',
        scopeIds: assignment.scope?.ids || ['*'],
        scopeLabelFa: assignment.scope?.labelFa || null,
        validFrom: assignment.validFrom,
        validTo: assignment.validTo || null,
        reason: assignment.reason,
        status: assignment.status || 'active',
        version: assignment.version || 1,
        approvalRequestId: assignment.approvalRequestId || null,
        assignedByPartyId: assignment.assignedByPartyId,
        assignedAt: new Date(assignment.assignedAt),
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

    const created = await this.getAssignmentById(assignment.id);
    return created!;
  }

  static async updateAssignment(id: string, updates: Partial<RoleAssignment>): Promise<RoleAssignment> {
    const db = (await getDatabase()) as any;
    const existing = await this.getAssignmentById(id);
    if (!existing) {
      throw new Error(`انتساب با شناسه ${id} یافت نشد.`);
    }

    const dbValues: Record<string, any> = {
      version: (existing.version || 1) + 1,
    };

    if (updates.status !== undefined) dbValues.status = updates.status;
    if (updates.validTo !== undefined) dbValues.validTo = updates.validTo;
    if (updates.roleKey !== undefined) dbValues.roleKey = updates.roleKey;
    if (updates.scope !== undefined) {
      dbValues.scopeType = updates.scope.type;
      dbValues.scopeIds = updates.scope.ids;
      dbValues.scopeLabelFa = updates.scope.labelFa;
    }
    if (updates.revokedAt !== undefined) dbValues.revokedAt = updates.revokedAt ? new Date(updates.revokedAt) : null;
    if (updates.revokedByPartyId !== undefined) dbValues.revokedByPartyId = updates.revokedByPartyId;
    if (updates.revocationReason !== undefined) dbValues.revocationReason = updates.revocationReason;

    await db.update(rbacAssignments).set(dbValues).where(eq(rbacAssignments.id, id));
    const updated = await this.getAssignmentById(id);
    return updated!;
  }

  static async revokeAssignment(id: string, actorPartyId: string, reason: string): Promise<RoleAssignment> {
    const db = (await getDatabase()) as any;
    const existing = await this.getAssignmentById(id);
    if (!existing) {
      throw new Error(`انتساب نقش با شناسه ${id} یافت نشد.`);
    }

    const now = new Date();
    const auditId = `audit-rbac-revoke-${Date.now()}`;

    await db.transaction(async (tx: any) => {
      await tx
        .update(rbacAssignments)
        .set({
          status: 'revoked',
          revokedAt: now,
          revokedByPartyId: actorPartyId,
          revocationReason: reason,
          version: (existing.version || 1) + 1,
        })
        .where(eq(rbacAssignments.id, id));

      await tx.insert(k01AuditLogs).values({
        id: auditId,
        actorId: actorPartyId,
        actorName: 'مسئول امنیت و دسترسی',
        action: 'REVOKE_ROLE_ASSIGNMENT',
        targetType: 'rbac_assignment',
        targetId: id,
        targetName: existing.roleKey,
        description: `لغو فوری انتساب نقش ${existing.roleKey}: ${reason}`,
        changes: { previousStatus: existing.status, newStatus: 'revoked', reason },
        timestamp: now,
      });
    });

    const updated = await this.getAssignmentById(id);
    return updated!;
  }

  // ==================== POLICY REVISIONS ====================

  static async getPolicyRevisions(roleKey?: string): Promise<RolePolicyRevision[]> {
    const db = (await getDatabase()) as any;
    let query = db.select().from(rbacPolicyRevisions).orderBy(desc(rbacPolicyRevisions.proposedAt));
    if (roleKey) {
      query = query.where(eq(rbacPolicyRevisions.roleKey, roleKey));
    }
    const rows = await query;
    return rows.map((r: any) => ({
      id: r.id,
      roleKey: r.roleKey,
      version: r.version,
      status: r.status,
      permissions: r.permissions || [],
      proposerPartyId: r.proposerPartyId,
      proposerName: r.proposerName,
      proposedAt: r.proposedAt instanceof Date ? r.proposedAt.toISOString() : String(r.proposedAt),
      approverPartyId: r.approverPartyId || undefined,
      approverName: r.approverName || undefined,
      approvedAt: r.approvedAt ? (r.approvedAt instanceof Date ? r.approvedAt.toISOString() : String(r.approvedAt)) : undefined,
      changelogNotes: r.changelogNotes,
      affectedMembershipsCount: r.affectedMembershipsCount,
    }));
  }

  static async createPolicyRevision(rev: RolePolicyRevision): Promise<RolePolicyRevision> {
    const db = (await getDatabase()) as any;
    await db.insert(rbacPolicyRevisions).values({
      id: rev.id,
      roleKey: rev.roleKey,
      version: rev.version,
      status: rev.status,
      permissions: rev.permissions || [],
      proposerPartyId: rev.proposerPartyId,
      proposerName: rev.proposerName,
      proposedAt: new Date(rev.proposedAt),
      approverPartyId: rev.approverPartyId || null,
      approverName: rev.approverName || null,
      approvedAt: rev.approvedAt ? new Date(rev.approvedAt) : null,
      changelogNotes: rev.changelogNotes,
      affectedMembershipsCount: rev.affectedMembershipsCount || 0,
    });
    return rev;
  }

  // ==================== GRANT AUTHORITY RULES ====================

  static async getGrantAuthorityRules(): Promise<GrantAuthorityRule[]> {
    const db = (await getDatabase()) as any;
    const rows = await db.select().from(rbacGrantAuthorityRules);
    return rows.map((r: any) => ({
      id: r.id,
      assignerRoleKey: r.assignerRoleKey,
      targetOrganizationType: r.targetOrganizationType || undefined,
      allowedAssignableRoles: r.allowedAssignableRoles || [],
      allowedScopeTypes: r.allowedScopeTypes || [],
      requiresFourEyesApproval: r.requiresFourEyesApproval,
      maxValidityDays: r.maxValidityDays || undefined,
    }));
  }

  // ==================== MAPPER ====================

  private static mapAssignmentFromDb(row: any): RoleAssignment {
    return {
      id: row.id,
      membershipId: row.membershipId,
      partyId: row.partyId,
      organizationId: row.organizationId,
      roleKey: row.roleKey,
      scope: {
        type: row.scopeType,
        ids: row.scopeIds || ['*'],
        labelFa: row.scopeLabelFa || undefined,
      },
      validFrom: row.validFrom,
      validTo: row.validTo || undefined,
      reason: row.reason,
      status: row.status,
      version: row.version,
      approvalRequestId: row.approvalRequestId || undefined,
      assignedByPartyId: row.assignedByPartyId,
      assignedAt: row.assignedAt instanceof Date ? row.assignedAt.toISOString() : String(row.assignedAt),
      revokedAt: row.revokedAt ? (row.revokedAt instanceof Date ? row.revokedAt.toISOString() : String(row.revokedAt)) : undefined,
      revokedByPartyId: row.revokedByPartyId || undefined,
      revocationReason: row.revocationReason || undefined,
    };
  }

  // ==================== INSTANCE PROXIES ====================

  async getFullRbacData() {
    const [roles, permissions, assignments, policyRevisions, grantAuthorityRules] = await Promise.all([
      RbacRepository.getRoles(),
      RbacRepository.getPermissions(),
      RbacRepository.getAssignments(),
      RbacRepository.getPolicyRevisions(),
      RbacRepository.getGrantAuthorityRules(),
    ]);
    return { roles, permissions, assignments, policyRevisions, grantAuthorityRules };
  }

  getRoles(filters?: { category?: string; targetEnvironment?: string; query?: string }) {
    return RbacRepository.getRoles(filters);
  }

  getPermissions() {
    return RbacRepository.getPermissions();
  }

  getAssignments(filters?: { partyId?: string; organizationId?: string; membershipId?: string }) {
    return RbacRepository.getAssignments(filters);
  }

  getUsers(): any[] {
    return [];
  }

  getUserById(id: string): any {
    return null;
  }

  getWorkspaces(partyId: string = 'party-admin-001'): any[] {
    return [];
  }

  getAuditLogs(): any[] {
    return [];
  }
}

export const rbacRepository = new RbacRepository();
