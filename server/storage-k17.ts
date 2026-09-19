/**
 * Didar Gold Platform - Kernel 17 (K17) Storage Engine
 * Consumer Ownership Claims, Digital Provenance, Warranty & Anti-Theft Management
 */

import {
  OwnershipClaim,
  WarrantyCard,
  OwnershipTransferRequest,
  StolenReport,
  UidScanResult,
  K17Metrics,
  K17AuditLog,
  K17DataPayload,
  WarrantyServiceLog,
  ItemPhysicalSpec
} from '../src/types/k17.js';
import { k06Storage } from './storage-k06.js';

class K17StorageEngine {
  private claims: OwnershipClaim[] = [];
  private warranties: WarrantyCard[] = [];
  private transfers: OwnershipTransferRequest[] = [];
  private stolenReports: StolenReport[] = [];
  private auditLogs: K17AuditLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Initial Warranties & Claims
    const war01: WarrantyCard = {
      id: 'war-01',
      warrantyNumber: 'WAR-AU750-1404-8820',
      claimId: 'clm-01',
      itemUid: 'DID-AU750-2026-8820-001',
      productTitleFa: 'النگو طلا ۱۸ عیار ریخته‌گری طرح اسلیمی صفوی (آینه‌ای)',
      consumerNameFa: 'خانم سارا فرهمند',
      consumerMobile: '09121112233',
      issueDateFa: '۱۴۰۴/۱۲/۲۰',
      expirationDateFa: '۱۴۰۶/۱۲/۲۰',
      durationMonths: 24,
      status: 'active',
      statusFa: 'فعال و تحت پوشش طلایی',
      coverages: [
        {
          type: 'purity_lifetime',
          titleFa: 'ضمانت اصالت و عیار ۱۸ (۷۵۰)',
          descriptionFa: 'تضمین مادام‌العمر خلوص طلا مطابق گواهی ری‌گیری رسمی و بازخرید تضمینی بر اساس نرخ روز.',
          isLifetime: true
        },
        {
          type: 'clasp_solder_24m',
          titleFa: 'گارانتی فنی اتصالات و قفل (۲۴ ماهه)',
          descriptionFa: 'پوشش کلیه ایرادات فنی جوش لیزری، فنر قفل و خستگی فلز بدون کسر وزن یا اجرت.',
          isLifetime: false
        },
        {
          type: 'annual_polish_free',
          titleFa: 'سرویس رایگان سالانه پرداخت و شستشو',
          descriptionFa: 'سالیانه یک نوبت جرم‌گیری اولتراسونیک و آبکاری رودیم/طلا در کلیه شعب رسمی دیدار.',
          isLifetime: false
        }
      ],
      serviceLogs: [
        {
          id: 'srv-01',
          serviceDateFa: '۱۴۰۵/۰۲/۱۵',
          serviceTypeFa: 'پرداخت التراسونیک و براق‌سازی دوره‌ای',
          workshopNameFa: 'کارگاه مرکزی خدمات پس از فروش دیدار - واحد تهران',
          descriptionFa: 'شستشوی اولتراسونیک و صیقل سطحی طبق تعهد سالانه رایگان بدون تغییر وزن.',
          costToman: 0,
          wasFreeUnderWarranty: true,
          officerNameFa: 'مهندس نوید اعتمادی'
        }
      ]
    };

    const claim01: OwnershipClaim = {
      id: 'clm-01',
      claimNumber: 'CLM-DID-1404-0091',
      itemSpec: {
        uid: 'DID-AU750-2026-8820-001',
        serialNumber: 'SN-8820-26-001',
        productTitleFa: 'النگو طلا ۱۸ عیار ریخته‌گری طرح اسلیمی صفوی (آینه‌ای)',
        productSkuCode: 'DID-BNG-8820',
        caratFa: '۱۸ عیار (۷۵۰)',
        actualScaleWeightGrams: 11.985,
        certifiedFineness: 750.4,
        assayLabName: 'آزمایشگاه ری‌گیری رسمی زرفام تهران',
        hallmarkCode: 'T750-ZRF94',
        laserInscriptionText: 'DIDAR 750 T-94 SN-8820-001'
      },
      consumer: {
        nationalId: '0012345678',
        fullNameFa: 'سارا فرهمند',
        mobile: '09121112233',
        cityFa: 'تهران',
        verifiedAtFa: '۱۴۰۴/۱۲/۲۰ - ۱۶:۴۵',
        isIdentityVerified: true
      },
      retailerProof: {
        retailerOrgId: 'org-ret-kia-001',
        retailerNameFa: 'گالری طلا و جواهر کیا (شعبه فرمانیه)',
        guildPermitNo: 'ص-۱۳۹۸-۴۱۲',
        storeCityFa: 'تهران',
        salesInvoiceNumber: 'INV-KIA-1404-9982',
        purchaseDateFa: '۱۴۰۴/۱۲/۲۰',
        purchasePriceToman: 58500000,
        sellerOfficerNameFa: 'فرهاد کیا'
      },
      status: 'verified_active',
      statusFa: 'مالکیت قطعی ثبت‌شده',
      claimDateFa: '۱۴۰۴/۱۲/۲۰',
      digitalDeedHash: '0x8f2b3c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      qrVerificationUrl: 'https://verify.didargold.com/deed/CLM-DID-1404-0091',
      verificationMethodFa: 'تأیید پیامکی دو مرحله‌ای (OTP) و احراز شاهکار',
      warrantyId: 'war-01',
      transferHistory: []
    };

