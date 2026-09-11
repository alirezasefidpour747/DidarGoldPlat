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
import {
  K04DataPayload,
  ApprovalRequest,
  CommercialException,
  ApprovalCategory,
  ApprovalUrgency
} from '../types/k04.js';
import {
  K05DataPayload,
  ProductSku,
  SupplierCapacityOffer,
  LiveGoldSpotRate
} from '../types/k05.js';
import {
  K06DataPayload,
  UniqueItemPassport,
  ProvenanceEvent
} from '../types/k06.js';
import {
  K07DataPayload,
  SupplierPartnership,
  PartnershipAgreement,
  SupplierCollateral,
  QualityAuditRecord,
  PartnershipStatus,
  AgreementStatus
} from '../types/k07.js';
import {
  K08DataPayload,
  IntakeShipment,
  WarehouseReceipt,
  AssayTestRecord,
  BatchWeighingItem
} from '../types/k08.js';
import {
  K09DataPayload,
  VaultLocation,
  AgentBag,
  InventoryItem,
  StockTransfer,
  VaultAuditRecord
} from '../types/k09.js';
import {
  K10DataPayload,
  Order,
  AllocationSourceType,
  FulfillmentMethod,
  ProofOfDelivery
} from '../types/k10.js';

const API_BASE = '/api/admin/kernel/k01';
const K02_API_BASE = '/api/admin/kernel/k02';
const K03_API_BASE = '/api/admin/kernel/k03';
const K04_API_BASE = '/api/admin/kernel/k04';
const K05_API_BASE = '/api/admin/kernel/k05';
const K06_API_BASE = '/api/admin/kernel/k06';
const K07_API_BASE = '/api/admin/kernel/k07';
const K08_API_BASE = '/api/admin/kernel/k08';
const K09_API_BASE = '/api/admin/kernel/k09';
const K10_API_BASE = '/api/admin/kernel/k10';

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

export async function fetchK04Data(): Promise<K04DataPayload> {
  const response = await fetch(K04_API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'خطا در دریافت اطلاعات K04' }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  const result = await response.json();
  return result.data;
}

export async function apiCreateApprovalRequest(payload: {
  category: ApprovalCategory;
  title: string;
  description?: string;
  urgency?: ApprovalUrgency;
  goldWeightGrams?: number;
  goldPurityCarat?: number;
  financialValueIrr?: number;
  partyNameFa?: string;
  initiatorId: string;
  initiatorName: string;
  initiatorRoleFa: string;
}): Promise<ApprovalRequest> {
  const response = await fetch(`${K04_API_BASE}/approvals/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در ثبت درخواست تأیید.');
  }
  return result.data;
}

export async function apiApproveRequestStep(
  requestId: string,
  stepNumber: number,
  actorId: string,
  actorName?: string,
  actorRoleFa?: string,
  notes?: string
): Promise<{ success: boolean; message: string; request?: ApprovalRequest }> {
  const response = await fetch(`${K04_API_BASE}/approvals/${requestId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ stepNumber, actorId, actorName, actorRoleFa, notes })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در تأیید مرحله درخواست.');
  }
  return result;
}

export async function apiRejectApprovalRequest(
  requestId: string,
  stepNumber: number,
  actorId: string,
  reason: string,
  actorName?: string,
  actorRoleFa?: string
): Promise<{ success: boolean; message: string; request?: ApprovalRequest }> {
  const response = await fetch(`${K04_API_BASE}/approvals/${requestId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ stepNumber, actorId, reason, actorName, actorRoleFa })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در رد درخواست.');
  }
  return result;
}

export async function apiCreateCommercialException(payload: {
  titleFa: string;
  descriptionFa: string;
  category: ApprovalCategory;
  partyNameFa: string;
  goldWeightGrams: number;
  financialImpactIrr: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  conditions: string[];
  actorName?: string;
}): Promise<CommercialException> {
  const response = await fetch(`${K04_API_BASE}/exceptions/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در صدور استثنای تجاری.');
  }
  return result.data;
}

export async function apiRevokeCommercialException(
  exceptionId: string,
  reason: string,
  actorId?: string,
  actorName?: string,
  actorRoleFa?: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${K04_API_BASE}/exceptions/${exceptionId}/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ reason, actorId, actorName, actorRoleFa })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در ابطال استثنای تجاری.');
  }
  return result;
}

