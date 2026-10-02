/**
 * Didar B2B - P01 Product Core & Taxonomy API Routes
 * Endpoints for Taxonomy, Retailer Catalog, Supplier Product/Offers,
 * and Product Ops Review/Publishing Workflow.
 */

import { Router, Request, Response } from 'express';
import { P01ProductService } from '../services/p01-product.service.js';
import { authenticate, optionalAuthenticate, requirePermission, requireOrganizationScope } from '../middleware/auth.middleware.js';

export const p01ProductRouter = Router();

// ========================================================
// 1. TAXONOMY ROUTES (Public & Authenticated)
// ========================================================

/**
 * GET /api/taxonomy/tree
 * Returns the full 3-level active gold taxonomy tree
 */
p01ProductRouter.get('/taxonomy/tree', async (req: Request, res: Response) => {
  try {
    const tree = await P01ProductService.getTaxonomyTree();
    res.json({ success: true, data: tree });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err?.message || 'خطا در دریافت ساختار طبقه‌بندی' } });
  }
});

/**
 * GET /api/taxonomy/subcategories
 * Returns active level-3 leaf subcategories
 */
p01ProductRouter.get('/taxonomy/subcategories', async (req: Request, res: Response) => {
  try {
    const subcats = await P01ProductService.getActiveSubcategories();
    res.json({ success: true, data: subcats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err?.message || 'خطا در دریافت زیرشاخه‌ها' } });
  }
});

// ========================================================
// 2. RETAILER CATALOG ROUTES (Safe Projection DTO)
// Retailer NEVER sees internal supplier identities or commercial terms
// ========================================================

/**
 * GET /api/retailer/catalog
 * Browse published products with safe indicative ranges
 */
p01ProductRouter.get('/retailer/catalog', optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { subcategoryId, parentCategoryId, search } = req.query;
    const catalog = await P01ProductService.getRetailerCatalog({
      subcategoryId: subcategoryId as string | undefined,
      parentCategoryId: parentCategoryId as string | undefined,
      search: search as string | undefined,
    });
    res.json({ success: true, data: catalog, total: catalog.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err?.message || 'خطا در بارگذاری کاتالوگ خرده‌فروشی' } });
  }
});

/**
 * GET /api/retailer/catalog/:id
 * Safe product detail for retailer
 */
p01ProductRouter.get('/retailer/catalog/:id', optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const product = await P01ProductService.getRetailerProductDetail(req.params.id);
    res.json({ success: true, data: product });
  } catch (err: any) {
    const statusCode = err?.statusCode || 500;
    res.status(statusCode).json({ success: false, error: { message: err?.message || 'محصول یافت نشد' } });
  }
});

// ========================================================
// 3. SUPPLIER WORKSPACE ROUTES (Organization Scoped)
// ========================================================

/**
 * GET /api/supplier/products
 * Lists products created by the authenticated supplier's organization
 */
p01ProductRouter.get(
  '/supplier/products',
  authenticate,
  requireOrganizationScope,
  async (req: Request, res: Response) => {
    try {
      const orgId = req.scopedOrgId!;
      const products = await P01ProductService.getSupplierProducts(orgId);
      res.json({ success: true, data: products });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err?.message || 'خطا در دریافت محصولات تامین‌کننده' } });
    }
  }
);

/**
 * POST /api/supplier/products
 * Creates a new product draft for the supplier's organization
 */
p01ProductRouter.post(
  '/supplier/products',
  authenticate,
  requireOrganizationScope,
  requirePermission('product.create_own'),
  async (req: Request, res: Response) => {
    try {
      const actorId = req.user!.partyId;
      const actorOrgId = req.scopedOrgId!;
      const product = await P01ProductService.createProductDraft(req.body, actorId, actorOrgId);
      res.status(201).json({ success: true, data: product });
    } catch (err: any) {
      const statusCode = err?.statusCode || 500;
      res.status(statusCode).json({ success: false, error: { message: err?.message || 'خطا در ثبت محصول' } });
    }
  }
);

/**
 * PUT /api/supplier/products/:id
 * Updates an existing draft or changes_requested product
 */
