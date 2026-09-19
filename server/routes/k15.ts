/**
 * Didar Gold Platform - Kernel Domain K15 API Routes
 * Financial Obligations & Dual Subledgers (تعهد مالی و دفتر دوگانه)
 */

import { Router, Request, Response } from 'express';
import { k15Storage } from '../storage-k15.js';
import { k14K15BridgeService } from '../services/k14-k15-bridge.js';

export const k15Router = Router();

// GET all K15 data payload
k15Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k15Storage.getData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET all party accounts and dual balances
k15Router.get('/parties', (req: Request, res: Response) => {
  try {
    const parties = k15Storage.getPartyBalances();
    res.json({ success: true, data: parties });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET a specific party account statement (ledger + vouchers)
k15Router.get('/parties/:partyId', (req: Request, res: Response) => {
  try {
    const { partyId } = req.params;
    const result = k15Storage.getPartyAccount(partyId);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: `طرف حساب با شناسه ${partyId} یافت نشد.`
      });
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET all dual journal vouchers
k15Router.get('/vouchers', (req: Request, res: Response) => {
  try {
    const { partyId, voucherType } = req.query;
    const vouchers = k15Storage.getVouchers({
      partyId: partyId ? String(partyId) : undefined,
      voucherType: voucherType ? String(voucherType) : undefined
    });
    res.json({ success: true, data: vouchers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST register a new dual journal voucher
k15Router.post('/vouchers', (req: Request, res: Response) => {
  try {
    const {
      partyId,
      voucherType,
      titleFa,
      descriptionFa,
      referenceDocNumber,
      goldDebitGrams,
      goldCreditGrams,
      goldCarat,
      fiatDebitToman,
      fiatCreditToman,
      registeredBy
    } = req.body;

    if (!partyId || !voucherType || !titleFa) {
      return res.status(400).json({
        success: false,
        error: 'شناسه طرف حساب، نوع سند و عنوان الزامی هستند.'
      });
    }

    const voucher = k15Storage.registerVoucher({
      partyId,
      voucherType,
      titleFa,
      descriptionFa: descriptionFa || titleFa,
      referenceDocNumber,
      goldDebitGrams: Number(goldDebitGrams || 0),
      goldCreditGrams: Number(goldCreditGrams || 0),
      goldCarat: Number(goldCarat || 750),
      fiatDebitToman: Number(fiatDebitToman || 0),
      fiatCreditToman: Number(fiatCreditToman || 0),
      registeredBy
    });

    res.status(201).json({
      success: true,
      message: `سند دوگانه شماره ${voucher.voucherNumber} با موفقیت ثبت شد.`,
      data: voucher
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST execute netting conversion between gold and fiat
k15Router.post('/netting', (req: Request, res: Response) => {
  try {
    const { partyId, direction, amount, goldPriceToman, operator } = req.body;

    if (!partyId || !direction || !amount) {
      return res.status(400).json({
        success: false,
        error: 'پارامترهای طرف حساب، جهت تهاتر (ریال به طلا یا بالعکس) و مقدار الزامی هستند.'
      });
    }

    const result = k15Storage.executeNettingConversion({
      partyId,
      direction,
      amount: Number(amount),
      goldPriceToman: Number(goldPriceToman || 0),
      operator
    });

    res.json({
      success: true,
      message: `عملیات تهاتر با صدور سند ${result.voucher.voucherNumber} ثبت شد.`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST update reference gold price
k15Router.post('/reference-rate', (req: Request, res: Response) => {
  try {
    const { priceToman } = req.body;
    if (!priceToman || Number(priceToman) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'نرخ معتبر بر حسب تومان ارسال نشده است.'
      });
    }

    const updated = k15Storage.updateReferenceGoldPrice(Number(priceToman));
    res.json({
      success: true,
      message: `نرخ مبنای ارزش‌گذاری طلا به ${updated.toLocaleString('fa-IR')} تومان تغییر یافت.`,
      data: { referenceGoldPriceToman: updated }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- K14 ↔ K15 Intermediary Bridge Endpoints ---

// GET K14-K15 bridge status, telemetry & sync logs
k15Router.get('/bridge/status', (req: Request, res: Response) => {
  try {
    const status = k14K15BridgeService.getBridgeStatus();
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST sync single K14-approved invoice to K15 (creates dual-entry accounting voucher)
k15Router.post('/bridge/sync-invoice', (req: Request, res: Response) => {
  try {
    const { invoiceId, operatorName, forceBypassOverride, overrideReason } = req.body;
    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        error: 'شناسه صورتحساب (invoiceId) الزامی است.'
      });
    }

    const result = k14K15BridgeService.syncK14ApprovedInvoiceToK15({
      invoiceId,
      operatorName,
      forceBypassOverride: Boolean(forceBypassOverride),
      overrideReason
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST execute batch synchronization of all pending K14-approved invoices
k15Router.post('/bridge/batch-sync', (req: Request, res: Response) => {
  try {
    const { operatorName } = req.body;
    const result = k14K15BridgeService.batchSyncK14ApprovedInvoices(operatorName);
    res.json({
      success: true,
      message: `همگام‌سازی دسته‌ای به پایان رسید. ${result.syncedCount} سند دوبل جدید ثبت گردید.`,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST toggle auto-sync feature
k15Router.post('/bridge/toggle-autosync', (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;
    const updated = k14K15BridgeService.setAutoSyncEnabled(Boolean(enabled));
    res.json({
      success: true,
      message: updated
        ? 'ثبت خودکار اسناد حسابداری دوطرفه برای داده‌های تاییدشده K14 فعال شد.'
        : 'ثبت خودکار اسناد موقتاً غیرفعال شد (ارسال دستی).',
      data: { isAutoSyncEnabled: updated }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

