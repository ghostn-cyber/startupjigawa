# Startup Jigawa Ltd - Monorepo Infrastructure

Enterprise-grade digital infrastructure and microservices monorepo for **Startup Jigawa Ltd (RC 7256149)**, located in Dutse, Jigawa State, Nigeria. This repository powers the organization's comprehensive web ecosystem spanning digital skills training, institutional capacity building, civic technology, and entrepreneurship development.

---

## 🏛️ Institutional Overview

Startup Jigawa is a digital innovation, civic technology, and research company with 9 years of operational history across Northern Nigeria. This infrastructure repository provides the unified technological foundation supporting:
* **Digital Skills Academy & Talent Tracking:** Managing diploma pathways and tracking over 50,000+ trained beneficiaries.
* **Partner Onboarding & Portals:** Secure digital collaboration with state MDAs, federal agencies (NITDA, 3MTT, NJFP), and international partners (JICA).
* **Civic Technology & Open Government:** Supporting OGP Jigawa transparency initiatives, citizen feedback platforms, and open data visualization.
* **Climate & Innovation Labs:** AgriTech advisory, flood-risk mapping, and product incubation (*RentHouse*, *SoftDeliver*, *PrepAI*, *Yankasuwa*)[cite: 1].

---

## 📂 Repository Structure

The project is structured as a pnpm monorepo consisting of core services, individual subdomain applications, shared packages, and architectural documentation:

```text
startup-jigawa-infrastructure/
├── apps/
│   ├── web-corporate/          # Corporate gateway ([www.startupjigawa.com](https://www.startupjigawa.com))[cite: 1]
│   ├── auth-service/           # Centralized Identity & SSO (auth.startupjigawa.com)
│   ├── academy/                # Digital Skills Academy (academy.startupjigawa.com)
│   ├── tracker/                # Beneficiary & M&E Engine (tracker.startupjigawa.com)[cite: 1]
│   ├── partner-portal/         # Partner Onboarding Portal (portal.startupjigawa.com)
│   ├── civic-tech/             # OGP & Governance Lab (civic.startupjigawa.com)[cite: 1]
│   ├── climate-labs/           # Climate & AgriTech Lab (labs.startupjigawa.com)[cite: 1]
│   ├── product-showcase/       # Product Directory (products.startupjigawa.com)[cite: 1]
│   └── admin-erp/              # Central ERP & Compliance Vault (admin.startupjigawa.com)
├── packages/
│   ├── ui-components/          # Shared design system (Tailwind CSS)
│   ├── auth-client/            # Shared OIDC/OAuth2 authentication hooks
│   ├── database/               # Prisma ORM schemas and shared migrations
│   └── typescript-config/      # Shared TypeScript configuration
└── docs/                       # Comprehensive system documentation

**Locked Technology Stack**

| Area | Standard (Locked) |
| :--- | :--- |
| Language & Runtime | TypeScript (Node.js v18+) |
| Backend & Identity | Express or NestJS powering centralized OIDC/SAML IdP at `auth.startupjigawa.com` with USSD/SMS OTP fallback[cite: 1] |
| Frontend | Next.js (React) with Tailwind CSS and PWA caching for low-bandwidth environments[cite: 1] |
| Database & ORM | PostgreSQL v15 managed via Prisma ORM (type-safe schemas, migrations, audit logging) |
| Caching & Sessions | Redis v7 for session storage, rate limiting, ephemeral token revocation |
| Infrastructure | Docker, Docker Compose, Nginx reverse proxy; local `.test` and production `.com` domains[cite: 1] |

⚙️ Prerequisites
Ensure you have the following installed on your development machine:

Node.js (v18.x or higher)

pnpm (v8.x or higher)

Docker & Docker Compose (for local containerized databases and services)

🚀 Quick Start & Local Development
Clone the Repository & Navigate to Workspace:

Bash
git clone [https://github.com/startupjigawa/infrastructure.git](https://github.com/startupjigawa/infrastructure.git)
startup-jigawa-infrastructure
Configure Environment Variables:
Copy the example environment template and adjust values as needed:

Bash
cp .env.example .env
Spin up Core Infrastructure (PostgreSQL & Redis):

Bash
docker-compose up -d
Install Dependencies:

Bash
pnpm install
Run Database Migrations:

Bash
pnpm --filter @startupjigawa/database db:migrate
Start Development Servers:

Bash
pnpm dev
🛡️ Security & Safeguarding Principles
In accordance with Startup Jigawa's operational standards, this infrastructure enforces:

Data Protection & Privacy: Strict PII anonymization, explicit user consent workflows, and compliance with institutional safeguarding policies[cite: 1].

Low-Bandwidth & Offline Resilience: Progressive Web App (PWA) assets and USSD/SMS token fallback options to accommodate rural connectivity constraints in Jigawa State[cite: 1].

Non-Partisanship & Auditability: Immutable audit logs across all administrative and civic modules to maintain institutional credibility[cite: 1].

📄 License & Contact
Corporate Entity: Startup Jigawa Ltd (RC 7256149)[cite: 1]

Operating Address: 97 Nasiriyya House, Along Nuhu Muhammad Sunusi Road, Dutse, Jigawa State, Nigeria[cite: 1]

Email: info@startupjigawa.com[cite: 1]

Website: www.startupjigawa.com[cite: 1]