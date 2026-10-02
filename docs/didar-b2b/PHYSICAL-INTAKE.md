# PHYSICAL-INTAKE.md --- Didar B2B Physical Goods Intake

**Status:** Draft v0.3\
**Scope:** B2B --- Physical intake of supplier goods into Didar\
**Base:** Clean Mercur fork\
**Depends on:** `PRODUCT-CORE.md`\
**Reporting dependency:** `REPORTING-FOUNDATION.md`\
**Principle:** Physical inventory and UID are managed by the Didar
platform. Zarrin is not the UID/inventory source of truth.

## 1. Objective

Define the end-to-end workflow for receiving physical gold goods from a
Supplier into Didar, registering the supplied documents and declared
weights, inspecting the physical condition, generating a unique UID for
each accepted physical item, printing UID labels, assigning warehouse
location, and making accepted items available to inventory.

The implementation must preserve the project-wide rule:

`Database → Backend → API → Frontend → Test`

A Physical Intake feature is **not Done** until the complete real-data
path works.

------------------------------------------------------------------------

## 2. Core Principles

1.  Supplier goods should be pre-registered before or during physical
    delivery.
2.  Supplier data may be entered either:
    -   directly by an authorized Supplier user, or
    -   by an authorized Didar user **on behalf of that Supplier**.
3.  The commercial/business owner of the record remains the Supplier
    even when a Didar user enters the data.
4.  Didar does **not** routinely re-weigh individual pieces during
    intake.
5.  The Supplier-declared/item-label weight is preserved as the item
    weight used by the platform.
6.  XRF testing is **not part of v0.1**.
7.  Current intake inspection is a physical/visual condition check.
8.  Every accepted physical item receives a platform-generated UID.
9.  The Didar platform is the source of truth for:
    -   physical-item identity,
    -   UID,
    -   item quantity,
    -   item-level inventory state,
    -   UID label state.
10. Zarrin remains relevant to accounting/weight reconciliation, but
    does not generate or manage Didar item UIDs.
11. A Physical Intake may be triggered by stock replenishment,
    fulfillment from Supplier stock, or fulfillment of a made-to-order
    item.
12. Physical Intake must preserve its upstream business reference when
    it exists.
13. An accepted item is not always general AVAILABLE stock. Items
    received for a specific Order must be reserved/allocated to that
    Order.
14. Intake confirmation must retain both:

-   Supplier Invoice,
-   Zarrin Invoice Confirmation.

15. Supplier packaging weight structures are optional and must support
    different levels of detail without blocking intake.

------------------------------------------------------------------------

## 3. High-Level Workflow

``` text
Supplier / Didar on behalf of Supplier
        ↓
Pre-register Delivery / Intake
        ↓
Products / SKU / Quantity / Declared Weights
        ↓
Physical Delivery to Didar
        ↓
Warehouse Intake
        ↓
Identify Intake Reason + Upstream Reference
        ↓
Physical Condition Check
        ↓
Supplier Invoice Attached
        ↓
Zarrin Invoice Confirmation Attached
        ↓
Accept / Hold / Reject
        ↓
Generate UID for EACH accepted Physical Item
        ↓
Generate UID Label Output
        ↓
Print / Attach UID Labels
        ↓
Assign Warehouse Location
        ↓
Determine Inventory Disposition
        ↓
AVAILABLE or RESERVED / ALLOCATED TO SOURCE ORDER
```

------------------------------------------------------------------------

## 4. Supplier Pre-registration and Assisted Entry

The preferred flow is that the Supplier registers the delivery and its
product information before handing goods to Didar.

However, Supplier capability must not become an operational blocker.

Didar users with the required permission must be able to create or
complete the same intake data **on behalf of a Supplier**.

The system must distinguish:

``` text
supplier_id      = business owner / source of goods
created_by       = actual user who created the record
created_on_behalf_of_supplier = true/false
```

A record created by Didar on behalf of a Supplier must not become a
Didar-owned supplier record.

Audit history must retain who actually created and changed the record.

------------------------------------------------------------------------

## 5. Intake Reason and Upstream References

Physical Intake is one reusable intake process, but it can be triggered
by different business situations.

Supported initial intake reasons:

``` text
STOCK_REPLENISHMENT
ORDER_FULFILLMENT
MADE_TO_ORDER_FULFILLMENT
```

