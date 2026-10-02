/**
 * Didar Gold Platform - Layer 3: Business / Service Layer
 * RBAC & Identity Governance Service
 * 
 * Enforces role assignment verification, permissions evaluation,
 * and the Four-Eyes Principle (maker-checker separation).
 */

import { rbacRepository, RbacRepository } from '../repositories/rbac.repository.js';
import { RbacService } from '../storage-rbac.js';

export class PlatformRbacService {
  private repo: RbacRepository;

  constructor() {
    this.repo = rbacRepository;
  }

  public getFullSecurityOverview() {
    return this.repo.getFullRbacData();
  }

  public getFullRbacState() {
    return this.repo.getFullRbacData();
  }

  public getUsers() {
    return this.repo.getUsers();
  }

  public getRoles() {
    return this.repo.getRoles();
  }

  public getPermissions() {
    return this.repo.getPermissions();
  }

  public getAssignments() {
    return this.repo.getAssignments();
  }

  public getWorkspaces(partyId: string = 'party-admin-001') {
    return this.repo.getWorkspaces(partyId);
  }

  public getAuditLogs() {
    return this.repo.getAuditLogs();
  }

  /**
   * Evaluates if user has specific permission code in domain
   */
  public async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    // Check assignments
    const assignments = await this.repo.getAssignments();
    const userAssignments = assignments.filter((a: any) => a.partyId === userId && a.status === 'active');
    
    // Super admin role check
    const isSuperAdmin = userAssignments.some((a: any) => 
      a.roleKey === 'governance.identity_access_manager' || a.roleKey.includes('admin')
    );
    if (isSuperAdmin) return true;

    // Check effective access
    const roles = await this.repo.getRoles();
    const activeRoles = roles.filter((r: any) => userAssignments.some((a: any) => a.roleKey === r.roleKey));
    return activeRoles.some((r: any) => r.defaultPermissions?.includes(permissionCode) || r.defaultPermissions?.includes('*'));
  }

  /**
   * Enforces 4-Eyes check (maker and checker cannot be the same user)
   */
  public verifyFourEyesRule(makerUserId: string, checkerUserId: string): boolean {
    if (makerUserId === checkerUserId) {
      throw new Error('نقض اصل تفکیک وظایف (۴-Eyes Rule): تأییدکننده و ایجادکننده تراکنش نمی‌توانند یک کاربر یکسان باشند.');
    }
    return true;
  }
}

export const platformRbacService = new PlatformRbacService();
export const rbacService = platformRbacService;
