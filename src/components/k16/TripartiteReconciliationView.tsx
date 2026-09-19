/**
 * Didar Gold Platform - Kernel 16 (K16)
 * Unified Tripartite Reconciliation Dashboard
 * Real-Time Alignment between K13 Invoices, K14 Risk Assessments, and K15 Double-Entry Journal
 */

import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowRightLeft,
  Coins,
  RefreshCw,
  Search,
  Filter,
  Check,
  Zap,
  Building2,
  Lock,
  Sparkles,
  ChevronLeft,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import {
  TripartiteReconciliationItem,
  TripartiteReconciliationSummary,
  TripartiteReconciliationStatus
} from '../../types/k16.js';

interface TripartiteReconciliationViewProps {
  items: TripartiteReconciliationItem[];
  summary: TripartiteReconciliationSummary;
  onRefresh: () => Promise<void>;
  onAutoFix: (recordId: string) => Promise<void>;
  onBatchReconcile: () => Promise<void>;
  actionLoading: boolean;
}

export const TripartiteReconciliationView: React.FC<TripartiteReconciliationViewProps> = ({
  items,
  summary,
  onRefresh,
  onAutoFix,
  onBatchReconcile,
  actionLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<TripartiteReconciliationItem | null>(null);
  const [fixingId, setFixingId] = useState<string | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.k13Invoice.invoiceNumber.toLowerCase().includes(query) ||
      item.k13Invoice.buyerNameFa.toLowerCase().includes(query) ||
      item.k13Invoice.orderCode.toLowerCase().includes(query) ||
      (item.k15Journal.voucherNumber && item.k15Journal.voucherNumber.toLowerCase().includes(query)) ||
      item.reconciliationKey.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || item.overallStatus === statusFilter;
    const matchesTier = tierFilter === 'all' || item.k14Risk.tier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const handleSingleFix = async (item: TripartiteReconciliationItem) => {
    setFixingId(item.id);
    try {
      await onAutoFix(item.id);
    } finally {
      setFixingId(null);
    }
  };

  const getStatusBadge = (status: TripartiteReconciliationStatus) => {
    switch (status) {
      case 'reconciled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            تطبیق کامل ۳/۳
          </span>
        );
      case 'pending_voucher':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            فاقد سند K15
          </span>
        );
      case 'discrepancy_risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
            مغایرت ریسک K14
          </span>
        );
      case 'amount_mismatch':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <Scale className="w-3.5 h-3.5 text-rose-600" />
            مغایرت ارزش/وزن
          </span>
        );
      case 'unsettled_overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <Lock className="w-3.5 h-3.5 text-red-600" />
            سررسید معوق / قفل
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="tripartite-reconciliation-dashboard" className="space-y-6">
      {/* Top Banner / Pulse Overview */}
      <div className="bg-gradient-to-l from-amber-50 via-white to-amber-50/40 border border-amber-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              موتور ممیزی و تطبیق برخط دیدار (K16 Engine)
            </div>
            <h2 className="text-xl font-black text-stone-900">
              داشبورد یکپارچه تطبیق سه‌جانبه (Tripartite Reconciliation)
            </h2>
            <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">
              پایش لحظه‌ای تراز میان صورتحساب‌های رسمی فروش (<span className="font-semibold text-stone-800">K13</span>)،
              ارزیابی ریسک و سقف اعتباری خریداران (<span className="font-semibold text-stone-800">K14</span>) و اسناد دوبل دفتر روزنامه
              (<span className="font-semibold text-stone-800">K15</span>) به همراه همگام‌سازی با سامانه زرین.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="refresh-reconciliation-btn"
              onClick={onRefresh}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-medium hover:bg-stone-50 transition shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin text-amber-600' : 'text-stone-500'}`} />
              به‌روزرسانی تطبیق
            </button>

            <button
              id="batch-reconcile-btn"
              onClick={onBatchReconcile}
              disabled={actionLoading || summary.reconciledCount === summary.totalInvoicesAnalyzed}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 transition shadow-sm disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-200" />
              تطبیق خودکار همگانی ({summary.totalInvoicesAnalyzed - summary.reconciledCount} مغایرت)
            </button>
          </div>
        </div>

        {/* Real-time Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-amber-200/60">
          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-stone-200/70">
            <div className="text-xs text-stone-500 font-medium">کل صورتحساب‌ها</div>
            <div className="text-lg font-black text-stone-900 mt-1">{summary.totalInvoicesAnalyzed} فقره</div>
            <div className="text-[11px] text-stone-400 mt-0.5">{summary.totalInvoiceGoldGrams.toLocaleString('fa-IR')} گرم طلا</div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-emerald-200/70">
            <div className="text-xs text-emerald-700 font-medium flex items-center justify-between">
              <span>تطبیق کامل ۳/۳</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-black text-emerald-700 mt-1">{summary.reconciledCount} فقره</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{summary.reconciledPercentage}٪ انطباق کامل</div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-amber-200/70">
            <div className="text-xs text-amber-700 font-medium flex items-center justify-between">
              <span>فاقد سند در K15</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-lg font-black text-amber-800 mt-1">{summary.pendingVoucherCount} فقره</div>
            <div className="text-[11px] text-amber-600 mt-0.5">نیازمند صدور سند دوبل</div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-rose-200/70">
            <div className="text-xs text-rose-700 font-medium flex items-center justify-between">
              <span>مغایرت ارزش/وزن</span>
              <Scale className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-lg font-black text-rose-800 mt-1">{summary.amountMismatchCount} فقره</div>
            <div className="text-[11px] text-rose-600 mt-0.5">
              {summary.netGoldVarianceGrams !== 0 ? `${Math.abs(summary.netGoldVarianceGrams)} گرم تفاوت` : 'تراز وزنی'}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-orange-200/70">
            <div className="text-xs text-orange-700 font-medium flex items-center justify-between">
              <span>مغایرت ریسک K14</span>
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div className="text-lg font-black text-orange-800 mt-1">{summary.riskDiscrepanciesCount} فقره</div>
            <div className="text-[11px] text-orange-600 mt-0.5">کسری وثیقه یا حد مجاز</div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-red-200/70">
            <div className="text-xs text-red-700 font-medium flex items-center justify-between">
              <span>معوق / قفل اعتباری</span>
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="text-lg font-black text-red-800 mt-1">{summary.overdueCount} فقره</div>
            <div className="text-[11px] text-red-600 mt-0.5">اقدام وصول مطالبات</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            id="reconciliation-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو بر اساس شماره فاکتور، نام خریدار، شماره سند K15 یا شناسه تطبیق..."
            className="w-full pr-9 pl-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>وضعیت تطبیق:</span>
          </div>
          <select
            id="reconciliation-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 font-medium text-stone-700 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">همه وضعیت‌ها ({items.length})</option>
            <option value="reconciled">تطبیق کامل ({summary.reconciledCount})</option>
            <option value="pending_voucher">فاقد سند در K15 ({summary.pendingVoucherCount})</option>
            <option value="amount_mismatch">مغایرت ارزش/وزن ({summary.amountMismatchCount})</option>
            <option value="discrepancy_risk">مغایرت ریسک K14 ({summary.riskDiscrepanciesCount})</option>
            <option value="unsettled_overdue">سررسید معوق ({summary.overdueCount})</option>
          </select>

          <select
            id="reconciliation-tier-filter"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 font-medium text-stone-700 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">همه رده‌های اعتباری</option>
            <option value="T1">رده T1 (بنکداران طلایی)</option>
            <option value="T2">رده T2 (فروشگاه‌های معتبر)</option>
            <option value="T3">رده T3 (خرده‌فروشی عمومی)</option>
          </select>
        </div>
      </div>

      {/* Main Tripartite Comparison Table */}
      <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-stone-50/90 text-stone-600 text-xs font-semibold border-b border-stone-200">
                <th className="py-3 px-4 w-12 text-center">امتیاز</th>
                <th className="py-3 px-4">صورتحساب رسمی (K13)</th>
                <th className="py-3 px-4">ارزیابی ریسک و سقف (K14)</th>
                <th className="py-3 px-4">سند دوبل روزنامه (K15)</th>
                <th className="py-3 px-4">مغایرت و تراز (K16)</th>
                <th className="py-3 px-4">وضعیت زرین</th>
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 text-sm">
                    هیچ رکوردی مطابق با فیلترهای انتخابی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isFixing = fixingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-amber-50/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedItem(item)}
                    >
                      {/* Score Indicator */}
                      <td className="py-3.5 px-3 text-center align-top">
                        <div
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${
                            item.reconciliationScore === 100
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : item.reconciliationScore >= 70
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                        >
                          {item.reconciliationScore}
                        </div>
                      </td>

                      {/* K13 Invoices */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5 font-bold text-stone-900">
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>{item.k13Invoice.invoiceNumber}</span>
                        </div>
                        <div className="text-xs text-stone-600 font-medium mt-0.5">
                          {item.k13Invoice.buyerNameFa}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-500">
                          <span className="font-semibold text-stone-800">
                            {item.k13Invoice.totalWeightGrams.toLocaleString('fa-IR')} گرم
                          </span>
                          <span>•</span>
                          <span>{item.k13Invoice.grandTotalToman.toLocaleString('fa-IR')} تومان</span>
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          نوع تسویه: {item.k13Invoice.settlementModeFa}
                        </div>
                      </td>

                      {/* K14 Risk */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              item.k14Risk.riskLevel === 'low'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.k14Risk.riskLevel === 'medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.k14Risk.riskLevelFa} (رده {item.k14Risk.tier})
                          </span>
                          <span className="text-xs text-stone-400">امتیاز: {item.k14Risk.creditScore}</span>
                        </div>

                        <div className="text-xs text-stone-600 mt-1.5 space-y-0.5">
                          <div>
                            پوشش وثیقه: <span className="font-semibold">{item.k14Risk.collateralCoveragePercent}٪</span>
                          </div>
                          <div className="text-[11px] text-stone-500">
                            استفاده از حد طلا: {item.k14Risk.goldUtilizationPercent}٪
                          </div>
                        </div>

                        <div
                          className={`text-[11px] mt-1 font-medium ${
                            item.k14Risk.riskAssessmentVerdict === 'approved'
                              ? 'text-emerald-600'
                              : 'text-amber-700'
                          }`}
                        >
                          {item.k14Risk.riskAssessmentVerdictFa}
                        </div>
                      </td>

                      {/* K15 Journal */}
                      <td className="py-3.5 px-4 align-top">
                        {item.k15Journal.voucherNumber ? (
                          <>
                            <div className="flex items-center gap-1.5 font-semibold text-stone-800 text-xs">
                              <Coins className="w-3.5 h-3.5 text-stone-500" />
                              <span>{item.k15Journal.voucherNumber}</span>
                            </div>
                            <div className="text-xs text-stone-600 mt-1 space-y-0.5">
                              <div>
                                بدهکار طلا: <span className="font-semibold">{item.k15Journal.goldDebitGrams} گرم</span>
                              </div>
                              <div>
                                بدهکار ریال: <span className="font-semibold">{item.k15Journal.fiatDebitToman.toLocaleString('fa-IR')} تومان</span>
                              </div>
                            </div>
                            <div className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700">
                              {item.k15Journal.journalStatusFa}
                            </div>
                          </>
                        ) : (
                          <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-200/60 text-xs text-rose-700">
                            <div className="font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              سند دوبل صادر نشده
                            </div>
                            <div className="text-[11px] text-rose-600 mt-0.5">عدم انطباق در دفتر K15</div>
                          </div>
                        )}
                      </td>

                      {/* Status & Deltas */}
                      <td className="py-3.5 px-4 align-top">
                        <div>{getStatusBadge(item.overallStatus)}</div>

                        <div className="text-xs text-stone-600 mt-2 space-y-1">
                          {item.reconciliationDeltas.goldWeightDeltaGrams !== 0 && (
                            <div className="text-rose-600 font-semibold flex items-center gap-1 text-[11px]">
                              <span>اختلاف وزنی:</span>
                              <span>{item.reconciliationDeltas.goldWeightDeltaGrams > 0 ? '+' : ''}{item.reconciliationDeltas.goldWeightDeltaGrams} گرم</span>
                            </div>
                          )}
                          {item.reconciliationDeltas.fiatAmountDeltaToman !== 0 && (
                            <div className="text-amber-700 font-semibold text-[11px]">
                              اختلاف ریالی: {item.reconciliationDeltas.fiatAmountDeltaToman.toLocaleString('fa-IR')} تومان
                            </div>
                          )}
                          {item.reconciliationDeltas.collateralDeficitToman > 0 && (
                            <div className="text-red-700 text-[11px]">
                              کسری وثیقه: {item.reconciliationDeltas.collateralDeficitToman.toLocaleString('fa-IR')} تومان
                            </div>
                          )}
                          {item.reconciliationDeltas.discrepancyReasons.length > 0 && (
                            <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                              {item.reconciliationDeltas.discrepancyReasons[0]}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Zarrin Link */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="text-xs font-medium text-stone-800">
                          {item.zarrinOutboxLink.zarrinVoucherNo || 'در صف ارسال'}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.zarrinOutboxLink.syncStatus === 'synced'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.zarrinOutboxLink.syncStatus === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {item.zarrinOutboxLink.syncStatusFa}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center align-top" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center gap-1.5">
                          {item.overallStatus !== 'reconciled' ? (
                            <button
                              id={`auto-fix-btn-${item.id}`}
                              onClick={() => handleSingleFix(item)}
                              disabled={isFixing || actionLoading}
                              className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                            >
                              <Zap className={`w-3 h-3 ${isFixing ? 'animate-spin' : ''}`} />
                              {isFixing ? 'رفع...' : 'رفع مغایرت'}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold py-1">
                              <Check className="w-3.5 h-3.5" />
                              تراز و قطعی
                            </span>
                          )}

                          <button
                            id={`view-details-btn-${item.id}`}
                            onClick={() => setSelectedItem(item)}
                            className="text-xs text-stone-500 hover:text-stone-800 font-medium py-0.5 inline-flex items-center gap-0.5 transition"
                          >
                            <Eye className="w-3 h-3" />
                            جزئیات
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tripartite Deep Dive Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    ممیزی تطبیق سه‌جانبه فاکتور {selectedItem.k13Invoice.invoiceNumber}
                  </h3>
                  <div className="text-xs text-stone-500 mt-0.5">
                    کلید تطبیق: {selectedItem.reconciliationKey} • تاریخ:{' '}
                    {selectedItem.timestamp}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedItem.overallStatus)}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Side-by-Side 3 Domain Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: K13 Invoice */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    صورتحساب فروش (K13)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                    رسمی
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span className="text-stone-400">شماره سفارش:</span>
                    <span className="font-semibold text-stone-800">{selectedItem.k13Invoice.orderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">نام خریدار:</span>
                    <span className="font-semibold text-stone-800">{selectedItem.k13Invoice.buyerNameFa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">وزن کل طلا:</span>
                    <span className="font-bold text-amber-700">{selectedItem.k13Invoice.totalWeightGrams} گرم</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">مبلغ کل فاکتور:</span>
                    <span className="font-bold text-stone-900">{selectedItem.k13Invoice.grandTotalToman.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">نوع تسویه:</span>
                    <span className="font-medium text-stone-700">{selectedItem.k13Invoice.settlementModeFa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">سامانه مودیان:</span>
                    <span className="font-semibold text-emerald-700">{selectedItem.k13Invoice.statusFa}</span>
                  </div>
                </div>
              </div>

              {/* Column 2: K14 Risk */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    ارزیابی و ریسک (K14)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                    رده {selectedItem.k14Risk.tier}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span className="text-stone-400">سطح ریسک:</span>
                    <span className="font-semibold text-stone-800">{selectedItem.k14Risk.riskLevelFa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">امتیاز اعتباری:</span>
                    <span className="font-bold text-stone-800">{selectedItem.k14Risk.creditScore} از ۱۰۰</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">سقف مجاز طلا:</span>
                    <span className="font-semibold text-stone-800">{selectedItem.k14Risk.goldCreditLimitGrams} گرم</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">پوشش وثایق:</span>
                    <span className={`font-bold ${selectedItem.k14Risk.collateralCoveragePercent >= 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedItem.k14Risk.collateralCoveragePercent}٪
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">استفاده از حد مجاز:</span>
                    <span className="font-semibold text-stone-800">{selectedItem.k14Risk.goldUtilizationPercent}٪</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">نتیجه سنجش:</span>
                    <span className="font-semibold text-amber-800">{selectedItem.k14Risk.riskAssessmentVerdictFa}</span>
                  </div>
                </div>
              </div>

              {/* Column 3: K15 Ledger */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    دفتر روزنامه دوبل (K15)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    {selectedItem.k15Journal.journalStatusFa}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span className="text-stone-400">شماره سند:</span>
                    <span className="font-semibold text-stone-800">
                      {selectedItem.k15Journal.voucherNumber || 'فاقد سند'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">بدهکار طلا:</span>
                    <span className="font-bold text-stone-800">{selectedItem.k15Journal.goldDebitGrams} گرم</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">بدهکار ریالی:</span>
                    <span className="font-bold text-stone-800">{selectedItem.k15Journal.fiatDebitToman.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">مانده جاری طلا:</span>
                    <span className="font-semibold text-stone-800">{selectedItem.k15Journal.partyRunningGoldBalanceGrams} گرم</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">مانده جاری ریالی:</span>
                    <span className="font-semibold text-stone-800">{selectedItem.k15Journal.partyRunningFiatBalanceToman.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">عطف سند زرین:</span>
                    <span className="font-semibold text-stone-700">{selectedItem.k15Journal.zarrinVoucherRef || 'در نوبت'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reconciliation Analysis & Reasons */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                تحلیل انحراف و دلایل مغایرت موتور K16
              </h4>
              {selectedItem.reconciliationDeltas.discrepancyReasons.length > 0 ? (
                <ul className="list-disc list-inside text-xs text-amber-900/80 space-y-1 font-medium">
                  {selectedItem.reconciliationDeltas.discrepancyReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-700 font-medium">
                  تراز کامل بین ارقام فاکتور K13، ارزیابی سقف K14 و ثبت‌های دوبل K15 بدون هیچ انحرافی برقرار است.
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200">
              <div className="text-xs text-stone-400">
                وضعیت ارسال به زرین: {selectedItem.zarrinOutboxLink.syncStatusFa}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
                >
                  بستن
                </button>
                {selectedItem.overallStatus !== 'reconciled' && (
                  <button
                    onClick={async () => {
                      await handleSingleFix(selectedItem);
                      setSelectedItem(null);
                    }}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    رفع خودکار مغایرت و ثبت سند
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
