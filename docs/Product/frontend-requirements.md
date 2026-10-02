# Didar Frontend Product and UX Requirements

**Status:** Proposed product specification  
**Scope:** Public storefront and authenticated portals for retailer, consumer, supplier and authorized internal users  
**Reference prototype:** `docs/product/prototypes/didar-offline-hearts.html`

## 1. Purpose

The frontend is a presentation and interaction layer over secured, versioned APIs. It must never become an authoritative store for identity, catalog, inventory, pricing, ownership, accounting or workflow state.

The interactive HTML prototype defines visual direction and intended journeys only. Its demo identities, localStorage, generated records, fake OTP, fake availability and fictional financial data are not production requirements.

## 2. Required source documents

Before planning or changing frontend behavior, read:

1. `docs/architecture/prd-gap-summary-fa.md`
2. `docs/architecture/prd-to-k01-k20-traceability.md`
3. `docs/architecture/postgresql-blueprint-k01-k20.md`
4. `docs/architecture/prototype-to-k01-k20-traceability.md`, when present
5. This document
6. `docs/product/frontend-screen-inventory.md`
7. `docs/product/frontend-api-contract-map.md`
8. `docs/product/frontend-acceptance-criteria.md`

If these documents disagree, stop implementation and record an explicit product/architecture decision. Do not silently choose one interpretation.

## 3. Personas and access boundaries

### Guest

- Browse approved public catalog and collections.
- Search and filter only publicly eligible products.
- View privacy-safe product and retailer information.
- Maintain a temporary favourites list and request basket.
- Start sign-in or onboarding when an authenticated action is required.
- Never receive private inventory, commercial terms, PII or internal workflow data.

### Retailer

- Maintain an approved organization/location profile through K01/K02/K11.
- Browse eligible catalog, suppliers and availability.
- Create request baskets, request quotations, approve terms and track orders/shipments.
- View invoices, returns, settlements and gold/cash statements within organization scope.
- Activate and look up customer warranty only with verified sale, consent and one-time verification.
- Configure public storefront visibility without changing K05 catalog truth or K09 inventory truth.

### Consumer

- View own favourites, owned items, warranty cards and service history.
- Find nearby eligible retailers carrying a product.
- Submit service, repair and buyback/resale requests.
- Access only records tied to the authenticated identity and approved consent.

### Supplier / manufacturer / wholesaler

- Maintain business profile, licenses, operational contacts and product scope.
- Create and revise product drafts; submit them for approval.
- View only own agreements, products, orders, invoices, returns, settlements and statements.
- Cannot directly publish platform catalog truth or approve its own records.

### Internal users

- Internal roles such as onboarding specialist, catalog reviewer, vault operator, finance, risk, service, auditor and administrator require separate role-scoped workspaces.
- Internal screens must enforce backend authorization; hiding controls in the UI is not authorization.

## 4. Global experience requirements

### Localization and direction

- Persian is the primary language and must render in RTL.
- Arabic is RTL; English and French are LTR.
- Locale changes must update direction, numerals, date formatting, validation messages and navigation placement consistently.
- User-generated identifiers, codes, emails, phone numbers and financial references use bidi-safe rendering.
- No text may be embedded as mojibake or depend on browser charset guessing. HTML output must be UTF-8.

### Responsive behavior

- Critical journeys must work on mobile, tablet and desktop.
- Tables must provide a readable small-screen representation rather than horizontal clipping of essential actions.
- Navigation and role workspace menus must remain keyboard and touch accessible.

### Accessibility

- Target WCAG 2.2 AA.
- Every interactive control requires an accessible name, visible focus state and keyboard operation.
- Errors must be associated with fields and announced to assistive technology.
- Color alone cannot communicate state.
- Dialogs, menus and drawers must manage focus correctly.

### Required page states

Every data-backed screen must implement:

- Initial loading
- Background refresh
- Empty state
- Validation failure
- Authorization denied
- Authentication expired
- Network/offline failure
- Rate-limit or temporary provider failure
- Stale-data indication when freshness matters
- Success confirmation with durable record identifier
- Partial failure where an external operation is pending or retrying

### Navigation and session behavior

- Route access is derived from authenticated roles and organization/location scope returned by the backend.
- Deep links must preserve the intended destination after sign-in when authorized.
- Session expiry must not silently lose a completed form; sensitive drafts require an approved storage policy.
- Switching account or organization must clear scoped caches and re-evaluate permissions.

## 5. Catalog and discovery

- K05 is authoritative for product/catalog facts; MDM owns shared classifications and reference codes.
- K09 is authoritative for physical availability; K11 owns retailer eligibility; portal presentation composes these facts.
- Search supports product name, approved code/SKU, family, category, subtype, collection and eligible supplier.
- Filters must be URL-addressable and restore correctly on back/forward navigation.
- Product pages display only approved assets, classification, fineness, weight representation, provenance disclosure and availability allowed for the viewer.
- Collections and galleries are presentation compositions, not independent product masters.
- Public retailer storefronts display only published, eligible and available products.

