/**
 * Didar Gold Platform - Server Storage Engine
 * High-reliability transactional persistence engine with disk backing & Supabase synchronization
 */

import fs from 'fs';
import path from 'path';
import {
  Party,
  Organization,
  Membership,
  PartyDocument,
  AuditEvent,
  K01DataPayload
} from '../src/types/k01.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'didar-kernel-store.json');

// Memory cache + write-lock
let cachedData: K01DataPayload | null = null;
let isSaving = false;
let pendingSave = false;

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data with authentic Didar Gold ecosystem entities
function getInitialSeedData(): K01DataPayload {
  const now = new Date().toISOString();

  // Initial Organizations
  const didarOrg: Organization = {
    id: 'org-didar-core-001',
    legalName: 'شرکت فناوری طلای دیدار (سهامی خاص)',
    displayName: 'هسته مرکزی دیدار',
    organizationType: 'didar',
    registrationNumber: '584920',
    nationalLegalId: '14010892341',
    economicCode: '411589234112',
    website: 'https://didargold.com',
    phone: '021-88452100',
    email: 'ops@didargold.com',
    province: 'تهران',
    city: 'تهران',
    address: 'تهران، خیابان کریم‌خان زند، پلاک ۱۱۸، برج طلا، طبقه ۵',
    postalCode: '1584739182',
    status: 'active',
    verificationStatus: 'verified',
    notes: 'نهاد اصلی راه‌بر پلتفرم دیدار طلا',
    createdAt: now,
    updatedAt: now,
    version: 1
  };

  const manufacturerOrg: Organization = {
    id: 'org-mfg-espadana-002',
    legalName: 'صنایع زرین‌سازان اسپادانا',
    displayName: 'کارگاه تولیدی زرین اسپادانا',
    organizationType: 'manufacturer',
    registrationNumber: '39412',
    nationalLegalId: '10260481923',
    economicCode: '411234981290',
    website: 'https://espadanagold.ir',
    phone: '031-32214488',
    email: 'info@espadanagold.ir',
    province: 'اصفهان',
    city: 'اصفهان',
    address: 'اصفهان، میدان نقش جهان، بازار قیصریه، سرای مخلص، پلاک ۲۴',
    postalCode: '8146593214',
    status: 'active',
    verificationStatus: 'verified',
    notes: 'تولیدکننده النگو و دستبندهای ریخته‌گری عیار ۷۵۰ با ظرفیت استاندارد',
    manufacturerProfile: {
      supplierCode: 'MFG-ESP-750',
      brandName: 'اسپادانا گلد',
      productionLicenseNumber: 'IND-9482-ESF',
      productCategories: 'النگو داماس، دستبند زنجیری، مدال قلمزنی',
      monthlyCapacityGrams: 8500,
      workshopAddress: 'اصفهان، شهرک صنعتی طلا و جواهر جی، قطعه ۱۲',
      purityStandards: ['750 (18K)']
    },
    createdAt: now,
    updatedAt: now,
    version: 1
  };

  const wholesalerOrg: Organization = {
    id: 'org-whs-pars-003',
    legalName: 'بازرگانی طلا و جواهر پارس زرین',
    displayName: 'بنکداری پارس طلا',
    organizationType: 'wholesaler',
    registrationNumber: '11284',
    nationalLegalId: '10380291482',
    phone: '021-55618290',
    email: 'trade@parsgold.ir',
    province: 'تهران',
    city: 'تهران',
    address: 'تهران، بازار بزرگ، پاساژ حکیم هاشمی، طبقه اول، پلاک ۴۲',
    postalCode: '1163849120',
    status: 'active',
    verificationStatus: 'verified',
    notes: 'بنکدار عمده توزیع‌کننده در پهنه مرکز و غرب کشور',
    wholesalerProfile: {
      supplierCode: 'WHS-PRS-001',
      brandName: 'پارس زرین',
      licenseNumber: 'UN-WHS-4819',
      productCategories: 'سرویس‌های مجلسی، حلقه‌های ست، زنجیر کارتیه',
      coverageTerritory: 'استان‌های تهران، البرز، قزوین، زنجان',
      warehouseAddress: 'تهران، بازار بزرگ، خزانه مرکزی پارس طلا',
      goldInventoryCapacityGrams: 25000
    },
    createdAt: now,
    updatedAt: now,
    version: 1
  };

  const retailerOrg: Organization = {
    id: 'org-ret-parnia-004',
    legalName: 'گالری طلا و جواهرات پرنیا (با مسئولیت محدود)',
    displayName: 'طلا و جواهری پرنیا',
    organizationType: 'retailer',
    registrationNumber: '84912',
    nationalLegalId: '14008491280',
    phone: '021-22681490',
    website: 'https://parniagallery.com',
    email: 'contact@parniagallery.com',
    province: 'تهران',
    city: 'تهران',
    address: 'تهران، سعادت‌آباد، مجتمع تجاری رویال، طبقه همکف، واحد ۱۲',
    postalCode: '1998847123',
    status: 'active',
    verificationStatus: 'verified',
    notes: 'فروشگاه طلا و جواهری لوکس با ویترین دیجیتال دیدار',
    retailerProfile: {
      retailerCode: 'RET-TEH-0104',
      guildLicenseNumber: 'GL-8491-TEH',
      guildUnionName: 'اتحادیه صنف سازندگان و فروشندگان طلا، جواهر، نقره و سکه تهران',
      storeType: 'mall_store',
      salesChannels: ['فروش حضوری', 'ویترین آنلاین اختصاصی', 'سفارش عامل'],
      storefrontAddress: 'تهران، سعادت‌آباد، مجتمع رویال، واحد ۱۲',
      displayCapacityPieces: 180
    },
    createdAt: now,
    updatedAt: now,
    version: 1
  };

  // Initial Persons
  const adminPerson: Party = {
    id: 'party-admin-001',
    partyType: 'internal_user',
    firstName: 'علیرضا',
    lastName: 'سفیدپور',
    nationalId: '0018491284',
    mobile: '09121112233',
    email: 'ali.sefidpour@didargold.com',
    status: 'active',
    verificationStatus: 'verified',
    notes: 'مدیر ارشد عملیات پلتفرم دیدار',
    internalProfile: {
      personnelCode: 'EMP-DIDAR-001',
      department: 'مدیریت ارشد و عملیات هسته',
      jobTitle: 'مدیر عملیات هسته (Chief Operations Officer)',
      employmentType: 'employed',
      startDate: '2023-04-15'
    },
    createdAt: now,
    updatedAt: now,
    version: 1
  };

  const fieldAgentPerson: Party = {
    id: 'party-agent-002',
    partyType: 'field_agent',
    firstName: 'محمدرضا',
    lastName: 'شفیعی',
    nationalId: '1289410293',
    mobile: '09132223344',
    email: 'm.shafiei@didargold.com',
    status: 'active',
    verificationStatus: 'verified',
    notes: 'عامل میدانی ارشد منطقه مرکزی و اصفهان با کیف طلای فعال',
    agentProfile: {
      agentCode: 'AGT-ISF-101',
      operatingMode: 'hybrid',
      territory: 'اصفهان، کاشان، نجف‌آباد',
      employmentType: 'partner',
      commissionRatePercent: 1.8,
      startDate: '2024-01-10'
    },
    createdAt: now,
    updatedAt: now,
    version: 1
  };

  const retailerOwnerPerson: Party = {
    id: 'party-owner-003',
    partyType: 'retailer_owner',
    firstName: 'حسین',
    lastName: 'میرزایی',
    nationalId: '0074819201',
    mobile: '09124445566',
    email: 'h.mirzaei@parniagallery.com',
    status: 'active',
    verificationStatus: 'verified',
    notes: 'مالک و صاحب جواز گالری پرنیا سعادت‌آباد',
    createdAt: now,
    updatedAt: now,
    version: 1
  };

  const consumerPerson: Party = {
    id: 'party-consumer-004',
    partyType: 'consumer',
    firstName: 'سارا',
    lastName: 'طاهری',
    nationalId: '0089201481',
    mobile: '09127778899',
    email: 'sara.taheri@gmail.com',
    status: 'active',
    verificationStatus: 'verified',
    notes: 'خریدار محصولات دیدار با ثبت ضمانت اصالت',
    consumerProfile: {
      birthDate: '1992-06-21',
      preferredContactMethod: 'sms',
      address: 'تهران، یوسف‌آباد، خیابان شصت و چهارم، پلاک ۵',
      city: 'تهران',
      province: 'تهران',
      postalCode: '1439812041'
    },
    createdAt: now,
    updatedAt: now,
    version: 1
  };

  // Initial Memberships
  const memberships: Membership[] = [
    {
      id: 'mem-admin-didar-001',
      partyId: adminPerson.id,
      organizationId: didarOrg.id,
      roleKey: 'owner',
      title: 'مدیر ارشد پلتفرم دیدار',
      authorities: ['can_order', 'can_sign', 'can_manage_members', 'can_view_finance'],
      isPrimary: true,
      status: 'active',
      validFrom: '2023-01-01',
      validTo: '2028-12-29',
      notes: 'اختیارات کامل مدیریت سیستمی و حسابرسی',
      partyName: `${adminPerson.firstName} ${adminPerson.lastName}`,
      organizationName: didarOrg.displayName,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'mem-owner-parnia-002',
      partyId: retailerOwnerPerson.id,
      organizationId: retailerOrg.id,
      roleKey: 'retailer_owner',
      title: 'مالک و مدیر اجرایی گالری پرنیا',
      authorities: ['can_order', 'can_sign', 'can_manage_members', 'can_view_finance'],
      isPrimary: true,
      status: 'active',
      validFrom: '2023-05-01',
      validTo: '2027-05-01',
      notes: 'دارنده تام‌الاختیار حساب تجاری پرنیا',
      partyName: `${retailerOwnerPerson.firstName} ${retailerOwnerPerson.lastName}`,
      organizationName: retailerOrg.displayName,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'mem-agent-didar-003',
      partyId: fieldAgentPerson.id,
      organizationId: didarOrg.id,
      roleKey: 'agent',
      title: 'عامل فروش و تحویل میدانی',
      authorities: ['can_order'],
      isPrimary: true,
      status: 'active',
      validFrom: '2024-01-01',
      validTo: '2026-12-31',
      notes: 'دارای دسترسی ثبت سفارش به نیابت و تحویل از کیف',
      partyName: `${fieldAgentPerson.firstName} ${fieldAgentPerson.lastName}`,
      organizationName: didarOrg.displayName,
      createdAt: now,
      updatedAt: now
    }
  ];

  // Initial Documents
  const documents: PartyDocument[] = [
    {
      id: 'doc-parnia-license-001',
      targetType: 'organization',
      targetId: retailerOrg.id,
      documentType: 'guild_license',
      fileName: 'parnia_guild_license_1403.pdf',
      fileSize: 1420500,
      mimeType: 'application/pdf',
      fileUri: 'secure://party-documents/org-ret-parnia-004/parnia_guild_license.pdf',
      verificationStatus: 'verified',
      uploadedBy: adminPerson.id,
      notes: 'پروانه کسب معتبر صادره از اتحادیه طلا و جواهر تهران',
      createdAt: now
    },
    {
      id: 'doc-espadana-cert-002',
      targetType: 'organization',
      targetId: manufacturerOrg.id,
      documentType: 'company_registration',
      fileName: 'espadana_industrial_license.pdf',
      fileSize: 2180400,
      mimeType: 'application/pdf',
      fileUri: 'secure://party-documents/org-mfg-espadana-002/license.pdf',
      verificationStatus: 'verified',
      uploadedBy: adminPerson.id,
      notes: 'پروانه بهره‌برداری کارگاهی از اداره استاندارد و صنایع اصفهان',
      createdAt: now
    }
  ];

  // Initial Audit Logs
  const auditLogs: AuditEvent[] = [
    {
      id: 'audit-001',
      actorId: adminPerson.id,
      actorName: `${adminPerson.firstName} ${adminPerson.lastName}`,
      action: 'create',
      targetType: 'organization',
      targetId: didarOrg.id,
      targetName: didarOrg.displayName,
      description: 'تعریف سازمان مرکزی پلتفرم دیدار طلا',
      timestamp: now
    },
    {
      id: 'audit-002',
      actorId: adminPerson.id,
      actorName: `${adminPerson.firstName} ${adminPerson.lastName}`,
      action: 'membership_link',
      targetType: 'membership',
      targetId: memberships[1].id,
      targetName: `${retailerOwnerPerson.firstName} ${retailerOwnerPerson.lastName} -> ${retailerOrg.displayName}`,
      description: 'ثبت رابطه عضویت مالک خرده‌فروشی برای گالری پرنیا با کلیه اختیارات تجاری',
      timestamp: now
    }
  ];

  const persons = [adminPerson, fieldAgentPerson, retailerOwnerPerson, consumerPerson];
  const organizations = [didarOrg, manufacturerOrg, wholesalerOrg, retailerOrg];

  return {
    persons,
    organizations,
    memberships,
    documents,
    auditLogs,
    counts: {
      totalPersons: persons.length,
      totalOrganizations: organizations.length,
      totalMemberships: memberships.length,
      activePersons: persons.filter(p => p.status === 'active').length,
      activeOrganizations: organizations.filter(o => o.status === 'active').length,
      verifiedPersons: persons.filter(p => p.verificationStatus === 'verified').length,
      verifiedOrganizations: organizations.filter(o => o.verificationStatus === 'verified').length
    }
  };
}

