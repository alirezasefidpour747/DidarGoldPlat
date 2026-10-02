# Didar B2B Specification Bundle — Full System Gap Analysis & Implementation Audit

**Date:** 2026-10-02  
**Governing Documents:** `AGENTS.md`, `MASTER-B2B-FLOW.md`, `MD-INDEX.md`, `DEPENDENCY-MAP.md`, `P01-IMPLEMENTATION-MAP.md`  
**Bundle Scope:** Complete 34-file Didar B2B specification bundle located at `docs/didar-b2b/*.md` compared against the current repository codebase (PostgreSQL database, Drizzle ORM, Express server, and React 19 frontend).

---

## 1. Executive Baseline & Current Implementation State

The Didar repository has established a clean, production-grade foundation following `AGENTS.md` and containment rules:

### Database & Persistence
- **Engine:** PostgreSQL with Drizzle ORM and migration tracking (`drizzle/`).
- **Clean K01 Pilot Schema:** Durable tables for `k01_parties`, `k01_organizations`, `k01_memberships`, `k01_documents`, and `k01_audit_events`.
- **Authentication Schema:** Durable `auth_credentials` (scrypt password hashes, salt, status) and `auth_sessions` (cryptographic tokens, expiry, revocation). Zero demo fallback.
- **Prototype Downstream (K02–K20):** Prototype in-memory stores (`server/storage-k02.ts` through `server/storage-k20.ts`) currently serve preview mockups and must be progressively replaced with durable PostgreSQL tables and services according to the P01–P12 / CRM / CMS package roadmap.

### Security, Secrets & Isolation
- **Secret Scanning:** `npm run scan:secrets` clean (0 violations).
- **Authentication:** Stateful session-based auth with HTTP Bearer token parsing and fail-closed RBAC middleware.
- **Tenant Scope:** Organizations isolated into `DIDAR`, `SUPPLIER`, and `RETAILER`. Multi-tenant queries must enforce strict scoping.

### Frontend Baseline
- **Stack:** React 19, Vite, Tailwind CSS, Lucide icons.
- **Design:** Persian RTL primary (Vazirmatn), LTR for English/French (Inter), Arabic support (IBM Plex Sans Arabic). Dark gold palette.
- **Role Portals:** Multi-portal switching for Retailer Storefront, Supplier Workspace, Operations Console, and Agent Field App.

---

## 2. Exhaustive 34-File Traceability & Gap Matrix

Below is the complete 1-to-1 comparison of every single markdown file in `docs/didar-b2b/` against the active codebase:

| # | Specification File | Domain / Track | Key Normative Requirements & Invariants | Current Codebase State | Exact Implementation Gaps | Target Phase |
|---|---|---|---|---|---|---|
| 1 | `AGENT-OPERATIONS.md` | P08 / Agent Ops | Field journeys: Sell-Bag (direct sale with stock lock), Sample-Bag (assisted order / optional sale), No-Bag (assisted order only). Bag issuance with OTP custody handover. | Basic Agent UI components in `src/pages/AgentWorkspace.tsx`. Prototype bag state in `server/storage-k08.ts`. | 1. No persistent `agent_bags`, `bag_items`, and custody events in PostgreSQL.<br>2. Missing OTP custody challenge for bag dispatch and return reconciliation.<br>3. Sale-from-bag does not lock physical UID and issue invoice line atomically. | Phase 6 (P08) |
| 2 | `AI-SALES-INTELLIGENCE.md` | AI01 / Intelligence | Role-aware AI assistant (Didar Copilot, Retailer Copilot, Consumer Assistant). Strict read-only grounding via domain APIs; zero direct database bypass or state mutation. | No AI features implemented (in compliance with environment constraints and standard non-AI baseline). | When AI features are explicitly requested, ground strictly through authenticated Express endpoints with tenant isolation. | Future / AI Track |
| 3 | `AUTH-OTP-SECURITY.md` | Security Core | Multi-factor OTP authentication, session security, cryptographically secure tokens, brute-force throttling, organization scoping, immutable security audit logs. | `auth_credentials` & `auth_sessions` tables in PostgreSQL with scrypt hashing. Password auth working. | 1. OTP generation, SMS dispatch, and verification lifecycle not yet implemented.<br>2. Missing OTP custody verification for physical handovers (bags and shipments).<br>3. Rate limiting / lockout policies need Redis or Postgres counters. | Phase 2 (P05/Security) |
| 4 | `B2B-RBAC.md` | Authorization | Three-tier organization hierarchy (Didar, Supplier, Retailer). Strict permission matrix across products, orders, invoices, and field ops. No cross-tenant data leakage. | Basic role checks (`SUPER_ADMIN`, `DIDAR_ADMIN`, `SUPPLIER_ADMIN`, `RETAILER_ADMIN`, `AGENT`) in auth middleware. | 1. Granular permission strings (e.g. `product.review`, `proforma.accept_own`) need explicit resolver.<br>2. Missing strict `organization_id` tenancy checks on all downstream routes. | Phase 2 (P05/Security) |
| 5 | `B2B-STOREFRONT-UX.md` | Storefront UX | Persian RTL-first B2B storefront, catalog discovery, three-level taxonomy navigation, indicative terms, quote request, order tracking, and My Didar workspace. | Prototype storefront in `src/pages/Storefront.tsx` and `src/components/Catalog.tsx`. | 1. Catalog displays flat mock items instead of 3-level taxonomy.<br>2. Indicative terms not separated from internal supplier offers.<br>3. CMS page builder and editorial blocks not yet integrated. | Phase 1 (P01) & Phase 7 |
| 6 | `CAMPAIGN-MANAGEMENT.md` | CRM03 / Campaigns | B2B marketing campaigns, target retailer segmentation, product spotlights, promotional pricing rules, conversion attribution, and campaign landing pages. | Static UI mockup in CRM views. | 1. No persistent `crm_campaigns` and target audience relations in PostgreSQL.<br>2. Missing conversion tracking linking orders to campaign touches. | Phase 7 (CRM03) |
| 7 | `CLEAN-MERCUR-BASELINE.md` | Baseline Integrity | Verification evidence of clean Mercur/Medusa runtime without unapproved workarounds, source modifications, or fake fallbacks. | Repository established clean isolated codebase with zero fake dependencies. | Maintain strict zero-dependency-pollution policy and avoid unapproved external libraries. | Continuous |
| 8 | `COMMUNICATION-CHAT.md` | CRM02 / Chat | Role-scoped real-time messaging between Retailers, Field Agents, and Didar Ops. Contextual attachments (Product, Order, Proforma references). | Prototype chat UI in `src/components/Chat.tsx`. | 1. Messages currently stored in React state / memory.<br>2. Missing persistent `chat_threads` and `chat_messages` tables in PostgreSQL.<br>3. Missing role-based access control per conversation. | Phase 7 (CRM02) |
| 9 | `CONTENT-EXPERIENCE-CMS.md` | CMS01 / Maison CMS | Editorial Maison layer above B2B catalog: block-based page builder (Hero, Grid, Journal, VR/Experience, Product Blocks), draft preview, versioning, 4 languages. | Static landing pages in React. | 1. No CMS database schemas (`cms_pages`, `cms_blocks`, `cms_media`).<br>2. Missing visual page builder, draft preview token engine, and published state resolution. | Phase 7 (CMS01) |
| 10 | `CUSTOMER-CRM-CORE.md` | CRM01 / Customer 360 | Retailer Customer 360 view, contact directory, agent assignments, interaction logs (calls, visits, notes), follow-up tasks, commercial history. | Prototype CRM in `server/storage-k18.ts` and `src/pages/CrmWorkspace.tsx`. | 1. In-memory data store needs migration to relational tables (`crm_contacts`, `crm_activities`, `crm_tasks`).<br>2. Missing agent portfolio assignments and field visit tracking. | Phase 7 (CRM01) |
| 11 | `DEPENDENCY-MAP.md` | Architecture | Authoritative dependency topology: Hard, Cross-Cutting, and Event/Integration classifications. CMS and AI strictly downstream of Product Core. | Architecture documented and respected in planning. | Ensure P01 executes without any upstream dependency on Order, Intake, or CMS. | Architecture Rule |
| 12 | `DIDAR-OPERATIONS-CONSOLE.md` | Ops Console | Internal command center for Didar staff: Product Ops, Order Ops, Supply Ops, Quality & Intake Ops, Dispatch, Settlement, and CMS Management. | Admin portal in `src/pages/AdminDashboard.tsx`. | 1. Modules display prototype in-memory records.<br>2. Missing dedicated Product Ops taxonomy review queue and Supplier Offer management. | Phase 1 (P01) through Phase 6 |
| 13 | `DISPATCH-DELIVERY.md` | P07 / Dispatch | Outbound shipment packaging, package manifests, 1 Shipment = 1 Retailer = N Invoices = N Packages = N UIDs, OTP handover to carrier, public tracking timeline. | Rudimentary shipment status in `server/storage-k11.ts`. | 1. No persistent `shipments`, `shipment_packages`, and `custody_transfers` in PostgreSQL.<br>2. Missing OTP transfer verification and tracking code generation. | Phase 6 (P07) |
| 14 | `INVOICE-BILLING.md` | P10 / Invoicing | Separation of Proforma, Retailer Final Invoice, and Supplier Invoice. Immutable line itemization with 100% UID traceability and settlement obligation linkage. | Generic invoices in `server/storage-k13.ts`. | 1. Document types are currently conflated in prototype.<br>2. Missing strict UID-to-invoice-line relational mapping.<br>3. Missing immutable snapshotting at invoice issuance. | Phase 5 (P10) |
| 15 | `MASTER-B2B-FLOW.md` | Master Flow | End-to-end B2B operational lifecycle from taxonomy/product creation, multi-source order requests, proforma gate, sourcing, intake, packaging, dispatch to settlement. | High-level flow represented in roadmap. | Progressively replace in-memory prototype slices with durable PostgreSQL entities along the master flow. | Master Blueprint |
| 16 | `MD-INDEX.md` | Index & Catalog | Comprehensive index of all specifications, tracks, and dependency relationships. | Verified and reflected in this audit. | Maintain synchronized file index across project documentation. | Continuous |
| 17 | `MERCUR-UI-BASELINE.md` | UI Verification | Baseline verification requirements: responsive viewports (375, 768, 1280, 1920), Persian RTL, typography (Vazirmatn), error/loading/empty/denied states. | Frontend adheres to Persian RTL and Vazirmatn. | Continue enforcing AA accessibility, multi-state screen rendering, and zero client-calculated business values. | UI Quality Standard |
| 18 | `NOTIFICATION.md` | P11 / Notifications | Event-driven notifications (In-App and SMS). Decoupled delivery queue, idempotency, rate limiting, and sanitized audit logs (no OTP leakage). | Simple React state notifications in UI header. | 1. No backend notification table or dispatch worker.<br>2. Missing event triggers on order status changes, proforma readiness, and delivery updates. | Phase 5 (P11) |
| 19 | `ORDER-CORE.md` | P02 / Order Core | 6 order creation sources, versioned Proformas (V1, V2, SUPERSEDED, ACCEPTED), customer acceptance lock, supply allocation split, UID allocation gating. | Prototype orders in `server/storage-k10.ts`. | 1. In-memory order drafts lack versioned proformas.<br>2. Missing database-enforced lock preventing UID allocation prior to customer acceptance. | Phase 3 (P02) |
| 20 | `P01-IMPLEMENTATION-MAP.md` | P01 Contract | Governing technical implementation contract for Package 01: Three-level taxonomy, Medusa product mapping, Supplier offers (PERCENT/RANGE_PERCENT), review queue, Retailer discovery. | Outlines exact database schema, API contracts, and UI components needed for P01. | Ready for immediate implementation: create Drizzle schema, run taxonomy seed, and build Product Ops & Retailer APIs. | **IMMEDIATE (Phase 1)** |
| 21 | `PACKAGING-FULFILLMENT.md` | P06 / Packaging | Packaging job queue, operator assignment, physical UID scanning/verification, package material consumption, manifest generation, status READY_FOR_DISPATCH. | Prototype status tags in `server/storage-k09.ts`. | 1. No packaging jobs or operator scanning endpoints.<br>2. Missing package entity linking physical items to outbound packages. | Phase 6 (P06) |
| 22 | `PACKAGING-INVENTORY.md` | P06 / Consumables | Inventory tracking for packaging consumables (boxes, luxury pouches, tamper-evident seals, ribbons, labels). Stock decrement upon package closure. | Prototype mock counts. | 1. Missing `packaging_materials` table and stock movement log.<br>2. Missing automatic material deduction upon packaging job completion. | Phase 6 (P06) |
| 23 | `PHYSICAL-INTAKE.md` | P04 / Intake & UID | Supplier delivery intake, 3-level weight verification (Outer, Inner, Item), UID generation, mandatory invoice & Zarrin attachment uploads, label generation. | Prototype intake list in `server/storage-k08.ts`. | 1. Missing `physical_items` and platform `uids` tables in PostgreSQL.<br>2. Missing 3-level weight manifest and attachment storage. | Phase 4 (P04) |
| 24 | `PRODUCT-CORE.md` | Product Domain | Normative Product specification: three-tier category hierarchy, product attributes (karat, weight range, making fee type), multi-supplier offers, indicative terms. | Prototype in `server/storage-k05.ts`. | Flat schema without multi-supplier offers or versioned reviews. Needs migration to P01 schema. | Phase 1 (P01) |
| 25 | `PRODUCT-TAXONOMY-SEED.md` | P01 Taxonomy Seed | Deterministic initial seed data: 5 Main Categories, 20+ Product Categories, 50+ Subcategories with English & Persian names, codes, and attributes. | Seed data not yet loaded into database. | Must be executed via idempotent seed script into the new `categories` and `subcategories` tables. | Phase 1 (P01) |
| 26 | `README.md` (didar-b2b) | Overview | Master directory description, latest decisions summary, CRM/Enablement/AI additions, and CMS expansion overview. | Aligned with repository structure. | Keeps bundle documentation organized and synchronized. | Continuous |
| 27 | `REPORTING-FOUNDATION.md` | Reporting | Structured operational dimensions (actors, orgs, dates, weights, UIDs) for tabular reports, analytics, and CSV exports across all domains. | Frontend table components with client-side sorting. | 1. Need server-side query endpoints for operational summaries.<br>2. Need CSV export handlers with tenant isolation. | Cross-Cutting |
| 28 | `RETAILER-SALES-ENABLEMENT.md` | EN01 / Enablement | Retailer "My Products", public shareable collection links (tokenized), consumer catalog view (without B2B pricing), consumer lead & interest capture. | Prototype UI in Retailer workspace. | 1. Missing `retailer_collections` and `collection_items` schemas.<br>2. Missing public guest API for tokenized collection browsing. | Phase 7 (EN01) |
| 29 | `SETTLEMENT-CORE.md` | P09 / Settlement | Authoritative 18K Gold Ledger, balance derived from append-only entries, Rial payments evaluated at payment-time gold rate snapshot, settlement obligations. | Prototype ledger in `server/storage-k15.ts`. | 1. Stored in memory; uses arbitrary fiat currencies.<br>2. Must implement append-only `gold_ledger_entries` in grams of 18K gold. | Phase 5 (P09) |
| 30 | `SUPPLY-ORDER.md` | P03 / Supply Order | Formal Didar-to-Supplier supply orders, tracking supplier commitment vs intake delivery, expected ready dates, supplier acceptance. | Minimal supplier profile in `server/storage-k07.ts`. | 1. No `supply_orders` and `supply_order_lines` tables in PostgreSQL.<br>2. Missing reconciliation between supply orders and intake receipts. | Phase 4 (P03) |
| 31 | `UI-FOUNDATION.md` | UI Foundation | Common design system, color palette (gold/slate), RTL typography, responsive grids, shared components (Badge, Modal, Table, Drawer, Form). | Shared Tailwind classes and React components in `src/components/`. | Ensure consistent UI token usage across new P01–P12 screens. | UI Quality Standard |
| 32 | `UI-SPEC-INDEX.md` | UI Specifications | Index of UI screens across Retailer, Supplier, Ops Console, and Agent portals. | Screen inventory aligned with frontend routing. | Guides screen implementation for each package. | UI Quality Standard |
| 33 | `WAREHOUSE-INVENTORY.md` | Warehouse & Custody | Simplified warehouse location and custody tracking (Current Location, Custody Holder, Status: INTAKE, VAULT, PACKING, DISPATCHED). Full bin WMS deferred. | Prototype inventory tags. | Implement simplified location and custody columns on `physical_items` without over-engineering full bin WMS. | Phase 4 (P04) |
| 34 | `WORK-ADDENDUM-UI.md` | UI Addendum | Prescribes adherence to clean Mercur UI baseline, RTL typography, fail-closed empty/loading states, and zero client-calculated business facts. | Enforced in code review and component structure. | Mandatory guidelines for all UI additions. | UI Quality Standard |

