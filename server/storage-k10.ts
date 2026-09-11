/**
 * Didar Gold Platform - Kernel Domain K10 Storage
 * Orders, Allocation & Fulfillment (سفارش، تخصیص و ایفای سفارش)
 */

import {
  Order,
  K10DataPayload,
  K10SummaryMetrics,
  AvailableInventoryPoolItem,
  AllocationSourceType,
  FulfillmentMethod,
  ProofOfDelivery
} from '../src/types/k10.js';

class K10Storage {
  private orders: Order[] = [
    {
      id: 'ord-101',
      orderCode: 'ORD-1403-8821',
      orderDateFa: '۱۴۰۳/۰۹/۰۸',
      channel: 'agent_assisted',
      channelFa: 'سفارش میدانی با ویزیتور و کیف',
      status: 'delivered',
      statusFa: 'تحویل نهایی و ثبت POD',
      retailerOrgId: 'org-ret-01',
      retailerNameFa: 'گالری طلا و جواهر زمرد (بازار بزرگ تهران)',
      retailerContactPersonFa: 'حاج محمود کمالی',
      retailerPhone: '۰۲۱-۵۵۶۲۳۴۹۰',
      retailerCityFa: 'تهران',
      retailerAddressFa: 'بازار بزرگ تهران، سرای حاج مهدی، پلاک ۱۴',
      retailerTrustTier: 'T3 - سطح اعتباری ویژه',
      retailerCreditLimitRemainingToman: 4500000000,
      agentId: 'agt-01',
      agentNameFa: 'مهندس حسام داوودی',
      agentBagCode: 'BAG-IR-042',
      fulfillmentMethod: 'agent_counter_handover',
      fulfillmentMethodFa: 'تحویل حضوری توسط ویزیتور در محل گالری',
      targetDeliveryDateFa: '۱۴۰۳/۰۹/۰۸',
      securitySealSerial: 'DID-SEAL-882190',
      waybillNumber: 'WB-1403-AGT-042',
      paymentTerm: 'split_gold_cash',
      paymentTermFa: 'ترکیبی (۵۰ گرم طلای آبشده + الباقی چک صیادی)',
      totalPiecesCount: 6,
      totalEstimatedWeightGrams: 53.80,
      totalActualAllocatedWeightGrams: 53.78,
      pureGoldEquivalentGrams: 40.335,
      totalMakingWageToman: 18450000,
      totalWholesaleMarginToman: 4250000,
      grandTotalToman: 247388000,
      items: [
        {
          id: 'item-101-1',
          orderId: 'ord-101',
          productId: 'prd-01',
          skuCode: 'DID-COL-0012',
          titleFa: 'سرویس طلای البرز تراش خورده ۱۸ عیار با گوشواره و دستبند',
          categoryFa: 'سرویس کامل',
          carat: '18k_750',
          caratFa: '۱۸ عیار (۷۵۰)',
          fineness: 750,
          requestedQuantity: 2,
          allocatedQuantity: 2,
          targetWeightGrams: 35.30,
          actualAllocatedWeightGrams: 35.28,
          makingWageType: 'percentage',
          makingWageValue: 5.5,
          makingWageDisplayFa: '۵.۵٪ ساخت تراش',
          unitWholesaleMarginPercent: 1.5,
          spotGoldPricePerGram750Toman: 4150000,
          unitEstimatedPriceToman: 81450000,
          totalEstimatedPriceToman: 162900000,
          allocatedItemUids: ['UID-2026-GLD-8821', 'UID-2026-GLD-8822'],
          allocationSource: 'agent_bag',
          allocationSourceNameFa: 'کیف ویزیتور (BAG-IR-042)',
          allocationStatus: 'delivered'
        },
        {
          id: 'item-101-2',
          orderId: 'ord-101',
          productId: 'prd-07',
          skuCode: 'DID-BNG-8750',
          titleFa: 'النگو داماس ۲۱ عیار (۸۷۵) طرح بحرینی زرگری خلیجی',
          categoryFa: 'النگو',
          carat: '21k_875',
          caratFa: '۲۱ عیار (۸۷۵)',
          fineness: 875,
          requestedQuantity: 4,
          allocatedQuantity: 4,
          targetWeightGrams: 18.50,
          actualAllocatedWeightGrams: 18.50,
          makingWageType: 'percentage',
          makingWageValue: 4.8,
          makingWageDisplayFa: '۴.۸٪ روی طلای خام',
          unitWholesaleMarginPercent: 1.2,
          spotGoldPricePerGram750Toman: 4150000,
          unitEstimatedPriceToman: 21122000,
          totalEstimatedPriceToman: 84488000,
          allocatedItemUids: ['UID-2026-GLD-8751', 'UID-2026-GLD-8752', 'UID-2026-GLD-8753', 'UID-2026-GLD-8754'],
          allocationSource: 'agent_bag',
          allocationSourceNameFa: 'کیف ویزیتور (BAG-IR-042)',
          allocationStatus: 'delivered'
        }
      ],
      pod: {
        id: 'pod-8821',
        orderId: 'ord-101',
        verifiedAtFa: '۱۴۰۳/۰۹/۰۸ - ساعت ۱۶:۴۵',
        recipientNameFa: 'حاج محمود کمالی',
        recipientNationalIdMasked: '۰۰۳****۸۲۱',
        recipientRoleFa: 'مدیرمسئول و صاحب‌جواز گالری زمرد',
        recipientPhone: '۰۹۱۲****۲۳۴',
        securityPinVerified: true,
        scaleWeightAtDispatchGrams: 53.78,
        scaleWeightAtHandoverGrams: 53.78,
        weightDiscrepancyGrams: 0.00,
        isWeightDiscrepancyAcceptable: true,
        tamperSealSerial: 'DID-SEAL-882190',
        tamperSealIntact: true,
        handoverOfficerNameFa: 'حسام داوودی',
        handoverOfficerRoleFa: 'کارشناس میدانی و ویزیتور دیدار',
        recipientSignatureName: 'م. کمالی (امضای دیجیتال ثبت شد)',
        handoverPhotosCount: 2,
        notes: 'تحویل حضوری در ویترین طلافروشی با ترازوی کالیبره صاایران. مغایرت وزنی صفر.'
      },
      timeline: [
        {
          id: 'ev-1',
          timestampFa: '۱۴۰۳/۰۹/۰۸ - ۱۰:۱۵',
          status: 'submitted',
          statusFa: 'ثبت سفارش',
          actorNameFa: 'حسام داوودی (عامل میدانی)',
          actorRoleFa: 'ویزیتور رسمی',
          descriptionFa: 'سفارش حضوری در جریان بازدید از گالری زمرد با کیف ۴۲ ثبت شد.'
        },
        {
          id: 'ev-2',
          timestampFa: '۱۴۰۳/۰۹/۰۸ - ۱۰:۳۰',
          status: 'credit_approved',
          statusFa: 'تأیید اعتباری',
          actorNameFa: 'سیستم اعتبارسنجی دیدار (K02/K14)',
          actorRoleFa: 'موتور ریسک',
          descriptionFa: 'سقف اعتباری بررسی شد. مانده اعتبار مجاز بیش از ۴ میلیارد تومان است.'
        },
        {
          id: 'ev-3',
          timestampFa: '۱4۰۳/۰۹/۰۸ - ۱۰:۴۵',
          status: 'allocated',
          statusFa: 'تخصیص آنی موجودی',
          actorNameFa: 'موتور تخصیص K10',
          actorRoleFa: 'هسته تخصیص',
          descriptionFa: '۶ قطعه فیزیکی به وزن ۵۳.۷۸ گرم مستقیماً از کیف ضدسرقت BAG-IR-042 تخصیص یافت.'
        },
        {
          id: 'ev-4',
          timestampFa: '۱۴۰۳/۰۹/۰۸ - ۱۱:۰۰',
          status: 'packed_sealed',
          statusFa: 'پلمپ امنیتی بسته',
          actorNameFa: 'حسام داوودی',
          actorRoleFa: 'عامل تحویل',
          descriptionFa: 'پلمپ ضدجعل هولوگرام به شماره DID-SEAL-882190 ثبت و الصاق شد.'
        },
        {
          id: 'ev-5',
          timestampFa: '۱۴۰۳/۰۹/۰۸ - ۱۶:۴۵',
          status: 'delivered',
          statusFa: 'ثبت سند POD و تحویل',
          actorNameFa: 'حاج محمود کمالی',
          actorRoleFa: 'تحویل‌گیرنده خریدار',
          descriptionFa: 'رمز پیامکی تأیید شد. وزن روی ترازوی طلافروشی ۵۳.۷۸ گرم تایید و رسید POD قطعی گردید.'
        }
      ],
      createdAt: '۱۴۰۳/۰۹/۰۸',
      updatedAt: '۱۴۰۳/۰۹/۰۸'
    },
    {
      id: 'ord-102',
      orderCode: 'ORD-1403-8822',
      orderDateFa: '۱۴۰۳/۰۹/۰۹',
      channel: 'direct_retailer',
      channelFa: 'سفارش مستقیم پورتال خریدار',
      status: 'dispatched',
      statusFa: 'بارگیری و خروج تحت اسکورت زرهی',
      retailerOrgId: 'org-ret-02',
      retailerNameFa: 'جواهرات زرین‌نقش (میدان نقش جهان اصفهان)',
      retailerContactPersonFa: 'مهندس علیرضا صراف‌پور',
      retailerPhone: '۰۳۱-۳۲۲۱۴۵۸۰',
      retailerCityFa: 'اصفهان',
      retailerAddressFa: 'اصفهان، میدان نقش جهان، بازار قیصریه، سرای مخلص',
      retailerTrustTier: 'T2 - مشتری معتبر منطقه‌ای',
      retailerCreditLimitRemainingToman: 2800000000,
      fulfillmentMethod: 'armored_escort',
      fulfillmentMethodFa: 'حمل زمینی امنیتی با خودرو زرهی و اسکورت مسلح',
      targetDeliveryDateFa: '۱۴۰۳/۰۹/۱۱',
      securitySealSerial: 'DID-SEAL-993214',
      waybillNumber: 'WB-1403-SEC-091',
      paymentTerm: 'credit_consignment',
      paymentTermFa: 'اعتباری ۳۰ روزه با ضمانت صیادی بنفش',
      totalPiecesCount: 12,
      totalEstimatedWeightGrams: 84.50,
      totalActualAllocatedWeightGrams: 84.62,
      pureGoldEquivalentGrams: 63.465,
      totalMakingWageToman: 32800000,
      totalWholesaleMarginToman: 7100000,
      grandTotalToman: 391200000,
      items: [
        {
          id: 'item-102-1',
          orderId: 'ord-102',
          productId: 'prd-02',
          skuCode: 'DID-RNG-0045',
          titleFa: 'انگشتر تک‌نگین فیوژن سولیتر طلا ۱۸ عیار با برلیان سنتتیک',
          categoryFa: 'انگشتر',
          carat: '18k_750',
          fineness: 750,
          caratFa: '۱۸ عیار (۷۵۰)',
          requestedQuantity: 8,
          allocatedQuantity: 8,
          targetWeightGrams: 4.80,
          actualAllocatedWeightGrams: 38.62,
          makingWageType: 'percentage',
          makingWageValue: 6.2,
          makingWageDisplayFa: '۶.۲٪ روی طلا',
          unitWholesaleMarginPercent: 1.5,
          spotGoldPricePerGram750Toman: 4180000,
          unitEstimatedPriceToman: 21900000,
          totalEstimatedPriceToman: 175200000,
          allocatedItemUids: ['UID-2026-GLD-8823', 'UID-2026-GLD-8824', 'UID-2026-GLD-8825', 'UID-2026-GLD-8826'],
          allocationSource: 'central_vault',
          allocationSourceNameFa: 'خزانه مرکزی دیدار تهران (VLT-TH-CENTRAL)',
          allocationStatus: 'dispatched'
        },
        {
          id: 'item-102-2',
          orderId: 'ord-102',
          productId: 'prd-03',
          skuCode: 'DID-BRC-0108',
          titleFa: 'دستبند کارتیر ژوپیتر تخت با قفل مکانیکی امنیتی ۱۸ عیار',
          categoryFa: 'دستبند',
          carat: '18k_750',
          fineness: 750,
          caratFa: '۱۸ عیار (۷۵۰)',
          requestedQuantity: 4,
          allocatedQuantity: 4,
          targetWeightGrams: 11.50,
          actualAllocatedWeightGrams: 46.00,
          makingWageType: 'fixed_per_gram',
          makingWageValue: 48000,
          makingWageDisplayFa: '۴۸,۰۰۰ تومان/گرم',
          unitWholesaleMarginPercent: 1.5,
          spotGoldPricePerGram750Toman: 4180000,
          unitEstimatedPriceToman: 54000000,
          totalEstimatedPriceToman: 216000000,
          allocatedItemUids: ['UID-2026-GLD-8827', 'UID-2026-GLD-8828', 'UID-2026-GLD-8829', 'UID-2026-GLD-8830'],
          allocationSource: 'central_vault',
          allocationSourceNameFa: 'خزانه مرکزی دیدار تهران (VLT-TH-CENTRAL)',
          allocationStatus: 'dispatched'
        }
      ],
      timeline: [
        {
          id: 'ev-1',
          timestampFa: '۱۴۰۳/۰۹/۰۹ - ۱۱:۳۰',
          status: 'submitted',
          statusFa: 'ثبت سفارش مستقیم',
          actorNameFa: 'علیرضا صراف‌پور',
          actorRoleFa: 'خریدار گالری زرین‌نقش',
          descriptionFa: 'سفارش آنلاین مستقیم از پورتال تجاری دیدار ثبت گردید.'
        },
        {
          id: 'ev-2',
          timestampFa: '۱۴۰۳/۰۹/۰۹ - ۱۲:۰۰',
          status: 'credit_approved',
          statusFa: 'تأیید اعتبار',
          actorNameFa: 'کارشناس اعتبارات دیدار',
          actorRoleFa: 'مدیریت مالی',
          descriptionFa: 'تضمین چک صیادی بنفش اعتبارسنجی و سقف ۳۰ روزه فعال شد.'
        },
        {
          id: 'ev-3',
          timestampFa: '۱۴۰۳/۰۹/۰۹ - ۱۴:۱۵',
          status: 'allocated',
          statusFa: 'تخصیص از خزانه مرکزی',
          actorNameFa: 'سرپرست خزانه مرکزی',
          actorRoleFa: 'امین خزانه',
          descriptionFa: '۱۲ قطعه فیزیکی به وزن کل ۸۴.۶۲ گرم از قفسه A-12 خزانه مرکزی تخصیص یافت.'
        },
        {
          id: 'ev-4',
          timestampFa: '۱۴۰۳/۰۹/۰۹ - ۱۶:۰۰',
          status: 'packed_sealed',
          statusFa: 'بسته‌بندی و پلمپ امنیتی',
          actorNameFa: 'واحد کنترل ترخیص',
          actorRoleFa: 'بازرس امنیت',
          descriptionFa: 'پلمپ امنیتی ضدبرش DID-SEAL-993214 الصاق شد.'
        },
        {
          id: 'ev-5',
          timestampFa: '۱۴۰۳/۰۹/۱۰ - ۰۸:۳۰',
          status: 'dispatched',
          statusFa: 'خروج و بارگیری اسکورت',
          actorNameFa: 'سرگرد بازنشسته م. شریفی',
          actorRoleFa: 'سرپرست ترابری امنیتی',
          descriptionFa: 'محموله با بارنامه WB-1403-SEC-091 به مقصد اصفهان حرکت کرد.'
        }
      ],
      createdAt: '۱۴۰۳/۰۹/۰۹',
      updatedAt: '۱۴۰۳/۰۹/۱۰'
    },
    {
      id: 'ord-103',
      orderCode: 'ORD-1403-8823',
      orderDateFa: '۱۴۰۳/۰۹/۱۰',
      channel: 'phone_trade_desk',
      channelFa: 'سفارش تلفنی میز معامله دیدار',
      status: 'packed_sealed',
      statusFa: 'بسته‌بندی و پلمپ‌شده (آماده تحویل در باجه)',
      retailerOrgId: 'org-ret-03',
      retailerNameFa: 'بنکداری سکه و شمش طلای فردوسی (مشهد مقدس)',
      retailerContactPersonFa: 'حاج جواد ابراهیمی',
      retailerPhone: '۰۵۱-۳۲۲۸۹۰۱۲',
      retailerCityFa: 'مشهد',
      retailerAddressFa: 'مشهد، خیابان امام خمینی، روبه‌روی بانک ملی مرکزی، پاساژ طلا',
      retailerTrustTier: 'T3 - سطح اعتباری ویژه',
      retailerCreditLimitRemainingToman: 7200000000,
      fulfillmentMethod: 'vault_pickup',
      fulfillmentMethodFa: 'تحویل حضوری نماینده در باجه ترخیص خزانه مرکزی',
      targetDeliveryDateFa: '۱۴۰۳/۰۹/۱۲',
      securitySealSerial: 'DID-SEAL-771024',
      paymentTerm: 'cash_spot',
      paymentTermFa: 'تسویه نقدی ساتنا در باجه خزانه',
      totalPiecesCount: 15,
      totalEstimatedWeightGrams: 140.665,
      totalActualAllocatedWeightGrams: 140.665,
      pureGoldEquivalentGrams: 132.898,
      totalMakingWageToman: 12500000,
      totalWholesaleMarginToman: 6400000,
      grandTotalToman: 635000000,
      items: [
        {
          id: 'item-103-1',
          orderId: 'ord-103',
          productId: 'prd-08',
          skuCode: 'DID-BCN-9000',
          titleFa: 'مسکوک طلای بهار آزادی بانکی عیار ۹۰۰ (۲۱.۶ عیار) ضرب رسمی بانک مرکزی',
          categoryFa: 'سکه بانکی',
          carat: '21.6k_900',
          fineness: 900,
          caratFa: '۲۱.۶ عیار (۹۰۰ سکه‌ای)',
          requestedQuantity: 5,
          allocatedQuantity: 5,
          targetWeightGrams: 8.133,
          actualAllocatedWeightGrams: 40.665,
          makingWageType: 'fixed_per_gram',
          makingWageValue: 200000,
          makingWageDisplayFa: '۲۰۰,۰۰۰ تومان حق‌الضرب',
          unitWholesaleMarginPercent: 0.5,
          spotGoldPricePerGram750Toman: 4190000,
          unitEstimatedPriceToman: 41200000,
          totalEstimatedPriceToman: 206000000,
          allocatedItemUids: ['UID-2026-COIN-01', 'UID-2026-COIN-02', 'UID-2026-COIN-03', 'UID-2026-COIN-04', 'UID-2026-COIN-05'],
          allocationSource: 'central_vault',
          allocationSourceNameFa: 'خزانه مرکزی دیدار تهران',
          allocationStatus: 'allocated'
        },
        {
          id: 'item-103-2',
          orderId: 'ord-103',
          productId: 'prd-09',
          skuCode: 'DID-BUL-9950',
          titleFa: 'شمش طلای ۱۰۰ گرمی استاندارد ۹۹۵ معاملاتی بورس کالا و خزانه‌های بانکی',
          categoryFa: 'شمش استاندارد',
          carat: '24k_995',
          fineness: 995,
          caratFa: '۲۴ عیار (۹۹۵ بورس کالا)',
          requestedQuantity: 1,
          allocatedQuantity: 1,
          targetWeightGrams: 100.00,
          actualAllocatedWeightGrams: 100.00,
          makingWageType: 'percentage',
          makingWageValue: 0.8,
          makingWageDisplayFa: '۰.۸٪ کارمزد تصفیه',
          unitWholesaleMarginPercent: 0.3,
          spotGoldPricePerGram750Toman: 4190000,
          unitEstimatedPriceToman: 429000000,
          totalEstimatedPriceToman: 429000000,
          allocatedItemUids: ['UID-2026-BUL-9951'],
          allocationSource: 'central_vault',
          allocationSourceNameFa: 'خزانه مرکزی دیدار تهران',
          allocationStatus: 'allocated'
        }
      ],
      timeline: [
        {
          id: 'ev-1',
          timestampFa: '۱۴۰۳/۰۹/۱۰ - ۰۹:۱۵',
          status: 'submitted',
          statusFa: 'ثبت سفارش میز معامله',
          actorNameFa: 'علیرضا اسدی (کارگزار میز طلا)',
          actorRoleFa: 'ترید دسک دیدار',
          descriptionFa: 'سفارش شمش و سکه به درخواست تلفنی حاج جواد ابراهیمی ثبت شد.'
        },
        {
          id: 'ev-2',
          timestampFa: '۱۴۰۳/۰۹/۱۰ - ۱۰:۰۰',
          status: 'allocated',
          statusFa: 'تخصیص از گاوصندوق شمش',
          actorNameFa: 'سرپرست خزانه‌داری',
          actorRoleFa: 'امین شمش',
          descriptionFa: 'شمش ۱۰۰ گرمی ۹۹۵ به همراه ۵ قطعه سکه تمام از گاوصندوق رزرو گردید.'
        },
        {
          id: 'ev-3',
          timestampFa: '۱۴۰۳/۰۹/۱۰ - ۱۱:۳۰',
          status: 'packed_sealed',
          statusFa: 'پلمپ محفظه امنیتی',
          actorNameFa: 'کارشناس ترخیص خزانه',
          actorRoleFa: 'مامور ترخیص',
          descriptionFa: 'بسته در حضور ناظر پلمپ شد (کد: DID-SEAL-771024) و آماده دریافت نماینده است.'
        }
      ],
      createdAt: '۱۴۰۳/۰۹/۱۰',
      updatedAt: '۱۴۰۳/۰۹/۱۰'
    },
    {
      id: 'ord-104',
      orderCode: 'ORD-1403-8824',
      orderDateFa: '۱۴۰۳/۰۹/۱۱',
      channel: 'agent_assisted',
      channelFa: 'سفارش میدانی با ویزیتور و کیف',
      status: 'allocated',
      statusFa: 'تخصیص‌یافته و در حال آماده‌سازی بسته‌بندی',
      retailerOrgId: 'org-ret-04',
      retailerNameFa: 'گالری طلای احسان (شیراز)',
      retailerContactPersonFa: 'احسان معتمدی',
      retailerPhone: '۰۷۱-۳۲۳۵۷۱۲۰',
      retailerCityFa: 'شیراز',
      retailerAddressFa: 'شیراز، خیابان کریم‌خان زند، پاساژ پرسپولیس، طبقه همکف',
      retailerTrustTier: 'T2 - مشتری معتبر منطقه‌ای',
      retailerCreditLimitRemainingToman: 1950000000,
      agentId: 'agt-02',
      agentNameFa: 'محمدرضا سلطانی',
      agentBagCode: 'BAG-IR-055',
      fulfillmentMethod: 'agent_counter_handover',
      fulfillmentMethodFa: 'تحویل حضوری توسط ویزیتور در محل گالری',
      targetDeliveryDateFa: '۱۴۰۳/۰۹/۱۳',
      paymentTerm: 'gold_barter_scrap' as any,
      paymentTermFa: 'تهاتر وزنی با طلای آبشده ۷۵۰',
      totalPiecesCount: 3,
      totalEstimatedWeightGrams: 28.40,
      totalActualAllocatedWeightGrams: 28.40,
      pureGoldEquivalentGrams: 21.30,
      totalMakingWageToman: 9850000,
      totalWholesaleMarginToman: 2100000,
      grandTotalToman: 130790000,
      items: [
        {
          id: 'item-104-1',
          orderId: 'ord-104',
          productId: 'prd-04',
          skuCode: 'DID-PND-0321',
          titleFa: 'نیم‌ست طلا طرح شکوفه باران ۱۸ عیار شامل آویز و گوشواره',
          categoryFa: 'نیم‌ست',
          carat: '18k_750',
          fineness: 750,
          caratFa: '۱۸ عیار (۷۵۰)',
          requestedQuantity: 3,
          allocatedQuantity: 3,
          targetWeightGrams: 9.46,
          actualAllocatedWeightGrams: 28.40,
          makingWageType: 'percentage',
          makingWageValue: 6.8,
          makingWageDisplayFa: '۶.۸٪ روی طلا',
          unitWholesaleMarginPercent: 1.5,
          spotGoldPricePerGram750Toman: 4180000,
          unitEstimatedPriceToman: 43596000,
          totalEstimatedPriceToman: 130790000,
          allocatedItemUids: ['UID-2026-GLD-8831', 'UID-2026-GLD-8832', 'UID-2026-GLD-8833'],
          allocationSource: 'agent_bag',
          allocationSourceNameFa: 'کیف ویزیتور شیراز (BAG-IR-055)',
          allocationStatus: 'allocated'
        }
      ],
      timeline: [
        {
          id: 'ev-1',
          timestampFa: '۱۴۰۳/۰۹/۱۱ - ۰۹:۰۰',
          status: 'submitted',
          statusFa: 'ثبت سفارش توسط ویزیتور',
          actorNameFa: 'محمدرضا سلطانی',
          actorRoleFa: 'ویزیتور منطقه جنوب',
          descriptionFa: 'سفارش نیم‌ست در بازدید صبحگاهی از گالری احسان ثبت شد.'
        },
        {
          id: 'ev-2',
          timestampFa: '۱۴۰۳/۰۹/۱۱ - ۱۰:۱۵',
          status: 'allocated',
          statusFa: 'تخصیص از کیف ویزیتور',
          actorNameFa: 'سیستم K10',
          actorRoleFa: 'تخصیص هوشمند',
          descriptionFa: '۳ عدد نیم‌ست از کیف BAG-IR-055 به سفارش قفل شد.'
        }
      ],
      createdAt: '۱۴۰۳/۰۹/۱۱',
      updatedAt: '۱۴۰۳/۰۹/۱۱'
    },
    {
      id: 'ord-105',
      orderCode: 'ORD-1403-8825',
      orderDateFa: '۱۴۰۳/۰۹/۱۱',
      channel: 'direct_retailer',
      channelFa: 'سفارش مستقیم پورتال خریدار',
      status: 'submitted',
      statusFa: 'ثبت‌شده و در انتظار تخصیص موجودی',
      retailerOrgId: 'org-ret-05',
      retailerNameFa: 'گالری طلای کیش گلد (منطقه آزاد کیش)',
      retailerContactPersonFa: 'خانم مهسا رفیعی',
      retailerPhone: '۰۷۶-۴۴۴۲۳۰۰۱',
      retailerCityFa: 'کیش',
      retailerAddressFa: 'جزیره کیش، بازار پردیس ۲، طبقه اول، غرفه ۳۵',
      retailerTrustTier: 'T1 - سطح استاندارد',
      retailerCreditLimitRemainingToman: 1100000000,
      fulfillmentMethod: 'secure_air_courier',
      fulfillmentMethodFa: 'پست هوایی بیمه‌شده مسکوکات و طلا',
      targetDeliveryDateFa: '۱۴۰۳/۰۹/۱۴',
      paymentTerm: 'cash_spot',
      paymentTermFa: 'تسویه کامل نقدی پیش از ارسال',
      totalPiecesCount: 5,
      totalEstimatedWeightGrams: 42.00,
      totalActualAllocatedWeightGrams: 0,
      pureGoldEquivalentGrams: 31.50,
      totalMakingWageToman: 14200000,
      totalWholesaleMarginToman: 3300000,
      grandTotalToman: 193060000,
      items: [
        {
          id: 'item-105-1',
          orderId: 'ord-105',
          productId: 'prd-05',
          skuCode: 'DID-CHN-0512',
          titleFa: 'زنجیر طلای مردانه و زنانه طرح فیگارو ایتالیایی ۱۸ عیار',
          categoryFa: 'زنجیر',
          carat: '18k_750',
          fineness: 750,
          caratFa: '۱۸ عیار (۷۵۰)',
          requestedQuantity: 5,
          allocatedQuantity: 0,
          targetWeightGrams: 8.40,
          actualAllocatedWeightGrams: 0,
          makingWageType: 'fixed_per_gram',
          makingWageValue: 42000,
          makingWageDisplayFa: '۴۲,۰۰۰ تومان/گرم',
          unitWholesaleMarginPercent: 1.5,
          spotGoldPricePerGram750Toman: 4180000,
          unitEstimatedPriceToman: 38612000,
          totalEstimatedPriceToman: 193060000,
          allocatedItemUids: [],
          allocationSource: 'central_vault',
          allocationSourceNameFa: 'خزانه مرکزی تهران',
          allocationStatus: 'pending'
        }
      ],
      timeline: [
        {
          id: 'ev-1',
          timestampFa: '۱۴۰۳/۰۹/۱۱ - ۱۱:۵۰',
          status: 'submitted',
          statusFa: 'ثبت سفارش در پورتال',
          actorNameFa: 'خانم مهسا رفیعی',
          actorRoleFa: 'مدیر گالری کیش گلد',
          descriptionFa: 'سفارش ۵ رشته زنجیر فیگارو ثبت شد و در صف تخصیص انبار قرار گرفت.'
        }
      ],
      createdAt: '۱۴۰۳/۰۹/۱۱',
      updatedAt: '۱۴۰۳/۰۹/۱۱'
    }
  ];

