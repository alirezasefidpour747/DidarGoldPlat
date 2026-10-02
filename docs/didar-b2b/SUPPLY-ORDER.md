# SUPPLY-ORDER.md --- Didar B2B Supplier Supply Order

**Status:** Draft v0.1\
**Date:** 2026-09-29\
**Scope:** Didar → Supplier sourcing commitment, supplier
commercial/payment terms, delivery tracking and intake linkage\
**Base:** Clean Mercur fork\
**Depends on:** `ORDER-CORE.md` v0.1, `PRODUCT-CORE.md` v0.3,
`PHYSICAL-INTAKE.md` v0.4\
**Reporting dependency:** `REPORTING-FOUNDATION.md` v0.1\
**Implementation status:** Specification only; code and tests have not
been executed.

------------------------------------------------------------------------

## 1. Objective

Define the Supplier-facing supply commitment created by Didar when a
confirmed Retailer Order requires sourcing from a Supplier.

A `Supply Order` is the business record between:

``` text
Didar ↔ Supplier
```

It is separate from the Retailer commercial agreement:

``` text
Retailer ↔ Didar
```

The two relationships may have different commercial terms, payment
terms, timing and sourcing logic.

------------------------------------------------------------------------

## 2. Core Rule

A Supply Order must not be treated as the Retailer Order.

Conceptually:

``` text
Retailer Order
      ↓
Accepted Proforma
      ↓
Didar Supply Allocation
      ↓
Supply Order
      ↓
Supplier
```

The Retailer selects Product and quantity.

The Retailer does **not** select Supplier.

Didar Order Ops chooses the Supplier and may split one Retailer Order
Line across multiple Suppliers.

------------------------------------------------------------------------

## 3. When a Supply Order is Created

A binding Supplier commitment is created only after:

``` text
Retailer Proforma Accepted
        ↓
Didar sourcing decision authorized
        ↓
Supplier selected
        ↓
Supplier commercial/payment terms agreed
        ↓
Supply Order confirmed
```

Before Retailer acceptance, Didar may obtain:

``` text
Availability
Lead time
Ready date estimate
Commercial quote
Payment terms proposal
```

but such inquiry/quotation activity is not yet a binding Supply Order
unless explicitly approved through a later exception policy.

------------------------------------------------------------------------

## 4. Applicable Sourcing Paths

A Supply Order is primarily required for:

``` text
SUPPLIER_STOCK
MADE_TO_ORDER
```

### 4.1 Supplier Stock

The Supplier has or expects to have the product available.

``` text
Retailer Order confirmed
        ↓
Didar Supply Order
        ↓
Supplier prepares available goods
        ↓
Supplier delivery
        ↓
Physical Intake
```

### 4.2 Made to Order

The Supplier must manufacture or prepare a new item.

``` text
Retailer Order confirmed
        ↓
Didar Supply Order
        ↓
Supplier confirms ready date
        ↓
Manufacturing / preparation
        ↓
Supplier delivery
        ↓
Physical Intake
```

### 4.3 Didar Stock

If the required Physical Item already exists in Didar inventory with a
valid UID and can be allocated directly, no new Supply Order is required
for that item.

------------------------------------------------------------------------

## 5. Relationship to Retailer Order

A Supply Order must remain traceable to the originating demand.

Conceptual relationships:

``` text
supply_order_id
source_order_id
source_order_line_id
supply_allocation_id
supplier_id
supplier_offer_id?
```

One Retailer Order Line may create:

``` text
0..N Supply Orders
```

Example:

``` text
Retailer Order Line = 10 pcs

Supplier A Supply Order = 6 pcs
Supplier B Supply Order = 4 pcs
```

The Retailer still sees one agreed Product line unless a later
customer-facing rule explicitly requires otherwise.

------------------------------------------------------------------------

## 6. Minimal Supply Order Record

Conceptual minimum fields:

``` text
supply_order_id
reference_number

supplier_id
supplier_organization_id

source_order_id
source_order_line_id
supply_allocation_id

product_id
sku_id?
supplier_offer_id?

ordered_quantity
received_quantity
outstanding_quantity

sourcing_method

supplier_commercial_snapshot
supplier_payment_terms_snapshot

supplier_ready_date
expected_didar_receipt_date

status

created_at
created_by
confirmed_at?
confirmed_by?

cancelled_at?
cancelled_by?
cancellation_reason?
```

Exact schema must be mapped to the clean Mercur/Medusa implementation.

------------------------------------------------------------------------

## 7. Supplier Commercial Snapshot

The Supplier commercial agreement must be frozen when the Supply Order
is confirmed.

At minimum, snapshot the applicable values:

``` text
product / sku identity
supplier product reference?
ordered quantity
weight basis
quoted/expected weight or range
supplier making-fee type/value/range
supplier commercial basis
agreed supply terms
lead time
ready date
other agreed conditions
```

Later changes to the Supplier Offer must not rewrite the historical
Supply Order.

Example:

``` text
Supply Order confirmed:
Supplier making fee = 11%

Later Supplier Offer:
Supplier making fee = 13%

Historical Supply Order remains:
11%
```

------------------------------------------------------------------------

## 8. Supplier Payment Terms

Supplier Payment Terms are part of the Supply Order agreement.

Recording Payment Terms does **not** mean payment has been executed.

Minimum conceptual terms:

``` text
payment_method_code
settlement_basis
due_terms
due_date_basis?
payment_schedule?
currency_or_gold_basis?
agreed_payment_terms_snapshot
```

The exact financial enums, formulas and execution workflow are defined
later.

The Supply Order must preserve the agreed Supplier-side payment terms
even if the Retailer-side settlement terms are different.

Example:

``` text
Retailer ↔ Didar:
Settlement = cash / agreed customer terms

Didar ↔ Supplier:
Settlement = gold / deferred / mixed / agreed supplier terms
```

These are independent agreements.

------------------------------------------------------------------------

## 9. Supplier Ready Date vs Didar Receipt Date

The platform must store at least two distinct dates:

``` text
supplier_ready_date
expected_didar_receipt_date
```

### Supplier Ready Date

The date the Supplier commits that the goods will be ready at the
Supplier side.

### Expected Didar Receipt Date

The date Didar expects the goods to physically arrive at Didar.

These dates must not be treated as the same event.

Future reporting must be able to distinguish:

``` text
Supplier production/preparation delay
Transit delay
Actual Didar receipt delay
```

Actual receipt is confirmed through `PHYSICAL-INTAKE.md`.

------------------------------------------------------------------------

## 10. Supply Order Lifecycle

Suggested initial lifecycle:

``` text
DRAFT
  ↓
AWAITING_SUPPLIER_CONFIRMATION
  ↓
CONFIRMED
  ↓
IN_PROGRESS
  ↓
PARTIALLY_RECEIVED
  ↓
COMPLETED
```

Controlled alternative states may include:

``` text
ON_HOLD
CANCELLED
EXCEPTION
```

Exact technical state names may be adapted to the clean implementation,
but the business meanings must remain distinct.

------------------------------------------------------------------------

## 11. Supplier Confirmation

Before the Supply Order becomes operationally confirmed, the Supplier
must confirm the agreed supply commitment.

At minimum, Supplier confirmation should cover:

``` text
Product / SKU
Quantity
Commercial terms
Payment terms
Supplier ready date
Other agreed conditions
```

The approved confirmation mechanism may be:

``` text
Supplier portal
Didar user on behalf of Supplier
Other approved assisted process
```

If a Didar user confirms on behalf of the Supplier, the platform must
retain:

``` text
supplier organization
actual Didar actor
on_behalf_of = true
confirmation evidence/reference
timestamp
```

------------------------------------------------------------------------

## 12. Partial Supplier Delivery

Partial Supplier delivery is allowed.

Example:

``` text
Supply Order = 10 pcs

Delivery / Intake #1 = 6 pcs
Outstanding = 4 pcs

Delivery / Intake #2 = 3 pcs
Outstanding = 1 pc

Delivery / Intake #3 = 1 pc
Outstanding = 0

Supply Order → COMPLETED
```

Each physical delivery creates or links to its own `PHYSICAL INTAKE`.

A partial Supplier delivery does **not** automatically authorize partial
shipment to the Retailer.

Retailer delivery policy remains governed by `ORDER-CORE.md`.

Default Retailer behavior remains:

``` text
WAIT_FOR_ALL_ITEMS
```

unless a partial shipment has been explicitly authorized.

------------------------------------------------------------------------

## 13. Link to Physical Intake

Every Supplier delivery that physically arrives at Didar must pass
through `PHYSICAL-INTAKE.md`.

Conceptual relationship:

``` text
Supply Order
   ↓
Supplier Delivery
   ↓
Physical Intake
   ↓
Accepted Physical Items
   ↓
UID generation
   ↓
Order allocation gate
```

The Intake must retain:

``` text
source_supply_order_id
source_order_id
source_order_line_id
```

where applicable.

Received quantity on the Supply Order must be derived from valid linked
Intake results rather than manually pretending goods were received.

------------------------------------------------------------------------

## 14. Quantity Rules

The Supply Order must preserve:

``` text
ordered_quantity
received_quantity
outstanding_quantity
cancelled_quantity?
```

Business invariant:

``` text
ordered_quantity
=
received_quantity
+ outstanding_quantity
+ cancelled_quantity
```

where cancelled quantity is applicable.

A linked Intake must not increase received quantity beyond the active
Supply Order commitment without controlled exception handling.

------------------------------------------------------------------------

## 15. Supplier Changes

Didar may change Supplier before commitment.

After Supplier commitment, any Supplier replacement must be controlled.

Conceptual rule:

``` text
Before Supplier commitment
→ Supplier change allowed

After Supplier commitment
→ No silent replacement
→ Record reason
→ Resolve/cancel prior commitment
→ Create/update replacement sourcing record
→ Preserve history
```

A Supplier change must never silently alter the Retailer's already
accepted commercial terms.

------------------------------------------------------------------------

## 16. Cancellation

Supply Order cancellation is not the same as Retailer Order
cancellation.

A Supply Order may be cancelled only through a controlled process.

If manufacturing has started, goods are ready, shipment has begun, or
irreversible Supplier obligations exist, the system must not pretend
cancellation has no consequences.

At minimum preserve:

``` text
cancelled_at
cancelled_by
cancellation_reason
supplier_commitment_state
related_replacement_supply_order?
```

Detailed Supplier cancellation charges, returns and settlement effects
are outside this MD.

------------------------------------------------------------------------

## 17. Supplier Portal / UI Minimum

The Supplier-facing surface should allow permitted users to:

``` text
View assigned Supply Orders
View Product / quantity requested
View agreed commercial terms
View agreed payment terms
Confirm Supply Order
Confirm / update Supplier ready date
View outstanding quantity
View linked delivery/intake status
View completed / open Supply Orders
```

Supplier users must not see:

``` text
Other Suppliers' Supply Orders
Internal Didar sourcing comparisons
Retailer-sensitive data not required for fulfillment
Other Suppliers' commercial terms
```

------------------------------------------------------------------------

## 18. Didar Order Ops / Procurement UI Minimum

Authorized Didar users should be able to:

``` text
Create Supply Order from Supply Allocation
Select Supplier
Split quantity across Suppliers
Set/agree Supplier commercial terms
Set/agree Supplier payment terms
Set Supplier ready date
Set expected Didar receipt date
Confirm Supplier commitment
Track outstanding quantity
Track linked Intakes
Replace Supplier before commitment
Perform controlled post-commitment changes
Cancel when permitted
View exceptions
```

------------------------------------------------------------------------

## 19. Reporting & Analytics Requirements

`SUPPLY-ORDER` must comply with `REPORTING-FOUNDATION.md`.

### 19.1 Reporting dimensions

Preserve where applicable:

``` text
supply_order
supplier
supplier_organization
product
category
subcategory
sku
supplier_offer
source_order
source_order_line
supply_allocation
sourcing_method
status
supplier_ready_date
expected_didar_receipt_date
actual_receipt_date
created_by
confirmed_by
intake
physical_item
uid
```

### 19.2 Measures

Preserve structured values for:

``` text
ordered_quantity
received_quantity
outstanding_quantity
cancelled_quantity
supplier making fee
supplier quoted weight/range
supplier payment basis
supplier lead time
delay duration
```

### 19.3 Minimum derivable reports

The data must support at least:

``` text
Open Supply Orders by Supplier
Supply Orders by Product / SKU
Supply Orders by Retailer Order
Supply Orders by sourcing method
Supply Orders by status

Ordered quantity by Supplier
Received quantity by Supplier
Outstanding quantity by Supplier
Partially received Supply Orders

Supplier ready-date performance
Expected vs actual Didar receipt
Supplier delay
Transit delay

Supplier commercial terms history
Supplier payment terms by Supply Order

Supply Orders awaiting Supplier confirmation
Supply Orders on hold / exception
Cancelled Supply Orders
Replacement Supplier activity

Retailer Orders waiting on Supplier Supply Orders
Intakes linked to Supply Orders
UIDs originating from Supply Orders
```

### 19.4 Status/event history

Retain at least:

``` text
Supply Order created
Supplier selected
Commercial terms agreed
Payment terms agreed
Supplier confirmation
Ready date set/changed
Expected receipt date set/changed
Supplier commitment
Partial receipt
Full receipt
Status change
Supplier replacement
Cancellation
Completion
```

Each event must retain actor, organization, timestamp and reason where
relevant.

### 19.5 Drill-down

Support:

``` text
Retailer Order
   ↓
Order Line
   ↓
Supply Allocation
   ↓
Supply Order
   ↓
Supplier
   ↓
Physical Intake
   ↓
Physical Item / UID
```

