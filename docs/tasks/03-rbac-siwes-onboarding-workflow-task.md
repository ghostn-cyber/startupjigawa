# Milestone Task File: `03-rbac-siwes-onboarding-workflow-task.md`

## Milestone 3: RBAC Matrix & SIWES Onboarding Workflow (`auth.startupjigawa.com`)
* **Associated Entity:** Startup Jigawa Ltd (RC 7256149), Dutse, Jigawa State, Nigeria[cite: 1].
* **Phase Objective:** Enforce fine-grained Role-Based Access Control (RBAC) across all monorepo subdomains and implement specialized onboarding pipelines for **Students Industrial Work Experience Scheme (SIWES)** industrial trainees, including institutional letter verification and digital logbook token scoping[cite: 1].

---

## Task Breakdown & Action Items

### Task 3.1: Granular RBAC Permission Engine
* [x] **Permission Schema & Mapping:**
  * Define explicit permission strings within `packages/database` and `apps/auth-service` mapped to user roles (Public, SIWES Industrial Trainee, Standard Trainee, Field Enumerator, Institutional Partner/MDA, System Administrator)[cite: 1].
* [x] **RBAC Enforcement Middleware:**
  * Develop Express middleware (`apps/auth-service/src/middleware/rbac.ts`) to evaluate user role claims embedded in JWT access tokens against requested subdomain routes (`academy`, `tracker`, `portal`, `admin`, etc.)[cite: 1].

### Task 3.2: Specialized SIWES Industrial Attachment Onboarding
* [x] **SIWES Registration Endpoint (`POST /api/v1/auth/siwes/register`):**
  * Create dedicated ingestion routes capturing student particulars, tertiary institution name, course of study, matriculation number, and industrial attachment duration.
* [x] **Institutional Letter Upload & Storage:**
  * Implement secure file upload handlers for scanned official university/polytechnic SIWES endorsement letters, storing encrypted assets in compliance with data protection safeguarding policies[cite: 1].

### Task 3.3: Administrative Verification Queue
* [x] **Verification Workflow Management:**
  * Build backend controller logic allowing administrative staff via `admin.startupjigawa.com` to review, approve, or reject pending SIWES institutional endorsement letters[cite: 1].
* [x] **Automated Credential Provisioning:**
  * Upon administrative approval, automatically provision the `SIWES Industrial Trainee` role, generate scoped access tokens, and dispatch confirmation notifications.

### Task 3.4: Logbook & Progress Scoping Integration
* [x] **Scoped Token Claims for SIWES:**
  * Configure OIDC token issuer to inject specialized SIWES metadata into JWT claims, enabling seamless data synchronization with `academy.startupjigawa.com` and `tracker.startupjigawa.com`[cite: 1].
* [x] **Digital Logbook Interfacing:**
  * Ensure SIWES participants have authorized access to digital logbook tracking endpoints to record weekly technical competencies required by higher education institutions[cite: 1].

### Task 3.5: Testing & Verification Suite
* [x] **Authorization Unit Tests:**
  * Write automated tests verifying that unauthorized roles are blocked from accessing administrative or partner-only endpoints.
* [x] **SIWES Workflow Simulation:**
  * Simulate the full SIWES onboarding lifecycle from initial letter submission to administrative approval and token scoping.

---

## Milestone 3 Completion & Sign-Off Criteria
* **RBAC Integrity:** Middleware successfully enforces strict access barriers across all nine subdomain routes based on JWT role claims.
* **SIWES Pipeline Operational:** Complete verification of document uploads, administrative approval queues, and specialized student role provisioning.

**Status:** Pending verification — full end-to-end simulation and automated tests blocked by workspace package-registry access (HTTP 403) and inability to complete local builds and test execution.