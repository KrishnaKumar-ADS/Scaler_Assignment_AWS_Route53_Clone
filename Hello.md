# Final Project Definition

You are building a **full-stack, AWS-style Route 53 web console** that lets authenticated users manage simulated Hosted Zones, while also providing a **read-only AI assistant** that can inspect and explain the data without ever modifying it.

A good project title would be:

> **Route 53 Clone: Cloud DNS Management Console with Read-Only AI Assistant**

Or, for a more professional/project-report style:

> **AI-Assisted Route 53 Management Console using Next.js, FastAPI, and SQLite**

---

# 1. What exactly are you building?

At the highest level, your application is a **simulated cloud-management platform**.

It behaves like a simplified version of the AWS Route 53 console.

The user can:

1. Log in.
2. See an AWS-style dashboard.
3. View their Hosted Zones.
4. Search and filter Hosted Zones.
5. Create a Hosted Zone.
6. Open a Hosted Zone and see its details.
7. Edit a Hosted Zone.
8. Delete a Hosted Zone.
9. See dashboard analytics.
10. See an activity/audit history.
11. Check system/API/database health.
12. Ask a read-only AI assistant questions about their Route 53 data.

The AI assistant **cannot perform any modification**.

That distinction is important:

```text
                    YOUR APPLICATION
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
       Dashboard       Hosted Zones      AI Assistant
          │                │                │
       Analytics          CRUD           READ ONLY
       Health             Search         Questions
                          Filters        Explanations
          │                │                │
          └────────────────┼────────────────┘
                           │
                           ▼
                        SQLite
```

You are **not** building actual DNS infrastructure.

You are building the **management experience**.

---

# 2. What Route 53 functionality are you actually cloning?

Real AWS Route 53 is much larger than this assignment.

You are cloning the **console experience and core Hosted Zone workflow**, not the entire AWS product.

Your application will simulate:

```text
AWS Route 53
    │
    └── Hosted Zones
          │
          ├── List
          ├── Search
          ├── Create
          ├── View
          ├── Edit
          └── Delete
```

You can also include simulated DNS records to make the Hosted Zone details page look realistic, but they don't need to perform real DNS resolution.

For example:

```text
example.com
    │
    ├── A       192.168.1.10
    ├── CNAME   www.example.com
    ├── MX      mail.example.com
    └── TXT     "verification=..."
```

These are just application data stored in SQLite.

---

# 3. Your final tech stack

Use this stack.

## Frontend

### Core

**Next.js**

**TypeScript**

**Tailwind CSS**

### UI

**shadcn/ui**

**Lucide React**

### Forms/validation

**React Hook Form**

**Zod**

### Data fetching

**TanStack Query**

---

## Backend

**Python**

**FastAPI**

**Uvicorn**

**SQLAlchemy**

**Pydantic**

---

## Database

**SQLite**

---

## Authentication

Use **mocked application authentication** rather than implementing AWS IAM.

You will still have:

```text
User
    ↓
Login
    ↓
Session
    ↓
Protected application
    ↓
Logout
```

---

## AI

Use an LLM through a backend-controlled assistant layer.

The exact model/provider is an implementation detail.

The important part is the architecture:

```text
User
 ↓
AI Assistant
 ↓
Allowed read-only operations
 ↓
FastAPI GET endpoints
 ↓
SQLite
```

The AI should never get direct SQL access.

---

# 4. Overall architecture

Your architecture should look like this:

```text
                         ┌──────────────────────┐
                         │      User / Browser  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Next.js App      │
                         │     TypeScript       │
                         │                      │
                         │ • Login              │
                         │ • Dashboard          │
                         │ • Hosted Zones       │
                         │ • Search/Filters     │
                         │ • Analytics           │
                         │ • Activity Logs      │
                         │ • AI Chat            │
                         │ • Health Page        │
                         └──────────┬───────────┘
                                    │
                            HTTP/JSON REST API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       FastAPI        │
                         │                      │
                         │ Auth API             │
                         │ Hosted Zone API      │
                         │ Search API           │
                         │ Analytics API        │
                         │ Audit API            │
                         │ Health API           │
                         │ AI Assistant API     │
                         └──────────┬───────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
                     ▼              ▼              ▼
               Authentication   AI Guardrails   SQLAlchemy
                                     │              │
                                     ▼              ▼
                                  Read-only       SQLite
                                  operations
```

