# NOTIFICATION.md --- Didar B2B Notification & Event Delivery

**Status:** Draft v0.2 --- CRM/Chat/Campaign/Enablement aligned
2026-10-02\
**Date:** 2026-09-30\
**Scope:** In-app and SMS notification orchestration for Didar B2B
operational events\
**Base:** Clean Mercur fork\
**Depends on:** `ORDER-CORE.md`, `SUPPLY-ORDER.md`,
`PHYSICAL-INTAKE.md`, `AGENT-OPERATIONS.md`, `DISPATCH-DELIVERY.md`,
`SETTLEMENT-CORE.md`, `INVOICE-BILLING.md`, `AUTH-OTP-SECURITY.md`\
**Reporting dependency:** `REPORTING-FOUNDATION.md`\
**Implementation status:** Specification only; code and tests have not
been executed.

------------------------------------------------------------------------

## 1. Objective

Define a consistent notification layer across Didar B2B.

Notification must convert business events into user-facing messages
without becoming the source of truth for the underlying workflow.

Core pattern:

``` text
Business Event
    ↓
Audience Resolution
    ↓
Channel Selection
    ↓
Template Rendering
    ↓
Delivery Attempt
    ↓
Delivery Status
    ↓
Retry / Failure Handling
    ↓
Audit / Reporting
```

------------------------------------------------------------------------

## 2. Core Principle

Notification is **derived from business state**.

It must never become the authority for business state.

Examples:

``` text
Order confirmed
→ may generate notification

Notification failed
→ Order remains confirmed
```

``` text
Shipment delivered
→ may generate notification

SMS failed
→ Shipment does not revert to in-transit
```

------------------------------------------------------------------------

## 3. Initial Channels

Initial supported channels:

``` text
IN_APP
SMS
```

Optional/future channels:

``` text
EMAIL
PUSH
WHATSAPP
OTHER_APPROVED
```

Channel availability must be configurable.

------------------------------------------------------------------------

## 4. Notification Record

Conceptual fields:

``` text
notification_id

event_type
event_id?

recipient_user_id?
recipient_organization_id?

channel

template_code
template_version

rendered_subject?
rendered_body

status

created_at
queued_at?
sent_at?
delivered_at?
failed_at?

provider_reference?
failure_code?
retry_count

related_resource_type?
related_resource_id?
```

------------------------------------------------------------------------

## 5. Notification Status

Initial statuses:

``` text
CREATED
QUEUED
SENT
DELIVERED
FAILED
RETRY_PENDING
CANCELLED
```

`DELIVERED` is only used where the provider/channel can confirm
delivery.

------------------------------------------------------------------------

## 6. Event Source

Notifications should be triggered from stable backend business events.

Examples:

``` text
ORDER_SUBMITTED
PROFORMA_ISSUED
PROFORMA_ACCEPTED
SUPPLY_ORDER_CONFIRMED
SUPPLIER_READY_DATE_CHANGED
INTAKE_CONFIRMED
UID_LABEL_READY
PACKAGING_COMPLETED
SHIPMENT_CREATED
SHIPMENT_STATUS_CHANGED
SHIPMENT_DELIVERED
SETTLEMENT_DUE_SOON
SETTLEMENT_OVERDUE
BAG_READY_FOR_HANDOVER
BAG_RETURN_REQUIRED
SECURITY_ALERT
```

Frontend state changes alone must not trigger authoritative
notifications.

------------------------------------------------------------------------

## 7. Audience Resolution

Audience must be resolved from the business event and permissions.

Examples:

### Order

``` text
Retailer Order User
Retailer Admin
Didar Order Ops
```

### Supply Order

``` text
Supplier Admin
Supplier Product/Operations user
Didar Order Ops
```

### Shipment

``` text
Retailer
Assigned Agent/Courier where applicable
Didar Dispatch
```

### Settlement

``` text
Retailer Accounting
Supplier Accounting
Didar Finance
```

Notification delivery must respect organization scope.

------------------------------------------------------------------------

## 8. Recipient Rules

Recipient source priority:

``` text
Explicit event recipient
        ↓
Resource owner / responsible user
        ↓
Organization role audience
        ↓
Fallback operational audience
```

The system must avoid duplicate notifications to the same user for the
same event unless multiple channels are intentionally used.

------------------------------------------------------------------------

## 9. In-App Notification

In-app notification should support:

``` text
title
message
timestamp
read/unread
related resource link
priority
category
```

