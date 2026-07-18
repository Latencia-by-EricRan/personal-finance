import { NextFunction, Request, Response } from 'express';
import { param } from 'express-validator';
import { validate } from '../../../../interceptors/validator.interceptor';

/**
 * Copied 1:1 from the legacy `modules/validators/report.validator.ts`
 * (design PR2, mirrors recurring.validator's PR1 precedent): route table/
 * validation behavior stays byte-identical, only the file's location changes
 * to become `report`'s inbound HTTP infrastructure. report has 3 read-only
 * GET endpoints (no POST/PUT/DELETE), so only param validation is needed —
 * no request-body validator, unlike budget/recurring.
 */

// Middlewares
const monthYearParamValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await param('month').isInt({ min: 1, max: 12 }).run(req);
        await param('year').isInt({ min: 2000, max: 2100 }).run(req);
        validate(req, res, next);
    } catch (error: unknown) {
        next(error);
    }
};

const yearParamValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await param('year').isInt({ min: 2000, max: 2100 }).run(req);
        validate(req, res, next);
    } catch (error: unknown) {
        next(error);
    }
};


export {
    monthYearParamValidator,
    yearParamValidator,
}
