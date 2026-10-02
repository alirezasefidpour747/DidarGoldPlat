# MASTER-B2B-FLOW.md --- Didar B2B Master Operating Flow

**Status:** Draft v0.4 --- Maison CMS architecture aligned 2026-10-02
--- CRM/Campaign/Enablement/AI architecture aligned 2026-10-02 ---
package order/taxonomy/UI aligned through 2026-10-01\
**Date:** 2026-09-30\
**Scope:** Master business and system flow for Didar B2B\
**Base:** Clean Mercur fork\
**Rule:** Previous Didar implementation is not inherited unless
explicitly approved.

## 1. Purpose

Didar B2B is a multi-vendor wholesale platform through which Retailers
discover Products, submit purchase requests or complete authorized
direct purchases, and receive physical gold goods from Didar.

``` text
SUPPLIER
   ↓
DIDAR
   ↓
RETAILER
```

The platform preserves independent Product, Supply, Order, Physical
Item, UID, Invoice, Settlement, Packaging, Shipment and Reporting
records.

The first implementation target is B2B only. B2C is a later application
that reuses approved parts of the B2B Product Core and Retailer network.

## 2. Project Development Rule

Every implemented Feature must complete the real path:

``` text
Database → Backend → API → Frontend → Test
```

Mock data may support development but does not make a Feature Done.

## 3. Organizations and Roles

Primary organization types:

``` text
DIDAR
SUPPLIER
RETAILER
```

Didar roles:

``` text
Super Admin
Product Ops
Order Ops
Warehouse Intake
Packaging
Dispatch
Agent
Finance
```

Supplier roles:

``` text
Supplier Admin
Supplier Product Operator
Supplier Accounting
```

Retailer roles:

``` text
Retailer Admin
Retailer Order / Procurement
Retailer Accounting
```

Users may hold multiple Roles where authorized. All access is
Organization-scoped and backend-enforced.

## 4. Product Core

``` text
Main Category
   ↓
Product Category
   ↓
Subcategory
   ↓
Product / SKU
   ↓
Supplier Offers
```

Retailers select Product and quantity. They do not select Supplier,
exact stock quantity, ready/unready pieces or globally selectable UIDs.

## 5. Product Publication

``` text
Supplier / Didar on behalf of Supplier
        ↓
Create Product / SKU / Offer
        ↓
Submit for Review
        ↓
Didar Product Ops
        ├── Request Changes
        ├── Reject
        └── Approve
                ↓
             Publish
                ↓
           B2B Catalog
```

Supplier cannot publish directly to the Retailer catalog.

## 6. Six Commercial Sources

``` text
DIDAR_IN_STORE
AGENT_SELL_BAG
AGENT_SAMPLE_BAG
AGENT_NO_BAG
CRM_PHONE
RETAILER_DIRECT
```

These sources do not all follow the same execution path.

## 7. Order Request Path

Used by:

``` text
AGENT_SAMPLE_BAG
AGENT_NO_BAG
CRM_PHONE
RETAILER_DIRECT
```

unless Sample-Bag direct sale is explicitly authorized.

``` text
Product + Quantity Request
        ↓
Order Ops
        ↓
Sourcing Review
        ↓
Settlement Policy Resolution
        ↓
Proforma
        ↓
Retailer Acceptance
        ↓
Confirmed Agreement
        ↓
Physical Fulfillment
```

## 8. Direct Final Sale Path

Possible for:

``` text
DIDAR_IN_STORE
AGENT_SELL_BAG
Authorized AGENT_SAMPLE_BAG
```

``` text
Known Retailer
      ↓
Eligible Physical UID
      ↓
Commercial / Settlement Policy validation
      ↓
Direct Sale
      ↓
Final Invoice
      ↓
UID sold to Retailer
```

## 9. Agent Operations

Sell-Bag supports direct sale of eligible physical UIDs.

Sample-Bag normally creates an Order on behalf of a known Retailer. A
sample UID may be directly sold only when:

``` text
sample_item_sale_mode = SALE_ALLOWED
AND Agent has direct-sale permission
AND Agent has invoice permission
```

No-Bag is Order Request only.

Sample-Bag and No-Bag preserve:

``` text
retailer_id
agent_id
created_by = Agent
on_behalf_of_retailer = true
source
```

## 10. Order Core

``` text
Retailer Request
        ↓
Order Ops
        ↓
Select Supplier(s)
        ↓
Select Sourcing Method(s)
        ↓
Determine Delivery Proposal
        ↓
Read Allowed Settlement Terms
        ↓
Issue Proforma
        ↓
Retailer Accepts
        ↓
Order Confirmed
```

Retailer never chooses Supplier.

## 11. Supply Allocation

One Order Line may be split between multiple Suppliers.

``` text
Order Line = 10 pcs
Supplier A = 6
Supplier B = 4
```

This split remains internal to Didar.

## 12. Sourcing Methods

``` text
DIDAR_STOCK
SUPPLIER_STOCK
MADE_TO_ORDER
```

