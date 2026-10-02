# DISPATCH-DELIVERY.md --- Didar B2B Dispatch, Tracking, Custody & Delivery

**Status:** Draft v0.1 **Date:** 2026-09-29 **Scope:** Outbound shipment
creation, package manifest, OTP custody transfer, tracking and final
delivery **Base:** Clean Mercur fork **Depends on:** `ORDER-CORE.md`
v0.2, `PACKAGING-FULFILLMENT.md` v0.2, `B2B-RBAC.md` v0.2 **Related:**
`PHYSICAL-INTAKE.md` v0.5, `REPORTING-FOUNDATION.md` v0.2

## 1. Objective

Define how packaged B2B goods leave Didar custody, are handed to an
authorized Agent/Courier/Carrier, remain trackable by a Didar tracking
code, and are delivered to the Retailer.

## 2. Core Relationship

``` text
1 Shipment
→ 1 Retailer
→ 1 Tracking Code
→ 1..N Invoices
→ 1..N Packages
→ N Invoice Lines
→ N Physical Items / UIDs
```

A Shipment must not mix invoices belonging to different Retailer
organizations unless an explicitly approved future exception is defined.

Tracking Code identifies the Shipment journey, not an Invoice and not a
Product UID.

## 3. Shipment Creation

``` text
Order / authorized partial group ready
        ↓
Packaging completed
        ↓
Create Shipment
        ↓
Link Retailer + Invoices + Packages + UID manifest
        ↓
Generate Didar Tracking Code
        ↓
READY_FOR_HANDOVER
```

Default order policy remains `WAIT_FOR_ALL_ITEMS`.

## 4. Tracking Code

Each Shipment receives one unique, stable Didar tracking code.

``` text
shipment_id
tracking_code
retailer_id
order_id
status
public_status
created_at
expected_delivery_at?
delivered_at?
```

The tracking code is non-reusable and remains historical after
cancellation.

## 5. Invoice Manifest

A Shipment may contain several invoices for the same Retailer.

``` text
Tracking DG-001245
├── Invoice INV-1023
├── Invoice INV-1024
└── Invoice INV-1029
```

Every UID must map to the exact Invoice Line:

``` text
Tracking Code
   ↓
Shipment
   ↓
Package
   ↓
UID
   ↓
Invoice Line
   ↓
Invoice
```

This mapping is mandatory for dispute resolution, partial delivery,
return, accounting reconciliation and reporting.

## 6. Package Manifest

``` text
Shipment
├── Package 1
│   ├── UID A
│   └── UID B
└── Package 2
    └── UID C
```

Each Package keeps:

``` text
package_id
package_reference
shipment_id
package_sequence
included_uids[]
final_gross_weight?
weight_check_status
status
```

Package Reference and Tracking Code are different identifiers.

## 7. Three-Level Outbound Weight Manifest

``` text
OUTER SHIPMENT PACKAGE
│
├── final_gross_weight?
│
├── INNER PACKAGE / GROUP [0..N]
│   └── inner_package_weight?
│
└── PHYSICAL ITEM / UID
    └── item_weight
```

The first two levels are optional.

Item weight comes from accepted Physical Item/Invoice data and is not
overwritten by Dispatch.

Sender-side or receiver-side weight checking may be `NOT_PERFORMED`.

The system must not assume package weights equal the sum of item
weights.

## 8. Assigned Receiver / Carrier

Possible types:

``` text
DIDAR_AGENT
COURIER
INTERNAL_CARRIER
APPROVED_EXTERNAL_CARRIER
OTHER_APPROVED
```

Conceptual fields:

``` text
assigned_receiver_type
assigned_receiver_id?
receiver_name
receiver_mobile
assigned_at
assigned_by
```

## 9. OTP Custody Handover

``` text
READY_FOR_HANDOVER
        ↓
Assign receiver + mobile
        ↓
Generate/send OTP
        ↓
Receiver arrives
        ↓
OTP submitted
        ↓
Backend verifies
        ↓
OTP_VERIFIED
        ↓
Physical handover permitted
        ↓
HANDED_OVER / IN_TRANSIT
```

No valid OTP verification means no confirmed custody transfer when OTP
is required.

Do not store or expose the OTP code in normal logs, reports or retailer
UI.

Persist only:

``` text
otp_status
otp_sent_at
otp_verified_at
otp_attempt_count
otp_delivery_result?
verified_by
```

## 10. Custody Transfer

``` text
shipment_id
tracking_code
custody_from
custody_to
receiver_type
receiver_id?
handover_at
handover_by
otp_verification_reference
location?
```

OTP verification is shipment-specific and must not be reusable for
another Shipment.

## 11. Tracking Timeline

Initial events:

``` text
SHIPMENT_CREATED
READY_FOR_DISPATCH
RECEIVER_ASSIGNED
OTP_SENT
OTP_VERIFIED
HANDED_TO_AGENT
HANDED_TO_COURIER
HANDED_TO_CARRIER
IN_TRANSIT
ARRIVED_AT_DESTINATION
OUT_FOR_DELIVERY
DELIVERED
EXCEPTION
RETURN_INITIATED
RETURNED
CANCELLED
```

