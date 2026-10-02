# Architecture Decision Register

**Date:** 2026-09-23  
**Authority:** Unified architecture planning package  
**Status terms:** `ADOPTED` is binding for architecture planning; `APPROVED` is an existing owner approval; `APPROVED-CONDITIONAL` approves direction but gates production details on the named authority; `OPEN` requires the named owner; `DEFERRED` is retained but not scheduled.

## A. Adopted source-of-truth decisions

| ID | Status | Decision | Consequence |
|---|---|---|---|
| UAD-001 | APPROVED | D01: initial production has one tenant, Didar; all participants are organizations, locations, memberships or roles inside it; tenant-owned tables retain `tenant_id` | No initial multi-tenant provisioning |
| UAD-002 | ADOPTED | M29 means Escrow | Gallery references to M29 are deprecated aliases; no local escrow success is permitted |
| UAD-003 | ADOPTED | M6 means Seller Portal | Wallet is not an approved product; K15/K16 primitives do not imply licensing |
| UAD-004 | ADOPTED | F21 means Loyalty and remains deferred | Disputes require a separately identified legal case workflow; K04 supplies approvals/evidence only |
| UAD-005 | ADOPTED | K17 owns ownership, warranty entitlement, activation/card and eligibility truth; K18 owns service execution | No duplicate warranty writer in portals or K18 |
| UAD-006 | ADOPTED | K19 owns second-hand acquisition/valuation; K20 refurbishment/secondary processing/melt; K09 custody | Each transition has one command owner and cross-context consequences reconcile |
| UAD-007 | ADOPTED | K01 organization identity; K07 supplier agreements; K05 catalog; K13 pricing; K06 provenance; K04 approval/audit decision evidence | Portals reference these facts and never write parallel masters |
| UAD-008 | ADOPTED | Gallery/storefront is a portal composition over K05/K09/K11, with K10 commerce and BI advisory recommendations | Publication/assortment requires a K11 contract; there is no gallery master |
| UAD-009 | ADOPTED | K13 is the sole rate/calculation authority | K19/K20 store immutable input/output snapshots and deductions, not independent rates |
| UAD-010 | ADOPTED | Audit is split by semantic owner: K06 provenance, K04 decisions, domain ledgers, platform actor/control audit | Correlated projections are not editable truth |
| UAD-011 | ADOPTED | The prototype is UX/workflow evidence only | Its storage, identities, calculations, files and successes are non-production |
| UAD-012 | ADOPTED | Historical PRD maturity counts retain their evidence labels | Conflict rows remain auditable while this register supplies forward disposition |

## B. Owner decisions

### Package 3A — approved decisions

| Decision | Status | Approved rule / remaining condition |
|---|---|---|
| D02 Person uniqueness | APPROVED | Tenant-scoped normalized national ID/mobile/email uniqueness; stable internal identity for foreign/missing identifiers; no automatic merge |
| D04 Organization hierarchy | APPROVED | Legal organizations are distinct from owned operational locations; hierarchy stays within tenant and cannot cycle |
| D05 Membership authority | APPROVED | K01 membership is descriptive/effective-dated and grants no permission; K03 exclusively owns authorization |
| D06 Identity documents | APPROVED | Private encrypted object storage holds bytes; PostgreSQL holds metadata, digest, classification, storage key and verification state only |
| D44 Retention | APPROVED-CONDITIONAL | Versioned per-class schedule and legal-hold precedence approved; exact durations require final legal/privacy approval before production activation |
| D45 Privacy rights | APPROVED-CONDITIONAL | Purpose/legal-basis and verified, redacted, audited rights handling approved; exact procedure and deadlines require final legal/privacy approval |
| D46 Deletion | APPROVED-CONDITIONAL | No public hard delete; restrict/disable then eligible anonymization/tokenization after retention and hold checks; exact exception/procedure requires legal approval |
| D47 Shared/reference data—3A portion | APPROVED | Only fixed read-only technical vocabulary is global; mutable business/reference policy is tenant-scoped, versioned and explicit |
| 3A API compatibility | APPROVED | Versioned additive APIs, gradual consumer/frontend migration and bounded compatibility adapters; no abrupt break or second truth |
| 3A clean database cutover | APPROVED | Empty production K01; no JSON/in-memory/seed/demo/test import; dev/test-only seeds; production seeding off; no non-PostgreSQL fallback |

The Package 3A subset of D47 is approved. Any D47 policy outside people, organizations, locations, memberships and identity-document metadata remains a later-domain decision and may not be inferred by 3A.

### Later Phase 1 blockers and guarded decisions

| Decision(s) | Status | Blocks |
|---|---|---|
| D09 Identity provider; D10 MFA/session | OPEN | Package 3B |
| D11 Four-eyes; D12 audit assurance | OPEN | Packages 3C/3D as applicable |
| D48 operational objectives | OPEN | Package 3F and production release |
| D03 cross-tenant identity | OPEN with D01 guardrail | Future multi-tenant identity; no global link in initial release |
| D07 trust-tier vocabulary | OPEN with boundary guardrail | K02 migration; K02 remains sole owner and tier grants no permission |
| D08 onboarding controls | OPEN with boundary guardrail | K02 migration; account creation grants no commercial entitlement |

