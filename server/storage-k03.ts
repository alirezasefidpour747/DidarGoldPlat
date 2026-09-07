/**
 * Didar Gold Platform - Domain K03 Server Storage
 * Authentication, Multi-Factor Authentication (MFA), Sessions & Security Policies
 */

import fs from 'fs';
import path from 'path';
import {
  UserAccount,
  AuthSession,
  MfaSecurityKey,
  SecurityEventLog,
  MfaPolicyRule,
  K03Stats,
  K03DataPayload,
  MfaMethod,
  SecurityEventType,
  SecuritySeverity
} from '../src/types/k03.js';
import { loadStore, saveStore } from './storage.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const K03_FILE = path.join(DATA_DIR, 'k03-store.json');

export interface K03StoreData {
  accounts: UserAccount[];
  activeSessions: AuthSession[];
  securityKeys: MfaSecurityKey[];
  securityLogs: SecurityEventLog[];
  policyRules: MfaPolicyRule[];
}

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialK03Data(): K03StoreData {
  const accounts: UserAccount[] = [
    {
      id: 'usr-001',
      partyId: 'party-admin-001',
      fullName: 'علی رحیمی',
      username: 'a.rahimi',
      email: 'a.rahimi@didargold.ir',
      phone: '09121112233',
      role: 'super_admin',
      roleTitleFa: 'مدیر ارشد سامانه و امنیت',
      trustTier: 'tier_3_commercial',
      status: 'active',
      passwordLastChangedAt: '1403/05/10 - 11:30',
      failedLoginAttempts: 0,
      lastLoginAt: '1403/06/17 - 10:15',
      lastLoginIp: '5.160.82.14',
      mfaConfig: {
        isEnforced: true,
        methodsEnabled: ['totp', 'security_key', 'sms_otp'],
        defaultMethod: 'totp',
        totpConfigured: true,
        totpSecretPreview: 'JBSWY3DPEHPK3PXP',
        backupCodesRemaining: 8,
        securityKeyCount: 2,
        lastMfaVerifiedAt: '1403/06/17 - 10:16'
      },
      securitySettings: {
        sessionTimeoutMinutes: 30,
        maxConcurrentSessions: 2,
        stepUpAuthThresholdGrams: 50,
        requireMfaForWithdrawals: true,
        trustedDevicesOnly: true
      }
    },
    {
      id: 'usr-002',
      partyId: 'party-person-002',
      fullName: 'سهراب کیانی',
      username: 's.kiani',
      email: 's.kiani@didartreasury.ir',
      phone: '09123334455',
      role: 'treasury_officer',
      roleTitleFa: 'متصدی ارشد خزانه‌داری طلا',
      trustTier: 'tier_3_commercial',
      status: 'active',
      passwordLastChangedAt: '1403/05/22 - 09:00',
      failedLoginAttempts: 0,
      lastLoginAt: '1403/06/17 - 09:40',
      lastLoginIp: '185.110.12.9',
      mfaConfig: {
        isEnforced: true,
        methodsEnabled: ['security_key', 'totp'],
        defaultMethod: 'security_key',
        totpConfigured: true,
        totpSecretPreview: 'HXDMVJECJJWSRZ3U',
        backupCodesRemaining: 10,
        securityKeyCount: 1,
        lastMfaVerifiedAt: '1403/06/17 - 09:41'
      },
      securitySettings: {
        sessionTimeoutMinutes: 15,
        maxConcurrentSessions: 1,
        stepUpAuthThresholdGrams: 20,
        requireMfaForWithdrawals: true,
        trustedDevicesOnly: true
      }
    },
    {
      id: 'usr-003',
      partyId: 'party-person-001',
      fullName: 'محمد حسینی',
      username: 'm.hosseini',
      email: 'hosseini.gold@gmail.com',
      phone: '09123456789',
      role: 'dealer_operator',
      roleTitleFa: 'بنکدار و بازرگان شمش طلا',
      trustTier: 'tier_3_commercial',
      status: 'active',
      passwordLastChangedAt: '1403/04/15 - 16:20',
      failedLoginAttempts: 0,
      lastLoginAt: '1403/06/16 - 18:30',
      lastLoginIp: '2.144.110.45',
      mfaConfig: {
        isEnforced: true,
        methodsEnabled: ['totp', 'sms_otp'],
        defaultMethod: 'totp',
        totpConfigured: true,
        totpSecretPreview: 'ORSXG5AONEQWC2LO',
        backupCodesRemaining: 6,
        securityKeyCount: 0,
        lastMfaVerifiedAt: '1403/06/16 - 18:32'
      },
      securitySettings: {
        sessionTimeoutMinutes: 60,
        maxConcurrentSessions: 3,
        stepUpAuthThresholdGrams: 100,
        requireMfaForWithdrawals: true,
        trustedDevicesOnly: false
      }
    },
    {
      id: 'usr-004',
      partyId: 'party-person-004',
      fullName: 'زهرا احمدی',
      username: 'z.ahmadi',
      email: 'z.ahmadi@didargold.ir',
      phone: '09127778899',
      role: 'risk_manager',
      roleTitleFa: 'کارشناس انطباق و ریسک اعتباری',
      trustTier: 'tier_2_business',
      status: 'active',
      passwordLastChangedAt: '1403/05/01 - 14:10',
      failedLoginAttempts: 0,
      lastLoginAt: '1403/06/17 - 08:20',
      lastLoginIp: '5.160.82.14',
      mfaConfig: {
        isEnforced: true,
        methodsEnabled: ['totp', 'sms_otp'],
        defaultMethod: 'totp',
        totpConfigured: true,
        totpSecretPreview: 'GEZDGNBVGY3TQOJQ',
        backupCodesRemaining: 10,
        securityKeyCount: 0,
        lastMfaVerifiedAt: '1403/06/17 - 08:21'
      },
      securitySettings: {
        sessionTimeoutMinutes: 30,
        maxConcurrentSessions: 2,
        stepUpAuthThresholdGrams: 50,
        requireMfaForWithdrawals: false,
        trustedDevicesOnly: true
      }
    },
    {
      id: 'usr-005',
      partyId: 'party-person-005',
      fullName: 'امیرحسین زارع',
      username: 'a.zare',
      email: 'zare.tabriz@yahoo.com',
      phone: '09141112233',
      role: 'trader',
      roleTitleFa: 'معامله‌گر و کارگاه‌دار طلا',
      trustTier: 'tier_2_business',
      status: 'active',
      passwordLastChangedAt: '1403/03/12 - 10:00',
      failedLoginAttempts: 1,
      lastLoginAt: '1403/06/15 - 14:50',
      lastLoginIp: '89.165.34.12',
      mfaConfig: {
        isEnforced: false,
        methodsEnabled: ['sms_otp'],
        defaultMethod: 'sms_otp',
        totpConfigured: false,
        backupCodesRemaining: 0,
        securityKeyCount: 0
      },
      securitySettings: {
        sessionTimeoutMinutes: 60,
        maxConcurrentSessions: 3,
        stepUpAuthThresholdGrams: 200,
        requireMfaForWithdrawals: false,
        trustedDevicesOnly: false
      }
    },
    {
      id: 'usr-006',
      partyId: 'party-person-006',
      fullName: 'نیما پارسا',
      username: 'n.parsa',
      email: 'nima.parsa@gmail.com',
      phone: '09359998877',
      role: 'customer',
      roleTitleFa: 'سرمایه‌گذار خرد طلا',
      trustTier: 'tier_1_identity',
      status: 'locked',
      passwordLastChangedAt: '1403/02/01 - 12:00',
      failedLoginAttempts: 5,
      lockedUntil: '1403/06/17 - 23:59',
      lastLoginAt: '1403/06/14 - 11:10',
      lastLoginIp: '94.182.11.23',
      mfaConfig: {
        isEnforced: false,
        methodsEnabled: ['sms_otp'],
        defaultMethod: 'sms_otp',
        totpConfigured: false,
        backupCodesRemaining: 0,
        securityKeyCount: 0
      },
      securitySettings: {
        sessionTimeoutMinutes: 120,
        maxConcurrentSessions: 5,
        stepUpAuthThresholdGrams: 50,
        requireMfaForWithdrawals: false,
        trustedDevicesOnly: false
      }
    }
  ];

  const activeSessions: AuthSession[] = [
    {
      id: 'sess-001',
      userId: 'usr-001',
      username: 'a.rahimi',
      fullName: 'علی رحیمی',
      role: 'super_admin',
      ipAddress: '5.160.82.14',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      deviceType: 'desktop',
      deviceName: 'Apple MacBook Pro (خزانه‌داری مرکزی)',
      browser: 'Chrome 128',
      os: 'macOS Sonoma',
      locationApprox: 'تهران، منطقه فردوسی',
      createdAt: '1403/06/17 - 10:15',
      lastActivityAt: 'چند لحظه پیش',
      expiresAt: '1403/06/17 - 10:45',
      isCurrent: true,
      isRevoked: false,
      mfaVerifiedForSession: true
    },
    {
      id: 'sess-002',
      userId: 'usr-002',
      username: 's.kiani',
      fullName: 'سهراب کیانی',
      role: 'treasury_officer',
      ipAddress: '185.110.12.9',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      deviceType: 'desktop',
      deviceName: 'ایستگاه کاری خزانه‌داری شماره ۱',
      browser: 'Chrome 127',
      os: 'Windows 11 Pro',
      locationApprox: 'تهران، خزانه‌داری مرکزی صنف طلا',
      createdAt: '1403/06/17 - 09:40',
      lastActivityAt: '۱۴ دقیقه پیش',
      expiresAt: '1403/06/17 - 09:55',
      isCurrent: false,
      isRevoked: false,
      mfaVerifiedForSession: true
    },
    {
      id: 'sess-003',
      userId: 'usr-003',
      username: 'm.hosseini',
      fullName: 'محمد حسینی',
      role: 'dealer_operator',
      ipAddress: '2.144.110.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0',
      deviceType: 'desktop',
      deviceName: 'دفتر بنکداری بازار بزرگ',
      browser: 'Firefox 129',
      os: 'Windows 10',
      locationApprox: 'تهران، بازار زرگران سبزه میدان',
      createdAt: '1403/06/16 - 18:30',
      lastActivityAt: 'دیروز ۱۸:۴۵',
      expiresAt: '1403/06/16 - 19:30',
      isCurrent: false,
      isRevoked: false,
      mfaVerifiedForSession: true
    },
    {
      id: 'sess-004',
      userId: 'usr-004',
      username: 'z.ahmadi',
      fullName: 'زهرا احمدی',
      role: 'risk_manager',
      ipAddress: '5.160.82.14',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      deviceType: 'desktop',
      deviceName: 'سیستم کارشناسی انطباق',
      browser: 'Safari 17.4',
      os: 'macOS',
      locationApprox: 'تهران، ستاد مرکزی دیدار',
      createdAt: '1403/06/17 - 08:20',
      lastActivityAt: '۱ ساعت پیش',
      expiresAt: '1403/06/17 - 08:50',
      isCurrent: false,
      isRevoked: false,
      mfaVerifiedForSession: true
    },
    {
      id: 'sess-005',
      userId: 'usr-005',
      username: 'a.zare',
      fullName: 'امیرحسین زارع',
      role: 'trader',
      ipAddress: '89.165.34.12',
      userAgent: 'DidarPOS/2.4 (Android 12; Sunmi V2s Plus)',
      deviceType: 'pos_terminal',
      deviceName: 'پایانه فروش هوشمند کارگاه تبریز',
      browser: 'Didar POS App',
      os: 'Android 12',
      locationApprox: 'تبریز، راسته طلافروشان',
      createdAt: '1403/06/15 - 14:50',
      lastActivityAt: '۲ روز پیش',
      expiresAt: '1403/06/15 - 15:50',
      isCurrent: false,
      isRevoked: false,
      mfaVerifiedForSession: false
    }
  ];

  const securityKeys: MfaSecurityKey[] = [
    {
      id: 'key-001',
      userId: 'usr-001',
      name: 'YubiKey 5C NFC - مدیر ارشد امنیت',
      keyType: 'webauthn_fido2',
      model: 'Yubico YubiKey 5C NFC FIPS',
      addedAt: '1403/03/10',
      lastUsedAt: '1403/06/17 - 10:15'
    },
    {
      id: 'key-002',
      userId: 'usr-001',
      name: 'YubiKey 5 Nano (کلید پشتیبان فیزیکی خزانه‌داری)',
      keyType: 'webauthn_fido2',
      model: 'Yubico 5 Nano',
      addedAt: '1403/03/10',
      lastUsedAt: '1403/05/20'
    },
    {
      id: 'key-003',
      userId: 'usr-002',
      name: 'YubiKey 5 NFC - متصدی تحویل و دریافت شمش طلا',
      keyType: 'webauthn_fido2',
      model: 'Yubico 5 NFC Hardware Key',
      addedAt: '1403/04/01',
      lastUsedAt: '1403/06/17 - 09:40'
    }
  ];

  const securityLogs: SecurityEventLog[] = [
    {
      id: 'log-001',
      eventType: 'login_success',
      severity: 'info',
      userId: 'usr-001',
      username: 'a.rahimi',
      actorName: 'علی رحیمی',
      ipAddress: '5.160.82.14',
      userAgent: 'Chrome 128 (macOS)',
      details: 'ورود موفق به سامانه با کلمه عبور و تایید توکن نرم‌افزاری TOTP',
      timestamp: '1403/06/17 - 10:16:05'
    },
    {
      id: 'log-002',
      eventType: 'mfa_challenge_passed',
      severity: 'info',
      userId: 'usr-002',
      username: 's.kiani',
      actorName: 'سهراب کیانی',
      ipAddress: '185.110.12.9',
      userAgent: 'Chrome 127 (Windows 11)',
      details: 'احراز هویت موفق با کلید فیزیکی FIDO2 جهت تایید تحویل شمش طلا به خزانه‌داری',
      timestamp: '1403/06/17 - 09:41:20'
    },
    {
      id: 'log-003',
      eventType: 'account_locked',
      severity: 'critical',
      userId: 'usr-006',
      username: 'n.parsa',
      actorName: 'سیستم تشخیص نفوذ (IDS)',
      ipAddress: '94.182.11.23',
      userAgent: 'Unknown/Bot Probe',
      details: 'قفل خودکار حساب کاربری به دلیل ۵ بار تلاش متوالی با رمز عبور اشتباه',
      timestamp: '1403/06/17 - 07:15:44'
    },
    {
      id: 'log-004',
      eventType: 'login_failed',
      severity: 'warning',
      userId: 'usr-006',
      username: 'n.parsa',
      actorName: 'ناشناس',
      ipAddress: '94.182.11.23',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'خطای کلمه عبور نامعتبر (تلاش پنجم قبل از مسدودسازی حساب)',
      timestamp: '1403/06/17 - 07:15:30'
    },
    {
      id: 'log-005',
      eventType: 'step_up_triggered',
      severity: 'warning',
      userId: 'usr-003',
      username: 'm.hosseini',
      actorName: 'محمد حسینی',
      ipAddress: '2.144.110.45',
      userAgent: 'Firefox 129 (Windows 10)',
      details: 'الزام احراز مجدد مرحله‌ای (Step-Up) به دلیل درخواست ثبت حواله طلا به وزن ۳۵۰ گرم',
      timestamp: '1403/06/16 - 18:35:10'
    },
    {
      id: 'log-006',
      eventType: 'mfa_challenge_passed',
      severity: 'info',
      userId: 'usr-003',
      username: 'm.hosseini',
      actorName: 'محمد حسینی',
      ipAddress: '2.144.110.45',
      userAgent: 'Firefox 129 (Windows 10)',
      details: 'تایید احراز مرحله‌ای با کد دوعاملی یک‌بارمصرف پیامکی و فعال‌سازی حواله',
      timestamp: '1403/06/16 - 18:35:55'
    },
    {
      id: 'log-007',
      eventType: 'mfa_enforced',
      severity: 'info',
      userId: 'usr-004',
      username: 'z.ahmadi',
      actorName: 'ادمین ارشد امنیت',
      ipAddress: '5.160.82.14',
      userAgent: 'Chrome 128 (macOS)',
      details: 'اعمال الزامی احراز دوعاملی (MFA Mandatory) بر روی حساب کارشناسی ریسک بر اساس سیاست امنیت پلتفرم',
      timestamp: '1403/06/10 - 11:20:00'
    }
  ];

  const policyRules: MfaPolicyRule[] = [
    {
      id: 'pol-001',
      nameFa: 'سیاست امنیت سخت‌گیرانه خزانه‌داری مرکزی طلا',
      descriptionFa: 'الزام قطعی احراز دوعاملی با کلید سخت‌افزاری FIDO2/YubiKey برای کلیه متصدیان جابجایی فیزیکی طلا و تسویه نهایی.',
      appliesToRoles: ['treasury_officer', 'super_admin'],
      minimumTrustTier: 'tier_3_commercial',
      isMfaRequired: true,
      allowedMfaMethods: ['security_key', 'totp'],
      requireHardwareKeyForTreasury: true,
      stepUpThresholdGrams: 20,
      sessionTimeoutMinutes: 15,
      maxConcurrentSessions: 1
    },
    {
      id: 'pol-002',
      nameFa: 'سیاست تجاری بنکداران، معامله‌گران و کارگاه‌های طلا',
      descriptionFa: 'الزام احراز دوعاملی TOTP یا پیامکی برای ورود به تالار مظنه، و احراز مجدد آنی در سفارش‌های بالای ۵۰ گرم طلا.',
      appliesToRoles: ['dealer_operator', 'trader', 'risk_manager'],
      minimumTrustTier: 'tier_2_business',
      isMfaRequired: true,
      allowedMfaMethods: ['totp', 'sms_otp', 'security_key'],
      requireHardwareKeyForTreasury: false,
      stepUpThresholdGrams: 50,
      sessionTimeoutMinutes: 30,
      maxConcurrentSessions: 2
    },
    {
      id: 'pol-003',
      nameFa: 'سیاست مشتریان خرد و خریداران عادی طلا',
      descriptionFa: 'احراز دوعاملی پیامکی اختیاری، با الزام احراز مرحله‌ای در خریدهای بالای ۱۰۰ گرم و یا درخواست‌های برداشت موجودی.',
      appliesToRoles: ['customer'],
      minimumTrustTier: 'tier_1_identity',
      isMfaRequired: false,
      allowedMfaMethods: ['sms_otp', 'email_otp'],
      requireHardwareKeyForTreasury: false,
      stepUpThresholdGrams: 100,
      sessionTimeoutMinutes: 60,
      maxConcurrentSessions: 3
    }
  ];

  return { accounts, activeSessions, securityKeys, securityLogs, policyRules };
}

