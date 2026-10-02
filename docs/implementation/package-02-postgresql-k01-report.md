# Package 02 — PostgreSQL Foundation and K01 Pilot Migration Report

Date: 2026-09-21 (Asia/Tehran)

## Outcome and release status

Package 2 implements real PostgreSQL connectivity, a versioned Drizzle migration, reusable pool/query/transaction primitives, PostgreSQL-backed K01 routes, an idempotent transactional importer, and PostgreSQL integration tests. Production release remains frozen. Authentication, RBAC enforcement, and K02–K20 migration were not started.

Verification status is **passed in clean-schema mode**. The owner classified every legacy K01 JSON record as demonstration/test data and directed that none be migrated. Real-data migration is therefore `NOT APPLICABLE — OWNER CONFIRMED DEMO DATA ONLY`. A fresh migration creates all five K01 tables with zero rows; the production runtime remains empty across restart even while the legacy Docker volume is attached read-only.

## Starting point and preservation

- Starting branch: `main`
- Starting commit: `e68ecead94def23d0d8ad29ad480363827c2db0b`
- Starting evidence read before implementation:
  - `docs/audits/production-readiness-baseline.md`
  - `docs/implementation/package-01-containment-report.md`
- The working tree was already dirty with the complete uncommitted Package 1 change set. It was preserved. No reset, checkout, stash, commit, history rewrite, business-data deletion, database reset, Docker volume deletion, or deployment command was run.
- Initial `git status --short`:

```text
 M .env.example
 M .github/workflows/deploy.yml
 M .gitignore
 M DEPLOYMENT.md
 M Dockerfile
 M docker-compose.yml
 M package.json
 M scripts/dev.ts
 M server.ts
 M server/database/database.engine.ts
 M server/lib/database.ts
 M server/lib/supabase.ts
 M server/services/architecture.service.ts
 M server/storage-k16.ts
 M server/storage-paas.ts
 M src/components/k01/SupabaseStatusModal.tsx
 M src/components/layout/AdminLayout.tsx
 M src/components/paas/PaaSDashboard.tsx
 M src/lib/api.ts
 M src/types/paas.ts
?? .dockerignore
?? .secret-scanner.json
?? docs/
?? scripts/secret-scan.ts
```

## Files and dependencies changed for Package 2

Package 2 added or materially changed:

- Configuration/build/operations: `.env.example`, `.github/workflows/deploy.yml`, `.gitignore`, `DEPLOYMENT.md`, `Dockerfile`, `package.json`, `bun.lock`, `docker-compose.integration.yml`, `drizzle.config.ts`, `vitest.integration.config.ts`.
- Migration artifacts: `drizzle/0000_k01_foundation.sql`, `drizzle/meta/_journal.json`, `drizzle/meta/0000_snapshot.json`.
- Database/runtime: `server/database/client.ts`, `server/database/schema.ts`, `server/lib/database.ts`, `server/lib/supabase.ts`, `server.ts`.
- K01 active persistence: `server/repositories/k01.repository.ts`, `server/services/k01.service.ts`, `server/services/k01-import.service.ts`, `server/routes/k01.ts`.
- Operator scripts: `scripts/db-migrate.ts`, `scripts/db-status.ts`, `scripts/import-k01.ts`.
- Tests: `tests/integration/k01-postgres.test.ts`, `tests/fixtures/k01-import.json`.
- Truthful UI/telemetry labels: `server/services/architecture.service.ts`, `server/storage-paas.ts`, `server/storage.ts` comments, `src/components/k01/SupabaseStatusModal.tsx`, `src/components/paas/PaaSDashboard.tsx`, `src/lib/api.ts`.

Dependencies added through Bun 1.4.2 and recorded in the committed `bun.lock`:

- Runtime: `drizzle-orm`, `pg`.
- Development/test/migration tooling: `drizzle-kit`, `@types/pg`, `vitest`, `supertest`, `@types/supertest`.
- The duplicate `vite` declaration was removed from `devDependencies`; no application dependency was intentionally upgraded. The lockfile was changed only by `bun install --lockfile-only` using Bun 1.4.2 and subsequently passed a frozen install.

## Database architecture

