# DIDAR PLATFORM — FULL CAPABILITY & GAP AUDIT REPORT
# Document Version: 1.0.0 | Date: October 2, 2026 | Classification: Confidential Technical Audit

---

## 1. Executive Summary & Audit Mandate

This report delivers a rigorous, evidence-based architectural and code audit of the current **Didar** codebase against the approved Didar business specifications and target architecture pack. 

### Audit Scope & Strict Boundary:
In strict accordance with the audit mandate, **zero code modifications, schema migrations, refactorings, or package installations** were executed during this analysis. The findings represent the factual, verifiable state of the repository as of October 2026.

### Primary Baseline Findings:
1. **Repository Identity & Architecture:** The active codebase in this repository is an Express + TypeScript + React application branded as `didar-gold-kernel`. It simulates a 20-domain kernel (`K01` through `K20`), alongside PaaS, BI, and Master Data Management (MDM) layers.
2. **Current Persistence Split:**
   - **PostgreSQL / Drizzle Relational Layer:** Only `K01` (Persons, Organizations, Memberships, Documents, Audit Logs) and `RBAC` (70 Canonical Roles, Permissions, Role-Permission mappings, Assignments, Policy Revisions, and Grant Authority Rules) have been fully migrated to relational PostgreSQL schema (`server/db/schema.ts`, `server/repositories/k01.repository.ts`, `server/repositories/rbac.repository.ts`) with passing persistence tests (`tests/persistence.test.ts`).
   - **JSON File Storage Layer:** All remaining domains (`K02` through `K20`, PaaS, BI, MDM) persist state in in-memory singletons backed by local JSON flat-files (`data/didar-kernel-store.json`, `data/k03-store.json`, etc.) managed via `server/storage-*.ts`.
3. **Relationship to Mercur:** The repository does **not** currently run inside or import the Mercur / Medusa v2 multi-vendor framework. It is currently a bespoke standalone application. However, approximately 42% of Didar's commerce primitives can leverage or extend Mercur native models (`Product`, `ProductVariant`, `ProductCategory`, `SellerOffer`, `StockLocation`, `Fulfillment`), while ~58% of Didar capabilities (Gold spot pricing, physical intake/assaying, UID passports, dual subledgers, Zarrin ERP sync, agent bags, field operations, B2B enablement, and Maison luxury CMS) represent distinct gold value chain modules.
4. **Large-Scale Functional Gaps:** The current codebase implements internal administrative prototypes for K01–K20, but completely lacks:
   - Retailer B2B Storefront & Consumer Showcase UI
   - Vendor / Supplier Self-Service Portal
   - Retailer "My Didar" Self-Service Portal
   - Agent Mobile Tablet Surface
   - CRM Core & Sarv Integration (Domain H)
   - Real-Time Communication / Chat (Domain I)
   - Campaign Management (Domain J)
   - Retailer Sales Enablement & Consumer Sharing (Domain K)
   - AI Sales Intelligence Copilots (Domain L)
   - Maison Luxury CMS & Page Builder (Domain M)

---

## 2. Classification Schema

Every evaluated capability is assigned exactly one primary status according to the approved standard:

- **NATIVE — USABLE:** Mercur natively provides the capability and it substantially satisfies the requirement.
- **NATIVE — EXTEND:** Mercur provides a useful underlying capability, but Didar-specific data/behavior/UI is required.
- **DIDAR — IMPLEMENTED:** The required Didar-specific capability is already implemented in the codebase with verified evidence.
- **PARTIAL:** Some required behavior exists in the current codebase, but the end-to-end requirement is incomplete.
- **NOT IMPLEMENTED:** No meaningful implementation exists in the current repository.
- **CONFLICT:** Current implementation or standard ecommerce behavior conflicts with approved Didar architecture.
- **DEFERRED / OPTIONAL:** Specification explicitly defers or treats the capability as optional in the current phase.

---

## 3. Detailed Audit by Functional Domain

---

### A. Product & Taxonomy

#### Specification Requirements:
- 3-Tier Gold Taxonomy: Main Family (1), Category (2), Subcategory (3).
- SKU Catalog with design variants (ring sizes, chain lengths, colors: yellow, white, rose, dual-tone).
- Weight tolerances, nominal target weight vs actual scale weight, stone weight deductions.
- Multiple Supplier Capacity Offers per product (weekly capacity in grams, MOQ, lead time, wage percentage/fixed, alloy guarantee).
- Indicative gold pricing derived from live spot rates (18K/750).
- Product curation, review, approval, and publishing lifecycle.
- Didar Ops "on-behalf-of" supplier data entry.

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **3-Tier Gold Taxonomy** | **DIDAR — IMPLEMENTED** | `NATIVE — EXTEND` (Mercur `ProductCategory`) | `src/data/goldTaxonomy.ts` (655 lines), `src/types/k05.ts` (lines 7–54) | Complete 3-level tree implemented with 5 families (Jewelry, Accessories, Combo Sets, Bullion, Symbolic), 30+ categories, and 150+ subcategories. Mapped to SKU prefix codes (`DID-RNG`, `DID-BNG`). |
| **Product SKU & Design Variants** | **PARTIAL** | `NATIVE — EXTEND` (Mercur `ProductVariant`) | `src/types/k05.ts` (lines 73–133), `server/storage-k05.ts`, `server/routes/k05.ts` | Data models and CRUD endpoints exist. Supports size, color, weight ranges (`minWeightGrams`, `maxWeightGrams`), target weight, CAD mold numbers, and stone deduction flags. **Gap:** Stored in flat JSON (`server/storage-k05.ts`), not migrated to relational PostgreSQL schema. |
| **Supplier Capacity Offers** | **PARTIAL** | `NATIVE — EXTEND` (Mercur `ProductOffer`) | `server/routes/k05.ts` (lines 140–218), `src/types/k05.ts` (lines 135–158) | Supports multiple suppliers per SKU, weekly capacity in grams, MOQ, lead time in days, wage type (percentage vs fixed per gram), alloy guarantee, and scrap allowance. **Gap:** No self-service supplier portal; only admin entry via `K05Dashboard.tsx`. |
| **Public Indicative Terms** | **PARTIAL** | Replace (Mercur fixed prices) | `server/routes/k05.ts` (`/estimate-price`), `server/storage-k05.ts` (lines 800–850) | Formula calculating indicative price from live 18K rate, wage, and margin exists. **Gap:** Formula lives in backend storage simulator; no public storefront UI exists to render indicative badges to retail shoppers. |
| **Product Review, Approve, Publish** | **PARTIAL** | `NATIVE — EXTEND` (Product status) | `src/types/k05.ts` (`status: 'active' \| 'draft' \| 'archived'`) | Basic draft/active status flags exist. **Gap:** Lacks formal multi-stage approval gate (assay verification, quality inspector sign-off, marketing review) before publication. |
| **Didar On-Behalf-Of Supplier Entry** | **DIDAR — IMPLEMENTED** | N/A (Admin entry) | `src/components/k05/SupplyOffersManager.tsx`, `server/routes/k05.ts` | Didar admin operators can create and manage supplier capacity offers directly on behalf of workshops. |

