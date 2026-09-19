/**
 * Didar Gold Platform - Kernel Domain K12 Storage
 * Agents, Territories & Field Operations (عامل، قلمرو و عملیات میدانی)
 */

import {
  FieldAgent,
  Territory,
  TerritoryStore,
  FieldVisit,
  MobileShowcaseItem,
  ProxyOrderDraft,
  K12SummaryMetrics,
  K12DataPayload,
  AgentDutyStatus,
  VisitStatus
} from '../src/types/k12.js';

class K12Storage {
  private agents: FieldAgent[] = [
    {
      id: 'agt-01',
      partyId: 'party-admin-001',
      code: 'AGT-TEH-01',
      fullNameFa: 'مهندس حسام داوودی',
      role: 'buyer_rep',
      roleFa: 'مأمور خریدار و سفارش‌گیری',
      isActive: true,
      nationalCode: '۰۰۷۲۱۴۹۸۳۱',
      phoneNumber: '۰۲۱-۲۲۸۹۴۵۳۱',
      mobileNumber: '۰۹۱۲۳۴۵۶۷۸۹',
      emergencyContactFa: 'پدر - حاج علی داوودی',
      emergencyPhone: '۰۹۱۲۲۲۳۳۴۴۵',
      securityClearance: 'armed_escort',
      securityClearanceFa: 'اسکورت ویژه مسلح با گواهی عدم سوءپیشینه طلایی',
      guarantorBondAmountToman: 5000000000, // ۵ میلیارد تومان سفته و سند
      guarantorDocReference: 'سند ثبتی پلاک ۶۴۵/۱۲ تهران + ۲ فقره سفته بانکی',
      dutyStatus: 'on_route',
      dutyStatusFa: 'در مسیر راسته بازار',
      assignedTerritoryId: 'ter-01',
      assignedTerritoryNameFa: 'تهران - بازار بزرگ و سبزه میدان',
      assignedBagId: 'bag-01',
      assignedBagCode: 'BAG-SEC-101',
      assignedBagWeightGrams: 825.4,
      currentLat: 35.6745,
      currentLng: 51.4190,
      vehicleTypeFa: 'موتورسیکلت ویژه ضددیلم با ردیاب ماهواره‌ای آنلاین',
      vehiclePlateNumber: 'ایران ۱۱ - ۷۸۲ ج ۵۶',
      trustScore: 99,
      completedVisitsCount: 148,
      conversionRatePercent: 78,
      totalProxySalesGoldGrams: 3420.5,
      todayVisitsCount: 4,
      lastCheckInTimeFa: '۱۱:۴۵',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'agt-02',
      partyId: 'party-agent-002',
      code: 'AGT-TEH-02',
      fullNameFa: 'حمیدرضا رضایی',
      role: 'carrier_delivery',
      roleFa: 'مأمور حمل و تحویل فیزیکی طلا',
      isActive: true,
      nationalCode: '۰۰۸۳۴۵۲۱۱۹',
      phoneNumber: '۰۲۱-۸۸۴۵۹۰۲۱',
      mobileNumber: '۰۹۱۲۹۸۷۶۵۴۳',
      emergencyContactFa: 'برادر - محمدرضا رضایی',
      emergencyPhone: '۰۹۱۹۳۳۴۴۵۵۶',
      securityClearance: 'high_value',
      securityClearanceFa: 'افسر ارشد ترابری کیفی و شمش',
      guarantorBondAmountToman: 4000000000,
      guarantorDocReference: 'سند ملکی کرج + ضمانت صیادی بانکی',
      dutyStatus: 'checked_in',
      dutyStatusFa: 'حاضر در گالری طلافروشی مقصد',
      assignedTerritoryId: 'ter-02',
      assignedTerritoryNameFa: 'تهران - راسته کریمخان و ولیعصر',
      assignedBagId: 'bag-02',
      assignedBagCode: 'BAG-SEC-102',
      assignedBagWeightGrams: 640.8,
      currentLat: 35.7180,
      currentLng: 51.4120,
      vehicleTypeFa: 'خودروی اسکورت مجهز به قفل رمزدار بیومتریک',
      vehiclePlateNumber: 'ایران ۴۴ - ۹۱۲ ق ۳۳',
      trustScore: 96,
      completedVisitsCount: 112,
      conversionRatePercent: 72,
      totalProxySalesGoldGrams: 2850.0,
      todayVisitsCount: 3,
      lastCheckInTimeFa: '۱۰:۳۰'
    },
    {
      id: 'agt-03',
      code: 'AGT-ISF-01',
      fullNameFa: 'امیرحسین صدر',
      role: 'carrier_delivery',
      roleFa: 'مأمور حمل و تحویل فیزیکی طلا',
      isActive: true,
      nationalCode: '۱۲۸۹۴۵۳۱۲۰',
      phoneNumber: '۰۳۱-۳۲۲۱۴۵۶۷',
      mobileNumber: '۰۹۱۳۱۱۴۵۶۷۸',
      emergencyContactFa: 'همسر - خانم میردامادی',
      emergencyPhone: '۰۹۱۳۳۱۴۵۵۹۰',
      securityClearance: 'armed_escort',
      securityClearanceFa: 'اسکورت مسلح منطقه‌ای اصفهان',
      guarantorBondAmountToman: 4500000000,
      guarantorDocReference: 'ضمانت‌نامه بانکی شماره ۷۸۲۳ بانک ملی شعبه نقش‌جهان',
      dutyStatus: 'on_duty',
      dutyStatusFa: 'آماده‌باش در خزانه مرکزی اصفهان',
      assignedTerritoryId: 'ter-03',
      assignedTerritoryNameFa: 'اصفهان - بازار بزرگ و نقش جهان',
      assignedBagId: 'bag-03',
      assignedBagCode: 'BAG-SEC-103',
      assignedBagWeightGrams: 512.0,
      currentLat: 32.6575,
      currentLng: 51.6775,
      vehicleTypeFa: 'خودروی زره‌پوش سبک گشت میدانی',
      vehiclePlateNumber: 'ایران ۱۳ - ۴۴۵ ل ۲۱',
      trustScore: 98,
      completedVisitsCount: 95,
      conversionRatePercent: 81,
      totalProxySalesGoldGrams: 2150.2,
      todayVisitsCount: 2,
      lastCheckInTimeFa: '۰۹:۱۵'
    },
    {
      id: 'agt-04',
      code: 'AGT-MSH-01',
      fullNameFa: 'علیرضا تهرانی',
      role: 'buyer_rep',
      roleFa: 'مأمور خریدار و ویزیتور',
      isActive: true,
      nationalCode: '۰۹۴۱۱۲۳۳۴۵',
      phoneNumber: '۰۵۱-۳۸۴۵۶۷۸۹',
      mobileNumber: '۰۹۱۵۱۲۳۴۵۶۷',
      emergencyContactFa: 'پدر - مهندس جواد تهرانی',
      emergencyPhone: '۰۹۱۵۳۱۴۲۲۹۹',
      securityClearance: 'high_value',
      securityClearanceFa: 'کارشناس رسمی ارزیابی و ترابری طلا',
      guarantorBondAmountToman: 3500000000,
      guarantorDocReference: 'سند تک‌برگ ملک تجاری مشهد',
      dutyStatus: 'on_route',
      dutyStatusFa: 'در مسیر راسته خسروی نو',
      assignedTerritoryId: 'ter-04',
      assignedTerritoryNameFa: 'مشهد - راسته خسروی و بازار رضا',
      assignedBagId: 'bag-04',
      assignedBagCode: 'BAG-SEC-104',
      assignedBagWeightGrams: 730.2,
      currentLat: 36.2972,
      currentLng: 59.6067,
      vehicleTypeFa: 'موتورسیکلت مجهز به کیف هوشمند پلمپ‌دار',
      vehiclePlateNumber: 'ایران ۱۲ - ۹۹۲ ط ۱۸',
      trustScore: 94,
      completedVisitsCount: 88,
      conversionRatePercent: 69,
      totalProxySalesGoldGrams: 1940.0,
      todayVisitsCount: 3,
      lastCheckInTimeFa: '۱۱:۱۰'
    },
    {
      id: 'agt-05',
      code: 'AGT-TBZ-01',
      fullNameFa: 'بهنام فرامرزی',
      role: 'buyer_rep',
      roleFa: 'مأمور خریدار و ویزیتور',
      isActive: true,
      nationalCode: '۱۳۷۸۴۵۹۰۱۲',
      phoneNumber: '۰۴۱-۳۵۲۳۱۱۴۴',
      mobileNumber: '۰۹۱۴۱۱۵۶۷۸۹',
      emergencyContactFa: 'عمو - حاج یعقوب فرامرزی',
      emergencyPhone: '۰۹۱۴۳۱۴۵۵۶۶',
      securityClearance: 'standard',
      securityClearanceFa: 'نماینده مجاز ویزیت و ثبت سفارش',
      guarantorBondAmountToman: 3000000000,
      guarantorDocReference: 'چک تضمین ثبتی با امضای دو ضامن معتبر صنف طلا',
      dutyStatus: 'standby',
      dutyStatusFa: 'آماده‌باش در شعبه تبریز',
      assignedTerritoryId: 'ter-05',
      assignedTerritoryNameFa: 'تبریز - بازار امیر و تربیت',
      assignedBagId: 'bag-05',
      assignedBagCode: 'BAG-SEC-105',
      assignedBagWeightGrams: 385.0,
      currentLat: 38.0800,
      currentLng: 46.2919,
      vehicleTypeFa: 'خودروی سواری دارای گاوصندوق الکترونیک',
      vehiclePlateNumber: 'ایران ۱۵ - ۳۱۲ م ۷۷',
      trustScore: 92,
      completedVisitsCount: 64,
      conversionRatePercent: 74,
      totalProxySalesGoldGrams: 1420.8,
      todayVisitsCount: 1,
      lastCheckInTimeFa: '۰۸:۴۵'
    }
  ];