### 5.1 STOCK_REPLENISHMENT

The Supplier delivers goods to Didar before any specific Retailer Order
requires those exact pieces.

``` text
Supplier
   ↓
Physical Intake
   ↓
UID
   ↓
Warehouse
   ↓
AVAILABLE
```

After successful intake, accepted items may enter general sellable
inventory.

### 5.2 ORDER_FULFILLMENT

The product is available at the Supplier, but the physical piece is not
yet in Didar inventory when the Retailer Order is created.

``` text
Retailer Order
      ↓
Supplier Stock Requested / Called Off
      ↓
Supplier Delivery
      ↓
Physical Intake
      ↓
UID
      ↓
Allocate to Source Retailer Order
      ↓
RESERVED / ALLOCATED
```

The item must not enter general AVAILABLE stock before allocation to its
originating Order.

### 5.3 MADE_TO_ORDER_FULFILLMENT

The required item is not currently available at Didar or the Supplier
and must be produced.

``` text
Retailer Order
      ↓
Supply / Production Order to Supplier
      ↓
Supplier Lead Time / Expected Date
      ↓
Manufacturing
      ↓
Supplier Delivery
      ↓
Physical Intake
      ↓
UID
      ↓
Allocate to Source Retailer Order
      ↓
RESERVED / ALLOCATED
```

Physical Intake does not manage the manufacturing process itself. It
receives the completed physical item after Supplier delivery.

### 5.4 Upstream References

An Intake must be able to retain the business record that caused it.

Conceptual fields:

``` text
intake_reason

source_order_id?
source_supply_order_id?
source_production_order_id?
```

Exact relations and field names must follow the clean Mercur
implementation.

A stock replenishment intake may have no originating Retailer Order.

An Order Fulfillment or Made-to-Order Fulfillment intake must remain
traceable to the relevant originating Order and, when applicable,
Supply/Production Order.

------------------------------------------------------------------------

## 6. Intake Structure

## 6. Intake Structure

The intake model must support optional packaging hierarchy.

``` text
PHYSICAL INTAKE / DELIVERY
│
├── OUTER PACKAGE [0..N]
│   └── Declared gross/package weight
│
├── INNER PACKAGE / LOT [0..N]
│   └── Declared grouped-package weight
│
└── PHYSICAL ITEM [1..N]
    └── Supplier-declared item weight
        └── UID
```

A Physical Item may be associated with an Inner Package and/or Outer
Package when that information is supplied.

A Physical Item must also be registrable without packaging hierarchy.

------------------------------------------------------------------------

## 7. Three Weight Levels

The platform must support three independent declared-weight levels.

### 7.1 Outer Package Weight

Weight declared by the Supplier for an outer delivery package containing
multiple inner packages and/or physical items.

Example:

``` text
Outer Package A
Declared Gross Weight = 420.50 g
```

This weight may include packaging materials.

### 7.2 Inner Package / Group Weight

A Supplier may group multiple items, often of the same or related
product type, inside a separate plastic/package and provide a group
weight.

Example:

``` text
Inner Package A-1
Declared Group Weight = 110.30 g
```

### 7.3 Physical Item Weight

The declared weight of the individual physical gold item.

Example:

``` text
Physical Item
Declared Item Weight = 6.37 g
```

This item-level declared weight is the weight retained against the UID
and subsequently used by Didar operational records.

------------------------------------------------------------------------

## 8. Weight Rules

All three weight levels are optional except where business rules later
explicitly require them.

The platform must **not** assume:

``` text
Outer Package Weight = Sum(Inner Package Weights)
```

or:

``` text
Inner Package Weight = Sum(Item Weights)
```

because package/plastic/label weight may be included at higher levels.

Therefore v0.1 must not reject an intake merely because declared package
weights do not mathematically equal the sum of item weights.

The platform may calculate comparison/difference values for reporting,
but these are informational unless a later specification introduces
tolerance or reconciliation rules.

No automatic re-weighing requirement is introduced in v0.1.

------------------------------------------------------------------------

## 9. Physical Inspection

Current intake inspection is visual/physical only.

The operator verifies, as applicable:

``` text
Item physically received
Packaging condition
Item condition
Visible damage
Supplier label present/readable
Declared item identity reasonably matches delivery record
```

