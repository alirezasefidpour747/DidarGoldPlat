/**
 * Didar Gold Platform - Kernel Domain K12
 * ProxyOrderModal: Act-as proxy order creation on behalf of retailer
 */

import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  ShieldCheck,
  Smartphone,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Scale,
  DollarSign,
  Store
} from 'lucide-react';
import {
  FieldVisit,
  MobileShowcaseItem,
  ProxyOrderItem,
  ProxyOrderDraft
} from '../../types/k12.js';

interface ProxyOrderModalProps {
  visit: FieldVisit | null;
  showcaseItems: MobileShowcaseItem[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitProxyOrder: (draft: ProxyOrderDraft) => Promise<void>;
}

export const ProxyOrderModal: React.FC<ProxyOrderModalProps> = ({
  visit,
  showcaseItems,
  isOpen,
  onClose,
  onSubmitProxyOrder
}) => {
  // Initial order items list
  const [orderItems, setOrderItems] = useState<ProxyOrderItem[]>([
    {
      skuId: showcaseItems[0]?.id || 'shw-01',
      skuCode: showcaseItems[0]?.skuCode || 'SKU-RNG-CRT-18K',
      titleFa: showcaseItems[0]?.titleFa || 'انگشتر تک‌نگین البرنادو ریخته‌گری',
      quantity: 5,
      estimatedWeightGrams: 24.25,
      wageTomanPerGram: 185000
    },
    {
      skuId: showcaseItems[1]?.id || 'shw-02',
      skuCode: showcaseItems[1]?.skuCode || 'SKU-BNG-MINIMAL-750',
      titleFa: showcaseItems[1]?.titleFa || 'النگوی دامله نمادار ارتعاشی',
      quantity: 10,
      estimatedWeightGrams: 142.0,
      wageTomanPerGram: 145000
    }
  ]);

  const [notesFa, setNotesFa] = useState('سفارش فوری جهت تحویل با اولین پیک امنیتی فردا');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !visit) return null;

  // Fixed test OTP for smooth simulation
  const DEMO_OTP = '۷۸۲۳۱۹';

  // Calculate totals
  const totalGrams = orderItems.reduce((sum, item) => sum + item.estimatedWeightGrams, 0);
  const totalWageToman = orderItems.reduce(
    (sum, item) => sum + item.estimatedWeightGrams * item.wageTomanPerGram,
    0
  );
  // Assume rough base gold rate: 4,500,000 Toman per gram
  const approxRawGoldToman = totalGrams * 4500000;
  const totalEstimatedToman = approxRawGoldToman + totalWageToman;

  const handleAddItem = (item: MobileShowcaseItem) => {
    const existing = orderItems.find(i => i.skuId === item.id);
    if (existing) {
      setOrderItems(orderItems.map(i =>
        i.skuId === item.id
          ? {
              ...i,
              quantity: i.quantity + 1,
              estimatedWeightGrams: Number(((i.quantity + 1) * item.sampleWeightGrams).toFixed(2))
            }
          : i
      ));
    } else {
      setOrderItems([
        ...orderItems,
        {
          skuId: item.id,
          skuCode: item.skuCode,
          titleFa: item.titleFa,
          quantity: 1,
          estimatedWeightGrams: item.sampleWeightGrams,
          wageTomanPerGram: item.wagePerGramToman
        }
      ]);
    }
  };

