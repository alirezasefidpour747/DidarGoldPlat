/**
 * Didar Gold Platform - Idempotent Data Importer
 * Migrates K01 & RBAC stores from JSON to PostgreSQL.
 * Fully idempotent with duplicate-prevention, pre/post audit counts, and error tracking.
 */

import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';
import { getDatabase } from './index.js';
import * as schema from './schema.js';
import {
  k01Persons,
  k01Organizations,
  k01Memberships,
  k01Documents,
  k01AuditLogs,
  rbacRoles,
  rbacPermissions,
  rbacRolePermissions,
  rbacAssignments,
  rbacPolicyRevisions,
  rbacGrantAuthorityRules,
} from './schema.js';

export interface ImportReport {
  timestamp: string;
  k01: {
    file: string;
    preCounts: { persons: number; organizations: number; memberships: number; documents: number; auditLogs: number };
    importedCounts: { persons: number; organizations: number; memberships: number; documents: number; auditLogs: number };
    postCounts: { persons: number; organizations: number; memberships: number; documents: number; auditLogs: number };
    skippedOrInvalid: { resource: string; id: string; reason: string }[];
  };
  rbac: {
    file: string;
    preCounts: { roles: number; permissions: number; rolePermissions: number; assignments: number; policyRevisions: number; grantAuthorityRules: number };
    importedCounts: { roles: number; permissions: number; rolePermissions: number; assignments: number; policyRevisions: number; grantAuthorityRules: number };
    postCounts: { roles: number; permissions: number; rolePermissions: number; assignments: number; policyRevisions: number; grantAuthorityRules: number };
    skippedOrInvalid: { resource: string; id: string; reason: string }[];
  };
}

