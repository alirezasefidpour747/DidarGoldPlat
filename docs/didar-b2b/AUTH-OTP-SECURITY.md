# AUTH-OTP-SECURITY.md --- Didar B2B Authentication, OTP & Security Core

**Status:** Draft v0.2 --- Chat/Public Share/AI security aligned
2026-10-02\
**Date:** 2026-09-30\
**Scope:** Authentication, session security, organization scope, RBAC
enforcement, OTP flows and security audit for Didar B2B\
**Base:** Clean Mercur fork\
**Depends on:** `B2B-RBAC.md`, `ORDER-CORE.md`, `AGENT-OPERATIONS.md`,
`DISPATCH-DELIVERY.md`, `INVOICE-BILLING.md`\
**Reporting dependency:** `REPORTING-FOUNDATION.md`\
**Implementation status:** Specification only; code and tests have not
been executed.

------------------------------------------------------------------------

## 1. Objective

Define the shared security contract for Didar B2B.

This document governs:

``` text
User Authentication
Session / Token Security
Organization Membership
Role / Permission Enforcement
Cross-Organization Isolation
OTP Creation / Verification
Custody Handover OTP
Security-Sensitive Actions
Replay Protection
Rate Limiting
Account Disable / Role Revocation
Security Audit
```

Security must be enforced by the backend/API.

Frontend visibility is not authorization.

------------------------------------------------------------------------

## 2. Core Principles

1.  Every protected request requires authenticated identity.
2.  Organization scope comes from authenticated membership, not
    arbitrary client input.
3.  Role and Permission checks are enforced server-side.
4.  Workflow-state rules are enforced in addition to RBAC.
5.  OTP is a temporary proof for a specific action, not a reusable
    password.
6.  OTP secret values must never appear in logs, reports or frontend
    history.
7.  A successful OTP may only authorize the exact action/resource it was
    created for.
8.  Security-sensitive actions are auditable.
9.  Disabled users and revoked memberships lose access immediately or at
    the next enforceable token/session boundary.
10. No module may bypass security because its UI is internal.

------------------------------------------------------------------------

## 3. User Identity

Conceptual user record:

``` text
user_id
mobile?
email?
name
status
created_at
updated_at
last_login_at?
disabled_at?
```

Initial status values:

``` text
ACTIVE
DISABLED
LOCKED
PENDING
```

Exact authentication identifiers may be adapted to Mercur/Medusa.

------------------------------------------------------------------------

## 4. Organization Membership

Authorization is organization-scoped.

Conceptual membership:

``` text
membership_id
user_id
organization_id
organization_type
roles[]
status
created_at
created_by
revoked_at?
revoked_by?
```

Organization types:

``` text
DIDAR
SUPPLIER
RETAILER
```

A valid session does not automatically authorize all organizations
associated with the same person.

------------------------------------------------------------------------

## 5. Authentication

The exact credential mechanism may use the clean Mercur/Medusa
authentication foundation.

Minimum behavior:

``` text
User submits approved authentication factor
        ↓
Identity verified
        ↓
Active user checked
        ↓
Membership context resolved
        ↓
Session / token issued
```

No application module should implement a separate ad-hoc authentication
system.

------------------------------------------------------------------------

## 6. Session / Token

Session/token must preserve enough trusted context to resolve:

``` text
user_id
active organization context
membership_id
session_id
issued_at
expires_at
```

Role and Permission values may be loaded dynamically rather than
permanently embedded when rapid revocation is required.

Client-provided role, organization_id or permission must never be
trusted without backend verification.

------------------------------------------------------------------------

## 7. Organization Context

When a user can access more than one organization context, switching
organization must be explicit.

Backend validates every requested context.

Cross-organization access through manipulated IDs must fail.

------------------------------------------------------------------------

## 8. RBAC Enforcement

Authorization sequence:

``` text
Authentication
      ↓
Active User
      ↓
Active Membership
      ↓
Organization Scope
      ↓
Role
      ↓
Permission
      ↓
Resource Ownership / Scope
      ↓
Workflow State
      ↓
Action
```

This applies to read, create, update, cancel, approve, accept, export,
report, download, upload and OTP actions.

------------------------------------------------------------------------

## 9. Sensitive Actions

Examples:

``` text
Role assignment
Credit permission change
Settlement Policy change
Proforma acceptance
Direct-sale invoice issue
UID allocation
UID label reprint
Supply Order confirmation
Intake confirmation
Bag custody transfer
Shipment custody transfer
Invoice cancellation
Settlement reversal
Controlled inventory adjustment
```

These actions require explicit permissions and audit.

Some may later require step-up authentication.

------------------------------------------------------------------------

