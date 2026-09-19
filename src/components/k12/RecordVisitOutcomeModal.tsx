/**
 * Didar Gold Platform - Kernel Domain K12
 * RecordVisitOutcomeModal: ثبت و استعلام خروجی مراجعه مأمور (رفت / نرفت بر اساس فاکتور زده / نزده)
 * 
 * Unified Dark Luxury Gold Theme (#161622, #151520, #191926, #28283C, #C8A951, #E5C365)
 */

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  Scale,
  Calendar,
  Clock,
  User,
  Store,
  X,
  ShieldAlert,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { FieldVisit } from '../../types/k12.js';
import { api } from '../../lib/api.js';
import { MasterDataItem } from '../../types/masterData.js';

interface RecordVisitOutcomeModalProps {
  visit: FieldVisit | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (visitId: string, outcomeData: {
    attendance: 'visited' | 'not_visited';
    invoiceStatus: 'invoiced' | 'no_invoice';
    invoiceNumber?: string;
    invoiceGoldGrams?: number;
    noInvoiceReasonFa?: string;
    notVisitedReasonFa?: string;
    agentNotesFa?: string;
  }) => Promise<void>;
}

export const RecordVisitOutcomeModal: React.FC<RecordVisitOutcomeModalProps> = ({
  visit,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [attendance, setAttendance] = useState<'visited' | 'not_visited'>('visited');
  const [invoiceStatus, setInvoiceStatus] = useState<'invoiced' | 'no_invoice'>('invoiced');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceGoldGrams, setInvoiceGoldGrams] = useState<string>('250.0');
  const [noInvoiceReasonFa, setNoInvoiceReasonFa] = useState('اختلاف در اجرت ساخت و درخواست تخفیف خارج از ضوابط');
  const [notVisitedReasonFa, setNotVisitedReasonFa] = useState('تعطیلی گالری یا عدم حضور صاحب پروانه در ساعت مقرر');
  const [agentNotesFa, setAgentNotesFa] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic reference dictionary lookups from Master Data
  const [invoiceReasons, setInvoiceReasons] = useState<MasterDataItem[]>([]);
  const [visitReasons, setVisitReasons] = useState<MasterDataItem[]>([]);
  const [isLoadingDictionaries, setIsLoadingDictionaries] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isSubscribed = true;
    const fetchDictionaries = async () => {
      try {
        setIsLoadingDictionaries(true);
        const [invRes, visitRes] = await Promise.all([
          api.getMasterItems('invoice_reasons', true),
          api.getMasterItems('visit_reasons', true)
        ]);
        if (isSubscribed) {
          const activeInv = invRes.filter(item => item.isActive);
          const activeVisit = visitRes.filter(item => item.isActive);
          setInvoiceReasons(activeInv);
          setVisitReasons(activeVisit);

          if (activeInv.length > 0 && !noInvoiceReasonFa) {
            setNoInvoiceReasonFa(activeInv[0].labelFa);
          }
          if (activeVisit.length > 0 && !notVisitedReasonFa) {
            setNotVisitedReasonFa(activeVisit[0].labelFa);
          }
        }
      } catch (e) {
        console.warn('Fallback to baseline reasons', e);
      } finally {
        if (isSubscribed) {
          setIsLoadingDictionaries(false);
        }
      }
    };

    fetchDictionaries();
    return () => {
      isSubscribed = false;
    };
  }, [isOpen]);

  if (!isOpen || !visit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      await onSubmit(visit.id, {
        attendance,
        invoiceStatus: attendance === 'visited' ? invoiceStatus : 'no_invoice',
        invoiceNumber: attendance === 'visited' && invoiceStatus === 'invoiced' ? (invoiceNumber.trim() || `INV-${Date.now().toString().slice(-4)}`) : undefined,
        invoiceGoldGrams: attendance === 'visited' && invoiceStatus === 'invoiced' ? parseFloat(invoiceGoldGrams) || 0 : undefined,
        noInvoiceReasonFa: attendance === 'visited' && invoiceStatus === 'no_invoice' ? noInvoiceReasonFa.trim() : undefined,
        notVisitedReasonFa: attendance === 'not_visited' ? notVisitedReasonFa.trim() : undefined,
        agentNotesFa: agentNotesFa.trim() || undefined
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ثبت نتیجه ویزیت');
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
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">ثبت نتیجه مراجعه و تطبیق فاکتور مأمور</h3>
              <p className="text-xs text-[#C8A951]">کد ویزیت: {visit.visitCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#28283C] hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Visit Context Summary */}
        <div className="p-4 mx-6 mt-4 rounded-xl bg-[#151520] border border-[#28283C] flex items-center justify-between text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <Store className="h-3.5 w-3.5 text-[#E5C365]" />
              <span>{visit.retailerTradeNameFa}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>مأمور مسئول: {visit.agentNameFa}</span>
            </div>
          </div>
          <div className="text-left space-y-1 font-mono text-slate-400">
            <div className="flex items-center justify-end gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{visit.scheduledDateFa}</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-[#C8A951]">
              <Clock className="h-3.5 w-3.5" />
              <span>{visit.scheduledTimeSlotFa}</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: آیا مأمور رفت یا نرفت؟ */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>۱. استعلام حضور و مراجعه فیزیکی مأمور به فروشگاه</span>
              <span className="text-[#E5C365]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAttendance('visited')}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-xs font-bold transition-all ${
                  attendance === 'visited'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 ring-1 ring-emerald-500/30 shadow-md shadow-emerald-950/40'
                    : 'bg-[#151520] border-[#28283C] text-slate-400 hover:text-slate-200 hover:bg-[#191926]'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>مراجعه حضوری انجام شد (رفت)</span>
              </button>

              <button
                type="button"
                onClick={() => setAttendance('not_visited')}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-xs font-bold transition-all ${
                  attendance === 'not_visited'
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-400 ring-1 ring-rose-500/30 shadow-md shadow-rose-950/40'
                    : 'bg-[#151520] border-[#28283C] text-slate-400 hover:text-slate-200 hover:bg-[#191926]'
                }`}
              >
                <XCircle className="h-4 w-4 text-rose-400" />
                <span>مراجعه انجام نشد (نرفت)</span>
              </button>
            </div>
          </div>

          {/* If Visited: STEP 2: آیا فاکتور زده شد یا نه؟ */}
          {attendance === 'visited' && (
            <div className="space-y-3 p-4 rounded-xl bg-[#151520] border border-[#28283C] animate-in fade-in duration-200">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-[#E5C365]" />
                <span>۲. وضعیت صدور فاکتور طلا در این مراجعه</span>
                <span className="text-[#E5C365]">*</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInvoiceStatus('invoiced')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                    invoiceStatus === 'invoiced'
                      ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#E5C365] font-bold ring-1 ring-[#C8A951]/40'
                      : 'bg-[#191926] border-[#28283C] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Receipt className="h-3.5 w-3.5 text-[#E5C365]" />
                  <span>فاکتور طلا صادر گردید (موفق)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInvoiceStatus('no_invoice')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                    invoiceStatus === 'no_invoice'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold ring-1 ring-amber-500/30'
                      : 'bg-[#191926] border-[#28283C] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>بدون صدور فاکتور (عدم خرید)</span>
                </button>
              </div>

              {/* Sub-details if Invoiced */}
              {invoiceStatus === 'invoiced' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300">شماره سریال فاکتور / حواله</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="INV-1403-9902"
                      className="w-full rounded-xl bg-[#191926] border border-[#28283C] px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C8A951]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300">وزن طلای فاکتور شده (گرم)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={invoiceGoldGrams}
                        onChange={(e) => setInvoiceGoldGrams(e.target.value)}
                        placeholder="250.0"
                        className="w-full rounded-xl bg-[#191926] border border-[#28283C] px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C8A951]"
                      />
                      <span className="absolute left-3 top-2 text-[10px] text-slate-400">گرم ۱۸ عیار</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-slate-300">دلیل عدم صدور فاکتور توسط مشتری</label>
                    <span className="text-[10px] text-[#C8A951] font-mono">
                      (تغذیه از واژه‌نامه پایه MDM)
                    </span>
                  </div>
                  <select
                    value={noInvoiceReasonFa}
                    onChange={(e) => setNoInvoiceReasonFa(e.target.value)}
                    className="w-full rounded-xl bg-[#191926] border border-[#28283C] px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#C8A951]"
                  >
                    {invoiceReasons.length > 0 ? (
                      invoiceReasons.map(item => (
                        <option key={item.id} value={item.labelFa}>
                          {item.labelFa}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="اختلاف در اجرت ساخت و درخواست تخفیف خارج از ضوابط">اختلاف در اجرت ساخت و درخواست تخفیف خارج از ضوابط</option>
                        <option value="کمبود نقدینگی و پر بودن سقف اعتبار خرید دفتری">کمبود نقدینگی و پر بودن سقف اعتبار خرید دفتری</option>
                        <option value="عدم تطابق النگوها و مدل‌های چمدان با سلیقه ویترین این ماه">عدم تطابق النگوها و مدل‌های چمدان با سلیقه ویترین این ماه</option>
                        <option value="بررسی در هیئت مدیره گالری و موکول به نوبت بعدی">بررسی در هیئت مدیره گالری و موکول به نوبت بعدی</option>
                        <option value="موجودی انبار مغازه کافی بود و نیاز به شارژ نداشت">موجودی انبار مغازه کافی بود و نیاز به شارژ نداشت</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* If NOT Visited: STEP 2: علت عدم مراجعه */}
          {attendance === 'not_visited' && (
            <div className="space-y-2 p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span>علت عدم مراجعه مأمور به این واحد صنفی</span>
                </label>
                <span className="text-[10px] text-rose-400 font-mono">
                  (تغذیه از واژه‌نامه پایه MDM)
                </span>
              </div>
              <select
                value={notVisitedReasonFa}
                onChange={(e) => setNotVisitedReasonFa(e.target.value)}
                className="w-full rounded-xl bg-[#151520] border border-rose-900/60 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              >
                {visitReasons.length > 0 ? (
                  visitReasons.map(item => (
                    <option key={item.id} value={item.labelFa}>
                      {item.labelFa}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="تعطیلی گالری یا عدم حضور صاحب پروانه در ساعت مقرر">تعطیلی گالری یا عدم حضور صاحب پروانه در ساعت مقرر</option>
                    <option value="اعلام انصراف تلفنی طلافروش پیش از ورود مأمور">اعلام انصراف تلفنی طلافروش پیش از ورود مأمور</option>
                    <option value="هشدار امنیتی راسته بازار یا اختلال در تردد اسکورت">هشدار امنیتی راسته بازار یا اختلال در تردد اسکورت</option>
                    <option value="تأخیر مأمور در مقصد قبلی و اتمام ساعات اداری بازار">تأخیر مأمور در مقصد قبلی و اتمام ساعات اداری بازار</option>
                    <option value="نقص مدارک هویتی یا پلمب امنیتی کیف">نقص مدارک هویتی یا پلمب امنیتی کیف</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Agent notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              توضیحات و گزارش تکمیلی ناظر / مأمور میدانی
            </label>
            <textarea
              rows={2}
              value={agentNotesFa}
              onChange={(e) => setAgentNotesFa(e.target.value)}
              placeholder="یادداشت‌های مذاکره یا مشاهدات بازار..."
              className="w-full rounded-xl bg-[#151520] border border-[#28283C] px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C8A951]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#28283C]">
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
                'در حال ثبت نتیجه...'
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  <span>ثبت قطعی وضعیت مراجعه و فاکتور</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
