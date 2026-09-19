/**
 * Didar Gold Platform - Domain K04 API Router
 * Approvals, Four-Eyes Principle (SoD), Exceptions & Immutable Audit Logs
 */

import { Router, Request, Response } from 'express';
import { k04Storage } from '../storage-k04.js';
import { RbacService } from '../storage-rbac.js';

export const k04Router = Router();

// GET all K04 Domain Data
k04Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k04Storage.getK04Data();
    res.json({
      success: true,
      data
    });
  } catch (err: unknown) {
    console.error('Error fetching K04 data:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در بارگذاری اطلاعات دامنه تأییدات و حسابرسی (K04).'
    });
  }
});

// POST submit a new approval request
k04Router.post('/approvals/create', (req: Request, res: Response) => {
  try {
    const {
      category,
      title,
      description,
      urgency,
      goldWeightGrams,
      goldPurityCarat,
      financialValueIrr,
      partyNameFa,
      initiatorId,
      initiatorName,
      initiatorRoleFa
    } = req.body;

    if (!category || !title || !initiatorId) {
      return res.status(400).json({
        success: false,
        message: 'عنوان، دسته‌بندی و ثبت‌کننده درخواست الزامی است.'
      });
    }

    const newRequest = k04Storage.createApprovalRequest({
      category,
      title,
      description: description || '',
      urgency: urgency || 'normal',
      goldWeightGrams: Number(goldWeightGrams) || 0,
      goldPurityCarat: Number(goldPurityCarat) || 750,
      financialValueIrr: Number(financialValueIrr) || 0,
      partyNameFa: partyNameFa || 'بنکدار متقاضی',
      initiatorId,
      initiatorName: initiatorName || 'کاربر سامانه',
      initiatorRoleFa: initiatorRoleFa || 'متصدی'
    });

    res.json({
      success: true,
      data: newRequest,
      message: `درخواست تأیید با کد ${newRequest.requestCode} با موفقیت ثبت و وارد گردش‌کار شد.`
    });
  } catch (err: unknown) {
    console.error('Error creating approval request:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در ایجاد درخواست تأیید جدید.'
    });
  }
});

// POST approve a step (with Four-Eyes check)
k04Router.post('/approvals/:id/approve', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stepNumber, actorId, actorName, actorRoleFa, notes } = req.body;

    if (!stepNumber || !actorId) {
      return res.status(400).json({
        success: false,
        message: 'شماره مرحله و مشخصات تاییدکننده الزامی است.'
      });
    }

    const result = k04Storage.approveStep({
      requestId: id,
      stepNumber: Number(stepNumber),
      actorId,
      actorName: actorName || 'مدیر ارشد سامانه',
      actorRoleFa: actorRoleFa || 'مدیر ارشد',
      notes
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // If approval finalized, apply effect to RBAC role assignment if linked
    if (result.request && result.request.status === 'approved') {
      RbacService.applyApprovedAssignment(id, 'approved');
    }

    res.json(result);
  } catch (err: unknown) {
    console.error('Error approving request step:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت تایید مرحله درخواست.'
    });
  }
});

// POST reject an approval request
k04Router.post('/approvals/:id/reject', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stepNumber, actorId, actorName, actorRoleFa, reason } = req.body;

    if (!reason || !actorId) {
      return res.status(400).json({
        success: false,
        message: 'دلیل رد و هویت اقدام‌کننده الزامی است.'
      });
    }

    const result = k04Storage.rejectRequest({
      requestId: id,
      stepNumber: Number(stepNumber) || 1,
      actorId,
      actorName: actorName || 'کارشناس ریسک',
      actorRoleFa: actorRoleFa || 'کارشناس انطباق',
      reason
    });

    if (result.success) {
      RbacService.applyApprovedAssignment(id, 'rejected');
    }

    res.json(result);
  } catch (err: unknown) {
    console.error('Error rejecting request:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در رد درخواست.'
    });
  }
});

// POST create commercial exception
k04Router.post('/exceptions/create', (req: Request, res: Response) => {
  try {
    const {
      titleFa,
      descriptionFa,
      category,
      partyNameFa,
      goldWeightGrams,
      financialImpactIrr,
      riskLevel,
      conditions,
      actorName
    } = req.body;

    const newException = k04Storage.createException({
      titleFa,
      descriptionFa,
      category,
      partyNameFa,
      goldWeightGrams: Number(goldWeightGrams) || 0,
      financialImpactIrr: Number(financialImpactIrr) || 0,
      riskLevel: riskLevel || 'medium',
      conditions: Array.isArray(conditions) ? conditions : [conditions],
      actorName: actorName || 'امیرحسین رضایی (مدیر ارشد)'
    });

    res.json({
      success: true,
      data: newException,
      message: `استثنای تجاری با کد ${newException.exceptionCode} با موفقیت ثبت شد.`
    });
  } catch (err: unknown) {
    console.error('Error creating exception:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت استثنای تجاری.'
    });
  }
});

// POST revoke commercial exception
k04Router.post('/exceptions/:id/revoke', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { actorId, actorName, actorRoleFa, reason } = req.body;

    const result = k04Storage.revokeException(
      id,
      actorId || 'usr-001',
      actorName || 'مدیر ارشد سامانه',
      actorRoleFa || 'مدیر ارشد',
      reason || 'لغو توسط مدیر سامانه'
    );

    res.json(result);
  } catch (err: unknown) {
    console.error('Error revoking exception:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در ابطال استثنای تجاری.'
    });
  }
});

// POST verify cryptographic audit chain integrity
k04Router.post('/audit/verify-integrity', (req: Request, res: Response) => {
  try {
    const integrity = k04Storage.verifyChainIntegrity();
    res.json({
      success: true,
      data: integrity,
      message: integrity.isValid
        ? `یکپارچگی و توالی رمزنگاری هر ${integrity.verifiedBlocksCount} بلوک زنجیره تغییرناپذیر SHA-256 با موفقیت تایید شد.`
        : `هشدار امنیتی: شکست زنجیره در بلوک شماره ${integrity.brokenBlockIndex} مشاهده شد!`
    });
  } catch (err: unknown) {
    console.error('Error verifying audit chain integrity:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در ارزیابی یکپارچگی زنجیره لاگ‌ها.'
    });
  }
});
