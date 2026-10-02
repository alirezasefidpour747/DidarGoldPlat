# DIDAR B2B --- Latest MD Bundle

**Consolidated:** 2026-10-02 --- CMS01 added

This folder contains the latest known versions of the Didar B2B
specifications from this conversation. It consolidates later aligned
copies and the latest approved decisions.

## Latest decisions incorporated

-   P01 taxonomy is three levels before Product:
    `Main Category → Product Category → Subcategory → Product`.
-   `PRODUCT-TAXONOMY-SEED.md` is the authoritative deterministic
    initial taxonomy seed.
-   Didar Product Ops / Super Admin govern taxonomy in the Operations
    Console.
-   Suppliers select taxonomy but cannot mutate it.
-   Didar Product Ops can create/edit Product + Supplier Offer on behalf
    of a selected Supplier with explicit audit context.
-   P01 making fee supports `PERCENT` and `RANGE_PERCENT`; `FIXED` is
    future-only until unit/basis is defined.
-   Retailer public indicative terms remain separate from Supplier Offer
    terms.
-   Correct package order includes `ORDER-CORE` as P02; full Warehouse
    remains optional/deferred.
-   Clean Mercur runtime gate is owner-verified as passed locally.

## Files

-   `AGENT-OPERATIONS.md`
-   `AUTH-OTP-SECURITY.md`
-   `B2B-RBAC.md`
-   `B2B-STOREFRONT-UX.md`
-   `CLEAN-MERCUR-BASELINE.md`
-   `DIDAR-OPERATIONS-CONSOLE.md`
-   `DISPATCH-DELIVERY.md`
-   `INVOICE-BILLING.md`
-   `MASTER-B2B-FLOW.md`
-   `MD-INDEX.md`
-   `MERCUR-UI-BASELINE.md`
-   `NOTIFICATION.md`
-   `ORDER-CORE.md`
-   `P01-IMPLEMENTATION-MAP.md`
-   `PACKAGING-FULFILLMENT.md`
-   `PACKAGING-INVENTORY.md`
-   `PHYSICAL-INTAKE.md`
-   `PRODUCT-CORE.md`
-   `PRODUCT-TAXONOMY-SEED.md`
-   `REPORTING-FOUNDATION.md`
-   `SETTLEMENT-CORE.md`
-   `SUPPLY-ORDER.md`
-   `UI-FOUNDATION.md`
-   `UI-SPEC-INDEX.md`
-   `WAREHOUSE-INVENTORY.md`
-   `WORK-ADDENDUM-UI.md`

## CRM / Enablement / AI expansion

Added: - `CUSTOMER-CRM-CORE.md` - `COMMUNICATION-CHAT.md` -
`CAMPAIGN-MANAGEMENT.md` - `RETAILER-SALES-ENABLEMENT.md` -
`AI-SALES-INTELLIGENCE.md`

Updated cross-cutting specifications: - `AGENT-OPERATIONS.md` -
`B2B-RBAC.md` - `DIDAR-OPERATIONS-CONSOLE.md` - `B2B-STOREFRONT-UX.md` -
`REPORTING-FOUNDATION.md` - `NOTIFICATION.md` - `AUTH-OTP-SECURITY.md` -
`MASTER-B2B-FLOW.md` - `MD-INDEX.md`

P01--P12 numbering is intentionally unchanged.

-   `DEPENDENCY-MAP.md` --- authoritative cross-domain dependency map
    added after dependency audit.

## Maison CMS expansion

Added `CONTENT-EXPERIENCE-CMS.md` (`CMS01`) and aligned Storefront,
Operations Console, UI Foundation, RBAC, Security, Reporting, Campaign,
Dependency Map, Master Flow and Index.

P01 remains unchanged in scope.
