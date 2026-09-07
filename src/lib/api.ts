/**
 * Didar Gold Platform - Client API Client for K01 Domain
 */

import {
  K01DataPayload,
  Party,
  Organization,
  Membership,
  PartyDocument,
  EntityStatus,
  VerificationStatus
} from '../types/k01.js';
import {
  K02DataPayload,
  OnboardingApplication,
  CommercialEntitlements,
  ChecklistStepKey,
  VerificationCallLog,
  TrustTier
} from '../types/k02.js';
import {
  K03DataPayload,
  UserAccount,
  AuthSession,
  MfaSecurityKey,
  MfaPolicyRule,
  MfaMethod
} from '../types/k03.js';

const API_BASE = '/api/admin/kernel/k01';
const K02_API_BASE = '/api/admin/kernel/k02';
const K03_API_BASE = '/api/admin/kernel/k03';

export async function fetchK01Data(): Promise<K01DataPayload> {
  const response = await fetch(API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'خطا در بارگذاری اطلاعات K01' } }));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }
  const result = await response.json();
  return result.data;
}

export async function apiCreatePerson(payload: Partial<Party>): Promise<Party> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'مدیر سامانه دیدار'
    },
    body: JSON.stringify({ resource: 'person', ...payload })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ثبت اطلاعات شخص.');
  }
  return result.data;
}

export async function apiUpdatePerson(id: string, payload: Partial<Party>): Promise<Party> {
  const response = await fetch(`${API_BASE}/person/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'مدیر سامانه دیدار'
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ویرایش اطلاعات شخص.');
  }
  return result.data;
}

export async function apiCreateOrganization(payload: Partial<Organization>): Promise<Organization> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'مدیر سامانه دیدار'
    },
    body: JSON.stringify({ resource: 'organization', ...payload })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ثبت سازمان.');
  }
  return result.data;
}

export async function apiUpdateOrganization(id: string, payload: Partial<Organization>): Promise<Organization> {
  const response = await fetch(`${API_BASE}/organization/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'مدیر سامانه دیدار'
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ویرایش سازمان.');
  }
  return result.data;
}

export async function apiCreateMembership(payload: Partial<Membership>): Promise<Membership> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'مدیر سامانه دیدار'
    },
    body: JSON.stringify({ resource: 'membership', ...payload })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در برقراری رابطه عضویت.');
  }
  return result.data;
}

export async function apiUpdateMembership(id: string, payload: Partial<Membership>): Promise<Membership> {
  const response = await fetch(`${API_BASE}/membership/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'مدیر سامانه دیدار'
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ویرایش رابطه عضویت.');
  }
  return result.data;
}

export async function apiUpdateStatus(
  resource: 'person' | 'organization' | 'membership',
  id: string,
  status: EntityStatus,
  reason: string,
  verificationStatus?: VerificationStatus
): Promise<unknown> {
  const response = await fetch(`${API_BASE}/${resource}/${id}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'مدیر سامانه دیدار'
    },
    body: JSON.stringify({ status, verificationStatus, reason })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در تغییر وضعیت.');
  }
  return result.data;
}

export async function apiUploadDocument(payload: Partial<PartyDocument>): Promise<PartyDocument> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'مدیر سامانه دیدار'
    },
    body: JSON.stringify({ resource: 'document', ...payload })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ثبت مدرک.');
  }
  return result.data;
}

export async function apiVerifyDocument(id: string, verificationStatus: VerificationStatus): Promise<PartyDocument> {
  const response = await fetch(`${API_BASE}/document/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'اداره بازرسی و انطباق دیدار'
    },
    body: JSON.stringify({ verificationStatus })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در به‌روزرسانی استعلام مدرک.');
  }
  return result.data;
}

export async function apiGetSupabaseHealth(): Promise<{
  configured: boolean;
  url: string | null;
  hasSecretKey: boolean;
  hasPublishableKey: boolean;
  status: 'connected' | 'unreachable' | 'not_configured';
  message: string;
  latencyMs?: number;
}> {
  const response = await fetch(`${API_BASE}/supabase/health`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('خطا در بررسی اتصال Supabase');
  }
  const result = await response.json();
  return result.data;
}

export async function apiSyncToSupabase(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/supabase/sync`, {
    method: 'POST',
    headers: { 'Accept': 'application/json' }
  });
  return response.json();
}

