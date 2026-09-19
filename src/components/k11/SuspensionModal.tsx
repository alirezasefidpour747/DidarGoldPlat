/**
 * Didar Gold Platform - Kernel Domain K11
 * Suspension & Commercial Exception Modal (تعلیق تجاری، تغییر وضعیت و استثنائات)
 */

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Lock,
  Unlock,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Retailer, RetailerLifecycleStatus } from '../../types/k11.js';

interface SuspensionModalProps {
  isOpen: boolean;
  retailer: Retailer | null;
  onClose: () => void;
  onStatusChange: (retailerId: string, status: RetailerLifecycleStatus, reasonFa: string) => Promise<void>;
  onAddException: (
    retailerId: string,
    exceptionData: {
      expiryDateFa: string;
      authorizedByFa: string;
      temporaryCreditBonusGoldGrams: number;
      temporaryCreditBonusToman: number;
      reasonFa: string;
    }
  ) => Promise<void>;
}

export const SuspensionModal: React.FC<SuspensionModalProps> = ({
  isOpen,
  retailer,
  onClose,
  onStatusChange,
  onAddException
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'exception'>('status');

  // Status Tab State
  const [selectedStatus, setSelectedStatus] = useState<RetailerLifecycleStatus>(
    retailer?.status || 'active_trading'
  );
  const [statusReasonFa, setStatusReasonFa] = useState('');

  // Exception Tab State
  const [expiryDateFa, setExpiryDateFa] = useState('۱۴۰۳/۱۰/۱۵');
  const [authorizedByFa, setAuthorizedByFa] = useState('کمیته اعتبارات دیدار (مهندس سرمدی)');
  const [bonusGoldGrams, setBonusGoldGrams] = useState(150);
  const [bonusToman, setBonusToman] = useState(1200000000);
  const [exceptionReasonFa, setExceptionReasonFa] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !retailer) return null;

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusReasonFa.trim()) {
      setErrorMessage('لطفاً دلیل مستند تغییر وضعیت را وارد نمایید.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      await onStatusChange(retailer.id, selectedStatus, statusReasonFa);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در تغییر وضعیت');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExceptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionReasonFa.trim()) {
      setErrorMessage('لطفاً علت اعطای استثنای موقت اعتباری را وارد کنید.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      await onAddException(retailer.id, {
        expiryDateFa,
        authorizedByFa,
        temporaryCreditBonusGoldGrams: Number(bonusGoldGrams),
        temporaryCreditBonusToman: Number(bonusToman),
        reasonFa: exceptionReasonFa
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ثبت استثنای تجاری');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#18181F] border border-[#2B2B38] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2B38] bg-[#1F1F2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 flex items-center justify-center text-[#E5484D]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#EDEDED]">مدیریت وضعیت چرخه عمر و استثنائات</h3>
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

        {/* Tabs */}
        <div className="flex border-b border-[#2B2B38] bg-[#141419]">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'status'
                ? 'border-[#C8A951] text-[#E5C365] bg-[#18181F]'
                : 'border-transparent text-[#8E8E93] hover:text-[#EDEDED]'
            }`}
          >
            تغییر وضعیت فعالیت / تعلیق تجاری
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exception')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'exception'
                ? 'border-[#C8A951] text-[#E5C365] bg-[#18181F]'
                : 'border-transparent text-[#8E8E93] hover:text-[#EDEDED]'
            }`}
          >
            ثبت استثنای موقت اعتباری
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 flex items-center gap-2 text-xs text-[#E5484D]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {activeTab === 'status' ? (
          <form onSubmit={handleStatusSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                وضعیت جدید خرده‌فروش در سامانه:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as RetailerLifecycleStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
              >
                <option value="active_trading">فعال تجاری (مجاز به ثبت سفارش و دریافت طلا)</option>
                <option value="probationary">دوره آزمایشی (محدودیت سقف و تسویه پیشینی)</option>
                <option value="under_review">تحت بازنگری دوره‌ای (توقف تمدید اعتبار)</option>
                <option value="credit_suspended">تعلیق اعتباری (عدم تسویه بدهی یا چک برگشتی)</option>
                <option value="inactive">غیرفعال موقت (بسته بودن گالری)</option>
                <option value="blacklisted">مسدود دائم و لیست سیاه صنفی</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                شرح و دلیل مستند تغییر وضعیت <span className="text-[#E5484D]">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={statusReasonFa}
                onChange={(e) => setStatusReasonFa(e.target.value)}
                placeholder="مثال: تعلیق اعتباری به دلیل عدم واریز وجه چک صیادی موعد ۱۴۰۳/۰۸/۲۵..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors resize-none"
              />
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
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#E5484D] text-[#EDEDED] hover:bg-[#E5484D]/80 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'در حال ثبت...' : 'تأیید و اعمال تغییر وضعیت'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleExceptionSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                  اعتبار تشویقی موقت طلا (گرم)
                </label>
                <input
                  type="number"
                  step="10"
                  value={bonusGoldGrams}
                  onChange={(e) => setBonusGoldGrams(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                  اعتبار تشویقی موقت ریالی (تومان)
                </label>
                <input
                  type="number"
                  step="50000000"
                  value={bonusToman}
                  onChange={(e) => setBonusToman(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                  تاریخ انقضای استثنا
                </label>
                <input
                  type="text"
                  value={expiryDateFa}
                  onChange={(e) => setExpiryDateFa(e.target.value)}
                  placeholder="۱۴۰۳/۱۰/۱۵"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                  مقام تصویب‌کننده
                </label>
                <input
                  type="text"
                  value={authorizedByFa}
                  onChange={(e) => setAuthorizedByFa(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                دلیل اعطای استثنای موقت <span className="text-[#E5484D]">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={exceptionReasonFa}
                onChange={(e) => setExceptionReasonFa(e.target.value)}
                placeholder="مثال: افزایش سقف سفارش به مناسبت حراج عید یا نمایشگاه فصلی..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors resize-none"
              />
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
                {submitting ? 'در حال ثبت...' : 'ثبت استثنای موقت'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
