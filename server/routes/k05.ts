/**
 * Didar Gold Platform - Domain K05 API Router
 * Products, Catalog SKU, Variants, Narrative Assets & Supplier Capacity Offers
 */

import { Router, Request, Response } from 'express';
import { k05Storage } from '../storage-k05.js';

export const k05Router = Router();

// GET all K05 Domain Data
k05Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k05Storage.getData();
    res.json({
      success: true,
      data
    });
  } catch (err: unknown) {
    console.error('Error fetching K05 data:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در بارگذاری اطلاعات کاتالوگ، محصولات و ظرفیت تأمین (K05).'
    });
  }
});

// POST Create new Product SKU
k05Router.post('/products', (req: Request, res: Response) => {
  try {
    const {
      titleFa,
      category,
      categoryFa,
      carat,
      caratFa,
      baseWeightGrams,
      weightTolerancePercent,
      makerWageType,
      makerWageValue,
      recommendedWholesaleMargin,
      stonesType,
      stonesTypeFa,
      stonesWeightDeducted,
      designStyleFa,
      storylineFa,
      craftingTechniqueFa,
      tags,
      variants,
      narrativeAssets
    } = req.body;

    if (!titleFa) {
      return res.status(400).json({
        success: false,
        message: 'عنوان مدل کالا الزامی است.'
      });
    }

    const created = k05Storage.createProduct({
      titleFa,
      category,
      categoryFa,
      carat,
      caratFa,
      baseWeightGrams: Number(baseWeightGrams) || 10,
      weightTolerancePercent: Number(weightTolerancePercent) || 2,
      makerWageType,
      makerWageValue: Number(makerWageValue) || 6,
      recommendedWholesaleMargin: Number(recommendedWholesaleMargin) || 2,
      stonesType,
      stonesTypeFa,
      stonesWeightDeducted: Boolean(stonesWeightDeducted),
      designStyleFa,
      storylineFa,
      craftingTechniqueFa,
      tags: Array.isArray(tags) ? tags : [],
      variants,
      narrativeAssets
    });

    res.status(201).json({
      success: true,
      data: created,
      message: `مدل کالا «${created.titleFa}» با کد ${created.skuCode} با موفقیت در کاتالوگ ثبت گردید.`
    });
  } catch (err: unknown) {
    console.error('Error creating product SKU:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'خطا در ثبت مدل محصول در کاتالوگ.'
    });
  }
});

// PUT Update Product SKU
k05Router.put('/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = k05Storage.updateProduct(id, req.body);
    res.json({
      success: true,
      data: updated,
      message: `مدل کالا ${updated.skuCode} با موفقیت به‌روزرسانی شد.`
    });
  } catch (err: unknown) {
    console.error('Error updating product SKU:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'خطا در ویرایش اطلاعات مدل کالا.'
    });
  }
});

// DELETE Product SKU
k05Router.delete('/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = k05Storage.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'مدل کالا جهت حذف یافت نشد.'
      });
    }
    res.json({
      success: true,
      message: 'مدل کالا و پیشنهادهای متناظر با موفقیت از کاتالوگ حذف گردید.'
    });
  } catch (err: unknown) {
    console.error('Error deleting product SKU:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف مدل کالا.'
    });
  }
});

// POST Create new Supplier Capacity Offer
k05Router.post('/offers', (req: Request, res: Response) => {
  try {
    const {
      productSkuId,
      supplierName,
      supplierCityFa,
      supplierGrade,
      weeklyCapacityGrams,
      minOrderQuantityGrams,
      leadTimeDays,
      offeredWageType,
      offeredWageValue,
      alloyQualityGuarantee,
      lossScrapAllowancePercent,
      notes
    } = req.body;

    if (!productSkuId || !supplierName) {
      return res.status(400).json({
        success: false,
        message: 'انتخاب مدل کالا و نام کارگاه سازنده الزامی است.'
      });
    }

    const createdOffer = k05Storage.createSupplyOffer({
      productSkuId,
      supplierName,
      supplierCityFa,
      supplierGrade,
      weeklyCapacityGrams: Number(weeklyCapacityGrams) || 1000,
      minOrderQuantityGrams: Number(minOrderQuantityGrams) || 150,
      leadTimeDays: Number(leadTimeDays) || 3,
      offeredWageType,
      offeredWageValue: Number(offeredWageValue) || 5.5,
      alloyQualityGuarantee: alloyQualityGuarantee !== undefined ? alloyQualityGuarantee : true,
      lossScrapAllowancePercent: Number(lossScrapAllowancePercent) || 0.35,
      notes
    });

    res.status(201).json({
      success: true,
      data: createdOffer,
      message: `پیشنهاد ظرفیت تولید با کد ${createdOffer.offerCode} از طرف ${createdOffer.supplierName} ثبت شد.`
    });
  } catch (err: unknown) {
    console.error('Error creating supply offer:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'خطا در ثبت پیشنهاد ظرفیت تولید کارگاه.'
    });
  }
});

// PATCH Update Supplier Capacity Offer Status
k05Router.patch('/offers/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'negotiating', 'paused', 'exhausted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'وضعیت ارسالی نامعتبر است.'
      });
    }

    const updated = k05Storage.updateOfferStatus(id, status);
    res.json({
      success: true,
      data: updated,
      message: `وضعیت پیشنهاد ظرفیت ساخت به «${updated.statusFa}» تغییر یافت.`
    });
  } catch (err: unknown) {
    console.error('Error updating offer status:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'خطا در تغییر وضعیت پیشنهاد ظرفیت.'
    });
  }
});

// POST Estimate Product Price based on live market rate
k05Router.post('/estimate-price', (req: Request, res: Response) => {
  try {
    const { skuId, variantId } = req.body;
    if (!skuId) {
      return res.status(400).json({
        success: false,
        message: 'شناسه مدل کالا الزامی است.'
      });
    }
    const calculation = k05Storage.estimateProductPrice(skuId, variantId);
    res.json({
      success: true,
      data: calculation
    });
  } catch (err: unknown) {
    console.error('Error calculating price estimation:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'خطا در محاسبه آنلاین قیمت کاتالوگ.'
    });
  }
});

// POST Update Market Gold Spot Rate
k05Router.post('/market-rate', (req: Request, res: Response) => {
  try {
    const { gold18kGramIrr, mesghal17kIrr, usdIrr, ounceUsd } = req.body;
    const updated = k05Storage.updateMarketRate({
      gold18kGramIrr: Number(gold18kGramIrr) || undefined,
      mesghal17kIrr: Number(mesghal17kIrr) || undefined,
      usdIrr: Number(usdIrr) || undefined,
      ounceUsd: Number(ounceUsd) || undefined
    });

    res.json({
      success: true,
      data: updated,
      message: 'نرخ لحظه‌ای طلا و ارز با موفقیت به‌روزرسانی شد.'
    });
  } catch (err: unknown) {
    console.error('Error updating market rate:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت نرخ جدید بازار طلا.'
    });
  }
});
