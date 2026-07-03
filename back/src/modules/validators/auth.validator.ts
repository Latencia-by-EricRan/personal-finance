import { body, ValidationChain } from 'express-validator';
import { validate } from '../../interceptors/validator.interceptor';
import { Request, Response, NextFunction } from 'express';

const loginValidationChain: ValidationChain[] = [
    body('Email').isEmail().withMessage('Email must be a valid email address'),
    body('Password').isString().notEmpty().withMessage('Password is required'),
];

const loginValidator = async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(loginValidationChain.map(v => v.run(req)));
    validate(req, res, next);
};

export { loginValidator };
