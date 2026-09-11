/**
 * Didar Gold Platform - K04: Approval Decision Modal
 * Four-Eyes Principle (SoD) Enforcement & Digital Signature Signing
 */

import React, { useState } from 'react';
import {
  ApprovalRequest,
  ApprovalStep
} from '../../types/k04.js';
import {
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  User,
  Scale,
  DollarSign,
  Fingerprint
} from 'lucide-react';

interface ApprovalModalProps {
  request: ApprovalRequest;
  onClose: () => void;
  onApprove: (requestId: string, stepNumber: number, actorId: string, actorName: string, actorRoleFa: string, notes: string) => Promise<void>;
  onReject: (requestId: string, stepNumber: number, actorId: string, actorName: string, actorRoleFa: string, reason: string) => Promise<void>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  onClose,
  onApprove,
  onReject
}) => {
  const [selectedActor, setSelectedActor] = useState<{ id: string; name: string; roleFa: string }>({
    id: 'usr-001',
    name: 'امیرحسین رضایی',
    roleFa: 'مدیر ارشد سامانه و امنیت'
  });

  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentStep = request.steps.find(s => s.stepNumber === request.currentStepNumber);
  const isInitiatorSelected = selectedActor.id === request.initiatorId;

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!currentStep) return;

    if (actionType === 'approve') {
      if (isInitiatorSelected) {
        setErrorMessage('خطای اصل چهارچشم (SoD): ثبت‌کننده درخواست نمی‌تواند اقدام به تأیید درخواست خود نماید.');
        return;
      }
      try {
        setIsSubmitting(true);
        await onApprove(
          request.id,
          currentStep.stepNumber,
          selectedActor.id,
          selectedActor.name,
          selectedActor.roleFa,
          notes || 'مورد تأیید و انطباق کامل قرار گرفت.'
        );
        onClose();
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'خطا در ثبت تایید.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!rejectReason.trim()) {
        setErrorMessage('لطفاً دلیل عدم انطباق یا رد درخواست را ثبت کنید.');
        return;
      }
      try {
        setIsSubmitting(true);
        await onReject(
          request.id,
          currentStep.stepNumber,
          selectedActor.id,
          selectedActor.name,
          selectedActor.roleFa,
          rejectReason
        );
        onClose();
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'خطا در رد درخواست.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181822] border border-[#313144] rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#2B2B3C]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#242436] text-[#C8A951] border border-[#3A3A52]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#2B281B] text-[#C8A951] border border-[#C8A951]/40 font-bold">
                  {request.requestCode}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#232332] text-[#9A9AB0]">
                  {request.categoryTitleFa}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#EDEDED] mt-1">{request.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8A8A9C] hover:text-[#EDEDED] hover:bg-[#262638] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Details Overview */}
          <div className="p-4 rounded-xl bg-[#13131A] border border-[#262636] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[#7A7A8E] block">طرف حساب:</span>
              <span className="font-medium text-[#E0E0E8]">{request.partyNameFa || 'عمومی'}</span>
            </div>
            <div>
              <span className="text-[#7A7A8E] block">وزن طلا:</span>
              <span className="font-medium text-[#E5C365] flex items-center gap-1 font-mono">
                <Scale className="w-3.5 h-3.5" />
                {request.goldWeightGrams ? `${request.goldWeightGrams.toLocaleString()} گرم` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[#7A7A8E] block">ارزش ریالی تخمینی:</span>
              <span className="font-medium text-[#EDEDED] flex items-center gap-1 font-mono">
                <DollarSign className="w-3.5 h-3.5 text-[#3DD68C]" />
                {request.financialValueIrr ? `${request.financialValueIrr.toLocaleString()} ریال` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[#7A7A8E] block">ثبت‌کننده (Maker):</span>
              <span className="font-medium text-[#B5B5C4]">{request.initiatorName} ({request.initiatorRoleFa})</span>
            </div>
            <div>
              <span className="text-[#7A7A8E] block">تاریخ و ساعت ثبت:</span>
              <span className="font-mono text-[#9E9EA8]">{request.createdAt}</span>
            </div>
            <div>
              <span className="text-[#7A7A8E] block">فوریت عملیاتی:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                request.urgency === 'critical' ? 'bg-[#3A141A] text-[#FF6B6B]' :
                request.urgency === 'high' ? 'bg-[#382613] text-[#E5A84B]' : 'bg-[#182B20] text-[#3DD68C]'
              }`}>
                {request.urgency === 'critical' ? 'بسیار فوری / بحرانی' : request.urgency === 'high' ? 'فوری' : 'عادی'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 rounded-xl bg-[#161620] border border-[#2A2A3C] text-xs leading-relaxed text-[#B5B5C6]">
            <span className="font-semibold text-[#EDEDED] block mb-1">شرح عملیات و مستندات:</span>
            {request.description}
          </div>

          {/* Multi-Step Approval Progress */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#E5C365]">مراحل گردش‌کار تفکیک وظایف (Four-Eyes Workflow):</h4>
            <div className="space-y-2">
              {request.steps.map((step) => {
                const isCurrent = step.stepNumber === request.currentStepNumber && request.status !== 'approved';
                const isPassed = step.status === 'approved';

                return (
                  <div
                    key={step.stepNumber}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      isPassed
                        ? 'bg-[#14231A] border-[#254A34] text-[#C4E8D2]'
                        : isCurrent
                        ? 'bg-[#252014] border-[#C8A951]/60 text-[#F0E6D2]'
                        : 'bg-[#14141C] border-[#222230] text-[#6E6E80]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                          isPassed ? 'bg-[#3DD68C] text-[#0E2014]' : isCurrent ? 'bg-[#C8A951] text-[#141416]' : 'bg-[#222230] text-[#7A7A8E]'
                        }`}>
                          {step.stepNumber}
                        </span>
                        <span className="font-semibold">{step.titleFa}</span>
                      </div>

                      <span className="text-[11px] font-mono">
                        {isPassed ? (
                          <span className="flex items-center gap-1 text-[#3DD68C]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            تأیید شد ({step.actorName})
                          </span>
                        ) : isCurrent ? (
                          <span className="flex items-center gap-1 text-[#E5C365]">
                            <Clock className="w-3.5 h-3.5" />
                            در انتظار تصمیم‌گیری
                          </span>
                        ) : (
                          <span>مرحله بعدی</span>
                        )}
                      </span>
                    </div>

                    {step.notes && (
                      <p className="mt-2 text-[11px] text-[#A6A6BC] bg-black/30 p-2 rounded-lg border border-white/5">
                        «{step.notes}»
                      </p>
                    )}

                    {step.digitalSignature && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-[#7A7A8E]">
                        <Fingerprint className="w-3 h-3 text-[#C8A951]" />
                        <span>امضای دیجیتال رمزنگاری‌شده: {step.digitalSignature}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Choice: Approve vs Reject */}
          <div className="p-4 rounded-xl bg-[#14141C] border border-[#2B2B3C] space-y-3">
            <h4 className="text-xs font-bold text-[#EDEDED]">تعیین ناظر اقدام‌کننده و تصمیم نهایی:</h4>

            {/* Actor Switcher to demonstrate SoD violation blocking vs legitimate approval */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-[#7A7A8E] block mb-1">هویت ناظر تصمیم‌گیرنده:</label>
                <select
                  value={selectedActor.id}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id === 'usr-001') {
                      setSelectedActor({ id: 'usr-001', name: 'امیرحسین رضایی', roleFa: 'مدیر ارشد سامانه و امنیت' });
                    } else if (id === 'usr-002') {
                      setSelectedActor({ id: 'usr-002', name: 'مهرداد خزایی', roleFa: 'متصدی ارشد خزانه‌داری' });
                    } else if (id === 'usr-004') {
                      setSelectedActor({ id: 'usr-004', name: 'سارا معتمدی', roleFa: 'کارشناس انطباق و ریسک' });
                    }
                  }}
                  className="w-full bg-[#1C1C26] border border-[#313144] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
                >
                  <option value="usr-001">امیرحسین رضایی (مدیر ارشد سامانه و امنیت)</option>
                  <option value="usr-002">مهرداد خزایی (متصدی ارشد خزانه‌داری - ثبت‌کننده)</option>
                  <option value="usr-004">سارا معتمدی (کارشناس انطباق و ریسک اعتباری)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#7A7A8E] block mb-1">تصمیم نهایی:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType('approve')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      actionType === 'approve'
                        ? 'bg-[#2E5438] text-[#48E59B] border border-[#3DD68C]/50'
                        : 'bg-[#1C1C26] text-[#8A8A9E] border border-[#2D2D3E]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تأیید و امضا
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('reject')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      actionType === 'reject'
                        ? 'bg-[#4A1E24] text-[#FF7A7A] border border-[#FF5252]/50'
                        : 'bg-[#1C1C26] text-[#8A8A9E] border border-[#2D2D3E]'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    رد درخواست
                  </button>
                </div>
              </div>
            </div>

            {/* Strict Four-Eyes Warning if Maker is chosen as Checker */}
            {isInitiatorSelected && (
              <div className="p-3 rounded-xl bg-[#3A141A] border border-[#FF5252]/40 text-[#FF8585] text-xs flex items-start gap-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF5252]" />
                <div>
                  <span className="font-bold block">هشدار تفکیک وظایف (SoD Violation Prevention):</span>
                  شما در حال حاضر به عنوان <strong>{request.initiatorName}</strong> (ثبت‌کننده اولیه) انتخاب شده‌اید. سیستم اجازه تأیید این درخواست را به شما نخواهد داد تا از تقلب و سوءاستفاده مالی جلوگیری شود.
                </div>
              </div>
            )}

            {actionType === 'approve' ? (
              <div>
                <label className="text-[11px] text-[#7A7A8E] block mb-1">توضیحات و دستور خزانه‌داری (اختیاری):</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: کنترل فیزیکی هولوگرام و وزن شمش تأیید شد و ترخیص بلامانع است."
                  className="w-full bg-[#1C1C26] border border-[#313144] rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
                />
              </div>
            ) : (
              <div>
                <label className="text-[11px] text-[#FF8585] block mb-1">دلیل رد درخواست و عدم انطباق (الزامی):</label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="علت رد درخواست؛ مثال: مغایرت در عیار اعلامی، نقص در وثیقه شمش امانی یا عدم رعایت سقف اعتبار..."
                  className="w-full bg-[#1C1C26] border border-[#FF5252]/50 rounded-lg px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#FF5252]"
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#331118] border border-[#FF4D4D] text-[#FF8585] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#2B2B3C] flex items-center justify-between">
          <div className="text-[11px] text-[#767688]">
            اصل چهارچشم • ثبت در دفتر کل تغییرناپذیر SHA-256
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#222230] text-[#B5B5C4] hover:bg-[#2C2C3E] transition-colors"
            >
              انصراف
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (actionType === 'approve' && isInitiatorSelected)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                actionType === 'approve'
                  ? 'bg-[#C8A951] text-[#141416] hover:bg-[#D8B75B] disabled:opacity-50'
                  : 'bg-[#FF4D4D] text-white hover:bg-[#FF3333] disabled:opacity-50'
              }`}
            >
              {isSubmitting ? (
                <span>در حال ثبت...</span>
              ) : actionType === 'approve' ? (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>تأیید رسمی و صدور امضای دیجیتال</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>رد قطعی درخواست</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
