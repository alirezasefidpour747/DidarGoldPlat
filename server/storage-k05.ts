/**
 * Didar Gold Platform - Kernel Domain K05 Storage & Engine
 * Product Catalog, SKU Variants, Narrative Assets & Supplier Capacity Management
 */

import {
  ProductSku,
  SupplierCapacityOffer,
  K05Metrics,
  LiveGoldSpotRate,
  K05DataPayload,
  ProductVariant,
  NarrativeAsset
} from '../src/types/k05.js';

class K05StorageEngine {
  private products: ProductSku[] = [];
  private supplyOffers: SupplierCapacityOffer[] = [];
  private marketRate: LiveGoldSpotRate = {
    gold18kGramIrr: 43500000,    // ۴,۳۵۰,۰۰۰ تومان به ازای هر گرم طلای ۱۸ عیار
    mesghal17kIrr: 188400000,    // ۱۸,۸۴۰,۰۰۰ تومان مظنه هر مثقال طلای ۱۷ عیار (۷۰۵)
    usdIrr: 6150000,             // ۶۱۵,۰۰۰ ریال نرخ دلار
    ounceUsd: 2505.40,           // انس جهانی طلا
    lastUpdatedFa: '۱۴۰۵/۰۶/۱۷ - ۱۱:۳۰'
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. محصولات مادر کاتالوگ (Product SKUs)
    this.products = [
      {
        id: 'prd-01',
        skuCode: 'DID-BNG-8820',
        titleFa: 'النگو طلا ۱۸ عیار ریخته‌گری طرح اسلیمی صفوی (آینه‌ای)',
        familyId: 'jewelry',
        familyTitleFa: '۱. زیورآلات بدنی (Jewelry)',
        category: 'bangle',
        categoryFa: 'النگو',
        subcategoryId: 'standard_bangle',
        subcategoryFa: 'النگو / Bangle',
        carat: '18k_750',
        caratFa: '۱۸ عیار (۷۵۰)',
        baseWeightGrams: 11.85,
        weightTolerancePercent: 2.0,
        makerWageType: 'percentage',
        makerWageValue: 5.8,
        makerWageDisplay: '۵.۸٪ روی طلای خام',
        recommendedWholesaleMargin: 2.0,
        stonesType: 'no_stones',
        stonesTypeFa: 'تمام طلا (بدون نگین)',
        stonesWeightDeducted: false,
        designStyleFa: 'اسلیمی صفوی و آینه‌ای کلاسیک',
        storylineFa: 'الهام‌گرفته از طاق‌های مقرنس مسجد شیخ لطف‌الله اصفهان؛ تلفیق درخشش آینه‌ای و تراش‌های دستی اسلیمی با حداکثر استحکام ریخته‌گری پیوسته برای استفاده دائمی بانوان.',
        craftingTechniqueFa: 'ریخته‌گری گریز از مرکز القایی (Induction Casting) با پرداخت الکتروپولیش',
        tags: ['النگو', 'پرفروش_بنکداری', 'اسلیمی', 'مقاوم', 'بدون_کسری'],
        status: 'active',
        variants: [
          {
            id: 'var-01-1',
            skuCode: 'DID-BNG-8820-SZ1-Y',
            sizeLabelFa: 'سایز ۱ (قطر داخلی ۵۴ میلی‌متر)',
            color: 'yellow',
            colorFa: 'طلای زرد',
            targetWeightGrams: 10.95,
            toleranceGrams: 0.20,
            inStockQuantity: 18,
            cadMoldNumber: 'CAD-ISF-BNG-882-1',
            barcode: '6269000188201'
          },
          {
            id: 'var-01-2',
            skuCode: 'DID-BNG-8820-SZ2-Y',
            sizeLabelFa: 'سایز ۲ (قطر داخلی ۵۷ میلی‌متر)',
            color: 'yellow',
            colorFa: 'طلای زرد',
            targetWeightGrams: 11.80,
            toleranceGrams: 0.25,
            inStockQuantity: 34,
            cadMoldNumber: 'CAD-ISF-BNG-882-2',
            barcode: '6269000188202'
          },
          {
            id: 'var-01-3',
            skuCode: 'DID-BNG-8820-SZ3-Y',
            sizeLabelFa: 'سایز ۳ (قطر داخلی ۶۰ میلی‌متر)',
            color: 'yellow',
            colorFa: 'طلای زرد',
            targetWeightGrams: 12.65,
            toleranceGrams: 0.25,
            inStockQuantity: 28,
            cadMoldNumber: 'CAD-ISF-BNG-882-3',
            barcode: '6269000188203'
          },
          {
            id: 'var-01-4',
            skuCode: 'DID-BNG-8820-SZ2-D',
            sizeLabelFa: 'سایز ۲ (دورنگ زرد و سفید رودیوم)',
            color: 'dual_tone',
            colorFa: 'دو رنگ (زرد و سفید)',
            targetWeightGrams: 11.90,
            toleranceGrams: 0.25,
            inStockQuantity: 14,
            cadMoldNumber: 'CAD-ISF-BNG-882-2D',
            barcode: '6269000188204'
          }
        ],
        narrativeAssets: [
          {
            id: 'ast-01',
            type: 'photo_hero',
            typeFa: 'تصویر استودیویی اصلی',
            url: 'https://images.unsplash.com/photo-1611591475839-729c24ed9804?auto=format&fit=crop&w=800&q=80',
            titleFa: 'نمای زاویه‌دار النگو اسلیمی در باکس مخمل',
            descriptionFa: 'نمایش جلوه تراش‌های ظریف و انعکاس نور آینه‌ای بدون پلیسه',
            isPrimary: true
          },
          {
            id: 'ast-02',
            type: 'cad_blueprint',
            typeFa: 'نقشه فنی و قالب CAD',
            url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
            titleFa: 'طراحی رایانه‌ای ضخامت دیواره ۵.۴ میلی‌متر',
            descriptionFa: 'تضمین مقاومت در برابر خمیدگی بر اساس استانداردهای مهندسی طلا',
            isPrimary: false
          }
        ],
        createdAt: '۱۴۰۳/۰۶/۱۰',
        updatedAt: '۱۴۰۳/۰۹/۰۱'
      },
      {
        id: 'prd-02',
        skuCode: 'DID-BRC-4100',
        titleFa: 'دستبند کوبیک فیوژن ۱۸ عیار قفل مخفی کارتیه',
        familyId: 'jewelry',
        familyTitleFa: '۱. زیورآلات بدنی (Jewelry)',
        category: 'bracelet',
        categoryFa: 'دستبند',
        subcategoryId: 'lock_bracelet',
        subcategoryFa: 'قفلی',
        carat: '18k_750',
        caratFa: '۱۸ عیار (۷۵۰)',
        baseWeightGrams: 16.40,
        weightTolerancePercent: 1.8,
        makerWageType: 'percentage',
        makerWageValue: 7.2,
        makerWageDisplay: '۷.۲٪ روی طلای خام',
        recommendedWholesaleMargin: 2.5,
        stonesType: 'no_stones',
        stonesTypeFa: 'بدون نگین (تمام طلا فیوژن)',
        stonesWeightDeducted: false,
        designStyleFa: 'مدرن نئوکلاسیک کارتیه',
        storylineFa: 'طراحی هندسی جسورانه با پیوندهای مکعبی صیقلی؛ قفل ضامن‌دار مخفی با فنر استاندارد طلا و مقاومت بالا در تکان‌های ناگهانی مچ دست.',
        craftingTechniqueFa: 'تراش CNC پنج‌محور به همراه مونتاژ دستی زنجیره‌های فیوژن',
        tags: ['دستبند', 'اسپرت', 'مدرن', 'قفل_مخفی', 'هندسی'],
        status: 'active',
        variants: [
          {
            id: 'var-02-1',
            skuCode: 'DID-BRC-4100-18CM-Y',
            sizeLabelFa: 'طول ۱۸ سانتی‌متر (مچ استاندارد)',
            color: 'yellow',
            colorFa: 'طلای زرد',
            targetWeightGrams: 15.80,
            toleranceGrams: 0.30,
            inStockQuantity: 9,
            cadMoldNumber: 'CAD-TEH-BRC-410-18',
            barcode: '6269000141001'
          },
          {
            id: 'var-02-2',
            skuCode: 'DID-BRC-4100-20CM-R',
            sizeLabelFa: 'طول ۲۰ سانتی‌متر (رزگلد)',
            color: 'rose',
            colorFa: 'طلای رزگلد',
            targetWeightGrams: 17.20,
            toleranceGrams: 0.35,
            inStockQuantity: 12,
            cadMoldNumber: 'CAD-TEH-BRC-410-20',
            barcode: '6269000141002'
          }
        ],
        narrativeAssets: [
          {
            id: 'ast-03',
            type: 'photo_hero',
            typeFa: 'تصویر استودیویی اصلی',
            url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
            titleFa: 'نمای مچی دستبند کوبیک فیوژن',
            descriptionFa: 'ظرافت اتصالات زنجیره‌ای و براقیت پولیش فوق‌العاده',
            isPrimary: true
          }
        ],
        createdAt: '۱۴۰۳/۰۷/۱۵',
        updatedAt: '۱۴۰۳/۰۹/۰۲'
      },
      {
        id: 'prd-03',
        skuCode: 'DID-SET-9900',
        titleFa: 'سرویس کامل عروس طلا سفید ۱۸ عیار طرح پر طاووس با نگین اتمی اتریش',
        familyId: 'combo_sets',
        familyTitleFa: '۳. ست‌ها و پک‌های ترکیبی',
        category: 'full_set',
        categoryFa: 'سرویس کامل',
        subcategoryId: 'complete_gold_set',
        subcategoryFa: 'ست کامل طلا',
        carat: '18k_750',
        caratFa: '۱۸ عیار (۷۵۰)',
        baseWeightGrams: 36.80,
        weightTolerancePercent: 2.5,
        makerWageType: 'percentage',
        makerWageValue: 8.9,
        makerWageDisplay: '۸.۹٪ روی طلای خام',
        recommendedWholesaleMargin: 3.0,
        stonesType: 'cubic_zirconia',
        stonesTypeFa: 'نگین اتمی سواروفسکی (با کسر وزن)',
        stonesWeightDeducted: true,
        designStyleFa: 'لوکس تشریفاتی رویال',
        storylineFa: 'شاهکار هنری طلاسازی تبریز؛ شامل گردنبند آبشاری، گوشواره‌های متقارن و دستبند پیوسته. تمام نگین‌ها با میکروسکوپ مخراج‌کاری چنگی شده‌اند و وزن سنگ‌ها کاملاً از طلای خام کسر گردیده است.',
        craftingTechniqueFa: 'مخراج‌کاری مایکروپاوه (Micro-Pave) با رودیوم‌پاشی دوگانه ضدحساسیت',
        tags: ['سرویس_عروس', 'لوکس', 'سفید_رودیوم', 'نگین_اتمی', 'مخراج_کاری'],
        status: 'active',
        variants: [
          {
            id: 'var-03-1',
            skuCode: 'DID-SET-9900-W-STD',
            sizeLabelFa: 'ست کامل با زنجیر تنظیم‌پذیر گردن',
            color: 'white',
            colorFa: 'طلای سفید',
            targetWeightGrams: 36.80,
            toleranceGrams: 0.80,
            inStockQuantity: 5,
            cadMoldNumber: 'CAD-TBZ-SET-990',
            barcode: '6269000199001'
          }
        ],
        narrativeAssets: [
          {
            id: 'ast-04',
            type: 'photo_hero',
            typeFa: 'تصویر استودیویی سرویس',
            url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
            titleFa: 'سرویس کامل چیده شده در سینی جیر سیاه',
            descriptionFa: 'درخشش بی‌نقص و هماهنگی کامل فرم گوشواره، دستبند و سینه ریز',
            isPrimary: true
          }
        ],
        createdAt: '۱۴۰۳/۰۸/۰۱',
        updatedAt: '۱۴۰۳/۰۹/۰۳'
      },
      {
        id: 'prd-04',
        skuCode: 'DID-CHN-2050',
        titleFa: 'زنجیر ونیزی ایتالیایی ۱۸ عیار متراکم ۴۵ و ۵۵ سانتی‌متر',
        familyId: 'jewelry',
        familyTitleFa: '۱. زیورآلات بدنی (Jewelry)',
        category: 'chain',
        categoryFa: 'زنجیر',
        subcategoryId: 'box_chain',
        subcategoryFa: 'Box',
        carat: '18k_750',
        caratFa: '۱۸ عیار (۷۵۰)',
        baseWeightGrams: 8.40,
        weightTolerancePercent: 1.5,
        makerWageType: 'percentage',
        makerWageValue: 4.5,
        makerWageDisplay: '۴.۵٪ روی طلای خام',
        recommendedWholesaleMargin: 1.8,
        stonesType: 'no_stones',
        stonesTypeFa: 'بدون نگین',
        stonesWeightDeducted: false,
        designStyleFa: 'کلاسیک مینیمال ونیزی (Box Chain)',
        storylineFa: 'ساخت با دستگاه‌های تمام خودکار بافت طلا؛ بافت متراکم چهارگوش ونیزی با انعطاف فوق‌العاده و مقاومت کششی بالا بدون گره‌خوردگی.',
        craftingTechniqueFa: 'ماشین‌بافت پیوسته زنجیر ایتالیایی و جوش لیزری نیتروژنی',
        tags: ['زنجیر', 'ونیزی', 'اجرت_پایین', 'سرمایه_گذاری', 'استحکام_بالا'],
        status: 'active',
        variants: [
          {
            id: 'var-04-1',
            skuCode: 'DID-CHN-2050-45CM',
            sizeLabelFa: 'طول ۴۵ سانتی‌متر (ظریف بانوان)',
            color: 'yellow',
            colorFa: 'طلای زرد',
            targetWeightGrams: 6.80,
            toleranceGrams: 0.15,
            inStockQuantity: 42,
            barcode: '6269000120501'
          },
          {
            id: 'var-04-2',
            skuCode: 'DID-CHN-2050-55CM',
            sizeLabelFa: 'طول ۵۵ سانتی‌متر (رولباسی / استاندارد)',
            color: 'yellow',
            colorFa: 'طلای زرد',
            targetWeightGrams: 9.80,
            toleranceGrams: 0.20,
            inStockQuantity: 38,
            barcode: '6269000120502'
          }
        ],
        narrativeAssets: [
          {
            id: 'ast-05',
            type: 'photo_hero',
            typeFa: 'تصویر زنجیر ونیزی',
            url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
            titleFa: 'نمای متراکم و پیوسته زنجیر ونیزی',
            descriptionFa: 'کیفیت جوش لیزری دانه‌های مربعی',
            isPrimary: true
          }
        ],
        createdAt: '۱۴۰۳/۰۵/۲۰',
        updatedAt: '۱۴۰۳/۰۸/۲۵'
      },
      {
        id: 'prd-05',
        skuCode: 'DID-RNG-3310',
        titleFa: 'انگشتر تک‌نگین فیوژن سولیتر با رینگ دو لایه رزگلد و سفید',
        familyId: 'jewelry',
        familyTitleFa: '۱. زیورآلات بدنی (Jewelry)',
        category: 'ring',
        categoryFa: 'انگشتر',
        subcategoryId: 'solitaire',
        subcategoryFa: 'سولیتر',
        carat: '18k_750',
        caratFa: '۱۸ عیار (۷۵۰)',
        baseWeightGrams: 4.85,
        weightTolerancePercent: 2.0,
        makerWageType: 'percentage',
        makerWageValue: 7.9,
        makerWageDisplay: '۷.۹٪ روی طلای خام',
        recommendedWholesaleMargin: 2.8,
        stonesType: 'cubic_zirconia',
        stonesTypeFa: 'نگین تک دیاموند کات اتریش',
        stonesWeightDeducted: true,
        designStyleFa: 'مدرن مینیمال نامزدی',
        storylineFa: 'ترکیب رمانتیک رزگلد ملایم با تاج سفید رودیوم؛ پایه چنگ چهارتایی برآمده که نور را از زیر نگین بازتاب می‌دهد و باعث درخشش حداکثری سنگ مرکزی می‌شود.',
        craftingTechniqueFa: 'قالب‌گیری مومی با چاپگر پرینت سه‌بعدی رزینی و چنگک‌کاری دستی',
        tags: ['انگشتر', 'سولیتر', 'نامزدی', 'رزگلد', 'ظریف'],
        status: 'active',
        variants: [
          {
            id: 'var-05-1',
            skuCode: 'DID-RNG-3310-SZ54',
            sizeLabelFa: 'سایز ۵۴ (قطر ۱۷.۲ میلی‌متر)',
            color: 'rose',
            colorFa: 'رزگلد',
            targetWeightGrams: 4.65,
            toleranceGrams: 0.15,
            inStockQuantity: 15,
            cadMoldNumber: 'CAD-YZD-RNG-331-54',
            barcode: '6269000133101'
          },
          {
            id: 'var-05-2',
            skuCode: 'DID-RNG-3310-SZ56',
            sizeLabelFa: 'سایز ۵۶ (قطر ۱۷.۸ میلی‌متر)',
            color: 'rose',
            colorFa: 'رزگلد',
            targetWeightGrams: 4.90,
            toleranceGrams: 0.15,
            inStockQuantity: 21,
            cadMoldNumber: 'CAD-YZD-RNG-331-56',
            barcode: '6269000133102'
          }
        ],
        narrativeAssets: [
          {
            id: 'ast-06',
            type: 'photo_hero',
            typeFa: 'تصویر تک‌نگین سولیتر',
            url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
            titleFa: 'انگشتر سولیتر با انعکاس نور استودیویی',
            descriptionFa: 'پایه چهارتایی محکم با نمای برجسته نگین اتریشی',
            isPrimary: true
          }
        ],
        createdAt: '۱۴۰۳/۰۶/۲۵',
        updatedAt: '۱۴۰۳/۰۹/۰۴'
      },
      {
        id: 'prd-06',
        skuCode: 'DID-MED-1000',
        titleFa: 'پلاک شمش کادویی دیدار گلد ۱ گرمی ۲۴ عیار ۹۹۹.۹ با وکیوم امنیتی و چیپ NFC',
        familyId: 'bullion',
        familyTitleFa: '۴. محصولات سرمایه‌ای (Bullion)',
        category: 'standard_bullion',
        categoryFa: 'شمش استاندارد',
        subcategoryId: 'standard_bullion_bars',
        subcategoryFa: 'شمش استاندارد',
        carat: '24k_999',
        caratFa: '۲۴ عیار (۹۹۹.۹ خالص)',
        baseWeightGrams: 1.00,
        weightTolerancePercent: 0.05,
        makerWageType: 'fixed_per_gram',
        makerWageValue: 4500000,
        makerWageDisplay: '۴۵۰,۰۰۰ تومان کارمزد ثابت ضرب و بسته‌بندی امنیتی',
        recommendedWholesaleMargin: 1.2,
        stonesType: 'no_stones',
        stonesTypeFa: 'شمش خالص بدون نگین',
        stonesWeightDeducted: false,
        designStyleFa: 'شمش استاندارد اعتباری و سرمایه‌گذاری دیدار',
        storylineFa: 'شمش استانداردی حاوی یک گرم طلای ۲۴ عیار گرید شمش‌های بین‌المللی؛ بسته‌بندی در کارت وکیوم ضدجعل به همراه نشان هولوگرام لیزری سه‌بعدی و تراشه NFC جهت استعلام اصالت دیجیتال آنی در هسته K06.',
        craftingTechniqueFa: 'پرس هیدرولیک ۸۰۰ تن سکه‌زنی سوئیسی با عیارسنجی گواهی آزمایشگاه کوپلاسیون رسمی',
        tags: ['شمش', '۲۴_عیار', 'سرمایه_گذاری', 'کادویی', 'ضدجعل', 'NFC'],
        status: 'active',
        variants: [
          {
            id: 'var-06-1',
            skuCode: 'DID-MED-1000-1G-AU',
            sizeLabelFa: 'شمش ۱ گرمی استاندارد',
            color: 'yellow',
            colorFa: 'طلای زرد ۲۴ عیار خالص',
            targetWeightGrams: 1.000,
            toleranceGrams: 0.005,
            inStockQuantity: 150,
            barcode: '6269000110001'
          }
        ],
        narrativeAssets: [
          {
            id: 'ast-07',
            type: 'photo_hero',
            typeFa: 'تصویر شمش کادویی در کارت امنیتی',
            url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
            titleFa: 'شمش طلای ۱ گرمی دیدار با هولوگرام ضدجعل',
            descriptionFa: 'کارت امنیتی استاندارد با تاییدیه عیار ۹۹۹.۹ اتحادیه',
            isPrimary: true
          }
        ],
        createdAt: '۱۴۰۳/۰۴/۱۸',
        updatedAt: '۱۴۰۳/۰۹/۰۱'
      },
      {
        id: 'prd-07',
        skuCode: 'DID-BNG-8750',
        titleFa: 'النگو داماس ۲۱ عیار (۸۷۵) طرح بحرینی زرگری خلیجی',
        familyId: 'jewelry',
        familyTitleFa: '۱. زیورآلات بدنی (Jewelry)',
        category: 'bangle',
        categoryFa: 'النگو',
        subcategoryId: 'standard_bangle',
        subcategoryFa: 'النگو / Bangle',
        carat: '21k_875',
        caratFa: '۲۱ عیار (۸۷۵)',
        baseWeightGrams: 18.50,
        weightTolerancePercent: 1.5,
        makerWageType: 'percentage',
        makerWageValue: 4.8,
        makerWageDisplay: '۴.۸٪ روی طلای خام',
        recommendedWholesaleMargin: 1.8,
        stonesType: 'no_stones',
        stonesTypeFa: 'بدون نگین',
        stonesWeightDeducted: false,
        designStyleFa: 'سنتی خلیجی داماس',
        storylineFa: 'ساخت عیار استاندارد ۲۱ (۸۷۵ در هزار) ویژه صادرات و بازارهای جنوب کشور با جلای زرد درخشان خلیجی.',
        craftingTechniqueFa: 'تراش فیوژن با قلم دست و پولیش آینه‌ای',
        tags: ['النگو', '۲۱_عیار', '۸۷۵', 'بحرینی', 'خلیجی'],
        status: 'active',
        variants: [
          {
            id: 'var-07-1',
            skuCode: 'DID-BNG-8750-SZ2',
            sizeLabelFa: 'سایز ۲ (قطر داخلی ۵۶ میلی‌متر)',
            color: 'yellow',
            colorFa: 'طلای زرد ۲۱ عیار',
            targetWeightGrams: 18.50,
            toleranceGrams: 0.25,
            inStockQuantity: 20,
            barcode: '6269000187502'
          }
        ],
        narrativeAssets: [
          {
            id: 'ast-08',
            type: 'photo_hero',
            typeFa: 'تصویر اصلی استودیویی',
            url: 'https://images.unsplash.com/photo-1611591475839-729c24ed9804?auto=format&fit=crop&w=800&q=80',
            titleFa: 'النگوی ۲۱ عیار طرح بحرینی',
            isPrimary: true
          }
        ],
        createdAt: '۱۴۰۳/۰۸/۱۰',
        updatedAt: '۱۴۰۳/۰۹/۰۵'
      },
      {
        id: 'prd-08',
        skuCode: 'DID-BCN-9000',
        titleFa: 'مسکوک طلای بهار آزادی بانکی عیار ۹۰۰ (۲۱.۶ عیار) ضرب رسمی بانک مرکزی',
        familyId: 'bullion',
        familyTitleFa: '۴. محصولات سرمایه‌ای (Bullion)',
        category: 'bank_coin',
        categoryFa: 'سکه بانکی',
        subcategoryId: 'bahar_azadi_coin',
        subcategoryFa: 'سکه تمام بهار آزادی',
        carat: '21.6k_900',
        caratFa: '۲۱.۶ عیار (۹۰۰ سکه‌ای)',
        baseWeightGrams: 8.133,
        weightTolerancePercent: 0.05,
        makerWageType: 'fixed_per_gram',
        makerWageValue: 2000000,
        makerWageDisplay: '۲۰۰,۰۰۰ تومان حق‌الضرب رسمی',
        recommendedWholesaleMargin: 0.5,
        stonesType: 'no_stones',
        stonesTypeFa: 'مسکوک استاندارد قانونی',
        stonesWeightDeducted: false,
        designStyleFa: 'رسمی بانک مرکزی ج.ا.ا',
        storylineFa: 'مسکوک طلای استاندارد ضرب رسمی بانک مرکزی با خلوص ۹۰۰ در هزار (۲۱.۶ عیار) و وزن دقیق ۸.۱۳۳ گرم به همراه پاسپورت دیجیتال اصالت دیدار.',
        craftingTechniqueFa: 'ضرب سکه‌زنی ضرابخانه رسمی بانک مرکزی با قالب‌های استاندارد',
        tags: ['سکه', 'سکه_تمام', '۹۰۰', 'بانکی', 'بهار_آزادی'],
        status: 'active',
        variants: [
          {
            id: 'var-08-1',
            skuCode: 'DID-BCN-9000-FULL',
            sizeLabelFa: 'تمام بهار آزادی (۸.۱۳۳ گرم)',
            color: 'yellow',
            colorFa: 'طلای زرد ۲۱.۶ عیار',
            targetWeightGrams: 8.133,
            toleranceGrams: 0.005,
            inStockQuantity: 80,
            barcode: '6269000900010'
          }
        ],
        narrativeAssets: [
          {
            id: 'ast-09',
            type: 'photo_hero',
            typeFa: 'تصویر مسکوک در وکیوم دیدار',
            url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
            titleFa: 'سکه طلای بانکی عیار ۹۰۰',
            isPrimary: true
          }
        ],
        createdAt: '۱۴۰۳/۰۷/۱۵',
        updatedAt: '۱۴۰۳/۰۹/۰۲'
      },
      {
        id: 'prd-09',
        skuCode: 'DID-BUL-9950',
        titleFa: 'شمش طلای ۱۰۰ گرمی استاندارد ۹۹۵ معاملاتی بورس کالا و خزانه‌های بانکی',
        familyId: 'bullion',
        familyTitleFa: '۴. محصولات سرمایه‌ای (Bullion)',
        category: 'standard_bullion',
        categoryFa: 'شمش استاندارد',
        subcategoryId: 'standard_bullion_bars',
        subcategoryFa: 'شمش استاندارد',
        carat: '24k_995',
        caratFa: '۲۴ عیار (۹۹۵ بورس کالا)',
        baseWeightGrams: 100.00,
        weightTolerancePercent: 0.01,
        makerWageType: 'percentage',
        makerWageValue: 0.8,
        makerWageDisplay: '۰.۸٪ کارمزد تصفیه و عیارسنجی',
        recommendedWholesaleMargin: 0.3,
        stonesType: 'no_stones',
        stonesTypeFa: 'شمش خالص شمش‌ریزی معتبر',
        stonesWeightDeducted: false,
        designStyleFa: 'شمش رسمی مورد تایید بورس کالای ایران',
        storylineFa: 'شمش طلای ۱۰۰ گرمی با عیار ۹۹۵ در هزار مطابق با آیین‌نامه معاملات ابزارهای مشتقه و گواهی سپرده کالایی بورس کالا و بانک کارگشایی.',
        craftingTechniqueFa: 'ریخته‌گری مداوم پیوسته صنعتی با انگ رسمی کارخانه و کد شناسه یکتای ره‌گیری',
        tags: ['شمش', '۹۹۵', 'بورس_کالا', 'سرمایه_گذاری', '۱۰۰_گرمی'],
        status: 'active',
        variants: [
          {
            id: 'var-09-1',
            skuCode: 'DID-BUL-9950-100G',
            sizeLabelFa: 'شمش ۱۰۰ گرمی استاندارد',
            color: 'yellow',
            colorFa: 'طلای زرد ۲۴ عیار ۹۹۵',
            targetWeightGrams: 100.00,
            toleranceGrams: 0.01,
            inStockQuantity: 12,
            barcode: '6269000995100'
          }
        ],
        narrativeAssets: [
          {
            id: 'ast-10',
            type: 'photo_hero',
            typeFa: 'تصویر شمش ۱۰۰ گرمی ۹۹۵',
            url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
            titleFa: 'شمش طلای ۹۹۵ بورس کالا ۱۰۰ گرمی',
            isPrimary: true
          }
        ],
        createdAt: '۱۴۰۳/۰۵/۲۰',
        updatedAt: '۱۴۰۳/۰۹/۰۳'
      }
    ];

    // 2. پیشنهادهای ظرفیت تولید کارگاه‌ها و سازندگان (Supplier Capacity Offers)
    this.supplyOffers = [
      {
        id: 'off-01',
        offerCode: 'OFF-1403-101',
        supplierPartyId: 'sup-isf-01',
        supplierName: 'کارگاه زرگری زرین‌نقش اصفهان (خاندان نیلی)',
        supplierCityFa: 'اصفهان',
        supplierGrade: 'A_PLUS',
        productSkuId: 'prd-01',
        productSkuCode: 'DID-BNG-8820',
        productTitleFa: 'النگو طلا ۱۸ عیار ریخته‌گری طرح اسلیمی صفوی',
        weeklyCapacityGrams: 2800,
        minOrderQuantityGrams: 350,
        leadTimeDays: 3,
        offeredWageType: 'percentage',
        offeredWageValue: 5.2,
        offeredWageDisplay: '۵.۲٪ (تخفیف ویژه سفارش بالای ۱ کیلوگرم)',
        alloyQualityGuarantee: true,
        lossScrapAllowancePercent: 0.35,
        status: 'active',
        statusFa: 'فعال و آماده تولید',
        notes: 'قالب‌های ریخته‌گری سایزهای ۱ تا ۵ در کارگاه مستقر بوده و توان تحویل هفتگی تا ۲.۸ کیلوگرم با ری‌گیری استاندارد اصفهان تضمین می‌گردد.',
        validUntil: '۱۴۰۳/۱۲/۲۹',
        createdAt: '۱۴۰۳/۰۸/۱۵'
      },
      {
        id: 'off-02',
        offerCode: 'OFF-1403-102',
        supplierPartyId: 'sup-teh-02',
        supplierName: 'صنایع مدرن طلا و جواهر کارتیه تهران (بازار بزرگ)',
        supplierCityFa: 'تهران',
        supplierGrade: 'A',
        productSkuId: 'prd-02',
        productSkuCode: 'DID-BRC-4100',
        productTitleFa: 'دستبند کوبیک فیوژن ۱۸ عیار قفل مخفی کارتیه',
        weeklyCapacityGrams: 1600,
        minOrderQuantityGrams: 200,
        leadTimeDays: 4,
        offeredWageType: 'percentage',
        offeredWageValue: 6.8,
        offeredWageDisplay: '۶.۸٪ روی ارزش طلای خام',
        alloyQualityGuarantee: true,
        lossScrapAllowancePercent: 0.40,
        status: 'active',
        statusFa: 'فعال و آماده تولید',
        notes: 'مجهز به ۵ دستگاه تراش CNC پنج‌محور ایتالیایی با قفل‌های فنری استاندارد مقاوم در برابر سایش.',
        validUntil: '۱۴۰۴/۰۳/۳۱',
        createdAt: '۱۴۰۳/۰۸/۲۰'
      },
      {
        id: 'off-03',
        offerCode: 'OFF-1403-103',
        supplierPartyId: 'sup-tbz-03',
        supplierName: 'کارگاه مخراج‌کاری و جواهرسازی سهند تبریز',
        supplierCityFa: 'تبریز',
        supplierGrade: 'A_PLUS',
        productSkuId: 'prd-03',
        productSkuCode: 'DID-SET-9900',
        productTitleFa: 'سرویس کامل عروس طلا سفید طرح پر طاووس',
        weeklyCapacityGrams: 900,
        minOrderQuantityGrams: 150,
        leadTimeDays: 6,
        offeredWageType: 'percentage',
        offeredWageValue: 8.4,
        offeredWageDisplay: '۸.۴٪ (با کسر کامل وزن نگین‌های اتریشی)',
        alloyQualityGuarantee: true,
        lossScrapAllowancePercent: 0.50,
        status: 'active',
        statusFa: 'فعال و آماده تولید',
        notes: 'تضمین کسر دقیق وزن نگین در فاکتور رسمی بنکداری و پرداخت رودیوم‌پاشی مضاعف ضدتیرگی.',
        validUntil: '۱۴۰۳/۱۱/۳۰',
        createdAt: '۱۴۰۳/۰۸/۲۲'
      },
      {
        id: 'off-04',
        offerCode: 'OFF-1403-104',
        supplierPartyId: 'sup-yzd-04',
        supplierName: 'مجموعه طلا و زنجیرسازی یزد زرین',
        supplierCityFa: 'یزد',
        supplierGrade: 'A',
        productSkuId: 'prd-04',
        productSkuCode: 'DID-CHN-2050',
        productTitleFa: 'زنجیر ونیزی ایتالیایی ۱۸ عیار متراکم',
        weeklyCapacityGrams: 4500,
        minOrderQuantityGrams: 500,
        leadTimeDays: 2,
        offeredWageType: 'percentage',
        offeredWageValue: 4.1,
        offeredWageDisplay: '۴.۱٪ روی طلای خام (تیراژ صنعتی)',
        alloyQualityGuarantee: true,
        lossScrapAllowancePercent: 0.25,
        status: 'active',
        statusFa: 'فعال و آماده تولید',
        notes: 'خط تمام اتوماتیک تولید زنجیر بافت متراکم؛ کمترین درصد کسری ساخت در کشور با جوش لیزری هلیومی.',
        validUntil: '۱۴۰۴/۰۶/۳۱',
        createdAt: '۱۴۰۳/۰۸/۲۸'
      },
      {
        id: 'off-05',
        offerCode: 'OFF-1403-105',
        supplierPartyId: 'sup-msh-05',
        supplierName: 'کارگاه گوهرنشین و حلقه خاوران مشهد',
        supplierCityFa: 'مشهد',
        supplierGrade: 'B',
        productSkuId: 'prd-05',
        productSkuCode: 'DID-RNG-3310',
        productTitleFa: 'انگشتر تک‌نگین فیوژن سولیتر با رینگ دو لایه',
        weeklyCapacityGrams: 650,
        minOrderQuantityGrams: 100,
        leadTimeDays: 5,
        offeredWageType: 'percentage',
        offeredWageValue: 7.5,
        offeredWageDisplay: '۷.۵٪ روی طلای خام',
        alloyQualityGuarantee: true,
        lossScrapAllowancePercent: 0.45,
        status: 'negotiating',
        statusFa: 'در حال مذاکره شرایط تحویل',
        notes: 'در حال ارزیابی نمونه قالب‌های سایزبندی ۵۰ تا ۶۲ و هماهنگی استاندارد عیار با اتحادیه مشهد.',
        validUntil: '۱۴۰۳/۱۰/۳۰',
        createdAt: '۱۴۰۳/۰۹/۰۲'
      }
    ];

    // Enrich all seed products with explicit weight ranges
    this.products = this.products.map(p => this.enrichProduct(p));
  }

