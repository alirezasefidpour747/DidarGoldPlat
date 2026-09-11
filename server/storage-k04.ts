/**
 * Didar Gold Platform - Domain K04 Server Storage & Workflows
 * Approvals, Four-Eyes Principle (SoD), Commercial Exceptions & Immutable Cryptographic Audit Logs
 */

import crypto from 'crypto';
import {
  ApprovalRequest,
  CommercialException,
  AuditLogEntry,
  SodRule,
  K04DataPayload,
  ApprovalCategory,
  ApprovalUrgency
} from '../src/types/k04.js';

class K04StorageService {
  private approvalRequests: ApprovalRequest[] = [];
  private exceptions: CommercialException[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private sodRules: SodRule[] = [];
  private fourEyesViolationsBlocked = 7; // Tracked security metric
  private genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor() {
    this.seedInitialData();
  }

  /**
   * Cryptographic Hash calculation for Immutable Audit Trail
   */
  private calculateHash(
    sequenceNumber: number,
    timestamp: string,
    actorId: string,
    actionCode: string,
    targetId: string,
    previousHash: string,
    details: Record<string, unknown>
  ): string {
    const raw = `${sequenceNumber}|${timestamp}|${actorId}|${actionCode}|${targetId}|${previousHash}|${JSON.stringify(details)}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Append an entry to the immutable cryptographic audit log chain
   */
  public logAudit(params: {
    actorId: string;
    actorName: string;
    actorRoleFa: string;
    ipAddress?: string;
    domainCode: string;
    actionCode: string;
    actionTitleFa: string;
    targetEntity: string;
    targetId: string;
    severity: 'info' | 'warning' | 'security' | 'critical';
    details: Record<string, unknown>;
  }): AuditLogEntry {
    const sequenceNumber = this.auditLogs.length + 1;
    const timestamp = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });
    const previousHash =
      this.auditLogs.length > 0
        ? this.auditLogs[this.auditLogs.length - 1].entryHash
        : this.genesisHash;

    const entryHash = this.calculateHash(
      sequenceNumber,
      timestamp,
      params.actorId,
      params.actionCode,
      params.targetId,
      previousHash,
      params.details
    );

    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${sequenceNumber}`,
      sequenceNumber,
      timestamp,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRoleFa: params.actorRoleFa,
      ipAddress: params.ipAddress || '192.168.1.45',
      domainCode: params.domainCode,
      actionCode: params.actionCode,
      actionTitleFa: params.actionTitleFa,
      targetEntity: params.targetEntity,
      targetId: params.targetId,
      severity: params.severity,
      details: params.details,
      previousHash,
      entryHash
    };

    this.auditLogs.push(entry);
    return entry;
  }

