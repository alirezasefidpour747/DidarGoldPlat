/**
 * Didar Gold Platform - Kernel 14 (K14): Credit & Exposure Management
 * Storage & In-Memory Business Logic
 */

import {
  K14DataPayload,
  BuyerCreditProfile,
  CollateralItem,
  CreditExposureAlert,
  CreditOverrideRequest,
  K14Metrics
} from '../src/types/k14.js';

class K14Storage {
  private creditProfiles: BuyerCreditProfile[] = [
    {
      buyerId: 'org-ret-parnia-004',
      buyerOrgNameFa: 'گالری طلا و جواهرات پرنیا (سعادت‌آباد)',
      nationalId: '14008491280',
      economicCode: '411489129031',
      tier: 'T1',
      phone: '021-22681490',
      addressFa: 'تهران، سعادت‌آباد، مجتمع تجاری رویال، طبقه همکف، واحد ۱۲',
      goldCreditLimitGrams: 500.0,
      goldExposureGrams: 285.4,
      goldAvailableCreditGrams: 214.6,
      goldUtilizationPercent: 57.1,
      rialCreditLimitToman: 2500000000,
      rialExposureToman: 1180000000,
      rialAvailableCreditToman: 1320000000,
      rialUtilizationPercent: 47.2,
      creditScore: 94,
      riskLevel: 'low',
      status: 'active',
      collateralTotalNominalToman: 4200000000,
      collateralEffectiveValueToman: 3780000000,
      collateralCoveragePercent: 154.2,
      creditOfficerFa: 'مهندس حسینی (مدیریت ریسک)',
      lastReviewDateFa: '۱۴۰۳/۰۶/۱۵',
      nextReviewDateFa: '۱۴۰۳/۰۹/۱۵',
      activeOrdersCount: 3,
      unsettledInvoicesCount: 1
    },
    {
      buyerId: 'org-whs-pars-003',
      buyerOrgNameFa: 'بازرگانی طلا و جواهر پارس زرین',
      nationalId: '10380291482',
      economicCode: '411982341298',
      tier: 'T1',
      phone: '021-55618290',
      addressFa: 'تهران، بازار بزرگ، پاساژ حکیم هاشمی، پلاک ۴۲',
      goldCreditLimitGrams: 1500.0,
      goldExposureGrams: 1040.0,
      goldAvailableCreditGrams: 460.0,
      goldUtilizationPercent: 69.3,
      rialCreditLimitToman: 8000000000,
      rialExposureToman: 5420000000,
      rialAvailableCreditToman: 2580000000,
      rialUtilizationPercent: 67.8,
      creditScore: 89,
      riskLevel: 'low',
      status: 'active',
      collateralTotalNominalToman: 14500000000,
      collateralEffectiveValueToman: 13050000000,
      collateralCoveragePercent: 130.5,
      creditOfficerFa: 'دکتر صمدی (کمیته اعتبارات خرد و کلان)',
      lastReviewDateFa: '۱۴۰۳/۰۶/۰۱',
      nextReviewDateFa: '۱۴۰۳/۰۸/۳۰',
      activeOrdersCount: 6,
      unsettledInvoicesCount: 2
    },
    {
      buyerId: 'org-ret-zomorod-002',
      buyerOrgNameFa: 'گالری طلا و جواهر زمرد تهران',
      nationalId: '10103569841',
      economicCode: '411589632145',
      tier: 'T2',
      phone: '021-55623344',
      addressFa: 'تهران، بازار بزرگ، سرای امید، پلاک ۲۴',
      goldCreditLimitGrams: 250.0,
      goldExposureGrams: 198.5,
      goldAvailableCreditGrams: 51.5,
      goldUtilizationPercent: 79.4,
      rialCreditLimitToman: 1200000000,
      rialExposureToman: 940000000,
      rialAvailableCreditToman: 260000000,
      rialUtilizationPercent: 78.3,
      creditScore: 78,
      riskLevel: 'medium',
      status: 'warning',
      collateralTotalNominalToman: 2200000000,
      collateralEffectiveValueToman: 1870000000,
      collateralCoveragePercent: 102.8,
      creditOfficerFa: 'مهندس حسینی (مدیریت ریسک)',
      lastReviewDateFa: '۱۴۰۳/۰۵/۲۰',
      nextReviewDateFa: '۱۴۰۳/۰۷/۲۰',
      activeOrdersCount: 2,
      unsettledInvoicesCount: 2
    },
    {
      buyerId: 'org-ret-ehsan-005',
      buyerOrgNameFa: 'طلا و جواهرات احسان (ونک)',
      nationalId: '14009210982',
      economicCode: '411629810234',
      tier: 'T2',
      phone: '021-88771234',
      addressFa: 'تهران، میدان ونک، مجتمع تجاری پایتخت، طبقه اول',
      goldCreditLimitGrams: 150.0,
      goldExposureGrams: 132.0,
      goldAvailableCreditGrams: 18.0,
      goldUtilizationPercent: 88.0,
      rialCreditLimitToman: 850000000,
      rialExposureToman: 760000000,
      rialAvailableCreditToman: 90000000,
      rialUtilizationPercent: 89.4,
      creditScore: 68,
      riskLevel: 'high',
      status: 'warning',
      collateralTotalNominalToman: 1400000000,
      collateralEffectiveValueToman: 1190000000,
      collateralCoveragePercent: 88.2,
      creditOfficerFa: 'کارشناس نظارت اعتباری',
      lastReviewDateFa: '۱۴۰۳/۰۵/۱۰',
      nextReviewDateFa: '۱۴۰۳/۰۶/۳۰',
      activeOrdersCount: 2,
      unsettledInvoicesCount: 1
    },
    {
      buyerId: 'org-ret-kimia-006',
      buyerOrgNameFa: 'گالری طلای کیمیا نوین',
      nationalId: '14006781290',
      economicCode: '411782390112',
      tier: 'T3',
      phone: '021-44221190',
      addressFa: 'تهران، صادقیه، فلکه دوم، پاساژ افق، پلاک ۷',
      goldCreditLimitGrams: 80.0,
      goldExposureGrams: 84.5,
      goldAvailableCreditGrams: 0,
      goldUtilizationPercent: 105.6,
      rialCreditLimitToman: 400000000,
      rialExposureToman: 430000000,
      rialAvailableCreditToman: 0,
      rialUtilizationPercent: 107.5,
      creditScore: 52,
      riskLevel: 'critical',
      status: 'credit_locked',
      lockReasonFa: 'تخطی از سقف اعتبار وزنی و سررسید چک صیادی تسویه‌نشده بیش از ۵ روز کاری',
      collateralTotalNominalToman: 500000000,
      collateralEffectiveValueToman: 425000000,
      collateralCoveragePercent: 52.8,
      creditOfficerFa: 'مدیر امور حقوقی و مطالبات',
      lastReviewDateFa: '۱۴۰۳/۰۶/۱۰',
      nextReviewDateFa: '۱۴۰۳/۰۶/۱۷',
      activeOrdersCount: 1,
      unsettledInvoicesCount: 2
    }
  ];

