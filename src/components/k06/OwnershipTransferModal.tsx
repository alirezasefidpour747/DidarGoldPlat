import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  FileText,
  AlertCircle,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { UniqueItemPassport } from '../../types/k06';

interface OwnershipTransferModalProps {
  passport: UniqueItemPassport;
  onClose: () => void;
  onSubmit: (data: {
    passportId: string;
    ownerName: string;
    ownerNationalCode: string;
    ownerPhone: string;
    retailInvoiceNumber: string;
    storeName: string;
    notes?: string;
  }) => Promise<void>;
}

export const OwnershipTransferModal: React.FC<OwnershipTransferModalProps> = ({
  passport,
  onClose,
  onSubmit
}) => {
  const [ownerName, setOwnerName] = useState('');
  const [ownerNationalCode, setOwnerNationalCode] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [retailInvoiceNumber, setRetailInvoiceNumber] = useState(
    `INV-GLR-${Math.floor(Math.random() * 89999 + 10000)}`
  );
  const [storeName, setStoreName] = useState(
    passport.currentHolderName || 'گالری طلا و جواهر درخشان'
  );
  const [notes, setNotes] = useState('تحویل حضوری با جعبه اختصاصی و شناسنامه دیجیتال فعال.');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      setError('نام و نام خانوادگی خریدار الزامی است.');
      return;
    }
    if (!ownerNationalCode.trim() || ownerNationalCode.length < 10) {
      setError('کد ملی خریدار باید ۱۰ رقم معتبر باشد.');
      return;
    }
    if (!retailInvoiceNumber.trim()) {
      setError('شماره فاکتور رسمی فروشگاه الزامی است.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        passportId: passport.id,
        ownerName: ownerName.trim(),
        ownerNationalCode: ownerNationalCode.trim(),
        ownerPhone: ownerPhone.trim(),
        retailInvoiceNumber: retailInvoiceNumber.trim(),
        storeName: storeName.trim(),
        notes
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت انتقال مالکیت.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">ثبت انتقال مالکیت طلا (Certificate Issuance)</h3>
              <p className="text-xs text-emerald-100">
                صدور سند دیجیتال مالکیت و فعال‌سازی گارانتی برای خریدار
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Item Summary */}
        <div className="px-6 py-3 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800">{passport.productTitleFa}</span>
            <span className="text-slate-500 block">
              وزن: {Number(passport.actualScaleWeightGrams || 0).toFixed(3)}g | عیار: {passport.certifiedFineness}
            </span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
            {passport.uid}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              نام و نام خانوادگی خریدار نهایی <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: خانم مریم صادقی"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                کد ملی خریدار (جهت ماسک و ثبت سند) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="۱۰ رقم کد ملی"
                maxLength={10}
                value={ownerNationalCode}
                onChange={(e) => setOwnerNationalCode(e.target.value)}
                required
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                شماره همراه خریدار (جهت ارسال پیامک سند)
              </label>
              <input
                type="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                شماره فاکتور رسمی طلافروشی <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={retailInvoiceNumber}
                onChange={(e) => setRetailInvoiceNumber(e.target.value)}
                required
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                نام گالری طلا صادرکننده فاکتور
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              توضیحات و شرایط فروش
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              با تأیید این انتقال، ۲ سال گارانتی رسمی اصالت دیدار گلد فعال شده و این سند به عنوان واقعه نهایی به دفتر کل زنجیره اصالت افزوده می‌شود.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <span>در حال ثبت...</span> : 'تأیید و صدور سند مالکیت'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
