/**
 * Didar Gold Platform - Kernel 16 (K16): Settlement & Zarrin Reconciliation
 * Subdomains:
 *   - K16A: Settlement Execution & Netting (اجرای تسویه و تهاتر مالی و طلایی)
 *   - K16B: Zarrin Integration & Reconciliation (یکپارچگی و تطبیق نرم‌افزار حسابداری زرین)
 */

export type ZarrinConnectionStatus = 'connected' | 'degraded' | 'disconnected' | 'mock_active';

export type ZarrinSyncStatus = 'synced' | 'pending' | 'mismatch';

export type ZarrinDocStatus =
  | 'pending'
  | 'syncing'
  | 'synced_success'
  | 'failed_retryable'
  | 'failed_permanent'
  | 'discrepancy_held';

export type ZarrinEventType =
  | 'order_delivery_pod'
  | 'pos_direct_sale'
  | 'bag_sale_invoice'
  | 'consignment_settlement'
  | 'return_reversal';

export interface ZarrinCatalogItem {
  id: string;
  zarrinItemCode: string;
  uid: string;
  sku: string;
  titleFa: string;
  titleEn: string;
  category: 'ring' | 'bangle' | 'necklace' | 'earring' | 'coin' | 'bar';
  categoryFa: string;
  carat: number;
  standardWeightGrams: number;
  wagePercent: number;
  referencePriceRials: number;
  syncStatus: ZarrinSyncStatus;
  syncStatusFa: string;
  lastSyncAt: string;
  zarrinStockQuantity: number;
  didarAllocatedCount: number;
  isReserved: boolean;
  reservedForBagOrOrder?: string;
}

export interface ZarrinDocumentItem {
  uid: string;
  zarrinItemCode: string;
  title: string;
  weightGrams: number;
  unitPriceRials: number;
  wageRials: number;
  totalRials: number;
}

export interface ZarrinDocumentOutboxEntry {
  id: string;
  idempotencyKey: string;
  eventType: ZarrinEventType;
  eventTypeFa: string;
  sourceDomain: 'K10' | 'K12' | 'K01' | 'K09' | 'K13' | 'K14' | 'K15';
  referenceId: string;
  retailerOrgId: string;
  retailerName: string;
  items: ZarrinDocumentItem[];
  totalGoldWeightGrams: number;
  totalAmountRials: number;
  status: ZarrinDocStatus;
  statusFa: string;
  zarrinVoucherNo: string | null;
  zarrinFiscalYear: string;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt: string | null;
  lastError: string | null;
  createdAt: string;
  syncedAt: string | null;
  verifiedBy: string;
  payloadSnapshot: Record<string, any>;
}

export interface ZarrinSyncSummary {
  connectionStatus: ZarrinConnectionStatus;
  connectionStatusFa: string;
  apiBaseUrl: string;
  lastPingLatencyMs: number;
  serviceAccount: string;
  catalogSyncedCount: number;
  catalogPendingCount: number;
  outboxPendingCount: number;
  outboxSyncedCount: number;
  outboxFailedCount: number;
  totalSettledRials: number;
  totalSettledGoldGrams: number;
  lastCatalogSyncAt: string;
  idempotencyInterceptionsCount: number;
}

export interface ZarrinReconciliationAuditLog {
  id: string;
  timestamp: string;
  action:
    | 'catalog_sync'
    | 'voucher_dispatch'
    | 'idempotency_duplicate_blocked'
    | 'retry_dispatched'
    | 'error_logged'
    | 'discrepancy_flagged'
    | 'settlement_executed'
    | 'netting_settled';
  actionFa: string;
  details: string;
  actor: string;
  referenceId: string;
  status: 'success' | 'warning' | 'error';
}

export type SettlementTransactionType =
  | 'gold_receipt'        // دریافت فیزیکی طلا از مشتری/طرف حساب
  | 'gold_delivery'       // تحویل شمش یا آبشده به طرف حساب
  | 'fiat_bank_transfer'  // واریز ریالی بانکی (پایا / ساتنا / شتاب)
  | 'fiat_bank_receipt'   // دریافت ریالی از طرف حساب
  | 'bilateral_netting';  // تهاتر متقابل ریال در برابر طلا

export interface SettlementPartnerAccount {
  id: string;
  partnerOrgId: string;
  partnerNameFa: string;
  nationalId?: string;
  tradeType: 'retailer' | 'supplier' | 'wholesaler' | 'agent';
  tradeTypeFa: string;
  goldBalanceGrams: number;      // منفی = بدهکار طلا (باید تحویل دهد)، مثبت = بستانکار طلا
  fiatBalanceToman: number;      // منفی = بدهکار ریالی، مثبت = بستانکار ریالی
  lastSettlementAtFa: string;
  settlementStatus: 'balanced' | 'debtor_gold' | 'debtor_fiat' | 'netting_ready';
  settlementStatusFa: string;
  zarrinSubledgerCode: string;
  nettingPotentialToman: number; // ارزش تراز قابل تهاتر
}

