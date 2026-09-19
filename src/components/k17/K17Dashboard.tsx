/**
 * Didar Gold Platform - Kernel 17 (K17) Dashboard
 * Consumer Ownership Claims, Digital Provenance, Warranty & Anti-Theft Management
 * (سامانه ثبت مالکیت مصرف‌کننده، کارت گارانتی دیجیتال، انتقال سند و سامانه ضدسرقت)
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  QrCode,
  UserPlus,
  ArrowRightLeft,
  Wrench,
  AlertTriangle,
  Scale,
  Sparkles,
  Store,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  Filter,
  Eye,
  Check,
  Building2,
  Phone,
  Laptop
} from 'lucide-react';
import {
  K17DataPayload,
  OwnershipClaim,
  WarrantyCard,
  OwnershipTransferRequest,
  StolenReport
} from '../../types/k17.js';
import { api } from '../../lib/api.js';
import { UidProvenanceScanner } from './UidProvenanceScanner.js';
import { DigitalDeedModal } from './DigitalDeedModal.js';
import { NewClaimModal } from './NewClaimModal.js';
import { TransferModal } from './TransferModal.js';
import { StolenReportModal } from './StolenReportModal.js';
import { WarrantyServiceModal } from './WarrantyServiceModal.js';

type K17Tab = 'scanner' | 'claims' | 'warranties' | 'transfers' | 'anti_theft' | 'retailer_pos';

export const K17Dashboard: React.FC = () => {
  const [data, setData] = useState<K17DataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<K17Tab>('scanner');

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Toast / Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isDeedModalOpen, setIsDeedModalOpen] = useState(false);
  const [selectedClaimForDeed, setSelectedClaimForDeed] = useState<OwnershipClaim | null>(null);

  const [isNewClaimModalOpen, setIsNewClaimModalOpen] = useState(false);
  const [prefilledClaimUid, setPrefilledClaimUid] = useState('');
  const [prefilledClaimTitle, setPrefilledClaimTitle] = useState('');
  const [prefilledClaimWeight, setPrefilledClaimWeight] = useState(0);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedClaimForTransfer, setSelectedClaimForTransfer] = useState<OwnershipClaim | null>(null);

  const [isStolenModalOpen, setIsStolenModalOpen] = useState(false);
  const [stolenTargetUid, setStolenTargetUid] = useState('');
  const [defaultReporterName, setDefaultReporterName] = useState('');
  const [defaultReporterMobile, setDefaultReporterMobile] = useState('');

  const [isWarrantyServiceModalOpen, setIsWarrantyServiceModalOpen] = useState(false);
  const [selectedWarrantyForService, setSelectedWarrantyForService] = useState<WarrantyCard | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getK17Data();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت اطلاعات سامانه K17');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick helper to resolve stolen status
  const handleResolveStolen = async (reportId: string) => {
    try {
      const res = await api.resolveK17Stolen(reportId);
      if (res.success) {
        showToast(res.message, 'success');
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در لغو اعلام سرقت', 'error');
    }
  };

  // Filtered claims
  const filteredClaims = (data?.claims || []).filter(c => {
    const matchesSearch =
      c.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.itemSpec.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.consumer.fullNameFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.consumer.nationalId.includes(searchQuery) ||
      c.retailerProof.retailerNameFa.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered warranties
  const filteredWarranties = (data?.warranties || []).filter(w => {
    return (
      w.warrantyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.itemUid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.ownerFullNameFa.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Banner */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold transition-all ${
            toast.type === 'success'
              ? 'bg-[#183424] text-[#3DD68C] border border-[#3DD68C]/50'
              : 'bg-[#38181A] text-[#FF8B8B] border border-[#E5484D]/50'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#171722] via-[#1B1B28] to-[#14141E] border border-[#2B2B3E] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#C8A951]/20 border border-[#C8A951]/40 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#E5C365]" />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-black text-[#EDEDED] flex items-center gap-2">
                  <span>ثبت مالکیت مصرف‌کننده و ضمانت اصالت طلا (K17)</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C8A951]/20 text-[#E5C365] font-mono font-bold border border-[#C8A951]/40">
                    Consumer Provenance & Warranty
                  </span>
                </h1>
                <p className="text-xs text-[#8E8EA0]">
                  استعلام شناسنامه طلا، صدور سند دیجیتال مصرف‌کننده، فعال‌سازی کارت گارانتی و ردگیری سرقت
                </p>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <button
              onClick={() => {
                setPrefilledClaimUid('');
                setPrefilledClaimTitle('');
                setPrefilledClaimWeight(0);
                setIsNewClaimModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#C8A951] hover:bg-[#D4B763] text-[#141416] text-xs font-bold transition-all shadow-lg shadow-[#C8A951]/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>ثبت سند مالکیت جدید</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-[#222232] hover:bg-[#2C2C40] text-[#8E8EA0] hover:text-[#EDEDED] border border-[#303044] transition-all cursor-pointer"
              title="تازه‌سازی اطلاعات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#C8A951]' : ''}`} />
            </button>
          </div>

        </div>

        {/* Live Metrics Pulse Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-[#262638]">
          <div className="p-3 rounded-2xl bg-[#14141E]/80 border border-[#252535]">
            <span className="text-[10px] text-[#8E8EA0] block">اسناد مالکیت قطعی:</span>
            <span className="text-lg font-black font-mono text-[#EDEDED] mt-0.5 block">
              {data?.metrics.totalRegisteredClaims || 0}
            </span>
            <span className="text-[10px] text-[#3DD68C] mt-0.5 block">احراز هویت شده</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#14141E]/80 border border-[#252535]">
            <span className="text-[10px] text-[#8E8EA0] block">مجموع طلای مالکان:</span>
            <span className="text-lg font-black font-mono text-[#E5C365] mt-0.5 block">
              {(data?.metrics.totalGoldWeightGrams || 0).toFixed(2)} <span className="text-xs font-sans">گرم</span>
            </span>
            <span className="text-[10px] text-[#8E8EA0] mt-0.5 block">طلای ۱۸ عیار ثبت‌شده</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#14141E]/80 border border-[#252535]">
            <span className="text-[10px] text-[#8E8EA0] block">گارانتی‌های فعال دیدار:</span>
            <span className="text-lg font-black font-mono text-[#3DD68C] mt-0.5 block">
              {data?.metrics.activeWarranties || 0}
            </span>
            <span className="text-[10px] text-[#8E8EA0] mt-0.5 block">پوشش ۲۴ ماهه</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#14141E]/80 border border-[#252535]">
            <span className="text-[10px] text-[#8E8EA0] block">هشدار سرقت و قفل:</span>
            <span className="text-lg font-black font-mono text-[#FF8B8B] mt-0.5 block">
              {data?.metrics.activeStolenAlerts || 0}
            </span>
            <span className="text-[10px] text-[#E5484D] mt-0.5 block">پرونده فعال پلیس</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#14141E]/80 border border-[#252535]">
            <span className="text-[10px] text-[#8E8EA0] block">نرخ اصالت و تطبیق:</span>
            <span className="text-lg font-black font-mono text-[#EDEDED] mt-0.5 block">
              {data?.metrics.provenanceVerificationRate || 100}%
            </span>
            <span className="text-[10px] text-[#3DD68C] mt-0.5 block">تضمین ری‌گیری</span>
          </div>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#161622] border border-[#272738] overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'scanner'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1E1E2C]'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>استعلام و اسکن شناسنامه (Scanner)</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'claims'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1E1E2C]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>اسناد مالکیت دیجیتال ({data?.claims.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('warranties')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'warranties'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1E1E2C]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>کارت‌های گارانتی ({data?.warranties.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'transfers'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1E1E2C]'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>نقل و انتقال سند ({data?.transferRequests.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('anti_theft')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'anti_theft'
              ? 'bg-[#E5484D] text-white shadow-md shadow-[#E5484D]/30'
              : 'text-[#FF8B8B] hover:text-white hover:bg-[#281316]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>سامانه ضدسرقت ({data?.stolenReports.filter(s => s.status === 'active_alert').length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('retailer_pos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'retailer_pos'
              ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
              : 'text-[#8E8EA0] hover:text-[#EDEDED] hover:bg-[#1E1E2C]'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>دستیار صدور سریع طلافروشی (POS)</span>
        </button>
      </div>

      {/* Tab 1: Live Scanner View */}
      {activeTab === 'scanner' && (
        <UidProvenanceScanner
          onOpenClaimModal={(uid, title, weight) => {
            setPrefilledClaimUid(uid);
            setPrefilledClaimTitle(title || '');
            setPrefilledClaimWeight(weight || 0);
            setIsNewClaimModalOpen(true);
          }}
          onOpenDeedModal={(claim, warranty) => {
            setSelectedClaimForDeed(claim);
            setIsDeedModalOpen(true);
          }}
          onOpenTransferModal={(claim) => {
            setSelectedClaimForTransfer(claim);
            setIsTransferModalOpen(true);
          }}
          onOpenStolenModal={(uid, claim) => {
            setStolenTargetUid(uid);
            setDefaultReporterName(claim?.consumer.fullNameFa || '');
            setDefaultReporterMobile(claim?.consumer.mobile || '');
            setIsStolenModalOpen(true);
          }}
        />
      )}

      {/* Tab 2: Ownership Claims Directory */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-[#171722] border border-[#272738] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8EA0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در شماره سند، UID، خریدار یا فروشگاه..."
                className="w-full pr-9 pl-4 py-2 rounded-xl bg-[#12121A] border border-[#2C2C3E] text-xs text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
              <span className="text-[#8E8EA0] text-[11px]">وضعیت:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#12121A] border border-[#2C2C3E] text-xs text-[#EDEDED] focus:outline-none"
              >
                <option value="all">همه اسناد</option>
                <option value="active">سند معتبر و فعال</option>
                <option value="transferred">واگذار شده</option>
                <option value="stolen_locked">قفل سرقت</option>
              </select>
            </div>
          </div>

          {/* Claims List Table */}
          <div className="rounded-2xl bg-[#161622] border border-[#272738] overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-[#1C1C29] text-[#8E8EA0] border-b border-[#272738]">
                    <th className="p-3.5 font-semibold">شماره سند و تاریخ</th>
                    <th className="p-3.5 font-semibold">شناسه یکتای قطعه (UID)</th>
                    <th className="p-3.5 font-semibold">مشخصات طلا و وزن</th>
                    <th className="p-3.5 font-semibold">مالک قانونی</th>
                    <th className="p-3.5 font-semibold">فروشگاه صادرکننده</th>
                    <th className="p-3.5 font-semibold text-center">وضعیت</th>
                    <th className="p-3.5 font-semibold text-left">عملیات سند</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222232]">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#8E8EA0]">
                        هیچ سندی با معیارهای جستجو یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-[#1B1B27] transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-[#E5C365] block">{claim.claimNumber}</span>
                          <span className="text-[10px] text-[#8E8EA0]">{claim.claimDateFa}</span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-[#EDEDED]">
                          {claim.itemSpec.uid}
                        </td>
                        <td className="p-3.5">
                          <span className="font-medium text-[#EDEDED] block">{claim.itemSpec.productTitleFa}</span>
                          <span className="text-[10px] text-[#C8A951]">
                            {claim.itemSpec.caratFa} • {claim.itemSpec.actualScaleWeightGrams.toFixed(2)} گرم
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-[#EDEDED] block">{claim.consumer.fullNameFa}</span>
                          <span className="text-[10px] text-[#8E8EA0] font-mono">{claim.consumer.mobile}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-[#EDEDED] block">{claim.retailerProof.retailerNameFa}</span>
                          <span className="text-[10px] text-[#8E8EA0]">فاکتور: {claim.retailerProof.salesInvoiceNumber}</span>
                        </td>
                        <td className="p-3.5 text-center">
                          {claim.status === 'active' && (
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30 font-bold">
                              مالکیت فعال
                            </span>
                          )}
                          {claim.status === 'transferred' && (
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 font-bold">
                              منتقل‌شده
                            </span>
                          )}
                          {claim.status === 'stolen_locked' && (
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#E5484D]/15 text-[#FF8B8B] border border-[#E5484D]/30 font-bold">
                              قفل سرقت
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedClaimForDeed(claim);
                                setIsDeedModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-[#222232] hover:bg-[#2C2C40] text-[#C8A951] hover:text-[#E5C365] transition-colors"
                              title="مشاهده سند رسمی دیجیتال"
                            >
                              <Award className="w-4 h-4" />
                            </button>

                            {claim.status === 'active' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedClaimForTransfer(claim);
                                    setIsTransferModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-[#222232] hover:bg-[#2C2C40] text-[#EDEDED] hover:text-[#3DD68C] transition-colors"
                                  title="انتقال مالکیت به دیگری"
                                >
                                  <ArrowRightLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setStolenTargetUid(claim.itemSpec.uid);
                                    setDefaultReporterName(claim.consumer.fullNameFa);
                                    setDefaultReporterMobile(claim.consumer.mobile);
                                    setIsStolenModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-[#222232] hover:bg-[#2C2C40] text-[#FF8B8B] hover:text-white transition-colors"
                                  title="اعلام مفقودی یا سرقت"
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                </button>
                              </>
                            )}
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

      {/* Tab 3: Digital Warranty Cards Vault */}
      {activeTab === 'warranties' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWarranties.map((w) => (
              <div
                key={w.id}
                className="p-5 rounded-3xl bg-gradient-to-b from-[#191924] to-[#14141C] border border-[#2D2D40] space-y-4 shadow-xl hover:border-[#C8A951]/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#252536]">
                    <div>
                      <span className="text-[10px] text-[#8E8EA0] block">شماره گارانتی طلایی:</span>
                      <span className="font-mono font-bold text-xs text-[#E5C365]">{w.warrantyNumber}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3DD68C]/15 text-[#3DD68C] font-bold border border-[#3DD68C]/30">
                      فعال ({w.durationMonths} ماه)
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8E8EA0]">نام دارنده کارت:</span>
                      <span className="font-bold text-[#EDEDED]">{w.ownerFullNameFa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E8EA0]">شناسه قطعه طلا:</span>
                      <span className="font-mono text-[#C8A951]">{w.itemUid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E8EA0]">تاریخ پایان اعتبار:</span>
                      <span className="text-[#EDEDED]">{w.expirationDateFa}</span>
                    </div>
                  </div>

                  {/* Coverage Pills */}
                  <div className="pt-1 space-y-1">
                    <span className="text-[10px] text-[#8E8EA0] block">تعهدات پوشش‌داده‌شده:</span>
                    <div className="flex flex-wrap gap-1">
                      {w.coverages.map((cov, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-[#202030] text-[#C8A951] border border-[#2B2B3E]">
                          {cov.titleFa}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Service logs summary */}
                  <div className="p-2.5 rounded-2xl bg-[#12121A] border border-[#222232] text-[11px] flex items-center justify-between">
                    <span className="text-[#8E8EA0]">سوابق سرویس و خدمات:</span>
                    <span className="font-bold text-[#3DD68C]">{w.serviceLogs.length} بار مراجعه رایگان</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#252536] flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedWarrantyForService(w);
                      setIsWarrantyServiceModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#222232] hover:bg-[#2B2B3E] text-[#EDEDED] text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5 text-[#C8A951]" />
                    <span>ثبت سرویس رایگان</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Ownership Transfers Log */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#171722] border border-[#272738] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#C8A951]" />
              <h3 className="font-bold text-xs md:text-sm text-[#EDEDED]">
                دفتر نقل و انتقال مالکیت و فروش ثانویه (Secondary Market Transfers)
              </h3>
            </div>
            <span className="text-xs text-[#8E8EA0]">
              کلیه انتقالات با کد احراز هویت پیامکی ۲ مرحله‌ای ثبت شده‌اند.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {data?.transferRequests.map((tr) => (
              <div
                key={tr.id}
                className="p-4 rounded-2xl bg-[#161622] border border-[#28283C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C8A951]/15 border border-[#C8A951]/30 flex items-center justify-center shrink-0">
                    <ArrowRightLeft className="w-5 h-5 text-[#E5C365]" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#EDEDED]">
                        {tr.previousOwnerNameFa}
                      </span>
                      <span className="text-[#8E8EA0]">← به ←</span>
                      <span className="font-bold text-[#3DD68C]">
                        {tr.newOwnerNameFa}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8E8EA0]">
                      قطعه طلا: <span className="font-mono text-[#C8A951]">{tr.itemUid}</span> • {tr.reasonFa}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-left">
                    <span className="text-[10px] text-[#8E8EA0] block">تاریخ انتقال:</span>
                    <span className="text-xs text-[#EDEDED]">{tr.requestedDateFa}</span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#3DD68C]/15 text-[#3DD68C] font-bold text-[10px] border border-[#3DD68C]/30">
                    تأیید پیامکی و نهایی‌شده
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Anti-Theft & Stolen Registry */}
      {activeTab === 'anti_theft' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#2A1316] to-[#1C1012] border-2 border-[#E5484D]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E5484D]/20 border border-[#E5484D] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-[#FF8B8B]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#FF8B8B]">
                  سامانه ملی کشف و اعلام سرقت مصنوعات طلای دیدار
                </h3>
                <p className="text-xs text-[#A57878] mt-0.5">
                  ارتباط بلادرنگ با ویترین طلافروشان، دفاتر ری‌گیری و مراجع پلیس آگاهی
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setStolenTargetUid('');
                setDefaultReporterName('');
                setDefaultReporterMobile('');
                setIsStolenModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E5484D] hover:bg-[#D93D42] text-white text-xs font-bold transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>اعلام سرقت جدید</span>
            </button>
          </div>

          <div className="space-y-3">
            {data?.stolenReports.map((st) => (
              <div
                key={st.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs ${
                  st.status === 'active_alert'
                    ? 'bg-[#211417] border-[#E5484D]/60'
                    : 'bg-[#161622] border-[#2A2A3E]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      st.status === 'active_alert'
                        ? 'bg-[#E5484D]/20 text-[#FF8B8B]'
                        : 'bg-[#3DD68C]/20 text-[#3DD68C]'
                    }`}
                  >
                    {st.status === 'active_alert' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#EDEDED]">{st.itemUid}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          st.status === 'active_alert'
                            ? 'bg-[#E5484D] text-white'
                            : 'bg-[#3DD68C]/20 text-[#3DD68C]'
                        }`}
                      >
                        {st.status === 'active_alert' ? 'قفل سرقت فعال' : 'کشف‌شده و رفع اثر'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#A57878]">
                      گزارش‌دهنده: <span className="text-[#EDEDED] font-semibold">{st.reporterNameFa}</span> • {st.policeStationFa} (کلاسه: {st.policeCaseNumber})
                    </p>
                    {st.descriptionFa && (
                      <p className="text-[10px] text-[#8E8EA0]">{st.descriptionFa}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {st.status === 'active_alert' ? (
                    <button
                      onClick={() => handleResolveStolen(st.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#3DD68C]/20 hover:bg-[#3DD68C]/30 text-[#3DD68C] border border-[#3DD68C]/40 text-xs font-semibold transition-all cursor-pointer"
                    >
                      ثبت کشف قطعه و رفع هشدار
                    </button>
                  ) : (
                    <span className="text-[10px] text-[#8E8EA0]">
                      رفع هشدار در: {st.resolvedAtFa}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Retailer POS Assistant */}
      {activeTab === 'retailer_pos' && (
        <div className="p-6 rounded-3xl bg-[#171722] border border-[#2B2B3E] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#252536]">
            <div>
              <h3 className="font-black text-sm md:text-base text-[#EDEDED] flex items-center gap-2">
                <Store className="w-5 h-5 text-[#C8A951]" />
                <span>دستیار صدور آنی شناسنامه و سند در کیوسک طلافروشی (Retailer POS)</span>
              </h3>
              <p className="text-xs text-[#8E8EA0] mt-0.5">
                مخصوص فروشندگان طلا: پس از وزن‌کشی و پرداخت وجه، سند مالکیت به همراه پیامک فعال‌سازی گارانتی در کمتر از ۲۰ ثانیه صادر می‌شود.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#12121A] border border-[#262638] space-y-2">
              <span className="w-7 h-7 rounded-xl bg-[#C8A951]/20 text-[#E5C365] font-bold text-xs flex items-center justify-center">۱</span>
              <h4 className="font-bold text-xs text-[#EDEDED]">اسکن بارکد / UID جعبه</h4>
              <p className="text-[11px] text-[#8E8EA0] leading-relaxed">
                بارکد روی تگ قطعه طلا را اسکن کنید تا مشخصات آزمایشگاه ری‌گیری، عیار ۱۸ و وزن کارخانه فوراً فراخوانی شود.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#12121A] border border-[#262638] space-y-2">
              <span className="w-7 h-7 rounded-xl bg-[#C8A951]/20 text-[#E5C365] font-bold text-xs flex items-center justify-center">۲</span>
              <h4 className="font-bold text-xs text-[#EDEDED]">ورود کد ملی و موبایل مشتری</h4>
              <p className="text-[11px] text-[#8E8EA0] leading-relaxed">
                کد ملی خریدار با سامانه شاهکار تطبیق یافته و سند به نام ایشان ثبت و در دفتر کل قفل می‌گردد.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#12121A] border border-[#262638] space-y-2">
              <span className="w-7 h-7 rounded-xl bg-[#3DD68C]/20 text-[#3DD68C] font-bold text-xs flex items-center justify-center">۳</span>
              <h4 className="font-bold text-xs text-[#EDEDED]">چاپ سند و ارسال پیامک</h4>
              <p className="text-[11px] text-[#8E8EA0] leading-relaxed">
                کارت طلایی گارانتی ۲۴ ماهه و لینک دسترسی به سند مالکیت دیجیتال بلافاصله برای خریدار ارسال می‌شود.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#211E15] to-[#171722] border border-[#C8A951]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <h4 className="font-bold text-xs text-[#F3E7C4]">آماده صدور سند برای خریدار در فروشگاه هستید؟</h4>
              <p className="text-[11px] text-[#8E8EA0]">
                برای شروع فرم ثبت سریع، کلید روبرو را لمس نمایید.
              </p>
            </div>

            <button
              onClick={() => {
                setPrefilledClaimUid('');
                setPrefilledClaimTitle('');
                setPrefilledClaimWeight(0);
                setIsNewClaimModalOpen(true);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#C8A951] hover:bg-[#D4B763] text-[#141416] text-xs font-bold transition-all cursor-pointer shadow-lg shadow-[#C8A951]/20"
            >
              شروع صدور سند خریدار
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      <DigitalDeedModal
        isOpen={isDeedModalOpen}
        onClose={() => setIsDeedModalOpen(false)}
        claim={selectedClaimForDeed}
        warranty={data?.warranties.find(w => w.itemUid === selectedClaimForDeed?.itemSpec.uid)}
        onInitiateTransfer={(claim) => {
          setSelectedClaimForTransfer(claim);
          setIsTransferModalOpen(true);
        }}
        onReportStolen={(claim) => {
          setStolenTargetUid(claim.itemSpec.uid);
          setDefaultReporterName(claim.consumer.fullNameFa);
          setDefaultReporterMobile(claim.consumer.mobile);
          setIsStolenModalOpen(true);
        }}
      />

      <NewClaimModal
        isOpen={isNewClaimModalOpen}
        onClose={() => setIsNewClaimModalOpen(false)}
        prefilledUid={prefilledClaimUid}
        prefilledTitle={prefilledClaimTitle}
        prefilledWeight={prefilledClaimWeight}
        onSuccess={(claim, warranty, msg) => {
          showToast(msg, 'success');
          loadData();
          setSelectedClaimForDeed(claim);
          setIsDeedModalOpen(true);
        }}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        claim={selectedClaimForTransfer}
        onSuccess={(updatedClaim, msg) => {
          showToast(msg, 'success');
          loadData();
          setSelectedClaimForDeed(updatedClaim);
          setIsDeedModalOpen(true);
        }}
      />

      <StolenReportModal
        isOpen={isStolenModalOpen}
        onClose={() => setIsStolenModalOpen(false)}
        itemUid={stolenTargetUid}
        defaultReporterName={defaultReporterName}
        defaultReporterMobile={defaultReporterMobile}
        onSuccess={(report, msg) => {
          showToast(msg, 'success');
          loadData();
        }}
      />

      <WarrantyServiceModal
        isOpen={isWarrantyServiceModalOpen}
        onClose={() => setIsWarrantyServiceModalOpen(false)}
        warranty={selectedWarrantyForService}
        onSuccess={(serviceLog, msg) => {
          showToast(msg, 'success');
          loadData();
        }}
      />

    </div>
  );
};
