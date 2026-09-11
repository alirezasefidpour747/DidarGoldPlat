/**
 * Didar Gold Platform - Kernel Domain K06 Storage & Engine
 * Unique Item Passports, Metallurgical Assay, QC Evidence & Immutable Provenance Chain
 */

import {
  UniqueItemPassport,
  ProvenanceEvent,
  K06Metrics,
  K06DataPayload,
  ItemPassportStatus,
  HolderType
} from '../src/types/k06.js';

class K06StorageEngine {
  private passports: UniqueItemPassport[] = [];
  private events: ProvenanceEvent[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. گذرنامه‌های دیجیتال قطعات فیزیکی طلا (Unique Item Passports)
    this.passports = [
      {
        id: 'pass-01',
        uid: 'DID-AU750-2026-8820-001',
        serialNumber: 'SN-8820-26-001',
        nfcTagUid: '04:A2:8B:5F:91:20:80',
        qrCodeData: 'https://verify.didargold.com/p/DID-AU750-2026-8820-001',
        productSkuId: 'prd-01',
        productSkuCode: 'DID-BNG-8820',
        productTitleFa: 'النگو طلا ۱۸ عیار ریخته‌گری طرح اسلیمی صفوی (آینه‌ای)',
        variantId: 'var-01-2',
        sizeLabelFa: 'سایز ۲ (قطر داخلی ۵۶ میلی‌متر)',
        colorFa: 'طلایی زرد کلاسیک (Yellow Gold)',
        carat: '18k_750',
        caratFa: '۱۸ عیار (۷۵۰)',
        nominalWeightGrams: 12.0,
        actualScaleWeightGrams: 11.985,
        weightDeltaGrams: -0.015,
        scaleModel: 'ترازوی دیجیتال تحلیلی AND FX-300i (دقت ۰.۰۰۱ گرم)',
        scaleCalibrationDateFa: '۱۴۰۴/۱۲/۱۵ (آزمون‌سازان دانا)',
        assayLabName: 'آزمایشگاه ری‌گیری رسمی زرفام تهران',
        assayUnionPermitNo: 'پروانه اتحادیه: 1402-984',
        assayPacketCode: 'پاکت ری‌گیری: ZRF-44910',
        hallmarkCode: 'T750-ZRF94',
        certifiedFineness: 750.4,
        assayMethod: 'both',
        assayMethodFa: 'کوپلاسیون رسمی (Fire Assay) و طیف‌سنجی XRF',
        assayCertifiedDateFa: '۱۴۰۵/۰۱/۱۸',
        inspectorName: 'مهندس محمدرضا توکلی (ری‌گیر ارشد)',
        laserEngravingText: 'DIDAR 750 T-94 SN-8820-001',
        laserPositionFa: 'جداره داخلی لنگه با عمق ۴۰ میکرون و پرتو لیزر فایبر',
        hasDidarSecurityMicroPattern: true,
        status: 'sold_active',
        statusFa: 'فروخته‌شده و در مالکیت مشتری',
        currentHolderType: 'consumer',
        currentHolderName: 'خانم سارا فرهمند',
        currentHolderId: 'usr-cst-091',
        locationCityFa: 'تهران',
        qcPassed: true,
        qcInspectorName: 'مهندس رامین فراهانی',
        qcScore: 99.4,
        surfaceFinishGradeFa: 'سوپرپولیش آینه‌ای بدون پلیسه (Mirror A+)',
        porosityCheckFa: 'فاقد هرگونه حباب یا تخلخل ریخته‌گری (Zero Defect)',
        macroPhotos: [
          {
            id: 'mac-01',
            titleFa: 'نمای بزرگ‌نمایی انگ ری‌گیری T750 و بارکد لیزری',
            url: 'https://images.unsplash.com/photo-1611591475839-729c24ed9804?auto=format&fit=crop&w=600&q=80',
            captureArea: 'دیواره داخلی - مقطع حکاکی لیزری',
            magnification: '50X Micro-Optical'
          },
          {
            id: 'mac-02',
            titleFa: 'بررسی متالورژیکی انحنای اسلیمی بدون ترک سطحی',
            url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
            captureArea: 'برجستگی مقرنس بیرونی',
            magnification: '30X Macro'
          }
        ],
        qcNotes: 'تست کشش و مقاومت تسلیم ساختار النگو با موفقیت انجام شد. بدون انحراف عیار.',
        currentOwnerName: 'سارا فرهمند',
        ownerNationalCodeMasked: '۰۰۱****۴۸۲',
        ownerPhoneMasked: '۰۹۱۲****۵۴۱',
        ownershipRegisteredAtFa: '۱۴۰۵/۰۵/۲۲ - ۱۸:۴۵',
        retailInvoiceNumber: 'INV-GLR-1405-8910',
        warrantyValidUntilFa: '۱۴۰۷/۰۵/۲۲ (۲ سال گارانتی اصالت دیدار)',
        insuranceStatus: 'covered',
        cryptographicHash: 'a89f310bc9312d8a4f91039bb3e18820a01ef942d765e3b1c90089fab123441a',
        digitalSealVerified: true,
        issuedAt: '۱۴۰۵/۰۱/۲۰',
        issuedBy: 'واحد صدور گذرنامه و اصالت دیدار گلد',
        isStolenReported: false
      },
      {
        id: 'pass-02',
        uid: 'DID-AU750-2026-8820-002',
        serialNumber: 'SN-8820-26-002',
        nfcTagUid: '04:B4:7C:1E:88:31:95',
        qrCodeData: 'https://verify.didargold.com/p/DID-AU750-2026-8820-002',
        productSkuId: 'prd-01',
        productSkuCode: 'DID-BNG-8820',
        productTitleFa: 'النگو طلا ۱۸ عیار ریخته‌گری طرح اسلیمی صفوی (آینه‌ای)',
        variantId: 'var-01-3',
        sizeLabelFa: 'سایز ۳ (قطر داخلی ۵۸ میلی‌متر)',
        colorFa: 'طلایی زرد کلاسیک (Yellow Gold)',
        carat: '18k_750',
        caratFa: '۱۸ عیار (۷۵۰)',
        nominalWeightGrams: 12.6,
        actualScaleWeightGrams: 12.618,
        weightDeltaGrams: 0.018,
        scaleModel: 'ترازوی دیجیتال تحلیلی AND FX-300i (دقت ۰.۰۰۱ گرم)',
        scaleCalibrationDateFa: '۱۴۰۴/۱۲/۱۵ (آزمون‌سازان دانا)',
        assayLabName: 'آزمایشگاه ری‌گیری رسمی زرفام تهران',
        assayUnionPermitNo: 'پروانه اتحادیه: 1402-984',
        assayPacketCode: 'پاکت ری‌گیری: ZRF-44910',
        hallmarkCode: 'T750-ZRF94',
        certifiedFineness: 750.3,
        assayMethod: 'both',
        assayMethodFa: 'کوپلاسیون رسمی (Fire Assay) و طیف‌سنجی XRF',
        assayCertifiedDateFa: '۱۴۰۵/۰۱/۱۸',
        inspectorName: 'مهندس محمدرضا توکلی (ری‌گیر ارشد)',
        laserEngravingText: 'DIDAR 750 T-94 SN-8820-002',
        laserPositionFa: 'جداره داخلی لنگه با عمق ۴۰ میکرون',
        hasDidarSecurityMicroPattern: true,
        status: 'retail_inventory',
        statusFa: 'موجود در ویترین گالری همکار',
        currentHolderType: 'retail_partner',
        currentHolderName: 'گالری طلا و جواهر درخشان (بازار بزرگ تهران)',
        currentHolderId: 'ret-104',
        locationCityFa: 'تهران - بازار زرگرها',
        qcPassed: true,
        qcInspectorName: 'مهندس رامین فراهانی',
        qcScore: 98.8,
        surfaceFinishGradeFa: 'سوپرپولیش آینه‌ای',
        porosityCheckFa: 'تأیید کامل بدون نقص',
        macroPhotos: [
          {
            id: 'mac-03',
            titleFa: 'سنجش ضخامت لبه و حکاکی بارکد ضدجعل',
            url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
            captureArea: 'کف لبه داخلی النگو',
            magnification: '40X'
          }
        ],
        qcNotes: 'آماده تحویل و عرضه به مشتری نهایی در گالری طرف قرارداد.',
        insuranceStatus: 'covered',
        cryptographicHash: 'bc78a22de45100fae92bca3017728f110aa9843c19b02a8e77a1112233445566',
        digitalSealVerified: true,
        issuedAt: '۱۴۰۵/۰۱/۲۰',
        issuedBy: 'واحد صدور گذرنامه و اصالت دیدار گلد',
        isStolenReported: false
      },
      {
        id: 'pass-03',
        uid: 'DID-AU750-2026-1045-014',
        serialNumber: 'SN-1045-26-014',
        nfcTagUid: '04:C8:99:4D:23:71:12',
        qrCodeData: 'https://verify.didargold.com/p/DID-AU750-2026-1045-014',
        productSkuId: 'prd-02',
        productSkuCode: 'DID-RNG-1045',
        productTitleFa: 'انگشتر سولیتر برلیان ۱۸ عیار شش‌پایه کلاسیک',
        variantId: 'var-02-1',
        sizeLabelFa: 'سایز ۵۲ (قطر داخلی ۱۶.۵ میلی‌متر)',
        colorFa: 'طلای سفید رودیوم (White Gold)',
        carat: '18k_750',
        caratFa: '۱۸ عیار (۷۵۰)',
        nominalWeightGrams: 4.15,
        actualScaleWeightGrams: 4.142,
        weightDeltaGrams: -0.008,
        scaleModel: 'ترازوی تحلیلی Sartorius Quintix 65 (دقت ۰.۰۰۰۱ گرم)',
        scaleCalibrationDateFa: '۱۴۰۴/۱۱/۲۰ (مرکز آزمون ایران)',
        assayLabName: 'آزمایشگاه ری‌گیری رسمی تابش اصفهان',
        assayUnionPermitNo: 'پروانه اتحادیه: 1401-412',
        assayPacketCode: 'پاکت ری‌گیری: TBS-81093',
        hallmarkCode: 'T750-TB12',
        certifiedFineness: 750.5,
        assayMethod: 'both',
        assayMethodFa: 'کوپلاسیون رسمی و آنالیز فلزات سنگین',
        assayCertifiedDateFa: '۱۴۰۵/۰۲/۱۰',
        inspectorName: 'مهندس نوید سلیمی',
        laserEngravingText: 'DIDAR W750 D-0.35ct SN-1045-014',
        laserPositionFa: 'زیر رکاب انگشتر با خط لیزری میکرومتری',
        hasDidarSecurityMicroPattern: true,
        status: 'in_vault',
        statusFa: 'موجود در خزانه مرکزی دیدار',
        currentHolderType: 'central_vault',
        currentHolderName: 'خزانه مرکزی شمش و مصنوعات دیدار - صندوق امانات تهران',
        currentHolderId: 'vlt-001',
        locationCityFa: 'تهران',
        qcPassed: true,
        qcInspectorName: 'مهندس لیلا بهرامی (گوهرشناس)',
        qcScore: 99.8,
        surfaceFinishGradeFa: 'آبکاری سه لایه رودیوم با براقیت ویژه',
        porosityCheckFa: 'بدون کوچک‌ترین تخلخل میکروسکوپی در پایه‌های چنگ',
        macroPhotos: [
          {
            id: 'mac-04',
            titleFa: 'بزرگ‌نمایی چنگ‌های شش‌پایه و گوهرتراشی برلیان',
            url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
            captureArea: 'سوارکردن سنگ (Stone Setting)',
            magnification: '60X Gemological'
          }
        ],
        qcNotes: 'سنگ الماس طبیعی ۰.۳۵ قیراطی درجه کات Very Good بدون لقی پایه‌ها تأیید شد.',
        insuranceStatus: 'covered',
        cryptographicHash: '98fa01cb345178ef9910aacc445127bb12efaa8994411bce5566778899aabbcc',
        digitalSealVerified: true,
        issuedAt: '۱۴۰۵/۰۲/۱۲',
        issuedBy: 'واحد صدور گذرنامه و اصالت دیدار گلد',
        isStolenReported: false
      },
      {
        id: 'pass-04',
        uid: 'DID-AU750-2026-4020-089',
        serialNumber: 'SN-4020-26-089',
        nfcTagUid: '04:D1:66:3A:90:54:77',
        qrCodeData: 'https://verify.didargold.com/p/DID-AU750-2026-4020-089',
        productSkuId: 'prd-04',
        productSkuCode: 'DID-CHN-4020',
        productTitleFa: 'زنجیر کارتیه طلا ۱۸ عیار تراش تخت ضخیم (Cartier Curb)',
        variantId: 'var-04-1',
        sizeLabelFa: 'طول ۵۵ سانتی‌متر (عرض دانه ۶.۵ میلی‌متر)',
        colorFa: 'طلایی زرد کلاسیک',
        carat: '18k_750',
        caratFa: '۱۸ عیار (۷۵۰)',
        nominalWeightGrams: 32.5,
        actualScaleWeightGrams: 32.48,
        weightDeltaGrams: -0.02,
        scaleModel: 'ترازوی دیجیتال تحلیلی AND FX-300i (دقت ۰.۰۰۱ گرم)',
        scaleCalibrationDateFa: '۱۴۰۴/۱۲/۱۵ (آزمون‌سازان دانا)',
        assayLabName: 'آزمایشگاه ری‌گیری رسمی زرین مشهد',
        assayUnionPermitNo: 'پروانه اتحادیه: 1400-331',
        assayPacketCode: 'پاکت ری‌گیری: ZRN-19042',
        hallmarkCode: 'T750-MS08',
        certifiedFineness: 750.2,
        assayMethod: 'cupellation_fire_assay',
        assayMethodFa: 'روش کوپلاسیون رسمی طبق استاندارد ملی ایران ISIRI 213',
        assayCertifiedDateFa: '۱۴۰۵/۰۳/۰۴',
        inspectorName: 'مهندس سعید شمس',
        laserEngravingText: 'DIDAR 750 T-MS08 SN-4020-089',
        laserPositionFa: 'زبانه قفل جعبه‌ای دوبل کارتیه',
        hasDidarSecurityMicroPattern: true,
        status: 'reported_lost_stolen',
        statusFa: 'اعلام مفقودی / سرقت در شبکه سراسری',
        currentHolderType: 'consumer',
        currentHolderName: 'آقای بهروز ناصری',
        currentHolderId: 'usr-cst-882',
        locationCityFa: 'اصفهان',
        qcPassed: true,
        qcInspectorName: 'مهندس رامین فراهانی',
        qcScore: 99.0,
        surfaceFinishGradeFa: 'تراش تخت لیزری آینه‌ای با انعکاس کامل',
        porosityCheckFa: 'پیوندهای حلقه‌ای کاملاً جوش لیزری خورده و مستحکم',
        macroPhotos: [
          {
            id: 'mac-05',
            titleFa: 'بزرگ‌نمایی جوش لیزری دانه‌های کارتیه',
            url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
            captureArea: 'حلقه میانی زنجیر',
            magnification: '40X'
          }
        ],
        qcNotes: 'قفل طوطی دوبل با فنر ضدخستگی تست شد. تحمل کشش تا ۳۵ کیلوگرم.',
        currentOwnerName: 'بهروز ناصری',
        ownerNationalCodeMasked: '۱۲۸****۰۴۱',
        ownerPhoneMasked: '۰۹۱۳****۹۹۲',
        ownershipRegisteredAtFa: '۱۴۰۵/۰۳/۱۸ - ۱۱:۲۰',
        retailInvoiceNumber: 'INV-ISF-1405-2201',
        warrantyValidUntilFa: '۱۴۰۷/۰۳/۱۸',
        insuranceStatus: 'covered',
        cryptographicHash: 'dd11223344556677889900aabbccddeeff0011223344556677889900aabbccdd',
        digitalSealVerified: true,
        issuedAt: '۱۴۰۵/۰۳/۰۶',
        issuedBy: 'واحد صدور گذرنامه و اصالت دیدار گلد',
        isStolenReported: true,
        stolenReportDateFa: '۱۴۰۵/۰۵/۰۳ - ۰۹:۱۵',
        stolenReportReason: 'گزارش دستبرد به خودروی شخصی در اصفهان همراه با فاکتور و صورت‌جلسه آگاهی شماره ۳۹۱/ب/۰۵'
      },
      {
        id: 'pass-05',
        uid: 'DID-AU750-2026-6200-008',
        serialNumber: 'SN-6200-26-008',
        nfcTagUid: '04:E9:12:7B:44:88:01',
        qrCodeData: 'https://verify.didargold.com/p/DID-AU750-2026-6200-008',
        productSkuId: 'prd-05',
        productSkuCode: 'DID-MDL-6200',
        productTitleFa: 'پلاک مدالیون ۱۸ عیار نقش برجسته شیر و خورشید با قاب کنگره‌ای',
        variantId: 'var-05-1',
        sizeLabelFa: 'قطر ۳۰ میلی‌متر (قاب دور کنگره دست‌ساز)',
        colorFa: 'طلای زرد عتیقه‌ای (Vintage Matte Gold)',
        carat: '18k_750',
        caratFa: '۱۸ عیار (۷۵۰)',
        nominalWeightGrams: 8.5,
        actualScaleWeightGrams: 8.512,
        weightDeltaGrams: 0.012,
        scaleModel: 'ترازوی دیجیتال تحلیلی AND FX-300i (دقت ۰.۰۰۱ گرم)',
        scaleCalibrationDateFa: '۱۴۰۴/۱۲/۱۵ (آزمون‌سازان دانا)',
        assayLabName: 'آزمایشگاه ری‌گیری مرکزی زرفام تهران',
        assayUnionPermitNo: 'پروانه اتحادیه: 1402-984',
        assayPacketCode: 'پاکت ری‌گیری: ZRF-46102',
        hallmarkCode: 'T750-ZRF94',
        certifiedFineness: 750.4,
        assayMethod: 'both',
        assayMethodFa: 'کوپلاسیون رسمی و عیارسنجی با اشعه ایکس',
        assayCertifiedDateFa: '۱۴۰۵/۰۴/۰۱',
        inspectorName: 'مهندس محمدرضا توکلی',
        laserEngravingText: 'DIDAR 750 T-94 SN-6200-008',
        laserPositionFa: 'حلقه آویز بالایی مدال',
        hasDidarSecurityMicroPattern: true,
        status: 'in_transit',
        statusFa: 'در حال انتقال امن به شعبه',
        currentHolderType: 'logistics_courier',
        currentHolderName: 'پیک مکانیزه حفاظتی دیدار - خودروی مجهز شماره ۳',
        currentHolderId: 'log-sec-03',
        locationCityFa: 'مسیر تهران - شیراز',
        qcPassed: true,
        qcInspectorName: 'مهندس رامین فراهانی',
        qcScore: 99.6,
        surfaceFinishGradeFa: 'مات ساتن برجسته با لبه‌های کنگره صیقلی',
        porosityCheckFa: 'فاقد هرگونه حباب در نقش برجسته مینیاتوری',
        macroPhotos: [
          {
            id: 'mac-06',
            titleFa: 'بزرگ‌نمایی نقش مینیاتوری برجسته و انگ آزمایشگاه',
            url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
            captureArea: 'مرکز مدال و آویز',
            magnification: '45X'
          }
        ],
        qcNotes: 'نقش برجسته بدون تخلخل و با تیزی تیغه‌های استاندارد قالب ضرب شده است.',
        insuranceStatus: 'covered',
        cryptographicHash: 'ee2233445566778899aabbccddeeff00112233445566778899aabbccddeeff00',
        digitalSealVerified: true,
        issuedAt: '۱۴۰۵/۰۴/۰۳',
        issuedBy: 'واحد صدور گذرنامه و اصالت دیدار گلد',
        isStolenReported: false
      }
    ];

    // 2. زنجیره وقایع اصالت و جابه‌جایی فیزیکی (Provenance Events Ledger)
    this.events = [
      // وقایع مربوط به pass-01 (النگو فروخته‌شده)
      {
        id: 'evt-01',
        passportId: 'pass-01',
        uid: 'DID-AU750-2026-8820-001',
        eventType: 'casting_completed',
        eventTypeFa: 'تولید و ریخته‌گری در کارگاه',
        titleFa: 'اتمام ریخته‌گری القایی و پرداخت اولیه',
        descriptionFa: 'قالب‌گیری دقیق با شمش استاندارد ۱۸ عیار در کارگاه طلاسازی زرین‌نقش اصفهان انجام شد.',
        actorName: 'استاد احمد زرین‌پور',
        actorRoleFa: 'مدیر تولید کارگاه زرین‌نقش',
        fromHolder: 'کارگاه زرین‌نقش اصفهان',
        toHolder: 'واحد بازرسی و حمل به ری‌گیری',
        locationFa: 'اصفهان - شهرک صنعتی جی',
        timestampFa: '۱۴۰۵/۰۱/۱۵ - ۱۰:۳۰',
        blockHash: '0x4f12ab7901cd445e9821aacc3341b590',
        verified: true
      },
      {
        id: 'evt-02',
        passportId: 'pass-01',
        uid: 'DID-AU750-2026-8820-001',
        eventType: 'assay_hallmarked',
        eventTypeFa: 'سنجش عیار و انگ‌کوبی رسمی',
        titleFa: 'تأیید عیار ۷۵۰.۴ در ری‌گیری زرفام تهران',
        descriptionFa: 'نمونه‌برداری و کوپلاسیون رسمی با پاکت ZRF-44910 انجام شد و انگ استاندارد T750-ZRF94 با لیزر ثبت گردید.',
        actorName: 'مهندس محمدرضا توکلی',
        actorRoleFa: 'کارشناس رسمی آزمایشگاه ری‌گیری',
        fromHolder: 'آزمایشگاه ری‌گیری زرفام',
        toHolder: 'خزانه مرکزی دیدار گلد',
        locationFa: 'تهران - بازار طلا',
        timestampFa: '۱۴۰۵/۰۱/۱۸ - ۱۶:۴۵',
        blockHash: '0x99a1cb44501ef23b8894cca110294101',
        verified: true,
        certificateRef: 'CERT-ZRF-44910'
      },
      {
        id: 'evt-03',
        passportId: 'pass-01',
        uid: 'DID-AU750-2026-8820-001',
        eventType: 'vault_intake_qc',
        eventTypeFa: 'پذیرش در خزانه و صدور گذرنامه',
        titleFa: 'وزن‌سنجی تحلیلی ۱۱.۹۸۵ گرم و صدور تگ NFC/QR',
        descriptionFa: 'وزن دقیق با ترازوی کالیبره ثبت گردید، تست عیار غیرمخرب و شواهد ماکرو در سامانه آرشیو شد و شناسه DID-AU750-2026-8820-001 تخصیص یافت.',
        actorName: 'مهندس رامین فراهانی',
        actorRoleFa: 'سرپرست کنترل کیفیت دیدار',
        fromHolder: 'پذیرش ورود طلا',
        toHolder: 'خزانه مرکزی شمش و مصنوعات دیدار',
        locationFa: 'تهران - خزانه مرکزی',
        timestampFa: '۱۴۰۵/۰۱/۲۰ - ۱۱:۰۰',
        blockHash: '0x3344556677889900aabbccddeeff1122',
        verified: true
      },
      {
        id: 'evt-04',
        passportId: 'pass-01',
        uid: 'DID-AU750-2026-8820-001',
        eventType: 'consignment_transferred',
        eventTypeFa: 'خروج امانی جهت ویترین گالری',
        titleFa: 'تحویل محموله امانی به گالری طلا و جواهر گوهرشاد',
        descriptionFa: 'حمل با خودروی حفاظت‌شده و تحویل رسمی با امضای دیجیتال و فاکتور توزیع بنکداری دیدار.',
        actorName: 'سید علی حسینی',
        actorRoleFa: 'مسئول پشتیبانی لجستیک امن',
        fromHolder: 'خزانه مرکزی دیدار',
        toHolder: 'گالری گوهرشاد (تهران)',
        locationFa: 'تهران - سعادت‌آباد',
        timestampFa: '۱۴۰۵/۰۲/۰۲ - ۱۴:۱۵',
        blockHash: '0x778899aabbccddeeff00112233445566',
        verified: true
      },
      {
        id: 'evt-05',
        passportId: 'pass-01',
        uid: 'DID-AU750-2026-8820-001',
        eventType: 'consumer_registered',
        eventTypeFa: 'فروش به مصرف‌کننده و ثبت مالکیت',
        titleFa: 'انتقال مالکیت به خانم سارا فرهمند',
        descriptionFa: 'خرید از گالری، پرداخت آنلاین، صدور فاکتور رسمی INV-GLR-1405-8910 و فعال‌سازی ۲ سال گارانتی اصالت در گذرنامه دیجیتال.',
        actorName: 'سیستم ثبت مالکیت دیدار',
        actorRoleFa: 'پرتال ثبت خودکار خریدار',
        fromHolder: 'گالری گوهرشاد',
        toHolder: 'خانم سارا فرهمند (مالک حقیقی)',
        locationFa: 'تهران',
        timestampFa: '۱۴۰۵/۰۵/۲۲ - ۱۸:۴۵',
        blockHash: '0xffee00112233445566778899aabbccdd',
        verified: true
      },

      // وقایع مربوط به pass-04 (زنجیر کارتیه مسروقه)
      {
        id: 'evt-06',
        passportId: 'pass-04',
        uid: 'DID-AU750-2026-4020-089',
        eventType: 'casting_completed',
        eventTypeFa: 'تولید و ریخته‌گری در کارگاه',
        titleFa: 'تولید زنجیر کارتیه تراش تخت در مشهد',
        descriptionFa: 'ساخت با دستگاه زنجیربافی اتوماتیک و جوش لیزری دانه‌ها.',
        actorName: 'استاد جواد خراسانی',
        actorRoleFa: 'مدیر کارگاه زنجیربافی مشهد',
        fromHolder: 'کارگاه طلای مشهد',
        toHolder: 'آزمایشگاه ری‌گیری زرین',
        locationFa: 'مشهد - طلاب',
        timestampFa: '۱۴۰۵/۰۳/۰۲ - ۰۹:۰۰',
        blockHash: '0x0102030405060708090a0b0c0d0e0f10',
        verified: true
      },
      {
        id: 'evt-07',
        passportId: 'pass-04',
        uid: 'DID-AU750-2026-4020-089',
        eventType: 'assay_hallmarked',
        eventTypeFa: 'سنجش عیار و انگ‌کوبی رسمی',
        titleFa: 'تأیید عیار ۷۵۰.۲ در ری‌گیری زرین مشهد',
        descriptionFa: 'سنجش عیار با کوپلاسیون رسمی و حک لیزری کد T750-MS08 روی قفل.',
        actorName: 'مهندس سعید شمس',
        actorRoleFa: 'کارشناس رسمی آزمایشگاه',
        fromHolder: 'ری‌گیری زرین مشهد',
        toHolder: 'خزانه دیدار',
        locationFa: 'مشهد',
        timestampFa: '۱۴۰۵/۰۳/۰۴ - ۱۱:۳۰',
        blockHash: '0x1112131415161718191a1b1c1d1e1f20',
        verified: true
      },
      {
        id: 'evt-08',
        passportId: 'pass-04',
        uid: 'DID-AU750-2026-4020-089',
        eventType: 'consumer_registered',
        eventTypeFa: 'فروش به خریدار در اصفهان',
        titleFa: 'خرید و فعال‌سازی شناسنامه توسط آقای بهروز ناصری',
        descriptionFa: 'فروش از طریق گالری طلای اصفهان با شماره فاکتور INV-ISF-1405-2201.',
        actorName: 'گالری طلای اصفهان',
        actorRoleFa: 'فروشگاه طرف قرارداد',
        fromHolder: 'گالری طلای اصفهان',
        toHolder: 'آقای بهروز ناصری',
        locationFa: 'اصفهان',
        timestampFa: '۱۴۰۵/۰۳/۱۸ - ۱۱:۲۰',
        blockHash: '0x2122232425262728292a2b2c2d2e2f30',
        verified: true
      },
      {
        id: 'evt-09',
        passportId: 'pass-04',
        uid: 'DID-AU750-2026-4020-089',
        eventType: 'stolen_flagged',
        eventTypeFa: 'ثبت اعلام سرقت در شبکه سراسری',
        titleFa: 'گزارش دستبرد و علامت‌گذاری قطعه به عنوان مسروقه',
        descriptionFa: 'مالک قطعه گزارش سرقت را ثبت نمود. در صورت استعلام QR یا بارکد این قطعه توسط هر طلافروشی در سراسر کشور، هشدار فوری صادر می‌شود.',
        actorName: 'مرکز امنیت و مقابله با تقلب دیدار',
        actorRoleFa: 'واحد پاسخگویی به دعاوی و تخلفات',
        fromHolder: 'مالک (آقای ناصری)',
        toHolder: 'سیستم نظارت و ردگیری کشوری',
        locationFa: 'اصفهان / سراسر کشور',
        timestampFa: '۱۴۰۵/۰۵/۰۳ - ۰۹:۱۵',
        blockHash: '0x99887766554433221100ffeeddccbbaa',
        verified: true,
        certificateRef: 'CRIME-REPORT-391B05'
      }
    ];
  }

