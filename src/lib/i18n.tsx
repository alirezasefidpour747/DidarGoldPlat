/**
 * Didar Gold Platform - Internationalization System
 * Full dictionary for Persian (fa - RTL), Arabic (ar - RTL), English (en - LTR), and French (fr - LTR)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLocale = 'fa' | 'ar' | 'en' | 'fr';

export interface Translations {
  appName: string;
  appSubtitle: string;
  adminPanel: string;
  domainList: string;
  domains: string;
  k01Title: string;
  k01Subtitle: string;
  overview: string;
  persons: string;
  organizations: string;
  memberships: string;
  documents: string;
  auditTrail: string;
  createPerson: string;
  createOrganization: string;
  linkMembership: string;
  uploadDocument: string;
  searchPlaceholder: string;
  filterByType: string;
  filterByStatus: string;
  allTypes: string;
  allStatuses: string;
  statusActive: string;
  statusPending: string;
  statusSuspended: string;
  statusArchived: string;
  verificationUnverified: string;
  verificationPending: string;
  verificationVerified: string;
  verificationRejected: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  mobile: string;
  email: string;
  partyType: string;
  organizationType: string;
  legalName: string;
  displayName: string;
  actions: string;
  view: string;
  edit: string;
  save: string;
  cancel: string;
  close: string;
  refresh: string;
  exportData: string;
  successCreated: string;
  successUpdated: string;
  errorSaving: string;
  noRecordsFound: string;
  loading: string;
  confirmStatusChange: string;
  role: string;
  authorities: string;
  validityDates: string;
  documentsVault: string;
  changeHistory: string;
  specializedProfile: string;
  consumer: string;
  fieldAgent: string;
  internalUser: string;
  externalRepresentative: string;
  retailerOwner: string;
  supplierRepresentative: string;
  platformAdmin: string;
  didarOrg: string;
  retailer: string;
  manufacturer: string;
  wholesaler: string;
  supplier: string;
  agentOffice: string;
  servicePartner: string;
  other: string;
  productionInfo: string;
  distributionInfo: string;
  storeInfo: string;
  monthlyCapacity: string;
  grams: string;
  guildLicense: string;
  agentCode: string;
  personnelCode: string;
  supplierCode: string;
  retailerCode: string;
  territory: string;
  operatingMode: string;
  mobileGallery: string;
  assistedOrder: string;
  hybrid: string;
  connectedMemberships: string;
  canOrder: string;
  canSign: string;
  canManageMembers: string;
  canViewFinance: string;
  totalCounts: string;
  activeCount: string;
  verifiedCount: string;
  adminNotice: string;
  currentActor: string;
  exportJson: string;
  exportCsv: string;
}

const DICTIONARY: Record<SupportedLocale, Translations> = {
  fa: {
    appName: 'طلای دیدار',
    appSubtitle: 'سامانه یکپارچه زنجیره ارزش و عملیات طلا و جواهر',
    adminPanel: 'پنل عملیاتی مدیریت دیدار',
    domainList: '۲۰ دامنه ثابت هسته',
    domains: 'دامنه‌ها',
    k01Title: 'K01 — اشخاص، سازمان‌ها و عضویت‌ها',
    k01Subtitle: 'مدیریت هویت اشخاص حقیقی، پروانه‌های تجاری کسب‌وکارها، تفویض اختیارات و روابط سازمانی',
    overview: 'نمای کلی و آمار',
    persons: 'اشخاص حقیقی',
    organizations: 'سازمان‌ها و کسب‌وکارها',
    memberships: 'روابط عضویت و اختیارات',
    documents: 'اسناد و مدارک',
    auditTrail: 'دفتر حسابرسی و سوابق',
    createPerson: 'ثبت شخص جدید',
    createOrganization: 'تعریف سازمان جدید',
    linkMembership: 'ایجاد رابطه عضویت',
    uploadDocument: 'بارگذاری سند',
    searchPlaceholder: 'جستجو بر اساس نام، کدملی، شناسه، تلفن یا کد اختصاصی...',
    filterByType: 'فیلتر بر اساس نوع',
    filterByStatus: 'وضعیت فعالیت',
    allTypes: 'تمام انواع',
    allStatuses: 'تمام وضعیت‌ها',
    statusActive: 'فعال',
    statusPending: 'در انتظار بررسی',
    statusSuspended: 'معلق',
    statusArchived: 'بایگانی‌شده',
    verificationUnverified: 'بررسی‌نشده',
    verificationPending: 'در حال بررسی مدارک',
    verificationVerified: 'احراز هویت شده',
    verificationRejected: 'رد شده',
    firstName: 'نام',
    lastName: 'نام خانوادگی',
    nationalId: 'کد ملی / شناسه هویتی',
    mobile: 'شماره همراه',
    email: 'پست الکترونیکی',
    partyType: 'نوع شخصیت حقیقی',
    organizationType: 'نوع کسب‌وکار / سازمان',
    legalName: 'نام رسمی و ثبتی',
    displayName: 'نام تجاری / تابلویی',
    actions: 'عملیات',
    view: 'مشاهده پرونده',
    edit: 'ویرایش اطلاعات',
    save: 'ذخیره تغییرات',
    cancel: 'انصراف',
    close: 'بستن',
    refresh: 'به‌روزرسانی داده‌ها',
    exportData: 'خروجی داده‌ها',
    successCreated: 'رکورد با موفقیت ایجاد و ثبت پایدار گردید.',
    successUpdated: 'تغییرات با موفقیت در پایگاه داده ذخیره شد.',
    errorSaving: 'خطا در برقراری ارتباط با پایگاه داده یا نقص اعتبارسنجی.',
    noRecordsFound: 'هیچ رکوردی منطبق با جستجو یا فیلترهای انتخابی یافت نشد.',
    loading: 'در حال بارگذاری و همگام‌سازی اطلاعات...',
    confirmStatusChange: 'تغییر وضعیت',
    role: 'نقش سازمانی',
    authorities: 'حدود اختیارات',
    validityDates: 'بازه اعتبار زمانی',
    documentsVault: 'صندوق مدارک تاییدیه',
    changeHistory: 'تاریخچه تغییرات این رکورد',
    specializedProfile: 'اطلاعات تخصصی پرسونای شغلی',
    consumer: 'مشتری / مصرف‌کننده نهایی',
    fieldAgent: 'عامل میدانی ویزیتور',
    internalUser: 'کارمند / کاربر داخلی دیدار',
    externalRepresentative: 'نماینده رسمی کسب‌وکار',
    retailerOwner: 'مالک فروشگاه طلافروشی',
    supplierRepresentative: 'نماینده سازنده / بنکدار',
    platformAdmin: 'مدیر سیستمی (بدون مجوز خودکار)',
    didarOrg: 'سازمان مرکزی دیدار',
    retailer: 'خرده‌فروش (فروشگاه طلا)',
    manufacturer: 'سازنده / تولیدکننده طلا',
    wholesaler: 'بنکدار / عمده‌فروش',
    supplier: 'سایر تأمین‌کنندگان',
    agentOffice: 'دفتر نمایندگی عاملان',
    servicePartner: 'شریک آزمایشگاهی / خدماتی',
    other: 'سایر نهادها',
    productionInfo: 'اطلاعات کارگاه و خط تولید',
    distributionInfo: 'اطلاعات شبکه توزیع و انبار',
    storeInfo: 'مشخصات فروشگاه و جواز کسب',
    monthlyCapacity: 'ظرفیت تولید ماهانه',
    grams: 'گرم',
    guildLicense: 'شماره جواز کسب اتحادیه',
    agentCode: 'کد یکتای عامل',
    personnelCode: 'کد پرسنلی داخلی',
    supplierCode: 'کد سازنده / تأمین‌کننده',
    retailerCode: 'کد اختصاصی خرده‌فروشی',
    territory: 'قلمرو جغرافیایی تحت پوشش',
    operatingMode: 'شیوه کاری عامل',
    mobileGallery: 'گالری سیار (کیف)',
    assistedOrder: 'ویزیت و سفارش‌گیری',
    hybrid: 'ترکیبی (کیف + سفارش کاتالوگ)',
    connectedMemberships: 'سازمان‌های متصل و عضویت‌ها',
    canOrder: 'مجوز ثبت سفارش خرید',
    canSign: 'حق امضای اسناد رسمی',
    canManageMembers: 'مدیریت پرسنل سازمان',
    canViewFinance: 'دسترسی به دفاتر مالی و فاکتورها',
    totalCounts: 'مجموع کل',
    activeCount: 'فعال',
    verifiedCount: 'احراز هویت شده',
    adminNotice: 'انتخاب برچسب مدیر پلتفرم هیچ‌گونه دسترسی دستوری در سیستم ایجاد نمی‌کند و نیازمند تأیید جداگانه در لایه احراز هویت است.',
    currentActor: 'کاربر مجاز سیستم: مدیر ارشد هسته دیدار',
    exportJson: 'دریافت خروجی JSON',
    exportCsv: 'دریافت خروجی CSV'
  },
  ar: {
    appName: 'ذهب ديدار',
    appSubtitle: 'منظومة إدارة سلسلة القيمة وعمليات الذهب والمجوهرات',
    adminPanel: 'لوحة التحكم الإدارية لديدار',
    domainList: '۲۰ مجالاً رئيسياً في النواة',
    domains: 'المجالات',
    k01Title: 'K01 — الأشخاص والمنظمات والعضويات',
    k01Subtitle: 'إدارة هويات الأفراد وسجلات الشركات وتفويض الصلاحيات والعلاقات التعاقدية',
    overview: 'نظرة عامة وإحصائيات',
    persons: 'الأشخاص الطبيعيون',
    organizations: 'المنظمات والشركات',
    memberships: 'علاقات العضوية والصلاحيات',
    documents: 'الوثائق والمستندات',
    auditTrail: 'سجل التدقيق والتاريخ',
    createPerson: 'تسجيل شخص جديد',
    createOrganization: 'إضافة منظمة جديدة',
    linkMembership: 'إنشاء علاقة عضوية',
    uploadDocument: 'رفع مستند',
    searchPlaceholder: 'البحث بالاسم، الهوية، الهاتف أو الرمز...',
    filterByType: 'تصفية حسب النوع',
    filterByStatus: 'حالة النشاط',
    allTypes: 'جميع الأنواع',
    allStatuses: 'جميع الحالات',
    statusActive: 'نشط',
    statusPending: 'قيد الانتظار',
    statusSuspended: 'موقوف',
    statusArchived: 'مؤرشف',
    verificationUnverified: 'غير موثق',
    verificationPending: 'قيد المراجعة',
    verificationVerified: 'تم التوثيق',
    verificationRejected: 'مرفوض',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    nationalId: 'الرقم الوطني / الهوية',
    mobile: 'رقم الجوال',
    email: 'البريد الإلكتروني',
    partyType: 'نوع الشخص',
    organizationType: 'نوع المنظمة / النشاط',
    legalName: 'الاسم القانوني المسجل',
    displayName: 'الاسم التجاري',
    actions: 'العمليات',
    view: 'عرض الملف',
    edit: 'تعديل البيانات',
    save: 'حفظ التغييرات',
    cancel: 'إلغاء',
    close: 'إغلاق',
    refresh: 'تحديث البيانات',
    exportData: 'تصدير البيانات',
    successCreated: 'تم إنشاء السجل وحفظه بنجاح.',
    successUpdated: 'تم تحديث التغييرات في قاعدة البيانات بنجاح.',
    errorSaving: 'حدث خطأ أثناء حفظ البيانات.',
    noRecordsFound: 'لم يتم العثور على سجلات مطابقة للبحث.',
    loading: 'جاري تحميل البيانات...',
    confirmStatusChange: 'تغيير الحالة',
    role: 'الدور التنظيمي',
    authorities: 'حدود الصلاحيات',
    validityDates: 'فترة الصلاحية',
    documentsVault: 'خزانة المستندات والشهادات',
    changeHistory: 'سجل تغييرات هذا الملف',
    specializedProfile: 'الملف التخصصي',
    consumer: 'مستهلك نهائي',
    fieldAgent: 'وكيل ميداني',
    internalUser: 'موظف داخلي',
    externalRepresentative: 'ممثل تجاري معتمد',
    retailerOwner: 'مالك متجر تجزئة',
    supplierRepresentative: 'ممثل مصنع / تاجر جملة',
    platformAdmin: 'مسؤول المنصة (بدون صلاحيات تلقائية)',
    didarOrg: 'منظمة ديدار الرئيسية',
    retailer: 'تاجر تجزئة (متجر مجوهرات)',
    manufacturer: 'مصنع ذهب',
    wholesaler: 'تاجر جملة',
    supplier: 'مورد آخر',
    agentOffice: 'مكتب الوكلاء',
    servicePartner: 'شريك فحص / خدمات',
    other: 'جهات أخرى',
    productionInfo: 'بيانات ورشة الإنتاج',
    distributionInfo: 'بيانات التوزيع والمستودعات',
    storeInfo: 'بيانات المتجر والترخيص',
    monthlyCapacity: 'القدرة الإنتاجية الشهرية',
    grams: 'جرام',
    guildLicense: 'رقم رخصة النقابة',
    agentCode: 'رمز الوكيل',
    personnelCode: 'الرقم الوظيفي',
    supplierCode: 'رمز المورد',
    retailerCode: 'رمز تاجر التجزئة',
    territory: 'المنطقة الجغرافية',
    operatingMode: 'أسلوب عمل الوكيل',
    mobileGallery: 'معرض متنقل (حقيبة)',
    assistedOrder: 'زيارات وأخذ طلبات',
    hybrid: 'مختلط (حقيبة + كتالوج)',
    connectedMemberships: 'المنظمات المرتبطة',
    canOrder: 'صلاحية تقديم الطلبات',
    canSign: 'صلاحية التوقيع المعتمد',
    canManageMembers: 'إدارة الأعضاء',
    canViewFinance: 'الاطلاع على السجلات المالية',
    totalCounts: 'المجموع الكلي',
    activeCount: 'نشط',
    verifiedCount: 'موثق',
    adminNotice: 'تحديد مسمى مسؤول المنصة لا يمنح أي صلاحيات وصول تلقائية للمستخدم.',
    currentActor: 'المشغل الحالي: مدير العمليات الرئيسي',
    exportJson: 'تصدير JSON',
    exportCsv: 'تصدير CSV'
  },
  en: {
    appName: 'Didar Gold',
    appSubtitle: 'Gold & Jewelry Value Chain Ecosystem and Operating Core',
    adminPanel: 'Didar Operational Admin Panel',
    domainList: '20 Fixed Kernel Domains',
    domains: 'Domains',
    k01Title: 'K01 — People, Organizations & Memberships',
    k01Subtitle: 'Directory of natural persons, business entities, delegation of authority, and verification vaults',
    overview: 'Overview & Metrics',
    persons: 'Natural Persons',
    organizations: 'Enterprises & Entities',
    memberships: 'Memberships & Delegations',
    documents: 'Documents & Vault',
    auditTrail: 'Audit Trail & History',
    createPerson: 'New Person',
    createOrganization: 'New Organization',
    linkMembership: 'Link Membership',
    uploadDocument: 'Upload Document',
    searchPlaceholder: 'Search by name, national ID, phone, code or business name...',
    filterByType: 'Filter by Type',
    filterByStatus: 'Filter by Status',
    allTypes: 'All Types',
    allStatuses: 'All Statuses',
    statusActive: 'Active',
    statusPending: 'Pending Review',
    statusSuspended: 'Suspended',
    statusArchived: 'Archived',
    verificationUnverified: 'Unverified',
    verificationPending: 'Pending Verification',
    verificationVerified: 'Verified',
    verificationRejected: 'Rejected',
    firstName: 'First Name',
    lastName: 'Last Name',
    nationalId: 'National ID / Tax ID',
    mobile: 'Mobile Number',
    email: 'Email Address',
    partyType: 'Person Classification',
    organizationType: 'Business Type',
    legalName: 'Legal Entity Name',
    displayName: 'Display / Trade Name',
    actions: 'Actions',
    view: 'View Profile',
    edit: 'Edit Details',
    save: 'Save Changes',
    cancel: 'Cancel',
    close: 'Close',
    refresh: 'Refresh Data',
    exportData: 'Export Records',
    successCreated: 'Record successfully created and persisted.',
    successUpdated: 'Changes successfully saved to database.',
    errorSaving: 'Failed to persist changes. Please check validations.',
    noRecordsFound: 'No records matching criteria.',
    loading: 'Synchronizing records...',
    confirmStatusChange: 'Change Status',
    role: 'Organizational Role',
    authorities: 'Delegated Authorities',
    validityDates: 'Validity Window',
    documentsVault: 'Verification Documents Vault',
    changeHistory: 'Audit History',
    specializedProfile: 'Specialized Profile Fields',
    consumer: 'End Consumer',
    fieldAgent: 'Field Sales Agent',
    internalUser: 'Internal Employee',
    externalRepresentative: 'Business Representative',
    retailerOwner: 'Retailer Owner',
    supplierRepresentative: 'Supplier Representative',
    platformAdmin: 'Platform Administrator (Label Only)',
    didarOrg: 'Didar Core Organization',
    retailer: 'Retailer (Jewelry Store)',
    manufacturer: 'Gold Manufacturer',
    wholesaler: 'Wholesaler / Distributor',
    supplier: 'Other Supplier',
    agentOffice: 'Agent Territory Office',
    servicePartner: 'Service / Assay Partner',
    other: 'Other Organization',
    productionInfo: 'Production & Manufacturing Facility',
    distributionInfo: 'Distribution & Vault Storage',
    storeInfo: 'Storefront & Guild Licensing',
    monthlyCapacity: 'Monthly Output Capacity',
    grams: 'Grams',
    guildLicense: 'Guild Union License No.',
    agentCode: 'Unique Agent Code',
    personnelCode: 'Internal Personnel Code',
    supplierCode: 'Supplier / Maker Code',
    retailerCode: 'Retailer Account Code',
    territory: 'Designated Sales Territory',
    operatingMode: 'Agent Operating Mode',
    mobileGallery: 'Mobile Showcase (Bag)',
    assistedOrder: 'Assisted Order Placement',
    hybrid: 'Hybrid (Bag + Catalog)',
    connectedMemberships: 'Connected Organizations & Roles',
    canOrder: 'Can Place Orders',
    canSign: 'Can Sign Official Binding Contracts',
    canManageMembers: 'Can Manage Entity Members',
    canViewFinance: 'Can View Financial Subledgers',
    totalCounts: 'Total Records',
    activeCount: 'Active',
    verifiedCount: 'Verified',
    adminNotice: 'Assigning the platform administrator label does not grant system access. Access requires independent authorization.',
    currentActor: 'Operator: Didar Core Operations Admin',
    exportJson: 'Export JSON',
    exportCsv: 'Export CSV'
  },
  fr: {
    appName: 'Didar Gold',
    appSubtitle: 'Écosystème de la chaîne de valeur de l\'or et cœur opérationnel',
    adminPanel: 'Panneau d\'Administration Opérationnel Didar',
    domainList: '20 Domaines Principaux Fixes',
    domains: 'Domaines',
    k01Title: 'K01 — Personnes, Organisations et Adhésions',
    k01Subtitle: 'Répertoire des personnes physiques, entreprises, délégations de pouvoir et coffre de vérification',
    overview: 'Vue d\'Ensemble et Métriques',
    persons: 'Personnes Physiques',
    organizations: 'Entreprises et Organisations',
    memberships: 'Adhésions et Délégations',
    documents: 'Documents et Coffre-fort',
    auditTrail: 'Journal d\'Audit et Historique',
    createPerson: 'Nouvelle Personne',
    createOrganization: 'Nouvelle Organisation',
    linkMembership: 'Lier une Adhésion',
    uploadDocument: 'Téléverser un Document',
    searchPlaceholder: 'Rechercher par nom, identifiant, téléphone ou code...',
    filterByType: 'Filtrer par type',
    filterByStatus: 'Filtrer par statut',
    allTypes: 'Tous les types',
    allStatuses: 'Tous les statuts',
    statusActive: 'Actif',
    statusPending: 'En attente',
    statusSuspended: 'Suspendu',
    statusArchived: 'Archivé',
    verificationUnverified: 'Non vérifié',
    verificationPending: 'Vérification en cours',
    verificationVerified: 'Vérifié',
    verificationRejected: 'Rejeté',
    firstName: 'Prénom',
    lastName: 'Nom',
    nationalId: 'Numéro d\'identité / Fiscal',
    mobile: 'Téléphone Mobile',
    email: 'Adresse Courriel',
    partyType: 'Type de Personne',
    organizationType: 'Type d\'Entreprise',
    legalName: 'Raison Sociale',
    displayName: 'Nom Commercial',
    actions: 'Actions',
    view: 'Voir le Dossier',
    edit: 'Modifier',
    save: 'Enregistrer',
    cancel: 'Annuler',
    close: 'Fermer',
    refresh: 'Actualiser',
    exportData: 'Exporter',
    successCreated: 'Enregistrement créé et persisté avec succès.',
    successUpdated: 'Modifications enregistrées avec succès.',
    errorSaving: 'Échec de l\'enregistrement des modifications.',
    noRecordsFound: 'Aucun enregistrement correspondant trouvé.',
    loading: 'Synchronisation des données en cours...',
    confirmStatusChange: 'Changer le statut',
    role: 'Rôle Organisationnel',
    authorities: 'Pouvoirs Délégués',
    validityDates: 'Période de Validité',
    documentsVault: 'Coffre des Documents de Conformité',
    changeHistory: 'Historique d\'Audit',
    specializedProfile: 'Champs Spécialisés du Profil',
    consumer: 'Consommateur Final',
    fieldAgent: 'Agent de Terrain',
    internalUser: 'Employé Interne',
    externalRepresentative: 'Représentant Commercial',
    retailerOwner: 'Propriétaire de Bijouterie',
    supplierRepresentative: 'Représentant Fournisseur',
    platformAdmin: 'Administrateur Plateforme (Étiquette seule)',
    didarOrg: 'Organisation Centrale Didar',
    retailer: 'Détaillant (Bijouterie)',
    manufacturer: 'Fabricant d\'Or',
    wholesaler: 'Grossiste / Distributeur',
    supplier: 'Autre Fournisseur',
    agentOffice: 'Bureau Régional d\'Agents',
    servicePartner: 'Partenaire Service / Laboratoire',
    other: 'Autre Organisation',
    productionInfo: 'Atelier et Capacité de Production',
    distributionInfo: 'Entrepôt et Distribution',
    storeInfo: 'Boutique et Licence Professionnelle',
    monthlyCapacity: 'Capacité Mensuelle',
    grams: 'Grammes',
    guildLicense: 'Numéro de Licence de Guilde',
    agentCode: 'Code Unique Agent',
    personnelCode: 'Matricule Employé',
    supplierCode: 'Code Fabricant',
    retailerCode: 'Code Détaillant',
    territory: 'Territoire Assigné',
    operatingMode: 'Mode Opératoire de l\'Agent',
    mobileGallery: 'Vitrine Mobile (Sac)',
    assistedOrder: 'Prise de Commande Assistée',
    hybrid: 'Hybride (Sac + Catalogue)',
    connectedMemberships: 'Organisations Liées et Rôles',
    canOrder: 'Peut Passer des Commandes',
    canSign: 'Peut Signer des Contrats',
    canManageMembers: 'Peut Gérer les Membres',
    canViewFinance: 'Peut Consulter les Livres Financiers',
    totalCounts: 'Total des Enregistrements',
    activeCount: 'Actif',
    verifiedCount: 'Vérifié',
    adminNotice: 'L\'attribution de l\'étiquette d\'administrateur n\'accorde aucun droit d\'accès automatique.',
    currentActor: 'Opérateur : Administrateur Principal Didar',
    exportJson: 'Exporter en JSON',
    exportCsv: 'Exporter en CSV'
  }
};

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (loc: SupportedLocale) => void;
  t: Translations;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>('fa');

  const setLocale = (loc: SupportedLocale) => {
    setLocaleState(loc);
    const isRtl = loc === 'fa' || loc === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = loc;
  };

  useEffect(() => {
    const isRtl = locale === 'fa' || locale === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  const isRTL = locale === 'fa' || locale === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const t = DICTIONARY[locale];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRTL, dir }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