  private collaterals: CollateralItem[] = [
    {
      id: 'col-001',
      buyerId: 'org-whs-pars-003',
      buyerOrgNameFa: 'بازرگانی طلا و جواهر پارس زرین',
      collateralType: 'bank_guarantee',
      titleFa: 'ضمانت‌نامه حسن انجام تعهدات بانکی',
      identifierNumber: 'BG-MLT-1403-90821',
      issuerBank: 'بانک ملت - شعبه مرکزی بازار',
      issuerBranch: 'کد ۰۶۲۱',
      nominalValueToman: 10000000000,
      haircutPercent: 5.0,
      effectiveValueToman: 9500000000,
      depositDateFa: '۱۴۰۳/۰۱/۱۵',
      maturityDateFa: '۱۴۰۳/۱۰/۱۵',
      daysToMaturity: 115,
      status: 'valid',
      verificationStatus: 'verified_central_bank',
      custodianOfficerFa: 'خزانه اسناد مالی دفتر مرکزی دیدار',
      notesFa: 'استعلام سپام تایید و تمدید دوره سالانه'
    },
    {
      id: 'col-002',
      buyerId: 'org-whs-pars-003',
      buyerOrgNameFa: 'بازرگانی طلا و جواهر پارس زرین',
      collateralType: 'physical_gold_deposit',
      titleFa: 'شمش‌های طلای ۱۰۰۰ گرمی امانی عیار ۹۹۵',
      identifierNumber: 'BAR-AU-995-0982',
      issuerBank: 'امانی خزانه مرکزی دیدار (K09)',
      nominalValueToman: 4500000000,
      haircutPercent: 10.0,
      effectiveValueToman: 4050000000,
      weightGrams: 1000.0,
      carat: 995,
      vaultBagId: 'BAG-SEC-1049-K09',
      depositDateFa: '۱۴۰۳/۰۳/۰۱',
      maturityDateFa: '۱۴۰۳/۱۲/۲۹',
      daysToMaturity: 188,
      status: 'valid',
      verificationStatus: 'in_vault_custody',
      custodianOfficerFa: 'افسر ارشد خزانه‌داری K09',
      notesFa: 'موجود در کیف مهروموم‌شده گاوصندوق اصلی شماره ۲'
    },
    {
      id: 'col-003',
      buyerId: 'org-ret-parnia-004',
      buyerOrgNameFa: 'گالری طلا و جواهرات پرنیا (سعادت‌آباد)',
      collateralType: 'sayad_cheque',
      titleFa: 'چک صیادی بنفش ضمانت خرید طلای ساخته',
      identifierNumber: '7829-1029-4820-9102',
      issuerBank: 'بانک پاسارگاد - شعبه سعادت‌آباد',
      nominalValueToman: 2500000000,
      haircutPercent: 10.0,
      effectiveValueToman: 2250000000,
      depositDateFa: '۱۴۰۳/۰۴/۱۰',
      maturityDateFa: '۱۴۰۳/۰۸/۱۰',
      daysToMaturity: 48,
      status: 'valid',
      verificationStatus: 'verified_central_bank',
      custodianOfficerFa: 'خزانه اسناد مالی دفتر مرکزی',
      notesFa: 'ثبت و تایید کامل در سامانه صیاد بانک مرکزی'
    },
    {
      id: 'col-004',
      buyerId: 'org-ret-parnia-004',
      buyerOrgNameFa: 'گالری طلا و جواهرات پرنیا (سعادت‌آباد)',
      collateralType: 'physical_gold_deposit',
      titleFa: 'طلای آبشده امانی با انگ عیارسنجی معتبر',
      identifierNumber: 'ENG-M750-84912',
      issuerBank: 'خزانه دیدار (K09)',
      nominalValueToman: 1700000000,
      haircutPercent: 10.0,
      effectiveValueToman: 1530000000,
      weightGrams: 377.0,
      carat: 750,
      vaultBagId: 'BAG-SEC-0912-K09',
      depositDateFa: '۱۴۰۳/۰۵/۰۱',
      maturityDateFa: '۱۴۰۳/۱۱/۰۱',
      daysToMaturity: 132,
      status: 'valid',
      verificationStatus: 'in_vault_custody',
      custodianOfficerFa: 'خزانه‌دار تالار مرکزی',
      notesFa: 'تایید انگ ری‌گیری تهران عیار ۷۵۰'
    },
    {
      id: 'col-005',
      buyerId: 'org-ret-zomorod-002',
      buyerOrgNameFa: 'گالری طلا و جواهر زمرد تهران',
      collateralType: 'sayad_cheque',
      titleFa: 'چک صیادی بابت سقف اعتباری فصلی',
      identifierNumber: '6192-3847-1920-5510',
      issuerBank: 'بانک صادرات ایران - شعبه سبزه میدان',
      nominalValueToman: 2200000000,
      haircutPercent: 15.0,
      effectiveValueToman: 1870000000,
      depositDateFa: '۱۴۰۳/۰۳/۱۵',
      maturityDateFa: '۱۴۰۳/۰۷/۱۵',
      daysToMaturity: 23,
      status: 'expiring_soon',
      verificationStatus: 'verified_central_bank',
      custodianOfficerFa: 'خزانه اسناد مالی دفتر مرکزی',
      notesFa: 'موعد سررسید کمتر از ۳۰ روز - نیاز به دریافت فقره جدید'
    },
    {
      id: 'col-006',
      buyerId: 'org-ret-ehsan-005',
      buyerOrgNameFa: 'طلا و جواهرات احسان (ونک)',
      collateralType: 'sayad_cheque',
      titleFa: 'چک صیادی بابت تعهدات تحویل طلا',
      identifierNumber: '4091-8273-6190-2819',
      issuerBank: 'بانک تجارت - شعبه میدان ونک',
      nominalValueToman: 1400000000,
      haircutPercent: 15.0,
      effectiveValueToman: 1190000000,
      depositDateFa: '۱۴۰۳/۰۲/۰۱',
      maturityDateFa: '۱۴۰۳/۰۷/۰۱',
      daysToMaturity: 9,
      status: 'expiring_soon',
      verificationStatus: 'verified_central_bank',
      custodianOfficerFa: 'خزانه اسناد مالی دفتر مرکزی',
      notesFa: 'سررسید در ۹ روز آینده - اخطار تمدید صادر گردید'
    },
    {
      id: 'col-007',
      buyerId: 'org-ret-kimia-006',
      buyerOrgNameFa: 'گالری طلای کیمیا نوین',
      collateralType: 'sayad_cheque',
      titleFa: 'چک صیادی تضامینی معوق',
      identifierNumber: '1902-8374-9102-3819',
      issuerBank: 'بانک ملی ایران - شعبه فلکه دوم صادقیه',
      nominalValueToman: 500000000,
      haircutPercent: 15.0,
      effectiveValueToman: 425000000,
      depositDateFa: '۱۴۰۳/۰۱/۲۰',
      maturityDateFa: '۱۴۰۳/۰۶/۱۰',
      daysToMaturity: -8,
      status: 'matured',
      verificationStatus: 'verified_central_bank',
      custodianOfficerFa: 'امور حقوقی دیدار',
      notesFa: 'سررسید شده و پاس نشده - به واحد پیگیری مطالبات حقوقی ارجاع شد'
    }
  ];

