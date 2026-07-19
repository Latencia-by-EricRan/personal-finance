/**
 * Side-effect-only module, imported FIRST in `composition-root.test.ts`
 * (PR3b, design D14/D16). `composition-root.ts` now eagerly imports
 * `contexts/auth/infrastructure/authConfig.ts`, whose `credentialsConfig`/
 * `tokenConfig` singletons throw at import time if `AUTH_ROOT_EMAIL`/
 * `AUTH_ROOT_PASSWORD`/`JWT_SECRET` are unset — same eager semantics as the
 * legacy `config/auth.config.ts`. `composition-root.test.ts` statically
 * imports `./composition-root` without going through
 * `test-utils/start-test-app.ts` (which sets these for e2e suites), so these
 * dummy values must be set before that import evaluates. ES module import
 * evaluation is depth-first in textual encounter order, so this file MUST
 * stay the first import in `composition-root.test.ts`. (Filename
 * deliberately avoids `.test.ts`/`.spec.ts` so vitest's default include glob
 * does not pick this up as its own test file.)
 *
 * Unconditional assignment (not `??=`): if any e2e suite already ran in the
 * same worker and left its own fixture values in `process.env` (e2e's
 * `test-utils/start-test-app.ts` sets these but never unsets them),
 * `composition-root.test.ts`'s assertions must still see this file's own
 * known values, not whatever a prior suite happened to leave behind — a
 * conditional `??=` would silently make this test order-dependent.
 */
process.env.AUTH_ROOT_EMAIL = 'composition-root-test@local.test';
process.env.AUTH_ROOT_PASSWORD = 'composition-root-test-password';
process.env.JWT_SECRET = 'composition-root-test-jwt-secret';
