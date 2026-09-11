/**
 * Didar Gold Platform - Kernel Domain K08 API Routes
 * Supply Intake, Physical Verification, Assay Tolerance & Warehouse Receipts
 */

import { Router, Request, Response } from 'express';
import { k08Storage } from '../storage-k08.js';

export const k08Router = Router();

// GET all K08 data
k08Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k08Storage.getAllData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single shipment
k08Router.get('/shipments/:id', (req: Request, res: Response) => {
  try {
    const shipment = k08Storage.getShipmentById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ success: false, error: 'محموله ورودی یافت نشد.' });
    }
    res.json({ success: true, data: shipment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST register new intake shipment
k08Router.post('/shipments', (req: Request, res: Response) => {
  try {
    const actor = req.body.actorName || 'افسر پذیرش انبار دیدار';
    const shipment = k08Storage.registerShipment(req.body, actor);
    res.status(201).json({ success: true, data: shipment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST record scale weighing
k08Router.post('/shipments/:id/weighing', (req: Request, res: Response) => {
  try {
    const { scaleWeightGrams, scaleCalibrationSerial, scaleModelFa, batchWeighings, actorName } = req.body;
    const shipment = k08Storage.recordScaleWeighing(
      req.params.id,
      scaleWeightGrams,
      scaleCalibrationSerial,
      scaleModelFa,
      batchWeighings || [],
      actorName || 'کارشناس توزین تحلیلی'
    );
    res.json({ success: true, data: shipment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST move to quarantine bin
k08Router.post('/shipments/:id/quarantine', (req: Request, res: Response) => {
  try {
    const { quarantineBinCode, actorName } = req.body;
    const shipment = k08Storage.moveToQuarantine(
      req.params.id,
      quarantineBinCode || 'VAULT-Q-01',
      actorName || 'سرپرست گاوصندوق قرنطینه'
    );
    res.json({ success: true, data: shipment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST record metallurgical assay test
k08Router.post('/shipments/:id/assay', (req: Request, res: Response) => {
  try {
    const { assayData, actorName } = req.body;
    const shipment = k08Storage.recordAssayTest(
      req.params.id,
      assayData || req.body,
      actorName || 'کارشناس متالورژی و عیارسنجی'
    );
    res.json({ success: true, data: shipment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST final acceptance decision
k08Router.post('/shipments/:id/decision', (req: Request, res: Response) => {
  try {
    const {
      decision,
      notes,
      penaltyGoldGramsDeducted,
      penaltyMakingChargeToman,
      vaultLocationFa,
      actorName
    } = req.body;

    const result = k08Storage.makeAcceptanceDecision(
      req.params.id,
      decision,
      notes || 'تأیید پذیرش و صدور قبض رسمی',
      penaltyGoldGramsDeducted,
      penaltyMakingChargeToman,
      vaultLocationFa,
      actorName || 'مرتضی اعتمادی (مدیر خزانه و پذیرش)'
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET single warehouse receipt
k08Router.get('/receipts/:id', (req: Request, res: Response) => {
  try {
    const receipt = k08Storage.getReceiptById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, error: 'قبض انبار یافت نشد.' });
    }
    res.json({ success: true, data: receipt });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