  public getData(): K06DataPayload {
    return {
      passports: this.passports,
      events: this.events,
      metrics: this.calculateMetrics()
    };
  }

  public calculateMetrics(): K06Metrics {
    const totalMinted = this.passports.length;
    let inVault = 0;
    let withRetailers = 0;
    let activeWithConsumers = 0;
    let reportedLostStolen = 0;
    let totalGrams = 0;
    let totalFinenessSum = 0;

    for (const p of this.passports) {
      totalGrams += p.actualScaleWeightGrams;
      totalFinenessSum += p.certifiedFineness;

      if (p.isStolenReported || p.status === 'reported_lost_stolen') {
        reportedLostStolen++;
      } else if (p.status === 'in_vault') {
        inVault++;
      } else if (p.status === 'retail_inventory' || p.status === 'in_transit') {
        withRetailers++;
      } else if (p.status === 'sold_active') {
        activeWithConsumers++;
      }
    }

    const avgFineness = totalMinted > 0 ? Number((totalFinenessSum / totalMinted).toFixed(2)) : 750.0;

    return {
      totalPassportsMinted: totalMinted,
      inVaultCount: inVault,
      withRetailersCount: withRetailers,
      activeWithConsumersCount: activeWithConsumers,
      totalGramsTracked: Number(totalGrams.toFixed(3)),
      reportedLostStolenCount: reportedLostStolen,
      avgFinenessPurity: avgFineness,
      totalProvenanceEvents: this.events.length
    };
  }

