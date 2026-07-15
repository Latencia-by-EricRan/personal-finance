import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BudgetUseCases } from '../../application/BudgetUseCases';
import { BudgetView } from '../../application/ports/BudgetRepository';
import { createBudgetController } from './budget.controller';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const makeUseCases = (): BudgetUseCases => ({
    findBudgets: { execute: vi.fn() } as never,
    findBudgetById: { execute: vi.fn() } as never,
    createBudget: { execute: vi.fn() } as never,
    updateBudget: { execute: vi.fn() } as never,
    deleteBudget: { execute: vi.fn() } as never,
    getBudgetStatus: { execute: vi.fn() } as never,
});

const budgetView = (overrides: Partial<BudgetView> = {}): BudgetView => ({
    _id: '507f1f77bcf86cd799439011',
    Category: '507f1f77bcf86cd799439022',
    Month: 3,
    Year: 2021,
    Limit: 500,
    ...overrides,
});

const duplicateKeyError = (): Error & { code: number } =>
    Object.assign(new Error('E11000 duplicate key error'), { code: 11000 });

beforeEach(() => {
    vi.clearAllMocks();
});

describe('createBudgetController', () => {
    describe('getBudgets', () => {
        it('delegates to findBudgets.execute with an empty filter and pagination, responds 200', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.findBudgets.execute).mockResolvedValue([budgetView()]);
            const controller = createBudgetController(useCases);
            const req = { query: {} } as unknown as Request;
            const res = mockRes();

            await controller.getBudgets(req, res);

            expect(useCases.findBudgets.execute).toHaveBeenCalledWith({}, { limit: 50, skip: 0 });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getBudgetById', () => {
        it('responds 200 with the budget view when found', async () => {
            const useCases = makeUseCases();
            const view = budgetView();
            vi.mocked(useCases.findBudgetById.execute).mockResolvedValue(view);
            const controller = createBudgetController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.getBudgetById(req, res);

            expect(useCases.findBudgetById.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(res.json).toHaveBeenCalledWith(view);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 404 with "Budget not found" when the use case resolves null', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.findBudgetById.execute).mockResolvedValue(null);
            const controller = createBudgetController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.getBudgetById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Budget not found' });
        });
    });

    describe('createBudget', () => {
        it('delegates to createBudget.execute with the raw body and responds 201 with the returned view', async () => {
            const body = { Category: '507f1f77bcf86cd799439022', Month: 3, Year: 2021, Limit: 500 };
            const useCases = makeUseCases();
            const created = budgetView();
            vi.mocked(useCases.createBudget.execute).mockResolvedValue(created);
            const controller = createBudgetController(useCases);
            const req = { body } as unknown as Request;
            const res = mockRes();

            await controller.createBudget(req, res);

            expect(useCases.createBudget.execute).toHaveBeenCalledWith(body);
            expect(res.json).toHaveBeenCalledWith(created);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('maps a Mongo 11000 duplicate-key error to 400 with the legacy message', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.createBudget.execute).mockRejectedValue(duplicateKeyError());
            const controller = createBudgetController(useCases);
            const req = { body: {} } as unknown as Request;
            const res = mockRes();

            await controller.createBudget(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'A budget already exists for this category in this month/year',
            });
        });

        it('responds 500 when the use case throws a generic (non-duplicate-key) Error', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.createBudget.execute).mockRejectedValue(new Error('Budget.Month must be an integer'));
            const controller = createBudgetController(useCases);
            const req = { body: {} } as unknown as Request;
            const res = mockRes();

            await controller.createBudget(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('updateBudget', () => {
        it('delegates to updateBudget.execute with id + the raw patch and responds 200 with the updated view', async () => {
            const body = { Limit: 900 };
            const useCases = makeUseCases();
            const updated = budgetView({ Limit: 900 });
            vi.mocked(useCases.updateBudget.execute).mockResolvedValue(updated);
            const controller = createBudgetController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' }, body } as unknown as Request;
            const res = mockRes();

            await controller.updateBudget(req, res);

            expect(useCases.updateBudget.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011', body);
            expect(res.json).toHaveBeenCalledWith(updated);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 404 with "Budget not found" when the use case resolves null', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.updateBudget.execute).mockResolvedValue(null);
            const controller = createBudgetController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' }, body: {} } as unknown as Request;
            const res = mockRes();

            await controller.updateBudget(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Budget not found' });
        });

        it('maps a Mongo 11000 duplicate-key error to 400 with the legacy message', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.updateBudget.execute).mockRejectedValue(duplicateKeyError());
            const controller = createBudgetController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' }, body: {} } as unknown as Request;
            const res = mockRes();

            await controller.updateBudget(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'A budget already exists for this category in this month/year',
            });
        });
    });

    describe('deleteBudget', () => {
        it('delegates to deleteBudget.execute and responds 200 with { deleted: true, id } on success', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.deleteBudget.execute).mockResolvedValue(budgetView());
            const controller = createBudgetController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.deleteBudget(req, res);

            expect(useCases.deleteBudget.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(res.json).toHaveBeenCalledWith({ deleted: true, id: '507f1f77bcf86cd799439011' });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 404 with "Budget not found" when the use case resolves null', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.deleteBudget.execute).mockResolvedValue(null);
            const controller = createBudgetController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.deleteBudget(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Budget not found' });
        });
    });

    describe('getBudgetStatus', () => {
        it('delegates to getBudgetStatus.execute with numeric month/year and responds 200', async () => {
            const useCases = makeUseCases();
            const status = [{ Category: {}, Limit: 100, Spent: 40, Remaining: 60, Percent: 40 }];
            vi.mocked(useCases.getBudgetStatus.execute).mockResolvedValue(status);
            const controller = createBudgetController(useCases);
            const req = { params: { month: '6', year: '2000' } } as unknown as Request;
            const res = mockRes();

            await controller.getBudgetStatus(req, res);

            expect(useCases.getBudgetStatus.execute).toHaveBeenCalledWith(6, 2000);
            expect(res.json).toHaveBeenCalledWith(status);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 500 when the use case throws', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.getBudgetStatus.execute).mockRejectedValue(new Error('boom'));
            const controller = createBudgetController(useCases);
            const req = { params: { month: '6', year: '2000' } } as unknown as Request;
            const res = mockRes();

            await controller.getBudgetStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