  public enrichProduct(p: ProductSku): ProductSku {
    p.variants = (p.variants || []).map((v) => {
      const target = Number(v.targetWeightGrams || p.baseWeightGrams || 10);
      const tol = Number(v.toleranceGrams || 0.25);
      const minW = v.minWeightGrams !== undefined ? Number(v.minWeightGrams) : Number((target - tol).toFixed(2));
      const maxW = v.maxWeightGrams !== undefined ? Number(v.maxWeightGrams) : Number((target + tol).toFixed(2));
      const rangeFa = v.weightRangeFa || `${minW.toFixed(2)} الی ${maxW.toFixed(2)} گرم`;
      return {
        ...v,
        targetWeightGrams: target,
        minWeightGrams: minW,
        maxWeightGrams: maxW,
        weightRangeFa: rangeFa,
      };
    });

    const allMin = p.variants.map((v) => v.minWeightGrams);
    const allMax = p.variants.map((v) => v.maxWeightGrams);
    const prodMin = allMin.length > 0 ? Math.min(...allMin) : Number((p.baseWeightGrams * 0.95).toFixed(2));
    const prodMax = allMax.length > 0 ? Math.max(...allMax) : Number((p.baseWeightGrams * 1.05).toFixed(2));

    p.minWeightGrams = p.minWeightGrams !== undefined ? Number(p.minWeightGrams) : prodMin;
    p.maxWeightGrams = p.maxWeightGrams !== undefined ? Number(p.maxWeightGrams) : prodMax;
    p.weightRangeFa = p.weightRangeFa || `${p.minWeightGrams.toFixed(2)} الی ${p.maxWeightGrams.toFixed(2)} گرم`;
    return p;
  }