---

### B. Order Core & Central Sourcing

#### Specification Requirements:
- Blind Marketplace: Retailer submits Product Request; Supplier identity is strictly hidden from Retailer.
- Didar central operations acts as buyer/seller intermediary, allocating requests to workshop capacity.
- Commercial Snapshot: Fixing 18K gold spot rate, manufacturing wage (*ojrat*), wholesale margin, and Article 26 tax at quote time.
- Proforma Invoice issuance and formal Retailer acceptance.
- UID allocation occurs **after** acceptance (physical pieces allocated from vault or agent bags).
- Partial fulfillment and split-shipment management.
- Controlled cancellation: strict rules preventing speculative cancellation during gold market price swings.

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **Blind Marketplace Intermediation** | **CONFLICT** | Replace (Mercur direct vendor checkout) | `src/types/k10.ts`, `server/storage-k10.ts` | Native Mercur splits carts and exposes vendors to buyers. Current K10 implementation models orders as internal Didar orders with hidden suppliers, but lacks an automated sourcing matching engine between Retailer requests and Supplier capacity offers. |
| **Commercial Snapshot & Price Lock** | **PARTIAL** | Extend (Cart completion) | `src/types/k13.ts` (`PriceQuoteLock`), `server/routes/k13.ts`, `server/storage-k13.ts` | Cryptographic price quote locks with configurable validity seconds (e.g. 15 mins) and frozen 18K rate exist in K13. **Gap:** Not integrated into an automated checkout state machine; requires manual admin interaction. |
| **Proforma Issuance & Retailer Acceptance** | **PARTIAL** | Extend (Order confirmation) | `src/types/k13.ts` (`invoiceType: 'proforma' \| 'tax_invoice'`), `src/types/k10.ts` | Proforma data structures with dual settlement breakdown exist. **Gap:** Retailer acceptance workflow is missing a self-service client interface where the retailer signs or accepts terms via OTP. |
| **Post-Acceptance UID Allocation** | **PARTIAL** | Replace (Mercur inventory count) | `server/routes/k10.ts` (`/allocate`), `src/types/k10.ts` (`allocatedItemUids`) | Allows assigning individual serialized UIDs from vault locations or agent bags to order line items. **Gap:** Manual selection by admin; lacks automated FIFO / batch reservation algorithm based on weight tolerances. |
| **Partial Fulfillment & Split Batches** | **PARTIAL** | `NATIVE — USABLE` (Mercur fulfillment split) | `src/types/k10.ts` (`allocationStatus: 'pending' \| 'allocated' \| 'dispatched' \| 'delivered'`) | Item-level allocation and dispatch states support partial fulfillment. **Gap:** Split shipment invoicing and partial proforma reconciliation are not automated. |
| **Controlled Cancellation & Penalty Gate** | **NOT IMPLEMENTED** | Replace (Mercur cancel workflow) | `src/types/k10.ts` (`status: 'cancelled'`) | Only a basic status toggle exists. No cancellation penalty calculation, commodity price variance settlement, or manager approval gate is implemented. |

---

### C. Supply Core & Workshop Management

#### Specification Requirements:
- Supply Order issued by Didar to Supplier (distinct from customer sales order).
- Made-to-order manufacturing workflow.
- Supplier acceptance, confirmed ready-at-supplier date, expected-arrival-at-Didar date.
- Multi-stage supplier delivery (partial batches).
- Supplier settlement terms (consignment, gold weight replacement / *benakari*, fiat wage settlement).
- Remaining balance and scrap allowance tracking.

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **Supply Order Entity** | **PARTIAL** | New Didar Module (No Mercur PO module) | `src/types/k07.ts`, `server/routes/k07.ts`, `server/storage-k07.ts` | Supplier profiles, contracts, and delivery batches are modeled. **Gap:** Formal Supply Order entity linking an accepted customer request to a workshop contract with milestone tracking is only partially simulated. |
| **Made-to-Order Milestone Tracking** | **NOT IMPLEMENTED** | New Didar Module | None | No state machine tracking workshop casting, hallmarking, stone setting, or polishing milestones exists. |
| **Expected Arrival Dates & SLA** | **PARTIAL** | New Didar Module | `src/types/k05.ts` (`leadTimeDays`), `src/types/k07.ts` | Lead time days recorded on offers. **Gap:** Dynamic SLA tracking, delivery delay penalty formulas, and automated alerts are not implemented. |
| **Multi-Stage Delivery Batches** | **PARTIAL** | New Didar Module | `server/routes/k08.ts` (`/intake-shipments`), `src/types/k08.ts` | Intake shipments can receive partial batches against a declared delivery. **Gap:** Reconciliation back to the parent Supply Order remaining balance is missing. |

