# Exploration: single-user-jwt-auth

**Date**: 2026-06-29  
**Status**: complete  
**Phase**: explore

---

## Executive Summary

JWT single-user authentication (SEC-02) has been fully implemented and is functionally correct. The token flow — login → bcrypt verification → JWT sign → Bearer extraction → jwt.verify — is sound, and all edge cases (expired, malformed, missing tokens) are handled by jwt.verify throwing and the catch block returning 401. The route guard topology is correct: `/auth` is public, `/movement` and `/category` are globally guarded via `router.use(authenticate)`. One concrete gap was found: `.env.example` exists but is **completely empty** (0 bytes) despite TOOL-08 being marked done — all four auth environment variables are undocumented. The `auth.controller.ts` also repeats the ERR-03 `error.status` bug pattern, though only on unlikely error paths.

---

## Current State

The API now has single-user JWT authentication:
- **No User collection** — credentials live exclusively in `.env` (`AUTH_EMAIL` + `AUTH_PASSWORD_HASH`)
- `bcryptjs@^3.0.3` handles password hashing/comparison
- `jsonwebtoken@^9.0.3` handles token signing/verification
- Token expiry is configurable via `JWT_EXPIRES_IN` (default: `'1d'`)
- `authConfig` enforces required env vars at startup (throws `Error` if missing)

---

## Affected Files

| File | Role |
|------|------|
| `src/config/auth.config.ts` | Reads + validates env vars at startup |
| `src/modules/services/auth.service.ts` | `verifyCredentials`, `signToken`, `verifyToken` |
| `src/modules/controllers/auth.controller.ts` | `login` handler |
| `src/modules/validators/auth.validator.ts` | `loginValidator` (Email + Password) |
| `src/modules/routes/auth.route.ts` | `POST /auth/login` |
| `src/middlewares/auth.middleware.ts` | `authenticate` Bearer middleware |
| `src/_routes.ts` | Route guard topology |
| `.env.example` | ⚠️ Exists but is 0 bytes |

---

## Token Flow

```
POST /auth/login
  → loginValidator       (Email: isEmail, Password: notEmpty)
  → login controller
      → matchedData({ Email, Password })
      → AuthService.verifyCredentials(email, password)
          → email === authConfig.authEmail          (string equality)
          → bcrypt.compare(password, authConfig.authPasswordHash)
      → AuthService.signToken()
          → jwt.sign({ sub: authEmail }, jwtSecret, { expiresIn })
      → successResponse(res, { token, expiresIn })

Subsequent requests to /movement/* or /category/*:
  → authenticate middleware
      → req.headers.authorization.startsWith('Bearer ')  (missing → 401)
      → token = header.slice(7)
      → AuthService.verifyToken(token)
          → jwt.verify(token, jwtSecret)               (throws on expired/malformed/invalid)
      → next()                                          (success)
      → catch { errorResponse(res, 'Unauthorized', 401) } (any failure → 401)
```

---

## Findings

### ✅ Correct implementations

- **`loginValidator`**: uses `Promise.all` on express-validator chains + synchronous `validate()` — no throw risk
- **`authenticate` catch block**: ES2019 optional catch binding (`catch {` with no binding) — clean, intentional
- **Route guard order**: `/auth` mounted before `router.use(authenticate)` — login is correctly public
- **`verifyToken` throws**: `jwt.verify` throws `JsonWebTokenError`, `TokenExpiredError`, `NotBeforeError` — all caught as 401
- **`authConfig`**: throws `Error` at module load if `JWT_SECRET`, `AUTH_EMAIL`, or `AUTH_PASSWORD_HASH` are missing — fail-fast behavior
- **PascalCase fields**: `Email`, `Password` in `matchedData` — consistent with project convention
- **`verifyToken` return value discarded**: intentional for single-user — no need to populate `req.user`

### ⚠️ Gaps and bugs found

1. **`.env.example` is 0 bytes** — TOOL-08 was marked `done` but the file was created empty. Four auth vars are completely undocumented: `JWT_SECRET`, `JWT_EXPIRES_IN`, `AUTH_EMAIL`, `AUTH_PASSWORD_HASH`. MongoDB vars are also absent.