  private territories: Territory[] = [
    {
      id: 'ter-01',
      code: 'TER-TEH-BAZAR',
      titleFa: 'تهران - بازار بزرگ و سبزه میدان',
      provinceFa: 'تهران',
      cityFa: 'تهران',
      marketDistrictsFa: 'سرای حاج مهدی، پاساژ فروردین، تکیه دولت، راسته زرگرها',
      leadAgentId: 'agt-01',
      leadAgentNameFa: 'مهندس حسام داوودی',
      backupAgentId: 'agt-02',
      backupAgentNameFa: 'حمیدرضا رضایی',
      activeRetailersCount: 38,
      dailyVisitCapacity: 8,
      riskLevel: 'armored_escort',
      riskLevelFa: 'منطقه استراتژیک نیازمند اسکورت ویژه و مانیتورینگ آنلاین',
      monthlyGoldQuotaGrams: 6000,
      achievedMonthlyGoldGrams: 4850,
      geofenceRadiusMeters: 75,
      stores: [
        {
          id: 'ret-101',
          tradeNameFa: 'گالری طلا و جواهر زمرد (بازار بزرگ)',
          ownerFa: 'حاج محمود کمالی',
          unionCode: 'GLD-TEH-8812',
          addressFa: 'بازار بزرگ تهران، سرای حاج مهدی، طبقه همکف، پلاک ۱۴',
          phone: '۰۲۱-۵۵۶۲۳۴۹۰',
          tierFa: 'ویترین طلای لوکس و ریخته‌گری',
          lastVisitDateFa: '۱۴۰۳/۰۸/۲۵',
          lastVisitStatusFa: 'مراجعه شد (رفت)',
          lastInvoiceStatus: 'invoiced',
          totalInvoicedGoldGrams: 340.5
        },
        {
          id: 'ret-106',
          tradeNameFa: 'زرگری تابان سبزه میدان',
          ownerFa: 'حاج قاسم صفاری',
          unionCode: 'GLD-TEH-9011',
          addressFa: 'تهران، سبزه میدان، ابتدای راسته زرگرها، پلاک ۴۲',
          phone: '۰۲۱-۵۵۶۱۴۴۳۲',
          tierFa: 'بنکدار و فروشنده النگو',
          lastVisitDateFa: '۱۴۰۳/۰۸/۱۸',
          lastVisitStatusFa: 'مراجعه شد (رفت)',
          lastInvoiceStatus: 'invoiced',
          totalInvoicedGoldGrams: 520.0
        },
        {
          id: 'ret-107',
          tradeNameFa: 'جواهری شمس تکیه دولت',
          ownerFa: 'برادران شمس‌پور',
          unionCode: 'GLD-TEH-4560',
          addressFa: 'تهران، بازار بزرگ، پاساژ فروردین، همکف پلاک ۸',
          phone: '۰۲۱-۵۵۸۰۱۱۲۲',
          tierFa: 'سرویس‌های جواهر و سرویس عروس',
          lastVisitDateFa: '۱۴۰۳/۰۸/۱۰',
          lastVisitStatusFa: 'مراجعه شد (رفت)',
          lastInvoiceStatus: 'no_invoice',
          totalInvoicedGoldGrams: 0
        }
      ]
    },
    {
      id: 'ter-02',
      code: 'TER-TEH-CENTER',
      titleFa: 'تهران - راسته کریمخان و ولیعصر',
      provinceFa: 'تهران',
      cityFa: 'تهران',
      marketDistrictsFa: 'خیابان نجات‌الهی، میدان ولیعصر، راسته گالری‌های طلا و جواهر لوکس',
      leadAgentId: 'agt-02',
      leadAgentNameFa: 'حمیدرضا رضایی',
      backupAgentId: 'agt-01',
      backupAgentNameFa: 'مهندس حسام داوودی',
      activeRetailersCount: 26,
      dailyVisitCapacity: 6,
      riskLevel: 'high_density',
      riskLevelFa: 'پرتراکم و پرتردد تجاری با امنیت بالا',
      monthlyGoldQuotaGrams: 4500,
      achievedMonthlyGoldGrams: 3720,
      geofenceRadiusMeters: 80,
      stores: [
        {
          id: 'ret-102',
          tradeNameFa: 'جواهر سرای درخشان (کریمخان)',
          ownerFa: 'سید جواد حسینی',
          unionCode: 'GLD-TEH-5521',
          addressFa: 'خیابان کریمخان زند، نبش خیابان آبان جنوبی، پلاک ۱۸۲',
          phone: '۰۲۱-۸۸۹۲۱۴۰۰',
          tierFa: 'گالری طراحی سفارشی و مدرن',
          lastVisitDateFa: '۱۴۰۳/۰۸/۲۵',
          lastVisitStatusFa: 'مراجعه شد (رفت)',
          lastInvoiceStatus: 'no_invoice',
          totalInvoicedGoldGrams: 180.0
        },
        {
          id: 'ret-108',
          tradeNameFa: 'طلا و جواهر نگین ولیعصر',
          ownerFa: 'کامران شریفی',
          unionCode: 'GLD-TEH-7833',
          addressFa: 'تهران، میدان ولیعصر، جنب سینما استقلال، پلاک ۲۱',
          phone: '۰۲۱-۸۸۸۹۷۷۰۰',
          tierFa: 'سفارشات سازمانی و سکه/شمش',
          lastVisitDateFa: '۱۴۰۳/۰۸/۲۱',
          lastVisitStatusFa: 'مراجعه شد (رفت)',
          lastInvoiceStatus: 'invoiced',
          totalInvoicedGoldGrams: 260.0
        },
        {
          id: 'ret-109',
          tradeNameFa: 'گالری مدرن طلا نجات‌الهی',
          ownerFa: 'هادی فرهمند',
          unionCode: 'GLD-TEH-6652',
          addressFa: 'تهران، خیابان نجات‌الهی، پلاک ۹۵',
          phone: '۰۲۱-۸۸۹۰۵۵۴۴',
          tierFa: 'زیورآلات مینیمال سبک',
          lastInvoiceStatus: 'never_visited'
        }
      ]
    },
    {
      id: 'ter-03',
      code: 'TER-ISF-NAGHSH',
      titleFa: 'اصفهان - بازار بزرگ و نقش جهان',
      provinceFa: 'اصفهان',
      cityFa: 'اصفهان',
      marketDistrictsFa: 'بازار قیصریه، سرای چیت‌سازها، میدان نقش جهان و چهارباغ عباسی',
      leadAgentId: 'agt-03',
      leadAgentNameFa: 'امیرحسین صدر',
      activeRetailersCount: 29,
      dailyVisitCapacity: 6,
      riskLevel: 'armored_escort',
      riskLevelFa: 'مرکز سنتی طلای دست‌ساز با گردش وزنی بالا',
      monthlyGoldQuotaGrams: 4000,
      achievedMonthlyGoldGrams: 3150,
      geofenceRadiusMeters: 60,
      stores: [
        {
          id: 'ret-104',
          tradeNameFa: 'گالری عقیق نقش جهان (اصفهان)',
          ownerFa: 'مهندس محمدرضا شفیعی',
          unionCode: 'GLD-ISF-9901',
          addressFa: 'اصفهان، میدان امام، ابتدای بازار بزرگ زرگرها، پلاک ۵',
          phone: '۰۳۱-۳۲۲۱۸۸۰۰',
          tierFa: 'تولیدکننده النگوی دست‌ساز اصفهان',
          lastVisitDateFa: '۱۴۰۳/۰۸/۲۵',
          lastVisitStatusFa: 'در انتظار مراجعه',
          lastInvoiceStatus: 'never_visited'
        },
        {
          id: 'ret-110',
          tradeNameFa: 'زرگری قیصریه صفوی',
          ownerFa: 'حاج علی صفوی‌نژاد',
          unionCode: 'GLD-ISF-4122',
          addressFa: 'اصفهان، ورودی قیصریه، سرای چیت‌سازها، پلاک ۱۸',
          phone: '۰۳۱-۳۲۲۲۴۴۳۳',
          tierFa: 'زنجیرهای طلا و آبشده',
          lastVisitDateFa: '۱۴۰۳/۰۸/۱۵',
          lastVisitStatusFa: 'مراجعه شد (رفت)',
          lastInvoiceStatus: 'invoiced',
          totalInvoicedGoldGrams: 450.0
        }
      ]
    },
    {
      id: 'ter-04',
      code: 'TER-MSH-KHOSRAVI',
      titleFa: 'مشهد - راسته خسروی و بازار رضا',
      provinceFa: 'خراسان رضوی',
      cityFa: 'مشهد',
      marketDistrictsFa: 'خیابان خسروی نو، طبقه فوقانی بازار رضا، چهارراه شهدا',
      leadAgentId: 'agt-04',
      leadAgentNameFa: 'علیرضا تهرانی',
      activeRetailersCount: 24,
      dailyVisitCapacity: 5,
      riskLevel: 'high_density',
      riskLevelFa: 'حجم بالای گردش النگو و زیورآلات زائران',
      monthlyGoldQuotaGrams: 3500,
      achievedMonthlyGoldGrams: 2680,
      geofenceRadiusMeters: 90,
      stores: [
        {
          id: 'ret-103',
          tradeNameFa: 'طلا و جواهری پرسپولیس (بازار رضا مشهد)',
          ownerFa: 'حاج غلامرضا صادقی',
          unionCode: 'GLD-MSH-4410',
          addressFa: 'مشهد، حاشیه میدان بیت‌المقدس، ورودی بازار رضا، هشتی اول',
          phone: '۰۵۱-۳۳۶۴۱۱۲۰',
          tierFa: 'پرفروش‌ترین ویترین بازار رضا',
          lastVisitDateFa: '۱۴۰۳/۰۸/۲۵',
          lastVisitStatusFa: 'در مسیر مراجعه',
          lastInvoiceStatus: 'never_visited'
        },
        {
          id: 'ret-111',
          tradeNameFa: 'جواهری خاوران خسروی نو',
          ownerFa: 'مصطفی موحدی',
          unionCode: 'GLD-MSH-7720',
          addressFa: 'مشهد، خیابان خسروی نو، بین کوچه روشن و پاساژ طلا، پلاک ۳۳',
          phone: '۰۵۱-۳۲۲۵۹۹۸۸',
          tierFa: 'النگو و پلاک‌های مذهبی و نمادار',
          lastVisitDateFa: '۱۴۰۳/۰۸/۱۹',
          lastVisitStatusFa: 'مراجعه شد (رفت)',
          lastInvoiceStatus: 'invoiced',
          totalInvoicedGoldGrams: 310.0
        }
      ]
    },
    {
      id: 'ter-05',
      code: 'TER-TBZ-AMIR',
      titleFa: 'تبریز - بازار امیر و تربیت',
      provinceFa: 'آذربایجان شرقی',
      cityFa: 'تبریز',
      marketDistrictsFa: 'راسته بازار سرپوشیده طلافروشان، پاساژ امیر، خیابان تربیت',
      leadAgentId: 'agt-05',
      leadAgentNameFa: 'بهنام فرامرزی',
      activeRetailersCount: 19,
      dailyVisitCapacity: 5,
      riskLevel: 'standard',
      riskLevelFa: 'بازار منسجم با تمرکز بر زنجیرهای فیگارو و سرویس سنتی',
      monthlyGoldQuotaGrams: 3000,
      achievedMonthlyGoldGrams: 2200,
      geofenceRadiusMeters: 70,
      stores: [
        {
          id: 'ret-105',
          tradeNameFa: 'زرگری میرداماد تبریز (بازار امیر)',
          ownerFa: 'حاج کریم میرداماد',
          unionCode: 'GLD-TBZ-3321',
          addressFa: 'تبریز، بازار تاریخی تبریز، بازار امیر، سرای نو، پلاک ۱۱',
          phone: '۰۴۱-۳۵۲۳۷۷۰۰',
          tierFa: 'زنجیرهای طلا و دستبند تبریزی',
          lastVisitDateFa: '۱۴۰۳/۰۸/۲۵',
          lastVisitStatusFa: 'مراجعه نشد (نرفت)',
          lastInvoiceStatus: 'no_invoice'
        },
        {
          id: 'ret-112',
          tradeNameFa: 'گالری زرین تربیت تبریز',
          ownerFa: 'یعقوب آذری',
          unionCode: 'GLD-TBZ-5580',
          addressFa: 'تبریز، خیابان تربیت، پاساژ شمس، پلاک ۹',
          phone: '۰۴۱-۳۵۵۶۲۲۱۱',
          tierFa: 'سرویس‌های نمادار کارتیه',
          lastInvoiceStatus: 'never_visited'
        }
      ]
    }
  ];

