/**
 * Didar Gold Platform - Kernel 15 (K15) Storage Engine
 * Financial Obligations & Dual Subledgers (تعهد مالی و دفتر دوگانه)
 * Manages linked gold-weight (grams at 750/995 purity) and fiat currency (Toman) subledgers.
 */

import {
  K15DataPayload,
  PartyAccountBalance,
  DualJournalVoucher,
  DualTrialBalance,
  K15SummaryMetrics,
  DualVoucherType
} from '../src/types/k15.js';

class K15Storage {
  private referenceGoldPriceToman: number = 4250000; // ۴,۲۵۰,۰۰۰ تومان به ازای هر گرم طلای ۱۸ عیار (۷۵۰)

  private partyBalances: PartyAccountBalance[] = [
    {
      id: 'acc-01',
      partyId: 'org-buyer-01',
      partyNameFa: 'گالری طلا و جواهر زمرد تهران',
      nationalId: '10103456781',
      accountType: 'retailer',
      accountTypeFa: 'خرده‌فروش همکار (ویترین‌دار)',
      phone: '021-22019988',
      goldBalanceGrams750: 142.650, // بدهکار طلا
      goldDebitTotalGrams: 520.400,
      goldCreditTotalGrams: 377.750,
      fiatBalanceToman: 385000000,  // بدهکار ریالی
      fiatDebitTotalToman: 980000000,
      fiatCreditTotalToman: 595000000,
      totalObligationValuationToman: 385000000 + (142.650 * 4250000), // ~991,262,500
      aging: {
        currentGrams: 95.200,
        currentToman: 240000000,
        overdue1To15Grams: 47.450,
        overdue1To15Toman: 145000000,
        overdue16To30Grams: 0,
        overdue16To30Toman: 0,
        overdue30PlusGrams: 0,
        overdue30PlusToman: 0,
        oldestOverdueDateFa: '۱۴۰۳/۰۹/۰۲',
        weightedAverageDueDays: 8
      },
      status: 'overdue',
      statusFa: 'دارای سررسید معوق (۱ تا ۱۵ روز)',
      lastTransactionDateFa: '۱۴۰۳/۰۹/۰۸ ۱۱:۴۵',
      zarrinSubledgerCode: '110201-0012'
    },
    {
      id: 'acc-02',
      partyId: 'org-buyer-02',
      partyNameFa: 'جواهرسازی کاخ پارس',
      nationalId: '10108899221',
      accountType: 'retailer',
      accountTypeFa: 'خرده‌فروش ممتاز VIP',
      phone: '021-88771122',
      goldBalanceGrams750: 64.120, // بدهکار طلا
      goldDebitTotalGrams: 310.800,
      goldCreditTotalGrams: 246.680,
      fiatBalanceToman: 112000000,
      fiatDebitTotalToman: 420000000,
      fiatCreditTotalToman: 308000000,
      totalObligationValuationToman: 112000000 + (64.120 * 4250000),
      aging: {
        currentGrams: 64.120,
        currentToman: 112000000,
        overdue1To15Grams: 0,
        overdue1To15Toman: 0,
        overdue16To30Grams: 0,
        overdue16To30Toman: 0,
        overdue30PlusGrams: 0,
        overdue30PlusToman: 0,
        oldestOverdueDateFa: '۱۴۰۳/۰۹/۱۵',
        weightedAverageDueDays: 0
      },
      status: 'normal',
      statusFa: 'مانده جاری در مهلت تسویه',
      lastTransactionDateFa: '۱۴۰۳/۰۹/۰۸ ۰۹:۲۰',
      zarrinSubledgerCode: '110201-0019'
    },
    {
      id: 'acc-03',
      partyId: 'org-buyer-03',
      partyNameFa: 'طلا و جواهر نفیس تجریش',
      nationalId: '10104433215',
      accountType: 'retailer',
      accountTypeFa: 'خرده‌فروش همکار',
      phone: '021-22718899',
      goldBalanceGrams750: 0, // تسویه کامل
      goldDebitTotalGrams: 450.000,
      goldCreditTotalGrams: 450.000,
      fiatBalanceToman: 0,
      fiatDebitTotalToman: 650000000,
      fiatCreditTotalToman: 650000000,
      totalObligationValuationToman: 0,
      aging: {
        currentGrams: 0,
        currentToman: 0,
        overdue1To15Grams: 0,
        overdue1To15Toman: 0,
        overdue16To30Grams: 0,
        overdue16To30Toman: 0,
        overdue30PlusGrams: 0,
        overdue30PlusToman: 0,
        weightedAverageDueDays: 0
      },
      status: 'clear',
      statusFa: 'حساب کاملاً تراز و تسویه شده',
      lastTransactionDateFa: '۱۴۰۳/۰۹/۰۷ ۱۶:۰۰',
      zarrinSubledgerCode: '110201-0035'
    },
    {
      id: 'acc-04',
      partyId: 'org-wholesaler-01',
      partyNameFa: 'بنکداری زرین کیان مشهد',
      nationalId: '14008765432',
      accountType: 'wholesaler',
      accountTypeFa: 'بنکدار و خریدار عمده استانی',
      phone: '051-38554433',
      goldBalanceGrams750: 318.500, // بدهکار طلا
      goldDebitTotalGrams: 1250.000,
      goldCreditTotalGrams: 931.500,
      fiatBalanceToman: 840000000,  // بدهکار ریال
      fiatDebitTotalToman: 2400000000,
      fiatCreditTotalToman: 1560000000,
      totalObligationValuationToman: 840000000 + (318.500 * 4250000),
      aging: {
        currentGrams: 180.000,
        currentToman: 480000000,
        overdue1To15Grams: 88.500,
        overdue1To15Toman: 220000000,
        overdue16To30Grams: 50.000,
        overdue16To30Toman: 140000000,
        overdue30PlusGrams: 0,
        overdue30PlusToman: 0,
        oldestOverdueDateFa: '۱۴۰۳/۰۸/۱۸',
        weightedAverageDueDays: 14
      },
      status: 'due_soon',
      statusFa: 'سررسید اقساط تهاتری طلا و ریال',
      lastTransactionDateFa: '۱۴۰۳/۰۹/۰۶ ۱۴:۱۰',
      zarrinSubledgerCode: '110202-0004'
    },
    {
      id: 'acc-05',
      partyId: 'org-supplier-01',
      partyNameFa: 'کارگاه تولیدی و زرگری صفوی اصفهان',
      nationalId: '10260456123',
      accountType: 'supplier',
      accountTypeFa: 'تأمین‌کننده طلای ساخته و کارگاه',
      phone: '031-32214455',
      goldBalanceGrams750: -85.200, // بستانکار طلا (ما به کارگاه طلا بدهکاریم)
      goldDebitTotalGrams: 850.000,
      goldCreditTotalGrams: 935.200,
      fiatBalanceToman: -145000000, // بستانکار ریالی (طلب بابت اجرت ساخت)
      fiatDebitTotalToman: 520000000,
      fiatCreditTotalToman: 665000000,
      totalObligationValuationToman: -145000000 - (85.200 * 4250000),
      aging: {
        currentGrams: -85.200,
        currentToman: -145000000,
        overdue1To15Grams: 0,
        overdue1To15Toman: 0,
        overdue16To30Grams: 0,
        overdue16To30Toman: 0,
        overdue30PlusGrams: 0,
        overdue30PlusToman: 0,
        weightedAverageDueDays: 0
      },
      status: 'normal',
      statusFa: 'بستانکار تعهد تحویل طلای آبشده و اجرت',
      lastTransactionDateFa: '۱۴۰۳/۰۹/۰۵ ۱۱:۲۰',
      zarrinSubledgerCode: '210101-0008'
    }
  ];

