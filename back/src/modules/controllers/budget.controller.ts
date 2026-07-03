import { Request, Response } from 'express';
import { deletedResponse, errorResponse, successResponse } from '../../middlewares/response.middleware';
import { toMessage, toPagination } from '../../utils/controller.util';
import BudgetService from '../services/budget.service';

const isDuplicateKeyError = (error: unknown): boolean => (error as { code?: number })?.code === 11000;

const getBudgets = async (req: Request, res: Response) => {
    try {
        const budgets = await BudgetService.find({}, toPagination(req.query));
        successResponse(res, budgets);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const getBudgetById = async (req: Request, res: Response) => {
    try {
        const budget = await BudgetService.findById(req.params.id);
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
        const budget = await BudgetService.create(req.body);
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
        const budget = await BudgetService.update(id, req.body);
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
        const budget = await BudgetService.delete(id);
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
        const status = await BudgetService.getStatus(month, year);
        successResponse(res, status);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};


export {
    getBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetStatus,
}