  // Available Inventory for reservation
  private inventoryPool: AvailableInventoryPoolItem[] = [
    {
      id: 'pool-01',
      uid: 'UID-2026-GLD-8901',
      titleFa: 'زنجیر طلای فیگارو ایتالیایی ۱۸ عیار - ۵۰ سانت',
      skuCode: 'DID-CHN-0512',
      caratFa: '۱۸ عیار (۷۵۰)',
      fineness: 750,
      scaleWeightGrams: 8.42,
      locationId: 'VLT-TH-CENTRAL',
      locationNameFa: 'خزانه مرکزی دیدار تهران',
      locationType: 'vault',
      isAvailable: true
    },
    {
      id: 'pool-02',
      uid: 'UID-2026-GLD-8902',
      titleFa: 'زنجیر طلای فیگارو ایتالیایی ۱۸ عیار - ۵۰ سانت',
      skuCode: 'DID-CHN-0512',
      caratFa: '۱۸ عیار (۷۵۰)',
      fineness: 750,
      scaleWeightGrams: 8.39,
      locationId: 'VLT-TH-CENTRAL',
      locationNameFa: 'خزانه مرکزی دیدار تهران',
      locationType: 'vault',
      isAvailable: true
    },
    {
      id: 'pool-03',
      uid: 'UID-2026-GLD-8903',
      titleFa: 'زنجیر طلای فیگارو ایتالیایی ۱۸ عیار - ۵۵ سانت',
      skuCode: 'DID-CHN-0512',
      caratFa: '۱۸ عیار (۷۵۰)',
      fineness: 750,
      scaleWeightGrams: 8.41,
      locationId: 'VLT-TH-CENTRAL',
      locationNameFa: 'خزانه مرکزی دیدار تهران',
      locationType: 'vault',
      isAvailable: true
    },
    {
      id: 'pool-04',
      uid: 'UID-2026-GLD-8904',
      titleFa: 'زنجیر طلای فیگارو ایتالیایی ۱۸ عیار - ۵۵ سانت',
      skuCode: 'DID-CHN-0512',
      caratFa: '۱۸ عیار (۷۵۰)',
      fineness: 750,
      scaleWeightGrams: 8.38,
      locationId: 'BAG-IR-042',
      locationNameFa: 'کیف ویزیتور تهران (حسام داوودی)',
      locationType: 'bag',
      isAvailable: true
    },
    {
      id: 'pool-05',
      uid: 'UID-2026-GLD-8905',
      titleFa: 'زنجیر طلای فیگارو ایتالیایی ۱۸ عیار - ۵۵ سانت',
      skuCode: 'DID-CHN-0512',
      caratFa: '۱۸ عیار (۷۵۰)',
      fineness: 750,
      scaleWeightGrams: 8.40,
      locationId: 'BAG-IR-042',
      locationNameFa: 'کیف ویزیتور تهران (حسام داوودی)',
      locationType: 'bag',
      isAvailable: true
    },
    {
      id: 'pool-06',
      uid: 'UID-2026-GLD-8906',
      titleFa: 'شمش طلای ۱۰۰ گرمی ۹۹۵ بورس کالا',
      skuCode: 'DID-BUL-9950',
      caratFa: '۲۴ عیار (۹۹۵)',
      fineness: 995,
      scaleWeightGrams: 100.00,
      locationId: 'VLT-TH-CENTRAL',
      locationNameFa: 'خزانه مرکزی دیدار تهران',
      locationType: 'vault',
      isAvailable: true
    }
  ];

