/**
 * Didar Gold Platform - Kernel Domain K08 Storage Engine
 * Supply Intake, Physical Verification, Assay Tolerance & Warehouse Receipting
 */

import {
  IntakeShipment,
  WarehouseReceipt,
  K08Metrics,
  K08DataPayload,
  IntakeStatus,
  AssayTestRecord
} from '../src/types/k08.js';
import { k07Storage } from './storage-k07.js';

export class K08StorageEngine {
  private shipments: IntakeShipment[] = [];
  private receipts: WarehouseReceipt[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    this.shipments = [
      {
        id: 'intake-01',
        intakeCode: 'INTAKE-2026-0810',
        supplierId: 'sup-01',
        supplierNameFa: 'مجتمع صنایع طلا و جواهر زرین تهران',
        supplierCode: 'SUP-TH-01',
        hallmarkCode: 'T-9842',
        referenceAgreementId: 'agr-01',
        referenceAgreementNo: 'AGR-2026-010',

        deliveryMethod: 'armored_courier',
        deliveryMethodFa: 'خودرو زرهی اسکورت مسلح',
        courierName: 'پیک ویژه امین ترابر زرین (سید مجید حسینی)',
        courierNationalCodeMasked: '007***8912',
        courierVehiclePlateMasked: 'ایران ۱۱ - ۷۸۲ ج ۵۵',

        securitySealNo: 'SEAL-ZR-88419',
        isSecuritySealIntact: true,

        declaredTotalWeightGrams: 4850.0,
        scaleTotalWeightGrams: 4850.2,
        weightDeltaGrams: 0.2,
        scaleCalibrationSerial: 'METTLER-TOLEDO-XP504-2026/02',
        scaleModelFa: 'ترازوی تحلیلی آزمایشگاهی متلر تولیدو ۰.۰۰۱ گرم',
        scaleWeighingTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۱۰:۱۵',

        itemsCount: 3,
        totalPieces: 140,
        batchItems: [
          {
            id: 'b-01',
            itemTitleFa: 'زنجیر فیگارو و کارتیه فابریک ۱۸ عیار',
            categoryFa: 'زنجیر ماشینی',
            quantityPieces: 60,
            declaredWeightGrams: 2200.0,
            scaleWeightGrams: 2200.1,
            weightDeltaGrams: 0.1,
            nominalKarat: '18k_750',
            hallmarkVisualFound: true,
            hallmarkCode: 'T-9842',
            visualQualityPassed: true
          },
          {
            id: 'b-02',
            itemTitleFa: 'النگوی فنری تراش خورده سایز ۲ و ۳',
            categoryFa: 'النگو تراش',
            quantityPieces: 50,
            declaredWeightGrams: 1650.0,
            scaleWeightGrams: 1650.05,
            weightDeltaGrams: 0.05,
            nominalKarat: '18k_750',
            hallmarkVisualFound: true,
            hallmarkCode: 'T-9842',
            visualQualityPassed: true
          },
          {
            id: 'b-03',
            itemTitleFa: 'پلاک و مدال اسلیمی نقش‌برجسته',
            categoryFa: 'مدال و پلاک',
            quantityPieces: 30,
            declaredWeightGrams: 1000.0,
            scaleWeightGrams: 1000.05,
            weightDeltaGrams: 0.05,
            nominalKarat: '18k_750',
            hallmarkVisualFound: true,
            hallmarkCode: 'T-9842',
            visualQualityPassed: true
          }
        ],

        status: 'accepted',
        statusFa: 'قبولی قطعی و صدور قبض انبار',

        quarantineBinCode: 'VAULT-BIN-A04',
        quarantineEntryTimestampFa: '۱۴۰۵/۰۲/۱۵ ساعت ۱۰:۳۰',

        assayTest: {
          testId: 'ASSAY-2026-901',
          testDateFa: '۱۴۰۵/۰۲/۱۵ ساعت ۱۱:۴۵',
          testingMethod: 'xrf_spectrometry',
          testingMethodFa: 'طیف‌سنجی فلوئورسانس اشعه ایکس (XRF)',
          testedFineness: 750.4,
          nominalFineness: 750.0,
          finenessDiscrepancyPpm: 0.4,
          isWithinUnionTolerance: true,
          testingLabOrDeviceFa: 'اسپکترومتر FISCHERSCOPE X-RAY XAN 250',
          technicianName: 'مهندس فرشید کبیری (متالورژیست ارشد)',
          notes: 'عیار بالاتر از استاندارد، بدون فلزات آلیاژی غیرمجاز مانند کادمیم یا نیکل.'
        },

        decisionNotesFa: 'محموله از لحاظ انطباق عیار، سلامت قفل‌ها و تلورانس وزنی در رده استاندارد ممتاز تأیید گردید.',
        decidedByOfficerName: 'مرتضی اعتمادی (مدیر خزانه و پذیرش)',
        decisionDateFa: '۱۴۰۵/۰۲/۱۵ ساعت ۱۲:۳۰',
        warehouseReceiptId: 'rec-01',
        warehouseReceiptNo: 'WREC-2026-8801',
        createdAt: '2026-05-05T06:30:00.000Z'
      },
      {
        id: 'intake-02',
        intakeCode: 'INTAKE-2026-0812',
        supplierId: 'sup-02',
        supplierNameFa: 'کارگاه ریخته‌گری دقیق نقش جهان اصفهان',
        supplierCode: 'SUP-ES-02',
        hallmarkCode: 'E-4410',
        referenceAgreementId: 'agr-02',
        referenceAgreementNo: 'AGR-2026-012',

        deliveryMethod: 'authorized_workshop_rep',
        deliveryMethodFa: 'تحویل حضوری نماینده رسمی کارگاه',
        courierName: 'حاج محمود کلاهدوزان (امین کارگاه)',
        courierNationalCodeMasked: '128***4401',

        securitySealNo: 'SEAL-NJ-77192',
        isSecuritySealIntact: true,

        declaredTotalWeightGrams: 3120.0,
        scaleTotalWeightGrams: 3115.4,
        weightDeltaGrams: -4.6,
        scaleCalibrationSerial: 'METTLER-TOLEDO-XP504-2026/02',
        scaleModelFa: 'ترازوی تحلیلی آزمایشگاهی متلر تولیدو ۰.۰۰۱ گرم',
        scaleWeighingTimestampFa: '۱۴۰۵/۰۲/۱۶ ساعت ۰۹:۴۰',

        itemsCount: 2,
        totalPieces: 85,
        batchItems: [
          {
            id: 'b-04',
            itemTitleFa: 'انگشتر و گوشواره فیلیگران اسلیمی ریخته‌گری',
            categoryFa: 'ریخته‌گری سنتی',
            quantityPieces: 45,
            declaredWeightGrams: 1800.0,
            scaleWeightGrams: 1797.2,
            weightDeltaGrams: -2.8,
            nominalKarat: '18k_750',
            hallmarkVisualFound: true,
            hallmarkCode: 'E-4410',
            visualQualityPassed: true
          },
          {
            id: 'b-05',
            itemTitleFa: 'دستبند النگویی مشبک قفل‌دار',
            categoryFa: 'دستبند ریخته‌گری',
            quantityPieces: 40,
            declaredWeightGrams: 1320.0,
            scaleWeightGrams: 1318.2,
            weightDeltaGrams: -1.8,
            nominalKarat: '18k_750',
            hallmarkVisualFound: true,
            hallmarkCode: 'E-4410',
            visualQualityPassed: true
          }
        ],

        status: 'accepted_with_penalty',
        statusFa: 'قبولی مشروط با کسر مغایرت وزنی از طلای امانی',

        quarantineBinCode: 'VAULT-BIN-B02',
        quarantineEntryTimestampFa: '۱۴۰۵/۰۲/۱۶ ساعت ۱۰:۰۰',

        assayTest: {
          testId: 'ASSAY-2026-904',
          testDateFa: '۱۴۰۵/۰۲/۱۶ ساعت ۱۰:۴۵',
          testingMethod: 'xrf_spectrometry',
          testingMethodFa: 'طیف‌سنجی فلوئورسانس اشعه ایکس (XRF)',
          testedFineness: 750.1,
          nominalFineness: 750.0,
          finenessDiscrepancyPpm: 0.1,
          isWithinUnionTolerance: true,
          testingLabOrDeviceFa: 'اسپکترومتر FISCHERSCOPE X-RAY XAN 250',
          technicianName: 'مهندس فرشید کبیری',
          notes: 'عیار انطباق کامل با استاندارد ۱۸ عیار دارد.'
        },

        penaltyGoldGramsDeducted: 4.6,
        decisionNotesFa: 'به علت کسر ۴.۶ گرم نسبت به بارنامه کارگاه، مقدار مغایرت از حساب طلای امانی کارگاه کسر گردید و ۳۱۱۵.۴ گرم وارد موجودی شد.',
        decidedByOfficerName: 'مرتضی اعتمادی (مدیر خزانه و پذیرش)',
        decisionDateFa: '۱۴۰۵/۰۲/۱۶ ساعت ۱۱:۳۰',
        warehouseReceiptId: 'rec-02',
        warehouseReceiptNo: 'WREC-2026-8802',
        createdAt: '2026-05-06T06:00:00.000Z'
      },
      {
        id: 'intake-03',
        intakeCode: 'INTAKE-2026-0814',
        supplierId: 'sup-03',
        supplierNameFa: 'صنایع النگو و زیورآلات یزد گوهر',
        supplierCode: 'SUP-YZ-03',
        hallmarkCode: 'Y-1209',
        referenceAgreementId: 'agr-03',
        referenceAgreementNo: 'AGR-2026-015',

        deliveryMethod: 'armored_courier',
        deliveryMethodFa: 'خودرو زرهی اسکورت مسلح',
        courierName: 'حفاظت لجستیک امن یزد (محسن فلاح‌زاده)',
        courierNationalCodeMasked: '443***1102',
        courierVehiclePlateMasked: 'ایران ۵۴ - ۳۱۹ س ۴۲',

        securitySealNo: 'SEAL-YG-99104',
        isSecuritySealIntact: true,

        declaredTotalWeightGrams: 5400.0,
        scaleTotalWeightGrams: 5400.1,
        weightDeltaGrams: 0.1,
        scaleCalibrationSerial: 'METTLER-TOLEDO-XP504-2026/02',
        scaleModelFa: 'ترازوی تحلیلی آزمایشگاهی متلر تولیدو ۰.۰۰۱ گرم',
        scaleWeighingTimestampFa: '۱۴۰۵/۰۲/۱۷ ساعت ۰۹:۱۵',

        itemsCount: 2,
        totalPieces: 210,
        batchItems: [
          {
            id: 'b-06',
            itemTitleFa: 'النگوی لوکس دامله و تراش لیزری سه رنگ',
            categoryFa: 'النگو دامله',
            quantityPieces: 150,
            declaredWeightGrams: 3900.0,
            scaleWeightGrams: 3900.08,
            weightDeltaGrams: 0.08,
            nominalKarat: '18k_750',
            hallmarkVisualFound: true,
            hallmarkCode: 'Y-1209',
            visualQualityPassed: true
          },
          {
            id: 'b-07',
            itemTitleFa: 'النگوی بچگانه سبک فنری بدون درز',
            categoryFa: 'النگو بچگانه',
            quantityPieces: 60,
            declaredWeightGrams: 1500.0,
            scaleWeightGrams: 1500.02,
            weightDeltaGrams: 0.02,
            nominalKarat: '18k_750',
            hallmarkVisualFound: true,
            hallmarkCode: 'Y-1209',
            visualQualityPassed: true
          }
        ],

        status: 'in_quarantine',
        statusFa: 'در قرنطینه آزمایشگاهی / در انتظار نتیجه نهایی عیارسنجی',

        quarantineBinCode: 'VAULT-Q-02',
        quarantineEntryTimestampFa: '۱۴۰۵/۰۲/۱۷ ساعت ۰۹:۴۵',

        createdAt: '2026-05-07T05:45:00.000Z'
      },
      {
        id: 'intake-04',
        intakeCode: 'INTAKE-2026-0815',
        supplierId: 'sup-04',
        supplierNameFa: 'گروه تولیدی النگو و فیوژن آذین تبریز',
        supplierCode: 'SUP-TB-04',
        hallmarkCode: 'TB-7761',
        referenceAgreementId: 'agr-04',
        referenceAgreementNo: 'AGR-2026-018',

        deliveryMethod: 'registered_secure_post',
        deliveryMethodFa: 'پست امنیتی امانات گران‌بها',
        courierName: 'مامور اسکورت پست ویژه طلا (رامین نجفی)',
        courierNationalCodeMasked: '137***5588',

        securitySealNo: 'SEAL-AZ-55102',
        isSecuritySealIntact: true,

        declaredTotalWeightGrams: 1850.0,
        scaleTotalWeightGrams: 0,
        weightDeltaGrams: 0,
        scaleCalibrationSerial: '',
        scaleModelFa: '',

        itemsCount: 1,
        totalPieces: 110,
        batchItems: [
          {
            id: 'b-08',
            itemTitleFa: 'آویزهای سبک لیزری و پلاک فیوژن',
            categoryFa: 'پلاک سبک',
            quantityPieces: 110,
            declaredWeightGrams: 1850.0,
            nominalKarat: '18k_750',
            hallmarkVisualFound: true,
            hallmarkCode: 'TB-7761',
            visualQualityPassed: true
          }
        ],

        status: 'security_verified',
        statusFa: 'پلمپ امنیتی تأیید شد / در صف توزین تحلیلی',
        createdAt: '2026-05-08T04:15:00.000Z'
      },
      {
        id: 'intake-05',
        intakeCode: 'INTAKE-2026-0805',
        supplierId: 'sup-05',
        supplierNameFa: 'کارگاه طراحی و ساخت مرصع‌کاری فردوس مشهد',
        supplierCode: 'SUP-KH-05',
        hallmarkCode: 'M-3390',

        deliveryMethod: 'authorized_workshop_rep',
        deliveryMethodFa: 'تحویل حضوری نماینده کارگاه',
        courierName: 'اکبر شمس‌الدینی (سرپرست کارگاه)',
        courierNationalCodeMasked: '094***1123',

        securitySealNo: 'SEAL-FD-33211',
        isSecuritySealIntact: true,

        declaredTotalWeightGrams: 950.0,
        scaleTotalWeightGrams: 948.5,
        weightDeltaGrams: -1.5,
        scaleCalibrationSerial: 'METTLER-TOLEDO-XP504-2026/02',
        scaleModelFa: 'ترازوی تحلیلی آزمایشگاهی متلر تولیدو ۰.۰۰۱ گرم',
        scaleWeighingTimestampFa: '۱۴۰۵/۰۲/۱۰ ساعت ۱۱:۰۰',

        itemsCount: 1,
        totalPieces: 25,
        batchItems: [
          {
            id: 'b-09',
            itemTitleFa: 'انگشترهای مرصع با نگین فیروزه نیشابور',
            categoryFa: 'مرصع کاری',
            quantityPieces: 25,
            declaredWeightGrams: 950.0,
            scaleWeightGrams: 948.5,
            weightDeltaGrams: -1.5,
            nominalKarat: '18k_750',
            hallmarkVisualFound: true,
            hallmarkCode: 'M-3390',
            visualQualityPassed: false,
            defectsObservedFa: 'تخلخل در پایه‌های چنگک نگین و عیار زیر حد مجاز اتحادیه'
          }
        ],

        status: 'rejected',
        statusFa: 'مردود و عودت محموله به علت عدم انطباق عیار',

        assayTest: {
          testId: 'ASSAY-2026-890',
          testDateFa: '۱۴۰۵/۰۲/۱۰ ساعت ۱۲:۱۵',
          testingMethod: 'dual_certified',
          testingMethodFa: 'آزمون دوگانه (XRF + کوپلاسیون رسمی)',
          testedFineness: 746.8,
          nominalFineness: 750.0,
          finenessDiscrepancyPpm: -3.2,
          isWithinUnionTolerance: false,
          testingLabOrDeviceFa: 'ری‌گیری رسمی ممتاز تهران (گواهی شماره ۹۸۸۲)',
          technicianName: 'مهندس وحید دادرس',
          notes: 'عیار خوانده‌شده ۷۴۶.۸ است که از حد آستانه استاندارد اتحادیه (۷۴۹.۰) کمتر بوده و تخلف عیار محسوب می‌شود.'
        },

        decisionNotesFa: 'محموله به علت کسری عیار ۳.۲ در هزار و ایراد در نگین‌نشانی عودت گردید و پرونده تخلف در K07 ثبت شد.',
        decidedByOfficerName: 'مرتضی اعتمادی (مدیر خزانه)',
        decisionDateFa: '۱۴۰۵/۰۲/۱۰ ساعت ۱۳:۰۰',
        createdAt: '2026-05-01T07:00:00.000Z'
      }
    ];

    this.receipts = [
      {
        id: 'rec-01',
        receiptNumber: 'WREC-2026-8801',
        intakeShipmentId: 'intake-01',
        intakeCode: 'INTAKE-2026-0810',
        supplierId: 'sup-01',
        supplierNameFa: 'مجتمع صنایع طلا و جواهر زرین تهران',
        hallmarkCode: 'T-9842',
        dateFa: '۱۴۰۵/۰۲/۱۵',
        totalPiecesReceived: 140,
        certifiedGoldFineness: 750.4,
        netGoldWeightGramsCredited: 4850.2,
        equivalentPureGold995Grams: 3656.9,
        consignmentBalancePreviousGrams: 8500.0,
        consignmentBalanceCurrentGrams: 3649.8,
        makingChargePayableToman: 582000000,
        receivingOfficerName: 'مرتضی اعتمادی',
        vaultLocationFa: 'خزانه مرکزی دیدار - صندوق شمش و مصنوع C-102',
        qrCodeVerificationUrl: 'https://didar.gold/verify/receipt/WREC-2026-8801',
        status: 'issued_confirmed',
        statusFa: 'رسید قطعی صادر و در خزانه انبارش شد'
      },
      {
        id: 'rec-02',
        receiptNumber: 'WREC-2026-8802',
        intakeShipmentId: 'intake-02',
        intakeCode: 'INTAKE-2026-0812',
        supplierId: 'sup-02',
        supplierNameFa: 'کارگاه ریخته‌گری دقیق نقش جهان اصفهان',
        hallmarkCode: 'E-4410',
        dateFa: '۱۴۰۵/۰۲/۱۶',
        totalPiecesReceived: 85,
        certifiedGoldFineness: 750.1,
        netGoldWeightGramsCredited: 3115.4,
        equivalentPureGold995Grams: 2346.7,
        consignmentBalancePreviousGrams: 6200.0,
        consignmentBalanceCurrentGrams: 3080.0,
        makingChargePayableToman: 436156000,
        receivingOfficerName: 'مرتضی اعتمادی',
        vaultLocationFa: 'خزانه مرکزی دیدار - صندوق مصنوعات هنری B-018',
        qrCodeVerificationUrl: 'https://didar.gold/verify/receipt/WREC-2026-8802',
        status: 'issued_confirmed',
        statusFa: 'رسید با کسر کسری بار صادر گردید'
      }
    ];

    // Ensure all seed shipments have both aliases and canonical fields initialized
    this.shipments.forEach((s) => this.enrichShipment(s));
  }

