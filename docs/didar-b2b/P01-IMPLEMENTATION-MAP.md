# P01-IMPLEMENTATION-MAP.md

**Status: APPROVED --- IMPLEMENTATION AUTHORIZED.** Latest owner
decisions and taxonomy correction incorporated through 2026-10-01. **P01
implementation:** authorized. Implementation evidence belongs in
`P01-RESULT.md`; this map remains the governing P01 contract.
**Baseline:** owner-confirmed successful clean local runtime; source
inspected at Mercur `296b5968eac620d3cb689ae130a6a2aa382c9941`
(2.3.6-canary.6 / Medusa 2.21.0). **Authority:** PRODUCT-CORE current
file version 2 (document v0.3), REPORTING-FOUNDATION current file
version 3 (v0.4), supplied UI documents v0.1, and Product-related
boundaries in B2B-RBAC v0.4.

## 1. Scope and verified identity mapping

`Main Category → Product Category → Subcategory → Medusa Product → Native Variant → Mercur Supplier Offers`

-   Main Category, Product Category and Subcategory are three business
    levels implemented through the native recursive ProductCategory
    hierarchy using parent_category_id. A Product belongs to one
    selected active leaf Subcategory in P01; validate the complete
    active ancestry.
-   Medusa Product is the authoritative common identity: title/name,
    handle/slug, description, material, images and type. Didar Product
    ID is that same native Product ID.
-   Create one native Variant per initial Product. Mercur creation
    supports the default option/variant path; Offers require variant_id.
    Variant SKU carries the common product code where compatible with
    native uniqueness.
-   Supplier is a native Mercur Seller, referenced through a SUPPLIER
    organization context. Supplier Offer is a native Mercur Offer tied
    to that Seller, Product and Variant.
-   Linked extension records carry missing Didar fields/revisions; they
    do not create another Product/SKU hierarchy, variant engine or
    supplier-offer identity.
-   Native Product weight must not become supplier-label physical weight
    or a proxy for internal supplier ranges. Store supplier weight/fee
    on Offer extensions; public indicative presentation is separately
    curated.

P01 includes both real journeys:

1.  Retailer API → category/subcategory → Product list/search/filters →
    Product detail.
2.  Supplier Product/Offer draft → submit → Product Ops queue/detail →
    approve/reject/request changes → authorized publish → retailer
    discovery.

Excluded: request basket persistence/submission, Order, Proforma,
Settlement, Invoice, physical UID, Packaging, Dispatch, full WMS and
B2C. No fake Order API or success reference. Full configurable RBAC
administration is also excluded; minimum enforceable Product
roles/membership are mandatory.

## 2. Business-to-full-stack mapping

