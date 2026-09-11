/**
 * Didar Gold Platform - Domain K08: Final Acceptance Decision Modal
 * Final vault admission decision, penalty adjustments and warehouse receipt issuance
 */

import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, Scale, FileCheck } from 'lucide-react';
import { IntakeShipment, AssayToleranceStatus } from '../../types/k08.js';

interface AcceptanceDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: IntakeShipment | null;
  onConfirmDecision: (shipmentId: string, decisionData: any) => Promise<any>;
  onViewReceipt: (receiptId: string) => void;
}

export const AcceptanceDecisionModal: React.FC<AcceptanceDecisionModalProps> = ({
  isOpen,
  onClose,
  shipment,
  onConfirmDecision,
  onViewReceipt
}) => {
  const [decision, setDecision] = useState<'accepted' | 'accepted_with_tolerance' | 'rejected' | 'quarantine_hold'>(
    shipment?.toleranceStatus === AssayToleranceStatus.CONDITIONAL_TOLERANCE_FEE
      ? 'accepted_with_tolerance'
      : shipment?.toleranceStatus === AssayToleranceStatus.OUT_OF_TOLERANCE_CRITICAL
      ? 'rejected'
      : 'accepted'
  );

  const [penaltyGoldGramsDeducted, setPenaltyGoldGramsDeducted] = useState<number>(() => {
    const mWeight = Number(shipment?.measuredWeightGrams ?? shipment?.scaleTotalWeightGrams ?? 0);
    const mFineness = Number(shipment?.measuredFineness ?? shipment?.assayTest?.testedFineness ?? 750);
    if (!mWeight || !mFineness) return 0;
    if (mFineness < 750) {
      // Calculate missing pure gold
      const missing = mWeight * (1 - mFineness / 750);
      return Math.max(0, parseFloat((missing || 0).toFixed(3)));
    }
    return 0;
  });

  const [penaltyMakingChargeToman, setPenaltyMakingChargeToman] = useState<number>(0);
  const [vaultLocationFa, setVaultLocationFa] = useState('خزانه مرکزی دیدار - گاوصندوق امنیتی ردیف A-04');
  const [notes, setNotes] = useState('تأیید پذیرش و صدور قبض رسمی انبار دیدار');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !shipment) return null;

  const measuredWeight = shipment.measuredWeightGrams || shipment.declaredWeightGrams;
  const netAcceptedGold = Math.max(0, measuredWeight - penaltyGoldGramsDeducted);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      const result = await onConfirmDecision(shipment.id, {
        decision,
        notes,
        penaltyGoldGramsDeducted: decision === 'accepted_with_tolerance' ? penaltyGoldGramsDeducted : 0,
        penaltyMakingChargeToman: decision === 'accepted_with_tolerance' ? penaltyMakingChargeToman : 0,
        vaultLocationFa,
        actorName: 'مرتضی اعتمادی (مدیر خزانه و پذیرش)'
      });

      onClose();
      if (result?.receipt?.id) {
        onViewReceipt(result.receipt.id);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت تصمیم نهایی');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#181820] border border-[#2F2F3D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A2A38] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3DD68C]/15 border border-[#3DD68C]/30 flex items-center justify-center text-[#3DD68C]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F4F4F6]">تصمیم‌گیری نهایی و صدور قبض انبار رسمی</h2>
              <p className="text-xs text-[#9E9EA8]">پذیرش محموله شماره {shipment.shipmentNumber} در خزانه طلای دیدار</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888898] hover:text-[#F4F4F6] hover:bg-[#252533] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 text-xs text-[#FF8B8E] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Summary Card */}
        <div className="p-4 rounded-xl bg-[#121218] border border-[#262634] mb-5 space-y-3">
          <h3 className="text-xs font-bold text-[#C8A951]">خلاصه اندازه‌گیری آزمایشگاهی و باسکول</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[#1A1A24] border border-[#292938]">
              <span className="text-[11px] text-[#888898]">وزن اعلامی:</span>
              <p className="font-mono font-bold text-[#EDEDED] mt-0.5">
                {Number(shipment.declaredWeightGrams ?? shipment.declaredTotalWeightGrams ?? 0).toFixed(2)} g
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1A1A24] border border-[#292938]">
              <span className="text-[11px] text-[#888898]">وزن ترازوی دقیق:</span>
              <p className="font-mono font-bold text-[#3DD68C] mt-0.5">
                {Number(shipment.measuredWeightGrams ?? shipment.scaleTotalWeightGrams ?? shipment.declaredWeightGrams ?? shipment.declaredTotalWeightGrams ?? 0).toFixed(3)} g
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1A1A24] border border-[#292938]">
              <span className="text-[11px] text-[#888898]">عیار آزمون متالورژی:</span>
              <p className="font-mono font-bold text-[#E5C365] mt-0.5">
                {shipment.measuredFineness || shipment.assayTest?.testedFineness || 'در انتظار آزمون'}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#1A1A24] border border-[#292938]">
              <span className="text-[11px] text-[#888898]">وضعیت تلرانس:</span>
              <p className="font-bold text-xs mt-0.5">
                {shipment.toleranceStatus === 'within_standard_tolerance' ? (
                  <span className="text-[#3DD68C]">استاندارد</span>
                ) : shipment.toleranceStatus === 'conditional_tolerance_fee' ? (
                  <span className="text-[#E5A84B]">کسر مشروط</span>
                ) : (
                  <span className="text-[#E5484D]">بحرانی</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Decision Selection Cards */}
          <div>
            <label className="block text-xs font-semibold text-[#CECED8] mb-2">
              حکم پذیرش نهایی
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDecision('accepted')}
                className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                  decision === 'accepted'
                    ? 'bg-[#3DD68C]/10 border-[#3DD68C] text-[#EDEDED]'
                    : 'bg-[#14141B] border-[#2A2A38] text-[#9E9EA8] hover:border-[#3DD68C]/50'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${decision === 'accepted' ? 'text-[#3DD68C]' : ''}`} />
                <div>
                  <strong className="block text-xs font-bold text-[#3DD68C]">تأیید کامل (پذیرش قطعی)</strong>
                  <span className="text-[11px] leading-tight">تطابق کامل وزن و عیار بدون هیچ‌گونه جریمه یا کسر طلا</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision('accepted_with_tolerance')}
                className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                  decision === 'accepted_with_tolerance'
                    ? 'bg-[#E5A84B]/10 border-[#E5A84B] text-[#EDEDED]'
                    : 'bg-[#14141B] border-[#2A2A38] text-[#9E9EA8] hover:border-[#E5A84B]/50'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${decision === 'accepted_with_tolerance' ? 'text-[#E5A84B]' : ''}`} />
                <div>
                  <strong className="block text-xs font-bold text-[#E5A84B]">پذیرش مشروط با اعمال جریمه</strong>
                  <span className="text-[11px] leading-tight">پذیرش با کسر معادل وزنی کسر عیار از مانده حساب سازنده</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision('quarantine_hold')}
                className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                  decision === 'quarantine_hold'
                    ? 'bg-[#C8A951]/10 border-[#C8A951] text-[#EDEDED]'
                    : 'bg-[#14141B] border-[#2A2A38] text-[#9E9EA8] hover:border-[#C8A951]/50'
                }`}
              >
                <Clock className={`w-4 h-4 mt-0.5 shrink-0 ${decision === 'quarantine_hold' ? 'text-[#C8A951]' : ''}`} />
                <div>
                  <strong className="block text-xs font-bold text-[#E5C365]">توقف در قرنطینه (رفع اختلاف)</strong>
                  <span className="text-[11px] leading-tight">نگهداری در گاوصندوق قرنطینه تا آزمون مجدد مرجع یا بازرسی</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision('rejected')}
                className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                  decision === 'rejected'
                    ? 'bg-[#E5484D]/10 border-[#E5484D] text-[#EDEDED]'
                    : 'bg-[#14141B] border-[#2A2A38] text-[#9E9EA8] hover:border-[#E5484D]/50'
                }`}
              >
                <XCircle className={`w-4 h-4 mt-0.5 shrink-0 ${decision === 'rejected' ? 'text-[#E5484D]' : ''}`} />
                <div>
                  <strong className="block text-xs font-bold text-[#E5484D]">مردودی و عودت محموله</strong>
                  <span className="text-[11px] leading-tight">عودت کامل به حامل به دلیل مغایرت بحرانی یا آلیاژ غیراستاندارد</span>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Penalty Fields */}
          {decision === 'accepted_with_tolerance' && (
            <div className="p-4 rounded-xl bg-[#1D1B13] border border-[#483B1B] space-y-3">
              <h4 className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                محاسبه کسر جبرانی عیار و اجرت
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#CECED8] mb-1">
                    کسر وزنی جبرانی طلا (گرم)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={penaltyGoldGramsDeducted}
                    onChange={(e) => setPenaltyGoldGramsDeducted(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#3E341B] rounded-xl text-xs font-mono font-bold text-[#E5C365] text-left"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-[#A6A6B8]">
                    وزن نهایی پذیرفته‌شده: <strong>{Number(netAcceptedGold || 0).toFixed(3)} گرم</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] text-[#CECED8] mb-1">
                    جریمه ریالی اجرت (تومان)
                  </label>
                  <input
                    type="number"
                    value={penaltyMakingChargeToman}
                    onChange={(e) => setPenaltyMakingChargeToman(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#121218] border border-[#3E341B] rounded-xl text-xs font-mono text-[#F4F4F6] text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Destination Vault Location */}
          {(decision === 'accepted' || decision === 'accepted_with_tolerance') && (
            <div>
              <label className="block text-xs font-semibold text-[#CECED8] mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3DD68C]" />
                موقعیت استقرار فیزیکی در خزانه مرکزی
              </label>
              <input
                type="text"
                required
                value={vaultLocationFa}
                onChange={(e) => setVaultLocationFa(e.target.value)}
                className="w-full px-3 py-2 bg-[#121218] border border-[#2B2B38] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#CECED8] mb-1.5">
              توضیحات و دستور مدیر خزانه
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#121218] border border-[#2B2B38] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951] focus:outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A2A38]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-[#A6A6B8] hover:text-[#EDEDED]"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                decision === 'rejected'
                  ? 'bg-[#E5484D] text-white hover:bg-[#F2555A]'
                  : 'bg-[#C8A951] text-[#141416] hover:bg-[#D4B75F]'
              }`}
            >
              {submitting ? 'در حال صدور...' : 'ثبت تصمیم و صدور قبض رسمی انبار'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