export async function apiVerifyAuditIntegrity(): Promise<{
  success: boolean;
  message: string;
  data: {
    isValid: boolean;
    verifiedBlocksCount: number;
    lastCheckedAt: string;
    genesisHash: string;
    latestHash: string;
    brokenBlockIndex?: number;
  };
}> {
  const response = await fetch(`${K04_API_BASE}/audit/verify-integrity`, {
    method: 'POST',
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در ارزیابی زنجیره لاگ‌ها.');
  }
  return result;
}

/* ====================================================================
   K05 API Endpoints: Products, Catalog & Supplier Capacity Offers
==================================================================== */

export async function fetchK05Data(): Promise<K05DataPayload> {
  const response = await fetch(K05_API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'خطا در دریافت اطلاعات هسته K05' }));
    throw new Error(err.message || 'خطا در برقراری ارتباط با هسته K05.');
  }
  const result = await response.json();
  return result.data;
}

export async function apiCreateProduct(payload: Partial<ProductSku>): Promise<ProductSku> {
  const response = await fetch(`${K05_API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در ثبت مدل کالا در کاتالوگ.');
  }
  return result.data;
}

export async function apiUpdateProduct(id: string, payload: Partial<ProductSku>): Promise<ProductSku> {
  const response = await fetch(`${K05_API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در ویرایش مدل کالا.');
  }
  return result.data;
}

export async function apiDeleteProduct(id: string): Promise<boolean> {
  const response = await fetch(`${K05_API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در حذف مدل کالا.');
  }
  return true;
}

export async function apiCreateSupplyOffer(payload: Partial<SupplierCapacityOffer>): Promise<SupplierCapacityOffer> {
  const response = await fetch(`${K05_API_BASE}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در ثبت پیشنهاد ظرفیت تولید.');
  }
  return result.data;
}

export async function apiUpdateOfferStatus(id: string, status: SupplierCapacityOffer['status']): Promise<SupplierCapacityOffer> {
  const response = await fetch(`${K05_API_BASE}/offers/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ status })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در تغییر وضعیت پیشنهاد ظرفیت.');
  }
  return result.data;
}

export async function apiEstimatePrice(skuId: string, variantId?: string): Promise<{
  skuId: string;
  weightGrams: number;
  goldPricePerGramIrr: number;
  rawGoldTotalIrr: number;
  makerWageTotalIrr: number;
  wholesaleMarginTotalIrr: number;
  totalEstimateIrr: number;
  totalEstimateToman: number;
}> {
  const response = await fetch(`${K05_API_BASE}/estimate-price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ skuId, variantId })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در برآورد لحظه‌ای قیمت.');
  }
  return result.data;
}

export async function apiUpdateMarketRate(rates: Partial<LiveGoldSpotRate>): Promise<LiveGoldSpotRate> {
  const response = await fetch(`${K05_API_BASE}/market-rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(rates)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در ثبت نرخ جدید طلا.');
  }
  return result.data;
}

/* ====================================================================
   K06 API Endpoints: Unique Item Passports, Assay & Provenance
==================================================================== */

export async function fetchK06Data(): Promise<K06DataPayload> {
  const response = await fetch(K06_API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'خطا در بارگذاری اطلاعات K06' }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }
  const result = await response.json();
  return result.data;
}

export async function apiGetPassport(uid: string): Promise<{ passport: UniqueItemPassport; events: ProvenanceEvent[] }> {
  const response = await fetch(`${K06_API_BASE}/passport/${encodeURIComponent(uid)}`, {
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در دریافت شناسنامه قطعه طلا.');
  }
  return result.data;
}

export async function apiMintPassport(payload: any): Promise<UniqueItemPassport> {
  const response = await fetch(`${K06_API_BASE}/mint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در صدور گذرنامه دیجیتال قطعه.');
  }
  return result.data;
}

export async function apiRecordProvenanceEvent(payload: {
  passportId: string;
  eventType: string;
  eventTypeFa?: string;
  titleFa: string;
  descriptionFa?: string;
  actorName?: string;
  actorRoleFa?: string;
  fromHolder?: string;
  toHolder?: string;
  locationFa?: string;
  certificateRef?: string;
}): Promise<ProvenanceEvent> {
  const response = await fetch(`${K06_API_BASE}/provenance-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در ثبت رویداد در زنجیره اصالت.');
  }
  return result.data;
}

export async function apiTransferOwnership(payload: {
  passportId: string;
  ownerName: string;
  ownerNationalCode: string;
  ownerPhone?: string;
  retailInvoiceNumber: string;
  storeName?: string;
  notes?: string;
}): Promise<UniqueItemPassport> {
  const response = await fetch(`${K06_API_BASE}/transfer-ownership`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در ثبت انتقال مالکیت به خریدار.');
  }
  return result.data;
}

export async function apiToggleStolen(payload: {
  passportId: string;
  isStolen: boolean;
  reason?: string;
  policeReportNo?: string;
}): Promise<UniqueItemPassport> {
  const response = await fetch(`${K06_API_BASE}/toggle-stolen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در تغییر وضعیت اعلام سرقت قطعه.');
  }
  return result.data;
}