T IDs refer to section 9. All endpoints below are **planned**, not
implemented.

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Didar Business Requirement      Native Mercur Capability  Reuse / Extend / New    Database                          Backend                  API                                             Retailer Storefront                            Product Operations UI                   Tests
  ------------------------------- ------------------------- ----------------------- --------------------------------- ------------------------ ----------------------------------------------- ---------------------------------------------- --------------------------------------- ---------------------
  Main Category → Product         Recursive ProductCategory REUSE + EXTEND          Native category IDs/links;        Enforce three business   B2B taxonomy tree/list + authorized admin       Three-level navigation, filters and breadcrumb Product Ops Categories tree:            T01,T03,T05,T07,T10
  Category → Subcategory          parent tree, rank,        governance/validation   indexed leaf + ancestry           levels for initial seed, taxonomy mutations                                                                             create/edit/rank/activate/deactivate;   
                                  active/internal flags;                            projection in catalog profile     active ancestry and one                                                                                                 protected deletion                      
                                  category media                                                                      selected leaf;                                                                                                                                                  
                                                                                                                      controlled taxonomy CRUD                                                                                                                                        

  Common Product/SKU identity     Product and native        REUSE + linked EXTEND   Native Product/Variant; unique    Native create/update     Supplier draft, Ops detail, safe retailer       Name/code/images/descriptions/karat/material   Native form/media/diff primitives with  T01,T02,T05
                                  Variant/default-option                            profile.product_id/product_code   primitives plus Didar    detail                                                                                         gold fields                             
                                  workflow                                                                            validation                                                                                                                                                      

  N Supplier Offers               Native Offer              REUSE + EXTEND          Native Offer + one Offer profile  Didar creation adapter;  Scoped Supplier and internal Offer APIs         No offers/supplier IDs/counts returned         Supplier weights/fee/availability       T02,T04,T05
                                  model/service and                                 and versioned term revisions      no ecommerce price/stock                                                                                                comparison and own-entry forms          
                                  seller/product/variant                                                              prerequisite                                                                                                                                                    
                                  links                                                                                                                                                                                                                                               

  Publication review              Native Product review and EXTEND                  Submission/version/state +        Approve separately from  Submit/approve/reject/request-changes/publish   Only current published profile/native Product; Review queue, detail, reason dialog,    T05,T06,T07
                                  ProductChange                                     references to native changes      publish; real state                                                      no drafts                                      outcome/history                         
                                  actions/workflows                                                                   checks and revision                                                                                                                                             
                                                                                                                      matching                                                                                                                                                        

  Safe catalog projection         Native catalog query      EXTEND; replace B2C     Curated public fields separate    Explicit allowlisted     /store/b2b/catalog/\*                           Real list/detail, no buybox or stock promise   Full supplier detail only when          T04,T08
                                  graph and                 fetch composition       from Offer data                   DTO; deny legacy                                                                                                        permitted                               
                                  images/attributes                                                                   discovery bypass                                                                                                                                                

  Real filters/search/sort        Native                    EXTEND                  Profile indexes and structured    DB                       Strict query parameters/facets                  URL-addressable filters and actual total       Scope-aware queue/internal Offer        T03,T08
                                  category/type/attribute                           approved attribute relationships  predicates/count/order                                                                                                  filters                                 
                                  data and query validators                                                           before pagination                                                                                                                                               

  Supplier organization scope     Member/SellerMember and   REUSE + minimum EXTEND  Organization/membership/role      Derive supplier from     Vendor adapters; guard native alternate         No supplier selector                           Own supplier workspace; authorized      T04,T07
                                  native seller-context                             links; Seller association         authenticated            mutations                                                                                      Didar cross-supplier review             
                                  checks                                                                              membership; reject                                                                                                                                              
                                                                                                                      forged ownership                                                                                                                                                

  Product Ops / retailer          User/customer/member auth EXTEND                  Product role grants and active    Fail-closed permissions; Context + authenticated scoped endpoints        Allowed catalog only; 401/403 states           Role menu plus backend action           T04,T07,T10
  permissions                     and resolver extension                            membership                        no grant-all fallback                                                                                                   permission                              
                                  point                                                                               for Didar                                                                                                                                                       

  Actor/audit/status history      Native                    REUSE + structured      Append-oriented event records,    Write actor and history  Scoped timeline/query/export endpoints          No internal audit/notes                        Review timeline, authorized report      T06,T07,T08
                                  ProductChange/Action,     EXTEND                  user/org/owner/state/version refs with each completed                                                                                                     drill-down/export                       
                                  timestamps                                                                          command                                                                                                                                                         

  Reporting readiness             Native stable IDs/links   EXTEND                  Product/Offer grain, structured   Count distinct products; Authorized Product/Offer reports                Public catalog facets only                     Product reports using real persisted    T08
                                  and query services                                measures and indexes              explicit filters and                                                                                                    data                                    
                                                                                                                      history                                                                                                                                                         

  Four languages/directions       Next routing; dashboard   EXTEND; replace         Stable codes; language only in    No permission/scope      Same audience DTOs in all languages             /fa,/en,/ar,/fr + fonts/RTL                    Localized Ops and Supplier hosts        T10
                                  i18next/fa/ar/en/fr;      country-as-language     presentation                      change on language                                                                                                                                              
                                  direction hooks           logic                                                     switch                                                                                                                                                          

  Real                            Layouts, query tools,     REUSE + EXTEND          Persisted records independent of  Typed errors; no caught  401/403/409/422 + actual transport failures     Loading/empty/error and direct refresh         Validation/conflict/retry and usable    T09,T10
  errors/refresh/responsiveness   forms, tables, image                              browser                           error→empty success                                                                                                     mobile actions                          
                                  primitives                                                                                                                                                                                                                                          
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## 3. Native reuse evidence and required adaptations

### Product and review

Relevant source: -
`packages/core/src/workflows/product/workflows/create-products.ts`:
native Product/Variant creation, default option path, audit. -
`workflows/product/workflows/confirm-products.ts`: PROPOSED →
PUBLISHED. - `workflows/product/workflows/reject-product.ts`: PROPOSED →
REJECTED. - `workflows/product/workflows/request-product-change.ts`:
records CHANGE_REQUESTED without changing native Product status. -
`workflows/product-edit/workflows/stage-product-change.ts`,
`auto-confirm-product-change.ts`: staged edits; auto-confirm unless
PRODUCT_REQUEST is enabled. - `api/vendor/products/helpers.ts`: native
creator ownership uses sellerId in PRODUCT_ADD history.

Use an application workflow adapter with the native workflows/steps.
Enable PRODUCT_REQUEST and forbid automatic Supplier publication or
status edits through alternate routes. Preserve the native
seller-ownership convention where required, but record actual
actor_user_id and actor_organization_id separately; never report
sellerId as if it were a person.

### Offer

Relevant source: - `modules/offer/models/offer.ts`: stable
seller/product/variant identity, native SKU uniqueness/indexes. -
`workflows/offer/workflows/create-offers.ts` and
`api/vendor/offers/validators.ts`: ecommerce workflow requires inventory
and prices. - `workflows/offer/steps/create-offers.ts`: native service
creation with compensating deletion.

