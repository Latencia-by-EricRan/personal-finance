import { NextFunction, Request, Response } from 'express';
import { body, Meta, param, ValidationChain, validationResult } from 'express-validator';
import { errorResponse } from '../../../../middlewares/response.middleware';
import { validate } from '../../../../interceptors/validator.interceptor';
import { checkDate, checkKeys } from '../../../../utils/validator.util';
import { MovementDocument as MovementI } from '../MovementModel';



// Variables
const messageErrorDate = 'Invalid date format. Use YYYY-MM-DD format or a valid Date object.';
const isPost = (_value: unknown, { req }: Meta) => req.method === 'POST';


// Validates
//
// Mass-assignment whitelist (design D2, review follow-up carried from PR2):
// `checkKeys(['Type','Amount','Category','Account','Date','Description','Card'])`
// applies identically on POST (create) AND PUT (update) — `TransferId` is
// never in this list, so it is rejected with 400 on both verbs. This is the
// SOLE enforcement point: `UpdateMovement`/`CreateMovement` forward whatever
// this validator lets through (D2), they do not re-check the whitelist.
const addUpdateBodyValidate: ValidationChain[] = [
    body('Type').if(isPost).notEmpty().withMessage('Type is required'),
    body('Type').optional().isString().isIn(['ingreso', 'egreso']).withMessage('Type must be either "ingreso" or "egreso"'),
    body('Amount').if(isPost).notEmpty().withMessage('Amount is required'),
    body('Amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('Category').if(isPost).notEmpty().withMessage('Category is required'),
    body('Category').optional().isMongoId().withMessage('Category must be a valid id'),
    body('Account').if(isPost).notEmpty().withMessage('Account is required'),
    body('Account').optional().isMongoId().withMessage('Account must be a valid id'),
    body().custom(checkKeys.bind(null, ['Type', 'Amount', 'Category', 'Account', 'Date', 'Description', 'Card'])),
];


const paramBodyValidate: ValidationChain[] = [
    param('startDate').isISO8601().toDate().withMessage(messageErrorDate), // Especifica que el parámetro debe ser una fecha ISO8601 y lo convierte a un objeto Date
    param('endDate').notEmpty().custom(checkDate).withMessage(messageErrorDate), // Especifica que el parámetro no debe estar vacío y lo valida con la función checkDate
    body('Type').optional().isString().isIn(['ingreso', 'egreso']), // Especifica que el parámetro Type del body es opcional y debe ser un string
    body('Amount').optional().isNumeric(), // Especifica que el parámetro Amount del body es opcional y debe ser un número
    body('Card').optional().isString(), // Especifica que el parámetro Card del body es opcional y debe ser un string
    body('Category').optional().isString(), // Especifica que el parámetro Category del body es opcional y debe ser un string
    body('Description').optional().isString(), // Especifica que el parámetro Description del body es opcional y debe ser un string
    body('Account').optional().isString(), // Especifica que el parámetro Account del body es opcional y debe ser un string
    body().custom((value: Record<string, unknown>) => {
        // An empty body is valid here — it means "no filters, match the whole date range" —
        // unlike checkKeys() used on create/update bodies, where an empty body is a no-op error.
        const allowedKeys = ['Type', 'Amount', 'Card', 'Category', 'Description', 'Account'];
        const invalidKeys = Object.keys(value ?? {}).filter(key => !allowedKeys.includes(key));
        if (invalidKeys.length) {
            throw new Error(`Invalid parameters: ${invalidKeys.join(', ')}`);
        }
        return true;
    }),
];


// Middlewares
const addUpdateValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { Date: date } = req.body;

        // Date is required on create; on a partial PUT update it's optional like every other field.
        const dateOmittedOnPartialUpdate = date === undefined && req.method === 'PUT';

        if (!dateOmittedOnPartialUpdate) {
            if (!checkDate(date)) {
                return errorResponse(res, messageErrorDate, 400);
            }
            if (typeof date === 'string') {
                req.body.Date = new Date(date);
            }
        }

        const validations = [...addUpdateBodyValidate];

        // Check if the request is a PUT request, if so, validate id parameter
        if (req.method === 'PUT') {
            validations.push(param('id').isMongoId());
        }

        await Promise.all(validations.map(validation => validation.run(req)));
        validate(req, res, next);
    } catch (error: unknown) {
        console.error(error);
        errorResponse(res, error instanceof Error ? error.message : 'Internal server error', 400);
    }
};

const paramBodyValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await Promise.all(paramBodyValidate.map(validation => validation.run(req)));
        validate(req, res, next);
    } catch (error: unknown) {
        next(error);
    }
};

const paramDateValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await param('month').notEmpty().isString().run(req);
        await param('year').notEmpty().isString().run(req);
        validate(req, res, next);
    } catch (error: unknown) {
        next(error);
    }
};

const idValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await param('id').isMongoId().run(req);
        validate(req, res, next);
    } catch (error: unknown) {
        next(error);
    }
};

const manySaveValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await body().isArray().notEmpty().run(req);
        const arrayResult = validationResult(req);
        if (!arrayResult.isEmpty()) {
            return errorResponse(res, 'Validation failed', 400, arrayResult.array().map(e => e.msg as string));
        }

        const errors: string[] = [];
        await Promise.all(req.body.map(async (item: Partial<MovementI>, index: number) => {
            if (typeof item.Date === 'string' && checkDate(item.Date)) {
                item.Date = new Date(item.Date);
            }
            if (!checkDate(item.Date as string | Date)) {
                errors.push(`[${index}] ${messageErrorDate}`);
            }

            const fakeReq = { body: item, method: 'POST' } as Request;
            await Promise.all(addUpdateBodyValidate.map(validation => validation.run(fakeReq)));
            const itemResult = validationResult(fakeReq);
            if (!itemResult.isEmpty()) {
                errors.push(...itemResult.array().map(e => `[${index}] ${e.msg}`));
            }
        }));

        if (errors.length > 0) {
            return errorResponse(res, 'Validation failed', 400, errors);
        }

        next();
    } catch (error: unknown) {
        next(error);
    }
};



export {
    addUpdateValidator,
    paramBodyValidator,
    paramDateValidator,
    idValidator,
    manySaveValidator,
};
