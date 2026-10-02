# Next Implementation Package Recommendation

**Date:** 2026-09-23  
**Recommendation:** Package 3A remains next and is `READY TO START IMPLEMENTATION` under the approved scope and gates  
**Package:** Package 3A — Single-Tenant Identity and Organization Foundation

## 1. Why Package 3A is still next

Package 2 proved a clean, durable K01 PostgreSQL pilot with no JSON fallback, but the pilot schema is not the final platform identity model. Every protected frontend journey and every later kernel depends on a canonical tenant, person, legal organization, operational location, membership and document-reference foundation. Authentication, RBAC, approval/audit and business kernels cannot be implemented safely against unresolved identity and organization semantics.

Package 3A is therefore still the smallest dependency-correct vertical foundation. Its ten owner decisions were approved on 2026-09-23. It is narrower than “Package 3” and does not include authentication, RBAC, four-eyes, outbox, frontend journeys or K02–K20 migration.

## 2. Entry and execution gates

The decision gate is complete. The following constraints are mandatory during execution, and the referenced implementation plan defines their safe order:

1. D02, D04 and the Package 3A boundary of D05 are approved.
2. D06 is approved. D44, D45 and D46 are approved as architectural direction, while exact durations, procedures and deadlines remain gated by final legal/privacy approval before production activation.
3. The Package 3A portion of D47 is approved: mutable business/reference policies are Didar-tenant scoped and versioned; only fixed read-only technical vocabulary is global.
4. D01 remains the governing constraint: one initial tenant named Didar; all participants live inside it; every tenant-owned table carries `tenant_id`; multi-tenant provisioning is excluded.
5. Before an endpoint changes, its current request/response behavior is captured as a contract test and its versioned destination OpenAPI is reviewed, including scope boundary, errors, concurrency, claimed idempotency/audit behavior and deprecation.
6. Before a table migration is authored, a field-level current-to-target mapping is reviewed for parties, contacts, addresses, organizations, locations, memberships and documents. It rejects K07/K11/K18 operational profiles in K01.
7. Schema migration follows the approved empty-database runbook. There is no business-data backfill, ID mapping or import; schema changes remain versioned, additive-first and rollback-rehearsed.
8. A privacy/data-classification matrix identifies sensitive fields, encryption/tokenization, masking, purpose, access, retention, legal hold and deletion/anonymization behavior.
9. Role/scope test fixtures are specified even though RBAC enforcement comes in 3C: actor, organization and location context cannot be accepted from arbitrary client fields, and the 3A data model must not prevent later forced RLS.
10. Restore point, migration rehearsal environment, zero-business-row checks, evidence owner and rollback trigger are documented before cutover.
11. Package 2 remains green: clean migration, no active K01 JSON fallback, controlled database-unavailable behavior, persistent transaction proof, typecheck/integration tests and secret scan.
12. No production release, real-data import, frontend migration execution or provider integration is scheduled as part of 3A.

If a per-component execution gate is absent, work stops for that component at contract/mapping work. It must not invent a policy or endpoint. This does not make the whole approved package decision-blocked.

## 3. Scope

Package 3A may implement only the following after entry approval:

- Register the single Didar tenant through an explicit, versioned, auditable bootstrap process; do not create general multi-tenant provisioning.
- Add `platform.tenants` and the minimum Package 3A platform document-object/retention-hold metadata required by the approved D06/D44–D47 decisions.
- Converge K01 toward the blueprint through additive migrations:
  - native UUID primary/foreign keys while retaining separate human/external codes where needed;
  - `tenant_id` on tenant-owned rows and tenant-composite uniqueness/FKs;
  - canonical parties and normalized contacts/addresses;
  - canonical legal organizations and operational organization locations;
  - effective-dated descriptive memberships with no implicit permission;
  - typed entity-document references to immutable object metadata, digest, classification and lifecycle state;
  - optimistic versions and server-attributed creation/update metadata compatible with future K03 actor context.
- Remove K01 ownership of supplier agreements, retailer commercial policy, workshop/service state and other fields assigned to K07/K11/K18, using non-destructive compatibility mapping where an existing contract depends on them.
- Provide repository/service operations and transaction boundaries that enforce K01 invariants and never fall back to JSON/in-memory state.
- Add migration/status/reconciliation evidence and controlled errors without exposing connection details or PII.
- Update architecture, API and requirement traceability for actual behavior changed by the package.

## 4. Explicit exclusions

