import { body, ValidationChain } from 'express-validator';
import { validate } from '../../../../interceptors/validator.interceptor';
import { Request, Response, NextFunction } from 'express';

/**
 * Byte-identical port of the legacy `modules/validators/auth.validator.ts`
 * (design PR3, D14/D16): only the file's location changes to become
 * `auth`'s inbound HTTP infrastructure.
 */

const loginValidationChain: ValidationChain[] = [
    body('Email').isEmail().withMessage('Email must be a valid email address'),
    body('Password').isString().notEmpty().withMessage('Password is required'),
];

const loginValidator = async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(loginValidationChain.map(v => v.run(req)));
    validate(req, res, next);
};

export { loginValidator };