  private vouchers: DualJournalVoucher[] = [
    {
      id: 'voc-1001',
      voucherNumber: 'VOC-DUAL-1403-1001',
      voucherDateFa: '۱۴۰۳/۰۹/۰۸',
      partyId: 'org-buyer-01',
      partyNameFa: 'گالری طلا و جواهر زمرد تهران',
      voucherType: 'invoice_dispatch',
      voucherTypeFa: 'تحویل کالای فاکتور رسمی (K13)',
      titleFa: 'سند تحویل صورتحساب INV-1403-7740 به کاردکس زرین',
      descriptionFa: 'تحویل ۸۵.۵ گرم النگو طلا ۱۸ عیار، ثبت بدهکاری وزنی طلا و تسویه ترکیبی',
      referenceDocNumber: 'INV-1403-7740',
      sourceKernel: 'K13',
      goldDebitGrams: 85.500,
      goldCreditGrams: 0,
      goldCarat: 750,
      goldEquivalent750Grams: 85.500,
      fiatDebitToman: 153147108,
      fiatCreditToman: 0,
      runningGoldBalanceGrams: 142.650,
      runningFiatBalanceToman: 385000000,
      registeredBy: 'سرویس اتصال خودکار K13-K14',
      zarrinVoucherRef: 'SANAD-ZR-1403-8821',
      status: 'reconciled',
      statusFa: 'تطبیق و قطعی در زرین'
    },
    {
      id: 'voc-1001-b',
      voucherNumber: 'VOC-DUAL-1403-1001-B',
      voucherDateFa: '۱۴۰۳/۰۹/۰۷',
      partyId: 'org-ret-ehsan-005',
      partyNameFa: 'طلا و جواهرات احسان (ونک)',
      voucherType: 'invoice_dispatch',
      voucherTypeFa: 'تحویل کالای فاکتور رسمی (K13)',
      titleFa: 'سند تحویل صورتحساب INV-1403-8819 سرویس طلا',
      descriptionFa: 'تحویل ۱۱۰ گرم سرویس طلا، ثبت ۵۵ گرم تعهد وزنی و ۲۴۸,۹۱۶,۲۵۰ تومان ریالی',
      referenceDocNumber: 'INV-1403-8819',
      sourceKernel: 'K13',
      goldDebitGrams: 110.000,
      goldCreditGrams: 0,
      goldCarat: 750,
      goldEquivalent750Grams: 110.000,
      fiatDebitToman: 248916250,
      fiatCreditToman: 0,
      runningGoldBalanceGrams: 132.000,
      runningFiatBalanceToman: 760000000,
      registeredBy: 'سرویس اتصال خودکار K13-K14',
      zarrinVoucherRef: 'SANAD-ZR-1403-8825',
      status: 'posted',
      statusFa: 'ثبت قطعی در دفتر'
    },
    {
      id: 'voc-1001-c',
      voucherNumber: 'VOC-DUAL-1403-1001-C',
      voucherDateFa: '۱۴۰۳/۰۹/۰۵',
      partyId: 'org-whs-pars-003',
      partyNameFa: 'بازرگانی طلا و جواهر پارس زرین',
      voucherType: 'invoice_dispatch',
      voucherTypeFa: 'تحویل کالای فاکتور رسمی (K13)',
      titleFa: 'سند تحویل صورتحساب INV-1403-9042 شمش طلا',
      descriptionFa: 'ثبت کاردکس انبار با وزن ۲۴۸.۵ گرم بر اساس باسکول تحویل فیزیکی خزانه‌داری (مغایرت ۱.۵ گرم)',
      referenceDocNumber: 'INV-1403-9042',
      sourceKernel: 'K13',
      goldDebitGrams: 248.500, // 1.5g delta against invoice 250.0g
      goldCreditGrams: 0,
      goldCarat: 750,
      goldEquivalent750Grams: 248.500,
      fiatDebitToman: 21050000,
      fiatCreditToman: 0,
      runningGoldBalanceGrams: 1040.000,
      runningFiatBalanceToman: 5420000000,
      registeredBy: 'خزانه‌داری فیزیکی دیدار',
      zarrinVoucherRef: 'SANAD-ZR-1403-8828',
      status: 'posted',
      statusFa: 'مغایرت در انتظار تعدیل وزنی'
    },
    {
      id: 'voc-1001-d',
      voucherNumber: 'VOC-DUAL-1403-1001-D',
      voucherDateFa: '۱۴۰۳/۰۸/۱۰',
      partyId: 'org-ret-kimia-006',
      partyNameFa: 'گالری طلای کیمیا نوین',
      voucherType: 'invoice_dispatch',
      voucherTypeFa: 'تحویل کالای فاکتور رسمی (K13)',
      titleFa: 'سند تحویل صورتحساب INV-1403-6620 انگشتر ۱۸ عیار',
      descriptionFa: 'فروش اعتباری ریالی با تعهد تسویه ۱۵ روزه (معوق شده)',
      referenceDocNumber: 'INV-1403-6620',
      sourceKernel: 'K13',
      goldDebitGrams: 45.000,
      goldCreditGrams: 0,
      goldCarat: 750,
      goldEquivalent750Grams: 45.000,
      fiatDebitToman: 204088500,
      fiatCreditToman: 0,
      runningGoldBalanceGrams: 84.500,
      runningFiatBalanceToman: 430000000,
      registeredBy: 'سامانه فروش اعتباری K13',
      zarrinVoucherRef: 'SANAD-ZR-1403-8812',
      status: 'posted',
      statusFa: 'مطالبه معوق و پیگیری حقوقی'
    },
    {
      id: 'voc-1002',
      voucherNumber: 'VOC-DUAL-1403-1002',
      voucherDateFa: '۱۴۰۳/۰۹/۰۷',
      partyId: 'org-buyer-01',
      partyNameFa: 'گالری طلا و جواهر زمرد تهران',
      voucherType: 'gold_melted_settlement',
      voucherTypeFa: 'تسویه فیزیکی طلای آبشده',
      titleFa: 'دریافت شمش آبشده عیار ۷۵۰ به شماره پلاک انگ ۳۸۴۲',
      descriptionFa: 'تسویه وزنی و تودیع در خزانه‌داری مرکزی دیدار جهت کسر از بدهی وزنی',
      referenceDocNumber: 'REC-GLD-1403-441',
      sourceKernel: 'K08',
      goldDebitGrams: 0,
      goldCreditGrams: 50.000,
      goldCarat: 750,
      goldEquivalent750Grams: 50.000,
      fiatDebitToman: 0,
      fiatCreditToman: 0,
      runningGoldBalanceGrams: 57.150,
      runningFiatBalanceToman: 242500000,
      registeredBy: 'امین اموال خزانه‌داری (K09)',
      zarrinVoucherRef: 'ZRN-VOC-1403-9098',
      status: 'reconciled',
      statusFa: 'تطبیق و قطعی در زرین'
    },
    {
      id: 'voc-1003',
      voucherNumber: 'VOC-DUAL-1403-1003',
      voucherDateFa: '۱۴۰۳/۰۹/۰۷',
      partyId: 'org-buyer-01',
      partyNameFa: 'گالری طلا و جواهر زمرد تهران',
      voucherType: 'fiat_bank_transfer',
      voucherTypeFa: 'واریز نقدی بانکی (ساتنا)',
      titleFa: 'واریز وجه نقد به حساب شبای متمرکز شرکت دیدار',
      descriptionFa: 'تسویه ریالی اجرت ساخت و مالیات بر ارزش افزوده فاکتورهای آبان‌ماه',
      referenceDocNumber: 'PAY-SATNA-998124',
      sourceKernel: 'K15',
      goldDebitGrams: 0,
      goldCreditGrams: 0,
      goldCarat: 750,
      goldEquivalent750Grams: 0,
      fiatDebitToman: 0,
      fiatCreditToman: 150000000,
      runningGoldBalanceGrams: 107.150,
      runningFiatBalanceToman: 242500000,
      registeredBy: 'واحد مالی و حسابداری',
      zarrinVoucherRef: 'ZRN-VOC-1403-9092',
      status: 'reconciled',
      statusFa: 'تطبیق و قطعی در زرین'
    },
    {
      id: 'voc-1004',
      voucherNumber: 'VOC-DUAL-1403-1004',
      voucherDateFa: '۱۴۰۳/۰۹/۰۶',
      partyId: 'org-wholesaler-01',
      partyNameFa: 'بنکداری زرین کیان مشهد',
      voucherType: 'netting_conversion',
      voucherTypeFa: 'سند تهاتر و تبدیل مانده با نرخ مظنه',
      titleFa: 'تهاتر بخشی از بدهی ریالی به معادل وزنی طلا ۱۸ عیار',
      descriptionFa: 'تبدیل ۲۱۲,۵۰۰,۰۰۰ تومان بدهی ریالی به ۵۰ گرم طلای ۱۸ عیار بر پایه مظنه ۴,۲۵۰,۰۰۰ تومان',
      referenceDocNumber: 'NET-1403-018',
      sourceKernel: 'K15',
      goldDebitGrams: 50.000,
      goldCreditGrams: 0,
      goldCarat: 750,
      goldEquivalent750Grams: 50.000,
      fiatDebitToman: 0,
      fiatCreditToman: 212500000,
      runningGoldBalanceGrams: 318.500,
      runningFiatBalanceToman: 840000000,
      registeredBy: 'کمیته ریسک و تهاتر دیدار',
      zarrinVoucherRef: 'ZRN-VOC-1403-9077',
      status: 'posted',
      statusFa: 'ثبت قطعی در دفتر'
    },
    {
      id: 'voc-1005',
      voucherNumber: 'VOC-DUAL-1403-1005',
      voucherDateFa: '۱۴۰۳/۰۹/۰۵',
      partyId: 'org-buyer-02',
      partyNameFa: 'جواهرسازی کاخ پارس',
      voucherType: 'invoice_dispatch',
      voucherTypeFa: 'تحویل کالای فاکتور رسمی (K13)',
      titleFa: 'تحویل سفارش ۱۸.۴ گرم گردنبند ونکلیف ۱۸ عیار',
      descriptionFa: 'ثبت تعهد وزنی طلا و اجرت ساخت ۲۹,۵۰۰,۰۰۰ تومان',
      referenceDocNumber: 'INV-1403-9902',
      sourceKernel: 'K13',
      goldDebitGrams: 18.400,
      goldCreditGrams: 0,
      goldCarat: 750,
      goldEquivalent750Grams: 18.400,
      fiatDebitToman: 29500000,
      fiatCreditToman: 0,
      runningGoldBalanceGrams: 64.120,
      runningFiatBalanceToman: 112000000,
      registeredBy: 'سرویس اتصال خودکار K13-K14',
      zarrinVoucherRef: 'ZRN-VOC-1403-9119',
      status: 'reconciled',
      statusFa: 'تطبیق و قطعی در زرین'
    },
    {
      id: 'voc-1006',
      voucherNumber: 'VOC-DUAL-1403-1006',
      voucherDateFa: '۱۴۰۳/۰۹/۰۴',
      partyId: 'org-supplier-01',
      partyNameFa: 'کارگاه تولیدی و زرگری صفوی اصفهان',
      voucherType: 'scrap_gold_return',
      voucherTypeFa: 'عودت و تحویل طلای آبشده کارگاهی',
      titleFa: 'رسید تحویل ۸۵.۲ گرم طلای آبشده جهت ساخت النگو',
      descriptionFa: 'تعهد به تأمین‌کننده بابت طلای خام دریافتی جهت پردازش',
      referenceDocNumber: 'REC-SUP-1403-112',
      sourceKernel: 'K07',
      goldDebitGrams: 0,
      goldCreditGrams: 85.200,
      goldCarat: 750,
      goldEquivalent750Grams: 85.200,
      fiatDebitToman: 0,
      fiatCreditToman: 0,
      runningGoldBalanceGrams: -85.200,
      runningFiatBalanceToman: -145000000,
      registeredBy: 'واحد زنجیره تأمین K07',
      zarrinVoucherRef: 'ZRN-VOC-1403-9041',
      status: 'posted',
      statusFa: 'ثبت قطعی در دفتر'
    }
  ];

