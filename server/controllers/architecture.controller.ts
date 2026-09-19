/**
 * Didar Gold Platform - Layer 2: API / Controller Layer
 * Multi-Tier Architecture Controller
 * 
 * Exposes live health and telemetry of the 5-layer pipeline:
 * Frontend -> API/Controller -> Business/Service -> Data Access/Repository -> Database
 */

import { Request, Response } from 'express';
import { architectureService } from '../services/architecture.service.js';

export class ArchitectureController {
  public static async inspect(req: Request, res: Response): Promise<void> {
    try {
      const report = await architectureService.inspectAllLayers();
      res.json({
        success: true,
        data: report
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'خطا در ارزیابی لایه‌های معماری سامانه',
        error: error.message
      });
    }
  }
}
