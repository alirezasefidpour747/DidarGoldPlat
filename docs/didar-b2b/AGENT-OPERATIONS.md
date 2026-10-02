# AGENT-OPERATIONS.md --- Didar B2B Agent Operations

**Status:** Draft v0.2\
**Date:** 2026-09-29\
**Scope:** Field Agent operational journeys: Sell-Bag, Sample-Bag and
No-Bag\
**Base:** Clean Mercur fork\
**Depends on:** `ORDER-CORE.md`, `B2B-RBAC.md`, `PHYSICAL-INTAKE.md`,
`DISPATCH-DELIVERY.md`\
**Reporting dependency:** `REPORTING-FOUNDATION.md`\
**Implementation status:** Specification only; code and tests have not
been executed.

------------------------------------------------------------------------

## 1. Objective

Define Didar Agent operations across three distinct field-sales
journeys:

``` text
AGENT_SELL_BAG
AGENT_SAMPLE_BAG
AGENT_NO_BAG
```

These journeys are not operationally identical.

-   `SELL_BAG` supports direct final sale of eligible physical UIDs.
-   `SAMPLE_BAG` supports order-taking and may also support direct sale
    of specific sample UIDs when both item-level and agent-level
    permission allow it.
-   `NO_BAG` is order-taking only.

------------------------------------------------------------------------

## 2. Core Agent Principles

1.  Every Agent action must preserve the actual `agent_id`.
2.  Every Retailer-facing Agent action must preserve the target
    `retailer_id`.
3.  Agent-created orders are explicitly created **on behalf of a known
    Retailer**.
4.  Agent may not freely change the Retailer to an unauthorized
    organization.
5.  Agent is not Order Ops.
6.  Agent does not select Supplier.
7.  Agent does not see global stock or globally selectable UIDs.
8.  Agent does not automatically have authority to accept Retailer
    proformas.
9.  Direct-sale permissions are separate from order-taking permissions.
10. Direct sale must only use UIDs physically assigned to the Agent's
    active Bag.

------------------------------------------------------------------------

## 3. Agent Core Record

Conceptual fields:

``` text
agent_id
user_id
name
mobile
status

assigned_region?
assigned_retailers?
active_bags[]

max_item_count?
max_total_weight?
max_total_value?
max_active_bags?
```

------------------------------------------------------------------------

## 4. Bag Types

``` text
SELL_BAG
SAMPLE_BAG
```

Conceptual Bag fields:

``` text
bag_id
bag_type
agent_id

status
created_at
issued_at?
returned_at?

item_count
total_declared_weight
total_declared_value?

custody_status
```

A UID may not be present in two active Bags simultaneously.

------------------------------------------------------------------------

## 5. Bag Item Model

Each Bag Item references a real physical UID.

``` text
bag_id
uid
physical_item_id
product_id
item_weight

sample_item_sale_mode?
item_status

added_at
removed_at?
```

For Sample-Bag items:

``` text
sample_item_sale_mode:

DISPLAY_ONLY
SALE_ALLOWED
```

A `SALE_ALLOWED` item still requires the Agent to hold the relevant
direct-sale permission.

------------------------------------------------------------------------

## 6. Bag Lifecycle

Suggested lifecycle:

``` text
DRAFT
  ↓
READY_FOR_HANDOVER
  ↓
OTP_VERIFIED
  ↓
ISSUED_TO_AGENT
  ↓
IN_AGENT_CUSTODY
  ↓
ACTIVE / PARTIALLY_SOLD
  ↓
RETURN_PENDING
  ↓
RETURNED
  ↓
CLOSED
```

Exception states:

``` text
HOLD
MISSING_ITEM
DAMAGED_ITEM
CUSTODY_EXCEPTION
```

------------------------------------------------------------------------

## 7. Bag Handover with OTP

Bag pickup requires OTP when configured for the handover.

``` text
Bag ready
   ↓
Agent mobile
   ↓
OTP sent
   ↓
Agent submits OTP
   ↓
Backend verifies
   ↓
Custody transfers to Agent
```

Persist only non-secret OTP evidence:

``` text
otp_status
otp_sent_at
otp_verified_at
otp_attempt_count
handover_at
handover_by
custody_from
custody_to
```

Never expose the OTP secret in logs/reports.

------------------------------------------------------------------------

## 8. Sell-Bag --- Direct Sale Path

Sell-Bag contains physical saleable UIDs.

Operational flow:

``` text
Agent + active Sell-Bag
        ↓
Known Retailer
        ↓
Retailer selects physical UID(s)
        ↓
Agent scans UID(s)
        ↓
Backend validates Bag ownership / sale eligibility
        ↓
Commercial terms finalized
        ↓
DIRECT FINAL SALE
        ↓
Final Invoice issued
        ↓
UID leaves active Bag
        ↓
Sold to Retailer
```

Required backend checks:

``` text
UID belongs to Agent's active Sell-Bag
UID is saleable
UID is not sold/blocked
Retailer is authorized/identified
Agent has direct Sell-Bag sale permission
Commercial rules pass
```

Sell-Bag direct sale does not require the normal request→Order
Ops→proforma path unless a later policy explicitly routes a specific
sale there.

This is an immediate-sale path.

------------------------------------------------------------------------

## 9. Sell-Bag Final Invoice

The direct-sale transaction must preserve:

``` text
agent_id
retailer_id
source = AGENT_SELL_BAG
bag_id
uid(s)
physical_item(s)
final commercial snapshot
final invoice id
invoice lines
sale timestamp
```

Each sold UID must map to the exact final Invoice Line.

The Bag item becomes sold/removed from active custody inventory through
a controlled event.

------------------------------------------------------------------------

## 10. Sample-Bag --- Order-Only Path

Default Sample-Bag behavior is order-taking.

``` text
Agent
  ↓
Known Retailer
  ↓
Show Sample UID / Product
  ↓
Retailer requests Product + Qty
  ↓
Agent creates order on behalf of Retailer
  ↓
source = AGENT_SAMPLE_BAG
  ↓
retailer_id fixed to that Retailer
  ↓
Order Ops
  ↓
Proforma / Retailer acceptance
```

The sample UID is not automatically the fulfillment UID.

The Order remains Product-based.

------------------------------------------------------------------------

## 11. Sample-Bag --- Direct Sale Exception

A Sample-Bag item may be sold directly only when **both** item-level and
agent-level authorization exist.

Required conditions:

``` text
UID belongs to Agent's active Sample-Bag
AND sample_item_sale_mode = SALE_ALLOWED
AND Agent has sample_bag.sale.create
AND Agent has sample_bag.invoice.issue
AND Retailer is identified/authorized
AND UID is not sold/blocked
AND commercial rules pass
```

Then:

``` text
Sample UID
   ↓
DIRECT FINAL SALE
   ↓
Final Invoice
   ↓
UID leaves Sample-Bag
```

Otherwise:

``` text
→ ORDER REQUEST ONLY
```

A `DISPLAY_ONLY` Sample UID may never be sold directly.

------------------------------------------------------------------------

## 12. No-Bag --- Assisted Order Only

No-Bag has no physical Bag or sellable UID.

``` text
Agent
  ↓
Known Retailer
  ↓
Permitted Catalog
  ↓
Product + Qty
  ↓
Create Order on behalf of Retailer
  ↓
source = AGENT_NO_BAG
  ↓
Order Ops
```

No-Bag cannot issue a direct final sale because the Agent does not
possess an eligible physical UID.

------------------------------------------------------------------------

## 13. Retailer Attribution

For Sample-Bag and No-Bag assisted orders:

``` text
retailer_id = target Retailer
agent_id = actual Agent
created_by = Agent user
created_on_behalf_of_retailer = true
source = AGENT_SAMPLE_BAG or AGENT_NO_BAG
```

The backend must derive/validate the allowed Retailer scope.

The Agent must not be able to change `retailer_id` to another
unauthorized Retailer by manipulating the request.

------------------------------------------------------------------------

## 14. Direct Sale vs Order Request

The Agent system must explicitly distinguish transaction intent:

``` text
AGENT_SELL_BAG_DIRECT_SALE
AGENT_SAMPLE_BAG_DIRECT_SALE
AGENT_SAMPLE_BAG_ORDER
AGENT_NO_BAG_ORDER
```

These are reporting/operational classifications.

The base Order Source remains compatible with Order Core:

``` text
AGENT_SELL_BAG
AGENT_SAMPLE_BAG
AGENT_NO_BAG
```

Direct-sale paths create a finalized sale/invoice record rather than
entering the standard pending Order Ops request flow.

------------------------------------------------------------------------

## 15. Agent Visit

Every field visit may preserve:

``` text
visit_id
agent_id
retailer_id
visit_type
started_at
ended_at?

bag_id?
order_id?
invoice_id?

notes?
result
```

