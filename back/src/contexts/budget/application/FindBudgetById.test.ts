import { describe, expect, it } from 'vitest';
import { InMemoryBudgetRepository } from '../infrastructure/InMemoryBudgetRepository';
import { Budget } from '../domain/Budget';
import { FindBudgetById } from './FindBudgetById';

describe('FindBudgetById', () => {
    it('returns the matching budget view when it exists', async () => {
        const repository = new InMemoryBudgetRepository();
        const created = await repository.create(
            Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 6, Year: 2026, Limit: 500 }),
        );

        const useCase = new FindBudgetById(repository);
        const found = await useCase.execute(created._id);

        expect(found?.Limit).toBe(500);
        expect(found?.Month).toBe(6);
    });

    it('returns null when no budget matches (404 shape)', async () => {
        const repository = new InMemoryBudgetRepository();
        const useCase = new FindBudgetById(repository);

        const found = await useCase.execute('507f1f77bcf86cd799439099');

        expect(found).toBeNull();
    });
});
