import { describe, expect, it } from 'vitest';
import { InMemoryBudgetRepository } from '../infrastructure/InMemoryBudgetRepository';
import { CreateBudget } from './CreateBudget';
import { DeleteBudget } from './DeleteBudget';
import { FindBudgetById } from './FindBudgetById';

describe('DeleteBudget', () => {
    it('permanently removes the budget and returns the deleted view (hard delete, no Archived flag)', async () => {
        const repository = new InMemoryBudgetRepository();
        const created = await new CreateBudget(repository).execute({
            Category: '507f1f77bcf86cd799439011',
            Month: 6,
            Year: 2026,
            Limit: 500,
        });

        const deleted = await new DeleteBudget(repository).execute(created._id);
        expect(deleted?._id).toBe(created._id);
        expect((deleted as unknown as Record<string, unknown>).Archived).toBeUndefined();

        const afterDelete = await new FindBudgetById(repository).execute(created._id);
        expect(afterDelete).toBeNull();
    });

    it('returns null when the budget does not exist', async () => {
        const repository = new InMemoryBudgetRepository();

        const deleted = await new DeleteBudget(repository).execute('507f1f77bcf86cd799439099');

        expect(deleted).toBeNull();
    });
});
