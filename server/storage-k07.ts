/**
 * Didar Gold Platform - Kernel Domain K07 Storage & Engine
 * Supplier Partnership Lifecycle: Workshops, Consignment Agreements, Collateral & Performance KPIs
 */

import {
  SupplierPartnership,
  PartnershipAgreement,
  SupplierCollateral,
  QualityAuditRecord,
  K07Metrics,
  K07DataPayload,
  PartnershipStatus,
  SupplierGrade,
  AgreementStatus
} from '../src/types/k07.js';

class K07StorageEngine {
  private suppliers: SupplierPartnership[] = [];
  private agreements: PartnershipAgreement[] = [];
  private collaterals: SupplierCollateral[] = [];
  private audits: QualityAuditRecord[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. کارگاه‌ها و کارخانجات تأمین‌کننده طلا
    this.suppliers = [
      {
        id: 'sup-01',
        supplierCode: 'SUP-TH-01',
        nameFa: 'مجتمع صنایع طلا و جواهر زرین تهران',
        commercialBrandFa: 'زرین گلد تهران (Zarrin Gold)',
        supplierType: 'industrial_factory',
        supplierTypeFa: 'کارخانه صنعتی مکانیزه (زنجیر و النگو)',
        status: 'active',
        statusFa: 'فعال و معتبر',
        grade: 'A_PLUS',
        gradeFa: 'گرید A+ (تأمین‌کننده راهبردی تراز اول)',
        cityFa: 'تهران',
        provinceFa: 'تهران',
        addressFa: 'تهران، بازار بزرگ، خیابان پانزده خرداد، کوچه تکیه دولت، مجتمع تولیدی زرین، پلاک ۴',
        phone: '۰۲۱-۵۵۶۲۹۴۱۱',
        managerName: 'حاج محمود زرین‌قلم',
        managerNationalCodeMasked: '۰۰۴***۱۸۹۲',
        unionLicenseNo: 'اتحادیه تهران: ۱۴۰۲/۹۸۳۱',
        hallmarkCode: 'T-8820',
        tradeSystemId: 'NTSW-MFG-99410',
        totalConsignmentLimitGrams: 25000,
        currentConsignmentUtilizedGrams: 18450,
        availableConsignmentGrams: 6550,
        activeAgreementsCount: 2,
        collateralTotalEquivalentToman: 180000000000,
        collateralTotalGoldGrams: 30000,
        collateralStatus: 'valid',
        collateralStatusFa: 'معتبر و تأییدشده',
        kpi: {
          onTimeDeliveryRate: 98.4,
          qcFirstPassRate: 99.1,
          assayDiscrepancyPpm: 0.2,
          allowableMeltLossPercent: 0.2,
          averageMakingChargePerGramToman: 260000,
          overallRating: 98
        },
        specialties: ['النگو دامله ریخته‌گری', 'زنجیر کارتیر فیگارو', 'سرویس‌های تراش CNC'],
        lastAuditDateFa: '۱۴۰۴/۱۱/۲۰',
        createdAt: '2025-04-10T08:00:00Z',
        notes: 'بزرگترین شریک تولیدی دیدار در دسته النگو و زنجیر با ظرفیت ذوب ماهانه بالغ بر ۱۰۰ کیلوگرم طلا.'
      },
      {
        id: 'sup-02',
        supplierCode: 'SUP-ISF-02',
        nameFa: 'کارگاه ریخته‌گری و زرگری سنتی نقش‌جهان',
        commercialBrandFa: 'نقش‌جهان اصفهان (Naghsh Jahan)',
        supplierType: 'casting_foundry',
        supplierTypeFa: 'کارگاه تخصصی ریخته‌گری موم گمشده و اسلیمی',
        status: 'active',
        statusFa: 'فعال و معتبر',
        grade: 'A',
        gradeFa: 'گرید A (ممتاز و هنری)',
        cityFa: 'اصفهان',
        provinceFa: 'اصفهان',
        addressFa: 'اصفهان، میدان امام، کوچه مخلص، کارگاه مرکزی زرگری نقش‌جهان',
        phone: '۰۳۱-۳۲۲۱۴۵۸۰',
        managerName: 'استاد علیرضا اصفهانی‌زاده',
        managerNationalCodeMasked: '۱۲۸***۴۴۱۱',
        unionLicenseNo: 'اتحادیه اصفهان: ۱۴۰۱/۴۲۱',
        hallmarkCode: 'E-4491',
        tradeSystemId: 'NTSW-MFG-6520',
        totalConsignmentLimitGrams: 12000,
        currentConsignmentUtilizedGrams: 9350,
        availableConsignmentGrams: 2650,
        activeAgreementsCount: 1,
        collateralTotalEquivalentToman: 90000000000,
        collateralTotalGoldGrams: 15000,
        collateralStatus: 'valid',
        collateralStatusFa: 'معتبر و تأییدشده',
        kpi: {
          onTimeDeliveryRate: 94.8,
          qcFirstPassRate: 97.5,
          assayDiscrepancyPpm: 0.4,
          allowableMeltLossPercent: 0.3,
          averageMakingChargePerGramToman: 320000,
          overallRating: 95
        },
        specialties: ['نیم‌ست اسلیمی صفوی', 'مدال ریخته‌گری سیاه‌قلم', 'گوشواره آویز فانتزی'],
        lastAuditDateFa: '۱۴۰۴/۱۲/۰۵',
        createdAt: '2025-06-15T10:30:00Z',
        notes: 'تولیدکننده انحصاری مصنوعات با نقش و نگار سنتی ایرانی با تأییدیه ری‌گیری دقیق عیار ۷۵۰.'
      },
      {
        id: 'sup-03',
        supplierCode: 'SUP-YZD-03',
        nameFa: 'کارخانه النگوسازی یزد گوهر کویر',
        commercialBrandFa: 'یزد گوهر (Yazd Gohar)',
        supplierType: 'industrial_factory',
        supplierTypeFa: 'کارخانه تخصصی ساخت النگو مفتولی و ماشینی',
        status: 'active',
        statusFa: 'فعال و معتبر',
        grade: 'A',
        gradeFa: 'گرید A (ممتاز و پرتیراژ)',
        cityFa: 'یزد',
        provinceFa: 'یزد',
        addressFa: 'یزد، شهرک صنعتی طلا و جواهر، فاز ۱، خیابان زنبق، سالن تولید گوهر',
        phone: '۰۳۵-۳۶۲۸۷۷۰۰',
        managerName: 'مهندس جلال حیدری یزدی',
        managerNationalCodeMasked: '۴۴۳***۹۰۰۱',
        unionLicenseNo: 'اتحادیه یزد: ۱۴۰۳/۱۱۲',
        hallmarkCode: 'Y-190',
        tradeSystemId: 'NTSW-MFG-8819',
        totalConsignmentLimitGrams: 16000,
        currentConsignmentUtilizedGrams: 14800,
        availableConsignmentGrams: 1200,
        activeAgreementsCount: 1,
        collateralTotalEquivalentToman: 115000000000,
        collateralTotalGoldGrams: 19000,
        collateralStatus: 'valid',
        collateralStatusFa: 'معتبر و تأییدشده',
        kpi: {
          onTimeDeliveryRate: 96.2,
          qcFirstPassRate: 98.8,
          assayDiscrepancyPpm: 0.1,
          allowableMeltLossPercent: 0.18,
          averageMakingChargePerGramToman: 210000,
          overallRating: 96
        },
        specialties: ['النگو مفتولی یزدی', 'دستبند النگویی فنری', 'النگو تراش لیزری دورنگ'],
        lastAuditDateFa: '۱۴۰۴/۱۰/۱۲',
        createdAt: '2025-07-01T09:15:00Z',
        notes: 'کمترین نرخ کسر بار و ذوب (۰.۱۸٪) در شبکه با ماشین‌آلات کشش مفتول ایتالیایی.'
      },
      {
        id: 'sup-04',
        supplierCode: 'SUP-TBZ-04',
        nameFa: 'کارگاه لیزر، فیوژن و سبک‌سازان آذین تبریز',
        commercialBrandFa: 'آذین تبریز (Azin Tabriz)',
        supplierType: 'cnc_laser',
        supplierTypeFa: 'کارگاه برش لیزری، CNC و طلای مینیمال سبک',
        status: 'on_probation',
        statusFa: 'تحت پایش و نظارت مشروط',
        grade: 'B',
        gradeFa: 'گرید B (استاندارد - نیازمند بهبود تحویل)',
        cityFa: 'تبریز',
        provinceFa: 'آذربایجان شرقی',
        addressFa: 'تبریز، بازار صفی، پاساژ امیرکبیر، طبقه اول، کارگاه آذین',
        phone: '۰۴۱-۳۵۲۳۱۱۸۰',
        managerName: 'صادق صمدی آذری',
        managerNationalCodeMasked: '۱۳۷***۳۰۹۹',
        unionLicenseNo: 'اتحادیه تبریز: ۱۴۰۲/۶۶۴',
        hallmarkCode: 'TB-512',
        tradeSystemId: 'NTSW-MFG-3310',
        totalConsignmentLimitGrams: 6000,
        currentConsignmentUtilizedGrams: 5200,
        availableConsignmentGrams: 800,
        activeAgreementsCount: 1,
        collateralTotalEquivalentToman: 40000000000,
        collateralTotalGoldGrams: 7000,
        collateralStatus: 'expiring_soon',
        collateralStatusFa: 'سررسید نزدیک وثیقه (۱۵ روز)',
        kpi: {
          onTimeDeliveryRate: 88.5,
          qcFirstPassRate: 93.0,
          assayDiscrepancyPpm: 0.6,
          allowableMeltLossPercent: 0.35,
          averageMakingChargePerGramToman: 290000,
          overallRating: 84
        },
        specialties: ['پلاک میناکاری لیزری', 'آویز حروف طلا سبک', 'دستبند مهره با قطعه طلا'],
        lastAuditDateFa: '۱۴۰۴/۱۲/۱۸',
        createdAt: '2025-09-10T14:00:00Z',
        notes: 'به دلیل دو مرحله تأخیر در تحویل سفارشات پلاک و نزدیکی تاریخ سررسید چک صیادی در وضعیت مشروط قرار گرفت.'
      },
      {
        id: 'sup-05',
        supplierCode: 'SUP-MHD-05',
        nameFa: 'کارگاه گوهرنشانی و مخراجی مشهد رضوی',
        commercialBrandFa: 'گوهرنشین مشهد (Gohar Neshin)',
        supplierType: 'stone_setting',
        supplierTypeFa: 'کارگاه تخصصی مرصع‌کاری، مخراجی فیروزه و برلیان',
        status: 'under_evaluation',
        statusFa: 'در حال ارزیابی فنی و بازرسی',
        grade: 'A',
        gradeFa: 'گرید A (در شرف نهایی‌سازی)',
        cityFa: 'مشهد',
        provinceFa: 'خراسان رضوی',
        addressFa: 'مشهد، بازار رضا (ع)، راسته دوم، طبقه فوقانی، پلاک ۳۰۸',
        phone: '۰۵۱-۳۳۶۸۹۰۲۰',
        managerName: 'حاج مرتضی حسینی مشهدی',
        managerNationalCodeMasked: '۰۹۳***۷۷۶۱',
        unionLicenseNo: 'اتحادیه مشهد: ۱۴۰۴/۰۹',
        hallmarkCode: 'M-701',
        tradeSystemId: 'NTSW-MFG-1104',
        totalConsignmentLimitGrams: 8000,
        currentConsignmentUtilizedGrams: 0,
        availableConsignmentGrams: 8000,
        activeAgreementsCount: 0,
        collateralTotalEquivalentToman: 60000000000,
        collateralTotalGoldGrams: 10000,
        collateralStatus: 'under_review',
        collateralStatusFa: 'در حال استعلام بانکی و ثبتی',
        kpi: {
          onTimeDeliveryRate: 95.0,
          qcFirstPassRate: 98.0,
          assayDiscrepancyPpm: 0.3,
          allowableMeltLossPercent: 0.25,
          averageMakingChargePerGramToman: 450000,
          overallRating: 93
        },
        specialties: ['انگشتر جواهری فیروزه نیشابور', 'مدال برلیان پاک', 'دستبند تنیس مخراجی'],
        lastAuditDateFa: '۱۴۰۵/۰۱/۰۵',
        createdAt: '2026-01-15T11:00:00Z',
        notes: 'پرونده پذیرش کارگاه مرصع‌کاری با تضامین ملکی در دست بررسی نهایی کمیسیون اعتباری دیدار است.'
      }
    ];

    // 2. قراردادهای فعال همکاری و امانی (Partnership Agreements)
    this.agreements = [
      {
        id: 'agr-01',
        agreementNumber: 'AGR-2026-SUP01-01',
        supplierId: 'sup-01',
        supplierNameFa: 'مجتمع صنایع طلا و جواهر زرین تهران',
        agreementType: 'consignment_hypothecation',
        agreementTypeFa: 'قرارداد امانی و ترهین طلای خام و شمش عیار ۷۵۰',
        titleFa: 'قرارداد تأمین و ساخت مستمر النگو و زنجیر ماشینی پرتیراژ',
        status: 'active',
        statusFa: 'جاری و فعال',
        startDateFa: '۱۴۰۴/۰۱/۰۱',
        endDateFa: '۱۴۰۵/۰۱/۰۱',
        renewalTermsFa: 'تمدید خودکار سالانه در صورت حفظ امتیاز کیفی بالای ۹۰',
        consignmentLimitGrams: 25000,
        maxDeliveryLeadDays: 7,
        allowableKasriPercent: 0.2,
        makingChargeFormulaFa: 'اجرت پایه ۲۴۰,۰۰۰ تومان/گرم + ۱۰٪ بابت مدل‌های تراش دورنگ لیزری',
        settlementWindowDays: 10,
        signedBySupplierName: 'محمود زرین‌قلم (مدیرعامل)',
        signedByPlatformManager: 'دکتر علیرضا سفیدپور (معاونت زنجیره تأمین دیدار)',
        termsAndConditionsFa: [
          'طلای تحویلی تماماً شمش ری‌گیری‌شده با خلوص ۹۹۵ یا عیار ۷۵۰ پلاک دیدار خواهد بود.',
          'تحویل مصنوع ساخته‌شده باید در بسته‌بندی پلمپ با برچسب RFID صورت پذیرد.',
          'مغایرت عیار بیش از ۰.۵ در هزار موجب جریمه و کسر از سقف طلای امانی می‌گردد.'
        ]
      },
      {
        id: 'agr-02',
        agreementNumber: 'AGR-2026-SUP02-01',
        supplierId: 'sup-02',
        supplierNameFa: 'کارگاه ریخته‌گری و زرگری سنتی نقش‌جهان',
        agreementType: 'contract_manufacturing',
        agreementTypeFa: 'قرارداد پیمانکاری ساخت سفارشی طرح‌های اسلیمی صفوی',
        titleFa: 'تولید نیم‌ست و النگو ریخته‌گری با قالب‌های انحصاری دیدار',
        status: 'active',
        statusFa: 'جاری و فعال',
        startDateFa: '۱۴۰۴/۰۴/۱۵',
        endDateFa: '۱۴۰۵/۰۴/۱۵',
        renewalTermsFa: 'تمدید منوط به تسویه طلایی دوره‌ای و ممیزی عیارسنجی',
        consignmentLimitGrams: 12000,
        maxDeliveryLeadDays: 12,
        allowableKasriPercent: 0.3,
        makingChargeFormulaFa: 'اجرت مقطوع ۳۲۰,۰۰۰ تومان به ازای هر گرم طلای ۱۸ عیار تحویلی',
        settlementWindowDays: 14,
        signedBySupplierName: 'استاد علیرضا اصفهانی‌زاده',
        signedByPlatformManager: 'مهندس کاظمی (مدیر ارشد تولید دیدار)',
        termsAndConditionsFa: [
          'قالب‌های سیلیکونی و مومی طراحی‌شده توسط دیدار امانت اختصاصی است و ساخت برای شخص ثالث ممنوع است.',
          'آزمایشگاه ری‌گیری رسمی مورد تأیید ری‌گیری زرفام تهران یا آریا اصفهان می‌باشد.'
        ]
      },
      {
        id: 'agr-03',
        agreementNumber: 'AGR-2026-SUP03-01',
        supplierId: 'sup-03',
        supplierNameFa: 'کارخانه النگوسازی یزد گوهر کویر',
        agreementType: 'gold_swap_barter',
        agreementTypeFa: 'قرارداد تهاتر وزنی شمش آبشده در برابر النگو مفتولی',
        titleFa: 'تهاتر طلای خام با النگو مفتولی بدون جابه‌جایی نقدینگی ریالی',
        status: 'active',
        statusFa: 'جاری و فعال',
        startDateFa: '۱۴۰۴/۰۵/۰۱',
        endDateFa: '۱۴۰۵/۰۵/۰۱',
        renewalTermsFa: 'تمدید بر اساس موازنه ترازو و کارمزد تسویه‌شده',
        consignmentLimitGrams: 16000,
        maxDeliveryLeadDays: 6,
        allowableKasriPercent: 0.18,
        makingChargeFormulaFa: 'اجرت ۲۱۰,۰۰۰ تومان/گرم که نقداً یا با طلای معادل آبشده تسویه می‌شود',
        settlementWindowDays: 7,
        signedBySupplierName: 'جلال حیدری یزدی',
        signedByPlatformManager: 'دکتر علیرضا سفیدپور',
        termsAndConditionsFa: [
          'تطابق دقیق عیار ۷۵۰ با کسر بار مصوب اتحادیه یزد تضمین می‌گردد.',
          'هر محموله قبل از ورود به انبار ملزم به پاس کردن آزمون کوپلاسیون است.'
        ]
      },
      {
        id: 'agr-04',
        agreementNumber: 'AGR-2026-SUP04-01',
        supplierId: 'sup-04',
        supplierNameFa: 'کارگاه لیزر، فیوژن و سبک‌سازان آذین تبریز',
        agreementType: 'consignment_hypothecation',
        agreementTypeFa: 'قرارداد امانی طلای ظریف لیزری و پلاک‌های سبک',
        titleFa: 'تأمین پلاک‌های لیزری زیر ۲ گرم و زنجیر فیوژن',
        status: 'expiring_soon',
        statusFa: 'سررسید نزدیک (تمدید مشروط)',
        startDateFa: '۱۴۰۳/۱۱/۰۱',
        endDateFa: '۱۴۰۴/۱۱/۰۱',
        renewalTermsFa: 'تمدید منوط به نوسازی چک صیادی و ارتقای تحویل به‌موقع بالای ۹۵٪',
        consignmentLimitGrams: 6000,
        maxDeliveryLeadDays: 5,
        allowableKasriPercent: 0.35,
        makingChargeFormulaFa: 'اجرت ۲۹۰,۰۰۰ تومان/گرم',
        settlementWindowDays: 5,
        signedBySupplierName: 'صادق صمدی آذری',
        signedByPlatformManager: 'مهندس کاظمی',
        termsAndConditionsFa: [
          'حداکثر انحراف وزن از طراحی اسمی نباید از ۰.۰۵ گرم فراتر رود.'
        ]
      }
    ];

    // 3. وثایق و تضامین زرگری (Collateral & Financial Guarantees)
    this.collaterals = [
      {
        id: 'col-01',
        collateralCode: 'COL-ESC-2026-001',
        supplierId: 'sup-01',
        supplierNameFa: 'مجتمع صنایع طلا و جواهر زرین تهران',
        collateralType: 'bullion_escrow',
        collateralTypeFa: 'سپرده شمش طلای ۹۹۵ در خزانه امن دیدار',
        titleFa: 'سپرده ۱۵ قطعه شمش طلای ۱ کیلوگرمی استاندارد اماراتی',
        status: 'valid',
        statusFa: 'معتبر و در خزانه',
        nominalValueToman: 90000000000,
        equivalentGoldGrams: 15000,
        issueDateFa: '۱۴۰۴/۰۱/۱۰',
        expiryDateFa: '۱۴۰۶/۰۱/۱۰',
        issuingBankOrNotaryFa: 'خزانه مرکزی دیدار گلد (حفاظت فیزیکی گرید ۵)',
        trackingReferenceNumber: 'VAULT-ESC-7719-TH',
        verificationStatus: 'verified',
        verificationStatusFa: 'تأییدشده و شمارش فیزیکی',
        verifiedBy: 'امور خزانه‌داری دیدار',
        notes: 'شمش‌ها با پلمپ معتبر و گواهی ری‌گیری در گاوصندوق امنیتی دیدار نگهداری می‌شوند.'
      },
      {
        id: 'col-02',
        collateralCode: 'COL-SYD-2026-002',
        supplierId: 'sup-01',
        supplierNameFa: 'مجتمع صنایع طلا و جواهر زرین تهران',
        collateralType: 'sayad_cheque',
        collateralTypeFa: 'چک صیادی بنفش ضمانت تعهدات کارگاهی',
        titleFa: 'چک صیادی ضمانت حسن انجام تعهد ساخت و تحویل طلا',
        status: 'valid',
        statusFa: 'استعلام صیادی سفید و ثبت‌شده',
        nominalValueToman: 90000000000,
        equivalentGoldGrams: 15000,
        issueDateFa: '۱۴۰۴/۰۱/۱۲',
        expiryDateFa: '۱۴۰۵/۰۱/۱۲',
        issuingBankOrNotaryFa: 'بانک ملت، شعبه بازار تهران (کد ۶۳۴۰۱)',
        trackingReferenceNumber: 'SAYAD-991024-8841-33',
        verificationStatus: 'verified',
        verificationStatusFa: 'استعلام بانک مرکزی تأیید شد',
        verifiedBy: 'واحد حقوقی و اعتبارات',
        notes: 'در سامانه صیاد بانک مرکزی به نفع شرکت طلای دیدار رسماً به ثبت رسیده است.'
      },
      {
        id: 'col-03',
        collateralCode: 'COL-BG-2026-003',
        supplierId: 'sup-02',
        supplierNameFa: 'کارگاه ریخته‌گری و زرگری سنتی نقش‌جهان',
        collateralType: 'bank_guarantee',
        collateralTypeFa: 'ضمانت‌نامه بانکی تعهد پرداخت (LC داخلی)',
        titleFa: 'ضمانت‌نامه بانکی بدون قید و شرط به نفع شرکت دیدار گلد',
        status: 'valid',
        statusFa: 'معتبر و غیرقابل ابطال',
        nominalValueToman: 90000000000,
        equivalentGoldGrams: 15000,
        issueDateFa: '۱۴۰۴/۰۴/۱۰',
        expiryDateFa: '۱۴۰۵/۰۴/۱۰',
        issuingBankOrNotaryFa: 'بانک صادرات ایران، سرپرستی استان اصفهان',
        trackingReferenceNumber: 'BG-ISF-4412-2025',
        verificationStatus: 'verified',
        verificationStatusFa: 'تأییدیه کتبی بانک دریافت شد',
        verifiedBy: 'مدیریت مالی دیدار',
        notes: 'ضمانت‌نامه به محض اولین درخواست کتبی پلتفرم قابل ضبط و وصول نقدی است.'
      },
      {
        id: 'col-04',
        collateralCode: 'COL-SYD-2026-004',
        supplierId: 'sup-03',
        supplierNameFa: 'کارخانه النگوسازی یزد گوهر کویر',
        collateralType: 'property_mortgage',
        collateralTypeFa: 'ترهین رسمی سند عرصه و اعیان کارگاه صنعتی',
        titleFa: 'رهن رسمی پلاک ثبتی ۶۳۱ بخش ۴ یزد در دفتر اسناد رسمی',
        status: 'valid',
        statusFa: 'سند تک‌برگ در رهن دیدار',
        nominalValueToman: 115000000000,
        equivalentGoldGrams: 19000,
        issueDateFa: '۱۴۰۴/۰۵/۰۵',
        expiryDateFa: '۱۴۰۷/۰۵/۰۵',
        issuingBankOrNotaryFa: 'دفتر اسناد رسمی شماره ۱۸ یزد',
        trackingReferenceNumber: 'NOTARY-YZD-18-DOC990',
        verificationStatus: 'verified',
        verificationStatusFa: 'استعلام ثبتی اداره ثبت اسناد یزد',
        verifiedBy: 'وکیل پایه یک دیدار',
        notes: 'ملک کارگاه صنعتی به مساحت ۱۲۰۰ متر مربع دارای ارزیابی کارشناس رسمی دادگستری.'
      },
      {
        id: 'col-05',
        collateralCode: 'COL-SYD-2026-005',
        supplierId: 'sup-04',
        supplierNameFa: 'کارگاه لیزر، فیوژن و سبک‌سازان آذین تبریز',
        collateralType: 'sayad_cheque',
        collateralTypeFa: 'چک صیادی بنفش تضمین ساخت',
        titleFa: 'چک صیادی به مبلغ ۴۰ میلیارد تومان به عهده بانک تجارت',
        status: 'expiring_soon',
        statusFa: 'سررسید در ۱۵ روز آینده',
        nominalValueToman: 40000000000,
        equivalentGoldGrams: 7000,
        issueDateFa: '۱۴۰۳/۱۱/۰۵',
        expiryDateFa: '۱۴۰۴/۱۱/۰۵',
        issuingBankOrNotaryFa: 'بانک تجارت، شعبه بازار تبریز',
        trackingReferenceNumber: 'SAYAD-4410-TBZ-119',
        verificationStatus: 'verified',
        verificationStatusFa: 'نیازمند چک جایگزین جدید',
        verifiedBy: 'واحد پیگیری وصول دیدار',
        notes: 'اخطار تعویض و تمدید چک صیادی به مدیر کارگاه ابلاغ گردید.'
      }
    ];

    // 4. ممیزی‌های کیفی و ارزیابی عملکرد (Quality Audits)
    this.audits = [
      {
        id: 'aud-01',
        supplierId: 'sup-01',
        supplierNameFa: 'مجتمع صنایع طلا و جواهر زرین تهران',
        auditDateFa: '۱۴۰۴/۱۱/۲۰',
        auditorName: 'مهندس کوروش رادمنش (سرارزیاب کیفی طلا)',
        score: 98,
        status: 'passed',
        statusFa: 'قبولی کامل با رتبه ممتاز',
        findingsFa: 'خطوط کشش و ریخته‌گری کاملاً کالیبره، آزمون تخلخل صفر درصد، عیارسنجی ری‌گیری ۷۵۰.۴ با انطباق صددرصد.',
        recommendationsFa: 'افزایش سهمیه طلای امانی به ۳۰ کیلوگرم با توجه به ظرفیت بالای ماشین‌آلات جدید پیشنهاد می‌شود.',
        nextAuditDateFa: '۱۴۰۵/۰۵/۲۰'
      },
      {
        id: 'aud-02',
        supplierId: 'sup-02',
        supplierNameFa: 'کارگاه ریخته‌گری و زرگری سنتی نقش‌جهان',
        auditDateFa: '۱۴۰۴/۱۲/۰۵',
        auditorName: 'مهندس سمیرا باقری (ممیز استاندارد ریخته‌گری)',
        score: 95,
        status: 'passed',
        statusFa: 'قبولی در آزمون استاندارد',
        findingsFa: 'جزئیات اسلیمی بسیار شفاف و بدون پلیسه، کیفیت پرداخت آینه‌ای عالی، کسر بار ۰.۲۸٪ در محدوده مجاز.',
        recommendationsFa: 'نصب یک سیستم غبارگیر پیشرفته در اتاق پرداخت توصیه گردید.',
        nextAuditDateFa: '۱۴۰۵/۰۶/۰۵'
      },
      {
        id: 'aud-03',
        supplierId: 'sup-04',
        supplierNameFa: 'کارگاه لیزر، فیوژن و سبک‌سازان آذین تبریز',
        auditDateFa: '۱۴۰۴/۱۲/۱۸',
        auditorName: 'مهندس رادمنش',
        score: 84,
        status: 'passed_with_condition',
        statusFa: 'قبولی مشروط به ارتقای برنامه‌ریزی',
        findingsFa: 'کیفیت برش لیزر خوب است ولی در ۲ مورد تحویل سفارشات با ۵ روز تأخیر انجام شده و ترازوی کارگاه نیاز به کالیبراسیون دوره‌ای دارد.',
        recommendationsFa: 'کالیبراسیون فوری ترازوی دیجیتال با وزنه استاندارد کلاس F1 و تمدید وثایق چک صیادی ظرف ۱۰ روز کاری.',
        nextAuditDateFa: '۱۴۰۵/۰۱/۲۰'
      }
    ];
  }