- `server/database/client.ts` owns validated `DATABASE_URL` access, a lazy `pg.Pool`, a lazy Drizzle client, raw parameterized query execution, transaction execution, and graceful pool shutdown.
- Importing the module does not establish a connection. The first query, migration, or transaction creates the pool.
- Pool size, idle timeout, connect timeout, query timeout, and readiness timeout are bounded and configurable without logging the connection string.
- `withTransaction` supplies one Drizzle transaction object. Transactional queries are serialized on the single checked-out node-postgres client.
- Application and operator errors expose controlled messages; migration/status scripts do not print driver/connection details, and K01 route failures return stable error codes without raw database errors.
- `SIGTERM`/`SIGINT` stop HTTP acceptance and close the PostgreSQL pool.
- The production image remains non-root, includes migration/import assets, uses the committed lockfile with `--frozen-lockfile`, and does not run migrations or imports at startup.

## Migration and K01 schema

Versioned migration: `drizzle/0000_k01_foundation.sql`.

The schema was derived from `src/types/k01.ts` and the legacy K01 aggregate shape. It contains five K01-only tables:

1. `k01_parties`: text primary key with database default `party-<UUID>`, party type/status/verification checks, required names/mobile/timestamps/version, version and mobile checks, unique mobile, partial unique national ID, status indexes, and typed profile JSONB fields already present in the model.
2. `k01_organizations`: text primary key with database default `org-<UUID>`, organization type/status/verification/version checks, required legal/display names/phone/timestamps, partial unique national legal ID, status indexes, and typed existing profile JSONB fields.
3. `k01_memberships`: text primary key with database default `mem-<UUID>`, required party/organization foreign keys with restricted delete and cascading key update, role/title/authority/status/date fields, date-range check, and indexes on both foreign keys, their pair, and status.
4. `k01_documents`: text primary key with database default `doc-<UUID>`, target/document/verification/file-size checks and target/status indexes. The existing model uses a polymorphic `targetType`/`targetId`; target existence is therefore validated inside the same service/import transaction rather than represented by an invalid polymorphic SQL foreign key.
5. `k01_audit_events`: text primary key with database default `audit-<UUID>`, required actor/action/target/description/time fields, action and target-type checks, and target/time indexes.

New runtime records use PostgreSQL-generated cryptographic UUIDs. Timestamp-plus-`Math.random()` identifiers are not used by the active K01 repository/service.

## K01 repository, service, and transaction boundaries

- Active K01 routes no longer import or call `server/storage.ts`; all reads and writes go through `K01Repository` and `K01Service`.
- The legacy JSON implementation remains present because unmigrated K02/K03 code still references it, but it is disconnected from active K01 HTTP routes.
- Person creation, organization creation, membership creation, document creation, person updates, organization updates, and status/audit changes execute their entity mutation and audit record in one PostgreSQL transaction.
- Membership creation validates both foreign-key targets within its transaction. Document creation validates its polymorphic target within its transaction.
- Optimistic versions are retained for person and organization updates.
- PostgreSQL errors map to controlled validation/conflict/unavailable responses. A database failure never invokes JSON, seed, or in-memory K01 fallback logic.
- An integration test inserts a party and throws before commit; the subsequent read proves the party was rolled back.

## K01 import and count evidence

Importer behavior:

- Reads the configured JSON source as input only.
- Requires the five aggregate arrays, validates record shape/enums/dates/constraints before insertion, and reports invalid, conflicting, or missing-reference records by entity type and identifier without printing record contents.
- Copies the source with `COPYFILE_EXCL` to a timestamped path before opening the database transaction.
- Preserves existing identifiers/timestamps when valid.
- Runs all accepted inserts in one transaction and tracks newly inserted source records in its conflict/reference maps.
- Treats an identical existing identifier as skipped and a differing or unique-key-colliding record as a conflict.
- Compares source counts with post-import destination counts and never runs at server startup.

Owner-classified legacy source:

- Located at `didargoldplat_didar_data:/didar-kernel-store.json` and exposed historically as `/app/data/didar-kernel-store.json`.
- Owner classification: demonstration/test data only; not authoritative production data.
- Real-data migration: `NOT APPLICABLE — OWNER CONFIRMED DEMO DATA ONLY`.
- Legacy records exported: 0. Legacy records imported: 0. Legacy records copied to PostgreSQL: 0.
- Approved PostgreSQL K01 starting state: all five K01 business tables at zero rows.
- The operator script now requires an explicit `K01_IMPORT_FILE` and refuses the owner-classified default legacy path. No import runs at application startup.

Automated-test-only fixture evidence:

- Source: 1 person, 1 organization, 1 membership, 1 document, 1 audit event (5 records total).
- First import: 5 inserted, 0 skipped, 0 rejected; destination counts matched 1/1/1/1/1.
- Second import: 0 inserted, 5 skipped, 0 rejected; destination counts remained 1/1/1/1/1.
- Invalid/conflicting test input: 0 additional persons inserted; 2 records reported (1 conflict and 1 invalid record).
- The fixture is stored only under `tests/fixtures/`, is loaded only by the automated integration suite, and all inserted fixture/test rows are deleted by final test cleanup.

Rollback/restore procedure is documented in `DEPLOYMENT.md`: retain the source and timestamped backup, take a PostgreSQL-native backup before rollback, restore into a separate database, use an application/migration version compatible with that backup, and compare record counts before cutover. No automatic down migration, reset, or volume deletion was added.

## API compatibility and readiness behavior

- `GET /api/health/live` is unchanged and reports only process liveness.
- `GET /api/health/ready` executes a real `SELECT 1` within `DATABASE_READINESS_TIMEOUT_MS`.
- PostgreSQL reports `ready` only when the query result is verified, `not_configured` when no URL is supplied, and `unavailable` on connection/query failure. No URL-prefix inference or fallback exists.
- Overall production readiness remains HTTP 503 even when PostgreSQL is ready because authentication, authorization, K02–K20 persistence, and integrations remain incomplete. The response truthfully reports PostgreSQL as `ready` in that case.
- The main K01 GET aggregate and create/update response envelopes remain `{ success: true, data: ... }` where practical.
- Existing database/Supabase-named health aliases now expose the same real PostgreSQL probe for compatibility.
- Legacy JSON backup/Supabase sync mutation endpoints return 501 instead of writing JSON or simulating cloud sync.
- K01 endpoints remain unsafe for production until authentication and RBAC enforcement are completed; this warning is logged at startup and documented.

## CI, Compose, and container behavior

- `docker-compose.integration.yml` defines a dedicated PostgreSQL test service and application service with required test-only environment variables and an isolated named volume.
- CI uses a PostgreSQL 16 service and runs the 13-test K01 integration suite after frozen install, scan, typecheck, and build.
- All third-party CI actions remain pinned to immutable commit SHAs.
- The deployment job is explicitly disabled with `if: ${{ false }}` because production release is frozen.
- Main and integration Compose files both validate with explicit placeholder-only test configuration.
- The production image includes the migration journal/SQL and operator scripts, runs as `bun`, serves the built frontend as configured, and exposes/health-checks port 3000.
- No migration or import is automatic. Operators run `db:migrate` and `db:status` explicitly. Clean-schema deployment does not run `db:import:k01`.

## Automated test coverage

`tests/integration/k01-postgres.test.ts` runs against an isolated real PostgreSQL database and covers:

- migrations on an empty database;
- K01 JSON import and timestamped source backup;
- repeated import without duplication;
- invalid and conflicting records;
- person and organization creation with UUID-based IDs;
- membership creation and joined response names;
- update/read behavior with optimistic versioning;
- PostgreSQL foreign-key and uniqueness enforcement;
- transaction rollback after a partial write;
- backend pool close/reopen persistence;
- K01 GET API envelope compatibility;
- real readiness-query success;
- database outage, controlled K01 failure, readiness failure, and absence of JSON fallback.
- final deletion of all isolated test rows and a zero-row K01 aggregate assertion.

Clean-schema runtime verification additionally proved that all tables remained empty across application/container restart while `didargoldplat_didar_data` was mounted read-only. One temporary API-created person and its audit event survived a later restart, then exact test cleanup removed both and returned all five K01 tables to zero rows.

## Verification log

