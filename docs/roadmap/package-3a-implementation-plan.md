# Package 3A Implementation-Ready Plan

**Date:** 2026-09-23  
**Package:** Single-Tenant Identity and Organization Foundation  
**Decision status:** Ten Package 3A owner decisions approved; D44–D46 legally conditional  
**Start verdict:** **READY** for implementation; **NOT READY** for production release

## 1. Traceability and authoritative ownership

Package 3A implements the K01 foundation required by `PRD-FND-001`, the K01 portions of `PRD-FND-002`, `PRD-FND-003`, `PRD-FND-020`, `PRD-FND-023` and the canonical-organization part of `PRD-FND-032`. The directly affected screen references are `RET-016`, `SUP-002` and `INT-01x`; `PUB-008`, `RET-003`, `CON-010`, `SUP-003`, `FE-J03` and `FE-J11` are downstream consumers but are not implemented in this package.

K01 is authoritative for people, legal organizations, operational organization locations, descriptive memberships and identity-document metadata. K03 remains the sole authorization owner. The shared object service owns encrypted file bytes and controlled transfer. Portals are consumers only and do not own or persist these facts.

## 2. Approved scope

Package 3A may implement only the following domain facts. Contacts, addresses, tenant anchors, reference policy and object/hold links below are subordinate support for those facts, not additional business capabilities:

- the single existing Didar tenant boundary and tenant key on every K01-owned row;
- canonical people and normalized identity/contact attributes;
- canonical legal organizations;
- operational locations owned by exactly one organization, with same-organization location hierarchy;
- effective-dated, status-bearing person-to-organization/location memberships that grant no permission;
- identity-document metadata, integrity digest, classification, expiry and verification state;
- minimum private-object metadata and legal-hold linkage needed by identity documents, without implementing the shared file or privacy workflow;
- tenant-scoped, versioned K01 reference policy required for organization/location/document types and verification rules; only fixed read-only technical vocabulary may be global;
- versioned K01 API contracts, a bounded compatibility adapter and gradual migration of consumers;
- schema migrations, empty-database cutover evidence, repositories/services and tests for this slice.

### Explicit exclusions

- Authentication, OIDC, credentials, MFA, recovery, sessions and step-up (Package 3B).
- RBAC, permission/grant management, authorization middleware and production activation of organization/location RLS (Package 3C).
- Four-eyes approval, shared immutable audit infrastructure and legal-case workflow (Package 3D or later).
- Idempotency infrastructure, inbox/outbox, EventMesh, notifications and search indexing (Package 3E/platform).
- Frontend/portal implementation or execution of frontend consumer migration.
- External integrations and implementation of object-storage upload/download/malware-scanning services. Identity files nevertheless must reside only in private encrypted object storage when that service is integrated.
- K02–K20 persistence, supplier agreements, retailer commercial state, workshop/service state, trust tiers or onboarding decisions.
- Import or migration of any existing JSON, process-memory, seed, demo or test record.
- Production release enablement, purge execution, automated privacy-rights fulfillment or anonymization jobs.

## 3. Proposed PostgreSQL schema and responsibilities

Every tenant-owned primary/foreign-key relationship includes `tenant_id`; native UUIDs are internal identifiers and separate immutable external codes are used only where a contract needs them. Mutable aggregate roots carry an optimistic `version`. Created/updated attribution is compatible with future trusted K03 context and never trusts actor fields supplied by a client.

