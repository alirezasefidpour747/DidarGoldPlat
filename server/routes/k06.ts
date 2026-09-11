/**
 * Didar Gold Platform - Domain K06 API Router
 * Unique Item IDs, Passports, Metallurgical Assay & Provenance Chain
 */

import { Router, Request, Response } from 'express';
import { k06Storage } from '../storage-k06.js';

export const k06Router = Router();

// GET all K06 Domain Data
k06Router.get('/', (req: Request, res: Response) => {
  try {
    const data = k06Storage.getData();
    res.json({
      success: true,
      data
    });
  } catch (err: unknown) {
    console.error('Error fetching K06 data:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در بارگذاری اطلاعات شناسنامه‌های یکتا و اصالت طلا (K06).'
    });
  }
});

// GET single Passport by UID or Serial
k06Router.get('/passport/:uid', (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const passport = k06Storage.getPassportByUid(uid);
    if (!passport) {
      return res.status(404).json({
        success: false,
        message: 'گذرنامه قطعه طلا با این شناسه یافت نشد.'
      });
    }

    const events = k06Storage.getEventsByPassportId(passport.id);

    res.json({
      success: true,
      data: {
        passport,
        events
      }
    });
  } catch (err: unknown) {
    console.error('Error fetching passport details:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در بازیابی جزئیات گذرنامه طلا.'
    });
  }
});

// POST Mint new physical item passport
k06Router.post('/mint', (req: Request, res: Response) => {
  try {
    const {
      itemNature,
      itemNatureFa,
      productSkuId,
      productSkuCode,
      productTitleFa,
      variantId,
      sizeLabelFa,
      colorFa,
      carat,
      caratFa,
      nominalWeightGrams,
      actualScaleWeightGrams,
      scaleModel,
      assayLabName,
      assayUnionPermitNo,
      assayPacketCode,
      hallmarkCode,
      certifiedFineness,
      assayMethod,
      assayMethodFa,
      inspectorName,
      laserEngravingText,
      laserPositionFa,
      qcInspectorName,
      qcScore,
      surfaceFinishGradeFa,
      porosityCheckFa,
      qcNotes,
      macroPhotoUrl,
      macroPhotos
    } = req.body;

    if (!productSkuId || !actualScaleWeightGrams || Number(actualScaleWeightGrams) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'انتخاب مدل کالا و ثبت وزن دقیق روی ترازو الزامی است.'
      });
    }

    // شرط اختصاصی کاربر: فقط برای طلای آبشده بخش ری‌گیری و انگ رسمی اجباری است
    if (itemNature === 'melted_gold') {
      if (!assayLabName || !certifiedFineness || !hallmarkCode) {
        return res.status(400).json({
          success: false,
          message: 'برای طلای آبشده، ثبت نام آزمایشگاه ری‌گیری، کد انگ رسمی و عیار قطعی الزامی است.'
        });
      }
    }

    const created = k06Storage.mintPassport({
      itemNature: itemNature || 'manufactured_jewelry',
      itemNatureFa,
      productSkuId,
      productSkuCode,
      productTitleFa,
      variantId,
      sizeLabelFa,
      colorFa: colorFa || 'طلای زرد ۱۸ عیار',
      carat: carat || '18k_750',
      caratFa: caratFa || '۱۸ عیار (۷۵۰)',
      nominalWeightGrams: Number(nominalWeightGrams) || Number(actualScaleWeightGrams),
      actualScaleWeightGrams: Number(actualScaleWeightGrams),
      scaleModel,
      assayLabName,
      assayUnionPermitNo,
      assayPacketCode,
      hallmarkCode,
      certifiedFineness: certifiedFineness !== undefined ? Number(certifiedFineness) : undefined,
      assayMethod: assayMethod || 'both',
      assayMethodFa: assayMethodFa || 'کوپلاسیون رسمی و طیف‌سنجی XRF',
      inspectorName,
      laserEngravingText,
      laserPositionFa,
      qcInspectorName,
      qcScore: qcScore !== undefined ? Number(qcScore) : undefined,
      surfaceFinishGradeFa,
      porosityCheckFa,
      qcNotes,
      macroPhotoUrl,
      macroPhotos
    });

    res.status(201).json({
      success: true,
      data: created,
      message: `گذرنامه دیجیتال با شناسه یکتای ${created.uid} صادر و در خزانه مرکزی ثبت گردید.`
    });
  } catch (err: unknown) {
    console.error('Error minting passport:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'خطا در صدور شناسنامه یکتای طلا.'
    });
  }
});