XRF is explicitly out of scope for v0.1.

Possible item inspection outcomes:

``` text
ACCEPTED
HOLD
REJECTED
```

Conceptual flow:

``` text
PASS / ACCEPTED ─────→ Continue UID + inventory intake

MISMATCH / HOLD ─────→ Exception / Review Queue

REJECTED ────────────→ Return / Supplier resolution workflow
```

Detailed return-to-supplier rules may be specified separately.

------------------------------------------------------------------------

## 10. Intake Documents

A confirmed intake must retain its accounting/supporting documents.

Required document categories:

``` text
SUPPLIER_INVOICE
ZARRIN_INVOICE_CONFIRMATION
```

Minimum conceptual fields:

``` text
supplier_invoice_number?
supplier_invoice_file

zarrin_invoice_reference?
zarrin_confirmation_file
```

The actual document storage mechanism must follow the clean
Mercur/Medusa implementation architecture.

The documents must remain traceable to the Intake record.

------------------------------------------------------------------------

## 11. Physical Item Model

Each accepted physical piece becomes a distinct Physical Item.

Conceptual minimum fields:

``` text
physical_item_id
uid

intake_id
supplier_id

product_id
sku_id?
supplier_offer_id?

outer_package_id?
inner_package_id?

supplier_declared_weight

physical_condition
inspection_status

warehouse_location_id?
inventory_status
allocated_order_id?

uid_label_status

created_at
updated_at
```

Exact field names and Medusa/Mercur relations must be determined during
implementation against the clean fork.

------------------------------------------------------------------------

## 12. UID Generation

Every accepted physical item must receive exactly one active Didar UID.

Conceptual relationship:

``` text
Product / SKU
      ↓
Supplier Offer
      ↓
Physical Item
      ↓
Didar UID
```

Example:

``` text
1 Product / SKU
10 accepted physical pieces
        ↓
10 Physical Item records
        ↓
10 unique UIDs
```

UID generation is performed by the Didar platform.

Zarrin does not generate the UID.

UID must remain uniquely traceable back to:

``` text
Physical Item
Intake
Supplier
Product / SKU
Supplier Offer (when applicable)
Declared Item Weight
Inventory State
```

------------------------------------------------------------------------

## 13. UID Label Printing

Generating a UID in the database is not sufficient.

The system must provide printable output so warehouse operators can
physically attach a UID label to each item.

Required conceptual flow:

``` text
Physical Item Accepted
        ↓
Generate UID
        ↓
Generate Label Payload
        ↓
Print Queue
        ↓
UID Label Printer
        ↓
Physical UID Label
        ↓
Attach to Item
        ↓
LABELLED
```

The system must support:

``` text
Single UID print
Selected UID batch print
Full intake batch print
Controlled reprint
```

Minimum label state:

``` text
NOT_PRINTED
PRINTED
REPRINTED
```

Reprints must be auditable.

A reprint must not create a new Physical Item or a new UID unless an
explicitly authorized replacement-UID workflow is introduced later.

Exact label dimensions, printer protocol, barcode/QR format and printed
fields are defined separately in `UID-LABEL.md`.

------------------------------------------------------------------------

## 14. Warehouse Location and Inventory Disposition

After an accepted item has received its UID and required label handling,
it can be assigned to a warehouse location.

Conceptual state flow:

``` text
RECEIVED
   ↓
INSPECTED
   ↓
ACCEPTED
   ↓
UID_GENERATED
   ↓
LABELLED
   ↓
LOCATION_ASSIGNED
   ↓
INVENTORY DISPOSITION
   ├── AVAILABLE
   └── RESERVED / ALLOCATED
```

Disposition depends on the Intake Reason:

``` text
STOCK_REPLENISHMENT
→ AVAILABLE

ORDER_FULFILLMENT
→ RESERVED / ALLOCATED TO SOURCE ORDER

MADE_TO_ORDER_FULFILLMENT
→ RESERVED / ALLOCATED TO SOURCE ORDER
```

Items received for a specific originating Order must not temporarily
become unrestricted general stock.

Items in `HOLD` or `REJECTED` state must not become sellable inventory.

The exact warehouse hierarchy (warehouse / zone / shelf / bin etc.) will
be defined in a separate warehouse specification if required.

------------------------------------------------------------------------

