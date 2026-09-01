# Startup Jigawa Monorepo: System Contribution OS (`CONTRIBUTING.md`)

**Entity:** Startup Jigawa Ltd (RC 7256149), Dutse, Jigawa State, Nigeria

**Scope:** Universal standard for human engineers and autonomous AI collaborators contributing to monorepo services (`packages/*`, `apps/*`, `infrastructure/*`).

---

## 1. Core Philosophy & Directives

All contributions—whether authored by a human developer or an AI agent—must optimize for **long-term system scalability, data integrity, security hardening, and structural simplicity**.

* **Systems Thinking First:** Evaluate second-order effects, failure modes, network effects, and capital efficiency before proposing changes.
* **Truth Over Agreement:** Challenge flawed assumptions, highlight technical debt explicitly, and provide quantitative benchmarks or evidence for architectural decisions.
* **Zero-Trust Infrastructure:** Assume network boundaries are hostile; enforce strict cookie scoping (`.startupjigawa.test`), TLS/SSL boundaries, and role-based access control (RBAC).

---

## 2. Developer & Agent Operational Workflow

To prevent configuration drift, broken proxy states, or uncoordinated modifications, all non-trivial changes must follow the **Audit-Plan-Approve-Execute-Verify (APAEV)** lifecycle:

1. **Audit:** Inspect existing integration boundaries (Nginx upstreams, host-side routers, database schemas, shared packages, and client state).
2. **Plan:** Document the architectural impact, failure modes, and migration path.
3. **Approve:** Obtain explicit review and sign-off before executing infrastructure or breaking API changes.
4. **Execute:** Implement cleanly with strict type safety (TypeScript strict mode, PSR-12 for PHP, Rust async executor tuning).
5. **Verify:** Execute automated test suites and routing validators (`make test-routing`, `node --test`) with a 100% pass rate requirement.

---

## 3. Technology Stack & Architectural Standards

| Tier | Standard Technologies & Protocols | Compliance Rules |
| --- | --- | --- |
| **Identity & Auth** | JWT (RS256), HttpOnly Cookies, Transient `sj_intent` SSO | No raw `returnTo` query parameters in URLs; enforce ecosystem domain whitelisting. Re-use `@startupjigawa/auth-client` guards. |
| **Backend Services** | Node.js (Express), PHP 8.x (Laravel / PSR-12), Rust (Tokio) | Strict input validation, parameterized database queries, structured correlation logging (`X-Request-ID`). |
| **Frontend UI** | React, Vite, Tailwind CSS, Unified Theming Engine | Enforce ecosystem design tokens and zero-flash hydration via `sj_theme` cookies and anti-flicker scripts. |
| **Infrastructure** | Docker, Docker Compose, Nginx Reverse Proxy, Redis, PostgreSQL | Maintain container/host parity; use unified wildcard routing and robust upstream failovers. |

---

## 4. Code Reuse & Monorepo Synergy (DRY Principle)

To prevent fragmented codebases and technical debt across monorepo applications, strict rules govern function and package creation:

* **Check Existing Packages First:** Before writing custom utility functions, middleware, cookie parsers, validation helpers, or UI components, check `packages/` to determine if a shared implementation already exists.
* **Refactor into Shared Libraries:** If a utility or helper is needed across two or more apps (`apps/auth-service`, portal, academy, tracker, etc.), extract and house it inside a shared package rather than duplicating code.
* **Standardized Theming & Layouts:** All UI views and microservice frontends must inherit the unified OS-aware theming standard (`sj_theme` cookie handling, design token variables, and anti-flicker injection scripts) rather than implementing custom or hardcoded color schemes.

---

## 5. Git & Code Hygiene Standards

* **Commit Messages:** Use structured semantic commit prefixes:
* `feat(auth): implement transient sj_intent cookie redirection`
* `fix(nginx): add wildcard server block for dynamic subdomains`
* `refactor(router): transition to unified gateway router model`
* `style(theme): integrate unified sj_theme anti-flicker token sync`


* **Clean State Enforcement:** Never commit raw secrets, hardcoded database credentials, or debug logs. Use environment variables managed via secure template configurations (`.env.example`).
* **Test Coverage:** Any new authentication flow, route guard, shared utility, or tenancy isolation feature must include corresponding unit and integration test assertions.

---

## 6. Master Ecosystem Lifecycle Commands

Management of the local development and testing environment is centralized through the root-level `Makefile`:

* **Start Ecosystem:** `make up` (frees ports, starts Docker containers, boots host router).
* **Stop Ecosystem:** `make down` (gracefully stops containers and terminates background listeners).
* **Reset Stack:** `make restart` (executes `down` followed by `up`).
* **Validate Routing:** `make test-routing` (executes automated integration tests across all ecosystem subdomains).