// POST Record new provenance event
k06Router.post('/provenance-event', (req: Request, res: Response) => {
  try {
    const {
      passportId,
      eventType,
      eventTypeFa,
      titleFa,
      descriptionFa,
      actorName,
      actorRoleFa,
      fromHolder,
      toHolder,
      locationFa,
      certificateRef
    } = req.body;

    if (!passportId || !eventType || !titleFa) {
      return res.status(400).json({
        success: false,
        message: 'شناسه گذرنامه، نوع رویداد و عنوان واقعه الزامی است.'
      });
    }

    const event = k06Storage.recordProvenanceEvent({
      passportId,
      eventType,
      eventTypeFa: eventTypeFa || 'رویداد اصالت و انتقال فیزیکی',
      titleFa,
      descriptionFa: descriptionFa || '',
      actorName: actorName || 'کاربر سیستم',
      actorRoleFa: actorRoleFa || 'کارشناس نظارت',
      fromHolder: fromHolder || 'نامشخص',
      toHolder: toHolder || 'نامشخص',
      locationFa: locationFa || 'تهران',
      certificateRef
    });

    res.status(201).json({
      success: true,
      data: event,
      message: 'رویداد جدید با موفقیت به دفتر کل تغییرناپذیر زنجیره اصالت افزوده شد.'
    });
  } catch (err: unknown) {
    console.error('Error recording provenance event:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'خطا در ثبت واقعه زنجیره اصالت.'
    });
  }
});

// POST Transfer ownership to consumer
k06Router.post('/transfer-ownership', (req: Request, res: Response) => {
  try {
    const {
      passportId,
      ownerName,
      ownerNationalCode,
      ownerPhone,
      retailInvoiceNumber,
      storeName,
      notes
    } = req.body;

    if (!passportId || !ownerName || !ownerNationalCode || !retailInvoiceNumber) {
      return res.status(400).json({
        success: false,
        message: 'شناسه قطعه، نام خریدار، کد ملی و شماره فاکتور رسمی الزامی است.'
      });
    }

    const updated = k06Storage.transferOwnership({
      passportId,
      ownerName,
      ownerNationalCode,
      ownerPhone: ownerPhone || '',
      retailInvoiceNumber,
      storeName: storeName || 'گالری رسمی دیدار',
      notes
    });

    res.json({
      success: true,
      data: updated,
      message: `مالکیت قطعه با موفقیت به نام ${ownerName} ثبت و گارانتی اصالت فعال شد.`
    });
  } catch (err: unknown) {
    console.error('Error transferring ownership:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'خطا در ثبت انتقال مالکیت طلا.'
    });
  }
});

// POST Toggle Stolen / Lost report
k06Router.post('/toggle-stolen', (req: Request, res: Response) => {
  try {
    const { passportId, isStolen, reason, policeReportNo } = req.body;

    if (!passportId || typeof isStolen !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'شناسه گذرنامه و وضعیت سرقت الزامی است.'
      });
    }

    const updated = k06Storage.toggleStolenReport({
      passportId,
      isStolen,
      reason,
      policeReportNo
    });

    res.json({
      success: true,
      data: updated,
      message: isStolen
        ? 'هشدار سرقت این قطعه با موفقیت در شبکه سراسری استعلام اصالت طلا فعال گردید.'
        : 'پرچم مفقودی / سرقت این قطعه با موفقیت ابطال و به وضعیت عادی بازگردانده شد.'
    });
  } catch (err: unknown) {
    console.error('Error toggling stolen report:', err);
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'خطا در تغییر وضعیت اعلام سرقت.'
    });
  }
});

// GET Public Verification Lookup
k06Router.get('/verify/:query', (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const result = k06Storage.verifyPublic(query);
    res.json({
      success: true,
      data: result
    });
  } catch (err: unknown) {
    console.error('Error verifying item:', err);
    res.status(500).json({
      success: false,
      message: 'خطا در استعلام عمومی اصالت قطعه طلا.'
    });
  }
});