---

# 5. Your application has 3 major layers

## Layer 1 — Frontend

The frontend is responsible for:

* What the user sees
* Navigation
* Forms
* Tables
* Modals
* Search
* Filters
* Charts
* Chat interface
* Loading states
* Errors
* Notifications

The frontend **does not directly talk to SQLite**.

It talks to FastAPI.

---

# 6. Layer 2 — FastAPI backend

The backend is the brain of the application.

It handles:

* Authentication
* Authorization
* Hosted Zone CRUD
* Search
* Filtering
* Statistics
* Audit logging
* Health checks
* AI assistant requests

The frontend should never be trusted to enforce important business rules by itself.

For example:

```text
Frontend:
"Delete zone 4."

FastAPI:
"Is this user logged in?"
"Does zone 4 belong to this user?"
"Is the operation valid?"
"Delete it."
"Record audit event."
```

---

# 7. Layer 3 — SQLite

SQLite stores persistent application data.

Your initial database can contain:

```text
users
sessions
hosted_zones
dns_records
audit_logs
```

You can add an `ai_conversations` table later if you want chat history.

---

# 8. Database design

Let's make the database slightly more professional than the bare minimum.

---

## `users`

```text
users
────────────────────────
id                  INTEGER PRIMARY KEY
email               TEXT UNIQUE
password_hash       TEXT
created_at          DATETIME
```

Example:

```text
1 | demo@example.com | <hashed-password> | 2026-08-13
```

---

## `sessions`

```text
sessions
────────────────────────
id                  INTEGER PRIMARY KEY
user_id             INTEGER
session_token       TEXT UNIQUE
expires_at          DATETIME
created_at          DATETIME
```

Relationship:

```text
users 1 ──────────── * sessions
```

---

# 9. Hosted Zone table

This is your main entity.

```text
hosted_zones
────────────────────────
id                  INTEGER PRIMARY KEY
user_id             INTEGER
name                TEXT
zone_type           TEXT
description         TEXT
status              TEXT
record_count        INTEGER
created_at          DATETIME
updated_at          DATETIME
```

Example:

```text
1
1
example.com
PUBLIC
Production website
ACTIVE
4
2026-08-10
2026-08-13
```

---

# 10. DNS records

You can add:

```text
dns_records
────────────────────────
id                  INTEGER PRIMARY KEY
hosted_zone_id      INTEGER
name                TEXT
record_type         TEXT
value               TEXT
ttl                 INTEGER
created_at          DATETIME
```

Relationship:

```text
Hosted Zone
     │
     ├── Record
     ├── Record
     ├── Record
     └── Record
```

You don't have to support full DNS record CRUD for the assignment.

You can simply display mock records.

That is enough to make the Hosted Zone page convincing.

---

# 11. Audit logs

Your fifth major supporting feature is activity history.

```text
audit_logs
────────────────────────
id                  INTEGER PRIMARY KEY
user_id             INTEGER
action              TEXT
resource_type       TEXT
resource_id         INTEGER
description         TEXT
source              TEXT
created_at          DATETIME
```

Example:

```text
CREATE_HOSTED_ZONE
HOSTED_ZONE
1
"Created example.com"
UI
2026-08-13 10:42
```

Possible actions:

```text
LOGIN
LOGOUT
CREATE_HOSTED_ZONE
UPDATE_HOSTED_ZONE
DELETE_HOSTED_ZONE
VIEW_HOSTED_ZONE
```

The `source` can be:

```text
UI
SYSTEM
```

The AI should be read-only, so ideally it won't generate write events at all.

---

# 12. The five extra features you selected

Your final five are:

## 1. Read-only AI assistant

## 2. Analytics dashboard

## 3. Audit/activity logs

## 4. Advanced search/filtering

## 5. System health/status

These are the five I would keep.

---

# 13. Feature 1 — Read-only AI assistant

This is your **standout feature**.

The chatbot should understand questions about:

* Hosted Zones
* Zone status
* Zone type
* Zone counts
* Creation dates
* Records
* Activity
* Basic Route 53 concepts

Examples:

### Data question

> How many hosted zones do I have?

### Filter question

> Show all public zones.

### Specific resource

> Tell me about example.com.

### Analytics

> How many zones were created this month?

### Conceptual