  private alerts: CreditExposureAlert[] = [
    {
      id: 'alt-001',
      buyerId: 'org-ret-kimia-006',
      buyerOrgNameFa: 'گالری طلای کیمیا نوین',
      severity: 'critical',
      alertType: 'limit_breach',
      messageFa: 'تخطی از سقف اعتبار وزنی به میزان ۴.۵ گرم طلا (۱۰۵.۶٪ سقف مجاز)',
      timestampFa: '۱۴۰۳/۰۶/۱۷ - ۱۱:۳۰',
      metricValueText: '۱۰۵.۶٪ سقف مجاز',
      isAcknowledged: false
    },
    {
      id: 'alt-002',
      buyerId: 'org-ret-kimia-006',
      buyerOrgNameFa: 'گالری طلای کیمیا نوین',
      severity: 'critical',
      alertType: 'cheque_due_soon',
      messageFa: 'چک صیادی به شماره شناسه 1902-8374 معوق شده و وصول نگردیده است.',
      timestampFa: '۱۴۰۳/۰۶/۱۱ - ۰۹:۱۵',
      metricValueText: '۸ روز سپری‌شده از سررسید',
      isAcknowledged: false
    },
    {
      id: 'alt-003',
      buyerId: 'org-ret-ehsan-005',
      buyerOrgNameFa: 'طلا و جواهرات احسان (ونک)',
      severity: 'warning',
      alertType: 'limit_breach',
      messageFa: 'نرخ استفاده از اعتبار ریالی به ۸۹.۴٪ سقف تخصیص‌یافته رسیده است.',
      timestampFa: '۱۴۰۳/۰۶/۱۶ - ۱۴:۴۵',
      metricValueText: '۸۹.۴٪ بهره‌برداری ریالی',
      isAcknowledged: false
    },
    {
      id: 'alt-004',
      buyerId: 'org-ret-zomorod-002',
      buyerOrgNameFa: 'گالری طلا و جواهر زمرد تهران',
      severity: 'warning',
      alertType: 'cheque_due_soon',
      messageFa: 'چک صیادی شماره 6192-3847 به مبلغ ۲.۲ میلیارد تومان در ۲۳ روز آینده سررسید می‌شود.',
      timestampFa: '۱۴۰۳/۰۶/۱۵ - ۱۰:۲۰',
      metricValueText: '۲۳ روز تا سررسید',
      isAcknowledged: true
    }
  ];