export function loadStore(): K01DataPayload {
  if (cachedData) {
    return cachedData;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      cachedData = JSON.parse(raw);
      recalculateCounts(cachedData!);
      return cachedData!;
    }
  } catch (err) {
    console.error('[Storage] Error reading storage file, initializing seed data:', err);
  }

  cachedData = getInitialSeedData();
  saveStoreImmediate(cachedData);
  return cachedData;
}

function recalculateCounts(store: K01DataPayload) {
  store.counts = {
    totalPersons: store.persons.length,
    totalOrganizations: store.organizations.length,
    totalMemberships: store.memberships.length,
    activePersons: store.persons.filter(p => p.status === 'active').length,
    activeOrganizations: store.organizations.filter(o => o.status === 'active').length,
    verifiedPersons: store.persons.filter(p => p.verificationStatus === 'verified').length,
    verifiedOrganizations: store.organizations.filter(o => o.verificationStatus === 'verified').length
  };
}

function saveStoreImmediate(store: K01DataPayload) {
  recalculateCounts(store);
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Failed to write data file:', err);
  }
}

export async function saveStore(store: K01DataPayload): Promise<void> {
  cachedData = store;
  recalculateCounts(store);

  if (isSaving) {
    pendingSave = true;
    return;
  }

  isSaving = true;
  try {
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Async write error:', err);
  } finally {
    isSaving = false;
    if (pendingSave) {
      pendingSave = false;
      saveStore(cachedData);
    }
  }
}

