/**
 * Didar Gold Platform - Kernel 17 (K17)
 * Stolen & Loss Incident Registration Modal
 * (فرم اعلام سرقت و قفل امنیتی قطعه در سامانه حراست و پلیس)
 */

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Lock,
  FileCheck,
  Building,
  User,
  Phone,
  HelpCircle
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { StolenReport } from '../../types/k17.js';

interface StolenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemUid: string;
  defaultReporterName?: string;
  defaultReporterMobile?: string;
  onSuccess: (report: StolenReport, message: string) => void;
}

export const StolenReportModal: React.FC<StolenReportModalProps> = ({
  isOpen,
  onClose,
  itemUid,
  defaultReporterName = '',
  defaultReporterMobile = '',
  onSuccess
}) => {
  const [reporterNameFa, setReporterNameFa] = useState(defaultReporterName);
  const [reporterMobile, setReporterMobile] = useState(defaultReporterMobile);
  const [policeStationFa, setPoliceStationFa] = useState('کلانتری ۱۰۳ گاندی تهران');
  const [policeCaseNumber, setPoliceCaseNumber] = useState('');
  const [descriptionFa, setDescriptionFa] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!itemUid.trim()) {
      setError('شناسه قطعه (UID) الزامی است.');
      return;
    }
    if (!reporterNameFa.trim()) {
      setError('نام گزارش‌دهنده سرقت الزامی است.');
      return;
    }
    if (!policeStationFa.trim() || !policeCaseNumber.trim()) {
      setError('نام کلانتری و شماره پرونده انتظامی الزامی است.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.reportK17Stolen({
        itemUid: itemUid.trim(),
        reporterNameFa: reporterNameFa.trim(),
        reporterMobile: reporterMobile.trim(),
        policeStationFa: policeStationFa.trim(),
        policeCaseNumber: policeCaseNumber.trim(),
        descriptionFa: descriptionFa.trim()
      });

      if (res.success) {
        onSuccess(res.report, res.message);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت هشدار سرقت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#181822] border-2 border-[#E5484D]/60 rounded-3xl shadow-2xl shadow-[#E5484D]/20 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#26171A] border-b border-[#E5484D]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E5484D]/20 border border-[#E5484D]/40 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-[#FF8B8B]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FF8B8B]">
                اعلام سرقت یا مفقودی قطعه طلا (K17)
              </h3>
              <p className="text-[11px] text-[#A57878]">
                قفل سراسری سند و ارسال هشدار خودکار به کلیه ویترین‌ها و کیوسک‌های طلا
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#321C20] text-[#A57878] hover:text-[#EDEDED] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-[#E5484D]/20 border border-[#E5484D]/40 text-[#FF8B8B] text-xs">
              {error}
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-[#201518] border border-[#3E2127] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-[#A57878]">شناسه یکتای قطعه طلا (UID):</span>
              <span className="font-mono font-bold text-xs text-[#E5C365]">{itemUid}</span>
            </div>
            <p className="text-[11px] text-[#A57878] leading-relaxed">
              با ثبت این فرم، سند مالکیت این قطعه در حالت <strong className="text-[#FF8B8B]">«مسروقه / قفل حراستی»</strong> قرار گرفته و هرگونه استعلام در طلافروشی‌ها یا انتقال سند، فوراً زنگ هشدار پلیس را فعال خواهد کرد.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#8E8EA0] mb-1">
                نام و نام خانوادگی گزارش‌دهنده (مالک یا شاکی) *
              </label>
              <input
                type="text"
                value={reporterNameFa}
                onChange={(e) => setReporterNameFa(e.target.value)}
                placeholder="مثال: علی حسینی"
                required
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#E5484D] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  شماره موبایل گزارش‌دهنده
                </label>
                <input
                  type="tel"
                  value={reporterMobile}
                  onChange={(e) => setReporterMobile(e.target.value)}
                  placeholder="09121112233"
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs font-mono focus:border-[#E5484D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  مرجع انتظامی / کلانتری *
                </label>
                <input
                  type="text"
                  value={policeStationFa}
                  onChange={(e) => setPoliceStationFa(e.target.value)}
                  placeholder="کلانتری ۱۰۳ گاندی"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#E5484D] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#8E8EA0] mb-1">
                شماره پرونده یا کلاسه انتظامی *
              </label>
              <input
                type="text"
                value={policeCaseNumber}
                onChange={(e) => setPoliceCaseNumber(e.target.value)}
                placeholder="مثال: ۱۴۰۴-پ-۸۸۷۲"
                required
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs font-mono focus:border-[#E5484D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#8E8EA0] mb-1">
                شرح واقعه و محل سرقت
              </label>
              <textarea
                rows={2}
                value={descriptionFa}
                onChange={(e) => setDescriptionFa(e.target.value)}
                placeholder="توضیحات تکمیلی پیرامون سرقت یا مفقودی..."
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#E5484D] focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#262634]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#222230] text-[#8E8EA0] text-xs"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#E5484D] hover:bg-[#D93D42] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'در حال ثبت هشدار...' : 'قفل قطعه و فعال‌سازی اعلام سرقت'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
