/**
 * Didar Gold Platform - Business Intelligence (BI) Layer Types
 * Cross-domain executive analytics, real-time gold liquidity pipeline,
 * dual-ledger exposure heatmaps, predictive scenario simulators, and anomaly sentinels.
 */

export interface GoldCirculationPipelineNode {
  id: string;
  stageFa: string;
  stageEn: string;
  domainSource: string;
  volumeGrams750: number;
  valuationToman: number;
  activeItemsCount: number;
  velocityFa: string;
  healthStatus: 'optimal' | 'normal' | 'attention';
  flowRatioPercent: number;
}

export interface RetailerTierExposure {
  tier: 'VIP' | 'GOLD' | 'SILVER' | 'BRONZE';
  tierNameFa: string;
  retailersCount: number;
  totalCreditCapToman: number;
  utilizedCreditToman: number;
  utilizationPercent: number;
  totalGoldDebtGrams: number;
  collateralCoveragePercent: number;
  riskStatus: 'low' | 'moderate' | 'high';
}

export interface AgingOverdueBucket {
  bucketFa: string;
  rangeDays: string;
  totalGrams: number;
  totalToman: number;
  accountsCount: number;
  riskWeightPercent: number;
}

export interface BiAnomalyAlert {
  id: string;
  code: string;
  domain: string;
  titleFa: string;
  descriptionFa: string;
  severity: 'critical' | 'warning' | 'info';
  detectedAtFa: string;
  suggestedActionFa: string;
  entityReference: string;
  resolved: boolean;
}

export interface PredictiveScenarioSimulation {
  id: string;
  titleFa: string;
  goldPriceChangePercent: number;
  simulatedSpotPriceToman: number;
  projectedPortfolioValuationToman: number;
  deltaValuationToman: number;
  retailerMarginCallsEstimatedCount: number;
  buybackSurgeRiskFa: 'low' | 'moderate' | 'high' | 'severe';
  summaryFa: string;
}

export interface CategoryDistribution {
  categoryFa: string;
  sharePercent: number;
  volumeGrams: number;
  valueToman: number;
  turnoverRateDays: number;
}

export interface BiDataPayload {
  executiveCockpit: {
    circulatingGoldGrams750: number;
    totalFiatValuationToman: number;
    benchmarkGoldRateGram750: number;
    benchmarkTimestampFa: string;
    vaultReserveGrams: number;
    fieldAgentBagsGrams: number;
    retailerConsignedGrams: number;
    unsettledGoldReceivablesGrams: number;
    unsettledFiatReceivablesToman: number;
    overallCollateralCoveragePercent: number;
    settlementNettingVelocityHours: number;
    activeB2BRetailersCount: number;
    cpoAndRecyclingYieldPercent: number;
    ecosystemHealthIndex: number; // 0 to 100
  };
  circulationPipeline: GoldCirculationPipelineNode[];
  exposureMatrix: {
    tiers: RetailerTierExposure[];
    agingBuckets: AgingOverdueBucket[];
    totalCollateralBackedToman: number;
    totalUnhedgedExposureToman: number;
  };
  metallurgyAndYield: {
    totalScrapIntakeGrams: number;
    totalSmeltedIngotsGrams: number;
    avgSmeltingLossPercent: number;
    cpoRefurbishedPiecesCount: number;
    cpoEconomicGainToman: number;
    recycledGemstonesCount: number;
    recycledGemstonesValuationToman: number;
  };
  categoryDistributions: CategoryDistribution[];
  anomalyAlerts: BiAnomalyAlert[];
  scenarios: PredictiveScenarioSimulation[];
  lastUpdatedFa: string;
}
