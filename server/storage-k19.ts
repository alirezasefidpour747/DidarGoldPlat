/**
 * Didar Gold Platform - Kernel 19 (K19) Storage Engine
 * Buyback, Physical Assay, Trade-In Valuation & Settlement
 */

import {
  BuybackRecord,
  K19DataPayload,
  K19Metrics,
  K19AuditLog,
  K19BuybackStage,
  K19BuybackSource,
  K19ConditionGrade,
  K19PayoutMethod,
  K19AssayMethod,
  K19TimelineEvent,
  K19AssayVerification,
  K19PricingValuation
} from '../src/types/k19.js';

class K19StorageEngine {
  private records: BuybackRecord[] = [];
  private auditLogs: K19AuditLog[] = [];

  // نرخ مرجع زنده هر گرم طلای ۱۸ عیار بر حسب تومان (متصل به K13)
  private benchmarkGram18kToman: number = 6150000;
  private didarBuybackPremiumPercent: number = 1.5; // ۱.۵٪ خرید بالاتر برای شناسنامه اصیل دیدار

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // رکورد ۱: بازخرید با معاوضه طلای نو (Trade-In) - دارای پاسپورت دیدار
    const record1: BuybackRecord = {
      id: 'bbk-01',
      buybackNumber: 'BBK-1404-001',
      receiptBarcode: 'DID-BBK-882190',
      createdAtFa: '۱۴۰۴/۱۲/۲۴',
      itemUid: 'DID-AU750-2026-8820-001',
      itemTitleFa: 'گردنبند طرح شوپارد طلا ۱۸ عیار با نگین برلیان اصل',
      source: 'didar_passport_provenance',
      sourceFa: 'پاسپورت اصیل دیدار (K06/K17)',
      stage: 'settled_payout_completed',
      stageFa: 'تسویه کامل و صدور بن معاوضه',
      conditionGrade: 'grade_a_mint',
      conditionGradeFa: 'درجه ۱ (نو و بی‌نقص، آماده جلای ویترینی)',
      seller: {
        fullName: 'خانم بهاره نوری',
        nationalId: '0078912345',
        mobile: '09123456789',
        bankIban: 'IR550170000000123456789001',
        bankNameFa: 'بانک ملی ایران',
        nationalCardVerified: true,
        amlClearanceConfirmed: true,
        city: 'تهران'
      },
      assay: {
        method: 'xrf_spectrometry',
        methodFa: 'طیف‌سنجی غیرمخرب اشعه ایکس XRF',
        testedKaratFa: '۱۸ عیار استاندارد (۷۵۰.۴)',
        testedPurity: 0.7504,
        grossWeightGrams: 18.620,
        tareWeightGrams: 0.220, // نگین برلیان
        netGoldWeightGrams: 18.400,
        equivalent750WeightGrams: 18.410,
        hasPreciousStones: true,
        preciousStoneDescriptionFa: 'تک نگین برلیان پاک ۰.۲۲ قیراط دارای شناسنامه معتبر دیدار',
        certifiedStoneValuationToman: 18500000,
        scaleSerialNo: 'SARTORIUS-LAB-094',
        assayOperatorFa: 'مهندس نوید کاوه',
        assayTimestampFa: '۱۴۰۴/۱۲/۲۴ - ۱۱:۱۵',
        assayNotesFa: 'قطعه کاملاً سالم، بدون هیچ‌گونه ساییدگی یا ضربه، برلیان طبیعی پاک VVS1'
      },
      valuation: {
        benchmark18kGramPriceToman: 6150000,
        rawGoldValueToman: 113221500, // 18.410 * 6,150,000
        provenanceBonusPercent: 1.5,
        provenanceBonusToman: 1698322,
        certifiedGemValueToman: 18500000,
        tradeInIncentivePercent: 2.5,
        tradeInIncentiveToman: 3335495,
        handlingOrRefiningDeductionToman: 0,
        grossValuationToman: 133419822,
        finalCashPayoutToman: 133419822,
        finalTradeInPayoutToman: 136755317,
        equivalentGoldSoot: 18410
      },
      settlement: {
        selectedMethod: 'trade_in_voucher',
        methodFa: 'بن معاوضه طلای نو با ۲.۵٪ شارژ تشویقی',
        isSettled: true,
        settledAtFa: '۱۴۰۴/۱۲/۲۴ - ۱۱:۴۵',
        settlementRefCode: 'VCH-TRD-1404-8819',
        tradeInVoucherCode: 'DIDAR-EXCHANGE-8819-25P',
        destinationVaultId: 'vlt-01'
      },
      routingDecision: {
        destination: 'k20_refurbish_secondary',
        destinationFa: 'هدایت به کارگاه پرداخت و بازسازی جهت فروش در بازار ثانویه (K20)',
        routedAtFa: '۱۴۰۴/۱۲/۲۴ - ۱۲:۰۰',
        routingNotesFa: 'شستشوی اولتراسونیک و صدور شناسنامه طلای احیاشده دیدار'
      },
      timeline: [
        {
          id: 'tml-01',
          stage: 'quotation_requested',
          titleFa: 'ثبت استعلام بازخرید آنلاین',
          descriptionFa: 'مشتری با اسکن پاسپورت طلای دیدار درخواست معاوضه ثبت نمود.',
          timestampFa: '۱۴۰۴/۱۲/۲۴ - ۱۰:۰۰',
          operatorNameFa: 'درگاه آنلاین دیدار'
        },
        {
          id: 'tml-02',
          stage: 'intake_assay_inspecting',
          titleFa: 'پذیرش در شعبه و عیارسنجی آزمایشگاهی',
          descriptionFa: 'توزین با ترازوی دقیق سارتوریوس انجام شد و عیار ۷۵۰.۴ توسط XRF تایید گردید.',
          timestampFa: '۱۴۰۴/۱۲/۲۴ - ۱۱:۱۵',
          operatorNameFa: 'مهندس نوید کاوه'
        },
        {
          id: 'tml-03',
          stage: 'valuation_offer_ready',
          titleFa: 'صدور پیشنهاد قیمت قطعی',
          descriptionFa: 'پیشنهاد نقدی ۱۳۳.۴ میلیون تومان و پیشنهاد معاوضه ۱۳۶.۷ میلیون تومان به مشتری ارائه شد.',
          timestampFa: '۱۴۰۴/۱۲/۲۴ - ۱۱:۳۰',
          operatorNameFa: 'سرپرست بازخرید دیدار'
        },
        {
          id: 'tml-04',
          stage: 'settled_payout_completed',
          titleFa: 'پذیرش معاوضه و صدور بن خرید طلای نو',
          descriptionFa: 'مشتری گزینه بن معاوضه را تایید کرد و کد کوپن DIDAR-EXCHANGE-8819 صادر گردید.',
          timestampFa: '۱۴۰۴/۱۲/۲۴ - ۱۱:۴۵',
          operatorNameFa: 'امور مالی دیدار'
        }
      ]
    };