// ----------------- CRUD Operations with Integrity & Audit -----------------

export async function createPerson(data: Partial<Party>, actorName: string = 'مدیر سیستم'): Promise<Party> {
  const store = loadStore();

  // Validate duplicate mobile or codes
  const normalizedMobile = (data.mobile || '').replace(/\D/g, '');
  if (!normalizedMobile || normalizedMobile.length < 10) {
    throw new Error('شماره همراه معتبر الزامی است.');
  }

  if (store.persons.some(p => p.mobile === normalizedMobile)) {
    throw new Error('شخصی با این شماره همراه قبلاً در سامانه ثبت شده است.');
  }

  if (data.nationalId) {
    const existing = store.persons.find(p => p.nationalId === data.nationalId);
    if (existing) {
      throw new Error(`کد ملی ${data.nationalId} قبلاً برای شخص ${existing.firstName} ${existing.lastName} ثبت شده است.`);
    }
  }

  // Specialized profile validations
  if (data.partyType === 'field_agent') {
    if (!data.agentProfile?.agentCode) {
      throw new Error('کد یکتای عامل برای پرسونای عامل میدانی الزامی است.');
    }
    const codeExists = store.persons.some(p => p.agentProfile?.agentCode === data.agentProfile?.agentCode);
    if (codeExists) {
      throw new Error(`کد عامل ${data.agentProfile.agentCode} تکراری است.`);
    }
  }

  if (data.partyType === 'internal_user') {
    if (!data.internalProfile?.personnelCode) {
      throw new Error('کد پرسنلی برای کاربر داخلی الزامی است.');
    }
    const codeExists = store.persons.some(p => p.internalProfile?.personnelCode === data.internalProfile?.personnelCode);
    if (codeExists) {
      throw new Error(`کد پرسنلی ${data.internalProfile.personnelCode} تکراری است.`);
    }
  }

  const now = new Date().toISOString();
  const newPerson: Party = {
    id: `party-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    partyType: data.partyType || 'consumer',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    nationalId: data.nationalId || '',
    mobile: normalizedMobile,
    email: data.email || '',
    status: data.status || 'pending',
    verificationStatus: data.verificationStatus || 'unverified',
    notes: data.notes || '',
    consumerProfile: data.consumerProfile,
    agentProfile: data.agentProfile,
    internalProfile: data.internalProfile,
    representativeProfile: data.representativeProfile,
    createdAt: now,
    updatedAt: now,
    version: 1
  };

  store.persons.unshift(newPerson);

  // Atomic audit write
  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorId: 'actor-admin',
    actorName,
    action: 'create',
    targetType: 'party',
    targetId: newPerson.id,
    targetName: `${newPerson.firstName} ${newPerson.lastName}`,
    description: `ثبت شخص جدید با عنوان «${newPerson.firstName} ${newPerson.lastName}» و نوع «${newPerson.partyType}»`,
    timestamp: now
  });

  await saveStore(store);
  return newPerson;
}

export async function updatePerson(id: string, updates: Partial<Party>, actorName: string = 'مدیر سیستم'): Promise<Party> {
  const store = loadStore();
  const index = store.persons.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('شخص مورد نظر یافت نشد (کد ۴۰۴).');
  }

  const existing = store.persons[index];

  // Concurrency conflict check
  if (updates.version && updates.version !== existing.version) {
    throw new Error('تعارض در نسخه رکورد (Concurrent Edit Conflict). داده توسط کاربر دیگری تغییر یافته است.');
  }

  // Duplicate checks if changed
  if (updates.mobile && updates.mobile !== existing.mobile) {
    const norm = updates.mobile.replace(/\D/g, '');
    if (store.persons.some(p => p.id !== id && p.mobile === norm)) {
      throw new Error('شماره همراه جدید با شخص دیگری در سامانه تداخل دارد.');
    }
    updates.mobile = norm;
  }

  if (updates.nationalId && updates.nationalId !== existing.nationalId) {
    if (store.persons.some(p => p.id !== id && p.nationalId === updates.nationalId)) {
      throw new Error('کد ملی جدید با شخص دیگری در سامانه تداخل دارد.');
    }
  }

  const now = new Date().toISOString();
  const updatedPerson: Party = {
    ...existing,
    ...updates,
    consumerProfile: updates.consumerProfile !== undefined ? updates.consumerProfile : existing.consumerProfile,
    agentProfile: updates.agentProfile !== undefined ? updates.agentProfile : existing.agentProfile,
    internalProfile: updates.internalProfile !== undefined ? updates.internalProfile : existing.internalProfile,
    representativeProfile: updates.representativeProfile !== undefined ? updates.representativeProfile : existing.representativeProfile,
    updatedAt: now,
    version: existing.version + 1
  };

  store.persons[index] = updatedPerson;

  // Audit event
  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorId: 'actor-admin',
    actorName,
    action: 'update',
    targetType: 'party',
    targetId: updatedPerson.id,
    targetName: `${updatedPerson.firstName} ${updatedPerson.lastName}`,
    description: `ویرایش اطلاعات پرونده شخص «${updatedPerson.firstName} ${updatedPerson.lastName}»`,
    timestamp: now
  });

  await saveStore(store);
  return updatedPerson;
}

export async function createOrganization(data: Partial<Organization>, actorName: string = 'مدیر سیستم'): Promise<Organization> {
  const store = loadStore();

  if (!data.legalName || !data.displayName) {
    throw new Error('نام رسمی و نام تابلویی سازمان الزامی است.');
  }

  if (data.nationalLegalId) {
    const existing = store.organizations.find(o => o.nationalLegalId === data.nationalLegalId);
    if (existing) {
      throw new Error(`شناسه ملی ${data.nationalLegalId} قبلاً برای سازمان «${existing.displayName}» ثبت شده است.`);
    }
  }

  // Type-specific validations
  if (data.organizationType === 'manufacturer') {
    if (!data.manufacturerProfile?.supplierCode) {
      throw new Error('کد سازنده برای تولیدکننده الزامی است.');
    }
    if (!data.manufacturerProfile?.monthlyCapacityGrams) {
      throw new Error('ظرفیت تولید ماهانه برای تولیدکننده الزامی است.');
    }
  }

  if (data.organizationType === 'retailer') {
    if (!data.retailerProfile?.retailerCode) {
      throw new Error('کد خرده‌فروشی الزامی است.');
    }
    if (!data.retailerProfile?.guildLicenseNumber) {
      throw new Error('شماره جواز کسب اتحادیه برای خرده‌فروشی الزامی است.');
    }
  }

  if (data.organizationType === 'wholesaler') {
    if (!data.wholesalerProfile?.supplierCode) {
      throw new Error('کد بنکداری برای عمده‌فروش الزامی است.');
    }
  }

  const now = new Date().toISOString();
  const newOrg: Organization = {
    id: `org-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    legalName: data.legalName,
    displayName: data.displayName,
    organizationType: data.organizationType || 'retailer',
    registrationNumber: data.registrationNumber || '',
    nationalLegalId: data.nationalLegalId || '',
    economicCode: data.economicCode || '',
    website: data.website || '',
    phone: data.phone || '',
    email: data.email || '',
    province: data.province || '',
    city: data.city || '',
    address: data.address || '',
    postalCode: data.postalCode || '',
    status: data.status || 'pending',
    verificationStatus: data.verificationStatus || 'unverified',
    notes: data.notes || '',
    retailerProfile: data.retailerProfile,
    manufacturerProfile: data.manufacturerProfile,
    wholesalerProfile: data.wholesalerProfile,
    supplierProfile: data.supplierProfile,
    agentOfficeProfile: data.agentOfficeProfile,
    servicePartnerProfile: data.servicePartnerProfile,
    createdAt: now,
    updatedAt: now,
    version: 1
  };

  store.organizations.unshift(newOrg);

  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorId: 'actor-admin',
    actorName,
    action: 'create',
    targetType: 'organization',
    targetId: newOrg.id,
    targetName: newOrg.displayName,
    description: `تعریف سازمان جدید با عنوان «${newOrg.displayName}» و نوع «${newOrg.organizationType}»`,
    timestamp: now
  });

  await saveStore(store);
  return newOrg;
}