  private visits: FieldVisit[] = [
    {
      id: 'vst-101',
      visitCode: 'VST-1403-881',
      retailerId: 'ret-101',
      retailerTradeNameFa: 'گالری طلا و جواهر زمرد (بازار بزرگ)',
      retailerOwnerFa: 'حاج محمود کمالی',
      retailerUnionCode: 'GLD-TEH-8812',
      retailerAddressFa: 'بازار بزرگ تهران، سرای حاج مهدی، طبقه همکف، پلاک ۱۴',
      retailerPhone: '۰۲۱-۵۵۶۲۳۴۹۰',
      retailerLat: 35.6742,
      retailerLng: 51.4192,
      agentId: 'agt-01',
      agentNameFa: 'مهندس حسام داوودی',
      territoryId: 'ter-01',
      territoryNameFa: 'تهران - بازار بزرگ و سبزه میدان',
      scheduledDateFa: '۱۴۰۳/۰۸/۲۵',
      scheduledTimeSlotFa: '۱۰:۰۰ الی ۱۱:۳۰',
      purpose: 'collection_showcase',
      purposeFa: 'معرفی کالکشن پاییزه النگوهای نمادار و ثبت تقاضا',
      status: 'completed',
      statusFa: 'مراجعه انجام شد + فاکتور طلا صادر گردید',
      attendanceStatus: 'visited',
      attendanceStatusFa: 'مراجعه حضوری انجام شد (رفت)',
      invoiceStatus: 'invoiced',
      invoiceStatusFa: 'فاکتور صادر شد (موفق)',
      invoiceNumber: 'INV-1403-9901',
      invoiceGoldGrams: 340.5,
      checkInTimeFa: '۱۰:۰۵',
      checkOutTimeFa: '۱۱:۲۰',
      isGeofenceVerified: true,
      distanceMetersFromStore: 8,
      retailerFeedbackScore: 5,
      retailerNotesFa: 'استقبال عالی از مدل‌های کارتیه ریخته‌گری بدون اجرت بالا. تقاضای سفارش عمده.',
      agentOutcomeNotesFa: 'نمونه‌ها به رؤیت حاج آقا کمالی رسید. سفارش و فاکتور نیابتی به وزن ۳۴۰ گرم با موفقیت ثبت گردید.',
      proxyOrderId: 'ord-px-501',
      proxyOrderGoldGrams: 340.5,
      showcaseInterestLevel: 'very_high',
      carriedBagSealIntact: true
    },
    {
      id: 'vst-102',
      visitCode: 'VST-1403-882',
      retailerId: 'ret-102',
      retailerTradeNameFa: 'جواهر سرای درخشان (کریمخان)',
      retailerOwnerFa: 'سید جواد حسینی',
      retailerUnionCode: 'GLD-TEH-5521',
      retailerAddressFa: 'خیابان کریمخان زند، نبش خیابان آبان جنوبی، پلاک ۱۸۲',
      retailerPhone: '۰۲۱-۸۸۹۲۱۴۰۰',
      retailerLat: 35.7178,
      retailerLng: 51.4124,
      agentId: 'agt-02',
      agentNameFa: 'حمیدرضا رضایی',
      territoryId: 'ter-02',
      territoryNameFa: 'تهران - راسته کریمخان و ولیعصر',
      scheduledDateFa: '۱۴۰۳/۰۸/۲۵',
      scheduledTimeSlotFa: '۱۱:۳۰ الی ۱۳:۰۰',
      purpose: 'proxy_order',
      purposeFa: 'اقدام به نیابت و ثبت سفارش تحویل فوری شب یلدا',
      status: 'checked_in',
      statusFa: 'حاضر در گالری (در حال گفتگو و توزین)',
      attendanceStatus: 'visited',
      attendanceStatusFa: 'حاضر در محل گالری',
      invoiceStatus: 'pending',
      invoiceStatusFa: 'در جریان مذاکره فاکتور',
      checkInTimeFa: '۱۱:۳۵',
      isGeofenceVerified: true,
      distanceMetersFromStore: 12,
      retailerNotesFa: 'مشتری در حال مقایسه اجرت النگوی نمادار با نمونه‌های بازار است.',
      carriedBagSealIntact: true
    },
    {
      id: 'vst-103',
      visitCode: 'VST-1403-883',
      retailerId: 'ret-103',
      retailerTradeNameFa: 'طلا و جواهری پرسپولیس (بازار رضا مشهد)',
      retailerOwnerFa: 'حاج غلامرضا صادقی',
      retailerUnionCode: 'GLD-MSH-4410',
      retailerAddressFa: 'مشهد، حاشیه میدان بیت‌المقدس، ورودی بازار رضا، هشتی اول',
      retailerPhone: '۰۵۱-۳۳۶۴۱۱۲۰',
      retailerLat: 36.2970,
      retailerLng: 59.6065,
      agentId: 'agt-04',
      agentNameFa: 'علیرضا تهرانی',
      territoryId: 'ter-04',
      territoryNameFa: 'مشهد - راسته خسروی و بازار رضا',
      scheduledDateFa: '۱۴۰۳/۰۸/۲۵',
      scheduledTimeSlotFa: '۱۲:۰۰ الی ۱۳:۳۰',
      purpose: 'consignment_audit',
      purposeFa: 'ممیزی فیزیکی و تطبیق سریال‌های طلای امانی ویترین',
      status: 'in_transit',
      statusFa: 'عامل در مسیر مراجعه به فروشگاه',
      attendanceStatus: 'pending',
      attendanceStatusFa: 'در مسیر حرکت (هنوز نرسیده)',
      invoiceStatus: 'pending',
      invoiceStatusFa: 'در انتظار رسیدن مأمور',
      isGeofenceVerified: false,
      carriedBagSealIntact: true
    },
    {
      id: 'vst-104',
      visitCode: 'VST-1403-884',
      retailerId: 'ret-107',
      retailerTradeNameFa: 'جواهری شمس تکیه دولت',
      retailerOwnerFa: 'برادران شمس‌پور',
      retailerUnionCode: 'GLD-TEH-4560',
      retailerAddressFa: 'تهران، بازار بزرگ، پاساژ فروردین، همکف پلاک ۸',
      retailerPhone: '۰۲۱-۵۵۸۰۱۱۲۲',
      retailerLat: 35.6740,
      retailerLng: 51.4190,
      agentId: 'agt-01',
      agentNameFa: 'مهندس حسام داوودی',
      territoryId: 'ter-01',
      territoryNameFa: 'تهران - بازار بزرگ و سبزه میدان',
      scheduledDateFa: '۱۴۰۳/۰۸/۲۴',
      scheduledTimeSlotFa: '۱۴:۳۰ الی ۱۶:۰۰',
      purpose: 'relationship_management',
      purposeFa: 'مذاکره کالکشن النگو و بررسی سفارش طلا',
      status: 'completed',
      statusFa: 'مراجعه انجام شد اما فاکتور صادر نشد',
      attendanceStatus: 'visited',
      attendanceStatusFa: 'مراجعه حضوری انجام شد (رفت)',
      invoiceStatus: 'no_invoice',
      invoiceStatusFa: 'بدون فاکتور (اختلاف قیمت و اجرت ساخت)',
      noInvoiceReasonFa: 'مشتری اجرت ساخت النگوهای ریخته‌گری را بالاتر از کشش بازار دانست و تقاضای تخفیف ۵ درصدی داشت که با سیاست سامانه همخوان نبود.',
      checkInTimeFa: '۱۴:۳۵',
      checkOutTimeFa: '۱۵:۴۰',
      isGeofenceVerified: true,
      distanceMetersFromStore: 5,
      retailerFeedbackScore: 3,
      retailerNotesFa: 'مدل‌ها پسندیده شد ولی سر اجرت توافق نهایی حاصل نشد.',
      carriedBagSealIntact: true
    },
    {
      id: 'vst-105',
      visitCode: 'VST-1403-885',
      retailerId: 'ret-105',
      retailerTradeNameFa: 'زرگری میرداماد تبریز (بازار امیر)',
      retailerOwnerFa: 'حاج کریم میرداماد',
      retailerUnionCode: 'GLD-TBZ-3321',
      retailerAddressFa: 'تبریز، بازار تاریخی تبریز، بازار امیر، سرای نو، پلاک ۱۱',
      retailerPhone: '۰۴۱-۳۵۲۳۷۷۰۰',
      retailerLat: 38.0798,
      retailerLng: 46.2922,
      agentId: 'agt-05',
      agentNameFa: 'بهنام فرامرزی',
      territoryId: 'ter-05',
      territoryNameFa: 'تبریز - بازار امیر و تربیت',
      scheduledDateFa: '۱۴۰۳/۰۸/۲۳',
      scheduledTimeSlotFa: '۱۶:۰۰ الی ۱۷:۳۰',
      purpose: 'catalog_drop',
      purposeFa: 'تحویل کتابچه راهنمای عیارسنجی و کاتالوگ مدل‌ها',
      status: 'missed',
      statusFa: 'عدم مراجعه مأمور (نرفت - گالری بسته بود)',
      attendanceStatus: 'not_visited',
      attendanceStatusFa: 'مراجعه نشد (نرفت)',
      notVisitedReasonFa: 'هنگام حضور مأمور در راسته بازار امیر، کرکره گالری پایین بود و طبق اعلام همسایگان، صاحب پروانه به سفر کاری رفته بود.',
      invoiceStatus: 'not_applicable',
      invoiceStatusFa: 'فاقد فاکتور (به دلیل عدم انجام ویزیت)',
      isGeofenceVerified: false,
      carriedBagSealIntact: true
    }
  ];

