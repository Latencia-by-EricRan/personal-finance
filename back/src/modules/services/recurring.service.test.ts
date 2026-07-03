import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../models/Recurring.model', () => ({
    default: {
        find: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
        findOneAndUpdate: vi.fn(),
        findByIdAndDelete: vi.fn(),
    },
}));

vi.mock('../models/Movement.model', () => ({
    default: {
        create: vi.fn(),
    },
}));

import RecurringModel from '../models/Recurring.model';
import MovementModel from '../models/Movement.model';
import RecurringService from './recurring.service';

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('RecurringService.find', () => {
    it('applies pagination skip/limit when provided', async () => {
        const query = { skip: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis() };
        vi.mocked(RecurringModel.find).mockReturnValue(query as never);

        await RecurringService.find({}, { limit: 10, skip: 20 });

        expect(RecurringModel.find).toHaveBeenCalledWith({});
        expect(query.skip).toHaveBeenCalledWith(20);
        expect(query.limit).toHaveBeenCalledWith(10);
    });

    it('does not paginate when no pagination is provided', async () => {
        const query = { skip: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis() };
        vi.mocked(RecurringModel.find).mockReturnValue(query as never);

        await RecurringService.find({});

        expect(query.skip).not.toHaveBeenCalled();
        expect(query.limit).not.toHaveBeenCalled();
    });
});

describe('RecurringService.findById', () => {
    it('delegates to RecurringModel.findById', async () => {
        const recurring = { _id: '507f1f77bcf86cd799439011', Type: 'ingreso' };
        vi.mocked(RecurringModel.findById).mockResolvedValue(recurring as never);

        const result = await RecurringService.findById('507f1f77bcf86cd799439011');

        expect(RecurringModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(result).toBe(recurring);
    });
});

describe('RecurringService.create', () => {
    it('delegates to RecurringModel.create', async () => {
        const data = { Type: 'ingreso', Amount: 1000, Category: 'cat1', DayOfMonth: 1, Frequency: 'mensual' };
        vi.mocked(RecurringModel.create).mockResolvedValue(data as never);

        const result = await RecurringService.create(data as never);

        expect(RecurringModel.create).toHaveBeenCalledWith(data);
        expect(result).toBe(data);
    });
});

describe('RecurringService.update', () => {
    it('runs findByIdAndUpdate with validators and returns the new document', async () => {
        const data = { Amount: 2000 };
        vi.mocked(RecurringModel.findByIdAndUpdate).mockResolvedValue(data as never);

        const result = await RecurringService.update('507f1f77bcf86cd799439011', data as never);

        expect(RecurringModel.findByIdAndUpdate).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439011',
            data,
            { new: true, runValidators: true },
        );
        expect(result).toBe(data);
    });
});

