import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../../../../middlewares/response.middleware';
import { TokenService } from '../../application/TokenService';

/**
 * Relocated from `middlewares/auth.middleware.ts` as a factory over
 * `TokenService` (design D15): the middleware only ever needs token
 * verification, never credential checking, so it depends on `TokenService`
 * alone instead of the legacy monolithic `AuthService`. `_routes.ts` builds
 * this once from `getContainer().auth.tokenService` and mounts it before
 * every context router (byte-identical Bearer gating/401 shape to legacy).
 */
export const createAuthenticate = (tokenService: TokenService) => (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        errorResponse(res, 'Unauthorized', 401);
        return;
    }
    const token = header.slice(7);
    try {
        tokenService.verify(token);
        next();
    } catch {
        errorResponse(res, 'Unauthorized', 401);
    }
};