---

### D. Physical Intake & UID Passports

#### Specification Requirements:
- Supplier documents attachment (delivery slips, assay certificates, Zarrin confirmation slips).
- Three-Weight Hierarchy:
  1. Gross weight (*vazn-e nakhaless*)
  2. Net gold weight (*vazn-e khales 18K/750*)
  3. Stone and non-metal weight deductions (*kasr-e negin va sang*)
- Physical inspection and metallurgical assay tolerance verification (fire assay cupellation, touchstone acid, XRF spectrometry). Note: XRF is deferred/optional in phase 1.
- Individual piece Unique Item Identifier (UID) generation and tamper-evident jewelry tag printing.
- Quarantine hold on tolerance discrepancy.

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **Supplier Document Attachments** | **PARTIAL** | Extend (File Service) | `server/db/schema.ts` (`k01Documents`), `src/types/k08.ts` | K01 document vault exists in PostgreSQL for attaching legal and verification PDFs. **Gap:** Direct linkage between intake shipments and K01 document UUIDs is unindexed. |
| **Three-Weight Hierarchy** | **PARTIAL** | New Didar Module | `src/types/k06.ts`, `src/types/k08.ts`, `src/types/k10.ts` | Net weight, nominal weight, and scale weight are captured. **Gap:** Explicit 3-field decomposition (Gross, Stone Deduction, Net 750) is not enforced as a rigid atomic invariant across intake and invoicing. |
| **Assay Tolerances & Quarantine** | **DIDAR — IMPLEMENTED** | New Didar Module | `src/types/k08.ts` (lines 80–95), `server/routes/k08.ts` (`/quarantine`) | Records fire assay cupellation, touchstone acid, and XRF results. Compares tested fineness against nominal 750.0; automatically triggers `quarantine_hold` if discrepancy exceeds union tolerances. |
| **UID Generation & Passport** | **DIDAR — IMPLEMENTED** | New Didar Module | `src/types/k06.ts` (lines 36–100), `server/routes/k06.ts` (`/passports`) | Generates unique IDs (`DID-AU750-2026-8820-001`), binds serial numbers, NFC UID, QR URL, calibrated scale weights, assay hallmark codes, and QC photo evidence. |
| **UID Label Printing** | **PARTIAL** | New Didar Module | `src/components/k06/K06Dashboard.tsx` | UI drawer displays QR and barcode rendering for jewelry tags. **Gap:** Direct thermal transfer printer integration (ZPL/EPL drivers or print-ready PDF vector sheets) is not implemented. |
| **XRF Spectrometry Requirement** | **DEFERRED / OPTIONAL** | N/A | `src/types/k08.ts` (`AssayTestingMethod`) | Supported as an optional method in data structures, but correctly treated as non-mandatory for phase 1 intake. |

---

### E. Warehouse, Packaging & Dispatch

#### Specification Requirements:
- Multi-location warehouse hierarchy: Central Vault, regional hubs, branch safes, partner custody.
- Shelf / Bin / Compartment level location tracking.
- Packaging inventory (boxes, anti-tamper security pouches, security seals, barcoded bags).
- Final Package creation with cumulative nested tare weights.
- Shipment creation with package tracking codes.
- Shipment ↔ Invoice binding: every shipment must map to an approved Proforma/Invoice and UID manifest.
- OTP custody transfer handoff (Agent pickup, armored escort, courier, retailer delivery).
- Proof of Delivery (POD) with dual-scale weight verification at handover.

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **Multi-Vault Location Hierarchy** | **PARTIAL** | `NATIVE — EXTEND` (Mercur `StockLocation`) | `src/types/k09.ts` (`VaultLocation`), `server/routes/k09.ts` | Central vault, regional hubs, branch safes modeled with capacity, security levels, and custodian officers. **Gap:** Hierarchical Shelf/Bin/Tray sub-compartments are modeled only as an integer count (`compartmentsCount: number`). |
| **Agent Portable Field Bags** | **DIDAR — IMPLEMENTED** | New Didar Module | `src/types/k09.ts` (lines 55–76), `server/routes/k09.ts` (`/agent-bags`) | Dedicated tracking for mobile agent bags: assigned agent, territory, electronic lock status, battery/GPS telemetry, maximum weight limits, and transfer vouchers. |
| **Packaging Inventory & Nested Tare** | **PARTIAL** | New Didar Module | `src/types/k10.ts`, `server/storage-k10.ts` | Tamper seal serials and packaging tare noted in dispatch records. **Gap:** No dedicated stock ledger for packaging materials (boxes, pouches, security seals) and no nested container weight hierarchy. |
| **Shipment ↔ Invoice Linkage** | **PARTIAL** | `NATIVE — USABLE` (Mercur Fulfillment) | `src/types/k10.ts`, `src/types/k13.ts` | Dispatch records reference order IDs and invoice numbers. **Gap:** Disallowance of dispatch without prior invoice authorization is enforced in UI logic rather than an immutable database foreign-key constraint. |
| **OTP Custody Transfer & POD Verification** | **DIDAR — IMPLEMENTED** | New Didar Module | `src/types/k10.ts` (lines 75–95), `server/routes/k10.ts` (`/pod-verify`) | Full POD record: recipient verification, OTP security PIN check, scale weight at dispatch vs scale weight at counter handover, tolerance check (±0.02g), and tamper-seal verification. |

