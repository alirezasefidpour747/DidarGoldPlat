/**
 * Didar B2B - P01 Product Core & Taxonomy Comprehensive Verification Suite
 * Governed by PRODUCT-CORE.md, PRODUCT-TAXONOMY-SEED.md, and P01-IMPLEMENTATION-MAP.md
 *
 * Verifies the complete vertical slice:
 * PostgreSQL (PGlite Isolated) → Drizzle Migration → Service → API → RBAC → Validation → Audit → Persistence
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import os from 'os';
import path from 'path';
import {
  getDatabase,
  closeDatabase,
  cleanupTestDatabase,
  resetDatabaseClient,
} from '../server/db/index.js';
import { runMigrations } from '../server/db/migrate.js';
import { seedP01Data } from '../server/db/p01-seed.js';
import { p01ProductRouter } from '../server/routes/p01-product.js';
import { authRouter } from '../server/routes/auth.js';
import { AuthService } from '../server/services/auth.service.js';
import { P01ProductService } from '../server/services/p01-product.service.js';
import { b2bProducts, b2bSupplierOffers, b2bCategories, b2bProductAuditLogs } from '../server/db/schema.js';
import { eq } from 'drizzle-orm';

let app: express.Express;
const testDisposableDir = path.join(
  os.tmpdir(),
  `didar-p01-test-isolation-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
);

process.env.PGDATA_TEST = testDisposableDir;
process.env.DB_ENGINE = 'pglite';

let supplierZarrinToken = '';
let supplierAlvandToken = '';
let productOpsToken = '';
let retailerGemToken = '';

beforeAll(async () => {
  app = express();
  app.use(express.json());

  app.use('/api/auth', authRouter);
  app.use('/api', p01ProductRouter);

  // 1. Run migrations
  await runMigrations();

  // 2. Run P01 seed
  await seedP01Data();

  // 3. Obtain authentication session tokens for real actors
  const zarrinLogin = await AuthService.login({ identifier: '09122000002', password: 'Pass1234!' });
  supplierZarrinToken = zarrinLogin.token;

  const alvandLogin = await AuthService.login({ identifier: '09123000003', password: 'Pass1234!' });
  supplierAlvandToken = alvandLogin.token;

  const opsLogin = await AuthService.login({ identifier: '09121000001', password: 'Pass1234!' });
  productOpsToken = opsLogin.token;

  const retLogin = await AuthService.login({ identifier: '09124000004', password: 'Pass1234!' });
  retailerGemToken = retLogin.token;
});

afterAll(async () => {
  await closeDatabase();
  await cleanupTestDatabase(testDisposableDir);
});

describe('Didar B2B - P01 Product Core & Taxonomy Implementation Suite', () => {
  // -----------------------------------------------------------------
  // 1. DATABASE & TAXONOMY SEEDING
  // -----------------------------------------------------------------
  it('1. should verify deterministic taxonomy seed and idempotency (0 duplicate nodes on re-run)', async () => {
    const firstResult = await seedP01Data();
    expect(firstResult.categoriesCount).toBeGreaterThanOrEqual(20);
    expect(firstResult.productsCount).toBeGreaterThanOrEqual(5);

    // Re-seed: must execute cleanly and return the exact same count
    const secondResult = await seedP01Data();
    expect(secondResult.categoriesCount).toBe(firstResult.categoriesCount);
    expect(secondResult.productsCount).toBe(firstResult.productsCount);
  });

  it('2. should verify 3-level taxonomy hierarchy: Main Category -> Product Category -> Subcategory', async () => {
    const tree = await P01ProductService.getTaxonomyTree();
    expect(tree.length).toBeGreaterThanOrEqual(3);

    // Level 1: Main Category
    const bodyJewelry = tree.find((c) => c.code === 'body-jewelry');
    expect(bodyJewelry).toBeDefined();
    expect(bodyJewelry!.level).toBe(1);
    expect(bodyJewelry!.children).toBeDefined();
    expect(bodyJewelry!.children!.length).toBeGreaterThan(0);

    // Level 2: Product Category
    const ringCat = bodyJewelry!.children!.find((c: any) => c.code === 'ring');
    expect(ringCat).toBeDefined();
    expect(ringCat!.level).toBe(2);
    expect(ringCat!.children).toBeDefined();
    expect(ringCat!.children!.length).toBeGreaterThan(0);

    // Level 3: Subcategory
    const plainRing = ringCat!.children!.find((c: any) => c.code === 'plain-ring');
    expect(plainRing).toBeDefined();
    expect(plainRing!.level).toBe(3);
  });

  it('3. should fetch taxonomy tree via public API endpoint', async () => {
    const res = await request(app).get('/api/taxonomy/tree');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // -----------------------------------------------------------------
  // 2. PRODUCT DRAFT CREATION & VALIDATION
  // -----------------------------------------------------------------
  let createdProductId = '';

  it('4. should create product draft with valid leaf subcategory in DRAFT status', async () => {
    const subcats = await P01ProductService.getActiveSubcategories();
    expect(subcats.length).toBeGreaterThan(0);
    const targetSubcat = subcats[0];

    const res = await request(app)
      .post('/api/supplier/products')
      .set('Authorization', `Bearer ${supplierZarrinToken}`)
      .send({
        name: 'انگشتر طلای تست خودکار ۱۸ عیار',
        subcategoryId: targetSubcat.id,
        description: 'مدل تست ارگونومیک طلای زرد',
        karat: 18,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.createdByOrgId).toBe('org_supplier_zarrin');

    createdProductId = res.body.data.id;
  });

  it('5. should reject product draft with non-existent or invalid subcategory (422)', async () => {
    const res = await request(app)
      .post('/api/supplier/products')
      .set('Authorization', `Bearer ${supplierZarrinToken}`)
      .send({
        name: 'مدل نامعتبر',
        subcategoryId: 'invalid_non_existent_category_id',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  // -----------------------------------------------------------------
  // 3. SUPPLIER OFFERS & COMMERCIAL TERMS VALIDATION
  // -----------------------------------------------------------------
  let zarrinOfferId = '';

  it('6. should allow supplier to add EXACT weight offer with PERCENT making fee', async () => {
    const res = await request(app)
      .post(`/api/supplier/products/${createdProductId}/offers`)
      .set('Authorization', `Bearer ${supplierZarrinToken}`)
      .send({
        weightType: 'EXACT',
        exactWeight: 5.25,
        makingFeeType: 'PERCENT',
        makingFeeValue: 10.5,
        availabilityType: 'AVAILABLE',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.exactWeight).toBe(5.25);
    expect(res.body.data.makingFeeValue).toBe(10.5);

    zarrinOfferId = res.body.data.id;
  });

  it('7. should strictly reject FIXED making fee creation pending owner decision (422)', async () => {
    const res = await request(app)
      .post(`/api/supplier/products/${createdProductId}/offers`)
      .set('Authorization', `Bearer ${supplierZarrinToken}`)
      .send({
        weightType: 'EXACT',
        exactWeight: 4.0,
        makingFeeType: 'FIXED',
        makingFeeValue: 500000,
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('FIXED');
  });

  it('8. should reject invalid weight range (weightMax < weightMin) with 422', async () => {
    const res = await request(app)
      .post(`/api/supplier/products/${createdProductId}/offers`)
      .set('Authorization', `Bearer ${supplierZarrinToken}`)
      .send({
        weightType: 'RANGE',
        weightMin: 6.0,
        weightMax: 4.0, // Invalid: max < min
        makingFeeType: 'PERCENT',
        makingFeeValue: 9.0,
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('9. should support multi-supplier offers from another supplier (Alvand) on the same product', async () => {
    // Supplier Alvand adds a RANGE weight offer with RANGE_PERCENT making fee on the same product
    const res = await request(app)
      .post(`/api/supplier/products/${createdProductId}/offers`)
      .set('Authorization', `Bearer ${supplierAlvandToken}`)
      .send({
        weightType: 'RANGE',
        weightMin: 4.8,
        weightMax: 6.2,
        makingFeeType: 'RANGE_PERCENT',
        makingFeeMin: 11.0,
        makingFeeMax: 13.5,
        availabilityType: 'MADE_TO_ORDER',
        leadTimeDays: 3,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.supplierId).toBe('org_supplier_alvand');
  });

  // -----------------------------------------------------------------
  // 4. ORGANIZATION ISOLATION & NEGATIVE ACCESS TESTS
  // -----------------------------------------------------------------
  it('10. should enforce Organization Isolation: Supplier Alvand CANNOT update Supplier Zarrin offer (403)', async () => {
    const res = await request(app)
      .put(`/api/supplier/offers/${zarrinOfferId}`)
      .set('Authorization', `Bearer ${supplierAlvandToken}`)
      .send({
        makingFeeValue: 5.0,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('تامین‌کننده دیگری');
  });

  it('11. should enforce Organization Isolation: Supplier Alvand query sees ONLY Alvand offers on the product', async () => {
    const res = await request(app)
      .get(`/api/supplier/products/${createdProductId}/offers`)
      .set('Authorization', `Bearer ${supplierAlvandToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Must contain ONLY offers belonging to Alvand
    for (const off of res.body.data) {
      expect(off.supplierId).toBe('org_supplier_alvand');
    }
  });

  it('12. should enforce Organization Isolation: Supplier Alvand CANNOT edit Supplier Zarrin product (403)', async () => {
    const res = await request(app)
      .put(`/api/supplier/products/${createdProductId}`)
      .set('Authorization', `Bearer ${supplierAlvandToken}`)
      .send({
        name: 'تغییر نام توسط کاربر غیرمجاز',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // -----------------------------------------------------------------
  // 5. WORKFLOW STATE MACHINE ENFORCEMENT
  // -----------------------------------------------------------------
  it('13. should reject direct publish by Supplier without Product Ops approval (403 Forbidden)', async () => {
    const res = await request(app)
      .post(`/api/product-ops/products/${createdProductId}/publish`)
      .set('Authorization', `Bearer ${supplierZarrinToken}`)
      .send({});

    expect(res.status).toBe(403);
  });

  it('14. should allow Supplier to submit product for review (DRAFT -> SUBMITTED)', async () => {
    const res = await request(app)
      .post(`/api/supplier/products/${createdProductId}/submit`)
      .set('Authorization', `Bearer ${supplierZarrinToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUBMITTED');
  });

  it('15. should allow Product Ops to request changes with mandatory note (SUBMITTED -> CHANGES_REQUESTED)', async () => {
    const res = await request(app)
      .post(`/api/product-ops/products/${createdProductId}/request-changes`)
      .set('Authorization', `Bearer ${productOpsToken}`)
      .send({
        reason: 'لطفاً تصویر با زمینه شفاف و ابعاد استاندارد اضافه شود.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentStatus).toBe('CHANGES_REQUESTED');
  });

  it('16. should reject request-changes if reason is empty (422)', async () => {
    const res = await request(app)
      .post(`/api/product-ops/products/${createdProductId}/request-changes`)
      .set('Authorization', `Bearer ${productOpsToken}`)
      .send({
        reason: '',
      });

    expect(res.status).toBe(422);
  });

  it('17. should allow Supplier to update product and resubmit for review (CHANGES_REQUESTED -> SUBMITTED)', async () => {
    await request(app)
      .put(`/api/supplier/products/${createdProductId}`)
      .set('Authorization', `Bearer ${supplierZarrinToken}`)
      .send({
        description: 'تصویر اصلاح‌شده به همراه توضیحات نهایی اضافه شد.',
      });

    const res = await request(app)
      .post(`/api/supplier/products/${createdProductId}/submit`)
      .set('Authorization', `Bearer ${supplierZarrinToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SUBMITTED');
  });

  it('18. should reject publishing a SUBMITTED product before it is APPROVED (422)', async () => {
    const res = await request(app)
      .post(`/api/product-ops/products/${createdProductId}/publish`)
      .set('Authorization', `Bearer ${productOpsToken}`)
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.message).toContain('تایید توسط عملیات محصول');
  });

  it('19. should allow Product Ops to approve product (SUBMITTED -> APPROVED)', async () => {
    const res = await request(app)
      .post(`/api/product-ops/products/${createdProductId}/approve`)
      .set('Authorization', `Bearer ${productOpsToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.data.currentStatus).toBe('APPROVED');
  });

  it('20. should allow Product Ops to publish approved product to Retailer Catalog (APPROVED -> PUBLISHED)', async () => {
    const res = await request(app)
      .post(`/api/product-ops/products/${createdProductId}/publish`)
      .set('Authorization', `Bearer ${productOpsToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.data.currentStatus).toBe('PUBLISHED');
  });

  // -----------------------------------------------------------------
  // 6. RETAILER SAFE PUBLIC PROJECTION
  // -----------------------------------------------------------------
  it('21. should expose PUBLISHED product in Retailer Catalog with safe indicative ranges and ZERO supplier details', async () => {
    const res = await request(app).get('/api/retailer/catalog');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const publishedProduct = res.body.data.find((p: any) => p.id === createdProductId);
    expect(publishedProduct).toBeDefined();

    // MUST NOT expose internal supplier info:
    expect((publishedProduct as any).supplierId).toBeUndefined();
    expect((publishedProduct as any).supplierName).toBeUndefined();
    expect((publishedProduct as any).supplier_product_code).toBeUndefined();
    expect((publishedProduct as any).supplierOffers).toBeUndefined();

    // MUST expose safe public ranges:
    expect(publishedProduct.indicativeWeightRange).toBeDefined();
    expect(publishedProduct.indicativeWeightRange.min).toBeLessThanOrEqual(5.25);
    expect(publishedProduct.indicativeMakingFeeRange).toBeDefined();
    expect(publishedProduct.indicativeMakingFeeRange.min).toBeLessThanOrEqual(10.5);
  });

  it('22. should verify unpublished and draft products are completely invisible in Retailer Catalog', async () => {
    const res = await request(app).get('/api/retailer/catalog');
    const draft = res.body.data.find((p: any) => p.id === 'prd_gold_bracelet_cuff_05'); // DRAFT in seed
    const submitted = res.body.data.find((p: any) => p.id === 'prd_gold_earring_hoop_03'); // SUBMITTED in seed
    expect(draft).toBeUndefined();
    expect(submitted).toBeUndefined();
  });

  // -----------------------------------------------------------------
  // 7. AUDIT TRAIL VERIFICATION
  // -----------------------------------------------------------------
  it('23. should verify audit log records exist for Product & Offer mutations', async () => {
    const db = (await getDatabase()) as any;
    const logs = await db
      .select()
      .from(b2bProductAuditLogs)
      .where(eq(b2bProductAuditLogs.entityId, createdProductId));

    expect(logs.length).toBeGreaterThanOrEqual(2);
    const actions = logs.map((l: any) => l.action);
    expect(actions).toContain('PRODUCT_CREATED');
    expect(actions).toContain('PRODUCT_PUBLISHED');
  });

  // -----------------------------------------------------------------
  // 8. PERSISTENCE ACROSS ENGINE RECONNECT
  // -----------------------------------------------------------------
  it('24. should verify persistence of P01 products and offers across database teardown & reinitialization', async () => {
    await closeDatabase();
    resetDatabaseClient();

    const db = (await getDatabase()) as any;
    const [reloadedProduct] = await db
      .select()
      .from(b2bProducts)
      .where(eq(b2bProducts.id, createdProductId));

    expect(reloadedProduct).toBeDefined();
    expect(reloadedProduct.status).toBe('PUBLISHED');

    const offers = await db
      .select()
      .from(b2bSupplierOffers)
      .where(eq(b2bSupplierOffers.productId, createdProductId));

    expect(offers.length).toBeGreaterThanOrEqual(2);
  });
});
