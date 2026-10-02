# ORDER-CORE.md --- Didar B2B Order Core

**Status:** Draft v0.4 --- agreed business decisions recorded; technical
mapping pending\
**Date:** 2026-09-29\
**Scope:** B2B requests, proformas, customer acceptance, sourcing and
allocation contracts\
**Base:** Clean Mercur fork; no automatic reuse from the previous
project\
**Related contracts:** `PRODUCT-CORE.md` v0.3; `PHYSICAL-INTAKE.md`
v0.4\
**Reporting dependency:** `REPORTING-FOUNDATION.md` v0.1\
**Implementation status:** Specification only. No repository changes,
builds or runtime tests performed.

## 1. Purpose and agreed rules

A retailer requests products and quantities. Didar reviews the request,
selects the supply plan and presents a proforma. The retailer accepts a
specific proforma version. Only then may physically received, eligible
items and their existing UIDs be allocated to that order.

The following are business requirements, not optional UI conventions:

-   One order core supports six creation sources. Customers never choose
    a supplier.
-   Customers do not browse exact inventory, ready/unready pieces or
    selectable UIDs. Didar communicates the proposed supply/delivery
    conditions in its response and proforma.
-   Didar may split one requested line across multiple suppliers and
    sourcing methods.
-   Settlement terms must be recorded before final customer acceptance.
    Settlement execution is a separate workflow.
-   Accepted commercial terms are immutable snapshots, unaffected by
    later catalog or supplier-offer edits.
-   Default delivery is `WAIT_FOR_ALL_ITEMS`. Partial shipment is
    permitted by explicit agreement, with an independent shipping charge
    for each shipment.
-   Before final customer acceptance, the request is editable.
    Afterwards, the retailer contacts Didar; version one uses controlled
    cancellation and replacement rather than editing the confirmed
    commercial agreement in place.
-   Internal Didar approval alone does not authorize customer-order UID
    allocation.

Technical names and state codes below are proposed implementation
contracts. Work must map them to the exact clean Mercur/Medusa version
before coding; they do not assert that particular native routes or
schemas already exist.

## 2. Six order sources

  -----------------------------------------------------------------------
  Stable source           Meaning                 Context to preserve
  ----------------------- ----------------------- -----------------------
  `DIDAR_IN_STORE`        Retailer visits a Didar Actual sales operator
                          wholesale location      and Didar location

  `AGENT_SELL_BAG`        Agent visits retailer   Agent and
                          with saleable physical  sell-bag/custody
                          goods                   reference

  `AGENT_SAMPLE_BAG`      Agent presents samples  Agent and sample-bag
                          and takes a product     reference
                          request                 

  `AGENT_NO_BAG`          Agent takes a request   Agent
                          from the catalog        
                          without a bag           

  `CRM_PHONE`             Didar records a         Actual operator;
                          retailer's              external CRM reference
                          telephone/CRM request   only when applicable

  `RETAILER_DIRECT`       Retailer submits its    Retailer organization
                          own B2B request         and actual user
  -----------------------------------------------------------------------

The six source codes are preserved, but not every source always follows
the same commercial path.

Two execution families exist:

``` text
IMMEDIATE FINAL SALE
→ DIDAR_IN_STORE
→ AGENT_SELL_BAG
→ AGENT_SAMPLE_BAG only when direct-sale authorization exists

ORDER REQUEST / APPROVAL FLOW
→ AGENT_SAMPLE_BAG
→ AGENT_NO_BAG
→ CRM_PHONE
→ RETAILER_DIRECT
```

`AGENT_SAMPLE_BAG` may therefore create either: - an assisted Order
Request, or - a direct final sale for a specifically `SALE_ALLOWED`
sample UID when the Agent holds explicit direct-sale permission.

`DIDAR_IN_STORE` is not an Agent visit.

A source is not a fulfillment method. Direct-sale paths finalize against
known physical items/UIDs and final invoice rules; request paths
continue through Order Ops, proforma and customer acceptance.

