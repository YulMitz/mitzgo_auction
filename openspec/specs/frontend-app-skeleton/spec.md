# frontend-app-skeleton Specification

## Purpose
TBD - created by archiving change init-project-scaffold. Update Purpose after archive.
## Requirements
### Requirement: Frontend is a Vue 3 + Vite + TypeScript SPA

The frontend SHALL be a single-page application built with Vue 3, Vite, and
TypeScript, located in `frontend/`, scaffolded from the official `vue-ts`
Vite template.

#### Scenario: Source tree shape

- **WHEN** the repository is inspected
- **THEN** `frontend/package.json` declares `vue` and `vite` as dependencies,
  TypeScript is configured via `frontend/tsconfig.json`, and `frontend/src/`
  contains the Vue application entry point

### Requirement: Frontend displays the project placeholder

The default page rendered at `/` SHALL contain the visible text
`Mitzgo Auction` so a developer can confirm the build pipeline is wired end
to end.

#### Scenario: Placeholder text is rendered

- **WHEN** a client sends `GET http://localhost/` against the running stack
- **THEN** the returned HTML contains the substring `Mitzgo Auction`

### Requirement: Frontend supports dev and prod build pipelines

The frontend `package.json` SHALL define `dev` and `build` scripts so that
local iteration uses the Vite dev server and the production container ships
static assets compiled by `vite build`.

#### Scenario: Dev script runs Vite

- **WHEN** a developer runs `npm run dev` in `frontend/`
- **THEN** the Vite dev server starts and serves the SPA with hot module
  replacement

#### Scenario: Build emits static assets

- **WHEN** a developer runs `npm run build` in `frontend/`
- **THEN** `vite build` produces a `frontend/dist/` directory containing
  `index.html` and a hashed asset bundle

### Requirement: Built frontend is served through nginx

In the docker compose stack, the production frontend assets SHALL be served by
the nginx container (not a Node process), so that the SPA shares an origin
with the API under nginx.

#### Scenario: Frontend assets reside in nginx container

- **WHEN** `docker compose up --build` is run
- **THEN** the nginx container's web root contains the `vite build` output and
  serves `index.html` for non-`/api` paths