    // رکورد ۲: بازخرید نقدی با واریز آنی شبا - طلای متفرقه ۱۸ عیار
    const record2: BuybackRecord = {
      id: 'bbk-02',
      buybackNumber: 'BBK-1404-002',
      receiptBarcode: 'DID-BBK-882191',
      createdAtFa: '۱۴۰۴/۱۲/۲۳',
      itemTitleFa: 'دستبند زنجیری فیگارو متفرقه طلای ۱۸ عیار',
      source: 'external_market_gold',
      sourceFa: 'طلای متفرقه بازاری و کارکرده',
      stage: 'settled_payout_completed',
      stageFa: 'تسویه کامل و واریز بین‌بانکی',
      conditionGrade: 'grade_b_normal',
      conditionGradeFa: 'درجه ۲ (سالم با خط و خش سطحی)',
      seller: {
        fullName: 'آقای فرهاد جمشیدی',
        nationalId: '0012345678',
        mobile: '09121234567',
        bankIban: 'IR820120000000987654321002',
        bankNameFa: 'بانک ملت',
        nationalCardVerified: true,
        amlClearanceConfirmed: true,
        city: 'تهران'
      },
      assay: {
        method: 'touchstone_acid',
        methodFa: 'سنگ محک و اسید استاندارد ۱۸ عیار',
        testedKaratFa: '۱۸ عیار استاندارد (۷۵۰)',
        testedPurity: 0.750,
        grossWeightGrams: 11.450,
        tareWeightGrams: 0.000,
        netGoldWeightGrams: 11.450,
        equivalent750WeightGrams: 11.450,
        hasPreciousStones: false,
        scaleSerialNo: 'METTLER-TOLEDO-02',
        assayOperatorFa: 'استاد جواد صانعی',
        assayTimestampFa: '۱۴۰۴/۱۲/۲۳ - ۱۶:۱۰',
        assayNotesFa: 'محک طلا واکنش کاملاً مثبت و عیار ۷۵۰ را تثبیت کرد. بدون ناخالصی قفل.'
      },
      valuation: {
        benchmark18kGramPriceToman: 6150000,
        rawGoldValueToman: 70417500, // 11.450 * 6,150,000
        provenanceBonusPercent: 0,
        provenanceBonusToman: 0,
        certifiedGemValueToman: 0,
        tradeInIncentivePercent: 0,
        tradeInIncentiveToman: 0,
        handlingOrRefiningDeductionToman: 350000, // کارمزد تست و بازخرید
        grossValuationToman: 70417500,
        finalCashPayoutToman: 70067500,
        finalTradeInPayoutToman: 71825687,
        equivalentGoldSoot: 11450
      },
      settlement: {
        selectedMethod: 'instant_bank_transfer',
        methodFa: 'واریز بین‌بانکی پایا به شماره شبا',
        isSettled: true,
        settledAtFa: '۱۴۰۴/۱۲/۲۳ - ۱۶:۴۰',
        settlementRefCode: 'PAYA-TRF-9918231',
        destinationVaultId: 'vlt-02'
      },
      routingDecision: {
        destination: 'k20_refurbish_secondary',
        destinationFa: 'هدایت به بخش پولیش و آبکاری جهت بازفروش در ویترین اقتصادی (K20)',
        routedAtFa: '۱۴۰۴/۱۲/۲۳ - ۱۷:۰۰',
        routingNotesFa: 'پرداخت سطح و بازبینی استحکام اتصالات'
      },
      timeline: [
        {
          id: 'tml-21',
          stage: 'intake_assay_inspecting',
          titleFa: 'پذیرش حضوری در گالری و احراز هویت',
          descriptionFa: 'کارت ملی استعلام و انطباق نام با شماره شبا احراز شد.',
          timestampFa: '۱۴۰۴/۱۲/۲۳ - ۱۵:۵۰',
          operatorNameFa: 'کارشناس پذیرش دیدار'
        },
        {
          id: 'tml-22',
          stage: 'valuation_offer_ready',
          titleFa: 'ارائه پیشنهاد تسویه نقدی فوری',
          descriptionFa: 'مبلغ ۷۰,۰۶۷,۵۰۰ تومان به تایید فروشنده رسید.',
          timestampFa: '۱۴۰۴/۱۲/۲۳ - ۱۶:۱۵',
          operatorNameFa: 'کارشناس پذیرش دیدار'
        },
        {
          id: 'tml-23',
          stage: 'settled_payout_completed',
          titleFa: 'واریز حواله پایا و تسویه حساب',
          descriptionFa: 'رسید الکترونیک بانکی به شماره پیگیری ۹۹۱۸۲۳۱ صادر و پیامک شد.',
          timestampFa: '۱۴۰۴/۱۲/۲۳ - ۱۶:۴۰',
          operatorNameFa: 'امور مالی دیدار'
        }
      ]
    };

