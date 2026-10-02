# CUSTOMER-CRM-CORE.md --- Didar Customer Relationship Management Core

**Status:** Draft v0.1\
**Track:** CRM01\
**Date:** 2026-10-02

## 1. Objective

**Cross-cutting dependencies:** `PRODUCT-CORE.md`, `B2B-RBAC.md`,
`AUTH-OTP-SECURITY.md`, `REPORTING-FOUNDATION.md`, `NOTIFICATION.md`,
`UI-FOUNDATION.md`, `DIDAR-OPERATIONS-CONSOLE.md`. Didar CRM is a
first-class platform capability. It preserves the institutional
relationship history between Didar and each Retailer so telephone sales,
field Agents, Order Ops and authorized management can continue the same
relationship.

``` text
Retailer → Customer 360
├── Contacts
├── Relationship Ownership / Assignments
├── Activities
├── Tasks / Follow-ups
├── Visits / Meetings
├── Product Presentations / Interests
├── Conversations
├── Campaign Membership
├── Orders / Proformas / Invoices / Shipments
└── Authorized Settlement Summary
```

## 2. Identity

The B2B CRM Customer is normally the authoritative Retailer
organization. Do not create a duplicate CRM-only Retailer identity.

A Retailer may have multiple Contacts:

``` text
contact_id
retailer_id
name
role/title?
mobile?
phone?
email?
preferred_channel?
is_primary
status
```

## 3. Customer 360

Authorized sections:

``` text
Overview
Contacts
Timeline
Activities
Tasks
Follow-ups
Visits
Product Interests
Product Presentations
Conversations
Campaigns
Orders
Proformas
Invoices
Shipments
Settlement Summary
Reports
```

Visibility is role/permission based.

## 4. Ownership and Assignment

Support primary relationship owner, CRM user, field Agent/team
assignment and assignment history. Reassignment never rewrites
historical actors.

## 5. Activities

Initial types:

``` text
PHONE_CALL
IN_PERSON_VISIT
MEETING
NOTE
MESSAGE
PRODUCT_PRESENTATION
PRODUCT_INTEREST
TASK_COMPLETED
FOLLOW_UP
CAMPAIGN_TOUCH
ORDER_EVENT
SYSTEM_EVENT
```

Persist retailer, type, actual actor, time, outcome and structured
related Product/Order/Campaign/Conversation references.

## 6. Tasks / Follow-ups

Task stores Retailer, type, title, assignee, due date, priority, status,
related resources, creator, completion and outcome.

Statuses:

``` text
OPEN
IN_PROGRESS
COMPLETED
CANCELLED
OVERDUE
```

## 7. Visits

Persist planned/actual times, Agent, purpose, status, outcome, notes,
Products presented, Campaign and resulting Order reference.

Statuses:

``` text
PLANNED
CONFIRMED
IN_PROGRESS
COMPLETED
CANCELLED
NO_SHOW
```

## 8. Product Presentation and Interest

A Product presentation is a structured CRM event.

Retailer reaction:

``` text
PRESENTED
INTERESTED
STRONG_INTEREST
NOT_INTERESTED
FOLLOW_UP
REQUESTED
```

Interest is not an Order.

## 9. Timeline

Customer Timeline projects authorized events from CRM and other
authoritative domains. It does not replace those records.

## 10. Continuity

Telephone CRM User can record a need and assign a visit. Field Agent
opens the same Customer 360, sees permitted history, performs the visit,
records Product reactions and creates permitted sales actions.

## 11. Agent / Order Integration

CRM references Agent Operations and Order Core; it does not duplicate
their state.

## 12. Campaign / Chat Integration

Campaign touches, Conversations, Messages and outcomes link to Customer
360. Important communication outcomes may create explicit
Activities/Tasks.

## 13. Sarv Boundary

``` text
Didar CRM Core ↔ CRM Integration Adapter ↔ Sarv
```

Core Didar workflows must not depend directly on Sarv-specific
IDs/availability. Sync/conflict rules require a later integration
specification.

## 14. Permissions

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
```

## 15. UI

Didar Operations Console:

``` text
Customers / CRM
├── Customers
├── My Customers
├── Activities
├── Tasks
├── Follow-ups
├── Visits
└── Assignments
```

Customer detail is Customer 360. Agent Workspace consumes the same Core
with narrower scope.

## 16. Reporting / Audit

Report by Retailer, Contact, Owner, Agent, Activity Type, Task, Visit,
Product, Campaign, Order, time and outcome. Audit assignments,
activities, task/visit outcomes and visibility changes.

## 17. Definition of Done

``` text
[ ] authoritative Retailer identity reused
[ ] Customer 360
[ ] Contacts
[ ] assignment history
[ ] Activities/calls
[ ] Tasks/follow-ups
[ ] Visits
[ ] Product presentation/interest
[ ] telephone/field continuity
[ ] Order/Campaign/Chat references
[ ] organization scope
[ ] reporting/audit
[ ] Database → Backend → API → Frontend → Test
```
