/**
 * Didar Gold Platform - Kernel Domain K11 Storage
 * Retailer Lifecycle & Commercial Access (چرخه خرده‌فروش و دسترسی تجاری)
 */

import {
  Retailer,
  K11DataPayload,
  K11SummaryMetrics,
  CommercialTier,
  RetailerLifecycleStatus,
  CommercialTerms,
  RetailerTerritory,
  RetailerAllowedBasket,
  CommercialExceptionOverride
} from '../src/types/k11.js';

class K11Storage {
  private retailers: Retailer[] = [
    {
      id: 'ret-101',
      code: 'RET-TEH-001',
      tradeNameFa: 'گالری طلا و جواهر زمرد (بازار بزرگ)',
      ownerFullNameFa: 'حاج محمود کمالی',
      nationalCode: '۰۰۴۸۱۷۲۹۱۰',
      unionLicenseNumber: '۱۴۰۱/ت/۹۸۲۰',
      guildRegistryCode: 'GLD-TEH-8812',
      phoneNumber: '۰۲۱-۵۵۶۲۳۴۹۰',
      mobileNumber: '۰۹۱۲۱۱۱۸۸۴۴',
      provinceFa: 'تهران',
      cityFa: 'تهران',
      postalAddressFa: 'بازار بزرگ تهران، سرای حاج مهدی، طبقه همکف، پلاک ۱۴',
      postalCode: '۱۱۶۳۶۸۷۱۹۱',
      establishmentYearFa: '۱۳۶۸',
      storeAreaSquareMeters: 45,
      securityRatingFa: 'گرید A+ (سیستم مه‌ساز، گاوصندوق دژبان ضددیلم، دوربین متصل به فراجا)',
      status: 'active_trading',
      statusFa: 'فعال تجاری و تسویه منظم',
      allowedBasket: {
        permittedCarats: ['18k_750', '21k_875', '22k_916', '24k_999'],
        permittedCategoriesFa: ['سرویس کامل عروس', 'النگو و دستبند', 'زنجیر فیگارو و کارتیه', 'شمش سرمایه‌گذاری'],
        minOrderWeightGrams: 50,
        maxOrderWeightGrams: 3000,
        bullionPurchaseAllowed: true,
        customWorkshopOrderAllowed: true,
        consignmentShowcaseAllowed: true,
        maxConsignmentWeightGrams: 850
      },
      commercialTerms: {
        tier: 'diamond',
        tierFa: 'الماس (سقف ویژه تجاری)',
        trustScore: 98,
        wageDiscountPercent: 3.0,
        creditLimitToman: 12000000000, // ۱۲ میلیارد تومان
        creditLimitGoldGrams: 1500, // ۱.۵ کیلوگرم طلای ۱۸ عیار
        currentUsedCreditToman: 3450000000,
        currentUsedCreditGoldGrams: 420.5,
        paymentTenorDays: 45,
        allowScrapGoldBarter: true,
        allowPostDatedCheque: true,
        guaranteeDocReference: 'سند ملکی ثبتی پلاک ۳۴/۸۷۰ تهران + ضمانت‌نامه بانک تجارت',
        lastCreditReviewDateFa: '۱۴۰۳/۰۸/۱۵'
      },
      territory: {
        regionCode: 'TEH',
        regionTitleFa: 'تهران - بازار بزرگ',
        marketDistrictFa: 'سرای حاج مهدی و سبزه میدان',
        assignedAgentId: 'agt-01',
        assignedAgentNameFa: 'مهندس حسام داوودی',
        backupAgentNameFa: 'حمیدرضا رضایی',
        scheduledVisitDayFa: 'دوشنبه‌ها نوبت صبح (ساعت ۱۰:۳۰)',
        isExclusiveZone: false
      },
      purchaseHistory: {
        lifetimeOrdersCount: 42,
        lifetimeGoldWeightGrams: 14820.5,
        lifetimeTurnoverToman: 54600000000,
        yearToDateGoldWeightGrams: 3240.2,
        yearToDateTurnoverToman: 14850000000,
        onTimeSettlementRatePercent: 99.1,
        averageDaysToSettle: 18,
        scrapGoldHandedOverGrams: 2890.0,
        disputedOrdersCount: 0,
        lastOrderDateFa: '۱۴۰۳/۰۹/۰۸',
        lastOrderNumber: 'ORD-1403-8821'
      },
      activeExceptions: [],
      notesFa: 'مشتری از بنکداران سرشناس بازار؛ خوش‌حساب با تسویه سریع طلای آبشده.',
      createdAtFa: '۱۴۰۲/۰۳/۱۰',
      updatedAtFa: '۱۴۰۳/۰۹/۰۸'
    },
    {
      id: 'ret-102',
      code: 'RET-TEH-002',
      tradeNameFa: 'طلا و جواهرات رویال پالاس (تجریش)',
      ownerFullNameFa: 'مهندس بردیا فرهمند',
      nationalCode: '۰۰۷۶۵۴۳۲۱۸',
      unionLicenseNumber: '۱۴۰۲/ش/۳۴۱۲',
      guildRegistryCode: 'GLD-TEH-9014',
      phoneNumber: '۰۲۱-۲۲۷۴۵۵۸۸',
      mobileNumber: '۰۹۱۲۲۲۳۴۴۵۵',
      provinceFa: 'تهران',
      cityFa: 'تهران',
      postalAddressFa: 'میدان تجریش، بازار قائم، طبقه دوم طلا، پلاک ۱۱۸',
      postalCode: '۱۹۳۴۷۲۸۳۴۱',
      establishmentYearFa: '۱۳۹۵',
      storeAreaSquareMeters: 38,
      securityRatingFa: 'گرید A (شیشه ضدگلوله لایه‌ای، گاوصندوق رمزنگاری شده)',
      status: 'active_trading',
      statusFa: 'فعال تجاری و تسویه منظم',
      allowedBasket: {
        permittedCarats: ['18k_750', '21k_875'],
        permittedCategoriesFa: ['سرویس کامل عروس', 'انگشتر و مدال سولیتر', 'گوشواره فانتزی ایتالیایی'],
        minOrderWeightGrams: 30,
        maxOrderWeightGrams: 1800,
        bullionPurchaseAllowed: false,
        customWorkshopOrderAllowed: true,
        consignmentShowcaseAllowed: true,
        maxConsignmentWeightGrams: 450
      },
      commercialTerms: {
        tier: 'platinum',
        tierFa: 'پلاتین (اعتبار طلای معین)',
        trustScore: 92,
        wageDiscountPercent: 2.0,
        creditLimitToman: 6000000000,
        creditLimitGoldGrams: 750,
        currentUsedCreditToman: 1800000000,
        currentUsedCreditGoldGrams: 220,
        paymentTenorDays: 30,
        allowScrapGoldBarter: true,
        allowPostDatedCheque: true,
        guaranteeDocReference: 'چک صیادی ضمانت به شناسه ۱۲۸۹۳۰۴۹۲۸۳ + ظهرنویسی ضامن معتبر صنف',
        lastCreditReviewDateFa: '۱۴۰۳/۰۷/۲۰'
      },
      territory: {
        regionCode: 'TEH',
        regionTitleFa: 'تهران - شمیرانات',
        marketDistrictFa: 'بازار قائم تجریش و راسته ولیعصر',
        assignedAgentId: 'agt-01',
        assignedAgentNameFa: 'مهندس حسام داوودی',
        backupAgentNameFa: 'نیما میرزایی',
        scheduledVisitDayFa: 'چهارشنبه‌ها عصر (ساعت ۱۶:۰۰)',
        isExclusiveZone: false
      },
      purchaseHistory: {
        lifetimeOrdersCount: 29,
        lifetimeGoldWeightGrams: 8940.0,
        lifetimeTurnoverToman: 33800000000,
        yearToDateGoldWeightGrams: 2150.0,
        yearToDateTurnoverToman: 9800000000,
        onTimeSettlementRatePercent: 96.5,
        averageDaysToSettle: 24,
        scrapGoldHandedOverGrams: 1750.0,
        disputedOrdersCount: 0,
        lastOrderDateFa: '۱۴۰۳/۰۹/۰۷',
        lastOrderNumber: 'ORD-1403-8819'
      },
      activeExceptions: [],
      notesFa: 'مشتری متمرکز بر سرویس‌های لوکس سبک ایتالیایی و فروشگاه با پاخور بالا.',
      createdAtFa: '۱۴۰۲/۰۵/۱۴',
      updatedAtFa: '۱۴۰۳/۰۹/۰۷'
    },
    {
      id: 'ret-103',
      code: 'RET-ISF-001',
      tradeNameFa: 'گالری طلای نقش‌جهان اصفهان',
      ownerFullNameFa: 'حاج مصطفی صراف‌پور',
      nationalCode: '۱۲۸۹۴۵۶۱۲۰',
      unionLicenseNumber: '۱۴۰۰/الف/۷۱۲۹',
      guildRegistryCode: 'GLD-ISF-4431',
      phoneNumber: '۰۳۱-۳۲۲۱۴۵۶۷',
      mobileNumber: '۰۹۱۳۱۱۴۸۸۹۹',
      provinceFa: 'اصفهان',
      cityFa: 'اصفهان',
      postalAddressFa: 'میدان نقش‌جهان، ورودی بازار قیصریه، سرای چیت‌سازها، پلاک ۹',
      postalCode: '۸۱۴۶۶۳۳۱۴۵',
      establishmentYearFa: '۱۳۷۳',
      storeAreaSquareMeters: 55,
      securityRatingFa: 'گرید A+ (سیستم اتاق امن، دوربین حرارتی و هشدار آنلاین اتحادیه)',
      status: 'active_trading',
      statusFa: 'فعال تجاری و تسویه منظم',
      allowedBasket: {
        permittedCarats: ['18k_750', '21k_875', '22k_916'],
        permittedCategoriesFa: ['النگو ریخته‌گری اصفهان', 'سرویس قلم‌زنی سنتی', 'سرویس فیوژن مدرن'],
        minOrderWeightGrams: 80,
        maxOrderWeightGrams: 4000,
        bullionPurchaseAllowed: true,
        customWorkshopOrderAllowed: true,
        consignmentShowcaseAllowed: true,
        maxConsignmentWeightGrams: 1000
      },
      commercialTerms: {
        tier: 'diamond',
        tierFa: 'الماس (سقف ویژه تجاری)',
        trustScore: 97,
        wageDiscountPercent: 2.8,
        creditLimitToman: 10000000000,
        creditLimitGoldGrams: 1200,
        currentUsedCreditToman: 2900000000,
        currentUsedCreditGoldGrams: 350,
        paymentTenorDays: 45,
        allowScrapGoldBarter: true,
        allowPostDatedCheque: true,
        guaranteeDocReference: 'ضمانت‌نامه ملکی دفتر اسناد رسمی شماره ۱۲ اصفهان',
        lastCreditReviewDateFa: '۱۴۰۳/۰۸/۰۱'
      },
      territory: {
        regionCode: 'ISF',
        regionTitleFa: 'اصفهان - میدان نقش‌جهان',
        marketDistrictFa: 'بازار قیصریه و سرای چیت‌سازها',
        assignedAgentId: 'agt-02',
        assignedAgentNameFa: 'مهندس علی رضاییان',
        backupAgentNameFa: 'محسن کریمی',
        scheduledVisitDayFa: 'یک‌شنبه‌ها نوبت صبح (ساعت ۹:۳۰)',
        isExclusiveZone: true
      },
      purchaseHistory: {
        lifetimeOrdersCount: 51,
        lifetimeGoldWeightGrams: 19400.0,
        lifetimeTurnoverToman: 69800000000,
        yearToDateGoldWeightGrams: 4100.5,
        yearToDateTurnoverToman: 18200000000,
        onTimeSettlementRatePercent: 98.8,
        averageDaysToSettle: 20,
        scrapGoldHandedOverGrams: 3950.0,
        disputedOrdersCount: 0,
        lastOrderDateFa: '۱۴۰۳/۰۹/۰۵',
        lastOrderNumber: 'ORD-1403-8812'
      },
      activeExceptions: [],
      notesFa: 'یکی از قطب‌های اصلی توزیع در استان اصفهان با تسویه‌های تهاتری بسیار منظم.',
      createdAtFa: '۱۴۰۱/۱۱/۲۰',
      updatedAtFa: '۱۴۰۳/۰۹/۰۵'
    },
    {
      id: 'ret-104',
      code: 'RET-MSH-001',
      tradeNameFa: 'جواهرات طوس و نگین (مشهد - خسروی)',
      ownerFullNameFa: 'حاج سید جواد رضوی‌نژاد',
      nationalCode: '۰۹۴۸۸۹۰۱۲۱',
      unionLicenseNumber: '۱۴۰۲/م/۵۵۸۰',
      guildRegistryCode: 'GLD-MSH-2290',
      phoneNumber: '۰۵۱-۳۲۲۵۴۳۲۱',
      mobileNumber: '۰۹۱۵۱۱۰۳۳۴۴',
      provinceFa: 'خراسان رضوی',
      cityFa: 'مشهد',
      postalAddressFa: 'خیابان خسروی نو، روبروی هتل اترک، مجتمع طلای کوثر، پلاک ۲۱',
      postalCode: '۹۱۳۴۵۶۷۸۹۰',
      establishmentYearFa: '۱۳۸۱',
      storeAreaSquareMeters: 42,
      securityRatingFa: 'گرید A (ویترین ضدسرقت هیدرولیک، اتصال به پلیس ۱۱۰)',
      status: 'active_trading',
      statusFa: 'فعال تجاری و تسویه منظم',
      allowedBasket: {
        permittedCarats: ['18k_750', '21k_875'],
        permittedCategoriesFa: ['انگشترهای فاخر نگین‌دار', 'سرویس فیروزه‌کوبی و طلا', 'مدال و پلاک زائر'],
        minOrderWeightGrams: 40,
        maxOrderWeightGrams: 2200,
        bullionPurchaseAllowed: false,
        customWorkshopOrderAllowed: true,
        consignmentShowcaseAllowed: true,
        maxConsignmentWeightGrams: 600
      },
      commercialTerms: {
        tier: 'gold',
        tierFa: 'طلایی (اعتبار متوازن)',
        trustScore: 89,
        wageDiscountPercent: 1.5,
        creditLimitToman: 4500000000,
        creditLimitGoldGrams: 500,
        currentUsedCreditToman: 2200000000,
        currentUsedCreditGoldGrams: 260,
        paymentTenorDays: 30,
        allowScrapGoldBarter: true,
        allowPostDatedCheque: true,
        guaranteeDocReference: 'چک تضمین صیادی بنفش به مبلغ ۵۰ میلیارد ریال',
        lastCreditReviewDateFa: '۱۴۰۳/۰۶/۲۵'
      },
      territory: {
        regionCode: 'MSH',
        regionTitleFa: 'خراسان رضوی - مشهد مقدس',
        marketDistrictFa: 'خیابان خسروی نو و بازار رضا',
        assignedAgentId: 'agt-03',
        assignedAgentNameFa: 'مهندس سجاد موسوی',
        backupAgentNameFa: 'امیر ابراهیمی',
        scheduledVisitDayFa: 'سه‌شنبه‌ها نوبت صبح (ساعت ۱۰:۰۰)',
        isExclusiveZone: false
      },
      purchaseHistory: {
        lifetimeOrdersCount: 34,
        lifetimeGoldWeightGrams: 9800.0,
        lifetimeTurnoverToman: 36200000000,
        yearToDateGoldWeightGrams: 2400.0,
        yearToDateTurnoverToman: 10900000000,
        onTimeSettlementRatePercent: 94.2,
        averageDaysToSettle: 28,
        scrapGoldHandedOverGrams: 1850.0,
        disputedOrdersCount: 0,
        lastOrderDateFa: '۱۴۰۳/۰۹/۰۳',
        lastOrderNumber: 'ORD-1403-8804'
      },
      activeExceptions: [],
      notesFa: 'مشتری بازار زیارتی مشهد؛ کشش بالا در اقلام طلا با سنگ فیروزه نیشابور.',
      createdAtFa: '۱۴۰۲/۰۱/۱۵',
      updatedAtFa: '۱۴۰۳/۰۹/۰۳'
    },
    {
      id: 'ret-105',
      code: 'RET-TBZ-001',
      tradeNameFa: 'طلای امیرکبیر تبریز (تیمچه مظفریه)',
      ownerFullNameFa: 'حاج یعقوب پورجعفر',
      nationalCode: '۱۳۷۸۸۱۲۰۳۹',
      unionLicenseNumber: '۱۴۰۱/ت/۳۳۹۰',
      guildRegistryCode: 'GLD-TBZ-1104',
      phoneNumber: '۰۴۱-۳۵۲۶۷۸۹۰',
      mobileNumber: '۰۹۱۴۳۱۰۹۹۸۸',
      provinceFa: 'آذربایجان شرقی',
      cityFa: 'تبریز',
      postalAddressFa: 'بازار سرپوشیده تبریز، راسته امیرکبیر، دالان اول، پلاک ۳۳',
      postalCode: '۵۱۳۴۶۷۸۹۰۱',
      establishmentYearFa: '۱۳۷۰',
      storeAreaSquareMeters: 50,
      securityRatingFa: 'گرید A (سیستم ضدسرقت صوتی و دزدگیر بی‌سیم با نظارت کلانتری بازار)',
      status: 'under_review',
      statusFa: 'تحت بازنگری دوره‌ای اعتباری',
      statusReasonFa: 'انقضای تاریخ اعتبار پروانه کسب صنفی و لزوم ثبت گواهی تمدید ۱۴۰۴',
      allowedBasket: {
        permittedCarats: ['18k_750'],
        permittedCategoriesFa: ['النگو و دستبند ریخته‌گری', 'زنجیر فیگارو', 'نیم‌ست گل‌دار'],
        minOrderWeightGrams: 40,
        maxOrderWeightGrams: 1500,
        bullionPurchaseAllowed: false,
        customWorkshopOrderAllowed: false,
        consignmentShowcaseAllowed: false,
        maxConsignmentWeightGrams: 0
      },
      commercialTerms: {
        tier: 'silver',
        tierFa: 'نقره‌ای (سقف موقت و نقدی)',
        trustScore: 81,
        wageDiscountPercent: 0.5,
        creditLimitToman: 2000000000,
        creditLimitGoldGrams: 200,
        currentUsedCreditToman: 850000000,
        currentUsedCreditGoldGrams: 95,
        paymentTenorDays: 15,
        allowScrapGoldBarter: true,
        allowPostDatedCheque: false,
        guaranteeDocReference: 'سفته حسن اجرای تعهد به مبلغ ۲۰ میلیارد ریال',
        lastCreditReviewDateFa: '۱۴۰۳/۰۸/۲۸'
      },
      territory: {
        regionCode: 'TBZ',
        regionTitleFa: 'آذربایجان شرقی - تبریز',
        marketDistrictFa: 'راسته امیرکبیر و تیمچه مظفریه',
        assignedAgentId: 'agt-04',
        assignedAgentNameFa: 'مهندس بهزاد شکوری',
        scheduledVisitDayFa: 'شنبه‌ها نوبت صبح (ساعت ۱۱:۰۰)',
        isExclusiveZone: false
      },
      purchaseHistory: {
        lifetimeOrdersCount: 22,
        lifetimeGoldWeightGrams: 5200.0,
        lifetimeTurnoverToman: 19400000000,
        yearToDateGoldWeightGrams: 1100.0,
        yearToDateTurnoverToman: 4900000000,
        onTimeSettlementRatePercent: 88.5,
        averageDaysToSettle: 21,
        scrapGoldHandedOverGrams: 920.0,
        disputedOrdersCount: 1,
        lastOrderDateFa: '۱۴۰۳/۰۸/۲۲',
        lastOrderNumber: 'ORD-1403-8791'
      },
      activeExceptions: [],
      notesFa: 'مشتری قدیمی بازار تبریز؛ نیازمند بارگذاری گواهی تمدید پروانه اتحادیه زرگران تبریز.',
      createdAtFa: '۱۴۰۲/۰۴/۱۸',
      updatedAtFa: '۱۴۰۳/۰۸/۲۸'
    },
    {
      id: 'ret-106',
      code: 'RET-SHZ-001',
      tradeNameFa: 'گالری طلای زند شیراز (بازار وکیل)',
      ownerFullNameFa: 'مهندس پیمان دهقانی',
      nationalCode: '۲۲۹۸۸۴۳۲۱۱',
      unionLicenseNumber: '۱۴۰۲/ش/۸۹۰۱',
      guildRegistryCode: 'GLD-SHZ-6678',
      phoneNumber: '۰۷۱-۳۲۲۳۱۱۴۴',
      mobileNumber: '۰۹۱۷۱۱۲۴۴۳۳',
      provinceFa: 'فارس',
      cityFa: 'شیراز',
      postalAddressFa: 'بازار وکیل شمالی، سرای مشیر، راسته زرگرها، پلاک ۱۸',
      postalCode: '۷۱۳۴۵۶۷۸۹۱',
      establishmentYearFa: '۱۳۸۸',
      storeAreaSquareMeters: 35,
      securityRatingFa: 'گرید A (پنجره‌های کامپوزیتی ضدسرقت، حسگر لرزشی متصل به مرکز)',
      status: 'active_trading',
      statusFa: 'فعال تجاری و تسویه منظم',
      allowedBasket: {
        permittedCarats: ['18k_750', '21k_875'],
        permittedCategoriesFa: ['سرویس فیروزه و عقیق شیراز', 'النگو تراش برجسته', 'گردنبندهای سنتی'],
        minOrderWeightGrams: 30,
        maxOrderWeightGrams: 1500,
        bullionPurchaseAllowed: false,
        customWorkshopOrderAllowed: true,
        consignmentShowcaseAllowed: true,
        maxConsignmentWeightGrams: 350
      },
      commercialTerms: {
        tier: 'gold',
        tierFa: 'طلایی (اعتبار متوازن)',
        trustScore: 88,
        wageDiscountPercent: 1.2,
        creditLimitToman: 3500000000,
        creditLimitGoldGrams: 400,
        currentUsedCreditToman: 1100000000,
        currentUsedCreditGoldGrams: 130,
        paymentTenorDays: 30,
        allowScrapGoldBarter: true,
        allowPostDatedCheque: true,
        guaranteeDocReference: 'چک صیادی صنف طلا به شناسه ۴۸۳۹۲۰۱۹۲۸۳',
        lastCreditReviewDateFa: '۱۴۰۳/۰۸/۱۰'
      },
      territory: {
        regionCode: 'SHZ',
        regionTitleFa: 'فارس - شیراز',
        marketDistrictFa: 'بازار وکیل و سرای مشیر',
        assignedAgentId: 'agt-05',
        assignedAgentNameFa: 'مهندس کامران فیروزی',
        scheduledVisitDayFa: 'دوشنبه‌ها نوبت عصر (ساعت ۱۷:۰۰)',
        isExclusiveZone: false
      },
      purchaseHistory: {
        lifetimeOrdersCount: 26,
        lifetimeGoldWeightGrams: 6400.0,
        lifetimeTurnoverToman: 23800000000,
        yearToDateGoldWeightGrams: 1500.0,
        yearToDateTurnoverToman: 6800000000,
        onTimeSettlementRatePercent: 95.0,
        averageDaysToSettle: 26,
        scrapGoldHandedOverGrams: 1200.0,
        disputedOrdersCount: 0,
        lastOrderDateFa: '۱۴۰۳/۰۹/۰۲',
        lastOrderNumber: 'ORD-1403-8800'
      },
      activeExceptions: [
        {
          id: 'exc-01',
          appliedDateFa: '۱۴۰۳/۰۸/۲۵',
          expiryDateFa: '۱۴۰۳/۰۹/۲۵',
          authorizedByFa: 'کمیته اعتبارات دیدار (مهندس سرمدی)',
          temporaryCreditBonusGoldGrams: 100,
          temporaryCreditBonusToman: 900000000,
          reasonFa: 'افزایش موقت سقف به دلیل نمایشگاه سالانه طلا و جواهر استان فارس',
          status: 'active'
        }
      ],
      notesFa: 'مشتری ممتاز بازار وکیل؛ همکاری مستمر با ویزیتور و تسویه منظم اقساط.',
      createdAtFa: '۱۴۰۲/۰۶/۱۰',
      updatedAtFa: '۱۴۰۳/۰۹/۰۲'
    },
    {
      id: 'ret-107',
      code: 'RET-AHV-001',
      tradeNameFa: 'گالری طلای کارون اهواز (عیار ۲۱ و ۲۲)',
      ownerFullNameFa: 'حاج سامی طرفی‌پور',
      nationalCode: '۱۷۵۸۸۲۹۹۱۴',
      unionLicenseNumber: '۱۴۰۱/خ/۴۴۱۰',
      guildRegistryCode: 'GLD-AHV-3320',
      phoneNumber: '۰۶۱-۳۲۲۱۸۸۹۰',
      mobileNumber: '۰۹۱۶۱۱۱۷۷۶۶',
      provinceFa: 'خوزستان',
      cityFa: 'اهواز',
      postalAddressFa: 'اهواز، خیابان طالقانی، راسته زرگرها، نبش کوچه یعقوبی، پلاک ۱۲',
      postalCode: '۶۱۳۴۹۸۷۶۵۴',
      establishmentYearFa: '۱۳۸۵',
      storeAreaSquareMeters: 40,
      securityRatingFa: 'گرید A+ (سیستم ضدحمله مسلحانه، گاوصندوق دوکاره مکانیکی-الکترونیک)',
      status: 'active_trading',
      statusFa: 'فعال تجاری و تسویه منظم',
      allowedBasket: {
        permittedCarats: ['18k_750', '21k_875', '22k_916'],
        permittedCategoriesFa: ['سرویس سنگین عربی ۲۱ و ۲۲ عیار', 'النگو داماس ۲۱ عیار', 'گردنبندهای سکه‌ای خلیجی'],
        minOrderWeightGrams: 80,
        maxOrderWeightGrams: 3500,
        bullionPurchaseAllowed: true,
        customWorkshopOrderAllowed: true,
        consignmentShowcaseAllowed: true,
        maxConsignmentWeightGrams: 700
      },
      commercialTerms: {
        tier: 'platinum',
        tierFa: 'پلاتین (اعتبار طلای معین)',
        trustScore: 94,
        wageDiscountPercent: 2.2,
        creditLimitToman: 8500000000,
        creditLimitGoldGrams: 1000,
        currentUsedCreditToman: 3200000000,
        currentUsedCreditGoldGrams: 380,
        paymentTenorDays: 30,
        allowScrapGoldBarter: true,
        allowPostDatedCheque: true,
        guaranteeDocReference: 'سند ثبتی تجاری دفترخانه اهواز + سفته بانکی',
        lastCreditReviewDateFa: '۱۴۰۳/۰۸/۰۵'
      },
      territory: {
        regionCode: 'AHV',
        regionTitleFa: 'خوزستان - اهواز',
        marketDistrictFa: 'خیابان طالقانی و راسته زرگرها',
        assignedAgentId: 'agt-06',
        assignedAgentNameFa: 'مهندس منصور عامری',
        scheduledVisitDayFa: 'سه‌شنبه‌ها نوبت عصر (ساعت ۱۸:۰۰)',
        isExclusiveZone: true
      },
      purchaseHistory: {
        lifetimeOrdersCount: 38,
        lifetimeGoldWeightGrams: 13200.0,
        lifetimeTurnoverToman: 48500000000,
        yearToDateGoldWeightGrams: 3100.0,
        yearToDateTurnoverToman: 13900000000,
        onTimeSettlementRatePercent: 97.4,
        averageDaysToSettle: 22,
        scrapGoldHandedOverGrams: 2750.0,
        disputedOrdersCount: 0,
        lastOrderDateFa: '۱۴۰۳/۰۹/۰۴',
        lastOrderNumber: 'ORD-1403-8809'
      },
      activeExceptions: [],
      notesFa: 'مشتری عمده طلای با عیار بالا (۲۱ و ۲۲ عیار)؛ تسویه منظم به صورت طلای آبشده محلی.',
      createdAtFa: '۱۴۰۲/۰۲/۲۲',
      updatedAtFa: '۱۴۰۳/۰۹/۰۴'
    },
    {
      id: 'ret-108',
      code: 'RET-TEH-003',
      tradeNameFa: 'گالری طلای کیمیا (کریمخان)',
      ownerFullNameFa: 'خانم مهندس فرنوش یزدانی',
      nationalCode: '۰۰۳۴۹۲۸۳۷۴',
      unionLicenseNumber: '۱۴۰۳/ک/۲۱۴۰',
      guildRegistryCode: 'GLD-TEH-7789',
      phoneNumber: '۰۲۱-۸۸۹۰۱۲۳۴',
      mobileNumber: '۰۹۱۲۴۴۹۹۱۱۲',
      provinceFa: 'تهران',
      cityFa: 'تهران',
      postalAddressFa: 'خیابان کریمخان زند، بین ایرانشهر و خردمند، پلاک ۱۸۴',
      postalCode: '۱۵۸۴۹۲۸۳۱۱',
      establishmentYearFa: '۱۴۰۲',
      storeAreaSquareMeters: 30,
      securityRatingFa: 'گرید B+ (گاوصندوق استاندارد و دوربین مداربسته شبکه‌ای)',
      status: 'probationary',
      statusFa: 'دوره آزمایشی پذیرش (محدودیت سقف)',
      statusReasonFa: 'عضو جدید پلتفرم (کمتر از ۶ ماه سابقه عضویت)؛ تسویه صرفاً نقدی یا طلای آبشده قبل از ارسال',
      allowedBasket: {
        permittedCarats: ['18k_750'],
        permittedCategoriesFa: ['انگشتر مینیمال', 'گوشواره فانتزی', 'پلاک و زنجیر سبک'],
        minOrderWeightGrams: 20,
        maxOrderWeightGrams: 600,
        bullionPurchaseAllowed: false,
        customWorkshopOrderAllowed: false,
        consignmentShowcaseAllowed: false,
        maxConsignmentWeightGrams: 0
      },
      commercialTerms: {
        tier: 'bronze',
        tierFa: 'برنزی (تسویه نقدی/آبشده فوری)',
        trustScore: 74,
        wageDiscountPercent: 0.0,
        creditLimitToman: 500000000,
        creditLimitGoldGrams: 50,
        currentUsedCreditToman: 0,
        currentUsedCreditGoldGrams: 0,
        paymentTenorDays: 0,
        allowScrapGoldBarter: true,
        allowPostDatedCheque: false,
        guaranteeDocReference: 'تعهدنامه بدو ورود و احراز اصالت پروانه کسب',
        lastCreditReviewDateFa: '۱۴۰۳/۰۹/۰۱'
      },
      territory: {
        regionCode: 'TEH',
        regionTitleFa: 'تهران - مرکز (کریمخان)',
        marketDistrictFa: 'راسته طلا و جواهر خیابان کریمخان',
        assignedAgentId: 'agt-01',
        assignedAgentNameFa: 'مهندس حسام داوودی',
        scheduledVisitDayFa: 'شنبه‌ها عصر (ساعت ۱۷:۳۰)',
        isExclusiveZone: false
      },
      purchaseHistory: {
        lifetimeOrdersCount: 6,
        lifetimeGoldWeightGrams: 850.0,
        lifetimeTurnoverToman: 3200000000,
        yearToDateGoldWeightGrams: 850.0,
        yearToDateTurnoverToman: 3200000000,
        onTimeSettlementRatePercent: 100.0,
        averageDaysToSettle: 0,
        scrapGoldHandedOverGrams: 410.0,
        disputedOrdersCount: 0,
        lastOrderDateFa: '۱۴۰۳/۰۸/۲۹',
        lastOrderNumber: 'ORD-1403-8798'
      },
      activeExceptions: [],
      notesFa: 'طراحی‌های مدرن و جوان‌پسند؛ دوره آزمایشی تا پایان بهمن ۱۴۰۳ ادامه دارد.',
      createdAtFa: '۱۴۰۳/۰۵/۰۱',
      updatedAtFa: '۱۴۰۳/۰۸/۲۹'
    },
    {
      id: 'ret-109',
      code: 'RET-TEH-004',
      tradeNameFa: 'جواهرات ماهان (پاساژ مهستان صادقیه)',
      ownerFullNameFa: 'بهزاد سلیمانی‌فرد',
      nationalCode: '۰۰۶۱۸۲۹۳۴۱',
      unionLicenseNumber: '۱۴۰۰/غ/۱۱۹۲',
      guildRegistryCode: 'GLD-TEH-5501',
      phoneNumber: '۰۲۱-۴۴۲۸۷۶۵۴',
      mobileNumber: '۰۹۱۲۳۴۵۶۷۸۹',
      provinceFa: 'تهران',
      cityFa: 'تهران',
      postalAddressFa: 'فلکه دوم صادقیه، پاساژ مهستان، طبقه منفی یک، واحد ۲۲',
      postalCode: '۱۴۵۱۸۲۹۳۰۱',
      establishmentYearFa: '۱۳۹۲',
      storeAreaSquareMeters: 28,
      securityRatingFa: 'گرید B',
      status: 'credit_suspended',
      statusFa: 'تعلیق اعتباری به دلیل تأخیر در تسویه',
      statusReasonFa: 'برگشت چک صیادی به شماره ۴۹۲۸۱۰ به مبلغ ۲۸۰ میلیون تومان و عدم پاس شدن در موعد مقرر',
      allowedBasket: {
        permittedCarats: ['18k_750'],
        permittedCategoriesFa: ['نیم‌ست سبک', 'النگو'],
        minOrderWeightGrams: 50,
        maxOrderWeightGrams: 400,
        bullionPurchaseAllowed: false,
        customWorkshopOrderAllowed: false,
        consignmentShowcaseAllowed: false,
        maxConsignmentWeightGrams: 0
      },
      commercialTerms: {
        tier: 'silver',
        tierFa: 'نقره‌ای (تعلیق موقت)',
        trustScore: 61,
        wageDiscountPercent: 0.0,
        creditLimitToman: 0,
        creditLimitGoldGrams: 0,
        currentUsedCreditToman: 280000000,
        currentUsedCreditGoldGrams: 32.5,
        paymentTenorDays: 0,
        allowScrapGoldBarter: false,
        allowPostDatedCheque: false,
        guaranteeDocReference: 'اخطاریه رسمی شماره ۱۰۸/اعتبار مورخ ۱۴۰۳/۰۸/۲۵',
        lastCreditReviewDateFa: '۱۴۰۳/۰۸/۲۶'
      },
      territory: {
        regionCode: 'TEH',
        regionTitleFa: 'تهران - غرب (صادقیه)',
        marketDistrictFa: 'پاساژ مهستان و ستارخان',
        assignedAgentId: 'agt-01',
        assignedAgentNameFa: 'مهندس حسام داوودی',
        scheduledVisitDayFa: 'سه‌شنبه‌ها نوبت عصر (ساعت ۱۶:۰۰)',
        isExclusiveZone: false
      },
      purchaseHistory: {
        lifetimeOrdersCount: 14,
        lifetimeGoldWeightGrams: 2850.0,
        lifetimeTurnoverToman: 10400000000,
        yearToDateGoldWeightGrams: 420.0,
        yearToDateTurnoverToman: 1850000000,
        onTimeSettlementRatePercent: 78.5,
        averageDaysToSettle: 38,
        scrapGoldHandedOverGrams: 180.0,
        disputedOrdersCount: 2,
        lastOrderDateFa: '۱۴۰۳/۰۸/۱۰',
        lastOrderNumber: 'ORD-1403-8750'
      },
      activeExceptions: [],
      notesFa: 'تا زمان واریز ریالی وجه چک یا عودت معادل طلای آبشده، ثبت هرگونه سفارش جدید مسدود است.',
      createdAtFa: '۱۴۰۱/۰۹/۱۰',
      updatedAtFa: '۱۴۰۳/۰۸/۲۶'
    }
  ];

