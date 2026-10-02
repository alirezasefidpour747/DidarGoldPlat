# Unified Product Architecture Decision

**Decision date:** 2026-09-23  
**Status:** Architecture baseline for planning; Package 3A owner decisions are approved, with D44–D46 legally conditional; all other policies explicitly listed as open remain unapproved  
**Scope:** Legacy PRD, K01–K20, PostgreSQL blueprint, frontend product requirements, screen inventory, capability-contract map, acceptance criteria and the interactive prototype

## 1. Executive decision

Didar is one product composed of authoritative transactional kernels, shared platform services, governed data/analytics services, external adapters and role-specific portals. K01–K20 are the authoritative transactional core, but they do not by themselves replace every legacy PRD capability. Portals may initiate commands and compose approved facts; they may not create another source of truth.

The legacy naming conflicts are resolved for architecture planning as follows:

- `M29` means Escrow. A gallery is a portal composition over K05 catalog, K09 availability and K11 eligibility; it is not a master entity.
- `M6` means Seller Portal. No wallet capability or wallet claim is approved. Any future stored-value or wallet product requires a separate licensing, legal, custody, ledger and provider decision; K15/K16 provide reusable accounting/integration primitives only.
- `F21` means Loyalty. Loyalty remains deferred. Disputes are not `F21`; protected business decisions use K04 approval/evidence, while an independent legal case workflow still needs an owner, identifier and contract.
- K17 owns ownership interests, warranty policy/entitlement, activation, warranty-card truth and warranty eligibility decisions. K18 owns service/repair execution.
- K19 owns second-hand acquisition, assay-linked valuation, offer and payout intent. K20 owns refurbishment, certified-pre-owned processing/listing facts, secondary processing, melt and genealogy. K09 alone changes physical custody.
- K01 owns organization identity; K07 supplier agreements and qualification facts; K05 catalog/product truth; K13 rate/pricing/invoice truth; K06 item identity/provenance; K04 approvals and decision evidence; portals presentation only.

These decisions resolve the architecture owner/name ambiguity in C01–C09. Package 3A additionally approves D02, D04, D05, D06, the 3A portion of D47, versioned API compatibility and clean empty-database cutover; D44–D46 are approved conditionally on final legal/privacy details. Other D02–D48 business rules, provider contracts, regulated financial products, legal transfer rules and production release remain unapproved.

## 2. Evidence and reconciliation method

The decision uses the following sources together:

- `docs/architecture/prd-gap-summary-fa.md`
- `docs/architecture/prd-to-k01-k20-traceability.md`
- `docs/architecture/postgresql-blueprint-k01-k20.md`
- `docs/architecture/phase-01-owner-decisions.md`
- `docs/Product/frontend-requirements.md`
- `docs/Product/frontend-screen-inventory.md`
- `docs/Product/frontend-api-contract-map.md`
- `docs/Product/frontend-acceptance-criteria.md`
- `docs/Product/prototypes/didar-offline-hearts.html`
- Package 1/2 implementation reports and the production-readiness baseline where current maturity affects sequencing

The repository path is case-sensitive and the product documents are under `docs/Product/`, not `docs/product/`. The optional `docs/architecture/prototype-to-k01-k20-traceability.md` is absent as of this decision. Its absence is not treated as approval or evidence.

The prototype was inspected only for journeys and interaction concepts. Its seeded products, role switching, demo sign-in, arrays, local browser storage, generated IDs, local totals, sample balances, fictional availability, file previews and simulated lifecycle transitions are explicitly rejected as API, persistence, authorization, pricing, inventory or security contracts.

## 3. Authoritative K01–K20 boundary

