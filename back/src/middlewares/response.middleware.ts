import { Response } from 'express';

const successResponse = <T,>(res: Response, data: T, statusCode: number = 200): void => {
    res.status(statusCode).json(data);
}

const errorResponse = (res: Response, message: string, statusCode: number = 500, errors?: string[]) => {
    const body: { message: string; errors?: string[] } = { message: message ?? 'Internal server error' };
    if (errors && errors.length > 0) body.errors = errors;
    res.status(statusCode).json(body);
}

const deletedResponse = (res: Response, id: string): void => {
    successResponse(res, { deleted: true, id });
}

export {
    successResponse,
    errorResponse,
    deletedResponse
}
