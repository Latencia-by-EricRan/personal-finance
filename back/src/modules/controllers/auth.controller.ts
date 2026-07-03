import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import AuthService from '../services/auth.service';
import { authConfig } from '../../config/auth.config';
import { successResponse, errorResponse } from '../../middlewares/response.middleware';

const login = async (req: Request, res: Response) => {
    try {
        const { Email, Password } = matchedData<{ Email: string; Password: string }>(req);
        const valid = await AuthService.verifyCredentials(Email, Password);
        if (!valid) {
            errorResponse(res, 'Invalid credentials', 401);
            return;
        }
        const token = AuthService.signToken();
        successResponse(res, { token, expiresIn: authConfig.jwtExpiresIn });
    } catch (error: unknown) {
        errorResponse(res, error instanceof Error ? error.message : 'Internal server error');
    }
};

export { login };
