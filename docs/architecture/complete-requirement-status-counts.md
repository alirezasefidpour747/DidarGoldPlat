# Complete PRD Requirement Status Counts

**Audit date:** 2026-09-23  
**Source matrix:** `docs/architecture/prd-to-k01-k20-traceability.md`  
**Unit of count:** Distinct preserved requirement ID

## Result

All 143 extracted PRD requirements have exactly one explicit maturity status. No duplicate requirement ID and no unclassified row was found.

| Status | Count | Meaning |
|---|---:|---|
| `FULL` | 34 | Current design covers the requirement; implementation may still be absent |
| `PART` | 58 | Material design coverage exists but behavior, policy or implementation remains incomplete |
| `MISS` | 13 | Sufficient design/capability is absent |
| `CONFLICT` | 10 | The source evidence contained a naming/ownership contradiction |
| `DEMO` | 8 | Only seeded, hard-coded, process-memory or mock behavior exists |
| `FE` | 6 | A frontend concept exists without a production backend capability/contract |
| `OWNER` | 3 | Classification cannot be closed without a product/legal/operational owner decision |
| `DEFER` | 10 | Requirement is retained but explicitly deferred |
| `OOS` | 1 | Explicitly outside product scope |
| **Total** | **143** | **Complete** |

The previously quoted 34 `FULL` + 58 `PART` + 13 `MISS` + 10 `CONFLICT` equals 115. The remaining **28** are exactly:

- 8 `DEMO`
- 6 `FE`
- 3 `OWNER`
- 10 `DEFER`
- 1 `OOS`

Thus `115 + 28 = 143`. `OUT` has zero rows because each outside-K01–K20 requirement was assigned the more precise observed status above. Destination and maturity are separate dimensions: a requirement can belong to BI, PaaS, MDM, shared security, an integration or a portal and still be `FULL`, `PART`, `DEMO`, `FE`, `MISS`, `OWNER` or `DEFER`.

## Complete status inventory

### FULL — 34

`PRD-FND-001`, `PRD-FND-003`, `PRD-FND-004`, `PRD-FND-006`, `PRD-FND-015`, `PRD-FND-021`, `PRD-FND-022`, `PRD-FND-024`, `PRD-FND-033`, `PRD-FND-046`, `PRD-SEC-001`, `PRD-SEC-002`, `PRD-SEC-003`, `PRD-DATA-001`, `PRD-GOV-002`, `PRD-BIZ-014`, `PRD-OPS-001`, `PRD-OPS-003`, `PRD-OPS-004`, `PRD-OPS-005`, `PRD-OPS-007`, `PRD-OPS-009`, `PRD-OPS-023`, `PRD-OPS-024`, `PRD-OPS-029`, `PRD-OPS-030`, `PRD-OPS-037`, `PRD-OPS-038`, `PRD-OPS-039`, `PRD-OPS-043`, `PRD-OPS-044`, `PRD-OPS-045`, `PRD-OPS-047`, `PRD-BIZ-017`.

### PART — 58

`PRD-FND-002`, `PRD-FND-005`, `PRD-FND-009`, `PRD-FND-011`, `PRD-FND-013`, `PRD-FND-014`, `PRD-FND-017`, `PRD-FND-019`, `PRD-FND-020`, `PRD-FND-023`, `PRD-FND-025`, `PRD-FND-027`, `PRD-FND-028`, `PRD-FND-034`, `PRD-FND-035`, `PRD-FND-036`, `PRD-FND-043`, `PRD-SEC-004`, `PRD-DATA-002`, `PRD-INT-001`, `PRD-INT-002`, `PRD-INT-003`, `PRD-INT-004`, `PRD-INT-005`, `PRD-INT-006`, `PRD-GOV-001`, `PRD-COM-001`, `PRD-NFR-002`, `PRD-NFR-004`, `PRD-BIZ-013`, `PRD-BIZ-001`, `PRD-BIZ-002`, `PRD-BIZ-003`, `PRD-BIZ-004`, `PRD-BIZ-005`, `PRD-BIZ-006`, `PRD-BIZ-007`, `PRD-BIZ-008`, `PRD-BIZ-010`, `PRD-OPS-002`, `PRD-OPS-006`, `PRD-OPS-008`, `PRD-OPS-010`, `PRD-OPS-017`, `PRD-OPS-021`, `PRD-OPS-022`, `PRD-OPS-025`, `PRD-OPS-027`, `PRD-OPS-028`, `PRD-OPS-031`, `PRD-OPS-032`, `PRD-OPS-040`, `PRD-OPS-041`, `PRD-OPS-042`, `PRD-OPS-046`, `PRD-OPS-048`, `PRD-OPS-049`, `PRD-OPS-057`.

### MISS — 13

`PRD-FND-007`, `PRD-FND-008`, `PRD-FND-012`, `PRD-FND-029`, `PRD-FND-030`, `PRD-OPS-015`, `PRD-OPS-016`, `PRD-OPS-026`, `PRD-OPS-033`, `PRD-OPS-034`, `PRD-OPS-055`, `PRD-OPS-056`, `PRD-BIZ-015`.

### CONFLICT — 10

`PRD-FND-010`, `PRD-FND-016`, `PRD-FND-018`, `PRD-FND-032`, `PRD-FND-041`, `PRD-GOV-003`, `PRD-OPS-012`, `PRD-OPS-050`, `PRD-OPS-052`, `PRD-OPS-058`.

These statuses preserve the historical evidence. The forward ownership disposition is now recorded in `architecture-decision-register.md`: C01–C09 have an adopted architecture split, while their legal/business policies remain open where stated. Preserving `CONFLICT` here prevents the original contradiction from disappearing from audit history.

### DEMO — 8

`PRD-FND-026`, `PRD-FND-044`, `PRD-FND-045`, `PRD-BIZ-009`, `PRD-OPS-013`, `PRD-OPS-014`, `PRD-OPS-020`, `PRD-BIZ-016`.

### FE — 6

`PRD-FND-031`, `PRD-NFR-003`, `PRD-OPS-011`, `PRD-OPS-018`, `PRD-OPS-019`, `PRD-OPS-051`.

### OWNER — 3

`PRD-COM-003`, `PRD-NFR-001`, `PRD-BIZ-012`.

### DEFER — 10

`PRD-FND-037`, `PRD-FND-038`, `PRD-FND-039`, `PRD-FND-040`, `PRD-FND-042`, `PRD-COM-002`, `PRD-OPS-035`, `PRD-OPS-036`, `PRD-OPS-053`, `PRD-OPS-054`.

### OOS — 1

`PRD-BIZ-011`.

## Structural verification

| ID family | Count |
|---|---:|
| `PRD-FND-*` | 46 |
| `PRD-OPS-*` | 58 |
| `PRD-BIZ-*` | 17 |
| `PRD-INT-*` | 6 |
| `PRD-SEC-*` | 4 |
| `PRD-NFR-*` | 4 |
| `PRD-GOV-*` | 3 |
| `PRD-COM-*` | 3 |
| `PRD-DATA-*` | 2 |
| **Total** | **143** |

The status totals and ID-family totals independently reconcile to 143. This is design-coverage accounting, not a production implementation percentage. In particular, a `FULL` design status does not override the current fact that only the K01 pilot is durable PostgreSQL and that production security and most K02–K20 persistence are absent.
