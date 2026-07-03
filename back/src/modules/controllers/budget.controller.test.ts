import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/budget.service', () => ({
    default: {
        find: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        getStatus: vi.fn(),
    },
}));

import BudgetService from '../services/budget.service';
import {
    createBudget,
    deleteBudget,
    getBudgetById,
    getBudgetStatus,
    getBudgets,
    updateBudget,
} from './budget.controller';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getBudgets', () => {
    it('paginates using page/limit query params', async () => {
        vi.mocked(BudgetService.find).mockResolvedValue([]);
        const req = { query: { page: '2', limit: '10' } } as unknown as Request;
        const res = mockRes();

        await getBudgets(req, res);

        expect(BudgetService.find).toHaveBeenCalledWith({}, { limit: 10, skip: 10 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('defaults to page 1, limit 50 when no query params are given', async () => {
        vi.mocked(BudgetService.find).mockResolvedValue([]);
        const req = { query: {} } as unknown as Request;
        const res = mockRes();

        await getBudgets(req, res);

        expect(BudgetService.find).toHaveBeenCalledWith({}, { limit: 50, skip: 0 });
    });

    it('responds with 500 on service error', async () => {
        vi.mocked(BudgetService.find).mockRejectedValue(new Error('boom'));
        const req = { query: {} } as unknown as Request;
        const res = mockRes();

        await getBudgets(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
    });
});

describe('getBudgetById', () => {
    it('responds with the budget when found', async () => {
        const budget = { _id: '507f1f77bcf86cd799439011', Limit: 1000 };
        vi.mocked(BudgetService.findById).mockResolvedValue(budget as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await getBudgetById(req, res);

        expect(BudgetService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.json).toHaveBeenCalledWith(budget);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds 404 when the budget does not exist', async () => {
        vi.mocked(BudgetService.findById).mockResolvedValue(null);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await getBudgetById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Budget not found' });
    });
});

describe('createBudget', () => {
    it('delegates to BudgetService.create and responds 201', async () => {
        const body = { Category: '507f1f77bcf86cd799439011', Month: 7, Year: 2026, Limit: 1000 };
        const created = { ...body, _id: '507f1f77bcf86cd799439099' };
        vi.mocked(BudgetService.create).mockResolvedValue(created as never);
        const req = { body } as unknown as Request;
        const res = mockRes();

        await createBudget(req, res);

        expect(BudgetService.create).toHaveBeenCalledWith(body);
        expect(res.json).toHaveBeenCalledWith(created);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('responds 400 with a friendly message on a duplicate-key error', async () => {
        const body = { Category: '507f1f77bcf86cd799439011', Month: 7, Year: 2026, Limit: 1000 };
        const duplicateError = Object.assign(new Error('E11000 duplicate key'), { code: 11000 });
        vi.mocked(BudgetService.create).mockRejectedValue(duplicateError);
        const req = { body } as unknown as Request;
        const res = mockRes();

        await createBudget(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'A budget already exists for this category in this month/year' });
    });

    it('responds 500 on a non-duplicate-key error', async () => {
        vi.mocked(BudgetService.create).mockRejectedValue(new Error('boom'));
        const req = { body: {} } as unknown as Request;
        const res = mockRes();

        await createBudget(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
    });
});

describe('updateBudget', () => {
    it('delegates to BudgetService.update and responds 200', async () => {
        const body = { Limit: 2000 };
        const updated = { ...body, _id: '507f1f77bcf86cd799439011' };
        vi.mocked(BudgetService.update).mockResolvedValue(updated as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' }, body } as unknown as Request;
        const res = mockRes();

        await updateBudget(req, res);

        expect(BudgetService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', body);
        expect(res.json).toHaveBeenCalledWith(updated);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('supports a partial PUT with only Limit', async () => {
        const body = { Limit: 750 };
        const updated = { _id: '507f1f77bcf86cd799439011', Category: 'cat1', Month: 7, Year: 2026, Limit: 750 };
        vi.mocked(BudgetService.update).mockResolvedValue(updated as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' }, body } as unknown as Request;
        const res = mockRes();

        await updateBudget(req, res);

        expect(BudgetService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', body);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds 404 when the budget to update does not exist', async () => {
        vi.mocked(BudgetService.update).mockResolvedValue(null);
        const req = { params: { id: '507f1f77bcf86cd799439011' }, body: {} } as unknown as Request;
        const res = mockRes();

        await updateBudget(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Budget not found' });
    });

    it('responds 400 with a friendly message on a duplicate-key error', async () => {
        const duplicateError = Object.assign(new Error('E11000 duplicate key'), { code: 11000 });
        vi.mocked(BudgetService.update).mockRejectedValue(duplicateError);
        const req = { params: { id: '507f1f77bcf86cd799439011' }, body: { Month: 8 } } as unknown as Request;
        const res = mockRes();

        await updateBudget(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'A budget already exists for this category in this month/year' });
    });
});

describe('deleteBudget', () => {
    it('deletes and responds with a deleted body', async () => {
        const deleted = { _id: '507f1f77bcf86cd799439011' };
        vi.mocked(BudgetService.delete).mockResolvedValue(deleted as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await deleteBudget(req, res);

        expect(BudgetService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ deleted: true, id: '507f1f77bcf86cd799439011' });
    });

    it('responds 404 when the budget to delete does not exist', async () => {
        vi.mocked(BudgetService.delete).mockResolvedValue(null);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await deleteBudget(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Budget not found' });
    });
});

describe('getBudgetStatus', () => {
    it('delegates to BudgetService.getStatus with numeric month/year', async () => {
        const status = [{ Category: 'cat1', Limit: 1000, Spent: 500, Remaining: 500, Percent: 50 }];
        vi.mocked(BudgetService.getStatus).mockResolvedValue(status);
        const req = { params: { month: '7', year: '2026' } } as unknown as Request;
        const res = mockRes();

        await getBudgetStatus(req, res);

        expect(BudgetService.getStatus).toHaveBeenCalledWith(7, 2026);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(status);
    });

    it('responds 500 on service error', async () => {
        vi.mocked(BudgetService.getStatus).mockRejectedValue(new Error('boom'));
        const req = { params: { month: '7', year: '2026' } } as unknown as Request;
        const res = mockRes();

        await getBudgetStatus(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
    });
});