| Table | Scope and responsibility | Principal constraints |
|---|---|---|
| `platform.tenants` | Existing single Didar tenant anchor; not general tenant provisioning | unique slug; explicit bootstrap only |
| `k01.parties` | Canonical person record, lifecycle status and verification state | tenant-scoped UUID; no credentials/roles; restricted PII |
| `k01.party_contacts` | Normalized mobile/email and verification lifecycle | partial unique tenant-scoped tokens for normalized values; one active primary per type |
| `k01.party_addresses` | Structured person address/contact location data | tenant/party composite FK; lifecycle and classification |
| `k01.organizations` | Canonical legal/contractual organization identity | tenant-scoped legal identifier uniqueness; no supplier agreement, credit or service fields |
| `k01.organization_locations` | Branch, store, workshop, factory, office or warehouse without independent legal identity | exactly one owner organization; optional parent location in same tenant and organization; cycle prevention; explicit type/status/capabilities |
| `k01.memberships` | Descriptive, effective-dated person relationship to organization and optionally one owned location | location must belong to organization; valid interval; overlap/duplicate prevention; no role/permission grant |
| `platform.document_objects` | Opaque metadata for private encrypted object bytes | immutable digest, storage key, size/type/classification; never stores bytes or public URL |
| `k01.entity_documents` | Identity-document metadata and typed link to one person or organization | exactly one subject; approved versioned type; object FK; verification/expiry state; verifier reference nullable until later trusted context |
| `platform.retention_holds` | Minimum hold metadata/linkage needed to prevent destructive processing | scoped target, reason/reference, effective interval; no DSR/purge workflow in 3A |
| `k01.reference_policies` | Mutable, tenant-scoped, effective-versioned K01 codes and verification policy | unique tenant/code/version; explicit effective dates; no implicit global fallback |

Fixed technical enum/check vocabulary may be platform-global only when it is non-personal, read-only and has invariant meaning. A mutable label, business rule, allowed document type or verification rule belongs in tenant-scoped versioned policy. The field-level current-to-target mapping must be approved before the corresponding migration is authored; this plan does not silently invent legacy-field ownership.

## 4. Empty-database migration and cutover sequence

Production K01 starts with zero business records. The Didar tenant anchor may be created only through an explicit platform bootstrap migration/command; it is not a general seed and must not create a person, organization, location, membership or document.

1. Inventory the current schema and current K01 API behavior read-only; classify all current records as non-migration inputs and record zero-import policy.
2. Freeze the target field map, data classification, constraints and v2 contract for the first vertical operation.
3. Create a pre-change schema-only backup/restore point and prove restore in the rehearsal environment.
4. Apply versioned additive schema migrations to a fresh empty PostgreSQL database in dependency order: schemas/extensions, tenant anchor, people/contacts/addresses, organizations/locations, memberships, object metadata, entity documents, hold linkage and tenant reference policy.
5. Run constraint/index validation and verify zero rows in every K01 business table. No backfill, legacy-ID mapping or business-data reconciliation is run.
6. Run repository/service and contract tests against PostgreSQL, including restart persistence and database-unavailable behavior.
7. Deploy the versioned API beside the preserved contract. Route legacy calls through the temporary compatibility adapter to the same K01 services and tables.
8. Execute a controlled go/no-go review using migration checksum, schema version, zero-business-row evidence, contract results and rollback evidence.
9. Cut over the application release. Monitor errors, version use, constraint failures and database health; never activate a JSON or memory fallback.
10. Remove the compatibility layer and contract obsolete schema only after every known consumer has migrated, telemetry shows no use for the approved window and a separate release approval is recorded.

## 5. API versioning and compatibility

- Capture the current K01 request, response, status/error and concurrency behavior in executable baseline contract tests before changing an operation.
- Publish an explicit new API version for intentional incompatibilities. Exact paths are set by the reviewed OpenAPI; this plan does not invent endpoint names.
- Prefer additive fields and tolerant readers. Stable machine errors include a correlation ID and field errors without leaking PII or confirming account existence.
- The destination contract defines normalization, tenant/organization/location rules and optimistic concurrency. It states where idempotency is not yet provided; Package 3A must not claim Package 3E capability.
- The legacy adapter translates DTO and response shape only. It calls the same destination service/repository, persists no shadow state and cannot accept caller-controlled actor, tenant, role or authorization scope.
- Existing APIs are not removed abruptly. Deprecation requires consumer inventory, telemetry, contract tests, an announced window and release approval.
- Frontend migration is outside 3A. The backend may become compatible with gradual frontend migration, but no portal is changed in this package.