Use the native Offer service/creation step through a Didar workflow that
validates Seller, Product and Variant and persists linked commercial
terms. Do not invoke the ecommerce create-offers workflow merely to
obtain an Offer ID. Do not invent a price, quantity, stock location, UID
or cash settlement unit.

Native shipping_profile_id remains a valid configured native default
shipping-profile reference, not a delivery promise. Generate an internal
unique native Offer SKU when supplier_product_code is absent. Native
inventory management is false for these catalog-only Offer rows; this
does not declare physical availability. Do not create inventory
items/levels or pricing rows in P01. Verify price-less, inventory-less
Offer graph reads in T02; use the native service as the fallback to an
unavailable exported step, not a new Offer table.

### Application boundary

Place new business code under `apps/api/src/modules`, `links`,
`workflows`, `api`, `scripts` and host UI overrides. Keep native
core/dashboard package source and upstream patches unchanged. P01's
authentication adapters are limited to Product roles; no role-management
UI or unrelated permissions.

Do not use native Custom Fields for required migration-controlled
fields: the inspected loader generates/applies schema SQL at startup.
Use a small linked `didar-catalog` module with explicit checked-in
migrations.

## 4. Database and integrity plan

  -----------------------------------------------------------------------------------------------
  Record                  Fields/relationships to persist          Index/constraint plan
  ----------------------- ---------------------------------------- ------------------------------
  Native ProductCategory  stable code, localized presentation,     Reuse native IDs and recursive
                          parent_category_id, business level,      constraints; validate full
                          rank, active/internal, native            ancestry and active leaf on
                          image/media links                        each Product edit. Seed from
                                                                   `PRODUCT-TAXONOMY-SEED.md`;
                                                                   protect used-node deletion and
                                                                   controlled reparenting.

  Native Product/Variant  Common Product identity and minimal      Stable native IDs; exactly one
                          Variant. material and                    Variant for the initial slice;
                          descriptive/media/type fields remain     unique common product code in
                          native                                   linked profile.

  CatalogProfile (1:1     product_id, product_code, karat,         Unique product_id/code;
  Product)                technical_description, subcategory_id,   indexes on subcategory/state,
                          publication state, published revision,   public weight bounds, public
                          version, actor timestamps; separately    percentage-fee bounds and
                          named nullable public indicative         publication time. Leaf ID must
                          weight/fee fields                        match native category link.

  Public query fields on  Derived root_category_id,                GIN full-text search and
  CatalogProfile          public_sort_name,                        B-tree sort/filter indexes.
                          public_search_text/type reference from   These are a synchronized query
                          native public fields; no Supplier or     projection of the native
                          stock terms                              catalog, not a new catalog
                                                                   identity. Regenerate after
                                                                   relevant Product/category
                                                                   edits.

  OfferProfile (1:1       offer_id, active revision,               Unique offer_id;
  native Offer)           ACTIVE/INACTIVE status, version, actual  status/version index. Native
                          creator/updater and owner organization   Offer provides
                                                                   supplier/product/variant
                                                                   references.

  OfferTermRevision       offer_id, revision,                      Unique (offer_id,revision);
                          supplier_product_code, EXACT/RANGE and   structured numeric fields and
                          exact/min/max grams,                     applicable indexes. Reviewed
                          PERCENT/FIXED/RANGE_PERCENT fee          revisions are immutable; edits
                          values/bounds/basis,                     create a revision.
                          AVAILABLE/MADE_TO_ORDER/UNAVAILABLE,     
                          lead_time_days, actor/time               

  ProductSubmission       native product_id, supplier              Index (state,submitted_at,id),
                          organization, candidate/native           supplier/state,
                          ProductChange reference, Offer revision  product/version; unique active
                          references, review state, version,       submission constraint per
                          submit/review timestamps/actors/reasons  applicable product/supplier
                                                                   candidate.

  Candidate extension     Typed candidate profile/Offer term       Versioned candidate values and
  values                  values linked to the submission; do not  native staged ProductChange
                          overwrite published gold/presentation    references; publish activates
                          fields before authorization              a matching approved revision
                                                                   only.

  CatalogEvent            entity type/id,                          Append-oriented; unique
                          Product/Offer/Submission/native-change   (command_id,event sequence),
                          refs, event code, from/to state, actual  indexes on entity/time,
                          actor user/org/type, business-owner org, organization/time, actor/time.
                          role context, on_behalf_of, timestamp,   Critical
                          command ID, before/after and reason      relationships/status/measure
                                                                   fields are structured, not
                                                                   only JSON.

  Minimum identity        Organization type/reference, active      Unique membership/grants;
  context                 native-actor membership and normalized   indexes actor/org/status. No
                          role grants; SUPPLIER maps to Seller,    configurable RBAC builder or
                          retailer membership to customer actor,   user-management journey.
                          DIDAR to native user                     

  Command receipt         organization, actor/resource,            Unique scoped key; replay
                          idempotency key, payload hash,           identical command returns its
                          command/version/outcome reference        recorded outcome; conflicting
                                                                   payload returns 409.
  -----------------------------------------------------------------------------------------------

