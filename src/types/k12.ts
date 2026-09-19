/**
 * Didar Gold Platform - Kernel Domain K12 Types
 * Agents, Territories & Field Operations (عامل، قلمرو و عملیات میدانی)
 * 
 * Manages field escort officers, territory jurisdictions, scheduled retailer visits,
 * geofenced check-ins, portable showcase bags, and act-as proxy transactions.
 */

export type AgentDutyStatus =
  | 'on_duty'     // در حال شیفت عملیاتی و آماده اعزام
  | 'on_route'    // در حال تردد در مسیر مأموریت و راسته بازار
  | 'checked_in'  // حاضر در محل گالری طلافروشی خرده‌فروش
  | 'standby'     // آماده‌باش در شعبه یا خزانه منطقه‌ای
  | 'off_duty';   // پایان شیفت کاری / مرخصی

export type SecurityClearanceLevel =
  | 'armed_escort'    // مأمور اسکورت ویژه مسلح (مجوز ناجا)
  | 'high_value'      // کارشناس ارشد ترابری طلای وزین و شمش
  | 'standard'        // نماینده میدانی ویزیت و معرفی کالکشن
  | 'probationary';   // مأمور آزمایشی تحت نظارت سرپرست

export type VisitPurpose =
  | 'collection_showcase'     // معرفی کالکشن و مدل‌های نوآورانه
  | 'consignment_audit'       // ممیزی فیزیکی و شمارش ویترین امانی
  | 'proxy_order'             // اقدام به نیابت و ثبت سفارش در محل
  | 'relationship_management' // تحکیم روابط صنفی، حل تعارض و تمدید سقف
  | 'catalog_drop';           // تحویل کاتالوگ فیزیکی و هدایای مناسبتی

export type VisitStatus =
  | 'scheduled'     // برنامه‌ریزی‌شده در تقویم ویزیت
  | 'in_transit'    // مأمور در مسیر مراجعه به طلافروشی
  | 'checked_in'    // ثبت حضور با تطابق موقعیت مکانی (ژئوفنسینگ)
  | 'completed'     // ویزیت پایان‌یافته همراه با گزارش مأموریت
  | 'missed'        // عدم حضور صاحب‌جواز یا بسته بودن گالری
  | 'cancelled';    // لغو شده به دستور سرپرست یا خرده‌فروش

export type TerritoryRiskLevel =
  | 'standard'        // منطقه عادی با ضریب ایمنی پایدار
  | 'high_density'    // راسته پرتراکم با گردش بالا (نیازمند مراقبت مضاعف)
  | 'armored_escort'; // منطقه خاص تجاری نیازمند اسکورت حفاظتی دو نفره

export type AgentRole =
  | 'buyer_rep'       // مأمور خریدار / ویزیتور و ثبت سفارش طلا
  | 'carrier_delivery'; // مأمور حمل و تحویل فیزیکی طلا / کالارسان

export interface FieldAgent {
  id: string;
  partyId?: string; // کلید خارجی ارجاع به شخص در دامنه K01 (Party-Role Architecture)
  code: string; // e.g. AGT-1403-01
  fullNameFa: string;
  role?: AgentRole; // مأمور خریدار یا مأمور حمل کالا
  roleFa?: string;
  isActive?: boolean; // وضعیت فعال / غیرفعال بودن مأمور
  nationalCode: string;
  phoneNumber: string;
  mobileNumber: string;
  emergencyContactFa: string;
  emergencyPhone: string;
  securityClearance: SecurityClearanceLevel;
  securityClearanceFa: string;
  guarantorBondAmountToman: number; // مبلغ وثیقه ملکی یا سفته ثبتی
  guarantorDocReference: string;
  dutyStatus: AgentDutyStatus;
  dutyStatusFa: string;
  assignedTerritoryId: string;
  assignedTerritoryNameFa: string;
  assignedBagId?: string;
  assignedBagCode?: string;
  assignedBagWeightGrams?: number;
  currentLat?: number;
  currentLng?: number;
  vehicleTypeFa: string; // مثلاً موتورسیکلت مجهز به باکس ضددیلم، خودروی زرهی امنیتی
  vehiclePlateNumber: string;
  trustScore: number; // 0 - 100
  completedVisitsCount: number;
  conversionRatePercent: number; // درصد ویزیت‌های منجر به ثبت سفارش
  totalProxySalesGoldGrams: number;
  todayVisitsCount: number;
  lastCheckInTimeFa?: string;
  avatarUrl?: string;
}

export interface TerritoryStore {
  id: string;
  tradeNameFa: string;
  ownerFa: string;
  unionCode: string;
  addressFa: string;
  phone: string;
  lat?: number;
  lng?: number;
  tierFa?: string;
  lastVisitDateFa?: string;
  lastVisitStatusFa?: string;
  lastInvoiceStatus?: 'invoiced' | 'no_invoice' | 'never_visited';
  totalInvoicedGoldGrams?: number;
}