## 6. Development/test seed isolation

- Seed modules and fixtures are permitted only for automated tests and explicitly identified development environments.
- Seed execution requires an allowlisted environment plus an explicit opt-in. Production defaults to disabled and fails closed if seed execution is requested.
- Production build/start/migration paths must not import seed modules or embed demo identities.
- CI proves that a production-mode migration yields zero K01 business rows and that restarting the service does not create records.
- Test data uses synthetic values and isolated databases; it is never promoted, restored or copied into production.

## 7. Cutover and rollback procedure

Go requires: reviewed migration checksums, successful empty-database rehearsal, zero business rows, green contract/integration tests, verified database-only persistence, controlled outage behavior, schema-only restore evidence and named release/data owners.

Rollback triggers include migration failure, unexpected nonzero business rows, contract regression, PII leakage, unbounded error rate, incompatible consumer behavior or any fallback attempt. Rollback is:

1. stop new writes and preserve redacted diagnostics;
2. route traffic back to the previously approved API release where safe;
3. restore the pre-cutover empty schema snapshot or apply the rehearsed non-destructive down/forward fix;
4. verify schema version, migration checksum and zero K01 business rows;
5. keep production disabled if restoration cannot prove the invariant.

Rollback never imports legacy data and never enables JSON/in-memory behavior. RPO/RTO targets remain D48/Package 3F decisions; 3A must still measure and report rehearsal time.

## 8. Security and privacy controls

- Treat national identifiers, contacts, addresses and document metadata as restricted PII; minimize collection, mask list/error/log output and use approved application/KMS-backed encryption or keyed tokens for searchable direct identifiers.
- Use private encrypted object storage for identity-file bytes. PostgreSQL stores only opaque object key, immutable digest, media/size metadata, classification, scan/verification state and lifecycle timestamps. Public or durable download URLs are forbidden.
- Database runtime is neither owner nor superuser. Migration and runtime roles are separate; cross-tenant composite constraints prevent invalid references.
- Until Packages 3B/3C provide trusted identity and authorization context, protected production operations remain disabled/fail-closed. Client actor, tenant, organization, location and role fields never authorize an action.
- Membership never creates permission. Negative tests cover cross-tenant, cross-organization, mismatched location ownership and unauthorized document metadata access at the service/repository boundary.
- No public hard-delete endpoint exists. Legal hold prevents destructive processing. Production retention, DSR, purge and anonymization activation waits for final D44–D46 legal approval.
- Errors and migration evidence contain counts, identifiers only where non-sensitive, and correlation references—not raw PII, credentials, object URLs or digests usable for enumeration.

## 9. Acceptance criteria

1. All migrations apply to a fresh production-mode database; K01 business tables remain empty and only the explicit Didar tenant anchor/fixed technical vocabulary may exist.
2. No JSON, memory, seed, demo or test source is imported or used as fallback; PostgreSQL outage returns a controlled unavailable response.
3. D02 normalization and tenant-scoped uniqueness pass for Iranian, foreign, missing, duplicate and change/reuse cases; conflicts are privacy-safe and no automatic merge occurs.
4. D04 constraints prevent cross-tenant ownership, cross-organization parent locations and hierarchy cycles; a location cannot act as a legal organization.
5. D05 memberships are effective-dated/descriptive and contain no permission/grant semantics.
6. D06 document bytes are absent from PostgreSQL and logs; metadata integrity, private object reference, expiry and verification states are enforced.
7. D47 scope is explicit: mutable K01 policy is tenant-scoped/versioned and no implicit global fallback or cross-tenant write exists.
8. Existing K01 behavior covered by the baseline remains available through the compatibility window; intentional changes exist only in the reviewed versioned contract.
9. Stale writes fail with a stable concurrency error and correlation ID; validation/conflict/not-found/unavailable errors do not leak PII.
10. Production seed execution is rejected by default, while isolated development/test fixtures remain usable.
11. Cutover and rollback rehearsals prove migration checksum, schema state, zero imported rows and database-only persistence after restart.
12. Documentation links changed contracts/tables to the affected requirements and screens. Package 3B/3C dependencies and D44–D46 legal gates remain explicit.