  private enrichShipment(s: IntakeShipment): IntakeShipment {
    s.shipmentNumber = s.shipmentNumber || s.intakeCode;
    const declWeight = Number(s.declaredTotalWeightGrams ?? s.declaredWeightGrams ?? 0);
    s.declaredTotalWeightGrams = declWeight;
    s.declaredWeightGrams = declWeight;

    const measuredW = Number(s.scaleTotalWeightGrams ?? s.measuredWeightGrams ?? 0);
    s.scaleTotalWeightGrams = measuredW;
    s.measuredWeightGrams = measuredW;

    const delta = Number(s.weightDeltaGrams ?? s.weightDiscrepancyGrams ?? (measuredW > 0 ? Number((measuredW - declWeight).toFixed(3)) : 0));
    s.weightDeltaGrams = delta;
    s.weightDiscrepancyGrams = delta;

    const pieces = Number(s.totalPieces ?? s.declaredPiecesCount ?? s.itemsCount ?? 1);
    s.totalPieces = pieces;
    s.declaredPiecesCount = pieces;
    s.itemsCount = s.itemsCount || s.batchItems?.length || 1;

    s.waybillTrackingNumber = s.waybillTrackingNumber || s.securitySealNo || 'WB-88291';
    s.sealedSecurityBagSerial = s.sealedSecurityBagSerial || s.securitySealNo;
    s.deliveryAgentName = s.deliveryAgentName || s.courierName;
    s.carrierName = s.carrierName || s.deliveryMethodFa;
    s.receivedAtJalali = s.receivedAtJalali || s.scaleWeighingTimestampFa || '۱۴۰۵/۰۲/۱۵ ساعت ۰۹:۳۰';
    s.weighingOfficer = s.weighingOfficer || (s.scaleTotalWeightGrams ? 'مهندس حسینیان (آزمایشگاه مرکزی)' : undefined);
    if (s.assayTest) {
      s.measuredFineness = s.measuredFineness ?? s.assayTest.testedFineness;
      s.declaredFineness = s.declaredFineness ?? s.assayTest.nominalFineness;
      s.finenessDiscrepancy = s.finenessDiscrepancy ?? s.assayTest.finenessDiscrepancyPpm;
      s.toleranceStatus = s.toleranceStatus ?? (s.assayTest.isWithinUnionTolerance ? 'within_standard_tolerance' : 'conditional_tolerance_fee');
    }
    return s;
  }

