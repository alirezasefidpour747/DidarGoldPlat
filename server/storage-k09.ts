/**
 * Didar Gold Platform - Kernel Domain K09 Storage Engine
 * Inventory, Multi-Vault Locations, Agent Field Bags & Custody Handover
 */

import {
  VaultLocation,
  AgentBag,
  InventoryItem,
  StockTransfer,
  VaultAuditRecord,
  K09Metrics,
  K09DataPayload,
  TransferStatus
} from '../src/types/k09.js';

export class K09StorageEngine {
  private locations: VaultLocation[] = [];
  private bags: AgentBag[] = [];
  private items: InventoryItem[] = [];
  private transfers: StockTransfer[] = [];
  private audits: VaultAuditRecord[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Vault Locations
    this.locations = [
      {
        id: 'vlt-01',
        code: 'VLT-TH-CENTRAL',
        nameFa: 'خزانه فوق‌امنیتی مرکزی دیدار - تهران (بازار بزرگ)',
        vaultType: 'central_vault',
        vaultTypeFa: 'خزانه مرکزی فوق‌امنیتی',
        cityFa: 'تهران',
        provinceFa: 'تهران',
        addressFa: 'تهران، بازار بزرگ، سبزه میدان، مجتمع تخصصی خزانه‌داری دیدار، طبقه منفی ۲',
        securityLevelFa: 'سطح A+ (ضد دیلم، عایق بتن حرارتی، پایش لرزه‌نگاری و اسکنر عنبیه)',
        totalCapacityGrams: 500000, // ۵۰۰ کیلوگرم
        currentGoldWeightGrams: 142560.45,
        totalPiecesCount: 3840,
        custodianNameFa: 'حاج مصطفی زرین‌قلم (مدیر کل خزانه‌داری)',
        custodianPhone: '۰۲۱-۵۵۸۹۶۰۰۱',
        lastAuditDateFa: '۱۴۰۵/۰۲/۱۰',
        compartmentsCount: 48,
        isActive: true
      },
      {
        id: 'vlt-02',
        code: 'VLT-ISF-HUB',
        nameFa: 'خزانه هاب منطقه‌ای اصفهان (نقش‌جهان)',
        vaultType: 'regional_hub',
        vaultTypeFa: 'هاب منطقه‌ای و انبار توزیع استانی',
        cityFa: 'اصفهان',
        provinceFa: 'اصفهان',
        addressFa: 'اصفهان، خیابان چهارباغ عباسی، مجتمع الماس اصفهان، خزانه اختصاصی دیدار',
        securityLevelFa: 'سطح A (سیستم اعلام اطفاء گاز FM200 و حفاظت مسلح ۲۴ ساعته)',
        totalCapacityGrams: 200000, // ۲۰۰ کیلوگرم
        currentGoldWeightGrams: 48920.8,
        totalPiecesCount: 1420,
        custodianNameFa: 'مهندس بهزاد نایینی',
        custodianPhone: '۰۳۱-۳۲۲۸۱۱۰۴',
        lastAuditDateFa: '۱۴۰۵/۰۲/۰۲',
        compartmentsCount: 24,
        isActive: true
      },
      {
        id: 'vlt-03',
        code: 'VLT-TBZ-HUB',
        nameFa: 'خزانه هاب منطقه‌ای آذربایجان - تبریز',
        vaultType: 'regional_hub',
        vaultTypeFa: 'هاب منطقه‌ای شمال‌غرب',
        cityFa: 'تبریز',
        provinceFa: 'آذربایجان شرقی',
        addressFa: 'تبریز، راسته بازار طلافروشان (امیر)، سرای جواهریان، خزانه دیدار',
        securityLevelFa: 'سطح A (قفل‌های ترکیبی ضد انفجار و پایش تصویری دید در شب)',
        totalCapacityGrams: 150000,
        currentGoldWeightGrams: 31240.2,
        totalPiecesCount: 890,
        custodianNameFa: 'مهدی جواهریان تبریزی',
        custodianPhone: '۰۴۱-۳۵۲۶۴۱۸۰',
        lastAuditDateFa: '۱۴۰۵/۰۱/۲۵',
        compartmentsCount: 18,
        isActive: true
      },
      {
        id: 'vlt-04',
        code: 'VLT-TH-QUARANTINE',
        nameFa: 'گاوصندوق ویژه قرنطینه و پذیرش K08 تهران',
        vaultType: 'quarantine_assay_vault',
        vaultTypeFa: 'گاوصندوق قرنطینه پذیرش و ری‌گیری',
        cityFa: 'تهران',
        provinceFa: 'تهران',
        addressFa: 'تهران، سبزه میدان، آزمایشگاه مرکزی عیارسنجی دیدار',
        securityLevelFa: 'سطح B+ (پلمپ سربی دوطرفه و دوربین اختصاصی قفسه‌ها)',
        totalCapacityGrams: 50000,
        currentGoldWeightGrams: 7850.5,
        totalPiecesCount: 220,
        custodianNameFa: 'دکتر پیمان متالورژیان (سرپرست آزمایشگاه)',
        custodianPhone: '۰۲۱-۵۵۸۹۶۰۱۵',
        lastAuditDateFa: '۱۴۰۵/۰۲/۱۴',
        compartmentsCount: 8,
        isActive: true
      }
    ];

    // 2. Agent Field Bags (کیف‌های همراه ویزیتورها و شوکیس‌های سیار)
    this.bags = [
      {
        id: 'bag-01',
        bagCode: 'BAG-TH-01',
        bagTitleFa: 'کیف ضدسرقت هوشمند ویزیتور شماره ۱ (بازار بزرگ)',
        assignedAgentId: 'agent-01',
        assignedAgentNameFa: 'سهراب اخوان کرمانی',
        agentNationalIdMasked: '۰۰۶***۷۸۲۱',
        agentPhone: '۰۹۱۲۱۸۴۹۲۱۵',
        assignedTerritoryFa: 'راسته زرگران بازار بزرگ، چهارراه استانبول و طالقانی',
        status: 'in_field',
        statusFa: 'در حال گشت میدانی و ویزیت گالری‌ها',
        securityBagSerial: 'SMART-SAFE-2026-X41',
        electronicLockStatus: 'locked',
        gpsBatteryPercent: 94,
        currentLocationLatLong: '35.6742° N, 51.4188° E (خیابان ۱۵ خرداد)',
        lastPingTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۱۱:۴۲',
        maxWeightCapacityGrams: 10000, // ۱۰ کیلوگرم
        currentWeightGrams: 6420.35,
        piecesCount: 165,
        activeHandoverReceiptNo: 'HND-2026-041',
        notes: 'مجهز به کپسول رنگ‌آمیزی غیرقابل پاک شدن در صورت سرقت و دکمه هشدار خاموش SOS.'
      },
      {
        id: 'bag-02',
        bagCode: 'BAG-TH-02',
        bagTitleFa: 'کیف ضدسرقت هوشمند ویزیتور شماره ۲ (شمال تهران)',
        assignedAgentId: 'agent-02',
        assignedAgentNameFa: 'امیرحسین سپهرمنش',
        agentNationalIdMasked: '۰۴۵***۳۳۱۲',
        agentPhone: '۰۹۱۲۷۷۴۱۸۲۰',
        assignedTerritoryFa: 'گالری‌های تجریش، الهیه، فرشته و پالادیوم زعفرانیه',
        status: 'in_field',
        statusFa: 'در حال گشت میدانی و ویزیت گالری‌ها',
        securityBagSerial: 'SMART-SAFE-2026-X88',
        electronicLockStatus: 'locked',
        gpsBatteryPercent: 88,
        currentLocationLatLong: '35.7981° N, 51.4230° E (میدان تجریش)',
        lastPingTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۱۱:۴۵',
        maxWeightCapacityGrams: 8000,
        currentWeightGrams: 4850.12,
        piecesCount: 92,
        activeHandoverReceiptNo: 'HND-2026-044',
        notes: 'شامل سرویس‌های سنگین لوکس ۱۸ عیار و ست‌های الماس نشان.'
      },
      {
        id: 'bag-03',
        bagCode: 'BAG-ISF-01',
        bagTitleFa: 'کیف ویزیتور هاب اصفهان شماره ۱',
        assignedAgentId: 'agent-03',
        assignedAgentNameFa: 'مسعود شیخ‌بهایی',
        agentNationalIdMasked: '۱۲۸***۹۰۱۴',
        agentPhone: '۰۹۱۳۲۰۰۴۱۱۸',
        assignedTerritoryFa: 'بازار قیصریه، خیابان شیخ بهایی و مجتمع کوثر',
        status: 'vault_locked',
        statusFa: 'مستقر و قفل‌شده در گاوصندوق پایگاه اصفهان',
        securityBagSerial: 'SMART-SAFE-2026-ISF09',
        electronicLockStatus: 'locked',
        gpsBatteryPercent: 100,
        currentLocationLatLong: '32.6577° N, 51.6775° E (خزانه اصفهان)',
        lastPingTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۰۸:۰۰',
        maxWeightCapacityGrams: 7000,
        currentWeightGrams: 3120.0,
        piecesCount: 78,
        activeHandoverReceiptNo: 'HND-2026-039',
        notes: 'شارژ باتری کامل، آماده خروج برای شیفت بعدازظهر.'
      },
      {
        id: 'bag-04',
        bagCode: 'BAG-TBZ-01',
        bagTitleFa: 'کیف ویزیتور هاب تبریز شماره ۱',
        assignedAgentId: 'agent-04',
        assignedAgentNameFa: 'یاشار نوبری',
        agentNationalIdMasked: '۱۳۷***۱۱۵۰',
        agentPhone: '۰۹۱۴۱۱۵۸۰۳۰',
        assignedTerritoryFa: 'راسته بازار امیر و سنگ‌فرش تربیت تبریز',
        status: 'in_transit',
        statusFa: 'در حال انتقال تحت اسکورت امنیتی',
        securityBagSerial: 'SMART-SAFE-2026-TBZ04',
        electronicLockStatus: 'locked',
        gpsBatteryPercent: 91,
        currentLocationLatLong: '38.0800° N, 46.2919° E',
        lastPingTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۱۱:۳۰',
        maxWeightCapacityGrams: 8000,
        currentWeightGrams: 5120.8,
        piecesCount: 110,
        activeHandoverReceiptNo: 'HND-2026-048',
        notes: 'تحت اسکورت مامور حراست به مقصد گالری زرین تبریز.'
      }
    ];

    // 3. Physical Inventory Items (اقلام فیزیکی با ردیابی شناسنامه و مکان)
    this.items = [
      {
        id: 'item-01',
        uid: 'UID-2026-GLD-8821',
        titleFa: 'سرویس تمام تراش طلای البرز ۱۸ عیار بدون نگین',
        categoryFa: 'سرویس طلا',
        karatFa: '۱۸ عیار (۷۵۰)',
        nominalFineness: 750.0,
        testedFineness: 750.3,
        scaleWeightGrams: 42.65,
        pureGold995EquivalentGrams: 32.18,
        hallmarkCode: 'T-9842',
        supplierId: 'sup-01',
        supplierNameFa: 'مجتمع صنایع طلا و جواهر زرین تهران',
        intakeReceiptNo: 'WREC-2026-8804',
        currentLocationId: 'vlt-01',
        currentLocationNameFa: 'خزانه مرکزی دیدار تهران (صندوقچه A-04)',
        currentLocationType: 'vault',
        custodyStatus: 'in_vault',
        custodyStatusFa: 'موجود در گاوصندوق خزانه',
        custodianOfficerNameFa: 'حاج مصطفی زرین‌قلم',
        qrCodeScanPayload: 'https://didar.gold/passport/UID-2026-GLD-8821',
        lastMovedDateFa: '۱۴۰۵/۰۲/۱۰',
        estimatedValueToman: 383850000
      },
      {
        id: 'item-02',
        uid: 'UID-2026-GLD-8822',
        titleFa: 'النگوی دامله ریخته‌گری طرح اسلیمی زرین سایز ۳',
        categoryFa: 'النگو',
        karatFa: '۱۸ عیار (۷۵۰)',
        nominalFineness: 750.0,
        testedFineness: 750.1,
        scaleWeightGrams: 28.4,
        pureGold995EquivalentGrams: 21.41,
        hallmarkCode: 'T-9842',
        supplierId: 'sup-01',
        supplierNameFa: 'مجتمع صنایع طلا و جواهر زرین تهران',
        intakeReceiptNo: 'WREC-2026-8804',
        currentLocationId: 'bag-01',
        currentLocationNameFa: 'کیف ضدسرقت ویزیتور ۱ (سهراب اخوان)',
        currentLocationType: 'bag',
        custodyStatus: 'assigned_to_bag',
        custodyStatusFa: 'در کیف ویزیتور و عرضه میدانی',
        assignedBagCode: 'BAG-TH-01',
        custodianOfficerNameFa: 'سهراب اخوان کرمانی',
        qrCodeScanPayload: 'https://didar.gold/passport/UID-2026-GLD-8822',
        lastMovedDateFa: '۱۴۰۵/۰۲/۱۵ ساعت ۰۹:۰۰',
        estimatedValueToman: 255600000
      },
      {
        id: 'item-03',
        uid: 'UID-2026-GLD-8823',
        titleFa: 'زنجیر کارتیر دست‌ساز فیگارو با بافت تخت ۳.۵ میلی‌متر',
        categoryFa: 'زنجیر طلا',
        karatFa: '۱۸ عیار (۷۵۰)',
        nominalFineness: 750.0,
        testedFineness: 750.4,
        scaleWeightGrams: 56.12,
        pureGold995EquivalentGrams: 42.34,
        hallmarkCode: 'T-9842',
        supplierId: 'sup-01',
        supplierNameFa: 'مجتمع صنایع طلا و جواهر زرین تهران',
        intakeReceiptNo: 'WREC-2026-8804',
        currentLocationId: 'bag-01',
        currentLocationNameFa: 'کیف ضدسرقت ویزیتور ۱ (سهراب اخوان)',
        currentLocationType: 'bag',
        custodyStatus: 'assigned_to_bag',
        custodyStatusFa: 'در کیف ویزیتور و عرضه میدانی',
        assignedBagCode: 'BAG-TH-01',
        custodianOfficerNameFa: 'سهراب اخوان کرمانی',
        qrCodeScanPayload: 'https://didar.gold/passport/UID-2026-GLD-8823',
        lastMovedDateFa: '۱۴۰۵/۰۲/۱۵ ساعت ۰۹:۰۰',
        estimatedValueToman: 505080000
      },
      {
        id: 'item-04',
        uid: 'UID-2026-GLD-8824',
        titleFa: 'نیم‌ست گل‌رز فیوژن فوق‌سبک مهندسی با گوشواره و مدال',
        categoryFa: 'نیم‌ست',
        karatFa: '۱۸ عیار (۷۵۰)',
        nominalFineness: 750.0,
        testedFineness: 749.8,
        scaleWeightGrams: 18.25,
        pureGold995EquivalentGrams: 13.75,
        hallmarkCode: 'E-4491',
        supplierId: 'sup-02',
        supplierNameFa: 'کارگاه ریخته‌گری و زرگری نقش‌جهان',
        intakeReceiptNo: 'WREC-2026-8805',
        currentLocationId: 'vlt-02',
        currentLocationNameFa: 'خزانه هاب منطقه‌ای اصفهان (صندوق ۲)',
        currentLocationType: 'vault',
        custodyStatus: 'in_vault',
        custodyStatusFa: 'موجود در گاوصندوق خزانه',
        custodianOfficerNameFa: 'مهندس بهزاد نایینی',
        qrCodeScanPayload: 'https://didar.gold/passport/UID-2026-GLD-8824',
        lastMovedDateFa: '۱۴۰۵/۰۲/۱۱',
        estimatedValueToman: 164250000
      },
      {
        id: 'item-05',
        uid: 'UID-2026-GLD-8825',
        titleFa: 'شمش استاندارد طلای آب‌شده دیدار ۱۰۰ گرم عیار ۷۵۰ پلمپ اتحادیه',
        categoryFa: 'شمش طلا',
        karatFa: '۱۸ عیار (۷۵۰)',
        nominalFineness: 750.0,
        testedFineness: 750.0,
        scaleWeightGrams: 100.0,
        pureGold995EquivalentGrams: 75.38,
        hallmarkCode: 'DIDAR-BAR-01',
        supplierId: 'sup-01',
        supplierNameFa: 'خزانه مرکزی دیدار',
        intakeReceiptNo: 'WREC-2026-8800',
        currentLocationId: 'vlt-01',
        currentLocationNameFa: 'خزانه مرکزی دیدار تهران (بخش شمش شمش B-01)',
        currentLocationType: 'vault',
        custodyStatus: 'in_vault',
        custodyStatusFa: 'موجود در گاوصندوق خزانه',
        custodianOfficerNameFa: 'حاج مصطفی زرین‌قلم',
        qrCodeScanPayload: 'https://didar.gold/passport/UID-2026-GLD-8825',
        lastMovedDateFa: '۱۴۰۵/۰۲/۰۱',
        estimatedValueToman: 900000000
      },
      {
        id: 'item-06',
        uid: 'UID-2026-GLD-8826',
        titleFa: 'سرویس الماس‌نشان یاقوت کبود و برلیان پایه طلای سفید ۱۸ عیار',
        categoryFa: 'سرویس جواهر',
        karatFa: '۱۸ عیار (۷۵۰)',
        nominalFineness: 750.0,
        testedFineness: 750.2,
        scaleWeightGrams: 68.8,
        pureGold995EquivalentGrams: 51.9,
        hallmarkCode: 'T-9842',
        supplierId: 'sup-01',
        supplierNameFa: 'مجتمع صنایع طلا و جواهر زرین تهران',
        intakeReceiptNo: 'WREC-2026-8804',
        currentLocationId: 'bag-02',
        currentLocationNameFa: 'کیف ضدسرقت ویزیتور ۲ (امیرحسین سپهرمنش)',
        currentLocationType: 'bag',
        custodyStatus: 'assigned_to_bag',
        custodyStatusFa: 'در کیف ویزیتور و عرضه میدانی',
        assignedBagCode: 'BAG-TH-02',
        custodianOfficerNameFa: 'امیرحسین سپهرمنش',
        qrCodeScanPayload: 'https://didar.gold/passport/UID-2026-GLD-8826',
        lastMovedDateFa: '۱۴۰۵/۰۲/۱۵ ساعت ۰۹:۳۰',
        estimatedValueToman: 960000000
      }
    ];

    // 4. Stock Transfers (حواله‌های جابجایی بین‌انبار، تجهیز کیف و ترانزیت تحت اسکورت)
    this.transfers = [
      {
        id: 'trf-01',
        transferNumber: 'TRF-2026-9041',
        sourceType: 'vault',
        sourceLocationId: 'vlt-01',
        sourceLocationNameFa: 'خزانه مرکزی دیدار تهران',
        destinationType: 'bag',
        destinationLocationId: 'bag-01',
        destinationLocationNameFa: 'کیف ضدسرقت ویزیتور ۱ (سهراب اخوان)',
        transferReasonFa: 'تجهیز شیفت صبح کیف ویزیتور بازار بزرگ تهران با مصنوعات النگو و زنجیر',
        itemsCount: 45,
        totalWeightGrams: 1850.45,
        itemUids: ['UID-2026-GLD-8822', 'UID-2026-GLD-8823'],
        securitySealSerial: 'SEAL-SEC-99014',
        courierOrEscortNameFa: 'محمود سلطانی (مامور حراست و ترابری امن)',
        escortNationalIdMasked: '۰۴۵***۹۹۲۱',
        dispatchTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۰۸:۴۵',
        arrivalEstimatedTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۰۹:۰۰',
        actualArrivalTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۰۸:۵۸',
        status: 'delivered_verified',
        statusFa: 'تحویل نهایی شد و با ترازوی دیجیتال تطبیق خورد',
        dispatchedByOfficerNameFa: 'حاج مصطفی زرین‌قلم',
        receivedByOfficerNameFa: 'سهراب اخوان کرمانی',
        measuredWeightAtDestinationGrams: 1850.45,
        weightDeltaGrams: 0.0,
        notes: 'شمارش قطعات فیزیکی توسط امین خزانه و ویزیتور انجام و امضای دیجیتال ثبت شد.'
      },
      {
        id: 'trf-02',
        transferNumber: 'TRF-2026-9042',
        sourceType: 'vault',
        sourceLocationId: 'vlt-01',
        sourceLocationNameFa: 'خزانه مرکزی دیدار تهران',
        destinationType: 'vault',
        destinationLocationId: 'vlt-02',
        destinationLocationNameFa: 'خزانه هاب منطقه‌ای اصفهان',
        transferReasonFa: 'تغذیه موجودی هاب استانی اصفهان به مناسبت جشنواره بهاره صنف طلا',
        itemsCount: 180,
        totalWeightGrams: 12500.0,
        itemUids: ['UID-2026-GLD-8824'],
        securitySealSerial: 'SEAL-ARMOR-2026-44',
        courierOrEscortNameFa: 'ناوگان خودرو زرهی بانک ملی با اسکورت دو نفره مسلح',
        escortNationalIdMasked: '۰۰۴***۸۸۱۰',
        dispatchTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۰۶:۰۰',
        arrivalEstimatedTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۱۳:۰۰',
        status: 'in_transit',
        statusFa: 'در حال ترانزیت جاده‌ای تحت پایش ماهواره‌ای زنده',
        dispatchedByOfficerNameFa: 'حاج مصطفی زرین‌قلم',
        notes: 'حرکت از تهران ساعت ۰۶:۰۰، پلمپ هوشمند متصل به سیستم دزدگیر ماهواره‌ای.'
      },
      {
        id: 'trf-03',
        transferNumber: 'TRF-2026-9043',
        sourceType: 'vault',
        sourceLocationId: 'vlt-04',
        sourceLocationNameFa: 'گاوصندوق قرنطینه آزمایشگاه K08 تهران',
        destinationType: 'vault',
        destinationLocationId: 'vlt-01',
        destinationLocationNameFa: 'خزانه مرکزی دیدار تهران',
        transferReasonFa: 'ورود قطعی محموله تأییدشده عیارسنجی مجتمع زرین پس از صدور قبض انبار WREC-8804',
        itemsCount: 140,
        totalWeightGrams: 4850.2,
        itemUids: ['UID-2026-GLD-8821'],
        securitySealSerial: 'SEAL-LAB-8812',
        courierOrEscortNameFa: 'مامور پذیرش داخلی آزمایشگاه (حسین اسدی)',
        escortNationalIdMasked: '۰۰۷***۲۲۰۱',
        dispatchTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۱۰:۳۰',
        arrivalEstimatedTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۱۰:۴۵',
        actualArrivalTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۱۰:۴۰',
        status: 'delivered_verified',
        statusFa: 'تحویل خزانه مرکزی شد و به موجودی قابل تخصیص اضافه گردید',
        dispatchedByOfficerNameFa: 'دکتر پیمان متالورژیان',
        receivedByOfficerNameFa: 'حاج مصطفی زرین‌قلم',
        measuredWeightAtDestinationGrams: 4850.2,
        weightDeltaGrams: 0.0,
        notes: 'انتقال داخلی بین آزمایشگاه و خزانه با تأیید دو سرپرست.'
      }
    ];

    // 5. Vault & Bag Audits (انبارگردانی‌های ادواری و تطبیق تراز فیزیکی با سیستم)
    this.audits = [
      {
        id: 'aud-01',
        auditNumber: 'AUD-K09-2026-08',
        targetLocationId: 'vlt-01',
        targetLocationNameFa: 'خزانه فوق‌امنیتی مرکزی دیدار تهران',
        targetTypeFa: 'خزانه مرکزی',
        auditDateFa: '۱۴۰۵/۰۲/۱۰',
        auditorNameFa: 'بازرس ویژه اتحادیه طلا و کارشناس رسمی دادگستری (فرهاد نوبخت)',
        auditorNationalIdMasked: '۰۰۴***۶۶۱۱',
        expectedWeightGrams: 142560.45,
        physicalCountWeightGrams: 142560.45,
        discrepancyGrams: 0.0,
        expectedItemsCount: 3840,
        physicalCountItemsCount: 3840,
        reconciliationStatus: 'perfect_match',
        reconciliationStatusFa: 'انطباق ۱۰۰٪ و بدون کوچکترین مغایرت وزنی و عددی',
        inspectorNotesFa: 'تمام ۴۸ زونکن امنیتی با بارکد اسکنر بازشماری شد و باسکول آزمایشگاهی صفر خطا نشان داد.',
        signedOfficialMinutesUrl: 'https://didar.gold/audits/AUD-2026-08.pdf'
      },
      {
        id: 'aud-02',
        auditNumber: 'AUD-K09-2026-09',
        targetLocationId: 'bag-01',
        targetLocationNameFa: 'کیف ضدسرقت ویزیتور ۱ (سهراب اخوان)',
        targetTypeFa: 'کیف ویزیتور میدانی',
        auditDateFa: '۱۴۰۵/۰۲/۱۴',
        auditorNameFa: 'حاج مصطفی زرین‌قلم (مدیر خزانه‌داری)',
        auditorNationalIdMasked: '۰۰۵***۸۸۹۰',
        expectedWeightGrams: 6420.35,
        physicalCountWeightGrams: 6420.35,
        discrepancyGrams: 0.0,
        expectedItemsCount: 165,
        physicalCountItemsCount: 165,
        reconciliationStatus: 'perfect_match',
        reconciliationStatusFa: 'انطباق قطعی در پایان شیفت عصرگاهی',
        inspectorNotesFa: 'کیف در ساعت ۱۹:۰۰ تحویل خزانه شد؛ وزن فیزیکی با صورت‌جلسه صبح کاملاً همخوانی داشت.',
        signedOfficialMinutesUrl: 'https://didar.gold/audits/AUD-2026-09.pdf'
      }
    ];
  }