## 6. Favourites

- A guest may save public product IDs locally using a versioned, non-sensitive format.
- After sign-in, guest favourites are merged idempotently with the server-side account list.
- Duplicate favourites are impossible.
- Removing a favourite updates all open views consistently.
- Product removal, unpublishing or access loss must not expose restricted data through a stale favourite.
- Authoritative ownership should be added to K05 as catalog engagement linked to K01 party identity, unless a product decision assigns a dedicated engagement service.

## 7. Basket, quotation and ordering

- Guest basket behavior is explicitly distinguished from an authenticated retailer request basket.
- A basket never guarantees reservation, price or credit approval.
- Submission creates an idempotent K10 request and returns a durable identifier.
- Quotation uses K13 pricing snapshots and records expiry, applicable terms and confirmed quantity.
- Acceptance triggers atomic K09 reservation and K14 credit/risk checks as required.
- The UI must handle partial fulfillment, quotation revision, expiration, rejection and cancellation.
- Order and shipment timelines must be derived from backend history, not fabricated client steps.
- Final delivery/POD status cannot be changed through presentation-only state.

## 8. Returns

- Retail sales returns require a dedicated workflow rather than a generic negative invoice.
- The workflow must identify original order/invoice/items, reason, evidence and approval state.
- Accepted return posts authoritative inventory movement in K09, invoice/tax correction in K13 and reversing ledger entries in K15; K16 handles external reconciliation.
- The UI must distinguish requested, approved, received, inspected, credited, rejected and externally pending states.

## 9. Retailer storefront and nearby availability

- K11 owns retailer organization/location commercial eligibility; K09 supplies availability; K05 supplies product facts.
- Retailer may publish or hide its public storefront and select eligible products for presentation without editing product truth.
- Nearby search requires explicit location consent or manual city/area selection.
- Exact coordinates must not be retained unless an approved privacy requirement permits it.
- Results must include availability freshness and must not promise stock when only indicative data is available.

## 10. Warranty, ownership, service and circular flows

- K17 owns ownership interests, warranty eligibility, activation and warranty-card truth.
- Retailer-assisted activation requires verified sale, consumer consent and a real single-use challenge through K03/shared notification infrastructure.
- Public lookup reveals only privacy-approved authenticity/warranty status.
- K18 owns service and repair execution; K19 owns buyback acquisition/valuation; K20 owns refurbishment, secondary processing and melt lineage.
- Service and resale requests must be idempotent and visible only to authorized parties.

## 11. Supplier experience

- K01 owns legal organization identity; K02 qualification/onboarding; K07 supplier agreements and eligibility; K05 catalog/product truth.
- Supplier forms support draft, validation, submission, correction, approval and rejection.
- License/product files use the shared object-storage service with upload status, malware scanning, checksum, content type, size and retention metadata.
- Supplier cannot approve own product, agreement, license or financial adjustment.

## 12. Finance and reporting

- K13 provides invoice and pricing facts; K15 provides gold/cash ledger facts; K16 provides settlement and reconciliation status.
- Frontend balances are read models, never client calculations of authoritative balance.
- Signed movements must display unit, basis, effective date, reference and status.
- BI charts are derived from approved analytics datasets and disclose period, refresh time and scope.
- A chart or summary must reconcile to accessible underlying records where permissions permit.

## 13. Files, notifications and integrations

- File upload, download and preview use short-lived authorized URLs; no secrets or durable private URLs in client code.
- Notifications use a shared service driven by committed domain events. UI toast messages are not proof that SMS/email/ERP operations succeeded.
- External operations expose pending, retrying, failed and reconciled states.
- Provider credentials and signing keys never enter the browser bundle.

## 14. Security and privacy

- Backend authorization is mandatory for every protected read and mutation.
- The frontend must not trust role, actor or organization identifiers supplied by arbitrary headers or editable form fields.
- Sensitive actions require current authentication and step-up where policy requires it.
- PII is minimized, masked in lists and excluded from logs/analytics unless explicitly approved.
- CSRF, XSS, unsafe HTML, open redirects, insecure file previews and token leakage must be tested.

## 15. Prohibited production behavior

- No in-memory or localStorage persistence for authoritative business state.
- No fake identity, default super-admin, arbitrary six-digit OTP or demo authentication.
- No random price, tax tracking code, invoice, ERP response or availability.
- No success state before the authoritative API confirms durable acceptance.
- No direct coupling of UI components to database implementation.
- No silent fallback from a real integration to a successful demo response.

## 16. Definition of ready for implementation

A frontend slice is ready only when:

1. Screen and journey IDs are defined.
2. Role/scope policy is approved.
3. Authoritative owner is assigned.
4. API contract and error model exist.
5. Loading/empty/error/denied/stale states are specified.
6. Acceptance tests are written.
7. Required backend persistence and security are production-capable or the feature remains behind an explicit non-production flag.
