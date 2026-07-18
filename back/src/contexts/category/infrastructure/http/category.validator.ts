import { NextFunction, Request, Response } from 'express';
import { body, param, ValidationChain, validationResult } from 'express-validator';
import { validate } from '../../../../interceptors/validator.interceptor';
import { errorResponse } from '../../../../middlewares/response.middleware';
import { checkKeys } from '../../../../utils/validator.util';
import { CategoryProps } from '../../domain/Category';

// Validates
const bodyValidate: ValidationChain[] = [
    param('id').isMongoId().optional(),
    body('Name').isString().notEmpty(),
    body('Description').isString().notEmpty(),
    body('Type').isString().notEmpty().isIn(['variable', 'fijo']),
    body('Tag').isString().optional(),
    body('Icon').isString().optional(),
    body('Color').isString().optional(),
    body().optional().custom(checkKeys.bind(null, ['Name', 'Description', 'Type', 'Tag', 'Icon', 'Color'])),
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

/**
 * Per-item field validation for array bodies (mass-assignment `checkKeys`
 * guard + required-field rules — byte-identical contract to the legacy
 * `modules/validators/category.validator.ts`). Duplicate Tag/Name detection
 * across the batch is intentionally NOT here anymore: it moved into
 * `BulkSaveCategory` (design D2), and the controller maps its typed
 * `DuplicateCategoryKeyError` back to this same 400 `Validation failed`
 * shape.
 */
const validateArrayBody = async (req: Request, res: Response, next: NextFunction) => {
    await body().isArray().notEmpty().run(req);
    const arrayResult = validationResult(req);
    if (!arrayResult.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, arrayResult.array().map(e => e.msg as string));
    }

    const errors: string[] = [];
    await Promise.all(req.body.map(async (item: CategoryProps, index: number) => {
        const fakeReq = { body: item } as Request;
        await Promise.all(bodyValidate.map(validation => validation.run(fakeReq)));
        const itemResult = validationResult(fakeReq);
        if (!itemResult.isEmpty()) {
            errors.push(...itemResult.array().map(e => `[${index}] ${e.msg}`));
        }
    }));

    if (errors.length > 0) {
        return errorResponse(res, 'Validation failed', 400, errors);
    }

    next();
};

const bodyValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!Array.isArray(req.body)) {
            await Promise.all(bodyValidate.map(validation => validation.run(req)));
            return validate(req, res, next);
        }

        return validateArrayBody(req, res, next);
    } catch (error: unknown) {
        next(error);
    }
};

const manySaveValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await validateArrayBody(req, res, next);
    } catch (error: unknown) {
        next(error);
    }
};

export {
    idValidator,
    bodyValidator,
    manySaveValidator,
};