export async function updateOrganization(id: string, updates: Partial<Organization>, actorName: string = 'مدیر سیستم'): Promise<Organization> {
  const store = loadStore();
  const index = store.organizations.findIndex(o => o.id === id);
  if (index === -1) {
    throw new Error('سازمان مورد نظر یافت نشد (کد ۴۰۴).');
  }

  const existing = store.organizations[index];

  if (updates.version && updates.version !== existing.version) {
    throw new Error('تعارض در نسخه رکورد (Concurrent Edit Conflict). داده توسط کاربر دیگری تغییر یافته است.');
  }

  const now = new Date().toISOString();
  const updatedOrg: Organization = {
    ...existing,
    ...updates,
    retailerProfile: updates.retailerProfile !== undefined ? updates.retailerProfile : existing.retailerProfile,
    manufacturerProfile: updates.manufacturerProfile !== undefined ? updates.manufacturerProfile : existing.manufacturerProfile,
    wholesalerProfile: updates.wholesalerProfile !== undefined ? updates.wholesalerProfile : existing.wholesalerProfile,
    supplierProfile: updates.supplierProfile !== undefined ? updates.supplierProfile : existing.supplierProfile,
    agentOfficeProfile: updates.agentOfficeProfile !== undefined ? updates.agentOfficeProfile : existing.agentOfficeProfile,
    servicePartnerProfile: updates.servicePartnerProfile !== undefined ? updates.servicePartnerProfile : existing.servicePartnerProfile,
    updatedAt: now,
    version: existing.version + 1
  };

  store.organizations[index] = updatedOrg;

  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorId: 'actor-admin',
    actorName,
    action: 'update',
    targetType: 'organization',
    targetId: updatedOrg.id,
    targetName: updatedOrg.displayName,
    description: `ویرایش اطلاعات پرونده سازمان «${updatedOrg.displayName}»`,
    timestamp: now
  });

  await saveStore(store);
  return updatedOrg;
}

