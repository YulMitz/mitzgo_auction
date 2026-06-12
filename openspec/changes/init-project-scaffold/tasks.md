## 1. Repo hygiene

- [ ] 1.1 Extend `.gitignore` with `node_modules/`, `dist/`, `.env`,
  `*.log`, OS junk, and Postgres volume noise
- [ ] 1.2 Author `.env.example` listing every env var the stack consumes
  (Postgres credentials, backend port)
- [ ] 1.3 Update `README.md` with quickstart (`cp .env.example .env`,
  `docker compose up --build`, health-check URL) and an explicit "no HTTPS
  yet" warning

## 2. Backend skeleton

- [ ] 2.1 `cd backend && npm init -y`; add `express`, `pg`, `dotenv`, `cors`
  as deps
- [ ] 2.2 Add dev deps: `typescript`, `tsx`, `@types/node`, `@types/express`,
  `@types/pg`, `@types/cors`
- [ ] 2.3 Write `backend/tsconfig.json` targeting ES2022 + CommonJS, strict
  mode, `outDir: dist`, `rootDir: src`
- [ ] 2.4 Wire `backend/package.json` scripts: `dev` (tsx watch),
  `build` (tsc), `start` (node dist/index.js)
- [ ] 2.5 Implement `backend/src/db.ts`: `pg.Pool` from env vars, exported
  `pingDb()` helper
- [ ] 2.6 Implement `backend/src/index.ts`: Express app, `/api/health`
  endpoint, boot-time Postgres ping with retries, exit on failure, listen on
  `BACKEND_PORT`
- [ ] 2.7 Write `backend/Dockerfile` (multi-stage: build with `npm ci` +
  `npm run build`; runtime image runs `node dist/index.js`)

## 3. Frontend skeleton

- [ ] 3.1 Scaffold `frontend/` from the Vite `vue-ts` template
- [ ] 3.2 Trim the default Vite demo content; render a `Mitzgo Auction`
  heading on the root route
- [ ] 3.3 Confirm `npm run build` produces `frontend/dist/`
- [ ] 3.4 Write `frontend/Dockerfile` (multi-stage: build with Node, copy
  `dist/` into an `nginx:stable-alpine` runtime image OR a builder image
  used by the nginx service — see task 4.3 for layout choice)

## 4. Nginx config

- [ ] 4.1 Write `nginx/nginx.conf` (or `nginx/conf.d/default.conf`) with
  upstream `backend:3000`, `location /api/` → `proxy_pass`, `location /` →
  `root /usr/share/nginx/html` with SPA `try_files $uri /index.html`
  fallback
- [ ] 4.2 Write `nginx/Dockerfile` based on `nginx:stable-alpine` that
  copies the conf into `/etc/nginx/conf.d/` and the frontend build output
  into `/usr/share/nginx/html`
- [ ] 4.3 Verify the chosen layout: frontend builds in its own stage,
  artifacts are mounted/copied into the nginx image at build time (no
  separate frontend runtime container)

## 5. Postgres + docker-compose

- [ ] 5.1 Author `docker-compose.yml` with services `nginx`, `backend`,
  `frontend` (build stage only), `postgres`; declare named volume
  `postgres_data`
- [ ] 5.2 Add Postgres healthcheck (`pg_isready`) and `depends_on` with
  `condition: service_healthy` on backend
- [ ] 5.3 Set `env_file: .env` on the services that need it; expose nginx
  on host `:80`
- [ ] 5.4 Confirm `docker compose config` parses without errors

## 6. Verification

- [ ] 6.1 Run `docker compose up --build -d` from a clean state with a
  valid `.env`; confirm all services reach `running` (or document the
  blocker if the host docker setup can't run it)
- [ ] 6.2 `curl http://localhost/api/health` returns `200` with
  `{"status":"ok","db":"connected"}`
- [ ] 6.3 `curl http://localhost/` returns HTML containing `Mitzgo Auction`
- [ ] 6.4 Insert a row via `psql`, `docker compose down`, `docker compose
  up`, query the row back → confirms volume persistence
- [ ] 6.5 `openspec validate init-project-scaffold --strict` passes
