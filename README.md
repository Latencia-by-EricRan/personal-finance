# Personal Finance

A personal finance app: track movements (income/expenses), accounts, categories, budgets, and recurring transactions, with monthly/yearly reports. Backend REST API with a web client.

The Flutter mobile client (Android/iOS) lives in its own repository, `PersonalFinanceApp`.

## Monorepo layout

Two independent sub-projects, each with its own `CLAUDE.md`:

| Path    | Stack                                 | Role                |
| ------- | -------------------------------------- | -------------------- |
| `back/` | Express + TypeScript + MongoDB         | REST API (`:3000`)   |
| `web/`  | Angular 19 (SSR, standalone, zoneless) | Web client (`:4200`) |

See `back/CLAUDE.md` and `web/CLAUDE.md` for stack-specific conventions, and `back/ONBOARD.md` for the most up-to-date onboarding/testing/git-workflow reference.

## Quickstart

The backend must be up before the web client — it calls a hardcoded `http://localhost:3000`.

First time only, generate `back/.env`:

```bash
node back/scripts/onboarding.mjs --setup
```

### Everything containerized (Docker)

`start-dev.sh` at the root orchestrates the full stack (MongoDB + back + web) via `docker-compose.yml`:

```bash
./start-dev.sh up        # start mongo+back+web in the background
./start-dev.sh logs      # follow logs
./start-dev.sh status    # see what's running
./start-dev.sh down      # stop everything
./start-dev.sh build     # rebuild images
./start-dev.sh restart   # down + build + up
```

### Native dev loop (per sub-project)

```bash
cd back && ./start-dev.sh   # bootstraps Docker+Mongo+seed if needed, serves API on :3000
cd web && bun install && bun run start   # ng serve on :4200
```

## Contributing

Branching model, naming convention, and promotion flow (`qa` → `main`) are in [CONTRIBUTING.md](./CONTRIBUTING.md).