---

### F. Settlement, Invoicing & Dual Subledgers

#### Specification Requirements:
- 18K Gold Standard Basis: All gold transactions normalized to 750 fineness.
- Two Settlements under One Obligation:
  1. Gold metal obligation (grams of 18K gold).
  2. Fiat currency obligation (manufacturing wage, wholesale profit, Article 26 VAT, packaging).
- Central Dual Subledger (K15): Running balance of physical gold weight and fiat currency per partner.
- Cash policy enforcement: configurable initial-payment percentage (20%–50%) and short cash settlement period (24h–72h).
- Credit limit checks against collateral bonds before order confirmation.
- Settlement execution via scrap gold, physical melted gold (*ab-shodeh*), Zarrin ERP balance transfer, or banking transfer (Satna/Paya).
- Official Invoicing compliant with Iranian VAT Law Article 26 (tax applied strictly to wage and margin) and Samaneh Moaddian integration.
- UID linkage: Line items on final invoices bound to specific physical item UIDs.

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **18K Gold Normalization** | **DIDAR — IMPLEMENTED** | New Didar Module | `src/types/k15.ts` (`goldEquivalent750Grams`), `server/storage-k15.ts` | Normalizes non-standard purities (21K, 24K, scrap, bullion) into 18K/750 benchmark weight for all ledger entries. |
| **Dual Subledger (Gold Grams + IRR Fiat)** | **PARTIAL** | New Didar Module | `src/types/k15.ts` (lines 36–100), `server/routes/k15.ts`, `server/storage-k15.ts` | Double-entry voucher model with separate debit/credit legs for gold weight and fiat money. Aging buckets (1–15, 16–30, 30+ days). **Gap:** Stored in flat JSON store; not migrated to ACID PostgreSQL relational schema. |
| **Cash Policy & Prepayment Configuration** | **PARTIAL** | New Didar Module | `src/types/k11.ts` (`BasketPolicyModal`), `src/types/k13.ts` | Models initial cash payment percentage and short cash period. **Gap:** Enforcement is checked manually in UI drawers rather than blocking order progression via a server-side state machine. |
| **Credit & Collateral Exposure Validation** | **DIDAR — IMPLEMENTED** | Extend (Customer limits) | `server/services/k13-k14-bridge.ts`, `server/services/k14-k15-bridge.ts`, `server/routes/k14.ts` | Real-time service bridges evaluating credit exposure across open orders, promissory notes (*safteh*), mortgage bonds, and Sayad checks. Blocks orders exceeding ceilings. |
| **Article 26 Tax Invoicing & Moaddian** | **PARTIAL** | New Didar Module | `src/types/k13.ts` (lines 55–100), `server/storage-k13.ts` | Strict Article 26 calculation: 10% VAT applied strictly to (wage + profit), zero tax on gold metal value. Generates tax invoice structures. **Gap:** Real-time direct API submission to Iran Tax Administration (Samaneh Moaddian TSP) is mocked/simulated. |
| **Zarrin ERP Reconciliation (K16B)** | **PARTIAL** | New Didar Module | `src/types/k16.ts`, `server/routes/k16.ts`, `server/storage-k16.ts` | Implements an idempotent outbox queue, catalog synchronization status, retry counters, and voucher mapping. **Gap:** Uses local mock endpoints; actual SOAP/REST connection to on-premise Zarrin server requires client network credentials. |

---

### G. Agent Operations & Field Operations

#### Specification Requirements:
- Three Bag Classifications:
  1. **Sell-Bag (*Kif-e Foroush*):** Commercial consignment gold authorized for immediate on-site sale and handover to retailers.
  2. **Sample-Bag (*Kif-e Nemouneh*):** Showcase exhibition samples not intended for direct sale (order taking only).
  3. **No-Bag:** Agent traveling with digital tablet catalog only.
- Final invoice generation from authorized Sell-Bag stock.
- Permitted Sample-Bag sale (conditional exception requiring manager approval).
- Retailer Context / Customer 360 available in mobile drawer during store visit.
- Geofenced check-in, scheduled visits, visit logs, and mission outcomes.
- Mobile product presentation gallery and interest tagging.
- Field proxy ordering on behalf of retailer.

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **Three Bag Classifications** | **PARTIAL** | New Didar Module | `src/types/k09.ts` (`AgentBag`), `src/types/k12.ts` | Bags and security lockers modeled. **Gap:** Strict operational separation of Sell-Bag vs Sample-Bag sale rules (and 4-eyes approval for selling sample stock) is not implemented in logic. |
| **Final Invoice from Sell-Bag** | **PARTIAL** | New Didar Module | `src/types/k16.ts` (`eventType: 'bag_sale_invoice'`), `src/types/k10.ts` | Bag sale event type recognized. **Gap:** No mobile checkout workflow for agents to draft and issue on-the-spot invoices from bag inventory. |
| **Field Agent Visits & Geofenced Check-in** | **DIDAR — IMPLEMENTED** | New Didar Module | `src/types/k12.ts` (lines 20–80), `server/routes/k12.ts` (`/visits/check-in`) | Tracks agent duty status, scheduled visits, GPS lat/long check-in against store coordinates, meeting outcomes, and conversion rates. |
| **Product Presentation Mode** | **PARTIAL** | `NATIVE — EXTEND` (Storefront UI) | `src/components/k05/NarrativeStoryGallery.tsx`, `src/components/k12/K12Dashboard.tsx` | High-res gallery cards exist in K05/K12 admin views. **Gap:** No dedicated tablet touch UI with offline image caching and fast swipe presentation. |
| **Proxy Order Placement** | **DIDAR — IMPLEMENTED** | New Didar Module | `server/routes/k12.ts` (`/orders/proxy`), `src/components/k12/ProxyOrderModal.tsx` | Field agents can place proxy orders on behalf of assigned retail stores with validation of retailer credit and territory jurisdiction. |

