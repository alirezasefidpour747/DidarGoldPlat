/**
 * Didar Gold Platform - Kernel Domain K11 Dashboard
 * Retailer Lifecycle & Commercial Access (چرخه خرده‌فروش و دسترسی تجاری)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Store,
  Award,
  ShieldCheck,
  Scale,
  Coins,
  MapPin,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Sliders,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  Retailer,
  K11DataPayload,
  CommercialTier,
  RetailerLifecycleStatus,
  RetailerTerritory,
  RetailerAllowedBasket
} from '../../types/k11.js';
import { api } from '../../lib/api.js';
import { NewRetailerModal } from './NewRetailerModal.js';
import { TierAdjustmentModal } from './TierAdjustmentModal.js';
import { TerritoryAssignmentModal } from './TerritoryAssignmentModal.js';
import { BasketPolicyModal } from './BasketPolicyModal.js';
import { SuspensionModal } from './SuspensionModal.js';
import { RetailerDetailDrawer } from './RetailerDetailDrawer.js';

export const K11Dashboard: React.FC = () => {
  const [data, setData] = useState<K11DataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Main View Tab
  const [activeTab, setActiveTab] = useState<'retailers' | 'territories' | 'risk_matrix'>('retailers');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // Modals & Drawer State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedRetailerForDrawer, setSelectedRetailerForDrawer] = useState<Retailer | null>(null);
  const [selectedRetailerForTier, setSelectedRetailerForTier] = useState<Retailer | null>(null);
  const [selectedRetailerForTerritory, setSelectedRetailerForTerritory] = useState<Retailer | null>(null);
  const [selectedRetailerForBasket, setSelectedRetailerForBasket] = useState<Retailer | null>(null);
  const [selectedRetailerForSuspension, setSelectedRetailerForSuspension] = useState<Retailer | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = await api.getK11Data();
      setData(payload);
    } catch (err: any) {
      console.error('Error fetching K11 data:', err);
      setError(err.message || 'خطا در بارگذاری داده‌های K11');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for Modals
  const handleCreateRetailer = async (retailerPayload: Partial<Retailer>) => {
    await api.createRetailer(retailerPayload);
    showNotification('success', `پرونده خرده‌فروشی برای "${retailerPayload.tradeNameFa}" با موفقیت ثبت شد.`);
    await loadData();
  };

  const handleUpdateTier = async (retailerId: string, tierUpdates: any) => {
    await api.updateRetailerTier(retailerId, tierUpdates);
    showNotification('success', 'رتبه تجاری و سقف‌های اعتباری با موفقیت به‌روزرسانی شد.');
    await loadData();
    if (selectedRetailerForDrawer?.id === retailerId) {
      const updated = data?.retailers.find(r => r.id === retailerId);
      if (updated) setSelectedRetailerForDrawer(updated);
    }
  };

  const handleUpdateTerritory = async (retailerId: string, territoryUpdates: Partial<RetailerTerritory>) => {
    await api.updateRetailerTerritory(retailerId, territoryUpdates);
    showNotification('success', 'قلمرو بازار و ویزیتور مسئول با موفقیت به‌روزرسانی شد.');
    await loadData();
    if (selectedRetailerForDrawer?.id === retailerId) {
      const updated = data?.retailers.find(r => r.id === retailerId);
      if (updated) setSelectedRetailerForDrawer(updated);
    }
  };

  const handleUpdateBasket = async (retailerId: string, basketUpdates: Partial<RetailerAllowedBasket>) => {
    await api.updateRetailerBasket(retailerId, basketUpdates);
    showNotification('success', 'سیاست سبد مجاز، عیارها و طلای امانی با موفقیت ذخیره شد.');
    await loadData();
    if (selectedRetailerForDrawer?.id === retailerId) {
      const updated = data?.retailers.find(r => r.id === retailerId);
      if (updated) setSelectedRetailerForDrawer(updated);
    }
  };

  const handleStatusChange = async (retailerId: string, status: RetailerLifecycleStatus, reasonFa: string) => {
    await api.changeRetailerStatus(retailerId, status, reasonFa);
    showNotification('success', 'وضعیت چرخه عمر خرده‌فروش تغییر یافت و در پرونده ثبت گردید.');
    await loadData();
    if (selectedRetailerForDrawer?.id === retailerId) {
      const updated = data?.retailers.find(r => r.id === retailerId);
      if (updated) setSelectedRetailerForDrawer(updated);
    }
  };

  const handleAddException = async (retailerId: string, exceptionData: any) => {
    await api.addRetailerException(retailerId, exceptionData);
    showNotification('success', 'استثنای اعتباری موقت با موفقیت صادر و فعال گردید.');
    await loadData();
    if (selectedRetailerForDrawer?.id === retailerId) {
      const updated = data?.retailers.find(r => r.id === retailerId);
      if (updated) setSelectedRetailerForDrawer(updated);
    }
  };

  // Filtered Retailers
  const filteredRetailers = useMemo(() => {
    if (!data) return [];
    return data.retailers.filter((r) => {
      const matchesSearch =
        searchTerm === '' ||
        r.tradeNameFa.includes(searchTerm) ||
        r.ownerFullNameFa.includes(searchTerm) ||
        r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.unionLicenseNumber.includes(searchTerm) ||
        r.cityFa.includes(searchTerm);

      const matchesTier = selectedTier === 'all' || r.commercialTerms.tier === selectedTier;
      const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
      const matchesRegion = selectedRegion === 'all' || r.territory.regionCode === selectedRegion;

      return matchesSearch && matchesTier && matchesStatus && matchesRegion;
    });
  }, [data, searchTerm, selectedTier, selectedStatus, selectedRegion]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-[#C8A951] animate-spin" />
        <p className="text-sm font-semibold text-[#A0A0B5]">در حال فراخوانی اطلاعات حوزه K11 (چرخه خرده‌فروشان و دسترسی تجاری)...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 rounded-2xl bg-[#161622] border border-[#E5484D]/30 text-center space-y-4 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-[#E5484D] mx-auto" />
        <h3 className="text-base font-bold text-white">خطا در اتصال به سرویس K11</h3>
        <p className="text-xs text-[#A0A0B5]">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-[#C8A951] text-[#141416] text-xs font-bold hover:bg-[#D9B961] transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-right" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in slide-in-from-top-4 duration-200 bg-[#191924] border-[#C8A951] text-[#E5C365]">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#3DD68C]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#E5484D]" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#151520] border border-[#262636] relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#C8A951]/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#C8A951]/15 border border-[#C8A951]/40 flex items-center justify-center text-[#E5C365] shadow-lg shadow-[#C8A951]/10">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40">
                DOMAIN K11
              </span>
              <h1 className="text-xl font-black text-white">
                چرخه خرده‌فروش و دسترسی تجاری
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                فعال و عملیاتی
              </span>
            </div>
            <p className="text-xs text-[#A0A0B5] mt-1 max-w-2xl leading-relaxed">
              حکمرانی رتبه‌بندی اعتباری (الماس، پلاتین، طلایی)، تعیین حدود سقف طلای ۱۸ عیار و ریالی، قلمرو بازارچه‌ها، تنظیم سبد مجاز و نظارت بر تسویه
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={loadData}
            title="به‌روزرسانی اطلاعات"
            className="p-2.5 rounded-xl border border-[#28283C] bg-[#191926] text-[#A0A0B5] hover:text-white hover:bg-[#252538] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C8A951]' : ''}`} />
          </button>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#C8A951] text-[#141416] hover:bg-[#D9B961] text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#C8A951]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>پذیرش گالری جدید</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Retailers Card */}
          <div className="p-4 rounded-2xl bg-[#161622] border border-[#28283C] space-y-2 shadow-md">
            <div className="flex items-center justify-between text-[#A0A0B5]">
              <span className="text-xs font-semibold">گالری‌های عضو پلتفرم</span>
              <div className="w-7 h-7 rounded-lg bg-[#C8A951]/10 text-[#E5C365] flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {summary.totalRetailersCount.toLocaleString('fa-IR')}
              </span>
              <span className="text-xs text-[#9E9EA8]">فروشگاه طلا</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold pt-1 border-t border-[#222230]">
              <span className="text-[#3DD68C]">{summary.activeTradingCount.toLocaleString('fa-IR')} فعال</span>
              <span className="text-[#6E6E82]">•</span>
              <span className="text-[#FF9500]">{summary.probationaryCount.toLocaleString('fa-IR')} آزمایشی</span>
              <span className="text-[#6E6E82]">•</span>
              <span className="text-[#E5484D]">{summary.creditSuspendedCount.toLocaleString('fa-IR')} معلق</span>
            </div>
          </div>

          {/* Gold Credit Limit Card */}
          <div className="p-4 rounded-2xl bg-[#161622] border border-[#28283C] space-y-2 shadow-md">
            <div className="flex items-center justify-between text-[#A0A0B5]">
              <span className="text-xs font-semibold">سقف اعتبار وزنی طلا</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#E5C365] font-mono">
                {(summary.totalActiveGoldCreditGrams / 1000).toLocaleString('fa-IR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-[#9E9EA8]">کیلوگرم طلای ۷۵۰</span>
            </div>
            <div className="text-[11px] text-[#A0A0B5] pt-1 border-t border-[#222230]">
              مصرف‌شده:{' '}
              <span className="text-white font-mono font-semibold">
                {(summary.totalUsedGoldCreditGrams / 1000).toLocaleString('fa-IR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} کیلو
              </span>{' '}
              <span className="text-[#E5C365]">
                ({Math.round((summary.totalUsedGoldCreditGrams / (summary.totalActiveGoldCreditGrams || 1)) * 100).toLocaleString('fa-IR')}٪)
              </span>
            </div>
          </div>

          {/* Toman Credit Exposure */}
          <div className="p-4 rounded-2xl bg-[#161622] border border-[#28283C] space-y-2 shadow-md">
            <div className="flex items-center justify-between text-[#A0A0B5]">
              <span className="text-xs font-semibold">سقف اعتبار ریالی صنف</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#3DD68C] font-mono">
                {(summary.totalActiveCreditLimitToman / 1000000000).toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-xs text-[#9E9EA8]">میلیارد تومان</span>
            </div>
            <div className="text-[11px] text-[#A0A0B5] pt-1 border-t border-[#222230]">
              مصرف‌شده:{' '}
              <span className="text-white font-mono font-semibold">
                {(summary.totalUsedCreditToman / 1000000000).toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} همت
              </span>{' '}
              <span className="text-[#3DD68C]">
                ({Math.round((summary.totalUsedCreditToman / (summary.totalActiveCreditLimitToman || 1)) * 100).toLocaleString('fa-IR')}٪)
              </span>
            </div>
          </div>

          {/* Trust Score Card */}
          <div className="p-4 rounded-2xl bg-[#161622] border border-[#28283C] space-y-2 shadow-md">
            <div className="flex items-center justify-between text-[#A0A0B5]">
              <span className="text-xs font-semibold">میانگین شاخص اعتماد</span>
              <div className="w-7 h-7 rounded-lg bg-[#C8A951]/10 text-[#E5C365] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {summary.averageTrustScore.toLocaleString('fa-IR')}
              </span>
              <span className="text-xs text-[#9E9EA8]">از ۱۰۰ امتیاز</span>
            </div>
            <div className="w-full bg-[#12121A] h-2 rounded-full overflow-hidden border border-[#28283C] mt-1">
              <div
                className="bg-gradient-to-r from-[#C8A951] to-[#E5C365] h-full rounded-full"
                style={{ width: `${summary.averageTrustScore}%` }}
              />
            </div>
          </div>

          {/* Annual Gold Turnover (YTD) */}
          <div className="p-4 rounded-2xl bg-[#161622] border border-[#28283C] space-y-2 shadow-md">
            <div className="flex items-center justify-between text-[#A0A0B5]">
              <span className="text-xs font-semibold">گردش طلای سال جاری (YTD)</span>
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {(summary.totalYtdGoldPurchasedGrams / 1000).toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-xs text-[#9E9EA8]">کیلوگرم طلا</span>
            </div>
            <div className="text-[11px] text-[#A0A0B5] pt-1 border-t border-[#222230]">
              ارزش فاکتور:{' '}
              <span className="text-white font-mono font-semibold">
                {(summary.totalYtdTurnoverToman / 1000000000).toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} م.ت
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#28283C] pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('retailers')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'retailers'
              ? 'bg-[#C8A951] text-[#141416] font-bold shadow-md shadow-[#C8A951]/20'
              : 'text-[#9E9EA8] hover:text-white hover:bg-[#1C1C28]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>فهرست جامع گالری‌ها و شرایط تجاری ({filteredRetailers.length.toLocaleString('fa-IR')})</span>
        </button>

        <button
          onClick={() => setActiveTab('territories')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'territories'
              ? 'bg-[#C8A951] text-[#141416] font-bold shadow-md shadow-[#C8A951]/20'
              : 'text-[#9E9EA8] hover:text-white hover:bg-[#1C1C28]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>قلمروهای بازاری و پورتفولیوی ویزیتورها ({(data?.territoryList.length || 0).toLocaleString('fa-IR')})</span>
        </button>

        <button
          onClick={() => setActiveTab('risk_matrix')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'risk_matrix'
              ? 'bg-[#C8A951] text-[#141416] font-bold shadow-md shadow-[#C8A951]/20'
              : 'text-[#9E9EA8] hover:text-white hover:bg-[#1C1C28]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>ماتریس رتبه‌بندی اعتباری و تسهیلات تسویه</span>
        </button>
      </div>

      {/* Tab 1: Retailers Table */}
      {activeTab === 'retailers' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-[#161622] border border-[#28283C] flex flex-col lg:flex-row items-center justify-between gap-3 shadow-md">
            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو با نام گالری، مالک، شهر یا پروانه کسب..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-xs text-white placeholder-[#8E8E9F] focus:border-[#C8A951] focus:outline-none transition-colors"
              />
              <Search className="w-4 h-4 text-[#A0A0B5] absolute right-3.5 top-3" />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Tier Filter */}
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-xs text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
              >
                <option value="all">همه رتبه‌ها</option>
                <option value="diamond">الماس (Diamond)</option>
                <option value="platinum">پلاتین (Platinum)</option>
                <option value="gold">طلایی (Gold)</option>
                <option value="silver">نقره‌ای (Silver)</option>
                <option value="bronze">برنزی (Bronze)</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-xs text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="active_trading">فعال تجاری</option>
                <option value="probationary">آزمایشی</option>
                <option value="under_review">تحت بازنگری</option>
                <option value="credit_suspended">تعلیق اعتباری</option>
                <option value="inactive">غیرفعال</option>
              </select>

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-xs text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
              >
                <option value="all">همه مناطق</option>
                <option value="TEH">تهران</option>
                <option value="ISF">اصفهان</option>
                <option value="MSH">مشهد</option>
                <option value="TBZ">تبریز</option>
                <option value="SHZ">شیراز</option>
                <option value="AHV">اهواز</option>
              </select>

              {(searchTerm || selectedTier !== 'all' || selectedStatus !== 'all' || selectedRegion !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedTier('all');
                    setSelectedStatus('all');
                    setSelectedRegion('all');
                  }}
                  className="px-3 py-2.5 text-xs font-semibold text-[#A0A0B5] hover:text-[#C8A951] transition-colors"
                >
                  پاکسازی فیلترها
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-[#161622] border border-[#28283C] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#28283C] bg-[#12121A] text-[#A0A0B5]">
                    <th className="py-3.5 px-4 font-bold">شناسه و نام گالری</th>
                    <th className="py-3.5 px-4 font-bold">مالک و پروانه کسب</th>
                    <th className="py-3.5 px-4 font-bold">رتبه و اعتماد</th>
                    <th className="py-3.5 px-4 font-bold">سقف اعتبار طلا / ریال</th>
                    <th className="py-3.5 px-4 font-bold">قلمرو و ویزیتور</th>
                    <th className="py-3.5 px-4 font-bold">مهلت و تسویه</th>
                    <th className="py-3.5 px-4 font-bold">وضعیت</th>
                    <th className="py-3.5 px-4 font-bold text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222230]">
                  {filteredRetailers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#A0A0B5]">
                        هیچ گالری طلافروشی با شرایط فیلتر انتخاب‌شده یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    filteredRetailers.map((r) => {
                      const goldUsedPercent = r.commercialTerms.creditLimitGoldGrams > 0
                        ? Math.min(100, Math.round((r.commercialTerms.currentUsedCreditGoldGrams / r.commercialTerms.creditLimitGoldGrams) * 100))
                        : 0;

                      return (
                        <tr
                          key={r.id}
                          className="hover:bg-[#1C1C2A] transition-colors group cursor-pointer"
                          onClick={() => setSelectedRetailerForDrawer(r)}
                        >
                          {/* Name & Code */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white group-hover:text-[#E5C365] transition-colors flex items-center gap-2">
                              <span>{r.tradeNameFa}</span>
                            </div>
                            <div className="text-[11px] font-mono text-[#9E9EA8] mt-0.5">
                              {r.code}
                            </div>
                          </td>

                          {/* Owner & License */}
                          <td className="py-3.5 px-4">
                            <div className="text-[#EDEDED] font-semibold">{r.ownerFullNameFa}</div>
                            <div className="text-[11px] text-[#9E9EA8] font-mono mt-0.5">
                              پروانه: {r.unionLicenseNumber}
                            </div>
                          </td>

                          {/* Tier & Trust Score */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                r.commercialTerms.tier === 'diamond'
                                  ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#E5C365]'
                                  : r.commercialTerms.tier === 'platinum'
                                  ? 'bg-slate-300/20 border-slate-300 text-slate-100'
                                  : r.commercialTerms.tier === 'gold'
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                  : r.commercialTerms.tier === 'silver'
                                  ? 'bg-zinc-500/25 border-zinc-400 text-zinc-200'
                                  : 'bg-amber-900/30 border-amber-700 text-amber-200'
                              }`}>
                                {r.commercialTerms.tierFa.split(' ')[0]}
                              </span>
                              <span className="font-mono text-[11px] text-[#A0A0B5] font-semibold">
                                ({r.commercialTerms.trustScore.toLocaleString('fa-IR')}/۱۰۰)
                              </span>
                            </div>
                            {r.commercialTerms.wageDiscountPercent > 0 && (
                              <div className="text-[10px] text-[#3DD68C] mt-0.5 font-semibold">
                                {r.commercialTerms.wageDiscountPercent.toLocaleString('fa-IR')}٪ تخفیف اجرت
                              </div>
                            )}
                          </td>

                          {/* Limits & Exposure */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-[#E5C365] font-semibold">
                              {r.commercialTerms.creditLimitGoldGrams.toLocaleString('fa-IR')} گرم طلا
                            </div>
                            <div className="text-[11px] text-[#A0A0B5] font-mono mt-0.5">
                              {(r.commercialTerms.creditLimitToman / 10000000).toLocaleString('fa-IR')} م.ت
                            </div>
                            <div className="w-24 bg-[#12121A] h-1.5 rounded-full mt-1.5 overflow-hidden border border-[#28283C]">
                              <div
                                className={`h-full ${goldUsedPercent > 80 ? 'bg-[#E5484D]' : 'bg-[#C8A951]'}`}
                                style={{ width: `${goldUsedPercent}%` }}
                              />
                            </div>
                          </td>

                          {/* Territory & Agent */}
                          <td className="py-3.5 px-4">
                            <div className="text-[#EDEDED] font-semibold">{r.territory.marketDistrictFa}</div>
                            <div className="text-[11px] text-[#A0A0B5] mt-0.5">
                              عامل: {r.territory.assignedAgentNameFa.replace('مهندس ', '')}
                            </div>
                          </td>

                          {/* Payment Tenor */}
                          <td className="py-3.5 px-4">
                            <div className="text-[#EDEDED] font-semibold">
                              {r.commercialTerms.paymentTenorDays === 0 ? 'نقد لحظه‌ای' : `${r.commercialTerms.paymentTenorDays.toLocaleString('fa-IR')} روزه`}
                            </div>
                            <div className="text-[11px] text-[#A0A0B5] mt-0.5">
                              {r.commercialTerms.allowScrapGoldBarter ? 'تهاتر آبشده' : 'فقط نقد'}
                            </div>
                          </td>

                          {/* Lifecycle Status */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                              r.status === 'active_trading'
                                ? 'bg-[#3DD68C]/15 border-[#3DD68C]/40 text-[#3DD68C]'
                                : r.status === 'probationary'
                                ? 'bg-[#FF9500]/15 border-[#FF9500]/40 text-[#FF9500]'
                                : r.status === 'credit_suspended'
                                ? 'bg-[#E5484D]/15 border-[#E5484D]/40 text-[#E5484D]'
                                : 'bg-[#8E8E93]/15 border-[#8E8E93]/40 text-[#EDEDED]'
                            }`}>
                              {r.status === 'active_trading' ? 'فعال معامله' : r.status === 'credit_suspended' ? 'معلق اعتباری' : r.status === 'probationary' ? 'آزمایشی' : 'تحت بازنگری'}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedRetailerForTier(r)}
                                title="تنظیم رتبه و حدود اعتباری"
                                className="p-1.5 rounded-lg text-[#A0A0B5] hover:text-[#C8A951] hover:bg-[#252538] border border-transparent hover:border-[#35354C] transition-colors"
                              >
                                <Award className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedRetailerForTerritory(r)}
                                title="قلمرو و ویزیتور میدانی"
                                className="p-1.5 rounded-lg text-[#A0A0B5] hover:text-[#3DD68C] hover:bg-[#252538] border border-transparent hover:border-[#35354C] transition-colors"
                              >
                                <MapPin className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedRetailerForBasket(r)}
                                title="تنظیم سبد مجاز و طلای امانی"
                                className="p-1.5 rounded-lg text-[#A0A0B5] hover:text-sky-400 hover:bg-[#252538] border border-transparent hover:border-[#35354C] transition-colors"
                              >
                                <Sliders className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedRetailerForSuspension(r)}
                                title="تعلیق تجاری یا استثنا"
                                className="p-1.5 rounded-lg text-[#A0A0B5] hover:text-[#E5484D] hover:bg-[#252538] border border-transparent hover:border-[#35354C] transition-colors"
                              >
                                <AlertTriangle className="w-4 h-4" />
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
        </div>
      )}

      {/* Tab 2: Territory & Agent Portfolios */}
      {activeTab === 'territories' && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.territoryList.map((t) => (
            <div key={t.regionCode} className="p-5 rounded-2xl bg-[#161622] border border-[#28283C] space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#C8A951]/10 border border-[#C8A951]/30 flex items-center justify-center text-[#E5C365]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{t.regionTitleFa}</h3>
                    <span className="text-[11px] text-[#A0A0B5] font-mono">{t.regionCode}</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#12121A] border border-[#28283C] text-[#E5C365]">
                  {t.activeRetailersCount.toLocaleString('fa-IR')} گالری
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[#A0A0B5] block">راسته‌های تحت پوشش:</span>
                  <p className="text-[#EDEDED] mt-0.5 leading-relaxed">{t.marketDistrictFa}</p>
                </div>
                <div className="pt-2 border-t border-[#222230] flex items-center justify-between">
                  <span className="text-[#A0A0B5]">ویزیتور ارشد منطقه:</span>
                  <span className="font-semibold text-[#3DD68C]">{t.assignedAgentNameFa}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Risk & Exposure Matrix */}
      {activeTab === 'risk_matrix' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#161622] border border-[#28283C] space-y-4 shadow-md">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#C8A951]" />
              ماتریس سطوح اعتباری و تسهیلات بازرگانی صنف طلا در دیدار
            </h3>
            <p className="text-xs text-[#A0A0B5] leading-relaxed">
              سیاست‌گذاری یکپارچه اعطای حدود وزنی طلا، پذیرش طلای متفرقه و تخفیفات اجرت ساخت بر اساس امتیاز اعتماد و رفتار تجاری
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
              {[
                {
                  tierFa: 'الماس (Diamond)',
                  creditGold: 'تا ۱.۵ کیلوگرم طلا',
                  creditToman: 'تا ۱۲ میلیارد تومان',
                  tenor: '۴۵ روزه',
                  discount: '۳.۰٪ تخفیف اجرت',
                  bullion: 'مجاز کامل',
                  consign: 'تا ۱ کیلوگرم امانی',
                  color: 'border-[#C8A951] text-[#E5C365] bg-[#C8A951]/10'
                },
                {
                  tierFa: 'پلاتین (Platinum)',
                  creditGold: 'تا ۱ کیلوگرم طلا',
                  creditToman: 'تا ۸.۵ میلیارد تومان',
                  tenor: '۳۰ روزه',
                  discount: '۲.۰٪ تخفیف اجرت',
                  bullion: 'با تایید کمیته',
                  consign: 'تا ۵۰۰ گرم امانی',
                  color: 'border-slate-300/40 text-slate-100 bg-slate-400/10'
                },
                {
                  tierFa: 'طلایی (Gold)',
                  creditGold: 'تا ۵۰۰ گرم طلا',
                  creditToman: 'تا ۴.۵ میلیارد تومان',
                  tenor: '۳۰ روزه',
                  discount: '۱.۲٪ تخفیف اجرت',
                  bullion: 'غیرمجاز',
                  consign: 'تا ۳۵۰ گرم امانی',
                  color: 'border-amber-400/40 text-amber-300 bg-amber-500/10'
                },
                {
                  tierFa: 'نقره‌ای (Silver)',
                  creditGold: 'تا ۲۰۰ گرم طلا',
                  creditToman: 'تا ۲ میلیارد تومان',
                  tenor: '۱۵ روزه',
                  discount: '۰.۵٪ تخفیف',
                  bullion: 'غیرمجاز',
                  consign: 'فاقد تسهیلات',
                  color: 'border-zinc-400/40 text-zinc-200 bg-zinc-500/10'
                },
                {
                  tierFa: 'برنزی / آزمایشی',
                  creditGold: '۵۰ گرم (فقط نقد)',
                  creditToman: '۵۰۰ میلیون تومان',
                  tenor: '۰ روزه (نقد فوری)',
                  discount: 'بدون تخفیف',
                  bullion: 'غیرمجاز',
                  consign: 'فاقد تسهیلات',
                  color: 'border-amber-700/50 text-amber-200 bg-amber-900/20'
                }
              ].map((m) => (
                <div key={m.tierFa} className={`p-4 rounded-xl border space-y-2.5 ${m.color}`}>
                  <div className="font-bold text-xs pb-1.5 border-b border-current/20">{m.tierFa}</div>
                  <div className="text-[11px] space-y-1">
                    <div><span className="opacity-75">سقف طلا:</span> <span className="font-bold">{m.creditGold}</span></div>
                    <div><span className="opacity-75">سقف ریال:</span> <span className="font-bold">{m.creditToman}</span></div>
                    <div><span className="opacity-75">مهلت تسویه:</span> <span className="font-bold">{m.tenor}</span></div>
                    <div><span className="opacity-75">تخفیف اجرت:</span> <span className="font-bold">{m.discount}</span></div>
                    <div><span className="opacity-75">شمش ۲۴:</span> <span>{m.bullion}</span></div>
                    <div><span className="opacity-75">طلای امانی:</span> <span>{m.consign}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawer */}
      <NewRetailerModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateRetailer}
        availableAgents={data?.availableAgents || []}
      />

      <TierAdjustmentModal
        isOpen={!!selectedRetailerForTier}
        retailer={selectedRetailerForTier}
        onClose={() => setSelectedRetailerForTier(null)}
        onSubmit={handleUpdateTier}
      />

      <TerritoryAssignmentModal
        isOpen={!!selectedRetailerForTerritory}
        retailer={selectedRetailerForTerritory}
        onClose={() => setSelectedRetailerForTerritory(null)}
        onSubmit={handleUpdateTerritory}
        availableAgents={data?.availableAgents || []}
      />

      <BasketPolicyModal
        isOpen={!!selectedRetailerForBasket}
        retailer={selectedRetailerForBasket}
        onClose={() => setSelectedRetailerForBasket(null)}
        onSubmit={handleUpdateBasket}
      />

      <SuspensionModal
        isOpen={!!selectedRetailerForSuspension}
        retailer={selectedRetailerForSuspension}
        onClose={() => setSelectedRetailerForSuspension(null)}
        onStatusChange={handleStatusChange}
        onAddException={handleAddException}
      />

      <RetailerDetailDrawer
        retailer={selectedRetailerForDrawer}
        onClose={() => setSelectedRetailerForDrawer(null)}
        onOpenTierModal={(r) => {
          setSelectedRetailerForDrawer(null);
          setSelectedRetailerForTier(r);
        }}
        onOpenTerritoryModal={(r) => {
          setSelectedRetailerForDrawer(null);
          setSelectedRetailerForTerritory(r);
        }}
        onOpenBasketModal={(r) => {
          setSelectedRetailerForDrawer(null);
          setSelectedRetailerForBasket(r);
        }}
        onOpenSuspensionModal={(r) => {
          setSelectedRetailerForDrawer(null);
          setSelectedRetailerForSuspension(r);
        }}
      />
    </div>
  );
};
