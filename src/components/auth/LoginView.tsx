/**
 * Didar Gold Platform - Luxury Gold & Charcoal Authentication Screen
 * Supports password login, SMS OTP, and explicit initial administrator provisioning.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { AuthSessionData } from '../../types/auth.js';
import { ShieldCheck, Key, Phone, Lock, User, Building2, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (session: AuthSessionData) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'setup_admin'>('login');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDebugCode, setOtpDebugCode] = useState<string | null>(null);

  // Setup admin state
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminNationalId, setAdminNationalId] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [adminOrgName, setAdminOrgName] = useState('هسته مرکزی پلتفرم دیدار');

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProvisioned, setIsProvisioned] = useState<boolean | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const status = await api.getAuthStatus();
      setIsProvisioned(status.isProvisioned);
      if (!status.isProvisioned) {
        setMode('setup_admin');
      }
    } catch (e) {
      console.warn('Failed to check admin status:', e);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setError('لطفاً شماره همراه یا کدملی را وارد نمایید.');
      return;
    }

    if (authMethod === 'password' && !password) {
      setError('لطفاً رمز عبور را وارد نمایید.');
      return;
    }

    if (authMethod === 'otp' && !otpSent) {
      handleRequestOtp();
      return;
    }

    if (authMethod === 'otp' && !otpCode.trim()) {
      setError('لطفاً کد یکبارمصرف پیامک‌شده را وارد نمایید.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.login(
        identifier.trim(),
        authMethod === 'password' ? password : undefined,
        authMethod === 'otp' ? otpCode.trim() : undefined
      );
      onLoginSuccess(res.session);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطای ورود به سامانه';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!identifier.trim()) {
      setError('لطفاً شماره همراه معتبر وارد نمایید.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.requestOtp(identifier.trim());
      setOtpSent(true);
      setSuccessMessage(res.message);
      if (res.debugCode) {
        setOtpDebugCode(res.debugCode);
        setOtpCode(res.debugCode);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطای ارسال کد پیامکی';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminFirstName || !adminLastName || !adminMobile || !adminPassword) {
      setError('تکمیل تمامی فیلدهای ستاره‌دار الزامی است.');
      return;
    }

    if (adminPassword.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد.');
      return;
    }

    if (adminPassword !== adminConfirmPassword) {
      setError('تکرار رمز عبور با رمز عبور مطابقت ندارد.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.setupAdmin({
        firstName: adminFirstName.trim(),
        lastName: adminLastName.trim(),
        mobile: adminMobile.trim(),
        nationalId: adminNationalId.trim() || undefined,
        email: adminEmail.trim() || undefined,
        password: adminPassword,
        organizationName: adminOrgName.trim() || undefined,
      });

      setSuccessMessage('مدیر ارشد با موفقیت راه‌اندازی شد. در حال ورود...');
      setTimeout(() => {
        onLoginSuccess(res.session);
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطای راه‌اندازی مدیر ارشد';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101014] text-[#EDEDED] flex flex-col justify-center items-center p-4 relative overflow-hidden" dir="rtl">
      {/* Background Gold Ambient Glows */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#C8A951]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-[#8C6D23]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-[#16161C] border border-[#2B2B36] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative z-10 backdrop-blur-md">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E5C365] via-[#C8A951] to-[#8C6D23] flex items-center justify-center shadow-lg shadow-[#C8A951]/30 border border-[#F4DC98]/40 mb-3">
            <span className="font-extrabold text-[#141416] text-2xl tracking-wider">DG</span>
          </div>
          <h1 className="text-xl font-bold text-[#F4F4F6] tracking-tight">پلتفرم تبادلات طلا و جواهر دیدار</h1>
          <p className="text-xs text-[#9E9EA8] mt-1">سامانه جامع مدیریت تبادلات، خزانه‌داری و امنیت</p>
        </div>

        {/* Mode Selector Tabs (if admin already configured) */}
        {isProvisioned !== false && (
          <div className="flex bg-[#1E1E26] p-1 rounded-xl mb-6 border border-[#2C2C38]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#C8A951] text-[#141416] shadow-md'
                  : 'text-[#9E9EA8] hover:text-white'
              }`}
            >
              ورود به حساب
            </button>
            <button
              type="button"
              onClick={() => { setMode('setup_admin'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'setup_admin'
                  ? 'bg-[#C8A951] text-[#141416] shadow-md'
                  : 'text-[#9E9EA8] hover:text-white'
              }`}
            >
              راه‌اندازی اولیه مدیر
            </button>
          </div>
        )}

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Auth Method Sub-tab */}
            <div className="flex gap-2 text-xs text-[#9E9EA8] justify-center mb-1">
              <button
                type="button"
                onClick={() => { setAuthMethod('password'); setOtpSent(false); }}
                className={`px-3 py-1 rounded-md transition-colors ${
                  authMethod === 'password'
                    ? 'text-[#E5C365] bg-[#22222E] font-medium border border-[#C8A951]/30'
                    : 'hover:text-white'
                }`}
              >
                ورود با رمز عبور
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('otp'); }}
                className={`px-3 py-1 rounded-md transition-colors ${
                  authMethod === 'otp'
                    ? 'text-[#E5C365] bg-[#22222E] font-medium border border-[#C8A951]/30'
                    : 'hover:text-white'
                }`}
              >
                ورود با رمز یکبارمصرف (OTP)
              </button>
            </div>

            {/* Identifier input */}
            <div>
              <label className="block text-xs font-medium text-[#C5C5D2] mb-1.5">
                شماره همراه / کدملی
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="مثال: 09121112233"
                  dir="ltr"
                  className="w-full bg-[#1C1C24] border border-[#30303E] focus:border-[#C8A951] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#606072] outline-none transition-colors text-right"
                  required
                />
                <Phone className="w-4 h-4 text-[#7A7A8C] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Password input */}
            {authMethod === 'password' && (
              <div>
                <label className="block text-xs font-medium text-[#C5C5D2] mb-1.5">
                  رمز عبور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full bg-[#1C1C24] border border-[#30303E] focus:border-[#C8A951] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#606072] outline-none transition-colors"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#7A7A8C] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            )}

            {/* OTP input */}
            {authMethod === 'otp' && otpSent && (
              <div>
                <label className="block text-xs font-medium text-[#C5C5D2] mb-1.5">
                  کد ۶ رقمی یکبارمصرف
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    dir="ltr"
                    className="w-full bg-[#1C1C24] border border-[#C8A951] rounded-xl px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-[#E5C365] outline-none"
                    autoFocus
                    required
                  />
                  <Key className="w-4 h-4 text-[#C8A951] absolute left-3 top-3 pointer-events-none" />
                </div>
                {otpDebugCode && (
                  <p className="text-[11px] text-emerald-400 mt-1 text-center font-mono">
                    کد تستی شبیه‌ساز: {otpDebugCode}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#E5C365] via-[#C8A951] to-[#A2822C] hover:from-[#EDD07A] hover:to-[#B69438] text-[#141416] font-bold text-sm shadow-lg shadow-[#C8A951]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال بررسی...</span>
                </>
              ) : authMethod === 'otp' && !otpSent ? (
                <span>دریافت کد پیامکی</span>
              ) : (
                <span>ورود به سامانه</span>
              )}
            </button>
          </form>
        )}

        {/* ================= SETUP ADMIN FORM ================= */}
        {mode === 'setup_admin' && (
          <form onSubmit={handleSetupAdminSubmit} className="space-y-3.5">
            <div className="p-2.5 rounded-lg bg-[#22222E] border border-[#343444] text-xs text-[#B5B5C2] leading-relaxed mb-1">
              <ShieldCheck className="w-4 h-4 text-[#C8A951] inline ml-1.5" />
              <span>پیکربندی اولیه حساب مدیر ارشد کل پلتفرم دیدار (بدون حساب‌های پیش‌فرض دمو).</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-[#C5C5D2] mb-1">
                  نام <span className="text-[#C8A951]">*</span>
                </label>
                <input
                  type="text"
                  value={adminFirstName}
                  onChange={(e) => setAdminFirstName(e.target.value)}
                  placeholder="علیرضا"
                  className="w-full bg-[#1C1C24] border border-[#30303E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#C5C5D2] mb-1">
                  نام خانوادگی <span className="text-[#C8A951]">*</span>
                </label>
                <input
                  type="text"
                  value={adminLastName}
                  onChange={(e) => setAdminLastName(e.target.value)}
                  placeholder="سفیدپور"
                  className="w-full bg-[#1C1C24] border border-[#30303E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#C5C5D2] mb-1">
                شماره همراه مدیر ارشد <span className="text-[#C8A951]">*</span>
              </label>
              <input
                type="text"
                value={adminMobile}
                onChange={(e) => setAdminMobile(e.target.value)}
                placeholder="09121112233"
                dir="ltr"
                className="w-full bg-[#1C1C24] border border-[#30303E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-white text-right outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-[#C5C5D2] mb-1">
                  کدملی (اختیاری)
                </label>
                <input
                  type="text"
                  value={adminNationalId}
                  onChange={(e) => setAdminNationalId(e.target.value)}
                  placeholder="0012345678"
                  dir="ltr"
                  className="w-full bg-[#1C1C24] border border-[#30303E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-white text-right outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#C5C5D2] mb-1">
                  ایمیل (اختیاری)
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@didargold.ir"
                  dir="ltr"
                  className="w-full bg-[#1C1C24] border border-[#30303E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#C5C5D2] mb-1">
                رمز عبور امن (حداقل ۸ کاراکتر) <span className="text-[#C8A951]">*</span>
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full bg-[#1C1C24] border border-[#30303E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-white outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#C5C5D2] mb-1">
                تکرار رمز عبور <span className="text-[#C8A951]">*</span>
              </label>
              <input
                type="password"
                value={adminConfirmPassword}
                onChange={(e) => setAdminConfirmPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full bg-[#1C1C24] border border-[#30303E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-white outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-[#E5C365] via-[#C8A951] to-[#A2822C] hover:from-[#EDD07A] hover:to-[#B69438] text-[#141416] font-bold text-xs shadow-lg shadow-[#C8A951]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال مقداردهی اولیه...</span>
                </>
              ) : (
                <span>تکمیل و راه‌اندازی حساب مدیر ارشد</span>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-[#262632] flex items-center justify-between text-[11px] text-[#787888]">
          <span>دیدار گلد — نسخه ۲.۰</span>
          <span className="font-mono text-[#C8A951]">ACID PostgreSQL</span>
        </div>
      </div>
    </div>
  );
};
