import { describe, expect, it } from 'vitest';
import { MovementType } from '../domain/Movement';
import { InMemoryMovementRepository } from '../infrastructure/InMemoryMovementRepository';
import { CreateMovement } from './CreateMovement';

describe('CreateMovement', () => {
    it('creates a movement and returns the persisted view', async () => {
        const useCase = new CreateMovement(new InMemoryMovementRepository());

        const created = await useCase.execute({
            Type: MovementType.EGRESO,
            Amount: 40,
            Date: new Date(2026, 5, 15),
            Account: '507f1f77bcf86cd799439011',
        });

        expect(created._id).toBeTruthy();
        expect(created.Amount).toBe(40);
        expect(created.Type).toBe(MovementType.EGRESO);
    });

    it('does not let a caller set TransferId (mass-assignment closure)', async () => {
        const useCase = new CreateMovement(new InMemoryMovementRepository());
        const maliciousInput = {
            Type: MovementType.INGRESO,
            Amount: 100,
            Date: new Date(2026, 5, 1),
            Account: '507f1f77bcf86cd799439011',
            TransferId: 'client-supplied',
        } as unknown as Parameters<CreateMovement['execute']>[0];

        const created = await useCase.execute(maliciousInput);

        expect((created as unknown as Record<string, unknown>).TransferId).toBeUndefined();
    });
});
