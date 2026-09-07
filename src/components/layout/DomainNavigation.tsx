/**
 * Didar Gold Platform - 20 Kernel Domains Navigation Sidebar / Bar
 * Strictly maintains exactly 20 domains K01 - K20.
 */

import React, { useState } from 'react';
import { KERNEL_DOMAINS, KernelDomain } from '../../types/domains.js';
import { useI18n } from '../../lib/i18n.js';
import { CheckCircle2, Clock, Lock, Sparkles, ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface DomainNavigationProps {
  selectedDomain: string;
  onSelectDomain: (domainId: string) => void;
}

export const DomainNavigation: React.FC<DomainNavigationProps> = ({
  selectedDomain,
  onSelectDomain
}) => {
  const { t, locale, isRTL } = useI18n();
  const [modalDomain, setModalDomain] = useState<KernelDomain | null>(null);

  const getDomainTitle = (d: KernelDomain) => {
    switch (locale) {
      case 'ar': return d.titleAr;
      case 'en': return d.titleEn;
      case 'fr': return d.titleFr;
      default: return d.titleFa;
    }
  };

  const getDomainDesc = (d: KernelDomain) => {
    return locale === 'en' || locale === 'fr' ? d.descriptionEn : d.descriptionFa;
  };

  return (
    <div className="bg-[#18181F] border-b border-[#292934] px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C8A951]">
              {t.domainList}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#242430] text-[#9E9EA8] border border-[#313140]">
              دامنه‌های فعال: K01 (هویت)، K02 (پذیرش) و K03 (احراز هویت و MFA)
            </span>
          </div>
          <div className="text-xs text-[#7A7A88] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#C8A951]" />
            <span>تسویه و تطبیق زرین در K16 (زیربخش‌های K16A و K16B) قرار دارند. بدون دامنه بیست‌ویکم.</span>
          </div>
        </div>

        {/* Horizontal scrollable list of 20 domains */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#2E2E3C]">
          {KERNEL_DOMAINS.map((domain) => {
            const isSelected = selectedDomain === domain.id;
            const isImplemented = domain.id === 'K01' || domain.id === 'K02' || domain.id === 'K03';

            return (
              <button
                key={domain.id}
                onClick={() => {
                  if (isImplemented) {
                    onSelectDomain(domain.id);
                  } else {
                    setModalDomain(domain);
                  }
                }}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#2B2616] to-[#201E17] border-[#C8A951] text-[#E5C365] shadow-sm shadow-[#C8A951]/20'
                    : isImplemented
                    ? 'bg-[#1D1D26] border-[#3F3F52] text-[#E0E0E8] hover:border-[#C8A951]/60'
                    : 'bg-[#15151B] border-[#262632] text-[#868694] hover:border-[#383848] hover:text-[#B5B5C4]'
                }`}
              >
                <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                  isSelected
                    ? 'bg-[#C8A951] text-[#141416]'
                    : isImplemented
                    ? 'bg-[#313142] text-[#E5C365]'
                    : 'bg-[#262634] text-[#8C8C9C]'
                }`}>
                  {domain.code}
                </span>

                <span className="whitespace-nowrap max-w-[140px] truncate">
                  {getDomainTitle(domain)}
                </span>

                {isImplemented ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3DD68C] flex-shrink-0" />
                ) : domain.status === 'queued' ? (
                  <Clock className="w-3.5 h-3.5 text-[#E5A84B] flex-shrink-0 opacity-70" />
                ) : (
                  <Lock className="w-3 h-3 text-[#5A5A6A] flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Domain Specification Modal */}
      {modalDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1A1A22] border border-[#333344] rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-[#2A2A38] text-[#C8A951] font-mono font-bold text-sm border border-[#3F3F54]">
                  {modalDomain.code}
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#EDEDED]">{getDomainTitle(modalDomain)}</h3>
                  <p className="text-xs text-[#9E9EA8] font-mono">{modalDomain.titleEn}</p>
                </div>
              </div>
              <button
                onClick={() => setModalDomain(null)}
                className="p-1 rounded-lg text-[#888896] hover:text-[#EDEDED] hover:bg-[#282834]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div className="p-3.5 rounded-xl bg-[#14141A] border border-[#272736] text-xs text-[#CECED8] leading-relaxed">
                {getDomainDesc(modalDomain)}
              </div>

              {modalDomain.subdivisions && (
                <div className="p-3.5 rounded-xl bg-[#20202C] border border-[#2F2F42] space-y-2">
                  <h4 className="text-xs font-semibold text-[#E5C365]">زیربخش‌های ساختاری مصوب:</h4>
                  <ul className="space-y-1.5 text-xs text-[#B5B5C4]">
                    {modalDomain.subdivisions.map(sub => (
                      <li key={sub.code} className="flex items-center gap-2">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#2A2A3A] text-[#C8A951]">
                          {sub.code}
                        </span>
                        <span>{sub.titleFa}</span>
                        <span className="text-[#6D6D7C] text-[11px]">({sub.titleEn})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#2B2312]/60 border border-[#C8A951]/30 flex items-start gap-2.5 text-xs text-[#E5C365]">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-normal">
                  طبق منشور مهندسی پلتفرم دیدار و دستور صریح کارفرما، ابتدا باید کلیه قابلیت‌های <strong>K01</strong> تکمیل، اعتبارسنجی و به تأیید کارفرما برسد و سپس دامنه <strong>{modalDomain.code}</strong> آغاز شود.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setModalDomain(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C8A951] text-[#141416] hover:bg-[#D4AF37] transition-colors"
              >
                متوجه شدم - بازگشت به K01
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