  private territoryList = [
    {
      regionCode: 'TEH',
      regionTitleFa: 'تهران بزرگ',
      marketDistrictFa: 'بازار بزرگ (سرای حاج مهدی، سبزه میدان)، تجریش، کریمخان، صادقیه',
      assignedAgentNameFa: 'مهندس حسام داوودی',
      activeRetailersCount: 4
    },
    {
      regionCode: 'ISF',
      regionTitleFa: 'اصفهان',
      marketDistrictFa: 'میدان نقش‌جهان، بازار قیصریه و سرای چیت‌سازها',
      assignedAgentNameFa: 'مهندس علی رضاییان',
      activeRetailersCount: 1
    },
    {
      regionCode: 'MSH',
      regionTitleFa: 'خراسان رضوی (مشهد)',
      marketDistrictFa: 'خیابان خسروی نو، بازار رضا، بازار کوثر',
      assignedAgentNameFa: 'مهندس سجاد موسوی',
      activeRetailersCount: 1
    },
    {
      regionCode: 'TBZ',
      regionTitleFa: 'آذربایجان شرقی (تبریز)',
      marketDistrictFa: 'راسته امیرکبیر، تیمچه مظفریه، راسته بازار کفاشان',
      assignedAgentNameFa: 'مهندس بهزاد شکوری',
      activeRetailersCount: 1
    },
    {
      regionCode: 'SHZ',
      regionTitleFa: 'فارس (شیراز)',
      marketDistrictFa: 'بازار وکیل، سرای مشیر، راسته زرگرها',
      assignedAgentNameFa: 'مهندس کامران فیروزی',
      activeRetailersCount: 1
    },
    {
      regionCode: 'AHV',
      regionTitleFa: 'خوزستان (اهواز)',
      marketDistrictFa: 'خیابان طالقانی و راسته طلافروشان ۲۱ و ۲۲ عیار',
      assignedAgentNameFa: 'مهندس منصور عامری',
      activeRetailersCount: 1
    }
  ];

