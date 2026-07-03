import { Request, Response, NextFunction } from 'express';
import AuthService from '../modules/services/auth.service';
import { errorResponse } from './response.middleware';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        errorResponse(res, 'Unauthorized', 401);
        return;
    }
    const token = header.slice(7);
    try {
        AuthService.verifyToken(token);
        next();
    } catch {
        errorResponse(res, 'Unauthorized', 401);
    }
};

export { authenticate };