Example categories:

``` text
ORDER
PROFORMA
SUPPLY
INTAKE
SHIPMENT
SETTLEMENT
SECURITY
AGENT
```

------------------------------------------------------------------------

## 10. SMS Notification

SMS is intended for time-sensitive or action-required notifications.

Examples:

``` text
OTP
Proforma ready
Shipment tracking code
Delivery status
Settlement due
Overdue notice
Agent Bag handover
```

SMS content must avoid exposing unnecessary confidential information.

------------------------------------------------------------------------

## 11. OTP Notifications

OTP delivery is security-sensitive and governed by
`AUTH-OTP-SECURITY.md`.

Notification layer may deliver OTP messages, but must not:

``` text
store OTP plaintext in reports
show OTP in notification history
replay old OTP
send OTP to an unapproved mobile
```

OTP message delivery status may be tracked separately from OTP
verification status.

------------------------------------------------------------------------

## 12. Proforma Notifications

Initial events:

``` text
PROFORMA_ISSUED
PROFORMA_SUPERSEDED
PROFORMA_ACCEPTED
PROFORMA_DECLINED
```

Retailer-facing message should include:

``` text
Proforma number
Order reference
Current action required
Expiry only if an approved expiry policy exists
Link to Proforma
```

Do not include internal supplier/sourcing information.

------------------------------------------------------------------------

## 13. Order Notifications

Initial events:

``` text
ORDER_SUBMITTED
ORDER_IN_REVIEW
ORDER_CONFIRMED
ORDER_CANCELLED
ORDER_REPLACED
ORDER_EXCEPTION
```

Retailer-facing wording must use public business status, not internal
workflow codes.

------------------------------------------------------------------------

## 14. Supply Order Notifications

Supplier-facing events:

``` text
SUPPLY_ORDER_CREATED
SUPPLY_ORDER_CONFIRMATION_REQUIRED
SUPPLY_ORDER_CONFIRMED
READY_DATE_UPDATED
SUPPLY_ORDER_PARTIALLY_RECEIVED
SUPPLY_ORDER_COMPLETED
SUPPLY_ORDER_EXCEPTION
```

Didar-facing events:

``` text
SUPPLIER_CONFIRMATION_PENDING
SUPPLIER_READY_DATE_DELAY
EXPECTED_RECEIPT_DELAY
PARTIAL_RECEIPT
```

------------------------------------------------------------------------

## 15. Physical Intake Notifications

Potential events:

``` text
INTAKE_CREATED
INTAKE_RECEIVED
INTAKE_HOLD
INTAKE_REJECTED
INTAKE_CONFIRMED
INTAKE_DOCUMENT_MISSING
```

Supplier-facing notifications must remain scoped to that Supplier.

------------------------------------------------------------------------

## 16. Packaging Notifications

Internal operational events:

``` text
PACKAGING_JOB_ASSIGNED
PACKAGING_EXCEPTION
PACKAGING_COMPLETED
READY_FOR_DISPATCH
```

Packaging completion normally does not require SMS to Retailer unless a
future public communication policy explicitly enables it.

------------------------------------------------------------------------

## 17. Shipment / Tracking Notifications

Retailer-facing events:

``` text
SHIPMENT_CREATED
TRACKING_CODE_AVAILABLE
HANDED_TO_AGENT
HANDED_TO_CARRIER
IN_TRANSIT
OUT_FOR_DELIVERY
DELIVERED
DELIVERY_EXCEPTION
```

Shipment notification may include:

``` text
tracking_code
public_status
expected_delivery
link to tracking view
```

Do not expose:

``` text
OTP
private courier mobile
internal exception notes
security metadata
```

------------------------------------------------------------------------

## 18. Settlement Notifications

Settlement events:

``` text
SETTLEMENT_CREATED
INITIAL_SETTLEMENT_REQUIRED
SETTLEMENT_DUE_SOON
SETTLEMENT_DUE_TODAY
SETTLEMENT_OVERDUE
PARTIAL_SETTLEMENT_RECORDED
SETTLEMENT_COMPLETED
SETTLEMENT_DISPUTED
```

Retailer-facing messages should refer to:

``` text
Invoice / Order reference
Gold obligation or remaining gold-equivalent balance
Due date / window
Approved payment method
```

Rial amount should only be shown when valid under the current
settlement/payment-time rule.

------------------------------------------------------------------------

