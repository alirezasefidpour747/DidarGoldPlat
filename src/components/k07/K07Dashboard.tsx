/**
 * Didar Gold Platform - Kernel Domain K07 Dashboard
 * Supplier Partnership Lifecycle: Workshops, Consignment Agreements, Collateral & Performance KPIs
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Scale,
  ShieldCheck,
  Award,
  Clock,
  FileText,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Eye,
  ExternalLink,
  Layers,
  Flame,
  FileCheck
} from 'lucide-react';
import {
  K07DataPayload,
  SupplierPartnership,
  PartnershipAgreement,
  SupplierCollateral,
  QualityAuditRecord,
  PartnershipStatus,
  SupplierType,
  AgreementStatus
} from '../../types/k07.js';
import { api } from '../../lib/api.js';
import { NewSupplierModal } from './NewSupplierModal.js';
import { NewContractModal } from './NewContractModal.js';
import { AddCollateralModal } from './AddCollateralModal.js';
import { AuditEvaluationModal } from './AuditEvaluationModal.js';
import { SupplierProfileDrawer } from './SupplierProfileDrawer.js';

export const K07Dashboard: React.FC = () => {
  const [data, setData] = useState<K07DataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab & Filters State
  const [activeTab, setActiveTab] = useState<'suppliers' | 'agreements' | 'collaterals' | 'audits'>('suppliers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals & Drawers
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [isAddCollateralOpen, setIsAddCollateralOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedSupplierForModal, setSelectedSupplierForModal] = useState<string | undefined>(undefined);
  const [selectedSupplierForDrawer, setSelectedSupplierForDrawer] = useState<SupplierPartnership | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = await api.getK07Data();
      setData(payload);
      if (selectedSupplierForDrawer) {
        const updated = payload.suppliers.find((s) => s.id === selectedSupplierForDrawer.id);
        if (updated) setSelectedSupplierForDrawer(updated);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در برقراری ارتباط با هسته K07');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleCreateSupplier = async (payload: Partial<SupplierPartnership>) => {
    await api.createSupplier(payload);
    await loadData();
  };

  const handleCreateAgreement = async (payload: Partial<PartnershipAgreement>) => {
    await api.createAgreement(payload);
    await loadData();
  };

  const handleRegisterCollateral = async (payload: Partial<SupplierCollateral>) => {
    await api.registerCollateral(payload);
    await loadData();
  };

  const handleRecordAudit = async (payload: Partial<QualityAuditRecord>) => {
    await api.recordQualityAudit(payload);
    await loadData();
  };

  const handleChangeStatus = async (id: string, status: PartnershipStatus, reason: string) => {
    await api.changeSupplierStatus(id, status, reason);
    await loadData();
  };

  const handleAdjustConsignmentLimit = async (id: string, limitGrams: number) => {
    await api.adjustConsignmentLimit(id, limitGrams);
    await loadData();
  };

  const handleVerifyCollateral = async (
    id: string,
    verificationStatus: 'verified' | 'pending_inquiry' | 'rejected',
    notes: string
  ) => {
    await api.verifyCollateral(id, verificationStatus, notes);
    await loadData();
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-[#C8A951] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#8E8E9F]">در حال بارگذاری داده‌های چرخه شراکت تأمین‌کنندگان طلا (K07)...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center bg-[#151520] border border-red-500/30 rounded-2xl max-w-xl mx-auto my-12 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-base font-bold text-white">خطا در بارگذاری هسته K07</h3>
        <p className="text-xs text-[#A0A0B5]">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-[#C8A951] text-[#141416] font-bold rounded-xl text-xs"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const suppliers = data?.suppliers || [];
  const agreements = data?.agreements || [];
  const collaterals = data?.collaterals || [];
  const audits = data?.audits || [];
  const metrics = data?.metrics;

  // Filtered Suppliers
  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      searchQuery === '' ||
      s.nameFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.commercialBrandFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.supplierCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hallmarkCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cityFa.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesType = typeFilter === 'all' || s.supplierType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalUtilizationRatio =
    metrics && metrics.totalConsignmentQuotaGrams > 0
      ? Math.round((metrics.totalUtilizedConsignmentGrams / metrics.totalConsignmentQuotaGrams) * 100)
      : 0;

  const totalCollateralCoverage =
    metrics && metrics.totalUtilizedConsignmentGrams > 0
      ? Math.round(
          (metrics.totalCollateralGoldEquivalentGrams / metrics.totalUtilizedConsignmentGrams) * 100
        )
      : 180;

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#171724] via-[#14141E] to-[#12121A] border border-[#262638] shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/30">
              KERNEL K07
            </span>
            <span className="text-xs text-[#8E8E9F]">Supplier Partnership Lifecycle & Workshop Trust Quotas</span>
          </div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <span>مدیریت زنجیره تأمین، کارخانجات و کارگاه‌های طلاسازی</span>
          </h1>
          <p className="text-xs text-[#A0A0B5] max-w-3xl leading-relaxed">
            مدیریت قراردادهای امانی شمش طلا، ثبت و اعتبارسنجی وثایق زرگری (چک‌های صیادی بنفش، شمش در خزانه، ضمانت‌نامه‌ها)، ممیزی کیفی و نظارت بر کد انگ ری‌گیری رسمی.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNewSupplierOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#C8A951]/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>پذیرش کارگاه جدید</span>
          </button>
          <button
            onClick={() => {
              setSelectedSupplierForModal(undefined);
              setIsNewContractOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[#1D1D2B] hover:bg-[#252536] text-white text-xs font-semibold flex items-center gap-1.5 border border-[#2F2F44] transition-all"
          >
            <FileText className="w-4 h-4 text-[#C8A951]" />
            <span>انعقاد قرارداد امانی</span>
          </button>
          <button
            onClick={() => {
              setSelectedSupplierForModal(undefined);
              setIsAddCollateralOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[#1D1D2B] hover:bg-[#252536] text-white text-xs font-semibold flex items-center gap-1.5 border border-[#2F2F44] transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-[#C8A951]" />
            <span>ثبت وثیقه زرگری</span>
          </button>
          <button
            onClick={() => {
              setSelectedSupplierForModal(undefined);
              setIsAuditModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[#1D1D2B] hover:bg-[#252536] text-white text-xs font-semibold flex items-center gap-1.5 border border-[#2F2F44] transition-all"
          >
            <Award className="w-4 h-4 text-[#C8A951]" />
            <span>ممیزی کیفی</span>
          </button>
          <button
            onClick={loadData}
            title="تازه‌سازی اطلاعات"
            className="p-2.5 rounded-xl bg-[#1A1A26] hover:bg-[#232332] text-[#8E8E9F] hover:text-white border border-[#28283C] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Suppliers Count */}
        <div className="p-4 rounded-2xl bg-[#151520] border border-[#252538] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8E8E9F]">کارخانجات و کارگاه‌ها</span>
            <div className="w-8 h-8 rounded-xl bg-[#C8A951]/15 text-[#E5C365] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {metrics?.totalSuppliersCount || 0}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              ({metrics?.activeSuppliersCount || 0} فعال و متصل)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-[#6E6E82]">
            <span>تحت ارزیابی: {metrics?.underEvaluationCount || 0}</span>
            <span>•</span>
            <span>مشروط / تحت پایش: {metrics?.onProbationOrSuspendedCount || 0}</span>
          </div>
        </div>

        {/* Card 2: Consignment Gold Quota */}
        <div className="p-4 rounded-2xl bg-[#151520] border border-[#252538] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8E8E9F]">سقف طلای امانی تخصیصی</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#E5C365]">
              {(metrics?.totalConsignmentQuotaGrams || 0).toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-[#8E8E9F]">گرم طلای ۱۸ عیار</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[#8E8E9F]">
            <span>
              در گردش: <strong className="text-white font-mono">{(metrics?.totalUtilizedConsignmentGrams || 0).toLocaleString('fa-IR')} گرم</strong>
            </span>
            <span className="text-amber-400 font-bold font-mono">
              ({totalUtilizationRatio}٪ بهره‌برداری)
            </span>
          </div>
        </div>

        {/* Card 3: Collateral Gold Equivalent & Coverage */}
        <div className="p-4 rounded-2xl bg-[#151520] border border-[#252538] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8E8E9F]">ارزش تضامین زرگری (معادل طلا)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {(metrics?.totalCollateralGoldEquivalentGrams || 0).toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-[#8E8E9F]">گرم وثیقه قطعی</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>پوشش وثیقه‌ای: {totalCollateralCoverage}٪ سقف در گردش</span>
          </div>
        </div>

        {/* Card 4: Quality & On-time Delivery */}
        <div className="p-4 rounded-2xl bg-[#151520] border border-[#252538] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8E8E9F]">نرخ قبولی کیفی و تحویل</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {metrics?.averageQcPassRate || 0}٪
            </span>
            <span className="text-xs text-[#8E8E9F]">قبولی استاندارد</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[#8E8E9F]">
            <span>
              تحویل به‌موقع: <strong className="text-emerald-400 font-mono">{metrics?.averageOnTimeDelivery || 0}٪</strong>
            </span>
            <span className="text-sky-400">بدون مغایرت عیار</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262638] pb-3">
        <div className="flex items-center gap-1 bg-[#14141E] p-1 rounded-xl border border-[#232332]">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'suppliers'
                ? 'bg-[#C8A951] text-[#141416] font-bold shadow-md'
                : 'text-[#8E8E9F] hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>کارگاه‌ها و تولیدکنندگان</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {suppliers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('agreements')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'agreements'
                ? 'bg-[#C8A951] text-[#141416] font-bold shadow-md'
                : 'text-[#8E8E9F] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>قراردادهای امانی</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {agreements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('collaterals')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'collaterals'
                ? 'bg-[#C8A951] text-[#141416] font-bold shadow-md'
                : 'text-[#8E8E9F] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>پورتفوی وثایق و تضامین</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {collaterals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audits')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'audits'
                ? 'bg-[#C8A951] text-[#141416] font-bold shadow-md'
                : 'text-[#8E8E9F] hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>کارنامه ممیزی‌های کیفی</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {audits.length}
            </span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-[#6E6E82]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو نام، برند، شهر یا کد انگ..."
              className="pl-3 pr-8 py-1.5 bg-[#14141E] border border-[#262638] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951] w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#14141E] border border-[#262638] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال و معتبر</option>
            <option value="on_probation">تحت پایش و نظارت</option>
            <option value="under_evaluation">در حال ارزیابی</option>
            <option value="suspended">معلق‌شده</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#14141E] border border-[#262638] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
          >
            <option value="all">همه انواع کارگاه</option>
            <option value="industrial_factory">کارخانه صنعتی</option>
            <option value="casting_foundry">ریخته‌گری موم گمشده</option>
            <option value="cnc_laser">برش لیزری و سبک</option>
            <option value="stone_setting">مرصع‌کاری و نگین</option>
          </select>
        </div>
      </div>

      {/* TAB 1: SUPPLIERS DIRECTORY */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => {
              const utilPct =
                supplier.totalConsignmentLimitGrams > 0
                  ? Math.round(
                      (supplier.currentConsignmentUtilizedGrams /
                        supplier.totalConsignmentLimitGrams) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={supplier.id}
                  className="p-5 rounded-2xl bg-[#151520] border border-[#242436] hover:border-[#C8A951]/40 transition-all flex flex-col justify-between space-y-4 shadow-sm group cursor-pointer"
                  onClick={() => setSelectedSupplierForDrawer(supplier)}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#C8A951]/20 border border-[#C8A951]/40 text-[#E5C365] flex items-center justify-center font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white group-hover:text-[#E5C365] transition-colors line-clamp-1">
                            {supplier.nameFa}
                          </h3>
                          <span className="text-[11px] text-[#C8A951] font-semibold">
                            {supplier.commercialBrandFa}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          supplier.grade === 'A_PLUS'
                            ? 'bg-[#C8A951]/20 text-[#E5C365]'
                            : supplier.grade === 'A'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-[#262638] text-[#8E8E9F]'
                        }`}
                      >
                        {supplier.grade}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[11px] text-[#8E8E9F]">
                      <span>{supplier.cityFa}</span>
                      <span>•</span>
                      <span className="font-mono text-white">کد انگ: {supplier.hallmarkCode}</span>
                      <span>•</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] ${
                          supplier.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : supplier.status === 'on_probation'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {supplier.statusFa}
                      </span>
                    </div>

                    {/* Consignment Gold Gauge */}
                    <div className="mt-4 p-3 rounded-xl bg-[#11111A] border border-[#20202E] space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8E8E9F]">طلای امانی در گردش:</span>
                        <span className="text-white font-mono font-bold">
                          {supplier.currentConsignmentUtilizedGrams.toLocaleString('fa-IR')} / {supplier.totalConsignmentLimitGrams.toLocaleString('fa-IR')} گرم
                        </span>
                      </div>
                      <div className="w-full bg-[#202030] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            utilPct > 90
                              ? 'bg-red-500'
                              : utilPct > 75
                              ? 'bg-amber-400'
                              : 'bg-[#C8A951]'
                          }`}
                          style={{ width: `${Math.min(100, utilPct)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#6E6E82]">
                        <span>بهره‌برداری: {utilPct}٪</span>
                        <span className="text-emerald-400">
                          مانده: {supplier.availableConsignmentGrams.toLocaleString('fa-IR')} گرم
                        </span>
                      </div>
                    </div>

                    {/* Quick KPIs */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 rounded-lg bg-[#11111A] text-[#8E8E9F]">
                        <span>کیفیت QC:</span>{' '}
                        <strong className="text-white font-mono">
                          {supplier.kpi.qcFirstPassRate}٪
                        </strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#11111A] text-[#8E8E9F]">
                        <span>تحویل به‌موقع:</span>{' '}
                        <strong className="text-emerald-400 font-mono">
                          {supplier.kpi.onTimeDeliveryRate}٪
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#20202E] flex items-center justify-between text-xs">
                    <span className="text-[#8E8E9F] text-[11px]">
                      {supplier.activeAgreementsCount} قرارداد فعال
                    </span>
                    <span className="text-[#E5C365] font-semibold text-[11px] flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                      <span>مشاهده پرونده کامل</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-[#151520] border border-[#242436] text-xs text-[#8E8E9F]">
              هیچ کارگاه یا تأمین‌کننده‌ای با این مشخصات یافت نشد.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AGREEMENTS PORTFOLIO */}
      {activeTab === 'agreements' && (
        <div className="rounded-2xl bg-[#151520] border border-[#242436] overflow-hidden">
          <div className="p-4 border-b border-[#20202E] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C8A951]" />
              <span>قراردادهای امانی طلا، ترهین و پیمانکاری ساخت</span>
            </h3>
            <button
              onClick={() => setIsNewContractOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#C8A951] text-[#141416] text-xs font-bold flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>انعقاد قرارداد جدید</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#11111A] text-[#8E8E9F] border-b border-[#20202E]">
                <tr>
                  <th className="p-3.5">شماره قرارداد</th>
                  <th className="p-3.5">کارگاه طرف قرارداد</th>
                  <th className="p-3.5">ماهیت قرارداد</th>
                  <th className="p-3.5">سقف طلای امانی</th>
                  <th className="p-3.5">مهلت تحویل</th>
                  <th className="p-3.5">کسر بار مجاز</th>
                  <th className="p-3.5">فرمول اجرت</th>
                  <th className="p-3.5">بازه اعتبار</th>
                  <th className="p-3.5">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20202E]">
                {agreements.map((agr) => (
                  <tr key={agr.id} className="hover:bg-[#181826] transition-colors">
                    <td className="p-3.5 font-mono text-white font-bold">{agr.agreementNumber}</td>
                    <td className="p-3.5 font-medium text-white">{agr.supplierNameFa}</td>
                    <td className="p-3.5 text-[#E5C365]">{agr.agreementTypeFa}</td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      {agr.consignmentLimitGrams.toLocaleString('fa-IR')} گرم
                    </td>
                    <td className="p-3.5 font-mono text-white">{agr.maxDeliveryLeadDays} روز</td>
                    <td className="p-3.5 font-mono text-white">{agr.allowableKasriPercent}٪</td>
                    <td className="p-3.5 text-[#A0A0B5] max-w-xs truncate" title={agr.makingChargeFormulaFa}>
                      {agr.makingChargeFormulaFa}
                    </td>
                    <td className="p-3.5 font-mono text-[#8E8E9F]">
                      {agr.startDateFa} تا {agr.endDateFa}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          agr.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {agr.statusFa}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COLLATERALS PORTFOLIO */}
      {activeTab === 'collaterals' && (
        <div className="rounded-2xl bg-[#151520] border border-[#242436] overflow-hidden">
          <div className="p-4 border-b border-[#20202E] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C8A951]" />
                <span>پورتفوی وثایق و تضامین زرگری (چک صیادی، شمش در خزانه، ضمانت‌نامه)</span>
              </h3>
              <span className="text-[10px] text-[#8E8E9F] mt-0.5 block">
                مجموع معادل طلا: {(metrics?.totalCollateralGoldEquivalentGrams || 0).toLocaleString('fa-IR')} گرم طلا
              </span>
            </div>
            <button
              onClick={() => setIsAddCollateralOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#C8A951] text-[#141416] text-xs font-bold flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ثبت وثیقه جدید</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#11111A] text-[#8E8E9F] border-b border-[#20202E]">
                <tr>
                  <th className="p-3.5">کد وثیقه</th>
                  <th className="p-3.5">کارگاه تودیع‌کننده</th>
                  <th className="p-3.5">نوع وثیقه</th>
                  <th className="p-3.5">ارزش اسمی ریالی</th>
                  <th className="p-3.5">معادل طلا</th>
                  <th className="p-3.5">مرجع صدور / بانک</th>
                  <th className="p-3.5">شماره پیگیری / صیاد</th>
                  <th className="p-3.5">سررسید</th>
                  <th className="p-3.5">وضعیت استعلام</th>
                  <th className="p-3.5">اقدام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20202E]">
                {collaterals.map((col) => (
                  <tr key={col.id} className="hover:bg-[#181826] transition-colors">
                    <td className="p-3.5 font-mono text-white font-bold">{col.collateralCode}</td>
                    <td className="p-3.5 font-medium text-white">{col.supplierNameFa}</td>
                    <td className="p-3.5 text-[#E5C365]">{col.collateralTypeFa}</td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      {col.nominalValueToman.toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-3.5 font-mono text-[#E5C365] font-bold">
                      {col.equivalentGoldGrams.toLocaleString('fa-IR')} گرم
                    </td>
                    <td className="p-3.5 text-[#A0A0B5] truncate max-w-[140px]" title={col.issuingBankOrNotaryFa}>
                      {col.issuingBankOrNotaryFa}
                    </td>
                    <td className="p-3.5 font-mono text-white text-[11px]">{col.trackingReferenceNumber}</td>
                    <td className="p-3.5 font-mono text-[#8E8E9F]">{col.expiryDateFa}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          col.verificationStatus === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : col.verificationStatus === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {col.verificationStatusFa}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {col.verificationStatus !== 'verified' && (
                        <button
                          onClick={() => handleVerifyCollateral(col.id, 'verified', 'تأیید استعلام')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                        >
                          تأیید
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: QUALITY AUDITS */}
      {activeTab === 'audits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C8A951]" />
              <span>نتایج آزمون‌های متالورژی، ری‌گیری و ممیزی‌های کارگاهی</span>
            </h3>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#C8A951] text-[#141416] text-xs font-bold flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ثبت ممیزی جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audits.map((aud) => (
              <div
                key={aud.id}
                className="p-5 rounded-2xl bg-[#151520] border border-[#242436] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{aud.supplierNameFa}</h4>
                    <span className="text-[10px] text-[#8E8E9F] font-mono mt-0.5 block">
                      تاریخ ممیزی: {aud.auditDateFa}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold font-mono px-2.5 py-0.5 rounded-lg ${
                      aud.score >= 95
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : aud.score >= 90
                        ? 'bg-[#C8A951]/20 text-[#E5C365]'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {aud.score} / ۱۰۰
                  </span>
                </div>

                <p className="text-xs text-[#C5C5D8] bg-[#11111A] p-3 rounded-xl leading-relaxed">
                  <strong className="text-[#8E8E9F] block text-[10px] mb-1">مشاهدات فنی و ری‌گیری:</strong>
                  {aud.findingsFa}
                </p>

                {aud.recommendationsFa && (
                  <p className="text-[11px] text-[#8E8E9F]">
                    <strong className="text-[#C8A951]">توصیه ممیز: </strong>
                    {aud.recommendationsFa}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-[#6E6E82] pt-2 border-t border-[#20202E]">
                  <span>سرارزیاب: {aud.auditorName}</span>
                  <span>ممیزی بعدی: {aud.nextAuditDateFa}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <NewSupplierModal
        isOpen={isNewSupplierOpen}
        onClose={() => setIsNewSupplierOpen(false)}
        onSave={handleCreateSupplier}
      />

      <NewContractModal
        isOpen={isNewContractOpen}
        suppliers={suppliers}
        preselectedSupplierId={selectedSupplierForModal}
        onClose={() => setIsNewContractOpen(false)}
        onSave={handleCreateAgreement}
      />

      <AddCollateralModal
        isOpen={isAddCollateralOpen}
        suppliers={suppliers}
        preselectedSupplierId={selectedSupplierForModal}
        onClose={() => setIsAddCollateralOpen(false)}
        onSave={handleRegisterCollateral}
      />

      <AuditEvaluationModal
        isOpen={isAuditModalOpen}
        suppliers={suppliers}
        preselectedSupplierId={selectedSupplierForModal}
        onClose={() => setIsAuditModalOpen(false)}
        onSave={handleRecordAudit}
      />

      <SupplierProfileDrawer
        supplier={selectedSupplierForDrawer}
        agreements={agreements}
        collaterals={collaterals}
        audits={audits}
        onClose={() => setSelectedSupplierForDrawer(null)}
        onChangeStatus={handleChangeStatus}
        onAdjustConsignmentLimit={handleAdjustConsignmentLimit}
        onVerifyCollateral={handleVerifyCollateral}
        onOpenNewContract={(supId) => {
          setSelectedSupplierForModal(supId);
          setIsNewContractOpen(true);
        }}
        onOpenAddCollateral={(supId) => {
          setSelectedSupplierForModal(supId);
          setIsAddCollateralOpen(true);
        }}
        onOpenRecordAudit={(supId) => {
          setSelectedSupplierForModal(supId);
          setIsAuditModalOpen(true);
        }}
      />
    </div>
  );
};
