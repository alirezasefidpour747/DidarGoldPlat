/**
 * Didar Gold Platform - Layer 4: Data Access / Repository
 * RBAC & IAM Repository for Roles, Permissions, Workspaces & Audit Logs
 */

import { BaseRepository } from './base.repository.js';
import { RbacService } from '../storage-rbac.js';
import { loadStore } from '../storage.js';
import { DEFAULT_GRANT_AUTHORITY_RULES } from '../../src/data/rbacCatalog.js';

export class RbacRepository extends BaseRepository<any> {
  constructor() {
    super('rbac_security');
  }

  public getFullRbacData() {
    return {
      roles: RbacService.getRoles(),
      permissions: RbacService.getPermissions(),
      assignments: RbacService.getAssignments(),
      grantAuthorityRules: DEFAULT_GRANT_AUTHORITY_RULES
    };
  }

  public getUsers() {
    const k01 = loadStore();
    return k01.persons;
  }

  public getUserById(id: string) {
    const k01 = loadStore();
    return k01.persons.find(p => p.id === id) || null;
  }

  public getRoles() {
    return RbacService.getRoles();
  }

  public getPermissions() {
    return RbacService.getPermissions();
  }

  public getAssignments() {
    return RbacService.getAssignments();
  }

  public getWorkspaces(partyId: string = 'party-admin-001') {
    return RbacService.getUserAvailableWorkspaces(partyId);
  }

  public getAuditLogs() {
    const k01 = loadStore();
    return k01.auditLogs;
  }

  public findAll(): any[] {
    return this.getUsers();
  }

  public findById(id: string): any | null {
    return this.getUserById(id);
  }

  public save(entity: any): any {
    return entity;
  }

  public deleteById(id: string): boolean {
    return false;
  }
}

export const rbacRepository = new RbacRepository();
