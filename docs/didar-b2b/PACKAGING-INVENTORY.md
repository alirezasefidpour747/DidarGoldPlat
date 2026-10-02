# PACKAGING-INVENTORY.md --- Didar B2B Packaging Materials Inventory

**Status:** Draft v0.1 --- implementation contract; detailed operational
defaults proposed below\
**Date:** 2026-09-29\
**Scope:** Receipt, quantity stock, location movements, actual use,
wastage and reporting of packaging consumables\
**Base:** Clean Mercur fork; no inherited code or workarounds\
**Aligned contracts:** `PACKAGING-FULFILLMENT.md` v0.3;
`PHYSICAL-INTAKE.md` v0.6; `B2B-RBAC.md` v0.3; `REPORTING-FOUNDATION.md`
v0.3\
**Implementation status:** Specification only. No repository changes,
migrations, builds, hardware tests or application tests performed.

## 1. Purpose and boundary

Track the boxes, pouches, bags, labels, cards, seals and protective
materials used by Didar. For each material, answer: what arrived, where
is it, how much remains, what consumed it, what was wasted, and who
recorded each action?

``` text
Material definition → Receipt/check → Usable stock by location
    → Actual use by Packaging Job or Label Print Run → Consumption history
    → Remaining stock / shortage / wastage / controlled correction reports
```

Keep four identities separate:

  -----------------------------------------------------------------------
  Identity                            Meaning
  ----------------------------------- -----------------------------------
  Material SKU                        A type of consumable, such as a
                                      ring box or blank UID label

  Package reference                   An actual outbound container
                                      holding shipped goods

  Shipment tracking code              A delivery journey; may include
                                      multiple packages/invoices

  Gold-item UID                       A specific physical gold item, not
                                      its disposable box or label stock
  -----------------------------------------------------------------------

This module does not create a gold UID for every box/card. Material lots
are optional; ordinary stock is quantity-based. A blank warranty card is
a consumable, not an activated warranty.

The receipt of packaging supplies is distinct from gold
`PHYSICAL-INTAKE`. Its supplier document may be attached; gold-specific
Zarrin invoice confirmation, individual gold weighing and UID generation
are not required here. A packaging vendor need not be a gold Supplier or
have a portal account. Existing organization/contact identities may be
reused without granting portal permissions.

## 2. Material master and units

Minimum logical fields; map them to the verified clean framework rather
than duplicating a suitable native model:

``` text
material_id, material_code, name, material_type, specification?, status
base_uom, quantity_increment, purchase_uom?, conversion_to_base?
default_vendor_id?, permitted_location_ids, reorder_point_by_location?
created_at/by, updated_at/by
```

Material types initially include `BOX`, `BAG`, `POUCH`, `UID_LABEL`,
`PACKAGE_LABEL`, `CARD`, `SEAL`, `PROTECTIVE_MATERIAL`, `OTHER`. These
are proposed codes, not a fixed supplier taxonomy.

Use a separate SKU when size, print, specification or physical
interchangeability differs. Record optional dimensions/print-template
compatibility without inventing actual label sizes or printer models.

Every SKU has one stock base unit. `EA` is integer-counted; length-based
material may use `M` with an explicit increment. A roll is a purchase
unit only when its conversion is known: for example, two rolls of 500
labels mean 1,000 `EA`. Record the actual conversion on the receipt; do
not assume all rolls contain 500 labels or count both rolls and labels
as independent stock.

Reject missing/invalid conversions and fractional quantities for
indivisible units. Use exact decimal quantities with explicit units.
Once movements exist, do not silently change the SKU's base unit or
reinterpret history. Discontinued SKUs remain reportable; operational
consumption requires an active/permitted material.

## 3. Minimal record structure

These are business concepts, not a mandate for separate tables for every
row.

  -----------------------------------------------------------------------
  Record                              Required content
  ----------------------------------- -----------------------------------
  Material                            Stable SKU, specification, unit and
                                      active/inactive state

  Material Receipt / Line             Vendor, receipt reference,
                                      material,
                                      declared/delivered/accepted/held
                                      quantities, unit conversion
                                      snapshot, location, optional lot,
                                      documents, receiver and
                                      confirmation

  Movement / Posting Group            Material, base quantity,
                                      source/destination location and
                                      condition, type, source event,
                                      reason, actual actor,
                                      recorded/effective time, reversal
                                      link

  Usage Event                         Source type and stable ID,
                                      material, actual quantity, outcome,
                                      location, related job/package/print
                                      run and posting-group reference

  Count Session                       Selected
                                      material/location/condition, ledger
                                      revision, counted quantity,
                                      proposed variance, approver and
                                      resulting adjustment

  Balance projection                  Derived quantity by
                                      material/location/condition/lot;
                                      rebuildable from posted movements,
                                      never the independent authority
  -----------------------------------------------------------------------