No success is claimed for a failed or unavailable command. Test-only credentials below are non-production placeholders and are not usable external credentials.

| Verification | Exact command | Exit code | Result / blocker |
|---|---|---:|---|
| Direct host typecheck attempt | `bun run typecheck` | 127 | Host Bun is unavailable. |
| Initial container script-name attempt | `docker run --rm -v /Users/arashthearcher/DidarGoldPlat:/work -w /work oven/bun:1.4.2-alpine bun run typecheck` | 1 | No `typecheck` script exists; repository typecheck script is `lint`. |
| Final TypeScript typecheck | `docker run --rm -v /Users/arashthearcher/DidarGoldPlat:/work -w /work oven/bun:1.4.2-alpine bun run lint` | 0 | Passed: `tsc --noEmit`. |
| Lockfile metadata update | `docker run --rm -v /Users/arashthearcher/DidarGoldPlat:/work -w /work oven/bun:1.4.2-alpine bun install --lockfile-only` | 0 | Bun updated `bun.lock` for the declared Package 2 dependencies and duplicate-Vite cleanup; 420 packages recorded. |
| Frozen dependency validation | `docker run --rm -v /Users/arashthearcher/DidarGoldPlat:/work -w /work oven/bun:1.4.2-alpine bun install --frozen-lockfile` | 0 | Passed with 420 packages and no changes. |
| Migration generation | `docker run --rm -v /Users/arashthearcher/DidarGoldPlat:/work -w /work oven/bun:1.4.2-alpine bun run db:generate --name=k01_foundation` | 0 | Generated `0000_k01_foundation.sql` and Drizzle metadata. |
| Integration Compose validation | `K01_TEST_DB_USER=k01_test K01_TEST_DB_PASSWORD=local-placeholder K01_TEST_DB_NAME=k01_test K01_TEST_DATABASE_URL=postgresql://k01_test:local-placeholder@k01-test-db:5432/k01_test docker compose -p didar_pkg2_20260921d -f docker-compose.integration.yml config --quiet` | 0 | Passed. |
| Production Compose validation | `CORS_ALLOWED_ORIGINS=https://app.example.invalid DATABASE_URL=postgresql://didar_app:local-placeholder@didar-db:5432/didar_gold POSTGRES_USER=didar_app POSTGRES_PASSWORD=local-placeholder POSTGRES_DB=didar_gold docker compose config --quiet` | 0 | Passed without printing interpolated configuration. |
| Migration execution | `docker run --rm --network didar_pkg2_20260921c_default -v /Users/arashthearcher/DidarGoldPlat:/work -w /work -e DATABASE_URL=postgresql://k01_test:local-placeholder@k01-test-db:5432/k01_test oven/bun:1.4.2-alpine bun run db:migrate` | 0 | Applied the versioned migration to a fresh isolated database. |
| Migration status | `docker run --rm --network didar_pkg2_20260921e_default -v /Users/arashthearcher/DidarGoldPlat:/work -w /work -e DATABASE_URL=postgresql://k01_test:local-placeholder@k01-test-db:5432/k01_test oven/bun:1.4.2-alpine bun run db:status` | 0 | `expectedMigrations=1`, `appliedMigrations=1`, `current=true`. |
| Automated fixture import/idempotency | `docker run --rm --network didar_pkg2_clean_20260921_default -v /Users/arashthearcher/DidarGoldPlat:/work -w /work -e NODE_ENV=test -e DATABASE_URL=postgresql://k01_clean:local-placeholder@k01-test-db:5432/k01_clean -e K01_TEST_DATABASE_URL=postgresql://k01_clean:local-placeholder@k01-test-db:5432/k01_clean oven/bun:1.4.2-alpine bun run test:integration` | 0 | Passed 14 tests; fixture use stayed inside the automated test process and final cleanup returned every table to zero. |
| Production build | `docker run --rm -v /Users/arashthearcher/DidarGoldPlat:/work -w /work oven/bun:1.4.2-alpine bun run build` | 0 | Passed. Vite retained non-fatal CSS import-order and large-chunk warnings. |
| Final production image | `docker build -t didargoldplat-package02:verification-final .` | 0 | Passed both frozen installs, frontend build, backend bundle, non-root runner creation, and migration/script copying. |
| Final liveness | `curl --retry 10 --retry-delay 1 --retry-connrefused --silent --show-error -w '\nHTTP %{http_code}\n' http://127.0.0.1:3104/api/health/live` | 0 | HTTP 200; process-only body. |
| Final readiness success-path | `curl --silent --show-error -w '\nHTTP %{http_code}\n' http://127.0.0.1:3104/api/health/ready` | 0 | Endpoint returned expected HTTP 503 overall while `dependencies.postgresql` was `ready` after a real query. |
| Allowed CORS and K01 API smoke | `curl --silent --show-error -H 'Origin: https://integration.example.invalid' -w '\nHTTP %{http_code}\n' http://127.0.0.1:3104/api/admin/kernel/k01` | 0 | HTTP 200 with K01 aggregate from PostgreSQL and exact allow-origin behavior. |
| Rejected CORS | `curl --silent --show-error -H 'Origin: https://unauthorized.example.invalid' -w '\nHTTP %{http_code}\n' http://127.0.0.1:3104/api/health/live` | 0 | Expected HTTP 403 with a non-sensitive message. |
| Container/backend restart | `docker restart didar-package02-final-runtime` | 0 | Final production container and backend process restarted successfully. |
| Clean initial/restart state | metadata-only requests to `/api/admin/kernel/k01` before and after `docker restart didar-package02-clean-runtime` | 0 | Persons, organizations, memberships, documents, and audit logs were all zero both times with the legacy volume mounted read-only. |
| Temporary API persistence | metadata-only POST/GET plus `docker restart didar-package02-clean-runtime` | 0 | One temporary person and one audit event survived restart; no other table gained rows. |
| Exact test cleanup | isolated SQL transaction deleting the temporary audit and person by the test-only mobile value | 0 | Deleted exactly one audit and one person; final SQL and API counts were zero for all five tables. |
| Database outage behavior | `curl --retry 10 --retry-delay 1 --retry-connrefused --silent --show-error -w '\nHTTP %{http_code}\n' http://127.0.0.1:3103/api/health/live && curl --silent --show-error -w '\nHTTP %{http_code}\n' http://127.0.0.1:3103/api/health/ready && curl --silent --show-error -w '\nHTTP %{http_code}\n' http://127.0.0.1:3103/api/admin/kernel/k01` | 0 | Liveness 200; readiness 503 with PostgreSQL `unavailable`; K01 503 `DATABASE_UNAVAILABLE`; no JSON response/fallback. |
| First two secret-scan container attempts | `docker run --rm -v /Users/arashthearcher/DidarGoldPlat:/work -w /work oven/bun:1.4.2-alpine bun run scan:secrets` and equivalent full Bun image | 1 each | Both images lacked Git, which the scanner uses to enumerate tracked/non-ignored files. No scan success claimed. |
| Secret-scan false-positive run | `docker run --rm -v /Users/arashthearcher/DidarGoldPlat:/work -w /work oven/bun:1.4.2-alpine sh -lc 'apk add --no-cache git >/dev/null && bun run scan:secrets'` | 1 | Correctly reported one credential-URL-shaped test placeholder with the value redacted; the fixture URL was changed to the scanner's documented safe placeholder. |
| Final secret scan | same preceding command | 0 | Passed for 265 tracked/non-ignored files; no matched values printed. |
| Git diff validation | `git diff --check` | 0 | Passed. |
| Business-data preservation | `git status --short -- data tests/fixtures && git diff -- data && git ls-files data` | 0 | No tracked business-data change; K02/K03 JSON files and the legacy Docker volume remain untouched. |
| Verification cleanup | `docker stop -t 5 didar-package02-runtime didar-package02-outage didar-package02-final-runtime` plus `docker compose ... stop` for isolated projects `a` through `e` | 0 | Temporary containers stopped. All isolated PostgreSQL volumes were preserved; no `down`, `down -v`, reset, prune, or volume deletion was used. |

