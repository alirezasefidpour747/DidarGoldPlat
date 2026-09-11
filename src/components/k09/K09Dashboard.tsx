/**
 * Didar Gold Platform - Kernel Domain K09 Dashboard
 * Inventory, Multi-Vault Locations, Physical Custody & Agent Field Bags
 */

import React, { useState, useEffect } from 'react';
import {
  K09DataPayload,
  VaultLocation,
  AgentBag,
  InventoryItem,
  StockTransfer,
  VaultAuditRecord
} from '../../types/k09.js';
import { api } from '../../lib/api.js';
import {
  Vault,
  Briefcase,
  Layers,
  ArrowRightLeft,
  ClipboardCheck,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  MapPin,
  Scale,
  Battery,
  Lock,
  Eye,
  Truck
} from 'lucide-react';
import { NewTransferModal } from './NewTransferModal.js';
import { TransferArrivalModal } from './TransferArrivalModal.js';
import { NewAgentBagModal } from './NewAgentBagModal.js';
import { VaultAuditModal } from './VaultAuditModal.js';
import { ItemDetailDrawer } from './ItemDetailDrawer.js';

type TabKey = 'vaults' | 'bags' | 'items' | 'transfers' | 'audits';

export const K09Dashboard: React.FC = () => {
  const [data, setData] = useState<K09DataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('vaults');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isBagModalOpen, setIsBagModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedTransferForArrival, setSelectedTransferForArrival] = useState<StockTransfer | null>(null);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<InventoryItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = await api.getK09Data();
      setData(payload);
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری داده‌های موجودی و خزانه‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTransfer = async (payload: Partial<StockTransfer>) => {
    await api.createStockTransfer(payload);
    await loadData();
  };

  const handleConfirmArrival = async (
    transferId: string,
    measuredWeightAtDestinationGrams: number,
    receiverOfficerName: string,
    notes?: string
  ) => {
    await api.confirmTransferArrival(transferId, measuredWeightAtDestinationGrams, receiverOfficerName, notes);
    await loadData();
  };

  const handleCreateBag = async (payload: Partial<AgentBag>) => {
    await api.createAgentBag(payload);
    await loadData();
  };

  const handleRecordAudit = async (payload: Partial<VaultAuditRecord>) => {
    await api.recordVaultAudit(payload);
    await loadData();
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-[#C8A951] animate-spin" />
        <span className="text-sm text-[#9E9EA8]">در حال اتصال به پایگاه اطلاعات خزانه‌ها و موجودی طلا...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 max-w-lg mx-auto my-12 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">خطا در برقراری ارتباط با هسته K09</h3>
        <p className="text-xs text-rose-300">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-[#C8A951] hover:bg-[#D8B961] text-[#14141A] font-bold rounded-xl text-xs"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const metrics = data?.metrics;
  const locations = data?.locations || [];
  const bags = data?.bags || [];
  const items = data?.items || [];
  const transfers = data?.transfers || [];
  const audits = data?.audits || [];

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.titleFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hallmarkCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryFa === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(items.map((i) => i.categoryFa)));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#161620] border border-[#262636] rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#C8A951] px-2 py-0.5 rounded bg-[#C8A951]/15 border border-[#C8A951]/30">
              هسته بنیادین K09
            </span>
            <span className="text-xs text-[#9E9EA8]">مدیریت زنجیره تأمین و لجستیک فیزیکی</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">موجودی شبکه طلا، خزانه‌ها، امانت و کیف‌های ویزیتور</h1>
          <p className="text-xs text-[#9E9EA8] mt-1">
            ردگیری مکان فیزیکی، خزانه‌های فوق‌امنیتی استانی، شوکیس‌های پرتابل و ثبت ترانزیت‌های تحت اسکورت
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D8B961] text-[#14141A] font-bold text-xs transition flex items-center gap-1.5 shadow-lg"
          >
            <ArrowRightLeft className="w-4 h-4" />
            صدور حواله انتقال
          </button>
          <button
            onClick={() => setIsBagModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] border border-[#353548] text-[#EDEDED] font-medium text-xs transition flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            کیف ویزیتور جدید
          </button>
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] border border-[#353548] text-[#EDEDED] font-medium text-xs transition flex items-center gap-1.5"
          >
            <ClipboardCheck className="w-4 h-4 text-purple-400" />
            انبارگردانی
          </button>
          <button
            onClick={loadData}
            title="بازخوانی داده‌ها"
            className="p-2 rounded-xl bg-[#1A1A24] border border-[#2D2D3E] text-[#9E9EA8] hover:text-white transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Gold */}
          <div className="p-4 rounded-2xl bg-[#161620] border border-[#262636] space-y-1">
            <span className="text-[11px] text-[#9E9EA8] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#C8A951]" />
              مجموع طلای تحت مدیریت
            </span>
            <p className="text-xl font-black text-white font-mono">
              {metrics.totalNetworkGoldGrams.toLocaleString('fa-IR')} <span className="text-xs font-normal text-[#9E9EA8]">گرم</span>
            </p>
            <span className="text-[10px] text-emerald-400">
              ارزش روز: {metrics.totalNetworkValueToman.toLocaleString('fa-IR')} ت
            </span>
          </div>

          {/* Central & Regional Vaults */}
          <div className="p-4 rounded-2xl bg-[#161620] border border-[#262636] space-y-1">
            <span className="text-[11px] text-[#9E9EA8] flex items-center gap-1.5">
              <Vault className="w-3.5 h-3.5 text-sky-400" />
              موجود در خزانه‌ها
            </span>
            <p className="text-xl font-black text-sky-400 font-mono">
              {metrics.vaultStoredGoldGrams.toLocaleString('fa-IR')} <span className="text-xs font-normal text-[#9E9EA8]">گرم</span>
            </p>
            <span className="text-[10px] text-[#9E9EA8]">
              در {metrics.totalVaultsCount} خزانه و گاوصندوق اصلی
            </span>
          </div>

          {/* Agent Bags */}
          <div className="p-4 rounded-2xl bg-[#161620] border border-[#262636] space-y-1">
            <span className="text-[11px] text-[#9E9EA8] flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              در کیف‌های ویزیتورها
            </span>
            <p className="text-xl font-black text-amber-400 font-mono">
              {metrics.agentBagsGoldGrams.toLocaleString('fa-IR')} <span className="text-xs font-normal text-[#9E9EA8]">گرم</span>
            </p>
            <span className="text-[10px] text-[#9E9EA8]">
              {metrics.totalActiveBagsCount} شوکیس فعال میدانی
            </span>
          </div>

          {/* In Transit */}
          <div className="p-4 rounded-2xl bg-[#161620] border border-[#262636] space-y-1">
            <span className="text-[11px] text-[#9E9EA8] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-purple-400" />
              در حال ترانزیت امنیتی
            </span>
            <p className="text-xl font-black text-purple-400 font-mono">
              {metrics.inTransitGoldGrams.toLocaleString('fa-IR')} <span className="text-xs font-normal text-[#9E9EA8]">گرم</span>
            </p>
            <span className="text-[10px] text-[#9E9EA8]">
              {metrics.pendingTransfersCount} محموله در مسیر
            </span>
          </div>

          {/* Audit Match Rate */}
          <div className="p-4 rounded-2xl bg-[#161620] border border-[#262636] space-y-1">
            <span className="text-[11px] text-[#9E9EA8] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              انطباق انبارگردانی
            </span>
            <p className="text-xl font-black text-emerald-400 font-mono">
              {metrics.inventoryAuditMatchRatePercent}٪
            </p>
            <span className="text-[10px] text-[#9E9EA8]">
              {metrics.totalInventoryPiecesCount.toLocaleString('fa-IR')} قطعه فیزیکی ثبت‌شده
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262636] pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('vaults')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            activeTab === 'vaults'
              ? 'bg-[#C8A951] text-[#14141A] font-bold shadow'
              : 'text-[#9E9EA8] hover:text-white hover:bg-[#1C1C28]'
          }`}
        >
          <Vault className="w-4 h-4" />
          <span>خزانه‌ها و انبارها ({locations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bags')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            activeTab === 'bags'
              ? 'bg-[#C8A951] text-[#14141A] font-bold shadow'
              : 'text-[#9E9EA8] hover:text-white hover:bg-[#1C1C28]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>کیف‌های ویزیتورها ({bags.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            activeTab === 'items'
              ? 'bg-[#C8A951] text-[#14141A] font-bold shadow'
              : 'text-[#9E9EA8] hover:text-white hover:bg-[#1C1C28]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>اقلام و قطعات فیزیکی ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            activeTab === 'transfers'
              ? 'bg-[#C8A951] text-[#14141A] font-bold shadow'
              : 'text-[#9E9EA8] hover:text-white hover:bg-[#1C1C28]'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>حواله‌های جابجایی و ترانزیت ({transfers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            activeTab === 'audits'
              ? 'bg-[#C8A951] text-[#14141A] font-bold shadow'
              : 'text-[#9E9EA8] hover:text-white hover:bg-[#1C1C28]'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>انبارگردانی و تطبیق تراز ({audits.length})</span>
        </button>
      </div>

      {/* Tab 1: Vault Locations */}
      {activeTab === 'vaults' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => {
            const usagePercent = Math.min(100, Math.round((loc.currentGoldWeightGrams / loc.totalCapacityGrams) * 100));

            return (
              <div
                key={loc.id}
                className="p-5 rounded-2xl bg-[#161620] border border-[#262636] hover:border-[#3E3E54] transition space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C8A951]/15 text-[#C8A951] border border-[#C8A951]/30">
                        {loc.code}
                      </span>
                      <span className="text-[11px] text-[#9E9EA8]">{loc.vaultTypeFa}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{loc.nameFa}</h3>
                    <p className="text-xs text-[#767688] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {loc.addressFa}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium shrink-0">
                    فعال و تحت پایش
                  </span>
                </div>

                {/* Storage Meter */}
                <div className="space-y-1.5 p-3 rounded-xl bg-[#121218] border border-[#222230]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9E9EA8]">موجودی طلای مستقر:</span>
                    <span className="text-[#EDEDED] font-bold font-mono">
                      {loc.currentGoldWeightGrams.toLocaleString('fa-IR')} / {loc.totalCapacityGrams.toLocaleString('fa-IR')} گرم
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1C1C28] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#C8A951] to-[#E5C365] rounded-full transition-all duration-500"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#767688]">
                    <span>تعداد قطعات: {loc.totalPiecesCount.toLocaleString('fa-IR')} عدد</span>
                    <span>{loc.compartmentsCount} زونکن امنیتی</span>
                    <span>ضریب اشغال: {usagePercent}٪</span>
                  </div>
                </div>

                {/* Custodian & Security Level */}
                <div className="space-y-1.5 text-xs text-[#B5B5C2]">
                  <div className="flex justify-between">
                    <span className="text-[#767688]">حفاظت امنیتی:</span>
                    <span className="text-[#EDEDED] font-medium">{loc.securityLevelFa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#767688]">امین و مدیر خزانه:</span>
                    <span className="text-amber-300 font-medium">{loc.custodianNameFa} ({loc.custodianPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#767688]">آخرین انبارگردانی رسمی:</span>
                    <span className="text-[#9E9EA8] font-mono">{loc.lastAuditDateFa}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Agent Field Bags */}
      {activeTab === 'bags' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bags.map((bag) => {
            const usagePercent = Math.min(100, Math.round((bag.currentWeightGrams / bag.maxWeightCapacityGrams) * 100));

            return (
              <div
                key={bag.id}
                className="p-5 rounded-2xl bg-[#161620] border border-[#262636] hover:border-[#3E3E54] transition space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {bag.bagCode}
                      </span>
                      <span className="text-xs text-[#9E9EA8]">{bag.securityBagSerial}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{bag.bagTitleFa}</h3>
                    <p className="text-xs text-[#767688]">{bag.assignedTerritoryFa}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 ${
                      bag.status === 'in_field'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : bag.status === 'in_transit'
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {bag.statusFa}
                  </span>
                </div>

                {/* Weight meter */}
                <div className="space-y-1.5 p-3 rounded-xl bg-[#121218] border border-[#222230]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9E9EA8]">وزن طلای داخل شوکیس:</span>
                    <span className="text-[#C8A951] font-bold font-mono">
                      {bag.currentWeightGrams.toLocaleString('fa-IR')} / {bag.maxWeightCapacityGrams.toLocaleString('fa-IR')} گرم
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1C1C28] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#C8A951] rounded-full transition-all duration-500"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#767688]">
                    <span>تعداد اقلام: {bag.piecesCount} عدد</span>
                    <span>ظرفیت پرشده: {usagePercent}٪</span>
                  </div>
                </div>

                {/* Agent & Telemetry */}
                <div className="space-y-1.5 text-xs text-[#B5B5C2]">
                  <div className="flex justify-between">
                    <span className="text-[#767688]">ویزیتور مسئول:</span>
                    <span className="text-[#EDEDED] font-bold">{bag.assignedAgentNameFa} ({bag.agentPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#767688]">باتری ردیاب GPS:</span>
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5" />
                      {bag.gpsBatteryPercent}٪
                    </span>
                  </div>
                  {bag.currentLocationLatLong && (
                    <div className="flex justify-between">
                      <span className="text-[#767688]">موقعیت زنده ماهواره‌ای:</span>
                      <span className="text-sky-300 font-mono text-[11px]">{bag.currentLocationLatLong}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#767688]">آخرین سیگنال دریافتی:</span>
                    <span className="text-[#9E9EA8] font-mono">{bag.lastPingTimestampFa}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Physical Inventory Items */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between p-4 bg-[#161620] border border-[#262636] rounded-2xl text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#767688] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو بر اساس شناسه UID، عنوان قطعه، کد انگ ری‌گیری..."
                className="w-full pr-9 pl-4 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[#9E9EA8] shrink-0">دسته‌بندی:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
              >
                <option value="all">تمام دسته‌ها</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-[#161620] border border-[#262636] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#262636] bg-[#12121A] text-[#9E9EA8]">
                    <th className="py-3 px-4">شناسه یکتا (UID)</th>
                    <th className="py-3 px-4">عنوان و مشخصات قطعه طلا</th>
                    <th className="py-3 px-4">کد انگ ری‌گری</th>
                    <th className="py-3 px-4 text-center">وزن دقیق (گرم)</th>
                    <th className="py-3 px-4 text-center">معادل طلای ۹۹۵</th>
                    <th className="py-3 px-4">محل استقرار فعلی</th>
                    <th className="py-3 px-4">وضعیت امانت</th>
                    <th className="py-3 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#20202E]">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1A1A26] transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#C8A951]">
                        {item.uid}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#EDEDED]">{item.titleFa}</div>
                        <div className="text-[11px] text-[#767688]">{item.categoryFa} | {item.karatFa}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-400">
                        {item.hallmarkCode}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-white">
                        {item.scaleWeightGrams}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-400">
                        {item.pureGold995EquivalentGrams}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#EDEDED] font-medium">{item.currentLocationNameFa}</div>
                        <div className="text-[10px] text-[#767688]">امین: {item.custodianOfficerNameFa}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 text-[11px]">
                          {item.custodyStatusFa}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedItemForDetail(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#222230] hover:bg-[#2E2E42] text-[#C8A951] transition flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>شناسنامه</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Stock Transfers */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="bg-[#161620] border border-[#262636] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#262636] bg-[#12121A] text-[#9E9EA8]">
                    <th className="py-3 px-4">شماره حواله</th>
                    <th className="py-3 px-4">مبدأ ارسال</th>
                    <th className="py-3 px-4">مقصد تحویل</th>
                    <th className="py-3 px-4 text-center">وزن طلا (گرم)</th>
                    <th className="py-3 px-4 text-center">تعداد قطعات</th>
                    <th className="py-3 px-4">مامور اسکورت و پلمپ</th>
                    <th className="py-3 px-4">وضعیت انتقال</th>
                    <th className="py-3 px-4 text-center">اقدام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#20202E]">
                  {transfers.map((trf) => (
                    <tr key={trf.id} className="hover:bg-[#1A1A26] transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#C8A951]">
                        {trf.transferNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#EDEDED]">{trf.sourceLocationNameFa}</div>
                        <div className="text-[11px] text-[#767688]">تحویل‌دهنده: {trf.dispatchedByOfficerNameFa}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#EDEDED]">{trf.destinationLocationNameFa}</div>
                        {trf.receivedByOfficerNameFa && (
                          <div className="text-[11px] text-emerald-400">تحویل‌گیرنده: {trf.receivedByOfficerNameFa}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-white">
                        {trf.totalWeightGrams.toLocaleString('fa-IR')}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[#9E9EA8]">
                        {trf.itemsCount}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#EDEDED]">{trf.courierOrEscortNameFa}</div>
                        <div className="text-[10px] font-mono text-sky-400">پلمپ: {trf.securitySealSerial}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                            trf.status === 'delivered_verified'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {trf.statusFa}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {trf.status === 'in_transit' ? (
                          <button
                            onClick={() => setSelectedTransferForArrival(trf)}
                            className="px-3 py-1.5 rounded-lg bg-[#3DD68C] hover:bg-[#4DE69C] text-[#14141A] font-bold transition shadow"
                          >
                            تأیید وصول در مقصد
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-mono">
                            ✓ قطعی شد
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

      {/* Tab 5: Vault Audits */}
      {activeTab === 'audits' && (
        <div className="space-y-4">
          <div className="bg-[#161620] border border-[#262636] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#262636] bg-[#12121A] text-[#9E9EA8]">
                    <th className="py-3 px-4">شماره صورت‌جلسه</th>
                    <th className="py-3 px-4">محل تحت انبارگردانی</th>
                    <th className="py-3 px-4">تاریخ و سرپرست بازرسی</th>
                    <th className="py-3 px-4 text-center">وزن دفتری (گرم)</th>
                    <th className="py-3 px-4 text-center">وزن شمارش فیزیکی</th>
                    <th className="py-3 px-4 text-center">مغایرت</th>
                    <th className="py-3 px-4">نتیجه تطبیق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#20202E]">
                  {audits.map((aud) => (
                    <tr key={aud.id} className="hover:bg-[#1A1A26] transition">
                      <td className="py-3 px-4 font-mono font-bold text-purple-400">
                        {aud.auditNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#EDEDED]">{aud.targetLocationNameFa}</div>
                        <div className="text-[11px] text-[#767688]">{aud.targetTypeFa}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#EDEDED]">{aud.auditorNameFa}</div>
                        <div className="text-[11px] text-[#767688] font-mono">{aud.auditDateFa}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[#C8A951]">
                        {aud.expectedWeightGrams.toLocaleString('fa-IR')}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-white">
                        {aud.physicalCountWeightGrams.toLocaleString('fa-IR')}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span
                          className={
                            aud.discrepancyGrams === 0
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }
                        >
                          {aud.discrepancyGrams === 0 ? '۰.۰۰' : aud.discrepancyGrams} گرم
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                            aud.reconciliationStatus === 'perfect_match'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {aud.reconciliationStatusFa}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSubmit={handleCreateTransfer}
        locations={locations}
        bags={bags}
      />

      <TransferArrivalModal
        isOpen={!!selectedTransferForArrival}
        onClose={() => setSelectedTransferForArrival(null)}
        transfer={selectedTransferForArrival}
        onConfirm={handleConfirmArrival}
      />

      <NewAgentBagModal
        isOpen={isBagModalOpen}
        onClose={() => setIsBagModalOpen(false)}
        onSubmit={handleCreateBag}
      />

      <VaultAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onSubmit={handleRecordAudit}
        locations={locations}
        bags={bags}
      />

      <ItemDetailDrawer
        isOpen={!!selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        item={selectedItemForDetail}
      />
    </div>
  );
};
