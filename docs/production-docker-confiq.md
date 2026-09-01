# Production Infrastructure & Container Architecture Blueprint
**Startup Jigawa Ltd (RC 7256149)**  
*Dutse, Jigawa State, Nigeria*

---

## 1. Executive Summary & Infrastructure Overview

This blueprint documents the production container architecture, host environment port isolation standards, Docker Engine deployment steps, and Central Custom Nginx Reverse Proxy topology for Startup Jigawa Ltd (RC 7256149).

The infrastructure is engineered to deliver high-availability edge routing across 10 ecosystem subdomains, strict network isolation between microservices and persistence layers, SSL/TLS termination capabilities, and an automated HTTP 503 "Under Maintenance" graceful fallback mechanism.

---

## 2. Host Environment Port Audit & Isolation Rules

### 2.1 Host Port Allocation & Conflict Avoidance Audit

A preliminary audit of production host environments highlights potential port collisions between host-level system daemons and containerized microservices.

```
+-----------------------------------------------------------------------------------+
| Production Host Machine (Network Interfaces: 0.0.0.0 & 127.0.0.1)                 |
|                                                                                   |
|  [Port 80]   --> Central Nginx Edge Ingress Proxy (HTTP)                           |
|  [Port 443]  --> Central Nginx Edge Ingress Proxy (HTTPS / SSL)                      |
|  [Port 3306] --> HOST MYSQL/MARIADB DAEMON (CONFLICT RISK - DO NOT BIND)          |
|  [Port 5432] --> Internal PostgreSQL 15 (Container isolated / mapped internal)    |
|  [Port 6379] --> Internal Redis 7 Cache (Container isolated / mapped internal)     |
|  [Port 4000] --> Auth IdP Service (Container internal bridge)                      |
|  [Ports 3000-3007] --> Host Subdomain Applications (Local Node.js Workspaces)      |
+-----------------------------------------------------------------------------------+
```

### 2.2 MySQL Port 3306 Isolation Directive
- **Collision Vulnerability**: Many production Linux environments run a host-bound MySQL/MariaDB database instance listening on default port `3306`. Attempting to map container database services directly to host port `3306` (`3306:3306`) results in startup failures (`address already in use`).
- **Isolation Policy**:
  1. Container database layers (e.g. PostgreSQL, Redis) MUST NOT bind to host port `3306`.
  2. Database containers communicate strictly over the internal container bridge network (`startup-jigawa-net`).
  3. External host access to database containers, if required for administration, must use non-standard host port bindings (e.g. `5432` for Postgres, `6379` for Redis) or SSH tunnel proxies.

### 2.3 Comprehensive Port Allocation Matrix

| Service Container | Primary Technology | Internal Port | Host Exposed Port | Isolation Rule |
| :--- | :--- | :--- | :--- | :--- |
| `jigawa_nginx_proxy` | Nginx Alpine | `80`, `443` | `80:80`, `443:443` | Public Edge Ingress Proxy |
| `auth-service` | Node.js / Express | `4000` | `4000:4000` | Subdomain IdP (Internal Network) |
| `jigawa_postgres` | PostgreSQL 15 | `5432` | `5432:5432` | Persistent DB (`db_data` volume) |
| `jigawa_redis` | Redis 7 | `6379` | `6379:6379` | Session & Cache Store |
| Host Apps Gateway | Node Subdomain Gateway | `3000` | `3000` (Host Loopback) | Internal Gateway Proxy Target |

---

## 3. Production Docker Engine & Docker Compose Installation Runbook

To provision a fresh Linux host server (Ubuntu 22.04 LTS / 24.04 LTS) for Startup Jigawa production workloads:

### Step 1: Uninstall Legacy Packages
```bash
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
```

### Step 2: Configure Docker Official APT Repository
```bash
# Update package index & install prerequisites
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add repository source
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### Step 3: Install Docker Engine & Compose Plugin
```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Step 4: Systemd Configuration & User Privileges
```bash
# Enable and start Docker systemd service
sudo systemctl enable --now docker

# Grant current user non-root Docker execution rights
sudo usermod -aG docker $USER
```