  // دریافت تمام داده‌های K05
  public getData(): K05DataPayload {
    return {
      products: this.products,
      supplyOffers: this.supplyOffers,
      metrics: this.calculateMetrics(),
      marketRate: this.marketRate
    };
  }

  // محاسبه آمار و شاخص‌های کلیدی
  public calculateMetrics(): K05Metrics {
    const totalWeeklyCapacityGrams = this.supplyOffers
      .filter(o => o.status === 'active')
      .reduce((sum, o) => sum + o.weeklyCapacityGrams, 0);

    const totalStockGrams = this.products.reduce((acc, prd) => {
      const prdStock = prd.variants.reduce((vSum, v) => vSum + (v.inStockQuantity * v.targetWeightGrams), 0);
      return acc + prdStock;
    }, 0);

    const wageSum = this.products.reduce((acc, p) => acc + p.makerWageValue, 0);
    const avgWage = this.products.length > 0 ? Number((wageSum / this.products.length).toFixed(2)) : 0;

    const uniqueSuppliers = new Set(this.supplyOffers.map(o => o.supplierPartyId));

    // دسته‌بندی‌ها
    const categoryMap: Record<string, { count: number; totalWeight: number; nameFa: string }> = {};
    for (const prd of this.products) {
      if (!categoryMap[prd.category]) {
        categoryMap[prd.category] = { count: 0, totalWeight: 0, nameFa: prd.categoryFa };
      }
      categoryMap[prd.category].count += 1;
      const weightSum = prd.variants.reduce((s, v) => s + (v.inStockQuantity * v.targetWeightGrams), 0);
      categoryMap[prd.category].totalWeight += weightSum;
    }

    const categoryStats = Object.entries(categoryMap).map(([cat, val]) => ({
      category: cat as any,
      categoryFa: val.nameFa,
      productsCount: val.count,
      totalWeightKg: Number((val.totalWeight / 1000).toFixed(2))
    }));

    return {
      totalProductsCount: this.products.length,
      activeSkusCount: this.products.filter(p => p.status === 'active').length,
      totalWeeklyCapacityKg: Number((totalWeeklyCapacityGrams / 1000).toFixed(2)),
      averageMakerWagePercent: avgWage,
      totalAvailableStockGrams: Math.round(totalStockGrams),
      activeSuppliersCount: uniqueSuppliers.size,
      categoryStats
    };
  }

