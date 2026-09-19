/**
 * Didar Gold Platform - Kernel Domain K14 API Routes
 * Credit & Exposure Governance (اعتبار و ریسک تعهد)
 */

import { Router, Request, Response } from 'express';
import { k14Storage } from '../storage-k14.js';

export const k14Router = Router();

// GET all K14 data payload
k14Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k14Storage.getData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST update dual-currency credit limits for a buyer
k14Router.post('/profiles/:id/limit', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { goldLimitGrams, rialLimitToman, operator } = req.body;

    if (goldLimitGrams === undefined || rialLimitToman === undefined) {
      return res.status(400).json({
        success: false,
        error: 'مقادیر سقف وزنی طلا و سقف ریالی الزامی هستند.'
      });
    }

    const updated = k14Storage.updateLimits(
      id,
      Number(goldLimitGrams),
      Number(rialLimitToman),
      operator || 'مدیر ریسک دیدار'
    );

    res.json({
      success: true,
      message: `سقف اعتباری دوگانه خریدار ${updated.buyerOrgNameFa} با موفقیت به‌روزرسانی شد.`,
      data: updated
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST toggle credit lock / freeze
k14Router.post('/profiles/:id/toggle-lock', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lock, reasonFa } = req.body;

    const updated = k14Storage.toggleCreditLock(id, Boolean(lock), reasonFa);

    res.json({
      success: true,
      message: lock
        ? `حساب اعتباری ${updated.buyerOrgNameFa} با موفقیت مسدود و قفل شد.`
        : `قفل اعتباری ${updated.buyerOrgNameFa} برطرف و فعال شد.`,
      data: updated
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST register new collateral
k14Router.post('/collaterals', (req: Request, res: Response) => {
  try {
    const {
      buyerId,
      collateralType,
      titleFa,
      identifierNumber,
      issuerBank,
      nominalValueToman,
      haircutPercent,
      weightGrams,
      carat,
      vaultBagId,
      depositDateFa,
      maturityDateFa,
      custodianOfficerFa,
      notesFa
    } = req.body;

    if (!buyerId || !collateralType || !nominalValueToman || !identifierNumber) {
      return res.status(400).json({
        success: false,
        error: 'اطلاعات ضروری وثیقه (خریدار، نوع وثیقه، ارزش اسمی و شماره شناسه) وارد نشده است.'
      });
    }

    const collateral = k14Storage.addCollateral({
      buyerId,
      collateralType,
      titleFa: titleFa || 'وثیقه تضامینی جدید',
      identifierNumber,
      issuerBank: issuerBank || 'بانک مرکزی جمهوری اسلامی ایران',
      nominalValueToman: Number(nominalValueToman),
      haircutPercent: haircutPercent !== undefined ? Number(haircutPercent) : undefined,
      weightGrams: weightGrams ? Number(weightGrams) : undefined,
      carat: carat ? Number(carat) : undefined,
      vaultBagId,
      depositDateFa: depositDateFa || '۱۴۰۳/۰۶/۱۸',
      maturityDateFa: maturityDateFa || '۱۴۰۳/۱۲/۲۹',
      custodianOfficerFa: custodianOfficerFa || 'خزانه اسناد مالی دفتر مرکزی',
      notesFa
    });

    res.status(201).json({
      success: true,
      message: `وثیقه با شناسه ${collateral.identifierNumber} با موفقیت در خزانه تضامین ثبت شد.`,
      data: collateral
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST release collateral
k14Router.post('/collaterals/:id/release', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { officerName } = req.body;

    const released = k14Storage.releaseCollateral(id, officerName || 'مدیر امور اعتبارات');

    res.json({
      success: true,
      message: `وثیقه ${released.titleFa} با موفقیت آزاد و فک رهن شد.`,
      data: released
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST request credit limit override (Four-Eyes Workflow)
k14Router.post('/overrides', (req: Request, res: Response) => {
  try {
    const {
      buyerId,
      requestedByFa,
      overrideType,
      requestedAmountText,
      requestedValueToman,
      requestedWeightGrams,
      reasonFa
    } = req.body;

    if (!buyerId || !reasonFa) {
      return res.status(400).json({
        success: false,
        error: 'شناسه طرف حساب و شرح توجیهی درخواست استثنا الزامی است.'
      });
    }

    const created = k14Storage.createOverrideRequest({
      buyerId,
      requestedByFa: requestedByFa || 'کارشناس ارشد فروش سازمانی',
      overrideType: overrideType || 'temporary_rial_limit',
      requestedAmountText: requestedAmountText || 'افزایش موقت سقف اعتباری',
      requestedValueToman: requestedValueToman ? Number(requestedValueToman) : undefined,
      requestedWeightGrams: requestedWeightGrams ? Number(requestedWeightGrams) : undefined,
      reasonFa
    });

    res.status(201).json({
      success: true,
      message: `درخواست استثنا ${created.requestNumber} با موفقیت ثبت و جهت اصل ۴چشم به مدیر ریسک ارجاع شد.`,
      data: created
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST decide override request (Approve / Reject)
k14Router.post('/overrides/:id/decide', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, approverName, noteFa } = req.body;

    if (!decision || (decision !== 'approved' && decision !== 'rejected')) {
      return res.status(400).json({
        success: false,
        error: 'تصمیم نهایی باید approved یا rejected باشد.'
      });
    }

    const updated = k14Storage.decideOverride(
      id,
      decision,
      approverName || 'دکتر صمدی (کمیته اعتبارات)',
      noteFa || 'رسیدگی و اعمال شد.'
    );

    res.json({
      success: true,
      message: decision === 'approved'
        ? `درخواست استثنا ${updated.requestNumber} تصویب و سقف موقت به حساب طرف تجاری افزوده شد.`
        : `درخواست استثنا ${updated.requestNumber} رد گردید.`,
      data: updated
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST acknowledge alert
k14Router.post('/alerts/:id/ack', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    k14Storage.acknowledgeAlert(id);
    res.json({ success: true, message: 'هشدار ریسک رویت و تایید شد.' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET bridge summary for K14 dashboard: list buyer exposure with K13 finalized orders and Zarrin vouchers
k14Router.get('/bridge/buyer-invoices/:buyerId', (req: Request, res: Response) => {
  try {
    const { buyerId } = req.params;
    const profile = k14Storage.findBuyerProfile({ buyerId });
    if (!profile) {
      return res.status(404).json({ success: false, error: 'پروفایل اعتباری خریدار یافت نشد.' });
    }

    res.json({
      success: true,
      data: {
        profile,
        activeOrdersCount: profile.activeOrdersCount,
        unsettledInvoicesCount: profile.unsettledInvoicesCount,
        goldUtilizationPercent: profile.goldUtilizationPercent,
        rialUtilizationPercent: profile.rialUtilizationPercent
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