    // رکورد ۳: طلای شکسته و ضایعاتی - هدایت به کوره ذوب K20
    const record3: BuybackRecord = {
      id: 'bbk-03',
      buybackNumber: 'BBK-1404-003',
      receiptBarcode: 'DID-BBK-882192',
      createdAtFa: '۱۴۰۴/۱۲/۲۲',
      itemTitleFa: 'قطعات شکسته النگو و گوشواره مستعمل و بدون نگین',
      source: 'broken_scrap',
      sourceFa: 'طلای آسیب‌دیده، شکسته و متفرقه',
      stage: 'vault_custody_routed',
      stageFa: 'ارسال به کوره ذوب و ری‌گیری اتحادیه',
      conditionGrade: 'grade_c_melt_scrap',
      conditionGradeFa: 'درجه ۳ (شکسته و دفرمه، مستقیم به کوره ذوب)',
      seller: {
        fullName: 'خانم مریم صبوری',
        nationalId: '0451239876',
        mobile: '09351234567',
        bankIban: 'IR190560000000112233445566',
        bankNameFa: 'بانک سامان',
        nationalCardVerified: true,
        amlClearanceConfirmed: true,
        city: 'کرج'
      },
      assay: {
        method: 'touchstone_acid',
        methodFa: 'سنگ محک و اسید عیار ۱۸',
        testedKaratFa: '۱۸ عیار تجاری (۷۴۵.۰)',
        testedPurity: 0.745,
        grossWeightGrams: 24.300,
        tareWeightGrams: 0.500, // موم و جرم داخل گوشواره
        netGoldWeightGrams: 23.800,
        equivalent750WeightGrams: 23.641, // (23.800 * 745) / 750
        hasPreciousStones: false,
        scaleSerialNo: 'SARTORIUS-LAB-094',
        assayOperatorFa: 'مهندس نوید کاوه',
        assayTimestampFa: '۱۴۰۴/۱۲/۲۲ - ۱۰:۴۰',
        assayNotesFa: 'جرم‌زدایی با حرارت انجام شد، کسر ناخالصی نیم گرم اعمال گردید.'
      },
      valuation: {
        benchmark18kGramPriceToman: 6150000,
        rawGoldValueToman: 145392150, // 23.641 * 6,150,000
        provenanceBonusPercent: 0,
        provenanceBonusToman: 0,
        certifiedGemValueToman: 0,
        tradeInIncentivePercent: 0,
        tradeInIncentiveToman: 0,
        handlingOrRefiningDeductionToman: 850000, // هزینه کوره و شمش‌ریزی
        grossValuationToman: 145392150,
        finalCashPayoutToman: 144542150,
        finalTradeInPayoutToman: 148155953,
        equivalentGoldSoot: 23641
      },
      settlement: {
        selectedMethod: 'instant_bank_transfer',
        methodFa: 'واریز آنی پایا به شماره شبا',
        isSettled: true,
        settledAtFa: '۱۴۰۴/۱۲/۲۲ - ۱۱:۱۵',
        settlementRefCode: 'PAYA-TRF-9918105',
        destinationVaultId: 'vlt-03'
      },
      routingDecision: {
        destination: 'k20_scrap_smelting',
        destinationFa: 'انتقال به بسته ذوب و تبدیل به شمش طلای آب‌شده استاندارد (K20)',
        routedAtFa: '۱۴۰۴/۱۲/۲۲ - ۱۱:۳۰',
        routingNotesFa: 'افزودن به بچ ذوب شماره MELT-1404-09 جهت ری‌گیری رسمی اتحادیه'
      },
      timeline: [
        {
          id: 'tml-31',
          stage: 'intake_assay_inspecting',
          titleFa: 'پذیرش و کسر جرم ناخالص',
          descriptionFa: 'توزین دقیق قبل و بعد از جرم‌زدایی انجام شد.',
          timestampFa: '۱۴۰۴/۱۲/۲۲ - ۱۰:۳۰',
          operatorNameFa: 'کارشناس آزمایشگاه دیدار'
        },
        {
          id: 'tml-32',
          stage: 'settled_payout_completed',
          titleFa: 'واریز وجه بازخرید به حساب مشتری',
          descriptionFa: 'مبلغ ۱۴۴.۵ میلیون تومان واریز شد.',
          timestampFa: '۱۴۰۴/۱۲/۲۲ - ۱۱:۱۵',
          operatorNameFa: 'امور مالی دیدار'
        },
        {
          id: 'tml-33',
          stage: 'vault_custody_routed',
          titleFa: 'تحویل به کوره ذوب طلای آب‌شده',
          descriptionFa: 'قطعات در پلمپ امنیتی شماره SCRAP-09 به کوره ذوب انتقال یافت.',
          timestampFa: '۱۴۰۴/۱۲/۲۲ - ۱۱:۳۰',
          operatorNameFa: 'مدیر خزانه دیدار'
        }
      ]
    };

