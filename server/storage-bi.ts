/**
 * Didar Gold Platform - Business Intelligence (BI) Storage Engine
 * Aggregates operational data across K01-K20:
 * - Real-time Gold Circulation Pipeline
 * - Dual-Ledger Financial Exposure & Collateral Heatmap
 * - Quality, Yield & Metallurgy Analytics
 * - Anomaly Sentinel & Predictive Scenario Simulator
 */

import { BiDataPayload, BiAnomalyAlert } from '../src/types/bi.js';

class BiStorageEngine {
  private data: BiDataPayload;

  constructor() {
    this.data = {
      executiveCockpit: {
        circulatingGoldGrams750: 18450.75,
        totalFiatValuationToman: 113472112500, // 18,450.75g * 6,150,000
        benchmarkGoldRateGram750: 6150000,
        benchmarkTimestampFa: 'امروز - نرخ زنده اتحادیه طلا',
        vaultReserveGrams: 8920.4,
        fieldAgentBagsGrams: 3180.25,
        retailerConsignedGrams: 6350.1,
        unsettledGoldReceivablesGrams: 1420.5,
        unsettledFiatReceivablesToman: 8736075000,
        overallCollateralCoveragePercent: 124.5,
        settlementNettingVelocityHours: 4.8,
        activeB2BRetailersCount: 48,
        cpoAndRecyclingYieldPercent: 98.4,
        ecosystemHealthIndex: 96.5
      },
      circulationPipeline: [
        {
          id: 'pipe-01',
          stageFa: '۱. ورود و پذیرش تأمین اولیه',
          stageEn: 'Supply Intake & Quarantine',
          domainSource: 'K08',
          volumeGrams750: 4250.8,
          valuationToman: 26142420000,
          activeItemsCount: 38,
          velocityFa: 'میانگین ترخیص: ۱.۲ روز',
          healthStatus: 'optimal',
          flowRatioPercent: 23.0
        },
        {
          id: 'pipe-02',
          stageFa: '۲. خزانه‌داری مرکزی و صدور پاسپورت',
          stageEn: 'Central Vault & UID Passporting',
          domainSource: 'K06 / K09',
          volumeGrams750: 8920.4,
          valuationToman: 54860460000,
          activeItemsCount: 342,
          velocityFa: 'رسوب امن در گاوصندوق',
          healthStatus: 'optimal',
          flowRatioPercent: 48.3
        },
        {
          id: 'pipe-03',
          stageFa: '۳. کیف‌های امن عاملان میدانی',
          stageEn: 'Field Agents Mobile Safes',
          domainSource: 'K09 / K12',
          volumeGrams750: 3180.25,
          valuationToman: 19558537500,
          activeItemsCount: 112,
          velocityFa: 'گردش سریع در ویزیت‌های روزانه',
          healthStatus: 'optimal',
          flowRatioPercent: 17.2
        },
        {
          id: 'pipe-04',
          stageFa: '۴. ویترین و موجودی امانی بنکداری/خرده‌فروشی',
          stageEn: 'Retailer Consignment Showcases',
          domainSource: 'K10 / K11',
          volumeGrams750: 6350.1,
          valuationToman: 39053115000,
          activeItemsCount: 215,
          velocityFa: 'نرخ چرخش موجودی: ۱۴ روز',
          healthStatus: 'optimal',
          flowRatioPercent: 34.4
        },
        {
          id: 'pipe-05',
          stageFa: '۵. تحویل قطعی به مشتری و گارانتی',
          stageEn: 'Consumer Ownership & Warranty',
          domainSource: 'K10 / K17',
          volumeGrams750: 2140.6,
          valuationToman: 13164690000,
          activeItemsCount: 89,
          velocityFa: 'ثبت دیجیتال پاسپورت خریدار',
          healthStatus: 'optimal',
          flowRatioPercent: 11.6
        },
        {
          id: 'pipe-06',
          stageFa: '۶. خدمات، تعمیر و مرجوعی',
          stageEn: 'After-Sales & Repairs',
          domainSource: 'K18',
          volumeGrams750: 185.3,
          valuationToman: 1139595000,
          activeItemsCount: 14,
          velocityFa: 'میانگین تعمیر کارگاهی: ۳.۵ روز',
          healthStatus: 'normal',
          flowRatioPercent: 1.0
        },
        {
          id: 'pipe-07',
          stageFa: '۷. بازخرید تضمینی و معاوضه',
          stageEn: 'Buyback & Trade-In Pipeline',
          domainSource: 'K19',
          volumeGrams750: 924.8,
          valuationToman: 5687520000,
          activeItemsCount: 42,
          velocityFa: 'واریز آنی در کمتر از ۶ ساعت',
          healthStatus: 'optimal',
          flowRatioPercent: 5.0
        },
        {
          id: 'pipe-08',
          stageFa: '۸. احیای CPO و بازیافت کوره ذوب',
          stageEn: 'CPO Refurbishment & Smelting',
          domainSource: 'K20',
          volumeGrams750: 784.1,
          valuationToman: 4822215000,
          activeItemsCount: 26,
          velocityFa: 'راندمان بازیابی: ۹۹.۲٪',
          healthStatus: 'optimal',
          flowRatioPercent: 4.2
        }
      ],
      exposureMatrix: {
        tiers: [
          {
            tier: 'VIP',
            tierNameFa: 'شرکای استراتژیک و بنکداران رتبه ۱ (VIP)',
            retailersCount: 6,
            totalCreditCapToman: 18000000000,
            utilizedCreditToman: 12400000000,
            utilizationPercent: 68.8,
            totalGoldDebtGrams: 520.4,
            collateralCoveragePercent: 155.0,
            riskStatus: 'low'
          },
          {
            tier: 'GOLD',
            tierNameFa: 'گالری‌های ممتاز و طلافروشان طلایی (Gold)',
            retailersCount: 14,
            totalCreditCapToman: 14000000000,
            utilizedCreditToman: 9800000000,
            utilizationPercent: 70.0,
            totalGoldDebtGrams: 410.2,
            collateralCoveragePercent: 130.0,
            riskStatus: 'low'
          },
          {
            tier: 'SILVER',
            tierNameFa: 'طلافروشان استاندارد و فعال (Silver)',
            retailersCount: 20,
            totalCreditCapToman: 8000000000,
            utilizedCreditToman: 5900000000,
            utilizationPercent: 73.7,
            totalGoldDebtGrams: 340.8,
            collateralCoveragePercent: 112.0,
            riskStatus: 'moderate'
          },
          {
            tier: 'BRONZE',
            tierNameFa: 'اعضای تازه‌وارد و خرده‌فروشان آزمایشی (Bronze)',
            retailersCount: 8,
            totalCreditCapToman: 2000000000,
            utilizedCreditToman: 1450000000,
            utilizationPercent: 72.5,
            totalGoldDebtGrams: 149.1,
            collateralCoveragePercent: 104.0,
            riskStatus: 'moderate'
          }
        ],
        agingBuckets: [
          {
            bucketFa: 'سررسید عادی (کمتر از ۷ روز)',
            rangeDays: '0 - 7 روز',
            totalGrams: 980.4,
            totalToman: 6029460000,
            accountsCount: 34,
            riskWeightPercent: 5.0
          },
          {
            bucketFa: 'دوره تسویه جاری (۸ تا ۳۰ روز)',
            rangeDays: '8 - 30 روز',
            totalGrams: 340.1,
            totalToman: 2091615000,
            accountsCount: 11,
            riskWeightPercent: 15.0
          },
          {
            bucketFa: 'تأخیر ملایم (۳۱ تا ۶۰ روز)',
            rangeDays: '31 - 60 روز',
            totalGrams: 82.5,
            totalToman: 507375000,
            accountsCount: 3,
            riskWeightPercent: 40.0
          },
          {
            bucketFa: 'معوق پرریسک (بیش از ۶۰ روز)',
            rangeDays: '> 60 روز',
            totalGrams: 17.5,
            totalToman: 107625000,
            accountsCount: 1,
            riskWeightPercent: 85.0
          }
        ],
        totalCollateralBackedToman: 52400000000,
        totalUnhedgedExposureToman: 1240000000
      },
      metallurgyAndYield: {
        totalScrapIntakeGrams: 784.5,
        totalSmeltedIngotsGrams: 778.2,
        avgSmeltingLossPercent: 0.8,
        cpoRefurbishedPiecesCount: 34,
        cpoEconomicGainToman: 284000000,
        recycledGemstonesCount: 52,
        recycledGemstonesValuationToman: 183500000
      },
      categoryDistributions: [
        {
          categoryFa: 'النگو و دستبند النگویی ۱۸ عیار',
          sharePercent: 34.5,
          volumeGrams: 6365.5,
          valueToman: 39147825000,
          turnoverRateDays: 11.2
        },
        {
          categoryFa: 'سرویس و نیم‌ست عروس و مجلسی',
          sharePercent: 26.0,
          volumeGrams: 4797.2,
          valueToman: 29502780000,
          turnoverRateDays: 18.5
        },
        {
          categoryFa: 'گردنبند، زنجیر و مدال مدرن',
          sharePercent: 21.0,
          volumeGrams: 3874.6,
          valueToman: 23828790000,
          turnoverRateDays: 13.8
        },
        {
          categoryFa: 'انگشتر و پلاک زنانه و مردانه',
          sharePercent: 12.5,
          volumeGrams: 2306.3,
          valueToman: 14183745000,
          turnoverRateDays: 9.4
        },
        {
          categoryFa: 'شمش، مسکوک و قطعات آب‌شده استاندارد',
          sharePercent: 6.0,
          volumeGrams: 1107.1,
          valueToman: 6808665000,
          turnoverRateDays: 4.1
        }
      ],
      anomalyAlerts: [
        {
          id: 'anom-01',
          code: 'ANOM-K14-098',
          domain: 'K14 - اعتبار و ریسک',
          titleFa: 'نزدیک شدن به سقف اعتبار گالری گوهر شیراز',
          descriptionFa: 'میزان بهره‌برداری به ۹۱.۲٪ رسیده است. سفارش بعدی نیاز به تایید ۴چشم K04 یا افزایش وثیقه دارد.',
          severity: 'warning',
          detectedAtFa: 'امروز - ۱۰:۱۵',
          suggestedActionFa: 'ارسال هشدار پیامکی به بنکدار و تخصیص وثیقه تکمیلی',
          entityReference: 'ORG-SHZ-012',
          resolved: false
        },
        {
          id: 'anom-02',
          code: 'ANOM-K08-044',
          domain: 'K08 - عیارسنجی تأمین',
          titleFa: 'انحراف جزئی عیار محموله دستبند کارگاه اصفهان',
          descriptionFa: 'عیار سنجیده‌شده ۷۴۸.۸ در برابر عیار اسمی ۷۵۰.۰ است (انحراف ۱.۲ در هزار، درون تلرانس مجاز ولی نیازمند ثبت در تسویه K15).',
          severity: 'info',
          detectedAtFa: 'دیروز - ۱۶:۴۰',
          suggestedActionFa: 'اعمال ضریب وزنی در فاکتور نهایی تامین‌کننده',
          entityReference: 'RCV-1404-008',
          resolved: false
        },
        {
          id: 'anom-03',
          code: 'ANOM-K12-019',
          domain: 'K12 - عملیات میدانی',
          titleFa: 'طولانی شدن زمان گشت کیف امانی عامل شماره ۳',
          descriptionFa: 'کیف شماره BAG-03 بیش از ۳۶ ساعت بدون ورود به گاوصندوق شعبه در دست عامل بوده است.',
          severity: 'warning',
          detectedAtFa: 'امروز - ۰۸:۳۰',
          suggestedActionFa: 'الزام عامل به مراجعه به نزدیک‌ترین صندوق امانات جهت چک فیزیکی',
          entityReference: 'BAG-03 / AGT-003',
          resolved: false
        }
      ],
      scenarios: [
        {
          id: 'scen-01',
          titleFa: 'جهش ۱۰ درصدی مظنه طلا (سناریوی تورمی)',
          goldPriceChangePercent: 10,
          simulatedSpotPriceToman: 6765000,
          projectedPortfolioValuationToman: 124819323750,
          deltaValuationToman: 11347211250,
          retailerMarginCallsEstimatedCount: 3,
          buybackSurgeRiskFa: 'moderate',
          summaryFa: 'ارزش دارایی طلایی سامانه ۱۱.۳ میلیارد تومان افزایش می‌یابد؛ اما ۳ بنکدار ممکن است به سقف اعتباری برسند.'
        },
        {
          id: 'scen-02',
          titleFa: 'کاهش ۱۰ درصدی مظنه طلا (سناریوی اصلاح نرخ)',
          goldPriceChangePercent: -10,
          simulatedSpotPriceToman: 5535000,
          projectedPortfolioValuationToman: 102124901250,
          deltaValuationToman: -11347211250,
          retailerMarginCallsEstimatedCount: 0,
          buybackSurgeRiskFa: 'high',
          summaryFa: 'موج درخواست بازخرید مصرف‌کنندگان افزایش یافته و فرصت خرید ارزان برای سبد CPO و کوره ذوب K20 ایجاد می‌شود.'
        },
        {
          id: 'scen-03',
          titleFa: 'پیک تقاضای نوروزی / روز مادر (+۴۰٪ حجم سفارشات)',
          goldPriceChangePercent: 0,
          simulatedSpotPriceToman: 6150000,
          projectedPortfolioValuationToman: 113472112500,
          deltaValuationToman: 0,
          retailerMarginCallsEstimatedCount: 8,
          buybackSurgeRiskFa: 'low',
          summaryFa: 'سرعت گردش موجودی از ۱۴ روز به ۶ روز کاهش یافته و نیاز به تخصیص سریع شمش‌های K09 به خطوط ساخت K07 خواهد بود.'
        }
      ],
      lastUpdatedFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۵۰'
    };
  }

  public getData(): BiDataPayload {
    return this.data;
  }

  public resolveAnomaly(anomalyId: string): boolean {
    const alert = this.data.anomalyAlerts.find(a => a.id === anomalyId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }
}

export const biStorage = new BiStorageEngine();
