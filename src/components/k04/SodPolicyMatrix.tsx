/**
 * Didar Gold Platform - K04: SoD Policy Matrix
 * Separation of Duties & Conflict-of-Interest Rules
 */

import React from 'react';
import { SodRule } from '../../types/k04.js';
import {
  ShieldAlert,
  CheckCircle2,
  Users,
  Scale,
  DollarSign,
  AlertTriangle,
  Lock,
  ArrowLeftRight,
  Fingerprint,
  Info
} from 'lucide-react';

interface SodPolicyMatrixProps {
  rules: SodRule[];
}

export const SodPolicyMatrix: React.FC<SodPolicyMatrixProps> = ({ rules }) => {
  return (
    <div className="space-y-4">
      {/* Intro Banner */}
      <div className="p-4 rounded-2xl bg-[#171724] border border-[#2B2B3E] text-xs leading-relaxed text-[#B2B2C6]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#282015] text-[#C8A951] border border-[#C8A951]/40 shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#EDEDED] mb-1">
              ماتریس قوانین تفکیک وظایف (Separation of Duties - SoD Matrix)
            </h4>
            <p>
              در بازار طلای سنتی و بنکداری، گردش روزانه حجم بالای فلزات گرانبها بدون تفکیک نقش‌های عملیاتی همواره عامل سوءاستفاده،
              تخلیه غیرمجاز خزانه و تبانی بوده است. هسته K04 با اعمال اصل چهارچشم ریاضی (Four-Eyes Principle) در سطح پایگاه‌داده و توابع،
              مانع از آن می‌شود که ثبت‌کننده سفارش بتواند شمش را ترخیص، سقف اعتبار را تغییر یا فیش بانکی مشکوک را تسویه کند.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          const roleLabels: Record<string, string> = {
            super_admin: 'مدیر ارشد سامانه',
            treasury_officer: 'متصدی خزانه‌داری',
            risk_manager: 'کارشناس انطباق و ریسک',
            sales_agent: 'کارشناس فروش',
            trader: 'معامله‌گر طلا',
            dealer_operator: 'متصدی بنکدار',
            accountant: 'حسابدار',
            customer: 'مشتری نهایی'
          };

          const forbiddenRolesText = rule.initiatorForbiddenRoles
            .map(r => roleLabels[r] || r)
            .join('، ');

          const allowedRolesText = rule.approverAllowedRoles
            .map(r => roleLabels[r] || r)
            .join('، ');

          return (
            <div
              key={rule.id}
              className="p-5 rounded-2xl bg-[#15151F] border border-[#28283A] hover:border-[#383850] transition-all space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#242434]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#C8A951] bg-[#292215] px-2 py-0.5 rounded border border-[#C8A951]/40 uppercase">
                      {rule.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#172D1E] text-[#3DD68C] border border-[#254A34]">
                      قانون فعال
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#EDEDED]">{rule.titleFa}</h4>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#FF8585] bg-[#331418] px-2.5 py-1 rounded-xl border border-[#522026] shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{rule.violationsBlockedCount ?? 0} تلاش مسدودشده</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#9E9EB2] leading-relaxed">
                {rule.descriptionFa}
              </p>

              {/* Role Conflict Matrix */}
              <div className="p-3 rounded-xl bg-[#101017] border border-[#1E1E2B] space-y-2 text-xs">
                <div className="text-[11px] font-semibold text-[#C8A951] flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>تفکیک نقش‌های مجاز و ممنوع:</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-[#181824] border border-[#262638]">
                    <span className="text-[#FF7A7A] block text-[10px]">نقش‌های ممنوع از ثبت:</span>
                    <span className="text-[#EDEDED] font-medium truncate block">{forbiddenRolesText}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#181824] border border-[#262638]">
                    <span className="text-[#4CD68D] block text-[10px]">نقش‌های مجاز به تأیید:</span>
                    <span className="text-[#EDEDED] font-medium truncate block">{allowedRolesText}</span>
                  </div>
                </div>
              </div>

              {/* Thresholds and Logic */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded-xl bg-[#12121B] border border-[#222230]">
                  <span className="text-[#6D6D80] text-[10px] block">آستانه حساسیت طلا:</span>
                  <span className="font-mono text-[#E5C365] font-semibold flex items-center gap-1 text-[11px]">
                    <Scale className="w-3 h-3" />
                    {rule.thresholdGrams ? `بیش از ${rule.thresholdGrams} گرم` : 'بدون آستانه وزنی'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#12121B] border border-[#222230]">
                  <span className="text-[#6D6D80] text-[10px] block">آستانه مالی ریالی:</span>
                  <span className="font-mono text-[#EDEDED] font-semibold flex items-center gap-1 text-[11px]">
                    <DollarSign className="w-3 h-3 text-[#3DD68C]" />
                    {rule.thresholdValueIrr ? `بیش از ${(rule.thresholdValueIrr / 1000000).toLocaleString()} م ریال` : 'بدون آستانه ریالی'}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-[#222230] flex items-center justify-between text-[11px] text-[#717182]">
                <span>تعداد تأییدهای مستقل الزامی:</span>
                <span className="font-bold text-[#E5C365] font-mono">{rule.requiredApproverCount} مرحله پیوسته</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
