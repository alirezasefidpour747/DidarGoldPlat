/**
 * Didar Gold Platform - Kernel Domain K20 API Routes
 * Secondary Market, Refurbishment Workshop, CPO Showcase & Precious Scrap Smelting/Recycling
 */

import { Router, Request, Response } from 'express';
import { k20Storage } from '../storage-k20.js';

export const k20Router = Router();

// GET all K20 data payload
k20Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k20Storage.getData();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single refurbished item
k20Router.get('/refurbished/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = k20Storage.getRefurbishedItemById(id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'قطعه احیاشده مورد نظر یافت نشد.' });
    }
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create intake for refurbishment
k20Router.post('/refurbished', (req: Request, res: Response) => {
  try {
    const {
      sourceBuybackId,
      originalTitleFa,
      categoryFa,
      grossWeightGrams,
      netGoldWeightGrams,
      hasPreciousStones,
      gemsDescriptionFa,
      workshopNameFa,
      artisanNameFa,
      refurbishCostToman,
      beforeAfterNotesFa
    } = req.body;

    if (!originalTitleFa || !grossWeightGrams) {
      return res.status(400).json({
        success: false,
        error: 'عنوان قطعه و وزن ناخالص الزامی است.'
      });
    }

    const item = k20Storage.createRefurbishIntake({
      sourceBuybackId,
      originalTitleFa,
      categoryFa,
      grossWeightGrams: Number(grossWeightGrams),
      netGoldWeightGrams: netGoldWeightGrams ? Number(netGoldWeightGrams) : undefined,
      hasPreciousStones: Boolean(hasPreciousStones),
      gemsDescriptionFa,
      workshopNameFa,
      artisanNameFa,
      refurbishCostToman: refurbishCostToman ? Number(refurbishCostToman) : undefined,
      beforeAfterNotesFa
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH update refurbished item stage & QC
k20Router.patch('/refurbished/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, qcScore, qcInspectorFa, passportUid, notesFa, operatorNameFa } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'ارسال وضعیت جدید الزامی است.' });
    }

    const updated = k20Storage.updateRefurbishStatus(id, {
      status,
      qcScore: qcScore !== undefined ? Number(qcScore) : undefined,
      qcInspectorFa,
      passportUid,
      notesFa,
      operatorNameFa
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single melt batch
k20Router.get('/melt-batches/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const batch = k20Storage.getMeltBatchById(id);
    if (!batch) {
      return res.status(404).json({ success: false, error: 'بوته ذوب مورد نظر یافت نشد.' });
    }
    res.json({ success: true, data: batch });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new melt batch
k20Router.post('/melt-batches', (req: Request, res: Response) => {
  try {
    const {
      crucibleNumber,
      furnaceOperatorFa,
      sourceItemsCount,
      sourceItemsSummaryFa,
      totalInputWeightGrams,
      expectedPurity,
      destination
    } = req.body;

    if (!crucibleNumber || !totalInputWeightGrams) {
      return res.status(400).json({
        success: false,
        error: 'شماره بوته ذوب و وزن ورودی قراضه الزامی است.'
      });
    }

    const batch = k20Storage.createMeltBatch({
      crucibleNumber,
      furnaceOperatorFa: furnaceOperatorFa || 'استاد جواد معتمدی',
      sourceItemsCount: Number(sourceItemsCount) || 1,
      sourceItemsSummaryFa: sourceItemsSummaryFa || 'طلای قراضه و متفرقه درجه ۳',
      totalInputWeightGrams: Number(totalInputWeightGrams),
      expectedPurity: expectedPurity ? Number(expectedPurity) : 0.750,
      destination
    });

    res.status(201).json({ success: true, data: batch });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH update melt batch status / assay results
k20Router.patch('/melt-batches/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status,
      meltedIngotWeightGrams,
      assayLabNameFa,
      assayCertificateNumber,
      certifiedPurity,
      destination,
      operatorNameFa
    } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'ارسال وضعیت جدید بوته الزامی است.' });
    }

    const updated = k20Storage.updateMeltBatch(id, {
      status,
      meltedIngotWeightGrams: meltedIngotWeightGrams !== undefined ? Number(meltedIngotWeightGrams) : undefined,
      assayLabNameFa,
      assayCertificateNumber,
      certifiedPurity: certifiedPurity !== undefined ? Number(certifiedPurity) : undefined,
      destination,
      operatorNameFa
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create gem recovery
k20Router.post('/gems', (req: Request, res: Response) => {
  try {
    const {
      gemTypeFa,
      sourceBuybackNumber,
      caratWeight,
      cutShapeFa,
      colorGrade,
      clarityGrade,
      estimatedValueToman,
      gemologistFa,
      allocatedVaultFa
    } = req.body;

    if (!gemTypeFa || !caratWeight || !estimatedValueToman) {
      return res.status(400).json({
        success: false,
        error: 'نوع گوهرسنگ، وزن قیراط و ارزش برآوردی الزامی است.'
      });
    }

    const gem = k20Storage.createGemRecovery({
      gemTypeFa,
      sourceBuybackNumber: sourceBuybackNumber || 'BBK-1404-001',
      caratWeight: Number(caratWeight),
      cutShapeFa: cutShapeFa || 'تراش استاندارد',
      colorGrade: colorGrade || 'Grade F',
      clarityGrade: clarityGrade || 'VS1',
      estimatedValueToman: Number(estimatedValueToman),
      gemologistFa,
      allocatedVaultFa
    });

    res.status(201).json({ success: true, data: gem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH update gem status
k20Router.patch('/gems/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, allocatedVaultFa, operatorNameFa } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'ارسال وضعیت جدید الزامی است.' });
    }

    const updated = k20Storage.updateGemStatus(id, {
      status,
      allocatedVaultFa,
      operatorNameFa
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
