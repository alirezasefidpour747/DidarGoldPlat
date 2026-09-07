/**
 * Didar Gold Platform - Domain K03 Step-Up Authentication Simulator
 * Demonstrates high-risk transaction verification (e.g. 250g gold transfer / IBAN change)
 */

import React, { useState } from 'react';
import { UserAccount, MfaMethod } from '../../types/k03.js';
import {
  X,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Smartphone,
  Cpu,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

interface StepUpSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount | null;
  onSimulateStepUp: (
    userId: string,
    operationFa: string,
    amountGrams: number,
    method: MfaMethod,
    code: string
  ) => Promise<{ success: boolean; message: string }>;
}

export const StepUpSimulatorModal: React.FC<StepUpSimulatorModalProps> = ({
  isOpen,
  onClose,
  account,
  onSimulateStepUp
}) => {
  const [selectedOp, setSelectedOp] = useState<string>('ثبت سفارش خرید شمش طلای ۱۸ عیار از تالار');
  const [goldWeightGrams, setGoldWeightGrams] = useState<number>(250);
  const [selectedMethod, setSelectedMethod] = useState<MfaMethod>('totp');
  const [challengeCode, setChallengeCode] = useState<string>('839210');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen || !account) return null;

  const threshold = account.securitySettings.stepUpAuthThresholdGrams || 50;
  const requiresStepUp = goldWeightGrams >= threshold;

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setResult(null);
    try {
      const res = await onSimulateStepUp(
        account.id,
        selectedOp,
        goldWeightGrams,
        selectedMethod,
        challengeCode
      );
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در احراز مرحله‌ای.';
      setResult({ success: false, message: msg });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#16161F] border border-[#2F2F42] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252534] bg-[#13131A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3DD68C]/15 flex items-center justify-center border border-[#3DD68C]/30">
              <Zap className="w-5 h-5 text-[#3DD68C]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#EDEDED] flex items-center gap-2">
                <span>شبیه‌ساز احراز هویت مرحله‌ای صنف طلا (Step-Up Challenge)</span>
              </h2>
              <p className="text-[11px] text-[#868698]">
                آزمایش تاییدیه امنیتی آنی هنگام جابجایی مقادیر بالای طلا یا عملیات با ریسک بالا
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#868698] hover:text-[#EDEDED] hover:bg-[#20202D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* User & Threshold Status */}
          <div className="p-4 rounded-2xl bg-[#1B1B26] border border-[#2B2B3C] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#EDEDED]">کاربر هدف: {account.fullName}</div>
              <div className="text-[11px] text-[#868698] mt-0.5">
                نقش: {account.roleTitleFa} • سقف آستانه احراز مجدد: <span className="text-[#C8A951] font-bold font-mono">{threshold} گرم طلا</span>
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              requiresStepUp
                ? 'bg-[#E5484D]/15 text-[#FF6B6B] border-[#E5484D]/30'
                : 'bg-[#3DD68C]/15 text-[#3DD68C] border-[#3DD68C]/30'
            }`}>
              {requiresStepUp ? 'نیازمند چالش فوری MFA' : 'در محدوده مجاز عادی'}
            </div>
          </div>

          {/* Operation Selector */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-[#868698] block mb-1 font-medium">نوع عملیات بانکی / خزانه‌داری طلا:</label>
              <select
                value={selectedOp}
                onChange={(e) => setSelectedOp(e.target.value)}
                className="w-full bg-[#121218] border border-[#2B2B3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                <option value="ثبت سفارش خرید شمش طلای ۱۸ عیار از تالار">ثبت سفارش خرید شمش طلای ۱۸ عیار از تالار معاملات</option>
                <option value="تخصیص خط اعتباری و حواله تسویه دفتری K16">تخصیص خط اعتباری و حواله تسویه دفتری K16</option>
                <option value="درخواست ترخیص و تحویل فیزیکی شمش از خزانه‌داری مرکزی">درخواست ترخیص و تحویل فیزیکی شمش از خزانه‌داری مرکزی</option>
                <option value="تغییر شماره شبای بانکی جهت تسویه ریالی">تغییر شماره شبای بانکی جهت تسویه ریالی طلا</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#868698] block mb-1 font-medium">
                وزن طلا / معادل عملیات (گرم):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={goldWeightGrams}
                  onChange={(e) => setGoldWeightGrams(Number(e.target.value))}
                  className="w-32 bg-[#121218] border border-[#2B2B3C] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#E5C365] focus:outline-none focus:border-[#C8A951]"
                />
                <span className="text-xs text-[#9E9EA8]">گرم طلای ۲۴ عیار استاندارد</span>
              </div>
            </div>

            {/* Challenge Method */}
            <div>
              <label className="text-[11px] text-[#868698] block mb-1 font-medium">کانال ارسال چالش امنیتی:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'totp', label: 'کد TOTP', icon: Smartphone },
                  { id: 'sms_otp', label: 'پیامک OTP', icon: Smartphone },
                  { id: 'security_key', label: 'کلید FIDO2', icon: Cpu }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as MfaMethod)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                      selectedMethod === m.id
                        ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#E5C365] font-bold'
                        : 'bg-[#181822] border-[#2B2B3C] text-[#868698] hover:text-[#EDEDED]'
                    }`}
                  >
                    <m.icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Code Input */}
            <div>
              <label className="text-[11px] text-[#868698] block mb-1 font-medium">
                پاسخ به چالش (کد ۶ رقمی دریافتی کاربر):
              </label>
              <input
                type="text"
                value={challengeCode}
                onChange={(e) => setChallengeCode(e.target.value)}
                placeholder="۱۲۳۴۵۶"
                className="w-full bg-[#121218] border border-[#2B2B3C] rounded-xl px-4 py-2 text-center text-base font-mono tracking-widest text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          {/* Simulation Output */}
          {result && (
            <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
              result.success
                ? 'bg-[#3DD68C]/15 border-[#3DD68C]/30 text-[#3DD68C]'
                : 'bg-[#E5484D]/15 border-[#E5484D]/30 text-[#FF6B6B]'
            }`}>
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#3DD68C]" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 text-[#FF6B6B]" />
              )}
              <div className="leading-relaxed">{result.message}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#252534] bg-[#13131A] flex items-center justify-between">
          <span className="text-[11px] text-[#7E7E90]">
            این رویداد بلافاصله در ردپای حسابرسی K01 و لاگ امنیت K03 ثبت می‌شود.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#20202D] text-[#EDEDED] hover:bg-[#2A2A3C] text-xs font-semibold cursor-pointer"
            >
              انصراف
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#3DD68C] text-[#141416] hover:bg-[#4AE096] text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isSimulating ? 'در حال تایید چالش...' : 'اجرای شبیه‌سازی Step-Up'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
