#!/usr/bin/env bash
set -e

# Load .env file if available in repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$REPO_ROOT/.env" ]; then
  # Export variables from .env if present
  export $(grep -v '^#' "$REPO_ROOT/.env" | xargs -0 2>/dev/null || true)
fi

# Dynamic Base Domain fallback to startupjigawa.test
BASE_DOMAIN="${BASE_DOMAIN:-startupjigawa.test}"
HOSTS_FILE="/etc/hosts"

# Microservice subdomain prefixes matrix
PREFIXES=("" "www" "auth" "academy" "tracker" "portal" "civic" "labs" "products" "admin")

DOMAINS=()
for prefix in "${PREFIXES[@]}"; do
  if [ -z "$prefix" ]; then
    DOMAINS+=("$BASE_DOMAIN")
  else
    DOMAINS+=("${prefix}.${BASE_DOMAIN}")
  fi
done

echo "=== Verifying Local Hosts File Setup (Target Domain: ${BASE_DOMAIN}) ==="

MISSING=()
for domain in "${DOMAINS[@]}"; do
  if ! grep -qE "127\.0\.0\.1[[:space:]]+${domain//./\\.}" "$HOSTS_FILE"; then
    MISSING+=("$domain")
  fi
done

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "✅ All ${#DOMAINS[@]} Startup Jigawa [${BASE_DOMAIN}] domain mappings are present in /etc/hosts"
else
  echo "⚠️ Missing ${#MISSING[@]} domain entries for [${BASE_DOMAIN}] in /etc/hosts:"
  for domain in "${MISSING[@]}"; do
    echo "  - 127.0.0.1 $domain"
  done

  echo ""
  echo "Attempting to update /etc/hosts..."
  NEW_ENTRIES=""
  for domain in "${MISSING[@]}"; do
    NEW_ENTRIES="${NEW_ENTRIES}127.0.0.1 $domain\n"
  done

  if sudo -n true 2>/dev/null; then
    printf "$NEW_ENTRIES" | sudo tee -a "$HOSTS_FILE" >/dev/null
    echo "✅ Successfully added missing domain mappings to /etc/hosts"
  else
    echo "🔑 Sudo privileges required to update /etc/hosts."
    echo "Run the following command in your terminal:"
    echo ""
    echo "sudo bash -c 'cat <<EOF >> /etc/hosts"
    for domain in "${MISSING[@]}"; do
      echo "127.0.0.1 $domain"
    done
    echo "EOF'"
    echo ""
  fi
fi