## 15. Quantity and Weight Relationship with Zarrin

Didar manages item-level quantity and UID identity.

Zarrin is used for accounting/weight-level records and reconciliation.

The intended business principle is:

``` text
Didar Intake Declared Weight
        ↕
Zarrin Accounting Intake Weight

Didar Sale Item Weight
        ↕
Zarrin Accounting Sale Weight
```

The platform must preserve sufficient source data to allow later
reconciliation between Didar and Zarrin.

Automated Zarrin integration and reconciliation logic are **not
implemented by this document**.

------------------------------------------------------------------------

## 16. Reporting & Analytics Requirements

`PHYSICAL-INTAKE` must comply with `REPORTING-FOUNDATION.md`.

Physical Intake must be fully reportable by design. The platform must
preserve structured operational data so future reports, dashboards,
exports and a dedicated analytical warehouse can be introduced without
redesigning the intake model.

### 16.1 Required reporting dimensions

Where applicable, Intake, Package and Physical Item records must
preserve structured relationships for:

``` text
intake
intake_reason
supplier
organization
created_by
performed_by
received_by

product
category
subcategory
sku
supplier_offer

outer_package
inner_package

physical_item
uid

source_order
source_supply_order
source_production_order

warehouse
warehouse_location

inspection_status
inventory_status
uid_label_status

supplier_invoice
zarrin_confirmation

created_at
received_at
confirmed_at
updated_at
```

Relationships must use stable identifiers and must not be stored only as
free text.

### 16.2 Required measures

The following values must remain structured and queryable where
applicable:

``` text
physical_item_quantity
supplier_declared_item_weight
outer_package_declared_weight
inner_package_declared_weight
accepted_quantity
hold_quantity
rejected_quantity
uid_count
label_print_count
label_reprint_count
```

Weight values must retain an explicit unit and weight context.

Higher-level package weights must remain analytically separate from item
weights.

### 16.3 Status and event history

Current status alone is not sufficient.

The platform must preserve enough history to reconstruct the operational
lifecycle of an Intake and Physical Item.

Relevant transitions include, where applicable:

``` text
Intake created
Delivery received
Inspection started/completed
Item ACCEPTED
Item HOLD
Item REJECTED
UID generated
Label printed
Label reprinted
Warehouse location assigned/changed
Inventory disposition set
Item AVAILABLE
Item RESERVED / ALLOCATED
Intake confirmed
```

Each reportable transition must retain the timestamp and responsible
actor.

### 16.4 Minimum derivable reports

The persisted data must support future reporting for at least:

``` text
Intakes by Supplier
Intakes by date / period
Intakes by Product / SKU
Intakes by Category / Subcategory
Intakes by Intake Reason

STOCK_REPLENISHMENT Intakes
ORDER_FULFILLMENT Intakes
MADE_TO_ORDER_FULFILLMENT Intakes

Physical item count
Accepted item count
Hold item count
Rejected item count

Declared item-weight totals
Outer-package declared weights
Inner/group-package declared weights

UIDs generated
UIDs printed
UIDs reprinted
Items with unprinted UID labels

Items by Supplier
Items by Product / SKU
Items by warehouse
Items by warehouse location

Items entering AVAILABLE stock
Items RESERVED / ALLOCATED to originating Orders

Supplier Invoice availability
Zarrin Invoice Confirmation availability
Intakes missing required documents

Intakes created by Supplier users
Intakes created by Didar users on behalf of Suppliers
Intakes/Items processed by operator

Items linked to source Orders
Items linked to Supply / Production Orders
Inventory generated from each Intake
```

### 16.5 Operational performance reporting

The data model must allow later measurement of intake operations such
as:

``` text
Intakes received per day/week/month
Items processed per day/week/month
Average intake processing time
Average time from receipt to confirmation
Average time from acceptance to UID generation
Average time from UID generation to label printing
Average time from receipt to AVAILABLE / ALLOCATED
Items currently on HOLD
Aging of HOLD items
Operator throughput
Exception / rejection rate
```

The exact KPI definitions and SLA thresholds are not defined in this
document.

### 16.6 Drill-down

Authorized reporting users must be able to trace aggregate information
to underlying operational records.

Required conceptual drill-down paths include:

``` text
Supplier
   ↓
Intake
   ↓
Package
   ↓
Physical Item
   ↓
UID
```