Weights use grams; decimal business values use PostgreSQL numeric, with
decimal-string JSON values to avoid binary-float loss. Validate
nonnegative fees, valid EXACT/RANGE fields, lower ≤ upper, positive
weight where supplied and integral nonnegative lead time. Do not invent
a maximum percentage or settlement currency.

Public indicative terms are manually curated/approved by Product Ops,
nullable and explicitly labeled indicative. They are not automatically
min/max of Supplier Offers, do not expose supplier cost and are never
accepted commercial snapshots. Missing public ranges do not remove a
published product from the unfiltered catalog.

Keep one source of truth for common Product fields. The profile's
search/sort fields are derived and updated by catalog workflows. Queries
use these indexed fields, hydrate native Product/category/media through
registered links/query services, and fail closed on stale publication or
inactive native ancestry. Category mutation recomputes affected
projections; never silently serve an outdated approved range/name. No
writes into native tables outside native services/steps.

Cross-module workflows use resource locking, version guards, idempotent
steps and compensation. Do not claim automatic atomicity across
independent Medusa modules. Publication is activated last; failed
native/profile/audit steps must not produce a visible partially
published catalog item. Fault-injection and recovery are required in
T06.

### Review/state mapping

  -----------------------------------------------------------------------------------
  Action                 Didar state/result   Native              Gate
                                              behavior/reuse      
  ---------------------- -------------------- ------------------- -------------------
  Save initial draft     DRAFT                Native Product      Supplier own scope;
                                              draft + one         valid fields
                                              Variant; candidate  
                                              Offer/profile terms 

  Submit                 SUBMITTED with       Native Product      Supplier submit
                         immutable candidate  proposed for first  permission;
                         version              publication; keep   candidate complete
                                              staged changes for  
                                              published Product   
                                              edits               

  Request Changes        CHANGES_REQUESTED    Native              Didar Product Ops;
                                              change-request      expected submission
                                              workflow/audit;     version
                                              native Product may  
                                              remain proposed     

  Correct and resubmit   New candidate        Native draft/staged Own Supplier;
                         revision → SUBMITTED edits; previous     editable state only
                                              candidate/history   
                                              retained            

  Reject                 REJECTED             Native rejection    Review permission;
                                              for initial         current version;
                                              proposed Product;   visible reason
                                              reject staged       
                                              change for already  
                                              published Product   

  Approve                APPROVED, still not  Record approved     product.approve
                         publicly visible for candidate; do not   
                         first publication    call native confirm 
                                              yet                 

  Publish/activate       PUBLISHED and        Native confirm for  product.publish;
                         current approved     first proposed      matching approved
                         terms                Product; confirmed  version
                                              native              
                                              ProductChange for   
                                              approved edits;     
                                              activate extension  
                                              revisions last      

  Unpublish/deactivate   INACTIVE for         Native              product.unpublish
                         discovery;           unpublish/status    
                         identities/history   primitive + profile 
                         retained             publication gate    
  -----------------------------------------------------------------------------------

Separate approval and publication is the conservative interpretation of
the existing distinct permissions and workflow steps. A later combined
"Approve and Publish" action would require both permissions and preserve
both events. Approval does not automatically confer publishing
authority.

Offer-only submissions do not change an already published Product's
native status. Activate the approved Offer revision without rewriting
another Supplier's Offer or the common Product. Pending edits preserve
the current published version until authorized activation. Supplier
changes to published common Product data remain staged.

## 5. API contracts and exposure boundary

