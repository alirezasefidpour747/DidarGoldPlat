/**
 * Didar Gold Platform - Client Authentication Types
 */

import { Membership } from './k01.js';

export interface AuthSessionData {
  partyId: string;
  personName: string;
  mobile: string;
  email?: string;
  partyType?: string;
  organizationId: string;
  organizationName: string;
  organizationType: string;
  isInternalStaff: boolean;
  roleKeys: string[];
  permissions: string[];
  memberships?: Membership[];
  sessionId: string;
  expiresAt?: string;
  workspaces?: {
    personal: { partyId: string; name: string };
    organizations: {
      organizationId: string;
      displayName: string;
      membershipId: string;
      title: string;
      activeRoleCount: number;
    }[];
  };
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    session: {
      id: string;
      partyId: string;
      personName: string;
      mobile: string;
      organizationId: string;
      organizationName: string;
      organizationType: string;
      roleKeys: string[];
      permissions: string[];
      expiresAt: string;
    };
  };
}

export interface SetupAdminRequest {
  firstName: string;
  lastName: string;
  mobile: string;
  nationalId?: string;
  email?: string;
  password: string;
  organizationName?: string;
}
