import { describe, expect, it } from 'vitest';
import { InMemoryBudgetRepository } from '../infrastructure/InMemoryBudgetRepository';
import { CreateBudget } from './CreateBudget';

describe('CreateBudget', () => {
    it('creates a budget and returns the persisted view', async () => {
        const useCase = new CreateBudget(new InMemoryBudgetRepository());

        const created = await useCase.execute({
            Category: '507f1f77bcf86cd799439011',
            Month: 6,
            Year: 2026,
            Limit: 500,
        });

        expect(created._id).toBeTruthy();
        expect(created.Category).toBe('507f1f77bcf86cd799439011');
        expect(created.Month).toBe(6);
        expect(created.Year).toBe(2026);
        expect(created.Limit).toBe(500);
    });

    it('rejects an invalid Month (domain invariant enforced before persistence)', async () => {
        const useCase = new CreateBudget(new InMemoryBudgetRepository());

        await expect(
            useCase.execute({ Category: '507f1f77bcf86cd799439011', Month: 13, Year: 2026, Limit: 500 }),
        ).rejects.toThrow();
    });
});
