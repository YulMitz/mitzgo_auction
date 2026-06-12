## 1. Repo hygiene

- [x] 1.1 Extend `.gitignore` with `node_modules/`, `dist/`, `.env`,
  `*.log`, OS junk, and Postgres volume noise
- [x] 1.2 Author `.env.example` listing every env var the stack consumes
  (Postgres credentials, backend port)
- [x] 1.3 Update `README.md` with quickstart (`cp .env.example .env`,
  `docker compose up --build`, health-check URL) and an explicit "no HTTPS
  yet" warning

## 2. Backend skeleton

- [x] 2.1 `cd backend && npm init -y`; add `express`, `pg`, `dotenv`, `cors`
  as deps (written directly into `package.json`)
- [x] 2.2 Add dev deps: `typescript`, `tsx`, `@types/node`, `@types/express`,
  `@types/pg`, `@types/cors`
- [x] 2.3 Write `backend/tsconfig.json` targeting ES2022 + CommonJS, strict
  mode, `outDir: dist`, `rootDir: src`
- [x] 2.4 Wire `backend/package.json` scripts: `dev` (tsx watch),
  `build` (tsc), `start` (node dist/index.js)
- [x] 2.5 Implement `backend/src/db.ts`: `pg.Pool` from env vars, exported
  `pingDb()` helper plus `waitForDb()` boot retry helper
- [x] 2.6 Implement `backend/src/index.ts`: Express app, `/api/health`
  endpoint, boot-time Postgres ping with retries, exit on failure, listen on
  `BACKEND_PORT`
- [x] 2.7 Write `backend/Dockerfile` (multi-stage: build with `npm install` +
  `npm run build`; runtime image runs `node dist/index.js`)

## 3. Frontend skeleton

- [x] 3.1 Scaffold `frontend/` from the Vite `vue-ts` template
- [x] 3.2 Trim the default Vite demo content (HelloWorld, hero assets,
  style.css); render a `Mitzgo Auction` heading on the root route
- [~] 3.3 Confirm `npm run build` produces `frontend/dist/`
  → blocked locally (no `npm install` run yet); deferred to first
  `docker compose up --build` on the user's docker engine. See 6.1.
- [x] 3.4 Write `frontend/Dockerfile` (multi-stage build → publish stage that
  copies built `dist/` into the shared `frontend_dist` volume on container
  start, then exits)

## 4. Nginx config

- [x] 4.1 Write `nginx/conf.d/default.conf` with upstream `backend:3000`,
  `location /api/` → `proxy_pass`, `location /` → `root /usr/share/nginx/html`
  with SPA `try_files $uri $uri/ /index.html` fallback
- [x] 4.2 Write `nginx/Dockerfile` based on `nginx:stable-alpine` that copies
  the conf into `/etc/nginx/conf.d/`; web root populated at runtime via the
  `frontend_dist` named volume
- [x] 4.3 Topology decision documented: frontend is an "init/publish"
  container that exits after copying assets into the shared volume; nginx
  waits via `service_completed_successfully`. No separate frontend runtime
  container — matches spec requirement that built assets ship through nginx.

## 5. Postgres + docker-compose

- [x] 5.1 Author `docker-compose.yml` with services `nginx`, `backend`,
  `frontend` (publish stage only), `postgres`; declare named volumes
  `postgres_data` and `frontend_dist`
- [x] 5.2 Add Postgres healthcheck (`pg_isready`) and `depends_on` with
  `condition: service_healthy` on backend
- [x] 5.3 Set `env_file: .env` on services that need it; expose nginx on host
  `:80`
- [x] 5.4 Confirm `docker compose config` parses without errors (verified via
  `docker-compose config` — output parses cleanly, all services + volumes
  resolved)

## 6. Verification

- [~] 6.1 Run `docker compose up --build -d` from a clean state with a valid
  `.env`; confirm all services reach `running`
  → **deferred to user.** Dev host runs podman + docker-compose v1.29 (no
  `podman compose` subcommand; `service_completed_successfully` not
  supported on compose v1.29). Real docker engine required. Compose file is
  spec-compliant — verified via `docker-compose config`. See blocker note
  in README quickstart.
- [~] 6.2 `curl http://localhost/api/health` returns `200` with
  `{"status":"ok","db":"connected"}`
  → deferred per 6.1. Backend implementation matches spec; verify after
  `docker compose up`.
- [~] 6.3 `curl http://localhost/` returns HTML containing `Mitzgo Auction`
  → deferred per 6.1. `App.vue` renders the exact string; verify after
  `docker compose up`.
- [~] 6.4 Insert a row via `psql`, `docker compose down`, `docker compose
  up`, query the row back → confirms volume persistence
  → deferred per 6.1.
- [x] 6.5 `openspec validate init-project-scaffold --strict` passes