describe('RecurringService.delete', () => {
    it('delegates to RecurringModel.findByIdAndDelete', async () => {
        const deleted = { _id: '507f1f77bcf86cd799439011' };
        vi.mocked(RecurringModel.findByIdAndDelete).mockResolvedValue(deleted as never);

        const result = await RecurringService.delete('507f1f77bcf86cd799439011');

        expect(RecurringModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(result).toBe(deleted);
    });
});

describe('RecurringService.run', () => {
    it('materializes due recurrings into Movements and stamps LastRunYearMonth', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 15)); // July 15 2026 -> currentYearMonth '2026-07'

        const recurring = {
            _id: 'rec1',
            Type: 'egreso',
            Amount: 500,
            Category: 'cat1',
            Account: 'acc1',
            Description: 'Rent',
            Card: 'visa',
            DayOfMonth: 5,
            Active: true,
            LastRunYearMonth: '2026-06',
        };
        vi.mocked(RecurringModel.find).mockResolvedValue([recurring] as never);
        const createdMovement = { _id: 'mv1', ...recurring };
        vi.mocked(MovementModel.create).mockResolvedValue(createdMovement as never);
        vi.mocked(RecurringModel.findOneAndUpdate).mockResolvedValue({ ...recurring, LastRunYearMonth: '2026-07' } as never);

        const result = await RecurringService.run();

        expect(RecurringModel.find).toHaveBeenCalledWith({
            Active: true,
            LastRunYearMonth: { $ne: '2026-07' },
        });
        expect(RecurringModel.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'rec1', LastRunYearMonth: { $ne: '2026-07' } },
            { LastRunYearMonth: '2026-07' },
        );
        expect(MovementModel.create).toHaveBeenCalledWith({
            Type: 'egreso',
            Amount: 500,
            Category: 'cat1',
            Account: 'acc1',
            Description: 'Rent',
            Card: 'visa',
            Date: new Date(2026, 6, 5),
        });
        expect(result).toEqual([createdMovement]);
    });

    it('creates zero movements when nothing is due (already run this month)', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 20));

        vi.mocked(RecurringModel.find).mockResolvedValue([] as never);

        const result = await RecurringService.run();

        expect(MovementModel.create).not.toHaveBeenCalled();
        expect(RecurringModel.findOneAndUpdate).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it('running twice in the same month creates zero movements on the second call', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 10));

        const recurring = {
            _id: 'rec1',
            Type: 'ingreso',
            Amount: 1000,
            Category: 'cat1',
            Account: 'acc1',
            Description: 'Salary',
            Card: '',
            DayOfMonth: 1,
            Active: true,
            LastRunYearMonth: '2026-06',
        };
        vi.mocked(RecurringModel.find).mockResolvedValueOnce([recurring] as never);
        vi.mocked(MovementModel.create).mockResolvedValue({ _id: 'mv1' } as never);
        vi.mocked(RecurringModel.findOneAndUpdate).mockResolvedValue({ ...recurring, LastRunYearMonth: '2026-07' } as never);

        const firstRun = await RecurringService.run();
        expect(firstRun).toHaveLength(1);

        // Second call: the real query would now exclude this doc since LastRunYearMonth === currentYearMonth.
        vi.mocked(RecurringModel.find).mockResolvedValueOnce([] as never);
        vi.mocked(MovementModel.create).mockClear();

        const secondRun = await RecurringService.run();

        expect(secondRun).toEqual([]);
        expect(MovementModel.create).not.toHaveBeenCalled();
    });

    it('clamps DayOfMonth to the last valid day instead of rolling into the next month (Feb, non-leap year)', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 1, 10)); // February 10 2026 (2026 is not a leap year -> 28 days)

        const recurring = {
            _id: 'rec1',
            Type: 'egreso',
            Amount: 300,
            Category: 'cat1',
            Account: 'acc1',
            Description: 'Subscription',
            Card: '',
            DayOfMonth: 31,
            Active: true,
            LastRunYearMonth: null,
        };
        vi.mocked(RecurringModel.find).mockResolvedValue([recurring] as never);
        vi.mocked(MovementModel.create).mockResolvedValue({ _id: 'mv1' } as never);
        vi.mocked(RecurringModel.findOneAndUpdate).mockResolvedValue({ ...recurring, LastRunYearMonth: '2026-02' } as never);

        await RecurringService.run();

        const call = vi.mocked(MovementModel.create).mock.calls[0][0] as { Date: Date };
        expect(call.Date).toEqual(new Date(2026, 1, 28));
        expect(call.Date.getMonth()).toBe(1); // still February, not rolled into March
    });

    it('skips a recurring with no Account field without claiming it, leaving it eligible for a future run', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 15)); // July 15 2026 -> currentYearMonth '2026-07'

        const recurringNoAccount = {
            _id: 'rec-no-account',
            Type: 'egreso',
            Amount: 500,
            Category: 'cat1',
            // Account intentionally omitted — pre-migration doc
            Description: 'Rent',
            Card: 'visa',
            DayOfMonth: 5,
            Active: true,
            LastRunYearMonth: '2026-06',
        };
        vi.mocked(RecurringModel.find).mockResolvedValue([recurringNoAccount] as never);

        const result = await RecurringService.run();

        expect(RecurringModel.findOneAndUpdate).not.toHaveBeenCalled();
        expect(MovementModel.create).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it('logs and continues to the next due recurring when MovementModel.create throws after the claim succeeded', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 15)); // July 15 2026 -> currentYearMonth '2026-07'
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const failingRecurring = {
            _id: 'rec-fail',
            Type: 'egreso',
            Amount: 500,
            Category: 'cat1',
            Account: 'acc1',
            Description: 'Rent',
            Card: 'visa',
            DayOfMonth: 5,
            Active: true,
            LastRunYearMonth: '2026-06',
        };
        const okRecurring = {
            _id: 'rec-ok',
            Type: 'ingreso',
            Amount: 1000,
            Category: 'cat2',
            Account: 'acc2',
            Description: 'Salary',
            Card: '',
            DayOfMonth: 1,
            Active: true,
            LastRunYearMonth: '2026-06',
        };
        vi.mocked(RecurringModel.find).mockResolvedValue([failingRecurring, okRecurring] as never);
        vi.mocked(RecurringModel.findOneAndUpdate)
            .mockResolvedValueOnce({ ...failingRecurring, LastRunYearMonth: '2026-07' } as never)
            .mockResolvedValueOnce({ ...okRecurring, LastRunYearMonth: '2026-07' } as never);
        const okMovement = { _id: 'mv-ok', ...okRecurring };
        vi.mocked(MovementModel.create)
            .mockRejectedValueOnce(new Error('create failed'))
            .mockResolvedValueOnce(okMovement as never);

        const result = await RecurringService.run();

        expect(consoleErrorSpy).toHaveBeenCalled();
        const [firstArg] = consoleErrorSpy.mock.calls[0];
        expect(String(firstArg)).toContain('rec-fail');
        expect(MovementModel.create).toHaveBeenCalledTimes(2);
        expect(result).toEqual([okMovement]);

        consoleErrorSpy.mockRestore();
    });

    it('skips a recurring when the atomic claim fails (concurrent run already claimed it)', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 15)); // July 15 2026 -> currentYearMonth '2026-07'

        const recurring = {
            _id: 'rec1',
            Type: 'egreso',
            Amount: 500,
            Category: 'cat1',
            Account: 'acc1',
            Description: 'Rent',
            Card: 'visa',
            DayOfMonth: 5,
            Active: true,
            LastRunYearMonth: '2026-06',
        };
        vi.mocked(RecurringModel.find).mockResolvedValue([recurring] as never);
        // Simulates another concurrent run() call already claiming this recurring
        // between this call's find() and its findOneAndUpdate().
        vi.mocked(RecurringModel.findOneAndUpdate).mockResolvedValue(null as never);

        const result = await RecurringService.run();

        expect(RecurringModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
        expect(MovementModel.create).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });
});
