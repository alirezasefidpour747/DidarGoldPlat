/**
 * Didar Gold Platform - Domain K03 Types
 * Authentication, Multi-Factor Authentication (MFA), Sessions & Account Security
 */

import { TrustTier } from './k02.js';

export type UserRole =
  | 'super_admin'        // مدیر ارشد سامانه
  | 'treasury_officer'   // متصدی خزانه‌داری طلا
  | 'risk_manager'       // مدیر ریسک و پذیرش
  | 'trader'             // معامله‌گر تالار طلا
  | 'dealer_operator'    // اپراتور بنکداری و گالری
  | 'customer';          // خریدار / سرمایه‌گذار نهایی

export type AccountStatus = 'active' | 'suspended' | 'locked' | 'password_expired';

export type MfaMethod = 'totp' | 'sms_otp' | 'security_key' | 'email_otp';

export interface UserAccount {
  id: string;
  partyId: string;               // Link to K01 Person
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  roleTitleFa: string;
  trustTier: TrustTier;          // Linked to K02 Trust Tier
  status: AccountStatus;
  passwordLastChangedAt: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  mfaConfig: {
    isEnforced: boolean;
    methodsEnabled: MfaMethod[];
    defaultMethod: MfaMethod;
    totpConfigured: boolean;
    totpSecretPreview?: string;
    backupCodesRemaining: number;
    securityKeyCount: number;
    lastMfaVerifiedAt?: string;
  };
  securitySettings: {
    sessionTimeoutMinutes: number;         // 15, 30, 60, 120
    maxConcurrentSessions: number;         // 1, 2, 5
    stepUpAuthThresholdGrams: number;      // Require immediate re-auth for transactions above X grams
    requireMfaForWithdrawals: boolean;     // Mandatory MFA for gold release
    trustedDevicesOnly: boolean;
  };
}

export interface AuthSession {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  role: UserRole;
  ipAddress: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'pos_terminal' | 'tablet';
  deviceName: string;
  browser: string;
  os: string;
  locationApprox: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isCurrent: boolean;
  isRevoked: boolean;
  mfaVerifiedForSession: boolean;
}

export interface MfaSecurityKey {
  id: string;
  userId: string;
  name: string;
  keyType: 'webauthn_fido2' | 'u2f';
  addedAt: string;
  lastUsedAt?: string;
  model: string;
}

export type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'mfa_challenge_passed'
  | 'mfa_challenge_failed'
  | 'account_locked'
  | 'account_unlocked'
  | 'password_changed'
  | 'session_revoked'
  | 'mfa_enforced'
  | 'step_up_triggered'
  | 'backup_codes_regenerated';

export type SecuritySeverity = 'info' | 'warning' | 'critical';

export interface SecurityEventLog {
  id: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  username?: string;
  actorName?: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  timestamp: string;
}

export interface MfaPolicyRule {
  id: string;
  nameFa: string;
  descriptionFa: string;
  appliesToRoles: UserRole[];
  minimumTrustTier: TrustTier;
  isMfaRequired: boolean;
  allowedMfaMethods: MfaMethod[];
  requireHardwareKeyForTreasury: boolean;
  stepUpThresholdGrams: number;
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
}

export interface K03Stats {
  totalAccounts: number;
  mfaEnabledPercent: number;
  activeSessionsCount: number;
  lockedAccountsCount: number;
  criticalEvents24h: number;
  totpUsersCount: number;
  hardwareKeyCount: number;
}

export interface K03DataPayload {
  accounts: UserAccount[];
  activeSessions: AuthSession[];
  securityKeys: MfaSecurityKey[];
  securityLogs: SecurityEventLog[];
  policyRules: MfaPolicyRule[];
  stats: K03Stats;
}
