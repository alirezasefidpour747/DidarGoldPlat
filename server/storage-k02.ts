/**
 * Didar Gold Platform - Domain K02 Storage Engine
 * Progressive Onboarding, Trust & Entitlements Persistence
 */

import fs from 'fs';
import path from 'path';
import {
  K02DataPayload,
  OnboardingApplication,
  CommercialEntitlements,
  TrustTier,
  TrustTierConfig,
  ChecklistStepKey,
  VerificationCallLog,
  OnboardingStatus
} from '../src/types/k02.js';
import { loadStore, saveStore } from './storage.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const K02_DATA_FILE = path.join(DATA_DIR, 'didar-k02-store.json');

let cachedK02Data: K02DataPayload | null = null;
let isSavingK02 = false;

export const DEFAULT_TIER_CONFIGS: Record<TrustTier, TrustTierConfig> = {
  tier_0_guest: {
    tier: 'tier_0_guest',
    titleFa: 'سطح ۰: کاربر مهمان (مشاهده پایه)',
    titleEn: 'Tier 0: Guest / Public Explorer',
    badgeColor: '#7E7E8F',
    descriptionFa: 'دسترسی محدود به مشاهده کاتالوگ عمومی کالاها؛ بدون دسترسی به مظنه زنده، خرید و تسویه.',
    maxDailyGoldGrams: 0,
    maxCreditAllowanceGrams: 0,
    requiresGuildLicense: false,
    requiresFinancialClearance: false,
    allowedFeatures: ['مشاهده کاتالوگ عمومی بدون قیمت', 'ثبت درخواست پرونده پذیرش']
  },
  tier_1_identity: {
    tier: 'tier_1_identity',
    titleFa: 'سطح ۱: احراز هویت فردی',
    titleEn: 'Tier 1: Identity Verified',
    badgeColor: '#3E9B4F',
    descriptionFa: 'شماره تلفن و کدملی تطبیق‌داده‌شده؛ امکان خرید نقدی خرد تا ۵۰ گرم طلا با دسترسی به مظنه زنده.',
    maxDailyGoldGrams: 50,
    maxCreditAllowanceGrams: 0,
    requiresGuildLicense: false,
    requiresFinancialClearance: false,
    allowedFeatures: ['مشاهده نرخ مظنه و شمش زنده', 'خرید نقدی تا ۵۰ گرم طلا', 'کیف پول انفرادی طلا']
  },
  tier_2_business: {
    tier: 'tier_2_business',
    titleFa: 'سطح ۲: واحد صنفی معتبر (طلافروشی / بنکدار)',
    titleEn: 'Tier 2: Verified Guild Business',
    badgeColor: '#C8A951',
    descriptionFa: 'پروانه کسب معتبر از اتحادیه صنف طلا و جواهر احراز شده؛ دسترسی به تالار بنکداری و خرید اعتباری.',
    maxDailyGoldGrams: 500,
    maxCreditAllowanceGrams: 100,
    requiresGuildLicense: true,
    requiresFinancialClearance: false,
    allowedFeatures: [
      'دسترسی به معاملات عمده و بنکداری',
      'سفارش خرید تا ۵۰۰ گرم طلا در روز',
      'اعتبار تسویه دفتری ۱۰۰ گرم طلای ۱۸ عیار',
      'کارمزد تخفیفی همکار طلا',
      'دسترسی به فهرست اجرت‌های ویژه سازندگان'
    ]
  },
  tier_3_commercial: {
    tier: 'tier_3_commercial',
    titleFa: 'سطح ۳: شریک تجاری ارشد / کارگاه منتخب',
    titleEn: 'Tier 3: Commercial Partner & Manufacturer',
    badgeColor: '#E5C365',
    descriptionFa: 'احراز کامل تضامین مالی و پروانه تولید صنعتی؛ سفارش نامحدود تا ۵۰۰۰ گرم، خط اعتباری K16 و سفارش ساخت مستقیم.',
    maxDailyGoldGrams: 5000,
    maxCreditAllowanceGrams: 1200,
    requiresGuildLicense: true,
    requiresFinancialClearance: true,
    allowedFeatures: [
      'سفارش عمده تا ۵,۰۰۰ گرم در روز',
      'خط اعتباری امانی ۱۲۰۰ گرم طلا در K16',
      'سفارش مستقیم ساخت به کارگاه‌های تولیدی',
      'دسترسی به تخصیص مستقیم شمش و آبشده',
      'تخفیف حداکثری کارمزد سازندگان'
    ]
  }
};

