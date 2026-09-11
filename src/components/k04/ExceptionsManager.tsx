/**
 * Didar Gold Platform - K04: Exceptions Manager
 * Commercial Waivers, Policy Overrides, and Revocations
 */

import React, { useState } from 'react';
import { CommercialException } from '../../types/k04.js';
import {
  ShieldAlert,
  AlertTriangle,
  PlusCircle,
  Ban,
  CheckCircle2,
  Clock,
  Scale,
  DollarSign,
  UserCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { NewExceptionModal } from './NewExceptionModal.js';

interface ExceptionsManagerProps {
  exceptions: CommercialException[];
  onCreateException: (data: any) => Promise<void>;
  onRevokeException: (exceptionId: string, reason: string) => Promise<void>;
}

export const ExceptionsManager: React.FC<ExceptionsManagerProps> = ({
  exceptions,
  onCreateException,
  onRevokeException
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);

  const handleConfirmRevoke = async (id: string) => {
    if (!revokeReason.trim()) return;
    try {
      setIsRevoking(true);
      await onRevokeException(id, revokeReason);
      setRevokingId(null);
      setRevokeReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsRevoking(false);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3D1418] text-[#FF6363] border border-[#FF4D4D]/40">بحرانی</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#382613] text-[#E5A84B] border border-[#E5A84B]/40">پرریسک</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#292917] text-[#D8D846] border border-[#D8D846]/40">متوسط</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#14261B] text-[#42DB8B] border border-[#3DD68C]/40">کم‌ریسک</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#15151E] p-4 rounded-2xl border border-[#272736]">
        <div>
          <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#E5A84B]" />
            مدیریت استثناها و معافیت‌های تجاری موقت (Commercial Waivers)
          </h3>
          <p className="text-xs text-[#8E8EA2] mt-0.5">
            ثبت و کنترل مجوزهای موقت سقف اعتبار، ترخیص طلا و تخفیف‌های تجاری با انقضای خودکار
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E5A84B] text-[#141416] font-bold text-xs hover:bg-[#F2B961] transition-colors shrink-0 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>صدور مجوز استثنای جدید</span>
        </button>
      </div>

      {/* Exceptions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {exceptions.map((exc) => {
          const isActive = exc.status === 'active';
          const isRevoked = exc.status === 'revoked';

          return (
            <div
              key={exc.id}
              className={`p-5 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-[#161622] border-[#313144] shadow-md'
                  : 'bg-[#121218] border-[#22222E] opacity-75'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#262638]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#E5C365] bg-[#282418] px-2 py-0.5 rounded border border-[#C8A951]/30">
                      {exc.exceptionCode}
                    </span>
                    {getRiskBadge(exc.riskLevel)}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isActive ? 'bg-[#172D1E] text-[#3DD68C]' : isRevoked ? 'bg-[#38161A] text-[#FF6363]' : 'bg-[#2B2B38] text-[#8C8CA0]'
                    }`}>
                      {isActive ? 'فعال و معتبر' : isRevoked ? 'باطل شده' : 'منقضی شده'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#EDEDED]">{exc.titleFa}</h4>
                </div>

                {isActive && (
                  <button
                    onClick={() => setRevokingId(exc.id)}
                    className="p-1.5 rounded-lg text-[#FF6B6B] hover:bg-[#38151A] transition-colors text-xs font-semibold flex items-center gap-1 shrink-0"
                    title="ابطال این استثنا"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>ابطال</span>
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-[#A2A2B6] my-3 leading-relaxed">
                {exc.descriptionFa}
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#111118] border border-[#222230] text-xs">
                <div>
                  <span className="text-[#6E6E82] block text-[11px]">طرف حساب:</span>
                  <span className="text-[#E0E0EC] font-medium truncate block">{exc.partyNameFa}</span>
                </div>
                <div>
                  <span className="text-[#6E6E82] block text-[11px]">حجم طلا:</span>
                  <span className="text-[#E5C365] font-mono font-semibold flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    {exc.goldWeightGrams.toLocaleString()} گرم
                  </span>
                </div>
                <div>
                  <span className="text-[#6E6E82] block text-[11px]">اثر مالی ریالی:</span>
                  <span className="text-[#EDEDED] font-mono flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-[#3DD68C]" />
                    {exc.financialImpactIrr ? `${(exc.financialImpactIrr / 1000000000).toFixed(1)} میلیارد` : '—'}
                  </span>
                </div>
              </div>

              {/* Conditions Checklist */}
              {exc.conditions && exc.conditions.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#8E8EA2] block">شروط و تعهدات وثیقه‌ای:</span>
                  <div className="space-y-1">
                    {exc.conditions.map((cond, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-[#BFBFCF]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3DD68C] shrink-0" />
                        <span>{cond}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Meta */}
              <div className="mt-3 pt-3 border-t border-[#262638] flex items-center justify-between text-[11px] text-[#717184]">
                <div className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-[#C8A951]" />
                  <span>تأییدکننده: {exc.approvedBy}</span>
                </div>

                <div className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>اعتبار تا: {exc.validUntil}</span>
                </div>
              </div>

              {/* Revocation Prompt */}
              {revokingId === exc.id && (
                <div className="mt-3 p-3 rounded-xl bg-[#2D1217] border border-[#FF4D4D]/40 space-y-2 animate-in fade-in">
                  <span className="text-xs font-bold text-[#FF8585] block">
                    تأیید ابطال مجوز استثنا {exc.exceptionCode}:
                  </span>
                  <input
                    type="text"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="علت ابطال (مثال: وصول بدهی، نقض شرط وثیقه یا پایان بازه معین)..."
                    className="w-full bg-[#180A0E] border border-[#FF5252]/50 rounded-lg px-2.5 py-1.5 text-xs text-[#EDEDED] focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setRevokingId(null);
                        setRevokeReason('');
                      }}
                      className="px-3 py-1 rounded-lg bg-[#242434] text-xs text-[#A2A2B4]"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={() => handleConfirmRevoke(exc.id)}
                      disabled={isRevoking || !revokeReason.trim()}
                      className="px-3 py-1 rounded-lg bg-[#FF4D4D] text-white text-xs font-bold disabled:opacity-50"
                    >
                      {isRevoking ? 'در حال ابطال...' : 'ابطال قطعی و ثبت در لاگ'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showNewModal && (
        <NewExceptionModal
          onClose={() => setShowNewModal(false)}
          onSubmit={onCreateException}
        />
      )}
    </div>
  );
};
