/**
 * Didar Gold Platform - Kernel Domain K10 Types
 * Orders, Allocation & Fulfillment (سفارش، تخصیص و ایفای سفارش)
 * 
 * Manages B2B gold ordering, real-time stock allocation from vaults and agent bags,
 * secure dispatch, and physical Proof of Delivery (POD) with dual verification.
 */

import { GoldCarat } from './k05.js';

export type OrderChannel =
  | 'direct_retailer'   // سفارش مستقیم گالری‌دار از پورتال خریدار
  | 'agent_assisted'    // سفارش حضوری ثبت‌شده توسط ویزیتور میدانی دیدار
  | 'phone_trade_desk'  // سفارش تلفنی و میز معامله بازار دیدار
  | 'custom_backorder'; // سفارش ساخت ویژه کارگاهی (کسری موجودی)

export type OrderStatus =
  | 'draft'               // پیش‌نویس سبد خرید
  | 'submitted'           // ثبت‌شده و در صف بررسی اعتبار
  | 'credit_approved'     // تأیید اعتبار مالی/طلایی خریدار
  | 'allocated'           // تخصیص کامل موجودی فیزیکی
  | 'partially_allocated' // تخصیص بخشی از موجودی و کسری اقلام
  | 'packed_sealed'       // بسته‌بندی امنیتی و پلمپ ضدجعل
  | 'dispatched'          // بارگیری و خروج از خزانه تحت اسکورت یا با عامل
  | 'delivered'           // تحویل به مقصد و ثبت امضای الکترونیک POD
  | 'completed'           // تسویه قطعی و بایگانی سفارش
  | 'cancelled';          // لغوشده و آزادسازی ذخیره طلا

export type AllocationSourceType =
  | 'central_vault'       // خزانه مرکزی تهران
  | 'regional_hub'        // هاب منطقه‌ای (اصفهان، مشهد، تبریز)
  | 'agent_bag'           // کیف پرتابل ویزیتور حاضر در محل
  | 'mixed_split'         // ترکیبی (بخشی از کیف و مابقی از خزانه)
  | 'direct_workshop';    // ارسال مستقیم از کارگاه سازنده

export type FulfillmentMethod =
  | 'agent_counter_handover' // تحویل حضوری در محل طلافروشی توسط ویزیتور
  | 'armored_escort'         // حمل زمینی با خودروی زرهی و مأموران حراست
  | 'vault_pickup'           // تحویل حضوری خریدار در باجه ترخیص خزانه مرکزی
  | 'secure_air_courier';    // پست هوایی ویژه و بیمه‌شده حمل طلا و مسکوکات

export type OrderPaymentTerm =
  | 'cash_spot'           // تسویه نقدی ریالی در لحظه تحویل
  | 'gold_barter_scrap'   // تهاتر وزنی با طلای آبشده / متفرقه (معادل عیار ۷۵۰)
  | 'credit_consignment'  // اعتباری بر اساس سقف ضمانت صیادی (۳۰ روزه)
  | 'split_gold_cash';    // ترکیبی (بخشی طلا + مابقی نقدی ریالی)

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  skuCode: string;
  titleFa: string;
  categoryFa: string;
  carat: GoldCarat;
  caratFa: string;
  fineness: number; // 750, 875, 900, 995, 999.9
  requestedQuantity: number;
  allocatedQuantity: number;
  targetWeightGrams: number;
  actualAllocatedWeightGrams: number;
  makingWageType: 'percentage' | 'fixed_per_gram';
  makingWageValue: number; // e.g. 5.5% or 45,000 Toman/gram
  makingWageDisplayFa: string;
  unitWholesaleMarginPercent: number; // سود عمده‌فروشی دیدار
  spotGoldPricePerGram750Toman: number; // نرخ لحظه‌ای طلای ۱۸ عیار در ثبت سفارش
  unitEstimatedPriceToman: number;
  totalEstimatedPriceToman: number;
  allocatedItemUids: string[]; // UIDs reserved from K06/K09
  allocationSource: AllocationSourceType;
  allocationSourceNameFa: string;
  allocationStatus: 'pending' | 'allocated' | 'dispatched' | 'delivered';
}

