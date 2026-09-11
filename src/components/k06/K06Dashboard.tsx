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
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">در حال بارگذاری شناسنامه‌های یکتا و زنجیره اصالت طلا...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
        <h4 className="text-base font-bold text-rose-900 mb-1">خطا در بارگذاری سامانه K06</h4>
        <p className="text-xs text-rose-700 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors"
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
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 left-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-slide-up ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-amber-100 text-amber-900 rounded-md">
                  KERNEL DOMAIN K06
                </span>
                <span className="text-xs text-slate-500 font-medium">پایگاه متمرکز اصالت و رمزنگاری</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                شناسه یکتا، گذرنامه دیجیتال مصنوعات طلا و زنجیره اصالت (Provenance)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                تخصیص شناسه یکتا به هر قطعه فیزیکی طلا، وزن‌سنجی تحلیلی کالیبره، استعلام عیار ری‌گیری رسمی (کوپلاسیون/XRF)، شواهد میکروسکوپی QC و ثبت سند تغییرناپذیر مالکیت
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setVerificationInitialQuery('');
                setShowVerificationModal(true);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-slate-700" />
              استعلام آنلاین QR/NFC
            </button>

            <button
              onClick={() => setShowMintModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              صدور گذرنامه جدید (Mint)
            </button>

            <button
              onClick={loadData}
              title="بروزرسانی داده‌ها"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">کل قطعات پلاک‌گذاری‌شده</span>
            <div className="text-lg font-bold text-slate-900 font-mono mt-1">
              {metrics.totalPassportsMinted}{' '}
              <span className="text-xs font-normal text-slate-500">قطعه</span>
            </div>
            <span className="text-[10px] text-amber-700 font-medium">دارای بارکد و تگ NFC</span>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">موجود در خزانه مرکزی دیدار</span>
            <div className="text-lg font-bold text-blue-800 font-mono mt-1">
              {metrics.inVaultCount}{' '}
              <span className="text-xs font-normal text-slate-500">قطعه</span>
            </div>
            <span className="text-[10px] text-blue-600 font-medium">آماده واگذاری به بنکدار</span>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">در ویترین گالری‌های همکار</span>
            <div className="text-lg font-bold text-amber-800 font-mono mt-1">
              {metrics.withRetailersCount}{' '}
              <span className="text-xs font-normal text-slate-500">قطعه</span>
            </div>
            <span className="text-[10px] text-amber-600 font-medium">موجودی آماده عرضه نهایی</span>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">تحویل به مصرف‌کننده نهایی</span>
            <div className="text-lg font-bold text-emerald-800 font-mono mt-1">
              {metrics.activeWithConsumersCount}{' '}
              <span className="text-xs font-normal text-slate-500">قطعه</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">شناسنامه فعال و بیمه اصالت</span>
          </div>

          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">مجموع وزن طلای رهگیری‌شده</span>
            <div className="text-lg font-bold text-slate-900 font-mono mt-1">
              {(metrics.totalGramsTracked || 0).toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-500">گرم</span>
            </div>
            <span className="text-[10px] text-purple-700 font-medium">
              میانگین عیار: {metrics.avgFinenessPurity}‰
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            metrics.reportedLostStolenCount > 0
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-slate-50/80 border-slate-200/80'
          }`}>
            <span className="text-[11px] text-slate-500 block">هشدار سرقت و لیست سیاه</span>
            <div className={`text-lg font-bold font-mono mt-1 ${
              metrics.reportedLostStolenCount > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}>
              {metrics.reportedLostStolenCount}{' '}
              <span className="text-xs font-normal text-slate-500">مورد</span>
            </div>
            <span className="text-[10px] text-rose-600 font-medium">پایش ضدجعل سراسری</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search / Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('passports')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'passports'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              گذرنامه‌های دیجیتال طلا ({filteredPassports.length})
            </button>

            <button
              onClick={() => setActiveTab('provenance')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'provenance'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              دفتر کل زنجیره اصالت (Provenance Ledger)
            </button>

            <button
              onClick={() => setActiveTab('stolen_watch')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'stolen_watch'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              دیدبان سرقت و اصالت ({metrics.reportedLostStolenCount})
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div className="text-xs text-slate-500 flex items-center gap-2 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>سیستم زنجیره تأمین بدون نقص و ضدجعل</span>
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
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 pl-9"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">وضعیت:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                <span className="text-slate-400">عیار:</span>
                <select
                  value={caratFilter}
                  onChange={(e) => setCaratFilter(e.target.value)}
                  className="text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
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
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-950">
                  مرکز پایش سراسری اصالت طلا و پیشگیری از معامله مال مسروقه
                </h3>
                <p className="text-xs text-rose-800">
                  هرگونه قطعه مفقودشده یا سرقت‌شده در صورت استعلام توسط هر یک از بنکداران یا گالری‌های کشور بلافاصله اعلام هشدار می‌دهد.
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
