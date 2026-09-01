# Deployment: Local Development Environment Setup (`01-local-environment.md`)

## 1. Overview & Objectives
This guide outlines the step-by-step procedures to bootstrap and run the local development environment for Startup Jigawa Ltd's (RC 7256149) digital infrastructure monorepo. For local testing and subdomain routing, all services are configured to run locally using the **`.test` top-level domain extension** (e.g., `auth.startupjigawa.test`, `academy.startupjigawa.test`), mirroring the production subdomain architecture.

---

## 2. System Prerequisites
Before initializing the workspace, ensure your local development machine has the following tools installed:
* **Node.js:** Version 18.x or higher (`node -v`)
* **pnpm:** Version 8.x or higher (`pnpm -v`)
* **Docker & Docker Compose:** Version 20+ for container management (`docker compose version`)

---

## 3. Local Domain Mapping (`.test` Setup)
To enable clean subdomain routing in your local environment, map the infrastructure subdomains to `127.0.0.1` in your local hosts file.

1. Open your hosts file with administrative privileges:
   * **Linux / macOS:** `/etc/hosts`
   * **Windows:** `C:\Windows\System32\drivers\etc\hosts`
2. Append the following entries:
   ```text
   127.0.0.1 startupjigawa.test
   127.0.0.1 www.startupjigawa.test
   127.0.0.1 auth.startupjigawa.test
   127.0.0.1 academy.startupjigawa.test
   127.0.0.1 tracker.startupjigawa.test
   127.0.0.1 portal.startupjigawa.test
   127.0.0.1 civic.startupjigawa.test
   127.0.0.1 labs.startupjigawa.test
   127.0.0.1 products.startupjigawa.test
   127.0.0.1 admin.startupjigawa.test
   ```

---

## 4. Environment Configuration

1. **Navigate to the Repository:**
```bash
cd Projects/startupjigawa
```

2. **Initialize Environment Variables:**
Copy the template environment file to create your local `.env` configuration:
```bash
cp .env.example .env
```

3. **Configure Local Database & Service Keys (`.env`):**
Update your `.env` file with baseline development parameters:
```env
# Database Configuration
DB_USER=jigawa
DB_PASSWORD=jigawa_pass
DB_NAME=jigawa_dev
DATABASE_URL=postgresql://jigawa:jigawa_pass@localhost:5432/jigawa_dev

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication & JWT Keys
JWT_SECRET=development_jwt_secret_key_change_in_production
JWT_REFRESH_SECRET=development_refresh_secret_key_change_in_production

# Base Domain Configuration
BASE_DOMAIN=startupjigawa.test
```

---

## 5. Bootstrapping Containerized Core Services

Start the core infrastructural stack via the master Makefile switch:

```bash
make up
```

Verify that the containers are running successfully:

```bash
docker compose ps
```

---

## 6. Infrastructure Lifecycle & Volume Management

- **Stop Services (Preserving Volumes):** `make down`
- **Restart Ecosystem:** `make restart`
- **Hot-Reload Nginx Proxy:** `make reload-nginx`
- **Purge Persistent Data Volumes (Safe Cleanup):** `make clean-volumes`

---

## 7. Monorepo Installation & Database Migration

1. **Install Workspace Dependencies:**
```bash
pnpm install
```

2. **Run Database Migrations:**
```bash
pnpm --filter @startupjigawa/database db:migrate
```

---

## 8. Running Development Servers

To start all monorepo applications and microservices concurrently:

```bash
make up
```

### Local Subdomain Access Points:

* **Central Authentication IdP:** `http://auth.startupjigawa.test:4000`
* **Corporate Gateway:** `http://www.startupjigawa.test:3000`
* **Digital Skills Academy:** `http://academy.startupjigawa.test:3001`
* **Beneficiary Tracker:** `http://tracker.startupjigawa.test:3002`
* **Partner Portal:** `http://portal.startupjigawa.test:3003`
* **Civic Tech Lab:** `http://civic.startupjigawa.test:3004`
* **Climate & Idea Lab:** `http://labs.startupjigawa.test:3005`
* **Product Showcase:** `http://products.startupjigawa.test:3006`
* **Admin ERP & Compliance Vault:** `http://admin.startupjigawa.test:3007`
