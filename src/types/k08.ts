/**
 * Didar Gold Platform - Kernel Domain K08 Types
 * Supply Intake & Acceptance: Consignment Physical Receipt, Dual Weighing, Assay Tolerances & Quarantine
 */

export type IntakeStatus =
  | 'registered'            // ثبت اظهارنامه و در راه / تحویل نگهبانی
  | 'security_verified'      // بررسی پلمپ امنیتی و احراز هویت پیک
  | 'weighed'                // توزین دقیق با ترازوی کالیبره
  | 'in_quarantine'          // قرنطینه در گاوصندوق تا اتمام ری‌گیری
  | 'assay_tested'           // نتیجه آزمون متالورژی XRF / کوپلاسیون
  | 'accepted'               // قبولی قطعی و ورود به موجودی رسمی
  | 'accepted_with_tolerance'// قبولی مشروط همراه با جریمه کسر بار یا اجرت
  | 'accepted_with_penalty'  // قبولی مشروط همراه با جریمه کسر بار یا اجرت
  | 'quarantine_hold'        // توقف در قرنطینه جهت بازرسی ثانویه
  | 'rejected';              // مردود و عودت به کارگاه سازنده

export enum ShipmentStatus {
  REGISTERED = 'registered',
  SECURITY_VERIFIED = 'security_verified',
  WEIGHED = 'weighed',
  IN_QUARANTINE = 'in_quarantine',
  ASSAY_TESTED = 'assay_tested',
  ACCEPTED = 'accepted',
  ACCEPTED_WITH_TOLERANCE = 'accepted_with_tolerance',
  ACCEPTED_WITH_PENALTY = 'accepted_with_penalty',
  QUARANTINE_HOLD = 'quarantine_hold',
  REJECTED = 'rejected'
}

export enum IntakeType {
  CONSIGNMENT = 'consignment',
  OUTRIGHT_PURCHASE = 'outright_purchase',
  MELTING_BAR = 'melted_bar',
  REPAIR_RETURN = 'repair_return'
}

export enum AssayToleranceStatus {
  WITHIN_STANDARD_TOLERANCE = 'within_standard_tolerance',
  CONDITIONAL_TOLERANCE_FEE = 'conditional_tolerance_fee',
  OUT_OF_TOLERANCE_CRITICAL = 'out_of_tolerance_critical'
}

export type DeliveryMethod =
  | 'armored_courier'        // خودرو حمل پول و طلای مجهز با اسکورت مسلح
  | 'authorized_workshop_rep'// تحویل حضوری توسط امین رسمی و نماینده کارگاه
  | 'registered_secure_post' // پست امنیتی رسمی با بیمه‌نامه طلا
  | 'didar_direct_pickup';   // دریافت مستقیم توسط ناوگان لجستیک امن دیدار

export type AssayTestingMethod =
  | 'xrf_spectrometry'       // طیف‌سنجی فلوئورسانس اشعه ایکس سریع
  | 'fire_assay_cupellation' // کوپلاسیون رسمی آزمایشگاهی اتحادیه
  | 'ultrasound_density'     // چگالی‌سنجی فراصوت
  | 'acid_scratch'           // محک سنتی سنگ و تیزاب
  | 'acid_touchstone'        // محک سنتی سنگ و تیزاب
  | 'dual_certified';        // آزمون دوگانه (XRF + کوپلاسیون رسمی)

export interface IntakeBatchItem {
  id: string;
  itemTitleFa: string;
  categoryFa: string;        // النگو، زنجیر، نیم‌ست، شمش و...
  quantityPieces: number;
  declaredWeightGrams: number;
  scaleWeightGrams?: number;
  weightDeltaGrams?: number;
  nominalKarat: string;      // 18k_750, 20k_833, 24k_995
  hallmarkVisualFound: boolean;
  hallmarkCode?: string;
  visualQualityPassed: boolean;
  defectsObservedFa?: string;
}

export interface BatchWeighingItem {
  id: string;
  itemId?: string;
  itemTitleFa?: string;
  scaleWeightGrams: number;
}