| Kernel | Authoritative facts and commands | Portal-visible use | Explicit boundary |
|---|---|---|---|
| K01 | Person, legal organization, location, contact, membership and identity-document metadata | Profiles, organization/location selection and approved identity snapshots | No credentials, permissions, supplier agreement or commercial balance |
| K02 | Onboarding applications, verification checks, trust-tier assignments and commercial entitlements | Application, correction and review status | Account creation is not KYC/KYB approval; tier is not authorization |
| K03 | Auth-account mapping, sessions, MFA factors, security events and RBAC grants | Sign-in, recovery, step-up and current server-derived scope | No party demographics or commercial eligibility |
| K04 | Approval policies, maker-checker requests/steps, governed exceptions and audit anchors | Approval queues and decision evidence | Approval authorizes a command; it does not write another kernel's fact. A legal dispute-case aggregate is not yet approved |
| K05 | Product family, product, variant/SKU, approved assets, capacity offer references and product commercial rules | Catalog, product detail, supplier product drafts/review | No serialized stock, live availability or market rate |
| K06 | Serialized item/passport identity, identifiers, assay/QC evidence and provenance events | Authenticity lookup and privacy-safe provenance | No current custody or consumer ownership master |
| K07 | Supplier qualification facts, agreements, supplier-specific collateral, capacity eligibility and supplier performance history | Supplier directory, agreements and qualification views | Legal organization identity stays in K01; product truth stays in K05 |
| K08 | Inbound shipment, measurement, assay, quarantine and acceptance/receipt | Internal intake and quality workspaces | Accepted ongoing custody moves to K09 |
| K09 | Physical location, container, serialized inventory, availability, movement, custody transfer and stock audit | Availability, shipment custody and returns receipt | Does not infer legal ownership or accounting balance |
| K10 | Request/order, lines, reservation purpose, fulfillment package, delivery and POD workflow | Basket submission, quotation/order journey and returns command orchestration | Rate/invoice is K13, on-hand is K09, credit is K14. Sales-return aggregate is a required extension |
| K11 | Retailer lifecycle, effective terms, eligible assortment/basket and approved exceptions | Retailer eligibility and storefront controls | Cannot widen K02 entitlement or K14 credit. Storefront publication/composition is a required extension/read model |
| K12 | Field-agent operational role, territory/store assignment, visit evidence, proxy-order draft and aged-stock action workflow | Internal field operations and aged-stock actions | No identity, custody or final order ownership |
| K13 | Rate observations, governed calculation policy, quote locks, wages/fees, invoices, tax submissions and corrections | Quotes, invoices and immutable pricing facts | Sole rate/calculation authority; no client calculation |
| K14 | Credit account, limit, exposure reservation, buyer collateral and approved override | Viewer-safe risk/credit status | No ledger balance or supplier collateral master |
| K15 | Chart of accounts, journal vouchers/entries, periods, netting and reconciliation links | Gold/cash statements and server-calculated balances | No editable balance and no provider finality |
| K16 | External endpoint/mapping, dispatch attempt, external document, settlement orchestration and reconciliation | Pending/retrying/failed/reconciled states | A local status is not provider success; escrow requires a licensed external model |
| K17 | Ownership claims/interests/transfers, warranty policy, entitlement/card, activation, stolen state and warranty eligibility decision | Owned items, warranty card/lookup/activation and claim decision | No physical custody and no service execution |
| K18 | Service ticket, SLA/stage, workshop assignment, service custody-stage evidence, weight audit and service settlement intent | Service request/detail | Warranty truth comes from K17; custody movement from K09; postings from K15 |
| K19 | Buyback case, assay snapshot, valuation, offer, acceptance, payout intent and routing decision | Buyback/resale request and valuation/settlement view | Uses K13 rate; K16 provider acknowledgement; does not own downstream processing |
| K20 | Refurbishment job/QC, CPO/secondary facts, melt batch, mass balance, recovered-gem genealogy | Secondary listing facts and circular processing | K09 owns custody; K06 issues/links item identities; K19 remains acquisition source |

## 4. Capabilities outside K01–K20

| Layer | Belongs here | Must not become |
|---|---|---|
| Shared security/platform | Tenant context, object registry, short-lived file access, malware scan state, central audit, privacy/consent/DSR controls, notification/challenge service, idempotency, retention/legal hold, secrets/KMS, observability, backup/restore | A duplicate business master or caller-controlled actor/scope store |
| PaaS/EventMesh/search | API gateway/version policy, transactional outbox delivery, inbox deduplication, schema compatibility, retry/dead-letter, ACL-safe indexing, reindex/replay and freshness metadata | An authoritative order, product, party, price or ownership store |
| MDM | Governed reference dictionaries, taxonomy codes, localized labels, units/material classifications, stewardship and effective versions | Product/SKU master or transaction history |
| BI/Risk Analytics | Reconciled facts/dimensions, metric catalog, lineage, dashboards, forecasts, anomalies and advisory recommendations | A command owner or unreviewed mutation path |
| External integrations | OIDC/KYB, laboratory/device, RFID, market-rate, tax/Moaddian, ERP/CRM, bank/PSP/custodian/escrow, courier/insurer, bureau/lender adapters and provider acknowledgements | A fabricated success or locally asserted regulated service |
| Frontend/portals | Navigation, forms, validation feedback, localization, accessibility, responsive presentation, URL filters, guest non-sensitive favourites/basket, preview and composition of approved facts | Identity, catalog, inventory, price, balance, ownership, approval, eligibility or workflow truth |

