# Ecosystem Cross-Domain Features Implementation Plan

**Organization:** Startup Jigawa Ltd (RC 7256149)  
**Parent Domains:** `.startupjigawa.test` (Local Dev) / `.startupjigawa.com` (Production Production Base)  
**Target Services:** `auth`, `www`, `academy`, `tracker`, `portal`, `civic`, `labs`, `products`, `admin`

---

## 1. Cross-Domain Session Handshake Protocol

Startup Jigawa operates a microservices architecture spanning 9 distinct subdomains. To deliver Single Sign-On (SSO) and unified theme preference persistence, authentication token handshakes and theme state sync rely on parent-domain cookie propagation.

```
       [ Client Browser ]
               │
     ┌─────────┴─────────┐
     │  sj_session cookie│ (Domain: .startupjigawa.test, SameSite=Lax, HttpOnly)
     │  sj_theme cookie  │ (Domain: .startupjigawa.test, SameSite=Lax)
     └─────────┬─────────┘
               │
 ┌─────────────┼─────────────┬─────────────┐
 ▼             ▼             ▼             ▼
auth.         academy.      tracker.      civic.
startupjigawa startupjigawa startupjigawa startupjigawa
```

### Shared Cookie Scoping Engine

- **Session Cookies (`sj_session`, `sj_token`)**:
  - `Domain=.startupjigawa.test` (or `.startupjigawa.com` in production)
  - `HttpOnly: true`
  - `SameSite: Lax`
  - `Path: /`

- **Theme Engine Cookie (`sj_theme`)**:
  - `Domain=.startupjigawa.test`
  - `HttpOnly: false` (Accessible by client-side synchronous FOUC prevention script)
  - `SameSite: Lax`
  - Valid Values: `system` | `light` | `dark` | `high-contrast`

---

## 2. Token Validation & Blacklist Cascade Protocol

1. **Token Processing**:
   When a user navigates between subdomains (e.g., from `auth.startupjigawa.test` to `academy.startupjigawa.test`), the browser automatically attaches the parent-scoped `sj_token` JWT and `sj_session` cookie.

2. **Redis Revocation Blacklist Check**:
   Before authorizing downstream requests, edge proxies or route handlers verify:
   ```ts
   const isRevoked = await redis.exists(`blacklist:session:${sessionId}`);
   if (isRevoked) {
     res.clearCookie('sj_session', { domain: '.startupjigawa.test' });
     res.clearCookie('sj_token', { domain: '.startupjigawa.test' });
     return res.status(401).json({ error: 'Session has been revoked.' });
   }
   ```

---

## 3. Client-Side Integration Milestones

- [x] **Milestone 1: Central IdP Cookie Propagation**
  - Configured `auth-service` to set `domain=.startupjigawa.test` for `sj_session`, `sj_token`, and `sj_theme`.
- [x] **Milestone 2: FOUC Prevention Script Injection**
  - Injected inline synchronous `<head>` theme bootstrap logic across IdP landing, login, register, and dashboard pages.
- [x] **Milestone 3: Dynamic Security Hygiene Score Engine**
  - Integrated Prisma database lookup and algorithmic hygiene scoring based on 2FA, phone verification, and SIWES status.
- [ ] **Milestone 4: Subdomain PWA Storage Sync Worker**
  - Deploy ServiceWorker to sync offline PWA local storage theme caches with `.startupjigawa.test` cookies.