/* ====================================================================
   K02 API Endpoints: Progressive Onboarding, Trust & Entitlements
==================================================================== */

export async function fetchK02Data(): Promise<K02DataPayload> {
  const response = await fetch(K02_API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'خطا در بارگذاری اطلاعات K02' } }));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }
  const result = await response.json();
  return result.data;
}

export async function apiCreateOnboardingApplication(payload: Partial<OnboardingApplication>): Promise<OnboardingApplication> {
  const response = await fetch(`${K02_API_BASE}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'مدیر پذیرش طلا'
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ایجاد پرونده پذیرش.');
  }
  return result.data;
}

export async function apiUpdateChecklistStep(
  appId: string,
  stepKey: ChecklistStepKey,
  completed: boolean,
  notes?: string
): Promise<OnboardingApplication> {
  const response = await fetch(`${K02_API_BASE}/applications/${appId}/checklist-step`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'کارشناس احراز و اعتبارسنجی'
    },
    body: JSON.stringify({ stepKey, completed, notes })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در به‌روزرسانی چک‌لیست.');
  }
  return result.data;
}

export async function apiLogVerificationCall(
  appId: string,
  callLog: Partial<VerificationCallLog>
): Promise<OnboardingApplication> {
  const response = await fetch(`${K02_API_BASE}/applications/${appId}/call-log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'کارشناس احراز و اعتبارسنجی'
    },
    body: JSON.stringify(callLog)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ثبت استعلام تلفنی.');
  }
  return result.data;
}

export async function apiMakeOnboardingDecision(
  appId: string,
  decision: 'approve' | 'reject' | 'needs_amendment' | 'assign',
  details: {
    assignedTier?: TrustTier;
    dailyGoldLimitGrams?: number;
    creditAllowanceGrams?: number;
    canAccessWholesaleMarket?: boolean;
    canPlaceCustomOrders?: boolean;
    rejectionReason?: string;
    amendmentNotes?: string;
    reviewerName?: string;
    notes?: string;
  }
): Promise<OnboardingApplication> {
  const response = await fetch(`${K02_API_BASE}/applications/${appId}/decision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'مدیر ارشد عملیات پلتفرم'
    },
    body: JSON.stringify({ decision, details })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ثبت تصمیم پرونده.');
  }
  return result.data;
}

export async function apiUpdateCommercialEntitlements(
  targetId: string,
  payload: Partial<CommercialEntitlements>
): Promise<CommercialEntitlements> {
  const response = await fetch(`${K02_API_BASE}/entitlements/${targetId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-actor-name': 'مدیر ریسک و معاملات طلا'
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در به‌روزرسانی حدود تجاری.');
  }
  return result.data;
}

// ----------------------------------------------------
// K03 DOMAIN API (Authentication & MFA)
// ----------------------------------------------------

export async function fetchK03Data(): Promise<K03DataPayload> {
  const response = await fetch(K03_API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('خطا در واکشی اطلاعات احراز هویت K03.');
  }
  const result = await response.json();
  return result.data;
}

export async function apiToggleMfa(
  userId: string,
  isEnforced: boolean,
  defaultMethod?: MfaMethod
): Promise<UserAccount> {
  const response = await fetch(`${K03_API_BASE}/mfa/toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ userId, isEnforced, defaultMethod })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در تغییر وضعیت الزام احراز دوعاملی.');
  }
  return result.data;
}

export async function apiVerifyTotp(userId: string, code: string): Promise<UserAccount> {
  const response = await fetch(`${K03_API_BASE}/mfa/totp-verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ userId, code })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در تایید کد دوعاملی نرم‌افزاری.');
  }
  return result.data;
}

