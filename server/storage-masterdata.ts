/**
 * Didar Gold Platform - Master Data Repository
 * In-memory persistence with rich baseline gold-market lookup dictionaries
 */

import { MasterDataCategory, MasterDataItem, MasterDataPayload } from '../src/types/masterData.js';

class MasterDataStorage {
  private categories: MasterDataCategory[] = [
    {
      id: 'visit_reasons',
      code: 'CAT-VISIT-RSN',
      nameFa: 'علل عدم مراجعه ویزیتور به گالری',
      nameEn: 'Visit Non-Attendance Reasons',
      descriptionFa: 'دلایل ثبت‌شده توسط مأمور برای عدم امکان مراجعه حضوری به طلافروشی',
      iconName: 'XCircle',
      isSystem: true
    },
    {
      id: 'invoice_reasons',
      code: 'CAT-INV-RSN',
      nameFa: 'علل عدم صدور فاکتور طلا در ویزیت',
      nameEn: 'Invoice Rejection Reasons',
      descriptionFa: 'دلایل تجاری یا مالی در صورت مراجعه حضوری ولی عدم توافق بر سر صدور فاکتور',
      iconName: 'Receipt',
      isSystem: true
    },
    {
      id: 'gold_karats',
      code: 'CAT-KARATS',
      nameFa: 'عیارهای استاندارد طلا',
      nameEn: 'Gold Karat Standards',
      descriptionFa: 'عیارهای معتبر مسکوکات و مصنوعات طلا بر پایه سنجش آزمایشگاهی',
      iconName: 'Sparkles',
      isSystem: true
    },
    {
      id: 'bag_seal_types',
      code: 'CAT-BAG-SEAL',
      nameFa: 'انواع تجهیزات و پلمپ ترابری طلا',
      nameEn: 'Security Bags & Seals',
      descriptionFa: 'کیف‌های ضدبرش، پلمپ‌های هوشمند RFID و محفظه‌های امن طلا',
      iconName: 'Briefcase',
      isSystem: true
    },
    {
      id: 'security_clearances',
      code: 'CAT-SEC-CLR',
      nameFa: 'رده‌های حفاظتی و امنیتی ترابری',
      nameEn: 'Security Clearance Levels',
      descriptionFa: 'سطوح حراست، تشریفات امنیتی و وثایق ثبتی برای حمل طلا در راسته‌بازارها',
      iconName: 'ShieldAlert',
      isSystem: true
    },
    {
      id: 'payment_conditions',
      code: 'CAT-PAY-COND',
      nameFa: 'شرایط تسویه و حساب طلا',
      nameEn: 'Settlement Terms & Conditions',
      descriptionFa: 'انواع شیوه‌های تسویه ریالی، تهاتر با طلای آب‌شده یا مدت‌دار',
      iconName: 'CreditCard',
      isSystem: true
    }
  ];

