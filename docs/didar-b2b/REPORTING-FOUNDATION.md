# REPORTING-FOUNDATION.md --- Didar B2B Reporting & Analytics Foundation

**Status:** Draft v0.6 --- CRM/Campaign/Enablement/AI dimensions aligned
2026-10-02 --- taxonomy dimensions aligned 2026-10-01\
**Scope:** Cross-cutting foundation for all B2B modules\
**Base:** Clean Mercur fork\
**Principle:** Every operational module must be reportable by design.
Reporting must not require redesigning core transactional schemas later.

## 1. Objective

Define the reporting and analytics foundation that every Didar B2B
module must respect from the beginning.

Didar requires comprehensive operational reporting across products,
suppliers, retailers, physical inventory, UID, orders, sales channels,
agents, warehouse operations, packaging, dispatch, delivery, settlement
and future modules.

This document does **not** define every dashboard or report screen. It
defines the data, traceability, audit and extraction requirements that
make comprehensive reporting possible.

------------------------------------------------------------------------

## 2. Core Principle

Every business event and operational record must preserve enough
structured context to answer:

``` text
WHAT happened?
WHEN did it happen?
WHO performed it?
FOR WHICH organization?
FOR WHICH Supplier / Retailer?
FOR WHICH Product / SKU / UID?
THROUGH WHICH channel/source?
IN WHICH operational location?
WHAT was the previous state?
WHAT is the current state?
WHAT quantities / weights / values were involved?
WHICH upstream/downstream records are related?
```

Reporting readiness is part of the Definition of Done for every future
module.

------------------------------------------------------------------------

## 3. Reporting Architecture

Conceptually:

``` text
TRANSACTIONAL MODULES
│
├── Product
├── Supplier
├── Retailer
├── Physical Intake
├── Inventory
├── UID
├── Order
├── Agent
├── Warehouse
├── Packaging
├── Dispatch
├── Delivery
├── Settlement
└── Future Modules
        │
        ▼
STRUCTURED REPORTABLE DATA
        │
        ├── Business Records
        ├── Status History
        ├── Audit Events
        ├── Relationships
        └── Measures
        │
        ▼
REPORTING / ANALYTICS LAYER
        │
        ├── Operational Reports
        ├── Dashboards
        ├── Filters
        ├── Drill-down
        ├── KPI
        ├── Export
        └── Future Data Warehouse / BI
```

The initial implementation may report directly from the operational
database/API.

The architecture must nevertheless allow a dedicated reporting database,
warehouse or BI layer to be introduced later without redesigning the
business model.

------------------------------------------------------------------------

## 4. Mandatory Reporting Dimensions

Every module must preserve the applicable dimensions below.

Not every record requires every dimension, but applicable relationships
must be explicit and queryable.

``` text
time
organization
user
role/context
supplier
retailer
product
category
subcategory
sku
supplier_offer
physical_item
uid
intake
order
supply_order
agent
sales_source
warehouse
warehouse_location
package
shipment
tracking_code
invoice
invoice_line
custody_holder
carrier_or_agent
settlement
status
business_reference
```

Future modules may add dimensions.

------------------------------------------------------------------------

## 5. Time Dimensions

Operational records must preserve meaningful timestamps rather than only
`created_at` and `updated_at`.

Where applicable:

``` text
created_at
updated_at
submitted_at
approved_at
rejected_at
received_at
confirmed_at
allocated_at
picked_at
packed_at
dispatched_at
delivered_at
settled_at
cancelled_at
```

This allows reporting on both current state and process duration.

Example:

``` text
Order Confirmation Time
= confirmed_at - created_at

Packaging Lead Time
= packed_at - ready_for_packaging_at
```

Exact metrics will be defined in module-specific documents.

------------------------------------------------------------------------

## 6. Actor and Organization Traceability

Where applicable, records and events must preserve:

``` text
created_by
updated_by
performed_by
approved_by
assigned_to

organization_id
organization_type
```

When Didar acts on behalf of another organization:

``` text
business_owner_organization_id
performed_by_user_id
performed_by_organization_id
on_behalf_of = true
```

Reporting must distinguish:

-   who owns the business record,
-   who actually performed the action.

------------------------------------------------------------------------

## 7. Business Entity Relationships

Relationships must use stable identifiers and must be queryable.

Examples:

``` text
Product → Main Category
Product → Product Category
Product → Subcategory
Supplier Offer → Supplier
Supplier Offer → Product
Physical Item → UID
Physical Item → Intake
Physical Item → Supplier
Physical Item → Product / SKU
Order → Retailer
Order → Sales Source
Order → Agent, when applicable
Order Item → Product / SKU
Order Item → Physical Item / UID, when allocated
Intake → Supplier
Intake → Source Order, when applicable
Shipment → Order
Settlement → Order / Organization
```

