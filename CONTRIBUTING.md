# Contributing

This is a monorepo with three independent sub-projects — `back/` (Express/TS/MongoDB
API), `web/` (Angular SSR client), `client-flutter/` (Flutter mobile/web client). See
each project's own `CLAUDE.md` for stack-specific conventions.

## Branches

Two long-lived branches:

- `main` — production.
- `qa` — QA environment.

Both are protected: pull requests are required, direct pushes are blocked (including
for admins), and force-pushes/deletions are disabled.

## Branch naming

```
<type>/<scope>/<short-description>
```

- **type** — matches the conventional-commit type of the change: `feature`, `fix`,
  `chore`, `docs`, `refactor`, `test`, `hotfix`.
- **scope** — the exact top-level folder the change touches: `back`, `web`,
  `client-flutter`, or `repo` for cross-cutting changes (root docs, CI, `.gitignore`).
- **short-description** — kebab-case, 2-5 words, in English.

Examples:

```
feature/client-flutter/dashboard-screen
feature/back/recurring-run-endpoint
fix/web/transfer-validation
chore/repo/branch-protection-docs
hotfix/back/jwt-expiry-check
```

## Promotion flow

- `feature/*`, `fix/*`, `chore/*`, `refactor/*`, `test/*`, `docs/*` branch off `qa`.
  Open the PR against `qa`; that's where the QA environment deploys from.
- Once `qa` is stable and ready to ship, open a promotion PR from `qa` into `main`.
- `hotfix/*` is the one exception: it branches off `main` directly for urgent
  production fixes. Open the PR against `main`, then open a follow-up PR (or merge)
  to bring the same fix into `qa` so it isn't lost on the next promotion.
- Keep branches short-lived and delete them after merging.