  private showcaseItems: MobileShowcaseItem[] = [
    {
      id: 'shw-01',
      skuCode: 'SKU-RNG-CRT-18K',
      titleFa: 'انگشتر تک‌نگین البرنادو ریخته‌گری',
      categoryFa: 'انگشتر و حلقه',
      caratFa: '۱۸ عیار (۷۵۰)',
      sampleWeightGrams: 4.85,
      wagePerGramToman: 185000,
      isCarriedInBag: true,
      highDemandBadge: true,
      notesFa: 'طراحی جدید بدون کسر نگین، قابلیت تغییر سایز فوری در مغازه'
    },
    {
      id: 'shw-02',
      skuCode: 'SKU-BNG-MINIMAL-750',
      titleFa: 'النگوی دامله نمادار ارتعاشی',
      categoryFa: 'النگو و دستبند',
      caratFa: '۱۸ عیار (۷۵۰)',
      sampleWeightGrams: 14.20,
      wagePerGramToman: 145000,
      isCarriedInBag: true,
      highDemandBadge: true,
      notesFa: 'استحکام بسیار بالا، فوق‌العاده پرفروش در بازارهای سنتی'
    },
    {
      id: 'shw-03',
      skuCode: 'SKU-CHN-FIGARO-04',
      titleFa: 'زنجیر فیگارو تراش‌خورده ایتالیایی ۴ میلی‌متر',
      categoryFa: 'زنجیر و گردنبند',
      caratFa: '۱۸ عیار (۷۵۰)',
      sampleWeightGrams: 18.50,
      wagePerGramToman: 165000,
      isCarriedInBag: true,
      highDemandBadge: false,
      notesFa: 'مقاوم در برابر تاب‌خوردگی، قفل مدور سنگین'
    },
    {
      id: 'shw-04',
      skuCode: 'SKU-SET-ROYAL-BRIDAL',
      titleFa: 'نیم‌ست گل مروارید اسلیمی با تراش لیزری',
      categoryFa: 'سرویس و نیم‌ست',
      caratFa: '۱۸ عیار (۷۵۰)',
      sampleWeightGrams: 28.40,
      wagePerGramToman: 220000,
      isCarriedInBag: true,
      highDemandBadge: true,
      notesFa: 'کالکشن ویژه نامزدی و عقد با بسته‌بندی هاردباکس لوکس'
    },
    {
      id: 'shw-05',
      skuCode: 'SKU-BAR-MINT-24K',
      titleFa: 'شمش سرمایه‌گذاری استاندارد دیدار ۱۰ گرمی',
      categoryFa: 'شمش و سکه',
      caratFa: '۲۴ عیار (۹۹۵)',
      sampleWeightGrams: 10.00,
      wagePerGramToman: 75000,
      isCarriedInBag: true,
      highDemandBadge: true,
      notesFa: 'پلمپ امنیتی هولوگرام‌دار با هک کد ماتریس هوشمند'
    }
  ];

