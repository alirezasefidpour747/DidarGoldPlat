/**
 * Didar Gold Platform - Kernel 14 to Kernel 15 Intermediary Bridge Service
 * سرویس واسط یکپارچه‌سازی خودکار K14 (مواجهه و اعتبارات) با K15 (تعهد مالی و دفتر دوگانه)
 * 
 * مسئولیت‌ها:
 * ۱. دریافت داده‌های تایید شده اعتباری از هسته K14
 * ۲. محاسبه تعهدات دوبل (وزنی طلای ۱۸ عیار و پولی ریالی) برای هر صورتحساب
 * ۳. تفکیک آرتیکل‌های حسابداری دوطرفه (Double-Entry Bookkeeping) بر مبنای استاندارد زرین
 * ۴. ایجاد خودکار طرف حساب و سند معین دوگانه در K15 بدون دخالت دستی
 * ۵. به‌روزرسانی ردیابی و پیوند داده‌ای روی صورتحساب K13 و سوابق نظارتی K14
 */

import { k13Storage } from '../storage-k13.js';
import { k14Storage } from '../storage-k14.js';
import { k15Storage } from '../storage-k15.js';
import { Invoice } from '../../src/types/k13.js';
import {
  DualJournalVoucher,
  DoubleEntryArticleLeg,
  K14K15SyncLog,
  K14K15BridgeStatus,
  PartyAccountBalance
} from '../../src/types/k15.js';

export interface K14ToK15SyncOptions {
  invoiceId: string;
  operatorName?: string;
  forceBypassOverride?: boolean;
  overrideReason?: string;
}

export interface K14ToK15SyncResult {
  success: boolean;
  message: string;
  voucher?: DualJournalVoucher;
  invoice?: Invoice;
  partyAccount?: PartyAccountBalance;
  doubleEntryArticles?: DoubleEntryArticleLeg[];
  requiresOverride?: boolean;
  error?: string;
  isAlreadySynced?: boolean;
}

export interface BatchSyncResult {
  totalProcessed: number;
  syncedCount: number;
  skippedAlreadySyncedCount: number;
  failedCount: number;
  totalGoldGramsSynced: number;
  totalFiatTomanSynced: number;
  syncedVoucherNumbers: string[];
  errors: string[];
}

export class K14K15BridgeService {
  private autoSyncEnabled: boolean = true;
  private syncLogs: K14K15SyncLog[] = [
    {
      id: 'synclog-1403-01',
      invoiceId: 'inv-init-01',
      invoiceNumber: 'INV-1403-7740',
      partyId: 'org-buyer-01',
      partyNameFa: 'گالری طلا و جواهر زمرد تهران',
      voucherId: 'voc-1005',
      voucherNumber: 'VOC-DUAL-1403-1005',
      goldDebitGrams: 64.120,
      fiatDebitToman: 112000000,
      k14ClearanceRef: 'K14-CLR-INV-1403-7740',
      status: 'success',
      messageFa: 'سند دوبل تحویل کالا و تعهد ریالی با تایید اعتباری خودکار K14 ثبت شد.',
      syncedAtFa: '۱۴۰۳/۰۹/۰۸ ۱۱:۲۰',
      operatorFa: 'سرویس واسط K14-K15'
    }
  ];

  public isAutoSyncEnabled(): boolean {
    return this.autoSyncEnabled;
  }

  public setAutoSyncEnabled(enabled: boolean): boolean {
    this.autoSyncEnabled = enabled;
    return this.autoSyncEnabled;
  }

