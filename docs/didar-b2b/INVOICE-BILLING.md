# INVOICE-BILLING.md --- Didar B2B Invoice & Billing Core

**Status:** Draft v0.1 **Date:** 2026-09-30 **Scope:** B2B commercial
documents, invoice lifecycle, invoice-line itemization, UID traceability
and billing/settlement linkage **Base:** Clean Mercur fork **Depends
on:** `ORDER-CORE.md`, `SUPPLY-ORDER.md`, `SETTLEMENT-CORE.md`,
`PHYSICAL-INTAKE.md`, `AGENT-OPERATIONS.md`, `DISPATCH-DELIVERY.md`,
`B2B-RBAC.md` **Reporting dependency:** `REPORTING-FOUNDATION.md`
**Implementation status:** Specification only; code and tests have not
been executed.

## 1. Objective

Define the document and billing model for Didar B2B.

The system must clearly distinguish:

``` text
RETAILER_PROFORMA
RETAILER_FINAL_INVOICE
SUPPLIER_INVOICE
```

These documents have different meanings, lifecycles and downstream
effects.

Invoice/Billing must preserve:

``` text
Commercial snapshot
Settlement terms snapshot
Weight basis
Final item/UID identity
Invoice Line → UID traceability
Order / Supply Order linkage
Shipment linkage
Settlement obligation linkage
Audit history
```

## 2. Core Principle

A Proforma is not a Final Invoice.

A Final Invoice is not a Settlement transaction.

A Shipment is not an Invoice.

A Supplier Invoice is not a Retailer Invoice.

These entities are related but remain distinct.

## 3. Document Types

Initial document types:

``` text
RETAILER_PROFORMA
RETAILER_FINAL_INVOICE
SUPPLIER_INVOICE
CREDIT_NOTE
DEBIT_NOTE
CANCELLATION_REFERENCE
```

`CREDIT_NOTE` and `DEBIT_NOTE` may remain inactive until
adjustment/reversal workflows require them.

## 4. Retailer Proforma

The Retailer Proforma is the commercial proposal issued before final
customer acceptance in the standard Order Request path.

``` text
Retailer Request
      ↓
Order Ops Review
      ↓
Supply Plan
      ↓
Settlement Policy Resolution
      ↓
Commercial Terms
      ↓
PROFORMA ISSUED
      ↓
Retailer Acceptance
```

The Proforma captures the exact offer presented to the Retailer.

## 5. Proforma Versioning

A Proforma is versioned.

``` text
Request Revision R1
      ↓
Proforma V1
```

If the request changes before acceptance:

``` text
Proforma V1 → SUPERSEDED
New Request Revision
        ↓
Proforma V2
```

A superseded Proforma cannot be accepted.

Minimum fields:

``` text
proforma_id
proforma_number
order_id
request_revision
version
retailer_id
status
issued_at
issued_by
accepted_at?
accepted_by?
superseded_at?
superseded_by_proforma_id?
commercial_snapshot
settlement_terms_snapshot
delivery_terms_snapshot
```

## 6. Proforma Status

``` text
DRAFT
ISSUED
ACCEPTED
SUPERSEDED
DECLINED
WITHDRAWN
```

`ACCEPTED` means the Retailer accepted the exact version.

It does not mean payment was executed or all UIDs already exist.

## 7. Retailer Final Invoice

Final Invoice represents a finalized commercial sale to the Retailer.

It may arise from:

``` text
Standard Order Request → Proforma → Acceptance → Fulfillment
DIDAR_IN_STORE direct sale
AGENT_SELL_BAG direct sale
Authorized AGENT_SAMPLE_BAG direct sale
```

Final Invoice must be linked to the actual sale event and final
commercial snapshot.

## 8. Final Invoice Creation --- Standard Order Path

``` text
Accepted Proforma
      ↓
Eligible physical fulfillment
      ↓
Physical Items / UIDs identified
      ↓
Actual item weights available
      ↓
Final billing values calculated under accepted rules
      ↓
FINAL INVOICE
```

The Final Invoice may only use pricing/weight rules compatible with the
accepted Proforma snapshot.

If actual item data would cause a commercial result outside the accepted
agreement:

``` text
→ STOP
→ COMMERCIAL EXCEPTION
```

No silent price/fee change is permitted.

## 9. Final Invoice Creation --- Direct Sale Path

For:

``` text
DIDAR_IN_STORE
AGENT_SELL_BAG
AGENT_SAMPLE_BAG_DIRECT_SALE
```

the system may issue the Final Invoice directly when all direct-sale
rules pass.

Required data:

``` text
retailer_id
operator_id / agent_id
source
bag_id? if applicable
physical_item_id
uid
actual item weight
commercial terms
settlement policy snapshot
final invoice lines
```

Each sold UID must belong to the exact final Invoice Line.

## 10. Invoice Header

Conceptual fields:

``` text
invoice_id
invoice_number
invoice_type
retailer_id?
supplier_id?
source_order_id?
source_supply_order_id?
source_proforma_id?
status
issue_date
effective_date
currency_display?
base_gold_karat = 18
subtotal?
fees?
tax?
shipping_charge?
other_charge?
gold_obligation_18k
rial_display_amount?
settlement_policy_snapshot
settlement_terms_snapshot
created_by
issued_by
created_at
updated_at
```

## 11. Invoice Line

``` text
invoice_line_id
invoice_id
product_id
sku_id?
product_code_snapshot
product_name_snapshot
quantity
making_fee_snapshot
weight_basis_snapshot
pricing_basis_snapshot
quoted_weight?
actual_item_weight?
gold_value_18k?
unit_price_display?
line_total_display?
source_order_line_id?
source_supply_order_line_id?
```

Historical line snapshots must not be rewritten by later
Product/Supplier Offer changes.

## 12. Invoice Line ↔ UID

``` text
Invoice
  ↓
Invoice Line
  ↓
1..N UIDs / Physical Items
```

Each UID mapping preserves:

``` text
invoice_line_id
physical_item_id
uid
item_weight
```

A UID cannot be included in conflicting final sale documents.

This mapping is mandatory for Shipment, Delivery, Return, Warranty,
Dispute, Settlement reconciliation and Reporting.

## 13. Weight Model

Preserve the distinction between:

``` text
Quoted / estimated weight
Accepted weight basis
Actual item weight
Package weight
```

Package weights never replace item weights.

The Final Invoice uses actual item weight only if accepted commercial
rules allow it.

The original accepted Proforma weight/weight-range remains historical.

## 14. Gold-Based Billing

Didar's settlement basis is 18K gold.

Final Invoice preserves:

``` text
gold_obligation_18k
```

Retailer-visible monetary representation may also be shown where
applicable.

However:

``` text
Gold Obligation ≠ Rial Payment Transaction
```

Rial settlement occurs under `SETTLEMENT-CORE.md` using the approved
gold rate at payment time.

## 15. Settlement Terms on Invoice

Invoice/Proforma does not invent settlement terms.

Terms are resolved from `SETTLEMENT-CORE.md`.

Snapshot:

``` text
settlement_policy_version
base_gold_karat_snapshot = 18
minimum_initial_settlement_percent_snapshot
rial_payment_window_days_snapshot
credit_sale_allowed_snapshot
selected_settlement_method
due_terms
agreed_schedule?
```

## 16. Short-Term Rial Billing Display

Because the authoritative obligation is gold-based, a Rial display
amount must not be presented as permanently fixed if settlement policy
says the actual amount uses the gold rate at payment time.

Distinguish:

``` text
Gold obligation
Rial display/reference amount, if any
Settlement-at-payment-time rule
```

## 17. Credit Sale Display

If Retailer has valid credit permission:

``` text
credit_sale_allowed_snapshot = true
```

the Proforma/Invoice may show the approved credit due terms.

Without credit permission, a credit billing document cannot be issued.

## 18. Supplier Invoice

Supplier Invoice represents the Supplier-side commercial document linked
to goods supplied to Didar.

``` text
Supply Order
      ↓
Supplier Delivery
      ↓
Supplier Invoice
      ↓
Physical Intake
      ↓
Supplier Settlement
```

It must remain traceable to:

``` text
supplier_id
supply_order_id(s)
physical_intake_id(s)
products/SKUs
supplier commercial snapshot
supplier payment terms snapshot
```

## 19. Supplier Invoice and Intake

`PHYSICAL-INTAKE.md` requires:

``` text
Supplier Invoice
Zarrin Invoice Confirmation
```

Invoice module exposes a stable Supplier Invoice reference that Intake
can link.

A file attachment does not replace structured invoice metadata.

## 20. Supplier Invoice Line

