# Design: Single-User JWT Auth Hardening & Documentation

## Technical Approach

Apply four small, independent changes on top of the existing single-user JWT flow. The runtime change stays in `src/config/auth.config.ts`, preserving module-load fail-fast validation used by `required()`. The documentation/task changes stay in `.env.example` and `tasks.json`; no route, controller, middleware, service, schema, or dependency changes are required.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Config validation timing | Validate `JWT_SECRET` and `JWT_EXPIRES_IN` at auth config module load | Validate during login/signToken | Startup failure is clearer and matches existing `required()` behavior. |
| Expiry validation | Use `/^\d+[smhd]$/` | Add `ms`, accept free-form strings | Keeps scope small, avoids dependency churn, and matches the spec examples. |
| Task correction | Update `tasks.json` via task-tracker rules only | Track correction elsewhere | `tasks.json` is the project source of truth. |

## Data Flow

```text
process.env ──→ auth.config.ts ──→ AuthService ──→ auth.controller/auth.middleware
     │
     └── .env.example documents valid local values

tasks.json ──→ ERR-03 affected_files + TOOL-08 corrected completion evidence
```

## File Changes

| File | Action | Description |
|---|---|---|
| `.env.example` | Modify | Add all 7 variables with placeholder values and inline format hints. |
| `src/config/auth.config.ts` | Modify | Add JWT secret length and expiry format guards. |
| `tasks.json` | Modify | Add `auth.controller.ts` to ERR-03; reopen and re-close TOOL-08 correctly. |

## Interfaces / Contracts

### `.env.example`

Use inline comments; do not include real secrets.

```dotenv
MONGO_CONN_STR=mongodb+srv://user:password@cluster.example.mongodb.net # MongoDB connection string
MONGO_DB_NAME=personal_finance # MongoDB database name
PORT=3000 # HTTP port; app defaults to 80 if omitted
AUTH_EMAIL=user@example.com # Single-user login email
AUTH_PASSWORD_HASH=<bcrypt-hash> # Generate with: npm run hash-password <plain>
JWT_SECRET=replace-with-random-secret-at-least-32-chars # Min 32 characters
JWT_EXPIRES_IN=7d # ms-compatible: 30s, 5m, 2h, 7d, 30d
```

### `authConfig` hardening

Keep the existing helper and export shape; bind validated constants once.

```ts
const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) {
    throw new Error('[Auth] Invalid JWT_SECRET: must be at least 32 characters.');
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '1d';
if (!/^\d+[smhd]$/.test(jwtExpiresIn)) {
    throw new Error('[Auth] Invalid JWT_EXPIRES_IN: expected <number><unit> using s, m, h, or d. Examples: 30s, 5m, 2h, 7d.');
}
```

Then export `jwtSecret` and `jwtExpiresIn` through the existing `authConfig` object. Do **not** add `ms`, change token signing, add refresh/logout, rename `responose.middleware.ts`, or call `res.json()` directly.

### `tasks.json`

- ERR-03: append `src/modules/controllers/auth.controller.ts` to `affected_files`; do not change status or dependency fields.
- TOOL-08: transition `done → pending → done`; final state must have a fresh `updated_at`, `completed_at`, and notes explaining it was reopened because `.env.example` was empty and re-closed after population. Recalculate `meta` after each status transition; final counts should remain unchanged if no other task changes occur.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Static | TypeScript compiles | Run `npm run build`; no test runner exists. |
| Runtime config | Invalid `JWT_SECRET` / `JWT_EXPIRES_IN` fails fast | Start/import with short secret and invalid expiry; confirm descriptive errors. |
| Documentation/task | `.env.example` and `tasks.json` satisfy specs | Manual review against env-documentation and auth-config specs. |

## Migration / Rollout

No data migration required. Existing environments with `JWT_SECRET` shorter than 32 characters or invalid `JWT_EXPIRES_IN` must update `.env` before restart.

## Open Questions

- [ ] None blocking. During apply, verify `.env` is loaded before `authConfig` reads `process.env`; fixing dotenv import order is outside this four-deliverable scope unless startup verification fails.
