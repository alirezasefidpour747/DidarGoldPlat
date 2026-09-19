import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckSquare,
  Square,
  Phone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  FileText,
  Clock
} from 'lucide-react';
import {
  OnboardingApplication,
  TrustTier,
  ChecklistStepKey,
  VerificationCallLog
} from '../../types/k02.js';

interface ApplicationDetailDrawerProps {
  application: OnboardingApplication | null;
  onClose: () => void;
  tierConfigs: Record<string, any>;
  onUpdateChecklistStep: (
    appId: string,
    stepKey: ChecklistStepKey,
    completed: boolean,
    notes?: string
  ) => Promise<void>;
  onLogVerificationCall: (appId: string, callLog: Partial<VerificationCallLog>) => Promise<void>;
  onMakeDecision: (
    appId: string,
    decision: 'APPROVED' | 'REJECTED' | 'CONDITIONAL',
    grantedTier?: TrustTier,
    reason?: string
  ) => Promise<void>;
}

export const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({
  application,
  onClose,
  tierConfigs,
  onUpdateChecklistStep,
  onLogVerificationCall,
  onMakeDecision
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'calls' | 'decision'>('checklist');
  const [callerName, setCallerName] = useState('کارشناس بررسی اعتبار دیدار');
  const [calledNumber, setCalledNumber] = useState('۰۲۱-۸۸۴۵۰۱۲۳');
  const [callNotes, setCallNotes] = useState('');
  const [callOutcome, setCallOutcome] = useState<'VERIFIED' | 'UNREACHABLE' | 'SUSPICIOUS'>('VERIFIED');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [selectedGrantedTier, setSelectedGrantedTier] = useState<TrustTier>(application?.targetTier || 'tier_1_identity');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (application?.targetTier) {
      setSelectedGrantedTier(application.targetTier);
    }
  }, [application?.id, application?.targetTier]);

  if (!application) return null;

  const handleStepToggle = async (stepKey: ChecklistStepKey, currentCompleted: boolean) => {
    try {
      await onUpdateChecklistStep(application.id, stepKey, !currentCompleted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callNotes.trim()) return;
    setSubmitting(true);
    try {
      await onLogVerificationCall(application.id, {
        calledNumber,
        callerName,
        notes: callNotes,
        outcome: callOutcome,
        timestamp: new Date().toISOString()
      });
      setCallNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecisionSubmit = async (decision: 'APPROVED' | 'REJECTED' | 'CONDITIONAL') => {
    setSubmitting(true);
    try {
      await onMakeDecision(
        application.id,
        decision,
        decision === 'APPROVED' ? selectedGrantedTier : undefined,
        decisionNotes
      );
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-[#181822] border-r border-[#2C2C3C] h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#2C2C3C] flex items-center justify-between bg-[#14141E]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#C8A951]/20 text-[#E5C365]">
                {application.id}
              </span>
              <span className="text-xs text-[#8E8E9F]">{application.statusFa}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">{application.applicantName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8E8E9F] hover:text-white rounded-xl hover:bg-[#20202D]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#2C2C3C] bg-[#14141E]">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'checklist'
                ? 'border-[#C8A951] text-[#E5C365]'
                : 'border-transparent text-[#7E7E8E] hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            چک‌لیست راستی‌آزمایی
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'calls'
                ? 'border-[#C8A951] text-[#E5C365]'
                : 'border-transparent text-[#7E7E8E] hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            تماس‌های اعتبارسنجی ({application.verificationCalls?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('decision')}
            className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'decision'
                ? 'border-[#C8A951] text-[#E5C365]'
                : 'border-transparent text-[#7E7E8E] hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            تصمیم‌گیری نهایی انطباق
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 flex-1 space-y-6">
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <p className="text-xs text-[#9E9EA8]">
                مراحل ارزیابی ریسک و احراز هویت طلا برای سطح وثوق{' '}
                <span className="text-[#E5C365] font-bold">{application.targetTier}</span>:
              </p>

              <div className="space-y-2">
                {Object.entries(application.checklist || {}).map(([key, step]: [string, any]) => (
                  <div
                    key={key}
                    onClick={() => handleStepToggle(key as ChecklistStepKey, step.completed)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      step.completed
                        ? 'bg-[#15231C] border-[#1E432E] text-[#DDF6E8]'
                        : 'bg-[#1C1C26] border-[#2E2E3E] text-[#B0B0C0] hover:border-[#3E3E52]'
                    }`}
                  >
                    <div className="mt-0.5">
                      {step.completed ? (
                        <CheckSquare className="w-4 h-4 text-[#3DD68C]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#6A6A7A]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white">{step.titleFa}</div>
                      {step.notes && <div className="text-[11px] text-[#8E8E9F] mt-1">{step.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="space-y-6">
              <form onSubmit={handleAddCall} className="p-4 bg-[#14141E] rounded-xl border border-[#2B2B3C] space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C8A951]" />
                  ثبت تماس استعلام صنفی یا بانکی
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#8E8E9F] mb-1">شماره تماس‌گرفته‌شده</label>
                    <input
                      type="text"
                      value={calledNumber}
                      onChange={(e) => setCalledNumber(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-[#181822] border border-[#2B2B3C] rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8E8E9F] mb-1">نتیجه تماس</label>
                    <select
                      value={callOutcome}
                      onChange={(e) => setCallOutcome(e.target.value as any)}
                      className="w-full text-xs px-2.5 py-1.5 bg-[#181822] border border-[#2B2B3C] rounded-lg text-white"
                    >
                      <option value="VERIFIED">تأیید اعتبار و سابقه مثبت</option>
                      <option value="UNREACHABLE">عدم پاسخگویی</option>
                      <option value="SUSPICIOUS">مشکوک یا اطلاعات متناقض</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-[#8E8E9F] mb-1">خلاصه مکالمه و استعلام</label>
                  <textarea
                    rows={2}
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="استعلام از هیئت امنای بازار طلا / بنکدار معرف..."
                    className="w-full text-xs px-2.5 py-1.5 bg-[#181822] border border-[#2B2B3C] rounded-lg text-white"
                  />
                </div>
                <div className="text-left">
                  <button
                    type="submit"
                    disabled={submitting || !callNotes.trim()}
                    className="px-3.5 py-1.5 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg disabled:opacity-50"
                  >
                    ثبت لاگ تماس
                  </button>
                </div>
              </form>

              {/* Call History */}
              <div className="space-y-2">
                {(application.verificationCalls || []).map((call, idx) => (
                  <div key={idx} className="p-3 bg-[#1C1C26] rounded-xl border border-[#2B2B3C] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#8E8E9F]">
                      <span className="font-mono">{call.calledNumber}</span>
                      <span>{call.outcome}</span>
                    </div>
                    <div className="text-white">{call.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'decision' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#A6A6B8] mb-1.5">
                  سطح وثوق اعطایی (Granted Trust Tier)
                </label>
                <select
                  value={selectedGrantedTier}
                  onChange={(e) => setSelectedGrantedTier(e.target.value as TrustTier)}
                  className="w-full text-xs px-3 py-2.5 bg-[#14141E] border border-[#2B2B3C] rounded-xl text-white"
                >
                  <option value="TIER_1_BASIC">سطح ۱: پایه (معاملات نقدی تا ۵۰ گرم)</option>
                  <option value="TIER_2_VERIFIED">سطح ۲: احراز شده (سقف ۵۰۰ گرم، اعتباری ۳ روزه)</option>
                  <option value="TIER_3_COMMERCIAL">سطح ۳: تجاری ویژه (سقف ۵ کیلوگرم، حساب باز)</option>
                  <option value="TIER_4_STRATEGIC">سطح ۴: استراتژیک بنکداری و سازنده عمده</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A6A6B8] mb-1.5">
                  شرح و دلایل تصمیم کمیته انطباق
                </label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="مستندات اعتباری، وثیقه طلا، نتیجه استعلام..."
                  className="w-full text-xs px-3 py-2.5 bg-[#14141E] border border-[#2B2B3C] rounded-xl text-white"
                />
              </div>

              <div className="pt-4 border-t border-[#2B2B3C] flex items-center gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDecisionSubmit('APPROVED')}
                  className="flex-1 py-2.5 bg-[#1B3F2A] hover:bg-[#245338] text-[#3DD68C] text-xs font-bold rounded-xl border border-[#2A6542] flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  تأیید و ارتقای سطح وثوق
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDecisionSubmit('REJECTED')}
                  className="flex-1 py-2.5 bg-[#3B1E22] hover:bg-[#4E282E] text-[#FF6B6B] text-xs font-bold rounded-xl border border-[#632932] flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  رد درخواست
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
