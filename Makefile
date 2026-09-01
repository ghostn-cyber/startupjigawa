.DEFAULT_GOAL := help

BASE_DOMAIN ?= startupjigawa.com

.PHONY: help up down restart reload-nginx test-routing logs clean local-clean local-dev prod-build prod-deploy clean-volumes seed build docker-clean docker-build clean-rebuild test-all rebuild-code rebuild-s local-maintenance-on local-maintenance-off prod-maintenance-s prod-restore-s maintenance-s restore-s maintenance-except-www restore-all off on status-all status render-vhosts switch-to-com switch-to-test

help: ## Display this help operations manual
	@echo "=================================================="
	@echo "🛠️ Startup Jigawa Monorepo Operations Manual"
	@echo "=================================================="
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m [options]\n\nAvailable Targets:\n"} /^[a-zA-Z0-9_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# --- ECOSYSTEM ON SWITCH ---
up: ## Start full Startup Jigawa ecosystem stack
	@echo "=================================================="
	@echo "🚀 Starting Startup Jigawa Full Ecosystem Stack..."
	@echo "=================================================="
	@echo "1. Freeing up local ecosystem ports (3000-3007, 4000) & stopping system redis..."
	@systemctl stop redis-server 2>/dev/null || service redis-server stop 2>/dev/null || true
	@fuser -k 3000/tcp 2>/dev/null || true
	@fuser -k 3001/tcp 2>/dev/null || true
	@fuser -k 3002/tcp 2>/dev/null || true
	@fuser -k 3003/tcp 2>/dev/null || true
	@fuser -k 3004/tcp 2>/dev/null || true
	@fuser -k 3005/tcp 2>/dev/null || true
	@fuser -k 3006/tcp 2>/dev/null || true
	@fuser -k 3007/tcp 2>/dev/null || true
	@fuser -k 4000/tcp 2>/dev/null || true
	@echo "2. Launching Docker infrastructure (Postgres, Redis, Auth Service, Nginx Proxy)..."
	@docker compose up -d
	@echo "3. Initializing Host Subdomain Unified Gateway Router..."
	@nohup node scripts/subdomain-server.js > subdomain-stack.log 2>&1 &
	@sleep 2
	@echo "=================================================="
	@echo "✨ Ecosystem successfully online!"
	@echo "   - Main Domain: http://$(BASE_DOMAIN)"
	@echo "   - Auth IdP:    http://auth.$(BASE_DOMAIN)"
	@echo "   - Portal SSO:  http://portal.$(BASE_DOMAIN)"
	@echo "=================================================="

# --- ECOSYSTEM OFF SWITCH ---
down: ## Stop all ecosystem host processes and Docker containers
	@echo "=================================================="
	@echo "🛑 Shutting down Startup Jigawa Ecosystem..."
	@echo "=================================================="
	@echo "1. Stopping host subdomain processes..."
	@fuser -k 3000/tcp 2>/dev/null || true
	@fuser -k 3001/tcp 2>/dev/null || true
	@fuser -k 3002/tcp 2>/dev/null || true
	@fuser -k 3003/tcp 2>/dev/null || true
	@fuser -k 3004/tcp 2>/dev/null || true
	@fuser -k 3005/tcp 2>/dev/null || true
	@fuser -k 3006/tcp 2>/dev/null || true
	@fuser -k 3007/tcp 2>/dev/null || true
	@fuser -k 4000/tcp 2>/dev/null || true
	@echo "2. Stopping Docker Compose containers (Preserving Data Volumes)..."
	@docker compose down --remove-orphans
	@echo "=================================================="
	@echo "💤 All ecosystem services safely powered down."
	@echo "=================================================="

# --- MONOREPO AUTOMATION & DUAL-MODE TARGETS ---
clean: ## Clean build artifacts (dist/), .tsbuildinfo, and log files
	@echo "🧹 Cleaning temporary log files, build artifacts (dist/), and .tsbuildinfo files..."
	@rm -f subdomain-stack.log
	@find . -name "node_modules" -prune -o -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	@find . -name "node_modules" -prune -o -type f -name "*.tsbuildinfo" -exec rm -f {} + 2>/dev/null || true
	@echo "✨ Clean complete."

local-clean: clean ## Clean local development build artifacts, .tsbuildinfo, and logs

