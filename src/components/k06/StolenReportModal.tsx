import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldCheck,
  FileText,
  AlertCircle
} from 'lucide-react';
import { UniqueItemPassport } from '../../types/k06';

interface StolenReportModalProps {
  passport: UniqueItemPassport;
  onClose: () => void;
  onSubmit: (data: {
    passportId: string;
    isStolen: boolean;
    reason?: string;
    policeReportNo?: string;
  }) => Promise<void>;
}

export const StolenReportModal: React.FC<StolenReportModalProps> = ({
  passport,
  onClose,
  onSubmit
}) => {
  const isCurrentlyStolen = passport.isStolenReported;
  const [reason, setReason] = useState(
    isCurrentlyStolen ? '' : 'گزارش مفقودی / سرقت توسط مالک قطعه طلا'
  );
  const [policeReportNo, setPoliceReportNo] = useState(
    isCurrentlyStolen ? '' : `CRIME-${Math.floor(Math.random() * 89999 + 10000)}`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        passportId: passport.id,
        isStolen: !isCurrentlyStolen,
        reason: isCurrentlyStolen ? undefined : reason.trim(),
        policeReportNo: isCurrentlyStolen ? undefined : policeReportNo.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت وضعیت سرقت.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 text-white ${
            isCurrentlyStolen
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
              : 'bg-gradient-to-r from-rose-600 to-red-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {isCurrentlyStolen ? (
                <ShieldCheck className="w-5 h-5 text-white" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isCurrentlyStolen
                  ? 'رفع پرچم سرقت و بازگشت به وضعیت عادی'
                  : 'ثبت اعلام سرقت / مفقودی در شبکه سراسری'}
              </h3>
              <p className="text-xs text-white/80">
                سامانه کشوری پیشگیری از معامله طلای مسروقه دیدار گلد
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-slate-900">{passport.productTitleFa}</div>
            <div className="text-slate-500 font-mono">
              UID: {passport.uid} | عیار: {passport.certifiedFineness} | وزن:{' '}
              {passport.actualScaleWeightGrams} گرم
            </div>
            {passport.currentOwnerName && (
              <div className="text-slate-700">مالک ثبت‌شده: {passport.currentOwnerName}</div>
            )}
          </div>

          {!isCurrentlyStolen ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  علت و شرح واقعه سرقت / مفقودی <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="مثال: دستبرد به منزل یا کیف‌قاپی در محدوده خیابان کریمخان تهران..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  شماره پرونده کلانتری یا آگاهی (در صورت وجود)
                </label>
                <input
                  type="text"
                  value={policeReportNo}
                  onChange={(e) => setPoliceReportNo(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                <p className="font-semibold">اثر فوری ثبت در شبکه:</p>
                <p>
                  با ثبت این گزارش، در صورت استعلام شناسه توسط هر طلافروشی در سراسر کشور یا تلاش برای ذوب قطعه، پرچم هشدار قرمز و شماره تماس انتظامی بلافاصله نمایش داده می‌شود.
                </p>
              </div>
            </>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
              <p className="font-semibold">
                آیا از احراز اصالت و رفع پرچم سرقت این قطعه اطمینان دارید؟
              </p>
              <p className="text-emerald-700">
                با تأیید این عمل، قطعه طلا از لیست سیاه کشوری خارج شده و وضعیت شناسنامه به حالت عادی بازگردانده می‌شود.
              </p>
            </div>
          )}

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
              className={`px-6 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 ${
                isCurrentlyStolen
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {loading
                ? 'در حال پردازش...'
                : isCurrentlyStolen
                ? 'تأیید رفع پرچم سرقت'
                : 'ثبت قطعی در لیست سیاه'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
