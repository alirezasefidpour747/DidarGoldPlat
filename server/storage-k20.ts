/**
 * Didar Gold Platform - Kernel 20 (K20) Storage Engine
 * Secondary Market, Refurbishment Workshop, CPO Showcase & Scrap Smelting/Recycling
 */

import {
  K20DataPayload,
  K20RefurbishedItem,
  K20MeltBatch,
  K20GemRecovery,
  K20Metrics,
  K20AuditLog,
  K20RefurbishStatus,
  K20MeltStatus,
  K20GemRecoveryStatus
} from '../src/types/k20.js';

class K20StorageEngine {
  private refurbishedItems: K20RefurbishedItem[] = [];
  private meltBatches: K20MeltBatch[] = [];
  private gemRecoveries: K20GemRecovery[] = [];
  private auditLogs: K20AuditLog[] = [];

  // نرخ پایه روز طلای ۱۸ عیار از K13
  private benchmarkGram18kToman: number = 6150000;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // اقلام احیاشده و ویترین CPO دیدار
    this.refurbishedItems = [
      {
        id: 'cpo-01',
        itemCode: 'CPO-1404-001',
        sourceBuybackId: 'BBK-1404-001',
        originalTitleFa: 'گردنبند طرح شوپارد طلا ۱۸ عیار با نگین برلیان اصل',
        categoryFa: 'گردنبند مجلسی',
        karatFa: '۱۸ عیار استاندارد (۷۵۰)',
        purity: 0.750,
        grossWeightGrams: 15.300,
        netGoldWeightGrams: 15.100,
        hasPreciousStones: true,
        gemsDescriptionFa: 'تک نگین برلیان طبیعی شناسنامه‌دار ۰.۱۸ قیراطی پاکی VVS2 رنگ E',
        gemCaratWeight: 0.18,
        status: 'cpo_showcase_listed',
        statusFa: 'عرضه در ویترین طلای احیاشده دیدار (CPO)',
        workshopNameFa: 'کارگاه مرکزی احیا و آبکاری زرین دیدار',
        artisanNameFa: 'استاد مسعود داوودی (طلاساز ارشد)',
        intakeDateFa: '۱۴۰۴/۱۲/۲۴',
        completionDateFa: '۱۴۰۴/۱۲/۲۶',
        refurbishCostToman: 2800000,
        originalNewRetailPriceToman: 124500000,
        cpoSellingPriceToman: 99400000,
        savingsForCustomerToman: 25100000,
        savingsPercent: 20.2,
        qcScore: 99,
        qcInspectorFa: 'مهندس حسینی (سرپرست QC)',
        passportUid: 'DID-CPO-2026-9901',
        warrantyMonths: 12,
        beforeAfterNotesFa: 'جرم‌زدایی کامل با دستگاه التراسونیک، پولیش لیزری سطح زیرین، آبکاری رودیوم دوبل، محکم‌کاری پایه برلیان با چنگه‌های نو.'
      },
      {
        id: 'cpo-02',
        itemCode: 'CPO-1404-002',
        sourceBuybackId: 'BBK-1404-004',
        originalTitleFa: 'دستبند زنجیری فیگارو تراش‌خورده طلا ۱۸ عیار',
        categoryFa: 'دستبند مردانه/اسپرت',
        karatFa: '۱۸ عیار استاندارد (۷۵۰)',
        purity: 0.750,
        grossWeightGrams: 18.750,
        netGoldWeightGrams: 18.750,
        hasPreciousStones: false,
        status: 'cpo_showcase_listed',
        statusFa: 'عرضه در ویترین طلای احیاشده دیدار (CPO)',
        workshopNameFa: 'کارگاه پرداخت تخصصی شماره ۲ دیدار',
        artisanNameFa: 'استاد بهنام شاکری',
        intakeDateFa: '۱۴۰۴/۱۲/۲۳',
        completionDateFa: '۱۴۰۴/۱۲/۲۵',
        refurbishCostToman: 1950000,
        originalNewRetailPriceToman: 142000000,
        cpoSellingPriceToman: 119800000,
        savingsForCustomerToman: 22200000,
        savingsPercent: 15.6,
        qcScore: 97,
        qcInspectorFa: 'مهندس حسینی',
        passportUid: 'DID-CPO-2026-9902',
        warrantyMonths: 6,
        beforeAfterNotesFa: 'تعویض قفل مدبر آسیب‌دیده با قفل فابریک طلای ۱۸ عیار استاندارد دیدار، پرداخت گویچه‌ای و جلای ویترینی بدون هیچ‌گونه کسر وزن طلا.'
      },
      {
        id: 'cpo-03',
        itemCode: 'CPO-1404-003',
        sourceBuybackId: 'BBK-1404-005',
        originalTitleFa: 'انگشتر تک‌نگین البرنادو دور سولیتر طلای زرد',
        categoryFa: 'انگشتر زنانه',
        karatFa: '۱۸ عیار استاندارد (۷۵۰)',
        purity: 0.750,
        grossWeightGrams: 4.820,
        netGoldWeightGrams: 4.600,
        hasPreciousStones: true,
        gemsDescriptionFa: 'تک نگین موزانایت آزمایشگاهی درجه یک تراش پرنسس',
        gemCaratWeight: 0.35,
        status: 'rhodium_plating',
        statusFa: 'در حال آبکاری دو رنگ طلا و رودیوم',
        workshopNameFa: 'کارگاه مرکزی احیا و آبکاری زرین دیدار',
        artisanNameFa: 'استاد کامران فرهمند',
        intakeDateFa: '۱۴۰۴/۱۲/۲۶',
        refurbishCostToman: 1200000,
        originalNewRetailPriceToman: 38500000,
        cpoSellingPriceToman: 30800000,
        savingsForCustomerToman: 7700000,
        savingsPercent: 20.0,
        qcScore: 94,
        qcInspectorFa: 'خانم مهندس رادپور',
        warrantyMonths: 6,
        beforeAfterNotesFa: 'سایز انگشتر از ۵۲ به ۵۴ استاندارد تغییر یافت. جوش لیزری بدون تغییر رنگ و هم‌اکنون در مرحله آبکاری ترکیبی قرار دارد.'
      },
      {
        id: 'cpo-04',
        itemCode: 'CPO-1404-004',
        sourceBuybackId: 'BBK-1404-006',
        originalTitleFa: 'النگو تراش عربی سایز ۲ طلای ۱۸ عیار',
        categoryFa: 'النگو',
        karatFa: '۱۸ عیار استاندارد (۷۵۰)',
        purity: 0.750,
        grossWeightGrams: 9.400,
        netGoldWeightGrams: 9.400,
        hasPreciousStones: false,
        status: 'polishing_buffing',
        statusFa: 'در حال پولیش نهایی و جلای آینه‌ای',
        workshopNameFa: 'کارگاه پرداخت تخصصی شماره ۲ دیدار',
        artisanNameFa: 'استاد بهنام شاکری',
        intakeDateFa: '۱۴۰۴/۱۲/۲۷',
        refurbishCostToman: 980000,
        originalNewRetailPriceToman: 72000000,
        cpoSellingPriceToman: 60200000,
        savingsForCustomerToman: 11800000,
        savingsPercent: 16.4,
        qcScore: 95,
        qcInspectorFa: 'مهندس حسینی',
        warrantyMonths: 6,
        beforeAfterNotesFa: 'رفع خراشیدگی‌های لبه داخلی و خارجی النگو بدون کاهش ضخامت، مات‌کاری مجدد شیارهای برجسته مطابق طرح اصلی کارخانه.'
      },
      {
        id: 'cpo-05',
        itemCode: 'CPO-1404-005',
        sourceTicketId: 'TCK-1404-082',
        originalTitleFa: 'گوشواره آویز اشک ونکلیف با نگین صدف طبیعی',
        categoryFa: 'گوشواره',
        karatFa: '۱۸ عیار استاندارد (۷۵۰)',
        purity: 0.750,
        grossWeightGrams: 6.220,
        netGoldWeightGrams: 5.800,
        hasPreciousStones: true,
        gemsDescriptionFa: 'صفحه صدف طبیعی سفید ماداگاسکار درجه AAA',
        status: 'sold_reissued',
        statusFa: 'فروش مجدد در فروشگاه و صدور پاسپورت CPO',
        workshopNameFa: 'کارگاه مرکزی احیا و آبکاری زرین دیدار',
        artisanNameFa: 'استاد مسعود داوودی',
        intakeDateFa: '۱۴۰۴/۱۲/۲۰',
        completionDateFa: '۱۴۰۴/۱۲/۲۲',
        refurbishCostToman: 1600000,
        originalNewRetailPriceToman: 49000000,
        cpoSellingPriceToman: 39100000,
        savingsForCustomerToman: 9900000,
        savingsPercent: 20.2,
        qcScore: 98,
        qcInspectorFa: 'مهندس حسینی',
        passportUid: 'DID-CPO-2026-9884',
        warrantyMonths: 12,
        beforeAfterNotesFa: 'احیای کامل صدف، تعویض بست میخی و فنر عصایی با قطعه ارجینال، واگذاری به مشتری شعبه زعفرانیه با ضمانت کتبی یکساله.'
      },
      {
        id: 'cpo-06',
        itemCode: 'CPO-1404-006',
        sourceBuybackId: 'BBK-1404-009',
        originalTitleFa: 'سرویس کامل زنجیری مروارید باروک و طلا ۱۸ عیار',
        categoryFa: 'سرویس طلا',
        karatFa: '۱۸ عیار استاندارد (۷۵۰)',
        purity: 0.750,
        grossWeightGrams: 28.600,
        netGoldWeightGrams: 22.400,
        hasPreciousStones: true,
        gemsDescriptionFa: '۱۲ عدد مروارید باروک پرورشی طبیعی آب شیرین با درخشش صدفی عالی',
        status: 'intake_assessment',
        statusFa: 'پذیرش در کارگاه و ارزیابی عیار و ساختار فیزیکی',
        workshopNameFa: 'کارگاه مرکزی احیا و آبکاری زرین دیدار',
        artisanNameFa: 'استاد رضا کمالی',
        intakeDateFa: '۱۴۰۴/۱۲/۲۸',
        refurbishCostToman: 3500000,
        originalNewRetailPriceToman: 210000000,
        cpoSellingPriceToman: 168000000,
        savingsForCustomerToman: 42000000,
        savingsPercent: 20.0,
        qcScore: 92,
        qcInspectorFa: 'خانم مهندس رادپور',
        warrantyMonths: 12,
        beforeAfterNotesFa: 'نیاز به گره‌بندی مجدد ابریشمی بین مرواریدها و آبکاری زرد ۲۴ عیار براق بر روی قفل‌های ملوانی.'
      }
    ];