  public getAllData(): K12DataPayload {
    const onDuty = this.agents.filter(a => a.dutyStatus === 'on_duty' || a.dutyStatus === 'checked_in').length;
    const onRoute = this.agents.filter(a => a.dutyStatus === 'on_route').length;
    const todayCompleted = this.visits.filter(v => v.status === 'completed').length;
    const todayProxyOrders = this.visits.filter(v => v.proxyOrderId).length;
    const proxyWeight = this.visits.reduce((sum, v) => sum + (v.proxyOrderGoldGrams || 0), 0);

    const summary: K12SummaryMetrics = {
      totalAgentsCount: this.agents.length,
      onDutyAgentsCount: onDuty,
      onRouteAgentsCount: onRoute,
      totalTerritoriesCount: this.territories.length,
      todayScheduledVisits: this.visits.length,
      todayCompletedVisits: todayCompleted,
      todayProxyOrdersCount: todayProxyOrders,
      todayProxyGoldWeightGrams: Number(proxyWeight.toFixed(2)),
      territoryCoveragePercent: 94,
      geofenceComplianceRatePercent: 98
    };

    return {
      summary,
      agents: [...this.agents],
      territories: [...this.territories],
      visits: [...this.visits],
      showcaseItems: [...this.showcaseItems]
    };
  }

