/**
 * Didar Gold Platform - Kernel Domain K11
 * Tier & Commercial Terms Adjustment Modal (تنظیم رتبه تجاری و سقف‌های اعتباری)
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  ShieldCheck,
  Percent,
  Coins,
  Scale,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Retailer, CommercialTier } from '../../types/k11.js';

interface TierAdjustmentModalProps {
  isOpen: boolean;
  retailer: Retailer | null;
  onClose: () => void;
  onSubmit: (
    retailerId: string,
    tierUpdates: {
      tier: CommercialTier;
      trustScore: number;
      creditLimitToman: number;
      creditLimitGoldGrams: number;
      wageDiscountPercent: number;
      paymentTenorDays: 0 | 7 | 15 | 30 | 45 | 60;
      allowPostDatedCheque: boolean;
      allowScrapGoldBarter: boolean;
      guaranteeDocReference?: string;
      notesFa?: string;
    }
  ) => Promise<void>;
}

export const TierAdjustmentModal: React.FC<TierAdjustmentModalProps> = ({
  isOpen,
  retailer,
  onClose,
  onSubmit
}) => {
  const [tier, setTier] = useState<CommercialTier>('gold');
  const [trustScore, setTrustScore] = useState(85);
  const [creditLimitToman, setCreditLimitToman] = useState(3000000000);
  const [creditLimitGoldGrams, setCreditLimitGoldGrams] = useState(350);
  const [wageDiscountPercent, setWageDiscountPercent] = useState(1.5);
  const [paymentTenorDays, setPaymentTenorDays] = useState<0 | 7 | 15 | 30 | 45 | 60>(30);
  const [allowPostDatedCheque, setAllowPostDatedCheque] = useState(true);
  const [allowScrapGoldBarter, setAllowScrapGoldBarter] = useState(true);
  const [guaranteeDocReference, setGuaranteeDocReference] = useState('');
  const [justificationNotesFa, setJustificationNotesFa] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (retailer) {
      setTier(retailer.commercialTerms.tier);
      setTrustScore(retailer.commercialTerms.trustScore);
      setCreditLimitToman(retailer.commercialTerms.creditLimitToman);
      setCreditLimitGoldGrams(retailer.commercialTerms.creditLimitGoldGrams);
      setWageDiscountPercent(retailer.commercialTerms.wageDiscountPercent);
      setPaymentTenorDays(retailer.commercialTerms.paymentTenorDays);
      setAllowPostDatedCheque(retailer.commercialTerms.allowPostDatedCheque);
      setAllowScrapGoldBarter(retailer.commercialTerms.allowScrapGoldBarter);
      setGuaranteeDocReference(retailer.commercialTerms.guaranteeDocReference || '');
      setJustificationNotesFa('');
    }
  }, [retailer]);

  if (!isOpen || !retailer) return null;

  // Preset recommendations based on tier
  const handleTierChange = (newTier: CommercialTier) => {
    setTier(newTier);
    if (newTier === 'diamond') {
      setTrustScore(98);
      setWageDiscountPercent(3.0);
      setCreditLimitToman(12000000000);
      setCreditLimitGoldGrams(1500);
      setPaymentTenorDays(45);
      setAllowPostDatedCheque(true);
      setAllowScrapGoldBarter(true);
    } else if (newTier === 'platinum') {
      setTrustScore(92);
      setWageDiscountPercent(2.0);
      setCreditLimitToman(6000000000);
      setCreditLimitGoldGrams(750);
      setPaymentTenorDays(30);
      setAllowPostDatedCheque(true);
      setAllowScrapGoldBarter(true);
    } else if (newTier === 'gold') {
      setTrustScore(85);
      setWageDiscountPercent(1.2);
      setCreditLimitToman(3500000000);
      setCreditLimitGoldGrams(400);
      setPaymentTenorDays(30);
      setAllowPostDatedCheque(true);
      setAllowScrapGoldBarter(true);
    } else if (newTier === 'silver') {
      setTrustScore(78);
      setWageDiscountPercent(0.5);
      setCreditLimitToman(1500000000);
      setCreditLimitGoldGrams(150);
      setPaymentTenorDays(15);
      setAllowPostDatedCheque(false);
      setAllowScrapGoldBarter(true);
    } else {
      setTrustScore(70);
      setWageDiscountPercent(0);
      setCreditLimitToman(300000000);
      setCreditLimitGoldGrams(30);
      setPaymentTenorDays(0);
      setAllowPostDatedCheque(false);
      setAllowScrapGoldBarter(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificationNotesFa.trim()) {
      setErrorMessage('لطفاً دلیل و مصوبه کمیته اعتبارات برای تغییر رتبه/حدود تجاری را قید کنید.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      await onSubmit(retailer.id, {
        tier,
        trustScore: Number(trustScore),
        creditLimitToman: Number(creditLimitToman),
        creditLimitGoldGrams: Number(creditLimitGoldGrams),
        wageDiscountPercent: Number(wageDiscountPercent),
        paymentTenorDays,
        allowPostDatedCheque,
        allowScrapGoldBarter,
        guaranteeDocReference,
        notesFa: justificationNotesFa
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در اعمال تغییرات رتبه اعتباری');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#18181F] border border-[#2B2B38] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2B38] bg-[#1F1F2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A951]/10 border border-[#C8A951]/30 flex items-center justify-center text-[#E5C365]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#EDEDED]">تنظیم رتبه تجاری و حدود اعتباری</h3>
              <p className="text-xs text-[#8E8E93]">{retailer.tradeNameFa} ({retailer.code})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#8E8E93] hover:text-[#EDEDED] hover:bg-[#2B2B38] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 flex items-center gap-2 text-xs text-[#E5484D]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Current vs New Tier Selectors */}
          <div className="p-4 rounded-xl bg-[#121217] border border-[#2B2B38] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8E8E93]">رتبه تجاری هدف:</span>
              <span className="text-xs text-[#C8A951] font-mono">فعلی: {retailer.commercialTerms.tierFa}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(['diamond', 'platinum', 'gold', 'silver', 'bronze'] as CommercialTier[]).map((t) => {
                const labels: Record<CommercialTier, string> = {
                  diamond: 'الماس',
                  platinum: 'پلاتین',
                  gold: 'طلایی',
                  silver: 'نقره‌ای',
                  bronze: 'برنزی'
                };
                const isSelected = tier === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTierChange(t)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#E5C365]'
                        : 'bg-[#18181F] border-[#2B2B38] text-[#8E8E93] hover:border-[#3E3E4E]'
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Limits & Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5 flex items-center justify-between">
                <span>امتیاز اعتماد اعتباری (Trust Score)</span>
                <span className="text-[#C8A951] font-mono">{trustScore}/100</span>
              </label>
              <input
                type="range"
                min="30"
                max="100"
                value={trustScore}
                onChange={(e) => setTrustScore(Number(e.target.value))}
                className="w-full accent-[#C8A951] bg-[#2B2B38] h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                تخفیف اجرت ساخت نسبت به بنکداری (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={wageDiscountPercent}
                  onChange={(e) => setWageDiscountPercent(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
                />
                <Percent className="w-4 h-4 text-[#8E8E93] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                سقف اعتبار ریالی (تومان)
              </label>
              <input
                type="number"
                step="100000000"
                value={creditLimitToman}
                onChange={(e) => setCreditLimitToman(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors font-mono"
              />
              <p className="text-[11px] text-[#8E8E93] mt-1">
                {(creditLimitToman / 10000000).toLocaleString('fa-IR')} میلیون تومان
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                سقف اعتبار وزنی (معادل گرم طلای ۱۸ عیار)
              </label>
              <input
                type="number"
                step="10"
                value={creditLimitGoldGrams}
                onChange={(e) => setCreditLimitGoldGrams(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors font-mono"
              />
              <p className="text-[11px] text-[#8E8E93] mt-1">
                {creditLimitGoldGrams.toLocaleString('fa-IR')} گرم طلای ۷۵۰
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                مهلت تسویه حساب (روز)
              </label>
              <select
                value={paymentTenorDays}
                onChange={(e) => setPaymentTenorDays(Number(e.target.value) as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
              >
                <option value={0}>تسویه نقدی فوری در محل تحویل (۰ روز)</option>
                <option value={7}>مهلت ۷ روزه</option>
                <option value={15}>مهلت ۱۵ روزه</option>
                <option value={30}>مهلت ۳۰ روزه (استاندارد صنف)</option>
                <option value={45}>مهلت ۴۵ روزه (ویژه رتبه پلاتین و الماس)</option>
                <option value={60}>مهلت ۶۰ روزه (استثنایی)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                شناسه ضمانت‌نامه / وثیقه ملکی یا چک
              </label>
              <input
                type="text"
                value={guaranteeDocReference}
                onChange={(e) => setGuaranteeDocReference(e.target.value)}
                placeholder="شماره چک صیادی یا سند ثبتی"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Payment Terms Checkboxes */}
          <div className="flex flex-wrap items-center gap-6 p-3 rounded-xl bg-[#121217] border border-[#2B2B38]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#EDEDED]">
              <input
                type="checkbox"
                checked={allowPostDatedCheque}
                onChange={(e) => setAllowPostDatedCheque(e.target.checked)}
                className="w-4 h-4 rounded accent-[#C8A951]"
              />
              <span>مجوز پذیرش چک صیادی موعددار</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#EDEDED]">
              <input
                type="checkbox"
                checked={allowScrapGoldBarter}
                onChange={(e) => setAllowScrapGoldBarter(e.target.checked)}
                className="w-4 h-4 rounded accent-[#C8A951]"
              />
              <span>مجوز تهاتر با طلای آبشده / متفرقه (عیار ۷۵۰)</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
              شرح توجیهی تغییر رتبه و مصوبه کمیته اعتبارات <span className="text-[#E5484D]">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={justificationNotesFa}
              onChange={(e) => setJustificationNotesFa(e.target.value)}
              placeholder="مثال: ارتقا به پلاتین به دلیل خوش‌حسابی در ۳۰ فقره سفارش و ارائه تضامین صیادی جدید..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2B2B38]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#8E8E93] hover:text-[#EDEDED] hover:bg-[#2B2B38] transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#C8A951] text-[#141416] hover:bg-[#E5C365] transition-colors flex items-center gap-2 shadow-lg shadow-[#C8A951]/10 disabled:opacity-50"
            >
              {submitting ? 'در حال ثبت تغییرات...' : 'اعمال و به‌روزرسانی حدود تجاری'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