p01ProductRouter.put(
  '/supplier/products/:id',
  authenticate,
  requireOrganizationScope,
  requirePermission('product.update_own_draft'),
  async (req: Request, res: Response) => {
    try {
      const actorId = req.user!.partyId;
      const actorOrgId = req.scopedOrgId!;
      const updated = await P01ProductService.updateProductDraft(req.params.id, req.body, actorId, actorOrgId);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      const statusCode = err?.statusCode || 500;
      res.status(statusCode).json({ success: false, error: { message: err?.message || 'خطا در ویرایش محصول' } });
    }
  }
);

/**
 * POST /api/supplier/products/:id/submit
 * Submits a draft product for review to Product Ops queue
 */
p01ProductRouter.post(
  '/supplier/products/:id/submit',
  authenticate,
  requireOrganizationScope,
  requirePermission('product.submit_for_review'),
  async (req: Request, res: Response) => {
    try {
      const actorId = req.user!.partyId;
      const actorOrgId = req.scopedOrgId!;
      const result = await P01ProductService.submitProductForReview(req.params.id, actorId, actorOrgId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      const statusCode = err?.statusCode || 500;
      res.status(statusCode).json({ success: false, error: { message: err?.message || 'خطا در ارسال محصول برای بررسی' } });
    }
  }
);

/**
 * GET /api/supplier/products/:id/offers
 * Returns own supplier offers on the product
 */
p01ProductRouter.get(
  '/supplier/products/:id/offers',
  authenticate,
  requireOrganizationScope,
  async (req: Request, res: Response) => {
    try {
      const actorOrgId = req.scopedOrgId!;
      const isOps = req.user!.roleKeys.includes('DIDAR_PRODUCT_OPS') || req.user!.roleKeys.includes('DIDAR_SUPER_ADMIN');
      const offers = await P01ProductService.getSupplierOffersForProduct(req.params.id, actorOrgId, isOps);
      res.json({ success: true, data: offers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err?.message || 'خطا در دریافت پیشنهادهای تامین‌کننده' } });
    }
  }
);

/**
 * POST /api/supplier/products/:id/offers
 * Creates a new supplier offer
 */
p01ProductRouter.post(
  '/supplier/products/:id/offers',
  authenticate,
  requireOrganizationScope,
  requirePermission('offer.create_own'),
  async (req: Request, res: Response) => {
    try {
      const actorId = req.user!.partyId;
      const actorOrgId = req.scopedOrgId!;
      const offer = await P01ProductService.createSupplierOffer(req.params.id, req.body, actorId, actorOrgId);
      res.status(201).json({ success: true, data: offer });
    } catch (err: any) {
      const statusCode = err?.statusCode || 500;
      res.status(statusCode).json({ success: false, error: { message: err?.message || 'خطا در ثبت آفر تامین‌کننده' } });
    }
  }
);

/**
 * PUT /api/supplier/offers/:offerId
 * Updates a supplier offer with negative access enforcement
 */
p01ProductRouter.put(
  '/supplier/offers/:offerId',
  authenticate,
  requireOrganizationScope,
  requirePermission('offer.update_own'),
  async (req: Request, res: Response) => {
    try {
      const actorId = req.user!.partyId;
      const actorOrgId = req.scopedOrgId!;
      const isOps = req.user!.roleKeys.includes('DIDAR_PRODUCT_OPS') || req.user!.roleKeys.includes('DIDAR_SUPER_ADMIN');
      const updated = await P01ProductService.updateSupplierOffer(req.params.offerId, req.body, actorId, actorOrgId, isOps);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      const statusCode = err?.statusCode || 500;
      res.status(statusCode).json({ success: false, error: { message: err?.message || 'خطا در ویرایش آفر تامین‌کننده' } });
    }
  }
);

// ========================================================
// 4. DIDAR PRODUCT OPS ROUTES (Review, Approval, Publication)
// ========================================================

/**
 * GET /api/product-ops/queue
 * Product Operations review queue
 */
p01ProductRouter.get(
  '/product-ops/queue',
  authenticate,
  requirePermission('product.review'),
  async (req: Request, res: Response) => {
    try {
      const statusFilter = (req.query.status as string) || 'SUBMITTED';
      const queue = await P01ProductService.getProductOpsQueue(statusFilter);
      res.json({ success: true, data: queue });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err?.message || 'خطا در بارگذاری صف بررسی محصولات' } });
    }
  }
);

