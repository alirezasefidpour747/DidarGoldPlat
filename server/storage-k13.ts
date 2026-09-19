/**
 * Didar Gold Platform - Kernel 13 (K13) In-Memory Operational Storage & Pricing Engine
 * Subdomains:
 *   - K13A: Gold Reference Spot Rates & Quote Lock Engine
 *   - K13B: Making Wage & Markup Matrix (Iran Gold Tax Law Art. 26 Compliant)
 *   - K13C: Official Invoicing & Samaneh Moaddian Integration
 */

import crypto from 'crypto';
import {
  GoldSpotRate,
  PriceQuoteLock,
  MakingWageRule,
  Invoice,
  InvoiceItem,
  K13DataPayload,
  PriceCalculationInput,
  PriceCalculationResult,
  RateAuthorizedUser,
  RateChangeAuditLog,
  RateSecurityPolicy,
  RatePermissionKey,
  TaxConsolidationPeriod
} from '../src/types/k13.js';

class K13Storage {
  private rates: GoldSpotRate[] = [
    {
      id: 'rate-18k-750',
      symbol: 'GOLD_18K_750',
      titleFa: 'طلای ۱۸ عیار (۷۵۰)',
      titleEn: '18 Karat Gold (750)',
      buyPriceToman: 4185000,
      sellPriceToman: 4210000,
      changePercent24h: 1.25,
      unitFa: 'گرم',
      source: 'اتحادیه طلا و جواهر تهران',
      updatedAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰',
      isPrimaryReference: true
    },
    {
      id: 'rate-24k-995',
      symbol: 'GOLD_24K_995',
      titleFa: 'شمش طلا ۲۴ عیار (۹۹۵)',
      titleEn: '24 Karat Bar (995)',
      buyPriceToman: 5550000,
      sellPriceToman: 5580000,
      changePercent24h: 1.18,
      unitFa: 'گرم',
      source: 'اتحادیه طلا و جواهر تهران',
      updatedAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰',
      isPrimaryReference: false
    },
    {
      id: 'rate-24k-999',
      symbol: 'GOLD_24K_999',
      titleFa: 'طلای خام ۲۴ عیار (۹۹۹.۹)',
      titleEn: '24 Karat Pure (999.9)',
      buyPriceToman: 5580000,
      sellPriceToman: 5612000,
      changePercent24h: 1.20,
      unitFa: 'گرم',
      source: 'شمش بین‌المللی',
      updatedAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰',
      isPrimaryReference: false
    },
    {
      id: 'rate-mesghal-17k',
      symbol: 'GOLD_MESGHAL_17K',
      titleFa: 'مثقال آبشده (۱۷ عیار - ۷۰۵)',
      titleEn: 'Mithqal Melted Gold (17K - 705)',
      buyPriceToman: 18120000,
      sellPriceToman: 18230000,
      changePercent24h: 1.15,
      unitFa: 'مثقال (۴.۶۰۸۳ گرم)',
      source: 'بازار بزرگ طلا تهران (سبزه میدان)',
      updatedAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰',
      isPrimaryReference: false
    },
    {
      id: 'rate-ounce-usd',
      symbol: 'GOLD_OUNCE_USD',
      titleFa: 'انس جهانی طلا',
      titleEn: 'Spot Gold Ounce',
      buyPriceToman: 2684, // USD per ounce
      sellPriceToman: 2686,
      changePercent24h: 0.45,
      unitFa: 'دلار بر انس',
      source: 'بازار جهانی کیتکو (Kitco)',
      updatedAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰',
      isPrimaryReference: false
    },
    {
      id: 'rate-sekke-emami',
      symbol: 'SEKKE_EMAMI',
      titleFa: 'سکه تمام طرح جدید (امامی)',
      titleEn: 'Emami Full Coin',
      buyPriceToman: 49800000,
      sellPriceToman: 50400000,
      changePercent24h: 0.95,
      unitFa: 'قطعه',
      source: 'اتحادیه صرافان و طلافروشان',
      updatedAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰',
      isPrimaryReference: false
    },
    {
      id: 'rate-sekke-bahar',
      symbol: 'SEKKE_BAHAR',
      titleFa: 'سکه بهار آزادی (طرح قدیم)',
      titleEn: 'Bahar Azadi Full Coin',
      buyPriceToman: 44200000,
      sellPriceToman: 44800000,
      changePercent24h: 0.80,
      unitFa: 'قطعه',
      source: 'اتحادیه صرافان و طلافروشان',
      updatedAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰',
      isPrimaryReference: false
    },
    {
      id: 'rate-sekke-nim',
      symbol: 'SEKKE_NIM',
      titleFa: 'نیم سکه بهار آزادی',
      titleEn: 'Half Coin Azadi',
      buyPriceToman: 25600000,
      sellPriceToman: 26100000,
      changePercent24h: 0.65,
      unitFa: 'قطعه',
      source: 'اتحادیه صرافان و طلافروشان',
      updatedAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰',
      isPrimaryReference: false
    },
    {
      id: 'rate-sekke-rob',
      symbol: 'SEKKE_ROB',
      titleFa: 'ربع سکه بهار آزادی',
      titleEn: 'Quarter Coin Azadi',
      buyPriceToman: 15900000,
      sellPriceToman: 16400000,
      changePercent24h: 1.10,
      unitFa: 'قطعه',
      source: 'اتحادیه صرافان و طلافروشان',
      updatedAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰',
      isPrimaryReference: false
    }
  ];

  private wageRules: MakingWageRule[] = [
    {
      id: 'rule-bangle',
      categoryKey: 'bangle',
      categoryNameFa: 'النگو و تک‌پوش طلا',
      wageType: 'percentage',
      baseWagePercent: 6.5,
      baseWageFixedToman: 0,
      didarMarginPercent: 1.8,
      vatPercent: 10,
      minGrams: 10,
      applicableTiers: ['T1', 'T2', 'T3'],
      tierDiscountPercent: { T1: 0, T2: 0.5, T3: 1.0 },
      notesFa: 'مناسب برای تیراژ عمده؛ اجرت پایدار صنعتی'
    },
    {
      id: 'rule-ring',
      categoryKey: 'ring',
      categoryNameFa: 'انگشتر و حلقه طلا',
      wageType: 'percentage',
      baseWagePercent: 9.0,
      baseWageFixedToman: 0,
      didarMarginPercent: 2.0,
      vatPercent: 10,
      minGrams: 3,
      applicableTiers: ['T1', 'T2', 'T3'],
      tierDiscountPercent: { T1: 0, T2: 0.6, T3: 1.2 },
      notesFa: 'محاسبه بدون نگین؛ هزینه مخراجی در صورت وجود جداگانه اضافه می‌شود'
    },
    {
      id: 'rule-necklace',
      categoryKey: 'necklace',
      categoryNameFa: 'گردنبند، مدال و سینه ریز',
      wageType: 'percentage',
      baseWagePercent: 11.5,
      baseWageFixedToman: 0,
      didarMarginPercent: 2.0,
      vatPercent: 10,
      minGrams: 5,
      applicableTiers: ['T1', 'T2', 'T3'],
      tierDiscountPercent: { T1: 0, T2: 0.8, T3: 1.5 },
      notesFa: 'اجرت طراحی هنری و زنجیرهای ظریف فیوژن'
    },
    {
      id: 'rule-bracelet',
      categoryKey: 'bracelet',
      categoryNameFa: 'دستبند زنجیری و چرم‌طلا',
      wageType: 'percentage',
      baseWagePercent: 8.5,
      baseWageFixedToman: 0,
      didarMarginPercent: 1.8,
      vatPercent: 10,
      minGrams: 4,
      applicableTiers: ['T1', 'T2', 'T3'],
      tierDiscountPercent: { T1: 0, T2: 0.5, T3: 1.0 },
      notesFa: 'قفل‌های استاندارد فنری با کسر وزن چرم'
    },
    {
      id: 'rule-earring',
      categoryKey: 'earring',
      categoryNameFa: 'گوشواره و پلاک ظریف',
      wageType: 'percentage',
      baseWagePercent: 10.0,
      baseWageFixedToman: 0,
      didarMarginPercent: 2.0,
      vatPercent: 10,
      minGrams: 2,
      applicableTiers: ['T1', 'T2', 'T3'],
      tierDiscountPercent: { T1: 0, T2: 0.7, T3: 1.2 }
    },
    {
      id: 'rule-coin-bar',
      categoryKey: 'coin_bar',
      categoryNameFa: 'شمش رسمی و پلاک کادویی',
      wageType: 'fixed_per_gram',
      baseWagePercent: 0,
      baseWageFixedToman: 75000,
      didarMarginPercent: 0.8,
      vatPercent: 10,
      minGrams: 1,
      applicableTiers: ['T1', 'T2', 'T3'],
      tierDiscountPercent: { T1: 0, T2: 15000, T3: 25000 },
      notesFa: 'شمش با بسته‌بندی هولوگرام‌دار و وکیوم امنیتی عیار ۹۹۵'
    }
  ];

  private activeLocks: PriceQuoteLock[] = [
    {
      quoteId: 'QUOTE-1403-9901',
      token: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      buyerOrgId: 'org-r-01',
      buyerOrgNameFa: 'گالری طلا و جواهر زمرد تهران',
      lockedRatePerGram750Toman: 4210000,
      lockedAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۲۸',
      expiresAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۳',
      validitySeconds: 300,
      remainingSeconds: 185,
      status: 'active',
      statusFa: 'معتبر و قفل‌شده (۵ دقیقه گارانتی نرخ)',
      totalWeightGrams: 85.5,
      calculatedTotalToman: 396825000,
      purpose: 'تثبیت مظنه برای ثبت سفارش خرید النگو داماس'
    },
    {
      quoteId: 'QUOTE-1403-9902',
      token: '9f83c60579a5d38e1e431702e30f1404e9a614dd829c1f72910400c4fdb0d01c',
      buyerOrgId: 'org-r-02',
      buyerOrgNameFa: 'جواهرسرای عقیق اصفهان',
      lockedRatePerGram750Toman: 4205000,
      lockedAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۱۵',
      expiresAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۲۰',
      validitySeconds: 300,
      remainingSeconds: 0,
      status: 'expired',
      statusFa: 'منقضی‌شده',
      totalWeightGrams: 42.0,
      calculatedTotalToman: 197400000,
      purpose: 'استعلام مظنه پیش‌فاکتور دستبند فیوژن'
    }
  ];

