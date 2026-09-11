/**
 * Didar Gold Platform - Kernel Domain K09 API Routes
 * Inventory, Locations, Custody & Bags (موجودی، مکان، امانت و کیف)
 */

import { Router, Request, Response } from 'express';
import { k09Storage } from '../storage-k09.js';

export const k09Router = Router();

// GET all K09 data payload
k09Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k09Storage.getAllData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single location
k09Router.get('/locations/:id', (req: Request, res: Response) => {
  try {
    const location = k09Storage.getLocationById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, error: 'مکان خزانه یافت نشد.' });
    }
    res.json({ success: true, data: location });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single agent bag
k09Router.get('/bags/:id', (req: Request, res: Response) => {
  try {
    const bag = k09Storage.getBagById(req.params.id);
    if (!bag) {
      return res.status(404).json({ success: false, error: 'کیف ویزیتور یافت نشد.' });
    }
    res.json({ success: true, data: bag });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single inventory item
k09Router.get('/items/:id', (req: Request, res: Response) => {
  try {
    const item = k09Storage.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'قطعه طلا یافت نشد.' });
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create stock transfer / handover
k09Router.post('/transfers', (req: Request, res: Response) => {
  try {
    const actor = req.body.actorName || 'حاج مصطفی زرین‌قلم (سرپرست خزانه‌داری)';
    const transfer = k09Storage.createTransfer(req.body, actor);
    res.status(201).json({ success: true, data: transfer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST confirm transfer arrival & dual reconciliation
k09Router.post('/transfers/:id/confirm-arrival', (req: Request, res: Response) => {
  try {
    const { measuredWeightAtDestinationGrams, receiverOfficerName, notes } = req.body;
    const transfer = k09Storage.confirmTransferArrival(
      req.params.id,
      Number(measuredWeightAtDestinationGrams),
      receiverOfficerName || 'مامور تحویل‌گیرنده',
      notes
    );
    res.json({ success: true, data: transfer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST register new agent bag
k09Router.post('/bags', (req: Request, res: Response) => {
  try {
    const actor = req.body.actorName || 'مدیریت ناوگان میدانی';
    const bag = k09Storage.createAgentBag(req.body, actor);
    res.status(201).json({ success: true, data: bag });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST record vault or bag audit
k09Router.post('/audits', (req: Request, res: Response) => {
  try {
    const actor = req.body.actorName || 'بازرس رسمی انبارگردانی دیدار';
    const audit = k09Storage.recordVaultAudit(req.body, actor);
    res.status(201).json({ success: true, data: audit });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