  public getPassportByUid(uid: string): UniqueItemPassport | undefined {
    return this.passports.find(
      (p) => p.uid.toLowerCase() === uid.toLowerCase() || p.serialNumber.toLowerCase() === uid.toLowerCase()
    );
  }

  public getEventsByPassportId(passportId: string): ProvenanceEvent[] {
    return this.events.filter((e) => e.passportId === passportId);
  }

  public mintPassport(payload: {
    itemNature?: 'manufactured_jewelry' | 'melted_gold';
    itemNatureFa?: string;
    productSkuId: string;
    productSkuCode: string;
    productTitleFa: string;
    variantId: string;
    sizeLabelFa: string;
    colorFa: string;
    carat: '18k_750' | '21k_875' | '21.6k_900' | '24k_995' | '24k_999' | string;
    caratFa: string;
    nominalWeightGrams: number;
    actualScaleWeightGrams: number;
    scaleModel: string;
    assayLabName?: string;
    assayUnionPermitNo?: string;
    assayPacketCode?: string;
    hallmarkCode?: string;
    certifiedFineness?: number;
    assayMethod?: 'cupellation_fire_assay' | 'xrf_spectrometry' | 'both';
    assayMethodFa?: string;
    inspectorName?: string;
    laserEngravingText?: string;
    laserPositionFa?: string;
    qcInspectorName?: string;
    qcScore?: number;
    surfaceFinishGradeFa?: string;
    porosityCheckFa?: string;
    qcNotes?: string;
    macroPhotoUrl?: string;
    macroPhotos?: Array<{
      id?: string;
      titleFa?: string;
      url: string;
      captureArea?: string;
      magnification?: string;
    }>;
  }): UniqueItemPassport {
    const id = `pass-${String(this.passports.length + 1).padStart(2, '0')}`;
    const seq = String(this.passports.length + 1).padStart(3, '0');
    const cleanSkuNum = payload.productSkuCode.replace(/\D/g, '') || '9000';
    const uid = `DID-AU750-2026-${cleanSkuNum}-${seq}`;
    const serialNumber = `SN-${cleanSkuNum}-26-${seq}`;
    const nfcTagUid = `04:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:${Math.floor(Math.random() * 89 + 10)}:99`;
    const qrCodeData = `https://verify.didargold.com/p/${uid}`;
    const weightDeltaGrams = Number((payload.actualScaleWeightGrams - (payload.nominalWeightGrams || payload.actualScaleWeightGrams)).toFixed(3));
    
    // Hash simulation
    const cryptographicHash = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Date.now().toString(36);

    const nowFa = '۱۴۰۵/۰۶/۱۷ - ۱۲:۰۰';

    // Parse macro photos list
    let resolvedMacroPhotos = [];
    if (payload.macroPhotos && Array.isArray(payload.macroPhotos) && payload.macroPhotos.length > 0) {
      resolvedMacroPhotos = payload.macroPhotos
        .filter((item) => item && item.url && item.url.trim() !== '')
        .map((item, idx) => ({
          id: item.id || `mac-${Date.now()}-${idx + 1}`,
          titleFa: item.titleFa || `شاهد ماکرو شماره ${idx + 1}`,
          url: item.url.trim(),
          captureArea: item.captureArea || 'انگ ری‌گیری و بافت سطحی',
          magnification: item.magnification || '40X Optical'
        }));
    } else if (payload.macroPhotoUrl && payload.macroPhotoUrl.trim() !== '') {
      resolvedMacroPhotos = [
        {
          id: `mac-${Date.now()}`,
          titleFa: 'شاهد تصویری کنترل کیفیت و عیارسنجی',
          url: payload.macroPhotoUrl.trim(),
          captureArea: 'نشان و انگ ری‌گیری',
          magnification: '40X'
        }
      ];
    } else {
      resolvedMacroPhotos = [
        {
          id: `mac-${Date.now()}`,
          titleFa: 'ثبت ماکرو از نشان استاندارد اتحادیه',
          url: 'https://images.unsplash.com/photo-1611591475839-729c24ed9804?auto=format&fit=crop&w=600&q=80',
          captureArea: 'بدنه داخلی مصنوع',
          magnification: '50X'
        }
      ];
    }

    const itemNature = payload.itemNature || 'manufactured_jewelry';
    const itemNatureFa = payload.itemNatureFa || (itemNature === 'melted_gold' ? 'طلای آبشده و شمش عیاردار' : 'مصنوعات ساخته‌شده طلا');

    const newPassport: UniqueItemPassport = {
      id,
      uid,
      serialNumber,
      nfcTagUid,
      qrCodeData,
      itemNature,
      itemNatureFa,
      productSkuId: payload.productSkuId,
      productSkuCode: payload.productSkuCode,
      productTitleFa: payload.productTitleFa,
      variantId: payload.variantId,
      sizeLabelFa: payload.sizeLabelFa,
      colorFa: payload.colorFa,
      carat: payload.carat,
      caratFa: payload.caratFa,
      nominalWeightGrams: payload.nominalWeightGrams || payload.actualScaleWeightGrams,
      actualScaleWeightGrams: payload.actualScaleWeightGrams,
      weightDeltaGrams,
      scaleModel: payload.scaleModel || 'ترازوی دیجیتال تحلیلی AND FX-300i (دقت ۰.۰۰۱ گرم)',
      scaleCalibrationDateFa: '۱۴۰۴/۱۲/۱۵ (آزمون‌سازان دانا)',
      assayLabName: payload.assayLabName || (itemNature === 'melted_gold' ? 'ری‌گیری رسمی شمش' : 'آزمایشگاه عیار استاندارد سازنده'),
      assayUnionPermitNo: payload.assayUnionPermitNo || 'پروانه اتحادیه: 1402-984',
      assayPacketCode: payload.assayPacketCode || (itemNature === 'melted_gold' ? 'پاکت ری‌گیری' : '—'),
      hallmarkCode: payload.hallmarkCode || (itemNature === 'melted_gold' ? 'انگ عیار رسمی' : 'T750-STD'),
      certifiedFineness: payload.certifiedFineness !== undefined && !isNaN(payload.certifiedFineness) ? payload.certifiedFineness : 750.0,
      assayMethod: payload.assayMethod || 'both',
      assayMethodFa: payload.assayMethodFa || 'کوپلاسیون رسمی و طیف‌سنجی XRF',
      assayCertifiedDateFa: nowFa.split(' - ')[0],
      inspectorName: payload.inspectorName || 'کارشناس عیارسنجی دیدار',
      laserEngravingText: payload.laserEngravingText || `DIDAR 750 ${payload.hallmarkCode || 'T750'} ${serialNumber}`,
      laserPositionFa: payload.laserPositionFa || 'جداره داخلی لنگه با پرتو لیزر فایبر',
      hasDidarSecurityMicroPattern: true,
      status: 'in_vault',
      statusFa: 'موجود در خزانه مرکزی دیدار',
      currentHolderType: 'central_vault',
      currentHolderName: 'خزانه مرکزی شمش و مصنوعات دیدار - تهران',
      currentHolderId: 'vlt-001',
      locationCityFa: 'تهران',
      qcPassed: true,
      qcInspectorName: payload.qcInspectorName || 'واحد کنترل کیفیت دیدار',
      qcScore: payload.qcScore || 99.0,
      surfaceFinishGradeFa: payload.surfaceFinishGradeFa || 'سوپرپولیش آینه‌ای ممتاز',
      porosityCheckFa: payload.porosityCheckFa || 'بدون تخلخل یا حباب ریخته‌گری (Zero Defect)',
      macroPhotos: resolvedMacroPhotos,
      qcNotes: payload.qcNotes || 'تمام آزمون‌های ابعادی، تلورانس وزنی و انطباق با استاندارد ری‌گیری با موفقیت انجام شد.',
      insuranceStatus: 'covered',
      cryptographicHash,
      digitalSealVerified: true,
      issuedAt: nowFa,
      issuedBy: 'واحد صدور گذرنامه و اصالت دیدار گلد',
      isStolenReported: false
    };

    this.passports.unshift(newPassport);

    // ثبت واقعه صدور شناسنامه و ورود به خزانه
    this.events.unshift({
      id: `evt-${Date.now()}-1`,
      passportId: newPassport.id,
      uid: newPassport.uid,
      eventType: 'assay_hallmarked',
      eventTypeFa: 'سنجش عیار و انگ‌کوبی رسمی',
      titleFa: `تأیید عیار ${payload.certifiedFineness} در ${payload.assayLabName}`,
      descriptionFa: `سنجش با متد ${payload.assayMethodFa} و کد پاکت ${payload.assayPacketCode} ثبت گردید.`,
      actorName: payload.inspectorName,
      actorRoleFa: 'کارشناس ری‌گیری',
      fromHolder: payload.assayLabName,
      toHolder: 'خزانه دیدار',
      locationFa: 'تهران',
      timestampFa: nowFa,
      blockHash: `0x${Math.random().toString(16).substring(2, 14)}`,
      verified: true,
      certificateRef: payload.assayPacketCode
    });

    this.events.unshift({
      id: `evt-${Date.now()}-2`,
      passportId: newPassport.id,
      uid: newPassport.uid,
      eventType: 'vault_intake_qc',
      eventTypeFa: 'پذیرش در خزانه و صدور گذرنامه',
      titleFa: `صدور گذرنامه دیجیتال و وزن‌سنجی ${payload.actualScaleWeightGrams} گرم`,
      descriptionFa: 'پلاک‌گذاری NFC و بارکد دو‌بعدی با تأیید بازرس کنترل کیفیت تکمیل گردید.',
      actorName: payload.qcInspectorName,
      actorRoleFa: 'سرپرست کنترل کیفیت',
      fromHolder: 'پذیرش ورود طلا',
      toHolder: 'خزانه مرکزی دیدار',
      locationFa: 'تهران',
      timestampFa: nowFa,
      blockHash: `0x${Math.random().toString(16).substring(2, 14)}`,
      verified: true
    });

    return newPassport;
  }

