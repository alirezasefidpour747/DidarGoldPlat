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
  RoleDefinition,
  PermissionDefinition,
  RoleAssignment,
  WorkContext,
  EffectiveAccessResult
} from '../types/rbac.js';
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
import {
  K11DataPayload,
  Retailer,
  CommercialTier,
  RetailerLifecycleStatus,
  CommercialTerms,
  RetailerTerritory,
  RetailerAllowedBasket
} from '../types/k11.js';
import {
  K12DataPayload,
  FieldAgent,
  Territory,
  FieldVisit,
  MobileShowcaseItem,
  ProxyOrderDraft,
  AgentDutyStatus
} from '../types/k12.js';
import {
  K16DataPayload,
  ZarrinCatalogItem,
  ZarrinDocumentOutboxEntry,
  ZarrinSyncSummary,
  SettlementPartnerAccount,
  SettlementTransaction,
  SettlementLedgerSummary,
  SettlementTransactionType,
  TripartiteReconciliationItem,
  TripartiteReconciliationSummary
} from '../types/k16.js';
import {
  K17DataPayload,
  OwnershipClaim,
  WarrantyCard,
  OwnershipTransferRequest,
  StolenReport,
  UidScanResult,
  WarrantyServiceLog
} from '../types/k17.js';
import {
  K18DataPayload,
  ServiceTicket,
  RepairWorkshop,
  K18TicketStage,
  K18ServiceCategory
} from '../types/k18.js';
import {
  K19DataPayload,
  BuybackRecord,
  K19BuybackSource,
  K19ConditionGrade,
  K19PayoutMethod,
  K19AssayMethod,
  K19PricingValuation
} from '../types/k19.js';
import {
  K20DataPayload,
  K20RefurbishedItem,
  K20MeltBatch,
  K20GemRecovery,
  K20RefurbishStatus,
  K20MeltStatus,
  K20GemRecoveryStatus
} from '../types/k20.js';
import {
  MasterDataCategory,
  MasterDataItem,
  MasterDataPayload
} from '../types/masterData.js';
import { PaasDataPayload, EventBusMessage } from '../types/paas.js';
import { BiDataPayload } from '../types/bi.js';

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
const K11_API_BASE = '/api/admin/kernel/k11';
const K12_API_BASE = '/api/admin/kernel/k12';
const MASTERDATA_API_BASE = '/api/admin/masterdata';

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

export interface DatabaseHealthData {
  engine: 'independent_local_acid' | 'self_hosted_postgres';
  status: 'connected' | 'healthy' | 'degraded';
  vendorLockIn: false;
  databaseUrlConfigured: boolean;
  persistenceMode: 'disk_volume_acid' | 'relational_db';
  dataDirectory: string;
  backupDirectory: string;
  lastBackupTimestamp: string | null;
  totalEntitiesCount: number;
  message: string;
  latencyMs: number;
  configured?: boolean;
}

export async function apiGetDatabaseHealth(): Promise<DatabaseHealthData> {
  const response = await fetch(`${API_BASE}/database/health`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('خطا در بررسی اتصال پایگاه داده مستقل');
  }
  const result = await response.json();
  return result.data;
}

export async function apiCreateDatabaseBackup(): Promise<{ success: boolean; message: string; filename?: string }> {
  const response = await fetch(`${API_BASE}/database/backup`, {
    method: 'POST',
    headers: { 'Accept': 'application/json' }
  });
  return response.json();
}

// Backward compatibility alias for UI components
export const apiGetSupabaseHealth = async (): Promise<any> => {
  return apiGetDatabaseHealth();
};

export const apiSyncToSupabase = async (): Promise<{ success: boolean; message: string }> => {
  return apiCreateDatabaseBackup();
};

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

// ---------------------------------------------------------------------------
// K11: Retailer Lifecycle & Commercial Access (چرخه خرده‌فروش و دسترسی تجاری)
// ---------------------------------------------------------------------------

export async function fetchK11Data(): Promise<K11DataPayload> {
  const response = await fetch(K11_API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'خطا در دریافت اطلاعات K11' }));
    throw new Error(err.error || 'خطا در برقراری ارتباط با سرویس خرده‌فروشان K11');
  }
  const result = await response.json();
  return result.data;
}

