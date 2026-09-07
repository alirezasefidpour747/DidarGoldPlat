/**
 * Didar Gold Platform - Status Transition & Audit Reason Modal
 */

import React, { useState } from 'react';
import { EntityStatus } from '../../types/k01.js';
import { useI18n } from '../../lib/i18n.js';
import { X, ShieldAlert, Check, AlertCircle } from 'lucide-react';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'party' | 'organization' | 'membership';
  entityId: string;
  entityName: string;
  currentStatus: EntityStatus;
  onSubmit: (newStatus: EntityStatus, reason: string) => Promise<void>;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  currentStatus,
  onSubmit
}) => {
  const { t } = useI18n();

  const [newStatus, setNewStatus] = useState<EntityStatus>(
    currentStatus === 'active' ? 'suspended' : 'active'
  );
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('ثبت علت تغییر وضعیت جهت درج در دفتر حسابرسی تغییرناپذیر الزامی است.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(newStatus, reason.trim());
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در اعمال تغییر وضعیت.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#171720] border border-[#2F2F40] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-[#292938]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#E5A84B]" />
            <h3 className="text-sm font-bold text-[#F4F4F6]">{t.confirmStatusChange}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#8A8A9A] hover:text-[#EDEDED]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 flex items-center gap-2 text-xs text-[#FF6B6B]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-[#1D1D28] border border-[#2B2B3C] text-xs">
            <div className="text-[#8A8A9A]">پرونده مورد نظر:</div>
            <div className="font-bold text-[#EDEDED] text-sm mt-0.5">{entityName}</div>
            <div className="font-mono text-[11px] text-[#C8A951] mt-0.5">شناسه: {entityId}</div>
          </div>

          <div>
            <label className="block text-xs text-[#9E9EA8] mb-1.5">وضعیت عملیاتی جدید *</label>
            <div className="grid grid-cols-2 gap-2">
              {(['active', 'pending', 'suspended', 'archived'] as EntityStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setNewStatus(st)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    newStatus === st
                      ? 'bg-[#C8A951] text-[#141416] border-[#C8A951] shadow-md shadow-[#C8A951]/15'
                      : 'bg-[#121218] text-[#8E8E9E] border-[#2C2C3C] hover:border-[#3E3E52]'
                  }`}
                >
                  {st === 'active' && t.statusActive}
                  {st === 'pending' && t.statusPending}
                  {st === 'suspended' && t.statusSuspended}
                  {st === 'archived' && t.statusArchived}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#9E9EA8] mb-1">دلیل تغییر وضعیت (ثبت در حسابرسی امنیتی) *</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="مثال: تکمیل استعلام پروانه صنفی از اتحادیه یا تعلیق موقت به دلیل عدم تسویه تعهدات طلایی..."
              className="w-full bg-[#121218] border border-[#2C2C3C] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#292938]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#8A8A9A] hover:bg-[#222230] rounded-xl"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-[#141416] bg-[#C8A951] hover:bg-[#D4AF37] rounded-xl disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? t.loading : 'اعمال و ثبت رویداد'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
