# Production Readiness Baseline Audit — K01 through K20

| Metadata | Value |
|---|---|
| Git branch | `main` |
| Commit SHA | `e68ecead94def23d0d8ad29ad480363827c2db0b` |
| Audit date | 2026-09-19 (Asia/Tehran) |
| Repository | DidarGoldPlat |
| Scope | Static repository audit of K01–K20, shared API/runtime, storage, deployment, CI/CD, security, and operability |
| Overall disposition | **NOT READY FOR PRODUCTION** |

## 1. Audit method, classifications, and limits

This baseline records the state of the exact branch and commit above. It is a source-level audit; it does not certify a deployed environment.

- **Verified fact** means directly established from files at the audited commit or from a command executed in the audit workspace.
- **Inference** means a risk conclusion drawn from one or more verified facts. It is labeled and should be validated in a production-like environment.
- **Unverified** means the repository does not contain enough evidence, or the required runtime/tool/service was unavailable.
- **Blocker** means the condition can cause unauthorized access, loss/corruption of business data, incorrect financial/security behavior, or an unrepeatable deployment.

Commands attempted: `git branch --show-current`, `git rev-parse HEAD`, `git status --short`, source searches, and `npm run lint && npm run build`. Git metadata and source inspection succeeded. The build command could not start because `npm` and a Node runtime were not installed in the audit environment. No network services, production credentials, external ERP, tax system, database, or browser were exercised.

### Secret handling

Credential values found in repository files are intentionally not reproduced. They are represented as `[REDACTED]`. This report contains names and locations necessary to remediate the exposure, but no secret or credential value.

## 2. Executive conclusion

The repository is a broad, navigable demonstration of twenty business domains with typed client contracts and REST endpoints. It is not yet a production transaction platform. The decisive blockers are:

1. Administrative and state-changing endpoints are mounted without authentication/authorization middleware; several routes trust caller-supplied actor identities.
2. `docker-compose.yml` contains hard-coded fallback database and JWT credentials, while the server contains no JWT validation path.
3. K04–K20 use seeded process memory as their system of record; restarts discard writes and multiple replicas diverge.
4. PostgreSQL is presented as active by configuration/health metadata, but no PostgreSQL client or query implementation exists.
5. Security, cryptography, external integrations, settlement, inventory, provenance, tax submission, and audit assurances are frequently simulations or local mutations.
6. There is no test script or discovered test suite, and the current environment could not execute the typecheck/build.

## 3. Cross-cutting evidence

### 3.1 Verified facts

- All K01–K20 routers are imported and mounted below `/api/admin/kernel/kNN` (`server.ts:11-30`, `server.ts:134-154`).
- No authentication or authorization middleware is applied before those mounts (`server.ts:44-160`). `Authorization` is merely allowed as a CORS header (`server.ts:89-92`).
- Production CORS accepts configured origins and any origin ending in `.run.app` (`server.ts:57-68`). Requests with no `Origin` are accepted (`server.ts:54-55`).
- Request bodies up to 10 MB are accepted, with no rate limiter, request ID, structured access logger, CSRF defense, security-header middleware, or centralized error middleware visible (`server.ts:50-98`).
- The health endpoint catches database-health failure and substitutes a healthy local result (`server.ts:99-130`). It reports every K01–K20 domain as active without probing each domain (`server.ts:125-128`).
- The server silently tries another port after `EADDRINUSE` (`server.ts:171-180`), which can make container/orchestrator health target the wrong port.
- Static assets are served only when `SERVE_STATIC=true` (`server.ts:162-169`), but the Docker image does not set that variable (`Dockerfile:31-52`). Therefore the documented single-container frontend+backend image is internally inconsistent.
- The Docker build uses `npm install` rather than a lockfile-enforced install and does not copy `package-lock.json` or `bun.lock` into the build (`Dockerfile:11-24`). Production dependencies are installed again without a lockfile (`Dockerfile:34-39`).
- The compose file embeds fallback credentials for `DATABASE_URL`, `JWT_SECRET`, and the Postgres password (`docker-compose.yml:12-16`, `docker-compose.yml:28-31`). Values are `[REDACTED]` here.
- PostgreSQL is declared in Compose and documentation (`docker-compose.yml:24-35`, `DEPLOYMENT.md:17-22`), but `package.json:22-45` contains no PostgreSQL driver. The database health code only checks whether `DATABASE_URL` starts with `postgres`; it executes no connection/query (`server/lib/database.ts:36-80`).
- The compatibility adapter reports secrets and auth as present/active using constant `true` values (`server/lib/supabase.ts:9-22`).
- The local `DatabaseEngine` labels its behavior ACID/WAL/serializable, but its WAL is an in-memory array, transaction commit only appends metadata, and writes are whole-file temp-write/rename operations (`server/database/database.engine.ts:38-43`, `server/database/database.engine.ts:94-145`). Telemetry has synthetic floors/defaults including at least 24 collections and 2,840 records (`server/database/database.engine.ts:193-207`).
- K01 persists to `data/didar-kernel-store.json`; K02 and K03 persist to their own JSON files (`server/storage.ts:17-18`, `server/storage.ts:373-426`; `server/storage-k02.ts:21`, `server/storage-k02.ts:432-471`; `server/storage-k03.ts:507-523`).
- K04–K20 storage classes initialize arrays/objects from seed data and have no disk/database persistence imports or calls. Representative evidence: `server/storage-k04.ts:17-27`, `server/storage-k08.ts:16-22`, `server/storage-k13.ts:1-27`, `server/storage-k17.ts:20-29`, `server/storage-k20.ts:18-29`.
- `package.json` defines development, build, start, clean, and typecheck commands but no test command (`package.json:6-20`). No test files or test declarations were found by repository search.
- CI performs install, typecheck, and build but no tests, dependency audit, secret scan, SAST, container scan, migration, smoke test, or rollback validation (`.github/workflows/deploy.yml:23-30`). Deployment uses a mutable third-party action ref, resets the server checkout, takes containers down before rebuilding, prunes images, and has no post-deploy health/rollback step (`.github/workflows/deploy.yml:42-75`).
- `.env.example` documents only `GEMINI_API_KEY`; it omits runtime variables used by the application such as `DATABASE_URL`, `JWT_SECRET`, `CORS_ALLOWED_ORIGIN`, `SERVE_STATIC`, `PORT`, and `BACKEND_PORT` (`.env.example:1-6`; compare `server.ts:46-48`, `server.ts:163`, `docker-compose.yml:12-16`).