  private supportedRetailers = [
    {
      id: 'org-ret-01',
      nameFa: 'گالری طلا و جواهر زمرد (بازار بزرگ تهران)',
      cityFa: 'تهران',
      trustTier: 'T3 - سطح اعتباری ویژه',
      creditLimitToman: 5000000000,
      phone: '۰۲۱-۵۵۶۲۳۴۹۰',
      addressFa: 'بازار بزرگ تهران، سرای حاج مهدی، پلاک ۱۴'
    },
    {
      id: 'org-ret-02',
      nameFa: 'جواهرات زرین‌نقش (میدان نقش جهان اصفهان)',
      cityFa: 'اصفهان',
      trustTier: 'T2 - مشتری معتبر منطقه‌ای',
      creditLimitToman: 3000000000,
      phone: '۰۳۱-۳۲۲۱۴۵۸۰',
      addressFa: 'اصفهان، میدان نقش جهان، بازار قیصریه'
    },
    {
      id: 'org-ret-03',
      nameFa: 'بنکداری سکه و شمش طلای فردوسی (مشهد مقدس)',
      cityFa: 'مشهد',
      trustTier: 'T3 - سطح اعتباری ویژه',
      creditLimitToman: 8000000000,
      phone: '۰۵۱-۳۲۲۸۹۰۱۲',
      addressFa: 'مشهد، خیابان امام خمینی، روبه‌روی بانک ملی مرکزی'
    },
    {
      id: 'org-ret-04',
      nameFa: 'گالری طلای احسان (شیراز)',
      cityFa: 'شیراز',
      trustTier: 'T2 - مشتری معتبر منطقه‌ای',
      creditLimitToman: 2000000000,
      phone: '۰۷۱-۳۲۳۵۷۱۲۰',
      addressFa: 'شیراز، خیابان کریم‌خان زند، پاساژ پرسپولیس'
    },
    {
      id: 'org-ret-05',
      nameFa: 'گالری طلای کیش گلد (منطقه آزاد کیش)',
      cityFa: 'کیش',
      trustTier: 'T1 - سطح استاندارد',
      creditLimitToman: 1500000000,
      phone: '۰۷۶-۴۴۴۲۳۰۰۱',
      addressFa: 'جزیره کیش، بازار پردیس ۲، طبقه اول، غرفه ۳۵'
    }
  ];

