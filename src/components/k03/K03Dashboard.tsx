/**
 * Didar Gold Platform - Domain K03 Primary Dashboard
 * Authentication & MFA Management, Active Sessions, Security Policies & Threat Logs
 */

import React, { useState } from 'react';
import {
  K03DataPayload,
  UserAccount,
  MfaMethod,
  MfaPolicyRule
} from '../../types/k03.js';
import { UserAccountList } from './UserAccountList.js';
import { ActiveSessionsViewer } from './ActiveSessionsViewer.js';
import { MfaConfiguratorModal } from './MfaConfiguratorModal.js';
import { StepUpSimulatorModal } from './StepUpSimulatorModal.js';
import { SecurityPolicyManager } from './SecurityPolicyManager.js';
import { SecurityLogsViewer } from './SecurityLogsViewer.js';
import {
  ShieldCheck,
  KeyRound,
  Laptop,
  AlertTriangle,
  FileText,
  Zap,
  RefreshCw,
  Cpu,
  Lock,
  X,
  Sliders,
  CheckCircle2,
  Users
} from 'lucide-react';

interface K03DashboardProps {
  k03Data: K03DataPayload;
  onRefresh: () => Promise<void>;
  onToggleMfa: (userId: string, isEnforced: boolean, defaultMethod?: MfaMethod) => Promise<void>;
  onVerifyTotp: (userId: string, code: string) => Promise<void>;
  onAddSecurityKey: (userId: string, name: string, model: string) => Promise<void>;
  onRevokeSession: (sessionId: string) => Promise<void>;
  onRevokeAllSessions: (userId: string) => Promise<void>;
  onUnlockAccount: (userId: string) => Promise<void>;
  onUpdateSecuritySettings: (userId: string, settings: Partial<UserAccount['securitySettings']>) => Promise<void>;
  onUpdatePolicyRule: (ruleId: string, updates: Partial<MfaPolicyRule>) => Promise<void>;
  onSimulateStepUp: (
    userId: string,
    operationFa: string,
    amountGrams: number,
    method: MfaMethod,
    code: string
  ) => Promise<{ success: boolean; message: string }>;
}

export type K03SubTab = 'accounts' | 'sessions' | 'step-up' | 'policies' | 'logs';

