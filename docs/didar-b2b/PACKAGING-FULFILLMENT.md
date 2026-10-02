# PACKAGING-FULFILLMENT.md --- Didar B2B Packaging Fulfillment

**Status:** Draft v0.2\
**Date:** 2026-09-29\
**Scope:** Packaging execution for B2B order fulfillment\
**Base:** Clean Mercur fork\
**Depends on:** `ORDER-CORE.md`, `PHYSICAL-INTAKE.md`, `B2B-RBAC.md`\
**Reporting dependency:** `REPORTING-FOUNDATION.md`\
**Implementation status:** Specification only; code and tests have not
been executed.

------------------------------------------------------------------------

## 1. Objective

Define how release-eligible physical items/UIDs move from fulfilled
Order readiness into the Didar packaging operation.

Packaging Fulfillment is the execution workflow that:

``` text
Receives packaging-ready items
        ↓
Creates/assigns Packaging Job
        ↓
Verifies item/UID membership
        ↓
Applies required packaging materials
        ↓
Completes package
        ↓
Marks package ready for Dispatch / Handover
```

This document does not define packaging-material procurement or general
packaging-material inventory intake.

------------------------------------------------------------------------

## 2. Core Principle

Packaging is a downstream fulfillment operation.

A Packaging Job must never invent, replace or bypass:

``` text
Order
Order Line
Customer acceptance
UID allocation
Physical Item
Shipment/Handover authorization
```

Packaging only acts on items already authorized for packaging.

------------------------------------------------------------------------

## 3. Packaging Trigger

A Packaging Job may be created only when the relevant fulfillment unit
is packaging-ready.

Minimum release conditions:

``` text
Order / agreement valid
UID allocation valid
Physical items exist
No blocking HOLD / cancellation / exception
Items are in authorized custody/location
Delivery policy allows packaging of this unit
```

For default `WAIT_FOR_ALL_ITEMS`:

``` text
all required order items ready
        ↓
Packaging Job may be released
```

For explicitly authorized partial fulfillment:

``` text
authorized partial shipment group ready
        ↓
Packaging Job may be released for that shipment group only
```

Packaging readiness is not the same as shipment/dispatched status.

------------------------------------------------------------------------

## 4. Packaging Unit

Packaging must operate against an explicit packaging unit.

Initial conceptual model:

``` text
Packaging Job
   ↓
Shipment / Handover Group
   ↓
Order Items
   ↓
Physical Items / UIDs
```

A Packaging Job may contain:

``` text
1..N Order Lines
1..N Physical Items
1..N UIDs
```

One UID must not appear in two active Packaging Jobs at the same time.

------------------------------------------------------------------------

## 5. Queue Model

Packaging uses a queue-based workflow.

``` text
READY_FOR_PACKAGING
        ↓
Packaging Queue
        ↓
Assignment
        ↓
PACKAGING_IN_PROGRESS
        ↓
PACKAGED
        ↓
READY_FOR_DISPATCH
```

Suggested conceptual states:

``` text
QUEUED
ASSIGNED
IN_PROGRESS
PACKAGED
ON_HOLD
EXCEPTION
CANCELLED
```

Exact technical state names may be adapted during implementation.

------------------------------------------------------------------------

## 6. Assignment

Packaging Jobs may be assigned to an authorized `DIDAR_PACKAGING` user.

Conceptual fields:

``` text
packaging_job_id
assigned_to_user_id?
assigned_at?
assigned_by?
assignment_status
```

Version one may support manual assignment.

Future rules may add:

``` text
auto assignment
round robin
workload balancing
location-based assignment
priority-based assignment
```

These are not required in v0.1 unless separately approved.

Reassignment must be auditable.

------------------------------------------------------------------------

## 7. Input Validation Before Packaging

The Packaging Operator must verify the job contents before packaging.

At minimum:

``` text
Packaging Job reference
Order reference
Shipment/Handover reference
Expected UID list
Actual UID list
Item count
Packaging instructions
Delivery method/context
```

The operator must not manually substitute a different UID without an
authorized upstream allocation change.

If mismatch exists:

``` text
Expected UID ≠ Actual UID
        ↓
EXCEPTION
        ↓
Return to authorized resolution
```

Packaging must not silently repair allocation errors.

------------------------------------------------------------------------