  // ثبت مدل محصول جدید
  public createProduct(data: Partial<ProductSku>): ProductSku {
    const nextNum = (this.products.length + 1).toString().padStart(2, '0');
    const newSku: ProductSku = {
      id: `prd-${nextNum}`,
      skuCode: data.skuCode || `DID-GLD-${Math.floor(1000 + Math.random() * 9000)}`,
      titleFa: data.titleFa || 'محصول جدید بدون عنوان',
      familyId: data.familyId || 'jewelry',
      familyTitleFa: data.familyTitleFa || '۱. زیورآلات بدنی (Jewelry)',
      category: data.category || 'bangle',
      categoryFa: data.categoryFa || 'النگو',
      subcategoryId: data.subcategoryId,
      subcategoryFa: data.subcategoryFa,
      carat: data.carat || '18k_750',
      caratFa: data.caratFa || '۱۸ عیار (۷۵۰)',
      baseWeightGrams: Number(data.baseWeightGrams) || 10.0,
      weightTolerancePercent: Number(data.weightTolerancePercent) || 2.0,
      makerWageType: data.makerWageType || 'percentage',
      makerWageValue: Number(data.makerWageValue) || 6.0,
      makerWageDisplay: data.makerWageType === 'percentage' ? `${data.makerWageValue}% روی طلای خام` : `${Number(data.makerWageValue).toLocaleString()} ریال/گرم`,
      recommendedWholesaleMargin: Number(data.recommendedWholesaleMargin) || 2.0,
      stonesType: data.stonesType || 'no_stones',
      stonesTypeFa: data.stonesTypeFa || 'بدون نگین',
      stonesWeightDeducted: Boolean(data.stonesWeightDeducted),
      designStyleFa: data.designStyleFa || 'کلاسیک مدرن',
      storylineFa: data.storylineFa || 'طراحی هماهنگ با خط تولید صنعتی دیدار گلد با بالاترین استانداردهای کیفیت ساخت.',
      craftingTechniqueFa: data.craftingTechniqueFa || 'ریخته‌گری دقیق القایی و تراش کامپیوتری',
      tags: data.tags && data.tags.length > 0 ? data.tags : ['طلا', 'محصول_جدید'],
      status: data.status || 'active',
      variants: data.variants && data.variants.length > 0 ? data.variants : [
        {
          id: `var-${nextNum}-1`,
          skuCode: `${data.skuCode || 'DID-SKU'}-STD`,
          sizeLabelFa: 'سایز استاندارد',
          color: 'yellow',
          colorFa: 'طلای زرد',
          targetWeightGrams: Number(data.baseWeightGrams) || 10.0,
          toleranceGrams: 0.2,
          inStockQuantity: 10,
          barcode: `6269000100${nextNum}`
        }
      ],
      narrativeAssets: data.narrativeAssets && data.narrativeAssets.length > 0 ? data.narrativeAssets : [
        {
          id: `ast-${nextNum}`,
          type: 'photo_hero',
          typeFa: 'تصویر اصلی محصول',
          url: 'https://images.unsplash.com/photo-1611591475839-729c24ed9804?auto=format&fit=crop&w=800&q=80',
          titleFa: 'نمای استودیویی کالا',
          isPrimary: true
        }
      ],
      createdAt: new Date().toLocaleDateString('fa-IR'),
      updatedAt: new Date().toLocaleDateString('fa-IR')
    };

    const enriched = this.enrichProduct(newSku);
    this.products.unshift(enriched);
    return enriched;
  }