  public recordProvenanceEvent(payload: {
    passportId: string;
    eventType: ProvenanceEvent['eventType'];
    eventTypeFa: string;
    titleFa: string;
    descriptionFa: string;
    actorName: string;
    actorRoleFa: string;
    fromHolder: string;
    toHolder: string;
    locationFa: string;
    certificateRef?: string;
  }): ProvenanceEvent {
    const passport = this.passports.find((p) => p.id === payload.passportId);
    if (!passport) {
      throw new Error('گذرنامه قطعه طلا با این شناسه یافت نشد.');
    }

    const event: ProvenanceEvent = {
      id: `evt-${Date.now()}`,
      passportId: passport.id,
      uid: passport.uid,
      eventType: payload.eventType,
      eventTypeFa: payload.eventTypeFa,
      titleFa: payload.titleFa,
      descriptionFa: payload.descriptionFa,
      actorName: payload.actorName,
      actorRoleFa: payload.actorRoleFa,
      fromHolder: payload.fromHolder,
      toHolder: payload.toHolder,
      locationFa: payload.locationFa,
      timestampFa: '۱۴۰۵/۰۶/۱۷ - ۱۲:۳۰',
      blockHash: `0x${Math.random().toString(16).substring(2, 16)}`,
      verified: true,
      certificateRef: payload.certificateRef
    };

    this.events.unshift(event);
    return event;
  }

