/**
 * Didar Gold Platform - Domain K07
 * Add Collateral & Financial Guarantee Modal
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Scale, Landmark, FileCheck } from 'lucide-react';
import { SupplierPartnership, CollateralType, SupplierCollateral } from '../../types/k07.js';

interface AddCollateralModalProps {
  isOpen: boolean;
  suppliers: SupplierPartnership[];
  preselectedSupplierId?: string;
  onClose: () => void;
  onSave: (payload: Partial<SupplierCollateral>) => Promise<void>;
}

export const AddCollateralModal: React.FC<AddCollateralModalProps> = ({
  isOpen,
  suppliers,
  preselectedSupplierId,
  onClose,
  onSave
}) => {
  const [supplierId, setSupplierId] = useState(preselectedSupplierId || (suppliers[0]?.id ?? ''));
  const [collateralType, setCollateralType] = useState<CollateralType>('sayad_cheque');
  const [titleFa, setTitleFa] = useState('چک صیادی بنفش ضمانت تعهدات کارگاهی و تحویل مصنوعات');
  const [nominalValueToman, setNominalValueToman] = useState(50000000000);
  const [equivalentGoldGrams, setEquivalentGoldGrams] = useState(8000);
  const [issueDateFa, setIssueDateFa] = useState('۱۴۰۵/۰۱/۱۵');
  const [expiryDateFa, setExpiryDateFa] = useState('۱۴۰۶/۰۱/۱۵');
  const [issuingBankOrNotaryFa, setIssuingBankOrNotaryFa] = useState('بانک ملت، شعبه بازار بزرگ تهران');
  const [trackingReferenceNumber, setTrackingReferenceNumber] = useState('SAYAD-44091-8821');
  const [notes, setNotes] = useState('چک در سامانه صیاد بانک مرکزی به نام شرکت ثبت شده و لاشه فیزیکی به صندوق امن تحویل گردید.');
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
        collateralType,
        titleFa: titleFa.trim(),
        nominalValueToman: Number(nominalValueToman),
        equivalentGoldGrams: Number(equivalentGoldGrams),
        issueDateFa: issueDateFa.trim(),
        expiryDateFa: expiryDateFa.trim(),
        issuingBankOrNotaryFa: issuingBankOrNotaryFa.trim(),
        trackingReferenceNumber: trackingReferenceNumber.trim(),
        notes: notes.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت وثیقه.');
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ثبت وثیقه و تضامین زرگری کارگاه</h3>
              <p className="text-[11px] text-[#8E8E9F]">ثبت چک صیادی بنفش، شمش طلا در خزانه، ضمانت‌نامه بانکی یا سند ملکی</p>
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
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">کارگاه تودیع‌کننده وثیقه *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameFa} ({s.supplierCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">نوع وثیقه و ابزار تضمین *</label>
              <select
                value={collateralType}
                onChange={(e) => setCollateralType(e.target.value as CollateralType)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
              >
                <option value="sayad_cheque">چک صیادی بنفش ثبتی (Sayad Cheque)</option>
                <option value="bullion_escrow">سپرده شمش طلای ۹۹۵ در خزانه امن دیدار (Bullion Escrow)</option>
                <option value="bank_guarantee">ضمانت‌نامه بانکی تعهد پرداخت (Bank Guarantee)</option>
                <option value="property_mortgage">ترهین رسمی سند ملکی عرصه و اعیان (Mortgage)</option>
                <option value="peer_cosigner">ضمانت صنفی معتمدین بازار طلا (Market Peer Co-signer)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">عنوان و شرح خلاصه وثیقه *</label>
            <input
              type="text"
              value={titleFa}
              onChange={(e) => setTitleFa(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">ارزش اسمی ریالی وثیقه (تومان) *</label>
              <input
                type="number"
                value={nominalValueToman}
                onChange={(e) => setNominalValueToman(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">معادل وزنی طلا در تضامین (گرم) *</label>
              <input
                type="number"
                value={equivalentGoldGrams}
                onChange={(e) => setEquivalentGoldGrams(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">بانک صادرکننده / دفتر اسناد رسمی / خزانه</label>
              <input
                type="text"
                value={issuingBankOrNotaryFa}
                onChange={(e) => setIssuingBankOrNotaryFa(e.target.value)}
                placeholder="مثلاً: بانک ملت، شعبه بازار تهران"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">شناسه صیادی ۱۶ رقمی / شماره پیگیری سند</label>
              <input
                type="text"
                value={trackingReferenceNumber}
                onChange={(e) => setTrackingReferenceNumber(e.target.value)}
                placeholder="مثلاً: SAYAD-9910-8841-20"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">تاریخ صدور وثیقه</label>
              <input
                type="text"
                value={issueDateFa}
                onChange={(e) => setIssueDateFa(e.target.value)}
                placeholder="۱۴۰۵/۰۱/۱۵"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">تاریخ سررسید / انقضای اعتبار</label>
              <input
                type="text"
                value={expiryDateFa}
                onChange={(e) => setExpiryDateFa(e.target.value)}
                placeholder="۱۴۰۶/۰۱/۱۵"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">شرح وضعیت فیزیکی و یادداشت نگهداری</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: لاشه چک در صندوق نسوز شماره ۴ نگهداری می‌گردد..."
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
              {submitting ? 'در حال ثبت...' : 'تأیید و افزودن وثیقه به پرونده'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