  // به‌روزرسانی مدل محصول
  public updateProduct(id: string, updates: Partial<ProductSku>): ProductSku {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`محصول با شناسه ${id} یافت نشد.`);
    }
    this.products[index] = this.enrichProduct({
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toLocaleDateString('fa-IR')
    });
    return this.products[index];
  }

  // حذف مدل کالا
  public deleteProduct(id: string): boolean {
    const initialLen = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    // حذف پیشنهادهای متناظر
    this.supplyOffers = this.supplyOffers.filter(o => o.productSkuId !== id);
    return this.products.length < initialLen;
  }

  // ثبت پیشنهاد ظرفیت تولید جدید برای کارگاه
  public createSupplyOffer(data: Partial<SupplierCapacityOffer>): SupplierCapacityOffer {
    const nextCode = `OFF-1403-${Math.floor(100 + Math.random() * 900)}`;
    const product = this.products.find(p => p.id === data.productSkuId);

    const newOffer: SupplierCapacityOffer = {
      id: `off-${Date.now()}`,
      offerCode: nextCode,
      supplierPartyId: data.supplierPartyId || 'sup-new',
      supplierName: data.supplierName || 'کارگاه طلاسازی همکار دیدار',
      supplierCityFa: data.supplierCityFa || 'تهران',
      supplierGrade: data.supplierGrade || 'A',
      productSkuId: data.productSkuId || (product?.id || 'prd-01'),
      productSkuCode: product?.skuCode || 'DID-SKU',
      productTitleFa: product?.titleFa || 'مدل طلای انتخابی',
      weeklyCapacityGrams: Number(data.weeklyCapacityGrams) || 1000,
      minOrderQuantityGrams: Number(data.minOrderQuantityGrams) || 150,
      leadTimeDays: Number(data.leadTimeDays) || 3,
      offeredWageType: data.offeredWageType || 'percentage',
      offeredWageValue: Number(data.offeredWageValue) || 5.5,
      offeredWageDisplay: data.offeredWageType === 'percentage' ? `${data.offeredWageValue}% روی طلای خام` : `${Number(data.offeredWageValue).toLocaleString()} ریال/گرم`,
      alloyQualityGuarantee: data.alloyQualityGuarantee !== undefined ? data.alloyQualityGuarantee : true,
      lossScrapAllowancePercent: Number(data.lossScrapAllowancePercent) || 0.35,
      status: data.status || 'active',
      statusFa: data.status === 'active' ? 'فعال و آماده تولید' : 'در حال مذاکره شرایط تحویل',
      notes: data.notes || 'پیشنهاد ظرفیت تولید کارگاهی ثبت‌شده در سامانه کاتالوگ و تأمین دیدار گلد',
      validUntil: data.validUntil || '۱۴۰۴/۰۱/۳۱',
      createdAt: new Date().toLocaleDateString('fa-IR')
    };

    this.supplyOffers.unshift(newOffer);
    return newOffer;
  }

  // تغییر وضعیت پیشنهاد تولید
  public updateOfferStatus(id: string, status: SupplierCapacityOffer['status']): SupplierCapacityOffer {
    const offer = this.supplyOffers.find(o => o.id === id);
    if (!offer) {
      throw new Error(`پیشنهاد تولید با شناسه ${id} یافت نشد.`);
    }
    offer.status = status;
    const statusLabels = {
      active: 'فعال و آماده تولید',
      negotiating: 'در حال مذاکره شرایط تحویل',
      paused: 'موقتاً متوقف‌شده',
      exhausted: 'تکمیل ظرفیت کارگاه'
    };
    offer.statusFa = statusLabels[status] || status;
    return offer;
  }

  // به‌روزرسانی نرخ لحظه‌ای طلا
  public updateMarketRate(rates: Partial<LiveGoldSpotRate>): LiveGoldSpotRate {
    this.marketRate = {
      ...this.marketRate,
      ...rates,
      lastUpdatedFa: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };
    return this.marketRate;
  }

  // محاسبه قیمت آنلاین تخمینی طلا
  public estimateProductPrice(skuId: string, variantId?: string) {
    const product = this.products.find(p => p.id === skuId);
    if (!product) throw new Error('محصول یافت نشد.');

    let weight = product.baseWeightGrams;
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) weight = variant.targetWeightGrams;
    }

    const goldPricePerGram = this.marketRate.gold18kGramIrr;
    const rawGoldTotal = weight * goldPricePerGram;

    // محاسبه اجرت
    let makerWageTotal = 0;
    if (product.makerWageType === 'percentage') {
      makerWageTotal = rawGoldTotal * (product.makerWageValue / 100);
    } else {
      makerWageTotal = weight * product.makerWageValue;
    }

    // سود بنکداری
    const wholesaleMarginTotal = (rawGoldTotal + makerWageTotal) * (product.recommendedWholesaleMargin / 100);

    const totalEstimateIrr = rawGoldTotal + makerWageTotal + wholesaleMarginTotal;

    return {
      skuId,
      weightGrams: weight,
      goldPricePerGramIrr: goldPricePerGram,
      rawGoldTotalIrr: Math.round(rawGoldTotal),
      makerWageTotalIrr: Math.round(makerWageTotal),
      wholesaleMarginTotalIrr: Math.round(wholesaleMarginTotal),
      totalEstimateIrr: Math.round(totalEstimateIrr),
      totalEstimateToman: Math.round(totalEstimateIrr / 10)
    };
  }
}

export const k05Storage = new K05StorageEngine();
