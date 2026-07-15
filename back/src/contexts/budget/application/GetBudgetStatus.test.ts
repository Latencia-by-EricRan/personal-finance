import { describe, expect, it, vi } from 'vitest';
import { InMemoryBudgetRepository } from '../infrastructure/InMemoryBudgetRepository';
import { InMemoryMovementGateway } from '../infrastructure/InMemoryMovementGateway';
import { Budget } from '../domain/Budget';
import { BudgetRepository, BudgetView } from './ports/BudgetRepository';
import { GetBudgetStatus } from './GetBudgetStatus';

describe('GetBudgetStatus', () => {
    it('computes Spent/Remaining/Percent from egreso movements matching the budget category', async () => {
        const repository = new InMemoryBudgetRepository();
        const gateway = new InMemoryMovementGateway();
        const created = await repository.create(
            Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 7, Year: 2026, Limit: 100 }),
        );
        gateway.seed({
            Type: 'egreso', Category: '507f1f77bcf86cd799439011', Amount: 40, Date: new Date(2026, 6, 15),
        });

        const status = await new GetBudgetStatus(repository, gateway).execute(7, 2026);

        expect(status).toEqual([
            { Category: created.Category, Limit: 100, Spent: 40, Remaining: 60, Percent: 40 },
        ]);
    });

    it('returns an empty list when no budgets exist for the given month/year', async () => {
        const repository = new InMemoryBudgetRepository();
        const gateway = new InMemoryMovementGateway();

        const status = await new GetBudgetStatus(repository, gateway).execute(3, 2026);

        expect(status).toEqual([]);
    });

    it('guards against division by zero when Limit is 0 (Percent stays 0, not NaN/Infinity)', async () => {
        const repository = new InMemoryBudgetRepository();
        const gateway = new InMemoryMovementGateway();
        await repository.create(
            Budget.create({ Category: '507f1f77bcf86cd799439022', Month: 5, Year: 2026, Limit: 0 }),
        );
        gateway.seed({
            Type: 'egreso', Category: '507f1f77bcf86cd799439022', Amount: 25, Date: new Date(2026, 4, 10),
        });

        const status = await new GetBudgetStatus(repository, gateway).execute(5, 2026);

        expect(status[0].Percent).toBe(0);
        expect(status[0].Remaining).toBe(-25);
    });

    it('yields Spent 0 / Remaining Limit / Percent 0 when there are no matching movements', async () => {
        const repository = new InMemoryBudgetRepository();
        const gateway = new InMemoryMovementGateway();
        await repository.create(
            Budget.create({ Category: '507f1f77bcf86cd799439033', Month: 9, Year: 2026, Limit: 200 }),
        );

        const status = await new GetBudgetStatus(repository, gateway).execute(9, 2026);

        expect(status[0]).toMatchObject({ Spent: 0, Remaining: 200, Percent: 0 });
    });

    it('extracts categoryId from a populated Category sub-document, but echoes the populated doc verbatim in the response', async () => {
        const populatedView: BudgetView = {
            _id: 'budget-1',
            Category: { _id: '507f1f77bcf86cd799439044', Name: 'Groceries' },
            Month: 6,
            Year: 2026,
            Limit: 50,
        };
        const repository: BudgetRepository = {
            find: vi.fn().mockResolvedValue([populatedView]),
            findById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        };
        const gateway = new InMemoryMovementGateway();
        const findEgresoAmountsSpy = vi.spyOn(gateway, 'findEgresoAmounts');
        gateway.seed({
            Type: 'egreso', Category: '507f1f77bcf86cd799439044', Amount: 10, Date: new Date(2026, 5, 10),
        });

        const status = await new GetBudgetStatus(repository, gateway).execute(6, 2026);

        expect(findEgresoAmountsSpy).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439044',
            expect.any(Date),
            expect.any(Date),
        );
        expect(status[0].Category).toBe(populatedView.Category);
        expect(status[0].Spent).toBe(10);
    });

    it('uses the verbatim legacy date-window: new Date(year, month-1, 0) and new Date(year, month, 0)', async () => {
        const repository = new InMemoryBudgetRepository();
        await repository.create(
            Budget.create({ Category: '507f1f77bcf86cd799439055', Month: 7, Year: 2026, Limit: 10 }),
        );
        const gateway = new InMemoryMovementGateway();
        const findEgresoAmountsSpy = vi.spyOn(gateway, 'findEgresoAmounts');

        await new GetBudgetStatus(repository, gateway).execute(7, 2026);

        expect(findEgresoAmountsSpy).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439055',
            new Date(2026, 6, 0),
            new Date(2026, 7, 0),
        );
    });
});