  private agentBags = [
    {
      id: 'bag-01',
      bagCode: 'BAG-IR-042',
      agentNameFa: 'مهندس حسام داوودی',
      territoryFa: 'بازار بزرگ تهران، تجریش و سعادت‌آباد',
      currentWeightGrams: 3420.50,
      piecesCount: 148
    },
    {
      id: 'bag-02',
      bagCode: 'BAG-IR-055',
      agentNameFa: 'محمدرضا سلطانی',
      territoryFa: 'شیراز و بنادر جنوب',
      currentWeightGrams: 2150.80,
      piecesCount: 92
    },
    {
      id: 'bag-03',
      bagCode: 'BAG-IR-061',
      agentNameFa: 'امیرحسین پارسا',
      territoryFa: 'اصفهان و کاشان',
      currentWeightGrams: 2890.10,
      piecesCount: 116
    }
  ];

  private vaultLocations = [
    {
      id: 'vlt-01',
      code: 'VLT-TH-CENTRAL',
      nameFa: 'خزانه مرکزی دیدار تهران',
      cityFa: 'تهران',
      totalGoldWeightGrams: 42180.50
    },
    {
      id: 'vlt-02',
      code: 'VLT-IS-HUB',
      nameFa: 'هاب خزانه منطقه‌ای اصفهان',
      cityFa: 'اصفهان',
      totalGoldWeightGrams: 16450.00
    },
    {
      id: 'vlt-03',
      code: 'VLT-MS-HUB',
      nameFa: 'هاب خزانه منطقه‌ای مشهد',
      cityFa: 'مشهد',
      totalGoldWeightGrams: 12890.30
    }
  ];