  public getAgentById(id: string): FieldAgent | undefined {
    return this.agents.find(a => a.id === id);
  }

  public createAgent(payload: Partial<FieldAgent>): FieldAgent {
    const role = payload.role || 'buyer_rep';
    const roleFa = role === 'buyer_rep'
      ? 'مأمور خریدار و ویزیتور طلا'
      : 'مأمور حمل و تحویل فیزیکی طلا (کالارسان)';

    const newAgent: FieldAgent = {
      id: `agt-${Date.now().toString().slice(-4)}`,
      partyId: payload.partyId,
      code: `AGT-${(payload.assignedTerritoryNameFa?.includes('تهران') ? 'TEH' : 'IRN')}-${(this.agents.length + 1).toString().padStart(2, '0')}`,
      fullNameFa: payload.fullNameFa || 'مأمور میدانی جدید',
      role,
      roleFa: payload.roleFa || roleFa,
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      nationalCode: payload.nationalCode || '۰۰۰۰۰۰۰۰۰۰',
      phoneNumber: payload.phoneNumber || '۰۲۱-۰۰۰۰۰۰۰۰',
      mobileNumber: payload.mobileNumber || '۰۹۱۲۰۰۰۰۰۰۰',
      emergencyContactFa: payload.emergencyContactFa || 'تماس ضروری ثبت نشده',
      emergencyPhone: payload.emergencyPhone || '۰۹۱۲۰۰۰۰۰۰۰',
      securityClearance: payload.securityClearance || 'standard',
      securityClearanceFa: payload.securityClearanceFa || 'نماینده میدانی ویزیت',
      guarantorBondAmountToman: payload.guarantorBondAmountToman || 3000000000,
      guarantorDocReference: payload.guarantorDocReference || 'سفته تضمین حسن انجام کار',
      dutyStatus: payload.dutyStatus || 'standby',
      dutyStatusFa: payload.dutyStatusFa || 'آماده‌باش',
      assignedTerritoryId: payload.assignedTerritoryId || 'ter-01',
      assignedTerritoryNameFa: payload.assignedTerritoryNameFa || 'تهران - بازار بزرگ',
      assignedBagId: payload.assignedBagId,
      assignedBagCode: payload.assignedBagCode,
      assignedBagWeightGrams: payload.assignedBagWeightGrams || 0,
      vehicleTypeFa: payload.vehicleTypeFa || 'موتورسیکلت با باکس ضدسرقت',
      vehiclePlateNumber: payload.vehiclePlateNumber || 'ایران ۱۱ - ثبت نشده',
      trustScore: 90,
      completedVisitsCount: 0,
      conversionRatePercent: 0,
      totalProxySalesGoldGrams: 0,
      todayVisitsCount: 0
    };

    this.agents.unshift(newAgent);
    return newAgent;
  }

  public toggleAgentActive(id: string, isActive?: boolean): FieldAgent {
    const agent = this.agents.find(a => a.id === id);
    if (!agent) throw new Error('مأمور مورد نظر یافت نشد.');

    agent.isActive = isActive !== undefined ? isActive : !agent.isActive;
    if (!agent.isActive) {
      agent.dutyStatus = 'off_duty';
      agent.dutyStatusFa = 'غیرفعال / پایان شیفت';
    }
    return agent;
  }

  public updateAgentStatus(id: string, dutyStatus: AgentDutyStatus): FieldAgent {
    const agent = this.agents.find(a => a.id === id);
    if (!agent) throw new Error('مأمور مورد نظر یافت نشد.');

    agent.dutyStatus = dutyStatus;
    switch (dutyStatus) {
      case 'on_duty':
        agent.dutyStatusFa = 'در حال شیفت عملیاتی و آماده اعزام';
        break;
      case 'on_route':
        agent.dutyStatusFa = 'در حال تردد در مسیر مأموریت';
        break;
      case 'checked_in':
        agent.dutyStatusFa = 'حاضر در محل گالری طلافروشی خرده‌فروش';
        break;
      case 'standby':
        agent.dutyStatusFa = 'آماده‌باش در شعبه یا خزانه';
        break;
      case 'off_duty':
        agent.dutyStatusFa = 'پایان شیفت کاری';
        break;
    }

    return agent;
  }

  public assignAgentTerritory(agentId: string, territoryId: string): FieldAgent {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) throw new Error('مأمور مورد نظر یافت نشد.');

    const territory = this.territories.find(t => t.id === territoryId);
    if (!territory) throw new Error('قلمرو مورد نظر یافت نشد.');

