# Package 02 — K01 Authoritative Source Investigation

Date: 2026-09-21 (Asia/Tehran)

## Conclusion

`AUTHORITATIVE_SOURCE_FOUND`

The expected K01 JSON file exists in the pre-existing Docker named volume `didargoldplat_didar_data`, at volume-relative path `/didar-kernel-store.json`. That volume is mounted by the historical application container at `/app/data`, making the application-visible path `/app/data/didar-kernel-store.json`.

The file was not restored, copied, moved, imported, or printed. Investigation used a read-only volume mount and reported only filename, metadata, aggregate counts, a cryptographic hash, and structural/provenance booleans.

## Owner resolution after investigation

The owner subsequently confirmed that every record in this legacy K01 file is demonstration/test data. It is not an authoritative migration input and must not be exported, copied, or imported into PostgreSQL. Package 2 therefore proceeds in clean-schema mode with zero initial K01 business records. This decision supersedes the provisional export/import next action recorded during the investigation.

## Scope and preservation

- This was a read-only investigation except for this required report.
- Application code, Git history, database contents, Docker volume contents, business data, and all pre-existing working-tree changes were left untouched.
- No container, database, or volume was started, stopped, removed, reset, or modified. Ephemeral inspection containers mounted relevant volumes read-only.
- No candidate record contents, identifiers, names, contact information, addresses, or other PII were printed.
- No secret values are included in this report.

## Evidence summary

### Repository and parent-directory search

- `data/didar-kernel-store.json` is absent from the current workspace filesystem.
- An exact-name search under `/Users/arashthearcher`, excluding `.git`, `node_modules`, `Library`, and `.Trash`, found no ordinary host file with that name.
- A second local checkout exists at `/Users/arashthearcher/Documents/GitHub/DidarGoldPlat`. It also has no working-tree or Git-history copy of the expected file.
- Host-side candidates were limited to:
  - tracked K02/K03 JSON stores, which are different domain data;
  - `tests/fixtures/k01-import.json`, which is explicitly synthetic;
  - two ignored `data/import-backups/` files whose SHA-256 hashes exactly match the synthetic fixture. They are test-import backups, not an authoritative predecessor.

Commands used:

```text
find /Users/arashthearcher -maxdepth 7 (...) -type f -name 'didar-kernel-store.json' -print
find /Users/arashthearcher -maxdepth 7 (...) -type f \( -iname '*k01*.json' -o -iname 'didar*store*.json' ... \) -print
find data -maxdepth 4 -type f -print
shasum -a 256 tests/fixtures/k01-import.json data/import-backups/*.json
```

### Ignore behavior

- The expected path is **not ignored** by the current `.gitignore`; `git check-ignore -v --no-index data/didar-kernel-store.json` exited 1.
- The original committed `.gitignore` also did not ignore it.
- Package 2 added only `data/import-backups/` to `.gitignore`; this excludes importer-created backups, not the expected source path.

Commands used:

```text
git check-ignore -v --no-index data/didar-kernel-store.json
git check-ignore -v --no-index data/import-backups/example.json
git show HEAD:.gitignore
```

### Git history, branches, tags, stashes, and reflog

- `git log --all --full-history -- data/didar-kernel-store.json` found no commit containing or changing the path.
- `git rev-list --objects --all` found no object path matching the expected file or another K01 JSON source.
- Current refs inspected:
  - `main`;
  - `backup-local-changes-before-sync`;
  - `origin/main` and `origin/HEAD`.
- No tag exists and the stash list is empty.
- Tree inspection of every local/current ref found only `data/didar-k02-store.json` among matching store patterns.
- Reflog commits were inspected; none contained the expected path.
- `git fsck --full --unreachable --no-reflogs` reported no unreachable commit to inspect.
- The second local checkout likewise has no matching object/path, tag, stash, or alternate branch containing the file.
- The initial project commit already contained `server/storage.ts` referencing the path, but did not contain the JSON file. `git cat-file -e <initial-commit>:data/didar-kernel-store.json` exited 128.

Commands used:

```text
git log --all --full-history --name-status --find-renames --find-copies -- data/didar-kernel-store.json
git rev-list --objects --all | rg -i 'didar-kernel-store|k01.*\.json|json.*k01'
git branch --all --no-color
git tag --list
git stash list
git for-each-ref --format='%(refname) %(objectname)' refs/heads refs/remotes refs/tags refs/stash
git reflog --all --date=iso
git log -g --all --full-history --name-status -- data/didar-kernel-store.json
git ls-tree -r --name-only main
git ls-tree -r --name-only backup-local-changes-before-sync
git fsck --full --unreachable --no-reflogs
git cat-file -e f137485ffba0f0eca4cd80977e1f607a59df621f:data/didar-kernel-store.json
```

### Package 1 and Package 2 treatment

- The Package 1 initial status contained no deletion or rename of the expected source.
- Git history proves the file was never tracked, so neither package could have deleted or renamed a tracked copy.
- The only Package 2 change to `server/storage.ts` is its explanatory header comment; `DATA_FILE`, `loadStore`, seed initialization, and write behavior are unchanged from the initial project commit.
- Compose retained the historical named-volume mount `didar_data:/app/data` before and after containment work.
- Package 2 did not exclude the expected file; it added only the importer backup directory to `.gitignore`.
- Package 2 did not create a host-side replacement and did not import from the Docker-volume candidate.

Commands used:

```text
git diff -- server/storage.ts
git diff --name-status HEAD -- data/didar-kernel-store.json server/storage.ts docker-compose.yml .gitignore
git show HEAD:docker-compose.yml | rg -n 'volumes:|/app/data|didar_data'
git show backup-local-changes-before-sync:docker-compose.yml | rg -n 'volumes:|/app/data|didar_data'
```