export async function apiVerifyPublicLookup(query: string): Promise<{
  found: boolean;
  passport?: UniqueItemPassport;
  events?: ProvenanceEvent[];
  verificationMessage: string;
  isAuthentic: boolean;
  isStolen: boolean;
}> {
  const response = await fetch(`${K06_API_BASE}/verify/${encodeURIComponent(query)}`, {
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'خطا در استعلام عمومی اصالت.');
  }
  return result.data;
}

// ----------------------------------------------------
// K07: Supplier Partnership Lifecycle API Methods
// ----------------------------------------------------
export async function fetchK07Data(): Promise<K07DataPayload> {
  const response = await fetch(K07_API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'خطا در بارگذاری اطلاعات هسته K07' } }));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }
  const result = await response.json();
  return result.data;
}

export async function apiCreateSupplier(payload: Partial<SupplierPartnership>): Promise<SupplierPartnership> {
  const response = await fetch(`${K07_API_BASE}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ثبت کارگاه و تأمین‌کننده جدید');
  }
  return result.data;
}

export async function apiUpdateSupplier(id: string, payload: Partial<SupplierPartnership>): Promise<SupplierPartnership> {
  const response = await fetch(`${K07_API_BASE}/suppliers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ویرایش اطلاعات کارگاه');
  }
  return result.data;
}

export async function apiChangeSupplierStatus(
  id: string,
  status: PartnershipStatus,
  reason: string
): Promise<SupplierPartnership> {
  const response = await fetch(`${K07_API_BASE}/suppliers/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ status, reason })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در به‌روزرسانی وضعیت شراکت کارگاه');
  }
  return result.data;
}

export async function apiAdjustConsignmentLimit(id: string, limitGrams: number): Promise<SupplierPartnership> {
  const response = await fetch(`${K07_API_BASE}/suppliers/${id}/consignment-limit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ limitGrams })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در تنظیم سقف طلای امانی کارگاه');
  }
  return result.data;
}

export async function apiCreateAgreement(payload: Partial<PartnershipAgreement>): Promise<PartnershipAgreement> {
  const response = await fetch(`${K07_API_BASE}/agreements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در انعقاد قرارداد همکاری و امانی');
  }
  return result.data;
}

export async function apiUpdateAgreementStatus(id: string, status: AgreementStatus): Promise<PartnershipAgreement> {
  const response = await fetch(`${K07_API_BASE}/agreements/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ status })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در تغییر وضعیت قرارداد');
  }
  return result.data;
}

export async function apiRegisterCollateral(payload: Partial<SupplierCollateral>): Promise<SupplierCollateral> {
  const response = await fetch(`${K07_API_BASE}/collaterals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ثبت وثیقه و ضمانت‌نامه زرگری');
  }
  return result.data;
}

export async function apiVerifyCollateral(
  id: string,
  verificationStatus: 'verified' | 'pending_inquiry' | 'rejected',
  notes: string
): Promise<SupplierCollateral> {
  const response = await fetch(`${K07_API_BASE}/collaterals/${id}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ verificationStatus, notes })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ثبت استعلام وثیقه');
  }
  return result.data;
}

export async function apiRecordQualityAudit(payload: Partial<QualityAuditRecord>): Promise<QualityAuditRecord> {
  const response = await fetch(`${K07_API_BASE}/audits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'خطا در ثبت ممیزی کیفی و امتیاز عملکرد');
  }
  return result.data;
}

// -------------------------------------------------------------
// Domain K08: Supply Intake & Acceptance
// -------------------------------------------------------------

export async function fetchK08Data(): Promise<K08DataPayload> {
  const response = await fetch(K08_API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'خطا در دریافت اطلاعات K08' } }));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }
  const result = await response.json();
  return result.data;
}

export async function apiRegisterShipment(
  payload: Partial<IntakeShipment>,
  actorName?: string
): Promise<IntakeShipment> {
  const response = await fetch(`${K08_API_BASE}/shipments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ ...payload, actorName })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت محموله ورودی');
  }
  return result.data;
}