  private calculateMetrics(): K10SummaryMetrics {
    const totalOrdersCount = this.orders.length;
    const activeOrdersCount = this.orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
    const pendingAllocationCount = this.orders.filter(o => ['submitted', 'partially_allocated'].includes(o.status)).length;
    
    // In-transit gold grams (status === 'dispatched')
    const inTransitGoldGrams = this.orders
      .filter(o => o.status === 'dispatched')
      .reduce((sum, o) => sum + (o.totalActualAllocatedWeightGrams || o.totalEstimatedWeightGrams), 0);

    // Fulfilled today (status === 'delivered')
    const todayDelivered = this.orders.filter(o => o.status === 'delivered');
    const todayFulfilledGoldGrams = todayDelivered.reduce((sum, o) => sum + o.totalActualAllocatedWeightGrams, 0);
    const todayFulfilledOrdersCount = todayDelivered.length;

    // Total wholesale value
    const totalWholesaleValueToman = this.orders.reduce((sum, o) => sum + o.grandTotalToman, 0);

    // Pending allocation grams
    const totalPendingAllocationGrams = this.orders
      .filter(o => ['submitted', 'partially_allocated'].includes(o.status))
      .reduce((sum, o) => {
        const allocated = o.totalActualAllocatedWeightGrams || 0;
        const diff = Math.max(0, o.totalEstimatedWeightGrams - allocated);
        return sum + diff;
      }, 0);

    return {
      totalOrdersCount,
      activeOrdersCount,
      pendingAllocationCount,
      inTransitGoldGrams: Number(inTransitGoldGrams.toFixed(3)),
      todayFulfilledGoldGrams: Number(todayFulfilledGoldGrams.toFixed(3)),
      todayFulfilledOrdersCount,
      totalWholesaleValueToman,
      totalPendingAllocationGrams: Number(totalPendingAllocationGrams.toFixed(3))
    };
  }