    // رکورد ۴: در حال کارشناسی و پیشنهاد قیمت به مشتری
    const record4: BuybackRecord = {
      id: 'bbk-04',
      buybackNumber: 'BBK-1404-004',
      receiptBarcode: 'DID-BBK-882193',
      createdAtFa: '۱۴۰۴/۱۲/۲۵',
      itemUid: 'DID-AU750-2025-5510-008',
      itemTitleFa: 'انگشتر تک تاش طلا ۱۸ عیار با نگین موزانایت',
      source: 'didar_passport_provenance',
      sourceFa: 'پاسپورت اصیل دیدار (K06/K17)',
      stage: 'valuation_offer_ready',
      stageFa: 'پیشنهاد قطعی قیمت آماده پذیرش',
      conditionGrade: 'grade_a_mint',
      conditionGradeFa: 'درجه ۱ (نو و بی‌نقص، آماده جلای ویترینی)',
      seller: {
        fullName: 'آقای سامان توکلی',
        nationalId: '0098765432',
        mobile: '09129876543',
        bankIban: 'IR440180000000556677889900',
        bankNameFa: 'بانک تجارت',
        nationalCardVerified: true,
        amlClearanceConfirmed: true,
        city: 'تهران'
      },
      assay: {
        method: 'xrf_spectrometry',
        methodFa: 'طیف‌سنجی اشعه ایکس XRF',
        testedKaratFa: '۱۸ عیار (۷۵۰.۲)',
        testedPurity: 0.7502,
        grossWeightGrams: 5.650,
        tareWeightGrams: 0.150, // وزن نگین موزانایت
        netGoldWeightGrams: 5.500,
        equivalent750WeightGrams: 5.501,
        hasPreciousStones: true,
        preciousStoneDescriptionFa: 'تک نگین موزانایت با شناسنامه دیدار',
        certifiedStoneValuationToman: 2800000,
        scaleSerialNo: 'SARTORIUS-LAB-094',
        assayOperatorFa: 'مهندس نوید کاوه',
        assayTimestampFa: '۱۴۰۴/۱۲/۲۵ - ۰۹:۴۵',
        assayNotesFa: 'قطعه در وضعیت کاملاً نو و بدون خش است.'
      },
      valuation: {
        benchmark18kGramPriceToman: 6150000,
        rawGoldValueToman: 33831150,
        provenanceBonusPercent: 1.5,
        provenanceBonusToman: 507467,
        certifiedGemValueToman: 2800000,
        tradeInIncentivePercent: 2.5,
        tradeInIncentiveToman: 928465,
        handlingOrRefiningDeductionToman: 0,
        grossValuationToman: 37138617,
        finalCashPayoutToman: 37138617,
        finalTradeInPayoutToman: 38067082,
        equivalentGoldSoot: 5501
      },
      settlement: {
        selectedMethod: 'trade_in_voucher',
        methodFa: 'در انتظار انتخاب روش تسویه توسط مشتری',
        isSettled: false
      },
      timeline: [
        {
          id: 'tml-41',
          stage: 'quotation_requested',
          titleFa: 'استعلام آنلاین با پاسپورت دیجیتال',
          descriptionFa: 'درخواست بازخرید در اپلیکیشن خریدار ثبت شد.',
          timestampFa: '۱۴۰۴/۱۲/۲۵ - ۰۹:۰۰',
          operatorNameFa: 'سامانه دیدار'
        },
        {
          id: 'tml-42',
          stage: 'intake_assay_inspecting',
          titleFa: 'تحویل فیزیکی و آزمون XRF',
          descriptionFa: 'عیار ۷۵۰.۲ و سلامت کامل قطعه تایید شد.',
          timestampFa: '۱۴۰۴/۱۲/۲۵ - ۰۹:۴۵',
          operatorNameFa: 'مهندس نوید کاوه'
        },
        {
          id: 'tml-43',
          stage: 'valuation_offer_ready',
          titleFa: 'اعلام ارزش‌گذاری و پیامک به مشتری',
          descriptionFa: 'پیشنهاد نقدی ۳۷.۱ میلیون تومان و پیشنهاد معاوضه ۳۸.۰ میلیون تومان ارسال گردید.',
          timestampFa: '۱۴۰۴/۱۲/۲۵ - ۱۰:۰۰',
          operatorNameFa: 'کارشناس بازخرید دیدار'
        }
      ]
    };

