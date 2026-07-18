import { describe, expect, it } from 'vitest';
import { InMemoryRecurringRepository } from '../infrastructure/InMemoryRecurringRepository';
import { CreateRecurring } from './CreateRecurring';
import { FindRecurringById } from './FindRecurringById';

describe('FindRecurringById', () => {
    it('returns the recurring when it exists', async () => {
        const repository = new InMemoryRecurringRepository();
        const created = await new CreateRecurring(repository).execute({
            Type: 'egreso', Amount: 500, Category: '507f1f77bcf86cd799439011', Account: '507f1f77bcf86cd799439022',
            Frequency: 'mensual', DayOfMonth: 5,
        });

        const found = await new FindRecurringById(repository).execute(created._id);

        expect(found?.Amount).toBe(500);
    });

    it('returns null when the recurring does not exist', async () => {
        const repository = new InMemoryRecurringRepository();

        const found = await new FindRecurringById(repository).execute('507f1f77bcf86cd799439099');

        expect(found).toBeNull();
    });
});
