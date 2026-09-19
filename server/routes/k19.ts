/**
 * Didar Gold Platform - Kernel Domain K19 API Routes
 * Buyback, Physical Assay, Trade-In Valuation & Settlement
 */

import { Router, Request, Response } from 'express';
import { k19Storage } from '../storage-k19.js';

export const k19Router = Router();

// GET all K19 data payload
k19Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k19Storage.getData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single record by ID
k19Router.get('/records/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = k19Storage.getRecordById(id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'پرونده بازخرید مورد نظر یافت نشد.' });
    }
    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST calculate real-time estimate
k19Router.post('/estimate', (req: Request, res: Response) => {
  try {
    const {
      source,
      purity,
      grossWeightGrams,
      tareWeightGrams,
      hasPreciousStones,
      certifiedStoneValuationToman,
      conditionGrade
    } = req.body;

    if (!grossWeightGrams || Number(grossWeightGrams) <= 0) {
      return res.status(400).json({ success: false, error: 'وارد کردن وزن ناخالص طلا الزامی است.' });
    }

    const estimate = k19Storage.calculateValuation({
      source: source || 'external_market_gold',
      purity: purity ? Number(purity) : 0.750,
      grossWeightGrams: Number(grossWeightGrams),
      tareWeightGrams: tareWeightGrams ? Number(tareWeightGrams) : 0,
      hasPreciousStones: Boolean(hasPreciousStones),
      certifiedStoneValuationToman: certifiedStoneValuationToman ? Number(certifiedStoneValuationToman) : 0,
      conditionGrade: conditionGrade || 'grade_b_normal'
    });

    res.json({ success: true, data: estimate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new buyback intake
k19Router.post('/records', (req: Request, res: Response) => {
  try {
    const {
      itemUid,
      itemTitleFa,
      source,
      conditionGrade,
      sellerFullName,
      sellerNationalId,
      sellerMobile,
      sellerBankIban,
      sellerBankNameFa,
      sellerCity,
      grossWeightGrams,
      tareWeightGrams,
      testedKaratFa,
      testedPurity,
      hasPreciousStones,
      preciousStoneDescriptionFa,
      certifiedStoneValuationToman,
      assayMethod,
      operatorNameFa
    } = req.body;

    if (!itemTitleFa || !sellerFullName || !sellerNationalId || !sellerMobile || !grossWeightGrams) {
      return res.status(400).json({
        success: false,
        error: 'تکمیل تمامی فیلدهای الزامی (عنوان قطعه، مشخصات فروشنده، کد ملی، شماره تماس و وزن ناخالص) اجباری است.'
      });
    }

    const record = k19Storage.createRecord({
      itemUid,
      itemTitleFa,
      source: source || 'external_market_gold',
      conditionGrade: conditionGrade || 'grade_b_normal',
      sellerFullName,
      sellerNationalId,
      sellerMobile,
      sellerBankIban,
      sellerBankNameFa,
      sellerCity,
      grossWeightGrams: Number(grossWeightGrams),
      tareWeightGrams: tareWeightGrams ? Number(tareWeightGrams) : 0,
      testedKaratFa,
      testedPurity: testedPurity ? Number(testedPurity) : 0.750,
      hasPreciousStones: Boolean(hasPreciousStones),
      preciousStoneDescriptionFa,
      certifiedStoneValuationToman: certifiedStoneValuationToman ? Number(certifiedStoneValuationToman) : 0,
      assayMethod,
      operatorNameFa
    });

    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH update assay & weights
k19Router.patch('/records/:id/assay', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      testedPurity,
      grossWeightGrams,
      tareWeightGrams,
      certifiedStoneValuationToman,
      conditionGrade,
      notesFa,
      operatorNameFa
    } = req.body;

    const updated = k19Storage.updateAssayAndValuation(id, {
      testedPurity: testedPurity !== undefined ? Number(testedPurity) : undefined,
      grossWeightGrams: grossWeightGrams !== undefined ? Number(grossWeightGrams) : undefined,
      tareWeightGrams: tareWeightGrams !== undefined ? Number(tareWeightGrams) : undefined,
      certifiedStoneValuationToman: certifiedStoneValuationToman !== undefined ? Number(certifiedStoneValuationToman) : undefined,
      conditionGrade,
      notesFa,
      operatorNameFa
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST confirm settlement
k19Router.post('/records/:id/settle', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { method, transactionRef, operatorNameFa, vaultId } = req.body;

    if (!method) {
      return res.status(400).json({ success: false, error: 'انتخاب روش تسویه الزامی است.' });
    }

    const settled = k19Storage.confirmPayoutAndSettle(id, {
      method,
      transactionRef,
      operatorNameFa,
      vaultId
    });

    res.json({ success: true, data: settled });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST route destination to K20 / Vault
k19Router.post('/records/:id/route', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { destination, notesFa, operatorNameFa } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, error: 'تعیین مقصد فیزیکی قطعه الزامی است.' });
    }

    const routed = k19Storage.routeDestination(id, {
      destination,
      notesFa,
      operatorNameFa
    });

    res.json({ success: true, data: routed });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
