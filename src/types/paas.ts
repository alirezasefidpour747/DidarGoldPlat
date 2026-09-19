/**
 * Didar Gold Platform - System & PaaS Layer Types
 * Platform as a Service (PaaS) foundation layer providing:
 * 1. Master Data Management (MDM)
 * 2. Enterprise Event Bus & EventMesh
 * 3. Identity, IAM & RBAC Security Control
 * 4. API Gateway & Microservice Routing
 * 5. Background Workers & Cron Scheduler
 * 6. ACID Storage Engine & System Telemetry
 */

export type PaasServiceStatus = 'operational' | 'degraded' | 'maintenance' | 'offline';

export interface PaasServiceNode {
  id: string;
  nameFa: string;
  nameEn: string;
  category: 'core_platform' | 'integration' | 'security' | 'storage' | 'scheduler';
  status: PaasServiceStatus;
  version: string;
  uptimePercent: number;
  latencyMs: number;
  descriptionFa: string;
  activeEndpointsCount: number;
  lastHeartbeatFa: string;
}

export interface EventBusTopic {
  id: string;
  topic: string;
  categoryFa: string;
  subscribersCount: number;
  targetDomains: string[];
  totalDispatched24h: number;
  avgLatencyMs: number;
  lastEventTimestampFa: string;
}

export interface EventBusMessage {
  id: string;
  eventId: string;
  topic: string;
  sourceDomain: string;
  targetDomains: string[];
  payloadSummaryFa: string;
  timestampFa: string;
  status: 'delivered' | 'processing' | 'failed' | 'retrying';
  deliveryLatencyMs: number;
  integritySignature: string;
}

export interface ApiGatewayRoute {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
  targetDomain: string;
  descriptionFa: string;
  rateLimitPerMin: number;
  avgLatencyMs: number;
  requestsLastHour: number;
  successRatePercent: number;
  authRequired: boolean;
}

export interface BackgroundWorkerJob {
  id: string;
  nameFa: string;
  nameEn: string;
  schedule: string;
  targetDomain: string;
  status: 'running' | 'idle' | 'failed' | 'scheduled';
  lastRunFa: string;
  nextRunFa: string;
  durationMs: number;
  itemsProcessed: number;
  successRate: number;
}

export interface StorageEngineTelemetry {
  engineType: string;
  persistenceMode: string;
  dataDirectory: string;
  backupDirectory: string;
  totalCollections: number;
  totalRecordsCount: number;
  diskUsageBytes: number;
  diskUsageFormatted: string;
  walStatus: 'active' | 'synced';
  lastSnapshotTimestampFa: string;
  vendorLockIn: false;
  acidCompliance: boolean;
  activeLocksCount: number;
}

export interface PaasDataPayload {
  summary: {
    systemHealthScore: number;
    activeServicesCount: number;
    totalServicesCount: number;
    totalEventsDispatched24h: number;
    avgGatewayLatencyMs: number;
    activeWorkersCount: number;
    storageEngineStatus: 'healthy' | 'optimal';
    systemLayerVersion: string;
    environment: string;
    lastTelemetrySyncFa: string;
  };
  services: PaasServiceNode[];
  eventBus: {
    totalTopics: number;
    activeSubscribers: number;
    topics: EventBusTopic[];
    recentEvents: EventBusMessage[];
  };
  apiGateway: {
    totalRoutes: number;
    totalRequests24h: number;
    avgLatencyMs: number;
    routes: ApiGatewayRoute[];
  };
  workers: BackgroundWorkerJob[];
  storage: StorageEngineTelemetry;
}