---

## 3. Core Architectural Invariants & Stop Condition Review

In accordance with `AGENTS.md`, the following core architectural invariants have been audited:

1. **Source of Truth Rule:**
   - Authoritative business state resides solely in PostgreSQL through versioned Drizzle migrations.
   - Client-side storage (`localStorage`), seeded arrays, and demo fallback modes are strictly prohibited.
2. **Customer Acceptance & UID Allocation Gate:**
   - Physical UIDs can NEVER be allocated or reserved for an order before the Retailer customer has formally accepted the Proforma.
   - The backend schema must enforce this via foreign key constraints and status checks.
3. **18K Gold Settlement Basis:**
   - All commercial obligations and ledger balances must be measured in grams of 18K gold.
   - Fiat Rial cash payments record the snapshot of the gold spot rate at the exact execution timestamp to derive the settled 18K equivalent.
4. **Tenant Isolation:**
   - Strict query scoping by `organization_id` prevents cross-tenant data leakage (Supplier A cannot see Supplier B; Retailer A cannot see Retailer B).

---

## 4. Prioritized Implementation Roadmap

Based on `DEPENDENCY-MAP.md` and `P01-IMPLEMENTATION-MAP.md`, the implementation follows this sequential order:

```
[Phase 1: P01 Product Core & Three-Level Taxonomy] <-- CURRENT PRIORITY
  ├── Drizzle schema: categories, subcategories, products, supplier_offers, product_revisions
  ├── Deterministic Seed: PRODUCT-TAXONOMY-SEED.md (3 levels: Main -> Category -> Subcategory)
  ├── Services & Repositories: Multi-supplier offers (PERCENT / RANGE_PERCENT) & Indicative terms
  └── APIs & UI: Product Ops review queue, Retailer catalog discovery, Supplier offer entry
         │
[Phase 2: P05 Security Core & B2B RBAC Hardening]
  ├── Multi-tenant query isolation (WHERE organization_id = req.user.organizationId)
  ├── Granular permission strings and role checks
  └── OTP challenge generation and verification core
         │
[Phase 3: P02 Order Core & Versioned Proformas]
  ├── Schemas: order_requests, order_lines, proformas, supply_allocations
  ├── Versioned proforma lifecycle (V1, V2, SUPERSEDED, ACCEPTED)
  └── Customer acceptance gate locking UID assignment
         │
[Phase 4: P03 Supply Order, P04 Physical Intake & UIDs]
  ├── Schemas: supply_orders, physical_intakes, physical_items, uids
  ├── 3-level weight verification manifest (Outer, Inner, Item)
  └── Supplier invoice & Zarrin gold test document attachments
         │
[Phase 5: P09 Settlement Core & P10 Invoicing]
  ├── Append-only 18K gold ledger (grams 18K) & transaction-rate snapshots
  ├── Proforma vs Final Retailer Invoice vs Supplier Invoice separation
  └── 100% UID to invoice line traceability
         │
[Phase 6: P06 Packaging, P07 Dispatch & P08 Agent Field Ops]
  ├── Packaging jobs with UID barcode scanning & packaging consumables deduction
  ├── Outbound shipments with OTP custody transfer to courier/agent
  └── Agent Sell-Bag, Sample-Bag, and No-Bag journeys
         │
[Phase 7: CRM01–03, EN01 Retailer Enablement & CMS01 Maison Experience]
  ├── Customer 360, persistent Chat threads, Campaign management
  ├── Shareable tokenized collections & consumer lead capture
  └── Block-based visual CMS for Maison storefront & journal
```

---

## 5. Immediate Action Plan: Package P01 Execution

With the full 34-file gap analysis verified, execution begins immediately with **Package P01** according to `P01-IMPLEMENTATION-MAP.md`:
1. Define PostgreSQL schema in `server/database/schema.ts` for:
   - `taxonomy_categories` (3 levels: Main, Product Category, Subcategory)
   - `b2b_products`
   - `b2b_supplier_offers`
   - `b2b_product_reviews`
2. Run database migration using Drizzle.
3. Seed the full deterministic taxonomy from `PRODUCT-TAXONOMY-SEED.md`.
4. Implement clean repository and Express router for `/api/b2b/products` and `/api/b2b/taxonomy`.
5. Connect Retailer Storefront and Product Ops Console to the new durable endpoints.