### Step 5: Installation Verification
```bash
docker compose version
docker info
```

---

## 4. Central Custom Nginx Edge Ingress Reverse Proxy Architecture

### 4.1 Topology & Ingress Boundaries
The central Nginx reverse proxy container (`jigawa_nginx_proxy` / `web-proxy`) acts as the single edge entry point for all incoming network traffic.

- **Ports**: Listens on port `80` (HTTP) and port `443` (HTTPS/SSL).
- **SSL Certificate Mounting**: Certificates are mounted read-only into `/etc/nginx/certs:ro` to support TLS termination across all subdomains.
- **Dynamic DNS Resolution**: Uses Docker embedded DNS (`resolver 127.0.0.11 valid=5s ipv6=off;`) with dynamic variable proxying (`set $auth_target "http://auth-service:4000";`) to ensure backend container IP changes do not break routing.

### 4.2 Subdomain Routing Matrix

| Subdomain Virtual Host | Upstream Gateway Target | Function |
| :--- | :--- | :--- |
| `startupjigawa.test` / `www.*` | `http://corporate_gateway` | Main Corporate Portal |
| `auth.startupjigawa.test` | `http://auth-service:4000` | SSO & Identity Provider (IdP) |
| `academy.startupjigawa.test` | `http://corporate_gateway` | Digital Skills Academy |
| `tracker.startupjigawa.test` | `http://corporate_gateway` | Beneficiary & M&E Tracker |
| `portal.startupjigawa.test` | `http://corporate_gateway` | Partner Pilot Portal |
| `civic.startupjigawa.test` | `http://corporate_gateway` | Civic Tech Hub |
| `labs.startupjigawa.test` | `http://corporate_gateway` | AgriTech & Climate Labs |
| `products.startupjigawa.test` | `http://corporate_gateway` | Product Showcase Directory |
| `admin.startupjigawa.test` | `http://corporate_gateway` | Central ERP & Governance Vault |
| `*.startupjigawa.test` | `http://corporate_gateway` | Wildcard Ecosystem Catch-All |

---

## 5. Subdomain HTTP 503 Maintenance Mode Architecture

### 5.1 Interception Mechanism
Nginx intercepts upstream downtime (connection refusal, 502, 503, 504 status codes) and returns an explicit `503 Service Temporarily Unavailable` HTTP response code:

```nginx
proxy_intercept_errors on;
error_page 502 503 504 /maintenance.html;

location = /maintenance.html {
    root /usr/share/nginx/html;
    internal;
}
```

### 5.2 Static Maintenance Assets
The maintenance page is rendered from `/usr/share/nginx/html/maintenance.html` (mounted from `./infrastructure/nginx/html`). It incorporates:
- Corporate Branding: **Startup Jigawa Ltd**
- Official Credentials: **RC 7256149**
- Headquarters: **Dutse, Jigawa State, Nigeria**
- Live Status Pulse & DevOps Contact Channels (`support@startupjigawa.ng`).

---

## 6. Operational Runbook & Zero-Downtime Management

### 6.1 Validating Configuration Syntax
```bash
docker compose exec jigawa_nginx_proxy nginx -t
# Or via container name directly:
docker exec -it jigawa_nginx_proxy nginx -t
```

### 6.2 Zero-Downtime Hot Reloading
```bash
docker compose exec jigawa_nginx_proxy nginx -s reload
# Or via make command:
make reload-nginx
```

### 6.3 Maintenance Mode Failure Simulation
```bash
# 1. Stop backend service
docker compose stop auth-service

# 2. Curl subdomain endpoint
curl -i -H "Host: auth.startupjigawa.test" http://127.0.0.1/

# Expected Output: HTTP 502/503 response header with branded maintenance HTML page body.

# 3. Restore backend service
docker compose start auth-service
```