Identity, acting-on-behalf-of context and source are recorded by the
backend, not trusted merely because the browser supplied them. All six
sources follow the customer-acceptance gate, including assisted and
immediate handover flows.

## 3. Minimal conceptual records

Reuse the framework's suitable records/relations where possible; these
business concepts do not mandate six new database tables.

  -----------------------------------------------------------------------
  Record                              Minimum business meaning
  ----------------------------------- -----------------------------------
  **Order / Request**                 ID/reference, retailer, source,
                                      actual creator/organization,
                                      agent/location when applicable,
                                      request revision, lifecycle state,
                                      current issued proforma, accepted
                                      proforma, timestamps, replacement
                                      linkage

  **Order Line**                      Stable line ID, product/SKU
                                      reference, requested quantity and
                                      requested specifications; agreed
                                      product/quantity/specification
                                      snapshots when accepted

  **Proforma Version**                Order and request revision, version
                                      number, immutable issued line/terms
                                      snapshots, settlement terms,
                                      delivery plan, shipping charging
                                      policy, issuer/time, acceptance
                                      state/evidence

  **Supply Allocation**               Internal plan for part of a line:
                                      supplier/offer, quantity, sourcing
                                      method, supply/production
                                      reference, supplier commercial
                                      snapshot, commitment and history

  **UID Allocation**                  Actual item/UID-to-order-line
                                      assignment, supply-allocation
                                      reference, accepted-proforma
                                      reference, actor/time,
                                      active/released history

  **Shipment / Handover**             Separate delivery record with its
                                      own tracking code, destination,
                                      custody timeline, 1..N linked
                                      invoices, 1..N physical packages,
                                      quantities/UIDs, and shipping
                                      charge/terms; detailed execution is
                                      defined in `DISPATCH-DELIVERY.md`
  -----------------------------------------------------------------------

Do not place a single mandatory `supplier_id` on Order Line: one line
may have several supply allocations. A supply plan is not an allocation
of physical items.

## 4. Three sourcing methods --- internal, below the order line

  ---------------------------------------------------------------------------
  Method                  Supply path             UID behavior
  ----------------------- ----------------------- ---------------------------
  `DIDAR_STOCK`           Previously received     Reuse existing Physical
                          stock at an authorized  Item and UID; no second
                          Didar location/custody  intake or UID

  `SUPPLIER_STOCK`        Supplier stock          Generate UID only on actual
                          requested for the       accepted physical receipt;
                          order, delivered to     allocate after all release
                          Didar, then received    gates

  `MADE_TO_ORDER`         Obtain supplier lead    No UID for
                          time, agree the         unmanufactured/unreceived
                          delivery proposal,      goods; then the same intake
                          place/track supply or   and allocation gate
                          production request,     
                          receive completed goods 
  ---------------------------------------------------------------------------

Example: a retailer requests ten pieces of one product. Didar plans six
from Supplier A and four from Supplier B. Either allocation may use a
different sourcing method. The retailer still sees its product request
and the agreed commercial/delivery terms, not a supplier selector.

Active planned quantities must not exceed the agreed line quantity.
Before issuing the final proposal, the plan must account for the
proposed quantity, including explicit supplier-stock or manufacturing
paths rather than pretending all goods are ready.

Didar may revise supplier choice before supplier commitment. After
commitment, replacement requires a controlled action with reason, actor
and history, and resolution of the previous commitment. Changing an
internal supplier never silently changes the customer's accepted fee,
price basis, product specification or delivery obligation.

Detailed purchasing/manufacturing execution belongs in a separate
supply-order contract. Requesting a lead time is not proof that
production has started or a piece exists.

## 4A. Immediate Final Sale Paths

Immediate final sale is permitted only where the business journey and
permissions explicitly allow it.

Initial direct-sale paths:

``` text
DIDAR_IN_STORE
AGENT_SELL_BAG
AGENT_SAMPLE_BAG_DIRECT_SALE (conditional)
```

