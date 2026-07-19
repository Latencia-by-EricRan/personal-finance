import { Router } from 'express';
import docsRoute from './modules/routes/docs.route';
import { createAuthRouter } from './contexts/auth/infrastructure/http/auth.route';
import { createAuthenticate } from './contexts/auth/infrastructure/http/authenticate.middleware';
import { createCategoryRouter } from './contexts/category/infrastructure/http/category.route';
import { createMovementRouter } from './contexts/movement/infrastructure/http/movement.route';
import { createAccountRouter } from './contexts/account/infrastructure/http/account.route';
import { createBudgetRouter } from './contexts/budget/infrastructure/http/budget.route';
import { createRecurringRouter } from './contexts/recurring/infrastructure/http/recurring.route';
import { createReportRouter } from './contexts/report/infrastructure/http/report.route';
import { getContainer } from './composition-root';

const router = Router();

router.use('/auth', createAuthRouter(getContainer().auth));
router.use('/docs', docsRoute); // public + before authenticate; still under global limiter
router.use(createAuthenticate(getContainer().auth.tokenService));
router.use('/movement', createMovementRouter(getContainer().movement));
router.use('/category', createCategoryRouter(getContainer().category));
router.use('/account', createAccountRouter(getContainer().account));
router.use('/budget', createBudgetRouter(getContainer().budget));
router.use('/recurring', createRecurringRouter(getContainer().recurring));
router.use('/report', createReportRouter(getContainer().report));

export default router;