Avoid storing critical reporting relationships only inside free-text
fields.

------------------------------------------------------------------------

## 8. Status History

Current status alone is not enough.

For reportable operational objects, the platform must retain status
transition history.

Conceptual structure:

``` text
entity_type
entity_id

from_status
to_status

changed_at
changed_by
reason?
metadata?
```

Example:

``` text
ORDER
NEW
→ CONFIRMED
2026-...
User X
```

This allows reports such as:

-   average time in each state,
-   number of items stuck in a state,
-   rejection rates,
-   fulfillment cycle time.

------------------------------------------------------------------------

## 9. Audit Trail

Business-critical actions must be auditable.

Conceptual audit event:

``` text
event_id
event_type

entity_type
entity_id

organization_id
user_id

timestamp

before?
after?

source?
metadata?
```

Audit history must be append-oriented and must not be silently
overwritten by later edits.

Module MDs must identify their required audit events.

------------------------------------------------------------------------

## 10. Quantitative Measures

Numeric business values must be stored as structured fields, not
embedded in descriptive text.

Applicable examples:

``` text
quantity
declared_weight
item_weight
package_weight
outer_shipment_weight
inner_package_weight
item_weight
making_fee
price
discount
tax
amount
gold_amount
settlement_amount
lead_time
duration
```

Units and basis must be explicit.

For weight:

``` text
value
unit
weight_type / context
```

For financial or settlement values, the corresponding module must define
currency/unit/basis explicitly.

------------------------------------------------------------------------

## 11. Product Reporting Requirements

`PRODUCT-CORE.md` must preserve sufficient data to report at least:

``` text
Products by Main Category
Products by Product Category
Products by Subcategory
Products by Supplier
Supplier Offers by Product
Products with multiple Suppliers
Active / Inactive Products
Product creation trend
Product approval status
Weight ranges by Supplier Offer
Making-fee ranges by Supplier Offer
Products created/edited by user
Products awaiting review
Products rejected / approved / published
```

Product reporting must support drill-down from Product to Supplier
Offers.

------------------------------------------------------------------------

## 12. Physical Intake Reporting Requirements

`PHYSICAL-INTAKE.md` must preserve sufficient data to report at least:

``` text
Intakes by Supplier
Intakes by date
Intakes by Intake Reason
Stock Replenishment Intakes
Order Fulfillment Intakes
Made-to-Order Intakes

Physical item count
Accepted count
Hold count
Rejected count

Declared item weight
Outer package weight
Inner/group package weight

UIDs generated
UIDs printed
UIDs reprinted

Items by Product / SKU
Items by Supplier
Items by warehouse location

Supplier Invoice availability
Zarrin Confirmation availability

Items entering AVAILABLE inventory
Items RESERVED / ALLOCATED to Orders

Intakes created by Supplier
Intakes created by Didar on behalf of Supplier
```

------------------------------------------------------------------------

## 13. Order Reporting Foundation

Future `ORDER-CORE.md` must preserve sufficient data to report by:

``` text
Order
Retailer
Supplier relationship where applicable
Product / SKU
UID / Physical Item
Order status
Order source
Agent
Order creation date
Confirmation date
Fulfillment state
Settlement method/terms
Warehouse
Packaging
Dispatch
Delivery
```

Initial known order sources:

``` text
DIDAR_IN_STORE
AGENT_SELL_BAG
AGENT_SAMPLE_BAG
AGENT_NO_BAG
CRM_PHONE
RETAILER_DIRECT
```

These must remain structured values, not free text.

------------------------------------------------------------------------

## 14. Operational Reporting Foundation

Future warehouse, packaging, dispatch and delivery modules must preserve
enough event history to report:

``` text
Current workload
Queue size
Assigned work
Unassigned work
Work by operator
Completed work
Pending work
Exceptions
Average processing time
SLA / aging
Throughput by day/week/month
```

Assignment history must be retained when assignment functionality is
implemented.

------------------------------------------------------------------------

## 15. Agent Reporting Foundation

Agent-related workflows must preserve enough structured data to report:

``` text
Orders by Agent
Direct Sales by Agent
Retailers visited/served

AGENT_SELL_BAG_DIRECT_SALE
AGENT_SAMPLE_BAG_DIRECT_SALE
AGENT_SAMPLE_BAG_ORDER
AGENT_NO_BAG_ORDER

Sell-Bag activity
Sample-Bag activity
No-Bag activity

Sample item sale mode
Agent direct-sale permission context

Physical items associated with Agent custody
Invoice Line ↔ UID for direct sales

Order conversion
Direct-sale conversion
Order status
Returned / unsold items where applicable
```

