/**
 * Didar Gold Platform - Kernel Domain K12
 * CompleteVisitModal: Debrief and finalize field visit mission
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Star,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Store
} from 'lucide-react';
import { FieldVisit } from '../../types/k12.js';

interface CompleteVisitModalProps {
  visit: FieldVisit | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (
    visitId: string,
    outcome: {
      retailerFeedbackScore: number;
      retailerNotesFa: string;
      agentOutcomeNotesFa: string;
      showcaseInterestLevel: 'very_high' | 'high' | 'neutral' | 'low';
      carriedBagSealIntact: boolean;
    }
  ) => Promise<void>;
}

export const CompleteVisitModal: React.FC<CompleteVisitModalProps> = ({
  visit,
  isOpen,
  onClose,
  onComplete
}) => {
  const [feedbackScore, setFeedbackScore] = useState<number>(5);
  const [interestLevel, setInterestLevel] = useState<'very_high' | 'high' | 'neutral' | 'low'>('very_high');
  const [sealIntact, setSealIntact] = useState(true);
  const [retailerNotesFa, setRetailerNotesFa] = useState(
    'استقبال بسیار مناسب از مدل‌های النگوی جدید و کاتالوگ شمش سرمایه‌گذاری دیدار.'
  );
  const [agentOutcomeNotesFa, setAgentOutcomeNotesFa] = useState(
    'جلسه با حضور شخص صاحب جواز برگزار گردید. نمونه‌ها مورد بررسی قرار گرفت و رضایت کامل حاصل شد.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !visit) return null;

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!sealIntact) {
      setErrorMsg('در صورت مخدوش بودن پلمپ امنیتی، باید مراتب به حراست و پشتیبانی اعلام گردد.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onComplete(visit.id, {
        retailerFeedbackScore: feedbackScore,
        retailerNotesFa: retailerNotesFa.trim(),
        agentOutcomeNotesFa: agentOutcomeNotesFa.trim(),
        showcaseInterestLevel: interestLevel,
        carriedBagSealIntact: sealIntact
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ثبت نهایی ویزیت');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-lg bg-[#161622] text-[#EDEDED] rounded-2xl shadow-2xl border border-[#28283C] overflow-hidden text-right my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#28283C] bg-[#151520] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3DD68C] to-[#258B5C] text-[#141416] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ثبت صورتجلسه و پایان ویزیت میدانی</h2>
              <p className="text-xs text-[#A0A0B5]">
                ارزیابی رضایت طلافروش، ممیزی پلمپ کیف و تنظیم گزارش مأموریت
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A0A0B5] hover:text-white rounded-lg hover:bg-[#191926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-[#E5484D]/15 border border-[#E5484D]/30 text-[#FF6B6B] rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFinish} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Target Store Banner */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#E5C365]" />
              <span className="font-bold text-white">{visit.retailerTradeNameFa}</span>
            </div>
            <span className="text-[#A0A0B5] font-mono text-[11px]">{visit.visitCode}</span>
          </div>

          {/* Score & Interest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3 space-y-2">
              <label className="block text-xs font-semibold text-[#A0A0B5]">
                امتیاز رضایت طلافروش (۱ تا ۵):
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackScore(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= feedbackScore
                          ? 'text-[#C8A951] fill-[#C8A951]'
                          : 'text-[#44445A]'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-white mr-2 font-mono">
                  {feedbackScore} از ۵
                </span>
              </div>
            </div>

            <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3 space-y-2">
              <label className="block text-xs font-semibold text-[#A0A0B5]">
                سطح تمایل به خرید عمده:
              </label>
              <select
                value={interestLevel}
                onChange={e => setInterestLevel(e.target.value as any)}
                className="w-full p-2 bg-[#161622] rounded-lg border border-[#28283C] text-xs text-white focus:ring-1 focus:ring-[#C8A951]"
              >
                <option value="very_high">بسیار بالا (تقاضای ثبت سفارش فوری)</option>
                <option value="high">بالا (بررسی کاتالوگ جهت سفارش آتی)</option>
                <option value="neutral">متوسط (نیاز به پیگیری دوره‌ای)</option>
                <option value="low">پایین (موجودی فعلی کافی است)</option>
              </select>
            </div>
          </div>

          {/* Tamper Seal Verification Checkbox */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3.5 flex items-start gap-3 text-xs">
            <input
              type="checkbox"
              id="sealCheckbox"
              checked={sealIntact}
              onChange={e => setSealIntact(e.target.checked)}
              className="mt-0.5 accent-[#C8A951] w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="sealCheckbox" className="cursor-pointer space-y-0.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                تأیید سلامت کامل پلمپ امنیتی کیف هوشمند طلا (Smart Custody Bag)
              </span>
              <p className="text-[11px] text-[#A0A0B5]">
                گواهی می‌شود کلیه نمونه‌ها با برچسب و سریال‌های سامانه K09 بدون دخل‌وتصرف در کیف قرار دارند.
              </p>
            </label>
          </div>

          {/* Notes */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#A0A0B5] mb-1">بازخورد و اظهارات صاحب گالری:</label>
              <textarea
                rows={2}
                value={retailerNotesFa}
                onChange={e => setRetailerNotesFa(e.target.value)}
                className="w-full p-2 bg-[#191926] rounded-lg border border-[#28283C] text-white focus:ring-1 focus:ring-[#C8A951]"
              />
            </div>

            <div>
              <label className="block text-[#A0A0B5] mb-1">گزارش و یادداشت نهایی مأمور اعزامی:</label>
              <textarea
                rows={2}
                value={agentOutcomeNotesFa}
                onChange={e => setAgentOutcomeNotesFa(e.target.value)}
                className="w-full p-2 bg-[#191926] rounded-lg border border-[#28283C] text-white focus:ring-1 focus:ring-[#C8A951]"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#28283C] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#A0A0B5] hover:text-white border border-[#28283C] hover:bg-[#191926] rounded-lg transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ثبت...' : 'ثبت قطعی و خاتمه مأموریت'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