  public getDataPayload(): K07DataPayload {
    return {
      suppliers: this.suppliers,
      agreements: this.agreements,
      collaterals: this.collaterals,
      audits: this.audits,
      metrics: this.calculateMetrics()
    };
  }

  public getAllData(): K07DataPayload {
    return this.getDataPayload();
  }

  public updateConsignmentBalance(supplierId: string, deltaGrams: number): void {
    const sup = this.getSupplierById(supplierId);
    if (sup) {
      sup.currentConsignmentUtilizedGrams = Math.max(0, sup.currentConsignmentUtilizedGrams + deltaGrams);
      sup.availableConsignmentGrams = Math.max(0, sup.totalConsignmentLimitGrams - sup.currentConsignmentUtilizedGrams);
    }
  }

  public getSupplierById(id: string): SupplierPartnership | undefined {
    return this.suppliers.find((s) => s.id === id || s.supplierCode === id);
  }

  public createSupplier(
    payload: Partial<SupplierPartnership>,
    actorName: string
  ): SupplierPartnership {
    const nextNum = this.suppliers.length + 1;
    const supplierCode = payload.supplierCode || `SUP-NEW-${String(nextNum).padStart(2, '0')}`;
    const id = `sup-${Date.now().toString().slice(-4)}`;

    const newSupplier: SupplierPartnership = {
      id,
      supplierCode,
      nameFa: payload.nameFa || 'کارگاه جدید طلاسازی',
      commercialBrandFa: payload.commercialBrandFa || payload.nameFa || 'برند طلای همکار',
      supplierType: payload.supplierType || 'artisan_workshop',
      supplierTypeFa: payload.supplierTypeFa || 'کارگاه صنایع‌دستی و زرگری سنتی',
      status: 'under_evaluation',
      statusFa: 'در حال ارزیابی اولیه',
      grade: 'B',
      gradeFa: 'گرید B (استاندارد)',
      cityFa: payload.cityFa || 'تهران',
      provinceFa: payload.provinceFa || 'تهران',
      addressFa: payload.addressFa || '',
      phone: payload.phone || '',
      managerName: payload.managerName || '',
      managerNationalCodeMasked: payload.managerNationalCodeMasked || '***',
      unionLicenseNo: payload.unionLicenseNo || '',
      hallmarkCode: payload.hallmarkCode || 'T-NEW',
      tradeSystemId: payload.tradeSystemId || '',
      totalConsignmentLimitGrams: Number(payload.totalConsignmentLimitGrams) || 5000,
      currentConsignmentUtilizedGrams: 0,
      availableConsignmentGrams: Number(payload.totalConsignmentLimitGrams) || 5000,
      activeAgreementsCount: 0,
      collateralTotalEquivalentToman: Number(payload.collateralTotalEquivalentToman) || 30000000000,
      collateralTotalGoldGrams: Number(payload.collateralTotalGoldGrams) || 5000,
      collateralStatus: 'under_review',
      collateralStatusFa: 'در حال بررسی مدارک',
      kpi: {
        onTimeDeliveryRate: 95.0,
        qcFirstPassRate: 97.0,
        assayDiscrepancyPpm: 0.3,
        allowableMeltLossPercent: 0.25,
        averageMakingChargePerGramToman: 250000,
        overallRating: 90
      },
      specialties: payload.specialties || ['ساخت سفارشی'],
      lastAuditDateFa: 'ثبت جدید',
      createdAt: new Date().toISOString(),
      notes: payload.notes || `توسط ${actorName} در سیستم ثبت گردید.`
    };

    this.suppliers.unshift(newSupplier);
    return newSupplier;
  }

