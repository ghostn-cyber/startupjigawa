# Milestone Task File: `04-auth-client-subdomain-integration-task.md`

## Milestone 4: Shared Auth Client & Subdomain Integration (`packages/auth-client`)

* **Associated Entity:** Startup Jigawa Ltd (RC 7256149), Dutse, Jigawa State, Nigeria.
* **Phase Objective:** Build the reusable `@startupjigawa/auth-client` package to provide drop-in session validation middleware, secure cookie parsing, and automated redirect flows for all consumer subdomains (`academy`, `tracker`, `portal`, `civic`, `labs`, `products`, `admin`).

---

## Task Breakdown & Action Items

### Task 4.1: Shared Package Initialization (`packages/auth-client`)

* [x] **Workspace Setup:**
* Initialize `packages/auth-client` with a clean TypeScript configuration extending the shared monorepo config.
* Define exports and types (`dist/index.js`, `dist/index.d.ts`) for consuming applications.

* [x] **Cryptographic Verification Module:**
* Implement utility functions (`validateToken`, `parseBearerToken`, `parseCookieToken`) to verify RS256-signed JWT access tokens issued by `auth.startupjigawa.*` with expiration and claims validation.


### Task 4.2: Express & Next.js Middleware Development

* [x] **Authentication Guard Middleware (`requireAuth`):**
* Build Express middleware that inspects incoming requests for httpOnly cookies (`sj_token`, `sj_session`) or Bearer tokens, validates signatures, and attaches user claims (`sub`, `roles`, `scope`, `email`) to `req.user`.

* [x] **RBAC Guard Middleware (`requireRole`):**
* Implement role-checking middleware (`requireRole`) to restrict route access based on institutional permissions (restricting administrative endpoints to `system_admin` or `agency_staff`).


### Task 4.3: Cross-Subdomain Cookie & Session Synchronization

* [x] **Domain-Scoped Cookie Handling:**
* Configure token storage with domain-level scoping (`.startupjigawa.test` for local development, `.startupjigawa.com` for production) via `getCrossDomainCookieConfig` to ensure session continuity across subdomains.

* [x] **Automatic Login Redirection:**
* Handle unauthenticated requests by automatically generating return URLs (`returnTo`) and redirecting users to `auth.startupjigawa.*/login?returnTo=...`.


### Task 4.4: Subdomain Application Wiring

* [x] **Academy & Tracker Integration:**
* Integrate `@startupjigawa/auth-client` into `academy` and `tracker` subdomains to protect student training modules and beneficiary grant disbursement vaults (`/protected`).

* [x] **Portal & Admin Integration:**
* Wire secure session validation into `partner-portal` (`portal.startupjigawa.test`) and `admin-erp` (`admin.startupjigawa.test`) to enforce multi-tenant separation and administrative privileges.


### Task 4.5: Integration Testing & Verification

* [x] **Cross-Subdomain Simulation Tests:**
* Write automated unit test suite (`packages/auth-client/src/__tests__/auth-client.test.ts`) passing 100% (7/7 assertions) verifying token verification, role checks, and redirect URLs.


---

## Milestone 4 Completion & Sign-Off Criteria

* **Client Package Stability:** `packages/auth-client` compiles cleanly with zero TypeScript errors.
* **Seamless SSO Routing:** Consumer subdomains successfully intercept unauthenticated traffic, redirect to the IdP, and accept valid session cookies upon return.
