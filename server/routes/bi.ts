/**
 * Didar Gold Platform - Layer 2: API / Controller Router
 * Maps incoming HTTP routes to BiController
 */

import { Router } from 'express';
import { BiController } from '../controllers/bi.controller.js';

export const biRouter = Router();

// GET /api/admin/bi - Comprehensive cross-domain executive BI metrics
biRouter.get('/', BiController.getExecutiveMetrics);

// POST /api/admin/bi/anomalies/:id/resolve - Mark an anomaly alert as handled
biRouter.post('/anomalies/:id/resolve', BiController.resolveAnomaly);

// POST /api/admin/bi/scenarios/:scenarioId/simulate - Run econometric what-if projection
biRouter.post('/scenarios/:scenarioId/simulate', BiController.simulateScenario);

