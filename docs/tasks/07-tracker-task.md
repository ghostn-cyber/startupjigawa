Here is the dedicated Task Tracking Ledger (`07-project-tracker-task.md`) and implementation specification for the International Standard Project Tracker (`tracker.startupjigawa.test`), specifically configured with **Smart Root Routing** to automatically display the dashboard when an active session is detected.

---

# Milestone 7 Task Tracking Ledger: Project Tracker (`07-project-tracker-task.md`)

**Entity:** Startup Jigawa Ltd (RC 7256149), Dutse, Jigawa State, Nigeria

**Service Target:** `tracker.startupjigawa.test` (Port 3002)

**Status:** Ready for Execution

---

## Task Breakdown & Execution Checklist

### Phase 1: Gateway Routing & Subdomain Registration

* [ ] **Task 1.1**: Register `tracker` (Port `3002`) in `scripts/subdomain-server.js` within the unified subdomain routing map.
* [ ] **Task 1.2**: Update Nginx upstream templates (`infrastructure/nginx/templates/default.conf.template` and `startupjigawa.conf`) to proxy `tracker.startupjigawa.test` securely with dynamic DNS resolution.

### Phase 2: Database Schema & Prisma Models (`packages/database`)

* [ ] **Task 2.1**: Implement the `Project` model (title, slug, sector, RAG status: `GREEN`, `AMBER`, `RED`, visibility: `PUBLIC`, `INTERNAL`).
* [ ] **Task 2.2**: Implement the `Milestone` model (linked to project, status: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `DELAYED`).
* [ ] **Task 2.3**: Implement `KPIMetric` and `ProjectUpdate` models for quantitative tracking and operational logging.
* [ ] **Task 2.4**: Build robust in-memory fallback repositories to guarantee local offline test stability.

### Phase 3: Smart Root Routing & Transparent RBAC Guard

* [ ] **Task 3.1**: Implement **Smart Root Routing (`GET /`)**:
* Inspect incoming `sj_token` cookie.
* **If an active, valid session with a permitted role** (`stakeholder`, `partner`, `project_manager`, `system_admin`) is detected, **automatically render/redirect to `/dashboard**`.
* **If unauthenticated**, render the high-trust public transparency landing page.


* [ ] **Task 3.2**: Secure protected paths (`/dashboard`, `/manage`) with strict SSO verification (`@startupjigawa/auth-client`).
* [ ] **Task 3.3**: Configure unauthorized role attempts to render the standardized **403 "Not Permitted" View** displaying user telemetry, current roles vs. required roles, and recovery actions.

### Phase 4: UI/UX, Theming, and Header/Footer Integration

* [ ] **Task 4.1**: Embed the inline `FOUC_HEAD_SCRIPT` anti-flicker script reading the `sj_theme` cookie (`dark`, `light`, or `system`).
* [ ] **Task 4.2**: Import and render the standardized ecosystem Header and Footer (displaying RC 7256149, Dutse, Jigawa State registry details).
* [ ] **Task 4.3**: Build the international-standard Project Tracker dashboard featuring RAG status badges, timeline progress bars, and vital KPI metric cards.

### Phase 5: Automated Integration Verification

* [ ] **Task 5.1**: Create automated HTTP test assertions in `scripts/test-tracker-integration.js` verifying smart root session redirection, 403 enforcement, and dashboard accessibility