function getInitialSeedApplications(): OnboardingApplication[] {
  const now = new Date().toISOString();

  return [
    {
      id: 'app-k02-001',
      applicationNumber: 'APP-2026-0101',
      targetType: 'organization',
      targetId: 'org-ret-parnia-004',
      targetName: 'طلا و جواهری پرنیا (سعادت‌آباد)',
      targetTypeLabel: 'فروشگاه خرده‌فروشی طلا',
      applicantPhone: '021-22089410',
      province: 'تهران',
      city: 'تهران',
      currentTier: 'tier_2_business',
      requestedTier: 'tier_2_business',
      status: 'approved',
      submissionDate: '2026-08-20T10:00:00.000Z',
      assignedReviewerId: 'party-admin-001',
      assignedReviewerName: 'علیرضا سفیدپور',
      riskScore: 12,
      reviewNotes: 'پروانه کسب اتحادیه طلا و جواهر تهران استعلام شد. ویترین فروشگاه در سعادت‌آباد تایید شد.',
      checklist: [
        { stepKey: 'basic_identity', labelFa: 'اطلاعات هویتی و ثبت شرکت/فروشگاه', labelEn: 'Basic Identity', completed: true, completedAt: '2026-08-20T11:00:00.000Z', completedBy: 'علیرضا سفیدپور', requiredForTier: 'tier_1_identity' },
        { stepKey: 'phone_verified', labelFa: 'راستی‌آزمایی خط تلفن ثابت و همراه', labelEn: 'Phone Verified', completed: true, completedAt: '2026-08-20T11:30:00.000Z', completedBy: 'علیرضا سفیدپور', requiredForTier: 'tier_1_identity' },
        { stepKey: 'guild_license', labelFa: 'استعلام پروانه کسب از اتحادیه طلا', labelEn: 'Guild License Verification', completed: true, completedAt: '2026-08-21T09:15:00.000Z', completedBy: 'علیرضا سفیدپور', notes: 'شماره جواز کسب GL-TH-49201 تایید شد', requiredForTier: 'tier_2_business' },
        { stepKey: 'store_inspection', labelFa: 'ارزیابی فیزیکی فروشگاه و گاوصندوق', labelEn: 'Store Inspection', completed: true, completedAt: '2026-08-21T14:00:00.000Z', completedBy: 'محمدرضا شفیعی', notes: 'بازدید حضوری انجام شد؛ امنیت گاوصندوق مطلوب است', requiredForTier: 'tier_2_business' },
        { stepKey: 'expert_call', labelFa: 'تماس کارشناسی با مدیر واحد صنفی', labelEn: 'Expert Call', completed: true, completedAt: '2026-08-21T16:00:00.000Z', completedBy: 'علیرضا سفیدپور', requiredForTier: 'tier_2_business' },
        { stepKey: 'agreement_accepted', labelFa: 'امضای تعهدنامه و قوانین تجاری دیدار', labelEn: 'Agreement Acceptance', completed: true, completedAt: '2026-08-22T08:30:00.000Z', completedBy: 'حسین میرزایی', requiredForTier: 'tier_2_business' },
        { stepKey: 'financial_guarantee', labelFa: 'تودیع وثیقه و اعتبارسنجی تراز مالی', labelEn: 'Financial Guarantee', completed: false, requiredForTier: 'tier_3_commercial' }
      ],
      verificationCalls: [
        {
          calledAt: '2026-08-21T16:00:00.000Z',
          callerId: 'party-admin-001',
          callerName: 'علیرضا سفیدپور',
          contactNumber: '09124445566',
          result: 'successful',
          notes: 'مکالمه با آقای میرزایی؛ هماهنگی‌های سقف خرید و شیوه تسویه اعتباری انجام شد.'
        }
      ],
      commercialEntitlements: {
        targetId: 'org-ret-parnia-004',
        targetType: 'organization',
        targetName: 'طلا و جواهری پرنیا (سعادت‌آباد)',
        tier: 'tier_2_business',
        dailyGoldLimitGrams: 500,
        creditAllowanceGrams: 100,
        canAccessWholesaleMarket: true,
        canPlaceCustomOrders: false,
        canAccessConsignment: false,
        dealerMarginDiscountPercent: 2.5,
        isCommercialLocked: false,
        lastTierUpgradedAt: '2026-08-22T09:00:00.000Z'
      },
      updatedAt: '2026-08-22T09:00:00.000Z',
      version: 1
    },
    {
      id: 'app-k02-002',
      applicationNumber: 'APP-2026-0102',
      targetType: 'organization',
      targetId: 'org-mfg-espadana-002',
      targetName: 'صنایع زرین‌سازان اسپادانا (اصفهان)',
      targetTypeLabel: 'کارگاه تولیدی و صنعتی طلا',
      applicantPhone: '031-32219400',
      province: 'اصفهان',
      city: 'اصفهان',
      currentTier: 'tier_3_commercial',
      requestedTier: 'tier_3_commercial',
      status: 'approved',
      submissionDate: '2026-08-15T08:00:00.000Z',
      assignedReviewerId: 'party-admin-001',
      assignedReviewerName: 'علیرضا سفیدپور',
      riskScore: 16,
      reviewNotes: 'پروانه بهره‌برداری وزارت صمت و ری‌گیری استاندارد تایید شد. وثیقه شمش طلا تودیع شد.',
      checklist: [
        { stepKey: 'basic_identity', labelFa: 'اطلاعات هویتی و ثبت شرکت/فروشگاه', labelEn: 'Basic Identity', completed: true, completedAt: '2026-08-15T09:00:00.000Z', requiredForTier: 'tier_1_identity' },
        { stepKey: 'phone_verified', labelFa: 'راستی‌آزمایی خط تلفن ثابت و همراه', labelEn: 'Phone Verified', completed: true, completedAt: '2026-08-15T09:30:00.000Z', requiredForTier: 'tier_1_identity' },
        { stepKey: 'guild_license', labelFa: 'استعلام پروانه کسب از اتحادیه طلا', labelEn: 'Guild License Verification', completed: true, completedAt: '2026-08-16T10:00:00.000Z', requiredForTier: 'tier_2_business' },
        { stepKey: 'store_inspection', labelFa: 'ارزیابی فیزیکی فروشگاه و کارگاه', labelEn: 'Store/Workshop Inspection', completed: true, completedAt: '2026-08-17T11:00:00.000Z', completedBy: 'محمدرضا شفیعی', notes: 'بازدید از خط نورد و تولید النگو در اصفهان انجام شد', requiredForTier: 'tier_2_business' },
        { stepKey: 'expert_call', labelFa: 'تماس کارشناسی با مدیر واحد صنفی', labelEn: 'Expert Call', completed: true, completedAt: '2026-08-17T14:00:00.000Z', requiredForTier: 'tier_2_business' },
        { stepKey: 'agreement_accepted', labelFa: 'امضای تعهدنامه و قوانین تجاری دیدار', labelEn: 'Agreement Acceptance', completed: true, completedAt: '2026-08-18T09:00:00.000Z', requiredForTier: 'tier_2_business' },
        { stepKey: 'financial_guarantee', labelFa: 'تودیع وثیقه و اعتبارسنجی تراز مالی', labelEn: 'Financial Guarantee', completed: true, completedAt: '2026-08-19T10:00:00.000Z', completedBy: 'علیرضا سفیدپور', notes: 'ضمانت‌نامه بانکی و تاییدیه ری‌گیری دریافت شد', requiredForTier: 'tier_3_commercial' }
      ],
      verificationCalls: [
        {
          calledAt: '2026-08-17T14:00:00.000Z',
          callerId: 'party-admin-001',
          callerName: 'علیرضا سفیدپور',
          contactNumber: '031-32219400',
          result: 'successful',
          notes: 'تایید ظرفیت ساخت ماهانه ۴۵ کیلوگرم طلا با عیار ۷۵۰.'
        }
      ],
      commercialEntitlements: {
        targetId: 'org-mfg-espadana-002',
        targetType: 'organization',
        targetName: 'صنایع زرین‌سازان اسپادانا (اصفهان)',
        tier: 'tier_3_commercial',
        dailyGoldLimitGrams: 5000,
        creditAllowanceGrams: 1200,
        canAccessWholesaleMarket: true,
        canPlaceCustomOrders: true,
        canAccessConsignment: true,
        dealerMarginDiscountPercent: 4.0,
        isCommercialLocked: false,
        lastTierUpgradedAt: '2026-08-19T12:00:00.000Z'
      },
      updatedAt: '2026-08-19T12:00:00.000Z',
      version: 1
    },
    {
      id: 'app-k02-003',
      applicationNumber: 'APP-2026-0103',
      targetType: 'organization',
      targetId: 'org-who-pars-003',
      targetName: 'بنکداری طلا و جواهر پارس زرین',
      targetTypeLabel: 'توزیع‌کننده عمده بازار طلا',
      applicantPhone: '021-55621890',
      province: 'تهران',
      city: 'تهران',
      currentTier: 'tier_2_business',
      requestedTier: 'tier_3_commercial',
      status: 'in_review',
      submissionDate: '2026-09-02T11:20:00.000Z',
      assignedReviewerId: 'party-admin-001',
      assignedReviewerName: 'علیرضا سفیدپور',
      riskScore: 24,
      reviewNotes: 'درخواست افزایش سقف اعتبار معوق به ۲۰۰۰ گرم طلا به منظور بنکداری راسته طلافروشان.',
      checklist: [
        { stepKey: 'basic_identity', labelFa: 'اطلاعات هویتی و ثبت شرکت/فروشگاه', labelEn: 'Basic Identity', completed: true, completedAt: '2026-09-02T12:00:00.000Z', requiredForTier: 'tier_1_identity' },
        { stepKey: 'phone_verified', labelFa: 'راستی‌آزمایی خط تلفن ثابت و همراه', labelEn: 'Phone Verified', completed: true, completedAt: '2026-09-02T12:10:00.000Z', requiredForTier: 'tier_1_identity' },
        { stepKey: 'guild_license', labelFa: 'استعلام پروانه کسب از اتحادیه طلا', labelEn: 'Guild License Verification', completed: true, completedAt: '2026-09-03T09:00:00.000Z', notes: 'پروانه بنکداری تایید گردید', requiredForTier: 'tier_2_business' },
        { stepKey: 'store_inspection', labelFa: 'ارزیابی فیزیکی فروشگاه و گاوصندوق', labelEn: 'Store Inspection', completed: true, completedAt: '2026-09-04T11:00:00.000Z', notes: 'خزانه مرکزی بازار بزرگ تهران ارزیابی شد', requiredForTier: 'tier_2_business' },
        { stepKey: 'expert_call', labelFa: 'تماس کارشناسی با مدیر واحد صنفی', labelEn: 'Expert Call', completed: true, completedAt: '2026-09-05T10:30:00.000Z', requiredForTier: 'tier_2_business' },
        { stepKey: 'agreement_accepted', labelFa: 'امضای تعهدنامه و قوانین تجاری دیدار', labelEn: 'Agreement Acceptance', completed: true, completedAt: '2026-09-05T15:00:00.000Z', requiredForTier: 'tier_2_business' },
        { stepKey: 'financial_guarantee', labelFa: 'تودیع وثیقه و اعتبارسنجی تراز مالی', labelEn: 'Financial Guarantee', completed: false, notes: 'منتظر ارائه چک ضمانت بنکداری یا سفته الکترونیک معتبر', requiredForTier: 'tier_3_commercial' }
      ],
      verificationCalls: [
        {
          calledAt: '2026-09-05T10:30:00.000Z',
          callerId: 'party-admin-001',
          callerName: 'علیرضا سفیدپور',
          contactNumber: '021-55621890',
          result: 'successful',
          notes: 'مذاکره درباره تامین تضمین بانکی برای سقف ۲ کیلوگرم طلای امانی.'
        }
      ],
      commercialEntitlements: {
        targetId: 'org-who-pars-003',
        targetType: 'organization',
        targetName: 'بنکداری طلا و جواهر پارس زرین',
        tier: 'tier_2_business',
        dailyGoldLimitGrams: 1000,
        creditAllowanceGrams: 300,
        canAccessWholesaleMarket: true,
        canPlaceCustomOrders: true,
        canAccessConsignment: false,
        dealerMarginDiscountPercent: 3.0,
        isCommercialLocked: false,
        lastTierUpgradedAt: '2026-08-25T10:00:00.000Z'
      },
      updatedAt: '2026-09-05T15:00:00.000Z',
      version: 2
    },
    {
      id: 'app-k02-004',
      applicationNumber: 'APP-2026-0104',
      targetType: 'organization',
      targetId: 'org-pending-zarinkoub',
      targetName: 'گالری طلای زرین‌کوب بازار بزرگ',
      targetTypeLabel: 'فروشگاه طلا و سکه',
      applicantPhone: '09123334455',
      province: 'تهران',
      city: 'تهران',
      currentTier: 'tier_1_identity',
      requestedTier: 'tier_2_business',
      status: 'expert_assigned',
      submissionDate: '2026-09-06T09:15:00.000Z',
      assignedReviewerId: 'party-agent-002',
      assignedReviewerName: 'محمدرضا شفیعی (عامل میدانی)',
      riskScore: 32,
      reviewNotes: 'مدارک جواز کسب و کد پستی بارگذاری شده است. پرونده جهت بازدید حضوری از مغازه به عامل میدانی ارجاع گردید.',
      checklist: [
        { stepKey: 'basic_identity', labelFa: 'اطلاعات هویتی و ثبت شرکت/فروشگاه', labelEn: 'Basic Identity', completed: true, completedAt: '2026-09-06T10:00:00.000Z', requiredForTier: 'tier_1_identity' },
        { stepKey: 'phone_verified', labelFa: 'راستی‌آزمایی خط تلفن ثابت و همراه', labelEn: 'Phone Verified', completed: true, completedAt: '2026-09-06T10:15:00.000Z', requiredForTier: 'tier_1_identity' },
        { stepKey: 'guild_license', labelFa: 'استعلام پروانه کسب از اتحادیه طلا', labelEn: 'Guild License Verification', completed: true, completedAt: '2026-09-06T14:00:00.000Z', notes: 'جواز کسب شماره ۷۱۸۲۳ استعلام اولیه شد', requiredForTier: 'tier_2_business' },
        { stepKey: 'store_inspection', labelFa: 'ارزیابی فیزیکی فروشگاه و گاوصندوق', labelEn: 'Store Inspection', completed: false, notes: 'هماهنگی بازدید برای روز سه‌شنبه انجام خواهد شد', requiredForTier: 'tier_2_business' },
        { stepKey: 'expert_call', labelFa: 'تماس کارشناسی با مدیر واحد صنفی', labelEn: 'Expert Call', completed: false, requiredForTier: 'tier_2_business' },
        { stepKey: 'agreement_accepted', labelFa: 'امضای تعهدنامه و قوانین تجاری دیدار', labelEn: 'Agreement Acceptance', completed: false, requiredForTier: 'tier_2_business' },
        { stepKey: 'financial_guarantee', labelFa: 'تودیع وثیقه و اعتبارسنجی تراز مالی', labelEn: 'Financial Guarantee', completed: false, requiredForTier: 'tier_3_commercial' }
      ],
      verificationCalls: [],
      commercialEntitlements: {
        targetId: 'org-pending-zarinkoub',
        targetType: 'organization',
        targetName: 'گالری طلای زرین‌کوب بازار بزرگ',
        tier: 'tier_1_identity',
        dailyGoldLimitGrams: 50,
        creditAllowanceGrams: 0,
        canAccessWholesaleMarket: false,
        canPlaceCustomOrders: false,
        canAccessConsignment: false,
        dealerMarginDiscountPercent: 0,
        isCommercialLocked: false
      },
      updatedAt: '2026-09-06T14:00:00.000Z',
      version: 1
    },
    {
      id: 'app-k02-005',
      applicationNumber: 'APP-2026-0105',
      targetType: 'party',
      targetId: 'party-owner-afshar',
      targetName: 'سعید افشار (طلافروشی ماه زرین اصفهان)',
      targetTypeLabel: 'صاحب فروشگاه طلا',
      applicantPhone: '09135556677',
      province: 'اصفهان',
      city: 'اصفهان',
      currentTier: 'tier_0_guest',
      requestedTier: 'tier_2_business',
      status: 'needs_amendment',
      submissionDate: '2026-09-05T14:30:00.000Z',
      assignedReviewerId: 'party-admin-001',
      assignedReviewerName: 'علیرضا سفیدپور',
      riskScore: 48,
      amendmentNotes: 'تصویر پروانه کسب بارگذاری‌شده دارای انقضای تاریخ اعتبار است. لطفاً تمدیدیه اتحادیه طلا و جواهر اصفهان و گواهی مالیات بر ارزش افزوده بارگذاری شود.',
      checklist: [
        { stepKey: 'basic_identity', labelFa: 'اطلاعات هویتی و ثبت شرکت/فروشگاه', labelEn: 'Basic Identity', completed: true, completedAt: '2026-09-05T15:00:00.000Z', requiredForTier: 'tier_1_identity' },
        { stepKey: 'phone_verified', labelFa: 'راستی‌آزمایی خط تلفن ثابت و همراه', labelEn: 'Phone Verified', completed: true, completedAt: '2026-09-05T15:15:00.000Z', requiredForTier: 'tier_1_identity' },
        { stepKey: 'guild_license', labelFa: 'استعلام پروانه کسب از اتحادیه طلا', labelEn: 'Guild License Verification', completed: false, notes: 'اعتبار جواز منقضی بود؛ درخواست اصلاح ثبت شد', requiredForTier: 'tier_2_business' },
        { stepKey: 'store_inspection', labelFa: 'ارزیابی فیزیکی فروشگاه و گاوصندوق', labelEn: 'Store Inspection', completed: false, requiredForTier: 'tier_2_business' },
        { stepKey: 'expert_call', labelFa: 'تماس کارشناسی با مدیر واحد صنفی', labelEn: 'Expert Call', completed: true, completedAt: '2026-09-06T11:00:00.000Z', requiredForTier: 'tier_2_business' },
        { stepKey: 'agreement_accepted', labelFa: 'امضای تعهدنامه و قوانین تجاری دیدار', labelEn: 'Agreement Acceptance', completed: false, requiredForTier: 'tier_2_business' },
        { stepKey: 'financial_guarantee', labelFa: 'تودیع وثیقه و اعتبارسنجی تراز مالی', labelEn: 'Financial Guarantee', completed: false, requiredForTier: 'tier_3_commercial' }
      ],
      verificationCalls: [
        {
          calledAt: '2026-09-06T11:00:00.000Z',
          callerId: 'party-admin-001',
          callerName: 'علیرضا سفیدپور',
          contactNumber: '09135556677',
          result: 'needs_followup',
          notes: 'با آقای افشار تماس گرفته شد؛ اعلام نمودند تمدیدیه پروانه صادر شده و تا فردا آپلود می‌نمایند.'
        }
      ],
      commercialEntitlements: {
        targetId: 'party-owner-afshar',
        targetType: 'party',
        targetName: 'سعید افشار',
        tier: 'tier_0_guest',
        dailyGoldLimitGrams: 0,
        creditAllowanceGrams: 0,
        canAccessWholesaleMarket: false,
        canPlaceCustomOrders: false,
        canAccessConsignment: false,
        dealerMarginDiscountPercent: 0,
        isCommercialLocked: false
      },
      updatedAt: '2026-09-06T11:30:00.000Z',
      version: 2
    },
    {
      id: 'app-k02-006',
      applicationNumber: 'APP-2026-0106',
      targetType: 'party',
      targetId: 'party-agent-naderi',
      targetName: 'آرش نادری (نماینده بازاریابی و فروش)',
      targetTypeLabel: 'عامل میدانی و ارزیاب',
      applicantPhone: '09127778899',
      province: 'فارس',
      city: 'شیراز',
      currentTier: 'tier_1_identity',
      requestedTier: 'tier_2_business',
      status: 'in_review',
      submissionDate: '2026-09-07T08:00:00.000Z',
      assignedReviewerId: 'party-admin-001',
      assignedReviewerName: 'علیرضا سفیدپور',
      riskScore: 21,
      reviewNotes: 'متقاضی عاملیت فروش و توزیع طلا در بازار وکیل شیراز. سوابق عدم سوءپیشینه و وثیقه ملکی ارزیابی شد.',
      checklist: [
        { stepKey: 'basic_identity', labelFa: 'اطلاعات هویتی و ثبت شرکت/فروشگاه', labelEn: 'Basic Identity', completed: true, completedAt: '2026-09-07T08:30:00.000Z', requiredForTier: 'tier_1_identity' },
        { stepKey: 'phone_verified', labelFa: 'راستی‌آزمایی خط تلفن ثابت و همراه', labelEn: 'Phone Verified', completed: true, completedAt: '2026-09-07T08:45:00.000Z', requiredForTier: 'tier_1_identity' },
        { stepKey: 'guild_license', labelFa: 'استعلام پروانه کسب از اتحادیه طلا', labelEn: 'Guild License Verification', completed: true, completedAt: '2026-09-07T10:00:00.000Z', notes: 'سوابق فعالیت در بازار شیراز تایید شد', requiredForTier: 'tier_2_business' },
        { stepKey: 'store_inspection', labelFa: 'ارزیابی فیزیکی فروشگاه و دفتر', labelEn: 'Store/Office Inspection', completed: false, requiredForTier: 'tier_2_business' },
        { stepKey: 'expert_call', labelFa: 'تماس کارشناسی با مدیر واحد صنفی', labelEn: 'Expert Call', completed: false, requiredForTier: 'tier_2_business' },
        { stepKey: 'agreement_accepted', labelFa: 'امضای تعهدنامه و قوانین تجاری دیدار', labelEn: 'Agreement Acceptance', completed: false, requiredForTier: 'tier_2_business' },
        { stepKey: 'financial_guarantee', labelFa: 'تودیع وثیقه و اعتبارسنجی تراز مالی', labelEn: 'Financial Guarantee', completed: false, requiredForTier: 'tier_3_commercial' }
      ],
      verificationCalls: [],
      commercialEntitlements: {
        targetId: 'party-agent-naderi',
        targetType: 'party',
        targetName: 'آرش نادری',
        tier: 'tier_1_identity',
        dailyGoldLimitGrams: 50,
        creditAllowanceGrams: 0,
        canAccessWholesaleMarket: false,
        canPlaceCustomOrders: false,
        canAccessConsignment: false,
        dealerMarginDiscountPercent: 1.0,
        isCommercialLocked: false
      },
      updatedAt: '2026-09-07T10:00:00.000Z',
      version: 1
    }
  ];
}