## 10. OTP Core

OTP is a short-lived verification mechanism bound to a specific action.

Conceptual OTP challenge:

``` text
otp_challenge_id
purpose
resource_type
resource_id
receiver_identity
receiver_mobile
status
created_at
expires_at
verified_at?
attempt_count
max_attempts
```

OTP secret itself must not be stored in plaintext in
reportable/application logs.

------------------------------------------------------------------------

## 11. OTP Purpose Codes

Initial purpose codes:

``` text
AGENT_BAG_HANDOVER
SHIPMENT_HANDOVER
BAG_RETURN_HANDOVER
OTHER_APPROVED_CUSTODY_TRANSFER
```

Potential future purpose:

``` text
ASSISTED_PROFORMA_ACCEPTANCE
```

`ASSISTED_PROFORMA_ACCEPTANCE` is not enabled by default merely because
OTP infrastructure exists. It requires separate business/legal approval.

------------------------------------------------------------------------

## 12. OTP Generation

OTP generation must produce:

``` text
cryptographically appropriate random value
single action binding
short expiry
limited attempts
single successful use
```

The same OTP must not be valid for another Shipment, Bag, Retailer, user
or action.

------------------------------------------------------------------------

## 13. OTP Delivery

OTP is sent only to the verified/approved mobile for the intended
receiver.

Conceptual event:

``` text
otp_challenge_id
mobile_destination_masked
provider_reference?
sent_at
delivery_status
```

Full mobile may be visible only to authorized operational users where
needed.

------------------------------------------------------------------------

## 14. OTP Verification

Verification checks:

``` text
challenge exists
challenge status = ACTIVE
current time <= expires_at
attempt_count < max_attempts
submitted OTP matches
resource/action matches challenge
receiver matches intended recipient
challenge not previously consumed
```

Success records `VERIFIED` and `verified_at`; failure increments
`attempt_count`.

------------------------------------------------------------------------

## 15. OTP Replay Protection

After successful verification, the challenge becomes consumed/verified
and cannot be reused.

A verified OTP for Shipment A cannot authorize Shipment B even for the
same Agent/Courier.

------------------------------------------------------------------------

## 16. OTP Expiry

Configurable policy:

``` text
otp_expiry_seconds
otp_max_attempts
otp_resend_cooldown_seconds
otp_max_resends
```

Exact defaults are selected during implementation/security
configuration, not hard-coded in business modules.

------------------------------------------------------------------------

## 17. OTP Resend

Resend must invalidate the prior challenge or preserve one canonical
active challenge, depending on implementation.

Never allow several simultaneously valid OTPs for the same action
without explicit safe semantics.

Resend events are audited.

------------------------------------------------------------------------

## 18. OTP Rate Limiting

Rate limiting applies to OTP generation, resend, verification, login
attempts and recovery actions.

It may consider:

``` text
user
mobile
session
IP/device context where available
resource/action
```

Repeated abuse may create a temporary security lock.

------------------------------------------------------------------------

## 19. Agent Bag Handover

``` text
Bag READY_FOR_HANDOVER
        ↓
Assigned Agent + mobile
        ↓
OTP generated
        ↓
OTP verified
        ↓
Physical handover
        ↓
Custody Transfer recorded
```

No required OTP verification means no confirmed custody transfer.

The OTP is bound to `bag_id`, `agent_id` and handover purpose.

------------------------------------------------------------------------

## 20. Shipment Handover

``` text
Shipment READY_FOR_HANDOVER
        ↓
Assigned Agent / Courier / Carrier
        ↓
Receiver mobile
        ↓
OTP generated
        ↓
OTP verified
        ↓
Shipment physically handed over
        ↓
Custody Event created
```

The OTP is bound to `shipment_id`, `tracking_code`, assigned receiver
and handover purpose.

Successful verification does not mean final Retailer delivery; it
authorizes custody handover to the carrier/Agent.

------------------------------------------------------------------------

## 21. Bag Return Handover

Returning an Agent Bag may also require OTP-controlled custody transfer.

``` text
Agent custody
      ↓
Return initiated
      ↓
OTP / controlled receiver verification
      ↓
UID reconciliation
      ↓
Custody → Didar
```

Return cannot close until required UID reconciliation passes.

------------------------------------------------------------------------

## 22. Proforma Acceptance Security

Standard acceptance requires an authorized Retailer user.

Backend verifies:

``` text
authenticated user
retailer membership
acceptance permission
current Order revision
current Proforma version
Proforma status = ISSUED
not superseded
not cancelled
```

Then records:

``` text
accepted_by_user_id
accepted_by_organization_id
accepted_at
acceptance_method
session_reference
```