``` text
supplier_invoice_line_id
supplier_invoice_id
supplier_id
product_id
sku_id?
supply_order_id
supply_order_line_id?
quantity
declared_weight
supplier_making_fee_snapshot
supplier_commercial_snapshot
```

UIDs may be linked later through Intake after physical receipt.

## 21. Invoice and Settlement Obligation

A finalized Invoice may create or confirm the relevant Settlement
Obligation.

Retailer:

``` text
Final Retailer Invoice
      ↓
Retailer Settlement Obligation
```

Supplier:

``` text
Supplier Invoice
      ↓
Supplier Settlement Obligation
```

The backend must prevent duplicate obligation creation.

## 22. Invoice and Shipment

A Shipment may contain 1..N Invoices for the same Retailer.

``` text
Shipment
├── Invoice A
├── Invoice B
└── Invoice C
```

Every shipped UID remains traceable to the exact Invoice Line.

Cross-Retailer invoice mixing is blocked unless a future explicit
exception is approved.

## 23. Invoice and Package

``` text
Shipment
├── Package 1
│   └── UIDs from Invoice A
└── Package 2
    ├── UID from Invoice A
    └── UID from Invoice B
```

Package grouping does not alter Invoice Lines.

## 24. Shipping Charges

Shipping charge may be represented consistently as one of:

``` text
invoice-level charge
shipment-level charge linked to invoice
separate approved charge line
```

It must not be duplicated.

For partial fulfillment:

``` text
each separate Shipment
→ independent shipping charge according to accepted policy
```

## 25. Invoice Finality

After issue:

``` text
Do not silently edit
Do not overwrite weight
Do not overwrite fee
Do not change Retailer
Do not replace UIDs
Do not erase original document
```

Corrections require controlled actions such as:

``` text
CANCEL + REPLACEMENT
CREDIT NOTE
DEBIT NOTE
REVERSAL / CORRECTION DOCUMENT
```

## 26. Invoice Cancellation

Cancellation preserves:

``` text
original invoice
cancellation reason
actor
timestamp
related replacement invoice?
related order?
related settlement effects?
related shipment effects?
```

Cancellation cannot pretend settled funds, delivered goods or supplier
obligations never existed.

## 27. Invoice Numbering

Suggested namespaces:

``` text
PF-...   Proforma
INV-...  Retailer Final Invoice
SINV-... Supplier Invoice
CN-...   Credit Note
DN-...   Debit Note
```

Exact numbering format is configurable.

Numbers are never reused after cancellation.

## 28. Invoice Status

Retailer Final Invoice:

``` text
DRAFT
ISSUED
CANCELLED
REPLACED
```

Supplier Invoice:

``` text
DRAFT
RECEIVED
VERIFIED
DISPUTED
CANCELLED
```

Settlement and Shipment status remain separate.

## 29. Invoice Documents / Files

Invoice record may have:

``` text
system-generated document
supplier-uploaded invoice file
signed/scanned document
Zarrin confirmation
supporting attachment
```

Replacing a file must preserve audit history.

## 30. Direct Sale Invoice Rules

For `AGENT_SELL_BAG` or authorized `AGENT_SAMPLE_BAG`:

``` text
UID belongs to Agent custody
UID is eligible for sale
Retailer identified
Agent has sale permission
Agent has invoice permission
commercial policy passes
settlement policy passes
```

Then Final Invoice can be issued.

No-Bag cannot issue a UID-backed direct Final Invoice.

## 31. Didar In-Store Invoice Rules

`DIDAR_IN_STORE` may create a direct Final Invoice for known physical
items/UIDs.

The same Invoice Line↔UID, Settlement Policy and Audit rules apply.

## 32. RBAC

Suggested permissions:

``` text
proforma.read
proforma.issue
proforma.supersede

invoice.read
invoice.issue
invoice.cancel_controlled
invoice.replace_controlled

supplier_invoice.read
supplier_invoice.create
supplier_invoice.verify

invoice_attachment.manage
billing_report.read
```

Agent permissions remain:

``` text
sell_bag.invoice.issue
sample_bag.invoice.issue
```

Retailer sees only own commercial documents.

Supplier sees only own Supplier invoices/documents.

## 33. Frontend Minimum

Retailer:

``` text
My Proformas
Proforma Detail
Accept Proforma
My Invoices
Invoice Detail
Settlement Terms
Shipment/Tracking links
```

