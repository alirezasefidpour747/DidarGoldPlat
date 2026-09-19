/**
 * Didar Gold Platform - Kernel 15 (K15): Financial Obligations & Dual Subledgers
 * (تعهد مالی و دفتر دوگانه طلا و پول)
 * Model for dual-currency subledgers: pure gold weight (grams at 750/995) & fiat currency (Toman).
 */

export type DualVoucherType =
  | 'invoice_dispatch'        // تحویل کالای فاکتور رسمی
  | 'gold_melted_settlement'   // تسویه شمش / طلای آبشده فیزیکی
  | 'fiat_bank_transfer'       // واریز وجه ریالی (ساتنا / پایا / چک)
  | 'wage_fee_charge'          // هزینه اجرت ساخت، سود و مالیات
  | 'netting_conversion'       // تهاتر و تبدیل مانده طلا و ریال با مظنه روز
  | 'assay_variance'           // تعدیل کسر یا اضافه عیار ری‌گیری
  | 'scrap_gold_return';       // عودت طلای کهنه / داغی کارگاهی

export type PartyAccountStatus =
  | 'clear'       // بی‌حساب و تسویه کامل
  | 'normal'      // مانده متعارف در مهلت جاری
  | 'due_soon'    // سررسید نزدیک (کمتر از ۳ روز)
  | 'overdue'     // دارای تعهد معوق و دیرکرد
  | 'critical';   // تعهد معوق سنگین بحرانی

export interface DualAgingBreakdown {
  currentGrams: number;
  currentToman: number;
  overdue1To15Grams: number;
  overdue1To15Toman: number;
  overdue16To30Grams: number;
  overdue16To30Toman: number;
  overdue30PlusGrams: number;
  overdue30PlusToman: number;
  oldestOverdueDateFa?: string;
  weightedAverageDueDays: number;
}

export interface PartyAccountBalance {
  id: string;
  partyId: string;
  partyNameFa: string;
  nationalId: string;
  accountType: 'retailer' | 'wholesaler' | 'supplier' | 'workshop';
  accountTypeFa: string;

  // معین وزنی طلا (عیار مبنا: ۷۵۰ / ۱۸ عیار)
  goldBalanceGrams750: number; // مثبت = بدهکار طلا (باید تحویل دهد)، منفی = بستانکار طلا
  goldDebitTotalGrams: number;
  goldCreditTotalGrams: number;

  // معین پولی ریالی (تومان)
  fiatBalanceToman: number; // مثبت = بدهکار ریالی، منفی = بستانکار ریالی
  fiatDebitTotalToman: number;
  fiatCreditTotalToman: number;

  // ارزش‌گذاری روز کل تعهد (تومان)
  totalObligationValuationToman: number;

  // تحلیل سررسید و راس‌گیری
  aging: DualAgingBreakdown;
  status: PartyAccountStatus;
  statusFa: string;
  lastTransactionDateFa: string;
  zarrinSubledgerCode: string;
  phone?: string;
}

export interface DoubleEntryArticleLeg {
  id: string;
  side: 'debit' | 'credit'; // بدهکار یا بستانکار
  legType: 'gold_weight' | 'fiat_currency'; // معین وزنی طلا یا معین پولی
  accountCode: string; // کد معین در کدینگ حسابداری زرین (مثلاً ۱۱۰۲۰۱ یا ۲۰۲۰۱)
  accountTitleFa: string; // عنوان حساب معین
  amount: number; // مقدار عددی (گرم یا تومان)
  unitFa: string; // 'گرم ۷۵۰' یا 'تومان'
  descriptionFa: string; // شرح آرتیکل
}

export interface DualJournalVoucher {
  id: string;
  voucherNumber: string;
  voucherDateFa: string;
  partyId: string;
  partyNameFa: string;
  voucherType: DualVoucherType;
  voucherTypeFa: string;
  titleFa: string;
  descriptionFa: string;
  referenceDocNumber?: string;
  sourceKernel: 'K13' | 'K14' | 'K15' | 'K16' | 'K10' | 'K08' | 'K07' | 'K09' | 'MANUAL';

  // مقادیر معین وزنی طلا
  goldDebitGrams: number;
  goldCreditGrams: number;
  goldCarat: number; // مثلاً 750 یا 995
  goldEquivalent750Grams: number;

  // مقادیر معین پولی ریالی
  fiatDebitToman: number;
  fiatCreditToman: number;

  // مانده خطی حساب پس از سند
  runningGoldBalanceGrams: number;
  runningFiatBalanceToman: number;

  registeredBy: string;
  zarrinVoucherRef?: string;
  status: 'draft' | 'posted' | 'reconciled';
  statusFa: string;

  // آرتیکل‌های سند حسابداری دوطرفه (دفتر دوگانه)
  doubleEntryArticles?: DoubleEntryArticleLeg[];
  k14ExposureClearanceRef?: string;
  k13InvoiceNumber?: string;
}

export interface K14K15SyncLog {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  partyId: string;
  partyNameFa: string;
  voucherId: string;
  voucherNumber: string;
  goldDebitGrams: number;
  fiatDebitToman: number;
  k14ClearanceRef: string;
  status: 'success' | 'failed';
  messageFa: string;
  syncedAtFa: string;
  operatorFa: string;
}

export interface K14K15BridgeStatus {
  isAutoSyncEnabled: boolean;
  totalSyncedCount: number;
  totalSyncedGoldWeightGrams: number;
  totalSyncedFiatToman: number;
  pendingSyncCount: number;
  pendingInvoices: Array<{
    invoiceId: string;
    invoiceNumber: string;
    buyerNameFa: string;
    totalWeightGrams: number;
    grandTotalToman: number;
    statusFa: string;
    k14Approved: boolean;
  }>;
  recentSyncLogs: K14K15SyncLog[];
}

export interface DualTrialBalance {
  asOfDateFa: string;
  referenceGoldPriceToman: number; // نرخ مظنه روز طلا ۱۸ عیار

  // تراز دفاتر وزنی طلا
  totalGoldDebitsGrams: number;
  totalGoldCreditsGrams: number;
  netGoldBalanceGrams: number;
  isGoldBalanced: boolean;

  // تراز دفاتر پولی ریالی
  totalFiatDebitsToman: number;
  totalFiatCreditsToman: number;
  netFiatBalanceToman: number;
  isFiatBalanced: boolean;

  totalValuedExposureToman: number;
  activePartiesCount: number;
  postedVouchersCount: number;
}

export interface K15SummaryMetrics {
  totalGoldReceivableGrams: number;  // کل مطالبات وزنی طلا (طلب از مشتریان)
  totalGoldPayableGrams: number;     // کل بدهی وزنی طلا (تعهد به بنکداران و تامین)
  totalFiatReceivableToman: number;  // کل مطالبات نقدی ریالی
  totalFiatPayableToman: number;     // کل بدهی نقدی ریالی
  totalOverdueAccountsCount: number; // تعداد حساب‌های با تعهد معوق
  totalNetValuationToman: number;    // خالص موقعیت ریالی کل شرکت
}

export interface K15DataPayload {
  trialBalance: DualTrialBalance;
  partyBalances: PartyAccountBalance[];
  recentVouchers: DualJournalVoucher[];
  referenceGoldPriceToman: number;
  summaryMetrics: K15SummaryMetrics;
}