Package 3A must not include:

- OIDC/provider selection or integration, passwords, MFA, recovery, sessions or step-up (`3B`).
- Role/permission/grant enforcement, organization/location authorization middleware or production RLS policy activation dependent on authenticated session context (`3C`).
- Four-eyes approval, immutable central audit anchoring/export or legal dispute workflows (`3D` or later).
- Idempotency/outbox/inbox workers, EventMesh, search indexing, notification delivery or dead-letter processing (`3E`/platform).
- Backup/PITR/HA operational acceptance beyond the migration restore/rollback safety needed to execute 3A (`3F`).
- K02–K20 persistence or business workflows.
- Frontend/portal implementation, favourites, returns, storefront, warranty, service, buyback, BI or MDM product work.
- Wallet, escrow, lending, payment, bank, tax, ERP, courier, lab or any other real external integration.
- Import of any existing JSON, in-memory, seed, demonstration or test data; automatic production seed data or default actors. Development/test seed modules must be environment-guarded and production-disabled by default.
- Production deployment or release enablement.

## 5. Acceptance criteria

### Data and ownership

1. A fresh production database applies all migrations and contains zero K01 business identities. The single Didar tenant may be created only by the explicit platform bootstrap, not by a general/demo seed path; no exception exists for importing legacy records.
2. Every K01 business row is tenant-scoped and every tenant-local unique/FK constraint prevents cross-tenant references, even though only one tenant is provisioned.
3. Legal organizations and operational locations follow approved D04 semantics; no location is silently treated as an independent legal entity.
4. Membership is descriptive and grants no permission. No `authorities`-style K01 field is accepted as authorization.
5. Supplier agreements, retailer terms/credit and workshop/service state have no authoritative K01 write path.
6. Identity/contact uniqueness and normalization exactly implement D02, including missing/foreign identifier cases and safe conflict responses.
7. Document bytes never enter PostgreSQL or logs. Metadata points to private object storage semantics with immutable digest, classification, expiry and retention/legal-hold fields as approved by D06/D44–D46.

### Migration and compatibility

8. Migration is schema expand/verify/cutover/contract, additive first and reversible to the documented empty restore point. Business-data backfill is absent and no destructive first migration is used.
9. Pre/post-cutover evidence proves zero imported business rows. No JSON, memory, seed, demo or test record appears after restart, and production seed execution is rejected by default.
10. Preserved API behavior is covered by contract tests. Intentional incompatibilities have an approved version/deprecation path; no endpoint is silently invented.
11. Optimistic concurrency rejects stale updates with a stable machine error and correlation ID.
12. Database outage returns controlled unavailable responses and never loads JSON, browser, seed or memory state.

### Security and privacy preparation

13. Runtime cannot select or mutate another tenant through request-body/header `tenant_id`, actor, role, organization or location values. Until 3B/3C establishes trusted context, protected production use remains disabled/fail-closed.
14. PII is masked in list/error/log output; direct identifiers follow the approved encryption/tokenization plan.
15. Hard deletion is not exposed. Disable/restrict, retention, legal hold and later anonymization behavior match D44–D46.
16. Database roles/migration ownership do not require the application runtime to be superuser or table owner.

### Verification and handoff

17. Unit tests cover normalization, validation, hierarchy/effective-date rules and privacy-safe error mapping.
18. Contract tests cover success and validation/conflict/not-found/stale/unavailable responses.
19. PostgreSQL integration tests cover FK/uniqueness, transactions/rollback, tenant isolation at the schema/repository boundary, restart persistence and no fallback.
20. Migration rehearsal and rollback/restore evidence are attached with counts and schema status.
21. Typecheck, build, relevant tests, secret scan and `git diff --check` pass, or each failure is reported without a success claim.
22. Documentation identifies the exact completed scope, residual risks and Package 3B entry dependencies. Production readiness remains false.

## 6. Exit and following sequence

Package 3A exits only when every acceptance criterion above passes and its documentation is updated. The following order remains:

1. 3B Authentication and Session Enforcement.
2. 3C Organization-Scoped RBAC.
3. 3D Four-Eyes Approval and Immutable Audit.
4. 3E Idempotency and Transactional Inbox/Outbox.
5. 3F Backup, Restore and Operational Acceptance.

K02–K20 business persistence and customer-facing frontend slices remain after the applicable platform gates, owner decisions and approved contracts. Completing 3A alone does not make any portal journey production-ready.