export async function createMembership(data: Partial<Membership>, actorName: string = 'مدیر سیستم'): Promise<Membership> {
  const store = loadStore();

  if (!data.partyId || !data.organizationId) {
    throw new Error('مشخص کردن شخص و سازمان برای برقراری رابطه عضویت الزامی است.');
  }

  const person = store.persons.find(p => p.id === data.partyId);
  if (!person) {
    throw new Error('شخص انتخاب‌شده وجود ندارد.');
  }

  const org = store.organizations.find(o => o.id === data.organizationId);
  if (!org) {
    throw new Error('سازمان انتخاب‌شده وجود ندارد.');
  }

  // Validate dates if both provided
  if (data.validFrom && data.validTo) {
    if (new Date(data.validTo) < new Date(data.validFrom)) {
      throw new Error('تاریخ پایان اعتبار نمی‌تواند قبل از تاریخ شروع اعتبار باشد.');
    }
  }

  const now = new Date().toISOString();
  const newMembership: Membership = {
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    partyId: data.partyId,
    organizationId: data.organizationId,
    roleKey: data.roleKey || 'staff',
    title: data.title || 'عضو سازمانی',
    authorities: data.authorities || [],
    isPrimary: !!data.isPrimary,
    status: data.status || 'active',
    validFrom: data.validFrom || now.split('T')[0],
    validTo: data.validTo,
    notes: data.notes || '',
    partyName: `${person.firstName} ${person.lastName}`,
    organizationName: org.displayName,
    createdAt: now,
    updatedAt: now
  };

  store.memberships.unshift(newMembership);

  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorId: 'actor-admin',
    actorName,
    action: 'membership_link',
    targetType: 'membership',
    targetId: newMembership.id,
    targetName: `${newMembership.partyName} -> ${newMembership.organizationName}`,
    description: `برقراری پیوند عضویت برای «${newMembership.partyName}» در سازمان «${newMembership.organizationName}» با نقش «${newMembership.roleKey}»`,
    timestamp: now
  });

  await saveStore(store);
  return newMembership;
}