function calculateTierStats(applications: OnboardingApplication[]): K02DataPayload['tierStats'] {
  let tier0 = 0, tier1 = 0, tier2 = 0, tier3 = 0;
  let pending = 0, needsAmendment = 0, approvedThisMonth = 0;

  for (const app of applications) {
    if (app.currentTier === 'tier_0_guest') tier0++;
    else if (app.currentTier === 'tier_1_identity') tier1++;
    else if (app.currentTier === 'tier_2_business') tier2++;
    else if (app.currentTier === 'tier_3_commercial') tier3++;

    if (app.status === 'in_review' || app.status === 'expert_assigned') pending++;
    if (app.status === 'needs_amendment') needsAmendment++;
    if (app.status === 'approved') approvedThisMonth++;
  }

  return {
    tier0Count: tier0,
    tier1Count: tier1,
    tier2Count: tier2,
    tier3Count: tier3,
    pendingReviewCount: pending,
    needsAmendmentCount: needsAmendment,
    approvedThisMonth,
    totalApplications: applications.length
  };
}

export function loadK02Store(): K02DataPayload {
  if (cachedK02Data) {
    return cachedK02Data;
  }

  try {
    if (fs.existsSync(K02_DATA_FILE)) {
      const content = fs.readFileSync(K02_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content) as K02DataPayload;
      // Recalculate stats dynamically
      parsed.tierStats = calculateTierStats(parsed.applications);
      parsed.tierConfigs = DEFAULT_TIER_CONFIGS;
      cachedK02Data = parsed;
      return cachedK02Data;
    }
  } catch (err) {
    console.error('[K02 Storage] Error loading K02 data store, rebuilding seed:', err);
  }

  const seedApps = getInitialSeedApplications();
  const entitlementsMap: Record<string, CommercialEntitlements> = {};
  seedApps.forEach(app => {
    entitlementsMap[app.targetId] = app.commercialEntitlements;
  });

  const initialPayload: K02DataPayload = {
    applications: seedApps,
    entitlements: entitlementsMap,
    tierStats: calculateTierStats(seedApps),
    tierConfigs: DEFAULT_TIER_CONFIGS
  };

  cachedK02Data = initialPayload;
  saveK02Store(initialPayload).catch(console.error);
  return initialPayload;
}

