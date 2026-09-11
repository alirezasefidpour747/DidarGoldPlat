/**
 * Didar Gold Platform - Kernel Domain K05 Types
 * Domain K05: Products, SKU Catalog, Variants, Narrative Assets & Supplier Capacity Offers
 * هسته K05: محصولات، کاتالوگ مدل‌ها، تنوع ساخت، گالری روایی و پیشنهادهای ظرفیت تولید سازندگان
 */

export type ProductCategory =
  // 1. زیورآلات بدنی (Jewelry)
  | 'bangle'              // النگو
  | 'bracelet'            // دستبند
  | 'necklace'            // گردنبند
  | 'ring'                // انگشتر و حلقه
  | 'earrings'            // گوشواره
  | 'chain'               // زنجیر
  | 'pendant'             // آویز / پلاک
  | 'anklet'              // پابند
  | 'body_jewelry'        // زیورآلات بدن
  // 2. اکسسوری‌ها (Accessories)
  | 'cufflinks'           // دکمه سردست
  | 'tie_clip'            // گیره کراوات
  | 'brooch'              // سنجاق سینه
  | 'scarf_clip'          // گیره روسری
  | 'hair_accessory'      // اکسسوری مو
  | 'tiara'               // تاج / نیم‌تاج
  | 'forehead_ornament'   // زیور پیشانی
  // 3. ست‌ها و پک‌های ترکیبی
  | 'full_set'            // سرویس کامل
  | 'half_set'            // نیم‌ست
  | 'mother_child_set'    // ست مادر و کودک
  | 'occasion_pack'       // پک مناسبتی
  | 'mens_set'            // ست مردانه
  | 'everyday_pack'       // پک اقتصادی / روزمره
  | 'kids_teen_pack'      // پک کودک / نوجوان
  // 4. محصولات سرمایه‌ای (Bullion)
  | 'standard_bullion'    // شمش استاندارد
  | 'occasion_bullion'    // شمش مناسبتی
  | 'branded_bullion'     // شمش برنددار جهانی
  | 'baby_bullion'        // شمش کودک / نوزاد
  | 'custom_bullion'      // شمش سفارشی
  | 'bank_coin'           // سکه بانکی
  | 'commemorative_coin'  // سکه خصوصی / یادبود
  | 'combibar'            // شمش ترکیبی
  | 'coin_medallion'      // مسکوکات و شمش کادویی (نوستالژی کاتالوگ)
  // 5. اقلام مفهومی / نمادین
  | 'symbolic_products'   // محصولات Symbolic
  | string;

export type GoldCarat =
  | '18k_750'    // ۷۵۰ (۱۸ عیار - استاندارد ملی طلا)
  | '21k_875'    // ۸۷۵ (۲۱ عیار - منطقه‌ای / صادراتی)
  | '21.6k_900'  // ۹۰۰ (۲۱.۶ عیار - استاندارد سکه‌های بانکی و مسکوکات)
  | '24k_995'    // ۹۹۵ (۲۴ عیار - شمش استاندارد بورس کالا و کارگشایی)
  | '24k_999'    // ۹۹۹.۹ (۲۴ عیار - شمش خالص اعلا Four Nines)
  | string;

export type GoldColor =
  | 'yellow'      // زرد
  | 'white'       // سفید
  | 'rose'        // رزگلد
  | 'dual_tone'   // دو رنگ (زرد و سفید)
  | 'tri_tone';   // سه رنگ

export type WageType =
  | 'percentage'      // درصدی از ارزش طلای خام
  | 'fixed_per_gram'  // ریال ثابت به ازای هر گرم
  | 'composite';      // ترکیبی (درصد + کارمزد نگین/مینا)

export type StonesType =
  | 'no_stones'           // بدون نگین (ساده و ریخته‌گری)
  | 'cubic_zirconia'      // نگین اتمی (با کسر وزن)
  | 'certified_gemstones' // برلیان و جواهرات شناسنامه‌دار

export interface ProductVariant {
  id: string;
  skuCode: string;
  sizeLabelFa: string;              // مثلا: سایز ۲ (قطر ۵۶ میلی‌متر)، طول ۴۵ سانتی‌متر
  color: GoldColor;
  colorFa: string;
  minWeightGrams?: number;          // حداقل رنج وزنی مجاز به گرم
  maxWeightGrams?: number;          // حداکثر رنج وزنی مجاز به گرم
  weightRangeFa?: string;           // عنوان فارسی رنج وزنی SKU، مثلا: ۱۰.۷۰ الی ۱۱.۲۰ گرم
  targetWeightGrams: number;        // وزن اسمی/میانگین رنج به گرم (برای تخمین‌های سرانگشتی و قیمت روز)
  toleranceGrams: number;           // تلورانس مجاز به گرم (±)
  inStockQuantity: number;          // موجودی فیزیکی آماده تحویل در بنکداری
  cadMoldNumber?: string;           // شماره قالب صنعتی ریخته‌گری
  barcode: string;                  // بارکد انبارداری
}

export interface NarrativeAsset {
  id: string;
  type: 'photo_hero' | 'photo_detail' | 'render_3d' | 'video_turn' | 'cad_blueprint' | 'certificate';
  typeFa: string;
  url: string;
  titleFa: string;
  descriptionFa?: string;
  isPrimary: boolean;
}