------------------------------------------------------------------------

## 23. Assisted Proforma Acceptance

Didar/Agent/CRM user does not automatically gain authority to accept for
the Retailer.

If assisted acceptance is later approved, explicit permission, approved
evidence method, OTP/signature/evidence, actual Didar actor, Retailer
identity and `on_behalf_of = true` must be recorded.

Until approved:

``` text
ASSISTED_ACCEPTANCE = DISABLED
```

------------------------------------------------------------------------

## 24. Login Security Events

``` text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
SESSION_EXPIRED
SESSION_REVOKED
USER_DISABLED
USER_LOCKED
ROLE_REVOKED
MEMBERSHIP_REVOKED
OTP_SENT
OTP_FAILED
OTP_VERIFIED
OTP_EXPIRED
OTP_RATE_LIMITED
AUTHORIZATION_DENIED
CROSS_ORG_ACCESS_DENIED
```

------------------------------------------------------------------------

## 25. Disabled User

Disabled users cannot perform protected actions.

Active sessions should be revoked or rejected according to
implementation capability.

------------------------------------------------------------------------

## 26. Role / Membership Revocation

Future authorization checks must use new effective permissions after
role/membership revocation.

Long-lived stale sessions must not preserve revoked authority
indefinitely.

------------------------------------------------------------------------

## 27. Authorization Denial

Authorization errors should not leak sensitive resource existence or
confidential details.

------------------------------------------------------------------------

## 28. API Security

Protected APIs validate:

``` text
authentication
organization scope
permission
resource ownership
workflow state
request payload
```

Strictly validate client fields including retailer_id, supplier_id,
organization_id, uid, order_id, invoice_id, role, permission,
credit_sale_allowed and approval flags.

------------------------------------------------------------------------

## 29. IDOR / Cross-Organization Protection

Tests must cover:

``` text
Supplier A tries Supplier B product
Supplier A tries Supplier B settlement
Retailer A tries Retailer B order
Retailer A tries Retailer B invoice
Agent tries unauthorized Retailer
Agent tries another Agent's Bag
```

All must fail.

------------------------------------------------------------------------

## 30. File / Attachment Security

Sensitive documents must obey resource organization scope.

Avoid public unrestricted object URLs for Supplier invoices, Zarrin
confirmations, invoice PDFs and settlement receipts.

Upload/replacement actions are audited.

------------------------------------------------------------------------

## 31. Public Tracking Security

Retailer tracking is authenticated/scoped in the Retailer panel unless a
later public-link model is explicitly approved.

Retailer may see:

``` text
Tracking Code
public status
timeline
expected delivery
own invoice references
```

Retailer must not see OTP secret, private Agent/Courier mobile, internal
security details, another Retailer's invoices or private internal notes.

------------------------------------------------------------------------

## 32. Secret Handling

Never place these in normal logs or reporting:

``` text
OTP secret
password
session token
refresh token
private API key
provider secret
encryption key
```

Use approved secret-management mechanisms during deployment.

------------------------------------------------------------------------

## 33. Security Audit

Audit preserves:

``` text
actor_user_id
actor_organization_id
session_id?
action
resource_type
resource_id
timestamp
result
reason?
on_behalf_of?
source/context?
```

Security audit is append-oriented.

------------------------------------------------------------------------

## 34. Reporting & Analytics Requirements

Security reporting must be useful without exposing secrets.

Dimensions:

``` text
user
organization
role
permission
action
resource_type
purpose
security_event
result
date/time
```

Minimum reports:

``` text
Active/Disabled users
Users by role
Role changes
Login failures
Authorization denials
Cross-organization denials
OTP sent/verified/failed/expired/resend/rate-limited
Bag custody handovers
Shipment custody handovers
Assisted/on-behalf-of actions
Sensitive administrative actions
```

Never report OTP codes/tokens/secrets.

------------------------------------------------------------------------

## 35. RBAC Permissions

Suggested security permissions:

``` text
security.audit.read
user.read
user.manage
membership.read
membership.manage
role.read
role.assign
otp.send
otp.verify
custody.bag.handover
custody.shipment.handover
session.revoke
```

Actual assignment follows `B2B-RBAC.md`.

------------------------------------------------------------------------

## 36. Frontend Minimum

Authentication UI:

``` text
Login
Logout
Session Expired
Unauthorized
Organization Context Switch where applicable
```

OTP UI:

``` text
Send OTP
Masked destination
OTP entry
Resend countdown
Attempts/error state
Verified state
Expired state
```

------------------------------------------------------------------------

## 37. API Capability

Required real backend capability:

``` text
Authenticate
Logout
Read current user/session
Read authorized memberships
Switch/resolve organization context
Authorize permission/resource scope
Create OTP challenge
Send OTP
Verify OTP
Resend OTP safely
Expire/consume OTP
Revoke session
Disable user
Revoke role/membership
Read security audit
Query security reporting
```

------------------------------------------------------------------------

## 38. Definition of Done

``` text
[ ] Protected APIs require authentication
[ ] Organization membership is backend-enforced
[ ] Role/permission checks are backend-enforced
[ ] Workflow-state checks are backend-enforced
[ ] Cross-Supplier access fails
[ ] Cross-Retailer access fails
[ ] Agent unauthorized Retailer access fails
[ ] OTP challenge is resource/action-specific
[ ] OTP expires
[ ] OTP attempt limit works
[ ] OTP resend policy works
[ ] OTP replay fails
[ ] OTP for one Shipment cannot verify another
[ ] OTP secret is not logged/reported
[ ] Bag handover OTP works
[ ] Shipment handover OTP works
[ ] Custody transfer requires valid OTP when configured
[ ] Proforma acceptance validates current version
[ ] Superseded Proforma acceptance fails
[ ] Didar/Agent cannot implicitly accept for Retailer
[ ] Assisted acceptance remains disabled until explicitly approved
[ ] Disabled user loses protected access
[ ] Revoked role/membership removes future authority
[ ] Sensitive files obey organization scope
[ ] Security audit works
[ ] Security reporting excludes secrets
[ ] Backend build succeeds
[ ] Frontend build succeeds
[ ] End-to-end security tests pass
```

------------------------------------------------------------------------

## 39. Explicitly Out of Scope

``` text
Final SMS provider selection
Final password complexity policy
SSO/SAML
Passkeys
Biometric authentication
Device fingerprinting
SIEM vendor
SOC workflow
Penetration-test execution
Advanced fraud scoring
Public unauthenticated shipment tracking
Legal electronic-signature implementation
```

------------------------------------------------------------------------

## 40. Clean-Fork Rule

No authentication, OTP, RBAC bypass, middleware or security workaround
from the previous Didar project is automatically inherited.

Reuse follows:

``` text
Inspect
→ Compare
→ Explicitly Approve
→ Reimplement or Selectively Port
```

------------------------------------------------------------------------

## 41. Implementation Package

**P11 --- Authentication, OTP & Security**

Suggested sequence:

``` text
Authentication
      ↓
Organization Membership
      ↓
RBAC Enforcement
      ↓
Cross-Organization Tests
      ↓
OTP Core
      ↓
Bag Handover OTP
      ↓
Shipment Handover OTP
      ↓
Proforma Acceptance Security
      ↓
Audit / Rate Limits
      ↓
Test
```

The package is complete only when:

``` text
Database → Backend → API → Frontend → Security Tests
```

passes with real persisted data.

## Public Retailer Collection Security

Shareable My Products pages use non-guessable, revocable public
identities/tokens.

Public Collection endpoints expose strict allowlisted Product/Collection
DTOs only.

Apply rate limiting/abuse controls. Public consumers must not access B2B
CRM, Supplier, stock, UID, Order, Invoice or Settlement data.

## Consumer Session / Lead Capture

Anonymous/session-based engagement is permitted where approved. Lead
capture must use explicit approved fields and consent behavior. Consumer
signals remain scoped to the originating Retailer context.

## Chat Security

Conversation membership and resource references are backend-authorized.
A message cannot grant access to a Product/Order/Invoice resource that
the participant otherwise cannot access.

## AI Security

AI data retrieval is always downstream of normal authorization:

``` text
Actor
→ RBAC / Resource Scope
→ Authorized Retrieval
→ AI Context
→ AI Output
```

AI must not use unrestricted database credentials as a shortcut around
application authorization.

Any AI-triggered domain mutation uses the normal authorized API/tool and
is audited.

## Dependency Coverage

Security requirements in this document apply to `CUSTOMER-CRM-CORE.md`,
`COMMUNICATION-CHAT.md`, `CAMPAIGN-MANAGEMENT.md`,
`RETAILER-SALES-ENABLEMENT.md` and `AI-SALES-INTELLIGENCE.md`, including
public Collection tokens, consumer sessions, Chat membership and AI
context/tool authorization.

## CMS Security

For `CONTENT-EXPERIENCE-CMS.md`: no arbitrary executable JavaScript;
sanitize/allowlist rich content; validate external URLs/embeds; protect
Draft Preview; expose strict Published DTOs; scope Media mutation; audit
Publish/Rollback/Schedule.

CMS rendering never bypasses Product visibility or exposes internal B2B
data.
