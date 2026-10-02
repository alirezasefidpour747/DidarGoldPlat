# B2B-RBAC.md --- Didar B2B Roles, Permissions & Organization Scope

**Status:** Draft v0.6 --- CRM/Chat/Campaign/Enablement/AI aligned
2026-10-02 --- Product taxonomy governance aligned 2026-10-01\
**Date:** 2026-09-29\
**Scope:** B2B authorization model across Didar, Supplier and Retailer
organizations\
**Base:** Clean Mercur fork\
**Depends on:** `PRODUCT-CORE.md`, `ORDER-CORE.md`, `SUPPLY-ORDER.md`,
`PHYSICAL-INTAKE.md`\
**Reporting dependency:** `REPORTING-FOUNDATION.md`\
**Implementation status:** Specification only; code and tests have not
been executed.

------------------------------------------------------------------------

## 1. Objective

Define the B2B access-control model for Didar.

Authorization must answer:

``` text
WHO
can perform WHICH ACTION
on WHICH RESOURCE
inside WHICH ORGANIZATION SCOPE
at WHICH WORKFLOW STATE
```

RBAC is not only menu visibility.

Every protected action must be enforced by the backend/API.

------------------------------------------------------------------------

## 2. Core Authorization Principles

1.  A user may have one or more roles.
2.  Roles belong to an organization context.
3.  Organization scope is mandatory.
4.  A user from Supplier A must never gain access to Supplier B data.
5.  A user from Retailer A must never gain access to Retailer B data.
6.  Internal Didar roles may have broader cross-organization scope
    according to permission.
7.  Workflow state may further restrict an otherwise permitted action.
8.  UI visibility does not replace backend authorization.
9.  Reporting/export/drill-down must obey the same RBAC rules as
    operational screens.
10. Acting on behalf of another organization must always preserve the
    actual actor and be auditable.

------------------------------------------------------------------------

## 3. Organization Types

Initial organization types:

``` text
DIDAR
SUPPLIER
RETAILER
```

A user belongs to one or more authorized organization memberships only
if explicitly granted.

Conceptual membership:

``` text
user_id
organization_id
organization_type
roles[]
status
created_at
created_by
```

------------------------------------------------------------------------

## 4. Role Families

### 4.1 Didar Internal Roles

``` text
DIDAR_SUPER_ADMIN
DIDAR_ORDER_OPS
DIDAR_PRODUCT_OPS
DIDAR_WAREHOUSE_INTAKE
DIDAR_PACKAGING
DIDAR_DISPATCH
DIDAR_AGENT
DIDAR_FINANCE
```

Additional internal roles may be introduced later without redesigning
the core model.

### 4.2 Supplier Roles

``` text
SUPPLIER_ADMIN
SUPPLIER_PRODUCT_OPERATOR
SUPPLIER_ACCOUNTING
```

### 4.3 Retailer Roles

``` text
RETAILER_ADMIN
RETAILER_ORDER_PROCUREMENT
RETAILER_ACCOUNTING
```

------------------------------------------------------------------------

## 5. Multiple Roles per User

A single user may hold multiple roles inside the same organization.

Example:

``` text
Retailer Owner
→ RETAILER_ADMIN
→ RETAILER_ORDER_PROCUREMENT
→ RETAILER_ACCOUNTING
```

This supports small retailers where one person performs all functions.

Larger organizations may assign each role to separate users.

Permissions are additive unless an explicit deny/restriction rule is
later introduced.

------------------------------------------------------------------------

# 6. DIDAR ROLES

## 6.1 DIDAR_SUPER_ADMIN

Full administrative authority across Didar B2B.

Allowed conceptual scope:

``` text
users
organizations
roles
permissions
products
supplier offers
orders
supply orders
intakes
inventory
uid
warehouse
packaging
dispatch
reporting
configuration
audit
```

Super Admin may:

