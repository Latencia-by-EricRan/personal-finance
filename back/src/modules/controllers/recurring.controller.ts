import { Request, Response } from 'express';
import { deletedResponse, errorResponse, successResponse } from '../../middlewares/response.middleware';
import { toMessage, toPagination } from '../../utils/controller.util';
import RecurringService from '../services/recurring.service';

const getRecurrings = async (req: Request, res: Response) => {
    try {
        const recurrings = await RecurringService.find({}, toPagination(req.query));
        successResponse(res, recurrings);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const getRecurringById = async (req: Request, res: Response) => {
    try {
        const recurring = await RecurringService.findById(req.params.id);
        if (!recurring) {
            errorResponse(res, 'Recurring not found', 404);
            return;
        }
        successResponse(res, recurring);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const createRecurring = async (req: Request, res: Response) => {
    try {
        const recurring = await RecurringService.create(req.body);
        successResponse(res, recurring, 201);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const updateRecurring = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const recurring = await RecurringService.update(id, req.body);
        if (!recurring) {
            errorResponse(res, 'Recurring not found', 404);
            return;
        }
        successResponse(res, recurring);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const deleteRecurring = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const recurring = await RecurringService.delete(id);
        if (!recurring) {
            errorResponse(res, 'Recurring not found', 404);
            return;
        }
        deletedResponse(res, id);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const runRecurrings = async (_req: Request, res: Response) => {
    try {
        const movements = await RecurringService.run();
        successResponse(res, movements);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};


export {
    getRecurrings,
    getRecurringById,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    runRecurrings,
}
