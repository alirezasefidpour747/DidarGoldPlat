# Didar repository instructions for Codex

## Mandatory product and architecture context

Before planning or changing frontend, API or domain behavior, read the relevant parts of:

- `docs/architecture/prd-gap-summary-fa.md`
- `docs/architecture/prd-to-k01-k20-traceability.md`
- `docs/architecture/postgresql-blueprint-k01-k20.md`
- `docs/architecture/prototype-to-k01-k20-traceability.md` when present
- `docs/Product/frontend-requirements.md`
- `docs/Product/frontend-screen-inventory.md`
- `docs/Product/frontend-api-contract-map.md`
- `docs/Product/frontend-acceptance-criteria.md`

The interactive HTML prototype under `docs/Product/prototypes/` is a UX/workflow reference only. It is not production code, an API contract, a database model or a security model.

## Source-of-truth boundaries

- K01–K20 and shared platform services own authoritative business state.
- Frontend and portals compose approved facts and never become a second source of truth.
- Do not persist authoritative business state in localStorage, seeded arrays, JSON demo files or client-only state.
- Do not add fake auth, default actors, arbitrary OTP acceptance, random prices/codes, fake integration success or unsafe demo fallback.
- Do not invent endpoints, tables, ownership rules or cross-kernel writes when an approved contract is absent.

## Required workflow

1. Identify affected requirement IDs, screen IDs and authoritative owners before editing.
2. Check role, organization and location scope, including negative access cases.
3. Locate the approved API contract and error/idempotency behavior.
4. Record conflicts or missing decisions instead of silently choosing an interpretation.
5. Implement the smallest vertical slice that uses durable secured APIs.
6. Add proportional unit, component, contract, integration and E2E verification.
7. Update traceability and relevant documentation when behavior changes.

## Frontend quality rules

- Persian RTL is primary; maintain LTR behavior for English/French and RTL for Arabic.
- Implement loading, empty, error, denied, expired-session, stale and success states for every data screen.
- Target WCAG 2.2 AA and verify keyboard/focus behavior.
- Do not treat hidden UI controls as authorization.
- Do not calculate authoritative price, balance, ownership, credit or approval state in the browser.

## Stop conditions

Stop and report the exact missing decision when:

- Two documents assign different authoritative owners.
- A screen requires a production API contract that does not exist.
- A requested flow depends on unresolved PRD conflicts.
- Completion would require a demo fallback or bypassing security/persistence.

Keep chat responses short. Write substantial audits, specifications and implementation reports to repository files and return their paths.
