# SETTLEMENT-CORE.md --- Didar B2B Settlement Core

**Status:** Draft v0.1\
**Date:** 2026-09-29\
**Scope:** Settlement policy, obligation, execution, ledger and
reconciliation for B2B\
**Base:** Clean Mercur fork\
**Depends on:** `ORDER-CORE.md`, `SUPPLY-ORDER.md`, `B2B-RBAC.md`\
**Reporting dependency:** `REPORTING-FOUNDATION.md`\
**Implementation status:** Specification only; code and tests have not
been executed.

------------------------------------------------------------------------

## 1. Objective

Define the source-of-truth settlement model for Didar B2B.

This document owns:

``` text
Settlement Policy
Settlement Obligation
Settlement Components
Settlement Transactions
Gold-based Ledger
Calculated Balance
Reconciliation
```

Order and Supply Order consume approved Settlement Policy and store
immutable snapshots of the applicable terms.

------------------------------------------------------------------------

## 2. Core Principles

1.  Base accounting/settlement unit is always **18K gold weight**.
2.  Rial/cash payment is a settlement method against a gold-denominated
    obligation.
3.  Retailer-side and Supplier-side settlements are separate domains.
4.  Settlement Terms are policy-driven, not manually invented per Order.
5.  Order/Proforma stores a snapshot of the terms derived from policy.
6.  Policy changes do not rewrite historical Orders/Proformas.
7.  Ledger balance is calculated from ledger entries; no manual balance
    field is authoritative.
8.  Mixed settlement is modeled as multiple settlement components under
    one obligation.
9.  Credit sales require explicit Retailer credit permission.
10. Short-term rial settlement remains cash/short-term, not credit.
11. Payment execution is separate from the commercial agreement that
    created the obligation.

------------------------------------------------------------------------

## 3. Settlement Domains

### 3.1 Retailer ↔ Didar

``` text
Retailer
   ↓
Didar
```

Source:

``` text
Accepted Order / Final Invoice
```

### 3.2 Didar ↔ Supplier

``` text
Didar
   ↓
Supplier
```

Source:

``` text
Confirmed Supply Order / Supplier Invoice
```

The two domains may have different terms and execution.

------------------------------------------------------------------------

## 4. Global Settlement Policy

Didar Settlement Policy is the source of truth for allowed
payment/settlement terms.

Initial global policy fields:

``` text
base_gold_karat = 18

minimum_initial_settlement_percent
rial_payment_window_days

default_cash_gold_allowed
default_cash_rial_allowed

credit_policy_enabled

effective_from
effective_to?
status
version
```

`minimum_initial_settlement_percent` is configurable and applies
globally unless a later explicitly approved policy layer is introduced.

Examples:

``` text
30%
50%
60%
```

`rial_payment_window_days` is configurable and intended to remain
short-term.

Examples:

``` text
0 = same day
1 = next day
2 = day after next
```

No hard-coded 50% or 10-day rule is allowed.

------------------------------------------------------------------------

## 5. Retailer Credit Profile

Credit sale is separate from normal short-term cash settlement.

Conceptual fields:

``` text
retailer_id
credit_sale_allowed
credit_terms_profile?
credit_limit?
credit_effective_from?
credit_effective_to?
status
approved_by
approved_at
```

Version one only requires the explicit permission gate:

``` text
credit_sale_allowed = true / false
```

If credit is not allowed, payment terms outside the permitted short-term
cash policy must be rejected.

------------------------------------------------------------------------

## 6. Policy Resolution

Order/Proforma does not freely define Payment Terms.

The backend resolves the currently applicable policy:

``` text
Global Settlement Policy
        ↓
Retailer Credit Profile
        ↓
Allowed Settlement Options
        ↓
Order / Proforma
        ↓
Immutable Settlement Terms Snapshot
```

Order Ops may choose only among system-authorized options.

Unsafe manual override is not allowed unless a separately permissioned
exception mechanism is introduced later.

------------------------------------------------------------------------

## 7. Policy Snapshot on Order / Proforma

When a Proforma is issued, store the exact policy-derived terms used.

Conceptual snapshot:

``` text
settlement_policy_version

base_gold_karat_snapshot = 18

minimum_initial_settlement_percent_snapshot
rial_payment_window_days_snapshot

credit_sale_allowed_snapshot

selected_settlement_method
selected_schedule
selected_due_terms

accepted_terms_snapshot
```

Later policy changes must not change the issued/accepted Proforma.

------------------------------------------------------------------------

## 8. Master Obligation

All obligations are gold-based at 18K.

Conceptual record:

``` text
settlement_obligation_id

party_from
party_to

source_type
source_id

base_gold_karat = 18
total_gold_obligation_18k
remaining_gold_balance_18k

policy_snapshot_reference
status

created_at
confirmed_at
```

The authoritative balance is calculated from ledger entries, not
manually edited.

------------------------------------------------------------------------

## 9. Multiple Settlement Components

A single obligation may be settled through multiple independent
components.

Example:

``` text
Master Obligation = 100 g 18K

Component A
→ GOLD

Component B
→ RIAL
```

These components are independent execution tracks under one commercial
obligation.

