/**
 * Didar Gold Platform - K04: New Commercial Exception Modal
 * Temporary policy waivers and operational overrides
 */

import React, { useState } from 'react';
import { ApprovalCategory } from '../../types/k04.js';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Scale,
  DollarSign,
  FileCheck2
} from 'lucide-react';

interface NewExceptionModalProps {
  onClose: () => void;
  onSubmit: (data: {
    titleFa: string;
    descriptionFa: string;
    category: ApprovalCategory;
    partyNameFa: string;
    goldWeightGrams: number;
    financialImpactIrr: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    conditions: string[];
    actorName: string;
  }) => Promise<void>;
}

export const NewExceptionModal: React.FC<NewExceptionModalProps> = ({
  onClose,
  onSubmit
}) => {
  const [titleFa, setTitleFa] = useState('مجوز موقت اضافه برداشت و تحویل شمش پیش از وصول چک صیادی');
  const [descriptionFa, setDescriptionFa] = useState('با توجه به سابقه خوش‌حسابی ۱۰ ساله بنکدار و دریافت چک ضمانت معتبر بنفش، تحویل شمش تا زمان پایاپای بلامانع است.');
  const [category, setCategory] = useState<ApprovalCategory>('credit_limit_exception');
  const [partyNameFa, setPartyNameFa] = useState('بنکداری طلای کیمیا بازار تهران');
  const [goldWeightGrams, setGoldWeightGrams] = useState<string>('1500');
  const [financialImpactIrr, setFinancialImpactIrr] = useState<string>('68000000000');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [conditionsText, setConditionsText] = useState('ثبت چک صیادی صیاد۲ در سامانه پیچک\nتعهد کتبی مبنی بر تسویه تا ساعت ۱۶ روز کاری جاری\nمسدودسازی کد بورسی بنکدار در صورت تاخیر');
  const [actorName, setActorName] = useState('امیرحسین رضایی (مدیر ارشد سامانه)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titleFa.trim()) {
      setError('عنوان استثنا الزامی است.');
      return;
    }

    try {
      setIsSubmitting(true);
      const conditions = conditionsText
        .split('\n')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      await onSubmit({
        titleFa,
        descriptionFa,
        category,
        partyNameFa,
        goldWeightGrams: parseFloat(goldWeightGrams) || 0,
        financialImpactIrr: parseFloat(financialImpactIrr) || 0,
        riskLevel,
        conditions: conditions.length > 0 ? conditions : ['رعایت پروتکل‌های اضطراری'],
        actorName
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت استثنا.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181822] border border-[#313144] rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#2B2B3C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#332015] text-[#E5A84B] border border-[#E5A84B]/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#EDEDED]">صدور مجوز استثنای تجاری موقت (Waiver)</h3>
              <p className="text-xs text-[#9E9EA8]">عبور مشروط از محدودیت‌های سیستم با امضای دیجیتال و لاگ تغییرناپذیر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#88889C] hover:text-[#EDEDED] hover:bg-[#282838]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
          <div>
            <label className="text-[#9E9EA8] block mb-1 font-semibold">دسته‌بندی استثنا:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ApprovalCategory)}
              className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
            >
              <option value="credit_limit_exception">عبور از سقف اعتبار حساب دفتری بنکدار</option>
              <option value="physical_gold_release">ترخیص استثنایی طلا پیش از تسویه کامل</option>
              <option value="wage_discount_exception">اعمال تخفیف اجرت ساخت خارج از بازه مجاز</option>
              <option value="unverified_settlement_override">تسویه حساب دستی سند با مغایرت بانکی</option>
            </select>
          </div>

          <div>
            <label className="text-[#9E9EA8] block mb-1 font-semibold">عنوان مصوبه استثنا:</label>
            <input
              type="text"
              value={titleFa}
              onChange={(e) => setTitleFa(e.target.value)}
              className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#9E9EA8] block mb-1 font-semibold">طرف حساب ذینفع:</label>
              <input
                type="text"
                value={partyNameFa}
                onChange={(e) => setPartyNameFa(e.target.value)}
                className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              />
            </div>

            <div>
              <label className="text-[#9E9EA8] block mb-1 font-semibold">سطح ریسک انطباقی:</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as any)}
                className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                <option value="low">ریسک پایین (Low Risk)</option>
                <option value="medium">ریسک متوسط (Medium Risk)</option>
                <option value="high">ریسک بالا (High Risk - نیاز به ۲ امضا)</option>
                <option value="critical">بسیار پرخطر (Critical Risk)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#9E9EA8] block mb-1 font-semibold">حجم طلای تحت پوشش (گرم):</label>
              <input
                type="number"
                value={goldWeightGrams}
                onChange={(e) => setGoldWeightGrams(e.target.value)}
                className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#E5C365] font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>

            <div>
              <label className="text-[#9E9EA8] block mb-1 font-semibold">اثر مالی ریالی:</label>
              <input
                type="number"
                value={financialImpactIrr}
                onChange={(e) => setFinancialImpactIrr(e.target.value)}
                className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#9E9EA8] block mb-1 font-semibold">شروط و تعهدات وثیقه‌ای (هر خط یک شرط):</label>
            <textarea
              rows={3}
              value={conditionsText}
              onChange={(e) => setConditionsText(e.target.value)}
              className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:outline-none focus:border-[#C8A951]"
            />
          </div>

          <div>
            <label className="text-[#9E9EA8] block mb-1 font-semibold">مقام صادرکننده مجوز:</label>
            <input
              type="text"
              value={actorName}
              onChange={(e) => setActorName(e.target.value)}
              className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#331418] border border-[#FF4D4D] text-[#FF7A7A] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#2B2B3C]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#222230] text-[#B5B5C4] hover:bg-[#2C2C3E] transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#E5A84B] text-[#141416] font-bold hover:bg-[#F2B961] transition-colors shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'در حال صدور...' : 'ثبت و فعال‌سازی استثنا'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