    // بوته‌های کوره ذوب، ریخته‌گری شمش و بازیافت قراضه
    this.meltBatches = [
      {
        id: 'mlt-01',
        batchNumber: 'MLT-1404-008',
        createdAtFa: '۱۴۰۴/۱۲/۲۳',
        status: 'vault_deposited',
        statusFa: 'تایید انگ ری‌گیری و تحویل قطعی به خزانه مرکزی (K09)',
        furnaceOperatorFa: 'استاد جواد معتمدی (سرپرست کوره و ریخته‌گری)',
        crucibleNumber: 'CRU-F4-90',
        sourceItemsCount: 14,
        sourceItemsSummaryFa: 'قطعات شکسته، زنجیر پاره، تاره و طلای متفرقه درجه ۳ بازخرید شعب',
        totalInputWeightGrams: 248.500,
        expectedPurity: 0.748,
        meltedIngotWeightGrams: 246.610,
        refiningLossGrams: 1.890,
        refiningLossPercent: 0.76,
        assayLabNameFa: 'آزمایشگاه ری‌گیری رسمی اتحاد (مورد تایید اتحادیه طلا تهران)',
        assayCertificateNumber: 'انگ ۷۵۰/۴۴۸۱',
        certifiedPurity: 0.7502,
        equivalent750WeightGrams: 246.675,
        castBarBarcode: 'DID-INGOT-AU750-1404-008',
        destination: 'k09_reserve_vault',
        destinationFa: 'خزانه مرکزی شمش آب‌شده دیدار (K09 - صندوق شمش ذخیره)',
        settlementValueToman: 1517051250
      },
      {
        id: 'mlt-02',
        batchNumber: 'MLT-1404-009',
        createdAtFa: '۱۴۰۴/۱۲/۲۵',
        status: 'bar_cast_completed',
        statusFa: 'شمش ریخته‌گری شد / آماده تحویل به خط تولید K07',
        furnaceOperatorFa: 'استاد جواد معتمدی',
        crucibleNumber: 'CRU-F2-45',
        sourceItemsCount: 9,
        sourceItemsSummaryFa: 'پلاک‌ها و تکه‌های ذوبی سبک و ضایعات غیرقابل احیا',
        totalInputWeightGrams: 135.200,
        expectedPurity: 0.750,
        meltedIngotWeightGrams: 134.120,
        refiningLossGrams: 1.080,
        refiningLossPercent: 0.80,
        assayLabNameFa: 'آزمایشگاه عیارسنجی و ری‌گیری تهران‌متال',
        assayCertificateNumber: 'انگ ۷۵۱/۱۲۰۳',
        certifiedPurity: 0.7510,
        equivalent750WeightGrams: 134.298,
        castBarBarcode: 'DID-INGOT-AU750-1404-009',
        destination: 'k07_supplier_workshop',
        destinationFa: 'تخصیص به کارگاه سازنده طلا دیدار (K07) برای ساخت کالکشن نوروز',
        settlementValueToman: 825932700
      },
      {
        id: 'mlt-03',
        batchNumber: 'MLT-1404-010',
        createdAtFa: '۱۴۰۴/۱۲/۲۷',
        status: 'assaying_lab',
        statusFa: 'نمونه‌برداری ری‌گیری و ارسال به آزمایشگاه همکار اتحادیه',
        furnaceOperatorFa: 'مهندس حمیدرضا صبوری',
        crucibleNumber: 'CRU-F3-80',
        sourceItemsCount: 18,
        sourceItemsSummaryFa: 'طلای متفرقه تحویلی معاوضه‌ها و اقلام مرجوعی تست اسید',
        totalInputWeightGrams: 310.800,
        expectedPurity: 0.745,
        meltedIngotWeightGrams: 308.200,
        refiningLossGrams: 2.600,
        refiningLossPercent: 0.84,
        assayLabNameFa: 'آزمایشگاه ری‌گیری رسمی سبزه میدان تهران',
        assayCertificateNumber: 'در انتظار اعلام نتیجه انگ (رسید پذیرش شماره ۹۸۸۲)',
        certifiedPurity: 0.7470,
        equivalent750WeightGrams: 306.968,
        castBarBarcode: 'DID-INGOT-AU750-1404-010-PEND',
        destination: 'k09_reserve_vault',
        destinationFa: 'خزانه مرکزی شمش آب‌شده دیدار (K09)',
        settlementValueToman: 1887853200
      },
      {
        id: 'mlt-04',
        batchNumber: 'MLT-1404-011',
        createdAtFa: '۱۴۰۴/۱۲/۲۸',
        status: 'batching_crucible',
        statusFa: 'در حال تجمیع طلای شکسته و آماده‌سازی بوته ذوب شماره ۵',
        furnaceOperatorFa: 'استاد جواد معتمدی',
        crucibleNumber: 'CRU-F5-120',
        sourceItemsCount: 8,
        sourceItemsSummaryFa: 'اقلام هدایت‌شده از کارتابل بازخرید K19 امروز',
        totalInputWeightGrams: 92.400,
        expectedPurity: 0.750,
        meltedIngotWeightGrams: 0,
        refiningLossGrams: 0,
        refiningLossPercent: 0,
        assayLabNameFa: 'آزمایشگاه ری‌گیری رسمی اتحاد',
        assayCertificateNumber: 'هنوز ذوب نشده است',
        certifiedPurity: 0.750,
        equivalent750WeightGrams: 92.400,
        castBarBarcode: 'DID-INGOT-PENDING',
        destination: 'k09_reserve_vault',
        destinationFa: 'خزانه شمش آب‌شده K09',
        settlementValueToman: 568260000
      }
    ];

