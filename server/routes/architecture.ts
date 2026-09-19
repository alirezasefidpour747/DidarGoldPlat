/**
 * Didar Gold Platform - Layer 2: API / Controller Router
 * Maps incoming HTTP routes to ArchitectureController
 */

import { Router } from 'express';
import { ArchitectureController } from '../controllers/architecture.controller.js';

export const architectureRouter = Router();

// GET /api/admin/architecture - Inspect status & health across all 5 architectural tiers
architectureRouter.get('/', ArchitectureController.inspect);
