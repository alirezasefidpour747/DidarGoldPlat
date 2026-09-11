/**
 * Didar Gold Platform - Kernel Domain K07 Types
 * Domain K07: Supplier Partnership Lifecycle
 * هسته K07: چرخه همکاری تأمین‌کنندگان، کارگاه‌های طلاسازی و قراردادهای امانی
 */

export type SupplierType =
  | 'industrial_factory'   // کارخانجات صنعتی مکانیزه (زنجیر، النگو ماشینی)
  | 'artisan_workshop'     // کارگاه‌های صنایع‌دستی و زرگری سنتی
  | 'casting_foundry'      // کارگاه‌های ریخته‌گری تخصصی طلا (موم گمشده)
  | 'cnc_laser'            // کارگاه برش لیزری، CNC و تریکوبی
  | 'stone_setting'        // کارگاه‌های مخراجی، گوهرنشانی و مرصع‌کاری
  | 'refinery_bullion';    // کارگاه‌های قالکاری، پالایش و شمش‌ریزی

export type PartnershipStatus =
  | 'draft'               // پیش‌نویس مدارک اولیه
  | 'under_evaluation'    // در حال ارزیابی فنی و بازرسی میدانی کارگاه
  | 'active'              // شریک رسمی و فعال در زنجیره تأمین
  | 'on_probation'        // تحت نظارت مشروط (به دلیل افت شاخص کیفیت یا تأخیر)
  | 'suspended'           // معلق‌شده موقت (تا تسویه کسری طلا یا تمدید ضمانت)
  | 'terminated';         // خاتمه‌یافته / فسخ همکاری

export type SupplierGrade =
  | 'A_PLUS'              // گرید A+ (تأمین‌کننده راهبردی تراز اول - حداکثر اعتبار)
  | 'A'                   // گرید A (ممتاز و باکیفیت)
  | 'B'                   // گرید B (استاندارد بازار)
  | 'C'                   // گرید C (تحت پایش دوره ای)
  | 'DISQUALIFIED';       // خلع صلاحیت شده به دلیل تخلف عیاری یا تعهداتی

export type AgreementType =
  | 'consignment_hypothecation' // قرارداد امانی و ترهین طلای خام و آبشده
  | 'contract_manufacturing'    // قرارداد ساخت کارمزدی (اجرت کارمزد مشخص)
  | 'outright_purchase'         // خرید قطعی بنکداری با تسویه مستقیم
  | 'gold_swap_barter';         // تهاتر وزنی شمش آبشده در برابر مصنوعات

export type AgreementStatus =
  | 'draft'
  | 'active'
  | 'expiring_soon'
  | 'renewed'
  | 'expired'
  | 'terminated';

export type CollateralType =
  | 'bullion_escrow'       // سپرده فیزیکی شمش طلا در خزانه مرکزی دیدار
  | 'sayad_cheque'         // چک صیادی ثبتی معتبر بنفش
  | 'bank_guarantee'       // ضمانت‌نامه بانکی حسن انجام تعهدات
  | 'property_mortgage'    // ترهین سند ملکی در دفتر اسناد رسمی
  | 'peer_cosigner';       // ضمانت ۲ بنکدار معتبر صنف طلا با گواهی امضا

export type CollateralStatus =
  | 'valid'
  | 'under_review'
  | 'expiring_soon'
  | 'enforced'
  | 'released';

export interface QualityAuditRecord {
  id: string;
  supplierId: string;
  supplierNameFa: string;
  auditDateFa: string;
  auditorName: string;
  score: number; // 0 - 100
  status: 'passed' | 'passed_with_condition' | 'failed';
  statusFa: string;
  findingsFa: string;
  recommendationsFa: string;
  nextAuditDateFa: string;
}

export interface SupplierKpi {
  onTimeDeliveryRate: number;              // درصد تحویل به‌موقع سفارشات (مثلا: ۹۶.۵٪)
  qcFirstPassRate: number;                 // نرخ قبولی در نخستین بازرسی کیفی (مثلا: ۹۸.۲٪)
  assayDiscrepancyPpm: number;             // مغایرت عیار در ری‌گیری به در هزار (مثلا: ۰.۳)
  allowableMeltLossPercent: number;        // درصد مجاز کسر بار و ذوب (مثلا: ۰.۲۵٪)
  averageMakingChargePerGramToman: number; // میانگین اجرت ساخت هر گرم (تومان)
  overallRating: number;                   // نمره ترکیبی شاخص عملکرد (از ۱۰۰)
}

export interface SupplierPartnership {
  id: string;
  supplierCode: string;                    // کد یکتا کارگاه مثلا: SUP-TH-01
  nameFa: string;                          // نام کارگاه / شرکت
  commercialBrandFa: string;               // نام برند تجاری
  supplierType: SupplierType;
  supplierTypeFa: string;
  status: PartnershipStatus;
  statusFa: string;
  grade: SupplierGrade;
  gradeFa: string;