  /**
   * همگام‌سازی و ثبت خودکار سند حسابداری دوطرفه برای صورتحساب تاییدشده در K14
   */
  public syncK14ApprovedInvoiceToK15(options: K14ToK15SyncOptions): K14ToK15SyncResult {
    const operator = options.operatorName || 'سرویس واسط خودکار K14-K15';
    const inv = k13Storage.getInvoice(options.invoiceId);

    if (!inv) {
      return {
        success: false,
        message: 'صورتحساب مورد نظر در سامانه یافت نشد.',
        error: `Invoice ID ${options.invoiceId} not found.`
      };
    }

    // ۱. بررسی عدم ثبت تکراری (Idempotency Check)
    if (inv.k15VoucherRecorded?.voucherNumber) {
      const existingVoucher = k15Storage.getVouchers().find(
        (v) => v.voucherNumber === inv.k15VoucherRecorded?.voucherNumber || v.referenceDocNumber === inv.invoiceNumber
      );
      return {
        success: true,
        message: `سند حسابداری دوگانه برای فاکتور ${inv.invoiceNumber} قبلاً با شماره ${inv.k15VoucherRecorded.voucherNumber} صادر و ثبت شده است.`,
        isAlreadySynced: true,
        voucher: existingVoucher,
        invoice: inv
      };
    }

    // ۲. اعتبارسنجی تاییدیه K14
    // اگر صورتحساب از قبل ثبت مواجهه K14 نشده باشد، بررسی امکان‌سنجی اعتباری انجام می‌شود
    const goldWeight = inv.settlementGoldWeightGrams750 > 0 ? inv.settlementGoldWeightGrams750 : inv.totalWeightGrams;
    const fiatCommitment = inv.settlementRialAmountToman > 0
      ? inv.settlementRialAmountToman
      : (inv.totalTaxableAmountToman + inv.totalVatToman);

    let k14ClearanceRef = `K14-CLR-${inv.invoiceNumber}`;

    if (!inv.k14ExposureRecorded) {
      const feasibility = k14Storage.checkCreditFeasibility(
        { buyerId: inv.buyerOrgId, nationalId: inv.buyerNationalId, nameFa: inv.buyerNameFa },
        goldWeight,
        fiatCommitment
      );

      if (!feasibility.allowed && !options.forceBypassOverride) {
        return {
          success: false,
          requiresOverride: true,
          message: `خطای اعتباری K14: ${feasibility.reasonFa}`,
          error: feasibility.reasonFa
        };
      }

      // ثبت مواجهه در K14
      const { profile } = k14Storage.recordInvoiceExposure(
        { buyerId: inv.buyerOrgId, nationalId: inv.buyerNationalId, nameFa: inv.buyerNameFa },
        goldWeight,
        fiatCommitment,
        inv.invoiceNumber
      );

      const now = new Date();
      const nowFa = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(now);

      inv.k14ExposureRecorded = {
        goldExposureIncrementGrams: goldWeight,
        rialExposureIncrementToman: fiatCommitment,
        recordedAtFa: nowFa,
        buyerExposureStatus: profile.status,
        collateralCoveragePercent: profile.collateralCoveragePercent,
        operatorFa: operator
      };
    }

    // ۳. یافتن یا ایجاد پرونده معین دوگانه خریدار در K15
    const buyerParty = k15Storage.findOrCreatePartyAccount({
      partyId: inv.buyerOrgId || `org-buyer-${inv.buyerNationalId}`,
      partyNameFa: inv.buyerNameFa,
      nationalId: inv.buyerNationalId,
      phone: inv.buyerPhone,
      accountType: 'retailer',
      accountTypeFa: 'خرده‌فروش همکار (ویترین‌دار)'
    });

    // ۴. طراحی آرتیکل‌های سند دوبل حسابداری (دفتر دوگانه استاندارد زرین)
    const doubleEntryArticles: DoubleEntryArticleLeg[] = [];

    // پای اول: معین وزنی طلای ۱۸ عیار (۷۵۰)
    if (goldWeight > 0) {
      // آرتیکل ۱: بدهکار حساب معین طلایی مشتری
      doubleEntryArticles.push({
        id: `art-g-deb-${Date.now()}-1`,
        side: 'debit',
        legType: 'gold_weight',
        accountCode: buyerParty.zarrinSubledgerCode || '110201-0012',
        accountTitleFa: `بدهکاران تجاری طلا / ${buyerParty.partyNameFa}`,
        amount: goldWeight,
        unitFa: 'گرم طلای ۱۸ عیار',
        descriptionFa: `بدهکار وزنی طلا بابت اقلام فاکتور ${inv.invoiceNumber} (${inv.items.length} قلم کالا)`
      });

      // آرتیکل ۲: بستانکار کاردکس طلای ساخته و تحویل زرین
      doubleEntryArticles.push({
        id: `art-g-crd-${Date.now()}-2`,
        side: 'credit',
        legType: 'gold_weight',
        accountCode: '202010-0001',
        accountTitleFa: 'کاردکس موجودی طلای ساخته و امانی تحویل زرین (خزانه K09)',
        amount: goldWeight,
        unitFa: 'گرم طلای ۱۸ عیار',
        descriptionFa: `خروج وزنی کالا و تحویل به کاردکس زرین بابت فاکتور ${inv.invoiceNumber}`
      });
    }

    // پای دوم: معین پولی ریالی (اجرت، سود و مالیات بر ارزش افزوده طبق ماده ۲۶)
    const grossWageAndMargin = inv.totalMakingWageToman + inv.totalDidarMarginToman - (inv.totalItemDiscountsToman + (inv.volumeDiscountAmountToman || 0));
    const effectiveWageAndMargin = Math.max(0, grossWageAndMargin);
    const vatAmount = inv.totalVatToman;

    if (fiatCommitment > 0) {
      // آرتیکل ۳: بدهکار حساب معین ریالی مشتری
      doubleEntryArticles.push({
        id: `art-f-deb-${Date.now()}-3`,
        side: 'debit',
        legType: 'fiat_currency',
        accountCode: buyerParty.zarrinSubledgerCode || '110201-0012',
        accountTitleFa: `بدهکاران تجاری ریالی / ${buyerParty.partyNameFa}`,
        amount: fiatCommitment,
        unitFa: 'تومان',
        descriptionFa: `بدهکار پولی بابت اجرت ساخت، سود و مالیات ارزش افزوده فاکتور ${inv.invoiceNumber}`
      });

      // آرتیکل ۴: بستانکار درآمد ساخت و فروش
      doubleEntryArticles.push({
        id: `art-f-crd-${Date.now()}-4`,
        side: 'credit',
        legType: 'fiat_currency',
        accountCode: '410101-0002',
        accountTitleFa: 'درآمد حاصل از اجرت ساخت و کارمزد فروش مصنوعات دیدار',
        amount: effectiveWageAndMargin,
        unitFa: 'تومان',
        descriptionFa: `شناسایی درآمد اجرت و کارمزد ساخت اقلام فاکتور ${inv.invoiceNumber}`
      });

      // آرتیکل ۵: بستانکار مالیات و عوارض ارزش افزوده ۱۰٪ سامانه مودیان
      if (vatAmount > 0) {
        doubleEntryArticles.push({
          id: `art-f-crd-${Date.now()}-5`,
          side: 'credit',
          legType: 'fiat_currency',
          accountCode: '305010-0001',
          accountTitleFa: 'عوارض و مالیات بر ارزش افزوده پرداختنی سامانه مودیان (ماده ۲۶)',
          amount: vatAmount,
          unitFa: 'تومان',
          descriptionFa: `مالیات بر ارزش افزوده ۱۰٪ ماده ۲۶ فاکتور ${inv.invoiceNumber} جهت واریز به سازمان امور مالیاتی`
        });
      }
    }

    // ۵. ثبت قطعی سند در دفتر دوگانه K15
    const voucher = k15Storage.registerVoucher({
      partyId: buyerParty.partyId,
      voucherType: 'invoice_dispatch',
      titleFa: `سند دوبل تحویل فاکتور ${inv.invoiceNumber} (تایید اعتباری K14)`,
      descriptionFa: `ثبت خودکار تعهد مالی دوگانه (${goldWeight.toFixed(3)} گرم طلای ۱۸ عیار و ${(fiatCommitment / 1000000).toLocaleString('fa-IR')} میلیون تومان ریالی) با تاییدیه اهلیت اعتباری هسته K14.`,
      referenceDocNumber: inv.invoiceNumber,
      goldDebitGrams: goldWeight,
      goldCreditGrams: 0,
      goldCarat: 750,
      fiatDebitToman: fiatCommitment,
      fiatCreditToman: 0,
      registeredBy: `واسط خودکار K14-K15 (${operator})`,
      sourceKernel: 'K14',
      doubleEntryArticles,
      k14ExposureClearanceRef: k14ClearanceRef,
      k13InvoiceNumber: inv.invoiceNumber
    });

    const now = new Date();
    const nowFa = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(now);

    // ۶. پیوند داده‌ای K15 روی صورتحساب K13
    inv.k15VoucherRecorded = {
      voucherNumber: voucher.voucherNumber,
      voucherId: voucher.id,
      recordedAtFa: nowFa,
      goldDebitGrams: goldWeight,
      fiatDebitToman: fiatCommitment,
      sourceKernel: 'K14',
      status: 'posted',
      operatorFa: operator
    };

    // اگر سند زرین روی فاکتور ثبت شده بود، وضعیت آن را همگام می‌کنیم
    if (inv.zarrinVoucher) {
      inv.zarrinVoucher.status = 'posted_to_zarrin';
      inv.zarrinVoucher.statusFa = `ثبت قطعی در دفتر دوگانه K15 با سند ${voucher.voucherNumber}`;
    }

    // ۷. ثبت لاگ نظارتی در تاریخچه پل ارتباطی
    const logItem: K14K15SyncLog = {
      id: `synclog-${Date.now().toString().slice(-6)}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      partyId: buyerParty.partyId,
      partyNameFa: buyerParty.partyNameFa,
      voucherId: voucher.id,
      voucherNumber: voucher.voucherNumber,
      goldDebitGrams: goldWeight,
      fiatDebitToman: fiatCommitment,
      k14ClearanceRef,
      status: 'success',
      messageFa: `سند دوگانه ${voucher.voucherNumber} شامل ${doubleEntryArticles.length} آرتیکل دوطرفه برای فاکتور ${inv.invoiceNumber} ثبت شد.`,
      syncedAtFa: nowFa,
      operatorFa: operator
    };

    this.syncLogs.unshift(logItem);

    return {
      success: true,
      message: `سند حسابداری دوطرفه ${voucher.voucherNumber} با موفقیت در دفتر دوگانه K15 صادر و بر روی فاکتور ${inv.invoiceNumber} ثبت گردید.`,
      voucher,
      invoice: inv,
      partyAccount: buyerParty,
      doubleEntryArticles
    };
  }

  /**
   * همگام‌سازی دسته‌ای کلیه فاکتورهای دارای تاییدیه K14 که هنوز در K15 ثبت نشده‌اند
   */
  public batchSyncK14ApprovedInvoices(operatorName?: string): BatchSyncResult {
    const operator = operatorName || 'عملیات دسته‌ای سرویس واسط K14-K15';
    const allInvoices = k13Storage.getInvoices();

    // فاکتورهایی که تایید K14 دارند یا قطعی صادر شده‌اند
    const candidateInvoices = allInvoices.filter(
      (inv) =>
        Boolean(inv.k14ExposureRecorded) ||
        inv.deliveryStatus === 'delivered_to_zarrin' ||
        inv.status === 'issued' ||
        inv.status === 'moaddian_sent'
    );

    let syncedCount = 0;
    let skippedAlreadySyncedCount = 0;
    let failedCount = 0;
    let totalGoldGramsSynced = 0;
    let totalFiatTomanSynced = 0;
    const syncedVoucherNumbers: string[] = [];
    const errors: string[] = [];

    for (const inv of candidateInvoices) {
      if (inv.k15VoucherRecorded?.voucherNumber) {
        skippedAlreadySyncedCount++;
        continue;
      }

      try {
        const syncRes = this.syncK14ApprovedInvoiceToK15({
          invoiceId: inv.id,
          operatorName: operator,
          forceBypassOverride: true,
          overrideReason: 'همگام‌سازی دسته‌ای تعهدات اعتباری K14 با دفتر دوگانه K15'
        });

        if (syncRes.success && syncRes.voucher) {
          syncedCount++;
          syncedVoucherNumbers.push(syncRes.voucher.voucherNumber);
          totalGoldGramsSynced += syncRes.voucher.goldDebitGrams;
          totalFiatTomanSynced += syncRes.voucher.fiatDebitToman;
        } else {
          failedCount++;
          errors.push(`فاکتور ${inv.invoiceNumber}: ${syncRes.message}`);
        }
      } catch (err: any) {
        failedCount++;
        errors.push(`فاکتور ${inv.invoiceNumber}: ${err.message}`);
      }
    }

    return {
      totalProcessed: candidateInvoices.length,
      syncedCount,
      skippedAlreadySyncedCount,
      failedCount,
      totalGoldGramsSynced: Number(totalGoldGramsSynced.toFixed(3)),
      totalFiatTomanSynced,
      syncedVoucherNumbers,
      errors
    };
  }

  /**
   * دریافت آخرین وضعیت سرویس واسط K14-K15 به همراه آمار تجمعی و لاگ‌های اخیر
   */
  public getBridgeStatus(): K14K15BridgeStatus {
    const allInvoices = k13Storage.getInvoices();
    const syncedInvoices = allInvoices.filter((inv) => Boolean(inv.k15VoucherRecorded?.voucherNumber));
    
    const pendingInvoices = allInvoices
      .filter((inv) => !inv.k15VoucherRecorded?.voucherNumber && (Boolean(inv.k14ExposureRecorded) || inv.status === 'issued'))
      .map((inv) => ({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        buyerNameFa: inv.buyerNameFa,
        totalWeightGrams: inv.totalWeightGrams,
        grandTotalToman: inv.grandTotalToman,
        statusFa: inv.statusFa || inv.status,
        k14Approved: Boolean(inv.k14ExposureRecorded)
      }));

    let totalGoldWeight = 0;
    let totalFiatToman = 0;

    for (const inv of syncedInvoices) {
      if (inv.k15VoucherRecorded) {
        totalGoldWeight += inv.k15VoucherRecorded.goldDebitGrams || 0;
        totalFiatToman += inv.k15VoucherRecorded.fiatDebitToman || 0;
      }
    }

    return {
      isAutoSyncEnabled: this.autoSyncEnabled,
      totalSyncedCount: syncedInvoices.length,
      totalSyncedGoldWeightGrams: Number(totalGoldWeight.toFixed(3)),
      totalSyncedFiatToman: totalFiatToman,
      pendingSyncCount: pendingInvoices.length,
      pendingInvoices,
      recentSyncLogs: [...this.syncLogs]
    };
  }
}

export const k14K15BridgeService = new K14K15BridgeService();