For Agent direct sale, the Retailer is known and the physical UID is
already in authorized Agent custody.

Minimum direct-sale checks:

``` text
known Retailer
eligible physical UID exists
UID belongs to authorized custody/Bag
UID is sellable and not blocked/sold
Agent/direct-sale permission is valid
commercial terms are finalized
final invoice can be issued
```

A direct sale records:

``` text
retailer_id
agent_id? / operator_id
source
bag_id? when applicable
uid(s)
physical_item(s)
final commercial snapshot
final invoice
invoice_line ↔ uid mapping
sale timestamp
```

Direct final sale does not create a pending proforma merely to mimic the
request path.

For Sample-Bag, direct sale is allowed only when:

``` text
sample_item_sale_mode = SALE_ALLOWED
AND Agent has sample_bag.sale.create
AND Agent has sample_bag.invoice.issue
```

Otherwise Sample-Bag remains an Order Request path.

No-Bag can never be a direct physical sale because the Agent does not
hold an eligible physical UID.

## 5. Request → response → accepted agreement

``` text
Product + requested quantity
        ↓
Submit / Order Ops queue
        ↓
Review request; select suppliers and sourcing plan
        ↓
Define commercial terms + settlement terms + delivery proposal
        ↓
Internal Didar approval
        ↓
Issue proforma version N for request revision R
        ↓
Retailer reviews and accepts that exact current version
        ↓
Order CONFIRMED / agreement frozen
        ↓
Existing eligible UID allocation OR external supply then physical intake
        ↓
Shipment readiness / agreed handover
```

Suggested distinct states:

``` text
Order:
DRAFT → SUBMITTED → IN_REVIEW → AWAITING_CUSTOMER_APPROVAL → CONFIRMED
CANCELLED is a controlled terminal result, not a deletion.

Proforma:
DRAFT → ISSUED → ACCEPTED
An unaccepted version may instead become SUPERSEDED, WITHDRAWN or DECLINED.
```

Record internal approval separately (`internally_approved_at/by`).
Reserve `confirmed_at` for final customer acceptance. Keep
fulfillment/shipment and settlement states separate from this commercial
lifecycle: delivery does not mean settlement is complete.

If a pre-acceptance request changes, increment its revision and
invalidate the old issued proforma. Return it for review and issue a new
version. A stale page, superseded version or declined version cannot be
accepted.

## 6. Proforma and commercial snapshot

An issued proforma captures its exact offered terms; customer acceptance
locks that version as the agreement. Later changes to live Product or
Supplier Offer data never reprice it.

Snapshot at least:

-   Product code/name, requested specifications, karat/material where
    relevant, agreed quantity, quoted weight value/range and its basis.
-   Customer making-fee type/value/range and calculation basis; agreed
    price or calculation/rate basis; explicit units/currency where
    applicable.
-   Settlement method/terms, due basis, dates or agreed schedule where
    relevant.
-   Delivery destination or agreed collection location, proposed timing,
    default wait-all policy, and shipment charging terms.

Preserve supplier purchase/offer terms separately on the internal supply
plan. Do not assume a supplier's fee is automatically the customer's
selling fee.

**Weight distinction:** quoted weight may be exact, estimated or a range
before pieces are allocated. Preserve that meaning. Actual allocated
weight comes from the supplier label recorded by Intake and is stored
separately, never by overwriting the accepted quotation.

A frozen value remains fixed. A frozen, explicitly accepted calculation
basis may use the subsequently recorded item weight only as that
agreement allows. Do not invent a gold rate, tolerance or final monetary
amount. If the received item or resulting terms fall outside the
accepted agreement, stop release and send an exception to Didar. Version
one's commercial resolution is cancellation/replacement when feasible,
not silent amendment.

The detailed pricing/weight-variance policy still needs its own
contract. Until specified, no automatic acceptance of a commercial
deviation is permitted.

