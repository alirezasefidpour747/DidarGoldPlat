/**
 * Didar Gold Platform - Kernel 18 (K18) Storage Engine
 * After-sales Cases, Returns, Repairs, Workshop Routing & Warranty Fulfillment
 */

import {
  ServiceTicket,
  RepairWorkshop,
  K18Metrics,
  K18AuditLog,
  K18DataPayload,
  K18TicketStage,
  K18ServiceCategory,
  K18WarrantyStatus,
  K18TimelineEvent
} from '../src/types/k18.js';
import { k17Storage } from './storage-k17.js';

class K18StorageEngine {
  private tickets: ServiceTicket[] = [];
  private workshops: RepairWorkshop[] = [];
  private auditLogs: K18AuditLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Certified Workshops
    this.workshops = [
      {
        id: 'ws-01',
        nameFa: 'کارگاه زرگری و لیزر صانعی (مرکزی بازار تهران)',
        licenseNumber: 'WRK-TEH-7721',
        managerNameFa: 'استاد جواد صانعی',
        contactPhone: '02155621480',
        cityFa: 'تهران',
        addressFa: 'بازار بزرگ تهران، سرای اردیبهشت، طبقه دوم، پلاک ۴۴',
        specialtiesFa: ['جوش لیزری میکرو', 'تعمیر قفل و مدبر', 'تغییر سایز دستبند و النگو', 'ساخت قطعه سفارشی'],
        activeTicketsCount: 4,
        completedTicketsCount: 312,
        averageRating: 4.9,
        slaDays: 3,
        status: 'active'
      },
      {
        id: 'ws-02',
        nameFa: 'آکادمی گوهرشناسی و کارگاه مخراج‌کاری کاوه',
        licenseNumber: 'WRK-TEH-8840',
        managerNameFa: 'مهندس نوید کاوه (GIA Cert)',
        contactPhone: '02188902315',
        cityFa: 'تهران',
        addressFa: 'خیابان کریمخان زند، نبش خیابان ویلا، مجتمع طلای نگین، واحد ۱۰۳',
        specialtiesFa: ['مخراج‌کاری انواع برلیان و زمرد', 'جایگزینی نگین‌های مفقودی', 'چکاب سلامت چنگک‌ها'],
        activeTicketsCount: 2,
        completedTicketsCount: 185,
        averageRating: 4.8,
        slaDays: 4,
        status: 'active'
      },
      {
        id: 'ws-03',
        nameFa: 'مرکز تخصصی آبکاری و پرداخت شمس (طلا و رودیوم)',
        licenseNumber: 'WRK-TEH-5510',
        managerNameFa: 'استاد بیژن شمس',
        contactPhone: '02155809120',
        cityFa: 'تهران',
        addressFa: 'سبزه‌میدان، پاساژ طلا، زیرزمین اول، واحد ۱۲',
        specialtiesFa: ['آبکاری نانو رودیوم سفید', 'پرداخت و پولیش مات و براق', 'شستشوی التراسونیک عمیق'],
        activeTicketsCount: 1,
        completedTicketsCount: 420,
        averageRating: 4.7,
        slaDays: 2,
        status: 'active'
      },
      {
        id: 'ws-04',
        nameFa: 'کارگاه ریخته‌گری صنعتی و نقص فنی زرین کار',
        licenseNumber: 'WRK-ISF-1190',
        managerNameFa: 'مهندس آرش قیاسی',
        contactPhone: '03132204560',
        cityFa: 'اصفهان',
        addressFa: 'اصفهان، چهارباغ عباسی، بازار هنر، راهروی شرقی، پلاک ۱۸',
        specialtiesFa: ['بررسی ترک و حباب ریخته‌گری', 'عیارسنجی ذوب مجدد', 'اصلاح ساختار فلز طلا'],
        activeTicketsCount: 1,
        completedTicketsCount: 94,
        averageRating: 4.9,
        slaDays: 5,
        status: 'active'
      }
    ];

