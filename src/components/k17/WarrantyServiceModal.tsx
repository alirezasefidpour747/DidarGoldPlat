/**
 * Didar Gold Platform - Kernel 17 (K17)
 * Warranty Service & Maintenance Log Modal
 * (ثبت خدمات فنی و سرویس رایگان دوره‌ای تحت گارانتی طلایی)
 */

import React, { useState } from 'react';
import {
  X,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Coins,
  Building
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { WarrantyCard, WarrantyServiceLog } from '../../types/k17.js';

interface WarrantyServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  warranty: WarrantyCard | null;
  onSuccess: (serviceLog: WarrantyServiceLog, message: string) => void;
}

export const WarrantyServiceModal: React.FC<WarrantyServiceModalProps> = ({
  isOpen,
  onClose,
  warranty,
  onSuccess
}) => {
  const [serviceTypeFa, setServiceTypeFa] = useState('شستشو و جلای التراسونیک رایگان');
  const [workshopNameFa, setWorkshopNameFa] = useState('کارگاه ریخته‌گری و خدمات طلا دیدار (مرکز)');
  const [descriptionFa, setDescriptionFa] = useState('پولیش تخصصی و رفع خطوط سطحی به همراه التراسونیک حمام گرم');
  const [costToman, setCostToman] = useState<number>(0);
  const [wasFreeUnderWarranty, setWasFreeUnderWarranty] = useState<boolean>(true);
  const [officerNameFa, setOfficerNameFa] = useState('استاد حسین رضوی');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !warranty) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!serviceTypeFa.trim() || !descriptionFa.trim()) {
      setError('نوع خدمت و شرح اقدامات انجام‌شده الزامی است.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.addK17WarrantyService({
        warrantyId: warranty.id,
        serviceTypeFa: serviceTypeFa.trim(),
        workshopNameFa: workshopNameFa.trim(),
        descriptionFa: descriptionFa.trim(),
        costToman: Number(costToman) || 0,
        wasFreeUnderWarranty,
        officerNameFa: officerNameFa.trim()
      });

      if (res.success) {
        onSuccess(res.serviceLog, res.message);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت خدمت گارانتی');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#181822] border border-[#36364A] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1F1F2C] border-b border-[#2B2B3C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C8A951]/20 border border-[#C8A951]/40 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#E5C365]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#EDEDED]">
                ثبت خدمت فنی و سرویس دوره‌ای گارانتی (K17)
              </h3>
              <p className="text-[11px] text-[#8E8EA0]">
                کارت گارانتی: <span className="font-mono text-[#E5C365]">{warranty.warrantyNumber}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#242432] text-[#8E8EA0] hover:text-[#EDEDED] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 text-[#FF8B8B] text-xs">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#8E8EA0] mb-1">
                نوع خدمت فنی *
              </label>
              <select
                value={serviceTypeFa}
                onChange={(e) => setServiceTypeFa(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#C8A951] focus:outline-none"
              >
                <option value="شستشو و جلای التراسونیک رایگان">شستشو و جلای التراسونیک رایگان</option>
                <option value="بررسی و محکم‌سازی مخراجی نگین">بررسی و محکم‌سازی مخراجی نگین</option>
                <option value="تنظیم قفل و اتصالات مکانیکی">تنظیم قفل و اتصالات مکانیکی</option>
                <option value="پولیش مجدد و آبکاری رودیوم">پولیش مجدد و آبکاری رودیوم</option>
                <option value="آزمایش و تطبیق مجدد عیارسنجی">آزمایش و تطبیق مجدد عیارسنجی</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  کارگاه مجاز ارائه‌دهنده
                </label>
                <input
                  type="text"
                  value={workshopNameFa}
                  onChange={(e) => setWorkshopNameFa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  تکنسین / زرگر مجاز
                </label>
                <input
                  type="text"
                  value={officerNameFa}
                  onChange={(e) => setOfficerNameFa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#C8A951] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#8E8EA0] mb-1">
                شرح اقدامات انجام‌شده *
              </label>
              <textarea
                rows={2}
                value={descriptionFa}
                onChange={(e) => setDescriptionFa(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#C8A951] focus:outline-none resize-none"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-[#14141D] border border-[#262638] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[#EDEDED] block">پوشش رایگان گارانتی</span>
                <span className="text-[10px] text-[#8E8EA0]">آیا این خدمت بدون اخذ هزینه انجام گرفت؟</span>
              </div>
              <input
                type="checkbox"
                checked={wasFreeUnderWarranty}
                onChange={(e) => {
                  setWasFreeUnderWarranty(e.target.checked);
                  if (e.target.checked) setCostToman(0);
                }}
                className="w-4 h-4 rounded text-[#C8A951] accent-[#C8A951] cursor-pointer"
              />
            </div>

            {!wasFreeUnderWarranty && (
              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  مبلغ دریافتی (تومان)
                </label>
                <input
                  type="number"
                  value={costToman}
                  onChange={(e) => setCostToman(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs font-mono focus:border-[#C8A951] focus:outline-none"
                />
              </div>
            )}
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
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D4B763] text-[#141416] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'در حال ثبت...' : 'ثبت در سوابق گارانتی'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
