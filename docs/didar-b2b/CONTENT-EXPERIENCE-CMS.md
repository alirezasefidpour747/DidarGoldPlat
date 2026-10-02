# CONTENT-EXPERIENCE-CMS.md --- Didar Maison Content & Experience CMS

**Status:** Draft v0.1 **Track:** CMS01 **Date:** 2026-10-02 **Depends
on:** UI-FOUNDATION, B2B-RBAC, AUTH-OTP-SECURITY, PRODUCT-CORE,
B2B-STOREFRONT-UX, REPORTING-FOUNDATION

## Objective

Create a Maison-oriented editorial/content layer above the B2B Product
Catalog. Homepage, Journal and landing pages are configurable from Didar
Operations Console without code deployment.

``` text
Maison Experience
→ CMS Pages / Blocks
→ Hero / Video / Editorial / Journal / VR / CTA
→ Curated Product Stories
→ B2B Catalog
```

CMS is presentation/content. It does not duplicate Product, Order,
Campaign or CRM truth.

## Operations Workspace

``` text
Content / Experience
├── Pages
├── Homepage
├── Page Builder
├── Journal
├── Articles
├── Media Library
├── Navigation
├── External Experiences
└── Publishing
```

## Page and Version

Page has stable identity/type and current Draft/Published version
references.

Page types:

``` text
HOME
LANDING
EDITORIAL
JOURNAL_INDEX
ARTICLE
CAMPAIGN_LANDING
CUSTOM
```

Version statuses:

``` text
DRAFT
IN_REVIEW
SCHEDULED
PUBLISHED
SUPERSEDED
ARCHIVED
```

Editing Published content creates/updates Draft; public users keep
seeing the current Published version until publish.

## Publishing

``` text
Save Draft
Preview
Submit for Review where enabled
Publish
Schedule Publish
Schedule Unpublish
Rollback
Archive
```

Publication history is retained and audited.

## Visual Page Builder

Block-based editor supports Add, Edit, Move/Reorder, Duplicate,
Hide/Show where supported, Delete from Draft, layout configuration and
responsive Preview.

Do not provide arbitrary executable JavaScript, uncontrolled CSS or
unrestricted raw HTML. Rich content is sanitized/allowlisted.

## Initial Block Registry

``` text
HERO_IMAGE
HERO_VIDEO
IMAGE
VIDEO
TEXT
RICH_TEXT
BUTTON
CTA_GROUP
IMAGE_TEXT
VIDEO_TEXT
PRODUCT
PRODUCT_GRID
PRODUCT_CAROUSEL
CATEGORY_GRID
CATEGORY_CAROUSEL
BANNER
JOURNAL_FEATURE
ARTICLE_GRID
ARTICLE_CAROUSEL
EXTERNAL_LINK
VR_EXPERIENCE
SPACER
DIVIDER
CUSTOM_EDITORIAL_SECTION
```

Every Block has validated type/version/content/layout/localized
text/media/Product/category references as applicable.

## Layout

Controlled properties:

``` text
full width / contained
columns
alignment
spacing
media aspect ratio
desktop/tablet/mobile behavior
background treatment
content order
```

## Product Blocks

Manual blocks reference explicit authoritative Product IDs.

Dynamic blocks use approved retailer-safe query criteria such as
taxonomy, karat, material, public weight/making-fee ranges, approved
attributes, sort and limit.

Never copy Supplier Offer/internal stock data into CMS.
Unpublished/inactive Products must disappear according to Product Core
visibility.

## Journal / Article

Journal may contain Stories, Articles, Collections, Designers,
Inspirations and Experiences.

Article supports localized title/subtitle/body, cover/hero media,
author, publish date, related Products/Articles and SEO. Article body
may use approved editorial Blocks including "Shop the Story" Product
Carousel.

## Media Library

Central types:

``` text
IMAGE
VIDEO
DOCUMENT where approved
EXTERNAL_EMBED where approved
```

Track title, alt text, caption, dimensions/duration/file size/mime,
creator/time and usage references. Show usages before destructive
removal.

## External Experience / VR

`VR_EXPERIENCE` is first-class:

``` text
title
description?
cover media
CTA label
validated destination URL
open behavior
tracking metadata?
```

Initial renderer may link to an external VR/gallery site. Future
internal VR can replace rendering without changing Page identity.

## CTA / Navigation

CTA destinations:

``` text
INTERNAL_PAGE
PRODUCT
CATEGORY
ARTICLE
COLLECTION where applicable
EXTERNAL_URL
VR_EXPERIENCE
```

Manage Header, Footer, Editorial and Journal navigation using stable
references.

## Localization

Architecture supports `fa/en/ar/fr`. Media/Product refs can be shared
while text is localized. Apply UI Foundation lang/dir/font/mirroring
rules. Do not invent missing editorial translations; use explicit
fallback policy.

## Preview

Draft Preview is authenticated/non-guessable and supports locale plus
375/768/1280/1920 responsive views.

## Homepage

Typical CMS-managed composition:

``` text
Hero Video
→ Editorial Story / CTA
→ Product Carousel
→ Maison Image
→ Journal Feature
→ VR Experience
→ Curated Product Carousel
→ Catalog Entry / Product Grid
```

## Campaign / Enablement Integration

Campaign may reference a CMS `CAMPAIGN_LANDING` Page. Campaign owns
audience/execution/conversion; CMS owns presentation/version/publishing.

Retailer Enablement may reuse approved visual primitives, but Retailers
do not receive unrestricted CMS authoring unless separately specified.

## SEO / Analytics

Localized SEO: title, description, canonical, Open Graph image,
index/noindex and approved structured metadata.

Track:

``` text
PAGE_VIEW
BLOCK_IMPRESSION
CTA_CLICK
PRODUCT_BLOCK_CLICK
ARTICLE_VIEW
VR_CTA_CLICK
```

Events reference Page Version and Block ID.

## Permissions

``` text
cms.page.read
cms.page.create
cms.page.update
cms.page.preview
cms.page.publish
cms.page.schedule
cms.page.rollback
cms.page.archive
cms.block.manage
cms.media.read
cms.media.upload
cms.media.update
cms.media.delete_safe
cms.journal.read
cms.article.create
cms.article.update
cms.article.publish
cms.navigation.manage
cms.external_experience.manage
cms.analytics.read
```

Separate Editor and Publisher authority.

## Security / Audit

No arbitrary JS; sanitize rich content; validate external URLs/embeds;
protect Draft Preview; strict public Published DTOs; scope Media
mutation; audit Page/Block/Media/Navigation/External URL and
Publish/Rollback/Schedule changes.

CMS never bypasses Product visibility/RBAC.

## API Boundary

Separate authoring/admin and public rendering contracts. Public returns
current authorized Published content only. Draft/Preview requires
authorization. Product Blocks resolve through Product Core safe APIs.

## Definition of Done

``` text
[ ] Page CRUD/versioning
[ ] Draft/Preview/Publish/Schedule/Unpublish/Rollback
[ ] Block registry + reorder/configure
[ ] responsive layout schema
[ ] manual/dynamic Product blocks
[ ] Category blocks
[ ] Journal/Article
[ ] Media Library
[ ] VR/External Experience
[ ] Navigation
[ ] 4-language architecture
[ ] secure Preview
[ ] SEO/analytics
[ ] RBAC/audit
[ ] no arbitrary JS
[ ] Product visibility respected
[ ] Database → Backend → API → Frontend → Test
```

## P01 Boundary

CMS01 does not expand P01 scope. P01 remains independently completable.
CMS01 consumes published Product/Category identities and retailer-safe
Product APIs after those contracts exist.
