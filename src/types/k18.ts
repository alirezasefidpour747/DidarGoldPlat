/**
 * Didar Gold Platform - Kernel Domain K18 Types
 * After-sales Cases, Returns, Repairs, Workshop Routing & Warranty Fulfillment
 */

export type K18ServiceCategory =
  | 'repair_hardware'       // تعمیر اتصالات، جوش لیزری، تعویض قفل و مدبر
  | 'gem_setting'           // مخراج‌کاری و جایگزینی سنگ یا نگین افتاده
  | 'sizing_alteration'      // تغییر سایز انگشتر، النگو یا دستبند
  | 'surface_refinishing'   // آبکاری رودیوم، زرد، رزگلد، پرداخت و شستشوی اولتراسونیک
  | 'manufacturing_defect'  // نقص ریخته‌گری یا شکست ساختاری کارخانه
  | 'return_refund'         // مرجوعی قطعی کالا و استرداد وجه
  | 'exchange';             // تعویض با مدل دیگر در دوره طلایی

export type K18TicketStage =
  | 'intake_received'       // پذیرش اولیه در گالری و صدور قبض امانی
  | 'routed_to_workshop'    // ارسال به کارگاه تخصصی با بیمه ترابری
  | 'in_repair'             // در دست اقدام در کارگاه توسط استادکار
  | 'qc_assay_inspection'   // کنترل کیفی، ری‌گیری و توزین مجدد دقیق
  | 'ready_for_pickup'      // تحویل شده به گالری و ارسال پیامک به مشتری
  | 'completed_delivered'   // تحویل قطعی به مشتری و تسویه حساب
  | 'rejected_cancelled';   // لغو یا عدم امکان تعمیر فنی

export type K18WarrantyStatus =
  | 'active_covered'        // تحت پوشش گارانتی طلایی (رایگان)
  | 'expired'               // گارانتی منقضی شده (محاسبه هزینه آزاد)
  | 'voided_tampered'       // ابطال گارانتی به دلیل دستکاری یا ضربه شدید
  | 'no_warranty';          // فاقد کارت گارانتی معتبر

export interface K18TimelineEvent {
  id: string;
  stage: K18TicketStage;
  titleFa: string;
  descriptionFa: string;
  timestampFa: string;
  operatorNameFa: string;
}

export interface K18GemReplacement {
  stoneType: string;
  carats: number;
  count: number;
  colorClarity?: string;
  isOriginalReplaced: boolean;
  costToman: number;
}

export interface K18WorkshopAssignment {
  workshopId: string;
  workshopNameFa: string;
  masterJewelerNameFa: string;
  dispatchedDateFa?: string;
  estimatedCompletionDateFa: string;
  actualCompletionDateFa?: string;
  transitInsuranceTrackingCode?: string;
}

export interface K18WeightAudit {
  intakeGrossWeightGrams: number;
  intakeTareGrams: number;
  intakeNetGoldGrams: number;
  returnGrossWeightGrams?: number;
  returnTareGrams?: number;
  returnNetGoldGrams?: number;
  goldWeightDeltaGrams?: number;  // مثبت: افزایش طلا (افزودن حلقه)، منفی: کسر طلا (سوهان‌کاری)
  goldDeltaCostToman?: number;    // محاسبه ریالی بر اساس مظنه روز
  assayCertificateNo?: string;
  scaleCalibrationVerified: boolean;
}

export interface K18FinancialSettlement {
  laborCostToman: number;
  partsCostToman: number;
  goldDeltaCostToman: number;
  gemCostToman: number;
  totalServiceValueToman: number;
  warrantyCoverageDiscountToman: number;
  customerPayableToman: number;
  paymentStatus: 'settled_paid' | 'covered_by_warranty' | 'pending_payment';
  paymentReference?: string;
}

export interface ServiceTicket {
  id: string;
  ticketNumber: string;         // e.g. SRV-1404-0101
  receiptCode: string;          // کد پیگیری پیامکی مشتری
  itemUid: string;              // UID یکتا پاسپورت طلای دیدار
  itemTitleFa: string;
  karatFa: string;
  karatPurity: number;          // e.g. 0.750
  
  // اطلاعات مصرف‌کننده
  consumerInfo: {
    fullName: string;
    mobile: string;
    nationalId: string;
    city: string;
  };

  // اطلاعات پذیرش
  intakeDetails: {
    intakeDateFa: string;
    intakeTimestamp: string;
    intakeConditionNotesFa: string;
    intakeStaffNameFa: string;
    retailerNameFa: string;
    retailerBranchId: string;
    priority: 'normal' | 'express' | 'urgent_vip';
  };

  // گارانتی
  warranty: {
    status: K18WarrantyStatus;
    warrantyNumber?: string;
    warrantyClaimId?: string;
    coverageDescriptionFa?: string;
    isFreeService: boolean;
  };

  // طبقه‌بندی و وضعیت
  serviceCategory: K18ServiceCategory;
  serviceCategoryFa: string;
  stage: K18TicketStage;
  stageFa: string;

  // کارگاه
  workshop?: K18WorkshopAssignment;

  // اوزان و متالورژی
  weightAudit: K18WeightAudit;

  // تعویض سنگ
  gemDetails?: K18GemReplacement;

  // مالی
  financial: K18FinancialSettlement;

  // تاریخچه
  timeline: K18TimelineEvent[];

  // بازخورد مشتری
  customerFeedback?: {
    rating: number; // 1-5
    commentFa?: string;
    submittedDateFa?: string;
  };
}

export interface RepairWorkshop {
  id: string;
  nameFa: string;
  licenseNumber: string;
  managerNameFa: string;
  contactPhone: string;
  cityFa: string;
  addressFa: string;
  specialtiesFa: string[];
  activeTicketsCount: number;
  completedTicketsCount: number;
  averageRating: number;
  slaDays: number;
  status: 'active' | 'busy' | 'suspended';
}

export interface K18Metrics {
  totalActiveTickets: number;
  underWarrantyCount: number;
  inWorkshopCount: number;
  readyForPickupCount: number;
  completedDeliveredCount: number;
  returnsRefundCount: number;
  averageTurnaroundDays: number;
  customerSatisfactionRate: number;
  totalGoldHandledGrams: number;
  totalWarrantySavingsToman: number;
}

export interface K18AuditLog {
  id: string;
  ticketId: string;
  ticketNumber: string;
  action: string;
  actionFa: string;
  performedBy: string;
  timestampFa: string;
  detailsFa: string;
}

export interface K18DataPayload {
  metrics: K18Metrics;
  tickets: ServiceTicket[];
  workshops: RepairWorkshop[];
  auditLogs: K18AuditLog[];
}
