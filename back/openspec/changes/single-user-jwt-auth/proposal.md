# Proposal: Single-User JWT Auth — Hardening & Documentation

## Intent

JWT authentication (SEC-02) is **functionally complete and correct**. This change addresses three concrete gaps found during exploration: `.env.example` is empty (TOOL-08 was prematurely closed), `auth.controller.ts` is missing from ERR-03's scope, and two startup-time validation gaps leave the server silently accepting weak or malformed JWT config.

Without a populated `.env.example`, any new developer is blocked from starting the server — they must read `authConfig.ts` to discover required variables.

## Scope

### In Scope
- Populate `.env.example` with all 7 required variables + inline comments
- Reopen TOOL-08 → re-close it correctly after populating the file
- Add `auth.controller.ts` to ERR-03's `affected_files` in `tasks.json`
- Add `JWT_SECRET` minimum length guard (≥ 32 chars) in `authConfig`
- Add `JWT_EXPIRES_IN` format validation at startup (regex: `^\d+[smhd]$` or ms-compatible)

### Out of Scope
- Refresh tokens or token revocation
- Logout endpoint
- `req.user` TypeScript augmentation
- Multi-user or role-based access
- Changing any auth middleware behavior (it is correct)

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `env-documentation`: `.env.example` goes from 0 bytes to a fully documented template with all 7 required variables
- `auth-config`: `authConfig` adds startup-time validation for secret length and expiry format

## Approach

Four targeted, independent changes — no shared state, no migration, no schema changes:

1. **`.env.example`**: Write all 7 vars (`MONGO_CONN_STR`, `MONGO_DB_NAME`, `PORT`, `AUTH_EMAIL`, `AUTH_PASSWORD_HASH`, `JWT_SECRET`, `JWT_EXPIRES_IN`) with placeholder values and inline comments explaining format/generation.
2. **`tasks.json` ERR-03**: Add `src/modules/controllers/auth.controller.ts` to `affected_files`. No status change.
3. **`tasks.json` TOOL-08**: Reopen (`pending`), then re-close (`done`) after `.env.example` is populated.
4. **`authConfig` hardening**: After existing presence checks, add `JWT_SECRET.length < 32` guard and `JWT_EXPIRES_IN` regex validation — both throw at startup, consistent with current fail-fast behavior.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.env.example` | Modified | Populate from 0 bytes → 7 documented variables |
| `src/config/auth.config.ts` | Modified | Add length + format guards to existing startup checks |
| `tasks.json` ERR-03 | Modified | Add `auth.controller.ts` to `affected_files` |
| `tasks.json` TOOL-08 | Modified | Reopen + re-close to reflect actual completion |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Existing `JWT_SECRET` shorter than 32 chars breaks startup | Low | Documented in `.env.example` — dev must update `.env` |
| `JWT_EXPIRES_IN` regex too strict for valid ms strings like `'1 day'` | Low | Use ms-library-compatible pattern; test against known values |
| `tasks.json` edit conflicts | Low | task-tracker skill loaded; update meta counters after every change |

## Rollback Plan

`.env.example` changes are non-functional (no runtime impact). `authConfig` changes: revert the added guard lines — server restarts without length/format checks. `tasks.json` edits: revert `affected_files` addition and restore TOOL-08 to `done` with original timestamps.

## Dependencies

- ERR-01 must be `done` before ERR-03 can be implemented (TOOL-08 and the `affected_files` edit have no blocker)
- No external dependencies

## Success Criteria

- [ ] `.env.example` has all 7 variables; `npm run dev` works for a new clone with only `.env.example` as reference
- [ ] `authConfig` throws a descriptive error at startup if `JWT_SECRET` < 32 chars
- [ ] `authConfig` throws a descriptive error at startup if `JWT_EXPIRES_IN` format is invalid
- [ ] ERR-03 `affected_files` includes `auth.controller.ts`
- [ ] TOOL-08 re-closed with non-empty `.env.example` as evidence
