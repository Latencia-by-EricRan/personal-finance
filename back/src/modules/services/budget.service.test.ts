import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../models/Budget.model', () => ({
    default: {
        find: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
        findByIdAndDelete: vi.fn(),
    },
}));

vi.mock('../models/Movement.model', () => ({
    default: {
        find: vi.fn(),
    },
}));

import BudgetModel from '../models/Budget.model';
import MovementModel from '../models/Movement.model';
import BudgetService from './budget.service';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('BudgetService.find', () => {
    it('populates Category and applies pagination skip/limit when provided', async () => {
        const query = { populate: vi.fn().mockReturnThis(), skip: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis() };
        vi.mocked(BudgetModel.find).mockReturnValue(query as never);

        await BudgetService.find({}, { limit: 10, skip: 20 });

        expect(BudgetModel.find).toHaveBeenCalledWith({});
        expect(query.populate).toHaveBeenCalledWith('Category');
        expect(query.skip).toHaveBeenCalledWith(20);
        expect(query.limit).toHaveBeenCalledWith(10);
    });

    it('does not paginate when no pagination is provided', async () => {
        const query = { populate: vi.fn().mockReturnThis(), skip: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis() };
        vi.mocked(BudgetModel.find).mockReturnValue(query as never);

        await BudgetService.find({});

        expect(query.skip).not.toHaveBeenCalled();
        expect(query.limit).not.toHaveBeenCalled();
    });
});

describe('BudgetService.findById', () => {
    it('delegates to BudgetModel.findById and populates Category', async () => {
        const budget = { _id: '507f1f77bcf86cd799439011', Category: { _id: 'cat1', Name: 'Food' }, Month: 7, Year: 2026, Limit: 1000 };
        const query = { populate: vi.fn().mockResolvedValue(budget) };
        vi.mocked(BudgetModel.findById).mockReturnValue(query as never);

        const result = await BudgetService.findById('507f1f77bcf86cd799439011');

        expect(BudgetModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(query.populate).toHaveBeenCalledWith('Category');
        expect(result).toBe(budget);
    });
});

describe('BudgetService.create', () => {
    it('delegates to BudgetModel.create', async () => {
        const data = { Category: 'cat1', Month: 7, Year: 2026, Limit: 1000 };
        vi.mocked(BudgetModel.create).mockResolvedValue(data as never);

        const result = await BudgetService.create(data as never);

        expect(BudgetModel.create).toHaveBeenCalledWith(data);
        expect(result).toBe(data);
    });
});

describe('BudgetService.update', () => {
    it('runs findByIdAndUpdate with validators and returns the new document', async () => {
        const data = { Limit: 2000 };
        vi.mocked(BudgetModel.findByIdAndUpdate).mockResolvedValue(data as never);

        const result = await BudgetService.update('507f1f77bcf86cd799439011', data as never);

        expect(BudgetModel.findByIdAndUpdate).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439011',
            data,
            { new: true, runValidators: true },
        );
        expect(result).toBe(data);
    });
});

describe('BudgetService.delete', () => {
    it('delegates to BudgetModel.findByIdAndDelete', async () => {
        const deleted = { _id: '507f1f77bcf86cd799439011' };
        vi.mocked(BudgetModel.findByIdAndDelete).mockResolvedValue(deleted as never);

        const result = await BudgetService.delete('507f1f77bcf86cd799439011');

        expect(BudgetModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(result).toBe(deleted);
    });
});

describe('BudgetService.getStatus', () => {
    it('computes Spent/Remaining/Percent from matching movements', async () => {
        const budgets = [
            { Category: 'cat1', Limit: 1000 },
            { Category: 'cat2', Limit: 500 },
        ];
        const findQuery = { populate: vi.fn().mockResolvedValue(budgets) };
        vi.mocked(BudgetModel.find).mockReturnValue(findQuery as never);

        vi.mocked(MovementModel.find).mockImplementation(((filter: { Category: string }) => {
            const movements = filter.Category === 'cat1'
                ? [{ Amount: 300 }, { Amount: 200 }]
                : [{ Amount: 600 }];
            return Promise.resolve(movements);
        }) as never);

        const result = await BudgetService.getStatus(7, 2026);

        expect(BudgetModel.find).toHaveBeenCalledWith({ Month: 7, Year: 2026 });
        expect(findQuery.populate).toHaveBeenCalledWith('Category');
        expect(result).toEqual([
            { Category: 'cat1', Limit: 1000, Spent: 500, Remaining: 500, Percent: 50 },
            { Category: 'cat2', Limit: 500, Spent: 600, Remaining: -100, Percent: 120 },
        ]);
    });

    it('guards division by zero: Percent is 0 when Limit is 0', async () => {
        const budgets = [{ Category: 'cat1', Limit: 0 }];
        const findQuery = { populate: vi.fn().mockResolvedValue(budgets) };
        vi.mocked(BudgetModel.find).mockReturnValue(findQuery as never);
        vi.mocked(MovementModel.find).mockResolvedValue([{ Amount: 100 }] as never);

        const result = await BudgetService.getStatus(7, 2026);

        expect(result).toEqual([
            { Category: 'cat1', Limit: 0, Spent: 100, Remaining: -100, Percent: 0 },
        ]);
    });

    it('builds the movement filter with Type egreso and the month date range', async () => {
        const budgets = [{ Category: 'cat1', Limit: 1000 }];
        const findQuery = { populate: vi.fn().mockResolvedValue(budgets) };
        vi.mocked(BudgetModel.find).mockReturnValue(findQuery as never);
        vi.mocked(MovementModel.find).mockResolvedValue([] as never);

        await BudgetService.getStatus(7, 2026);

        expect(MovementModel.find).toHaveBeenCalledWith({
            Type: 'egreso',
            Category: 'cat1',
            Date: { $gte: new Date(2026, 6, 0), $lte: new Date(2026, 7, 0) },
        });
    });
});
