/**
 * Didar Gold Platform - Kernel 13 (K13) REST API Router
 * Endpoints for Gold Spot Rates, Price Quote Locks, Wage Matrix & Tax Invoicing
 */

import { Router, Request, Response } from 'express';
import { k13Storage } from '../storage-k13.js';
import { k13K14BridgeService } from '../services/k13-k14-bridge.js';

export const k13Router = Router();

// GET all K13 data
k13Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k13Storage.getPayload();
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('K13 GET error:', error);
    res.status(500).json({ success: false, error: 'خطا در دریافت اطلاعات نرخ، قیمت‌گذاری و فاکتورها' });
  }
});

// POST interactive price calculation
k13Router.post('/calculate', (req: Request, res: Response) => {
  try {
    const {
      weightGrams,
      carat,
      categoryKey,
      wageType,
      wageValue,
      didarMarginPercent,
      retailerTier,
      customSpotRateToman,
      itemDiscountPercent,
      volumeDiscountPercent,
      settlementMode,
      rialSplitPercent,
      goldSplitPercent,
      quoteLockId
    } = req.body;

    if (!weightGrams || weightGrams <= 0) {
      return res.status(400).json({ success: false, error: 'وزن طلا باید عددی مثبت باشد.' });
    }

    if (itemDiscountPercent !== undefined && Math.abs(Number(itemDiscountPercent)) > 1.0) {
      return res.status(400).json({
        success: false,
        error: `تعدیل قیمت کالا نمی‌تواند بیشتر از ۱٪ (±۱.۰۰٪) باشد. مقدار درخواستی: ${itemDiscountPercent}٪`
      });
    }

    if (volumeDiscountPercent !== undefined && Math.abs(Number(volumeDiscountPercent)) > 2.0) {
      return res.status(400).json({
        success: false,
        error: `تخفیف حجمی کل فاکتور بر اساس حجم خرید نمی‌تواند بیشتر از ۲٪ (±۲.۰۰٪) باشد. مقدار درخواستی: ${volumeDiscountPercent}٪`
      });
    }

    const result = k13Storage.calculatePrice({
      weightGrams: Number(weightGrams),
      carat: Number(carat) || 750,
      categoryKey: categoryKey || 'bangle',
      wageType: wageType || 'percentage',
      wageValue: Number(wageValue) || 7,
      didarMarginPercent: didarMarginPercent !== undefined ? Number(didarMarginPercent) : undefined,
      retailerTier: retailerTier || 'T1',
      customSpotRateToman: customSpotRateToman ? Number(customSpotRateToman) : undefined,
      itemDiscountPercent: itemDiscountPercent !== undefined ? Number(itemDiscountPercent) : 0,
      volumeDiscountPercent: volumeDiscountPercent !== undefined ? Number(volumeDiscountPercent) : 0,
      settlementMode: settlementMode || 'split',
      rialSplitPercent: rialSplitPercent !== undefined ? Number(rialSplitPercent) : undefined,
      goldSplitPercent: goldSplitPercent !== undefined ? Number(goldSplitPercent) : undefined,
      quoteLockId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('K13 calculation error:', error);
    res.status(400).json({ success: false, error: error.message || 'خطا در محاسبه بهای تمام‌شده و مالیات طلا' });
  }
});

// POST lock a price quote with cryptographic token
k13Router.post('/lock-quote', (req: Request, res: Response) => {
  try {
    const { buyerOrgId, buyerOrgNameFa, totalWeightGrams, validitySeconds, purpose } = req.body;

    if (!buyerOrgId || !totalWeightGrams) {
      return res.status(400).json({ success: false, error: 'شناسه خریدار و وزن کل طلا الزامی است.' });
    }

    const lock = k13Storage.createQuoteLock({
      buyerOrgId,
      buyerOrgNameFa: buyerOrgNameFa || 'طلافروشی طرف قرارداد',
      totalWeightGrams: Number(totalWeightGrams),
      validitySeconds: validitySeconds ? Number(validitySeconds) : 300,
      purpose
    });

    res.json({
      success: true,
      message: `مظنه با موفقیت قفل گردید (${lock.validitySeconds / 60} دقیقه گارانتی نرخ طلا)`,
      data: lock
    });
  } catch (error: any) {
    console.error('K13 lock quote error:', error);
    res.status(500).json({ success: false, error: 'خطا در قفل مظنه طلا' });
  }
});

// POST create an invoice (proforma or official tax invoice)
k13Router.post('/invoices', (req: Request, res: Response) => {
  try {
    const {
      invoiceType,
      buyerOrgId,
      buyerNameFa,
      buyerNationalId,
      buyerEconomicCode,
      buyerAddressFa,
      buyerPhone,
      retailerTier,
      orderCode,
      quoteLockId,
      paymentTermsFa,
      settlementMode,
      rialSplitPercent,
      volumeDiscountPercent,
      items
    } = req.body;

    if (!buyerOrgId || !buyerNameFa || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'اطلاعات خریدار و اقلام فاکتور الزامی است.' });
    }

    if (volumeDiscountPercent !== undefined && Math.abs(Number(volumeDiscountPercent)) > 2.0) {
      return res.status(400).json({
        success: false,
        error: `تخفیف حجمی کل فاکتور بر اساس حجم خرید نمی‌تواند فراتر از ۲٪ (±۲.۰۰٪) باشد. مقدار درخواستی: ${volumeDiscountPercent}٪`
      });
    }

    // Check each item discount
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.itemDiscountPercent !== undefined && Math.abs(Number(it.itemDiscountPercent)) > 1.0) {
        return res.status(400).json({
          success: false,
          error: `تعدیل قیمت در ردیف ${i + 1} (${it.titleFa || 'کالا'}) نمی‌تواند بیشتر از ۱٪ (±۱.۰۰٪) باشد. مقدار درخواستی: ${it.itemDiscountPercent}٪`
        });
      }
    }

    const invoice = k13Storage.createInvoice({
      invoiceType: invoiceType || 'official_tax_invoice',
      buyerOrgId,
      buyerNameFa,
      buyerNationalId: buyerNationalId || '10103569841',
      buyerEconomicCode: buyerEconomicCode || '411589632145',
      buyerAddressFa: buyerAddressFa || 'تهران، بازار طلا',
      buyerPhone: buyerPhone || '021-55623344',
      retailerTier: retailerTier || 'T1',
      orderCode,
      quoteLockId,
      paymentTermsFa,
      settlementMode: settlementMode || 'split',
      rialSplitPercent: rialSplitPercent !== undefined ? Number(rialSplitPercent) : undefined,
      volumeDiscountPercent: volumeDiscountPercent !== undefined ? Number(volumeDiscountPercent) : 0,
      items
    });

    res.json({
      success: true,
      message: invoice.invoiceType === 'proforma'
        ? `پیش‌فاکتور شماره ${invoice.invoiceNumber} با موفقیت صادر شد.`
        : `صورتحساب الکترونیکی رسمی شماره ${invoice.invoiceNumber} با شناسه مالیاتی یکتا صادر گردید.`,
      data: invoice
    });
  } catch (error: any) {
    console.error('K13 create invoice error:', error);
    res.status(400).json({ success: false, error: error.message || 'خطا در صدور صورتحساب' });
  }
});

