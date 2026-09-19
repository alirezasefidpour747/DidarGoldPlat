/**
 * Didar Gold Platform - Kernel 17 (K17)
 * Ownership Transfer & Secondary Sale Modal
 * (فرم انتقال سند مالکیت دیجیتال طلا به خریدار جدید / هدیه)
 */

import React, { useState } from 'react';
import {
  X,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  KeyRound,
  UserCheck,
  Award
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { OwnershipClaim } from '../../types/k17.js';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: OwnershipClaim | null;
  onSuccess: (updatedClaim: OwnershipClaim, message: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  claim,
  onSuccess
}) => {
  const [step, setStep] = useState<'request' | 'otp'>('request');

  // Request form
  const [newOwnerNameFa, setNewOwnerNameFa] = useState('');
  const [newOwnerNationalId, setNewOwnerNationalId] = useState('');
  const [newOwnerMobile, setNewOwnerMobile] = useState('');
  const [reasonFa, setReasonFa] = useState('انتقال سند و فروش ثانویه با تضمین اصالت');

  // OTP state
  const [activeTransferId, setActiveTransferId] = useState<string>('');
  const [simulatedOtpCode, setSimulatedOtpCode] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !claim) return null;

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newOwnerNameFa.trim() || !newOwnerNationalId.trim() || !newOwnerMobile.trim()) {
      setError('مشخصات کامل خریدار جدید الزامی است.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.requestK17Transfer({
        claimId: claim.id,
        newOwnerNameFa: newOwnerNameFa.trim(),
        newOwnerNationalId: newOwnerNationalId.trim(),
        newOwnerMobile: newOwnerMobile.trim(),
        reasonFa: reasonFa.trim()
      });

      if (res.success) {
        setActiveTransferId(res.transfer.id);
        setSimulatedOtpCode(res.transfer.otpSimulatedCode || '12345');
        setOtpInput(res.transfer.otpSimulatedCode || '');
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت درخواست انتقال');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpInput.trim()) {
      setError('کد ۵ رقمی تأیید پیامک‌شده را وارد نمایید.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.confirmK17Transfer({
        transferId: activeTransferId,
        otpCode: otpInput.trim()
      });

      if (res.success) {
        onSuccess(res.updatedClaim, res.message);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'خطا در تأیید انتقال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#181822] border border-[#36364A] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1F1F2C] border-b border-[#2B2B3C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C8A951]/20 border border-[#C8A951]/40 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-[#E5C365]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#EDEDED]">
                انتقال رسمی سند مالکیت طلا (K17)
              </h3>
              <p className="text-[11px] text-[#8E8EA0]">
                واگذاری سند و استمرار گارانتی اصالت به خریدار جدید
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#242432] text-[#8E8EA0] hover:text-[#EDEDED] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 flex items-center gap-2 text-xs text-[#FF8B8B]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current piece & owner snapshot */}
          <div className="p-3.5 rounded-2xl bg-[#14141C] border border-[#2B2B3C] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8E8EA0] block">قطعه در حال انتقال:</span>
              <span className="font-bold text-xs text-[#EDEDED]">{claim.itemSpec.productTitleFa}</span>
              <span className="font-mono text-[11px] text-[#C8A951] block mt-0.5">{claim.itemSpec.uid}</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-[#8E8EA0] block">مالک فعلی:</span>
              <span className="font-semibold text-xs text-[#EDEDED]">{claim.consumer.fullNameFa}</span>
              <span className="font-mono text-[10px] text-[#8E8EA0] block">{claim.consumer.mobile}</span>
            </div>
          </div>

          {step === 'request' ? (
            <form onSubmit={handleInitiate} className="space-y-3.5">
              <span className="text-[11px] font-bold text-[#3DD68C] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>مشخصات خریدار یا گیرنده جدید</span>
              </span>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  نام و نام خانوادگی خریدار جدید *
                </label>
                <input
                  type="text"
                  value={newOwnerNameFa}
                  onChange={(e) => setNewOwnerNameFa(e.target.value)}
                  placeholder="مثال: مریم شایان"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#8E8EA0] mb-1">
                    کد ملی (۱۰ رقم) *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={newOwnerNationalId}
                    onChange={(e) => setNewOwnerNationalId(e.target.value)}
                    placeholder="0948877665"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs font-mono focus:border-[#C8A951] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E8EA0] mb-1">
                    شماره موبایل خریدار جدید *
                  </label>
                  <input
                    type="tel"
                    maxLength={11}
                    value={newOwnerMobile}
                    onChange={(e) => setNewOwnerMobile(e.target.value)}
                    placeholder="09158884433"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs font-mono focus:border-[#C8A951] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  علت واگذاری / یادداشت
                </label>
                <input
                  type="text"
                  value={reasonFa}
                  onChange={(e) => setReasonFa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#262634]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#222230] text-[#8E8EA0] text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D4B763] text-[#141416] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'ارسال کد OTP...' : 'ارسال کد تأیید پیامکی به خریدار'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConfirmOtp} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#C8A951]/10 border border-[#C8A951]/30 text-center space-y-2">
                <KeyRound className="w-8 h-8 text-[#E5C365] mx-auto" />
                <h4 className="font-bold text-xs text-[#EDEDED]">
                  کد تأیید پیامکی شبیه‌سازی‌شده (OTP)
                </h4>
                <p className="text-[11px] text-[#9E9EA8]">
                  کد ۵ رقمی به شماره <span className="font-mono text-[#E5C365]">{newOwnerMobile}</span> پیامک شد:
                </p>
                <div className="inline-block px-4 py-1.5 rounded-xl bg-[#262638] text-[#E5C365] font-mono text-base font-bold tracking-widest border border-[#C8A951]/40">
                  {simulatedOtpCode}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1 text-center">
                  کد ۵ رقمی دریافتی را وارد فرمایید:
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#E5C365] text-lg font-mono font-bold tracking-widest focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#262634]">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="text-xs text-[#8E8EA0] hover:text-[#EDEDED]"
                >
                  ویرایش شماره و مشخصات
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-[#222230] text-[#8E8EA0] text-xs"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-[#3DD68C] hover:bg-[#32B877] text-[#141416] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'در حال ثبت انتقال...' : 'تأیید نهایی و صدور سند جدید'}
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