  public getData(): K15DataPayload {
    this.refreshCalculations();

    const trialBalance = this.calculateTrialBalance();
    const summaryMetrics = this.calculateSummaryMetrics();

    return {
      trialBalance,
      partyBalances: [...this.partyBalances],
      recentVouchers: [...this.vouchers].sort((a, b) => b.voucherNumber.localeCompare(a.voucherNumber)),
      referenceGoldPriceToman: this.referenceGoldPriceToman,
      summaryMetrics
    };
  }

  public getPartyBalances(): PartyAccountBalance[] {
    this.refreshCalculations();
    return [...this.partyBalances];
  }

  public getPartyAccount(partyId: string): { party: PartyAccountBalance; vouchers: DualJournalVoucher[] } | null {
    this.refreshCalculations();
    const party = this.partyBalances.find((p) => p.partyId === partyId || p.id === partyId);
    if (!party) return null;

    const vouchers = this.vouchers
      .filter((v) => v.partyId === party.partyId)
      .sort((a, b) => b.voucherNumber.localeCompare(a.voucherNumber));

    return { party, vouchers };
  }

  public getVouchers(filter?: { partyId?: string; voucherType?: string }): DualJournalVoucher[] {
    let list = [...this.vouchers];
    if (filter?.partyId) {
      list = list.filter((v) => v.partyId === filter.partyId);
    }
    if (filter?.voucherType) {
      list = list.filter((v) => v.voucherType === filter.voucherType);
    }
    return list.sort((a, b) => b.voucherNumber.localeCompare(a.voucherNumber));
  }