  public getAllData(): K09DataPayload {
    return {
      locations: this.locations,
      bags: this.bags,
      items: this.items,
      transfers: this.transfers,
      audits: this.audits,
      metrics: this.calculateMetrics()
    };
  }

  public getLocationById(id: string): VaultLocation | undefined {
    return this.locations.find((l) => l.id === id || l.code === id);
  }

  public getBagById(id: string): AgentBag | undefined {
    return this.bags.find((b) => b.id === id || b.bagCode === id);
  }

  public getItemById(id: string): InventoryItem | undefined {
    return this.items.find((item) => item.id === id || item.uid === id);
  }

  public getTransferById(id: string): StockTransfer | undefined {
    return this.transfers.find((t) => t.id === id || t.transferNumber === id);
  }

  public createTransfer(payload: Partial<StockTransfer>, actorName: string): StockTransfer {
    const year = new Date().getFullYear();
    const count = this.transfers.length + 1;
    const transferNumber = `TRF-${year}-90${count < 10 ? '0' + count : count}`;

    const newTransfer: StockTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber,
      sourceType: payload.sourceType || 'vault',
      sourceLocationId: payload.sourceLocationId || 'vlt-01',
      sourceLocationNameFa: payload.sourceLocationNameFa || 'خزانه مرکزی تهران',
      destinationType: payload.destinationType || 'bag',
      destinationLocationId: payload.destinationLocationId || 'bag-01',
      destinationLocationNameFa: payload.destinationLocationNameFa || 'کیف ویزیتور ۱',
      transferReasonFa: payload.transferReasonFa || 'تجهیز کیف ویزیتور جهت عرضه میدانی',
      itemsCount: Number(payload.itemsCount) || 1,
      totalWeightGrams: Number(payload.totalWeightGrams) || 100,
      itemUids: payload.itemUids || ['UID-2026-GLD-8821'],
      securitySealSerial: payload.securitySealSerial || `SEAL-${Math.floor(10000 + Math.random() * 90000)}`,
      courierOrEscortNameFa: payload.courierOrEscortNameFa || 'مامور ویژه ترابری امن دیدار',
      escortNationalIdMasked: payload.escortNationalIdMasked || '۰۰۷***۹۹۰۰',
      dispatchTimestampFa: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()),
      arrivalEstimatedTimestampFa: 'تقریباً ۳۰ دقیقه بعد',
      status: 'in_transit',
      statusFa: 'در حال ترانزیت امنیتی با رهگیری زنده',
      dispatchedByOfficerNameFa: actorName || 'حاج مصطفی زرین‌قلم',
      notes: payload.notes || 'حواله با رعایت پروتکل امنیتی دوامضایی صادر گردید.'
    };

    this.transfers.unshift(newTransfer);

    // Update location / bag weights
    if (newTransfer.sourceType === 'vault') {
      const srcVault = this.getLocationById(newTransfer.sourceLocationId);
      if (srcVault) {
        srcVault.currentGoldWeightGrams = Math.max(0, srcVault.currentGoldWeightGrams - newTransfer.totalWeightGrams);
      }
    }

    return newTransfer;
  }

  public confirmTransferArrival(
    transferId: string,
    measuredWeightAtDestinationGrams: number,
    receiverOfficerName: string,
    notes?: string
  ): StockTransfer {
    const trf = this.getTransferById(transferId);
    if (!trf) throw new Error(`حواله انتقال با شناسه ${transferId} یافت نشد.`);

    trf.status = 'delivered_verified';
    trf.statusFa = 'تحویل نهایی شد و وزن در مقصد بازسنجی گردید';
    trf.actualArrivalTimestampFa = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
    trf.receivedByOfficerNameFa = receiverOfficerName;
    trf.measuredWeightAtDestinationGrams = Number(measuredWeightAtDestinationGrams);
    trf.weightDeltaGrams = Number((trf.measuredWeightAtDestinationGrams - trf.totalWeightGrams).toFixed(3));
    if (notes) trf.notes = `${trf.notes || ''}\n[تأیید وصول: ${notes}]`;

    // Apply destination weight credit
    if (trf.destinationType === 'bag') {
      const bag = this.getBagById(trf.destinationLocationId);
      if (bag) {
        bag.currentWeightGrams = Number((bag.currentWeightGrams + trf.measuredWeightAtDestinationGrams).toFixed(2));
        bag.piecesCount += trf.itemsCount;
      }
    } else if (trf.destinationType === 'vault') {
      const vault = this.getLocationById(trf.destinationLocationId);
      if (vault) {
        vault.currentGoldWeightGrams = Number((vault.currentGoldWeightGrams + trf.measuredWeightAtDestinationGrams).toFixed(2));
        vault.totalPiecesCount += trf.itemsCount;
      }
    }

    return trf;
  }

  public createAgentBag(payload: Partial<AgentBag>, actorName: string): AgentBag {
    const code = payload.bagCode || `BAG-IR-${this.bags.length + 10}`;
    const newBag: AgentBag = {
      id: `bag-${Date.now()}`,
      bagCode: code,
      bagTitleFa: payload.bagTitleFa || `کیف ضدسرقت هوشمند کد ${code}`,
      assignedAgentId: payload.assignedAgentId || `agent-${Date.now().toString().slice(-4)}`,
      assignedAgentNameFa: payload.assignedAgentNameFa || 'ویزیتور جدید دیدار',
      agentNationalIdMasked: payload.agentNationalIdMasked || '۰۰۸***۱۱۴۰',
      agentPhone: payload.agentPhone || '۰۹۱۲۰۰۰۴۴۰۰',
      assignedTerritoryFa: payload.assignedTerritoryFa || 'تهران و حومه',
      status: 'vault_locked',
      statusFa: 'مستقر و قفل‌شده در گاوصندوق پایگاه',
      securityBagSerial: payload.securityBagSerial || `SAFE-2026-X${Math.floor(100 + Math.random() * 900)}`,
      electronicLockStatus: 'locked',
      gpsBatteryPercent: 100,
      lastPingTimestampFa: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()),
      maxWeightCapacityGrams: Number(payload.maxWeightCapacityGrams) || 8000,
      currentWeightGrams: 0,
      piecesCount: 0,
      notes: payload.notes || `توسط ${actorName} در سیستم ثبت و به ناوگان اضافه شد.`
    };

    this.bags.unshift(newBag);
    return newBag;
  }

  public recordVaultAudit(payload: Partial<VaultAuditRecord>, actorName: string): VaultAuditRecord {
    const year = new Date().getFullYear();
    const count = this.audits.length + 1;
    const auditNumber = `AUD-K09-${year}-${count < 10 ? '0' + count : count}`;

    const expected = Number(payload.expectedWeightGrams) || 0;
    const physical = Number(payload.physicalCountWeightGrams) || expected;
    const diff = Number((physical - expected).toFixed(3));

    const newAudit: VaultAuditRecord = {
      id: `aud-${Date.now()}`,
      auditNumber,
      targetLocationId: payload.targetLocationId || 'vlt-01',
      targetLocationNameFa: payload.targetLocationNameFa || 'خزانه مرکزی دیدار',
      targetTypeFa: payload.targetTypeFa || 'خزانه مرکزی',
      auditDateFa: payload.auditDateFa || new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short' }).format(new Date()),
      auditorNameFa: actorName || 'کارشناس رسمی بازرسی و انبارگردانی',
      auditorNationalIdMasked: payload.auditorNationalIdMasked || '۰۰۴***۶۶۱۱',
      expectedWeightGrams: expected,
      physicalCountWeightGrams: physical,
      discrepancyGrams: diff,
      expectedItemsCount: Number(payload.expectedItemsCount) || 1,
      physicalCountItemsCount: Number(payload.physicalCountItemsCount) || Number(payload.expectedItemsCount) || 1,
      reconciliationStatus: Math.abs(diff) === 0 ? 'perfect_match' : Math.abs(diff) <= 0.05 ? 'acceptable_dust_loss' : 'critical_discrepancy',
      reconciliationStatusFa:
        Math.abs(diff) === 0
          ? 'انطباق ۱۰۰٪ و بدون مغایرت'
          : Math.abs(diff) <= 0.05
          ? 'کسر ناچیز ذرات و خاکه طلا در حد مجاز'
          : 'مغایرت بحرانی و لزوم ارجاع به حراست',
      inspectorNotesFa: payload.inspectorNotesFa || 'انبارگردانی با حضور ناظران رسمی و توزین ترازوی کالیبره صورت پذیرفت.'
    };

    this.audits.unshift(newAudit);
    return newAudit;
  }

  private calculateMetrics(): K09Metrics {
    const vaultGrams = this.locations.reduce((acc, loc) => acc + loc.currentGoldWeightGrams, 0);
    const bagGrams = this.bags.reduce((acc, bag) => acc + bag.currentWeightGrams, 0);
    const inTransitGrams = this.transfers
      .filter((t) => t.status === 'in_transit')
      .reduce((acc, t) => acc + t.totalWeightGrams, 0);

    const totalNetworkGrams = Number((vaultGrams + bagGrams + inTransitGrams).toFixed(2));
    const goldRateTomanPerGram = 9000000; // تقریبی روز برای برآورد ارزش کل ریالی
    const totalNetworkValueToman = Math.round(totalNetworkGrams * goldRateTomanPerGram);

    const totalVaultsCount = this.locations.length;
    const totalActiveBagsCount = this.bags.filter((b) => b.status === 'in_field' || b.status === 'vault_locked').length;
    const totalInventoryPiecesCount = this.locations.reduce((acc, loc) => acc + loc.totalPiecesCount, 0) +
      this.bags.reduce((acc, bag) => acc + bag.piecesCount, 0);

    const pendingTransfersCount = this.transfers.filter((t) => t.status === 'in_transit').length;

    return {
      totalNetworkGoldGrams: totalNetworkGrams,
      totalNetworkValueToman,
      vaultStoredGoldGrams: Number(vaultGrams.toFixed(2)),
      agentBagsGoldGrams: Number(bagGrams.toFixed(2)),
      inTransitGoldGrams: Number(inTransitGrams.toFixed(2)),
      totalVaultsCount,
      totalActiveBagsCount,
      totalInventoryPiecesCount,
      pendingTransfersCount,
      inventoryAuditMatchRatePercent: 99.98
    };
  }
}

export const k09Storage = new K09StorageEngine();