    // رکورد ۵: تبدیل مستقیم به کیف طلای دیدار (Gold Wallet)
    const record5: BuybackRecord = {
      id: 'bbk-05',
      buybackNumber: 'BBK-1404-005',
      receiptBarcode: 'DID-BBK-882194',
      createdAtFa: '۱۴۰۴/۱۲/۲۱',
      itemTitleFa: 'پلاک آویز طلا ۱۸ عیار طرح گل اسلیمی کارکرده',
      source: 'external_market_gold',
      sourceFa: 'طلای متفرقه بازاری و کارکرده',
      stage: 'settled_payout_completed',
      stageFa: 'تسویه کامل و شارژ کیف طلای دیجیتال',
      conditionGrade: 'grade_b_normal',
      conditionGradeFa: 'درجه ۲ (سالم با خط و خش جزئی)',
      seller: {
        fullName: 'خانم شیدا بهرامی',
        nationalId: '0065432198',
        mobile: '09125556677',
        bankIban: 'IR770190000000334455667788',
        bankNameFa: 'بانک پاسارگاد',
        nationalCardVerified: true,
        amlClearanceConfirmed: true,
        city: 'اصفهان'
      },
      assay: {
        method: 'touchstone_acid',
        methodFa: 'سنگ محک و اسید عیار ۱۸',
        testedKaratFa: '۱۸ عیار (۷۵۰)',
        testedPurity: 0.750,
        grossWeightGrams: 8.200,
        tareWeightGrams: 0.000,
        netGoldWeightGrams: 8.200,
        equivalent750WeightGrams: 8.200,
        hasPreciousStones: false,
        scaleSerialNo: 'SARTORIUS-LAB-094',
        assayOperatorFa: 'استاد جواد صانعی',
        assayTimestampFa: '۱۴۰۴/۱۲/۲۱ - ۱۲:۳۰',
        assayNotesFa: 'سنگ محک بدون تغییر رنگ، طلای خالص استاندارد ۷۵۰'
      },
      valuation: {
        benchmark18kGramPriceToman: 6150000,
        rawGoldValueToman: 50430000,
        provenanceBonusPercent: 0,
        provenanceBonusToman: 0,
        certifiedGemValueToman: 0,
        tradeInIncentivePercent: 0,
        tradeInIncentiveToman: 0,
        handlingOrRefiningDeductionToman: 200000,
        grossValuationToman: 50430000,
        finalCashPayoutToman: 50230000,
        finalTradeInPayoutToman: 51485750,
        equivalentGoldSoot: 8200
      },
      settlement: {
        selectedMethod: 'gold_wallet_credit',
        methodFa: 'شارژ مستقیم موجودی طلا در کیف پول طلایی K09 (۸,۲۰۰ سوت طلا)',
        isSettled: true,
        settledAtFa: '۱۴۰۴/۱۲/۲۱ - ۱۲:۴۵',
        settlementRefCode: 'WLT-CREDIT-8200-SOT',
        destinationVaultId: 'vlt-01'
      },
      routingDecision: {
        destination: 'k20_refurbish_secondary',
        destinationFa: 'هدایت به بخش بازسازی و فروش در بازار ثانویه (K20)',
        routedAtFa: '۱۴۰۴/۱۲/۲۱ - ۱۳:۰۰'
      },
      timeline: [
        {
          id: 'tml-51',
          stage: 'settled_payout_completed',
          titleFa: 'شارژ آنی کیف طلای خریدار',
          descriptionFa: 'موجودی طلای خریدار به میزان ۸.۲ گرم طلای ۱۸ عیار بدون ریسک کاهش ارزش افزوده شد.',
          timestampFa: '۱۴۰۴/۱۲/۲۱ - ۱۲:۴۵',
          operatorNameFa: 'سیستم هوشمند خزانه K09'
        }
      ]
    };

    this.records = [record1, record2, record3, record4, record5];

