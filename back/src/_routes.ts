import { Router } from 'express';
import movementRoute from './modules/routes/movement.route';
import categoryRoute from './modules/routes/category.route';
import accountRoute from './modules/routes/account.route';
import budgetRoute from './modules/routes/budget.route';
import recurringRoute from './modules/routes/recurring.route';
import reportRoute from './modules/routes/report.route';
import authRoute from './modules/routes/auth.route';
import docsRoute from './modules/routes/docs.route';
import { authenticate } from './middlewares/auth.middleware';

const router = Router();

router.use('/auth', authRoute);
router.use('/docs', docsRoute); // public + before authenticate; still under global limiter
router.use(authenticate);
router.use('/movement', movementRoute);
router.use('/category', categoryRoute);
router.use('/account', accountRoute);
router.use('/budget', budgetRoute);
router.use('/recurring', recurringRoute);
router.use('/report', reportRoute);

export default router;
