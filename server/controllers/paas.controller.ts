/**
 * Didar Gold Platform - Layer 2: API / Controller Layer
 * PaaS Controller
 * 
 * Handles incoming HTTP requests, validates DTOs, and delegates to PaasService.
 */

import { Request, Response } from 'express';
import { paasService } from '../services/paas.service.js';

export class PaasController {
  public static async getTelemetry(req: Request, res: Response): Promise<void> {
    try {
      const data = paasService.getTelemetry();
      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت تله‌متری لایه PaaS',
        error: error.message
      });
    }
  }

  public static async dispatchEvent(req: Request, res: Response): Promise<void> {
    try {
      const { topic, sourceDomain, payloadSummaryFa } = req.body;
      if (!topic || !sourceDomain || !payloadSummaryFa) {
        res.status(400).json({
          success: false,
          message: 'فیلدهای topic, sourceDomain و payloadSummaryFa الزامی هستند.'
        });
        return;
      }

      const event = paasService.dispatchEvent({
        topic,
        sourceDomain,
        payloadSummaryFa
      });

      res.json({
        success: true,
        data: event,
        message: 'رویداد با موفقیت در گذرگاه رویدادهای سازمانی (EventMesh) منتشر شد.'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'خطا در انتشار رویداد گذرگاه',
        error: error.message
      });
    }
  }
}