---

### H. Customer CRM Core

#### Specification Requirements:
- Comprehensive Retailer 360 profile (legal identity, branches, owner contacts, trade licenses, purchasing velocity, credit exposure, return rates).
- Relationship ownership & Territory assignments (account manager and field agent assignments).
- Full activity stream: Calls, meetings, field visits, internal notes, tasks, reminders, follow-ups.
- Product interests and presentation history.
- Unified chronological Timeline merging visits, orders, payments, shipments, tickets, and chats.
- Direct cross-references to Order, Invoice, and Shipment entities.
- Sarv CRM enterprise integration boundary (webhook / sync adapter).

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **Retailer 360 Profile** | **PARTIAL** | `NATIVE — EXTEND` (Mercur `Customer`) | `server/db/schema.ts` (`k01Organizations`, `retailerProfile`), `src/types/k11.ts` | Organizations have detailed retailer profiles (union license, address, phone). **Gap:** Data is fragmented across K01, K11, and K14; no single unified 360 view aggregating orders, ledger balances, and visits. |
| **Activity Stream & Task Follow-ups** | **NOT IMPLEMENTED** | New Didar Module | None | No entities or endpoints for recording phone calls, general meetings, reminders, follow-up tasks, or internal notes outside of specific K12 field visits. |
| **Unified Chronological Timeline** | **NOT IMPLEMENTED** | New Didar Module | None | No event aggregation service exists to produce an integrated customer timeline across visits, orders, payments, and support cases. |
| **Sarv CRM Integration Boundary** | **NOT IMPLEMENTED** | `NATIVE — EXTEND` (Event Subscribers) | None | No webhooks, adapters, or API contracts exist for syncing customer data with Sarv CRM. |

---

### I. Communication / Real-Time Chat

#### Specification Requirements:
- Multi-party B2B conversations (Retailer, Account Manager, Field Agent, Didar Central Support).
- Multimedia message attachments (photos, PDFs, voice notes).
- Read/unread status receipts and push notifications.
- Conversation routing, assignment, and escalation.
- Retailer contextual panel embedded inside the chat view.
- Embedded contextual references: Product cards, Order cards, Invoice cards, and Campaign references.
- Chat events recorded on Customer CRM Timeline.
- AI-assisted smart replies (Didar Copilot).

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **Chat Engine & Conversations** | **NOT IMPLEMENTED** | New Didar Module | None | No WebSocket server, SSE, conversation data model, or message storage exists in the codebase. |
| **Contextual Product/Order Cards in Chat** | **NOT IMPLEMENTED** | New Didar Module | None | No message payload schema supporting rich interactive cards. |
| **AI Suggested Replies in Chat** | **NOT IMPLEMENTED** | New Didar Module | None | No LLM-driven reply generation service integrated into a chat UI. |

---

### J. Campaign Management

#### Specification Requirements:
- Campaign lifecycle: Draft, Scheduled, Active, Paused, Completed, Archived.
- Curated Product Set definition (seasonal collections, manufacturer spotlights, promotional jewelry lines).
- Retailer Audience Segmentation (by territory, purchasing tier, past gold category interest).
- Immutable Audience Snapshot freeze at launch time.
- Field Agent assignment (auto-generating targeted visit and call tasks).
- Retailer engagement tracking and conversion event tracking (orders placed, gold weight sold, revenue).
- Campaign performance analytics.
- CMS landing-page integration.

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **Campaign Lifecycle & Product Sets** | **NOT IMPLEMENTED** | Replace (Mercur basic discounts) | `src/data/rbacCatalog.ts` (line 1199: `content.campaign_operator`) | The role exists in the RBAC catalog, but no campaign data models, routes, or UI components exist. |
| **Audience Segmentation & Snapshots** | **NOT IMPLEMENTED** | New Didar Module | None | No audience query builder or snapshot freezing mechanism exists. |
| **Agent Task Auto-Generation** | **NOT IMPLEMENTED** | New Didar Module | None | No bridge linking promotional campaigns to K12 field visit task queues exists. |
| **Conversion Analytics** | **NOT IMPLEMENTED** | New Didar Module | None | No attribution engine tracking orders generated from campaigns. |

---

### K. Retailer Sales Enablement

#### Specification Requirements:
- "My Products" (*Mahsoulate Man*): Retailer-curated catalog of jewelry for their own showroom/consumers.
- Saved Products and Custom Collections (e.g. "Bridal 2026", "Men's Minimal Rings").
- Public shareable showcase page (white-labeled or retailer-branded).
- Secure expiring/revokable share tokens.
- One-click social sharing: WhatsApp, Telegram, SMS direct link, and printable QR codes.
- Consumer browsing session with interactive feedback: Like, Dislike, Strong Interest, Want to See (*Mikhaham az nazdik bebinam*).
- Lead capture form (consumer name, mobile phone number).
- Retailer analytics dashboard (most viewed pieces, leads captured).
- Didar aggregate demand heatmaps across territories.
- "Ask My Customers" pre-order demand validation before committing to B2B orders.

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **My Products & Custom Collections** | **NOT IMPLEMENTED** | New Didar Module | None | No data models or endpoints allowing retailers to curate private collections. |
| **Public Shareable Showcase Page** | **NOT IMPLEMENTED** | New Didar Module | None | No consumer-facing showcase page or tokenized routing exists. |
| **Social Sharing (WhatsApp/Telegram/QR)** | **NOT IMPLEMENTED** | New Didar Module | None | No share token generators or URL builders exist. |
| **Consumer Feedback (Like/Want to See)** | **NOT IMPLEMENTED** | New Didar Module | None | No consumer interaction event recording or lead capture schema exists. |
| **"Ask My Customers" Demand Validation**| **NOT IMPLEMENTED** | New Didar Module | None | No pre-order demand polling engine exists. |

