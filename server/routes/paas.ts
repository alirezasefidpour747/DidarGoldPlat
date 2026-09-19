/**
 * Didar Gold Platform - Layer 2: API / Controller Router
 * Maps incoming HTTP routes to PaasController
 */

import { Router } from 'express';
import { PaasController } from '../controllers/paas.controller.js';

export const paasRouter = Router();

// GET /api/admin/paas - Telemetry & Status
paasRouter.get('/', PaasController.getTelemetry);

// POST /api/admin/paas/events/dispatch - Dispatch EventMesh message
paasRouter.post('/events/dispatch', PaasController.dispatchEvent);