``` text
Create/update Didar users
Assign/remove internal roles
View all B2B organizations
View all Supplier and Retailer operational records
Override operational assignments when explicitly permitted
View all reports
Access audit trails
Manage system-level configuration
```

Super Admin actions remain auditable.

Super Admin does not bypass business invariants such as:

``` text
customer acceptance gate
UID uniqueness
historical snapshot integrity
quantity consistency
```

------------------------------------------------------------------------

## 6.2 DIDAR_PRODUCT_OPS

Responsible for Product/SKU review, approval and publication.

Primary permissions:

``` text
product.read
product.review
product.approve
product.reject
product.request_changes
product.publish
product.unpublish
product.update_controlled
product.create_on_behalf_of_supplier

taxonomy.read
taxonomy.create
taxonomy.update
taxonomy.activate
taxonomy.deactivate
taxonomy.reparent_controlled

supplier_offer.read
supplier_offer.review
```

Product Ops may:

``` text
Review Supplier-submitted Product/SKU
Review Product data and images
Review Supplier Offer
Request correction
Reject
Approve
Publish
Deactivate/unpublish when authorized
View Product lifecycle history
Manage shared Product taxonomy when granted
Create/edit Product and Supplier Offer on behalf of a selected Supplier when granted
```

Product Ops must not automatically gain:

``` text
settlement execution
supplier accounting
retailer accounting
order confirmation authority
warehouse intake authority
dispatch authority
```

------------------------------------------------------------------------

## 6.3 DIDAR_ORDER_OPS

Responsible for all submitted B2B Orders after creation.

All six sources enter Order Ops:

``` text
DIDAR_IN_STORE
AGENT_SELL_BAG
AGENT_SAMPLE_BAG
AGENT_NO_BAG
CRM_PHONE
RETAILER_DIRECT
```

Primary permissions:

``` text
order.read_all
order.review
order.assign
order.create_assisted
order.update_pre_acceptance
order.internal_approve
order.issue_proforma
order.cancel_controlled
order.create_replacement

supply_allocation.create
supply_allocation.update
supply_order.create
supply_order.read
supplier.select
supplier.replace_controlled

uid_allocation.coordinate
```

Order Ops may:

``` text
Review incoming order
Validate Retailer
Validate requested items
Choose Supplier
Split one order line across Suppliers
Choose sourcing method
Prepare customer commercial terms
Select settlement terms only from backend-authorized Settlement Policy options
Prepare delivery proposal
Issue proforma
Coordinate post-acceptance fulfillment
Create controlled cancellation/replacement
Track readiness
```

Order Ops must not:

``` text
Pretend customer acceptance occurred
Allocate non-existent UID
Bypass Intake
Edit accepted historical snapshots
Perform settlement execution unless separately authorized
```

------------------------------------------------------------------------

## 6.4 DIDAR_WAREHOUSE_INTAKE

Responsible for physical receipt and intake.

Primary permissions:

``` text
intake.read
intake.create
intake.update
intake.receive
intake.inspect
intake.accept
intake.hold
intake.reject

document.attach_supplier_invoice
document.attach_zarrin_confirmation

uid.generate
uid.print
uid.reprint_controlled

warehouse_location.assign
inventory_disposition.set
```

Warehouse Intake may:

``` text
Create Intake
Create Intake on behalf of Supplier
Receive goods
Record package structures
Record supplier-declared weights
Perform physical/visual inspection
Attach Supplier Invoice
Attach Zarrin Confirmation
Generate UID
Print UID label
Reprint with audit
Assign warehouse location
Move accepted item to allowed inventory state
```

Warehouse Intake must not:

``` text
Create customer acceptance
Choose Retailer settlement terms
Change accepted Order commercial terms
Publish Products
Execute Supplier settlement
```

------------------------------------------------------------------------

## 6.5 DIDAR_PACKAGING

Responsible for packaging work assigned to its queue.

Primary conceptual permissions:

``` text
packaging_queue.read
packaging_job.read
packaging_job.accept
packaging_job.process
packaging_job.complete
packaging_material.read
packaging_exception.raise
```

