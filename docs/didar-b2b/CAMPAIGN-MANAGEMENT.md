# CAMPAIGN-MANAGEMENT.md --- Didar CRM Campaign Management

**Status:** Draft v0.1\
**Track:** CRM03\
**Depends on:** CUSTOMER-CRM-CORE, PRODUCT-CORE, COMMUNICATION-CHAT,
REPORTING-FOUNDATION

## 1. Objective

**Additional cross-cutting/integration dependencies:** `B2B-RBAC.md`,
`AUTH-OTP-SECURITY.md`, `NOTIFICATION.md`,
`DIDAR-OPERATIONS-CONSOLE.md`, `AGENT-OPERATIONS.md`.

Create, target, execute and measure Retailer-facing sales/enablement
Campaigns. A Campaign can coordinate Products, Retailer audiences,
Agents, tasks, visits, messages and Retailer Enablement.

## 2. Lifecycle

Statuses:

``` text
DRAFT
SCHEDULED
ACTIVE
PAUSED
COMPLETED
CANCELLED
```

Objectives:

``` text
PRODUCT_DISCOVERY
RETAILER_ENGAGEMENT
DEMAND_VALIDATION
ORDER_GENERATION
REACTIVATION
```

## 3. Product Set

Campaign references approved Products. Do not duplicate mutable Product
truth except necessary historical snapshots.

## 4. Audience

Structured Retailer segmentation may use geography, relationship owner,
Retailer status, purchase recency/frequency, category/Product interest,
Campaign engagement and Order history.

Audience at activation must be reproducible/auditable.

## 5. Membership

Persist Campaign, Retailer, optional assigned Agent, status,
entry/last-touch and outcome.

## 6. Execution

Campaign may create CRM Tasks, Calls, Visits, Chat outreach, Product
Presentations and My Products suggestions.

## 7. Retailer Enablement

``` text
Didar Campaign
→ Target Retailer
→ suggested Product set
→ Retailer adds approved Products to My Products
→ shares Collection
→ Consumer Engagement
→ Campaign Analytics
```

Retailer controls its consumer-facing Collection.

## 8. Conversion

Event-based conversion:

``` text
RETAILER_ENGAGED
PRODUCT_INTEREST
COLLECTION_CREATED
COLLECTION_SHARED
CONSUMER_ENGAGEMENT
ORDER_REQUESTED
ORDER_CONFIRMED
```

Order conversion comes from Order Core.

## 9. Analytics

Targeted/reached/engaged Retailers, calls, visits, messages,
presentations, Collections, consumer views/interests, Retailer requests,
confirmed Orders and conversion rates.

## 10. Permissions

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

## 11. AI Boundary

AI may suggest audience, Product set, follow-up priority and performance
explanations. Human approval is required for Campaign
activation/material audience changes unless a later policy explicitly
permits automation.

## 12. Definition of Done

``` text
[ ] lifecycle/Product set
[ ] structured audience + activation snapshot
[ ] membership
[ ] CRM/Agent execution
[ ] Chat integration
[ ] Retailer Enablement handoff
[ ] real conversion events
[ ] analytics/RBAC/audit
[ ] Database → Backend → API → Frontend → Test
```

## CMS Landing Page Integration

Campaign may reference a `CONTENT-EXPERIENCE-CMS.md` `CAMPAIGN_LANDING`
Page.

Campaign remains authoritative for audience/execution/conversion. CMS
remains authoritative for presentation/version/publishing. Campaign
activation does not automatically publish a Draft CMS Page unless an
explicit authorized workflow coordinates both states.
