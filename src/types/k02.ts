/**
 * Didar Gold Platform - Domain K02 Types
 * Progressive Onboarding, Trust Tiers & Commercial Gold Entitlements
 */

export type TrustTier =
  | 'tier_0_guest'
  | 'tier_1_identity'
  | 'tier_2_business'
  | 'tier_3_commercial'
  | 'TIER_1_BASIC'
  | 'TIER_2_VERIFIED'
  | 'TIER_3_COMMERCIAL'
  | 'TIER_4_STRATEGIC';

export type OnboardingStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'needs_amendment'
  | 'expert_assigned'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONDITIONAL';

export type ChecklistStepKey =
  | 'basic_identity'
  | 'phone_verified'
  | 'guild_license'
  | 'store_inspection'
  | 'expert_call'
  | 'agreement_accepted'
  | 'financial_guarantee'
  | string;

export interface VerificationCallLog {
  calledAt?: string;
  timestamp?: string;
  callerId?: string;
  callerName: string;
  contactNumber?: string;
  calledNumber?: string;
  result?: string;
  outcome?: 'successful' | 'failed' | 'requires_followup' | 'VERIFIED' | 'UNREACHABLE' | 'SUSPICIOUS' | string;
  notes: string;
}

export interface ChecklistStep {
  stepKey: ChecklistStepKey;
  labelFa?: string;
  titleFa?: string;
  labelEn?: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  requiredForTier?: TrustTier;
}

export interface CommercialEntitlements {
  targetId: string;
  targetType: 'person' | 'organization' | 'party';
  targetName: string;
  tier: TrustTier;
  dailyGoldLimitGrams: number;
  creditAllowanceGrams: number;
  canAccessWholesaleMarket: boolean;
  canPlaceCustomOrders: boolean;
  canAccessConsignment: boolean;
  dealerMarginDiscountPercent: number;
  isCommercialLocked: boolean;
  lockReason?: string;
  lockedAt?: string;
  lockedBy?: string;
  lastTierUpgradedAt?: string;
}

export interface TrustTierConfig {
  tier?: TrustTier;
  titleFa: string;
  titleEn?: string;
  badgeColor?: string;
  descriptionFa: string;
  maxDailyGoldGrams?: number;
  maxOrderGrams?: number;
  maxCreditAllowanceGrams?: number;
  maxCreditLimitToman?: number;
  settlementWindowDays?: number;
  requiresGuildLicense?: boolean;
  requiresFinancialClearance?: boolean;
  requiredDocuments?: string[];
  allowedFeatures?: string[];
}

export interface OnboardingApplication {
  id: string;
  applicationNumber?: string;
  targetType: 'person' | 'organization' | 'party';
  targetId: string;
  targetName: string;
  applicantName?: string;
  applicantType?: 'person' | 'organization';
  partyId?: string;
  organizationId?: string;
  targetTypeLabel?: string;
  applicantPhone?: string;
  province?: string;
  city?: string;
  currentTier?: TrustTier;
  targetTier?: TrustTier;
  requestedTier: TrustTier;
  status: OnboardingStatus;
  statusFa?: string;
  riskScore?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  assignedOfficer?: string;
  submissionDate?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  amendmentNotes?: string;
  checklist: ChecklistStep[];
  verificationCalls: VerificationCallLog[];
  commercialEntitlements?: CommercialEntitlements;
  updatedAt?: string;
  version: number;
}

export interface K02DataPayload {
  applications: OnboardingApplication[];
  entitlements: Record<string, CommercialEntitlements>;
  tierConfigs: Record<string, TrustTierConfig>;
  tierStats?: any;
  stats?: {
    totalApplications: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalGoldLimitGrams: number;
    totalCreditAllowanceGrams: number;
  };
}
