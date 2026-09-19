/**
 * Didar Gold Platform - Kernel 13 (K13): Gold Rates, Pricing, Terms & Invoicing
 * Subdomains:
 *   - K13A: Gold Reference Spot Rates & Quote Lock Engine (نرخ مرجع زنده طلا و موتور قفل مظنه)
 *   - K13B: Making Wage & Markup Matrix (ماتریس اجرت ساخت، سود دیدار و مالیات رسمی طلا)
 *   - K13C: Official Invoicing & Samaneh Moaddian Integration (صدور صورتحساب رسمی و سامانه مودیان)
 */

export type GoldRateSymbol =
  | 'GOLD_18K_750'
  | 'GOLD_24K_995'
  | 'GOLD_24K_999'
  | 'GOLD_MESGHAL_17K'
  | 'GOLD_OUNCE_USD'
  | 'SEKKE_EMAMI'
  | 'SEKKE_BAHAR'
  | 'SEKKE_NIM'
  | 'SEKKE_ROB';

export interface GoldSpotRate {
  id: string;
  symbol: GoldRateSymbol;
  titleFa: string;
  titleEn: string;
  buyPriceToman: number;
  sellPriceToman: number;
  changePercent24h: number;
  unitFa: string;
  source: string;
  updatedAtFa: string;
  isPrimaryReference: boolean;
}

export type QuoteLockStatus = 'active' | 'expired' | 'consumed' | 'revoked';

export interface PriceQuoteLock {
  quoteId: string;
  token: string; // Cryptographic hash
  buyerOrgId: string;
  buyerOrgNameFa: string;
  lockedRatePerGram750Toman: number;
  lockedAtFa: string;
  expiresAtFa: string;
  validitySeconds: number;
  remainingSeconds: number;
  status: QuoteLockStatus;
  statusFa: string;
  totalWeightGrams: number;
  calculatedTotalToman: number;
  purpose: string;
}

export type WageType = 'percentage' | 'fixed_per_gram' | 'hybrid';

export interface MakingWageRule {
  id: string;
  categoryKey: 'bangle' | 'ring' | 'necklace' | 'bracelet' | 'earring' | 'coin_bar' | 'stone_jewelry';
  categoryNameFa: string;
  wageType: WageType;
  baseWagePercent: number; // e.g. 7.5%
  baseWageFixedToman: number; // e.g. 180,000 Toman per gram
  didarMarginPercent: number; // سود عمده‌فروشی دیدار مثلاً 2.0%
  vatPercent: number; // طبق ماده 26 مالیات طلا: 10% فقط روی (اجرت + سود)
  minGrams: number;
  applicableTiers: ('T1' | 'T2' | 'T3')[];
  tierDiscountPercent: {
    T1: number; // مشتری جدید یا سطح ۱: بدون تخفیف
    T2: number; // مشتری معتبر سطح ۲: ۰.۵٪ تخفیف از اجرت
    T3: number; // همکار ویژه بنکداری سطح ۳: ۱.۲٪ تخفیف
  };
  notesFa?: string;
}

export type SettlementMode = 'rial_only' | 'gold_only' | 'split';

export interface InvoiceItem {
  id: string;
  sku: string;
  productCode: string; // کد کالا (شناسه یکتای کالا در انبار/سامانه مودیان)
  titleFa: string;
  categoryFa: string;
  carat: number; // 750, 995, 999.9
  weightGrams: number;
  spotGoldPricePerGramToman: number;
  goldPureValueToman: number; // وزن × نرخ روز هر گرم
  makingWageType: WageType;
  makingWagePercent: number;
  makingWageAmountToman: number;
  didarMarginPercent: number;
  didarMarginAmountToman: number;
  
  // قیمت واحد قبل از تخفیف (طلای خام + اجرت + سود)
  unitPriceToman: number; // نرخ کل ناخالص به ازای هر گرم
  unitPriceBeforeDiscountToman?: number;
  
  // قابلیت اعمال تخفیف خطی برای هر ردیف کالا (Line-Item Discount)
  itemDiscountPercent: number; // سقف انضباطی تخفیف خطی (±۱.۰۰٪)
  itemDiscountAmountToman: number;
  lineDiscountType?: 'percentage' | 'fixed_amount'; // نوع تخفیف خطی
  lineDiscountPercent?: number; // درصد تخفیف خطی اعمال‌شده روی این ردیف
  lineDiscountAmountToman?: number; // مبلغ ریالی تخفیف خطی برای این ردیف
  lineDiscountReasonFa?: string; // علت و مجوز اعطای تخفیف خطی
  