  private overrideRequests: CreditOverrideRequest[] = [
    {
      id: 'ovr-001',
      requestNumber: 'OVR-1403-082',
      buyerId: 'org-whs-pars-003',
      buyerOrgNameFa: 'بازرگانی طلا و جواهر پارس زرین',
      requestedByFa: 'مهندس اکبری (سرپرست فروش سازمانی)',
      requestDateFa: '۱۴۰۳/۰۶/۱۸',
      overrideType: 'temporary_gold_limit',
      requestedAmountText: 'افزایش موقت سقف وزنی طلا به میزان ۳۰۰ گرم ۷۵۰',
      requestedWeightGrams: 300.0,
      reasonFa: 'پوشش سفارش شمش و النگو عمده برای نمایشگاه طلا، با پشتوانه تودیع ضمانت‌نامه ۱۰ میلیارد تومانی',
      status: 'pending_risk_review',
      currentUtilizationPercent: 69.3,
      existingCollateralCoveragePercent: 130.5
    },
    {
      id: 'ovr-002',
      requestNumber: 'OVR-1403-079',
      buyerId: 'org-ret-parnia-004',
      buyerOrgNameFa: 'گالری طلا و جواهرات پرنیا (سعادت‌آباد)',
      requestedByFa: 'خانم علیزاده (کارشناس ارشد تالار معاملات)',
      requestDateFa: '۱۴۰۳/۰۶/۱۲',
      overrideType: 'temporary_rial_limit',
      requestedAmountText: 'افزایش موقت سقف ریالی به مبلغ ۵۰۰ میلیون تومان',
      requestedValueToman: 500000000,
      reasonFa: 'تسویه خرید اقلام سرویس جدید و پیش‌پرداخت تسویه ترکیبی',
      status: 'approved',
      currentUtilizationPercent: 47.2,
      existingCollateralCoveragePercent: 154.2,
      reviewedByFa: 'مهندس حسینی (مدیر ارشد ریسک)',
      approvedByFa: 'دکتر صمدی (کمیته اعتبارات)',
      decisionDateFa: '۱۴۰۳/۰۶/۱۳',
      decisionNoteFa: 'با توجه به پوشش وثیقه‌ای ۱۵۴ درصدی و سابقه عالی، تایید شد.',
      validUntilFa: '۱۴۰۳/۰۶/۳۱'
    }
  ];