// POST dispatch invoice to Samaneh Moaddian
k13Router.post('/invoices/:id/moaddian-send', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = k13Storage.sendToMoaddian(id);

    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      message: `صورتحساب با شناسه رهگیری ${result.invoice?.moaddianTrackingCode} با موفقیت در کارپوشه سامانه مودیان ثبت و تأیید شد.`,
      data: result.invoice
    });
  } catch (error) {
    console.error('K13 Moaddian dispatch error:', error);
    res.status(500).json({ success: false, error: 'خطا در ارسال صورتحساب به سامانه مودیان' });
  }
});

// POST refresh spot rates from market feed
k13Router.post('/rates/refresh', (req: Request, res: Response) => {
  try {
    const refreshed = k13Storage.refreshMarketRates();
    res.json({
      success: true,
      message: 'نرخ‌های تابلو بازار با موفقیت بروزرسانی شد.',
      data: refreshed
    });
  } catch (error) {
    console.error('K13 refresh rates error:', error);
    res.status(500).json({ success: false, error: 'خطا در بروزرسانی نرخ‌های طلا' });
  }
});

// POST modify a gold rate (checks operator permissions & dual approval)
k13Router.post('/rates/modify', (req: Request, res: Response) => {
  try {
    const { rateId, newSellPrice, newBuyPrice, operatorId, reason } = req.body;

    if (!rateId || !newSellPrice || !operatorId) {
      return res.status(400).json({ success: false, error: 'شناسه نماد، نرخ جدید و شناسه اپراتور الزامی است.' });
    }

    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '192.168.1.1';

    const result = k13Storage.modifyGoldRate({
      rateId,
      newSellPrice: Number(newSellPrice),
      newBuyPrice: newBuyPrice ? Number(newBuyPrice) : undefined,
      operatorId,
      reason: reason || 'تغییر دستی در پنل نظارت خزانه‌داری',
      ipAddress
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      requiresApproval: result.requiresApproval,
      message: result.requiresApproval
        ? 'تغییر نرخ به دلیل نوسان بالا ثبت گردید و در صف تأیید دونفره (Dual Approval) قرار گرفت.'
        : 'نرخ طلا با موفقیت در سامانه اعمال گردید.',
      data: result
    });
  } catch (error) {
    console.error('K13 rate modify error:', error);
    res.status(500).json({ success: false, error: 'خطا در اعمال تغییر نرخ طلا' });
  }
});