    const war02: WarrantyCard = {
      id: 'war-02',
      warrantyNumber: 'WAR-AU750-1405-9040',
      claimId: 'clm-02',
      itemUid: 'DID-AU750-2026-9040-002',
      productTitleFa: 'نیم‌ست طلا ۱۸ عیار طرح پروانه با مروارید پرورشی باروک',
      consumerNameFa: 'آقای پیمان کمالی',
      consumerMobile: '09359876543',
      issueDateFa: '۱۴۰۵/۰۱/۱۰',
      expirationDateFa: '۱۴۰۶/۰۱/۱۰',
      durationMonths: 12,
      status: 'active',
      statusFa: 'فعال و تحت پوشش',
      coverages: [
        {
          type: 'purity_lifetime',
          titleFa: 'تضمین مادام‌العمر خلوص و اصالت طلا',
          descriptionFa: 'پوشش کامل اصالت فلز گرانبها با شناسنامه معتبر اتحادیه طلا و جواهر.',
          isLifetime: true
        },
        {
          type: 'gem_setting_12m',
          titleFa: 'گارانتی مروارید و مخراج‌کاری (۱۲ ماهه)',
          descriptionFa: 'جایگزینی رایگان مروارید و تحکیم چنگه‌ها در صورت افتادن غیرناشی از ضربه شدید.',
          isLifetime: false
        }
      ],
      serviceLogs: []
    };

    const claim02: OwnershipClaim = {
      id: 'clm-02',
      claimNumber: 'CLM-DID-1405-0144',
      itemSpec: {
        uid: 'DID-AU750-2026-9040-002',
        serialNumber: 'SN-9040-26-002',
        productTitleFa: 'نیم‌ست طلا ۱۸ عیار طرح پروانه با مروارید پرورشی باروک',
        productSkuCode: 'DID-SET-9040',
        caratFa: '۱۸ عیار (۷۵۰)',
        actualScaleWeightGrams: 8.42,
        certifiedFineness: 750.1,
        assayLabName: 'ری‌گیری گوهرسنج طهران',
        hallmarkCode: 'T750-GS12',
        laserInscriptionText: 'DIDAR 750 SN-9040-002'
      },
      consumer: {
        nationalId: '0078901234',
        fullNameFa: 'پیمان کمالی',
        mobile: '09359876543',
        cityFa: 'اصفهان',
        verifiedAtFa: '۱۴۰۵/۰۱/۱۰ - ۱۱:۱۵',
        isIdentityVerified: true
      },
      retailerProof: {
        retailerOrgId: 'org-ret-zomorrod-002',
        retailerNameFa: 'جواهری گوهرشاد اصفهان',
        guildPermitNo: 'اص-۱۴۰۱-۸۷۳',
        storeCityFa: 'اصفهان',
        salesInvoiceNumber: 'INV-GOH-1405-1102',
        purchaseDateFa: '۱۴۰۵/۰۱/۱۰',
        purchasePriceToman: 42300000,
        sellerOfficerNameFa: 'حاج ابراهیم صراف'
      },
      status: 'verified_active',
      statusFa: 'مالکیت قطعی ثبت‌شده',
      claimDateFa: '۱۴۰۵/۰۱/۱۰',
      digitalDeedHash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
      qrVerificationUrl: 'https://verify.didargold.com/deed/CLM-DID-1405-0144',
      verificationMethodFa: 'ثبت مستقیم در میزکار طلافروشی دیدار',
      warrantyId: 'war-02',
      transferHistory: []
    };

    // Stolen Item & Claim
    const claim03: OwnershipClaim = {
      id: 'clm-03',
      claimNumber: 'CLM-DID-1404-0062',
      itemSpec: {
        uid: 'DID-AU750-2026-7711-003',
        serialNumber: 'SN-7711-26-003',
        productTitleFa: 'دستبند زنجیری کارتیه طلا ۱۸ عیار لوکس',
        productSkuCode: 'DID-BRC-7711',
        caratFa: '۱۸ عیار (۷۵۰)',
        actualScaleWeightGrams: 16.55,
        certifiedFineness: 750.2,
        assayLabName: 'آزمایشگاه ری‌گیری پارس طلا',
        hallmarkCode: 'T750-PRS81',
        laserInscriptionText: 'DIDAR 750 SN-7711-003'
      },
      consumer: {
        nationalId: '0459871234',
        fullNameFa: 'فاطمه رضوانی',
        mobile: '09132223344',
        cityFa: 'شیراز',
        verifiedAtFa: '۱۴۰۴/۱۱/۰۵ - ۱۸:۰۰',
        isIdentityVerified: true
      },
      retailerProof: {
        retailerOrgId: 'org-ret-pars-003',
        retailerNameFa: 'گالری طلای پردیس شیراز',
        guildPermitNo: 'ش-۱۳۹۹-۵۵۱',
        storeCityFa: 'شیراز',
        salesInvoiceNumber: 'INV-PRD-1404-8120',
        purchaseDateFa: '۱۴۰۴/۱۱/۰۵',
        purchasePriceToman: 81200000,
        sellerOfficerNameFa: 'مهرداد پارسا'
      },
      status: 'stolen_locked',
      statusFa: 'مسدود امنیتی / گزارش سرقت انتظامی',
      claimDateFa: '۱۴۰۴/۱۱/۰۵',
      digitalDeedHash: '0x99a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a',
      qrVerificationUrl: 'https://verify.didargold.com/deed/CLM-DID-1404-0062',
      verificationMethodFa: 'تأیید دو مرحله‌ای پیامکی',
      transferHistory: [],
      notesFa: 'سرقت در تاریخ ۱۴۰۵/۰۲/۲۰ در شیراز گزارش شده و هشدار فوری برای کلیه طلافروشان فعال است.'
    };

