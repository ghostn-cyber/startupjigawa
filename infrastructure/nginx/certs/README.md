# Startup Jigawa SSL/TLS Certificates Vault

This directory stores SSL/TLS certificates for HTTPS termination across all ecosystem subdomains.

## Directory Structure:
- `live/`: Production certificates (e.g., Let's Encrypt / Certbot output)
- `fullchain.pem`: Server certificate bundle
- `privkey.pem`: Private key

## Mounting:
This directory is mounted into the `jigawa_nginx_proxy` container at `/etc/nginx/certs:ro`.
