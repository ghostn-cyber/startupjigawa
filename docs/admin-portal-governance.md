# Administrative Portal Governance & Audit Policy

**Organization:** Startup Jigawa Ltd (RC 7256149)  
**Domain Realm:** `admin.startupjigawa.test` / `admin.startupjigawa.com`  
**Classification:** Restricted Government & Executive Operations

---

## 1. Administrative Role Hierarchies

Access to the administrative control plane (`admin.startupjigawa.test`) is strictly governed by RBAC policies and signed RS256 JWT claims.

### Role Classifications

| Role Title | Scope Identifier | Permissions & Capabilities | Access Level |
|---|---|---|---|
| **Super Admin** | `system_admin` | Global platform administration, tenant provisioning, system kill switch execution, root key rotation, and full RBAC assignment. | Tier 5 (Highest Command) |
| **Institutional Verifier** | `institutional_verifier` | SIWES diploma approval/rejection, higher institution matriculation verification, grant applicant eligibility validation. | Tier 3 (Institutional Clearance) |
| **Field Support & Enumerator** | `field_support` | Beneficiary field verification, offline USSD OTP assistance, enumerator logbook auditing. Require compulsory 2FA. | Tier 2 (Field Clearance) |

---

## 2. Mandatory Audit Invariants for `admin.startupjigawa.test`

Every administrative mutation or read access on `admin.startupjigawa.test` must enforce the following four mandatory audit invariants:

1. **Actor Traceability (`actorId`)**:
   Every state modification must record the authenticated user's immutable ID (`actorId`). Anonymous administrative actions are strictly rejected at the Gateway layer.

2. **Network Origin Pinning (`ipAddress`)**:
   All audit records must log the true client IP address (`x-forwarded-for` or socket remote address) along with the HTTP User-Agent string.

3. **Cryptographic Non-Repudiation**:
   Audit entries (`prisma.auditLog`) must store JSON payload diffs, capturing the target resource name, modified attribute keys, previous state, and updated state.

4. **Synchronous Blacklist Cascade**:
   Any administrative account suspension (`isActive: false`) or role downgrade must automatically publish a Session Revocation payload to Redis (`blacklist:session:*`) with an 86400s (24h) TTL to guarantee instant cross-subdomain lockout.

---

## 3. Executive Oversight & Compliance Standards

- **Emergency Overrides**: Executive overrides (Tiers 4-5) must generate high-severity audit entries labeled `EXECUTIVE_OVERRIDE_TRIGGERED`.
- **Retention Schedule**: Audit trail records in PostgreSQL must be retained for a minimum of 7 years in compliance with National Data Protection Regulations (NDPR) and State Audit Directives.
