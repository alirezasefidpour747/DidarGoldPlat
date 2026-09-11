/**
 * Didar Gold Platform - Kernel Domain K09
 * Transfer Arrival & Physical Dual-Reconciliation Modal
 */

import React, { useState } from 'react';
import { StockTransfer } from '../../types/k09.js';
import { X, CheckCircle2, AlertTriangle, Scale, ShieldCheck } from 'lucide-react';

interface TransferArrivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: StockTransfer | null;
  onConfirm: (
    transferId: string,
    measuredWeightAtDestinationGrams: number,
    receiverOfficerName: string,
    notes?: string
  ) => Promise<void>;
}

export const TransferArrivalModal: React.FC<TransferArrivalModalProps> = ({
  isOpen,
  onClose,
  transfer,
  onConfirm
}) => {
  const [measuredWeight, setMeasuredWeight] = useState<number>(0);
  const [receiverOfficerName, setReceiverOfficerName] = useState('امین تحویل‌گیرنده مقصد (مهدی رضوانی)');
  const [notes, setNotes] = useState('پلمپ امنیتی سالم بود و قطعات طلا با بارکدخوان تطبیق داده شدند.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (transfer) {
      setMeasuredWeight(Number(transfer.totalWeightGrams || 0));
    }
  }, [transfer]);

  if (!isOpen || !transfer) return null;

  const expectedWeight = Number(transfer.totalWeightGrams || 0);
  const delta = Number(((measuredWeight || 0) - expectedWeight).toFixed(3));
  const hasDiscrepancy = Math.abs(delta) > 0.05;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (measuredWeight <= 0) {
      setError('وزن سنجش شده باید عددی مثبت و معتبر باشد.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(transfer.id, measuredWeight, receiverOfficerName, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت تحویل محموله');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#181822] border border-[#2D2D3D] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D2D3D] bg-[#14141C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3DD68C]/15 border border-[#3DD68C]/30 flex items-center justify-center text-[#3DD68C]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">تأیید وصول فیزیکی و تطبیق گرمی</h2>
              <p className="text-xs text-[#9E9EA8]">شماره حواله: {transfer.transferNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#767688] hover:text-white hover:bg-[#252533] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          {/* Transfer Details Card */}
          <div className="p-4 rounded-xl bg-[#12121A] border border-[#242434] space-y-2">
            <div className="flex justify-between">
              <span className="text-[#9E9EA8]">مبدأ ارسال:</span>
              <span className="text-[#EDEDED] font-medium">{transfer.sourceLocationNameFa}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9EA8]">مقصد تحویل:</span>
              <span className="text-[#EDEDED] font-medium">{transfer.destinationLocationNameFa}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9EA8]">وزن اسنادی در مبدأ:</span>
              <span className="text-[#C8A951] font-bold font-mono">{transfer.totalWeightGrams.toLocaleString('fa-IR')} گرم</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9EA8]">تعداد قطعات:</span>
              <span className="text-[#EDEDED] font-mono">{transfer.itemsCount} عدد</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9E9EA8]">پلمپ امنیتی:</span>
              <span className="text-sky-400 font-mono">{transfer.securitySealSerial}</span>
            </div>
          </div>

          {/* Scale Weighing at Destination */}
          <div className="p-4 rounded-xl bg-[#12121A] border border-[#242434] space-y-3">
            <label className="block text-[#EDEDED] font-bold flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#C8A951]" />
              وزن قرائت‌شده روی ترازوی کالیبره مقصد (گرم):
            </label>
            <input
              type="number"
              step="0.001"
              value={measuredWeight}
              onChange={(e) => setMeasuredWeight(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#1A1A26] border border-[#2C2C3E] rounded-xl text-lg font-bold font-mono text-center text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
            />

            {/* Discrepancy indicator */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              delta === 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : hasDiscrepancy
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-2">
                {delta === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>انحراف وزنی مقصد با مبدأ:</span>
              </div>
              <span className="font-bold font-mono text-sm">
                {delta > 0 ? `+${delta}` : delta} گرم
              </span>
            </div>
          </div>

          {/* Receiver Info */}
          <div>
            <label className="block text-[#B5B5C2] mb-1 font-medium">نام و سمت مسئول تحویل‌گیرنده در مقصد</label>
            <input
              type="text"
              value={receiverOfficerName}
              onChange={(e) => setReceiverOfficerName(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#B5B5C2] mb-1 font-medium">توضیحات و صورت‌جلسه فک پلمپ</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#252533]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-[#20202C] hover:bg-[#2A2A3A] text-[#EDEDED] font-medium transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#3DD68C] hover:bg-[#4DE69C] text-[#14141A] font-bold transition shadow-lg flex items-center gap-2"
            >
              {submitting ? 'در حال ثبت وصول...' : 'تأیید وصول قطعی و ورود به موجودی مقصد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
