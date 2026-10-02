# WAREHOUSE-INVENTORY.md --- Didar B2B Warehouse & UID Inventory

**Status:** Draft v0.1\
**Date:** 2026-09-29\
**Scope:** One Didar warehouse with Shelf/Bin-level physical inventory
and UID movement\
**Base:** Clean Mercur fork\
**Depends on:** `PHYSICAL-INTAKE.md`, `ORDER-CORE.md`,
`PACKAGING-FULFILLMENT.md`, `DISPATCH-DELIVERY.md`, `B2B-RBAC.md`\
**Reporting dependency:** `REPORTING-FOUNDATION.md`\
**Implementation status:** Specification only; code and tests have not
been executed.

## 1. Objective

Define the physical warehouse model for Didar B2B after accepted intake
and before packaging/dispatch.

Version one starts with:

``` text
1 Warehouse
→ N Shelves
→ N Bins
→ N Physical Items / UIDs
```

The model must remain extensible so additional warehouses can be added
later without redesigning UID identity or movement history.

## 2. Core Principle

The Didar platform is the source of truth for the current physical
location and inventory state of each UID-managed gold item.

For every Physical Item / UID, the system must answer:

``` text
Where is it?
What is its inventory status?
Who currently has custody?
Which Order is it related to, if any?
Which Bin is it in?
When did it move?
Who moved it?
Why did it move?
```

## 3. Initial Warehouse Structure

``` text
DIDAR WAREHOUSE
│
├── Shelf A
│   ├── Bin A-01
│   ├── Bin A-02
│   └── ...
├── Shelf B
│   ├── Bin B-01
│   └── ...
└── ...
```

Conceptual records:

``` text
warehouse
shelf
bin
```

Minimum fields:

``` text
warehouse_id
warehouse_code
warehouse_name
status

shelf_id
warehouse_id
shelf_code
shelf_name
status

bin_id
shelf_id
bin_code
bin_name
status
```

One active Physical Item may have only one current warehouse/bin
location at a time.

## 4. Physical Item / UID Inventory Record

``` text
physical_item_id
uid
product_id
sku_id?
supplier_id
supplier_offer_id?
current_warehouse_id
current_shelf_id?
current_bin_id?
inventory_status
custody_status
allocated_order_id?
allocated_order_line_id?
packaging_job_id?
shipment_id?
last_movement_at
updated_at
```

Stable historical relationships must remain available even after current
location changes.

## 5. Inventory Status

Initial conceptual statuses:

``` text
ORDER_PENDING_RELEASE
AVAILABLE
RESERVED
ALLOCATED
PICKED
IN_PACKAGING
PACKAGED
READY_FOR_DISPATCH
HANDED_OVER
IN_TRANSIT
DELIVERED
HOLD
REJECTED
RETURN_PENDING
RETURNED
LOST_EXCEPTION
```

Inventory status and physical location are related but not identical.

Example:

``` text
status = ALLOCATED
location = Bin A-03
```

or:

``` text
status = IN_PACKAGING
location = Packaging Area
```

## 6. Custody vs Location

Warehouse location and custody must be modeled separately.

Conceptual custody types:

``` text
DIDAR_WAREHOUSE
DIDAR_PACKAGING
DIDAR_DISPATCH
DIDAR_AGENT
COURIER
RETAILER
SUPPLIER_RETURN
OTHER_APPROVED
```

Custody changes must always be auditable.

## 7. Intake to Warehouse

After `PHYSICAL-INTAKE.md` acceptance:

``` text
Physical Item accepted
        ↓
UID generated
        ↓
Label printed/applied
        ↓
Warehouse location assigned
        ↓
Inventory disposition set
```

For stock replenishment:

``` text
→ AVAILABLE
```

For order-specific goods before customer-release gate:

``` text
→ ORDER_PENDING_RELEASE
```

For eligible order-specific goods after all release gates:

``` text
→ ALLOCATED
```

Warehouse must not override Order/Intake release rules.

## 8. Internal Movement

Every movement between physical locations must create a Movement Event.

Examples:

``` text
Bin A-01 → Bin B-03
Bin B-03 → Packaging Area
Packaging Area → Dispatch Area
```

Conceptual movement record:

``` text
movement_id
uid
from_location
to_location
from_custody
to_custody
movement_type
reason
performed_by
performed_at
reference_type?
reference_id?
```

No silent overwrite of `current_bin_id` is allowed without movement
history.

## 9. Movement Types

