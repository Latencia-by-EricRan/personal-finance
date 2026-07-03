import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../middlewares/response.middleware';
import { toMessage } from '../../utils/controller.util';
import ReportService from '../services/report.service';

const getReportByCategory = async (req: Request, res: Response) => {
    try {
        const month = Number(req.params.month);
        const year = Number(req.params.year);
        const report = await ReportService.byCategory(month, year);
        successResponse(res, report);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const getReportMonthly = async (req: Request, res: Response) => {
    try {
        const year = Number(req.params.year);
        const report = await ReportService.monthly(year);
        successResponse(res, report);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const getReportCashflow = async (req: Request, res: Response) => {
    try {
        const month = Number(req.params.month);
        const year = Number(req.params.year);
        const report = await ReportService.cashflow(month, year);
        successResponse(res, report);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};


export {
    getReportByCategory,
    getReportMonthly,
    getReportCashflow,
}