  public transferOwnership(payload: {
    passportId: string;
    ownerName: string;
    ownerNationalCode: string;
    ownerPhone: string;
    retailInvoiceNumber: string;
    storeName: string;
    notes?: string;
  }): UniqueItemPassport {
    const passport = this.passports.find((p) => p.id === payload.passportId);
    if (!passport) {
      throw new Error('گذرنامه قطعه طلا یافت نشد.');
    }

    if (passport.isStolenReported) {
      throw new Error('این قطعه به عنوان مسروقه ثبت شده و انتقال مالکیت آن از نظر قانونی مسدود است.');
    }

    // Mask sensitive national code & phone
    const maskedNat = payload.ownerNationalCode.length >= 6
      ? `${payload.ownerNationalCode.slice(0, 3)}****${payload.ownerNationalCode.slice(-3)}`
      : '***-***-***';
    const maskedPhone = payload.ownerPhone.length >= 7
      ? `${payload.ownerPhone.slice(0, 4)}****${payload.ownerPhone.slice(-3)}`
      : '۰۹۱۲***';

    const nowFa = '۱۴۰۵/۰۶/۱۷ - ۱۳:۱۵';

    passport.status = 'sold_active';
    passport.statusFa = 'فروخته‌شده و در مالکیت مشتری';
    passport.currentHolderType = 'consumer';
    passport.currentHolderName = payload.ownerName;
    passport.currentOwnerName = payload.ownerName;
    passport.ownerNationalCodeMasked = maskedNat;
    passport.ownerPhoneMasked = maskedPhone;
    passport.ownershipRegisteredAtFa = nowFa;
    passport.retailInvoiceNumber = payload.retailInvoiceNumber;
    passport.warrantyValidUntilFa = '۱۴۰۷/۰۶/۱۷ (۲ سال ضمانت اصالت دیدار)';

    // اضافه کردن واقعه انتقال به زنجیره اصالت
    this.recordProvenanceEvent({
      passportId: passport.id,
      eventType: 'consumer_registered',
      eventTypeFa: 'فروش به مصرف‌کننده و ثبت مالکیت',
      titleFa: `انتقال مالکیت به نام ${payload.ownerName}`,
      descriptionFa: `فروش از طریق ${payload.storeName} با فاکتور شماره ${payload.retailInvoiceNumber} و فعال‌سازی شناسنامه نهایی.`,
      actorName: payload.storeName,
      actorRoleFa: 'گالری طلافروشی صادرکننده فاکتور',
      fromHolder: passport.currentHolderName || payload.storeName,
      toHolder: payload.ownerName,
      locationFa: passport.locationCityFa || 'تهران',
      certificateRef: payload.retailInvoiceNumber
    });

    return passport;
  }