  private recalculateMetrics(): K14Metrics {
    const totalCreditRial = this.creditProfiles.reduce((s, p) => s + p.rialCreditLimitToman, 0);
    const totalExposureRial = this.creditProfiles.reduce((s, p) => s + p.rialExposureToman, 0);
    const totalCreditGold = this.creditProfiles.reduce((s, p) => s + p.goldCreditLimitGrams, 0);
    const totalExposureGold = this.creditProfiles.reduce((s, p) => s + p.goldExposureGrams, 0);
    const totalCollaterals = this.collaterals
      .filter((c) => c.status === 'valid' || c.status === 'expiring_soon')
      .reduce((s, c) => s + c.effectiveValueToman, 0);

    const activeCount = this.creditProfiles.filter((p) => p.status === 'active').length;
    const warningCount = this.creditProfiles.filter((p) => p.status === 'warning').length;
    const lockedCount = this.creditProfiles.filter((p) => p.status === 'credit_locked').length;
    const pendingOverrides = this.overrideRequests.filter(
      (o) => o.status === 'pending_risk_review' || o.status === 'pending_board_approval'
    ).length;

    return {
      totalCreditExtendedRialToman: totalCreditRial,
      totalExposureRialToman: totalExposureRial,
      rialUtilizationPercent: totalCreditRial > 0 ? Math.round((totalExposureRial / totalCreditRial) * 1000) / 10 : 0,
      totalCreditExtendedGoldGrams: Math.round(totalCreditGold * 10) / 10,
      totalExposureGoldGrams: Math.round(totalExposureGold * 10) / 10,
      goldUtilizationPercent: totalCreditGold > 0 ? Math.round((totalExposureGold / totalCreditGold) * 1000) / 10 : 0,
      totalCollateralsHeldToman: totalCollaterals,
      overallCoverageRatioPercent: totalExposureRial > 0 ? Math.round((totalCollaterals / (totalExposureRial + (totalExposureGold * 4500000))) * 1000) / 10 : 100,
      activeProfilesCount: activeCount,
      warningProfilesCount: warningCount,
      lockedProfilesCount: lockedCount,
      pendingOverridesCount: pendingOverrides
    };
  }

  public getData(): K14DataPayload {
    return {
      metrics: this.recalculateMetrics(),
      creditProfiles: [...this.creditProfiles],
      collaterals: [...this.collaterals],
      alerts: [...this.alerts],
      overrideRequests: [...this.overrideRequests]
    };
  }

  public updateLimits(
    buyerId: string,
    goldLimitGrams: number,
    rialLimitToman: number,
    operator: string
  ): BuyerCreditProfile {
    const profile = this.creditProfiles.find((p) => p.buyerId === buyerId);
    if (!profile) throw new Error('خریدار با شناسه مشخص‌شده یافت نشد.');

    profile.goldCreditLimitGrams = goldLimitGrams;
    profile.goldAvailableCreditGrams = Math.max(0, goldLimitGrams - profile.goldExposureGrams);
    profile.goldUtilizationPercent = goldLimitGrams > 0 ? Math.round((profile.goldExposureGrams / goldLimitGrams) * 1000) / 10 : 0;

    profile.rialCreditLimitToman = rialLimitToman;
    profile.rialAvailableCreditToman = Math.max(0, rialLimitToman - profile.rialExposureToman);
    profile.rialUtilizationPercent = rialLimitToman > 0 ? Math.round((profile.rialExposureToman / rialLimitToman) * 1000) / 10 : 0;

    // Refresh status if not credit_locked
    if (profile.status !== 'credit_locked') {
      if (profile.goldUtilizationPercent > 90 || profile.rialUtilizationPercent > 90) {
        profile.status = 'warning';
      } else {
        profile.status = 'active';
      }
    }

    profile.lastReviewDateFa = 'امروز';
    profile.creditOfficerFa = operator || profile.creditOfficerFa;

    return profile;
  }

  public toggleCreditLock(
    buyerId: string,
    lock: boolean,
    reasonFa?: string
  ): BuyerCreditProfile {
    const profile = this.creditProfiles.find((p) => p.buyerId === buyerId);
    if (!profile) throw new Error('خریدار مشخص‌شده یافت نشد.');

    if (lock) {
      profile.status = 'credit_locked';
      profile.lockReasonFa = reasonFa || 'قفل دستی اعتباری توسط مدیریت ریسک';
    } else {
      profile.status = profile.goldUtilizationPercent > 80 || profile.rialUtilizationPercent > 80 ? 'warning' : 'active';
      profile.lockReasonFa = undefined;
    }

    return profile;
  }

