/**
 * Didar Gold Platform - Kernel Domain K11
 * Basket Policy & Carat Entitlements Modal (سیاست سبد سفارش، عیارها و طلای امانی)
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Scale,
  ShieldCheck,
  Coins,
  AlertCircle
} from 'lucide-react';
import { Retailer, RetailerAllowedBasket } from '../../types/k11.js';
import { GoldCarat } from '../../types/k05.js';

interface BasketPolicyModalProps {
  isOpen: boolean;
  retailer: Retailer | null;
  onClose: () => void;
  onSubmit: (retailerId: string, basketUpdates: Partial<RetailerAllowedBasket>) => Promise<void>;
}

export const BasketPolicyModal: React.FC<BasketPolicyModalProps> = ({
  isOpen,
  retailer,
  onClose,
  onSubmit
}) => {
  const [permittedCarats, setPermittedCarats] = useState<GoldCarat[]>(['18k_750']);
  const [minOrderWeightGrams, setMinOrderWeightGrams] = useState(30);
  const [maxOrderWeightGrams, setMaxOrderWeightGrams] = useState(2000);
  const [bullionPurchaseAllowed, setBullionPurchaseAllowed] = useState(false);
  const [customWorkshopOrderAllowed, setCustomWorkshopOrderAllowed] = useState(false);
  const [consignmentShowcaseAllowed, setConsignmentShowcaseAllowed] = useState(false);
  const [maxConsignmentWeightGrams, setMaxConsignmentWeightGrams] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (retailer) {
      setPermittedCarats(retailer.allowedBasket.permittedCarats);
      setMinOrderWeightGrams(retailer.allowedBasket.minOrderWeightGrams);
      setMaxOrderWeightGrams(retailer.allowedBasket.maxOrderWeightGrams);
      setBullionPurchaseAllowed(retailer.allowedBasket.bullionPurchaseAllowed);
      setCustomWorkshopOrderAllowed(retailer.allowedBasket.customWorkshopOrderAllowed);
      setConsignmentShowcaseAllowed(retailer.allowedBasket.consignmentShowcaseAllowed);
      setMaxConsignmentWeightGrams(retailer.allowedBasket.maxConsignmentWeightGrams);
    }
  }, [retailer]);

  if (!isOpen || !retailer) return null;

  const toggleCarat = (carat: GoldCarat) => {
    if (permittedCarats.includes(carat)) {
      if (permittedCarats.length === 1) return; // Must have at least one carat
      setPermittedCarats(permittedCarats.filter(c => c !== carat));
    } else {
      setPermittedCarats([...permittedCarats, carat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minOrderWeightGrams >= maxOrderWeightGrams) {
      setErrorMessage('حداقل وزن مجاز باید کمتر از حداکثر سقف سفارش باشد.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      await onSubmit(retailer.id, {
        permittedCarats,
        minOrderWeightGrams: Number(minOrderWeightGrams),
        maxOrderWeightGrams: Number(maxOrderWeightGrams),
        bullionPurchaseAllowed,
        customWorkshopOrderAllowed,
        consignmentShowcaseAllowed,
        maxConsignmentWeightGrams: consignmentShowcaseAllowed ? Number(maxConsignmentWeightGrams) : 0
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در به‌روزرسانی سیاست سبد مجاز');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#18181F] border border-[#2B2B38] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2B38] bg-[#1F1F2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A951]/10 border border-[#C8A951]/30 flex items-center justify-center text-[#E5C365]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#EDEDED]">تنظیم سبد مجاز، عیارها و طلای امانی</h3>
              <p className="text-xs text-[#8E8E93]">{retailer.tradeNameFa}</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Carat Allowances */}
          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] mb-2">
              عیارهای مجاز سفارش طلا:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: '18k_750' as GoldCarat, label: '۱۸ عیار (۷۵۰)', desc: 'استاندارد کشوری' },
                { id: '21k_875' as GoldCarat, label: '۲۱ عیار (۸۷۵)', desc: 'جنوب و خلیج' },
                { id: '22k_916' as GoldCarat, label: '۲۲ عیار (۹۱۶)', desc: 'طلای سنتی عربی' },
                { id: '24k_999' as GoldCarat, label: '۲۴ عیار (۹۹۹)', desc: 'شمش سرمایه‌ای' }
              ].map((c) => {
                const isSelected = permittedCarats.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCarat(c.id)}
                    className={`p-3 rounded-xl border text-right transition-all ${
                      isSelected
                        ? 'bg-[#C8A951]/15 border-[#C8A951] text-[#E5C365]'
                        : 'bg-[#121217] border-[#2B2B38] text-[#8E8E93] hover:border-[#3E3E4E]'
                    }`}
                  >
                    <div className="font-bold text-xs">{c.label}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{c.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weight Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                حداقل وزن مجاز در هر سفارش (گرم)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={minOrderWeightGrams}
                onChange={(e) => setMinOrderWeightGrams(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                حداکثر وزن سفارش واحد (گرم)
              </label>
              <input
                type="number"
                min="50"
                step="50"
                value={maxOrderWeightGrams}
                onChange={(e) => setMaxOrderWeightGrams(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 p-4 rounded-xl bg-[#121217] border border-[#2B2B38]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#EDEDED]">
              <input
                type="checkbox"
                checked={bullionPurchaseAllowed}
                onChange={(e) => setBullionPurchaseAllowed(e.target.checked)}
                className="w-4 h-4 rounded accent-[#C8A951]"
              />
              <span>مجوز سفارش شمش‌های طلای ۲۴ عیار استاندارد دیدار</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#EDEDED]">
              <input
                type="checkbox"
                checked={customWorkshopOrderAllowed}
                onChange={(e) => setCustomWorkshopOrderAllowed(e.target.checked)}
                className="w-4 h-4 rounded accent-[#C8A951]"
              />
              <span>مجوز سفارش ساخت اختصاصی کارگاهی بر اساس کاتالوگ یا طرح خریدار</span>
            </label>

            <div className="pt-2 border-t border-[#2B2B38]">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#EDEDED]">
                <input
                  type="checkbox"
                  checked={consignmentShowcaseAllowed}
                  onChange={(e) => setConsignmentShowcaseAllowed(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#C8A951]"
                />
                <span>تسهیلات استقرار طلای امانی دیدار در ویترین طلافروشی</span>
              </label>

              {consignmentShowcaseAllowed && (
                <div className="mt-3 pr-6">
                  <label className="block text-xs font-semibold text-[#8E8E93] mb-1">
                    سقف وزن مجاز طلای امانی (گرم):
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={maxConsignmentWeightGrams}
                    onChange={(e) => setMaxConsignmentWeightGrams(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#18181F] border border-[#2B2B38] text-sm text-[#E5C365] font-mono focus:outline-none focus:border-[#C8A951]"
                  />
                  <p className="text-[11px] text-[#8E8E93] mt-1">
                    این اقلام تا زمان فروش به عنوان موجودی امانی دیدار با شناسه و رهگیری GPS ثبت می‌گردد.
                  </p>
                </div>
              )}
            </div>
          </div>

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
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#C8A951] text-[#141416] hover:bg-[#E5C365] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'در حال ذخیره...' : 'به‌روزرسانی سبد مجاز'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
