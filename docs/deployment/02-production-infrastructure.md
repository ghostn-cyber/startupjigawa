```markdown
# Deployment: Production Infrastructure & CI/CD (`02-production-infrastructure.md`)

## 1. Overview & Objectives
This document establishes the production deployment, container orchestration, reverse proxy configuration, and CI/CD pipeline specifications for Startup Jigawa Ltd's enterprise web infrastructure (`www.startupjigawa.com`, `auth`, `academy`, `tracker`, `portal`, `civic`, `labs`, `products`, `admin`)[cite: 1]. The production architecture is designed for high availability, security hardening, auditability, and resilience under local infrastructure constraints in Northern Nigeria[cite: 1].

---

## 2. Reverse Proxy & Subdomain Routing (Nginx / Traefik)
Production traffic routing utilizes an SSL-terminating reverse proxy (Nginx or Traefik) configured to handle wildcard or explicit subdomain routing pointing to the internal Docker container ports:

```text
Client Request (HTTPS) 
       │
       ▼
[ Reverse Proxy / SSL Termination ] (Port 443 / 80)
       │
       ├─► auth.startupjigawa.com  ──► [http://127.0.0.1:4000](http://127.0.0.1:4000) (Auth Service)
       ├─► academy.startupjigawa.com ──► [http://127.0.0.1:3001](http://127.0.0.1:3001) (Academy)[cite: 1]
       ├─► tracker.startupjigawa.com ──► [http://127.0.0.1:3002](http://127.0.0.1:3002) (Tracker Engine)[cite: 1]
       ├─► portal.startupjigawa.com ──► [http://127.0.0.1:3003](http://127.0.0.1:3003) (Partner Portal)[cite: 1]
       ├─► civic.startupjigawa.com  ──► [http://127.0.0.1:3004](http://127.0.0.1:3004) (Civic Tech Lab)[cite: 1]
       ├─► labs.startupjigawa.com   ──► [http://127.0.0.1:3005](http://127.0.0.1:3005) (Climate & Idea Lab)[cite: 1]
       ├─► products.startupjigawa.com──► [http://127.0.0.1:3006](http://127.0.0.1:3006) (Product Showcase)[cite: 1]
       ├─► admin.startupjigawa.com   ──► [http://127.0.0.1:3007](http://127.0.0.1:3007) (Admin ERP & Vault)[cite: 1]
       └─► [www.startupjigawa.com](https://www.startupjigawa.com)   ──► [http://127.0.0.1:3000](http://127.0.0.1:3000) (Corporate Gateway)[cite: 1]

```

---

## 3. Production Environment Variables (`.env.production`)

Production deployments require strict secrets management. Ensure sensitive parameters are injected via secure environment variable vaults:

```env
# Node & Environment Mode
NODE_ENV=production

# Database & Cache (Production Instances)
DATABASE_URL=postgresql://jigawa_prod_user:${SECURE_DB_PASSWORD}@prod-db-cluster:5432/startup_jigawa_production
REDIS_URL=rediss://:${SECURE_REDIS_PASSWORD}@prod-redis-cluster:6379

# JWT & Session Secrets (Cryptographically Generated)
JWT_SECRET=${PROD_JWT_SECRET}
JWT_REFRESH_SECRET=${PROD_JWT_REFRESH_SECRET}

# Base Production Domain
BASE_DOMAIN=startupjigawa.com

```

---

## 4. CI/CD Pipeline Workflow (GitHub Actions)

Automated deployments are managed via GitHub Actions workflows (`.github/workflows/deploy.yml`), ensuring continuous integration and zero-downtime rolling updates:

1. **Trigger:** Push or Pull Request merge into the `main` branch.
2. **Build & Test Stage:**
* Installs pnpm workspace dependencies.
* Executes TypeScript type-checking and automated unit/integration tests across shared packages and apps.


3. **Containerization Stage:**
* Builds optimized Docker images for each subdomain service using multi-stage Dockerfiles.
* Pushes tagged images to the private container registry.


4. **Deployment Stage:**
* Connects securely to the production server via SSH.
* Pulls latest container images, runs automated Prisma database migrations, and performs rolling container restarts via Docker Compose.



---

## 5. Security Hardening, Backups & Safeguarding

* **Automated Backups:** Daily encrypted snapshots of the PostgreSQL database and Redis session state are automatically backed up to secure offsite cloud storage.
* **Firewall & IP Whitelisting:** Administrative endpoints (`admin.startupjigawa.com`) enforce strict IP whitelisting and mandatory multi-factor authentication (MFA).


* **Compliance & Audit Logging:** Immutable audit trails are maintained for all database transactions and user privilege escalations, satisfying institutional governance and due-diligence requirements.

## 6. Production Technology Mandate

The following production technology specifications are mandatory and enforced across CI/CD and runtime environments:

- **Language & Runtime:** TypeScript on Node.js v18+ for all services and packages.
- **Backend & Identity:** Express or NestJS-based services; centralized OIDC/SAML IdP at `auth.startupjigawa.com` with USSD/SMS OTP fallback; Redis v7 for token revocation and session storage.
- **Frontend:** Next.js (React) with Tailwind CSS and PWA caching enabled.
- **Database & ORM:** PostgreSQL v15 with Prisma ORM; production migrations executed via CI with review gates.
- **Caching & Rate-Limiting:** Redis v7 for rate limits, ephemeral token state, and session caching.
- **Containers & Reverse Proxy:** Docker images built via multi-stage Dockerfiles; deploy via Docker Compose or CI-managed container runtime with Nginx as SSL-terminating reverse proxy.

All production environment values must be injected via secure vaults and not committed to the repository. Any divergence from this mandate requires documented executive approval.