  public addCollateral(payload: {
    buyerId: string;
    collateralType: CollateralItem['collateralType'];
    titleFa: string;
    identifierNumber: string;
    issuerBank: string;
    nominalValueToman: number;
    haircutPercent?: number;
    weightGrams?: number;
    carat?: number;
    vaultBagId?: string;
    depositDateFa: string;
    maturityDateFa: string;
    custodianOfficerFa: string;
    notesFa?: string;
  }): CollateralItem {
    const buyer = this.creditProfiles.find((p) => p.buyerId === payload.buyerId);
    if (!buyer) throw new Error('خریدار یافت نشد.');

    const haircut = payload.haircutPercent !== undefined ? payload.haircutPercent : (payload.collateralType === 'physical_gold_deposit' ? 10 : payload.collateralType === 'bank_guarantee' ? 5 : 15);
    const effectiveVal = Math.round(payload.nominalValueToman * (1 - (haircut / 100)));

    const newCollateral: CollateralItem = {
      id: `col-${Date.now().toString().slice(-4)}`,
      buyerId: buyer.buyerId,
      buyerOrgNameFa: buyer.buyerOrgNameFa,
      collateralType: payload.collateralType,
      titleFa: payload.titleFa,
      identifierNumber: payload.identifierNumber,
      issuerBank: payload.issuerBank,
      nominalValueToman: payload.nominalValueToman,
      haircutPercent: haircut,
      effectiveValueToman: effectiveVal,
      weightGrams: payload.weightGrams,
      carat: payload.carat,
      vaultBagId: payload.vaultBagId,
      depositDateFa: payload.depositDateFa || 'امروز',
      maturityDateFa: payload.maturityDateFa,
      daysToMaturity: 90,
      status: 'valid',
      verificationStatus: payload.collateralType === 'physical_gold_deposit' ? 'in_vault_custody' : 'verified_central_bank',
      custodianOfficerFa: payload.custodianOfficerFa || 'خزانه اسناد مالی دفتر مرکزی',
      notesFa: payload.notesFa
    };

    this.collaterals.unshift(newCollateral);

    // Update buyer's total collaterals
    buyer.collateralTotalNominalToman += newCollateral.nominalValueToman;
    buyer.collateralEffectiveValueToman += newCollateral.effectiveValueToman;
    const totalExposureEst = buyer.rialExposureToman + (buyer.goldExposureGrams * 4500000);
    buyer.collateralCoveragePercent = totalExposureEst > 0 ? Math.round((buyer.collateralEffectiveValueToman / totalExposureEst) * 1000) / 10 : 200;

    return newCollateral;
  }

  public releaseCollateral(colId: string, officerName: string): CollateralItem {
    const col = this.collaterals.find((c) => c.id === colId);
    if (!col) throw new Error('وثیقه مورد نظر یافت نشد.');

    col.status = 'released';
    col.notesFa = `${col.notesFa || ''} [آزادسازی شده توسط ${officerName} در تاریخ امروز]`;

    // Deduct from buyer
    const buyer = this.creditProfiles.find((p) => p.buyerId === col.buyerId);
    if (buyer) {
      buyer.collateralTotalNominalToman = Math.max(0, buyer.collateralTotalNominalToman - col.nominalValueToman);
      buyer.collateralEffectiveValueToman = Math.max(0, buyer.collateralEffectiveValueToman - col.effectiveValueToman);
      const totalExposureEst = buyer.rialExposureToman + (buyer.goldExposureGrams * 4500000);
      buyer.collateralCoveragePercent = totalExposureEst > 0 ? Math.round((buyer.collateralEffectiveValueToman / totalExposureEst) * 1000) / 10 : 100;
    }

    return col;
  }

  public createOverrideRequest(payload: {
    buyerId: string;
    requestedByFa: string;
    overrideType: CreditOverrideRequest['overrideType'];
    requestedAmountText: string;
    requestedValueToman?: number;
    requestedWeightGrams?: number;
    reasonFa: string;
  }): CreditOverrideRequest {
    const buyer = this.creditProfiles.find((p) => p.buyerId === payload.buyerId);
    if (!buyer) throw new Error('خریدار یافت نشد.');

    const newRequest: CreditOverrideRequest = {
      id: `ovr-${Date.now().toString().slice(-4)}`,
      requestNumber: `OVR-1403-${Math.floor(100 + Math.random() * 900)}`,
      buyerId: buyer.buyerId,
      buyerOrgNameFa: buyer.buyerOrgNameFa,
      requestedByFa: payload.requestedByFa,
      requestDateFa: 'امروز',
      overrideType: payload.overrideType,
      requestedAmountText: payload.requestedAmountText,
      requestedValueToman: payload.requestedValueToman,
      requestedWeightGrams: payload.requestedWeightGrams,
      reasonFa: payload.reasonFa,
      status: 'pending_risk_review',
      currentUtilizationPercent: Math.max(buyer.goldUtilizationPercent, buyer.rialUtilizationPercent),
      existingCollateralCoveragePercent: buyer.collateralCoveragePercent
    };

    this.overrideRequests.unshift(newRequest);
    return newRequest;
  }