## 5. Frontend requirements that extend a kernel or platform capability

| Required frontend capability | Required extension | Proposed owner | Approval state |
|---|---|---|---|
| Account favourites and guest merge | Durable idempotent engagement aggregate; tombstone/access filtering | K05 catalog engagement linked to K01, unless a dedicated engagement service is approved | Owner confirmation required; not present in the 129-table blueprint |
| Sales returns | Return case/state machine with original order/invoice/items, evidence, inspection and exactly-once inventory/financial consequences | K10 command owner; K09/K13/K15/K16 participants | Required but absent from approved OpenAPI and blueprint table catalog |
| Retailer storefront settings | Effective publication status, eligible assortment/order and safe public read model | K11 command owner; portal composition over K05/K09 | Required extension; gallery is not a new master |
| Nearby retailers | Consent-aware manual/geolocation query, privacy policy and freshness/non-guarantee semantics | K11 query with K09 and shared location service | Contract and retention decision absent |
| Privacy/preferences/DSR | Consent, channel preferences, access/correction/export/restriction workflow | Shared privacy platform, K01 subject reference | D44–D46 direction approved for 3A, but exact legal procedures/deadlines and UOD-008 remain open |
| Supplier draft/review | Explicit draft/submission/revision/rejection/publication states and SoD | K05 with K04; K07 eligibility, MDM taxonomy, file service | Capability designed, production contract absent |
| File upload/preview | Authorized upload completion, digest/type/size validation, scan and short-lived access | Shared object/file service | D06 storage boundary approved; D44–D46 exact legal details and file-service contract remain open |
| Warranty activation challenge | Real single-use challenge and consent evidence | K17 command; K03/shared notification support | D09/D10/D17/D37/D38 and contract absent |
| Legal disputes | Legal case intake, parties, evidence, deadlines, remedies, appeals and links to protected domain decisions | Separate legal case workflow; K04 only approval/evidence | Owner/identifier/legal policy absent; must not be hidden inside F21 |
| Feedback/survey | Consented survey, moderation, case routing and retention | Portal intake plus K18/CRM case and BI | `MISS`/deferred; owner not approved |

## 6. Conflict disposition

| Conflict | Architecture disposition | Remaining non-architecture decision |
|---|---|---|
| C01 M29 gallery vs escrow | Resolved: M29=Escrow; gallery=portal composition | Licensed escrow/provider/segregation/release/dispute rules D21/D35/D36 |
| C02 M6 panel vs wallet | Resolved: M6=Seller Portal; wallet removed from claimed scope | Whether to offer a regulated wallet at all; legal/licensing/provider/accounting model |
| C03 F21 loyalty vs disputes | Resolved: F21=Loyalty, deferred; dispute gets a separate identifier/workflow | Legal case owner, remedies, appeal, retention and integration boundary |
| C04 warranty/service overlap | Resolved: K17 truth/eligibility/card; K18 execution | Warranty and service policies D37–D39 |
| C05 second-hand overlap | Resolved: K12 aging, K19 acquisition/valuation, K20 processing, K09 custody, portal listing | Legal marketplace model, state transitions and consumer disclosures D40–D43 |
| C06 gallery ownership | Resolved: K05 catalog, K09 availability, K11 eligibility, K10 commerce, BI recommendation, portal composition | Publication/moderation policy and K11 extension contract |
| C07 pricing overlap | Resolved: K13 authority; K19/K20 immutable snapshots/deductions | Rate, rounding, deduction and override policies D27–D30/D41 |
| C08 audit/trace overlap | Resolved: K06 item provenance; K04 decisions; K15 domain ledger; platform actor/control audit | Evidence admissibility, retention, access and anchoring D12/D44–D46 |
| C09 supplier/brand overlap | Resolved: K01 identity; K07 agreement; K05 catalog; portal interaction | D02/D04 are approved for 3A; cross-tenant identity and organization/brand taxonomy, capacity and verification remain D03/D13/D14 |

