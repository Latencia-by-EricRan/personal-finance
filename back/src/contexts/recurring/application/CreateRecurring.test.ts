import { describe, expect, it } from 'vitest';
import { InMemoryRecurringRepository } from '../infrastructure/InMemoryRecurringRepository';
import { CreateRecurring } from './CreateRecurring';

describe('CreateRecurring', () => {
    it('creates a recurring and returns the persisted view', async () => {
        const useCase = new CreateRecurring(new InMemoryRecurringRepository());

        const created = await useCase.execute({
            Type: 'egreso',
            Amount: 500,
            Category: '507f1f77bcf86cd799439011',
            Account: '507f1f77bcf86cd799439022',
            Description: 'Rent',
            Frequency: 'mensual',
            DayOfMonth: 5,
        });

        expect(created._id).toBeTruthy();
        expect(created.Type).toBe('egreso');
        expect(created.Amount).toBe(500);
        expect(created.DayOfMonth).toBe(5);
        expect(created.Active).toBe(true);
    });

    it('rejects an invalid DayOfMonth (domain invariant enforced before persistence)', async () => {
        const useCase = new CreateRecurring(new InMemoryRecurringRepository());

        await expect(
            useCase.execute({
                Type: 'egreso',
                Amount: 500,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439022',
                Frequency: 'mensual',
                DayOfMonth: 32,
            }),
        ).rejects.toThrow();
    });
});