### 3.2 Inferences

- **Blocker — unauthorized control:** a network client that can reach the service can likely read and mutate every kernel domain without proving identity or permission.
- **Blocker — data loss/split brain:** K04–K20 writes disappear after restart and differ between replicas. Cross-kernel calls are process-local and cannot supply distributed consistency.
- **Blocker — misleading readiness:** `/api/health` can return OK despite database failure and claims PostgreSQL connectivity based only on a URL prefix.
- **Blocker — deployment failure:** the production container is likely to return API responses but not the built SPA unless an undeclared `SERVE_STATIC=true` is injected.
- **High — supply-chain/reproducibility:** unlocked installs and mutable action tags make identical source commits capable of producing different artifacts.
- **High — audit/legal exposure:** demonstrations labeled immutable, verified, sent, connected, reconciled, or compliant are not sufficient evidence for financial, tax, custody, or security assurance.

### 3.3 Unverified items

- TypeScript typecheck and production build: not run because Node/npm were unavailable.
- Container build/start/health: not run.
- Browser/UI workflows and API smoke tests: not run.
- Production topology, TLS termination, WAF, backups, restore, monitoring, alerting, retention, disaster recovery, RPO/RTO, and incident response: no deployment evidence supplied.
- External systems (Zarrin ERP, tax/Moaddian, banks, identity provider, SMS/OTP, WebAuthn, market-rate source): no credentials or sandbox endpoints exercised.

## 4. Readiness matrices

### 4.1 Kernel status matrix

| Kernel | Business capability | API surface | Persistence | AuthN/AuthZ enforcement | External/critical behavior | Readiness |
|---|---|---:|---|---|---|---|
| K01 | Parties, organizations, memberships, documents | 7 route declarations | JSON disk | None | Local export/backup | Blocked |
| K02 | Onboarding, verification, entitlements | 6 | JSON disk | None | Mutates K01 locally; client/server path mismatch | Blocked |
| K03 | Accounts, MFA, sessions, step-up policies | 10 | JSON disk | Simulated, not gatekeeping | TOTP/WebAuthn/session controls simulated | Blocked |
| K04 | Approvals, SoD, exceptions, audit chain | 7 | Memory | None | Hash chain is process-local | Blocked |
| K05 | Product catalog, offers, market rate | 8 | Memory | None | Caller can set market rate | Blocked |
| K06 | Item passport, assay, provenance, ownership | 7 | Memory | None | Digital seal/verification asserted locally | Blocked |
| K07 | Suppliers, agreements, collateral, audits | 11 | Memory | None | Caller-supplied actor identity | Blocked |
| K08 | Intake, weighing, quarantine, assay, receipt | 8 | Memory | None | Process-local link to K07 | Blocked |
| K09 | Vault, inventory, bags, custody transfers | 8 | Memory | None | No durable custody ledger | Blocked |
| K10 | Orders, allocation, dispatch, POD | 8 | Memory | None | Process-local inventory/order mutations | Blocked |
| K11 | Retailer lifecycle and commercial access | 8 | Memory | None | Commercial policy local only | Blocked |
| K12 | Agents, territories, visits, proxy orders | 13 | Memory | None | Geolocation values caller-controlled/defaulted | Blocked |
| K13 | Rates, pricing, invoices, tax integration | 19 | Memory | Local model only | Rate/tax/Moaddian behaviors simulated | Blocked |
| K14 | Credit, exposure, collateral, overrides | 9 | Memory | None | Process-local bridge to K13/K15 | Blocked |
| K15 | Gold/fiat subledgers, vouchers, netting | 11 | Memory | None | No durable double-entry ledger | Blocked |
| K16 | ERP/outbox/settlement/reconciliation | 20 | Memory | None | ERP connectivity and dispatch simulated | Blocked |
| K17 | Consumer claims, warranty, anti-theft | 8 | Memory | None | OTP/hash and ownership changes simulated | Blocked |
| K18 | After-sales, repairs, returns | 5 | Memory | None | Workshop/warranty flow local only | Blocked |
| K19 | Buyback, assay, valuation, settlement | 7 | Memory | None | Payout references and hashes simulated | Blocked |
| K20 | Refurbishment, CPO, smelting, gems | 9 | Memory | None | Material transformation/audit local only | Blocked |

