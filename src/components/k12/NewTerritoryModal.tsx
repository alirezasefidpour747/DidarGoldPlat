/**
 * Didar Gold Platform - Kernel Domain K12
 * NewTerritoryModal: تعریف قلمرو جغرافیایی و خوشه راسته بازار طلا
 * 
 * Unified Dark Luxury Gold Theme (#161622, #151520, #191926, #28283C, #C8A951, #E5C365)
 */

import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Users,
  Scale,
  ShieldCheck,
  X,
  Plus,
  AlertCircle,
  Building
} from 'lucide-react';
import { Territory, FieldAgent, TerritoryRiskLevel } from '../../types/k12.js';

interface NewTerritoryModalProps {
  agents: FieldAgent[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (territoryData: Partial<Territory>) => Promise<void>;
}

export const NewTerritoryModal: React.FC<NewTerritoryModalProps> = ({
  agents,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [titleFa, setTitleFa] = useState('');
  const [code, setCode] = useState('');
  const [provinceFa, setProvinceFa] = useState('تهران');
  const [cityFa, setCityFa] = useState('تهران');
  const [marketDistrictsFa, setMarketDistrictsFa] = useState('');
  const [leadAgentId, setLeadAgentId] = useState(agents[0]?.id || '');
  const [backupAgentNameFa, setBackupAgentNameFa] = useState('');
  const [monthlyGoldQuotaGrams, setMonthlyGoldQuotaGrams] = useState(4000);
  const [dailyVisitCapacity, setDailyVisitCapacity] = useState(8);
  const [activeRetailersCount, setActiveRetailersCount] = useState(25);
  const [riskLevel, setRiskLevel] = useState<TerritoryRiskLevel>('standard');
  const [geofenceRadiusMeters, setGeofenceRadiusMeters] = useState(75);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleFa.trim() || !marketDistrictsFa.trim()) {
      setErrorMsg('لطفاً عنوان قلمرو و راسته‌های تحت پوشش را وارد نمایید.');
      return;
    }

    const selectedLead = agents.find(a => a.id === leadAgentId);

    const riskLabels: Record<TerritoryRiskLevel, string> = {
      standard: 'منطقه استاندارد تجاری',
      high_density: 'راسته پرتراکم با گردش بالا',
      armored_escort: 'منطقه خاص نیازمند اسکورت ویژه مسلح'
    };

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      await onSubmit({
        code: code.trim() || `TER-${provinceFa.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
        titleFa: titleFa.trim(),
        provinceFa,
        cityFa,
        marketDistrictsFa: marketDistrictsFa.trim(),
        leadAgentId: leadAgentId || agents[0]?.id,
        leadAgentNameFa: selectedLead?.fullNameFa || 'مأمور سرپرست منتخب',
        backupAgentNameFa: backupAgentNameFa.trim() || undefined,
        monthlyGoldQuotaGrams: Number(monthlyGoldQuotaGrams) || 3000,
        dailyVisitCapacity: Number(dailyVisitCapacity) || 6,
        activeRetailersCount: Number(activeRetailersCount) || 15,
        riskLevel,
        riskLevelFa: riskLabels[riskLevel],
        geofenceRadiusMeters: Number(geofenceRadiusMeters) || 75
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ثبت قلمرو جدید');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
      <div className="bg-[#161622] border border-[#28283C] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#28283C] bg-[#151520] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                تعریف قلمرو جغرافیایی و خوشه راسته بازار طلا
              </h3>
              <p className="text-[11px] text-[#A0A0B5] mt-0.5">
                ایجاد خوشه منطقه‌ای جهت تخصیص مأموران، سهمیه‌بندی طلای امانی و ژئوفنسینگ گالری‌ها
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#828299] hover:text-white p-1.5 rounded-lg hover:bg-[#191926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-[#E5484D]/15 border border-[#E5484D]/30 rounded-xl text-xs text-[#FF6B6B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Title & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                عنوان قلمرو و راسته بازار <span className="text-[#E5484D]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: شیراز - راسته بازار وکیل و سرای مشیر"
                value={titleFa}
                onChange={e => setTitleFa(e.target.value)}
                className="w-full px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-white placeholder-[#828299] focus:ring-1 focus:ring-[#C8A951]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                کد سیستمی قلمرو
              </label>
              <input
                type="text"
                placeholder="مثال: TER-SHZ-VAKIL"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-white font-mono placeholder-[#828299] focus:ring-1 focus:ring-[#C8A951]"
              />
            </div>
          </div>

          {/* Row 2: Province & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                استان
              </label>
              <input
                type="text"
                placeholder="مثال: فارس، تهران، اصفهان، خراسان رضوی..."
                value={provinceFa}
                onChange={e => setProvinceFa(e.target.value)}
                className="w-full px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-white focus:ring-1 focus:ring-[#C8A951]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                شهر / منطقه ثبتی
              </label>
              <input
                type="text"
                placeholder="مثال: شیراز، منطقه تاریخی تجاری"
                value={cityFa}
                onChange={e => setCityFa(e.target.value)}
                className="w-full px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-white focus:ring-1 focus:ring-[#C8A951]"
              />
            </div>
          </div>

          {/* Row 3: Market Districts & Streets */}
          <div>
            <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
              راسته‌ها، بازارچه‌ها و پاساژهای تحت پوشش <span className="text-[#E5484D]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: بازار وکیل جنوبی، راسته زرگرها، سرای مشیر، پاساژ کازرونیان، کوچه هفت‌پیچ"
              value={marketDistrictsFa}
              onChange={e => setMarketDistrictsFa(e.target.value)}
              className="w-full px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-white placeholder-[#828299] focus:ring-1 focus:ring-[#C8A951]"
            />
          </div>

          {/* Row 4: Lead Agent & Backup Agent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                مأمور ارشد سرپرست قلمرو
              </label>
              <select
                value={leadAgentId}
                onChange={e => setLeadAgentId(e.target.value)}
                className="w-full px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-[#EDEDED] focus:ring-1 focus:ring-[#C8A951]"
              >
                {agents.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.fullNameFa} ({a.code} - {a.securityClearanceFa})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                مأمور جانشین یا همکار پشتیبان
              </label>
              <input
                type="text"
                placeholder="نام مأمور همکار یا شیفت دوم"
                value={backupAgentNameFa}
                onChange={e => setBackupAgentNameFa(e.target.value)}
                className="w-full px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-white placeholder-[#828299] focus:ring-1 focus:ring-[#C8A951]"
              />
            </div>
          </div>

          {/* Row 5: Security Level & Geofence Radius */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                سطح ریسک امنیتی و الزامات حفاظتی
              </label>
              <select
                value={riskLevel}
                onChange={e => setRiskLevel(e.target.value as TerritoryRiskLevel)}
                className="w-full px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-[#EDEDED] focus:ring-1 focus:ring-[#C8A951]"
              >
                <option value="standard">استاندارد (ایمنی پایدار، بدون الزام اسکورت)</option>
                <option value="high_density">راسته پرتراکم تجاری (مراقبت مضاعف)</option>
                <option value="armored_escort">اسکورت ویژه مسلح ناجا (حفاظت شمش و حجم بالا)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                شعاع مجاز ژئوفنسینگ (متر)
              </label>
              <input
                type="number"
                min={30}
                max={500}
                value={geofenceRadiusMeters}
                onChange={e => setGeofenceRadiusMeters(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-white font-mono focus:ring-1 focus:ring-[#C8A951]"
              />
              <span className="text-[10px] text-[#828299] mt-0.5 block">
                حداکثر فاصله مجاز مأمور تا ورودی گالری جهت تأیید ورود مکانی
              </span>
            </div>
          </div>

          {/* Row 6: Capacity & Quota */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                سهمیه طلای ماهانه (گرم)
              </label>
              <input
                type="number"
                min={500}
                value={monthlyGoldQuotaGrams}
                onChange={e => setMonthlyGoldQuotaGrams(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-[#E5C365] font-bold font-mono focus:ring-1 focus:ring-[#C8A951]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                ظرفیت ویزیت روزانه
              </label>
              <input
                type="number"
                min={1}
                max={25}
                value={dailyVisitCapacity}
                onChange={e => setDailyVisitCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-white font-mono focus:ring-1 focus:ring-[#C8A951]"
              />
              <span className="text-[10px] text-[#828299] mt-0.5 block">مغازه در روز</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                طلافروشی‌های تحت پوشش
              </label>
              <input
                type="number"
                min={1}
                value={activeRetailersCount}
                onChange={e => setActiveRetailersCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-xs text-white font-mono focus:ring-1 focus:ring-[#C8A951]"
              />
              <span className="text-[10px] text-[#828299] mt-0.5 block">گالری دارای پروانه</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#28283C] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#191926] hover:bg-[#28283C] text-[#EDEDED] text-xs font-medium rounded-lg transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'در حال ثبت...' : 'ثبت و فعال‌سازی قلمرو'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