Conceptual fields:

``` text
settlement_component_id
settlement_obligation_id

component_type
target_gold_equivalent_18k
status
due_terms
```

------------------------------------------------------------------------

## 10. Settlement Methods

Initial execution methods:

``` text
GOLD
RIAL
CREDIT
OTHER_APPROVED
```

`MIXED` is not one opaque payment transaction.

Mixed settlement means:

``` text
1 Obligation
→ N Settlement Components
```

------------------------------------------------------------------------

## 11. Gold Settlement

Gold settlement uses 18K as the base.

Transaction fields:

``` text
gold_weight_received
gold_karat = 18
gold_equivalent_18k
effective_date
reference
```

If a future non-18K receipt is ever allowed, conversion rules require a
separate explicit policy. Version one assumes the settlement basis is
18K.

------------------------------------------------------------------------

## 12. Rial Settlement

Rial payment settles a gold-denominated obligation.

At payment time:

``` text
remaining obligation in grams 18K
        ↓
approved gold rate at payment time
        ↓
rial amount paid
        ↓
gold equivalent settled
        ↓
remaining 18K gold balance
```

Store:

``` text
payment_timestamp
gold_rate_at_payment
gold_rate_source_reference
rial_amount_paid
gold_equivalent_settled_18k
```

The transaction is frozen after confirmation.

Later gold-rate changes must not recalculate historical settlement.

------------------------------------------------------------------------

## 13. Rial Payment Window

Rial settlement must comply with the configured short-term window.

``` text
rial_payment_window_days
```

Example:

``` text
0 / 1 / 2 days
```

If the agreed due date is within the short-term window, the settlement
remains a cash/short-term settlement.

If the due period exceeds the allowed short-term window:

``` text
→ CREDIT
```

and the Retailer must have:

``` text
credit_sale_allowed = true
```

Otherwise the backend must reject the Proforma/terms.

------------------------------------------------------------------------

## 14. Minimum Initial Settlement

Initial required settlement is policy-driven.

``` text
minimum_initial_settlement_percent
```

Example:

``` text
Order obligation = 100 g 18K
Global initial settlement = 30%

Minimum initial settlement = 30 g equivalent
```

The initial settlement may be:

``` text
Gold
or
Rial equivalent at payment-time gold rate
```

The percentage is global/configurable and snapshotted into the Proforma.

------------------------------------------------------------------------

## 15. Credit Settlement

Credit means the obligation extends beyond the normal short-term cash
window.

Credit requires:

``` text
credit_sale_allowed = true
```

Potential future credit controls:

``` text
credit_limit
credit_days
credit_schedule
guarantee
collateral
```

are not required in v0.1 unless separately approved.

------------------------------------------------------------------------

## 16. Settlement Transaction

Each actual settlement event creates a transaction.

Conceptual fields:

``` text
transaction_id
settlement_component_id
settlement_obligation_id

transaction_type

gold_weight?
rial_amount?
gold_rate_at_payment?
gold_equivalent_settled_18k

effective_date
reference_number?
document?

performed_by
status
```

------------------------------------------------------------------------

## 17. Ledger

Didar maintains a central ledger per business counterparty.

Conceptually:

``` text
Opening / prior balance
+ New gold obligations
- Gold-equivalent settlements
± Reversals / controlled adjustments
= Current calculated gold balance 18K
```

Retailer and Supplier ledger domains are separate.

No user may directly edit the authoritative balance field.

Balance is derived from ledger entries.

------------------------------------------------------------------------

## 18. Ledger Entry

Conceptual entry:

``` text
ledger_entry_id

party_id
party_type

source_type
source_id

entry_type
gold_amount_18k

related_transaction_id?
related_obligation_id?

effective_at
created_by
```

Stable entry types may include:

``` text
OBLIGATION
SETTLEMENT
REVERSAL
ADJUSTMENT
CREDIT
DEBIT
```

------------------------------------------------------------------------

## 19. Retailer Settlement Flow

``` text
Order / Final Invoice
        ↓
Create Gold Obligation
        ↓
Resolve Settlement Policy
        ↓
Initial Settlement
        ↓
Remaining Settlement(s)
        ↓
Ledger Update
        ↓
Reconciliation
        ↓
SETTLED
```

------------------------------------------------------------------------

## 20. Supplier Settlement Flow

``` text
Supply Order / Supplier Invoice
        ↓
Supplier Obligation
        ↓
Supplier-side Payment Terms Snapshot
        ↓
Gold / Rial / Other Approved Settlement
        ↓
Ledger Update
        ↓
Reconciliation
        ↓
SETTLED
```

Supplier policy may differ from Retailer policy and is governed by
Supplier commercial/payment terms.

------------------------------------------------------------------------

## 21. Statuses

Suggested obligation statuses:

``` text
PENDING
PARTIALLY_SETTLED
SETTLED
OVERDUE
DISPUTED
CANCELLED
REVERSED
```

Component statuses:

``` text
PENDING
PARTIAL
SETTLED
OVERDUE
CANCELLED
```

------------------------------------------------------------------------

## 22. Reconciliation

System compares:

``` text
Expected Gold Obligation
vs
Actual Gold-Equivalent Settlements
```

