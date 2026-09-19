/**
 * Didar Gold Platform - Kernel Domain K11 Types
 * Retailer Lifecycle & Commercial Access (چرخه خرده‌فروش و دسترسی تجاری)
 * 
 * Governs retail jewelry galleries, commercial tiering, trust scoring,
 * territory jurisdictions, allowed basket rules, credit caps, and purchase metrics.
 */

import { GoldCarat } from './k05.js';

export type CommercialTier =
  | 'diamond'   // الماس: برترین سطح، تخفیف اجرت حداکثر، سقف نامحدود/فوق‌ویژه
  | 'platinum'  // پلاتین: گالری‌های طراز اول مراکز استان، اعتبار بالا و تسویه ۳۰ روزه
  | 'gold'      // طلایی: گالری‌های معتبر با گردش مستمر، اعتبار متوسط و تسویه ۱۵ روزه
  | 'silver'    // نقره‌ای: خرده‌فروشان در حال رشد، تسویه ۷ روزه، سقف محدود
  | 'bronze';   // برنزی / آزمایشی: خرده‌فروشان تازه وارد، تسویه نقدی یا آبشده فوری

export type RetailerLifecycleStatus =
  | 'active_trading'     // فعال در چرخه سفارش و معامله
  | 'probationary'       // دوره آزمایشی ۳ ماهه با محدودیت سقف
  | 'under_review'       // تحت ممیزی سالانه یا بازنگری اعتباری
  | 'credit_suspended'   // تعلیق تجاری به علت تأخیر تسویه یا چک برگشتی
  | 'inactive'           // غیرفعال موقت به درخواست گالری‌دار
  | 'blacklisted';       // مسدود دائم به دلیل تخلف صنفی یا تقلب عیار

export type PaymentTenorDays = 0 | 7 | 15 | 30 | 45 | 60;

export interface RetailerAllowedBasket {
  permittedCarats: GoldCarat[];
  permittedCategoriesFa: string[];
  minOrderWeightGrams: number;
  maxOrderWeightGrams: number;
  bullionPurchaseAllowed: boolean; // شمش ۲۴ عیار
  customWorkshopOrderAllowed: boolean; // سفارش ساخت اختصاصی
  consignmentShowcaseAllowed: boolean; // استقرار کالای امانی در ویترین
  maxConsignmentWeightGrams: number; // حداکثر طلای امانی مجاز
}

export interface CommercialTerms {
  tier: CommercialTier;
  tierFa: string;
  trustScore: number; // 0 - 100
  wageDiscountPercent: number; // درصد تخفیف اجرت ساخت نسبت به بنکداری
  creditLimitToman: number; // سقف اعتبار ریالی
  creditLimitGoldGrams: number; // سقف اعتبار وزنی معادل طلای ۱۸ عیار
  currentUsedCreditToman: number; // اعتبار ریالی مصرف‌شده
  currentUsedCreditGoldGrams: number; // اعتبار وزنی طلا مصرف‌شده
  paymentTenorDays: PaymentTenorDays; // مهلت تسویه
  allowScrapGoldBarter: boolean; // پذیرش طلای متفرقه و آبشده جهت تسویه
  allowPostDatedCheque: boolean; // پذیرش چک صیادی موعددار
  guaranteeDocReference?: string; // شماره تعهدنامه ثبتی یا ضمانت‌نامه بانکی
  lastCreditReviewDateFa: string;
}

export interface RetailerTerritory {
  regionCode: string; // TEH, ISF, MSH, TBZ, SHZ, AHV
  regionTitleFa: string;
  marketDistrictFa: string; // مثلاً بازار بزرگ، سبزه میدان، راسته زرگرها
  assignedAgentId: string;
  assignedAgentNameFa: string;
  backupAgentNameFa?: string;
  scheduledVisitDayFa: string; // مثلاً دوشنبه‌ها نوبت صبح
  isExclusiveZone: boolean;
}

export interface PurchaseHistorySummary {
  lifetimeOrdersCount: number;
  lifetimeGoldWeightGrams: number;
  lifetimeTurnoverToman: number;
  yearToDateGoldWeightGrams: number;
  yearToDateTurnoverToman: number;
  onTimeSettlementRatePercent: number; // درصد تسویه‌های به‌موقع
  averageDaysToSettle: number;
  scrapGoldHandedOverGrams: number; // طلای آبشده تسویه‌شده
  disputedOrdersCount: number;
  lastOrderDateFa: string;
  lastOrderNumber: string;
}

export interface CommercialExceptionOverride {
  id: string;
  appliedDateFa: string;
  expiryDateFa: string;
  authorizedByFa: string;
  temporaryCreditBonusGoldGrams: number;
  temporaryCreditBonusToman: number;
  reasonFa: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface Retailer {
  id: string;
  code: string; // مثلاً RET-1403-010
  tradeNameFa: string; // نام تجاری تابلو طلافروشی
  ownerFullNameFa: string; // نام مالک و صاحب پروانه
  nationalCode: string; // کد ملی
  unionLicenseNumber: string; // شماره پروانه کسب اتحادیه طلا و جواهر
  guildRegistryCode: string; // شناسه یکتا صنف طلا
  phoneNumber: string;
  mobileNumber: string;
  provinceFa: string;
  cityFa: string;
  postalAddressFa: string;
  postalCode: string;
  establishmentYearFa: string;
  storeAreaSquareMeters: number;
  securityRatingFa: string; // درجه امنیت ویترین و گاوصندوق (A, B, C)
  status: RetailerLifecycleStatus;
  statusFa: string;
  statusReasonFa?: string;
  allowedBasket: RetailerAllowedBasket;
  commercialTerms: CommercialTerms;
  territory: RetailerTerritory;
  purchaseHistory: PurchaseHistorySummary;
  activeExceptions: CommercialExceptionOverride[];
  notesFa?: string;
  createdAtFa: string;
  updatedAtFa: string;
}

export interface K11SummaryMetrics {
  totalRetailersCount: number;
  activeTradingCount: number;
  probationaryCount: number;
  creditSuspendedCount: number;
  underReviewCount: number;
  totalActiveCreditLimitToman: number;
  totalUsedCreditToman: number;
  totalActiveGoldCreditGrams: number;
  totalUsedGoldCreditGrams: number;
  averageTrustScore: number;
  totalYtdTurnoverToman: number;
  totalYtdGoldPurchasedGrams: number;
  tierDistribution: {
    diamond: number;
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
  };
}

export interface K11DataPayload {
  retailers: Retailer[];
  summary: K11SummaryMetrics;
  territoryList: {
    regionCode: string;
    regionTitleFa: string;
    marketDistrictFa: string;
    assignedAgentNameFa: string;
    activeRetailersCount: number;
  }[];
  availableAgents: {
    id: string;
    nameFa: string;
    regionCode: string;
    activePortfoliosCount: number;
  }[];
}