  public updateReferenceGoldPrice(newPriceToman: number): number {
    this.referenceGoldPriceToman = newPriceToman;
    this.refreshCalculations();
    return this.referenceGoldPriceToman;
  }

  public findOrCreatePartyAccount(partyData: {
    partyId: string;
    partyNameFa: string;
    nationalId?: string;
    phone?: string;
    accountType?: 'retailer' | 'wholesaler' | 'supplier' | 'workshop';
    accountTypeFa?: string;
  }): PartyAccountBalance {
    let party = this.partyBalances.find(
      (p) =>
        p.partyId.toLowerCase() === partyData.partyId.toLowerCase() ||
        (partyData.nationalId && p.nationalId === partyData.nationalId) ||
        p.partyNameFa.trim() === partyData.partyNameFa.trim()
    );

    if (!party) {
      const newId = `acc-${Date.now().toString().slice(-4)}`;
      const subledgerSeq = 1000 + this.partyBalances.length + 1;
      party = {
        id: newId,
        partyId: partyData.partyId,
        partyNameFa: partyData.partyNameFa,
        nationalId: partyData.nationalId || '10103500000',
        accountType: partyData.accountType || 'retailer',
        accountTypeFa: partyData.accountTypeFa || 'خرده‌فروش همکار',
        phone: partyData.phone || '021-55000000',
        goldBalanceGrams750: 0,
        goldDebitTotalGrams: 0,
        goldCreditTotalGrams: 0,
        fiatBalanceToman: 0,
        fiatDebitTotalToman: 0,
        fiatCreditTotalToman: 0,
        totalObligationValuationToman: 0,
        aging: {
          currentGrams: 0,
          currentToman: 0,
          overdue1To15Grams: 0,
          overdue1To15Toman: 0,
          overdue16To30Grams: 0,
          overdue16To30Toman: 0,
          overdue30PlusGrams: 0,
          overdue30PlusToman: 0,
          oldestOverdueDateFa: undefined,
          weightedAverageDueDays: 0
        },
        status: 'clear',
        statusFa: 'حساب کاملاً تراز و تسویه شده',
        lastTransactionDateFa: 'هم‌اکنون',
        zarrinSubledgerCode: `110201-${subledgerSeq}`
      };
      this.partyBalances.push(party);
    }
    return party;
  }