// POST approve pending dual approval
k13Router.post('/rates/approve-dual', (req: Request, res: Response) => {
  try {
    const { auditLogId, approverId } = req.body;
    if (!auditLogId || !approverId) {
      return res.status(400).json({ success: false, error: 'شناسه درخواست تغییر نرخ و شناسه تأییدکننده الزامی است.' });
    }

    const result = k13Storage.approveRateChange(auditLogId, approverId);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      message: 'تغییر نرخ با موفقیت تأیید دومرحله‌ای شد و در تابلوی زنده اعمال گردید.',
      data: result
    });
  } catch (error) {
    console.error('K13 approve dual error:', error);
    res.status(500).json({ success: false, error: 'خطا در تأیید درخواست تغییر نرخ' });
  }
});

// POST reject pending dual approval
k13Router.post('/rates/reject-dual', (req: Request, res: Response) => {
  try {
    const { auditLogId, approverId, rejectionReason } = req.body;
    if (!auditLogId || !approverId) {
      return res.status(400).json({ success: false, error: 'شناسه درخواست تغییر نرخ و شناسه تأییدکننده الزامی است.' });
    }

    const result = k13Storage.rejectRateChange(auditLogId, approverId, rejectionReason);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      message: 'درخواست تغییر نرخ رد شد.',
      data: result
    });
  } catch (error) {
    console.error('K13 reject dual error:', error);
    res.status(500).json({ success: false, error: 'خطا در رد درخواست تغییر نرخ' });
  }
});

// GET authorized rate users
k13Router.get('/users', (req: Request, res: Response) => {
  try {
    const users = k13Storage.getAuthorizedUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'خطا در دریافت لیست کاربران مجاز نرخ' });
  }
});

// PUT update user permissions & role
k13Router.put('/users/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = k13Storage.updateUser(id, req.body);
    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }
    res.json({
      success: true,
      message: 'سطوح دسترسی و مشخصات کاربر با موفقیت بروزرسانی شد.',
      data: result.user
    });
  } catch (error) {
    console.error('K13 update user error:', error);
    res.status(500).json({ success: false, error: 'خطا در بروزرسانی دسترسی کاربر' });
  }
});

// POST create new authorized user
k13Router.post('/users', (req: Request, res: Response) => {
  try {
    const { nameFa, email, nationalId, departmentFa, role, roleFa, permissions, status, maxAllowedDailyChangePercent } = req.body;
    if (!nameFa || !role || !permissions) {
      return res.status(400).json({ success: false, error: 'نام کاربر، نقش و مجوزها الزامی هستند.' });
    }

    const result = k13Storage.createUser({
      nameFa,
      email: email || `${Date.now()}@didargold.ir`,
      nationalId: nationalId || '0012345678',
      departmentFa: departmentFa || 'میز معاملات',
      role,
      roleFa: roleFa || role,
      permissions,
      status: status || 'active',
      maxAllowedDailyChangePercent: Number(maxAllowedDailyChangePercent) || 1.5,
      twoFactorRequired: true
    });

    res.json({
      success: true,
      message: 'کاربر مجاز با سطوح دسترسی مشخص به سامانه اضافه گردید.',
      data: result.user
    });
  } catch (error) {
    console.error('K13 create user error:', error);
    res.status(500).json({ success: false, error: 'خطا در ثبت کاربر جدید' });
  }
});