### 4.2 Cross-cutting control matrix

| Control | Evidence | Assessment | Severity |
|---|---|---|---|
| Authentication | No auth middleware before route mounts (`server.ts:134-160`) | Missing | Critical blocker |
| Authorization | RBAC endpoints exist, but route enforcement is absent | Missing at boundary | Critical blocker |
| Durable transactions | K04–K20 are memory-only | Missing for most domains | Critical blocker |
| Secrets | Compose fallback credential literals | Exposed/insecure defaults | Critical blocker |
| Database | URL-prefix check; no driver/query | PostgreSQL claim not implemented | Critical blocker |
| Financial correctness | In-memory mutable ledgers/rates and no tests | Unproven | Critical blocker |
| Audit integrity | Some SHA-256 chaining; most audit stores volatile | Not durable/tamper-evident | High |
| Input validation | Ad hoc route checks; no schema layer | Incomplete | High |
| Concurrency/idempotency | Mostly process-local arrays; partial outbox semantics | Inadequate | High |
| Observability | Console logs and synthetic telemetry | Inadequate | High |
| Backups/restore | JSON snapshots exist; no restore drill or retention | Incomplete | High |
| Tests | No suite/script; build unverified in this environment | Missing evidence | High |
| CI/CD | Typecheck/build only; downtime deploy; no rollback | Incomplete | High |
| Container runtime | Static serving flag mismatch; runs as root by default | Unsafe/incomplete | High |
| Privacy | Seed/live-like PII in payloads; unrestricted exports | Inadequate | High |

## 5. Complete kernel findings

### K01 — Party and organization master identity

**Verified facts**

- Provides reads, creation, patching, status changes, export, database health, and backup endpoints (`server/routes/k01.ts:22-284`).
- Persists a whole aggregate to `data/didar-kernel-store.json`, caches it in process, and writes JSON directly (`server/storage.ts:17-18`, `server/storage.ts:373-426`).
- Entity IDs use timestamp plus `Math.random()` (`server/storage.ts:481-483`, `server/storage.ts:620-623`, `server/storage.ts:738-740`, `server/storage.ts:782-784`).
- Actor identity is accepted from the unauthenticated `x-actor-name` header and otherwise replaced by a privileged-sounding default (`server/routes/k01.ts:40-41`, `server/routes/k01.ts:84-86`, `server/routes/k01.ts:142-144`).
- The export endpoint returns the full store as JSON or CSV without access checks (`server/routes/k01.ts:236-258`).

**Inference / risk**

- **Critical blocker:** master identity and documents can be enumerated, altered, status-changed, exported, and backed up by unauthenticated callers.
- **High:** whole-file writes plus an in-process cache do not provide multi-process concurrency control, referential transactions, encryption at rest, field-level privacy, or robust crash recovery.
- **High:** predictable/non-cryptographic IDs are unsuitable where identifiers carry security or privacy expectations.

**Unverified**

- Uniqueness under concurrent writes, restore behavior, document-blob storage, consent/legal retention, deletion/anonymization, and production data migration.

### K02 — Onboarding, verification, and commercial entitlements

**Verified facts**

- Provides application creation, checklist, verification-call, decision, and entitlement mutation APIs (`server/routes/k02.ts:19-112`).
- Persists `data/didar-k02-store.json` and also writes K01 during some workflows (`server/storage-k02.ts:21`, `server/storage-k02.ts:432-471`, `server/storage-k02.ts:557-559`, `server/storage-k02.ts:709-724`).
- The frontend calls `/applications/:id/call-log`, while the backend exposes `/applications/:id/verification-call` (`src/lib/api.ts:542-543`; `server/routes/k02.ts:62-66`).
- Actor identity is accepted through `x-actor-name` with defaults (`server/routes/k02.ts:34-35`, `server/routes/k02.ts:65-66`, `server/routes/k02.ts:80-93`).

**Inference / risk**

