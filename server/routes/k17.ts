/**
 * Didar Gold Platform - Kernel Domain K17 API Routes
 * Consumer Ownership Claims, Digital Provenance, Warranty & Anti-Theft Management
 */

import { Router, Request, Response } from 'express';
import { k17Storage } from '../storage-k17.js';

export const k17Router = Router();

// GET all K17 data payload
k17Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k17Storage.getData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /scan/:query - Live scan UID, serial, hallmark or barcode
k17Router.get('/scan/:query', (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const result = k17Storage.scanUid(query);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /claim - Register new consumer ownership claim
k17Router.post('/claim', (req: Request, res: Response) => {
  try {
    const {
      itemUid,
      productTitleFa,
      caratFa,
      weightGrams,
      consumerFullNameFa,
      consumerNationalId,
      consumerMobile,
      consumerCityFa,
      retailerNameFa,
      salesInvoiceNumber,
      purchasePriceToman,
      guildPermitNo
    } = req.body;

    if (!itemUid || !consumerFullNameFa || !consumerNationalId || !consumerMobile || !retailerNameFa || !salesInvoiceNumber) {
      return res.status(400).json({
        success: false,
        error: 'تمام فیلدهای الزامی (شناسه قطعه، نام خریدار، کد ملی، شماره موبایل، فروشگاه و شماره فاکتور) باید تکمیل شوند.'
      });
    }

    const result = k17Storage.createClaim({
      itemUid,
      productTitleFa,
      caratFa,
      weightGrams: Number(weightGrams) || undefined,
      consumerFullNameFa,
      consumerNationalId,
      consumerMobile,
      consumerCityFa,
      retailerNameFa,
      salesInvoiceNumber,
      purchasePriceToman: Number(purchasePriceToman) || undefined,
      guildPermitNo
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /transfer/request - Request ownership transfer
k17Router.post('/transfer/request', (req: Request, res: Response) => {
  try {
    const { claimId, newOwnerNameFa, newOwnerNationalId, newOwnerMobile, reasonFa } = req.body;

    if (!claimId || !newOwnerNameFa || !newOwnerNationalId || !newOwnerMobile) {
      return res.status(400).json({
        success: false,
        error: 'اطلاعات خریدار جدید (نام، کد ملی و موبایل) و شناسه سند الزامی است.'
      });
    }

    const result = k17Storage.requestTransfer({
      claimId,
      newOwnerNameFa,
      newOwnerNationalId,
      newOwnerMobile,
      reasonFa
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /transfer/confirm - Confirm ownership transfer with OTP
k17Router.post('/transfer/confirm', (req: Request, res: Response) => {
  try {
    const { transferId, otpCode } = req.body;

    if (!transferId || !otpCode) {
      return res.status(400).json({
        success: false,
        error: 'شناسه درخواست انتقال و کد تأیید پیامکی الزامی است.'
      });
    }

    const result = k17Storage.confirmTransfer({
      transferId,
      otpCode
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /stolen/report - Report item as stolen
k17Router.post('/stolen/report', (req: Request, res: Response) => {
  try {
    const { itemUid, reporterNameFa, reporterMobile, policeStationFa, policeCaseNumber, descriptionFa } = req.body;

    if (!itemUid || !reporterNameFa || !policeStationFa || !policeCaseNumber) {
      return res.status(400).json({
        success: false,
        error: 'شناسه قطعه، نام گزارش‌دهنده، کلانتری و شماره پرونده انتظامی الزامی است.'
      });
    }

    const result = k17Storage.reportStolen({
      itemUid,
      reporterNameFa,
      reporterMobile: reporterMobile || '',
      policeStationFa,
      policeCaseNumber,
      descriptionFa
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /stolen/resolve - Clear stolen alert
k17Router.post('/stolen/resolve', (req: Request, res: Response) => {
  try {
    const { reportId } = req.body;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        error: 'شناسه گزارش سرقت الزامی است.'
      });
    }

    const result = k17Storage.resolveStolen(reportId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /warranty/service - Add warranty service log
k17Router.post('/warranty/service', (req: Request, res: Response) => {
  try {
    const { warrantyId, serviceTypeFa, workshopNameFa, descriptionFa, costToman, wasFreeUnderWarranty, officerNameFa } = req.body;

    if (!warrantyId || !serviceTypeFa || !descriptionFa) {
      return res.status(400).json({
        success: false,
        error: 'شناسه گارانتی، عنوان خدمت و شرح اقدامات الزامی است.'
      });
    }

    const result = k17Storage.addWarrantyService({
      warrantyId,
      serviceTypeFa,
      workshopNameFa,
      descriptionFa,
      costToman: Number(costToman) || 0,
      wasFreeUnderWarranty: wasFreeUnderWarranty ?? true,
      officerNameFa
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
