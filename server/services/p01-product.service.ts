/**
 * Didar B2B - P01 Product Core & Taxonomy Domain Service
 * Enforces PostgreSQL persistence, Organization Scoping, Product Workflow,
 * Multi-Supplier Offer isolation, and Safe Public Catalog Projection.
 */

import { getDatabase } from '../db/index.js';
import {
  b2bCategories,
  b2bProducts,
  b2bSupplierOffers,
  b2bProductLifecycleHistory,
  b2bProductAuditLogs,
  k01Organizations
} from '../db/schema.js';
import { eq, and, sql, or, ilike, desc, asc, inArray } from 'drizzle-orm';
import crypto from 'crypto';

export interface CategoryTreeNode {
  id: string;
  parentId: string | null;
  level: number;
  code: string;
  nameFa: string;
  nameEn: string | null;
  descriptionFa: string | null;
  status: string;
  sortOrder: number;
  children?: CategoryTreeNode[];
}

export interface RetailerProductDTO {
  id: string;
  name: string;
  slug: string;
  productCode: string;
  description: string | null;
  technicalDescription: string | null;
  primaryImage: string | null;
  gallery: string[];
  karat: number;
  material: string;
  status: string;
  subcategory: {
    id: string;
    code: string;
    nameFa: string;
    nameEn: string | null;
    parentCategoryNameFa?: string;
  };
  indicativeWeightRange: { min: number; max: number } | null;
  indicativeMakingFeeRange: { min: number; max: number } | null;
  availability: 'AVAILABLE' | 'MADE_TO_ORDER' | 'UNAVAILABLE';
}

