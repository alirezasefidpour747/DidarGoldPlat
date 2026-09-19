/**
 * Didar Gold Platform - Layer 2: API / Controller Layer
 * Master Data Management (MDM) Controller
 * 
 * Handles incoming HTTP requests, validates DTOs, and delegates to MasterDataService.
 */

import { Request, Response } from 'express';
import { masterDataService } from '../services/masterdata.service.js';

export class MasterDataController {
  public static async getFullCatalog(req: Request, res: Response): Promise<void> {
    try {
      const data = masterDataService.getFullCatalog();
      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'خطا در بارگذاری اطلاعات پایه (MDM)',
        error: error.message
      });
    }
  }

  public static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = masterDataService.getCategories();
      res.json({
        success: true,
        data: categories
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت فهرست دسته‌بندی‌های داده پایه',
        error: error.message
      });
    }
  }

  public static async getItems(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const items = masterDataService.getItems(categoryId);
      res.json({
        success: true,
        data: items
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت آیتم‌های دسته‌بندی',
        error: error.message
      });
    }
  }

  public static async createItem(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const itemData = req.body;
      const created = masterDataService.addItem(categoryId, itemData);
      res.status(201).json({
        success: true,
        data: created,
        message: 'آیتم جدید با موفقیت به واژه‌نامه پایه اضافه شد.'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'خطا در ثبت آیتم داده پایه'
      });
    }
  }

  public static async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = masterDataService.updateItem(id, updates);
      res.json({
        success: true,
        data: updated,
        message: 'تغییرات آیتم داده پایه با موفقیت ذخیره شد.'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'خطا در به‌روزرسانی آیتم'
      });
    }
  }

  public static async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const ok = masterDataService.removeItem(id);
      res.json({
        success: ok,
        message: 'آیتم مورد نظر با موفقیت حذف گردید.'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'خطا در حذف آیتم'
      });
    }
  }
}
