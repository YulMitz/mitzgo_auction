# mitzgo_auction

Member-invite-only premium auction site. Currently in scaffold stage — no
business logic or UI design has been committed yet. See
`openspec/changes/init-project-scaffold/` for the spec that drives this
skeleton, and `openspec/changes/init-project-scaffold/design.md` Open
Questions for everything deliberately deferred.

## Stack

- **nginx** — reverse proxy, single host ingress on `:80`
- **backend** — TypeScript + Express, `/api/*`
- **frontend** — Vue 3 + Vite + TypeScript SPA
- **postgres** — 16-alpine, named volume `postgres_data`
- Orchestrated by `docker compose`

## Quickstart

```bash
cp .env.example .env
# edit .env — at minimum change POSTGRES_PASSWORD
docker compose up --build
```

Then:

- `http://localhost/` → Vue 3 SPA (shows "Mitzgo Auction" placeholder)
- `http://localhost/api/health` → `{"status":"ok","db":"connected"}`

To reset the database:

```bash
docker compose down -v   # -v wipes the postgres_data volume
```

## ⚠️ HTTPS not configured

This skeleton serves plain HTTP on `:80`. **Do not expose it to the public
internet** until the follow-up change wiring the GoDaddy domain and TLS
certificate has landed. See `design.md` Open Questions #1 and #2.

## Working with OpenSpec

This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for
spec-driven development. Each feature/refactor is staged as a change under
`openspec/changes/<name>/` with a proposal, design doc, tasks list, and per-
capability spec deltas. Completed changes get archived into
`openspec/changes/archive/` and their deltas merged into the baseline at
`openspec/specs/`.

Common commands:

```bash
openspec list                          # active changes
openspec list --specs                  # baseline capabilities
openspec validate <change> --strict    # gate before commit/archive
openspec archive <change> -y           # finalise + merge baseline
```
