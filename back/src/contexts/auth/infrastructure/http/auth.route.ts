import { Router } from 'express';
import { AuthUseCases } from '../../application/AuthUseCases';
import { createAuthController } from './auth.controller';
import { loginValidator } from './auth.validator';

/**
 * start path: /auth
 *
 * Router factory (design D14/D16): `_routes.ts` calls
 * `createAuthRouter(getContainer().auth)` once at boot, instead of importing
 * a static router bound to module-level singletons. Route table
 * (path/method) is byte-identical to the legacy `modules/routes/auth.route.ts`
 * — only handler construction (static import → factory) changed. No
 * dedicated route test file, matching `report`/`recurring`/`budget`'s
 * precedent — routers are exercised via `auth.e2e.test.ts`.
 */
export const createAuthRouter = (useCases: AuthUseCases): Router => {
    const router = Router();
    const controller = createAuthController(useCases);

    router.post('/login', loginValidator, controller.login);

    return router;
};