  private invoices: Invoice[] = [
    {
      id: 'inv-101',
      invoiceNumber: 'INV-1403-7740',
      taxIdentificationNumber: 'A140388210009988112233',
      orderCode: 'ORD-1403-8821',
      invoiceType: 'official_tax_invoice',
      invoiceTypeFa: 'صورتحساب الکترونیکی رسمی (نوع اول - سامانه مودیان)',
      status: 'moaddian_sent',
      statusFa: 'ارسال قطعی به سامانه مودیان مالیاتی',
      buyerOrgId: 'org-r-01',
      buyerNameFa: 'گالری طلا و جواهر زمرد تهران',
      buyerNationalId: '10103569841',
      buyerEconomicCode: '411589632145',
      buyerAddressFa: 'تهران، بازار بزرگ، سرای امید، پلاک ۲۴',
      buyerPhone: '021-55623344',
      retailerTier: 'T3',
      sellerNameFa: 'شرکت تجارت فناوری‌های طلایی دیدار (سهامی خاص)',
      sellerNationalId: '14010896325',
      sellerEconomicCode: '411632587412',
      sellerAddressFa: 'تهران، خیابان ولیعصر، برج فناوری دیدار، طبقه ۸',
      issueDateFa: '۱۴۰۳/۰۹/۰۸',
      dueDateFa: '۱۴۰۳/۰۹/۰۸',
      settledAtFa: '۱۴۰۳/۰۹/۰۸ ۱۱:۴۵',
      items: [
        {
          id: 'item-1',
          sku: 'SKU-GLD-18K-B01',
          productCode: 'GLD-18K-DAMAS-B01',
          titleFa: 'النگو طلا داماس تراش‌خورده ۱۸ عیار',
          categoryFa: 'النگو و تک‌پوش طلا',
          carat: 750,
          weightGrams: 85.5,
          spotGoldPricePerGramToman: 4210000,
          goldPureValueToman: 359955000,
          makingWageType: 'percentage',
          makingWagePercent: 5.5,
          makingWageAmountToman: 19797525,
          didarMarginPercent: 1.8,
          didarMarginAmountToman: 6479190,
          unitPriceToman: 4523240,
          unitPriceBeforeDiscountToman: 4545838,
          itemDiscountPercent: -0.5, // 0.5% discount on item (within max 1%)
          itemDiscountAmountToman: 1931150,
          lineDiscountType: 'percentage',
          lineDiscountPercent: -0.5,
          lineDiscountAmountToman: 1931150,
          lineDiscountReasonFa: 'تخفیف تعدیل خطی خوش‌حسابی و تناژ ردیف النگو',
          taxableAmountToman: 24345565,
          vatRatePercent: 10,
          vatAmountToman: 2434557,
          netUnitPriceToman: 4523240,
          totalPriceToman: 386735122,
          netLineTotalToman: 386735122
        }
      ],
      totalWeightGrams: 85.5,
      pureGoldEquivalentGrams750: 85.5,
      totalPureGoldValueToman: 359955000,
      totalMakingWageToman: 19797525,
      totalDidarMarginToman: 6479190,
      totalItemDiscountsToman: 1931150,
      subtotalBeforeVolumeDiscountToman: 386735122,

      // Volume discount: 1.0% discount based on 85.5g volume (within max 2%)
      volumeDiscountPercent: -1.0,
      volumeDiscountAmountToman: 3867351,

      totalTaxableAmountToman: 24345565,
      totalVatToman: 2434557,
      grandTotalToman: 382867771,
      grandTotalRials: 3828677710,

      // Split Settlement: 40% Rial, 60% Gold (Requires Quote Lock)
      settlementMode: 'split',
      settlementModeFa: 'تسویه ترکیبی (۴۰٪ ریالی / ۶۰٪ طلایی)',
      rialSplitPercent: 40,
      goldSplitPercent: 60,
      settlementRialAmountToman: 153147108,
      settlementGoldWeightGrams750: 51.30,
      isQuoteLocked: true,
      lockedQuoteRateToman: 4210000,
      quoteLockId: 'QUOTE-1403-9901',

      paymentTermsFa: 'تسویه ترکیبی (۴۰٪ ریالی همزمان با تحویل + ۶۰٪ حواله طلای آبشده عیار ۷۵۰)',
      moaddianStatus: 'verified',
      moaddianStatusFa: 'مورد تأیید کارپوشه سامانه مودیان',
      moaddianTrackingCode: 'MOD-IR-1403-98213455',
      moaddianSentAtFa: '۱۴۰۳/۰۹/۰۸ ۱۲:۱۰',

      zarrinVoucher: {
        voucherNumber: 'SANAD-ZR-1403-8821',
        voucherDateFa: '۱۴۰۳/۰۹/۰۸',
        rialDebitAccount: 'بدهکاران تجاری / گالری زمرد کیش (کد ۱۱۰۴۲)',
        rialAmountToman: 153147108,
        goldDebitAccount: 'حساب طلایی / کاردکس امانی طلای ۷۵۰ (کد ۲۰۲۰۱)',
        goldWeightGrams750: 51.30,
        goldSpotRateAppliedToman: 4210000,
        quoteLockId: 'QUOTE-1403-9901',
        status: 'posted_to_zarrin',
        statusFa: 'سند دوبل در دفترکل زرین ثبت شد',
        zarrinBatchId: 'BATCH-ZR-9081'
      },

      notes: 'صورتحساب رسمی مطابق ماده ۲۶ قانون مالیات بر ارزش افزوده طلا با اعمال تخفیف حجمی و قفل مظنه',
      createdAt: '2024-11-28T08:10:00.000Z'
    },
    {
      id: 'inv-102',
      invoiceNumber: 'PRO-1403-1205',
      taxIdentificationNumber: 'B140312050001122334455',
      orderCode: 'ORD-1403-9014',
      invoiceType: 'proforma',
      invoiceTypeFa: 'پیش‌فاکتور تجاری با مهلت تسویه',
      status: 'locked_quote',
      statusFa: 'مظنه قفل‌شده، در انتظار تسویه و تایید مالی',
      buyerOrgId: 'org-r-02',
      buyerNameFa: 'جواهرسرای عقیق اصفهان',
      buyerNationalId: '10260487593',
      buyerEconomicCode: '411896541235',
      buyerAddressFa: 'اصفهان، میدان نقش جهان، بازار قیصریه، پلاک ۱۱۸',
      buyerPhone: '031-32219988',
      retailerTier: 'T2',
      sellerNameFa: 'شرکت تجارت فناوری‌های طلایی دیدار (سهامی خاص)',
      sellerNationalId: '14010896325',
      sellerEconomicCode: '411632587412',
      sellerAddressFa: 'تهران، خیابان ولیعصر، برج فناوری دیدار، طبقه ۸',
      issueDateFa: '۱۴۰۳/۰۹/۰۸',
      dueDateFa: '۱۴۰۳/۰۹/۰۹',
      items: [
        {
          id: 'item-2',
          sku: 'SKU-GLD-18K-R02',
          productCode: 'GLD-18K-SOLITAIRE-R02',
          titleFa: 'انگشتر سولیتر برلیان ۱۸ عیار دیدار',
          categoryFa: 'انگشتر و حلقه طلا',
          carat: 750,
          weightGrams: 4.8,
          spotGoldPricePerGramToman: 4210000,
          goldPureValueToman: 20208000,
          makingWageType: 'percentage',
          makingWagePercent: 8.4,
          makingWageAmountToman: 1697472,
          didarMarginPercent: 2.0,
          didarMarginAmountToman: 404160,
          unitPriceToman: 4733300,
          unitPriceBeforeDiscountToman: 4733300,
          itemDiscountPercent: 0,
          itemDiscountAmountToman: 0,
          lineDiscountType: 'percentage',
          lineDiscountPercent: 0,
          lineDiscountAmountToman: 0,
          taxableAmountToman: 2101632,
          vatRatePercent: 10,
          vatAmountToman: 210163,
          netUnitPriceToman: 4733300,
          totalPriceToman: 22719795,
          netLineTotalToman: 22719795
        }
      ],
      totalWeightGrams: 4.8,
      pureGoldEquivalentGrams750: 4.8,
      totalPureGoldValueToman: 20208000,
      totalMakingWageToman: 1697472,
      totalDidarMarginToman: 404160,
      totalItemDiscountsToman: 0,
      subtotalBeforeVolumeDiscountToman: 22719795,

      volumeDiscountPercent: 0,
      volumeDiscountAmountToman: 0,

      totalTaxableAmountToman: 2101632,
      totalVatToman: 210163,
      grandTotalToman: 22719795,
      grandTotalRials: 227197950,

      // 100% Rial Settlement (Requires Quote Lock)
      settlementMode: 'rial_only',
      settlementModeFa: 'تسویه ۱۰۰٪ ریالی (با قفل مظنه تضمین‌شده)',
      rialSplitPercent: 100,
      goldSplitPercent: 0,
      settlementRialAmountToman: 22719795,
      settlementGoldWeightGrams750: 0,
      isQuoteLocked: true,
      lockedQuoteRateToman: 4210000,
      quoteLockId: 'QUOTE-1403-9901',

      paymentTermsFa: 'اعتباری ۳۰ روزه با تضامین K14',
      moaddianStatus: 'pending',
      moaddianStatusFa: 'پس از صدور قطعی فاکتور ارسال خواهد شد',

      zarrinVoucher: {
        voucherNumber: 'SANAD-ZR-1403-DRAFT-02',
        voucherDateFa: '۱۴۰۳/۰۹/۰۸',
        rialDebitAccount: 'اسناد دریافتنی تجاری / عقیق اصفهان (کد ۱۱۰۵۵)',
        rialAmountToman: 22719795,
        goldDebitAccount: 'عدم درگیری حساب طلایی (تسویه صرفاً ریالی)',
        goldWeightGrams750: 0,
        goldSpotRateAppliedToman: 4210000,
        quoteLockId: 'QUOTE-1403-9901',
        status: 'draft',
        statusFa: 'پیش‌نویس سند تسویه در انتظار تایید خریدار',
        zarrinBatchId: 'BATCH-ZR-9082'
      },

      notes: 'پیش‌فاکتور جهت بارگذاری در کارپوشه خریدار',
      createdAt: '2024-11-28T09:15:00.000Z'
    },
    {
      id: 'inv-103',
      invoiceNumber: 'INV-1403-8819',
      taxIdentificationNumber: 'C140388190003344556677',
      orderCode: 'ORD-1403-8819',
      invoiceType: 'official_tax_invoice',
      invoiceTypeFa: 'صورتحساب رسمی فروش عمده با تسویه ترکیبی',
      status: 'moaddian_sent',
      statusFa: 'ارسال به مودیان / نیازمند پوشش وثیقه',
      buyerOrgId: 'org-ret-ehsan-005',
      buyerNameFa: 'طلا و جواهرات احسان (ونک)',
      buyerNationalId: '14009210982',
      buyerEconomicCode: '411629810234',
      buyerAddressFa: 'تهران، میدان ونک، مجتمع تجاری پایتخت، طبقه اول',
      buyerPhone: '021-88771234',
      retailerTier: 'T2',
      sellerNameFa: 'شرکت تجارت فناوری‌های طلایی دیدار (سهامی خاص)',
      sellerNationalId: '14010896325',
      sellerEconomicCode: '411632587412',
      sellerAddressFa: 'تهران، خیابان ولیعصر، برج فناوری دیدار، طبقه ۸',
      issueDateFa: '۱۴۰۳/۰۹/۰۷',
      dueDateFa: '۱۴۰۳/۰۹/۲۵',
      items: [
        {
          id: 'item-3',
          sku: 'SKU-GLD-18K-N03',
          productCode: 'GLD-18K-COLLAR-N03',
          titleFa: 'سرویس طلا تراش‌خورده و سینه ریز ۱۸ عیار',
          categoryFa: 'سرویس و نیم‌ست طلا',
          carat: 750,
          weightGrams: 110.0,
          spotGoldPricePerGramToman: 4210000,
          goldPureValueToman: 463100000,
          makingWageType: 'percentage',
          makingWagePercent: 6.0,
          makingWageAmountToman: 27786000,
          didarMarginPercent: 1.5,
          didarMarginAmountToman: 6946500,
          unitPriceToman: 4525750,
          unitPriceBeforeDiscountToman: 4525750,
          itemDiscountPercent: 0,
          itemDiscountAmountToman: 0,
          lineDiscountType: 'percentage',
          lineDiscountPercent: 0,
          lineDiscountAmountToman: 0,
          taxableAmountToman: 34732500,
          vatRatePercent: 10,
          vatAmountToman: 3473250,
          netUnitPriceToman: 4525750,
          totalPriceToman: 497832500,
          netLineTotalToman: 497832500
        }
      ],
      totalWeightGrams: 110.0,
      pureGoldEquivalentGrams750: 110.0,
      totalPureGoldValueToman: 463100000,
      totalMakingWageToman: 27786000,
      totalDidarMarginToman: 6946500,
      totalItemDiscountsToman: 0,
      subtotalBeforeVolumeDiscountToman: 497832500,
      volumeDiscountPercent: 0,
      volumeDiscountAmountToman: 0,
      totalTaxableAmountToman: 34732500,
      totalVatToman: 3473250,
      grandTotalToman: 497832500,
      grandTotalRials: 4978325000,
      settlementMode: 'split',
      settlementModeFa: 'تسویه ترکیبی (۵۰٪ طلا / ۵۰٪ ریال)',
      rialSplitPercent: 50,
      goldSplitPercent: 50,
      settlementRialAmountToman: 248916250,
      settlementGoldWeightGrams750: 55.0,
      isQuoteLocked: true,
      lockedQuoteRateToman: 4210000,
      paymentTermsFa: 'اعتباری با تسویه تعهدی',
      moaddianStatus: 'verified',
      moaddianStatusFa: 'مورد تایید مودیان',
      zarrinVoucher: {
        voucherNumber: 'SANAD-ZR-1403-8825',
        voucherDateFa: '۱۴۰۳/۰۹/۰۷',
        rialDebitAccount: 'بدهکاران تجاری / طلا احسان (کد ۱۱۰۴۹)',
        rialAmountToman: 248916250,
        goldDebitAccount: 'حساب طلایی / کاردکس امانی طلای ۷۵۰ (کد ۲۰۲۰۱)',
        goldWeightGrams750: 55.0,
        goldSpotRateAppliedToman: 4210000,
        status: 'posted_to_zarrin',
        statusFa: 'سند دوبل در دفترکل زرین ثبت شد',
        zarrinBatchId: 'BATCH-ZR-9083'
      },
      createdAt: '2024-11-27T10:00:00.000Z'
    },
    {
      id: 'inv-104',
      invoiceNumber: 'INV-1403-9042',
      taxIdentificationNumber: 'D140390420005566778899',
      orderCode: 'ORD-1403-9042',
      invoiceType: 'official_tax_invoice',
      invoiceTypeFa: 'صورتحساب رسمی طلای آبشده و شمش بنکداری',
      status: 'settled',
      statusFa: 'تسویه شده / مغایرت در ثبت وزنی دفتر دوبل',
      buyerOrgId: 'org-whs-pars-003',
      buyerNameFa: 'بازرگانی طلا و جواهر پارس زرین',
      buyerNationalId: '10380291482',
      buyerEconomicCode: '411982341298',
      buyerAddressFa: 'تهران، بازار بزرگ، پاساژ حکیم هاشمی، پلاک ۴۲',
      buyerPhone: '021-55618290',
      retailerTier: 'T1',
      sellerNameFa: 'شرکت تجارت فناوری‌های طلایی دیدار (سهامی خاص)',
      sellerNationalId: '14010896325',
      sellerEconomicCode: '411632587412',
      sellerAddressFa: 'تهران، خیابان ولیعصر، برج فناوری دیدار، طبقه ۸',
      issueDateFa: '۱۴۰۳/۰۹/۰۵',
      dueDateFa: '۱۴۰۳/۰۹/۰۵',
      paymentTermsFa: 'تسویه کامل وزنی نقدی در زمان تحویل',
      settledAtFa: '۱۴۰۳/۰۹/۰۵ ۱۶:۲۰',
      items: [
        {
          id: 'item-4',
          sku: 'SKU-GLD-BAR-250G',
          productCode: 'GLD-750-BAR-250',
          titleFa: 'شمش ریخته‌گری طلای ۱۸ عیار استاندارد دیدار',
          categoryFa: 'شمش و آبشده طلا',
          carat: 750,
          weightGrams: 250.0,
          spotGoldPricePerGramToman: 4210000,
          goldPureValueToman: 1052500000,
          makingWageType: 'fixed_per_gram',
          makingWagePercent: 1.2,
          makingWageAmountToman: 12630000,
          didarMarginPercent: 0.8,
          didarMarginAmountToman: 8420000,
          unitPriceToman: 4294200,
          unitPriceBeforeDiscountToman: 4294200,
          itemDiscountPercent: 0,
          itemDiscountAmountToman: 0,
          lineDiscountType: 'percentage',
          lineDiscountPercent: 0,
          lineDiscountAmountToman: 0,
          taxableAmountToman: 21050000,
          vatRatePercent: 10,
          vatAmountToman: 2105000,
          netUnitPriceToman: 4294200,
          totalPriceToman: 1073550000,
          netLineTotalToman: 1073550000
        }
      ],
      totalWeightGrams: 250.0,
      pureGoldEquivalentGrams750: 250.0,
      totalPureGoldValueToman: 1052500000,
      totalMakingWageToman: 12630000,
      totalDidarMarginToman: 8420000,
      totalItemDiscountsToman: 0,
      subtotalBeforeVolumeDiscountToman: 1073550000,
      volumeDiscountPercent: 0,
      volumeDiscountAmountToman: 0,
      totalTaxableAmountToman: 21050000,
      totalVatToman: 2105000,
      grandTotalToman: 1073550000,
      grandTotalRials: 10735500000,
      settlementMode: 'gold_only',
      settlementModeFa: 'تسویه ۱۰۰٪ وزنی طلا',
      rialSplitPercent: 0,
      goldSplitPercent: 100,
      settlementRialAmountToman: 21050000,
      settlementGoldWeightGrams750: 250.0,
      isQuoteLocked: true,
      lockedQuoteRateToman: 4210000,
      moaddianStatus: 'verified',
      moaddianStatusFa: 'مورد تایید مودیان',
      zarrinVoucher: {
        voucherNumber: 'SANAD-ZR-1403-8828',
        voucherDateFa: '۱۴۰۳/۰۹/۰۵',
        rialDebitAccount: 'بدهکاران تجاری / پارس زرین (کد ۱۱۰۳۱)',
        rialAmountToman: 21050000,
        goldDebitAccount: 'حساب طلایی / کاردکس امانی طلای ۷۵۰ (کد ۲۰۲۰۱)',
        goldWeightGrams750: 248.5,
        goldSpotRateAppliedToman: 4210000,
        status: 'posted_to_zarrin',
        statusFa: 'سند ثبت شده با اختلاف وزنی ۱.۵ گرم',
        zarrinBatchId: 'BATCH-ZR-9084'
      },
      createdAt: '2024-11-25T14:30:00.000Z'
    },
    {
      id: 'inv-105',
      invoiceNumber: 'INV-1403-6620',
      taxIdentificationNumber: 'E140366200007788990011',
      orderCode: 'ORD-1403-6620',
      invoiceType: 'official_tax_invoice',
      invoiceTypeFa: 'صورتحساب رسمی فروش اعتباری معوق',
      status: 'issued',
      statusFa: 'معوق و سررسید گذشته / قفل حساب اعتباری',
      buyerOrgId: 'org-ret-kimia-006',
      buyerNameFa: 'گالری طلای کیمیا نوین',
      buyerNationalId: '14006781290',
      buyerEconomicCode: '411782390112',
      buyerAddressFa: 'تهران، صادقیه، فلکه دوم، پاساژ افق، پلاک ۷',
      buyerPhone: '021-44221190',
      retailerTier: 'T3',
      sellerNameFa: 'شرکت تجارت فناوری‌های طلایی دیدار (سهامی خاص)',
      sellerNationalId: '14010896325',
      sellerEconomicCode: '411632587412',
      sellerAddressFa: 'تهران، خیابان ولیعصر، برج فناوری دیدار، طبقه ۸',
      issueDateFa: '۱۴۰۳/۰۸/۱۰',
      dueDateFa: '۱۴۰۳/۰۸/۲۵',
      paymentTermsFa: 'اعتباری ۱۵ روزه با تضمین چک صیادی و سفته',
      items: [
        {
          id: 'item-5',
          sku: 'SKU-GLD-RING-SET',
          productCode: 'GLD-18K-RINGS-05',
          titleFa: 'مجموعه انگشترهای نگین‌دار ۱۸ عیار',
          categoryFa: 'انگشتر و حلقه طلا',
          carat: 750,
          weightGrams: 45.0,
          spotGoldPricePerGramToman: 4180000,
          goldPureValueToman: 188100000,
          makingWageType: 'percentage',
          makingWagePercent: 7.0,
          makingWageAmountToman: 13167000,
          didarMarginPercent: 1.5,
          didarMarginAmountToman: 2821500,
          unitPriceToman: 4535300,
          unitPriceBeforeDiscountToman: 4535300,
          itemDiscountPercent: 0,
          itemDiscountAmountToman: 0,
          lineDiscountType: 'percentage',
          lineDiscountPercent: 0,
          lineDiscountAmountToman: 0,
          taxableAmountToman: 15988500,
          vatRatePercent: 10,
          vatAmountToman: 1598850,
          netUnitPriceToman: 4535300,
          totalPriceToman: 204088500,
          netLineTotalToman: 204088500
        }
      ],
      totalWeightGrams: 45.0,
      pureGoldEquivalentGrams750: 45.0,
      totalPureGoldValueToman: 188100000,
      totalMakingWageToman: 13167000,
      totalDidarMarginToman: 2821500,
      totalItemDiscountsToman: 0,
      subtotalBeforeVolumeDiscountToman: 204088500,
      volumeDiscountPercent: 0,
      volumeDiscountAmountToman: 0,
      totalTaxableAmountToman: 15988500,
      totalVatToman: 1598850,
      grandTotalToman: 204088500,
      grandTotalRials: 2040885000,
      settlementMode: 'rial_only',
      settlementModeFa: 'تسویه ۱۰۰٪ ریالی اعتباری (معوق)',
      rialSplitPercent: 100,
      goldSplitPercent: 0,
      settlementRialAmountToman: 204088500,
      settlementGoldWeightGrams750: 0,
      isQuoteLocked: true,
      lockedQuoteRateToman: 4180000,
      moaddianStatus: 'verified',
      moaddianStatusFa: 'ارسال شده به مودیان / بدهی معوق',
      zarrinVoucher: {
        voucherNumber: 'SANAD-ZR-1403-8812',
        voucherDateFa: '۱۴۰۳/۰۸/۱۰',
        rialDebitAccount: 'بدهکاران تجاری / کیمیا نوین (کد ۱۱۰۹۰)',
        rialAmountToman: 204088500,
        goldDebitAccount: 'عدم درگیری حساب طلایی',
        goldWeightGrams750: 0,
        goldSpotRateAppliedToman: 4180000,
        status: 'posted_to_zarrin',
        statusFa: 'سند دوبل صادر شده / وصول‌نشده',
        zarrinBatchId: 'BATCH-ZR-9075'
      },
      createdAt: '2024-11-01T09:00:00.000Z'
    }
  ];