## 7. Settlement terms are policy-derived; settlement is not executed here

A Proforma must contain explicit Settlement Terms before it can be
accepted, but Order Ops does **not** freely invent those terms.

The backend resolves:

``` text
Active Settlement Policy
        ↓
Retailer Credit Profile
        ↓
Allowed Settlement Options
        ↓
Selected Option
        ↓
Immutable Proforma Snapshot
```

Minimum snapshot includes, where applicable:

``` text
settlement_policy_version
base_gold_karat_snapshot = 18
minimum_initial_settlement_percent_snapshot
rial_payment_window_days_snapshot
credit_sale_allowed_snapshot
selected_settlement_method
agreed_due_terms / schedule
agreed_terms_snapshot
```

Order Ops may select only among backend-authorized options.

If the proposed terms exceed the permitted short-term Rial payment
window and the Retailer lacks credit permission, the backend must reject
the terms.

Acceptance creates no payment, accounting posting or settled balance.
`SETTLEMENT-CORE.md` owns execution, ledger, balance and reconciliation.

A later Settlement Policy change must not change an issued or accepted
Proforma. \## 8. Who can accept, and what is recorded

Acceptance must be attributable to the retailer organization and an
authorized accepting user. Store at least the proforma ID/version,
request revision, accepted time and acceptance actor/method.

A Didar user recording acceptance on behalf of the retailer is allowed
only through an explicitly authorized assisted-acceptance process with
evidence and actual actor traceability; being the order creator or an
agent is not itself authority to accept. Until such a process is
separately approved, require the authorized retailer user's acceptance.

Authentication, consent evidence and any OTP/signature mechanism are not
invented by this MD. They must be mapped to the approved
access/acceptance mechanism before live use.

The backend validates the current revision and state. Concurrent
acceptance/revision/cancellation must not create conflicting agreements.
Repeating the same successful acceptance request returns the same
business result, not another order or agreement.

## 9. UID allocation gate

Allocate an item only when all applicable conditions are true:

``` text
Order is CONFIRMED with a valid accepted proforma
Proforma belongs to this order and the accepted request revision
No cancellation/replacement or unresolved release block exists
Physical item actually exists and has an existing unique UID
Intake is accepted/confirmed with required documents and label handling
Item location/custody permits the intended fulfillment action
Product/specification/weight fit the accepted agreement
Line and supply-allocation quantities permit this assignment
UID is not actively allocated elsewhere, already dispatched or otherwise unavailable
```

The backend makes the availability check and assignment safely against
concurrent requests. A UID has at most one active customer-order
allocation. Retries must not duplicate items, allocations or quantities.

No binding customer-order reservation or physical-item allocation is
created simply by submitting a request, internally approving it or
issuing a proforma. Order-specific goods received unusually early may
remain blocked from general sale, but that hold is **not** a customer
allocation; see Intake's `ORDER_PENDING_RELEASE` state.

For supplier-stock and made-to-order lines, acceptance authorizes
progress, not fictitious stock. Allocate only after real receipt. Store
the order-line and supply-allocation references, not just an
order-header reference.

Retailers may subsequently see their own assigned goods in permitted
order documents/views; they never receive a global UID or inventory
browsing endpoint.

## 10. Shipment policy and immediate handover

Default: `WAIT_FOR_ALL_ITEMS`. Shipment release waits until the whole
agreed order is ready, unless partial delivery has been explicitly
authorized.

Alternative: `PARTIAL_ALLOWED`. Record who approved it and the agreed
charging basis. Every separate shipment has its own charge record/terms
and quantity/UID membership. Its amount is explicitly agreed or
calculated from the agreed policy; never silently multiply an
order-level fee. A zero/waived charge, if permitted, must also be
explicit.

Partial shipments do not require duplicating the commercial order. One
line can be delivered in several shipments without double-counting
quantities or reusing an actively shipped UID. Quantities shipped and
cancelled must remain consistent with the agreement.

