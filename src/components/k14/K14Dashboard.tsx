/**
 * Didar Gold Platform - Kernel 14 (K14): Credit & Exposure Dashboard
 * Dual-Currency Exposure, Collateral Vault, Risk Governance & Four-Eyes Approvals
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Coins,
  Scale,
  AlertTriangle,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  FileText,
  BadgePercent,
  Check,
  ChevronLeft,
  X,
  UserCheck,
  History,
  Info,
  Layers,
  Sparkles,
  DollarSign,
  PackageCheck,
  Truck
} from 'lucide-react';
import {
  K14DataPayload,
  BuyerCreditProfile,
  CollateralItem,
  CreditExposureAlert,
  CreditOverrideRequest,
  CollateralType,
  BuyerCreditStatus
} from '../../types/k14';

export const K14Dashboard: React.FC = () => {
  const [data, setData] = useState<K14DataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<'profiles' | 'collaterals' | 'overrides' | 'alerts' | 'deliveries'>('profiles');

  // Deliveries State (K13-K14 Bridge)
  const [zarrinDeliveries, setZarrinDeliveries] = useState<any[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [deliverySearch, setDeliverySearch] = useState('');

  // Filters for Profiles
  const [profileSearch, setProfileSearch] = useState('');
  const [profileStatusFilter, setProfileStatusFilter] = useState<string>('all');
  const [profileTierFilter, setProfileTierFilter] = useState<string>('all');

  // Filters for Collaterals
  const [collateralSearch, setCollateralSearch] = useState('');
  const [collateralTypeFilter, setCollateralTypeFilter] = useState<string>('all');
  const [collateralStatusFilter, setCollateralStatusFilter] = useState<string>('all');

  // Modals
  const [selectedBuyerForLimit, setSelectedBuyerForLimit] = useState<BuyerCreditProfile | null>(null);
  const [selectedBuyerForLock, setSelectedBuyerForLock] = useState<BuyerCreditProfile | null>(null);
  const [selectedBuyerDetail, setSelectedBuyerDetail] = useState<BuyerCreditProfile | null>(null);
  const [isAddCollateralOpen, setIsAddCollateralOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [collateralToRelease, setCollateralToRelease] = useState<CollateralItem | null>(null);

  // Form states
  const [limitFormGold, setLimitFormGold] = useState<number>(0);
  const [limitFormRial, setLimitFormRial] = useState<number>(0);
  const [limitFormOperator, setLimitFormOperator] = useState<string>('مهندس حسینی (مدیریت ارشد ریسک)');
  const [lockReasonInput, setLockReasonInput] = useState<string>('');
  const [releaseOfficerInput, setReleaseOfficerInput] = useState<string>('افسر خزانه‌داری دیدار');

  // New Collateral Form
  const [newColBuyerId, setNewColBuyerId] = useState('');
  const [newColType, setNewColType] = useState<CollateralType>('sayad_cheque');
  const [newColTitle, setNewColTitle] = useState('');
  const [newColIdentifier, setNewColIdentifier] = useState('');
  const [newColBank, setNewColBank] = useState('');
  const [newColNominal, setNewColNominal] = useState<number>(0);
  const [newColHaircut, setNewColHaircut] = useState<number>(10);
  const [newColWeight, setNewColWeight] = useState<number>(0);
  const [newColCarat, setNewColCarat] = useState<number>(750);
  const [newColMaturityDate, setNewColMaturityDate] = useState('۱۴۰۳/۱۲/۲۹');
  const [newColNotes, setNewColNotes] = useState('');

  // Override Request Form
  const [newOvrBuyerId, setNewOvrBuyerId] = useState('');
  const [newOvrType, setNewOvrType] = useState<CreditOverrideRequest['overrideType']>('temporary_rial_limit');
  const [newOvrAmountText, setNewOvrAmountText] = useState('');
  const [newOvrValueRial, setNewOvrValueRial] = useState<number>(0);
  const [newOvrWeightGold, setNewOvrWeightGold] = useState<number>(0);
  const [newOvrReason, setNewOvrReason] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/kernel/k14');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'خطا در بارگذاری اطلاعات K14');
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'خطا در ارتباط با سرور K14');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDeliveries = useCallback(async () => {
    try {
      setLoadingDeliveries(true);
      const res = await fetch('/api/admin/kernel/k13/zarrin-deliveries');
      const json = await res.json();
      if (json.success) {
        setZarrinDeliveries(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load Zarrin deliveries:', err);
    } finally {
      setLoadingDeliveries(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadDeliveries();
  }, [loadData, loadDeliveries]);

  // Formatters
  const formatToman = (val?: number) => {
    if (val === undefined || val === null) return '۰ تومان';
    return `${val.toLocaleString('fa-IR')} تومان`;
  };

  const formatGrams = (val?: number) => {
    if (val === undefined || val === null) return '۰ گرم';
    return `${val.toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} گرم`;
  };

  // Submit Limit Update
  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuyerForLimit) return;
    try {
      const res = await fetch(`/api/admin/kernel/k14/profiles/${selectedBuyerForLimit.buyerId}/limit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goldLimitGrams: limitFormGold,
          rialLimitToman: limitFormRial,
          operator: limitFormOperator
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showSuccess(json.message);
      setSelectedBuyerForLimit(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit Toggle Lock
  const handleToggleLock = async (buyer: BuyerCreditProfile, lock: boolean) => {
    try {
      const res = await fetch(`/api/admin/kernel/k14/profiles/${buyer.buyerId}/toggle-lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lock,
          reasonFa: lockReasonInput || (lock ? 'مسدودی دستی توسط مدیریت ریسک' : undefined)
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showSuccess(json.message);
      setSelectedBuyerForLock(null);
      setLockReasonInput('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit Add Collateral
  const handleSaveCollateral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColBuyerId || !newColIdentifier || !newColNominal) {
      alert('لطفاً خریدار، شماره شناسه و مبلغ اسمی را وارد نمایید.');
      return;
    }
    try {
      const res = await fetch('/api/admin/kernel/k14/collaterals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: newColBuyerId,
          collateralType: newColType,
          titleFa: newColTitle,
          identifierNumber: newColIdentifier,
          issuerBank: newColBank,
          nominalValueToman: newColNominal,
          haircutPercent: newColHaircut,
          weightGrams: newColWeight > 0 ? newColWeight : undefined,
          carat: newColCarat,
          maturityDateFa: newColMaturityDate,
          notesFa: newColNotes
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showSuccess(json.message);
      setIsAddCollateralOpen(false);
      resetCollateralForm();
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetCollateralForm = () => {
    setNewColBuyerId('');
    setNewColType('sayad_cheque');
    setNewColTitle('');
    setNewColIdentifier('');
    setNewColBank('');
    setNewColNominal(0);
    setNewColHaircut(10);
    setNewColWeight(0);
    setNewColNotes('');
  };

  // Submit Release Collateral
  const handleReleaseCollateral = async () => {
    if (!collateralToRelease) return;
    try {
      const res = await fetch(`/api/admin/kernel/k14/collaterals/${collateralToRelease.id}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerName: releaseOfficerInput })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showSuccess(json.message);
      setCollateralToRelease(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit Override Request
  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOvrBuyerId || !newOvrReason) {
      alert('لطفاً خریدار و علت توجیهی درخواست را تکمیل فرمایید.');
      return;
    }
    try {
      const res = await fetch('/api/admin/kernel/k14/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: newOvrBuyerId,
          overrideType: newOvrType,
          requestedAmountText: newOvrAmountText || 'افزایش موقت سقف تعهد',
          requestedValueToman: newOvrValueRial > 0 ? newOvrValueRial : undefined,
          requestedWeightGrams: newOvrWeightGold > 0 ? newOvrWeightGold : undefined,
          reasonFa: newOvrReason
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showSuccess(json.message);
      setIsOverrideModalOpen(false);
      setNewOvrBuyerId('');
      setNewOvrReason('');
      setNewOvrAmountText('');
      setNewOvrValueRial(0);
      setNewOvrWeightGold(0);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Decide Override (Approve / Reject)
  const handleDecideOverride = async (requestId: string, decision: 'approved' | 'rejected') => {
    const note = window.prompt(
      decision === 'approved'
        ? 'یادداشت تصویب کمیته اعتبارات (اختیاری):'
        : 'علت رد درخواست استثنا:'
    );
    if (decision === 'rejected' && !note) {
      alert('در صورت رد درخواست، درج علت الزامی است.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/kernel/k14/overrides/${requestId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          approverName: 'دکتر صمدی (کمیته اعتبارات دیدار)',
          noteFa: note || 'مصوب شد.'
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showSuccess(json.message);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Acknowledge Alert
  const handleAckAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/admin/kernel/k14/alerts/${alertId}/ack`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        showSuccess(json.message);
        loadData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filtered Profiles
  const filteredProfiles = useMemo(() => {
    if (!data) return [];
    return data.creditProfiles.filter((p) => {
      const matchSearch =
        p.buyerOrgNameFa.includes(profileSearch) ||
        p.nationalId.includes(profileSearch) ||
        p.phone.includes(profileSearch);
      const matchStatus = profileStatusFilter === 'all' || p.status === profileStatusFilter;
      const matchTier = profileTierFilter === 'all' || p.tier === profileTierFilter;
      return matchSearch && matchStatus && matchTier;
    });
  }, [data, profileSearch, profileStatusFilter, profileTierFilter]);

  // Filtered Collaterals
  const filteredCollaterals = useMemo(() => {
    if (!data) return [];
    return data.collaterals.filter((c) => {
      const matchSearch =
        c.buyerOrgNameFa.includes(collateralSearch) ||
        c.identifierNumber.includes(collateralSearch) ||
        c.titleFa.includes(collateralSearch) ||
        c.issuerBank.includes(collateralSearch);
      const matchType = collateralTypeFilter === 'all' || c.collateralType === collateralTypeFilter;
      const matchStatus = collateralStatusFilter === 'all' || c.status === collateralStatusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [data, collateralSearch, collateralTypeFilter, collateralStatusFilter]);

  return (
    <div className="space-y-6 text-[#E0E0E8]" dir="rtl">
      {/* Header Banner */}
      <div className="bg-[#151520] border border-[#2B2B3E] rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-[#C8A951]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C8A951] to-[#8C6D23] p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#12121A] rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-[#E5C365]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-[#EDEDED] tracking-tight">
                  هسته K14: اعتبار و ریسک تعهد
                </h1>
                <span className="bg-[#C8A951]/20 text-[#E5C365] text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border border-[#C8A951]/40">
                  CREDIT & EXPOSURE
                </span>
                <span className="bg-[#3DD68C]/15 text-[#3DD68C] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#3DD68C]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3DD68C] animate-pulse" />
                  برخط و فعال
                </span>
              </div>
              <p className="text-xs text-[#8E8EA0] mt-1">
                پایش لحظه‌ای سقف‌های اعتباری ریالی و طلایی، کنترل ریسک مواجهه باز، مدیریت تضامین و فرآیند تصویب استثنا (اصل ۴چشم)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddCollateralOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C8A951] to-[#A88B38] text-[#121218] font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>تودیع و ثبت وثیقه جدید</span>
            </button>

            <button
              onClick={() => setIsOverrideModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#222232] hover:bg-[#2A2A3E] text-[#EDEDED] border border-[#3A3A50] text-xs font-medium transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#C8A951]" />
              <span>درخواست استثنا (۴-چشم)</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl bg-[#1A1A26] hover:bg-[#242436] text-[#A6A6B8] border border-[#2E2E42] transition-colors cursor-pointer"
              title="به‌روزرسانی داده‌ها"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C8A951]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-[#3DD68C]/15 border border-[#3DD68C]/30 text-[#3DD68C] text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Macro Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Gold Exposure */}
        <div className="bg-[#181824] border border-[#2A2A3E] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8E8EA0]">
            <span className="flex items-center gap-1.5 font-medium">
              <Coins className="w-4 h-4 text-[#E5C365]" />
              مواجهه باز طلایی (۷۵۰)
            </span>
            <span className="font-mono text-[10px] text-[#A6A6B8]">
              {data?.metrics.goldUtilizationPercent || 0}٪ سقف
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-[#EDEDED]">
              {formatGrams(data?.metrics.totalExposureGoldGrams)}
            </span>
            <span className="text-[11px] text-[#7A7A8E] font-mono">
              از {formatGrams(data?.metrics.totalCreditExtendedGoldGrams)}
            </span>
          </div>
          <div className="w-full bg-[#12121A] h-2 rounded-full overflow-hidden border border-[#252536]">
            <div
              className={`h-full rounded-full transition-all ${
                (data?.metrics.goldUtilizationPercent || 0) > 85
                  ? 'bg-[#FF5C5C]'
                  : (data?.metrics.goldUtilizationPercent || 0) > 70
                  ? 'bg-[#E5A84B]'
                  : 'bg-[#3DD68C]'
              }`}
              style={{ width: `${Math.min(100, data?.metrics.goldUtilizationPercent || 0)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Rial Exposure */}
        <div className="bg-[#181824] border border-[#2A2A3E] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8E8EA0]">
            <span className="flex items-center gap-1.5 font-medium">
              <CreditCard className="w-4 h-4 text-[#3DD68C]" />
              مواجهه باز ریالی
            </span>
            <span className="font-mono text-[10px] text-[#A6A6B8]">
              {data?.metrics.rialUtilizationPercent || 0}٪ سقف
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-[#EDEDED]">
              {formatToman(data?.metrics.totalExposureRialToman)}
            </span>
          </div>
          <div className="w-full bg-[#12121A] h-2 rounded-full overflow-hidden border border-[#252536]">
            <div
              className={`h-full rounded-full transition-all ${
                (data?.metrics.rialUtilizationPercent || 0) > 85
                  ? 'bg-[#FF5C5C]'
                  : (data?.metrics.rialUtilizationPercent || 0) > 70
                  ? 'bg-[#E5A84B]'
                  : 'bg-[#3DD68C]'
              }`}
              style={{ width: `${Math.min(100, data?.metrics.rialUtilizationPercent || 0)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Total Collaterals Held */}
        <div className="bg-[#181824] border border-[#2A2A3E] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8E8EA0]">
            <span className="flex items-center gap-1.5 font-medium">
              <Scale className="w-4 h-4 text-[#A88B38]" />
              ارزش موثر وثایق تودیع‌شده
            </span>
            <span className="font-mono text-[10px] text-[#3DD68C]">
              پوشش {data?.metrics.overallCoverageRatioPercent || 0}٪
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-[#C8A951]">
              {formatToman(data?.metrics.totalCollateralsHeldToman)}
            </span>
          </div>
          <div className="text-[11px] text-[#7A7A8E] flex items-center justify-between">
            <span>چک صیاد، ضمانت‌نامه، شمش K09</span>
            <span className="text-[#3DD68C] font-semibold">پوشش مافوق تعهد</span>
          </div>
        </div>

        {/* Metric 4: Risk Accounts & Overrides */}
        <div className="bg-[#181824] border border-[#2A2A3E] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8E8EA0]">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-4 h-4 text-[#FF5C5C]" />
              شاخص‌های پرریسک و استثنا
            </span>
            <span className="font-mono text-[10px] text-[#FF8585]">
              {data?.metrics.lockedProfilesCount || 0} قفل اعتباری
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-[#FF5C5C]">
                {data?.metrics.warningProfilesCount || 0}
              </span>
              <span className="text-[11px] text-[#8E8EA0]">در مرز هشدار</span>
            </div>
            <div className="flex items-center gap-2 border-r border-[#2B2B3E] pr-3">
              <span className="text-xl font-bold font-mono text-[#E5C365]">
                {data?.metrics.pendingOverridesCount || 0}
              </span>
              <span className="text-[11px] text-[#8E8EA0]">کارتابل ۴-چشم</span>
            </div>
          </div>
          <div className="text-[11px] text-[#8E8EA0]">
            کنترل اهلیت صدور فاکتور در K13
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#262638] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profiles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profiles'
              ? 'bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40 shadow-sm'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1A1A26]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>پایش پروفایل‌های اعتباری و مواجهه خریداران</span>
          <span className="bg-[#242436] px-1.5 py-0.5 rounded text-[10px] font-mono">
            {data?.creditProfiles.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('collaterals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'collaterals'
              ? 'bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40 shadow-sm'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1A1A26]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>خزانه وثایق و تضامین تودیع‌شده</span>
          <span className="bg-[#242436] px-1.5 py-0.5 rounded text-[10px] font-mono">
            {data?.collaterals.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overrides')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overrides'
              ? 'bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40 shadow-sm'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1A1A26]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>کارتابل تصویب استثنا (اصل ۴چشم)</span>
          {(data?.metrics.pendingOverridesCount || 0) > 0 && (
            <span className="bg-[#E5A84B]/20 text-[#E5A84B] px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
              {data?.metrics.pendingOverridesCount} جدید
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40 shadow-sm'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1A1A26]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>رادار هشدارها و نقض سقف</span>
          <span className="bg-[#FF5C5C]/20 text-[#FF5C5C] px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
            {data?.alerts.filter((a) => !a.isAcknowledged).length || 0}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('deliveries');
            loadDeliveries();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'deliveries'
              ? 'bg-[#3DD68C]/20 text-[#3DD68C] border border-[#3DD68C]/40 shadow-sm'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1A1A26]'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>تحویل به زرین (سرویس اتصال K13 ↔ K14)</span>
          <span className="bg-[#18281E] text-[#3DD68C] px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-[#3DD68C]/30">
            {zarrinDeliveries.length} تحویل
          </span>
        </button>
      </div>

      {/* TAB 1: Credit Profiles & Exposure */}
      {activeTab === 'profiles' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#151520] border border-[#252536] p-3 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#7A7A8E] absolute right-3 top-2.5" />
              <input
                type="text"
                value={profileSearch}
                onChange={(e) => setProfileSearch(e.target.value)}
                placeholder="جستجو در نام خریدار، شناسه ملی، تلفن..."
                className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg pr-9 pl-3 py-1.5 text-xs text-[#EDEDED] placeholder-[#66667A] focus:border-[#C8A951] outline-none"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={profileStatusFilter}
                onChange={(e) => setProfileStatusFilter(e.target.value)}
                className="bg-[#12121A] border border-[#2A2A3E] rounded-lg px-2.5 py-1.5 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
              >
                <option value="all">تمام وضعیت‌های اعتباری</option>
                <option value="active">فعال (عادی)</option>
                <option value="warning">در مرز هشدار (&gt; ۷۰٪)</option>
                <option value="credit_locked">قفل اعتباری (مسدود)</option>
              </select>

              <select
                value={profileTierFilter}
                onChange={(e) => setProfileTierFilter(e.target.value)}
                className="bg-[#12121A] border border-[#2A2A3E] rounded-lg px-2.5 py-1.5 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
              >
                <option value="all">تمام رتبه‌ها (Tier)</option>
                <option value="T1">رتبه ممتاز (Tier 1)</option>
                <option value="T2">رتبه تجاری استاندارد (Tier 2)</option>
                <option value="T3">رتبه نوپا / مشروط (Tier 3)</option>
              </select>
            </div>
          </div>

          {/* Profiles Table */}
          <div className="bg-[#151520] border border-[#252536] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs whitespace-nowrap min-w-[900px]">
                <thead className="bg-[#1C1C28] text-[#8E8EA0] border-b border-[#252536]">
                  <tr>
                    <th className="py-3 px-3.5">طرف حساب و رتبه</th>
                    <th className="py-3 px-3.5">مواجهه طلایی (گرم ۱۸)</th>
                    <th className="py-3 px-3.5">مواجهه ریالی (تومان)</th>
                    <th className="py-3 px-3.5">پوشش وثیقه</th>
                    <th className="py-3 px-3.5">امتیاز اعتباری</th>
                    <th className="py-3 px-3.5">وضعیت</th>
                    <th className="py-3 px-3.5 text-center">عملیات مدیریت ریسک</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222232]">
                  {filteredProfiles.map((p) => {
                    const isLocked = p.status === 'credit_locked';
                    return (
                      <tr key={p.buyerId} className="hover:bg-[#1A1A26] transition-colors">
                        {/* Buyer Info */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                p.tier === 'T1'
                                  ? 'bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40'
                                  : p.tier === 'T2'
                                  ? 'bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/40'
                                  : 'bg-[#9CA3AF]/20 text-[#D1D5DB] border border-[#9CA3AF]/40'
                              }`}
                            >
                              {p.tier}
                            </span>
                            <div>
                              <div className="font-bold text-[#EDEDED]">{p.buyerOrgNameFa}</div>
                              <div className="text-[10px] text-[#7A7A8E] font-mono">
                                شناسه ملی: {p.nationalId} | {p.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Gold Exposure */}
                        <td className="py-3 px-3.5">
                          <div className="space-y-1 w-44">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="font-bold text-[#EDEDED]">{p.goldExposureGrams}g</span>
                              <span className="text-[#8E8EA0]">سقف: {p.goldCreditLimitGrams}g</span>
                            </div>
                            <div className="w-full bg-[#12121A] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  p.goldUtilizationPercent > 90
                                    ? 'bg-[#FF5C5C]'
                                    : p.goldUtilizationPercent > 70
                                    ? 'bg-[#E5A84B]'
                                    : 'bg-[#3DD68C]'
                                }`}
                                style={{ width: `${Math.min(100, p.goldUtilizationPercent)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[#7A7A8E] font-mono">
                              <span>مانده مجاز: {p.goldAvailableCreditGrams}g</span>
                              <span className="font-bold">{p.goldUtilizationPercent}٪</span>
                            </div>
                          </div>
                        </td>

                        {/* Rial Exposure */}
                        <td className="py-3 px-3.5">
                          <div className="space-y-1 w-48">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="font-bold text-[#EDEDED]">
                                {(p.rialExposureToman / 1000000).toLocaleString('fa-IR')} م
                              </span>
                              <span className="text-[#8E8EA0]">
                                سقف: {(p.rialCreditLimitToman / 1000000).toLocaleString('fa-IR')} م
                              </span>
                            </div>
                            <div className="w-full bg-[#12121A] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  p.rialUtilizationPercent > 90
                                    ? 'bg-[#FF5C5C]'
                                    : p.rialUtilizationPercent > 70
                                    ? 'bg-[#E5A84B]'
                                    : 'bg-[#3DD68C]'
                                }`}
                                style={{ width: `${Math.min(100, p.rialUtilizationPercent)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[#7A7A8E] font-mono">
                              <span>مانده: {(p.rialAvailableCreditToman / 1000000).toLocaleString('fa-IR')} م</span>
                              <span className="font-bold">{p.rialUtilizationPercent}٪</span>
                            </div>
                          </div>
                        </td>

                        {/* Collateral Coverage */}
                        <td className="py-3 px-3.5">
                          <div className="font-mono">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-bold ${
                                  p.collateralCoveragePercent >= 120
                                    ? 'text-[#3DD68C]'
                                    : p.collateralCoveragePercent >= 90
                                    ? 'text-[#E5A84B]'
                                    : 'text-[#FF5C5C]'
                                }`}
                              >
                                {p.collateralCoveragePercent}٪
                              </span>
                              <span className="text-[10px] text-[#8E8EA0]">پوشش</span>
                            </div>
                            <div className="text-[10px] text-[#7A7A8E]">
                              ارزش موثر: {(p.collateralEffectiveValueToman / 1000000).toLocaleString('fa-IR')} م تومان
                            </div>
                          </div>
                        </td>

                        {/* Credit Score & Risk */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#12121A] border border-[#252536] flex items-center justify-center font-mono font-bold text-xs text-[#E5C365]">
                              {p.creditScore}
                            </div>
                            <div>
                              <div
                                className={`text-[10px] font-bold ${
                                  p.riskLevel === 'low'
                                    ? 'text-[#3DD68C]'
                                    : p.riskLevel === 'medium'
                                    ? 'text-[#E5A84B]'
                                    : 'text-[#FF5C5C]'
                                }`}
                              >
                                {p.riskLevel === 'low'
                                  ? 'ریسک کم'
                                  : p.riskLevel === 'medium'
                                  ? 'ریسک متوسط'
                                  : p.riskLevel === 'high'
                                  ? 'پرریسک'
                                  : 'بحرانی'}
                              </div>
                              <div className="text-[9px] text-[#7A7A8E]">
                                {p.activeOrdersCount} سفارش | {p.unsettledInvoicesCount} فاکتور باز
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3.5">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF5C5C]/15 text-[#FF5C5C] text-[10px] font-bold border border-[#FF5C5C]/30">
                              <Lock className="w-3 h-3" />
                              قفل اعتباری
                            </span>
                          ) : p.status === 'warning' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E5A84B]/15 text-[#E5A84B] text-[10px] font-bold border border-[#E5A84B]/30">
                              <AlertTriangle className="w-3 h-3" />
                              هشدار سقف
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#3DD68C]/15 text-[#3DD68C] text-[10px] font-bold border border-[#3DD68C]/30">
                              <CheckCircle2 className="w-3 h-3" />
                              فعال و مجاز
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedBuyerForLimit(p);
                                setLimitFormGold(p.goldCreditLimitGrams);
                                setLimitFormRial(p.rialCreditLimitToman);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#222232] hover:bg-[#2C2C40] text-[#E5C365] border border-[#36364C] text-[11px] font-medium transition-colors cursor-pointer"
                              title="تغییر سقف اعتبار ریالی و طلایی"
                            >
                              سقف اعتبار
                            </button>

                            <button
                              onClick={() => {
                                setSelectedBuyerForLock(p);
                                setLockReasonInput(p.lockReasonFa || '');
                              }}
                              className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                                isLocked
                                  ? 'bg-[#3DD68C]/15 text-[#3DD68C] border-[#3DD68C]/30 hover:bg-[#3DD68C]/25'
                                  : 'bg-[#FF5C5C]/15 text-[#FF5C5C] border-[#FF5C5C]/30 hover:bg-[#FF5C5C]/25'
                              }`}
                              title={isLocked ? 'بازگشایی قفل اعتباری' : 'مسدودسازی و قفل اعتباری'}
                            >
                              {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => setSelectedBuyerDetail(p)}
                              className="px-2 py-1 rounded-lg bg-[#181824] hover:bg-[#222234] text-[#A6A6B8] border border-[#2B2B3E] text-[11px] transition-colors cursor-pointer"
                              title="مشاهده پرونده کامل اعتباری"
                            >
                              پرونده
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

      {/* TAB 2: Collaterals & Guarantees */}
      {activeTab === 'collaterals' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#151520] border border-[#252536] p-3 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#7A7A8E] absolute right-3 top-2.5" />
              <input
                type="text"
                value={collateralSearch}
                onChange={(e) => setCollateralSearch(e.target.value)}
                placeholder="شناسه صیادی، سریال شمش، نام خریدار..."
                className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg pr-9 pl-3 py-1.5 text-xs text-[#EDEDED] placeholder-[#66667A] focus:border-[#C8A951] outline-none"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={collateralTypeFilter}
                onChange={(e) => setCollateralTypeFilter(e.target.value)}
                className="bg-[#12121A] border border-[#2A2A3E] rounded-lg px-2.5 py-1.5 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
              >
                <option value="all">تمام انواع وثایق</option>
                <option value="sayad_cheque">چک صیادی بنفش</option>
                <option value="bank_guarantee">ضمانت‌نامه بانکی (LC)</option>
                <option value="physical_gold_deposit">شمش امانی در خزانه K09</option>
              </select>

              <select
                value={collateralStatusFilter}
                onChange={(e) => setCollateralStatusFilter(e.target.value)}
                className="bg-[#12121A] border border-[#2A2A3E] rounded-lg px-2.5 py-1.5 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
              >
                <option value="all">تمام وضعیت‌ها</option>
                <option value="valid">معتبر و فعال</option>
                <option value="expiring_soon">نزدیک به سررسید (&lt; ۳۰ روز)</option>
                <option value="matured">سررسید شده (معوق)</option>
                <option value="released">آزاد / فک رهن شده</option>
              </select>
            </div>
          </div>

          {/* Collaterals List */}
          <div className="bg-[#151520] border border-[#252536] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs whitespace-nowrap min-w-[900px]">
                <thead className="bg-[#1C1C28] text-[#8E8EA0] border-b border-[#252536]">
                  <tr>
                    <th className="py-3 px-3.5">نوع وثیقه و شناسه</th>
                    <th className="py-3 px-3.5">تودیع‌کننده</th>
                    <th className="py-3 px-3.5">ارزش اسمی</th>
                    <th className="py-3 px-3.5">Haircut</th>
                    <th className="py-3 px-3.5">ارزش موثر تضامینی</th>
                    <th className="py-3 px-3.5">سررسید و مهلت</th>
                    <th className="py-3 px-3.5">وضعیت استعلام</th>
                    <th className="py-3 px-3.5 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222232]">
                  {filteredCollaterals.map((c) => (
                    <tr key={c.id} className="hover:bg-[#1A1A26] transition-colors">
                      {/* Collateral Type & Identifier */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#181824] border border-[#2B2B3E] flex items-center justify-center">
                            {c.collateralType === 'physical_gold_deposit' ? (
                              <Coins className="w-4 h-4 text-[#E5C365]" />
                            ) : c.collateralType === 'bank_guarantee' ? (
                              <Building2 className="w-4 h-4 text-[#3DD68C]" />
                            ) : (
                              <FileText className="w-4 h-4 text-[#60A5FA]" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[#EDEDED] flex items-center gap-2">
                              <span>{c.titleFa}</span>
                              {c.vaultBagId && (
                                <span className="bg-[#C8A951]/20 text-[#E5C365] text-[9px] font-mono px-1.5 py-0.5 rounded">
                                  {c.vaultBagId}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#8E8EA0] font-mono">
                              شناسه: <strong className="text-[#C8A951]">{c.identifierNumber}</strong> | {c.issuerBank}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Buyer */}
                      <td className="py-3 px-3.5">
                        <span className="font-medium text-[#EDEDED]">{c.buyerOrgNameFa}</span>
                      </td>

                      {/* Nominal Value */}
                      <td className="py-3 px-3.5 font-mono">
                        <div className="font-bold text-[#EDEDED]">{formatToman(c.nominalValueToman)}</div>
                        {c.weightGrams && (
                          <div className="text-[10px] text-[#A6A6B8]">
                            وزن: {c.weightGrams} گرم (عیار {c.carat})
                          </div>
                        )}
                      </td>

                      {/* Haircut */}
                      <td className="py-3 px-3.5 font-mono text-[#E5A84B]">
                        {c.haircutPercent}٪
                      </td>

                      {/* Effective Value */}
                      <td className="py-3 px-3.5 font-mono font-bold text-[#3DD68C]">
                        {formatToman(c.effectiveValueToman)}
                      </td>

                      {/* Maturity */}
                      <td className="py-3 px-3.5">
                        <div className="font-mono text-[11px] text-[#EDEDED]">{c.maturityDateFa}</div>
                        <div className="text-[10px]">
                          {c.daysToMaturity < 0 ? (
                            <span className="text-[#FF5C5C] font-bold">
                              {Math.abs(c.daysToMaturity)} روز معوق
                            </span>
                          ) : c.daysToMaturity <= 30 ? (
                            <span className="text-[#E5A84B] font-semibold">
                              {c.daysToMaturity} روز باقیمانده
                            </span>
                          ) : (
                            <span className="text-[#8E8EA0]">{c.daysToMaturity} روز اعتبار</span>
                          )}
                        </div>
                      </td>

                      {/* Status & Verification */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-1">
                          {c.status === 'released' ? (
                            <span className="px-2 py-0.5 rounded bg-[#4E4E62]/20 text-[#8E8EA0] text-[10px] font-medium border border-[#4E4E62]/30">
                              آزاد / فک رهن
                            </span>
                          ) : c.status === 'matured' ? (
                            <span className="px-2 py-0.5 rounded bg-[#FF5C5C]/20 text-[#FF5C5C] text-[10px] font-bold border border-[#FF5C5C]/30">
                              سررسید معوق
                            </span>
                          ) : c.status === 'expiring_soon' ? (
                            <span className="px-2 py-0.5 rounded bg-[#E5A84B]/20 text-[#E5A84B] text-[10px] font-bold border border-[#E5A84B]/30">
                              موعد نزدیک
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#3DD68C]/15 text-[#3DD68C] text-[10px] font-medium border border-[#3DD68C]/30">
                              معتبر و فعال
                            </span>
                          )}

                          <div className="text-[9px] text-[#7A7A8E] flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 text-[#3DD68C]" />
                            {c.verificationStatus === 'verified_central_bank'
                              ? 'تایید بانک مرکزی / صیاد'
                              : 'امانی خزانه K09'}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-center">
                        {c.status !== 'released' ? (
                          <button
                            onClick={() => setCollateralToRelease(c)}
                            className="px-2.5 py-1 rounded-lg bg-[#242436] hover:bg-[#2E2E44] text-[#A6A6B8] hover:text-[#EDEDED] border border-[#34344C] text-[11px] transition-colors cursor-pointer"
                          >
                            آزادسازی / فک
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#606074]">تسویه شده</span>
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

      {/* TAB 3: Overrides & Four-Eyes Approvals */}
      {activeTab === 'overrides' && (
        <div className="space-y-4">
          <div className="bg-[#181824] border border-[#2B2B3E] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C8A951]/20 flex items-center justify-center text-[#E5C365]">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#EDEDED]">
                  گردش کار تصویب استثنا و مجوزهای اعتباری (Four-Eyes Principle)
                </h3>
                <p className="text-xs text-[#8E8EA0] mt-0.5">
                  کلیه درخواست‌های افزایش موقت سقف یا تحویل امانی بیش از حد مجاز، مستلزم تایید دوگانه مدیر ارشد ریسک و کمیته اعتبارات دیدار است.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOverrideModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C8A951] hover:bg-[#D4B65E] text-[#121218] font-bold text-xs cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت درخواست استثنا</span>
            </button>
          </div>

          <div className="space-y-3">
            {data?.overrideRequests.map((ovr) => (
              <div
                key={ovr.id}
                className="bg-[#151520] border border-[#28283C] rounded-xl p-4 space-y-3 hover:border-[#383852] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222232] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-[#E5C365] bg-[#1C1C28] px-2 py-0.5 rounded border border-[#2A2A3E]">
                      {ovr.requestNumber}
                    </span>
                    <span className="font-bold text-sm text-[#EDEDED]">{ovr.buyerOrgNameFa}</span>
                    <span className="text-xs text-[#8E8EA0]">| متقاضی: {ovr.requestedByFa}</span>
                  </div>

                  <div>
                    {ovr.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#3DD68C]/15 text-[#3DD68C] text-[11px] font-bold border border-[#3DD68C]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        مصوب و اعمال‌شده
                      </span>
                    ) : ovr.status === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF5C5C]/15 text-[#FF5C5C] text-[11px] font-bold border border-[#FF5C5C]/30">
                        <XCircle className="w-3.5 h-3.5" />
                        رد شده
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E5A84B]/15 text-[#E5A84B] text-[11px] font-bold border border-[#E5A84B]/30 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        در انتظار رسیدگی ریسک (۴-چشم)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#12121A] p-2.5 rounded-lg border border-[#222230] space-y-1">
                    <span className="text-[#7A7A8E] block text-[10px]">موضوع استثنا:</span>
                    <span className="font-medium text-[#EDEDED]">{ovr.requestedAmountText}</span>
                    <div className="text-[10px] text-[#A6A6B8] font-mono mt-1">
                      {ovr.requestedWeightGrams
                        ? `میزان طلا: ${ovr.requestedWeightGrams} گرم`
                        : ovr.requestedValueToman
                        ? `مبلغ ریالی: ${formatToman(ovr.requestedValueToman)}`
                        : ''}
                    </div>
                  </div>

                  <div className="bg-[#12121A] p-2.5 rounded-lg border border-[#222230] space-y-1">
                    <span className="text-[#7A7A8E] block text-[10px]">وضعیت فعلی طرف حساب:</span>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[#8E8EA0]">بهره‌برداری:</span>
                      <strong className="text-[#E5A84B]">{ovr.currentUtilizationPercent}٪</strong>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[#8E8EA0]">پوشش وثایق:</span>
                      <strong className="text-[#3DD68C]">{ovr.existingCollateralCoveragePercent}٪</strong>
                    </div>
                  </div>

                  <div className="bg-[#12121A] p-2.5 rounded-lg border border-[#222230] space-y-1">
                    <span className="text-[#7A7A8E] block text-[10px]">ادله و توجیه تجاری:</span>
                    <p className="text-[#EDEDED] leading-relaxed line-clamp-2">{ovr.reasonFa}</p>
                  </div>
                </div>

                {ovr.status === 'approved' && (
                  <div className="p-2.5 rounded-lg bg-[#3DD68C]/10 border border-[#3DD68C]/20 text-[11px] text-[#3DD68C] flex items-center justify-between">
                    <div>
                      <strong>تایید شده توسط:</strong> {ovr.approvedByFa} (تاریخ: {ovr.decisionDateFa})
                      {ovr.decisionNoteFa && <span className="mr-2 text-[#EDEDED]">- «{ovr.decisionNoteFa}»</span>}
                    </div>
                    {ovr.validUntilFa && (
                      <span className="font-mono text-[10px] bg-[#12121A] px-2 py-0.5 rounded border border-[#252536] text-[#A6A6B8]">
                        مهلت اعتبار استثنا: {ovr.validUntilFa}
                      </span>
                    )}
                  </div>
                )}

                {ovr.status === 'pending_risk_review' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleDecideOverride(ovr.id, 'rejected')}
                      className="px-3 py-1.5 rounded-lg bg-[#FF5C5C]/15 hover:bg-[#FF5C5C]/25 text-[#FF5C5C] border border-[#FF5C5C]/30 text-xs font-medium cursor-pointer transition-colors"
                    >
                      رد درخواست استثنا
                    </button>
                    <button
                      onClick={() => handleDecideOverride(ovr.id, 'approved')}
                      className="px-4 py-1.5 rounded-lg bg-[#3DD68C] hover:bg-[#4AE299] text-[#121218] text-xs font-bold cursor-pointer transition-all shadow-md"
                    >
                      تصویب و اعمال افزایش سقف
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Alerts & Breaches */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {data?.alerts.map((alertItem) => (
            <div
              key={alertItem.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                alertItem.severity === 'critical'
                  ? 'bg-[#FF5C5C]/10 border-[#FF5C5C]/30 text-[#EDEDED]'
                  : 'bg-[#E5A84B]/10 border-[#E5A84B]/30 text-[#EDEDED]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    alertItem.severity === 'critical'
                      ? 'bg-[#FF5C5C]/20 text-[#FF5C5C]'
                      : 'bg-[#E5A84B]/20 text-[#E5A84B]'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#EDEDED]">{alertItem.buyerOrgNameFa}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        alertItem.severity === 'critical'
                          ? 'bg-[#FF5C5C]/20 text-[#FF5C5C]'
                          : 'bg-[#E5A84B]/20 text-[#E5A84B]'
                      }`}
                    >
                      {alertItem.metricValueText}
                    </span>
                    <span className="text-[10px] text-[#8E8EA0] font-mono">{alertItem.timestampFa}</span>
                  </div>
                  <p className="text-xs text-[#C6C6D6] mt-1">{alertItem.messageFa}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {!alertItem.isAcknowledged ? (
                  <button
                    onClick={() => handleAckAlert(alertItem.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#20202E] hover:bg-[#28283C] text-[#E0E0E8] border border-[#3A3A4E] text-xs font-medium cursor-pointer transition-colors"
                  >
                    رویت و تایید اقدام
                  </button>
                ) : (
                  <span className="text-[11px] text-[#3DD68C] flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تایید شد
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: Zarrin Goods Deliveries & K13-K14 Automated Synchronization */}
      {activeTab === 'deliveries' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="bg-[#141A16] border border-[#2E7D4E]/50 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3DD68C]/20 border border-[#3DD68C]/40 flex items-center justify-center flex-shrink-0">
                  <PackageCheck className="w-5 h-5 text-[#3DD68C]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                    <span>سرویس اتصال داده‌های صورتحساب K13 با ماژول K14 و تحویل خودکار به زرین</span>
                    <span className="bg-[#3DD68C]/20 text-[#3DD68C] px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      K13-K14-K16 BRIDGE
                    </span>
                  </h2>
                  <p className="text-xs text-[#8C9E90] mt-1 leading-relaxed">
                    پس از نهایی‌سازی هر فاکتور در K13، اقلام کالا به‌طور خودکار در کاردکس زرین ثبت و در وضعیت «تحویل به زرین شده» قرار می‌گیرند.
                    همزمان سقف وزنی طلا و تعهد ریالی خریدار در هسته K14 به‌صورت بلادرنگ پایش و مواجهه اعتباری ناشی از تحویل کالا اعمال می‌گردد.
                  </p>
                </div>
              </div>

              <button
                onClick={loadDeliveries}
                disabled={loadingDeliveries}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E2E24] hover:bg-[#283C30] text-[#3DD68C] border border-[#2E7D4E]/60 text-xs font-semibold cursor-pointer self-start sm:self-center transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDeliveries ? 'animate-spin' : ''}`} />
                <span>به‌روزرسانی اقلام زرین</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-[#243A2C]">
              <div className="p-2.5 rounded-lg bg-[#0F1410] border border-[#1E2B20]">
                <span className="text-[10px] text-[#7A8E7E] block">فاکتورهای تحویل‌شده به زرین:</span>
                <span className="text-base font-bold font-mono text-[#EDEDED]">
                  {zarrinDeliveries.length} فقره
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F1410] border border-[#1E2B20]">
                <span className="text-[10px] text-[#7A8E7E] block">کل وزن طلای تحویلی به زرین:</span>
                <span className="text-base font-bold font-mono text-[#E5C365]">
                  {formatGrams(zarrinDeliveries.reduce((acc, curr) => acc + (curr.totalWeightGrams || 0), 0))}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F1410] border border-[#1E2B20]">
                <span className="text-[10px] text-[#7A8E7E] block">مجموع ارزش ریالی اقلام تحویلی:</span>
                <span className="text-base font-bold font-mono text-[#3DD68C]">
                  {formatToman(zarrinDeliveries.reduce((acc, curr) => acc + (curr.grandTotalToman || 0), 0))}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0F1410] border border-[#1E2B20]">
                <span className="text-[10px] text-[#7A8E7E] block">همگام‌سازی مواجهه K14:</span>
                <span className="text-xs font-bold text-[#3DD68C] flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>۱۰۰٪ ثبت در کاردکس و ریسک</span>
                </span>
              </div>
            </div>
          </div>

          {/* Search Filter */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="جستجو در فاکتورها، خریداران یا شماره رسید زرین..."
                value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)}
                className="w-full bg-[#181824] border border-[#2A2A3E] rounded-xl pr-9 pl-3 py-2 text-xs text-[#EDEDED] placeholder-[#7A7A8E] focus:border-[#3DD68C] outline-none"
              />
              <Search className="w-4 h-4 text-[#7A7A8E] absolute right-3 top-2.5" />
            </div>

            <span className="text-xs text-[#8A8A9E]">
              نمایش اقلام بر اساس پروتکل انتقال خودکار کاردکس زرین و کنترل سقف K14
            </span>
          </div>

          {/* Deliveries Table */}
          <div className="bg-[#181824] border border-[#2A2A3E] rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#252536] text-[#868698] bg-[#14141E]">
                    <th className="py-3 px-3">شماره صورتحساب K13</th>
                    <th className="py-3 px-3">خریدار و طرف تجاری</th>
                    <th className="py-3 px-3">شماره رسید رسمی زرین</th>
                    <th className="py-3 px-3">وضعیت اقلام فاکتور</th>
                    <th className="py-3 px-3">وزن طلا</th>
                    <th className="py-3 px-3">ارزش کل فاکتور</th>
                    <th className="py-3 px-3">شیوه تسویه</th>
                    <th className="py-3 px-3">سند دوبل دفترکل زرین</th>
                    <th className="py-3 px-3">مواجهه K14</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222230]">
                  {zarrinDeliveries
                    .filter((del) => {
                      if (!deliverySearch) return true;
                      const s = deliverySearch.toLowerCase();
                      return (
                        del.invoiceNumber?.toLowerCase().includes(s) ||
                        del.buyerNameFa?.toLowerCase().includes(s) ||
                        del.zarrinDeliveryReceiptNumber?.toLowerCase().includes(s) ||
                        del.buyerNationalId?.includes(s)
                      );
                    })
                    .map((del) => (
                      <tr key={del.id} className="hover:bg-[#1C1C2A] transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#EDEDED]">
                          {del.invoiceNumber}
                          {del.orderCode && (
                            <span className="block text-[10px] text-[#7A7A8E] font-mono">{del.orderCode}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-[#EDEDED] block">{del.buyerNameFa}</span>
                          <span className="text-[10px] text-[#7A7A8E] font-mono">
                            شناسه: {del.buyerNationalId}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#3DD68C]">
                          <div className="flex items-center gap-1">
                            <PackageCheck className="w-3.5 h-3.5 text-[#3DD68C]" />
                            <span>{del.zarrinDeliveryReceiptNumber || 'REC-ZR-PENDING'}</span>
                          </div>
                          {del.zarrinDeliveryDateFa && (
                            <span className="block text-[10px] text-[#7A8E7E] font-mono mt-0.5">
                              {del.zarrinDeliveryDateFa}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
                            <CheckCircle2 className="w-3 h-3 text-[#3DD68C]" />
                            <span>تحویل به زرین شده</span>
                          </span>
                          <span className="block text-[9px] text-[#8E8EA0] mt-0.5">
                            {del.items?.length || 1} ردیف کالا در کاردکس
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#E5C365]">
                          {formatGrams(del.totalWeightGrams)}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#EDEDED]">
                          {formatToman(del.grandTotalToman)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            del.settlementMode === 'split'
                              ? 'bg-[#E5A84B]/15 text-[#E5C365]'
                              : del.settlementMode === 'rial_only'
                              ? 'bg-[#3DD68C]/15 text-[#3DD68C]'
                              : 'bg-[#C8A951]/15 text-[#E5C365]'
                          }`}>
                            {del.settlementMode === 'split'
                              ? `تسهیم (${del.rialSplitPercent}٪ / ${del.goldSplitPercent}٪)`
                              : del.settlementMode === 'rial_only'
                              ? '۱۰۰٪ نقدی ریالی'
                              : '۱۰۰٪ طلای آبشده'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {del.k15VoucherRecorded ? (
                            <div className="space-y-0.5">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-[#C8A951]/20 text-[#E5C365] text-[10px] font-bold border border-[#C8A951]/30">
                                {del.k15VoucherRecorded.voucherNumber}
                              </span>
                              <span className="block text-[9px] text-[#3DD68C]">
                                دفتر دوگانه K15 (ثبت خودکار)
                              </span>
                            </div>
                          ) : del.zarrinVoucher ? (
                            <div className="space-y-0.5">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-[#3DD68C]/15 text-[#3DD68C] text-[10px] font-bold">
                                {del.zarrinVoucher.voucherNumber}
                              </span>
                              <span className="block text-[9px] text-[#7A8E7E]">
                                {del.zarrinVoucher.statusFa}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#6E6E82]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
                            <ShieldCheck className="w-3 h-3 text-[#3DD68C]" />
                            <span>مواجهه ثبت شد</span>
                          </span>
                        </td>
                      </tr>
                    ))}

                  {zarrinDeliveries.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#8E8EA0]">
                        <PackageCheck className="w-8 h-8 text-[#5A5A70] mx-auto mb-2 opacity-50" />
                        <p className="text-xs">
                          هنوز فاکتوری به کاردکس زرین تحویل نشده است.
                        </p>
                        <p className="text-[11px] text-[#6E6E82] mt-1">
                          در زبانه فاکتورهای K13، با کلیک بر روی دکمه «تحویل زرین»، صورتحساب نهایی شده و کالاها به‌طور خودکار در کاردکس زرین ثبت و تحویل می‌گردند.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Dual Credit Limit Adjustment */}
      {selectedBuyerForLimit && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161622] border border-[#2C2C40] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#252536] pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#E5C365]" />
                <h3 className="font-bold text-sm text-[#EDEDED]">
                  تنظیم سقف اعتبار دوگانه: {selectedBuyerForLimit.buyerOrgNameFa}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBuyerForLimit(null)}
                className="text-[#8E8EA0] hover:text-[#EDEDED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLimits} className="space-y-4 text-xs">
              <div className="bg-[#12121A] p-3 rounded-xl border border-[#222232] space-y-2">
                <div className="flex justify-between text-[#8E8EA0]">
                  <span>مواجهه باز فعلی طلا:</span>
                  <strong className="font-mono text-[#EDEDED]">{selectedBuyerForLimit.goldExposureGrams} گرم</strong>
                </div>
                <div className="flex justify-between text-[#8E8EA0]">
                  <span>مواجهه باز فعلی ریالی:</span>
                  <strong className="font-mono text-[#EDEDED]">
                    {formatToman(selectedBuyerForLimit.rialExposureToman)}
                  </strong>
                </div>
                <div className="flex justify-between text-[#8E8EA0]">
                  <span>پوشش وثایق:</span>
                  <strong className="font-mono text-[#3DD68C]">{selectedBuyerForLimit.collateralCoveragePercent}٪</strong>
                </div>
              </div>

              <div>
                <label className="text-[#8E8EA0] block mb-1">سقف جدید اعتبار وزنی طلا (گرم ۱۸ عیار / ۷۵۰):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    min={selectedBuyerForLimit.goldExposureGrams}
                    value={limitFormGold}
                    onChange={(e) => setLimitFormGold(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                  <span className="absolute left-3 top-2 text-[#7A7A8E] text-[11px]">گرم</span>
                </div>
                <p className="text-[10px] text-[#7A7A8E] mt-1">
                  حداقل سقف نمی‌تواند کمتر از مواجهه باز فعلی ({selectedBuyerForLimit.goldExposureGrams} گرم) باشد.
                </p>
              </div>

              <div>
                <label className="text-[#8E8EA0] block mb-1">سقف جدید اعتبار ریالی (تومان):</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1000000"
                    required
                    min={selectedBuyerForLimit.rialExposureToman}
                    value={limitFormRial}
                    onChange={(e) => setLimitFormRial(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                  <span className="absolute left-3 top-2 text-[#7A7A8E] text-[11px]">تومان</span>
                </div>
                <p className="text-[10px] text-[#A6A6B8] mt-1 font-mono">
                  معادل: {(limitFormRial / 1000000).toLocaleString('fa-IR')} میلیون تومان
                </p>
              </div>

              <div>
                <label className="text-[#8E8EA0] block mb-1">نام و سمت متصدی ثبت تغییر:</label>
                <input
                  type="text"
                  value={limitFormOperator}
                  onChange={(e) => setLimitFormOperator(e.target.value)}
                  className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#252536]">
                <button
                  type="button"
                  onClick={() => setSelectedBuyerForLimit(null)}
                  className="px-3.5 py-2 rounded-xl bg-[#222232] text-[#8E8EA0] hover:text-[#EDEDED] text-xs cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D4B65E] text-[#121218] font-bold text-xs cursor-pointer transition-all shadow"
                >
                  ثبت و به‌روزرسانی سقف‌ها
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Credit Lock / Freeze Confirmation */}
      {selectedBuyerForLock && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161622] border border-[#2C2C40] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#252536] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#FF5C5C]" />
                <h3 className="font-bold text-sm text-[#EDEDED]">
                  {selectedBuyerForLock.status === 'credit_locked'
                    ? 'رفع قفل اعتباری و بازگشایی حساب'
                    : 'قفل اعتباری و مسدودسازی خریدار'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBuyerForLock(null)}
                className="text-[#8E8EA0] hover:text-[#EDEDED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#C6C6D6] space-y-3">
              <p>
                طرف حساب:{' '}
                <strong className="text-[#EDEDED]">{selectedBuyerForLock.buyerOrgNameFa}</strong>
              </p>

              {selectedBuyerForLock.status !== 'credit_locked' ? (
                <>
                  <p className="text-[#FF8585]">
                    با فعال‌سازی قفل اعتباری، این خریدار امکان قفل مظنه جدید در K13، ثبت پیش‌فاکتور رسمی و تخصیص سفارش در K10 را تا زمان رفع مسدودی نخواهد داشت.
                  </p>
                  <div>
                    <label className="text-[#8E8EA0] block mb-1">علت و مستند قفل اعتباری:</label>
                    <textarea
                      rows={3}
                      value={lockReasonInput}
                      onChange={(e) => setLockReasonInput(e.target.value)}
                      placeholder="تخطی از سقف، چک برگشتی، دستور امور حقوقی..."
                      className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg p-2.5 text-xs text-[#EDEDED] focus:border-[#FF5C5C] outline-none"
                    />
                  </div>
                </>
              ) : (
                <p className="text-[#3DD68C]">
                  با بازگشایی حساب، کلیه دسترسی‌های خرید اعتباری بر اساس سقف‌های مجاز فعلی مجدداً برقرار خواهد شد.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#252536]">
              <button
                onClick={() => setSelectedBuyerForLock(null)}
                className="px-3.5 py-2 rounded-xl bg-[#222232] text-[#8E8EA0] hover:text-[#EDEDED] text-xs cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={() =>
                  handleToggleLock(
                    selectedBuyerForLock,
                    selectedBuyerForLock.status !== 'credit_locked'
                  )
                }
                className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all shadow ${
                  selectedBuyerForLock.status === 'credit_locked'
                    ? 'bg-[#3DD68C] text-[#121218] hover:bg-[#4AE299]'
                    : 'bg-[#FF5C5C] text-white hover:bg-[#FF7070]'
                }`}
              >
                {selectedBuyerForLock.status === 'credit_locked'
                  ? 'تایید رفع قفل و بازگشایی'
                  : 'تایید قفل اعتباری حساب'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add New Collateral */}
      {isAddCollateralOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161622] border border-[#2C2C40] rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#252536] pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#C8A951]" />
                <h3 className="font-bold text-sm text-[#EDEDED]">تودیع و ثبت وثیقه / ضمانت‌نامه جدید</h3>
              </div>
              <button
                onClick={() => setIsAddCollateralOpen(false)}
                className="text-[#8E8EA0] hover:text-[#EDEDED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCollateral} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#8E8EA0] block mb-1">طرف تجاری تودیع‌کننده:</label>
                <select
                  required
                  value={newColBuyerId}
                  onChange={(e) => setNewColBuyerId(e.target.value)}
                  className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                >
                  <option value="">-- انتخاب خریدار یا بنکدار --</option>
                  {data?.creditProfiles.map((p) => (
                    <option key={p.buyerId} value={p.buyerId}>
                      {p.buyerOrgNameFa} ({p.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8E8EA0] block mb-1">نوع وثیقه:</label>
                  <select
                    value={newColType}
                    onChange={(e) => {
                      const t = e.target.value as CollateralType;
                      setNewColType(t);
                      if (t === 'physical_gold_deposit') setNewColHaircut(10);
                      else if (t === 'bank_guarantee') setNewColHaircut(5);
                      else setNewColHaircut(15);
                    }}
                    className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                  >
                    <option value="sayad_cheque">چک صیادی بنفش</option>
                    <option value="bank_guarantee">ضمانت‌نامه بانکی ریالی (LC)</option>
                    <option value="physical_gold_deposit">شمش طلای امانی (خزانه K09)</option>
                    <option value="cash_deposit">سپرده نقدی مسدودشده</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#8E8EA0] block mb-1">عنوان / شرح وثیقه:</label>
                  <input
                    type="text"
                    required
                    value={newColTitle}
                    onChange={(e) => setNewColTitle(e.target.value)}
                    placeholder="مثال: چک صیادی تضمین خرید پاییزه"
                    className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8E8EA0] block mb-1">
                    شناسه صیادی ۱۶ رقمی / شماره ضمانت‌نامه:
                  </label>
                  <input
                    type="text"
                    required
                    value={newColIdentifier}
                    onChange={(e) => setNewColIdentifier(e.target.value)}
                    placeholder="مثال: 7819-2091-8291-0021"
                    className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#8E8EA0] block mb-1">بانک صادرکننده / خزانه:</label>
                  <input
                    type="text"
                    required
                    value={newColBank}
                    onChange={(e) => setNewColBank(e.target.value)}
                    placeholder="بانک ملت - شعبه بازار"
                    className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8E8EA0] block mb-1">ارزش اسمی تضامینی (تومان):</label>
                  <input
                    type="number"
                    step="10000000"
                    required
                    value={newColNominal || ''}
                    onChange={(e) => setNewColNominal(parseInt(e.target.value, 10) || 0)}
                    placeholder="1000000000"
                    className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                  <span className="text-[10px] text-[#A6A6B8] font-mono block mt-0.5">
                    {formatToman(newColNominal)}
                  </span>
                </div>

                <div>
                  <label className="text-[#8E8EA0] block mb-1">ضریب کسر ریسک (Haircut ٪):</label>
                  <input
                    type="number"
                    step="1"
                    value={newColHaircut}
                    onChange={(e) => setNewColHaircut(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                  <span className="text-[10px] text-[#3DD68C] font-mono block mt-0.5">
                    ارزش موثر: {formatToman(Math.round(newColNominal * (1 - newColHaircut / 100)))}
                  </span>
                </div>
              </div>

              {newColType === 'physical_gold_deposit' && (
                <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-[#12121A] border border-[#C8A951]/30">
                  <div>
                    <label className="text-[#8E8EA0] block mb-1">وزن شمش طلا (گرم):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newColWeight || ''}
                      onChange={(e) => setNewColWeight(parseFloat(e.target.value) || 0)}
                      placeholder="1000.0"
                      className="w-full bg-[#1A1A26] border border-[#2A2A3E] rounded px-2.5 py-1.5 text-xs text-[#EDEDED] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[#8E8EA0] block mb-1">عیار شمش طلا:</label>
                    <select
                      value={newColCarat}
                      onChange={(e) => setNewColCarat(parseInt(e.target.value, 10) || 750)}
                      className="w-full bg-[#1A1A26] border border-[#2A2A3E] rounded px-2.5 py-1.5 text-xs text-[#EDEDED] font-mono"
                    >
                      <option value="995">۹۹۵ (شمش استاندارد)</option>
                      <option value="999">۹۹۹.۹ (طلای ۲۴ عیار خالص)</option>
                      <option value="750">۷۵۰ (طلای ۱۸ عیار)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8E8EA0] block mb-1">تاریخ سررسید وثیقه:</label>
                  <input
                    type="text"
                    value={newColMaturityDate}
                    onChange={(e) => setNewColMaturityDate(e.target.value)}
                    className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#8E8EA0] block mb-1">توضیحات و سوابق استعلام:</label>
                  <input
                    type="text"
                    value={newColNotes}
                    onChange={(e) => setNewColNotes(e.target.value)}
                    placeholder="استعلام سامانه صیاد تایید شد"
                    className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#252536]">
                <button
                  type="button"
                  onClick={() => setIsAddCollateralOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-[#222232] text-[#8E8EA0] hover:text-[#EDEDED] text-xs cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D4B65E] text-[#121218] font-bold text-xs cursor-pointer transition-all shadow"
                >
                  ثبت قطعی در خزانه وثایق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Release Collateral Confirmation */}
      {collateralToRelease && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161622] border border-[#2C2C40] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#252536] pb-3">
              <div className="flex items-center gap-2">
                <Unlock className="w-5 h-5 text-[#E5A84B]" />
                <h3 className="font-bold text-sm text-[#EDEDED]">آزادسازی و فک رهن وثیقه</h3>
              </div>
              <button
                onClick={() => setCollateralToRelease(null)}
                className="text-[#8E8EA0] hover:text-[#EDEDED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#C6C6D6] space-y-2.5">
              <p>
                آیا از آزادسازی و استرداد وثیقه{' '}
                <strong className="text-[#EDEDED]">{collateralToRelease.titleFa}</strong> متعلق به{' '}
                <strong className="text-[#E5C365]">{collateralToRelease.buyerOrgNameFa}</strong> اطمینان دارید؟
              </p>
              <div className="bg-[#12121A] p-2.5 rounded-lg border border-[#252536] space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#8E8EA0]">شناسه:</span>
                  <span>{collateralToRelease.identifierNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8EA0]">ارزش موثر مستردشده:</span>
                  <span className="text-[#3DD68C]">{formatToman(collateralToRelease.effectiveValueToman)}</span>
                </div>
              </div>

              <div>
                <label className="text-[#8E8EA0] block mb-1">نام مسئول تاییدکننده آزادسازی:</label>
                <input
                  type="text"
                  value={releaseOfficerInput}
                  onChange={(e) => setReleaseOfficerInput(e.target.value)}
                  className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#252536]">
              <button
                onClick={() => setCollateralToRelease(null)}
                className="px-3.5 py-2 rounded-xl bg-[#222232] text-[#8E8EA0] hover:text-[#EDEDED] text-xs cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleReleaseCollateral}
                className="px-4 py-2 rounded-xl bg-[#E5A84B] hover:bg-[#F0B75D] text-[#121218] font-bold text-xs cursor-pointer transition-all shadow"
              >
                تایید آزادسازی وثیقه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Create Override Request */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161622] border border-[#2C2C40] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#252536] pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#C8A951]" />
                <h3 className="font-bold text-sm text-[#EDEDED]">
                  ثبت درخواست استثنای اعتباری (اصل ۴چشم)
                </h3>
              </div>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="text-[#8E8EA0] hover:text-[#EDEDED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#8E8EA0] block mb-1">طرف تجاری متقاضی:</label>
                <select
                  required
                  value={newOvrBuyerId}
                  onChange={(e) => setNewOvrBuyerId(e.target.value)}
                  className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                >
                  <option value="">-- انتخاب خریدار --</option>
                  {data?.creditProfiles.map((p) => (
                    <option key={p.buyerId} value={p.buyerId}>
                      {p.buyerOrgNameFa} (بهره‌برداری: {p.goldUtilizationPercent}٪ طلا | {p.rialUtilizationPercent}٪ ریال)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#8E8EA0] block mb-1">نوع استثنا:</label>
                <select
                  value={newOvrType}
                  onChange={(e) => setNewOvrType(e.target.value as any)}
                  className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                >
                  <option value="temporary_rial_limit">افزایش موقت سقف ریالی (تومان)</option>
                  <option value="temporary_gold_limit">افزایش موقت سقف وزنی طلا (گرم)</option>
                  <option value="order_force_release">مجوز ترخیص استثنایی سفارش بدون تسویه پیشین</option>
                </select>
              </div>

              <div>
                <label className="text-[#8E8EA0] block mb-1">شرح خلاصه استثنا:</label>
                <input
                  type="text"
                  required
                  value={newOvrAmountText}
                  onChange={(e) => setNewOvrAmountText(e.target.value)}
                  placeholder="مثال: افزایش موقت سقف ریالی به مبلغ ۵۰۰ میلیون تومان"
                  className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                />
              </div>

              {newOvrType === 'temporary_rial_limit' && (
                <div>
                  <label className="text-[#8E8EA0] block mb-1">مبلغ افزایش ریالی (تومان):</label>
                  <input
                    type="number"
                    step="10000000"
                    value={newOvrValueRial || ''}
                    onChange={(e) => setNewOvrValueRial(parseInt(e.target.value, 10) || 0)}
                    placeholder="500000000"
                    className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                  <span className="text-[10px] text-[#A6A6B8] font-mono mt-0.5 block">
                    {formatToman(newOvrValueRial)}
                  </span>
                </div>
              )}

              {newOvrType === 'temporary_gold_limit' && (
                <div>
                  <label className="text-[#8E8EA0] block mb-1">وزن افزایش طلایی (گرم):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newOvrWeightGold || ''}
                    onChange={(e) => setNewOvrWeightGold(parseFloat(e.target.value) || 0)}
                    placeholder="200.0"
                    className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-xs text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  />
                  <span className="text-[10px] text-[#A6A6B8] font-mono mt-0.5 block">
                    {formatGrams(newOvrWeightGold)}
                  </span>
                </div>
              )}

              <div>
                <label className="text-[#8E8EA0] block mb-1">علت توجیهی و مستندات:</label>
                <textarea
                  rows={3}
                  required
                  value={newOvrReason}
                  onChange={(e) => setNewOvrReason(e.target.value)}
                  placeholder="دلایل تجاری، پوشش تضامینی، سابقه تسویه، فوریت سفارش نمایشگاهی..."
                  className="w-full bg-[#12121A] border border-[#2A2A3E] rounded-lg p-2.5 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#252536]">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-[#222232] text-[#8E8EA0] hover:text-[#EDEDED] text-xs cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D4B65E] text-[#121218] font-bold text-xs cursor-pointer transition-all shadow"
                >
                  ارسال به کارتابل مدیر ریسک
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: Buyer Credit Portfolio Detail */}
      {selectedBuyerDetail && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-[#151520] border-r border-[#2C2C40] w-full max-w-lg h-full p-6 space-y-5 overflow-y-auto shadow-2xl animate-slideLeft">
            <div className="flex items-center justify-between border-b border-[#252536] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#C8A951]/20 flex items-center justify-center text-[#E5C365] font-bold text-xs">
                  {selectedBuyerDetail.tier}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[#EDEDED]">{selectedBuyerDetail.buyerOrgNameFa}</h3>
                  <span className="text-[10px] text-[#7A7A8E] font-mono">
                    شناسه ملی: {selectedBuyerDetail.nationalId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBuyerDetail(null)}
                className="p-1 rounded-lg text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#222232]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Status Box */}
              <div className="p-3 rounded-xl bg-[#12121A] border border-[#252536] flex items-center justify-between">
                <div>
                  <span className="text-[#8E8EA0] block text-[10px]">وضعیت دسترسی اعتباری:</span>
                  <span
                    className={`font-bold ${
                      selectedBuyerDetail.status === 'credit_locked'
                        ? 'text-[#FF5C5C]'
                        : selectedBuyerDetail.status === 'warning'
                        ? 'text-[#E5A84B]'
                        : 'text-[#3DD68C]'
                    }`}
                  >
                    {selectedBuyerDetail.status === 'credit_locked'
                      ? 'قفل اعتباری (مسدود)'
                      : selectedBuyerDetail.status === 'warning'
                      ? 'در مرز هشدار اعتباری'
                      : 'فعال و مجاز'}
                  </span>
                </div>
                <div className="text-left font-mono">
                  <span className="text-[#8E8EA0] block text-[10px]">امتیاز اعتباری:</span>
                  <span className="font-bold text-sm text-[#E5C365]">{selectedBuyerDetail.creditScore} / ۱۰۰</span>
                </div>
              </div>

              {selectedBuyerDetail.lockReasonFa && (
                <div className="p-3 rounded-xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 text-[#FF8585] text-xs">
                  <strong>علت قفل:</strong> {selectedBuyerDetail.lockReasonFa}
                </div>
              )}

              {/* Dual Limit Breakdown */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#EDEDED] flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#C8A951]" />
                  سقف و مواجهه دوگانه (Gold & Fiat)
                </h4>

                <div className="p-3 rounded-xl bg-[#181824] border border-[#252536] space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-[#8E8EA0]">سقف وزنی طلا:</span>
                    <strong className="text-[#EDEDED]">{selectedBuyerDetail.goldCreditLimitGrams} گرم ۷۵۰</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#8E8EA0]">مواجهه باز طلایی:</span>
                    <strong className="text-[#E5A84B]">{selectedBuyerDetail.goldExposureGrams} گرم</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#8E8EA0]">مانده اعتبار طلایی:</span>
                    <strong className="text-[#3DD68C]">{selectedBuyerDetail.goldAvailableCreditGrams} گرم</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#181824] border border-[#252536] space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-[#8E8EA0]">سقف اعتبار ریالی:</span>
                    <strong className="text-[#EDEDED]">{formatToman(selectedBuyerDetail.rialCreditLimitToman)}</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#8E8EA0]">مواجهه باز ریالی:</span>
                    <strong className="text-[#E5A84B]">{formatToman(selectedBuyerDetail.rialExposureToman)}</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#8E8EA0]">مانده اعتبار ریالی:</span>
                    <strong className="text-[#3DD68C]">{formatToman(selectedBuyerDetail.rialAvailableCreditToman)}</strong>
                  </div>
                </div>
              </div>

              {/* Collateral Coverage Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#EDEDED] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#3DD68C]" />
                  پوشش تضامین و وثایق تودیع‌شده
                </h4>

                <div className="p-3 rounded-xl bg-[#181824] border border-[#252536] space-y-2">
                  <div className="flex justify-between font-mono">
                    <span className="text-[#8E8EA0]">کل ارزش اسمی وثایق:</span>
                    <span className="text-[#EDEDED]">{formatToman(selectedBuyerDetail.collateralTotalNominalToman)}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#8E8EA0]">ارزش موثر پس از Haircut:</span>
                    <span className="text-[#C8A951] font-bold">
                      {formatToman(selectedBuyerDetail.collateralEffectiveValueToman)}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[#8E8EA0]">نسبت پوشش ریسک:</span>
                    <strong
                      className={
                        selectedBuyerDetail.collateralCoveragePercent >= 120
                          ? 'text-[#3DD68C]'
                          : 'text-[#E5A84B]'
                      }
                    >
                      {selectedBuyerDetail.collateralCoveragePercent}٪
                    </strong>
                  </div>
                </div>
              </div>

              {/* Responsible Officer */}
              <div className="p-3 rounded-xl bg-[#12121A] border border-[#222232] space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#8E8EA0]">کارشناس ارزیاب اعتباری:</span>
                  <span className="text-[#EDEDED] font-medium">{selectedBuyerDetail.creditOfficerFa}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#8E8EA0]">تاریخ آخرین بازنگری:</span>
                  <span className="text-[#A6A6B8]">{selectedBuyerDetail.lastReviewDateFa}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#8E8EA0]">موعد بازنگری دوره‌ای بعدی:</span>
                  <span className="text-[#C8A951]">{selectedBuyerDetail.nextReviewDateFa}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