/**
 * GET /api/product-ops/products/:id
 * Full product review details including all supplier offers
 */
p01ProductRouter.get(
  '/product-ops/products/:id',
  authenticate,
  requirePermission('product.review'),
  async (req: Request, res: Response) => {
    try {
      const detail = await P01ProductService.getProductOpsDetail(req.params.id);
      res.json({ success: true, data: detail });
    } catch (err: any) {
      const statusCode = err?.statusCode || 500;
      res.status(statusCode).json({ success: false, error: { message: err?.message || 'خطا در دریافت جزییات بررسی محصول' } });
    }
  }
);

/**
 * POST /api/product-ops/products/:id/approve
 * Approves a product
 */
p01ProductRouter.post(
  '/product-ops/products/:id/approve',
  authenticate,
  requirePermission('product.approve'),
  async (req: Request, res: Response) => {
    try {
      const actorId = req.user!.partyId;
      const actorOrgId = req.scopedOrgId!;
      const result = await P01ProductService.reviewProduct(req.params.id, 'APPROVE', req.body, actorId, actorOrgId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      const statusCode = err?.statusCode || 500;
      res.status(statusCode).json({ success: false, error: { message: err?.message || 'خطا در تایید محصول' } });
    }
  }
);

/**
 * POST /api/product-ops/products/:id/reject
 * Rejects a product with reason
 */
p01ProductRouter.post(
  '/product-ops/products/:id/reject',
  authenticate,
  requirePermission('product.reject'),
  async (req: Request, res: Response) => {
    try {
      const actorId = req.user!.partyId;
      const actorOrgId = req.scopedOrgId!;
      const result = await P01ProductService.reviewProduct(req.params.id, 'REJECT', req.body, actorId, actorOrgId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      const statusCode = err?.statusCode || 500;
      res.status(statusCode).json({ success: false, error: { message: err?.message || 'خطا در رد محصول' } });
    }
  }
);

/**
 * POST /api/product-ops/products/:id/request-changes
 * Requests changes on a product with reason
 */
p01ProductRouter.post(
  '/product-ops/products/:id/request-changes',
  authenticate,
  requirePermission('product.request_changes'),
  async (req: Request, res: Response) => {
    try {
      const actorId = req.user!.partyId;
      const actorOrgId = req.scopedOrgId!;
      const result = await P01ProductService.reviewProduct(req.params.id, 'REQUEST_CHANGES', req.body, actorId, actorOrgId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      const statusCode = err?.statusCode || 500;
      res.status(statusCode).json({ success: false, error: { message: err?.message || 'خطا در درخواست اصلاحات' } });
    }
  }
);

/**
 * POST /api/product-ops/products/:id/publish
 * Publishes an approved product to Retailer Catalog
 * STRICT RULE: Supplier CANNOT directly publish; requires 'product.publish' permission!
 * Product MUST be in 'APPROVED' status before publish!
 */
p01ProductRouter.post(
  '/product-ops/products/:id/publish',
  authenticate,
  requirePermission('product.publish'),
  async (req: Request, res: Response) => {
    try {
      const actorId = req.user!.partyId;
      const actorOrgId = req.scopedOrgId!;
      const result = await P01ProductService.reviewProduct(req.params.id, 'PUBLISH', req.body, actorId, actorOrgId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      const statusCode = err?.statusCode || 500;
      res.status(statusCode).json({ success: false, error: { message: err?.message || 'خطا در انتشار محصول' } });
    }
  }
);

/**
 * POST /api/product-ops/products/:id/unpublish
 * Unpublishes / deactivates a product
 */
p01ProductRouter.post(
  '/product-ops/products/:id/unpublish',
  authenticate,
  requirePermission('product.unpublish'),
  async (req: Request, res: Response) => {
    try {
      const actorId = req.user!.partyId;
      const actorOrgId = req.scopedOrgId!;
      const result = await P01ProductService.reviewProduct(req.params.id, 'UNPUBLISH', req.body, actorId, actorOrgId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      const statusCode = err?.statusCode || 500;
      res.status(statusCode).json({ success: false, error: { message: err?.message || 'خطا در خروج محصول از انتشار' } });
    }
  }
);