A split authorized after acceptance is a separate delivery authorization
under the agreed policy, not an overwrite of the accepted proforma.
Changes outside that policy or to the accepted commercial agreement
follow cancellation/replacement.

`DIDAR_IN_STORE` may complete by local collection; `AGENT_SELL_BAG` may
complete by agent handover. These still need the same acceptance and
allocation evidence but must not be forced through a fictitious second
warehouse receipt, packing or courier journey. Applicable local handling
remains controlled by the corresponding fulfillment/custody contract.

Detailed packaging, carrier assignment, shipping rates and proof of
delivery are outside this MD. Store agreed delivery terms now and
reference real shipment/handover records when those modules exist.

### Shipment, invoice and item traceability

A Shipment is not an Invoice and is not a Package.

Initial relationship:

``` text
1 Shipment
→ 1 Retailer
→ 1..N Invoices
→ 1..N Packages
→ N Physical Items / UIDs
```

A Shipment must not combine invoices belonging to different Retailer
organizations unless a future explicitly approved exception is
specified.

Every shipped UID must remain traceable to the exact Invoice Line that
commercialized that Physical Item:

``` text
tracking_code
   ↓
Shipment
   ↓
Invoice
   ↓
Invoice Line
   ↓
UID / Physical Item
```

The Shipment receives a Didar tracking code. Retailer-facing tracking
exposes only the approved public shipment status/timeline and its own
invoice references.

Detailed custody, OTP, weight manifest, package tracking and delivery
events are defined in `DISPATCH-DELIVERY.md`.

## 11. Editing, cancellation and replacement

  -----------------------------------------------------------------------
  Situation                           Required behavior
  ----------------------------------- -----------------------------------
  Before final customer acceptance    Authorized retailer or Didar may
                                      edit; preserve revisions and
                                      invalidate obsolete quotes

  After confirmation, retailer asks   No direct retailer edit; record a
  for change                          request for Didar review

  Didar can safely cancel all         Cancel with reason/actor, safely
  outstanding obligations             release reversible allocations,
                                      preserve all history; create a
                                      linked replacement request

  Production/irreversible supplier    No one-click commercial
  commitment or shipment has begun    cancellation that erases
                                      obligations; block automation and
                                      route to controlled exception
                                      handling
  -----------------------------------------------------------------------

No in-place commercial amendment engine is required in v0.1. A
replacement has its own ID, new proforma and fresh acceptance, linked
via `replaces_order_id` / `replaced_by_order_id`. Do not copy acceptance
or active UID allocations to the replacement.

Cancelling an order is not the same as cancelling one shipment.
Cancellation cannot pretend dispatched goods returned, stop external
manufacturing without confirmation, or generate automatic
refunds/settlement reversals. Those actions belong to later workflows.

Late supplier deliveries referencing a cancelled order remain traceable
and blocked pending Didar resolution; they must not silently allocate to
that order or become general available stock.

## 12. Access and data projection

**Retailer:** request products/quantities, review its proformas, accept
through the approved mechanism, track its own agreement and delivery
state, and request changes. No supplier selection or global inventory
visibility.

**Didar Order Ops:** internal review, supplier plans/splits, proposal
creation, selection among Settlement Policy-authorized payment options,
supply/UID allocation coordination and controlled
cancellation/replacement, within granted permissions. Order Ops cannot
freely define unsupported Payment Terms.

**Agent / CRM / in-store operator:** assisted creation with real source
and actor context, not unrestricted Order Ops or customer-acceptance
rights.

**Supplier:** only its authorized supplier-side requests/allocations
through the appropriate module; not the complete retailer order or other
suppliers' data.

Use separate server-side response projections. Reject retailer attempts
to set supplier, inventory UID, supply-allocation IDs, approval flags or
internal commercial values. Protect filters, expansions, exports and
report drill-downs as well as screens. Detailed roles are defined in
`B2B-RBAC.md`; this delay is not permission to disable authentication or
organization boundaries.

