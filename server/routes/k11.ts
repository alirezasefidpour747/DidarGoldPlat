/**
 * Didar Gold Platform - Kernel Domain K11 API Routes
 * Retailer Lifecycle & Commercial Access (چرخه خرده‌فروش و دسترسی تجاری)
 */

import { Router, Request, Response } from 'express';
import { k11Storage } from '../storage-k11.js';

export const k11Router = Router();

// GET all K11 data payload (retailers, summary metrics, territories, agents)
k11Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k11Storage.getAllData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single retailer by ID
k11Router.get('/retailers/:id', (req: Request, res: Response) => {
  try {
    const retailer = k11Storage.getRetailerById(req.params.id);
    if (!retailer) {
      return res.status(404).json({ success: false, error: 'خرده‌فروش مورد نظر یافت نشد.' });
    }
    res.json({ success: true, data: retailer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new retailer
k11Router.post('/retailers', (req: Request, res: Response) => {
  try {
    const retailer = k11Storage.createRetailer(req.body);
    res.status(201).json({ success: true, data: retailer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT update commercial tier and credit terms
k11Router.put('/retailers/:id/tier', (req: Request, res: Response) => {
  try {
    const retailer = k11Storage.updateTierAndTerms(req.params.id, req.body);
    res.json({ success: true, data: retailer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT update assigned territory and field agent
k11Router.put('/retailers/:id/territory', (req: Request, res: Response) => {
  try {
    const retailer = k11Storage.updateTerritory(req.params.id, req.body);
    res.json({ success: true, data: retailer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT update allowed basket rules and permitted carats
k11Router.put('/retailers/:id/basket', (req: Request, res: Response) => {
  try {
    const retailer = k11Storage.updateBasketPolicy(req.params.id, req.body);
    res.json({ success: true, data: retailer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST change lifecycle status (activate, suspend, under review, etc.)
k11Router.post('/retailers/:id/status', (req: Request, res: Response) => {
  try {
    const { status, reasonFa } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'وضعیت جدید الزامی است.' });
    }
    const retailer = k11Storage.changeStatus(req.params.id, status, reasonFa || '');
    res.json({ success: true, data: retailer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST grant temporary commercial exception override
k11Router.post('/retailers/:id/exception', (req: Request, res: Response) => {
  try {
    const retailer = k11Storage.addExceptionOverride(req.params.id, req.body);
    res.json({ success: true, data: retailer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
