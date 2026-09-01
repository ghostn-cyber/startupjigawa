# Architecture: Identity and Access Management (`02-identity-and-access.md`)

## 1. Overview & Objectives
The centralized identity management service (`auth.startupjigawa.com`) acts as the single source of truth for user authentication, authorization, session management, and role-based access control (RBAC) across Startup Jigawa Ltd's digital infrastructure. 

Given the institutional diversity of platform users—ranging from grassroots trainees and rural smallholder farmers to state government officials, federal agency partners (NITDA, 3MTT), and internal administrators[cite: 1]—the authentication architecture is designed for security, federated trust, and low-bandwidth resilience[cite: 1].

---

## 2. Core Protocols & Standards
* **OpenID Connect (OIDC) & OAuth 2.0:** Mandated authentication protocol for all internal applications; JWTs are issued by the centralized IdP at `auth.startupjigawa.com`.
* **SAML 2.0 Federation:** Supported for government MDAs and institutional partners requiring enterprise federation[cite: 1].
* **Token Lifecycle:** Short-lived access tokens (15-minute expiration) with httpOnly, same-site refresh tokens; refresh and revocation state persist in Redis v7.

---

## 3. Role-Based Access Control (RBAC) Matrix

| User Role | Assigned Scope / Permissions | Primary Subdomain Access |
| :--- | :--- | :--- |
| **Public / Citizen** | Unauthenticated or basic profile; access to public reports, product showcases, and public civic feedback tools[cite: 1]. | `www`, `products`, `civic`[cite: 1] |
| **Trainee / Student** | Access to enrolled diploma courses, learning modules, assignment uploads, and personal progress records[cite: 1]. | `academy`[cite: 1] |
| **Field Enumerator / Trainer** | Data collection permissions, offline survey synchronization, and local training attendance logs[cite: 1]. | `tracker`, `academy`[cite: 1] |
| **Institutional Partner / MDA** | Review of co-delivery metrics, joint-venture document vaults, and partnership engagement workflows[cite: 1]. | `portal`[cite: 1] |
| **System Administrator / M&E** | Full access to central ERP ledgers, user role provisioning, safeguarding compliance vaults, and audit logs[cite: 1]. | `admin`, `tracker`[cite: 1] |

---

## 4. Low-Bandwidth & Offline-First Authentication Strategies
To support users in rural areas of Jigawa State who experience connectivity and infrastructure constraints[cite: 1]:
* **USSD/SMS OTP Token Fallback:** For beneficiaries and field workers operating on feature phones or low-data environments, `auth.startupjigawa.com` provides an alternative verification gateway via lightweight USSD/SMS session handlers.
* **PWA Session Caching:** Encrypted token caching enables offline interaction with learning materials and data-collection tools, synchronizing automatically when connectivity is re-established.
* **Explicit Consent Workflows:** Initial registration mandates explicit data protection consent checkpoints, satisfying institutional safeguarding and privacy mandates[cite: 1].
* **USSD/SMS OTP Token Fallback:** `auth.startupjigawa.com` provides USSD/SMS OTP verification as an alternative authentication mechanism for feature-phone users[cite: 1].
* **PWA Session Caching:** Encrypted token caching is implemented for offline interactions; synchronization occurs automatically once connectivity is available.
* **Explicit Consent Workflows:** Registration enforces explicit data protection consent checkpoints aligning with institutional safeguarding policies[cite: 1].