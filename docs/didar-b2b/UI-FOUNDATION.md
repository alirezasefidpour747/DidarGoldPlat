# UI-FOUNDATION.md --- Didar B2B UI Foundation

**Status:** Draft v0.1 **Scope:** Shared UI contract for Retailer
Storefront, My Didar, Didar Operations Console, Supplier Portal and
Agent Workspace. **Rule:** Business MD → API Contract → UI → Test.

## 1. Authority

Existing Mercur UI is reusable implementation material, not the business
specification.

Priority:

``` text
Approved Business MD
→ Backend/API Contract
→ UI-FOUNDATION
→ Surface UX MD
→ Mercur component mapping
```

## 2. Full-stack rule

No page/filter/action is Done until:

``` text
Database → Backend → API → Frontend → Test
```

Mock data is temporary only. API failure must never render as fake
success/empty state.

## 3. Surfaces

``` text
Retailer Storefront + My Didar
Didar Operations Console
Supplier Portal
Agent Workspace
```

They may share code but have different permissions and information
exposure.

## 4. Multilingual --- mandatory

Routes: `/fa`, `/en`, `/ar`, `/fr`.

``` text
FA: RTL / Vazirmatn
AR: RTL / IBM Plex Sans Arabic
EN: LTR / Inter
FR: LTR / Inter
```

Language change must update `lang`, `dir`, font, layout, directional
icons, navigation, forms, tables, filters, drawers, pagination, dates
and mixed-direction fields.

## 5. Responsive

Test all major screens across 4 languages × mobile/tablet/desktop/wide
desktop. Critical actions must remain usable in every combination.

## 6. Reusable design system

Use common tokens/components for typography, spacing, breakpoints,
borders, states, forms, tables, cards, drawers, dialogs, badges and
icons. Reuse Mercur primitives only when compatible.

## 7. Required page states

Every data page supports:

``` text
LOADING
SUCCESS
EMPTY
ERROR
UNAUTHORIZED
FORBIDDEN
```

Use `409` for workflow conflict and `422` for validation/business-rule
errors where appropriate.

## 8. Forms

Client validation improves UX; backend remains authority. Support field
errors, business errors, submitting state, double-submit protection and
unsaved-change protection where useful.

## 9. Tables

Where applicable:

``` text
search
filter
sort
pagination
column visibility
row actions
authorized export
```

Operational filter state should be URL-addressable where practical.

## 10. Filters --- mandatory contract

Every filter maps:

``` text
UI Filter
→ URL/query state
→ API parameter
→ Backend query
→ Structured field/index
```

Never ship decorative filters. Never expose a business-hidden dimension
just because Mercur supports it.

## 11. Search

Define searchable fields explicitly. Organization scope applies to all
search results.

## 12. Status

Backend stores stable language-neutral codes; UI localizes labels. Never
persist translated status text as business state.

## 13. Actions

Every action defines:

``` text
permission
allowed workflow state
API mutation
confirmation/reason if required
success state
failure state
audit expectation
```

Backend remains authoritative.

## 14. Information security

Do not expose to Retailer unless a Business MD explicitly allows it:

``` text
Supplier selection/split
global stock counts
global UID list
private Agent/Courier mobile
OTP secrets
internal security notes
internal procurement terms
```

## 15. Accessibility

Keyboard navigation, visible focus, semantic labels, usable contrast,
labeled forms and no color-only status meaning.

## 16. Dates/numbers/units

Persist canonical values; localize presentation only. Gold weight,
percentage, currency and dates must show clear context/unit.

## 17. Files

Uploads show type/size validation, progress and failure. Access is
organization-scoped; replacement preserves audit.

## 18. API-first UI rule

Before adding a UI field/action requiring new data, record:

``` text
UI requirement
required API
request/response schema
permission
workflow-state rule
```

If API is missing, UI is not complete.

## 19. Definition of Done

``` text
[ ] Real API connected
[ ] Loading/empty/error states work
[ ] Unauthorized/forbidden work
[ ] Validation works
[ ] Permission actions work
[ ] fa/en/ar/fr structure works
[ ] RTL/LTR works
[ ] Responsive matrix works
[ ] Filters/search use real API
[ ] Direct URL refresh works
[ ] Backend failure is visible
[ ] Relevant E2E test passes
```

## 20. Clean-fork rule

Do not import old Didar UI code/workarounds without explicit approval.

## 21. Anti-pattern

Never:

``` text
Mercur UI → infer Didar business behavior
```

Always:

``` text
Business MD → API → UX contract → Mercur mapping → implementation
```

## Dependency Coverage

All new CRM, Chat, Campaign, Retailer Enablement and AI user interfaces
follow this UI Foundation, including four-language behavior, RTL/LTR,
real API states, accessibility, responsive behavior and permission-aware
actions.

## CMS / Visual Builder Contract

`CONTENT-EXPERIENCE-CMS.md` follows this foundation. Drag/reorder/layout
controls must preserve responsive constraints, RTL/LTR, four-language
behavior, accessibility, validated Block schemas, safe media rendering
and clear Draft/Preview/Published state.

Do not expose arbitrary executable JavaScript or uncontrolled CSS/HTML
as a substitute for structured Blocks.