local-dev: ## Start ecosystem stack in local development mode (live reload, watchers & host bind mounts)
	@echo "=================================================="
	@echo "🚀 Starting Startup Jigawa Local Development Stack..."
	@echo "=================================================="
	@echo "1. Freeing up local ecosystem ports (3000-3007, 4000) & stopping system redis..."
	@systemctl stop redis-server 2>/dev/null || service redis-server stop 2>/dev/null || true
	@fuser -k 3000/tcp 2>/dev/null || true
	@fuser -k 3001/tcp 2>/dev/null || true
	@fuser -k 3002/tcp 2>/dev/null || true
	@fuser -k 3003/tcp 2>/dev/null || true
	@fuser -k 3004/tcp 2>/dev/null || true
	@fuser -k 3005/tcp 2>/dev/null || true
	@fuser -k 3006/tcp 2>/dev/null || true
	@fuser -k 3007/tcp 2>/dev/null || true
	@fuser -k 4000/tcp 2>/dev/null || true
	@echo "2. Launching Docker infrastructure with development overlay..."
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "3. Initializing Host Subdomain Unified Gateway Router..."
	@nohup node scripts/subdomain-server.js > subdomain-stack.log 2>&1 &
	@sleep 2
	@echo "=================================================="
	@echo "✨ Local Development Environment successfully online with Live Reload!"
	@echo "   - Main Domain: http://$(BASE_DOMAIN)"
	@echo "   - Auth IdP:    http://auth.$(BASE_DOMAIN)"
	@echo "   - Portal SSO:  http://portal.$(BASE_DOMAIN)"
	@echo "=================================================="

prod-build: clean ## Compile monorepo workspaces and build zero-cache production containers
	@echo "=================================================="
	@echo "📦 Building Startup Jigawa Production Stack (--no-cache)..."
	@echo "=================================================="
	@pnpm install || npm install
	@npm run build
	@docker compose -f docker-compose.yml build --no-cache
	@echo "✨ Production build completed successfully."

prod-deploy: ## Build workspaces, start host gateway on port 3000, pull registry images & deploy with zero downtime
	@echo "=================================================="
	@echo "🚀 Deploying Startup Jigawa Production Stack..."
	@echo "=================================================="
	@echo "1. Installing workspace dependencies and building monorepo..."
	@pnpm install || npm install
	@npm run build
	@echo "2. Freeing up port 3000 and starting Host Subdomain Unified Gateway Router..."
	@fuser -k 3000/tcp 2>/dev/null || true
	@nohup node scripts/subdomain-server.js > subdomain-stack.log 2>&1 &
	@sleep 2
	@echo "3. Pulling container registry images and starting Docker infrastructure..."
	@docker compose pull
	@docker compose up -d --remove-orphans
	@echo "=================================================="
	@echo "✨ Production Stack and Host Gateway successfully deployed!"
	@echo "   - Main Domain: http://www.$(BASE_DOMAIN):8080"
	@echo "   - Auth IdP:    http://auth.$(BASE_DOMAIN):8080"
	@echo "=================================================="

build: clean ## Install dependencies and build all monorepo workspaces
	@echo "=================================================="
	@echo "🔨 Installing workspace dependencies and building monorepo..."
	@echo "=================================================="
	@pnpm install || npm install
	@npm run build
	@echo "✨ Build complete."

docker-clean: ## Clean Docker containers, networks, and volumes
	@echo "=================================================="
	@echo "🧹 Cleaning Docker Compose containers, networks, and volumes..."
	@echo "=================================================="
	@docker compose down --volumes --remove-orphans
	@echo "✨ Docker environment cleaned."

docker-build: docker-clean ## Rebuild Docker containers with zero-cache and start stack
	@echo "=================================================="
	@echo "🐳 Rebuilding Docker containers (--no-cache) and starting stack..."
	@echo "=================================================="
	@docker compose build --no-cache
	@docker compose up -d
	@echo "✨ Docker build and start complete."

rebuild-code: ## Recompile TypeScript workspaces & rebuild/restart ALL Docker services using build cache
	@echo "🔨 Recompiling TypeScript source code across all workspaces..."
	npm run build
	@echo "🔄 Rebuilding and restarting ALL ecosystem services using local build cache..."
	docker compose build
	docker compose up -d
	@echo "✅ All code changes deployed across all subdomains! Perform a hard browser refresh (Ctrl + Shift + R)."

rebuild-s: ## Recompile TypeScript & rebuild/restart single service (e.g. s=auth-service)
	@echo "🔨 Recompiling TypeScript workspaces..."
	npm run build
	@echo "🔄 Rebuilding and restarting single service: $(s)..."
	docker compose build $(s)
	docker compose up -d $(s)
	@echo "✅ Service '$(s)' successfully redeployed! Perform a hard browser refresh (Ctrl + Shift + R)."

clean-rebuild: build docker-build ## Perform full clean slate build and zero-cache Docker rebuild
	@echo "=================================================="
	@echo "🎉 Complete zero-cache rebuild executed successfully!"
	@echo "=================================================="