  // ارقام پس از تخفیف خطی و مالیات ماده ۲۶
  taxableAmountToman: number; // (اجرت + سود) پس از کسر تخفیف خطی ردیف
  vatRatePercent: number; // 10%
  vatAmountToman: number; // taxableAmount * 0.10
  netUnitPriceToman?: number; // قیمت واحد خالص هر گرم پس از تخفیف خطی
  totalPriceToman: number; // مبلغ کل ناخالص یا ناخالص با ارزش افزوده
  netLineTotalToman?: number; // مبلغ کل خالص نهایی ردیف
  
  // وضعیت تحویل به زرین پس از نهایی‌سازی فاکتور و کنترل اعتباری K14
  deliveryStatus?: 'pending_settlement' | 'ready_for_zarrin_delivery' | 'delivered_to_zarrin';
  deliveryStatusFa?: string;
  zarrinDeliveryDateFa?: string;
  zarrinDeliveryReceiptNumber?: string;
}

/**
 * ساختار داده استاندارد قلم صورتحساب K13 با جزئیات کالا به کالا و تخفیف خطی
 * K13 Detailed Invoice Line Item Data Structure
 */
export interface K13InvoiceLineItem {
  rowNumber: number; // شماره ردیف (۱، ۲، ...)
  productCode: string; // کد کالا (SKU / شناسه کالا در سامانه مودیان)
  titleFa: string; // نام و شرح کالا
  categoryKey: string; // کلید رسته (النگو، گردنبند، انگشتر، ...)
  categoryFa: string; // عنوان فارسی رسته
  carat: number; // عیار (۷۵۰ برای ۱۸ عیار)
  weightGrams: number; // وزن خالص به گرم (با ۳ رقم اعشار)
  
  // قیمت‌گذاری پایه و مظنه واحد
  unitSpotRateToman: number; // نرخ واحد هر گرم طلای خام (مظنه پایه ۷۵۰)
  pureGoldValueToman: number; // ارزش اصل طلای خام (وزن × نرخ واحد) - معاف از ارزش افزوده طبق ماده ۲۶
  
  // اجرت و کارمزد ساخت
  wageType: WageType; // درصد یا مبلغ ثابت
  wageRate: number; // درصد اجرت یا مبلغ ثابت به ازای هر گرم
  unitWageToman: number; // مبلغ اجرت ساخت هر گرم
  totalWageToman: number; // کل مبلغ اجرت ساخت این ردیف
  
  // سود و کارمزد پخش عمده
  marginPercent: number; // درصد سود عمده‌فروشی دیدار
  totalMarginToman: number; // کل مبلغ سود عمده‌فروشی این ردیف
  
  // قیمت واحد ناخالص قبل از تخفیف
  grossUnitPriceToman: number; // قیمت ناخالص هر گرم قبل از تخفیف
  grossLineTotalToman: number; // ارزش کل ناخالص ردیف قبل از تخفیف
  
  // قابلیت اعمال تخفیف خطی برای هر ردیف کالا (Line-Item Discount)
  lineDiscountType: 'percentage' | 'fixed_amount'; // درصد یا مبلغ ثابت
  lineDiscountPercent: number; // درصد تخفیف خطی (سقف مجاز: ±۱.۰۰٪)
  lineDiscountAmountToman: number; // مبلغ ریالی تخفیف خطی این ردیف
  lineDiscountReasonFa?: string; // علت تخفیف خطی (تخفیف همکاری، کسری اجرت، ...)
  
  // ارقام پس از اعمال تخفیف خطی و ماده ۲۶ مالیات طلا
  netUnitPriceToman: number; // قیمت واحد خالص هر گرم پس از اعمال تخفیف خطی
  taxableWageAndMarginToman: number; // ماخذ مشمول مالیات (اجرت + سود منهای تخفیف خطی)
  vatRatePercent: number; // نرخ مالیات ارزش افزوده (۱۰٪)
  vatAmountToman: number; // مالیات بر ارزش افزوده وصولی این ردیف (۱۰٪ ماخذ)
  netLineTotalToman: number; // جمع کل خالص این ردیف (اصل طلا + اجرت و سود خالص + مالیات)