  private availableAgents = [
    { id: 'agt-01', nameFa: 'مهندس حسام داوودی', regionCode: 'TEH', activePortfoliosCount: 18 },
    { id: 'agt-02', nameFa: 'مهندس علی رضاییان', regionCode: 'ISF', activePortfoliosCount: 12 },
    { id: 'agt-03', nameFa: 'مهندس سجاد موسوی', regionCode: 'MSH', activePortfoliosCount: 14 },
    { id: 'agt-04', nameFa: 'مهندس بهزاد شکوری', regionCode: 'TBZ', activePortfoliosCount: 9 },
    { id: 'agt-05', nameFa: 'مهندس کامران فیروزی', regionCode: 'SHZ', activePortfoliosCount: 11 },
    { id: 'agt-06', nameFa: 'مهندس منصور عامری', regionCode: 'AHV', activePortfoliosCount: 8 }
  ];

  public getAllData(): K11DataPayload {
    return {
      retailers: this.retailers,
      summary: this.computeSummary(),
      territoryList: this.territoryList,
      availableAgents: this.availableAgents
    };
  }

  public getRetailerById(id: string): Retailer | undefined {
    return this.retailers.find(r => r.id === id);
  }

  public createRetailer(payload: Partial<Retailer>): Retailer {
    const nextNum = this.retailers.length + 1;
    const code = payload.code || `RET-${payload.provinceFa === 'تهران' ? 'TEH' : 'IR'}-0${nextNum > 9 ? nextNum : '0' + nextNum}`;
    const id = `ret-${Date.now()}`;

    const newRetailer: Retailer = {
      id,
      code,
      tradeNameFa: payload.tradeNameFa || 'گالری طلا و جواهر جدید',
      ownerFullNameFa: payload.ownerFullNameFa || 'نام صاحب گالری',
      nationalCode: payload.nationalCode || '۰۰۰۰۰۰۰۰۰۰',
      unionLicenseNumber: payload.unionLicenseNumber || '۱۴۰۳/جدید/۰۰۱',
      guildRegistryCode: payload.guildRegistryCode || `GLD-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      phoneNumber: payload.phoneNumber || '۰۲۱-۰۰۰۰۰۰۰۰',
      mobileNumber: payload.mobileNumber || '۰۹۱۲۰۰۰۰۰۰۰',
      provinceFa: payload.provinceFa || 'تهران',
      cityFa: payload.cityFa || 'تهران',
      postalAddressFa: payload.postalAddressFa || 'آدرس ثبت‌شده گالری',
      postalCode: payload.postalCode || '۱۱۱۱۱۱۱۱۱۱',
      establishmentYearFa: payload.establishmentYearFa || '۱۴۰۳',
      storeAreaSquareMeters: payload.storeAreaSquareMeters || 30,
      securityRatingFa: payload.securityRatingFa || 'گرید B (استاندارد بازرسی اماکن)',
      status: 'probationary',
      statusFa: 'دوره آزمایشی پذیرش (محدودیت سقف)',
      allowedBasket: payload.allowedBasket || {
        permittedCarats: ['18k_750'],
        permittedCategoriesFa: ['نیم‌ست سبک', 'النگو', 'انگشتر'],
        minOrderWeightGrams: 20,
        maxOrderWeightGrams: 500,
        bullionPurchaseAllowed: false,
        customWorkshopOrderAllowed: false,
        consignmentShowcaseAllowed: false,
        maxConsignmentWeightGrams: 0
      },
      commercialTerms: payload.commercialTerms || {
        tier: 'bronze',
        tierFa: 'برنزی (تسویه نقدی/آبشده فوری)',
        trustScore: 70,
        wageDiscountPercent: 0,
        creditLimitToman: 300000000,
        creditLimitGoldGrams: 40,
        currentUsedCreditToman: 0,
        currentUsedCreditGoldGrams: 0,
        paymentTenorDays: 0,
        allowScrapGoldBarter: true,
        allowPostDatedCheque: false,
        lastCreditReviewDateFa: '۱۴۰۳/۰۹/۱۰'
      },
      territory: payload.territory || {
        regionCode: 'TEH',
        regionTitleFa: 'تهران',
        marketDistrictFa: 'مرکز',
        assignedAgentId: 'agt-01',
        assignedAgentNameFa: 'مهندس حسام داوودی',
        scheduledVisitDayFa: 'شنبه‌ها نوبت صبح',
        isExclusiveZone: false
      },
      purchaseHistory: {
        lifetimeOrdersCount: 0,
        lifetimeGoldWeightGrams: 0,
        lifetimeTurnoverToman: 0,
        yearToDateGoldWeightGrams: 0,
        yearToDateTurnoverToman: 0,
        onTimeSettlementRatePercent: 100,
        averageDaysToSettle: 0,
        scrapGoldHandedOverGrams: 0,
        disputedOrdersCount: 0,
        lastOrderDateFa: '-',
        lastOrderNumber: '-'
      },
      activeExceptions: [],
      notesFa: payload.notesFa || 'گالری تازه ثبت‌شده در پلتفرم دیدار.',
      createdAtFa: '۱۴۰۳/۰۹/۱۰',
      updatedAtFa: '۱۴۰۳/۰۹/۱۰'
    };

    this.retailers.unshift(newRetailer);
    return newRetailer;
  }

  public updateTierAndTerms(
    id: string,
    tierUpdates: {
      tier: CommercialTier;
      trustScore: number;
      creditLimitToman: number;
      creditLimitGoldGrams: number;
      wageDiscountPercent: number;
      paymentTenorDays: 0 | 7 | 15 | 30 | 45 | 60;
      allowPostDatedCheque: boolean;
      allowScrapGoldBarter: boolean;
      guaranteeDocReference?: string;
      notesFa?: string;
    }
  ): Retailer {
    const retailer = this.getRetailerById(id);
    if (!retailer) throw new Error('خرده‌فروش مورد نظر یافت نشد.');

    const tierFaMap: Record<CommercialTier, string> = {
      diamond: 'الماس (سقف ویژه تجاری)',
      platinum: 'پلاتین (اعتبار طلای معین)',
      gold: 'طلایی (اعتبار متوازن)',
      silver: 'نقره‌ای (سقف موقت و نقدی)',
      bronze: 'برنزی (تسویه نقدی/آبشده فوری)'
    };

    retailer.commercialTerms = {
      ...retailer.commercialTerms,
      tier: tierUpdates.tier,
      tierFa: tierFaMap[tierUpdates.tier],
      trustScore: tierUpdates.trustScore,
      creditLimitToman: tierUpdates.creditLimitToman,
      creditLimitGoldGrams: tierUpdates.creditLimitGoldGrams,
      wageDiscountPercent: tierUpdates.wageDiscountPercent,
      paymentTenorDays: tierUpdates.paymentTenorDays,
      allowPostDatedCheque: tierUpdates.allowPostDatedCheque,
      allowScrapGoldBarter: tierUpdates.allowScrapGoldBarter,
      guaranteeDocReference: tierUpdates.guaranteeDocReference ?? retailer.commercialTerms.guaranteeDocReference,
      lastCreditReviewDateFa: '۱۴۰۳/۰۹/۱۰'
    };

    if (tierUpdates.notesFa) {
      retailer.notesFa = `${retailer.notesFa ? retailer.notesFa + ' | ' : ''}به‌روزرسانی رتبه به ${tierFaMap[tierUpdates.tier]}: ${tierUpdates.notesFa}`;
    }

    retailer.updatedAtFa = '۱۴۰۳/۰۹/۱۰';
    return retailer;
  }

  public updateTerritory(
    id: string,
    territoryUpdates: Partial<RetailerTerritory>
  ): Retailer {
    const retailer = this.getRetailerById(id);
    if (!retailer) throw new Error('خرده‌فروش مورد نظر یافت نشد.');

    retailer.territory = {
      ...retailer.territory,
      ...territoryUpdates
    };
    retailer.updatedAtFa = '۱۴۰۳/۰۹/۱۰';
    return retailer;
  }

  public updateBasketPolicy(
    id: string,
    basketUpdates: Partial<RetailerAllowedBasket>
  ): Retailer {
    const retailer = this.getRetailerById(id);
    if (!retailer) throw new Error('خرده‌فروش مورد نظر یافت نشد.');

    retailer.allowedBasket = {
      ...retailer.allowedBasket,
      ...basketUpdates
    };
    retailer.updatedAtFa = '۱۴۰۳/۰۹/۱۰';
    return retailer;
  }

  public changeStatus(
    id: string,
    status: RetailerLifecycleStatus,
    reasonFa: string
  ): Retailer {
    const retailer = this.getRetailerById(id);
    if (!retailer) throw new Error('خرده‌فروش مورد نظر یافت نشد.');

    const statusFaMap: Record<RetailerLifecycleStatus, string> = {
      active_trading: 'فعال تجاری و تسویه منظم',
      probationary: 'دوره آزمایشی پذیرش (محدودیت سقف)',
      under_review: 'تحت بازنگری دوره‌ای اعتباری',
      credit_suspended: 'تعلیق اعتباری به دلیل تأخیر در تسویه',
      inactive: 'غیرفعال موقت',
      blacklisted: 'مسدود دائم صنفی'
    };

    retailer.status = status;
    retailer.statusFa = statusFaMap[status];
    retailer.statusReasonFa = reasonFa;
    retailer.updatedAtFa = '۱۴۰۳/۰۹/۱۰';
    return retailer;
  }

  public addExceptionOverride(
    id: string,
    exception: {
      expiryDateFa: string;
      authorizedByFa: string;
      temporaryCreditBonusGoldGrams: number;
      temporaryCreditBonusToman: number;
      reasonFa: string;
    }
  ): Retailer {
    const retailer = this.getRetailerById(id);
    if (!retailer) throw new Error('خرده‌فروش مورد نظر یافت نشد.');

    const newException: CommercialExceptionOverride = {
      id: `exc-${Date.now()}`,
      appliedDateFa: '۱۴۰۳/۰۹/۱۰',
      expiryDateFa: exception.expiryDateFa,
      authorizedByFa: exception.authorizedByFa,
      temporaryCreditBonusGoldGrams: exception.temporaryCreditBonusGoldGrams,
      temporaryCreditBonusToman: exception.temporaryCreditBonusToman,
      reasonFa: exception.reasonFa,
      status: 'active'
    };

    retailer.activeExceptions.unshift(newException);
    retailer.updatedAtFa = '۱۴۰۳/۰۹/۱۰';
    return retailer;
  }

  private computeSummary(): K11SummaryMetrics {
    let totalActiveCreditLimitToman = 0;
    let totalUsedCreditToman = 0;
    let totalActiveGoldCreditGrams = 0;
    let totalUsedGoldCreditGrams = 0;
    let trustScoreSum = 0;
    let totalYtdTurnoverToman = 0;
    let totalYtdGoldPurchasedGrams = 0;

    const tierDistribution = {
      diamond: 0,
      platinum: 0,
      gold: 0,
      silver: 0,
      bronze: 0
    };

    let activeTradingCount = 0;
    let probationaryCount = 0;
    let creditSuspendedCount = 0;
    let underReviewCount = 0;

    for (const r of this.retailers) {
      if (r.status === 'active_trading') activeTradingCount++;
      else if (r.status === 'probationary') probationaryCount++;
      else if (r.status === 'credit_suspended') creditSuspendedCount++;
      else if (r.status === 'under_review') underReviewCount++;

      tierDistribution[r.commercialTerms.tier] = (tierDistribution[r.commercialTerms.tier] || 0) + 1;

      totalActiveCreditLimitToman += r.commercialTerms.creditLimitToman;
      totalUsedCreditToman += r.commercialTerms.currentUsedCreditToman;
      totalActiveGoldCreditGrams += r.commercialTerms.creditLimitGoldGrams;
      totalUsedGoldCreditGrams += r.commercialTerms.currentUsedCreditGoldGrams;
      trustScoreSum += r.commercialTerms.trustScore;

      totalYtdTurnoverToman += r.purchaseHistory.yearToDateTurnoverToman;
      totalYtdGoldPurchasedGrams += r.purchaseHistory.yearToDateGoldWeightGrams;
    }

    return {
      totalRetailersCount: this.retailers.length,
      activeTradingCount,
      probationaryCount,
      creditSuspendedCount,
      underReviewCount,
      totalActiveCreditLimitToman,
      totalUsedCreditToman,
      totalActiveGoldCreditGrams,
      totalUsedGoldCreditGrams,
      averageTrustScore: Math.round(trustScoreSum / (this.retailers.length || 1)),
      totalYtdTurnoverToman,
      totalYtdGoldPurchasedGrams,
      tierDistribution
    };
  }
}

export const k11Storage = new K11Storage();
