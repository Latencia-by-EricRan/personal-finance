import { Router } from 'express';
import { AccountUseCases } from '../../application/AccountUseCases';
import { createAccountController } from './account.controller';
import { bodyValidator, idValidator, transferValidator } from './account.validator';

/**
 * start path: /account
 *
 * Router factory (design D1): `_routes.ts` calls
 * `createAccountRouter(getContainer().account)` once at boot, instead of
 * importing a static router bound to module-level singletons. Route table
 * (paths/methods/order) is byte-identical to the legacy
 * `modules/routes/account.route.ts` — incl. `/transfer` and `/:id/balance`
 * registered BEFORE the generic `/:id` — only handler construction (static
 * import → factory) changed.
 */
export const createAccountRouter = (useCases: AccountUseCases): Router => {
    const router = Router();
    const controller = createAccountController(useCases);

    router.get('/',               controller.getAccounts);
    router.post('/transfer',      transferValidator,    controller.createTransfer);
    router.get('/:id/balance',    idValidator,          controller.getAccountBalance);
    router.get('/:id',    idValidator,           controller.getAccountById);
    router.post('/',      bodyValidator,         controller.createAccount);
    router.put('/:id',    idValidator, bodyValidator, controller.updateAccount);
    router.delete('/:id', idValidator,           controller.archiveAccount);

    return router;
};
