# Frontend-to-Backend Readiness Matrix

**Date:** 2026-09-23  
**Status:** Planning/readiness evidence; not an API specification  
**Screen source:** `docs/Product/frontend-screen-inventory.md`

## 1. Readiness legend

- `K`: authoritative K01–K20 owner.
- `SEC`: shared identity/security/privacy/audit/file/notification/operational platform.
- `PE`: PaaS, EventMesh, API gateway or search.
- `MDM`: governed reference data.
- `BI`: analytics/read model.
- `EXT`: external provider/adaptor.
- `PORTAL`: presentation/composition only.
- `Blocked`: no approved production contract and/or authoritative backend/security is not production-capable.

The ten Package 3A owner decisions are approved, and backend implementation may start. No approved frontend OpenAPI specification was found, Package 3A does not implement frontend, and authentication/RBAC remain in later packages. Therefore every production data screen below remains contract/security-blocked even when its target owner is clear. “Designed” means an architectural owner/model exists; it does not mean the current runtime is durable or secure.

## 2. Public and guest screens

| Screen | Authoritative K owner | Other layers | Portal-only responsibility | Backend readiness / principal blocker |
|---|---|---|---|---|
| PUB-001 Public landing/catalog | K05; K07/K09/K11 eligibility inputs | PE search/freshness; MDM taxonomy | Hero, collections, filters, cards | Blocked: K05/K07/K09/K11 not durable; search/MDM distribution and OpenAPI absent |
| PUB-002 Product detail | K05 product/assets; K06 public provenance; K09 viewer-safe availability | MDM, PE/CDN/file | Layout, story presentation, locale | Blocked: approved asset/provenance/availability contract absent |
| PUB-003 Supplier directory | K07 eligibility; K01 identity; K05 approved scope | PE search | Directory composition | Blocked: K07 not durable; disclosure and contract absent |
| PUB-004 Supplier catalog | K05 catalog; K07 eligibility | MDM, PE search | Supplier-scoped composition | Blocked: catalog/supplier contracts absent |
| PUB-005 Retailer storefront | K11 publication/eligibility; K05 facts; K09 availability | PE search/freshness | Gallery/storefront composition | Blocked: K11 storefront extension UOD-003 and contract absent |
| PUB-006 Nearby retailers | K11 eligible location query; K09 availability | SEC privacy; location EXT/service; PE search | Consent/manual-input UX and distance display | Blocked: UOD-007, D45 and freshness contract absent |
| PUB-007 Favourites | Proposed K05 engagement linked to K01 | SEC session; PE invalidation | Guest non-sensitive list and merge UX | Blocked: UOD-001 owner/schema/API absent; guest-only local IDs are non-authoritative |
| PUB-008 Authentication | K03 account/session; K01 party/org context | SEC/OIDC/notification | Sign-in/recovery/step-up/account selection | Blocked: Package 3B, D09/D10 and contract absent; prototype sign-in is rejected |
| PUB-009 Authenticity/warranty lookup | K06 authenticity; K17 warranty status | SEC privacy/rate limit | Privacy-safe result | Blocked: D15/D38/D45 and signed lookup contract absent |

## 3. Retailer portal screens

