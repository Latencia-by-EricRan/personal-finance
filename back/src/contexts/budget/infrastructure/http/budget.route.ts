import { Router } from 'express';
import { BudgetUseCases } from '../../application/BudgetUseCases';
import { createBudgetController } from './budget.controller';
import { bodyValidator, idValidator, statusParamValidator } from './budget.validator';

/**
 * start path: /budget
 *
 * Router factory (design D1): `_routes.ts` calls
 * `createBudgetRouter(getContainer().budget)` once at boot, instead of
 * importing a static router bound to module-level singletons. Route table
 * (paths/methods/order) is byte-identical to the legacy
 * `modules/routes/budget.route.ts` — incl. `/status/:month/:year`
 * registered BEFORE the generic `/:id` — only handler construction (static
 * import → factory) changed.
 */
export const createBudgetRouter = (useCases: BudgetUseCases): Router => {
    const router = Router();
    const controller = createBudgetController(useCases);

    router.get('/status/:month/:year', statusParamValidator, controller.getBudgetStatus);
    router.get('/', controller.getBudgets);
    router.get('/:id', idValidator, controller.getBudgetById);
    router.post('/', bodyValidator, controller.createBudget);
    router.put('/:id', idValidator, bodyValidator, controller.updateBudget);
    router.delete('/:id', idValidator, controller.deleteBudget);

    return router;
};