  public getAllData(): K10DataPayload {
    return {
      orders: [...this.orders],
      metrics: this.calculateMetrics(),
      inventoryPool: [...this.inventoryPool],
      supportedRetailers: [...this.supportedRetailers],
      agentBags: [...this.agentBags],
      vaultLocations: [...this.vaultLocations]
    };
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id);
  }

  public createOrder(payload: Partial<Order>): Order {
    const newId = `ord-${Date.now().toString().slice(-4)}`;
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `ORD-1403-${randomCode}`;
    const todayFa = new Intl.DateTimeFormat('fa-IR', { calendar: 'persian' }).format(new Date());

    const items = payload.items || [];
    const totalPiecesCount = items.reduce((sum, it) => sum + (it.requestedQuantity || 1), 0);
    const totalEstimatedWeightGrams = items.reduce((sum, it) => sum + (it.targetWeightGrams * it.requestedQuantity), 0);
    const totalMakingWageToman = items.reduce((sum, it) => {
      if (it.makingWageType === 'percentage') {
        return sum + ((it.targetWeightGrams * it.requestedQuantity * it.spotGoldPricePerGram750Toman * it.makingWageValue) / 100);
      }
      return sum + (it.makingWageValue * it.targetWeightGrams * it.requestedQuantity);
    }, 0);
    const totalWholesaleMarginToman = items.reduce((sum, it) => {
      const baseGoldVal = it.targetWeightGrams * it.requestedQuantity * it.spotGoldPricePerGram750Toman;
      return sum + ((baseGoldVal * it.unitWholesaleMarginPercent) / 100);
    }, 0);
    const grandTotalToman = items.reduce((sum, it) => sum + (it.totalEstimatedPriceToman || 0), 0);

    const channelFaMap: Record<string, string> = {
      direct_retailer: 'سفارش مستقیم پورتال خریدار',
      agent_assisted: 'سفارش میدانی با ویزیتور و کیف',
      phone_trade_desk: 'سفارش تلفنی میز معامله دیدار',
      custom_backorder: 'سفارش ساخت سفارشی کارگاهی'
    };

    const fulfillmentFaMap: Record<string, string> = {
      agent_counter_handover: 'تحویل حضوری توسط ویزیتور در محل گالری',
      armored_escort: 'حمل زمینی امنیتی با خودرو زرهی و اسکورت مسلح',
      vault_pickup: 'تحویل حضوری در باجه ترخیص خزانه مرکزی',
      secure_air_courier: 'پست هوایی بیمه‌شده مسکوکات و طلا'
    };

    const paymentTermFaMap: Record<string, string> = {
      cash_spot: 'تسویه نقدی ریالی در لحظه تحویل',
      gold_barter_scrap: 'تهاتر وزنی با طلای آبشده ۷۵۰',
      credit_consignment: 'اعتباری ۳۰ روزه با سقف ضمانت صیادی',
      split_gold_cash: 'ترکیبی (طلا + ریال)'
    };

    const newOrder: Order = {
      id: newId,
      orderCode,
      orderDateFa: todayFa,
      channel: payload.channel || 'direct_retailer',
      channelFa: channelFaMap[payload.channel || 'direct_retailer'] || 'سفارش مستقیم',
      status: 'submitted',
      statusFa: 'ثبت‌شده و در انتظار بررسی و تخصیص',
      retailerOrgId: payload.retailerOrgId || 'org-ret-01',
      retailerNameFa: payload.retailerNameFa || 'گالری طلا و جواهر معتبر',
      retailerContactPersonFa: payload.retailerContactPersonFa || 'مسئول گالری',
      retailerPhone: payload.retailerPhone || '۰۲۱-۵۵۵۵۵۵۵۵',
      retailerCityFa: payload.retailerCityFa || 'تهران',
      retailerAddressFa: payload.retailerAddressFa || 'بازار زرگران',
      retailerTrustTier: payload.retailerTrustTier || 'T2 - سطح اعتباری استاندارد',
      retailerCreditLimitRemainingToman: payload.retailerCreditLimitRemainingToman || 2000000000,
      agentId: payload.agentId,
      agentNameFa: payload.agentNameFa,
      agentBagCode: payload.agentBagCode,
      fulfillmentMethod: payload.fulfillmentMethod || 'agent_counter_handover',
      fulfillmentMethodFa: fulfillmentFaMap[payload.fulfillmentMethod || 'agent_counter_handover'],
      targetDeliveryDateFa: payload.targetDeliveryDateFa || todayFa,
      paymentTerm: payload.paymentTerm || 'cash_spot',
      paymentTermFa: paymentTermFaMap[payload.paymentTerm || 'cash_spot'],
      items,
      totalPiecesCount,
      totalEstimatedWeightGrams: Number(totalEstimatedWeightGrams.toFixed(3)),
      totalActualAllocatedWeightGrams: 0,
      pureGoldEquivalentGrams: Number((totalEstimatedWeightGrams * 0.75).toFixed(3)),
      totalMakingWageToman: Math.round(totalMakingWageToman),
      totalWholesaleMarginToman: Math.round(totalWholesaleMarginToman),
      grandTotalToman: Math.round(grandTotalToman),
      timeline: [
        {
          id: `ev-${Date.now()}`,
          timestampFa: `${todayFa} - ساعت ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
          status: 'submitted',
          statusFa: 'ثبت اولیه سفارش',
          actorNameFa: payload.agentNameFa || payload.retailerContactPersonFa || 'کاربر سامانه',
          actorRoleFa: payload.agentId ? 'عامل میدانی' : 'خریدار',
          descriptionFa: `سفارش جدید به مبلغ ${grandTotalToman.toLocaleString('fa-IR')} تومان ثبت گردید.`
        }
      ],
      notes: payload.notes || '',
      createdAt: todayFa,
      updatedAt: todayFa
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  public allocateStock(
    orderId: string,
    allocations: {
      itemId: string;
      allocatedUids: string[];
      source: AllocationSourceType;
      sourceNameFa: string;
      actualWeightGrams: number;
    }[]
  ): Order {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error('سفارش مورد نظر یافت نشد.');
    }

    let totalAllocatedWeight = 0;
    order.items = order.items.map(item => {
      const alloc = allocations.find(a => a.itemId === item.id);
      if (alloc) {
        item.allocatedQuantity = item.requestedQuantity;
        item.allocatedItemUids = alloc.allocatedUids;
        item.actualAllocatedWeightGrams = alloc.actualWeightGrams;
        item.allocationSource = alloc.source;
        item.allocationSourceNameFa = alloc.sourceNameFa;
        item.allocationStatus = 'allocated';
        totalAllocatedWeight += alloc.actualWeightGrams;
      } else {
        totalAllocatedWeight += (item.actualAllocatedWeightGrams || 0);
      }
      return item;
    });

    order.totalActualAllocatedWeightGrams = Number(totalAllocatedWeight.toFixed(3));
    order.status = 'allocated';
    order.statusFa = 'تخصیص‌یافته و آماده بسته‌بندی';

    const nowFa = new Intl.DateTimeFormat('fa-IR', { calendar: 'persian' }).format(new Date());
    order.timeline.push({
      id: `ev-${Date.now()}`,
      timestampFa: `${nowFa} - ساعت ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'allocated',
      statusFa: 'تخصیص قطعی موجودی فیزیکی',
      actorNameFa: 'کارشناس تخصیص انبار دیدار',
      actorRoleFa: 'مدیر خزانه‌داری',
      descriptionFa: `موجودی فیزیکی به وزن ${totalAllocatedWeight.toFixed(2)} گرم به ردیف‌های سفارش تخصیص داده شد.`
    });

    order.updatedAt = nowFa;
    return order;
  }

  public packAndSeal(orderId: string, sealSerial: string, notes?: string): Order {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error('سفارش مورد نظر یافت نشد.');
    }

    order.securitySealSerial = sealSerial;
    order.status = 'packed_sealed';
    order.statusFa = 'بسته‌بندی و پلمپ امنیتی الصاق شد';

    const nowFa = new Intl.DateTimeFormat('fa-IR', { calendar: 'persian' }).format(new Date());
    order.timeline.push({
      id: `ev-${Date.now()}`,
      timestampFa: `${nowFa} - ساعت ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'packed_sealed',
      statusFa: 'پلمپ امنیتی محموله',
      actorNameFa: 'مامور ترخیص و کنترل کیفیت',
      actorRoleFa: 'حراست و بازرسی',
      descriptionFa: `بسته با پلمپ هولوگرام و شماره امنیتی ${sealSerial} ممهور و برای خروج آماده شد. ${notes ? `توضیحات: ${notes}` : ''}`
    });

    order.updatedAt = nowFa;
    return order;
  }

  public dispatchOrder(
    orderId: string,
    carrierInfo: {
      waybill: string;
      method: FulfillmentMethod;
      escortOfficerNameFa: string;
    }
  ): Order {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error('سفارش مورد نظر یافت نشد.');
    }

    order.waybillNumber = carrierInfo.waybill;
    order.fulfillmentMethod = carrierInfo.method;
    order.status = 'dispatched';
    order.statusFa = 'خروج از خزانه و بارگیری تحت اسکورت';

    // Update items allocation status
    order.items = order.items.map(it => ({ ...it, allocationStatus: 'dispatched' }));

    const nowFa = new Intl.DateTimeFormat('fa-IR', { calendar: 'persian' }).format(new Date());
    order.timeline.push({
      id: `ev-${Date.now()}`,
      timestampFa: `${nowFa} - ساعت ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'dispatched',
      statusFa: 'بارگیری و خروج تحت نظارت حراست',
      actorNameFa: carrierInfo.escortOfficerNameFa || 'سرپرست ترابری امنیتی',
      actorRoleFa: 'فرمانده اسکورت',
      descriptionFa: `محموله طلا با شماره بارنامه ${carrierInfo.waybill} جهت تحویل به گالری خارج شد.`
    });

    order.updatedAt = nowFa;
    return order;
  }

  public verifyPod(orderId: string, podData: Partial<ProofOfDelivery>): Order {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error('سفارش مورد نظر یافت نشد.');
    }

    const nowFa = new Intl.DateTimeFormat('fa-IR', { calendar: 'persian' }).format(new Date());
    const dispatchWeight = order.totalActualAllocatedWeightGrams || order.totalEstimatedWeightGrams;
    const handoverWeight = podData.scaleWeightAtHandoverGrams || dispatchWeight;
    const discrepancy = Number((handoverWeight - dispatchWeight).toFixed(3));
    const isAcceptable = Math.abs(discrepancy) <= 0.02; // max ±0.02 grams tolerance

    const pod: ProofOfDelivery = {
      id: `pod-${Date.now().toString().slice(-4)}`,
      orderId,
      verifiedAtFa: `${nowFa} - ساعت ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      recipientNameFa: podData.recipientNameFa || order.retailerContactPersonFa,
      recipientNationalIdMasked: podData.recipientNationalIdMasked || '۰۰۱****۴۳۲',
      recipientRoleFa: podData.recipientRoleFa || 'صاحب‌جواز طلافروشی',
      recipientPhone: podData.recipientPhone || order.retailerPhone,
      securityPinVerified: true,
      scaleWeightAtDispatchGrams: dispatchWeight,
      scaleWeightAtHandoverGrams: handoverWeight,
      weightDiscrepancyGrams: discrepancy,
      isWeightDiscrepancyAcceptable: isAcceptable,
      tamperSealSerial: podData.tamperSealSerial || order.securitySealSerial || 'DID-SEAL-VERIFIED',
      tamperSealIntact: podData.tamperSealIntact !== undefined ? podData.tamperSealIntact : true,
      handoverOfficerNameFa: podData.handoverOfficerNameFa || order.agentNameFa || 'عامل تحویل دیدار',
      handoverOfficerRoleFa: podData.handoverOfficerRoleFa || 'کارشناس تحویل امنیتی',
      recipientSignatureName: podData.recipientSignatureName || `${order.retailerContactPersonFa} (امضای دیجیتال)`,
      handoverPhotosCount: podData.handoverPhotosCount || 2,
      notes: podData.notes || 'سند اثبات تحویل POD با ترازوی گالری و تایید پیامکی با موفقیت ثبت گردید.'
    };

    order.pod = pod;
    order.status = 'delivered';
    order.statusFa = 'تحویل نهایی و ثبت سند POD';
    order.items = order.items.map(it => ({ ...it, allocationStatus: 'delivered' }));

    order.timeline.push({
      id: `ev-${Date.now()}`,
      timestampFa: pod.verifiedAtFa,
      status: 'delivered',
      statusFa: 'تأیید تحویل قطعی (POD)',
      actorNameFa: pod.recipientNameFa,
      actorRoleFa: pod.recipientRoleFa,
      descriptionFa: `تحویل رسمی با رمز تایید شد. وزن در مقصد ${handoverWeight.toFixed(2)} گرم (اختلاف ${discrepancy} گرم). پلمپ سالم بود.`
    });

    order.updatedAt = nowFa;
    return order;
  }

  public cancelOrder(orderId: string, reason: string): Order {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error('سفارش مورد نظر یافت نشد.');
    }

    order.status = 'cancelled';
    order.statusFa = 'لغوشده / آزادسازی طلا';

    const nowFa = new Intl.DateTimeFormat('fa-IR', { calendar: 'persian' }).format(new Date());
    order.timeline.push({
      id: `ev-${Date.now()}`,
      timestampFa: `${nowFa} - ساعت ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'cancelled',
      statusFa: 'لغو سفارش و ابطال رزرو طلا',
      actorNameFa: 'مدیر سامانه دیدار',
      actorRoleFa: 'ادمین سیستم',
      descriptionFa: `سفارش به دلیل: «${reason}» لغو شد و موجودی طلا به چرخه بازگشت.`
    });

    order.updatedAt = nowFa;
    return order;
  }
}

export const k10Storage = new K10Storage();