export async function apiCreateRetailer(payload: Partial<Retailer>): Promise<Retailer> {
  const response = await fetch(`${K11_API_BASE}/retailers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت پرونده خرده‌فروش جدید');
  }
  return result.data;
}

export async function apiUpdateRetailerTier(
  id: string,
  tierUpdates: {
    tier: CommercialTier;
    trustScore: number;
    creditLimitToman: number;
    creditLimitGoldGrams: number;
    wageDiscountPercent: number;
    paymentTenorDays: 0 | 7 | 15 | 30 | 45 | 60;
    allowPostDatedCheque: boolean;
    allowScrapGoldBarter: boolean;
    guaranteeDocReference?: string;
    notesFa?: string;
  }
): Promise<Retailer> {
  const response = await fetch(`${K11_API_BASE}/retailers/${id}/tier`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(tierUpdates)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در به‌روزرسانی رتبه تجاری و سقف اعتبار');
  }
  return result.data;
}

export async function apiUpdateRetailerTerritory(
  id: string,
  territoryUpdates: Partial<RetailerTerritory>
): Promise<Retailer> {
  const response = await fetch(`${K11_API_BASE}/retailers/${id}/territory`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(territoryUpdates)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در تخصیص قلمرو و ویزیتور میدانی');
  }
  return result.data;
}

export async function apiUpdateRetailerBasket(
  id: string,
  basketUpdates: Partial<RetailerAllowedBasket>
): Promise<Retailer> {
  const response = await fetch(`${K11_API_BASE}/retailers/${id}/basket`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(basketUpdates)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در به‌روزرسانی سبد کالای مجاز خرده‌فروش');
  }
  return result.data;
}

export async function apiChangeRetailerStatus(
  id: string,
  status: RetailerLifecycleStatus,
  reasonFa: string
): Promise<Retailer> {
  const response = await fetch(`${K11_API_BASE}/retailers/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ status, reasonFa })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در تغییر وضعیت چرخه عمر خرده‌فروش');
  }
  return result.data;
}

export async function apiAddRetailerException(
  id: string,
  exceptionData: {
    expiryDateFa: string;
    authorizedByFa: string;
    temporaryCreditBonusGoldGrams: number;
    temporaryCreditBonusToman: number;
    reasonFa: string;
  }
): Promise<Retailer> {
  const response = await fetch(`${K11_API_BASE}/retailers/${id}/exception`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(exceptionData)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت استثنای تجاری موقت');
  }
  return result.data;
}

export async function fetchK12Data(): Promise<K12DataPayload> {
  const response = await fetch(K12_API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'خطا در بارگذاری اطلاعات K12' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  const result = await response.json();
  return result.data;
}

export async function apiCreateAgent(agentData: Partial<FieldAgent>): Promise<FieldAgent> {
  const response = await fetch(`${K12_API_BASE}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(agentData)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت مأمور میدانی');
  }
  return result.data;
}

export async function apiUpdateAgentStatus(agentId: string, dutyStatus: AgentDutyStatus): Promise<FieldAgent> {
  const response = await fetch(`${K12_API_BASE}/agents/${agentId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ dutyStatus })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در به‌روزرسانی وضعیت شیفت مأمور');
  }
  return result.data;
}

export async function apiToggleAgentActive(agentId: string, isActive?: boolean): Promise<FieldAgent> {
  const response = await fetch(`${K12_API_BASE}/agents/${agentId}/toggle-active`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ isActive })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در تغییر وضعیت فعال/غیرفعال مأمور');
  }
  return result.data;
}

export async function apiAssignAgentTerritory(agentId: string, territoryId: string): Promise<FieldAgent> {
  const response = await fetch(`${K12_API_BASE}/agents/${agentId}/territory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ territoryId })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در تخصیص مأمور به قلمرو');
  }
  return result.data;
}

export async function apiAssignAgentBag(
  agentId: string,
  bagId: string,
  bagCode: string,
  weightGrams: number
): Promise<FieldAgent> {
  const response = await fetch(`${K12_API_BASE}/agents/${agentId}/bag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ bagId, bagCode, weightGrams })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در تخصیص کیف هوشمند به مأمور');
  }
  return result.data;
}

export async function apiCreateTerritory(territoryData: Partial<Territory>): Promise<Territory> {
  const response = await fetch(`${K12_API_BASE}/territories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(territoryData)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ایجاد قلمرو جدید');
  }
  return result.data;
}

export async function apiScheduleVisit(visitData: Partial<FieldVisit>): Promise<FieldVisit> {
  const response = await fetch(`${K12_API_BASE}/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(visitData)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در زمان‌بندی ویزیت');
  }
  return result.data;
}