    // 2. Initial Service Tickets
    this.tickets = [
      {
        id: 'tkt-01',
        ticketNumber: 'SRV-1404-0101',
        receiptCode: 'DID-SRV-9812',
        itemUid: 'DID-AU750-2026-8820-001',
        itemTitleFa: 'النگو طلا ۱۸ عیار ریخته‌گری طرح اسلیمی صفوی',
        karatFa: '۱۸ عیار (۷۵۰)',
        karatPurity: 0.750,
        consumerInfo: {
          fullName: 'خانم سارا فرهمند',
          mobile: '09121112233',
          nationalId: '0019283741',
          city: 'تهران'
        },
        intakeDetails: {
          intakeDateFa: '۱۴۰۴/۱۲/۲۲',
          intakeTimestamp: '2026-03-12T10:30:00Z',
          intakeConditionNotesFa: 'شکستگی فنر مدبر قفل در اثر کشیدگی ناگهانی؛ بدون کسر ظاهری طلا؛ کارت گارانتی فعال.',
          intakeStaffNameFa: 'علیرضا اسدی',
          retailerNameFa: 'گالری طلای دیدار شعبه زعفرانیه',
          retailerBranchId: 'ret-zfr-01',
          priority: 'normal'
        },
        warranty: {
          status: 'active_covered',
          warrantyNumber: 'WAR-AU750-1404-8820',
          warrantyClaimId: 'clm-01',
          coverageDescriptionFa: 'تحت پوشش گارانتی طلایی اتصالات و قفل ۲۴ ماهه (تعمیر و جوش رایگان بدون کسر وزن)',
          isFreeService: true
        },
        serviceCategory: 'repair_hardware',
        serviceCategoryFa: 'تعمیر قفل، مدبر و اتصالات مکانیکی',
        stage: 'routed_to_workshop',
        stageFa: 'ارسال شده به کارگاه سازنده',
        workshop: {
          workshopId: 'ws-01',
          workshopNameFa: 'کارگاه زرگری و لیزر صانعی (مرکزی بازار تهران)',
          masterJewelerNameFa: 'استاد جواد صانعی',
          dispatchedDateFa: '۱۴۰۴/۱۲/۲۳',
          estimatedCompletionDateFa: '۱۴۰۴/۱۲/۲۶',
          transitInsuranceTrackingCode: 'INS-TR-99201'
        },
        weightAudit: {
          intakeGrossWeightGrams: 14.850,
          intakeTareGrams: 0.000,
          intakeNetGoldGrams: 14.850,
          scaleCalibrationVerified: true
        },
        financial: {
          laborCostToman: 450000,
          partsCostToman: 180000,
          goldDeltaCostToman: 0,
          gemCostToman: 0,
          totalServiceValueToman: 630000,
          warrantyCoverageDiscountToman: 630000,
          customerPayableToman: 0,
          paymentStatus: 'covered_by_warranty'
        },
        timeline: [
          {
            id: 'tml-01',
            stage: 'intake_received',
            titleFa: 'پذیرش در ویترین و صدور قبض امانی',
            descriptionFa: 'قطعه در گالری زعفرانیه پذیرش شد. گارانتی طلایی استعلام و تایید گردید. قبض امانی به شماره DID-SRV-9812 صادر شد.',
            timestampFa: '۱۴۰۴/۱۲/۲۲ - ۱۰:۳۵',
            operatorNameFa: 'علیرضا اسدی'
          },
          {
            id: 'tml-02',
            stage: 'routed_to_workshop',
            titleFa: 'بسته‌بندی امن و تحویل به ترابری بیمه‌شده',
            descriptionFa: 'قطعه در پاکت پلمپ شماره SEAL-771 به کارگاه زرگری صانعی ارسال شد.',
            timestampFa: '۱۴۰۴/۱۲/۲۳ - ۰۹:۱۵',
            operatorNameFa: 'مسئول لجستیک دیدار'
          }
        ]
      },
      {
        id: 'tkt-02',
        ticketNumber: 'SRV-1404-0102',
        receiptCode: 'DID-SRV-9813',
        itemUid: 'DID-AU750-2026-9041-002',
        itemTitleFa: 'انگشتر تک‌نگین فلاور برلیان ۱۸ عیار',
        karatFa: '۱۸ عیار (۷۵۰)',
        karatPurity: 0.750,
        consumerInfo: {
          fullName: 'آقای بهرام شایگان',
          mobile: '09122223344',
          nationalId: '0028471923',
          city: 'تهران'
        },
        intakeDetails: {
          intakeDateFa: '۱۴۰۴/۱۲/۱۹',
          intakeTimestamp: '2026-03-09T14:15:00Z',
          intakeConditionNotesFa: 'یک قطعه نگین برلیان ریز (۰.۰۴ قیراط) از چنگک کناری افتاده و مفقود گردیده؛ چنگک کمی کج شده است.',
          intakeStaffNameFa: 'مونا کریمی',
          retailerNameFa: 'گالری طلای دیدار شعبه سعادت‌آباد',
          retailerBranchId: 'ret-sdt-02',
          priority: 'express'
        },
        warranty: {
          status: 'active_covered',
          warrantyNumber: 'WAR-AU750-1404-9041',
          coverageDescriptionFa: 'تحت پوشش گارانتی نگین دیدار (تامین رایگان برلیان استاندارد تا ۰.۰۵ قیراط)',
          isFreeService: true
        },
        serviceCategory: 'gem_setting',
        serviceCategoryFa: 'مخراج‌کاری و جایگزینی نگین برلیان',
        stage: 'qc_assay_inspection',
        stageFa: 'کنترل کیفی و توزین مجدد',
        workshop: {
          workshopId: 'ws-02',
          workshopNameFa: 'آکادمی گوهرشناسی و کارگاه مخراج‌کاری کاوه',
          masterJewelerNameFa: 'مهندس نوید کاوه',
          dispatchedDateFa: '۱۴۰۴/۱۲/۲۰',
          estimatedCompletionDateFa: '۱۴۰۴/۱۲/۲۴',
          actualCompletionDateFa: '۱۴۰۴/۱۲/۲۳'
        },
        weightAudit: {
          intakeGrossWeightGrams: 5.420,
          intakeTareGrams: 0.180,
          intakeNetGoldGrams: 5.240,
          returnGrossWeightGrams: 5.428,
          returnTareGrams: 0.188,
          returnNetGoldGrams: 5.240,
          goldWeightDeltaGrams: 0.000,
          goldDeltaCostToman: 0,
          assayCertificateNo: 'QC-K18-88192',
          scaleCalibrationVerified: true
        },
        gemDetails: {
          stoneType: 'الماس تراش برلیان طبیعی',
          carats: 0.04,
          count: 1,
          colorClarity: 'G/VS1',
          isOriginalReplaced: true,
          costToman: 980000
        },
        financial: {
          laborCostToman: 350000,
          partsCostToman: 0,
          goldDeltaCostToman: 0,
          gemCostToman: 980000,
          totalServiceValueToman: 1330000,
          warrantyCoverageDiscountToman: 1330000,
          customerPayableToman: 0,
          paymentStatus: 'covered_by_warranty'
        },
        timeline: [
          {
            id: 'tml-11',
            stage: 'intake_received',
            titleFa: 'پذیرش انگشتر در گالری سعادت‌آباد',
            descriptionFa: 'پذیرش با بررسی میکروسکوپی چنگک‌ها و استعلام گارانتی معتبر.',
            timestampFa: '۱۴۰۴/۱۲/۱۹ - ۱۴:۲۰',
            operatorNameFa: 'مونا کریمی'
          },
          {
            id: 'tml-12',
            stage: 'routed_to_workshop',
            titleFa: 'ارسال به کارگاه گوهرشناسی کاوه',
            descriptionFa: 'ارسال جهت تطبیق رنگ و تراش برلیان G/VS1.',
            timestampFa: '۱۴۰۴/۱۲/۲۰ - ۱۰:۰۰',
            operatorNameFa: 'مسئول لجستیک'
          },
          {
            id: 'tml-13',
            stage: 'in_repair',
            titleFa: 'مخراج‌کاری میکروسکوپی و جوش چنگک',
            descriptionFa: 'سنگ جدید جای‌گذاری و چنگک‌ها تحت بزرگنمایی ۶۰ برابر اصلاح شد.',
            timestampFa: '۱۴۰۴/۱۲/۲۲ - ۱۶:۳۰',
            operatorNameFa: 'مهندس نوید کاوه'
          },
          {
            id: 'tml-14',
            stage: 'qc_assay_inspection',
            titleFa: 'توزین دیجیتال آزمایشگاهی و تست استحکام',
            descriptionFa: 'وزن کل ۵.۴۲۸ گرم با نگین جدید ثبت شد. تست ارتعاش چنگک‌ها با موفقیت پاس شد.',
            timestampFa: '۱۴۰۴/۱۲/۲۳ - ۱۱:۴۵',
            operatorNameFa: 'ناظر کنترل کیفی'
          }
        ]
      },
      {
        id: 'tkt-03',
        ticketNumber: 'SRV-1404-0103',
        receiptCode: 'DID-SRV-9814',
        itemUid: 'DID-AU750-2026-6631-004',
        itemTitleFa: 'سرویس گردنبند و دستبند طلا فیوژن ورساچه',
        karatFa: '۱۸ عیار (۷۵۰)',
        karatPurity: 0.750,
        consumerInfo: {
          fullName: 'خانم پریسا رضوانی',
          mobile: '09123334455',
          nationalId: '0039182745',
          city: 'اصفهان'
        },
        intakeDetails: {
          intakeDateFa: '۱۴۰۴/۱۲/۱۸',
          intakeTimestamp: '2026-03-08T11:00:00Z',
          intakeConditionNotesFa: 'درخواست تغییر سایز دستبند (کوچک کردن ۲ حلقه به طول ۱.۵ سانتی‌متر) و شستشوی کامل اولتراسونیک و آبکاری مجدد.',
          intakeStaffNameFa: 'حمید مقصودی',
          retailerNameFa: 'گالری هنر اصفهان',
          retailerBranchId: 'ret-esf-03',
          priority: 'normal'
        },
        warranty: {
          status: 'expired',
          coverageDescriptionFa: 'گارانتی سالانه منقضی شده است؛ هزینه‌ها طبق تعرفه استاندارد اتحادیه با تخفیف مشتری وفادار محاسبه گردید.',
          isFreeService: false
        },
        serviceCategory: 'sizing_alteration',
        serviceCategoryFa: 'تغییر سایز، پرداخت و آبکاری رودیوم',
        stage: 'ready_for_pickup',
        stageFa: 'آماده تحویل در گالری',
        workshop: {
          workshopId: 'ws-03',
          workshopNameFa: 'مرکز تخصصی آبکاری و پرداخت شمس (طلا و رودیوم)',
          masterJewelerNameFa: 'استاد بیژن شمس',
          dispatchedDateFa: '۱۴۰۴/۱۲/۱۹',
          estimatedCompletionDateFa: '۱۴۰۴/۱۲/۲۲',
          actualCompletionDateFa: '۱۴۰۴/۱۲/۲۲'
        },
        weightAudit: {
          intakeGrossWeightGrams: 32.410,
          intakeTareGrams: 0.000,
          intakeNetGoldGrams: 32.410,
          returnGrossWeightGrams: 30.850,
          returnTareGrams: 0.000,
          returnNetGoldGrams: 30.850,
          goldWeightDeltaGrams: -1.560, // کسر طلای ناشی از حذف دو حلقه
          goldDeltaCostToman: -7800000, // مبلغ برگشتی طلای جدا شده به مشتری بر اساس نرخ روز
          scaleCalibrationVerified: true
        },
        financial: {
          laborCostToman: 650000,
          partsCostToman: 0,
          goldDeltaCostToman: -7800000, // بستانکاری مشتری بابت وزن طلای کسر شده تحویلی
          gemCostToman: 0,
          totalServiceValueToman: 650000,
          warrantyCoverageDiscountToman: 0,
          customerPayableToman: 0,
          paymentStatus: 'settled_paid',
          paymentReference: 'SETTLE-GOLD-7800'
        },
        timeline: [
          {
            id: 'tml-21',
            stage: 'intake_received',
            titleFa: 'پذیرش سرویس جهت تغییر سایز و آبکاری',
            descriptionFa: 'توزین دقیق ۳۲.۴۱۰ گرم ثبت شد و حلقه اضافه مقرر شد در زمان تحویل عودت داده شود.',
            timestampFa: '۱۴۰۴/۱۲/۱۸ - ۱۱:۱۰',
            operatorNameFa: 'حمید مقصودی'
          },
          {
            id: 'tml-22',
            stage: 'in_repair',
            titleFa: 'کوتاه کردن زنجیر و آبکاری التراسونیک',
            descriptionFa: 'دو حلقه به وزن ۱.۵۶۰ گرم تفکیک و در پلمپ مجزا قرار گرفت. آبکاری رودیوم انجام شد.',
            timestampFa: '۱۴۰۴/۱۲/۲۱ - ۱۷:۰۰',
            operatorNameFa: 'استاد بیژن شمس'
          },
          {
            id: 'tml-23',
            stage: 'ready_for_pickup',
            titleFa: 'رسید کالا به گالری و پیامک اطلاع‌رسانی',
            descriptionFa: 'کالا همراه با طلای اضافه و فاکتور تسویه آماده تحویل به خانم رضوانی است.',
            timestampFa: '۱۴۰۴/۱۲/۲۳ - ۱۰:۳۰',
            operatorNameFa: 'حمید مقصودی'
          }
        ]
      },
      {
        id: 'tkt-04',
        ticketNumber: 'SRV-1404-0104',
        receiptCode: 'DID-SRV-9815',
        itemUid: 'DID-AU750-2026-7710-009',
        itemTitleFa: 'پلاک طلا و زنجیر ونکلیف طرح پروانه میناکاری',
        karatFa: '۱۸ عیار (۷۵۰)',
        karatPurity: 0.750,
        consumerInfo: {
          fullName: 'خانم رویا صادقی',
          mobile: '09124445566',
          nationalId: '0049281734',
          city: 'تهران'
        },
        intakeDetails: {
          intakeDateFa: '۱۴۰۴/۱۲/۱۵',
          intakeTimestamp: '2026-03-05T16:00:00Z',
          intakeConditionNotesFa: 'درخواست مرجوعی کالا در روز چهارم خرید مطابق قانون تجارت الکترونیک (۷ روز ضمانت بازگشت بی‌قیدوشرط). پلمپ و شناسنامه سالم.',
          intakeStaffNameFa: 'امیرحسین پارسا',
          retailerNameFa: 'فروشگاه آنلاین رسمی دیدار گلد',
          retailerBranchId: 'ret-onl-00',
          priority: 'urgent_vip'
        },
        warranty: {
          status: 'active_covered',
          warrantyNumber: 'WAR-AU750-1404-7710',
          coverageDescriptionFa: 'حق بازگشت ۷ روزه خرید اینترنتی با استرداد کامل وجه و ابطال گواهی مالکیت',
          isFreeService: true
        },
        serviceCategory: 'return_refund',
        serviceCategoryFa: 'مرجوعی کالا، ابطال مالکیت و استرداد وجه',
        stage: 'completed_delivered',
        stageFa: 'تسویه و استرداد کامل انجام شد',
        weightAudit: {
          intakeGrossWeightGrams: 6.220,
          intakeTareGrams: 0.000,
          intakeNetGoldGrams: 6.220,
          returnGrossWeightGrams: 6.220,
          returnTareGrams: 0.000,
          returnNetGoldGrams: 6.220,
          goldWeightDeltaGrams: 0.000,
          scaleCalibrationVerified: true
        },
        financial: {
          laborCostToman: 0,
          partsCostToman: 0,
          goldDeltaCostToman: 0,
          gemCostToman: 0,
          totalServiceValueToman: 0,
          warrantyCoverageDiscountToman: 0,
          customerPayableToman: 0,
          paymentStatus: 'settled_paid',
          paymentReference: 'REFUND-SATNA-8819203'
        },
        timeline: [
          {
            id: 'tml-31',
            stage: 'intake_received',
            titleFa: 'پذیرش مرجوعی ۷ روزه و بررسی سلامت قطعه',
            descriptionFa: 'اصالت قطعه و دست‌نخوردگی میناکاری تایید شد.',
            timestampFa: '۱۴۰۴/۱۲/۱۵ - ۱۶:۳۰',
            operatorNameFa: 'امیرحسین پارسا'
          },
          {
            id: 'tml-32',
            stage: 'completed_delivered',
            titleFa: 'استرداد وجه از طریق پایا/ساتنا و ابطال سند دیجیتال',
            descriptionFa: 'مبلغ ۳۱,۱۰۰,۰۰۰ تومان به حساب شبای خانم صادقی واریز و سند مالکیت K17 به خزانه مرجوعی منتقل گردید.',
            timestampFa: '۱۴۰۴/۱۲/۱۶ - ۱۱:۰۰',
            operatorNameFa: 'واحد حسابداری دیدار'
          }
        ],
        customerFeedback: {
          rating: 5,
          commentFa: 'پاسخگویی سریع و عودت بدون بهانه وجه در کمتر از ۲۴ ساعت فوق‌العاده بود.',
          submittedDateFa: '۱۴۰۴/۱۲/۱۷'
        }
      }
    ];