    agent.assignedTerritoryId = territory.id;
    agent.assignedTerritoryNameFa = territory.titleFa;
    return agent;
  }

  public assignBagToAgent(agentId: string, bagId: string, bagCode: string, weightGrams: number): FieldAgent {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) throw new Error('مأمور مورد نظر یافت نشد.');

    agent.assignedBagId = bagId;
    agent.assignedBagCode = bagCode;
    agent.assignedBagWeightGrams = weightGrams;
    return agent;
  }

  public createTerritory(payload: Partial<Territory>): Territory {
    const newTerritory: Territory = {
      id: `ter-${Date.now().toString().slice(-4)}`,
      code: `TER-${payload.provinceFa ? 'REG' : 'GEN'}-${(this.territories.length + 1).toString().padStart(2, '0')}`,
      titleFa: payload.titleFa || 'قلمرو تجاری جدید',
      provinceFa: payload.provinceFa || 'تهران',
      cityFa: payload.cityFa || 'تهران',
      marketDistrictsFa: payload.marketDistrictsFa || 'راسته طلافروشان',
      leadAgentId: payload.leadAgentId || this.agents[0]?.id || 'agt-01',
      leadAgentNameFa: payload.leadAgentNameFa || this.agents[0]?.fullNameFa || 'مهندس حسام داوودی',
      backupAgentId: payload.backupAgentId,
      backupAgentNameFa: payload.backupAgentNameFa,
      activeRetailersCount: payload.activeRetailersCount || 10,
      dailyVisitCapacity: payload.dailyVisitCapacity || 6,
      riskLevel: payload.riskLevel || 'standard',
      riskLevelFa: payload.riskLevelFa || 'منطقه استاندارد تجاری',
      monthlyGoldQuotaGrams: payload.monthlyGoldQuotaGrams || 3000,
      achievedMonthlyGoldGrams: 0,
      geofenceRadiusMeters: payload.geofenceRadiusMeters || 75
    };

    this.territories.push(newTerritory);
    return newTerritory;
  }

  public scheduleVisit(payload: Partial<FieldVisit>): FieldVisit {
    const newVisit: FieldVisit = {
      id: `vst-${Date.now().toString().slice(-4)}`,
      visitCode: `VST-1403-${(880 + this.visits.length + 1).toString()}`,
      retailerId: payload.retailerId || 'ret-101',
      retailerTradeNameFa: payload.retailerTradeNameFa || 'گالری طلافروشی',
      retailerOwnerFa: payload.retailerOwnerFa || 'صاحب جواز',
      retailerUnionCode: payload.retailerUnionCode || 'GLD-GEN',
      retailerAddressFa: payload.retailerAddressFa || 'آدرس بازار طلا',
      retailerPhone: payload.retailerPhone || '۰۲۱-۵۵۰۰۰۰۰۰',
      retailerLat: payload.retailerLat || 35.6745,
      retailerLng: payload.retailerLng || 51.4190,
      agentId: payload.agentId || 'agt-01',
      agentNameFa: payload.agentNameFa || 'مهندس حسام داوودی',
      territoryId: payload.territoryId || 'ter-01',
      territoryNameFa: payload.territoryNameFa || 'تهران - بازار بزرگ',
      scheduledDateFa: payload.scheduledDateFa || '۱۴۰۳/۰۸/۲۵',
      scheduledTimeSlotFa: payload.scheduledTimeSlotFa || '۱۰:۰۰ الی ۱۱:۳۰',
      purpose: payload.purpose || 'collection_showcase',
      purposeFa: payload.purposeFa || 'معرفی کالکشن جدید و مشاوره سبد',
      status: 'scheduled',
      statusFa: 'برنامه‌ریزی‌شده در تقویم ویزیت',
      isGeofenceVerified: false,
      carriedBagSealIntact: true
    };

    this.visits.unshift(newVisit);

    // Increment agent visits count
    const agent = this.agents.find(a => a.id === newVisit.agentId);
    if (agent) {
      agent.todayVisitsCount += 1;
    }

    return newVisit;
  }

  public checkInVisit(visitId: string, lat: number, lng: number, distanceMeters: number): FieldVisit {
    const visit = this.visits.find(v => v.id === visitId);
    if (!visit) throw new Error('مأموریت ویزیت مورد نظر یافت نشد.');

    visit.status = 'checked_in';
    visit.statusFa = 'ثبت حضور در گالری (تأیید ژئوفنسینگ)';
    visit.checkInTimeFa = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    visit.isGeofenceVerified = distanceMeters <= 100;
    visit.distanceMetersFromStore = distanceMeters;

    // Update agent status to checked_in
    const agent = this.agents.find(a => a.id === visit.agentId);
    if (agent) {
      agent.dutyStatus = 'checked_in';
      agent.dutyStatusFa = `حاضر در ${visit.retailerTradeNameFa}`;
      agent.lastCheckInTimeFa = visit.checkInTimeFa;
    }

    return visit;
  }

  public completeVisit(
    visitId: string,
    outcome: {
      retailerFeedbackScore: number;
      retailerNotesFa: string;
      agentOutcomeNotesFa: string;
      showcaseInterestLevel: 'very_high' | 'high' | 'neutral' | 'low';
      carriedBagSealIntact: boolean;
    }
  ): FieldVisit {
    const visit = this.visits.find(v => v.id === visitId);
    if (!visit) throw new Error('مأموریت ویزیت مورد نظر یافت نشد.');

    visit.status = 'completed';
    visit.statusFa = 'ویزیت پایان‌یافته و صورتجلسه ثبت شد';
    visit.checkOutTimeFa = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    visit.retailerFeedbackScore = outcome.retailerFeedbackScore;
    visit.retailerNotesFa = outcome.retailerNotesFa;
    visit.agentOutcomeNotesFa = outcome.agentOutcomeNotesFa;
    visit.showcaseInterestLevel = outcome.showcaseInterestLevel;
    visit.carriedBagSealIntact = outcome.carriedBagSealIntact;

    // Update agent completed count & status to on_duty
    const agent = this.agents.find(a => a.id === visit.agentId);
    if (agent) {
      agent.completedVisitsCount += 1;
      agent.dutyStatus = 'on_duty';
      agent.dutyStatusFa = 'آماده اعزام به مقصد بعدی';
    }

    return visit;
  }

  public submitProxyOrder(draft: ProxyOrderDraft): { success: boolean; proxyOrderId: string; orderDraft: ProxyOrderDraft } {
    if (!draft.isOtpVerified) {
      throw new Error('کد تایید OTP پیامکی ارسال‌شده به شماره همراه صاحب جواز الزامی است.');
    }

    const proxyOrderId = `ord-px-${Date.now().toString().slice(-4)}`;
    draft.id = proxyOrderId;
    draft.orderTimestampFa = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());

    // If linked to visit, update visit
    if (draft.visitId) {
      const visit = this.visits.find(v => v.id === draft.visitId);
      if (visit) {
        visit.proxyOrderId = proxyOrderId;
        visit.proxyOrderGoldGrams = draft.totalWeightGrams;
      }
    }

    // Update agent stats
    const agent = this.agents.find(a => a.id === draft.agentId);
    if (agent) {
      agent.totalProxySalesGoldGrams = Number((agent.totalProxySalesGoldGrams + draft.totalWeightGrams).toFixed(2));
    }

    return {
      success: true,
      proxyOrderId,
      orderDraft: draft
    };
  }

  public addStoreToTerritory(territoryId: string, storeData: Partial<TerritoryStore>): TerritoryStore {
    const territory = this.territories.find(t => t.id === territoryId);
    if (!territory) throw new Error('قلمرو مورد نظر یافت نشد.');

    if (!territory.stores) {
      territory.stores = [];
    }

    const newStore: TerritoryStore = {
      id: `ret-${Date.now().toString().slice(-4)}`,
      tradeNameFa: storeData.tradeNameFa || 'گالری طلافروشی',
      ownerFa: storeData.ownerFa || 'صاحب پروانه',
      unionCode: storeData.unionCode || `GLD-${Date.now().toString().slice(-4)}`,
      addressFa: storeData.addressFa || territory.marketDistrictsFa,
      phone: storeData.phone || '۰۲۱-۵۵۰۰۰۰۰۰',
      tierFa: storeData.tierFa || 'طلافروشی خرده‌فروش',
      lat: storeData.lat,
      lng: storeData.lng,
      lastInvoiceStatus: 'never_visited'
    };

    territory.stores.unshift(newStore);
    territory.activeRetailersCount = territory.stores.length;
    return newStore;
  }

  public recordVisitOutcome(
    visitId: string,
    outcome: {
      attendance: 'visited' | 'not_visited';
      invoiceStatus: 'invoiced' | 'no_invoice';
      invoiceNumber?: string;
      invoiceGoldGrams?: number;
      noInvoiceReasonFa?: string;
      notVisitedReasonFa?: string;
      agentNotesFa?: string;
    }
  ): FieldVisit {
    const visit = this.visits.find(v => v.id === visitId);
    if (!visit) throw new Error('مأموریت ویزیت مورد نظر یافت نشد.');

    visit.attendanceStatus = outcome.attendance;
    if (outcome.attendance === 'visited') {
      visit.attendanceStatusFa = 'مراجعه حضوری انجام شد (رفت)';
      visit.status = 'completed';
      visit.checkInTimeFa = visit.checkInTimeFa || new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
      visit.checkOutTimeFa = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
      visit.invoiceStatus = outcome.invoiceStatus;

      if (outcome.invoiceStatus === 'invoiced') {
        visit.invoiceStatusFa = 'فاکتور صادر شد (موفق)';
        visit.invoiceNumber = outcome.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`;
        visit.invoiceGoldGrams = Number(outcome.invoiceGoldGrams) || 0;
        visit.proxyOrderGoldGrams = visit.invoiceGoldGrams;
        visit.statusFa = `مراجعه انجام شد + فاکتور ${visit.invoiceNumber} ثبت گردید`;

        // update agent proxy sales gold grams
        const agent = this.agents.find(a => a.id === visit.agentId);
        if (agent) {
          agent.totalProxySalesGoldGrams = Number((agent.totalProxySalesGoldGrams + (visit.invoiceGoldGrams || 0)).toFixed(2));
          agent.completedVisitsCount += 1;

          // Re-calculate agent conversion rate dynamically
          const agentVisits = this.visits.filter(v => v.agentId === agent.id);
          const invoicedVisits = agentVisits.filter(v => v.invoiceStatus === 'invoiced').length;
          const totalRecordedVisits = agentVisits.filter(v => v.attendanceStatus === 'visited' || v.attendanceStatus === 'not_visited').length;
          if (totalRecordedVisits > 0) {
            agent.conversionRatePercent = Math.round((invoicedVisits / totalRecordedVisits) * 100);
          }
        }

        // update territory achieved monthly gold grams
        const territory = this.territories.find(t => t.id === visit.territoryId);
        if (territory) {
          territory.achievedMonthlyGoldGrams += (visit.invoiceGoldGrams || 0);
          const store = territory.stores?.find(s => s.id === visit.retailerId);
          if (store) {
            store.lastVisitDateFa = new Intl.DateTimeFormat('fa-IR').format(new Date());
            store.lastVisitStatusFa = 'مراجعه شد (رفت)';
            store.lastInvoiceStatus = 'invoiced';
            store.totalInvoicedGoldGrams = (store.totalInvoicedGoldGrams || 0) + (visit.invoiceGoldGrams || 0);
          }
        }
      } else {
        visit.invoiceStatusFa = 'بدون فاکتور';
        visit.noInvoiceReasonFa = outcome.noInvoiceReasonFa || 'عدم توافق در این نوبت';
        visit.statusFa = 'مراجعه انجام شد (بدون صدور فاکتور)';

        const agent = this.agents.find(a => a.id === visit.agentId);
        if (agent) {
          agent.completedVisitsCount += 1;

          // Re-calculate agent conversion rate dynamically
          const agentVisits = this.visits.filter(v => v.agentId === agent.id);
          const invoicedVisits = agentVisits.filter(v => v.invoiceStatus === 'invoiced').length;
          const totalRecordedVisits = agentVisits.filter(v => v.attendanceStatus === 'visited' || v.attendanceStatus === 'not_visited').length;
          if (totalRecordedVisits > 0) {
            agent.conversionRatePercent = Math.round((invoicedVisits / totalRecordedVisits) * 100);
          }
        }

        const territory = this.territories.find(t => t.id === visit.territoryId);
        if (territory) {
          const store = territory.stores?.find(s => s.id === visit.retailerId);
          if (store) {
            store.lastVisitDateFa = new Intl.DateTimeFormat('fa-IR').format(new Date());
            store.lastVisitStatusFa = 'مراجعه شد (رفت)';
            store.lastInvoiceStatus = 'no_invoice';
          }
        }
      }
    } else {
      visit.attendanceStatusFa = 'مراجعه نشد (نرفت)';
      visit.status = 'missed';
      visit.statusFa = 'عدم مراجعه مأمور به فروشگاه';
      visit.notVisitedReasonFa = outcome.notVisitedReasonFa || 'عدم حضور مأمور یا تعطیلی فروشگاه';
      visit.invoiceStatus = 'not_applicable';
      visit.invoiceStatusFa = 'بدون فاکتور (عدم مراجعه)';

      const territory = this.territories.find(t => t.id === visit.territoryId);
      if (territory) {
        const store = territory.stores?.find(s => s.id === visit.retailerId);
        if (store) {
          store.lastVisitDateFa = new Intl.DateTimeFormat('fa-IR').format(new Date());
          store.lastVisitStatusFa = 'مراجعه نشد (نرفت)';
          store.lastInvoiceStatus = 'no_invoice';
        }
      }
    }

    if (outcome.agentNotesFa) {
      visit.agentOutcomeNotesFa = outcome.agentNotesFa;
    }

    return visit;
  }
}

export const k12Storage = new K12Storage();
