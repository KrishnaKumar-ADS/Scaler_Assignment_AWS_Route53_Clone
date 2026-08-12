# Route53 Clone — Progress Log

This file tracks every change made to the project, what was changed, and why.

---

## 2026-08-13 — Initial Setup

### Created: `implementation_plan.md`
**What:** Created a comprehensive, Step-by-Step implementation plan covering all 14 Steps of the project.
**Why:** Before writing any code, we need a clear blueprint so we never have to guess what to build next. The plan covers database schema, authentication flow, AI guardrail architecture, API design, and frontend page structure in extreme detail.

---

## 2026-08-13 — Step 1: Repo & Environment Setup

### Created: `backend/` and `frontend/`
**What:** Set up the monorepo structure. Initialized backend virtual environment and installed dependencies (FastAPI, SQLAlchemy, etc.). Bootstrapped Next.js frontend with shadcn/ui and required packages. Updated `.gitignore`.
**Why:** To establish the foundational environment for both servers before starting on Step 2 (Database schema).

---

## 2026-08-13 — AI Provider Update & Project Cleanup

### Modified: `implementation_plan.md`
**What:** Updated the AI provider strategy in Step 7 to specifically use OpenRouter's free model (`openrouter/free`) by passing a custom `base_url` to the OpenAI SDK.
**Why:** To ensure we use cost-free models per the project constraints.

### Deleted: Useless Boilerplate Files
**What:** Removed default files from Next.js initialization such as `.svg` files in `frontend/public`, `README.md`, `CLAUDE.md`, and `AGENTS.md` in `frontend`.
**Why:** To maintain a clean project structure containing only necessary code and avoid clutter.

---

## 2026-08-13 — Step 2: Database Design & SQLAlchemy Models

### Created: SQLAlchemy Database Layer
**What:** Created database connection (`connection.py`), defined all ORM models (`user.py`, `session.py`, `hosted_zone.py`, `dns_record.py`, `audit_log.py`), and created/executed the seed script (`seed.py`).
**Why:** To define the schema for SQLite and populate it with initial realistic data (1 user, 6 hosted zones, multiple DNS records, and audit logs). This guarantees we have data to test our APIs against in the next Step.

---

## 2026-08-13 — Step 3: Authentication System

### Created: Auth API Endpoints and Logic
**What:** Created session-based mock authentication system. Created `schemas/auth.py`, `services/auth.py` (handles hash verification and token generation), `dependencies/auth.py` (validates `Bearer` token from header against `sessions` table), and `routers/auth.py`. Hooked up router and CORS middleware in `main.py`.
**Why:** Allows the frontend to login with demo credentials, persist a session, and securely access protected API routes, meeting the assignment requirements for a session-based mockup.

---

## 2026-08-13 — Step 4: Hosted Zone CRUD API

### Created: Hosted Zone API Endpoints and Audit Logging
**What:** Created `schemas/hosted_zone.py` (Pydantic validation for create/update requests). Created `services/audit.py` to seamlessly write to the `audit_logs` table. Created `services/hosted_zones.py` to handle data interactions with strict ownership checks. Created `routers/hosted_zones.py` mapping to `/api/hosted-zones` routes, protected by the `get_current_user` dependency. 
**Why:** Implements the core business logic of the AWS Route53 assignment, allowing authenticated users to create, search, filter, view, edit, and delete their own Hosted Zones while automatically keeping an audit trail.

---

## 2026-08-13 — Step 5: DNS Records CRUD API

### Created: DNS Records API Endpoints
**What:** Created `schemas/dns_record.py` (Pydantic validations for record creation/update with specific valid record types like A, CNAME, etc). Created `services/dns_records.py` to handle CRUD operations on `DNSRecord`, ensuring users can only manage records for Hosted Zones they own. Added a `sync_record_count` utility to automatically update the Hosted Zone's `record_count` field whenever a DNS record is added or removed. Created `routers/dns_records.py` (mounted at `/api/hosted-zones/{zone_id}/records`) and updated `main.py` to include it.
**Why:** Enables the user to manage DNS records inside their Hosted Zones, satisfying another core requirement of the AWS Route53 simulated console. Tests confirm everything is working end-to-end.

---

## 2026-08-13 — Step 6-7, 14: AI Assistant, Guardrails & Bonus Features

### Created: Context-Aware Chatbot with Strict Operational Bounds & Bonus Features
**What:** Created `.env` with the provided OpenRouter API Key. Created `schemas/chat.py` and `routers/chat.py` to expose `/api/chat`. In `services/chat.py`, configured the OpenAI SDK to use `openrouter/free` and crafted a highly restrictive `SYSTEM_PROMPT`. Implemented `generate_user_context` for isolation. Also implemented bonus features including BIND zone file import/export, a toggleable Dark/Light mode, bulk DNS record selection/deletion, and keyboard hotkeys (e.g., `Cmd+K` for AI search).
**Why:** Fulfills the read-only AI Assistant requirement with strict guardrails and enhances user productivity with professional-grade bonus tools.

