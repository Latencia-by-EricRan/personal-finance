import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { successResponse } from '../../middlewares/response.middleware';

export const getHealth = (_request: Request, response: Response): void => {
    const connected = mongoose.connection.readyState === 1;
    successResponse(
        response,
        { status: connected ? 'ok' : 'unavailable', database: connected ? 'connected' : 'disconnected' },
        connected ? 200 : 503,
    );
};
