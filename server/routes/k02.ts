/**
 * Didar Gold Platform - Domain K02 Router
 * Progressive Onboarding, Trust & Commercial Entitlements API
 */

import { Router, Request, Response } from 'express';
import {
  loadK02Store,
  createOnboardingApplication,
  updateChecklistStep,
  logVerificationCall,
  makeOnboardingDecision,
  updateCommercialEntitlements
} from '../storage-k02.js';

export const k02Router = Router();

// GET all K02 payload
k02Router.get('/', async (req: Request, res: Response) => {
  try {
    const store = loadK02Store();
    res.json({ success: true, data: store });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'K02_LOAD_ERROR', message: error.message }
    });
  }
});

// POST new onboarding application
k02Router.post('/applications', async (req: Request, res: Response) => {
  try {
    const actorName = (req.headers['x-actor-name'] as string) || 'مدیر پذیرش طلا';
    const application = await createOnboardingApplication(req.body, actorName);
    res.status(201).json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'K02_APPLICATION_CREATE_ERROR', message: error.message }
    });
  }
});

// POST update checklist step
k02Router.post('/applications/:id/checklist-step', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stepKey, completed, notes } = req.body;
    const actorName = (req.headers['x-actor-name'] as string) || 'کارشناس احراز و اعتبارسنجی';
    const updated = await updateChecklistStep(id, stepKey, completed, notes, actorName);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'K02_CHECKLIST_ERROR', message: error.message }
    });
  }
});

// POST log verification call
k02Router.post('/applications/:id/verification-call', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const actorName = (req.headers['x-actor-name'] as string) || 'کارشناس استعلام تلفنی';
    const updated = await logVerificationCall(id, req.body, actorName);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'K02_CALL_LOG_ERROR', message: error.message }
    });
  }
});

// POST make decision
k02Router.post('/applications/:id/decision', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, grantedTier, reason } = req.body;
    const actorName = (req.headers['x-actor-name'] as string) || 'کمیته ارزیابی و انطباق دیدار';
    const mappedDecision =
      decision === 'APPROVED' || decision === 'approve'
        ? 'approve'
        : decision === 'REJECTED' || decision === 'reject'
        ? 'reject'
        : 'needs_amendment';

    const updated = await makeOnboardingDecision(
      id,
      mappedDecision,
      { assignedTier: grantedTier, notes: reason, rejectionReason: reason },
      actorName
    );
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'K02_DECISION_ERROR', message: error.message }
    });
  }
});

// PATCH update entitlements
k02Router.patch('/entitlements/:targetId', async (req: Request, res: Response) => {
  try {
    const { targetId } = req.params;
    const actorName = (req.headers['x-actor-name'] as string) || 'مدیر ارشد معاملات طلا';
    const updated = await updateCommercialEntitlements(targetId, req.body, actorName);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'K02_ENTITLEMENTS_ERROR', message: error.message }
    });
  }
});
