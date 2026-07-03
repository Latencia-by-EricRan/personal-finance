import { NextFunction, Request, Response } from 'express';
import { body, Meta, param, ValidationChain } from 'express-validator';
import { validate } from '../../interceptors/validator.interceptor';
import { checkKeys } from '../../utils/validator.util';


// Variables
const isPost = (_value: unknown, { req }: Meta) => req.method === 'POST';


// Validates
const bodyValidate: ValidationChain[] = [
    body('Type').if(isPost).notEmpty().withMessage('Type is required'),
    body('Type').optional().isIn(['ingreso', 'egreso']),
    body('Amount').if(isPost).notEmpty().withMessage('Amount is required'),
    body('Amount').optional().isFloat(),
    body('Category').if(isPost).notEmpty().withMessage('Category is required'),
    body('Category').optional().isMongoId(),
    body('Account').if(isPost).notEmpty().withMessage('Account is required'),
    body('Account').optional().isMongoId(),
    body('DayOfMonth').if(isPost).notEmpty().withMessage('DayOfMonth is required'),
    body('DayOfMonth').optional().isInt({ min: 1, max: 31 }),
    body('Frequency').isIn(['mensual']).optional(),
    body('Active').isBoolean().optional(),
    body('Description').isString().optional(),
    body('Card').isString().optional(),
    body().optional().custom(checkKeys.bind(null, ['Type', 'Amount', 'Category', 'Account', 'DayOfMonth', 'Frequency', 'Active', 'Description', 'Card'])),
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


export {
    idValidator,
    bodyValidator,
}
