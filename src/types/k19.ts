/**
 * Didar Gold Platform - Kernel Domain K19 Types
 * Buyback, Physical Condition Assay, Trade-In Valuation & Settlement
 */

export type K19BuybackSource =
  | 'didar_passport_provenance'  // کالای اصیل دارای پاسپورت دیجیتال دیدار (K06/K17)
  | 'external_market_gold'       // طلای ۱۸ عیار متفرقه بازاری و کارکرده
  | 'coin_bullion'               // مسکوکات بانکی و شمش‌های استاندارد عیار ۹۹۵ یا ۷۵۰
  | 'broken_scrap';              // طلای آسیب‌دیده، شکسته و متفرقه آماده ذوب

export type K19BuybackStage =
  | 'quotation_requested'        // استعلام اولیه و قیمت‌گذاری تخمینی
  | 'intake_assay_inspecting'     // پذیرش فیزیکی، سنگ‌محک و عیارسنجی دقیق
  | 'valuation_offer_ready'      // پیشنهاد قطعی قیمت و اعلام به مشتری
  | 'offer_accepted_settling'    // پذیرش پیشنهاد و آغاز فرایند تسویه
  | 'settled_payout_completed'   // واریز وجه یا صدور بن معاوضه/شارژ کیف پول
  | 'vault_custody_routed'       // تعیین سرنوشت قطعه (هدایت به K20 جهت بازسازی یا ذوب)
  | 'cancelled_rejected';        // انصراف مشتری یا رد اصالت/عیار

export type K19ConditionGrade =
  | 'grade_a_mint'               // درجه یک (بی‌نقص، بدون تغییر شکل، مناسب جلای ویترینی)
  | 'grade_b_normal'             // درجه دو (سالم با ساییدگی یا خط‌وخش جزئی، نیازمند پرداخت در کارگاه)
  | 'grade_c_melt_scrap';        // درجه سه (شکسته، کج‌شده یا بدون امکان احیا، مستقیم به کوره ذوب)

export type K19PayoutMethod =
  | 'instant_bank_transfer'      // واریز بین‌بانکی پایا یا ساتنا به شماره شبای رسمی
  | 'gold_wallet_credit'         // شارژ کیف طلای دیدار (افزایش موجودی وزنی طلا بدون کسر ریالی)
  | 'trade_in_voucher'           // بن معاوضه طلای نو با بونوس تشویقی ۲.۵٪
  | 'cash_teller';               // پرداخت نقدی مجاز صندوق گالری تا سقف معین

export type K19AssayMethod =
  | 'touchstone_acid'            // سنگ محک و اسید عیار ۱۸
  | 'xrf_spectrometry'           // طیف‌سنجی اشعه ایکس XRF غیرمخرب
  | 'refinery_melt_sample';      // نمونه‌برداری آزمایشگاهی و کوپلاسیون (ری‌گیری)

export interface K19TimelineEvent {
  id: string;
  stage: K19BuybackStage;
  titleFa: string;
  descriptionFa: string;
  timestampFa: string;
  operatorNameFa: string;
}

export interface K19AssayVerification {
  method: K19AssayMethod;
  methodFa: string;
  testedKaratFa: string;
  testedPurity: number;                   // e.g. 0.750
  grossWeightGrams: number;              // وزن ناخالص کل
  tareWeightGrams: number;               // وزن نگین‌های اتمی، چرم، موم و ناخالصی
  netGoldWeightGrams: number;            // وزن خالص طلا
  equivalent750WeightGrams: number;      // معادل وزن بر پایه ۱۸ عیار (۷۵۰)
  hasPreciousStones: boolean;
  preciousStoneDescriptionFa?: string;
  certifiedStoneValuationToman?: number;
  scaleSerialNo: string;
  assayOperatorFa: string;
  assayTimestampFa: string;
  assayNotesFa?: string;
}

