/**
 * Didar Gold Platform - Kernel 17 (K17)
 * Digital Deed of Ownership & Authenticity Certificate Modal
 * (سند رسمی مالکیت دیجیتال و گواهی اصالت زرین دیدار)
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  QrCode,
  Copy,
  Check,
  Printer,
  Calendar,
  UserCheck,
  Store,
  Scale,
  Hash,
  Eye,
  EyeOff,
  ExternalLink,
  Lock
} from 'lucide-react';
import { OwnershipClaim, WarrantyCard } from '../../types/k17.js';

interface DigitalDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: OwnershipClaim | null;
  warranty?: WarrantyCard;
  onInitiateTransfer?: (claim: OwnershipClaim) => void;
  onReportStolen?: (claim: OwnershipClaim) => void;
}

export const DigitalDeedModal: React.FC<DigitalDeedModalProps> = ({
  isOpen,
  onClose,
  claim,
  warranty,
  onInitiateTransfer,
  onReportStolen
}) => {
  const [copied, setCopied] = useState(false);
  const [showFullNationalId, setShowFullNationalId] = useState(false);

  if (!isOpen || !claim) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(claim.digitalDeedHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const maskedNationalId = showFullNationalId
    ? claim.consumer.nationalId
    : `${claim.consumer.nationalId.slice(0, 3)}****${claim.consumer.nationalId.slice(-3)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1C1C26] via-[#16161F] to-[#121218] border-2 border-[#C8A951]/60 rounded-3xl shadow-2xl shadow-[#C8A951]/20 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Decorative Luxury Gold Ribbon Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-[#2B2310] via-[#3D3216] to-[#2B2310] border-b border-[#C8A951]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C8A951] to-[#997B2C] p-0.5 shadow-lg shadow-[#C8A951]/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#1A1813] rounded-[14px] flex items-center justify-center">
                <Award className="w-6 h-6 text-[#E5C365]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#F3E7C4] tracking-wide">
                  سند رسمی مالکیت دیجیتال و اصالت طلا
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3DD68C]/20 text-[#3DD68C] border border-[#3DD68C]/40 font-bold">
                  تأیید رسمی شبکه دیدار
                </span>
              </div>
              <p className="text-[11px] text-[#C8A951]/80 font-mono mt-0.5">
                DIDAR GOLD DIGITAL DEED OF OWNERSHIP & METALLURGICAL PASSPORT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#242432] text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#323246] transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
          
          {/* Top Holographic Identification Banner */}
          <div className="p-4 rounded-2xl bg-[#20202C]/70 border border-[#C8A951]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-[11px] text-[#8E8EA0] block">شماره یکتای سند در دفتر کل دیجیتال:</span>
              <span className="font-mono text-sm font-bold text-[#E5C365] tracking-wider">
                {claim.claimNumber}
              </span>
            </div>
            <div className="h-8 w-[1px] bg-[#2E2E40] hidden sm:block" />
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-[11px] text-[#8E8EA0] block">تاریخ ثبت و اعتبارسنجی:</span>
              <span className="text-xs font-semibold text-[#EDEDED]">
                {claim.claimDateFa}
              </span>
            </div>
            <div className="h-8 w-[1px] bg-[#2E2E40] hidden sm:block" />
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-[11px] text-[#8E8EA0] block">روش احراز هویت:</span>
              <span className="text-[11px] font-medium text-[#3DD68C] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {claim.verificationMethodFa}
              </span>
            </div>
          </div>

          {/* Section 1: Item Physical & Metallurgical Specifications */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5 pb-1 border-b border-[#282838]">
              <Scale className="w-3.5 h-3.5" />
              <span>مشخصات گوهرشناسی و ری‌گیری قطعه فیزیکی طلا</span>
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-[#171720] border border-[#2B2B3C]">
                <span className="text-[10px] text-[#8E8EA0] block">عنوان محصول:</span>
                <span className="font-semibold text-xs text-[#EDEDED] line-clamp-1 mt-0.5">
                  {claim.itemSpec.productTitleFa}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#171720] border border-[#2B2B3C]">
                <span className="text-[10px] text-[#8E8EA0] block">عیار رسمی (ری‌گیری):</span>
                <span className="font-bold text-xs text-[#E5C365] mt-0.5 block">
                  {claim.itemSpec.caratFa} ({claim.itemSpec.certifiedFineness}‰)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#171720] border border-[#2B2B3C]">
                <span className="text-[10px] text-[#8E8EA0] block">وزن دقیق آزموده (گرم):</span>
                <span className="font-mono font-bold text-xs text-[#3DD68C] mt-0.5 block">
                  {claim.itemSpec.actualScaleWeightGrams.toFixed(3)} گرم
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#171720] border border-[#2B2B3C]">
                <span className="text-[10px] text-[#8E8EA0] block">کد انگ رسمی اتحادیه:</span>
                <span className="font-mono font-bold text-xs text-[#EDEDED] mt-0.5 block">
                  {claim.itemSpec.hallmarkCode}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#171720] border border-[#2B2B3C] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div>
                <span className="text-[#8E8EA0]">شناسه یکتای قطعه (UID): </span>
                <span className="font-mono font-bold text-[#E5C365]">{claim.itemSpec.uid}</span>
              </div>
              <div>
                <span className="text-[#8E8EA0]">حکاکی لیزری امنیتی: </span>
                <span className="font-mono text-[#EDEDED]">{claim.itemSpec.laserInscriptionText}</span>
              </div>
              <div>
                <span className="text-[#8E8EA0]">آزمایشگاه: </span>
                <span className="text-[#EDEDED]">{claim.itemSpec.assayLabName}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Owner Information & Retailer Proof */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Owner Box */}
            <div className="p-4 rounded-2xl bg-[#1A1A24] border border-[#2F2F42] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#282838]">
                <span className="font-bold text-xs text-[#EDEDED] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#3DD68C]" />
                  <span>مشخصات مالک قانونی</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#3DD68C]/10 text-[#3DD68C]">
                  احراز هویت شده
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8E8EA0]">نام و نام خانوادگی:</span>
                  <span className="font-bold text-[#EDEDED]">{claim.consumer.fullNameFa}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8E8EA0]">کد ملی:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[#EDEDED]">{maskedNationalId}</span>
                    <button
                      onClick={() => setShowFullNationalId(!showFullNationalId)}
                      className="text-[#8E8EA0] hover:text-[#C8A951]"
                      title="نمایش / مخفی‌سازی"
                    >
                      {showFullNationalId ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8EA0]">شماره تلفن همراه:</span>
                  <span className="font-mono text-[#EDEDED]">{claim.consumer.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8EA0]">شهر محل سکونت:</span>
                  <span className="text-[#EDEDED]">{claim.consumer.cityFa}</span>
                </div>
              </div>
            </div>

            {/* Retailer Proof Box */}
            <div className="p-4 rounded-2xl bg-[#1A1A24] border border-[#2F2F42] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#282838]">
                <span className="font-bold text-xs text-[#EDEDED] flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[#C8A951]" />
                  <span>مبدأ خرید و فاکتور فروشگاه</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#C8A951]/10 text-[#E5C365]">
                  پروانه اتحادیه: {claim.retailerProof.guildPermitNo}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8E8EA0]">فروشگاه / گالری:</span>
                  <span className="font-semibold text-[#EDEDED]">{claim.retailerProof.retailerNameFa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8EA0]">شماره فاکتور فروش:</span>
                  <span className="font-mono text-[#E5C365]">{claim.retailerProof.salesInvoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8EA0]">مبلغ پرداختی:</span>
                  <span className="font-bold text-[#EDEDED]">
                    {claim.retailerProof.purchasePriceToman.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8EA0]">مسئول صدور:</span>
                  <span className="text-[#EDEDED]">{claim.retailerProof.sellerOfficerNameFa}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 3: Warranty Coverage Overview */}
          {warranty && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1E1B15] to-[#161622] border border-[#C8A951]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C8A951]" />
                  <span className="font-bold text-xs text-[#F3E7C4]">
                    کارت گارانتی طلایی دیدار ({warranty.warrantyNumber})
                  </span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40 font-bold">
                  {warranty.durationMonths} ماه اعتبار تا {warranty.expirationDateFa}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {warranty.coverages.map((cov, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#14141C] border border-[#2B2B3C] text-[11px]">
                    <span className="font-bold text-[#E5C365] block mb-0.5">{cov.titleFa}</span>
                    <span className="text-[#8E8EA0] text-[10px] line-clamp-2">{cov.descriptionFa}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Cryptographic Hash & QR Provenance */}
          <div className="p-3.5 rounded-2xl bg-[#12121A] border border-[#252535] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-[#1E1E2C] border border-[#3A3A4E] flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6 text-[#C8A951]" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] text-[#8E8EA0] block">هش رمزنگاری‌شده اثبات مالکیت (SHA-256 Ledger):</span>
                <span className="font-mono text-[10px] text-[#8E8EA0] truncate block max-w-[340px]">
                  {claim.digitalDeedHash}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] text-[#C8A951] transition-all cursor-pointer text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#3DD68C]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'کپی شد' : 'کپی هش'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#14141D] border-t border-[#262634] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#20202D] hover:bg-[#2A2A3C] text-[#EDEDED] border border-[#333346] text-xs font-medium transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#C8A951]" />
              <span>چاپ رسمی سند</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {claim.status !== 'stolen_locked' && onInitiateTransfer && (
              <button
                onClick={() => {
                  onClose();
                  onInitiateTransfer(claim);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C8A951]/20 hover:bg-[#C8A951]/30 text-[#E5C365] border border-[#C8A951]/40 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>انتقال مالکیت به دیگری</span>
              </button>
            )}

            {claim.status !== 'stolen_locked' && onReportStolen && (
              <button
                onClick={() => {
                  onClose();
                  onReportStolen(claim);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E5484D]/20 hover:bg-[#E5484D]/30 text-[#FF8B8B] border border-[#E5484D]/40 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>اعلام سرقت / مفقودی</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#C8A951] text-[#141416] hover:bg-[#D4B763] text-xs font-bold transition-all cursor-pointer"
            >
              بستن پنجره
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
