# Milestone 12: Comprehensive Monorepo Database Seeding & Verification Engine (`12-database-seeder-task.md`)

**Entity:** Startup Jigawa Ltd (RC 7256149), Dutse, Jigawa State, Nigeria

**Service Target:** Monorepo Database Core (`packages/database`)

**Core Objective:** Implement a structured, idempotent, and production-like database seeding engine in Prisma to populate the PostgreSQL database with deterministic fixtures across all monorepo verticals (Identity, Subdomain RBAC, Project Tracker, Civic Emergency Grid, and AgriFinTech Escrow).

---

## Task Breakdown & Execution Checklist

### Phase 1: Prisma Seeding Foundation (`packages/database/prisma/seed.ts`)

* [ ] **Task 1.1**: Create `packages/database/prisma/seed.ts` configured with TypeScript and Prisma Client.
* [ ] **Task 1.2**: Implement safe, idempotent upsert strategies (`upsert` with unique keys) to prevent unique constraint collisions on repeated container restarts (`make seed`).

### Phase 2: Core Operational Fixtures

* [ ] **Task 2.1**: **Identity & Role Matrix**: Seed test accounts spanning every ecosystem privilege level (`system_admin`, `partner`, `mda_official`, `project_manager`, `student`, `farmer`, `citizen`) mapped to hashed passwords and wildcard sessions.
* [ ] **Task 2.2**: **Geographic & Administrative Boundaries**: Seed Jigawa State headquarters (Dutse) and core Local Government Areas (LGAs) with ward-level hierarchy.
* [ ] **Task 2.3**: **Project Tracker Pilots (`tracker.startupjigawa.test`)**: Seed real-world institutional pilots (*Jigawa Digital Literacy 3MTT*, *AgriFinTech Closed-Loop Escrow*, *Mutaru Mu Gyara Emergency Grid*) complete with RAG status indicators (`GREEN`, `AMBER`, `RED`), milestones, and KPI metrics.

### Phase 3: Build & Execution Integration

* [ ] **Task 3.1**: Configure Prisma seed command in `packages/database/package.json` (`"prisma": { "seed": "ts-node prisma/seed.ts" }`).
* [ ] **Task 3.2**: Add `make seed` or docker-compose execution shortcuts to trigger seeding post-migration.

### Phase 4: Documentation & Walkthrough (`walkthrough.md`)

* [ ] **Task 4.1**: Author a comprehensive walkthrough artifact detailing architecture, fixture schemas, execution instructions, and verification checks.
