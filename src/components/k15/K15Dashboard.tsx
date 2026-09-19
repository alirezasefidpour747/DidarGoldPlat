/**
 * Didar Gold Platform - Kernel 15 (K15) Dashboard
 * Financial Obligations & Dual Subledgers (تعهد مالی و دفتر دوگانه)
 * Strictly maintains linked gold-weight (grams at 750/995 purity) and fiat currency (Toman) subledgers.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Scale,
  DollarSign,
  Coins,
  RefreshCw,
  Search,
  Filter,
  Plus,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  Clock,
  Zap,
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  Layers,
  Sparkles,
  Percent,
  Calculator,
  X
} from 'lucide-react';
import {
  K15DataPayload,
  PartyAccountBalance,
  DualJournalVoucher,
  DualTrialBalance,
  DualVoucherType,
  PartyAccountStatus
} from '../../types/k15.js';
import { K14K15BridgeView } from './K14K15BridgeView.js';

type K15SubTab = 'parties' | 'vouchers' | 'trial_balance' | 'netting' | 'bridge';

export const K15Dashboard: React.FC = () => {
  const [data, setData] = useState<K15DataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<K15SubTab>('parties');

  // Notification Banner
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters & Search
  const [partySearch, setPartySearch] = useState('');
  const [partyStatusFilter, setPartyStatusFilter] = useState<string>('all');
  const [voucherSearch, setVoucherSearch] = useState('');
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<string>('all');

  // Modals & Drawers
  const [statementParty, setStatementParty] = useState<PartyAccountBalance | null>(null);
  const [statementVouchers, setStatementVouchers] = useState<DualJournalVoucher[]>([]);
  const [loadingStatement, setLoadingStatement] = useState(false);

  const [isNewVoucherModalOpen, setIsNewVoucherModalOpen] = useState(false);
  const [newVoucherForm, setNewVoucherForm] = useState({
    partyId: '',
    voucherType: 'gold_melted_settlement' as DualVoucherType,
    titleFa: '',
    descriptionFa: '',
    referenceDocNumber: '',
    goldDebitGrams: '',
    goldCreditGrams: '',
    goldCarat: 750,
    fiatDebitToman: '',
    fiatCreditToman: '',
    registeredBy: 'کاربر سیستم حسابداری دوگانه'
  });

  const [isNettingModalOpen, setIsNettingModalOpen] = useState(false);
  const [nettingForm, setNettingForm] = useState({
    partyId: '',
    direction: 'fiat_to_gold' as 'fiat_to_gold' | 'gold_to_fiat',
    amount: '',
    goldPriceToman: 4250000
  });

  // Price adjustment
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState('');

  // Load K15 Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/kernel/k15');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        if (json.data.referenceGoldPriceToman) {
          setNettingForm((prev) => ({
            ...prev,
            goldPriceToman: json.data.referenceGoldPriceToman
          }));
        }
      } else {
        setError(json.error || 'خطا در بارگذاری اطلاعات دفتر دوگانه K15');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در اتصال به سرویس K15');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load Detailed Statement for a Party
  const handleOpenStatement = async (party: PartyAccountBalance) => {
    setStatementParty(party);
    setLoadingStatement(true);
    try {
      const res = await fetch(`/api/admin/kernel/k15/parties/${party.partyId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setStatementVouchers(json.data.vouchers || []);
      }
    } catch (err) {
      console.error('Failed to load party statement:', err);
    } finally {
      setLoadingStatement(false);
    }
  };

  // Open Netting Modal with Party Pre-selected
  const handleOpenNetting = (party?: PartyAccountBalance) => {
    const selectedParty = party || (data?.partyBalances && data.partyBalances[0]);
    if (selectedParty) {
      const defaultAmount = selectedParty.fiatBalanceToman > 0
        ? selectedParty.fiatBalanceToman
        : (selectedParty.goldBalanceGrams750 > 0 ? selectedParty.goldBalanceGrams750 : 0);

      const defaultDirection = selectedParty.fiatBalanceToman > 0 ? 'fiat_to_gold' : 'gold_to_fiat';

      setNettingForm({
        partyId: selectedParty.partyId,
        direction: defaultDirection,
        amount: defaultAmount > 0 ? defaultAmount.toString() : '',
        goldPriceToman: data?.referenceGoldPriceToman || 4250000
      });
    }
    setIsNettingModalOpen(true);
  };

  // Submit Netting Execution
  const handleExecuteNetting = async () => {
    if (!nettingForm.partyId || !nettingForm.amount || Number(nettingForm.amount) <= 0) {
      setNotification({ type: 'error', message: 'لطفاً طرف حساب و مقدار معتبر را وارد نمایید.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/kernel/k15/netting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: nettingForm.partyId,
          direction: nettingForm.direction,
          amount: Number(nettingForm.amount),
          goldPriceToman: Number(nettingForm.goldPriceToman)
        })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({
          type: 'success',
          message: json.message || 'عملیات تهاتر با موفقیت انجام و سند دوگانه صادر شد.'
        });
        setIsNettingModalOpen(false);
        loadData();
      } else {
        setNotification({ type: 'error', message: json.error || 'خطا در ثبت سند تهاتر' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'خطا در ارتباط با سرور' });
    }
  };

  // Submit New Dual Voucher
  const handleCreateVoucher = async () => {
    if (!newVoucherForm.partyId || !newVoucherForm.titleFa) {
      setNotification({ type: 'error', message: 'لطفاً طرف حساب و عنوان سند را تکمیل کنید.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/kernel/k15/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVoucherForm,
          goldDebitGrams: Number(newVoucherForm.goldDebitGrams || 0),
          goldCreditGrams: Number(newVoucherForm.goldCreditGrams || 0),
          fiatDebitToman: Number(newVoucherForm.fiatDebitToman || 0),
          fiatCreditToman: Number(newVoucherForm.fiatCreditToman || 0)
        })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({
          type: 'success',
          message: json.message || 'سند دفتر دوگانه با موفقیت ثبت شد.'
        });
        setIsNewVoucherModalOpen(false);
        loadData();
      } else {
        setNotification({ type: 'error', message: json.error || 'خطا در ثبت سند' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'خطا در برقراری ارتباط' });
    }
  };

  // Update Reference Price
  const handleUpdatePrice = async () => {
    const p = Number(customPriceInput);
    if (!p || p <= 0) {
      setNotification({ type: 'error', message: 'لطفاً نرخ معتبر تومان وارد کنید.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/kernel/k15/reference-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceToman: p })
      });
      const json = await res.json();
      if (json.success) {
        setNotification({ type: 'success', message: json.message });
        setIsPriceModalOpen(false);
        loadData();
      } else {
        setNotification({ type: 'error', message: json.error });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Formatters
  const formatToman = (val?: number) => {
    if (val === undefined || val === null) return '۰ تومان';
    const abs = Math.abs(val).toLocaleString('fa-IR');
    if (val < 0) return `(${abs}) تومان`;
    return `${abs} تومان`;
  };

  const formatGrams = (val?: number) => {
    if (val === undefined || val === null) return '۰.۰۰۰ گرم';
    const abs = Math.abs(val).toLocaleString('fa-IR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
    if (val < 0) return `(${abs}) گرم`;
    return `${abs} گرم`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Notification Toast */}
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
              <AlertCircle className="w-4 h-4 text-[#FF6B6B]" />
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

      {/* Domain Top Header */}
      <div className="bg-[#181822] border border-[#2A2A3C] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-xl bg-[#C8A951]/20 border border-[#C8A951]/40 flex items-center justify-center">
                <Scale className="w-6 h-6 text-[#E5C365]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#EDEDED]">
                    تعهد مالی و دفتر دوگانه طلا و پول (K15)
                  </h1>
                  <span className="bg-[#C8A951]/20 text-[#E5C365] px-2 py-0.5 rounded text-[11px] font-mono font-bold border border-[#C8A951]/30">
                    DUAL SUBLEDGERS
                  </span>
                  <span className="bg-[#3DD68C]/20 text-[#3DD68C] px-2 py-0.5 rounded text-[11px] font-bold">
                    هسته فعال عملیاتی
                  </span>
                </div>
                <p className="text-xs text-[#9E9EA8] mt-1">
                  سامانه مدیریت دفاتر معین مجزای وزنی (طلا با عیار ۷۵۰) و پولی (تومان)، تراز متوازن دوگانه، تحلیل سررسید تعهدات و تهاتر مطالبات
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Price Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14141E] border border-[#2B2B3E]">
              <span className="text-[11px] text-[#868698]">مظنه مبنای ارزیابی طلا:</span>
              <span className="text-xs font-mono font-bold text-[#E5C365]">
                {data ? Number(data.referenceGoldPriceToman).toLocaleString('fa-IR') : '—'} تومان/گرم
              </span>
              <button
                onClick={() => {
                  setCustomPriceInput(data?.referenceGoldPriceToman.toString() || '4250000');
                  setIsPriceModalOpen(true);
                }}
                className="text-[10px] text-[#C8A951] hover:underline cursor-pointer mr-1"
                title="ویرایش نرخ مبنای تسویه و تهاتر"
              >
                (تغییر)
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => handleOpenNetting()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E2538] hover:bg-[#253048] text-[#70A5FF] border border-[#3E5280] text-xs font-semibold cursor-pointer transition-colors shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>عملیات تهاتر طلا / ریال</span>
            </button>

            <button
              onClick={() => {
                setNewVoucherForm({
                  partyId: data?.partyBalances[0]?.partyId || '',
                  voucherType: 'gold_melted_settlement',
                  titleFa: '',
                  descriptionFa: '',
                  referenceDocNumber: '',
                  goldDebitGrams: '',
                  goldCreditGrams: '',
                  goldCarat: 750,
                  fiatDebitToman: '',
                  fiatCreditToman: '',
                  registeredBy: 'کاربر سیستم حسابداری دوگانه'
                });
                setIsNewVoucherModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D6B75E] text-[#141416] text-xs font-bold cursor-pointer transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت سند دوگانه جدید</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl bg-[#1E1E2C] border border-[#2E2E42] text-[#9E9EA8] hover:text-[#EDEDED] cursor-pointer disabled:opacity-50"
              title="بارگذاری مجدد اطلاعات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C8A951]' : ''}`} />
            </button>
          </div>
        </div>

        {/* 6 High-Impact Dual KPI Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 mt-6 pt-5 border-t border-[#262638]">
            {/* KPI 1: Gold Receivable */}
            <div className="p-3.5 rounded-xl bg-[#13131D] border border-[#28283C] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#868698]">مطالبات وزنی طلا</span>
                <Coins className="w-4 h-4 text-[#E5C365]" />
              </div>
              <div className="text-base font-bold font-mono text-[#E5C365]">
                {formatGrams(data.summaryMetrics.totalGoldReceivableGrams)}
              </div>
              <span className="text-[10px] text-[#7A7A8E] block">طلب وزنی ۱۸ عیار از خریداران</span>
            </div>

            {/* KPI 2: Gold Payable */}
            <div className="p-3.5 rounded-xl bg-[#13131D] border border-[#28283C] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#868698]">بدهی وزنی طلا</span>
                <Scale className="w-4 h-4 text-[#C8A951]" />
              </div>
              <div className="text-base font-bold font-mono text-[#EDEDED]">
                {formatGrams(data.summaryMetrics.totalGoldPayableGrams)}
              </div>
              <span className="text-[10px] text-[#7A7A8E] block">تعهد طلای خام به کارگاه‌ها</span>
            </div>

            {/* KPI 3: Fiat Receivable */}
            <div className="p-3.5 rounded-xl bg-[#13131D] border border-[#28283C] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#868698]">مطالبات نقدی ریالی</span>
                <DollarSign className="w-4 h-4 text-[#3DD68C]" />
              </div>
              <div className="text-base font-bold font-mono text-[#3DD68C]">
                {formatToman(data.summaryMetrics.totalFiatReceivableToman)}
              </div>
              <span className="text-[10px] text-[#7A7A8E] block">اجرت ساخت و مطالبات پولی</span>
            </div>

            {/* KPI 4: Fiat Payable */}
            <div className="p-3.5 rounded-xl bg-[#13131D] border border-[#28283C] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#868698]">بدهی نقدی ریالی</span>
                <DollarSign className="w-4 h-4 text-[#FF6B6B]" />
              </div>
              <div className="text-base font-bold font-mono text-[#EDEDED]">
                {formatToman(data.summaryMetrics.totalFiatPayableToman)}
              </div>
              <span className="text-[10px] text-[#7A7A8E] block">اجرت‌های پرداخت‌نشده به کارگاه</span>
            </div>

            {/* KPI 5: Net Valued Exposure */}
            <div className="p-3.5 rounded-xl bg-[#13131D] border border-[#28283C] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#868698]">خالص ارزش تعهدات</span>
                <TrendingUp className="w-4 h-4 text-[#70A5FF]" />
              </div>
              <div className="text-base font-bold font-mono text-[#70A5FF]">
                {formatToman(data.summaryMetrics.totalNetValuationToman)}
              </div>
              <span className="text-[10px] text-[#7A7A8E] block">با ارزش‌گذاری مظنه روز طلا</span>
            </div>

            {/* KPI 6: Trial Balance Balance Status */}
            <div className="p-3.5 rounded-xl bg-[#13131D] border border-[#28283C] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#868698]">تراز دفاتر دوگانه</span>
                <ShieldCheck className="w-4 h-4 text-[#3DD68C]" />
              </div>
              <div className="text-xs font-bold text-[#3DD68C] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>دفاتر کاملاً متوازن</span>
              </div>
              <span className="text-[10px] text-[#7A7A8E] block">
                {data.trialBalance.postedVouchersCount} سند قطعی ثبت‌شده
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#29293C] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('parties')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'parties'
              ? 'bg-[#C8A951] text-[#141416] shadow-sm font-bold'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1A1A26]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>تراز و مانده دوگانه طرف‌های تجاری</span>
          {data && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              activeTab === 'parties' ? 'bg-[#141416] text-[#C8A951]' : 'bg-[#242436] text-[#9E9EA8]'
            }`}>
              {data.partyBalances.length} حساب
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'vouchers'
              ? 'bg-[#C8A951] text-[#141416] shadow-sm font-bold'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1A1A26]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>اسناد روزنامه دفتر دوگانه</span>
          {data && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              activeTab === 'vouchers' ? 'bg-[#141416] text-[#C8A951]' : 'bg-[#242436] text-[#9E9EA8]'
            }`}>
              {data.recentVouchers.length} سند
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('trial_balance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'trial_balance'
              ? 'bg-[#C8A951] text-[#141416] shadow-sm font-bold'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1A1A26]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>تراز آزمایشی و مغایرت‌گیری دوگانه</span>
        </button>

        <button
          onClick={() => setActiveTab('netting')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'netting'
              ? 'bg-[#C8A951] text-[#141416] shadow-sm font-bold'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1A1A26]'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>ماشین‌حساب و صدور سند تهاتر</span>
        </button>

        <button
          onClick={() => setActiveTab('bridge')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'bridge'
              ? 'bg-[#C8A951] text-[#141416] shadow-sm font-bold'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1A1A26]'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>سرویس واسط K14 (ثبت خودکار اسناد)</span>
          <span className="bg-[#3DD68C]/20 text-[#3DD68C] px-1.5 py-0.5 rounded text-[10px] font-bold">
            اتصال هوشمند
          </span>
        </button>
      </div>

      {/* TAB 1: Party Account Balances */}
      {activeTab === 'parties' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="جستجو بر اساس نام طرف حساب، کد معین یا شناسه ملی..."
                  value={partySearch}
                  onChange={(e) => setPartySearch(e.target.value)}
                  className="w-full bg-[#181824] border border-[#2A2A3E] rounded-xl pr-9 pl-3 py-2 text-xs text-[#EDEDED] placeholder-[#7A7A8E] focus:border-[#C8A951] outline-none"
                />
                <Search className="w-4 h-4 text-[#7A7A8E] absolute right-3 top-2.5" />
              </div>

              <select
                value={partyStatusFilter}
                onChange={(e) => setPartyStatusFilter(e.target.value)}
                className="bg-[#181824] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
              >
                <option value="all">همه وضعیت‌های حساب</option>
                <option value="normal">مانده عادی در مهلت تسویه</option>
                <option value="overdue">دارای تعهد معوق</option>
                <option value="due_soon">سررسید نزدیک</option>
                <option value="clear">تسویه کامل (بی‌حساب)</option>
              </select>
            </div>

            <div className="text-xs text-[#8A8A9E] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C8A951]" />
              <span>پایش بلادرنگ سررسید و راس‌گیری وزنی و پولی</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#181824] border border-[#2A2A3E] rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#252536] text-[#868698] bg-[#14141E]">
                    <th className="py-3 px-3">طرف حساب و کد معین</th>
                    <th className="py-3 px-3">نوع حساب</th>
                    <th className="py-3 px-3">معین وزنی طلا (عیار ۷۵۰)</th>
                    <th className="py-3 px-3">معین پولی ریالی</th>
                    <th className="py-3 px-3">ارزش روز تعهد (تومان)</th>
                    <th className="py-3 px-3">تحلیل سررسید (Aging)</th>
                    <th className="py-3 px-3">وضعیت حساب</th>
                    <th className="py-3 px-3">آخرین تراکنش</th>
                    <th className="py-3 px-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222230]">
                  {data?.partyBalances
                    .filter((p) => {
                      if (partyStatusFilter !== 'all' && p.status !== partyStatusFilter) return false;
                      if (!partySearch) return true;
                      const s = partySearch.toLowerCase();
                      return (
                        p.partyNameFa.toLowerCase().includes(s) ||
                        p.nationalId.includes(s) ||
                        p.zarrinSubledgerCode.toLowerCase().includes(s)
                      );
                    })
                    .map((p) => {
                      const isGoldDebtor = p.goldBalanceGrams750 > 0;
                      const isGoldCreditor = p.goldBalanceGrams750 < 0;
                      const isFiatDebtor = p.fiatBalanceToman > 0;
                      const isFiatCreditor = p.fiatBalanceToman < 0;

                      return (
                        <tr key={p.id} className="hover:bg-[#1C1C2A] transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-bold text-[#EDEDED] block">{p.partyNameFa}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#7A7A8E] font-mono mt-0.5">
                              <span>کد زرین: {p.zarrinSubledgerCode}</span>
                              <span>•</span>
                              <span>شناسه: {p.nationalId}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#242436] text-[#A6A6BC]">
                              {p.accountTypeFa}
                            </span>
                          </td>

                          {/* Gold Weight Subledger Balance */}
                          <td className="py-3 px-3 font-mono">
                            <div className="space-y-0.5">
                              <span className={`font-bold block ${
                                isGoldDebtor
                                  ? 'text-[#E5C365]'
                                  : isGoldCreditor
                                  ? 'text-[#3DD68C]'
                                  : 'text-[#8E8EA0]'
                              }`}>
                                {formatGrams(p.goldBalanceGrams750)}
                              </span>
                              <span className="text-[10px] text-[#7A7A8E]">
                                {isGoldDebtor
                                  ? 'بدهکار طلا (باید تحویل دهد)'
                                  : isGoldCreditor
                                  ? 'بستانکار طلا (مازاد تحویلی)'
                                  : 'تراز وزنی صفر'}
                              </span>
                            </div>
                          </td>

                          {/* Fiat Subledger Balance */}
                          <td className="py-3 px-3 font-mono">
                            <div className="space-y-0.5">
                              <span className={`font-bold block ${
                                isFiatDebtor
                                  ? 'text-[#EDEDED]'
                                  : isFiatCreditor
                                  ? 'text-[#3DD68C]'
                                  : 'text-[#8E8EA0]'
                              }`}>
                                {formatToman(p.fiatBalanceToman)}
                              </span>
                              <span className="text-[10px] text-[#7A7A8E]">
                                {isFiatDebtor
                                  ? 'بدهکار ریالی (اجرت/فاکتور)'
                                  : isFiatCreditor
                                  ? 'بستانکار ریالی'
                                  : 'تراز ریالی صفر'}
                              </span>
                            </div>
                          </td>

                          {/* Total Valuation */}
                          <td className="py-3 px-3 font-mono font-bold text-[#70A5FF]">
                            {formatToman(p.totalObligationValuationToman)}
                          </td>

                          {/* Aging */}
                          <td className="py-3 px-3">
                            {p.aging.weightedAverageDueDays > 0 ? (
                              <div className="space-y-0.5 text-[10px]">
                                <span className="text-[#FF8B8B] font-bold block">
                                  راس سررسید: {p.aging.weightedAverageDueDays} روز معوق
                                </span>
                                {p.aging.oldestOverdueDateFa && (
                                  <span className="text-[#7A7A8E]">قدیمی‌ترین: {p.aging.oldestOverdueDateFa}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-[#3DD68C] font-medium">سررسید جاری و منظم</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'clear'
                                ? 'bg-[#3DD68C]/15 text-[#3DD68C]'
                                : p.status === 'overdue' || p.status === 'critical'
                                ? 'bg-[#FF6B6B]/15 text-[#FF8B8B] border border-[#FF6B6B]/30'
                                : p.status === 'due_soon'
                                ? 'bg-[#E5A84B]/15 text-[#E5C365]'
                                : 'bg-[#2A2A3E] text-[#EDEDED]'
                            }`}>
                              {p.statusFa}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-mono text-[11px] text-[#8E8EA0]">
                            {p.lastTransactionDateFa}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenStatement(p)}
                                className="px-2.5 py-1 rounded-lg bg-[#242436] hover:bg-[#2F2F44] text-[#EDEDED] text-[11px] font-medium transition-colors cursor-pointer"
                                title="مشاهده گردش حساب معین دوگانه"
                              >
                                گردش حساب
                              </button>

                              <button
                                onClick={() => handleOpenNetting(p)}
                                className="px-2 py-1 rounded-lg bg-[#1E2E24] hover:bg-[#283C30] text-[#3DD68C] border border-[#2E7D4E]/50 text-[11px] font-medium transition-colors cursor-pointer"
                                title="تهاتر و تبدیل مانده طلا و ریال"
                              >
                                تهاتر
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
        </div>
      )}

      {/* TAB 2: Dual Journal Vouchers */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="جستجو در شماره سند، نام طرف حساب یا شرح..."
                  value={voucherSearch}
                  onChange={(e) => setVoucherSearch(e.target.value)}
                  className="w-full bg-[#181824] border border-[#2A2A3E] rounded-xl pr-9 pl-3 py-2 text-xs text-[#EDEDED] placeholder-[#7A7A8E] focus:border-[#C8A951] outline-none"
                />
                <Search className="w-4 h-4 text-[#7A7A8E] absolute right-3 top-2.5" />
              </div>

              <select
                value={voucherTypeFilter}
                onChange={(e) => setVoucherTypeFilter(e.target.value)}
                className="bg-[#181824] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
              >
                <option value="all">همه انواع اسناد</option>
                <option value="invoice_dispatch">تحویل کالای فاکتور رسمی (K13)</option>
                <option value="gold_melted_settlement">تسویه طلای آبشده فیزیکی</option>
                <option value="fiat_bank_transfer">واریز نقدی بانکی (ساتنا/پایا)</option>
                <option value="netting_conversion">سند تهاتر و تبدیل مانده</option>
                <option value="scrap_gold_return">رسید طلای کهنه / داغی</option>
              </select>
            </div>

            <span className="text-xs text-[#8A8A9E]">
              کلیه اسناد مطابق اصل حسابداری دوبل و چهار ستونی طلا و پول ثبت قطعی شده‌اند.
            </span>
          </div>

          {/* Vouchers Table */}
          <div className="bg-[#181824] border border-[#2A2A3E] rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#252536] text-[#868698] bg-[#14141E]">
                    <th className="py-3 px-3">شماره و تاریخ سند</th>
                    <th className="py-3 px-3">طرف حساب</th>
                    <th className="py-3 px-3">نوع سند و شرح آرتیکل</th>
                    <th className="py-3 px-3">مدرک مثبته / منبع</th>
                    <th className="py-3 px-3 text-center bg-[#1B1B15] text-[#E5C365]">بدهکار طلا (گرم ۷۵۰)</th>
                    <th className="py-3 px-3 text-center bg-[#1B1B15] text-[#E5C365]">بستانکار طلا (گرم ۷۵۰)</th>
                    <th className="py-3 px-3 text-center bg-[#161B16] text-[#3DD68C]">بدهکار ریال (تومان)</th>
                    <th className="py-3 px-3 text-center bg-[#161B16] text-[#3DD68C]">بستانکار ریال (تومان)</th>
                    <th className="py-3 px-3">مانده خطی حساب</th>
                    <th className="py-3 px-3">وضعیت و عطف زرین</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222230]">
                  {data?.recentVouchers
                    .filter((v) => {
                      if (voucherTypeFilter !== 'all' && v.voucherType !== voucherTypeFilter) return false;
                      if (!voucherSearch) return true;
                      const s = voucherSearch.toLowerCase();
                      return (
                        v.voucherNumber.toLowerCase().includes(s) ||
                        v.partyNameFa.toLowerCase().includes(s) ||
                        v.descriptionFa.toLowerCase().includes(s) ||
                        v.referenceDocNumber?.toLowerCase().includes(s)
                      );
                    })
                    .map((v) => (
                      <tr key={v.id} className="hover:bg-[#1C1C2A] transition-colors">
                        <td className="py-3 px-3 font-mono">
                          <span className="font-bold text-[#EDEDED] block">{v.voucherNumber}</span>
                          <span className="text-[10px] text-[#7A7A8E]">{v.voucherDateFa}</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium text-[#EDEDED] block">{v.partyNameFa}</span>
                          <span className="text-[10px] text-[#7A7A8E] font-mono">{v.partyId}</span>
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#242436] text-[#A6A6BC] mb-1">
                            {v.voucherTypeFa}
                          </span>
                          <p className="text-xs text-[#D0D0DC] leading-relaxed line-clamp-2">
                            {v.descriptionFa}
                          </p>
                        </td>

                        <td className="py-3 px-3 font-mono">
                          <span className="text-[#C8A951] font-bold block">
                            {v.referenceDocNumber || '—'}
                          </span>
                          <span className="text-[10px] text-[#7A7A8E]">
                            دامنه مبدأ: {v.sourceKernel}
                          </span>
                        </td>

                        {/* Gold Debit */}
                        <td className="py-3 px-3 font-mono font-bold text-center text-[#E5C365] bg-[#161612]">
                          {v.goldDebitGrams > 0 ? formatGrams(v.goldDebitGrams) : '—'}
                        </td>

                        {/* Gold Credit */}
                        <td className="py-3 px-3 font-mono font-bold text-center text-[#E5C365] bg-[#161612]">
                          {v.goldCreditGrams > 0 ? formatGrams(v.goldCreditGrams) : '—'}
                        </td>

                        {/* Fiat Debit */}
                        <td className="py-3 px-3 font-mono font-bold text-center text-[#EDEDED] bg-[#121612]">
                          {v.fiatDebitToman > 0 ? formatToman(v.fiatDebitToman) : '—'}
                        </td>

                        {/* Fiat Credit */}
                        <td className="py-3 px-3 font-mono font-bold text-center text-[#3DD68C] bg-[#121612]">
                          {v.fiatCreditToman > 0 ? formatToman(v.fiatCreditToman) : '—'}
                        </td>

                        {/* Running Balance */}
                        <td className="py-3 px-3 font-mono text-[11px]">
                          <div className="space-y-0.5">
                            <span className="text-[#E5C365] block">{formatGrams(v.runningGoldBalanceGrams)}</span>
                            <span className="text-[#EDEDED] block">{formatToman(v.runningFiatBalanceToman)}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 font-mono">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
                            <CheckCircle2 className="w-3 h-3 text-[#3DD68C]" />
                            <span>{v.statusFa}</span>
                          </span>
                          {v.zarrinVoucherRef && (
                            <span className="block text-[9px] text-[#7A7A8E] mt-0.5">
                              {v.zarrinVoucherRef}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Dual Trial Balance & Reconciliation */}
      {activeTab === 'trial_balance' && data && (
        <div className="space-y-5">
          {/* Header Card */}
          <div className="bg-[#141A16] border border-[#2E7D4E]/50 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3DD68C]/20 border border-[#3DD68C]/40 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#3DD68C]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                    <span>تراز آزمایشی تفصیلی دفاتر معین دوگانه (Gold & Fiat Dual Trial Balance)</span>
                    <span className="bg-[#3DD68C]/20 text-[#3DD68C] px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      PERFECT ZERO-SUM PROOF
                    </span>
                  </h2>
                  <p className="text-xs text-[#8C9E90] mt-1 leading-relaxed">
                    این ترازنامه تضمین می‌کند که گردش اقلام وزنی طلا (عیار ۷۵۰) و گردش پولی (ریالی/تومانی) به طور مستقل دارای تعادل، ثبت سند دوبل بدون مفقودی و بدون مغایرت با کاردکس و دفترکل زرین هستند.
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-[#8C9E90] self-start sm:self-center">
                تاریخ استخراج تراز: {data.trialBalance.asOfDateFa}
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#243A2C]">
              {/* Gold Side */}
              <div className="bg-[#0F1410] border border-[#1E2B20] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                    <Coins className="w-4 h-4" />
                    <span>تراز وزنی طلا (معیار عیار ۷۵۰)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-[#E5C365]/15 text-[#E5C365] px-2 py-0.5 rounded">
                    GOLD LEDGER
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[#1A261C]">
                    <span className="text-[#868698]">مجموع گردش بدهکار طلا (Debits):</span>
                    <span className="text-[#E5C365] font-bold">{formatGrams(data.trialBalance.totalGoldDebitsGrams)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1A261C]">
                    <span className="text-[#868698]">مجموع گردش بستانکار طلا (Credits):</span>
                    <span className="text-[#E5C365] font-bold">{formatGrams(data.trialBalance.totalGoldCreditsGrams)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1A261C]">
                    <span className="text-[#EDEDED] font-medium">مانده خالص وزنی طلا:</span>
                    <span className="text-[#3DD68C] font-bold">{formatGrams(data.trialBalance.netGoldBalanceGrams)}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2">
                    <span className="text-[#868698]">وضعیت تراز وزنی:</span>
                    <span className="text-[#3DD68C] font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>۱۰۰٪ متوازن و منطبق با خزانه‌داری K09</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Fiat Side */}
              <div className="bg-[#0F1410] border border-[#1E2B20] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3DD68C] flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    <span>تراز پولی ریالی (تومان)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-[#3DD68C]/15 text-[#3DD68C] px-2 py-0.5 rounded">
                    FIAT LEDGER
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[#1A261C]">
                    <span className="text-[#868698]">مجموع گردش بدهکار ریال (Debits):</span>
                    <span className="text-[#EDEDED] font-bold">{formatToman(data.trialBalance.totalFiatDebitsToman)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1A261C]">
                    <span className="text-[#868698]">مجموع گردش بستانکار ریال (Credits):</span>
                    <span className="text-[#EDEDED] font-bold">{formatToman(data.trialBalance.totalFiatCreditsToman)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1A261C]">
                    <span className="text-[#EDEDED] font-medium">مانده خالص مطالبات نقدی:</span>
                    <span className="text-[#3DD68C] font-bold">{formatToman(data.trialBalance.netFiatBalanceToman)}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2">
                    <span className="text-[#868698]">وضعیت تراز پولی:</span>
                    <span className="text-[#3DD68C] font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>۱۰۰٪ تطبیق با اسناد حسابداری زرین K16</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Trial Balance Sheet by Account */}
          <div className="bg-[#181824] border border-[#2A2A3E] rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-[#252536] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#EDEDED] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C8A951]" />
                <span>کاربرگ تراز آزمایشی ۸ ستونی دفاتر معین طرف‌های حساب</span>
              </h3>
              <span className="text-xs text-[#8A8A9E]">واحدها: گرم طلای عیار ۷۵۰ / تومان وجه نقد</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#252536] text-[#868698] bg-[#14141E]">
                    <th className="py-3 px-3" rowSpan={2}>کد معین و طرف حساب</th>
                    <th className="py-2 px-3 text-center border-b border-[#252536] bg-[#1A1A14] text-[#E5C365]" colSpan={2}>گردش وزنی طلا</th>
                    <th className="py-2 px-3 text-center border-b border-[#252536] bg-[#1A1A14] text-[#E5C365]">مانده وزنی</th>
                    <th className="py-2 px-3 text-center border-b border-[#252536] bg-[#141A14] text-[#3DD68C]" colSpan={2}>گردش پولی ریالی</th>
                    <th className="py-2 px-3 text-center border-b border-[#252536] bg-[#141A14] text-[#3DD68C]">مانده ریالی</th>
                    <th className="py-3 px-3 text-center" rowSpan={2}>موقعیت خالص</th>
                  </tr>
                  <tr className="border-b border-[#252536] text-[10px] text-[#7A7A8E] bg-[#161622]">
                    <th className="py-1 px-2 text-center text-[#E5C365]">بدهکار (گرم)</th>
                    <th className="py-1 px-2 text-center text-[#E5C365]">بستانکار (گرم)</th>
                    <th className="py-1 px-2 text-center text-[#E5C365]">مانده (گرم)</th>
                    <th className="py-1 px-2 text-center text-[#3DD68C]">بدهکار (تومان)</th>
                    <th className="py-1 px-2 text-center text-[#3DD68C]">بستانکار (تومان)</th>
                    <th className="py-1 px-2 text-center text-[#3DD68C]">مانده (تومان)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222230]">
                  {data.partyBalances.map((p) => (
                    <tr key={p.id} className="hover:bg-[#1C1C2A] transition-colors font-mono">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-[#EDEDED] font-sans block">{p.partyNameFa}</span>
                        <span className="text-[10px] text-[#7A7A8E]">{p.zarrinSubledgerCode}</span>
                      </td>

                      {/* Gold Turnover & Balance */}
                      <td className="py-2.5 px-2 text-center text-[#E5C365]">
                        {p.goldDebitTotalGrams.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#E5C365]">
                        {p.goldCreditTotalGrams.toFixed(3)}
                      </td>
                      <td className={`py-2.5 px-2 text-center font-bold ${
                        p.goldBalanceGrams750 > 0 ? 'text-[#E5C365]' : p.goldBalanceGrams750 < 0 ? 'text-[#3DD68C]' : 'text-[#8E8EA0]'
                      }`}>
                        {p.goldBalanceGrams750.toFixed(3)}
                      </td>

                      {/* Fiat Turnover & Balance */}
                      <td className="py-2.5 px-2 text-center text-[#EDEDED]">
                        {p.fiatDebitTotalToman.toLocaleString('fa-IR')}
                      </td>
                      <td className="py-2.5 px-2 text-center text-[#EDEDED]">
                        {p.fiatCreditTotalToman.toLocaleString('fa-IR')}
                      </td>
                      <td className={`py-2.5 px-2 text-center font-bold ${
                        p.fiatBalanceToman > 0 ? 'text-[#EDEDED]' : p.fiatBalanceToman < 0 ? 'text-[#3DD68C]' : 'text-[#8E8EA0]'
                      }`}>
                        {p.fiatBalanceToman.toLocaleString('fa-IR')}
                      </td>

                      {/* Net Valuation */}
                      <td className="py-2.5 px-3 text-center font-bold text-[#70A5FF]">
                        {formatToman(p.totalObligationValuationToman)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#12121A] font-mono font-bold text-xs border-t-2 border-[#383850]">
                    <td className="py-3 px-3 font-sans text-[#EDEDED]">جمع کل تراز آزمایشی</td>
                    <td className="py-3 px-2 text-center text-[#E5C365]">
                      {data.trialBalance.totalGoldDebitsGrams.toFixed(3)}
                    </td>
                    <td className="py-3 px-2 text-center text-[#E5C365]">
                      {data.trialBalance.totalGoldCreditsGrams.toFixed(3)}
                    </td>
                    <td className="py-3 px-2 text-center text-[#3DD68C]">
                      {data.trialBalance.netGoldBalanceGrams.toFixed(3)}
                    </td>
                    <td className="py-3 px-2 text-center text-[#EDEDED]">
                      {data.trialBalance.totalFiatDebitsToman.toLocaleString('fa-IR')}
                    </td>
                    <td className="py-3 px-2 text-center text-[#EDEDED]">
                      {data.trialBalance.totalFiatCreditsToman.toLocaleString('fa-IR')}
                    </td>
                    <td className="py-3 px-2 text-center text-[#3DD68C]">
                      {data.trialBalance.netFiatBalanceToman.toLocaleString('fa-IR')}
                    </td>
                    <td className="py-3 px-3 text-center text-[#70A5FF]">
                      {formatToman(data.trialBalance.totalValuedExposureToman)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Netting & Settlement Engine */}
      {activeTab === 'netting' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Netting Simulator Form */}
            <div className="lg:col-span-2 bg-[#181824] border border-[#2A2A3E] rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#70A5FF]/20 border border-[#70A5FF]/40 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-[#70A5FF]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#EDEDED]">
                    موتور محاسباتی و صدور سند تهاتر و تبدیل دوگانه طلا ↔ پول
                  </h2>
                  <p className="text-xs text-[#8A8A9E]">
                    تبدیل بدهی ریالی به معادل وزنی طلای ۱۸ عیار، یا برعکس، جهت صفرسازی مانده‌های سررسیدشده
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#8A8A9E] mb-1.5 block">انتخاب طرف حساب:</label>
                  <select
                    value={nettingForm.partyId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const p = data?.partyBalances?.find((item) => item.partyId === id);
                      setNettingForm((prev) => ({
                        ...prev,
                        partyId: id,
                        amount: p && p.fiatBalanceToman > 0 ? p.fiatBalanceToman.toString() : (p && p.goldBalanceGrams750 > 0 ? p.goldBalanceGrams750.toString() : '')
                      }));
                    }}
                    className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                  >
                    {data?.partyBalances?.map((p) => (
                      <option key={p.partyId} value={p.partyId}>
                        {p.partyNameFa} ({p.zarrinSubledgerCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#8A8A9E] mb-1.5 block">جهت عملیات تهاتر:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNettingForm((prev) => ({ ...prev, direction: 'fiat_to_gold' }))}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        nettingForm.direction === 'fiat_to_gold'
                          ? 'bg-[#E5C365] text-[#141416] font-bold shadow-sm'
                          : 'bg-[#14141E] text-[#868698] hover:bg-[#20202E]'
                      }`}
                    >
                      تبدیل ریال به طلا
                    </button>
                    <button
                      type="button"
                      onClick={() => setNettingForm((prev) => ({ ...prev, direction: 'gold_to_fiat' }))}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        nettingForm.direction === 'gold_to_fiat'
                          ? 'bg-[#3DD68C] text-[#141416] font-bold shadow-sm'
                          : 'bg-[#14141E] text-[#868698] hover:bg-[#20202E]'
                      }`}
                    >
                      تبدیل طلا به ریال
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#8A8A9E] mb-1.5 block">
                    {nettingForm.direction === 'fiat_to_gold' ? 'مبلغ بدهی ریالی جهت تهاتر (تومان):' : 'وزن طلای ۱۸ عیار جهت تهاتر (گرم):'}
                  </label>
                  <input
                    type="number"
                    value={nettingForm.amount}
                    onChange={(e) => setNettingForm((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder={nettingForm.direction === 'fiat_to_gold' ? 'مثلاً ۲۵۰,۰۰۰,۰۰۰' : 'مثلاً ۵۰.۰۰۰'}
                    className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#8A8A9E] mb-1.5 block">نرخ مظنه طلای ۱۸ عیار (تومان/گرم):</label>
                  <input
                    type="number"
                    value={nettingForm.goldPriceToman}
                    onChange={(e) => setNettingForm((prev) => ({ ...prev, goldPriceToman: Number(e.target.value) }))}
                    className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#E5C365] font-mono font-bold focus:border-[#C8A951] outline-none"
                  />
                </div>
              </div>

              {/* Simulation Output Card */}
              {nettingForm.amount && Number(nettingForm.amount) > 0 && (
                <div className="bg-[#12121A] border border-[#252536] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8E8EA0]">نتیجه محاسباتی تهاتر:</span>
                    <span className="text-[#70A5FF] font-mono font-bold">
                      {nettingForm.direction === 'fiat_to_gold'
                        ? `معادل وزنی طلا: ${(Number(nettingForm.amount) / nettingForm.goldPriceToman).toFixed(3)} گرم طلا ۱۸ عیار`
                        : `معادل پولی ریالی: ${(Number(nettingForm.amount) * nettingForm.goldPriceToman).toLocaleString('fa-IR')} تومان`}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#A0A0B4] leading-relaxed">
                    با تایید این عملیات، یک سند حسابداری دوگانه صادر شده و در معین زرین ثبت می‌شود. مانده پولی
                    طرف حساب کاهش و مانده وزنی وی متناسب با مظنه روز افزایش خواهد یافت.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteNetting}
                  className="px-6 py-2.5 rounded-xl bg-[#C8A951] hover:bg-[#D6B75E] text-[#141416] text-xs font-bold cursor-pointer transition-colors shadow-md flex items-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>صدور قطعی سند تهاتر در دفتر دوگانه</span>
                </button>
              </div>
            </div>

            {/* Selected Party Quick Insight */}
            {data && (
              <div className="bg-[#181824] border border-[#2A2A3E] rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-[#EDEDED] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C8A951]" />
                  <span>وضعیت جاری طرف حساب انتخابی</span>
                </h3>

                {(() => {
                  const p = data.partyBalances.find((item) => item.partyId === nettingForm.partyId) || data.partyBalances[0];
                  if (!p) return null;

                  return (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#14141E] border border-[#222232] space-y-1">
                        <span className="text-[11px] text-[#868698]">نام بازرگانی:</span>
                        <span className="font-bold text-[#EDEDED] block">{p.partyNameFa}</span>
                        <span className="text-[10px] text-[#7A7A8E] font-mono">شناسه: {p.nationalId}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#14141E] border border-[#222232] space-y-1">
                        <span className="text-[11px] text-[#868698]">مانده وزنی طلا:</span>
                        <span className="text-sm font-bold font-mono text-[#E5C365] block">
                          {formatGrams(p.goldBalanceGrams750)}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#14141E] border border-[#222232] space-y-1">
                        <span className="text-[11px] text-[#868698]">مانده پولی ریالی:</span>
                        <span className="text-sm font-bold font-mono text-[#3DD68C] block">
                          {formatToman(p.fiatBalanceToman)}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#14141E] border border-[#222232] space-y-1">
                        <span className="text-[11px] text-[#868698]">کل ارزش روز تعهد:</span>
                        <span className="text-sm font-bold font-mono text-[#70A5FF] block">
                          {formatToman(p.totalObligationValuationToman)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: K14 to K15 Intermediary Bridge View */}
      {activeTab === 'bridge' && (
        <K14K15BridgeView onVoucherCreated={loadData} />
      )}

      {/* DRAWER: Detailed Party Statement */}
      {statementParty && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-[#161622] border-r border-[#2C2C40] w-full max-w-3xl h-full overflow-y-auto p-6 space-y-5 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#262638]">
              <div>
                <h2 className="text-base font-bold text-[#EDEDED] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#C8A951]" />
                  <span>صورت‌حساب گردش دفتر معین دوگانه طلا و پول</span>
                </h2>
                <p className="text-xs text-[#8A8A9E] mt-0.5">
                  {statementParty.partyNameFa} ({statementParty.zarrinSubledgerCode})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-[#202030] hover:bg-[#2A2A40] text-[#C8A951] transition-colors cursor-pointer"
                  title="چاپ صورت‌حساب رسمی"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStatementParty(null)}
                  className="p-2 rounded-xl bg-[#202030] hover:bg-[#2A2A40] text-[#9E9EA8] hover:text-[#EDEDED] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Balances Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#12121A] border border-[#222232] text-center">
                <span className="text-[10px] text-[#7A7A8E] block">مانده وزنی طلا ۱۸ عیار</span>
                <span className="text-sm font-bold font-mono text-[#E5C365]">
                  {formatGrams(statementParty.goldBalanceGrams750)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#12121A] border border-[#222232] text-center">
                <span className="text-[10px] text-[#7A7A8E] block">مانده پولی ریالی</span>
                <span className="text-sm font-bold font-mono text-[#3DD68C]">
                  {formatToman(statementParty.fiatBalanceToman)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#12121A] border border-[#222232] text-center">
                <span className="text-[10px] text-[#7A7A8E] block">ارزش روز کل تعهد</span>
                <span className="text-sm font-bold font-mono text-[#70A5FF]">
                  {formatToman(statementParty.totalObligationValuationToman)}
                </span>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#EDEDED] block">ریز گردش اسناد معین:</span>

              <div className="bg-[#12121A] border border-[#252536] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#252536] text-[#868698] bg-[#0E0E16]">
                        <th className="py-2.5 px-3">سند / تاریخ</th>
                        <th className="py-2.5 px-3">شرح آرتیکل</th>
                        <th className="py-2.5 px-2 text-center text-[#E5C365]">بدهکار طلا</th>
                        <th className="py-2.5 px-2 text-center text-[#E5C365]">بستانکار طلا</th>
                        <th className="py-2.5 px-2 text-center text-[#3DD68C]">بدهکار ریال</th>
                        <th className="py-2.5 px-2 text-center text-[#3DD68C]">بستانکار ریال</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1D1D2B]">
                      {statementVouchers.map((v) => (
                        <tr key={v.id} className="hover:bg-[#181824] transition-colors font-mono">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-[#EDEDED] block">{v.voucherNumber}</span>
                            <span className="text-[10px] text-[#7A7A8E]">{v.voucherDateFa}</span>
                          </td>
                          <td className="py-2.5 px-3 font-sans max-w-xs text-[#C8C8DC]">
                            {v.descriptionFa}
                          </td>
                          <td className="py-2.5 px-2 text-center text-[#E5C365]">
                            {v.goldDebitGrams > 0 ? v.goldDebitGrams.toFixed(3) : '—'}
                          </td>
                          <td className="py-2.5 px-2 text-center text-[#E5C365]">
                            {v.goldCreditGrams > 0 ? v.goldCreditGrams.toFixed(3) : '—'}
                          </td>
                          <td className="py-2.5 px-2 text-center text-[#EDEDED]">
                            {v.fiatDebitToman > 0 ? v.fiatDebitToman.toLocaleString('fa-IR') : '—'}
                          </td>
                          <td className="py-2.5 px-2 text-center text-[#3DD68C]">
                            {v.fiatCreditToman > 0 ? v.fiatCreditToman.toLocaleString('fa-IR') : '—'}
                          </td>
                        </tr>
                      ))}

                      {statementVouchers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#7A7A8E]">
                            تراکنشی برای این طرف حساب ثبت نشده است.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: New Dual Voucher */}
      {isNewVoucherModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181824] border border-[#2A2A3E] rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#262638]">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#C8A951]" />
                <h2 className="text-sm font-bold text-[#EDEDED]">ثبت سند جدید در دفتر معین دوگانه طلا و پول</h2>
              </div>
              <button
                onClick={() => setIsNewVoucherModalOpen(false)}
                className="text-[#8E8EA0] hover:text-[#EDEDED] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8A8A9E] mb-1 block">طرف حساب:</label>
                <select
                  value={newVoucherForm.partyId}
                  onChange={(e) => setNewVoucherForm({ ...newVoucherForm, partyId: e.target.value })}
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                >
                  {data?.partyBalances?.map((p) => (
                    <option key={p.partyId} value={p.partyId}>
                      {p.partyNameFa} ({p.zarrinSubledgerCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#8A8A9E] mb-1 block">نوع رویداد مالی / سند:</label>
                <select
                  value={newVoucherForm.voucherType}
                  onChange={(e) => setNewVoucherForm({ ...newVoucherForm, voucherType: e.target.value as DualVoucherType })}
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                >
                  <option value="gold_melted_settlement">تسویه طلای آبشده فیزیکی (دریافت طلا)</option>
                  <option value="fiat_bank_transfer">واریز نقدی بانکی (ساتنا / پایا)</option>
                  <option value="wage_fee_charge">هزینه اجرت ساخت و متعلقات</option>
                  <option value="scrap_gold_return">رسید طلای کهنه / داغی کارگاه</option>
                  <option value="assay_variance">تعدیل کسر/اضافه عیار ری‌گیری</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-[#8A8A9E] mb-1 block">عنوان سند:</label>
                <input
                  type="text"
                  value={newVoucherForm.titleFa}
                  onChange={(e) => setNewVoucherForm({ ...newVoucherForm, titleFa: e.target.value })}
                  placeholder="مثلاً: دریافت طلای آبشده به شماره انگ ۳۸۴۲ جهت تسویه فاکتور"
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#8A8A9E] mb-1 block">شماره مدرک مثبته / حواله:</label>
                <input
                  type="text"
                  value={newVoucherForm.referenceDocNumber}
                  onChange={(e) => setNewVoucherForm({ ...newVoucherForm, referenceDocNumber: e.target.value })}
                  placeholder="مثلاً REC-GLD-1403-512 یا PAY-SATNA-8812"
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#8A8A9E] mb-1 block">عیار طلا:</label>
                <select
                  value={newVoucherForm.goldCarat}
                  onChange={(e) => setNewVoucherForm({ ...newVoucherForm, goldCarat: Number(e.target.value) })}
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                >
                  <option value={750}>عیار ۷۵۰ (۱۸ عیار استاندارد)</option>
                  <option value={995}>عیار ۹۹۵ (شمش ۲۴ عیار)</option>
                  <option value={740}>عیار ۷۴۰ (طلای متفرقه / کهنه)</option>
                </select>
              </div>

              {/* Gold Debit / Credit */}
              <div>
                <label className="text-xs text-[#E5C365] mb-1 block">بدهکار طلا (گرم):</label>
                <input
                  type="number"
                  step="0.001"
                  value={newVoucherForm.goldDebitGrams}
                  onChange={(e) => setNewVoucherForm({ ...newVoucherForm, goldDebitGrams: e.target.value })}
                  placeholder="0.000"
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#E5C365] font-mono focus:border-[#C8A951] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#E5C365] mb-1 block">بستانکار طلا (گرم):</label>
                <input
                  type="number"
                  step="0.001"
                  value={newVoucherForm.goldCreditGrams}
                  onChange={(e) => setNewVoucherForm({ ...newVoucherForm, goldCreditGrams: e.target.value })}
                  placeholder="0.000"
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#E5C365] font-mono focus:border-[#C8A951] outline-none"
                />
              </div>

              {/* Fiat Debit / Credit */}
              <div>
                <label className="text-xs text-[#3DD68C] mb-1 block">بدهکار ریال (تومان):</label>
                <input
                  type="number"
                  value={newVoucherForm.fiatDebitToman}
                  onChange={(e) => setNewVoucherForm({ ...newVoucherForm, fiatDebitToman: e.target.value })}
                  placeholder="0"
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#3DD68C] mb-1 block">بستانکار ریال (تومان):</label>
                <input
                  type="number"
                  value={newVoucherForm.fiatCreditToman}
                  onChange={(e) => setNewVoucherForm({ ...newVoucherForm, fiatCreditToman: e.target.value })}
                  placeholder="0"
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#3DD68C] font-mono focus:border-[#C8A951] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-[#8A8A9E] mb-1 block">شرح تفصیلی سند:</label>
                <textarea
                  rows={2}
                  value={newVoucherForm.descriptionFa}
                  onChange={(e) => setNewVoucherForm({ ...newVoucherForm, descriptionFa: e.target.value })}
                  placeholder="توضیحات و مشخصات عیار، شماره انگ، فاکتور متناظر و شرایط تسویه..."
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#262638] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewVoucherModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#202030] text-[#9E9EA8] hover:text-[#EDEDED] text-xs cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleCreateVoucher}
                className="px-5 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D6B75E] text-[#141416] text-xs font-bold cursor-pointer transition-colors shadow-md"
              >
                ثبت قطعی در دفتر معین
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Netting Execution Modal */}
      {isNettingModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181824] border border-[#2A2A3E] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#262638]">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-[#C8A951]" />
                <h2 className="text-sm font-bold text-[#EDEDED]">عملیات تهاتر و تسویه دوگانه</h2>
              </div>
              <button
                onClick={() => setIsNettingModalOpen(false)}
                className="text-[#8E8EA0] hover:text-[#EDEDED] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#8A8A9E] mb-1 block">طرف حساب:</label>
                <select
                  value={nettingForm.partyId}
                  onChange={(e) => setNettingForm({ ...nettingForm, partyId: e.target.value })}
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                >
                  {data?.partyBalances?.map((p) => (
                    <option key={p.partyId} value={p.partyId}>
                      {p.partyNameFa} ({p.zarrinSubledgerCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#8A8A9E] mb-1 block">جهت تهاتر:</label>
                <select
                  value={nettingForm.direction}
                  onChange={(e) => setNettingForm({ ...nettingForm, direction: e.target.value as any })}
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                >
                  <option value="fiat_to_gold">تبدیل بدهی ریالی به معادل وزنی طلا</option>
                  <option value="gold_to_fiat">تبدیل تعهد طلا به معادل پولی ریالی</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#8A8A9E] mb-1 block">
                  {nettingForm.direction === 'fiat_to_gold' ? 'مبلغ ریالی (تومان):' : 'وزن طلا (گرم ۷۵۰):'}
                </label>
                <input
                  type="number"
                  value={nettingForm.amount}
                  onChange={(e) => setNettingForm({ ...nettingForm, amount: e.target.value })}
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#8A8A9E] mb-1 block">نرخ مظنه مبنا (تومان/گرم):</label>
                <input
                  type="number"
                  value={nettingForm.goldPriceToman}
                  onChange={(e) => setNettingForm({ ...nettingForm, goldPriceToman: Number(e.target.value) })}
                  className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-xs text-[#E5C365] font-mono focus:border-[#C8A951] outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#262638] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNettingModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#202030] text-[#9E9EA8] hover:text-[#EDEDED] text-xs cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleExecuteNetting}
                className="px-5 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D6B75E] text-[#141416] text-xs font-bold cursor-pointer transition-colors shadow-md"
              >
                ثبت و اجرای تهاتر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Update Gold Price */}
      {isPriceModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181824] border border-[#2A2A3E] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#262638]">
              <h2 className="text-sm font-bold text-[#EDEDED]">تغییر نرخ مبنای طلا ۱۸ عیار</h2>
              <button
                onClick={() => setIsPriceModalOpen(false)}
                className="text-[#8E8EA0] hover:text-[#EDEDED] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-[#8A8A9E] mb-1.5 block">نرخ تومان به ازای هر گرم:</label>
              <input
                type="number"
                value={customPriceInput}
                onChange={(e) => setCustomPriceInput(e.target.value)}
                placeholder="4250000"
                className="w-full bg-[#14141E] border border-[#2A2A3E] rounded-xl px-3 py-2 text-sm text-[#E5C365] font-mono font-bold focus:border-[#C8A951] outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPriceModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[#202030] text-[#9E9EA8] hover:text-[#EDEDED] text-xs cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleUpdatePrice}
                className="px-4 py-1.5 rounded-xl bg-[#C8A951] hover:bg-[#D6B75E] text-[#141416] text-xs font-bold cursor-pointer transition-colors"
              >
                ذخیره نرخ جدید
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