  public registerVoucher(payload: {
    partyId: string;
    voucherType: DualVoucherType;
    titleFa: string;
    descriptionFa: string;
    referenceDocNumber?: string;
    goldDebitGrams?: number;
    goldCreditGrams?: number;
    goldCarat?: number;
    fiatDebitToman?: number;
    fiatCreditToman?: number;
    registeredBy?: string;
    sourceKernel?: 'K13' | 'K14' | 'K15' | 'K16' | 'K10' | 'K08' | 'K07' | 'K09' | 'MANUAL';
    doubleEntryArticles?: any[];
    k14ExposureClearanceRef?: string;
    k13InvoiceNumber?: string;
  }): DualJournalVoucher {
    const party = this.partyBalances.find((p) => p.partyId === payload.partyId || p.id === payload.partyId);
    if (!party) {
      throw new Error(`طرف حساب با شناسه ${payload.partyId} یافت نشد.`);
    }

    const carat = payload.goldCarat || 750;
    const debitGrams = Number(payload.goldDebitGrams || 0);
    const creditGrams = Number(payload.goldCreditGrams || 0);
    const goldEquiv750 = Number((((debitGrams || creditGrams) * carat) / 750).toFixed(3));

    const fiatDebit = Number(payload.fiatDebitToman || 0);
    const fiatCredit = Number(payload.fiatCreditToman || 0);

    // Apply to party running balance
    party.goldDebitTotalGrams += debitGrams;
    party.goldCreditTotalGrams += creditGrams;
    party.goldBalanceGrams750 = Number((party.goldBalanceGrams750 + debitGrams - creditGrams).toFixed(3));

    party.fiatDebitTotalToman += fiatDebit;
    party.fiatCreditTotalToman += fiatCredit;
    party.fiatBalanceToman = Number(party.fiatBalanceToman + fiatDebit - fiatCredit);

    party.lastTransactionDateFa = '۱۴۰۳/۰۹/۰۸ ۱۶:۰۰';

    const voucherSeq = this.vouchers.length + 1001;
    const voucherNumber = `VOC-DUAL-1403-${voucherSeq}`;

    const typeLabelMap: Record<DualVoucherType, string> = {
      invoice_dispatch: 'تحویل کالای فاکتور رسمی',
      gold_melted_settlement: 'تسویه فیزیکی طلای آبشده',
      fiat_bank_transfer: 'واریز نقدی بانکی',
      wage_fee_charge: 'هزینه اجرت و متعلقات ساخت',
      netting_conversion: 'سند تهاتر و تبدیل مانده دوگانه',
      assay_variance: 'تعدیل کسر/اضافه عیار ری‌گیری',
      scrap_gold_return: 'رسید طلای کهنه / داغی'
    };

    const newVoucher: DualJournalVoucher = {
      id: `voc-${voucherSeq}`,
      voucherNumber,
      voucherDateFa: '۱۴۰۳/۰۹/۰۸',
      partyId: party.partyId,
      partyNameFa: party.partyNameFa,
      voucherType: payload.voucherType,
      voucherTypeFa: typeLabelMap[payload.voucherType] || payload.voucherType,
      titleFa: payload.titleFa,
      descriptionFa: payload.descriptionFa,
      referenceDocNumber: payload.referenceDocNumber,
      sourceKernel: payload.sourceKernel || 'K15',
      goldDebitGrams: debitGrams,
      goldCreditGrams: creditGrams,
      goldCarat: carat,
      goldEquivalent750Grams: goldEquiv750,
      fiatDebitToman: fiatDebit,
      fiatCreditToman: fiatCredit,
      runningGoldBalanceGrams: party.goldBalanceGrams750,
      runningFiatBalanceToman: party.fiatBalanceToman,
      registeredBy: payload.registeredBy || 'کاربر سیستم حسابداری دوگانه دیدار',
      zarrinVoucherRef: `ZRN-VOC-1403-${9200 + this.vouchers.length}`,
      status: 'posted',
      statusFa: 'ثبت قطعی در دفتر معین دوگانه',
      doubleEntryArticles: payload.doubleEntryArticles,
      k14ExposureClearanceRef: payload.k14ExposureClearanceRef,
      k13InvoiceNumber: payload.k13InvoiceNumber || payload.referenceDocNumber
    };

    this.vouchers.push(newVoucher);
    this.refreshCalculations();

    return newVoucher;
  }

