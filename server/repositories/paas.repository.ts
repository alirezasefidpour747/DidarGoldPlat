/**
 * Didar Gold Platform - Layer 4: Data Access / Repository
 * PaaS Repository for Platform as a Service, EventMesh, and Microservices Telemetry
 */

import { BaseRepository } from './base.repository.js';
import { paasStorage } from '../storage-paas.js';
import { PaasDataPayload, EventBusMessage, PaasServiceNode, ApiGatewayRoute, BackgroundWorkerJob } from '../../src/types/paas.js';

export class PaasRepository extends BaseRepository<PaasDataPayload> {
  constructor() {
    super('paas_telemetry');
  }

  public getFullTelemetry(): PaasDataPayload {
    return paasStorage.getData();
  }

  public getServices(): PaasServiceNode[] {
    return paasStorage.getData().services;
  }

  public getRecentEvents(): EventBusMessage[] {
    return paasStorage.getData().eventBus.recentEvents;
  }

  public getApiRoutes(): ApiGatewayRoute[] {
    return paasStorage.getData().apiGateway.routes;
  }

  public getWorkers(): BackgroundWorkerJob[] {
    return paasStorage.getData().workers;
  }

  public saveEvent(event: EventBusMessage): EventBusMessage {
    const data = paasStorage.getData();
    data.eventBus.recentEvents.unshift(event);
    if (data.eventBus.recentEvents.length > 25) {
      data.eventBus.recentEvents.pop();
    }
    data.summary.totalEventsDispatched24h += 1;
    // Persist to Layer 5 database
    this.db.writeCollection('paas_telemetry', data);
    return event;
  }

  public findAll(): PaasDataPayload[] {
    return [paasStorage.getData()];
  }

  public findById(id: string): PaasDataPayload | null {
    return paasStorage.getData();
  }

  public save(entity: PaasDataPayload): PaasDataPayload {
    this.db.writeCollection('paas_telemetry', entity);
    return entity;
  }

  public deleteById(id: string): boolean {
    return false;
  }
}

export const paasRepository = new PaasRepository();