  private items: MasterDataItem[] = [
    // 1. Visit Non-Attendance Reasons (Pure Reference Data)
    {
      id: 'itm-vrsn-01',
      categoryId: 'visit_reasons',
      key: 'closed_shop',
      labelFa: 'بسته بودن مغازه یا تعطیلی گالری',
      labelEn: 'Shop / Gallery Closed',
      code: 'VRS-CLS',
      descriptionFa: 'مغازه در زمان مراجعه طبق ساعت کاری بازار بسته بوده است',
      orderIndex: 1,
      isActive: true,
      isSystem: true,
      badgeColor: '#FF6B6B'
    },
    {
      id: 'itm-vrsn-02',
      categoryId: 'visit_reasons',
      key: 'owner_absent',
      labelFa: 'عدم حضور صاحب پروانه یا تصمیم‌گیرنده',
      labelEn: 'Store Owner / Decision Maker Absent',
      code: 'VRS-OWN',
      descriptionFa: 'شاگرد یا فروشنده فاقد اختیارات عقد قرارداد یا بررسی سفارش طلا بود',
      orderIndex: 2,
      isActive: true,
      isSystem: true,
      badgeColor: '#FFA940'
    },
    {
      id: 'itm-vrsn-03',
      categoryId: 'visit_reasons',
      key: 'traffic_jam',
      labelFa: 'ترافیک سنگین یا انسداد دسترسی راسته بازار',
      labelEn: 'Heavy Traffic or Alley Blockage',
      code: 'VRS-TRF',
      descriptionFa: 'عدم امکان تردد ایمن خودرو یا موتورسیکلت مأمور به علت مسدودی راسته',
      orderIndex: 3,
      isActive: true,
      isSystem: false,
      badgeColor: '#8C8C8C'
    },
    {
      id: 'itm-vrsn-04',
      categoryId: 'visit_reasons',
      key: 'client_cancelled',
      labelFa: 'درخواست طلافروش جهت موکول به زمان دیگر',
      labelEn: 'Client Requested Reschedule',
      code: 'VRS-RSC',
      descriptionFa: 'طلافروش به دلیل شلوغی مغازه خواستار تغییر نوبت ویزیت شد',
      orderIndex: 4,
      isActive: true,
      isSystem: true,
      badgeColor: '#36CFC9'
    },
    {
      id: 'itm-vrsn-05',
      categoryId: 'visit_reasons',
      key: 'security_alert',
      labelFa: 'هشدار امنیتی یا اعلام اتحادیه طلا',
      labelEn: 'Security Alert in Market',
      code: 'VRS-SEC',
      descriptionFa: 'دستور توقف گشت‌زنی به دلیل حادثه امنیتی یا بازرسی سرزده در راسته',
      orderIndex: 5,
      isActive: true,
      isSystem: false,
      badgeColor: '#F5222D'
    },

    // 3. Invoice Reasons (علل عدم صدور فاکتور)
    {
      id: 'itm-irsn-01',
      categoryId: 'invoice_reasons',
      key: 'fee_disagreement',
      labelFa: 'عدم توافق روی درصد اجرت ساخت',
      labelEn: 'Manufacturing Fee Disagreement',
      code: 'IRSN-FEE',
      descriptionFa: 'پیشنهاد کارمزد سازنده بالاتر از سقف بودجه گالری‌دار بود',
      orderIndex: 1,
      isActive: true,
      isSystem: true,
      badgeColor: '#FAAD14'
    },
    {
      id: 'itm-irsn-02',
      categoryId: 'invoice_reasons',
      key: 'collection_mismatch',
      labelFa: 'نامناسب بودن سبک یا وزن کالکشن برای ویترین',
      labelEn: 'Collection Weight or Design Mismatch',
      code: 'IRSN-DSG',
      descriptionFa: 'نمونه‌های ارائه‌شده با سلیقه مشتریان راسته یا ویترین گالری همخوانی نداشت',
      orderIndex: 2,
      isActive: true,
      isSystem: true,
      badgeColor: '#9254DE'
    },
    {
      id: 'itm-irsn-03',
      categoryId: 'invoice_reasons',
      key: 'credit_limit_reached',
      labelFa: 'تکمیل سقف اعتبار یا مانده بدهی تسویه‌نشده',
      labelEn: 'Credit Exposure Limit Reached',
      code: 'IRSN-CRD',
      descriptionFa: 'به دلیل تسویه نشدن فاکتورهای قبلی امکان صدور بار جدید وجود نداشت',
      orderIndex: 3,
      isActive: true,
      isSystem: true,
      badgeColor: '#F5222D'
    },
    {
      id: 'itm-irsn-04',
      categoryId: 'invoice_reasons',
      key: 'market_volatility',
      labelFa: 'نوسان شدید مظنه و دست نگه‌داشتن خریدار',
      labelEn: 'High Spot Market Volatility',
      code: 'IRSN-VOL',
      descriptionFa: 'جهش ناگهانی انس و مظنه آب‌شده مانع از تصمیم‌گیری قطعی خرید شد',
      orderIndex: 4,
      isActive: true,
      isSystem: true,
      badgeColor: '#13C2C2'
    },
    {
      id: 'itm-irsn-05',
      categoryId: 'invoice_reasons',
      key: 'payment_terms_mismatch',
      labelFa: 'درخواست شرایط چکی یا مدتی نامتعارف',
      labelEn: 'Unacceptable Payment Terms',
      code: 'IRSN-TRM',
      descriptionFa: 'درخواست چک بیش از مهلت مجاز یا پرداخت خارج از رویه نقدی-طلایی',
      orderIndex: 5,
      isActive: true,
      isSystem: false,
      badgeColor: '#EB2F96'
    },

    // 4. Security Clearance Levels
    {
      id: 'itm-sec-01',
      categoryId: 'security_clearances',
      key: 'standard',
      labelFa: 'استاندارد (ترابری شهری عادی)',
      labelEn: 'Standard Regional Transit',
      code: 'SEC-STD',
      descriptionFa: 'حمل طلای زیر ۱۰۰۰ گرم با وسایل نقلیه مجهز به ردیاب',
      orderIndex: 1,
      isActive: true,
      isSystem: true,
      badgeColor: '#52C41A'
    },
    {
      id: 'itm-sec-02',
      categoryId: 'security_clearances',
      key: 'high_value_courier',
      labelFa: 'حامل محموله سنگین (ارزش و وثیقه بالا)',
      labelEn: 'High Value Bonded Courier',
      code: 'SEC-HVC',
      descriptionFa: 'مأمور با تضامین ملکی و سفته معتبر برای محموله‌های تا ۳ کیلوگرم',
      orderIndex: 2,
      isActive: true,
      isSystem: true,
      badgeColor: '#1890FF'
    },
    {
      id: 'itm-sec-03',
      categoryId: 'security_clearances',
      key: 'high_density',
      labelFa: 'راسته پرتراکم با گردش بالا (مراقبت مضاعف)',
      labelEn: 'High Density Market Route',
      code: 'SEC-HDN',
      descriptionFa: 'مسیرهای پرخطر مانند کوچه تکیه دولت یا سبزه میدان نیازمند همراه دوم',
      orderIndex: 3,
      isActive: true,
      isSystem: true,
      badgeColor: '#FA8C16'
    },
    {
      id: 'itm-sec-04',
      categoryId: 'security_clearances',
      key: 'armored_escort',
      labelFa: 'اسکورت حفاظتی ویژه و ضدسرقت',
      labelEn: 'Armored Security Escort',
      code: 'SEC-ARM',
      descriptionFa: 'ترابری بین‌شهری یا جابه‌جایی شمش با تجهیزات ضدگلوله',
      orderIndex: 4,
      isActive: true,
      isSystem: true,
      badgeColor: '#722ED1'
    },

    // 5. Bag and Seal Types
    {
      id: 'itm-bag-01',
      categoryId: 'bag_seal_types',
      key: 'cut_resistant_gps_bag',
      labelFa: 'کیف ضدبرش کولار با ردیاب آنلاین ماهواره‌ای',
      labelEn: 'Kevlar Anti-Cut Bag with GPS Tracker',
      code: 'BAG-GPS',
      descriptionFa: 'مجهز به قفل رمزدار بیومتریک و آلارم قطع اتصال از بدن مأمور',
      orderIndex: 1,
      isActive: true,
      isSystem: true,
      badgeColor: '#1890FF'
    },
    {
      id: 'itm-bag-02',
      categoryId: 'bag_seal_types',
      key: 'rfid_smart_seal',
      labelFa: 'پلمپ الکترونیک یکبارمصرف RFID / NFC',
      labelEn: 'Electronic Smart RFID Seal',
      code: 'SEL-RFID',
      descriptionFa: 'دارای بارکد دوبعدی یکتا و گزارش تاریخچه اسکن در سامانه',
      orderIndex: 2,
      isActive: true,
      isSystem: true,
      badgeColor: '#52C41A'
    },
    {
      id: 'itm-bag-03',
      categoryId: 'bag_seal_types',
      key: 'anti_theft_smoke_pack',
      labelFa: 'محفظه امنیتی با کپسول رنگی و دودزا',
      labelEn: 'Anti-Theft Smoke Security Pack',
      code: 'BAG-SMK',
      descriptionFa: 'فعال‌سازی از راه دور در صورت سرقت جهت ابطال طلا و شناسایی سارق',
      orderIndex: 3,
      isActive: true,
      isSystem: false,
      badgeColor: '#FA541C'
    },

    // 4. Gold Karat Standards (Pure Reference Data)
    {
      id: 'itm-krt-01',
      categoryId: 'gold_karats',
      key: 'karat_750',
      labelFa: 'عیار ۷۵۰ (۱۸ عیار استاندارد ایران)',
      labelEn: '750 Karat (Standard 18K)',
      code: 'KRT-750',
      descriptionFa: 'عیار رسمی تمام مصنوعات ساخت داخل طبق استاندارد اجباری اداره استاندارد',
      orderIndex: 1,
      isActive: true,
      isSystem: true,
      badgeColor: '#C8A951',
      metadata: { purity: 0.75 }
    },
    {
      id: 'itm-krt-02',
      categoryId: 'gold_karats',
      key: 'karat_705',
      labelFa: 'عیار ۷۰۵ (۱۷ عیار سنتی/متفرقه)',
      labelEn: '705 Karat (Traditional / Scrap)',
      code: 'KRT-705',
      descriptionFa: 'معیار دادوستد طلای متفرقه و آب‌شده‌های قدیمی قبل از استانداردسازی',
      orderIndex: 2,
      isActive: true,
      isSystem: true,
      badgeColor: '#FAAD14',
      metadata: { purity: 0.705 }
    },
    {
      id: 'itm-krt-03',
      categoryId: 'gold_karats',
      key: 'karat_916',
      labelFa: 'عیار ۹۱۶ (۲۲ عیار طلاهای صادراتی و بومی)',
      labelEn: '916 Karat (22K Regional)',
      code: 'KRT-916',
      descriptionFa: 'محبوب در بازارهای خوزستان، هرمزگان و مسکوکات خاص خلیجی',
      orderIndex: 3,
      isActive: true,
      isSystem: false,
      badgeColor: '#F5222D',
      metadata: { purity: 0.916 }
    },
    {
      id: 'itm-krt-04',
      categoryId: 'gold_karats',
      key: 'karat_999',
      labelFa: 'عیار ۹۹۹.۹ (۲۴ عیار شمش خالص سوئیسی/ایرانی)',
      labelEn: '999.9 Karat (Pure 24K Bullion)',
      code: 'KRT-999',
      descriptionFa: 'شمش‌های ضرب‌شده بانک مرکزی و پالایشگاه‌های معتبر جهانی',
      orderIndex: 4,
      isActive: true,
      isSystem: true,
      badgeColor: '#52C41A',
      metadata: { purity: 0.9999 }
    },

    // 5. Payment Terms & Settlement Conditions (Pure Reference Data)
    {
      id: 'itm-pay-01',
      categoryId: 'payment_conditions',
      key: 'cash_instant',
      labelFa: 'تسویه آنی ریالی (ساتنا/پایا پای فاکتور)',
      labelEn: 'Instant Bank Transfer / Cash',
      code: 'PAY-CSH',
      descriptionFa: 'واریز مستقیم به حساب بنکدار در لحظه تحویل بار با کسر تخفیف نقدی',
      orderIndex: 1,
      isActive: true,
      isSystem: true,
      badgeColor: '#52C41A'
    },
    {
      id: 'itm-pay-02',
      categoryId: 'payment_conditions',
      key: 'gold_scrap_swap',
      labelFa: 'تهاتر با طلای آب‌شده عیار ۷۵۰ (گرم به گرم)',
      labelEn: 'Gold Scrap Trade-in (Weight Match)',
      code: 'PAY-SWP',
      descriptionFa: 'تحویل طلای خام معادل وزن فاکتور به علاوه تسویه ریالی اجرت ساخت',
      orderIndex: 2,
      isActive: true,
      isSystem: true,
      badgeColor: '#C8A951'
    },
    {
      id: 'itm-pay-03',
      categoryId: 'payment_conditions',
      key: 'cheque_sayadi_30d',
      labelFa: 'چک صیادی بنفش ۳۰ روزه با اعتبارسنجی',
      labelEn: 'Sayadi Cheque 30-Day Term',
      code: 'PAY-CHQ',
      descriptionFa: 'ثبت شناسه چک در سامانه پیچک با رعایت سقف مجاز باز بدهی گالری',
      orderIndex: 3,
      isActive: true,
      isSystem: true,
      badgeColor: '#1890FF'
    },
    {
      id: 'itm-pay-04',
      categoryId: 'payment_conditions',
      key: 'consignment_zarrin',
      labelFa: 'فروش امانی با ضمانت کیف پول طلا (سامانه زرین)',
      labelEn: 'Consignment with Zarrin Escrow',
      code: 'PAY-ESC',
      descriptionFa: 'قفل شدن دارایی در کیف پول دیجیتال زرین تا زمان ثبت قطعی فروش در ویترین',
      orderIndex: 4,
      isActive: true,
      isSystem: true,
      badgeColor: '#722ED1'
    }
  ];

