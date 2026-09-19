/**
 * Didar Gold Platform - Layer 2: API / Controller Layer
 * Business Intelligence (BI) Controller
 * 
 * Handles incoming HTTP requests, validates parameters, and delegates to BiService.
 */

import { Request, Response } from 'express';
import { biService } from '../services/bi.service.js';

export class BiController {
  public static async getExecutiveMetrics(req: Request, res: Response): Promise<void> {
    try {
      const data = biService.getExecutiveMetrics();
      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'خطا در بارگذاری داده‌های هوش تجاری (BI)',
        error: error.message
      });
    }
  }

  public static async resolveAnomaly(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reviewer = (req.headers['x-actor-name'] as string) || 'مدیر ممیزی و ریسک دیدار';
      
      const result = biService.resolveAnomaly(id, reviewer);
      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.message
        });
        return;
      }

      res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'خطا در پردازش رسیدگی به ناهنجاری',
        error: error.message
      });
    }
  }

  public static async simulateScenario(req: Request, res: Response): Promise<void> {
    try {
      const { scenarioId } = req.params;
      const { priceShiftPct } = req.body;
      const simulation = biService.simulateScenario(scenarioId, priceShiftPct);

      res.json({
        success: true,
        data: simulation,
        message: 'شبیه‌سازی سناریوی اقتصادی با موفقیت محاسبه گردید.'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'خطا در اجرای شبیه‌سازی سناریو',
        error: error.message
      });
    }
  }
}