export interface K19PricingValuation {
  benchmark18kGramPriceToman: number;    // نرخ پایه روز طلای ۱۸ عیار از هسته K13
  rawGoldValueToman: number;             // ارزش طلای خام = وزن خالص ۷۵۰ × نرخ روز
  provenanceBonusPercent: number;        // پاداش اصالت پاسپورت دیدار (مثلاً ۱٪ بالاتر از بازار)
  provenanceBonusToman: number;
  certifiedGemValueToman: number;        // ارزش کارشناسی سنگ‌های طبیعی و برلیان
  tradeInIncentivePercent: number;       // تشویق معاوضه (مثلاً ۲.۵٪ شارژ مازاد برای خرید جدید)
  tradeInIncentiveToman: number;
  handlingOrRefiningDeductionToman: number; // کسر آبکاری یا هزینه ذوب (برای متفرقه)
  grossValuationToman: number;           // ارزش کل کارشناسی
  finalCashPayoutToman: number;          // مبلغ خالص واریز نقدی
  finalTradeInPayoutToman: number;       // ارزش در صورت معاوضه با طلای نو
  equivalentGoldSoot: number;            // معادل سوت طلا جهت کیف پول زرین K09
}

export interface K19SellerInfo {
  fullName: string;
  nationalId: string;
  mobile: string;
  bankIban: string;
  bankNameFa: string;
  nationalCardVerified: boolean;
  amlClearanceConfirmed: boolean;
  city: string;
}

export interface BuybackRecord {
  id: string;
  buybackNumber: string;                 // e.g. BBK-1404-0012
  receiptBarcode: string;                // بارکد رهگیری قبض بازخرید
  createdAtFa: string;
  itemUid?: string;                      // شناسه پاسپورت K06/K17 (در صورت وجود)
  itemTitleFa: string;
  source: K19BuybackSource;
  sourceFa: string;
  stage: K19BuybackStage;
  stageFa: string;
  conditionGrade: K19ConditionGrade;
  conditionGradeFa: string;

  // اطلاعات فروشنده و مدارک هویتی
  seller: K19SellerInfo;

  // کارشناسی و توزین دقیق
  assay: K19AssayVerification;

  // فرمول قیمت‌گذاری شفاف
  valuation: K19PricingValuation;

  // اطلاعات تسویه و پرداخت
  settlement: {
    selectedMethod: K19PayoutMethod;
    methodFa: string;
    isSettled: boolean;
    settledAtFa?: string;
    settlementRefCode?: string;          // شماره پیگیری پایا / ساتنا یا کد تراکنش
    tradeInVoucherCode?: string;         // کد کوپن معاوضه طلا
    destinationVaultId?: string;         // خزانه دریافت‌کننده قطعه در K09
  };

  // سرنوشت قطعه پس از بازخرید (هدایت به K20)
  routingDecision?: {
    destination: 'k20_refurbish_secondary' | 'k20_scrap_smelting' | 'k09_reserve_vault';
    destinationFa: string;
    routedAtFa?: string;
    routingNotesFa?: string;
  };

  timeline: K19TimelineEvent[];
}

export interface K19Metrics {
  totalBuybacksCount: number;
  activeInspectionsCount: number;
  totalCompletedVolumeToman: number;
  totalGoldAcquiredGrams: number;
  tradeInConversionPercentage: number;
  avgSettlementMinutes: number;
  didarProvenanceSharePercent: number;
}

export interface K19AuditLog {
  id: string;
  buybackNumber: string;
  actionFa: string;
  operatorNameFa: string;
  timestampFa: string;
  detailsFa: string;
  verifiedHash: string;
}

export interface K19DataPayload {
  metrics: K19Metrics;
  records: BuybackRecord[];
  auditLogs: K19AuditLog[];
  currentGoldPrice: {
    gram18kToman: number;
    benchmarkTimestampFa: string;
    didarBuybackPremiumPercent: number;
  };
}
