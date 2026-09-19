/**
 * Didar Gold Platform - Layer 2: API / Controller Layer
 * RBAC & IAM Controller
 * 
 * Handles authentication contexts, workspace access, and permission queries.
 */

import { Request, Response } from 'express';
import { rbacService } from '../services/rbac.service.js';

export class RbacController {
  public static async getRbacState(req: Request, res: Response): Promise<void> {
    try {
      const data = rbacService.getFullRbacState();
      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'خطا در بارگذاری اطلاعات امنیتی و سطوح دسترسی',
        error: error.message
      });
    }
  }

  public static async getMyWorkspaces(req: Request, res: Response): Promise<void> {
    try {
      const workspaces = rbacService.getWorkspaces();
      res.json({
        success: true,
        data: workspaces
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت فضاهای کاری کاربر',
        error: error.message
      });
    }
  }
}
