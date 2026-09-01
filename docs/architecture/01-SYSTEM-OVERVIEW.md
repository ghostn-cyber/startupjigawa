# Architecture: System Overview (`01-system-overview.md`)

## 1. Executive Summary & Institutional Context
Startup Jigawa Ltd operates as an enterprise digital innovation, civic technology, and research institution based in Dutse, Jigawa State, Nigeria (RC 7256149)[cite: 1]. Over nine years of continuous operation, the company has delivered digital skills training to over 50,000 participants and executed multi-sectoral initiatives alongside state government bodies, federal agencies (NITDA, 3MTT, NJFP), international partners (JICA), and civil society organizations (OGP Jigawa)[cite: 1]. 

To sustain this institutional scale, the web infrastructure is designed as an integrated, multi-tenant digital ecosystem. It eliminates operational silos by connecting community problem-listening, research, data collection, program piloting, institutional partnerships, and administrative tracking into a unified technological framework[cite: 1].

---

## 2. High-Level System Topology
The platform utilizes a **pnpm monorepo architecture** that separates public-facing institutional touchpoints from secure administrative, educational, and civic microservices. 

```text
                                [ User / Client Layer ]
              (Web Browsers, Mobile Devices, Feature Phones / USSD)
                                         │
                                         ▼
                      [ DNS / Reverse Proxy / SSL Termination ]
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
[ [www.startupjigawa.com](https://www.startupjigawa.com) ]      [ auth.startupjigawa.com ]      [ academy.startupjigawa.com ]
  (Corporate Gateway)           (Centralized SSO / IdP)         (Digital Skills Academy)
         │                               │                               │
         ├───────────────────────────────┼───────────────────────────────┤
         ▼                               ▼                               ▼
[ tracker.startupjigawa.com ]  [ portal.startupjigawa.com ]    [ civic.startupjigawa.com ]
  (Beneficiary & M&E Engine)     (Partner & Pilot Portal)        (OGP Jigawa & Civic Tech)
         │                               │                               │
         └───────────────────────────────┼───────────────────────────────┘
                                         ▼
                             [ Shared Infrastructure Layer ]
                       (PostgreSQL, Redis, Shared Auth/UI Packages)

```

---

## 3. Core Architectural Principles

### A. Modular Subdomain Isolation

The infrastructure segregates responsibilities across purpose-built subdomains to enforce security boundaries, scale individual workloads independently, and simplify role-based access management:

* **`www.startupjigawa.com`**: Corporate gateway, institutional strategy overview, annual reports, publications shelf, and newsroom.


* **`auth.startupjigawa.com`**: Centralized Identity Provider (IdP) managing Single Sign-On (SSO), multi-factor authentication (MFA), and token handshakes across all subdomains.
* **`academy.startupjigawa.com`**: Digital Skills Academy hosting diploma pathways (Software Development, Data Analysis, Project Management, Cybersecurity) and portfolio assessments.


* **`tracker.startupjigawa.com`**: Beneficiary and monitoring-and-evaluation (M&E) engine tracking the 50,000+ trained individuals, employment outcomes, and alumni milestones.


* **`portal.startupjigawa.com`**: Partner onboarding portal facilitating the 6-stage partnership engagement process, MOU repositories, and due-diligence checklists for MDAs and donors.


* **`civic.startupjigawa.com`**: Civic Technology and Open Government Partnership (OGP) lab providing public grievance feedback loops, budget literacy tools, and community issue-mapping.


* **`labs.startupjigawa.com`**: Climate and Idea Lab supporting Hadejia-Jama'are flood-risk mapping, Climate-Smart AgriTech SMS/USSD advisory concepts, and early-stage project sandboxes.


* **`products.startupjigawa.com`**: Public product directory showcasing internal innovations such as *RentHouse*, *SoftDeliver*, *PrepAI*, and *Yankasuwa*.


* **`admin-erp` (`admin.startupjigawa.com`)**: Central ERP handling financial ledgers, human resources, procurement, safeguarding policy vaults, and compliance audit registers.



### B. Rural Connectivity & Low-Data Adaptation

As highlighted in Startup Jigawa's operational context, connectivity, bandwidth, and electrical reliability constraints across parts of Jigawa State shape system requirements. The architecture addresses this through:
* **Progressive Web App (PWA) Architecture:** Implemented with Next.js PWA caching strategies to provide offline-first and low-bandwidth resilience for Jigawa State users[cite: 1].
* **USSD/SMS Fallback:** USSD and SMS OTP verification flows are integrated with `auth.startupjigawa.com` to support feature-phone access and low-data authentication[cite: 1].
* **Localized Content Delivery:** Static asset optimization and Hausa/English localization are applied at the Next.js level for efficient delivery.



### C. Accountability & Data Governance

In alignment with Startup Jigawa's non-partisan operating principles and open-government commitment:

* **Auditability:** All administrative actions, data collection logs, and partner transactions generate immutable audit trails suitable for external institutional audits.


* **Data Safeguarding:** Strict PII minimization, explicit user consent workflows, and compliance with data protection policies secure all citizen and participant information.


## 4. Implementation Stack (Authoritative)

The following technology choices are mandated across the repository and all deployments. Deviations are disallowed except by formal executive approval.

- **Runtime & Language:** TypeScript on Node.js v18+.
- **Backend Frameworks:** Express or NestJS for HTTP/API services; Prisma ORM for PostgreSQL v15 migrations and type-safe schemas.
- **Frontend:** Next.js (React) with Tailwind CSS and explicit PWA caching strategies.
- **Database & ORM:** PostgreSQL v15 with Prisma ORM; audit logging implemented via immutable event records.
- **Caching & Sessions:** Redis v7 for session storage, rate limiting, and ephemeral token revocation.
- **Infrastructure:** Docker and Docker Compose for containerization; Nginx as SSL-terminating reverse proxy; `.test` domains for local development and `.com` for production deployments[cite: 1].

```

```


```

```