``` text
INTAKE_PUTAWAY
INTERNAL_TRANSFER
ORDER_RESERVATION
ORDER_ALLOCATION
PICK
MOVE_TO_PACKAGING
MOVE_TO_DISPATCH
HANDOVER_TO_AGENT
HANDOVER_TO_COURIER
RETURN_TO_WAREHOUSE
HOLD_MOVE
RELEASE_FROM_HOLD
RETURN_TO_SUPPLIER
ADJUSTMENT
```

## 10. Reservation vs Allocation

### RESERVED

A logical hold against availability.

``` text
UID exists
UID not available to competing order
physical item may still remain in same Bin
```

### ALLOCATED

The UID is explicitly assigned to a confirmed Order/Order Line.

``` text
UID
→ Order
→ Order Line
```

One UID may have at most one active customer-order allocation.

## 11. Picking

``` text
ALLOCATED
   ↓
Pick Queue
   ↓
Authorized picker
   ↓
Scan/confirm UID
   ↓
Remove from Bin
   ↓
PICKED
   ↓
Move to Packaging
```

A Pick action must verify:

``` text
UID exists
UID belongs to expected Order/Line
UID is allocated
UID is in expected Bin
UID is not already picked
No HOLD/block exists
```

Unexpected UID must fail.

## 12. Pick Queue

``` text
pick_job_id
order_id
shipment_group_id?
assigned_to?
status
created_at
started_at?
completed_at?
```

Initial states:

``` text
QUEUED
ASSIGNED
IN_PROGRESS
COMPLETED
EXCEPTION
CANCELLED
```

Version one may use manual assignment.

## 13. Cycle Count / Stock Count

``` text
Create Count Session
      ↓
Select Shelf / Bin
      ↓
Expected UID list
      ↓
Scan / confirm actual UIDs
      ↓
Compare
      ↓
MATCH / MISSING / UNEXPECTED
      ↓
Review discrepancy
      ↓
Controlled adjustment if authorized
```

Count result must not silently change inventory.

## 14. Inventory Discrepancy

``` text
UID_MISSING
UID_UNEXPECTED
WRONG_BIN
DAMAGED
LABEL_UNREADABLE
DUPLICATE_SCAN
STATUS_MISMATCH
OTHER
```

Discrepancy record:

``` text
discrepancy_id
uid?
bin_id
type
details
reported_by
reported_at
status
resolved_by?
resolved_at?
resolution?
```

## 15. Inventory Adjustment

Adjustment is a controlled exception process.

Examples:

``` text
correct wrong Bin
mark lost
restore found item
correct status after verified operational error
```

Adjustment requires:

``` text
authorized role
reason
before value
after value
actor
timestamp
audit event
```

No direct manual database-style edits from UI.

## 16. Hold

An item may be placed on HOLD because of:

``` text
physical issue
document issue
order exception
count discrepancy
commercial block
security concern
other approved reason
```

HOLD blocks:

``` text
reservation
allocation
picking
packaging
dispatch
```

unless an explicit authorized release occurs.

## 17. Return to Warehouse

``` text
External/Internal Custody
        ↓
Return initiated
        ↓
UID verified
        ↓
Physical condition check
        ↓
Return destination Bin assigned
        ↓
Inventory state resolved
```

Returning physically to warehouse does not automatically mean
`AVAILABLE`.

## 18. Warehouse Areas

Even with one physical warehouse, logical operational areas may exist:

``` text
RECEIVING
STORAGE
HOLD
PACKAGING_STAGING
DISPATCH_STAGING
RETURN_STAGING
```

Version one should remain simple while preserving these distinctions.

## 19. RBAC

Primary roles:

``` text
DIDAR_WAREHOUSE_INTAKE
DIDAR_PACKAGING
DIDAR_DISPATCH
DIDAR_ORDER_OPS
DIDAR_SUPER_ADMIN
```

Suggested permissions:

``` text
warehouse.read
warehouse.location.read
warehouse.location.assign
inventory.read
inventory.move
inventory.reserve
inventory.allocate
inventory.pick
inventory.hold
inventory.release_hold
inventory.adjust_controlled
count.create
count.execute
count.review
count.adjust
```

Packaging and Dispatch may receive only limited movement rights for
their workflow stage.

## 20. Frontend Minimum

``` text
Warehouse Overview
Shelf/Bin Browser
UID Search
Physical Item Detail
Inventory Status
Current Location
Current Custody
Movement History
Pick Queue
My Pick Jobs
Pick by UID Scan
Count Sessions
Count by Shelf/Bin
Discrepancy Queue
Hold Items
Return Queue
```

