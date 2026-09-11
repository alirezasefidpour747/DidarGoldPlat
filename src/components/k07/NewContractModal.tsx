/**
 * Didar Gold Platform - Domain K07
 * New Partnership Agreement Modal
 */

import React, { useState } from 'react';
import { X, FileText, Scale, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { SupplierPartnership, AgreementType, PartnershipAgreement } from '../../types/k07.js';

interface NewContractModalProps {
  isOpen: boolean;
  suppliers: SupplierPartnership[];
  preselectedSupplierId?: string;
  onClose: () => void;
  onSave: (payload: Partial<PartnershipAgreement>) => Promise<void>;
}

export const NewContractModal: React.FC<NewContractModalProps> = ({
  isOpen,
  suppliers,
  preselectedSupplierId,
  onClose,
  onSave
}) => {
  const [supplierId, setSupplierId] = useState(preselectedSupplierId || (suppliers[0]?.id ?? ''));
  const [agreementType, setAgreementType] = useState<AgreementType>('consignment_hypothecation');
  const [titleFa, setTitleFa] = useState('قرارداد امانی و ترهین طلای خام جهت تولید النگو و زنجیر');
  const [consignmentLimitGrams, setConsignmentLimitGrams] = useState(15000);
  const [maxDeliveryLeadDays, setMaxDeliveryLeadDays] = useState(7);
  const [allowableKasriPercent, setAllowableKasriPercent] = useState(0.2);
  const [makingChargeFormulaFa, setMakingChargeFormulaFa] = useState('اجرت پایه ۲۴۰,۰۰۰ تومان/گرم + هزینه طراحی‌های خاص');
  const [settlementWindowDays, setSettlementWindowDays] = useState(10);
  const [startDateFa, setStartDateFa] = useState('۱۴۰۵/۰۱/۰۱');
  const [endDateFa, setEndDateFa] = useState('۱۴۰۶/۰۱/۰۱');
  const [renewalTermsFa, setRenewalTermsFa] = useState('تمدید خودکار سالانه در صورت کسب نمره ممیزی بالای ۹۰');
  const [signedBySupplierName, setSignedBySupplierName] = useState('مدیرعامل کارگاه');
  const [termsText, setTermsText] = useState(
    'رعایت عیار رسمی استاندارد ۷۵۰ با تلورانس حداکثر ۰.۵ در هزار.\nتحویل فیزیکی بسته‌ها با پلمپ امنیتی و بارنامه الکترونیکی دیدار.\nتسویه مانده طلا در پایان دوره مالی ماهانه با گزارش رسمی کسر بار.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === supplierId);
    if (!sup) {
      setError('لطفاً کارگاه طرف قرارداد را انتخاب فرمایید.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSave({
        supplierId: sup.id,
        supplierNameFa: sup.nameFa,
        agreementType,
        titleFa: titleFa.trim(),
        consignmentLimitGrams: Number(consignmentLimitGrams),
        maxDeliveryLeadDays: Number(maxDeliveryLeadDays),
        allowableKasriPercent: Number(allowableKasriPercent),
        makingChargeFormulaFa: makingChargeFormulaFa.trim(),
        settlementWindowDays: Number(settlementWindowDays),
        startDateFa: startDateFa.trim(),
        endDateFa: endDateFa.trim(),
        renewalTermsFa: renewalTermsFa.trim(),
        signedBySupplierName: signedBySupplierName.trim(),
        termsAndConditionsFa: termsText.split('\n').map((t) => t.trim()).filter(Boolean)
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت قرارداد.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181822] border border-[#2B2B3C] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-[#262636] bg-[#14141E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C8A951]/20 text-[#E5C365] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">انعقاد قرارداد همکاری و ترهین طلای کارگاهی</h3>
              <p className="text-[11px] text-[#8E8E9F]">تنظیم سقف امانی طلا، بازه تحویل، درصد کسر بار و فرمول محاسبه اجرت</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">کارگاه طرف قرارداد *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameFa} ({s.supplierCode} - سقف فعلی: {s.totalConsignmentLimitGrams.toLocaleString('fa-IR')} گرم)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">نوع ماهیت حقوقی قرارداد *</label>
              <select
                value={agreementType}
                onChange={(e) => setAgreementType(e.target.value as AgreementType)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
              >
                <option value="consignment_hypothecation">قرارداد امانی و ترهین طلای خام (Consignment Hypothecation)</option>
                <option value="contract_manufacturing">قرارداد پیمانکاری ساخت سفارشی (Toll Manufacturing)</option>
                <option value="gold_swap_barter">قرارداد تهاتر وزنی شمش آبشده در برابر مصنوعات</option>
                <option value="outright_purchase">خرید قطعی بنکداری و تأمین آماده</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">عنوان کامل موضوع قرارداد *</label>
            <input
              type="text"
              value={titleFa}
              onChange={(e) => setTitleFa(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">سقف طلای امانی قرارداد (گرم) *</label>
              <input
                type="number"
                value={consignmentLimitGrams}
                onChange={(e) => setConsignmentLimitGrams(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">حداکثر مهلت تحویل سفارش (روز)</label>
              <input
                type="number"
                value={maxDeliveryLeadDays}
                onChange={(e) => setMaxDeliveryLeadDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">درصد کسر بار استاندارد مجاز (٪)</label>
              <input
                type="number"
                step="0.01"
                value={allowableKasriPercent}
                onChange={(e) => setAllowableKasriPercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">فرمول یا نرخ ساخت و اجرت</label>
              <input
                type="text"
                value={makingChargeFormulaFa}
                onChange={(e) => setMakingChargeFormulaFa(e.target.value)}
                placeholder="مثلاً: اجرت پایه ۲۴۰,۰۰۰ تومان/گرم"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">دوره موازنه و تسویه مانده طلا (روز)</label>
              <input
                type="number"
                value={settlementWindowDays}
                onChange={(e) => setSettlementWindowDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">تاریخ شروع قرارداد</label>
              <input
                type="text"
                value={startDateFa}
                onChange={(e) => setStartDateFa(e.target.value)}
                placeholder="۱۴۰۵/۰۱/۰۱"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">تاریخ انقضای قرارداد</label>
              <input
                type="text"
                value={endDateFa}
                onChange={(e) => setEndDateFa(e.target.value)}
                placeholder="۱۴۰۶/۰۱/۰۱"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">امضا کننده از طرف کارگاه</label>
              <input
                type="text"
                value={signedBySupplierName}
                onChange={(e) => setSignedBySupplierName(e.target.value)}
                placeholder="نام مدیرعامل"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">شرایط تمدید و خاتمه</label>
            <input
              type="text"
              value={renewalTermsFa}
              onChange={(e) => setRenewalTermsFa(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">بندها و شروط کلیدی قرارداد (هر خط یک بند)</label>
            <textarea
              rows={3}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
            />
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
              {submitting ? 'در حال ثبت قرارداد...' : 'ثبت و ابلاغ قرارداد رسمی'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
