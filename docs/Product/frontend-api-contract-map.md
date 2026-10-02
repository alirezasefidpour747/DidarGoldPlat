# Didar Frontend-to-Domain Contract Map

This document defines required capabilities and ownership. Endpoint paths shown as examples are non-binding until they are verified against an approved OpenAPI specification.

## Contract rules

1. Frontend communicates through the API layer; it never reads PostgreSQL directly.
2. Each mutation has one authoritative command owner.
3. Cross-kernel workflows are orchestrated server-side and commit through approved transactional/outbox patterns.
4. Frontend-generated actor IDs, roles, prices, balances, approval status and ownership claims are untrusted.
5. Mutating retries require idempotency keys where duplicate execution is harmful.
6. Standard errors must include machine code, localized-safe message key, correlation ID and field errors where applicable.
7. List contracts require pagination, stable ordering, scope filtering and freshness metadata.

## Capability map

| Frontend capability | Command/query owner | Supporting owners | Required contract behavior |
|---|---|---|---|
| Current identity/session | K03 | K01, RBAC | Server-derived actor, roles, org/location scope, session expiry |
| Business profile | K01 | K02/K11 | Approved snapshot plus separate editable draft/review state |
| Product taxonomy | MDM | K05 | Versioned effective classifications and localized labels |
| Public catalog/search | K05/Search | K07/K09/K11 | ACL-safe results, filters, freshness and publication eligibility |
| Product detail | K05 | K06/K09 | Approved facts, assets, public provenance and viewer-safe availability |
| Favourites | K05 engagement | K01 | Idempotent add/remove/list and guest merge |
| Supplier directory | K07 | K01/K05 | Eligible organizations and approved product scope only |
| Retailer storefront | K11 | K05/K09 | Published composition, eligibility and availability freshness |
| Nearby stockists | K11 query | K09/location service | Consent-aware location input, distance and non-guarantee freshness |
| Request basket submit | K10 | K09/K13/K14 | Idempotent durable request; no implied reservation or price |
| Quotation | K10/K13 | K09/K14 | Confirmed quantities, price snapshot, expiry and approval state |
| Order allocation | K10 | K09/K14 | Atomic reservation, conflict response and stable order history |
| Shipment/POD | K10 | K09/K16 | Server history, authorized transitions and evidence references |
| Invoice/tax | K13 | K10/K15/K16 | Immutable version/reference, external status and correction links |
| Sales return | K10 return workflow | K09/K13/K15/K16 | Original references, inspection, inventory and financial reversal |
| Gold/cash ledger | K15 | K13/K16 | Server-calculated balance plus immutable signed movements |
| Settlement/reconciliation | K16 | K15 | Pending/retry/failure/reconciled states without false success |
| Credit/risk status | K14 | K10/K15 | Viewer-safe decision/reason; no client-side override |
| Warranty activation | K17 | K01/K03/K06/K10 | Verified sale/item, consent, one-time challenge and idempotency |
| Warranty card/lookup | K17 | K06 | Signed/versioned status with privacy-safe disclosure |
| Service request | K18 | K17/K01 | Eligibility, SLA, evidence, transitions and notifications |
| Buyback/resale | K19 | K17/K06/K15/K16 | Ownership eligibility, assay/valuation, acceptance and settlement |
| Refurbished/secondary listing | K20 | K05/K06/K09/K19 | Approved condition/provenance/availability composition |
| Supplier profile/licenses | K01/K02/K07 | File service/K04 | Draft/review/correction/approval with SoD |
| Supplier product submission | K05 | K07/MDM/File service/K04 | Draft, validation, review and publication separation |
| Analytics | BI | K facts/event platform | Scope, period, refresh time, lineage and explainable metric definition |

## Shared platform contracts

### Files

- Initiate authorized upload and receive short-lived upload instructions.
- Complete upload only after checksum/type/size validation and malware scan state.
- Store evidence metadata and return opaque file IDs, never local filesystem paths.
- Authorize preview/download for the current subject and purpose.

### Notifications and OTP

- Request challenge through K03/shared notification service.
- Verify a single-use, expiring challenge on the server.
- Show delivery as pending/failed without exposing provider secrets.
- Respect notification preference and legal override policy.

### Search

- Index only approved source-of-truth events.
- Enforce disclosure scope before returning results.
- Return index freshness and support controlled reindex/replay.

### External operations

- Return operation ID and state: pending, retrying, failed, accepted or reconciled.
- Never translate provider timeout into business success.
- Expose safe retry/reconciliation actions only to authorized roles.

## OpenAPI readiness gate

Before implementing a screen mutation, Codex must locate or create an approved contract containing:

- Request and response schemas
- Authentication and permission requirement
- Organization/location scope rules
- Idempotency semantics
- Validation and domain error codes
- Concurrency/version behavior
- Audit/event behavior
- Example success and failure responses

If the contract is absent, implementation stops at typed adapter/interface scaffolding and records the missing contract. It must not invent a production endpoint silently.