Didar Stock uses an existing physical UID.

Supplier Stock requires Supply Order → Supplier Delivery → Physical
Intake → UID → Allocation.

Made to Order requires Supply Order → Supplier Ready Date → Production →
Delivery → Intake → UID → Allocation.

## 13. Commercial Snapshot

Accepted commercial terms are frozen, including Product, Quantity,
Weight/Range, Making Fee, Pricing Basis, Settlement Terms, Delivery
Terms and Shipping Policy.

Later Product or Supplier Offer changes do not rewrite history.

## 14. Settlement Policy

Order Ops does not invent Payment Terms.

``` text
Settlement Policy
        ↓
Retailer Credit Profile
        ↓
Allowed Options
        ↓
Proforma Snapshot
```

Current rules:

``` text
Base Settlement = 18K Gold
minimum_initial_settlement_percent = globally configurable
rial_payment_window_days = globally configurable
credit_sale_allowed = Retailer-level permission
```

## 15. Gold-Based Settlement and Ledger

Authoritative obligation is in grams of 18K gold.

Rial payment settles that gold obligation using the approved gold rate
at actual payment time.

``` text
Previous Balance
+ New Gold Obligations
- Settlements
± Reversals / Controlled Adjustments
= Calculated 18K Gold Balance
```

Retailer and Supplier ledgers remain separate.

## 16. Proforma and UID Allocation Gate

Proforma is versioned. If the request changes, old versions become
superseded.

Retailer request, internal Didar approval and issued Proforma do not
allocate a UID.

Allocation requires:

``` text
Valid Retailer Acceptance
Physical Item exists
UID exists
Item eligible
No conflicting allocation
Commercial terms compatible
Required Intake/release rules passed
```

## 17. Supply Order

Supply Order stores Supplier, Product, Quantity, Supplier Commercial
Snapshot, Supplier Payment Terms Snapshot, Supplier Ready Date and
Expected Didar Receipt Date.

Supplier may deliver in stages; each delivery has its own Intake and
outstanding quantity remains open until completion.

## 18. Physical Intake

Physical Intake records Supplier, Product/SKU, Quantity, Supplier
Invoice, Zarrin Invoice Confirmation, declared weights and physical
condition.

No routine individual re-weighing is required.
Supplier-declared/item-label weight is used. XRF is out of scope for the
current version.

Optional three-level weights:

``` text
Outer Package Weight
Inner Package / Group Weight
Physical Item Weight
```

## 19. UID and Label

Each accepted Physical Item receives a Didar-generated UID.

``` text
Product → Physical Item → UID
```

UID supports Single Print, Batch Print and Controlled Reprint.

## 20. Warehouse

Full Warehouse Inventory is optional/deferred in the current phase.

Version one may use simplified:

``` text
current location
current custody
inventory status
```

while staying compatible with future Shelf/Bin workflows.

## 21. Invoice & Billing

Documents are distinct:

``` text
Retailer Proforma
Retailer Final Invoice
Supplier Invoice
```

Every sold physical UID is traceable:

``` text
Invoice → Invoice Line → UID / Physical Item
```

Final Invoice may arise from accepted Standard Order, Didar In-Store
Sale, Sell-Bag Sale or authorized Sample-Bag Sale.

## 22. Packaging

``` text
Packaging Queue
      ↓
Assignment
      ↓
UID Verification
      ↓
Packaging
      ↓
Package
      ↓
Ready for Dispatch
```

Outbound weight structure supports optional Final Gross Package Weight,
optional Inner Package/Group Weight, and Physical Item Weight from
UID/Invoice.

## 23. Shipment and Tracking

``` text
1 Shipment
→ 1 Retailer
→ 1 Tracking Code
→ 1..N Invoices
→ 1..N Packages
→ N UIDs
```

Invoices from different Retailers are not mixed.

Retailer sees public tracking status, timeline, expected delivery, own
invoice references, package count and delivery method.

## 24. OTP Custody Transfer

Shipment or Bag handover to Agent/Courier/Carrier may require OTP.

``` text
Assigned Receiver
      ↓
OTP Sent
      ↓
OTP Verified
      ↓
Physical Handover
      ↓
Custody Transferred
```

OTP is resource-specific, expires, cannot be replayed and is never
stored in reportable plaintext.

## 25. Notification

Initial channels:

``` text
IN_APP
SMS
```

Notifications may cover Proforma, Order, Supply, Shipment, Settlement
and OTP events.

Notification failure never changes underlying business state.

## 26. Reporting

Every module is reporting-ready by design.

Reporting dimensions include Supplier, Retailer, Product, SKU, UID,
Agent, Order, Invoice, Supply Order, Intake, Settlement, Shipment,
Tracking, Status, Time, Actor and Organization.

Support filtering, drill-down, audit and CSV/XLSX-ready extraction.

## 27. Security

Every protected operation follows:

``` text
Authentication
      ↓
Organization Membership
      ↓
Role
      ↓
Permission
      ↓
Resource Scope
      ↓
Workflow State
      ↓
Action
```