Use three separate clients/query namespaces: retailer catalog, supplier
authoring and Didar operations. Endpoints below are proposed application
routes; native methods are reused behind them.

  --------------------------------------------------------------------------------------------------------------------------
  API                                                                       Audience and request    Required response/UI
                                                                                                    consumption
  ------------------------------------------------------------------------- ----------------------- ------------------------
  GET /store/b2b/context                                                    Authenticated           Actor/org and effective
                                                                            customer + active       Product permissions;
                                                                            retailer membership     catalog shell/login
                                                                                                    context

  GET /store/b2b/catalog/categories                                         catalog.read_retailer   Active root/child IDs,
                                                                                                    names, handles, public
                                                                                                    images and rank;
                                                                                                    category navigation

  GET /store/b2b/catalog/products                                           Allowlisted filters     products\[\], count,
                                                                            below, optional exact   offset, limit; each safe
                                                                            handle lookup; bounded  Product DTO; Product
                                                                            limit/offset            List and handle resolver

  GET /store/b2b/catalog/products/:id                                       Authorized retailer;    Safe Product detail DTO;
                                                                            published identity only Product Detail

  GET /store/b2b/catalog/facets                                             Same public filter      Actual
                                                                            scope, excluding hidden category/type/approved
                                                                            dimensions              attribute buckets and
                                                                                                    available public range
                                                                                                    bounds

  GET/POST /vendor/b2b/products; GET/PATCH /vendor/b2b/products/:id         Active Supplier Member, Own Product
                                                                            own authoring scope     draft/candidate and own
                                                                                                    Offers; supplier
                                                                                                    list/form/detail

  POST /vendor/b2b/products/:id/submit                                      expected_version +      Submission
                                                                            command key             ID/state/version, actual
                                                                                                    persisted result

  GET/POST /vendor/b2b/offers; GET/PATCH /vendor/b2b/offers/:id             Own Seller derived      Own Offer/revision only;
                                                                            server-side; typed term Offer entry/edit form
                                                                            revision                

  GET /admin/b2b/product-reviews; GET /admin/b2b/product-reviews/:id        product.review + DIDAR  Product, submitting
                                                                            context                 Supplier, candidate
                                                                                                    Offer terms, native
                                                                                                    change references,
                                                                                                    state, version and
                                                                                                    scoped history

  POST                                                                      Separate action         review{ id,state,version
  /admin/b2b/product-reviews/:id/{approve,reject,request-changes,publish}   permission,             }, product_id and
                                                                            expected_version,       publication result; real
                                                                            reason as applicable,   controls/feedback
                                                                            command key             

  GET /admin/b2b/products; GET /admin/b2b/products/:id; GET                 Authorized Didar        Common/native data +
  /admin/b2b/offers                                                         Product read            structured extensions,
                                                                                                    supplier comparisons and
                                                                                                    history

  POST /admin/b2b/products/:id/unpublish                                    product.unpublish,      Persisted INACTIVE state
                                                                            expected_version,       and version; discovery
                                                                            command key             invalidation

  GET /admin/b2b/catalog-events and /admin/b2b/product-reports              Product/audit/report    Structured
                                                                            permission              filters/drill-down and
                                                                                                    authorized CSV
                                                                                                    extraction; no final
                                                                                                    dashboard suite
  --------------------------------------------------------------------------------------------------------------------------

Supplier routes may reference an existing published Product's permitted
common identity when adding its own Offer; they must not reveal another
Supplier's draft/Offer/history. Didar entry on behalf of a Supplier,
where used, records DIDAR as actual actor organization and SUPPLIER as
business owner. Supplier Admin alone is not silently granted Product
Operator permissions; multiple roles can be explicitly assigned.

Safe retailer DTO: id (native Product ID), handle, name, product_code,
category{id,name,handle}, subcategory{id,name,handle}, description,
technical_description, images\[\], karat, material, approved public
type/attributes, nullable indicative_weight{min,max,unit:"g"}, nullable
indicative_making_fee{min,max,type:"PERCENT",indicative:true}, and
order_mode:"REQUEST_PRODUCT". No native variant blob, metadata
passthrough, Offer IDs/counts, supplier, stock, location, lead-time
procurement data or UID fields.

Backend uses strict schemas: reject arbitrary fields/expansions,
unsupported supplier/UID/stock filters and internal approval inputs.
Scoped cache keys and publication invalidation apply; start with no
shared authenticated cache until audience isolation is tested.

Guard the existing /store/products, /store/offers, /store/sellers and
related expansion/search routes so they cannot bypass the Didar DTO
boundary. Guard native admin/vendor Product/Offer mutation,
import/batch/status/review routes against bypassing candidate review and
actor audit. In this B2B-only app, unused commerce cart/checkout routes
must not permit retailer stock reservation; use a feature-unavailable
access guard, not an Order implementation. Do not expose them in the P01
shell.

401 = no valid session; 403 = role/scope denied; scoped 404 =
missing/not visible; 409 = stale version, conflicting command or invalid
transition; 422 = invalid payload/business fields. API failures never
become an empty-success response.

## 6. Real filter contracts

