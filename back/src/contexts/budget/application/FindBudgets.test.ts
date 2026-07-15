import { describe, expect, it } from 'vitest';
import { InMemoryBudgetRepository } from '../infrastructure/InMemoryBudgetRepository';
import { Budget } from '../domain/Budget';
import { FindBudgets } from './FindBudgets';

describe('FindBudgets', () => {
    it('returns all budgets when the filter is empty', async () => {
        const repository = new InMemoryBudgetRepository();
        await repository.create(Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 1, Year: 2026, Limit: 100 }));
        await repository.create(Budget.create({ Category: '507f1f77bcf86cd799439022', Month: 2, Year: 2026, Limit: 200 }));

        const useCase = new FindBudgets(repository);
        const found = await useCase.execute({});

        expect(found).toHaveLength(2);
    });

    it('filters by Month/Year (status use case shape)', async () => {
        const repository = new InMemoryBudgetRepository();
        await repository.create(Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 1, Year: 2026, Limit: 100 }));
        await repository.create(Budget.create({ Category: '507f1f77bcf86cd799439022', Month: 2, Year: 2026, Limit: 200 }));

        const useCase = new FindBudgets(repository);
        const found = await useCase.execute({ Month: 2, Year: 2026 });

        expect(found).toHaveLength(1);
        expect(found[0].Limit).toBe(200);
    });
});