  public getAllData(): K08DataPayload {
    const metrics = this.calculateMetrics();
    return {
      shipments: this.shipments.map((s) => this.enrichShipment(s)),
      receipts: this.receipts,
      metrics
    };
  }

  public getShipmentById(id: string): IntakeShipment | undefined {
    const s = this.shipments.find((item) => item.id === id || item.intakeCode === id);
    return s ? this.enrichShipment(s) : undefined;
  }

  public getReceiptById(id: string): WarehouseReceipt | undefined {
    return this.receipts.find((r) => r.id === id || r.receiptNumber === id);
  }

  public registerShipment(payload: Partial<IntakeShipment>, actorName: string): IntakeShipment {
    const yearCode = new Date().getFullYear();
    const count = this.shipments.length + 1;
    const intakeCode = `INTAKE-${yearCode}-08${count < 10 ? '0' + count : count}`;

    const declaredWeight = Number(payload.declaredWeightGrams ?? payload.declaredTotalWeightGrams) || 0;
    const totalPieces = Number(payload.declaredPiecesCount ?? payload.totalPieces) || 1;

    const newShipment: IntakeShipment = {
      id: `intake-${Date.now()}`,
      intakeCode,
      supplierId: payload.supplierId || 'sup-01',
      supplierNameFa: payload.supplierNameFa || 'کارگاه تأمین‌کننده',
      supplierCode: payload.supplierCode || 'SUP-00',
      hallmarkCode: payload.hallmarkCode || 'T-0000',
      referenceAgreementId: payload.referenceAgreementId,
      referenceAgreementNo: payload.referenceAgreementNo,

      deliveryMethod: payload.deliveryMethod || 'armored_courier',
      deliveryMethodFa: payload.deliveryMethodFa || 'خودرو زرهی اسکورت مسلح',
      courierName: payload.courierName || 'مامور رسمی حمل طلا',
      courierNationalCodeMasked: payload.courierNationalCodeMasked || '001***9900',
      courierVehiclePlateMasked: payload.courierVehiclePlateMasked,

      securitySealNo: payload.securitySealNo || `SEAL-${Math.floor(10000 + Math.random() * 90000)}`,
      isSecuritySealIntact: payload.isSecuritySealIntact ?? true,

      declaredTotalWeightGrams: declaredWeight,
      declaredWeightGrams: declaredWeight,
      scaleTotalWeightGrams: 0,
      measuredWeightGrams: 0,
      weightDeltaGrams: 0,
      weightDiscrepancyGrams: 0,
      scaleCalibrationSerial: '',
      scaleModelFa: '',

      itemsCount: payload.batchItems?.length || 1,
      totalPieces,
      declaredPiecesCount: totalPieces,
      batchItems: payload.batchItems || [
        {
          id: `b-${Date.now()}`,
          itemTitleFa: 'محموله طلا و مصنوعات دریافتی',
          categoryFa: 'مصنوعات ۱۸ عیار',
          quantityPieces: totalPieces,
          declaredWeightGrams: declaredWeight,
          nominalKarat: '18k_750',
          hallmarkVisualFound: true,
          hallmarkCode: payload.hallmarkCode,
          visualQualityPassed: true
        }
      ],

      status: 'security_verified',
      statusFa: 'ثبت و بررسی اولیه پلمپ / در نوبت توزین',
      createdAt: new Date().toISOString(),
      notes: payload.notes
    };

    this.shipments.unshift(newShipment);
    return this.enrichShipment(newShipment);
  }

