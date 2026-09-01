# Architecture: Data Governance and Safeguarding (`03-data-and-safeguarding.md`)

## 1. Overview & Data Philosophy
Startup Jigawa Ltd treats data governance, privacy, and participant safeguarding as core operational foundations rather than secondary considerations[cite: 1]. Because the infrastructure handles sensitive information—including beneficiary profiles for over 50,000 trained individuals[cite: 1], civic feedback, agricultural records, and institutional partnership documents[cite: 1]—the platform enforces strict data protection, anonymization, and transparency protocols.

---

## 2. Core Database Schema & Relational Structure (`packages/database`)
The shared PostgreSQL database managed via Prisma ORM is architected around normalized schema invariants to isolate operational domains while maintaining referential integrity across subdomains:

* **Users & Identities (`auth-service`):** Stores core user credentials, authentication provider links (OIDC/SAML), multi-factor authentication states, and global role assignments.
* **Beneficiaries & Trainees (`tracker` & `academy`):** Links authenticated user IDs to program cohorts, diploma pathway progress[cite: 1], employment outcomes[cite: 1], and certification registries.
* **Partnerships & Portals (`portal-service`):** Manages institutional partner profiles (State MDAs, NITDA, JICA, OGP Jigawa)[cite: 1], Memorandum of Understanding (MOU) metadata, and 6-stage onboarding workflows[cite: 1].
* **Civic Feedback & Grievances (`civic-tech`):** Stores citizen-reported issues, community mapping coordinates, and open-government feedback logs[cite: 1].
* **Audit & Compliance Logs (`admin-erp`):** Immutable event logs capturing administrative overrides, access control changes, data exports, and safeguarding incident reports[cite: 1].

---

## 3. Privacy-by-Design & PII Protection
To safeguard participant data across rural and urban outreach programs:
* **Minimization:** Data collection is strictly limited to what is operationally necessary for training delivery, institutional reporting, or civic engagement[cite: 1].
* **Pseudonymization:** Personally Identifiable Information (PII) collected during field surveys, climate-risk mapping[cite: 1], or civic consultations is decoupled from analytical datasets used by the Research, Policy & Civic Data Lab[cite: 1].
* **Explicit Consent Capture:** Registration workflows across all subdomains enforce explicit, timestamped consent checkpoints aligned with Section 26 data protection safeguarding policies[cite: 1].

---

## 4. Auditability & Institutional Transparency
In accordance with Startup Jigawa's non-partisan operating principles and open-government commitments[cite: 1]:
* **Immutable Logs:** All database modifications affecting financial ledgers, partner agreements, or beneficiary certification statuses generate cryptographically verifiable audit records.
* **Donor & Government Verification:** Data-sharing interfaces are provisioned with role-based restrictions to facilitate independent institutional audits, M&E evaluations, and due-diligence verifications without exposing underlying sensitive PII[cite: 1].

## 5. Implementation & Operational Mandates

All data governance and safeguarding implementations adhere to the locked technology stack and are enforced as institutional standards:

- **Runtime & Language:** TypeScript on Node.js v18+ across all services.
- **Persistence:** PostgreSQL v15 managed via Prisma ORM; audit records are stored as append-only event tables with integrity checks.
- **Session & Ephemeral State:** Redis v7 handles session storage, ephemeral tokens, and rate-limiting counters.
- **Backups & Retention:** Encrypted, automated backups of PostgreSQL and Redis are retained according to institutional retention schedules; backups are stored in secure offsite vaults.
- **Access Controls:** RBAC enforced via OIDC claims; sensitive export and data extraction operations require dual-authorisation and generated audit tickets.

Any implementation changes to data or safeguarding controls require documented executive approval and a signed change request recorded in the `admin-erp` compliance vault.