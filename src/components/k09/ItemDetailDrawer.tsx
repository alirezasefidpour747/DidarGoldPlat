/**
 * Didar Gold Platform - Kernel Domain K09
 * Physical Inventory Item Detail Drawer & Passport Link
 */

import React from 'react';
import { InventoryItem } from '../../types/k09.js';
import { X, Sparkles, QrCode, Shield, MapPin, Scale, ExternalLink } from 'lucide-react';

interface ItemDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export const ItemDetailDrawer: React.FC<ItemDetailDrawerProps> = ({
  isOpen,
  onClose,
  item
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-[#181822] border-r border-[#2D2D3D] shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D2D3D] bg-[#14141C]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C8A951]/15 border border-[#C8A951]/30 flex items-center justify-center text-[#C8A951]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">شناسنامه فیزیکی قطعه طلا</h3>
                <p className="text-xs text-[#C8A951] font-mono">{item.uid}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#767688] hover:text-white hover:bg-[#252533] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5 text-xs">
            {/* Title & Category */}
            <div className="p-4 rounded-xl bg-[#12121A] border border-[#242434] space-y-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#C8A951]/20 text-[#C8A951] font-bold">
                {item.categoryFa}
              </span>
              <h4 className="text-sm font-bold text-[#EDEDED]">{item.titleFa}</h4>
              <div className="flex items-center justify-between text-[#9E9EA8] pt-2 border-t border-[#1F1F2C]">
                <span>کد استاندارد ری‌گیری (کد انگ):</span>
                <span className="text-amber-400 font-mono font-bold">{item.hallmarkCode}</span>
              </div>
            </div>

            {/* Weights and Purities */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#12121A] border border-[#242434] space-y-1">
                <span className="text-[#9E9EA8] flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-[#C8A951]" />
                  وزن دقیق آزمایشگاهی:
                </span>
                <p className="text-base font-bold font-mono text-[#EDEDED]">
                  {item.scaleWeightGrams} گرم
                </p>
                <span className="text-[10px] text-[#767688]">عیار: {item.karatFa}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#12121A] border border-[#242434] space-y-1">
                <span className="text-[#9E9EA8] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  معادل طلای ۹۹۵:
                </span>
                <p className="text-base font-bold font-mono text-emerald-400">
                  {item.pureGold995EquivalentGrams} گرم
                </p>
                <span className="text-[10px] text-[#767688]">
                  عیار سنجش: {item.testedFineness || item.nominalFineness}
                </span>
              </div>
            </div>

            {/* Current Custody & Location */}
            <div className="p-4 rounded-xl bg-[#12121A] border border-[#242434] space-y-3">
              <span className="font-semibold text-[#EDEDED] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-400" />
                موقعیت مکانی و امین متعهد در این لحظه
              </span>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#9E9EA8]">محل استقرار:</span>
                  <span className="text-[#EDEDED] font-medium">{item.currentLocationNameFa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9E9EA8]">وضعیت امانت:</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium">
                    {item.custodyStatusFa}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9E9EA8]">امین و نگهدارنده:</span>
                  <span className="text-[#EDEDED]">{item.custodianOfficerNameFa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9E9EA8]">تاریخ آخرین جابجایی:</span>
                  <span className="text-[#9E9EA8] font-mono">{item.lastMovedDateFa}</span>
                </div>
              </div>
            </div>

            {/* Commercial Info */}
            <div className="p-4 rounded-xl bg-[#12121A] border border-[#242434] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#9E9EA8]">تأمین‌کننده سازنده:</span>
                <span className="text-[#EDEDED] font-medium">{item.supplierNameFa}</span>
              </div>
              {item.intakeReceiptNo && (
                <div className="flex justify-between">
                  <span className="text-[#9E9EA8]">شماره قبض انبار K08:</span>
                  <span className="text-[#C8A951] font-mono">{item.intakeReceiptNo}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[#1F1F2C]">
                <span className="text-[#9E9EA8]">ارزش تخمینی روز:</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {item.estimatedValueToman.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>

            {/* QR Code and Passport Verification */}
            <div className="p-4 rounded-xl bg-[#1E1E2C] border border-[#313144] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#28283A] flex items-center justify-center text-[#C8A951]">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-[#EDEDED]">پاسپورت دیجیتال قطعه طلا</h5>
                  <p className="text-[11px] text-[#9E9EA8]">اتصال به شناسنامه دیجیتال اصالت K06</p>
                </div>
              </div>
              <a
                href={item.qrCodeScanPayload}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#C8A951] hover:bg-[#D8B961] text-[#14141A] transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2D2D3D] bg-[#14141C]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] text-[#EDEDED] font-medium transition"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