  // اطلاعات پروانه و اتحادیه طلا
  cityFa: string;
  provinceFa: string;
  addressFa: string;
  postalCode?: string;
  phone: string;
  managerName: string;
  managerNationalCodeMasked: string;
  unionLicenseNo: string;                  // شماره پروانه کسب اتحادیه طلا و جواهر
  hallmarkCode: string;                    // کد انگ اختصاصی کارگاه (کد T یا E)
  tradeSystemId?: string;                  // کد شناسه سامانه جامع تجارت

  // موازنه و وضعیت طلای امانی (Consignment Gold Balances)
  totalConsignmentLimitGrams: number;     // سقف مجاز طلای امانی در گردش (گرم)
  currentConsignmentUtilizedGrams: number; // طلای فعلی تحویل‌شده در گردش نزد کارگاه (گرم)
  availableConsignmentGrams: number;      // مانده مجاز جهت تخصیص طلای جدید (گرم)
  activeAgreementsCount: number;

  // وثایق و تضامین ثبتی
  collateralTotalEquivalentToman: number; // مجموع تضامین معادل ریالی
  collateralTotalGoldGrams: number;       // مجموع تضامین شمش یا معادل طلا
  collateralStatus: CollateralStatus;
  collateralStatusFa: string;

  // شاخص‌های کیفی و عملکرد ساخت
  kpi: SupplierKpi;
  specialties: string[];                   // تخصص‌های ساخت (النگو، زنجیر، پلاک لیزری، ...)
  
  lastAuditDateFa: string;
  createdAt: string;
  notes?: string;
}

export interface PartnershipAgreement {
  id: string;
  agreementNumber: string;                 // مثلا: AGR-2026-SUP01-01
  supplierId: string;
  supplierNameFa: string;
  agreementType: AgreementType;
  agreementTypeFa: string;
  titleFa: string;
  status: AgreementStatus;
  statusFa: string;

  startDateFa: string;
  endDateFa: string;
  renewalTermsFa: string;

  // شرایط تجاری و طلایی
  consignmentLimitGrams: number;           // سقف طلای امانی قرارداد
  maxDeliveryLeadDays: number;             // حداکثر مهلت تحویل سفارش (روز کاری)
  allowableKasriPercent: number;           // درصد مجاز کسر بار/ذوب
  makingChargeFormulaFa: string;           // فرمول محاسبه اجرت ساخت
  settlementWindowDays: number;            // مهلت تسویه حساب طلایی/ریالی (روز)

  signedBySupplierName: string;
  signedByPlatformManager: string;
  termsAndConditionsFa: string[];
}

export interface SupplierCollateral {
  id: string;
  collateralCode: string;                  // مثلا: COL-SYD-2026-081
  supplierId: string;
  supplierNameFa: string;
  collateralType: CollateralType;
  collateralTypeFa: string;
  titleFa: string;
  status: CollateralStatus;
  statusFa: string;

  nominalValueToman: number;               // ارزش اسمی سند/چک
  equivalentGoldGrams: number;             // معادل وزن طلا (گرم)
  issueDateFa: string;
  expiryDateFa: string;

  issuingBankOrNotaryFa: string;           // بانک صادرکننده یا دفتر اسناد رسمی
  trackingReferenceNumber: string;         // شناسه صیادی یا شماره ثبت رسمی
  verificationStatus: 'verified' | 'pending_inquiry' | 'rejected';
  verificationStatusFa: string;
  verifiedBy?: string;
  notes?: string;
}

export interface K07Metrics {
  totalSuppliersCount: number;             // کل کارگاه‌ها و سازندگان
  activeSuppliersCount: number;            // کارگاه‌های فعال و معتبر
  underEvaluationCount: number;            // کارگاه‌های در حال سنجش
  onProbationOrSuspendedCount: number;     // کارگاه‌های مشروط یا معلق
  totalConsignmentQuotaGrams: number;      // کل سقف طلای امانی مجاز (گرم)
  totalUtilizedConsignmentGrams: number;   // طلای امانی فعال در گردش کارگاه‌ها (گرم)
  totalCollateralGoldEquivalentGrams: number; // کل وثایق معادل طلا (گرم)
  averageQcPassRate: number;               // میانگین نرخ قبولی کیفی کارگاه‌ها (٪)
  averageOnTimeDelivery: number;           // میانگین تحویل به‌موقع (٪)
}

export interface K07DataPayload {
  suppliers: SupplierPartnership[];
  agreements: PartnershipAgreement[];
  collaterals: SupplierCollateral[];
  audits: QualityAuditRecord[];
  metrics: K07Metrics;
}
