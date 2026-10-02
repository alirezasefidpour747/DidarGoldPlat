/**
 * Architecture inventory.
 *
 * This endpoint describes code layers and locally observable storage facts. It
 * is not a readiness check and does not certify K01-K20 or external services.
 */

import { databaseEngine } from '../database/database.engine.js';
import { checkDatabaseHealth } from '../lib/database.js';

export interface LayerInspectionReport {
  layerNumber: 1 | 2 | 3 | 4 | 5;
  name: string;
  nameFa: string;
  category: 'Frontend' | 'API / Controller' | 'Business / Service' | 'Data Access / Repository' | 'Database';
  status: 'operational' | 'degraded';
  latencyMs: number;
  componentsCount: number;
  descriptionFa: string;
  technologies: string[];
  metrics: Record<string, string | number | boolean | null>;
}

export interface ArchitectureInspectionResponse {
  timestamp: string;
  overallHealthScore: null;
  assessment: 'informational_only';
  flowDirection: 'Frontend -> API/Controller -> Business/Service -> Data Access/Repository -> Database';
  layers: LayerInspectionReport[];
}

export class ArchitectureService {
  public async inspectAllLayers(): Promise<ArchitectureInspectionResponse> {
    const storage = databaseEngine.getTelemetry();
    const postgresql = await checkDatabaseHealth();

    const layers: LayerInspectionReport[] = [
      {
        layerNumber: 1,
        name: 'Frontend Layer',
        nameFa: 'لایه رابط کاربری',
        category: 'Frontend',
        status: 'operational',
        latencyMs: 0,
        componentsCount: 0,
        descriptionFa: 'موجودی کد React/Vite؛ سلامت مرورگر در این نقطه بررسی نمی‌شود.',
        technologies: ['React', 'Vite', 'TypeScript'],
        metrics: { runtimeVerified: false }
      },
      {
        layerNumber: 2,
        name: 'API / Controller Layer',
        nameFa: 'لایه API و کنترلر',
        category: 'API / Controller',
        status: 'operational',
        latencyMs: 0,
        componentsCount: 0,
        descriptionFa: 'فرآیند Express پاسخ‌گو است؛ احراز هویت، RBAC و Rate Limit هنوز پیاده‌سازی نشده‌اند.',
        technologies: ['Express'],
        metrics: { authentication: 'not_implemented', rbacEnforcement: 'not_implemented', rateLimiting: 'not_implemented' }
      },
      {
        layerNumber: 3,
        name: 'Business / Service Layer',
        nameFa: 'لایه خدمات دامنه',
        category: 'Business / Service',
        status: 'degraded',
        latencyMs: 0,
        componentsCount: 0,
        descriptionFa: 'ماژول‌های نمایشی در حافظه موجودند؛ سلامت K01 تا K20 در این endpoint بررسی نمی‌شود.',
        technologies: ['In-process domain services'],
        metrics: { kernelsVerified: false, externalIntegrationsVerified: false }
      },
      {
        layerNumber: 4,
        name: 'Data Access / Repository Layer',
        nameFa: 'لایه دسترسی به داده',
        category: 'Data Access / Repository',
        status: 'degraded',
        latencyMs: 0,
        componentsCount: 0,
        descriptionFa: 'K01 از repository و تراکنش PostgreSQL استفاده می‌کند؛ K02 تا K20 هنوز مهاجرت نشده‌اند.',
        technologies: ['Drizzle ORM', 'PostgreSQL for K01', 'Legacy memory/JSON for K02-K20'],
        metrics: { atomicTransactionsSupportedForK01: true, postgresqlImplementedForK01: true, k02ToK20Migrated: false }
      },
      {
        layerNumber: 5,
        name: 'Storage Layer',
        nameFa: 'لایه ذخیره‌سازی محلی',
        category: 'Database',
        status: postgresql.ready ? 'operational' : 'degraded',
        latencyMs: postgresql.latencyMs,
        componentsCount: storage.totalCollections,
        descriptionFa: 'PostgreSQL سیستم ثبت K01 است؛ فایل/حافظه برای K02 تا K20 همچنان مانع آمادگی تولید است.',
        technologies: ['PostgreSQL 16', 'Local JSON files for legacy domains'],
        metrics: {
          engine: storage.engineType,
          totalCollections: storage.totalCollections,
          totalRecords: storage.totalRecordsCount,
          diskUsage: storage.diskUsageFormatted,
          walStatus: storage.walStatus,
          postgresqlConnectivity: postgresql.status,
          postgresqlConnectivityVerified: postgresql.connectivityVerified,
          scope: 'K01_only'
        }
      }
    ];

    return {
      timestamp: new Date().toISOString(),
      overallHealthScore: null,
      assessment: 'informational_only',
      flowDirection: 'Frontend -> API/Controller -> Business/Service -> Data Access/Repository -> Database',
      layers
    };
  }
}

export const architectureService = new ArchitectureService();
