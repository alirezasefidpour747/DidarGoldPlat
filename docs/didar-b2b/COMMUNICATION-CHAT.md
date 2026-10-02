# COMMUNICATION-CHAT.md --- Didar Customer Communication & Chat

**Status:** Draft v0.1\
**Track:** CRM02\
**Depends on:** CUSTOMER-CRM-CORE, B2B-RBAC, AUTH-OTP-SECURITY,
NOTIFICATION

## 1. Objective

**Additional reference dependencies:** `PRODUCT-CORE.md`,
`ORDER-CORE.md`, `REPORTING-FOUNDATION.md`, `UI-FOUNDATION.md`,
`DIDAR-OPERATIONS-CONSOLE.md`, `B2B-STOREFRONT-UX.md`.

Persistent CRM-linked conversations between authorized Didar
users/Agents and Retailer users/contacts. Chat is part of Customer 360,
not a disconnected messenger.

## 2. Conversation

``` text
conversation_id
retailer_id
subject?
status
assigned_owner_id?
created_by
created_at
last_message_at
related_campaign_id?
related_order_id?
```

Statuses: `OPEN`, `PENDING`, `RESOLVED`, `CLOSED`.

## 3. Participants

`DIDAR_USER`, `AGENT`, `RETAILER_USER`; future `AI_ASSISTANT`.
Membership is explicit and auditable.

## 4. Messages

Persist sender actor/type, body, type, timestamps, reply reference and
attachments.

Types:

``` text
TEXT
PRODUCT_REFERENCE
ORDER_REFERENCE
CAMPAIGN_REFERENCE
SYSTEM
ATTACHMENT
```

## 5. CRM Context

Authorized users see permitted Conversation history in Customer 360.
Explicit outcomes may create CRM Activity, Task, Follow-up or Product
Interest. Do not automatically treat free text as authoritative business
state.

## 6. Assignment / Transfer

Support assign, transfer, authorized participant changes, resolve and
reopen. Transfer preserves history.

## 7. Product / Order Context

Product cards use retailer-safe Product DTOs. Order/Proforma/Shipment
references require normal resource authorization. Chat never bypasses
domain permissions.

## 8. Read State

Track participant last-read message/time and unread count.

## 9. Notifications

`CHAT_MESSAGE_RECEIVED`, `CHAT_ASSIGNED`, `CHAT_TRANSFERRED`,
`CHAT_REOPENED`.

## 10. AI Participation

Initial AI mode:

``` text
summarize conversation
suggest reply
suggest follow-up
suggest relevant Products
```

AI drafts require human review unless a later explicit policy enables
constrained auto-reply.

AI context is limited to data the requesting user is authorized to
access.

## 11. Commercial Safety

AI/Chat cannot fabricate Price, Credit, Settlement Terms, Availability,
Delivery Commitment or Discount. These come from authoritative APIs.

## 12. Permissions

``` text
chat.read
chat.read_assigned
chat.send
chat.assign
chat.transfer
chat.resolve
chat.attachment.upload
chat.audit.read
```

## 13. Reporting / Audit

Measure conversations, messages, first response, resolution time, unread
backlog, Agent/Retailer volume and Conversation→Order conversion. Audit
participant/assignment changes, sensitive attachment access, edits,
resolution and AI-assisted sends.

## 14. Definition of Done

``` text
[ ] persistent Conversations/Messages
[ ] scoped participants
[ ] read/unread
[ ] assignment/transfer
[ ] Product/Order references
[ ] CRM Timeline integration
[ ] notifications
[ ] AI draft boundary
[ ] RBAC/reporting/audit
[ ] Database → Backend → API → Frontend → Test
```