AND across dimensions; multiple values within one approved attribute use
OR. Reset offset when a filter changes. Validate parent/child
compatibility. All matching, count, order and pagination occur in the
backend/database before DTO hydration.

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------
  UI filter / URL  API parameter                        Backend query                          Structured DB field/index             Required test
  state                                                                                                                              
  ---------------- ------------------------------------ -------------------------------------- ------------------------------------- -----------------------------
  Main Category /  category_id                          Match derived native root reference,   CatalogProfile.root_category_id +     Root and child products;
  Product Category                                      active ancestry                        publication state index               combined filters

  Subcategory leaf subcategory_id                       Exact validated native leaf reference  CatalogProfile.subcategory_id/state   Wrong parent rejected; direct
                                                                                               B-tree                                refresh

  Weight range,    weight_min, weight_max               Inclusive overlap: public_max ≥        public indicative min/max numeric     Exact boundary, overlap,
  grams                                                 query_min and public_min ≤ query_max;  indexes                               missing terms, invalid
                                                        nulls do not match a requested range                                         interval

  Making fee,      fee_min, fee_max                     Same overlap on approved public        public indicative fee type/min/max    Boundary; no matching against
  percentage                                            percentage terms only                  numeric indexes                       hidden supplier fee

  Karat/material   karat, material                      Approved common Product values; public profile.karat/material projection     Combined with category;
                                                        query projection synchronized          indexes                               hidden attributes absent

  Product type     type_id                              Native approved ProductType reference  Public type reference index           Correct type and scope

  Other approved   attributes\[handle\]=value_ids       Filter only                            Native ProductAttributeValue          Unsupported/hidden handle
  attributes                                            active/is_filterable/public-approved   pivot/link indexes; verify physical   rejected; AND/OR behavior
                                                        native attribute/value relations       names during migration                

  Search           q                                    Normalize/search public name, public   Derived public_search_text GIN;       Persian/Latin/code/category
                                                        code and public category terms only    product_code unique B-tree            query; no supplier/UID search
                                                                                                                                     leakage

  Sort             sort=newest/name/weight/making_fee   Published time descending; public      Profile sort fields/indexes           \>1 page dataset;
                                                        canonical name; public lower                                                 deterministic pagination; no
                                                        indicative bound; native Product ID                                          subset/client sort
                                                        tie-breaker, null terms last                                                 

  Product Ops      state, supplier_id, category_id,     Authenticated DIDAR scope +            Submission(state,submitted_at,id),    Scoped combinations, real
  queue            submitted_from/to, actor_id, q       candidate/submission predicates        supplier/state, event actor/time and  totals, stale candidate
                                                                                               profile leaf indexes                  

  Internal/own     product_id, supplier_id (Didar       Own supplier enforced independently of Native Offer product/seller indexes + Supplier A cannot
  Offers           only), status, weight/fee bounds,    requested filters; Didar comparison    Offer profile/revision numeric/time   query/filter/export Supplier
                   created_from/to                      only by permission                     indexes                               B
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------

Range-overlap and name/newest sort behavior are technical
interpretations recorded here, not changes to supplier commercial rules.
Do not show filters for unsupported attributes or unapproved dimensions.
A published Product remains browseable/request-compatible even with no
physical stock or public indicative range.

## 7. Page-by-page UI mapping

All {lang} prefixes are fa/en/ar/fr. Ops/Supplier routes live in their
respective existing app hosts; they do not create more applications.

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Current route/component                                  Target page                                  Business/UI contract    API and fields                       Filters/actions/permission       Gap and decision
  -------------------------------------------------------- -------------------------------------------- ----------------------- ------------------------------------ -------------------------------- ---------------------------
  Storefront /\[locale\]/categories; CategoryCard/data     /{lang}/categories and /categories/{handle}  Product Core            Catalog categories;                  Category/Subcategory;            Country prefix and broad
  helper                                                                                                hierarchy + Retailer UX ID/name/handle/image/parent          catalog.read_retailer            category data; EXTEND

  Storefront                                               /{lang}/products (new list route); category  Product Core list + UI  Catalog products/facets; safe        Section 6 filters; detail        Cheapest-price/subset
  ProductListing/ProductsList/ProductCard/ProductSidebar   routes reuse it                              Foundation              DTO/count                            navigation                       filtering/empty-on-error;
                                                                                                                                                                                                      EXTEND layout, REPLACE data
                                                                                                                                                                                                      composition

  /\[locale\]/products/\[handle\];                         /{lang}/products/{handle}                    Product Core detail +   Filter safe list by handle or        Quantity input is local intent   Buybox/Offer fetch and
  ProductDetailsPage/Gallery/Details                                                                    Retailer UX             resolve handle via safe catalog      only; catalog.read_retailer      stock actions; REPLACE
                                                                                                                                endpoint, then safe :id detail                                        composition, REUSE gallery

  Admin host category extension                            /{lang}/ops/categories                       Shared Didar taxonomy   Taxonomy tree/usage APIs; stable     Create Main/Product/Subcategory; Native category UI is not
                                                                                                        governance              code, localized labels, parent,      edit/rank/activate/deactivate;   sufficient governance;
                                                                                                                                level, rank, active                  Product Ops/Super Admin only     EXTEND via host route

  Admin /products list/table                               /{lang}/ops/products and                     Product Ops queue       Admin Products/reviews; submitter,   Queue filters, row review;       Native list lacks complete
                                                           /ops/product-reviews                                                 product code, state, submitted time, product.read/review              Didar candidate/context;
                                                                                                                                version                                                               EXTEND via host route

  Admin /products/:id; ProductActiveRequest/EditSection    /{lang}/ops/product-reviews/{submissionId}   Product Ops             Review detail and action contracts;  Approve, Reject, Request         Native confirm
                                                                                                        review/detail/history   candidate images/fields/Offer        Changes, Publish with separate   auto-publishes;
                                                                                                                                revisions/history                    permission/state                 request-change state
                                                                                                                                                                                                      incomplete; EXTEND
                                                                                                                                                                                                      primitives with adapter
                                                                                                                                                                                                      controls

  Admin /offers and Offer detail                           /{lang}/ops/supplier-offers and /{id}        Product Core authorized Admin Offer query; seller/product    Internal filters; authorized     Commerce prices/inventory
                                                                                                        internal Offer          links,                               Product/Offer read               dominate; EXTEND scoped
                                                                                                                                weights/fee/availability/revisions                                    business sections

  Vendor /products/create and /products/:id                /{lang}/supplier/products/new and /{id}      Own supplier            Vendor draft/update/submit;          Save editable draft, submit,     Native form/status and
                                                                                                        entry/revision          common/candidate fields, media, own  correct/resubmit; Supplier       seller-as-actor assumption;
                                                                                                                                Offer refs                           Product Operator                 EXTEND

  Vendor /offers/create and /offers/:id                    /{lang}/supplier/offers/new and /{id}        Supplier Offer entry    Own Offer adapter; structured        Save/edit own permitted          Required currency price and
                                                                                                                                supplier terms                       revision, submit                 inventory; REPLACE business
                                                                                                                                                                                                      form, REUSE inputs/layout

  Admin generic MainLayout/nav + host SDK                  /{lang}/ops/\* Product workspace shell       Product role → queue →  Native user + Didar                  Product Review Queue, Products,  Generic ecommerce menu;
                                                                                                        detail → action → audit context/permissions                  Supplier Offers, Product Reports EXTEND via
                                                                                                                                                                     only                             \_navigation/host routes

  Vendor shell and storefront login/session primitives     Localized P01 shells/session states          UI Foundation + Product Actual context/auth APIs             Login/logout/organization        Auth alone lacks
                                                                                                        role boundaries                                              context, no fake role switch     organization permission;
                                                                                                                                                                                                      EXTEND
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