  public recordScaleWeighing(
    shipmentId: string,
    scaleWeightGrams: number,
    scaleCalibrationSerial: string,
    scaleModelFa: string,
    batchWeighings: { batchId: string; scaleWeightGrams: number }[],
    actorName: string
  ): IntakeShipment {
    const shipment = this.getShipmentById(shipmentId);
    if (!shipment) throw new Error(`محموله با شناسه ${shipmentId} یافت نشد.`);

    const sWeight = Number(scaleWeightGrams);
    shipment.scaleTotalWeightGrams = sWeight;
    shipment.measuredWeightGrams = sWeight;
    const delta = Number((sWeight - shipment.declaredTotalWeightGrams).toFixed(3));
    shipment.weightDeltaGrams = delta;
    shipment.weightDiscrepancyGrams = delta;
    shipment.scaleCalibrationSerial = scaleCalibrationSerial || 'METTLER-TOLEDO-XP504-2026/02';
    shipment.scaleModelFa = scaleModelFa || 'ترازوی تحلیلی آزمایشگاهی متلر تولیدو ۰.۰۰۱ گرم';
    shipment.scaleWeighingTimestampFa = new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date());

    if (batchWeighings && batchWeighings.length > 0) {
      shipment.batchItems = shipment.batchItems.map((item) => {
        const matching = batchWeighings.find((bw) => bw.batchId === item.id);
        if (matching) {
          const itemWeight = Number(matching.scaleWeightGrams);
          return {
            ...item,
            scaleWeightGrams: itemWeight,
            weightDeltaGrams: Number((itemWeight - item.declaredWeightGrams).toFixed(3))
          };
        }
        return item;
      });
    }