## 19. Agent Notifications

Agent events:

``` text
BAG_ASSIGNED
BAG_READY_FOR_HANDOVER
OTP_HANDOVER_SENT
BAG_RETURN_REQUIRED
BAG_EXCEPTION
RETAILER_VISIT_ASSIGNED
ORDER_CREATED_FOR_RETAILER
DIRECT_SALE_COMPLETED
```

Agent must receive notifications only for its own assignments/custody.

------------------------------------------------------------------------

## 20. Notification Priority

Initial priority:

``` text
LOW
NORMAL
HIGH
CRITICAL
```

Examples:

``` text
Order status update → NORMAL
Settlement due soon → HIGH
OTP → HIGH
Security alert → CRITICAL
```

Priority may affect channel choice and retry strategy.

------------------------------------------------------------------------

## 21. Template System

Templates use stable codes.

Example:

``` text
ORDER_SUBMITTED_RETAILER
PROFORMA_ISSUED_RETAILER
SHIPMENT_TRACKING_RETAILER
SETTLEMENT_DUE_RETAILER
BAG_HANDOVER_AGENT
```

Each template may have versions:

``` text
template_code
template_version
locale
channel
```

Historical notifications must retain the rendered content and template
version used.

------------------------------------------------------------------------

## 22. Localization

Notifications must support:

``` text
fa
en
ar
fr
```

according to the project's multilingual standard.

Template language should follow recipient preference or approved
organization default.

Stable event codes remain language-neutral.

------------------------------------------------------------------------

## 23. Message Variables

Templates may use approved variables such as:

``` text
recipient_name
organization_name
order_number
proforma_number
invoice_number
tracking_code
public_status
due_date
remaining_gold_balance_18k
```

Untrusted free text must be sanitized before rendering.

------------------------------------------------------------------------

## 24. Retry

Failed delivery may retry according to channel policy.

Conceptual config:

``` text
max_retry_count
retry_delay_seconds
retry_backoff_policy
```

Retries must be idempotent from the business perspective.

A retry must not create a second Order, Invoice, Settlement or Shipment
event.

------------------------------------------------------------------------

## 25. Deduplication

Each notification should have a deduplication key where appropriate.

Conceptual:

``` text
event_id
recipient
channel
template_code
```

Repeated processing of the same event must not flood the user.

------------------------------------------------------------------------

## 26. Notification Preferences

Future/optional recipient preferences may allow:

``` text
in_app_enabled
sms_enabled
email_enabled
```

Security OTP and mandatory legal/operational notices may override
optional preferences where policy requires.

------------------------------------------------------------------------

## 27. Quiet Hours

Quiet hours are not required in v0.1.

If introduced later, they must not delay:

``` text
OTP
critical security alerts
time-sensitive custody handover
```

without explicit policy.

------------------------------------------------------------------------

## 28. Notification and Business Transactions

Notification generation should not block the core transaction where
possible.

Example:

``` text
Order Confirmed
↓
Business transaction commits
↓
Notification event queued
```

Notification failure is recorded separately.

For security OTP, however, successful delivery may be operationally
required before verification can occur.

------------------------------------------------------------------------

## 29. Event Idempotency

Business event processing must support idempotency.

If the same:

``` text
SHIPMENT_CREATED
```

event is received twice, the system must not create duplicate
notifications unless a deliberate resend is requested.

------------------------------------------------------------------------

## 30. Manual Resend

Authorized users may request resend for certain notifications.

Examples:

``` text
Proforma SMS
Tracking SMS
Settlement reminder
```

Resend creates its own delivery attempt/audit event.

Manual resend of OTP must follow OTP-specific security policy rather
than generic notification resend.

------------------------------------------------------------------------

## 31. Notification History

Authorized users may view notification history tied to a resource.

Example:

``` text
Order
→ Notification History

Shipment
→ Notification History

Settlement
→ Notification History
```

Do not expose sensitive message content to users lacking permission.

------------------------------------------------------------------------

## 32. RBAC

Suggested permissions:

``` text
notification.read_own
notification.read_org
notification.send_manual
notification.resend

notification_template.read
notification_template.manage

notification_report.read
```

OTP send/verify permissions remain governed by `AUTH-OTP-SECURITY.md`.

------------------------------------------------------------------------

## 33. Frontend Minimum

Recipient:

``` text
Notification Center
Unread Count
Notification Detail
Open Related Resource
Mark Read
```