> What is a hosted zone?

---

# 14. What the AI must NOT do

The chatbot cannot:

```text
CREATE
UPDATE
DELETE
```

It also cannot:

```text
execute SQL
modify SQLite
call write APIs
change user permissions
change sessions
```

For example:

> Delete example.com

Response:

> I’m a read-only assistant and cannot create, modify, or delete Hosted Zones. Please use the Hosted Zones interface to manage resources.

This is an excellent guardrail to demonstrate.

---

# 15. How the AI should access data

Never do this:

```text
User
 ↓
LLM
 ↓
SQL
 ↓
Database
```

Do this:

```text
User
 ↓
LLM
 ↓
Allowed read-only tool
 ↓
FastAPI GET endpoint
 ↓
SQLAlchemy
 ↓
SQLite
```

For example:

```text
get_hosted_zones()
get_hosted_zone(id)
search_hosted_zones(query)
get_zone_statistics()
get_recent_activity()
```

Those are your safe tools.

---

# 16. AI guardrail design

Give your assistant an explicit policy:

```text
You are a read-only Route 53 assistant.

You may:
- Read hosted zone data.
- Search hosted zones.
- Summarize information.
- Explain Route 53 concepts.
- Read analytics and activity information.

You may not:
- Create resources.
- Update resources.
- Delete resources.
- Modify data.
- Execute SQL.
- Change application settings.
- Claim an action was performed when it was not.

When asked to modify data, clearly state that you are read-only.
```

However, don't rely only on the prompt.

The **real guardrail is architectural**.

The backend must simply refuse write operations from the AI path.

---

# 17. Feature 2 — Analytics Dashboard

Your dashboard should be the first screen after login.

It can show:

```text
Route 53 Overview
```

Then:

```text
┌────────────────┬────────────────┬────────────────┐
│ Hosted Zones   │ Public Zones   │ Private Zones  │
│     12         │       9        │       3        │
└────────────────┴────────────────┴────────────────┘

┌────────────────┬────────────────┐
│ Active         │ Records        │
│     11         │      42        │
└────────────────┴────────────────┘
```

Then charts:

```text
Hosted Zones by Type

Public     █████████ 9
Private    ███       3
```

And perhaps:

```text
Zones Created

June       ███
July       ███████
August     █████
```

All of this can be calculated from SQLite.

---

# 18. Feature 3 — Audit/activity page

Create:

```text
/activity
```

Page:

```text
Activity

Today

10:42  Created example.com
10:31  Updated mysite.com
09:15  Deleted test.com

Yesterday

16:22  Logged in
15:04  Created demo.org
```

You can filter:

```text
Action: All
Resource: Hosted Zone
Date: Today
```

This gives the application a more enterprise/cloud-console feel.

---

# 19. Feature 4 — Advanced search

Your Hosted Zones screen should support:

```text
Search hosted zones...
```

and filters:

```text
Type:
All
Public
Private

Status:
All
Active
Inactive

Created:
Any time
Last 7 days
Last 30 days
Last 90 days
```

You can support:

```text
GET /hosted-zones?search=example&type=PUBLIC&status=ACTIVE
```

The backend constructs the query safely using SQLAlchemy.

---

# 20. Feature 5 — System health

Create:

```text
/health
```

or a section in the dashboard.

Show:

```text
System Health

● API Server
  Operational

● SQLite Database
  Operational

● Authentication
  Operational

● AI Assistant
  Operational
```

FastAPI can expose:

```http
GET /health
```

For example:

```json
{
  "api": "healthy",
  "database": "healthy",
  "timestamp": "2026-08-13T10:42:00Z"
}
```

---

# 21. Pages you should build

Your frontend should have roughly these routes:

```text
/login

/dashboard

/hosted-zones
/hosted-zones/create
/hosted-zones/[id]
/hosted-zones/[id]/edit

/activity

/health

/settings
```

The chatbot can be global, so it doesn't necessarily need its own route.

---

# 22. Login page

Design it like an AWS console login rather than a generic form.

```text
┌────────────────────────────────────┐
│                                    │
│            Route 53                │
│                                    │
│       Sign in to Console           │
│                                    │
│ Email                              │
│ ┌────────────────────────────────┐ │
│ │ demo@example.com               │ │
│ └────────────────────────────────┘ │
│                                    │
│ Password                           │
│ ┌────────────────────────────────┐ │
│ │ •••••••••••                    │ │
│ └────────────────────────────────┘ │
│                                    │
│          [ Sign In ]               │
│                                    │
└────────────────────────────────────┘
```

