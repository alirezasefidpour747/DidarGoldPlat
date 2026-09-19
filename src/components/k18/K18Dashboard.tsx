/**
 * Didar Gold Platform - Kernel 18 (K18) Dashboard Component
 * After-sales Cases, Returns, Repairs, Workshop Routing & Warranty Fulfillment
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  ShieldCheck,
  RotateCcw,
  Truck,
  Scale,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Eye,
  AlertTriangle,
  FileText,
  User,
  Phone,
  Calendar,
  Sparkles,
  Building2,
  Printer,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Award,
  Gem,
  Tag
} from 'lucide-react';
import { api } from '../../lib/api.js';
import {
  ServiceTicket,
  RepairWorkshop,
  K18Metrics,
  K18AuditLog,
  K18DataPayload,
  K18TicketStage,
  K18ServiceCategory
} from '../../types/k18.js';

export function K18Dashboard() {
  const [data, setData] = useState<K18DataPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tickets' | 'intake' | 'workshops' | 'qc' | 'refunds' | 'audit'>('tickets');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [warrantyFilter, setWarrantyFilter] = useState<string>('all');

  // Selected Ticket Drawer / Modal
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState<boolean>(false);

  // Stage Action Form State
  const [actionStage, setActionStage] = useState<K18TicketStage>('routed_to_workshop');
  const [actionWorkshopId, setActionWorkshopId] = useState<string>('');
  const [actionOperatorName, setActionOperatorName] = useState<string>('سرپرست خدمات پس از فروش');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [actionReturnWeight, setActionReturnWeight] = useState<string>('');
  const [actionAssayCert, setActionAssayCert] = useState<string>('');

  // Intake Form State
  const [intakeForm, setIntakeForm] = useState({
    itemUid: '',
    itemTitleFa: '',
    karatFa: '۱۸ عیار (۷۵۰)',
    consumerFullName: '',
    consumerMobile: '',
    consumerNationalId: '',
    consumerCity: 'تهران',
    intakeConditionNotesFa: '',
    intakeStaffNameFa: 'کارشناس پذیرش دیدار',
    retailerNameFa: 'گالری طلای دیدار شعبه مرکزی',
    priority: 'normal' as 'normal' | 'express' | 'urgent_vip',
    serviceCategory: 'repair_hardware' as K18ServiceCategory,
    serviceCategoryFa: 'تعمیر قفل و مدبر و اتصالات مکانیکی',
    intakeGrossWeightGrams: '',
    intakeTareGrams: '0',
    warrantyNumber: ''
  });

  const [isSubmittingIntake, setIsSubmittingIntake] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto notification clear
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await api.getK18Data();
      setData(payload);
      if (selectedTicket) {
        const refreshed = payload.tickets?.find((t) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      }
    } catch (err: any) {
      console.error('Error loading K18 data:', err);
      setError(err.message || 'خطا در برقراری ارتباط با هسته پس از فروش K18');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    if (!data?.tickets) return [];
    return data.tickets.filter((t) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = t.ticketNumber?.toLowerCase().includes(q);
        const matchReceipt = t.receiptCode?.toLowerCase().includes(q);
        const matchUid = t.itemUid?.toLowerCase().includes(q);
        const matchTitle = t.itemTitleFa?.toLowerCase().includes(q);
        const matchCustomer = t.consumerInfo?.fullName?.toLowerCase().includes(q);
        const matchMobile = t.consumerInfo?.mobile?.includes(q);
        if (!matchNumber && !matchReceipt && !matchUid && !matchTitle && !matchCustomer && !matchMobile) {
          return false;
        }
      }

      // Stage filter
      if (stageFilter !== 'all' && t.stage !== stageFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && t.serviceCategory !== categoryFilter) {
        return false;
      }

      // Warranty filter
      if (warrantyFilter !== 'all') {
        if (warrantyFilter === 'active' && t.warranty?.status !== 'active_covered') return false;
        if (warrantyFilter === 'expired' && t.warranty?.status !== 'expired') return false;
        if (warrantyFilter === 'none' && t.warranty?.status !== 'no_warranty') return false;
      }

      return true;
    });
  }, [data?.tickets, searchQuery, stageFilter, categoryFilter, warrantyFilter]);

  // Handle Create Intake Ticket
  const handleCreateIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeForm.itemUid || !intakeForm.itemTitleFa || !intakeForm.consumerFullName || !intakeForm.consumerMobile) {
      setNotification({ type: 'error', message: 'لطفاً تمامی فیلدهای الزامی ستاره‌دار را تکمیل نمایید.' });
      return;
    }
    const weightNum = parseFloat(intakeForm.intakeGrossWeightGrams);
    if (isNaN(weightNum) || weightNum <= 0) {
      setNotification({ type: 'error', message: 'وزن قطعه باید عددی معتبر و بزرگتر از صفر باشد.' });
      return;
    }

    setIsSubmittingIntake(true);
    try {
      const res = await api.createK18Ticket({
        itemUid: intakeForm.itemUid,
        itemTitleFa: intakeForm.itemTitleFa,
        karatFa: intakeForm.karatFa,
        consumerFullName: intakeForm.consumerFullName,
        consumerMobile: intakeForm.consumerMobile,
        consumerNationalId: intakeForm.consumerNationalId,
        consumerCity: intakeForm.consumerCity,
        intakeConditionNotesFa: intakeForm.intakeConditionNotesFa,
        intakeStaffNameFa: intakeForm.intakeStaffNameFa,
        retailerNameFa: intakeForm.retailerNameFa,
        priority: intakeForm.priority,
        serviceCategory: intakeForm.serviceCategory,
        serviceCategoryFa: intakeForm.serviceCategoryFa,
        intakeGrossWeightGrams: weightNum,
        intakeTareGrams: parseFloat(intakeForm.intakeTareGrams) || 0,
        warrantyNumber: intakeForm.warrantyNumber || undefined
      });

      setNotification({
        type: 'success',
        message: `پرونده جدید به شماره ${res.data.ticketNumber} با موفقیت ثبت و قبض امانی صادر شد.`
      });

      // Reset form & reload
      setIntakeForm({
        itemUid: '',
        itemTitleFa: '',
        karatFa: '۱۸ عیار (۷۵۰)',
        consumerFullName: '',
        consumerMobile: '',
        consumerNationalId: '',
        consumerCity: 'تهران',
        intakeConditionNotesFa: '',
        intakeStaffNameFa: 'کارشناس پذیرش دیدار',
        retailerNameFa: 'گالری طلای دیدار شعبه مرکزی',
        priority: 'normal',
        serviceCategory: 'repair_hardware',
        serviceCategoryFa: 'تعمیر قفل و مدبر و اتصالات مکانیکی',
        intakeGrossWeightGrams: '',
        intakeTareGrams: '0',
        warrantyNumber: ''
      });

      await loadData();
      setSelectedTicket(res.data);
      setActiveTab('tickets');
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'خطا در ثبت پذیرش جدید' });
    } finally {
      setIsSubmittingIntake(false);
    }
  };

  // Handle Stage Progression
  const handleAdvanceStage = async () => {
    if (!selectedTicket) return;
    try {
      const res = await api.updateK18TicketStage(selectedTicket.id, {
        nextStage: actionStage,
        workshopId: actionWorkshopId || undefined,
        operatorNameFa: actionOperatorName,
        notesFa: actionNotes || undefined,
        returnGrossWeightGrams: actionReturnWeight ? parseFloat(actionReturnWeight) : undefined,
        assayCert: actionAssayCert || undefined
      });

      setNotification({
        type: 'success',
        message: `پرونده ${selectedTicket.ticketNumber} با موفقیت به مرحله «${res.data.stageFa}» ارتقا یافت.`
      });

      setIsStageModalOpen(false);
      setActionNotes('');
      setActionReturnWeight('');
      setActionAssayCert('');
      await loadData();
      setSelectedTicket(res.data);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'خطا در به‌روزرسانی مرحله پرونده' });
    }
  };

  // Helper badge for stage
  const getStageBadge = (stage: K18TicketStage) => {
    switch (stage) {
      case 'intake_received':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#8E8EA0]/15 text-[#EDEDED] border border-[#3A3A4E]">پذیرش اولیه و صدور قبض</span>;
      case 'routed_to_workshop':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#70A5FF]/15 text-[#70A5FF] border border-[#70A5FF]/30">ارسال به کارگاه سازنده</span>;
      case 'in_repair':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#C8A951]/15 text-[#C8A951] border border-[#C8A951]/30">در دست اقدام در کارگاه</span>;
      case 'qc_assay_inspection':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/30">کنترل کیفی و توزین مجدد</span>;
      case 'ready_for_pickup':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30 animate-pulse">آماده تحویل در گالری</span>;
      case 'completed_delivered':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#3DD68C]/20 text-[#3DD68C] border border-[#3DD68C]/40">تحویل قطعی و مختومه</span>;
      case 'rejected_cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FF5C5C]/15 text-[#FF5C5C] border border-[#FF5C5C]/30">لغو شده / عدم امکان تعمیر</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#242434] text-[#EDEDED]">نامشخص</span>;
    }
  };

  const getWarrantyBadge = (status: string) => {
    switch (status) {
      case 'active_covered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
            <ShieldCheck className="w-3 h-3" />
            گارانتی طلایی دیدار (رایگان)
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
            <Clock className="w-3 h-3" />
            گارانتی منقضی (تعرفه آزاد)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#404052]/30 text-[#A0A0B2] border border-[#3A3A4C]">
            فاقد گارانتی
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-medium flex items-center gap-2.5 transition-all ${
            notification.type === 'success'
              ? 'bg-[#15241B] border-[#3DD68C]/40 text-[#3DD68C]'
              : 'bg-[#291518] border-[#FF5C5C]/40 text-[#FF5C5C]'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner & Kernel Status */}
      <div className="rounded-2xl bg-gradient-to-l from-[#191928] via-[#151522] to-[#12121A] border border-[#2B2B3E] p-5 lg:p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8A951]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#C8A951]/20 border border-[#C8A951]/40 flex items-center justify-center text-[#C8A951]">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C8A951]/20 text-[#C8A951] border border-[#C8A951]/30">
                    KERNEL 18
                  </span>
                  <h1 className="text-lg lg:text-xl font-bold text-[#EDEDED]">
                    سامانه پس از فروش، مرجوعی و کارگاه‌های تعمیر (K18)
                  </h1>
                </div>
                <p className="text-xs text-[#9E9EA8] mt-0.5">
                  چرخه کامل پذیرش قطعه زرین، اعتبارسنجی گارانتی K17، توزین دقیق، ترابری امن به کارگاه و صدور شناسنامه خدمات
                </p>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
            <button
              onClick={() => setActiveTab('intake')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#C8A951] text-[#0D0D12] hover:bg-[#D8B961] shadow-lg shadow-[#C8A951]/10 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>پذیرش قطعه و صدور قبض امانی</span>
            </button>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-[#1D1D2B] border border-[#2B2B3E] text-[#B5B5C2] hover:text-[#EDEDED] hover:border-[#3D3D52] transition-colors cursor-pointer"
              title="بارگذاری مجدد داده‌ها"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#C8A951]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-[#242436]">
          <div className="bg-[#12121C] p-3 rounded-xl border border-[#232334]">
            <span className="text-[11px] text-[#8E8EA0] block">پرونده‌های جاری</span>
            <span className="text-base font-bold font-mono text-[#EDEDED] mt-0.5 block">
              {(data?.metrics?.totalActiveTickets || 0).toLocaleString('fa-IR')}
            </span>
          </div>

          <div className="bg-[#12121C] p-3 rounded-xl border border-[#232334]">
            <span className="text-[11px] text-[#8E8EA0] block">پوشش گارانتی طلایی</span>
            <span className="text-base font-bold font-mono text-[#3DD68C] mt-0.5 block">
              {(data?.metrics?.underWarrantyCount || 0).toLocaleString('fa-IR')}
            </span>
          </div>

          <div className="bg-[#12121C] p-3 rounded-xl border border-[#232334]">
            <span className="text-[11px] text-[#8E8EA0] block">در دست اقدام کارگاه</span>
            <span className="text-base font-bold font-mono text-[#C8A951] mt-0.5 block">
              {(data?.metrics?.inWorkshopCount || 0).toLocaleString('fa-IR')}
            </span>
          </div>

          <div className="bg-[#12121C] p-3 rounded-xl border border-[#232334]">
            <span className="text-[11px] text-[#8E8EA0] block">آماده تحویل در گالری</span>
            <span className="text-base font-bold font-mono text-[#70A5FF] mt-0.5 block">
              {(data?.metrics?.readyForPickupCount || 0).toLocaleString('fa-IR')}
            </span>
          </div>

          <div className="bg-[#12121C] p-3 rounded-xl border border-[#232334]">
            <span className="text-[11px] text-[#8E8EA0] block">طلای در گردش تعمیرات</span>
            <span className="text-base font-bold font-mono text-[#EDEDED] mt-0.5 block">
              {(data?.metrics?.totalGoldHandledGrams || 0).toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-[#8E8EA0]">گرم</span>
            </span>
          </div>

          <div className="bg-[#12121C] p-3 rounded-xl border border-[#232334]">
            <span className="text-[11px] text-[#8E8EA0] block">شاخص رضایت مشتری</span>
            <span className="text-base font-bold font-mono text-[#3DD68C] mt-0.5 block">
              ۹۸.۴٪
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#232334] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'tickets'
              ? 'bg-[#C8A951] text-[#0D0D12] shadow-md shadow-[#C8A951]/10'
              : 'bg-[#151520] text-[#9E9EA8] hover:text-[#EDEDED] border border-[#242436]'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>میز کار پرونده‌ها و کارتابل ({data?.tickets?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('intake')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'intake'
              ? 'bg-[#C8A951] text-[#0D0D12] shadow-md shadow-[#C8A951]/10'
              : 'bg-[#151520] text-[#9E9EA8] hover:text-[#EDEDED] border border-[#242436]'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>پذیرش قطعه و صدور قبض امانی</span>
        </button>

        <button
          onClick={() => setActiveTab('workshops')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'workshops'
              ? 'bg-[#C8A951] text-[#0D0D12] shadow-md shadow-[#C8A951]/10'
              : 'bg-[#151520] text-[#9E9EA8] hover:text-[#EDEDED] border border-[#242436]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>کارگاه‌های طرف قرارداد ({data?.workshops?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('qc')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'qc'
              ? 'bg-[#C8A951] text-[#0D0D12] shadow-md shadow-[#C8A951]/10'
              : 'bg-[#151520] text-[#9E9EA8] hover:text-[#EDEDED] border border-[#242436]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>کنترل کیفی و توزین دقیق</span>
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'refunds'
              ? 'bg-[#C8A951] text-[#0D0D12] shadow-md shadow-[#C8A951]/10'
              : 'bg-[#151520] text-[#9E9EA8] hover:text-[#EDEDED] border border-[#242436]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>مرجوعی ۷ روزه و استرداد وجه</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-[#C8A951] text-[#0D0D12] shadow-md shadow-[#C8A951]/10'
              : 'bg-[#151520] text-[#9E9EA8] hover:text-[#EDEDED] border border-[#242436]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>دفتر ممیزی و تاریخچه زنجیره</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TICKETS CARDS & KANBAN */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-[#14141E] border border-[#242436] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7A7A8C] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجو با شماره پرونده (SRV...)، کد قبض، UID پاسپورت، نام خریدار یا تلفن..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl pr-9 pl-3 py-2 text-xs text-[#EDEDED] placeholder-[#6E6E80] focus:border-[#C8A951] outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
              >
                <option value="all">تمام مراحل گردش کار</option>
                <option value="intake_received">پذیرش اولیه در گالری</option>
                <option value="routed_to_workshop">ارسال به کارگاه</option>
                <option value="in_repair">در دست اقدام کارگاه</option>
                <option value="qc_assay_inspection">کنترل کیفی و توزین</option>
                <option value="ready_for_pickup">آماده تحویل در گالری</option>
                <option value="completed_delivered">تحویل قطعی و مختومه</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
              >
                <option value="all">تمام خدمات</option>
                <option value="repair_hardware">تعمیر قفل و مدبر</option>
                <option value="gem_setting">مخراج‌کاری و نگین</option>
                <option value="sizing_alteration">تغییر سایز</option>
                <option value="surface_refinishing">آبکاری و پرداخت</option>
                <option value="return_refund">مرجوعی و استرداد</option>
              </select>

              <select
                value={warrantyFilter}
                onChange={(e) => setWarrantyFilter(e.target.value)}
                className="bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
              >
                <option value="all">وضعیت گارانتی</option>
                <option value="active">تحت پوشش گارانتی طلایی</option>
                <option value="expired">گارانتی منقضی</option>
                <option value="none">فاقد گارانتی</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#14141E] border border-[#242436] space-y-3">
              <Wrench className="w-10 h-10 text-[#555566] mx-auto" />
              <h3 className="text-sm font-bold text-[#EDEDED]">هیچ پرونده‌ای با این مشخصات یافت نشد</h3>
              <p className="text-xs text-[#8E8EA0]">
                می‌توانید فیلترهای جستجو را پاک کنید یا یک پرونده پذیرش جدید ثبت نمایید.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3.5 relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#181826] border-[#C8A951] shadow-lg shadow-[#C8A951]/5'
                        : 'bg-[#14141E] border-[#242436] hover:border-[#3A3A4E]'
                    }`}
                  >
                    {/* Top Row: Ticket Number & Stage */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#242436] text-[#C8A951] border border-[#3A3A52]">
                          {ticket.ticketNumber}
                        </span>
                        <span className="text-[11px] text-[#8E8EA0] font-mono">
                          کد قبض: {ticket.receiptCode}
                        </span>
                      </div>
                      <div>{getStageBadge(ticket.stage)}</div>
                    </div>

                    {/* Product & Customer Details */}
                    <div>
                      <h3 className="text-xs font-bold text-[#EDEDED] line-clamp-1">{ticket.itemTitleFa}</h3>
                      <div className="flex items-center gap-3 text-[11px] text-[#8E8EA0] mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-[#A0A0B2]" />
                          {ticket.consumerInfo.fullName}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{ticket.consumerInfo.mobile}</span>
                        <span>•</span>
                        <span className="text-[#C8A951] font-mono">{ticket.karatFa}</span>
                      </div>
                    </div>

                    {/* Weights & Defect Notes */}
                    <div className="p-2.5 rounded-xl bg-[#0F0F16] border border-[#1E1E2C] text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8E8EA0]">وزن پذیرش (طلای خالص):</span>
                        <span className="font-mono font-bold text-[#EDEDED]">
                          {ticket.weightAudit.intakeGrossWeightGrams} گرم{' '}
                          <span className="text-[10px] text-[#A0A0B2]">
                            (خالص: {ticket.weightAudit.intakeNetGoldGrams}g)
                          </span>
                        </span>
                      </div>

                      {ticket.weightAudit.goldWeightDeltaGrams !== undefined && ticket.weightAudit.goldWeightDeltaGrams !== 0 && (
                        <div className="flex items-center justify-between text-[#C8A951]">
                          <span>تغییر وزن ناشی از تعمیر:</span>
                          <span className="font-mono font-bold dir-ltr">
                            {ticket.weightAudit.goldWeightDeltaGrams > 0 ? `+${ticket.weightAudit.goldWeightDeltaGrams}` : ticket.weightAudit.goldWeightDeltaGrams} گرم
                          </span>
                        </div>
                      )}

                      <p className="text-[#A0A0B2] line-clamp-1 italic text-[10px] pt-1 border-t border-[#1E1E2C]">
                        علت مراجعه: {ticket.intakeDetails.intakeConditionNotesFa}
                      </p>
                    </div>

                    {/* Footer Row: Warranty & Actions */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div>{getWarrantyBadge(ticket.warranty.status)}</div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                            setIsReceiptModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#1F1F2E] text-[#B5B5C2] hover:text-[#EDEDED] hover:bg-[#2A2A3E] transition-colors"
                          title="چاپ قبض امانی طلا"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                            setActionStage(
                              ticket.stage === 'intake_received'
                                ? 'routed_to_workshop'
                                : ticket.stage === 'routed_to_workshop'
                                ? 'in_repair'
                                : ticket.stage === 'in_repair'
                                ? 'qc_assay_inspection'
                                : ticket.stage === 'qc_assay_inspection'
                                ? 'ready_for_pickup'
                                : 'completed_delivered'
                            );
                            setIsStageModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#C8A951]/15 text-[#C8A951] hover:bg-[#C8A951]/25 border border-[#C8A951]/30 transition-colors"
                        >
                          <span>ارتقای مرحله</span>
                          <ArrowRight className="w-3 h-3 rotate-180" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Ticket Detail View */}
          {selectedTicket && (
            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#C8A951]/40 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#232334] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#C8A951]/20 text-[#C8A951] border border-[#C8A951]/40">
                      {selectedTicket.ticketNumber}
                    </span>
                    <h2 className="text-sm font-bold text-[#EDEDED]">{selectedTicket.itemTitleFa}</h2>
                  </div>
                  <span className="text-[11px] font-mono text-[#8E8EA0] block mt-1">
                    پاسپورت UID کالا: {selectedTicket.itemUid}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsReceiptModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1F1F2E] text-[#EDEDED] hover:bg-[#2A2A3E] border border-[#2E2E42] transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#C8A951]" />
                    <span>چاپ قبض رسمی امانت</span>
                  </button>

                  <button
                    onClick={() => {
                      setActionStage(
                        selectedTicket.stage === 'intake_received'
                          ? 'routed_to_workshop'
                          : selectedTicket.stage === 'routed_to_workshop'
                          ? 'in_repair'
                          : selectedTicket.stage === 'in_repair'
                          ? 'qc_assay_inspection'
                          : selectedTicket.stage === 'qc_assay_inspection'
                          ? 'ready_for_pickup'
                          : 'completed_delivered'
                      );
                      setIsStageModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#C8A951] text-[#0D0D12] hover:bg-[#D8B961] transition-colors shadow"
                  >
                    <span>عملیات گردش کار</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>

              {/* Grid of specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Customer Box */}
                <div className="p-3.5 rounded-xl bg-[#11111A] border border-[#222232] space-y-2">
                  <span className="text-[11px] font-bold text-[#C8A951] block">مشخصات صاحب قطعه</span>
                  <div className="space-y-1 text-[#B5B5C2]">
                    <div className="flex justify-between">
                      <span className="text-[#7A7A8C]">نام خریدار:</span>
                      <span className="font-semibold text-[#EDEDED]">{selectedTicket.consumerInfo.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7A7A8C]">شماره تماس:</span>
                      <span className="font-mono text-[#EDEDED]">{selectedTicket.consumerInfo.mobile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7A7A8C]">کد ملی:</span>
                      <span className="font-mono">{selectedTicket.consumerInfo.nationalId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7A7A8C]">شهر سکونت:</span>
                      <span>{selectedTicket.consumerInfo.city}</span>
                    </div>
                  </div>
                </div>

                {/* Workshop Box */}
                <div className="p-3.5 rounded-xl bg-[#11111A] border border-[#222232] space-y-2">
                  <span className="text-[11px] font-bold text-[#70A5FF] block">کارگاه سازنده و ترابری</span>
                  {selectedTicket.workshop ? (
                    <div className="space-y-1 text-[#B5B5C2]">
                      <div className="flex justify-between">
                        <span className="text-[#7A7A8C]">کارگاه:</span>
                        <span className="font-semibold text-[#EDEDED] line-clamp-1">{selectedTicket.workshop.workshopNameFa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7A7A8C]">استادکار مسئول:</span>
                        <span>{selectedTicket.workshop.masterJewelerNameFa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7A7A8C]">کد بیمه ترابری:</span>
                        <span className="font-mono text-[#70A5FF]">{selectedTicket.workshop.transitInsuranceTrackingCode || 'ندارد'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7A7A8C]">موعد تحویل:</span>
                        <span className="font-mono text-[#EDEDED]">{selectedTicket.workshop.estimatedCompletionDateFa}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-[#7A7A8C] text-[11px]">
                      هنوز به کارگاه سازنده تخصیص نیافته است.
                    </div>
                  )}
                </div>

                {/* Financial Box */}
                <div className="p-3.5 rounded-xl bg-[#11111A] border border-[#222232] space-y-2">
                  <span className="text-[11px] font-bold text-[#3DD68C] block">تسویه حساب و گارانتی</span>
                  <div className="space-y-1 text-[#B5B5C2]">
                    <div className="flex justify-between">
                      <span className="text-[#7A7A8C]">کل ارزش خدمات:</span>
                      <span className="font-mono">{selectedTicket.financial.totalServiceValueToman.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="flex justify-between text-[#3DD68C]">
                      <span>تخفیف پوشش گارانتی:</span>
                      <span className="font-mono">-{selectedTicket.financial.warrantyCoverageDiscountToman.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#EDEDED] pt-1 border-t border-[#222232]">
                      <span>مبلغ قابل پرداخت مشتری:</span>
                      <span className="font-mono text-[#C8A951]">{selectedTicket.financial.customerPayableToman.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#7A7A8C]">وضعیت تسویه:</span>
                      <span className="text-[#3DD68C]">
                        {selectedTicket.financial.paymentStatus === 'covered_by_warranty'
                          ? 'پوشش کامل گارانتی رایگان'
                          : selectedTicket.financial.paymentStatus === 'settled_paid'
                          ? 'تسویه شده'
                          : 'در انتظار تسویه'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline of the selected ticket */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-[#EDEDED]">گاه‌شمار رویدادها و ممیزی پرونده</h4>
                <div className="space-y-2">
                  {selectedTicket.timeline?.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="p-3 rounded-xl bg-[#101018] border border-[#1E1E2C] flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C8A951]" />
                          <h5 className="font-bold text-[#EDEDED]">{evt.titleFa}</h5>
                        </div>
                        <p className="text-[11px] text-[#A0A0B2] pr-4">{evt.descriptionFa}</p>
                      </div>
                      <div className="text-left shrink-0 font-mono text-[10px] text-[#7A7A8C]">
                        <div>{evt.timestampFa}</div>
                        <div className="text-[#B5B5C2]">{evt.operatorNameFa}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTAKE NEW TICKET */}
      {/* ========================================================================= */}
      {activeTab === 'intake' && (
        <div className="p-6 rounded-2xl bg-[#14141E] border border-[#242436] max-w-4xl mx-auto space-y-6 shadow-xl">
          <div className="border-b border-[#242436] pb-4">
            <h2 className="text-base font-bold text-[#EDEDED] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#C8A951]" />
              <span>فرم رسمی پذیرش قطعه زرین و صدور قبض امانی</span>
            </h2>
            <p className="text-xs text-[#8E8EA0] mt-1">
              ثبت قطعه طلای معیوب یا تعمیری با استعلام سوابق مالکیت K17 و فعال‌سازی فرایند لجستیک کارگاه
            </p>
          </div>

          <form onSubmit={handleCreateIntake} className="space-y-5 text-xs">
            {/* Row 1: Item Identification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium flex items-center gap-1">
                  <span>شناسه یکتای قطعه (UID پاسپورت طلا)</span>
                  <span className="text-[#FF5C5C]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: DID-AU750-2026-8820-001"
                  value={intakeForm.itemUid}
                  onChange={(e) => setIntakeForm({ ...intakeForm, itemUid: e.target.value })}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[#EDEDED] font-medium flex items-center gap-1">
                  <span>عنوان و شرح فیزیکی قطعه</span>
                  <span className="text-[#FF5C5C]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: النگو طلا ۱۸ عیار ریخته‌گری طرح اسلیمی صفوی"
                  value={intakeForm.itemTitleFa}
                  onChange={(e) => setIntakeForm({ ...intakeForm, itemTitleFa: e.target.value })}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] focus:border-[#C8A951] outline-none"
                  required
                />
              </div>
            </div>

            {/* Row 2: Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium flex items-center gap-1">
                  <span>نام و نام‌خانوادگی صاحب قطعه</span>
                  <span className="text-[#FF5C5C]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: خانم سارا فرهمند"
                  value={intakeForm.consumerFullName}
                  onChange={(e) => setIntakeForm({ ...intakeForm, consumerFullName: e.target.value })}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] focus:border-[#C8A951] outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium flex items-center gap-1">
                  <span>شماره تماس همراه</span>
                  <span className="text-[#FF5C5C]">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="09121112233"
                  value={intakeForm.consumerMobile}
                  onChange={(e) => setIntakeForm({ ...intakeForm, consumerMobile: e.target.value })}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium">کد ملی</label>
                <input
                  type="text"
                  placeholder="0019283741"
                  value={intakeForm.consumerNationalId}
                  onChange={(e) => setIntakeForm({ ...intakeForm, consumerNationalId: e.target.value })}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium">شهر</label>
                <input
                  type="text"
                  value={intakeForm.consumerCity}
                  onChange={(e) => setIntakeForm({ ...intakeForm, consumerCity: e.target.value })}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] focus:border-[#C8A951] outline-none"
                />
              </div>
            </div>

            {/* Row 3: Service Category & Warranty */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium">دسته‌بندی خدمت درخواستی</label>
                <select
                  value={intakeForm.serviceCategory}
                  onChange={(e) => {
                    const val = e.target.value as K18ServiceCategory;
                    const labels: Record<K18ServiceCategory, string> = {
                      repair_hardware: 'تعمیر اتصالات، جوش لیزری، تعویض قفل و مدبر',
                      gem_setting: 'مخراج‌کاری و جایگزینی سنگ یا نگین افتاده',
                      sizing_alteration: 'تغییر سایز انگشتر، النگو یا دستبند',
                      surface_refinishing: 'آبکاری رودیوم، زرد، رزگلد، پرداخت و شستشو',
                      manufacturing_defect: 'نقص ریخته‌گری یا شکست ساختاری کارخانه',
                      return_refund: 'مرجوعی قطعی کالا و استرداد وجه',
                      exchange: 'تعویض با مدل دیگر در دوره طلایی'
                    };
                    setIntakeForm({
                      ...intakeForm,
                      serviceCategory: val,
                      serviceCategoryFa: labels[val]
                    });
                  }}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                >
                  <option value="repair_hardware">تعمیر اتصالات، جوش لیزری و قفل</option>
                  <option value="gem_setting">مخراج‌کاری و جایگزینی نگین برلیان</option>
                  <option value="sizing_alteration">تغییر سایز انگشتر یا دستبند</option>
                  <option value="surface_refinishing">آبکاری رودیوم و پرداخت التراسونیک</option>
                  <option value="manufacturing_defect">نقص ریخته‌گری کارخانه</option>
                  <option value="return_refund">مرجوعی قطعی کالا و استرداد وجه (۷ روزه)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium">شماره کارت گارانتی K17 (اختیاری)</label>
                <input
                  type="text"
                  placeholder="مثال: WAR-AU750-1404-8820"
                  value={intakeForm.warrantyNumber}
                  onChange={(e) => setIntakeForm({ ...intakeForm, warrantyNumber: e.target.value })}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium">اولویت انجام کار</label>
                <select
                  value={intakeForm.priority}
                  onChange={(e) => setIntakeForm({ ...intakeForm, priority: e.target.value as any })}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                >
                  <option value="normal">عادی (حداکثر ۴ روز کاری)</option>
                  <option value="express">فوری (حداکثر ۲۴ ساعت)</option>
                  <option value="urgent_vip">اورژانسی VIP (تحویل همان روز)</option>
                </select>
              </div>
            </div>

            {/* Row 4: Precision Scales (Grams) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0F0F16] border border-[#1E1E2C]">
              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-[#C8A951]" />
                    <span>وزن ناخالص پذیرش با ترازو دیجیتال (گرم)</span>
                    <span className="text-[#FF5C5C]">*</span>
                  </span>
                  <span className="text-[10px] text-[#A0A0B2]">دقت سه رقم اعشار (سوت)</span>
                </label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="مثال: 14.850"
                  value={intakeForm.intakeGrossWeightGrams}
                  onChange={(e) => setIntakeForm({ ...intakeForm, intakeGrossWeightGrams: e.target.value })}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] font-mono text-sm font-bold focus:border-[#C8A951] outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium flex items-center justify-between">
                  <span>وزن تخمینی تاره / سنگ‌ها (گرم)</span>
                  <span className="text-[10px] text-[#A0A0B2]">در صورت عدم وجود نگین، 0 وارد کنید</span>
                </label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={intakeForm.intakeTareGrams}
                  onChange={(e) => setIntakeForm({ ...intakeForm, intakeTareGrams: e.target.value })}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                />
              </div>
            </div>

            {/* Row 5: Physical Condition Notes */}
            <div className="space-y-1.5">
              <label className="text-[#EDEDED] font-medium">شرح دقیق عیوب ظاهری، خط و خش و خواسته مشتری</label>
              <textarea
                rows={3}
                placeholder="ثبت هرگونه شکستگی، خمیدگی، افتادن نگین یا شرایط اولیه قطعه جهت ثبت در رسید امانت رسمی..."
                value={intakeForm.intakeConditionNotesFa}
                onChange={(e) => setIntakeForm({ ...intakeForm, intakeConditionNotesFa: e.target.value })}
                className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl p-3 text-[#EDEDED] focus:border-[#C8A951] outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242436]">
              <button
                type="button"
                onClick={() => setActiveTab('tickets')}
                className="px-4 py-2.5 rounded-xl text-xs text-[#9E9EA8] hover:text-[#EDEDED] transition-colors"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={isSubmittingIntake}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#C8A951] text-[#0D0D12] hover:bg-[#D8B961] shadow-lg shadow-[#C8A951]/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingIntake ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                <span>ثبت پذیرش قطعه و صدور قبض امانی زرین</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WORKSHOPS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'workshops' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#14141E] border border-[#242436] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#EDEDED]">شبکه کارگاه‌های تخصصی طلا و جواهر طرف قرارداد</h2>
              <p className="text-xs text-[#8E8EA0] mt-0.5">
                تخصیص سفارشات تعمیرات، جوش لیزری، مخراج‌کاری و آبکاری با پوشش کامل بیمه ترابری درون‌شهری
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#C8A951] bg-[#C8A951]/15 px-2.5 py-1 rounded-lg border border-[#C8A951]/30">
              {data?.workshops?.length || 0} کارگاه فعال
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.workshops?.map((ws) => (
              <div
                key={ws.id}
                className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-3.5 hover:border-[#3A3A4E] transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#C8A951]" />
                      <h3 className="text-xs font-bold text-[#EDEDED]">{ws.nameFa}</h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#8E8EA0] block">
                      پروانه اتحادیه: {ws.licenseNumber} • {ws.cityFa}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
                    فعال و معتبر
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#B5B5C2]">
                  <div className="flex justify-between">
                    <span className="text-[#7A7A8C]">استادکار و مدیر فنی:</span>
                    <span className="font-semibold text-[#EDEDED]">{ws.managerNameFa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A7A8C]">شماره تماس مستقیم:</span>
                    <span className="font-mono">{ws.contactPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A7A8C]">نشانی کارگاه:</span>
                    <span className="text-[11px] line-clamp-1">{ws.addressFa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A7A8C]">متوسط زمان انجام (SLA):</span>
                    <span className="font-mono text-[#C8A951] font-bold">{ws.slaDays} روز کاری</span>
                  </div>
                </div>

                {/* Specialties tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ws.specialtiesFa?.map((sp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#1E1E2C] text-[#A0A0B2] border border-[#2A2A3E]"
                    >
                      {sp}
                    </span>
                  ))}
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1E1E2C] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#7A7A8C]">پرونده‌های فعال:</span>
                    <span className="font-mono font-bold text-[#EDEDED]">{ws.activeTicketsCount} مورد</span>
                  </div>
                  <div className="text-[11px] text-[#3DD68C] font-mono">
                    ★ {ws.averageRating} رضایت کیفی
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: QC & PRECISION SCALES */}
      {/* ========================================================================= */}
      {activeTab === 'qc' && (
        <div className="p-6 rounded-2xl bg-[#14141E] border border-[#242436] space-y-6">
          <div className="flex items-center justify-between border-b border-[#242436] pb-4">
            <div>
              <h2 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#C8A951]" />
                <span>سامانه بازرسی کنترل کیفی، ری‌گیری و ممیزی کسر طلا</span>
              </h2>
              <p className="text-xs text-[#8E8EA0] mt-0.5">
                تطبیق دقیق وزن طلای ورودی با خروجی کارگاه، محاسبه اختلاف سوت و تضمین حفظ خلوص ۷۵۰
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3DD68C]/15 border border-[#3DD68C]/30 text-[#3DD68C] text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>کالیبراسیون ترازوی آزمایشگاهی تایید شد</span>
            </div>
          </div>

          <div className="space-y-3">
            {data?.tickets
              ?.filter((t) => t.stage === 'qc_assay_inspection' || t.weightAudit.returnGrossWeightGrams)
              ?.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-xl bg-[#11111A] border border-[#222232] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#C8A951] bg-[#C8A951]/15 px-2 py-0.5 rounded border border-[#C8A951]/30">
                        {ticket.ticketNumber}
                      </span>
                      <h4 className="font-bold text-[#EDEDED]">{ticket.itemTitleFa}</h4>
                    </div>
                    <span className="text-[11px] text-[#8E8EA0] block">
                      صاحب قطعه: {ticket.consumerInfo.fullName} • کارگاه: {ticket.workshop?.workshopNameFa || 'نامشخص'}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-left">
                    <div>
                      <span className="text-[10px] text-[#7A7A8C] block text-right">وزن ورودی:</span>
                      <span className="text-[#EDEDED] font-bold">{ticket.weightAudit.intakeGrossWeightGrams}g</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#7A7A8C] block text-right">وزن خروجی کارگاه:</span>
                      <span className="text-[#3DD68C] font-bold">
                        {ticket.weightAudit.returnGrossWeightGrams ? `${ticket.weightAudit.returnGrossWeightGrams}g` : 'در حال سنجش'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#7A7A8C] block text-right">اختلاف وزن (Delta):</span>
                      <span className={`font-bold dir-ltr ${
                        (ticket.weightAudit.goldWeightDeltaGrams || 0) < 0 ? 'text-[#FF5C5C]' : 'text-[#3DD68C]'
                      }`}>
                        {ticket.weightAudit.goldWeightDeltaGrams !== undefined ? `${ticket.weightAudit.goldWeightDeltaGrams}g` : '۰.۰۰۰g'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setActionStage('ready_for_pickup');
                        setIsStageModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] hover:bg-[#3DD68C]/25 border border-[#3DD68C]/30 transition-colors"
                    >
                      تایید QC و ارسال پیامک به مشتری
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: RETURNS & 7-DAY REFUND */}
      {/* ========================================================================= */}
      {activeTab === 'refunds' && (
        <div className="p-6 rounded-2xl bg-[#14141E] border border-[#242436] space-y-6">
          <div className="border-b border-[#242436] pb-4">
            <h2 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#C8A951]" />
              <span>مدیریت مرجوعی ۷ روزه و استرداد وجه طبق قانون تجارت الکترونیک</span>
            </h2>
            <p className="text-xs text-[#8E8EA0] mt-0.5">
              پذیرش کالای مرجوعی، ابطال گواهی مالکیت دیجیتال در K17، استرداد وجه به شبای خریدار و انتقال به انبار طلای شرکت
            </p>
          </div>

          <div className="space-y-3">
            {data?.tickets
              ?.filter((t) => t.serviceCategory === 'return_refund')
              ?.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-xl bg-[#11111A] border border-[#222232] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#C8A951] bg-[#C8A951]/15 px-2 py-0.5 rounded border border-[#C8A951]/30">
                        {ticket.ticketNumber}
                      </span>
                      <h4 className="font-bold text-[#EDEDED]">{ticket.itemTitleFa}</h4>
                      {getStageBadge(ticket.stage)}
                    </div>
                    <span className="text-[11px] text-[#8E8EA0] block">
                      خریدار: {ticket.consumerInfo.fullName} ({ticket.consumerInfo.mobile}) • کد رهگیری واریز ساتنا: {ticket.financial.paymentReference || 'در انتظار تایید حسابداری'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setIsReceiptModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1F1F2E] text-[#EDEDED] hover:bg-[#2A2A3E] border border-[#2E2E42]"
                    >
                      صورتجلسه عودت کالا
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AUDIT LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-[#14141E] border border-[#242436] space-y-4">
          <div className="border-b border-[#242436] pb-4">
            <h2 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C8A951]" />
              <span>دفتر کل ممیزی رویدادهای خدمات پس از فروش و تعمیرات</span>
            </h2>
            <p className="text-xs text-[#8E8EA0] mt-0.5">
              لاگ تغییرناپذیر تمامی تغییر وضعیت‌ها، توزین‌های آزمایشگاهی و ارجاعات به کارگاه‌ها با امضای اپراتور
            </p>
          </div>

          <div className="space-y-2.5">
            {data?.auditLogs?.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#11111A] border border-[#222232] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#C8A951]">{log.ticketNumber}</span>
                    <span className="font-semibold text-[#EDEDED]">{log.actionFa}</span>
                  </div>
                  <p className="text-[11px] text-[#A0A0B2]">{log.detailsFa}</p>
                </div>

                <div className="text-left shrink-0 text-[10px] font-mono text-[#7A7A8C]">
                  <div>{log.timestampFa}</div>
                  <div className="text-[#B5B5C2]">{log.performedBy}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: OFFICIAL CUSTODY RECEIPT (قبض امانی زرین دیدار) */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141E] border border-[#C8A951]/60 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-xs text-[#EDEDED] shadow-2xl relative">
            {/* Header of Receipt */}
            <div className="text-center space-y-2 border-b border-[#2A2A3E] pb-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#C8A951]/20 border border-[#C8A951]/40 flex items-center justify-center text-[#C8A951]">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#C8A951]">قبض رسمی امانت و رسید پذیرش تعمیرات طلا</h3>
              <p className="text-[11px] text-[#8E8EA0]">
                سامانه یکپارچه زنجیره تامین طلا و جواهر دیدار گلد (Kernel 18)
              </p>
              <div className="flex justify-center items-center gap-4 font-mono text-[11px] text-[#A0A0B2] pt-1">
                <span>شماره پرونده: <strong className="text-[#EDEDED]">{selectedTicket.ticketNumber}</strong></span>
                <span>•</span>
                <span>کد رهگیری پیامکی: <strong className="text-[#C8A951]">{selectedTicket.receiptCode}</strong></span>
                <span>•</span>
                <span>تاریخ پذیرش: {selectedTicket.intakeDetails.intakeDateFa}</span>
              </div>
            </div>

            {/* Customer & Item details table */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#0E0E16] border border-[#242436] text-[11px]">
              <div className="space-y-1">
                <span className="text-[#7A7A8C]">صاحب قطعه:</span>
                <p className="font-bold text-[#EDEDED]">{selectedTicket.consumerInfo.fullName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[#7A7A8C]">شماره تماس:</span>
                <p className="font-mono text-[#EDEDED]">{selectedTicket.consumerInfo.mobile}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-[#7A7A8C]">شرح قطعه و عیار:</span>
                <p className="font-bold text-[#EDEDED]">{selectedTicket.itemTitleFa} - {selectedTicket.karatFa}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[#7A7A8C]">وزن ناخالص پذیرش با ترازو:</span>
                <p className="font-mono font-bold text-[#C8A951] text-xs">{selectedTicket.weightAudit.intakeGrossWeightGrams} گرم</p>
              </div>
              <div className="space-y-1">
                <span className="text-[#7A7A8C]">شناسه یکتای پاسپورت (UID):</span>
                <p className="font-mono text-[#A0A0B2] text-[10px]">{selectedTicket.itemUid}</p>
              </div>
            </div>

            {/* Condition Notes */}
            <div className="p-3.5 rounded-xl bg-[#0E0E16] border border-[#242436] text-[11px] space-y-1">
              <span className="text-[#7A7A8C] block">علت پذیرش و شرح عیوب ظاهری:</span>
              <p className="text-[#B5B5C2]">{selectedTicket.intakeDetails.intakeConditionNotesFa}</p>
            </div>

            {/* Legal Notice */}
            <div className="p-3 rounded-xl bg-[#181824] border border-[#28283C] text-[10px] text-[#8E8EA0] space-y-1 leading-relaxed">
              <p>• تحویل قطعه صرفاً با ارائه اصل این قبض یا احراز هویت با شماره تلفن همراه خریدار امکان‌پذیر است.</p>
              <p>• در صورت تعویض قطعات فنی یا تغییر سایز، هرگونه کسر یا اضافه طلا در قبض تحویل نهایی ممیزی و تسویه می‌گردد.</p>
              <p>• قطعات تحت پوشش گارانتی طلایی دیدار، از مزایای تعمیر و شستشوی رایگان مطابق ضوابط بهره‌مند هستند.</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#C8A951] text-[#0D0D12] hover:bg-[#D8B961]"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ قبض رسمی</span>
              </button>

              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs bg-[#242436] text-[#EDEDED] hover:bg-[#343448]"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: STAGE PROGRESSION & WORKSHOP ROUTING */}
      {/* ========================================================================= */}
      {isStageModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141E] border border-[#2B2B3E] rounded-3xl max-w-lg w-full p-6 space-y-5 text-xs text-[#EDEDED] shadow-2xl">
            <div className="border-b border-[#242436] pb-3">
              <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#C8A951] rotate-180" />
                <span>ارتقای مرحله گردش کار پرونده {selectedTicket.ticketNumber}</span>
              </h3>
              <p className="text-[11px] text-[#8E8EA0] mt-0.5">{selectedTicket.itemTitleFa}</p>
            </div>

            <div className="space-y-4">
              {/* Select Next Stage */}
              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium">مرحله جدید گردش کار</label>
                <select
                  value={actionStage}
                  onChange={(e) => setActionStage(e.target.value as K18TicketStage)}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                >
                  <option value="routed_to_workshop">ارسال به کارگاه تخصصی با بیمه ترابری</option>
                  <option value="in_repair">در دست اقدام در کارگاه توسط استادکار</option>
                  <option value="qc_assay_inspection">کنترل کیفی، ری‌گیری و توزین مجدد دقیق</option>
                  <option value="ready_for_pickup">آماده تحویل در گالری (ارسال پیامک به مشتری)</option>
                  <option value="completed_delivered">تحویل قطعی به مشتری و تسویه نهایی</option>
                  <option value="rejected_cancelled">لغو یا عدم امکان تعمیر فنی</option>
                </select>
              </div>

              {/* Conditional Workshop selection */}
              {actionStage === 'routed_to_workshop' && (
                <div className="space-y-1.5">
                  <label className="text-[#EDEDED] font-medium">انتخاب کارگاه تخصصی طلا</label>
                  <select
                    value={actionWorkshopId}
                    onChange={(e) => setActionWorkshopId(e.target.value)}
                    className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2.5 text-[#EDEDED] focus:border-[#C8A951] outline-none cursor-pointer"
                  >
                    <option value="">-- انتخاب از کارگاه‌های معتبر طرف قرارداد --</option>
                    {data?.workshops?.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.nameFa} (SLA: {ws.slaDays} روز)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conditional Scale return weight */}
              {(actionStage === 'qc_assay_inspection' || actionStage === 'ready_for_pickup') && (
                <div className="space-y-3 p-3.5 rounded-xl bg-[#0E0E16] border border-[#242436]">
                  <div className="space-y-1.5">
                    <label className="text-[#EDEDED] font-medium flex items-center justify-between">
                      <span>وزن دقیق قطعه پس از تعمیر (گرم)</span>
                      <span className="text-[10px] text-[#A0A0B2]">
                        وزن ورودی اولیه: {selectedTicket.weightAudit.intakeGrossWeightGrams}g
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="مثال: 14.850"
                      value={actionReturnWeight}
                      onChange={(e) => setActionReturnWeight(e.target.value)}
                      className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2 text-[#EDEDED] font-mono text-sm font-bold focus:border-[#C8A951] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#EDEDED] font-medium">شماره گواهی کنترل کیفی / آزمایشگاه</label>
                    <input
                      type="text"
                      placeholder="مثال: QC-K18-99102"
                      value={actionAssayCert}
                      onChange={(e) => setActionAssayCert(e.target.value)}
                      className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2 text-[#EDEDED] font-mono focus:border-[#C8A951] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium">توضیحات و گزارش عملکرد</label>
                <textarea
                  rows={2}
                  placeholder="ثبت اقدامات فنی انجام‌شده توسط استادکار یا کارشناس..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl p-3 text-[#EDEDED] focus:border-[#C8A951] outline-none resize-none"
                />
              </div>

              {/* Operator */}
              <div className="space-y-1.5">
                <label className="text-[#EDEDED] font-medium">نام اپراتور یا ناظر</label>
                <input
                  type="text"
                  value={actionOperatorName}
                  onChange={(e) => setActionOperatorName(e.target.value)}
                  className="w-full bg-[#1A1A28] border border-[#2C2C3E] rounded-xl px-3 py-2 text-[#EDEDED] focus:border-[#C8A951] outline-none"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242436]">
              <button
                type="button"
                onClick={() => setIsStageModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#9E9EA8] hover:text-[#EDEDED]"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleAdvanceStage}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C8A951] text-[#0D0D12] hover:bg-[#D8B961] shadow"
              >
                ثبت و به‌روزرسانی پرونده
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