The detail resolver must be explicit: add an allowlisted handle
parameter to the safe catalog list/lookup contract; it must never fall
back to the raw native Product list. Legacy route aliases can redirect
to localized Product pages after authorization; native unsafe pages must
not remain a usable alternate entry.

Every changed page implements LOADING, SUCCESS, EMPTY, ERROR,
UNAUTHORIZED and FORBIDDEN as applicable. Submission forms also show
409/422 outcomes, pending state, field errors, double-submit protection
and unsaved-change warning. No decorative Product KPI or generic
"Product Exceptions" backend is added.

Future "Add to Request" UI is clearly labeled unavailable until Order
Core; local quantity input cannot submit, allocate, add a native cart
item or show success. Do not expose an enabled nonfunctional button.
Detail browsing and allowed Product operations are the real P01 actions.

Language changes update lang/dir/font, preserve resource and permitted
filters, and do not change organization context. Retailer layout must
stop retrieving the commerce cart at bootstrap. Use logical
CSS/directional icon handling, LTR-isolated product codes and explicit
grams/percent/date formatting. Translate P01 interface strings in all
four languages; do not invent translated supplier descriptions.
Canonical supplied product text may display as-is.

## 8. OWNER DECISION REQUIRED and known gaps

### D1 --- FIXED making-fee unit and calculation basis --- RESOLVED FOR P01

For P01, supported Supplier making-fee modes are:

``` text
PERCENT
RANGE_PERCENT
```

`FIXED` is future-only and not active in P01. Do not assume Rial, Toman,
gold grams or per-piece basis. Creating/activating FIXED terms in P01
must be rejected clearly.

### D2 --- Public Indicative Terms --- APPROVED

`Supplier Offer Terms ≠ Retailer Public Indicative Terms`.

Retailer-facing Product weight/making-fee ranges are separately curated
and approved by Didar Product Ops. They are not automatically calculated
from Supplier Offer min/max, do not reveal Supplier terms and do not
imply physical stock.

### D3 --- Taxonomy Governance --- APPROVED

The authoritative initial hierarchy is:

``` text
Main Category
→ Product Category
→ Subcategory
→ Product
```

Use `PRODUCT-TAXONOMY-SEED.md` as the deterministic initial seed. Didar
Product Ops / Super Admin may manage taxonomy; Suppliers may only select
active nodes.

Authorized Didar Product Ops may create/edit Product and Supplier Offer
on behalf of a selected Supplier while preserving actual actor, business
owner and `on_behalf_of=true`.

There are no remaining owner decisions blocking P01.

### Technical gaps already mapped, not owner design questions