export async function addDocument(doc: Partial<PartyDocument>, actorName: string = 'مدیر سیستم'): Promise<PartyDocument> {
  const store = loadStore();

  if (!doc.targetType || !doc.targetId || !doc.fileName) {
    throw new Error('اطلاعات مدرک ارسالی ناقص است.');
  }

  const now = new Date().toISOString();
  const newDoc: PartyDocument = {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    targetType: doc.targetType,
    targetId: doc.targetId,
    documentType: doc.documentType || 'other',
    fileName: doc.fileName,
    fileSize: doc.fileSize || 1024 * 50,
    mimeType: doc.mimeType || 'application/pdf',
    fileUri: doc.fileUri || `secure://party-documents/${doc.targetId}/${doc.fileName}`,
    verificationStatus: doc.verificationStatus || 'pending',
    uploadedBy: doc.uploadedBy || 'actor-admin',
    notes: doc.notes || '',
    createdAt: now
  };

  store.documents.unshift(newDoc);

  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorId: 'actor-admin',
    actorName,
    action: 'document_upload',
    targetType: 'document',
    targetId: newDoc.id,
    targetName: newDoc.fileName,
    description: `بارگذاری مدرک «${newDoc.fileName}» برای موجودیت ${newDoc.targetType}`,
    timestamp: now
  });

  await saveStore(store);
  return newDoc;
}