## 21. UID Search

Authorized users must be able to search a UID and immediately see:

``` text
Product / SKU
Supplier
Intake
Current status
Current warehouse location
Current custody
Order allocation
Packaging reference
Shipment/tracking reference
Movement timeline
```

This is an internal operational view, not a public retailer UID browser.

## 22. Reporting & Analytics Requirements

Follow `REPORTING-FOUNDATION.md`.

Required dimensions:

``` text
warehouse
shelf
bin
uid
physical_item
product
sku
supplier
intake
order
order_line
packaging_job
shipment
tracking_code
inventory_status
custody_status
movement_type
operator
date/time
```

Required measures:

``` text
item_count
weight
available_count
reserved_count
allocated_count
hold_count
picked_count
movement_count
count_discrepancy_count
pick_duration
storage_age
```

Minimum reports:

``` text
Current inventory by Shelf/Bin
Current inventory by Product/SKU
Current inventory by Supplier
Current inventory by Status
Current inventory by Custody
Available / Reserved / Allocated items
Items on HOLD
Aging inventory
Items by Intake
Items by Order
UID movement history
Pick Queue
Pick throughput
Pick exceptions
Average pick time
Cycle count results
Missing UIDs
Unexpected UIDs
Wrong-bin items
Inventory adjustments
Warehouse-to-Packaging movements
Warehouse-to-Dispatch movements
Returns to Warehouse
```

## 23. Audit Requirements

Audit:

``` text
Location created/disabled
UID put away
UID moved
UID reserved
UID allocated
UID picked
UID placed on hold
UID released from hold
UID returned
Count session created
Count result recorded
Discrepancy created/resolved
Inventory adjustment performed
```

## 24. API Capability

Required backend capability:

``` text
Read Warehouse
Read Shelves/Bins
Create/disable Shelf/Bin where authorized
Read UID inventory
Search UID
Assign location
Move UID
Reserve UID
Allocate UID
Release reservation/allocation where permitted
Create Pick Job
Assign Pick Job
Verify Pick UID
Complete Pick
Create Count Session
Read expected UIDs
Record actual UIDs
Create discrepancy
Resolve discrepancy
Controlled inventory adjustment
Place HOLD
Release HOLD
Record Return
Read movement history
Query reporting dimensions
Read audit history
```

## 25. Definition of Done

``` text
[ ] One Warehouse exists
[ ] Multiple Shelves/Bins are supported
[ ] Each active UID has one current location
[ ] Each UID has one current inventory status
[ ] Current custody is tracked separately from location
[ ] Intake can place accepted UID into a Bin
[ ] ORDER_PENDING_RELEASE works
[ ] AVAILABLE works
[ ] RESERVED works
[ ] ALLOCATED works
[ ] One UID cannot be allocated twice
[ ] Internal movement creates history
[ ] Direct silent location overwrite is blocked
[ ] Pick Queue works
[ ] Pick validates UID and expected Bin
[ ] Picked item moves toward Packaging
[ ] HOLD blocks downstream movement
[ ] Return-to-Warehouse flow works
[ ] Count Session works
[ ] Missing/unexpected/wrong-bin discrepancies are captured
[ ] Controlled adjustment is audited
[ ] UID search shows full operational lineage
[ ] Reporting dimensions are persisted
[ ] Audit history is queryable
[ ] Backend uses real persisted data
[ ] Frontend uses real API
[ ] Backend build succeeds
[ ] Frontend build succeeds
[ ] End-to-end warehouse test passes
```

## 26. Explicitly Out of Scope

``` text
Multiple warehouses
Inter-city warehouse transfer
Automated WMS robotics
RFID hardware
Advanced slotting optimization
Automated replenishment
Packaging-material inventory
Carrier routing
Commercial returns/refunds
B2C warehouse logic
```

## 27. Clean-Fork Rule

No warehouse/inventory implementation from the previous Didar project is
automatically inherited.

Reuse follows:

``` text
Inspect
→ Compare
→ Explicitly Approve
→ Reimplement or Selectively Port
```

## 28. Implementation Package

This document defines:

**P07 --- Warehouse & UID Inventory Vertical Slice**

Suggested first path:

``` text
Physical Intake
   ↓
Assign Bin
   ↓
AVAILABLE
   ↓
Order confirmed
   ↓
RESERVED / ALLOCATED
   ↓
Pick
   ↓
Move to Packaging
   ↓
Test
```

The package is complete only when the real:

``` text
Database → Backend → API → Frontend → Test
```

path passes.
