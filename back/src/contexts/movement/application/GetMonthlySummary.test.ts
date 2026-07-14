import { describe, expect, it } from 'vitest';
import { MovementType } from '../domain/Movement';
import { InMemoryMovementRepository } from '../infrastructure/InMemoryMovementRepository';
import { CreateMovement } from './CreateMovement';
import { GetMonthlySummary } from './GetMonthlySummary';

describe('GetMonthlySummary', () => {
    it('sums income and expense for movements in the given month/year range', async () => {
        const repository = new InMemoryMovementRepository();
        const create = new CreateMovement(repository);
        await create.execute({
            Type: MovementType.INGRESO,
            Amount: 100,
            Date: new Date(2026, 5, 15),
            Account: '507f1f77bcf86cd799439011',
        });
        await create.execute({
            Type: MovementType.EGRESO,
            Amount: 40,
            Date: new Date(2026, 5, 20),
            Account: '507f1f77bcf86cd799439011',
        });
        // Out of range — must not be counted.
        await create.execute({
            Type: MovementType.INGRESO,
            Amount: 999,
            Date: new Date(2026, 8, 1),
            Account: '507f1f77bcf86cd799439011',
        });

        const result = await new GetMonthlySummary(repository).execute(6, 2026);

        expect(result.summary.items).toBe(2);
        expect(result.summary.amount.income).toBe(100);
        expect(result.summary.amount.expense).toBe(40);
        expect(result.movements).toHaveLength(2);
    });

    it('returns zeroed amounts when there are no movements in range', async () => {
        const repository = new InMemoryMovementRepository();

        const result = await new GetMonthlySummary(repository).execute(1, 2027);

        expect(result.summary.items).toBe(0);
        expect(result.summary.amount.income).toBe(0);
        expect(result.summary.amount.expense).toBe(0);
    });
});