  private taxConsolidations: TaxConsolidationPeriod[] = [
    {
      periodId: 'TAX-1403-Q3',
      titleFa: 'پاییز ۱۴۰۳ (دوره سوم مالیاتی)',
      startDateFa: '۱۴۰۳/۰۷/۰۱',
      endDateFa: '۱۴۰۳/۰۹/۳۰',
      totalInvoicesCount: 24,
      totalPureGoldGrams: 845.2,
      totalPureGoldValueToman: 3558292000,
      totalWagesAndMarginsToman: 249080440,
      totalDiscountsToman: 18240000,
      taxableNetBaseToman: 230840440,
      totalVatCollectedToman: 23084044,
      moaddianDeclaredCount: 22,
      moaddianPendingCount: 2,
      status: 'open',
      statusFa: 'دوره جاری باز (در حال ثبت صورتحساب‌ها)'
    },
    {
      periodId: 'TAX-1403-Q2',
      titleFa: 'تابستان ۱۴۰۳ (دوره دوم مالیاتی)',
      startDateFa: '۱۴۰۳/۰۴/۰۱',
      endDateFa: '۱۴۰۳/۰۶/۳۱',
      totalInvoicesCount: 68,
      totalPureGoldGrams: 2150.0,
      totalPureGoldValueToman: 8170000000,
      totalWagesAndMarginsToman: 571900000,
      totalDiscountsToman: 41200000,
      taxableNetBaseToman: 530700000,
      totalVatCollectedToman: 53070000,
      moaddianDeclaredCount: 68,
      moaddianPendingCount: 0,
      status: 'declared_to_tax_authority',
      statusFa: 'اظهار قطعی شده در کارپوشه امور مالیاتی کشور'
    }
  ];

