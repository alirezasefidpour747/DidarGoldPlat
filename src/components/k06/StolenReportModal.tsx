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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-lg bg-[#161622] rounded-2xl shadow-2xl border border-[#28283C] overflow-hidden my-8 text-white">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 text-white border-b border-[#28283C] ${
            isCurrentlyStolen
              ? 'bg-[#151520]'
              : 'bg-[#151520]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isCurrentlyStolen
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-[#E5484D]/15 text-[#FF6B6B] border-[#E5484D]/30'
            }`}>
              {isCurrentlyStolen ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[#FF6B6B]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isCurrentlyStolen
                  ? 'رفع پرچم سرقت و بازگشت به وضعیت عادی'
                  : 'ثبت اعلام سرقت / مفقودی در شبکه سراسری'}
              </h3>
              <p className="text-xs text-[#A0A0B5]">
                سامانه کشوری پیشگیری از معامله طلای مسروقه دیدار گلد
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A0A0B5] hover:text-white hover:bg-[#222234] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#2A1517] border border-[#E5484D]/40 rounded-xl text-xs text-[#FF8B8B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FF6B6B]" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-[#191926] border border-[#28283C] rounded-xl text-xs space-y-1">
            <div className="font-bold text-white">{passport.productTitleFa}</div>
            <div className="text-[#A0A0B5] font-mono">
              UID: {passport.uid} | عیار: {passport.certifiedFineness} | وزن:{' '}
              {passport.actualScaleWeightGrams} گرم
            </div>
            {passport.currentOwnerName && (
              <div className="text-[#EDEDED]">مالک ثبت‌شده: {passport.currentOwnerName}</div>
            )}
          </div>

          {!isCurrentlyStolen ? (
            <>
              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  علت و شرح واقعه سرقت / مفقودی <span className="text-[#FF6B6B]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="مثال: دستبرد به منزل یا کیف‌قاپی در محدوده خیابان کریمخان تهران..."
                  className="w-full text-xs px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#E5484D]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  شماره پرونده کلانتری یا آگاهی (در صورت وجود)
                </label>
                <input
                  type="text"
                  value={policeReportNo}
                  onChange={(e) => setPoliceReportNo(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>

              <div className="p-3 bg-[#2A1517] border border-[#E5484D]/40 rounded-xl text-xs text-[#FFA4A4] space-y-1">
                <p className="font-semibold text-[#FF8B8B]">اثر فوری ثبت در شبکه:</p>
                <p>
                  با ثبت این گزارش، در صورت استعلام شناسه توسط هر طلافروشی در سراسر کشور یا تلاش برای ذوب قطعه، پرچم هشدار قرمز و شماره تماس انتظامی بلافاصله نمایش داده می‌شود.
                </p>
              </div>
            </>
          ) : (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-2">
              <p className="font-semibold text-emerald-400">
                آیا از احراز اصالت و رفع پرچم سرقت این قطعه اطمینان دارید؟
              </p>
              <p className="text-emerald-300/80">
                با تأیید این عمل، قطعه طلا از لیست سیاه کشوری خارج شده و وضعیت شناسنامه به حالت عادی بازگردانده می‌شود.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#28283C]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#EDEDED] bg-[#191926] border border-[#28283C] rounded-lg hover:bg-[#222234] transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 ${
                isCurrentlyStolen
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#E5484D] hover:bg-[#E5484D]/80 text-white'
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