  public executeNettingConversion(params: {
    partyId: string;
    direction: 'fiat_to_gold' | 'gold_to_fiat';
    amount: number; // Toman if fiat_to_gold, Grams if gold_to_fiat
    goldPriceToman: number;
    operator?: string;
  }): { voucher: DualJournalVoucher; updatedParty: PartyAccountBalance } {
    const party = this.partyBalances.find((p) => p.partyId === params.partyId || p.id === params.partyId);
    if (!party) {
      throw new Error(`طرف حساب با شناسه ${params.partyId} یافت نشد.`);
    }

    const price = params.goldPriceToman > 0 ? params.goldPriceToman : this.referenceGoldPriceToman;

    let goldDebit = 0;
    let goldCredit = 0;
    let fiatDebit = 0;
    let fiatCredit = 0;
    let title = '';
    let desc = '';

    if (params.direction === 'fiat_to_gold') {
      // بدهی ریالی با طلا جایگزین می‌شود (کاهش بدهی ریالی = بستانکار ریال، افزایش بدهی طلا = بدهکار طلا)
      const fiatAmount = params.amount;
      const goldEquivalentGrams = Number((fiatAmount / price).toFixed(3));

      fiatCredit = fiatAmount;
      goldDebit = goldEquivalentGrams;

      title = `تهاتر ${fiatAmount.toLocaleString('fa-IR')} تومان بدهی ریالی به طلا`;
      desc = `تبدیل بدهی ریالی به معادل وزنی ${goldEquivalentGrams} گرم طلای ۱۸ عیار با نرخ مظنه ${price.toLocaleString('fa-IR')} تومان.`;
    } else {
      // بدهی طلا با ریال جایگزین می‌شود (کاهش بدهی طلا = بستانکار طلا، افزایش بدهی ریالی = بدهکار ریال)
      const goldGrams = params.amount;
      const fiatEquivalentToman = Math.round(goldGrams * price);

      goldCredit = goldGrams;
      fiatDebit = fiatEquivalentToman;

      title = `تهاتر ${goldGrams} گرم تعهد طلا به ریال`;
      desc = `تبدیل بدهی طلای ۱۸ عیار به معادل پولی ${fiatEquivalentToman.toLocaleString('fa-IR')} تومان با نرخ مظنه ${price.toLocaleString('fa-IR')} تومان.`;
    }

    const voucher = this.registerVoucher({
      partyId: party.partyId,
      voucherType: 'netting_conversion',
      titleFa: title,
      descriptionFa: desc,
      referenceDocNumber: `NET-${Date.now().toString().slice(-6)}`,
      goldDebitGrams: goldDebit,
      goldCreditGrams: goldCredit,
      goldCarat: 750,
      fiatDebitToman: fiatDebit,
      fiatCreditToman: fiatCredit,
      registeredBy: params.operator || 'کمیته تهاتر و تسویه K15/K16'
    });

    return { voucher, updatedParty: party };
  }

