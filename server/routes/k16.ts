/**
 * Didar Gold Platform - Kernel Domain K16 API Routes
 * Settlement & Zarrin Reconciliation (تسویه و تطبیق زرین K16A/B)
 */

import { Router, Request, Response } from 'express';
import { k16Storage } from '../storage-k16.js';
import { k10Storage } from '../storage-k10.js';

export const k16Router = Router();

// GET all K16 payload data
k16Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k16Storage.getData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET summary metrics
k16Router.get('/summary', (req: Request, res: Response) => {
  try {
    const summary = k16Storage.getSummary();
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET catalog items
k16Router.get('/catalog', (req: Request, res: Response) => {
  try {
    const catalog = k16Storage.getCatalog();
    res.json({ success: true, data: catalog });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET outbox documents
k16Router.get('/outbox', (req: Request, res: Response) => {
  try {
    const outbox = k16Storage.getOutbox();
    res.json({ success: true, data: outbox });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST sync catalog from Zarrin ERP (T01)
k16Router.post('/catalog/sync', (req: Request, res: Response) => {
  try {
    const result = k16Storage.syncCatalog();
    res.json({
      success: true,
      message: `همگام‌سازی کامل کاتالوگ زرین انجام شد. ${result.syncedCount} قلم کالا با موفقیت تطبیق یافتند.`,
      data: result
    });
  } catch (error: any) {
    res.status(503).json({ success: false, error: error.message });
  }
});

// POST queue a voucher document with Idempotency Key (T18, C06)
k16Router.post('/outbox', (req: Request, res: Response) => {
  try {
    const {
      idempotencyKey,
      eventType,
      eventTypeFa,
      sourceDomain,
      referenceId,
      retailerOrgId,
      retailerName,
      items,
      totalGoldWeightGrams,
      totalAmountRials,
      autoDispatch
    } = req.body;

    if (!idempotencyKey) {
      return res.status(400).json({
        success: false,
        error: 'شناسه عدم تکرار (idempotencyKey) برای ثبت سند در زرین الزامی است.'
      });
    }

    const result = k16Storage.queueVoucherDocument({
      idempotencyKey,
      eventType: eventType || 'order_delivery_pod',
      eventTypeFa: eventTypeFa || 'ثبت سند فروش در زرین',
      sourceDomain: sourceDomain || 'K10',
      referenceId: referenceId || 'REF-MANUAL',
      retailerOrgId: retailerOrgId || 'org-r-01',
      retailerName: retailerName || 'طلافروشی طرف قرارداد',
      items: items || [],
      totalGoldWeightGrams: Number(totalGoldWeightGrams) || 0,
      totalAmountRials: Number(totalAmountRials) || 0,
      autoDispatch: autoDispatch !== false
    });

    res.status(result.isDuplicatePrevented ? 200 : 201).json({
      success: true,
      isDuplicatePrevented: result.isDuplicatePrevented,
      message: result.isDuplicatePrevented
        ? 'سند حسابداری با این کلید قبلاً صادر شده بود؛ از ارسال تکراری به زرین ممانعت به عمل آمد.'
        : 'سند با موفقیت در صف خروجی زرین قرار گرفت و ارسال شد.',
      data: result.document
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST dispatch document by ID
k16Router.post('/outbox/:id/dispatch', (req: Request, res: Response) => {
  try {
    const doc = k16Storage.dispatchDocument(req.params.id);
    res.json({
      success: true,
      message: `سند با وضعیت ${doc.statusFa} پردازش گردید.`,
      data: doc
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST retry all pending / retryable documents
k16Router.post('/outbox/retry-all', (req: Request, res: Response) => {
  try {
    const result = k16Storage.retryFailedDocuments();
    res.json({
      success: true,
      message: `تلاش مجدد برای ${result.retriedCount} سند انجام شد. ${result.succeededCount} سند با موفقیت در زرین قطعی شد.`,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST toggle simulated offline connection to Zarrin (for T19 testing)
k16Router.post('/offline-toggle', (req: Request, res: Response) => {
  try {
    const { offline } = req.body;
    k16Storage.setOfflineSimulation(Boolean(offline));
    res.json({
      success: true,
      isOffline: k16Storage.isOfflineSimulation(),
      message: k16Storage.isOfflineSimulation()
        ? 'حالت قطعی شبیه‌سازی‌شده ارتباط با سرور زرین فعال شد (تست سناریو T19).'
        : 'اتصال به وب‌سرویس زرین به حالت عادی و پایدار بازگشت.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST resolve discrepancy manually
k16Router.post('/outbox/:id/reconcile', (req: Request, res: Response) => {
  try {
    const { resolutionNote, actor } = req.body;
    const doc = k16Storage.resolveDiscrepancy(
      req.params.id,
      resolutionNote || 'رفع مغایرت با تأیید مدیر خزانه‌داری',
      actor || 'مسئول تطبیق زرین'
    );
    res.json({
      success: true,
      message: 'مغایرت سند با موفقیت برطرف و وضعیت آن به‌روزرسانی شد.',
      data: doc
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST helper: trigger voucher generation from an existing delivered order (T02)
k16Router.post('/simulate-order-voucher', (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const order = k10Storage.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'سفارش مورد نظر یافت نشد.' });
    }

    const idempotencyKey = `IDEMP-${order.orderCode}-DELIVERED`;
    const docItems = order.items.map((it) => ({
      uid: it.allocatedItemUids?.[0] || `UID-TEMP-${it.skuCode}`,
      zarrinItemCode: `ZRN-GLD-${it.skuCode}`,
      title: it.titleFa,
      weightGrams: it.actualAllocatedWeightGrams || it.targetWeightGrams,
      unitPriceRials: (it.unitEstimatedPriceToman || 0) * 10,
      wageRials: (it.makingWageValue || 0) * 10,
      totalRials: (it.totalEstimatedPriceToman || 0) * 10
    }));

    const result = k16Storage.queueVoucherDocument({
      idempotencyKey,
      eventType: 'order_delivery_pod',
      eventTypeFa: `ثبت سند فروش تحویل سفارش ${order.orderCode}`,
      sourceDomain: 'K10',
      referenceId: order.orderCode,
      retailerOrgId: order.retailerOrgId,
      retailerName: order.retailerNameFa,
      items: docItems,
      totalGoldWeightGrams: order.totalActualAllocatedWeightGrams || order.totalEstimatedWeightGrams,
      totalAmountRials: (order.grandTotalToman || 0) * 10,
      autoDispatch: true
    });

    res.json({
      success: true,
      isDuplicatePrevented: result.isDuplicatePrevented,
      message: result.isDuplicatePrevented
        ? `سند سفارش ${order.orderCode} قبلاً در زرین ثبت شده بود (جلوگیری از سند تکراری).`
        : `سند مالی سفارش ${order.orderCode} با موفقیت صادر و به زرین ارسال گردید.`,
      data: result.document
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET settlement accounts (K16A)
k16Router.get('/settlement/accounts', (req: Request, res: Response) => {
  try {
    const accounts = k16Storage.getSettlementAccounts();
    const summary = k16Storage.getSettlementSummary();
    res.json({ success: true, data: { accounts, summary } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET settlement transactions (K16A)
k16Router.get('/settlement/transactions', (req: Request, res: Response) => {
  try {
    const transactions = k16Storage.getSettlementTransactions();
    res.json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST record new settlement transaction (K16A)
k16Router.post('/settlement/transaction', (req: Request, res: Response) => {
  try {
    const { partnerId, type, goldWeightGrams, fiatAmountToman, referenceBankTraceNo, registeredBy, noteFa } = req.body;
    if (!partnerId || !type) {
      return res.status(400).json({ success: false, error: 'شناسه طرف حساب و نوع تراکنش تسویه الزامی است.' });
    }

    const result = k16Storage.recordSettlementTransaction({
      partnerId,
      type,
      goldWeightGrams: Number(goldWeightGrams) || 0,
      fiatAmountToman: Number(fiatAmountToman) || 0,
      referenceBankTraceNo,
      registeredBy,
      noteFa
    });

    res.status(201).json({
      success: true,
      message: `تراکنش تسویه با کد ${result.transaction.settlementCode} ثبت و سند زرین صادر گردید.`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST execute bilateral netting (K16A)
k16Router.post('/settlement/bilateral-netting', (req: Request, res: Response) => {
  try {
    const { partnerId, customGoldWeight, customPriceToman } = req.body;
    if (!partnerId) {
      return res.status(400).json({ success: false, error: 'شناسه طرف حساب جهت تهاتر الزامی است.' });
    }

    const result = k16Storage.executeBilateralNetting(partnerId, customGoldWeight, customPriceToman);
    res.json({
      success: true,
      message: `تهاتر دوطرفه به میزان ${result.nettedGoldGrams} گرم طلا معادل ${result.nettedFiatToman.toLocaleString('fa-IR')} تومان با موفقیت انجام شد.`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST sync K13 invoice to Zarrin Outbox (K13 -> K16 Integration)
k16Router.post('/sync-invoice-voucher', (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.body;
    if (!invoiceId) {
      return res.status(400).json({ success: false, error: 'شناسه صورتحساب الزامی است.' });
    }

    const result = k16Storage.syncInvoiceToZarrinOutbox(invoiceId);
    res.json({
      success: true,
      isDuplicatePrevented: result.isDuplicatePrevented,
      message: result.isDuplicatePrevented
        ? `صورتحساب ${result.invoiceNumber} قبلاً به زرین ارسال شده بود (شناسه عدم تکرار فعال شد).`
        : `سند صورتحساب ${result.invoiceNumber} در صف زرین قرار گرفت و سند صادر شد.`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST toggle reservation of a catalog item (K16B)
k16Router.post('/catalog/:id/reserve-toggle', (req: Request, res: Response) => {
  try {
    const { bagOrOrderId } = req.body;
    const item = k16Storage.toggleItemReservation(req.params.id, bagOrOrderId);
    res.json({
      success: true,
      message: `وضعیت رزرو کالای ${item.titleFa} تغییر یافت.`,
      data: item
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET tripartite reconciliation status across K13, K14, and K15
k16Router.get('/reconciliation', (req: Request, res: Response) => {
  try {
    const result = k16Storage.computeTripartiteReconciliation();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST auto-fix a tripartite discrepancy
k16Router.post('/reconciliation/auto-fix', (req: Request, res: Response) => {
  try {
    const { recordId } = req.body;
    if (!recordId) {
      return res.status(400).json({ success: false, error: 'شناسه رکورد مغایرت الزامی است.' });
    }
    const result = k16Storage.autoFixTripartiteDiscrepancy(recordId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST batch reconcile all unresolved tripartite discrepancies
k16Router.post('/reconciliation/batch-reconcile', (req: Request, res: Response) => {
  try {
    const result = k16Storage.batchReconcileTripartite();
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