export interface Territory {
  id: string;
  code: string; // e.g. TER-TEH-BAZAR
  titleFa: string;
  provinceFa: string;
  cityFa: string;
  marketDistrictsFa: string; // مثلاً راسته زرگرها، سبزه میدان، بازار امیر
  leadAgentId: string;
  leadAgentNameFa: string;
  backupAgentId?: string;
  backupAgentNameFa?: string;
  activeRetailersCount: number;
  stores?: TerritoryStore[];
  dailyVisitCapacity: number;
  riskLevel: TerritoryRiskLevel;
  riskLevelFa: string;
  monthlyGoldQuotaGrams: number;
  achievedMonthlyGoldGrams: number;
  geofenceRadiusMeters: number;
}

export type VisitAttendanceStatus = 'visited' | 'not_visited' | 'pending';
export type VisitInvoiceStatus = 'invoiced' | 'no_invoice' | 'not_applicable' | 'pending';

export interface FieldVisit {
  id: string;
  visitCode: string; // e.g. VST-1403-882
  retailerId: string;
  retailerTradeNameFa: string;
  retailerOwnerFa: string;
  retailerUnionCode: string;
  retailerAddressFa: string;
  retailerPhone: string;
  retailerLat: number;
  retailerLng: number;
  agentId: string;
  agentNameFa: string;
  territoryId: string;
  territoryNameFa: string;
  scheduledDateFa: string; // e.g. 1403/08/25
  scheduledTimeSlotFa: string; // e.g. 10:00 الی 11:30
  purpose: VisitPurpose;
  purposeFa: string;
  status: VisitStatus;
  statusFa: string;
  
  // فیلدهای شفاف حضور و رفت/نرفت مأمور
  attendanceStatus?: VisitAttendanceStatus; // 'visited' (رفت) | 'not_visited' (نرفت) | 'pending' (در انتظار)
  attendanceStatusFa?: string;
  notVisitedReasonFa?: string; // علت نرفتن مأمور (بسته بودن گالری، لغو، عدم حضور صاحب جواز)
  
  // فیلدهای شفاف وضعیت فاکتور و معامله طلا
  invoiceStatus?: VisitInvoiceStatus; // 'invoiced' (فاکتور صادر شد) | 'no_invoice' (بدون فاکتور) | 'pending'
  invoiceStatusFa?: string;
  invoiceNumber?: string; // شماره فاکتور یا پیش‌فاکتور فروش طلا
  invoiceGoldGrams?: number; // وزن طلای فاکتور شده
  noInvoiceReasonFa?: string; // علت عدم صدور فاکتور (عدم توافق اجرت، موجودی کافی، نوسان قیمت)
  
  checkInTimeFa?: string;
  checkOutTimeFa?: string;
  isGeofenceVerified: boolean;
  distanceMetersFromStore?: number;
  retailerFeedbackScore?: number; // 1 to 5
  retailerNotesFa?: string;
  agentOutcomeNotesFa?: string;
  proxyOrderId?: string;
  proxyOrderGoldGrams?: number;
  showcaseInterestLevel?: 'very_high' | 'high' | 'neutral' | 'low';
  carriedBagSealIntact?: boolean;
}

export interface MobileShowcaseItem {
  id: string;
  skuCode: string;
  titleFa: string;
  categoryFa: string;
  caratFa: string;
  sampleWeightGrams: number;
  wagePerGramToman: number;
  isCarriedInBag: boolean;
  highDemandBadge: boolean;
  notesFa: string;
}

export interface ProxyOrderItem {
  skuId: string;
  skuCode: string;
  titleFa: string;
  quantity: number;
  estimatedWeightGrams: number;
  wageTomanPerGram: number;
}

export interface ProxyOrderDraft {
  id?: string;
  retailerId: string;
  retailerTradeNameFa: string;
  retailerOwnerFa: string;
  agentId: string;
  agentNameFa: string;
  visitId?: string;
  items: ProxyOrderItem[];
  totalWeightGrams: number;
  totalEstimatedToman: number;
  retailerOtpCode: string;
  isOtpVerified: boolean;
  notesFa: string;
  orderTimestampFa: string;
}

export interface K12SummaryMetrics {
  totalAgentsCount: number;
  onDutyAgentsCount: number;
  onRouteAgentsCount: number;
  totalTerritoriesCount: number;
  todayScheduledVisits: number;
  todayCompletedVisits: number;
  todayProxyOrdersCount: number;
  todayProxyGoldWeightGrams: number;
  territoryCoveragePercent: number;
  geofenceComplianceRatePercent: number;
}

export interface K12DataPayload {
  summary: K12SummaryMetrics;
  agents: FieldAgent[];
  territories: Territory[];
  visits: FieldVisit[];
  showcaseItems: MobileShowcaseItem[];
}
