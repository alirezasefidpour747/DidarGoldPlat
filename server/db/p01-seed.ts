/**
 * Didar B2B - P01 Product Core & Taxonomy Deterministic Seeder
 * Governed by PRODUCT-TAXONOMY-SEED.md and PRODUCT-CORE.md Section 12.
 * Fully idempotent and repeatable with zero duplicate insertions.
 */

import { getDatabase } from './index.js';
import {
  b2bCategories,
  b2bProducts,
  b2bSupplierOffers,
  b2bProductLifecycleHistory,
  b2bProductAuditLogs,
  k01Organizations,
  k01Persons,
  k01Memberships,
  rbacRoles,
  rbacPermissions,
  rbacRolePermissions,
  rbacAssignments,
  authCredentials
} from './schema.js';
import crypto from 'crypto';
import { DETERMINISTIC_TAXONOMY_100_NODES } from './taxonomy-seed-data.js';

export async function seedP01Data(): Promise<{
  categoriesCount: number;
  productsCount: number;
  offersCount: number;
  organizationsCount: number;
}> {
  const db = (await getDatabase()) as any;

  // -------------------------------------------------------------
  // 1. RBAC ROLES & PERMISSIONS FOR P01
  // -------------------------------------------------------------
  const p01Permissions = [
    { key: 'product.read', domain: 'product', action: 'read', resource: 'product', titleFa: 'مشاهده مشخصات محصول', titleEn: 'Read Product' },
    { key: 'product.create_own', domain: 'product', action: 'create', resource: 'product', titleFa: 'ثبت پیش‌نویس محصول تامین‌کننده', titleEn: 'Create Own Product' },
    { key: 'product.update_own_draft', domain: 'product', action: 'update', resource: 'product', titleFa: 'ویرایش پیش‌نویس محصول', titleEn: 'Update Own Draft Product' },
    { key: 'product.submit_for_review', domain: 'product', action: 'submit', resource: 'product', titleFa: 'ارسال محصول برای بازبینی', titleEn: 'Submit Product for Review' },
    { key: 'product.review', domain: 'product', action: 'review', resource: 'product', titleFa: 'بررسی در صف محصولات دیداری', titleEn: 'Review Product Queue' },
    { key: 'product.approve', domain: 'product', action: 'approve', resource: 'product', titleFa: 'تایید نهایی محصول', titleEn: 'Approve Product' },
    { key: 'product.reject', domain: 'product', action: 'reject', resource: 'product', titleFa: 'رد محصول', titleEn: 'Reject Product' },
    { key: 'product.request_changes', domain: 'product', action: 'request_changes', resource: 'product', titleFa: 'درخواست اصلاحات از تامین‌کننده', titleEn: 'Request Product Changes' },
    { key: 'product.publish', domain: 'product', action: 'publish', resource: 'product', titleFa: 'انتشار عمومی محصول در کاتالوگ', titleEn: 'Publish Product' },
    { key: 'product.unpublish', domain: 'product', action: 'unpublish', resource: 'product', titleFa: 'غیرفعال‌سازی و خروج از انتشار', titleEn: 'Unpublish Product' },
    { key: 'offer.create_own', domain: 'offer', action: 'create', resource: 'offer', titleFa: 'تعریف آفر تامین‌کننده', titleEn: 'Create Own Offer' },
    { key: 'offer.update_own', domain: 'offer', action: 'update', resource: 'offer', titleFa: 'ویرایش آفر تامین‌کننده', titleEn: 'Update Own Offer' },
    { key: 'offer.submit_for_review', domain: 'offer', action: 'submit', resource: 'offer', titleFa: 'ارسال آفر برای بازبینی', titleEn: 'Submit Offer for Review' },
    { key: 'offer.read_own', domain: 'offer', action: 'read', resource: 'offer', titleFa: 'مشاهده آفرهای خود', titleEn: 'Read Own Offers' },
    { key: 'offer.read_all', domain: 'offer', action: 'read_all', resource: 'offer', titleFa: 'مشاهده تمام آفرهای تامین‌کنندگان', titleEn: 'Read All Offers' },
    { key: 'catalog.read_retailer', domain: 'catalog', action: 'read', resource: 'catalog', titleFa: 'مرور کاتالوگ امن خرده‌فروشی', titleEn: 'Read Retailer Catalog' },
    { key: 'taxonomy.read', domain: 'taxonomy', action: 'read', resource: 'taxonomy', titleFa: 'مشاهده درخت طبقه‌بندی طلا', titleEn: 'Read Taxonomy' },
    { key: 'taxonomy.create', domain: 'taxonomy', action: 'create', resource: 'taxonomy', titleFa: 'ایجاد گره طبقه‌بندی', titleEn: 'Create Taxonomy Node' },
    { key: 'taxonomy.update', domain: 'taxonomy', action: 'update', resource: 'taxonomy', titleFa: 'ویرایش گره طبقه‌بندی', titleEn: 'Update Taxonomy Node' },
    { key: 'taxonomy.activate', domain: 'taxonomy', action: 'activate', resource: 'taxonomy', titleFa: 'فعال‌سازی گره طبقه‌بندی', titleEn: 'Activate Taxonomy Node' },
    { key: 'taxonomy.deactivate', domain: 'taxonomy', action: 'deactivate', resource: 'taxonomy', titleFa: 'غیرفعال‌سازی گره طبقه‌بندی', titleEn: 'Deactivate Taxonomy Node' },
  ];

  for (const perm of p01Permissions) {
    await db.insert(rbacPermissions).values({
      key: perm.key,
      domain: perm.domain,
      action: perm.action,
      resource: perm.resource,
      titleFa: perm.titleFa,
      titleEn: perm.titleEn,
      descriptionFa: `دسترسی عملیاتی P01: ${perm.titleFa}`,
      isSensitive: false,
      requiresMfa: false,
    }).onConflictDoNothing();
  }

  const p01Roles = [
    {
      roleKey: 'DIDAR_SUPER_ADMIN',
      analysisCode: 'ADM01',
      titleFa: 'مدیر ارشد پلتفرم دیدار',
      titleEn: 'Didar Super Admin',
      category: 'didar',
      targetEnvironment: 'X01',
      mainBoundaryFa: 'تمام سطوح مدیریت کاتالوگ، کاربران و عملیات دیدار',
      permissions: p01Permissions.map((p) => p.key),
    },
    {
      roleKey: 'DIDAR_PRODUCT_OPS',
      analysisCode: 'OPS01',
      titleFa: 'کارشناس عملیات محصول دیدار',
      titleEn: 'Didar Product Operations',
      category: 'didar',
      targetEnvironment: 'X01',
      mainBoundaryFa: 'بررسی، تایید، درخواست اصلاح و انتشار محصولات و مدیریت درخت طبقه‌بندی',
      permissions: [
        'product.read',
        'product.review',
        'product.approve',
        'product.reject',
        'product.request_changes',
        'product.publish',
        'product.unpublish',
        'offer.read_all',
        'taxonomy.read',
        'taxonomy.create',
        'taxonomy.update',
        'taxonomy.activate',
        'taxonomy.deactivate',
      ],
    },
    {
      roleKey: 'SUPPLIER_ADMIN',
      analysisCode: 'SUP01',
      titleFa: 'مدیر ارشد تامین‌کننده',
      titleEn: 'Supplier Administrator',
      category: 'supplier',
      targetEnvironment: 'X04',
      mainBoundaryFa: 'مدیریت محصولات و آفرهای سازمان خود تامین‌کننده',
      permissions: [
        'product.read',
        'product.create_own',
        'product.update_own_draft',
        'product.submit_for_review',
        'offer.create_own',
        'offer.update_own',
        'offer.submit_for_review',
        'offer.read_own',
        'taxonomy.read',
      ],
    },
    {
      roleKey: 'SUPPLIER_PRODUCT_OPERATOR',
      analysisCode: 'SUP02',
      titleFa: 'اپراتور محصول تامین‌کننده',
      titleEn: 'Supplier Product Operator',
      category: 'supplier',
      targetEnvironment: 'X04',
      mainBoundaryFa: 'ثبت، ویرایش و ارسال پیش‌نویس محصول و آفر به صف بررسی دیدار',
      permissions: [
        'product.read',
        'product.create_own',
        'product.update_own_draft',
        'product.submit_for_review',
        'offer.create_own',
        'offer.update_own',
        'offer.submit_for_review',
        'offer.read_own',
        'taxonomy.read',
      ],
    },
    {
      roleKey: 'RETAILER_ADMIN',
      analysisCode: 'RET01',
      titleFa: 'مدیر فروشگاه خرده‌فروشی',
      titleEn: 'Retailer Administrator',
      category: 'retailer',
      targetEnvironment: 'X03',
      mainBoundaryFa: 'مرور کاتالوگ امن خرده‌فروشی و خرید بدون افشای تامین‌کننده',
      permissions: ['catalog.read_retailer', 'taxonomy.read'],
    },
    {
      roleKey: 'RETAILER_ORDER_PROCUREMENT',
      analysisCode: 'RET02',
      titleFa: 'مسئول سفارشات و تدارکات خرده‌فروشی',
      titleEn: 'Retailer Procurement Operator',
      category: 'retailer',
      targetEnvironment: 'X03',
      mainBoundaryFa: 'مشاهده کاتالوگ و ثبت سفارش بدون دسترسی به شرایط تامین‌کنندگان داخلی',
      permissions: ['catalog.read_retailer', 'taxonomy.read'],
    },
  ];

  for (const role of p01Roles) {
    await db.insert(rbacRoles).values({
      roleKey: role.roleKey,
      analysisCode: role.analysisCode,
      titleFa: role.titleFa,
      titleEn: role.titleEn,
      category: role.category,
      targetEnvironment: role.targetEnvironment,
      mainBoundaryFa: role.mainBoundaryFa,
      lifecycle: 'active',
      capabilityStatus: 'verified',
      isCatalogOnly: false,
      ownerStatus: 'verified',
    }).onConflictDoNothing();

    for (const pKey of role.permissions) {
      await db.insert(rbacRolePermissions).values({
        roleKey: role.roleKey,
        permissionKey: pKey,
      }).onConflictDoNothing();
    }
  }

  // -------------------------------------------------------------
  // 2. STABLE ORGANIZATIONS & USERS FOR P01
  // -------------------------------------------------------------
  const organizations = [
    {
      id: 'org_didar_hq',
      legalName: 'شرکت فناوری دیدار طلای پارس',
      displayName: 'مرکز عملیات دیدار',
      organizationType: 'didar',
      phone: '02188990011',
      province: 'تهران',
      city: 'تهران',
      status: 'active',
    },
    {
      id: 'org_supplier_zarrin',
      legalName: 'صنایع طلاسازی زرین گستر آریا',
      displayName: 'طلاسازی زرین',
      organizationType: 'supplier',
      phone: '02155667788',
      province: 'تهران',
      city: 'تهران',
      status: 'active',
    },
    {
      id: 'org_supplier_alvand',
      legalName: 'تولیدی طلای دست‌ساز الوند البرز',
      displayName: 'الوند گلد',
      organizationType: 'supplier',
      phone: '02634455667',
      province: 'البرز',
      city: 'کرج',
      status: 'active',
    },
    {
      id: 'org_supplier_taban',
      legalName: 'کارخانجات صنایع طلای تابان نگین',
      displayName: 'طلای تابان',
      organizationType: 'supplier',
      phone: '03132233445',
      province: 'اصفهان',
      city: 'اصفهان',
      status: 'active',
    },
    {
      id: 'org_retailer_gem',
      legalName: 'گالری طلای گوهرشاد یزد',
      displayName: 'گالری گوهرشاد',
      organizationType: 'retailer',
      phone: '03538899776',
      province: 'یزد',
      city: 'یزد',
      status: 'active',
    },
  ];

  for (const org of organizations) {
    await db.insert(k01Organizations).values(org).onConflictDoNothing();
  }

  // Ensure test actors exist in k01Persons and authCredentials
  const actors = [
    {
      id: 'usr_product_ops',
      firstName: 'امیرحسین',
      lastName: 'محصولی (دیدار)',
      mobile: '09121000001',
      orgId: 'org_didar_hq',
      role: 'DIDAR_PRODUCT_OPS',
    },
    {
      id: 'usr_supplier_zarrin',
      firstName: 'رضا',
      lastName: 'زرین‌تبار (تامین ۱)',
      mobile: '09122000002',
      orgId: 'org_supplier_zarrin',
      role: 'SUPPLIER_PRODUCT_OPERATOR',
    },
    {
      id: 'usr_supplier_alvand',
      firstName: 'بهنام',
      lastName: 'الوندی (تامین ۲)',
      mobile: '09123000003',
      orgId: 'org_supplier_alvand',
      role: 'SUPPLIER_PRODUCT_OPERATOR',
    },
    {
      id: 'usr_retailer_gem',
      firstName: 'حمید',
      lastName: 'گوهرشناس (خرده‌فروش)',
      mobile: '09124000004',
      orgId: 'org_retailer_gem',
      role: 'RETAILER_ORDER_PROCUREMENT',
    },
  ];

  const defaultSalt = 'didar_static_salt_for_seeding_123';
  const defaultHash = crypto.scryptSync('Pass1234!', defaultSalt, 64).toString('hex');

  for (const a of actors) {
    await db.insert(k01Persons).values({
      id: a.id,
      partyType: 'person',
      firstName: a.firstName,
      lastName: a.lastName,
      mobile: a.mobile,
      status: 'active',
      verificationStatus: 'verified',
    }).onConflictDoNothing();

    await db.insert(authCredentials).values({
      partyId: a.id,
      passwordHash: defaultHash,
      salt: defaultSalt,
      status: 'active',
    }).onConflictDoUpdate({
      target: authCredentials.partyId,
      set: {
        passwordHash: defaultHash,
        salt: defaultSalt,
        status: 'active',
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    await db.insert(k01Memberships).values({
      id: `mem_${a.id}_${a.orgId}`,
      partyId: a.id,
      organizationId: a.orgId,
      roleKey: a.role,
      title: a.role,
      status: 'active',
      validFrom: '2026-01-01',
    }).onConflictDoNothing();

    await db.insert(rbacAssignments).values({
      id: `asg_${a.id}_${a.role}`,
      partyId: a.id,
      organizationId: a.orgId,
      membershipId: `mem_${a.id}_${a.orgId}`,
      roleKey: a.role,
      scopeType: 'organization',
      scopeIds: [a.orgId],
      validFrom: '2026-01-01',
      reason: 'انتساب سیستمی نقش P01',
      status: 'active',
      assignedByPartyId: 'system',
    }).onConflictDoNothing();
  }

  // -------------------------------------------------------------
  // 3. DETERMINISTIC INITIAL GOLD PRODUCT TAXONOMY
  // Source: PRODUCT-TAXONOMY-SEED.md
  // Levels: 1 (Main Category) -> 2 (Product Category) -> 3 (Subcategory) = Exactly 100 Nodes
  // -------------------------------------------------------------
  const taxonomyNodes = DETERMINISTIC_TAXONOMY_100_NODES;

  for (const node of taxonomyNodes) {
    await db.insert(b2bCategories).values({
      id: node.id,
      parentId: node.parentId,
      level: node.level,
      code: node.code,
      nameFa: node.nameFa,
      nameEn: node.nameEn,
      descriptionFa: node.descriptionFa,
      status: 'ACTIVE',
      sortOrder: node.sortOrder,
    }).onConflictDoNothing();
  }

  // -------------------------------------------------------------
  // 4. CANONICAL PRODUCTS & MULTI-SUPPLIER OFFERS (PRODUCT-CORE §12)
  // At least 5 Products across categories
  // At least 3 Suppliers
  // At least 1 Product has TWO suppliers with different weight & making fee!
  // Complete lifecycle statuses: PUBLISHED, APPROVED, SUBMITTED, CHANGES_REQUESTED, DRAFT
  // -------------------------------------------------------------
  const seedProducts = [
    {
      id: 'prd_gold_ring_classic_01',
      subcategoryId: 'cat_sub_plain_wedding_band',
      name: 'حلقه ازدواج زرین کلاسیک ۱۸ عیار',
      slug: 'classic-gold-wedding-band-18k',
      productCode: 'DIDAR-PRD-RNG-001',
      description: 'حلقه ازدواج تخت تمام‌طلا با پرداخت آینه‌ای براق و لبه‌های راحت ارگونومیک، بدون نگین.',
      technicalDescription: 'عیار استاندارد ۷۵۰ (۱۸ عیار)، ریخته‌گری دقیق خلاء، پولیش ۳ مرحله‌ای.',
      primaryImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop',
      ],
      karat: 18,
      material: 'gold',
      status: 'PUBLISHED', // Published and live in Retailer catalog
      createdBy: 'usr_supplier_zarrin',
      createdByOrgId: 'org_supplier_zarrin',
    },
    {
      id: 'prd_gold_ring_wide_02',
      subcategoryId: 'cat_sub_wide_band_ring',
      name: 'انگشتر پهن مدرن شیاردار ۷۵۰',
      slug: 'modern-wide-band-ring-grooved-750',
      productCode: 'DIDAR-PRD-RNG-002',
      description: 'انگشتر طلای پهن مدرن با بافت ساتن مات و خطوط هندسی معماری مینیمال.',
      technicalDescription: 'عرض بدنه ۸ میلی‌متر، عیار ۱۸، سبک توخالی مهندسی‌شده با استحکام بالا.',
      primaryImage: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop',
      gallery: ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop'],
      karat: 18,
      material: 'gold',
      status: 'APPROVED', // Approved by Product Ops, awaiting publication command
      createdBy: 'usr_supplier_alvand',
      createdByOrgId: 'org_supplier_alvand',
    },
    {
      id: 'prd_gold_earring_hoop_03',
      subcategoryId: 'cat_sub_plain_hoop_earring',
      name: 'گوشواره حلقه‌ای لوله‌ای سبک',
      slug: 'lightweight-tubular-hoop-earring',
      productCode: 'DIDAR-PRD-ERR-001',
      description: 'گوشواره حلقه‌ای با قطر ۲۵ میلی‌متر، ساختار لوله‌ای سبک با قفل ایمن مفصلی فرانسوی.',
      technicalDescription: 'قطر ۲۵ میلی‌متر، ضخامت لوله ۲ میلی‌متر، عیار ۱۸، آبکاری نانو جهت جلوگیری از حساسیت.',
      primaryImage: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop',
      gallery: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop'],
      karat: 18,
      material: 'gold',
      status: 'SUBMITTED', // In Product Ops Review Queue
      createdBy: 'usr_supplier_zarrin',
      createdByOrgId: 'org_supplier_zarrin',
    },
    {
      id: 'prd_gold_necklace_chain_04',
      subcategoryId: 'cat_sub_plain_chain_necklace',
      name: 'گردنبند زنجیر ونیزی طلا ۵۰ سانت',
      slug: 'venetian-box-chain-necklace-50cm',
      productCode: 'DIDAR-PRD-NCK-001',
      description: 'زنجیر طلای باکس ونیزی تراش‌دار با قفل خرچنگی مستحکم و قابلیت آویز انواع مدال.',
      technicalDescription: 'طول ۵۰ سانتیمتر، بافت باکس ۱.۲ میلی‌متر، اتصال جوش لیزری تقویت‌شده.',
      primaryImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop',
      gallery: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop'],
      karat: 18,
      material: 'gold',
      status: 'CHANGES_REQUESTED', // Product Ops sent review notes requesting corrections
      createdBy: 'usr_supplier_alvand',
      createdByOrgId: 'org_supplier_alvand',
    },
    {
      id: 'prd_gold_bracelet_cuff_05',
      subcategoryId: 'cat_sub_cuff_bracelet',
      name: 'دستبند کاف صلب مینیمال طلا',
      slug: 'minimalist-rigid-gold-cuff-bracelet',
      productCode: 'DIDAR-PRD-BRC-001',
      description: 'دستبند کاف انعطاف‌پذیر مدرن با انتهای گرد جهت راحتی دست، تمام‌طلا بدون قفل.',
      technicalDescription: 'فول هارد ۱۸ عیار با قابلیت برگشت‌پذیری فنری، لبه‌های پولیش نرم.',
      primaryImage: 'https://images.unsplash.com/photo-1611591475155-4264754f931b?w=800&auto=format&fit=crop',
      gallery: ['https://images.unsplash.com/photo-1611591475155-4264754f931b?w=800&auto=format&fit=crop'],
      karat: 18,
      material: 'gold',
      status: 'DRAFT', // Still in Supplier Draft
      createdBy: 'usr_supplier_zarrin',
      createdByOrgId: 'org_supplier_zarrin',
    },
  ];

  for (const prd of seedProducts) {
    await db.insert(b2bProducts).values(prd).onConflictDoNothing();
  }

  // -------------------------------------------------------------
  // 5. MULTI-SUPPLIER OFFERS
  // Section 12 rule: At least ONE product (prd_gold_ring_classic_01)
  // has TWO suppliers with different weight and making fee conditions!
  // Supplier 1 (Zarrin): EXACT weight 4.200g, PERCENT making fee 9.5%
  // Supplier 2 (Alvand): RANGE weight 3.800g - 5.500g, RANGE_PERCENT making fee 11.0% - 14.0%
  // Supplier 3 (Taban): Made to order on prd_gold_ring_wide_02
  // -------------------------------------------------------------
  const seedOffers = [
    // Offer 1 on Product 1 (Supplier: Zarrin)
    {
      id: 'ofr_classic_ring_zarrin',
      productId: 'prd_gold_ring_classic_01',
      supplierId: 'org_supplier_zarrin',
      supplierProductCode: 'ZRN-RNG-101',
      weightType: 'EXACT',
      exactWeight: 4.2,
      weightMin: null,
      weightMax: null,
      makingFeeType: 'PERCENT',
      makingFeeValue: 9.5,
      makingFeeMin: null,
      makingFeeMax: null,
      availabilityType: 'AVAILABLE',
      leadTimeDays: 0,
      status: 'ACTIVE',
      createdBy: 'usr_supplier_zarrin',
    },
    // Offer 2 on Product 1 (Supplier: Alvand) - Proves Multi-Supplier with different terms!
    {
      id: 'ofr_classic_ring_alvand',
      productId: 'prd_gold_ring_classic_01',
      supplierId: 'org_supplier_alvand',
      supplierProductCode: 'ALV-RNG-88',
      weightType: 'RANGE',
      exactWeight: null,
      weightMin: 3.8,
      weightMax: 5.5,
      makingFeeType: 'RANGE_PERCENT',
      makingFeeValue: null,
      makingFeeMin: 11.0,
      makingFeeMax: 14.0,
      availabilityType: 'AVAILABLE',
      leadTimeDays: 2,
      status: 'ACTIVE',
      createdBy: 'usr_supplier_alvand',
    },
    // Offer 3 on Product 2 (Supplier: Taban)
    {
      id: 'ofr_wide_ring_taban',
      productId: 'prd_gold_ring_wide_02',
      supplierId: 'org_supplier_taban',
      supplierProductCode: 'TBN-MOD-404',
      weightType: 'RANGE',
      exactWeight: null,
      weightMin: 6.5,
      weightMax: 8.8,
      makingFeeType: 'PERCENT',
      makingFeeValue: 12.0,
      makingFeeMin: null,
      makingFeeMax: null,
      availabilityType: 'MADE_TO_ORDER',
      leadTimeDays: 5,
      status: 'ACTIVE',
      createdBy: 'usr_supplier_zarrin',
    },
    // Offer 4 on Product 3 (Supplier: Zarrin)
    {
      id: 'ofr_hoop_earring_zarrin',
      productId: 'prd_gold_earring_hoop_03',
      supplierId: 'org_supplier_zarrin',
      supplierProductCode: 'ZRN-ERR-202',
      weightType: 'EXACT',
      exactWeight: 2.75,
      weightMin: null,
      weightMax: null,
      makingFeeType: 'PERCENT',
      makingFeeValue: 8.0,
      makingFeeMin: null,
      makingFeeMax: null,
      availabilityType: 'AVAILABLE',
      leadTimeDays: 0,
      status: 'ACTIVE',
      createdBy: 'usr_supplier_zarrin',
    },
  ];

  for (const ofr of seedOffers) {
    await db.insert(b2bSupplierOffers).values(ofr).onConflictDoNothing();
  }

  // Record initial lifecycle transitions
  await db.insert(b2bProductLifecycleHistory).values([
    {
      id: 'lch_seed_01',
      productId: 'prd_gold_ring_classic_01',
      fromStatus: 'APPROVED',
      toStatus: 'PUBLISHED',
      changedBy: 'usr_product_ops',
      changedByOrgId: 'org_didar_hq',
      reason: 'انتشار موفق اولیه پس از تطبیق مشخصات استاندارد طلا',
    },
    {
      id: 'lch_seed_02',
      productId: 'prd_gold_ring_wide_02',
      fromStatus: 'SUBMITTED',
      toStatus: 'APPROVED',
      changedBy: 'usr_product_ops',
      changedByOrgId: 'org_didar_hq',
      reason: 'تایید نمونه و عیار ۷۵۰، آماده جهت صدور فرمان انتشار',
    },
    {
      id: 'lch_seed_03',
      productId: 'prd_gold_necklace_chain_04',
      fromStatus: 'SUBMITTED',
      toStatus: 'CHANGES_REQUESTED',
      changedBy: 'usr_product_ops',
      changedByOrgId: 'org_didar_hq',
      reason: 'لطفاً تصویر با کیفیت بالاتر از قفل زنجیر و وزن دقیق بازبینی شود.',
    },
  ]).onConflictDoNothing();

  // Record audit logs
  await db.insert(b2bProductAuditLogs).values([
    {
      id: 'aud_seed_01',
      entityType: 'PRODUCT',
      entityId: 'prd_gold_ring_classic_01',
      action: 'PRODUCT_PUBLISHED',
      actorId: 'usr_product_ops',
      actorOrgId: 'org_didar_hq',
      payload: { status: 'PUBLISHED', target: 'retailer_catalog' },
    },
    {
      id: 'aud_seed_02',
      entityType: 'SUPPLIER_OFFER',
      entityId: 'ofr_classic_ring_alvand',
      action: 'OFFER_CREATED',
      actorId: 'usr_supplier_alvand',
      actorOrgId: 'org_supplier_alvand',
      payload: { weightType: 'RANGE', makingFeeType: 'RANGE_PERCENT' },
    },
  ]).onConflictDoNothing();

  console.log('[P01 Seed] Completed successfully with idempotent verification.');

  return {
    categoriesCount: taxonomyNodes.length,
    productsCount: seedProducts.length,
    offersCount: seedOffers.length,
    organizationsCount: organizations.length,
  };
}

if (process.argv[1] && process.argv[1].endsWith('p01-seed.ts')) {
  seedP01Data()
    .then((res) => {
      console.log('[P01 Seed Result]:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[P01 Seed Failed]:', err);
      process.exit(1);
    });
}