Cross-Supplier and Cross-Retailer access is backend-blocked.

## 28. End-to-End Standard Order Flow

``` text
Supplier Product
       ↓
Product Ops Approval
       ↓
B2B Catalog
       ↓
Retailer Product Request
       ↓
Order Ops
       ↓
Supplier / Sourcing Plan
       ↓
Settlement Policy
       ↓
Proforma
       ↓
Retailer Acceptance
       ↓
Supply / Existing Stock
       ↓
Physical Intake if required
       ↓
UID
       ↓
Allocation
       ↓
Final Invoice
       ↓
Packaging
       ↓
Shipment
       ↓
Tracking Code
       ↓
OTP Custody Transfer
       ↓
Delivery
       ↓
Settlement / Ledger
```

## 29. Direct Agent Sale Flow

``` text
UID
 ↓
Sell-Bag / Authorized Sample-Bag
 ↓
Agent Custody
 ↓
Retailer
 ↓
UID Validation
 ↓
Settlement Policy
 ↓
Direct Final Invoice
 ↓
Sale Completed
```

No-Bag remains Order Request only.

## 30. Module Dependency Map

``` text
PRODUCT-CORE
      ↓
ORDER-CORE
      ├── SUPPLY-ORDER
      │       ↓
      │  PHYSICAL-INTAKE
      │
      ├── SETTLEMENT-CORE
      │
      └── INVOICE-BILLING
              ↓
       PACKAGING-FULFILLMENT
              ↓
       DISPATCH-DELIVERY
```

Cross-cutting:

``` text
B2B-RBAC
AUTH-OTP-SECURITY
REPORTING-FOUNDATION
NOTIFICATION
AGENT-OPERATIONS
```

Optional/deferred:

``` text
WAREHOUSE-INVENTORY
PACKAGING-INVENTORY where not required immediately
```

## 31. Recommended Implementation Order

``` text
P01 Product Core
P02 Order Core
P03 Supply Order
P04 Physical Intake
P05 B2B RBAC
P06 Packaging Fulfillment
P07 Dispatch / Tracking / Delivery
P08 Agent Operations
P09 Settlement Core
P10 Invoice / Billing
P11 Authentication / OTP / Security
P12 Notification

Optional / Deferred:
WAREHOUSE-INVENTORY
PACKAGING-INVENTORY
```

Actual sequencing may be adapted after inspecting native clean-Mercur
capabilities.

## 32. Master Definition of Done

Didar B2B is not implemented merely because pages exist.

The core production path must prove real persistence, backend logic,
API, frontend integration, authorization, audit, error handling, build,
integration tests and end-to-end tests.

## 33. Clean-Fork Rule

The new Didar B2B implementation begins from a clean Mercur fork.

Nothing from the old Didar implementation is automatically inherited.

Reuse follows:

``` text
Inspect
→ Compare
→ Explicitly Approve
→ Reimplement or Selectively Port
```

The old project remains reference/archive, not a dependency.

## Customer, Campaign, Enablement and AI Architecture

Didar B2B now includes a first-class relationship and sell-through
enablement layer:

``` text
                         DIDAR B2B
                            │
              ┌─────────────┴─────────────┐
              ↓                           ↓
        COMMERCE CORE                 CRM CORE
 Product/Order/Supply/UID        Customer 360
 Invoice/Settlement              Activity/Task/Visit
 Packaging/Dispatch              Chat/Relationship
              │                           │
              └─────────────┬─────────────┘
                            ↓
                     CAMPAIGN CORE
                            ↓
                  RETAILER ENABLEMENT
                            ↓
                       MY PRODUCTS
                            ↓
                   CONSUMER SIGNALS
                            ↓
                  AI SALES INTELLIGENCE
```

New tracks:

``` text
CRM01 — CUSTOMER-CRM-CORE
CRM02 — COMMUNICATION-CHAT
CRM03 — CAMPAIGN-MANAGEMENT
EN01  — RETAILER-SALES-ENABLEMENT
AI01  — AI-SALES-INTELLIGENCE
```

P01--P12 numbering remains unchanged.

AI01 is intentionally downstream of the operational data sources. AI is
not the source of truth and does not expand user permissions.

## Dependency Authority

`DEPENDENCY-MAP.md` is the authoritative cross-domain dependency
companion to this Master Flow. It distinguishes hard dependencies from
event/integration and cross-cutting dependencies to avoid circular
runtime coupling.

## Maison Content / Experience Layer

``` text
PRODUCT CORE
     ↓
CMS01 CONTENT / EXPERIENCE
     ├── Homepage
     ├── Page Builder
     ├── Journal / Articles
     ├── Media Library
     ├── Navigation
     ├── VR / External Experience
     └── Campaign Landing Pages
             ↓
       MAISON STOREFRONT
             ↓
         B2B CATALOG
```

CMS01 is a presentation/content layer and does not change P01--P12
numbering or expand P01 scope.