- **Critical blocker:** K01 and K02 file updates are not one atomic transaction; a failure can leave onboarding and canonical party data inconsistent.
- **High blocker:** verification-call UI behavior is expected to fail with HTTP 404 because of the route mismatch.
- **High:** callers can grant entitlements and decide onboarding without authenticated approval authority.

**Unverified**

- Identity-provider, sanctions/AML/KYC, telephone verification, document verification, retry/idempotency, and reconciliation with K01.

### K03 — Account security, MFA, sessions, and step-up controls

**Verified facts**

- Exposes MFA configuration/verification, hardware-key registration, session revocation, unlock, policy editing, and step-up simulation (`server/routes/k03.ts:12-140`).
- Persists a JSON store (`server/storage-k03.ts:507-523`).
- Any six-digit value is accepted as a valid TOTP; the submitted code is written into the security log (`server/storage-k03.ts:594-626`).
- Hardware-key registration creates metadata without a WebAuthn registration ceremony or public-key verification (`server/storage-k03.ts:630-665`).
- Session revocation toggles a field in the K03 demo store; no middleware consults it on incoming requests (`server/storage-k03.ts:669-690`; `server.ts:134-160`).

**Inference / risk**

- **Critical blocker:** K03 is a security administration simulator, not an authentication enforcement plane. Its successful states must not be represented as real MFA, WebAuthn, session, or step-up security.
- **Critical:** logging MFA codes creates sensitive authentication data exposure.
- **High:** unauthenticated callers can change security policy, unlock accounts, and revoke sessions.

**Unverified**

- Password hashing, identity lifecycle, token issuance/rotation/revocation, cookie security, brute-force defense, recovery codes, WebAuthn attestation, SMS provider, and clock-skew/replay handling.

### K04 — Approval, separation of duties, exceptions, and audit

**Verified facts**

- Models approval requests, four-eyes/SoD, commercial exceptions, and audit verification (`server/storage-k04.ts:1-23`; `server/routes/k04.ts:13-236`).
- Audit entries are SHA-256 chained using the prior hash (`server/storage-k04.ts:29-75`).
- All records are held in process memory and seeded on construction (`server/storage-k04.ts:17-27`).
- Approval/rejection routes accept actor ID, name, and role from the request body (`server/routes/k04.ts:84-109`, `server/routes/k04.ts:125-145`).

**Inference / risk**

- **Critical blocker:** caller-controlled identity defeats the four-eyes control; process restart erases the approval and audit history.
- **High:** a hash chain stored beside mutable data in the same process is not independently anchored, durable, append-only, or tamper-evident across restarts.

**Unverified**

- Enforced approver eligibility, distinct-human guarantees, signature/anchor custody, time source, retention, audit export, and recovery.

### K05 — Product catalog, variants, supply offers, and market rates

**Verified facts**

- Provides product CRUD, offer creation/status, price estimation, and market-rate mutation (`server/routes/k05.ts:12-263`).
- Products, offers, and rate are seeded and memory-only (`server/storage-k05.ts:16-29`).
- Initial rates are hard-coded (`server/storage-k05.ts:19-24`).
- Any reachable caller can update the market rate (`server/routes/k05.ts:246-263`).

**Inference / risk**

- **Critical blocker:** catalog and rate changes are unauthenticated, non-durable, and unsuitable as authoritative pricing inputs.
- **High:** deleting/updating products may break downstream references because no database foreign keys or transaction boundary exists.

**Unverified**

- Rate-source authenticity/freshness, approval rules, SKU uniqueness, media storage, referential integrity, inventory linkage, and price-calculation parity with K13.

### K06 — Unique-item passport, assay, provenance, and ownership

**Verified facts**

- Exposes passport lookup/mint, provenance event, ownership transfer, stolen toggle, and public-style verification (`server/routes/k06.ts:12-300`).
- Passports and events are seeded memory arrays (`server/storage-k06.ts:15-24`).
- Minting assigns successful QC/security assertions and defaults, including `digitalSealVerified: true`, based on local construction (`server/storage-k06.ts:652-703`).
- A default evidence image can be an external Unsplash URL (`server/storage-k06.ts:637-646`).

**Inference / risk**

- **Critical blocker:** authoritative provenance, ownership, stolen status, assay evidence, and digital seals disappear on restart and can be changed without identity/authorization.
- **High:** local hashes/flags do not prove physical item identity, lab result authenticity, issuer signature, or immutable chain-of-custody.

**Unverified**

- NFC/QR collision resistance, signing keys/HSM, certificate validation, lab integration, evidence retention, public verification privacy, and physical-to-digital controls.

### K07 — Supplier lifecycle, agreements, collateral, and quality audits

**Verified facts**

- Provides supplier, agreement, collateral, limit, status, verification, and quality-audit mutations (`server/routes/k07.ts:12-169`).
- All domain collections are in memory (`server/storage-k07.ts:18-26`).
- The caller supplies `x-actor-name`; defaults impersonate operational/legal/credit roles (`server/routes/k07.ts:47-50`, `server/routes/k07.ts:75-79`, `server/routes/k07.ts:90-94`).

