import { Router } from 'express';
import { MovementUseCases } from '../../application/MovementUseCases';
import { createMovementController } from './movement.controller';
import {
    addUpdateValidator,
    idValidator,
    manySaveValidator,
    paramBodyValidator,
    paramDateValidator,
} from './movement.validator';

/**
 * start path: /movement
 *
 * Router factory (design D1): `_routes.ts` calls
 * `createMovementRouter(getContainer().movement)` once at boot, instead of
 * importing a static router bound to module-level singletons. Route table
 * (paths/methods/order) is byte-identical to the legacy
 * `modules/routes/movement.route.ts` — only handler construction changed
 * (static import → factory).
 */
export const createMovementRouter = (useCases: MovementUseCases): Router => {
    const router = Router();
    const controller = createMovementController(useCases);

    router.get('/month', controller.getMovementsCurrentMonth);
    router.get('/summary/:month/:year', paramDateValidator, controller.getSummaryByMonth);
    router.get('/:startDate/:endDate', paramBodyValidator, controller.getMovementsByFilters);
    router.post('/:startDate/:endDate', paramBodyValidator, controller.getMovementsByFilters);
    router.post('/', addUpdateValidator, controller.createMovement);
    router.post('/save', manySaveValidator, controller.saveMovements);
    router.put('/:id', addUpdateValidator, controller.updateMovement);
    router.delete('/:id', idValidator, controller.deleteMovement);

    return router;
};