Optional lots must not prevent receipt/use of unbatched stock. Store
source record IDs, not only notes. Business ownership/location scope and
actual actor must be explicit; stock custody does not by itself
establish legal ownership or payment.

## 4. Receipt and acceptance

``` text
Authorized Didar user selects vendor and materials
    → Records quantities, units, documents and actual receipt
    → Counts/checks condition
    → Separates usable goods from retained HOLD/DAMAGED goods
    → Confirms receipt → Posts stock movements once
```

Draft receipts do not increase stock. Partial vendor deliveries have
separate actual receipts with an optional common delivery/purchase
reference. Do not require the gold `SUPPLY-ORDER` customer-acceptance
gate to replenish empty boxes or labels.

Only physically received, accepted quantities enter `USABLE`. Retained
doubtful/damaged goods enter a non-usable bucket; rejected goods
immediately returned and not retained do not enter on-hand stock. Keep
declared, delivered, accepted, held and rejected quantities distinct; do
not count a declared vendor quantity as accepted stock.

Receipt confirmation requires valid material/unit/location, actual
counted quantities and an authorized actor. Vendor invoice/delivery-note
attachments and operational purchase cost are supported, not mandatory
assumptions. Posted receipts cannot be overwritten or deleted;
corrections use linked, authorized counter-movements.

## 5. Stock ledger and availability

Use condition buckets `USABLE`, `HOLD`, `DAMAGED`; an inter-location
handoff can also be `IN_TRANSIT`. These are material stock conditions,
not gold-item or Order states.

Proposed movement families:

``` text
OPENING_BALANCE, RECEIPT, TRANSFER, CONDITION_CHANGE,
CONSUMPTION, WASTAGE, RECOVERY, VENDOR_RETURN,
COUNT_ADJUSTMENT, REVERSAL
```

Every posted movement is append-only with source/event identity and
actor. Opening balances require counted quantity and approval, not a
direct database balance edit. Internal transfers/condition changes have
balanced source/destination entries.

``` text
usable_on_hand(material, location) = posted balance in USABLE
available_to_use = usable_on_hand
```

No separate reservation engine is required in v0.1. Planned job needs
are forecasts only; they do not reduce stock. Commit actual use with a
concurrency-safe stock check. A later reservation module must explicitly
revise this formula rather than subtracting a hidden second balance.

No bucket may become negative. Two operators must not consume the same
last unit. Each source event/line has one posting group: retrying the
same command returns its existing result; the same key with different
content is rejected. Editing a summary screen or completing dispatch
must not create extra consumption.

## 6. Location movements, stock count and low-stock alerts

A transfer from a central store to a packing bench is not consumption.
Record dispatch to `IN_TRANSIT` and receipt into the destination, or an
atomic verified move when physical custody is confirmed in one action.
Never make both locations usable simultaneously for the same moved
quantity. Location-limited operators cannot debit another location by
changing an ID.

A stock count records observed quantity and the relevant ledger
revision. If stock changed after that revision, reject posting until
recount/revalidation; do not overwrite intervening use. An authorized
adjustment records delta, reason and reviewer. Ordinary packing
operators cannot silently edit balances.

Optional reorder points are per material/location in the base unit.
Report low stock when usable balance is at/below the configured point.
Show planned demand separately from confirmed stock. No automatic
purchase, supplier commitment, customer-order cancellation or
substituted material is triggered by an alert.

## 7. Packaging consumption contract

`PACKAGING-FULFILLMENT` owns the packing job; this module owns material
stock movements.

1.  The assigned operator selects materials and records actual use at
    the authorized location. Suggestions/default quantities remain
    editable proposals, not evidence of use.
2.  Each actual use occurrence has a stable `usage_event_id`, source job
    and material quantities. Identify its physical package where known;
    order/shipment/invoice links are obtained through the approved
    manifest.