  public decideOverride(
    requestId: string,
    decision: 'approved' | 'rejected',
    approverName: string,
    noteFa: string
  ): CreditOverrideRequest {
    const req = this.overrideRequests.find((r) => r.id === requestId);
    if (!req) throw new Error('درخواست استثنا یافت نشد.');

    req.status = decision;
    req.approvedByFa = approverName;
    req.decisionDateFa = 'امروز';
    req.decisionNoteFa = noteFa;
    req.validUntilFa = decision === 'approved' ? '۱۴۰۳/۰۷/۱۵' : undefined;

    // If approved, apply temporary limit bump to buyer profile
    if (decision === 'approved') {
      const buyer = this.creditProfiles.find((p) => p.buyerId === req.buyerId);
      if (buyer) {
        if (req.requestedWeightGrams) {
          buyer.goldCreditLimitGrams += req.requestedWeightGrams;
          buyer.goldAvailableCreditGrams += req.requestedWeightGrams;
          buyer.goldUtilizationPercent = Math.round((buyer.goldExposureGrams / buyer.goldCreditLimitGrams) * 1000) / 10;
        }
        if (req.requestedValueToman) {
          buyer.rialCreditLimitToman += req.requestedValueToman;
          buyer.rialAvailableCreditToman += req.requestedValueToman;
          buyer.rialUtilizationPercent = Math.round((buyer.rialExposureToman / buyer.rialCreditLimitToman) * 1000) / 10;
        }
      }
    }

    return req;
  }

  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.isAcknowledged = true;
    }
  }

  // --- K13 - K14 Integration Methods ---

  public findBuyerProfile(query: { buyerId?: string; nationalId?: string; nameFa?: string }): BuyerCreditProfile | undefined {
    return this.creditProfiles.find((p) => {
      if (query.buyerId && (p.buyerId.toLowerCase() === query.buyerId.toLowerCase() || p.buyerId.includes(query.buyerId) || query.buyerId.includes(p.buyerId))) {
        return true;
      }
      if (query.nationalId && p.nationalId === query.nationalId) {
        return true;
      }
      if (query.nameFa && (p.buyerOrgNameFa.includes(query.nameFa) || query.nameFa.includes(p.buyerOrgNameFa))) {
        return true;
      }
      return false;
    });
  }

  public checkCreditFeasibility(buyerQuery: { buyerId?: string; nationalId?: string; nameFa?: string }, goldGrams: number, rialToman: number): {
    allowed: boolean;
    reasonFa: string;
    profile?: BuyerCreditProfile;
    requiresOverride: boolean;
    projectedGoldUtilization?: number;
    projectedRialUtilization?: number;
    projectedGoldExposureGrams?: number;
    projectedRialExposureToman?: number;
  } {
    const profile = this.findBuyerProfile(buyerQuery);
    if (!profile) {
      return {
        allowed: true,
        requiresOverride: false,
        reasonFa: 'خریدار پرونده اعتباری مستقیم ندارد (تایید در سقف استاندارد آزمایشی)'
      };
    }

    if (profile.status === 'credit_locked') {
      return {
        allowed: false,
        profile,
        requiresOverride: true,
        reasonFa: `حساب خریدار (${profile.buyerOrgNameFa}) به دلیل ریسک اعتباری قفل است: ${profile.lockReasonFa || 'مسدودی توسط مدیریت ریسک'}`
      };
    }

    const projectedGoldExposure = parseFloat((profile.goldExposureGrams + goldGrams).toFixed(3));
    const projectedRialExposure = profile.rialExposureToman + rialToman;

    const projectedGoldUtil = profile.goldCreditLimitGrams > 0
      ? Math.round((projectedGoldExposure / profile.goldCreditLimitGrams) * 1000) / 10
      : 0;
    const projectedRialUtil = profile.rialCreditLimitToman > 0
      ? Math.round((projectedRialExposure / profile.rialCreditLimitToman) * 1000) / 10
      : 0;

    if (projectedGoldUtil > 100) {
      return {
        allowed: false,
        profile,
        requiresOverride: true,
        projectedGoldUtilization: projectedGoldUtil,
        projectedRialUtilization: projectedRialUtil,
        projectedGoldExposureGrams: projectedGoldExposure,
        projectedRialExposureToman: projectedRialExposure,
        reasonFa: `تخطی از سقف اعتبار وزنی طلا: سهم وزنی فاکتور (${goldGrams.toFixed(2)} گرم) مجموع مواجهه را به ${projectedGoldExposure.toFixed(2)} گرم (${projectedGoldUtil}٪ سقف) می‌رساند. نیاز به مجوز استثنا (اصل ۴چشم) دارد.`
      };
    }

    if (projectedRialUtil > 100) {
      return {
        allowed: false,
        profile,
        requiresOverride: true,
        projectedGoldUtilization: projectedGoldUtil,
        projectedRialUtilization: projectedRialUtil,
        projectedGoldExposureGrams: projectedGoldExposure,
        projectedRialExposureToman: projectedRialExposure,
        reasonFa: `تخطی از سقف اعتبار ریالی: سهم ریالی فاکتور (${(rialToman / 1000000).toLocaleString('fa-IR')} میلیون تومان) مجموع تعهد ریالی را به ${(projectedRialExposure / 1000000).toLocaleString('fa-IR')} م تومان (${projectedRialUtil}٪ سقف) می‌رساند.`
      };
    }

    return {
      allowed: true,
      profile,
      requiresOverride: false,
      projectedGoldUtilization: projectedGoldUtil,
      projectedRialUtilization: projectedRialUtil,
      projectedGoldExposureGrams: projectedGoldExposure,
      projectedRialExposureToman: projectedRialExposure,
      reasonFa: 'پوشش اعتباری و تضامین کافی است؛ نهایی‌سازی مجاز است.'
    };
  }

  public recordInvoiceExposure(
    buyerQuery: { buyerId?: string; nationalId?: string; nameFa?: string },
    goldGrams: number,
    rialToman: number,
    invoiceNumber: string
  ): { profile: BuyerCreditProfile; alert?: CreditExposureAlert } {
    let profile = this.findBuyerProfile(buyerQuery);
    if (!profile) {
      // Auto-provision an active profile for this buyer
      profile = {
        buyerId: buyerQuery.buyerId || `org-ret-${Date.now().toString().slice(-4)}`,
        buyerOrgNameFa: buyerQuery.nameFa || 'خریدار معتبر طلا',
        nationalId: buyerQuery.nationalId || '10103500000',
        economicCode: '411589000000',
        tier: 'T2',
        phone: '021-55000000',
        addressFa: 'تهران، بازار طلا',
        goldCreditLimitGrams: Math.max(300, goldGrams * 2.5),
        goldExposureGrams: 0,
        goldAvailableCreditGrams: Math.max(300, goldGrams * 2.5),
        goldUtilizationPercent: 0,
        rialCreditLimitToman: Math.max(2000000000, rialToman * 2),
        rialExposureToman: 0,
        rialAvailableCreditToman: Math.max(2000000000, rialToman * 2),
        rialUtilizationPercent: 0,
        creditScore: 82,
        riskLevel: 'low',
        status: 'active',
        collateralTotalNominalToman: Math.max(2500000000, rialToman * 2.2),
        collateralEffectiveValueToman: Math.max(2125000000, Math.round(rialToman * 1.9)),
        collateralCoveragePercent: 125,
        creditOfficerFa: 'سیستم اعتبارات خودکار K14',
        lastReviewDateFa: 'امروز',
        nextReviewDateFa: '۱۴۰۳/۱۲/۲۹',
        activeOrdersCount: 0,
        unsettledInvoicesCount: 0
      };
      this.creditProfiles.push(profile);
    }

    // Apply incremental exposure
    profile.goldExposureGrams = parseFloat((profile.goldExposureGrams + goldGrams).toFixed(3));
    profile.goldAvailableCreditGrams = Math.max(0, parseFloat((profile.goldCreditLimitGrams - profile.goldExposureGrams).toFixed(3)));
    profile.goldUtilizationPercent = profile.goldCreditLimitGrams > 0
      ? Math.round((profile.goldExposureGrams / profile.goldCreditLimitGrams) * 1000) / 10
      : 100;

    profile.rialExposureToman = profile.rialExposureToman + rialToman;
    profile.rialAvailableCreditToman = Math.max(0, profile.rialCreditLimitToman - profile.rialExposureToman);
    profile.rialUtilizationPercent = profile.rialCreditLimitToman > 0
      ? Math.round((profile.rialExposureToman / profile.rialCreditLimitToman) * 1000) / 10
      : 100;

    profile.unsettledInvoicesCount += 1;
    profile.activeOrdersCount += 1;

    // Recalculate collateral coverage percent
    const estimatedTotalExposureToman = profile.rialExposureToman + (profile.goldExposureGrams * 4350000);
    if (estimatedTotalExposureToman > 0) {
      profile.collateralCoveragePercent = Math.round((profile.collateralEffectiveValueToman / estimatedTotalExposureToman) * 1000) / 10;
    }

    // Check alerts and status
    let alert: CreditExposureAlert | undefined;
    const maxUtil = Math.max(profile.goldUtilizationPercent, profile.rialUtilizationPercent);

    if (maxUtil >= 90) {
      profile.status = 'warning';
      alert = {
        id: `alt-${Date.now()}`,
        buyerId: profile.buyerId,
        buyerOrgNameFa: profile.buyerOrgNameFa,
        severity: maxUtil > 100 ? 'critical' : 'warning',
        alertType: 'limit_breach',
        messageFa: `افزایش مواجهه اعتباری ناشی از نهایی‌سازی فاکتور ${invoiceNumber}. ضریب بهره‌برداری به ${maxUtil}٪ رسید.`,
        metricValueText: `${maxUtil}٪ سقف اعتباری`,
        timestampFa: 'هم‌اکنون',
        isAcknowledged: false
      };
      this.alerts.unshift(alert);
    } else if (profile.status !== 'credit_locked') {
      profile.status = 'active';
    }

    return { profile, alert };
  }
}

export const k14Storage = new K14Storage();
