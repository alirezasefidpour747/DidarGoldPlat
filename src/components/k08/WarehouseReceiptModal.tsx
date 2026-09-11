/**
 * Didar Gold Platform - Domain K08: Warehouse Receipt Modal (قبض انبار رسمی دیدار)
 * Traditional Iranian gold market layout with official compliance stamps & signatures
 */

import React from 'react';
import { X, Printer, ShieldCheck, QrCode, CheckCircle2, Building2, Download } from 'lucide-react';
import { WarehouseReceipt } from '../../types/k08.js';

interface WarehouseReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: WarehouseReceipt | null;
}

export const WarehouseReceiptModal: React.FC<WarehouseReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt
}) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#181820] border border-[#2F2F3D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2A2A38] mb-4">
          <span className="text-xs font-semibold text-[#C8A951] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            قبض انبار رسمی طلای دیدار (سند ثبتی سامانه جامع تجارت و صنف طلا)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252533] hover:bg-[#303042] text-xs font-medium text-[#EDEDED] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ سند</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#888898] hover:text-[#F4F4F6] hover:bg-[#252533] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Official Receipt Layout */}
        <div className="bg-[#FDFCF7] text-[#141416] p-6 rounded-xl border border-[#DCD6C8] shadow-inner font-sans relative overflow-hidden print:p-0">
          {/* Subtle Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <span className="text-8xl font-black tracking-widest text-[#B89635]">DIDAR GOLD</span>
          </div>

          {/* Receipt Header */}
          <div className="flex items-start justify-between border-b-2 border-[#141416] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#141416] text-[#E5C365] flex items-center justify-center font-bold text-xl border border-[#C8A951]">
                دیدار
              </div>
              <div>
                <h1 className="text-base font-black text-[#141416]">پلتفرم معاملاتی و امانی شمش و مسکوکات دیدار</h1>
                <p className="text-[11px] text-[#555555]">خزانه مرکزی و انبار رسمی زیورآلات و طلای ۱۸ عیار</p>
                <p className="text-[10px] text-[#777777]">شناسه ثبتی سامانه جامع تجارت: DG-VAULT-IR-991</p>
              </div>
            </div>

            <div className="text-left font-mono text-xs">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-[10px] text-[#666666]">شماره قبض:</span>
                <strong className="text-sm font-bold text-[#141416]">{receipt.receiptNumber}</strong>
              </div>
              <div className="text-[11px] text-[#555555] mt-1">
                تاریخ صدور: {receipt.issuedAtJalali}
              </div>
              <div className="text-[10px] text-[#777777]">
                کد بارنامه: {receipt.shipmentNumber}
              </div>
            </div>
          </div>

          {/* Depositor / Supplier Info */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#F5F2E9] border border-[#E0DBCF] text-xs mb-4">
            <div>
              <span className="text-[11px] text-[#666666] block">طرف حساب / تودیع‌کننده محموله:</span>
              <strong className="text-sm font-bold text-[#141416]">{receipt.supplierNameFa}</strong>
            </div>
            <div>
              <span className="text-[11px] text-[#666666] block">نوع مالکیت / قرارداد انبارداری:</span>
              <strong className="font-bold text-[#141416]">
                {receipt.intakeType === 'consignment' ? 'قرارداد امانی سازندگی (سرمایه در گردش)' : 'تحویل قطعی شمش'}
              </strong>
            </div>
          </div>

          {/* Gold Weights & Measurements Table */}
          <div className="border border-[#141416] rounded-lg overflow-hidden mb-4">
            <table className="w-full text-xs text-right">
              <thead className="bg-[#141416] text-[#E5C365]">
                <tr>
                  <th className="p-2">شرح اقلام طلا</th>
                  <th className="p-2 text-center">تعداد (قطعه)</th>
                  <th className="p-2 text-center">عیار آزمایشگاه</th>
                  <th className="p-2 text-center">وزن ناخالص (g)</th>
                  <th className="p-2 text-center">کسر/جریمه (g)</th>
                  <th className="p-2 text-left font-bold">وزن خالص پذیرفته (g)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0DBCF]">
                <tr className="bg-white">
                  <td className="p-2 font-medium">زیورآلات و دستبند طلای ساخته‌شده بدون سنگ</td>
                  <td className="p-2 text-center font-mono">{receipt.piecesCount ?? receipt.totalPiecesReceived ?? 0}</td>
                  <td className="p-2 text-center font-mono font-bold">{receipt.acceptedFineness ?? receipt.certifiedGoldFineness ?? 750}</td>
                  <td className="p-2 text-center font-mono">{Number(receipt.netGoldWeightGrams ?? receipt.netGoldWeightGramsCredited ?? 0).toFixed(2)}</td>
                  <td className="p-2 text-center font-mono text-[#C0392B]">
                    {Number(receipt.penaltyGoldGramsDeducted || 0) > 0 ? `-${Number(receipt.penaltyGoldGramsDeducted).toFixed(3)}` : '۰.۰۰'}
                  </td>
                  <td className="p-2 text-left font-mono font-black text-sm text-[#141416]">
                    {Number(receipt.netGoldWeightGrams ?? receipt.netGoldWeightGramsCredited ?? 0).toFixed(3)} g
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Standard 750 Equivalent Banner */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#EAE5D6] border border-[#D5CDBA] mb-4">
            <div>
              <span className="text-[11px] text-[#555555]">معادل استاندارد طلای ۷۵۰ (بازار طلا و جواهر تهران):</span>
              <p className="text-base font-black font-mono text-[#141416]">
                {Number(receipt.pureGoldWeight750Equivalent ?? receipt.netGoldWeightGrams ?? 0).toFixed(3)} گرم طلای ۱۸ عیار
              </p>
            </div>

            <div className="text-left text-xs">
              <span className="text-[11px] text-[#666666] block">موقعیت استقرار در خزانه:</span>
              <strong className="text-xs font-bold text-[#141416]">{receipt.vaultLocationFa}</strong>
            </div>
          </div>

          {/* Security Hash & Signatures */}
          <div className="pt-3 border-t border-[#DCD6C8] grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2 border border-[#E0DBCF] rounded-lg bg-white flex flex-col justify-between h-24">
              <span className="text-[10px] text-[#666666]">تأیید افسر پذیرش و توزین</span>
              <div className="font-script text-xs text-[#2980B9]">مهدی کیانوش</div>
              <span className="text-[9px] text-[#888888]">مهر و امضای الکترونیک</span>
            </div>

            <div className="p-2 border border-[#E0DBCF] rounded-lg bg-white flex flex-col justify-between h-24">
              <span className="text-[10px] text-[#666666]">تأیید آزمایشگاه و عیارسنجی</span>
              <div className="font-script text-xs text-[#27AE60]">مریم حسینیان</div>
              <span className="text-[9px] text-[#888888]">تأیید طیف‌سنجی XRF</span>
            </div>

            <div className="p-2 border border-[#E0DBCF] rounded-lg bg-white flex flex-col justify-between h-24">
              <span className="text-[10px] text-[#666666]">مدیر کل خزانه و حراست</span>
              <div className="font-script text-xs text-[#8E44AD]">مرتضی اعتمادی</div>
              <span className="text-[9px] text-[#888888]">پذیرش قطعی و ثبت موجودی</span>
            </div>
          </div>

          {/* Verification Hash Footer */}
          <div className="mt-3 pt-2 border-t border-[#EAE5D6] flex items-center justify-between text-[9px] text-[#777777] font-mono">
            <span>کد هش دیجیتال سند: {receipt.securityVerificationHash}</span>
            <span>Didar Gold Custody Chain v1.0</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-[#2A2A38]">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-[#252533] hover:bg-[#303042] text-[#EDEDED] rounded-xl transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