export class P01ProductService {
  /**
   * 1. TAXONOMY OPERATIONS
   */
  static async getTaxonomyTree(): Promise<CategoryTreeNode[]> {
    const db = (await getDatabase()) as any;
    const allCategories = await db
      .select()
      .from(b2bCategories)
      .where(eq(b2bCategories.status, 'ACTIVE'))
      .orderBy(asc(b2bCategories.level), asc(b2bCategories.sortOrder));

    const map = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    for (const cat of allCategories) {
      map.set(cat.id, {
        id: cat.id,
        parentId: cat.parentId,
        level: cat.level,
        code: cat.code,
        nameFa: cat.nameFa,
        nameEn: cat.nameEn,
        descriptionFa: cat.descriptionFa,
        status: cat.status,
        sortOrder: cat.sortOrder,
        children: [],
      });
    }

    for (const node of map.values()) {
      if (!node.parentId) {
        roots.push(node);
      } else {
        const parent = map.get(node.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      }
    }

    return roots;
  }

  static async getActiveSubcategories(): Promise<any[]> {
    const db = (await getDatabase()) as any;
    return db
      .select()
      .from(b2bCategories)
      .where(and(eq(b2bCategories.level, 3), eq(b2bCategories.status, 'ACTIVE')))
      .orderBy(asc(b2bCategories.sortOrder));
  }

  /**
   * 2. PRODUCT DRAFT & SUPPLIER ACTIONS
   */
  static async createProductDraft(
    data: {
      subcategoryId: string;
      name: string;
      productCode?: string;
      description?: string;
      technicalDescription?: string;
      primaryImage?: string;
      gallery?: string[];
      karat?: number;
      material?: string;
    },
    actorId: string,
    actorOrgId: string
  ) {
    const db = (await getDatabase()) as any;

    if (!data.name || !data.subcategoryId) {
      const err = new Error('نام محصول و زیرشاخه معتبر الزامی هستند.');
      (err as any).statusCode = 422;
      throw err;
    }

    // Verify subcategory exists and is at level 3
    const [subcat] = await db
      .select()
      .from(b2bCategories)
      .where(and(eq(b2bCategories.id, data.subcategoryId), eq(b2bCategories.level, 3), eq(b2bCategories.status, 'ACTIVE')));

    if (!subcat) {
      const err = new Error('زیرشاخه انتخاب‌شده معتبر یا فعال نیست.');
      (err as any).statusCode = 422;
      throw err;
    }

    const productId = `prd_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const productCode = data.productCode || `DIDAR-${subcat.code.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`;
    const slug = `${subcat.code}-${Date.now()}`;

    const newProduct = {
      id: productId,
      subcategoryId: data.subcategoryId,
      name: data.name,
      slug,
      productCode,
      description: data.description || null,
      technicalDescription: data.technicalDescription || null,
      primaryImage: data.primaryImage || null,
      gallery: data.gallery || [],
      karat: data.karat || 18,
      material: data.material || 'gold',
      status: 'DRAFT', // Always starts in DRAFT
      createdBy: actorId,
      createdByOrgId: actorOrgId,
    };

    await db.insert(b2bProducts).values(newProduct);

    // Audit log
    await this.logAudit('PRODUCT', productId, 'PRODUCT_CREATED', actorId, actorOrgId, {
      name: data.name,
      subcategoryId: data.subcategoryId,
      productCode,
    });

    return newProduct;
  }

  static async updateProductDraft(
    productId: string,
    data: Partial<{
      subcategoryId: string;
      name: string;
      description: string;
      technicalDescription: string;
      primaryImage: string;
      gallery: string[];
      karat: number;
      material: string;
    }>,
    actorId: string,
    actorOrgId: string,
    isProductOps: boolean = false
  ) {
    const db = (await getDatabase()) as any;

    const [existing] = await db.select().from(b2bProducts).where(eq(b2bProducts.id, productId));
    if (!existing) {
      const err = new Error('محصول مورد نظر یافت نشد.');
      (err as any).statusCode = 404;
      throw err;
    }

    // Organization Scope enforcement: Supplier can only edit own products
    if (!isProductOps && existing.createdByOrgId !== actorOrgId) {
      const err = new Error('عدم دسترسی: شما مجاز به ویرایش محصول سایر سازمان‌ها نیستید.');
      (err as any).statusCode = 403;
      throw err;
    }

    // State validation: Supplier can only edit DRAFT or CHANGES_REQUESTED
    if (!isProductOps && existing.status !== 'DRAFT' && existing.status !== 'CHANGES_REQUESTED') {
      const err = new Error(`امکان ویرایش محصول در وضعیت "${existing.status}" وجود ندارد.`);
      (err as any).statusCode = 422;
      throw err;
    }

    const updates: any = {
      updatedBy: actorId,
      updatedAt: new Date(),
    };

    if (data.name) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.technicalDescription !== undefined) updates.technicalDescription = data.technicalDescription;
    if (data.primaryImage !== undefined) updates.primaryImage = data.primaryImage;
    if (data.gallery !== undefined) updates.gallery = data.gallery;
    if (data.karat !== undefined) updates.karat = data.karat;
    if (data.material !== undefined) updates.material = data.material;

    if (data.subcategoryId) {
      const [subcat] = await db
        .select()
        .from(b2bCategories)
        .where(and(eq(b2bCategories.id, data.subcategoryId), eq(b2bCategories.level, 3), eq(b2bCategories.status, 'ACTIVE')));
      if (!subcat) {
        const err = new Error('زیرشاخه انتخاب‌شده معتبر نیست.');
        (err as any).statusCode = 422;
        throw err;
      }
      updates.subcategoryId = data.subcategoryId;
    }

    await db.update(b2bProducts).set(updates).where(eq(b2bProducts.id, productId));

    await this.logAudit('PRODUCT', productId, 'PRODUCT_EDITED', actorId, actorOrgId, updates);

    return { ...existing, ...updates };
  }

  static async submitProductForReview(productId: string, actorId: string, actorOrgId: string) {
    const db = (await getDatabase()) as any;

    const [product] = await db.select().from(b2bProducts).where(eq(b2bProducts.id, productId));
    if (!product) {
      const err = new Error('محصول یافت نشد.');
      (err as any).statusCode = 404;
      throw err;
    }

    // Organization Scope check
    if (product.createdByOrgId !== actorOrgId) {
      const err = new Error('عدم دسترسی به محصول سازمان دیگر.');
      (err as any).statusCode = 403;
      throw err;
    }

    // Valid state transitions for submit: DRAFT or CHANGES_REQUESTED -> SUBMITTED
    if (product.status !== 'DRAFT' && product.status !== 'CHANGES_REQUESTED') {
      const err = new Error(`ارسال برای بازبینی تنها از وضعیت پیش‌نویس یا درخواست اصلاحات امکان‌پذیر است. وضعیت فعلی: ${product.status}`);
      (err as any).statusCode = 422;
      throw err;
    }

    // Validation: Product must have at least one valid Supplier Offer
    const offers = await db
      .select()
      .from(b2bSupplierOffers)
      .where(and(eq(b2bSupplierOffers.productId, productId), eq(b2bSupplierOffers.supplierId, actorOrgId)));

    if (offers.length === 0) {
      const err = new Error('ثبت حداقل یک پیشنهاد تامین‌کننده (Supplier Offer) قبل از ارسال به صف بازبینی الزامی است.');
      (err as any).statusCode = 422;
      throw err;
    }

    const previousStatus = product.status;
    await db
      .update(b2bProducts)
      .set({
        status: 'SUBMITTED',
        updatedBy: actorId,
        updatedAt: new Date(),
      })
      .where(eq(b2bProducts.id, productId));

    // Lifecycle history
    await db.insert(b2bProductLifecycleHistory).values({
      id: `lch_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      productId,
      fromStatus: previousStatus,
      toStatus: 'SUBMITTED',
      changedBy: actorId,
      changedByOrgId: actorOrgId,
      reason: 'ارسال برای بررسی توسط عملیات محصول دیدار',
    });

    await this.logAudit('PRODUCT', productId, 'PRODUCT_SUBMITTED_FOR_REVIEW', actorId, actorOrgId, {
      fromStatus: previousStatus,
      toStatus: 'SUBMITTED',
    });

    return { success: true, status: 'SUBMITTED' };
  }