## 8. UID Scanning / Confirmation

Packaging should support confirmation of physical items by UID.

Preferred operational behavior:

``` text
Open Packaging Job
      ↓
Scan / select expected UID
      ↓
Validate against job membership
      ↓
Mark item verified
```

For each UID:

``` text
expected
verified
missing
unexpected
blocked
```

Unexpected or duplicated UID must fail backend validation.

The exact barcode/QR scanner mechanism is implementation-specific.

------------------------------------------------------------------------

## 9. Packaging Materials

Packaging fulfillment may consume packaging materials such as:

``` text
box
bag
pouch
warranty card
care card
label
seal
protective material
other approved inserts
```

This MD does not define how these materials enter Didar inventory.

A separate `PACKAGING-INVENTORY.md` may define:

``` text
material intake
stock balance
reorder
supplier
cost
warehouse location
```

Packaging Fulfillment only records the materials consumed/used when
required.

Conceptual fields:

``` text
material_type
material_sku?
quantity_used
batch/reference?
```

------------------------------------------------------------------------

## 10. Outbound Packaging Weight Structure

Packaging must support three distinct outbound weight levels:

``` text
OUTER SHIPMENT PACKAGE
│
├── Final gross package weight?
│
├── INNER PACKAGE / GROUP [0..N]
│   └── Group/package weight?
│
└── PHYSICAL ITEM / UID
    └── Item weight from Physical Item / invoice data
```

The final gross package weight and inner/group package weights are
optional.

Item weight comes from the accepted Physical Item/UID and corresponding
invoice line and must not be silently overwritten.

The system must not assume gross/package weights equal the sum of item
weights because packaging material adds weight.

If a weight check is not performed, record that explicitly rather than
inventing a value.

## 10A. Packaging Rules / Instructions

A Packaging Job may carry structured packaging instructions.

Examples:

``` text
default Didar packaging
special product packaging
fragile handling
gift packaging
multiple items in one package
separate item packaging
retailer-specific insert
```

Free-text notes may exist, but critical packaging choices should use
structured codes where possible for reporting.

------------------------------------------------------------------------

## 11. One Order vs Multiple Packages

One Order may result in one or more physical packages.

Example:

``` text
Order #10025

Package A
→ UID-001
→ UID-002

Package B
→ UID-003
```

Therefore:

``` text
Order ≠ Package
Shipment ≠ necessarily one Package
```

A Shipment may contain one or multiple Packages depending on dispatch
rules.

Packaging data must remain explicit.

------------------------------------------------------------------------

## 12. Partial Fulfillment Interaction

Default:

``` text
WAIT_FOR_ALL_ITEMS
```

So packaging normally begins after the whole agreed shipment set is
ready.

If partial fulfillment is explicitly authorized:

``` text
Shipment Group #1
→ Packaging Job #1

Shipment Group #2
→ Packaging Job #2
```

Each separate shipment may generate separate shipping cost according to
`ORDER-CORE.md`.

Packaging must not itself decide to split an order.

------------------------------------------------------------------------

## 13. Local Collection / Agent Handover

Not every packaged unit necessarily goes to courier dispatch.

Possible downstream paths:

``` text
Courier / carrier dispatch
Retailer pickup from Didar
Agent handover
Internal controlled transfer
```

Packaging completes the package and records readiness.

The downstream handover method belongs to `DISPATCH-DELIVERY.md`.

------------------------------------------------------------------------

## 14. Packaging Completion

A Packaging Job may be completed only when all required checks pass.

Minimum completion conditions:

``` text
All expected UIDs verified
No unexpected UID
Required packaging materials applied
Required documents/inserts included
Package count recorded
Package identity/reference created
No unresolved exception
Operator confirms completion
```

Completion produces:

``` text
package_id / package_reference
packaged_at
packaged_by
package_count
included_uids
materials_used
packaging_status = PACKAGED
```

Then:

``` text
READY_FOR_DISPATCH
```

or the applicable handover-ready state.

------------------------------------------------------------------------

## 15. Package Identity

Each completed physical package should receive a unique package
reference.

Conceptual relationship:

``` text
package_id
package_reference
tracking_code?
packaging_job_id
shipment_id?
order_id
retailer_id
included_uids[]
linked_invoice_ids[]
package_sequence
final_gross_weight?
weight_check_status
status
```