You can seed one demo account.

---

# 23. Main application shell

Once logged in:

```text
┌───────────────────────────────────────────────────────┐
│ Route 53     Search...            Help     Account ▼   │
├───────────────┬───────────────────────────────────────┤
│               │                                       │
│ Dashboard     │                                       │
│               │                                       │
│ Hosted Zones  │            Page Content               │
│               │                                       │
│ Activity      │                                       │
│               │                                       │
│ System Health │                                       │
│               │                                       │
│ Settings      │                                       │
└───────────────┴───────────────────────────────────────┘
```

This layout should persist across the application.

---

# 24. Hosted Zones list page

This is the heart of the application.

```text
Hosted zones

[ Create hosted zone ]

Search hosted zones...

Type ▼
Status ▼
Created ▼

┌───────────────────────────────────────────────────────┐
│ Name             Type       Records     Status        │
├───────────────────────────────────────────────────────┤
│ example.com      Public       6        Active         │
│ mysite.com       Public       4        Active         │
│ internal.local   Private      3        Active         │
└───────────────────────────────────────────────────────┘
```

Each row should be clickable.

---

# 25. Create Hosted Zone

Page:

```text
Create hosted zone

Name
[ example.com ]

Type

○ Public
○ Private

Description
[ Production website ]

                         [Cancel] [Create]
```

When the user clicks Create:

```text
Next.js
   ↓
POST /hosted-zones
   ↓
FastAPI validation
   ↓
SQLite insert
   ↓
Audit log insert
   ↓
Response
   ↓
Next.js refresh
```

---

# 26. Validation rules

Backend should validate:

### Name required

```text
example.com
```

cannot be empty.

### Type required

```text
PUBLIC
PRIVATE
```

Only permitted values.

### Ownership

A user must only be able to manage their own zones.

This is an important backend rule.

---

# 27. Hosted Zone details page

This page should look richer than a plain database record.

```text
Hosted zone: example.com

Status
● Active

Type
Public

Created
August 10, 2026

Records
6

Description
Production website

[ Edit ] [ Delete ]

────────────────────────────────────────

Overview

DNS Records

Activity
```

You can show mock DNS records below.

---

# 28. Edit page

The user can edit fields such as:

```text
Description
Status
```

You may choose not to let them change the domain name because it makes the simulated model simpler.

That is perfectly acceptable.

---

# 29. Delete workflow

Use a confirmation modal.

```text
Delete hosted zone?

You are about to delete:

example.com

This action cannot be undone.

[Cancel] [Delete]
```

Then:

```text
DELETE /hosted-zones/1
```

and create:

```text
DELETE_HOSTED_ZONE
```

in the audit log.

---

# 30. REST API design

A good API structure is:

## Authentication

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

---

## Hosted Zones

```http
GET    /api/hosted-zones
POST   /api/hosted-zones
GET    /api/hosted-zones/{id}
PUT    /api/hosted-zones/{id}
DELETE /api/hosted-zones/{id}
```

---

## DNS records

If you implement them:

```http
GET /api/hosted-zones/{id}/records
```

You do not need full CRUD unless you want it.

---

## Analytics

```http
GET /api/analytics/overview
GET /api/analytics/zones-by-type
GET /api/analytics/zones-over-time
```

---

## Activity

```http
GET /api/activity
```

---

## Health

```http
GET /api/health
```

---

## AI

```http
POST /api/assistant/chat
```

The AI endpoint can call **only read operations**.

---

# 31. Example API response

`GET /api/hosted-zones`

```json
{
  "items": [
    {
      "id": 1,
      "name": "example.com",
      "zone_type": "PUBLIC",
      "status": "ACTIVE",
      "record_count": 6,
      "description": "Production website",
      "created_at": "2026-08-10T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

# 32. Backend project structure

Use something like:

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── database/
│   │   ├── connection.py
│   │   └── seed.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── session.py
│   │   ├── hosted_zone.py
│   │   ├── dns_record.py
│   │   └── audit_log.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── hosted_zone.py
│   │   ├── audit.py
│   │   └── assistant.py
│   │
│   ├── routers/
│   │   ├── auth.py
│   │   ├── hosted_zones.py
│   │   ├── analytics.py
│   │   ├── activity.py
│   │   ├── health.py
│   │   └── assistant.py
│   │
│   ├── services/
│   │   ├── auth.py
│   │   ├── hosted_zones.py
│   │   ├── analytics.py
│   │   ├── audit.py
│   │   └── assistant.py
│   │
│   └── dependencies/
│       └── auth.py
│
├── tests/
│
├── requirements.txt
└── route53.db
```