  // وضعیت خودکار تحویل به زرین
  deliveryStatus?: 'pending_settlement' | 'ready_for_zarrin_delivery' | 'delivered_to_zarrin';
  deliveryStatusFa?: string;
  zarrinDeliveryDateFa?: string;
  zarrinDeliveryReceiptNumber?: string;
}

/**
 * ساختار جامع صورتحساب چندقلمی K13 با ریز کالا به کالا و تخفیفات خطی و سرجمع
 */
export interface K13DetailedInvoice {
  invoiceId: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  issueDateFa: string;
  dueDateFa?: string;
  
  buyer: {
    orgId: string;
    nameFa: string;
    nationalId: string;
    economicCode: string;
    tier: 'T1' | 'T2' | 'T3';
    addressFa?: string;
    phone?: string;
  };
  
  seller: {
    nameFa: string;
    nationalId: string;
    economicCode: string;
    addressFa?: string;
  };
  
  // لیست ریز اقلام کالا به کالا با تخفیف خطی مستقل
  lineItems: K13InvoiceLineItem[];
  
  // خلاصه‌های وزنی و ریالی تجمیعی
  totalItemsCount: number;
  totalWeightGrams: number;
  totalPureGoldValueToman: number; // ارزش اصل طلا (معاف از مالیات بر ارزش افزوده طبق ماده ۲۶)
  totalGrossWagesToman: number;
  totalGrossMarginsToman: number;
  totalLineDiscountsToman: number; // مجموع تخفیفات خطی ردیف‌ها
  
  // تخفیف حجمی کل صورتحساب (Volume Discount)
  volumeDiscountPercent: number; // سقف ±۲.۰۰٪
  volumeDiscountAmountToman: number;
  
  // ماخذ و مالیات ماده ۲۶ کل فاکتور
  totalTaxableBaseToman: number; // ماخذ نهایی مشمول مالیات
  totalVatToman: number; // کل مالیات ۱۰٪
  grandTotalToman: number; // مبلغ نهایی قابل پرداخت
  grandTotalRials: number;
  
  // نحوه تسویه (ریالی، طلایی، ترکیبی)
  settlement: {
    mode: SettlementMode;
    rialSplitPercent: number;
    goldSplitPercent: number;
    settlementRialAmountToman: number;
    settlementGoldWeightGrams750: number;
    isQuoteLocked: boolean;
    quoteLockId?: string;
    lockedRatePerGramToman?: number;
  };
  
  zarrinVoucher?: {
    voucherNumber: string;
    voucherDateFa: string;
    status: 'draft' | 'posted_to_zarrin' | 'reconciled';
    zarrinBatchId?: string;
  };
  
  moaddianStatus: MoaddianStatus;
  moaddianTrackingCode?: string;
}

export type InvoiceType = 'proforma' | 'official_tax_invoice' | 'credit_note';

export type InvoiceStatus =
  | 'draft'
  | 'locked_quote'
  | 'issued'
  | 'settled'
  | 'moaddian_sent'
  | 'cancelled';

