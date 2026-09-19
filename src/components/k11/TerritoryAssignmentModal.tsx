/**
 * Didar Gold Platform - Kernel Domain K11
 * Territory & Field Agent Assignment Modal (تخصیص قلمرو بازار و ویزیتور میدانی)
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  UserCheck,
  Calendar,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Retailer, RetailerTerritory } from '../../types/k11.js';

interface TerritoryAssignmentModalProps {
  isOpen: boolean;
  retailer: Retailer | null;
  onClose: () => void;
  onSubmit: (retailerId: string, territoryUpdates: Partial<RetailerTerritory>) => Promise<void>;
  availableAgents: { id: string; nameFa: string; regionCode: string }[];
}

export const TerritoryAssignmentModal: React.FC<TerritoryAssignmentModalProps> = ({
  isOpen,
  retailer,
  onClose,
  onSubmit,
  availableAgents
}) => {
  const [regionTitleFa, setRegionTitleFa] = useState('');
  const [marketDistrictFa, setMarketDistrictFa] = useState('');
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const [backupAgentNameFa, setBackupAgentNameFa] = useState('');
  const [scheduledVisitDayFa, setScheduledVisitDayFa] = useState('');
  const [isExclusiveZone, setIsExclusiveZone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (retailer) {
      setRegionTitleFa(retailer.territory.regionTitleFa);
      setMarketDistrictFa(retailer.territory.marketDistrictFa);
      setAssignedAgentId(retailer.territory.assignedAgentId);
      setBackupAgentNameFa(retailer.territory.backupAgentNameFa || '');
      setScheduledVisitDayFa(retailer.territory.scheduledVisitDayFa);
      setIsExclusiveZone(retailer.territory.isExclusiveZone);
    }
  }, [retailer]);

  if (!isOpen || !retailer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketDistrictFa.trim()) {
      setErrorMessage('لطفاً نام راسته بازار یا قلمرو تجاری را مشخص کنید.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const selectedAgent = availableAgents.find(a => a.id === assignedAgentId);

      await onSubmit(retailer.id, {
        regionTitleFa,
        marketDistrictFa,
        assignedAgentId,
        assignedAgentNameFa: selectedAgent?.nameFa || retailer.territory.assignedAgentNameFa,
        backupAgentNameFa,
        scheduledVisitDayFa,
        isExclusiveZone
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در انتساب قلمرو');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#18181F] border border-[#2B2B38] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2B38] bg-[#1F1F2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A951]/10 border border-[#C8A951]/30 flex items-center justify-center text-[#E5C365]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#EDEDED]">تخصیص قلمرو بازار و ویزیتور</h3>
              <p className="text-xs text-[#8E8E93]">{retailer.tradeNameFa}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#8E8E93] hover:text-[#EDEDED] hover:bg-[#2B2B38] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 flex items-center gap-2 text-xs text-[#E5484D]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">استان / منطقه بازاری</label>
            <input
              type="text"
              value={regionTitleFa}
              onChange={(e) => setRegionTitleFa(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">راسته بازار / مجتمع تجاری طلا</label>
            <input
              type="text"
              value={marketDistrictFa}
              onChange={(e) => setMarketDistrictFa(e.target.value)}
              placeholder="مثال: سرای حاج مهدی، سبزه میدان"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">ویزیتور میدانی اصلی</label>
              <select
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
              >
                {availableAgents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.nameFa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">ویزیتور جانشین / پشتیبان</label>
              <input
                type="text"
                value={backupAgentNameFa}
                onChange={(e) => setBackupAgentNameFa(e.target.value)}
                placeholder="مثال: حمیدرضا رضایی"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">برنامه ویزیت و گردش حضوری کیف طلا</label>
            <input
              type="text"
              value={scheduledVisitDayFa}
              onChange={(e) => setScheduledVisitDayFa(e.target.value)}
              placeholder="مثال: دوشنبه‌ها نوبت صبح (ساعت ۱۰:۳۰)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#2B2B38] text-sm text-[#EDEDED] focus:border-[#C8A951] focus:outline-none transition-colors"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#121217] border border-[#2B2B38]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#EDEDED]">
              <input
                type="checkbox"
                checked={isExclusiveZone}
                onChange={(e) => setIsExclusiveZone(e.target.checked)}
                className="w-4 h-4 rounded accent-[#C8A951]"
              />
              <span>حق انحصاری توزیع کلکسیون‌های ویژه در این راسته بازار</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2B2B38]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#8E8E93] hover:text-[#EDEDED] hover:bg-[#2B2B38] transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#C8A951] text-[#141416] hover:bg-[#E5C365] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'در حال ذخیره...' : 'ذخیره انتساب قلمرو'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
