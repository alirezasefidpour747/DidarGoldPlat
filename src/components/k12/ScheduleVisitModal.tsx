/**
 * Didar Gold Platform - Kernel Domain K12
 * ScheduleVisitModal: Plan and schedule retailer field visit
 */

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Store,
  User,
  MapPin,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { FieldVisit, FieldAgent, Territory, VisitPurpose } from '../../types/k12.js';

interface ScheduleVisitModalProps {
  agents: FieldAgent[];
  territories: Territory[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (visitData: Partial<FieldVisit>) => Promise<void>;
  initialTerritoryId?: string;
  initialStoreId?: string;
}

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  agents,
  territories,
  isOpen,
  onClose,
  onSubmit,
  initialTerritoryId,
  initialStoreId
}) => {
  // Gather all stores defined across all territories
  const allStores = React.useMemo(() => {
    const list: Array<{
      id: string;
      tradeNameFa: string;
      ownerFa: string;
      unionCode: string;
      addressFa: string;
      phone: string;
      lat?: number;
      lng?: number;
      territoryId: string;
      territoryTitleFa?: string;
    }> = [];

    territories.forEach(t => {
      (t.stores || []).forEach(s => {
        list.push({
          id: s.id,
          tradeNameFa: s.tradeNameFa,
          ownerFa: s.ownerFa,
          unionCode: s.unionCode,
          addressFa: s.addressFa,
          phone: s.phone,
          lat: s.lat || 35.6742,
          lng: s.lng || 51.4192,
          territoryId: t.id,
          territoryTitleFa: t.titleFa
        });
      });
    });

    // Fallback if territories don't have stores
    if (list.length === 0) {
      list.push({
        id: 'ret-101',
        tradeNameFa: 'گالری طلا و جواهر زمرد (بازار بزرگ)',
        ownerFa: 'حاج محمود کمالی',
        unionCode: 'GLD-TEH-8812',
        addressFa: 'بازار بزرگ تهران، سرای حاج مهدی، طبقه همکف، پلاک ۱۴',
        phone: '۰۲۱-۵۵۶۲۳۴۹۰',
        lat: 35.6742,
        lng: 51.4192,
        territoryId: territories[0]?.id || 'ter-01',
        territoryTitleFa: territories[0]?.titleFa || 'تهران - بازار بزرگ'
      });
    }

    return list;
  }, [territories]);

  const defaultStoreId = initialStoreId || allStores[0]?.id;
  const [selectedRetailerId, setSelectedRetailerId] = useState(defaultStoreId);
  const selectedRetailer = allStores.find(r => r.id === selectedRetailerId) || allStores[0];
  const selectedTerritory = territories.find(t => t.id === selectedRetailer.territoryId) || territories[0];

  const defaultAgentId = agents.find(a => a.assignedTerritoryId === selectedTerritory?.id)?.id || agents[0]?.id || 'agt-01';
  const [selectedAgentId, setSelectedAgentId] = useState(defaultAgentId);
  const [scheduledDateFa, setScheduledDateFa] = useState('۱۴۰۳/۰۸/۲۶');
  const [scheduledTimeSlotFa, setScheduledTimeSlotFa] = useState('۱۰:۰۰ الی ۱۱:۳۰');
  const [purpose, setPurpose] = useState<VisitPurpose>('collection_showcase');
  const [agendaNotesFa, setAgendaNotesFa] = useState('بررسی نمونه‌های طلای ساخته‌شده بدون اجرت و دریافت تقاضای سفارش');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const purposeOptions: { key: VisitPurpose; titleFa: string }[] = [
    { key: 'collection_showcase', titleFa: 'معرفی کالکشن نوآورانه و مدل‌های جدید' },
    { key: 'proxy_order', titleFa: 'اقدام به نیابت و ثبت سفارش عمده در محل' },
    { key: 'consignment_audit', titleFa: 'ممیزی فیزیکی و شمارش قطعات امانی ویترین' },
    { key: 'relationship_management', titleFa: 'مذاکره افزایش سقف و تسویه طلا' },
    { key: 'catalog_drop', titleFa: 'تحویل کاتالوگ فیزیکی، هدایا و مستندات' }
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setIsSubmitting(true);
      await onSubmit({
        retailerId: selectedRetailer.id,
        retailerTradeNameFa: selectedRetailer.tradeNameFa,
        retailerOwnerFa: selectedRetailer.ownerFa,
        retailerUnionCode: selectedRetailer.unionCode,
        retailerAddressFa: selectedRetailer.addressFa,
        retailerPhone: selectedRetailer.phone,
        retailerLat: selectedRetailer.lat,
        retailerLng: selectedRetailer.lng,
        agentId: selectedAgent.id,
        agentNameFa: selectedAgent.fullNameFa,
        territoryId: selectedTerritory.id,
        territoryNameFa: selectedTerritory.titleFa,
        scheduledDateFa,
        scheduledTimeSlotFa,
        purpose,
        purposeFa: purposeOptions.find(p => p.key === purpose)?.titleFa || '',
        retailerNotesFa: agendaNotesFa.trim()
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ثبت نوبت ویزیت');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-lg bg-[#161622] text-[#EDEDED] rounded-2xl shadow-2xl border border-[#28283C] overflow-hidden text-right my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#28283C] bg-[#151520] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8A951] to-[#997B2E] text-[#141416] flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">زمان‌بندی و اعزام مأموریت میدانی</h2>
              <p className="text-xs text-[#A0A0B5]">
                تنظیم نوبت مراجعه به گالری طلافروشی و تعیین مأمور مجری
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A0A0B5] hover:text-white rounded-lg hover:bg-[#191926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-[#E5484D]/15 border border-[#E5484D]/30 text-[#FF6B6B] rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Retailer Selection */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3.5 space-y-2">
            <label className="block text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
              <Store className="w-4 h-4" />
              انتخاب گالری طلافروشی مقصد:
            </label>
            <select
              value={selectedRetailerId}
              onChange={e => setSelectedRetailerId(e.target.value)}
              className="w-full p-2 bg-[#161622] rounded-lg border border-[#28283C] text-xs text-white focus:ring-1 focus:ring-[#C8A951]"
            >
              {allStores.map(r => (
                <option key={r.id} value={r.id}>
                  {r.tradeNameFa} — {r.ownerFa} ({r.territoryTitleFa || 'قلمرو طلا'})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-[#A0A0B5] space-y-0.5 pt-1">
              <p>📍 نشانی: {selectedRetailer.addressFa}</p>
              <p>📞 تلفن: <span className="font-mono text-[#EDEDED]">{selectedRetailer.phone}</span></p>
            </div>
          </div>

          {/* Agent Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A0A0B5] mb-1">
                مأمور مجری ویزیت:
              </label>
              <select
                value={selectedAgentId}
                onChange={e => setSelectedAgentId(e.target.value)}
                className="w-full p-2 bg-[#191926] rounded-lg border border-[#28283C] text-xs text-white focus:ring-1 focus:ring-[#C8A951]"
              >
                {agents.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.fullNameFa} [{a.role === 'carrier_delivery' ? 'کالارسان' : 'مأمور خریدار'}] {a.isActive === false ? '(غیرفعال)' : ''} — {a.assignedTerritoryNameFa}
                  </option>
                ))}
              </select>
              {agents.find(a => a.id === selectedAgentId)?.isActive === false && (
                <p className="text-[10px] text-[#FF6B6B] mt-1">
                  ⚠️ هشدار: این مأمور غیرفعال است و برای اعزام عملیاتی باید ابتدا فعال شود.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A0A0B5] mb-1">
                هدف اصلی مراجعه:
              </label>
              <select
                value={purpose}
                onChange={e => setPurpose(e.target.value as VisitPurpose)}
                className="w-full p-2 bg-[#191926] rounded-lg border border-[#28283C] text-xs text-white focus:ring-1 focus:ring-[#C8A951]"
              >
                {purposeOptions.map(p => (
                  <option key={p.key} value={p.key}>
                    {p.titleFa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[#A0A0B5] mb-1">تاریخ مراجعه:</label>
              <input
                type="text"
                value={scheduledDateFa}
                onChange={e => setScheduledDateFa(e.target.value)}
                className="w-full p-2 bg-[#191926] rounded-lg border border-[#28283C] font-mono text-white focus:ring-1 focus:ring-[#C8A951]"
              />
            </div>
            <div>
              <label className="block text-[#A0A0B5] mb-1">بازه زمانی:</label>
              <input
                type="text"
                value={scheduledTimeSlotFa}
                onChange={e => setScheduledTimeSlotFa(e.target.value)}
                className="w-full p-2 bg-[#191926] rounded-lg border border-[#28283C] text-white focus:ring-1 focus:ring-[#C8A951]"
              />
            </div>
          </div>

          {/* Agenda & Notes */}
          <div>
            <label className="block text-xs text-[#A0A0B5] mb-1">دستور کار و توضیحات مأموریت:</label>
            <textarea
              rows={3}
              value={agendaNotesFa}
              onChange={e => setAgendaNotesFa(e.target.value)}
              className="w-full p-2.5 bg-[#191926] rounded-lg border border-[#28283C] text-xs text-[#EDEDED] focus:ring-1 focus:ring-[#C8A951]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#28283C] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#A0A0B5] hover:text-white border border-[#28283C] hover:bg-[#191926] rounded-lg transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ثبت...' : 'تأیید و درج در برنامه گشت'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
