/**
 * Didar Gold Platform - Kernel Domain K20 Types
 * Secondary Market, Workshop Refurbishment, CPO Showcase & Precious Scrap Smelting/Recycling
 */

export type K20RefurbishStatus =
  | 'intake_assessment'     // پذیرش در کارگاه و ارزیابی عیار و ساختار فیزیکی
  | 'ultrasonic_cleaning'   // شستشوی صنعتی التراسونیک و رسوب‌زدایی
  | 'polishing_buffing'     // پرداخت مکانیکی و پولیش آینه‌ای
  | 'rhodium_plating'       // آبکاری مجدد رودیوم یا لایه محافظ طلای ۲۴ عیار
  | 'gem_tightening'        // آچارکشی چنگه‌ها و مخراج‌کاری مجدد نگین‌ها
  | 'qc_passed'             // پاس شدن کنترل کیفیت ۱۲ مرحله‌ای کارگاه
  | 'cpo_showcase_listed'   // عرضه رسمی در ویترین طلای احیاشده دیدار (CPO)
  | 'sold_reissued';        // فروش مجدد با صدور شناسنامه ثانویه و ضمانت‌نامه

export type K20MeltStatus =
  | 'batching_crucible'     // تجمیع طلای شکسته و آماده‌سازی بوته ذوب
  | 'smelting_furnace'      // ذوب حرارتی در کوره ریخته‌گری بوته‌ای
  | 'assaying_lab'          // ارسال قطعه نمونه به آزمایشگاه ری‌گیری رسمی (اتحادیه)
  | 'bar_cast_completed'    // ریخته‌گری شمش آب‌شده و صدور کد انگ
  | 'vault_deposited';      // انتقال قطعی به خزانه مرکزی شمش K09 یا خطوط تولید K07

export type K20GemRecoveryStatus =
  | 'extracted'             // پیاده‌سازی نگین از پایه طلا
  | 'cleaned_graded'        // پاکسازی تخصصی و درجه‌بندی شناسنامه‌ای
  | 'vault_reserved'        // دپو در خزانه‌داری گوهرسنگ‌های دیدار
  | 'remounted';            // سوار شدن بر روی محصول نوی جدید

export interface K20RefurbishedItem {
  id: string;
  itemCode: string;                      // e.g. CPO-1404-001
  sourceBuybackId?: string;              // e.g. BBK-1404-001
  sourceTicketId?: string;               // K18 ticket if returned
  originalTitleFa: string;
  categoryFa: string;                    // دستبند، النگو، گردنبند، سرویس، انگشتر
  karatFa: string;                       // ۱۸ عیار استاندارد (۷۵۰)
  purity: number;                        // 0.750
  grossWeightGrams: number;
  netGoldWeightGrams: number;
  hasPreciousStones: boolean;
  gemsDescriptionFa?: string;
  gemCaratWeight?: number;
  status: K20RefurbishStatus;
  statusFa: string;
  workshopNameFa: string;
  artisanNameFa: string;
  intakeDateFa: string;
  completionDateFa?: string;
  refurbishCostToman: number;            // هزینه پرداخت، التراسونیک و آبکاری
  originalNewRetailPriceToman: number;   // قیمت نوی معادل با اجرت ساخت ۱۸-۲۵٪
  cpoSellingPriceToman: number;          // قیمت طلای احیاشده (مظنه خام + اجرت کم ۳.۵٪)
  savingsForCustomerToman: number;       // سود خریدار نسبت به طلای نوی بازار
  savingsPercent: number;                // درصد صرفه‌جویی خریدار
  qcScore: number;                       // نمره کنترل کیفیت (از ۱۰۰)
  qcInspectorFa: string;
  passportUid?: string;                  // شناسه دیجیتال پاسپورت CPO دیدار
  warrantyMonths: number;                // گارانتی ۶ یا ۱۲ ماهه دیدار
  beforeAfterNotesFa: string;
}

