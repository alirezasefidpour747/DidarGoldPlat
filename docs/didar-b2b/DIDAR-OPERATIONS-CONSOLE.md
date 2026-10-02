# DIDAR-OPERATIONS-CONSOLE.md --- Didar B2B Operations Console

**Status:** Draft v0.3 --- CRM/Campaign/AI aligned 2026-10-02 ---
Product taxonomy/on-behalf-of aligned 2026-10-01 **Scope:** Internal
Didar role-driven operations/admin workspace. **Depends on:**
`UI-FOUNDATION.md`, `B2B-RBAC.md` and every implemented domain MD.

## 1. Objective

Transform/extend Mercur Admin into Didar's operational workspace. It is
not a generic ecommerce admin.

Primary workspaces:

``` text
Super Admin
Product Ops
Order Ops
Warehouse Intake
Packaging
Dispatch
Agent Operations
Finance
```

## 2. UX model

``` text
Role → Navigation → Queue → Resource Detail → Allowed Action → Audit
```

Navigation is convenience; backend permissions remain authority.

## 3. Common shell

``` text
role-aware navigation
authorized global search
notifications
user/org context
language
profile/logout
```

Authorized search may cover Order, Proforma, Invoice, UID, Tracking
Code, Supplier, Retailer and Supply Order.

## 4. Super Admin

Navigation may include:

``` text
Dashboard
Orders
Products
Suppliers
Retailers
Supply Orders
Intake
UID
Packaging
Dispatch
Agents
Invoices
Settlement
Reports
Users & Roles
Settings
```

Super Admin still cannot violate core business invariants.

## 5. Product Ops

``` text
Dashboard
Product Review Queue
Products
Categories
Supplier Offers
Product Exceptions
Product Reports
```

Product Review detail:

``` text
Supplier/Product context
images/specifications
weight/making-fee data
status history
Approve
Reject
Request Changes
Publish/Unpublish where authorized
```

## 5.1 Product Taxonomy Management

`Didar Operations Console → Product Ops → Categories` is the shared
taxonomy-governance workspace.

Authorized Product Ops / Super Admin users can:

``` text
view hierarchy/tree
create Main Category
create Product Category
create Subcategory
edit taxonomy fields
change rank/order
activate/deactivate
inspect ancestry and Product usage
```

Suppliers cannot mutate the shared taxonomy. Used nodes are not
physically deleted; controlled deactivation is the historical-safe
default.

## 5.2 Didar Entry on Behalf of Supplier

Authorized Didar Product Ops users can create/edit a Product and its
Supplier Offer on behalf of a selected Supplier.

Persist separately:

``` text
actual_actor = DIDAR user
business_owner = selected SUPPLIER
on_behalf_of = true
```

This flow uses the same Product/Offer identities and review/publication
rules as Supplier-originated entry.

## 6. Order Ops

``` text
Order Queue
Orders
Proformas
Supply Planning
Supply Orders
Order Exceptions
Order Reports
```

Order detail should combine:

``` text
Retailer request
commercial snapshot
Settlement Policy-authorized options
supply allocations
supplier plans
proforma history
acceptance
UID allocation status
invoice/shipment links
timeline
```

Order Ops cannot invent unsupported Settlement Terms.

## 7. Supply Planning

UI supports:

``` text
select Supplier
split quantity across Suppliers
SUPPLIER_STOCK / MADE_TO_ORDER
Supplier commercial/payment snapshot
ready date
expected Didar receipt date
outstanding quantity
linked Intakes
```

Retailer never sees this internal workspace.

## 8. Warehouse Intake

``` text
Intake Queue
New Intake
Physical Intakes
Documents
UID Generation
UID Labels
Intake Exceptions
Intake Reports
```

Intake detail supports:

``` text
Supplier
Supply Order
Supplier Invoice
Zarrin Confirmation
outer/inner/item declared weights
physical inspection
accept/hold/reject
UID generation
label print/reprint
simplified location/status
```

Full WMS Shelf/Bin is not mandatory in current phase.

## 9. Packaging

``` text
Packaging Queue
My Jobs
Package Detail
UID Verification
Packaging Materials
Exceptions
Completed Packages
```

Show only operationally needed commercial information.

## 10. Dispatch

``` text
Dispatch Queue
Shipments
Tracking
OTP Handover
Delivery Exceptions
Returns/Reverse Custody status
```

Shipment detail:

``` text
Tracking Code
Retailer
1..N Invoices
1..N Packages
Invoice Line ↔ UID manifest
outbound weight manifest
assigned Agent/Courier
OTP handover status
custody timeline
public/internal status
```

## 11. Agent Operations

``` text
Agents
Retailer Assignments
Agent Permissions
Agent Limits
Sell-Bags
Sample-Bags
Bag Issue/Return
Direct Sales
Agent Orders
Exceptions
Reports
```

Sample items expose `DISPLAY_ONLY` / `SALE_ALLOWED`. Direct-sale
permission is explicit.

## 12. Finance

