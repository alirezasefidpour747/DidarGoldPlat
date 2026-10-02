# AI-SALES-INTELLIGENCE.md --- Didar AI Sales Intelligence

**Status:** Draft v0.1\
**Track:** AI01\
**Depends on:** CUSTOMER-CRM-CORE, COMMUNICATION-CHAT,
CAMPAIGN-MANAGEMENT, RETAILER-SALES-ENABLEMENT, PRODUCT-CORE,
ORDER-CORE, B2B-RBAC

**Additional cross-cutting dependencies:** `AUTH-OTP-SECURITY.md`,
`REPORTING-FOUNDATION.md`. AI is downstream and is never a hard
prerequisite for core transactions. \## 1. Objective

Use authorized Didar data to assist Didar teams, Retailers and Retailer
consumers with summaries, recommendations and analysis while keeping
authoritative business state in core systems.

AI is initially a Copilot, not the source of truth.

## 2. Three Personas

``` text
DIDAR COPILOT
RETAILER COPILOT
CONSUMER SHOPPING ASSISTANT
```

## 3. Didar Copilot

Capabilities may include:

``` text
Customer Summary
Conversation Summary
Next Best Action
Suggested Reply
Product Recommendation
Follow-up Prioritization
Campaign Analysis
Sales Funnel Analysis
Agent Performance Analysis
Management Insights
```

## 4. Retailer Copilot

Capabilities:

``` text
what to present
what to add to My Products
what consumers are responding to
demand signals
Campaign suggestions
Products to consider requesting from Didar
```

Recommendations are evidence-backed suggestions, not guarantees of
sales.

## 5. Consumer Shopping Assistant

Within the originating Retailer's permitted context:

``` text
understand stated need
learn explicit preferences
recommend Products
compare Products
capture interest
return permitted signal/lead to Retailer
```

It must not route the consumer to another Retailer or expose Didar
internal/Supplier information.

## 6. AI Context Security

Mandatory flow:

``` text
Authenticated/Scoped User
→ RBAC / Resource Scope
→ Permitted Data Retrieval
→ AI Context
→ AI Response
```

Never:

``` text
AI → unrestricted database
```

Consumer public AI receives only the public Collection/Product context
and approved session signals.

## 7. Source of Truth

AI may read authorized:

``` text
CRM Activities
Chats
Visits
Product Presentations/Interests
Campaign responses
Orders/Proformas
purchase history
Retailer Enablement engagement
Product Catalog
```

Authoritative facts such as price, settlement, credit, stock, delivery
and Order state must come from core APIs.

## 8. Explainability / Evidence

Where practical, AI recommendations should retain machine-readable
references to the source records/signals used.

Do not present inference as an authoritative transaction fact.

## 9. Suggested Reply

AI may draft responses. Human user can:

``` text
Edit
Send
Discard
```

Initial policy: no autonomous commercial commitment.

## 10. Next Best Action

Examples:

``` text
follow up today
schedule visit
present Product
ask missing qualification question
add Products to Campaign/Collection
```

The human decides whether to act.

## 11. Product Recommendation

Recommendations can use explicit preferences, prior presentations,
engagement and authorized purchase history.

Do not infer sensitive personal attributes. Do not fabricate Product
availability.

## 12. Agent Performance / Management Intelligence

AI may analyze operational metrics such as assigned Retailers, contacts,
visits, presentations, follow-up timeliness, Orders and conversion.

Use factual metrics and distinguish measured data from interpretation.

## 13. Campaign Intelligence

AI may suggest segments/Product sets and explain performance. Campaign
activation remains human-controlled unless later explicitly authorized.

## 14. Retailer Demand Intelligence

Combine permitted consumer signals at Retailer level to suggest Products
for My Products or future B2B request.

Consumer interest is not guaranteed demand.

## 15. AI Actions

Any AI-triggered write/action uses explicit tool permissions and normal
domain APIs.

High-impact actions such as:

``` text
commercial commitment
credit change
settlement change
Order confirmation/cancellation
Campaign activation
bulk customer messaging
```

require explicit authorization/human control according to policy.

## 16. AI Memory Boundary

Do not create a competing hidden customer truth store. Durable CRM facts
are written through CRM/domain APIs after explicit user action or
approved extraction workflow.

## 17. Audit

Audit AI request actor/context, capability used, source references where
appropriate, generated draft/recommendation, accepted/rejected action
and any resulting domain mutation.

## 18. Evaluation

Evaluate:

``` text
groundedness
scope leakage
recommendation relevance
commercial hallucination
unsafe action attempts
multilingual behavior
agent acceptance/usefulness
conversion uplift only through controlled analysis
```

## 19. Definition of Done

``` text
[ ] role-aware context retrieval
[ ] Didar Copilot
[ ] Retailer Copilot
[ ] Consumer Assistant boundary
[ ] source-grounded summaries
[ ] suggested reply with human review
[ ] next-best-action
[ ] Product recommendation
[ ] no unauthorized cross-Retailer leakage
[ ] authoritative facts from core APIs
[ ] audit/evaluation
[ ] Database/API/context → AI → controlled action/test path passes
```
