Milestone 9 Task Tracking Ledger (09-sj-cloud-control-plane-task.md)
Phase 1: Subdomain Routing & Gateway Parity
[ ] Task 1.1: Register cloud.startupjigawa.test (Port 3005) in scripts/subdomain-server.js with strict administrative authentication guards.

[ ] Task 1.2: Update Nginx upstream templates to support low-latency proxying to the cloud control plane service.

Phase 2: Telemetry Service & Docker API Integration
[ ] Task 2.1: Implement backend telemetry collectors interfacing with Docker socket or container health endpoints to pull live CPU, memory, and container status metrics.

[ ] Task 2.2: Build database health checkers monitoring Prisma/PostgreSQL connection states and volume usage.

Phase 3: UI/UX, Smart Root Routing, & Glassmorphic Design
[ ] Task 3.1: Implement smart root routing on cloud.startupjigawa.test (auto-redirecting authenticated infrastructure engineers to /dashboard, else rendering the public cloud status portal).

[ ] Task 3.2: Embed the inline FOUC_HEAD_SCRIPT anti-flicker script for sj_theme cookie synchronization.

[ ] Task 3.3: Integrate shared header, footer, and the transparent 403 "Not Permitted" view for unauthorized access attempts.

[ ] Task 3.4: Build the glassmorphic cloud control plane UI featuring live service status cards, CPU/Memory gauges, and routing logs.

Phase 4: Verification & Integration Testing
[ ] Task 4.1: Create automated integration assertions in scripts/test-cloud-control-plane.js verifying telemetry endpoints, RBAC enforcement, and routing health.