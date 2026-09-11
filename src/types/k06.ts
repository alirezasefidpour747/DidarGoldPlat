/**
 * Didar Gold Platform - Kernel Domain K06 Types
 * Domain K06: Unique Item IDs, Passports & Provenance
 * هسته K06: شناسه یکتا، گذرنامه دیجیتال مصنوعات، اصالت‌سنجی ری‌گیری و زنجیره مالکیت
 */

export type ItemPassportStatus =
  | 'minted'               // شناسنامه صادر شده (تولید جدید)
  | 'in_vault'             // موجود در خزانه مرکزی بنکداری دیدار
  | 'in_transit'           // در حال جابه‌جایی / حمل ایمن مکانیزه
  | 'retail_inventory'     // در موجودی ویترین گالری طلافروشی همکار
  | 'sold_active'          // فروخته‌شده به مصرف‌کننده و شناسنامه فعال
  | 'reported_lost_stolen' // گزارش سرقت / مفقودی در شبکه سراسری
  | 'recycled_melted';     // اسقاط / ارسال به کوره ذوب و بازیافت شمش

export type HolderType =
  | 'central_vault'        // خزانه مرکزی دیدار گلد
  | 'logistics_courier'    // پیک امنیتی حمل طلا
  | 'retail_partner'       // گالری / طلافروشی عضو شبکه
  | 'consumer'             // خریدار نهایی حقیقی
  | 'assay_lab';           // آزمایشگاه ری‌گیری

export type AssayMethod =
  | 'cupellation_fire_assay' // روش سنتی و استاندارد بین‌المللی کوپلاسیون
  | 'xrf_spectrometry'       // طیف‌سنجی پرتو ایکس XRF
  | 'both';                  // ترکیبی (کوپلاسیون و XRF)

export interface MacroPhotoEvidence {
  id: string;
  titleFa: string;
  url: string;
  captureArea: string;       // مثلا: انگ ری‌گیری، اتصال قفل، بافت اسلیمی
  magnification: string;     // مثلا: 40X Optical
}

export interface UniqueItemPassport {
  id: string;
  uid: string;                     // شناسه یکتا مثلا: DID-AU750-2026-8820-001
  serialNumber: string;            // شماره سریال تولید: SN-8820-26-001
  nfcTagUid: string;               // کد شناسه تراشه NFC رمزنگاری‌شده
  qrCodeData: string;              // لینک استعلام دیجیتال اصالت
  
  // ارجاع به مدل و تنوع در K05
  itemNature?: 'manufactured_jewelry' | 'melted_gold'; // ماهیت قطعه: کار ساخته مصنوعات یا طلای آبشده
  itemNatureFa?: string;           // عنوان فارسی ماهیت
  productSkuId: string;
  productSkuCode: string;          // مثلا: DID-BNG-8820
  productTitleFa: string;
  variantId: string;
  sizeLabelFa: string;             // مثلا: سایز ۲ (قطر داخلی ۵۶ میلی‌متر)
  colorFa: string;
  carat: '18k_750' | '21k_875' | '21.6k_900' | '24k_995' | '24k_999' | string;
  caratFa: string;

  // مشخصات فیزیکی و وزن‌سنجی با ترازوی کالیبره
  skuWeightRangeFa?: string;       // رنج وزنی مجاز SKU در کاتالوگ (مثلا: ۱۱.۵۵ الی ۱۲.۰۵ گرم)
  skuMinWeightGrams?: number;      // حداقل وزن مجاز SKU در کاتالوگ
  skuMaxWeightGrams?: number;      // حداکثر وزن مجاز SKU در کاتالوگ
  isWithinSkuRange?: boolean;      // آیا وزن قطعه فیزیکی داخل رنج مجاز SKU است
  nominalWeightGrams: number;      // میانگین رنج وزنی مدل در کاتالوگ (اسمی)
  actualScaleWeightGrams: number;   // وزن قطعی و دقیق قطعه فیزیکی ثبت‌شده روی ترازوی تحلیلی (مثلا: ۱۱.۹۸۵ گرم)
  weightDeltaGrams: number;        // اختلاف با میانگین اسمی رنج (-۰.۰۱۵ گرم)
  scaleModel: string;              // مشخصات ترازوی طلافروشی
  scaleCalibrationDateFa: string;  // تاریخ کالیبراسیون رسمی ترازو