  /**
   * Seed authentic Iranian gold market approval & audit data
   */
  private seedInitialData() {
    // 1. SoD Rules
    this.sodRules = [
      {
        id: 'sod-01',
        titleFa: 'ترخیص فیزیکی شمش و مسکوکات از خزانه مرکزی',
        descriptionFa: 'الزام اصل چهارچشم؛ ثبت توسط متصدی خزانه و تأیید نهایی منحصراً توسط مدیر ارشد سامانه یا مدیر خزانه‌داری.',
        category: 'physical_gold_release',
        thresholdGrams: 100, // بالای ۱۰۰ گرم نیازمند دو تاییدکننده مستقل است
        thresholdValueIrr: 4500000000,
        requiredApproverCount: 2,
        initiatorForbiddenRoles: ['customer', 'trader'],
        approverAllowedRoles: ['treasury_officer', 'super_admin'],
        strictFourEyes: true,
        autoExpireHours: 24,
        violationsBlockedCount: 5
      },
      {
        id: 'sod-02',
        titleFa: 'تخصیص سقف اعتبار تجاری و تسویه دفتری بنکداران',
        descriptionFa: 'بررسی مدارک وثیقه طلا و شمش امانی؛ تایید مرحله اول توسط کارشناس ریسک و مرحله دوم توسط سرپرست اعتبارات.',
        category: 'credit_limit_exception',
        thresholdGrams: 500,
        thresholdValueIrr: 15000000000,
        requiredApproverCount: 2,
        initiatorForbiddenRoles: ['customer', 'dealer_operator'],
        approverAllowedRoles: ['risk_manager', 'super_admin'],
        strictFourEyes: true,
        autoExpireHours: 48,
        violationsBlockedCount: 3
      },
      {
        id: 'sod-03',
        titleFa: 'تخفیف استثنایی اجرت ساخت سفارش‌های عمده کارگاهی',
        descriptionFa: 'تخفیف بیش از ۲۰ درصد در اجرت ساخت النگو و النگو فنری؛ نیازمند تایید ناظر بازرگانی و تاییدیه متصدی حسابداری.',
        category: 'wage_discount_exception',
        thresholdGrams: 250,
        thresholdValueIrr: 500000000,
        requiredApproverCount: 1,
        initiatorForbiddenRoles: ['customer'],
        approverAllowedRoles: ['treasury_officer', 'super_admin'],
        strictFourEyes: true,
        autoExpireHours: 72,
        violationsBlockedCount: 2
      },
      {
        id: 'sod-04',
        titleFa: 'تطبیق استثنایی و تسویه دستی اسناد حواله بانکی',
        descriptionFa: 'تأیید فیش‌های بین‌بانکی پایا/ساتنا با مغایرت نام یا خارج از سیستم خودکار؛ نیازمند تطبیق توسط امور مالی و خزانه‌دار.',
        category: 'unverified_settlement_override',
        thresholdGrams: 0,
        thresholdValueIrr: 1000000000,
        requiredApproverCount: 2,
        initiatorForbiddenRoles: ['trader', 'customer'],
        approverAllowedRoles: ['risk_manager', 'super_admin'],
        strictFourEyes: true,
        autoExpireHours: 12,
        violationsBlockedCount: 4
      }
    ];

    // 2. Approval Requests
    this.approvalRequests = [
      {
        id: 'apr-001',
        requestCode: 'APR-1403-0901',
        category: 'physical_gold_release',
        categoryTitleFa: 'ترخیص فیزیکی شمش طلا از خزانه',
        title: 'خروج ۱,۲۵۰ گرم شمش طلا ۹۹۵ سوئیسی (پمپی)',
        description: 'تحویل فیزیکی به شرکت بازرگانی زرمهر اصفهان بابت تسویه قرارداد شماره T-881 با تاییدیه وثیقه مسکوکات.',
        urgency: 'critical',
        status: 'pending_second_approval',
        goldWeightGrams: 1250,
        goldPurityCarat: 995,
        financialValueIrr: 56250000000,
        partyId: 'pty-101',
        partyNameFa: 'بازرگانی طلای زرمهر اصفهان',
        initiatorId: 'usr-002',
        initiatorName: 'مهرداد خزایی',
        initiatorRoleFa: 'متصدی ارشد خزانه‌داری',
        createdAt: '1403/05/23 - 09:15',
        expiresAt: '1403/05/24 - 09:15',
        currentStepNumber: 2,
        totalSteps: 2,
        steps: [
          {
            stepNumber: 1,
            titleFa: 'بررسی فیزیکی، وزن‌سنجی دیجیتال و هولوگرام شمش',
            requiredRole: 'treasury_officer',
            status: 'approved',
            actorId: 'usr-002',
            actorName: 'مهرداد خزایی',
            actorRoleFa: 'متصدی ارشد خزانه‌داری',
            actedAt: '1403/05/23 - 09:40',
            notes: 'بارکد و هولوگرام آزمون‌کده مرکزی و عیار ۹۹۵ روی ۳ قطعه شمش بازبینی شد و با باسکول کالیبره تطبیق یافت.',
            digitalSignature: 'SIG-SHA256-e91b8fa82b405f63d03822'
          },
          {
            stepNumber: 2,
            titleFa: 'تأیید چهارچشم (Four-Eyes) و مجوز خروج امنیتی درب خزانه',
            requiredRole: 'super_admin',
            status: 'pending'
          }
        ]
      },
      {
        id: 'apr-002',
        requestCode: 'APR-1403-0902',
        category: 'credit_limit_exception',
        categoryTitleFa: 'افزایش استثنایی سقف اعتبار تجاری',
        title: 'افزایش سقف حساب دفتری بنکداری شمس به ۲۰ میلیارد ریال',
        description: 'تقاضای افزایش اعتبار به دلیل حجم بالای سفارش‌های شمش در نوسان بازار طلا؛ تضمین‌شده با ضمانت‌نامه ملکی صنف.',
        urgency: 'high',
        status: 'pending_first_approval',
        goldWeightGrams: 400,
        financialValueIrr: 20000000000,
        partyId: 'pty-102',
        partyNameFa: 'بنکداری طلای شمس تهران',
        initiatorId: 'usr-003',
        initiatorName: 'کامران درخشان',
        initiatorRoleFa: 'بنکدار و بازرگان طلا',
        createdAt: '1403/05/23 - 10:30',
        expiresAt: '1403/05/25 - 10:30',
        currentStepNumber: 1,
        totalSteps: 2,
        steps: [
          {
            stepNumber: 1,
            titleFa: 'ارزیابی ریسک اعتباری و نسبت بدهی جاری',
            requiredRole: 'risk_manager',
            status: 'pending'
          },
          {
            stepNumber: 2,
            titleFa: 'تصویب نهایی سقف اعتبار دفتری',
            requiredRole: 'super_admin',
            status: 'pending'
          }
        ]
      },
      {
        id: 'apr-003',
        requestCode: 'APR-1403-0903',
        category: 'unverified_settlement_override',
        categoryTitleFa: 'تطبیق استثنایی سند بانکی',
        title: 'تسویه دستی فیش ساتنا به مبلغ ۳,۴۵۰,۰۰۰,۰۰۰ ریال',
        description: 'مغایرت کد شبای واریزکننده به دلیل پرداخت از حساب حقوقی شرکت تابعه؛ مستندات ضمیمه شد.',
        urgency: 'normal',
        status: 'approved',
        goldWeightGrams: 76.6,
        financialValueIrr: 3450000000,
        partyId: 'pty-105',
        partyNameFa: 'کارگاه زرگری نگین البرز',
        initiatorId: 'usr-005',
        initiatorName: 'سهراب زرین‌قلم',
        initiatorRoleFa: 'معامله‌گر و کارگاه‌دار طلا',
        createdAt: '1403/05/22 - 14:00',
        expiresAt: '1403/05/23 - 14:00',
        currentStepNumber: 2,
        totalSteps: 2,
        resolutionNotes: 'رسید ساتنا از درگاه بانک مرکزی استعلام و صحت واریز به حساب خزانه دیدار احراز گردید.',
        steps: [
          {
            stepNumber: 1,
            titleFa: 'بررسی مستندات تراکنش و استعلام کد رهگیری بانکی',
            requiredRole: 'risk_manager',
            status: 'approved',
            actorId: 'usr-004',
            actorName: 'سارا معتمدی',
            actorRoleFa: 'کارشناس انطباق و ریسک',
            actedAt: '1403/05/22 - 15:10',
            notes: 'رسید پرداخت ساتنا با صورتحساب بانک پارسیان خزانه تطبیق کامل دارد.',
            digitalSignature: 'SIG-SHA256-4b901a1c43ef19d27198'
          },
          {
            stepNumber: 2,
            titleFa: 'اعمال دستی در دفتر کل حسابرسی و شارژ اعتبار طلا',
            requiredRole: 'super_admin',
            status: 'approved',
            actorId: 'usr-001',
            actorName: 'امیرحسین رضایی',
            actorRoleFa: 'مدیر ارشد سامانه و امنیت',
            actedAt: '1403/05/22 - 16:30',
            notes: 'تأیید شد. معادل ۷۶.۶ گرم طلای خام به کاردکس کارگاه افزوده شد.',
            digitalSignature: 'SIG-SHA256-a189fec813b6528d904b'
          }
        ]
      },
      {
        id: 'apr-004',
        requestCode: 'APR-1403-0904',
        category: 'wage_discount_exception',
        categoryTitleFa: 'تخفیف استثنایی اجرت ساخت',
        title: 'تخفیف ۳۵٪ اجرت ساخت برای تولید ۱۰ کیلوگرم النگو',
        description: 'سفارش انبوه النگو فنری طرح خلیجی با اجرت ۳.۵٪ به جای ۵.۵٪ جهت صادرات و توزیع در استان‌های جنوبی.',
        urgency: 'high',
        status: 'pending_first_approval',
        goldWeightGrams: 10000,
        financialValueIrr: 900000000,
        partyId: 'pty-103',
        partyNameFa: 'کارگاه النگوسازی زرین‌ساز یزد',
        initiatorId: 'usr-002',
        initiatorName: 'مهرداد خزایی',
        initiatorRoleFa: 'متصدی ارشد خزانه‌داری',
        createdAt: '1403/05/23 - 11:20',
        expiresAt: '1403/05/26 - 11:20',
        currentStepNumber: 1,
        totalSteps: 1,
        steps: [
          {
            stepNumber: 1,
            titleFa: 'تأیید نرخ تخفیف اجرت و تعهد حجم بازرگانی',
            requiredRole: 'super_admin',
            status: 'pending'
          }
        ]
      }
    ];

    // 3. Commercial Exceptions
    this.exceptions = [
      {
        id: 'exc-001',
        exceptionCode: 'EXC-1403-001',
        titleFa: 'مجوز ترخیص فوری شمش طلا قبل از تسویه پایا',
        descriptionFa: 'تحویل ۳۰۰ گرم شمش به بنکداری کیمیا با وثیقه سفته معتبر به علت بسته بودن ساعت پایا بانک مرکزی.',
        category: 'physical_gold_release',
        partyNameFa: 'بنکداری طلای کیمیا',
        goldWeightGrams: 300,
        financialImpactIrr: 13500000000,
        riskLevel: 'medium',
        status: 'active',
        grantedBy: 'امیرحسین رضایی (مدیر ارشد سامانه)',
        grantedAt: '1403/05/23 - 08:30',
        validUntil: '1403/05/24 - 14:00',
        conditions: [
          'تودیع سفته معتبر به ارزش ۱.۵ برابر قیمت روز طلا',
          'الزام واریز پایا قبل از ساعت ۱۰:۰۰ صبح فردا',
          'ممنوعیت سفارش‌های فیزیکی جدید تا تسویه کامل'
        ],
        referenceApprovalId: 'apr-001'
      },
      {
        id: 'exc-002',
        exceptionCode: 'EXC-1403-002',
        titleFa: 'مجوز مانده منفی موقت کاردکس طلا تا ۲۰۰ گرم',
        descriptionFa: 'اجازه کسر موجودی طلا در فرایند ساخت زنجیر کارگاهی تا موعد تحویل شمش خام در پایان هفته.',
        category: 'credit_limit_exception',
        partyNameFa: 'کارگاه زرگری نگین البرز',
        goldWeightGrams: 200,
        financialImpactIrr: 9000000000,
        riskLevel: 'low',
        status: 'active',
        grantedBy: 'مهرداد خزایی (خزانه‌دار ارشد)',
        grantedAt: '1403/05/21 - 10:00',
        validUntil: '1403/05/27 - 18:00',
        conditions: [
          'تسلیم صورت‌جلسه کسر عیار کارگاهی',
          'تکمیل سفارش و ارجاع مصنوعات تا پایان هفته'
        ]
      },
      {
        id: 'exc-003',
        exceptionCode: 'EXC-1403-003',
        titleFa: 'استثنای کارمزد صفر پلتفرم برای معاملات شمش بالای ۱ کیلوگرم',
        descriptionFa: 'معافیت کارمزد تراکنش جهت توسعه حجم معاملات عمده بنکداران فعال در سامانه دیدار.',
        category: 'wage_discount_exception',
        partyNameFa: 'اتحادیه و بازرگانان منتخب بازار تهران',
        goldWeightGrams: 1000,
        financialImpactIrr: 150000000,
        riskLevel: 'low',
        status: 'active',
        grantedBy: 'امیرحسین رضایی (مدیر ارشد سامانه)',
        grantedAt: '1403/05/01 - 09:00',
        validUntil: '1403/06/01 - 23:59',
        conditions: [
          'فقط معاملات شمش با خلوص حداقل ۹۹۵',
          'حداقل حجم ماهانه ۵ کیلوگرم شمش'
        ]
      }
    ];

    // 4. Initial Immutable Audit Chain (Sha-256 blocks)
    this.logAudit({
      actorId: 'system',
      actorName: 'پلتفرم هسته دیدار',
      actorRoleFa: 'سیستم خودکار امنیتی',
      domainCode: 'K04',
      actionCode: 'GENESIS_INITIALIZED',
      actionTitleFa: 'ایجاد بلوک پیدایش (Genesis Block) دفتر کل حسابرسی',
      targetEntity: 'audit_ledger',
      targetId: 'genesis',
      severity: 'info',
      details: { version: '1.0.0', algorithm: 'SHA-256', chainType: 'immutable-append-only' }
    });

    this.logAudit({
      actorId: 'usr-001',
      actorName: 'امیرحسین رضایی',
      actorRoleFa: 'مدیر ارشد سامانه و امنیت',
      domainCode: 'K03',
      actionCode: 'MFA_POLICY_ENFORCED',
      actionTitleFa: 'اعمال اجباری سیاست احراز هویت دوعاملی برای خزانه‌داری',
      targetEntity: 'policy_rule',
      targetId: 'pol-01',
      severity: 'security',
      details: { requiredMethod: 'security_key', enforcedRoles: ['treasury_officer', 'super_admin'] }
    });

    this.logAudit({
      actorId: 'usr-002',
      actorName: 'مهرداد خزایی',
      actorRoleFa: 'متصدی ارشد خزانه‌داری',
      domainCode: 'K04',
      actionCode: 'APPROVAL_INITIATED',
      actionTitleFa: 'ثبت درخواست ترخیص ۱,۲۵۰ گرم شمش سوئیسی',
      targetEntity: 'approval_request',
      targetId: 'apr-001',
      severity: 'critical',
      details: { weightGrams: 1250, valueIrr: 56250000000, recipient: 'بازرگانی طلای زرمهر اصفهان' }
    });

    this.logAudit({
      actorId: 'usr-002',
      actorName: 'مهرداد خزایی',
      actorRoleFa: 'متصدی ارشد خزانه‌داری',
      domainCode: 'K04',
      actionCode: 'STEP_APPROVED',
      actionTitleFa: 'تایید مرحله ۱ ترخیص شمش (کنترل فیزیکی و باسکول دیجیتال)',
      targetEntity: 'approval_request',
      targetId: 'apr-001',
      severity: 'security',
      details: { stepNumber: 1, signature: 'SIG-SHA256-e91b8fa82b405f63d03822' }
    });

    this.logAudit({
      actorId: 'system',
      actorName: 'پایشگر امنیت اصل چهارچشم (SoD Monitor)',
      actorRoleFa: 'نگهبان هسته',
      domainCode: 'K04',
      actionCode: 'SOD_ATTEMPT_BLOCKED',
      actionTitleFa: 'مسدودسازی تلاش برای تأیید درخواست توسط ثبت‌کننده (نقض SoD)',
      targetEntity: 'approval_request',
      targetId: 'apr-001',
      severity: 'warning',
      details: {
        actorId: 'usr-002',
        attemptedStep: 2,
        reason: 'ثبت‌کننده درخواست نمی‌تواند تاییدکننده نهایی همان درخواست باشد.'
      }
    });

    this.logAudit({
      actorId: 'usr-001',
      actorName: 'امیرحسین رضایی',
      actorRoleFa: 'مدیر ارشد سامانه و امنیت',
      domainCode: 'K04',
      actionCode: 'EXCEPTION_GRANTED',
      actionTitleFa: 'صدور استثنای تجاری تحویل شمش طلا قبل از پایا',
      targetEntity: 'commercial_exception',
      targetId: 'exc-001',
      severity: 'critical',
      details: { exceptionCode: 'EXC-1403-001', party: 'بنکداری طلای کیمیا', weightGrams: 300 }
    });
  }

