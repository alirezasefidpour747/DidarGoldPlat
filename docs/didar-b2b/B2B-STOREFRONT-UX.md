# B2B-STOREFRONT-UX.md --- Didar Retailer Storefront & My Didar

**Status:** Draft v0.3 --- Retailer Enablement/Chat aligned 2026-10-02
--- taxonomy aligned 2026-10-01 **Scope:** Retailer-facing B2B
storefront and authenticated workspace. **Depends on:**
`UI-FOUNDATION.md`, Product, Order, Invoice, Settlement, Dispatch, RBAC,
Auth and Notification specifications.

## 1. Objective

Transform the Mercur storefront into Didar B2B Retailer UX while reusing
compatible native components.

Two areas:

``` text
Catalog / Product Discovery
My Didar / Authenticated Retailer Workspace
```

## 2. Retailer information boundary

Retailer may browse approved Products but cannot see/select:

``` text
Supplier identity as sourcing choice
Supplier split
exact Didar/Supplier stock count
ready-piece list
global UID inventory
internal Supplier Offer/procurement terms
```

API must enforce this.

## 3. Catalog hierarchy

``` text
Main Category → Product Category → Subcategory → Product Listing → Product Detail
```

All routes are localized and directly refreshable.

## 4. Product Listing

Show:

``` text
image
name
public code
category/subcategory
permitted weight presentation
permitted making-fee presentation
request CTA
```

## 5. Filters

Initial real filters where supported:

``` text
Main Category
Product Category
Subcategory
Weight Range
Making Fee Range
approved Product attributes/type
```

Potential sort:

``` text
Newest
Name
Weight
Making Fee
```

Do not provide Supplier, exact-stock or UID filters.

Each filter must have real API/query/index mapping.

## 6. Search

Search approved public fields such as Product name/code and category
terms.

## 7. Product Detail

``` text
Images
Name/code
Category/Subcategory
Description/specifications
Weight / Weight Range
Making Fee / approved representation
Quantity/request input
Add to Request
```

Do not imply guaranteed physical allocation before the Order contract
permits it.

## 8. Request Basket

Mercur Cart may be adapted only if semantics are safe.

Standard B2B basket means:

``` text
Product + Quantity + requested specification?
```

not allocated physical stock.

No Supplier or UID selection.

## 9. Submit Request

``` text
Basket → Review → Retailer context → Submit → Real Order reference → Order Ops
```

## 10. Public Order statuses

Use business-friendly states such as:

``` text
Submitted
Under Review
Proposal Ready
Awaiting Your Acceptance
Confirmed
Being Prepared
Ready for Shipment
Shipped
Delivered
Cancelled
```

Do not expose internal sourcing details.

## 11. Proforma

Retailer can view current version, commercial terms, Settlement Terms
and delivery terms; accept only the current valid version. Superseded
versions remain historical and non-acceptable.

## 12. My Didar navigation

``` text
Dashboard
Orders
Proformas
Invoices
Shipments / Tracking
Settlement / Account
Reports
Profile / Organization
Notifications
```

Navigation is permission-driven.

## 13. Dashboard

Real API cards may include:

``` text
Open Orders
Proformas Awaiting Action
Orders Being Prepared
Shipments In Transit
Outstanding 18K Gold Balance
Upcoming Settlement
Action-required Notifications
```

## 14. Orders

Filters:

``` text
date
status
order number
product
```

Detail:

``` text
reference
requested products
public status
current Proforma
invoice links
shipment links
settlement summary
timeline
```

## 15. Invoices

Show own:

``` text
Invoice number/date
Order reference
Invoice Lines
Product
actual item weight
UID where policy permits
18K gold obligation
Settlement Terms snapshot/status
Shipment link
```

## 16. Settlement / Account

Authorized roles see:

``` text
Calculated 18K Gold Balance
Open obligations
Settlement components
Gold/Rial settlements
payment-time rate snapshots
due/overdue
statements
```

No editable balance.

## 17. Shipment / Tracking

Search/open own Tracking Code and show:

``` text
public status
timeline
expected/actual delivery
linked invoice references
package count
delivery method
```

Hide OTP/private carrier data/internal security metadata.

## 18. Reports

Initial:

``` text
Orders
Invoices
Settlement history
Account statement
Shipments
Purchased products
```

Exports obey RBAC.

## 19. Retailer roles

`Retailer Admin`: broad own-org view. `Retailer Order/Procurement`:
Catalog, Requests, Orders, Proformas, Shipments; acceptance only if
permission granted. `Retailer Accounting`: Invoices, Settlement,
Statements, financial reports.

## 20. Notifications

Notification Center surfaces Proforma, Order, Shipment, Settlement and
required-action events.

## 21. Mobile

Critical mobile flows:

``` text
browse/search/filter
product detail
request
proforma review/accept
orders
invoice
tracking
settlement
```

## 22. API contract requirement

Before modifying a Mercur screen, create a page mapping:

``` text
Page/Component
Current Mercur source
Didar business requirement
Required API
Fields
Actions
Permissions
Gap
Implementation decision
```

## 23. Definition of Done

``` text
[ ] Retailer-safe Product API used
[ ] Internal Supplier/stock leakage blocked
[ ] Main Category/Product Category/Subcategory hierarchy works
[ ] Search/real filters work
[ ] Product detail works
[ ] Request Basket uses correct semantics
[ ] Order persists
[ ] My Orders works
[ ] Proforma version/acceptance works
[ ] Invoice works
[ ] Settlement/Ledger view works
[ ] Tracking works
[ ] Role navigation works
[ ] 4 languages + RTL/LTR work
[ ] Responsive matrix passes
[ ] Direct refresh works
[ ] E2E Retailer journey passes
```

## My Products / Retailer Enablement

Add to My Didar:

``` text
My Products
├── Saved Products
├── Collections
├── Shared Pages
├── Consumer Engagement
└── Leads / Demand Signals
```

Behavior follows `RETAILER-SALES-ENABLEMENT.md`.

## Messages

Add a Retailer Messages/Conversations area using
`COMMUNICATION-CHAT.md`.

Retailer sees only its own organization Conversations and authorized
Product/Order references.

## Campaign Participation

Retailer may receive Campaign-related Product
suggestions/tasks/Collections where defined. Retailer controls
publication of its consumer-facing Collection.

## Retailer Copilot

Future AI may suggest Products to present/add to My Products and
summarize permitted demand signals. It cannot expose another Retailer or
internal Supplier information.

## Dependency Coverage

My Didar consumes `COMMUNICATION-CHAT.md` and
`RETAILER-SALES-ENABLEMENT.md`, and may expose Retailer-facing Campaign
participation from `CAMPAIGN-MANAGEMENT.md` and Retailer Copilot
capabilities from `AI-SALES-INTELLIGENCE.md`.

These additions do not change P01 Product Core scope.

## Maison / CMS Rendering

The Storefront consumes `CONTENT-EXPERIENCE-CMS.md`.
Homepage/editorial/landing pages are CMS-managed rather than hard-coded.

CMS composition may include Hero Image/Video, editorial content,
Journal, VR/External Experience, CTA and Product/Category Blocks above
or alongside the B2B Catalog.

Product Blocks always resolve through retailer-safe Product Core APIs.
CMS never exposes Supplier/internal inventory data. Renderer supports
Published versions, secure Draft Preview, four languages and responsive
block composition.
