# Shared API host and backend modules

## Public entry point

The shared API origin is `https://api.startupjigawa.com` (locally, `http://api.startupjigawa.test:8080` when using the Docker proxy port). Route families are namespaced so clients can use one base URL:

| API area | Public paths | Owner |
| --- | --- | --- |
| Identity | `/api/v1/auth/*`, `/api/v1/sessions*`, `/oauth/v2/*`, `/saml/v2/*` | `auth-service` |
| Academy | `/api/academy/*` | `api-service` → `modules/academy` |
| Tracker | `/api/tracker/*` | `api-service` → `modules/tracker` |
| Partner vault | `/api/vault/*` | `api-service` → `modules/portal` |
| Administration | `/api/admin/*` | `api-service` → `modules/admin` |
| Cloud operations | `/api/cloud/*` | `api-service` → `modules/cloud` |

Nginx routes identity paths to `auth-service:4000` and the domain API paths to `api-service:4100`. Both ports are private Compose-network ports. `auth.startupjigawa.com` remains the identity portal hostname and continues serving its pages and local identity routes.

## Source ownership

`apps/api-service/src/modules/` owns the current academy, tracker, partner-vault, admin, and cloud API handlers and their data/business services. The corresponding `apps/*` packages now export only frontend landing page renderers. `packages/app-server` serves pages and assets; it no longer executes API handlers.

Auth remains in `apps/auth-service`: it owns the identity portal, authentication, session, OAuth, and SAML implementation. The shared API hostname exposes those endpoints through Nginx so applications and external API clients have one public API origin.

## Browser calls and migration

Existing frontend requests to relative `/api/...` paths continue to work: each application vhost sends `/api/` requests to the shared API service. External clients can call the same paths at `https://api.startupjigawa.com`. Send access tokens as bearer tokens; cookie-based calls to the API origin require credentialed CORS. API handlers hydrate the current session before applying their existing authorization rules.

When adding a domain API, place its handler and data service under `apps/api-service/src/modules/<domain>/`, register its route prefix in `apps/api-service/src/index.js`, and add an Nginx mapping only if its requests need a different upstream. Keep database access inside API modules; frontend containers must not connect to Postgres or object storage.

## Operations

The API service is managed with the Compose stack and has a `/health` endpoint. Server-side S3 clients use `http://seaweedfs:8333` with `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and the configured `S3_BUCKET`; credentials must never be sent to browsers. SeaweedFS runs its S3 gateway, master, volume server, and filer in one node for this stack. Its files are persisted in the independent `seaweedfs_data` named volume, separate from Postgres `db_data`; configure off-host backups for both. SeaweedFS data is not a drop-in replacement for MinIO's on-disk volume, so existing MinIO objects must be copied through S3 APIs before retiring any old volume. Nginx vhost mode can be changed with `make maintenance-s s=api` and `make restore-s s=api`. Local host setup includes `api.startupjigawa.test`.