| Screen | Authoritative K owner | Other layers | Portal-only responsibility | Backend readiness / principal blocker |
|---|---|---|---|---|
| RET-001 Workspace | No new truth; read models from K01/K10–K17 | SEC scope; BI/PE projections | Navigation and actionable summaries | Blocked: authenticated scoped read model and freshness contract absent |
| RET-002 Request basket | K10 authenticated draft on submit; K05/K09 item facts | SEC; PE | Temporary UI basket and non-reservation warning | Blocked: K10 durable draft/idempotency contract absent |
| RET-003 Request checkout | K10 request; K01/K11 approved contact/location | SEC | Form/validation/presentation | Blocked: scope, validation and error contract absent |
| RET-004 Request review | K10 | SEC idempotency/audit | Immutable preview | Blocked: idempotency/request hash and submission contract absent |
| RET-005 Requests | K10 | SEC; PE read model | List/status rendering | Blocked: K10 persistence and list contract absent |
| RET-006 Request/quotation detail | K10 workflow; K13 price snapshot; K14 risk | SEC/K04; PE | Expiry/revision/approval UX | Blocked: D22/D24/D27–D32 and orchestration contract absent |
| RET-007 Orders | K10 | SEC; PE | Scoped list/timeline | Blocked: K10 persistence/contract absent |
| RET-008 Shipments | K10 fulfillment; K09 custody; K16 carrier state | EXT courier/insurer; PE events | Timeline and evidence links | Blocked: D21/D23/D36 and real adapter/POD contract absent |
| RET-009 Invoices | K13 | K15/K16; EXT tax/ERP/file | Document/status rendering | Blocked: D26–D36 and invoice/tax/OpenAPI absent |
| RET-010 Sales returns | K10 return command; K09/K13/K15 consequences; K16 reconciliation | SEC/K04; EXT | Return form/status | Blocked: UOD-002; return aggregate/table/state/contract absent |
| RET-011 Settlements | K16 orchestration/finality view; K15 obligations | EXT bank/PSP/ERP | Pending/failure/reconciled UX | Blocked: D35/D36 and provider contracts absent |
| RET-012 Gold/cash statement | K15 | K13/K16; SEC scope | Formatting/filter/export link | Blocked: D26/D33–D35 and ledger API absent; no client balance calculation |
| RET-013 Performance | Source K facts; BI owns metric dataset | BI, PE | Charts with period/refresh/scope | Blocked: UOD-010, warehouse/metric contract absent |
| RET-014 Warranty activation | K17; verified K10 sale/K06 item | K03/SEC OTP+consent; EXT messaging | Assisted activation flow | Blocked: D09/D10/D17/D37/D38 and single-use challenge contract absent |
| RET-015 Warranty lookup | K17 | K06; SEC privacy | Scoped lookup | Blocked: K17 durability/disclosure contract absent |
| RET-016 Retailer profile | K01 identity/draft; K02 verification; K11 eligibility | SEC file/privacy; K04 review | Draft/correction UX | Blocked: 3A decisions approved but implementation/API absent; Packages 3B/3C/3D also required |
| RET-017 Storefront settings | K11 publication/assortment | K05/K09; SEC audit | Reorder/select/publish controls | Blocked: UOD-003 and contract absent |
| RET-018 Storefront preview | K11/K05/K09 approved projection | PE | Customer-safe preview only | Blocked until RET-017 projection contract exists |

## 4. Consumer portal screens

| Screen | Authoritative K owner | Other layers | Portal-only responsibility | Backend readiness / principal blocker |
|---|---|---|---|---|
| CON-001 Workspace | No new truth; K17–K19 read models | SEC scope; BI/PE | Own-record summaries/navigation | Blocked: AuthN/scope/read-model contract absent |
| CON-002 Owned items | K17 ownership; K06 item/provenance | SEC privacy | List/detail composition | Blocked: D17/D37/D45 and contract absent |
| CON-003 Warranty cards | K17 | K06; SEC/file | Version/card presentation | Blocked: D38 and signed/versioned card contract absent |
| CON-004 Service requests | K18 | K17 eligibility; SEC notifications | Create/list UX | Blocked: D39, K18 durability and idempotent contract absent |
| CON-005 Service detail | K18 | K09 custody; K15/K16 settlement; SEC/file | SLA/timeline/evidence view | Blocked: cross-kernel orchestration/visibility contract absent |
| CON-006 Buyback/resale request | K19; K17 owner eligibility | K06, SEC/file/privacy | Condition/evidence/consent form | Blocked: D40/D41 and request contract absent |
| CON-007 Buyback/resale detail | K19 valuation/offer; K15/K16 settlement | K13/K09; EXT lab/bank/custodian | Accept/reject and provider-state UX | Blocked: D21/D35/D40–D43 and provider contracts absent |
| CON-008 Favourites | Proposed K05 engagement linked to K01 | SEC/PE | Account favourite UX | Blocked: UOD-001 |
| CON-009 Nearby retailers | K11 query; K09 availability | SEC privacy; location service/PE | Consent/manual search UX | Blocked: UOD-007 |
| CON-010 Privacy/preferences | Shared privacy platform; K01 subject | SEC notifications/audit; domain processors | Consent/preference/DSR UX | Blocked: UOD-008, privacy-platform contract and final legal details for D44–D46 |

## 5. Supplier portal screens