    // 3. Initial Audit Logs
    this.auditLogs = [
      {
        id: 'aud-k18-01',
        ticketId: 'tkt-01',
        ticketNumber: 'SRV-1404-0101',
        action: 'ticket_created',
        actionFa: 'ثبت پرونده پذیرش و صدور قبض امانی',
        performedBy: 'علیرضا اسدی (کاربر پذیرش زعفرانیه)',
        timestampFa: '۱۴۰۴/۱۲/۲۲ - ۱۰:۳۵',
        detailsFa: 'پذیرش النگو با استعلام گارانتی طلایی WAR-AU750-1404-8820'
      },
      {
        id: 'aud-k18-02',
        ticketId: 'tkt-01',
        ticketNumber: 'SRV-1404-0101',
        action: 'workshop_routed',
        actionFa: 'ارسال با پلمپ امنیتی به کارگاه',
        performedBy: 'مسئول لجستیک دیدار',
        timestampFa: '۱۴۰۴/۱۲/۲۳ - ۰۹:۱۵',
        detailsFa: 'تخصیص به کارگاه صانعی با ترکینگ بیمه ترابری INS-TR-99201'
      },
      {
        id: 'aud-k18-03',
        ticketId: 'tkt-02',
        ticketNumber: 'SRV-1404-0102',
        action: 'qc_passed',
        actionFa: 'تایید نهایی کنترل کیفی و ری‌گیری',
        performedBy: 'ناظر کنترل کیفی آزمایشگاه',
        timestampFa: '۱۴۰۴/۱۲/۲۳ - ۱۱:۴۵',
        detailsFa: 'مخراج‌کاری مجدد الماس ۰.۰۴ قیراط با گواهی QC-K18-88192'
      }
    ];
  }

  public getData(): K18DataPayload {
    return {
      metrics: this.calculateMetrics(),
      tickets: this.tickets,
      workshops: this.workshops,
      auditLogs: this.auditLogs
    };
  }

  public getTicketById(id: string): ServiceTicket | undefined {
    return this.tickets.find((t) => t.id === id || t.ticketNumber === id);
  }

  public createTicket(input: {
    itemUid: string;
    itemTitleFa: string;
    karatFa?: string;
    karatPurity?: number;
    consumerFullName: string;
    consumerMobile: string;
    consumerNationalId: string;
    consumerCity?: string;
    intakeConditionNotesFa: string;
    intakeStaffNameFa: string;
    retailerNameFa: string;
    priority?: 'normal' | 'express' | 'urgent_vip';
    serviceCategory: K18ServiceCategory;
    serviceCategoryFa: string;
    intakeGrossWeightGrams: number;
    intakeTareGrams?: number;
    warrantyNumber?: string;
  }): ServiceTicket {
    const nextNum = this.tickets.length + 101;
    const ticketId = `tkt-${Date.now()}`;
    const ticketNumber = `SRV-1404-${String(nextNum).padStart(4, '0')}`;
    const receiptCode = `DID-SRV-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check warranty from K17 if possible
    let warrantyStatus: K18WarrantyStatus = 'no_warranty';
    let warrantyDesc = 'فاقد ضمانت‌نامه ثبت‌شده؛ خدمات با تعرفه مصوب اتحادیه ارائه می‌شود.';
    let isFree = false;

    if (input.warrantyNumber) {
      warrantyStatus = 'active_covered';
      warrantyDesc = `تحت پوشش ضمانت‌نامه معتبر ${input.warrantyNumber} دیدار گلد`;
      isFree = true;
    } else {
      // Try lookup by UID
      const k17Data = k17Storage.getData();
      const existingWarranty = k17Data?.warranties?.find(w => w.itemUid === input.itemUid);
      if (existingWarranty && existingWarranty.status === 'active') {
        warrantyStatus = 'active_covered';
        warrantyDesc = `گارانتی فعال به شماره ${existingWarranty.warrantyNumber}`;
        isFree = true;
      }
    }

    const intakeNet = Number((input.intakeGrossWeightGrams - (input.intakeTareGrams || 0)).toFixed(3));

    const newTicket: ServiceTicket = {
      id: ticketId,
      ticketNumber,
      receiptCode,
      itemUid: input.itemUid,
      itemTitleFa: input.itemTitleFa,
      karatFa: input.karatFa || '۱۸ عیار (۷۵۰)',
      karatPurity: input.karatPurity || 0.750,
      consumerInfo: {
        fullName: input.consumerFullName,
        mobile: input.consumerMobile,
        nationalId: input.consumerNationalId,
        city: input.consumerCity || 'تهران'
      },
      intakeDetails: {
        intakeDateFa: '۱۴۰۴/۱۲/۲۵',
        intakeTimestamp: new Date().toISOString(),
        intakeConditionNotesFa: input.intakeConditionNotesFa,
        intakeStaffNameFa: input.intakeStaffNameFa || 'کارشناس پذیرش دیدار',
        retailerNameFa: input.retailerNameFa,
        retailerBranchId: 'branch-01',
        priority: input.priority || 'normal'
      },
      warranty: {
        status: warrantyStatus,
        warrantyNumber: input.warrantyNumber,
        coverageDescriptionFa: warrantyDesc,
        isFreeService: isFree
      },
      serviceCategory: input.serviceCategory,
      serviceCategoryFa: input.serviceCategoryFa,
      stage: 'intake_received',
      stageFa: 'پذیرش اولیه در گالری و صدور قبض امانی',
      weightAudit: {
        intakeGrossWeightGrams: input.intakeGrossWeightGrams,
        intakeTareGrams: input.intakeTareGrams || 0,
        intakeNetGoldGrams: intakeNet,
        scaleCalibrationVerified: true
      },
      financial: {
        laborCostToman: isFree ? 0 : 450000,
        partsCostToman: 0,
        goldDeltaCostToman: 0,
        gemCostToman: 0,
        totalServiceValueToman: isFree ? 450000 : 450000,
        warrantyCoverageDiscountToman: isFree ? 450000 : 0,
        customerPayableToman: isFree ? 0 : 450000,
        paymentStatus: isFree ? 'covered_by_warranty' : 'pending_payment'
      },
      timeline: [
        {
          id: `tml-${Date.now()}`,
          stage: 'intake_received',
          titleFa: 'پذیرش قطعه و صدور قبض امانی رسمی',
          descriptionFa: `قطعه با وزن دقیق ${input.intakeGrossWeightGrams} گرم پذیرش شد. رسید به شماره ${receiptCode} پیامک گردید.`,
          timestampFa: '۱۴۰۴/۱۲/۲۵ - ۱۱:۳۰',
          operatorNameFa: input.intakeStaffNameFa || 'کارشناس پذیرش'
        }
      ]
    };

    this.tickets.unshift(newTicket);

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      ticketId: newTicket.id,
      ticketNumber: newTicket.ticketNumber,
      action: 'ticket_created',
      actionFa: 'ثبت پرونده پذیرش و صدور قبض امانی',
      performedBy: input.intakeStaffNameFa || 'کارشناس پذیرش',
      timestampFa: '۱۴۰۴/۱۲/۲۵ - ۱۱:۳۰',
      detailsFa: `ثبت پذیرش قطعه ${input.itemTitleFa} با وزن ${input.intakeGrossWeightGrams} گرم`
    });

    return newTicket;
  }

  public updateTicketStage(
    ticketId: string,
    nextStage: K18TicketStage,
    payload?: {
      workshopId?: string;
      operatorNameFa?: string;
      notesFa?: string;
      returnGrossWeightGrams?: number;
      actualLaborCostToman?: number;
      assayCert?: string;
    }
  ): ServiceTicket {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      throw new Error(`پرونده با شناسه ${ticketId} یافت نشد.`);
    }

    ticket.stage = nextStage;

    const stageTitles: Record<K18TicketStage, string> = {
      intake_received: 'پذیرش اولیه در گالری و صدور قبض امانی',
      routed_to_workshop: 'ارسال به کارگاه تخصصی با بیمه ترابری',
      in_repair: 'در دست اقدام در کارگاه توسط استادکار',
      qc_assay_inspection: 'کنترل کیفی، ری‌گیری و توزین مجدد دقیق',
      ready_for_pickup: 'تحویل شده به گالری و آماده تحویل به مشتری',
      completed_delivered: 'تحویل قطعی به مشتری و تسویه نهایی',
      rejected_cancelled: 'لغو یا عدم امکان تعمیر فنی'
    };

    ticket.stageFa = stageTitles[nextStage];

    // If workshop assigned
    if (payload?.workshopId) {
      const ws = this.workshops.find((w) => w.id === payload.workshopId);
      if (ws) {
        ticket.workshop = {
          workshopId: ws.id,
          workshopNameFa: ws.nameFa,
          masterJewelerNameFa: ws.managerNameFa,
          dispatchedDateFa: '۱۴۰۴/۱۲/۲۵',
          estimatedCompletionDateFa: '۱۴۰۴/۱۲/۲۸',
          transitInsuranceTrackingCode: `INS-${Math.floor(100000 + Math.random() * 900000)}`
        };
        ws.activeTicketsCount += 1;
      }
    }

    // If QC Weight recorded
    if (payload?.returnGrossWeightGrams !== undefined) {
      ticket.weightAudit.returnGrossWeightGrams = payload.returnGrossWeightGrams;
      ticket.weightAudit.returnTareGrams = ticket.weightAudit.intakeTareGrams;
      ticket.weightAudit.returnNetGoldGrams = Number(
        (payload.returnGrossWeightGrams - (ticket.weightAudit.returnTareGrams || 0)).toFixed(3)
      );
      ticket.weightAudit.goldWeightDeltaGrams = Number(
        (ticket.weightAudit.returnNetGoldGrams - ticket.weightAudit.intakeNetGoldGrams).toFixed(3)
      );
      if (payload.assayCert) {
        ticket.weightAudit.assayCertificateNo = payload.assayCert;
      }
    }

    if (nextStage === 'completed_delivered') {
      ticket.financial.paymentStatus = 'settled_paid';
    }

    ticket.timeline.push({
      id: `tml-${Date.now()}`,
      stage: nextStage,
      titleFa: ticket.stageFa,
      descriptionFa: payload?.notesFa || `وضعیت پرونده به «${ticket.stageFa}» ارتقا یافت.`,
      timestampFa: '۱۴۰۴/۱۲/۲۵ - ۱۲:۰۰',
      operatorNameFa: payload?.operatorNameFa || 'سرپرست زنجیره پس از فروش'
    });

    this.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      action: `stage_${nextStage}`,
      actionFa: `تغییر مرحله به ${ticket.stageFa}`,
      performedBy: payload?.operatorNameFa || 'سرپرست زنجیره پس از فروش',
      timestampFa: '۱۴۰۴/۱۲/۲۵ - ۱۲:۰۰',
      detailsFa: payload?.notesFa || `ارتقای پرونده ${ticket.ticketNumber} به مرحله ${ticket.stageFa}`
    });

    return ticket;
  }

  public getWorkshops(): RepairWorkshop[] {
    return this.workshops;
  }

  private calculateMetrics(): K18Metrics {
    const totalActive = this.tickets.filter((t) => t.stage !== 'completed_delivered' && t.stage !== 'rejected_cancelled').length;
    const underWarranty = this.tickets.filter((t) => t.warranty.status === 'active_covered').length;
    const inWorkshop = this.tickets.filter((t) => t.stage === 'routed_to_workshop' || t.stage === 'in_repair').length;
    const readyPickup = this.tickets.filter((t) => t.stage === 'ready_for_pickup').length;
    const completed = this.tickets.filter((t) => t.stage === 'completed_delivered').length;
    const returnsRefund = this.tickets.filter((t) => t.serviceCategory === 'return_refund').length;

    const totalGold = this.tickets.reduce((sum, t) => sum + (t.weightAudit.intakeNetGoldGrams || 0), 0);
    const totalWarrantySavings = this.tickets.reduce(
      (sum, t) => sum + (t.financial.warrantyCoverageDiscountToman || 0),
      0
    );

    return {
      totalActiveTickets: totalActive,
      underWarrantyCount: underWarranty,
      inWorkshopCount: inWorkshop,
      readyForPickupCount: readyPickup,
      completedDeliveredCount: completed,
      returnsRefundCount: returnsRefund,
      averageTurnaroundDays: 3.2,
      customerSatisfactionRate: 98.4,
      totalGoldHandledGrams: Number(totalGold.toFixed(2)),
      totalWarrantySavingsToman: totalWarrantySavings
    };
  }
}

export const k18Storage = new K18StorageEngine();