**Inference / risk**

- **Critical blocker:** contracts, collateral verification, consignment limits, and supplier status are non-durable and unauthenticated.
- **High:** no evidence supports legal document immutability, collateral valuation custody, expiry jobs, or maker-checker enforcement.

**Unverified**

- E-signature, registry/bank checks, collateral liens, document storage, SLA alerts, supplier screening, and K01/K05 referential integrity.

### K08 — Supply intake, weighing, assay, quarantine, and warehouse receipts

**Verified facts**

- Provides shipment intake, weighing, quarantine, assay, accept/reject decision, and receipt retrieval (`server/routes/k08.ts:12-130`).
- Shipments and receipts are memory-only; K07 is accessed by direct in-process import (`server/storage-k08.ts:14-22`).
- Operational actor names are accepted in request bodies (`server/routes/k08.ts:35-57`, `server/routes/k08.ts:64-87`).

**Inference / risk**

- **Critical blocker:** receipt and assay decisions are not durable and can be forged by an unauthenticated caller.
- **High:** scale measurements and calibration identifiers are caller-supplied; no device signature, lab result verification, evidence hash, or atomic inventory posting is established.

**Unverified**

- Scale/lab integrations, calibration validation, quarantine access control, duplicate receipt prevention, custody evidence, and atomic transition into K09.

### K09 — Vault inventory, locations, agent bags, and custody transfer

**Verified facts**

- Provides location, bag, item, transfer, arrival confirmation, bag creation, and audit APIs (`server/routes/k09.ts:12-105`).
- Locations, bags, items, transfers, and audits are memory arrays (`server/storage-k09.ts:17-25`).
- Actor identity can come from request data or hard-coded defaults (`server/routes/k09.ts:61-65`, `server/routes/k09.ts:88-103`).

**Inference / risk**

- **Critical blocker:** a precious-metal inventory/custody ledger cannot be process memory; restart, concurrency, or multi-replica operation can lose or duplicate custody state.
- **Critical:** unauthenticated callers can initiate/confirm transfers and create bag/audit records.

**Unverified**

- Serialized stock invariants, dual custody, physical access integration, reconciliation counts, negative inventory prevention, insurance, geofencing, and K06/K08 linkage.

### K10 — Order allocation, packing, dispatch, and proof of delivery

**Verified facts**

- Provides order creation, allocation, pack/seal, dispatch, POD verification, and cancellation (`server/routes/k10.ts:13-136`).
- Orders and the availability pool are hard-coded memory state (`server/storage-k10.ts:16-18`, `server/storage-k10.ts:579-659`).
- POD handling invokes K16 integration logic in process (`server/routes/k10.ts:7-8`, `server/routes/k10.ts:92-123`).

**Inference / risk**

- **Critical blocker:** order and allocation state is non-durable and not atomically reserved against K09 inventory; oversell/double-allocation is plausible under concurrency or multiple replicas.
- **High:** security seal, dispatch, POD, cancellation, and downstream voucher actions are unauthenticated and lack idempotency evidence.

**Unverified**

- Reservation locks, payment/credit authorization, carrier integration, POD signature authenticity, cancellation compensation, and end-to-end inventory/ledger reconciliation.

### K11 — Retailer lifecycle and commercial access

**Verified facts**

- Provides retailer creation and mutations for tier, territory, basket, status, and exceptions (`server/routes/k11.ts:12-102`).
- Retailers and commercial terms are seeded memory state (`server/storage-k11.ts:18-35`).

**Inference / risk**

- **Critical blocker:** commercial eligibility and limits disappear on restart and can be altered without authentication.
- **High:** K11 overlaps K01/K02/K14 concepts without an authoritative persisted model or reconciliation boundary, inviting inconsistent tier/status/limit decisions.

**Unverified**

- Canonical retailer ownership, tier approval, effective dates, exception expiry, territory constraints, basket enforcement in K10, and historical policy audit.

### K12 — Agents, territories, field visits, bags, and proxy orders

**Verified facts**

- Exposes 13 operations for agent status/territory/bag, territories/stores, visits, check-in/completion/outcome, and proxy orders (`server/routes/k12.ts:12-150`).
- Agents, territories, visits, showcase items, and proxy drafts are memory-only (`server/storage-k12.ts:19-35`).
- Check-in substitutes default Tehran coordinates/distance when falsy values are supplied (`server/routes/k12.ts:112-116`).

**Inference / risk**

- **Critical blocker:** field custody, agent assignment, visit evidence, and proxy orders are non-durable and unauthenticated.
- **High:** caller-controlled coordinates and fallback values cannot prove presence; zero-valued valid coordinates/distances can be overwritten by defaults.

**Unverified**

