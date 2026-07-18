import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecurringRepository, RecurringView } from './ports/RecurringRepository';
import { CreatedMovementView, MovementGateway } from './ports/MovementGateway';
import { RunRecurrings } from './RunRecurrings';

const buildRepository = (): RecurringRepository => ({
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findDue: vi.fn(),
    claim: vi.fn(),
});

const buildGateway = (): MovementGateway => ({
    createMovement: vi.fn(),
});

const baseRecurring = (overrides: Partial<RecurringView> = {}): RecurringView => ({
    _id: 'rec1',
    Type: 'egreso',
    Amount: 500,
    Category: 'cat1',
    Account: 'acc1',
    Description: 'Rent',
    Card: 'visa',
    Frequency: 'mensual',
    DayOfMonth: 5,
    Active: true,
    LastRunYearMonth: '2026-06',
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('RunRecurrings', () => {
    it('materializes due recurrings into Movements and claims LastRunYearMonth', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 15)); // July 15 2026 -> currentYearMonth '2026-07'

        const repository = buildRepository();
        const gateway = buildGateway();
        const recurring = baseRecurring();
        vi.mocked(repository.findDue).mockResolvedValue([recurring]);
        vi.mocked(repository.claim).mockResolvedValue(true);
        const createdMovement: CreatedMovementView = {
            _id: 'mv1', Type: 'egreso', Amount: 500, Category: 'cat1', Account: 'acc1',
            Description: 'Rent', Card: 'visa', Date: new Date(2026, 6, 5),
        };
        vi.mocked(gateway.createMovement).mockResolvedValue(createdMovement);

        const result = await new RunRecurrings(repository, gateway).execute();

        expect(repository.findDue).toHaveBeenCalledWith('2026-07');
        expect(repository.claim).toHaveBeenCalledWith('rec1', '2026-07');
        expect(gateway.createMovement).toHaveBeenCalledWith({
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

    it('creates zero movements when nothing is due', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 20));

        const repository = buildRepository();
        const gateway = buildGateway();
        vi.mocked(repository.findDue).mockResolvedValue([]);

        const result = await new RunRecurrings(repository, gateway).execute();

        expect(gateway.createMovement).not.toHaveBeenCalled();
        expect(repository.claim).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it('clamps DayOfMonth to the last valid day instead of rolling into the next month (Feb, non-leap year)', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 1, 10)); // February 10 2026 (2026 is not a leap year -> 28 days)

        const repository = buildRepository();
        const gateway = buildGateway();
        const recurring = baseRecurring({ DayOfMonth: 31, LastRunYearMonth: null });
        vi.mocked(repository.findDue).mockResolvedValue([recurring]);
        vi.mocked(repository.claim).mockResolvedValue(true);
        vi.mocked(gateway.createMovement).mockResolvedValue({
            _id: 'mv1', Type: 'egreso', Amount: 500, Date: new Date(2026, 1, 28), Account: 'acc1',
        });

        await new RunRecurrings(repository, gateway).execute();

        const call = vi.mocked(gateway.createMovement).mock.calls[0][0];
        expect(call.Date).toEqual(new Date(2026, 1, 28));
        expect(call.Date.getMonth()).toBe(1); // still February, not rolled into March
    });

    it('skips a recurring with no Account without claiming it, leaving it eligible for a future run', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 15));

        const repository = buildRepository();
        const gateway = buildGateway();
        const recurringNoAccount = baseRecurring({ Account: '' });
        vi.mocked(repository.findDue).mockResolvedValue([recurringNoAccount]);

        const result = await new RunRecurrings(repository, gateway).execute();

        expect(repository.claim).not.toHaveBeenCalled();
        expect(gateway.createMovement).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    it('logs and continues to the next due recurring when the gateway throws after the claim succeeded', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 15));
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        const repository = buildRepository();
        const gateway = buildGateway();
        const failingRecurring = baseRecurring({ _id: 'rec-fail' });
        const okRecurring = baseRecurring({ _id: 'rec-ok', Type: 'ingreso', Amount: 1000, Category: 'cat2', Account: 'acc2' });
        vi.mocked(repository.findDue).mockResolvedValue([failingRecurring, okRecurring]);
        vi.mocked(repository.claim).mockResolvedValue(true);
        const okMovement: CreatedMovementView = {
            _id: 'mv-ok', Type: 'ingreso', Amount: 1000, Account: 'acc2', Date: new Date(2026, 6, 5),
        };
        vi.mocked(gateway.createMovement)
            .mockRejectedValueOnce(new Error('create failed'))
            .mockResolvedValueOnce(okMovement);

        const result = await new RunRecurrings(repository, gateway).execute();

        expect(consoleErrorSpy).toHaveBeenCalled();
        const [firstArg] = consoleErrorSpy.mock.calls[0];
        expect(String(firstArg)).toContain('rec-fail');
        expect(gateway.createMovement).toHaveBeenCalledTimes(2);
        expect(result).toEqual([okMovement]);

        consoleErrorSpy.mockRestore();
    });

    it('skips a recurring when the atomic claim fails (concurrent run already claimed it)', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 15));

        const repository = buildRepository();
        const gateway = buildGateway();
        const recurring = baseRecurring();
        vi.mocked(repository.findDue).mockResolvedValue([recurring]);
        vi.mocked(repository.claim).mockResolvedValue(false);

        const result = await new RunRecurrings(repository, gateway).execute();

        expect(repository.claim).toHaveBeenCalledTimes(1);
        expect(gateway.createMovement).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });
});