export async function importData(): Promise<ImportReport> {
  const db = await getDatabase();
  const dataDir = path.join(process.cwd(), 'data');
  const k01File = path.join(dataDir, 'didar-kernel-store.json');
  const rbacFile = path.join(dataDir, 'didar-rbac-store.json');

  const report: ImportReport = {
    timestamp: new Date().toISOString(),
    k01: {
      file: k01File,
      preCounts: { persons: 0, organizations: 0, memberships: 0, documents: 0, auditLogs: 0 },
      importedCounts: { persons: 0, organizations: 0, memberships: 0, documents: 0, auditLogs: 0 },
      postCounts: { persons: 0, organizations: 0, memberships: 0, documents: 0, auditLogs: 0 },
      skippedOrInvalid: [],
    },
    rbac: {
      file: rbacFile,
      preCounts: { roles: 0, permissions: 0, rolePermissions: 0, assignments: 0, policyRevisions: 0, grantAuthorityRules: 0 },
      importedCounts: { roles: 0, permissions: 0, rolePermissions: 0, assignments: 0, policyRevisions: 0, grantAuthorityRules: 0 },
      postCounts: { roles: 0, permissions: 0, rolePermissions: 0, assignments: 0, policyRevisions: 0, grantAuthorityRules: 0 },
      skippedOrInvalid: [],
    },
  };

  // Helper to count rows
  const countTable = async (table: any): Promise<number> => {
    const res = await (db as any).select({ count: sql<number>`count(*)::int` }).from(table);
    return res[0]?.count ?? 0;
  };

  // 1. Pre-counts
  report.k01.preCounts.persons = await countTable(k01Persons);
  report.k01.preCounts.organizations = await countTable(k01Organizations);
  report.k01.preCounts.memberships = await countTable(k01Memberships);
  report.k01.preCounts.documents = await countTable(k01Documents);
  report.k01.preCounts.auditLogs = await countTable(k01AuditLogs);

  report.rbac.preCounts.roles = await countTable(rbacRoles);
  report.rbac.preCounts.permissions = await countTable(rbacPermissions);
  report.rbac.preCounts.rolePermissions = await countTable(rbacRolePermissions);
  report.rbac.preCounts.assignments = await countTable(rbacAssignments);
  report.rbac.preCounts.policyRevisions = await countTable(rbacPolicyRevisions);
  report.rbac.preCounts.grantAuthorityRules = await countTable(rbacGrantAuthorityRules);

  let rawK01: any = null;

  // 2. Import K01 Data
  if (fs.existsSync(k01File)) {
    rawK01 = JSON.parse(fs.readFileSync(k01File, 'utf-8'));

    // Persons
    for (const p of rawK01.persons || []) {
      try {
        if (!p.id || !p.mobile) {
          report.k01.skippedOrInvalid.push({ resource: 'person', id: p.id || 'unknown', reason: 'Missing id or mobile' });
          continue;
        }
        await (db as any).insert(k01Persons).values({
          id: p.id,
          partyType: p.partyType || 'consumer',
          firstName: p.firstName,
          lastName: p.lastName,
          nationalId: p.nationalId || null,
          mobile: p.mobile,
          email: p.email || null,
          status: p.status || 'pending',
          verificationStatus: p.verificationStatus || 'unverified',
          notes: p.notes || null,
          consumerProfile: p.consumerProfile || null,
          agentProfile: p.agentProfile || null,
          internalProfile: p.internalProfile || null,
          representativeProfile: p.representativeProfile || null,
          version: p.version || 1,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        }).onConflictDoUpdate({
          target: k01Persons.id,
          set: {
            firstName: p.firstName,
            lastName: p.lastName,
            status: p.status,
            verificationStatus: p.verificationStatus,
            consumerProfile: p.consumerProfile || null,
            agentProfile: p.agentProfile || null,
            internalProfile: p.internalProfile || null,
            representativeProfile: p.representativeProfile || null,
            version: p.version || 1,
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          },
        });
        report.k01.importedCounts.persons++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        report.k01.skippedOrInvalid.push({ resource: 'person', id: p.id, reason: msg });
      }
    }

    // Organizations
    for (const org of rawK01.organizations || []) {
      try {
        if (!org.id || !org.legalName) {
          report.k01.skippedOrInvalid.push({ resource: 'organization', id: org.id || 'unknown', reason: 'Missing id or legalName' });
          continue;
        }
        await (db as any).insert(k01Organizations).values({
          id: org.id,
          legalName: org.legalName,
          displayName: org.displayName || org.legalName,
          organizationType: org.organizationType || 'other',
          registrationNumber: org.registrationNumber || null,
          nationalLegalId: org.nationalLegalId || null,
          economicCode: org.economicCode || null,
          website: org.website || null,
          phone: org.phone || '',
          email: org.email || null,
          province: org.province || null,
          city: org.city || null,
          address: org.address || null,
          postalCode: org.postalCode || null,
          status: org.status || 'pending',
          verificationStatus: org.verificationStatus || 'unverified',
          notes: org.notes || null,
          retailerProfile: org.retailerProfile || null,
          manufacturerProfile: org.manufacturerProfile || null,
          wholesalerProfile: org.wholesalerProfile || null,
          supplierProfile: org.supplierProfile || null,
          agentOfficeProfile: org.agentOfficeProfile || null,
          servicePartnerProfile: org.servicePartnerProfile || null,
          version: org.version || 1,
          createdAt: org.createdAt ? new Date(org.createdAt) : new Date(),
          updatedAt: org.updatedAt ? new Date(org.updatedAt) : new Date(),
        }).onConflictDoUpdate({
          target: k01Organizations.id,
          set: {
            legalName: org.legalName,
            displayName: org.displayName || org.legalName,
            status: org.status,
            verificationStatus: org.verificationStatus,
            phone: org.phone,
            address: org.address,
            version: org.version || 1,
            updatedAt: org.updatedAt ? new Date(org.updatedAt) : new Date(),
          },
        });
        report.k01.importedCounts.organizations++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        report.k01.skippedOrInvalid.push({ resource: 'organization', id: org.id, reason: msg });
      }
    }

    // Memberships
    for (const mem of rawK01.memberships || []) {
      try {
        if (!mem.id || !mem.partyId || !mem.organizationId) {
          report.k01.skippedOrInvalid.push({ resource: 'membership', id: mem.id || 'unknown', reason: 'Missing id, partyId or organizationId' });
          continue;
        }
        await (db as any).insert(k01Memberships).values({
          id: mem.id,
          partyId: mem.partyId,
          organizationId: mem.organizationId,
          roleKey: mem.roleKey || 'member',
          title: mem.title || 'عضو',
          authorities: mem.authorities || [],
          isPrimary: Boolean(mem.isPrimary),
          status: mem.status || 'active',
          validFrom: mem.validFrom || new Date().toISOString().split('T')[0],
          validTo: mem.validTo || null,
          notes: mem.notes || null,
          partyName: mem.partyName || null,
          organizationName: mem.organizationName || null,
          createdAt: mem.createdAt ? new Date(mem.createdAt) : new Date(),
          updatedAt: mem.updatedAt ? new Date(mem.updatedAt) : new Date(),
        }).onConflictDoUpdate({
          target: k01Memberships.id,
          set: {
            roleKey: mem.roleKey,
            title: mem.title,
            status: mem.status,
            authorities: mem.authorities || [],
            isPrimary: Boolean(mem.isPrimary),
            updatedAt: mem.updatedAt ? new Date(mem.updatedAt) : new Date(),
          },
        });
        report.k01.importedCounts.memberships++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        report.k01.skippedOrInvalid.push({ resource: 'membership', id: mem.id, reason: msg });
      }
    }

    // Documents
    for (const doc of rawK01.documents || []) {
      try {
        await (db as any).insert(k01Documents).values({
          id: doc.id,
          targetType: doc.targetType || 'party',
          targetId: doc.targetId,
          documentType: doc.documentType,
          fileName: doc.fileName,
          fileSize: doc.fileSize || 0,
          mimeType: doc.mimeType || 'application/pdf',
          fileUri: doc.fileUri || null,
          verificationStatus: doc.verificationStatus || 'pending',
          uploadedBy: doc.uploadedBy || 'system',
          notes: doc.notes || null,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
        }).onConflictDoNothing();
        report.k01.importedCounts.documents++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        report.k01.skippedOrInvalid.push({ resource: 'document', id: doc.id, reason: msg });
      }
    }

    // Audit Logs
    for (const log of rawK01.auditLogs || []) {
      try {
        await (db as any).insert(k01AuditLogs).values({
          id: log.id,
          actorId: log.actorId || 'system',
          actorName: log.actorName || 'سیستم',
          action: log.action || 'UNKNOWN',
          targetType: log.targetType || 'entity',
          targetId: log.targetId || 'unknown',
          targetName: log.targetName || null,
          description: log.description || '',
          changes: log.changes || null,
          timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
        }).onConflictDoNothing();
        report.k01.importedCounts.auditLogs++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        report.k01.skippedOrInvalid.push({ resource: 'auditLog', id: log.id, reason: msg });
      }
    }
  }

  // 3. Import RBAC Data
  if (fs.existsSync(rbacFile)) {
    const rawRbac = JSON.parse(fs.readFileSync(rbacFile, 'utf-8'));

    // Permissions first (referenced by roles)
    for (const p of rawRbac.permissions || []) {
      try {
        await (db as any).insert(rbacPermissions).values({
          key: p.key,
          domain: p.domain,
          action: p.action,
          resource: p.resource,
          titleFa: p.titleFa,
          titleEn: p.titleEn,
          descriptionFa: p.descriptionFa || '',
          isSensitive: Boolean(p.isSensitive),
          requiresMfa: Boolean(p.requiresMfa),
          createdAt: new Date(),
        }).onConflictDoUpdate({
          target: rbacPermissions.key,
          set: {
            titleFa: p.titleFa,
            titleEn: p.titleEn,
            descriptionFa: p.descriptionFa || '',
            isSensitive: Boolean(p.isSensitive),
            requiresMfa: Boolean(p.requiresMfa),
          },
        });
        report.rbac.importedCounts.permissions++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        report.rbac.skippedOrInvalid.push({ resource: 'permission', id: p.key, reason: msg });
      }
    }

    // Roles & Role-Permissions
    for (const r of rawRbac.roles || []) {
      try {
        await (db as any).insert(rbacRoles).values({
          roleKey: r.roleKey,
          analysisCode: r.analysisCode,
          titleFa: r.titleFa,
          titleEn: r.titleEn,
          category: r.category,
          targetEnvironment: r.targetEnvironment,
          mainBoundaryFa: r.mainBoundaryFa || '',
          lifecycle: r.lifecycle || 'active',
          capabilityStatus: r.capabilityStatus || 'verified',
          isCatalogOnly: Boolean(r.isCatalogOnly),
          ownerStatus: r.ownerStatus || 'verified',
          createdAt: new Date(),
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: rbacRoles.roleKey,
          set: {
            titleFa: r.titleFa,
            titleEn: r.titleEn,
            category: r.category,
            targetEnvironment: r.targetEnvironment,
            mainBoundaryFa: r.mainBoundaryFa || '',
            lifecycle: r.lifecycle || 'active',
            capabilityStatus: r.capabilityStatus || 'verified',
            ownerStatus: r.ownerStatus || 'verified',
            updatedAt: new Date(),
          },
        });
        report.rbac.importedCounts.roles++;

        // Default permissions mapping
        for (const permKey of r.defaultPermissions || []) {
          try {
            await (db as any).insert(rbacRolePermissions).values({
              roleKey: r.roleKey,
              permissionKey: permKey,
            }).onConflictDoNothing();
            report.rbac.importedCounts.rolePermissions++;
          } catch {
            // Ignored if duplicate
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        report.rbac.skippedOrInvalid.push({ resource: 'role', id: r.roleKey, reason: msg });
      }
    }

    // Assignments
    for (const a of rawRbac.assignments || []) {
      try {
        let orgId = a.organizationId;
        if (a.membershipId && rawK01?.memberships) {
          const matchedMem = rawK01.memberships.find((m: any) => m.id === a.membershipId);
          if (matchedMem && matchedMem.organizationId !== orgId) {
            report.rbac.skippedOrInvalid.push({
              resource: 'assignment_corrected',
              id: a.id,
              reason: `سازمان انتساب (${orgId}) با سازمان واقعی عضویت (${matchedMem.organizationId}) تطبیق داده شد.`
            });
            orgId = matchedMem.organizationId;
          }
        }

        await (db as any).insert(rbacAssignments).values({
          id: a.id,
          membershipId: a.membershipId,
          partyId: a.partyId,
          organizationId: orgId,
          roleKey: a.roleKey,
          scopeType: a.scope?.type || 'global',
          scopeIds: a.scope?.ids || ['*'],
          scopeLabelFa: a.scope?.labelFa || null,
          validFrom: a.validFrom || new Date().toISOString().split('T')[0],
          validTo: a.validTo || null,
          reason: a.reason || 'انتساب سیستمی اولیه',
          status: a.status || 'active',
          version: a.version || 1,
          approvalRequestId: a.approvalRequestId || null,
          assignedByPartyId: a.assignedByPartyId || 'system',
          assignedAt: a.assignedAt ? new Date(a.assignedAt) : new Date(),
          revokedAt: a.revokedAt ? new Date(a.revokedAt) : null,
          revokedByPartyId: a.revokedByPartyId || null,
          revocationReason: a.revocationReason || null,
        }).onConflictDoUpdate({
          target: rbacAssignments.id,
          set: {
            roleKey: a.roleKey,
            status: a.status,
            validTo: a.validTo,
            revokedAt: a.revokedAt ? new Date(a.revokedAt) : null,
          },
        });
        report.rbac.importedCounts.assignments++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        report.rbac.skippedOrInvalid.push({ resource: 'assignment', id: a.id, reason: msg });
      }
    }

    // Grant Authority Rules
    for (const g of rawRbac.grantAuthorityRules || []) {
      try {
        await (db as any).insert(rbacGrantAuthorityRules).values({
          id: g.id,
          assignerRoleKey: g.assignerRoleKey,
          targetOrganizationType: g.targetOrganizationType || null,
          allowedAssignableRoles: g.allowedAssignableRoles || [],
          allowedScopeTypes: g.allowedScopeTypes || [],
          requiresFourEyesApproval: Boolean(g.requiresFourEyesApproval),
          maxValidityDays: g.maxValidityDays || null,
        }).onConflictDoNothing();
        report.rbac.importedCounts.grantAuthorityRules++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        report.rbac.skippedOrInvalid.push({ resource: 'grantAuthorityRule', id: g.id, reason: msg });
      }
    }
  }

  // 4. Post-counts
  report.k01.postCounts.persons = await countTable(k01Persons);
  report.k01.postCounts.organizations = await countTable(k01Organizations);
  report.k01.postCounts.memberships = await countTable(k01Memberships);
  report.k01.postCounts.documents = await countTable(k01Documents);
  report.k01.postCounts.auditLogs = await countTable(k01AuditLogs);

  report.rbac.postCounts.roles = await countTable(rbacRoles);
  report.rbac.postCounts.permissions = await countTable(rbacPermissions);
  report.rbac.postCounts.rolePermissions = await countTable(rbacRolePermissions);
  report.rbac.postCounts.assignments = await countTable(rbacAssignments);
  report.rbac.postCounts.policyRevisions = await countTable(rbacPolicyRevisions);
  report.rbac.postCounts.grantAuthorityRules = await countTable(rbacGrantAuthorityRules);

  return report;
}

export async function importK01Data() {
  const rep = await importData();
  return {
    success: true,
    counts: rep.k01.postCounts,
    report: rep.k01,
  };
}

export async function importRbacData() {
  const rep = await importData();
  return {
    success: true,
    counts: rep.rbac.postCounts,
    report: rep.rbac,
  };
}

// CLI execution helper
if (process.argv[1] && process.argv[1].endsWith('import.ts')) {
  importData()
    .then((rep) => {
      console.log('[Import Completed Successfully]:', JSON.stringify(rep, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Import Failed]:', err);
      process.exit(1);
    });
}