export type MoaddianStatus = 'pending' | 'sent' | 'verified' | 'rejected' | 'exempt';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-1403-7740
  taxIdentificationNumber: string; // شناسه یکتای صورتحساب مالیاتی سامانه مودیان ۲۲ رقمی
  orderCode?: string; // ارجاع به سفارش K10
  invoiceType: InvoiceType;
  invoiceTypeFa: string;
  status: InvoiceStatus;
  statusFa: string;

  // Buyer Info
  buyerOrgId: string;
  buyerNameFa: string;
  buyerNationalId: string;
  buyerEconomicCode: string;
  buyerAddressFa: string;
  buyerPhone: string;
  retailerTier: 'T1' | 'T2' | 'T3';

  // Seller Info (Didar)
  sellerNameFa: string;
  sellerNationalId: string;
  sellerEconomicCode: string;
  sellerAddressFa: string;

  // Timestamps
  issueDateFa: string;
  dueDateFa: string;
  settledAtFa?: string;

  // Financial & Weight Summaries
  items: InvoiceItem[];
  totalWeightGrams: number;
  pureGoldEquivalentGrams750: number;
  totalPureGoldValueToman: number;
  totalMakingWageToman: number;
  totalDidarMarginToman: number;
  totalItemDiscountsToman: number;
  subtotalBeforeVolumeDiscountToman: number;

  // Volume-based discount on total invoice: max ±2.0%
  volumeDiscountPercent: number; // Between -2.00% and +2.00%
  volumeDiscountAmountToman: number;

  totalTaxableAmountToman: number;
  totalVatToman: number;
  grandTotalToman: number;
  grandTotalRials: number;

  // Dual/Split Settlement (بخشی ریالی، بخشی طلایی)
  settlementMode: SettlementMode;
  settlementModeFa: string;
  rialSplitPercent: number; // 0 to 100%
  goldSplitPercent: number; // 0 to 100%
  settlementRialAmountToman: number;
  settlementGoldWeightGrams750: number;
  isQuoteLocked: boolean; // الزام قفل مظنه در صورت وجود تسویه ریالی
  lockedQuoteRateToman?: number;
  quoteLockId?: string;

  // Terms & Payment
  paymentTermsFa: string;

  // Samaneh Moaddian
  moaddianStatus: MoaddianStatus;
  moaddianStatusFa: string;
  moaddianTrackingCode?: string;
  moaddianSentAtFa?: string;

  // Zarrin Integration Links (اتصال به ماژول تسویه و دفترکل زرین K16)
  zarrinVoucher?: {
    voucherNumber: string;
    voucherDateFa: string;
    rialDebitAccount: string; // نام حساب بدهکار ریالی (مثلاً مطالبات از گالری زمرد)
    rialAmountToman: number;
    goldDebitAccount: string; // نام حساب طلایی بدهکار (مثلاً کاردکس امانی/تسویه طلا)
    goldWeightGrams750: number;
    goldSpotRateAppliedToman: number;
    quoteLockId?: string;
    status: 'draft' | 'posted_to_zarrin' | 'reconciled';
    statusFa: string;
    zarrinBatchId: string;
  };

  // وضعیت تحویل اقلام صورتحساب به زرین (پس از نهایی‌سازی فاکتور و تایید اعتباری K14)
  deliveryStatus?: 'pending_settlement' | 'ready_for_zarrin_delivery' | 'delivered_to_zarrin';
  deliveryStatusFa?: string;
  zarrinDeliveryReceiptNumber?: string;
  zarrinDeliveryDateFa?: string;

  // ثبت و پیوند داده‌ای با هسته K14 (مواجهه اعتباری دوگانه طلا و ریال)
  k14ExposureRecorded?: {
    goldExposureIncrementGrams: number;
    rialExposureIncrementToman: number;
    recordedAtFa: string;
    buyerExposureStatus: string;
    collateralCoveragePercent: number;
    operatorFa?: string;
  };

  // ثبت و پیوند داده‌ای با هسته K15 (سند حسابداری دوطرفه دفتر دوگانه)
  k15VoucherRecorded?: {
    voucherNumber: string;
    voucherId: string;
    recordedAtFa: string;
    goldDebitGrams: number;
    fiatDebitToman: number;
    sourceKernel: string;
    status: 'posted' | 'reconciled';
    operatorFa?: string;
  };

  notes?: string;
  createdAt: string;
}

export interface TaxConsolidationPeriod {
  periodId: string;
  titleFa: string; // e.g. پاییز ۱۴۰۳ (فصل سوم)
  startDateFa: string;
  endDateFa: string;
  totalInvoicesCount: number;
  totalPureGoldGrams: number;
  totalPureGoldValueToman: number; // اصل طلا (معاف از مالیات بر ارزش افزوده طبق ماده ۲۶)
  totalWagesAndMarginsToman: number; // سود و اجرت ساخت (مشمول مالیات)
  totalDiscountsToman: number; // مجموع تخفیفات اقلام و حجمی
  taxableNetBaseToman: number; // ماخذ نهایی مشمول مالیات
  totalVatCollectedToman: number; // ۱۰٪ مالیات بر ارزش افزوده مطالبه‌شده
  moaddianDeclaredCount: number;
  moaddianPendingCount: number;
  status: 'open' | 'closed' | 'declared_to_tax_authority';
  statusFa: string;
}

export interface PriceCalculationInput {
  weightGrams: number;
  carat: number;
  categoryKey: string;
  wageType: WageType;
  wageValue: number;
  didarMarginPercent?: number;
  retailerTier?: 'T1' | 'T2' | 'T3';
  customSpotRateToman?: number;
  // Item level adjustment: max ±1.0%
  itemDiscountPercent?: number;
  // Total volume discount: max ±2.0%
  volumeDiscountPercent?: number;
  // Settlement mode preview
  settlementMode?: SettlementMode;
  rialSplitPercent?: number;
  goldSplitPercent?: number;
  quoteLockId?: string;
}