export function loadK03Store(): K03StoreData {
  ensureDirectoryExists();
  if (!fs.existsSync(K03_FILE)) {
    const initial = getInitialK03Data();
    fs.writeFileSync(K03_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(K03_FILE, 'utf-8');
    return JSON.parse(raw) as K03StoreData;
  } catch (err) {
    console.error('Error reading K03 store, resetting to initial:', err);
    const initial = getInitialK03Data();
    fs.writeFileSync(K03_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

export async function saveK03Store(data: K03StoreData): Promise<void> {
  ensureDirectoryExists();
  fs.writeFileSync(K03_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getK03Stats(data: K03StoreData): K03Stats {
  const total = data.accounts.length;
  const mfaEnabledCount = data.accounts.filter(a => a.mfaConfig.isEnforced || a.mfaConfig.totpConfigured || a.mfaConfig.methodsEnabled.length > 1).length;
  const mfaPercent = total > 0 ? Math.round((mfaEnabledCount / total) * 100) : 0;
  const activeSessionsCount = data.activeSessions.filter(s => !s.isRevoked).length;
  const lockedAccountsCount = data.accounts.filter(a => a.status === 'locked').length;
  const criticalEvents24h = data.securityLogs.filter(l => l.severity === 'critical' || l.severity === 'warning').length;
  const totpUsersCount = data.accounts.filter(a => a.mfaConfig.totpConfigured).length;
  const hardwareKeyCount = data.securityKeys.length;

  return {
    totalAccounts: total,
    mfaEnabledPercent: mfaPercent,
    activeSessionsCount,
    lockedAccountsCount,
    criticalEvents24h,
    totpUsersCount,
    hardwareKeyCount
  };
}

export async function getK03Payload(): Promise<K03DataPayload> {
  const store = loadK03Store();
  const stats = getK03Stats(store);
  return {
    accounts: store.accounts,
    activeSessions: store.activeSessions,
    securityKeys: store.securityKeys,
    securityLogs: store.securityLogs,
    policyRules: store.policyRules,
    stats
  };
}

export const k03Storage = {
  getPayload: getK03Payload,

  async toggleMfaEnforcement(userId: string, isEnforced: boolean, defaultMethod?: MfaMethod): Promise<UserAccount> {
    const store = loadK03Store();
    const acc = store.accounts.find(a => a.id === userId);
    if (!acc) throw new Error(`User account ${userId} not found`);

    acc.mfaConfig.isEnforced = isEnforced;
    if (defaultMethod) {
      acc.mfaConfig.defaultMethod = defaultMethod;
      if (!acc.mfaConfig.methodsEnabled.includes(defaultMethod)) {
        acc.mfaConfig.methodsEnabled.push(defaultMethod);
      }
    }

    const now = new Date().toLocaleDateString('fa-IR');
    store.securityLogs.unshift({
      id: `log-${Date.now()}`,
      eventType: 'mfa_enforced',
      severity: 'info',
      userId: acc.id,
      username: acc.username,
      actorName: 'مدیر امنیت',
      ipAddress: '5.160.82.14',
      userAgent: 'Admin Dashboard',
      details: `تغییر وضعیت الزام احراز دوعاملی برای کاربر ${acc.fullName}: ${isEnforced ? 'اجباری شد' : 'اختیاری شد'} با روش پیش‌فرض ${acc.mfaConfig.defaultMethod}`,
      timestamp: `${now} - ${new Date().toLocaleTimeString('fa-IR')}`
    });

    await saveK03Store(store);
    return acc;
  },

  async verifyAndConfigureTotp(userId: string, code: string): Promise<UserAccount> {
    const store = loadK03Store();
    const acc = store.accounts.find(a => a.id === userId);
    if (!acc) throw new Error(`User account ${userId} not found`);

    // In a real crypto implementation, totp.verify() would be run.
    // We validate any 6-digit code or demo codes
    if (!/^\d{6}$/.test(code)) {
      throw new Error('کد احراز دوعاملی باید یک عدد ۶ رقمی معتبر باشد.');
    }

    acc.mfaConfig.totpConfigured = true;
    if (!acc.mfaConfig.methodsEnabled.includes('totp')) {
      acc.mfaConfig.methodsEnabled.push('totp');
    }
    acc.mfaConfig.backupCodesRemaining = 10;
    acc.mfaConfig.lastMfaVerifiedAt = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR');

    const now = new Date().toLocaleDateString('fa-IR');
    store.securityLogs.unshift({
      id: `log-${Date.now()}`,
      eventType: 'mfa_challenge_passed',
      severity: 'info',
      userId: acc.id,
      username: acc.username,
      actorName: acc.fullName,
      ipAddress: '5.160.82.14',
      userAgent: 'TOTP Setup Wizard',
      details: `فعال‌سازی و تایید موفق نرم‌افزار احراز دوعاملی (Google Authenticator / Duo) با کد اعتبارسنجی ${code}`,
      timestamp: `${now} - ${new Date().toLocaleTimeString('fa-IR')}`
    });

    await saveK03Store(store);
    return acc;
  },

  async addHardwareSecurityKey(userId: string, keyName: string, model: string): Promise<MfaSecurityKey> {
    const store = loadK03Store();
    const acc = store.accounts.find(a => a.id === userId);
    if (!acc) throw new Error(`User account ${userId} not found`);

    const now = new Date().toLocaleDateString('fa-IR');
    const newKey: MfaSecurityKey = {
      id: `key-${Date.now()}`,
      userId,
      name: keyName || 'کلید امنیتی FIDO2 / YubiKey',
      keyType: 'webauthn_fido2',
      model: model || 'Yubico YubiKey 5 Series',
      addedAt: now,
      lastUsedAt: 'هم‌اکنون'
    };

    store.securityKeys.push(newKey);
    acc.mfaConfig.securityKeyCount = (acc.mfaConfig.securityKeyCount || 0) + 1;
    if (!acc.mfaConfig.methodsEnabled.includes('security_key')) {
      acc.mfaConfig.methodsEnabled.push('security_key');
    }

    store.securityLogs.unshift({
      id: `log-${Date.now()}`,
      eventType: 'mfa_challenge_passed',
      severity: 'info',
      userId: acc.id,
      username: acc.username,
      actorName: acc.fullName,
      ipAddress: '5.160.82.14',
      userAgent: 'WebAuthn / FIDO2 Enroller',
      details: `ثبت و پیوند موفق کلید سخت‌افزاری ${newKey.name} (${newKey.model}) به حساب کاربر`,
      timestamp: `${now} - ${new Date().toLocaleTimeString('fa-IR')}`
    });

    await saveK03Store(store);
    return newKey;
  },

  async revokeSession(sessionId: string): Promise<void> {
    const store = loadK03Store();
    const session = store.activeSessions.find(s => s.id === sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    session.isRevoked = true;

    const now = new Date().toLocaleDateString('fa-IR');
    store.securityLogs.unshift({
      id: `log-${Date.now()}`,
      eventType: 'session_revoked',
      severity: 'info',
      userId: session.userId,
      username: session.username,
      actorName: 'مدیر امنیت',
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      details: `خروج اجباری و ابطال نشست فعال دستگاه «${session.deviceName}» متعلق به ${session.fullName}`,
      timestamp: `${now} - ${new Date().toLocaleTimeString('fa-IR')}`
    });

    await saveK03Store(store);
  },

  async revokeAllUserSessions(userId: string, keepCurrentId?: string): Promise<number> {
    const store = loadK03Store();
    let count = 0;
    for (const session of store.activeSessions) {
      if (session.userId === userId && !session.isRevoked && session.id !== keepCurrentId) {
        session.isRevoked = true;
        count++;
      }
    }

    const now = new Date().toLocaleDateString('fa-IR');
    store.securityLogs.unshift({
      id: `log-${Date.now()}`,
      eventType: 'session_revoked',
      severity: 'warning',
      userId,
      actorName: 'مدیر امنیت',
      ipAddress: '5.160.82.14',
      userAgent: 'Admin Dashboard',
      details: `ابطال تمام نشست‌های فعال کاربر (${count} نشست خارج شد)`,
      timestamp: `${now} - ${new Date().toLocaleTimeString('fa-IR')}`
    });

    await saveK03Store(store);
    return count;
  },

  async unlockAccount(userId: string): Promise<UserAccount> {
    const store = loadK03Store();
    const acc = store.accounts.find(a => a.id === userId);
    if (!acc) throw new Error(`User account ${userId} not found`);

    acc.status = 'active';
    acc.failedLoginAttempts = 0;
    acc.lockedUntil = undefined;

    const now = new Date().toLocaleDateString('fa-IR');
    store.securityLogs.unshift({
      id: `log-${Date.now()}`,
      eventType: 'account_unlocked',
      severity: 'info',
      userId: acc.id,
      username: acc.username,
      actorName: 'مدیر امنیت',
      ipAddress: '5.160.82.14',
      userAgent: 'Admin Dashboard',
      details: `رفع مسدودی و فعال‌سازی مجدد حساب کاربری ${acc.fullName} پس از بررسی هویت`,
      timestamp: `${now} - ${new Date().toLocaleTimeString('fa-IR')}`
    });

    await saveK03Store(store);
    return acc;
  },

  async updateSecuritySettings(userId: string, settings: Partial<UserAccount['securitySettings']>): Promise<UserAccount> {
    const store = loadK03Store();
    const acc = store.accounts.find(a => a.id === userId);
    if (!acc) throw new Error(`User account ${userId} not found`);

    acc.securitySettings = {
      ...acc.securitySettings,
      ...settings
    };

    const now = new Date().toLocaleDateString('fa-IR');
    store.securityLogs.unshift({
      id: `log-${Date.now()}`,
      eventType: 'password_changed',
      severity: 'info',
      userId: acc.id,
      username: acc.username,
      actorName: 'مدیر امنیت',
      ipAddress: '5.160.82.14',
      userAgent: 'Admin Dashboard',
      details: `به‌روزرسانی تنظیمات امنیتی کاربر ${acc.fullName}: زمان انقضای نشست ${acc.securitySettings.sessionTimeoutMinutes} دقیقه، آستانه استپ‌آپ ${acc.securitySettings.stepUpAuthThresholdGrams} گرم طلا`,
      timestamp: `${now} - ${new Date().toLocaleTimeString('fa-IR')}`
    });

    await saveK03Store(store);
    return acc;
  },

  async updatePolicyRule(ruleId: string, updates: Partial<MfaPolicyRule>): Promise<MfaPolicyRule> {
    const store = loadK03Store();
    const rule = store.policyRules.find(r => r.id === ruleId);
    if (!rule) throw new Error(`Policy rule ${ruleId} not found`);

    Object.assign(rule, updates);

    const now = new Date().toLocaleDateString('fa-IR');
    store.securityLogs.unshift({
      id: `log-${Date.now()}`,
      eventType: 'mfa_enforced',
      severity: 'info',
      actorName: 'مدیر ارشد امنیت',
      ipAddress: '5.160.82.14',
      userAgent: 'Admin Dashboard',
      details: `به‌روزرسانی سیاست امنیتی «${rule.nameFa}»: الزام MFA=${rule.isMfaRequired}، آستانه استپ‌آپ=${rule.stepUpThresholdGrams}g طلا`,
      timestamp: `${now} - ${new Date().toLocaleTimeString('fa-IR')}`
    });

    await saveK03Store(store);
    return rule;
  },

  async simulateStepUpChallenge(userId: string, operationFa: string, amountGrams: number, method: MfaMethod, code: string): Promise<{ success: boolean; message: string }> {
    const store = loadK03Store();
    const acc = store.accounts.find(a => a.id === userId);
    if (!acc) throw new Error(`User account ${userId} not found`);

    const now = new Date().toLocaleDateString('fa-IR');
    if (!code || code.length < 4) {
      store.securityLogs.unshift({
        id: `log-${Date.now()}`,
        eventType: 'mfa_challenge_failed',
        severity: 'warning',
        userId: acc.id,
        username: acc.username,
        actorName: acc.fullName,
        ipAddress: '5.160.82.14',
        userAgent: 'Step-up Challenge Gateway',
        details: `تلاش ناموفق در پاسخ به چالش احراز مرحله‌ای برای عملیات «${operationFa}» به ارزش ${amountGrams} گرم طلا (کد اشتباه)`,
        timestamp: `${now} - ${new Date().toLocaleTimeString('fa-IR')}`
      });
      await saveK03Store(store);
      return { success: false, message: 'کد احراز دوعاملی مرحله‌ای نامعتبر است.' };
    }

    store.securityLogs.unshift({
      id: `log-${Date.now()}`,
      eventType: 'mfa_challenge_passed',
      severity: 'info',
      userId: acc.id,
      username: acc.username,
      actorName: acc.fullName,
      ipAddress: '5.160.82.14',
      userAgent: 'Step-up Challenge Gateway',
      details: `احراز مرحله‌ای (Step-Up) موفق با روش ${method} برای عملیات حساس «${operationFa}» به ارزش ${amountGrams} گرم طلا`,
      timestamp: `${now} - ${new Date().toLocaleTimeString('fa-IR')}`
    });
    await saveK03Store(store);
    return { success: true, message: `احراز مرحله‌ای تایید شد و عملیات «${operationFa}» به وزن ${amountGrams} گرم طلا با موفقیت مجوز اجرا گرفت.` };
  }
};
