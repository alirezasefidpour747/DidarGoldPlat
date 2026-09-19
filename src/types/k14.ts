/**
 * Didar Gold Platform - Kernel 14 (K14): Credit & Exposure Management
 * Types & Domain Model for Dual-Currency Credit, Collaterals & Risk Governance
 */

export type CreditRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type BuyerCreditStatus = 'active' | 'warning' | 'credit_locked' | 'suspended';

export type CollateralType =
  | 'sayad_cheque'          // چک صیادی بنفش
  | 'bank_guarantee'        // ضمانت‌نامه بانکی ریالی (LC)
  | 'physical_gold_deposit' // شمش امانی تودیع‌شده در خزانه امن K09
  | 'real_estate_deed'      // سند ملکی ترهین‌شده
  | 'cash_deposit';         // سپرده نقدی مسدودشده

export type CollateralStatus =
  | 'valid'
  | 'expiring_soon'
  | 'matured'
  | 'invoked'
  | 'released';

export type CollateralVerificationStatus =
  | 'verified_central_bank' // استعلام تاییدشده از بانک مرکزی / صیاد
  | 'in_vault_custody'      // تحویل‌شده به خزانه امن طلا (K09)
  | 'pending_inquiry';      // در انتظار استعلام

export interface BuyerCreditProfile {
  buyerId: string;
  buyerOrgNameFa: string;
  nationalId: string;
  economicCode: string;
  tier: 'T1' | 'T2' | 'T3';
  phone: string;
  addressFa: string;
  
  // سقف و مواجهه وزنی طلا (گرم ۱۸ عیار / ۷۵۰)
  goldCreditLimitGrams: number;
  goldExposureGrams: number;
  goldAvailableCreditGrams: number;
  goldUtilizationPercent: number;

  // سقف و مواجهه ریالی (تومان)
  rialCreditLimitToman: number;
  rialExposureToman: number;
  rialAvailableCreditToman: number;
  rialUtilizationPercent: number;

  // شاخص‌های سلامت اعتباری
  creditScore: number; // 0 - 100
  riskLevel: CreditRiskLevel;
  status: BuyerCreditStatus;
  lockReasonFa?: string;

  // وضعیت پوشش تضامین
  collateralTotalNominalToman: number;
  collateralEffectiveValueToman: number;
  collateralCoveragePercent: number; // نسبت به کل مواجهه ریالی + معادل ریالی طلای باز

  // عوامل و سرپرستان ارزیابی
  creditOfficerFa: string;
  lastReviewDateFa: string;
  nextReviewDateFa: string;
  activeOrdersCount: number;
  unsettledInvoicesCount: number;
}

export interface CollateralItem {
  id: string;
  buyerId: string;
  buyerOrgNameFa: string;
  collateralType: CollateralType;
  titleFa: string;
  identifierNumber: string; // شناسه صیادی ۱۶ رقمی / شماره ضمانت‌نامه / سریال شمش
  issuerBank: string;
  issuerBranch?: string;
  
  nominalValueToman: number; // ارزش اسمی وثیقه
  haircutPercent: number;    // درصد کسر ریسک (Haircut)
  effectiveValueToman: number; // ارزش موثر پذیرفته‌شده = nominal * (1 - haircut%)
  
  weightGrams?: number;      // وزن شمش طلا (در صورت تودیع طلا)
  carat?: number;            // عیار شمش طلا (۹۹۵ یا ۹۹۹.۹)
  vaultBagId?: string;       // کد بسته در خزانه K09
  
  depositDateFa: string;
  maturityDateFa: string;
  daysToMaturity: number;
  
  status: CollateralStatus;
  verificationStatus: CollateralVerificationStatus;
  custodianOfficerFa: string;
  notesFa?: string;
}

export interface CreditExposureAlert {
  id: string;
  buyerId: string;
  buyerOrgNameFa: string;
  severity: 'critical' | 'warning' | 'info';
  alertType: 'limit_breach' | 'cheque_due_soon' | 'collateral_undercoverage' | 'overdue_invoice';
  messageFa: string;
  timestampFa: string;
  metricValueText: string;
  isAcknowledged: boolean;
}

export interface CreditOverrideRequest {
  id: string;
  requestNumber: string;
  buyerId: string;
  buyerOrgNameFa: string;
  requestedByFa: string;
  requestDateFa: string;
  
  overrideType: 'temporary_gold_limit' | 'temporary_rial_limit' | 'order_force_release';
  requestedAmountText: string;
  requestedValueToman?: number;
  requestedWeightGrams?: number;
  
  reasonFa: string;
  status: 'pending_risk_review' | 'pending_board_approval' | 'approved' | 'rejected';
  
  currentUtilizationPercent: number;
  existingCollateralCoveragePercent: number;
  
  reviewedByFa?: string;
  approvedByFa?: string;
  decisionDateFa?: string;
  decisionNoteFa?: string;
  validUntilFa?: string;
}

export interface K14Metrics {
  totalCreditExtendedRialToman: number;
  totalExposureRialToman: number;
  rialUtilizationPercent: number;

  totalCreditExtendedGoldGrams: number;
  totalExposureGoldGrams: number;
  goldUtilizationPercent: number;

  totalCollateralsHeldToman: number;
  overallCoverageRatioPercent: number;

  activeProfilesCount: number;
  warningProfilesCount: number;
  lockedProfilesCount: number;
  pendingOverridesCount: number;
}

export interface K14DataPayload {
  metrics: K14Metrics;
  creditProfiles: BuyerCreditProfile[];
  collaterals: CollateralItem[];
  alerts: CreditExposureAlert[];
  overrideRequests: CreditOverrideRequest[];
}

/**
 * نتیجه نهایی‌سازی فاکتور K13 و اعمال در K14 و تحویل خودکار کالا به زرین
 */
export interface K13K14FinalizationResult {
  success: boolean;
  message: string;
  invoiceId: string;
  invoiceNumber: string;
  buyerOrgNameFa: string;
  goldExposureIncrementGrams: number;
  rialExposureIncrementToman: number;
  itemsDeliveredCount: number;
  totalWeightDeliveredGrams: number;
  zarrinDeliveryReceiptNumber: string;
  zarrinDeliveryDateFa: string;
  zarrinVoucherNumber: string;
  k15VoucherNumber?: string;
  k15DualLedgerPosted?: boolean;
  updatedCreditProfile: BuyerCreditProfile;
  alertsTriggered?: CreditExposureAlert[];
  warningNoteFa?: string;
}

/**
 * شبیه‌سازی اثر اعتباری پیش از نهایی‌سازی صورتحساب
 */
export interface CreditSimulationResult {
  allowed: boolean;
  reasonFa: string;
  buyerFound: boolean;
  buyerOrgNameFa?: string;
  currentGoldExposureGrams?: number;
  currentRialExposureToman?: number;
  projectedGoldExposureGrams?: number;
  projectedRialExposureToman?: number;
  projectedGoldUtilizationPercent?: number;
  projectedRialUtilizationPercent?: number;
  requiresOverride: boolean;
  collateralCoveragePercent?: number;
}