export interface ProductSku {
  id: string;
  skuCode: string;                  // مثلا: DID-BNG-8820
  titleFa: string;
  // ۳ سطح دسته‌بندی کاتالوگ (Taxonomy)
  familyId?: string;                // Level 1: مثلا 'jewelry' | 'accessories' | 'combo_sets' | 'bullion' | 'symbolic'
  familyTitleFa?: string;           // مثلا '۱. زیورآلات بدنی (Jewelry)'
  category: ProductCategory;        // Level 2: مثلا 'ring' | 'bangle' | 'cufflinks' | 'standard_bullion'
  categoryFa: string;               // عنوان فارسی دسته (مثلا 'انگشتر')
  subcategoryId?: string;           // Level 3: مثلا 'wedding_band' | 'solitaire'
  subcategoryFa?: string;           // عنوان فارسی زیردسته (مثلا: 'حلقه ازدواج')
  carat: GoldCarat;
  caratFa: string;
  minWeightGrams?: number;          // حداقل رنج وزنی مدل
  maxWeightGrams?: number;          // حداکثر رنج وزنی مدل
  weightRangeFa?: string;           // عنوان فارسی رنج وزنی مدل (مثلا: ۱۰.۷۰ الی ۱۲.۹۰ گرم)
  baseWeightGrams: number;          // میانگین رنج وزنی مدل (برای برآورد قیمت روز)
  weightTolerancePercent: number;   // درصد خطای وزنی مجاز در فرآیند ریخته‌گری
  makerWageType: WageType;
  makerWageValue: number;           // درصد یا مبلغ ریالی
  makerWageDisplay: string;         // متن نمایش اجرت (مثلا: "۶.۵٪" یا "۳۵۰,۰۰۰ ریال/گرم")
  recommendedWholesaleMargin: number; // سود پیشنهادی بنکدار (درصد)
  stonesType: StonesType;
  stonesTypeFa: string;
  stonesWeightDeducted: boolean;    // آیا وزن نگین از وزن طلا در محاسبه کسر می‌گردد
  designStyleFa: string;            // سبک طراحی (سنتی یزد، نئوکلاسیک، فیوژن، اسلیمی)
  storylineFa: string;              // روایت داستانی و هنری پشت ساخت مدل
  craftingTechniqueFa: string;      // فناوری ساخت (ریخته‌گری دقیق، لیزری، دست‌ساز، فیوژن سه‌بعدی)
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  variants: ProductVariant[];
  narrativeAssets: NarrativeAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierCapacityOffer {
  id: string;
  offerCode: string;                // مثلا: OFF-1403-104
  supplierPartyId: string;          // شناسه کارگاه / سازنده
  supplierName: string;             // نام کارگاه (مثلا: کارگاه زرگری آریا اصفهان)
  supplierCityFa: string;           // شهر محل تولید (تهران، اصفهان، یزد، مشهد، تبریز)
  supplierGrade: 'A_PLUS' | 'A' | 'B';
  productSkuId: string;
  productSkuCode: string;
  productTitleFa: string;
  weeklyCapacityGrams: number;      // توان تولید هفتگی به گرم
  minOrderQuantityGrams: number;    // حداقل حجم سفارش ساخت (MOQ)
  leadTimeDays: number;             // زمان تحویل سفارش (روز کاری)
  offeredWageType: WageType;
  offeredWageValue: number;         // اجرت پیشنهادی سازنده
  offeredWageDisplay: string;       // متن نمایش
  alloyQualityGuarantee: boolean;   // تضمین انطباق عیار در انگ ری‌گیری
  lossScrapAllowancePercent: number; // کسری مجاز ساخت (درصد مجاز سوخت/آبکاری)
  status: 'active' | 'negotiating' | 'paused' | 'exhausted';
  statusFa: string;
  notes?: string;
  validUntil: string;
  createdAt: string;
}

export interface K05Metrics {
  totalProductsCount: number;
  activeSkusCount: number;
  totalWeeklyCapacityKg: number;    // ظرفیت هفتگی ساخت سازندگان به کیلوگرم
  averageMakerWagePercent: number;  // میانگین اجرت ساخت کاتالوگ
  totalAvailableStockGrams: number; // مجموع طلای ساخته‌شده موجود در بنکداری
  activeSuppliersCount: number;     // تعداد کارگاه‌های فعال متصل
  categoryStats: {
    category: ProductCategory;
    categoryFa: string;
    productsCount: number;
    totalWeightKg: number;
  }[];
}

export interface LiveGoldSpotRate {
  gold18kGramIrr: number;           // قیمت هر گرم طلای ۱۸ عیار (۷۵۰) به ریال
  mesghal17kIrr: number;            // قیمت مظنه (یک مثقال طلای ۱۷ عیار) به ریال
  usdIrr: number;                   // برابری دلار / ریال
  ounceUsd: number;                 // انس جهانی طلا به دلار
  lastUpdatedFa: string;
}

export interface K05DataPayload {
  products: ProductSku[];
  supplyOffers: SupplierCapacityOffer[];
  metrics: K05Metrics;
  marketRate: LiveGoldSpotRate;
}
