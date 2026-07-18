import { describe, expect, it } from 'vitest';
import { InMemoryRecurringRepository } from '../infrastructure/InMemoryRecurringRepository';
import { CreateRecurring } from './CreateRecurring';
import { DeleteRecurring } from './DeleteRecurring';

describe('DeleteRecurring', () => {
    it('permanently removes the recurring and returns the deleted view', async () => {
        const repository = new InMemoryRecurringRepository();
        const created = await new CreateRecurring(repository).execute({
            Type: 'egreso', Amount: 500, Category: '507f1f77bcf86cd799439011', Account: '507f1f77bcf86cd799439022',
            Frequency: 'mensual', DayOfMonth: 5,
        });

        const deleted = await new DeleteRecurring(repository).execute(created._id);

        expect(deleted?._id).toBe(created._id);
    });

    it('returns null when the recurring does not exist', async () => {
        const repository = new InMemoryRecurringRepository();

        const deleted = await new DeleteRecurring(repository).execute('507f1f77bcf86cd799439099');

        expect(deleted).toBeNull();
    });
});
