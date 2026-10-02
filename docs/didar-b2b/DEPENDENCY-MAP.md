# DEPENDENCY-MAP.md --- Didar B2B Domain Dependency Map

**Status:** Current\
**Date:** 2026-10-02

## 1. Dependency Rule

Dependencies are classified as:

``` text
HARD
    The domain requires the upstream contract/data to function.

CROSS-CUTTING
    Shared authorization, security, reporting, notification or UI foundation.

EVENT / INTEGRATION
    The domain may consume events/references from another domain, but the upstream
    domain must not become runtime-dependent on the consumer.

FUTURE / OPTIONAL
    Integration is designed for but does not block the current package.
```

Avoid circular hard dependencies.

## 2. Foundation

``` text
UI-FOUNDATION
B2B-RBAC
AUTH-OTP-SECURITY
REPORTING-FOUNDATION
NOTIFICATION
```

These are cross-cutting contracts. Feature packages implement only the
portions needed by their current vertical slice.

## 3. Commerce Track

``` text
P01 PRODUCT-CORE
   ↓
P02 ORDER-CORE
   ↓
P03 SUPPLY-ORDER
   ↓
P04 PHYSICAL-INTAKE
   ↓
P06 PACKAGING-FULFILLMENT
   ↓
P07 DISPATCH-DELIVERY

P09 SETTLEMENT-CORE
   ↓
P10 INVOICE-BILLING
```

`P05 B2B-RBAC`, `P11 AUTH-OTP-SECURITY`, `P12 NOTIFICATION` are numbered
business packages but minimum enforcement/foundations are used earlier
when required.

`WAREHOUSE-INVENTORY` and `PACKAGING-INVENTORY` remain
optional/deferred.

## 4. Customer / CRM Track

### CRM01 --- CUSTOMER-CRM-CORE

Hard:

``` text
Retailer organization identity from B2B platform
PRODUCT-CORE for Product presentation/interest references
```

Cross-cutting:

``` text
B2B-RBAC
AUTH-OTP-SECURITY
REPORTING-FOUNDATION
NOTIFICATION
UI-FOUNDATION
DIDAR-OPERATIONS-CONSOLE
```

Event/integration consumers:

``` text
ORDER-CORE
INVOICE-BILLING
DISPATCH-DELIVERY
SETTLEMENT-CORE
```

CRM may project authorized events from those domains. Those domains do
not depend on CRM to complete their own transaction.

### CRM02 --- COMMUNICATION-CHAT

Hard:

``` text
CUSTOMER-CRM-CORE
```

Reference dependencies:

``` text
PRODUCT-CORE
ORDER-CORE
CAMPAIGN-MANAGEMENT when available
```

Cross-cutting:

``` text
B2B-RBAC
AUTH-OTP-SECURITY
NOTIFICATION
REPORTING-FOUNDATION
UI-FOUNDATION
DIDAR-OPERATIONS-CONSOLE
B2B-STOREFRONT-UX
```

### CRM03 --- CAMPAIGN-MANAGEMENT

Hard:

``` text
CUSTOMER-CRM-CORE
PRODUCT-CORE
```

Execution integration:

``` text
COMMUNICATION-CHAT
AGENT-OPERATIONS
```

Cross-cutting:

``` text
B2B-RBAC
AUTH-OTP-SECURITY
NOTIFICATION
REPORTING-FOUNDATION
DIDAR-OPERATIONS-CONSOLE
```

Downstream consumer:

``` text
RETAILER-SALES-ENABLEMENT
```

Campaign Core does not hard-depend on Enablement; it can run without My
Products.

## 5. Agent Track

### P08 --- AGENT-OPERATIONS

Hard for full CRM-enabled Agent Workspace:

``` text
CUSTOMER-CRM-CORE
PRODUCT-CORE
ORDER-CORE
```

Integrated:

``` text
COMMUNICATION-CHAT
CAMPAIGN-MANAGEMENT
```

Existing operational dependencies remain:

``` text
UID / Physical Item
Invoice
Packaging / Dispatch where custody applies
Settlement permissions where relevant
```

Agent sales modes remain Sell-Bag, Sample-Bag and No-Bag.

## 6. Retailer Enablement

### EN01 --- RETAILER-SALES-ENABLEMENT

Hard:

``` text
PRODUCT-CORE
CUSTOMER-CRM-CORE
```

Integrated:

``` text
CAMPAIGN-MANAGEMENT
COMMUNICATION-CHAT where consumer/Retailer messaging is used
```

Cross-cutting:

``` text
B2B-RBAC
AUTH-OTP-SECURITY
NOTIFICATION
REPORTING-FOUNDATION
UI-FOUNDATION
B2B-STOREFRONT-UX
```

Future Order conversion:

``` text
ORDER-CORE
```

My Products can exist before Order integration; consumer interest is not
an Order.

## 7. AI Track

### AI01 --- AI-SALES-INTELLIGENCE

AI is downstream. It must not become a prerequisite for core
transactions.

Potential authorized sources:

``` text
CUSTOMER-CRM-CORE
COMMUNICATION-CHAT
CAMPAIGN-MANAGEMENT
RETAILER-SALES-ENABLEMENT
PRODUCT-CORE
ORDER-CORE
AGENT-OPERATIONS
INVOICE-BILLING
DISPATCH-DELIVERY
SETTLEMENT-CORE where permission permits
```

Cross-cutting:

``` text
B2B-RBAC
AUTH-OTP-SECURITY
REPORTING-FOUNDATION
```

Mandatory security direction:

``` text
Actor
→ RBAC / Resource Scope
→ Domain APIs
→ AI Context
→ AI Output
→ optional authorized Domain Action
```

Core domains never depend on AI to remain operational.

## 8. Event Direction

Preferred integration direction:

``` text
Core Domain writes authoritative state
        ↓
Domain Event / Structured Reference
        ↓
CRM Timeline / Reporting / Notification / AI
```

Do not make Order, Invoice, Shipment or Settlement transactions fail
merely because CRM, Campaign, Notification or AI is temporarily
unavailable, unless a specific business rule explicitly requires
synchronous confirmation.

## 9. UI Surfaces

``` text
Retailer Storefront / My Didar
    ← PRODUCT-CORE
    ← ORDER-CORE
    ← COMMUNICATION-CHAT
    ← RETAILER-SALES-ENABLEMENT
    ← Retailer-facing Campaign participation
    ← RETAILER COPILOT

Didar Operations Console
    ← Product Ops
    ← Order Ops
    ← CRM
    ← Campaign
    ← Agent Ops
    ← Finance
    ← AI Insights

Supplier Portal
    ← PRODUCT-CORE
    ← SUPPLY-ORDER
    ← Supplier accounting/reporting

Agent Workspace
    ← CUSTOMER-CRM-CORE
    ← COMMUNICATION-CHAT
    ← CAMPAIGN-MANAGEMENT
    ← AGENT-OPERATIONS
```

## 10. Implementation Order Guidance

Do not renumber P01--P12.

Recommended additional-track sequence:

``` text
P01 Product may finish independently
        ↓
CRM01 Customer CRM Core
        ↓
CRM02 Communication Chat
        ↓
CRM03 Campaign Management
        ↓
EN01 Retailer Sales Enablement
        ↓
AI01 AI Sales Intelligence
```

`P02 ORDER-CORE` may proceed in parallel after P01 according to the
commerce roadmap.

Before implementing any package, Work must read this dependency map plus
the package's own MD and all HARD/CROSS-CUTTING specifications relevant
to that vertical slice.

## CMS Track

### CMS01 --- CONTENT-EXPERIENCE-CMS

Hard/reference:

``` text
UI-FOUNDATION
PRODUCT-CORE for Product/Category blocks
```

Cross-cutting:

``` text
B2B-RBAC
AUTH-OTP-SECURITY
REPORTING-FOUNDATION
B2B-STOREFRONT-UX
DIDAR-OPERATIONS-CONSOLE
```

Integrated:

``` text
CAMPAIGN-MANAGEMENT for Campaign landing pages
RETAILER-SALES-ENABLEMENT for approved visual primitive reuse
```

CMS is downstream of Product Core. Product Core does not depend on CMS.

CMS must not become a hard dependency for Order, Supply, Intake,
Settlement, Invoice, Packaging or Dispatch.

``` text
PRODUCT-CORE
     ↓
CMS01 Content Experience
     ↓
Maison / Journal / Landing Pages
```