Detailed Agent KPI definitions will be specified separately.

------------------------------------------------------------------------

## 16. Settlement Reporting Foundation

Settlement execution is not defined here.

Future settlement modules must preserve sufficient structured data to
report:

``` text
Settlement method
Settlement terms
Settlement status
Due dates
Completed settlements
Open settlements
Supplier balances
Retailer balances
Gold-based values
Cash-based values
Mixed settlement values
Reconciliation status
```

Every confirmed B2B Order must eventually be reportable by its recorded
settlement method/terms even before actual settlement is executed.

------------------------------------------------------------------------

## Dispatch, Tracking, Invoice Manifest & Custody Reporting Foundation

Future dispatch/delivery modules must preserve sufficient structured
data to report:

``` text
Shipment / Tracking Code
Retailer
Linked Invoices
Invoice Lines
Physical Packages
Physical Items / UIDs
Final Gross Package Weight
Inner Package / Group Weights
Item Weights
Assigned Agent / Courier / Carrier
Current Custody
Custody Transfer History
OTP handover verification result/time
Current public tracking status
Internal operational status
Expected delivery
Actual delivery
Exceptions / returns
```

A Shipment may link to 1..N invoices, but invoices from different
Retailer organizations must not be mixed unless an explicit future
exception is approved.

Every UID in a Shipment must be traceable to its exact Invoice Line.

Reporting grain must be explicit so joins between Shipment, Invoice,
Package and UID do not multiply invoice value, item count or weight.

OTP secret/code values must never appear in analytical exports. Only
non-secret security events such as `OTP_SENT`, `OTP_VERIFIED`,
timestamps, attempt counts and results may be reportable where
authorized.

## 17. Filtering

Reporting APIs and future reporting UI must support composable filtering
where applicable.

Examples:

``` text
date range
supplier
retailer
organization
product
category
subcategory
sku
uid
agent
order source
intake reason
warehouse
location
status
settlement method
created_by
assigned_to
```

Filters should be combinable rather than requiring a separate report for
every combination.

Example future query:

``` text
Supplier = X
Category = Bracelet
Order Source = AGENT_SELL_BAG
Date = Last 90 Days
Status = DELIVERED
```

------------------------------------------------------------------------

## 18. Drill-down

Summary reporting must preserve links to underlying operational records.

Example:

``` text
Supplier Report
   ↓
Product
   ↓
Supplier Offer
   ↓
Physical Intake
   ↓
Physical Item / UID
   ↓
Order
   ↓
Shipment
```

Users with permission should be able to move from aggregate information
to the relevant source records.

RBAC rules apply to reporting and drill-down.

------------------------------------------------------------------------

## 19. Export

Future reporting interfaces must support export for permitted data.

Initial target formats:

``` text
CSV
Excel/XLSX
```

PDF may be added for fixed-form reports when needed.

Export must respect the same organization scope and RBAC rules as
on-screen reporting.

------------------------------------------------------------------------

## 20. Reporting API Principle

Reporting must not depend on scraping frontend screens.

Structured backend/API access must exist for reportable data.

Initial implementations may expose module-specific reporting/query
endpoints.

A dedicated reporting API can be introduced later.

The underlying requirement is:

> Every reportable value must be obtainable from structured persisted
> data through a controlled backend interface.

------------------------------------------------------------------------

## 21. Data Warehouse Readiness

Didar may later introduce a dedicated analytical store or data
warehouse.

Transactional design must therefore preserve:

``` text
Stable IDs
Explicit relationships
Structured status
Status history
Timestamps
Actor IDs
Organization IDs
Source/channel codes
Numeric measures
Audit events
```

Do not rely on UI labels as analytical keys.

Do not use translated display strings as status/source identifiers.

Use stable machine-readable codes and localize them only in presentation
layers.

------------------------------------------------------------------------

## 22. Localization and Reporting

Machine-readable values remain language-neutral.

Example:

``` text
order_source = AGENT_SELL_BAG
```

The frontend may display:

``` text
FA: فروش از کیف فروش ایجنت
EN: Agent Sell-Bag
AR: ...
FR: ...
```

Reports must filter/group using the stable code, not translated text.

------------------------------------------------------------------------

## 23. Data Retention Principle

Historical operational records required for audit, reconciliation and
reporting must not disappear merely because the current business object
changes state.

Examples:

-   changing a Product must not destroy historical Order Item
    information,
-   changing a Supplier Offer must not rewrite historical order
    conditions,
-   changing a user role must not alter historical actor identity,
-   UID reprint must not erase the previous print event.

Detailed retention periods may be defined later.

------------------------------------------------------------------------

## 24. Module MD Requirement

From this document onward, every operational MD must include a section
named:

`Reporting & Analytics Requirements`