  /**
   * 3. SUPPLIER OFFER MANAGEMENT
   */
  static async createSupplierOffer(
    productId: string,
    offerData: {
      supplierProductCode?: string;
      weightType: 'EXACT' | 'RANGE';
      weightMin?: number | null;
      weightMax?: number | null;
      exactWeight?: number | null;
      makingFeeType: 'PERCENT' | 'RANGE_PERCENT' | 'FIXED';
      makingFeeValue?: number | null;
      makingFeeMin?: number | null;
      makingFeeMax?: number | null;
      availabilityType?: 'AVAILABLE' | 'MADE_TO_ORDER' | 'UNAVAILABLE';
      leadTimeDays?: number;
    },
    actorId: string,
    actorOrgId: string
  ) {
    const db = (await getDatabase()) as any;

    const [product] = await db.select().from(b2bProducts).where(eq(b2bProducts.id, productId));
    if (!product) {
      const err = new Error('محصول مورد نظر یافت نشد.');
      (err as any).statusCode = 404;
      throw err;
    }

    // Weight Validation
    if (offerData.weightType === 'EXACT') {
      if (!offerData.exactWeight || offerData.exactWeight <= 0) {
        const err = new Error('برای وزن دقیق (EXACT)، مقدار وزن معتبر بزرگتر از صفر الزامی است.');
        (err as any).statusCode = 422;
        throw err;
      }
    } else if (offerData.weightType === 'RANGE') {
      if (
        offerData.weightMin === undefined ||
        offerData.weightMin === null ||
        offerData.weightMin <= 0 ||
        offerData.weightMax === undefined ||
        offerData.weightMax === null ||
        offerData.weightMax < offerData.weightMin
      ) {
        const err = new Error('بازه وزن نامعتبر است (حداقل وزن باید بزرگتر از صفر و حداکثر بزرگتر یا مساوی حداقل باشد).');
        (err as any).statusCode = 422;
        throw err;
      }
    } else {
      const err = new Error('نوع وزن مشخص‌شده نامعتبر است.');
      (err as any).statusCode = 422;
      throw err;
    }

    // Making Fee Validation
    // STRICT RULE: FIXED fee creation is rejected until Owner defines unit and basis!
    if (offerData.makingFeeType === 'FIXED') {
      const err = new Error(
        'انجام محاسبات کارمزد ثابت (FIXED) تا زمان تصمیم‌گیری مالک پروژه درباره واحد و مبنای محاسبه غیرفعال است.'
      );
      (err as any).statusCode = 422;
      throw err;
    } else if (offerData.makingFeeType === 'PERCENT') {
      if (offerData.makingFeeValue === undefined || offerData.makingFeeValue === null || offerData.makingFeeValue < 0) {
        const err = new Error('درصد اجرت ساخت نامعتبر است.');
        (err as any).statusCode = 422;
        throw err;
      }
    } else if (offerData.makingFeeType === 'RANGE_PERCENT') {
      if (
        offerData.makingFeeMin === undefined ||
        offerData.makingFeeMin === null ||
        offerData.makingFeeMin < 0 ||
        offerData.makingFeeMax === undefined ||
        offerData.makingFeeMax === null ||
        offerData.makingFeeMax < offerData.makingFeeMin
      ) {
        const err = new Error('بازه درصد اجرت ساخت نامعتبر است.');
        (err as any).statusCode = 422;
        throw err;
      }
    } else {
      const err = new Error('نوع اجرت ساخت مشخص‌شده نامعتبر است.');
      (err as any).statusCode = 422;
      throw err;
    }

    const offerId = `ofr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const newOffer = {
      id: offerId,
      productId,
      supplierId: actorOrgId, // Locked strictly to authenticated organization
      supplierProductCode: offerData.supplierProductCode || null,
      weightType: offerData.weightType,
      exactWeight: offerData.weightType === 'EXACT' ? offerData.exactWeight : null,
      weightMin: offerData.weightType === 'RANGE' ? offerData.weightMin : null,
      weightMax: offerData.weightType === 'RANGE' ? offerData.weightMax : null,
      makingFeeType: offerData.makingFeeType,
      makingFeeValue: offerData.makingFeeType === 'PERCENT' ? offerData.makingFeeValue : null,
      makingFeeMin: offerData.makingFeeType === 'RANGE_PERCENT' ? offerData.makingFeeMin : null,
      makingFeeMax: offerData.makingFeeType === 'RANGE_PERCENT' ? offerData.makingFeeMax : null,
      availabilityType: offerData.availabilityType || 'AVAILABLE',
      leadTimeDays: offerData.leadTimeDays || 0,
      status: 'ACTIVE',
      createdBy: actorId,
    };

    await db.insert(b2bSupplierOffers).values(newOffer);

    await this.logAudit('SUPPLIER_OFFER', offerId, 'OFFER_CREATED', actorId, actorOrgId, {
      productId,
      weightType: offerData.weightType,
      makingFeeType: offerData.makingFeeType,
    });

    return newOffer;
  }

  static async updateSupplierOffer(
    offerId: string,
    offerData: Partial<{
      supplierProductCode: string;
      weightType: 'EXACT' | 'RANGE';
      weightMin: number;
      weightMax: number;
      exactWeight: number;
      makingFeeType: 'PERCENT' | 'RANGE_PERCENT' | 'FIXED';
      makingFeeValue: number;
      makingFeeMin: number;
      makingFeeMax: number;
      availabilityType: 'AVAILABLE' | 'MADE_TO_ORDER' | 'UNAVAILABLE';
      leadTimeDays: number;
      status: string;
    }>,
    actorId: string,
    actorOrgId: string,
    isProductOps: boolean = false
  ) {
    const db = (await getDatabase()) as any;

    const [existing] = await db.select().from(b2bSupplierOffers).where(eq(b2bSupplierOffers.id, offerId));
    if (!existing) {
      const err = new Error('پیشنهاد تامین‌کننده یافت نشد.');
      (err as any).statusCode = 404;
      throw err;
    }

    // Organization Scope enforcement: Supplier A CANNOT update Supplier B's offer!
    if (!isProductOps && existing.supplierId !== actorOrgId) {
      const err = new Error('عدم دسترسی: این پیشنهاد قیمت متعلق به تامین‌کننده دیگری است.');
      (err as any).statusCode = 403;
      throw err;
    }

    if (offerData.makingFeeType === 'FIXED') {
      const err = new Error(
        'انجام محاسبات کارمزد ثابت (FIXED) تا زمان تصمیم‌گیری مالک پروژه درباره واحد و مبنای محاسبه غیرفعال است.'
      );
      (err as any).statusCode = 422;
      throw err;
    }

    const updates: any = {
      updatedBy: actorId,
      updatedAt: new Date(),
    };

    if (offerData.supplierProductCode !== undefined) updates.supplierProductCode = offerData.supplierProductCode;
    if (offerData.weightType !== undefined) updates.weightType = offerData.weightType;
    if (offerData.exactWeight !== undefined) updates.exactWeight = offerData.exactWeight;
    if (offerData.weightMin !== undefined) updates.weightMin = offerData.weightMin;
    if (offerData.weightMax !== undefined) updates.weightMax = offerData.weightMax;
    if (offerData.makingFeeType !== undefined) updates.makingFeeType = offerData.makingFeeType;
    if (offerData.makingFeeValue !== undefined) updates.makingFeeValue = offerData.makingFeeValue;
    if (offerData.makingFeeMin !== undefined) updates.makingFeeMin = offerData.makingFeeMin;
    if (offerData.makingFeeMax !== undefined) updates.makingFeeMax = offerData.makingFeeMax;
    if (offerData.availabilityType !== undefined) updates.availabilityType = offerData.availabilityType;
    if (offerData.leadTimeDays !== undefined) updates.leadTimeDays = offerData.leadTimeDays;
    if (offerData.status !== undefined) updates.status = offerData.status;

    await db.update(b2bSupplierOffers).set(updates).where(eq(b2bSupplierOffers.id, offerId));

    await this.logAudit('SUPPLIER_OFFER', offerId, 'OFFER_EDITED', actorId, actorOrgId, updates);

    return { ...existing, ...updates };
  }

  static async getSupplierOffersForProduct(
    productId: string,
    actorOrgId: string,
    isProductOps: boolean = false
  ) {
    const db = (await getDatabase()) as any;

    if (isProductOps) {
      // Product Ops sees all supplier offers on the product
      return db
        .select({
          offer: b2bSupplierOffers,
          supplierName: k01Organizations.displayName,
          supplierLegalName: k01Organizations.legalName,
        })
        .from(b2bSupplierOffers)
        .leftJoin(k01Organizations, eq(b2bSupplierOffers.supplierId, k01Organizations.id))
        .where(eq(b2bSupplierOffers.productId, productId));
    } else {
      // Supplier sees ONLY its own offers (Negative access query filter!)
      return db
        .select()
        .from(b2bSupplierOffers)
        .where(and(eq(b2bSupplierOffers.productId, productId), eq(b2bSupplierOffers.supplierId, actorOrgId)));
    }
  }

  static async getSupplierProducts(actorOrgId: string) {
    const db = (await getDatabase()) as any;
    return db
      .select({
        product: b2bProducts,
        subcategoryNameFa: b2bCategories.nameFa,
      })
      .from(b2bProducts)
      .leftJoin(b2bCategories, eq(b2bProducts.subcategoryId, b2bCategories.id))
      .where(eq(b2bProducts.createdByOrgId, actorOrgId))
      .orderBy(desc(b2bProducts.createdAt));
  }

  /**
   * 4. PRODUCT OPERATIONS (REVIEW & PUBLISH WORKFLOW)
   */
  static async getProductOpsQueue(statusFilter?: string) {
    const db = (await getDatabase()) as any;
    let query = db
      .select({
        product: b2bProducts,
        subcategoryNameFa: b2bCategories.nameFa,
        supplierName: k01Organizations.displayName,
      })
      .from(b2bProducts)
      .leftJoin(b2bCategories, eq(b2bProducts.subcategoryId, b2bCategories.id))
      .leftJoin(k01Organizations, eq(b2bProducts.createdByOrgId, k01Organizations.id));

    if (statusFilter && statusFilter !== 'ALL') {
      query = query.where(eq(b2bProducts.status, statusFilter));
    }

    return query.orderBy(desc(b2bProducts.createdAt));
  }

  static async getProductOpsDetail(productId: string) {
    const db = (await getDatabase()) as any;

    const [productRow] = await db
      .select({
        product: b2bProducts,
        subcategory: b2bCategories,
        supplier: k01Organizations,
      })
      .from(b2bProducts)
      .leftJoin(b2bCategories, eq(b2bProducts.subcategoryId, b2bCategories.id))
      .leftJoin(k01Organizations, eq(b2bProducts.createdByOrgId, k01Organizations.id))
      .where(eq(b2bProducts.id, productId));

    if (!productRow) {
      const err = new Error('محصول مورد نظر یافت نشد.');
      (err as any).statusCode = 404;
      throw err;
    }

    const offers = await db
      .select({
        offer: b2bSupplierOffers,
        supplierDisplayName: k01Organizations.displayName,
      })
      .from(b2bSupplierOffers)
      .leftJoin(k01Organizations, eq(b2bSupplierOffers.supplierId, k01Organizations.id))
      .where(eq(b2bSupplierOffers.productId, productId));

    const history = await db
      .select()
      .from(b2bProductLifecycleHistory)
      .where(eq(b2bProductLifecycleHistory.productId, productId))
      .orderBy(desc(b2bProductLifecycleHistory.createdAt));

    return {
      product: productRow.product,
      subcategory: productRow.subcategory,
      supplier: productRow.supplier,
      offers,
      history,
    };
  }

  static async reviewProduct(
    productId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'PUBLISH' | 'UNPUBLISH',
    payload: { reason?: string },
    actorId: string,
    actorOrgId: string
  ) {
    const db = (await getDatabase()) as any;

    const [product] = await db.select().from(b2bProducts).where(eq(b2bProducts.id, productId));
    if (!product) {
      const err = new Error('محصول مورد نظر یافت نشد.');
      (err as any).statusCode = 404;
      throw err;
    }

    let targetStatus: string;

    if (action === 'APPROVE') {
      if (product.status !== 'SUBMITTED') {
        const err = new Error(`تایید محصول فقط از وضعیت بررسی (SUBMITTED) ممکن است. وضعیت فعلی: ${product.status}`);
        (err as any).statusCode = 422;
        throw err;
      }
      targetStatus = 'APPROVED';
    } else if (action === 'REJECT') {
      if (!payload.reason || payload.reason.trim().length === 0) {
        const err = new Error('درج دلیل رد محصول الزامی است.');
        (err as any).statusCode = 422;
        throw err;
      }
      if (product.status !== 'SUBMITTED' && product.status !== 'CHANGES_REQUESTED') {
        const err = new Error(`رد محصول در وضعیت فعلی (${product.status}) امکان‌پذیر نیست.`);
        (err as any).statusCode = 422;
        throw err;
      }
      targetStatus = 'REJECTED';
    } else if (action === 'REQUEST_CHANGES') {
      if (!payload.reason || payload.reason.trim().length === 0) {
        const err = new Error('درج توضیحات و دلایل درخواست اصلاحات الزامی است.');
        (err as any).statusCode = 422;
        throw err;
      }
      if (product.status !== 'SUBMITTED') {
        const err = new Error(`درخواست اصلاحات فقط روی محصولات در حال بررسی ممکن است. وضعیت فعلی: ${product.status}`);
        (err as any).statusCode = 422;
        throw err;
      }
      targetStatus = 'CHANGES_REQUESTED';
    } else if (action === 'PUBLISH') {
      // INVARIANT: Product CANNOT be published directly without prior APPROVAL!
      if (product.status !== 'APPROVED') {
        const err = new Error(
          `انتشار محصول فقط پس از تایید توسط عملیات محصول امکان‌پذیر است. وضعیت فعلی: ${product.status}`
        );
        (err as any).statusCode = 422;
        throw err;
      }
      targetStatus = 'PUBLISHED';
    } else if (action === 'UNPUBLISH') {
      if (product.status !== 'PUBLISHED') {
        const err = new Error(`خروج از انتشار فقط برای محصولات منتشرشده امکان‌پذیر است.`);
        (err as any).statusCode = 422;
        throw err;
      }
      targetStatus = 'INACTIVE';
    } else {
      const err = new Error('عملیات بازبینی نامعتبر است.');
      (err as any).statusCode = 400;
      throw err;
    }

    await db
      .update(b2bProducts)
      .set({
        status: targetStatus,
        updatedBy: actorId,
        updatedAt: new Date(),
      })
      .where(eq(b2bProducts.id, productId));

    // Record lifecycle transition
    await db.insert(b2bProductLifecycleHistory).values({
      id: `lch_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      productId,
      fromStatus: product.status,
      toStatus: targetStatus,
      changedBy: actorId,
      changedByOrgId: actorOrgId,
      reason: payload.reason || (action === 'APPROVE' ? 'تایید مشخصات طلا توسط عملیات محصول' : action === 'PUBLISH' ? 'انتشار محصول در کاتالوگ خرده‌فروشی' : null),
    });

    const auditActionMap: Record<string, string> = {
      APPROVE: 'PRODUCT_APPROVED',
      REJECT: 'PRODUCT_REJECTED',
      REQUEST_CHANGES: 'PRODUCT_CHANGES_REQUESTED',
      PUBLISH: 'PRODUCT_PUBLISHED',
      UNPUBLISH: 'PRODUCT_UNPUBLISHED',
    };

    await this.logAudit('PRODUCT', productId, auditActionMap[action] || `PRODUCT_${action}`, actorId, actorOrgId, {
      fromStatus: product.status,
      toStatus: targetStatus,
      reason: payload.reason,
    });

    return {
      success: true,
      productId,
      previousStatus: product.status,
      currentStatus: targetStatus,
    };
  }

  /**
   * 5. SAFE RETAILER PUBLIC CATALOG PROJECTION
   * Rules:
   * - Shows ONLY status === 'PUBLISHED' products
   * - Excludes internal supplier identities and confidential terms
   * - Computes indicative public ranges
   */
  static async getRetailerCatalog(filters: {
    subcategoryId?: string;
    parentCategoryId?: string;
    search?: string;
  }): Promise<RetailerProductDTO[]> {
    const db = (await getDatabase()) as any;

    let conditions = [eq(b2bProducts.status, 'PUBLISHED')];

    if (filters.subcategoryId) {
      conditions.push(eq(b2bProducts.subcategoryId, filters.subcategoryId));
    }

    if (filters.search && filters.search.trim()) {
      const s = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(b2bProducts.name, s),
          ilike(b2bProducts.productCode, s),
          ilike(b2bProducts.description, s)
        )!
      );
    }

    const products = await db
      .select({
        product: b2bProducts,
        subcategory: b2bCategories,
      })
      .from(b2bProducts)
      .innerJoin(b2bCategories, eq(b2bProducts.subcategoryId, b2bCategories.id))
      .where(and(...conditions))
      .orderBy(desc(b2bProducts.createdAt));

    // Fetch active offers for these products to compute indicative public ranges
    const productIds = products.map((p: any) => p.product.id);
    let allOffers: any[] = [];
    if (productIds.length > 0) {
      allOffers = await db
        .select()
        .from(b2bSupplierOffers)
        .where(and(inArray(b2bSupplierOffers.productId, productIds), eq(b2bSupplierOffers.status, 'ACTIVE')));
    }

    return products.map(({ product, subcategory }: any) => {
      const offers = allOffers.filter((o) => o.productId === product.id);

      // Compute indicative weight range
      let minW = Infinity;
      let maxW = -Infinity;
      for (const off of offers) {
        if (off.weightType === 'EXACT' && off.exactWeight) {
          minW = Math.min(minW, off.exactWeight);
          maxW = Math.max(maxW, off.exactWeight);
        } else if (off.weightType === 'RANGE') {
          if (off.weightMin) minW = Math.min(minW, off.weightMin);
          if (off.weightMax) maxW = Math.max(maxW, off.weightMax);
        }
      }

      // Compute indicative making fee range
      let minFee = Infinity;
      let maxFee = -Infinity;
      for (const off of offers) {
        if (off.makingFeeType === 'PERCENT' && off.makingFeeValue !== null) {
          minFee = Math.min(minFee, off.makingFeeValue);
          maxFee = Math.max(maxFee, off.makingFeeValue);
        } else if (off.makingFeeType === 'RANGE_PERCENT') {
          if (off.makingFeeMin !== null) minFee = Math.min(minFee, off.makingFeeMin);
          if (off.makingFeeMax !== null) maxFee = Math.max(maxFee, off.makingFeeMax);
        }
      }

      const hasAvailable = offers.some((o) => o.availabilityType === 'AVAILABLE');
      const hasMadeToOrder = offers.some((o) => o.availabilityType === 'MADE_TO_ORDER');
      const availability: 'AVAILABLE' | 'MADE_TO_ORDER' | 'UNAVAILABLE' = hasAvailable
        ? 'AVAILABLE'
        : hasMadeToOrder
        ? 'MADE_TO_ORDER'
        : 'UNAVAILABLE';

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        productCode: product.productCode,
        description: product.description,
        technicalDescription: product.technicalDescription,
        primaryImage: product.primaryImage,
        gallery: Array.isArray(product.gallery) ? product.gallery : [],
        karat: product.karat,
        material: product.material,
        status: product.status,
        subcategory: {
          id: subcategory.id,
          code: subcategory.code,
          nameFa: subcategory.nameFa,
          nameEn: subcategory.nameEn,
        },
        indicativeWeightRange: minW !== Infinity ? { min: minW, max: maxW } : null,
        indicativeMakingFeeRange: minFee !== Infinity ? { min: minFee, max: maxFee } : null,
        availability,
      };
    });
  }

  static async getRetailerProductDetail(productId: string): Promise<RetailerProductDTO> {
    const list = await this.getRetailerCatalog({});
    const item = list.find((p) => p.id === productId);
    if (!item) {
      const err = new Error('محصول مورد نظر در کاتالوگ عمومی موجود نیست.');
      (err as any).statusCode = 404;
      throw err;
    }
    return item;
  }

  /**
   * 6. AUDIT TRAIL HELPER
   */
  static async logAudit(
    entityType: 'PRODUCT' | 'SUPPLIER_OFFER' | 'TAXONOMY',
    entityId: string,
    action: string,
    actorId: string,
    actorOrgId: string,
    payload: any
  ) {
    try {
      const db = (await getDatabase()) as any;
      await db.insert(b2bProductAuditLogs).values({
        id: `aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        entityType,
        entityId,
        action,
        actorId,
        actorOrgId,
        payload: payload || {},
      });
    } catch (e: any) {
      console.warn('[P01 Product Audit] Failed to log:', e?.message || e);
    }
  }
}
