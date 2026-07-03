import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { errorResponse } from '../middlewares/response.middleware';

/**
 * Middleware function to validate the incoming request using express-validator.
 * If validation errors are found, respond with a 400 status code and the errors.
 * If there are no validation errors, proceed to the next middleware.
 *
 * @param {Request} req - The incoming Express request object.
 * @param {Response} res - The outgoing Express response object.
 * @param {NextFunction} next - The callback function to trigger the next middleware.
 */
const validate = (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    errorResponse(res, 'Validation failed', 400, result.array().map(e => e.msg as string));
};

export {
    validate,
};