The ten rows whose evidence status is `CONFLICT` remain labelled as such in the 143-row historical coverage matrix so the original contradictions are auditable. This decision register supplies their forward disposition; it does not rewrite the historical evidence status.

## 7. Missing capabilities and production blockers

### Backend required by the frontend

- No approved, versioned OpenAPI specification was found for the frontend mutations or queries. The capability map explicitly says its example paths are non-binding.
- K01 is the only durable PostgreSQL pilot. K02/K03 retain legacy JSON paths and K04–K20 are predominantly process-memory/demo behavior.
- Production AuthN, session validation, server-derived actor context, organization/location RBAC, RLS, four-eyes approval, central audit, idempotency and outbox/inbox are not implemented end to end.
- Favourites, sales returns, storefront publication/assortment, consent/preferences/DSR, notification delivery receipts, feedback/surveys and legal dispute cases lack complete production domain contracts.
- Search, MDM distribution, BI datasets/metric contracts, object storage/file scanning and external provider adapters are not production-capable.
- Provider finality, reconciliation and licensed escrow/wallet/lending models are absent; local/demo statuses cannot be used.

### Frontend surfaces required by K01–K20 but not concretely inventoried

The `INT-01x`–`INT-09x` entries are ranges, not testable screen specifications. Concrete screen IDs are still required for K02 review/checklists; K03 account/session/MFA/RBAC administration; K04 approvals/exceptions/audit export; K06 passport issuance/revocation; K07 agreement/capacity/collateral; K08 intake/assay/quarantine; K09 movements/transfers/counts; K10 allocation/POD exceptions; K11 terms/exceptions; K12 territory/visit/proxy order; K13 rate approval/quote/invoice/tax correction; K14 limit/collateral/exposure/override; K15 vouchers/period/netting/reconciliation; K16 adapter operations/exceptions; K17 ownership transfer/stolen/warranty policy/claims; K18 workshop/weight/settlement; K19 compliance/assay/valuation/routing; K20 refurbishment/QC/CPO/melt/gem recovery; MDM stewardship; operational monitoring; and BI lineage/metric administration.

Public/portal inventory also lacks explicit screens for public secondary listings, a dedicated warranty claim flow, dispute/case intake, notification center/preferences delivery history, DSR request tracking, report export/scheduling, messaging, feedback/survey and deferred commercial capabilities. They must not be inferred into the next package.

### Security and readiness blockers

- D01 and all ten Package 3A decisions are approved. D44–D46 remain conditional only for exact legal durations, procedures and deadlines; other owner decisions remain open unless explicitly approved elsewhere.
- Package 3A is no longer decision-blocked and is ready to start under `docs/roadmap/package-3a-implementation-plan.md`. Its production activation remains gated by legal sign-off, later security packages and acceptance evidence.
- Production release remains frozen until later packages implement real authentication, RBAC/isolation, immutable audit, idempotency/outbox, backup/restore and operational evidence.
- Every protected screen needs positive and cross-organization/location negative tests. Hidden controls are never authorization.
- Every data screen needs loading, refresh, empty, validation, denied, expired, offline/provider failure, stale, success and partial-failure behavior; the prototype does not prove these states.
- WCAG 2.2 AA, Persian/Arabic RTL, English/French LTR, bidi-safe identifiers, keyboard/focus behavior and 200% zoom/mobile verification are release gates.

## 8. Implementation decision

Package 3A remains the correct next package because it is the smallest dependency-correct slice after the clean K01 PostgreSQL pilot and before authentication, RBAC, approvals or business-kernel migration. Its ten owner decisions are approved and it is **READY to start implementation** under `docs/roadmap/package-3a-implementation-plan.md`. The compatibility work must baseline existing K01 APIs and introduce explicit versioned contracts without abrupt removal.

No frontend feature, K02–K20 persistence, auth provider, RBAC rollout, external integration or production release is authorized by this document. Package 3A implementation remains limited to its approved K01 data/API slice; this documentation finalization itself changes no application, migration or runtime artifact.