export async function apiAddSecurityKey(
  userId: string,
  name: string,
  model: string
): Promise<MfaSecurityKey> {
  const response = await fetch(`${K03_API_BASE}/mfa/security-key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ userId, name, model })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ثبت کلید امنیتی FIDO2.');
  }
  return result.data;
}

export async function apiRevokeSession(sessionId: string): Promise<void> {
  const response = await fetch(`${K03_API_BASE}/sessions/${sessionId}/revoke`, {
    method: 'POST',
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ابطال نشست.');
  }
}

export async function apiRevokeAllSessions(userId: string, keepCurrentId?: string): Promise<number> {
  const response = await fetch(`${K03_API_BASE}/sessions/revoke-all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ userId, keepCurrentId })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ابطال نشست‌ها.');
  }
  return result.revokedCount;
}

export async function apiUnlockAccount(userId: string): Promise<UserAccount> {
  const response = await fetch(`${K03_API_BASE}/accounts/${userId}/unlock`, {
    method: 'POST',
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در باز کردن قفل حساب.');
  }
  return result.data;
}

export async function apiUpdateSecuritySettings(
  userId: string,
  settings: Partial<UserAccount['securitySettings']>
): Promise<UserAccount> {
  const response = await fetch(`${K03_API_BASE}/accounts/${userId}/security-settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ settings })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در به‌روزرسانی تنظیمات امنیتی.');
  }
  return result.data;
}

export async function apiUpdatePolicyRule(
  ruleId: string,
  updates: Partial<MfaPolicyRule>
): Promise<MfaPolicyRule> {
  const response = await fetch(`${K03_API_BASE}/policies/${ruleId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در به‌روزرسانی سیاست امنیتی.');
  }
  return result.data;
}

export async function apiSimulateStepUp(
  userId: string,
  operationFa: string,
  amountGrams: number,
  method: MfaMethod,
  code: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${K03_API_BASE}/step-up/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ userId, operationFa, amountGrams, method, code })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در اجرای چالش مرحله‌ای.');
  }
  return result;
}

export const api = {
  getK01Data: fetchK01Data,
  getK02Data: fetchK02Data,
  getK03Data: fetchK03Data,
  createParty: apiCreatePerson,
  updateParty: apiUpdatePerson,
  createOrganization: apiCreateOrganization,
  updateOrganization: apiUpdateOrganization,
  createMembership: apiCreateMembership,
  updateMembership: apiUpdateMembership,
  changePartyStatus: (id: string, status: EntityStatus, reason: string) =>
    apiUpdateStatus('person', id, status, reason),
  changeOrgStatus: (id: string, status: EntityStatus, reason: string) =>
    apiUpdateStatus('organization', id, status, reason),
  changeMembershipStatus: (id: string, status: EntityStatus, reason: string) =>
    apiUpdateStatus('membership', id, status, reason),
  uploadDocument: apiUploadDocument,
  verifyDocument: apiVerifyDocument,
  getSupabaseHealth: apiGetSupabaseHealth,
  syncToSupabase: apiSyncToSupabase,
  // K02
  createOnboardingApplication: apiCreateOnboardingApplication,
  updateChecklistStep: apiUpdateChecklistStep,
  logVerificationCall: apiLogVerificationCall,
  makeOnboardingDecision: apiMakeOnboardingDecision,
  updateCommercialEntitlements: apiUpdateCommercialEntitlements,
  // K03
  toggleMfa: apiToggleMfa,
  verifyTotp: apiVerifyTotp,
  addSecurityKey: apiAddSecurityKey,
  revokeSession: apiRevokeSession,
  revokeAllSessions: apiRevokeAllSessions,
  unlockAccount: apiUnlockAccount,
  updateSecuritySettings: apiUpdateSecuritySettings,
  updatePolicyRule: apiUpdatePolicyRule,
  simulateStepUp: apiSimulateStepUp
};

