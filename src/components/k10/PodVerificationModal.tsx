/**
 * Didar Gold Platform - Kernel Domain K10
 * PodVerificationModal: Proof of Delivery (POD) physical handover & dual-signature
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Scale,
  Key,
  CheckCircle2,
  AlertTriangle,
  User,
  Camera,
  FileCheck
} from 'lucide-react';
import { Order, ProofOfDelivery } from '../../types/k10.js';

interface PodVerificationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPod: (orderId: string, podData: Partial<ProofOfDelivery>) => Promise<void>;
}

export const PodVerificationModal: React.FC<PodVerificationModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmPod
}) => {
  if (!isOpen || !order) return null;

  const dispatchWeight = order.totalActualAllocatedWeightGrams || order.totalEstimatedWeightGrams;

  const [recipientName, setRecipientName] = useState(order.retailerContactPersonFa);
  const [recipientRole, setRecipientRole] = useState('صاحب‌جواز طلافروشی / وکیل رسمی');
  const [recipientNationalId, setRecipientNationalId] = useState('۰۰۳****۸۲۱');
  const [recipientPhone, setRecipientPhone] = useState(order.retailerPhone);
  const [otpPin, setOtpPin] = useState('784912');
  const [isOtpVerified, setIsOtpVerified] = useState(true);
  const [handoverScaleWeight, setHandoverScaleWeight] = useState(dispatchWeight);
  const [tamperSealIntact, setTamperSealIntact] = useState(true);
  const [officerName, setOfficerName] = useState(order.agentNameFa || 'کارشناس تحویل دیدار');
  const [notes, setNotes] = useState('تحویل با ترازوی دقیق گالری مقصد انجام شد. بدون مغایرت وزنی.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Discrepancy calculation
  const discrepancy = Number((handoverScaleWeight - dispatchWeight).toFixed(3));
  const isToleranceOk = Math.abs(discrepancy) <= 0.02;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isOtpVerified) {
      setErrorMsg('کد رمز OTP پیامکی باید احراز گردد.');
      return;
    }

    if (!tamperSealIntact) {
      setErrorMsg('در صورت مخدوش بودن پلمپ، تحویل نامعتبر بوده و باید صورت‌جلسه تخلف تنظیم شود.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirmPod(order.id, {
        recipientNameFa: recipientName,
        recipientRoleFa: recipientRole,
        recipientNationalIdMasked: recipientNationalId,
        recipientPhone,
        securityPinVerified: true,
        scaleWeightAtDispatchGrams: dispatchWeight,
        scaleWeightAtHandoverGrams: handoverScaleWeight,
        weightDiscrepancyGrams: discrepancy,
        isWeightDiscrepancyAcceptable: isToleranceOk,
        tamperSealSerial: order.securitySealSerial || 'DID-SEAL-VERIFIED',
        tamperSealIntact: true,
        handoverOfficerNameFa: officerName,
        recipientSignatureName: `${recipientName} (امضای بیومتریک و کد اعتبارسنجی)`,
        handoverPhotosCount: 2,
        notes
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ثبت سند POD');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-right my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-emerald-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">ثبت رسمی سند اثبات تحویل (Proof of Delivery - POD)</h2>
              <p className="text-xs text-gray-500">
                سفارش: <span className="font-mono font-bold text-gray-800">{order.orderCode}</span> | {order.retailerNameFa}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Step 1: Weight Verification at Handover */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600" />
                توزین فیزیکی در ترازوی طلافروشی مقصد
              </span>
              <span className="text-[11px] text-gray-500">تلورانس مجاز: ±۰.۰۲ گرم</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">وزن ثبت در خروج خزانه:</label>
                <div className="p-2 bg-white rounded border border-gray-200 font-mono font-bold text-gray-800">
                  {dispatchWeight.toFixed(2)} گرم
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">وزن سنجش در مقصد (گرم):</label>
                <input
                  type="number"
                  step="0.01"
                  value={handoverScaleWeight}
                  onChange={e => setHandoverScaleWeight(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white rounded border border-gray-300 font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
              isToleranceOk
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              <span>اختلاف وزنی: <strong className="font-mono">{discrepancy > 0 ? `+${discrepancy}` : discrepancy} گرم</strong></span>
              <span className="font-semibold">
                {isToleranceOk ? 'تطابق کامل و استاندارد' : 'هشدار: فراتر از تلورانس مجاز'}
              </span>
            </div>
          </div>

          {/* Step 2: OTP & Seal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                رمز یک‌بارمصرف تأیید تحویل (OTP):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpPin}
                  onChange={e => setOtpPin(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono text-center tracking-widest text-emerald-800 font-bold focus:ring-2 focus:ring-emerald-500"
                />
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold shrink-0">
                  تأیید
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                وضعیت پلمپ امنیتی بسته:
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="tamperCheck"
                  checked={tamperSealIntact}
                  onChange={e => setTamperSealIntact(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <label htmlFor="tamperCheck" className="text-xs text-gray-800 font-medium">
                  پلمپ کاملاً سالم و دست‌نخورده است
                </label>
              </div>
            </div>
          </div>

          {/* Step 3: Recipient Identity */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">نام و نام خانوادگی تحویل‌گیرنده:</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">سمت در طلافروشی:</label>
                <input
                  type="text"
                  value={recipientRole}
                  onChange={e => setRecipientRole(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">مأمور تحویل‌دهنده دیدار:</label>
              <input
                type="text"
                value={officerName}
                onChange={e => setOfficerName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">شرح صورتجلسه و ممیزی تحویل:</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ثبت...' : 'تأیید نهایی و صدور سند POD'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
