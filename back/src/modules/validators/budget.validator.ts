import { NextFunction, Request, Response } from 'express';
import { body, Meta, param, ValidationChain } from 'express-validator';
import { validate } from '../../interceptors/validator.interceptor';
import { checkKeys } from '../../utils/validator.util';


// Variables
const isPost = (_value: unknown, { req }: Meta) => req.method === 'POST';


// Validates
const bodyValidate: ValidationChain[] = [
    body('Category').if(isPost).notEmpty().withMessage('Category is required'),
    body('Category').optional().isMongoId().withMessage('Category must be a valid id'),
    body('Month').if(isPost).notEmpty().withMessage('Month is required'),
    body('Month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be an integer between 1 and 12'),
    body('Year').if(isPost).notEmpty().withMessage('Year is required'),
    body('Year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Year must be an integer between 2000 and 2100'),
    body('Limit').if(isPost).notEmpty().withMessage('Limit is required'),
    body('Limit').optional().isFloat({ min: 0 }).withMessage('Limit must be a number greater than or equal to 0'),
    body().optional().custom(checkKeys.bind(null, ['Category', 'Month', 'Year', 'Limit'])),
];


// Middlewares
const idValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await param('id').isMongoId().run(req);
        validate(req, res, next);
    } catch (error: unknown) {
        next(error);
    }
};

const bodyValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await Promise.all(bodyValidate.map(validation => validation.run(req)));
        validate(req, res, next);
    } catch (error: unknown) {
        next(error);
    }
};

const statusParamValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await param('month').isInt({ min: 1, max: 12 }).run(req);
        await param('year').isInt({ min: 2000, max: 2100 }).run(req);
        validate(req, res, next);
    } catch (error: unknown) {
        next(error);
    }
};


export {
    idValidator,
    bodyValidator,
    statusParamValidator,
}
