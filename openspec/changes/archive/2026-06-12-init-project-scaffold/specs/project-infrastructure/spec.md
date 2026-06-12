## ADDED Requirements

### Requirement: Stack is orchestrated via docker compose

The project SHALL ship a top-level `docker-compose.yml` that declares four
services — `nginx`, `backend`, `frontend`, `postgres` — on a single default
network, so the entire stack starts with one command.

#### Scenario: Compose file parses cleanly

- **WHEN** a developer runs `docker compose config` at the repo root
- **THEN** the command exits 0 and prints the resolved configuration without
  errors

#### Scenario: Stack starts end-to-end

- **WHEN** a developer runs `docker compose up -d --build` with a valid `.env`
  file present
- **THEN** all four services reach a `running` state and `docker compose ps`
  reports no exited containers

### Requirement: Nginx is the single ingress and routes by path prefix

The nginx service SHALL listen on host port `80` and route requests so that
`/api/*` proxies to the backend service and all other paths serve the built
Vue 3 frontend assets with SPA fallback.

#### Scenario: API requests reach backend

- **WHEN** a client sends `GET http://localhost/api/health`
- **THEN** nginx proxies the request to `backend:3000` and returns the backend
  response

#### Scenario: SPA requests serve the frontend

- **WHEN** a client sends `GET http://localhost/` or any non-`/api` path
- **THEN** nginx returns the built `index.html` (SPA fallback) so client-side
  routing works

### Requirement: Postgres data persists across container restarts

The Postgres service SHALL store its data in a named docker volume so data
survives `docker compose down` followed by `docker compose up`.

#### Scenario: Data survives a restart

- **WHEN** a row is inserted into any table, the stack is brought down with
  `docker compose down` (without `-v`), then started again with `docker compose
  up`
- **THEN** the inserted row is still queryable

#### Scenario: Volume removal is opt-in

- **WHEN** a developer runs `docker compose down` without `-v`
- **THEN** the `postgres_data` volume remains intact and `docker volume ls`
  still lists it

### Requirement: Secrets and config are sourced from environment variables

The project SHALL read all secrets and per-environment config from a `.env`
file at the repo root, never from committed sources. A `.env.example` file
SHALL be committed and document every variable the stack expects.

#### Scenario: `.env` is gitignored

- **WHEN** a developer runs `git check-ignore .env`
- **THEN** the command exits 0 (the file is ignored)

#### Scenario: `.env.example` enumerates every required key

- **WHEN** the keys read by `docker-compose.yml` or any service are compared
  against `.env.example`
- **THEN** every key consumed by the stack appears in `.env.example` with a
  non-secret placeholder value

### Requirement: Backend waits for Postgres readiness before starting

The compose definition SHALL declare a Postgres healthcheck and make the
backend service depend on the database being healthy, so the backend does not
race the database on first boot.

#### Scenario: Backend waits for healthy database

- **WHEN** `docker compose up` is run from a cold state
- **THEN** the backend service does not enter `running` until the Postgres
  service reports `healthy`
