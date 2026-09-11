/**
 * Didar Gold Platform - Domain K04: Approvals, Exceptions & Audit (تأیید، استثنا و حسابرسی)
 * Implements Four-Eyes Principle (تفکیک وظایف), Dual-Authorization Workflows,
 * Commercial Exception Waivers, and Immutable Cryptographic Audit Log Chains.
 */

import { UserRole } from './k03.js';

export type ApprovalCategory =
  | 'physical_gold_release'       // ترخیص فیزیکی شمش و طلا از خزانه مرکزی
  | 'credit_limit_exception'      // افزایش استثنایی یا موقت سقف اعتبار تجاری بنکدار
  | 'wage_discount_exception'     // تخفیف استثنایی یا صفر نمودن اجرت ساخت
  | 'unverified_settlement_override' // تطبیق و تسویه استثنایی اسناد مالی بدون تأیید بانکی خودکار
  | 'kyc_tier_override';          // ارتقای استثنایی رتبه اعتماد مشتری یا بنکدار

export type ApprovalUrgency = 'normal' | 'high' | 'critical';

export type ApprovalStatus =
  | 'pending_first_approval'     // در انتظار تایید مرحله اول (متصدی یا کارشناس ریسک)
  | 'pending_second_approval'    // در انتظار تایید مرحله دوم (اصل چهارچشم - مدیر ارشد)
  | 'approved'                   // تصویب قطعی و نهایی
  | 'rejected'                   // رد شده
  | 'cancelled';                 // لغو شده توسط ثبت‌کننده

export interface ApprovalStep {
  stepNumber: number;
  titleFa: string;
  requiredRole: UserRole | 'executive_committee';
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  actorId?: string;
  actorName?: string;
  actorRoleFa?: string;
  actedAt?: string;
  notes?: string;
  digitalSignature?: string; // SHA-256 digital stamp
}

export interface ApprovalRequest {
  id: string;
  requestCode: string;
  category: ApprovalCategory;
  categoryTitleFa: string;
  title: string;
  description: string;
  urgency: ApprovalUrgency;
  status: ApprovalStatus;
  goldWeightGrams?: number;      // وزن شمش یا طلای درخواستی به گرم
  goldPurityCarat?: number;      // عیار طلا (۷۵۰، ۹۹۵، مسکوک)
  financialValueIrr?: number;    // ارزش ریالی تخمینی
  partyId?: string;              // شناسه شخص یا بنکدار ذینفع
  partyNameFa?: string;          // نام طرف حساب
  initiatorId: string;
  initiatorName: string;
  initiatorRoleFa: string;
  createdAt: string;
  expiresAt: string;
  steps: ApprovalStep[];
  currentStepNumber: number;
  totalSteps: number;
  resolutionNotes?: string;
}

export interface CommercialException {
  id: string;
  exceptionCode: string;
  titleFa: string;
  descriptionFa: string;
  category: ApprovalCategory;
  partyNameFa: string;
  goldWeightGrams: number;
  financialImpactIrr: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'expired' | 'revoked' | 'settled';
  grantedBy: string;
  grantedAt: string;
  validUntil: string;
  conditions: string[];
  referenceApprovalId?: string;
}

export interface AuditLogEntry {
  id: string;
  sequenceNumber: number;        // شماره بلوک تغییرناپذیر
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRoleFa: string;
  ipAddress: string;
  domainCode: string;            // K01, K02, K03, K04 ...
  actionCode: string;
  actionTitleFa: string;
  targetEntity: string;
  targetId: string;
  severity: 'info' | 'warning' | 'security' | 'critical';
  details: Record<string, unknown>;
  previousHash: string;          // هش بلوک قبلی جهت زنجیره تغییرناپذیر
  entryHash: string;             // هش رمزنگاری‌شده ورودی فعلی
}

export interface SodRule {
  id: string;
  titleFa: string;
  descriptionFa: string;
  category: ApprovalCategory;
  thresholdGrams: number;
  thresholdValueIrr: number;
  requiredApproverCount: number;
  initiatorForbiddenRoles: UserRole[];
  approverAllowedRoles: UserRole[];
  strictFourEyes: boolean;       // عدم امکان تصویب توسط شخص ثبت‌کننده
  autoExpireHours: number;
  violationsBlockedCount?: number;
}

export interface ChainIntegrityReport {
  isValid: boolean;
  verifiedBlocksCount: number;
  lastCheckedAt: string;
  genesisHash: string;
  latestHash: string;
  brokenBlockIndex?: number;
}

export interface K04DataPayload {
  approvalRequests: ApprovalRequest[];
  exceptions: CommercialException[];
  auditLogs: AuditLogEntry[];
  sodRules: SodRule[];
  chainIntegrity: ChainIntegrityReport;
  metrics: {
    pendingApprovalsCount: number;
    activeExceptionsCount: number;
    todayAuditCount: number;
    fourEyesViolationsBlocked: number;
    totalGoldUnderReviewGrams: number;
    totalFinancialValueIrr: number;
  };
}