### 19.6 Historical integrity

Later changes to Supplier Offer, Product, Supplier profile or payment
defaults must not rewrite historical Supply Order snapshots.

------------------------------------------------------------------------

## 20. Audit Requirements

Audit at minimum:

``` text
Supply Order created
Supplier selected
Supplier changed
Supplier confirmation recorded
Commercial terms changed before confirmation
Payment terms changed before confirmation
Supply Order confirmed
Ready date changed
Expected receipt date changed
Partial delivery linked
Receipt quantity changed through valid Intake
Supply Order put on hold
Supply Order cancelled
Replacement Supply Order linked
Supply Order completed
```

Retain:

``` text
user
organization
timestamp
action
target
before
after
reason?
on_behalf_of?
evidence/reference?
```

------------------------------------------------------------------------

## 21. API Capability

Final endpoint names must follow the clean Mercur/Medusa architecture.

Required real backend capability:

``` text
Create Supply Order
Read Supply Order
List Supply Orders
Update Draft Supply Order

Select/change Supplier before commitment
Split quantity across Suppliers
Set commercial terms
Set payment terms
Set Supplier ready date
Set expected Didar receipt date

Confirm Supplier commitment
Record assisted confirmation with audit evidence

Link Physical Intake
Recalculate received/outstanding quantity
Handle partial receipt

Controlled Supplier replacement
Controlled cancellation
Complete Supply Order

Query by reporting dimensions
Retrieve event/audit history
```

Frontend must consume real APIs.

Mock-only flows do not satisfy Definition of Done.

------------------------------------------------------------------------

## 22. Definition of Done

`SUPPLY-ORDER` is Done only when:

``` text
[ ] Supply Order is distinct from Retailer Order
[ ] Supply Order can reference Retailer Order Line / Supply Allocation
[ ] Supplier is selected by Didar, not Retailer
[ ] One Retailer Order Line can create multiple Supply Orders
[ ] Supplier commercial terms are snapshotted
[ ] Supplier payment terms are snapshotted
[ ] Retailer settlement terms remain independent
[ ] Supplier ready date is stored
[ ] Expected Didar receipt date is stored separately
[ ] Supplier confirmation is auditable
[ ] Didar-assisted Supplier confirmation preserves actual actor
[ ] SUPPLIER_STOCK path works
[ ] MADE_TO_ORDER path works
[ ] Partial Supplier delivery is supported
[ ] Each delivery links to Physical Intake
[ ] Received quantity derives from valid Intake
[ ] Outstanding quantity remains correct
[ ] Partial Supplier delivery does not auto-create Retailer partial shipment
[ ] Supplier replacement before commitment works
[ ] Post-commitment replacement is controlled and audited
[ ] Historical Supplier terms do not change after live Supplier Offer changes
[ ] Cancellation preserves history and commitments
[ ] Reporting dimensions are persisted
[ ] Event/status history is queryable
[ ] Audit history is queryable
[ ] Backend API uses real persisted data
[ ] Frontend uses real API
[ ] Backend build succeeds
[ ] Frontend build succeeds
[ ] End-to-end Supplier sourcing test passes
```

------------------------------------------------------------------------

## 23. Explicitly Out of Scope

Do not expand this MD into:

``` text
Retailer Order acceptance
Retailer pricing formula
Retailer settlement execution
Supplier payment execution
Supplier settlement execution
Accounting posting
Automatic Zarrin posting
Physical Intake internals
UID generation internals
Warehouse picking
Packaging
Dispatch
Retailer partial-shipment approval
Returns
Supplier penalties
Advanced procurement optimization
AI Supplier selection
```

These receive separate specifications.

------------------------------------------------------------------------

## 24. Clean-Fork Rule

No Supply Order, procurement, payment, supplier-confirmation or sourcing
implementation from the previous Didar repository is automatically
inherited.

Reuse must follow:

``` text
Inspect
→ Compare
→ Explicitly Approve
→ Reimplement or Selectively Port
```

------------------------------------------------------------------------

## 25. Implementation Package

This document defines:

**P03 --- Supplier Supply Order Vertical Slice**

Suggested first implementation path:

``` text
Accepted Retailer Order
        ↓
Create Supply Allocation
        ↓
Create Supply Order
        ↓
Select Supplier
        ↓
Freeze Supplier commercial/payment terms
        ↓
Supplier confirms
        ↓
Partial or full Supplier delivery
        ↓
Physical Intake
        ↓
Received/outstanding quantity updated
        ↓
Test
```

The package is not complete until the real database, backend API and
frontend all use the same persisted business records.