  private refreshCalculations() {
    this.partyBalances.forEach((p) => {
      // Recalculate valuation
      p.totalObligationValuationToman = p.fiatBalanceToman + (p.goldBalanceGrams750 * this.referenceGoldPriceToman);

      // Evaluate status
      if (p.goldBalanceGrams750 === 0 && p.fiatBalanceToman === 0) {
        p.status = 'clear';
        p.statusFa = 'حساب کاملاً تراز و تسویه شده';
      } else if (p.aging.overdue16To30Grams > 0 || p.aging.overdue16To30Toman > 0 || p.aging.overdue30PlusGrams > 0 || p.aging.overdue30PlusToman > 0) {
        p.status = 'critical';
        p.statusFa = 'تعهد معوق بحرانی';
      } else if (p.aging.overdue1To15Grams > 0 || p.aging.overdue1To15Toman > 0) {
        p.status = 'overdue';
        p.statusFa = 'دارای سررسید معوق (۱ تا ۱۵ روز)';
      } else {
        p.status = 'normal';
        p.statusFa = 'مانده متعارف در مهلت جاری';
      }
    });
  }

  private calculateTrialBalance(): DualTrialBalance {
    const totalGoldDebits = Number(this.partyBalances.reduce((acc, p) => acc + p.goldDebitTotalGrams, 0).toFixed(3));
    const totalGoldCredits = Number(this.partyBalances.reduce((acc, p) => acc + p.goldCreditTotalGrams, 0).toFixed(3));
    const netGoldBalance = Number((totalGoldDebits - totalGoldCredits).toFixed(3));

    const totalFiatDebits = this.partyBalances.reduce((acc, p) => acc + p.fiatDebitTotalToman, 0);
    const totalFiatCredits = this.partyBalances.reduce((acc, p) => acc + p.fiatCreditTotalToman, 0);
    const netFiatBalance = totalFiatDebits - totalFiatCredits;

    const totalValuedExposure = this.partyBalances.reduce((acc, p) => acc + Math.max(0, p.totalObligationValuationToman), 0);

    return {
      asOfDateFa: '۱۴۰۳/۰۹/۰۸',
      referenceGoldPriceToman: this.referenceGoldPriceToman,
      totalGoldDebitsGrams: totalGoldDebits,
      totalGoldCreditsGrams: totalGoldCredits,
      netGoldBalanceGrams: netGoldBalance,
      isGoldBalanced: true,
      totalFiatDebitsToman: totalFiatDebits,
      totalFiatCreditsToman: totalFiatCredits,
      netFiatBalanceToman: netFiatBalance,
      isFiatBalanced: true,
      totalValuedExposureToman: totalValuedExposure,
      activePartiesCount: this.partyBalances.length,
      postedVouchersCount: this.vouchers.length
    };
  }

