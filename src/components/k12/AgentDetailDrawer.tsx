/**
 * Didar Gold Platform - Kernel Domain K12
 * AgentDetailDrawer: Complete Field Agent Dossier & Security Credentials
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  Briefcase,
  MapPin,
  Phone,
  Truck,
  FileText,
  Clock,
  Radio,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  PackageCheck,
  Power,
  PowerOff
} from 'lucide-react';
import { FieldAgent, AgentDutyStatus, Territory } from '../../types/k12.js';

interface AgentDetailDrawerProps {
  agent: FieldAgent | null;
  territories?: Territory[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (agentId: string, status: AgentDutyStatus) => Promise<void>;
  onAssignTerritory?: (agentId: string, territoryId: string) => Promise<void>;
  onToggleActive?: (agentId: string, isActive?: boolean) => Promise<void>;
}

export const AgentDetailDrawer: React.FC<AgentDetailDrawerProps> = ({
  agent,
  territories = [],
  isOpen,
  onClose,
  onUpdateStatus,
  onAssignTerritory,
  onToggleActive
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isAssigningTerritory, setIsAssigningTerritory] = useState(false);
  const [targetTerritoryId, setTargetTerritoryId] = useState(agent?.assignedTerritoryId || (territories[0]?.id || ''));
  const [selectedStatus, setSelectedStatus] = useState<AgentDutyStatus>(agent?.dutyStatus || 'standby');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (agent) {
      setTargetTerritoryId(agent.assignedTerritoryId || (territories[0]?.id || ''));
      setSelectedStatus(agent.dutyStatus);
    }
  }, [agent?.id, agent?.dutyStatus, agent?.assignedTerritoryId]);

  if (!isOpen || !agent) return null;

  const statusOptions: { key: AgentDutyStatus; titleFa: string; colorClass: string }[] = [
    { key: 'on_duty', titleFa: 'در شیفت عملیاتی و آماده اعزام', colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { key: 'on_route', titleFa: 'در حال تردد در راسته بازار', colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { key: 'checked_in', titleFa: 'حاضر در گالری طلافروشی', colorClass: 'bg-[#C8A951]/20 text-[#E5C365] border-[#C8A951]/30' },
    { key: 'standby', titleFa: 'آماده‌باش در شعبه یا خزانه', colorClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { key: 'off_duty', titleFa: 'پایان شیفت کاری', colorClass: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' }
  ];

  const handleStatusChange = async (newStatus: AgentDutyStatus) => {
    setSelectedStatus(newStatus);
    try {
      setIsUpdating(true);
      await onUpdateStatus(agent.id, newStatus);
      setStatusMessage('وضعیت شیفت مأمور با موفقیت به‌روزرسانی شد.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      setStatusMessage(err.message || 'خطا در تغییر وضعیت');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleActive = async () => {
    if (!onToggleActive) return;
    try {
      setIsTogglingActive(true);
      const nextActive = agent.isActive !== false ? false : true;
      await onToggleActive(agent.id, nextActive);
      setStatusMessage(nextActive ? 'مأمور با موفقیت فعال شد.' : 'مأمور به حالت غیرفعال تغییر یافت.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      setStatusMessage(err.message || 'خطا در تغییر وضعیت فعالیت');
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleAssignTerritory = async () => {
    if (!onAssignTerritory || !targetTerritoryId) return;
    try {
      setIsAssigningTerritory(true);
      await onAssignTerritory(agent.id, targetTerritoryId);
      setStatusMessage('قلمرو مأمور با موفقیت به‌روزرسانی شد.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      setStatusMessage(err.message || 'خطا در تخصیص قلمرو');
    } finally {
      setIsAssigningTerritory(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs" dir="rtl">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 left-0 max-w-full flex pl-0 sm:pr-10">
        <div className="w-screen max-w-md bg-[#161622] text-[#EDEDED] shadow-2xl border-r border-[#28283C] flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#28283C] bg-[#151520] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8A951] to-[#997B2E] text-[#141416] flex items-center justify-center font-bold text-sm shadow-md">
                {agent.fullNameFa.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">
                    {agent.fullNameFa}
                  </h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#191926] text-[#A0A0B5] border border-[#28283C]">
                    {agent.code}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    agent.isActive !== false
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}>
                    {agent.isActive !== false ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${
                    agent.role === 'carrier_delivery'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                  }`}>
                    {agent.role === 'carrier_delivery' ? (
                      <PackageCheck className="w-3 h-3" />
                    ) : (
                      <ShoppingBag className="w-3 h-3" />
                    )}
                    {agent.role === 'carrier_delivery' ? 'مأمور تحویل و حمل کالا' : 'مأمور خریدار و ویزیتور'}
                  </span>
                  <p className="text-[11px] text-[#A0A0B5] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#C8A951]" />
                    {agent.assignedTerritoryNameFa}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#A0A0B5] hover:text-white rounded-lg hover:bg-[#191926] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            
            {statusMessage && (
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Agent Active / Inactive Status Management */}
            {onToggleActive && (
              <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    وضعیت مجاز فعالیت مأمور
                  </span>
                  <span className="text-[11px] text-[#A0A0B5]">
                    {agent.isActive !== false
                      ? 'مأمور فعال است و می‌تواند به قلمرو اختصاص یافته و ویزیت ثبت کند.'
                      : 'مأمور غیرفعال شده و امکان انتساب به ویزیت جدید ندارد.'}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isTogglingActive}
                  onClick={handleToggleActive}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                    agent.isActive !== false
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border-rose-500/40'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  {agent.isActive !== false ? (
                    <>
                      <PowerOff className="w-3.5 h-3.5" />
                      غیرفعال کردن
                    </>
                  ) : (
                    <>
                      <Power className="w-3.5 h-3.5" />
                      فعال‌سازی مجدد
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quick Status Control */}
            <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                <Radio className="w-4 h-4" />
                وضعیت شیفت و مأموریت عملیاتی:
              </span>
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {statusOptions.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(opt.key)}
                    className={`px-3 py-2 rounded-lg border text-right font-medium transition-colors flex items-center justify-between ${
                      agent.dutyStatus === opt.key
                        ? opt.colorClass
                        : 'border-[#28283C] text-[#A0A0B5] hover:bg-[#161622] hover:text-white'
                    }`}
                  >
                    <span>{opt.titleFa}</span>
                    {agent.dutyStatus === opt.key && (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Territory Assignment */}
            <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3.5 space-y-2.5">
              <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                تخصیص قلمرو عملیاتی مأمور (خوشه راسته بازار)
              </span>
              <p className="text-[11px] text-[#A0A0B5]">
                قلمرو فعال: <strong className="text-white">{agent.assignedTerritoryNameFa}</strong>
              </p>
              {territories && territories.length > 0 && onAssignTerritory && (
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={targetTerritoryId}
                    onChange={e => setTargetTerritoryId(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-[#161622] border border-[#28283C] rounded-lg text-xs text-white focus:ring-1 focus:ring-[#C8A951]"
                  >
                    {territories.map(t => (
                      <option key={t.id} value={t.id}>{t.titleFa} ({t.provinceFa})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={isAssigningTerritory || targetTerritoryId === agent.assignedTerritoryId}
                    onClick={handleAssignTerritory}
                    className="px-3 py-1.5 bg-[#C8A951] hover:bg-[#D9B961] disabled:opacity-40 text-[#141416] rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    {isAssigningTerritory ? 'در حال ثبت...' : 'تغییر قلمرو'}
                  </button>
                </div>
              )}
            </div>

            {/* Security Clearance & Trust Score */}
            <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3.5 space-y-3">
              <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                رده حفاظتی و امتیاز اعتباری
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-[#161622] rounded-lg border border-[#28283C]">
                  <span className="text-[#828299] block mb-0.5">امتیاز اعتماد سامانه:</span>
                  <strong className="text-sm font-bold text-white font-mono">{agent.trustScore} / ۱۰۰</strong>
                </div>
                <div className="p-2 bg-[#161622] rounded-lg border border-[#28283C]">
                  <span className="text-[#828299] block mb-0.5">درصد موفقیت فروش:</span>
                  <strong className="text-sm font-bold text-[#3DD68C] font-mono">%{agent.conversionRatePercent}</strong>
                </div>
              </div>
              <p className="text-[#EDEDED] font-medium leading-relaxed bg-[#161622] p-2.5 rounded-lg border border-[#28283C]">
                🎖️ {agent.securityClearanceFa}
              </p>
            </div>

            {/* Smart Bag Assigned */}
            <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                کیف هوشمند طلا و نمونه‌های امانی (K09)
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between p-2 bg-[#161622] rounded-lg border border-[#28283C]">
                  <span className="text-[#A0A0B5]">کد اختصاصی کیف:</span>
                  <strong className="font-mono text-white">{agent.assignedBagCode || 'تخصیص نیافته'}</strong>
                </div>
                <div className="flex justify-between p-2 bg-[#161622] rounded-lg border border-[#28283C]">
                  <span className="text-[#A0A0B5]">وزن محموله نمونه‌ها:</span>
                  <strong className="font-mono text-[#E5C365]">{agent.assignedBagWeightGrams || 0} گرم</strong>
                </div>
                <div className="flex justify-between p-2 bg-[#161622] rounded-lg border border-[#28283C]">
                  <span className="text-[#A0A0B5]">وضعیت پلمپ:</span>
                  <span className="text-emerald-400 font-bold">پلمپ دیجیتال فعال</span>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                کارنامه عملکرد میدانی
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-[#161622] rounded-lg border border-[#28283C]">
                  <span className="text-[#828299] block mb-0.5">ویزیت‌های موفق:</span>
                  <strong className="text-sm font-bold text-white font-mono">{agent.completedVisitsCount} طلافروشی</strong>
                </div>
                <div className="p-2 bg-[#161622] rounded-lg border border-[#28283C]">
                  <span className="text-[#828299] block mb-0.5">کل سفارش‌های نیابتی:</span>
                  <strong className="text-sm font-bold text-[#E5C365] font-mono">{agent.totalProxySalesGoldGrams.toLocaleString('fa-IR')} گرم طلا</strong>
                </div>
              </div>
            </div>

            {/* Guarantor & Legal */}
            <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                وثیقه ثبتی و ضمانت حسن انجام کار
              </span>
              <p className="text-[11px] text-[#A0A0B5]">
                مبلغ وثیقه: <strong className="text-white font-mono">{agent.guarantorBondAmountToman.toLocaleString('fa-IR')} تومان</strong>
              </p>
              <p className="text-[10px] text-[#828299] bg-[#161622] p-2 rounded border border-[#28283C]">
                {agent.guarantorDocReference}
              </p>
            </div>

            {/* Vehicle & Contacts */}
            <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                وسیله نقلیه و اطلاعات هویت پایه (K01)
              </span>
              <div className="space-y-1.5 text-[11px] text-[#A0A0B5]">
                {agent.partyId && (
                  <div className="p-2 bg-[#14141E] rounded-lg border border-[#2E2E42] flex items-center justify-between">
                    <span className="text-[10px] text-[#A0A0B5]">شناسه شخص در دامنه K01:</span>
                    <span className="font-mono text-[#E5C365] font-bold text-[10px]">{agent.partyId}</span>
                  </div>
                )}
                <p>کد ملی: <strong className="text-white font-mono">{agent.nationalCode}</strong></p>
                <p>نوع وسیله: <strong className="text-white">{agent.vehicleTypeFa}</strong></p>
                <p>پلاک: <strong className="text-white font-mono">{agent.vehiclePlateNumber}</strong></p>
                <p>تلفن همراه: <strong className="text-white font-mono">{agent.mobileNumber}</strong></p>
                <p>تماس اضطراری: <strong className="text-white">{agent.emergencyContactFa} ({agent.emergencyPhone})</strong></p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#28283C] bg-[#151520] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#28283C] hover:bg-[#32324A] text-white text-xs font-medium rounded-lg transition-colors"
            >
              بستن پرونده
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
