import { Request, Response } from 'express';
import { deletedResponse, errorResponse, successResponse } from '../../../../middlewares/response.middleware';
import { toMessage, toPagination } from '../../../../utils/controller.util';
import { RecurringProps } from '../../domain/Recurring';
import { RecurringPatch } from '../../application/ports/RecurringRepository';
import { RecurringUseCases } from '../../application/RecurringUseCases';

/**
 * Inbound HTTP adapter (design D1/D12). Factory over `RecurringUseCases` — no
 * static import of `getContainer()` here, so this controller can be
 * unit-tested with plain mock use cases (mock-layer-below convention).
 * Mirrors `createBudgetController`/`createAccountController`'s shape.
 *
 * Byte-identical response shapes/status codes to the legacy
 * `modules/controllers/recurring.controller.ts` — including `runRecurrings`,
 * which always responds `200` (an empty array is a legitimate "nothing was
 * due" result, not an error).
 */
export const createRecurringController = (useCases: RecurringUseCases) => {
    const getRecurrings = async (req: Request, res: Response) => {
        try {
            const recurrings = await useCases.findRecurrings.execute({}, toPagination(req.query));
            successResponse(res, recurrings);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const getRecurringById = async (req: Request, res: Response) => {
        try {
            const recurring = await useCases.findRecurringById.execute(req.params.id);
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
            const recurring = await useCases.createRecurring.execute(req.body as RecurringProps);
            successResponse(res, recurring, 201);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const updateRecurring = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const recurring = await useCases.updateRecurring.execute(id, req.body as RecurringPatch);
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
            const recurring = await useCases.deleteRecurring.execute(id);
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
            const movements = await useCases.runRecurrings.execute();
            successResponse(res, movements);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    return {
        getRecurrings,
        getRecurringById,
        createRecurring,
        updateRecurring,
        deleteRecurring,
        runRecurrings,
    };
};
