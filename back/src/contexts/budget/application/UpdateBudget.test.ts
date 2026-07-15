import { describe, expect, it } from 'vitest';
import { InMemoryBudgetRepository } from '../infrastructure/InMemoryBudgetRepository';
import { CreateBudget } from './CreateBudget';
import { UpdateBudget } from './UpdateBudget';

describe('UpdateBudget', () => {
    it('applies a partial patch without requiring the other fields', async () => {
        const repository = new InMemoryBudgetRepository();
        const created = await new CreateBudget(repository).execute({
            Category: '507f1f77bcf86cd799439011',
            Month: 6,
            Year: 2026,
            Limit: 500,
        });

        const updated = await new UpdateBudget(repository).execute(created._id, { Limit: 700 });

        expect(updated?.Limit).toBe(700);
        expect(updated?.Month).toBe(6);
        expect(updated?.Year).toBe(2026);
    });

    it('returns null when the budget does not exist', async () => {
        const repository = new InMemoryBudgetRepository();

        const updated = await new UpdateBudget(repository).execute('507f1f77bcf86cd799439099', { Limit: 10 });

        expect(updated).toBeNull();
    });
});
