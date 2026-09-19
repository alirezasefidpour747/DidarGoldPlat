/**
 * Didar Gold Platform - Kernel 20 (K20) Dashboard Component
 * Secondary Market, Refurbishment Workshop, CPO Showcase & Precious Scrap Smelting/Recycling
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Sparkles,
  Gem,
  RefreshCw,
  Layers,
  ShieldCheck,
  Award,
  ArrowRightLeft,
  Scale,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Leaf,
  BarChart3,
  FileText,
  Check,
  X,
  BadgePercent,
  SlidersHorizontal,
  ChevronLeft,
  Info,
  QrCode,
  Building2,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { api } from '../../lib/api.js';
import {
  K20DataPayload,
  K20RefurbishedItem,
  K20MeltBatch,
  K20GemRecovery,
  K20AuditLog,
  K20RefurbishStatus,
  K20MeltStatus,
  K20GemRecoveryStatus
} from '../../types/k20.js';

export const K20Dashboard: React.FC = () => {
  // State management
  const [data, setData] = useState<K20DataPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'refurbishment' | 'cpo_showcase' | 'smelting' | 'gem_recovery' | 'calculator' | 'audit'
  >('refurbishment');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showMeltModal, setShowMeltModal] = useState(false);
  const [showGemModal, setShowGemModal] = useState(false);
  const [selectedItemForPassport, setSelectedItemForPassport] = useState<K20RefurbishedItem | null>(null);
  const [selectedBatchForAssay, setSelectedBatchForAssay] = useState<K20MeltBatch | null>(null);
  const [selectedItemForStageUpdate, setSelectedItemForStageUpdate] = useState<K20RefurbishedItem | null>(null);

  // New Intake Form State
  const [intakeForm, setIntakeForm] = useState({
    originalTitleFa: '',
    categoryFa: 'گردنبند مجلسی',
    sourceBuybackId: '',
    grossWeightGrams: '',
    netGoldWeightGrams: '',
    hasPreciousStones: false,
    gemsDescriptionFa: '',
    workshopNameFa: 'کارگاه مرکزی احیا و آبکاری زرین دیدار',
    artisanNameFa: 'استاد مسعود داوودی',
    refurbishCostToman: '1500000',
    beforeAfterNotesFa: ''
  });

  // New Melt Batch Form State
  const [meltForm, setMeltForm] = useState({
    crucibleNumber: `CRU-F${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 80) + 20}`,
    furnaceOperatorFa: 'استاد جواد معتمدی (سرپرست کوره و ریخته‌گری)',
    sourceItemsCount: '5',
    sourceItemsSummaryFa: 'طلای متفرقه و قراضه‌های کارگاه',
    totalInputWeightGrams: '',
    expectedPurity: '0.750',
    destination: 'k09_reserve_vault' as 'k09_reserve_vault' | 'k07_supplier_workshop' | 'treasury_sale'
  });

  // New Gem Recovery Form State
  const [gemForm, setGemForm] = useState({
    gemTypeFa: 'برلیان طبیعی الماس تراش Round Brilliant',
    sourceBuybackNumber: 'BBK-1404-001',
    caratWeight: '',
    cutShapeFa: 'گرد برلیانت ۵۷ پخ',
    colorGrade: 'Color F',
    clarityGrade: 'VVS2',
    estimatedValueToman: '',
    gemologistFa: 'دکتر فرشید پاک‌طینت (گوهرشناس GIA)',
    allocatedVaultFa: 'صندوق نسوز گوهرسنگ شماره A-05'
  });

  // Stage Update Form State
  const [stageUpdateForm, setStageUpdateForm] = useState({
    status: 'ultrasonic_cleaning' as K20RefurbishStatus,
    qcScore: '96',
    qcInspectorFa: 'مهندس حسینی (سرپرست QC)',
    notesFa: '',
    operatorNameFa: 'کارشناس کارگاه مرکزی'
  });

  // Assay Lab Update Form State
  const [assayForm, setAssayForm] = useState({
    meltedIngotWeightGrams: '',
    assayLabNameFa: 'آزمایشگاه ری‌گیری رسمی اتحادیه طلا تهران (اتحاد)',
    assayCertificateNumber: 'انگ ۷۵۰/۴۸۹۰',
    certifiedPurity: '0.7505',
    destination: 'k09_reserve_vault' as 'k09_reserve_vault' | 'k07_supplier_workshop' | 'treasury_sale',
    operatorNameFa: 'استاد جواد معتمدی'
  });

  // Calculator Form State
  const [calcWeight, setCalcWeight] = useState<number>(12.5);
  const [calcRefurbCost, setCalcRefurbCost] = useState<number>(1800000);
  const [calcCurrent18kRate, setCalcCurrent18kRate] = useState<number>(6150000);
  const [calcCondition, setCalcCondition] = useState<'refurbishable' | 'melt_only'>('refurbishable');

  // Load Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getK20Data();
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.currentGoldPrice?.gram18kToman) {
          setCalcCurrent18kRate(res.data.currentGoldPrice.gram18kToman);
        }
      }
    } catch (err: any) {
      console.error('Error fetching K20 data:', err);
      setError(err.message || 'خطا در برقراری ارتباط با هسته عملیاتی K20');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleCreateIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeForm.originalTitleFa || !intakeForm.grossWeightGrams) return;

    try {
      setLoading(true);
      await api.createK20RefurbishedIntake({
        originalTitleFa: intakeForm.originalTitleFa,
        categoryFa: intakeForm.categoryFa,
        sourceBuybackId: intakeForm.sourceBuybackId || undefined,
        grossWeightGrams: Number(intakeForm.grossWeightGrams),
        netGoldWeightGrams: intakeForm.netGoldWeightGrams ? Number(intakeForm.netGoldWeightGrams) : undefined,
        hasPreciousStones: intakeForm.hasPreciousStones,
        gemsDescriptionFa: intakeForm.gemsDescriptionFa || undefined,
        workshopNameFa: intakeForm.workshopNameFa,
        artisanNameFa: intakeForm.artisanNameFa,
        refurbishCostToman: intakeForm.refurbishCostToman ? Number(intakeForm.refurbishCostToman) : undefined,
        beforeAfterNotesFa: intakeForm.beforeAfterNotesFa || undefined
      });
      setShowIntakeModal(false);
      setIntakeForm({
        originalTitleFa: '',
        categoryFa: 'گردنبند مجلسی',
        sourceBuybackId: '',
        grossWeightGrams: '',
        netGoldWeightGrams: '',
        hasPreciousStones: false,
        gemsDescriptionFa: '',
        workshopNameFa: 'کارگاه مرکزی احیا و آبکاری زرین دیدار',
        artisanNameFa: 'استاد مسعود داوودی',
        refurbishCostToman: '1500000',
        beforeAfterNotesFa: ''
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت پذیرش');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeltBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meltForm.crucibleNumber || !meltForm.totalInputWeightGrams) return;

    try {
      setLoading(true);
      await api.createK20MeltBatch({
        crucibleNumber: meltForm.crucibleNumber,
        furnaceOperatorFa: meltForm.furnaceOperatorFa,
        sourceItemsCount: Number(meltForm.sourceItemsCount) || 1,
        sourceItemsSummaryFa: meltForm.sourceItemsSummaryFa,
        totalInputWeightGrams: Number(meltForm.totalInputWeightGrams),
        expectedPurity: Number(meltForm.expectedPurity) || 0.750,
        destination: meltForm.destination
      });
      setShowMeltModal(false);
      setMeltForm({
        crucibleNumber: `CRU-F${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 80) + 20}`,
        furnaceOperatorFa: 'استاد جواد معتمدی (سرپرست کوره و ریخته‌گری)',
        sourceItemsCount: '5',
        sourceItemsSummaryFa: 'طلای متفرقه و قراضه‌های کارگاه',
        totalInputWeightGrams: '',
        expectedPurity: '0.750',
        destination: 'k09_reserve_vault'
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'خطا در تشکیل بوته ذوب');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGemRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gemForm.gemTypeFa || !gemForm.caratWeight || !gemForm.estimatedValueToman) return;

    try {
      setLoading(true);
      await api.createK20GemRecovery({
        gemTypeFa: gemForm.gemTypeFa,
        sourceBuybackNumber: gemForm.sourceBuybackNumber,
        caratWeight: Number(gemForm.caratWeight),
        cutShapeFa: gemForm.cutShapeFa,
        colorGrade: gemForm.colorGrade,
        clarityGrade: gemForm.clarityGrade,
        estimatedValueToman: Number(gemForm.estimatedValueToman),
        gemologistFa: gemForm.gemologistFa,
        allocatedVaultFa: gemForm.allocatedVaultFa
      });
      setShowGemModal(false);
      setGemForm({
        gemTypeFa: 'برلیان طبیعی الماس تراش Round Brilliant',
        sourceBuybackNumber: 'BBK-1404-001',
        caratWeight: '',
        cutShapeFa: 'گرد برلیانت ۵۷ پخ',
        colorGrade: 'Color F',
        clarityGrade: 'VVS2',
        estimatedValueToman: '',
        gemologistFa: 'دکتر فرشید پاک‌طینت (گوهرشناس GIA)',
        allocatedVaultFa: 'صندوق نسوز گوهرسنگ شماره A-05'
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت گوهرسنگ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItemStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForStageUpdate) return;

    try {
      setLoading(true);
      await api.updateK20RefurbishedStatus(selectedItemForStageUpdate.id, {
        status: stageUpdateForm.status,
        qcScore: Number(stageUpdateForm.qcScore),
        qcInspectorFa: stageUpdateForm.qcInspectorFa,
        notesFa: stageUpdateForm.notesFa || undefined,
        operatorNameFa: stageUpdateForm.operatorNameFa
      });
      setSelectedItemForStageUpdate(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'خطا در به‌روزرسانی وضعیت مرحله کارگاه');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBatchAssay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForAssay) return;

    try {
      setLoading(true);
      await api.updateK20MeltBatchStatus(selectedBatchForAssay.id, {
        status: 'bar_cast_completed',
        meltedIngotWeightGrams: assayForm.meltedIngotWeightGrams
          ? Number(assayForm.meltedIngotWeightGrams)
          : selectedBatchForAssay.totalInputWeightGrams * 0.992,
        assayLabNameFa: assayForm.assayLabNameFa,
        assayCertificateNumber: assayForm.assayCertificateNumber,
        certifiedPurity: Number(assayForm.certifiedPurity),
        destination: assayForm.destination,
        operatorNameFa: assayForm.operatorNameFa
      });
      setSelectedBatchForAssay(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت نتایج ری‌گیری');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceToNextRefurbishStage = async (item: K20RefurbishedItem) => {
    const stageOrder: K20RefurbishStatus[] = [
      'intake_assessment',
      'ultrasonic_cleaning',
      'polishing_buffing',
      'rhodium_plating',
      'gem_tightening',
      'qc_passed',
      'cpo_showcase_listed',
      'sold_reissued'
    ];
    const currentIndex = stageOrder.indexOf(item.status);
    if (currentIndex < stageOrder.length - 1) {
      const nextStatus = stageOrder[currentIndex + 1];
      try {
        setLoading(true);
        await api.updateK20RefurbishedStatus(item.id, {
          status: nextStatus,
          operatorNameFa: 'سرپرست کارگاه احیا'
        });
        await fetchData();
      } catch (err: any) {
        alert(err.message || 'خطا در ارتقای مرحله کارگاه');
      } finally {
        setLoading(false);
      }
    }
  };

  // Filtered lists
  const filteredRefurbishedItems = useMemo(() => {
    if (!data?.refurbishedItems) return [];
    return data.refurbishedItems.filter((item) => {
      const matchesSearch =
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.originalTitleFa.includes(searchQuery) ||
        (item.sourceBuybackId && item.sourceBuybackId.includes(searchQuery)) ||
        item.categoryFa.includes(searchQuery);

      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'in_workshop') {
        return item.status !== 'cpo_showcase_listed' && item.status !== 'sold_reissued';
      }
      if (statusFilter === 'cpo_listed') return item.status === 'cpo_showcase_listed';
      if (statusFilter === 'sold') return item.status === 'sold_reissued';
      return item.status === statusFilter;
    });
  }, [data?.refurbishedItems, searchQuery, statusFilter]);

  const filteredMeltBatches = useMemo(() => {
    if (!data?.meltBatches) return [];
    return data.meltBatches.filter((b) => {
      return (
        b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.crucibleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.furnaceOperatorFa.includes(searchQuery) ||
        b.assayCertificateNumber.includes(searchQuery)
      );
    });
  }, [data?.meltBatches, searchQuery]);

  // Calculator computations
  const calcResults = useMemo(() => {
    const rawValue = calcWeight * calcCurrent18kRate;
    const standardNewMakingFeePercent = 22; // ۲۲٪ اجرت ساخت بازار
    const standardNewPrice = Math.round(rawValue * (1 + standardNewMakingFeePercent / 100));

    // استراتژی CPO دیدار: طلای خام + ۳.۵٪ کارمزد احیا و تضمین کیفیت + هزینه کارگاهی
    const cpoMarginPercent = 3.5;
    const cpoSellingPrice = Math.round(rawValue * (1 + cpoMarginPercent / 100) + calcRefurbCost);
    const customerSavingsToman = standardNewPrice - cpoSellingPrice;
    const customerSavingsPercent = Number(((customerSavingsToman / standardNewPrice) * 100).toFixed(1));

    // ارزش ذوب کوره در صورت ذوب مستقیم قراضه (با افت ۰.۸٪ کوره و بدون اجرت)
    const meltYieldPercent = 99.2;
    const meltValue = Math.round((rawValue * meltYieldPercent) / 100);

    // سود خالص دیدار در مدل CPO در مقایسه با ذوب مستقیم
    const didarProfitCpo = cpoSellingPrice - rawValue - calcRefurbCost;
    const isRecommendedCpo = calcCondition === 'refurbishable' && customerSavingsPercent > 10;

    return {
      rawValue,
      standardNewPrice,
      cpoSellingPrice,
      customerSavingsToman,
      customerSavingsPercent,
      meltValue,
      didarProfitCpo,
      isRecommendedCpo
    };
  }, [calcWeight, calcRefurbCost, calcCurrent18kRate, calcCondition]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                هسته K20 • فعال و متصل به K19 و K09
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                اقتصاد چرخشی طلا (Circular Gold)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-600" />
              بازار ثانویه، کارگاه بازسازی و بازیافت طلا (K20)
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              سامانه یکپارچه احیا و جلای قطعات بازخرید شده، عرضه ویترینی کم‌اجرت (CPO)، مدیریت بوته‌های کوره ذوب و بازیافت شمش آب‌شده
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowIntakeModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              پذیرش جدید در کارگاه احیا
            </button>
            <button
              onClick={() => setShowMeltModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium shadow-sm transition-colors"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              ایجاد بوته ذوب جدید
            </button>
            <button
              onClick={() => setShowGemModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium shadow-sm transition-colors"
            >
              <Gem className="w-4 h-4" />
              ثبت گوهرسنگ بازیابی‌شده
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
              title="تازه‌سازی اطلاعات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Status Bar & Environmental Impact */}
        {data && (
          <div className="mt-5 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>مظنه مرجع هر گرم طلای ۱۸ عیار:</span>
              <span className="font-bold text-stone-900 font-mono">
                {data.currentGoldPrice.gram18kToman.toLocaleString('fa-IR')} تومان
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>طلای بازچرخانی‌شده بدون استخراج معدنی:</span>
              <span className="font-bold text-emerald-800 font-mono">
                {data.metrics.circularEconomyGoldKg} کیلوگرم
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>میانگین بازدهی کوره ذوب دیدار:</span>
              <span className="font-bold text-stone-900 font-mono">
                {data.metrics.averageMeltingYieldPercent}٪
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>کاهش ردپای کربن حاصل از بازیافت:</span>
              <span className="font-bold text-sky-800 font-mono">
                {data.metrics.co2SavedKg.toLocaleString('fa-IR')} کیلوگرم CO2
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Top Metrics Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium">در کارگاه احیا</span>
              <Wrench className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900 font-mono">
              {data.metrics.activeInWorkshopCount.toLocaleString('fa-IR')}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">قطعه در مراحل شستشو، پولیش و آبکاری</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium">ویترین CPO دیدار</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              {data.metrics.cpoShowcaseItemsCount.toLocaleString('fa-IR')}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">طلای کم‌اجرت آماده فروش با پاسپورت</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium">قراضه ذوب‌شده</span>
              <Flame className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-stone-900 font-mono">
              {data.metrics.totalScrapMeltedGrams.toLocaleString('fa-IR')}
              <span className="text-xs font-normal text-stone-500 mr-1">گرم</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">در قالب {data.metrics.totalMeltBatchesCount} بوته ذوب کوره</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium">شمش‌های ریخته‌شده</span>
              <Scale className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-800 font-mono">
              {data.metrics.totalCastBarsGrams.toLocaleString('fa-IR')}
              <span className="text-xs font-normal text-stone-500 mr-1">گرم</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">دارای انگ و تحویل شده به K09/K07</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-medium">ارزش گوهرسنگ‌ها</span>
              <Gem className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-xl font-bold text-sky-800 font-mono truncate">
              {(data.metrics.totalGemRecoveryValueToman / 1000000).toLocaleString('fa-IR')}
              <span className="text-xs font-normal text-stone-500 mr-1">م.ت</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">{data.metrics.totalGemsRecoveredCount} نگین قیمتی شناسنامه‌دار</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-stone-200 bg-white rounded-t-xl px-4 pt-2 shadow-sm">
        <nav className="flex space-x-reverse space-x-1 sm:space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('refurbishment')}
            className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'refurbishment'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            <Wrench className="w-4 h-4" />
            کارگاه احیا و پرداخت ({data?.refurbishedItems.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('cpo_showcase')}
            className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'cpo_showcase'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            ویترین طلای احیاشده CPO ({data?.metrics.cpoShowcaseItemsCount || 0})
          </button>

          <button
            onClick={() => setActiveTab('smelting')}
            className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'smelting'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-600" />
            کوره ذوب و شمش آب‌شده ({data?.meltBatches.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('gem_recovery')}
            className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'gem_recovery'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            <Gem className="w-4 h-4 text-sky-600" />
            خزانه گوهرسنگ‌ها ({data?.gemRecoveries.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            <BadgePercent className="w-4 h-4" />
            محاسبه‌گر اقتصادی احیا vs ذوب
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            دفتر کل رهگیری و ممیزی ({data?.auditLogs.length || 0})
          </button>
        </nav>
      </div>

      {/* TAB 1: WORKSHOP REFURBISHMENT */}
      {activeTab === 'refurbishment' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو بر اساس کد قطعه، عنوان، پرونده بازخرید..."
                className="w-full pl-3 pr-9 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs text-stone-500 font-medium whitespace-nowrap">فیلتر وضعیت:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                همه ({data?.refurbishedItems.length || 0})
              </button>
              <button
                onClick={() => setStatusFilter('in_workshop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === 'in_workshop'
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                در حال احیا کارگاهی ({data?.metrics.activeInWorkshopCount || 0})
              </button>
              <button
                onClick={() => setStatusFilter('cpo_listed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === 'cpo_listed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                ویترین CPO ({data?.metrics.cpoShowcaseItemsCount || 0})
              </button>
              <button
                onClick={() => setStatusFilter('sold')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === 'sold'
                    ? 'bg-purple-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                فروش‌رفته
              </button>
            </div>
          </div>

          {/* Refurbished Items Table */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600">
                  <tr>
                    <th className="py-3.5 px-4">شناسه / عنوان قطعه</th>
                    <th className="py-3.5 px-3">مبدا پرونده</th>
                    <th className="py-3.5 px-3">وزن طلا</th>
                    <th className="py-3.5 px-3">مرحله کارگاهی</th>
                    <th className="py-3.5 px-3">کارگاه و استادکار</th>
                    <th className="py-3.5 px-3">قیمت‌گذاری CPO</th>
                    <th className="py-3.5 px-3 text-center">امتیاز QC</th>
                    <th className="py-3.5 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredRefurbishedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-500">
                        موردی مطابق جستجو یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    filteredRefurbishedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold bg-stone-100 text-stone-800 px-2 py-0.5 rounded">
                              {item.itemCode}
                            </span>
                            {item.hasPreciousStones && (
                              <span title="دارای سنگ قیمتی">
                                <Gem className="w-3.5 h-3.5 text-sky-600 inline" />
                              </span>
                            )}
                          </div>
                          <div className="font-medium text-stone-900 mt-0.5">{item.originalTitleFa}</div>
                          <div className="text-xs text-stone-500">{item.categoryFa}</div>
                        </td>

                        <td className="py-3 px-3">
                          {item.sourceBuybackId ? (
                            <span className="font-mono text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {item.sourceBuybackId}
                            </span>
                          ) : item.sourceTicketId ? (
                            <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {item.sourceTicketId}
                            </span>
                          ) : (
                            <span className="text-xs text-stone-400">پذیرش مستقیم</span>
                          )}
                          <div className="text-[11px] text-stone-400 mt-1">{item.intakeDateFa}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-stone-900 font-mono">
                            {item.grossWeightGrams.toFixed(3)}
                            <span className="text-xs font-normal text-stone-500 mr-1">گرم</span>
                          </div>
                          <div className="text-[11px] text-stone-500">
                            خالص: {item.netGoldWeightGrams.toFixed(3)} گرم
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                              item.status === 'cpo_showcase_listed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'sold_reissued'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : item.status === 'qc_passed'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.status === 'cpo_showcase_listed' && <Sparkles className="w-3 h-3 text-emerald-600" />}
                            {item.status === 'sold_reissued' && <CheckCircle2 className="w-3 h-3 text-purple-600" />}
                            {item.statusFa}
                          </span>
                          {item.passportUid && (
                            <div className="text-[10px] text-stone-500 font-mono mt-1">
                              پاسپورت: {item.passportUid}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-xs font-medium text-stone-900">{item.workshopNameFa}</div>
                          <div className="text-[11px] text-stone-500">{item.artisanNameFa}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-emerald-700 font-mono">
                            {item.cpoSellingPriceToman.toLocaleString('fa-IR')}
                            <span className="text-[11px] font-normal mr-1">تومان</span>
                          </div>
                          <div className="text-[11px] text-stone-500">
                            صرفه‌جویی خریدار: {item.savingsPercent}٪
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              item.qcScore >= 95
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.qcScore} / ۱۰۰
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.status !== 'cpo_showcase_listed' && item.status !== 'sold_reissued' && (
                              <button
                                onClick={() => handleAdvanceToNextRefurbishStage(item)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-xs font-medium transition-colors"
                                title="ارتقا به مرحله بعد"
                              >
                                مرحله بعد
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedItemForStageUpdate(item);
                                setStageUpdateForm({
                                  status: item.status,
                                  qcScore: String(item.qcScore),
                                  qcInspectorFa: item.qcInspectorFa,
                                  notesFa: '',
                                  operatorNameFa: 'سرپرست کارگاه احیا'
                                });
                              }}
                              className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded"
                              title="تنظیمات مرحله و QC"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setSelectedItemForPassport(item)}
                              className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                              title="مشاهده شناسنامه دیجیتال CPO"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CPO SHOWCASE & CATALOG */}
      {activeTab === 'cpo_showcase' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border border-amber-200/80 rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  ویترین طلای احیاشده دیدار (Didar Certified Pre-Owned)
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  زیورآلات باکیفیت و کنترل‌شده کارگاه دیدار، با جلای کاملاً نو، گارانتی کتبی ۱۲ ماهه و محاسبه شفاف بدون اجرت ساخت سنگین (تنها ۳.۵٪ اجرت احیا)
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/80 border border-amber-200 px-4 py-2 rounded-lg text-xs">
                <div>
                  <span className="text-stone-500">تعداد در ویترین:</span>
                  <span className="font-bold text-stone-900 font-mono mr-1">
                    {data?.metrics.cpoShowcaseItemsCount} عدد
                  </span>
                </div>
                <div className="border-r border-stone-300 pr-3">
                  <span className="text-stone-500">میانگین سود خریدار:</span>
                  <span className="font-bold text-emerald-700 font-mono mr-1">
                    ۱۸.۴٪ کمتر از بازار
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data?.refurbishedItems
              .filter((i) => i.status === 'cpo_showcase_listed' || i.status === 'sold_reissued')
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {item.itemCode}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          item.status === 'cpo_showcase_listed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {item.statusFa}
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-900 text-base mb-1.5">{item.originalTitleFa}</h3>
                    <p className="text-xs text-stone-500 mb-4">{item.categoryFa} • {item.karatFa}</p>

                    <div className="bg-stone-50 rounded-lg p-3 space-y-2 text-xs mb-4">
                      <div className="flex justify-between">
                        <span className="text-stone-500">وزن خالص طلا:</span>
                        <span className="font-bold text-stone-900 font-mono">
                          {item.netGoldWeightGrams.toFixed(3)} گرم
                        </span>
                      </div>
                      {item.hasPreciousStones && (
                        <div className="flex justify-between text-sky-700">
                          <span>گوهرسنگ:</span>
                          <span className="truncate max-w-[180px] font-medium">{item.gemsDescriptionFa}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-stone-500">ضمانت اصالت:</span>
                        <span className="font-medium text-stone-800">{item.warrantyMonths} ماه گارانتی دیدار</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">نمره کنترل کیفیت:</span>
                        <span className="font-mono font-bold text-emerald-700">{item.qcScore} از ۱۰۰</span>
                      </div>
                    </div>

                    {/* Price Comparison Block */}
                    <div className="border-t border-stone-100 pt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs text-stone-400 line-through">
                        <span>قیمت نو در بازار (اجرت ۲۲٪):</span>
                        <span className="font-mono">{item.originalNewRetailPriceToman.toLocaleString('fa-IR')} ت</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-stone-800">قیمت احیاشده CPO دیدار:</span>
                        <span className="font-bold text-emerald-700 font-mono text-base">
                          {item.cpoSellingPriceToman.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-emerald-600 font-medium">
                        <span>صرفه‌جویی خالص خریدار:</span>
                        <span className="font-mono">
                          {item.savingsForCustomerToman.toLocaleString('fa-IR')} ت ({item.savingsPercent}٪)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-50 border-t border-stone-100 px-5 py-3 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedItemForPassport(item)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:text-amber-900"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-600" />
                      شناسنامه و گواهی CPO
                    </button>

                    {item.status === 'cpo_showcase_listed' && (
                      <button
                        onClick={async () => {
                          if (confirm(`آیا از ثبت فروش و صدور سند تحویل برای قطعه ${item.itemCode} اطمینان دارید؟`)) {
                            try {
                              setLoading(true);
                              await api.updateK20RefurbishedStatus(item.id, {
                                status: 'sold_reissued',
                                operatorNameFa: 'کارشناس فروش گالری'
                              });
                              await fetchData();
                            } catch (err: any) {
                              alert(err.message || 'خطا در ثبت فروش');
                            } finally {
                              setLoading(false);
                            }
                          }
                        }}
                        className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium transition-colors"
                      >
                        ثبت فروش و حواله تحویل
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: SMELTING & RECYCLING */}
      {activeTab === 'smelting' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-600" />
                مدیریت بوته‌های کوره ذوب، ریخته‌گری شمش و آزمایشگاه ری‌گیری (K20 Smelt Crucible)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                تجمیع طلای شکسته و قراضه، ذوب حرارتی پیومتالورژی، نمونه‌برداری ری‌گیری و ریخته‌گری شمش استاندارد دیدار
              </p>
            </div>

            <button
              onClick={() => setShowMeltModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              بوته ذوب جدید
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600">
                  <tr>
                    <th className="py-3.5 px-4">کد بوته / تاریخ</th>
                    <th className="py-3.5 px-3">سرپرست کوره و بوته</th>
                    <th className="py-3.5 px-3">وزن ورودی قراضه</th>
                    <th className="py-3.5 px-3">وضعیت بوته ذوب</th>
                    <th className="py-3.5 px-3">وزن شمش حاصل و افت کوره</th>
                    <th className="py-3.5 px-3">گواهی و انگ ری‌گیری رسمی</th>
                    <th className="py-3.5 px-3">مقصد شمش</th>
                    <th className="py-3.5 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredMeltBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold font-mono text-stone-900">{batch.batchNumber}</div>
                        <div className="text-xs text-stone-500 mt-0.5">{batch.createdAtFa}</div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          {batch.sourceItemsCount} قلم طلای قراضه
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-stone-900 text-xs">{batch.furnaceOperatorFa}</div>
                        <div className="text-[11px] text-stone-500 font-mono">بوته: {batch.crucibleNumber}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900 font-mono">
                          {batch.totalInputWeightGrams.toFixed(3)} گرم
                        </div>
                        <div className="text-[11px] text-stone-500">
                          عیار تخمینی: {batch.expectedPurity}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                            batch.status === 'vault_deposited'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : batch.status === 'bar_cast_completed'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : batch.status === 'assaying_lab'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {batch.statusFa}
                        </span>
                        {batch.castBarBarcode && batch.castBarBarcode !== 'DID-INGOT-PENDING' && (
                          <div className="text-[10px] text-stone-500 font-mono mt-1">
                            بارکد: {batch.castBarBarcode}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {batch.meltedIngotWeightGrams > 0 ? (
                          <div>
                            <div className="font-bold text-stone-900 font-mono">
                              {batch.meltedIngotWeightGrams.toFixed(3)} گرم
                            </div>
                            <div className="text-[11px] text-rose-600 font-mono">
                              افت سرباره: {batch.refiningLossGrams.toFixed(3)} گرم ({batch.refiningLossPercent}٪)
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">در انتظار ذوب در کوره</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-stone-900 text-xs">{batch.assayLabNameFa}</div>
                        <div className="text-xs font-mono text-amber-800 font-semibold mt-0.5">
                          {batch.assayCertificateNumber}
                        </div>
                        {batch.certifiedPurity && (
                          <div className="text-[11px] text-emerald-700 font-mono">
                            عیار قطعی: {batch.certifiedPurity} (معادل ۷۵۰: {batch.equivalent750WeightGrams.toFixed(3)} گرم)
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-xs text-stone-700 font-medium">{batch.destinationFa}</div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          ارزش شمش: {batch.settlementValueToman.toLocaleString('fa-IR')} ت
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {batch.status === 'batching_crucible' && (
                            <button
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  await api.updateK20MeltBatchStatus(batch.id, {
                                    status: 'smelting_furnace',
                                    operatorNameFa: 'استاد جواد معتمدی'
                                  });
                                  await fetchData();
                                } catch (err: any) {
                                  alert(err.message || 'خطا در ارتقای بوته');
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded text-xs font-medium"
                            >
                              ورود به کوره ذوب
                            </button>
                          )}

                          {batch.status === 'smelting_furnace' && (
                            <button
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  await api.updateK20MeltBatchStatus(batch.id, {
                                    status: 'assaying_lab',
                                    meltedIngotWeightGrams: Number((batch.totalInputWeightGrams * 0.992).toFixed(3)),
                                    operatorNameFa: 'استاد جواد معتمدی'
                                  });
                                  await fetchData();
                                } catch (err: any) {
                                  alert(err.message || 'خطا در ارسال به ری‌گیری');
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-xs font-medium"
                            >
                              ارسال به ری‌گیری
                            </button>
                          )}

                          {batch.status === 'assaying_lab' && (
                            <button
                              onClick={() => {
                                setSelectedBatchForAssay(batch);
                                setAssayForm({
                                  meltedIngotWeightGrams: String(batch.meltedIngotWeightGrams || (batch.totalInputWeightGrams * 0.992).toFixed(3)),
                                  assayLabNameFa: batch.assayLabNameFa,
                                  assayCertificateNumber: 'انگ ۷۵۰/' + Math.floor(1000 + Math.random() * 9000),
                                  certifiedPurity: '0.7505',
                                  destination: batch.destination,
                                  operatorNameFa: 'استاد جواد معتمدی'
                                });
                              }}
                              className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-medium"
                            >
                              ثبت نتیجه انگ و قالب‌گیری
                            </button>
                          )}

                          {batch.status === 'bar_cast_completed' && (
                            <button
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  await api.updateK20MeltBatchStatus(batch.id, {
                                    status: 'vault_deposited',
                                    operatorNameFa: 'مدیر خزانه‌داری دیدار'
                                  });
                                  await fetchData();
                                } catch (err: any) {
                                  alert(err.message || 'خطا در تحویل به خزانه');
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
                            >
                              تحویل قطعی به K09
                            </button>
                          )}

                          {batch.status === 'vault_deposited' && (
                            <span className="text-xs text-emerald-700 flex items-center gap-1">
                              <Check className="w-4 h-4 text-emerald-600" />
                              در خزانه
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRECIOUS GEM RECOVERY */}
      {activeTab === 'gem_recovery' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <Gem className="w-4 h-4 text-sky-600" />
                خزانه گوهرسنگ‌ها و برلیان‌های بازیابی‌شده از طلای بازخرید (Gem Reserve Vault)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                جداسازی بدون آسیب برلیان و سنگ‌های قیمتی از پایه‌های ذوبی، درجه‌بندی طبق استاندارد بین‌المللی GIA و دپو در خزانه تخصصی
              </p>
            </div>

            <button
              onClick={() => setShowGemModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              ثبت گوهرسنگ جدید
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.gemRecoveries.map((gem) => (
              <div
                key={gem.id}
                className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded">
                      {gem.recoveryCode}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        gem.status === 'vault_reserved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : gem.status === 'remounted'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {gem.statusFa}
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm mb-1">{gem.gemTypeFa}</h4>
                  <div className="text-xs text-stone-500 mb-3">
                    مبدا: پرونده بازخرید {gem.sourceBuybackNumber}
                  </div>

                  <div className="space-y-1.5 bg-stone-50 rounded-lg p-2.5 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-stone-500">وزن سنگ:</span>
                      <span className="font-bold font-mono text-stone-900">{gem.caratWeight} قیراط</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">تراش و شکل:</span>
                      <span className="font-medium text-stone-800">{gem.cutShapeFa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">درجه رنگ / پاکی:</span>
                      <span className="font-mono text-stone-800">{gem.colorGrade} • {gem.clarityGrade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">گوهرشناس:</span>
                      <span className="text-stone-700 truncate">{gem.gemologistFa}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                    <span className="text-stone-500">ارزش کارشناسی:</span>
                    <span className="font-bold text-sky-800 font-mono text-sm">
                      {gem.estimatedValueToman.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500 truncate max-w-[150px]" title={gem.allocatedVaultFa}>
                    {gem.allocatedVaultFa}
                  </span>

                  {gem.status !== 'vault_reserved' && (
                    <button
                      onClick={async () => {
                        try {
                          setLoading(true);
                          await api.updateK20GemStatus(gem.id, {
                            status: 'vault_reserved',
                            allocatedVaultFa: 'صندوق نسوز گوهرسنگ شماره A-01',
                            operatorNameFa: 'کارشناس خزانه‌داری دیدار'
                          });
                          await fetchData();
                        } catch (err: any) {
                          alert(err.message || 'خطا در انتقال به صندوق');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-2 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] transition-colors"
                    >
                      دپو در گاوصندوق
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ECONOMIC CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 mb-2">
              <BadgePercent className="w-5 h-5 text-amber-600" />
              محاسبه‌گر اقتصادی تصمیم‌گیری هوشمند: احیا و عرضه CPO یا ذوب در کوره؟
            </h3>
            <p className="text-xs text-stone-600 mb-6">
              تحلیل هزینه-فایده طلاسازی بر پایه مظنه زنده اتحادیه، هزینه‌های پرداخت و سود حاصل از عرضه به عنوان طلای کم‌اجرت در برابر بازیافت حرارتی قراضه
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Inputs */}
              <div className="lg:col-span-5 space-y-4 bg-stone-50 p-5 rounded-xl border border-stone-200">
                <h4 className="font-bold text-stone-800 text-sm">پارامترهای قطعه و مظنه</h4>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    وزن خالص طلای ۱۸ عیار (گرم):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    مظنه روز هر گرم طلای ۱۸ عیار (تومان):
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={calcCurrent18kRate}
                    onChange={(e) => setCalcCurrent18kRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    هزینه برآوردی کارگاه احیا (التراسونیک، پولیش، آبکاری):
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={calcRefurbCost}
                    onChange={(e) => setCalcRefurbCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    وضعیت ساختار فیزیکی قطعه:
                  </label>
                  <select
                    value={calcCondition}
                    onChange={(e: any) => setCalcCondition(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="refurbishable">سالم با خط‌وخش قابل رفع (مناسب پرداخت و جلای CPO)</option>
                    <option value="melt_only">شکسته، دفرمه یا عیار غیریکنواخت (صرفاً ذوب در کوره)</option>
                  </select>
                </div>
              </div>

              {/* Output Results */}
              <div className="lg:col-span-7 space-y-4">
                <div
                  className={`p-4 rounded-xl border ${
                    calcResults.isRecommendedCpo
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-rose-50/70 border-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {calcResults.isRecommendedCpo ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Flame className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="font-bold text-sm text-stone-900">
                      توصیه هوشمند الگوریتم دیدار:
                    </span>
                    <span
                      className={`font-bold text-sm ${
                        calcResults.isRecommendedCpo ? 'text-emerald-800' : 'text-rose-800'
                      }`}
                    >
                      {calcResults.isRecommendedCpo
                        ? 'احیا، پرداخت و عرضه رسمی در ویترین CPO'
                        : 'انتقال به بوته ذوب کوره و بازیافت شمش آب‌شده'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {calcResults.isRecommendedCpo
                      ? `این قطعه ارزش ویترینی دارد و عرضه آن در قالب طلای کم‌اجرت موجب ${calcResults.customerSavingsToman.toLocaleString(
                          'fa-IR'
                        )} تومان صرفه‌جویی برای خریدار و بیشترین سود اقتصادی برای پلتفرم خواهد شد.`
                      : 'به دلیل ساختار فیزیکی یا هزینه‌های نامتناسب پرداخت، ذوب مستقیم در کوره و بازیافت به شمش آب‌شده استاندارد توجیه‌پذیرتر است.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                    <span className="text-stone-500 block mb-1">ارزش طلای خام پایه:</span>
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      {calcResults.rawValue.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                    <span className="text-stone-500 block mb-1">قیمت معادل نوی بازار (اجرت ۲۲٪):</span>
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      {calcResults.standardNewPrice.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <span className="text-emerald-700 block mb-1">قیمت ویترینی CPO دیدار (۳.۵٪ کارمزد):</span>
                    <span className="font-mono font-bold text-emerald-800 text-base">
                      {calcResults.cpoSellingPrice.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>

                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
                    <span className="text-sky-700 block mb-1">سود خالص خریدار نسبت به نو:</span>
                    <span className="font-mono font-bold text-sky-800 text-base">
                      {calcResults.customerSavingsToman.toLocaleString('fa-IR')} تومان ({calcResults.customerSavingsPercent}٪)
                    </span>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                    <span className="text-stone-500 block mb-1">ارزش بازیافت شمش (افت ۰.۸٪ کوره):</span>
                    <span className="font-mono font-bold text-stone-700 text-sm">
                      {calcResults.meltValue.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <span className="text-amber-700 block mb-1">سود مازاد دیدار از احیا به جای ذوب:</span>
                    <span className="font-mono font-bold text-amber-800 text-sm">
                      {calcResults.didarProfitCpo.toLocaleString('fa-IR')} تومان
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LEDGER */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-stone-700" />
              دفتر ثبت تغییرناپذیر عملیات کارگاه، بوته‌های ذوب و ممیزی زنجیره نگهداری K20
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              تعداد لاگ‌های ثبت شده: {data?.auditLogs.length}
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {data?.auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-stone-50 transition-colors text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        log.category === 'smelting'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : log.category === 'refurbishment'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : log.category === 'gem_recovery'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {log.actionFa}
                    </span>
                    <span className="font-mono font-bold text-stone-800">{log.batchOrItemCode}</span>
                  </div>
                  <div className="text-stone-400 text-[11px]">{log.timestampFa}</div>
                </div>

                <p className="text-stone-700 my-1">{log.detailsFa}</p>

                <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2">
                  <span>اپراتور مسوول: {log.operatorFa}</span>
                  <span className="font-mono text-stone-400 select-all">{log.integrityHash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: NEW INTAKE TO WORKSHOP */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" />
                پذیرش قطعه جدید در کارگاه احیا و جلای ویترینی
              </h3>
              <button
                onClick={() => setShowIntakeModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIntake} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">عنوان کامل قطعه:</label>
                <input
                  type="text"
                  required
                  value={intakeForm.originalTitleFa}
                  onChange={(e) => setIntakeForm({ ...intakeForm, originalTitleFa: e.target.value })}
                  placeholder="مثال: نیم‌ست یاقوت کبود طلا ۱۸ عیار..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">دسته‌بندی زیور:</label>
                  <select
                    value={intakeForm.categoryFa}
                    onChange={(e) => setIntakeForm({ ...intakeForm, categoryFa: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  >
                    <option value="گردنبند مجلسی">گردنبند مجلسی</option>
                    <option value="دستبند زنجیری">دستبند زنجیری</option>
                    <option value="انگشتر زنانه">انگشتر زنانه</option>
                    <option value="النگو">النگو</option>
                    <option value="گوشواره">گوشواره</option>
                    <option value="سرویس کامل">سرویس کامل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">شناسه پرونده مبدا K19:</label>
                  <input
                    type="text"
                    value={intakeForm.sourceBuybackId}
                    onChange={(e) => setIntakeForm({ ...intakeForm, sourceBuybackId: e.target.value })}
                    placeholder="مثال: BBK-1404-001"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">وزن ناخالص (گرم):</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={intakeForm.grossWeightGrams}
                    onChange={(e) => setIntakeForm({ ...intakeForm, grossWeightGrams: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">وزن خالص طلا (گرم):</label>
                  <input
                    type="number"
                    step="0.001"
                    value={intakeForm.netGoldWeightGrams}
                    onChange={(e) => setIntakeForm({ ...intakeForm, netGoldWeightGrams: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">کارگاه پذیرنده:</label>
                  <input
                    type="text"
                    value={intakeForm.workshopNameFa}
                    onChange={(e) => setIntakeForm({ ...intakeForm, workshopNameFa: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">استادکار مسوول احیا:</label>
                  <input
                    type="text"
                    value={intakeForm.artisanNameFa}
                    onChange={(e) => setIntakeForm({ ...intakeForm, artisanNameFa: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">هزینه احیا و آبکاری (تومان):</label>
                <input
                  type="number"
                  step="50000"
                  value={intakeForm.refurbishCostToman}
                  onChange={(e) => setIntakeForm({ ...intakeForm, refurbishCostToman: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hasPreciousStones"
                  checked={intakeForm.hasPreciousStones}
                  onChange={(e) => setIntakeForm({ ...intakeForm, hasPreciousStones: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="hasPreciousStones" className="text-stone-700 font-medium">
                  دارای نگین طبیعی یا گوهرسنگ قیمتی است
                </label>
              </div>

              {intakeForm.hasPreciousStones && (
                <div>
                  <label className="block text-stone-700 font-medium mb-1">شرح سنگ‌های قیمتی:</label>
                  <input
                    type="text"
                    value={intakeForm.gemsDescriptionFa}
                    onChange={(e) => setIntakeForm({ ...intakeForm, gemsDescriptionFa: e.target.value })}
                    placeholder="مثال: نگین زمرد کلمبیا ۰.۵ قیراطی..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-medium mb-1">توضیحات کارشناسی اولیه:</label>
                <textarea
                  rows={2}
                  value={intakeForm.beforeAfterNotesFa}
                  onChange={(e) => setIntakeForm({ ...intakeForm, beforeAfterNotesFa: e.target.value })}
                  placeholder="مواردی نظیر خط‌وخش، شل بودن چنگه‌ها و نیاز به آبکاری..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium"
                >
                  ثبت پذیرش در کارگاه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW MELT BATCH */}
      {showMeltModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600" />
                تشکیل بوته ذوب جدید در کوره (Crucible Melt Batch)
              </h3>
              <button
                onClick={() => setShowMeltModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeltBatch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">شماره بوته ذوب:</label>
                  <input
                    type="text"
                    required
                    value={meltForm.crucibleNumber}
                    onChange={(e) => setMeltForm({ ...meltForm, crucibleNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">تعداد قطعات قراضه:</label>
                  <input
                    type="number"
                    value={meltForm.sourceItemsCount}
                    onChange={(e) => setMeltForm({ ...meltForm, sourceItemsCount: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">وزن کل قراضه ورودی (گرم):</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={meltForm.totalInputWeightGrams}
                  onChange={(e) => setMeltForm({ ...meltForm, totalInputWeightGrams: e.target.value })}
                  placeholder="مثال: ۱۷۵.۴۵۰"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">عیار تخمینی:</label>
                  <input
                    type="number"
                    step="0.001"
                    value={meltForm.expectedPurity}
                    onChange={(e) => setMeltForm({ ...meltForm, expectedPurity: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">مقصد شمش حاصل:</label>
                  <select
                    value={meltForm.destination}
                    onChange={(e: any) => setMeltForm({ ...meltForm, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  >
                    <option value="k09_reserve_vault">خزانه مرکزی شمش K09</option>
                    <option value="k07_supplier_workshop">کارگاه سازنده طلا K07</option>
                    <option value="treasury_sale">فروش شمش به خزانه نقدی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">سرپرست کوره و ریخته‌گری:</label>
                <input
                  type="text"
                  value={meltForm.furnaceOperatorFa}
                  onChange={(e) => setMeltForm({ ...meltForm, furnaceOperatorFa: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">شرح اقلام تشکیل‌دهنده بوته:</label>
                <textarea
                  rows={2}
                  value={meltForm.sourceItemsSummaryFa}
                  onChange={(e) => setMeltForm({ ...meltForm, sourceItemsSummaryFa: e.target.value })}
                  placeholder="اقلام شکسته، زنجیر پاره، تاره و طلای غیرقابل احیا..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMeltModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium"
                >
                  ایجاد بوته ذوب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NEW GEM RECOVERY */}
      {showGemModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Gem className="w-5 h-5 text-sky-600" />
                ثبت گوهرسنگ بازیابی‌شده از طلای بازخرید
              </h3>
              <button
                onClick={() => setShowGemModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGemRecovery} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">نوع گوهرسنگ:</label>
                <input
                  type="text"
                  required
                  value={gemForm.gemTypeFa}
                  onChange={(e) => setGemForm({ ...gemForm, gemTypeFa: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">وزن سنگ (قیراط):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={gemForm.caratWeight}
                    onChange={(e) => setGemForm({ ...gemForm, caratWeight: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">تراش و شکل هندسی:</label>
                  <input
                    type="text"
                    value={gemForm.cutShapeFa}
                    onChange={(e) => setGemForm({ ...gemForm, cutShapeFa: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">درجه رنگ (Color):</label>
                  <input
                    type="text"
                    value={gemForm.colorGrade}
                    onChange={(e) => setGemForm({ ...gemForm, colorGrade: e.target.value })}
                    placeholder="Color F, G, Vivid Red..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">درجه پاکی (Clarity):</label>
                  <input
                    type="text"
                    value={gemForm.clarityGrade}
                    onChange={(e) => setGemForm({ ...gemForm, clarityGrade: e.target.value })}
                    placeholder="VVS1, VS2, Eye Clean..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">ارزش کارشناسی گوهرسنگ (تومان):</label>
                <input
                  type="number"
                  step="100000"
                  required
                  value={gemForm.estimatedValueToman}
                  onChange={(e) => setGemForm({ ...gemForm, estimatedValueToman: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">شماره پرونده بازخرید مبدا:</label>
                  <input
                    type="text"
                    value={gemForm.sourceBuybackNumber}
                    onChange={(e) => setGemForm({ ...gemForm, sourceBuybackNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">محل نگهداری در خزانه:</label>
                  <input
                    type="text"
                    value={gemForm.allocatedVaultFa}
                    onChange={(e) => setGemForm({ ...gemForm, allocatedVaultFa: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">گوهرشناس تاییدکننده:</label>
                <input
                  type="text"
                  value={gemForm.gemologistFa}
                  onChange={(e) => setGemForm({ ...gemForm, gemologistFa: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGemModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium"
                >
                  ثبت در خزانه گوهرسنگ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CPO DIGITAL PASSPORT MODAL */}
      {selectedItemForPassport && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border-2 border-amber-500/40 relative">
            <button
              onClick={() => setSelectedItemForPassport(null)}
              className="absolute top-4 left-4 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-2">
              <div className="inline-flex p-3 rounded-full bg-amber-50 border border-amber-200 mb-2">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">
                شناسنامه طلای احیاشده دیدار (Didar CPO Passport)
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                {selectedItemForPassport.passportUid || 'DID-CPO-CERTIFIED'}
              </p>
            </div>

            <div className="bg-stone-50 rounded-xl p-4 space-y-2.5 text-xs border border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-500">عنوان کالا:</span>
                <span className="font-bold text-stone-900">{selectedItemForPassport.originalTitleFa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">کد اختصاصی:</span>
                <span className="font-mono font-bold text-stone-800">{selectedItemForPassport.itemCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">عیار رسمی:</span>
                <span className="font-medium text-stone-800">{selectedItemForPassport.karatFa} (۷۵۰)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">وزن قطعی:</span>
                <span className="font-mono font-bold text-stone-900">
                  {selectedItemForPassport.grossWeightGrams.toFixed(3)} گرم
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">نمره کنترل کیفیت (QC):</span>
                <span className="font-mono font-bold text-emerald-700">
                  {selectedItemForPassport.qcScore} / ۱۰۰ (پاس شده)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">گارانتی سلامت و اصالت:</span>
                <span className="font-bold text-stone-900">
                  {selectedItemForPassport.warrantyMonths} ماه ضمانت رسمی دیدار
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">کارگاه و سرپرست QC:</span>
                <span className="text-stone-700">{selectedItemForPassport.qcInspectorFa}</span>
              </div>
            </div>

            <div className="bg-amber-50/70 rounded-xl p-3 text-xs border border-amber-200 text-stone-700">
              <span className="font-semibold block mb-1">شرح عملیات احیا در کارگاه:</span>
              <p className="leading-relaxed">{selectedItemForPassport.beforeAfterNotesFa}</p>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-stone-400">قیمت مصوب: {selectedItemForPassport.cpoSellingPriceToman.toLocaleString('fa-IR')} تومان</span>
              <button
                onClick={() => setSelectedItemForPassport(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium"
              >
                بستن شناسنامه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: STAGE UPDATE MODAL */}
      {selectedItemForStageUpdate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                تنظیم وضعیت کارگاهی قطعه {selectedItemForStageUpdate.itemCode}
              </h3>
              <button
                onClick={() => setSelectedItemForStageUpdate(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItemStage} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">مرحله جاری کارگاه:</label>
                <select
                  value={stageUpdateForm.status}
                  onChange={(e: any) => setStageUpdateForm({ ...stageUpdateForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                >
                  <option value="intake_assessment">پذیرش و ارزیابی عیار</option>
                  <option value="ultrasonic_cleaning">شستشوی التراسونیک</option>
                  <option value="polishing_buffing">پرداخت و پولیش آینه‌ای</option>
                  <option value="rhodium_plating">آبکاری رودیوم / طلا</option>
                  <option value="gem_tightening">آچارکشی و مخراج‌کاری نگین</option>
                  <option value="qc_passed">پاس شدن بازرسی QC</option>
                  <option value="cpo_showcase_listed">عرضه در ویترین CPO دیدار</option>
                  <option value="sold_reissued">فروش‌رفته با ضمانت‌نامه</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">نمره کنترل کیفیت (QC):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={stageUpdateForm.qcScore}
                    onChange={(e) => setStageUpdateForm({ ...stageUpdateForm, qcScore: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">سرپرست کنترل کیفیت:</label>
                  <input
                    type="text"
                    value={stageUpdateForm.qcInspectorFa}
                    onChange={(e) => setStageUpdateForm({ ...stageUpdateForm, qcInspectorFa: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">یادداشت تکمیلی کارگاه:</label>
                <textarea
                  rows={2}
                  value={stageUpdateForm.notesFa}
                  onChange={(e) => setStageUpdateForm({ ...stageUpdateForm, notesFa: e.target.value })}
                  placeholder="اقدامات انجام‌شده در این مرحله..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForStageUpdate(null)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ASSAY LAB RESULTS MODAL */}
      {selectedBatchForAssay && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-600" />
                ثبت نتایج ری‌گیری و قالب‌گیری شمش {selectedBatchForAssay.batchNumber}
              </h3>
              <button
                onClick={() => setSelectedBatchForAssay(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBatchAssay} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">وزن قطعی شمش قالب‌گیری‌شده (گرم):</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={assayForm.meltedIngotWeightGrams}
                  onChange={(e) => setAssayForm({ ...assayForm, meltedIngotWeightGrams: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">نام آزمایشگاه ری‌گیری:</label>
                  <input
                    type="text"
                    required
                    value={assayForm.assayLabNameFa}
                    onChange={(e) => setAssayForm({ ...assayForm, assayLabNameFa: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">شماره انگ رسمی اتحادیه:</label>
                  <input
                    type="text"
                    required
                    value={assayForm.assayCertificateNumber}
                    onChange={(e) => setAssayForm({ ...assayForm, assayCertificateNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">عیار رسمی اعلامی ری‌گیری:</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={assayForm.certifiedPurity}
                    onChange={(e) => setAssayForm({ ...assayForm, certifiedPurity: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">تخصیص مقصد شمش:</label>
                  <select
                    value={assayForm.destination}
                    onChange={(e: any) => setAssayForm({ ...assayForm, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  >
                    <option value="k09_reserve_vault">خزانه مرکزی شمش دیدار (K09)</option>
                    <option value="k07_supplier_workshop">کارگاه سازنده همکار دیدار (K07)</option>
                    <option value="treasury_sale">فروش شمش به خزانه نقدی</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBatchForAssay(null)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium"
                >
                  تایید انگ و صدور بارکد شمش
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