    // Seed Audit Logs
    this.auditLogs = [
      {
        id: 'aud-01',
        buybackNumber: 'BBK-1404-001',
        actionFa: 'ثبت و تسویه بن معاوضه خرید طلای نو با ۲.۵٪ شارژ تشویقی',
        operatorNameFa: 'امور مالی دیدار',
        timestampFa: '۱۴۰۴/۱۲/۲۴ - ۱۱:۴۵',
        detailsFa: 'مبلغ ۱۳۶.۷ میلیون تومان به عنوان ووچر خرید طلای نو ثبت و کسر مالیات شفاف منظور گردید.',
        verifiedHash: '0x8f2a9e14c3b7a5e81d09f7a6'
      },
      {
        id: 'aud-02',
        buybackNumber: 'BBK-1404-002',
        actionFa: 'واریز پایا وجه بازخرید طلای ۱۸ عیار متفرقه به شماره شبا',
        operatorNameFa: 'امور مالی دیدار',
        timestampFa: '۱۴۰۴/۱۲/۲۳ - ۱۶:۴۰',
        detailsFa: 'مبلغ ۷۰,۰۶۷,۵۰۰ تومان به شماره شبای احرازشده بانک ملت واریز گردید.',
        verifiedHash: '0x3b7c12f49a88e019a7d55b3c'
      },
      {
        id: 'aud-03',
        buybackNumber: 'BBK-1404-003',
        actionFa: 'انتقال طلای ضایعاتی به کوره ذوب طلای آب‌شده K20',
        operatorNameFa: 'مدیر خزانه دیدار',
        timestampFa: '۱۴۰۴/۱۲/۲۲ - ۱۱:۳۰',
        detailsFa: 'قطعات با پلمپ امنیتی SCRAP-09 تحویل کوره ذوب اتحادیه شد.',
        verifiedHash: '0x1a8d44e590fa77c24bb09e11'
      }
    ];
  }

  public calculateValuation(params: {
    source: K19BuybackSource;
    purity: number; // e.g. 0.750
    grossWeightGrams: number;
    tareWeightGrams: number;
    hasPreciousStones?: boolean;
    certifiedStoneValuationToman?: number;
    conditionGrade: K19ConditionGrade;
  }): {
    assay: Partial<K19AssayVerification>;
    valuation: K19PricingValuation;
  } {
    const netGold = Math.max(0, params.grossWeightGrams - params.tareWeightGrams);
    const equivalent750 = (netGold * params.purity) / 0.750;
    const rawGoldValue = Math.round(equivalent750 * this.benchmarkGram18kToman);

    // پاداش اصالت دیدار: ۱.۵٪ اگر از پاسپورت دیدار باشد
    const isDidar = params.source === 'didar_passport_provenance';
    const provenanceBonusPercent = isDidar ? this.didarBuybackPremiumPercent : 0;
    const provenanceBonusToman = Math.round((rawGoldValue * provenanceBonusPercent) / 100);

    const certifiedGemValue = params.certifiedStoneValuationToman || 0;

    // کسر آبکاری و هزینه ذوب (برای متفرقه یا طلای شکسته)
    let deduction = 0;
    if (params.conditionGrade === 'grade_c_melt_scrap') {
      deduction = Math.round(netGold * 35000); // ۳۵ هزار تومان هزینه بوته و ری‌گیری در هر گرم
    } else if (!isDidar) {
      deduction = Math.round(netGold * 25000); // کارمزد تست و بازخرید برای طلای متفرقه
    }

    const grossValuation = rawGoldValue + provenanceBonusToman + certifiedGemValue;
    const finalCashPayout = Math.max(0, grossValuation - deduction);

    // پاداش تشویقی معاوضه طلای نو دیدار (۲.۵٪)
    const tradeInIncentivePercent = 2.5;
    const tradeInIncentiveToman = Math.round((finalCashPayout * tradeInIncentivePercent) / 100);
    const finalTradeInPayout = finalCashPayout + tradeInIncentiveToman;

    const equivalentGoldSoot = Math.round(equivalent750 * 1000);

    return {
      assay: {
        testedPurity: params.purity,
        grossWeightGrams: params.grossWeightGrams,
        tareWeightGrams: params.tareWeightGrams,
        netGoldWeightGrams: netGold,
        equivalent750WeightGrams: Number(equivalent750.toFixed(3)),
        hasPreciousStones: Boolean(params.hasPreciousStones),
        certifiedStoneValuationToman: certifiedGemValue
      },
      valuation: {
        benchmark18kGramPriceToman: this.benchmarkGram18kToman,
        rawGoldValueToman: rawGoldValue,
        provenanceBonusPercent,
        provenanceBonusToman,
        certifiedGemValueToman: certifiedGemValue,
        tradeInIncentivePercent,
        tradeInIncentiveToman,
        handlingOrRefiningDeductionToman: deduction,
        grossValuationToman: grossValuation,
        finalCashPayoutToman: finalCashPayout,
        finalTradeInPayoutToman: finalTradeInPayout,
        equivalentGoldSoot: equivalentGoldSoot
      }
    };
  }

  public getData(): K19DataPayload {
    const totalBuybacksCount = this.records.length;
    const activeInspectionsCount = this.records.filter(
      (r) => r.stage === 'quotation_requested' || r.stage === 'intake_assay_inspecting' || r.stage === 'valuation_offer_ready'
    ).length;

    const completedRecords = this.records.filter(
      (r) => r.stage === 'settled_payout_completed' || r.stage === 'vault_custody_routed'
    );

    const totalCompletedVolumeToman = completedRecords.reduce(
      (sum, r) => sum + (r.valuation.finalCashPayoutToman || 0),
      0
    );

    const totalGoldAcquiredGrams = Number(
      completedRecords
        .reduce((sum, r) => sum + (r.assay.equivalent750WeightGrams || 0), 0)
        .toFixed(3)
    );

    const tradeInCount = completedRecords.filter(
      (r) => r.settlement.selectedMethod === 'trade_in_voucher'
    ).length;
    const tradeInConversionPercentage =
      completedRecords.length > 0 ? Math.round((tradeInCount / completedRecords.length) * 100) : 0;

    const didarCount = this.records.filter((r) => r.source === 'didar_passport_provenance').length;
    const didarProvenanceSharePercent =
      totalBuybacksCount > 0 ? Math.round((didarCount / totalBuybacksCount) * 100) : 0;

    const metrics: K19Metrics = {
      totalBuybacksCount,
      activeInspectionsCount,
      totalCompletedVolumeToman,
      totalGoldAcquiredGrams,
      tradeInConversionPercentage,
      avgSettlementMinutes: 24,
      didarProvenanceSharePercent
    };

    return {
      metrics,
      records: this.records,
      auditLogs: this.auditLogs,
      currentGoldPrice: {
        gram18kToman: this.benchmarkGram18kToman,
        benchmarkTimestampFa: 'امروز - ساعت رسمی اتحادیه طلا',
        didarBuybackPremiumPercent: this.didarBuybackPremiumPercent
      }
    };
  }

  public getRecordById(id: string): BuybackRecord | undefined {
    return this.records.find((r) => r.id === id || r.buybackNumber === id);
  }

  public createRecord(payload: {
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
  }): BuybackRecord {
    const newIdx = this.records.length + 1;
    const buybackNumber = `BBK-1404-${String(newIdx).padStart(3, '0')}`;
    const receiptBarcode = `DID-BBK-${Math.floor(100000 + Math.random() * 900000)}`;

    const purity = payload.testedPurity || 0.750;
    const tare = payload.tareWeightGrams || 0;

    const valResult = this.calculateValuation({
      source: payload.source,
      purity,
      grossWeightGrams: payload.grossWeightGrams,
      tareWeightGrams: tare,
      hasPreciousStones: payload.hasPreciousStones,
      certifiedStoneValuationToman: payload.certifiedStoneValuationToman,
      conditionGrade: payload.conditionGrade
    });

    const sourceFaMap: Record<K19BuybackSource, string> = {
      didar_passport_provenance: 'پاسپورت اصیل دیدار (K06/K17)',
      external_market_gold: 'طلای متفرقه بازاری و کارکرده',
      coin_bullion: 'مسکوکات بانکی و شمش استاندارد',
      broken_scrap: 'طلای آسیب‌دیده، شکسته و متفرقه'
    };

    const conditionGradeFaMap: Record<K19ConditionGrade, string> = {
      grade_a_mint: 'درجه ۱ (نو و بی‌نقص، آماده جلای ویترینی)',
      grade_b_normal: 'درجه ۲ (سالم با خط و خش جزئی)',
      grade_c_melt_scrap: 'درجه ۳ (شکسته و دفرمه، مستقیم به کوره ذوب)'
    };

    const assayMethodFaMap: Record<K19AssayMethod, string> = {
      touchstone_acid: 'سنگ محک و اسید استاندارد ۱۸ عیار',
      xrf_spectrometry: 'طیف‌سنجی غیرمخرب اشعه ایکس XRF',
      refinery_melt_sample: 'نمونه‌برداری و کوپلاسیون ری‌گیری'
    };

    const record: BuybackRecord = {
      id: `bbk-${newIdx}`,
      buybackNumber,
      receiptBarcode,
      createdAtFa: '۱۴۰۴/۱۲/۲۵',
      itemUid: payload.itemUid,
      itemTitleFa: payload.itemTitleFa,
      source: payload.source,
      sourceFa: sourceFaMap[payload.source] || 'نامشخص',
      stage: 'valuation_offer_ready',
      stageFa: 'پیشنهاد قطعی قیمت آماده پذیرش',
      conditionGrade: payload.conditionGrade,
      conditionGradeFa: conditionGradeFaMap[payload.conditionGrade] || 'درجه استاندارد',
      seller: {
        fullName: payload.sellerFullName,
        nationalId: payload.sellerNationalId,
        mobile: payload.sellerMobile,
        bankIban: payload.sellerBankIban || 'نامشخص',
        bankNameFa: payload.sellerBankNameFa || 'بانک عضو شتاب',
        nationalCardVerified: true,
        amlClearanceConfirmed: true,
        city: payload.sellerCity || 'تهران'
      },
      assay: {
        method: payload.assayMethod || 'touchstone_acid',
        methodFa: assayMethodFaMap[payload.assayMethod || 'touchstone_acid'],
        testedKaratFa: payload.testedKaratFa || '۱۸ عیار استاندارد (۷۵۰)',
        testedPurity: purity,
        grossWeightGrams: payload.grossWeightGrams,
        tareWeightGrams: tare,
        netGoldWeightGrams: valResult.assay.netGoldWeightGrams || payload.grossWeightGrams,
        equivalent750WeightGrams: valResult.assay.equivalent750WeightGrams || payload.grossWeightGrams,
        hasPreciousStones: Boolean(payload.hasPreciousStones),
        preciousStoneDescriptionFa: payload.preciousStoneDescriptionFa,
        certifiedStoneValuationToman: payload.certifiedStoneValuationToman,
        scaleSerialNo: 'SARTORIUS-LAB-094',
        assayOperatorFa: payload.operatorNameFa || 'کارشناس عیارسنجی دیدار',
        assayTimestampFa: 'امروز - ساعت پذیرش',
        assayNotesFa: 'احراز سلامت اولیه و تایید خلوص طلا'
      },
      valuation: valResult.valuation,
      settlement: {
        selectedMethod: 'instant_bank_transfer',
        methodFa: 'در انتظار تایید روش تسویه توسط مشتری',
        isSettled: false
      },
      timeline: [
        {
          id: `tml-${Date.now()}-1`,
          stage: 'intake_assay_inspecting',
          titleFa: 'پذیرش، ثبت هویتی و عیارسنجی قطعه',
          descriptionFa: `قطعه به وزن ناخالص ${payload.grossWeightGrams} گرم پذیرش و ارزیابی آزمایشگاهی شد.`,
          timestampFa: 'امروز - ثبت اولیه',
          operatorNameFa: payload.operatorNameFa || 'کارشناس پذیرش دیدار'
        },
        {
          id: `tml-${Date.now()}-2`,
          stage: 'valuation_offer_ready',
          titleFa: 'محاسبه ارزش و صدور پیشنهاد بازخرید',
          descriptionFa: `پیشنهاد نقدی ${valResult.valuation.finalCashPayoutToman.toLocaleString('fa-IR')} تومان و معاوضه ${valResult.valuation.finalTradeInPayoutToman.toLocaleString('fa-IR')} تومان آماده شد.`,
          timestampFa: 'امروز - ارزش‌گذاری',
          operatorNameFa: 'موتور قیمت‌گذاری شفاف K19'
        }
      ]
    };

    this.records.unshift(record);

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      buybackNumber,
      actionFa: 'ثبت پرونده جدید بازخرید و صدور پیشنهاد قیمت',
      operatorNameFa: payload.operatorNameFa || 'کارشناس پذیرش دیدار',
      timestampFa: 'امروز',
      detailsFa: `ثبت بازخرید قطعه «${payload.itemTitleFa}» متعلق به ${payload.sellerFullName}`,
      verifiedHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`
    });

    return record;
  }

  public updateAssayAndValuation(
    id: string,
    update: {
      testedPurity?: number;
      grossWeightGrams?: number;
      tareWeightGrams?: number;
      certifiedStoneValuationToman?: number;
      conditionGrade?: K19ConditionGrade;
      notesFa?: string;
      operatorNameFa?: string;
    }
  ): BuybackRecord {
    const record = this.getRecordById(id);
    if (!record) {
      throw new Error(`پرونده بازخرید با شناسه ${id} یافت نشد.`);
    }

    if (update.conditionGrade) {
      record.conditionGrade = update.conditionGrade;
    }

    const purity = update.testedPurity !== undefined ? update.testedPurity : record.assay.testedPurity;
    const gross = update.grossWeightGrams !== undefined ? update.grossWeightGrams : record.assay.grossWeightGrams;
    const tare = update.tareWeightGrams !== undefined ? update.tareWeightGrams : record.assay.tareWeightGrams;
    const gemVal = update.certifiedStoneValuationToman !== undefined ? update.certifiedStoneValuationToman : record.assay.certifiedStoneValuationToman;

    const valResult = this.calculateValuation({
      source: record.source,
      purity,
      grossWeightGrams: gross,
      tareWeightGrams: tare,
      hasPreciousStones: record.assay.hasPreciousStones,
      certifiedStoneValuationToman: gemVal,
      conditionGrade: record.conditionGrade
    });

    record.assay.testedPurity = purity;
    record.assay.grossWeightGrams = gross;
    record.assay.tareWeightGrams = tare;
    record.assay.netGoldWeightGrams = valResult.assay.netGoldWeightGrams!;
    record.assay.equivalent750WeightGrams = valResult.assay.equivalent750WeightGrams!;
    record.assay.certifiedStoneValuationToman = gemVal;
    if (update.notesFa) record.assay.assayNotesFa = update.notesFa;

    record.valuation = valResult.valuation;

    record.timeline.push({
      id: `tml-${Date.now()}`,
      stage: record.stage,
      titleFa: 'به‌روزرسانی عیارسنجی و بازتوزین آزمایشگاهی',
      descriptionFa: `توزین مجدد انجام شد. وزن خالص: ${record.assay.netGoldWeightGrams} گرم، ارزش جدید نقدی: ${valResult.valuation.finalCashPayoutToman.toLocaleString('fa-IR')} تومان`,
      timestampFa: 'امروز',
      operatorNameFa: update.operatorNameFa || 'کارشناس آزمایشگاه'
    });

    return record;
  }

  public confirmPayoutAndSettle(
    id: string,
    params: {
      method: K19PayoutMethod;
      transactionRef?: string;
      operatorNameFa?: string;
      vaultId?: string;
    }
  ): BuybackRecord {
    const record = this.getRecordById(id);
    if (!record) {
      throw new Error(`پرونده بازخرید با شناسه ${id} یافت نشد.`);
    }

    const methodFaMap: Record<K19PayoutMethod, string> = {
      instant_bank_transfer: 'واریز بین‌بانکی پایا/ساتنا به شماره شبا',
      gold_wallet_credit: 'شارژ کیف طلای دیجیتال دیدار (K09)',
      trade_in_voucher: 'صدور بن معاوضه طلای نو با ۲.۵٪ شارژ تشویقی',
      cash_teller: 'پرداخت نقدی مجاز صندوق گالری'
    };

    record.stage = 'settled_payout_completed';
    record.stageFa = 'تسویه کامل و تحویل قطعی';
    record.settlement.selectedMethod = params.method;
    record.settlement.methodFa = methodFaMap[params.method];
    record.settlement.isSettled = true;
    record.settlement.settledAtFa = 'امروز - ساعت تسویه';
    record.settlement.settlementRefCode = params.transactionRef || `TRF-${Math.floor(1000000 + Math.random() * 9000000)}`;
    record.settlement.destinationVaultId = params.vaultId || 'vlt-01';

    if (params.method === 'trade_in_voucher') {
      record.settlement.tradeInVoucherCode = `DIDAR-TRD-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    record.timeline.push({
      id: `tml-${Date.now()}`,
      stage: 'settled_payout_completed',
      titleFa: 'تسویه حساب و خاتمه بازخرید',
      descriptionFa: `تسویه به روش «${methodFaMap[params.method]}» انجام پذیرفت. کد رهگیری: ${record.settlement.settlementRefCode}`,
      timestampFa: 'امروز',
      operatorNameFa: params.operatorNameFa || 'امور مالی دیدار'
    });

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      buybackNumber: record.buybackNumber,
      actionFa: `تسویه بازخرید به روش ${methodFaMap[params.method]}`,
      operatorNameFa: params.operatorNameFa || 'امور مالی دیدار',
      timestampFa: 'امروز',
      detailsFa: `تسویه مبلغ ${record.valuation.finalCashPayoutToman.toLocaleString('fa-IR')} تومان بابت پرونده ${record.buybackNumber}`,
      verifiedHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`
    });

    return record;
  }

  public routeDestination(
    id: string,
    params: {
      destination: 'k20_refurbish_secondary' | 'k20_scrap_smelting' | 'k09_reserve_vault';
      notesFa?: string;
      operatorNameFa?: string;
    }
  ): BuybackRecord {
    const record = this.getRecordById(id);
    if (!record) {
      throw new Error(`پرونده بازخرید با شناسه ${id} یافت نشد.`);
    }

    const destFaMap: Record<string, string> = {
      k20_refurbish_secondary: 'ارسال به کارگاه پرداخت و بازسازی جهت فروش در بازار ثانویه (K20)',
      k20_scrap_smelting: 'انتقال به بسته ذوب و تبدیل به شمش طلای آب‌شده استاندارد (K20)',
      k09_reserve_vault: 'نگهداری در خزانه امن مرکزی ذخایر طلا (K09)'
    };

    record.stage = 'vault_custody_routed';
    record.stageFa = 'تعیین سرنوشت قطعه و انتقال به خزانه';
    record.routingDecision = {
      destination: params.destination,
      destinationFa: destFaMap[params.destination],
      routedAtFa: 'امروز',
      routingNotesFa: params.notesFa || 'انتقال طبق دستورالعمل لجستیک طلا'
    };

    record.timeline.push({
      id: `tml-${Date.now()}`,
      stage: 'vault_custody_routed',
      titleFa: 'تعیین تکلیف فیزیکی قطعه بازخرید شده',
      descriptionFa: destFaMap[params.destination],
      timestampFa: 'امروز',
      operatorNameFa: params.operatorNameFa || 'مدیریت خزانه'
    });

    return record;
  }
}

export const k19Storage = new K19StorageEngine();
