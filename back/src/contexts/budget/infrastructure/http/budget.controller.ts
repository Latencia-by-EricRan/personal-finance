import { Request, Response } from 'express';
import { deletedResponse, errorResponse, successResponse } from '../../../../middlewares/response.middleware';
import { toMessage, toPagination } from '../../../../utils/controller.util';
import { BudgetProps } from '../../domain/Budget';
import { BudgetPatch } from '../../application/ports/BudgetRepository';
import { BudgetUseCases } from '../../application/BudgetUseCases';

const isDuplicateKeyError = (error: unknown): boolean => (error as { code?: number })?.code === 11000;

/**
 * Inbound HTTP adapter (design D1). Factory over `BudgetUseCases` — no
 * static import of `getContainer()` here, so this controller can be
 * unit-tested with plain mock use cases (mock-layer-below convention).
 * Mirrors `createAccountController`/`createMovementController`'s shape.
 *
 * `createBudget`/`updateBudget` copy the legacy `isDuplicateKeyError`
 * (`code === 11000`) guard 1:1 (design D9) — the unique compound index
 * `{Category,Month,Year}` on `BudgetModel` throws this raw Mongo error,
 * translated here to a `400` with the exact legacy message.
 */
export const createBudgetController = (useCases: BudgetUseCases) => {
    const getBudgets = async (req: Request, res: Response) => {
        try {
            const budgets = await useCases.findBudgets.execute({}, toPagination(req.query));
            successResponse(res, budgets);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const getBudgetById = async (req: Request, res: Response) => {
        try {
            const budget = await useCases.findBudgetById.execute(req.params.id);
            if (!budget) {
                errorResponse(res, 'Budget not found', 404);
                return;
            }
            successResponse(res, budget);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const createBudget = async (req: Request, res: Response) => {
        try {
            const budget = await useCases.createBudget.execute(req.body as BudgetProps);
            successResponse(res, budget, 201);
        } catch (error: unknown) {
            if (isDuplicateKeyError(error)) {
                errorResponse(res, 'A budget already exists for this category in this month/year', 400);
                return;
            }
            errorResponse(res, toMessage(error));
        }
    };

    const updateBudget = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const budget = await useCases.updateBudget.execute(id, req.body as BudgetPatch);
            if (!budget) {
                errorResponse(res, 'Budget not found', 404);
                return;
            }
            successResponse(res, budget);
        } catch (error: unknown) {
            if (isDuplicateKeyError(error)) {
                errorResponse(res, 'A budget already exists for this category in this month/year', 400);
                return;
            }
            errorResponse(res, toMessage(error));
        }
    };

    const deleteBudget = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const budget = await useCases.deleteBudget.execute(id);
            if (!budget) {
                errorResponse(res, 'Budget not found', 404);
                return;
            }
            deletedResponse(res, id);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const getBudgetStatus = async (req: Request, res: Response) => {
        try {
            const month = Number(req.params.month);
            const year = Number(req.params.year);
            const status = await useCases.getBudgetStatus.execute(month, year);
            successResponse(res, status);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    return {
        getBudgets,
        getBudgetById,
        createBudget,
        updateBudget,
        deleteBudget,
        getBudgetStatus,
    };
};