This separation will make your code much easier to maintain.

---

# 33. Frontend project structure

```text
frontend/
│
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   ├── hosted-zones/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   │
│   │   ├── activity/
│   │   │   └── page.tsx
│   │   │
│   │   ├── health/
│   │   │   └── page.tsx
│   │   │
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── AppShell.tsx
│   │   │
│   │   ├── hosted-zones/
│   │   │   ├── ZoneTable.tsx
│   │   │   ├── ZoneFilters.tsx
│   │   │   ├── ZoneForm.tsx
│   │   │   └── DeleteZoneDialog.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx
│   │   │   └── Charts.tsx
│   │   │
│   │   └── assistant/
│   │       ├── ChatButton.tsx
│   │       ├── ChatWindow.tsx
│   │       └── ChatMessage.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── useHostedZones.ts
│   │   ├── useAuth.ts
│   │   └── useAssistant.ts
│   │
│   └── types/
│       ├── auth.ts
│       ├── hostedZone.ts
│       └── assistant.ts
│
└── package.json
```

---

# 34. How you should actually build it

Do **not** start with the chatbot.

Build it in this order.

---

# Phase 1 — Create the repository

```text
route53-clone/
    frontend/
    backend/
```

Initialize Git immediately.

```bash
git init
```

Use branches if you're working seriously:

```text
main
development
feature/auth
feature/hosted-zones
feature/ai
```

---

# Phase 2 — Build database + FastAPI

Start with the backend.

Why?

Because your frontend needs working APIs.

First get this working:

```text
FastAPI
   ↓
SQLAlchemy
   ↓
SQLite
```

Create tables.

Seed a demo user.

Seed some demo zones.

For example:

```text
example.com
mysite.com
internal.local
demo.org
cloudapp.io
```

---

# Phase 3 — Build authentication

Implement:

```http
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

Make login work before building the rest of the UI.

Test using Swagger/OpenAPI.

FastAPI gives you an interactive API documentation interface automatically.

---

# Phase 4 — Build Hosted Zone CRUD

Implement:

```text
GET
POST
GET /id
PUT
DELETE
```

Test all of them independently.

At this stage, you should be able to use Swagger and completely manage your database without the frontend.

---

# Phase 5 — Build the frontend shell

Create:

```text
Login
Dashboard
Sidebar
Header
```

Don't build every feature yet.

Get the visual foundation right first.

---

# Phase 6 — Connect authentication

Connect:

```text
Next.js Login
      ↓
POST /auth/login
      ↓
FastAPI
      ↓
Session
      ↓
Dashboard
```

Then protect application routes.

---

# Phase 7 — Build Hosted Zones UI

Implement:

```text
Hosted Zones page
      ↓
GET /hosted-zones
```

Then:

```text
Create
      ↓
POST
```

Then:

```text
View
Edit
Delete
```

Only move forward when each step works.

---

# Phase 8 — Add advanced search and filtering

Now implement:

```text
search
type
status
date
```

Make sure the filtering happens consistently.

Don't let the frontend and backend have different interpretations of the same filter.

---

# Phase 9 — Add audit logs

Every CRUD operation should produce a log.

For example:

```text
POST /hosted-zones
       ↓
Create zone
       ↓
Write audit log
       ↓
Return response
```

Don't manually insert logs from multiple frontend components.

Put this responsibility in the backend/service layer.

---

# Phase 10 — Build analytics

Once you have enough database data, analytics becomes easy.

Calculate:

```text
total_zones
public_zones
private_zones
active_zones
total_records
```

Return them through:

```http
GET /api/analytics/overview
```

Then visualize them in Next.js.

---

# Phase 11 — Build health monitoring

Implement:

```http
GET /api/health
```

Check:

```text
API
Database
```

Then the frontend shows those statuses.

---

# Phase 12 — Finally build the AI assistant

Only do this after everything else works.

The AI assistant should be treated as a **read layer over your existing application**.

It should not contain application business logic.

---

# 35. AI architecture in detail

When the user sends:

> "How many active hosted zones do I have?"

The flow should be:

```text
User
 │
 ▼