## 10. Required automated tests

- **Unit:** national-ID/mobile/email normalization; foreign/missing identifier rules; masking/error mapping; membership interval rules; location cycle/ownership validation; document lifecycle transitions.
- **Database migration:** up on empty database, repeatability/checksum, schema-only restore, no business-data backfill, zero-row assertions and production seed rejection.
- **PostgreSQL integration:** composite tenant FKs, partial uniqueness, transaction rollback, optimistic concurrency, hierarchy race cases, restart persistence, runtime least privilege and controlled database outage with no fallback.
- **Contract:** baseline legacy behavior; new-version success plus validation/conflict/not-found/stale/unavailable; compatibility adapter parity; unknown/additive fields; deprecation headers/telemetry where specified.
- **Security/privacy:** caller-supplied actor/tenant/scope rejection; cross-tenant/org/location negative access; enumeration-safe conflicts; PII/log scanning; document-byte/public-URL absence; hold blocks destructive action.
- **Seed isolation:** development/test opt-in succeeds only in isolated environments; production-mode build/start/migrate rejects or omits seed code and creates no identities.
- **Operational verification:** migration/rollback rehearsal, connection interruption, process restart and evidence generation without sensitive values.

Frontend component/E2E/accessibility/localization tests are not 3A deliverables because frontend implementation is excluded. Their matrix remains blocked until the versioned API plus Packages 3B/3C are available.

## 11. Unresolved legal/privacy items

These items do not block starting schema/API implementation but block production activation of the affected behavior:

- D44: final retention durations per data class, online/archive split, policy-change treatment of existing data and authorized legal-hold release procedure.
- D45: final legal basis/controller-processor inventory, identity-proofing standard, request intake and response procedure, export/redaction format, exceptions and statutory/contractual deadlines.
- D46: final erase/anonymize/tokenize eligibility matrix, records that must be retained, irreversibility standard, token-key controls, cascade boundaries, evidence and error recovery.
- Jurisdiction-specific approval of accepted identity-document types, issuers and assurance levels must be represented as versioned tenant policy before those types are accepted in production; no provider is selected by 3A.

No placeholder duration, deadline or permissive fallback may be treated as production policy. Until approval, destructive/privacy automation is disabled and hold-safe behavior wins.

## 12. Safe implementation order

1. Confirm Package 2 green baseline and produce read-only current schema/API/consumer inventory.
2. Approve the field-level owner map and PII classification for the first vertical operation.
3. Write baseline contract tests; review the destination OpenAPI/error/concurrency contract without changing callers.
4. Finalize schema DDL design, indexes, composite constraints, database roles and production seed guard.
5. Add/rehearse additive migrations on a fresh empty database; capture zero-row and restore evidence.
6. Implement repositories and domain services in dependency order: person/contact, organization/location, membership, document metadata/reference policy.
7. Add the new API version and map the legacy compatibility adapter to the same services.
8. Complete unit, contract, PostgreSQL integration, security/privacy and no-fallback tests.
9. Rehearse cutover and rollback; conduct go/no-go review. Do not deploy production or enable protected use in 3A.
10. Update traceability, OpenAPI/deprecation records and the implementation report; hand off authenticated context to 3B and authorization scope to 3C.
11. After consumers migrate and telemetry is clean, schedule compatibility removal as a separately approved release.

## 13. Final readiness verdict

**READY to start Package 3A implementation.** The ten owner decisions, scope, schema responsibilities, compatibility approach and empty-database cutover are sufficiently defined to begin in the safe order above.

**NOT READY for production release.** Production use remains blocked by Packages 3B/3C and later platform controls, completion of Package 3A acceptance evidence, reviewed per-operation OpenAPI contracts, and final legal/privacy approval of D44–D46 details.
