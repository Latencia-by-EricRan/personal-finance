import { NextFunction, Request, Response } from 'express';
import { param } from 'express-validator';
import { validate } from '../../interceptors/validator.interceptor';


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