export interface PriceCalculationResult {
  weightGrams: number;
  effectiveSpotRateToman: number;
  goldPureValueToman: number;
  baseWageToman: number;
  tierDiscountToman: number;
  effectiveWageToman: number;
  didarMarginToman: number;
  itemDiscountPercent: number;
  itemDiscountAmountToman: number;
  volumeDiscountPercent: number;
  volumeDiscountAmountToman: number;
  taxableAmountToman: number; // مجموع اجرت و سود پس از تخفیفات (مشمول ارزش افزوده)
  vatAmountToman: number; // ۱۰٪ مالیات ارزش افزوده
  grandTotalToman: number;
  grandTotalRials: number;
  gramEffectivePriceToman: number;
  // Settlement preview
  settlementMode: SettlementMode;
  rialSplitPercent: number;
  goldSplitPercent: number;
  settlementRialAmountToman: number;
  settlementGoldWeightGrams750: number;
  isQuoteLocked: boolean;
  quoteLockRequired: boolean;
  quoteLockNoticeFa: string;
  vatLegalNoteFa: string;
}

export interface RatePermissionDef {
  key: RatePermissionKey;
  labelFa: string;
  descriptionFa: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type RatePermissionKey =
  | 'RATE_VIEW'
  | 'RATE_MANUAL_OVERRIDE'
  | 'SPREAD_CONFIG'
  | 'AUTO_FEED_TOGGLE'
  | 'DUAL_APPROVAL_SIGN'
  | 'CIRCUIT_BREAKER_TRIGGER';

export type RateUserRole =
  | 'CHIEF_TREASURER'
  | 'RATE_OPERATOR'
  | 'RISK_MANAGER'
  | 'BRANCH_TRADER'
  | 'AUDITOR';

export interface RateAuthorizedUser {
  id: string;
  nameFa: string;
  email: string;
  nationalId: string;
  departmentFa: string;
  role: RateUserRole;
  roleFa: string;
  partyId?: string; // ارجاع به عضویت هویتی پلتفرم دیدار (Core Party ID)
  organizationId?: string; // شناسه سازمان متبوع
  rbacRoleKey?: string; // کد نقش در سیستم سطوح دسترسی RBAC
  permissions: RatePermissionKey[];
  status: 'active' | 'suspended';
  maxAllowedDailyChangePercent: number; // e.g. 2.0%
  lastRateChangeAtFa?: string;
  twoFactorRequired: boolean;
  avatarUrl?: string;
}

export interface RateChangeAuditLog {
  id: string;
  rateId: string;
  symbol: GoldRateSymbol;
  titleFa: string;
  oldSellPrice: number;
  newSellPrice: number;
  deltaPercent: number;
  operatorId: string;
  operatorNameFa: string;
  operatorRoleFa: string;
  reason: string;
  status: 'applied' | 'pending_dual_approval' | 'rejected';
  statusFa: string;
  approverNameFa?: string;
  timestampFa: string;
  ipAddress: string;
}

export interface RateSecurityPolicy {
  dualApprovalThresholdPercent: number; // e.g. 1.5%
  circuitBreakerThresholdPercent: number; // e.g. 4.0%
  marketStatus: 'open' | 'frozen' | 'pre_market';
  feedSource: 'live_union_feed' | 'manual_governed' | 'hybrid';
  minSpreadToman: number;
  circuitBreakerReason?: string;
  lastUpdatedFa: string;
}

export interface K13DataPayload {
  rates: GoldSpotRate[];
  activeLocks: PriceQuoteLock[];
  wageRules: MakingWageRule[];
  invoices: Invoice[];
  taxConsolidations: TaxConsolidationPeriod[];
  authorizedUsers: RateAuthorizedUser[];
  auditLogs: RateChangeAuditLog[];
  securityPolicy: RateSecurityPolicy;
  metrics: {
    current18kPriceToman: number;
    currentMesghalPriceToman: number;
    activeLockedQuotesCount: number;
    totalInvoicesMonthToman: number;
    totalGoldWeightInvoicedGrams: number;
    moaddianSuccessRatePercent: number;
    lastRateFetchAt: string;
    totalAuthorizedOperatorsCount: number;
    pendingDualApprovalsCount: number;
  };
}