export async function saveK02Store(data: K02DataPayload): Promise<void> {
  cachedK02Data = data;
  data.tierStats = calculateTierStats(data.applications);

  if (isSavingK02) return;
  isSavingK02 = true;

  try {
    fs.writeFileSync(K02_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[K02 Storage] Error writing K02 store file:', err);
  } finally {
    isSavingK02 = false;
  }
}

/**
 * Register a new onboarding application
 */
export async function createOnboardingApplication(
  payload: Partial<OnboardingApplication>,
  actorName: string = 'مدیر پلتفرم'
): Promise<OnboardingApplication> {
  const store = loadK02Store();
  const now = new Date().toISOString();
  const appNumber = `APP-2026-${String(store.applications.length + 101).padStart(4, '0')}`;

  const requestedTier = payload.requestedTier || 'tier_2_business';
  const tierCfg = DEFAULT_TIER_CONFIGS[requestedTier];

  const defaultChecklist: OnboardingApplication['checklist'] = [
    { stepKey: 'basic_identity', labelFa: 'اطلاعات هویتی و ثبت شرکت/فروشگاه', labelEn: 'Basic Identity', completed: true, completedAt: now, completedBy: actorName, requiredForTier: 'tier_1_identity' },
    { stepKey: 'phone_verified', labelFa: 'راستی‌آزمایی خط تلفن ثابت و همراه', labelEn: 'Phone Verified', completed: true, completedAt: now, completedBy: actorName, requiredForTier: 'tier_1_identity' },
    { stepKey: 'guild_license', labelFa: 'استعلام پروانه کسب از اتحادیه طلا', labelEn: 'Guild License Verification', completed: false, requiredForTier: 'tier_2_business' },
    { stepKey: 'store_inspection', labelFa: 'ارزیابی فیزیکی فروشگاه و گاوصندوق', labelEn: 'Store Inspection', completed: false, requiredForTier: 'tier_2_business' },
    { stepKey: 'expert_call', labelFa: 'تماس کارشناسی با مدیر واحد صنفی', labelEn: 'Expert Call', completed: false, requiredForTier: 'tier_2_business' },
    { stepKey: 'agreement_accepted', labelFa: 'امضای تعهدنامه و قوانین تجاری دیدار', labelEn: 'Agreement Acceptance', completed: false, requiredForTier: 'tier_2_business' },
    { stepKey: 'financial_guarantee', labelFa: 'تودیع وثیقه و اعتبارسنجی تراز مالی', labelEn: 'Financial Guarantee', completed: false, requiredForTier: 'tier_3_commercial' }
  ];

  const initialEntitlements: CommercialEntitlements = {
    targetId: payload.targetId || `target-${Date.now()}`,
    targetType: payload.targetType || 'organization',
    targetName: payload.targetName || 'متقاضی نامشخص',
    tier: 'tier_0_guest',
    dailyGoldLimitGrams: 0,
    creditAllowanceGrams: 0,
    canAccessWholesaleMarket: false,
    canPlaceCustomOrders: false,
    canAccessConsignment: false,
    dealerMarginDiscountPercent: 0,
    isCommercialLocked: false
  };

  const newApp: OnboardingApplication = {
    id: `app-k02-${Date.now()}`,
    applicationNumber: appNumber,
    targetType: payload.targetType || 'organization',
    targetId: payload.targetId || `target-${Date.now()}`,
    targetName: payload.targetName || 'متقاضی جدید',
    targetTypeLabel: payload.targetTypeLabel || 'واحد صنفی',
    applicantPhone: payload.applicantPhone || '',
    province: payload.province || 'تهران',
    city: payload.city || 'تهران',
    currentTier: 'tier_0_guest',
    requestedTier,
    status: 'in_review',
    submissionDate: now,
    assignedReviewerId: 'party-admin-001',
    assignedReviewerName: actorName,
    riskScore: payload.riskScore !== undefined ? payload.riskScore : 25,
    checklist: defaultChecklist,
    verificationCalls: [],
    commercialEntitlements: initialEntitlements,
    updatedAt: now,
    version: 1
  };

  store.applications.unshift(newApp);
  store.entitlements[newApp.targetId] = initialEntitlements;

  // Log in central audit trail
  const k01Store = loadStore();
  k01Store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorId: 'party-admin-001',
    actorName,
    action: 'create',
    targetType: 'party',
    targetId: newApp.id,
    targetName: `${newApp.applicationNumber} (${newApp.targetName})`,
    description: `ایجاد پرونده پذیرش جدید ${newApp.applicationNumber} برای «${newApp.targetName}» با درخواست سطح «${requestedTier}»`,
    timestamp: now
  });
  await saveStore(k01Store);

  await saveK02Store(store);
  return newApp;
}