    shipment.status = 'weighed';
    shipment.statusFa = 'توزین تحلیلی انجام شد / در نوبت قرنطینه و ری‌گیری';

    return this.enrichShipment(shipment);
  }

  public moveToQuarantine(
    shipmentId: string,
    quarantineBinCode: string,
    actorName: string
  ): IntakeShipment {
    const shipment = this.getShipmentById(shipmentId);
    if (!shipment) throw new Error(`محموله با شناسه ${shipmentId} یافت نشد.`);

    shipment.quarantineBinCode = quarantineBinCode;
    shipment.quarantineEntryTimestampFa = new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date());

    shipment.status = 'in_quarantine';
    shipment.statusFa = `قرنطینه در گاوصندوق امن (${quarantineBinCode}) تا اتمام عیارسنجی`;

    return this.enrichShipment(shipment);
  }

  public recordAssayTest(
    shipmentId: string,
    testData: Partial<AssayTestRecord>,
    actorName: string
  ): IntakeShipment {
    const shipment = this.getShipmentById(shipmentId);
    if (!shipment) throw new Error(`محموله با شناسه ${shipmentId} یافت نشد.`);

    const testedFineness = Number(testData.testedFineness) || 750.0;
    const nominalFineness = Number(testData.nominalFineness) || 750.0;
    const discrepancy = Number((testedFineness - nominalFineness).toFixed(2));
    const isWithinTolerance = discrepancy >= -1.0; // حداکثر ۱ در هزار کسر عیار مجاز است (۷۴۹.۰)

    const assay: AssayTestRecord = {
      testId: `ASSAY-2026-${Math.floor(100 + Math.random() * 900)}`,
      testDateFa: new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(new Date()),
      testingMethod: testData.testingMethod || 'xrf_spectrometry',
      testingMethodFa:
        testData.testingMethod === 'fire_assay_cupellation'
          ? 'کوپلاسیون رسمی آزمایشگاهی (Fire Assay)'
          : testData.testingMethod === 'dual_certified'
          ? 'آزمون دوگانه XRF و کوپلاسیون'
          : 'طیف‌سنجی فلوئورسانس اشعه ایکس (XRF)',
      testedFineness,
      nominalFineness,
      finenessDiscrepancyPpm: discrepancy,
      isWithinUnionTolerance: isWithinTolerance,
      testingLabOrDeviceFa: testData.testingLabOrDeviceFa || 'اسپکترومتر آزمایشگاهی دیدار',
      technicianName: testData.technicianName || actorName || 'کارشناس متالورژی دیدار',
      notes: testData.notes
    };

    shipment.assayTest = assay;
    shipment.status = 'assay_tested';
    shipment.statusFa = isWithinTolerance
      ? `عیار انطباق دارد (${testedFineness}) / آماده تصمیم‌گیری پذیرش`
      : `هشدار عیار نامنطبق (${testedFineness}) / نیازمند بررسی هیئت پذیرش`;

    return this.enrichShipment(shipment);
  }

  public makeAcceptanceDecision(
    shipmentId: string,
    decision: 'accepted' | 'accepted_with_penalty' | 'rejected',
    notes: string,
    penaltyGoldGramsDeducted?: number,
    penaltyMakingChargeToman?: number,
    vaultLocationFa?: string,
    actorName: string = 'مرتضی اعتمادی (مدیر خزانه)'
  ): { shipment: IntakeShipment; receipt?: WarehouseReceipt } {
    const shipment = this.getShipmentById(shipmentId);
    if (!shipment) throw new Error(`محموله با شناسه ${shipmentId} یافت نشد.`);

    const nowFa = new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date());

    shipment.decisionNotesFa = notes;
    shipment.decidedByOfficerName = actorName;
    shipment.decisionDateFa = nowFa;

    if (decision === 'rejected') {
      shipment.status = 'rejected';
      shipment.statusFa = 'مردود و عودت محموله به کارگاه سازنده';
      return { shipment };
    }

    // Accepted or Accepted With Penalty -> Issue Formal Warehouse Receipt
    shipment.status = decision;
    shipment.statusFa =
      decision === 'accepted'
        ? 'قبولی قطعی و صدور قبض انبار طلا'
        : 'قبولی مشروط با اعمال کسر بار/جریمه در قبض انبار';

    if (penaltyGoldGramsDeducted) {
      shipment.penaltyGoldGramsDeducted = Number(penaltyGoldGramsDeducted);
    }
    if (penaltyMakingChargeToman) {
      shipment.penaltyMakingChargeToman = Number(penaltyMakingChargeToman);
    }

    const receiptYear = new Date().getFullYear();
    const receiptNum = `WREC-${receiptYear}-88${this.receipts.length + 10}`;

    const effectiveWeight =
      (shipment.scaleTotalWeightGrams || shipment.declaredTotalWeightGrams) -
      (shipment.penaltyGoldGramsDeducted || 0);

    const fineness = shipment.assayTest?.testedFineness || 750.0;
    const pureGold995Equivalent = Number(((effectiveWeight * (fineness / 1000)) / 0.995).toFixed(2));

    // Try to obtain supplier's previous consignment balance from K07
    let prevBalance = 8000.0;
    let currBalance = Math.max(0, prevBalance - effectiveWeight);

    const suppliersK07 = k07Storage.getAllData().suppliers;
    const k07Sup = suppliersK07.find((s) => s.id === shipment.supplierId);
    if (k07Sup) {
      prevBalance = k07Sup.currentConsignmentUtilizedGrams;
      currBalance = Math.max(0, prevBalance - effectiveWeight);
      // Adjust consignment balance in K07
      k07Storage.updateConsignmentBalance(shipment.supplierId, -effectiveWeight);
    }

    const estimatedMakingCharge = Math.round(effectiveWeight * 120000) - (shipment.penaltyMakingChargeToman || 0);

    const newReceipt: WarehouseReceipt = {
      id: `rec-${Date.now()}`,
      receiptNumber: receiptNum,
      intakeShipmentId: shipment.id,
      intakeCode: shipment.intakeCode,
      shipmentNumber: shipment.intakeCode,
      supplierId: shipment.supplierId,
      supplierNameFa: shipment.supplierNameFa,
      intakeType: shipment.intakeType || 'consignment',
      hallmarkCode: shipment.hallmarkCode,
      dateFa: nowFa.split(' ')[0],
      issuedAtJalali: nowFa,
      totalPiecesReceived: shipment.totalPieces,
      piecesCount: shipment.totalPieces,
      certifiedGoldFineness: fineness,
      acceptedFineness: fineness,
      netGoldWeightGramsCredited: Number(effectiveWeight.toFixed(3)),
      netGoldWeightGrams: Number(effectiveWeight.toFixed(3)),
      equivalentPureGold995Grams: pureGold995Equivalent,
      pureGoldWeight750Equivalent: Number(effectiveWeight.toFixed(3)),
      penaltyGoldGramsDeducted: shipment.penaltyGoldGramsDeducted || 0,
      consignmentBalancePreviousGrams: Number(prevBalance.toFixed(2)),
      consignmentBalanceCurrentGrams: Number(currBalance.toFixed(2)),
      makingChargePayableToman: Math.max(0, estimatedMakingCharge),
      receivingOfficerName: actorName,
      vaultLocationFa: vaultLocationFa || 'خزانه مرکزی دیدار - صندوق امانات ویژه شمش و مصنوعات A-01',
      securityVerificationHash: 'SHA256-DIDAR-' + Buffer.from(receiptNum).toString('hex').slice(0, 16).toUpperCase(),
      qrCodeVerificationUrl: `https://didar.gold/verify/receipt/${receiptNum}`,
      status: 'issued_confirmed',
      statusFa: 'قبض انبار رسمی طلا صادر و تراز امانی به‌روزرسانی شد'
    };

    this.receipts.unshift(newReceipt);

    shipment.warehouseReceiptId = newReceipt.id;
    shipment.warehouseReceiptNo = newReceipt.receiptNumber;

    return { shipment: this.enrichShipment(shipment), receipt: newReceipt };
  }

  private calculateMetrics(): K08Metrics {
    const total = this.shipments.length;
    const accepted = this.shipments.filter(
      (s) => s.status === 'accepted' || s.status === 'accepted_with_penalty' || s.status === 'accepted_with_tolerance'
    ).length;
    const inQuarantine = this.shipments.filter(
      (s) => s.status === 'in_quarantine' || s.status === 'weighed' || s.status === 'assay_tested'
    ).length;
    const rejected = this.shipments.filter((s) => s.status === 'rejected').length;

    let totalGrams = 0;
    let acceptedGrams = 0;
    let quarantineGrams = 0;
    let sumWeightDelta = 0;
    let sumAssayDelta = 0;
    let assayCount = 0;

    for (const s of this.shipments) {
      const weight = s.scaleTotalWeightGrams || s.declaredTotalWeightGrams || 0;
      totalGrams += weight;
      if (s.status === 'accepted' || s.status === 'accepted_with_penalty' || s.status === 'accepted_with_tolerance') {
        acceptedGrams += (s.scaleTotalWeightGrams || s.declaredTotalWeightGrams || 0);
      }
      if (s.status === 'in_quarantine' || s.status === 'weighed' || s.status === 'assay_tested') {
        quarantineGrams += weight;
      }
      if (s.scaleTotalWeightGrams && s.scaleTotalWeightGrams > 0) {
        sumWeightDelta += Math.abs(s.weightDeltaGrams || 0);
      }
      if (s.assayTest) {
        sumAssayDelta += s.assayTest.finenessDiscrepancyPpm;
        assayCount++;
      }
    }

    const avgDelta = total > 0 ? Number((sumWeightDelta / total).toFixed(3)) : 0;
    const avgAssay = assayCount > 0 ? Number((sumAssayDelta / assayCount).toFixed(2)) : 0;

    return {
      totalShipmentsCount: total,
      acceptedShipmentsCount: accepted,
      inQuarantineCount: inQuarantine,
      rejectedCount: rejected,
      todayReceivedGoldGrams: 5400.0,
      totalReceivedGoldGrams: Number(totalGrams.toFixed(2)),
      totalAcceptedGoldGrams: Number(acceptedGrams.toFixed(2)),
      issuedReceiptsCount: this.receipts.length,
      assayPassRatePercent: 98.4,
      totalWeightVarianceGrams: Number(sumWeightDelta.toFixed(3)),
      averageWeightDiscrepancyGrams: avgDelta,
      assayDiscrepancyAveragePpm: avgAssay,
      activeQuarantineWeightGrams: Number(quarantineGrams.toFixed(2))
    };
  }
}

export const k08Storage = new K08StorageEngine();
