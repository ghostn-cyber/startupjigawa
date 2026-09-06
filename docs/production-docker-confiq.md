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
|  [Internal service ports] --> Isolated application containers behind Nginx       |
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
| `jigawa_nginx_proxy` | Nginx Alpine | `80`, `443` | `8080:80`, `8443:443` by default | Public Edge Ingress Proxy |
| `auth-service` | Node.js / Express | `4000` | Docker bridge only | Subdomain IdP |
| `jigawa_postgres` | PostgreSQL 15 | `5432` | Docker bridge only | Persistent DB (`db_data` volume) |
| `jigawa_redis` | Redis 7 | `6379` | Docker bridge only | Session & Cache Store |
| Corporate Web Service | Node application service | `3001` | Docker bridge only | Nginx upstream |

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
- **Dynamic DNS Resolution**: Uses Docker embedded DNS (`resolver 127.0.0.11 valid=5s ipv6=off;`) and Compose service names such as `auth-service:4000` so container IP changes do not break routing.

### 4.2 Subdomain Routing Matrix

| Subdomain Virtual Host | Upstream Gateway Target | Function |
| :--- | :--- | :--- |
| `startupjigawa.test` / `www.*` | `http://www_service:3001` | Main Corporate Portal |
| `auth.startupjigawa.test` | `http://auth-service:4000` | SSO & Identity Provider (IdP) |
| `academy.startupjigawa.test` | `http://academy_service:3002` | Digital Skills Academy |
| `tracker.startupjigawa.test` | `http://tracker_service:3003` | Beneficiary & M&E Tracker |
| `portal.startupjigawa.test` | `http://portal_service:3004` | Partner Pilot Portal |
| `civic.startupjigawa.test` | `http://civic_service:3005` | Civic Tech Hub |
| `labs.startupjigawa.test` | `http://labs_service:3006` | AgriTech & Climate Labs |
| `products.startupjigawa.test` | `http://products_service:3007` | Product Showcase Directory |
| `admin.startupjigawa.test` | `http://admin_service:3009` | Central ERP & Governance Vault |
| `cloud.startupjigawa.test` | `http://cloud_service:3008` | Cloud Control Plane |

## 5. Public DNS Setup

Configure DNS at the provider that is authoritative for `startupjigawa.com`. Replace `203.0.113.10` below with the production VPS public IPv4 address.

### 5.1 Required Production Records

Create these records:

| Type | Name | Value | Purpose |
| :--- | :--- | :--- | :--- |
| `A` | `@` | `203.0.113.10` | Root domain |
| `A` | `*` | `203.0.113.10` | All Startup Jigawa subdomains |
| `CNAME` | `www` | `@` | Corporate site alias |

The wildcard record covers `auth`, `academy`, `tracker`, `portal`, `civic`, `labs`, `products`, `cloud`, and `admin`. If the DNS provider does not support wildcard records, create an `A` record for each subdomain instead. Never point public DNS at Docker container IPs; those addresses are private and can change.

Use DNS-only mode while validating the VPS and certificates. If a DNS/CDN proxy is enabled later, it must forward HTTPS to the VPS and preserve the original `Host` header.

### 5.2 Verify DNS Before Deployment

Run these commands from a machine outside the VPS and confirm each name resolves to the VPS public IP:

```bash
dig +short startupjigawa.com A
dig +short www.startupjigawa.com A
dig +short academy.startupjigawa.com A
dig +short auth.startupjigawa.com A
dig +short cloud.startupjigawa.com A
```

DNS propagation must complete before HTTP/TLS smoke tests. DNS resolution does not provision certificates and does not start Docker services.

### 5.3 Local Development Domain

`.startupjigawa.test` is for local development and should not be added to public DNS. Add the local names to `/etc/hosts` with:

```bash
sudo bash scripts/setup-hosts.sh
```

The development Compose listener is available at `http://127.0.0.1:8080`. Test a specific vhost with `curl -H "Host: academy.startupjigawa.test" http://127.0.0.1:8080/`.

## 6. GitHub Actions Deployment Pipeline

The workflow at `.github/workflows/deploy.yml` is triggered automatically by every push to the `main` branch. Trigger a production deployment with:

```bash
git add .
git commit -m "deploy: update Startup Jigawa"
git push origin main
```

The pipeline checks out the repository, builds and publishes the `auth-service` image, copies the Compose/Docker/Nginx/application files to `/var/www/startupjigawa`, then runs `make switch-to-com` and `make prod-deploy` over SSH. The deployment now builds isolated app services and starts them behind Nginx; there is no host gateway process or port-3000 router.

### 6.1 Required GitHub Repository Secrets

Configure these under **Repository Settings → Secrets and variables → Actions → Secrets**:

| Secret | Value |
| :--- | :--- |
| `DOCKER_USERNAME` | Docker Hub username used for the auth image |
| `DOCKER_PASSWORD` | Docker Hub access token |
| `VPS_HOST` | Public DNS name or IPv4 address of the production VPS |
| `VPS_USER` | SSH deployment user with Docker access |
| `VPS_SSH_KEY` | Private SSH key matching the VPS user's `authorized_keys` |

The VPS must have Docker Engine, the Docker Compose plugin, GitHub Actions SSH access, and a deployment user with permission to run Docker. The workflow may use `sudo apt-get` to install `make`; ensure that user has the required sudo permission.

### 6.2 First-Time VPS Preparation

After installing Docker using Section 3, prepare the deployment directory and verify the runtime as the deployment user:

```bash
ssh VPS_USER@VPS_HOST
docker info
docker compose version
sudo mkdir -p /var/www/startupjigawa
sudo chown -R "$USER":"$USER" /var/www/startupjigawa
exit
```

Allow inbound TCP `80` and `443` in the VPS firewall/security group. Keep application ports `3001` through `3009`, auth port `4000`, PostgreSQL `5432`, and Redis `6379` private to the Docker network.

### 6.3 Verify a Pipeline Deployment

Monitor **Actions → CI/CD Pipeline (Docker Hub & VPS)** after pushing to `main`. Then verify the VPS deployment:

```bash
ssh VPS_USER@VPS_HOST
cd /var/www/startupjigawa
docker compose ps
docker compose exec jigawa_nginx_proxy nginx -t
curl -I -H "Host: www.startupjigawa.com" http://127.0.0.1:8080/
curl -I -H "Host: auth.startupjigawa.com" http://127.0.0.1:8080/health
```

Expected results are healthy containers, a successful Nginx syntax check, and HTTP `200` or a valid application redirect. For failures, inspect `docker compose logs --tail=100 <service>` before rerunning the pipeline.

## 7. Subdomain HTTP 503 Maintenance Mode Architecture

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

## 8. Operational Runbook & Zero-Downtime Management

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
