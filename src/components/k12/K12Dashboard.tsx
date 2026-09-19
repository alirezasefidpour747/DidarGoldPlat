/**
 * Didar Gold Platform - Kernel Domain K12 Dashboard
 * Agents, Territories & Field Operations (عامل، قلمرو و عملیات میدانی)
 * 
 * Unified Dark Luxury Gold Theme (#161622, #151520, #191926, #28283C, #C8A951, #E5C365)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  MapPin,
  Calendar,
  Briefcase,
  Navigation,
  ShoppingCart,
  ShieldCheck,
  Radio,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Scale,
  Award,
  Store,
  Compass,
  FileCheck,
  Receipt,
  XCircle,
  FileText,
  User,
  ShoppingBag,
  PackageCheck,
  Power,
  PowerOff
} from 'lucide-react';
import {
  K12DataPayload,
  FieldAgent,
  Territory,
  FieldVisit,
  MobileShowcaseItem,
  ProxyOrderDraft,
  AgentDutyStatus,
  VisitStatus
} from '../../types/k12.js';
import { api } from '../../lib/api.js';
import { NewAgentModal } from './NewAgentModal.js';
import { ScheduleVisitModal } from './ScheduleVisitModal.js';
import { CheckInModal } from './CheckInModal.js';
import { CompleteVisitModal } from './CompleteVisitModal.js';
import { ProxyOrderModal } from './ProxyOrderModal.js';
import { AgentDetailDrawer } from './AgentDetailDrawer.js';
import { NewTerritoryModal } from './NewTerritoryModal.js';
import { AddStoreModal } from './AddStoreModal.js';
import { RecordVisitOutcomeModal } from './RecordVisitOutcomeModal.js';

export const K12Dashboard: React.FC = () => {
  const [data, setData] = useState<K12DataPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visits' | 'agents' | 'territories' | 'showcase'>('visits');

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerritoryFilter, setSelectedTerritoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedAttendanceFilter, setSelectedAttendanceFilter] = useState<string>('all');
  const [selectedInvoiceFilter, setSelectedInvoiceFilter] = useState<string>('all');
  const [selectedAgentRoleFilter, setSelectedAgentRoleFilter] = useState<string>('all');
  const [selectedAgentActiveFilter, setSelectedAgentActiveFilter] = useState<string>('all');

  // Modals state
  const [isNewAgentOpen, setIsNewAgentOpen] = useState(false);
  const [isNewTerritoryOpen, setIsNewTerritoryOpen] = useState(false);
  const [isScheduleVisitOpen, setIsScheduleVisitOpen] = useState(false);
  const [scheduledTargetStoreId, setScheduledTargetStoreId] = useState<string | undefined>(undefined);
  const [addStoreTargetTerritory, setAddStoreTargetTerritory] = useState<Territory | null>(null);
  const [recordOutcomeTargetVisit, setRecordOutcomeTargetVisit] = useState<FieldVisit | null>(null);
  const [checkInTargetVisit, setCheckInTargetVisit] = useState<FieldVisit | null>(null);
  const [completeTargetVisit, setCompleteTargetVisit] = useState<FieldVisit | null>(null);
  const [proxyTargetVisit, setProxyTargetVisit] = useState<FieldVisit | null>(null);
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<FieldAgent | null>(null);

  // Notification banner
  const [bannerNotice, setBannerNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showBanner = (text: string, type: 'success' | 'error' = 'success') => {
    setBannerNotice({ text, type });
    setTimeout(() => setBannerNotice(null), 4000);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getK12Data();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'خطا در برقراری ارتباط با سرویس K12');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Sub-actions
  const handleCreateAgent = async (agentData: Partial<FieldAgent>) => {
    await api.createAgent(agentData);
    showBanner('پرونده مأمور میدانی با موفقیت در سامانه ثبت گردید.');
    await loadData();
  };

  const handleCreateTerritory = async (territoryData: Partial<Territory>) => {
    await api.createTerritory(territoryData);
    showBanner('قلمرو و خوشه جدید راسته بازار طلا با موفقیت تعریف و فعال گردید.');
    await loadData();
  };

  const handleUpdateAgentStatus = async (agentId: string, status: AgentDutyStatus) => {
    const updated = await api.updateAgentStatus(agentId, status);
    if (selectedAgentDetail && selectedAgentDetail.id === agentId) {
      setSelectedAgentDetail(updated);
    }
    showBanner(`وضعیت شیفت به «${updated.dutyStatusFa}» تغییر یافت.`);
    await loadData();
  };

  const handleAssignAgentTerritory = async (agentId: string, territoryId: string) => {
    const updated = await api.assignAgentTerritory(agentId, territoryId);
    if (selectedAgentDetail && selectedAgentDetail.id === agentId) {
      setSelectedAgentDetail(updated);
    }
    showBanner(`قلمرو مأمور به «${updated.assignedTerritoryNameFa}» با موفقیت تغییر یافت.`);
    await loadData();
  };

  const handleToggleAgentActive = async (agentId: string, isActive?: boolean) => {
    const updated = await api.toggleAgentActive(agentId, isActive);
    if (selectedAgentDetail && selectedAgentDetail.id === agentId) {
      setSelectedAgentDetail(updated);
    }
    showBanner(updated.isActive ? 'مأمور با موفقیت فعال شد.' : 'مأمور به حالت غیرفعال تغییر یافت.');
    await loadData();
  };

  const handleScheduleVisit = async (visitData: Partial<FieldVisit>) => {
    await api.scheduleVisit(visitData);
    showBanner('مأموریت ویزیت جدید با موفقیت در جدول زمان‌بندی گشت ثبت شد.');
    await loadData();
  };

  const handleConfirmCheckIn = async (visitId: string, lat: number, lng: number, distanceMeters: number) => {
    await api.checkInVisit(visitId, lat, lng, distanceMeters);
    showBanner('حضور مأمور با تأیید موقعیت مکانی GPS (ژئوفنسینگ) ثبت گردید.');
    await loadData();
  };

  const handleCompleteVisit = async (
    visitId: string,
    outcome: {
      retailerFeedbackScore: number;
      retailerNotesFa: string;
      agentOutcomeNotesFa: string;
      showcaseInterestLevel: 'very_high' | 'high' | 'neutral' | 'low';
      carriedBagSealIntact: boolean;
    }
  ) => {
    await api.completeVisit(visitId, outcome);
    showBanner('صورتجلسه و پایان ویزیت با موفقیت ثبت شد.');
    await loadData();
  };

  const handleSubmitProxyOrder = async (draft: ProxyOrderDraft) => {
    const res = await api.submitProxyOrder(draft);
    showBanner(`سفارش نیابتی با کد رهگیری ${res.proxyOrderId} و تاییدیه OTP صادر شد.`);
    await loadData();
  };

  const handleAddStoreToTerritory = async (territoryId: string, storeData: any) => {
    await api.addStoreToTerritory(territoryId, storeData);
    showBanner('فروشگاه جدید با موفقیت به قلمرو افزوده شد و آماده برنامه‌ریزی ویزیت گردید.');
    await loadData();
  };

  const handleRecordVisitOutcome = async (
    visitId: string,
    outcome: {
      attendance: 'visited' | 'not_visited';
      invoiceStatus: 'invoiced' | 'no_invoice';
      invoiceNumber?: string;
      invoiceGoldGrams?: number;
      noInvoiceReasonFa?: string;
      notVisitedReasonFa?: string;
      agentNotesFa?: string;
    }
  ) => {
    await api.recordVisitOutcome(visitId, outcome);
    showBanner('وضعیت مراجعه مأمور (رفت/نرفت) و تطبیق فاکتور با موفقیت در زنجیره ثبت شد.');
    await loadData();
  };

  // Filtered Visits
  const filteredVisits = useMemo(() => {
    if (!data?.visits) return [];
    return data.visits.filter(v => {
      const matchSearch =
        v.retailerTradeNameFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.retailerOwnerFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.agentNameFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.visitCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchTerritory =
        selectedTerritoryFilter === 'all' || v.territoryId === selectedTerritoryFilter;

      const matchStatus =
        selectedStatusFilter === 'all' || v.status === selectedStatusFilter;

      const matchAttendance =
        selectedAttendanceFilter === 'all' || v.attendanceStatus === selectedAttendanceFilter;

      const matchInvoice =
        selectedInvoiceFilter === 'all' || v.invoiceStatus === selectedInvoiceFilter;

      return matchSearch && matchTerritory && matchStatus && matchAttendance && matchInvoice;
    });
  }, [data?.visits, searchTerm, selectedTerritoryFilter, selectedStatusFilter, selectedAttendanceFilter, selectedInvoiceFilter]);

  // Filtered Agents
  const filteredAgents = useMemo(() => {
    if (!data?.agents) return [];
    return data.agents.filter(a => {
      const matchSearch =
        a.fullNameFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.assignedTerritoryNameFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.roleFa && a.roleFa.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchTerritory =
        selectedTerritoryFilter === 'all' || a.assignedTerritoryId === selectedTerritoryFilter;

      const matchRole =
        selectedAgentRoleFilter === 'all' || a.role === selectedAgentRoleFilter;

      const matchActive =
        selectedAgentActiveFilter === 'all' ||
        (selectedAgentActiveFilter === 'active' && a.isActive !== false) ||
        (selectedAgentActiveFilter === 'inactive' && a.isActive === false);

      return matchSearch && matchTerritory && matchRole && matchActive;
    });
  }, [data?.agents, searchTerm, selectedTerritoryFilter, selectedAgentRoleFilter, selectedAgentActiveFilter]);

  // Visit and Invoice Outcome Analytics
  const visitStats = useMemo(() => {
    if (!data?.visits) return { visited: 0, notVisited: 0, invoiced: 0, noInvoice: 0, totalGoldGrams: 0 };
    let visited = 0;
    let notVisited = 0;
    let invoiced = 0;
    let noInvoice = 0;
    let totalGoldGrams = 0;

    data.visits.forEach(v => {
      if (v.attendanceStatus === 'visited') visited++;
      if (v.attendanceStatus === 'not_visited') notVisited++;
      if (v.invoiceStatus === 'invoiced') {
        invoiced++;
        totalGoldGrams += (v.invoiceGoldGrams || v.proxyOrderGoldGrams || 0);
      }
      if (v.invoiceStatus === 'no_invoice') noInvoice++;
    });

    return { visited, notVisited, invoiced, noInvoice, totalGoldGrams: Math.round(totalGoldGrams * 10) / 10 };
  }, [data?.visits]);

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A951] border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-medium text-[#A0A0B5]">در حال بارگذاری عملیات میدانی و قلمروهای K12...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center" dir="rtl">
        <div className="inline-flex p-3 rounded-full bg-[#E5484D]/15 text-[#FF6B6B] mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">خطا در بارگذاری سامانه K12</h3>
        <p className="text-xs text-[#A0A0B5] max-w-md mx-auto mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const { summary, agents, territories, visits, showcaseItems } = data;

  return (
    <div className="space-y-6 text-[#EDEDED]" dir="rtl">
      
      {/* Top Notification Banner */}
      {bannerNotice && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
          bannerNotice.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            : 'bg-[#E5484D]/15 border-[#E5484D]/30 text-[#FF6B6B]'
        }`}>
          <span className="flex items-center gap-2">
            {bannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            {bannerNotice.text}
          </span>
          <button onClick={() => setBannerNotice(null)} className="text-xs hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {/* Main Domain Header */}
      <div className="bg-[#161622] border border-[#28283C] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C8A951] to-[#997B2E] text-[#141416] flex items-center justify-center shadow-lg font-black text-lg">
            K12
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">
                عامل، قلمرو و عملیات میدانی
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30">
                گشت هوشمند طلا
              </span>
            </div>
            <p className="text-xs text-[#A0A0B5] mt-1">
              پایش مأموران اسکورت، اعزام به راسته بازار، تطابق ژئوفنسینگ و اقدام به نیابت
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsScheduleVisitOpen(true)}
            className="px-3.5 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            زمان‌بندی ویزیت جدید
          </button>

          <button
            onClick={() => setIsNewTerritoryOpen(true)}
            className="px-3.5 py-2 bg-[#191926] hover:bg-[#28283C] border border-[#28283C] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-4 h-4 text-[#C8A951]" />
            تعریف قلمرو جدید
          </button>

          <button
            onClick={() => setIsNewAgentOpen(true)}
            className="px-3.5 py-2 bg-[#191926] hover:bg-[#28283C] border border-[#28283C] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-[#C8A951]" />
            انتصاب مأمور جدید (K01)
          </button>

          <button
            onClick={loadData}
            title="بروزرسانی داده‌ها"
            className="p-2 bg-[#191926] hover:bg-[#28283C] border border-[#28283C] text-[#A0A0B5] hover:text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Field Agents */}
        <div className="bg-[#161622] border border-[#28283C] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-[#A0A0B5]">مأموران در شیفت فعال:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white font-mono">{summary.onDutyAgentsCount + summary.onRouteAgentsCount}</span>
              <span className="text-xs text-[#A0A0B5]">از {summary.totalAgentsCount} مأمور</span>
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{summary.onRouteAgentsCount} نفر در حال تردد در راسته</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#C8A951]/10 text-[#C8A951] flex items-center justify-center border border-[#C8A951]/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Today's Scheduled Visits */}
        <div className="bg-[#161622] border border-[#28283C] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-[#A0A0B5]">ویزیت‌های گشت امروز:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white font-mono">{summary.todayCompletedVisits}</span>
              <span className="text-xs text-[#A0A0B5]">انجام‌شده از {summary.todayScheduledVisits}</span>
            </div>
            <div className="text-[11px] text-[#C8A951]">
              نوبت‌های عصر: {summary.todayScheduledVisits - summary.todayCompletedVisits} ویزیت
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Navigation className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Proxy B2B Orders */}
        <div className="bg-[#161622] border border-[#28283C] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-[#A0A0B5]">سفارش‌های نیابتی (OTP):</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#E5C365] font-mono">{summary.todayProxyGoldWeightGrams.toLocaleString('fa-IR')}</span>
              <span className="text-xs text-[#A0A0B5]">گرم طلا</span>
            </div>
            <div className="text-[11px] text-emerald-400">
              {summary.todayProxyOrdersCount} فاکتور معتبر در محل گالری
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#C8A951]/10 text-[#E5C365] flex items-center justify-center border border-[#C8A951]/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Geofence Compliance */}
        <div className="bg-[#161622] border border-[#28283C] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-[#A0A0B5]">ضریب انطباق ژئوفنسینگ:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-400 font-mono">%{summary.geofenceComplianceRatePercent}</span>
              <span className="text-xs text-[#A0A0B5]">صحت GPS</span>
            </div>
            <div className="text-[11px] text-[#A0A0B5]">
              پوشش {summary.totalTerritoriesCount} قلمرو اصلی کشور
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Operational Lifecycle Status: Attendance & Invoicing Breakdown */}
      <div className="bg-[#161622] border border-[#28283C] rounded-2xl p-4 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C8A951]/10 text-[#C8A951] flex items-center justify-center border border-[#C8A951]/20 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              وضعیت اجرایی حضور مأموران و صدور فاکتور طلا در راسته بازار
            </h3>
            <p className="text-[11px] text-[#A0A0B5] mt-0.5">
              پایش مستقیم مراجعات میدانی (رفت یا نرفت) و ثبت قطعی فاکتور طلای ساخته‌شده یا علل عدم توافق
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Visited (رفت) */}
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[#EDEDED]">مراجعه شد (رفت):</span>
            <strong className="font-mono text-emerald-400 font-bold">{visitStats.visited}</strong>
          </div>

          {/* Not Visited (نرفت) */}
          <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[#EDEDED]">مراجعه نشد (نرفت):</span>
            <strong className="font-mono text-red-400 font-bold">{visitStats.notVisited}</strong>
          </div>

          {/* Invoiced (فاکتور صادر شد) */}
          <div className="px-3 py-1.5 rounded-xl bg-[#C8A951]/15 border border-[#C8A951]/30 text-xs flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-[#E5C365]" />
            <span className="text-[#EDEDED]">فاکتور صادر شده:</span>
            <strong className="font-mono text-[#E5C365] font-bold">{visitStats.invoiced} مورد ({visitStats.totalGoldGrams}g)</strong>
          </div>

          {/* No Invoice (بدون فاکتور) */}
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[#EDEDED]">بدون فاکتور:</span>
            <strong className="font-mono text-amber-400 font-bold">{visitStats.noInvoice}</strong>
          </div>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="bg-[#161622] border border-[#28283C] rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('visits')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'visits'
                ? 'bg-[#C8A951] text-[#141416] shadow-sm'
                : 'text-[#A0A0B5] hover:text-white hover:bg-[#191926]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>ویزیت‌ها و گشت روزانه</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {visits.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('agents')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'agents'
                ? 'bg-[#C8A951] text-[#141416] shadow-sm'
                : 'text-[#A0A0B5] hover:text-white hover:bg-[#191926]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>افسران و مأموران میدانی</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {agents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('territories')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'territories'
                ? 'bg-[#C8A951] text-[#141416] shadow-sm'
                : 'text-[#A0A0B5] hover:text-white hover:bg-[#191926]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>قلمروها و خوشه‌های بازار</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {territories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('showcase')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'showcase'
                ? 'bg-[#C8A951] text-[#141416] shadow-sm'
                : 'text-[#A0A0B5] hover:text-white hover:bg-[#191926]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>ویترین پرتابل و گالری سیار</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {showcaseItems.length}
            </span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#A0A0B5] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجوی طلافروشی، مأمور..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pr-8 pl-3 py-1.5 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-white placeholder-[#828299] focus:ring-1 focus:ring-[#C8A951] w-44"
            />
          </div>

          <select
            value={selectedTerritoryFilter}
            onChange={e => setSelectedTerritoryFilter(e.target.value)}
            className="py-1.5 px-2.5 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-[#EDEDED] focus:ring-1 focus:ring-[#C8A951]"
          >
            <option value="all">همه قلمروها</option>
            {territories.map(t => (
              <option key={t.id} value={t.id}>{t.titleFa}</option>
            ))}
          </select>

          {activeTab === 'visits' && (
            <>
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="py-1.5 px-2.5 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-[#EDEDED] focus:ring-1 focus:ring-[#C8A951]"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="scheduled">برنامه‌ریزی‌شده</option>
                <option value="in_transit">در مسیر</option>
                <option value="checked_in">حاضر در گالری</option>
                <option value="completed">پایان‌یافته</option>
              </select>

              <select
                value={selectedAttendanceFilter}
                onChange={e => setSelectedAttendanceFilter(e.target.value)}
                className="py-1.5 px-2.5 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-[#EDEDED] focus:ring-1 focus:ring-[#C8A951]"
              >
                <option value="all">حضور مأمور: همه</option>
                <option value="visited">مراجعه شد (رفت)</option>
                <option value="not_visited">مراجعه نشد (نرفت)</option>
                <option value="pending">در انتظار نوبت</option>
              </select>

              <select
                value={selectedInvoiceFilter}
                onChange={e => setSelectedInvoiceFilter(e.target.value)}
                className="py-1.5 px-2.5 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-[#EDEDED] focus:ring-1 focus:ring-[#C8A951]"
              >
                <option value="all">وضعیت فاکتور: همه</option>
                <option value="invoiced">فاکتور صادر شده</option>
                <option value="no_invoice">بدون فاکتور</option>
              </select>
            </>
          )}

          {activeTab === 'agents' && (
            <>
              <select
                value={selectedAgentRoleFilter}
                onChange={e => setSelectedAgentRoleFilter(e.target.value)}
                className="py-1.5 px-2.5 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-[#EDEDED] focus:ring-1 focus:ring-[#C8A951]"
              >
                <option value="all">نقش مأمور: همه</option>
                <option value="buyer_rep">مأمور خریدار (ویزیتور)</option>
                <option value="carrier_delivery">مأمور حمل و تحویل کالا</option>
              </select>

              <select
                value={selectedAgentActiveFilter}
                onChange={e => setSelectedAgentActiveFilter(e.target.value)}
                className="py-1.5 px-2.5 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-[#EDEDED] focus:ring-1 focus:ring-[#C8A951]"
              >
                <option value="all">وضعیت فعالیت: همه</option>
                <option value="active">مأموران فعال</option>
                <option value="inactive">مأموران غیرفعال</option>
              </select>
            </>
          )}
        </div>

      </div>

      {/* Tab 1: Visits & Itineraries */}
      {activeTab === 'visits' && (
        <div className="bg-[#161622] border border-[#28283C] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#28283C] bg-[#151520] flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C8A951]" />
              جدول نوبت‌ها و مأموریت‌های گشت میدانی
            </h2>
            <span className="text-xs text-[#A0A0B5]">
              نمایش {filteredVisits.length} مأموریت
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#151520] text-[#A0A0B5] border-b border-[#28283C]">
                <tr>
                  <th className="p-3.5">کد ویزیت</th>
                  <th className="p-3.5">گالری طلافروشی و صاحب جواز</th>
                  <th className="p-3.5">مأمور اعزامی</th>
                  <th className="p-3.5">زمان‌بندی</th>
                  <th className="p-3.5">دستور کار ویزیت</th>
                  <th className="p-3.5 text-center">حضور مأمور (رفت/نرفت)</th>
                  <th className="p-3.5 text-center">وضعیت فاکتور طلا</th>
                  <th className="p-3.5 text-center">وضعیت گشت</th>
                  <th className="p-3.5 text-center">ژئوفنسینگ</th>
                  <th className="p-3.5 text-left">اقدام عملیاتی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#28283C]/50">
                {filteredVisits.map(visit => {
                  const statusColors: Record<VisitStatus, string> = {
                    scheduled: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
                    in_transit: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                    checked_in: 'bg-[#C8A951]/15 text-[#E5C365] border-[#C8A951]/30',
                    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                    missed: 'bg-[#E5484D]/15 text-[#FF6B6B] border-[#E5484D]/30',
                    cancelled: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
                  };

                  return (
                    <tr key={visit.id} className="hover:bg-[#191926]/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#E5C365]">
                        {visit.visitCode}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-[#C8A951]" />
                          {visit.retailerTradeNameFa}
                        </div>
                        <div className="text-[11px] text-[#A0A0B5] mt-0.5">
                          {visit.retailerOwnerFa} — <span className="font-mono text-[#828299]">{visit.retailerUnionCode}</span>
                        </div>
                        <div className="text-[10px] text-[#828299] mt-0.5 truncate max-w-xs">
                          📍 {visit.retailerAddressFa}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-[#EDEDED]">{visit.agentNameFa}</div>
                        <div className="text-[11px] text-[#828299]">{visit.territoryNameFa}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono text-white">{visit.scheduledDateFa}</div>
                        <div className="text-[11px] text-[#A0A0B5] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#C8A951]" />
                          {visit.scheduledTimeSlotFa}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="text-[#EDEDED] font-medium block">
                          {visit.purposeFa}
                        </span>
                        {visit.proxyOrderId && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            🛒 سفارش ثبت شد ({visit.proxyOrderGoldGrams}g طلا)
                          </span>
                        )}
                      </td>

                      {/* Attendance (رفت / نرفت) */}
                      <td className="p-3.5 text-center">
                        {visit.attendanceStatus === 'visited' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            مراجعه شد (رفت)
                          </span>
                        ) : visit.attendanceStatus === 'not_visited' ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                              <XCircle className="w-3.5 h-3.5" />
                              مراجعه نشد (نرفت)
                            </span>
                            {visit.notVisitedReasonFa && (
                              <span className="text-[10px] text-red-300/80 mt-1 max-w-[120px] truncate" title={visit.notVisitedReasonFa}>
                                {visit.notVisitedReasonFa}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#828299]">در انتظار</span>
                        )}
                      </td>

                      {/* Invoice Status (فاکتور طلا) */}
                      <td className="p-3.5 text-center">
                        {visit.invoiceStatus === 'invoiced' ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30">
                              <Receipt className="w-3.5 h-3.5" />
                              فاکتور صادر شد
                            </span>
                            {(visit.invoiceGoldGrams || visit.proxyOrderGoldGrams) ? (
                              <span className="text-[10px] font-mono text-emerald-400 font-bold mt-0.5">
                                {visit.invoiceGoldGrams || visit.proxyOrderGoldGrams} گرم طلا
                              </span>
                            ) : null}
                            {visit.invoiceNumber && (
                              <span className="text-[9px] font-mono text-[#A0A0B5]">
                                {visit.invoiceNumber}
                              </span>
                            )}
                          </div>
                        ) : visit.invoiceStatus === 'no_invoice' ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              بدون فاکتور
                            </span>
                            {visit.noInvoiceReasonFa && (
                              <span className="text-[10px] text-amber-300/80 mt-0.5 max-w-[120px] truncate" title={visit.noInvoiceReasonFa}>
                                {visit.noInvoiceReasonFa}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#828299]">—</span>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColors[visit.status]}`}>
                          {visit.statusFa}
                        </span>
                        {visit.checkInTimeFa && (
                          <div className="text-[10px] text-[#828299] font-mono mt-1">
                            ورود: {visit.checkInTimeFa}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        {visit.isGeofenceVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            تأیید GPS
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#828299]">در انتظار حضور</span>
                        )}
                      </td>

                      <td className="p-3.5 text-left">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Record Outcome Button */}
                          <button
                            onClick={() => setRecordOutcomeTargetVisit(visit)}
                            className="px-2.5 py-1 bg-[#191926] hover:bg-[#28283C] border border-[#C8A951]/40 text-[#E5C365] rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title="تعیین وضعیت رفت یا نرفت مأمور و ثبت فاکتور یا علل عدم صدور فاکتور"
                          >
                            <FileText className="w-3 h-3 text-[#C8A951]" />
                            نتیجه و فاکتور
                          </button>

                          {visit.status === 'scheduled' || visit.status === 'in_transit' ? (
                            <button
                              onClick={() => setCheckInTargetVisit(visit)}
                              className="px-2.5 py-1 bg-[#28283C] hover:bg-[#32324A] text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <Navigation className="w-3 h-3 text-[#C8A951]" />
                              ثبت حضور
                            </button>
                          ) : null}

                          {visit.status === 'checked_in' ? (
                            <>
                              <button
                                onClick={() => setProxyTargetVisit(visit)}
                                className="px-2.5 py-1 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] rounded text-[11px] font-bold transition-colors flex items-center gap-1"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                ثبت سفارش نیابتی
                              </button>
                              <button
                                onClick={() => setCompleteTargetVisit(visit)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                اتمام ویزیت
                              </button>
                            </>
                          ) : null}

                          {visit.status === 'completed' && (
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              خاتمه یافته
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Field Agents */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map(agent => {
            const dutyColors: Record<AgentDutyStatus, string> = {
              on_duty: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
              on_route: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
              checked_in: 'bg-[#C8A951]/15 text-[#E5C365] border-[#C8A951]/30',
              standby: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
              off_duty: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
            };

            return (
              <div
                key={agent.id}
                className="bg-[#161622] border border-[#28283C] hover:border-[#C8A951]/50 rounded-2xl p-4.5 space-y-3.5 shadow-lg transition-all"
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C8A951] to-[#997B2E] text-[#141416] flex items-center justify-center font-bold text-sm shadow shrink-0">
                      {agent.fullNameFa.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {agent.fullNameFa}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-[#A0A0B5]">{agent.code}</span>
                        {agent.partyId && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#1C1C2C] text-[#C8A951] border border-[#C8A951]/20" title="ارجاع به شناسه شخص در K01">
                            K01
                          </span>
                        )}
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${
                          agent.isActive !== false
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}>
                          {agent.isActive !== false ? 'فعال' : 'غیرفعال'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${dutyColors[agent.dutyStatus]}`}>
                    {agent.dutyStatusFa}
                  </span>
                </div>

                {/* Agent Role Badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border font-semibold w-full ${
                    agent.role === 'carrier_delivery'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                      : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25'
                  }`}>
                    {agent.role === 'carrier_delivery' ? (
                      <PackageCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <ShoppingBag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    )}
                    <span className="truncate">
                      {agent.role === 'carrier_delivery'
                        ? 'مأمور حمل و تحویل کالا (کالارسان)'
                        : 'مأمور خریدار (سفارش‌گیری و ویزیت طلا)'}
                    </span>
                  </span>
                </div>

                {/* Territory & Vehicle */}
                <div className="text-xs space-y-1 bg-[#191926] p-2.5 rounded-xl border border-[#28283C]">
                  <p className="text-[#A0A0B5] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C8A951]" />
                    قلمرو: <strong className="text-white">{agent.assignedTerritoryNameFa}</strong>
                  </p>
                  <p className="text-[#828299] text-[11px]">
                    🛵 {agent.vehicleTypeFa}
                  </p>
                </div>

                {/* Smart Custody Bag */}
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#151520] border border-[#28283C]">
                  <span className="text-[#A0A0B5] flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#C8A951]" />
                    کیف هوشمند طلا:
                  </span>
                  <span className="font-mono text-[#E5C365] font-bold">
                    {agent.assignedBagCode} ({agent.assignedBagWeightGrams}g)
                  </span>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 bg-[#191926] rounded-lg border border-[#28283C]">
                    <span className="text-[10px] text-[#828299] block mb-0.5">ضریب موفقیت:</span>
                    <strong className="text-sm font-bold text-white font-mono">%{agent.conversionRatePercent}</strong>
                  </div>
                  <div className="p-2 bg-[#191926] rounded-lg border border-[#28283C]">
                    <span className="text-[10px] text-[#828299] block mb-0.5">سفارش‌های نیابتی:</span>
                    <strong className="text-sm font-bold text-[#3DD68C] font-mono">{agent.totalProxySalesGoldGrams}g</strong>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-[#28283C] flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleToggleAgentActive(agent.id, agent.isActive !== false ? false : true)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold border flex items-center gap-1 transition-colors ${
                      agent.isActive !== false
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                    title={agent.isActive !== false ? 'غیرفعال‌سازی مأمور' : 'فعال‌سازی مجدد مأمور'}
                  >
                    {agent.isActive !== false ? (
                      <>
                        <PowerOff className="w-3 h-3" />
                        <span>غیرفعال</span>
                      </>
                    ) : (
                      <>
                        <Power className="w-3 h-3" />
                        <span>فعال‌سازی</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedAgentDetail(agent)}
                    className="px-2.5 py-1 bg-[#28283C] hover:bg-[#32324A] text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>مدیریت قلمرو و پرونده</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Territories & Market Clusters */}
      {activeTab === 'territories' && (
        <div className="space-y-4">
          {/* Territory Architectural Guide & Action */}
          <div className="bg-[#161622] border border-[#28283C] rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#C8A951]" />
                ماتریس خوشه‌ها و قلمروهای جغرافیایی راسته بازارهای طلا
              </h3>
              <p className="text-xs text-[#A0A0B5] leading-relaxed max-w-3xl">
                در این بخش قلمروهای استراتژیک صنف طلا تعریف می‌شوند. هر قلمرو شامل محدوده جغرافیایی راسته‌های همجوار، مأمور سرپرست اعزامی، سهمیه وزنی ماهانه توزیع طلا، ظرفیت ویزیت روزانه و شعاع ژئوفنسینگ (GPS) جهت تطابق حضور مأموران در گالری‌ها می‌باشد.
              </p>
            </div>
            <button
              onClick={() => setIsNewTerritoryOpen(true)}
              className="px-4 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap self-start md:self-auto shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>تعریف قلمرو و خوشه جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {territories.map(territory => {
            const progressPercent = Math.min(
              100,
              Math.round((territory.achievedMonthlyGoldGrams / territory.monthlyGoldQuotaGrams) * 100)
            );

            return (
              <div
                key={territory.id}
                className="bg-[#161622] border border-[#28283C] rounded-2xl p-5 space-y-4 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#C8A951] bg-[#C8A951]/10 px-2 py-0.5 rounded border border-[#C8A951]/20">
                      {territory.code}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">
                      {territory.titleFa}
                    </h3>
                  </div>
                  <span className="text-xs text-[#A0A0B5]">
                    {territory.provinceFa}
                  </span>
                </div>

                <p className="text-xs text-[#A0A0B5] leading-relaxed bg-[#191926] p-2.5 rounded-xl border border-[#28283C]">
                  راسته‌ها: {territory.marketDistrictsFa}
                </p>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#828299]">مأمور سرپرست قلمرو:</span>
                    <strong className="text-white">{territory.leadAgentNameFa}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#828299]">مأموران اعزامی قلمرو:</span>
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      {agents.filter(a => a.assignedTerritoryId === territory.id).length === 0 ? (
                        <span className="text-[#828299] text-[11px]">بدون مأمور</span>
                      ) : (
                        agents.filter(a => a.assignedTerritoryId === territory.id).map(a => (
                          <button
                            key={a.id}
                            onClick={() => setSelectedAgentDetail(a)}
                            className="px-2 py-0.5 rounded bg-[#191926] hover:bg-[#28283C] text-[10px] text-white border border-[#28283C] flex items-center gap-1 transition-colors"
                            title="مشاهده پرونده مأمور و تغییر قلمرو یا وضعیت"
                          >
                            <User className="w-2.5 h-2.5 text-[#C8A951]" />
                            {a.fullNameFa}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#828299]">طلافروشی‌های فعال:</span>
                    <strong className="font-mono text-white">{territory.activeRetailersCount} گالری</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#828299]">ظرفیت ویزیت روزانه:</span>
                    <strong className="font-mono text-white">{territory.dailyVisitCapacity} مغازه در روز</strong>
                  </div>
                </div>

                {/* Progress toward monthly quota */}
                <div className="space-y-1.5 pt-2 border-t border-[#28283C]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#A0A0B5]">تحقق سهمیه طلای ماهانه:</span>
                    <span className="font-mono font-bold text-[#E5C365]">
                      {territory.achievedMonthlyGoldGrams} / {territory.monthlyGoldQuotaGrams} گرم (%{progressPercent})
                    </span>
                  </div>
                  <div className="w-full bg-[#191926] h-2 rounded-full overflow-hidden border border-[#28283C]">
                    <div
                      className="bg-gradient-to-r from-[#997B2E] to-[#C8A951] h-full rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Stores under coverage in this territory */}
                <div className="pt-3 border-t border-[#28283C] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" />
                      فروشگاه‌های تحت پوشش ({(territory.stores || []).length}):
                    </span>
                    <button
                      onClick={() => setAddStoreTargetTerritory(territory)}
                      className="px-2.5 py-1 bg-[#C8A951]/15 hover:bg-[#C8A951]/25 border border-[#C8A951]/30 text-[#E5C365] rounded text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                      افزودن فروشگاه
                    </button>
                  </div>

                  {/* List of stores */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(territory.stores || []).length === 0 ? (
                      <div className="text-center py-4 text-[11px] text-[#828299] bg-[#191926] rounded-xl border border-dashed border-[#28283C]">
                        هنوز فروشگاهی در این راسته ثبت نشده است. با دکمه بالا فروشگاه جدید اضافه کنید.
                      </div>
                    ) : (
                      (territory.stores || []).map(store => (
                        <div
                          key={store.id}
                          className="bg-[#191926] border border-[#28283C] rounded-xl p-2.5 text-xs space-y-2 hover:border-[#C8A951]/40 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-white text-xs">{store.tradeNameFa}</span>
                            <span className="text-[10px] font-mono text-[#A0A0B5]">{store.unionCode}</span>
                          </div>
                          <div className="text-[11px] text-[#A0A0B5]">
                            مدیریت: <span className="text-white">{store.ownerFa}</span>
                            {store.phone && <span className="mr-2 text-[#828299] font-mono">({store.phone})</span>}
                          </div>

                          {/* Outcome Badges & Quick Action */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#28283C]/40">
                            {store.lastVisitAttendance === 'visited' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                ✓ مراجعه شد (رفت)
                              </span>
                            )}
                            {store.lastVisitAttendance === 'not_visited' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                                ✕ مراجعه نشد (نرفت)
                              </span>
                            )}
                            {(!store.lastVisitAttendance || store.lastVisitAttendance === 'pending') && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
                                در انتظار ویزیت
                              </span>
                            )}

                            {store.lastVisitInvoiceStatus === 'invoiced' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 font-mono">
                                🧾 فاکتور زده: {store.totalInvoicedGoldGrams || 0}g
                              </span>
                            )}
                            {store.lastVisitInvoiceStatus === 'no_invoice' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                بدون فاکتور
                              </span>
                            )}

                            <button
                              onClick={() => {
                                setScheduledTargetStoreId(store.id);
                                setIsScheduleVisitOpen(true);
                              }}
                              className="mr-auto px-2 py-0.5 bg-[#28283C] hover:bg-[#32324A] text-white rounded text-[10px] font-medium transition-colors flex items-center gap-1"
                              title="تنظیم زمان‌بندی حضور و مراجعه به این فروشگاه"
                            >
                              <Clock className="w-2.5 h-2.5 text-[#C8A951]" />
                              زمان‌بندی مراجعه
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Tab 4: Mobile Showcase & Portable Gallery */}
      {activeTab === 'showcase' && (
        <div className="bg-[#161622] border border-[#28283C] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#28283C] pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#C8A951]" />
                مجموعه نمونه‌های طلای موجود در کیف هوشمند سیار
              </h2>
              <p className="text-xs text-[#A0A0B5] mt-0.5">
                مدل‌های نوآورانه با عیارسنجی استاندارد جهت ارائه به رؤیت فیزیکی طلافروشان راسته بازار
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {showcaseItems.map(item => (
              <div
                key={item.id}
                className="bg-[#191926] border border-[#28283C] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#828299]">{item.skuCode}</span>
                    <h4 className="text-xs font-bold text-white mt-1">{item.titleFa}</h4>
                  </div>
                  {item.highDemandBadge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30">
                      پرفروش بازار
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-[#A0A0B5] bg-[#161622] p-2.5 rounded-lg border border-[#28283C]">
                  <p>دسته: <strong className="text-white">{item.categoryFa}</strong></p>
                  <p>عیار: <strong className="text-white">{item.caratFa}</strong></p>
                  <p>وزن نمونه: <strong className="text-[#E5C365] font-mono">{item.sampleWeightGrams} گرم</strong></p>
                  <p>اجرت ساخت: <strong className="text-emerald-400 font-mono">{item.wagePerGramToman.toLocaleString('fa-IR')} تومان/گرم</strong></p>
                </div>

                <p className="text-[11px] text-[#828299] leading-relaxed">
                  {item.notesFa}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-modals and Drawers */}
      <NewAgentModal
        territories={territories}
        isOpen={isNewAgentOpen}
        onClose={() => setIsNewAgentOpen(false)}
        onSubmit={handleCreateAgent}
      />

      <ScheduleVisitModal
        agents={agents}
        territories={territories}
        isOpen={isScheduleVisitOpen}
        onClose={() => {
          setIsScheduleVisitOpen(false);
          setScheduledTargetStoreId(undefined);
        }}
        onSubmit={handleScheduleVisit}
        initialStoreId={scheduledTargetStoreId}
      />

      <CheckInModal
        visit={checkInTargetVisit}
        isOpen={Boolean(checkInTargetVisit)}
        onClose={() => setCheckInTargetVisit(null)}
        onConfirmCheckIn={handleConfirmCheckIn}
      />

      <CompleteVisitModal
        visit={completeTargetVisit}
        isOpen={Boolean(completeTargetVisit)}
        onClose={() => setCompleteTargetVisit(null)}
        onComplete={handleCompleteVisit}
      />

      <ProxyOrderModal
        visit={proxyTargetVisit}
        showcaseItems={showcaseItems}
        isOpen={Boolean(proxyTargetVisit)}
        onClose={() => setProxyTargetVisit(null)}
        onSubmitProxyOrder={handleSubmitProxyOrder}
      />

      <AgentDetailDrawer
        agent={selectedAgentDetail}
        territories={territories}
        isOpen={Boolean(selectedAgentDetail)}
        onClose={() => setSelectedAgentDetail(null)}
        onUpdateStatus={handleUpdateAgentStatus}
        onAssignTerritory={handleAssignAgentTerritory}
        onToggleActive={handleToggleAgentActive}
      />

      <NewTerritoryModal
        agents={agents}
        isOpen={isNewTerritoryOpen}
        onClose={() => setIsNewTerritoryOpen(false)}
        onSubmit={handleCreateTerritory}
      />

      {addStoreTargetTerritory && (
        <AddStoreModal
          territory={addStoreTargetTerritory}
          isOpen={Boolean(addStoreTargetTerritory)}
          onClose={() => setAddStoreTargetTerritory(null)}
          onSubmit={handleAddStoreToTerritory}
        />
      )}

      {recordOutcomeTargetVisit && (
        <RecordVisitOutcomeModal
          visit={recordOutcomeTargetVisit}
          isOpen={Boolean(recordOutcomeTargetVisit)}
          onClose={() => setRecordOutcomeTargetVisit(null)}
          onSubmit={handleRecordVisitOutcome}
        />
      )}

    </div>
  );
};