/**
 * Toggle or update checklist step in onboarding application
 */
export async function updateChecklistStep(
  appId: string,
  stepKey: ChecklistStepKey,
  completed: boolean,
  notes: string = '',
  actorName: string = 'کارشناس احراز'
): Promise<OnboardingApplication> {
  const store = loadK02Store();
  const app = store.applications.find(a => a.id === appId);
  if (!app) {
    throw new Error('پرونده پذیرش یافت نشد.');
  }

  const now = new Date().toISOString();
  const step = app.checklist.find(s => s.stepKey === stepKey);
  if (!step) {
    throw new Error('مرحله چک‌لیست معتبر نیست.');
  }

  step.completed = completed;
  step.completedAt = completed ? now : undefined;
  step.completedBy = completed ? actorName : undefined;
  if (notes) {
    step.notes = notes;
  }

  app.updatedAt = now;
  app.version += 1;

  await saveK02Store(store);
  return app;
}

/**
 * Record a verification phone call
 */
export async function logVerificationCall(
  appId: string,
  callLog: Partial<VerificationCallLog>,
  actorName: string = 'کارشناس احراز'
): Promise<OnboardingApplication> {
  const store = loadK02Store();
  const app = store.applications.find(a => a.id === appId);
  if (!app) {
    throw new Error('پرونده پذیرش یافت نشد.');
  }

  const now = new Date().toISOString();
  const newCall: VerificationCallLog = {
    calledAt: now,
    callerId: 'party-admin-001',
    callerName: actorName,
    contactNumber: callLog.contactNumber || app.applicantPhone,
    result: callLog.result || 'successful',
    notes: callLog.notes || 'تماس جهت استعلام و تطبیق مشخصات واحد صنفی انجام شد.'
  };

  app.verificationCalls.unshift(newCall);

  // Mark expert call step as completed if call was successful
  if (newCall.result === 'successful') {
    const expertStep = app.checklist.find(s => s.stepKey === 'expert_call');
    if (expertStep) {
      expertStep.completed = true;
      expertStep.completedAt = now;
      expertStep.completedBy = actorName;
      expertStep.notes = newCall.notes;
    }
  }

  app.updatedAt = now;
  app.version += 1;

  await saveK02Store(store);
  return app;
}

