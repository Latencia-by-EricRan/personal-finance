import { describe, expect, it } from 'vitest';
import { InMemoryRecurringRepository } from '../infrastructure/InMemoryRecurringRepository';
import { CreateRecurring } from './CreateRecurring';
import { FindRecurrings } from './FindRecurrings';

describe('FindRecurrings', () => {
    it('delegates to the repository find, applying the given filter and pagination', async () => {
        const repository = new InMemoryRecurringRepository();
        await new CreateRecurring(repository).execute({
            Type: 'egreso', Amount: 100, Category: '507f1f77bcf86cd799439011', Account: '507f1f77bcf86cd799439022',
            Frequency: 'mensual', DayOfMonth: 1,
        });
        await new CreateRecurring(repository).execute({
            Type: 'ingreso', Amount: 200, Category: '507f1f77bcf86cd799439011', Account: '507f1f77bcf86cd799439022',
            Frequency: 'mensual', DayOfMonth: 2,
        });

        const useCase = new FindRecurrings(repository);

        const egresosOnly = await useCase.execute({ Type: 'egreso' });
        expect(egresosOnly).toHaveLength(1);

        const paged = await useCase.execute({}, { skip: 1, limit: 1 });
        expect(paged).toHaveLength(1);
    });
});