Didar operational/admin:

``` text
Notification History
Delivery Status
Failed Notifications
Manual Resend
Template Management
Notification Reports
```

------------------------------------------------------------------------

## 34. Reporting & Analytics Requirements

Required dimensions:

``` text
notification
event_type
channel
template_code
template_version
recipient_user
recipient_organization
related_resource
status
priority
date/time
provider
```

Measures:

``` text
notification_count
sent_count
delivered_count
failed_count
retry_count
delivery_latency
read_count
```

Minimum reports:

``` text
Notifications by Event
Notifications by Channel
Notifications by Organization
Failed SMS
Retry Rate
Delivery Rate
Delivery Latency
Unread In-App Notifications
Manual Resends
Template Usage
```

OTP reports never include OTP values.

------------------------------------------------------------------------

## 35. Audit Requirements

Audit:

``` text
Notification created
Notification sent
Notification failed
Retry scheduled
Notification delivered
Manual resend requested
Template created/changed
Recipient preference changed
```

Persist:

``` text
actor?
recipient
event
channel
timestamp
result
provider_reference?
reason?
```

------------------------------------------------------------------------

## 36. API Capability

Required backend capability:

``` text
Create notification from business event
Resolve audience
Render template
Queue/send notification
Retry failed notification
Read delivery status

Read own notifications
Mark read/unread
Read resource notification history

Manual resend
Manage templates
Query reporting
Read audit
```

------------------------------------------------------------------------

## 37. Definition of Done

`NOTIFICATION` is Done only when:

``` text
[ ] Notification is event-driven
[ ] Notification failure does not corrupt business state
[ ] IN_APP works
[ ] SMS works through an approved provider adapter
[ ] Recipient organization scope is enforced
[ ] Duplicate event delivery is idempotent
[ ] Retry works
[ ] Manual resend is auditable
[ ] OTP values are never exposed in history/reporting
[ ] Proforma notification works
[ ] Order status notification works
[ ] Shipment tracking notification works
[ ] Settlement due notification works
[ ] Agent operational notification works
[ ] Template version is retained
[ ] fa/en/ar/fr template structure is supported
[ ] Reporting works
[ ] Audit works
[ ] Database → Backend → API → Frontend → Test path passes
```

------------------------------------------------------------------------

## 38. Explicitly Out of Scope

``` text
Final SMS vendor selection
Marketing campaigns
Bulk promotional messaging
Push notification provider
WhatsApp integration
Email provider selection
Advanced communication preference center
AI-generated marketing copy
```

------------------------------------------------------------------------

## 39. Clean-Fork Rule

No notification implementation or messaging workaround from the previous
Didar project is automatically inherited.

Reuse follows:

``` text
Inspect
→ Compare
→ Explicitly Approve
→ Reimplement or Selectively Port
```

------------------------------------------------------------------------

## 40. Implementation Package

**P12 --- Notification Core**

Suggested first path:

``` text
Business Event
    ↓
Audience Resolution
    ↓
IN_APP Notification
    ↓
SMS Adapter
    ↓
Delivery Status
    ↓
Retry / Deduplication
    ↓
Notification Center
    ↓
Reporting / Audit
    ↓
Test
```

The package is complete only when real:

``` text
Database → Backend → API → Frontend → Test
```

behavior passes.

## CRM / Chat / Campaign Events

Additional events may include:

``` text
TASK_ASSIGNED
FOLLOW_UP_DUE
FOLLOW_UP_OVERDUE
VISIT_ASSIGNED
VISIT_REMINDER

CHAT_MESSAGE_RECEIVED
CHAT_ASSIGNED
CHAT_TRANSFERRED

CAMPAIGN_ASSIGNED
CAMPAIGN_STARTED
CAMPAIGN_ENDING

CONSUMER_INTEREST_RECEIVED
RETAILER_LEAD_CREATED

AI_ACTION_SUGGESTED
```

AI notifications must be rate-controlled and should not create
notification noise. Notification remains derived from authoritative
business/CRM events.

## Dependency Coverage

Notification consumes events from `CUSTOMER-CRM-CORE.md`,
`COMMUNICATION-CHAT.md`, `CAMPAIGN-MANAGEMENT.md` and
`RETAILER-SALES-ENABLEMENT.md`.

Notification delivery failure does not change authoritative
CRM/Chat/Campaign/Engagement state unless a specific synchronous
business rule explicitly says otherwise.
