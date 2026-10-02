# WORK-ADDENDUM-UI.md --- Addendum for the Existing Didar B2B Work

Use this as an **addendum to the master Work prompt already provided**.

Do not reset the repository. Do not discard completed baseline work. Do
not restart from the old Didar project.

## 1. New UI specifications

Add these authoritative UI documents:

``` text
UI-FOUNDATION.md
B2B-STOREFRONT-UX.md
DIDAR-OPERATIONS-CONSOLE.md
```

From now on, before changing any frontend/admin screen, read:

``` text
the Feature Business MD
+ UI-FOUNDATION.md
+ the relevant Surface UX MD
```

For Retailer-facing work:

``` text
B2B-STOREFRONT-UX.md
```

For Didar internal/admin work:

``` text
DIDAR-OPERATIONS-CONSOLE.md
```

## 2. Do not restart existing work

If `CLEAN-MERCUR-BASELINE.md` or P01 work already exists:

1.  Preserve it.
2.  Re-read it against the new UI specifications.
3.  Record any inconsistency.
4.  Update the relevant `PXX-IMPLEMENTATION-MAP.md`.
5.  Fix only what is required for alignment.

Do not throw away valid implementation merely because these UI documents
were added later.

## 3. Audit Mercur frontend/admin before modification

Before substantial UI changes, create:

``` text
MERCUR-UI-BASELINE.md
```

Inspect:

``` text
storefront app/package
admin app/package
routing
layout
navigation
auth integration
Product list/detail
Cart
Checkout
Account area
tables
filters
forms
API clients
state/query libraries
i18n support
RTL support
responsive system
design tokens/components
```

Report each major surface/component as:

``` text
REUSE
EXTEND
REPLACE
NOT APPLICABLE
```

with a short reason.

## 4. Create page mapping before coding

For every page changed, record in the relevant implementation map:

``` text
Current Mercur route/component
Target Didar route/page
Business MD
Required API
Fields
Filters
Actions
Permissions
Current gap
Decision: reuse / extend / replace
```

## 5. Storefront semantic correction

Do not assume Mercur's standard ecommerce Cart/Checkout semantics match
Didar.

For standard B2B:

``` text
Product + Quantity
→ Request
→ Order Ops
→ Proforma
→ Retailer Acceptance
→ Fulfillment
```

Retailer does not select:

``` text
Supplier
Supplier split
exact stock
UID
```

If Mercur Cart can safely represent a Product Request Basket, adapt it.
Otherwise extend/replace only the minimum necessary layer.

## 6. Admin semantic correction

Do not preserve generic Mercur Admin navigation merely because it
exists.

The target is a role-driven Didar Operations Console.

Navigation/actions must derive from `B2B-RBAC.md` and
`DIDAR-OPERATIONS-CONSOLE.md`.

## 7. Filter rule

Do not create frontend filters first.

For every filter:

``` text
UI
→ API parameter
→ Backend query
→ DB field/index
→ Test
```

A filter is NOT DONE until this path works.

## 8. API contract rule

Never solve missing backend data with hard-coded frontend objects.

If the desired Didar screen needs data Mercur does not expose:

1.  Define the required API contract.
2.  Implement/extend backend.
3.  Test response.
4.  Connect frontend.
5.  Test the complete journey.

## 9. Multilingual requirement

Implement:

``` text
/fa
/en
/ar
/fr
```

and the full direction/font behavior in `UI-FOUNDATION.md`.

Do not postpone RTL architecture until after the pages are built.

## 10. Current phase Warehouse rule

Full `WAREHOUSE-INVENTORY.md` remains optional/deferred.

Frontend must not require Shelf/Bin/Cycle Count to complete current core
flows.

Use simplified:

``` text
current_location
current_custody
inventory_status
```

where sufficient.

## 11. Evidence

For each package result, add UI evidence:

``` text
routes implemented
screens/components changed
real APIs consumed
filters tested
roles tested
languages tested
responsive states tested
error states tested
```

Do not report a screen as PASSED from a screenshot alone.

## 12. Immediate next action

Before continuing the current package:

1.  Read the three new UI MDs.
2.  Create/update `MERCUR-UI-BASELINE.md`.
3.  Compare current work with the new UI contracts.
4.  Update the current `PXX-IMPLEMENTATION-MAP.md`.
5.  Continue implementation from the current state.

Do not start unrelated packages until the current package is aligned.