and, when applicable:

``` text
Retailer Order
   ↓
Supply / Production Order
   ↓
Physical Intake
   ↓
Physical Item / UID
   ↓
Warehouse Location
```

and:

``` text
Product / SKU
   ↓
Supplier Offer
   ↓
Physical Intake
   ↓
Physical Item / UID
```

### 16.7 Filtering

Structured reporting/query interfaces must be able to filter by
applicable dimensions including:

``` text
date range
supplier
intake_reason
product
category
subcategory
sku
supplier_offer
uid
inspection_status
inventory_status
uid_label_status
warehouse
warehouse_location
source_order
source_supply_order
created_by
received_by
confirmed_by
document status
```

Filters should be composable.

### 16.8 Historical integrity

Later operational changes must not destroy historical intake meaning.

Examples:

-   moving a Physical Item to another warehouse location must not erase
    its previous location event;
-   UID reprint must not erase the original print event;
-   changing a Product name must not break the Physical Item's stable
    Product/SKU relationship;
-   changing Supplier Offer values must not rewrite the original
    intake/item business context where a historical snapshot is
    required;
-   changing an Intake status must not erase previous status
    transitions;
-   replacing an attached document must retain appropriate audit
    history.

### 16.9 Reporting API / extraction

Reporting data must be obtainable through structured backend/API access.

Reporting must not depend on frontend scraping.

The first implementation may query the operational database through
controlled application APIs. The schema must remain suitable for future
extraction into a dedicated reporting database/data warehouse.

Final dashboard UI, BI tooling and final report layouts are out of scope
for this package.

------------------------------------------------------------------------

## 17. Audit Requirements

At minimum, the system must retain auditable events for:

``` text
Intake created
Intake edited
Created/edited on behalf of Supplier
Documents attached/replaced
Physical inspection result
Item accepted
Item held
Item rejected
UID generated
UID label printed
UID label reprinted
Warehouse location assigned/changed
Inventory status changed
Intake confirmed
```

Each auditable event should retain, where applicable:

``` text
user
organization
timestamp
action
target record
previous value / new value
source/context
on_behalf_of
reason?
metadata?
```

Audit history must be append-oriented and must not be silently
overwritten by later edits.

Exact audit implementation will follow the clean Mercur architecture.

------------------------------------------------------------------------

## 18. API Capability

The final endpoint names must follow the clean Mercur/Medusa
conventions.

The implementation must nevertheless support real backend capabilities
for:

``` text
Create Intake
Update Intake
Get Intake
List Intakes

Add / update Outer Package
Add / update Inner Package

Add Physical Items
Inspect Physical Items
Accept / Hold / Reject Physical Items

Attach Supplier Invoice
Attach Zarrin Invoice Confirmation

Generate UID
Generate UIDs in batch

Request UID label print
Request batch label print
Request controlled reprint

Assign warehouse location

Confirm Intake

Set Intake Reason
Link Intake to originating Order / Supply Order when applicable
Set inventory disposition
Allocate received item to source Order when required

Query Intakes by reporting dimensions
Query Physical Items by reporting dimensions
Retrieve status/event history
Retrieve audit history
Retrieve UID print/reprint history
```

Frontend must consume these real APIs.

Mock-only implementation does not satisfy Definition of Done.

------------------------------------------------------------------------

## 19. Frontend Minimum

The first implementation must provide enough UI to execute the real
workflow.

Minimum screens/areas:

``` text
Intake List
Create / Edit Intake
Supplier selection
Product / SKU item entry
Optional package hierarchy entry
Document attachments
Physical inspection
Physical Item list
UID generation
UID label print actions
Warehouse location assignment
Intake detail / status
```

The UI must clearly show whether data was entered by the Supplier or by
Didar on behalf of the Supplier.

------------------------------------------------------------------------

## 20. Definition of Done

`PHYSICAL-INTAKE` is Done only when all applicable items below pass
using real persisted data:

``` text
[ ] Intake can be created for a Supplier
[ ] STOCK_REPLENISHMENT intake works
[ ] ORDER_FULFILLMENT intake works
[ ] MADE_TO_ORDER_FULFILLMENT intake works
[ ] Intake can retain originating Order reference
[ ] Intake can retain Supply/Production Order reference when applicable
[ ] Authorized Didar user can create Intake on behalf of Supplier
[ ] Actual creator is auditable
[ ] Product / SKU can be associated with intake items
[ ] Multiple physical items can be registered
[ ] Outer Package is optional and works
[ ] Inner Package is optional and works
[ ] Item-only intake works without package hierarchy
[ ] Three declared-weight levels can be stored independently
[ ] No false equality requirement exists between package and item weights
[ ] Physical inspection result can be recorded
[ ] ACCEPTED / HOLD / REJECTED are handled
[ ] Supplier Invoice can be attached
[ ] Zarrin Invoice Confirmation can be attached
[ ] Accepted Physical Item receives unique UID
[ ] Batch UID generation works
[ ] UID label payload/output is generated
[ ] Single label print works
[ ] Batch label print works
[ ] Controlled reprint works and is audited
[ ] Reprint does not create duplicate UID/item
[ ] Warehouse location can be assigned
[ ] Stock-replenishment item can reach AVAILABLE
[ ] Order-fulfillment item becomes RESERVED / ALLOCATED to its source Order
[ ] Made-to-order item becomes RESERVED / ALLOCATED to its source Order
[ ] Order-specific item cannot become unrestricted general stock before allocation
[ ] HOLD item cannot become AVAILABLE
[ ] REJECTED item cannot become AVAILABLE
[ ] Intake and item data survive backend restart
[ ] Required reporting data is queryable
[ ] Backend API works with real database data
[ ] Frontend uses real API
[ ] Backend build succeeds
[ ] Frontend build succeeds
[ ] End-to-end intake test passes
[ ] Reporting dimensions are persisted with stable IDs
[ ] Required weight/quantity measures are structured and queryable
[ ] Intake and Physical Item status/event history is queryable
[ ] Audit events preserve actor and organization context
[ ] On-behalf-of Supplier activity is reportable
[ ] UID print/reprint history is reportable
[ ] Warehouse-location changes preserve historical traceability
[ ] Intake → Package → Physical Item → UID drill-down is queryable
[ ] Source Order / Supply Order relationships are queryable
[ ] Reporting filters can query structured Intake data through backend/API
[ ] Historical intake meaning survives later edits/status changes
[ ] Data is suitable for future export to a reporting warehouse/BI layer
```

------------------------------------------------------------------------

## 21. Explicitly Out of Scope

Do not expand this implementation into the following areas:

``` text
XRF
Automatic weighing
Weight tolerance/reconciliation rules
Automated Zarrin integration
Accounting posting
Settlement execution
Retailer Order creation/confirmation rules
Supply/Production Order workflow
Packaging fulfillment
Dispatch
Delivery
Sell-Bag custody
Sample-Bag custody
B2C
Warranty
Detailed RBAC
Advanced reporting UI
Label hardware/protocol specifics
```

These receive their own specifications.

------------------------------------------------------------------------

## 22. Clean-Fork Rule

No intake schema, UID implementation, Zarrin integration, warehouse
workaround, API, migration or frontend component from the previous Didar
repository may be copied into the clean Mercur fork by default.

Any potential reuse must follow:

``` text
Inspect
→ Compare
→ Explicitly Approve
→ Reimplement or Selectively Port
```

------------------------------------------------------------------------

## 23. Implementation Package

This document defines:

**P02 --- Physical Intake Vertical Slice**

The implementation objective is:

> A Supplier delivery can be registered directly or on behalf of the
> Supplier, its intake reason and upstream Order references can be
> preserved, its optional package hierarchy and declared weights can be
> stored, Supplier and Zarrin documents can be attached, physical items
> can be inspected, accepted items can receive platform-generated UIDs
> and printable labels, and those items can become either general
> AVAILABLE stock or RESERVED/ALLOCATED inventory for their originating
> Order through the real database, backend API and B2B frontend.

This package does not implement downstream order fulfillment or
settlement.

------------------------------------------------------------------------

## Outbound dispatch note

Inbound package-weight records are not reused as outbound package
weights.

Outbound Shipment/Package weights are separate operational observations
defined in `PACKAGING-FULFILLMENT.md` and `DISPATCH-DELIVERY.md`.

Physical Item/UID item weight remains the accepted item weight from this
Intake record and is referenced downstream without silent overwrite.