export async function apiRecordWeighing(
  shipmentId: string,
  payload: {
    scaleWeightGrams: number;
    scaleCalibrationSerial: string;
    scaleModelFa?: string;
    batchWeighings?: BatchWeighingItem[];
    actorName?: string;
  }
): Promise<IntakeShipment> {
  const response = await fetch(`${K08_API_BASE}/shipments/${shipmentId}/weighing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت توزین ترازو');
  }
  return result.data;
}

export async function apiMoveToQuarantine(
  shipmentId: string,
  quarantineBinCode: string,
  actorName?: string
): Promise<IntakeShipment> {
  const response = await fetch(`${K08_API_BASE}/shipments/${shipmentId}/quarantine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ quarantineBinCode, actorName })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در انتقال به گاوصندوق قرنطینه');
  }
  return result.data;
}

export async function apiRecordAssay(
  shipmentId: string,
  assayData: Partial<AssayTestRecord>,
  actorName?: string
): Promise<IntakeShipment> {
  const response = await fetch(`${K08_API_BASE}/shipments/${shipmentId}/assay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ assayData, actorName })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت نتایج عیارسنجی');
  }
  return result.data;
}

export async function apiMakeIntakeDecision(
  shipmentId: string,
  payload: {
    decision: 'accepted' | 'accepted_with_tolerance' | 'rejected' | 'quarantine_hold';
    notes: string;
    penaltyGoldGramsDeducted?: number;
    penaltyMakingChargeToman?: number;
    vaultLocationFa?: string;
    actorName?: string;
  }
): Promise<{ shipment: IntakeShipment; receipt?: WarehouseReceipt }> {
  const response = await fetch(`${K08_API_BASE}/shipments/${shipmentId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت تصمیم نهایی پذیرش محموله');
  }
  return result.data;
}

export async function fetchWarehouseReceipt(receiptId: string): Promise<WarehouseReceipt> {
  const response = await fetch(`${K08_API_BASE}/receipts/${receiptId}`, {
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در دریافت قبض انبار');
  }
  return result.data;
}

// ==========================================
// K09: Inventory, Locations, Custody & Bags
// ==========================================

export async function fetchK09Data(): Promise<K09DataPayload> {
  const response = await fetch(K09_API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در دریافت اطلاعات موجودی و خزانه‌ها');
  }
  return result.data;
}

export async function apiCreateStockTransfer(payload: Partial<StockTransfer>): Promise<StockTransfer> {
  const response = await fetch(`${K09_API_BASE}/transfers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت حواله انتقال فیزیکی طلا');
  }
  return result.data;
}

export async function apiConfirmTransferArrival(
  transferId: string,
  measuredWeightAtDestinationGrams: number,
  receiverOfficerName: string,
  notes?: string
): Promise<StockTransfer> {
  const response = await fetch(`${K09_API_BASE}/transfers/${transferId}/confirm-arrival`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ measuredWeightAtDestinationGrams, receiverOfficerName, notes })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در تأیید وصول و تطبیق گرمی');
  }
  return result.data;
}

export async function apiCreateAgentBag(payload: Partial<AgentBag>): Promise<AgentBag> {
  const response = await fetch(`${K09_API_BASE}/bags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت کیف جدید ویزیتور');
  }
  return result.data;
}

export async function apiRecordVaultAudit(payload: Partial<VaultAuditRecord>): Promise<VaultAuditRecord> {
  const response = await fetch(`${K09_API_BASE}/audits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت صورت‌جلسه انبارگردانی');
  }
  return result.data;
}

// ================= K10: Orders, Allocation & Fulfillment =================

export async function fetchK10Data(): Promise<K10DataPayload> {
  const response = await fetch(K10_API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'خطا در بارگذاری اطلاعات K10' }));
    throw new Error(err.error || 'خطا در ارتباط با سرور دامنه سفارشات و تحویل');
  }
  const result = await response.json();
  return result.data;
}

export async function apiCreateOrder(payload: Partial<Order>): Promise<Order> {
  const response = await fetch(`${K10_API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت سفارش جدید');
  }
  return result.data;
}

export async function apiAllocateOrderStock(
  orderId: string,
  allocations: { itemId: string; allocatedUids: string[]; source: AllocationSourceType; sourceNameFa: string; actualWeightGrams: number }[]
): Promise<Order> {
  const response = await fetch(`${K10_API_BASE}/orders/${orderId}/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ allocations })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در تخصیص موجودی سفارش');
  }
  return result.data;
}

export async function apiPackAndSealOrder(orderId: string, sealSerial: string, notes?: string): Promise<Order> {
  const response = await fetch(`${K10_API_BASE}/orders/${orderId}/pack-seal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ sealSerial, notes })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در پلمپ امنیتی بسته سفارش');
  }
  return result.data;
}

export async function apiDispatchOrder(
  orderId: string,
  carrierInfo: { waybill: string; method: FulfillmentMethod; escortOfficerNameFa: string }
): Promise<Order> {
  const response = await fetch(`${K10_API_BASE}/orders/${orderId}/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(carrierInfo)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت خروج و بارگیری محموله');
  }
  return result.data;
}

export async function apiVerifyOrderPod(orderId: string, podData: Partial<ProofOfDelivery>): Promise<Order> {
  const response = await fetch(`${K10_API_BASE}/orders/${orderId}/verify-pod`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(podData)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت و اعتبارسنجی سند تحویل POD');
  }
  return result.data;
}

export async function apiCancelOrder(orderId: string, reason: string): Promise<Order> {
  const response = await fetch(`${K10_API_BASE}/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ reason })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در لغو سفارش');
  }
  return result.data;
}

