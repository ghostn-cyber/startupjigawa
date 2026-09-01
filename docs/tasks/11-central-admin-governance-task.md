Milestone 11 Task Tracking Ledger (11-central-admin-governance-task.md)
Phase 1: Subdomain Routing & Gateway Parity
[ ] Task 1.1: Register admin.startupjigawa.test (Port 3007) in scripts/subdomain-server.js with highest-tier authentication and administrative role restrictions.

[ ] Task 1.2: Update Nginx upstream configuration templates to support low-latency proxying to the admin service.

Phase 2: Database Schema Expansion (Prisma)
[ ] Task 2.1: Implement database models for SystemAuditLog, FeatureFlag, GlobalRoleOverride, and AdminSession.

[ ] Task 2.2: Build robust in-memory fallback repositories to guarantee local test execution stability when database instances are offline.

Phase 3: Administrative Control Plane Backend
[ ] Task 3.1: Build backend controllers for user management, role elevation/revocation, and global feature flag toggling.

[ ] Task 3.2: Implement cross-service audit log aggregation endpoints collecting telemetry from all subdomains.

Phase 4: UI/UX, Smart Root Routing, & Theming
[ ] Task 4.1: Implement smart root routing on admin.startupjigawa.test (auto-redirecting authenticated system admins to /dashboard, else rendering an access-restricted landing gate).

[ ] Task 4.2: Embed the inline FOUC_HEAD_SCRIPT anti-flicker script for sj_theme cookie synchronization.

[ ] Task 4.3: Integrate shared header, footer, and the transparent 403 "Not Permitted" view for unauthorized access attempts.

[ ] Task 4.4: Build the administrative control dashboard featuring user search, role matrix management tables, and consolidated system health metrics.

Phase 5: Verification & Integration Testing
[ ] Task 5.1: Create automated integration assertions in scripts/test-admin-governance.js verifying admin privilege enforcement, audit log aggregation, and RBAC security.