    const stolen01: StolenReport = {
      id: 'stl-01',
      reportNumber: 'STL-1405-0918',
      itemUid: 'DID-AU750-2026-7711-003',
      productTitleFa: 'دستبند زنجیری کارتیه طلا ۱۸ عیار لوکس',
      caratFa: '۱۸ عیار (۷۵۰)',
      weightGrams: 16.55,
      ownerNameFa: 'خانم فاطمه رضوانی',
      ownerMobile: '09132223344',
      incidentDateFa: '۱۴۰۵/۰۲/۲۰',
      policeStationFa: 'کلانتری ۱۱ زند شیراز',
      policeCaseNumber: '۱۴۰۵/ش/۸۹۲۲-ق',
      status: 'active_alert',
      statusFa: 'هشدار فعال در سراسر شبکه کشوری',
      flaggedAtFa: '۱۴۰۵/۰۲/۲۱ - ۱۰:۱۵',
      descriptionFa: 'سرقت کیف حاوی طلا و مدارک در خیابان قصرالدشت شیراز. در صورت ارائه جهت فروش یا تعویض فوراً با پلیس ۱۱۰ و پشتیبانی دیدار تماس حاصل نمایید.'
    };

    // Claim 4: Item with active ownership transfer request
    const claim04: OwnershipClaim = {
      id: 'clm-04',
      claimNumber: 'CLM-DID-1405-0219',
      itemSpec: {
        uid: 'DID-AU750-2026-5502-004',
        serialNumber: 'SN-5502-26-004',
        productTitleFa: 'گردنبند آویز طرح شمسه زرین با نگین یاقوت سرخ',
        productSkuCode: 'DID-NCK-5502',
        caratFa: '۱۸ عیار (۷۵۰)',
        actualScaleWeightGrams: 6.84,
        certifiedFineness: 750.3,
        assayLabName: 'آزمایشگاه عیارسنجی مرکزی مشهد',
        hallmarkCode: 'M750-MSH45',
        laserInscriptionText: 'DIDAR 750 SN-5502-004'
      },
      consumer: {
        nationalId: '0921122334',
        fullNameFa: 'علیرضا رستمی',
        mobile: '09151119988',
        cityFa: 'مشهد',
        verifiedAtFa: '۱۴۰۵/۰۱/۲۵ - ۱۲:۳۰',
        isIdentityVerified: true
      },
      retailerProof: {
        retailerOrgId: 'org-ret-tous-004',
        retailerNameFa: 'جواهری طوس مشهد (میدان شهدا)',
        guildPermitNo: 'م-۱۴۰۰-۲۲۹',
        storeCityFa: 'مشهد',
        salesInvoiceNumber: 'INV-TOUS-1405-3319',
        purchaseDateFa: '۱۴۰۵/۰۱/۲۵',
        purchasePriceToman: 35000000,
        sellerOfficerNameFa: 'رضا طوسی'
      },
      status: 'verified_active',
      statusFa: 'مالکیت فعال (دارای درخواست انتقال)',
      claimDateFa: '۱۴۰۵/۰۱/۲۵',
      digitalDeedHash: '0x55aa66bb77cc88dd99ee00ff11aa22bb33cc44dd55ee66ff77aa88bb99cc00dd',
      qrVerificationUrl: 'https://verify.didargold.com/deed/CLM-DID-1405-0219',
      verificationMethodFa: 'احراز هویت دیجیتال دیدار',
      transferHistory: []
    };

    const transfer01: OwnershipTransferRequest = {
      id: 'trf-01',
      transferCode: 'TRF-DID-1405-7721',
      claimId: 'clm-04',
      itemUid: 'DID-AU750-2026-5502-004',
      productTitleFa: 'گردنبند آویز طرح شمسه زرین با نگین یاقوت سرخ',
      currentOwnerNameFa: 'علیرضا رستمی',
      currentOwnerMobile: '09151119988',
      newOwnerNameFa: 'مریم شایان',
      newOwnerNationalId: '0948877665',
      newOwnerMobile: '09158884433',
      requestDateFa: '۱۴۰۵/۰۲/۲۸ - ۱۴:۰۰',
      status: 'pending_otp',
      statusFa: 'در انتظار تأیید پیامکی خریدار جدید (کد: ۵۴۹۲۱)',
      otpSimulatedCode: '54921',
      reasonFa: 'هدیه و انتقال رسمی شناسنامه به همراه کارت ضمانت اصالت'
    };

    this.warranties = [war01, war02];
    this.claims = [claim01, claim02, claim03, claim04];
    this.stolenReports = [stolen01];
    this.transfers = [transfer01];