Packaging sees only the operational information needed to package
authorized items.

Packaging must not automatically gain:

``` text
Product editing
Supplier selection
Retailer commercial terms editing
Settlement access
Intake approval
Dispatch completion
```

Detailed workflow is defined in a separate Packaging MD.

------------------------------------------------------------------------

## 6.6 DIDAR_DISPATCH

Responsible for shipment/handover operations.

Primary conceptual permissions:

``` text
dispatch_queue.read
shipment.read
shipment.assign
shipment.prepare
shipment.handover
shipment.ship
shipment.tracking.manage
shipment.invoice_manifest.read
shipment.weight_manifest.read
custody.transfer
otp.handover.send
otp.handover.verify
delivery_status.update
dispatch_exception.raise
```

Dispatch may only process:

``` text
authorized
allocated
packaged
release-eligible
```

items/shipments.

Dispatch must not:

``` text
Alter accepted commercial terms
Change Supplier
Generate fake UID
Mark undelivered goods as delivered without evidence
```

Detailed dispatch rules are defined separately.

------------------------------------------------------------------------

## 6.7 DIDAR_AGENT

Agent is an order-creation and field-sales role, not Order Ops.

Agent may operate through:

``` text
AGENT_SELL_BAG
AGENT_SAMPLE_BAG
AGENT_NO_BAG
```

and applicable assisted Retailer interactions.

Primary conceptual permissions:

``` text
catalog.read_agent
retailer.read_assigned
order.create_agent
order.read_own_agent_orders
sell_bag.read_own
sample_bag.read_own
field_activity.create
```

Agent must not automatically gain:

``` text
order.internal_approve
supplier.select
supplier_offer_internal.read
customer acceptance authority
global UID browsing
global retailer browsing
settlement execution
product publish
```

Direct-sale permissions are explicit and separate from order-taking
permissions.

`AGENT_SELL_BAG` direct sale requires:

``` text
sell_bag.sale.create
sell_bag.invoice.issue
```

`AGENT_SAMPLE_BAG` direct sale additionally requires:

``` text
sample item = SALE_ALLOWED
sample_bag.sale.create
sample_bag.invoice.issue
```

Without those conditions, Sample-Bag may only create an assisted Order
Request.

Agent operations must always preserve:

``` text
agent_id
source
retailer_id
actual creator
bag/custody reference when applicable
```

------------------------------------------------------------------------

### Agent on-behalf-of Retailer scope

For `AGENT_SAMPLE_BAG` and `AGENT_NO_BAG` assisted orders, the backend
must preserve:

``` text
retailer_id
agent_id
created_by = Agent
on_behalf_of_retailer = true
source
```

The Agent may only create the Order for an authorized/assigned Retailer.

Direct API manipulation of `retailer_id` to another Retailer
organization must fail.

## 6.8 DIDAR_FINANCE

Responsible for Settlement Policy administration, credit permission,
settlement execution oversight, ledger and reconciliation.

Primary conceptual permissions:

``` text
settlement_policy.read
settlement_policy.manage

retailer_credit_profile.read
retailer_credit_profile.manage

settlement_obligation.read
settlement_transaction.read
settlement_transaction.create
settlement_transaction.reverse_controlled

ledger.read
reconciliation.execute
```

Finance may:

``` text
Manage global initial settlement percent
Manage Rial payment window
Manage Retailer credit permission
View settlement obligations
Record/verify approved settlement transactions
Perform reconciliation
View calculated ledger balances
```

Finance must not automatically gain:

``` text
Product publish
Supplier selection
Warehouse intake
UID generation
Dispatch custody operations
```

Policy changes are audited and affect only future policy resolution;
they do not rewrite existing Proforma snapshots.

# 7. SUPPLIER ORGANIZATION ROLES

## 7.1 SUPPLIER_ADMIN

Administrator of one Supplier organization only.

Primary permissions:

``` text
supplier_profile.read_own
supplier_profile.update_limited

supplier_user.read_own
supplier_user.create_own
supplier_user.update_own
supplier_role.assign_own

supplier_product.read_own
supplier_offer.read_own
supply_order.read_own

supplier_reports.read_own
supplier_account_summary.read_own
```

Supplier Admin may manage authorized users inside its own Supplier
organization.

Supplier Admin must not gain:

``` text
Didar admin permissions
Other Supplier data
Retailer confidential data
Internal Didar sourcing comparisons
```

------------------------------------------------------------------------

## 7.2 SUPPLIER_PRODUCT_OPERATOR

Responsible for Supplier product/SKU and offer entry.

Primary permissions:

``` text
supplier_product.create_own
supplier_product.read_own
supplier_product.update_own_draft
supplier_product.submit_for_review

supplier_offer.create_own
supplier_offer.update_own
supplier_offer.submit_for_review

supply_order.read_product_context_own
```

Supplier Product Operator may enter:

``` text
Product/SKU information
Images
Supplier Offer
Weight / weight range
Making fee
Availability
Lead time
Other approved product fields
```

Supplier Product Operator cannot directly publish to B2B Catalog.

Conceptual workflow:

``` text
Supplier Product Operator
        ↓
Create / Edit
        ↓
SUBMIT
        ↓
Didar Product Ops
        ↓
Approve / Reject / Request Changes
        ↓
Publish
```

------------------------------------------------------------------------

## 7.3 SUPPLIER_ACCOUNTING

Responsible for Supplier financial/accounting visibility with Didar.

Primary permissions:

``` text
supplier_account.read_own
supplier_payment_terms.read_own
supplier_settlement.read_own
supplier_statement.read_own
supplier_invoice.read_own
supplier_financial_report.read_own
supply_order_financial_terms.read_own
```

Supplier Accounting may view:

``` text
Agreed Supply Order payment terms
Settlement status
Account statements
Open/closed financial positions
Supplier invoices
Permitted financial reports
```

This role does not automatically authorize:

``` text
Product editing
Supply Order operational confirmation
User administration
Other Supplier accounting data
Actual payment execution
```

Payment/settlement execution is defined separately.

------------------------------------------------------------------------

# 8. RETAILER ORGANIZATION ROLES

## 8.1 RETAILER_ADMIN

Administrator of one Retailer organization only.

Primary permissions:

``` text
retailer_profile.read_own
retailer_profile.update_limited

retailer_user.read_own
retailer_user.create_own
retailer_user.update_own
retailer_role.assign_own

retailer_dashboard.read_own
retailer_reports.read_own
retailer_order.read_own
retailer_account_summary.read_own
```

Retailer Admin may view the overall operational position of its own
Retailer organization.

Retailer Admin must not see:

``` text
Other Retailers
Supplier identities unless explicitly exposed by policy
Supplier Offer internals
Didar internal sourcing
Global inventory
Global UID lists
```

------------------------------------------------------------------------

## 8.2 RETAILER_ORDER_PROCUREMENT

Responsible for B2B ordering and order tracking.

Primary permissions:

``` text
catalog.read_retailer
order.create_own
order.read_own
order.update_own_pre_acceptance
order.submit_own

proforma.read_own
proforma.accept_own_if_authorized
proforma.decline_or_request_change_own

shipment.read_own
shipment.track_own
shipment.invoice_manifest.read_own
delivery.read_own
```

Retailer Order/Procurement may:

``` text
Browse Product catalog
Select Product
Enter quantity/requested specifications
Submit Order
Track Order
Review Proforma
Accept current valid Proforma if this role is granted acceptance authority
View shipment/delivery progress
```

Retailer Order/Procurement must not:

``` text
Choose Supplier
See Supplier split
Set internal sourcing method
Browse exact stock quantity
Browse globally available UID
Allocate Physical Item
Edit confirmed Order directly
```

After customer acceptance:

``` text
Retailer direct edit = blocked
Retailer change request = allowed
Didar controls cancellation/replacement
```

------------------------------------------------------------------------

## 8.3 RETAILER_ACCOUNTING

Responsible for financial/accounting visibility between Retailer and
Didar.

Primary permissions:

``` text
retailer_account.read_own
retailer_settlement_terms.read_own
retailer_settlement.read_own
retailer_statement.read_own
retailer_invoice.read_own
retailer_financial_report.read_own
```

Retailer Accounting may view:

``` text
Accepted settlement terms
Invoices/proformas as permitted
Settlement status
Account statement
Outstanding financial position
Financial reports
```

Retailer Accounting does not automatically gain:

``` text
Order editing
Catalog ordering
User administration
Supplier data
Actual settlement execution
```

------------------------------------------------------------------------

# 9. Organization Scope Rules

Every Supplier/Retailer-scoped API query must derive organization scope
from authenticated membership.

Unsafe pattern:

``` text
GET /orders?retailer_id=<client supplied arbitrary ID>
```

without authorization validation.

Required behavior:

``` text
Authenticated User
      ↓
Authorized Organization Membership
      ↓
Role / Permission
      ↓
Resource Scope
      ↓
Allowed Query / Mutation
```

Changing resource IDs manually must never expose another organization's
records.

------------------------------------------------------------------------

## 10. On-Behalf-Of Operations

Didar may perform selected actions on behalf of Supplier or Retailer
where the workflow explicitly permits it.

Examples:

``` text
Didar creates Intake on behalf of Supplier
Didar records Supplier confirmation with evidence
Didar creates CRM/phone Order on behalf of Retailer
```

Each such event must preserve:

``` text
business_owner_organization_id
actual_actor_user_id
actual_actor_organization_id = DIDAR
on_behalf_of = true
action
timestamp
evidence/reference when required
```

On-behalf-of capability must be permissioned separately.

It must never silently impersonate the external organization.

------------------------------------------------------------------------

# 11. Workflow-State Restrictions

Permission alone is not enough.

Examples:

``` text
Supplier Product Operator
CAN update Product
ONLY while editable/draft or changes-requested

Retailer Order/Procurement
CAN update Order
ONLY before accepted confirmation

Order Ops
CAN change Supplier freely
ONLY before Supplier commitment

Warehouse Intake
CAN allocate item to customer Order
ONLY after accepted Proforma and release gates

Dispatch
CAN ship
ONLY when item/shipment is release-eligible
```

Backend validation must enforce state restrictions.

------------------------------------------------------------------------

# 12. Initial Permission Namespace

Suggested stable permission naming:

``` text
domain.resource.action
```

Examples:

``` text
product.read
product.review
product.approve
product.publish

supplier_offer.read
supplier_offer.update

order.create
order.read
order.review
order.internal_approve
order.cancel

proforma.issue
proforma.accept

supply_order.create
supply_order.confirm
supply_order.cancel

intake.create
intake.inspect
intake.confirm

uid.generate
uid.print
uid.reprint

warehouse_location.assign

report.read
report.export

settlement_policy.read
settlement_policy.manage
retailer_credit_profile.read
retailer_credit_profile.manage
settlement_transaction.create
ledger.read
reconciliation.execute

user.manage
role.assign
```

Exact names may be adapted during implementation, but permissions should
remain granular and stable.

------------------------------------------------------------------------

# 13. High-Level Permission Matrix

Legend:

``` text
FULL     = full permitted scope for role
OWN      = own organization / own records only
ASSIGNED = assigned operational work only
LIMITED  = restricted subset
NO       = not permitted
```

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Capability             Super   Product Order Ops   Warehouse   Packaging   Dispatch          Agent   Supplier   Supplier    Supplier   Retailer   Retailer    Retailer
                         Admin       Ops                                                                  Admin    Product        Acct      Admin      Order        Acct
  ------------------ --------- --------- --------- ----------- ----------- ---------- -------------- ---------- ---------- ----------- ---------- ---------- -----------
  Product internal        FULL      FULL FULL          LIMITED          NO         NO        LIMITED        OWN        OWN          NO    LIMITED    LIMITED          NO
  read                                                                                                                                                       

  Product                 FULL      FULL NO                 NO          NO         NO             NO         NO         NO          NO         NO         NO          NO
  approve/publish                                                                                                                                            

  Supplier product        FULL        NO NO                 NO          NO         NO             NO        OWN        OWN          NO         NO         NO          NO
  create                                                                                                                                                     

  Retailer catalog        FULL      FULL FULL               NO          NO         NO        LIMITED         NO         NO          NO        OWN        OWN          NO

  Order create            FULL   LIMITED FULL               NO          NO         NO   OWN/ASSISTED         NO         NO          NO        OWN        OWN          NO

  Order                   FULL        NO FULL               NO          NO         NO             NO         NO         NO          NO         NO         NO          NO
  review/internal                                                                                                                                            
  approval                                                                                                                                                   

  Customer proforma      NO by        NO NO                 NO          NO         NO             NO         NO         NO          NO     OWN if     OWN if          NO
  accept               default                                                                                                            granted    granted 

  Supplier selection      FULL        NO FULL               NO          NO         NO             NO         NO         NO          NO         NO         NO          NO

  Supply Order read       FULL   LIMITED FULL          LIMITED          NO         NO             NO        OWN    LIMITED         OWN         NO         NO          NO
                                                                                                                             financial                       

  Intake operations       FULL        NO LIMITED          FULL          NO         NO             NO    LIMITED    LIMITED          NO         NO         NO          NO
                                                                                                            OWN        OWN                                   

  UID                     FULL        NO NO               FULL          NO         NO             NO         NO         NO          NO         NO         NO          NO
  generation/print                                                                                                                                           

  Packaging               FULL        NO LIMITED       LIMITED    ASSIGNED         NO             NO         NO         NO          NO         NO         NO          NO

  Dispatch                FULL        NO LIMITED       LIMITED     LIMITED   ASSIGNED             NO         NO         NO          NO         NO         NO          NO

  Supplier                FULL        NO LIMITED            NO          NO         NO             NO    LIMITED         NO         OWN         NO         NO          NO
  accounting                                                                                                                                                 

  Retailer                FULL        NO LIMITED            NO          NO         NO             NO         NO         NO          NO    LIMITED         NO         OWN
  accounting                                                                                                                                                 

  Reports                 FULL    DOMAIN DOMAIN         DOMAIN      DOMAIN     DOMAIN            OWN        OWN        OWN         OWN        OWN OWN orders         OWN
                                                                                                                   limited   financial                         financial

  User/role               FULL        NO NO                 NO          NO         NO             NO        OWN         NO          NO        OWN         NO          NO
  management                                                                                           supplier                          retailer            
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------

This matrix is conceptual. Exact API-level permissions must be validated
during implementation.

------------------------------------------------------------------------

# 14. Customer Acceptance Authority

Proforma acceptance is a sensitive permission and must not automatically
be granted to every Retailer user.

Suggested permission:

``` text
proforma.accept_own
```

Retailer Admin may grant this permission only through approved role
configuration.

Initial implementation options:

``` text
RETAILER_ADMIN
and/or
RETAILER_ORDER_PROCUREMENT
```

may receive acceptance authority.

The exact business rule for who is legally/operationally authorized to
accept must be finalized before live production.

Didar Order Ops, Agent, CRM operator or Supplier user must not
implicitly accept on behalf of the Retailer.

Assisted acceptance, if later allowed, requires explicit evidence and
audit.

------------------------------------------------------------------------

# 15. Reporting & Analytics Requirements

RBAC itself must be reportable.

Minimum reporting dimensions:

``` text
user
organization
organization_type
role
permission
resource
action
timestamp
actor
on_behalf_of
assignment
authorization_result
```