Each event stores:

``` text
tracking_code
event_type
timestamp
actor?
location?
custody_type?
internal_status
public_status
metadata?
```

Internal and public statuses are separate.

## 12. Retailer Tracking View

Retailer can enter/open the Didar Tracking Code and see:

``` text
Tracking Code
Current public status
Timeline
Expected delivery
Actual delivery when completed
Linked invoice numbers/references
Package count
Delivery method
```

It may show that the Shipment is with Didar Agent or Carrier, but must
not expose unnecessary personal information, OTP data or internal
security metadata.

## 13. Delivery Confirmation

``` text
delivered_at
delivery_status
delivered_to_name?
delivered_to_mobile?
delivery_evidence_type?
delivery_evidence_reference?
delivery_location?
confirmed_by
```

Do not mark delivery complete merely because time elapsed or a carrier
was assigned.

## 14. Exceptions

``` text
OTP_FAILED
RECEIVER_MISMATCH
PACKAGE_MISSING
PACKAGE_DAMAGED
UID_MANIFEST_MISMATCH
INVOICE_MANIFEST_MISMATCH
WEIGHT_EXCEPTION
DELIVERY_DELAY
DELIVERY_REFUSED
ADDRESS_EXCEPTION
LOST_IN_TRANSIT
OTHER
```

## 15. Reporting & Analytics Requirements

Required dimensions:

``` text
shipment
tracking_code
retailer
order
invoice
invoice_line
package
uid
physical_item
product
agent/courier/carrier
custody_holder
handover_method
public_status
internal_status
delivery_status
exception
date/time
```

Required measures:

``` text
shipment_count
package_count
invoice_count
uid_count
item_weight
inner_package_weight
final_gross_weight
handover_duration
transit_duration
delivery_duration
otp_attempt_count
exception_count
```

Minimum reports include Shipments by Retailer/Invoice/Tracking Code,
Packages per Shipment, UIDs per Package and Invoice Line, current
custody, OTP verification outcomes, in-transit aging, delivery
performance, exceptions and weight manifests.

OTP secrets are never reportable.

## 16. Audit Requirements

Audit:

``` text
Shipment created
Tracking Code generated
Invoice linked/unlinked before release
Package linked/unlinked before release
UID manifest validated
Receiver assigned/reassigned
OTP sent
OTP verification succeeded/failed
Custody transferred
Tracking status changed
Expected delivery changed
Delivery confirmed
Exception created/resolved
Return initiated/completed
Shipment cancelled
```

## 17. API Capability

Required real backend capability:

``` text
Create Shipment
Generate/read Tracking Code
Link 1..N invoices
Link Invoice Lines to UIDs
Link 1..N Packages
Read/validate UID manifest
Read/write optional weight manifest
Assign receiver/carrier
Send handover OTP
Verify handover OTP
Confirm custody transfer
Create/read Tracking Events
Read retailer public tracking projection
Update expected delivery
Confirm delivery
Create/resolve exception
Record return events
Query reporting dimensions
Read audit/event history
```

## 18. Definition of Done

``` text
[ ] Shipment has unique stable Tracking Code
[ ] Shipment belongs to exactly one Retailer
[ ] Shipment supports 1..N invoices
[ ] Cross-Retailer invoice mixing is blocked
[ ] Every shipped UID maps to exact Invoice Line
[ ] Shipment supports 1..N physical Packages
[ ] Package Reference is distinct from Tracking Code
[ ] Final gross weight is optional and supported
[ ] Inner package/group weights are optional and supported
[ ] Item weight comes from Physical Item/Invoice data
[ ] Receiver weight-check NOT_PERFORMED can be recorded
[ ] Receiver/Courier/Agent can be assigned with mobile
[ ] OTP can be sent and verified
[ ] OTP secret is not exposed/stored in reportable logs
[ ] Custody transfer cannot confirm without required OTP verification
[ ] OTP verification cannot be reused for another Shipment
[ ] Tracking Timeline records custody/status events
[ ] Retailer can view own Tracking Code and public timeline
[ ] Retailer cannot view unrelated/internal-sensitive data
[ ] Current custody is queryable
[ ] Delivery confirmation is evidence-based
[ ] Reporting and audit are queryable
[ ] Database → Backend → API → Frontend → Test path passes
```

## 19. Explicitly Out of Scope

``` text
Carrier-specific third-party API integration
Final SMS/OTP provider selection
OTP expiry/rate policy details
Shipping-rate formulas
Commercial return/refund logic
Settlement reversal
Returned-gold QC
B2C delivery
Advanced route optimization
```

## 20. Implementation Package

**P06 --- Dispatch, Tracking & Delivery Vertical Slice**

``` text
PACKAGED
  ↓
Create Shipment
  ↓
Link invoices + packages + UIDs
  ↓
Generate Tracking Code
  ↓
Assign Agent/Courier
  ↓
OTP verify
  ↓
Custody transfer
  ↓
Retailer tracks public timeline
  ↓
Delivery confirm
  ↓
Test
```