Supplier:

``` text
My Supplier Invoices
Invoice Detail
Supply Order linkage
Intake linkage
Settlement status
```

Didar:

``` text
Proforma Queue
Invoice List
Invoice Detail
Direct Sale Invoice
Supplier Invoice
Cancellation/Replacement
Attachments
Invoice Reports
```

## 34. Reporting & Analytics Requirements

Dimensions:

``` text
invoice
invoice_line
invoice_type
proforma
retailer
supplier
order
supply_order
product
sku
uid
physical_item
shipment
package
settlement_obligation
status
source
agent
date/time
```

Measures:

``` text
invoice_count
line_count
item_count
gold_obligation_18k
actual_item_weight
quoted_weight
making_fee
shipping_charge
rial_display_amount
cancelled_invoice_count
```

Minimum reports:

``` text
Proformas issued/accepted/superseded
Final Invoices by Retailer/source
Agent direct-sale invoices
Didar in-store invoices
Supplier Invoices by Supplier
Supplier Invoice vs Intake
Invoice Lines by Product/SKU
Invoice Lines by UID
Invoices by Shipment
Invoices by Settlement status
Cancelled/Replaced invoices
Shipping charges
Gold obligation by period
```

Reporting grain must prevent double counting.

## 35. Audit Requirements

Audit at minimum:

``` text
Proforma created/issued/superseded/accepted
Final Invoice created/issued/cancelled/replaced
Supplier Invoice created/uploaded/verified/disputed
Invoice Line ↔ UID linked
Attachment added/replaced
```

## 36. API Capability

Required backend capability:

``` text
Create/read/list Proforma
Issue/Supersede/Accept Proforma
Create/read/list Final Invoice
Issue direct-sale Final Invoice
Controlled cancel/replace Invoice
Create/read Supplier Invoice
Verify/dispute Supplier Invoice
Create/read Invoice Lines
Link Invoice Line to UID
Validate UID uniqueness
Read Invoice ↔ Shipment
Read Invoice ↔ Settlement
Read Invoice ↔ Intake/Supply Order
Manage attachments
Query reporting dimensions
Read audit history
```

## 37. Definition of Done

``` text
[ ] Proforma and Final Invoice are separate
[ ] Proforma versioning works
[ ] Superseded Proforma cannot be accepted
[ ] Standard Order Final Invoice works
[ ] Sell-Bag direct invoice works
[ ] Authorized Sample-Bag direct invoice works
[ ] Didar in-store invoice works
[ ] No-Bag cannot issue direct UID-backed invoice
[ ] Invoice Line ↔ UID works
[ ] One UID cannot be sold in conflicting final invoices
[ ] Actual item weight is preserved
[ ] Accepted Proforma snapshot remains historical
[ ] Settlement terms come from Settlement Policy
[ ] Invoice links to Settlement Obligation without duplication
[ ] Supplier Invoice links to Supply Order and Intake
[ ] Shipment supports 1..N invoices for one Retailer
[ ] Every shipped UID remains traceable to Invoice Line
[ ] Final Invoice cannot be silently edited
[ ] Controlled cancellation/replacement preserves history
[ ] Reporting works without double-counting
[ ] Audit works
[ ] Database → Backend → API → Frontend → Test path passes
```

## 38. Explicitly Out of Scope

``` text
Tax-engine implementation
Iranian e-invoice/tax authority integration
Final legal invoice format
Automatic Zarrin posting
Payment gateway
Refund execution
Credit-note legal/accounting details
B2C invoice rules
Advanced accounting journal entry engine
```

## 39. Clean-Fork Rule

No invoice/billing implementation from the previous Didar project is
automatically inherited.

Reuse follows:

``` text
Inspect
→ Compare
→ Explicitly Approve
→ Reimplement or Selectively Port
```

## 40. Implementation Package

**P10 --- Invoice & Billing Core**

Suggested first path:

``` text
Retailer Order
      ↓
Issue Proforma
      ↓
Accept Proforma
      ↓
Allocate real UID(s)
      ↓
Create Final Invoice
      ↓
Invoice Line ↔ UID
      ↓
Create/Link Settlement Obligation
      ↓
Shipment Manifest
      ↓
Test
```

Then implement direct-sale and Supplier Invoice paths.

The package is complete only when the real persisted:

``` text
Database → Backend → API → Frontend → Test
```

path passes.