export const K03Dashboard: React.FC<K03DashboardProps> = ({
  k03Data,
  onRefresh,
  onToggleMfa,
  onVerifyTotp,
  onAddSecurityKey,
  onRevokeSession,
  onRevokeAllSessions,
  onUnlockAccount,
  onUpdateSecuritySettings,
  onUpdatePolicyRule,
  onSimulateStepUp
}) => {
  const [activeTab, setActiveTab] = useState<K03SubTab>('accounts');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [mfaConfigUser, setMfaConfigUser] = useState<UserAccount | null>(null);
  const [stepUpUser, setStepUpUser] = useState<UserAccount | null>(null);
  const [settingsUser, setSettingsUser] = useState<UserAccount | null>(null);

  // Local settings drawer form state
  const [editTimeout, setEditTimeout] = useState(30);
  const [editMaxSessions, setEditMaxSessions] = useState(2);
  const [editThresholdGrams, setEditThresholdGrams] = useState(50);
  const [editRequireWithdrawalMfa, setEditRequireWithdrawalMfa] = useState(true);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenSettings = (user: UserAccount) => {
    setSettingsUser(user);
    setEditTimeout(user.securitySettings.sessionTimeoutMinutes);
    setEditMaxSessions(user.securitySettings.maxConcurrentSessions);
    setEditThresholdGrams(user.securitySettings.stepUpAuthThresholdGrams);
    setEditRequireWithdrawalMfa(user.securitySettings.requireMfaForWithdrawals);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsUser) return;
    await onUpdateSecuritySettings(settingsUser.id, {
      sessionTimeoutMinutes: editTimeout,
      maxConcurrentSessions: editMaxSessions,
      stepUpAuthThresholdGrams: editThresholdGrams,
      requireMfaForWithdrawals: editRequireWithdrawalMfa
    });
    setSettingsUser(null);
  };

  const stats = k03Data.stats;

  return (
    <div className="space-y-6">
      {/* Domain Top Hero Card */}
      <div className="bg-gradient-to-r from-[#181822] via-[#1B1B28] to-[#181822] rounded-3xl p-6 border border-[#2D2D40] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#C8A951]/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-xl bg-[#C8A951]/20 text-[#E5C365] font-mono text-xs font-bold border border-[#C8A951]/40">
                KERNEL 03
              </span>
              <h1 className="text-xl font-extrabold text-[#EDEDED] tracking-tight">
                احراز هویت، احراز چندمرحله‌ای (MFA) و امنیت نشست‌ها
              </h1>
            </div>
            <p className="text-xs text-[#9E9EA8] max-w-2xl leading-relaxed">
              کنترل یکپارچه دسترسی و ورود امن به پلتفرم طلا و جواهر دیدار. محافظت از حساب‌های خزانه‌داری مرکزی با کلیدهای سخت‌افزاری FIDO2/YubiKey، الزامات احراز دوعاملی TOTP، و احراز هویت مرحله‌ای (Step-Up) در جابجایی‌های پرحجم طلا.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const firstUser = k03Data.accounts[0];
                if (firstUser) setStepUpUser(firstUser);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3DD68C] text-[#141416] font-bold text-xs hover:bg-[#4CE49C] transition-all cursor-pointer shadow-lg shadow-[#3DD68C]/15"
            >
              <Zap className="w-4 h-4" />
              <span>شبیه‌ساز احراز مرحله‌ای (Step-Up)</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-[#222230] text-[#9E9EA8] hover:text-[#EDEDED] border border-[#2E2E3E] transition-colors cursor-pointer"
              title="بارگذاری مجدد اطلاعات K03"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C8A951]' : ''}`} />
            </button>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-[#272738]">
          <div className="p-3 rounded-2xl bg-[#14141C]/80 border border-[#252536]">
            <div className="text-[11px] text-[#868698] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#C8A951]" />
              <span>کل حساب‌های کاربری</span>
            </div>
            <div className="text-lg font-bold text-[#EDEDED] font-mono mt-1">
              {stats.totalAccounts} کاربر
            </div>
            <div className="text-[10px] text-[#7E7E90] mt-0.5">در نقش‌های سازمانی صنف طلا</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#14141C]/80 border border-[#252536]">
            <div className="text-[11px] text-[#868698] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3DD68C]" />
              <span>پوشش احراز دوعاملی</span>
            </div>
            <div className="text-lg font-bold text-[#3DD68C] font-mono mt-1">
              %{stats.mfaEnabledPercent}
            </div>
            <div className="text-[10px] text-[#7E7E90] mt-0.5">{stats.totpUsersCount} کاربر دارای نرم‌افزار TOTP</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#14141C]/80 border border-[#252536]">
            <div className="text-[11px] text-[#868698] flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-[#0091FF]" />
              <span>نشست‌های فعال و زنده</span>
            </div>
            <div className="text-lg font-bold text-[#EDEDED] font-mono mt-1">
              {stats.activeSessionsCount} نشست
            </div>
            <div className="text-[10px] text-[#7E7E90] mt-0.5">پایانه‌های فروش و پیشخوان‌ها</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#14141C]/80 border border-[#252536]">
            <div className="text-[11px] text-[#868698] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#C8A951]" />
              <span>کلیدهای سخت‌افزاری FIDO2</span>
            </div>
            <div className="text-lg font-bold text-[#E5C365] font-mono mt-1">
              {stats.hardwareKeyCount} توکن
            </div>
            <div className="text-[10px] text-[#7E7E90] mt-0.5">خزانه‌داری مرکزی و مدیران</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#14141C]/80 border border-[#252536]">
            <div className="text-[11px] text-[#868698] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF6B6B]" />
              <span>حساب‌های مسدودشده</span>
            </div>
            <div className={`text-lg font-bold font-mono mt-1 ${
              stats.lockedAccountsCount > 0 ? 'text-[#FF6B6B]' : 'text-[#868698]'
            }`}>
              {stats.lockedAccountsCount} حساب
            </div>
            <div className="text-[10px] text-[#7E7E90] mt-0.5">به دلیل تلاش ورود ناموفق</div>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#262634] pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'accounts', label: 'حساب‌های کاربری و وضعیت MFA', icon: Users, count: k03Data.accounts.length },
          { id: 'sessions', label: 'نشست‌های فعال و دستگاه‌ها', icon: Laptop, count: k03Data.activeSessions.filter(s => !s.isRevoked).length },
          { id: 'policies', label: 'سیاست‌های امنیتی صنف طلا', icon: Sliders, count: k03Data.policyRules.length },
          { id: 'logs', label: 'ردپای رویدادهای امنیتی', icon: FileText, count: k03Data.securityLogs.length }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as K03SubTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#C8A951] text-[#141416] font-bold shadow-md shadow-[#C8A951]/15'
                  : 'bg-[#181822] text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#20202D] border border-[#2B2B3C]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                  isActive ? 'bg-[#141416] text-[#C8A951]' : 'bg-[#242434] text-[#868698]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Views */}
      <div>
        {activeTab === 'accounts' && (
          <UserAccountList
            accounts={k03Data.accounts}
            onToggleMfa={onToggleMfa}
            onUnlockAccount={onUnlockAccount}
            onOpenMfaConfig={(acc) => setMfaConfigUser(acc)}
            onOpenSecuritySettings={(acc) => handleOpenSettings(acc)}
            onOpenStepUpSim={(acc) => setStepUpUser(acc)}
          />
        )}

        {activeTab === 'sessions' && (
          <ActiveSessionsViewer
            sessions={k03Data.activeSessions}
            onRevokeSession={onRevokeSession}
            onRevokeAllUserSessions={onRevokeAllSessions}
          />
        )}

        {activeTab === 'policies' && (
          <SecurityPolicyManager
            policies={k03Data.policyRules}
            onUpdatePolicy={onUpdatePolicyRule}
          />
        )}

        {activeTab === 'logs' && (
          <SecurityLogsViewer logs={k03Data.securityLogs} />
        )}
      </div>

      {/* MFA Configuration Modal */}
      <MfaConfiguratorModal
        isOpen={!!mfaConfigUser}
        onClose={() => setMfaConfigUser(null)}
        account={mfaConfigUser}
        securityKeys={k03Data.securityKeys}
        onVerifyTotp={onVerifyTotp}
        onAddSecurityKey={onAddSecurityKey}
      />

      {/* Step-Up Challenge Simulator Modal */}
      <StepUpSimulatorModal
        isOpen={!!stepUpUser}
        onClose={() => setStepUpUser(null)}
        account={stepUpUser}
        onSimulateStepUp={onSimulateStepUp}
      />

      {/* Security Settings Drawer/Modal */}
      {settingsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#16161F] border border-[#2F2F42] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#252534] bg-[#13131A]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#C8A951]/15 flex items-center justify-center border border-[#C8A951]/30">
                  <Sliders className="w-4 h-4 text-[#C8A951]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#EDEDED]">
                    تنظیمات امنیتی اختصاصی کاربر ({settingsUser.fullName})
                  </h3>
                  <div className="text-[10px] text-[#868698]">@{settingsUser.username} • {settingsUser.roleTitleFa}</div>
                </div>
              </div>
              <button
                onClick={() => setSettingsUser(null)}
                className="p-1 rounded-lg text-[#868698] hover:text-[#EDEDED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-[#868698] block mb-1">
                  مدت زمان انقضای نشست پس از عدم فعالیت (دقیقه):
                </label>
                <select
                  value={editTimeout}
                  onChange={(e) => setEditTimeout(Number(e.target.value))}
                  className="w-full bg-[#121218] border border-[#2B2B3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
                >
                  <option value={15}>۱۵ دقیقه (سخت‌گیرانه خزانه‌داری)</option>
                  <option value={30}>۳۰ دقیقه</option>
                  <option value={60}>۶۰ دقیقه</option>
                  <option value={120}>۱۲۰ دقیقه</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#868698] block mb-1">
                  حداکثر تعداد نشست‌های همزمان مجاز:
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={editMaxSessions}
                  onChange={(e) => setEditMaxSessions(Number(e.target.value))}
                  className="w-full bg-[#121218] border border-[#2B2B3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
                />
              </div>

              <div>
                <label className="text-xs text-[#868698] block mb-1">
                  آستانه احراز مجدد مرحله‌ای طلا (گرم):
                </label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={editThresholdGrams}
                  onChange={(e) => setEditThresholdGrams(Number(e.target.value))}
                  className="w-full bg-[#121218] border border-[#2B2B3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] font-mono focus:outline-none focus:border-[#C8A951]"
                />
                <p className="text-[10px] text-[#7E7E90] mt-1">
                  تراکنش‌های بالای این وزن طلا نیازمند وارد کردن مجدد کد OTP یا توکن FIDO2 هستند.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editRequireWithdrawalMfa}
                    onChange={(e) => setEditRequireWithdrawalMfa(e.target.checked)}
                    className="w-4 h-4 rounded text-[#C8A951] bg-[#121218] border-[#2E2E40]"
                  />
                  <span className="text-xs text-[#EDEDED] font-medium">
                    الزام احراز دوعاملی در تمام درخواست‌های برداشت فیزیکی شمش طلا
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#232332]">
                <button
                  type="button"
                  onClick={() => setSettingsUser(null)}
                  className="px-4 py-1.5 rounded-xl bg-[#20202D] text-[#EDEDED] text-xs font-semibold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#C8A951] text-[#141416] text-xs font-bold hover:bg-[#D4B760] transition-colors cursor-pointer"
                >
                  ذخیره تنظیمات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