  public getPayload(): MasterDataPayload {
    const categoriesWithCount = this.categories.map(c => ({
      ...c,
      itemCount: this.items.filter(i => i.categoryId === c.id).length
    }));

    return {
      categories: categoriesWithCount,
      items: [...this.items].sort((a, b) => a.orderIndex - b.orderIndex)
    };
  }

  public getCategories(): MasterDataCategory[] {
    return this.categories.map(c => ({
      ...c,
      itemCount: this.items.filter(i => i.categoryId === c.id).length
    }));
  }

  public getItemsByCategory(categoryId: string): MasterDataItem[] {
    return this.items
      .filter(i => i.categoryId === categoryId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  public getActiveItemsByCategory(categoryId: string): MasterDataItem[] {
    return this.items
      .filter(i => i.categoryId === categoryId && i.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  public createCategory(payload: Partial<MasterDataCategory>): MasterDataCategory {
    if (!payload.nameFa || !payload.nameFa.trim()) {
      throw new Error('نام فارسی دسته الزامی است.');
    }
    const id = payload.id || `cat_${Date.now().toString().slice(-6)}`;
    if (this.categories.some(c => c.id === id)) {
      throw new Error('دسته‌بندی با این شناسه قبلاً ثبت شده است.');
    }

    const newCat: MasterDataCategory = {
      id,
      code: payload.code || `CAT-${id.toUpperCase().slice(0, 8)}`,
      nameFa: payload.nameFa.trim(),
      nameEn: payload.nameEn?.trim() || payload.nameFa.trim(),
      descriptionFa: payload.descriptionFa?.trim() || '',
      iconName: payload.iconName || 'Folder',
      isSystem: false,
      itemCount: 0
    };

    this.categories.push(newCat);
    return newCat;
  }

  public createItem(payload: Partial<MasterDataItem>): MasterDataItem {
    if (!payload.categoryId) {
      throw new Error('انتخاب دسته الزامی است.');
    }
    if (!payload.labelFa || !payload.labelFa.trim()) {
      throw new Error('عنوان فارسی گزینه الزامی است.');
    }

    const key = payload.key?.trim() || `key_${Date.now().toString().slice(-6)}`;
    const category = this.categories.find(c => c.id === payload.categoryId);
    if (!category) {
      throw new Error('دسته مورد نظر یافت نشد.');
    }

    // Determine order index
    const categoryItems = this.items.filter(i => i.categoryId === payload.categoryId);
    const orderIndex = payload.orderIndex ?? (categoryItems.length + 1);

    const now = new Date().toISOString();
    const newItem: MasterDataItem = {
      id: `itm-${Date.now().toString().slice(-6)}`,
      categoryId: payload.categoryId,
      key,
      labelFa: payload.labelFa.trim(),
      labelEn: payload.labelEn?.trim() || '',
      code: payload.code?.trim() || `ITM-${category.code.slice(-3)}-${(categoryItems.length + 1).toString().padStart(2, '0')}`,
      descriptionFa: payload.descriptionFa?.trim() || '',
      orderIndex,
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      isSystem: false,
      badgeColor: payload.badgeColor || '#C8A951',
      metadata: payload.metadata || {},
      createdAt: now,
      updatedAt: now
    };

    this.items.push(newItem);
    return newItem;
  }

  public updateItem(id: string, updates: Partial<MasterDataItem>): MasterDataItem {
    const itemIndex = this.items.findIndex(i => i.id === id);
    if (itemIndex === -1) {
      throw new Error('آیتم مورد نظر یافت نشد.');
    }

    const current = this.items[itemIndex];
    const updated: MasterDataItem = {
      ...current,
      ...updates,
      id: current.id, // Immutable
      categoryId: updates.categoryId || current.categoryId,
      isSystem: current.isSystem, // Keep system flag
      updatedAt: new Date().toISOString()
    };

    this.items[itemIndex] = updated;
    return updated;
  }

  public toggleItemActive(id: string, isActive?: boolean): MasterDataItem {
    const item = this.items.find(i => i.id === id);
    if (!item) {
      throw new Error('آیتم مورد نظر یافت نشد.');
    }

    item.isActive = isActive !== undefined ? isActive : !item.isActive;
    item.updatedAt = new Date().toISOString();
    return item;
  }

  public deleteItem(id: string): { success: boolean; message: string } {
    const itemIndex = this.items.findIndex(i => i.id === id);
    if (itemIndex === -1) {
      throw new Error('آیتم مورد نظر یافت نشد.');
    }

    const item = this.items[itemIndex];
    if (item.isSystem) {
      throw new Error('آیتم‌های پیش‌فرض سیستمی قابل حذف نیستند؛ اما می‌توانید وضعیت آن‌ها را غیرفعال نمایید.');
    }

    this.items.splice(itemIndex, 1);
    return { success: true, message: 'آیتم با موفقیت حذف شد.' };
  }

  public deleteCategory(categoryId: string): { success: boolean; message: string } {
    const catIndex = this.categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      throw new Error('دسته مورد نظر یافت نشد.');
    }

    const cat = this.categories[catIndex];
    if (cat.isSystem) {
      throw new Error('دسته‌بندی‌های پایه سیستمی قابل حذف نیستند.');
    }

    // Delete associated items
    this.items = this.items.filter(i => i.categoryId !== categoryId);
    this.categories.splice(catIndex, 1);

    return { success: true, message: 'دسته‌بندی و آیتم‌های مربوطه با موفقیت حذف شدند.' };
  }

  public reorderItems(categoryId: string, orderedItemIds: string[]): MasterDataItem[] {
    orderedItemIds.forEach((id, index) => {
      const item = this.items.find(i => i.id === id && i.categoryId === categoryId);
      if (item) {
        item.orderIndex = index + 1;
        item.updatedAt = new Date().toISOString();
      }
    });

    return this.getItemsByCategory(categoryId);
  }
}

export const masterDataStorage = new MasterDataStorage();