| Screen | Authoritative K owner | Other layers | Portal-only responsibility | Backend readiness / principal blocker |
|---|---|---|---|---|
| SUP-001 Workspace | Read models from K01/K02/K05/K07/K10/K13/K15/K16 | SEC; BI/PE | Scoped summaries/navigation | Blocked: AuthN/RBAC and read-model contract absent |
| SUP-002 Business profile | K01 | K02; SEC privacy | Draft/edit presentation | Blocked: Package 3A decisions approved, but K01 implementation/versioned frontend API and 3B/3C security are absent |
| SUP-003 Qualification/licenses | K02 verification; K07 supplier qualification | K01; K04; SEC file | Upload/correction/review UX | Blocked: D06 boundary approved, but D08/D14, final D44–D46 legal details and file/review contracts remain absent |
| SUP-004 Agreements | K07 | K01; K04/file | Agreement list/detail | Blocked: D14 and K07 contract absent |
| SUP-005 Products | K05 | K07/K04; MDM | Own draft/status list | Blocked: durable K05 workflow and API absent |
| SUP-006 Product editor | K05 | K07; MDM taxonomy; SEC file/K04 | Form/local validation and preview | Blocked: D13/D14/UOD-009/UOD-011 and upload/review contract absent |
| SUP-007 Orders/commitments | K10 demand; K07 agreement/capacity | SEC; PE | Scoped operational list | Blocked: K07/K10 persistence/orchestration contract absent |
| SUP-008 Supplier invoices | K13 invoice facts; K15 accounting | K16/EXT | Document/status view | Blocked: finance policies/contracts absent |
| SUP-009 Supplier returns | K10 return owner; K09/K13/K15/K16 | SEC/K04; EXT | Return/reconciliation UX | Blocked: UOD-002 and contracts absent |
| SUP-010 Supplier settlements | K16; K15 | EXT bank/ERP | Provider-state view | Blocked: D35/D36 and contracts absent |
| SUP-011 Supplier statement | K15 | K13/K16 | Immutable movement view | Blocked: D26/D33–D35 and API absent |
| SUP-012 Supplier performance | BI from K facts | BI/PE | Period/refresh/lineage view | Blocked: UOD-010 |

## 6. Internal operational workspace ranges

The source inventory defines ranges rather than concrete screens. Each range is mapped below, but the range itself is not implementation-ready until UOD-013 assigns concrete IDs, role/scope rules, routes, contracts, states and acceptance tests.

| Range | Authoritative owners | Shared/other layers | Missing concrete screens/capabilities | Readiness |
|---|---|---|---|---|
| INT-01x Identity/onboarding/org | K01–K04 | SEC/OIDC/file/audit | Party/org/location merge, documents, onboarding checklist/review, account/session/MFA, role grants | Blocked for frontend: 3A decisions approved, but 3A implementation plus Packages 3B–3D and concrete screen/API contracts are absent |
| INT-02x Catalog/supplier/product approval | K04–K07 | MDM, SEC file, BI | Taxonomy/version, product review/publication, supplier agreement/capacity/collateral | Blocked: D13/D14 and contracts |
| INT-03x Inbound/assay/quarantine/vault | K06/K08/K09 | SEC/file; EXT lab/device/RFID | Passport issuance, intake, assay, quarantine release, movement/transfer/count | Blocked: D15/D16/D19–D21 and contracts |
| INT-04x Orders/agents/retail | K10–K12 | SEC/K04; PE | Allocation exceptions, POD/reversal, terms/exceptions, territory/visit/proxy order, aged-stock action | Blocked: D22–D25 and contracts |
| INT-05x Pricing/invoice/risk/ledger | K13–K15 | SEC/K04; EXT rate/tax/bureau | Rate approval, quote locks, invoice correction, limits/exposure/collateral, vouchers/period/netting | Blocked: D26–D35 and contracts |
| INT-06x Integration/settlement | K16 | PE/outbox; SEC; EXT | Endpoint mapping, attempts, exception/retry, settlement/reconciliation run | Blocked: D35/D36/D47/D48 and provider contracts |
| INT-07x Ownership/warranty/service | K17/K18 | K06/K09/K15; SEC/file/notification | Claims/transfers/stolen/policies, workshop assignment, custody/weight/settlement | Blocked: D37–D39 and contracts |
| INT-08x Buyback/circular | K19/K20 | K06/K09/K13/K15/K16; EXT lab/bank | Compliance hold, assay/valuation/routing, refurbish/QC/CPO, melt/mass balance/gems | Blocked: D40–D43 and contracts |
| INT-09x Audit/monitoring/MDM/BI | K04 plus shared platform | SEC, PE, MDM, BI | Approval/audit export, event/replay/DLQ, stewardship, metric lineage, operational monitoring | Blocked: D11/D12/D44–D48/UOD-010/011 |

## 7. Critical journey mapping

