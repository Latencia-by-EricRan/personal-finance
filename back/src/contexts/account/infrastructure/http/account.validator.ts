import { NextFunction, Request, Response } from 'express';
import { body, Meta, param, ValidationChain } from 'express-validator';
import { validate } from '../../../../interceptors/validator.interceptor';
import { checkDate, checkKeys } from '../../../../utils/validator.util';

/**
 * Copied 1:1 from the legacy `modules/validators/account.validator.ts`
 * (design PR3): route table/validation behavior stays byte-identical, only
 * the file's location changes to become `account`'s inbound HTTP
 * infrastructure. See the PR3.1 characterization baseline
 * (`src/e2e/account-http.characterization.e2e.test.ts`) for the pinned
 * observable behavior this preserves.
 */

// Variables
const isPost = (_value: unknown, { req }: Meta) => req.method === 'POST';


// Validates
const bodyValidate: ValidationChain[] = [
    body('Name').if(isPost).notEmpty().withMessage('Name is required'),
    body('Name').optional().isString().withMessage('Name must be a string'),
    body('Type').if(isPost).notEmpty().withMessage('Type is required'),
    body('Type').optional().isString().isIn(['efectivo', 'banco', 'tarjeta']),
    body('Currency').isString().optional().notEmpty(),
    body('Icon').isString().optional(),
    body('Archived').isBoolean().optional(),
    body().optional().custom(checkKeys.bind(null, ['Name', 'Type', 'Currency', 'Icon', 'Archived'])),
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

const transferBodyValidate: ValidationChain[] = [
    body('From').isMongoId().withMessage('From must be a valid id'),
    body('To').isMongoId().withMessage('To must be a valid id'),
    body('Amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('Date').notEmpty().withMessage('Date is required').custom(checkDate),
    body('Description').optional().isString(),
    body().custom((_value, { req }: Meta) => {
        if (req.body.From === req.body.To) {
            throw new Error('From and To must be different accounts');
        }
        return true;
    }),
];

const transferValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.body.Date === 'string' && checkDate(req.body.Date)) {
            req.body.Date = new Date(req.body.Date);
        }

        await Promise.all(transferBodyValidate.map(validation => validation.run(req)));
        validate(req, res, next);
    } catch (error: unknown) {
        next(error);
    }
};


export {
    idValidator,
    bodyValidator,
    transferValidator,
}