## Failed or unavailable verification

- Real-data import/count comparison is not applicable because the owner classified the legacy records as demo/test-only and prohibited migration.
- Host Bun is not installed. All successful Bun checks used the repository-pinned `oven/bun:1.4.2-alpine` toolchain.
- Minimal Bun images do not include Git, so the scanner required an ephemeral `apk add --no-cache git`; CI runners already include Git.
- The production build passes but retains an existing CSS `@import` ordering warning and a large frontend chunk warning.
- No production backup/restore drill was run; only isolated databases and volumes were used.

## Remaining blockers

1. Authentication and request-boundary RBAC enforcement remain unimplemented; K01 endpoints are not safe for production exposure.
2. K02–K20 remain unmigrated and retain legacy JSON/in-memory behavior; platform-wide ACID/WAL/durability claims remain invalid.
3. Production backup/restore, high-availability, rate limiting, CSRF, and operational observability remain unverified.
4. Package 1 identified exposed historical credential fallbacks. Any database/JWT values ever deployed or reused from them still require manual owner rotation outside the repository; no external credential was rotated here.

## Final diff and status

`git diff --stat`:

```text
 .env.example                               |  78 +++++++-
 .github/workflows/deploy.yml               |  50 +++--
 .gitignore                                 |   6 +
 DEPLOYMENT.md                              |  81 +++++---
 Dockerfile                                 |  35 ++--
 bun.lock                                   | 252 ++++++++++++++++++++++--
 docker-compose.yml                         |  28 +--
 package.json                               |  29 ++-
 scripts/dev.ts                             |  29 +--
 server.ts                                  | 195 +++++++++++--------
 server/database/database.engine.ts         |  71 ++++---
 server/lib/database.ts                     | 198 ++++++++-----------
 server/lib/supabase.ts                     |  33 ++--
 server/routes/k01.ts                       | 302 ++++++-----------------------
 server/services/architecture.service.ts    | 203 ++++++++-----------
 server/storage-k16.ts                      |  14 +-
 server/storage-paas.ts                     |  66 +++----
 server/storage.ts                          |   4 +-
 src/components/k01/SupabaseStatusModal.tsx |  93 +++------
 src/components/layout/AdminLayout.tsx      |   2 +-
 src/components/paas/PaaSDashboard.tsx      |  72 +++----
 src/lib/api.ts                             |  18 +-
 src/types/paas.ts                          |  10 +-
 23 files changed, 1000 insertions(+), 869 deletions(-)
```

