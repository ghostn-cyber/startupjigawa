# API Interfacing: Authentication Gateway (`01-auth-gateway.md`)

## 1. Overview & Protocol Specification
The authentication gateway (`auth.startupjigawa.com`) provides secure, standardized API endpoints for session management, token issuance, federated single sign-on (SSO), and low-bandwidth verification across Startup Jigawa Ltd's digital infrastructure. It implements **OAuth 2.0 / OpenID Connect (OIDC)** for standard application clients and **SAML 2.0** for institutional and government enterprise partners (e.g., state MDAs and NITDA)[cite: 1].

---

## 2. Core API Endpoints

### A. Authorization & Token Endpoints (OIDC)
* **`GET /oauth/v2/authorize`**
  * *Description:* Initiates the authorization code flow for application clients (`academy`, `tracker`, `portal`, etc.).
  * *Query Parameters:* `client_id`, `redirect_uri`, `response_type=code`, `scope`, `state`.
* **`POST /oauth/v2/token`**
  * *Description:* Exchanges authorization codes or refresh tokens for scoped JWT access tokens.
  * *Request Body (JSON):* `grant_type` (authorization_code | refresh_token), `client_id`, `client_secret`, `code` (or `refresh_token`), `redirect_uri`.
* **`POST /oauth/v2/revoke`**
  * *Description:* Revokes active refresh tokens upon user logout or session termination.

### B. Federated Authentication (SAML 2.0)
* **`GET /saml/v2/sso`**
  * *Description:* Handles incoming SAML Single Sign-On assertions from external institutional partners (such as state government identity providers).
* **`POST /saml/v2/acs`**
  * *Description:* Assertion Consumer Service endpoint that processes signed SAML responses and provisions session credentials.

### C. Low-Bandwidth & USSD/SMS Authentication Fallback
* **`POST /api/v1/auth/ussd-otp/request`**
  * *Description:* Generates a lightweight OTP token for field enumerators, smallholder farmers, or trainees operating in low-data environments or via feature-phone USSD channels[cite: 1].
  * *Request Body (JSON):* `identifier` (phone number or registered ID).
* **`POST /api/v1/auth/ussd-otp/verify`**
  * *Description:* Validates the SMS/USSD OTP token and issues a restricted session handle.
  * *Request Body (JSON):* `identifier`, `otp_code`.

---

## 3. Security, Rate Limiting & Audit Logging
* **Rate Limiting:** IP-based and identifier-based rate limiting on token and OTP endpoints to mitigate brute-force credential stuffing.
* **Token Payload Structure:** JSON Web Tokens contain standardized claims (`sub`, `iss`, `aud`, `exp`, `roles`, and institutional tenant scopes) ensuring fine-grained Role-Based Access Control (RBAC).
* **Audit Hooks:** All successful authentication events, token exchanges, and failed login attempts log cryptographically traceable audit metadata to satisfy internal compliance standards[cite: 1].
* **Runtime & Implementation:** Authentication services are implemented in TypeScript running on Node.js v18+ using Express or NestJS and integrated with Redis v7 for token revocation and session state. Prisma ORM is used for any relational data persistence in PostgreSQL v15.