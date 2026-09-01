# Documentation Specification: Cross-Domain SSO & Redirection Architecture

**Entity:** Startup Jigawa Ltd (RC 7256149) — Dutse, Jigawa State, Nigeria

**Document Path:** `docs/cross-domain-sso-redirection-architecture.md`

**Scope:** Ecosystem-wide authentication, subdomain routing, and session propagation across all monorepo microservices (`auth`, `portal`, `academy`, `tracker`, `civic`, `labs`, `products`, `admin`).

---

## 1. Overview & Architectural Objective

To provide a seamless, enterprise-grade Single Sign-On (SSO) experience across our 10 monorepo subdomains, Startup Jigawa Ltd implements a decoupled authentication model. Session issuance is centralized at `auth.startupjigawa.*`, while consumer subdomains (`portal.startupjigawa.*`, `academy.startupjigawa.*`, etc.) consume and validate session tokens via the shared `@startupjigawa/auth-client` package.

This architecture ensures that users never experience redundant login prompts when navigating between distinct platform domains.

---

## 2. The Cross-Domain Cookie Strategy

A core challenge of multi-subdomain architectures is origin-bound storage (`localStorage` cannot be shared across different subdomains). We overcome this via a **Domain-Scoped HTTP-Only Cookie Pattern**:

* **Cookie Scope:** Set with a domain prefix of **`.startupjigawa.test`** (for local development via Nginx proxy) or **`.startupjigawa.com`** (for production environments).
* **Propagation:** Because the cookie is scoped with a leading dot (`.`), the browser automatically includes it in HTTP requests made to *any* subdomain under the root entity.
* **Security Flags:** Cookies are marked as `HttpOnly` (preventing XSS script exfiltration), `Secure` (forcing HTTPS in production), and `SameSite=Lax` (balancing CSRF protection with smooth cross-origin navigation).

---

## 3. Step-by-Step Redirection & Authentication Flow (`returnTo` Protocol)

When an unauthenticated user attempts to access a protected resource on any consumer subdomain (e.g., `portal.startupjigawa.test/dashboard`), the request executes the following deterministic lifecycle:

### Step A: Interception & `returnTo` Capture

1. The incoming request hits `portal.startupjigawa.test/dashboard`.
2. The local `requireAuth()` middleware from `@startupjigawa/auth-client` inspects cookies and headers. Finding no valid session token, it determines the user is unauthenticated.
3. The middleware extracts the requested relative path (`/dashboard`), encodes it, and issues an HTTP **`302 Found` redirect** to the Central Identity Provider:
```text
http://auth.startupjigawa.test/login?returnTo=http%3A%2F%2Fportal.startupjigawa.test%2Fdashboard

```



### Step B: Centralized Authentication at the IdP

1. The user arrives at `auth.startupjigawa.test/login`, carrying the preserved `returnTo` query parameter.
2. The user authenticates successfully via credentials, passkeys, or OTP.
3. The IdP verifies claims against PostgreSQL (Prisma), issues an RS256-signed JWT access token, and sets the `.startupjigawa.test` scoped session cookie.

### Step C: Whitelist Validation & Redirection Loopback

1. Before redirecting the user back, the IdP executes an **Open Redirect Prevention Check**, validating that the `returnTo` URL matches our approved ecosystem domain patterns (`*.startupjigawa.test` or `*.startupjigawa.com`).
2. Once validated, the IdP issues a `302 Found` redirect back to the originating destination:
```text
http://portal.startupjigawa.test/dashboard

```



### Step D: Subdomain Verification & Access Grant

1. The browser follows the redirect back to `portal.startupjigawa.test/dashboard`, automatically sending the domain-scoped session cookie.
2. The local `requireAuth()` middleware intercepts the request again, cryptographically verifies the RS256 JWT signature locally using cached public keys (eliminating round-trip latency to the IdP), confirms the token has not expired (`exp > now`), and passes execution to the dashboard controller.

---

## 4. Security Guardrails & Compliance Invariants

* **Zero Trust Token Verification:** Subdomains do not trust cookies blindly; every request undergoes local cryptographic signature validation (`RS256`).
* **Open Redirect Hardening:** All `returnTo` parameters are strictly parsed and whitelisted against ecosystem boundaries to prevent malicious phishing redirections.
* **Instant Revocation:** When a user triggers "Revoke Session" or the "Kill Switch" in their control panel, token signatures are immediately added to the Redis revocation blacklist, invalidating active access across all subdomains instantaneously.