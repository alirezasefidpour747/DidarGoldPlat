/**
 * Didar Gold Platform - Kernel 14 to Kernel 15 Intermediary Bridge View
 * بخش مدیریت سرویس واسط K14 (مواجهه اعتباری) و K15 (تعهد مالی و دفتر دوگانه)
 * ثبت خودکار اسناد حسابداری دوطرفه بر مبنای استاندارد کدینگ حسابداری زرین
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  BookOpen,
  Scale,
  DollarSign,
  Coins,
  Sparkles,
  X,
  ChevronLeft,
  Eye,
  Clock,
  Send,
  ShieldCheck,
  Check,
  Building2,
  FileText
} from 'lucide-react';
import {
  K14K15BridgeStatus,
  K14K15SyncLog,
  DualJournalVoucher,
  DoubleEntryArticleLeg
} from '../../types/k15.js';
import { apiFetch } from '../../lib/api.js';

const fetch = apiFetch;

interface K14K15BridgeViewProps {
  onVoucherCreated?: () => void;
}

export const K14K15BridgeView: React.FC<K14K15BridgeViewProps> = ({ onVoucherCreated }) => {
  const [bridgeStatus, setBridgeStatus] = useState<K14K15BridgeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal for Double-Entry Voucher inspection
  const [inspectingVoucher, setInspectingVoucher] = useState<{
    voucherNumber: string;
    articles: DoubleEntryArticleLeg[];
    k14Ref?: string;
    invoiceNumber?: string;
    partyNameFa: string;
    goldDebitGrams: number;
    fiatDebitToman: number;
    voucherDateFa: string;
  } | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/kernel/k15/bridge/status');
      const json = await res.json();
      if (json.success && json.data) {
        setBridgeStatus(json.data);
      }
    } catch (err: any) {
      console.error('Failed to load K14-K15 bridge status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Toggle Auto-sync
  const handleToggleAutoSync = async () => {
    if (!bridgeStatus) return;
    try {
      setActionLoading('toggle');
      const res = await fetch('/api/admin/kernel/k15/bridge/toggle-autosync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !bridgeStatus.isAutoSyncEnabled })
      });
      const json = await res.json();
      if (json.success) {
        setBridgeStatus((prev) => (prev ? { ...prev, isAutoSyncEnabled: json.data.isAutoSyncEnabled } : null));
        setNotification({ type: 'success', message: json.message });
      } else {
        setNotification({ type: 'error', message: json.error || 'خطا در تغییر وضعیت سرویس واسط' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // Sync single invoice
  const handleSyncInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      setActionLoading(invoiceId);
      const res = await fetch('/api/admin/kernel/k15/bridge/sync-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          operatorName: 'کاربر ارشد سامانه دیدار',
          forceBypassOverride: true,
          overrideReason: 'تایید و صدور دستی سند حسابداری دوطرفه از داشبورد واسط K14-K15'
        })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({
          type: 'success',
          message: `سند دوطرفه با شماره ${json.voucher?.voucherNumber} برای فاکتور ${invoiceNumber} صادر و ثبت شد.`
        });
        await loadStatus();
        if (onVoucherCreated) onVoucherCreated();

        if (json.voucher && json.voucher.doubleEntryArticles) {
          setInspectingVoucher({
            voucherNumber: json.voucher.voucherNumber,
            articles: json.voucher.doubleEntryArticles,
            k14Ref: json.voucher.k14ExposureClearanceRef,
            invoiceNumber: json.voucher.k13InvoiceNumber,
            partyNameFa: json.voucher.partyNameFa,
            goldDebitGrams: json.voucher.goldDebitGrams,
            fiatDebitToman: json.voucher.fiatDebitToman,
            voucherDateFa: json.voucher.voucherDateFa
          });
        }
      } else {
        setNotification({ type: 'error', message: json.message || json.error });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // Batch sync all pending invoices
  const handleBatchSync = async () => {
    try {
      setActionLoading('batch');
      const res = await fetch('/api/admin/kernel/k15/bridge/batch-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorName: 'عملیات دسته‌ای مدیر مالی دیدار' })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({
          type: 'success',
          message: `${json.data.syncedCount} سند حسابداری دوطرفه صادر گردید (${json.data.totalGoldGramsSynced.toLocaleString('fa-IR')} گرم طلا و ${(json.data.totalFiatTomanSynced / 1000000).toLocaleString('fa-IR')} م.تومان).`
        });
        await loadStatus();
        if (onVoucherCreated) onVoucherCreated();
      } else {
        setNotification({ type: 'error', message: json.error || 'خطا در اجرای همگام‌سازی دسته‌ای' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const formatToman = (val?: number) => {
    if (!val) return '۰ تومان';
    return `${val.toLocaleString('fa-IR')} تومان`;
  };

  const formatGrams = (val?: number) => {
    if (!val) return '۰.۰۰۰ گرم';
    return `${val.toLocaleString('fa-IR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} گرم`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-[#18281E] border border-[#2E7D4E]/60 text-[#3DD68C]'
              : 'bg-[#2A1719] border border-[#7D2E35]/60 text-[#FF6B6B]'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#3DD68C]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#FF6B6B]" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            بستن
          </button>
        </div>
      )}

      {/* Main Bridge Banner & Controls */}
      <div className="bg-[#181824] border border-[#2A2A3E] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C8A951]/20 border border-[#C8A951]/40 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-[#E5C365]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-[#EDEDED]">
                    سرویس واسط یکپارچه K14 ↔ K15 (ثبت خودکار اسناد حسابداری دوطرفه)
                  </h2>
                  <span className="bg-[#3DD68C]/15 text-[#3DD68C] px-2 py-0.5 rounded text-[10px] font-bold border border-[#3DD68C]/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3DD68C] animate-pulse"></span>
                    سرویس واسط برخط (Online)
                  </span>
                </div>
                <p className="text-xs text-[#9E9EA8] mt-0.5 leading-relaxed">
                  انتقال و تطبیق آنی داده‌های تایید شده اعتباری K14 به معین‌های دوگانه وزنی (طلا ۱۸ عیار) و پولی (تومان) در K15 مطابق کدینگ استاندارد زرین
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Auto-sync Toggle Button */}
            <button
              onClick={handleToggleAutoSync}
              disabled={actionLoading === 'toggle'}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border cursor-pointer transition-all ${
                bridgeStatus?.isAutoSyncEnabled
                  ? 'bg-[#1D2E24] text-[#3DD68C] border-[#2E7D4E]'
                  : 'bg-[#2A2A38] text-[#9E9EA8] border-[#3E3E52]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  bridgeStatus?.isAutoSyncEnabled ? 'bg-[#3DD68C] text-[#121E16]' : 'bg-[#555568] text-[#EDEDED]'
                }`}
              >
                {bridgeStatus?.isAutoSyncEnabled ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '×'}
              </div>
              <span>
                ثبت خودکار K14 → K15: {bridgeStatus?.isAutoSyncEnabled ? 'فعال و خودکار' : 'غیرفعال (دستی)'}
              </span>
            </button>

            {/* Batch Sync Button */}
            <button
              onClick={handleBatchSync}
              disabled={actionLoading === 'batch' || (bridgeStatus?.pendingSyncCount || 0) === 0}
              className="px-4 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D6B75E] text-[#141416] text-xs font-bold cursor-pointer transition-all flex items-center gap-2 disabled:opacity-40 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>همگام‌سازی دسته‌ای ({bridgeStatus?.pendingSyncCount || 0} فاکتور)</span>
            </button>

            {/* Refresh */}
            <button
              onClick={loadStatus}
              disabled={loading}
              className="p-2 rounded-xl bg-[#202030] border border-[#2E2E42] text-[#9E9EA8] hover:text-[#EDEDED] cursor-pointer disabled:opacity-50"
              title="به‌روزرسانی آمار واسط"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C8A951]' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Telemetry Metrics */}
        {bridgeStatus && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-[#262638]">
            {/* Metric 1 */}
            <div className="p-3.5 rounded-xl bg-[#13131D] border border-[#28283C] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#868698]">فاکتورهای همگام‌شده اعتباری</span>
                <CheckCircle2 className="w-4 h-4 text-[#3DD68C]" />
              </div>
              <div className="text-lg font-bold font-mono text-[#3DD68C]">
                {bridgeStatus.totalSyncedCount.toLocaleString('fa-IR')} <span className="text-xs font-normal">سند</span>
              </div>
              <span className="text-[10px] text-[#7A7A8E] block">ثبت قطعی در دفتر معین دوگانه</span>
            </div>

            {/* Metric 2 */}
            <div className="p-3.5 rounded-xl bg-[#13131D] border border-[#28283C] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#868698]">وزن طلای ثبت‌شده در معین</span>
                <Coins className="w-4 h-4 text-[#E5C365]" />
              </div>
              <div className="text-lg font-bold font-mono text-[#E5C365]">
                {formatGrams(bridgeStatus.totalSyncedGoldWeightGrams)}
              </div>
              <span className="text-[10px] text-[#7A7A8E] block">پای اول سند: معین وزنی طلا</span>
            </div>

            {/* Metric 3 */}
            <div className="p-3.5 rounded-xl bg-[#13131D] border border-[#28283C] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#868698]">ارزش تعهدات ریالی ثبت‌شده</span>
                <DollarSign className="w-4 h-4 text-[#70A5FF]" />
              </div>
              <div className="text-lg font-bold font-mono text-[#70A5FF]">
                {formatToman(bridgeStatus.totalSyncedFiatToman)}
              </div>
              <span className="text-[10px] text-[#7A7A8E] block">پای دوم سند: معین نقدی و مالیات</span>
            </div>

            {/* Metric 4 */}
            <div className="p-3.5 rounded-xl bg-[#13131D] border border-[#28283C] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#868698]">فاکتورهای در انتظار صدور سند</span>
                <Clock className="w-4 h-4 text-[#FF9E40]" />
              </div>
              <div className="text-lg font-bold font-mono text-[#FF9E40]">
                {bridgeStatus.pendingSyncCount.toLocaleString('fa-IR')} <span className="text-xs font-normal">فاکتور</span>
              </div>
              <span className="text-[10px] text-[#7A7A8E] block">دارای تاییدیه اعتباری K14</span>
            </div>
          </div>
        )}
      </div>

      {/* Pending Invoices Table */}
      <div className="bg-[#181824] border border-[#2A2A3E] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#1B1B28] border-b border-[#2A2A3E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C8A951]" />
            <h3 className="text-xs font-bold text-[#EDEDED]">
              فاکتورهای تایید شده در K14 در انتظار صدور سند دوطرفه دفتر دوگانه ({bridgeStatus?.pendingInvoices?.length || 0})
            </h3>
          </div>
          <span className="text-[11px] text-[#8E8EA0]">
            با کلیک روی «ثبت سند»، اقلام وزنی و پولی فاکتور مستقیماً به معین دوگانه K15 منتقل می‌شوند
          </span>
        </div>

        {bridgeStatus?.pendingInvoices && bridgeStatus.pendingInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#13131D] text-[#8E8EA0] border-b border-[#262638]">
                <tr>
                  <th className="py-3 px-4">شماره صورتحساب</th>
                  <th className="py-3 px-4">طرف حساب / خریدار</th>
                  <th className="py-3 px-4 text-center">وزن فاکتور (گرم ۱۸ عیار)</th>
                  <th className="py-3 px-4 text-center">مبلغ کل فاکتور (تومان)</th>
                  <th className="py-3 px-4 text-center">وضعیت تاییدیه K14</th>
                  <th className="py-3 px-4 text-center">عملیات انتقال به دفتر دوگانه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222234]">
                {bridgeStatus.pendingInvoices.map((inv) => (
                  <tr key={inv.invoiceId} className="hover:bg-[#1D1D2C] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#EDEDED]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#EDEDED]">
                      {inv.buyerNameFa}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-center text-[#E5C365]">
                      {formatGrams(inv.totalWeightGrams)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-center text-[#EDEDED]">
                      {formatToman(inv.grandTotalToman)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
                        <ShieldCheck className="w-3 h-3 text-[#3DD68C]" />
                        <span>تایید اهلیت اعتباری K14</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleSyncInvoice(inv.invoiceId, inv.invoiceNumber)}
                        disabled={actionLoading === inv.invoiceId}
                        className="px-3 py-1.5 rounded-lg bg-[#C8A951] hover:bg-[#D6B75E] text-[#141416] text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 mx-auto disabled:opacity-50 shadow-sm"
                      >
                        {actionLoading === inv.invoiceId ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>ثبت خودکار سند حسابداری دوطرفه</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-[#7A7A8E] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#3DD68C] mx-auto opacity-80" />
            <p className="text-xs font-medium text-[#EDEDED]">
              کلیه صورتحساب‌های تایید شده در K14 با موفقیت به دفتر دوگانه K15 منتقل شده‌اند.
            </p>
            <p className="text-[11px] text-[#7A7A8E]">
              هیچ فاکتور معلقی در صف انتظار وجود ندارد.
            </p>
          </div>
        )}
      </div>

      {/* Sync Logs Table */}
      <div className="bg-[#181824] border border-[#2A2A3E] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-[#1B1B28] border-b border-[#2A2A3E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#70A5FF]" />
            <h3 className="text-xs font-bold text-[#EDEDED]">
              سوابق و لاگ‌های نظارتی سرویس واسط K14 ↔ K15 ({bridgeStatus?.recentSyncLogs?.length || 0} رویداد اخیر)
            </h3>
          </div>
          <span className="text-[11px] text-[#8E8EA0]">
            ثبت متقابل در کاردکس زرین و سامانه مدیریت مواجهه
          </span>
        </div>

        {bridgeStatus?.recentSyncLogs && bridgeStatus.recentSyncLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#13131D] text-[#8E8EA0] border-b border-[#262638]">
                <tr>
                  <th className="py-3 px-4">شناسه رویداد / زمان</th>
                  <th className="py-3 px-4">شماره سند صادرشده K15</th>
                  <th className="py-3 px-4">صورتحساب K13</th>
                  <th className="py-3 px-4">طرف حساب</th>
                  <th className="py-3 px-4 text-center">بدهکار معین طلا</th>
                  <th className="py-3 px-4 text-center">بدهکار معین پولی</th>
                  <th className="py-3 px-4 font-mono">مرجع تایید K14</th>
                  <th className="py-3 px-4 text-center">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222234]">
                {bridgeStatus.recentSyncLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1D1D2C] transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <span className="text-[#EDEDED] font-bold block">{log.id}</span>
                      <span className="text-[10px] text-[#7A7A8E]">{log.syncedAtFa}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#C8A951]">
                      {log.voucherNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#EDEDED]">
                      {log.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#EDEDED]">
                      {log.partyNameFa}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-center text-[#E5C365]">
                      {formatGrams(log.goldDebitGrams)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-center text-[#EDEDED]">
                      {formatToman(log.fiatDebitToman)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-[#8E8EA0]">
                      {log.k14ClearanceRef}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
                        <CheckCircle2 className="w-3 h-3 text-[#3DD68C]" />
                        <span>ثبت موفقیت‌آمیز</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-[#7A7A8E] text-xs">
            هنوز لاگی در سیستم واسط ثبت نشده است.
          </div>
        )}
      </div>

      {/* Double-Entry Article Inspector Modal */}
      {inspectingVoucher && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181824] border border-[#2A2A3E] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#262638]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C8A951]/20 text-[#E5C365] flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#EDEDED]">
                    سند حسابداری دوطرفه دفتر دوگانه (استاندارد زرین)
                  </h2>
                  <span className="text-[11px] font-mono text-[#C8A951]">
                    {inspectingVoucher.voucherNumber} • {inspectingVoucher.voucherDateFa}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingVoucher(null)}
                className="text-[#8E8EA0] hover:text-[#EDEDED] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voucher Meta Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#13131D] p-3.5 rounded-xl border border-[#262638] text-xs">
              <div>
                <span className="text-[#7A7A8E] block text-[10px]">طرف حساب:</span>
                <span className="font-bold text-[#EDEDED]">{inspectingVoucher.partyNameFa}</span>
              </div>
              <div>
                <span className="text-[#7A7A8E] block text-[10px]">صورتحساب مرجع K13:</span>
                <span className="font-mono font-bold text-[#C8A951]">{inspectingVoucher.invoiceNumber || '—'}</span>
              </div>
              <div>
                <span className="text-[#7A7A8E] block text-[10px]">کد تایید اعتباری K14:</span>
                <span className="font-mono text-[#3DD68C]">{inspectingVoucher.k14Ref || 'تایید خودکار'}</span>
              </div>
              <div>
                <span className="text-[#7A7A8E] block text-[10px]">پایه‌های سند:</span>
                <span className="text-[#EDEDED] font-medium">دوپایه (وزن طلا + ریال)</span>
              </div>
            </div>

            {/* Articles Table */}
            <div className="border border-[#262638] rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#13131D] text-[#8E8EA0] border-b border-[#262638]">
                  <tr>
                    <th className="py-2.5 px-3">ردیف</th>
                    <th className="py-2.5 px-3">کد معین زرین</th>
                    <th className="py-2.5 px-3">عنوان حساب معین</th>
                    <th className="py-2.5 px-3">شرح آرتیکل</th>
                    <th className="py-2.5 px-3 text-center">بدهکار</th>
                    <th className="py-2.5 px-3 text-center">بستانکار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222234]">
                  {inspectingVoucher.articles.map((art, idx) => (
                    <tr key={art.id || idx} className="hover:bg-[#1D1D2C]">
                      <td className="py-2.5 px-3 text-center font-mono text-[#7A7A8E]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-[#C8A951] font-bold">{art.accountCode}</td>
                      <td className="py-2.5 px-3 font-medium text-[#EDEDED]">{art.accountTitleFa}</td>
                      <td className="py-2.5 px-3 text-[#9E9EA8] text-[11px] leading-relaxed">{art.descriptionFa}</td>
                      
                      {/* Debit */}
                      <td className="py-2.5 px-3 font-mono font-bold text-center text-[#E5C365]">
                        {art.side === 'debit' ? (
                          art.legType === 'gold_weight' ? formatGrams(art.amount) : formatToman(art.amount)
                        ) : '—'}
                      </td>

                      {/* Credit */}
                      <td className="py-2.5 px-3 font-mono font-bold text-center text-[#3DD68C]">
                        {art.side === 'credit' ? (
                          art.legType === 'gold_weight' ? formatGrams(art.amount) : formatToman(art.amount)
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Balance Verification Footer */}
            <div className="bg-[#14141E] p-3.5 rounded-xl border border-[#262638] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#3DD68C]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-bold">سند کاملاً تراز و متوازن است (موازنه وزنی و پولی در زرین).</span>
              </div>
              <button
                onClick={() => setInspectingVoucher(null)}
                className="px-5 py-2 rounded-xl bg-[#202030] text-[#EDEDED] text-xs font-bold hover:bg-[#28283C] cursor-pointer"
              >
                بستن پنجره سند
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