  private authorizedUsers: RateAuthorizedUser[] = [
    {
      id: 'usr-tr-00',
      nameFa: 'مهندس علیرضا سفیدپور',
      email: 'ali.sefidpour@didargold.com',
      nationalId: '0018491284',
      departmentFa: 'مدیریت ارشد و عملیات هسته دیدار',
      role: 'CHIEF_TREASURER',
      roleFa: 'مدیر عملیات هسته و ناظر عالی خزانه‌داری',
      partyId: 'party-admin-001',
      organizationId: 'org-didar-core-001',
      rbacRoleKey: 'governance.identity_access_manager',
      permissions: [
        'RATE_VIEW',
        'RATE_MANUAL_OVERRIDE',
        'SPREAD_CONFIG',
        'AUTO_FEED_TOGGLE',
        'DUAL_APPROVAL_SIGN',
        'CIRCUIT_BREAKER_TRIGGER'
      ],
      status: 'active',
      maxAllowedDailyChangePercent: 0, // مدیر ارشد، بدون محدودیت
      lastRateChangeAtFa: '۱۴۰۳/۰۹/۰۸ ۱۸:۰۰',
      twoFactorRequired: true,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-tr-01',
      nameFa: 'مهندس رضا کریمی',
      email: 'r.karimi@didargold.ir',
      nationalId: '0078945123',
      departmentFa: 'مدیریت ارشد خزانه‌داری مرکزی',
      role: 'CHIEF_TREASURER',
      roleFa: 'مدیر ارشد خزانه‌داری و نقدینگی',
      partyId: 'party-admin-001',
      organizationId: 'org-didar-core-001',
      rbacRoleKey: 'finance.treasury_approver',
      permissions: [
        'RATE_VIEW',
        'RATE_MANUAL_OVERRIDE',
        'SPREAD_CONFIG',
        'AUTO_FEED_TOGGLE',
        'DUAL_APPROVAL_SIGN',
        'CIRCUIT_BREAKER_TRIGGER'
      ],
      status: 'active',
      maxAllowedDailyChangePercent: 5.0,
      lastRateChangeAtFa: '۱۴۰۳/۰۹/۰۸ ۱۶:۱۵',
      twoFactorRequired: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-tr-02',
      nameFa: 'سرکار خانم سارا صرافی',
      email: 's.sarafi@didargold.ir',
      nationalId: '0065412398',
      departmentFa: 'میز معاملات و رصد آنلاین بازار',
      role: 'RATE_OPERATOR',
      roleFa: 'اپراتور ارشد ثبت مظنه بازار',
      partyId: 'party-staff-002',
      organizationId: 'org-didar-core-001',
      rbacRoleKey: 'finance.pricing_operator',
      permissions: ['RATE_VIEW', 'RATE_MANUAL_OVERRIDE', 'SPREAD_CONFIG'],
      status: 'active',
      maxAllowedDailyChangePercent: 2.0,
      lastRateChangeAtFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰',
      twoFactorRequired: true,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-tr-03',
      nameFa: 'دکتر فرزاد نوری',
      email: 'f.nouri@didargold.ir',
      nationalId: '0051236987',
      departmentFa: 'اداره مدیریت ریسک و تطبیق مقررات',
      role: 'RISK_MANAGER',
      roleFa: 'مدیر ریسک و انطباق استاندارد طلا',
      partyId: 'party-staff-003',
      organizationId: 'org-didar-core-001',
      rbacRoleKey: 'finance.treasury_approver',
      permissions: ['RATE_VIEW', 'DUAL_APPROVAL_SIGN', 'CIRCUIT_BREAKER_TRIGGER'],
      status: 'active',
      maxAllowedDailyChangePercent: 0,
      lastRateChangeAtFa: '۱۴۰۳/۰۹/۰۷ ۱۱:۲۰',
      twoFactorRequired: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-tr-04',
      nameFa: 'پویان شمس',
      email: 'p.shams@didargold.ir',
      nationalId: '0459871234',
      departmentFa: 'میز معاملاتی شمش و آبشده طلا',
      role: 'BRANCH_TRADER',
      roleFa: 'معامله‌گر مجاز شعبه مرکزی',
      partyId: 'party-staff-004',
      organizationId: 'org-didar-core-001',
      rbacRoleKey: 'finance.treasury_maker',
      permissions: ['RATE_VIEW'],
      status: 'active',
      maxAllowedDailyChangePercent: 0,
      twoFactorRequired: false,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-tr-05',
      nameFa: 'زهرا یزدانی',
      email: 'z.yazdani@didargold.ir',
      nationalId: '0089632541',
      departmentFa: 'واحد بازرسی و حسابرسی زنجیره زرین',
      role: 'AUDITOR',
      roleFa: 'ناظر و حسابرس ارشد سیستم',
      partyId: 'party-staff-005',
      organizationId: 'org-didar-core-001',
      rbacRoleKey: 'finance.auditor',
      permissions: ['RATE_VIEW'],
      status: 'active',
      maxAllowedDailyChangePercent: 0,
      twoFactorRequired: false,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    }
  ];

