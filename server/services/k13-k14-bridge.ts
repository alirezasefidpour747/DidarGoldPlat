/**
 * Didar Gold Platform - K13 (Invoicing & Moaddian) to K14 (Credit & Exposure) & Zarrin Bridge Service
 * سرویس یکپارچه‌ساز صورتحساب K13 و ماژول اعتبارات K14 با انتقال خودکار کالا به وضعیت «تحویل به زرین»
 */

import { k13Storage } from '../storage-k13.js';
import { k14Storage } from '../storage-k14.js';
import { k14K15BridgeService } from './k14-k15-bridge.js';
import type { Invoice, InvoiceItem } from '../../src/types/k13.js';
import type { BuyerCreditProfile, CreditExposureAlert, CreditSimulationResult, K13K14FinalizationResult } from '../../src/types/k14.js';

export interface FinalizeInvoiceOptions {
  invoiceId: string;
  operatorName?: string;
  forceBypassOverride?: boolean;
  overrideReason?: string;
}

export interface ZarrinDeliveryItemSummary {
  invoiceId: string;
  invoiceNumber: string;
  buyerOrgNameFa: string;
  orderCode?: string;
  itemId: string;
  sku: string;
  titleFa: string;
  weightGrams: number;
  carat: number;
  totalPriceToman: number;
  deliveryStatus: string;
  deliveryStatusFa: string;
  zarrinDeliveryReceiptNumber: string;
  zarrinDeliveryDateFa: string;
  zarrinVoucherNumber?: string;
}

export class K13K14BridgeService {
  /**
   * شبیه‌سازی کنترل اعتباری K14 پیش از نهایی‌سازی فاکتور
   */
  public simulateCreditImpact(invoiceId: string): CreditSimulationResult {
    const invoices = k13Storage.getInvoices();
    const inv = invoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
    if (!inv) {
      throw new Error(`صورتحساب با شناسه ${invoiceId} یافت نشد.`);
    }

    const goldCommitment = inv.settlementGoldWeightGrams750 ?? inv.totalWeightGrams;
    const rialCommitment = inv.settlementRialAmountToman ?? inv.grandTotalToman;

    const feasibility = k14Storage.checkCreditFeasibility(
      { buyerId: inv.buyerOrgId, nationalId: inv.buyerNationalId, nameFa: inv.buyerNameFa },
      goldCommitment,
      rialCommitment
    );

    const profile = feasibility.profile;
    return {
      allowed: feasibility.allowed,
      reasonFa: feasibility.reasonFa,
      buyerFound: !!profile,
      buyerOrgNameFa: profile?.buyerOrgNameFa || inv.buyerNameFa,
      currentGoldExposureGrams: profile?.goldExposureGrams,
      currentRialExposureToman: profile?.rialExposureToman,
      projectedGoldExposureGrams: feasibility.projectedGoldExposureGrams,
      projectedRialExposureToman: feasibility.projectedRialExposureToman,
      projectedGoldUtilizationPercent: feasibility.projectedGoldUtilization,
      projectedRialUtilizationPercent: feasibility.projectedRialUtilization,
      requiresOverride: feasibility.requiresOverride,
      collateralCoveragePercent: profile?.collateralCoveragePercent
    };
  }