export const api = {
  getK01Data: fetchK01Data,
  getK02Data: fetchK02Data,
  getK03Data: fetchK03Data,
  getK04Data: fetchK04Data,
  getK05Data: fetchK05Data,
  getK06Data: fetchK06Data,
  getK07Data: fetchK07Data,
  getK08Data: fetchK08Data,
  getK09Data: fetchK09Data,
  getK10Data: fetchK10Data,
  // K10
  createOrder: apiCreateOrder,
  allocateOrderStock: apiAllocateOrderStock,
  packAndSealOrder: apiPackAndSealOrder,
  dispatchOrder: apiDispatchOrder,
  verifyOrderPod: apiVerifyOrderPod,
  cancelOrder: apiCancelOrder,
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
  simulateStepUp: apiSimulateStepUp,
  // K04
  createApprovalRequest: apiCreateApprovalRequest,
  approveRequestStep: apiApproveRequestStep,
  rejectApprovalRequest: apiRejectApprovalRequest,
  createCommercialException: apiCreateCommercialException,
  revokeCommercialException: apiRevokeCommercialException,
  verifyAuditIntegrity: apiVerifyAuditIntegrity,
  // K05
  createProduct: apiCreateProduct,
  updateProduct: apiUpdateProduct,
  deleteProduct: apiDeleteProduct,
  createSupplyOffer: apiCreateSupplyOffer,
  updateOfferStatus: apiUpdateOfferStatus,
  estimatePrice: apiEstimatePrice,
  updateMarketRate: apiUpdateMarketRate,
  // K06
  getPassport: apiGetPassport,
  mintPassport: apiMintPassport,
  recordProvenanceEvent: apiRecordProvenanceEvent,
  transferOwnership: apiTransferOwnership,
  toggleStolen: apiToggleStolen,
  verifyPublicLookup: apiVerifyPublicLookup,
  // K07
  createSupplier: apiCreateSupplier,
  updateSupplier: apiUpdateSupplier,
  changeSupplierStatus: apiChangeSupplierStatus,
  adjustConsignmentLimit: apiAdjustConsignmentLimit,
  createAgreement: apiCreateAgreement,
  updateAgreementStatus: apiUpdateAgreementStatus,
  registerCollateral: apiRegisterCollateral,
  verifyCollateral: apiVerifyCollateral,
  recordQualityAudit: apiRecordQualityAudit,
  // K08
  registerShipment: apiRegisterShipment,
  recordWeighing: apiRecordWeighing,
  moveToQuarantine: apiMoveToQuarantine,
  recordAssay: apiRecordAssay,
  makeIntakeDecision: apiMakeIntakeDecision,
  getWarehouseReceipt: fetchWarehouseReceipt,
  // K09
  createStockTransfer: apiCreateStockTransfer,
  confirmTransferArrival: apiConfirmTransferArrival,
  createAgentBag: apiCreateAgentBag,
  recordVaultAudit: apiRecordVaultAudit
};