Suggested results:

``` text
NO_ORDER
ORDER_CREATED
DIRECT_SALE
FOLLOW_UP
RETAILER_NOT_AVAILABLE
DECLINED
OTHER
```

------------------------------------------------------------------------

## 16. Sell-Bag Return

``` text
Agent initiates return
        ↓
Return Bag to Didar
        ↓
Controlled handover / OTP when required
        ↓
Scan UIDs
        ↓
Compare expected vs actual
        ↓
Return accepted
        ↓
Custody → Didar
```

Reconciliation:

``` text
Expected
Sold
Returned
Missing
Damaged
```

Bag cannot close with unresolved mismatch.

------------------------------------------------------------------------

## 17. Sample-Bag Return

Sample-Bag return uses the same physical reconciliation principles.

A sold `SALE_ALLOWED` Sample UID is expected to be absent from return
because it has a valid direct-sale record.

A `DISPLAY_ONLY` UID missing from return creates an exception.

------------------------------------------------------------------------

## 18. Missing / Damaged Item

Initial exception states:

``` text
MISSING_ITEM
DAMAGED_ITEM
CUSTODY_EXCEPTION
```

Each exception preserves Agent, Bag, UID, timestamps, reason and
resolution.

Financial liability is outside this MD.

------------------------------------------------------------------------

## 19. Agent Limits

Potential limits:

``` text
max_item_count
max_total_weight
max_total_value
max_active_bags
```

Backend validates limits before Bag issue.

------------------------------------------------------------------------

## 20. Permissions

Role:

``` text
DIDAR_AGENT
```

Base permissions:

``` text
catalog.read_agent
retailer.read_assigned

visit.create
visit.read_own

agent_order.create
agent_order.read_own

sell_bag.read_own
sample_bag.read_own

bag_item.scan
bag_return.initiate

tracking.read_own_handover
```

Direct-sale permissions are explicit:

``` text
sell_bag.sale.create
sell_bag.invoice.issue

sample_bag.sale.create
sample_bag.invoice.issue
```

Order-taking permission does not imply direct-sale permission.

------------------------------------------------------------------------

## 21. Agent Restrictions

Agent must not automatically gain:

``` text
supplier.select
supplier_offer_internal.read
global_uid.read
global_inventory.read
order.internal_approve
proforma.accept_for_retailer
product.publish
settlement.execute
other_agent_bag.read
```

------------------------------------------------------------------------

## 22. Internal Didar Operations

Authorized internal users may:

``` text
Create Bag
Assign Agent
Add/remove UID before issue
Set Sample item sale mode
Grant/revoke Agent direct-sale permission
Set Agent limits
Issue Bag
Receive Return
Resolve Bag exception
Close Bag
```

All are audited.

------------------------------------------------------------------------

## 23. Reporting & Analytics Requirements

Required dimensions:

``` text
agent
retailer
visit
bag
bag_type
uid
physical_item
product
order
invoice
invoice_line
order_source
agent_transaction_type
sample_item_sale_mode
region
status
date/time
```

Required measures:

``` text
visit_count
order_count
direct_sale_count
invoice_count
bag_item_count
bag_weight
bag_value
sold_item_count
returned_item_count
missing_item_count
damaged_item_count
conversion_rate
custody_duration
```

Minimum reports:

``` text
Visits by Agent
Orders by Agent
Direct Sales by Agent
Sell-Bag Direct Sales
Sample-Bag Direct Sales
Sample-Bag Orders
No-Bag Orders
Retailers visited
Retailer conversion
Active Bags
Bag weight/value by Agent
UIDs sold from Bag
UIDs returned
Missing/Damaged items
Average custody duration
Orders per visit
Direct sales per visit
Orders/Sales per Retailer
```

Do not double-count one direct sale as both an Order Request conversion
and a separate sale unless the analytical metric explicitly intends
that.

------------------------------------------------------------------------

## 24. Audit Requirements

Audit:

``` text
Bag created
Agent assigned
UID added/removed
Sample sale mode changed
Direct-sale permission changed
Bag issued
OTP sent/verified
Custody transferred
Visit created
Assisted Order created
Direct Sale created
Final Invoice issued
UID sold/removed from Bag
Return started
UID returned
UID missing/damaged
Bag closed
Agent limit changed
```

------------------------------------------------------------------------

## 25. API Capability

Required backend capability:

