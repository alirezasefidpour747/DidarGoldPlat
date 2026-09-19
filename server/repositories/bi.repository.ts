/**
 * Didar Gold Platform - Layer 4: Data Access / Repository
 * BI Repository for Business Intelligence, Executive Metrics, Anomaly Alerts & Scenarios
 */

import { BaseRepository } from './base.repository.js';
import { biStorage } from '../storage-bi.js';
import { BiDataPayload, BiAnomalyAlert, GoldCirculationPipelineNode, PredictiveScenarioSimulation } from '../../src/types/bi.js';

export class BiRepository extends BaseRepository<BiDataPayload> {
  constructor() {
    super('bi_analytics');
  }

  public getFullBiData(): BiDataPayload {
    return biStorage.getData();
  }

  public getAnomalies(): BiAnomalyAlert[] {
    return biStorage.getData().anomalyAlerts;
  }

  public getAnomalyById(id: string): BiAnomalyAlert | null {
    const alerts = biStorage.getData().anomalyAlerts;
    return alerts.find(a => a.id === id) || null;
  }

  public updateAnomalyStatus(id: string, resolved: boolean): boolean {
    const success = biStorage.resolveAnomaly(id);
    if (success) {
      this.db.writeCollection('bi_analytics', biStorage.getData());
    }
    return success;
  }

  public getCirculationPipeline(): GoldCirculationPipelineNode[] {
    return biStorage.getData().circulationPipeline;
  }

  public getScenarios(): PredictiveScenarioSimulation[] {
    return biStorage.getData().scenarios;
  }

  public findAll(): BiDataPayload[] {
    return [biStorage.getData()];
  }

  public findById(id: string): BiDataPayload | null {
    return biStorage.getData();
  }

  public save(entity: BiDataPayload): BiDataPayload {
    this.db.writeCollection('bi_analytics', entity);
    return entity;
  }

  public deleteById(id: string): boolean {
    return false;
  }
}

export const biRepository = new BiRepository();
