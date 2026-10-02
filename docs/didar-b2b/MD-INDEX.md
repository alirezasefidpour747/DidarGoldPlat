# MD-INDEX.md --- Didar B2B Specification Index

**Status:** Current consolidated index\
**Date:** 2026-10-02

## Master / Cross-Cutting

  ---------------------------------------------------------------------
  File                               Purpose
  ---------------------------------- ----------------------------------
  `MASTER-B2B-FLOW.md`               Master end-to-end business/system
                                     map

  `REPORTING-FOUNDATION.md`          Reporting, audit, dimensions and
                                     extraction

  `UI-FOUNDATION.md`                 Shared UI/UX contract

  `B2B-STOREFRONT-UX.md`             Retailer Storefront + My Didar

  `DIDAR-OPERATIONS-CONSOLE.md`      Didar internal role-driven
                                     operations UI

  `B2B-RBAC.md`                      Organizations, roles, permissions
                                     and scope

  `AUTH-OTP-SECURITY.md`             Authentication, OTP and API
                                     security

  `NOTIFICATION.md`                  Operational notification delivery
  ---------------------------------------------------------------------

## Implementation Packages

  -------------------------------------------------------------------------
  Package            File                         Purpose
  ------------------ ---------------------------- -------------------------
  P01                `PRODUCT-CORE.md`            Three-level taxonomy →
                                                  Product/Variant →
                                                  Supplier Offers

  P02                `ORDER-CORE.md`              Retailer Product request,
                                                  sourcing,
                                                  Proforma/acceptance
                                                  boundary

  P03                `SUPPLY-ORDER.md`            Didar → Supplier sourcing
                                                  commitment

  P04                `PHYSICAL-INTAKE.md`         Physical receipt,
                                                  documents, weights,
                                                  UID/label

  P05                `B2B-RBAC.md`                Organization/role
                                                  enforcement

  P06                `PACKAGING-FULFILLMENT.md`   Packaging queue and
                                                  Package creation

  P07                `DISPATCH-DELIVERY.md`       Shipment, tracking,
                                                  invoice manifest, OTP
                                                  custody, delivery

  P08                `AGENT-OPERATIONS.md`        Sell-Bag, Sample-Bag,
                                                  No-Bag

  P09                `SETTLEMENT-CORE.md`         18K-gold obligations,
                                                  policy, ledger and
                                                  reconciliation

  P10                `INVOICE-BILLING.md`         Proforma/final/supplier
                                                  invoice and UID linkage

  P11                `AUTH-OTP-SECURITY.md`       Authentication and
                                                  security

  P12                `NOTIFICATION.md`            Operational notifications
  -------------------------------------------------------------------------

## P01 Supporting

  ---------------------------------------------------------------------
  File                               Purpose
  ---------------------------------- ----------------------------------
  `PRODUCT-TAXONOMY-SEED.md`         Authoritative initial three-level
                                     gold taxonomy

  `P01-IMPLEMENTATION-MAP.md`        Approved Mercur technical mapping
                                     for P01

  `MERCUR-UI-BASELINE.md`            Mercur Storefront/Admin/Vendor UI
                                     reuse/extend/replace audit
  ---------------------------------------------------------------------

## Optional / Deferred

  File                       Purpose
  -------------------------- --------------------------------------
  `WAREHOUSE-INVENTORY.md`   Full Shelf/Bin/WMS capability
  `PACKAGING-INVENTORY.md`   Packaging-material stock/consumption

## Work / Baseline

  File                         Purpose
  ---------------------------- ---------------------------------------
  `CLEAN-MERCUR-BASELINE.md`   Clean Mercur source/runtime baseline
  `WORK-ADDENDUM-UI.md`        UI instructions for the existing Work

## Mandatory Rule

`Database → Backend → API → Frontend → Test`

No mock-only or screen-only implementation is complete.

## Customer / CRM / Enablement / AI Tracks

  --------------------------------------------------------------------------
  Track              File                             Purpose
  ------------------ -------------------------------- ----------------------
  CRM01              `CUSTOMER-CRM-CORE.md`           Retailer Customer 360,
                                                      activities, tasks,
                                                      visits, interests and
                                                      timeline

  CRM02              `COMMUNICATION-CHAT.md`          CRM-linked
                                                      Agent/Didar/Retailer
                                                      conversations

  CRM03              `CAMPAIGN-MANAGEMENT.md`         Audience, Product
                                                      campaign, execution,
                                                      conversion and
                                                      analytics

  EN01               `RETAILER-SALES-ENABLEMENT.md`   My Products, shareable
                                                      Collections, consumer
                                                      signals and Retailer
                                                      leads

  AI01               `AI-SALES-INTELLIGENCE.md`       Didar Copilot,
                                                      Retailer Copilot and
                                                      Consumer Shopping
                                                      Assistant
  --------------------------------------------------------------------------

Recommended dependency direction:

``` text
P01 Product
├── P02 Order
└── CRM01 CRM Core
    └── CRM02 Chat
        ├── CRM03 Campaign
        └── P08 Agent Operations
            ↓
          EN01 Retailer Enablement
            ↓
          AI01 AI Sales Intelligence
```

AI implementation should follow availability of real
CRM/communication/engagement data.

## Dependency Authority

  ---------------------------------------------------------------------
  File                               Purpose
  ---------------------------------- ----------------------------------
  `DEPENDENCY-MAP.md`                Authoritative
                                     hard/cross-cutting/event/future
                                     dependency graph across Commerce,
                                     CRM, Agent, Enablement and AI
                                     tracks

  ---------------------------------------------------------------------

Work must read this map before implementing any new package.

## Maison / Content Track

  -----------------------------------------------------------------------------
  Track                   File                          Purpose
  ----------------------- ----------------------------- -----------------------
  CMS01                   `CONTENT-EXPERIENCE-CMS.md`   Maison Page Builder,
                                                        Homepage, Journal,
                                                        Media, Navigation,
                                                        VR/External Experience,
                                                        Publishing and Product
                                                        Blocks

  -----------------------------------------------------------------------------

CMS01 is downstream of Product Core and is not part of P01.
