# Rubric Finalization Plan (Phase 15)

This plan aims to implement all remaining missing requirements strictly mentioned in the assignment rubric to ensure 100% compliance.

## Goal Description
Implement missing Route53 frontend experiences (Sidebar, Mocked sections), missing CRUD operations (Edit/Search for Zones and Records), and proper documentation (README).

## Open Questions
- Is client-side search/pagination acceptable for DNS records, or do we need backend pagination for them? (We will implement backend pagination to be safe, matching Hosted Zones).

## Proposed Changes

### Frontend
#### [NEW] `frontend/src/app/dashboard/layout.tsx`
- Implement a global `DashboardLayout` containing the Route 53 sidebar navigation.
- Links: Dashboard, Traffic Policies, Health Checks, Resolver, Profiles.

#### [NEW] `frontend/src/app/dashboard/traffic-policies/page.tsx` (and other mocked sections)
- Simple "Coming Soon" components for Traffic Policies, Health Checks, Resolver, and Profiles.

#### [MODIFY] `frontend/src/app/dashboard/page.tsx`
- Add an **Edit Zone** button to the Hosted Zones table actions.
- Implement an Edit Zone modal to update `description` and `zone_type`.
- Add a Search input to filter Hosted Zones by name.
- Add Pagination controls (Next/Prev) hooked to the backend API.

#### [MODIFY] `frontend/src/app/dashboard/zones/[id]/page.tsx`
- Add an **Edit Record** button to the DNS Records table actions.
- Implement an Edit Record modal to update `value` and `ttl`.
- Add a Search input to filter DNS Records.

### Backend
#### [MODIFY] `backend/app/services/dns_records.py` & `backend/app/routers/dns_records.py`
- Update `get_dns_records` to support `search`, `page`, and `limit` query parameters for proper pagination and filtering.
- Create a `PaginatedDNSRecords` schema to return `{ items, total, page, limit }`.

### Documentation
#### [MODIFY] `README.md`
- Rewrite to explicitly contain:
  1. Setup instructions
  2. Architecture overview
  3. Database schema (SQLite relationships)
  4. API overview

## Verification Plan
- Run `npm run build` to ensure no new UI type errors.
- Verify Search and Pagination works on both pages.
- Verify the Edit modals update the backend database correctly via audit logs.