/**
 * Make onboarding decision: approve, reject, request amendment, or assign reviewer
 */
export async function makeOnboardingDecision(
  appId: string,
  decision: 'approve' | 'reject' | 'needs_amendment' | 'assign',
  details: {
    assignedTier?: TrustTier;
    dailyGoldLimitGrams?: number;
    creditAllowanceGrams?: number;
    canAccessWholesaleMarket?: boolean;
    canPlaceCustomOrders?: boolean;
    rejectionReason?: string;
    amendmentNotes?: string;
    reviewerName?: string;
    notes?: string;
  },
  actorName: string = 'مدیر ارشد پلتفرم'
): Promise<OnboardingApplication> {
  const store = loadK02Store();
  const app = store.applications.find(a => a.id === appId);
  if (!app) {
    throw new Error('پرونده پذیرش یافت نشد.');
  }

  const now = new Date().toISOString();

  if (decision === 'approve') {
    const tierToGrant: TrustTier = details.assignedTier || app.requestedTier;
    const tierCfg = DEFAULT_TIER_CONFIGS[tierToGrant];

    app.status = 'approved';
    app.currentTier = tierToGrant;
    app.reviewNotes = details.notes || `پرونده تایید شد و سطح اعتماد به ${tierCfg.titleFa} ارتقا یافت.`;

    // Grant Commercial Entitlements
    app.commercialEntitlements = {
      targetId: app.targetId,
      targetType: app.targetType,
      targetName: app.targetName,
      tier: tierToGrant,
      dailyGoldLimitGrams: details.dailyGoldLimitGrams !== undefined ? details.dailyGoldLimitGrams : tierCfg.maxDailyGoldGrams,
      creditAllowanceGrams: details.creditAllowanceGrams !== undefined ? details.creditAllowanceGrams : tierCfg.maxCreditAllowanceGrams,
      canAccessWholesaleMarket: details.canAccessWholesaleMarket !== undefined ? details.canAccessWholesaleMarket : (tierToGrant === 'tier_2_business' || tierToGrant === 'tier_3_commercial'),
      canPlaceCustomOrders: details.canPlaceCustomOrders !== undefined ? details.canPlaceCustomOrders : (tierToGrant === 'tier_3_commercial'),
      canAccessConsignment: tierToGrant === 'tier_3_commercial',
      dealerMarginDiscountPercent: tierToGrant === 'tier_3_commercial' ? 4.0 : tierToGrant === 'tier_2_business' ? 2.5 : 0,
      isCommercialLocked: false,
      lastTierUpgradedAt: now
    };

    store.entitlements[app.targetId] = app.commercialEntitlements;

    // Log in audit trail
    const k01Store = loadStore();
    k01Store.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actorId: 'party-admin-001',
      actorName,
      action: 'status_change',
      targetType: app.targetType,
      targetId: app.targetId,
      targetName: app.targetName,
      description: `تایید پرونده پذیرش ${app.applicationNumber} و ارتقای سطح اعتماد به «${tierCfg.titleFa}» با سقف خرید ${app.commercialEntitlements.dailyGoldLimitGrams} گرم و اعتبار ${app.commercialEntitlements.creditAllowanceGrams} گرم طلا`,
      timestamp: now
    });
    await saveStore(k01Store);
  } else if (decision === 'reject') {
    app.status = 'rejected';
    app.rejectionReason = details.rejectionReason || 'عدم احراز شرایط قانونی و صنفی پلتفرم طلا.';
  } else if (decision === 'needs_amendment') {
    app.status = 'needs_amendment';
    app.amendmentNotes = details.amendmentNotes || 'نقص در مدارک بارگذاری‌شده؛ نیاز به اصلاح و ارسال مجدد.';
  } else if (decision === 'assign') {
    app.status = 'expert_assigned';
    app.assignedReviewerName = details.reviewerName || actorName;
  }

  app.updatedAt = now;
  app.version += 1;

  await saveK02Store(store);
  return app;
}