export async function apiCheckInVisit(
  visitId: string,
  lat: number,
  lng: number,
  distanceMeters: number
): Promise<FieldVisit> {
  const response = await fetch(`${K12_API_BASE}/visits/${visitId}/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ lat, lng, distanceMeters })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت حضور ژئوفنسینگ');
  }
  return result.data;
}

export async function apiCompleteVisit(
  visitId: string,
  outcomeData: {
    retailerFeedbackScore: number;
    retailerNotesFa: string;
    agentOutcomeNotesFa: string;
    showcaseInterestLevel: 'very_high' | 'high' | 'neutral' | 'low';
    carriedBagSealIntact: boolean;
  }
): Promise<FieldVisit> {
  const response = await fetch(`${K12_API_BASE}/visits/${visitId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(outcomeData)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت نهایی ویزیت');
  }
  return result.data;
}

export async function apiSubmitProxyOrder(
  proxyData: ProxyOrderDraft
): Promise<{ success: boolean; proxyOrderId: string; orderDraft: ProxyOrderDraft }> {
  const response = await fetch(`${K12_API_BASE}/proxy-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(proxyData)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت سفارش نیابتی');
  }
  return result.data;
}

export async function apiAddStoreToTerritory(territoryId: string, storeData: any): Promise<any> {
  const response = await fetch(`${K12_API_BASE}/territories/${territoryId}/stores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(storeData)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در افزودن فروشگاه به قلمرو');
  }
  return result.data;
}

export async function apiRecordVisitOutcome(visitId: string, outcomeData: any): Promise<FieldVisit> {
  const response = await fetch(`${K12_API_BASE}/visits/${visitId}/outcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(outcomeData)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ثبت وضعیت مراجعه و فاکتور');
  }
  return result.data;
}

// Master Data Management (MDM) API Calls
export async function fetchMasterData(): Promise<MasterDataPayload> {
  const response = await fetch(MASTERDATA_API_BASE, {
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در دریافت اطلاعات داده‌های پایه');
  }
  return result.data;
}

export async function fetchMasterDataCategories(): Promise<MasterDataCategory[]> {
  const response = await fetch(`${MASTERDATA_API_BASE}/categories`, {
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در دریافت دسته‌بندی‌های داده پایه');
  }
  return result.data;
}

export async function apiCreateMasterCategory(payload: Partial<MasterDataCategory>): Promise<MasterDataCategory> {
  const response = await fetch(`${MASTERDATA_API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ایجاد دسته‌بندی داده پایه');
  }
  return result.data;
}

export async function apiDeleteMasterCategory(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${MASTERDATA_API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در حذف دسته‌بندی داده پایه');
  }
  return result;
}

export async function fetchMasterDataItems(categoryId: string, activeOnly = false): Promise<MasterDataItem[]> {
  const response = await fetch(`${MASTERDATA_API_BASE}/items?categoryId=${encodeURIComponent(categoryId)}&activeOnly=${activeOnly}`, {
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در دریافت گزینه‌های داده پایه');
  }
  return result.data;
}

export async function apiCreateMasterItem(payload: Partial<MasterDataItem>): Promise<MasterDataItem> {
  const response = await fetch(`${MASTERDATA_API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در ایجاد آیتم داده پایه');
  }
  return result.data;
}

export async function apiUpdateMasterItem(id: string, updates: Partial<MasterDataItem>): Promise<MasterDataItem> {
  const response = await fetch(`${MASTERDATA_API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(updates)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در به‌روزرسانی آیتم داده پایه');
  }
  return result.data;
}

export async function apiToggleMasterItemActive(id: string, isActive?: boolean): Promise<MasterDataItem> {
  const response = await fetch(`${MASTERDATA_API_BASE}/items/${id}/toggle-active`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ isActive })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در تغییر وضعیت آیتم داده پایه');
  }
  return result.data;
}

export async function apiDeleteMasterItem(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${MASTERDATA_API_BASE}/items/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در حذف آیتم داده پایه');
  }
  return result;
}

export async function apiReorderMasterItems(categoryId: string, orderedIds: string[]): Promise<MasterDataItem[]> {
  const response = await fetch(`${MASTERDATA_API_BASE}/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ categoryId, orderedIds })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'خطا در تغییر چیدمان آیتم‌های داده پایه');
  }
  return result.data;
}

export const api = {
  // Master Data
  getMasterData: fetchMasterData,
  getMasterCategories: fetchMasterDataCategories,
  createMasterCategory: apiCreateMasterCategory,
  deleteMasterCategory: apiDeleteMasterCategory,
  getMasterItems: fetchMasterDataItems,
  createMasterItem: apiCreateMasterItem,
  updateMasterItem: apiUpdateMasterItem,
  toggleMasterItemActive: apiToggleMasterItemActive,
  deleteMasterItem: apiDeleteMasterItem,
  reorderMasterItems: apiReorderMasterItems,

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
  getK11Data: fetchK11Data,
  getK12Data: fetchK12Data,
  // K12
  createAgent: apiCreateAgent,
  updateAgentStatus: apiUpdateAgentStatus,
  toggleAgentActive: apiToggleAgentActive,
  assignAgentTerritory: apiAssignAgentTerritory,
  assignAgentBag: apiAssignAgentBag,
  createTerritory: apiCreateTerritory,
  addStoreToTerritory: apiAddStoreToTerritory,
  scheduleVisit: apiScheduleVisit,
  checkInVisit: apiCheckInVisit,
  completeVisit: apiCompleteVisit,
  recordVisitOutcome: apiRecordVisitOutcome,
  submitProxyOrder: apiSubmitProxyOrder,
  // K11
  createRetailer: apiCreateRetailer,
  updateRetailerTier: apiUpdateRetailerTier,
  updateRetailerTerritory: apiUpdateRetailerTerritory,
  updateRetailerBasket: apiUpdateRetailerBasket,
  changeRetailerStatus: apiChangeRetailerStatus,
  addRetailerException: apiAddRetailerException,
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
  getDatabaseHealth: apiGetDatabaseHealth,
  createDatabaseBackup: apiCreateDatabaseBackup,
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
  recordVaultAudit: apiRecordVaultAudit,

  // RBAC & Kernel Access (DIDAR-KERNEL-ACCESS-CHANGE-001)
  getRoles: async (filters?: { category?: string; targetEnvironment?: string; query?: string }): Promise<RoleDefinition[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.targetEnvironment) params.append('targetEnvironment', filters.targetEnvironment);
    if (filters?.query) params.append('query', filters.query);
    const res = await fetch(`/api/admin/kernel/rbac/roles?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  getPermissions: async (): Promise<PermissionDefinition[]> => {
    const res = await fetch('/api/admin/kernel/rbac/permissions');
    const json = await res.json();
    return json.data || [];
  },

  getRoleAssignments: async (filters?: { partyId?: string; organizationId?: string; membershipId?: string }): Promise<RoleAssignment[]> => {
    const params = new URLSearchParams();
    if (filters?.partyId) params.append('partyId', filters.partyId);
    if (filters?.organizationId) params.append('organizationId', filters.organizationId);
    if (filters?.membershipId) params.append('membershipId', filters.membershipId);
    const res = await fetch(`/api/admin/kernel/rbac/assignments?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  requestRoleAssignment: async (payload: {
    membershipId: string;
    roleKey: string;
    scope: { type: any; ids: string[]; labelFa?: string };
    validFrom?: string;
    validTo?: string | null;
    reason: string;
    expectedVersion?: number;
  }) => {
    const res = await fetch('/api/admin/kernel/rbac/assignments/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'خطا در ثبت درخواست انتساب نقش');
    }
    return json;
  },

  revokeRoleAssignment: async (assignmentId: string, reason: string) => {
    const res = await fetch(`/api/admin/kernel/rbac/assignments/${assignmentId}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'خطا در لغو انتساب نقش');
    }
    return json;
  },

  getEffectiveAccess: async (partyId: string, context: WorkContext): Promise<EffectiveAccessResult> => {
    const res = await fetch('/api/admin/kernel/rbac/effective-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partyId, context })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'خطا در استعلام دسترسی مؤثر');
    }
    return json.data;
  },

  getUserWorkspaces: async (partyId?: string) => {
    const headers: Record<string, string> = {};
    if (partyId) headers['x-actor-party-id'] = partyId;
    const res = await fetch('/api/me/workspaces', { headers });
    const json = await res.json();
    return json.data;
  },

  // -------------------------------------------------------------
  // Kernel 16 (K16): Settlement & Zarrin Reconciliation
  // -------------------------------------------------------------
  getK16Data: async (): Promise<K16DataPayload> => {
    const res = await fetch('/api/admin/kernel/k16');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در بارگذاری داده‌های تسویه و تطبیق زرین K16');
    return json.data;
  },

  syncZarrinCatalog: async (): Promise<{ syncedCount: number; updatedCount: number }> => {
    const res = await fetch('/api/admin/kernel/k16/catalog/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در همگام‌سازی کاتالوگ زرین');
    return json.data;
  },

  queueZarrinVoucher: async (payload: {
    idempotencyKey: string;
    eventType?: string;
    eventTypeFa?: string;
    sourceDomain?: string;
    referenceId?: string;
    retailerOrgId?: string;
    retailerName?: string;
    items?: any[];
    totalGoldWeightGrams?: number;
    totalAmountRials?: number;
    autoDispatch?: boolean;
  }): Promise<{ document: ZarrinDocumentOutboxEntry; isDuplicatePrevented: boolean }> => {
    const res = await fetch('/api/admin/kernel/k16/outbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در صدور سند حسابداری در زرین');
    return { document: json.data, isDuplicatePrevented: json.isDuplicatePrevented };
  },

  dispatchZarrinDocument: async (documentId: string): Promise<ZarrinDocumentOutboxEntry> => {
    const res = await fetch(`/api/admin/kernel/k16/outbox/${documentId}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ارسال سند به زرین');
    return json.data;
  },

  retryFailedZarrinDocuments: async (): Promise<{ retriedCount: number; succeededCount: number }> => {
    const res = await fetch('/api/admin/kernel/k16/outbox/retry-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ارسال مجدد اسناد ناموفق');
    return json.data;
  },

  toggleZarrinOfflineSimulation: async (offline: boolean): Promise<{ isOffline: boolean; message: string }> => {
    const res = await fetch('/api/admin/kernel/k16/offline-toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offline })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در تغییر وضعیت اتصال');
    return json;
  },

  resolveZarrinDiscrepancy: async (
    documentId: string,
    resolutionNote: string,
    actor?: string
  ): Promise<ZarrinDocumentOutboxEntry> => {
    const res = await fetch(`/api/admin/kernel/k16/outbox/${documentId}/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolutionNote, actor })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ثبت رفع مغایرت');
    return json.data;
  },

  simulateOrderVoucher: async (orderId: string): Promise<{ document: ZarrinDocumentOutboxEntry; isDuplicatePrevented: boolean }> => {
    const res = await fetch('/api/admin/kernel/k16/simulate-order-voucher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ایجاد سند فروش سفارش');
    return { document: json.data, isDuplicatePrevented: json.isDuplicatePrevented };
  },

  getK16SettlementAccounts: async (): Promise<{ accounts: SettlementPartnerAccount[]; summary: SettlementLedgerSummary }> => {
    const res = await fetch('/api/admin/kernel/k16/settlement/accounts');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در دریافت حساب‌های تسویه');
    return json.data;
  },

  getK16SettlementTransactions: async (): Promise<SettlementTransaction[]> => {
    const res = await fetch('/api/admin/kernel/k16/settlement/transactions');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در دریافت تراکنش‌های تسویه');
    return json.data;
  },

  recordK16SettlementTransaction: async (payload: {
    partnerId: string;
    type: SettlementTransactionType;
    goldWeightGrams: number;
    fiatAmountToman: number;
    referenceBankTraceNo?: string;
    registeredBy?: string;
    noteFa?: string;
  }): Promise<{ transaction: SettlementTransaction; zarrinOutboxDoc?: ZarrinDocumentOutboxEntry }> => {
    const res = await fetch('/api/admin/kernel/k16/settlement/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ثبت تراکنش تسویه');
    return json.data;
  },

  executeK16BilateralNetting: async (payload: {
    partnerId: string;
    customGoldWeight?: number;
    customPriceToman?: number;
  }): Promise<{ settlementTransaction: SettlementTransaction; nettedGoldGrams: number; nettedFiatToman: number }> => {
    const res = await fetch('/api/admin/kernel/k16/settlement/bilateral-netting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در اجرای تهاتر دوطرفه');
    return json.data;
  },

  syncK13InvoiceToZarrin: async (invoiceId: string): Promise<{ document: ZarrinDocumentOutboxEntry; isDuplicatePrevented: boolean; invoiceNumber: string }> => {
    const res = await fetch('/api/admin/kernel/k16/sync-invoice-voucher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ارسال صورتحساب به زرین');
    return json.data;
  },

  toggleK16CatalogReservation: async (itemId: string, bagOrOrderId?: string): Promise<ZarrinCatalogItem> => {
    const res = await fetch(`/api/admin/kernel/k16/catalog/${itemId}/reserve-toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bagOrOrderId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در تغییر وضعیت رزرو کالا');
    return json.data;
  },

  getK16TripartiteReconciliation: async (): Promise<{
    items: TripartiteReconciliationItem[];
    summary: TripartiteReconciliationSummary;
  }> => {
    const res = await fetch('/api/admin/kernel/k16/reconciliation');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در بارگذاری تطبیق سه‌جانبه');
    return json.data;
  },

  autoFixK16TripartiteDiscrepancy: async (
    recordId: string
  ): Promise<{ success: boolean; message: string; updatedRecord?: TripartiteReconciliationItem }> => {
    const res = await fetch('/api/admin/kernel/k16/reconciliation/auto-fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در رفع خودکار مغایرت');
    return json;
  },

  batchReconcileK16Tripartite: async (): Promise<{
    success: boolean;
    message: string;
    reconciledCount: number;
  }> => {
    const res = await fetch('/api/admin/kernel/k16/reconciliation/batch-reconcile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در تطبیق دسته‌ای اسناد');
    return json;
  },

  // Kernel 17: Consumer Ownership Claims, Provenance & Warranty
  getK17Data: async (): Promise<K17DataPayload> => {
    const res = await fetch('/api/admin/kernel/k17');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در بارگذاری داده‌های K17');
    return json.data;
  },

  scanK17Uid: async (query: string): Promise<UidScanResult> => {
    const res = await fetch(`/api/admin/kernel/k17/scan/${encodeURIComponent(query)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در استعلام شناسنامه UID');
    return json.data;
  },

  createK17Claim: async (payload: {
    itemUid: string;
    productTitleFa?: string;
    caratFa?: string;
    weightGrams?: number;
    consumerFullNameFa: string;
    consumerNationalId: string;
    consumerMobile: string;
    consumerCityFa?: string;
    retailerNameFa: string;
    salesInvoiceNumber: string;
    purchasePriceToman?: number;
    guildPermitNo?: string;
  }): Promise<{ success: boolean; claim: OwnershipClaim; warranty: WarrantyCard; message: string }> => {
    const res = await fetch('/api/admin/kernel/k17/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ثبت سند مالکیت مصرف‌کننده');
    return json;
  },

  requestK17Transfer: async (payload: {
    claimId: string;
    newOwnerNameFa: string;
    newOwnerNationalId: string;
    newOwnerMobile: string;
    reasonFa?: string;
  }): Promise<{ success: boolean; transfer: OwnershipTransferRequest; message: string }> => {
    const res = await fetch('/api/admin/kernel/k17/transfer/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ثبت درخواست انتقال مالکیت');
    return json;
  },

  confirmK17Transfer: async (payload: {
    transferId: string;
    otpCode: string;
  }): Promise<{ success: boolean; updatedClaim: OwnershipClaim; message: string }> => {
    const res = await fetch('/api/admin/kernel/k17/transfer/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در تأیید انتقال سند');
    return json;
  },

  reportK17Stolen: async (payload: {
    itemUid: string;
    reporterNameFa: string;
    reporterMobile?: string;
    policeStationFa: string;
    policeCaseNumber: string;
    descriptionFa?: string;
  }): Promise<{ success: boolean; report: StolenReport; message: string }> => {
    const res = await fetch('/api/admin/kernel/k17/stolen/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ثبت هشدار سرقت');
    return json;
  },

  resolveK17Stolen: async (reportId: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/admin/kernel/k17/stolen/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در لغو اعلام سرقت');
    return json;
  },

  addK17WarrantyService: async (payload: {
    warrantyId: string;
    serviceTypeFa: string;
    workshopNameFa?: string;
    descriptionFa: string;
    costToman?: number;
    wasFreeUnderWarranty?: boolean;
    officerNameFa?: string;
  }): Promise<{ success: boolean; serviceLog: WarrantyServiceLog; message: string }> => {
    const res = await fetch('/api/admin/kernel/k17/warranty/service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ثبت سرویس گارانتی');
    return json;
  },

  // ==================== K18: AFTER-SALES, RETURNS & REPAIRS ====================
  getK18Data: async (): Promise<K18DataPayload> => {
    const res = await fetch('/api/admin/kernel/k18');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در دریافت داده‌های K18');
    return json.data;
  },

  getK18TicketById: async (id: string): Promise<ServiceTicket> => {
    const res = await fetch(`/api/admin/kernel/k18/tickets/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در دریافت جزئیات پرونده تعمیر');
    return json.data;
  },

  createK18Ticket: async (payload: {
    itemUid: string;
    itemTitleFa: string;
    karatFa?: string;
    karatPurity?: number;
    consumerFullName: string;
    consumerMobile: string;
    consumerNationalId?: string;
    consumerCity?: string;
    intakeConditionNotesFa?: string;
    intakeStaffNameFa?: string;
    retailerNameFa?: string;
    priority?: 'normal' | 'express' | 'urgent_vip';
    serviceCategory: K18ServiceCategory;
    serviceCategoryFa: string;
    intakeGrossWeightGrams: number;
    intakeTareGrams?: number;
    warrantyNumber?: string;
  }): Promise<{ success: boolean; data: ServiceTicket }> => {
    const res = await fetch('/api/admin/kernel/k18/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ثبت پرونده پذیرش جدید');
    return json;
  },

  updateK18TicketStage: async (
    ticketId: string,
    payload: {
      nextStage: K18TicketStage;
      workshopId?: string;
      operatorNameFa?: string;
      notesFa?: string;
      returnGrossWeightGrams?: number;
      actualLaborCostToman?: number;
      assayCert?: string;
    }
  ): Promise<{ success: boolean; data: ServiceTicket }> => {
    const res = await fetch(`/api/admin/kernel/k18/tickets/${encodeURIComponent(ticketId)}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در تغییر مرحله پرونده');
    return json;
  },

  getK18Workshops: async (): Promise<RepairWorkshop[]> => {
    const res = await fetch('/api/admin/kernel/k18/workshops');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در دریافت لیست کارگاه‌ها');
    return json.data;
  },

  // Kernel K19 - Buyback & Trade-In
  getK19Data: async (): Promise<K19DataPayload> => {
    const res = await fetch('/api/admin/kernel/k19');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در دریافت داده‌های بازخرید و معاوضه (K19)');
    return json.data;
  },

  getK19RecordById: async (id: string): Promise<BuybackRecord> => {
    const res = await fetch(`/api/admin/kernel/k19/records/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در دریافت جزئیات پرونده بازخرید');
    return json.data;
  },

  calculateK19Estimate: async (payload: {
    source: K19BuybackSource;
    purity: number;
    grossWeightGrams: number;
    tareWeightGrams?: number;
    hasPreciousStones?: boolean;
    certifiedStoneValuationToman?: number;
    conditionGrade?: K19ConditionGrade;
  }): Promise<{ assay: any; valuation: K19PricingValuation }> => {
    const res = await fetch('/api/admin/kernel/k19/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در محاسبه ارزش زنده بازخرید');
    return json.data;
  },

  createK19Record: async (payload: {
    itemUid?: string;
    itemTitleFa: string;
    source: K19BuybackSource;
    conditionGrade: K19ConditionGrade;
    sellerFullName: string;
    sellerNationalId: string;
    sellerMobile: string;
    sellerBankIban?: string;
    sellerBankNameFa?: string;
    sellerCity?: string;
    grossWeightGrams: number;
    tareWeightGrams?: number;
    testedKaratFa?: string;
    testedPurity?: number;
    hasPreciousStones?: boolean;
    preciousStoneDescriptionFa?: string;
    certifiedStoneValuationToman?: number;
    assayMethod?: K19AssayMethod;
    operatorNameFa?: string;
  }): Promise<{ success: boolean; data: BuybackRecord }> => {
    const res = await fetch('/api/admin/kernel/k19/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ثبت پذیرش پرونده بازخرید');
    return json;
  },

  updateK19Assay: async (
    id: string,
    payload: {
      testedPurity?: number;
      grossWeightGrams?: number;
      tareWeightGrams?: number;
      certifiedStoneValuationToman?: number;
      conditionGrade?: K19ConditionGrade;
      notesFa?: string;
      operatorNameFa?: string;
    }
  ): Promise<{ success: boolean; data: BuybackRecord }> => {
    const res = await fetch(`/api/admin/kernel/k19/records/${encodeURIComponent(id)}/assay`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در به‌روزرسانی کارشناسی و عیارسنجی');
    return json;
  },

  settleK19Record: async (
    id: string,
    payload: {
      method: K19PayoutMethod;
      transactionRef?: string;
      operatorNameFa?: string;
      vaultId?: string;
    }
  ): Promise<{ success: boolean; data: BuybackRecord }> => {
    const res = await fetch(`/api/admin/kernel/k19/records/${encodeURIComponent(id)}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در تسویه و پرداخت وجه بازخرید');
    return json;
  },

  routeK19Destination: async (
    id: string,
    payload: {
      destination: 'k20_refurbish_secondary' | 'k20_scrap_smelting' | 'k09_reserve_vault';
      notesFa?: string;
      operatorNameFa?: string;
    }
  ): Promise<{ success: boolean; data: BuybackRecord }> => {
    const res = await fetch(`/api/admin/kernel/k19/records/${encodeURIComponent(id)}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در هدایت کالا به مقصد فیزیکی');
    return json;
  },

  // ==========================================
  // K20 Domain: Secondary Market, Refurbishment & Scrap Smelting/Recycling
  // ==========================================
  getK20Data: async (): Promise<{ success: boolean; data: K20DataPayload }> => {
    const res = await fetch('/api/admin/kernel/k20');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در دریافت داده‌های دامنه K20');
    return json;
  },

  getK20RefurbishedItem: async (id: string): Promise<{ success: boolean; data: K20RefurbishedItem }> => {
    const res = await fetch(`/api/admin/kernel/k20/refurbished/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در دریافت جزئیات قطعه احیاشده');
    return json;
  },

  createK20RefurbishedIntake: async (payload: {
    sourceBuybackId?: string;
    originalTitleFa: string;
    categoryFa: string;
    grossWeightGrams: number;
    netGoldWeightGrams?: number;
    hasPreciousStones?: boolean;
    gemsDescriptionFa?: string;
    workshopNameFa?: string;
    artisanNameFa?: string;
    refurbishCostToman?: number;
    beforeAfterNotesFa?: string;
  }): Promise<{ success: boolean; data: K20RefurbishedItem }> => {
    const res = await fetch('/api/admin/kernel/k20/refurbished', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ثبت پذیرش قطعه در کارگاه احیا');
    return json;
  },

  updateK20RefurbishedStatus: async (
    id: string,
    payload: {
      status: K20RefurbishStatus;
      qcScore?: number;
      qcInspectorFa?: string;
      passportUid?: string;
      notesFa?: string;
      operatorNameFa?: string;
    }
  ): Promise<{ success: boolean; data: K20RefurbishedItem }> => {
    const res = await fetch(`/api/admin/kernel/k20/refurbished/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در به‌روزرسانی وضعیت احیا و QC');
    return json;
  },

  getK20MeltBatch: async (id: string): Promise<{ success: boolean; data: K20MeltBatch }> => {
    const res = await fetch(`/api/admin/kernel/k20/melt-batches/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در دریافت اطلاعات بوته ذوب');
    return json;
  },

  createK20MeltBatch: async (payload: {
    crucibleNumber: string;
    furnaceOperatorFa?: string;
    sourceItemsCount?: number;
    sourceItemsSummaryFa?: string;
    totalInputWeightGrams: number;
    expectedPurity?: number;
    destination?: 'k09_reserve_vault' | 'k07_supplier_workshop' | 'treasury_sale';
  }): Promise<{ success: boolean; data: K20MeltBatch }> => {
    const res = await fetch('/api/admin/kernel/k20/melt-batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ایجاد بوته ذوب جدید');
    return json;
  },

  updateK20MeltBatchStatus: async (
    id: string,
    payload: {
      status: K20MeltStatus;
      meltedIngotWeightGrams?: number;
      assayLabNameFa?: string;
      assayCertificateNumber?: string;
      certifiedPurity?: number;
      destination?: 'k09_reserve_vault' | 'k07_supplier_workshop' | 'treasury_sale';
      operatorNameFa?: string;
    }
  ): Promise<{ success: boolean; data: K20MeltBatch }> => {
    const res = await fetch(`/api/admin/kernel/k20/melt-batches/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در به‌روزرسانی بوته و ثبت نتایج عیارسنجی ری‌گیری');
    return json;
  },

  createK20GemRecovery: async (payload: {
    gemTypeFa: string;
    sourceBuybackNumber?: string;
    caratWeight: number;
    cutShapeFa?: string;
    colorGrade?: string;
    clarityGrade?: string;
    estimatedValueToman: number;
    gemologistFa?: string;
    allocatedVaultFa?: string;
  }): Promise<{ success: boolean; data: K20GemRecovery }> => {
    const res = await fetch('/api/admin/kernel/k20/gems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در ثبت گوهرسنگ بازیابی‌شده');
    return json;
  },

  updateK20GemStatus: async (
    id: string,
    payload: {
      status: K20GemRecoveryStatus;
      allocatedVaultFa?: string;
      operatorNameFa?: string;
    }
  ): Promise<{ success: boolean; data: K20GemRecovery }> => {
    const res = await fetch(`/api/admin/kernel/k20/gems/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطا در به‌روزرسانی وضعیت گوهرسنگ');
    return json;
  },

  // PaaS Platform as a Service API
  getPaasData: async (): Promise<{ success: boolean; data: PaasDataPayload }> => {
    const res = await fetch('/api/admin/paas');
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'خطا در دریافت اطلاعات لایه پلتفرم (PaaS)');
    return json;
  },

  dispatchPaasEvent: async (payload: {
    topic: string;
    sourceDomain: string;
    payloadSummaryFa: string;
  }): Promise<{ success: boolean; data: EventBusMessage; message: string }> => {
    const res = await fetch('/api/admin/paas/events/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'خطا در انتشار رویداد گذرگاه');
    return json;
  },

  // Business Intelligence (BI) API
  getBiData: async (): Promise<{ success: boolean; data: BiDataPayload }> => {
    const res = await fetch('/api/admin/bi');
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'خطا در دریافت اطلاعات هوش تجاری (BI)');
    return json;
  },

  resolveBiAnomaly: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`/api/admin/bi/anomalies/${encodeURIComponent(id)}/resolve`, {
      method: 'POST'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'خطا در پیگیری ناهنجاری هوش تجاری');
    return json;
  },

  // 5-Layer Multi-Tier Enterprise Architecture Telemetry
  getArchitectureData: async (): Promise<{
    success: boolean;
    data: {
      timestamp: string;
      overallHealthScore: number;
      flowDirection: string;
      layers: Array<{
        layerNumber: 1 | 2 | 3 | 4 | 5;
        name: string;
        nameFa: string;
        category: string;
        status: 'healthy' | 'operational' | 'degraded';
        latencyMs: number;
        componentsCount: number;
        descriptionFa: string;
        technologies: string[];
        metrics: Record<string, any>;
      }>;
    };
  }> => {
    const res = await fetch('/api/admin/architecture');
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'خطا در دریافت تله‌متری لایه‌های معماری');
    return json;
  }
};

