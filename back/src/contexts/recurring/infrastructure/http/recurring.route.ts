import { Router } from 'express';
import { RecurringUseCases } from '../../application/RecurringUseCases';
import { createRecurringController } from './recurring.controller';
import { bodyValidator, idValidator } from './recurring.validator';

/**
 * start path: /recurring
 *
 * Router factory (design D1/D12): `_routes.ts` calls
 * `createRecurringRouter(getContainer().recurring)` once at boot, instead of
 * importing a static router bound to module-level singletons. Route table
 * (paths/methods/order) is byte-identical to the legacy
 * `modules/routes/recurring.route.ts` — incl. `POST /run` — only handler
 * construction (static import → factory) changed.
 */
export const createRecurringRouter = (useCases: RecurringUseCases): Router => {
    const router = Router();
    const controller = createRecurringController(useCases);

    router.get('/', controller.getRecurrings);
    router.get('/:id', idValidator, controller.getRecurringById);
    router.post('/', bodyValidator, controller.createRecurring);
    router.put('/:id', idValidator, bodyValidator, controller.updateRecurring);
    router.delete('/:id', idValidator, controller.deleteRecurring);
    router.post('/run', controller.runRecurrings);

    return router;
};
