# Proposal: Dockerize the monorepo (back/, web/, client-flutter/)

## Intent

Enable running the whole PersonalFinance stack (`back` + `web` + Mongo, optionally `client-flutter` web target) together with a single command, for cross-service integration testing and demos. Today `back/` and `client-flutter/` are dockerized but only run standalone; `web/` has no Docker artifacts at all, and no shared network wires the services together.

## Scope

### In Scope
- New `web/Dockerfile` (bun-based, mirroring `back/`'s multi-stage `dev`/`prod` split).
- One orchestrating root `docker-compose.yml` referencing each sub-project via `build.context`, putting all services on a shared Docker network.
- Context-aware API base URL for `web/` so SSR (server-side) resolves `back` by service name while the browser bundle keeps `http://localhost:3000`.
- Fix the `CORS_ORIGINS` port bug in `back/scripts/onboarding.mjs` (5173 → 4200) as an in-passing correction.
- `web/.dockerignore`.

### Out of Scope
- `client-flutter` Android/iOS native builds (do not run in a container at runtime); only its existing `web-server` target participates.
- Replacing `back/`'s primary dev workflow (`./start-dev.sh` → native API + dockerized Mongo). See decision below.
- Rewriting `back/` or `client-flutter/` Dockerfiles (reused as-is).
- Root `CLAUDE.md` staleness fixes (`front/`→`web/`, env-config claim) — flag separately, orthogonal to Docker.

## Capabilities

### New Capabilities
- `container-orchestration`: run the full stack together via one root compose file on a shared network.
- `web-containerization`: build and run the Angular SSR app in a container.

### Modified Capabilities
- None (no existing spec-level behavior changes).

## Approach

Approach 1 from exploration: three independent per-project Dockerfiles + one root orchestrator, matching the repo's "independently-versioned sub-projects" convention. Only `web/Dockerfile` is newly written. Root compose reuses `back/compose.yaml`'s `mongodb`/`api` definitions via Compose `include:` where available, else careful duplication.

**SSR networking (strategy only):** make `web/`'s API base URL context-aware — SSR points at the `back` service name, browser keeps `localhost:3000`, mirroring `client-flutter`'s existing `hostOverride` pattern. Implementation is `sdd-design`'s job.

**back/ dev workflow — DECISION: COEXIST (not replace).** Root compose is an *additional* fully-containerized option; `back/start-dev.sh`'s native+Mongo-only path stays the primary inner-loop for backend-only work. Rationale: it's the documented mandatory path, native run gives faster hot-reload for solo daily work, and replacing it forces cascading edits to `ONBOARD.md`/`CLAUDE.md` for no solo-dev benefit. The unused `api` service in `back/compose.yaml` already proves both paths can coexist.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `web/Dockerfile` | New | Multi-stage bun build |
| `web/.dockerignore` | New | Exclude node_modules/dist |
| `docker-compose.yml` (root) | New | Orchestrates all services |
| `web/src/environments/*.ts` | Modified | Context-aware apiUrl |
| `web/src/app/.../summary-by-month.component.ts` | Modified | SSR-safe API host |
| `back/scripts/onboarding.mjs` | Modified | CORS 5173→4200 |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| SSR eager fetch hits web container's own loopback | High | Context-aware base URL (design phase) |
| Compose `include:` version support | Med | Fall back to duplicated service blocks |
| back/ dev workflows drift apart | Med | Coexist explicitly; document both paths |
| CORS still blocks real frontend | Med | Fix port as part of this change |

## Rollback Plan

Delete `web/Dockerfile`, `web/.dockerignore`, root `docker-compose.yml`; revert the two `web/environments` edits, the component edit, and the `onboarding.mjs` one-line CORS change. `back/` and `client-flutter/` standalone flows are untouched.

## Dependencies

- Docker Compose v2 (`include:` needs v2.20+; otherwise duplicate service blocks).

## Success Criteria

- [ ] `docker compose up` at repo root starts Mongo, `back`, and `web` on a shared network.
- [ ] `web` SSR renders without `ECONNREFUSED` — server-side calls reach `back` by service name.
- [ ] Browser-side calls from `web` still reach `back` via published host port.
- [ ] `back/start-dev.sh` native workflow still works unchanged.
- [ ] Generated `.env` uses `CORS_ORIGINS=http://localhost:4200`.
