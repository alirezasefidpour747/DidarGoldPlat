/**
 * Didar Gold Platform - Domain K03 Security Policy & Rule Manager
 */

import React, { useState } from 'react';
import { MfaPolicyRule } from '../../types/k03.js';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Laptop,
  Scale,
  Cpu,
  Check,
  Edit2,
  Save,
  AlertCircle
} from 'lucide-react';

interface SecurityPolicyManagerProps {
  policies: MfaPolicyRule[];
  onUpdatePolicy: (policyId: string, updates: Partial<MfaPolicyRule>) => Promise<void>;
}

export const SecurityPolicyManager: React.FC<SecurityPolicyManagerProps> = ({
  policies,
  onUpdatePolicy
}) => {
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [editTimeout, setEditTimeout] = useState<number>(15);
  const [editMaxSessions, setEditMaxSessions] = useState<number>(1);
  const [editThresholdGrams, setEditThresholdGrams] = useState<number>(20);
  const [editMfaRequired, setEditMfaRequired] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (policy: MfaPolicyRule) => {
    setEditingPolicyId(policy.id);
    setEditTimeout(policy.sessionTimeoutMinutes);
    setEditMaxSessions(policy.maxConcurrentSessions);
    setEditThresholdGrams(policy.stepUpThresholdGrams);
    setEditMfaRequired(policy.isMfaRequired);
  };

  const cancelEdit = () => {
    setEditingPolicyId(null);
  };

  const handleSave = async (policyId: string) => {
    setIsSaving(true);
    try {
      await onUpdatePolicy(policyId, {
        sessionTimeoutMinutes: editTimeout,
        maxConcurrentSessions: editMaxSessions,
        stepUpThresholdGrams: editThresholdGrams,
        isMfaRequired: editMfaRequired
      });
      setEditingPolicyId(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-[#181822] p-4 rounded-2xl border border-[#2B2B3C] flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-[#EDEDED] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C8A951]" />
            <span>قوانین و الزامات امنیتی ورود و خزانه‌داری طلا</span>
          </h3>
          <p className="text-[11px] text-[#868698] mt-0.5">
            پیکربندی زمان انقضای خودکار نشست‌ها، سقف تراکنش‌های نیازمند احراز مجدد مرحله‌ای و محدودیت پایانه‌های همزمان
          </p>
        </div>
      </div>

      {/* Policy Cards */}
      <div className="space-y-4">
        {policies.map((policy) => {
          const isEditing = editingPolicyId === policy.id;

          return (
            <div
              key={policy.id}
              className="p-5 rounded-2xl bg-[#181822] border border-[#2B2B3C] hover:border-[#38384E] transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232332]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#EDEDED]">{policy.nameFa}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      policy.isMfaRequired
                        ? 'bg-[#3DD68C]/15 text-[#3DD68C] border-[#3DD68C]/30'
                        : 'bg-[#282838] text-[#9E9EA8] border-[#38384C]'
                    }`}>
                      {policy.isMfaRequired ? 'الزام قطعی MFA' : 'MFA اختیاری'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#868698] mt-1 leading-relaxed">
                    {policy.descriptionFa}
                  </p>
                </div>

                {!isEditing ? (
                  <button
                    onClick={() => startEdit(policy)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222230] text-[#C8A951] hover:bg-[#2C2C3E] border border-[#35354A] text-xs font-semibold transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>ویرایش قانون</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 rounded-xl bg-[#20202D] text-[#868698] hover:text-[#EDEDED] text-xs font-semibold cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={() => handleSave(policy.id)}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C8A951] text-[#141416] hover:bg-[#D4B760] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Policy Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Session Timeout */}
                <div className="p-3 rounded-xl bg-[#14141B] border border-[#242432]">
                  <div className="flex items-center gap-2 text-[#868698] text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#C8A951]" />
                    <span>مدت زمان انقضای نشست (Idle Timeout)</span>
                  </div>
                  <div className="mt-2 font-mono text-sm font-bold text-[#EDEDED]">
                    {isEditing ? (
                      <select
                        value={editTimeout}
                        onChange={(e) => setEditTimeout(Number(e.target.value))}
                        className="w-full bg-[#181822] border border-[#2E2E40] rounded-lg px-2 py-1 text-xs text-[#E5C365] focus:outline-none"
                      >
                        <option value={15}>۱۵ دقیقه (پیشنهاد خزانه‌داری)</option>
                        <option value={30}>۳۰ دقیقه</option>
                        <option value={60}>۶۰ دقیقه</option>
                        <option value={120}>۱۲۰ دقیقه</option>
                      </select>
                    ) : (
                      `${policy.sessionTimeoutMinutes} دقیقه`
                    )}
                  </div>
                </div>

                {/* Max Concurrent Sessions */}
                <div className="p-3 rounded-xl bg-[#14141B] border border-[#242432]">
                  <div className="flex items-center gap-2 text-[#868698] text-[11px]">
                    <Laptop className="w-3.5 h-3.5 text-[#0091FF]" />
                    <span>سقف دستگاه‌های همزمان</span>
                  </div>
                  <div className="mt-2 font-mono text-sm font-bold text-[#EDEDED]">
                    {isEditing ? (
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={editMaxSessions}
                        onChange={(e) => setEditMaxSessions(Number(e.target.value))}
                        className="w-full bg-[#181822] border border-[#2E2E40] rounded-lg px-2 py-1 text-xs text-[#E5C365] focus:outline-none"
                      />
                    ) : (
                      `${policy.maxConcurrentSessions} دستگاه`
                    )}
                  </div>
                </div>

                {/* Step Up Threshold */}
                <div className="p-3 rounded-xl bg-[#14141B] border border-[#242432]">
                  <div className="flex items-center gap-2 text-[#868698] text-[11px]">
                    <Scale className="w-3.5 h-3.5 text-[#3DD68C]" />
                    <span>آستانه احراز مجدد مرحله‌ای</span>
                  </div>
                  <div className="mt-2 font-mono text-sm font-bold text-[#EDEDED]">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={1000}
                          value={editThresholdGrams}
                          onChange={(e) => setEditThresholdGrams(Number(e.target.value))}
                          className="w-20 bg-[#181822] border border-[#2E2E40] rounded-lg px-2 py-1 text-xs text-[#E5C365] focus:outline-none"
                        />
                        <span className="text-[10px] text-[#868698]">گرم طلا</span>
                      </div>
                    ) : (
                      `${policy.stepUpThresholdGrams} گرم طلا`
                    )}
                  </div>
                </div>

                {/* MFA Enforce toggle in edit */}
                <div className="p-3 rounded-xl bg-[#14141B] border border-[#242432]">
                  <div className="flex items-center gap-2 text-[#868698] text-[11px]">
                    <Cpu className="w-3.5 h-3.5 text-[#C084FC]" />
                    <span>وضعیت الزام دوعاملی</span>
                  </div>
                  <div className="mt-2 text-xs font-bold">
                    {isEditing ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editMfaRequired}
                          onChange={(e) => setEditMfaRequired(e.target.checked)}
                          className="w-4 h-4 rounded text-[#C8A951] bg-[#181822] border-[#2E2E40]"
                        />
                        <span className="text-xs text-[#EDEDED]">الزام سراسری MFA</span>
                      </label>
                    ) : (
                      <span className={policy.isMfaRequired ? 'text-[#3DD68C]' : 'text-[#868698]'}>
                        {policy.isMfaRequired ? 'فعال و اجباری' : 'غیراجباری'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