## 13. Required API and UI capabilities

Endpoint paths, DTOs and native cart/order mappings must be verified
against the exact clean fork. Do not blindly replace commerce endpoints
or invoke a stock-reserving checkout before the agreed acceptance gate.

  -----------------------------------------------------------------------
  Surface                             Real backend capability and
                                      corresponding UI
  ----------------------------------- -----------------------------------
  Retailer request                    Create/read/edit/submit own request
                                      and product quantities

  Order Ops queue                     Review request, assign
                                      responsibility, build/split
                                      internal supply plan

  Proforma                            Issue immutable version, read it,
                                      decline/request correction,
                                      supersede when request changes

  Acceptance                          Accept current version with
                                      evidence and concurrency checks

  Fulfillment coordination            Read line readiness; allocate
                                      eligible real UIDs after
                                      acceptance; track supplier/intake
                                      references

  Delivery policy                     Read wait-all readiness; record
                                      authorized split plan and
                                      per-shipment charge terms

  Cancellation                        Submit change request; Didar cancel
                                      when safe; create linked
                                      replacement

  Reporting                           Query scoped orders, lines, plans,
                                      snapshots and event histories with
                                      composable filters
  -----------------------------------------------------------------------

Expected error cases must be visible: superseded proforma, missing
settlement terms, unauthorized supplier selection, attempted
pre-acceptance UID allocation, conflicting allocation and unsafe
cancellation. Never show success before the backend confirms it, or
switch silently to mock data.

## 14. Reporting & Analytics Requirements

Follow `REPORTING-FOUNDATION.md`. Minimum structured dimensions:

``` text
order / order_line / request_revision / proforma_version
retailer / actor / actor_organization / on_behalf_of
source / agent / sales_location / agent_transaction_type / bag / sample_item_sale_mode
product / sku / category / subcategory
supplier / supplier_offer / supply_allocation / sourcing_method
supply_order / production_reference / intake / physical_item / uid
warehouse / location / shipment / tracking_code / package / invoice / invoice_line / delivery_policy
settlement_method / settlement_policy_version / credit_permission_snapshot / commercial_state / fulfillment_state
replaces_order / replaced_by_order / cancellation_reason
```

Persist event times for submission, internal review/approval,
issue/supersede/acceptance of each proforma, supplier commitment/change,
physical allocation/release, shipment/handover and
cancellation/replacement. Retain before/after state, actual actor and
reason for controlled changes.

Minimum derivable reports: requests by source/retailer/product; direct
sales by source/agent; Sell-Bag direct sales; Sample-Bag direct sales;
Sample-Bag assisted orders; No-Bag assisted orders; issued versus
accepted proformas; waiting-for-acceptance age; confirmation and supply
lead time; supply splits by supplier/method; quantities
requested/agreed/allocated/shipped; wait-all blocked orders; partial
shipments and their separate charges; orders by settlement terms;
cancellations/replacements; Shipment-to-Invoice linkage; Tracking Code
drill-down; Package-to-UID and Invoice-Line-to-UID traceability; UID
drill-down to Intake.

Measures retain units and meaning: quoted versus actual allocated
weight, customer fee versus supplier fee, agreed money versus actual
settlement, and package weight versus item weight. None may be silently
substituted for another.

Define report grain explicitly. A join from one order line to several
supply allocations, UIDs and shipments must not multiply sales value or
requested quantity. Count at each record's own grain and use explicit
allocation quantities for supplier contribution. Distinguish
requests/quotes from accepted orders and completed sales; replacement
orders must not inflate completed-sales totals.

Expose stable IDs, pagination, composable filters and scoped backend
extraction, suitable for later CSV/XLSX/BI. A final dashboard or
exporter is not required by this package. Historical agreement snapshots
must remain unchanged after catalog updates and cancellation.

## 15. Acceptance tests --- not yet executed