### Domain/product decisions D13–D43

All remain `OPEN` and are required before the corresponding kernel or journey becomes implementation-ready:

- D13 product taxonomy; D14 supplier capacity.
- D15 passport trust; D16 assay authority; D17 ownership semantics; D18 collateral ownership; D19 intake acceptance; D20 inventory granularity; D21 custody control; D22 reservation/allocation; D23 POD acceptance; D24 retail policy ownership; D25 field evidence.
- D26 currency; D27 rate governance; D28 rounding; D29 tax/legal invoicing; D30 quote locks; D31 exposure timing; D32 credit/collateral; D33 ledger; D34 period/reversal; D35 settlement/netting; D36 external integrations.
- D37 ownership-transfer proof; D38 warranty; D39 service/repair; D40 buyback compliance; D41 buyback valuation; D42 melt/refining; D43 gem custody.

## C. Product/API decisions introduced by frontend reconciliation

| ID | Status | Decision needed | Affected requirements/screens |
|---|---|---|---|
| UOD-001 | OPEN | Confirm K05 catalog engagement or a dedicated engagement service as owner of account favourites and guest merge | PRD-NFR-003; PUB-007, CON-008; FE-J01/J02 |
| UOD-002 | OPEN | Approve K10 sales-return aggregate, state machine and orchestration boundary | RET-010; FE-J05 |
| UOD-003 | OPEN | Approve K11 storefront publication/assortment model and public projection | PUB-005, RET-017/018; FE-J06 |
| UOD-004 | OPEN | Name and assign the legal dispute-case workflow; define parties, evidence, remedies, appeals and retention | PRD-FND-041 after F21 resolution; escrow/buyback/service exceptions |
| UOD-005 | OPEN | Decide whether a wallet product exists at all; if yes, approve license, provider, safeguarding, ledger and disclosures | M6 legacy references; excluded from current roadmap |
| UOD-006 | OPEN | Approve escrow legal/provider model, release conditions, segregation, custody and dispute handling | PRD-BIZ-005, PRD-INT-003, PRD-OPS-057 |
| UOD-007 | OPEN | Approve location-service privacy, coordinate retention, distance semantics and availability freshness | PUB-006, CON-009; FE-J07 |
| UOD-008 | OPEN | Approve privacy/preferences/DSR workflow owner and contracts | CON-010; D44–D46 |
| UOD-009 | OPEN | Approve supplier/brand role taxonomy, capacity semantics and catalog-review contract | PRD-FND-032/OPS-037/038; SUP-002–007 |
| UOD-010 | OPEN | Approve BI metric owners, formulas, periods, lineage, refresh SLO and row-level disclosure | RET-013, SUP-012; finance/performance surfaces |
| UOD-011 | OPEN | Approve MDM steward, taxonomy versions and code distribution policy | PUB-001; SUP-006; D13/D47 |
| UOD-012 | OPEN | Approve API governance and an OpenAPI baseline with standard errors, idempotency and concurrency behavior | Every data-backed screen and FE-J01–J12 |
| UOD-013 | OPEN | Approve concrete IDs and requirements for the internal workspace ranges `INT-01x`–`INT-09x` | All internal K01–K20 operations |
| UOD-014 | OPEN | Approve public secondary-market/legal disclosure model | K20 CPO facts; missing public secondary listing screen |
| UOD-015 | OPEN | Approve feedback/survey/case-routing ownership or keep it deferred | PRD-FND-029/030, PRD-BIZ-015 |

## D. Resolved contradictions versus open policy

| Legacy contradiction | Resolution status | Open policy that remains |
|---|---|---|
| C01 M29 | RESOLVED by UAD-002 | D21/D35/D36 and UOD-006 |
| C02 M6 | RESOLVED by UAD-003 | UOD-005 if a wallet is proposed |
| C03 F21 | RESOLVED by UAD-004 | UOD-004 and loyalty/accounting policy |
| C04 warranty/service | RESOLVED by UAD-005 | D37–D39 |
| C05 second-hand | RESOLVED by UAD-006 | D40–D43 and UOD-014 |
| C06 gallery | RESOLVED by UAD-008 | UOD-003 |
| C07 pricing | RESOLVED by UAD-009 | D27–D30/D41 |
| C08 audit/traceability | RESOLVED by UAD-010 | D12/D44–D46 |
| C09 supplier/brand | RESOLVED by UAD-007 | D03/D13/D14 and UOD-009; D02/D04 are approved for Package 3A |

No remaining `OPEN` or `APPROVED-CONDITIONAL` detail may be converted into an implementation assumption. Package 3A may start, but production activation of legally conditional retention/privacy/deletion behavior remains gated.
