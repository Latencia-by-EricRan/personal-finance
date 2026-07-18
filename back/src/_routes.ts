import { Router } from 'express';
import reportRoute from './modules/routes/report.route';
import authRoute from './modules/routes/auth.route';
import docsRoute from './modules/routes/docs.route';
import { authenticate } from './middlewares/auth.middleware';
import { createCategoryRouter } from './contexts/category/infrastructure/http/category.route';
import { createMovementRouter } from './contexts/movement/infrastructure/http/movement.route';
import { createAccountRouter } from './contexts/account/infrastructure/http/account.route';
import { createBudgetRouter } from './contexts/budget/infrastructure/http/budget.route';
import { createRecurringRouter } from './contexts/recurring/infrastructure/http/recurring.route';
import { getContainer } from './composition-root';

const router = Router();

router.use('/auth', authRoute);
router.use('/docs', docsRoute); // public + before authenticate; still under global limiter
router.use(authenticate);
router.use('/movement', createMovementRouter(getContainer().movement));
router.use('/category', createCategoryRouter(getContainer().category));
router.use('/account', createAccountRouter(getContainer().account));
router.use('/budget', createBudgetRouter(getContainer().budget));
router.use('/recurring', createRecurringRouter(getContainer().recurring));
router.use('/report', reportRoute);

export default router;
