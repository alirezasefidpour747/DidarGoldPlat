# RETAILER-SALES-ENABLEMENT.md --- My Products, Shareable Collections & Consumer Demand Signals

**Status:** Draft v0.1\
**Track:** EN01\
**Depends on:** PRODUCT-CORE, CUSTOMER-CRM-CORE, CAMPAIGN-MANAGEMENT,
AUTH-OTP-SECURITY, REPORTING-FOUNDATION

## 1. Objective

**Additional cross-cutting/integration dependencies:** `B2B-RBAC.md`,
`NOTIFICATION.md`, `UI-FOUNDATION.md`, `B2B-STOREFRONT-UX.md`; future
Order conversion references `ORDER-CORE.md`.

Enable each Retailer to select Didar Products, create shareable
Collections, send them to its customers and capture demand signals
before or alongside purchasing inventory.

This is Retailer enablement, not the future Didar B2C marketplace.

## 2. My Products

Inside My Didar:

``` text
My Products
├── Saved Products
├── Collections
├── Shared Pages
├── Consumer Engagement
└── Leads / Demand Signals
```

## 3. Collection

Persist Retailer, name/description, status, creator/timestamps. Items
reference authoritative Product IDs plus rank and optional Retailer
note.

Statuses: `DRAFT`, `PUBLISHED`, `ARCHIVED`.

## 4. Shareable Page

Published Collection receives a non-guessable public
identity/token/slug.

Share methods:

``` text
Copy Link
WhatsApp share intent
Telegram share intent
SMS link
QR Code
```

Messaging-provider integration is not required merely for share intents.

## 5. Retailer Ownership Boundary

Every public interaction is attributed to:

``` text
originating_retailer_id
collection_id
product_id
```

Didar must not silently redirect the Retailer's consumer into another
Retailer's commercial context.

`B2B Retailer Enablement Consumer ≠ future Didar B2C Customer`.

## 6. Consumer Access

Initial browsing/reaction may be anonymous/session-based. Account
creation is not mandatory for simple preference signals.

Consumer session must not expose B2B/internal data.

## 7. Reactions

Initial signals:

``` text
VIEW
LIKE
DISLIKE
STRONG_INTEREST
WANT_TO_SEE
```

Reaction is a demand signal, not an Order or sale.

## 8. Lead Capture

When stronger contact intent is requested, collect only approved fields
such as name/mobile with appropriate consent.

Persist:

``` text
originating_retailer_id
collection_id
product_id?
consumer_session_id
contact data where supplied
interest type
created_at
```

Lead belongs to the originating Retailer context. Access is scoped
accordingly.

## 9. Retailer Analytics

Retailer sees only its own:

``` text
views
unique sessions
reactions
strong interests
leads
top Products
Collection performance
```

## 10. Didar Aggregate Intelligence

Authorized Didar roles may analyze permitted aggregate signals across
Retailers:

``` text
Product presentations
consumer views
interest rate
Retailer requests
actual Orders
```

Retailer-specific consumer data must remain scope-protected.

## 11. Ask My Customers / Demand Validation

Retailer can publish a Collection specifically to ask customers which
Products they prefer before ordering.

This supports demand validation, not guaranteed demand forecasting.

## 12. Campaign Integration

Didar Campaign may suggest Products. Retailer chooses whether to add
them to My Products/Collection. Consumer engagement returns as Campaign
signals.

## 13. Consumer Shopping Assistant

A future/AI-enabled assistant may help the consumer choose among
Products available in the originating Retailer's permitted
Collection/context.

It must not bypass the Retailer by recommending another Retailer's
commercial context.

## 14. Permissions

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

## 15. Security

Share identities are non-guessable/revocable. Public endpoints are
strict allowlisted DTOs. Apply rate limiting/abuse controls and never
expose Supplier/internal stock/UID/CRM data.

## 16. Reporting

Dimensions: Retailer, Collection, Product, Campaign, session, reaction,
lead, time. Measures: views, unique sessions, reactions, strong
interest, leads, shares and downstream Retailer requests/Orders.

## 17. Definition of Done

``` text
[ ] My Products
[ ] Collections
[ ] secure public page
[ ] share intents + QR
[ ] anonymous/session engagement
[ ] reactions
[ ] scoped lead capture
[ ] Retailer analytics
[ ] Didar authorized aggregate analytics
[ ] Campaign integration
[ ] Retailer ownership boundary
[ ] RBAC/security/audit
[ ] Database → Backend → API → Frontend → Test
```