  public toggleStolenReport(payload: {
    passportId: string;
    isStolen: boolean;
    reason?: string;
    policeReportNo?: string;
  }): UniqueItemPassport {
    const passport = this.passports.find((p) => p.id === payload.passportId);
    if (!passport) {
      throw new Error('گذرنامه قطعه طلا یافت نشد.');
    }

    passport.isStolenReported = payload.isStolen;

    const nowFa = '۱۴۰۵/۰۶/۱۷ - ۱۳:۳۰';

    if (payload.isStolen) {
      passport.status = 'reported_lost_stolen';
      passport.statusFa = 'اعلام مفقودی / سرقت در شبکه سراسری';
      passport.stolenReportDateFa = nowFa;
      passport.stolenReportReason = payload.reason || 'گزارش مفقودی یا سرقت توسط مالک قطعه';

      this.recordProvenanceEvent({
        passportId: passport.id,
        eventType: 'stolen_flagged',
        eventTypeFa: 'ثبت اعلام سرقت در شبکه سراسری',
        titleFa: 'علامت‌گذاری پلاک به عنوان مسروقه',
        descriptionFa: `علت: ${passport.stolenReportReason} ${payload.policeReportNo ? `(شماره پیگیری: ${payload.policeReportNo})` : ''}`,
        actorName: 'پلیس آگاهی و بازرسی صنف طلا',
        actorRoleFa: 'شبکه نظارت بر پیشگیری از معامله مال مسروقه',
        fromHolder: passport.currentHolderName,
        toHolder: 'لیست سیاه کشوری طلا و جواهر',
        locationFa: passport.locationCityFa || 'سراسر کشور',
        certificateRef: payload.policeReportNo
      });
    } else {
      passport.status = passport.currentOwnerName ? 'sold_active' : 'in_vault';
      passport.statusFa = passport.currentOwnerName ? 'فروخته‌شده و در مالکیت مشتری' : 'موجود در خزانه مرکزی دیدار';
      passport.stolenReportDateFa = undefined;
      passport.stolenReportReason = undefined;

      this.recordProvenanceEvent({
        passportId: passport.id,
        eventType: 'recovered_cleared',
        eventTypeFa: 'رفع پرچم سرقت و احراز اصالت',
        titleFa: 'ابطال وضعیت مسروقه با تأیید مراجع نظارتی',
        descriptionFa: 'وضعیت قطعه با احراز فیزیکی و تأیید هویت مالک به حالت عادی بازگردانی شد.',
        actorName: 'مرکز امنیت دیدار گلد',
        actorRoleFa: 'کارشناس احراز اصالت',
        fromHolder: 'لیست سیاه کشوری',
        toHolder: passport.currentHolderName,
        locationFa: passport.locationCityFa || 'تهران'
      });
    }

    return passport;
  }

