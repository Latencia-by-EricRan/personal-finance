import { Router } from 'express';
import { getReportByCategory, getReportCashflow, getReportMonthly } from '../controllers/report.controller';
import { monthYearParamValidator, yearParamValidator } from '../validators/report.validator';

const router = Router();

/**
 * start path: /report
 * */

router.get('/by-category/:month/:year', monthYearParamValidator, getReportByCategory);
router.get('/monthly/:year',             yearParamValidator,     getReportMonthly);
router.get('/cashflow/:month/:year',     monthYearParamValidator, getReportCashflow);

export default router;
