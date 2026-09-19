/**
 * Didar Gold Platform - Kernel Domain K12
 * AddStoreModal: افزودن فروشگاه/طلافروشی به قلمرو جهت برنامه‌ریزی مراجعه
 * 
 * Unified Dark Luxury Gold Theme (#161622, #151520, #191926, #28283C, #C8A951, #E5C365)
 */

import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  X,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Territory, TerritoryStore } from '../../types/k12.js';

interface AddStoreModalProps {
  territory: Territory | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (territoryId: string, storeData: Partial<TerritoryStore>) => Promise<void>;
}

export const AddStoreModal: React.FC<AddStoreModalProps> = ({
  territory,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [tradeNameFa, setTradeNameFa] = useState('');
  const [ownerFa, setOwnerFa] = useState('');
  const [unionCode, setUnionCode] = useState('');
  const [addressFa, setAddressFa] = useState('');
  const [phone, setPhone] = useState('');
  const [tierFa, setTierFa] = useState('طلافروشی خرده‌فروش');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !territory) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeNameFa.trim() || !ownerFa.trim()) {
      setErrorMsg('لطفاً عنوان گالری و نام صاحب پروانه را وارد نمایید.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSubmit(territory.id, {
        tradeNameFa: tradeNameFa.trim(),
        ownerFa: ownerFa.trim(),
        unionCode: unionCode.trim() || `GLD-${Math.floor(1000 + Math.random() * 9000)}`,
        addressFa: addressFa.trim() || territory.marketDistrictsFa,
        phone: phone.trim() || '۰۲۱-۵۵۰۰۰۰۰۰',
        tierFa: tierFa.trim()
      });
      // reset form
      setTradeNameFa('');
      setOwnerFa('');
      setUnionCode('');
      setAddressFa('');
      setPhone('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ثبت فروشگاه در قلمرو');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-xl rounded-2xl border border-[#28283C] bg-[#161622] text-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#28283C] px-6 py-4 bg-[#191926]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C8A951]/10 border border-[#C8A951]/20 text-[#E5C365]">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">افزودن فروشگاه طلا به قلمرو</h3>
              <p className="text-xs text-[#C8A951]">قلمرو: {territory.titleFa}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#28283C] hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              نام گالری / فروشگاه طلا <span className="text-[#E5C365]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={tradeNameFa}
                onChange={(e) => setTradeNameFa(e.target.value)}
                placeholder="مثال: گالری طلا و جواهر پرسپولیس"
                className="w-full rounded-xl bg-[#151520] border border-[#28283C] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C8A951] focus:ring-1 focus:ring-[#C8A951]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                نام صاحب پروانه / متصدی <span className="text-[#E5C365]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={ownerFa}
                  onChange={(e) => setOwnerFa(e.target.value)}
                  placeholder="مثال: حاج محمود کمالی"
                  className="w-full rounded-xl bg-[#151520] border border-[#28283C] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C8A951] focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                کد صنفی اتحادیه طلا و جواهر
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={unionCode}
                  onChange={(e) => setUnionCode(e.target.value)}
                  placeholder="GLD-TEH-8812"
                  className="w-full rounded-xl bg-[#151520] border border-[#28283C] px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C8A951] focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                شماره تماس فروشگاه
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="۰۲۱-۵۵۶۲۳۴۹۰"
                  className="w-full rounded-xl bg-[#151520] border border-[#28283C] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C8A951] focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                رسته و سطح ویترین
              </label>
              <select
                value={tierFa}
                onChange={(e) => setTierFa(e.target.value)}
                className="w-full rounded-xl bg-[#151520] border border-[#28283C] px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[#C8A951] focus:ring-1 focus:ring-[#C8A951]"
              >
                <option value="ویترین طلای لوکس و ریخته‌گری">ویترین طلای لوکس و ریخته‌گری</option>
                <option value="بنکدار و فروشنده عمده النگو">بنکدار و فروشنده عمده النگو</option>
                <option value="سرویس‌های جواهر و سرویس عروس">سرویس‌های جواهر و سرویس عروس</option>
                <option value="طلافروشی خرده‌فروش سبک و مینیمال">طلافروشی خرده‌فروش سبک و مینیمال</option>
                <option value="سفارشات سازمانی و سکه/شمش">سفارشات سازمانی و سکه/شمش</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              آدرس دقیق واحد صنفی در راسته بازار
            </label>
            <textarea
              rows={2}
              value={addressFa}
              onChange={(e) => setAddressFa(e.target.value)}
              placeholder="مثال: بازار بزرگ، سرای حاج مهدی، طبقه همکف، پلاک ۱۴"
              className="w-full rounded-xl bg-[#151520] border border-[#28283C] px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C8A951] focus:ring-1 focus:ring-[#C8A951]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#28283C]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#191926] hover:bg-[#28283C] rounded-xl transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-slate-900 bg-gradient-to-r from-[#C8A951] to-[#E5C365] hover:opacity-90 rounded-xl transition-opacity font-semibold disabled:opacity-50 shadow-md shadow-[#C8A951]/20"
            >
              {isSubmitting ? (
                'در حال ثبت...'
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>افزودن فروشگاه به قلمرو</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
