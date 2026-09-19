/**
 * Didar Gold Platform - Kernel 19 (K19) Dashboard Component
 * Buyback, Physical Condition Assay, Trade-In Valuation & Settlement Desk
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Coins,
  Repeat,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ArrowLeft,
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
  Award,
  Gem,
  Tag,
  CreditCard,
  Flame,
  ArrowDownLeft,
  ArrowUpRight,
  Calculator,
  Wallet,
  Check,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../lib/api.js';
import {
  BuybackRecord,
  K19DataPayload,
  K19Metrics,
  K19AuditLog,
  K19BuybackStage,
  K19BuybackSource,
  K19ConditionGrade,
  K19PayoutMethod,
  K19AssayMethod,
  K19PricingValuation
} from '../../types/k19.js';

export function K19Dashboard() {
  const [data, setData] = useState<K19DataPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'calculator' | 'intake' | 'assay' | 'settlement' | 'routing' | 'audit'>('records');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  // Selected Record & Modals
  const [selectedRecord, setSelectedRecord] = useState<BuybackRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState<boolean>(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState<boolean>(false);
  const [isAssayEditModalOpen, setIsAssayEditModalOpen] = useState<boolean>(false);

  // Settlement Form State
  const [settleMethod, setSettleMethod] = useState<K19PayoutMethod>('trade_in_voucher');
  const [settleTxRef, setSettleTxRef] = useState<string>('');
  const [settleOperator, setSettleOperator] = useState<string>('سرپرست امور مالی و تسویه طلا');

  // Routing Form State
  const [routingDestination, setRoutingDestination] = useState<'k20_refurbish_secondary' | 'k20_scrap_smelting' | 'k09_reserve_vault'>('k20_refurbish_secondary');
  const [routingNotes, setRoutingNotes] = useState<string>('');
  const [routingOperator, setRoutingOperator] = useState<string>('مدیر خزانه و کنترل دارایی');

  // Assay Edit Form State
  const [assayPurity, setAssayPurity] = useState<string>('0.750');
  const [assayGrossWeight, setAssayGrossWeight] = useState<string>('');
  const [assayTareWeight, setAssayTareWeight] = useState<string>('0');
  const [assayGemValuation, setAssayGemValuation] = useState<string>('0');
  const [assayConditionGrade, setAssayConditionGrade] = useState<K19ConditionGrade>('grade_b_normal');
  const [assayNotes, setAssayNotes] = useState<string>('');

  // Interactive Calculator State
  const [calcSource, setCalcSource] = useState<K19BuybackSource>('didar_passport_provenance');
  const [calcKaratPurity, setCalcKaratPurity] = useState<number>(0.750);
  const [calcGrossWeight, setCalcGrossWeight] = useState<number>(15.5);
  const [calcTareWeight, setCalcTareWeight] = useState<number>(0.2);
  const [calcHasGems, setCalcHasGems] = useState<boolean>(true);
  const [calcGemValuation, setCalcGemValuation] = useState<number>(12000000);
  const [calcGrade, setCalcGrade] = useState<K19ConditionGrade>('grade_a_mint');
  const [calcResult, setCalcResult] = useState<{ assay: any; valuation: K19PricingValuation } | null>(null);

  // Intake Form State
  const [intakeForm, setIntakeForm] = useState({
    itemUid: '',
    itemTitleFa: '',
    source: 'didar_passport_provenance' as K19BuybackSource,
    conditionGrade: 'grade_a_mint' as K19ConditionGrade,
    sellerFullName: '',
    sellerNationalId: '',
    sellerMobile: '',
    sellerBankIban: 'IR',
    sellerBankNameFa: 'بانک ملت',
    sellerCity: 'تهران',
    grossWeightGrams: '',
    tareWeightGrams: '0',
    testedKaratFa: '۱۸ عیار استاندارد (۷۵۰)',
    testedPurity: 0.750,
    hasPreciousStones: false,
    preciousStoneDescriptionFa: '',
    certifiedStoneValuationToman: '0',
    assayMethod: 'xrf_spectrometry' as K19AssayMethod,
    operatorNameFa: 'کارشناس عیارسنجی دیدار'
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load K19 Data
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getK19Data();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری اطلاعات هسته بازخرید (K19)');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Interactive Calculator when params change
  useEffect(() => {
    const runEstimate = async () => {
      try {
        if (calcGrossWeight > 0) {
          const res = await api.calculateK19Estimate({
            source: calcSource,
            purity: calcKaratPurity,
            grossWeightGrams: calcGrossWeight,
            tareWeightGrams: calcTareWeight,
            hasPreciousStones: calcHasGems,
            certifiedStoneValuationToman: calcHasGems ? calcGemValuation : 0,
            conditionGrade: calcGrade
          });
          setCalcResult(res);
        }
      } catch (err) {
        // silent fail on empty inputs
      }
    };
    runEstimate();
  }, [calcSource, calcKaratPurity, calcGrossWeight, calcTareWeight, calcHasGems, calcGemValuation, calcGrade]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    if (!data?.records) return [];
    return data.records.filter((rec) => {
      const matchSearch =
        rec.buybackNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.itemTitleFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.seller.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.seller.mobile.includes(searchQuery) ||
        rec.seller.nationalId.includes(searchQuery) ||
        (rec.itemUid && rec.itemUid.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStage = stageFilter === 'all' || rec.stage === stageFilter;
      const matchSource = sourceFilter === 'all' || rec.source === sourceFilter;
      const matchGrade = gradeFilter === 'all' || rec.conditionGrade === gradeFilter;

      return matchSearch && matchStage && matchSource && matchGrade;
    });
  }, [data?.records, searchQuery, stageFilter, sourceFilter, gradeFilter]);

  // Handle Intake Submission
  const handleSubmitIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeForm.itemTitleFa || !intakeForm.sellerFullName || !intakeForm.sellerNationalId || !intakeForm.sellerMobile || !intakeForm.grossWeightGrams) {
      setNotification({ type: 'error', message: 'لطفاً تمامی فیلدهای ستاره‌دار الزامی را تکمیل نمایید.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createK19Record({
        itemUid: intakeForm.itemUid || undefined,
        itemTitleFa: intakeForm.itemTitleFa,
        source: intakeForm.source,
        conditionGrade: intakeForm.conditionGrade,
        sellerFullName: intakeForm.sellerFullName,
        sellerNationalId: intakeForm.sellerNationalId,
        sellerMobile: intakeForm.sellerMobile,
        sellerBankIban: intakeForm.sellerBankIban,
        sellerBankNameFa: intakeForm.sellerBankNameFa,
        sellerCity: intakeForm.sellerCity,
        grossWeightGrams: Number(intakeForm.grossWeightGrams),
        tareWeightGrams: Number(intakeForm.tareWeightGrams || 0),
        testedKaratFa: intakeForm.testedKaratFa,
        testedPurity: Number(intakeForm.testedPurity),
        hasPreciousStones: intakeForm.hasPreciousStones,
        preciousStoneDescriptionFa: intakeForm.preciousStoneDescriptionFa || undefined,
        certifiedStoneValuationToman: Number(intakeForm.certifiedStoneValuationToman || 0),
        assayMethod: intakeForm.assayMethod,
        operatorNameFa: intakeForm.operatorNameFa
      });

      setNotification({
        type: 'success',
        message: `پرونده بازخرید ${res.data.buybackNumber} با موفقیت ثبت شد و پیشنهاد قیمت صادر گردید.`
      });

      setSelectedRecord(res.data);
      setIsReceiptModalOpen(true);
      setActiveTab('records');

      // Reset form
      setIntakeForm({
        itemUid: '',
        itemTitleFa: '',
        source: 'didar_passport_provenance',
        conditionGrade: 'grade_a_mint',
        sellerFullName: '',
        sellerNationalId: '',
        sellerMobile: '',
        sellerBankIban: 'IR',
        sellerBankNameFa: 'بانک ملت',
        sellerCity: 'تهران',
        grossWeightGrams: '',
        tareWeightGrams: '0',
        testedKaratFa: '۱۸ عیار استاندارد (۷۵۰)',
        testedPurity: 0.750,
        hasPreciousStones: false,
        preciousStoneDescriptionFa: '',
        certifiedStoneValuationToman: '0',
        assayMethod: 'xrf_spectrometry',
        operatorNameFa: 'کارشناس عیارسنجی دیدار'
      });

      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'خطا در ثبت پذیرش پرونده بازخرید' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Settlement Submission
  const handleConfirmSettlement = async () => {
    if (!selectedRecord) return;
    try {
      setIsSubmitting(true);
      const res = await api.settleK19Record(selectedRecord.id, {
        method: settleMethod,
        transactionRef: settleTxRef || undefined,
        operatorNameFa: settleOperator
      });

      setNotification({
        type: 'success',
        message: `تسویه حساب پرونده ${res.data.buybackNumber} به روش ${res.data.settlement.methodFa} با موفقیت انجام شد.`
      });

      setIsSettleModalOpen(false);
      setSelectedRecord(res.data);
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'خطا در انجام تسویه حساب' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Routing Submission
  const handleConfirmRouting = async () => {
    if (!selectedRecord) return;
    try {
      setIsSubmitting(true);
      const res = await api.routeK19Destination(selectedRecord.id, {
        destination: routingDestination,
        notesFa: routingNotes,
        operatorNameFa: routingOperator
      });

      setNotification({
        type: 'success',
        message: `قطعه پرونده ${res.data.buybackNumber} با موفقیت به ${res.data.routingDecision?.destinationFa} هدایت گردید.`
      });

      setIsRouteModalOpen(false);
      setSelectedRecord(res.data);
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'خطا در هدایت کالا به مقصد' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Assay Update
  const handleConfirmAssayUpdate = async () => {
    if (!selectedRecord) return;
    try {
      setIsSubmitting(true);
      const res = await api.updateK19Assay(selectedRecord.id, {
        testedPurity: Number(assayPurity),
        grossWeightGrams: Number(assayGrossWeight),
        tareWeightGrams: Number(assayTareWeight),
        certifiedStoneValuationToman: Number(assayGemValuation),
        conditionGrade: assayConditionGrade,
        notesFa: assayNotes,
        operatorNameFa: 'کارشناس ارشد آزمایشگاه و ری‌گیری'
      });

      setNotification({
        type: 'success',
        message: `کارشناسی و عیارسنجی پرونده ${res.data.buybackNumber} به‌روزرسانی شد و ارزش بازخرید مجدداً محاسبه گردید.`
      });

      setIsAssayEditModalOpen(false);
      setSelectedRecord(res.data);
      await loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'خطا در به‌روزرسانی عیارسنجی' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-fill Intake from Calculator
  const handleTransferCalcToIntake = () => {
    setIntakeForm((prev) => ({
      ...prev,
      source: calcSource,
      testedPurity: calcKaratPurity,
      testedKaratFa: calcKaratPurity === 0.75 ? '۱۸ عیار استاندارد (۷۵۰)' : `${calcKaratPurity * 1000} عیار`,
      grossWeightGrams: String(calcGrossWeight),
      tareWeightGrams: String(calcTareWeight),
      hasPreciousStones: calcHasGems,
      certifiedStoneValuationToman: String(calcGemValuation),
      conditionGrade: calcGrade,
      itemTitleFa: calcSource === 'didar_passport_provenance' ? 'محصول اصیل شناسنامه‌دار دیدار' : 'طلای ۱۸ عیار تحویلی مشتری'
    }));
    setActiveTab('intake');
  };

  const getStageBadge = (stage: K19BuybackStage) => {
    switch (stage) {
      case 'quotation_requested':
        return { label: 'استعلام قیمت اولیه', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'intake_assay_inspecting':
        return { label: 'عیارسنجی و آزمون فیزیکی', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'valuation_offer_ready':
        return { label: 'پیشنهاد قیمت آماده تسویه', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
      case 'offer_accepted_settling':
        return { label: 'در حال تسویه مالی', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      case 'settled_payout_completed':
        return { label: 'تسویه کامل انجام شد', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'vault_custody_routed':
        return { label: 'هدایت به خزانه / K20', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      case 'cancelled_rejected':
        return { label: 'لغو یا رد اصالت/عیار', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      default:
        return { label: stage, bg: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in slide-in-from-top-4 duration-200 ${
            notification.type === 'success'
              ? 'bg-[#18261F] border-[#3DD68C]/40 text-[#3DD68C]'
              : 'bg-[#2A181A] border-[#E5484D]/40 text-[#FF6B6B]'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#3DD68C] shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner & Live Benchmark Info */}
      <div className="bg-gradient-to-l from-[#1C1C24] via-[#181822] to-[#14141A] rounded-2xl border border-[#2D2D3C] p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8A951]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E5C365] via-[#C8A951] to-[#8C6D23] flex items-center justify-center shadow-lg shadow-[#C8A951]/20 border border-[#F4DC98]/40">
              <Coins className="w-6 h-6 text-[#141416]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-[#F4F4F6]">بازخرید تضمینی و معاوضه طلا (K19)</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 text-[11px] font-bold">
                  Kernel Domain K19
                </span>
              </div>
              <p className="text-xs text-[#9E9EA8] mt-0.5">
                کارشناسی اصالت و عیارسنجی، فرمول شفاف قیمت‌گذاری، واریز آنی بین‌بانکی یا معاوضه با ۲.۵٪ شارژ تشویقی و اتصال مستقیم به K20
              </p>
            </div>
          </div>

          {/* Benchmark Gold Price Indicator */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-[#14141C] border border-[#2C2C3E] flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3DD68C] animate-pulse"></div>
              <div>
                <div className="text-[10px] text-[#868698]">مظنه مرجع هر گرم طلای ۱۸ عیار (K13)</div>
                <div className="text-sm font-bold text-[#E5C365] font-mono">
                  {data?.currentGoldPrice?.gram18kToman
                    ? `${data.currentGoldPrice.gram18kToman.toLocaleString('fa-IR')} تومان`
                    : '۶,۱۵۰,۰۰۰ تومان'}
                </div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-[#14141C] border border-[#2C2C3E] flex items-center gap-3">
              <Award className="w-4 h-4 text-[#C8A951]" />
              <div>
                <div className="text-[10px] text-[#868698]">پاداش اصالت شناسنامه دیدار</div>
                <div className="text-sm font-bold text-[#3DD68C] font-mono">+۱.۵٪ بالاتر از بازار</div>
              </div>
            </div>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-[#20202C] border border-[#2E2E40] text-[#C8A951] hover:bg-[#282836] transition-colors"
              title="تازه‌سازی اطلاعات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-[#262634]">
          <div className="bg-[#121218] p-3 rounded-xl border border-[#22222E]">
            <div className="text-[11px] text-[#868698]">کل پرونده‌های بازخرید</div>
            <div className="text-base font-bold text-[#EDEDED] font-mono mt-0.5">
              {data?.metrics?.totalBuybacksCount ? data.metrics.totalBuybacksCount.toLocaleString('fa-IR') : '۰'}
            </div>
            <div className="text-[10px] text-[#9E9EA8] mt-0.5">ثبت در سیستم</div>
          </div>

          <div className="bg-[#121218] p-3 rounded-xl border border-[#22222E]">
            <div className="text-[11px] text-[#868698]">در حال کارشناسی و پیشنهاد</div>
            <div className="text-base font-bold text-[#E5C365] font-mono mt-0.5">
              {data?.metrics?.activeInspectionsCount ? data.metrics.activeInspectionsCount.toLocaleString('fa-IR') : '۰'}
            </div>
            <div className="text-[10px] text-[#E5C365] mt-0.5">اقدام در شعبه</div>
          </div>

          <div className="bg-[#121218] p-3 rounded-xl border border-[#22222E]">
            <div className="text-[11px] text-[#868698]">مجموع طلای بازخرید شده</div>
            <div className="text-base font-bold text-[#3DD68C] font-mono mt-0.5">
              {data?.metrics?.totalGoldAcquiredGrams ? `${data.metrics.totalGoldAcquiredGrams.toLocaleString('fa-IR')} گرم` : '۰'}
            </div>
            <div className="text-[10px] text-[#3DD68C] mt-0.5">معادل ۱۸ عیار (۷۵۰)</div>
          </div>

          <div className="bg-[#121218] p-3 rounded-xl border border-[#22222E]">
            <div className="text-[11px] text-[#868698]">ارزش کل تسویه شده</div>
            <div className="text-base font-bold text-[#EDEDED] font-mono mt-0.5">
              {data?.metrics?.totalCompletedVolumeToman
                ? `${Math.round(data.metrics.totalCompletedVolumeToman / 1000000).toLocaleString('fa-IR')} م.ت`
                : '۰'}
            </div>
            <div className="text-[10px] text-[#9E9EA8] mt-0.5">واریز شبا / بن / کیف طلا</div>
          </div>

          <div className="bg-[#121218] p-3 rounded-xl border border-[#22222E]">
            <div className="text-[11px] text-[#868698]">نرخ تبدیل معاوضه طلای نو</div>
            <div className="text-base font-bold text-[#C8A951] font-mono mt-0.5">
              %{data?.metrics?.tradeInConversionPercentage || 0}
            </div>
            <div className="text-[10px] text-[#C8A951] mt-0.5">با بونوس ۲.۵٪</div>
          </div>

          <div className="bg-[#121218] p-3 rounded-xl border border-[#22222E]">
            <div className="text-[11px] text-[#868698]">میانگین زمان تسویه</div>
            <div className="text-base font-bold text-[#3DD68C] font-mono mt-0.5">
              {data?.metrics?.avgSettlementMinutes || 24} دقیقه
            </div>
            <div className="text-[10px] text-[#3DD68C] mt-0.5">پایا / شارژ آنی</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#252532] pb-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          {[
            { id: 'records', label: 'کارتابل پرونده‌های بازخرید', icon: FileText, count: data?.records?.length },
            { id: 'calculator', label: 'محاسبه‌گر زنده بازخرید و معاوضه', icon: Calculator },
            { id: 'intake', label: 'پذیرش و کارشناسی جدید', icon: Plus },
            { id: 'assay', label: 'میز عیارسنجی و ری‌گیری', icon: Scale },
            { id: 'settlement', label: 'میز تسویه شبا و بن معاوضه', icon: CreditCard },
            { id: 'routing', label: 'سرنوشت کالا و اتصال به K20', icon: Repeat },
            { id: 'audit', label: 'دفتر ممیزی و احراز هویت AML', icon: ShieldCheck, count: data?.auditLogs?.length }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#C8A951] text-[#141416] font-bold shadow-md shadow-[#C8A951]/15'
                    : 'bg-[#181822] text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#20202D] border border-[#2B2B3C]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
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
      </div>

      {/* TAB 1: BUYBACK RECORDS DIRECTORY */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[#181822] p-4 rounded-xl border border-[#2A2A3A] flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#868698]" />
              <input
                type="text"
                placeholder="جستجو بر اساس شماره پرونده، نام فروشنده، همراه، UID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-[#121218] border border-[#2C2C3C] rounded-lg text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-[#868698]">
                <Filter className="w-3.5 h-3.5" />
                <span>مرحله:</span>
              </div>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#121218] border border-[#2C2C3C] rounded-lg text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                <option value="all">همه مراحل پرونده</option>
                <option value="quotation_requested">استعلام اولیه</option>
                <option value="intake_assay_inspecting">عیارسنجی فیزیکی</option>
                <option value="valuation_offer_ready">پیشنهاد قیمت آماده</option>
                <option value="settled_payout_completed">تسویه شده</option>
                <option value="vault_custody_routed">هدایت به خزانه / K20</option>
              </select>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#121218] border border-[#2C2C3C] rounded-lg text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                <option value="all">همه اصالت‌ها</option>
                <option value="didar_passport_provenance">پاسپورت دیدار (+۱.۵٪)</option>
                <option value="external_market_gold">طلای متفرقه ۱۸ عیار</option>
                <option value="broken_scrap">طلای ضایعاتی و کوره</option>
              </select>

              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-[#121218] border border-[#2C2C3C] rounded-lg text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                <option value="all">همه درجات سلامت</option>
                <option value="grade_a_mint">درجه ۱ (نو ویترینی)</option>
                <option value="grade_b_normal">درجه ۲ (سالم با پرداخت)</option>
                <option value="grade_c_melt_scrap">درجه ۳ (شکسته/کوره ذوب)</option>
              </select>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-[#181822] rounded-xl border border-[#2A2A3A] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-[#14141C] text-[#868698] border-b border-[#242432]">
                    <th className="py-3 px-4">شماره پرونده / تاریخ</th>
                    <th className="py-3 px-4">عنوان قطعه و اصالت</th>
                    <th className="py-3 px-4">فروشنده و احراز AML</th>
                    <th className="py-3 px-4">وزن ناخالص / خالص ۷۵۰</th>
                    <th className="py-3 px-4">ارزش نقدی / معاوضه</th>
                    <th className="py-3 px-4">مرحله گردش کار</th>
                    <th className="py-3 px-4">تسویه و سرنوشت</th>
                    <th className="py-3 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222230]">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#868698]">
                        هیچ پرونده بازخریدی مطابق با فیلترهای اعمال‌شده یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => {
                      const badge = getStageBadge(rec.stage);
                      return (
                        <tr key={rec.id} className="hover:bg-[#1D1D28] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#EDEDED] font-mono">{rec.buybackNumber}</div>
                            <div className="text-[11px] text-[#868698] mt-0.5">{rec.createdAtFa}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-[#F4F4F6] line-clamp-1">{rec.itemTitleFa}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                  rec.source === 'didar_passport_provenance'
                                    ? 'bg-[#C8A951]/10 text-[#E5C365] border-[#C8A951]/30'
                                    : rec.source === 'broken_scrap'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                }`}
                              >
                                {rec.sourceFa}
                              </span>
                              <span className="text-[10px] text-[#868698] font-mono">{rec.conditionGradeFa.split('(')[0]}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-[#EDEDED]">{rec.seller.fullName}</div>
                            <div className="text-[11px] text-[#868698] font-mono mt-0.5 flex items-center gap-1">
                              <span>{rec.seller.mobile}</span>
                              {rec.seller.amlClearanceConfirmed && (
                                <ShieldCheck className="w-3.5 h-3.5 text-[#3DD68C]" title="احراز هویت و عدم سوء‌پیشینه AML تایید شد" />
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#EDEDED] font-mono">
                              {rec.assay.grossWeightGrams.toFixed(3)} گرم
                            </div>
                            <div className="text-[11px] text-[#3DD68C] font-mono mt-0.5">
                              خالص: {rec.assay.equivalent750WeightGrams.toFixed(3)} گرم
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#E5C365] font-mono">
                              {rec.valuation.finalCashPayoutToman.toLocaleString('fa-IR')} تومان
                            </div>
                            <div className="text-[11px] text-[#3DD68C] font-mono mt-0.5" title="با ۲.۵٪ بونوس معاوضه طلای نو">
                              معاوضه: {rec.valuation.finalTradeInPayoutToman.toLocaleString('fa-IR')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-[11px] text-[#EDEDED]">
                              {rec.settlement.isSettled ? (
                                <span className="text-[#3DD68C] flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>{rec.settlement.methodFa.split('(')[0]}</span>
                                </span>
                              ) : (
                                <span className="text-[#E5C365]">در انتظار تسویه</span>
                              )}
                            </div>
                            {rec.routingDecision && (
                              <div className="text-[10px] text-[#9E9EA8] line-clamp-1 mt-0.5">
                                {rec.routingDecision.destinationFa.split('(')[0]}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedRecord(rec)}
                                className="p-1.5 rounded-lg bg-[#242432] text-[#B5B5C2] hover:text-[#EDEDED] hover:bg-[#2C2C3E] transition-colors"
                                title="مشاهده جزئیات کامل"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRecord(rec);
                                  setIsReceiptModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-[#C8A951]/10 text-[#C8A951] hover:bg-[#C8A951]/20 transition-colors"
                                title="چاپ قبض رسمی بازخرید"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              {!rec.settlement.isSettled && (
                                <button
                                  onClick={() => {
                                    setSelectedRecord(rec);
                                    setIsSettleModalOpen(true);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-[#3DD68C]/15 text-[#3DD68C] hover:bg-[#3DD68C]/25 text-[11px] font-bold transition-colors"
                                >
                                  تسویه
                                </button>
                              )}
                              {rec.settlement.isSettled && !rec.routingDecision && (
                                <button
                                  onClick={() => {
                                    setSelectedRecord(rec);
                                    setIsRouteModalOpen(true);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 text-[11px] font-bold transition-colors"
                                >
                                  هدایت K20
                                </button>
                              )}
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

      {/* TAB 2: LIVE INTERACTIVE CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form (7 Cols) */}
          <div className="lg:col-span-7 bg-[#181822] rounded-2xl border border-[#2A2A3A] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#252534] pb-4">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-[#C8A951]" />
                <h3 className="text-base font-bold text-[#F4F4F6]">محاسبه‌گر ارزش روز بازخرید و معاوضه طلای دیدار</h3>
              </div>
              <span className="text-xs text-[#3DD68C] font-mono">نرخ زنده ۱۸ عیار: ۶,۱۵۰,۰۰۰ ت</span>
            </div>

            {/* Source Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#868698] font-medium">نوع و اصالت قطعه طلا</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'didar_passport_provenance',
                    title: 'پاسپورت اصیل دیدار',
                    desc: 'خرید تضمینی با +۱.۵٪ پاداش ویژه',
                    icon: Award,
                    color: 'border-[#C8A951] bg-[#C8A951]/10 text-[#E5C365]'
                  },
                  {
                    id: 'external_market_gold',
                    title: 'طلای متفرقه ۱۸ عیار',
                    desc: 'خرید به نرخ استاندارد روز بازار',
                    icon: Coins,
                    color: 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                  },
                  {
                    id: 'broken_scrap',
                    title: 'طلای شکسته و کوره ذوب',
                    desc: 'کسر هزینه بوته و ری‌گیری رسمی',
                    icon: Flame,
                    color: 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                  }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCalcSource(s.id as any)}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      calcSource === s.id ? s.color : 'border-[#292938] bg-[#14141C] text-[#868698] hover:border-[#3D3D4E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{s.title}</span>
                      <s.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] mt-1 opacity-80">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weights and Karat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#868698]">عیار و خلوص طلا</label>
                <select
                  value={calcKaratPurity}
                  onChange={(e) => setCalcKaratPurity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                >
                  <option value={0.75}>۱۸ عیار استاندارد (۷۵۰.۰)</option>
                  <option value={0.745}>۱۸ عیار تجاری متفرقه (۷۴۵.۰)</option>
                  <option value={0.705}>۱۷ عیار (۷۰۵.۰)</option>
                  <option value={0.875}>۲۱ عیار (۸۷۵.۰)</option>
                  <option value={0.995}>شمش آب‌شده استاندارد (۹۹۵.۰)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#868698]">وزن ناخالص کل (گرم)</label>
                <input
                  type="number"
                  step="0.001"
                  value={calcGrossWeight}
                  onChange={(e) => setCalcGrossWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#868698]">کسر تاره، چرم و نگین اتمی (گرم)</label>
                <input
                  type="number"
                  step="0.001"
                  value={calcTareWeight}
                  onChange={(e) => setCalcTareWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                />
              </div>
            </div>

            {/* Condition Grade */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#868698]">درجه سلامت و وضعیت فیزیکی قطعه</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'grade_a_mint', label: 'درجه ۱: نو و بی‌نقص (ویترینی)' },
                  { id: 'grade_b_normal', label: 'درجه ۲: سالم با ساییدگی جزئی' },
                  { id: 'grade_c_melt_scrap', label: 'درجه ۳: شکسته و مناسب ذوب' }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setCalcGrade(g.id as any)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      calcGrade === g.id
                        ? 'border-[#C8A951] bg-[#C8A951]/15 text-[#E5C365] font-bold'
                        : 'border-[#2A2A38] bg-[#14141C] text-[#868698]'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Precious Gems Section */}
            <div className="p-4 rounded-xl bg-[#14141C] border border-[#262634] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gem className="w-4 h-4 text-[#C8A951]" />
                  <span className="text-xs font-semibold text-[#EDEDED]">محاسبه ارزش گوهرسنگ و برلیان طبیعی شناسنامه‌دار</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calcHasGems}
                    onChange={(e) => setCalcHasGems(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#2B2B38] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C8A951]"></div>
                </label>
              </div>

              {calcHasGems && (
                <div className="pt-2 border-t border-[#222230] space-y-1.5">
                  <label className="text-xs text-[#868698]">ارزش کارشناسی گوهرسنگ بر اساس شناسنامه معتبر (تومان)</label>
                  <input
                    type="number"
                    value={calcGemValuation}
                    onChange={(e) => setCalcGemValuation(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                  />
                  <span className="text-[10px] text-[#3DD68C]">
                    معادل: {(calcGemValuation / 1000000).toLocaleString('fa-IR')} میلیون تومان به مبلغ بازخرید اضافه می‌شود.
                  </span>
                </div>
              )}
            </div>

            {/* Action CTA */}
            <button
              onClick={handleTransferCalcToIntake}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E5C365] to-[#C8A951] text-[#141416] font-bold text-xs shadow-lg shadow-[#C8A951]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <span>انتقال این برآورد به فرم پذیرش رسمی بازخرید</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>

          {/* Real-time Transparent Price Breakdown (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#1C1C26] to-[#14141C] rounded-2xl border border-[#2E2E3E] p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between border-b border-[#2B2B3C] pb-3.5">
                <span className="text-xs text-[#868698] font-bold">فرمول شفاف قیمت‌گذاری بازخرید دیدار</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#3DD68C]/15 text-[#3DD68C] font-mono">بدون کسر پنهان</span>
              </div>

              {calcResult && (
                <div className="space-y-3 mt-4 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-[#242432]">
                    <span className="text-[#868698]">وزن ناخالص قطعه</span>
                    <span className="font-mono text-[#EDEDED]">{calcResult.assay.grossWeightGrams.toFixed(3)} گرم</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#242432]">
                    <span className="text-[#868698]">کسر ناخالصی و تاره</span>
                    <span className="font-mono text-rose-400">- {calcResult.assay.tareWeightGrams.toFixed(3)} گرم</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#242432]">
                    <span className="text-[#868698]">وزن خالص طلای معادل ۱۸ عیار (۷۵۰)</span>
                    <span className="font-mono font-bold text-[#3DD68C]">{calcResult.assay.equivalent750WeightGrams.toFixed(3)} گرم</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-[#242432]">
                    <span className="text-[#868698]">ارزش طلای خام بر اساس نرخ زنده</span>
                    <span className="font-mono text-[#EDEDED]">{calcResult.valuation.rawGoldValueToman.toLocaleString('fa-IR')} تومان</span>
                  </div>

                  {calcResult.valuation.provenanceBonusToman > 0 && (
                    <div className="flex items-center justify-between py-1.5 border-b border-[#242432] bg-[#C8A951]/5 px-2 rounded-lg">
                      <span className="text-[#E5C365]">پاداش اصالت شناسنامه دیجیتال دیدار (+۱.۵٪)</span>
                      <span className="font-mono font-bold text-[#3DD68C]">
                        + {calcResult.valuation.provenanceBonusToman.toLocaleString('fa-IR')} ت
                      </span>
                    </div>
                  )}

                  {calcResult.valuation.certifiedGemValueToman > 0 && (
                    <div className="flex items-center justify-between py-1.5 border-b border-[#242432] bg-[#3DD68C]/5 px-2 rounded-lg">
                      <span className="text-[#3DD68C]">ارزش کارشناسی گوهرسنگ</span>
                      <span className="font-mono font-bold text-[#3DD68C]">
                        + {calcResult.valuation.certifiedGemValueToman.toLocaleString('fa-IR')} ت
                      </span>
                    </div>
                  )}

                  {calcResult.valuation.handlingOrRefiningDeductionToman > 0 && (
                    <div className="flex items-center justify-between py-1.5 border-b border-[#242432]">
                      <span className="text-rose-400">هزینه ذوب، بوته یا کارمزد تست متفرقه</span>
                      <span className="font-mono text-rose-400">
                        - {calcResult.valuation.handlingOrRefiningDeductionToman.toLocaleString('fa-IR')} ت
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payout Options Visual Cards */}
            {calcResult && (
              <div className="space-y-3 pt-4 border-t border-[#2B2B3C]">
                {/* Option 1: Cash Bank Transfer */}
                <div className="p-3.5 rounded-xl bg-[#14141C] border border-[#2D2D3E] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-[#868698] flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                      <span>تسویه واریز بین‌بانکی شبا (پایا/ساتنا)</span>
                    </div>
                    <div className="text-sm font-bold text-[#EDEDED] font-mono mt-1">
                      {calcResult.valuation.finalCashPayoutToman.toLocaleString('fa-IR')} تومان
                    </div>
                  </div>
                  <span className="text-[10px] text-[#3DD68C]">تسویه در ۲۴ دقیقه</span>
                </div>

                {/* Option 2: Trade-In Voucher (Bonus +2.5%) */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#C8A951]/20 via-[#C8A951]/10 to-transparent border border-[#C8A951]/50 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-[#E5C365] font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#C8A951]" />
                      <span>بن معاوضه طلای نو (با ۲.۵٪ بونوس تشویقی)</span>
                    </div>
                    <div className="text-base font-bold text-[#E5C365] font-mono mt-1">
                      {calcResult.valuation.finalTradeInPayoutToman.toLocaleString('fa-IR')} تومان
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#3DD68C] px-2 py-0.5 rounded bg-[#3DD68C]/15 border border-[#3DD68C]/30">
                    + {calcResult.valuation.tradeInIncentiveToman.toLocaleString('fa-IR')} تومان هدیه
                  </span>
                </div>

                {/* Option 3: Gold Wallet Weight */}
                <div className="p-3.5 rounded-xl bg-[#14141C] border border-[#2D2D3E] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-[#868698] flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-[#3DD68C]" />
                      <span>شارژ کیف طلای دیجیتال K09 (بدون کسر ریالی)</span>
                    </div>
                    <div className="text-sm font-bold text-[#3DD68C] font-mono mt-1">
                      {calcResult.valuation.equivalentGoldSoot.toLocaleString('fa-IR')} سوت طلا
                    </div>
                  </div>
                  <span className="text-[10px] text-[#9E9EA8]">حفظ ارزش در برابر تورم</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NEW BUYBACK INTAKE FORM */}
      {activeTab === 'intake' && (
        <form onSubmit={handleSubmitIntake} className="bg-[#181822] rounded-2xl border border-[#2A2A3A] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#252534] pb-4">
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5 text-[#C8A951]" />
              <div>
                <h3 className="text-base font-bold text-[#F4F4F6]">پذیرش حضوری و کارشناسی فیزیکی قطعه بازخرید</h3>
                <p className="text-xs text-[#868698]">احراز هویت AML، توزین آزمایشگاهی، آزمون عیار و صدور قبض رسمی امانی</p>
              </div>
            </div>
            <span className="text-xs text-[#C8A951] font-mono">استاندارد بازخرید دیدار</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right Column: Piece Specifications */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#C8A951] flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>مشخصات فنی و اصالت طلا</span>
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs text-[#868698]">اصالت و منبع قطعه *</label>
                <select
                  value={intakeForm.source}
                  onChange={(e) => setIntakeForm({ ...intakeForm, source: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                >
                  <option value="didar_passport_provenance">پاسپورت اصیل دیدار (+۱.۵٪ پاداش خرید بالاتر)</option>
                  <option value="external_market_gold">طلای ۱۸ عیار متفرقه بازاری و کارکرده</option>
                  <option value="broken_scrap">طلای آسیب‌دیده، شکسته و کوره ذوب</option>
                  <option value="coin_bullion">مسکوکات بانکی و شمش استاندارد</option>
                </select>
              </div>

              {intakeForm.source === 'didar_passport_provenance' && (
                <div className="space-y-1.5">
                  <label className="text-xs text-[#868698]">شناسه یکتای پاسپورت طلا (UID) K06/K17</label>
                  <input
                    type="text"
                    placeholder="مثال: DID-AU750-2026-8820-001"
                    value={intakeForm.itemUid}
                    onChange={(e) => setIntakeForm({ ...intakeForm, itemUid: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-[#868698]">عنوان دقیق قطعه طلا *</label>
                <input
                  type="text"
                  placeholder="مثال: دستبند طلا ۱۸ عیار کارتیه مدل میخ نگین‌دار"
                  value={intakeForm.itemTitleFa}
                  onChange={(e) => setIntakeForm({ ...intakeForm, itemTitleFa: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#868698]">عیار رسمی *</label>
                  <input
                    type="text"
                    value={intakeForm.testedKaratFa}
                    onChange={(e) => setIntakeForm({ ...intakeForm, testedKaratFa: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#868698]">درجه سلامت ظاهری</label>
                  <select
                    value={intakeForm.conditionGrade}
                    onChange={(e) => setIntakeForm({ ...intakeForm, conditionGrade: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                  >
                    <option value="grade_a_mint">درجه ۱ (نو و بی‌نقص ویترینی)</option>
                    <option value="grade_b_normal">درجه ۲ (سالم با خط و خش سطحی)</option>
                    <option value="grade_c_melt_scrap">درجه ۳ (شکسته و مناسب کوره ذوب)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#868698]">وزن ناخالص ترازو (گرم) *</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={intakeForm.grossWeightGrams}
                    onChange={(e) => setIntakeForm({ ...intakeForm, grossWeightGrams: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#868698]">وزن کسر تاره / نگین اتمی (گرم)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={intakeForm.tareWeightGrams}
                    onChange={(e) => setIntakeForm({ ...intakeForm, tareWeightGrams: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#868698]">روش عیارسنجی آزمایشگاهی</label>
                <select
                  value={intakeForm.assayMethod}
                  onChange={(e) => setIntakeForm({ ...intakeForm, assayMethod: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                >
                  <option value="xrf_spectrometry">طیف‌سنجی غیرمخرب اشعه ایکس XRF</option>
                  <option value="touchstone_acid">سنگ محک و اسید استاندارد ۱۸ عیار</option>
                  <option value="refinery_melt_sample">نمونه‌برداری و کوپلاسیون ری‌گیری رسمی</option>
                </select>
              </div>
            </div>

            {/* Left Column: Seller Identity & AML Verification */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#3DD68C] flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>احراز هویت فروشنده و الزامات ضد پول‌شویی (AML)</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#868698]">نام و نام خانوادگی مالک *</label>
                  <input
                    type="text"
                    placeholder="مثال: خانم سپیده رفیعی"
                    value={intakeForm.sellerFullName}
                    onChange={(e) => setIntakeForm({ ...intakeForm, sellerFullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#868698]">کد ملی ۱۰ رقمی *</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="مثال: 0012345678"
                    value={intakeForm.sellerNationalId}
                    onChange={(e) => setIntakeForm({ ...intakeForm, sellerNationalId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#868698]">شماره تلفن همراه *</label>
                  <input
                    type="text"
                    placeholder="0912..."
                    value={intakeForm.sellerMobile}
                    onChange={(e) => setIntakeForm({ ...intakeForm, sellerMobile: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#868698]">شهر سکونت</label>
                  <input
                    type="text"
                    value={intakeForm.sellerCity}
                    onChange={(e) => setIntakeForm({ ...intakeForm, sellerCity: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#868698]">شماره شبای بانکی جهت واریز وجه (پایا/ساتنا)</label>
                <input
                  type="text"
                  placeholder="IR..."
                  value={intakeForm.sellerBankIban}
                  onChange={(e) => setIntakeForm({ ...intakeForm, sellerBankIban: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono text-left focus:border-[#C8A951]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#868698]">نام بانک مقصد</label>
                <input
                  type="text"
                  value={intakeForm.sellerBankNameFa}
                  onChange={(e) => setIntakeForm({ ...intakeForm, sellerBankNameFa: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                />
              </div>

              {/* AML Confirmation Box */}
              <div className="p-3.5 rounded-xl bg-[#14141C] border border-[#262634] flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#3DD68C] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#868698] leading-relaxed">
                  احراز تطابق نام دارنده شماره شبا با کد ملی ثبت‌شده در سامانه سیاح بانک مرکزی انجام می‌گردد. همچنین قطعه از نظر گزارش سرقت در سامانه K17 استعلام می‌شود.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#252534]">
            <button
              type="button"
              onClick={() => setActiveTab('records')}
              className="px-4 py-2.5 rounded-xl bg-[#20202C] text-[#9E9EA8] hover:text-[#EDEDED] text-xs font-semibold"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E5C365] to-[#C8A951] text-[#141416] font-bold text-xs shadow-lg shadow-[#C8A951]/20 hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'در حال ثبت...' : 'ثبت پذیرش و محاسبه رسمی بازخرید'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: ASSAY & LAB BENCH */}
      {activeTab === 'assay' && (
        <div className="space-y-4">
          <div className="bg-[#181822] p-4 rounded-xl border border-[#2A2A3A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-[#C8A951]" />
              <div>
                <h3 className="text-sm font-bold text-[#F4F4F6]">میز کارشناسی، ری‌گیری و عیارسنجی تخصصی</h3>
                <p className="text-xs text-[#868698]">کالیبراسیون سارتوریوس آزمایشگاهی و ثبت دقیق افت وزن و نگین</p>
              </div>
            </div>
            <span className="text-xs text-[#3DD68C] font-mono">ترازوهای دارای گواهی بازرسی فعال</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.records.map((rec) => (
              <div key={rec.id} className="bg-[#181822] rounded-xl border border-[#2A2A3A] p-4 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-[#252534] pb-2.5">
                    <span className="font-mono text-xs font-bold text-[#E5C365]">{rec.buybackNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#252534] text-[#868698] font-mono">{rec.createdAtFa}</span>
                  </div>

                  <div className="mt-2.5">
                    <h4 className="text-xs font-bold text-[#EDEDED]">{rec.itemTitleFa}</h4>
                    <p className="text-[11px] text-[#868698] mt-0.5">فروشنده: {rec.seller.fullName}</p>
                  </div>

                  <div className="mt-3 p-3 rounded-lg bg-[#14141C] border border-[#222230] space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#868698]">روش عیارسنجی:</span>
                      <span className="text-[#EDEDED]">{rec.assay.methodFa}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#868698]">عیار تاییدشده:</span>
                      <span className="text-[#3DD68C] font-mono font-bold">{rec.assay.testedKaratFa}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#868698]">وزن ناخالص:</span>
                      <span className="text-[#EDEDED] font-mono">{rec.assay.grossWeightGrams.toFixed(3)} گرم</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#868698]">کسر تاره:</span>
                      <span className="text-rose-400 font-mono">- {rec.assay.tareWeightGrams.toFixed(3)} گرم</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#222230]">
                      <span className="text-[#868698]">خالص معادل ۷۵۰:</span>
                      <span className="text-[#E5C365] font-mono font-bold">{rec.assay.equivalent750WeightGrams.toFixed(3)} گرم</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#252534] flex items-center justify-between">
                  <span className="text-[10px] text-[#868698]">{rec.assay.assayOperatorFa}</span>
                  <button
                    onClick={() => {
                      setSelectedRecord(rec);
                      setAssayPurity(String(rec.assay.testedPurity));
                      setAssayGrossWeight(String(rec.assay.grossWeightGrams));
                      setAssayTareWeight(String(rec.assay.tareWeightGrams));
                      setAssayGemValuation(String(rec.assay.certifiedStoneValuationToman || 0));
                      setAssayConditionGrade(rec.conditionGrade);
                      setAssayNotes(rec.assay.assayNotesFa || '');
                      setIsAssayEditModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#C8A951]/15 text-[#C8A951] hover:bg-[#C8A951]/25 text-xs font-semibold transition-colors"
                  >
                    ویرایش توزین و آزمون
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SETTLEMENT & TRADE-IN DESK */}
      {activeTab === 'settlement' && (
        <div className="space-y-4">
          <div className="bg-[#181822] p-4 rounded-xl border border-[#2A2A3A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-[#3DD68C]" />
              <div>
                <h3 className="text-sm font-bold text-[#F4F4F6]">میز تسویه حساب، واریز شبا و صدور بن معاوضه</h3>
                <p className="text-xs text-[#868698]">مدیریت انتقال وجه بین‌بانکی، صدور ووچر خرید طلای نو و شارژ کیف طلای K09</p>
              </div>
            </div>
            <span className="text-xs text-[#E5C365] font-mono">تسویه تضمینی در کمتر از ۳۰ دقیقه</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.records.map((rec) => (
              <div key={rec.id} className="bg-[#181822] rounded-xl border border-[#2A2A3A] p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#252534] pb-2.5">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#E5C365]">{rec.buybackNumber}</span>
                    <span className="text-xs text-[#EDEDED] mr-2 font-medium">{rec.seller.fullName}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      rec.settlement.isSettled ? 'bg-[#3DD68C]/15 text-[#3DD68C]' : 'bg-[#E5C365]/15 text-[#E5C365]'
                    }`}
                  >
                    {rec.settlement.isSettled ? 'تسویه کامل' : 'در انتظار تسویه'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#14141C] border border-[#222230]">
                    <div className="text-[10px] text-[#868698]">مبلغ نقد شبا</div>
                    <div className="text-xs font-bold text-[#EDEDED] font-mono mt-0.5">
                      {rec.valuation.finalCashPayoutToman.toLocaleString('fa-IR')} تومان
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#14141C] border border-[#222230]">
                    <div className="text-[10px] text-[#E5C365]">ارزش بن معاوضه (با +۲.۵٪)</div>
                    <div className="text-xs font-bold text-[#E5C365] font-mono mt-0.5">
                      {rec.valuation.finalTradeInPayoutToman.toLocaleString('fa-IR')} تومان
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#868698] space-y-1">
                  <div>شماره شبا: <span className="font-mono text-[#EDEDED]">{rec.seller.bankIban}</span></div>
                  <div>بانک مقصد: <span className="text-[#EDEDED]">{rec.seller.bankNameFa}</span></div>
                  {rec.settlement.tradeInVoucherCode && (
                    <div className="text-[#3DD68C] font-mono">
                      کد بن معاوضه: <strong>{rec.settlement.tradeInVoucherCode}</strong>
                    </div>
                  )}
                  {rec.settlement.settlementRefCode && (
                    <div className="text-[#9E9EA8] font-mono">
                      کد پیگیری: {rec.settlement.settlementRefCode}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#252534] flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedRecord(rec);
                      setIsReceiptModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#242432] text-[#B5B5C2] hover:text-[#EDEDED] text-xs font-semibold"
                  >
                    رسید رسمی
                  </button>

                  {!rec.settlement.isSettled && (
                    <button
                      onClick={() => {
                        setSelectedRecord(rec);
                        setIsSettleModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#3DD68C] to-[#2BA86A] text-[#141416] font-bold text-xs shadow-md shadow-[#3DD68C]/20"
                    >
                      ثبت تسویه و پرداخت
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ROUTING & CONNECTION TO K20 */}
      {activeTab === 'routing' && (
        <div className="space-y-4">
          <div className="bg-[#181822] p-4 rounded-xl border border-[#2A2A3A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Repeat className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-sm font-bold text-[#F4F4F6]">زنجیره ارزش پس از بازخرید و اتصال به دامنه K20</h3>
                <p className="text-xs text-[#868698]">تفکیک قطعات جهت بازسازی و جلا در بازار ثانویه، یا ذوب و ری‌گیری شمش آب‌شده</p>
              </div>
            </div>
            <span className="text-xs text-purple-400 font-mono">Pipeline to K20</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.records.map((rec) => (
              <div key={rec.id} className="bg-[#181822] rounded-xl border border-[#2A2A3A] p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#252534] pb-2.5">
                  <span className="font-mono text-xs font-bold text-[#E5C365]">{rec.buybackNumber}</span>
                  <span className="text-xs text-[#EDEDED]">{rec.itemTitleFa}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#14141C] border border-[#222230] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#868698]">درجه سلامت:</span>
                    <span className="font-bold text-[#EDEDED]">{rec.conditionGradeFa}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#868698]">وزن طلا:</span>
                    <span className="font-mono text-[#3DD68C]">{rec.assay.equivalent750WeightGrams.toFixed(3)} گرم</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#868698]">سرنوشت فعلی:</span>
                    <span className="text-[#E5C365]">{rec.routingDecision ? rec.routingDecision.destinationFa : 'تعیین نشده'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#252534] flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedRecord(rec);
                      setIsRouteModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 text-xs font-bold transition-colors"
                  >
                    تغییر مقصد و ارسال به K20
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT TRAIL & AML */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-[#181822] p-4 rounded-xl border border-[#2A2A3A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#3DD68C]" />
              <div>
                <h3 className="text-sm font-bold text-[#F4F4F6]">دفتر کل ممیزی تغییرناپذیر بازخرید و انطباق AML</h3>
                <p className="text-xs text-[#868698]">ثبت وقایع، احراز کدهای ملی، تطابق شبا و امضای هش رمزنگاری‌شده</p>
              </div>
            </div>
            <span className="text-xs text-[#3DD68C] font-mono">Immutable Ledger</span>
          </div>

          <div className="bg-[#181822] rounded-xl border border-[#2A2A3A] overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-[#14141C] text-[#868698] border-b border-[#242432]">
                  <th className="py-3 px-4">شناسه لاگ / تاریخ</th>
                  <th className="py-3 px-4">شماره پرونده</th>
                  <th className="py-3 px-4">شرح اقدام</th>
                  <th className="py-3 px-4">کاربر مجری</th>
                  <th className="py-3 px-4">هش رمزنگاری</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222230]">
                {data?.auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1C1C26] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[#868698]">{log.timestampFa}</td>
                    <td className="py-3.5 px-4 font-bold font-mono text-[#E5C365]">{log.buybackNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#EDEDED]">{log.actionFa}</div>
                      <div className="text-[11px] text-[#868698] mt-0.5">{log.detailsFa}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#EDEDED]">{log.operatorNameFa}</td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-[#3DD68C]">{log.verifiedHash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: OFFICIAL BUYBACK & SETTLEMENT RECEIPT (PRINTABLE) */}
      {isReceiptModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#16161E] rounded-2xl border border-[#3A3A4C] max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#262634] pb-4">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#C8A951]" />
                <h3 className="text-base font-bold text-[#F4F4F6]">قبض رسمی بازخرید و تسویه طلای دیدار</h3>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-[#868698] hover:text-[#EDEDED] text-xs font-bold"
              >
                بستن (ESC)
              </button>
            </div>

            {/* Printable Document Area */}
            <div id="printable-buyback-receipt" className="p-6 bg-[#111116] rounded-xl border border-[#2B2B3C] space-y-5 text-xs text-[#EDEDED]">
              {/* Header Box */}
              <div className="flex items-center justify-between border-b border-[#2B2B3C] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C8A951] flex items-center justify-center text-[#141416] font-bold text-lg">
                    DG
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F4F4F6]">پلتفرم ملی زرین دیدار (سهامی خاص)</h4>
                    <span className="text-[10px] text-[#868698]">رسید رسمی معامله بازخرید طلا و جواهر طبق ضوابط اتحادیه</span>
                  </div>
                </div>
                <div className="text-left font-mono text-[11px] text-[#868698]">
                  <div>شماره پرونده: <strong className="text-[#E5C365]">{selectedRecord.buybackNumber}</strong></div>
                  <div>تاریخ پذیرش: <strong>{selectedRecord.createdAtFa}</strong></div>
                  <div>بارکد: <strong>{selectedRecord.receiptBarcode}</strong></div>
                </div>
              </div>

              {/* Seller Information */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-[#181822] border border-[#222230] text-[11px]">
                <div>
                  <span className="text-[#868698]">فروشنده:</span>
                  <div className="font-bold text-[#EDEDED] mt-0.5">{selectedRecord.seller.fullName}</div>
                </div>
                <div>
                  <span className="text-[#868698]">کد ملی:</span>
                  <div className="font-mono text-[#EDEDED] mt-0.5">{selectedRecord.seller.nationalId}</div>
                </div>
                <div>
                  <span className="text-[#868698]">شماره تماس:</span>
                  <div className="font-mono text-[#EDEDED] mt-0.5">{selectedRecord.seller.mobile}</div>
                </div>
                <div>
                  <span className="text-[#868698]">شهر / احراز:</span>
                  <div className="text-[#3DD68C] mt-0.5">تایید AML سامانه</div>
                </div>
              </div>

              {/* Gold Specifications Table */}
              <div className="border border-[#262636] rounded-lg overflow-hidden">
                <table className="w-full text-right text-[11px]">
                  <thead className="bg-[#181822] text-[#868698]">
                    <tr>
                      <th className="p-2.5">شرح کالا</th>
                      <th className="p-2.5">عیار</th>
                      <th className="p-2.5">وزن ناخالص</th>
                      <th className="p-2.5">کسر تاره</th>
                      <th className="p-2.5">خالص ۱۸ عیار</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242432]">
                    <tr>
                      <td className="p-2.5 font-semibold text-[#F4F4F6]">{selectedRecord.itemTitleFa}</td>
                      <td className="p-2.5 font-mono">{selectedRecord.assay.testedKaratFa}</td>
                      <td className="p-2.5 font-mono">{selectedRecord.assay.grossWeightGrams.toFixed(3)} گرم</td>
                      <td className="p-2.5 font-mono text-rose-400">{selectedRecord.assay.tareWeightGrams.toFixed(3)} گرم</td>
                      <td className="p-2.5 font-mono font-bold text-[#3DD68C]">{selectedRecord.assay.equivalent750WeightGrams.toFixed(3)} گرم</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Valuation & Settlement Breakdown */}
              <div className="p-3.5 rounded-lg bg-[#181822] border border-[#222230] space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#868698]">مظنه روز هر گرم طلای ۱۸ عیار:</span>
                  <span className="font-mono font-bold text-[#EDEDED]">{selectedRecord.valuation.benchmark18kGramPriceToman.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#868698]">ارزش طلای خام:</span>
                  <span className="font-mono text-[#EDEDED]">{selectedRecord.valuation.rawGoldValueToman.toLocaleString('fa-IR')} تومان</span>
                </div>
                {selectedRecord.valuation.provenanceBonusToman > 0 && (
                  <div className="flex items-center justify-between text-[#3DD68C]">
                    <span>پاداش اصالت شناسنامه دیجیتال دیدار:</span>
                    <span className="font-mono">+ {selectedRecord.valuation.provenanceBonusToman.toLocaleString('fa-IR')} تومان</span>
                  </div>
                )}
                {selectedRecord.valuation.certifiedGemValueToman > 0 && (
                  <div className="flex items-center justify-between text-[#3DD68C]">
                    <span>ارزش کارشناسی گوهرسنگ:</span>
                    <span className="font-mono">+ {selectedRecord.valuation.certifiedGemValueToman.toLocaleString('fa-IR')} تومان</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-[#2B2B3C]">
                  <span className="font-bold text-xs text-[#E5C365]">مبلغ نهایی تسویه شده / قابل پرداخت:</span>
                  <span className="font-mono font-bold text-sm text-[#E5C365]">
                    {selectedRecord.valuation.finalCashPayoutToman.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#868698]">
                  <span>روش تسویه منتخب:</span>
                  <span className="text-[#EDEDED]">{selectedRecord.settlement.methodFa}</span>
                </div>
              </div>

              {/* Legal Declaration */}
              <div className="text-[10px] text-[#868698] leading-relaxed p-2.5 rounded bg-[#14141A] border border-[#20202A]">
                فروشنده محترم با امضای این سند، مالکیت قطعی و تام‌الاختیار قطعه زرین فوق را به شرکت زرین دیدار واگذار نموده و اقرار می‌نماید که قطعه فاقد هرگونه ادعای ثالث یا معارضه قانونی می‌باشد.
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[#262636] text-center text-[11px] text-[#868698]">
                <div>امضا و اثر انگشت فروشنده</div>
                <div>مهر و امضای مجاز شرکت زرین دیدار</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#222230] text-[#868698] text-xs font-semibold"
              >
                بستن
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#C8A951] text-[#141416] font-bold text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ قبض رسمی</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM SETTLEMENT MODAL */}
      {isSettleModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#181822] rounded-2xl border border-[#3A3A4C] max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262634] pb-3.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#3DD68C]" />
                <h3 className="text-sm font-bold text-[#F4F4F6]">تسویه حساب پرونده {selectedRecord.buybackNumber}</h3>
              </div>
              <button onClick={() => setIsSettleModalOpen(false)} className="text-[#868698] hover:text-[#EDEDED] text-xs">
                بستن
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#121218] border border-[#242432] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#868698]">فروشنده:</span>
                  <span className="font-bold text-[#EDEDED]">{selectedRecord.seller.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#868698]">ارزش نقدی شبا:</span>
                  <span className="font-mono text-[#E5C365] font-bold">{selectedRecord.valuation.finalCashPayoutToman.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#868698]">ارزش بن معاوضه (+۲.۵٪):</span>
                  <span className="font-mono text-[#3DD68C] font-bold">{selectedRecord.valuation.finalTradeInPayoutToman.toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#868698]">روش تسویه حساب مورد تایید مشتری</label>
                <select
                  value={settleMethod}
                  onChange={(e) => setSettleMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                >
                  <option value="trade_in_voucher">صدور بن معاوضه طلای نو با ۲.۵٪ بونوس هدیه</option>
                  <option value="instant_bank_transfer">واریز بین‌بانکی پایا/ساتنا به شماره شبا</option>
                  <option value="gold_wallet_credit">شارژ مستقیم کیف طلای دیجیتال دیدار (K09)</option>
                  <option value="cash_teller">پرداخت نقدی مجاز صندوق گالری</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#868698]">شماره پیگیری تراکنش بانکی یا سند تسویه</label>
                <input
                  type="text"
                  placeholder="مثال: PAYA-9920194"
                  value={settleTxRef}
                  onChange={(e) => setSettleTxRef(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#868698]">کارشناس ثبت تسویه مالی</label>
                <input
                  type="text"
                  value={settleOperator}
                  onChange={(e) => setSettleOperator(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262634]">
              <button
                onClick={() => setIsSettleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#222230] text-[#868698] text-xs font-semibold"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmSettlement}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#3DD68C] text-[#141416] font-bold text-xs"
              >
                {isSubmitting ? 'در حال تسویه...' : 'تایید قطعی تسویه و ثبت در دفتر کل'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ROUTE DESTINATION MODAL */}
      {isRouteModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#181822] rounded-2xl border border-[#3A3A4C] max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262634] pb-3.5">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-[#F4F4F6]">تعیین سرنوشت فیزیکی قطعه بازخرید شده</h3>
              </div>
              <button onClick={() => setIsRouteModalOpen(false)} className="text-[#868698] hover:text-[#EDEDED] text-xs">
                بستن
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#121218] border border-[#242432] space-y-1 text-xs">
                <div className="font-bold text-[#EDEDED]">{selectedRecord.itemTitleFa}</div>
                <div className="text-[11px] text-[#868698]">درجه سلامت: {selectedRecord.conditionGradeFa}</div>
                <div className="text-[11px] text-[#3DD68C] font-mono">وزن طلای خالص: {selectedRecord.assay.equivalent750WeightGrams.toFixed(3)} گرم</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#868698]">مقصد فیزیکی قطعه در زنجیره زرین</label>
                <select
                  value={routingDestination}
                  onChange={(e) => setRoutingDestination(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                >
                  <option value="k20_refurbish_secondary">هدایت به کارگاه پرداخت و بازسازی جهت فروش در بازار ثانویه (K20)</option>
                  <option value="k20_scrap_smelting">انتقال به بسته ذوب و تبدیل به شمش طلای آب‌شده استاندارد (K20)</option>
                  <option value="k09_reserve_vault">نگهداری در خزانه امن مرکزی ذخایر طلا (K09)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#868698]">یادداشت و دستورالعمل لجستیک</label>
                <textarea
                  rows={3}
                  placeholder="مثال: قطعه نیاز به پرداخت سطح و تعویض مدبر دارد..."
                  value={routingNotes}
                  onChange={(e) => setRoutingNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262634]">
              <button
                onClick={() => setIsRouteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#222230] text-[#868698] text-xs font-semibold"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmRouting}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs"
              >
                {isSubmitting ? 'در حال ثبت...' : 'ثبت و ارسال به مقصد'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT ASSAY / SCALE RE-WEIGHT */}
      {isAssayEditModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#181822] rounded-2xl border border-[#3A3A4C] max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#262634] pb-3.5">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#C8A951]" />
                <h3 className="text-sm font-bold text-[#F4F4F6]">به‌روزرسانی عیارسنجی و بازتوزین آزمایشگاهی</h3>
              </div>
              <button onClick={() => setIsAssayEditModalOpen(false)} className="text-[#868698] hover:text-[#EDEDED] text-xs">
                بستن
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#868698]">خلوص عیار (ضریب ۷۵۰)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={assayPurity}
                    onChange={(e) => setAssayPurity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#868698]">درجه سلامت قطعه</label>
                  <select
                    value={assayConditionGrade}
                    onChange={(e) => setAssayConditionGrade(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                  >
                    <option value="grade_a_mint">درجه ۱ (نو ویترینی)</option>
                    <option value="grade_b_normal">درجه ۲ (سالم با پرداخت)</option>
                    <option value="grade_c_melt_scrap">درجه ۳ (شکسته/ذوب)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#868698]">وزن ناخالص ترازو (گرم)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={assayGrossWeight}
                    onChange={(e) => setAssayGrossWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#868698]">وزن کسر تاره / نگین (گرم)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={assayTareWeight}
                    onChange={(e) => setAssayTareWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#868698]">ارزش کارشناسی گوهرسنگ شناسنامه‌دار (تومان)</label>
                <input
                  type="number"
                  value={assayGemValuation}
                  onChange={(e) => setAssayGemValuation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] font-mono focus:border-[#C8A951]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#868698]">یادداشت کارشناس آزمایشگاه</label>
                <textarea
                  rows={2}
                  value={assayNotes}
                  onChange={(e) => setAssayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121218] border border-[#2C2C3C] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262634]">
              <button
                onClick={() => setIsAssayEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#222230] text-[#868698] text-xs font-semibold"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmAssayUpdate}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#C8A951] text-[#141416] font-bold text-xs"
              >
                {isSubmitting ? 'در حال ثبت...' : 'محاسبه مجدد ارزش بازخرید'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: SELECTED RECORD DETAILS */}
      {selectedRecord && !isReceiptModalOpen && !isSettleModalOpen && !isRouteModalOpen && !isAssayEditModalOpen && (
        <div className="bg-[#181822] rounded-2xl border border-[#2A2A3A] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#252534] pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-bold text-[#E5C365]">{selectedRecord.buybackNumber}</span>
              <span className="text-sm font-bold text-[#EDEDED]">{selectedRecord.itemTitleFa}</span>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="text-xs text-[#868698] hover:text-[#EDEDED]"
            >
              بستن جزئیات ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#14141C] border border-[#242432] space-y-2">
              <div className="text-[#C8A951] font-bold">اطلاعات فروشنده</div>
              <div>نام: {selectedRecord.seller.fullName}</div>
              <div>کد ملی: <span className="font-mono">{selectedRecord.seller.nationalId}</span></div>
              <div>موبایل: <span className="font-mono">{selectedRecord.seller.mobile}</span></div>
              <div>شبا: <span className="font-mono text-[10px]">{selectedRecord.seller.bankIban}</span></div>
            </div>

            <div className="p-4 rounded-xl bg-[#14141C] border border-[#242432] space-y-2">
              <div className="text-[#3DD68C] font-bold">توزین و عیارسنجی</div>
              <div>عیار: {selectedRecord.assay.testedKaratFa}</div>
              <div>وزن ناخالص: <span className="font-mono">{selectedRecord.assay.grossWeightGrams.toFixed(3)} گرم</span></div>
              <div>کسر تاره: <span className="font-mono text-rose-400">{selectedRecord.assay.tareWeightGrams.toFixed(3)} گرم</span></div>
              <div>معادل خالص ۷۵۰: <span className="font-mono font-bold text-[#3DD68C]">{selectedRecord.assay.equivalent750WeightGrams.toFixed(3)} گرم</span></div>
            </div>

            <div className="p-4 rounded-xl bg-[#14141C] border border-[#242432] space-y-2">
              <div className="text-[#E5C365] font-bold">ارزش‌گذاری و تسویه</div>
              <div>ارزش نقد: <span className="font-mono font-bold text-[#EDEDED]">{selectedRecord.valuation.finalCashPayoutToman.toLocaleString('fa-IR')} ت</span></div>
              <div>ارزش معاوضه: <span className="font-mono font-bold text-[#E5C365]">{selectedRecord.valuation.finalTradeInPayoutToman.toLocaleString('fa-IR')} ت</span></div>
              <div>وضعیت تسویه: {selectedRecord.settlement.isSettled ? 'تسویه شده' : 'در انتظار'}</div>
              <div>مقصد کالا: {selectedRecord.routingDecision ? selectedRecord.routingDecision.destinationFa : 'تعیین نشده'}</div>
            </div>
          </div>

          {/* Timeline Events */}
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-bold text-[#868698]">گردش کار و رویدادهای زمانی</h4>
            <div className="space-y-2">
              {selectedRecord.timeline.map((evt) => (
                <div key={evt.id} className="p-3 rounded-lg bg-[#14141C] border border-[#222230] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#EDEDED]">{evt.titleFa}</div>
                    <div className="text-[11px] text-[#868698] mt-0.5">{evt.descriptionFa}</div>
                  </div>
                  <div className="text-left font-mono text-[10px] text-[#868698]">
                    <div>{evt.timestampFa}</div>
                    <div className="text-[#C8A951]">{evt.operatorNameFa}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