- Mobile-device identity, GPS attestation, offline sync/conflict resolution, bag linkage to K09, consent/privacy, fraud detection, and K10 proxy-order idempotency.

### K13 — Market rates, pricing, invoices, tax, and privileged rate administration

**Verified facts**

- Exposes 19 routes covering price calculation, quote locks, invoices, tax submission, rates, dual approval, users, security policy, wage rules, and K14 finalization (`server/routes/k13.ts:13-505`).
- It explicitly describes itself as in-memory operational storage (`server/storage-k13.ts:1-7`, `server/storage-k13.ts:26-27`).
- Pricing enforces local discount bounds and calculates VAT from wage plus margin (`server/storage-k13.ts:1035-1150`).
- `isQuoteLocked` becomes true whenever a quote is required, even without a supplied quote-lock ID (`server/storage-k13.ts:1116-1123`).

**Inference / risk**

- **Critical blocker:** invoice, rate, quote-lock, operator, approval, and tax state is volatile and all administration endpoints are unauthenticated.
- **Critical:** the quote-lock result can claim a lock exists when no lock identifier exists, making downstream pricing assurance unreliable.
- **High:** statutory tax text and local formulas are not a legal/compliance certification; rounding, effective dates, currency units, credit notes, cancellations, and Moaddian outcomes require independent validation.

**Unverified**

- Authoritative price feed, stale-rate/circuit-breaker behavior, genuine dual control, tax schema/signing, Moaddian connectivity, invoice numbering, reversal/credit notes, fiscal retention, and legal review.

### K14 — Credit, exposure, collateral, overrides, and alerts

**Verified facts**

- Provides limit/lock, collateral creation/release, overrides/decisions, alerts, and bridge reads (`server/routes/k14.ts:12-235`).
- Credit profiles and related objects are in-memory (`server/storage-k14.ts:1-16`).
- K13→K14 and K14→K15 bridges are direct process-level services (`server/services/k13-k14-bridge.ts`; `server/services/k14-k15-bridge.ts`).

**Inference / risk**

- **Critical blocker:** credit decisions, exposure, collateral, and overrides can be changed without identity and are lost on restart.
- **Critical:** simultaneous invoice/order activity cannot rely on durable row locks or serialized exposure updates; credit oversubscription is plausible.

**Unverified**

- Exposure aggregation, pending-order holds, collateral haircut/expiry, bureau/bank integrations, override SoD, alert delivery, and atomic linkage with K10/K13/K15.

### K15 — Gold/fiat subledgers, vouchers, trial balance, and netting

**Verified facts**

- Exposes party balances, voucher reads/creation, netting, reference-rate mutation, and bridge operations (`server/routes/k15.ts:13-224`).
- The ledger is held in arrays and uses a mutable in-memory reference price (`server/storage-k15.ts:1-19`).

**Inference / risk**

- **Critical blocker:** a financial subledger cannot be considered authoritative without durable append-only journal storage, atomic posting, balanced-entry invariants, immutable reversals, period controls, and authenticated operators.
- **Critical:** restart or multiple replicas can change balances and voucher histories; direct rate mutation can change valuations without governed approval.

**Unverified**

- Debit/credit balancing for every voucher, precision/rounding, closed periods, reversal model, chart of accounts, bank confirmation, reconciliation, financial audit, and recovery from partial bridge failure.

### K16 — ERP catalog/outbox, settlement, and tripartite reconciliation

**Verified facts**

- Provides 20 routes for catalog sync, outbox, dispatch/retry/reconcile, offline mode, settlement, invoice-voucher sync, reserve state, and reconciliation (`server/routes/k16.ts:13-364`).
- All state is in memory and direct imports couple it to K13–K15 (`server/storage-k16.ts:20-25`).
- The declared ERP connection status, URL, service account, latency, and counts are seeded values (`server/storage-k16.ts:24-35`).
- Dispatch/reconciliation methods mutate local status; manual discrepancy resolution can set success (`server/storage-k16.ts:700-743`).
- Settlement synchronization swallows all errors (`server/storage-k16.ts:780-829`).

**Inference / risk**

- **Critical blocker:** this is not a durable transactional outbox and not proof of ERP connectivity. A restart loses pending documents, idempotency state, settlements, and reconciliation evidence.
- **Critical:** swallowed bridge errors and manually assignable success statuses can present false reconciliation.

**Unverified**

- ERP authentication, TLS/certificate validation, webhook/poll semantics, idempotency across restarts, retries/backoff/dead letters, schema mapping, signed responses, exactly-once accounting effect, and outage recovery.

### K17 — Consumer ownership, warranty, transfers, and anti-theft

**Verified facts**

