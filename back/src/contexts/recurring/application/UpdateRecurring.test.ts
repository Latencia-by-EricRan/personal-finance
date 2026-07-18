import { describe, expect, it } from 'vitest';
import { InMemoryRecurringRepository } from '../infrastructure/InMemoryRecurringRepository';
import { CreateRecurring } from './CreateRecurring';
import { UpdateRecurring } from './UpdateRecurring';

describe('UpdateRecurring', () => {
    it('applies a partial patch and returns the updated view', async () => {
        const repository = new InMemoryRecurringRepository();
        const created = await new CreateRecurring(repository).execute({
            Type: 'egreso', Amount: 500, Category: '507f1f77bcf86cd799439011', Account: '507f1f77bcf86cd799439022',
            Frequency: 'mensual', DayOfMonth: 5,
        });

        const updated = await new UpdateRecurring(repository).execute(created._id, { Amount: 900 });

        expect(updated?.Amount).toBe(900);
        expect(updated?.DayOfMonth).toBe(5);
    });

    it('returns null when the recurring does not exist', async () => {
        const repository = new InMemoryRecurringRepository();

        const updated = await new UpdateRecurring(repository).execute('507f1f77bcf86cd799439099', { Amount: 10 });

        expect(updated).toBeNull();
    });
});
