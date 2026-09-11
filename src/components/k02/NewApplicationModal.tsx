import React, { useState } from 'react';
import { X, Plus, ShieldCheck, User, Building2 } from 'lucide-react';
import { OnboardingApplication, TrustTier } from '../../types/k02.js';
import { Party, Organization } from '../../types/k01.js';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<OnboardingApplication>) => Promise<void>;
  persons: Party[];
  organizations: Organization[];
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  persons,
  organizations
}) => {
  const [targetType, setTargetType] = useState<'person' | 'organization'>('person');
  const [selectedId, setSelectedId] = useState<string>('');
  const [requestedTier, setRequestedTier] = useState<TrustTier>('TIER_1_BASIC');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    setLoading(true);
    try {
      let applicantName = '';
      if (targetType === 'person') {
        const p = persons.find((item) => item.id === selectedId);
        applicantName = p ? `${p.firstName} ${p.lastName}` : '';
      } else {
        const o = organizations.find((item) => item.id === selectedId);
        applicantName = o ? o.displayName : '';
      }

      await onSubmit({
        partyId: targetType === 'person' ? selectedId : undefined,
        organizationId: targetType === 'organization' ? selectedId : undefined,
        applicantName,
        applicantType: targetType,
        targetTier: requestedTier,
        status: 'SUBMITTED',
        statusFa: 'ثبت شده و در صف بررسی',
        riskLevel: 'LOW',
        assignedOfficer: 'واحد پذیرش و انطباق دیدار'
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1C1C26] border border-[#2F2F40] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#2B2B3C]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C8A951]/20 text-[#E5C365] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">ثبت پرونده پذیرش جدید (K02)</h3>
          </div>
          <button onClick={onClose} className="text-[#8E8E9F] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#14141E] rounded-xl border border-[#2B2B3C]">
            <button
              type="button"
              onClick={() => {
                setTargetType('person');
                setSelectedId('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                targetType === 'person'
                  ? 'bg-[#C8A951] text-[#141416]'
                  : 'text-[#8E8E9F] hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              شخص حقیقی
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetType('organization');
                setSelectedId('');
              }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                targetType === 'organization'
                  ? 'bg-[#C8A951] text-[#141416]'
                  : 'text-[#8E8E9F] hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              شخصیت حقوقی / گالری
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A6A6B8] mb-1.5">
              انتخاب طرف حساب (Party)
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
              className="w-full text-xs px-3 py-2.5 bg-[#14141E] border border-[#2B2B3C] rounded-xl text-white focus:outline-none focus:border-[#C8A951]"
            >
              <option value="">-- انتخاب نمایید --</option>
              {targetType === 'person'
                ? persons.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} (کد ملی: {p.nationalId})
                    </option>
                  ))
                : organizations.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.displayName} (شناسه ملی: {o.nationalCompanyId})
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A6A6B8] mb-1.5">
              سطح وثوق و اعتبار درخواستی (Target Trust Tier)
            </label>
            <select
              value={requestedTier}
              onChange={(e) => setRequestedTier(e.target.value as TrustTier)}
              className="w-full text-xs px-3 py-2.5 bg-[#14141E] border border-[#2B2B3C] rounded-xl text-white focus:outline-none focus:border-[#C8A951]"
            >
              <option value="TIER_1_BASIC">سطح ۱: پایه (معاملات نقدی تا ۵۰ گرم)</option>
              <option value="TIER_2_VERIFIED">سطح ۲: احراز شده (سقف ۵۰۰ گرم، اعتباری ۳ روزه)</option>
              <option value="TIER_3_COMMERCIAL">سطح ۳: تجاری ویژه (سقف ۵ کیلوگرم، حساب باز)</option>
              <option value="TIER_4_STRATEGIC">سطح ۴: استراتژیک بنکداری و سازنده عمده</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A6A6B8] mb-1.5">
              یادداشت و مستندات ارائه‌شده
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="توضیحات معرفی‌نامه، ضمانت‌نامه طلا یا سوابق صنفی..."
              className="w-full text-xs px-3 py-2.5 bg-[#14141E] border border-[#2B2B3C] rounded-xl text-white focus:outline-none focus:border-[#C8A951]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2B2B3C]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#8E8E9F] hover:text-white rounded-xl bg-[#14141E] border border-[#2B2B3C]"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading || !selectedId}
              className="px-5 py-2 text-xs font-bold text-[#141416] bg-[#C8A951] hover:bg-[#D9B961] rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'در حال ثبت...' : 'ثبت در کارتابل بررسی'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