export interface AssayTestRecord {
  testId: string;
  testDateFa: string;
  testingMethod: AssayTestingMethod;
  testingMethodFa: string;
  testedFineness: number;    // e.g. 750.3, 749.1, 995.0
  nominalFineness: number;   // e.g. 750.0
  finenessDiscrepancyPpm: number; // e.g. +0.3 or -0.9 per thousand
  isWithinUnionTolerance: boolean;
  testingLabOrDeviceFa: string;
  technicianName: string;
  assayPacketNumber?: string;
  densityGcm3?: number;
  notes?: string;
}

export interface IntakeShipment {
  id: string;
  intakeCode: string;        // e.g. INTAKE-2026-0812
  shipmentNumber?: string;   // alias for intakeCode
  supplierId: string;
  supplierNameFa: string;
  supplierCode: string;
  hallmarkCode: string;
  referenceAgreementId?: string;
  referenceAgreementNo?: string;

  intakeType?: IntakeType | string;
  deliveryMethod: DeliveryMethod;
  deliveryMethodFa: string;
  courierName: string;
  deliveryAgentName?: string;
  carrierName?: string;
  courierNationalCodeMasked: string;
  courierVehiclePlateMasked?: string;
  waybillTrackingNumber?: string;
  sealedSecurityBagSerial?: string;

  securitySealNo: string;
  isSecuritySealIntact: boolean;

  declaredTotalWeightGrams: number;
  declaredWeightGrams?: number;  // alias
  scaleTotalWeightGrams?: number;
  measuredWeightGrams?: number; // alias
  weightDeltaGrams?: number;   // scale - declared
  weightDiscrepancyGrams?: number; // alias
  scaleCalibrationSerial?: string;
  scaleModelFa?: string;
  scaleWeighingTimestampFa?: string;
  weighingOfficer?: string;

  declaredFineness?: number;
  measuredFineness?: number;
  finenessDiscrepancy?: number;
  toleranceStatus?: AssayToleranceStatus | string;

  itemsCount: number;
  declaredPiecesCount?: number;
  totalPieces: number;
  batchItems: IntakeBatchItem[];

  status: IntakeStatus | ShipmentStatus;
  statusFa: string;

  quarantineBinCode?: string; // کد قفسه / گاوصندوق قرنطینه
  quarantineEntryTimestampFa?: string;

  assayTest?: AssayTestRecord;

  // Final Decision
  decisionNotesFa?: string;
  penaltyGoldGramsDeducted?: number;
  penaltyMakingChargeToman?: number;
  decidedByOfficerName?: string;
  decisionDateFa?: string;
  vaultLocationFa?: string;

  warehouseReceiptId?: string;
  warehouseReceiptNo?: string;

  createdAt: string;
  receivedAtJalali?: string;
  notes?: string;
}

export interface WarehouseReceipt {
  id: string;
  receiptNumber: string;     // e.g. WREC-2026-8804
  intakeShipmentId: string;
  intakeCode: string;
  shipmentNumber?: string;
  supplierId: string;
  supplierNameFa: string;
  intakeType?: string;
  hallmarkCode: string;
  dateFa: string;
  issuedAtJalali?: string;
  totalPiecesReceived: number;
  piecesCount?: number;
  certifiedGoldFineness: number;
  acceptedFineness?: number;
  netGoldWeightGramsCredited: number;
  netGoldWeightGrams?: number;
  equivalentPureGold995Grams: number;
  pureGoldWeight750Equivalent?: number;
  penaltyGoldGramsDeducted?: number;
  consignmentBalancePreviousGrams: number;
  consignmentBalanceCurrentGrams: number;
  makingChargePayableToman: number;
  receivingOfficerName: string;
  vaultLocationFa: string;
  securityVerificationHash?: string;
  qrCodeVerificationUrl: string;
  status: 'issued_confirmed' | 'cancelled';
  statusFa: string;
}

export interface K08Metrics {
  totalShipmentsCount: number;
  acceptedShipmentsCount: number;
  inQuarantineCount: number;
  rejectedCount: number;
  todayReceivedGoldGrams: number;
  totalReceivedGoldGrams: number;
  totalAcceptedGoldGrams: number;
  issuedReceiptsCount: number;
  assayPassRatePercent: number;
  totalWeightVarianceGrams: number;
  averageWeightDiscrepancyGrams: number;
  assayDiscrepancyAveragePpm: number;
  activeQuarantineWeightGrams: number;
}

export interface K08DataPayload {
  shipments: IntakeShipment[];
  receipts: WarehouseReceipt[];
  metrics: K08Metrics;
}