3.  Post consumption once when physical use is confirmed. A recorded
    planned line alone does not consume stock. If stock is insufficient,
    raise `MATERIAL_SHORTAGE`; do not claim success or negative
    inventory.
4.  Before marking a job `PACKAGED`, all required actual material use
    must be posted and reconciled. Previously posted usage is
    referenced, not posted again. Completion and any remaining postings
    must be atomic, or remain visibly pending until the coordinated
    operation succeeds.
5.  Required materials cannot be silently skipped or substituted. An
    authorized change updates the instructions with history; it cannot
    change gold UIDs, customer terms or delivery policy.

Materials are not consumed again when a package gets a tracking code,
OTP is verified, custody changes or delivery is completed. A physically
applied label is accounted for either by its Print Run or by a non-print
Usage Event, never both.

## 8. UID and package-label material use

Link blank label stock to a material SKU and each actual `print_run_id`.
Generating UID data, rendering a printable file, downloading it or
placing it in a queue is not evidence that labels were physically
consumed.

A printer result, or authorized operator confirmation when hardware
feedback is absent, records actual usable labels printed and blanks
wasted. Both remove material; classify them separately within one
posting group. This is not proof that labels were attached to the
correct gold pieces; Intake's attachment/identity check remains
separate.

Example: 1,000 blank labels received; a run uses 120 good labels and
wastes 3 blanks. Stock becomes 877. A later physical reprint uses 5 good
labels and 1 wasted blank: stock becomes 871. Repeating the API response
for either run changes nothing. These are test quantities, not Didar
defaults.

A real reprint is a new physical run that consumes additional material
but reuses the same gold UID/package reference. A retry is not a
reprint. A failed run that consumed no blanks records zero with failure
evidence; a jam that consumed blanks records actual waste. Unknown
printer outcome stays pending for reconciliation, not fabricated success
or fabricated zero.

Check/respect stock before an authorized print run. If reported real
usage exceeds recorded stock, keep the physical event as an exception,
block material reconciliation/completion, and correct the shortage
through authorized receipt/count evidence; do not hide waste. Intake
must not issue new gold UIDs merely to reconcile blank-label stock.

## 9. Damage, cancellation, repacking and recovery

  -----------------------------------------------------------------------
  Situation                           Inventory treatment
  ----------------------------------- -----------------------------------
  Job cancelled before any use        No consumption reversal needed;
                                      remove only unused planning

  Box/card already consumed           Cancellation alone does not restore
                                      stock

  Physically recovered, inspected,    `RECOVERY` referencing original
  reusable material                   usage; credited quantity cannot
                                      exceed unreturned usage

  Tape/seal destroyed during          Remains consumed; do not restore
  unpacking                           stock

  Unused stocked material damaged     Move USABLE → DAMAGED once;
                                      controlled disposal/vendor return
                                      removes it later

  Consumed material subsequently      Reclassify/annotate its existing
  found unusable                      use outcome as waste; no second
                                      stock debit

  Repackaging uses new materials      New actual usage event; prior
                                      consumption/recovery history
                                      remains

  Incorrect posted quantity           Controlled correction/reversal, not
                                      a fictional physical recovery
  -----------------------------------------------------------------------

Recovery is not automatic on Order cancellation, return status or
package reopening. A print run that physically happened cannot be undone
by refunding labels in software. Partial recovery is allowed with
traceability. Reversal cannot create stock that would make subsequent
movements inconsistent.

## 10. Optional cost information --- not accounting

Store actual purchase unit cost and currency when supplied, along with
conversion and vendor document references. Unknown cost is `NULL`, not
zero. Permission-protect these fields.

No stock valuation method, accounting posting, supplier debt or
packaging charge to the retailer is assumed. FIFO/average-cost valuation
and financial settlement need separate approval. Operational stock
remains usable without purchase prices. Do not sum different currencies
or price bases, and do not invent a packaging charge on an accepted
invoice.

## 11. Permissions and access

