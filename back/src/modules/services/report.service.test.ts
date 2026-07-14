import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../contexts/movement', () => ({
    MovementModel: {
        find: vi.fn(),
    },
    MovementType: { INGRESO: 'ingreso', EGRESO: 'egreso' },
}));

import { MovementModel } from '../../contexts/movement';
import ReportService from './report.service';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('ReportService.byCategory', () => {
    it('groups and sums Amount by Category across multiple movements, keeping distinct categories separate', async () => {
        const catFood = { _id: 'cat-food', Name: 'Food' };
        const catRent = { _id: 'cat-rent', Name: 'Rent' };
        const movements = [
            { Type: 'egreso', Amount: 100, Category: catFood },
            { Type: 'egreso', Amount: 50, Category: catFood },
            { Type: 'egreso', Amount: 900, Category: catRent },
        ];
        const findQuery = { populate: vi.fn().mockResolvedValue(movements) };
        vi.mocked(MovementModel.find).mockReturnValue(findQuery as never);

        const result = await ReportService.byCategory(7, 2026);

        expect(MovementModel.find).toHaveBeenCalledWith({
            Type: 'egreso',
            Date: { $gte: new Date(2026, 6, 0), $lte: new Date(2026, 7, 0) },
        });
        expect(findQuery.populate).toHaveBeenCalledWith('Category');
        expect(result).toEqual([
            { Category: catFood, Total: 150 },
            { Category: catRent, Total: 900 },
        ]);
    });

    it('returns an empty array when there are no expenses in the month', async () => {
        const findQuery = { populate: vi.fn().mockResolvedValue([]) };
        vi.mocked(MovementModel.find).mockReturnValue(findQuery as never);

        const result = await ReportService.byCategory(1, 2026);

        expect(result).toEqual([]);
    });

    it('skips movements whose Category failed to populate (e.g. a deleted category) instead of throwing', async () => {
        const catFood = { _id: 'cat-food', Name: 'Food' };
        const movements = [
            { Type: 'egreso', Amount: 100, Category: catFood },
            { Type: 'egreso', Amount: 999, Category: null },
        ];
        const findQuery = { populate: vi.fn().mockResolvedValue(movements) };
        vi.mocked(MovementModel.find).mockReturnValue(findQuery as never);

        const result = await ReportService.byCategory(7, 2026);

        expect(result).toEqual([{ Category: catFood, Total: 100 }]);
    });
});

describe('ReportService.monthly', () => {
    it('returns exactly 12 entries, including months with zero movements', async () => {
        vi.mocked(MovementModel.find).mockImplementation(((filter: { Date: { $lte: Date } }) => {
            const month = filter.Date.$lte.getMonth() + 1;
            if (month === 5) {
                return Promise.resolve([
                    { Type: 'ingreso', Amount: 1000 },
                    { Type: 'egreso', Amount: 400 },
                    { Type: 'egreso', Amount: 100 },
                ]);
            }
            return Promise.resolve([]);
        }) as never);

        const result = await ReportService.monthly(2026);

        expect(result).toHaveLength(12);
        expect(result[0]).toEqual({ Month: 1, Income: 0, Expense: 0, Net: 0 });
        expect(result[4]).toEqual({ Month: 5, Income: 1000, Expense: 500, Net: 500 });
        expect(result[11]).toEqual({ Month: 12, Income: 0, Expense: 0, Net: 0 });
        expect(result.map((entry) => entry.Month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('builds each month date range using the same construction as the rest of the codebase', async () => {
        vi.mocked(MovementModel.find).mockResolvedValue([] as never);

        await ReportService.monthly(2026);

        expect(MovementModel.find).toHaveBeenNthCalledWith(7, {
            Date: { $gte: new Date(2026, 6, 0), $lte: new Date(2026, 7, 0) },
        });
    });
});

describe('ReportService.cashflow', () => {
    it('computes Income/Expense/Net from a mix of ingreso/egreso movements', async () => {
        const movements = [
            { Type: 'ingreso', Amount: 2000 },
            { Type: 'ingreso', Amount: 500 },
            { Type: 'egreso', Amount: 800 },
            { Type: 'egreso', Amount: 200 },
        ];
        vi.mocked(MovementModel.find).mockResolvedValue(movements as never);

        const result = await ReportService.cashflow(7, 2026);

        expect(MovementModel.find).toHaveBeenCalledWith({
            Date: { $gte: new Date(2026, 6, 0), $lte: new Date(2026, 7, 0) },
        });
        expect(result).toEqual({ Month: 7, Year: 2026, Income: 2500, Expense: 1000, Net: 1500 });
    });

    it('returns zeroes when there are no movements in the month', async () => {
        vi.mocked(MovementModel.find).mockResolvedValue([] as never);

        const result = await ReportService.cashflow(3, 2026);

        expect(result).toEqual({ Month: 3, Year: 2026, Income: 0, Expense: 0, Net: 0 });
    });
});