This stat is cumulative because Package 1 remains uncommitted and was intentionally preserved; untracked Package 1 and Package 2 files are not included by plain `git diff --stat`.

Final `git status --short`:

```text
 M .env.example
 M .github/workflows/deploy.yml
 M .gitignore
 M DEPLOYMENT.md
 M Dockerfile
 M bun.lock
 M docker-compose.yml
 M package.json
 M scripts/dev.ts
 M server.ts
 M server/database/database.engine.ts
 M server/lib/database.ts
 M server/lib/supabase.ts
 M server/routes/k01.ts
 M server/services/architecture.service.ts
 M server/storage-k16.ts
 M server/storage-paas.ts
 M server/storage.ts
 M src/components/k01/SupabaseStatusModal.tsx
 M src/components/layout/AdminLayout.tsx
 M src/components/paas/PaaSDashboard.tsx
 M src/lib/api.ts
 M src/types/paas.ts
?? .dockerignore
?? .secret-scanner.json
?? docker-compose.integration.yml
?? docs/
?? drizzle.config.ts
?? drizzle/
?? scripts/db-migrate.ts
?? scripts/db-status.ts
?? scripts/import-k01.ts
?? scripts/secret-scan.ts
?? server/database/client.ts
?? server/database/schema.ts
?? server/repositories/k01.repository.ts
?? server/services/k01-import.service.ts
?? server/services/k01.service.ts
?? tests/
?? vitest.integration.config.ts
```

## Data-preservation confirmation

No K01–K20 business JSON data or legacy Docker-volume record was modified or deleted. The owner-classified K01 demo file remained in `didargoldplat_didar_data` and was mounted read-only for the clean-schema proof. Tracked K02/K03 JSON files have no diff. The only K01 JSON fixture is under `tests/fixtures/`, is used only by automated tests, and its database rows are removed by test cleanup.