  /**
   * نهایی‌سازی صورتحساب K13، ثبت افزایش مواجهه در K14 و انتقال خودکار اقلام به وضعیت تحویل به زرین
   */
  public finalizeInvoiceAndSyncK14(options: FinalizeInvoiceOptions): {
    success: boolean;
    result?: K13K14FinalizationResult;
    invoice?: Invoice;
    error?: string;
    requiresOverride?: boolean;
  } {
    const { invoiceId, operatorName = 'مدیر سیستم فروش و بازرگانی', forceBypassOverride = false, overrideReason } = options;

    const invoices = k13Storage.getInvoices();
    const inv = invoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
    if (!inv) {
      return { success: false, error: `صورتحساب با شناسه ${invoiceId} یافت نشد.` };
    }

    // بررسی اینکه آیا قبلاً نهایی و تحویل زرین شده است
    if (inv.status === 'issued' && inv.deliveryStatus === 'delivered_to_zarrin') {
      return {
        success: true,
        invoice: inv,
        result: {
          success: true,
          message: `این فاکتور قبلاً نهایی شده و با شماره رسید ${inv.zarrinDeliveryReceiptNumber || 'موجود'} به زرین تحویل گردیده است.`,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          buyerOrgNameFa: inv.buyerNameFa,
          goldExposureIncrementGrams: inv.k14ExposureRecorded?.goldExposureIncrementGrams || 0,
          rialExposureIncrementToman: inv.k14ExposureRecorded?.rialExposureIncrementToman || 0,
          itemsDeliveredCount: inv.items.length,
          totalWeightDeliveredGrams: inv.totalWeightGrams,
          zarrinDeliveryReceiptNumber: inv.zarrinDeliveryReceiptNumber || 'REC-ZR-ALREADY-DELIVERED',
          zarrinDeliveryDateFa: inv.zarrinDeliveryDateFa || 'ثبت‌شده',
          zarrinVoucherNumber: inv.zarrinVoucher?.voucherNumber || 'SANAD-ZR-N/A',
          updatedCreditProfile: k14Storage.findBuyerProfile({ buyerId: inv.buyerOrgId, nameFa: inv.buyerNameFa }) || ({} as BuyerCreditProfile)
        }
      };
    }

    const goldCommitment = inv.settlementGoldWeightGrams750 ?? inv.totalWeightGrams;
    const rialCommitment = inv.settlementRialAmountToman ?? inv.grandTotalToman;

    // ۱. کنترل اعتباری در K14
    const feasibility = k14Storage.checkCreditFeasibility(
      { buyerId: inv.buyerOrgId, nationalId: inv.buyerNationalId, nameFa: inv.buyerNameFa },
      goldCommitment,
      rialCommitment
    );

    if (!feasibility.allowed && !forceBypassOverride) {
      return {
        success: false,
        requiresOverride: true,
        error: feasibility.reasonFa
      };
    }

    // ۲. ثبت افزایش مواجهه اعتباری در K14
    const { profile: updatedProfile, alert } = k14Storage.recordInvoiceExposure(
      { buyerId: inv.buyerOrgId, nationalId: inv.buyerNationalId, nameFa: inv.buyerNameFa },
      goldCommitment,
      rialCommitment,
      inv.invoiceNumber
    );

    // اگر بای‌پس استثنا ثبت شده بود، درخواست استثنا را در K14 نیز لاگ می‌کنیم
    if (forceBypassOverride && overrideReason) {
      k14Storage.createOverrideRequest({
        buyerId: updatedProfile.buyerId,
        requestedByFa: operatorName,
        overrideType: goldCommitment > 0 ? 'order_force_release' : 'temporary_rial_limit',
        requestedAmountText: `مجوز خروج کالا و نهایی‌سازی فاکتور ${inv.invoiceNumber}`,
        requestedValueToman: rialCommitment,
        requestedWeightGrams: goldCommitment,
        reasonFa: overrideReason
      });
    }

    // ۳. تولید شماره رسید و تاریخ تحویل زرین
    const now = new Date();
    const nowFa = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(now);
    const zarrinReceiptNumber = `REC-ZR-1403-${Math.floor(100000 + Math.random() * 900000)}`;

    // ۴. به‌روزرسانی تک‌تک اقلام کالا به وضعیت «تحویل به زرین»
    inv.items.forEach((item: InvoiceItem) => {
      item.deliveryStatus = 'delivered_to_zarrin';
      item.deliveryStatusFa = 'تحویل به زرین شده';
      item.zarrinDeliveryDateFa = nowFa;
      item.zarrinDeliveryReceiptNumber = zarrinReceiptNumber;
    });

    // ۵. به‌روزرسانی کل صورتحساب و سند زرین
    inv.status = 'issued';
    inv.statusFa = 'صورتحساب قطعی صادرشده و اقلام تحویل زرین شد';
    inv.deliveryStatus = 'delivered_to_zarrin';
    inv.deliveryStatusFa = 'تحویل به کاردکس زرین شده';
    inv.zarrinDeliveryReceiptNumber = zarrinReceiptNumber;
    inv.zarrinDeliveryDateFa = nowFa;

    if (inv.zarrinVoucher) {
      inv.zarrinVoucher.status = 'posted_to_zarrin';
      inv.zarrinVoucher.statusFa = 'سند دوبل تحویل کالا و تسویه در دفترکل زرین ثبت شد';
    } else {
      inv.zarrinVoucher = {
        voucherNumber: `SANAD-ZR-1403-${Math.floor(1000 + Math.random() * 9000)}`,
        voucherDateFa: nowFa,
        rialDebitAccount: `بدهکاران تجاری / ${inv.buyerNameFa}`,
        rialAmountToman: rialCommitment,
        goldDebitAccount: goldCommitment > 0 ? 'حساب طلایی / کاردکس امانی طلای ۷۵۰ (کد ۲۰۲۰۱)' : 'تسویه نقدی',
        goldWeightGrams750: goldCommitment,
        goldSpotRateAppliedToman: inv.lockedQuoteRateToman || 4350000,
        status: 'posted_to_zarrin',
        statusFa: 'سند دوبل تحویل کالا و تسویه در دفترکل زرین ثبت شد',
        zarrinBatchId: `BATCH-ZR-${Math.floor(1000 + Math.random() * 9000)}`
      };
    }

    // ۶. پیوند داده‌ای K14 روی فاکتور
    inv.k14ExposureRecorded = {
      goldExposureIncrementGrams: goldCommitment,
      rialExposureIncrementToman: rialCommitment,
      recordedAtFa: nowFa,
      buyerExposureStatus: updatedProfile.status,
      collateralCoveragePercent: updatedProfile.collateralCoveragePercent,
      operatorFa: operatorName
    };

    // ۷. ارسال خودکار داده‌های تاییدشده اعتباری K14 به K15 جهت صدور سند حسابداری دوطرفه
    let k15VoucherNum: string | undefined;
    try {
      if (k14K15BridgeService.isAutoSyncEnabled()) {
        const syncRes = k14K15BridgeService.syncK14ApprovedInvoiceToK15({
          invoiceId: inv.id,
          operatorName,
          forceBypassOverride: true,
          overrideReason: 'تایید نهایی اعتباری صورتحساب در هسته K14'
        });
        if (syncRes.success && syncRes.voucher) {
          k15VoucherNum = syncRes.voucher.voucherNumber;
        }
      }
    } catch (k15Err) {
      console.warn('Auto-sync to K15 deferred:', k15Err);
    }

    const alertsTriggered = alert ? [alert] : [];

    const finalResult: K13K14FinalizationResult = {
      success: true,
      message: `صورتحساب ${inv.invoiceNumber} با موفقیت قطعی گردید. کلیه ${inv.items.length} قلم کالا (مجموع وزن ${inv.totalWeightGrams} گرم) با شماره رسید ${zarrinReceiptNumber} در وضعیت «تحویل به زرین» قرار گرفتند، مواجهه اعتباری K14 ثبت شد و سند حسابداری دوطرفه ${k15VoucherNum || 'K15'} صادر گردید.`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      buyerOrgNameFa: inv.buyerNameFa,
      goldExposureIncrementGrams: goldCommitment,
      rialExposureIncrementToman: rialCommitment,
      itemsDeliveredCount: inv.items.length,
      totalWeightDeliveredGrams: inv.totalWeightGrams,
      zarrinDeliveryReceiptNumber: zarrinReceiptNumber,
      zarrinDeliveryDateFa: nowFa,
      zarrinVoucherNumber: inv.zarrinVoucher.voucherNumber,
      k15VoucherNumber: k15VoucherNum,
      k15DualLedgerPosted: Boolean(k15VoucherNum),
      updatedCreditProfile: updatedProfile,
      alertsTriggered,
      warningNoteFa: updatedProfile.status === 'warning'
        ? `توجه: ضریب بهره‌برداری اعتباری خریدار پس از این سفارش به ${Math.max(updatedProfile.goldUtilizationPercent, updatedProfile.rialUtilizationPercent)}٪ رسید و هشدار نظارتی صادر شد.`
        : undefined
    };

    return {
      success: true,
      result: finalResult,
      invoice: inv
    };
  }

