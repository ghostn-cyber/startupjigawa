# Milestone Task File: `02-oidc-oauth-saml-core-engine-task.md`

## Milestone 2: OIDC/OAuth2 & SAML 2.0 Core Engine (`auth.startupjigawa.com`)
* **Associated Entity:** Startup Jigawa Ltd (RC 7256149), Dutse, Jigawa State, Nigeria[cite: 1].
* **Phase Objective:** Implement core OpenID Connect (OIDC) and OAuth 2.0 authorization server endpoints, configure enterprise SAML 2.0 federation modules for state government MDAs and institutional partners, and establish secure RS256-signed JWT token issuance and validation pipelines[cite: 1].

---

## Task Breakdown & Action Items

### Task 2.1: OAuth 2.0 & OIDC Authorization Code Flow
* [x] **Authorization Endpoint (`GET /oauth/v2/authorize`):**
  * Implement client validation, scope verification, and user session validation.
  * Render secure consent and login prompt or issue authorization codes upon successful authentication.
* [x] **Token Exchange Endpoint (`POST /oauth/v2/token`):**
  * Handle authorization code validation, client authentication (client secret / PKCE), and issuance of access tokens, refresh tokens, and ID tokens.
  * Enforce strict request body parsing and validation using Zod or Joi schemas.
* [x] **Token Revocation & Introspection:**
  * Implement `/oauth/v2/revoke` and `/oauth/v2/introspect` endpoints to manage active token lifecycles and support client logouts across subdomains (`academy`, `tracker`, `portal`, etc.)[cite: 1].

### Task 2.2: SAML 2.0 Enterprise Federation Module
* [x] **SAML Service Provider (SP) & Identity Provider (IdP) Config:**
  * Integrate `@node-saml/node-saml` or equivalent enterprise modules within `apps/auth-service/src/config/saml.ts`.
* [x] **SAML SSO Routes:**
  * Implement `GET /saml/v2/sso` to handle incoming authentication requests from enterprise partners and state government entities[cite: 1].
  * Implement `POST /saml/v2/acs` (Assertion Consumer Service) to process signed SAML assertions, validate XML signatures, and map external identities to internal roles.

### Task 2.3: Cryptographic Key Management & JWT Issuance
* [x] **RS256 Signing Infrastructure:**
  * Generate secure public/private RSA key pairs for signing and verifying JSON Web Tokens.
* [x] **Standardized Claims Structure:**
  * Ensure issued JWT payloads include standardized claims (`sub`, `iss`, `aud`, `exp`, `iat`, `roles`, and institutional tenant scopes) to enforce RBAC across all downstream microservices.

### Task 2.4: Consumer Application Integration Middleware (`packages/auth-client`)
* [x] **Shared OIDC Client Library:**
  * Develop wrapper middleware in `packages/auth-client` for consuming applications (`academy`, `tracker`, `portal`, `civic`, `labs`, `products`, `admin`) to easily validate incoming session tokens and handle cookie/header extraction[cite: 1].
* [x] **Redirect & Callback Handlers:**
  * Implement standard authentication middleware hooks to redirect unauthenticated requests to `auth.startupjigawa.com` and handle post-login redirects securely.

### Task 2.5: Testing & Verification Suite
* [x] **Unit & Integration Tests:**
  * Write automated test suites validating authorization code generation, token exchange success/failure paths, and SAML signature validation.

---

## Milestone 2 Completion & Sign-Off Criteria
* **Protocol Compliance:** Successful end-to-end simulation of the OAuth2 Authorization Code flow issuing valid RS256-signed JWTs.
* **Federation Readiness:** SAML ACS endpoint successfully parses mock institutional assertion payloads.
* **Client Synchronization:** Shared `auth-client` package successfully verifies token integrity across monorepo applications.

**Status:** Pending verification — runtime and integration testing currently blocked by workspace package-registry access (HTTP 403) and inability to complete the `apps/auth-service` build and test runs.