That section must define:

1.  reporting dimensions introduced by the module,
2.  numeric measures introduced by the module,
3.  status/event history required,
4.  audit events required,
5.  relationships required for drill-down,
6.  minimum reports that must be derivable,
7.  extraction/API requirements.

------------------------------------------------------------------------

## 25. Definition of Done --- Reporting Readiness

A future feature is not fully Done unless:

``` text
[ ] Applicable reporting dimensions are persisted
[ ] Stable entity IDs and relationships exist
[ ] Relevant timestamps are persisted
[ ] Status history is available where required
[ ] Required audit events are persisted
[ ] Numeric measures are structured
[ ] Source/channel values use stable codes
[ ] Data can be queried through backend/API
[ ] Organization scope is preserved
[ ] Reporting access can be protected by RBAC
[ ] Historical business meaning is not destroyed by later edits
[ ] Data can be exported or consumed by a future analytics layer
```

This does not require the final reporting dashboard to exist before
every feature can ship.

It requires the feature to be **reporting-ready by design**.

------------------------------------------------------------------------

## 26. Explicitly Out of Scope

This foundation does not yet define:

``` text
Final dashboard UI
Final KPI catalog
BI vendor/tool
Dedicated data warehouse technology
ETL/ELT technology
Scheduled report delivery
Executive dashboard layout
Final Excel templates
Final PDF reports
Predictive analytics
AI analytics
```

Those can be added after the operational data foundation exists.

------------------------------------------------------------------------

## 27. Clean-Fork Rule

No reporting schema, dashboard, analytics workaround or data model from
the previous Didar implementation is automatically inherited.

Any reuse must follow:

``` text
Inspect
→ Compare
→ Explicitly Approve
→ Reimplement or Selectively Port
```

------------------------------------------------------------------------

## 28. Project-Wide Rule

This document is a cross-cutting dependency for all future B2B
operational specifications.

From this point forward:

> **Every Didar B2B module must be designed for complete operational
> traceability and future multidimensional reporting from the moment its
> data model is created.**

The reporting layer must be able to evolve from direct operational
reporting into a full warehouse/BI architecture without requiring the
transactional business model to be rebuilt.

------------------------------------------------------------------------

## Settlement Policy, Ledger & Gold-Based Reporting Foundation

Settlement reporting must preserve the fact that the authoritative
business balance is denominated in 18K gold.

Required structured context includes:

``` text
settlement_policy_version
minimum_initial_settlement_percent
rial_payment_window_days
credit_sale_allowed

settlement_obligation
settlement_component
settlement_transaction
ledger_entry

gold_amount_18k
rial_amount
gold_rate_at_payment
gold_equivalent_settled_18k
```

Reports must distinguish:

``` text
Gold settlement
Rial settlement
Credit settlement
Short-term Rial cash settlement
Initial settlement
Remaining gold balance
```

Historical Rial transactions retain the gold rate used at payment time.

Current balance must be calculated from ledger entries rather than a
manually editable balance snapshot.

Policy changes must remain historically traceable and must not rewrite
already issued/accepted Proforma terms.

## CRM / Campaign / Enablement Dimensions

Additional structured dimensions:

``` text
Retailer
Retailer Contact
Relationship Owner
Agent
CRM Activity
Activity Type
Task
Visit
Conversation
Message
Campaign
Campaign Membership
Collection
Shared Page
Consumer Session
Consumer Reaction
Retailer Lead
AI Recommendation / Insight
Recommendation Outcome
```

Additional funnel examples:

``` text
Campaign
→ Retailer Reach
→ Engagement
→ Product Presentation
→ Consumer Engagement
→ Retailer Request
→ Order
→ Sale
```

``` text
Product
→ Retailer Presentation
→ Consumer View
→ Consumer Interest
→ Retailer Request
→ Order
```

AI output is not itself an authoritative business outcome. Measure
whether recommendations were accepted/acted on separately from actual
domain outcomes.

## Dependency Coverage

Reporting Foundation consumes structured facts from
`CUSTOMER-CRM-CORE.md`, `COMMUNICATION-CHAT.md`,
`CAMPAIGN-MANAGEMENT.md`, `RETAILER-SALES-ENABLEMENT.md` and
`AI-SALES-INTELLIGENCE.md`.

Reporting is downstream of authoritative domain state; reporting failure
must not silently rewrite source transactions.

## CMS / Content Dimensions

Dimensions:

``` text
Page
Page Type
Page Version
Block
Block Type
Locale
Article
Media
Product Reference
Campaign Reference
```

Measures:

``` text
Page Views
Block Impressions
CTA Clicks
Product Block Clicks
Article Views
VR CTA Clicks
```

Content engagement remains distinct from Order/Sale conversion.