| Journey | Screens | Authoritative owners | Other layers | Readiness gate |
|---|---|---|---|---|
| FE-J01 Public discovery | PUB-001/002/007 | K05/K06/K09/K11; proposed K05 engagement | MDM, PE search, SEC | Catalog/search/freshness/favourites contracts; public disclosure tests |
| FE-J02 Guest-to-account favourites | PUB-007/008, CON-008 | Proposed K05 engagement; K01/K03 identity | SEC, PE | UOD-001 plus idempotent merge/tombstone contract |
| FE-J03 Retailer onboarding | RET-016, PUB-008, INT-01x | K01/K02/K11; K03/K04 | SEC/OIDC/file | Packages 3A–3D plus onboarding policy and negative scope tests |
| FE-J04 Request-to-order | RET-002–008 | K10 with K09/K13/K14/K16 | SEC/K04, PE, EXT courier | Durable allocation/quote/credit/POD contracts and concurrency tests |
| FE-J05 Return/reversal | RET-010/009/012/011, INT-04x/05x/06x | K10 with K09/K13/K15/K16 | SEC/K04, EXT | UOD-002; exactly-once cross-kernel reversal/reconciliation |
| FE-J06 Retailer storefront | RET-017/018, PUB-005 | K11 with K05/K09 | PE search | UOD-003; unpublished/ineligible/unavailable exclusion |
| FE-J07 Nearby retailer | PUB-006 or CON-009 | K11/K09 | SEC privacy, location service, PE | UOD-007; consent/manual fallback/freshness |
| FE-J08 Assisted warranty activation | RET-014/015, CON-003 | K17 with K01/K03/K06/K10 | SEC OTP/notification/audit | D09/D10/D17/D37/D38; one-time/idempotent contract |
| FE-J09 Consumer service | CON-004/005, INT-07x | K18 with K17/K09/K15 | SEC/file/notification; EXT workshop/courier | D21/D35/D39; ownership/scope/custody negative tests |
| FE-J10 Buyback/resale | CON-006/007, INT-08x | K19 with K17/K06/K13/K09/K15/K16; K20 downstream | SEC/K04; EXT lab/bank/custodian | D40–D43; no payout success without acknowledgement |
| FE-J11 Supplier onboarding/product review | SUP-002–007, INT-01x/02x | K01/K02/K07/K05/K04 | MDM, SEC file | Package 3A implementation plus D03/D07/D08/D13/D14; self-approval denial and publication separation |
| FE-J12 Finance/reconciliation | RET-009–013, SUP-008–012, INT-05x/06x | K13/K15/K16 | BI, SEC, EXT tax/ERP/bank | D26–D36/UOD-010; balances reconcile and timeout is not success |

## 8. Missing backend capabilities required by frontend

1. Approved versioned OpenAPI and standard error/idempotency/concurrency/audit model for every row above.
2. Production AuthN/session/actor context, scoped RBAC/RLS, maker-checker and central audit.
3. Durable persistence for K02–K20; K01 Package 3A convergence is approved to start but not yet implemented.
4. K05/account engagement favourites service or approved alternative.
5. K10 sales-return aggregate and orchestration.
6. K11 storefront publication/assortment and nearby query projection.
7. Shared consent/preferences/DSR, notification/OTP and file/object services.
8. Durable outbox/inbox, search index/ACL/freshness/replay and API gateway policy.
9. MDM stewardship/version distribution and BI metric/lineage/read models.
10. Certified external adapters with finality/reconciliation for OIDC, files/scanning, lab/device/rate/tax/ERP/courier/insurance/bank/PSP/custodian.

## 9. Missing frontend screens required by K01–K20

At minimum, concrete IDs are missing for every capability listed under `INT-01x`–`INT-09x`. Additionally missing or not explicitly inventoried are:

- Public secondary/CPO listing and detail based on K20 facts.
- Warranty claim submission/decision distinct from service execution.
- Ownership transfer and stolen-item report/status.
- Legal dispute/case intake, evidence, outcome and appeal after UOD-004.
- Notification preferences/history and DSR request/status (CON-010 is too broad to serve as all three contracts).
- Report export/scheduling, messaging, feedback/survey and content-studio flows if/when their `MISS`/deferred PRD requirements are activated.

These are gaps in screen specification, not authorization to add them to Package 3A.

## 10. Prototype findings

The prototype usefully demonstrates Persian-first RTL with Arabic RTL and English/French LTR, responsive catalog/product cards, category/collection filters, supplier directory/catalog/profile/product drafts, favourites, basket/request/quotation concepts, storefront controls, nearby search, warranty/resale/service concepts, finance tabs and role workspaces.

It also demonstrates why it cannot be production evidence: it contains demo sign-in and role switching, seeded identities/products/orders/warranties/ledger entries, local arrays/browser storage, generated request/product identifiers, client-derived weight/balance summaries, fictional stock and distances, local file data URLs and simulated statuses/success. None of these behaviors may cross into production contracts or persistence.