Chat UI
 │
 ▼
POST /api/assistant/chat
 │
 ▼
AI service
 │
 ├── Understand question
 │
 ├── Decide required read operation
 │
 ▼
get_zone_statistics()
 │
 ▼
GET /api/analytics/overview
 │
 ▼
SQLite
 │
 ▼
Data returned
 │
 ▼
AI generates explanation
 │
 ▼
Chat UI
```

The AI doesn't "know" your database.

It gets information through approved application functions.

---

# 36. Example chatbot interaction

User:

> Show me all public hosted zones.

AI:

```text
I found 3 public hosted zones:

1. example.com
   Status: Active
   Records: 6

2. mysite.com
   Status: Active
   Records: 4

3. demo.org
   Status: Inactive
   Records: 2
```

Then user:

> Delete demo.org.

AI:

```text
I'm a read-only assistant, so I can't delete or modify
Hosted Zones.

You can delete demo.org from the Hosted Zones console.
```

That is exactly the behavior you want.

---

# 37. Make the AI understand user context

The assistant should know the logged-in user.

For example:

```text
User ID = 42
```

The assistant's database queries should be scoped to:

```text
WHERE user_id = 42
```

This is extremely important.

User A must not be able to ask the AI about User B's Hosted Zones.

---

# 38. Authorization

You have two different concepts:

### Authentication

"Who are you?"

### Authorization

"What are you allowed to access?"

Your backend needs both.

For example:

```text
User 1 requests:

GET /hosted-zones/999
```

If zone 999 belongs to User 2:

```text
403 Forbidden
```

The backend should enforce this even if the frontend tries to bypass it.

---

# 39. Important security principle

Never trust the frontend.

A malicious user could manually send:

```http
DELETE /api/hosted-zones/999
```

Therefore FastAPI must verify:

```text
Is user authenticated?
       ↓
Does zone belong to user?
       ↓
Is action allowed?
       ↓
Execute operation
```

The same goes for the AI.

---

# 40. Error handling

Your app should never simply crash.

Backend errors:

```json
{
  "detail": "Hosted zone not found"
}
```

Frontend displays:

```text
⚠ Hosted zone not found.
```

For API failures:

```text
⚠ Unable to load hosted zones.

[ Retry ]
```

For AI failures:

```text
⚠ The assistant is temporarily unavailable.
```

---

# 41. Loading states

For every data-dependent screen, have a loading state.

Example:

```text
Hosted Zones

Loading...
```

Or skeleton rows.

Same for:

* Dashboard
* Activity
* Health
* AI messages

This adds a surprisingly large amount of perceived polish.

---

# 42. Empty states

Suppose the user has no Hosted Zones.

Don't show an empty white screen.

Show:

```text
No hosted zones

You haven't created any hosted zones yet.

[ Create hosted zone ]
```

For activity:

```text
No activity yet.
Your future Hosted Zone actions will appear here.
```

---

# 43. The UI should feel like AWS

Don't make it look like:

```text
Generic Bootstrap CRUD App
```

Your visual direction should be:

```text
Professional
Dense but readable
Enterprise dashboard
Neutral colors
Clear borders
Compact tables
Strong navigation
Information hierarchy
```

Think:

```text
Cloud console
rather than
consumer website
```

---

# 44. Suggested design system

Use:

### Colors

* Dark navy/charcoal for navigation
* White/light gray content area
* Orange as a Route 53/AWS-inspired action color
* Green for healthy/active
* Red for destructive actions
* Gray for secondary information

### Components

* Cards
* Tables
* Tabs
* Breadcrumbs
* Dropdowns
* Modals
* Toasts
* Badges
* Pagination
* Tooltips

---

# 45. What your dashboard should show

I'd make the first page something like:

```text
Route 53

Welcome back, Demo User.

Overview

┌───────────────┐ ┌───────────────┐
│ Hosted Zones  │ │ Public Zones  │
│      12       │ │       9       │
└───────────────┘ └───────────────┘

