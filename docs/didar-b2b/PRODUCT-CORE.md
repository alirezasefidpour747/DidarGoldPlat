# PRODUCT-CORE.md --- Didar B2B Product Core

**Status:** Draft v0.3 --- taxonomy/UI aligned through 2026-10-01\
**Scope:** B2B only\
**Base:** Clean Mercur fork\
**Principle:** No code from the previous Didar implementation.\
**Reporting dependency:** `REPORTING-FOUNDATION.md`

## 1. Objective

Build the first real end-to-end vertical slice of Didar B2B:

`Database → Backend → API → Frontend → Test`

A Product feature is **not Done** until this complete path works with
real persisted data.

## 2. Core hierarchy

``` text
Category
└── Subcategory
    └── Product / SKU
        └── Supplier Offers
```

**Product** represents the common product identity.\
**Supplier Offer** represents the commercial offer of a particular
supplier for that Product.

Supplier-specific weight, making fee and commercial terms must not be
duplicated into the common Product definition.

## 3. Category

``` text
id
name
slug
description?
image?
status
sort_order
created_at
updated_at
```

## 4. Subcategory

``` text
id
category_id
name
slug
description?
image?
status
sort_order
created_at
updated_at
```

## 5. Product

``` text
id
subcategory_id
name
slug
product_code
description?
technical_description?
primary_image?
gallery[]
karat
material
status
created_at
updated_at
created_by
updated_by
```

Initial gold-specific fields are `karat` and `material`. Do not add
every conceivable jewelry attribute at this stage.

## 6. SKU decision

For v0.1, do not prematurely create a second complex SKU hierarchy.
Treat the sellable Product model as the product/SKU level unless clean
Mercur requires a Medusa Variant underneath it.

If required:

``` text
Didar Product
    ↓
Medusa Product
    ↓
Variant
```

Verify this against the exact clean Mercur version before
implementation.

## 7. Supplier Offer

One Product can have N Supplier Offers.

``` text
id
product_id
supplier_id
supplier_product_code?
weight_type
weight_min?
weight_max?
exact_weight?
making_fee_type
making_fee_value?
making_fee_min?
making_fee_max?
availability_type
lead_time_days?
status
created_at
updated_at
```

Weight:

``` text
EXACT
RANGE
```

Making fee model:

``` text
PERCENT
RANGE_PERCENT
FIXED   # future only
```

For P01 only `PERCENT` and `RANGE_PERCENT` are active. `FIXED`
creation/activation must be rejected until its unit and calculation
basis are explicitly defined. Do not assume Rial, Toman, gold grams or
per-piece basis.

## 8. Availability

``` text
AVAILABLE
MADE_TO_ORDER
UNAVAILABLE
```

UID-level physical inventory is out of scope for this MD.

**Product definition ≠ physical gold piece.**

## 9. Supplier relationship

A Supplier Offer belongs to exactly one Supplier and one Product. A
Product may have multiple Supplier Offers.

``` text
Product A
 ├── Offer — Supplier 1
 ├── Offer — Supplier 2
 └── Offer — Supplier 3
```

## 10. B2B Product API contract

Minimum required API capability:

``` text
GET /products
GET /products/:id
```

Product Detail must expose Product, Category, Subcategory, Images, Gold
attributes and Supplier Offers.

Conceptual response:

``` json
{
  "id": "...",
  "name": "...",
  "product_code": "...",
  "category": {},
  "subcategory": {},
  "karat": 18,
  "material": "gold",
  "images": [],
  "supplier_offers": [
    {
      "supplier_id": "...",
      "weight": {"type": "RANGE", "min": 5.5, "max": 8},
      "making_fee": {"type": "RANGE_PERCENT", "min": 12, "max": 16},
      "availability": "AVAILABLE"
    }
  ]
}
```

This is a conceptual contract, not yet the final Medusa endpoint/schema.
Adapt it to Mercur rather than blindly replacing existing commerce APIs.

## 11. Frontend rule

Frontend components must consume the real Product API contract.

Required P01 screens/workspaces:

``` text
Retailer Category Navigation
Retailer Product List
Retailer Product Detail
Supplier Product / Offer Entry
Product Ops Review Queue
Product Ops Review Detail
Product Ops Categories / Taxonomy Management
Didar on-behalf-of Supplier Product / Offer Entry
```

Implementation sequence:

``` text
Model
→ Migration
→ Seed
→ Backend Service
→ API
→ Verify API response
→ Product Card
→ Product List
→ Product Detail
→ End-to-End Test
```

Do not design the whole frontend first and try to fit the backend later.

## 12. Seed data

Minimum:

``` text
2 Categories
3 Subcategories
5 Products
3 Suppliers
multiple Supplier Offers
```

At least one Product must have two suppliers with different weight and
making-fee conditions.

## 13. Reporting & Analytics Requirements

`PRODUCT-CORE` must comply with `REPORTING-FOUNDATION.md`.

The Product domain must be reportable by design. Reporting must not
depend on scraping frontend screens or interpreting translated labels.

### 13.1 Required reporting dimensions

Where applicable, Product and Supplier Offer records must preserve
structured relationships for:

``` text
product
product_code
category
subcategory
supplier
supplier_offer
status
created_by
updated_by
created_at
updated_at
```

Stable machine-readable identifiers must be used for status and other
coded values.

### 13.2 Product lifecycle and status history

Current status alone is not sufficient once Product review/publishing
workflow is implemented.

The platform must be capable of retaining Product lifecycle transitions
such as:

``` text
DRAFT
SUBMITTED
CHANGES_REQUESTED
APPROVED
REJECTED
PUBLISHED
INACTIVE
```

The exact lifecycle is finalized in the relevant workflow specification,
but Product Core must not be designed in a way that prevents
status-history reporting.

For each reportable transition, retain where applicable:

``` text
from_status
to_status
changed_at
changed_by
reason?
```

### 13.3 Required audit events

The Product domain must support auditability for at least:

``` text
Product created
Product edited
Product status changed
Supplier Offer created
Supplier Offer edited
Supplier Offer activated/inactivated
Product submitted for review
Changes requested
Product approved
Product rejected
Product published
Product unpublished/inactivated
```

Workflow-specific events become mandatory when those workflows are
implemented.

Audit history must preserve the actual actor and organization and must
not be silently overwritten by later edits.

### 13.4 Minimum derivable reports

The persisted Product data must allow future reporting for at least:

``` text
Products by Main Category
Products by Product Category
Products by Subcategory
Products by Supplier
Products by status
Active / Inactive Products
Products awaiting review
Approved / Rejected / Published Products
Product creation trend
Product update trend

Supplier Offers by Product
Supplier Offers by Supplier
Products with multiple Suppliers
Number of Suppliers per Product

Weight type by Supplier Offer
Weight ranges by Supplier Offer
Making-fee type by Supplier Offer
Making-fee values/ranges by Supplier Offer
Availability by Supplier Offer

Products created by user
Products edited by user
Product lifecycle/status changes by user
```

### 13.5 Drill-down relationships

Reporting must be able to drill through the structured relationships:

``` text
Main Category
   ↓
Product Category
   ↓
Subcategory
   ↓
Product
   ↓
Supplier Offer
   ↓
Supplier
```

When Physical Intake and downstream modules are implemented, Product/SKU
identifiers must remain stable so later reporting can extend to:

``` text
Product / SKU
   ↓
Physical Item / UID
   ↓
Order
```

### 13.6 Historical business meaning

Later changes to a Product or Supplier Offer must not destroy the
historical meaning of downstream transactions.

For example:

-   changing a Supplier Offer making fee must not rewrite the fee
    associated with an already confirmed historical Order;
-   deactivating a Product must not remove historical references;
-   changing a Product display name must not break stable Product
    identity;
-   changing Supplier relationships must not make historical reporting
    ambiguous.

Downstream transactional modules must snapshot business values where
required by their own specifications.

### 13.7 Reporting API / extraction

Product and Supplier Offer data required for reporting must be
obtainable through structured backend/API access.

The implementation must support query/filter capability sufficient for a
future reporting layer to filter by applicable dimensions such as:

``` text
category
subcategory
supplier
product
supplier_offer
status
created_at / date range
created_by
updated_by
```

Final reporting dashboards are not required by this Product Core
package.

The requirement is that Product Core is **reporting-ready by design**.

------------------------------------------------------------------------

## 14. Definition of Done

``` text
[ ] Clean Mercur fork runs
[ ] Product schema implemented
[ ] Supplier Offer implemented
[ ] Migration succeeds
[ ] Seed succeeds
[ ] Data persists in database
[ ] Product List API works
[ ] Product Detail API works
[ ] Multiple suppliers return correctly
[ ] Product List renders from real API
[ ] Product Detail renders from real API
[ ] Refresh works
[ ] Backend restart preserves data
[ ] Frontend build succeeds
[ ] Backend build succeeds
[ ] End-to-end test passes
[ ] Product reporting dimensions are persisted
[ ] Product/Supplier Offer actor traceability is persisted
[ ] Product/Supplier Offer audit events are queryable
[ ] Status-history design supports lifecycle reporting
[ ] Product → Supplier Offer → Supplier drill-down relationships are queryable
[ ] Reporting filters can query structured Product data through backend/API
[ ] Historical Product identity is preserved after later edits/inactivation
```

Mock data does not satisfy API/data acceptance.

## 15. Explicitly out of scope

``` text
RBAC
B2C
Gold settlement
Checkout
Cart
Payment
Warranty
UID
Warehouse
Physical-piece inventory
Agent journeys
CRM
Zarrin
Sepidar
Retailer storefront
Location services
```

## 16. Clean-fork rule

No schema, migration, API, frontend component or workaround from the
previous Didar repository may be copied by default.

``` text
Inspect
→ Compare
→ Explicitly approve
→ Reimplement or selectively port
```

## 17. Next implementation package

**P01 --- Product Core Vertical Slice**

Goal:

> A Didar gold product with multiple supplier offers can be persisted in
> the clean Mercur database, returned correctly through the real backend
> API, and rendered by the real B2B frontend.

Once P01 is green, freeze its contract and move to `B2B-RBAC.md`.