// DELETE remove user access
k13Router.delete('/users/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = k13Storage.deleteUser(id);
    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }
    res.json({
      success: true,
      message: 'دسترسی کاربر به تغییرات نرخ با موفقیت حذف گردید.'
    });
  } catch (error) {
    console.error('K13 delete user error:', error);
    res.status(500).json({ success: false, error: 'خطا در حذف دسترسی کاربر' });
  }
});

// POST toggle circuit breaker
k13Router.post('/security/circuit-breaker', (req: Request, res: Response) => {
  try {
    const { freeze, reason, operatorId } = req.body;
    const result = k13Storage.toggleCircuitBreaker(Boolean(freeze), reason || 'توقف دستی اضطراری به دلیل نوسانات شدید', operatorId);
    if (!result.success) {
      return res.status(403).json({ success: false, error: result.error });
    }
    res.json({
      success: true,
      message: freeze ? 'توقف اضطراری معاملات و نرخ‌ها (Circuit Breaker) فعال شد.' : 'بازار به وضعیت معاملات عادی بازگشت.',
      data: result.policy
    });
  } catch (error) {
    console.error('K13 circuit breaker error:', error);
    res.status(500).json({ success: false, error: 'خطا در تغییر وضعیت فیوز اضطراری بازار' });
  }
});

// PUT update security policy
k13Router.put('/security/policy', (req: Request, res: Response) => {
  try {
    const policy = k13Storage.updateSecurityPolicy(req.body);
    res.json({
      success: true,
      message: 'سیاست‌های امنیتی و آستانه تأیید دونفره بروزرسانی شد.',
      data: policy
    });
  } catch (error) {
    console.error('K13 update policy error:', error);
    res.status(500).json({ success: false, error: 'خطا در بروزرسانی سیاست‌های امنیتی' });
  }
});

// PUT update wage rule
k13Router.put('/wage-rules/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = k13Storage.updateWageRule(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'قانون اجرت ساخت مورد نظر یافت نشد.' });
    }
    res.json({
      success: true,
      message: 'قانون و ماتریس اجرت ساخت با موفقیت ویرایش شد.',
      data: updated
    });
  } catch (error) {
    console.error('K13 update wage rule error:', error);
    res.status(500).json({ success: false, error: 'خطا در ویرایش ماتریس اجرت' });
  }
});

// =========================================================================
// K13 - K14 Integration & Automated Zarrin Delivery Service Endpoints
// =========================================================================

// POST finalize invoice and automatically transition items to "Delivered to Zarrin"
k13Router.post('/invoices/:id/finalize-with-k14', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { operatorName, forceBypassOverride, overrideReason } = req.body;

    const result = k13K14BridgeService.finalizeInvoiceAndSyncK14({
      invoiceId: id,
      operatorName,
      forceBypassOverride: Boolean(forceBypassOverride),
      overrideReason
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        requiresOverride: result.requiresOverride,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: result.result?.message,
      data: result.result,
      invoice: result.invoice
    });
  } catch (error: any) {
    console.error('K13-K14 finalize error:', error);
    res.status(500).json({ success: false, error: error.message || 'خطا در نهایی‌سازی فاکتور و اتصال به ماژول K14 و زرین' });
  }
});

// GET pre-flight credit simulation for an invoice against K14 limits
k13Router.get('/invoices/:id/credit-simulation', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const simulation = k13K14BridgeService.simulateCreditImpact(id);

    res.json({
      success: true,
      data: simulation
    });
  } catch (error: any) {
    console.error('K13 credit simulation error:', error);
    res.status(400).json({ success: false, error: error.message || 'خطا در ارزیابی و شبیه‌سازی اعتباری فاکتور' });
  }
});

// GET all goods/invoices currently marked as delivered to Zarrin
k13Router.get('/zarrin-deliveries', (req: Request, res: Response) => {
  try {
    const deliveries = k13K14BridgeService.getAllZarrinDeliveries();
    res.json({
      success: true,
      data: deliveries,
      totalCount: deliveries.length
    });
  } catch (error) {
    console.error('K13 zarrin deliveries list error:', error);
    res.status(500).json({ success: false, error: 'خطا در دریافت فهرست اقلام تحویل‌شده به زرین' });
  }
});

