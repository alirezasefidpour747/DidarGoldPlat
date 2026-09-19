import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  QrCode,
  Scale,
  Award,
  Lock,
  Building2,
  Calendar,
  User
} from 'lucide-react';
import { api } from '../../lib/api';
import { UniqueItemPassport, ProvenanceEvent } from '../../types/k06';

interface PublicVerificationModalProps {
  onClose: () => void;
  initialQuery?: string;
}

export const PublicVerificationModal: React.FC<PublicVerificationModalProps> = ({
  onClose,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery || 'DID-AU750-2026-8820-001');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    searched: boolean;
    found: boolean;
    passport?: UniqueItemPassport;
    events?: ProvenanceEvent[];
    verificationMessage: string;
    isAuthentic: boolean;
    isStolen: boolean;
  } | null>(null);

  const sampleQueries = [
    { label: 'النگو صفوی (معتبر)', code: 'DID-AU750-2026-8820-001' },
    { label: 'انگشتر سولیتر (در خزانه)', code: 'DID-AU750-2026-1045-014' },
    { label: 'زنجیر کارتیه (مسروقه)', code: 'DID-AU750-2026-4020-089' },
    { label: 'کد نامعتبر / جعلی', code: 'FAKE-GOLD-750-999' }
  ];

  const handleVerify = async (searchTerm?: string) => {
    const q = (searchTerm || query).trim();
    if (!q) return;

    setLoading(true);
    try {
      const res = await api.verifyPublicLookup(q);
      setResult({
        searched: true,
        ...res
      });
    } catch (err: any) {
      setResult({
        searched: true,
        found: false,
        verificationMessage: err.message || 'خطا در ارتباط با سرور استعلام اصالت.',
        isAuthentic: false,
        isStolen: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-2xl bg-[#161622] rounded-2xl shadow-2xl border border-[#28283C] overflow-hidden my-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151520] border-b border-[#28283C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A951]/15 text-[#E5C365] flex items-center justify-center border border-[#C8A951]/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">سامانه عمومی استعلام اصالت و رمزنگاری طلا</h3>
              <p className="text-xs text-[#A0A0B5]">
                پرتال اسکن QR، بارکد یا شناسه یکتای پلاک جهت احراز اصالت و پیشگیری از معامله مال مسروقه
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

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Search Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#EDEDED]">
              شناسه یکتا (UID)، کد سریال، کد انگ یا شناسه NFC قطعه:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="مثال: DID-AU750-2026-8820-001"
                  className="w-full text-xs font-mono px-4 py-2.5 bg-[#191926] border border-[#28283C] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951] pl-10"
                />
                <Search className="w-4 h-4 text-[#828299] absolute left-3 top-3" />
              </div>
              <button
                onClick={() => handleVerify()}
                disabled={loading}
                className="px-6 py-2.5 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? 'در حال بررسی...' : 'استعلام اصالت'}
              </button>
            </div>

            {/* Samples */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[#828299] text-[11px]">نمونه‌های تست:</span>
              {sampleQueries.map((s) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => {
                    setQuery(s.code);
                    handleVerify(s.code);
                  }}
                  className="px-2.5 py-1 text-[11px] bg-[#191926] hover:bg-[#222234] text-[#EDEDED] hover:text-[#E5C365] rounded-lg font-medium transition-colors border border-[#28283C]"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Verification Results Display */}
          {result && result.searched && (
            <div className="pt-2 space-y-4">
              {/* STATUS 1: STOLEN ALERT */}
              {result.isStolen && result.passport && (
                <div className="p-5 rounded-2xl bg-[#2A1517] border-2 border-[#E5484D] shadow-md space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#E5484D] text-white flex items-center justify-center animate-bounce">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#FF8B8B]">
                        هشدار فوری: قطعه طلا دارای پرچم سرقت / مفقودی است
                      </h4>
                      <p className="text-xs text-[#FFA4A4] mt-0.5">
                        این شناسه در سامانه متمرکز پیشگیری از خرید مال مسروقه صنف طلا علامت‌گذاری شده است.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#191926] rounded-xl border border-[#E5484D]/40 text-xs text-[#EDEDED] space-y-1">
                    <p className="font-semibold text-[#FF8B8B]">
                      خرید، تعویض یا ذوب این قطعه غیرقانونی بوده و موجب پیگرد قضایی می‌گردد.
                    </p>
                    <p className="text-[#A0A0B5]">
                      مشخصات مصنوع: {result.passport.productTitleFa} ({result.passport.actualScaleWeightGrams} گرم)
                    </p>
                    <p className="text-[#A0A0B5]">علت ثبت: {result.passport.stolenReportReason}</p>
                    <p className="text-[#828299] font-mono text-[11px]">
                      کد پیگیری انتظامی: {result.passport.uid}
                    </p>
                  </div>
                </div>
              )}

              {/* STATUS 2: 100% AUTHENTIC VERIFIED */}
              {!result.isStolen && result.found && result.passport && (
                <div className="p-5 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/50 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">
                            اصالت و شناسنامه طلا ۱۰۰٪ تأیید گردید
                          </h4>
                          <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            گواهی معتبر
                          </span>
                        </div>
                        <p className="text-xs text-emerald-400 mt-0.5">
                          تأییدشده توسط شبکه سراسری دیدار گلد و اتحادیه طلا و جواهر
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Details Card */}
                  <div className="bg-[#191926] p-4 rounded-xl border border-[#28283C] space-y-3">
                    <div className="text-sm font-bold text-white">
                      {result.passport.productTitleFa}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-[#161622] border border-[#28283C] rounded-lg">
                        <span className="text-[#828299] block text-[11px]">وزن واقعی ترازو:</span>
                        <span className="font-bold text-white font-mono text-sm">
                          {Number(result.passport.actualScaleWeightGrams || 0).toFixed(3)} گرم
                        </span>
                      </div>

                      <div className="p-2.5 bg-[#161622] border border-[#28283C] rounded-lg">
                        <span className="text-[#828299] block text-[11px]">عیار رسمی ری‌گیری:</span>
                        <span className="font-bold text-[#E5C365] font-mono text-sm">
                          {result.passport.certifiedFineness} / ۱۰۰۰
                        </span>
                      </div>

                      <div className="p-2.5 bg-[#161622] border border-[#28283C] rounded-lg">
                        <span className="text-[#828299] block text-[11px]">کد انگ آزمایشگاه:</span>
                        <span className="font-bold text-white font-mono text-sm">
                          {result.passport.hallmarkCode}
                        </span>
                      </div>

                      <div className="p-2.5 bg-[#161622] border border-[#28283C] rounded-lg">
                        <span className="text-[#828299] block text-[11px]">امتیاز کیفیت QC:</span>
                        <span className="font-bold text-[#3DD68C] font-mono text-sm">
                          {result.passport.qcScore}٪ (A+)
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#28283C] flex flex-wrap items-center justify-between gap-2 text-xs text-[#A0A0B5]">
                      <div>
                        آزمایشگاه ری‌گیری:{' '}
                        <span className="font-semibold text-white">
                          {result.passport.assayLabName}
                        </span>
                      </div>
                      <div>
                        حکاکی لیزری:{' '}
                        <span className="font-mono font-bold text-white">
                          {result.passport.laserEngravingText}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-[#828299] flex items-center gap-1.5 font-mono">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    چک‌سام SHA-256 ترازوی هوشمند: {result.passport.cryptographicHash.slice(0, 24)}...
                  </div>
                </div>
              )}

              {/* STATUS 3: NOT FOUND / UNVERIFIED */}
              {!result.found && (
                <div className="p-5 rounded-2xl bg-[#2A2415] border-2 border-[#C8A951]/60 space-y-2">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-[#E5C365] shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-[#E5C365]">
                        شناسنامه معتبری با این مشخصات یافت نشد
                      </h4>
                      <p className="text-xs text-[#D1B875] mt-0.5">{result.verificationMessage}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#A0A0B5] pt-2 border-t border-[#C8A951]/20">
                    توصیه: در صورت خرید طلا، قبل از تسویه فاکتور از فروشنده بخواهید شناسنامه دیجیتال را در پرتال دیدار گلد احراز نماید.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151520] border-t border-[#28283C]">
          <span className="text-xs text-[#828299]">پشتیبانی سراسری اصالت دیدار: ۰۲۱-۸۸۴۵۰۰۰۰</span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-[#191926] hover:bg-[#222234] text-[#EDEDED] border border-[#28283C] rounded-xl transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