### Docker volume and historical runtime location

- Docker volume inventory contains `didargoldplat_didar_data` and `didargoldplat_postgres_data`, plus the isolated Package 2 test database volumes.
- `didargoldplat_didar_data` was created on 2026-09-19 at 08:28:28 UTC and is labeled as Compose project `didargoldplat`, volume `didar_data`.
- Filename-only inspection through a read-only mount found:
  - `/didar-kernel-store.json`;
  - the legacy RBAC, K02, K03, and K04 store files.
- The historical container `didar_gold_kernel` mounts `didargoldplat_didar_data` at `/app/data` with its normal runtime configuration. The candidate file's modification time predates the currently recorded container creation time, demonstrating persistence across at least one container recreation.
- The main PostgreSQL volume contains no filename matching the K01 JSON source or JSON backup patterns.
- The isolated Package 2 PostgreSQL volumes are test databases, not source-file locations.

Commands used:

```text
docker volume ls --format '{{.Name}}'
docker volume inspect didargoldplat_didar_data didargoldplat_postgres_data --format '<metadata-only format>'
docker ps -a --format '{{.Names}}' | ... docker inspect ... '<mount-metadata-only format>'
docker inspect didar_gold_kernel --format '<timestamps/image/mount-metadata-only format>'
docker run --rm -v didargoldplat_didar_data:/scan:ro alpine:3.20 find /scan -maxdepth 4 -type f -print
docker run --rm -v didargoldplat_postgres_data:/scan:ro alpine:3.20 find /scan -maxdepth 5 -type f \( -name 'didar-kernel-store.json' -o -iname '*k01*.json' ... \) -print
```

### Runtime creation and seed initialization

`server/storage.ts` has always implemented the following behavior:

1. `DATA_DIR` is `path.join(process.cwd(), 'data')`.
2. `DATA_FILE` is `data/didar-kernel-store.json` relative to the process working directory.
3. Merely importing the module creates the directory if missing, but does not create the JSON file.
4. The first call to `loadStore()` reads the file when present.
5. If the file is absent or unreadable, `loadStore()` calls `getInitialSeedData()`, writes that seed synchronously to the path, caches it, and returns it.
6. Legacy K01 CRUD, K02 cross-domain audit writes, RBAC queries, and the generic kernel repository can trigger `loadStore()`.

Therefore, the original design intentionally materialized K01 from built-in seed data on first runtime access when the file was absent. The file was not intended to be present in Git.

The volume candidate has these non-content characteristics:

- valid K01 aggregate keys: `persons`, `organizations`, `memberships`, `documents`, `auditLogs`, and `counts`;
- counts: 4 persons, 4 organizations, 3 memberships, 2 documents, and 2 audit events;
- 15 aggregate record identifiers, all of which are literal identifiers in the built-in seed definition;
- all recorded timestamps are identical;
- aggregate counts match array lengths;
- the file timestamp is consistent with runtime seed materialization in the Docker volume.

This is strong evidence that the discovered authoritative runtime file is the built-in seed snapshot, with no structural evidence of later K01 additions. It is still the exact persisted pre-migration K01 runtime source and must not be silently replaced or regenerated.

Commands used:

```text
git show HEAD:server/storage.ts | rg -n -C 8 'DATA_FILE|function getInitialSeedData|export function loadStore|saveStoreImmediate|export async function saveStore|cachedData'
rg -n -C 3 '\bloadStore\(\)|\bsaveStore\(' server --glob '*.ts'
docker run --rm -v didargoldplat_didar_data:/scan:ro oven/bun:1.4.2-alpine bun -e '<structural-metadata-only parser>'
docker run --rm -v didargoldplat_didar_data:/scan:ro -v /Users/arashthearcher/DidarGoldPlat:/work:ro oven/bun:1.4.2-alpine bun -e '<seed-provenance boolean comparison>'
```

## Sensitive-data assessment

- The Docker-volume candidate contains non-empty fields whose schema is PII- or business-sensitive, including identity/contact/address-style fields.
- No field values were printed or included in this report.
- Structural evidence strongly indicates the file was generated from the repository's built-in demonstration seed, but this investigation cannot certify that every name or identifier is fictional. It must be handled as sensitive until the owner confirms provenance and classification.
- The synthetic test fixture and its identical import backups are not authoritative and contain only deliberately constructed integration-test records.

## Package 2 acceptance impact

Package 2 acceptance remains blocked until the authoritative volume file is handled with owner approval. The source is no longer missing in an absolute sense, but it is outside the workspace in a persistent runtime volume and contains sensitive-shaped data. The required timestamped export/backup, approved import, count reconciliation, conflict review, and restart verification have not been performed against it.

## Safest next action

Retain the Docker volume because K02, K03, RBAC, and other legacy storage paths may still depend on it, but do not export or import its K01 demo file. Initialize PostgreSQL K01 from the versioned migration with zero rows and verify that no runtime seed or JSON fallback appears.

## Owner approval and external access

- Owner data-classification approval: **received** — legacy K01 records are demo/test-only.
- Export/import authorization: **not granted and not required** — the records must not be migrated.
- External backup required for Package 2 K01 migration: **no** — migration starts from an empty schema. The legacy volume must still be preserved for other modules.

## Final `git status --short`

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

Because `docs/` was already untracked as a directory, the short status representation is unchanged by adding this report.

## No-change confirmation

No application code, Git ref/history, database, Docker volume, candidate source, backup, or business-data file was changed. The only filesystem write performed for this investigation is this required report: `docs/implementation/package-02-k01-source-investigation.md`.