Example:

``` text
Expected = 100 g 18K
Settled = 97.5 g equivalent
Remaining = 2.5 g 18K
```

Rial transactions remain traceable by original rial amount and gold-rate
snapshot.

------------------------------------------------------------------------

## 23. Invoice / Proforma Display

Retailer-facing documents must display the settlement terms snapshot.

Examples:

``` text
Base obligation: 18K gold
Initial settlement required: 30%
Settlement method: Rial
Rial payment window: 1 day
Rial amount: based on approved gold rate at payment time
```

or:

``` text
Settlement method: Credit
Credit permission: approved
Agreed due terms: ...
```

The document must not display hidden internal policy fields that are not
relevant to the Retailer.

------------------------------------------------------------------------

## 24. Zarrin Relationship

Didar remains the operational source of settlement obligations and
execution status.

Zarrin may be used for accounting/reconciliation.

Conceptual relationship:

``` text
Didar Operational Ledger
        ↔
Zarrin Accounting / Reconciliation
```

Automated integration is outside this MD.

------------------------------------------------------------------------

## 25. Settlement Documents

Transactions may attach:

``` text
Bank receipt
Gold receipt
Retailer confirmation
Supplier confirmation
Zarrin reference
Other approved accounting document
```

------------------------------------------------------------------------

## 26. RBAC

Settlement policy modification requires explicit privileged permission.

Suggested permissions:

``` text
settlement_policy.read
settlement_policy.manage

retailer_credit_profile.read
retailer_credit_profile.manage

settlement_obligation.read
settlement_transaction.create
settlement_transaction.read

ledger.read
reconciliation.execute
```

Order Ops may read allowed policy options and use them but must not
freely change global policy.

Retailer/Supplier accounting roles see only their own scoped records.

------------------------------------------------------------------------

## 27. Reporting & Analytics Requirements

Required dimensions:

``` text
settlement_obligation
settlement_component
settlement_transaction
ledger_entry

retailer
supplier

order
invoice
supply_order
supplier_invoice

policy_version
settlement_method
status
due_date

gold_weight_18k
rial_amount
gold_rate_at_payment
```

Minimum reports:

``` text
Retailer gold balance
Supplier gold balance

Outstanding obligations
Partial settlements
Settled obligations
Overdue obligations

Gold settlements
Rial settlements
Credit settlements

Initial settlement compliance
Rial window compliance
Credit sales by Retailer

Settlement by Order
Settlement by Invoice
Settlement by Supply Order

Ledger movement
Reconciliation differences
Historical gold rates used in Rial settlement
```

------------------------------------------------------------------------

## 28. Audit Requirements

Audit:

``` text
Settlement Policy created/changed
Initial settlement percent changed
Rial window changed
Credit permission changed

Obligation created
Component created
Transaction recorded
Transaction reversed
Ledger entry created
Reconciliation performed
Dispute opened/resolved
```

------------------------------------------------------------------------

## 29. API Capability

Required backend capability:

``` text
Read active Settlement Policy
Create/update Settlement Policy
Resolve policy for Retailer
Read/update Retailer credit permission

Create Settlement Obligation
Create Settlement Components

Record Gold Settlement
Record Rial Settlement
Record Credit Settlement

Read calculated balance
Read ledger
Create controlled reversal

Perform reconciliation
Attach documents

Query reporting dimensions
Read audit history
```

------------------------------------------------------------------------

## 30. Definition of Done

``` text
[ ] Base settlement unit is always 18K gold
[ ] Global initial settlement percent is configurable
[ ] Rial payment window is configurable
[ ] Order cannot invent unsupported Payment Terms
[ ] Policy-derived terms are snapshotted in Proforma
[ ] Policy changes do not alter historical Proformas
[ ] Credit requires explicit Retailer permission
[ ] Rial settlement beyond cash window is blocked without credit permission
[ ] Gold settlement works
[ ] Rial settlement works using payment-time gold rate
[ ] Historical Rial transaction keeps rate snapshot
[ ] One obligation supports multiple independent settlement components
[ ] Ledger balance is calculated, not manually authoritative
[ ] Retailer and Supplier ledgers remain separate
[ ] Partial settlement works
[ ] Overdue status works
[ ] Reconciliation works
[ ] Documents can be attached
[ ] Reporting works
[ ] Audit works
[ ] Database → Backend → API → Frontend → Test path passes
```

------------------------------------------------------------------------

## 31. Explicitly Out of Scope

``` text
Final gold-rate source/provider
Automatic Zarrin posting
Credit scoring
Guarantee/collateral workflow
Bank integration
Payment gateway implementation
Advanced treasury management
Tax calculation
Legal debt collection
```

------------------------------------------------------------------------

## 32. Implementation Package

**P09 --- Settlement Core**

Suggested first path:

``` text
Global Settlement Policy
        ↓
Retailer Credit Profile
        ↓
Order Proforma resolves allowed terms
        ↓
Create 18K Gold Obligation
        ↓
Gold or Rial Settlement
        ↓
Ledger
        ↓
Calculated Balance
        ↓
Reconciliation
        ↓
Test
```