  /**
   * Verify the entire cryptographic integrity of the audit chain
   */
  public verifyChainIntegrity(): {
    isValid: boolean;
    verifiedBlocksCount: number;
    lastCheckedAt: string;
    genesisHash: string;
    latestHash: string;
    brokenBlockIndex?: number;
  } {
    const lastCheckedAt = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });
    if (this.auditLogs.length === 0) {
      return {
        isValid: true,
        verifiedBlocksCount: 0,
        lastCheckedAt,
        genesisHash: this.genesisHash,
        latestHash: this.genesisHash
      };
    }

    for (let i = 0; i < this.auditLogs.length; i++) {
      const current = this.auditLogs[i];
      const expectedPrevHash = i === 0 ? this.genesisHash : this.auditLogs[i - 1].entryHash;

      // 1. Check Previous Hash Link
      if (current.previousHash !== expectedPrevHash) {
        return {
          isValid: false,
          verifiedBlocksCount: i,
          lastCheckedAt,
          genesisHash: this.genesisHash,
          latestHash: current.entryHash,
          brokenBlockIndex: i + 1
        };
      }

      // 2. Check Cryptographic Digest Recalculation
      const recalculated = this.calculateHash(
        current.sequenceNumber,
        current.timestamp,
        current.actorId,
        current.actionCode,
        current.targetId,
        current.previousHash,
        current.details
      );

      if (recalculated !== current.entryHash) {
        return {
          isValid: false,
          verifiedBlocksCount: i,
          lastCheckedAt,
          genesisHash: this.genesisHash,
          latestHash: current.entryHash,
          brokenBlockIndex: i + 1
        };
      }
    }

    return {
      isValid: true,
      verifiedBlocksCount: this.auditLogs.length,
      lastCheckedAt,
      genesisHash: this.genesisHash,
      latestHash: this.auditLogs[this.auditLogs.length - 1].entryHash
    };
  }

  /**
   * Get K04 Data Payload
   */
  public getK04Data(): K04DataPayload {
    const chainIntegrity = this.verifyChainIntegrity();

    const pendingApprovalsCount = this.approvalRequests.filter(
      r => r.status === 'pending_first_approval' || r.status === 'pending_second_approval'
    ).length;

    const activeExceptionsCount = this.exceptions.filter(e => e.status === 'active').length;

    const totalGoldUnderReviewGrams = this.approvalRequests
      .filter(r => r.status === 'pending_first_approval' || r.status === 'pending_second_approval')
      .reduce((sum, r) => sum + (r.goldWeightGrams || 0), 0);

    const totalFinancialValueIrr = this.approvalRequests
      .filter(r => r.status === 'pending_first_approval' || r.status === 'pending_second_approval')
      .reduce((sum, r) => sum + (r.financialValueIrr || 0), 0);

    return {
      approvalRequests: [...this.approvalRequests],
      exceptions: [...this.exceptions],
      auditLogs: [...this.auditLogs].reverse(), // Latest first for UI
      sodRules: [...this.sodRules],
      chainIntegrity,
      metrics: {
        pendingApprovalsCount,
        activeExceptionsCount,
        todayAuditCount: this.auditLogs.length,
        fourEyesViolationsBlocked: this.fourEyesViolationsBlocked,
        totalGoldUnderReviewGrams,
        totalFinancialValueIrr
      }
    };
  }

  /**
   * Submit a new Approval Request (Maker stage)
   */
  public createApprovalRequest(params: {
    category: ApprovalCategory;
    title: string;
    description: string;
    urgency: ApprovalUrgency;
    goldWeightGrams?: number;
    goldPurityCarat?: number;
    financialValueIrr?: number;
    partyNameFa?: string;
    initiatorId: string;
    initiatorName: string;
    initiatorRoleFa: string;
  }): ApprovalRequest {
    const rule = this.sodRules.find(r => r.category === params.category);
    const requiredSteps = rule ? rule.requiredApproverCount : 2;
    const now = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });

    const requestIndex = this.approvalRequests.length + 1;
    const requestCode = `APR-1403-0${900 + requestIndex}`;

    const steps = [];
    if (requiredSteps === 1) {
      steps.push({
        stepNumber: 1,
        titleFa: 'تأیید صلاحیت و اعتبارسنجی عملیاتی',
        requiredRole: 'super_admin' as const,
        status: 'pending' as const
      });
    } else {
      steps.push(
        {
          stepNumber: 1,
          titleFa: 'بررسی کارشناسی اولیه و اعتبارسنجی مستندات',
          requiredRole: params.category === 'physical_gold_release' ? ('treasury_officer' as const) : ('risk_manager' as const),
          status: 'pending' as const
        },
        {
          stepNumber: 2,
          titleFa: 'تأیید چهارچشم (Four-Eyes Gate) و صدور مجوز خزانه‌داری',
          requiredRole: 'super_admin' as const,
          status: 'pending' as const
        }
      );
    }

    const newRequest: ApprovalRequest = {
      id: `apr-${Date.now()}`,
      requestCode,
      category: params.category,
      categoryTitleFa:
        params.category === 'physical_gold_release'
          ? 'ترخیص فیزیکی شمش طلا از خزانه'
          : params.category === 'credit_limit_exception'
          ? 'افزایش استثنایی سقف اعتبار تجاری'
          : params.category === 'wage_discount_exception'
          ? 'تخفیف استثنایی اجرت ساخت'
          : params.category === 'unverified_settlement_override'
          ? 'تطبیق استثنایی سند بانکی'
          : 'ارتقای استثنایی سطح رتبه اعتماد',
      title: params.title,
      description: params.description,
      urgency: params.urgency,
      status: 'pending_first_approval',
      goldWeightGrams: params.goldWeightGrams || 0,
      goldPurityCarat: params.goldPurityCarat || 750,
      financialValueIrr: params.financialValueIrr || 0,
      partyNameFa: params.partyNameFa || 'بنکدار متقاضی در پلتفرم',
      initiatorId: params.initiatorId,
      initiatorName: params.initiatorName,
      initiatorRoleFa: params.initiatorRoleFa,
      createdAt: now,
      expiresAt: '1403/05/26 - 12:00',
      currentStepNumber: 1,
      totalSteps: steps.length,
      steps
    };

    this.approvalRequests.unshift(newRequest);

    this.logAudit({
      actorId: params.initiatorId,
      actorName: params.initiatorName,
      actorRoleFa: params.initiatorRoleFa,
      domainCode: 'K04',
      actionCode: 'REQUEST_SUBMITTED',
      actionTitleFa: `ثبت درخواست تأیید جدید (${requestCode})`,
      targetEntity: 'approval_request',
      targetId: newRequest.id,
      severity: params.urgency === 'critical' ? 'critical' : 'warning',
      details: {
        requestCode,
        category: params.category,
        goldWeightGrams: params.goldWeightGrams,
        financialValueIrr: params.financialValueIrr
      }
    });

    return newRequest;
  }

  /**
   * Approve a step (Checker stage with strict Four-Eyes enforcement)
   */
  public approveStep(params: {
    requestId: string;
    stepNumber: number;
    actorId: string;
    actorName: string;
    actorRoleFa: string;
    notes?: string;
  }): { success: boolean; message: string; request?: ApprovalRequest } {
    const req = this.approvalRequests.find(r => r.id === params.requestId);
    if (!req) {
      return { success: false, message: 'درخواست تأیید با شناسه موردنظر یافت نشد.' };
    }

    if (req.status === 'approved' || req.status === 'rejected' || req.status === 'cancelled') {
      return { success: false, message: 'این درخواست در وضعیت نهایی است و امکان بررسی مجدد ندارد.' };
    }

    // STRICT FOUR-EYES PRINCIPLE: Initiator CANNOT approve their own request!
    if (req.initiatorId === params.actorId) {
      this.fourEyesViolationsBlocked++;
      this.logAudit({
        actorId: params.actorId,
        actorName: params.actorName,
        actorRoleFa: params.actorRoleFa,
        domainCode: 'K04',
        actionCode: 'FOUR_EYES_VIOLATION_BLOCKED',
        actionTitleFa: 'جلوگیری خودکار از نقض اصل تفکیک وظایف (SoD Four-Eyes)',
        targetEntity: 'approval_request',
        targetId: req.id,
        severity: 'critical',
        details: {
          initiatorId: req.initiatorId,
          attemptedActorId: params.actorId,
          stepNumber: params.stepNumber,
          rule: 'ثبت‌کننده درخواست اجازه تصویب همان درخواست را به عنوان ناظر ندارد.'
        }
      });
      return {
        success: false,
        message: 'خطای تفکیک وظایف (SoD): شما ثبت‌کننده این درخواست هستید و طبق اصل چهارچشم مجاز به تأیید آن نمی‌باشید.'
      };
    }

    const step = req.steps.find(s => s.stepNumber === params.stepNumber);
    if (!step) {
      return { success: false, message: 'مرحله تأیید موردنظر تعریف نشده است.' };
    }

    const now = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });
    const digitalSignature = `SIG-SHA256-${crypto.randomBytes(10).toString('hex')}`;

    step.status = 'approved';
    step.actorId = params.actorId;
    step.actorName = params.actorName;
    step.actorRoleFa = params.actorRoleFa;
    step.actedAt = now;
    step.notes = params.notes || 'مورد تأیید و انطباق کامل قرار گرفت.';
    step.digitalSignature = digitalSignature;

    if (req.currentStepNumber < req.totalSteps) {
      req.currentStepNumber += 1;
      req.status = 'pending_second_approval';
    } else {
      req.status = 'approved';
      req.resolutionNotes = `درخواست با موفقیت توسط کلیه ناظران تصویب گردید. امضای نهایی: ${digitalSignature}`;
    }

    this.logAudit({
      actorId: params.actorId,
      actorName: params.actorName,
      actorRoleFa: params.actorRoleFa,
      domainCode: 'K04',
      actionCode: req.status === 'approved' ? 'APPROVAL_FINALIZED' : 'STEP_APPROVED',
      actionTitleFa:
        req.status === 'approved'
          ? `تصویب نهایی درخواست (${req.requestCode})`
          : `تایید مرحله ${params.stepNumber} درخواست (${req.requestCode})`,
      targetEntity: 'approval_request',
      targetId: req.id,
      severity: req.status === 'approved' ? 'critical' : 'security',
      details: {
        stepNumber: params.stepNumber,
        newStatus: req.status,
        digitalSignature,
        notes: step.notes
      }
    });

    return {
      success: true,
      message:
        req.status === 'approved'
          ? `درخواست ${req.requestCode} با موفقیت در کلیه مراحل تصویب شد و مجوز رسمی صادر گردید.`
          : `مرحله ${params.stepNumber} با امضای دیجیتال تأیید شد و جهت مرحله دوم به کارتابل ناظر ارشد ارجاع یافت.`,
      request: req
    };
  }

  /**
   * Reject a request
   */
  public rejectRequest(params: {
    requestId: string;
    stepNumber: number;
    actorId: string;
    actorName: string;
    actorRoleFa: string;
    reason: string;
  }): { success: boolean; message: string; request?: ApprovalRequest } {
    const req = this.approvalRequests.find(r => r.id === params.requestId);
    if (!req) {
      return { success: false, message: 'درخواست موردنظر یافت نشد.' };
    }

    const step = req.steps.find(s => s.stepNumber === params.stepNumber);
    if (step) {
      step.status = 'rejected';
      step.actorId = params.actorId;
      step.actorName = params.actorName;
      step.actorRoleFa = params.actorRoleFa;
      step.notes = params.reason;
    }

    req.status = 'rejected';
    req.resolutionNotes = `درخواست به علت عدم انطباق رد شد: ${params.reason}`;

    this.logAudit({
      actorId: params.actorId,
      actorName: params.actorName,
      actorRoleFa: params.actorRoleFa,
      domainCode: 'K04',
      actionCode: 'REQUEST_REJECTED',
      actionTitleFa: `رد درخواست تأیید (${req.requestCode})`,
      targetEntity: 'approval_request',
      targetId: req.id,
      severity: 'warning',
      details: {
        stepNumber: params.stepNumber,
        reason: params.reason
      }
    });

    return {
      success: true,
      message: `درخواست ${req.requestCode} با درج دلیل عدم انطباق رد شد.`,
      request: req
    };
  }

  /**
   * Revoke an active exception waiver
   */
  public revokeException(
    exceptionId: string,
    actorId: string,
    actorName: string,
    actorRoleFa: string,
    reason: string
  ): { success: boolean; message: string } {
    const exc = this.exceptions.find(e => e.id === exceptionId);
    if (!exc) {
      return { success: false, message: 'استثنای تجاری موردنظر یافت نشد.' };
    }

    exc.status = 'revoked';

    this.logAudit({
      actorId,
      actorName,
      actorRoleFa,
      domainCode: 'K04',
      actionCode: 'EXCEPTION_REVOKED',
      actionTitleFa: `لغو پیش از موعد استثنای تجاری (${exc.exceptionCode})`,
      targetEntity: 'commercial_exception',
      targetId: exc.id,
      severity: 'warning',
      details: { reason, partyName: exc.partyNameFa }
    });

    return { success: true, message: `استثنای تجاری ${exc.exceptionCode} با موفقیت لغو و ابطال گردید.` };
  }

  /**
   * Create a new commercial exception
   */
  public createException(params: {
    titleFa: string;
    descriptionFa: string;
    category: ApprovalCategory;
    partyNameFa: string;
    goldWeightGrams: number;
    financialImpactIrr: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    conditions: string[];
    actorName: string;
  }): CommercialException {
    const now = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });
    const count = this.exceptions.length + 1;
    const exceptionCode = `EXC-1403-00${count}`;

    const newExc: CommercialException = {
      id: `exc-${Date.now()}`,
      exceptionCode,
      titleFa: params.titleFa,
      descriptionFa: params.descriptionFa,
      category: params.category,
      partyNameFa: params.partyNameFa,
      goldWeightGrams: params.goldWeightGrams,
      financialImpactIrr: params.financialImpactIrr,
      riskLevel: params.riskLevel,
      status: 'active',
      grantedBy: params.actorName,
      grantedAt: now,
      validUntil: '1403/05/30 - 23:59',
      conditions: params.conditions
    };

    this.exceptions.unshift(newExc);

    this.logAudit({
      actorId: 'usr-001',
      actorName: params.actorName,
      actorRoleFa: 'مدیر ارشد سامانه',
      domainCode: 'K04',
      actionCode: 'EXCEPTION_GRANTED',
      actionTitleFa: `اعطای استثنای تجاری و مجوز موقت (${exceptionCode})`,
      targetEntity: 'commercial_exception',
      targetId: newExc.id,
      severity: 'critical',
      details: {
        exceptionCode,
        party: params.partyNameFa,
        goldWeightGrams: params.goldWeightGrams,
        riskLevel: params.riskLevel
      }
    });

    return newExc;
  }
}

export const k04Storage = new K04StorageService();