┌───────────────┐ ┌───────────────┐
│ Private Zones │ │ DNS Records   │
│       3       │ │      42       │
└───────────────┘ └───────────────┘

Hosted Zones by Type
[chart]

Recent Activity
────────────────────────────
Created example.com
Updated mysite.com
Deleted demo.org

System Status
────────────────────────────
● API
● Database
● Authentication
```

And the AI button sits in the lower-right:

```text
                    ┌──────────────┐
                    │ 🤖 Assistant │
                    └──────────────┘
```

---

# 46. Hosted Zone page should be your strongest screen

A polished resource page:

```text
Hosted Zone
example.com

[ Edit ] [ Delete ]

Overview
──────────────────────────────────────────────

Status            Active
Type              Public
Created           Aug 10, 2026
Updated           Aug 13, 2026
Record Count      6

Description
Production website

DNS Records
──────────────────────────────────────────────

Name              Type       Value
example.com       A          192.168.1.10
www.example.com   CNAME      example.com
mail.example.com  MX         mail.example.com
example.com       TXT        verification=...

Activity
──────────────────────────────────────────────
10:42 Created
09:31 Updated
```

Even though your project is a clone, this feels like a real cloud resource-management application.

---

# 47. Testing strategy

You should test all three layers.

## Backend unit tests

Test:

```text
login
logout
zone creation
zone retrieval
zone update
zone deletion
search
authorization
health
analytics
```

---

## API integration tests

Example:

```text
Login
 ↓
Create zone
 ↓
Get zone
 ↓
Update zone
 ↓
Search zone
 ↓
Delete zone
```

---

## Frontend tests

At minimum verify:

```text
Login works
Dashboard loads
Hosted Zones loads
Search works
Create works
Edit works
Delete works
AI chat opens
AI cannot modify data
```

---

# 48. Seed data

This is important for your project demo.

Create an automated database seed.

For example:

```text
Demo User

Hosted Zones:

example.com
www.example.com
company.org
internal.local
demo.net
cloudapp.io
```

Each with different:

```text
status
type
records
created_at
```

Then when your professor/interviewer opens the application, it already looks alive.

---

# 49. Demo scenario

Your final demonstration can be extremely strong.

### Step 1

Login:

```text
demo@example.com
```

### Step 2

Show dashboard:

> "We currently have 6 Hosted Zones."

### Step 3

Go to Hosted Zones.

Search:

> `company`

### Step 4

Filter:

> Public + Active

### Step 5

Open:

> `company.org`

Show records.

### Step 6

Edit the description.

### Step 7

Show Activity:

> Updated company.org

### Step 8

Go back to dashboard.

Analytics updated.

### Step 9

Open AI assistant:

> "How many public hosted zones do I have?"

AI answers based on actual database data.

### Step 10

Ask:

> "Tell me about company.org."

AI summarizes it.

### Step 11

Ask:

> "Delete company.org."

AI refuses:

> "I'm a read-only assistant..."

### Step 12

Open System Health.

Show:

```text
API: Healthy
Database: Healthy
```

That is a very good end-to-end demonstration.

---

# 50. What you should NOT build

Don't waste time implementing things that aren't required.

Do not attempt:

```text
Real DNS server
Real AWS Route 53 integration
Real AWS IAM
Real domain registration
DNSSEC
Global traffic management
AWS billing
AWS organizations
CloudFormation
Multi-region DNS
```

Those will dramatically increase complexity without helping your assignment much.

---

# 51. What makes this project impressive?

Not just the number of features.

The impressive part is the **architecture**.

You're demonstrating:

```text
Frontend
    ↓
REST API
    ↓
Authentication
    ↓
Authorization
    ↓
Database
    ↓
CRUD
    ↓
Analytics
    ↓
Audit logging
    ↓
AI integration
    ↓
AI guardrails
    ↓