``` text
Dashboard
Retailer Accounts
Supplier Accounts
Invoices
Settlement Obligations
Settlement Transactions
Ledger
Credit Permissions
Settlement Policy
Reconciliation
Financial Reports
```

Finance can manage:

``` text
global initial settlement %
Rial payment window
Retailer credit permission
```

according to RBAC. Balance is calculated from Ledger, never edited
directly.

## 13. Supplier Management

Internal Supplier detail may include:

``` text
profile
users
Products/Offers
Supply Orders
Intakes
Supplier Invoices
Settlement/account
reports
audit/timeline
```

## 14. Retailer Management

Internal Retailer detail may include:

``` text
profile
users
orders
proformas
invoices
shipments
18K ledger/account
credit permission
reports
audit/timeline
```

## 15. Queue standard

Every operational queue defines:

``` text
scope
default sort
filters
columns
assignment
status
aging
exception indicator
allowed row actions
bulk actions if safe
```

Useful filters must map to real APIs.

## 16. Detail-page standard

Prefer a stable resource header plus sections/tabs:

``` text
Summary
Business Data
Related Records
Documents
Timeline
Audit where authorized
```

## 17. Exceptions

Exceptions should be first-class operational work, not hidden error
text. Each exception has:

``` text
type
resource
reason
created_at/by
owner/assignment?
status
resolution
resolved_at/by
```

## 18. Dashboard rule

No decorative KPI. Every KPI has:

``` text
definition
data source
filter scope
drill-down destination
```

## 19. Supplier Portal boundary

Supplier-facing experience is not the Didar internal Console even if
technically hosted in related code.

Supplier sees only own:

``` text
Products/Offers
Supply Orders
Supplier Invoices
Settlement/account
Reports
Users where Admin
```

No other Supplier or Retailer-sensitive sourcing data.

## 20. Agent Workspace boundary

Agent-facing workspace is scoped to own:

``` text
assigned Retailers
visits
bags/custody
orders
authorized direct sales
returns/exceptions
```

No global UID/Supplier inventory.

## 21. Language/responsive

All Console screens follow `UI-FOUNDATION.md`, including fa/en/ar/fr and
RTL/LTR. Dense operational tables must remain usable on desktop; mobile
should support critical field actions even if advanced administration is
desktop-oriented.

## 22. API/page mapping

Before editing each Mercur Admin screen, document:

``` text
Current Mercur page/component
Didar role/use case
Required data
Existing API
Missing API
Actions/permissions
Reuse / extend / replace decision
```

## 23. No admin-only business logic

Do not implement a rule only in Admin frontend. Examples:

``` text
Supplier selection permissions
credit permission
UID allocation gate
OTP handover
invoice finality
```

must be backend-enforced.

## 24. Definition of Done

``` text
[ ] Role-specific navigation works
[ ] Product Ops queue works
[ ] Order Ops queue works
[ ] Supply Planning works
[ ] Intake workspace works
[ ] Packaging queue works
[ ] Dispatch/tracking/OTP workspace works
[ ] Agent Ops works
[ ] Finance/Ledger/Policy works
[ ] Supplier/Retailer detail scopes work
[ ] Real filters/search work
[ ] Exceptions are actionable
[ ] Reporting drill-down works
[ ] 4 languages + RTL/LTR work
[ ] API authorization blocks bypass
[ ] E2E role journeys pass
```

## Customer / CRM Workspace

Add role-driven navigation:

``` text
Customers / CRM
├── Customers
├── My Customers
├── Activities
├── Tasks
├── Follow-ups
├── Visits
└── Assignments
```

Customer detail is the authorized Customer 360 defined by
`CUSTOMER-CRM-CORE.md`.

## Campaign Workspace

``` text
Campaigns
├── Campaigns
├── Audiences
├── Execution
└── Analytics
```

Campaign actions follow `CAMPAIGN-MANAGEMENT.md`.

## Communication Workspace

Authorized users access assigned/permitted Conversations from Customer
360 and optionally a Conversation queue.

## AI Insights

AI surfaces may provide Customer summaries, Conversation summaries,
next-best-action, suggested replies, Campaign analysis and management
insights.

AI does not receive unrestricted database access and cannot bypass
normal RBAC/resource scope.

## Dependency Coverage

The Operations Console is the internal UI surface for
`CUSTOMER-CRM-CORE.md`, `CAMPAIGN-MANAGEMENT.md`, CRM-linked
`COMMUNICATION-CHAT.md`, `AGENT-OPERATIONS.md` and authorized
`AI-SALES-INTELLIGENCE.md` insights.

The Console consumes domain APIs; it must not become the source of
business rules.

## Content / Experience Workspace

``` text
Content / Experience
├── Pages
├── Homepage
├── Page Builder
├── Journal
├── Articles
├── Media Library
├── Navigation
├── External Experiences
└── Publishing
```

This consumes `CONTENT-EXPERIENCE-CMS.md`. Editors and Publishers may be
separate roles. Business/publishing rules remain backend-enforced.