  public verifyPublic(query: string): {
    found: boolean;
    passport?: UniqueItemPassport;
    events?: ProvenanceEvent[];
    verificationMessage: string;
    isAuthentic: boolean;
    isStolen: boolean;
  } {
    const clean = query.trim().toLowerCase();
    const passport = this.passports.find(
      (p) =>
        p.uid.toLowerCase() === clean ||
        p.serialNumber.toLowerCase() === clean ||
        p.nfcTagUid.toLowerCase() === clean ||
        p.hallmarkCode.toLowerCase() === clean
    );

    if (!passport) {
      return {
        found: false,
        verificationMessage: 'هیچ شناسنامه یا قطعه طلایی با این کد یا بارکد در پایگاه رسمی دیدار گلد یافت نشد. احتمال اصالت نداشتن یا تقلبی بودن قطعه وجود دارد.',
        isAuthentic: false,
        isStolen: false
      };
    }

    const events = this.getEventsByPassportId(passport.id);

    if (passport.isStolenReported) {
      return {
        found: true,
        passport,
        events,
        verificationMessage: 'هشدار امنیتی: این قطعه طلا در سامانه کشوری به عنوان مفقودی یا مسروقه ثبت گردیده است. خرید، فروش یا ذوب این قطعه غیرقانونی می‌باشد.',
        isAuthentic: true,
        isStolen: true
      };
    }

    return {
      found: true,
      passport,
      events,
      verificationMessage: `اصالت این قطعه با شناسه ${passport.uid} و عیار رسمی ${passport.certifiedFineness} در آزمایشگاه ری‌گیری ${passport.assayLabName} مورد تأیید ۱۰۰٪ دیدار گلد است.`,
      isAuthentic: true,
      isStolen: false
    };
  }
}

export const k06Storage = new K06StorageEngine();
