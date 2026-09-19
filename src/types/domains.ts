/**
 * Didar Gold Platform - 20 Core Kernel Domains
 * Exactly 20 domains K01 - K20 (K16 has K16A and K16B subdivisions; no 21st domain)
 */

export interface KernelDomain {
  id: string;
  code: string;
  titleFa: string;
  titleEn: string;
  titleAr: string;
  titleFr: string;
  status: 'active' | 'in_progress' | 'queued' | 'planned';
  descriptionFa: string;
  descriptionEn: string;
  subdivisions?: { code: string; titleFa: string; titleEn: string }[];
}

export const KERNEL_DOMAINS: KernelDomain[] = [
  {
    id: 'K01',
    code: 'K01',
    titleFa: 'اشخاص، سازمان‌ها و عضویت',
    titleEn: 'People, Organizations & Memberships',
    titleAr: 'الأشخاص والمنظمات والعضويات',
    titleFr: 'Personnes, Organisations et Adhésions',
    status: 'active',
    descriptionFa: 'مدیریت هویت اشخاص حقیقی، سازمان‌ها و شرکت‌ها، روابط عضویت، اختیارات و اسناد',
    descriptionEn: 'Identity, enterprise party records, memberships, authority delegations, and document records'
  },
  {
    id: 'K02',
    code: 'K02',
    titleFa: 'پذیرش تدریجی، اعتماد و دسترسی',
    titleEn: 'Progressive Onboarding, Trust & Entitlements',
    titleAr: 'التأهيل التدريجي والثقة والاستحقاقات',
    titleFr: 'Intégration Progressive, Confiance et Droits',
    status: 'active',
    descriptionFa: 'گردش کار اعتبارسنجی مدارک، تکمیل پرونده، تماس کارشناس و اعطای دسترسی‌های تجاری',
    descriptionEn: 'Progressive business verification, trust tiering, review queues, and commercial entitlements'
  },
  {
    id: 'K03',
    code: 'K03',
    titleFa: 'احراز هویت و احراز چندمرحله‌ای',
    titleEn: 'Authentication & MFA',
    titleAr: 'المصادقة والمصادقة متعددة العوامل',
    titleFr: 'Authentification et MFA',
    status: 'active',
    descriptionFa: 'ورود امن مبتنی بر نشست، رمز یک‌بارمصرف، احراز دوعاملی TOTP و محافظت از حساب‌های حساس',
    descriptionEn: 'Session-based authentication, OTP channels, TOTP MFA challenge-response, and account security'
  },
  {
    id: 'K04',
    code: 'K04',
    titleFa: 'تأیید، استثنا و حسابرسی',
    titleEn: 'Approvals, Exceptions & Audit',
    titleAr: 'الموافقات والاستثناءات والتدقيق',
    titleFr: 'Approbations, Exceptions et Audit',
    status: 'active',
    descriptionFa: 'تفکیک وظایف، زنجیره تصویب تصمیم‌های مالی و اعتباری، ثبت ردپای تغییرناپذیر',
    descriptionEn: 'Four-eyes approval gates, commercial exception workflows, and immutable audit logs'
  },
  {
    id: 'K05',
    code: 'K05',
    titleFa: 'محصول، کاتالوگ و پیشنهاد تأمین',
    titleEn: 'Products, Catalog & Supply Offers',
    titleAr: 'المنتجات والكتالوج وعروض التوريد',
    titleFr: 'Produits, Catalogue et Offres de Fourniture',
    status: 'active',
    descriptionFa: 'تعریف مدل کالا، تنوع ساخت، گالری روایی و ثبت پیشنهادهای ظرفیت تولید توسط سازندگان',
    descriptionEn: 'SKU catalog models, design variants, narrative visual assets, and supplier capacity offers'
  },
  {
    id: 'K06',
    code: 'K06',
    titleFa: 'شناسه یکتا، گذرنامه، اصالت و مالکیت',
    titleEn: 'Unique Item IDs, Passports & Provenance',
    titleAr: 'المعرف الفريد وجواز السفر الرقمي والأصالة',
    titleFr: 'Identifiants Uniques, Passeports et Traçabilité',
    status: 'active',
    descriptionFa: 'شناسنامه دیجیتال هر قطعه فیزیکی طلا، وزن و عیار سنجش‌شده، شواهد QC و زنجیره مالکیت',
    descriptionEn: 'Individual piece UID, physical-digital passport, metallurgical assay, and provenance chain'
  },
  {
    id: 'K07',
    code: 'K07',
    titleFa: 'چرخه همکاری تأمین‌کننده',
    titleEn: 'Supplier Partnership Lifecycle',
    titleAr: 'دورة حياة شراكة الموردين',
    titleFr: 'Cycle de Vie du Partenariat Fournisseur',
    status: 'active',
    descriptionFa: 'توافق‌های همکاری، قرارداد امانی و قطعی، تضمین‌های کیفی و شاخص‌های عملکرد سازنده',
    descriptionEn: 'Manufacturer and wholesaler contracts, consignment policies, and vendor performance'
  },
  {
    id: 'K08',
    code: 'K08',
    titleFa: 'ورود و پذیرش تأمین',
    titleEn: 'Supply Intake & Acceptance',
    titleAr: 'استلام وقبول التوريد',
    titleFr: 'Réception et Acceptation des Fournitures',
    status: 'active',
    descriptionFa: 'کنترل فیزیکی محموله، سنجش عیار و وزن قطعات، قرنطینه و پذیرش رسمی در موجودی',
    descriptionEn: 'Consignment physical receipt, assay tolerance verification, quarantine, and inventory acceptance'
  },
  {
    id: 'K09',
    code: 'K09',
    titleFa: 'موجودی، مکان، امانت و کیف',
    titleEn: 'Inventory, Locations, Custody & Bags',
    titleAr: 'المخزون والمواقع والعهدة وحقائب الوكلاء',
    titleFr: 'Inventaire, Emplacements, Garde et Sacs Agents',
    status: 'active',
    descriptionFa: 'ردگیری مکان فیزیکی، خزانه مرکزی، امانت‌داری، کیف عاملان میدانی و انتقال مکان',
    descriptionEn: 'Multi-location vault tracking, physical custody, agent field bags, and transfer logs'
  },
  {
    id: 'K10',
    code: 'K10',
    titleFa: 'سفارش، تخصیص و ایفای سفارش',
    titleEn: 'Orders, Allocation & Fulfillment',
    titleAr: 'الطلبات والتخصيص والتنفيذ',
    titleFr: 'Commandes, Allocation et Exécution',
    status: 'active',
    descriptionFa: 'سفارش مستقیم خرده‌فروش، سفارش با عامل، تخصیص از انبار و کیف، اثبات تحویل POD',
    descriptionEn: 'Direct and assisted ordering, stock reservation, mixed fulfillment, and proof of delivery'
  },
  {
    id: 'K11',
    code: 'K11',
    titleFa: 'چرخه خرده‌فروش و دسترسی تجاری',
    titleEn: 'Retailer Lifecycle & Commercial Access',
    titleAr: 'دورة حياة تاجر التجزئة والوصول التجاري',
    titleFr: 'Cycle de Vie Détaillant et Accès Commercial',
    status: 'active',
    descriptionFa: 'مدیریت رتبه تجاری، قلمرو فروشگاهی، شرایط سبد مجاز و سوابق خرید خرده‌فروشان',
    descriptionEn: 'Retail tier governance, localized territory entitlement, and commercial privilege management'
  },
  {
    id: 'K12',
    code: 'K12',
    titleFa: 'عامل، قلمرو و عملیات میدانی',
    titleEn: 'Agents, Territories & Field Operations',
    titleAr: 'الوكلاء والمناطق والعمليات الميدانية',
    titleFr: 'Agents, Territoires et Opérations de Terrain',
    status: 'active',
    descriptionFa: 'تخصیص قلمرو جغرافیایی، برنامه ویزیت، گالری سیار و اقدام به نیابت از خرده‌فروش',
    descriptionEn: 'Territory dispatching, visit scheduling, mobile showcases, and act-as proxy transactions'
  },
  {
    id: 'K13',
    code: 'K13',
    titleFa: 'نرخ طلا، قیمت‌گذاری، شرایط و صورتحساب',
    titleEn: 'Gold Rates, Pricing & Invoices',
    titleAr: 'أسعار الذهب والتسعير والشروط والفواتير',
    titleFr: 'Cours de l\'Or, Tarification et Facturation',
    status: 'active',
    descriptionFa: 'نرخ مرجع زنده بر اساس عیار، اجرت ساخت خرید و فروش، صورتحساب‌های رسمی و پیش‌فاکتور',
    descriptionEn: 'Spot pricing reference, manufacturing fee matrices, dynamic quote snapshots, and invoices'
  },
  {
    id: 'K14',
    code: 'K14',
    titleFa: 'اعتبار و ریسک تعهد',
    titleEn: 'Credit & Exposure',
    titleAr: 'الائتمان والمخاطر والتعرض المالي',
    titleFr: 'Crédit et Exposition au Risque',
    status: 'active',
    descriptionFa: 'سقف اعتبار ریالی و طلایی، تضامین سپرده‌شده، ریسک باز و فرآیند تصویب استثنا',
    descriptionEn: 'Dual-currency exposure caps, collateral tracking, credit tiering, and limit overrides'
  },
  {
    id: 'K15',
    code: 'K15',
    titleFa: 'تعهد مالی و دفتر دوگانه',
    titleEn: 'Financial Obligations & Dual Subledgers',
    titleAr: 'الالتزامات المالية ودفاتر الأستاذ المزدوجة',
    titleFr: 'Obligations Financières et Double Grand Livre',
    status: 'active',
    descriptionFa: 'ثبت جداگانه مانده گرمی (طلا با عیار مشخص) و مانده پولی، تراز دفترها و طلب/بدهی طرف‌ها',
    descriptionEn: 'Linked gold-weight (grams at purity) and fiat currency subledgers with explicit balances'
  },
  {
    id: 'K16',
    code: 'K16',
    titleFa: 'تسویه و تطبیق زرین',
    titleEn: 'Settlement & Zarrin Reconciliation',
    titleAr: 'التسوية والمطابقة مع زرين',
    titleFr: 'Règlement et Rapprochement Zarrin',
    status: 'active',
    descriptionFa: 'تسویه مالی و طلایی، تهاتر مطالبات، اتصال به وب‌سرویس جامع زرین و صف تطبیق اسناد بدون تکرار',
    descriptionEn: 'Settlement netting and execution, paired with Zarrin ERP reconciliation subdomains',
    subdivisions: [
      { code: 'K16A', titleFa: 'اجرای تسویه و تهاتر', titleEn: 'Settlement Execution & Netting' },
      { code: 'K16B', titleFa: 'یکپارچگی و تطبیق زرین', titleEn: 'Zarrin Integration & Reconciliation' }
    ]
  },
  {
    id: 'K17',
    code: 'K17',
    titleFa: 'ثبت مالکیت مصرف‌کننده و ضمانت',
    titleEn: 'Consumer Ownership Claims & Warranty',
    titleAr: 'مطالبات ملكية المستهلك والضمان',
    titleFr: 'Revendications de Propriété Consommateur et Garantie',
    status: 'active',
    descriptionFa: 'استعلام UID، ثبت مالکیت توسط خریدار نهایی، فعال‌سازی کارت ضمانت اصالت',
    descriptionEn: 'Consumer UID provenance scan, digital ownership registration, and warranty activation'
  },
  {
    id: 'K18',
    code: 'K18',
    titleFa: 'پرونده پس از فروش، مرجوعی و تعمیر',
    titleEn: 'After-sales Cases, Returns & Repairs',
    titleAr: 'حالات ما بعد البيع والإرجاع والإصلاح',
    titleFr: 'Service Après-vente, Retours et Réparations',
    status: 'planned',
    descriptionFa: 'پذیرش قطعه معیوب، ارسال به کارگاه سازنده برای تعمیر، جایگزینی و تحویل به مشتری',
    descriptionEn: 'Service ticket lifecycle, repair workshop routing, gem replacement, and warranty coverage'
  },
  {
    id: 'K19',
    code: 'K19',
    titleFa: 'بازخرید',
    titleEn: 'Buyback',
    titleAr: 'إعادة الشراء',
    titleFr: 'Rachat Garanti',
    status: 'planned',
    descriptionFa: 'محاسبه ارزش روز طلا، کارشناسی اصالت، پیشنهاد خرید تضمینی و واریز وجه یا معاوضه',
    descriptionEn: 'Guaranteed buyback pricing, physical condition assay, trade-in valuation, and settlement'
  },
  {
    id: 'K20',
    code: 'K20',
    titleFa: 'بازار ثانویه، بازسازی و بازیافت',
    titleEn: 'Secondary Market, Refurbishment & Recycling',
    titleAr: 'السوق الثانوية والتجديد وإعادة التدوير',
    titleFr: 'Marché Secondaire, Remise à Neuf et Recyclage',
    status: 'planned',
    descriptionFa: 'ارزیابی قطعات بازخرید شده برای جلا و عرضه مجدد، یا ذوب و بازیافت به طلای آب‌شده',
    descriptionEn: 'Secondary catalog re-listing, workshop refurbishment, or refining and scrap melt lifecycle'
  }
];
