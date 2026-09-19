/**
 * Didar Gold Platform - PaaS Layer Storage & Services Engine
 * Manages PaaS infrastructure components, EventMesh telemetry, API Gateway stats,
 * background workers, and self-hosted storage metrics.
 */

import { PaasDataPayload, EventBusMessage } from '../src/types/paas.js';

class PaasStorageEngine {
  private data: PaasDataPayload;

  constructor() {
    this.data = {
      summary: {
        systemHealthScore: 99.8,
        activeServicesCount: 6,
        totalServicesCount: 6,
        totalEventsDispatched24h: 14820,
        avgGatewayLatencyMs: 12.4,
        activeWorkersCount: 5,
        storageEngineStatus: 'optimal',
        systemLayerVersion: 'PaaS v2.4-enterprise',
        environment: 'Production-Hybrid (Self-Hosted ACID + Postgres Interface)',
        lastTelemetrySyncFa: '۱۴۰۴/۱۲/۲۸ - لحظه‌ای'
      },
      services: [
        {
          id: 'svc-mdm',
          nameFa: 'سامانه مدیریت داده‌های پایه (MDM)',
          nameEn: 'Master Data Management Service',
          category: 'core_platform',
          status: 'operational',
          version: '1.4.2',
          uptimePercent: 100,
          latencyMs: 4.2,
          descriptionFa: 'واژه‌نامه‌های پایه، عیارها، علل مرجوعی، کدهای مالیاتی مودیان و انواع تضامین',
          activeEndpointsCount: 8,
          lastHeartbeatFa: 'هم‌اکنون (فعال)'
        },
        {
          id: 'svc-eventbus',
          nameFa: 'گذرگاه رویدادهای سازمانی (EventMesh Bus)',
          nameEn: 'Enterprise EventMesh Bus',
          category: 'core_platform',
          status: 'operational',
          version: '2.1.0',
          uptimePercent: 99.99,
          latencyMs: 8.5,
          descriptionFa: 'توزیع رویدادهای ناهمگام بین دامنه‌های K01 تا K20 با تضمین تحویل حداقل یک‌بار (At-Least-Once)',
          activeEndpointsCount: 14,
          lastHeartbeatFa: 'هم‌اکنون (فعال)'
        },
        {
          id: 'svc-iam-rbac',
          nameFa: 'موتور امنیت، هویت و تفکیک وظایف (IAM & RBAC)',
          nameEn: 'IAM & RBAC Security Engine',
          category: 'security',
          status: 'operational',
          version: '1.8.0',
          uptimePercent: 100,
          latencyMs: 6.1,
          descriptionFa: 'احراز هویت توکن‌های امن، ممیزی SoD، مدیریت کاتالوگ نقش‌ها و دسترسی‌های تجاری',
          activeEndpointsCount: 12,
          lastHeartbeatFa: 'هم‌اکنون (فعال)'
        },
        {
          id: 'svc-api-gateway',
          nameFa: 'درگاه یکپارچه خدمات وب و مسیریابی (API Gateway)',
          nameEn: 'Unified API Gateway & Mesh',
          category: 'integration',
          status: 'operational',
          version: '3.0.1',
          uptimePercent: 99.98,
          latencyMs: 12.4,
          descriptionFa: 'پایش و هدایت درخواست‌ها به هسته‌های K01 تا K20 با نرخ‌گذاری Rate-Limiting و کش حافظه‌ای',
          activeEndpointsCount: 68,
          lastHeartbeatFa: 'هم‌اکنون (فعال)'
        },
        {
          id: 'svc-workers',
          nameFa: 'زمان‌بند و پردازشگر کارهای پس‌زمینه (Workers & Crons)',
          nameEn: 'Background Workers & Cron Scheduler',
          category: 'scheduler',
          status: 'operational',
          version: '1.3.4',
          uptimePercent: 99.95,
          latencyMs: 15.0,
          descriptionFa: 'دریافت نرخ مظنه لحظه‌ای طلا، انطباق زرین K16، ممیزی سقف اعتبار K14 و بایگانی دوره‌ای',
          activeEndpointsCount: 6,
          lastHeartbeatFa: 'هم‌اکنون (فعال)'
        },
        {
          id: 'svc-storage',
          nameFa: 'موتور مستقل ذخیره‌سازی داده (ACID Storage Engine)',
          nameEn: 'Self-Hosted ACID Storage Engine',
          category: 'storage',
          status: 'operational',
          version: '2.0.0',
          uptimePercent: 100,
          latencyMs: 2.8,
          descriptionFa: 'ذخیره‌سازی دیسکی اتمیک با قفل‌های همروندی، بدون وابستگی و بدون قفل‌شدگی با کلود خارجی',
          activeEndpointsCount: 10,
          lastHeartbeatFa: 'هم‌اکنون (فعال)'
        }
      ],
      eventBus: {
        totalTopics: 18,
        activeSubscribers: 42,
        topics: [
          {
            id: 'top-01',
            topic: 'didar.k08.assay.completed',
            categoryFa: 'پذیرش و عیارسنجی طلا',
            subscribersCount: 4,
            targetDomains: ['K09', 'K15', 'K06'],
            totalDispatched24h: 340,
            avgLatencyMs: 6.4,
            lastEventTimestampFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۳۰'
          },
          {
            id: 'top-02',
            topic: 'didar.k10.order.pod_confirmed',
            categoryFa: 'سفارش و اثبات تحویل POD',
            subscribersCount: 5,
            targetDomains: ['K09', 'K13', 'K15', 'K16', 'K17'],
            totalDispatched24h: 890,
            avgLatencyMs: 8.1,
            lastEventTimestampFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۴۵'
          },
          {
            id: 'top-03',
            topic: 'didar.k13.rates.spot_updated',
            categoryFa: 'مظنه و نرخ مرجع طلا',
            subscribersCount: 9,
            targetDomains: ['K05', 'K10', 'K13', 'K14', 'K15', 'K19', 'K20'],
            totalDispatched24h: 2880,
            avgLatencyMs: 3.2,
            lastEventTimestampFa: 'هم‌اکنون'
          },
          {
            id: 'top-04',
            topic: 'didar.k14.credit.exposure_alert',
            categoryFa: 'سقف اعتبار و ریسک باز',
            subscribersCount: 3,
            targetDomains: ['K04', 'K10', 'K11'],
            totalDispatched24h: 42,
            avgLatencyMs: 5.0,
            lastEventTimestampFa: '۱۴۰۴/۱۲/۲۸ - ۱۰:۱۵'
          },
          {
            id: 'top-05',
            topic: 'didar.k16.zarrin.reconciliation_matched',
            categoryFa: 'تطبیق دفتر کل زرین',
            subscribersCount: 3,
            targetDomains: ['K15', 'K16A', 'K04'],
            totalDispatched24h: 620,
            avgLatencyMs: 14.2,
            lastEventTimestampFa: '۱۴۰۴/۱۲/۲۸ - ۰۹:۰۰'
          },
          {
            id: 'top-06',
            topic: 'didar.k19.buyback.settled',
            categoryFa: 'تسویه بازخرید طلا',
            subscribersCount: 4,
            targetDomains: ['K15', 'K16', 'K20'],
            totalDispatched24h: 115,
            avgLatencyMs: 7.8,
            lastEventTimestampFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۱۰'
          },
          {
            id: 'top-07',
            topic: 'didar.k20.smelting.bar_cast',
            categoryFa: 'ریخته‌گری شمش آب‌شده بازیافتی',
            subscribersCount: 3,
            targetDomains: ['K09', 'K07', 'K15'],
            totalDispatched24h: 28,
            avgLatencyMs: 9.3,
            lastEventTimestampFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۳۰'
          }
        ],
        recentEvents: [
          {
            id: 'evt-101',
            eventId: 'EVT-1404-12-28-0994',
            topic: 'didar.k20.smelting.bar_cast',
            sourceDomain: 'K20',
            targetDomains: ['K09', 'K15'],
            payloadSummaryFa: 'شمش آب‌شده MLT-1404-009 به وزن ۱۳۴.۱۲ گرم ریخته‌گری و عیار سنجیده شد',
            timestampFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۳۰',
            status: 'delivered',
            deliveryLatencyMs: 7,
            integritySignature: 'sha256-b087a19283f60048e9d2b7194bce'
          },
          {
            id: 'evt-102',
            eventId: 'EVT-1404-12-28-0993',
            topic: 'didar.k10.order.pod_confirmed',
            sourceDomain: 'K10',
            targetDomains: ['K09', 'K15', 'K16'],
            payloadSummaryFa: 'اثبات تحویل POD سفارش ORD-1404-001 توسط بنکداری با امضای دیجیتال ثبت شد',
            timestampFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۲۵',
            status: 'delivered',
            deliveryLatencyMs: 9,
            integritySignature: 'sha256-8a9012cdfe3820a10984ba102948'
          },
          {
            id: 'evt-103',
            eventId: 'EVT-1404-12-28-0992',
            topic: 'didar.k19.buyback.settled',
            sourceDomain: 'K19',
            targetDomains: ['K15', 'K20'],
            payloadSummaryFa: 'تسویه بازخرید النگوی یزدی BBK-1404-002 و انتقال قطعه به سبد احیای CPO',
            timestampFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۱۰',
            status: 'delivered',
            deliveryLatencyMs: 6,
            integritySignature: 'sha256-4c8d19762fa3901bce74a3821094'
          },
          {
            id: 'evt-104',
            eventId: 'EVT-1404-12-28-0991',
            topic: 'didar.k13.rates.spot_updated',
            sourceDomain: 'K13',
            targetDomains: ['K05', 'K10', 'K14', 'K15', 'K19', 'K20'],
            payloadSummaryFa: 'مظنه طلای ۱۸ عیار اتحادیه روی ۶،۱۵۰،۰۰۰ تومان تثبیت و بازنشر شد',
            timestampFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۰۲',
            status: 'delivered',
            deliveryLatencyMs: 4,
            integritySignature: 'sha256-102948ba9012cdfe3820a10984ba'
          },
          {
            id: 'evt-105',
            eventId: 'EVT-1404-12-28-0990',
            topic: 'didar.k14.credit.exposure_alert',
            sourceDomain: 'K14',
            targetDomains: ['K04', 'K10'],
            payloadSummaryFa: 'هشدار بهره‌برداری ۹۱٪ از سقف اعتباری طلافروشی زمرد شیراز',
            timestampFa: '۱۴۰۴/۱۲/۲۸ - ۱۰:۱۵',
            status: 'delivered',
            deliveryLatencyMs: 8,
            integritySignature: 'sha256-e99a818c72834e9d72b64bfa1928'
          }
        ]
      },
      apiGateway: {
        totalRoutes: 28,
        totalRequests24h: 124500,
        avgLatencyMs: 12.4,
        routes: [
          {
            id: 'rt-01',
            path: '/api/admin/kernel/k01',
            method: 'ALL',
            targetDomain: 'K01 - People & Orgs',
            descriptionFa: 'مدیریت موجودیت‌ها، اشخاص و عضویت‌ها',
            rateLimitPerMin: 1200,
            avgLatencyMs: 8.5,
            requestsLastHour: 1420,
            successRatePercent: 99.98,
            authRequired: true
          },
          {
            id: 'rt-02',
            path: '/api/admin/kernel/k09',
            method: 'ALL',
            targetDomain: 'K09 - Vaults & Bags',
            descriptionFa: 'مدیریت خزانه‌ها و کیف‌های هوشمند',
            rateLimitPerMin: 800,
            avgLatencyMs: 7.2,
            requestsLastHour: 2100,
            successRatePercent: 100,
            authRequired: true
          },
          {
            id: 'rt-03',
            path: '/api/admin/kernel/k13',
            method: 'GET',
            targetDomain: 'K13 - Gold Rates',
            descriptionFa: 'استعلام مظنه لحظه‌ای طلا و جدول کارمزد',
            rateLimitPerMin: 3000,
            avgLatencyMs: 3.1,
            requestsLastHour: 4900,
            successRatePercent: 100,
            authRequired: false
          },
          {
            id: 'rt-04',
            path: '/api/admin/kernel/k15',
            method: 'ALL',
            targetDomain: 'K15 - Dual Ledger',
            descriptionFa: 'اسناد دفتر دوگانه طلایی و ریالی',
            rateLimitPerMin: 1000,
            avgLatencyMs: 11.2,
            requestsLastHour: 1850,
            successRatePercent: 99.95,
            authRequired: true
          },
          {
            id: 'rt-05',
            path: '/api/admin/kernel/k16',
            method: 'ALL',
            targetDomain: 'K16 - Settlement & Zarrin',
            descriptionFa: 'وب‌سرویس تسویه و انطباق اسناد با زرین',
            rateLimitPerMin: 600,
            avgLatencyMs: 18.4,
            requestsLastHour: 980,
            successRatePercent: 99.9,
            authRequired: true
          },
          {
            id: 'rt-06',
            path: '/api/admin/kernel/k19',
            method: 'ALL',
            targetDomain: 'K19 - Buyback & Trade-In',
            descriptionFa: 'درخواست‌های بازخرید و معاوضه طلا',
            rateLimitPerMin: 600,
            avgLatencyMs: 9.1,
            requestsLastHour: 640,
            successRatePercent: 100,
            authRequired: true
          },
          {
            id: 'rt-07',
            path: '/api/admin/kernel/k20',
            method: 'ALL',
            targetDomain: 'K20 - Refurbish & Melt',
            descriptionFa: 'عملیات احیای CPO و بوته‌های ذوب کوره',
            rateLimitPerMin: 600,
            avgLatencyMs: 10.4,
            requestsLastHour: 520,
            successRatePercent: 100,
            authRequired: true
          }
        ]
      },
      workers: [
        {
          id: 'wrk-01',
          nameFa: 'دریافت‌کننده خودکار مظنه طلا (Rate Poller)',
          nameEn: 'Live Gold Rate Poller',
          schedule: 'هر ۶۰ ثانیه ( */1 * * * * )',
          targetDomain: 'K13',
          status: 'running',
          lastRunFa: 'لحظاتی قبل',
          nextRunFa: '۵۰ ثانیه بعد',
          durationMs: 240,
          itemsProcessed: 1440,
          successRate: 100
        },
        {
          id: 'wrk-02',
          nameFa: 'تطبیق‌گر اسناد با سامانه زرین (Zarrin Reconciler)',
          nameEn: 'Zarrin ERP Sync Worker',
          schedule: 'هر ۱۵ دقیقه ( */15 * * * * )',
          targetDomain: 'K16B',
          status: 'running',
          lastRunFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۱۵',
          nextRunFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۳۰',
          durationMs: 820,
          itemsProcessed: 48,
          successRate: 98.5
        },
        {
          id: 'wrk-03',
          nameFa: 'پایشگر سقف و ریسک اعتباری (Exposure Watchdog)',
          nameEn: 'Credit Exposure Monitor',
          schedule: 'پیوسته رویدادمحور (Event-Driven)',
          targetDomain: 'K14',
          status: 'running',
          lastRunFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۲۵',
          nextRunFa: 'در انتظار رویداد جدید',
          durationMs: 110,
          itemsProcessed: 320,
          successRate: 100
        },
        {
          id: 'wrk-04',
          nameFa: 'ممیزی مانده انبار و کیف‌های عاملان (Inventory Auditor)',
          nameEn: 'Vault & Custody Auditor',
          schedule: 'هر ساعت ( 0 * * * * )',
          targetDomain: 'K09 / K12',
          status: 'idle',
          lastRunFa: '۱۴۰۴/۱۲/۲۸ - ۱۱:۰۰',
          nextRunFa: '۱۴۰۴/۱۲/۲۸ - ۱۲:۰۰',
          durationMs: 640,
          itemsProcessed: 28,
          successRate: 100
        },
        {
          id: 'wrk-05',
          nameFa: 'تهیه نسخه پشتیبان اتمیک دیسک (ACID Snapshotter)',
          nameEn: 'Atomic Backup Snapshotter',
          schedule: 'هر ۶ ساعت ( 0 */6 * * * )',
          targetDomain: 'PaaS Core',
          status: 'idle',
          lastRunFa: '۱۴۰۴/۱۲/۲۸ - ۰۶:۰۰',
          nextRunFa: '۱۴۰۴/۱۲/۲۸ - ۱۲:۰۰',
          durationMs: 310,
          itemsProcessed: 1,
          successRate: 100
        }
      ],
      storage: {
        engineType: 'Independent ACID JSON Disk Volume Engine',
        persistenceMode: 'disk_volume_acid (Postgres Wire Protocol Compatible)',
        dataDirectory: './data',
        backupDirectory: './data/backups',
        totalCollections: 24,
        totalRecordsCount: 2840,
        diskUsageBytes: 4857200,
        diskUsageFormatted: '۴.۶ مگابایت',
        walStatus: 'synced',
        lastSnapshotTimestampFa: '۱۴۰۴/۱۲/۲۸ - ۰۶:۰۰',
        vendorLockIn: false,
        acidCompliance: true,
        activeLocksCount: 0
      }
    };
  }

  public getData(): PaasDataPayload {
    return this.data;
  }

  public dispatchSimulatedEvent(topic: string, sourceDomain: string, payloadSummaryFa: string): EventBusMessage {
    const newEvent: EventBusMessage = {
      id: `evt-${Date.now()}`,
      eventId: `EVT-1404-12-${Math.floor(1000 + Math.random() * 9000)}`,
      topic,
      sourceDomain,
      targetDomains: ['K09', 'K15', 'BI'],
      payloadSummaryFa,
      timestampFa: 'هم‌اکنون',
      status: 'delivered',
      deliveryLatencyMs: Math.floor(4 + Math.random() * 8),
      integritySignature: `sha256-${Math.random().toString(36).substring(2, 15)}`
    };

    this.data.eventBus.recentEvents.unshift(newEvent);
    if (this.data.eventBus.recentEvents.length > 20) {
      this.data.eventBus.recentEvents.pop();
    }
    this.data.summary.totalEventsDispatched24h += 1;
    return newEvent;
  }
}

export const paasStorage = new PaasStorageEngine();
