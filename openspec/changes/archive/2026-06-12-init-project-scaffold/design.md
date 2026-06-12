## Context

mitzgo-auction will be a member-invite-only auction site for premium goods.
The target deployment is a single host running Docker, fronted by nginx with a
domain + TLS certificate purchased from GoDaddy. This change establishes the
container topology and service skeleton **only**; business logic, auth, and UI
arrive in subsequent changes once requirements are nailed down.

The project starts as a fresh git repo with only `README.md` committed. There is
no existing baseline spec to reconcile against.

## Goals / Non-Goals

**Goals:**

- Single command (`docker compose up`) spins up the full local dev stack.
- Clear service boundaries (`backend/`, `frontend/`, `nginx/`) so future code has
  an obvious home.
- Postgres data persists across `docker compose down && up` (named volume, not
  bind-mount, so it's portable across hosts).
- nginx is the single ingress on the host — both `/api/*` and `/` flow through it,
  so HTTPS termination later only needs to happen in one place.
- Backend fails fast and loudly if it can't reach Postgres on boot (no
  silently-degraded service).
- Secrets sourced from env vars; `.env` is gitignored; `.env.example` documents
  every required variable.

**Non-Goals:**

- No production deploy automation (no CI/CD, no remote provisioning).
- No HTTPS / TLS yet — nginx serves plain HTTP on `:80`. TLS lands in a follow-up
  once the GoDaddy cert files are in hand.
- No auth, no session storage, no user model.
- No auction domain model (lots, bids, lifecycle, payment).
- No frontend design system, component library choice, or visual styling beyond a
  default Vite scaffold + placeholder text.
- No DB migration tooling decision yet — schema work waits for the first feature
  change that actually needs tables.
- No automated test framework wired up yet (Vitest / Jest deferred to first
  feature that needs it).

## Decisions

### Container topology: 4 services, one network

`nginx` ↔ `backend` ↔ `postgres`, with `nginx` also serving `frontend` built
assets. All four sit on the default compose network, addressable by service name
(`backend`, `postgres`, etc.).

**Why over alternatives:**
- *Alt: nginx-only on host, services in compose* — couples deploy to a specific
  host's nginx install. Bundling nginx inside compose keeps the whole stack
  reproducible and lets us run the exact same topology locally and in prod.
- *Alt: frontend as its own Node service running `vite preview`* — extra moving
  part for no gain. Built static assets behind nginx is the standard SPA serving
  pattern and gives us caching headers for free.

### Backend: TS + Express, tsx for dev, tsc for prod

- Dev: `tsx watch src/index.ts` — fast TS execution, hot-reload on save.
- Prod: `tsc` compiles to `dist/`, `node dist/index.js` runs it.

**Why:** Express is what the user asked for. tsx is the current low-friction TS
runner; ts-node-dev is fine too but slower to boot. Splitting dev vs prod build
means the prod container ships only compiled JS + production deps.

### Frontend: Vue 3 + Vite + TypeScript via official scaffold

Use `npm create vite@latest` with the `vue-ts` template, strip any boilerplate
content down to a "Mitzgo Auction" placeholder. Build output (`dist/`) is copied
into the nginx container at build time via a multi-stage Dockerfile.

**Why:** Vite is the standard Vue 3 build tool now; the official scaffold gives
us TypeScript + tooling for free and keeps future upgrades trivial.

### Postgres 16, named volume

Image: `postgres:16-alpine`. Volume: `postgres_data` (named, declared at the top
level of `docker-compose.yml`). Credentials sourced from `.env`. Backend
connects via the `pg` library and a connection string assembled from env vars.

**Why 16:** current stable LTS, broad client support. **Why named volume:**
portable across hosts, no path-on-host coupling; users can still inspect with
`docker volume inspect`.

### nginx routing

Two upstream blocks: `backend` (container `backend:3000`) and the frontend static
root. Conf:

- `location /api/` → `proxy_pass http://backend:3000;`
- `location /` → `root /usr/share/nginx/html; try_files $uri /index.html;` (SPA
  fallback)

**Why:** Standard SPA + API split. Path-prefix routing keeps the backend
URL-space cleanly under `/api/*` and avoids CORS in the same-origin deploy.

### Env-var convention

Single `.env` file at repo root, consumed by compose's `env_file:` directive,
keys prefixed by concern: `POSTGRES_*` for DB, `BACKEND_*` for API config,
`FRONTEND_*` (currently empty) reserved. `.env.example` is the documented source
of truth — every key that compose reads MUST be listed there with a non-secret
placeholder.

### Health check shape

`GET /api/health` returns `200 {"status": "ok", "db": "connected" | "down"}`.
Backend pings Postgres at boot (fast-fail if down) and re-pings when the
endpoint is called so health reflects current DB reachability, not just boot
state.

## Risks / Trade-offs

- **[No HTTPS yet]** → Local dev is plain HTTP; before any auth or member data
  goes live, the follow-up change must wire TLS via GoDaddy cert files. Risk is
  someone deploys this skeleton publicly without that step — README warns
  prominently against it.
- **[Backend exits on Postgres unreachability at boot]** → Means `docker compose
  up` race conditions could fail the first start. Mitigation: compose
  `depends_on` + `healthcheck` on the postgres service so backend waits for DB
  ready.
- **[No migration tooling chosen]** → First feature change that touches schema
  has to make this decision (Drizzle vs Prisma vs node-pg-migrate vs raw SQL).
  Better to defer than guess wrong now.
- **[No test framework]** → Same logic — first non-trivial code addition picks
  the runner. Skeleton has nothing worth testing yet.
- **[Single shared `.env`]** → Convenient locally but couples backend and DB
  secrets in one file. Acceptable for now; can split per-service later if
  needed.

## Migration Plan

This is the first change — no existing state to migrate. Bootstrap steps for
anyone cloning the repo:

1. `cp .env.example .env` and fill in values.
2. `docker compose up --build`.
3. Visit `http://localhost/` → see Mitzgo Auction placeholder.
4. `curl http://localhost/api/health` → `{"status":"ok","db":"connected"}`.

Rollback: `docker compose down -v` removes containers + the Postgres volume.
Repo can be reset to the `cac6464` initial commit if the scaffold is rejected.

## Open Questions

These are deliberately deferred. Each will be resolved in its own follow-up
change once the user provides direction.

1. **Domain name** — GoDaddy-purchased domain to point at the host. Pending
   user.
2. **TLS certificate** — GoDaddy-issued cert + key files; whether to terminate
   in nginx directly or use Let's Encrypt as an alternative path. Pending user.
3. **Production host target** — VPS provider, region, deploy mechanism (manual
   `docker compose pull` vs. registry-based vs. GitHub Actions).
4. **Member-invite auth flow** — invitation issuance, accept/redeem,
   session/token model, account recovery. Entire auth capability.
5. **Auction business logic** — listing/lot model, bid lifecycle, timing
   (start/end, anti-snipe extensions), reserves, settlement, notifications.
6. **Frontend design / UX** — visual language, component library (or
   custom), routes, page inventory, locale.
7. **DB migration tooling** — Drizzle vs Prisma vs node-pg-migrate vs raw SQL
   files. Decide when the first schema-bearing feature lands.
8. **Test framework** — Vitest, Jest, or other; backend and frontend may pick
   differently. Decide when the first non-trivial code arrives.
9. **Email / notification provider** — needed for invite delivery and bid
   notifications.
10. **Payment / settlement integration** — out of scope for foreseeable initial
    work but flagged here so it's on the radar.