    // بازیابی گوهرسنگ‌ها و برلیان‌های قیمتی
    this.gemRecoveries = [
      {
        id: 'gem-01',
        recoveryCode: 'GEM-1404-001',
        gemTypeFa: 'برلیان طبیعی الماس تراش Round Brilliant',
        sourceBuybackNumber: 'BBK-1404-001',
        caratWeight: 0.42,
        cutShapeFa: 'گرد برلیانت ۵۷ پخ ایده‌آل',
        colorGrade: 'Color F (بی‌رنگ اعلا)',
        clarityGrade: 'Clarity VVS1',
        estimatedValueToman: 38000000,
        status: 'vault_reserved',
        statusFa: 'درجه‌بندی شد و در گاوصندوق گوهرسنگ‌های دیدار ذخیره گردید',
        gemologistFa: 'دکتر فرشید پاک‌طینت (گوهرشناس بین‌المللی GIA)',
        allocatedVaultFa: 'صندوق نسوز گوهرسنگ شماره A-12'
      },
      {
        id: 'gem-02',
        recoveryCode: 'GEM-1404-002',
        gemTypeFa: 'یاقوت سرخ برمه طبیعی (Ruby Natural)',
        sourceBuybackNumber: 'BBK-1404-003',
        caratWeight: 1.15,
        cutShapeFa: 'تراش بالشتی (Cushion Cut)',
        colorGrade: 'Pigeon Blood Red',
        clarityGrade: 'Eye Clean (شفاف طبیعی)',
        estimatedValueToman: 64000000,
        status: 'remounted',
        statusFa: 'بر روی انگشتر فاخر جدید کالکشن نوروز دیدار نشانده شد',
        gemologistFa: 'دکتر فرشید پاک‌طینت',
        allocatedVaultFa: 'تخصیص به خط طراحی جواهرات خاص K05'
      },
      {
        id: 'gem-03',
        recoveryCode: 'GEM-1404-003',
        gemTypeFa: 'زمرد طبیعی کلمبیا با جلای روغنی استاندارد',
        sourceBuybackNumber: 'BBK-1404-007',
        caratWeight: 0.88,
        cutShapeFa: 'تراش امرالد کات (Emerald Cut)',
        colorGrade: 'Vivid Green',
        clarityGrade: 'Minor Inclusions (ژاردن طبیعی)',
        estimatedValueToman: 52000000,
        status: 'cleaned_graded',
        statusFa: 'شستشوی التراسونیک و صدور شناسنامه انفرادی گوهرسنگ',
        gemologistFa: 'خانم مهندس یاسینی (گوهرسنجی دیدار)',
        allocatedVaultFa: 'صندوق گوهرسنگ شماره B-04'
      },
      {
        id: 'gem-04',
        recoveryCode: 'GEM-1404-004',
        gemTypeFa: 'مجموعه میکروبرلیان‌های پیوه (Pave Melee Diamonds)',
        sourceBuybackNumber: 'BBK-1404-008',
        caratWeight: 1.65,
        cutShapeFa: '۳۸ عدد برلیان ریز ۰.۰۴ قیراطی',
        colorGrade: 'Color G-H',
        clarityGrade: 'VS2-SI1',
        estimatedValueToman: 29500000,
        status: 'extracted',
        statusFa: 'جداسازی با اسیدکاری ملایم و آماده‌سازی برای سورتینگ',
        gemologistFa: 'خانم مهندس یاسینی',
        allocatedVaultFa: 'بسته دسته‌بندی پیوه C-09'
      }
    ];