  private auditLogs: RateChangeAuditLog[] = [
    {
      id: 'log-1403-089',
      rateId: 'rate-18k-750',
      symbol: 'GOLD_18K_750',
      titleFa: 'طلای ۱۸ عیار (۷۵۰)',
      oldSellPrice: 4195000,
      newSellPrice: 4210000,
      deltaPercent: 0.36,
      operatorId: 'usr-tr-02',
      operatorNameFa: 'سارا صرافی',
      operatorRoleFa: 'اپراتور ارشد ثبت مظنه بازار',
      reason: 'همگام‌سازی با نرخ رسمی اعلامی اتحادیه طلا و جواهر تهران نوبت عصر',
      status: 'applied',
      statusFa: 'اعمال قطعی در سامانه',
      approverNameFa: 'سیستم خودکار (در محدوده مجاز)',
      timestampFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰',
      ipAddress: '192.168.10.45'
    },
    {
      id: 'log-1403-088',
      rateId: 'rate-mesghal-17k',
      symbol: 'GOLD_MESGHAL_17K',
      titleFa: 'مثقال طلای آبشده (۱۷ عیار)',
      oldSellPrice: 18150000,
      newSellPrice: 18230000,
      deltaPercent: 0.44,
      operatorId: 'usr-tr-02',
      operatorNameFa: 'سارا صرافی',
      operatorRoleFa: 'اپراتور ارشد ثبت مظنه بازار',
      reason: 'افزایش تقاضای شمش در بورس کالا و تراز بنکداران سبزه میدان',
      status: 'applied',
      statusFa: 'اعمال قطعی در سامانه',
      approverNameFa: 'سیستم خودکار (در محدوده مجاز)',
      timestampFa: '۱۴۰۳/۰۹/۰۸ ۱۶:۴۵',
      ipAddress: '192.168.10.45'
    },
    {
      id: 'log-1403-087',
      rateId: 'rate-24k-995',
      symbol: 'GOLD_24K_995',
      titleFa: 'شمش طلا ۲۴ عیار (۹۹۵)',
      oldSellPrice: 5490000,
      newSellPrice: 5580000,
      deltaPercent: 1.64,
      operatorId: 'usr-tr-01',
      operatorNameFa: 'مهندس رضا کریمی',
      operatorRoleFa: 'مدیر ارشد خزانه‌داری دیدار',
      reason: 'نوسان انس جهانی و بازگشایی حراج شمش مرکز مبادله ارز و طلا',
      status: 'applied',
      statusFa: 'اعمال پس از تایید دونفره (Dual Approval)',
      approverNameFa: 'دکتر فرزاد نوری (مدیر ریسک)',
      timestampFa: '۱۴۰۳/۰۹/۰۸ ۱۶:۱۵',
      ipAddress: '192.168.10.12'
    }
  ];

  private securityPolicy: RateSecurityPolicy = {
    dualApprovalThresholdPercent: 1.5,
    circuitBreakerThresholdPercent: 4.0,
    marketStatus: 'open',
    feedSource: 'hybrid',
    minSpreadToman: 25000,
    lastUpdatedFa: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰'
  };

  public getPayload(): K13DataPayload {
    const rate18k = this.rates.find((r) => r.symbol === 'GOLD_18K_750')?.sellPriceToman || 4210000;
    const rateMesghal = this.rates.find((r) => r.symbol === 'GOLD_MESGHAL_17K')?.sellPriceToman || 18230000;
    const activeLocks = this.activeLocks.filter((l) => l.status === 'active');
    const totalInvoiced = this.invoices.reduce((acc, inv) => acc + inv.grandTotalToman, 0);
    const totalGrams = this.invoices.reduce((acc, inv) => acc + inv.totalWeightGrams, 0);
    const sentMoaddian = this.invoices.filter((i) => i.moaddianStatus === 'verified' || i.moaddianStatus === 'sent').length;
    const totalInvoices = this.invoices.length;
    const pendingDualApprovals = this.auditLogs.filter((l) => l.status === 'pending_dual_approval').length;

    return {
      rates: [...this.rates],
      activeLocks: [...this.activeLocks],
      wageRules: [...this.wageRules],
      invoices: [...this.invoices],
      taxConsolidations: [...this.taxConsolidations],
      authorizedUsers: [...this.authorizedUsers],
      auditLogs: [...this.auditLogs],
      securityPolicy: { ...this.securityPolicy },
      metrics: {
        current18kPriceToman: rate18k,
        currentMesghalPriceToman: rateMesghal,
        activeLockedQuotesCount: activeLocks.length,
        totalInvoicesMonthToman: totalInvoiced,
        totalGoldWeightInvoicedGrams: parseFloat(totalGrams.toFixed(2)),
        moaddianSuccessRatePercent: totalInvoices > 0 ? Math.round((sentMoaddian / totalInvoices) * 100) : 100,
        lastRateFetchAt: '۱۴۰۳/۰۹/۰۸ ۱۷:۳۰',
        totalAuthorizedOperatorsCount: this.authorizedUsers.filter((u) => u.status === 'active').length,
        pendingDualApprovalsCount: pendingDualApprovals
      }
    };
  }

  public getRates(): GoldSpotRate[] {
    return this.rates;
  }

  public getInvoices(): Invoice[] {
    return this.invoices;
  }

  public getInvoice(id: string): Invoice | undefined {
    return this.invoices.find((i) => i.id === id);
  }

