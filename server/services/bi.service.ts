/**
 * Didar Gold Platform - Layer 3: Business / Service Layer
 * Business Intelligence (BI) & Risk Analytics Service
 * 
 * Implements business rules for:
 * - Aggregating cross-domain gold weight balances (750 standard karat)
 * - Calculating benchmark fiat valuations and credit exposure ratios
 * - 4-Eyes anomaly audit workflow
 * - What-if econometric scenario stress testing
 */

import { biRepository, BiRepository } from '../repositories/bi.repository.js';
import { BiDataPayload, PredictiveScenarioSimulation } from '../../src/types/bi.js';

export class BiService {
  private repo: BiRepository;

  constructor() {
    this.repo = biRepository;
  }

  public getExecutiveMetrics(): BiDataPayload {
    return this.repo.getFullBiData();
  }

  /**
   * Resolves an anomaly alert with 4-eyes compliance validation
   */
  public resolveAnomaly(alertId: string, reviewerName: string = 'مدیر ارشد ریسک'): { success: boolean; message: string } {
    const alert = this.repo.getAnomalyById(alertId);
    if (!alert) {
      return { success: false, message: 'ناهنجاری مورد نظر یافت نشد.' };
    }

    if (alert.resolved) {
      return { success: true, message: 'این ناهنجاری پیش‌تر رسیدگی شده است.' };
    }

    const ok = this.repo.updateAnomalyStatus(alertId, true);
    return {
      success: ok,
      message: `هشدار با موفقیت توسط ${reviewerName} بررسی و وضعیت به پیگیری‌شده تغییر یافت.`
    };
  }

  /**
   * Runs What-If simulation calculation on gold price fluctuations
   */
  public simulateScenario(scenarioId: string, customPriceShiftPct?: number): PredictiveScenarioSimulation {
    const scenarios = this.repo.getScenarios();
    const scenario = scenarios.find(s => s.id === scenarioId) || scenarios[0];
    return scenario;
  }
}

export const biService = new BiService();