    // لاگ‌های ممیزی تغییرناپذیر
    this.auditLogs = [
      {
        id: 'aud-20-01',
        timestampFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۳۰',
        category: 'smelting',
        actionFa: 'ثبت و ریخته‌گری شمش آب‌شده MLT-1404-009',
        detailsFa: 'تکمیل عملیات ذوب ۱۳۵.۲ گرم طلای شکسته، افت کوره ۰.۸۰٪ و صدور برچسب شمش با بارکد DID-INGOT-AU750-1404-009',
        operatorFa: 'استاد جواد معتمدی',
        batchOrItemCode: 'MLT-1404-009',
        integrityHash: 'sha256-e99a818c72834e9d72b64bfa1928374a2b1'
      },
      {
        id: 'aud-20-02',
        timestampFa: '۱۴۰۴/۱۲/۲۸ - ۰۹:۴۵',
        category: 'refurbishment',
        actionFa: 'پاس شدن کنترل کیفیت و صدور پاسپورت CPO گردنبند شوپارد',
        detailsFa: 'کسب نمره ۹۹ از ۱۰۰ در بازرسی ۱۲ مرحله‌ای کارگاه و درج رسمی در ویترین طلای احیاشده دیدار با کد CPO-1404-001',
        operatorFa: 'مهندس حسینی (سرپرست QC)',
        batchOrItemCode: 'CPO-1404-001',
        integrityHash: 'sha256-4c8d19762fa3901bce74a382109485b018e'
      },
      {
        id: 'aud-20-03',
        timestampFa: '۱۴۰۴/۱۲/۲۷ - ۱۶:۲۰',
        category: 'gem_recovery',
        actionFa: 'بازیابی و صدور شناسنامه زمرد کلمبیا ۰.۸۸ قیراط',
        detailsFa: 'جداسازی موفق از قاب فرسوده گوشواره، شستشو با روغن سدر طبیعی و تایید اصالت توسط گوهرشناس ارشد',
        operatorFa: 'دکتر فرشید پاک‌طینت',
        batchOrItemCode: 'GEM-1404-003',
        integrityHash: 'sha256-bb7189a8123ef0082736c1a890e72391acb'
      },
      {
        id: 'aud-20-04',
        timestampFa: '۱۴۰۴/۱۲/۲۶ - ۱۴:۱۰',
        category: 'vault_transfer',
        actionFa: 'تحویل قطعی شمش انگ‌خورده MLT-1404-008 به خزانه K09',
        detailsFa: 'تطبیق عیار آزمایشگاه اتحاد (۷۵۰.۲) با وزن خالص ۲۴۶.۶۷ گرم و صدور رسید انبار دیجیتال خزانه‌داری دیدار',
        operatorFa: 'مدیر خزانه‌داری و کنترل دارایی',
        batchOrItemCode: 'MLT-1404-008',
        integrityHash: 'sha256-a19283f60048e9d2b7194bce3819034aa78'
      }
    ];
  }

  // محاسبه شاخص‌های کلی عملکردی
  private calculateMetrics(): K20Metrics {
    const totalRefurbishedCount = this.refurbishedItems.length;
    const activeInWorkshopCount = this.refurbishedItems.filter(
      (i) => i.status !== 'cpo_showcase_listed' && i.status !== 'sold_reissued'
    ).length;
    const cpoShowcaseItemsCount = this.refurbishedItems.filter(
      (i) => i.status === 'cpo_showcase_listed'
    ).length;

    const totalCpoSoldValueToman = this.refurbishedItems
      .filter((i) => i.status === 'sold_reissued' || i.status === 'cpo_showcase_listed')
      .reduce((sum, item) => sum + item.cpoSellingPriceToman, 0);

    const totalMeltBatchesCount = this.meltBatches.length;
    const totalScrapMeltedGrams = this.meltBatches.reduce(
      (sum, b) => sum + b.totalInputWeightGrams,
      0
    );
    const totalCastBarsGrams = this.meltBatches.reduce(
      (sum, b) => sum + (b.meltedIngotWeightGrams || 0),
      0
    );

    const completedBatches = this.meltBatches.filter((b) => b.refiningLossPercent > 0);
    const averageMeltingYieldPercent =
      completedBatches.length > 0
        ? Number(
            (
              completedBatches.reduce((sum, b) => sum + (100 - b.refiningLossPercent), 0) /
              completedBatches.length
            ).toFixed(2)
          )
        : 99.2;

    const totalGemsRecoveredCount = this.gemRecoveries.length;
    const totalGemRecoveryValueToman = this.gemRecoveries.reduce(
      (sum, g) => sum + g.estimatedValueToman,
      0
    );

    // محاسبه شاخص‌های اقتصاد چرخشی طلای دیدار (پایدار و سازگار با محیط زیست)
    const circularGoldTotalGrams =
      this.refurbishedItems.reduce((sum, i) => sum + i.grossWeightGrams, 0) +
      totalScrapMeltedGrams;
    const circularEconomyGoldKg = Number((circularGoldTotalGrams / 1000).toFixed(3));

    // در استخراج معدنی، هر کیلوگرم طلای خالص معادل انتشار حدود ۱۲,۵۰۰ کیلوگرم CO2 است
    const co2SavedKg = Math.round(circularEconomyGoldKg * 12500);

    return {
      totalRefurbishedCount,
      activeInWorkshopCount,
      cpoShowcaseItemsCount,
      totalCpoSoldValueToman,
      totalMeltBatchesCount,
      totalScrapMeltedGrams,
      totalCastBarsGrams,
      averageMeltingYieldPercent,
      totalGemsRecoveredCount,
      totalGemRecoveryValueToman,
      circularEconomyGoldKg,
      co2SavedKg
    };
  }

  public getData(): K20DataPayload {
    return {
      metrics: this.calculateMetrics(),
      refurbishedItems: this.refurbishedItems,
      meltBatches: this.meltBatches,
      gemRecoveries: this.gemRecoveries,
      auditLogs: this.auditLogs,
      currentGoldPrice: {
        gram18kToman: this.benchmarkGram18kToman,
        benchmarkTimestampFa: 'امروز - مظنه لحظه‌ای اتحادیه'
      }
    };
  }

  public getRefurbishedItemById(id: string): K20RefurbishedItem | undefined {
    return this.refurbishedItems.find((i) => i.id === id || i.itemCode === id);
  }

  public getMeltBatchById(id: string): K20MeltBatch | undefined {
    return this.meltBatches.find((b) => b.id === id || b.batchNumber === id);
  }

  // پیشبرد مرحله کارگاهی کالای CPO
  public updateRefurbishStatus(
    id: string,
    params: {
      status: K20RefurbishStatus;
      qcScore?: number;
      qcInspectorFa?: string;
      passportUid?: string;
      notesFa?: string;
      operatorNameFa?: string;
    }
  ): K20RefurbishedItem {
    const item = this.getRefurbishedItemById(id);
    if (!item) {
      throw new Error(`قطعه احیاشده با شناسه ${id} یافت نشد.`);
    }

    item.status = params.status;

    switch (params.status) {
      case 'intake_assessment':
        item.statusFa = 'پذیرش در کارگاه و ارزیابی عیار و ساختار فیزیکی';
        break;
      case 'ultrasonic_cleaning':
        item.statusFa = 'شستشوی صنعتی التراسونیک و رسوب‌زدایی';
        break;
      case 'polishing_buffing':
        item.statusFa = 'پرداخت مکانیکی و پولیش آینه‌ای';
        break;
      case 'rhodium_plating':
        item.statusFa = 'آبکاری مجدد رودیوم یا لایه محافظ طلای ۲۴ عیار';
        break;
      case 'gem_tightening':
        item.statusFa = 'آچارکشی چنگه‌ها و مخراج‌کاری مجدد نگین‌ها';
        break;
      case 'qc_passed':
        item.statusFa = 'پاس شدن کنترل کیفیت ۱۲ مرحله‌ای کارگاه';
        break;
      case 'cpo_showcase_listed':
        item.statusFa = 'عرضه رسمی در ویترین طلای احیاشده دیدار (CPO)';
        if (!item.completionDateFa) {
          item.completionDateFa = '۱۴۰۴/۱۲/۲۸';
        }
        if (!item.passportUid) {
          item.passportUid = `DID-CPO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        break;
      case 'sold_reissued':
        item.statusFa = 'فروش مجدد با صدور شناسنامه ثانویه و ضمانت‌نامه';
        break;
    }

    if (params.qcScore !== undefined) item.qcScore = params.qcScore;
    if (params.qcInspectorFa) item.qcInspectorFa = params.qcInspectorFa;
    if (params.passportUid) item.passportUid = params.passportUid;
    if (params.notesFa) {
      item.beforeAfterNotesFa = `${item.beforeAfterNotesFa} | ${params.notesFa}`;
    }

    // ثبت لاگ ممیزی
    this.auditLogs.unshift({
      id: `aud-20-${Date.now()}`,
      timestampFa: '۱۴۰۴/۱۲/۲۸ - لحظه‌ای',
      category: 'refurbishment',
      actionFa: `به‌روزرسانی مرحله احیای ${item.itemCode}`,
      detailsFa: `تغییر وضعیت به: ${item.statusFa}. اپراتور: ${params.operatorNameFa || 'کارشناس کارگاه'}`,
      operatorFa: params.operatorNameFa || 'کارشناس کارگاه',
      batchOrItemCode: item.itemCode,
      integrityHash: `sha256-${Math.random().toString(36).substring(2, 15)}`
    });

    return item;
  }

  // ثبت پذیرش جدید برای احیای ویترینی CPO
  public createRefurbishIntake(params: {
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
  }): K20RefurbishedItem {
    const nextSeq = this.refurbishedItems.length + 1;
    const itemCode = `CPO-1404-${String(nextSeq).padStart(3, '0')}`;

    const grossWeight = Number(params.grossWeightGrams);
    const netGold = params.netGoldWeightGrams ? Number(params.netGoldWeightGrams) : grossWeight;
    const refurbCost = params.refurbishCostToman ? Number(params.refurbishCostToman) : 1500000;

    // فرمول قیمت‌گذاری شفاف CPO: طلای خام + سود اندک کارگاه احیا (۳.۵٪) به جای ۲۰٪ اجرت ساخت بازار
    const rawValue = netGold * this.benchmarkGram18kToman;
    const cpoPrice = Math.round(rawValue * 1.035 + refurbCost);
    const originalNewPrice = Math.round(rawValue * 1.22); // قیمت معادل نوی بازار با ۲۲٪ اجرت ساخت
    const savings = originalNewPrice - cpoPrice;
    const savingsPct = Number(((savings / originalNewPrice) * 100).toFixed(1));

    const newItem: K20RefurbishedItem = {
      id: `cpo-${Date.now()}`,
      itemCode,
      sourceBuybackId: params.sourceBuybackId,
      originalTitleFa: params.originalTitleFa,
      categoryFa: params.categoryFa || 'زیورآلات طلا',
      karatFa: '۱۸ عیار استاندارد (۷۵۰)',
      purity: 0.750,
      grossWeightGrams: grossWeight,
      netGoldWeightGrams: netGold,
      hasPreciousStones: Boolean(params.hasPreciousStones),
      gemsDescriptionFa: params.gemsDescriptionFa,
      status: 'intake_assessment',
      statusFa: 'پذیرش در کارگاه و ارزیابی عیار و ساختار فیزیکی',
      workshopNameFa: params.workshopNameFa || 'کارگاه مرکزی احیا و آبکاری زرین دیدار',
      artisanNameFa: params.artisanNameFa || 'استاد مسعود داوودی',
      intakeDateFa: '۱۴۰۴/۱۲/۲۸',
      refurbishCostToman: refurbCost,
      originalNewRetailPriceToman: originalNewPrice,
      cpoSellingPriceToman: cpoPrice,
      savingsForCustomerToman: savings,
      savingsPercent: savingsPct,
      qcScore: 90,
      qcInspectorFa: 'مهندس حسینی',
      warrantyMonths: 12,
      beforeAfterNotesFa: params.beforeAfterNotesFa || 'پذیرش اولیه و ثبت در سامانه ره‌گیری چرخه عمر K20'
    };

    this.refurbishedItems.unshift(newItem);

    this.auditLogs.unshift({
      id: `aud-20-${Date.now()}`,
      timestampFa: '۱۴۰۴/۱۲/۲۸ - لحظه‌ای',
      category: 'refurbishment',
      actionFa: `پذیرش قطعه جدید جهت احیا: ${itemCode}`,
      detailsFa: `عنوان: ${newItem.originalTitleFa}، وزن: ${newItem.grossWeightGrams} گرم. ارزیابی اجرت احیا: ${refurbCost.toLocaleString('fa-IR')} تومان`,
      operatorFa: 'پذیرش کارگاه مرکزی',
      batchOrItemCode: itemCode,
      integrityHash: `sha256-${Math.random().toString(36).substring(2, 15)}`
    });

    return newItem;
  }

  // ایجاد بوته ذوب جدید
  public createMeltBatch(params: {
    crucibleNumber: string;
    furnaceOperatorFa: string;
    sourceItemsCount: number;
    sourceItemsSummaryFa: string;
    totalInputWeightGrams: number;
    expectedPurity?: number;
    destination?: 'k09_reserve_vault' | 'k07_supplier_workshop' | 'treasury_sale';
  }): K20MeltBatch {
    const nextSeq = this.meltBatches.length + 1;
    const batchNumber = `MLT-1404-${String(nextSeq).padStart(3, '0')}`;
    const inputWeight = Number(params.totalInputWeightGrams);
    const expectedPur = params.expectedPurity ? Number(params.expectedPurity) : 0.750;

    const dest = params.destination || 'k09_reserve_vault';
    let destFa = 'خزانه مرکزی شمش آب‌شده دیدار (K09)';
    if (dest === 'k07_supplier_workshop') {
      destFa = 'تخصیص به کارگاه سازنده طلا دیدار (K07) جهت تولید جدید';
    } else if (dest === 'treasury_sale') {
      destFa = 'فروش شمش به خزانه نقدی و تحویل به بازار متشکل طلا';
    }

    const estimatedValue = Math.round(inputWeight * (expectedPur / 0.75) * this.benchmarkGram18kToman);

    const newBatch: K20MeltBatch = {
      id: `mlt-${Date.now()}`,
      batchNumber,
      createdAtFa: '۱۴۰۴/۱۲/۲۸',
      status: 'batching_crucible',
      statusFa: 'در حال تجمیع طلای شکسته و آماده‌سازی بوته ذوب',
      furnaceOperatorFa: params.furnaceOperatorFa || 'استاد جواد معتمدی',
      crucibleNumber: params.crucibleNumber,
      sourceItemsCount: Number(params.sourceItemsCount) || 1,
      sourceItemsSummaryFa: params.sourceItemsSummaryFa || 'طلای قراضه و متفرقه درجه ۳',
      totalInputWeightGrams: inputWeight,
      expectedPurity: expectedPur,
      meltedIngotWeightGrams: 0,
      refiningLossGrams: 0,
      refiningLossPercent: 0,
      assayLabNameFa: 'آزمایشگاه ری‌گیری رسمی اتحادیه طلا',
      assayCertificateNumber: 'در صف آماده‌سازی کوره ذوب',
      certifiedPurity: expectedPur,
      equivalent750WeightGrams: inputWeight,
      castBarBarcode: 'DID-INGOT-PENDING',
      destination: dest,
      destinationFa: destFa,
      settlementValueToman: estimatedValue
    };

    this.meltBatches.unshift(newBatch);

    this.auditLogs.unshift({
      id: `aud-20-${Date.now()}`,
      timestampFa: '۱۴۰۴/۱۲/۲۸ - لحظه‌ای',
      category: 'smelting',
      actionFa: `تشکیل بوته ذوب جدید ${batchNumber}`,
      detailsFa: `بوته ${newBatch.crucibleNumber} با ${newBatch.sourceItemsCount} قطعه و وزن کل ${inputWeight} گرم جهت بازیافت در کوره حرارتی`,
      operatorFa: newBatch.furnaceOperatorFa,
      batchOrItemCode: batchNumber,
      integrityHash: `sha256-${Math.random().toString(36).substring(2, 15)}`
    });

    return newBatch;
  }

  // به‌روزرسانی وضعیت و نتایج بوته ذوب
  public updateMeltBatch(
    id: string,
    params: {
      status: K20MeltStatus;
      meltedIngotWeightGrams?: number;
      assayLabNameFa?: string;
      assayCertificateNumber?: string;
      certifiedPurity?: number;
      destination?: 'k09_reserve_vault' | 'k07_supplier_workshop' | 'treasury_sale';
      operatorNameFa?: string;
    }
  ): K20MeltBatch {
    const batch = this.getMeltBatchById(id);
    if (!batch) {
      throw new Error(`بوته ذوب با شناسه ${id} یافت نشد.`);
    }

    batch.status = params.status;

    if (params.meltedIngotWeightGrams !== undefined) {
      batch.meltedIngotWeightGrams = Number(params.meltedIngotWeightGrams);
      batch.refiningLossGrams = Number(
        (batch.totalInputWeightGrams - batch.meltedIngotWeightGrams).toFixed(3)
      );
      batch.refiningLossPercent = Number(
        ((batch.refiningLossGrams / batch.totalInputWeightGrams) * 100).toFixed(2)
      );
    }

    if (params.assayLabNameFa) batch.assayLabNameFa = params.assayLabNameFa;
    if (params.assayCertificateNumber) batch.assayCertificateNumber = params.assayCertificateNumber;
    if (params.certifiedPurity !== undefined) {
      batch.certifiedPurity = Number(params.certifiedPurity);
      const eq750 = Number(
        (
          ((batch.meltedIngotWeightGrams || batch.totalInputWeightGrams) * batch.certifiedPurity) /
          0.750
        ).toFixed(3)
      );
      batch.equivalent750WeightGrams = eq750;
      batch.settlementValueToman = Math.round(eq750 * this.benchmarkGram18kToman);
    }

    if (params.destination) {
      batch.destination = params.destination;
      if (params.destination === 'k09_reserve_vault') {
        batch.destinationFa = 'خزانه مرکزی شمش آب‌شده دیدار (K09)';
      } else if (params.destination === 'k07_supplier_workshop') {
        batch.destinationFa = 'تخصیص به کارگاه سازنده طلا دیدار (K07)';
      } else {
        batch.destinationFa = 'فروش شمش به خزانه نقدی و تحویل به بازار';
      }
    }

    switch (params.status) {
      case 'batching_crucible':
        batch.statusFa = 'در حال تجمیع طلای شکسته و آماده‌سازی بوته ذوب';
        break;
      case 'smelting_furnace':
        batch.statusFa = 'ذوب حرارتی در کوره ریخته‌گری بوته‌ای';
        break;
      case 'assaying_lab':
        batch.statusFa = 'ارسال قطعه نمونه به آزمایشگاه ری‌گیری رسمی (اتحادیه)';
        break;
      case 'bar_cast_completed':
        batch.statusFa = 'ریخته‌گری شمش آب‌شده و صدور کد انگ';
        if (batch.castBarBarcode === 'DID-INGOT-PENDING') {
          batch.castBarBarcode = `DID-INGOT-AU750-${batch.batchNumber.replace('MLT-', '')}`;
        }
        break;
      case 'vault_deposited':
        batch.statusFa = 'تایید انگ ری‌گیری و تحویل قطعی به خزانه مرکزی (K09)';
        break;
    }

    this.auditLogs.unshift({
      id: `aud-20-${Date.now()}`,
      timestampFa: '۱۴۰۴/۱۲/۲۸ - لحظه‌ای',
      category: 'smelting',
      actionFa: `به‌روزرسانی وضعیت بوته ذوب ${batch.batchNumber}`,
      detailsFa: `وضعیت: ${batch.statusFa}، وزن شمش حاصل: ${batch.meltedIngotWeightGrams} گرم، افت ذوب: ${batch.refiningLossGrams} گرم (${batch.refiningLossPercent}٪)`,
      operatorFa: params.operatorNameFa || batch.furnaceOperatorFa,
      batchOrItemCode: batch.batchNumber,
      integrityHash: `sha256-${Math.random().toString(36).substring(2, 15)}`
    });

    return batch;
  }

  // ثبت بازیابی گوهرسنگ جدید
  public createGemRecovery(params: {
    gemTypeFa: string;
    sourceBuybackNumber: string;
    caratWeight: number;
    cutShapeFa: string;
    colorGrade: string;
    clarityGrade: string;
    estimatedValueToman: number;
    gemologistFa?: string;
    allocatedVaultFa?: string;
  }): K20GemRecovery {
    const nextSeq = this.gemRecoveries.length + 1;
    const recoveryCode = `GEM-1404-${String(nextSeq).padStart(3, '0')}`;

    const newGem: K20GemRecovery = {
      id: `gem-${Date.now()}`,
      recoveryCode,
      gemTypeFa: params.gemTypeFa,
      sourceBuybackNumber: params.sourceBuybackNumber || 'BBK-1404-001',
      caratWeight: Number(params.caratWeight),
      cutShapeFa: params.cutShapeFa,
      colorGrade: params.colorGrade,
      clarityGrade: params.clarityGrade,
      estimatedValueToman: Number(params.estimatedValueToman),
      status: 'extracted',
      statusFa: 'پیاده‌سازی موفق از پایه طلا و ورود به مخزن سورتینگ',
      gemologistFa: params.gemologistFa || 'دکتر فرشید پاک‌طینت',
      allocatedVaultFa: params.allocatedVaultFa || 'صندوق گوهرسنگ‌های خزانه‌داری دیدار'
    };

    this.gemRecoveries.unshift(newGem);

    this.auditLogs.unshift({
      id: `aud-20-${Date.now()}`,
      timestampFa: '۱۴۰۴/۱۲/۲۸ - لحظه‌ای',
      category: 'gem_recovery',
      actionFa: `بازیابی گوهرسنگ جدید ${recoveryCode}`,
      detailsFa: `نوع: ${newGem.gemTypeFa}، وزن: ${newGem.caratWeight} قیراط، ارزش کارشناسی: ${newGem.estimatedValueToman.toLocaleString('fa-IR')} تومان`,
      operatorFa: newGem.gemologistFa,
      batchOrItemCode: recoveryCode,
      integrityHash: `sha256-${Math.random().toString(36).substring(2, 15)}`
    });

    return newGem;
  }

  // به‌روزرسانی وضعیت گوهرسنگ
  public updateGemStatus(
    id: string,
    params: {
      status: K20GemRecoveryStatus;
      allocatedVaultFa?: string;
      operatorNameFa?: string;
    }
  ): K20GemRecovery {
    const gem = this.gemRecoveries.find((g) => g.id === id || g.recoveryCode === id);
    if (!gem) {
      throw new Error(`گوهرسنگ با شناسه ${id} یافت نشد.`);
    }

    gem.status = params.status;
    if (params.allocatedVaultFa) gem.allocatedVaultFa = params.allocatedVaultFa;

    switch (params.status) {
      case 'extracted':
        gem.statusFa = 'پیاده‌سازی نگین از پایه طلا';
        break;
      case 'cleaned_graded':
        gem.statusFa = 'پاکسازی تخصصی و درجه‌بندی شناسنامه‌ای';
        break;
      case 'vault_reserved':
        gem.statusFa = 'دپو در خزانه‌داری گوهرسنگ‌های دیدار';
        break;
      case 'remounted':
        gem.statusFa = 'سوار شدن بر روی محصول نوی جدید کالکشن طلا';
        break;
    }

    this.auditLogs.unshift({
      id: `aud-20-${Date.now()}`,
      timestampFa: '۱۴۰۴/۱۲/۲۸ - لحظه‌ای',
      category: 'gem_recovery',
      actionFa: `به‌روزرسانی وضعیت گوهرسنگ ${gem.recoveryCode}`,
      detailsFa: `وضعیت جدید: ${gem.statusFa}. محل نگهداری: ${gem.allocatedVaultFa}`,
      operatorFa: params.operatorNameFa || gem.gemologistFa,
      batchOrItemCode: gem.recoveryCode,
      integrityHash: `sha256-${Math.random().toString(36).substring(2, 15)}`
    });

    return gem;
  }
}

export const k20Storage = new K20StorageEngine();
