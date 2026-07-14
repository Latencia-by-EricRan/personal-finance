import { describe, expect, it } from 'vitest';
import { MovementType } from '../domain/Movement';
import { InMemoryMovementRepository } from '../infrastructure/InMemoryMovementRepository';
import { CreateMovement } from './CreateMovement';
import { UpdateMovement } from './UpdateMovement';

describe('UpdateMovement', () => {
    it('applies a partial patch without requiring the other fields', async () => {
        const repository = new InMemoryMovementRepository();
        const created = await new CreateMovement(repository).execute({
            Type: MovementType.EGRESO,
            Amount: 500,
            Date: new Date(2026, 5, 15),
            Account: '507f1f77bcf86cd799439011',
        });

        const updated = await new UpdateMovement(repository).execute(created._id, { Amount: 750 });

        expect(updated?.Amount).toBe(750);
        expect(updated?.Type).toBe(MovementType.EGRESO);
    });

    it('returns null when the movement does not exist', async () => {
        const repository = new InMemoryMovementRepository();

        const updated = await new UpdateMovement(repository).execute('507f1f77bcf86cd799439099', { Amount: 1 });

        expect(updated).toBeNull();
    });
});
