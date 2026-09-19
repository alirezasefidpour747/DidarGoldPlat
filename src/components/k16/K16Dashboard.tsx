/**
 * Didar Gold Platform - Kernel 16 (K16) Dashboard
 * Settlement & Zarrin Reconciliation (تسویه و تطبیق زرین K16A/B)
 */

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Send,
  Database,
  Layers,
  Scale,
  Zap,
  Activity,
  Wifi,
  WifiOff,
  Filter,
  Search,
  Check,
  AlertCircle,
  Copy,
  Plus,
  ArrowRightLeft,
  Coins,
  Building2,
  TrendingUp,
  TrendingDown,
  FileCheck,
  Lock,
  Unlock
} from 'lucide-react';
import {
  K16DataPayload,
  ZarrinCatalogItem,
  ZarrinDocumentOutboxEntry,
  ZarrinReconciliationAuditLog,
  ZarrinSyncSummary,
  SettlementPartnerAccount,
  SettlementTransaction,
  SettlementTransactionType
} from '../../types/k16.js';
import { api } from '../../lib/api.js';
import { TripartiteReconciliationView } from './TripartiteReconciliationView.js';

type K16SubTab = 'reconciliation' | 'outbox' | 'catalog' | 'settlement' | 'audit';

export const K16Dashboard: React.FC = () => {
  const [data, setData] = useState<K16DataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<K16SubTab>('reconciliation');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Actions state
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ZarrinDocumentOutboxEntry | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Voucher Modal state
  const [isNewVoucherModalOpen, setIsNewVoucherModalOpen] = useState(false);
  const [newVoucherForm, setNewVoucherForm] = useState({
    idempotencyKey: '',
    eventType: 'order_delivery_pod',
    referenceId: '',
    retailerOrgId: 'org-r-01',
    retailerName: 'گالری طلا و جواهر زمرد تهران',
    totalGoldWeightGrams: 45.5,
    totalAmountRials: 185000000
  });

  // Settlement (K16A) State
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementForm, setSettlementForm] = useState<{
    partnerId: string;
    type: SettlementTransactionType;
    goldWeightGrams: number;
    fiatAmountToman: number;
    referenceBankTraceNo: string;
    noteFa: string;
  }>({
    partnerId: 'org-buyer-01',
    type: 'fiat_bank_receipt',
    goldWeightGrams: 0,
    fiatAmountToman: 50000000,
    referenceBankTraceNo: '',
    noteFa: ''
  });

  const [isNettingConfirmModalOpen, setIsNettingConfirmModalOpen] = useState(false);
  const [partnerForNetting, setPartnerForNetting] = useState<SettlementPartnerAccount | null>(null);

  const [isSyncInvoiceModalOpen, setIsSyncInvoiceModalOpen] = useState(false);
  const [invoiceIdInput, setInvoiceIdInput] = useState('inv-101');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getK16Data();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'خطا در برقراری ارتباط با ماژول K16');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSyncCatalog = async () => {
    try {
      setActionLoading(true);
      const result = await api.syncZarrinCatalog();
      showNotification('success', `همگام‌سازی کامل کاتالوگ زرین با موفقیت انجام شد (${result.syncedCount} قلم کالا).`);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در همگام‌سازی کاتالوگ زرین');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryFailed = async () => {
    try {
      setActionLoading(true);
      const result = await api.retryFailedZarrinDocuments();
      showNotification(
        'success',
        `تلاش مجدد انجام شد: ${result.succeededCount} سند از ${result.retriedCount} با موفقیت در زرین ثبت قطعی گردید.`
      );
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در ارسال مجدد اسناد');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleOffline = async () => {
    if (!data) return;
    try {
      setActionLoading(true);
      const isCurrentlyOffline = data.summary.connectionStatus === 'disconnected';
      const result = await api.toggleZarrinOfflineSimulation(!isCurrentlyOffline);
      showNotification('success', result.message);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در تغییر وضعیت اتصال');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatchDoc = async (docId: string) => {
    try {
      setActionLoading(true);
      const doc = await api.dispatchZarrinDocument(docId);
      showNotification('success', `سند ${doc.id} پردازش شد: ${doc.statusFa}`);
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در ارسال سند');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const result = await api.queueZarrinVoucher({
        idempotencyKey: newVoucherForm.idempotencyKey,
        eventType: newVoucherForm.eventType,
        eventTypeFa:
          newVoucherForm.eventType === 'order_delivery_pod'
            ? 'سند تحویل سفارش (POD)'
            : 'فروش قطعی کیف',
        sourceDomain: 'K10',
        referenceId: newVoucherForm.referenceId || 'REF-DEMO-901',
        retailerOrgId: newVoucherForm.retailerOrgId,
        retailerName: newVoucherForm.retailerName,
        totalGoldWeightGrams: Number(newVoucherForm.totalGoldWeightGrams),
        totalAmountRials: Number(newVoucherForm.totalAmountRials),
        autoDispatch: true
      });

      setIsNewVoucherModalOpen(false);
      showNotification(
        'success',
        result.isDuplicatePrevented
          ? 'کلید یکتا تکراری بود؛ سیستم از ایجاد سند تکراری در زرین جلوگیری کرد (اصل عدم تکرار).'
          : 'سند مالی با موفقیت صادر و به زرین ارسال گردید.'
      );
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در صدور سند');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.recordK16SettlementTransaction({
        partnerId: settlementForm.partnerId,
        type: settlementForm.type,
        goldWeightGrams: Number(settlementForm.goldWeightGrams),
        fiatAmountToman: Number(settlementForm.fiatAmountToman),
        referenceBankTraceNo: settlementForm.referenceBankTraceNo,
        noteFa: settlementForm.noteFa,
        registeredBy: 'کاربر مالی دیدار'
      });
      setIsSettlementModalOpen(false);
      showNotification(
        'success',
        `تراکنش تسویه با کد ${res.transaction.settlementCode} و شماره سند زرین ${res.transaction.zarrinVoucherNo} ثبت و به دفاتر دوبل منتقل شد.`
      );
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در ثبت تسویه');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteBilateralNetting = async (partner: SettlementPartnerAccount) => {
    try {
      setActionLoading(true);
      const res = await api.executeK16BilateralNetting({ partnerId: partner.partnerOrgId });
      setIsNettingConfirmModalOpen(false);
      showNotification(
        'success',
        `تهاتر دوطرفه برای ${partner.partnerNameFa} به میزان ${res.nettedGoldGrams} گرم طلا معادل ${res.nettedFiatToman.toLocaleString('fa-IR')} تومان با موفقیت انجام شد.`
      );
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در اجرای تهاتر');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleReservation = async (item: ZarrinCatalogItem) => {
    try {
      setActionLoading(true);
      const updated = await api.toggleK16CatalogReservation(item.id);
      showNotification(
        'success',
        `وضعیت کالای ${updated.titleFa} به ${updated.isReserved ? 'رزرو شده (عدم تخصیص به سایرین)' : 'آزاد و قابل فروش'} تغییر یافت.`
      );
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در تغییر وضعیت رزرو کالا');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncInvoiceVoucher = async () => {
    if (!invoiceIdInput.trim()) return;
    try {
      setActionLoading(true);
      const res = await api.syncK13InvoiceToZarrin(invoiceIdInput.trim());
      setIsSyncInvoiceModalOpen(false);
      showNotification(
        'success',
        res.isDuplicatePrevented
          ? `صورتحساب ${res.invoiceNumber} قبلاً به زرین ارسال شده بود (شناسه عدم تکرار T18 فعال شد).`
          : `صورتحساب ${res.invoiceNumber} با شماره سند زرین ${res.document.zarrinVoucherNo} ثبت قطعی گردید.`
      );
      await loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'خطا در همگام‌سازی صورتحساب با زرین');
    } finally {
      setActionLoading(false);
    }
  };

  const isOffline = data?.summary.connectionStatus === 'disconnected';

  const filteredOutbox = data?.outboxEntries.filter((doc) => {
    const matchesSearch =
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.idempotencyKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.retailerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.zarrinVoucherNo && doc.zarrinVoucherNo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCatalog = data?.catalogItems.filter((item) => {
    return (
      item.titleFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.zarrinItemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in slide-in-from-top-4 duration-200 ${
            notification.type === 'success'
              ? 'bg-[#191924] border-[#3DD68C] text-[#3DD68C]'
              : 'bg-[#191924] border-[#E5484D] text-[#FF8B8B]'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#3DD68C]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#E5484D]" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#181822] border border-[#2B2B3C] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#C8A951]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#C8A951]/15 text-[#C8A951] font-mono text-xs font-bold border border-[#C8A951]/30">
                KERNEL 16 (K16A & K16B)
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#20202E] border border-[#2F2F42] text-xs">
                {isOffline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-[#E5484D]" />
                    <span className="text-[#FF8B8B] font-medium">اتصال به زرین: قطع (حالت تست T19)</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-[#3DD68C]" />
                    <span className="text-[#3DD68C] font-medium">اتصال پایدار به وب‌سرویس جامع زرین</span>
                  </>
                )}
                <span className="text-[10px] text-[#7A7A8C] font-mono mr-1">
                  ({data?.summary.lastPingLatencyMs || 140}ms)
                </span>
              </div>
            </div>

            <h1 className="text-xl lg:text-2xl font-black text-[#EDEDED] flex items-center gap-2">
              تسویه مالی و یکپارچگی زرین (K16)
            </h1>
            <p className="text-xs text-[#9E9EA8] mt-1.5 leading-relaxed max-w-2xl">
              مدیریت دوطرفه کاتالوگ، تطبیق شناسه‌های UID طلا، صدور اسناد حسابداری فروش، ممانعت از ارسال تکراری (Idempotency) و مدیریت صف خروجی زرین.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSyncCatalog}
              disabled={actionLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#20202E] hover:bg-[#2A2A3E] text-xs font-medium text-[#E5C365] border border-[#C8A951]/30 transition-all cursor-pointer disabled:opacity-50"
              title="دریافت کامل صفحات کاتالوگ زرین و تطبیق بدون تداخل در رزروهای انبار"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
              <span>همگام‌سازی کاتالوگ (T01)</span>
            </button>

            <button
              onClick={handleRetryFailed}
              disabled={actionLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#20202E] hover:bg-[#2A2A3E] text-xs font-medium text-[#EDEDED] border border-[#2F2F42] transition-all cursor-pointer disabled:opacity-50"
              title="تلاش مجدد برای ارسال اسناد در صف خطا"
            >
              <Send className="w-3.5 h-3.5 text-[#C8A951]" />
              <span>تلاش مجدد اسناد خطا (T19)</span>
            </button>

            <button
              onClick={handleToggleOffline}
              disabled={actionLoading}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer disabled:opacity-50 ${
                isOffline
                  ? 'bg-[#3DD68C]/20 border-[#3DD68C]/40 text-[#3DD68C]'
                  : 'bg-[#E5484D]/15 border-[#E5484D]/30 text-[#FF8B8B]'
              }`}
              title="شبیه‌سازی قطعی ارتباط زرین جهت سنجش ایمنی ذخیره اسناد در صف"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isOffline ? 'اتصال مجدد سرور زرین' : 'شبیه‌ساز قطعی زرین (T19)'}</span>
            </button>

            <button
              onClick={() => {
                setNewVoucherForm({
                  idempotencyKey: `IDEMP-MANUAL-${Date.now().toString().slice(-5)}`,
                  eventType: 'order_delivery_pod',
                  referenceId: `REF-${Date.now().toString().slice(-4)}`,
                  retailerOrgId: 'org-r-01',
                  retailerName: 'گالری طلا و جواهر زمرد تهران',
                  totalGoldWeightGrams: 45.5,
                  totalAmountRials: 185000000
                });
                setIsNewVoucherModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D4B965] text-[#141416] text-xs font-bold shadow-lg shadow-[#C8A951]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>صدور سند با کلید عدم تکرار (T18)</span>
            </button>

            <button
              onClick={() => {
                setSettlementForm({
                  partnerId: 'org-buyer-01',
                  type: 'fiat_bank_receipt',
                  goldWeightGrams: 0,
                  fiatAmountToman: 50000000,
                  referenceBankTraceNo: `TRC-${Date.now().toString().slice(-6)}`,
                  noteFa: 'تسویه علی‌الحساب ریالی'
                });
                setIsSettlementModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#3DD68C]/15 hover:bg-[#3DD68C]/25 text-[#3DD68C] border border-[#3DD68C]/30 text-xs font-bold transition-all cursor-pointer"
              title="ثبت دریافت/تحویل فیزیکی طلا یا تراکنش بانکی در دفتر تسویه و زرین"
            >
              <Coins className="w-4 h-4" />
              <span>تسویه جدید طلا/ریال (K16A)</span>
            </button>

            <button
              onClick={() => setIsSyncInvoiceModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#20202E] hover:bg-[#2A2A3E] text-xs font-medium text-[#EDEDED] border border-[#2F2F42] transition-all cursor-pointer"
              title="ارسال مستقیم صورتحساب‌های فروش K13 به صف اسناد حسابداری زرین"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#C8A951]" />
              <span>ارسال صورتحساب K13 به زرین</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-[#262638]">
          <div className="bg-[#14141C] p-3 rounded-xl border border-[#242434]">
            <span className="text-[11px] text-[#868698] block mb-1">اقلام کاتالوگ زرین</span>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold font-mono text-[#EDEDED]">
                {data?.summary.catalogSyncedCount || 0}
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#3DD68C]" />
            </div>
          </div>

          <div className="bg-[#14141C] p-3 rounded-xl border border-[#242434]">
            <span className="text-[11px] text-[#868698] block mb-1">اسناد قطعی در زرین</span>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold font-mono text-[#3DD68C]">
                {data?.summary.outboxSyncedCount || 0}
              </span>
              <FileSpreadsheet className="w-4 h-4 text-[#3DD68C]" />
            </div>
          </div>

          <div className="bg-[#14141C] p-3 rounded-xl border border-[#242434]">
            <span className="text-[11px] text-[#868698] block mb-1">اسناد در صف انتظار</span>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold font-mono text-[#E5C365]">
                {data?.summary.outboxPendingCount || 0}
              </span>
              <Clock className="w-4 h-4 text-[#E5C365]" />
            </div>
          </div>

          <div className="bg-[#14141C] p-3 rounded-xl border border-[#242434]">
            <span className="text-[11px] text-[#868698] block mb-1">اسناد ناموفق (خطا)</span>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold font-mono text-[#FF8B8B]">
                {data?.summary.outboxFailedCount || 0}
              </span>
              <AlertTriangle className="w-4 h-4 text-[#FF8B8B]" />
            </div>
          </div>

          <div className="bg-[#14141C] p-3 rounded-xl border border-[#242434]">
            <span className="text-[11px] text-[#868698] block mb-1">جلوگیری از سند تکراری</span>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold font-mono text-[#C8A951]">
                {data?.summary.idempotencyInterceptionsCount || 0}
              </span>
              <ShieldCheck className="w-4 h-4 text-[#C8A951]" />
            </div>
          </div>

          <div className="bg-[#14141C] p-3 rounded-xl border border-[#242434]">
            <span className="text-[11px] text-[#868698] block mb-1">طلای تسویه‌شده (گرم)</span>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold font-mono text-[#EDEDED]">
                {data?.summary.totalSettledGoldGrams?.toLocaleString('fa-IR') || '۰'}
              </span>
              <Scale className="w-4 h-4 text-[#C8A951]" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center justify-between border-b border-[#262636] pb-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'reconciliation', label: 'تطبیق سه‌جانبه (K13 / K14 / K15)', count: data?.tripartiteReconciliationItems?.length },
            { id: 'outbox', label: 'صف خروجی اسناد زرین (Outbox)', count: data?.outboxEntries.length },
            { id: 'catalog', label: 'کاتالوگ و تطبیق UID (K16B)', count: data?.catalogItems.length },
            { id: 'settlement', label: 'دفتر تسویه و تهاتر (K16A)', count: data?.settlementAccounts?.length },
            { id: 'audit', label: 'لاگ تطبیق و ممیزی عدم تکرار', count: data?.auditLogs.length }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as K16SubTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/15'
                    : 'bg-[#181822] text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#20202E] border border-[#2B2B3C]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isActive ? 'bg-[#141416] text-[#C8A951]' : 'bg-[#242434] text-[#868698]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter / Search input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#767688] absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="جستجو در شناسه‌ها، اسناد یا طرف‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#14141C] border border-[#282838] rounded-xl pr-8 pl-3 py-1.5 text-xs text-[#EDEDED] placeholder-[#666678] focus:border-[#C8A951] focus:outline-none w-56"
            />
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-[#181822] border border-[#2B2B3C] text-[#9E9EA8] hover:text-[#EDEDED] transition-colors cursor-pointer"
            title="به‌روزرسانی جدول"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C8A951]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab: Tripartite Reconciliation (K13 / K14 / K15) */}
      {activeTab === 'reconciliation' && data && (
        <TripartiteReconciliationView
          items={data.tripartiteReconciliationItems || []}
          summary={
            data.tripartiteSummary || {
              totalInvoicesAnalyzed: 0,
              reconciledCount: 0,
              reconciledPercentage: 100,
              riskDiscrepanciesCount: 0,
              pendingVoucherCount: 0,
              amountMismatchCount: 0,
              overdueCount: 0,
              totalInvoiceAmountToman: 0,
              totalJournalAmountToman: 0,
              netVarianceToman: 0,
              totalInvoiceGoldGrams: 0,
              totalJournalGoldGrams: 0,
              netGoldVarianceGrams: 0,
              lastReconciliationRunAt: 'لحظه‌ای'
            }
          }
          onRefresh={loadData}
          onAutoFix={async (recordId) => {
            setActionLoading(true);
            try {
              const res = await api.autoFixK16TripartiteDiscrepancy(recordId);
              showNotification('success', res.message);
              await loadData();
            } catch (err: any) {
              showNotification('error', err.message || 'خطا در رفع مغایرت');
            } finally {
              setActionLoading(false);
            }
          }}
          onBatchReconcile={async () => {
            setActionLoading(true);
            try {
              const res = await api.batchReconcileK16Tripartite();
              showNotification('success', res.message);
              await loadData();
            } catch (err: any) {
              showNotification('error', err.message || 'خطا در تطبیق خودکار دسته‌ای');
            } finally {
              setActionLoading(false);
            }
          }}
          actionLoading={actionLoading}
        />
      )}

      {/* Tab 1: Outbox Queue */}
      {activeTab === 'outbox' && (
        <div className="bg-[#181822] border border-[#282838] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#242434] flex items-center justify-between bg-[#14141C]/60">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#C8A951]" />
              <span className="text-xs font-bold text-[#EDEDED]">
                فهرست اسناد مالی ارسالی به نرم‌افزار زرین با مکانیزم انحصار Idempotency
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#868698]">فیلتر وضعیت:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#1A1A24] border border-[#2D2D3E] text-xs text-[#EDEDED] rounded-lg px-2.5 py-1 focus:outline-none"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="synced_success">ثبت قطعی در زرین</option>
                <option value="pending">در صف ارسال</option>
                <option value="failed_retryable">خطای موقت (تلاش مجدد)</option>
                <option value="failed_permanent">خطای قطعی</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#121218] text-[#868698] border-b border-[#242434]">
                <tr>
                  <th className="p-3">شناسه سند</th>
                  <th className="p-3">کلید یکتا (Idempotency Key)</th>
                  <th className="p-3">رویداد و مرجع</th>
                  <th className="p-3">طرف معامله (طلافروشی)</th>
                  <th className="p-3">وزن طلا</th>
                  <th className="p-3">مبلغ ریالی</th>
                  <th className="p-3">شماره سند زرین</th>
                  <th className="p-3">وضعیت</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222230]">
                {filteredOutbox?.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-[#767688]">
                      هیچ سندی با شرایط جستجو یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredOutbox?.map((doc) => {
                    const isSuccess = doc.status === 'synced_success';
                    const isFailed = doc.status === 'failed_retryable' || doc.status === 'failed_permanent';

                    return (
                      <tr key={doc.id} className="hover:bg-[#1C1C28] transition-colors">
                        <td className="p-3 font-mono font-bold text-[#EDEDED]">{doc.id}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-[#C8A951] bg-[#C8A951]/10 px-1.5 py-0.5 rounded border border-[#C8A951]/20 max-w-[180px] truncate" title={doc.idempotencyKey}>
                              {doc.idempotencyKey}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-[#EDEDED]">{doc.eventTypeFa}</div>
                          <span className="text-[10px] text-[#7A7A8C] font-mono">{doc.sourceDomain} • {doc.referenceId}</span>
                        </td>
                        <td className="p-3 font-medium text-[#D0D0DC]">{doc.retailerName}</td>
                        <td className="p-3 font-mono font-bold text-[#EDEDED]">{doc.totalGoldWeightGrams} گرم</td>
                        <td className="p-3 font-mono text-[#D0D0DC]">
                          {doc.totalAmountRials.toLocaleString('fa-IR')} ریال
                        </td>
                        <td className="p-3 font-mono font-bold">
                          {doc.zarrinVoucherNo ? (
                            <span className="text-[#3DD68C]">{doc.zarrinVoucherNo}</span>
                          ) : (
                            <span className="text-[#7A7A8C]">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                              isSuccess
                                ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                                : isFailed
                                ? 'bg-[#E5484D]/15 text-[#FF8B8B] border border-[#E5484D]/30'
                                : 'bg-[#E5C365]/15 text-[#E5C365] border border-[#E5C365]/30'
                            }`}
                          >
                            {doc.statusFa}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {doc.status !== 'synced_success' && (
                              <button
                                onClick={() => handleDispatchDoc(doc.id)}
                                disabled={actionLoading}
                                className="px-2 py-1 rounded-lg bg-[#C8A951]/15 hover:bg-[#C8A951]/25 text-[#C8A951] text-[11px] font-medium transition-colors cursor-pointer"
                                title="ارسال فوری به وب‌سرویس زرین"
                              >
                                ارسال
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedDoc(doc)}
                              className="px-2 py-1 rounded-lg bg-[#242434] hover:bg-[#2F2F44] text-[#EDEDED] text-[11px] transition-colors cursor-pointer"
                            >
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
      )}

      {/* Tab 2: Catalog & UID Mapping */}
      {activeTab === 'catalog' && (
        <div className="bg-[#181822] border border-[#282838] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#242434] flex items-center justify-between bg-[#14141C]/60">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#C8A951]" />
              <span className="text-xs font-bold text-[#EDEDED]">
                نگاشت اقلام طلای زرین با شناسه‌های یکتای UID و وضعیت رزرو انبار
              </span>
            </div>

            <div className="text-xs text-[#9E9EA8]">
              آخرین تطبیق: <span className="font-mono text-[#C8A951]">{data?.summary.lastCatalogSyncAt}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#121218] text-[#868698] border-b border-[#242434]">
                <tr>
                  <th className="p-3">کد کالا در زرین</th>
                  <th className="p-3">شناسه UID دیدار</th>
                  <th className="p-3">عنوان محصول طلا</th>
                  <th className="p-3">عیار</th>
                  <th className="p-3">وزن پایه</th>
                  <th className="p-3">اجرت</th>
                  <th className="p-3">موجودی زرین</th>
                  <th className="p-3">وضعیت رزرو دیدار</th>
                  <th className="p-3">تطبیق</th>
                  <th className="p-3 text-center">عملیات انبار و رزرو</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222230]">
                {filteredCatalog?.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1C1C28] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#C8A951]">{item.zarrinItemCode}</td>
                    <td className="p-3 font-mono font-bold text-[#EDEDED]">{item.uid}</td>
                    <td className="p-3">
                      <div className="font-medium text-[#EDEDED]">{item.titleFa}</div>
                      <span className="text-[10px] text-[#7A7A8C]">{item.categoryFa}</span>
                    </td>
                    <td className="p-3 font-mono">{item.carat}</td>
                    <td className="p-3 font-mono">{item.standardWeightGrams} گرم</td>
                    <td className="p-3 font-mono text-[#3DD68C]">{item.wagePercent}٪</td>
                    <td className="p-3 font-mono font-bold text-[#EDEDED]">{item.zarrinStockQuantity} عدد</td>
                    <td className="p-3">
                      {item.isReserved ? (
                        <span className="px-2 py-0.5 rounded bg-[#C8A951]/15 text-[#E5C365] text-[10px] font-mono border border-[#C8A951]/30 inline-flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-[#C8A951]" />
                          رزرو: {item.reservedForBagOrOrder}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#3DD68C] inline-flex items-center gap-1">
                          <Unlock className="w-2.5 h-2.5" />
                          آزاد و قابل تخصیص
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#3DD68C]/10 text-[#3DD68C] text-[10px] font-semibold border border-[#3DD68C]/30">
                        {item.syncStatusFa}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleReservation(item)}
                        disabled={actionLoading}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          item.isReserved
                            ? 'bg-[#E5484D]/15 hover:bg-[#E5484D]/25 text-[#FF8B8B] border border-[#E5484D]/30'
                            : 'bg-[#C8A951]/15 hover:bg-[#C8A951]/25 text-[#C8A951] border border-[#C8A951]/30'
                        }`}
                        title={item.isReserved ? 'آزادسازی رزرو این کالا جهت فروش' : 'رزرو اختصاصی کالا برای کیسه/سفارش'}
                      >
                        {item.isReserved ? (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>آزادسازی رزرو</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>رزرو در کیسه</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Settlement Subledger K16A */}
      {activeTab === 'settlement' && (
        <div className="space-y-6">
          {/* Summary KPIs for Settlement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-[#181822] border border-[#282838] rounded-2xl p-4 shadow-xl">
              <span className="text-[11px] text-[#868698] block mb-1">کل بستانکاری طلای همکاران</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold font-mono text-[#3DD68C]">
                  +{(data?.settlementSummary?.totalCreditorGoldGrams || 0).toFixed(3)} گرم
                </span>
                <Scale className="w-4 h-4 text-[#3DD68C]" />
              </div>
              <span className="text-[10px] text-[#6A6A7C] mt-1 block">تعهد طلایی پلتفرم به شرکا</span>
            </div>

            <div className="bg-[#181822] border border-[#282838] rounded-2xl p-4 shadow-xl">
              <span className="text-[11px] text-[#868698] block mb-1">کل بدهکاری طلای همکاران</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold font-mono text-[#FF8B8B]">
                  {(data?.settlementSummary?.totalDebtorGoldGrams || 0).toFixed(3)} گرم
                </span>
                <TrendingDown className="w-4 h-4 text-[#FF8B8B]" />
              </div>
              <span className="text-[10px] text-[#6A6A7C] mt-1 block">طلای تحویلی در انتظار تسویه</span>
            </div>

            <div className="bg-[#181822] border border-[#282838] rounded-2xl p-4 shadow-xl">
              <span className="text-[11px] text-[#868698] block mb-1">مطالبات ریالی وصول‌نشده</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold font-mono text-[#E5C365]">
                  {(data?.settlementSummary?.totalDebtorFiatToman || 0).toLocaleString('fa-IR')} ت
                </span>
                <Coins className="w-4 h-4 text-[#E5C365]" />
              </div>
              <span className="text-[10px] text-[#6A6A7C] mt-1 block">مطالبات در اسناد رسمی زرین</span>
            </div>

            <div className="bg-[#181822] border border-[#282838] rounded-2xl p-4 shadow-xl">
              <span className="text-[11px] text-[#868698] block mb-1">آماده تهاتر دوطرفه (Netting)</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold font-mono text-[#C8A951]">
                  {data?.settlementSummary?.readyForNettingCount || 0} طرف حساب
                </span>
                <ArrowRightLeft className="w-4 h-4 text-[#C8A951]" />
              </div>
              <span className="text-[10px] text-[#6A6A7C] mt-1 block">امکان تسویه بدون انتقال وجه</span>
            </div>

            <div className="bg-[#181822] border border-[#282838] rounded-2xl p-4 shadow-xl">
              <span className="text-[11px] text-[#868698] block mb-1">نرخ مبنای تهاتر طلا</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold font-mono text-[#EDEDED]">
                  {(data?.settlementSummary?.referenceGoldPriceToman || 4500000).toLocaleString('fa-IR')} ت
                </span>
                <Activity className="w-4 h-4 text-[#C8A951]" />
              </div>
              <span className="text-[10px] text-[#6A6A7C] mt-1 block">مظنه طلای ۱۸ عیار / گرم</span>
            </div>
          </div>

          {/* Partner Accounts Subledger Table */}
          <div className="bg-[#181822] border border-[#282838] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#242434] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#14141C]/60">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#C8A951]" />
                <span className="text-xs font-bold text-[#EDEDED]">
                  دفتر معین طرف‌های تجاری (K16A) - مانده‌های ریالی و وزنی طلا همگام با دفتر دوبل K15 و زرین
                </span>
              </div>
              <button
                onClick={() => {
                  setSettlementForm({
                    partnerId: 'org-buyer-01',
                    type: 'fiat_bank_receipt',
                    goldWeightGrams: 0,
                    fiatAmountToman: 50000000,
                    referenceBankTraceNo: `TRC-${Date.now().toString().slice(-6)}`,
                    noteFa: 'تسویه علی‌الحساب ریالی'
                  });
                  setIsSettlementModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#3DD68C]/15 hover:bg-[#3DD68C]/25 text-[#3DD68C] text-xs font-semibold border border-[#3DD68C]/30 transition-all cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ثبت تراکنش تسویه</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#121218] text-[#868698] border-b border-[#242434]">
                  <tr>
                    <th className="p-3">طرف حساب تجاری</th>
                    <th className="p-3">صنف</th>
                    <th className="p-3">کد معین زرین</th>
                    <th className="p-3">تراز وزنی طلا</th>
                    <th className="p-3">تراز ریالی پلتفرم</th>
                    <th className="p-3">ارزش ریالی طلا (تخمینی)</th>
                    <th className="p-3">پتانسیل تهاتر</th>
                    <th className="p-3">وضعیت تسویه</th>
                    <th className="p-3 text-center">عملیات تسویه و پایاپای</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222230]">
                  {data?.settlementAccounts?.map((acc) => {
                    const isGoldCreditor = acc.goldBalanceGrams > 0;
                    const isGoldDebtor = acc.goldBalanceGrams < 0;
                    const isFiatDebtor = acc.fiatBalanceToman > 0;

                    return (
                      <tr key={acc.id} className="hover:bg-[#1C1C28] transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-[#EDEDED]">{acc.partnerNameFa}</div>
                          <span className="font-mono text-[10px] text-[#7A7A8C]">{acc.partnerOrgId}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#242434] text-[#A0A0B0]">
                            {acc.tradeTypeFa}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-[#C8A951]">{acc.zarrinSubledgerCode}</td>
                        <td className="p-3 font-mono font-bold">
                          {isGoldCreditor && (
                            <span className="text-[#3DD68C]">+{acc.goldBalanceGrams.toFixed(3)} گرم (بستانکار)</span>
                          )}
                          {isGoldDebtor && (
                            <span className="text-[#FF8B8B]">{acc.goldBalanceGrams.toFixed(3)} گرم (بدهکار)</span>
                          )}
                          {!isGoldCreditor && !isGoldDebtor && (
                            <span className="text-[#888898]">۰.۰۰۰ گرم (تراز)</span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold">
                          {isFiatDebtor ? (
                            <span className="text-[#FF8B8B]">+{acc.fiatBalanceToman.toLocaleString('fa-IR')} ت (بدهکار)</span>
                          ) : acc.fiatBalanceToman < 0 ? (
                            <span className="text-[#3DD68C]">{Math.abs(acc.fiatBalanceToman).toLocaleString('fa-IR')} ت (بستانکار)</span>
                          ) : (
                            <span className="text-[#888898]">۰ تومان (تراز)</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[#D0D0DC]">
                          {acc.estimatedGoldValueToman.toLocaleString('fa-IR')} ت
                        </td>
                        <td className="p-3 font-mono text-[#E5C365]">
                          {acc.nettingPotentialToman > 0
                            ? `${acc.nettingPotentialToman.toLocaleString('fa-IR')} تومان`
                            : '—'}
                        </td>
                        <td className="p-3">
                          {acc.isReadyForNetting ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 inline-flex items-center gap-1">
                              <ArrowRightLeft className="w-3 h-3 text-[#C8A951]" />
                              آماده تهاتر دوطرفه
                            </span>
                          ) : acc.goldBalanceGrams === 0 && acc.fiatBalanceToman === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              تراز کامل (تسویه صفر)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#242434] text-[#A0A0B0]">
                              مانده یکطرفه
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {acc.isReadyForNetting && (
                              <button
                                onClick={() => {
                                  setPartnerForNetting(acc);
                                  setIsNettingConfirmModalOpen(true);
                                }}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-[#C8A951] hover:bg-[#D4B965] text-[#141416] text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow"
                                title="تهاتر فوری مانده طلایی و ریالی طرف حساب بدون جابجایی وجه نقد"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>تهاتر هوشمند</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSettlementForm({
                                  partnerId: acc.partnerOrgId,
                                  type: acc.fiatBalanceToman > 0 ? 'fiat_bank_receipt' : 'gold_receipt',
                                  goldWeightGrams: acc.goldBalanceGrams < 0 ? Math.abs(acc.goldBalanceGrams) : 0,
                                  fiatAmountToman: acc.fiatBalanceToman > 0 ? acc.fiatBalanceToman : 0,
                                  referenceBankTraceNo: `TRC-${Date.now().toString().slice(-6)}`,
                                  noteFa: `تسویه حساب با ${acc.partnerNameFa}`
                                });
                                setIsSettlementModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#242434] hover:bg-[#2E2E42] text-[#EDEDED] text-[11px] font-medium border border-[#343448] transition-all cursor-pointer"
                            >
                              ثبت تسویه
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Settlement Transactions History Table */}
          <div className="bg-[#181822] border border-[#282838] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#242434] flex items-center justify-between bg-[#14141C]/60">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3DD68C]" />
                <span className="text-xs font-bold text-[#EDEDED]">
                  دفتر کل ثبت تراکنش‌های تسویه فیزیکی طلا، اسناد بانکی و تهاتر (K16A &rarr; زرین Outbox & K15)
                </span>
              </div>
              <span className="text-xs text-[#868698]">
                مجموع تراکنش‌ها: <span className="font-mono text-[#C8A951]">{data?.settlementTransactions?.length || 0}</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#121218] text-[#868698] border-b border-[#242434]">
                  <tr>
                    <th className="p-3">کد تسویه</th>
                    <th className="p-3">تاریخ و زمان</th>
                    <th className="p-3">طرف حساب</th>
                    <th className="p-3">نوع تراکنش</th>
                    <th className="p-3">وزن طلا</th>
                    <th className="p-3">مبلغ ریالی</th>
                    <th className="p-3">شماره پیگیری / انگ</th>
                    <th className="p-3">سند حسابداری زرین</th>
                    <th className="p-3">وضعیت</th>
                    <th className="p-3">توضیحات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222230]">
                  {data?.settlementTransactions?.map((tx) => {
                    const isNetting = tx.type === 'bilateral_netting';
                    const isGold = tx.goldWeightGrams > 0;

                    return (
                      <tr key={tx.id} className="hover:bg-[#1C1C28] transition-colors">
                        <td className="p-3 font-mono font-bold text-[#C8A951]">{tx.settlementCode}</td>
                        <td className="p-3 font-mono text-[#868698]">{tx.timestamp}</td>
                        <td className="p-3 font-bold text-[#EDEDED]">{tx.partnerNameFa}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isNetting
                                ? 'bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30'
                                : isGold
                                ? 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30'
                                : 'bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30'
                            }`}
                          >
                            {tx.typeFa}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-[#EDEDED]">
                          {tx.goldWeightGrams > 0 ? `${tx.goldWeightGrams.toFixed(3)} گرم` : '—'}
                        </td>
                        <td className="p-3 font-mono font-bold text-[#EDEDED]">
                          {tx.fiatAmountToman > 0 ? `${tx.fiatAmountToman.toLocaleString('fa-IR')} تومان` : '—'}
                        </td>
                        <td className="p-3 font-mono text-[#A0A0B0]">{tx.referenceBankTraceNo || '—'}</td>
                        <td className="p-3">
                          {tx.zarrinVoucherNo ? (
                            <span className="font-mono font-bold text-[#3DD68C] bg-[#3DD68C]/10 px-2 py-0.5 rounded border border-[#3DD68C]/30">
                              {tx.zarrinVoucherNo}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#888898]">در انتظار صف</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-[#3DD68C]/15 text-[#3DD68C] text-[10px] font-semibold border border-[#3DD68C]/30">
                            {tx.statusFa}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-[#9E9EA8] max-w-xs truncate">{tx.noteFa || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit & Idempotency Logs */}
      {activeTab === 'audit' && (
        <div className="bg-[#181822] border border-[#282838] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#262638]">
            <ShieldCheck className="w-5 h-5 text-[#C8A951]" />
            <h3 className="text-sm font-bold text-[#EDEDED]">سوابق ممیزی تطبیق و رویدادهای همروندی</h3>
          </div>

          <div className="space-y-3">
            {data?.auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#14141C] border border-[#242434] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'success'
                          ? 'bg-[#3DD68C]/15 text-[#3DD68C]'
                          : log.status === 'warning'
                          ? 'bg-[#E5C365]/15 text-[#E5C365]'
                          : 'bg-[#E5484D]/15 text-[#FF8B8B]'
                      }`}
                    >
                      {log.actionFa}
                    </span>
                    <span className="text-xs font-bold text-[#EDEDED]">{log.referenceId}</span>
                  </div>
                  <p className="text-xs text-[#9E9EA8]">{log.details}</p>
                </div>

                <div className="text-left text-[11px] text-[#767688] shrink-0 font-mono">
                  <div>{log.timestamp}</div>
                  <div className="text-[#A2A2B4]">{log.actor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Voucher Modal */}
      {isNewVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181822] border border-[#2F2F42] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#282838] pb-3">
              <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C8A951]" />
                صدور سند مالی جدید با کلید عدم تکرار (Idempotency)
              </h3>
              <button
                onClick={() => setIsNewVoucherModalOpen(false)}
                className="text-[#888898] hover:text-[#EDEDED] text-xs cursor-pointer"
              >
                بستن
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9E9EA8] mb-1 font-medium">کلید یکتا (Idempotency Key):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newVoucherForm.idempotencyKey}
                    onChange={(e) => setNewVoucherForm({ ...newVoucherForm, idempotencyKey: e.target.value })}
                    className="flex-1 bg-[#14141C] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs font-mono text-[#C8A951] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewVoucherForm({
                        ...newVoucherForm,
                        idempotencyKey: `IDEMP-MANUAL-${Date.now().toString().slice(-5)}`
                      })
                    }
                    className="px-2 py-2 rounded-xl bg-[#20202E] text-[11px] text-[#EDEDED] border border-[#2D2D3E] cursor-pointer"
                  >
                    تولید مجدد
                  </button>
                </div>
                <span className="text-[10px] text-[#7A7A8C] mt-1 block">
                  نکته: در صورت ارسال کلید تکراری، سیستم از ثبت سند دوم جلوگیری کرده و سند قبلی را بازمی‌گرداند (آزمون T18).
                </span>
              </div>

              <div>
                <label className="block text-[#9E9EA8] mb-1 font-medium">شماره ارجاع سند (سفارش / فاکتور):</label>
                <input
                  type="text"
                  required
                  value={newVoucherForm.referenceId}
                  onChange={(e) => setNewVoucherForm({ ...newVoucherForm, referenceId: e.target.value })}
                  className="w-full bg-[#14141C] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs font-mono text-[#EDEDED] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9E9EA8] mb-1 font-medium">وزن کل طلا (گرم):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newVoucherForm.totalGoldWeightGrams}
                    onChange={(e) =>
                      setNewVoucherForm({ ...newVoucherForm, totalGoldWeightGrams: Number(e.target.value) })
                    }
                    className="w-full bg-[#14141C] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs font-mono text-[#EDEDED] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#9E9EA8] mb-1 font-medium">مبلغ ریالی سند:</label>
                  <input
                    type="number"
                    required
                    value={newVoucherForm.totalAmountRials}
                    onChange={(e) =>
                      setNewVoucherForm({ ...newVoucherForm, totalAmountRials: Number(e.target.value) })
                    }
                    className="w-full bg-[#14141C] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs font-mono text-[#EDEDED] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#262638] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewVoucherModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#20202E] text-[#9E9EA8] hover:text-[#EDEDED] cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D4B965] text-[#141416] font-bold cursor-pointer disabled:opacity-50"
                >
                  ارسال سند به زرین
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Drawer / Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181822] border border-[#2F2F42] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#282838] pb-3">
              <h3 className="text-sm font-bold text-[#EDEDED]">جزئیات سند خروجی زرین {selectedDoc.id}</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-[#888898] hover:text-[#EDEDED] text-xs cursor-pointer"
              >
                بستن
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#14141C] rounded-xl border border-[#242434] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#888898]">کلید یکتا (Idempotency Key):</span>
                  <span className="font-mono text-[#C8A951]">{selectedDoc.idempotencyKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888898]">رویداد مرجع:</span>
                  <span className="text-[#EDEDED]">{selectedDoc.eventTypeFa} ({selectedDoc.referenceId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888898]">طلافروشی طرف حساب:</span>
                  <span className="text-[#EDEDED]">{selectedDoc.retailerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888898]">شماره سند حسابداری زرین:</span>
                  <span className="font-mono font-bold text-[#3DD68C]">{selectedDoc.zarrinVoucherNo || 'ثبت نشده'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888898]">وضعیت ارسال:</span>
                  <span className="font-bold text-[#EDEDED]">{selectedDoc.statusFa}</span>
                </div>
                {selectedDoc.lastError && (
                  <div className="p-2 rounded bg-[#E5484D]/10 border border-[#E5484D]/20 text-[#FF8B8B] text-[11px]">
                    علت خطا: {selectedDoc.lastError}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-[#EDEDED] mb-2">اقلام طلای سند:</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedDoc.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#14141C] border border-[#242434] flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <div className="font-medium text-[#EDEDED]">{item.title}</div>
                        <span className="font-mono text-[#7A7A8C]">{item.uid} • {item.zarrinItemCode}</span>
                      </div>
                      <div className="text-left font-mono font-bold text-[#EDEDED]">
                        {item.weightGrams} گرم • {item.totalRials.toLocaleString('fa-IR')} ریال
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#262638] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl bg-[#20202E] text-[#9E9EA8] hover:text-[#EDEDED] cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: New Settlement Transaction (K16A) */}
      {isSettlementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181822] border border-[#2F2F42] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#282838] pb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#3DD68C]" />
                <h3 className="text-sm font-bold text-[#EDEDED]">ثبت تراکنش تسویه مالی و طلایی (K16A)</h3>
              </div>
              <button
                onClick={() => setIsSettlementModalOpen(false)}
                className="text-[#888898] hover:text-[#EDEDED] text-xs cursor-pointer"
              >
                بستن
              </button>
            </div>

            <form onSubmit={handleRecordSettlement} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#888898] block">طرف حساب تجاری:</label>
                <select
                  value={settlementForm.partnerId}
                  onChange={(e) => setSettlementForm({ ...settlementForm, partnerId: e.target.value })}
                  className="w-full bg-[#14141C] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none"
                >
                  {data?.settlementAccounts?.map((acc) => (
                    <option key={acc.id} value={acc.partnerOrgId}>
                      {acc.partnerNameFa} ({acc.tradeTypeFa}) - معین زرین: {acc.zarrinSubledgerCode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#888898] block">نوع تراکنش تسویه:</label>
                <select
                  value={settlementForm.type}
                  onChange={(e) => setSettlementForm({ ...settlementForm, type: e.target.value as SettlementTransactionType })}
                  className="w-full bg-[#14141C] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none"
                >
                  <option value="fiat_bank_receipt">واریز ریالی از طرف مشتری/همکار به حساب پلتفرم (شتاب/پایا)</option>
                  <option value="fiat_bank_transfer">پرداخت ریالی از پلتفرم به حساب همکار (شتاب/پایا)</option>
                  <option value="gold_receipt">دریافت طلای آبشده / شمش فیزیکی از همکار (کاهش بدهی طلا)</option>
                  <option value="gold_delivery">تحویل فیزیکی شمش / مصنوع به همکار</option>
                  <option value="bilateral_netting">تهاتر متقابل پایاپای مانده طلا و ریال</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#888898] block">وزن طلا (گرم):</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={settlementForm.goldWeightGrams}
                    onChange={(e) => setSettlementForm({ ...settlementForm, goldWeightGrams: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#14141C] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs font-mono text-[#EDEDED] focus:outline-none"
                    placeholder="مثال: 15.250"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#888898] block">مبلغ ریالی (تومان):</label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={settlementForm.fiatAmountToman}
                    onChange={(e) => setSettlementForm({ ...settlementForm, fiatAmountToman: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#14141C] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs font-mono text-[#EDEDED] focus:outline-none"
                    placeholder="مثال: 50000000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#888898] block">شماره پیگیری بانکی یا شماره برگه آزمایشگاه انگ طلا:</label>
                <input
                  type="text"
                  value={settlementForm.referenceBankTraceNo}
                  onChange={(e) => setSettlementForm({ ...settlementForm, referenceBankTraceNo: e.target.value })}
                  className="w-full bg-[#14141C] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs font-mono text-[#EDEDED] focus:outline-none"
                  placeholder="مثال: TRC-982143 یا ANG-TEH-5541"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#888898] block">شرح و توضیحات تسویه:</label>
                <input
                  type="text"
                  value={settlementForm.noteFa}
                  onChange={(e) => setSettlementForm({ ...settlementForm, noteFa: e.target.value })}
                  className="w-full bg-[#14141C] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none"
                  placeholder="توضیحات اختیاری سند مالی..."
                />
              </div>

              <div className="p-3 bg-[#14141C] rounded-xl border border-[#262638] text-[11px] text-[#A0A0B0] leading-relaxed">
                با ثبت این تراکنش، علاوه بر به‌روزرسانی مانده معین طرف حساب، سند متناظر با کلید یکتای عدم تکرار در صف خروجی زرین ثبت و در دفتر دوبل K15 اعمال می‌گردد.
              </div>

              <div className="pt-3 border-t border-[#262638] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettlementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#20202E] text-[#9E9EA8] hover:text-[#EDEDED] cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-[#3DD68C] hover:bg-[#4AE397] text-[#141416] font-bold cursor-pointer disabled:opacity-50"
                >
                  ثبت قطعی تسویه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Bilateral Netting Confirmation Modal */}
      {isNettingConfirmModalOpen && partnerForNetting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181822] border border-[#2F2F42] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#282838] pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-[#C8A951]" />
                <h3 className="text-sm font-bold text-[#EDEDED]">تأیید تهاتر متقابل پایاپای (Netting)</h3>
              </div>
              <button
                onClick={() => setIsNettingConfirmModalOpen(false)}
                className="text-[#888898] hover:text-[#EDEDED] text-xs cursor-pointer"
              >
                بستن
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#14141C] rounded-xl border border-[#262638] space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-[#888898]">طرف حساب:</span>
                  <span className="font-bold text-[#EDEDED]">{partnerForNetting.partnerNameFa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888898]">کد معین زرین:</span>
                  <span className="font-mono text-[#C8A951]">{partnerForNetting.zarrinSubledgerCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888898]">مانده طلایی بستانکار:</span>
                  <span className="font-mono font-bold text-[#3DD68C]">+{partnerForNetting.goldBalanceGrams.toFixed(3)} گرم</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888898]">مانده ریالی بدهکار:</span>
                  <span className="font-mono font-bold text-[#FF8B8B]">+{partnerForNetting.fiatBalanceToman.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between border-t border-[#222232] pt-2">
                  <span className="text-[#888898]">نرخ مبنای تهاتر:</span>
                  <span className="font-mono text-[#EDEDED]">
                    {(data?.settlementSummary?.referenceGoldPriceToman || 4500000).toLocaleString('fa-IR')} ت / گرم
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888898]">پتانسیل تهاتر محاسبه‌شده:</span>
                  <span className="font-mono font-bold text-[#E5C365]">
                    {partnerForNetting.nettingPotentialToman.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#A0A0B0] leading-relaxed">
                با اجرای این عملیات، مانده طلای طرف حساب در ازای بدهی ریالی وی تسویه شده و سند تهاتر دوطرفه در سیستم حسابداری زرین و دفتر دوبل K15 ثبت قطعی خواهد شد. هیچ‌گونه انتقال وجه بانکی نیاز نخواهد بود.
              </p>

              <div className="pt-3 border-t border-[#262638] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNettingConfirmModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#20202E] text-[#9E9EA8] hover:text-[#EDEDED] cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleExecuteBilateralNetting(partnerForNetting)}
                  className="px-4 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D4B965] text-[#141416] font-bold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>اجرای فوری تهاتر</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Sync Invoice to Zarrin (K13 -> K16) */}
      {isSyncInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181822] border border-[#2F2F42] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#282838] pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#C8A951]" />
                <h3 className="text-sm font-bold text-[#EDEDED]">ارسال صورتحساب فروش به زرین (K13 &rarr; K16)</h3>
              </div>
              <button
                onClick={() => setIsSyncInvoiceModalOpen(false)}
                className="text-[#888898] hover:text-[#EDEDED] text-xs cursor-pointer"
              >
                بستن
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#888898] block">شناسه صورتحساب فروش در K13:</label>
                <input
                  type="text"
                  value={invoiceIdInput}
                  onChange={(e) => setInvoiceIdInput(e.target.value)}
                  className="w-full bg-[#14141C] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs font-mono text-[#EDEDED] focus:outline-none"
                  placeholder="مثال: inv-101"
                />
              </div>

              <div className="p-3 bg-[#14141C] rounded-xl border border-[#262638] text-[11px] text-[#A0A0B0] space-y-1.5">
                <p>صورتحساب‌های موجود در سامانه فروش K13:</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInvoiceIdInput('inv-101')}
                    className="px-2.5 py-1 rounded bg-[#242434] hover:bg-[#2C2C40] text-xs font-mono text-[#C8A951] cursor-pointer"
                  >
                    inv-101 (طلافروشی زمرد)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceIdInput('inv-102')}
                    className="px-2.5 py-1 rounded bg-[#242434] hover:bg-[#2C2C40] text-xs font-mono text-[#C8A951] cursor-pointer"
                  >
                    inv-102 (جواهرسازی کاخ)
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#262638] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSyncInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#20202E] text-[#9E9EA8] hover:text-[#EDEDED] cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleSyncInvoiceVoucher}
                  className="px-4 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D4B965] text-[#141416] font-bold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>صدور سند در زرین (T18)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