-   Separate review state is necessary because native Request Changes
    leaves Product proposed.
-   Native approval/publish workflows need the adapter sequence above;
    permissions remain distinct.
-   Native Offer model can be reused without invoking its
    price/inventory-creating ecommerce workflow; verify the planned
    adapter against real DB/API.
-   Native global catalog read, generic mutations, permissions fallback
    and actor conventions need guards/projections.
-   Public range filters require curated public terms and indexed query
    projection; no silent Supplier Offer aggregation.
-   Language prefixes must be decoupled from commerce regions.
-   Native physical index names and exported workflow/step APIs require
    implementation-time verification. These are technical checks, not
    reasons to ask the owner to design the mapping.
-   The original execution index omits Order Core; scheduling that
    future package is outside this P01 map and does not block this
    preparation.

## 9. Tests and evidence required

No feature tests have run in this preparation. Planned T IDs:

  ----------------------------------------------------------------------------
  ID                                  Required evidence
  ----------------------------------- ----------------------------------------
  T01                                 Fresh native + extension migrations;
                                      inspected indexes/constraints;
                                      idempotent authoritative three-level
                                      taxonomy seed plus Product seed with ≥5
                                      Products, 3 Suppliers, multiple Offers
                                      and one Product with two different
                                      Supplier weight/fee conditions. Seed
                                      real native identities and explicit
                                      actor memberships, not fake inventory.

  T02                                 Native Product/one Variant/Offer
                                      persistence; price-less, inventory-less
                                      Offer creation and graph/query reads;
                                      adapter rollback on failure; no pricing,
                                      inventory or UID rows created by P01.

  T03                                 Every section 6 filter/sort chain from
                                      UI URL → API → real DB query/index →
                                      expected result/count; combined filters,
                                      nulls, invalid bounds, search and stable
                                      pagination with more than one page.

  T04                                 Supplier A/B and retailer role tests;
                                      forged resource/seller/org IDs; raw
                                      native store discovery, nested
                                      metadata/expansion/search/cache/export
                                      bypass; native admin/vendor
                                      direct-status/batch/import bypass.

  T05                                 Full supplier draft/submit → Ops
                                      queue/detail → request
                                      changes/correction → approval → publish
                                      → real retailer category/list/detail
                                      journey; rejection never publishes;
                                      published Product without stock still
                                      appears. Published edits preserve
                                      previous visible version until
                                      activation.

  T06                                 Concurrent approve/reject/publish and
                                      stale revisions; edit while review
                                      occurs; identical idempotent replay
                                      once, conflicting replay 409; failure
                                      injection during native/profile/audit
                                      update; recover to a coherent
                                      hidden/published state.

  T07                                 Actual user/org/on-behalf-of history
                                      persisted; reason/role/state events;
                                      unauthorized Product action fails with
                                      no mutation; immutable reviewed
                                      revision; deactivation retains
                                      IDs/history.

  T08                                 Scoped Product/Offer report extraction
                                      and drill-down; distinct Product counts
                                      across multiple Offers;
                                      history/date/actor filters; no supplier
                                      terms in retailer facets/results.

  T09                                 Backend and frontend builds plus
                                      dashboard host builds/typechecks; actual
                                      dev servers/API; direct refresh; restart
                                      preserves
                                      products/revisions/review/audit; backend
                                      down shows ERROR rather than
                                      empty/success. Next ignoreBuildErrors is
                                      not a substitute for typechecking.

  T10                                 Retailer list/detail/category, Supplier
                                      draft and Ops queue/detail across 4
                                      languages × 4 viewports
                                      (375,768,1280,1920);
                                      fonts/lang/dir/mirroring,
                                      forms/tables/drawers/pagination,
                                      keyboard/focus/contrast, mixed-direction
                                      identifiers and permission/error states.
  ----------------------------------------------------------------------------

Package result must name actual files/migrations/endpoints, each
screen's real API, test commands/results, role/filter/language evidence,
and pending work. No stubs or screenshots alone count as implementation.

## 10. Implementation sequence after review

1.  Freeze the approved contracts, source revision, three-level taxonomy
    seed and minimum Product authorization context. FIXED making fee
    remains disabled in P01.
2.  Add linked models/migrations and deterministic seed; reuse native
    Product/Variant/Seller/Offer identities.
3.  Deliver supplier draft → review → publication as the first small
    real vertical slice, including Supplier and Product Ops screens with
    real APIs.
4.  Connect retailer category/list/detail and server-side filters to the
    same persisted published catalog.
5.  Complete scope/bypass, audit/report queries, error states,
    localization and the 16-state matrix; run T01--T10.
6.  Produce P01-RESULT.md with evidence. Only then may the package
    become PASSED.

**Review gate:** owner review is complete and P01 implementation is
authorized. Do not begin P02 automatically; stop after `P01-RESULT.md`
for owner review.
