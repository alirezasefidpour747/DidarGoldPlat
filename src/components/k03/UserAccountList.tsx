/**
 * Didar Gold Platform - Domain K03 User Account Directory & MFA Status
 */

import React, { useState } from 'react';
import {
  UserAccount,
  MfaMethod,
  UserRole
} from '../../types/k03.js';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Unlock,
  Smartphone,
  Cpu,
  Search,
  Settings2,
  Clock,
  Laptop,
  Check,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface UserAccountListProps {
  accounts: UserAccount[];
  onToggleMfa: (userId: string, isEnforced: boolean, defaultMethod?: MfaMethod) => Promise<void>;
  onUnlockAccount: (userId: string) => Promise<void>;
  onOpenMfaConfig: (account: UserAccount) => void;
  onOpenSecuritySettings: (account: UserAccount) => void;
  onOpenStepUpSim: (account: UserAccount) => void;
}

export const UserAccountList: React.FC<UserAccountListProps> = ({
  accounts,
  onToggleMfa,
  onUnlockAccount,
  onOpenMfaConfig,
  onOpenSecuritySettings,
  onOpenStepUpSim
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch =
      acc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.phone.includes(searchTerm) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || acc.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggle = async (acc: UserAccount) => {
    setLoadingAction(`toggle-${acc.id}`);
    try {
      await onToggleMfa(acc.id, !acc.mfaConfig.isEnforced, acc.mfaConfig.defaultMethod);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUnlock = async (acc: UserAccount) => {
    setLoadingAction(`unlock-${acc.id}`);
    try {
      await onUnlockAccount(acc.id);
    } finally {
      setLoadingAction(null);
    }
  };

  const getRoleBadge = (role: UserRole, titleFa: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E5484D]/15 text-[#FF6B6B] border border-[#E5484D]/30">مدیر ارشد امنیت</span>;
      case 'treasury_officer':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40">خزانه‌داری طلا</span>;
      case 'dealer_operator':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">بنکدار طلا</span>;
      case 'risk_manager':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8E4EC6]/15 text-[#C084FC] border border-[#8E4EC6]/30">مدیر ریسک</span>;
      case 'trader':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0091FF]/15 text-[#60A5FA] border border-[#0091FF]/30">معامله‌گر</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#242434] text-[#9E9EA8] border border-[#323246]">{titleFa}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#181822] p-4 rounded-2xl border border-[#2B2B3C]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#7E7E90]" />
          <input
            type="text"
            placeholder="جستجوی کاربر، نام کاربری، همراه..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121218] border border-[#2B2B3C] rounded-xl pr-9 pl-3 py-2 text-xs text-[#EDEDED] placeholder-[#6E6E80] focus:outline-none focus:border-[#C8A951] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#121218] border border-[#2B2B3C] rounded-xl px-3 py-2 text-xs text-[#9E9EA8] focus:outline-none focus:border-[#C8A951]"
          >
            <option value="all">همه نقش‌های سازمانی</option>
            <option value="super_admin">مدیران ارشد امنیت</option>
            <option value="treasury_officer">متصدیان خزانه‌داری طلا</option>
            <option value="dealer_operator">بنکداران و بازرگانان</option>
            <option value="risk_manager">کارشناسان ریسک</option>
            <option value="trader">معامله‌گران</option>
            <option value="customer">مشتریان عادی</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#121218] border border-[#2B2B3C] rounded-xl px-3 py-2 text-xs text-[#9E9EA8] focus:outline-none focus:border-[#C8A951]"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="locked">مسدود / قفل‌شده</option>
            <option value="suspended">معلق</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-[#181822] rounded-2xl border border-[#2B2B3C] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2B2B3C] bg-[#14141B] text-[#868698]">
                <th className="py-3 px-4 font-medium">کاربر و نقش</th>
                <th className="py-3 px-4 font-medium">سطح اعتماد (K02)</th>
                <th className="py-3 px-4 font-medium">وضعیت احراز دوعاملی (MFA)</th>
                <th className="py-3 px-4 font-medium">روش‌های فعال</th>
                <th className="py-3 px-4 font-medium">آخرین ورود و IP</th>
                <th className="py-3 px-4 font-medium">وضعیت حساب</th>
                <th className="py-3 px-4 font-medium text-center">عملیات امنیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22222E]">
              {filteredAccounts.map((acc) => {
                const isLocked = acc.status === 'locked';
                const hasMfa = acc.mfaConfig.isEnforced || acc.mfaConfig.totpConfigured;

                return (
                  <tr key={acc.id} className="hover:bg-[#1E1E2B] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                          isLocked
                            ? 'bg-[#E5484D]/15 text-[#FF6B6B] border-[#E5484D]/30'
                            : 'bg-[#C8A951]/15 text-[#E5C365] border-[#C8A951]/30'
                        }`}>
                          {acc.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#EDEDED] flex items-center gap-2">
                            <span>{acc.fullName}</span>
                            {getRoleBadge(acc.role, acc.roleTitleFa)}
                          </div>
                          <div className="text-[11px] text-[#868698] font-mono mt-0.5">
                            @{acc.username} • {acc.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#20202E] text-[#B5B5C2] border border-[#2E2E40] text-[10px]">
                        {acc.trustTier === 'tier_3_commercial' ? 'سطح ۳ (سازمانی و بنکدار)' :
                         acc.trustTier === 'tier_2_business' ? 'سطح ۲ (صنفی احرازشده)' :
                         acc.trustTier === 'tier_1_identity' ? 'سطح ۱ (هویت فردی)' : 'سطح ۰ (مهمان)'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(acc)}
                          disabled={loadingAction === `toggle-${acc.id}`}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                            acc.mfaConfig.isEnforced
                              ? 'bg-[#3DD68C]/15 text-[#3DD68C] border-[#3DD68C]/40 hover:bg-[#3DD68C]/25'
                              : 'bg-[#242434] text-[#868698] border-[#35354A] hover:bg-[#2C2C3E] hover:text-[#EDEDED]'
                          }`}
                          title="تغییر وضعیت الزام MFA"
                        >
                          {acc.mfaConfig.isEnforced ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-[#3DD68C]" />
                              <span>اجباری (Enforced)</span>
                            </>
                          ) : (
                            <>
                              <Shield className="w-3.5 h-3.5 text-[#7E7E90]" />
                              <span>اختیاری</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {acc.mfaConfig.totpConfigured && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 text-[10px]">
                            <Smartphone className="w-3 h-3" />
                            <span>TOTP Authenticator</span>
                          </span>
                        )}
                        {acc.mfaConfig.securityKeyCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0091FF]/15 text-[#60A5FA] border border-[#0091FF]/30 text-[10px]">
                            <Cpu className="w-3 h-3" />
                            <span>{acc.mfaConfig.securityKeyCount} کلید سخت‌افزاری</span>
                          </span>
                        )}
                        {acc.mfaConfig.methodsEnabled.includes('sms_otp') && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#252536] text-[#9E9EA8] border border-[#343448] text-[10px]">
                            <span>پیامک SMS</span>
                          </span>
                        )}
                        {!acc.mfaConfig.totpConfigured && acc.mfaConfig.securityKeyCount === 0 && (
                          <span className="text-[11px] text-[#666678]">فقط پیامک پیش‌فرض</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-[#EDEDED] flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#7E7E90]" />
                        <span>{acc.lastLoginAt || 'بدون ورود'}</span>
                      </div>
                      {acc.lastLoginIp && (
                        <div className="text-[10px] text-[#7E7E90] font-mono mt-0.5">
                          IP: {acc.lastLoginIp}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isLocked ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E5484D]/15 text-[#FF6B6B] border border-[#E5484D]/30 text-[10px] font-bold">
                          <Lock className="w-3 h-3" />
                          <span>قفل به دلیل {acc.failedLoginAttempts} تلاش ناموفق</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30 text-[10px] font-medium">
                          <Check className="w-3 h-3" />
                          <span>فعال</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {isLocked && (
                          <button
                            onClick={() => handleUnlock(acc)}
                            disabled={loadingAction === `unlock-${acc.id}`}
                            className="px-2.5 py-1 rounded-xl bg-[#E5484D]/20 text-[#FF8B8B] hover:bg-[#E5484D]/30 border border-[#E5484D]/40 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all"
                            title="باز کردن قفل حساب"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>رفع قفل</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenMfaConfig(acc)}
                          className="p-1.5 rounded-xl bg-[#222230] text-[#B5B5C2] hover:text-[#EDEDED] hover:bg-[#2A2A3C] border border-[#323246] transition-colors cursor-pointer"
                          title="پیکربندی MFA و توکن سخت‌افزاری"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-[#C8A951]" />
                        </button>

                        <button
                          onClick={() => onOpenStepUpSim(acc)}
                          className="p-1.5 rounded-xl bg-[#222230] text-[#B5B5C2] hover:text-[#EDEDED] hover:bg-[#2A2A3C] border border-[#323246] transition-colors cursor-pointer"
                          title="شبیه‌سازی چالش مرحله‌ای (Step-Up)"
                        >
                          <Zap className="w-3.5 h-3.5 text-[#3DD68C]" />
                        </button>

                        <button
                          onClick={() => onOpenSecuritySettings(acc)}
                          className="p-1.5 rounded-xl bg-[#222230] text-[#B5B5C2] hover:text-[#EDEDED] hover:bg-[#2A2A3C] border border-[#323246] transition-colors cursor-pointer"
                          title="تنظیمات امنیتی و نشست"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