  private calculateSummaryMetrics(): K15SummaryMetrics {
    let totalGoldReceivable = 0;
    let totalGoldPayable = 0;
    let totalFiatReceivable = 0;
    let totalFiatPayable = 0;
    let overdueCount = 0;

    this.partyBalances.forEach((p) => {
      if (p.goldBalanceGrams750 > 0) {
        totalGoldReceivable += p.goldBalanceGrams750;
      } else if (p.goldBalanceGrams750 < 0) {
        totalGoldPayable += Math.abs(p.goldBalanceGrams750);
      }

      if (p.fiatBalanceToman > 0) {
        totalFiatReceivable += p.fiatBalanceToman;
      } else if (p.fiatBalanceToman < 0) {
        totalFiatPayable += Math.abs(p.fiatBalanceToman);
      }

      if (p.status === 'overdue' || p.status === 'critical') {
        overdueCount++;
      }
    });

    const totalNetValuation = (totalGoldReceivable - totalGoldPayable) * this.referenceGoldPriceToman + (totalFiatReceivable - totalFiatPayable);

    return {
      totalGoldReceivableGrams: Number(totalGoldReceivable.toFixed(3)),
      totalGoldPayableGrams: Number(totalGoldPayable.toFixed(3)),
      totalFiatReceivableToman: totalFiatReceivable,
      totalFiatPayableToman: totalFiatPayable,
      totalOverdueAccountsCount: overdueCount,
      totalNetValuationToman: totalNetValuation
    };
  }
}

export const k15Storage = new K15Storage();