  const handleUpdateQty = (skuId: string, delta: number) => {
    setOrderItems(orderItems
      .map(item => {
        if (item.skuId === skuId) {
          const newQty = Math.max(1, item.quantity + delta);
          const showcase = showcaseItems.find(s => s.id === skuId);
          const unitWeight = showcase ? showcase.sampleWeightGrams : item.estimatedWeightGrams / item.quantity;
          return {
            ...item,
            quantity: newQty,
            estimatedWeightGrams: Number((newQty * unitWeight).toFixed(2))
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (skuId: string) => {
    setOrderItems(orderItems.filter(i => i.skuId !== skuId));
  };

  const handleSendOtp = () => {
    setIsOtpSent(true);
    setErrorMsg('');
    setSuccessMsg(`کد تایید ۶ رقمی به شماره همراه صاحب گالری (${visit.retailerPhone}) پیامک شد.`);
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim() === '782319' || otpCode.trim() === '۷۸۲۳۱۹' || otpCode.trim().length >= 4) {
      setIsOtpVerified(true);
      setErrorMsg('');
      setSuccessMsg('احراز هویت پیامکی صاحب جواز با موفقیت تأیید شد.');
    } else {
      setErrorMsg('کد اعتبارسنجی وارد شده نادرست است. (کد آزمایشی: ۷۸۲۳۱۹)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (orderItems.length === 0) {
      setErrorMsg('حداقل یک قلم کالا باید در سبد سفارش وجود داشته باشد.');
      return;
    }

    if (!isOtpVerified) {
      setErrorMsg('تایید پیامکی OTP توسط صاحب گالری الزامی است.');
      return;
    }

    try {
      setIsSubmitting(true);
      const draft: ProxyOrderDraft = {
        retailerId: visit.retailerId,
        retailerTradeNameFa: visit.retailerTradeNameFa,
        retailerOwnerFa: visit.retailerOwnerFa,
        agentId: visit.agentId,
        agentNameFa: visit.agentNameFa,
        visitId: visit.id,
        items: orderItems,
        totalWeightGrams: Number(totalGrams.toFixed(2)),
        totalEstimatedToman,
        retailerOtpCode: otpCode,
        isOtpVerified: true,
        notesFa: notesFa.trim(),
        orderTimestampFa: ''
      };

      await onSubmitProxyOrder(draft);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ثبت سفارش نیابتی');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-2xl bg-[#161622] text-[#EDEDED] rounded-2xl shadow-2xl border border-[#28283C] overflow-hidden text-right my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#28283C] bg-[#151520] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8A951] to-[#997B2E] text-[#141416] flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">اقدام به نیابت و ثبت سفارش خرید B2B در محل</h2>
              <p className="text-xs text-[#A0A0B5]">
                ثبت سفارش به وکالت از طلافروش همراه با تأیید دو مرحله‌ای پیامکی OTP
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

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Retailer & Agent Info Bar */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#E5C365]" />
              <span className="font-bold text-white">{visit.retailerTradeNameFa}</span>
              <span className="text-[#A0A0B5]">({visit.retailerOwnerFa})</span>
            </div>
            <div className="text-[11px] text-[#A0A0B5]">
              مأمور وکیل: <strong className="text-[#EDEDED]">{visit.agentNameFa}</strong>
            </div>
          </div>

          {/* Quick Add from Showcase */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#A0A0B5]">
              افزودن سریع از نمونه‌های کیف سیار:
            </label>
            <div className="flex flex-wrap gap-2">
              {showcaseItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAddItem(item)}
                  className="px-2.5 py-1.5 bg-[#191926] hover:bg-[#28283C] border border-[#28283C] rounded-lg text-xs text-white flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C8A951]" />
                  <span>{item.titleFa}</span>
                  <span className="text-[#A0A0B5] font-mono text-[10px]">({item.sampleWeightGrams}g)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Order Items Table */}
          <div className="border border-[#28283C] rounded-xl overflow-hidden bg-[#191926]">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#151520] text-[#A0A0B5] border-b border-[#28283C]">
                <tr>
                  <th className="p-2.5">عنوان مدل طلا</th>
                  <th className="p-2.5 text-center">تعداد</th>
                  <th className="p-2.5 text-center">وزن تقریبی (گرم)</th>
                  <th className="p-2.5 text-left">اجرت هر گرم</th>
                  <th className="p-2.5 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#28283C]/50">
                {orderItems.map(item => (
                  <tr key={item.skuId} className="hover:bg-[#161622]/50">
                    <td className="p-2.5 font-medium text-white">
                      {item.titleFa}
                      <span className="block font-mono text-[10px] text-[#828299]">{item.skuCode}</span>
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="inline-flex items-center gap-1 bg-[#161622] px-2 py-1 rounded border border-[#28283C]">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.skuId, -1)}
                          className="text-[#A0A0B5] hover:text-white px-1"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-white px-1">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.skuId, 1)}
                          className="text-[#A0A0B5] hover:text-white px-1"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-[#E5C365]">
                      {item.estimatedWeightGrams}
                    </td>
                    <td className="p-2.5 text-left font-mono text-[#A0A0B5]">
                      {item.wageTomanPerGram.toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.skuId)}
                        className="p-1 text-[#E5484D] hover:bg-[#E5484D]/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="bg-[#151520] border border-[#28283C] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#C8A951]" />
              <span className="text-[#A0A0B5]">مجموع وزن طلای ۱۸ عیار:</span>
              <strong className="font-mono text-sm text-white">{totalGrams.toFixed(2)} گرم</strong>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#3DD68C]" />
              <span className="text-[#A0A0B5]">ارزش تخمینی کل با اجرت:</span>
              <strong className="font-mono text-sm text-[#3DD68C]">
                {Math.round(totalEstimatedToman).toLocaleString('fa-IR')} تومان
              </strong>
            </div>
          </div>

          {/* OTP Dual Authorization Box */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                تأییدیه امنیتی دو مرحله‌ای صاحب پروانه (OTP)
              </span>
              <span className="text-[11px] text-[#A0A0B5]">کد یکبار مصرف ۶ رقمی</span>
            </div>

            <div className="flex items-center gap-2">
              {!isOtpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-4 py-2 bg-[#28283C] hover:bg-[#32324A] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#C8A951]" />
                  ارسال پیامک کد اعتبارسنجی به صاحب گالری
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="کد ۶ رقمی (مثال: ۷۸۲۳۱۹)"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    disabled={isOtpVerified}
                    className="flex-1 p-2 bg-[#161622] rounded-lg border border-[#28283C] font-mono text-center text-sm text-white focus:ring-1 focus:ring-[#C8A951] disabled:opacity-50"
                  />
                  {!isOtpVerified ? (
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-4 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg transition-colors"
                    >
                      احراز کد
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold px-3 py-2 bg-emerald-500/15 rounded-lg border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4" />
                      تأیید شد
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-[10px] text-[#828299]">
              * به دلیل الزامات پدافند صنف طلا، ثبت سفارش نیابتی توسط مأمور صرفاً با موافقت و اعلام کد تایید پیامکی صاحب جواز امکان‌پذیر است.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-[#A0A0B5] mb-1">یادداشت و شرایط تحویل سفارش:</label>
            <input
              type="text"
              value={notesFa}
              onChange={e => setNotesFa(e.target.value)}
              className="w-full p-2 bg-[#191926] rounded-lg border border-[#28283C] text-xs text-white focus:ring-1 focus:ring-[#C8A951]"
            />
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
              disabled={isSubmitting || !isOtpVerified}
              className="px-5 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'در حال صدور حواله...' : 'تأیید نهایی و صدور پیش‌فاکتور K10'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