test-all: ## Execute full integration, SSO, and layout verification test suite
	@echo "=================================================="
	@echo "🧪 Running Layout System, SSO, and Ecosystem Integration Verification Suite..."
	@echo "=================================================="
	@node scripts/test-layout-system.js
	@node scripts/test-layout-subdomain-integration.js
	@node scripts/test-sso-flow.js
	@node scripts/test-intent-redirect.js
	@node scripts/test-subdomains.js
	@node scripts/test-portal-integration.js
	@node scripts/test-tracker-integration.js
	@node scripts/test-admin-governance.js
	@node scripts/test-cloud-control-plane.js
	@node scripts/test-academy-tracker.js
	@node scripts/test-rbac-denied.js
	@echo "=================================================="
	@echo "🎉 All layout system, SSO, and integration verification tests passed!"
	@echo "=================================================="

# --- UTILITY COMMANDS ---
restart: down up ## Restart the entire ecosystem stack (down -> up)

reload-nginx: ## Hot-reload Nginx proxy configuration
	@echo "🔄 Hot-reloading Nginx proxy configuration..."
	@docker compose exec jigawa_nginx_proxy nginx -s reload 2>/dev/null || docker compose restart jigawa_nginx_proxy
	@echo "✨ Nginx proxy reloaded successfully!"

local-maintenance-on: ## Test maintenance mode locally by stopping auth-service
	@echo "🚨 [LOCAL TEST] Stopping auth-service to simulate upstream downtime..."
	docker compose stop auth-service
	@echo "🔍 Verifying Nginx error interception via curl..."
	curl -i -H "Host: auth.$(BASE_DOMAIN)" http://localhost/

local-maintenance-off: ## Restore local services from maintenance testing
	@echo "🔄 [LOCAL TEST] Restarting auth-service..."
	docker compose start auth-service
	@echo "✅ Local services fully restored online!"

maintenance-s: ## Atomically enable maintenance mode for specific subdomain with pre-flight checks (e.g. s=portal)
	@if [ -z "$(s)" ]; then \
		echo "❌ Error: Specify target subdomain using s=<subdomain> (e.g. make maintenance-s s=portal)"; \
		exit 1; \
	fi
	@if [ ! -f "infrastructure/nginx/conf.d/vhost.$(s).maintenance.conf" ]; then \
		echo "❌ Pre-flight Check Failed: 'infrastructure/nginx/conf.d/vhost.$(s).maintenance.conf' does not exist!"; \
		exit 1; \
	fi
	@echo "🚨 [PRE-FLIGHT PASSED] Enabling maintenance mode for subdomain: $(s)..."
	@cd infrastructure/nginx/conf.d && ln -sf vhost.$(s).maintenance.conf vhost.$(s).conf
	@make reload-nginx
	@echo "🚨 Subdomain '$(s)' is now in Maintenance Mode (HTTP 503)!"

restore-s: ## Atomically restore live traffic for specific subdomain with pre-flight checks (e.g. s=portal)
	@if [ -z "$(s)" ]; then \
		echo "❌ Error: Specify target subdomain using s=<subdomain> (e.g. make restore-s s=portal)"; \
		exit 1; \
	fi
	@if [ ! -f "infrastructure/nginx/conf.d/vhost.$(s).live.conf" ]; then \
		echo "❌ Pre-flight Check Failed: 'infrastructure/nginx/conf.d/vhost.$(s).live.conf' does not exist!"; \
		exit 1; \
	fi
	@echo "🔄 [PRE-FLIGHT PASSED] Restoring live traffic for subdomain: $(s)..."
	@cd infrastructure/nginx/conf.d && ln -sf vhost.$(s).live.conf vhost.$(s).conf
	@make reload-nginx
	@echo "✅ Subdomain '$(s)' restored to Live Production Mode (HTTP 200)!"

prod-maintenance-s: maintenance-s ## Alias for maintenance-s

prod-restore-s: restore-s ## Alias for restore-s

off: maintenance-s ## Alias to shutdown an individual subdomain (e.g. make off s=portal)

on: restore-s ## Alias to bring back an individual subdomain live (e.g. make on s=portal)