---

### L. AI Sales Intelligence

#### Specification Requirements:
1. **Didar Copilot (Internal Operations & Management):**
   - Customer 360 summary generation.
   - Conversation / Chat summaries.
   - Next Best Action for sales and account managers.
   - Suggested replies for support desk.
   - Restocking product recommendations based on territory velocity.
   - Follow-up prioritization based on aging balances and purchase intervals.
   - Campaign analysis and management briefings.
2. **Retailer Copilot ("My Didar" Portal):**
   - Counter presentation suggestions for walk-in shoppers.
   - Recommendations for what to add to "My Products".
   - Demand trend prediction in the retailer's city/quarter.
   - Automated replenishment order drafts.
3. **Consumer Shopping Assistant (Showcase Page):**
   - Natural language need understanding (e.g. "Gift for wedding anniversary under 10 grams").
   - Explicit preference filtering (color, stones, style).
   - Side-by-side jewelry comparison.
   - Consultation booking with the originating retailer.
4. **AI Safety & Data Governance:**
   - RBAC tool authorization gates (AI cannot mutate state without human approval).
   - Context grounding (RAG against verified Didar catalog & policies).
   - Multi-tenant boundary enforcement (Store A's data never leaks into Store B's recommendations).

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **SDK Dependency & Capability Config** | **PARTIAL** | N/A | `package.json` (`@google/genai: ^2.4.0`), `metadata.json` (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`) | The official `@google/genai` SDK is installed and permissions are declared in `metadata.json`. |
| **Didar Copilot (Internal Ops AI)** | **NOT IMPLEMENTED** | New Didar Module | None | No LLM endpoints, prompt templates, or copilot UI components exist. |
| **Retailer Copilot (Store Intelligence)** | **NOT IMPLEMENTED** | New Didar Module | None | No retailer-facing AI services exist. |
| **Consumer Shopping Assistant** | **NOT IMPLEMENTED** | New Didar Module | None | No consumer-facing chat or recommendation assistant exists. |
| **AI Safety Guardrails & RAG Grounding**| **NOT IMPLEMENTED** | New Didar Module | None | No vector embeddings, retrieval pipeline, or tool-calling security gates exist. |

---

### M. Maison Luxury CMS & Experience

#### Specification Requirements:
- Homepage and dynamic landing page management.
- Visual Page Builder with drag-and-drop / reorderable blocks:
  - Hero Image with luxury serif typography.
  - Hero Video (full-bleed responsive banner).
  - Editorial Image & Video blocks.
  - Rich Text & Craftsmanship storytelling.
  - Call to Action (CTA) buttons with target routes.
  - Dynamic Product Grid & Product Carousel (querying live Product Core).
  - Category Visual Tiles.
- Journal & Editorial Articles (stories of Iranian master goldsmiths, gold trends).
- Media Library (central asset management with optimization, CDN, tagging).
- Navigation Builder (mega-menu, footer, mobile drawer).
- External Links management.
- 3D / VR Experience (360-degree jewelry inspection embed).
- Publishing Workflow: Draft, Live Preview, Scheduled Publish, Version Rollback.
- Quad-lingual support: Persian (`fa`), English (`en`), Arabic (`ar`), French (`fr`).
- Native RTL / LTR layout switching.
- SEO Engine: Meta tags, OpenGraph cards, Twitter cards, JSON-LD Schema.org rich snippets.
- Live integration with Product Core (live stock, live gold spot rate, direct add-to-bag).

#### Capability Audit Matrix:
| Sub-Capability | Status | Native Mercur Leverage | Current Codebase Evidence | Findings & Architectural Gaps |
|---|---|---|---|---|
| **Quad-Lingual & RTL/LTR Framework** | **DIDAR — IMPLEMENTED** | `NATIVE — EXTEND` (Mercur i18n) | `src/lib/i18n.tsx`, `src/types/domains.ts` | Complete 4-language dictionary (`fa`, `en`, `ar`, `fr`) with dynamic `dir="rtl"` / `dir="ltr"` HTML switching and persistent locale selection. |
| **Visual Page Builder & Blocks** | **NOT IMPLEMENTED** | New Didar Module | None | No block data models, reordering logic, or block renderers exist. |
| **Journal & Editorial Articles** | **NOT IMPLEMENTED** | New Didar Module | None | No blogging, editorial, or content article engine exists. |
| **Media Asset Library** | **NOT IMPLEMENTED** | `NATIVE — EXTEND` (Mercur File Service) | None | No central media management UI with image tagging or CDN transformations exists. |
| **Draft / Preview / Publish / Rollback**| **NOT IMPLEMENTED** | New Didar Module | None | No versioned content revision or staging workflow exists. |
| **Live Product Core Integration in CMS** | **NOT IMPLEMENTED** | New Didar Module | None | No dynamic content blocks bound to live K05 SKU queries exist. |

---

## 4. UI Surfaces Audit

| UI Surface | Target Audience | Target Architecture Role | Current Codebase Status | Concrete Evidence | Critical Assessment |
|---|---|---|:---:|---|---|
| **B2B Storefront** | Retail Jewelers & Public Consumers | Public discovery, jewelry showcase, brand storytelling, indicative rates, cart | **DOES NOT EXIST** | `src/App.tsx`, `src/components/layout/AdminLayout.tsx` | The root application unconditionally renders `AdminLayout`. There is no public storefront, catalog browsing page, product details page, or consumer shopping cart. |
| **Didar Operations Console** | Central Didar Ops, Verifiers, Finance | Central clearinghouse, K01–K20 admin, gold rate lock, audit, approvals | **EXISTS BUT REQUIRES EXTENSION** | `src/components/layout/AdminLayout.tsx`, `src/components/k01/` through `k20/` | Complete navigation bar and individual dashboards exist for all 20 domains. However, domains K02–K20 display simulated in-memory/JSON data and lack deep transactional integration. |
| **Vendor / Supplier Portal** | Workshop Masters & Manufacturers | View supply orders, propose capacity offers, acknowledge delivery batches | **DOES NOT EXIST** | `src/components/k05/SupplyOffersManager.tsx`, `src/components/k07/` | Workshop capacity offers and supplier profiles can only be managed by Didar central administrators inside the Admin Console. |
| **Agent Mobile Surface** | Traveling Field Agents (*Vayzitorha*) | Tablet interface for store visits, Sell-Bag sales, proxy orders, GPS check-in | **EXISTS BUT BUSINESS MODEL CONFLICTS** | `src/components/k12/K12Dashboard.tsx` | K12 exists as a desktop data-dense admin table intended for supervisors, not as a touch-friendly mobile tablet interface with offline capability for field agents. |
| **Retailer Portal ("My Didar")** | Retail Store Owners | Manage "My Products", accept Proformas, track dispatches, view dual ledger | **DOES NOT EXIST** | None | Retailers have no self-service authenticated workspace. All interactions currently require phone/paper coordination with Didar operators. |

---

## 5. Security, RBAC & Core Foundation Audit

| Core Foundation Area | Target Specification | Current Status | Repository Evidence | Evaluation & Architecture Verdict |
|---|---|:---:|---|---|
| **B2B RBAC Model** | 70 Canonical Roles across 8 categories with 4-eyes approval & revisions | **DIDAR — IMPLEMENTED** | `server/db/schema.ts` (`rbacRoles`, `rbacPermissions`, `rbacAssignments`, `rbacPolicyRevisions`, `rbacGrantAuthorityRules`), `src/data/rbacCatalog.ts` (1,480 lines) | **Excellent.** All 70 canonical roles and permissions are cataloged and fully migrated to relational PostgreSQL schema with verified foreign-key constraints and Vitest coverage. |
| **K01 Party / Org Foundation** | Persons, Organizations, Memberships, Document Vault, Audit Logs | **DIDAR — IMPLEMENTED** | `server/db/schema.ts` (`k01Persons`, `k01Organizations`, `k01Memberships`, `k01Documents`, `k01AuditLogs`), `server/repositories/k01.repository.ts` | **Excellent.** Fully relational, indexed, and tested PostgreSQL implementation with strict data validation and version increments. |
| **K03 Auth & MFA** | Session auth, SMS OTP, TOTP authenticator, step-up security gates | **PARTIAL** | `server/routes/k03.ts`, `server/storage-k03.ts`, `src/components/k03/` | OTP and TOTP challenge simulation models exist. **Gap:** Uses local JSON storage; not backed by real SMS provider (Kavenegar/Ghasedak) or PostgreSQL session store. |
| **K04 Approvals & Audit** | 4-eyes approval gates, exception requests, immutable audit logging | **PARTIAL** | `server/routes/k04.ts`, `server/storage-k04.ts`, `src/components/k04/` | Four-eyes approval workflows modeled. **Gap:** Evaluated in memory; requires migration to relational PostgreSQL tables. |
| **Reporting Foundation** | Financial, inventory, and operational reports with export capability | **PARTIAL** | `server/routes/bi.ts`, `server/controllers/bi.controller.ts`, `src/components/bi/BIDashboard.tsx` | High-level KPI aggregations, exposure charts, and turnover metrics exist in BI dashboard. **Gap:** Lacks scheduled automated report exports (Excel/PDF) and regulatory tax reports. |
| **Notification Engine** | Multi-channel alerts (SMS, Push, In-app, Email) | **PARTIAL** | `src/types/paas.ts`, `src/components/paas/PaaSDashboard.tsx` | In-app notification state modeled in PaaS layer. **Gap:** No external SMS gateway or push notification delivery workers connected. |

---

## 6. Architectural Conflicts Identified

1. **Direct Marketplace vs. Central Counterparty Conflict:**
   - *Conflict:* Standard marketplace frameworks (like Mercur) default to open vendor storefronts where the buyer directly places orders with the third-party seller.
   - *Didar Requirement:* Didar is an intermediary blind marketplace. Didar purchases from workshops and sells to retailers, absorbing credit risk and verifying metallurgical assay. Direct buyer-to-seller interactions are strictly forbidden.
   - *Resolution:* Native Mercur order and cart workflows cannot be used out-of-the-box; they must be encapsulated behind Didar's Central Sourcing Workflow (B1).

2. **Single Fiat Currency vs. Commodity-Backed Dual Obligations:**
   - *Conflict:* Standard ecommerce platforms assume a static unit price in fiat currency (e.g. USD, EUR, IRR) that can be paid via payment gateways (Stripe, ZarinPal).
   - *Didar Requirement:* Gold cannot be priced as a static fiat number. An order line consists of an 18K gold weight obligation (payable in physical gold scrap, bullion, or Zarrin weight transfer) plus a fiat wage (*ojrat*) obligation.
   - *Resolution:* Native Mercur payment and price modules must be replaced or bridged by Didar's K13 Live Spot Engine and K15 Dual Subledger.

3. **Discrete Integer Stock vs. Continuous Metallurgical Weight Serialization:**
   - *Conflict:* Standard inventory systems decrement an integer quantity (e.g. `stock_quantity: 10`).
   - *Didar Requirement:* Two gold rings from the same mold have different physical weights (e.g. 10.42g vs 10.58g), different assay purities, and distinct laser hallmarks. Inventory must be managed by tracking individual, serialized UIDs with calibrated analytical scale weights.
   - *Resolution:* Native inventory items must be linked to Didar K06 Unique Item Passports.

4. **Monolithic Admin View vs. Multi-Portal Separation:**
   - *Conflict:* The current codebase hosts all functionality inside a single monolithic admin container (`AdminLayout.tsx`).
   - *Didar Requirement:* The platform requires distinct, isolated portals: Storefront (Public/Retailer), Vendor Portal (Workshops), Agent Mobile App (Field Officers), "My Didar" (Retailers), and Operations Console (Didar Internal).
   - *Resolution:* Deconstruct `AdminLayout` into decoupled applications sharing a common API and RBAC session context.

---

## 7. Dependency Graph of Missing Capabilities

The following directed dependency graph illustrates the technical prerequisites required to implement the missing capabilities without architectural deadlocks:

```
[Phase A: Database & Baseline Commerce]
  │
  ├─► 1. Migrate K05, K06, K08, K09, K10 to PostgreSQL (Schema & Migrations)
  │     │
  │     ├─► 2. K13 Live Gold Spot Rate & Price Lock Engine
  │     │     │
  │     │     └─► 3. K15 Dual Subledger & Article 26 Invoicing
  │     │           │
  │     │           └─► 4. K16 Zarrin ERP Sync & Idempotent Outbox
  │     │
  │     └─► 5. K06/K09 Physical Intake & UID Serialization
  │           │
  │           └─► 6. K10 Allocation & OTP Proof of Delivery (POD)
  │
[Phase B: B2B Multi-Portal & Operations]
  │
  ├─► 7. B2B Storefront & Retailer "My Didar" Portal (Depends on 1, 2, 3)
  │     │
  │     ├─► 8. Retailer Sales Enablement: "My Products" & Share Links (Depends on 7)
  │     │     │
  │     │     └─► 9. "Ask My Customers" Demand Validation (Depends on 8)
  │     │
  │     └─► 10. Customer CRM Core: Retailer 360 & Activity Stream (Depends on 7)
  │           │
  │           ├─► 11. Real-Time Multi-Party Chat & Contextual Cards (Depends on 10)
  │           │
  │           └─► 12. Campaign Management & Audience Snapshots (Depends on 10)
  │
  └─► 13. Field Agent Mobile App (Sell-Bag / Sample-Bag) (Depends on 5, 6, 10)
        │
        └─► 14. Geofenced Visits & Proxy Ordering (Depends on 13)

[Phase C: Maison CMS & AI Intelligence]
  │
  ├─► 15. Maison Luxury CMS Page Builder (Depends on 1, 7)
  │     │
  │     └─► 16. Campaign Landing Pages & Journal Articles (Depends on 12, 15)
  │
  └─► 17. AI Sales Intelligence Service (Depends on 1, 7, 10, 11)
        │
        ├─► 18. Didar Copilot (Internal Operations & Next Best Action)
        ├─► 19. Retailer Copilot (Store Recommendations)
        └─► 20. Consumer Shopping Assistant (Showcase Consultation)
```

---

## 8. Final Audit Conclusion & Recommendations

### Summary Scorecard:
- **K01 (Parties & Orgs) & RBAC:** **PRODUCTION READY.** Clean relational PostgreSQL implementation with 70 canonical roles, 4-eyes approval revisions, and comprehensive automated test suite.
- **K02–K20 Core Logic:** **FUNCTIONALLY SOUND BUT STORAGE LIMITED.** Rich business models, domain workflows, and UI dashboards exist, but operate over JSON flat files rather than transactional PostgreSQL tables.
- **Mercur Integration:** **UNINTEGRATED.** The codebase is currently standalone. Integration with Mercur should focus on reusing its multi-vendor catalog, category hierarchy, customer models, and workflow engine, while replacing pricing and direct-order flows with Didar's gold value chain modules.
- **Retailer, Consumer, Field, and AI Surfaces:** **NOT YET IMPLEMENTED.** The consumer storefront, retailer enablement tools, CRM/chat, campaign engine, luxury CMS, and AI copilots represent the largest development surface remaining.

### Recommended Next Steps for Project Ownership:
1. **Approve Architecture Baseline:** Confirm the hybrid strategy defined in `MERCUR-REUSE-MATRIX.md` (leveraging Mercur for generic catalog/auth while building bespoke Didar modules for commodity gold pricing, dual ledgers, UID passports, and agent operations).
2. **Phase 1 Priority:** Migrate the core physical and financial commerce domains (`K05`, `K06`, `K08`, `K09`, `K10`, `K13`, `K15`) from JSON storage into the existing PostgreSQL database schema alongside `K01` and `RBAC`.
3. **Phase 2 Priority:** Implement the B2B Storefront and Retailer "My Didar" portal to unlock self-service ordering, quote locking, and Proforma acceptance.
4. **Phase 3 Priority:** Implement Retailer Enablement ("My Products", consumer sharing links), Customer CRM, and Maison CMS.
5. **Phase 4 Priority:** Implement the three AI Copilots (Didar Copilot, Retailer Copilot, Consumer Assistant) with RBAC tool-calling guardrails and vector grounding.