  public updateSupplier(
    id: string,
    payload: Partial<SupplierPartnership>,
    actorName: string
  ): SupplierPartnership {
    const idx = this.suppliers.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`کارگاه با شناسه ${id} یافت نشد.`);

    const existing = this.suppliers[idx];
    const updated: SupplierPartnership = {
      ...existing,
      ...payload,
      notes: payload.notes || `${existing.notes || ''}\nبه‌روزرسانی توسط ${actorName} در ${new Date().toLocaleDateString('fa-IR')}`
    };

    // Update available consignment calculation
    if (payload.totalConsignmentLimitGrams !== undefined) {
      updated.totalConsignmentLimitGrams = Number(payload.totalConsignmentLimitGrams);
      updated.availableConsignmentGrams = Math.max(
        0,
        updated.totalConsignmentLimitGrams - updated.currentConsignmentUtilizedGrams
      );
    }

    this.suppliers[idx] = updated;
    return updated;
  }

  public changeSupplierStatus(
    id: string,
    newStatus: PartnershipStatus,
    reason: string,
    actorName: string
  ): SupplierPartnership {
    const supplier = this.getSupplierById(id);
    if (!supplier) throw new Error(`کارگاه با شناسه ${id} یافت نشد.`);

    const statusMap: Record<PartnershipStatus, string> = {
      draft: 'پیش‌نویس اولیه',
      under_evaluation: 'در حال ارزیابی فنی',
      active: 'فعال و معتبر',
      on_probation: 'تحت پایش و نظارت مشروط',
      suspended: 'معلق‌شده موقت',
      terminated: 'خاتمه‌یافته / فسخ'
    };

    supplier.status = newStatus;
    supplier.statusFa = statusMap[newStatus];
    supplier.notes = `${supplier.notes || ''}\n[تغییر وضعیت به «${supplier.statusFa}» توسط ${actorName}: ${reason}]`;

    return supplier;
  }

  public adjustConsignmentLimit(
    id: string,
    newLimitGrams: number,
    actorName: string
  ): SupplierPartnership {
    const supplier = this.getSupplierById(id);
    if (!supplier) throw new Error(`کارگاه با شناسه ${id} یافت نشد.`);

    supplier.totalConsignmentLimitGrams = newLimitGrams;
    supplier.availableConsignmentGrams = Math.max(
      0,
      newLimitGrams - supplier.currentConsignmentUtilizedGrams
    );
    supplier.notes = `${supplier.notes || ''}\n[سقف طلای امانی به ${newLimitGrams} گرم توسط ${actorName} تنظیم شد.]`;

    return supplier;
  }

  public createAgreement(
    payload: Partial<PartnershipAgreement>,
    actorName: string
  ): PartnershipAgreement {
    const nextNum = this.agreements.length + 1;
    const agreementNumber =
      payload.agreementNumber ||
      `AGR-2026-${payload.supplierId ? payload.supplierId.toUpperCase() : 'SUP'}-${String(nextNum).padStart(2, '0')}`;
    const id = `agr-${Date.now().toString().slice(-4)}`;

    const typeMap: Record<string, string> = {
      consignment_hypothecation: 'قرارداد امانی و ترهین طلای خام',
      contract_manufacturing: 'قرارداد پیمانکاری ساخت سفارشی',
      outright_purchase: 'خرید قطعی بنکداری',
      gold_swap_barter: 'تهاتر وزنی شمش با مصنوعات'
    };

    const newAgreement: PartnershipAgreement = {
      id,
      agreementNumber,
      supplierId: payload.supplierId || '',
      supplierNameFa: payload.supplierNameFa || 'کارگاه تأمین‌کننده طلا',
      agreementType: payload.agreementType || 'consignment_hypothecation',
      agreementTypeFa: typeMap[payload.agreementType || 'consignment_hypothecation'] || 'قرارداد امانی',
      titleFa: payload.titleFa || 'قرارداد همکاری ساخت و تأمین طلا',
      status: 'active',
      statusFa: 'جاری و فعال',
      startDateFa: payload.startDateFa || '۱۴۰۵/۰۱/۰۱',
      endDateFa: payload.endDateFa || '۱۴۰۶/۰۱/۰۱',
      renewalTermsFa: payload.renewalTermsFa || 'تمدید سالانه منوط به رضایت طرفین',
      consignmentLimitGrams: Number(payload.consignmentLimitGrams) || 5000,
      maxDeliveryLeadDays: Number(payload.maxDeliveryLeadDays) || 7,
      allowableKasriPercent: Number(payload.allowableKasriPercent) || 0.25,
      makingChargeFormulaFa: payload.makingChargeFormulaFa || 'اجرت توافقی به ازای هر گرم',
      settlementWindowDays: Number(payload.settlementWindowDays) || 10,
      signedBySupplierName: payload.signedBySupplierName || 'مدیرعامل کارگاه',
      signedByPlatformManager: actorName || 'مدیریت پلتفرم دیدار',
      termsAndConditionsFa: payload.termsAndConditionsFa || [
        'رعایت عیار رسمی استاندارد ۷۵۰ الزامی است.',
        'تحویل محموله با بارنامه امنیتی و پلمپ دیدار انجام می‌گیرد.'
      ]
    };

    this.agreements.unshift(newAgreement);

    // Update active agreements count on supplier
    const sup = this.getSupplierById(newAgreement.supplierId);
    if (sup) {
      sup.activeAgreementsCount = this.agreements.filter(
        (a) => a.supplierId === sup.id && (a.status === 'active' || a.status === 'expiring_soon')
      ).length;
    }

    return newAgreement;
  }

  public updateAgreementStatus(
    id: string,
    newStatus: AgreementStatus,
    actorName: string
  ): PartnershipAgreement {
    const ag = this.agreements.find((a) => a.id === id);
    if (!ag) throw new Error(`قرارداد با شناسه ${id} یافت نشد.`);

    const statusMap: Record<AgreementStatus, string> = {
      draft: 'پیش‌نویس',
      active: 'جاری و فعال',
      expiring_soon: 'سررسید نزدیک',
      renewed: 'تمدیدشده',
      expired: 'منقضی‌شده',
      terminated: 'فسخ‌شده'
    };

    ag.status = newStatus;
    ag.statusFa = statusMap[newStatus];

    return ag;
  }

  public registerCollateral(
    payload: Partial<SupplierCollateral>,
    actorName: string
  ): SupplierCollateral {
    const nextNum = this.collaterals.length + 1;
    const collateralCode = payload.collateralCode || `COL-REG-2026-${String(nextNum).padStart(3, '0')}`;
    const id = `col-${Date.now().toString().slice(-4)}`;

    const typeMap: Record<string, string> = {
      bullion_escrow: 'سپرده شمش طلای ۹۹۵ در خزانه دیدار',
      sayad_cheque: 'چک صیادی بنفش ثبتی',
      bank_guarantee: 'ضمانت‌نامه بانکی تعهد پرداخت',
      property_mortgage: 'ترهین سند ملکی رسمی',
      peer_cosigner: 'ضمانت معتبر بازاریان صنف طلا'
    };

    const newCollateral: SupplierCollateral = {
      id,
      collateralCode,
      supplierId: payload.supplierId || '',
      supplierNameFa: payload.supplierNameFa || 'کارگاه طلاسازی',
      collateralType: payload.collateralType || 'sayad_cheque',
      collateralTypeFa: typeMap[payload.collateralType || 'sayad_cheque'] || 'تضمین بانکی',
      titleFa: payload.titleFa || 'وثیقه حسن انجام تعهدات ساخت طلا',
      status: 'valid',
      statusFa: 'ثبت و در حال بررسی اولیه',
      nominalValueToman: Number(payload.nominalValueToman) || 50000000000,
      equivalentGoldGrams: Number(payload.equivalentGoldGrams) || 8000,
      issueDateFa: payload.issueDateFa || '۱۴۰۵/۰۱/۰۱',
      expiryDateFa: payload.expiryDateFa || '۱۴۰۶/۰۱/۰۱',
      issuingBankOrNotaryFa: payload.issuingBankOrNotaryFa || 'بانک ملت شعبه بازار',
      trackingReferenceNumber: payload.trackingReferenceNumber || `REF-${Date.now().toString().slice(-6)}`,
      verificationStatus: 'pending_inquiry',
      verificationStatusFa: 'در حال استعلام بانکی / ثبتی',
      verifiedBy: actorName,
      notes: payload.notes || 'توسط کارشناس حقوقی در سیستم ثبت گردید.'
    };

    this.collaterals.unshift(newCollateral);

    // Update supplier collateral metrics
    const sup = this.getSupplierById(newCollateral.supplierId);
    if (sup) {
      sup.collateralTotalEquivalentToman += newCollateral.nominalValueToman;
      sup.collateralTotalGoldGrams += newCollateral.equivalentGoldGrams;
    }

    return newCollateral;
  }

  public verifyCollateral(
    id: string,
    verificationStatus: 'verified' | 'pending_inquiry' | 'rejected',
    notes: string,
    actorName: string
  ): SupplierCollateral {
    const col = this.collaterals.find((c) => c.id === id);
    if (!col) throw new Error(`وثیقه با شناسه ${id} یافت نشد.`);

    col.verificationStatus = verificationStatus;
    col.verificationStatusFa =
      verificationStatus === 'verified'
        ? 'تأییدشده و قطعی'
        : verificationStatus === 'rejected'
        ? 'رد صلاحیت شده'
        : 'در حال استعلام';

    col.verifiedBy = actorName;
    if (notes) col.notes = `${col.notes || ''}\n[استعلام توسط ${actorName}: ${notes}]`;

    return col;
  }

  public recordQualityAudit(
    payload: Partial<QualityAuditRecord>,
    actorName: string
  ): QualityAuditRecord {
    const id = `aud-${Date.now().toString().slice(-4)}`;
    const score = Number(payload.score) || 90;
    const status = score >= 90 ? 'passed' : score >= 80 ? 'passed_with_condition' : 'failed';
    const statusFa =
      status === 'passed'
        ? 'قبولی کامل استاندارد'
        : status === 'passed_with_condition'
        ? 'قبولی مشروط به بهبود'
        : 'عدم انطباق کیفی و رد';

    const newAudit: QualityAuditRecord = {
      id,
      supplierId: payload.supplierId || '',
      supplierNameFa: payload.supplierNameFa || 'کارگاه طلاسازی',
      auditDateFa: payload.auditDateFa || '۱۴۰۵/۰۱/۲۰',
      auditorName: actorName || 'کارشناس ممیزی و استاندارد دیدار',
      score,
      status,
      statusFa,
      findingsFa: payload.findingsFa || 'کنترل کیفی عیار و پرداخت فیزیکی انجام شد.',
      recommendationsFa: payload.recommendationsFa || 'ادامه همکاری در چارچوب مفاد قرارداد جاری.',
      nextAuditDateFa: payload.nextAuditDateFa || '۱۴۰۵/۰۷/۲۰'
    };

    this.audits.unshift(newAudit);

    // Update supplier rating and last audit date
    const sup = this.getSupplierById(newAudit.supplierId);
    if (sup) {
      sup.lastAuditDateFa = newAudit.auditDateFa;
      sup.kpi.overallRating = score;
      if (score >= 95) {
        sup.grade = 'A_PLUS';
        sup.gradeFa = 'گرید A+ (تأمین‌کننده ممتاز تراز اول)';
      } else if (score >= 90) {
        sup.grade = 'A';
        sup.gradeFa = 'گرید A (باکیفیت)';
      } else if (score >= 80) {
        sup.grade = 'B';
        sup.gradeFa = 'گرید B (استاندارد)';
      } else {
        sup.grade = 'C';
        sup.gradeFa = 'گرید C (مشروط)';
      }
    }

    return newAudit;
  }

  private calculateMetrics(): K07Metrics {
    const totalSuppliersCount = this.suppliers.length;
    const activeSuppliersCount = this.suppliers.filter((s) => s.status === 'active').length;
    const underEvaluationCount = this.suppliers.filter((s) => s.status === 'under_evaluation').length;
    const onProbationOrSuspendedCount = this.suppliers.filter(
      (s) => s.status === 'on_probation' || s.status === 'suspended'
    ).length;

    const totalConsignmentQuotaGrams = this.suppliers.reduce(
      (acc, s) => acc + s.totalConsignmentLimitGrams,
      0
    );
    const totalUtilizedConsignmentGrams = this.suppliers.reduce(
      (acc, s) => acc + s.currentConsignmentUtilizedGrams,
      0
    );
    const totalCollateralGoldEquivalentGrams = this.collaterals.reduce(
      (acc, c) => acc + c.equivalentGoldGrams,
      0
    );

    const averageQcPassRate =
      totalSuppliersCount > 0
        ? Number(
            (
              this.suppliers.reduce((acc, s) => acc + s.kpi.qcFirstPassRate, 0) /
              totalSuppliersCount
            ).toFixed(1)
          )
        : 0;

    const averageOnTimeDelivery =
      totalSuppliersCount > 0
        ? Number(
            (
              this.suppliers.reduce((acc, s) => acc + s.kpi.onTimeDeliveryRate, 0) /
              totalSuppliersCount
            ).toFixed(1)
          )
        : 0;

    return {
      totalSuppliersCount,
      activeSuppliersCount,
      underEvaluationCount,
      onProbationOrSuspendedCount,
      totalConsignmentQuotaGrams,
      totalUtilizedConsignmentGrams,
      totalCollateralGoldEquivalentGrams,
      averageQcPassRate,
      averageOnTimeDelivery
    };
  }
}

export const k07Storage = new K07StorageEngine();
