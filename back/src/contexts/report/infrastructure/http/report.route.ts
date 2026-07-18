import { Router } from 'express';
import { ReportUseCases } from '../../application/ReportUseCases';
import { createReportController } from './report.controller';
import { monthYearParamValidator, yearParamValidator } from './report.validator';

/**
 * start path: /report
 *
 * Router factory (design D13/D16): `_routes.ts` calls
 * `createReportRouter(getContainer().report)` once at boot, instead of
 * importing a static router bound to module-level singletons. Route table
 * (paths/methods/order) is byte-identical to the legacy
 * `modules/routes/report.route.ts` — only handler construction (static
 * import → factory) changed.
 */
export const createReportRouter = (useCases: ReportUseCases): Router => {
    const router = Router();
    const controller = createReportController(useCases);

    router.get('/by-category/:month/:year', monthYearParamValidator, controller.getReportByCategory);
    router.get('/monthly/:year', yearParamValidator, controller.getReportMonthly);
    router.get('/cashflow/:month/:year', monthYearParamValidator, controller.getReportCashflow);

    return router;
};