  /**
   * دریافت فهرست کلیه اقلام فاکتورهای تحویل‌شده به زرین
   */
  public getAllZarrinDeliveries(): ZarrinDeliveryItemSummary[] {
    const invoices = k13Storage.getInvoices();
    const deliveredInvoices = invoices.filter((i) => i.deliveryStatus === 'delivered_to_zarrin' || i.items.some((it) => it.deliveryStatus === 'delivered_to_zarrin'));

    const list: ZarrinDeliveryItemSummary[] = [];

    for (const inv of deliveredInvoices) {
      for (const it of inv.items) {
        list.push({
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          buyerOrgNameFa: inv.buyerNameFa,
          orderCode: inv.orderCode,
          itemId: it.id,
          sku: it.sku,
          titleFa: it.titleFa,
          weightGrams: it.weightGrams,
          carat: it.carat,
          totalPriceToman: it.totalPriceToman,
          deliveryStatus: it.deliveryStatus || 'delivered_to_zarrin',
          deliveryStatusFa: it.deliveryStatusFa || 'تحویل به زرین شده',
          zarrinDeliveryReceiptNumber: it.zarrinDeliveryReceiptNumber || inv.zarrinDeliveryReceiptNumber || 'REC-ZR-AUTO',
          zarrinDeliveryDateFa: it.zarrinDeliveryDateFa || inv.zarrinDeliveryDateFa || inv.issueDateFa,
          zarrinVoucherNumber: inv.zarrinVoucher?.voucherNumber
        });
      }
    }

    return list;
  }
}

export const k13K14BridgeService = new K13K14BridgeService();
