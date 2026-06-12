## ADDED Requirements

### Requirement: Backend is a TypeScript Express service

The backend SHALL be implemented as a Node.js service using Express and
TypeScript, located in `backend/`, with all source code under `backend/src/`
and a single entry point.

#### Scenario: Source tree shape

- **WHEN** the repository is inspected
- **THEN** `backend/package.json` declares `express` and `typescript` as
  dependencies and an entry point file exists at `backend/src/index.ts`

### Requirement: Backend exposes a health endpoint

The backend SHALL expose `GET /api/health` returning HTTP 200 with a JSON
body that includes the service status and the current Postgres connectivity
state.

#### Scenario: Health endpoint when database is reachable

- **WHEN** a client sends `GET /api/health` and Postgres is reachable
- **THEN** the response is `200 OK` with body `{"status": "ok", "db":
  "connected"}`

#### Scenario: Health endpoint when database is unreachable

- **WHEN** a client sends `GET /api/health` and Postgres is unreachable
- **THEN** the response status is `503` with body `{"status": "degraded", "db":
  "down"}`

### Requirement: Backend verifies Postgres connectivity at boot

On startup, the backend SHALL attempt a Postgres connection using credentials
sourced from environment variables and SHALL log the outcome before accepting
HTTP traffic.

#### Scenario: Successful boot logs connection

- **WHEN** the backend starts and Postgres is reachable
- **THEN** the process logs a message containing `"db connected"` (case
  insensitive) before opening the HTTP listener

#### Scenario: Failed boot exits non-zero

- **WHEN** the backend starts and Postgres is unreachable for longer than the
  configured retry window
- **THEN** the process logs an error containing `"db connection failed"` and
  exits with a non-zero status code

### Requirement: Backend supports dev and prod build pipelines

The backend `package.json` SHALL define `dev`, `build`, and `start` scripts so
that local iteration uses TypeScript watch mode and the production container
runs compiled JavaScript.

#### Scenario: Dev script runs TypeScript with watch

- **WHEN** a developer runs `npm run dev` in `backend/`
- **THEN** the service starts via a TypeScript runner (e.g. `tsx watch`) and
  restarts on `.ts` file changes

#### Scenario: Build emits compiled JS

- **WHEN** a developer runs `npm run build` in `backend/`
- **THEN** `tsc` compiles sources to `backend/dist/` and `npm start` runs
  `node dist/index.js`

### Requirement: Backend reads configuration from environment

The backend SHALL read its Postgres connection settings (host, port, user,
password, database name) and its HTTP port from environment variables, with no
hard-coded secrets.

#### Scenario: Required env vars consumed

- **WHEN** the backend starts
- **THEN** it reads `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`,
  `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `BACKEND_PORT` from `process.env` and
  fails fast if any required variable is missing