2. **`error.status` in `auth.controller.ts` catch** — `errorResponse(res, error.message ?? error, error.status)` — `error.status` is `undefined` for standard JS/jsonwebtoken errors, which defaults to HTTP 500. This is the same ERR-03 bug pattern. The risk is low (only hits on truly unexpected errors), but the affected_files list in ERR-03 should include `auth.controller.ts`.

3. **`JWT_EXPIRES_IN` unconstrained** — Any string value is accepted from env. Invalid formats (e.g., `'abc'`) would cause `jwt.sign()` to throw a runtime error at the first login attempt, not at startup.

4. **`JWT_SECRET` has no minimum length/entropy guard** — `authConfig` only checks for presence (`!value`), not quality. A weak or short secret is accepted without warning.

5. **`expiresIn` exposed in login response** — `successResponse(res, { token, expiresIn: authConfig.jwtExpiresIn })` — exposes the raw env var string to clients. Not a security vulnerability, but it's an implementation detail that shouldn't need to be client-facing.

### ❌ Not in tasks.json (new findings)

| Finding | Severity | Description |
|---------|----------|-------------|
| `AUTH-NEW-01` | Medium | `.env.example` is 0 bytes despite TOOL-08 marked done — all 7 env vars undocumented |
| `AUTH-NEW-02` | Low | `auth.controller.ts` not in ERR-03 affected_files — same `error.status` bug pattern |
| `AUTH-NEW-03` | Low | `JWT_EXPIRES_IN` format not validated at startup — only fails at first `jwt.sign()` call |

---

## Gaps

- `.env.example` needs all required variables documented (JWT_SECRET, JWT_EXPIRES_IN, AUTH_EMAIL, AUTH_PASSWORD_HASH, MONGO_CONN_STR, MONGO_DB_NAME, PORT)
- `auth.controller.ts` should be added to ERR-03's `affected_files`
- Optional: startup validation of `JWT_EXPIRES_IN` format
- Optional: minimum `JWT_SECRET` length check at startup
- No refresh token or logout/token-invalidation — acceptable for single-user personal finance

---

## Recommended Scope

This change is **already functionally complete**. The proposal should focus on:

1. **Populate `.env.example`** (fix TOOL-08 gap — the most concrete deliverable)
2. **Add `auth.controller.ts` to ERR-03's affected_files** (documentation fix in tasks.json)
3. **Optional hardening** (not blocking): validate `JWT_EXPIRES_IN` format at startup, add minimum `JWT_SECRET` length guard

The scope should NOT include refresh tokens, logout endpoints, or `req.user` augmentation — these are out of scope for single-user architecture.

---

## Risks

- **CRITICAL NONE** — No critical correctness bugs in the auth flow itself
- **HIGH**: `.env.example` being empty means a new developer would be blocked immediately — they can't start the server without reading source code (`authConfig.ts`) to discover required vars
- **MEDIUM**: Weak `JWT_SECRET` accepted silently at startup — tokens could be forged if secret is short/predictable
- **LOW**: `error.status` undefined in auth controller catch — 500 instead of appropriate status on unexpected errors (low-probability path)

---

## Approaches Considered

| Approach | Description | Pros | Cons | Effort |
|----------|-------------|------|------|--------|
| A — Minimal fix | Populate `.env.example` only | Zero risk, unblocks onboarding | Leaves minor bugs | XS |
| B — Hardening | `.env.example` + JWT_SECRET length check + JWT_EXPIRES_IN format validation | Improves fail-fast behavior | Slightly more code | S |
| C — ERR-03 fix too | Include auth controller in ERR-03 fix scope | Consistent error handling | Bigger scope, mixes concerns | M |

**Recommendation**: Approach A (minimal) for this change. ERR-03 (and auth.controller.ts) should be addressed in a dedicated error-handling change.

---

## Next Recommended Phase

**propose** — The implementation is complete. The proposal should define the exact deliverables (`.env.example` content + optional startup hardening) and confirm out-of-scope items.

---

## Artifacts

- **Engram**: `sdd/single-user-jwt-auth/explore` (project: personal-finance-back)
- **OpenSpec**: `openspec/changes/single-user-jwt-auth/explore.md`
