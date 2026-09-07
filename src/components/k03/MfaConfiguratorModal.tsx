/**
 * Didar Gold Platform - Domain K03 MFA Configurator Modal
 * Interactive Setup for TOTP Authenticator, FIDO2/YubiKey Hardware Keys, and Recovery Codes
 */

import React, { useState } from 'react';
import { UserAccount, MfaSecurityKey } from '../../types/k03.js';
import {
  X,
  Smartphone,
  Cpu,
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  QrCode,
  Lock,
  Plus
} from 'lucide-react';

interface MfaConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount | null;
  securityKeys: MfaSecurityKey[];
  onVerifyTotp: (userId: string, code: string) => Promise<void>;
  onAddSecurityKey: (userId: string, name: string, model: string) => Promise<void>;
}

export const MfaConfiguratorModal: React.FC<MfaConfiguratorModalProps> = ({
  isOpen,
  onClose,
  account,
  securityKeys,
  onVerifyTotp,
  onAddSecurityKey
}) => {
  const [activeTab, setActiveTab] = useState<'totp' | 'security_key' | 'backup_codes'>('totp');
  const [totpCode, setTotpCode] = useState('');
  const [keyName, setKeyName] = useState('YubiKey 5C NFC - پیشخوان طلا');
  const [keyModel, setKeyModel] = useState('Yubico YubiKey 5 Series (FIPS)');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !account) return null;

  const secret = account.mfaConfig.totpSecretPreview || 'JBSWY3DPEHPK3PXP';
  const userKeys = securityKeys.filter(k => k.userId === account.id);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6) {
      setStatusMessage({ type: 'error', text: 'لطفاً کد ۶ رقمی تولیدشده توسط نرم‌افزار را وارد کنید.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await onVerifyTotp(account.id, totpCode);
      setStatusMessage({ type: 'success', text: 'نرم‌افزار احراز دوعاملی با موفقیت تایید و بر روی حساب فعال شد.' });
      setTotpCode('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'کد نامعتبر است.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnrollSecurityKey = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await onAddSecurityKey(account.id, keyName, keyModel);
      setStatusMessage({ type: 'success', text: 'کلید سخت‌افزاری امنیتی با موفقیت در سامانه ثبت و فعال شد.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در ثبت کلید.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoBackupCodes = [
    '8392-1094', '4412-9851', '7631-0029', '1928-3482',
    '5501-8842', '9930-1284', '2819-4451', '6048-7719',
    '3391-5620', '4820-9913'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#16161F] border border-[#2F2F42] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252534] bg-[#13131A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C8A951]/15 flex items-center justify-center border border-[#C8A951]/30">
              <KeyRound className="w-5 h-5 text-[#C8A951]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#EDEDED] flex items-center gap-2">
                <span>پیکربندی احراز دوعاملی (MFA)</span>
                <span className="text-[11px] text-[#C8A951]">({account.fullName})</span>
              </h2>
              <p className="text-[11px] text-[#868698]">
                تنظیم نرم‌افزار Google Authenticator، کلیدهای سخت‌افزاری خزانه‌داری طلا و کدهای بازیابی
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#868698] hover:text-[#EDEDED] hover:bg-[#20202D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#252534] bg-[#14141B]">
          <button
            onClick={() => { setActiveTab('totp'); setStatusMessage(null); }}
            className={`flex items-center gap-2 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'totp'
                ? 'border-[#C8A951] text-[#E5C365]'
                : 'border-transparent text-[#868698] hover:text-[#EDEDED]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>نرم‌افزار احراز هویت (TOTP)</span>
          </button>

          <button
            onClick={() => { setActiveTab('security_key'); setStatusMessage(null); }}
            className={`flex items-center gap-2 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'security_key'
                ? 'border-[#C8A951] text-[#E5C365]'
                : 'border-transparent text-[#868698] hover:text-[#EDEDED]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>کلید سخت‌افزاری (FIDO2 / YubiKey)</span>
            {userKeys.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#0091FF]/20 text-[#60A5FA] text-[10px]">
                {userKeys.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('backup_codes'); setStatusMessage(null); }}
            className={`flex items-center gap-2 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'backup_codes'
                ? 'border-[#C8A951] text-[#E5C365]'
                : 'border-transparent text-[#868698] hover:text-[#EDEDED]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>کدهای پشتیبان اضطراری</span>
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-[#3DD68C]/15 border-[#3DD68C]/30 text-[#3DD68C]'
              : 'bg-[#E5484D]/15 border-[#E5484D]/30 text-[#FF6B6B]'
          }`}>
            {statusMessage.type === 'success' ? (
              <ShieldCheck className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="p-6 space-y-4">
          {activeTab === 'totp' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#1B1B26] p-4 rounded-2xl border border-[#2B2B3C]">
                {/* Visual QR Code Container */}
                <div className="w-36 h-36 bg-white p-2 rounded-xl flex flex-col items-center justify-center shadow-lg shrink-0">
                  <div className="w-full h-full border-2 border-dashed border-gray-400 flex flex-col items-center justify-center p-1 text-center">
                    <QrCode className="w-20 h-20 text-gray-800" />
                    <span className="text-[8px] text-gray-600 font-mono mt-1">DIDAR-GOLD-OTP</span>
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <h4 className="text-xs font-bold text-[#EDEDED]">
                    ۱. اسکن بارکد در نرم‌افزار Google Authenticator یا Duo
                  </h4>
                  <p className="text-[11px] text-[#9E9EA8] leading-relaxed">
                    بارکد روبرو را با دوربین گوشی در نرم‌افزار دوعاملی خود اسکن کنید. یا کلید اختصاصی زیر را به صورت دستی وارد نمایید:
                  </p>

                  <div className="flex items-center gap-2 bg-[#121218] px-3 py-1.5 rounded-xl border border-[#2E2E3E]">
                    <span className="font-mono text-xs tracking-widest text-[#E5C365] font-bold select-all">
                      {secret}
                    </span>
                    <button
                      onClick={handleCopySecret}
                      className="p-1 rounded text-[#7E7E90] hover:text-[#EDEDED] cursor-pointer"
                      title="کپی کلید"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-[#3DD68C]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleVerifyTotp} className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-[#EDEDED]">
                  ۲. وارد کردن کد ۶ رقمی جهت فعال‌سازی
                </h4>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="۱۲۳۴۵۶"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-48 bg-[#121218] border border-[#2B2B3C] rounded-xl px-4 py-2 text-center text-lg font-mono tracking-widest text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || totpCode.length !== 6}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#C8A951] text-[#141416] font-bold text-xs hover:bg-[#D4B760] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'در حال تایید...' : 'تایید و فعال‌سازی احراز دوعاملی'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security_key' && (
            <div className="space-y-4">
              <div className="bg-[#1B1B26] p-4 rounded-2xl border border-[#2B2B3C]">
                <h4 className="text-xs font-bold text-[#EDEDED] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#0091FF]" />
                  <span>ثبت کلید فیزیکی جدید (WebAuthn / FIDO2 / YubiKey)</span>
                </h4>
                <p className="text-[11px] text-[#9E9EA8] mt-1 leading-relaxed">
                  مخصوص متصدیان خزانه‌داری شمش طلا و مدیران ارشد مالی. این کلید در برابر حملات فیشینگ کاملاً مقاوم است.
                </p>

                <div className="mt-3 space-y-2">
                  <div>
                    <label className="text-[11px] text-[#868698] block mb-1">نام و کاربرد کلید</label>
                    <input
                      type="text"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      className="w-full bg-[#121218] border border-[#2B2B3C] rounded-xl px-3 py-1.5 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#868698] block mb-1">مدل سخت‌افزار</label>
                    <input
                      type="text"
                      value={keyModel}
                      onChange={(e) => setKeyModel(e.target.value)}
                      className="w-full bg-[#121218] border border-[#2B2B3C] rounded-xl px-3 py-1.5 text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
                    />
                  </div>

                  <button
                    onClick={handleEnrollSecurityKey}
                    disabled={isSubmitting}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0091FF] text-white font-bold text-xs hover:bg-[#1A9FFF] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmitting ? 'در حال برقراری ارتباط با توکن سخت‌افزاری...' : 'شبیه‌سازی ثبت توکن امنیتی USB/NFC'}</span>
                  </button>
                </div>
              </div>

              {/* Registered Keys List */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-[#868698]">کلیدهای ثبت‌شده برای این کاربر:</h5>
                {userKeys.length === 0 ? (
                  <div className="text-xs text-[#686878] p-3 rounded-xl bg-[#14141B] border border-[#242434] text-center">
                    هنوز کلید سخت‌افزاری ثبت نشده است.
                  </div>
                ) : (
                  userKeys.map((k) => (
                    <div key={k.id} className="p-3 rounded-xl bg-[#14141B] border border-[#242434] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-[#3DD68C]" />
                        <div>
                          <div className="font-semibold text-[#EDEDED]">{k.name}</div>
                          <div className="text-[10px] text-[#7E7E90]">{k.model} • ثبت: {k.addedAt}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#3DD68C]/15 text-[#3DD68C] text-[10px] font-medium">
                        فعال
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'backup_codes' && (
            <div className="space-y-4">
              <div className="bg-[#1B1B26] p-4 rounded-2xl border border-[#2B2B3C]">
                <h4 className="text-xs font-bold text-[#EDEDED]">کدهای پشتیبان یک‌بارمصرف (Emergency Backup Codes)</h4>
                <p className="text-[11px] text-[#9E9EA8] mt-1 leading-relaxed">
                  در صورت گم‌شدن یا عدم دسترسی به گوشی تلفن همراه، این کدها تنها راه ورود فوری به سامانه هستند. هر کد فقط یک‌بار قابل استفاده است.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs text-[#E5C365]">
                  {demoBackupCodes.map((code, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-[#121218] border border-[#282838] flex items-center justify-between">
                      <span>{code}</span>
                      <span className="text-[10px] text-[#6E6E80]">کد #{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#252534] bg-[#13131A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#20202D] text-[#EDEDED] hover:bg-[#2A2A3C] text-xs font-semibold transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
