# Milestone 6 Task Tracking Ledger: Partner & Pilot Portal (`06-partner-pilot-portal-task.md`)

**Entity:** Startup Jigawa Ltd (RC 7256149), Dutse, Jigawa State, Nigeria

**Service Target:** `portal.startupjigawa.test` (Port 3003)

**Status:** Ready for Execution (Post-Approval)

---

## Task Breakdown & Execution Checklist

### Phase 1: Infrastructure & Subdomain Routing Registration

* [ ] **Task 1.1**: Register `portal.startupjigawa.test` (Port `3003`) in `scripts/subdomain-server.js` within the unified subdomain routing map.
* [ ] **Task 1.2**: Update Nginx upstream templates (`infrastructure/nginx/templates/default.conf.template` and `startupjigawa.conf`) to map `portal.startupjigawa.test` to port `3003` with dynamic DNS resolution (`resolver 127.0.0.11 valid=5s;`).
* [ ] **Task 1.3**: Verify local `/etc/hosts` contains the `portal.startupjigawa.test` entry pointing to `127.0.0.1`.

### Phase 2: Strict SSO Guard & MDA RBAC Middleware Implementation

* [ ] **Task 2.1**: Implement strict session interceptor middleware using `@startupjigawa/auth-client` to protect all routes under `portal.startupjigawa.test`.
* [ ] **Task 2.2**: Configure automatic redirection to `auth.startupjigawa.test/login` with an encrypted `sj_intent` cookie (`/dashboard` or requested path) when unauthenticated tokens are presented.
* [ ] **Task 2.3**: Build RBAC claim verification middleware inspecting JWT payload claims for role enforcement:
* `partner`: Restricted to assigned pilot documentation and general progress reports.
* `mda_official`: Elevated read/write access to state-level compliance reports and joint-venture data.
* `system_admin`: Full administrative oversight across all institutional vaults.


* [ ] **Task 2.4**: Implement structured 403 Forbidden handling with clean fallback error views for unauthorized role attempts.

### Phase 3: Secure Institutional Document Vault Service & Database Schema

* [ ] **Task 3.1**: Create database migrations and Prisma/SQL schemas for institutional documents, state MDA entity linkages, and audit logs.
* [ ] **Task 3.2**: Implement object-level and row-level Access Control Lists (ACLs) verifying that requesting entities only access authorized files.
* [ ] **Task 3.3**: Build secure, tokenized document streaming endpoints (avoiding raw static file exposure).
* [ ] **Task 3.4**: Integrate append-only immutable audit logging recording timestamps, user identity, action type, and request correlation IDs (`X-Request-ID`).

### Phase 4: Frontend UI, Unified Theming, and Header/Footer Integration

* [ ] **Task 4.1**: Integrate the monorepo's unified OS-aware theming engine (`sj_theme` cookie synchronization) into the portal layout.
* [ ] **Task 4.2**: Embed the inline anti-flicker head script to instantly inject `data-theme` attributes on `<html>` prior to DOM rendering.
* [ ] **Task 4.3**: Import and render the standardized ecosystem header (with auth state/avatar or sign-in CTA) and footer (RC 7256149, Dutse, Jigawa State registry details).
* [ ] **Task 4.4**: Build the responsive institutional dashboard view featuring document search, MDA secure upload drawers, and pilot program status badges.

### Phase 5: Automated Integration Test Suite & Verification

* [ ] **Task 5.1**: Create automated test assertions in `scripts/test-subdomains.js` verifying `portal.startupjigawa.test:3003` HTTP behavior.
* [ ] **Task 5.2**: Write unit tests verifying SSO redirection behavior for unauthenticated requests.
* [ ] **Task 5.3**: Write integration test cases validating role-based authorization (Partner vs. MDA Official vs. System Admin).
* [ ] **Task 5.4**: Execute full stack restart (`make restart`) and validation suite (`make test-routing`), confirming a 100% pass rate.