- Provides scan, claim, transfer request/confirm, stolen report/resolve, and warranty service operations (`server/routes/k17.ts:12-184`).
- Claims, warranties, transfers, stolen reports, and audit logs are memory arrays (`server/storage-k17.ts:20-29`).
- Transfer OTPs, identifiers, deed hashes, and other security-like values use `Math.random()` and timestamps (`server/storage-k17.ts:544-588`, `server/storage-k17.ts:668-759`).
- K06 is mutated/read by direct process import (`server/storage-k17.ts:18`).

**Inference / risk**

- **Critical blocker:** non-cryptographic OTP/hash generation, no authentication, and volatile ownership state make transfers and anti-theft assertions unsafe.
- **High:** cross-kernel K06/K17 mutations lack a durable transaction and can diverge.

**Unverified**

- Consumer identity proofing, OTP delivery/rate limits/replay protection, deed signatures, seller/buyer consent, stolen-property legal process, warranty terms, and public scan privacy.

### K18 — After-sales service, returns, repair routing, and warranty fulfillment

**Verified facts**

- Provides ticket reads/creation, stage transitions, and workshop listing (`server/routes/k18.ts:12-124`).
- Tickets, workshops, and audit logs are memory-only; K17 warranty data is read in process (`server/storage-k18.ts:17-25`, `server/storage-k18.ts:514-605`).
- Insurance-like tracking codes use `Math.random()` (`server/storage-k18.ts:630-685`).

**Inference / risk**

- **Critical blocker:** service intake, item custody, repair stages, financial settlement, and warranty decisions are non-durable and unauthenticated.
- **High:** generated tracking codes and local workshop routing are not evidence of insured transit or third-party acceptance.

**Unverified**

- Return authorization, custody handoffs, workshop APIs, parts/gem inventory, weight-loss tolerances, customer approvals, refunds, SLA notifications, and accounting postings.

### K19 — Buyback, assay, trade-in valuation, payout, and routing

**Verified facts**

- Provides estimate, record creation, assay update, settlement, and routing (`server/routes/k19.ts:12-188`).
- Records and audit logs are memory-only; benchmark price and premium are local mutable constants (`server/storage-k19.ts:21-30`).
- Receipt/reference codes and audit hashes use `Math.random()` (`server/storage-k19.ts:673-784`, `server/storage-k19.ts:857-898`).

**Inference / risk**

- **Critical blocker:** unauthenticated, volatile buyback and payout state could produce incorrect valuation, duplicate payout, unverifiable assay, or lost custody/accounting records.
- **High:** pseudo-random audit hashes are labels, not cryptographic integrity proofs.

**Unverified**

- Live K13 price linkage, seller KYC/AML, stolen-item checks, assay device/lab evidence, payout/bank confirmation, trade-in tax/accounting, dual approval, and K20 custody transfer.

### K20 — Refurbishment, certified pre-owned, smelting, recycling, and gem recovery

**Verified facts**

- Provides reads/creation/status changes for refurbished items, melt batches, and recovered gems (`server/routes/k20.ts:12-235`).
- All records and audits are memory arrays; the gold benchmark is a local constant (`server/storage-k20.ts:18-29`).
- Passport IDs and integrity-hash-looking strings use `Math.random()` (`server/storage-k20.ts:513-569`, `server/storage-k20.ts:589-641`, `server/storage-k20.ts:657-707`, `server/storage-k20.ts:815-890`).

**Inference / risk**

- **Critical blocker:** material transformation, yield/loss, recovered gems, CPO identity, value, and custody are not durably recorded or authenticated.
- **High:** locally generated `sha256-*` strings are not SHA-256 digests and must not be presented as integrity evidence.

**Unverified**

- Weighing/assay evidence, batch genealogy, mass-balance tolerances, environmental metrics, gem grading/custody, CPO warranty/passport issuance, inventory/ledger postings, and regulatory reporting.

## 6. Detailed production risks and blockers

### P0 — Release blockers

1. **Identity and access control:** introduce real authentication, server-side session/token validation, tenant/workspace context, route-level authorization, and server-derived actor identity for every K01–K20 operation. Deny by default.
2. **Secret exposure:** remove all credential literals and defaults from Compose/history where required, rotate affected values, require runtime secret injection, and add secret scanning. The values found during this audit are `[REDACTED]`.
3. **Authoritative database:** implement a real PostgreSQL persistence layer and migrations for all domains; do not infer connection health from a URL string. Use database constraints, transactions, and concurrency controls.
4. **Financial/custody durability:** K04–K20 must not use memory as the system of record. Prioritize immutable approvals/audit, inventory/custody, orders/reservations, rates/invoices, credit exposure, ledgers, outbox/reconciliation, and ownership.
5. **Remove simulated assurances:** clearly disable or label TOTP, WebAuthn, ERP dispatch, Moaddian submission, market feeds, payout, signatures, hashes, insurance, and device/lab proofs until real integrations and verification exist.
6. **Deployment correctness:** make the container serve the SPA or split frontend/backend explicitly; pin dependencies/actions; add non-root runtime, post-deploy health, migrations, rollback, and zero/low-downtime rollout.