  public updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const idx = this.invoices.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    this.invoices[idx] = { ...this.invoices[idx], ...updates };
    return this.invoices[idx];
  }

  public getReferenceRate(symbol: string = 'GOLD_18K_750'): number {
    const rate = this.rates.find((r) => r.symbol === symbol);
    return rate ? rate.sellPriceToman : 4210000;
  }

  public calculatePrice(input: PriceCalculationInput): PriceCalculationResult {
    const spotRate = input.customSpotRateToman || this.getReferenceRate('GOLD_18K_750');
    // Convert carat equivalence to 750 if necessary
    const caratFactor = input.carat === 995 ? 995 / 750 : input.carat === 999.9 ? 999.9 / 750 : 1;
    const effectiveSpotRate = Math.round(spotRate * caratFactor);
    const goldPureValueToman = Math.round(input.weightGrams * effectiveSpotRate);

    // Wage calculation
    const rule = this.wageRules.find((r) => r.categoryKey === input.categoryKey);
    const tier = input.retailerTier || 'T1';
    let baseWageToman = 0;
    let tierDiscountToman = 0;

    if (input.wageType === 'percentage') {
      const wagePct = input.wageValue || (rule ? rule.baseWagePercent : 7.0);
      baseWageToman = Math.round(goldPureValueToman * (wagePct / 100));

      const discountPct = rule?.tierDiscountPercent?.[tier] || 0;
      tierDiscountToman = Math.round(goldPureValueToman * (discountPct / 100));
    } else {
      // Fixed per gram
      const fixedPerGram = input.wageValue || (rule ? rule.baseWageFixedToman : 150000);
      baseWageToman = Math.round(input.weightGrams * fixedPerGram);

      const discountPerGram = rule?.tierDiscountPercent?.[tier] || 0;
      tierDiscountToman = Math.round(input.weightGrams * discountPerGram);
    }

    const effectiveWageToman = Math.max(0, baseWageToman - tierDiscountToman);

    // Didar Wholesale Margin
    const marginPercent = input.didarMarginPercent !== undefined ? input.didarMarginPercent : (rule ? rule.didarMarginPercent : 1.8);
    const didarMarginToman = Math.round(goldPureValueToman * (marginPercent / 100));

    // Item-level discount/adjustment: ENFORCE MAX ±1.0%
    const rawItemDisc = input.itemDiscountPercent !== undefined ? Number(input.itemDiscountPercent) : 0;
    if (Math.abs(rawItemDisc) > 1.0) {
      throw new Error(`خطای قانون K13: تعدیل هر قلم کالا نمی‌تواند فراتر از ۱٪ (±۱.۰۰٪) باشد. مقدار ارسالی: ${rawItemDisc}٪`);
    }
    const itemDiscountPercent = parseFloat(rawItemDisc.toFixed(2));
    const grossBeforeDiscount = goldPureValueToman + effectiveWageToman + didarMarginToman;
    const itemDiscountAmountToman = Math.round(grossBeforeDiscount * (itemDiscountPercent / 100));

    // Iran Gold VAT Law (Art. 26) Calculation:
    // Gold value is EXEMPT from VAT.
    // 10% VAT applies ONLY to (Making Wage + Seller Profit Margin).
    const taxableBase = effectiveWageToman + didarMarginToman;
    const adjustedTaxable = Math.max(0, taxableBase + (itemDiscountPercent < 0 ? itemDiscountAmountToman : 0));
    const taxableAmountToman = adjustedTaxable;
    const vatRate = 0.10; // 10%
    const vatAmountToman = Math.round(taxableAmountToman * vatRate);

    const subtotalBeforeVolume = goldPureValueToman + taxableAmountToman + vatAmountToman;

    // Total Volume-based discount: ENFORCE MAX ±2.0%
    const rawVolDisc = input.volumeDiscountPercent !== undefined ? Number(input.volumeDiscountPercent) : 0;
    if (Math.abs(rawVolDisc) > 2.0) {
      throw new Error(`خطای قانون K13: تخفیف حجمی کل فاکتور نمی‌تواند فراتر از ۲٪ (±۲.۰۰٪) باشد. مقدار ارسالی: ${rawVolDisc}٪`);
    }
    const volumeDiscountPercent = parseFloat(rawVolDisc.toFixed(2));
    const volumeDiscountAmountToman = Math.round(subtotalBeforeVolume * (volumeDiscountPercent / 100));

    const grandTotalToman = Math.max(0, subtotalBeforeVolume + volumeDiscountAmountToman);
    const grandTotalRials = grandTotalToman * 10;
    const gramEffectivePriceToman = input.weightGrams > 0 ? Math.round(grandTotalToman / input.weightGrams) : 0;

    // Split settlement preview & Quote Lock validation
    const mode = input.settlementMode || 'split';
    let rialPct = 50;
    let goldPct = 50;
    if (mode === 'rial_only') {
      rialPct = 100;
      goldPct = 0;
    } else if (mode === 'gold_only') {
      rialPct = 0;
      goldPct = 100;
    } else {
      rialPct = input.rialSplitPercent !== undefined ? Math.min(100, Math.max(0, input.rialSplitPercent)) : 40;
      goldPct = 100 - rialPct;
    }

    const settlementRialAmountToman = Math.round(grandTotalToman * (rialPct / 100));
    const settlementGoldWeightGrams750 = parseFloat((input.weightGrams * (goldPct / 100)).toFixed(3));
    const quoteLockRequired = mode !== 'gold_only';
    const isQuoteLocked = Boolean(input.quoteLockId || quoteLockRequired);

    const quoteLockNoticeFa = quoteLockRequired
      ? `چون فاکتور دارای ${rialPct}٪ تسویه ریالی است، نرخ مظنه طلا (${effectiveSpotRate.toLocaleString('fa-IR')} تومان) الزاماً باید قفل شود تا نوسان قیمت مهار گردد.`
      : 'تسویه ۱۰۰٪ بر مبنای وزن طلای آبشده (بدون نیاز به قفل مظنه ریالی).';

    return {
      weightGrams: input.weightGrams,
      effectiveSpotRateToman: effectiveSpotRate,
      goldPureValueToman,
      baseWageToman,
      tierDiscountToman,
      effectiveWageToman,
      didarMarginToman,
      itemDiscountPercent,
      itemDiscountAmountToman,
      volumeDiscountPercent,
      volumeDiscountAmountToman,
      taxableAmountToman,
      vatAmountToman,
      grandTotalToman,
      grandTotalRials,
      gramEffectivePriceToman,
      settlementMode: mode,
      rialSplitPercent: rialPct,
      goldSplitPercent: goldPct,
      settlementRialAmountToman,
      settlementGoldWeightGrams750,
      isQuoteLocked,
      quoteLockRequired,
      quoteLockNoticeFa,
      vatLegalNoteFa: 'مشمول ماده ۲۶ قانون دائمی مالیات بر ارزش افزوده: اصل ارزش طلا معاف؛ مالیات ۱۰٪ صرفاً بر مجموع اجرت و سود اعمال شده است.'
    };
  }

  public createQuoteLock(params: {
    buyerOrgId: string;
    buyerOrgNameFa: string;
    totalWeightGrams: number;
    validitySeconds?: number;
    purpose?: string;
  }): PriceQuoteLock {
    const rate750 = this.getReferenceRate('GOLD_18K_750');
    const validitySec = params.validitySeconds || 300; // 5 minutes
    const now = new Date();
    const expires = new Date(now.getTime() + validitySec * 1000);

    const quoteId = `QUOTE-1403-${Math.floor(1000 + Math.random() * 9000)}`;
    const rawData = `${quoteId}:${params.buyerOrgId}:${rate750}:${now.toISOString()}`;
    const token = crypto.createHash('sha256').update(rawData).digest('hex');

    const calculatedTotalToman = Math.round(params.totalWeightGrams * rate750 * 1.09); // Approx with wage/vat

    const lock: PriceQuoteLock = {
      quoteId,
      token,
      buyerOrgId: params.buyerOrgId,
      buyerOrgNameFa: params.buyerOrgNameFa,
      lockedRatePerGram750Toman: rate750,
      lockedAtFa: new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(now),
      expiresAtFa: new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(expires),
      validitySeconds: validitySec,
      remainingSeconds: validitySec,
      status: 'active',
      statusFa: `معتبر و قفل‌شده (${Math.round(validitySec / 60)} دقیقه گارانتی نرخ)`,
      totalWeightGrams: params.totalWeightGrams,
      calculatedTotalToman,
      purpose: params.purpose || 'تثبیت مظنه خرید شمش و مصنوعات دیدار'
    };

    this.activeLocks.unshift(lock);
    return lock;
  }

  public createInvoice(params: {
    invoiceType: 'proforma' | 'official_tax_invoice';
    buyerOrgId: string;
    buyerNameFa: string;
    buyerNationalId: string;
    buyerEconomicCode: string;
    buyerAddressFa: string;
    buyerPhone: string;
    retailerTier: 'T1' | 'T2' | 'T3';
    orderCode?: string;
    quoteLockId?: string;
    paymentTermsFa?: string;
    // Settlement options
    settlementMode?: 'rial_only' | 'gold_only' | 'split';
    rialSplitPercent?: number;
    // Volume discount on total invoice: max ±2.0%
    volumeDiscountPercent?: number;
    items: {
      sku: string;
      productCode?: string;
      titleFa: string;
      categoryFa: string;
      categoryKey: string;
      carat: number;
      weightGrams: number;
      wageType: 'percentage' | 'fixed_per_gram';
      wageValue: number;
      // Item adjustment: max ±1.0%
      itemDiscountPercent?: number;
      lineDiscountType?: 'percentage' | 'fixed_amount';
      lineDiscountPercent?: number;
      lineDiscountAmountToman?: number;
      lineDiscountReasonFa?: string;
    }[];
  }): Invoice {
    const invoiceNum = params.invoiceType === 'proforma'
      ? `PRO-1403-${Math.floor(1000 + Math.random() * 9000)}`
      : `INV-1403-${Math.floor(1000 + Math.random() * 9000)}`;

    const taxId = `A1403${Math.floor(100000000000000000 + Math.random() * 900000000000000000)}`;
    const nowFa = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    // Validate volume discount ceiling: Max ±2.0%
    const rawVolDisc = params.volumeDiscountPercent !== undefined ? Number(params.volumeDiscountPercent) : 0;
    if (Math.abs(rawVolDisc) > 2.0) {
      throw new Error(`خطای قانون K13: تخفیف حجمی کل فاکتور نمی‌تواند فراتر از ۲٪ (±۲.۰۰٪) باشد. مقدار درخواستی: ${rawVolDisc}٪`);
    }
    const volumeDiscountPercent = parseFloat(rawVolDisc.toFixed(2));

    const computedItems: InvoiceItem[] = params.items.map((item, idx) => {
      // Validate item discount ceiling: Max ±1.0%
      const rawItemDisc = item.lineDiscountPercent !== undefined
        ? Number(item.lineDiscountPercent)
        : (item.itemDiscountPercent !== undefined ? Number(item.itemDiscountPercent) : 0);
      if (Math.abs(rawItemDisc) > 1.0) {
        throw new Error(`خطای قانون K13 در قلم ردیف ${idx + 1} (${item.titleFa}): تعدیل قیمت کالا نمی‌تواند فراتر از ۱٪ (±۱.۰۰٪) باشد. مقدار درخواستی: ${rawItemDisc}٪`);
      }

      const calc = this.calculatePrice({
        weightGrams: item.weightGrams,
        carat: item.carat,
        categoryKey: item.categoryKey,
        wageType: item.wageType,
        wageValue: item.wageValue,
        retailerTier: params.retailerTier,
        itemDiscountPercent: rawItemDisc
      });

      const effectiveUnitPriceBeforeDisc = item.weightGrams > 0
        ? Math.round((calc.goldPureValueToman + calc.effectiveWageToman + calc.didarMarginToman) / item.weightGrams)
        : calc.gramEffectivePriceToman;

      return {
        id: `item-${idx + 1}`,
        sku: item.sku,
        productCode: item.productCode || item.sku,
        titleFa: item.titleFa,
        categoryFa: item.categoryFa,
        carat: item.carat,
        weightGrams: item.weightGrams,
        spotGoldPricePerGramToman: calc.effectiveSpotRateToman,
        goldPureValueToman: calc.goldPureValueToman,
        makingWageType: item.wageType,
        makingWagePercent: item.wageType === 'percentage' ? item.wageValue : 0,
        makingWageAmountToman: calc.effectiveWageToman,
        didarMarginPercent: 1.8,
        didarMarginAmountToman: calc.didarMarginToman,
        unitPriceToman: calc.gramEffectivePriceToman,
        unitPriceBeforeDiscountToman: effectiveUnitPriceBeforeDisc,
        itemDiscountPercent: calc.itemDiscountPercent,
        itemDiscountAmountToman: calc.itemDiscountAmountToman,
        lineDiscountType: item.lineDiscountType || 'percentage',
        lineDiscountPercent: calc.itemDiscountPercent,
        lineDiscountAmountToman: calc.itemDiscountAmountToman,
        lineDiscountReasonFa: item.lineDiscountReasonFa || (calc.itemDiscountPercent !== 0 ? 'تخفیف خطی مصوب ردیف کالا' : undefined),
        netUnitPriceToman: calc.gramEffectivePriceToman,
        taxableAmountToman: calc.taxableAmountToman,
        vatRatePercent: 10,
        vatAmountToman: calc.vatAmountToman,
        totalPriceToman: calc.grandTotalToman,
        netLineTotalToman: calc.grandTotalToman
      };
    });

    const totalWeightGrams = computedItems.reduce((acc, it) => acc + it.weightGrams, 0);
    const totalPureGoldValueToman = computedItems.reduce((acc, it) => acc + it.goldPureValueToman, 0);
    const totalMakingWageToman = computedItems.reduce((acc, it) => acc + it.makingWageAmountToman, 0);
    const totalDidarMarginToman = computedItems.reduce((acc, it) => acc + it.didarMarginAmountToman, 0);
    const totalItemDiscountsToman = computedItems.reduce((acc, it) => acc + it.itemDiscountAmountToman, 0);
    const totalTaxableAmountToman = computedItems.reduce((acc, it) => acc + it.taxableAmountToman, 0);
    const totalVatToman = computedItems.reduce((acc, it) => acc + it.vatAmountToman, 0);
    const subtotalBeforeVolumeDiscountToman = computedItems.reduce((acc, it) => acc + it.totalPriceToman, 0);

    // Apply Total Volume Discount (max ±2.0%)
    const volumeDiscountAmountToman = Math.round(subtotalBeforeVolumeDiscountToman * (volumeDiscountPercent / 100));
    const grandTotalToman = Math.max(0, subtotalBeforeVolumeDiscountToman + volumeDiscountAmountToman);
    const grandTotalRials = grandTotalToman * 10;

    // Dual/Split Settlement Governance
    const settlementMode = params.settlementMode || 'split';
    let rialSplitPercent = 50;
    let goldSplitPercent = 50;

    if (settlementMode === 'rial_only') {
      rialSplitPercent = 100;
      goldSplitPercent = 0;
    } else if (settlementMode === 'gold_only') {
      rialSplitPercent = 0;
      goldSplitPercent = 100;
    } else {
      rialSplitPercent = params.rialSplitPercent !== undefined
        ? Math.min(100, Math.max(0, Number(params.rialSplitPercent)))
        : 40;
      goldSplitPercent = 100 - rialSplitPercent;
    }

    // CRITICAL BUSINESS RULE:
    // If the invoice is partially or fully settled in Rials, the spot gold rate MUST BE LOCKED!
    const isRialSettlementPresent = settlementMode !== 'gold_only' && rialSplitPercent > 0;
    let quoteLockId = params.quoteLockId;
    let lockedQuoteRateToman = this.getReferenceRate('GOLD_18K_750');

    if (isRialSettlementPresent) {
      if (quoteLockId) {
        const found = this.activeLocks.find((l) => l.quoteId === quoteLockId);
        if (found) {
          lockedQuoteRateToman = found.lockedRatePerGram750Toman;
        }
      } else {
        // Auto-generate a Quote Lock to guarantee rate stabilization for the Rial settlement portion
        const newLock = this.createQuoteLock({
          buyerOrgId: params.buyerOrgId,
          buyerOrgNameFa: params.buyerNameFa,
          totalWeightGrams,
          validitySeconds: 300,
          purpose: `تثبیت مظنه سهم تسویه ریالی فاکتور ${invoiceNum}`
        });
        quoteLockId = newLock.quoteId;
        lockedQuoteRateToman = newLock.lockedRatePerGram750Toman;
      }
    }

    const settlementRialAmountToman = Math.round(grandTotalToman * (rialSplitPercent / 100));
    const settlementGoldWeightGrams750 = parseFloat((totalWeightGrams * (goldSplitPercent / 100)).toFixed(3));

    const settlementModeFa = settlementMode === 'split'
      ? `تسویه ترکیبی (${rialSplitPercent}٪ ریالی / ${goldSplitPercent}٪ طلایی)`
      : settlementMode === 'rial_only'
        ? 'تسویه ۱۰۰٪ ریالی (با قفل مظنه)'
        : 'تسویه ۱۰۰٪ طلایی (حواله وزن طلا)';

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      taxIdentificationNumber: taxId,
      orderCode: params.orderCode,
      invoiceType: params.invoiceType,
      invoiceTypeFa: params.invoiceType === 'proforma'
        ? 'پیش‌فاکتور تجاری با مهلت تسویه'
        : 'صورتحساب الکترونیکی رسمی (نوع اول - سامانه مودیان)',
      status: params.invoiceType === 'proforma' ? 'locked_quote' : 'issued',
      statusFa: params.invoiceType === 'proforma' ? 'پیش‌فاکتور صادرشده' : 'صورتحساب قطعی صادرشده',
      buyerOrgId: params.buyerOrgId,
      buyerNameFa: params.buyerNameFa,
      buyerNationalId: params.buyerNationalId,
      buyerEconomicCode: params.buyerEconomicCode,
      buyerAddressFa: params.buyerAddressFa,
      buyerPhone: params.buyerPhone,
      retailerTier: params.retailerTier,
      sellerNameFa: 'شرکت تجارت فناوری‌های طلایی دیدار (سهامی خاص)',
      sellerNationalId: '14010896325',
      sellerEconomicCode: '411632587412',
      sellerAddressFa: 'تهران، خیابان ولیعصر، برج فناوری دیدار، طبقه ۸',
      issueDateFa: nowFa,
      dueDateFa: nowFa,
      items: computedItems,
      totalWeightGrams: parseFloat(totalWeightGrams.toFixed(2)),
      pureGoldEquivalentGrams750: parseFloat(totalWeightGrams.toFixed(2)),
      totalPureGoldValueToman,
      totalMakingWageToman,
      totalDidarMarginToman,
      totalItemDiscountsToman,
      subtotalBeforeVolumeDiscountToman,

      volumeDiscountPercent,
      volumeDiscountAmountToman,

      totalTaxableAmountToman,
      totalVatToman,
      grandTotalToman,
      grandTotalRials,

      // Dual/Split Settlement
      settlementMode,
      settlementModeFa,
      rialSplitPercent,
      goldSplitPercent,
      settlementRialAmountToman,
      settlementGoldWeightGrams750,
      isQuoteLocked: isRialSettlementPresent,
      lockedQuoteRateToman: isRialSettlementPresent ? lockedQuoteRateToman : undefined,
      quoteLockId: isRialSettlementPresent ? quoteLockId : undefined,

      paymentTermsFa: params.paymentTermsFa || (
        settlementMode === 'split'
          ? `تسویه ترکیبی (${rialSplitPercent}٪ ریالی با قفل مظنه + ${goldSplitPercent}٪ طلای آبشده عیار ۷۵۰)`
          : settlementMode === 'rial_only'
            ? 'تسویه نقدی ریالی کامل با قفل مظنه'
            : 'تسویه طلایی کامل (تحویل شمش/آبشده عیار ۷۵۰)'
      ),
      moaddianStatus: 'pending',
      moaddianStatusFa: 'در انتظار ارسال به کارپوشه سامانه مودیان',
      // Zarrin Settlement & Double-entry Accounting Voucher (K16 GL)
      zarrinVoucher: {
        voucherNumber: `SANAD-ZR-1403-${Math.floor(1000 + Math.random() * 9000)}`,
        voucherDateFa: nowFa,
        rialDebitAccount: `بدهکاران تجاری / ${params.buyerNameFa}`,
        rialAmountToman: settlementRialAmountToman,
        goldDebitAccount: settlementGoldWeightGrams750 > 0
          ? 'حساب طلایی / کاردکس امانی طلای ۷۵۰ (کد ۲۰۲۰۱)'
          : 'عدم درگیری حساب طلایی (تسویه صرفاً ریالی)',
        goldWeightGrams750: settlementGoldWeightGrams750,
        goldSpotRateAppliedToman: lockedQuoteRateToman,
        quoteLockId: isRialSettlementPresent ? quoteLockId : undefined,
        status: params.invoiceType === 'official_tax_invoice' ? 'posted_to_zarrin' : 'draft',
        statusFa: params.invoiceType === 'official_tax_invoice'
          ? 'سند دوبل در دفترکل زرین ثبت شد'
          : 'پیش‌نویس سند تسویه در انتظار تأیید خریدار',
        zarrinBatchId: `BATCH-ZR-${Math.floor(1000 + Math.random() * 9000)}`
      },
      notes: `صورتحساب طلا با رعایت ماده ۲۶ قانون مالیات ارزش افزوده. ${settlementModeFa}.`,
      createdAt: new Date().toISOString()
    };

    // Update the open tax consolidation period (Q3)
    if (this.taxConsolidations.length > 0) {
      const openPeriod = this.taxConsolidations.find((p) => p.status === 'open') || this.taxConsolidations[0];
      openPeriod.totalInvoicesCount += 1;
      openPeriod.totalPureGoldGrams = parseFloat((openPeriod.totalPureGoldGrams + totalWeightGrams).toFixed(2));
      openPeriod.totalPureGoldValueToman += totalPureGoldValueToman;
      openPeriod.totalWagesAndMarginsToman += (totalMakingWageToman + totalDidarMarginToman);
      openPeriod.totalDiscountsToman += (totalItemDiscountsToman + volumeDiscountAmountToman);
      openPeriod.taxableNetBaseToman += totalTaxableAmountToman;
      openPeriod.totalVatCollectedToman += totalVatToman;
      openPeriod.moaddianPendingCount += 1;
    }

    this.invoices.unshift(invoice);
    return invoice;
  }

  public sendToMoaddian(invoiceId: string): { success: boolean; invoice?: Invoice; error?: string } {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (!inv) {
      return { success: false, error: 'صورتحساب مورد نظر یافت نشد.' };
    }

    const trackingCode = `MOD-IR-1403-${Math.floor(10000000 + Math.random() * 90000000)}`;
    inv.moaddianStatus = 'verified';
    inv.moaddianStatusFa = 'مورد تأیید کارپوشه سامانه مودیان (ثبت معتبر مالیاتی)';
    inv.moaddianTrackingCode = trackingCode;
    inv.moaddianSentAtFa = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
    inv.status = 'moaddian_sent';
    inv.statusFa = 'ارسال قطعی به سامانه مودیان مالیاتی';

    if (inv.zarrinVoucher) {
      inv.zarrinVoucher.status = 'posted_to_zarrin';
      inv.zarrinVoucher.statusFa = 'سند دوبل در دفترکل زرین ثبت شد';
    }

    if (this.taxConsolidations.length > 0) {
      const openPeriod = this.taxConsolidations.find((p) => p.status === 'open') || this.taxConsolidations[0];
      openPeriod.moaddianDeclaredCount += 1;
      if (openPeriod.moaddianPendingCount > 0) {
        openPeriod.moaddianPendingCount -= 1;
      }
    }

    return { success: true, invoice: inv };
  }

  public refreshMarketRates(): GoldSpotRate[] {
    // Introduce gentle realistic market fluctuation (+- 0.3%)
    this.rates = this.rates.map((rate) => {
      const deltaPercent = (Math.random() * 0.6 - 0.25) / 100;
      const newSell = Math.round(rate.sellPriceToman * (1 + deltaPercent));
      const newBuy = Math.round(newSell * 0.994);
      return {
        ...rate,
        sellPriceToman: newSell,
        buyPriceToman: newBuy,
        changePercent24h: parseFloat((rate.changePercent24h + (deltaPercent * 100)).toFixed(2)),
        updatedAtFa: new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())
      };
    });
    return this.rates;
  }

  public updateWageRule(ruleId: string, updates: Partial<MakingWageRule>): MakingWageRule | null {
    const idx = this.wageRules.findIndex((r) => r.id === ruleId);
    if (idx === -1) return null;
    this.wageRules[idx] = { ...this.wageRules[idx], ...updates };
    return this.wageRules[idx];
  }

  // --- Rate Access Management & Security Methods ---

  public getAuthorizedUsers(): RateAuthorizedUser[] {
    return this.authorizedUsers;
  }

  public updateUser(userId: string, updates: Partial<RateAuthorizedUser>): { success: boolean; user?: RateAuthorizedUser; error?: string } {
    const idx = this.authorizedUsers.findIndex((u) => u.id === userId);
    if (idx === -1) return { success: false, error: 'کاربر مورد نظر یافت نشد.' };

    this.authorizedUsers[idx] = {
      ...this.authorizedUsers[idx],
      ...updates
    };

    return { success: true, user: this.authorizedUsers[idx] };
  }

  public createUser(user: Omit<RateAuthorizedUser, 'id'>): { success: boolean; user: RateAuthorizedUser } {
    const id = `usr-tr-${Math.floor(100 + Math.random() * 900)}`;
    const newUser: RateAuthorizedUser = {
      ...user,
      id
    };
    this.authorizedUsers.unshift(newUser);
    return { success: true, user: newUser };
  }

  public deleteUser(userId: string): { success: boolean; error?: string } {
    const idx = this.authorizedUsers.findIndex((u) => u.id === userId);
    if (idx === -1) return { success: false, error: 'کاربر مورد نظر یافت نشد.' };
    this.authorizedUsers.splice(idx, 1);
    return { success: true };
  }

  public modifyGoldRate(params: {
    rateId: string;
    newSellPrice: number;
    newBuyPrice?: number;
    operatorId: string;
    reason: string;
    ipAddress?: string;
  }): {
    success: boolean;
    requiresApproval?: boolean;
    rate?: GoldSpotRate;
    auditLog?: RateChangeAuditLog;
    error?: string;
  } {
    if (this.securityPolicy.marketStatus === 'frozen') {
      return { success: false, error: 'معاملات و تغییرات نرخ به دلیل توقف اضطراری (Circuit Breaker) مسدود است.' };
    }

    const operator = this.authorizedUsers.find((u) => u.id === params.operatorId);
    if (!operator) {
      return { success: false, error: 'شناسه اپراتور معتبر نیست.' };
    }

    if (operator.status !== 'active') {
      return { success: false, error: 'حساب کاربری این اپراتور به حالت تعلیق درآمده است.' };
    }

    if (!operator.permissions.includes('RATE_MANUAL_OVERRIDE')) {
      return { success: false, error: 'این کاربر دسترسی مجاز برای تغییر دستی نرخ طلا (RATE_MANUAL_OVERRIDE) را ندارد.' };
    }

    const rateIdx = this.rates.findIndex((r) => r.id === params.rateId);
    if (rateIdx === -1) {
      return { success: false, error: 'نماد نرخ مورد نظر یافت نشد.' };
    }

    const targetRate = this.rates[rateIdx];
    const oldSellPrice = targetRate.sellPriceToman;
    const newSellPrice = Math.round(params.newSellPrice);
    const newBuyPrice = params.newBuyPrice ? Math.round(params.newBuyPrice) : Math.round(newSellPrice * 0.994);
    const deltaPercent = parseFloat((((newSellPrice - oldSellPrice) / oldSellPrice) * 100).toFixed(2));
    const nowFa = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());

    const isHighVolatility = Math.abs(deltaPercent) >= this.securityPolicy.dualApprovalThresholdPercent;
    const logId = `log-1403-${Math.floor(100 + Math.random() * 900)}`;

    if (isHighVolatility && operator.role !== 'CHIEF_TREASURER') {
      // Create pending dual approval
      const auditLog: RateChangeAuditLog = {
        id: logId,
        rateId: targetRate.id,
        symbol: targetRate.symbol,
        titleFa: targetRate.titleFa,
        oldSellPrice,
        newSellPrice,
        deltaPercent,
        operatorId: operator.id,
        operatorNameFa: operator.nameFa,
        operatorRoleFa: operator.roleFa,
        reason: params.reason || 'تغییر دستی مظنه در تابلوی خزانه‌داری',
        status: 'pending_dual_approval',
        statusFa: `در انتظار تأیید دونفره (نوسان ${Math.abs(deltaPercent)}٪ بالاتر از آستانه ${this.securityPolicy.dualApprovalThresholdPercent}٪)`,
        timestampFa: nowFa,
        ipAddress: params.ipAddress || '192.168.10.22'
      };

      this.auditLogs.unshift(auditLog);
      return {
        success: true,
        requiresApproval: true,
        auditLog,
        error: `تغییر نرخ به دلیل نوسان بیش از ${this.securityPolicy.dualApprovalThresholdPercent}٪ ثبت شد و نیازمند تأیید مدیر ریسک (Dual Approval) است.`
      };
    }

    // Direct apply
    targetRate.sellPriceToman = newSellPrice;
    targetRate.buyPriceToman = newBuyPrice;
    targetRate.changePercent24h = parseFloat((targetRate.changePercent24h + deltaPercent).toFixed(2));
    targetRate.updatedAtFa = nowFa;

    operator.lastRateChangeAtFa = nowFa;

    const auditLog: RateChangeAuditLog = {
      id: logId,
      rateId: targetRate.id,
      symbol: targetRate.symbol,
      titleFa: targetRate.titleFa,
      oldSellPrice,
      newSellPrice,
      deltaPercent,
      operatorId: operator.id,
      operatorNameFa: operator.nameFa,
      operatorRoleFa: operator.roleFa,
      reason: params.reason || 'تغییر مستقیم نرخ توسط اپراتور مجاز خزانه‌داری',
      status: 'applied',
      statusFa: 'اعمال قطعی در تابلوی زنده سامانه',
      approverNameFa: operator.role === 'CHIEF_TREASURER' ? 'تأیید خودکار (مدیر ارشد خزانه‌داری)' : 'سیستم خودکار (محدوده مجاز)',
      timestampFa: nowFa,
      ipAddress: params.ipAddress || '192.168.10.22'
    };

    this.auditLogs.unshift(auditLog);

    return {
      success: true,
      requiresApproval: false,
      rate: targetRate,
      auditLog
    };
  }

  public approveRateChange(auditLogId: string, approverId: string): { success: boolean; rate?: GoldSpotRate; auditLog?: RateChangeAuditLog; error?: string } {
    const logIdx = this.auditLogs.findIndex((l) => l.id === auditLogId);
    if (logIdx === -1) {
      return { success: false, error: 'درخواست تغییر نرخ مورد نظر یافت نشد.' };
    }

    const log = this.auditLogs[logIdx];
    if (log.status !== 'pending_dual_approval') {
      return { success: false, error: 'این تغییر نرخ در انتظار تأیید قرار ندارد.' };
    }

    const approver = this.authorizedUsers.find((u) => u.id === approverId);
    if (!approver) {
      return { success: false, error: 'شناسه تأییدکننده معتبر نیست.' };
    }

    if (!approver.permissions.includes('DUAL_APPROVAL_SIGN')) {
      return { success: false, error: 'این کاربر مجوز تأیید دونفره تغییرات نرخ (DUAL_APPROVAL_SIGN) را ندارد.' };
    }

    if (approver.id === log.operatorId) {
      return { success: false, error: 'اصل چهارچشم (Four-Eyes Principle): ثبت‌کننده و تأییدکننده تغییر نرخ نمی‌توانند یک نفر باشند.' };
    }

    // Apply change to rate
    const targetRate = this.rates.find((r) => r.id === log.rateId);
    if (targetRate) {
      targetRate.sellPriceToman = log.newSellPrice;
      targetRate.buyPriceToman = Math.round(log.newSellPrice * 0.994);
      targetRate.changePercent24h = parseFloat((targetRate.changePercent24h + log.deltaPercent).toFixed(2));
      targetRate.updatedAtFa = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date());
    }

    log.status = 'applied';
    log.statusFa = 'اعمال قطعی پس از تایید دونفره (Dual Approval)';
    log.approverNameFa = `${approver.nameFa} (${approver.roleFa})`;

    return { success: true, rate: targetRate, auditLog: log };
  }

  public rejectRateChange(auditLogId: string, approverId: string, rejectionReason?: string): { success: boolean; auditLog?: RateChangeAuditLog; error?: string } {
    const logIdx = this.auditLogs.findIndex((l) => l.id === auditLogId);
    if (logIdx === -1) {
      return { success: false, error: 'درخواست تغییر نرخ یافت نشد.' };
    }

    const log = this.auditLogs[logIdx];
    const approver = this.authorizedUsers.find((u) => u.id === approverId);
    if (!approver || !approver.permissions.includes('DUAL_APPROVAL_SIGN')) {
      return { success: false, error: 'مجوز رد/تأیید درخواست وجود ندارد.' };
    }

    log.status = 'rejected';
    log.statusFa = `رد درخواست توسط ${approver.nameFa} (${rejectionReason || 'عدم تطابق با جریان کلان بازار'})`;
    log.approverNameFa = approver.nameFa;

    return { success: true, auditLog: log };
  }

  public toggleCircuitBreaker(freeze: boolean, reason: string, operatorId: string): { success: boolean; policy: RateSecurityPolicy; error?: string } {
    const operator = this.authorizedUsers.find((u) => u.id === operatorId);
    if (!operator || !operator.permissions.includes('CIRCUIT_BREAKER_TRIGGER')) {
      return { success: false, policy: this.securityPolicy, error: 'کاربر مجاز به فعال‌سازی فیوز توقف معاملات طلا نیست.' };
    }

    this.securityPolicy.marketStatus = freeze ? 'frozen' : 'open';
    this.securityPolicy.circuitBreakerReason = freeze ? reason : undefined;
    this.securityPolicy.lastUpdatedFa = new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());

    return { success: true, policy: this.securityPolicy };
  }

  public updateSecurityPolicy(updates: Partial<RateSecurityPolicy>): RateSecurityPolicy {
    this.securityPolicy = {
      ...this.securityPolicy,
      ...updates,
      lastUpdatedFa: new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date())
    };
    return this.securityPolicy;
  }
}

export const k13Storage = new K13Storage();