export interface ProofOfDelivery {
  id: string;
  orderId: string;
  verifiedAtFa: string;
  recipientNameFa: string;
  recipientNationalIdMasked: string;
  recipientRoleFa: string; // مدیرمسئول گالری / وکیل رسمی
  recipientPhone: string;
  securityPinVerified: boolean; // رمز یکبارمصرف تأیید تحویل
  scaleWeightAtHandoverGrams: number; // وزن سنجیده شده روی ترازوی طلافروشی
  scaleWeightAtDispatchGrams: number; // وزن ثبت‌شده در خزانه هنگام خروج
  weightDiscrepancyGrams: number; // اختلاف وزن (مجاز: ±۰.۰۲ گرم)
  isWeightDiscrepancyAcceptable: boolean;
  tamperSealSerial: string;
  tamperSealIntact: boolean;
  handoverOfficerNameFa: string; // نام عامل تحویل‌دهنده
  handoverOfficerRoleFa: string; // ویزیتور دیدار / سرپرست اسکورت زرهی
  recipientSignatureName: string;
  handoverPhotosCount: number;
  notes?: string;
}

export interface OrderEvent {
  id: string;
  timestampFa: string;
  status: OrderStatus;
  statusFa: string;
  actorNameFa: string;
  actorRoleFa: string;
  descriptionFa: string;
}

export interface Order {
  id: string;
  orderCode: string; // e.g. ORD-1403-8821
  orderDateFa: string;
  channel: OrderChannel;
  channelFa: string;
  status: OrderStatus;
  statusFa: string;

  // Buyer Info (Linked to K01/K02)
  retailerOrgId: string;
  retailerNameFa: string;
  retailerContactPersonFa: string;
  retailerPhone: string;
  retailerCityFa: string;
  retailerAddressFa: string;
  retailerTrustTier: string; // سطح اعتماد K02 مثلا T1, T2, T3
  retailerCreditLimitRemainingToman: number;

  // Assisted Agent (if order placed by or fulfilled by field agent)
  agentId?: string;
  agentNameFa?: string;
  agentBagCode?: string; // Linked to K09 Bag e.g. BAG-IR-042

  // Logistics & Delivery
  fulfillmentMethod: FulfillmentMethod;
  fulfillmentMethodFa: string;
  targetDeliveryDateFa: string;
  securitySealSerial?: string; // پلمپ ضدسرقت بسته
  waybillNumber?: string;      // شماره بارنامه حمل امنیتی

  // Payment Terms
  paymentTerm: OrderPaymentTerm;
  paymentTermFa: string;

  // Financial & Weight Summaries
  items: OrderItem[];
  totalPiecesCount: number;
  totalEstimatedWeightGrams: number;
  totalActualAllocatedWeightGrams: number;
  pureGoldEquivalentGrams: number; // معادل طلای خام ۹۹۵ / ۷۵۰
  totalMakingWageToman: number;
  totalWholesaleMarginToman: number;
  grandTotalToman: number;

  // Proof of Delivery
  pod?: ProofOfDelivery;

  // History Timeline
  timeline: OrderEvent[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface K10SummaryMetrics {
  totalOrdersCount: number;
  activeOrdersCount: number;
  pendingAllocationCount: number;
  inTransitGoldGrams: number;
  todayFulfilledGoldGrams: number;
  todayFulfilledOrdersCount: number;
  totalWholesaleValueToman: number;
  totalPendingAllocationGrams: number;
}

export interface AvailableInventoryPoolItem {
  id: string;
  uid: string;
  titleFa: string;
  skuCode: string;
  caratFa: string;
  fineness: number;
  scaleWeightGrams: number;
  locationId: string;
  locationNameFa: string;
  locationType: 'vault' | 'bag';
  isAvailable: boolean;
}

export interface K10DataPayload {
  orders: Order[];
  metrics: K10SummaryMetrics;
  inventoryPool: AvailableInventoryPoolItem[];
  supportedRetailers: {
    id: string;
    nameFa: string;
    cityFa: string;
    trustTier: string;
    creditLimitToman: number;
    phone: string;
    addressFa: string;
  }[];
  agentBags: {
    id: string;
    bagCode: string;
    agentNameFa: string;
    territoryFa: string;
    currentWeightGrams: number;
    piecesCount: number;
  }[];
  vaultLocations: {
    id: string;
    code: string;
    nameFa: string;
    cityFa: string;
    totalGoldWeightGrams: number;
  }[];
}