Proposed initial grants reuse existing roles; no new role or external
vendor access is required. Apply permission + organization + location +
job/source scope on the backend.

  -----------------------------------------------------------------------
  Role                                Material operations allowed
  ----------------------------------- -----------------------------------
  `DIDAR_SUPER_ADMIN`                 Master/configuration, receipt,
                                      posting, count adjustment and
                                      report permissions; cannot bypass
                                      ledger invariants

  `DIDAR_WAREHOUSE_INTAKE`            Material read,
                                      receipt/check/confirm, location
                                      transfers, count submission, linked
                                      label-run reconciliation, inspect
                                      recoveries in permitted locations

  `DIDAR_PACKAGING`                   Read operational stock at assigned
                                      work locations; actual use/waste
                                      for assigned jobs/print runs;
                                      request recovery and raise
                                      shortages

  `DIDAR_ORDER_OPS`                   Read packaging readiness/shortage,
                                      not material purchasing costs or
                                      stock mutation by default

  `DIDAR_DISPATCH`                    Read readiness and manifest; no
                                      second material debit on handover

  Supplier/Retailer/Agent roles       No internal material ledger, vendor
                                      costs or mutation by default
  -----------------------------------------------------------------------

`material.adjustment.approve`, `material.master.manage`,
`material.cost.read` and `material.recovery.approve` are separate
permissions. Initial adjustment/master/cost authority is Super Admin;
warehouse staff may approve physically inspected recoveries within their
scope. Role combinations do not bypass negative-stock or source-event
rules. All reports/exports share the same field and row restrictions.

## 12. API capabilities and minimum UI

Exact routes and reuse of native records must be inspected in Work. Do
not assert a ready-made Mercur module or replace commerce routes without
mapping.

  -----------------------------------------------------------------------
  Surface                             Backend capability and
                                      corresponding UI
  ----------------------------------- -----------------------------------
  Materials                           Create/update/deactivate permitted
                                      SKUs; unit/conversion validation;
                                      material list and detail

  Receipt                             Draft/read/check/confirm with
                                      documents and actor; accepted/held
                                      split

  Stock card                          Paginated balances and movement
                                      history by material/location;
                                      low-stock filter

  Transfer/count                      Dispatch/receive transfer; record
                                      count; approve non-stale adjustment

  Packing/printing                    Confirm actual usage/waste once;
                                      reconcile Print Run; report
                                      shortage; request/approve recovery

  Reports                             Scoped filters, grouped totals,
                                      drill-down and CSV export of
                                      permitted structured data
  -----------------------------------------------------------------------

An API failure must be shown as failure/pending; no silent fallback to
mock success. Build a real stock list, receipt form, movement detail and
actual-use integration, not only a dashboard mock. Final dashboard
design, scheduled reports and XLSX formatting can follow separately.

## 13. Reporting & Analytics Requirements

**Dimensions:** material/SKU/type/base unit, vendor, receipt/line,
condition/lot, warehouse/location, movement/posting group, usage event,
Packaging Job, package/inner group when linked, Print Run, label type,
order/shipment/tracking/invoice relationships where applicable,
actor/organization, status, reason, effective and recorded timestamps.

**Measures:** opening/closing/usable/held/in-transit balances; actual
receipts; use; waste; recovered quantity; vendor returns; count
adjustments; transfer in/out; planned demand; reorder gap; print
good/waste counts. Costs remain optional and permissioned.

**Minimum reports:** stock by material/location; stock-card movement
history; receipts by vendor/period; consumption by job/package/operator;
UID-label vs package-label consumption and reprint waste;
damage/recovery/count-variance reports; low stock; unresolved
print/stock exceptions; as-of balances from event history.

**Grain rules:** one physical use event is counted once. A job/package
carrying two invoices does not double material consumption. Keep shared
package materials at package/job grain unless an explicit allocation
rule exists; never invent per-invoice cost shares. Transfers are not
use. Summing location balances must not double-count stock in transit.
Aggregate quantities only within comparable units/materials; no total
that adds metres to pieces. Gross package weights are observations in
Packaging/Dispatch, not material-unit counts or gold weight.

**Extraction:** controlled backend queries with pagination, stable IDs,
composable filters and timestamp ranges. Minimum CSV export must use the
same authorized query and field projection, not screen scraping. Store
full source links for future BI; no analytical warehouse is required
now.

**Drill-down:** vendor → material receipt → movement → usage event →
job/package/Print Run. For a Print Run, authorized users can trace
associated UIDs through Intake without multiplying consumed labels by
the UID join. Historical units, conversions, actors and movements remain
interpretable after master-data edits.

## 14. Audit and consistency

Record material/unit configuration changes, receipt
confirmation/correction, transfers, counts/approvals, actual use/waste,
recovery, reversals, print reconciliation and denied sensitive
operations. Events include actual actor/organization, target, source ID,
time, before/after, reason and on-behalf-of context when relevant.

