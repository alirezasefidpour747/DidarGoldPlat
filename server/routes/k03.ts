/**
 * Didar Gold Platform - Domain K03 Router
 * Authentication, Multi-Factor Authentication (MFA), Sessions & Security Policies API
 */

import { Router, Request, Response } from 'express';
import { k03Storage } from '../storage-k03.js';

export const k03Router = Router();

// GET /api/admin/kernel/k03 - Fetch full K03 payload
k03Router.get('/', async (req: Request, res: Response) => {
  try {
    const data = await k03Storage.getPayload();
    return res.json({
      success: true,
      data,
      metadata: {
        domain: 'K03',
        title: 'احراز هویت و احراز چندمرحله‌ای',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای واکشی اطلاعات K03';
    return res.status(500).json({ error: { code: 'K03_FETCH_FAILED', message } });
  }
});

// POST /api/admin/kernel/k03/mfa/toggle - Toggle MFA enforcement
k03Router.post('/mfa/toggle', async (req: Request, res: Response) => {
  try {
    const { userId, isEnforced, defaultMethod } = req.body;
    if (!userId) throw new Error('شناسه کاربر الزامی است.');
    const updatedAccount = await k03Storage.toggleMfaEnforcement(userId, isEnforced, defaultMethod);
    return res.json({ success: true, data: updatedAccount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای تغییر وضعیت احراز دوعاملی';
    return res.status(400).json({ error: { code: 'MFA_TOGGLE_FAILED', message } });
  }
});

// POST /api/admin/kernel/k03/mfa/totp-verify - Verify TOTP token and configure
k03Router.post('/mfa/totp-verify', async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) throw new Error('شناسه کاربر و کد ۶ رقمی الزامی است.');
    const updatedAccount = await k03Storage.verifyAndConfigureTotp(userId, code);
    return res.json({ success: true, data: updatedAccount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای اعتبارسنجی کد دوعاملی';
    return res.status(400).json({ error: { code: 'TOTP_VERIFY_FAILED', message } });
  }
});

// POST /api/admin/kernel/k03/mfa/security-key - Register FIDO2 / YubiKey hardware key
k03Router.post('/mfa/security-key', async (req: Request, res: Response) => {
  try {
    const { userId, name, model } = req.body;
    if (!userId) throw new Error('شناسه کاربر الزامی است.');
    const newKey = await k03Storage.addHardwareSecurityKey(userId, name, model);
    return res.status(201).json({ success: true, data: newKey });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای ثبت کلید سخت‌افزاری امنیتی';
    return res.status(400).json({ error: { code: 'KEY_REGISTRATION_FAILED', message } });
  }
});

// POST /api/admin/kernel/k03/sessions/:sessionId/revoke - Revoke single session
k03Router.post('/sessions/:sessionId/revoke', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    await k03Storage.revokeSession(sessionId);
    return res.json({ success: true, message: `نشست ${sessionId} با موفقیت ابطال گردید.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای ابطال نشست دستگاه';
    return res.status(400).json({ error: { code: 'SESSION_REVOKE_FAILED', message } });
  }
});

// POST /api/admin/kernel/k03/sessions/revoke-all - Revoke all sessions for a user
k03Router.post('/sessions/revoke-all', async (req: Request, res: Response) => {
  try {
    const { userId, keepCurrentId } = req.body;
    if (!userId) throw new Error('شناسه کاربر الزامی است.');
    const revokedCount = await k03Storage.revokeAllUserSessions(userId, keepCurrentId);
    return res.json({ success: true, revokedCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای ابطال کلیه نشست‌ها';
    return res.status(400).json({ error: { code: 'REVOKE_ALL_FAILED', message } });
  }
});

// POST /api/admin/kernel/k03/accounts/:userId/unlock - Unlock locked account
k03Router.post('/accounts/:userId/unlock', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const account = await k03Storage.unlockAccount(userId);
    return res.json({ success: true, data: account });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای رفع مسدودی حساب کاربری';
    return res.status(400).json({ error: { code: 'ACCOUNT_UNLOCK_FAILED', message } });
  }
});

// POST /api/admin/kernel/k03/accounts/:userId/security-settings - Update user security settings
k03Router.post('/accounts/:userId/security-settings', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { settings } = req.body;
    const account = await k03Storage.updateSecuritySettings(userId, settings);
    return res.json({ success: true, data: account });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای به‌روزرسانی تنظیمات امنیتی';
    return res.status(400).json({ error: { code: 'SETTINGS_UPDATE_FAILED', message } });
  }
});

// POST /api/admin/kernel/k03/policies/:ruleId - Update policy rule
k03Router.post('/policies/:ruleId', async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    const rule = await k03Storage.updatePolicyRule(ruleId, req.body);
    return res.json({ success: true, data: rule });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای به‌روزرسانی سیاست امنیتی';
    return res.status(400).json({ error: { code: 'POLICY_UPDATE_FAILED', message } });
  }
});

// POST /api/admin/kernel/k03/step-up/simulate - Test and simulate step-up MFA challenge
k03Router.post('/step-up/simulate', async (req: Request, res: Response) => {
  try {
    const { userId, operationFa, amountGrams, method, code } = req.body;
    const result = await k03Storage.simulateStepUpChallenge(userId, operationFa, amountGrams, method, code);
    return res.json({ success: result.success, message: result.message });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطای اجرای چالش مرحله‌ای';
    return res.status(400).json({ error: { code: 'STEP_UP_FAILED', message } });
  }
});