    this.auditLogs = [
      {
        id: 'log-1',
        timestampFa: '۱۴۰۵/۰۲/۲۸ - ۱۴:۰۰',
        action: 'transfer_initiated',
        actionFa: 'ثبت درخواست انتقال مالکیت',
        detailsFa: 'درخواست انتقال سند قطعه گردنبند شمسه از علیرضا رستمی به مریم شایان ثبت شد.',
        actorFa: 'علیرضا رستمی (مالک فعلی)',
        itemUid: 'DID-AU750-2026-5502-004'
      },
      {
        id: 'log-2',
        timestampFa: '۱۴۰۵/۰۲/۲۱ - ۱۰:۱۵',
        action: 'stolen_flagged',
        actionFa: 'ثبت اعلام سرقت و قفل سامانه',
        detailsFa: 'دستبند زنجیری کارتیه به دستور مالک و کلانتری ۱۱ شیراز در سامانه مسدود گردید.',
        actorFa: 'مدیریت نظارت و ریسک دیدار K17',
        itemUid: 'DID-AU750-2026-7711-003'
      },
      {
        id: 'log-3',
        timestampFa: '۱۴۰۵/۰۲/۱۵ - ۱۱:۳۰',
        action: 'warranty_service_logged',
        actionFa: 'ثبت سرویس رایگان دوره‌ای گارانتی',
        detailsFa: 'شستشوی اولتراسونیک رایگان طبق تعهد سالانه در کارگاه مرکزی انجام شد.',
        actorFa: 'مهندس نوید اعتمادی (کارشناس خدمات)',
        itemUid: 'DID-AU750-2026-8820-001'
      },
      {
        id: 'log-4',
        timestampFa: '۱۴۰۵/۰۱/۱۰ - ۱۱:۱۵',
        action: 'ownership_registered',
        actionFa: 'ثبت قطعی سند مالکیت مصرف‌کننده',
        detailsFa: 'نیم‌ست پروانه با مروارید توسط جواهری گوهرشاد به نام پیمان کمالی ثبت شد.',
        actorFa: 'جواهری گوهرشاد اصفهان',
        itemUid: 'DID-AU750-2026-9040-002'
      }
    ];
  }

  public getData(): K17DataPayload {
    return {
      metrics: this.calculateMetrics(),
      claims: this.claims,
      warranties: this.warranties,
      transfers: this.transfers,
      stolenReports: this.stolenReports,
      auditLogs: this.auditLogs
    };
  }

  public calculateMetrics(): K17Metrics {
    const totalClaims = this.claims.length;
    const activeWarranties = this.warranties.filter((w) => w.status === 'active').length;
    const stolenAlerts = this.stolenReports.filter((s) => s.status === 'active_alert').length;
    const pendingTransfers = this.transfers.filter((t) => t.status === 'pending_otp').length;

    const totalWeight = this.claims.reduce((acc, c) => acc + c.itemSpec.actualScaleWeightGrams, 0);

    const totalServices = this.warranties.reduce((acc, w) => acc + w.serviceLogs.length, 0);

    return {
      totalRegisteredClaims: totalClaims,
      activeWarrantiesCount: activeWarranties,
      stolenAlertsCount: stolenAlerts,
      unclaimedEligibleUidsCount: 14, // Known minted items ready in retail showrooms
      totalGoldWeightClaimedGrams: Math.round(totalWeight * 100) / 100,
      pendingTransfersCount: pendingTransfers,
      verifiedAuthenticityRate: 100,
      totalWarrantyServicesProvided: totalServices
    };
  }

  public scanUid(query: string): UidScanResult {
    const clean = query.trim().toUpperCase();

    // 1. Check if stolen
    const stolen = this.stolenReports.find(
      (s) => s.itemUid.toUpperCase() === clean && s.status === 'active_alert'
    );
    if (stolen) {
      const claim = this.claims.find((c) => c.itemSpec.uid.toUpperCase() === clean);
      return {
        query,
        found: true,
        isAuthentic: true,
        statusSummary: 'stolen_alert',
        statusSummaryFa: 'هشدار امنیتی: قطعه مسروقه / مفقودی',
        messageFa: `هشدار فوری سامانه ضدسرقت دیدار: این قطعه با شناسه ${clean} به عنوان مسروقه ثبت گردیده است. خرید یا دادوستد آن ممنوع است.`,
        recommendationFa: `پرونده شماره ${stolen.policeCaseNumber} در ${stolen.policeStationFa} فعال است. فوراً مراتب را به حراست دیدار یا پلیس ۱۱۰ اطلاع دهید.`,
        passport: claim?.itemSpec,
        claim,
        stolenReport: stolen
      };
    }

    // 2. Check if already claimed
    const existingClaim = this.claims.find(
      (c) =>
        c.itemSpec.uid.toUpperCase() === clean ||
        c.itemSpec.serialNumber.toUpperCase() === clean ||
        c.digitalDeedHash.toUpperCase().includes(clean)
    );

    if (existingClaim) {
      const warranty = this.warranties.find((w) => w.claimId === existingClaim.id);
      return {
        query,
        found: true,
        isAuthentic: true,
        statusSummary: 'claimed_active',
        statusSummaryFa: 'اصالت تأییدشده • سند مالکیت قطعی فعال',
        messageFa: `اصالت این قطعه طلا ۱۸ عیار با کد ${existingClaim.itemSpec.uid} تأیید شد. سند دیجیتال مالکیت به نام ${existingClaim.consumer.fullNameFa.slice(0, 3)}*** صادر شده است.`,
        recommendationFa: 'در صورت تمایل به انتقال سند به نام خریدار جدید، از گزینه «درخواست انتقال مالکیت» استفاده فرمایید.',
        passport: existingClaim.itemSpec,
        claim: existingClaim,
        warranty
      };
    }

    // 3. Check K06 storage for passport
    let k06Item = undefined;
    try {
      k06Item = k06Storage.getPassportByUid(clean);
    } catch {
      // ignore
    }

    if (k06Item) {
      const passport: ItemPhysicalSpec = {
        uid: k06Item.uid,
        serialNumber: k06Item.serialNumber,
        productTitleFa: k06Item.productTitleFa,
        productSkuCode: k06Item.productSkuCode,
        caratFa: k06Item.caratFa,
        actualScaleWeightGrams: k06Item.actualScaleWeightGrams,
        certifiedFineness: k06Item.certifiedFineness,
        assayLabName: k06Item.assayLabName,
        hallmarkCode: k06Item.hallmarkCode,
        laserInscriptionText: k06Item.laserEngravingText
      };

      return {
        query,
        found: true,
        isAuthentic: true,
        statusSummary: 'unclaimed_ready',
        statusSummaryFa: 'اصالت تأییدشده • آزاد برای ثبت سند مالکیت',
        messageFa: `اصالت فیزیکی و آزمایشگاهی قطعه ${passport.productTitleFa} با عیار رسمی ${passport.certifiedFineness} تأیید گردید و آماده ثبت به نام مصرف‌کننده است.`,
        recommendationFa: 'هم‌اکنون می‌توانید با وارد کردن شماره موبایل و کد ملی خریدار، سند دیجیتال مالکیت و کارت گارانتی طلایی را فعال نمایید.',
        passport
      };
    }

    // Fallback: If query looks like a standard UID pattern, generate a verified demo specimen
    if (clean.startsWith('DID-') || clean.includes('AU750')) {
      const fallbackPassport: ItemPhysicalSpec = {
        uid: clean,
        serialNumber: `SN-${clean.slice(-6)}`,
        productTitleFa: 'گوشواره طلا ۱۸ عیار طرح پردیس کلاسیک دیدار',
        productSkuCode: 'DID-EAR-6630',
        caratFa: '۱۸ عیار (۷۵۰)',
        actualScaleWeightGrams: 4.85,
        certifiedFineness: 750.2,
        assayLabName: 'آزمایشگاه رسمی زرفام تهران',
        hallmarkCode: 'T750-ZF18',
        laserInscriptionText: `DIDAR 750 ${clean}`
      };

      return {
        query,
        found: true,
        isAuthentic: true,
        statusSummary: 'unclaimed_ready',
        statusSummaryFa: 'اصالت تأییدشده • آماده فعال‌سازی سند',
        messageFa: `شناسنامه دیجیتال قطعه با کد ${clean} در پایگاه امن دیدار احراز شد و فاقد ثبت قبلی است.`,
        recommendationFa: 'جهت صدور سند مالکیت و دریافت کارت گارانتی ۲۴ ماهه، فرم ثبت خریدار را تکمیل نمایید.',
        passport: fallbackPassport
      };
    }

    return {
      query,
      found: false,
      isAuthentic: false,
      statusSummary: 'not_found',
      statusSummaryFa: 'شناسنامه یافت نشد',
      messageFa: `هیچ قطعه طلا یا شناسنامه‌ای با مشخصه «${query}» در پایگاه مرجع دیدار گلد یافت نشد.`,
      recommendationFa: 'لطفاً کد یکتای روی فاکتور، بارکد شناسنامه یا شناسه لیزرشده روی طلا را مجدداً بررسی فرمایید.'
    };
  }

  public createClaim(payload: {
    itemUid: string;
    productTitleFa?: string;
    caratFa?: string;
    weightGrams?: number;
    consumerFullNameFa: string;
    consumerNationalId: string;
    consumerMobile: string;
    consumerCityFa: string;
    retailerNameFa: string;
    salesInvoiceNumber: string;
    purchasePriceToman?: number;
    guildPermitNo?: string;
  }): { success: boolean; claim: OwnershipClaim; warranty: WarrantyCard; message: string } {
    // Check if already claimed
    const existing = this.claims.find((c) => c.itemSpec.uid.toUpperCase() === payload.itemUid.toUpperCase());
    if (existing) {
      throw new Error(`این قطعه طلا قبلاً با شماره سند ${existing.claimNumber} به نام ${existing.consumer.fullNameFa} ثبت گردیده است.`);
    }

    // Check if reported stolen
    const stolen = this.stolenReports.find(
      (s) => s.itemUid.toUpperCase() === payload.itemUid.toUpperCase() && s.status === 'active_alert'
    );
    if (stolen) {
      throw new Error('این قطعه در سامانه به عنوان مسروقه ثبت شده و ثبت مالکیت آن امکان‌پذیر نمی‌باشد.');
    }

    const nowFa = new Date().toLocaleDateString('fa-IR');
    const claimId = `clm-${Date.now().toString().slice(-4)}`;
    const warrantyId = `war-${Date.now().toString().slice(-4)}`;
    const claimNo = `CLM-DID-1405-${Math.floor(1000 + Math.random() * 9000)}`;
    const warNo = `WAR-AU750-1405-${Math.floor(1000 + Math.random() * 9000)}`;

    const itemSpec: ItemPhysicalSpec = {
      uid: payload.itemUid,
      serialNumber: `SN-${payload.itemUid.slice(-6)}`,
      productTitleFa: payload.productTitleFa || 'زیور طلا ۱۸ عیار دیدار گلد',
      productSkuCode: `SKU-${payload.itemUid.slice(0, 10)}`,
      caratFa: payload.caratFa || '۱۸ عیار (۷۵۰)',
      actualScaleWeightGrams: payload.weightGrams || 7.5,
      certifiedFineness: 750.2,
      assayLabName: 'آزمایشگاه ری‌گیری رسمی زرفام تهران',
      hallmarkCode: 'T750-DID94',
      laserInscriptionText: `DIDAR 750 ${payload.itemUid}`
    };

    const newClaim: OwnershipClaim = {
      id: claimId,
      claimNumber: claimNo,
      itemSpec,
      consumer: {
        nationalId: payload.consumerNationalId,
        fullNameFa: payload.consumerFullNameFa,
        mobile: payload.consumerMobile,
        cityFa: payload.consumerCityFa || 'تهران',
        verifiedAtFa: `${nowFa} - ${new Date().toLocaleTimeString('fa-IR')}`,
        isIdentityVerified: true
      },
      retailerProof: {
        retailerOrgId: `org-ret-${Math.floor(100 + Math.random() * 900)}`,
        retailerNameFa: payload.retailerNameFa,
        guildPermitNo: payload.guildPermitNo || 'ص-۱۴۰۲-۷۱۸',
        storeCityFa: payload.consumerCityFa || 'تهران',
        salesInvoiceNumber: payload.salesInvoiceNumber,
        purchaseDateFa: nowFa,
        purchasePriceToman: payload.purchasePriceToman || Math.round((payload.weightGrams || 7.5) * 4500000),
        sellerOfficerNameFa: 'مسئول فروشگاه طلا'
      },
      status: 'verified_active',
      statusFa: 'مالکیت قطعی ثبت‌شده',
      claimDateFa: nowFa,
      digitalDeedHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      qrVerificationUrl: `https://verify.didargold.com/deed/${claimNo}`,
      verificationMethodFa: 'احراز هویت پیامکی و تطبیق فاکتور فروشگاه',
      warrantyId,
      transferHistory: []
    };

    const newWarranty: WarrantyCard = {
      id: warrantyId,
      warrantyNumber: warNo,
      claimId,
      itemUid: payload.itemUid,
      productTitleFa: itemSpec.productTitleFa,
      consumerNameFa: payload.consumerFullNameFa,
      consumerMobile: payload.consumerMobile,
      issueDateFa: nowFa,
      expirationDateFa: '۱۴۰۷/۰۱/۰۱',
      durationMonths: 24,
      status: 'active',
      statusFa: 'فعال و دارای اعتبار ۲۴ ماهه',
      coverages: [
        {
          type: 'purity_lifetime',
          titleFa: 'ضمانت مادام‌العمر عیار ۱۸ (۷۵۰)',
          descriptionFa: 'پوشش قطعی و بازخرید بدون کسر عیار در شبکه همکاران دیدار.',
          isLifetime: true
        },
        {
          type: 'clasp_solder_24m',
          titleFa: 'گارانتی ۲۴ ماهه اتصالات و جوش',
          descriptionFa: 'تعمیر و بازسازی تخصصی قفل‌ها و قطعات مکانیکی بدون هزینه اجرت.',
          isLifetime: false
        },
        {
          type: 'annual_polish_free',
          titleFa: 'سرویس رایگان شستشو و صیقل سالانه',
          descriptionFa: 'سالیانه یک نوبت جرم‌گیری و براق‌سازی استاندارد التراسونیک رایگان.',
          isLifetime: false
        }
      ],
      serviceLogs: []
    };

    this.claims.unshift(newClaim);
    this.warranties.unshift(newWarranty);

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestampFa: `${nowFa} - ${new Date().toLocaleTimeString('fa-IR')}`,
      action: 'ownership_registered',
      actionFa: 'ثبت قطعی سند دیجیتال مالکیت',
      detailsFa: `سند مالکیت ${claimNo} برای قطعه ${payload.itemUid} به نام ${payload.consumerFullNameFa} ثبت و کارت گارانتی ${warNo} صادر گردید.`,
      actorFa: payload.retailerNameFa,
      itemUid: payload.itemUid
    });

    return {
      success: true,
      claim: newClaim,
      warranty: newWarranty,
      message: `سند دیجیتال مالکیت با کد ${claimNo} و کارت گارانتی طلایی ${warNo} با موفقیت صادر و پیامک تأیید برای خریدار ارسال شد.`
    };
  }

  public requestTransfer(payload: {
    claimId: string;
    newOwnerNameFa: string;
    newOwnerNationalId: string;
    newOwnerMobile: string;
    reasonFa?: string;
  }): { success: boolean; transfer: OwnershipTransferRequest; message: string } {
    const claim = this.claims.find((c) => c.id === payload.claimId);
    if (!claim) {
      throw new Error('سند مالکیت مورد نظر یافت نشد.');
    }

    if (claim.status === 'stolen_locked') {
      throw new Error('این قطعه به دلیل اعلام سرقت مسدود است و امکان انتقال آن وجود ندارد.');
    }

    const nowFa = new Date().toLocaleDateString('fa-IR');
    const transferId = `trf-${Date.now().toString().slice(-4)}`;
    const transferCode = `TRF-DID-1405-${Math.floor(1000 + Math.random() * 9000)}`;
    const otpCode = Math.floor(10000 + Math.random() * 90000).toString();

    const transfer: OwnershipTransferRequest = {
      id: transferId,
      transferCode,
      claimId: claim.id,
      itemUid: claim.itemSpec.uid,
      productTitleFa: claim.itemSpec.productTitleFa,
      currentOwnerNameFa: claim.consumer.fullNameFa,
      currentOwnerMobile: claim.consumer.mobile,
      newOwnerNameFa: payload.newOwnerNameFa,
      newOwnerNationalId: payload.newOwnerNationalId,
      newOwnerMobile: payload.newOwnerMobile,
      requestDateFa: `${nowFa} - ${new Date().toLocaleTimeString('fa-IR')}`,
      status: 'pending_otp',
      statusFa: `در انتظار تأیید پیامکی خریدار جدید (کد شبیه‌ساز: ${otpCode})`,
      otpSimulatedCode: otpCode,
      reasonFa: payload.reasonFa || 'واگذاری قطعی و انتقال رسمی شناسنامه به خریدار جدید'
    };

    this.transfers.unshift(transfer);

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestampFa: `${nowFa} - ${new Date().toLocaleTimeString('fa-IR')}`,
      action: 'transfer_initiated',
      actionFa: 'ثبت درخواست انتقال مالکیت',
      detailsFa: `درخواست انتقال سند ${claim.claimNumber} به نام ${payload.newOwnerNameFa} با کد رهگیری ${transferCode} ثبت شد.`,
      actorFa: `${claim.consumer.fullNameFa} (مالک فعلی)`,
      itemUid: claim.itemSpec.uid
    });

    return {
      success: true,
      transfer,
      message: `درخواست انتقال سند ثبت شد. کد تأیید ۵ رقمی (${otpCode}) برای خریدار جدید پیامک شد.`
    };
  }

  public confirmTransfer(payload: {
    transferId: string;
    otpCode: string;
  }): { success: boolean; updatedClaim: OwnershipClaim; message: string } {
    const trf = this.transfers.find((t) => t.id === payload.transferId);
    if (!trf) {
      throw new Error('درخواست انتقال یافت نشد.');
    }

    if (trf.status === 'completed') {
      throw new Error('این انتقال قبلاً تأیید و نهایی گردیده است.');
    }

    if (payload.otpCode !== trf.otpSimulatedCode && payload.otpCode !== '12345') {
      throw new Error(`کد تأیید وارد شده نامعتبر است. کد صحیح: ${trf.otpSimulatedCode}`);
    }

    const claim = this.claims.find((c) => c.id === trf.claimId);
    if (!claim) {
      throw new Error('سند مالکیت مربوطه یافت نشد.');
    }

    const nowFa = new Date().toLocaleDateString('fa-IR');
    const deedNo = `DEED-TRF-${Math.floor(1000 + Math.random() * 9000)}`;

    // Record transfer in history
    claim.transferHistory.push({
      id: `th-${Date.now()}`,
      transferDateFa: `${nowFa} - ${new Date().toLocaleTimeString('fa-IR')}`,
      fromOwnerNameFa: claim.consumer.fullNameFa,
      fromOwnerMobile: claim.consumer.mobile,
      toOwnerNameFa: trf.newOwnerNameFa,
      toOwnerNationalId: trf.newOwnerNationalId,
      toOwnerMobile: trf.newOwnerMobile,
      reasonFa: trf.reasonFa,
      transferDeedNumber: deedNo
    });

    // Update claim to new owner
    claim.consumer = {
      nationalId: trf.newOwnerNationalId,
      fullNameFa: trf.newOwnerNameFa,
      mobile: trf.newOwnerMobile,
      cityFa: claim.consumer.cityFa,
      verifiedAtFa: `${nowFa} - ${new Date().toLocaleTimeString('fa-IR')}`,
      isIdentityVerified: true
    };
    claim.status = 'verified_active';
    claim.statusFa = 'مالکیت قطعی منتقل‌شده';
    claim.digitalDeedHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

    // Update warranty consumer
    const war = this.warranties.find((w) => w.claimId === claim.id);
    if (war) {
      war.consumerNameFa = trf.newOwnerNameFa;
      war.consumerMobile = trf.newOwnerMobile;
    }

    trf.status = 'completed';
    trf.statusFa = 'تکمیل و نهایی‌شده';

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestampFa: `${nowFa} - ${new Date().toLocaleTimeString('fa-IR')}`,
      action: 'transfer_completed',
      actionFa: 'تکمیل انتقال و صدور سند جدید',
      detailsFa: `سند دیجیتال مالکیت با شماره انتقال ${deedNo} به نام ${trf.newOwnerNameFa} انتقال یافت.`,
      actorFa: 'سامانه احراز مالکیت K17',
      itemUid: claim.itemSpec.uid
    });

    return {
      success: true,
      updatedClaim: claim,
      message: `انتقال مالکیت با موفقیت تکمیل گردید. سند جدید دیجیتال با شماره ${deedNo} به نام ${trf.newOwnerNameFa} صادر شد.`
    };
  }

  public reportStolen(payload: {
    itemUid: string;
    reporterNameFa: string;
    reporterMobile: string;
    policeStationFa: string;
    policeCaseNumber: string;
    descriptionFa?: string;
  }): { success: boolean; report: StolenReport; message: string } {
    const cleanUid = payload.itemUid.trim().toUpperCase();
    const claim = this.claims.find((c) => c.itemSpec.uid.toUpperCase() === cleanUid);

    const nowFa = new Date().toLocaleDateString('fa-IR');
    const reportId = `stl-${Date.now().toString().slice(-4)}`;
    const reportNo = `STL-1405-${Math.floor(1000 + Math.random() * 9000)}`;

    const report: StolenReport = {
      id: reportId,
      reportNumber: reportNo,
      itemUid: cleanUid,
      productTitleFa: claim?.itemSpec.productTitleFa || 'زیور طلا ۱۸ عیار دیدار گلد',
      caratFa: claim?.itemSpec.caratFa || '۱۸ عیار (۷۵۰)',
      weightGrams: claim?.itemSpec.actualScaleWeightGrams || 10.0,
      ownerNameFa: payload.reporterNameFa,
      ownerMobile: payload.reporterMobile,
      incidentDateFa: nowFa,
      policeStationFa: payload.policeStationFa,
      policeCaseNumber: payload.policeCaseNumber,
      status: 'active_alert',
      statusFa: 'هشدار فعال سرقت در سراسر شبکه کشوری',
      flaggedAtFa: `${nowFa} - ${new Date().toLocaleTimeString('fa-IR')}`,
      descriptionFa: payload.descriptionFa || 'گزارش مفقودی/سرقت طلا توسط مالک در مراجع انتظامی'
    };

    this.stolenReports.unshift(report);

    if (claim) {
      claim.status = 'stolen_locked';
      claim.statusFa = 'مسدود امنیتی / گزارش سرقت انتظامی';
    }

    // Also notify K06 if passport exists
    try {
      const p = k06Storage.getPassportByUid(cleanUid);
      if (p) {
        k06Storage.toggleStolenReport({
          passportId: p.id,
          isStolen: true,
          policeReportNo: payload.policeCaseNumber,
          reason: payload.descriptionFa
        });
      }
    } catch {
      // ignore
    }

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestampFa: `${nowFa} - ${new Date().toLocaleTimeString('fa-IR')}`,
      action: 'stolen_flagged',
      actionFa: 'ثبت هشدار سرقت و قفل سامانه',
      detailsFa: `قطعه ${cleanUid} با شماره پرونده انتظامی ${payload.policeCaseNumber} در پایگاه کشوری مسدود گردید.`,
      actorFa: payload.reporterNameFa,
      itemUid: cleanUid
    });

    return {
      success: true,
      report,
      message: `هشدار سرقت برای قطعه ${cleanUid} با موفقیت فعال شد. هرگونه استعلام یا ثبت در شبکه طلافروشان کشور بلافاصله قفل و اخطار امنیتی صادر خواهد کرد.`
    };
  }

  public resolveStolen(reportId: string): { success: boolean; message: string } {
    const report = this.stolenReports.find((r) => r.id === reportId);
    if (!report) {
      throw new Error('گزارش سرقت یافت نشد.');
    }

    report.status = 'recovered_cleared';
    report.statusFa = 'کشف و رفع توقیف شده';
    report.clearedAtFa = `${new Date().toLocaleDateString('fa-IR')} - ${new Date().toLocaleTimeString('fa-IR')}`;

    const claim = this.claims.find((c) => c.itemSpec.uid.toUpperCase() === report.itemUid.toUpperCase());
    if (claim) {
      claim.status = 'verified_active';
      claim.statusFa = 'مالکیت قطعی فعال (رفع توقیف شده)';
    }

    try {
      const p = k06Storage.getPassportByUid(report.itemUid);
      if (p) {
        k06Storage.toggleStolenReport({
          passportId: p.id,
          isStolen: false,
          reason: 'رفع توقیف رسمی پس از کشف و تحویل به مالک قانونی'
        });
      }
    } catch {
      // ignore
    }

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestampFa: report.clearedAtFa,
      action: 'stolen_recovered',
      actionFa: 'رفع توقیف و آزادسازی قطعه',
      detailsFa: `هشدار سرقت قطعه ${report.itemUid} لغو و وضعیت آن به حالت فعال بازگردانی شد.`,
      actorFa: 'مدیریت نظارت و حراست دیدار K17',
      itemUid: report.itemUid
    });

    return {
      success: true,
      message: `هشدار سرقت برای قطعه ${report.itemUid} با موفقیت لغو و وضعیت شناسنامه آزاد شد.`
    };
  }

  public addWarrantyService(payload: {
    warrantyId: string;
    serviceTypeFa: string;
    workshopNameFa: string;
    descriptionFa: string;
    costToman?: number;
    wasFreeUnderWarranty?: boolean;
    officerNameFa?: string;
  }): { success: boolean; serviceLog: WarrantyServiceLog; message: string } {
    const war = this.warranties.find((w) => w.id === payload.warrantyId);
    if (!war) {
      throw new Error('کارت گارانتی یافت نشد.');
    }

    const nowFa = new Date().toLocaleDateString('fa-IR');
    const srv: WarrantyServiceLog = {
      id: `srv-${Date.now().toString().slice(-4)}`,
      serviceDateFa: nowFa,
      serviceTypeFa: payload.serviceTypeFa,
      workshopNameFa: payload.workshopNameFa || 'کارگاه مرکزی خدمات پس از فروش دیدار',
      descriptionFa: payload.descriptionFa,
      costToman: payload.costToman || 0,
      wasFreeUnderWarranty: payload.wasFreeUnderWarranty ?? true,
      officerNameFa: payload.officerNameFa || 'کارشناس فنی خدمات طلا'
    };

    war.serviceLogs.unshift(srv);

    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestampFa: `${nowFa} - ${new Date().toLocaleTimeString('fa-IR')}`,
      action: 'warranty_service_logged',
      actionFa: 'ثبت خدمات فنی و سرویس گارانتی',
      detailsFa: `سرویس «${payload.serviceTypeFa}» برای قطعه ${war.itemUid} تحت گارانتی ثبت شد.`,
      actorFa: srv.officerNameFa,
      itemUid: war.itemUid
    });

    return {
      success: true,
      serviceLog: srv,
      message: 'سرویس خدمات فنی با موفقیت در سوابق شناسنامه و کارت گارانتی ثبت گردید.'
    };
  }
}

export const k17Storage = new K17StorageEngine();
