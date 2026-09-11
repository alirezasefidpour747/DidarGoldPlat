import React from 'react';
import { X, Award, Shield, CheckCircle2, Coins } from 'lucide-react';
import { TrustTierConfig } from '../../types/k02.js';

interface TrustTierMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  tierConfigs: Record<string, TrustTierConfig>;
}

export const TrustTierMatrixModal: React.FC<TrustTierMatrixModalProps> = ({
  isOpen,
  onClose,
  tierConfigs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#1C1C26] border border-[#2F2F40] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-[#2B2B3C] bg-[#14141E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C8A951]/20 text-[#E5C365] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ماتریس سطوح وثوق و اعتبارات تجاری دیدار (Trust Tier Matrix)</h3>
              <p className="text-[11px] text-[#8E8E9F]">راهنمای سقف معاملات طلا، تسویه اعتباری و مدارک مورد نیاز</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8E8E9F] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {Object.entries(tierConfigs || {}).map(([tierKey, config]: [string, any]) => (
            <div key={tierKey} className="p-4 rounded-xl bg-[#14141E] border border-[#2B2B3C] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#E5C365] bg-[#C8A951]/10 px-2 py-0.5 rounded">
                    {tierKey}
                  </span>
                  <h4 className="text-sm font-bold text-white">{config?.titleFa || tierKey}</h4>
                </div>
                <span className="text-xs text-[#8E8E9F]">{config?.descriptionFa}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-[#232332]">
                <div className="p-2.5 bg-[#1C1C26] rounded-lg">
                  <span className="text-[#7A7A8A] block text-[11px]">سقف معامله روزانه:</span>
                  <span className="font-bold text-white font-mono mt-0.5 block">
                    {config?.maxDailyGoldGrams ?? config?.maxOrderGrams ?? 0} گرم طلا
                  </span>
                </div>
                <div className="p-2.5 bg-[#1C1C26] rounded-lg">
                  <span className="text-[#7A7A8A] block text-[11px]">سقف خط اعتباری:</span>
                  <span className="font-bold text-white font-mono mt-0.5 block">
                    {config?.maxCreditAllowanceGrams ?? 0} گرم طلا
                  </span>
                </div>
                <div className="p-2.5 bg-[#1C1C26] rounded-lg">
                  <span className="text-[#7A7A8A] block text-[11px]">استعلام پروانه کسب:</span>
                  <span className="font-bold text-white font-mono mt-0.5 block">
                    {config?.requiresGuildLicense ? 'الزامی' : 'اختیاری'}
                  </span>
                </div>
              </div>

              {config?.allowedFeatures && config.allowedFeatures.length > 0 && (
                <div className="text-[11px] text-[#8E8E9F] flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3DD68C]" />
                  <span>قابلیت‌ها: {config.allowedFeatures.join('، ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#14141E] border-t border-[#2B2B3C] text-left">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-[#141416] bg-[#C8A951] hover:bg-[#D9B961] rounded-xl"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
