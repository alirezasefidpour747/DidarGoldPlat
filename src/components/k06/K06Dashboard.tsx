/**
 * Didar Gold Platform - Kernel Domain K06 Dashboard
 * Domain K06: Unique Item IDs, Passports & Provenance
 * شناسنامه دیجیتال هر قطعه فیزیکی طلا، وزن و عیار سنجش‌شده، شواهد QC و زنجیره مالکیت
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  Scale,
  ShieldCheck,
  Building2,
  User,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RotateCw,
  QrCode,
  Search,
  Filter,
  Layers,
  Sparkles,
  FileCheck2,
  Clock,
  Lock,
  ChevronDown
} from 'lucide-react';
import { K06DataPayload, UniqueItemPassport, ProvenanceEvent } from '../../types/k06.js';
import { ProductSku } from '../../types/k05.js';
import { api } from '../../lib/api.js';
import { PassportsTable } from './PassportsTable.js';
import { PassportDetailModal } from './PassportDetailModal.js';
import { MintPassportModal } from './MintPassportModal.js';
import { OwnershipTransferModal } from './OwnershipTransferModal.js';
import { PublicVerificationModal } from './PublicVerificationModal.js';
import { StolenReportModal } from './StolenReportModal.js';
import { ProvenanceTimeline } from './ProvenanceTimeline.js';

export const K06Dashboard: React.FC = () => {
  const [data, setData] = useState<K06DataPayload | null>(null);
  const [products, setProducts] = useState<ProductSku[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'passports' | 'provenance' | 'stolen_watch'>('passports');

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [caratFilter, setCaratFilter] = useState<string>('all');

  // Modals
  const [selectedPassport, setSelectedPassport] = useState<UniqueItemPassport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationInitialQuery, setVerificationInitialQuery] = useState('');
  const [showStolenModal, setShowStolenModal] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [k06Res, k05Res] = await Promise.all([
        api.getK06Data(),
        api.getK05Data().catch(() => ({ products: [] }))
      ]);
      setData(k06Res);
      if (k05Res && 'products' in k05Res) {
        setProducts(k05Res.products);
      }
    } catch (err: unknown) {
      console.error('Error loading K06 data:', err);
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری اطلاعات گذرنامه‌ها و اصالت طلا (K06)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Passports
  const filteredPassports = (data?.passports || []).filter((p) => {
    const matchesSearch =
      p.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productSkuCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productTitleFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.currentOwnerName && p.currentOwnerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.currentHolderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assayLabName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hallmarkCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'stolen' && p.isStolenReported) ||
      (!p.isStolenReported && p.status === statusFilter);

    const matchesCarat = caratFilter === 'all' || p.carat === caratFilter;

    return matchesSearch && matchesStatus && matchesCarat;
  });

  // Actions
  const handleMintPassport = async (formData: any) => {
    try {
      const created = await api.mintPassport(formData);
      showToast('success', `گذرنامه دیجیتال با شناسه ${created.uid} با موفقیت صادر گردید.`);
      await loadData();
    } catch (err: any) {
      showToast('error', err.message || 'خطا در صدور گذرنامه');
      throw err;
    }
  };

  const handleTransferOwnership = async (formData: any) => {
    try {
      const updated = await api.transferOwnership(formData);
      showToast('success', `مالکیت قطعه با موفقیت به نام ${updated.currentOwnerName} ثبت گردید.`);
      await loadData();
      if (selectedPassport?.id === updated.id) {
        setSelectedPassport(updated);
      }
    } catch (err: any) {
      showToast('error', err.message || 'خطا در انتقال مالکیت');
      throw err;
    }
  };

  const handleToggleStolen = async (formData: any) => {
    try {
      const updated = await api.toggleStolen(formData);
      showToast(
        'success',
        formData.isStolen
          ? 'هشدار سرقت این قطعه با موفقیت در شبکه سراسری فعال شد.'
          : 'پرچم سرقت این قطعه ابطال و به وضعیت عادی بازگشت.'
      );
      await loadData();
      if (selectedPassport?.id === updated.id) {
        setSelectedPassport(updated);
      }
    } catch (err: any) {
      showToast('error', err.message || 'خطا در تغییر وضعیت سرقت');
      throw err;
    }
  };

  const handleRecordEvent = async (passport: UniqueItemPassport) => {
    const titleFa = prompt('عنوان رویداد جدید در زنجیره اصالت (مثلاً: انتقال به گالری، پرداخت مجدد):');
    if (!titleFa) return;
    const descFa = prompt('شرح جزئیات رویداد:') || '';

    try {
      await api.recordProvenanceEvent({
        passportId: passport.id,
        eventType: 'service_polished',
        eventTypeFa: 'سرویس دوره‌ای و بررسی فیزیکی',
        titleFa,
        descriptionFa: descFa,
        actorName: 'کارشناس نظارت دیدار',
        actorRoleFa: 'واحد انطباق و کنترل کیفیت',
        fromHolder: passport.currentHolderName,
        toHolder: passport.currentHolderName,
        locationFa: passport.locationCityFa || 'تهران'
      });
      showToast('success', 'رویداد جدید با موفقیت به دفتر کل زنجیره افزوده شد.');
      await loadData();
    } catch (err: any) {
      showToast('error', err.message || 'خطا در ثبت رویداد');
    }
  };

  const handleQuickVerify = (passport: UniqueItemPassport) => {
    setVerificationInitialQuery(passport.uid);
    setShowVerificationModal(true);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-3 border-[#C8A951] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#A0A0B5] font-medium">در حال بارگذاری شناسنامه‌های یکتا و زنجیره اصالت طلا...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-[#E5484D]/10 border border-[#E5484D]/30 rounded-2xl text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-[#E5484D] mx-auto mb-2" />
        <h4 className="text-base font-bold text-[#FF8B8B] mb-1">خطا در بارگذاری سامانه K06</h4>
        <p className="text-xs text-[#FFA4A4] mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-[#E5484D] text-white text-xs font-semibold rounded-lg hover:bg-[#E5484D]/80 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalPassportsMinted: 0,
    inVaultCount: 0,
    withRetailersCount: 0,
    activeWithConsumersCount: 0,
    totalGramsTracked: 0,
    reportedLostStolenCount: 0,
    avgFinenessPurity: 750.0,
    totalProvenanceEvents: 0
  };

  return (
    <div className="space-y-6 pb-16 text-right" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 left-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-slide-up ${
            notification.type === 'success'
              ? 'bg-[#15271E] text-[#3DD68C] border-[#3DD68C]/40'
              : 'bg-[#2A1517] text-[#FF8B8B] border-[#E5484D]/40'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#3DD68C]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#FF6B6B]" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#151520] border border-[#262636] relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#C8A951]/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C8A951]/15 border border-[#C8A951]/40 flex items-center justify-center text-[#E5C365] shadow-lg shadow-[#C8A951]/10 shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40">
                DOMAIN K06
              </span>
              <h1 className="text-xl font-black text-white">
                شناسه یکتا، گذرنامه دیجیتال مصنوعات طلا و زنجیره اصالت
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                فعال و عملیاتی
              </span>
            </div>
            <p className="text-xs text-[#A0A0B5] mt-1 max-w-3xl leading-relaxed">
              تخصیص شناسه یکتا (UID) به هر قطعه فیزیکی طلا، وزن‌سنجی تحلیلی کالیبره، عیار ری‌گیری رسمی اتحادیه، شواهد میکروسکوپی QC و ثبت سند تغییرناپذیر مالکیت
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0 self-end lg:self-center">
          <button
            onClick={() => {
              setVerificationInitialQuery('');
              setShowVerificationModal(true);
            }}
            className="px-3.5 py-2.5 text-xs font-semibold text-[#EDEDED] bg-[#191926] hover:bg-[#252538] border border-[#28283C] rounded-xl transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-[#C8A951]" />
            استعلام آنلاین QR/NFC
          </button>

          <button
            onClick={() => setShowMintModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-[#141416] bg-[#C8A951] hover:bg-[#D9B961] rounded-xl transition-all shadow-lg shadow-[#C8A951]/20 flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            صدور گذرنامه جدید (Mint)
          </button>

          <button
            onClick={loadData}
            title="بروزرسانی داده‌ها"
            className="p-2.5 text-[#A0A0B5] hover:text-white bg-[#191926] hover:bg-[#252538] rounded-xl border border-[#28283C] transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#161622] p-4 rounded-2xl border border-[#28283C] shadow-md space-y-1">
          <span className="text-[11px] text-[#A0A0B5] block">کل قطعات پلاک‌گذاری‌شده</span>
          <div className="text-xl font-black text-white font-mono">
            {metrics.totalPassportsMinted.toLocaleString('fa-IR')}{' '}
            <span className="text-xs font-normal text-[#A0A0B5]">قطعه</span>
          </div>
          <span className="text-[10px] text-[#E5C365] font-medium block">دارای بارکد و تگ NFC</span>
        </div>

        <div className="bg-[#161622] p-4 rounded-2xl border border-[#28283C] shadow-md space-y-1">
          <span className="text-[11px] text-[#A0A0B5] block">موجود در خزانه دیدار</span>
          <div className="text-xl font-black text-[#60A5FA] font-mono">
            {metrics.inVaultCount.toLocaleString('fa-IR')}{' '}
            <span className="text-xs font-normal text-[#A0A0B5]">قطعه</span>
          </div>
          <span className="text-[10px] text-[#93C5FD] font-medium block">آماده واگذاری به بنکدار</span>
        </div>

        <div className="bg-[#161622] p-4 rounded-2xl border border-[#28283C] shadow-md space-y-1">
          <span className="text-[11px] text-[#A0A0B5] block">در ویترین گالری‌های همکار</span>
          <div className="text-xl font-black text-[#F5A623] font-mono">
            {metrics.withRetailersCount.toLocaleString('fa-IR')}{' '}
            <span className="text-xs font-normal text-[#A0A0B5]">قطعه</span>
          </div>
          <span className="text-[10px] text-[#FCD34D] font-medium block">موجودی آماده عرضه نهایی</span>
        </div>

        <div className="bg-[#161622] p-4 rounded-2xl border border-[#28283C] shadow-md space-y-1">
          <span className="text-[11px] text-[#A0A0B5] block">تحویل به خریدار نهایی</span>
          <div className="text-xl font-black text-[#3DD68C] font-mono">
            {metrics.activeWithConsumersCount.toLocaleString('fa-IR')}{' '}
            <span className="text-xs font-normal text-[#A0A0B5]">قطعه</span>
          </div>
          <span className="text-[10px] text-[#6EE7B7] font-medium block">شناسنامه فعال و بیمه‌دار</span>
        </div>

        <div className="bg-[#161622] p-4 rounded-2xl border border-[#28283C] shadow-md space-y-1">
          <span className="text-[11px] text-[#A0A0B5] block">مجموع وزن طلای رهگیری‌شده</span>
          <div className="text-xl font-black text-white font-mono">
            {(metrics.totalGramsTracked || 0).toLocaleString('fa-IR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs font-normal text-[#A0A0B5]">گرم</span>
          </div>
          <span className="text-[10px] text-[#C4B5FD] font-medium block">
            میانگین عیار: {metrics.avgFinenessPurity}‰
          </span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-md space-y-1 ${
          metrics.reportedLostStolenCount > 0
            ? 'bg-[#2A1517] border-[#E5484D]/50 text-white'
            : 'bg-[#161622] border-[#28283C]'
        }`}>
          <span className="text-[11px] text-[#A0A0B5] block">هشدار سرقت و لیست سیاه</span>
          <div className={`text-xl font-black font-mono ${
            metrics.reportedLostStolenCount > 0 ? 'text-[#FF6B6B]' : 'text-white'
          }`}>
            {metrics.reportedLostStolenCount.toLocaleString('fa-IR')}{' '}
            <span className="text-xs font-normal text-[#A0A0B5]">مورد</span>
          </div>
          <span className="text-[10px] text-[#FF8B8B] font-medium block">پایش ضدجعل سراسری</span>
        </div>
      </div>

      {/* Tabs & Search / Filter Controls */}
      <div className="bg-[#161622] rounded-2xl border border-[#28283C] shadow-md p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#28283C] pb-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('passports')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'passports'
                  ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/15'
                  : 'bg-[#191926] text-[#A0A0B5] hover:text-white hover:bg-[#222234] border border-[#2B2B3E]'
              }`}
            >
              <Award className="w-4 h-4" />
              گذرنامه‌های دیجیتال طلا ({filteredPassports.length.toLocaleString('fa-IR')})
            </button>

            <button
              onClick={() => setActiveTab('provenance')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'provenance'
                  ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/15'
                  : 'bg-[#191926] text-[#A0A0B5] hover:text-white hover:bg-[#222234] border border-[#2B2B3E]'
              }`}
            >
              <Clock className="w-4 h-4" />
              دفتر کل زنجیره اصالت (Provenance Ledger)
            </button>

            <button
              onClick={() => setActiveTab('stolen_watch')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'stolen_watch'
                  ? 'bg-[#E5484D] text-white shadow-md shadow-[#E5484D]/20'
                  : 'bg-[#191926] text-[#A0A0B5] hover:text-white hover:bg-[#222234] border border-[#2B2B3E]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              دیدبان سرقت و اصالت ({metrics.reportedLostStolenCount.toLocaleString('fa-IR')})
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div className="text-xs text-[#A0A0B5] flex items-center gap-2 font-mono">
            <Lock className="w-3.5 h-3.5 text-[#3DD68C]" />
            <span>سیستم زنجیره تأمین بدون نقص و ضدجعل دیدار</span>
          </div>
        </div>

        {/* Search & Filter Bar (Only for passports tab) */}
        {activeTab === 'passports' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 min-w-[260px]">
              <input
                type="text"
                placeholder="جستجو بر اساس UID، سریال، مدل کاتالوگ، نام خریدار، آزمایشگاه ری‌گیری، کد انگ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-[#191926] border border-[#2E2E44] text-[#EDEDED] placeholder-[#767688] rounded-xl focus:outline-none focus:border-[#C8A951] pl-9"
              />
              <Search className="w-4 h-4 text-[#A0A0B5] absolute left-3 top-3" />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[#A0A0B5]">وضعیت:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs px-3 py-2 bg-[#191926] border border-[#2E2E44] text-[#EDEDED] rounded-xl focus:outline-none focus:border-[#C8A951]"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="in_vault">موجود در خزانه دیدار</option>
                  <option value="retail_inventory">موجود در ویترین گالری</option>
                  <option value="in_transit">در حال حمل ایمن</option>
                  <option value="sold_active">فروخته‌شده به مصرف‌کننده</option>
                  <option value="stolen">اعلام سرقت / مفقودی</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#A0A0B5]">عیار:</span>
                <select
                  value={caratFilter}
                  onChange={(e) => setCaratFilter(e.target.value)}
                  className="text-xs px-3 py-2 bg-[#191926] border border-[#2E2E44] text-[#EDEDED] rounded-xl focus:outline-none focus:border-[#C8A951]"
                >
                  <option value="all">همه عیارها</option>
                  <option value="18k_750">۱۸ عیار (۷۵۰)</option>
                  <option value="21k_875">۲۱ عیار (۸۷۵)</option>
                  <option value="21.6k_900">۲۱.۶ عیار (۹۰۰ سکه)</option>
                  <option value="24k_995">۲۴ عیار (۹۹۵ بورس کالا)</option>
                  <option value="24k_999">۲۴ عیار (۹۹۹.۹ شمش خالص)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'passports' && (
        <PassportsTable
          passports={filteredPassports}
          onViewPassport={(p) => {
            setSelectedPassport(p);
            setShowDetailModal(true);
          }}
          onTransferOwnership={(p) => {
            setSelectedPassport(p);
            setShowTransferModal(true);
          }}
          onToggleStolen={(p) => {
            setSelectedPassport(p);
            setShowStolenModal(true);
          }}
          onQuickVerify={handleQuickVerify}
        />
      )}

      {activeTab === 'provenance' && (
        <ProvenanceTimeline
          events={data?.events || []}
          passports={data?.passports || []}
          onSelectPassport={(p) => {
            setSelectedPassport(p);
            setShowDetailModal(true);
          }}
        />
      )}

      {activeTab === 'stolen_watch' && (
        <div className="space-y-6">
          <div className="bg-[#2A1517] border border-[#E5484D]/40 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E5484D] text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#FF8B8B]">
                  مرکز پایش سراسری اصالت طلا و پیشگیری از معامله مال مسروقه
                </h3>
                <p className="text-xs text-[#FFA4A4] mt-1 leading-relaxed">
                  هرگونه قطعه مفقودشده یا سرقت‌شده در صورت استعلام توسط هر یک از بنکداران یا گالری‌های کشور بلافاصله اعلام هشدار داده و کد پیگیری صادر می‌نماید.
                </p>
              </div>
            </div>
          </div>

          <PassportsTable
            passports={(data?.passports || []).filter((p) => p.isStolenReported)}
            onViewPassport={(p) => {
              setSelectedPassport(p);
              setShowDetailModal(true);
            }}
            onTransferOwnership={(p) => {
              setSelectedPassport(p);
              setShowTransferModal(true);
            }}
            onToggleStolen={(p) => {
              setSelectedPassport(p);
              setShowStolenModal(true);
            }}
            onQuickVerify={handleQuickVerify}
          />
        </div>
      )}

      {/* Modals */}
      {showDetailModal && selectedPassport && (
        <PassportDetailModal
          passport={selectedPassport}
          events={data?.events || []}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPassport(null);
          }}
          onTransferOwnership={(p) => {
            setShowDetailModal(false);
            setSelectedPassport(p);
            setShowTransferModal(true);
          }}
          onToggleStolen={(p) => {
            setShowDetailModal(false);
            setSelectedPassport(p);
            setShowStolenModal(true);
          }}
          onRecordEvent={handleRecordEvent}
        />
      )}

      {showMintModal && (
        <MintPassportModal
          products={products}
          onClose={() => setShowMintModal(false)}
          onSubmit={handleMintPassport}
        />
      )}

      {showTransferModal && selectedPassport && (
        <OwnershipTransferModal
          passport={selectedPassport}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedPassport(null);
          }}
          onSubmit={handleTransferOwnership}
        />
      )}

      {showStolenModal && selectedPassport && (
        <StolenReportModal
          passport={selectedPassport}
          onClose={() => {
            setShowStolenModal(false);
            setSelectedPassport(null);
          }}
          onSubmit={handleToggleStolen}
        />
      )}

      {showVerificationModal && (
        <PublicVerificationModal
          onClose={() => setShowVerificationModal(false)}
          initialQuery={verificationInitialQuery}
        />
      )}
    </div>
  );
};
