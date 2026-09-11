/**
 * Didar Gold Platform - K05 New Supplier Capacity Offer Modal
 * Register production capacity, lead times and offered wage from a workshop
 */

import React, { useState } from 'react';
import { ProductSku, WageType } from '../../types/k05.js';
import { X, Plus, Factory, Scale, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface NewOfferModalProps {
  isOpen: boolean;
  products: ProductSku[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const NewOfferModal: React.FC<NewOfferModalProps> = ({
  isOpen,
  products,
  onClose,
  onSubmit
}) => {
  const [productSkuId, setProductSkuId] = useState(products[0]?.id || '');
  const [supplierName, setSupplierName] = useState('');
  const [supplierCityFa, setSupplierCityFa] = useState('اصفهان');
  const [supplierGrade, setSupplierGrade] = useState<'A_PLUS' | 'A' | 'B'>('A');
  const [weeklyCapacityGrams, setWeeklyCapacityGrams] = useState(1500);
  const [minOrderQuantityGrams, setMinOrderQuantityGrams] = useState(250);
  const [leadTimeDays, setLeadTimeDays] = useState(4);
  const [offeredWageType, setOfferedWageType] = useState<WageType>('percentage');
  const [offeredWageValue, setOfferedWageValue] = useState(5.5);
  const [alloyQualityGuarantee, setAlloyQualityGuarantee] = useState(true);
  const [lossScrapAllowancePercent, setLossScrapAllowancePercent] = useState(0.35);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      setError('نام کارگاه یا شرکت سازنده الزامی است.');
      return;
    }
    if (!productSkuId) {
      setError('انتخاب مدل کالا الزامی است.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await onSubmit({
        productSkuId,
        supplierName,
        supplierCityFa,
        supplierGrade,
        weeklyCapacityGrams: Number(weeklyCapacityGrams),
        minOrderQuantityGrams: Number(minOrderQuantityGrams),
        leadTimeDays: Number(leadTimeDays),
        offeredWageType,
        offeredWageValue: Number(offeredWageValue),
        alloyQualityGuarantee,
        lossScrapAllowancePercent: Number(lossScrapAllowancePercent),
        notes
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت پیشنهاد ظرفیت.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#15151E] border border-[#2B2B3E] shadow-2xl overflow-hidden my-8 flex flex-col">
        <div className="p-4 border-b border-[#252536] flex items-center justify-between bg-[#191924]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#3DD68C]/20 text-[#3DD68C]">
              <Factory className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-[#EDEDED]">ثبت پیشنهاد ظرفیت تولید کارگاه (Capacity Offer)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7E7E90] hover:text-[#EDEDED] hover:bg-[#252536] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-[#2E181B] border border-[#522026] text-[#FF7A7A]">
              {error}
            </div>
          )}

          {/* Product selection */}
          <div className="space-y-1">
            <label className="text-[#A0A0B4] font-medium block">مدل کالا در کاتالوگ *</label>
            <select
              value={productSkuId}
              onChange={(e) => setProductSkuId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.skuCode} - {p.titleFa} ({p.caratFa})
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Name and City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[#A0A0B4] font-medium block">نام کارگاه طلاسازی / سازنده *</label>
              <input
                type="text"
                required
                placeholder="مثلا: کارگاه طلاسازی زرین نقش"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">شهر تولید</label>
              <select
                value={supplierCityFa}
                onChange={(e) => setSupplierCityFa(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                <option value="اصفهان">اصفهان</option>
                <option value="تهران">تهران</option>
                <option value="یزد">یزد</option>
                <option value="تبریز">تبریز</option>
                <option value="مشهد">مشهد</option>
                <option value="شیراز">شیراز</option>
              </select>
            </div>
          </div>

          {/* Capacity, MOQ, Lead Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">ظرفیت هفتگی (گرم)</label>
              <input
                type="number"
                value={weeklyCapacityGrams}
                onChange={(e) => setWeeklyCapacityGrams(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">حداقل سفارش MOQ (گرم)</label>
              <input
                type="number"
                value={minOrderQuantityGrams}
                onChange={(e) => setMinOrderQuantityGrams(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">زمان تحویل (روز کاری)</label>
              <input
                type="number"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          {/* Wage Structure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">نوع اجرت پیشنهادی</label>
              <select
                value={offeredWageType}
                onChange={(e) => setOfferedWageType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                <option value="percentage">درصدی از طلای خام</option>
                <option value="fixed_per_gram">ریال ثابت به ازای هر گرم</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">
                {offeredWageType === 'percentage' ? 'درصد اجرت پیشنهادی' : 'مبلغ ریالی هر گرم'}
              </label>
              <input
                type="number"
                step="0.1"
                value={offeredWageValue}
                onChange={(e) => setOfferedWageValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          {/* Guarantee & Notes */}
          <div className="space-y-3 p-3 rounded-xl bg-[#111118] border border-[#252536]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alloyQualityGuarantee}
                onChange={(e) => setAlloyQualityGuarantee(e.target.checked)}
                className="rounded text-[#C8A951] focus:ring-0"
              />
              <span className="text-[#EDEDED]">تضمین انطباق استاندارد عیارسنجی ری‌گیری رسمی</span>
            </label>

            <div className="space-y-1">
              <label className="text-[#A0A0B4] block">یادداشت فنی کارگاه یا شرایط خاص تحویل</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلا: تحویل در قالب‌های آماده، امکان تخفیف روی سفارشات بالای ۱ کیلوگرم..."
                className="w-full px-3 py-2 rounded-xl bg-[#0F0F15] border border-[#262638] text-[#EDEDED]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#252536] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#222230] text-[#A0A0B4] hover:bg-[#2C2C3E]"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D8B961] text-[#141416] font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'در حال ثبت...' : 'ثبت پیشنهاد ظرفیت'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
