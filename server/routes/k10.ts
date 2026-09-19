/**
 * Didar Gold Platform - Kernel Domain K10 API Routes
 * Orders, Allocation & Fulfillment (سفارش، تخصیص و ایفای سفارش)
 */

import { Router, Request, Response } from 'express';
import { k10Storage } from '../storage-k10.js';
import { k16Storage } from '../storage-k16.js';

export const k10Router = Router();

// GET all K10 payload data
k10Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k10Storage.getAllData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single order by ID
k10Router.get('/orders/:id', (req: Request, res: Response) => {
  try {
    const order = k10Storage.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'سفارش مورد نظر یافت نشد.' });
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new order
k10Router.post('/orders', (req: Request, res: Response) => {
  try {
    const order = k10Storage.createOrder(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST allocate stock to order
k10Router.post('/orders/:id/allocate', (req: Request, res: Response) => {
  try {
    const { allocations } = req.body;
    if (!allocations || !Array.isArray(allocations)) {
      return res.status(400).json({ success: false, error: 'اطلاعات تخصیص ارسالی معتبر نیست.' });
    }
    const order = k10Storage.allocateStock(req.params.id, allocations);
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST pack and apply tamper-evident security seal
k10Router.post('/orders/:id/pack-seal', (req: Request, res: Response) => {
  try {
    const { sealSerial, notes } = req.body;
    if (!sealSerial) {
      return res.status(400).json({ success: false, error: 'سریال پلمپ امنیتی الزامی است.' });
    }
    const order = k10Storage.packAndSeal(req.params.id, sealSerial, notes);
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST dispatch order (armored transport / agent handover)
k10Router.post('/orders/:id/dispatch', (req: Request, res: Response) => {
  try {
    const { waybill, method, escortOfficerNameFa } = req.body;
    if (!waybill) {
      return res.status(400).json({ success: false, error: 'شماره بارنامه امنیتی الزامی است.' });
    }
    const order = k10Storage.dispatchOrder(req.params.id, {
      waybill,
      method: method || 'armored_escort',
      escortOfficerNameFa: escortOfficerNameFa || 'سرپرست ترابری امنیتی'
    });
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST verify Proof of Delivery (POD)
k10Router.post('/orders/:id/verify-pod', (req: Request, res: Response) => {
  try {
    const order = k10Storage.verifyPod(req.params.id, req.body);

    // K16 Zarrin automatic voucher generation with Idempotency Key (T02, T18)
    try {
      k16Storage.queueVoucherDocument({
        idempotencyKey: `IDEMP-${order.orderCode}-DELIVERED`,
        eventType: 'order_delivery_pod',
        eventTypeFa: `ثبت سند فروش تحویل سفارش ${order.orderCode}`,
        sourceDomain: 'K10',
        referenceId: order.orderCode,
        retailerOrgId: order.retailerOrgId,
        retailerName: order.retailerNameFa,
        items: order.items.map((it) => ({
          uid: it.allocatedItemUids?.[0] || `UID-AUTO-${it.skuCode}`,
          zarrinItemCode: `ZRN-GLD-${it.skuCode}`,
          title: it.titleFa,
          weightGrams: it.actualAllocatedWeightGrams || it.targetWeightGrams,
          unitPriceRials: (it.unitEstimatedPriceToman || 0) * 10,
          wageRials: (it.makingWageValue || 0) * 10,
          totalRials: (it.totalEstimatedPriceToman || 0) * 10
        })),
        totalGoldWeightGrams: order.totalActualAllocatedWeightGrams || order.totalEstimatedWeightGrams,
        totalAmountRials: (order.grandTotalToman || 0) * 10,
        autoDispatch: true
      });
    } catch (zErr) {
      console.error('K16 Zarrin auto-voucher notice:', zErr);
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST cancel order
k10Router.post('/orders/:id/cancel', (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const order = k10Storage.cancelOrder(req.params.id, reason || 'انصراف خریدار');
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
