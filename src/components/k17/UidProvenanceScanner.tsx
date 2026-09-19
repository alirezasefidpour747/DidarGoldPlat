/**
 * Didar Gold Platform - Kernel 17 (K17)
 * Interactive Live UID & Provenance Scanner
 * (اسکنر زنده شناسنامه طلا، استعلام اصالت ری‌گیری و رهگیری زنجیره تأمین)
 */

import React, { useState } from 'react';
import {
  Search,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Award,
  Sparkles,
  Scale,
  Calendar,
  Building2,
  Store,
  UserCheck,
  ArrowRightLeft,
  Lock,
  ExternalLink,
  CheckCircle2,
  Clock,
  Zap,
  Tag,
  Hash
} from 'lucide-react';
import { UidScanResult, OwnershipClaim, WarrantyCard } from '../../types/k17.js';
import { api } from '../../lib/api.js';

interface UidProvenanceScannerProps {
  onOpenClaimModal: (uid: string, title?: string, weight?: number) => void;
  onOpenDeedModal: (claim: OwnershipClaim, warranty?: WarrantyCard) => void;
  onOpenTransferModal: (claim: OwnershipClaim) => void;
  onOpenStolenModal: (uid: string, claim?: OwnershipClaim) => void;
}

export const UidProvenanceScanner: React.FC<UidProvenanceScannerProps> = ({
  onOpenClaimModal,
  onOpenDeedModal,
  onOpenTransferModal,
  onOpenStolenModal
}) => {
  const [query, setQuery] = useState('DID-AU750-2026-8820-001');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<UidScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample quick queries
  const sampleQueries = [
    { label: 'سند فعال (دستبند کارتیه)', uid: 'DID-AU750-2026-8820-001' },
    { label: 'قطعه آزاد برای ثبت (انگشتر سولیتر)', uid: 'DID-AU750-2026-7711-003' },
    { label: 'هشدار قطعه مسروقه (گردنبند تنیس)', uid: 'DID-AU750-2026-6630-005' },
    { label: 'سند فعال (گوشواره مروارید)', uid: 'DID-AU750-2026-9941-004' }
  ];

  const handleScan = async (searchTarget?: string) => {
    const target = searchTarget || query;
    if (!target.trim()) return;

    setError(null);
    setLoading(true);
    try {
      const result = await api.scanK17Uid(target.trim());
      setScanResult(result);
    } catch (err: any) {
      setError(err.message || 'خطا در استعلام شناسنامه');
      setScanResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Search & Simulated Optical Scanner Bar */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1A1A26] to-[#14141E] border border-[#2B2B3E] shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#C8A951]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="شناسه یکتای قطعه (UID)، کد انگ، سریال فاکتور یا شماره لیزر را وارد نمایید..."
              className="w-full pr-11 pl-4 py-3.5 rounded-2xl bg-[#13131B] border border-[#333346] text-[#EDEDED] text-xs md:text-sm font-mono placeholder:font-sans placeholder:text-[#68687A] focus:border-[#C8A951] focus:ring-1 focus:ring-[#C8A951] focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScan()}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#C8A951] hover:bg-[#D4B763] text-[#141416] text-xs md:text-sm font-bold shadow-lg shadow-[#C8A951]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <QrCode className="w-4 h-4" />
              <span>{loading ? 'در حال استعلام...' : 'استعلام اصالت شناسنامه'}</span>
            </button>
          </div>

        </div>

        {/* Quick Sample Query Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#8E8EA0] text-[11px]">نمونه‌های آماده تست شبکه:</span>
          {sampleQueries.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(s.uid);
                handleScan(s.uid);
              }}
              className="px-2.5 py-1 rounded-xl bg-[#20202E] hover:bg-[#2A2A3E] text-[#B5B5C4] hover:text-[#EDEDED] border border-[#2E2E42] text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Tag className="w-3 h-3 text-[#C8A951]" />
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#E5484D]/10 border border-[#E5484D]/30 text-[#FF8B8B] text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Scan Result Presentation */}
      {scanResult && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Status Alert Hero */}
          {scanResult.status === 'stolen_alert' ? (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#321316] via-[#281014] to-[#1C0E10] border-2 border-[#E5484D] shadow-xl shadow-[#E5484D]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#E5484D]/20 border border-[#E5484D] flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-7 h-7 text-[#FF8B8B] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm md:text-base font-black text-[#FF8B8B]">
                      هشدار فوری امنیتی: این قطعه طلا در لیست مسروقه قرار دارد!
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5484D] text-white font-bold">
                      قفل سیستمی
                    </span>
                  </div>
                  <p className="text-xs text-[#E8A5A5] mt-0.5">
                    {scanResult.stolenReport?.policeStationFa} • شماره پرونده انتظامی: {scanResult.stolenReport?.policeCaseNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => alert(`هشدار امنیتی به مرکز مانیتورینگ حراست و پلیس برای قطعه ${scanResult.itemSpec.uid} مخابره شد.`)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#E5484D] hover:bg-[#D93D42] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  تماس با حراست و گزارش کشف
                </button>
              </div>
            </div>
          ) : scanResult.status === 'claimed' ? (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#17251E] via-[#141F1A] to-[#111815] border border-[#3DD68C]/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#3DD68C]/20 border border-[#3DD68C]/50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-7 h-7 text-[#3DD68C]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm md:text-base font-black text-[#3DD68C]">
                      اصالت زرین تأیید شد • دارای سند مالکیت معتبر دیجیتال
                    </h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#3DD68C]/20 text-[#3DD68C] font-bold border border-[#3DD68C]/40">
                      ثبت در دفتر کل
                    </span>
                  </div>
                  <p className="text-xs text-[#A8DEC2] mt-0.5">
                    مالک فعلی: {scanResult.claim?.consumer.fullNameFa} • تاریخ ثبت: {scanResult.claim?.claimDateFa}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {scanResult.claim && (
                  <button
                    onClick={() => onOpenDeedModal(scanResult.claim!, scanResult.warranty)}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C8A951] hover:bg-[#D4B763] text-[#141416] text-xs font-bold transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>مشاهده سند رسمی دیجیتال</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#211E16] via-[#1D1A14] to-[#151410] border border-[#C8A951]/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#C8A951]/20 border border-[#C8A951]/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-7 h-7 text-[#E5C365]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm md:text-base font-black text-[#F3E7C4]">
                      اصالت طلای استاندارد تأیید شد • آزاد جهت ثبت سند برای خریدار
                    </h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C8A951]/20 text-[#E5C365] font-bold border border-[#C8A951]/40">
                      ویترین طلافروشی
                    </span>
                  </div>
                  <p className="text-xs text-[#C8A951]/80 mt-0.5">
                    این قطعه در زنجیره تأمین دیدار ساخته و ری‌گیری شده و آماده صدور سند نهایی به نام مصرف‌کننده است.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onOpenClaimModal(
                    scanResult.itemSpec.uid,
                    scanResult.itemSpec.productTitleFa,
                    scanResult.itemSpec.actualScaleWeightGrams
                  )}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C8A951] hover:bg-[#D4B763] text-[#141416] text-xs font-bold transition-all cursor-pointer shadow-lg shadow-[#C8A951]/20"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>ثبت سند مالکیت به نام خریدار</span>
                </button>
              </div>
            </div>
          )}

          {/* Grid: Specifications & Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Left Col 1 & 2: Metallurgical Passport */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Product Specifications Card */}
              <div className="p-5 rounded-3xl bg-[#171722] border border-[#2B2B3E] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#252536]">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#C8A951]" />
                    <h4 className="font-bold text-xs md:text-sm text-[#EDEDED]">
                      شناسنامه ری‌گیری، عیارسنجی و مشخصات فیزیکی طلا
                    </h4>
                  </div>
                  <span className="font-mono text-xs text-[#C8A951] font-bold">
                    {scanResult.itemSpec.uid}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#1C1C29] border border-[#2C2C3E]">
                    <span className="text-[10px] text-[#8E8EA0] block">نام محصول:</span>
                    <span className="font-bold text-xs text-[#EDEDED] mt-1 block">
                      {scanResult.itemSpec.productTitleFa}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1C1C29] border border-[#2C2C3E]">
                    <span className="text-[10px] text-[#8E8EA0] block">عیار رسمی:</span>
                    <span className="font-bold text-xs text-[#E5C365] mt-1 block">
                      {scanResult.itemSpec.caratFa}
                    </span>
                    <span className="text-[10px] text-[#8E8EA0] font-mono">
                      (خلوص: {scanResult.itemSpec.certifiedFineness}‰)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1C1C29] border border-[#2C2C3E]">
                    <span className="text-[10px] text-[#8E8EA0] block">وزن ترازوی دیجیتال:</span>
                    <span className="font-bold font-mono text-xs text-[#3DD68C] mt-1 block">
                      {scanResult.itemSpec.actualScaleWeightGrams.toFixed(3)} گرم
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1C1C29] border border-[#2C2C3E]">
                    <span className="text-[10px] text-[#8E8EA0] block">کد انگ رسمی اتحادیه:</span>
                    <span className="font-bold font-mono text-xs text-[#EDEDED] mt-1 block">
                      {scanResult.itemSpec.hallmarkCode}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#14141E] border border-[#252535] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#8E8EA0] block">آزمایشگاه ری‌گیری معتمد:</span>
                    <span className="text-[#EDEDED] font-medium">{scanResult.itemSpec.assayLabName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E8EA0] block">حکاکی امنیتی لیزری:</span>
                    <span className="font-mono text-[#E5C365]">{scanResult.itemSpec.laserInscriptionText}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8E8EA0] block">روش بسته‌بندی امنیتی:</span>
                    <span className="text-[#EDEDED]">{scanResult.itemSpec.nfcSecurityTag ? 'دارای برچسب NFC ضدجعل' : 'کارت هولوگرام امنیتی'}</span>
                  </div>
                </div>

                {/* Additional Action Toolbar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#252536]">
                  <div className="flex items-center gap-2">
                    {scanResult.claim && (
                      <>
                        <button
                          onClick={() => onOpenDeedModal(scanResult.claim!, scanResult.warranty)}
                          className="px-3 py-1.5 rounded-xl bg-[#252536] hover:bg-[#323246] text-[#EDEDED] text-xs font-medium cursor-pointer"
                        >
                          مشاهده سند کامل
                        </button>
                        <button
                          onClick={() => onOpenTransferModal(scanResult.claim!)}
                          className="px-3 py-1.5 rounded-xl bg-[#C8A951]/20 hover:bg-[#C8A951]/30 text-[#E5C365] text-xs font-medium cursor-pointer"
                        >
                          انتقال سند به خریدار جدید
                        </button>
                      </>
                    )}
                  </div>

                  <div>
                    {scanResult.status !== 'stolen_alert' && (
                      <button
                        onClick={() => onOpenStolenModal(scanResult.itemSpec.uid, scanResult.claim || undefined)}
                        className="px-3 py-1.5 rounded-xl bg-[#E5484D]/20 hover:bg-[#E5484D]/30 text-[#FF8B8B] text-xs font-medium cursor-pointer"
                      >
                        اعلام سرقت این قطعه
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Warranty Details if Active */}
              {scanResult.warranty && (
                <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1C1A14] to-[#15141D] border border-[#C8A951]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#C8A951]" />
                      <h4 className="font-bold text-xs text-[#F3E7C4]">
                        کارت گارانتی طلایی دیدار ({scanResult.warranty.warrantyNumber})
                      </h4>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C8A951]/20 text-[#E5C365] font-bold border border-[#C8A951]/40">
                      {scanResult.warranty.durationMonths} ماه اعتبار تا {scanResult.warranty.expirationDateFa}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {scanResult.warranty.coverages.map((c, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-[#14141D] border border-[#2B2B3C]">
                        <span className="font-bold text-[#E5C365] block text-[11px] mb-1">{c.titleFa}</span>
                        <span className="text-[10px] text-[#8E8EA0] leading-relaxed block">{c.descriptionFa}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Col: Supply Chain Provenance Timeline */}
            <div className="p-5 rounded-3xl bg-[#171722] border border-[#2B2B3E] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#252536]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C8A951]" />
                  <h4 className="font-bold text-xs text-[#EDEDED]">
                    زنجیره رهگیری اصالت (Provenance)
                  </h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#252536] text-[#8E8EA0]">
                  {scanResult.provenanceTrail.length} رویداد
                </span>
              </div>

              <div className="space-y-4 relative pr-4">
                {/* Vertical connecting line */}
                <div className="absolute top-2 bottom-2 right-[19px] w-[2px] bg-[#2E2E42]" />

                {scanResult.provenanceTrail.map((ev, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-[#1E1E2C] border-2 border-[#C8A951] flex items-center justify-center shrink-0 z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E5C365]" />
                    </div>
                    
                    <div className="flex-1 p-3 rounded-2xl bg-[#1B1B27] border border-[#2A2A3C] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#EDEDED]">{ev.eventTitleFa}</span>
                        <span className="text-[10px] text-[#8E8EA0]">{ev.dateFa}</span>
                      </div>
                      <p className="text-[11px] text-[#8E8EA0] leading-relaxed">
                        {ev.detailsFa}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-[#C8A951]/80">
                        <span>مسئول: {ev.actorFa}</span>
                        <span className="font-mono text-[9px] text-[#6A6A7E]">ID: {ev.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