### P1 — Required before controlled pilot

1. Schema validation for every request/response, normalized error handling, size limits per endpoint, rate limiting, security headers, request IDs, and structured redacted logs.
2. Durable idempotency keys and transactional outbox/inbox patterns for cross-domain and external side effects.
3. Automated unit, property, integration, migration, authorization, concurrency, contract, end-to-end, and failure-injection tests.
4. Real readiness/liveness probes; dependency-specific health checks must fail closed and contain no misleading synthetic values.
5. Backup encryption, retention, off-host copies, restore automation, and measured restore drills with agreed RPO/RTO.
6. Metrics, traces, audit export, alerting, SLOs, runbooks, on-call ownership, incident response, and capacity/load tests.

### P2 — Production hardening and assurance

1. Privacy classification, minimization, masking, export controls, retention/deletion, consent/legal basis, and access review for PII and financial/custody data.
2. HSM/KMS-backed signing, trusted timestamps, independent audit anchoring, key rotation, certificate lifecycle, and evidence-chain design where cryptographic claims are required.
3. Independent financial, tax, legal, security, and physical-custody review; reconcile every material/financial transition across K06–K20.
4. Dependency/SBOM/license scanning, container/image signing, provenance attestations, environment promotion, and disaster-recovery exercises.

## 7. Recommended implementation order

The sequence below minimizes rework by establishing shared controls before domain migration.

1. **Freeze production release and rotate secrets.** Remove insecure fallbacks; inventory all environments and credentials; add secret scanning.
2. **Establish the platform security boundary.** Authentication, authorization policy, workspace/tenant scoping, server-derived actor identity, request validation, rate limiting, and audit context.
3. **Create the real database foundation.** PostgreSQL driver, connection management, migrations, constraints, transaction APIs, health checks, backup/restore, and observability. Decide whether JSON stores are migration inputs only.
4. **Persist K01–K04 first.** Canonical identities, onboarding, actual security configuration, maker-checker approvals, and durable tamper-evident audit underpin every later domain.
5. **Persist the physical-gold chain K05–K12.** Catalog → passport → supplier → intake → vault/inventory → order → retailer → field operations. Enforce serialized inventory, custody, and reservation invariants.
6. **Persist and independently validate K13–K16.** Rates/pricing/tax → credit → dual ledger → ERP/outbox/reconciliation. Use decimal-safe calculations, closed periods, reversals, durable idempotency, and sandbox-certified external integrations.
7. **Persist consumer and circular lifecycle K17–K20.** Ownership/warranty → service/returns → buyback/payout → refurbishment/smelting/gems, with identity proofing and atomic custody/accounting transitions.
8. **Build the verification pyramid throughout.** Unit/property tests alongside each rule, integration/contract tests alongside persistence and external adapters, then end-to-end, concurrency, load, security, backup/restore, and DR tests.
9. **Harden delivery.** Reproducible locked builds, pinned CI actions, scanners, signed artifacts, non-root minimal images, migration gates, canary/blue-green deployment, health validation, and rollback.
10. **Run a production-readiness review.** Close every unverified item or explicitly accept it with owner/date; obtain security, financial, tax, legal, operations, and business sign-off before real assets or customer data enter the platform.

## 8. Exit criteria for a future readiness decision

A future audit should not mark the platform ready until all of the following are evidenced:

- Every K01–K20 read/write route has tested authentication, least-privilege authorization, tenant/workspace isolation, and immutable actor attribution.
- No secrets or production-like credential defaults exist in source, image layers, documentation, logs, or CI output; rotation is documented.
- All authoritative state is durable in a supported database with tested constraints, migrations, concurrency, backups, and restores.
- Financial, inventory, custody, pricing, credit, and ownership invariants have automated property/concurrency tests and independent domain review.
- Security features and external integrations are real, fail closed, observable, idempotent, and tested against provider sandboxes or approved equivalents.
- CI produces a reproducible, scanned, signed artifact; deployment applies migrations safely, verifies readiness, and demonstrates rollback.
- Production-like load, security, failure, restore, and disaster-recovery exercises meet documented SLO/RPO/RTO targets.
- All remaining inferences and unverified items have a named owner, evidence link, risk acceptance (if applicable), and expiry date.

## 9. Verification record

| Check | Result |
|---|---|
| Branch | Verified: `main` |
| Commit | Verified: `e68ecead94def23d0d8ad29ad480363827c2db0b` |
| Working tree before report | Verified clean (`git status --short` produced no output) |
| K01–K20 route mounts | Verified in `server.ts:134-154` |
| Typecheck | Unverified: `npm` unavailable in audit environment |
| Production build | Unverified: `npm` unavailable in audit environment |
| Automated tests | No test command/suite found; none executed |
| Docker runtime | Unverified; no image/container started |
| Production/external services | Unverified; not accessed |

This document is a baseline, not an authorization to deploy or process real customer, financial, or precious-metal custody data.
