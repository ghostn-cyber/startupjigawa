# Milestone Task File: `01-architecture-database-provisioning-task.md`

## Milestone 1: Architecture & Database Provisioning (`auth.startupjigawa.com`)
* **Associated Entity:** Startup Jigawa Ltd (RC 7256149), Dutse, Jigawa State, Nigeria[cite: 1].
* **Phase Objective:** Initialize the TypeScript/Node.js microservice workspace under `apps/auth-service`, configure robust Prisma ORM database models for multi-tenant users, institutional roles, and ephemeral sessions in PostgreSQL (v15), and establish high-performance Redis (v7) session storage and rate-limiting infrastructure.

---

## Task Breakdown & Action Items

### Task 1.1: Service Workspace Initialization (`apps/auth-service`)
* [x] **Initialize App Structure:**
  * Create standard service directories within `apps/auth-service/src/`: `config/`, `controllers/`, `models/`, `routes/`, and `services/`.
* [x] **Package & Dependencies Setup:**
  * Configure `apps/auth-service/package.json` with required dependencies: `express`, `cors`, `helmet`, `dotenv`, `ioredis`, and `@prisma/client`.
  * Configure TypeScript (`tsconfig.json`) extending the shared workspace configuration (`packages/typescript-config`).
* [x] **Service Entry Point:**
  * Implement `src/index.ts` to bootstrap the Express server, apply global security headers via Helmet, configure CORS policies for permitted subdomains (`academy`, `tracker`, `portal`, `civic`, etc.)[cite: 1], and mount health-check endpoints.

### Task 1.2: Relational Database Schema Design (`packages/database`)
* [ ] **Prisma Schema Configuration:**
  * Establish the Prisma schema file within `packages/database/prisma/schema.prisma` connected to the PostgreSQL database instance.
* [ ] **User & Tenant Models:**
  * Define the `User` model supporting unique identifiers, hashed credentials, email/phone verification states, and metadata fields.
  * Define the `Role` and `Permission` models to support granular RBAC (including Public, SIWES Industrial Trainee, Student, Trainer, MDA Partner, and Admin)[cite: 1].
* [ ] **Identity Federation & Session Models:**
  * Create relational models for `IdentityProvider` (OIDC/SAML clients), `Session`, and `AuditLog` to record security transactions and administrative events[cite: 1].
* [ ] **Migration Execution:**
  * Run initial database migrations (`pnpm --filter @startupjigawa/database db:migrate`) and verify relational integrity against PostgreSQL v15.

> Implementation has been written for the schema and migration assets, but full Prisma migration verification is currently blocked by the environment's package registry access (`403` from npmjs.org), so the migration step remains pending live validation.

### Task 1.3: Redis Session & Rate-Limiting Configuration
* [x] **Redis Client Integration:**
  * Implement a robust Redis connection utility (`src/config/redis.ts`) utilizing `ioredis` for fast session lookup and token blacklisting.
* [x] **Rate Limiting Middleware:**
  * Build IP-based and identifier-based rate-limiting middleware to protect authentication, login, and OTP verification endpoints against brute-force attacks and credential stuffing.
* [x] **Ephemeral Session Store:**
  * Configure sliding expiration windows and TTL (Time-To-Live) rules for short-lived access tokens and refresh token pairs stored in Redis.

> The code for this task is in place. Live validation is still pending package-registry access for the workspace dependencies required to run the auth-service build and Redis smoke checks.

### Task 1.4: Environment & Docker Containerization
* [x] **Environment Template (`.env.example`):**
  * Define required environment variables including `PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `BASE_DOMAIN` (supporting `.test` for local development and `.com` for production)[cite: 1].
* [x] **Dockerfile Optimization:**
  * Author a multi-stage `apps/auth-service/Dockerfile` optimized for building and running the TypeScript service in production containers.
* [x] **Docker Compose Orchestration:**
  * Verify container health checks, network bridges (`startup-jigawa-net`), and volume persistence for PostgreSQL and Redis within `docker-compose.yml`.

> Implementation for the environment and container configuration is complete in code. Final runtime verification remains blocked by the same workspace package-registry access issue preventing dependency installation and build execution.

### Task 1.5: Verification & Health Checks
* [x] **Health Endpoint Implementation:**
  * Create `GET /health` to verify active connections to PostgreSQL and Redis.
* [x] **Automated Smoke Testing:**
  * Write initial integration tests to validate database read/write operations, Redis session caching, and middleware rate limiting.

> The health and smoke-test scaffolding is in place. Full end-to-end runtime verification remains blocked by the environment's package installation restrictions preventing dependency installation and the actual Prisma/Redis test execution.

---

## Milestone 1 Completion & Sign-Off Criteria
* **Code Quality:** Zero TypeScript compilation errors across `apps/auth-service` and shared packages.
* **Database Readiness:** Prisma schema successfully migrated with zero relational constraint violations.
* **Infrastructure Health:** Docker containers (`jigawa_postgres`, `jigawa_redis`, and `auth-service`) running and passing internal health checks.

**Status:** Incomplete — full verification blocked. Current workspace package-registry access is failing (HTTP 403) and the `apps/auth-service` TypeScript build could not be completed, preventing runtime and migration verification.