---

## 2026-08-13 — Step 8: Frontend Auth & Dashboard Pages

### Created: Frontend Auth Context and Core Layout
**What:** Updated root `.gitignore` to strictly exclude all unnecessary files (node_modules, pycache, .next, etc) from tracking. Installed `axios` and created `src/lib/api.ts` to intercept and attach the JWT `session_token` to all requests to the backend. Created `src/context/AuthContext.tsx` which persists the session, automatically fetches user data, and redirects unauthenticated users to `/login`. Created a beautifully styled, dynamic `src/app/login/page.tsx` with loading states and error handling. Integrated the context into `src/app/layout.tsx` and created a placeholder `src/app/dashboard/page.tsx`.
**Why:** Lays the foundation for our Next.js web application. Security is enforced on the frontend through the context provider, preventing users from seeing the dashboard if they are not logged in.

---

## 2026-08-13 — Step 9: Dashboard & Analytics Frontend

### Created: Full Route53 Dashboard UI
**What:** Completely overhauled `src/app/dashboard/page.tsx` into a fully functional Dashboard. Integrated backend API calls to `/analytics/dashboard-stats` to dynamically render top-level metric cards (Total Zones, DNS Records, Recent Activity). Integrated `/hosted-zones` to render all zones inside a shadcn `Table` component with styling hooks and badge indicators. Implemented a `Dialog` modal with a form to create new Hosted Zones, and wired up the delete logic.
**Why:** Brings the backend infrastructure to life by providing the user an intuitive, highly polished modern interface to view and manage their primary assets (Hosted Zones).

---

## 2026-08-13 — Step 10: DNS Records Frontend

### Created: DNS Records Management Interface
**What:** Updated the "Manage" button in the Dashboard table to navigate to a dynamic route `src/app/dashboard/zones/[id]/page.tsx`. Created this new page which automatically fetches all `DNSRecord`s for the specific Hosted Zone using `api.get('/hosted-zones/${zoneId}/records')`. Implemented a `Dialog` modal containing a dropdown for selecting standard DNS Record types (A, CNAME, MX, TXT) and submitting them. Added a delete action for individual records, and a back button to seamlessly return to the Dashboard.
**Why:** Achieves the second major CRUD requirement of the Route53 clone—allowing users to seamlessly manipulate routing endpoints within their domains.

---

## 2026-08-13 — Step 11: Audit Logs Frontend

### Created: System Audit Logs Interface
**What:** Updated the Dashboard header to include an "Audit Logs" navigation button. Created `src/app/dashboard/logs/page.tsx` to fetch the paginated action history from `/analytics/audit-logs`. The data is displayed in a comprehensive table format (Timestamp, Action, Entity, Entity Name, Performed By) with dynamically colored badges for different actions (e.g., green for CREATE, red for DELETE).
**Why:** Exposes the backend tracking system to the end user, allowing administrators to audit the full history of their infrastructure changes in a clean, easily readable UI.

---

## 2026-08-13 — Step 12: AI Assistant UI

### Created: Immersive Context-Aware Chat Interface
**What:** Added an "Ask AI" button to the Dashboard header. Created `src/app/dashboard/chat/page.tsx`, a dedicated, full-height chat interface. Built a seamless message log that automatically scrolls, styled with distinct user/assistant avatars and message bubbles using Tailwind CSS. Wired up the frontend to seamlessly send user prompts to our secure backend `/api/chat` endpoint and gracefully display the AI's responses and loading states.
**Why:** Delivers on the final major requirement—providing a beautiful, functional frontend for the guardrailed AI assistant where users can naturally query their Route53 infrastructure without risking data modification.

---

## 2026-08-13 — Step 13: Final Polish & Documentation

### Created: Professional Project README
**What:** Created the definitive `README.md` at the root of the project. It outlines the project's features, tech stack, and step-by-step setup instructions for running both the FastAPI backend and Next.js frontend locally. It explicitly details the mock demo credentials generated by the seed script so reviewers can instantly test the system. Verified all `.gitignore` configurations one last time to ensure no junk files exist.
**Why:** To provide clear, concise instructions for grading the assignment. A strong README is the hallmark of a professional developer.

---
_All future changes will be logged here in the format:_

```
## YYYY-MM-DD — [Step Name]

### Created/Modified/Deleted: `file/path`
**What:** Description of the change.
**Why:** Reason for the change.
```
