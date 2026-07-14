import { describe, expect, it } from 'vitest';
import { MovementType } from '../domain/Movement';
import { InMemoryMovementRepository } from '../infrastructure/InMemoryMovementRepository';
import { SaveManyMovements } from './SaveManyMovements';

describe('SaveManyMovements', () => {
    it('batch-creates all movements in one call, validating each item', async () => {
        const repository = new InMemoryMovementRepository();

        const created = await new SaveManyMovements(repository).execute([
            { Type: MovementType.INGRESO, Amount: 5, Date: new Date(2026, 5, 1), Account: '507f1f77bcf86cd799439011' },
            { Type: MovementType.EGRESO, Amount: 6, Date: new Date(2026, 5, 2), Account: '507f1f77bcf86cd799439011' },
        ]);

        expect(created).toHaveLength(2);
        expect(created[0].Amount).toBe(5);
        expect(created[1].Amount).toBe(6);
    });

    it('rejects the whole batch when one item violates an invariant', async () => {
        const repository = new InMemoryMovementRepository();

        await expect(
            new SaveManyMovements(repository).execute([
                { Type: 'bogus' as never, Amount: 5, Date: new Date(2026, 5, 1), Account: '507f1f77bcf86cd799439011' },
            ]),
        ).rejects.toThrow();
    });
});
