import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../../../middlewares/response.middleware';
import { toMessage } from '../../../../utils/controller.util';
import { ReportUseCases } from '../../application/ReportUseCases';

/**
 * Inbound HTTP adapter (design D13/D16). Factory over `ReportUseCases` — no
 * static import of `getContainer()` here, so this controller can be
 * unit-tested with plain mock use cases (mock-layer-below convention).
 * Mirrors `createRecurringController`/`createBudgetController`'s shape.
 *
 * Byte-identical response shapes/status codes to the legacy
 * `modules/controllers/report.controller.ts`. report is read-only (3 GET
 * endpoints), so there is no create/update/delete handler.
 */
export const createReportController = (useCases: ReportUseCases) => {
    const getReportByCategory = async (req: Request, res: Response) => {
        try {
            const month = Number(req.params.month);
            const year = Number(req.params.year);
            const report = await useCases.getReportByCategory.execute(month, year);
            successResponse(res, report);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const getReportMonthly = async (req: Request, res: Response) => {
        try {
            const year = Number(req.params.year);
            const report = await useCases.getReportMonthly.execute(year);
            successResponse(res, report);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const getReportCashflow = async (req: Request, res: Response) => {
        try {
            const month = Number(req.params.month);
            const year = Number(req.params.year);
            const report = await useCases.getReportCashflow.execute(month, year);
            successResponse(res, report);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    return {
        getReportByCategory,
        getReportMonthly,
        getReportCashflow,
    };
};