-   [ ] Each of the six sources produces the same order-core
    relationship structure with correct creator/context.
-   [ ] A retailer submits a product/quantity request without supplier,
    stock-ready state or UID selection.
-   [ ] A ten-piece line splits 6/4 across suppliers and may use several
    sourcing methods without changing requested quantity.
-   [ ] Pre-commitment supplier replacement works; committed replacement
    requires controlled handling and history.
-   [ ] Issued proforma includes settlement terms, delivery terms and
    versioned commercial snapshots.
-   [ ] Missing terms or invalid/stale version prevents acceptance;
    duplicate acceptance creates no duplicate agreement.
-   [ ] Changing an unaccepted request invalidates its old proforma;
    customer accepts only the replacement version.
-   [ ] A confirmed 14% customer fee stays 14% after a live supplier
    offer changes to 16%.
-   [ ] Catalog/inventory data does not leak via retailer responses,
    expansions or report exports.
-   [ ] Before customer acceptance, both UI and direct API attempts to
    allocate a UID fail.
-   [ ] After acceptance, an eligible existing UID is allocated once
    without new intake/UID generation.
-   [ ] Supplier-stock and made-to-order paths wait for real receipt;
    each item maps to the correct line/plan.
-   [ ] Early order-specific receipts are unavailable to other orders
    and are not customer-allocated.
-   [ ] Concurrent allocation cannot assign one UID twice or exceed line
    quantities.
-   [ ] Actual item weights remain separate from accepted quoted weight;
    out-of-agreement changes block release.
-   [ ] Default wait-all blocks shipment while a line is unready;
    authorized partial shipment records separate charges.
-   [ ] Local/agent handover preserves the same acceptance gate without
    fictitious additional receipt or courier steps.
-   [ ] Retailer cannot edit a confirmed agreement; safe Didar
    cancellation creates an auditable linked replacement requiring new
    acceptance.
-   [ ] Shipped/committed orders cannot be silently cancelled; late
    receipts for cancelled orders remain blocked.
-   [ ] Reporting retains actor/status/snapshot history and does not
    double-count supplier splits or shipments.
-   [ ] Database persistence, migrations, API responses, both builds and
    real frontend end-to-end scenarios pass.

All checks require implementation evidence. Mock flows can support
development but cannot satisfy real API, persistence or acceptance
tests.

## 16. Implementation boundary and sequence

In Work, first inspect the clean Mercur native Product/Variant/Seller,
cart/order, quotation if present, inventory reservation and fulfillment
structures. Record exact mapping and any gaps before altering them.

Implement a narrow real path first:

`Product request → Order Ops → Proforma → Retailer acceptance → Existing UID allocation → Test`

Then complete supplier-split, external receipt, wait-all/partial and
cancellation/replacement scenarios. Reuse the same core for all source
adapters. No source-specific bypass is permitted.

Detailed settlement/accounting, gold-pricing formulas,
purchasing/manufacturing execution, returns, agent custody/OTP,
warehouse tasks, packaging, dispatch, delivery and report dashboards
remain separate MDs. Integration gaps must be reported as pending, not
disguised as implemented.

Contract references are not a demand to build all modules
simultaneously: Product's isolated slice can be completed independently;
Intake's stock path can run independently. Order-linked release is not
operationally complete until the real Order acceptance gate exists and
is tested.

## 17. Remaining bounded decisions

These do not reopen the agreed workflow, but must be resolved before
their corresponding live operations:

-   Exact pricing/weight-variance and rate-fixation rules for estimated
    or made-to-order pieces. Safe default: no unapproved commercial
    deviation.
-   Approved customer/assisted acceptance mechanism and evidence. Safe
    default: no presumed acceptance by an order creator.
-   Proforma expiry duration, if any; do not invent an automatic expiry
    policy.
-   Detailed authorization, supply commitment release, shipping-charge
    calculation and post-dispatch cancellation/return procedures.

No production readiness, completed code or passed test is claimed by
this specification.