`package_reference` identifies the physical package/container.

`tracking_code` identifies the outward Shipment journey. One Shipment
may contain multiple physical Packages.

A package must remain linked to the invoices carried by its Shipment and
to the exact UIDs physically inside it.

A Package Reference is not a replacement for Product UID.

UID identifies the physical gold item.

Package Reference identifies the packaging container/group.

------------------------------------------------------------------------

### Invoice and Invoice-Line linkage

A Shipment may carry one or several invoices for the same Retailer:

``` text
Shipment
├── Invoice A
├── Invoice B
└── Invoice C
```

Each UID must remain traceable to its exact Invoice Line:

``` text
Package
   ↓
UID
   ↓
Invoice Line
   ↓
Invoice
```

Packaging must reject a manifest containing an unrelated invoice,
another Retailer's invoice, or a UID outside the authorized
shipment/order set.

## 16. Repackaging

Repackaging may be required because of:

``` text
damaged package
wrong packaging material
inspection failure
delivery-method change
authorized regrouping
```

Repackaging must:

``` text
preserve original event history
record reason
record actor
record previous package reference
create/update controlled replacement package record
```

Do not silently overwrite completed packaging history.

------------------------------------------------------------------------

## 17. Cancellation / Release Back

If an Order/Shipment is cancelled before dispatch and the package can be
safely reversed:

``` text
PACKAGED
   ↓
Controlled release / unpack
   ↓
UIDs returned to appropriate fulfillment state
```

This must be authorized and audited.

Packaging itself must not decide commercial cancellation.

If shipment has already left authorized custody, normal return/reversal
workflows apply instead.

------------------------------------------------------------------------

## 18. Exceptions

Initial exception categories may include:

``` text
UID_MISSING
UID_UNEXPECTED
UID_DUPLICATE
ITEM_DAMAGED
PACKAGE_MATERIAL_MISSING
DOCUMENT_MISSING
ORDER_CANCELLED
SHIPMENT_CHANGED
LOCATION_MISMATCH
OTHER
```

Exception handling must preserve:

``` text
exception_type
reason
reported_by
reported_at
status
resolved_by?
resolved_at?
resolution?
```

------------------------------------------------------------------------

## 19. Packaging Operator UI

Minimum Packaging UI:

``` text
Packaging Queue
My Assigned Jobs
Packaging Job Detail
Expected UID List
UID Scan / Verify
Packaging Instructions
Materials Used
Exception Action
Complete Packaging
Package History
```

The Packaging Operator should not need unrestricted access to:

``` text
Supplier commercial terms
Retailer settlement terms
Internal Supplier selection
Product approval
Accounting
```

Only operationally necessary information should be projected.

------------------------------------------------------------------------

## 20. Didar Order Ops / Supervisory Visibility

Authorized Order Ops or Super Admin may:

``` text
View packaging readiness
View queued/assigned jobs
View packaging completion
View packaging exceptions
Request controlled rework/repackaging
```

They must not silently modify completed package contents without
creating auditable operational changes.

------------------------------------------------------------------------

## 21. Reporting & Analytics Requirements

`PACKAGING-FULFILLMENT` must comply with `REPORTING-FOUNDATION.md`.

### 21.1 Reporting dimensions

Preserve where applicable:

``` text
packaging_job
package
order
order_line
invoice
invoice_line
shipment
tracking_code
handover
retailer
uid
physical_item
product
sku
warehouse/location
assigned_operator
packaged_by
status
exception_type
packaging_material
delivery_method
created_at
assigned_at
started_at
packaged_at
```

### 21.2 Measures

Preserve structured measures such as:

``` text
job_count
package_count
item_count
uid_count
material_quantity_used
final_gross_weight
inner_package_weight
item_weight
processing_duration
queue_wait_duration
repack_count
exception_count
```

### 21.3 Minimum derivable reports

Support future reporting for at least:

``` text
Packaging Jobs by date
Packaging Jobs by operator
Packaging Jobs by status
Queued vs assigned jobs
Completed jobs
Packaging throughput
Average packaging time
Queue aging
Jobs on hold
Exceptions by type
Repackaging count
Packages by Order
Packages by Shipment
Shipments by Invoice
Invoices per Shipment
UIDs by Invoice Line
Items/UIDs per Package
Final/inner package weights
Packaging materials consumption
Jobs awaiting Dispatch
```

