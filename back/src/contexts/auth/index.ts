export { createAuthRouter } from './infrastructure/http/auth.route';
export { createAuthenticate } from './infrastructure/http/authenticate.middleware';
export type { AuthUseCases } from './application/AuthUseCases';

// Wired (PR3b): `composition-root.ts` builds `container.auth` from
// `credentialsConfig`/`tokenConfig` (`infrastructure/authConfig.ts`), and
// `_routes.ts` mounts `createAuthRouter(getContainer().auth)` at `/auth` and
// `createAuthenticate(getContainer().auth.tokenService)` globally before
// every other context router (design D14/D15/D16), replacing the legacy
// `modules/routes/auth.route.ts` + `middlewares/auth.middleware.ts`. auth has
// no domain/repository — no persisted model export.