Minimum derivable reports:

``` text
Users by Organization
Users by Role
Users with multiple Roles
Role assignments over time
Disabled/active users
Didar internal access by role
Supplier users by organization
Retailer users by organization

Sensitive actions by actor
Product approvals
Order approvals
Proforma acceptances
Supplier confirmations
Intake confirmations
UID reprints
Controlled cancellations
On-behalf-of actions

Denied authorization attempts
Cross-organization access attempts
Role changes
Permission changes
```

Audit/security logging must not expose secrets or credentials.

------------------------------------------------------------------------

# 16. Audit Requirements

Audit at minimum:

``` text
User created
User disabled/enabled
Organization membership added/removed
Role assigned/removed
Permission configuration changed
Sensitive action performed
On-behalf-of action performed
Authorization override performed
Proforma acceptance performed
UID reprint performed
Controlled cancellation performed
```

Retain:

``` text
actor_user_id
actor_organization_id
target_user/resource
role/permission
action
timestamp
reason?
on_behalf_of?
before
after
```

------------------------------------------------------------------------

# 17. API Enforcement Requirements

Every protected backend route/action must validate:

``` text
Authentication
      ↓
Active user
      ↓
Organization membership
      ↓
Role
      ↓
Permission
      ↓
Resource organization scope
      ↓
Workflow-state rule
      ↓
Action
```

Frontend hiding is only convenience.

Direct API access must return authorization errors when access is not
permitted.

Filtering, expansions, exports and report endpoints must be
scope-protected.

------------------------------------------------------------------------

# 18. Frontend Navigation

The frontend should render navigation based on authorized capabilities.

Examples:

### Product Ops

``` text
Dashboard
Product Review
Products
Categories
Supplier Offers
Product Reports
```

### Order Ops

``` text
Order Queue
Orders
Proformas
Supply Planning
Supply Orders
Order Reports
```

### Warehouse Intake

``` text
Intake Queue
Physical Intakes
UID Labels
Warehouse Locations
Intake Reports
```

### Supplier Product Operator

``` text
My Products
My Offers
Submit Product
Supply Context
```

### Supplier Accounting

``` text
Account
Supply Order Terms
Invoices
Settlement Status
Financial Reports
```

### Retailer Order/Procurement

``` text
Catalog
New Order
My Orders
Proformas
Deliveries
Order Reports
```

### Retailer Accounting

``` text
Account
Settlement Terms
Statements
Invoices
Financial Reports
```

Navigation must not be treated as authorization enforcement.

------------------------------------------------------------------------

# 19. Definition of Done

`B2B-RBAC` is Done only when:

``` text
[ ] Organization model exists
[ ] User membership is scoped to Organization
[ ] Users may hold multiple roles
[ ] Didar roles are implemented
[ ] Supplier roles are implemented
[ ] Retailer roles are implemented
[ ] Role permissions are backend-enforced
[ ] Organization scope is backend-enforced
[ ] Cross-Supplier access is blocked
[ ] Cross-Retailer access is blocked
[ ] Workflow-state authorization is enforced
[ ] On-behalf-of actions retain actual actor
[ ] Product approval permissions work
[ ] Order Ops permissions work
[ ] Supplier Product permissions work
[ ] Supplier Accounting permissions work
[ ] Retailer Order permissions work
[ ] Retailer Accounting permissions work
[ ] Warehouse Intake permissions work
[ ] Agent restrictions work
[ ] Packaging/Dispatch scopes are assignable
[ ] Proforma acceptance authority is explicit
[ ] Direct API bypass attempts fail
[ ] Report/export scopes match operational scopes
[ ] Role/permission changes are audited
[ ] Sensitive actions are audited
[ ] Frontend navigation reflects permissions
[ ] Backend build succeeds
[ ] Frontend build succeeds
[ ] End-to-end RBAC tests pass
```

------------------------------------------------------------------------

# 20. Explicitly Out of Scope