/**
 * Update commercial entitlements & limits (daily grams, credit, lock/freeze)
 */
export async function updateCommercialEntitlements(
  targetId: string,
  updates: Partial<CommercialEntitlements>,
  actorName: string = 'مدیر ارشد معاملات طلا'
): Promise<CommercialEntitlements> {
  const store = loadK02Store();
  const ent = store.entitlements[targetId];
  if (!ent) {
    throw new Error('رکورد استحقاق‌های تجاری برای این موجودیت یافت نشد.');
  }

  const now = new Date().toISOString();

  if (updates.dailyGoldLimitGrams !== undefined) ent.dailyGoldLimitGrams = updates.dailyGoldLimitGrams;
  if (updates.creditAllowanceGrams !== undefined) ent.creditAllowanceGrams = updates.creditAllowanceGrams;
  if (updates.canAccessWholesaleMarket !== undefined) ent.canAccessWholesaleMarket = updates.canAccessWholesaleMarket;
  if (updates.canPlaceCustomOrders !== undefined) ent.canPlaceCustomOrders = updates.canPlaceCustomOrders;
  if (updates.canAccessConsignment !== undefined) ent.canAccessConsignment = updates.canAccessConsignment;
  if (updates.dealerMarginDiscountPercent !== undefined) ent.dealerMarginDiscountPercent = updates.dealerMarginDiscountPercent;

  if (updates.isCommercialLocked !== undefined) {
    ent.isCommercialLocked = updates.isCommercialLocked;
    if (updates.isCommercialLocked) {
      ent.lockReason = updates.lockReason || 'مسدودسازی دستی توسط مدیریت ریسک';
      ent.lockedAt = now;
      ent.lockedBy = actorName;
    } else {
      ent.lockReason = undefined;
      ent.lockedAt = undefined;
      ent.lockedBy = undefined;
    }
  }

  // Also sync back to application if exists
  const app = store.applications.find(a => a.targetId === targetId);
  if (app) {
    app.commercialEntitlements = { ...ent };
    app.updatedAt = now;
  }

  // Log in central audit trail
  const k01Store = loadStore();
  k01Store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorId: 'party-admin-001',
    actorName,
    action: 'update',
    targetType: ent.targetType,
    targetId: ent.targetId,
    targetName: ent.targetName,
    description: `به‌روزرسانی حدود تجاری طلا: سقف خرید ${ent.dailyGoldLimitGrams}g، اعتبار ${ent.creditAllowanceGrams}g، وضعیت قفل: ${ent.isCommercialLocked ? 'مسدود' : 'فعال'}`,
    timestamp: now
  });
  await saveStore(k01Store);

  await saveK02Store(store);
  return ent;
}
