/**
 * Didar Gold Platform - Kernel Domain K07 Router
 * Supplier Partnership Lifecycle, Consignment Agreements & Performance KPIs
 */

import { Router, Request, Response } from 'express';
import { k07Storage } from '../storage-k07.js';

export const k07Router = Router();

// GET all K07 data
k07Router.get('/', (req: Request, res: Response) => {
  try {
    const payload = k07Storage.getDataPayload();
    res.json({
      success: true,
      data: payload
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'K07_FETCH_ERROR', message: error.message }
    });
  }
});

// GET supplier by ID
k07Router.get('/suppliers/:id', (req: Request, res: Response) => {
  try {
    const supplier = k07Storage.getSupplierById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: { code: 'SUPPLIER_NOT_FOUND', message: 'کارگاه مورد نظر یافت نشد.' }
      });
    }
    res.json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'K07_SUPPLIER_ERROR', message: error.message }
    });
  }
});

// POST new supplier
k07Router.post('/suppliers', (req: Request, res: Response) => {
  try {
    const actorName = (req.headers['x-actor-name'] as string) || 'مدیریت زنجیره تأمین دیدار';
    const supplier = k07Storage.createSupplier(req.body, actorName);
    res.status(201).json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'CREATE_SUPPLIER_FAILED', message: error.message }
    });
  }
});

// PUT update supplier
k07Router.put('/suppliers/:id', (req: Request, res: Response) => {
  try {
    const actorName = (req.headers['x-actor-name'] as string) || 'مدیریت زنجیره تأمین دیدار';
    const updated = k07Storage.updateSupplier(req.params.id, req.body, actorName);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'UPDATE_SUPPLIER_FAILED', message: error.message }
    });
  }
});

// POST change supplier status
k07Router.post('/suppliers/:id/status', (req: Request, res: Response) => {
  try {
    const { status, reason } = req.body;
    const actorName = (req.headers['x-actor-name'] as string) || 'مدیر حقوقی و انطباق دیدار';
    const updated = k07Storage.changeSupplierStatus(req.params.id, status, reason, actorName);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'CHANGE_STATUS_FAILED', message: error.message }
    });
  }
});

// POST adjust consignment limit
k07Router.post('/suppliers/:id/consignment-limit', (req: Request, res: Response) => {
  try {
    const { limitGrams } = req.body;
    const actorName = (req.headers['x-actor-name'] as string) || 'کمیته اعتبارسنجی طلا';
    const updated = k07Storage.adjustConsignmentLimit(req.params.id, Number(limitGrams), actorName);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'ADJUST_LIMIT_FAILED', message: error.message }
    });
  }
});

// POST create agreement
k07Router.post('/agreements', (req: Request, res: Response) => {
  try {
    const actorName = (req.headers['x-actor-name'] as string) || 'معاونت بازرگانی و قراردادها';
    const agreement = k07Storage.createAgreement(req.body, actorName);
    res.status(201).json({ success: true, data: agreement });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'CREATE_AGREEMENT_FAILED', message: error.message }
    });
  }
});

// POST update agreement status
k07Router.post('/agreements/:id/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const actorName = (req.headers['x-actor-name'] as string) || 'مدیر قراردادها';
    const updated = k07Storage.updateAgreementStatus(req.params.id, status, actorName);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'UPDATE_AGREEMENT_STATUS_FAILED', message: error.message }
    });
  }
});

// POST register collateral
k07Router.post('/collaterals', (req: Request, res: Response) => {
  try {
    const actorName = (req.headers['x-actor-name'] as string) || 'کارشناس وثایق و تضامین زرگری';
    const collateral = k07Storage.registerCollateral(req.body, actorName);
    res.status(201).json({ success: true, data: collateral });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'REGISTER_COLLATERAL_FAILED', message: error.message }
    });
  }
});

// POST verify collateral
k07Router.post('/collaterals/:id/verify', (req: Request, res: Response) => {
  try {
    const { verificationStatus, notes } = req.body;
    const actorName = (req.headers['x-actor-name'] as string) || 'کارشناس استعلام بانکی و ثبتی';
    const updated = k07Storage.verifyCollateral(req.params.id, verificationStatus, notes, actorName);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'VERIFY_COLLATERAL_FAILED', message: error.message }
    });
  }
});

// POST record quality audit
k07Router.post('/audits', (req: Request, res: Response) => {
  try {
    const actorName = (req.headers['x-actor-name'] as string) || 'سرارزیاب کیفی طلا و ریخته‌گری';
    const audit = k07Storage.recordQualityAudit(req.body, actorName);
    res.status(201).json({ success: true, data: audit });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'RECORD_AUDIT_FAILED', message: error.message }
    });
  }
});