  // مشخصات آزمایشگاه ری‌گیری و انگ رسمی (Assay & Hallmark)
  assayLabName: string;            // نام آزمایشگاه ری‌گیری مجاز
  assayUnionPermitNo: string;      // شماره پروانه از اتحادیه طلا و جواهر
  assayPacketCode: string;         // کد پاکت / شماره رسید ری‌گیری
  hallmarkCode: string;            // کد انگ کوبیده‌شده (مثلا: T750-ZRF94)
  certifiedFineness: number;       // عیار قطعی سنجش‌شده (مثلا: 750.4)
  assayMethod: AssayMethod;
  assayMethodFa: string;
  assayCertifiedDateFa: string;
  inspectorName: string;           // نام کارشناس ری‌گیر

  // حکاکی لیزری و نشانه‌های امنیتی
  laserEngravingText: string;      // متن حکاکی لیزری ریز
  laserPositionFa: string;         // محل حکاکی روی مصنوع
  hasDidarSecurityMicroPattern: boolean; // الگوی هندسی ضدجعل دیدار

  // وضعیت و موقعیت فیزیکی فعلی
  status: ItemPassportStatus;
  statusFa: string;
  currentHolderType: HolderType;
  currentHolderName: string;       // نام دارنده فعلی
  currentHolderId: string;
  locationCityFa: string;

  // شواهد کنترل کیفیت (QC Inspection)
  qcPassed: boolean;
  qcInspectorName: string;
  qcScore: number;                 // امتیاز کیفی (از ۱۰۰)
  surfaceFinishGradeFa: string;    // کیفیت پرداخت سطحی
  porosityCheckFa: string;         // بررسی تخلخل ریخته‌گری
  macroPhotos: MacroPhotoEvidence[];
  qcNotes?: string;

  // اطلاعات مالکیت ثبت‌شده (در صورت فروش)
  currentOwnerName?: string;
  ownerNationalCodeMasked?: string;
  ownerPhoneMasked?: string;
  ownershipRegisteredAtFa?: string;
  retailInvoiceNumber?: string;
  warrantyValidUntilFa?: string;
  insuranceStatus: 'covered' | 'not_covered' | 'expired';

  // گواهی اصالت و امنیت رمزنگاری
  cryptographicHash: string;       // چک‌سام SHA-256 گذرنامه دیجیتال
  digitalSealVerified: boolean;
  issuedAt: string;
  issuedBy: string;

  // پرچم سرقت یا مفقودی
  isStolenReported: boolean;
  stolenReportDateFa?: string;
  stolenReportReason?: string;
}

export type ProvenanceEventType =
  | 'casting_completed'         // اتمام ریخته‌گری و ساخت در کارگاه
  | 'assay_hallmarked'          // سنجش عیار و انگ‌کوبی در ری‌گیری رسمی
  | 'vault_intake_qc'           // ورود به خزانه مرکزی بنکداری و تأیید QC
  | 'consignment_transferred'   // خروج از خزانه و واگذاری امانی به گالری همکار
  | 'retail_delivery_accepted'  // وصول فیزیکی و تأیید در ویترین طلافروشی
  | 'consumer_registered'       // خرید مشتری نهایی و ثبت مالکیت در گذرنامه
  | 'service_polished'          // سرویس دوره‌ای، آبکاری مجدد یا تنظیم سایز
  | 'stolen_flagged'            // ثبت اعلام سرقت در سیستم کشوری
  | 'recovered_cleared'         // احراز مجدد اصالت و رفع پرچم سرقت
  | 'recycled_to_bullion';      // بازخرید و تبدیل به شمش آب‌شده

export interface ProvenanceEvent {
  id: string;
  passportId: string;
  uid: string;
  eventType: ProvenanceEventType;
  eventTypeFa: string;
  titleFa: string;
  descriptionFa: string;
  actorName: string;
  actorRoleFa: string;
  fromHolder: string;
  toHolder: string;
  locationFa: string;
  timestampFa: string;
  blockHash: string;               // هش تراکنش ثبت در دفتر کل تغییرناپذیر
  verified: boolean;
  certificateRef?: string;
}

export interface K06Metrics {
  totalPassportsMinted: number;     // کل قطعات پلاک‌گذاری‌شده
  inVaultCount: number;             // موجود در خزانه مرکزی
  withRetailersCount: number;       // در ویترین طلافروشان همکار
  activeWithConsumersCount: number; // تحویل‌شده به خریداران نهایی
  totalGramsTracked: number;        // مجموع وزن طلای دارای شناسنامه فعال (گرم)
  reportedLostStolenCount: number;  // قطعات علامت‌گذاری‌شده مسروقه
  avgFinenessPurity: number;        // میانگین عیار قطعات (مثلا: 750.35)
  totalProvenanceEvents: number;    // کل رویدادهای زنجیره اصالت ثبت‌شده
}

export interface K06DataPayload {
  passports: UniqueItemPassport[];
  events: ProvenanceEvent[];
  metrics: K06Metrics;
}