export interface SettlementTransaction {
  id: string;
  settlementCode: string;
  partnerId: string;
  partnerNameFa: string;
  type: SettlementTransactionType;
  typeFa: string;
  goldWeightGrams: number;
  fiatAmountToman: number;
  referenceBankTraceNo?: string;
  zarrinVoucherNo?: string;
  status: 'completed' | 'processing' | 'failed';
  statusFa: string;
  registeredAtFa: string;
  registeredBy: string;
  noteFa: string;
}

export interface SettlementLedgerSummary {
  totalNetCreditorGoldGrams: number;
  totalNetDebtorGoldGrams: number;
  totalNetCreditorFiatToman: number;
  totalNetDebtorFiatToman: number;
  nettingReadyCount: number;
  referenceGoldPriceToman: number;
}

export type TripartiteReconciliationStatus =
  | 'reconciled'
  | 'discrepancy_risk'
  | 'pending_voucher'
  | 'amount_mismatch'
  | 'unsettled_overdue';

export interface TripartiteReconciliationItem {
  id: string;
  reconciliationKey: string;
  timestamp: string;
  overallStatus: TripartiteReconciliationStatus;
  overallStatusFa: string;
  isBalanced: boolean;
  reconciliationScore: number; // 0 to 100

  // K13 Invoice Source
  k13Invoice: {
    id: string;
    invoiceNumber: string;
    orderCode: string;
    buyerId: string;
    buyerNameFa: string;
    buyerNationalId: string;
    totalWeightGrams: number;
    pureGoldGrams750: number;
    grandTotalToman: number;
    makingWageToman: number;
    vatToman: number;
    status: string;
    statusFa: string;
    settlementMode: string;
    settlementModeFa: string;
    issueDateFa: string;
    dueDateFa: string;
    moaddianTrackingCode?: string;
  };

  // K14 Risk Assessment Source
  k14Risk: {
    buyerProfileId: string;
    creditScore: number;
    tier: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskLevelFa: string;
    goldCreditLimitGrams: number;
    goldExposureGrams: number;
    goldUtilizationPercent: number;
    rialCreditLimitToman: number;
    rialExposureToman: number;
    rialUtilizationPercent: number;
    collateralEffectiveValueToman: number;
    collateralCoveragePercent: number;
    creditStatus: 'active' | 'watch' | 'restricted' | 'locked';
    isCreditFeasible: boolean;
    riskAssessmentVerdict: 'approved' | 'warning_high_exposure' | 'collateral_insufficient' | 'override_required';
    riskAssessmentVerdictFa: string;
  };

  // K15 Double-Entry Journal Voucher Source
  k15Journal: {
    voucherId?: string;
    voucherNumber?: string;
    voucherType?: string;
    voucherTypeFa?: string;
    goldDebitGrams: number;
    goldCreditGrams: number;
    fiatDebitToman: number;
    fiatCreditToman: number;
    partyRunningGoldBalanceGrams: number;
    partyRunningFiatBalanceToman: number;
    zarrinVoucherRef?: string;
    journalStatus: 'posted' | 'reconciled' | 'draft' | 'missing';
    journalStatusFa: string;
  };

  // Variances & Reconciliation Deltas
  reconciliationDeltas: {
    goldWeightDeltaGrams: number;
    fiatAmountDeltaToman: number;
    collateralDeficitToman: number;
    discrepancyReasons: string[];
  };

  // Zarrin / K16 Connection
  zarrinOutboxLink: {
    zarrinDocumentId?: string;
    zarrinVoucherNo?: string;
    idempotencyKey?: string;
    syncStatus: 'synced' | 'pending' | 'failed' | 'not_dispatched';
    syncStatusFa: string;
  };
}

export interface TripartiteReconciliationSummary {
  totalInvoicesAnalyzed: number;
  reconciledCount: number;
  reconciledPercentage: number;
  riskDiscrepanciesCount: number;
  pendingVoucherCount: number;
  amountMismatchCount: number;
  overdueCount: number;
  totalInvoiceAmountToman: number;
  totalJournalAmountToman: number;
  netVarianceToman: number;
  totalInvoiceGoldGrams: number;
  totalJournalGoldGrams: number;
  netGoldVarianceGrams: number;
  lastReconciliationRunAt: string;
}

export interface K16DataPayload {
  summary: ZarrinSyncSummary;
  catalogItems: ZarrinCatalogItem[];
  outboxEntries: ZarrinDocumentOutboxEntry[];
  auditLogs: ZarrinReconciliationAuditLog[];
  settlementAccounts: SettlementPartnerAccount[];
  settlementTransactions: SettlementTransaction[];
  settlementSummary: SettlementLedgerSummary;
  tripartiteReconciliationItems?: TripartiteReconciliationItem[];
  tripartiteSummary?: TripartiteReconciliationSummary;
}
