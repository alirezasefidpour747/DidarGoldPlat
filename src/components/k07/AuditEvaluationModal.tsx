/**
 * Didar Gold Platform - Domain K07
 * Quality Audit & Workshop Evaluation Modal
 */

import React, { useState } from 'react';
import { X, Award, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SupplierPartnership, QualityAuditRecord } from '../../types/k07.js';

interface AuditEvaluationModalProps {
  isOpen: boolean;
  suppliers: SupplierPartnership[];
  preselectedSupplierId?: string;
  onClose: () => void;
  onSave: (payload: Partial<QualityAuditRecord>) => Promise<void>;
}

export const AuditEvaluationModal: React.FC<AuditEvaluationModalProps> = ({
  isOpen,
  suppliers,
  preselectedSupplierId,
  onClose,
  onSave
}) => {
  const [supplierId, setSupplierId] = useState(preselectedSupplierId || (suppliers[0]?.id ?? ''));
  const [score, setScore] = useState(95);
  const [auditDateFa, setAuditDateFa] = useState('۱۴۰۵/۰۱/۲۰');
  const [auditorName, setAuditorName] = useState('مهندس کوروش رادمنش (سرارزیاب کیفی طلا)');
  const [findingsFa, setFindingsFa] = useState(
    'عیارسنجی ری‌گیری رسمی ۷۵۰.۳ منطبق با استاندارد ملی. تخلخل ریخته‌گری در سطح صفر و خطوط تراش کاملاً آینه‌ای و بدون پلیسه.'
  );
  const [recommendationsFa, setRecommendationsFa] = useState(
    'افزایش سهمیه طلای امانی به دلیل کیفیت بی‌نقص و پایداری در تلورانس وزنی مصنوعات.'
  );
  const [nextAuditDateFa, setNextAuditDateFa] = useState('۱۴۰۵/۰۷/۲۰');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === supplierId);
    if (!sup) {
      setError('لطفاً کارگاه مورد نظر را انتخاب فرمایید.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSave({
        supplierId: sup.id,
        supplierNameFa: sup.nameFa,
        score: Number(score),
        auditDateFa: auditDateFa.trim(),
        auditorName: auditorName.trim(),
        findingsFa: findingsFa.trim(),
        recommendationsFa: recommendationsFa.trim(),
        nextAuditDateFa: nextAuditDateFa.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت ممیزی کیفی.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181822] border border-[#2B2B3C] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-[#262636] bg-[#14141E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C8A951]/20 text-[#E5C365] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ثبت ممیزی فنی و ارزیابی کیفیت ساخت کارگاه</h3>
              <p className="text-[11px] text-[#8E8E9F]">عیارسنجی، آزمون تخلخل ریخته‌گری، کسر بار و امتیازدهی گرید کارگاه</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8E8E9F] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">کارگاه مورد ارزیابی *</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameFa} ({s.supplierCode} - رتبه فعلی: {s.kpi.overallRating} از ۱۰۰)
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-[#12121A] border border-[#262636] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8E8E9F]">امتیاز کل کیفیت ساخت و تعهدات:</span>
              <span
                className={`text-lg font-bold font-mono px-3 py-0.5 rounded-lg ${
                  score >= 95
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : score >= 90
                    ? 'bg-[#C8A951]/20 text-[#E5C365]'
                    : score >= 80
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {score} از ۱۰۰
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-[#C8A951] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#6E6E82]">
              <span>رد صلاحیت (زیر ۸۰)</span>
              <span>استاندارد B (۸۰ تا ۸۹)</span>
              <span>ممتاز A (۹۰ تا ۹۴)</span>
              <span>تراز اول A+ (۹۵+)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">نام سرارزیاب / کارشناس بازرسی</label>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">تاریخ انجام ممیزی</label>
              <input
                type="text"
                value={auditDateFa}
                onChange={(e) => setAuditDateFa(e.target.value)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">مشاهدات فنی و یافته‌های آزمایشگاهی *</label>
            <textarea
              rows={3}
              value={findingsFa}
              onChange={(e) => setFindingsFa(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">توصیه‌ها و الزامات بهبود</label>
              <input
                type="text"
                value={recommendationsFa}
                onChange={(e) => setRecommendationsFa(e.target.value)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">تاریخ ممیزی بعدی</label>
              <input
                type="text"
                value={nextAuditDateFa}
                onChange={(e) => setNextAuditDateFa(e.target.value)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262636]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#8E8E9F] hover:text-white bg-transparent rounded-xl"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-xs font-bold text-[#141416] bg-[#C8A951] hover:bg-[#D9B961] disabled:opacity-50 rounded-xl transition-all shadow-lg shadow-[#C8A951]/20"
            >
              {submitting ? 'در حال ثبت...' : 'ثبت قطعی ممیزی و اعمال رتبه‌بندی'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