Do not expand this MD into:

``` text
Detailed HR hierarchy
Payroll
SSO implementation
OTP implementation
Authenticator implementation
Password policy
Final legal acceptance/signature mechanism
Full packaging workflow
Full dispatch workflow
Settlement execution
Advanced ABAC/policy engine
Field-level encryption
SOC/SIEM implementation
```

These may be specified separately.

------------------------------------------------------------------------

# 21. Clean-Fork Rule

No user-role, permission, organization or authorization implementation
from the previous Didar project is automatically inherited.

Reuse must follow:

``` text
Inspect
→ Compare
→ Explicitly Approve
→ Reimplement or Selectively Port
```

------------------------------------------------------------------------

# 22. Implementation Package

This document defines:

**P04 --- B2B RBAC & Organization Scope**

Suggested first implementation sequence:

``` text
Organization
   ↓
Membership
   ↓
Role
   ↓
Permission
   ↓
Backend authorization middleware/policy
   ↓
Product permissions
   ↓
Order permissions
   ↓
Supplier/Retailer scope
   ↓
Frontend navigation
   ↓
Cross-organization security tests
```

The package is not complete until permissions are enforced by real
backend APIs and tested against unauthorized direct requests.

## CRM / Communication Permissions

``` text
crm.customer.read
crm.customer.read_assigned
crm.customer.manage
crm.contact.manage
crm.activity.read
crm.activity.create
crm.activity.update_own
crm.task.read
crm.task.create
crm.task.assign
crm.task.complete
crm.visit.read
crm.visit.create
crm.visit.assign
crm.visit.complete
crm.product_interest.read
crm.product_interest.create
crm.assignment.manage
crm.report.read

chat.read
chat.read_assigned
chat.send
chat.assign
chat.transfer
chat.resolve
chat.attachment.upload
chat.audit.read
```

## Campaign Permissions

``` text
campaign.read
campaign.create
campaign.update
campaign.activate
campaign.pause
campaign.cancel
campaign.audience.manage
campaign.assign
campaign.execute
campaign.report.read
```

## Retailer Enablement Permissions

``` text
retailer_collection.read
retailer_collection.create
retailer_collection.update
retailer_collection.publish
retailer_collection.archive
retailer_engagement.read_own
retailer_lead.read_own
enablement.aggregate.read
```

Retailer users are always scoped to their own
organization/Collections/consumer signals.

## AI Permissions

Conceptual capabilities:

``` text
ai.customer_summary
ai.conversation_summary
ai.next_best_action
ai.suggest_reply
ai.product_recommendation
ai.retailer_recommendation
ai.campaign_insight
ai.management_insight
```

AI permissions never expand underlying data access.

Mandatory rule:

``` text
User Scope
→ Permitted Data
→ AI Context
→ AI Output
```

An AI capability cannot retrieve a resource the requesting actor could
not retrieve through the corresponding authorized domain API.

## Dependency Coverage

This RBAC contract is cross-cutting for `CUSTOMER-CRM-CORE.md`,
`COMMUNICATION-CHAT.md`, `CAMPAIGN-MANAGEMENT.md`,
`RETAILER-SALES-ENABLEMENT.md` and `AI-SALES-INTELLIGENCE.md`.

Every new route/action from those specifications must map to an explicit
backend-enforced permission and organization/resource scope before the
feature can be PASSED.

## CMS Permissions

``` text
cms.page.read
cms.page.create
cms.page.update
cms.page.preview
cms.page.publish
cms.page.schedule
cms.page.rollback
cms.page.archive
cms.block.manage
cms.media.read
cms.media.upload
cms.media.update
cms.media.delete_safe
cms.journal.read
cms.article.create
cms.article.update
cms.article.publish
cms.navigation.manage
cms.external_experience.manage
cms.analytics.read
```

Editor and Publisher permissions may be separated. CMS authority does
not grant Product Ops, Campaign, CRM or commercial authority
automatically.