Protected documents/costs are not copied into public reports. No OTP
secrets or unrelated retailer/supplier financial terms belong in
material logs. History is append-oriented. Posted movement totals,
balance projections and source-job usage must be reconciliable.

## 15. Cross-document contracts

  -----------------------------------------------------------------------
  Contract                            Alignment in this package
  ----------------------------------- -----------------------------------
  `PACKAGING-FULFILLMENT.md` v0.3     Actual material use posts through
                                      this module; completion checks
                                      posting status; repack/cancel never
                                      blindly restores consumables

  `PHYSICAL-INTAKE.md` v0.6           UID label Print Runs consume blanks
                                      only once on physical confirmation;
                                      identifiers and gold weights
                                      unchanged

  `B2B-RBAC.md` v0.3                  Scoped material permissions,
                                      separation of adjustment/cost
                                      access and external visibility

  `REPORTING-FOUNDATION.md` v0.3      Material ledger, units, print waste
                                      and no double-counting across
                                      packages/invoices
  -----------------------------------------------------------------------

No change is required here to customer acceptance, Supplier Supply Order
terms, OTP custody handover, invoice linkage, shipment tracking or
optional outbound package weights. Blank-label consumption must not
duplicate dispatch printing charges or gold stock movements. Outbound
packaging containers and material stock are separate records.

## 16. Acceptance tests --- not yet executed

-   [ ] Create distinct materials for box size/label type; no gold UID
    is created for each consumable.
-   [ ] Receipt draft changes no stock; accepted and held quantities
    post to distinct buckets once.
-   [ ] Receive 2 rolls × 500 labels → 1,000 EA; changed master
    conversion does not rewrite that receipt.
-   [ ] Transfer 30 of 100 boxes to a packing bench → total 100, never
    130; receipt moves transit quantity only once.
-   [ ] Confirm actual use of 10 bench boxes → total 90; repeated
    API/completion/dispatch calls leave 90.
-   [ ] Two concurrent consumers cannot spend the last box twice;
    shortage blocks successful completion.
-   [ ] Generating/downloading a UID label file does not debit blanks;
    confirmed 120 good + 3 waste → 877 labels.
-   [ ] Physical reprint 5 good + 1 waste → 871 labels; no extra gold
    UID; retry creates no extra debit.
-   [ ] Unknown print outcome remains pending; no fabricated zero
    consumption or successful reconciliation.
-   [ ] Cancel used-box job → still 90 boxes; inspect/recover 2 → 92;
    duplicate recovery leaves 92.
-   [ ] Marking already consumed material as waste causes no second
    stock debit.
-   [ ] A count based on a stale ledger revision cannot overwrite
    intervening use.
-   [ ] Configured low-stock alert appears without creating a purchase
    or changing a customer agreement.
-   [ ] Two invoices linked to one package do not double material use,
    balance, print quantity or optional costs.
-   [ ] Supplier/Retailer/direct-ID API attempts cannot see or change
    internal stock/costs; location scope applies.
-   [ ] Movement history, filters, as-of balance and authorized CSV
    export agree with persisted data.
-   [ ] Actual source actors, corrections and recovery links survive
    restart; no posted history is deleted.
-   [ ] Real DB → Backend → API → Frontend → Test path, migrations and
    both builds pass with recorded evidence.

## 17. Implementation boundary and proposed defaults

Proposed defaults: count-based material stock; optional lot and purchase
cost; no reservation engine; controlled manual
receipts/transfers/counts; scoped existing roles; CSV extraction first.
Actual material catalog, units/conversions, reorder levels, locations
and label-printer feedback are configuration decisions to supply before
live use, not fabricated seed business facts.

First vertical slice:
`one material → real receipt → usable balance → one assigned job's actual use → stock card/report → test`.
Then integrate Print Run wastage/reprint and recovery. Packaging/Intake
may retain standalone development flows, but cannot claim
material-ledger integration complete until tested against this module.

Out of scope: full packaging procurement/approval system, vendor portal,
financial valuation/settlement, compulsory Zarrin confirmation for
consumables, reusable-container deposits, warranty activation,
packaging-to-retailer charging, automatic substitutions, advanced
reservation/forecasting, hardware selection and final BI dashboards.

This is **P07 --- Packaging Materials Inventory**, a specification
package, not a production-release claim. Work must record the exact
framework mapping and preserve the clean-fork rule before
implementation.