Monitoring
```

That's a much stronger story than:

> "I made a website that stores domain names."

---

# 52. Final architecture you should implement

This is the version I recommend you actually build:

```text
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                        │
│                                                             │
│ Login                                                       │
│   │                                                         │
│   ▼                                                         │
│ Dashboard ─────── Analytics                                 │
│   │                                                         │
│   ├── Hosted Zones ─── Search / Filter                      │
│   │       │                                                 │
│   │       ├── Create                                        │
│   │       ├── Details ─── DNS Records                       │
│   │       ├── Edit                                           │
│   │       └── Delete                                         │
│   │                                                         │
│   ├── Activity / Audit                                      │
│   ├── System Health                                         │
│   └── 🤖 Read-only AI Assistant                             │
│                                                             │
└─────────────────────────────┬───────────────────────────────┘
                              │
                         REST / JSON
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                     FASTAPI BACKEND                         │
│                                                             │
│ Authentication                                              │
│ Authorization                                               │
│ Hosted Zone CRUD                                            │
│ Search / Filtering                                          │
│ Analytics                                                   │
│ Audit Logging                                               │
│ Health Checks                                               │
│ Read-only AI Service                                        │
│                                                             │
└───────────────┬──────────────────────────┬──────────────────┘
                │                          │
                ▼                          ▼
        ┌───────────────┐          ┌──────────────────┐
        │    SQLite     │          │   AI Provider    │
        │               │          │                  │
        │ users         │          │ Read-only tools │
        │ sessions      │          │                  │
        │ zones         │          └──────────────────┘
        │ dns_records   │
        │ audit_logs    │
        └───────────────┘
```

The critical AI boundary is:

```text
                    AI
                     │
          ┌──────────┴──────────┐
          │                     │
       ALLOWED               FORBIDDEN
          │                     │
       GET/read               POST
       search                PUT
       analytics             PATCH
       activity              DELETE
                               SQL writes
```

---

# 53. Recommended build timeline

Don't think of this as one giant project.

Break it into milestones.

### Milestone 1

```text
Next.js running
FastAPI running
SQLite connected
```

### Milestone 2

```text
Authentication complete
```

### Milestone 3

```text
Hosted Zone CRUD API complete
```

### Milestone 4

```text
AWS-style frontend complete
```

### Milestone 5

```text
Hosted Zone UI connected to backend
```

### Milestone 6

```text
Advanced search/filtering
```

### Milestone 7

```text
Audit logs
```

### Milestone 8

```text
Analytics dashboard
```

### Milestone 9

```text
System health
```

### Milestone 10

```text
Read-only AI assistant
```

### Milestone 11

```text
Testing + polish + demo data
```

---

# 54. The exact MVP

Before adding the five extra features, get this working:

```text
✓ Login
✓ Logout
✓ Session persistence
✓ Hosted Zone list
✓ Search
✓ Create
✓ View
✓ Edit
✓ Delete
✓ SQLite persistence
✓ FastAPI REST API
✓ Next.js UI
```

Once that is stable, add:

```text
✓ Analytics
✓ Audit logs
✓ Advanced filters
✓ Health
✓ AI assistant
```

This ordering matters because the AI should be built **on top of a working application**, not used to compensate for an incomplete backend.

---

# 55. Your final project in one paragraph

You are building a **full-stack simulated AWS Route 53 management console** using **Next.js and TypeScript** on the frontend, **FastAPI and Python** on the backend, and **SQLite** for persistent storage. Users authenticate through a mocked session-based login system and can manage simulated Hosted Zones through complete CRUD operations, search, and filtering. The application includes a cloud-style analytics dashboard, activity/audit logging, system health monitoring, and a **read-only AI assistant** that can answer natural-language questions using data retrieved from controlled read-only APIs. The AI is deliberately prevented from creating, modifying, deleting, or directly querying the database, giving the project a clear safety and authorization boundary.

---

# 56. What I would build first, concretely

Start with these files:

```text
route53-clone/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routers/
│   │       ├── auth.py
│   │       └── hosted_zones.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── login/
    │   │   ├── dashboard/
    │   │   └── hosted-zones/
    │   ├── components/
    │   └── lib/
    └── package.json
```

Then the first technical target is simply:

```text
FastAPI
   ↓
SQLite
   ↓
User table
   ↓
HostedZone table
   ↓
Login API
   ↓
Hosted Zone CRUD APIs
```

Once those APIs are working, the frontend becomes much easier.

---

## Final recommendation

Don't treat this as **"a Route 53 clone with a chatbot."**

Treat it as:

> **A secure, full-stack cloud resource management console with CRUD workflows, analytics, auditing, health monitoring, and a constrained read-only AI assistant.**

That framing makes the project substantially stronger academically and professionally, while still keeping the implementation realistic with **Next.js + FastAPI + SQLite**.