### 21.4 Drill-down

Support:

``` text
Order
  ↓
Shipment / Handover
  ↓
Packaging Job
  ↓
Package
  ↓
UID
  ↓
Physical Item
```

### 21.5 Historical integrity

Later repackaging, reassignment or shipment changes must not erase
original packaging events.

------------------------------------------------------------------------

## 22. Audit Requirements

Audit at minimum:

``` text
Packaging Job created
Job assigned
Job reassigned
Packaging started
UID verified
Unexpected UID rejected
Exception created
Exception resolved
Packaging completed
Package reference created
Repackaging started/completed
Package released/cancelled
Materials recorded
```

Retain:

``` text
actor
organization
timestamp
action
target
before
after
reason?
```

------------------------------------------------------------------------

## 23. API Capability

Final route names must follow the clean Mercur/Medusa implementation.

Required backend capability:

``` text
Create Packaging Job
List Packaging Queue
Assign Packaging Job
Reassign Packaging Job
Read Packaging Job
Start Packaging

Read expected UID membership
Verify UID
Reject unexpected UID

Record packaging materials used
Record instructions/checks
Create exception
Resolve exception

Complete Packaging Job
Create Package reference
List Packages
Read Package

Controlled Repackaging
Controlled Release/Unpack

Query reporting dimensions
Read event/audit history
```

Frontend must use real persisted APIs.

------------------------------------------------------------------------

## 24. Definition of Done

`PACKAGING-FULFILLMENT` is Done only when:

``` text
[ ] Packaging Job can be created only from packaging-ready fulfillment
[ ] Default WAIT_FOR_ALL_ITEMS is respected
[ ] Authorized partial shipment creates only its own Packaging Job
[ ] Packaging Queue works
[ ] Assignment/reassignment works and is audited
[ ] Expected UID list comes from real allocations
[ ] UID verification works
[ ] Unexpected UID is rejected
[ ] Duplicate UID cannot be packaged twice
[ ] Package identity/reference is created
[ ] Optional final gross package weight can be recorded
[ ] Optional inner package/group weights can be recorded
[ ] Item weights remain sourced from Physical Item/Invoice data
[ ] Shipment can link to 1..N invoices for the same Retailer
[ ] Every packed UID is traceable to its Invoice Line
[ ] Multiple Packages per Order are supported
[ ] Packaging materials used can be recorded
[ ] Exceptions can be raised/resolved
[ ] Completion requires all mandatory checks
[ ] Completed package becomes ready for Dispatch/Handover
[ ] Repackaging preserves history
[ ] Controlled release/unpack preserves history
[ ] Packaging Operator access is RBAC-scoped
[ ] Reporting dimensions are persisted
[ ] Status/event history is queryable
[ ] Audit history is queryable
[ ] Backend API uses real data
[ ] Frontend uses real API
[ ] Backend build succeeds
[ ] Frontend build succeeds
[ ] End-to-end packaging test passes
```

------------------------------------------------------------------------

## 25. Explicitly Out of Scope

Do not expand this MD into:

``` text
Packaging material procurement
Packaging material intake
Packaging supplier settlement
Final packaging material inventory model
Carrier integration
Shipping-rate calculation
Courier tracking
Proof of delivery
Commercial Order cancellation
Retailer settlement
Warranty activation
B2C packaging
Advanced automatic assignment
Robotic/automated packaging
```

These receive separate specifications.

------------------------------------------------------------------------

## 26. Clean-Fork Rule

No packaging workflow, UI, API or workaround from the previous Didar
project is automatically inherited.

Reuse must follow:

``` text
Inspect
→ Compare
→ Explicitly Approve
→ Reimplement or Selectively Port
```

------------------------------------------------------------------------

## 27. Implementation Package

This document defines:

**P05 --- Packaging Fulfillment Vertical Slice**

Suggested first implementation:

``` text
Order / Shipment ready
      ↓
Create Packaging Job
      ↓
Assign Operator
      ↓
Verify real UIDs
      ↓
Record packaging materials
      ↓
Complete Package
      ↓
READY_FOR_DISPATCH
      ↓
Test
```

The package is complete only when the real Database → Backend → API →
Frontend → Test path passes.