status-all: ## Display live vs maintenance status of all active ecosystem subdomains
	@echo "=================================================="
	@echo "📊 Ecosystem Subdomain Status Report"
	@echo "=================================================="
	@cd infrastructure/nginx/conf.d && \
	for f in vhost.*.conf; do \
		if [ -L "$$f" ]; then \
			sub=$$(echo $$f | sed 's/vhost.\(.*\).conf/\1/'); \
			target=$$(readlink $$f 2>/dev/null || echo $$f); \
			if echo "$$target" | grep -q "maintenance"; then \
				printf " 🔴 %-15s -> MAINTENANCE (HTTP 503)\n" "$$sub"; \
			else \
				printf " 🟢 %-15s -> LIVE        (HTTP 200)\n" "$$sub"; \
			fi; \
		fi; \
	done
	@echo "=================================================="

status: status-all ## Alias for status-all

maintenance-except-www: ## Enable maintenance mode for ALL subdomains except www/corporate domain
	@echo "🚨 Enabling maintenance mode for all subdomains EXCEPT www..."
	@cd infrastructure/nginx/conf.d && \
	for s in academy admin auth civic labs portal products tracker; do \
		if [ -f "vhost.$$s.maintenance.conf" ]; then \
			ln -sf vhost.$$s.maintenance.conf vhost.$$s.conf; \
		fi; \
	done
	@make reload-nginx
	@echo "🚨 All ecosystem subdomains are now in Maintenance Mode (HTTP 503)! Only www.$(BASE_DOMAIN) is LIVE."

restore-all: ## Restore live production traffic for ALL ecosystem subdomains
	@echo "🔄 Restoring live traffic for ALL ecosystem subdomains..."
	@cd infrastructure/nginx/conf.d && \
	for s in www academy admin auth civic labs portal products tracker; do \
		if [ -f "vhost.$$s.live.conf" ]; then \
			ln -sf vhost.$$s.live.conf vhost.$$s.conf; \
		fi; \
	done
	@make reload-nginx
	@echo "✅ All ecosystem subdomains restored to Live Production Mode (HTTP 200)!"

render-vhosts: ## Render Nginx vhost configuration files from templates using BASE_DOMAIN
	@echo "🔧 Rendering Nginx Virtual Hosts for domain: $(BASE_DOMAIN)..."
	@export BASE_DOMAIN=$(BASE_DOMAIN); \
	cd infrastructure/nginx/conf.d && \
	for f in *.template; do \
		if [ -f "$$f" ]; then \
			target=$$(echo "$$f" | sed 's/\.template$$//'); \
			envsubst '$$BASE_DOMAIN' < "$$f" > "$$target"; \
		fi; \
	done
	@make reload-nginx
	@echo "✨ Virtual host configs rendered and Nginx reloaded for domain: $(BASE_DOMAIN)!"

switch-to-com: ## Switch ecosystem domain configuration to .com (Production)
	@echo "🌐 Switching ecosystem domain configuration to startupjigawa.com..."
	@if [ -f .env ]; then \
		sed -i 's/BASE_DOMAIN=.*/BASE_DOMAIN=startupjigawa.com/g' .env 2>/dev/null || true; \
		grep -q "BASE_DOMAIN" .env || echo "BASE_DOMAIN=startupjigawa.com" >> .env; \
	else \
		echo "BASE_DOMAIN=startupjigawa.com" > .env; \
	fi
	@$(MAKE) render-vhosts BASE_DOMAIN=startupjigawa.com

switch-to-test: ## Switch ecosystem domain configuration to .test (Local Dev)
	@echo "🧪 Switching ecosystem domain configuration to startupjigawa.test..."
	@if [ -f .env ]; then \
		sed -i 's/BASE_DOMAIN=.*/BASE_DOMAIN=startupjigawa.test/g' .env 2>/dev/null || true; \
		grep -q "BASE_DOMAIN" .env || echo "BASE_DOMAIN=startupjigawa.test" >> .env; \
	else \
		echo "BASE_DOMAIN=startupjigawa.test" > .env; \
	fi
	@$(MAKE) render-vhosts BASE_DOMAIN=startupjigawa.test

test-routing: ## Run subdomain routing verification script
	@node scripts/test-subdomains.js

logs: ## View recent subdomain server and Docker compose logs
	@echo "--- Subdomain Server Logs ---"
	@tail -n 50 subdomain-stack.log 2>/dev/null || true
	@echo "--- Docker Compose Logs ---"
	@docker compose logs --tail=50

clean-volumes: ## Purge persistent database volumes
	@echo "=================================================="
	@echo "⚠️ WARNING: Purging persistent database volumes..."
	@echo "=================================================="
	@docker compose down -v --remove-orphans
	@echo "🧹 Persistent volume data purged successfully."

seed: ## Run database schema push and seed initial data
	@echo "🌱 Running Database Seeder Engine..."
	@cd packages/database && (./node_modules/.bin/prisma db push || npx prisma db push) && npm run seed
	@echo "✨ Database seeding complete!"