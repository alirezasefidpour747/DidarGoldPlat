# Didar Frontend Screen Inventory

Screen IDs are stable references for requirements, routes, API contracts and tests. Final URL paths may change through an approved routing decision.

## Public and guest screens

| ID | Screen | Primary capabilities | Owner/source |
|---|---|---|---|
| PUB-001 | Public landing/catalog | Approved catalog, search, filters, collections | K05 + MDM + Search |
| PUB-002 | Product detail | Product facts, assets, fineness, weight, public provenance | K05 + K06 |
| PUB-003 | Supplier directory | Eligible supplier summaries | K07 + K01 + K05 |
| PUB-004 | Supplier catalog | Approved products by eligible supplier | K05 + K07 |
| PUB-005 | Retailer storefront | Published eligible assortment | K11 + K05 + K09 |
| PUB-006 | Nearby retailers | Location choice, distance, availability freshness | K11 + K09 + location service |
| PUB-007 | Favourites | Guest/account favourites | K05 engagement + K01 |
| PUB-008 | Authentication | Sign-in, recovery, step-up, role/account selection | K03 + K01 |
| PUB-009 | Public authenticity/warranty lookup | Privacy-safe status lookup | K06 + K17 |

## Retailer portal

| ID | Screen | Required states/actions | Owner/source |
|---|---|---|---|
| RET-001 | Workspace | Actionable summaries and scoped navigation | Portal read models |
| RET-002 | Request basket | Quantity, removal, indicative terms warning | K10 draft |
| RET-003 | Request checkout | Contact/delivery data and validation | K10 + K01/K11 |
| RET-004 | Request review | Immutable submission preview, idempotent submit | K10 |
| RET-005 | Requests | Status, partial supply, rejection, revision | K10 |
| RET-006 | Request/quotation detail | Confirmed quantities, expiry, approve/revise | K10 + K13 + K14 |
| RET-007 | Orders | Approved orders and fulfillment status | K10 |
| RET-008 | Shipments | Shipment and POD timeline | K10 + K09/K16 |
| RET-009 | Invoices | Invoice/tax status and document | K13 |
| RET-010 | Sales returns | Request, receipt, inspection, credit/rejection | K10 + K09 + K13 + K15 |
| RET-011 | Settlements | Pending/completed/reconciled settlements | K16 + K15 |
| RET-012 | Gold/cash statement | Balances and immutable movements | K15 |
| RET-013 | Performance | Scoped BI metrics with refresh timestamp | BI |
| RET-014 | Warranty activation | Sale/item/consumer consent and OTP | K17 + K03 + K10 |
| RET-015 | Warranty lookup | Authorized scoped lookup | K17 |
| RET-016 | Retailer profile | Approved vs draft profile, documents, corrections | K01 + K02 + K11 |
| RET-017 | Storefront settings | Publish/hide and eligible assortment | K11 + K05 + K09 |
| RET-018 | Storefront preview | Customer-safe preview | Portal composition |

## Consumer portal

| ID | Screen | Required states/actions | Owner/source |
|---|---|---|---|
| CON-001 | Consumer workspace | Own items, warranties and service summaries | Portal read models |
| CON-002 | Owned items | Ownership-safe item list/detail | K17 + K06 |
| CON-003 | Warranty cards | Active/revoked/superseded card versions | K17 |
| CON-004 | Service requests | Create and track service/repair | K18 |
| CON-005 | Service detail | SLA, workshop-safe updates, evidence | K18 |
| CON-006 | Buyback/resale request | Eligible item, condition, evidence, consent | K19 + K17 |
| CON-007 | Buyback/resale detail | Valuation, assay, acceptance and settlement | K19 + K15/K16 |
| CON-008 | Favourites | Account favourites | K05 engagement + K01 |
| CON-009 | Nearby retailers | Product-aware retailer discovery | K11 + K09 |
| CON-010 | Privacy/preferences | Consent, notification and data requests | Shared privacy + K01 |

## Supplier portal

| ID | Screen | Required states/actions | Owner/source |
|---|---|---|---|
| SUP-001 | Supplier workspace | Profile/product/agreement/finance summaries | Portal read models |
| SUP-002 | Business profile | Legal identity, contacts, locations | K01 |
| SUP-003 | Qualification and licenses | Documents, scope, correction/review | K02 + K07 |
| SUP-004 | Agreements | Effective agreements and capacity eligibility | K07 |
| SUP-005 | Products | Own product drafts and review status | K05 |
| SUP-006 | Product editor | Classification, purity, weight, assets, capacity | K05 + MDM + file service |
| SUP-007 | Orders/commitments | Scoped operational demand | K10 + K07 |
| SUP-008 | Supplier invoices | Supplier financial documents | K13/K15 |
| SUP-009 | Supplier returns | Return and reconciliation status | K09/K13/K15/K16 |
| SUP-010 | Supplier settlements | Gold/cash settlement status | K16 + K15 |
| SUP-011 | Supplier statement | Immutable scoped account movements | K15 |
| SUP-012 | Supplier performance | Approved BI metrics | BI |

## Internal operational workspaces

| ID range | Workspace | Primary kernels |
|---|---|---|
| INT-01x | Identity/onboarding/organization administration | K01–K04 |
| INT-02x | Catalog, supplier and product approval | K04–K07 |
| INT-03x | Inbound, assay, quarantine, vault and inventory | K06, K08, K09 |
| INT-04x | Orders, fulfillment, agents and retail operations | K10–K12 |
| INT-05x | Pricing, invoicing, risk, credit and ledger | K13–K15 |
| INT-06x | Integration, settlement and reconciliation | K16 |
| INT-07x | Ownership, warranty and service operations | K17, K18 |
| INT-08x | Buyback, refurbishment, secondary listing and melt | K19, K20 |
| INT-09x | Audit, monitoring, MDM and BI | K04 + shared platform |

## Mandatory state matrix

For every screen above, its implementation record must specify:

- Allowed roles and organization/location scope
- Route and deep-link behavior
- Source APIs and data freshness
- Loading, empty, error, denied, expired-session and stale states
- Mutations, confirmation and idempotency behavior
- Audit-sensitive actions and step-up requirements
- Mobile/desktop layout and keyboard flow
- Test identifiers and acceptance criteria references
