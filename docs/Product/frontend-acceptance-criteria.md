# Didar Frontend Acceptance and Verification Standard

## 1. Per-screen definition of done

A screen is complete only when:

- Its screen ID and approved requirements are linked in code/tests.
- Positive and negative role/scope cases pass against the real backend contract.
- Loading, empty, error, denied, expired, stale and success states are implemented.
- Persian RTL and at least one LTR locale are verified.
- Mobile and desktop critical paths are verified.
- Keyboard navigation, focus, labels and announcements pass the accessibility checklist.
- No authoritative state depends on localStorage, seeded arrays or fake success fallbacks.
- Analytics and logs contain no unapproved PII or secrets.
- Mutation retry does not duplicate the business action.

## 2. Critical end-to-end journeys

### FE-J01 Public discovery

Guest searches and filters catalog, opens a product, sees only approved public facts, saves a favourite and receives a clear availability freshness indication.

### FE-J02 Guest-to-account favourites

Guest favourites merge exactly once after sign-in; duplicates are removed and inaccessible/unpublished items do not leak restricted details.

### FE-J03 Retailer onboarding

Applicant saves draft, uploads valid documents, submits for review, receives correction/approval state and cannot order until eligibility is active.

### FE-J04 Retailer request-to-order

Approved retailer submits a request, receives quotation, handles partial quantity, accepts valid terms, passes credit/reservation checks and tracks order/shipment without double allocation.

### FE-J05 Return and reversal

Retailer references original sale, submits return, sees inspection outcome, and after acceptance sees inventory, invoice and gold/cash ledger corrections reconcile once.

### FE-J06 Retailer storefront

Retailer publishes eligible products; public view excludes hidden, ineligible or unavailable items and shows availability timestamp.

### FE-J07 Nearby retailer

Consumer provides location consent or manual area, receives scoped nearby results, and denial of location permission still permits manual search.

### FE-J08 Assisted warranty activation

Authorized retailer selects verified sale/item, captures consumer consent, completes real one-time verification and creates exactly one ownership/warranty record.

### FE-J09 Consumer service

Verified consumer submits service request for an owned eligible item, sees SLA/status changes and cannot access another consumer’s case.

### FE-J10 Buyback/resale

Verified owner submits eligible item, receives assay/valuation outcome, accepts or rejects offer and sees settlement status without breaking provenance.

### FE-J11 Supplier onboarding and product review

Supplier submits legal/license data and a product draft; incomplete/unsafe files are rejected; supplier cannot self-approve; approved product appears only after K05 publication.

### FE-J12 Finance and reconciliation

Authorized retailer/supplier views scoped invoices, returns, settlements and server-calculated balances; provider failure remains visible as pending/failed rather than successful.

## 3. Security acceptance

- Anonymous calls to protected APIs are rejected.
- Each protected role has allow and deny tests across another organization/location.
- Changing client-supplied actor, role, price, owner or approval fields cannot escalate privilege.
- Session expiry and step-up are enforced server-side.
- Stored/reflected XSS payloads are safely rendered.
- File type spoofing and unauthorized file access are rejected.
- Sensitive values are absent from client bundle, URL, telemetry and error details.

## 4. Reliability acceptance

- Submit buttons prevent accidental duplicate UI submission but correctness relies on server idempotency.
- Refresh after success shows the same durable record.
- Concurrency conflict returns a recoverable UI state, not silent overwrite.
- External-provider timeout retains a traceable pending/failed operation.
- Cached data is invalidated on account/org switch and after authoritative mutation.

## 5. Accessibility and localization acceptance

- Automated accessibility checks run on representative screens, followed by keyboard/manual checks.
- Critical journeys work at 200% zoom and common mobile viewport sizes.
- Focus order follows visual/logical order in RTL and LTR.
- Dates, numbers, weights, currency and fineness are formatted by locale without changing stored values.
- Mixed-direction identifiers remain readable.
- Missing translations fail visibly in test/development rather than silently displaying arbitrary fallback text.

## 6. Test layers

- Unit: formatting, validation, reducers/state machines and permission-aware presentation helpers.
- Component: forms, filters, tables, dialogs, errors and accessibility.
- Contract: generated/validated client against approved OpenAPI schemas.
- Integration: UI with API test environment and durable database.
- E2E: FE-J01 through FE-J12 with positive/negative scope cases.
- Visual regression: representative Persian RTL and English LTR desktop/mobile views.

## 7. Release gate

Production release is blocked when any critical journey uses demo data, an unapproved endpoint, unsecured route, fake integration response, unverified balance/price, or non-durable authoritative state.
