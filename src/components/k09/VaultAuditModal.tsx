/**
 * Didar Gold Platform - Kernel Domain K09
 * Vault Audit & Physical Stock Count Reconciliation Modal
 */

import React, { useState } from 'react';
import { VaultLocation, AgentBag, VaultAuditRecord } from '../../types/k09.js';
import { X, ClipboardCheck, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface VaultAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<VaultAuditRecord>) => Promise<void>;
  locations: VaultLocation[];
  bags: AgentBag[];
}

export const VaultAuditModal: React.FC<VaultAuditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  locations,
  bags
}) => {
  const [targetType, setTargetType] = useState<'vault' | 'bag'>('vault');
  const [targetLocationId, setTargetLocationId] = useState(locations[0]?.id || '');
  const [auditorNameFa, setAuditorNameFa] = useState('کارشناس رسمی اتحادیه طلا و بازرس ویژه دیدار (حمید گوهری)');
  const [auditorNationalIdMasked, setAuditorNationalIdMasked] = useState('۰۰۴***۶۶۱۱');
  const [inspectorNotesFa, setInspectorNotesFa] = useState('انبارگردانی با حضور ناظر حراست، شمارش تک به تک قطعات طلا و توزین ترازوی چهار رقم اعشار کالیبره انجام پذیرفت.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTarget =
    targetType === 'vault'
      ? locations.find((l) => l.id === targetLocationId)
      : bags.find((b) => b.id === targetLocationId);

  const defaultExpectedWeight =
    targetType === 'vault'
      ? (selectedTarget as VaultLocation)?.currentGoldWeightGrams || 0
      : (selectedTarget as AgentBag)?.currentWeightGrams || 0;

  const defaultExpectedPieces =
    targetType === 'vault'
      ? (selectedTarget as VaultLocation)?.totalPiecesCount || 0
      : (selectedTarget as AgentBag)?.piecesCount || 0;

  const [physicalWeight, setPhysicalWeight] = useState<number>(defaultExpectedWeight || 0);
  const [physicalPieces, setPhysicalPieces] = useState<number>(defaultExpectedPieces || 0);

  // Sync state when modal opens or target changes
  React.useEffect(() => {
    if (isOpen && selectedTarget) {
      const w = targetType === 'vault' ? (selectedTarget as VaultLocation).currentGoldWeightGrams || 0 : (selectedTarget as AgentBag).currentWeightGrams || 0;
      const p = targetType === 'vault' ? (selectedTarget as VaultLocation).totalPiecesCount || 0 : (selectedTarget as AgentBag).piecesCount || 0;
      setPhysicalWeight(w);
      setPhysicalPieces(p);
    }
  }, [isOpen, targetLocationId, targetType]);

  // Sync state when target changes
  const handleTargetChange = (type: 'vault' | 'bag', id: string) => {
    setTargetType(type);
    setTargetLocationId(id);
    const target =
      type === 'vault'
        ? locations.find((l) => l.id === id)
        : bags.find((b) => b.id === id);
    if (target) {
      const w = type === 'vault' ? (target as VaultLocation).currentGoldWeightGrams || 0 : (target as AgentBag).currentWeightGrams || 0;
      const p = type === 'vault' ? (target as VaultLocation).totalPiecesCount || 0 : (target as AgentBag).piecesCount || 0;
      setPhysicalWeight(w);
      setPhysicalPieces(p);
    }
  };

  if (!isOpen) return null;

  const diffWeight = Number(((physicalWeight || 0) - (defaultExpectedWeight || 0)).toFixed(3));
  const diffPieces = (physicalPieces || 0) - (defaultExpectedPieces || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const targetName =
        targetType === 'vault'
          ? locations.find((l) => l.id === targetLocationId)?.nameFa || 'خزانه'
          : bags.find((b) => b.id === targetLocationId)?.bagTitleFa || 'کیف ویزیتور';

      await onSubmit({
        targetLocationId,
        targetLocationNameFa: targetName,
        targetTypeFa: targetType === 'vault' ? 'خزانه و انبار' : 'کیف ویزیتور میدانی',
        expectedWeightGrams: defaultExpectedWeight,
        physicalCountWeightGrams: physicalWeight,
        expectedItemsCount: defaultExpectedPieces,
        physicalCountItemsCount: physicalPieces,
        auditorNameFa,
        auditorNationalIdMasked,
        inspectorNotesFa
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت صورت‌جلسه انبارگردانی');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#181822] border border-[#2D2D3D] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D2D3D] bg-[#14141C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ثبت صورت‌جلسه انبارگردانی فیزیکی طلا</h2>
              <p className="text-xs text-[#9E9EA8]">تطبیق تراز گرمی فیزیکی با موجودی دفتری سیستم</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#767688] hover:text-white hover:bg-[#252533] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          {/* Target Selector */}
          <div className="space-y-2">
            <label className="block text-[#B5B5C2] font-medium">محل تحت انبارگردانی</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTargetChange('vault', locations[0]?.id || '')}
                className={`flex-1 py-1.5 px-3 rounded-lg border text-center transition ${
                  targetType === 'vault'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                    : 'bg-[#12121A] border-[#2C2C3E] text-[#9E9EA8]'
                }`}
              >
                خزانه‌ها و انبارها
              </button>
              <button
                type="button"
                onClick={() => handleTargetChange('bag', bags[0]?.id || '')}
                className={`flex-1 py-1.5 px-3 rounded-lg border text-center transition ${
                  targetType === 'bag'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                    : 'bg-[#12121A] border-[#2C2C3E] text-[#9E9EA8]'
                }`}
              >
                کیف‌های ویزیتورها
              </button>
            </div>

            {targetType === 'vault' ? (
              <select
                value={targetLocationId}
                onChange={(e) => handleTargetChange('vault', e.target.value)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nameFa} (موجودی دفتری: {l.currentGoldWeightGrams.toLocaleString('fa-IR')} گرم)
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={targetLocationId}
                onChange={(e) => handleTargetChange('bag', e.target.value)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
              >
                {bags.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bagTitleFa} - {b.assignedAgentNameFa} ({b.currentWeightGrams.toLocaleString('fa-IR')} گرم)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Counts Comparison */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#12121A] border border-[#242434]">
            <div className="space-y-1">
              <span className="text-[#9E9EA8]">وزن دفتری (سیستم):</span>
              <p className="text-sm font-bold font-mono text-[#C8A951]">
                {defaultExpectedWeight.toLocaleString('fa-IR')} گرم
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[#9E9EA8]">تعداد قطعات دفتری:</span>
              <p className="text-sm font-bold font-mono text-[#EDEDED]">
                {defaultExpectedPieces} عدد
              </p>
            </div>
          </div>

          {/* Physical Measurements Input */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#B5B5C2] mb-1 font-medium flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-[#C8A951]" />
                وزن شمارش فیزیکی (گرم)
              </label>
              <input
                type="number"
                step="0.001"
                value={physicalWeight}
                onChange={(e) => setPhysicalWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] font-mono focus:border-[#C8A951] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#B5B5C2] mb-1 font-medium">تعداد شمارش فیزیکی (عدد)</label>
              <input
                type="number"
                value={physicalPieces}
                onChange={(e) => setPhysicalPieces(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] font-mono focus:border-[#C8A951] focus:outline-none"
              />
            </div>
          </div>

          {/* Reconciliation Status Indicator */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            diffWeight === 0 && diffPieces === 0
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : Math.abs(diffWeight) <= 0.05 && diffPieces === 0
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <div className="flex items-center gap-2">
              {diffWeight === 0 && diffPieces === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span>مغایرت وزنی:</span>
            </div>
            <span className="font-bold font-mono text-sm">
              {diffWeight > 0 ? `+${diffWeight}` : diffWeight} گرم (قطعات: {diffPieces})
            </span>
          </div>

          {/* Auditor Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#B5B5C2] mb-1 font-medium">نام سرپرست انبارگردانی</label>
              <input
                type="text"
                value={auditorNameFa}
                onChange={(e) => setAuditorNameFa(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#B5B5C2] mb-1 font-medium">کد ملی بازرس</label>
              <input
                type="text"
                value={auditorNationalIdMasked}
                onChange={(e) => setAuditorNationalIdMasked(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] font-mono focus:border-[#C8A951] focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#B5B5C2] mb-1 font-medium">شرح صورت‌جلسه رسمی</label>
            <textarea
              rows={2}
              value={inspectorNotesFa}
              onChange={(e) => setInspectorNotesFa(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#252533]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-[#20202C] hover:bg-[#2A2A3A] text-[#EDEDED] font-medium transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-lg flex items-center gap-2"
            >
              {submitting ? 'در حال ثبت...' : 'ثبت قطعی صورت‌جلسه انبارگردانی'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
