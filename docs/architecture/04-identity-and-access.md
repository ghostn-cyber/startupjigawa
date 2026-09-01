# Architecture: Identity, Access Management & SIWES Federation (`02-identity-and-access.md`)

## 1. Overview & Architectural Objectives
The centralized identity management service (`auth.startupjigawa.com`) acts as the single source of truth for user authentication, authorization, session management, and Role-Based Access Control (RBAC) across Startup Jigawa Ltd's digital infrastructure[cite: 1]. 

To support institutional capacity building—including the formal facilitation of the **Students Industrial Work Experience Scheme (SIWES)** for university and polytechnic undergraduates alongside regular diploma trainees, rural smallholder farmers, and state/federal partners (NITDA, JICA, OGP Jigawa)—the authentication architecture implements secure, federated trust and low-bandwidth session handling[cite: 1].

---

## 2. Core Protocols & Standards
* **OpenID Connect (OIDC) & OAuth 2.0:** Foundational protocols used by all monorepo applications (`academy`, `tracker`, `portal`, `civic-tech`, `climate-labs`, `product-showcase`, `admin-erp`) to delegate authentication and issue scoped JSON Web Tokens (JWT).
* **SAML 2.0 Federation:** Implemented for government MDAs, tertiary institutions, and enterprise partners, enabling institutional single sign-on (SSO).
* **Token Lifecycle:** Short-lived access tokens (15-minute expiration) paired with secure, httpOnly, same-site refresh tokens managed via Redis.

---

## 3. Comprehensive Role-Based Access Control (RBAC) Matrix

| User Role | Assigned Scope / Permissions | Primary Subdomain Access |
| :--- | :--- | :--- |
| **Public / Citizen** | Unauthenticated or basic profile; access to public reports, product showcases, and public civic feedback tools[cite: 1]. | `www`, `products`, `civic`[cite: 1] |
| **SIWES Industrial Trainee** | Access to structured industrial attachment modules, digital logbooks, task submissions, institutional letter uploads, and interim supervisor reviews. | `academy`, `tracker`[cite: 1] |
| **Standard Trainee / Student** | Access to enrolled diploma courses, learning modules, assignment uploads, and personal progress records[cite: 1]. | `academy`[cite: 1] |
| **Field Enumerator / Trainer** | Data collection permissions, offline survey synchronization, and local training attendance logs[cite: 1]. | `tracker`, `academy`[cite: 1] |
| **Institutional Partner / MDA** | Review of co-delivery metrics, joint-venture document vaults, and partnership engagement workflows[cite: 1]. | `portal`[cite: 1] |
| **System Administrator / M&E** | Full access to central ERP ledgers, user role provisioning, safeguarding compliance vaults, and audit logs[cite: 1]. | `admin`, `tracker`[cite: 1] |

---

## 4. SIWES Integration & Verification Architecture
To streamline industrial attachment onboarding and institutional reporting:
* **Institutional Letter Verification:** The SIWES onboarding flow at `auth.startupjigawa.com` mandates the upload of scanned institutional endorsement letters, validating student credentials against accredited polytechnic and university registries before generating scoped access tokens.
* **Digital Logbook & Telemetry:** SIWES participants interact with `academy.startupjigawa.com` and `tracker.startupjigawa.com` to record weekly technical milestones, which are automatically aggregated for institutional assessment reports required by higher education bodies[cite: 1].
* **Low-Bandwidth & Offline Resilience:** Incorporates SMS/USSD OTP fallbacks and PWA session caching to ensure participants operating under Jigawa State's rural connectivity constraints maintain uninterrupted access to their training modules and attendance logs[cite: 1].