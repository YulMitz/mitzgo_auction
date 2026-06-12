## Why

mitzgo-auction is a greenfield repo with no application code yet. Before any auction
features, member-invite flows, or UI work can land, the project needs a stable,
reproducible dev stack: container orchestration, service boundaries, the reverse
proxy in front, and a working database. Locking these foundations down first lets
every future change focus purely on product behavior instead of plumbing.

## What Changes

- Add `docker-compose.yml` orchestrating four services: `nginx` (reverse proxy),
  `backend` (TypeScript + Express API), `frontend` (Vue 3 SPA built and served as
  static assets), `postgres` (data store).
- Add `nginx/` config that terminates HTTP on port 80, routes `/api/*` → backend,
  everything else → frontend. HTTPS / GoDaddy cert wiring is **deferred** to a
  follow-up change once the domain and cert files are available.
- Add `backend/` skeleton: TypeScript + Express, `/api/health` endpoint, Postgres
  connectivity check on boot, `npm run dev` (tsx watch) for dev and
  `npm run build` + `npm start` for prod.
- Add `frontend/` skeleton: Vue 3 + Vite + TypeScript scaffold, default page
  displays the "Mitzgo Auction" placeholder. Built artifacts shipped through nginx.
- Add `postgres` service with a named volume so data survives container restarts.
- Add `.env.example` documenting every required env var; extend `.gitignore` to
  cover `node_modules/`, `dist/`, `.env`, and the Postgres data volume.
- **No business logic, auth flow, auction domain model, or UI design** in this
  change — those are scoped to follow-up changes once requirements are settled.

## Capabilities

### New Capabilities

- `project-infrastructure`: docker-compose orchestration, inter-service networking,
  nginx reverse-proxy layer, Postgres data store, env-var conventions, persistent
  volume layout.
- `backend-api-skeleton`: TypeScript + Express service shell, `/api/health`
  endpoint, Postgres connectivity check on boot, dev/prod build pipeline.
- `frontend-app-skeleton`: Vue 3 + Vite + TypeScript SPA shell, build pipeline,
  static asset serving through nginx.

### Modified Capabilities

None — this is the first change in the project; no baseline specs exist yet.

## Impact

- New top-level files: `docker-compose.yml`, `.env.example`, updated `.gitignore`,
  updated `README.md` (with quickstart commands).
- New directories: `backend/`, `frontend/`, `nginx/`.
- New runtime dependencies (declared per service): `express`, `pg`, `dotenv`,
  `cors` (backend); `vue`, `vue-router` (frontend); Postgres 16 image; nginx
  stable-alpine image.
- New dev dependencies: `typescript`, `tsx`, `@types/*`, `vite`, `@vitejs/plugin-vue`,
  `vue-tsc`.
- Host requirements: Docker + docker-compose (already installed on dev machine).
- **Deferred / out of scope**: production deploy target, GoDaddy domain, TLS
  certificate, member-invite auth, auction business logic, frontend design.
  All tracked in `design.md` Open Questions.
