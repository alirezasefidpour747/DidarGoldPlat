/**
 * Didar Gold Platform - K04: New Approval Request Modal
 * Maker stage submission for Four-Eyes Gold Workflows
 */

import React, { useState } from 'react';
import { ApprovalCategory, ApprovalUrgency } from '../../types/k04.js';
import {
  X,
  PlusCircle,
  AlertTriangle,
  Scale,
  Coins,
  ShieldAlert
} from 'lucide-react';

interface NewApprovalRequestModalProps {
  onClose: () => void;
  onSubmit: (data: {
    category: ApprovalCategory;
    title: string;
    description: string;
    urgency: ApprovalUrgency;
    goldWeightGrams: number;
    goldPurityCarat: number;
    financialValueIrr: number;
    partyNameFa: string;
    initiatorId: string;
    initiatorName: string;
    initiatorRoleFa: string;
  }) => Promise<void>;
}

export const NewApprovalRequestModal: React.FC<NewApprovalRequestModalProps> = ({
  onClose,
  onSubmit
}) => {
  const [category, setCategory] = useState<ApprovalCategory>('physical_gold_release');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<ApprovalUrgency>('high');
  const [goldWeightGrams, setGoldWeightGrams] = useState<string>('500');
  const [goldPurityCarat, setGoldPurityCarat] = useState<string>('995');
  const [financialValueIrr, setFinancialValueIrr] = useState<string>('22500000000');
  const [partyNameFa, setPartyNameFa] = useState('بنکداری طلای کیمیا بازار تهران');
  const [initiatorId, setInitiatorId] = useState('usr-002');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('لطفاً عنوان درخواست را وارد کنید.');
      return;
    }

    try {
      setIsSubmitting(true);
      const initiatorName =
        initiatorId === 'usr-002' ? 'مهرداد خزایی' : initiatorId === 'usr-004' ? 'سارا معتمدی' : 'امیرحسین رضایی';
      const initiatorRoleFa =
        initiatorId === 'usr-002' ? 'متصدی ارشد خزانه‌داری' : initiatorId === 'usr-004' ? 'کارشناس انطباق و ریسک' : 'مدیر ارشد سامانه';

      await onSubmit({
        category,
        title,
        description,
        urgency,
        goldWeightGrams: parseFloat(goldWeightGrams) || 0,
        goldPurityCarat: parseInt(goldPurityCarat) || 750,
        financialValueIrr: parseFloat(financialValueIrr) || 0,
        partyNameFa,
        initiatorId,
        initiatorName,
        initiatorRoleFa
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت درخواست.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181822] border border-[#313144] rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#2B2B3C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#292316] text-[#C8A951] border border-[#C8A951]/40">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#EDEDED]">ثبت درخواست جدید در کارتابل چهارچشم</h3>
              <p className="text-xs text-[#9E9EA8]">ارسال به گردش‌کار نظارتی اصل تفکیک وظایف (Maker-Checker)</p>
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
            <label className="text-[#9E9EA8] block mb-1 font-semibold">دسته‌بندی عملیات نظارتی:</label>
            <select
              value={category}
              onChange={(e) => {
                const cat = e.target.value as ApprovalCategory;
                setCategory(cat);
                if (cat === 'physical_gold_release') {
                  setTitle('ترخیص شمش طلای ۹۹۵ جهت تسویه فیزیکی بنکدار');
                } else if (cat === 'credit_limit_exception') {
                  setTitle('تقاضای افزایش سقف حساب دفتری بنکدار');
                } else if (cat === 'wage_discount_exception') {
                  setTitle('تخفیف استثنایی اجرت ساخت سفارش عمده النگو');
                } else {
                  setTitle('تطبیق استثنایی فیش ساتنا با مغایرت کد شبا');
                }
              }}
              className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
            >
              <option value="physical_gold_release">ترخیص فیزیکی شمش و طلا از خزانه مرکزی</option>
              <option value="credit_limit_exception">افزایش استثنایی سقف اعتبار تجاری بنکدار</option>
              <option value="wage_discount_exception">تخفیف استثنایی اجرت ساخت کارگاهی</option>
              <option value="unverified_settlement_override">تطبیق استثنایی و تسویه دستی اسناد بانکی</option>
            </select>
          </div>

          <div>
            <label className="text-[#9E9EA8] block mb-1 font-semibold">عنوان درخواست:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ترخیص ۵۰۰ گرم شمش سوئیسی برای تسویه فوری بنکداری کیمیا"
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
              <label className="text-[#9E9EA8] block mb-1 font-semibold">فوریت گردش‌کار:</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as ApprovalUrgency)}
                className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                <option value="normal">عادی (مهلت تا ۴۸ ساعت)</option>
                <option value="high">فوری (مهلت تا ۲۴ ساعت)</option>
                <option value="critical">بسیار فوری / بحرانی (مهلت تا ۶ ساعت)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[#9E9EA8] block mb-1 font-semibold">وزن طلا (گرم):</label>
              <input
                type="number"
                value={goldWeightGrams}
                onChange={(e) => setGoldWeightGrams(e.target.value)}
                className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#E5C365] font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>

            <div>
              <label className="text-[#9E9EA8] block mb-1 font-semibold">عیار طلا:</label>
              <select
                value={goldPurityCarat}
                onChange={(e) => setGoldPurityCarat(e.target.value)}
                className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:outline-none focus:border-[#C8A951]"
              >
                <option value="995">۹۹۵ (شمش استاندارد سوئیسی/اماراتی)</option>
                <option value="750">۷۵۰ (طلای ۱۸ عیار ساخته‌شده)</option>
                <option value="900">۹۰۰ (مسکوکات بهار آزادی)</option>
              </select>
            </div>

            <div>
              <label className="text-[#9E9EA8] block mb-1 font-semibold">ارزش ریالی تقریبی:</label>
              <input
                type="number"
                value={financialValueIrr}
                onChange={(e) => setFinancialValueIrr(e.target.value)}
                className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#9E9EA8] block mb-1 font-semibold">شرح کامل علت درخواست و مستندات:</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="شرح جزئیات تراکنش، شماره قرارداد یا وثیقه ارائه‌شده..."
              className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
            />
          </div>

          <div>
            <label className="text-[#9E9EA8] block mb-1 font-semibold">شخص ثبت‌کننده (Maker):</label>
            <select
              value={initiatorId}
              onChange={(e) => setInitiatorId(e.target.value)}
              className="w-full bg-[#13131A] border border-[#2E2E40] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
            >
              <option value="usr-002">مهرداد خزایی (متصدی ارشد خزانه‌داری)</option>
              <option value="usr-004">سارا معتمدی (کارشناس انطباق و ریسک)</option>
              <option value="usr-001">امیرحسین رضایی (مدیر ارشد سامانه)</option>
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#331418] border border-[#FF4D4D] text-[#FF7A7A] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-[#262013] border border-[#C8A951]/30 text-xs text-[#E5C365] flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              طبق اصل چهارچشم، پس از ثبت، این درخواست به کارتابل ناظر مستقل ارجاع شده و امکان تایید توسط ثبت‌کننده وجود نخواهد داشت.
            </span>
          </div>

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
              className="px-5 py-2 rounded-xl bg-[#C8A951] text-[#141416] font-bold hover:bg-[#D8B75B] transition-colors shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ایجاد...' : 'ارسال به گردش‌کار چهارچشم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
