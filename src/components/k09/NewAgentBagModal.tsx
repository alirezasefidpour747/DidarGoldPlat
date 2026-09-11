/**
 * Didar Gold Platform - Kernel Domain K09
 * New Agent Field Bag Registration Modal
 */

import React, { useState } from 'react';
import { AgentBag } from '../../types/k09.js';
import { X, Briefcase, Shield, Battery, UserCheck } from 'lucide-react';

interface NewAgentBagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<AgentBag>) => Promise<void>;
}

export const NewAgentBagModal: React.FC<NewAgentBagModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [bagCode, setBagCode] = useState(`BAG-TH-0${Math.floor(5 + Math.random() * 5)}`);
  const [bagTitleFa, setBagTitleFa] = useState('کیف پرتابل ضدسرقت هوشمند ویزیتور دیدار');
  const [assignedAgentNameFa, setAssignedAgentNameFa] = useState('کوروش فرهمند (ویزیتور رسمی)');
  const [agentNationalIdMasked, setAgentNationalIdMasked] = useState('۰۰۴***۶۶۱۱');
  const [agentPhone, setAgentPhone] = useState('۰۹۱۲۳۴۵۶۷۸۹');
  const [assignedTerritoryFa, setAssignedTerritoryFa] = useState('راسته طلافروشان صادقیه، ستارخان و گیشا');
  const [maxWeightCapacityGrams, setMaxWeightCapacityGrams] = useState<number>(8000);
  const [securityBagSerial, setSecurityBagSerial] = useState(`SMART-SAFE-2026-X${Math.floor(100 + Math.random() * 900)}`);
  const [notes, setNotes] = useState('مجهز به ردیاب برخط ماهواره‌ای، ماژول کپسول رنگ دودزا و حسگر باز شدن غیرمجاز.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        bagCode,
        bagTitleFa,
        assignedAgentNameFa,
        agentNationalIdMasked,
        agentPhone,
        assignedTerritoryFa,
        maxWeightCapacityGrams: Number(maxWeightCapacityGrams),
        securityBagSerial,
        notes
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت کیف جدید');
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
            <div className="w-10 h-10 rounded-xl bg-[#C8A951]/15 border border-[#C8A951]/30 flex items-center justify-center text-[#C8A951]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">رجیستر کیف ضدسرقت هوشمند ویزیتور</h2>
              <p className="text-xs text-[#9E9EA8]">تخصیص شوکیس سیار با ردیابی GPS و قفل دیجیتال</p>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#B5B5C2] mb-1 font-medium">کد سیستمی کیف</label>
              <input
                type="text"
                value={bagCode}
                onChange={(e) => setBagCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#C8A951] font-mono focus:border-[#C8A951] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#B5B5C2] mb-1 font-medium">شماره سریال سخت‌افزاری</label>
              <input
                type="text"
                value={securityBagSerial}
                onChange={(e) => setSecurityBagSerial(e.target.value)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] font-mono focus:border-[#C8A951] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#B5B5C2] mb-1 font-medium">عنوان کیف در سامانه</label>
            <input
              type="text"
              value={bagTitleFa}
              onChange={(e) => setBagTitleFa(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-[#12121A] border border-[#242434] space-y-3">
            <span className="font-semibold text-[#EDEDED] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              مشخصات ویزیتور و امین متعهد کیف
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#9E9EA8] mb-1">نام و نام خانوادگی ویزیتور</label>
                <input
                  type="text"
                  value={assignedAgentNameFa}
                  onChange={(e) => setAssignedAgentNameFa(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#1A1A26] border border-[#2C2C3E] rounded-lg text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#9E9EA8] mb-1">کد ملی</label>
                <input
                  type="text"
                  value={agentNationalIdMasked}
                  onChange={(e) => setAgentNationalIdMasked(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#1A1A26] border border-[#2C2C3E] rounded-lg text-[#EDEDED] font-mono focus:border-[#C8A951] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#9E9EA8] mb-1">شماره تماس اضطراری</label>
                <input
                  type="text"
                  value={agentPhone}
                  onChange={(e) => setAgentPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#1A1A26] border border-[#2C2C3E] rounded-lg text-[#EDEDED] font-mono focus:border-[#C8A951] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#9E9EA8] mb-1">سقف ظرفیت طلا (گرم)</label>
                <input
                  type="number"
                  value={maxWeightCapacityGrams}
                  onChange={(e) => setMaxWeightCapacityGrams(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[#1A1A26] border border-[#2C2C3E] rounded-lg text-[#C8A951] font-mono focus:border-[#C8A951] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#9E9EA8] mb-1">قلمرو و محدوده جغرافیایی ویزیت</label>
              <input
                type="text"
                value={assignedTerritoryFa}
                onChange={(e) => setAssignedTerritoryFa(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#1A1A26] border border-[#2C2C3E] rounded-lg text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#B5B5C2] mb-1 font-medium">امکانات امنیتی و ملاحظات</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="px-5 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D8B961] text-[#14141A] font-bold transition shadow-lg flex items-center gap-2"
            >
              {submitting ? 'در حال ثبت...' : 'ثبت و اتصال کیف هوشمند به سامانه'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