export interface K20MeltBatch {
  id: string;
  batchNumber: string;                   // e.g. MLT-1404-012
  createdAtFa: string;
  status: K20MeltStatus;
  statusFa: string;
  furnaceOperatorFa: string;
  crucibleNumber: string;
  sourceItemsCount: number;
  sourceItemsSummaryFa: string;
  totalInputWeightGrams: number;         // وزن قراضه ورودی به کوره
  expectedPurity: number;                // عیار تخمینی قبل از ذوب
  meltedIngotWeightGrams: number;        // وزن شمش حاصل از ذوب
  refiningLossGrams: number;             // کسر افت ذوب و سرباره بوته
  refiningLossPercent: number;           // درصد افت ذوب (معمولاً ۰.۵ تا ۱.۲ درصد)
  assayLabNameFa: string;                // آزمایشگاه همکار اتحادیه طلا (ری‌گیری رسمی)
  assayCertificateNumber: string;        // شماره انگ ری‌گیری (مثلاً ۷۵۱/۸۹۹۲)
  certifiedPurity: number;               // عیار رسمی تاییدشده (مثلاً ۰.۷۵۰۵)
  equivalent750WeightGrams: number;      // وزن شمش بر پایه طلای ۱۸ عیار استاندارد
  castBarBarcode: string;                // بارکد شمش طلای آب‌شده دیدار
  destination: 'k09_reserve_vault' | 'k07_supplier_workshop' | 'treasury_sale';
  destinationFa: string;
  settlementValueToman: number;          // ارزش ریالی شمش آب‌شده
}

export interface K20GemRecovery {
  id: string;
  recoveryCode: string;                  // e.g. GEM-1404-03
  gemTypeFa: string;                     // برلیان طبیعی، یاقوت سرخ، زمرد، تانزانیت
  sourceBuybackNumber: string;           // شماره پرونده بازخرید مبدا
  caratWeight: number;                   // وزن بر حسب قیراط
  cutShapeFa: string;                    // برلیانت گرد، مارکیز، پرنسس، باگت
  colorGrade: string;                    // درجه رنگی (D, E, F, G...)
  clarityGrade: string;                  // درجه پاکی (VVS1, VS1, SI1...)
  estimatedValueToman: number;           // ارزش برآوردی گوهرسنگ
  status: K20GemRecoveryStatus;
  statusFa: string;
  gemologistFa: string;
  allocatedVaultFa: string;              // محل نگهداری در خزانه سنگ
}

export interface K20Metrics {
  totalRefurbishedCount: number;
  activeInWorkshopCount: number;
  cpoShowcaseItemsCount: number;
  totalCpoSoldValueToman: number;
  totalMeltBatchesCount: number;
  totalScrapMeltedGrams: number;
  totalCastBarsGrams: number;
  averageMeltingYieldPercent: number;    // میانگین بازدهی کوره ذوب
  totalGemsRecoveredCount: number;
  totalGemRecoveryValueToman: number;
  circularEconomyGoldKg: number;         // کیلوگرم طلای بازیافتی در چرخه بسته
  co2SavedKg: number;                    // صرفه‌جویی در دی‌اکسید کربن ناشی از بازیافت
}

export interface K20AuditLog {
  id: string;
  timestampFa: string;
  category: 'refurbishment' | 'smelting' | 'gem_recovery' | 'cpo_sale' | 'vault_transfer';
  actionFa: string;
  detailsFa: string;
  operatorFa: string;
  batchOrItemCode: string;
  integrityHash: string;
}

export interface K20DataPayload {
  metrics: K20Metrics;
  refurbishedItems: K20RefurbishedItem[];
  meltBatches: K20MeltBatch[];
  gemRecoveries: K20GemRecovery[];
  auditLogs: K20AuditLog[];
  currentGoldPrice: {
    gram18kToman: number;
    benchmarkTimestampFa: string;
  };
}