``` text
Create/read Bag
Assign Agent
Add/remove Bag items
Set sample item sale mode

Issue Bag
Send/verify OTP
Confirm custody

Create/read/close Visit

Create Sample-Bag Order
Create No-Bag Order

Create Sell-Bag Direct Sale
Create authorized Sample-Bag Direct Sale
Issue Final Invoice for authorized direct sale

Start Return
Scan Returned UID
Create Exception
Complete Return
Close Bag

Read Agent Dashboard
Read Agent Custody
Query Reporting
Read Audit
```

------------------------------------------------------------------------

## 26. Frontend Minimum

Agent App:

``` text
My Dashboard
My Retailers
My Visits
Catalog

Sell-Bag
Sample-Bag

Create Order
Direct Sale
My Orders
My Invoices

Return Bag
Exceptions
```

Internal Didar:

``` text
Agent List
Agent Permissions
Agent Limits
Bag Creation
Bag Assignment
Sample Sale Mode
Bag Issue
Bag Return
Exceptions
Reports
```

------------------------------------------------------------------------

## 27. Definition of Done

``` text
[ ] Sell-Bag direct sale works
[ ] Sell-Bag final invoice works
[ ] Sell-Bag UID must belong to Agent's active Bag
[ ] Sample-Bag order-only flow works
[ ] Sample-Bag direct sale works only for SALE_ALLOWED UID
[ ] Sample-Bag direct sale also requires Agent permission
[ ] DISPLAY_ONLY sample cannot be directly sold
[ ] No-Bag assisted order works
[ ] No-Bag cannot create direct physical sale
[ ] Assisted orders preserve Retailer + Agent + on-behalf-of context
[ ] Agent cannot switch to unauthorized Retailer
[ ] Direct-sale invoice lines map to exact UIDs
[ ] UID cannot exist in two active Bags
[ ] OTP custody handover works
[ ] Agent limits are enforced
[ ] Bag return/reconciliation works
[ ] Missing/damaged exceptions work
[ ] Reporting distinguishes direct sale vs order-taking
[ ] Audit works
[ ] Database → Backend → API → Frontend → Test path passes
```

------------------------------------------------------------------------

## 28. Explicitly Out of Scope

``` text
Agent payroll
Commission calculation
Travel expense
GPS live tracking
Advanced route optimization
Agent performance bonuses
Loss financial liability
HR attendance
B2C Agent
```

------------------------------------------------------------------------

## 29. Implementation Package

**P08 --- Agent Operations**

Suggested sequence:

``` text
Agent + Retailer Assignment
        ↓
No-Bag Assisted Order
        ↓
Sample-Bag Order
        ↓
Sell-Bag Direct Sale
        ↓
Sample-Bag Authorized Direct Sale
        ↓
OTP Custody
        ↓
Return / Reconciliation
        ↓
Reporting
        ↓
Test
```

## CRM Workspace Integration

Agent Operations consumes `CUSTOMER-CRM-CORE.md`.

Agent Workspace is not only a sales screen. An authorized Agent can
access assigned Retailers and permitted Customer 360 context:

``` text
Assigned Retailers
Customer Timeline
Activities
Tasks / Follow-ups
Visits
Product Presentations
Product Interests
Conversations
Campaign Tasks
```

Sell-Bag, Sample-Bag and No-Bag sales actions remain governed by this
document, but they occur in the context of the authorized Retailer
relationship.

Agent may record structured CRM activities and visit outcomes according
to permission.

## Chat Integration

Agent may participate in Retailer Conversations assigned/permitted under
`COMMUNICATION-CHAT.md`. Conversation transfer does not erase history.

## Campaign Integration

Campaign may assign Retailers, Tasks, Visits or Product presentation
actions to Agent. Campaign context is preserved on resulting CRM
activities and Orders where applicable.

## AI Assistance Boundary

Future AI may summarize authorized Retailer history, summarize
Conversations, suggest replies, suggest Products and recommend next
actions.

AI does not expand Agent permissions and cannot expose unassigned
Retailers or unauthorized financial/Supplier information.

## Explicit Dependency Contract

For the CRM-enabled Agent Workspace, this specification consumes
`CUSTOMER-CRM-CORE.md`, `COMMUNICATION-CHAT.md` and
`CAMPAIGN-MANAGEMENT.md`, while preserving its existing dependencies on
Product, Order, UID/physical custody, Invoice and Settlement rules.

CRM/Chat/Campaign integration must not weaken Sell-Bag, Sample-Bag or
No-Bag authorization/custody rules.
