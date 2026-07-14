import { describe, expect, it } from 'vitest';
import { MovementType } from '../domain/Movement';
import { InMemoryMovementRepository } from '../infrastructure/InMemoryMovementRepository';
import { CreateMovement } from './CreateMovement';
import { DeleteMovement } from './DeleteMovement';

describe('DeleteMovement', () => {
    it('removes an existing movement and returns it', async () => {
        const repository = new InMemoryMovementRepository();
        const created = await new CreateMovement(repository).execute({
            Type: MovementType.INGRESO,
            Amount: 10,
            Date: new Date(2026, 5, 6),
            Account: '507f1f77bcf86cd799439011',
        });

        const deleted = await new DeleteMovement(repository).execute(created._id);

        expect(deleted?._id).toBe(created._id);
        expect(await repository.find({})).toEqual([]);
    });

    it('returns null when the movement does not exist', async () => {
        const repository = new InMemoryMovementRepository();

        const deleted = await new DeleteMovement(repository).execute('507f1f77bcf86cd799439099');

        expect(deleted).toBeNull();
    });
});
