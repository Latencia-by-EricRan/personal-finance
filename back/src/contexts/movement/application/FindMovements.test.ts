import { describe, expect, it } from 'vitest';
import { MovementType } from '../domain/Movement';
import { InMemoryMovementRepository } from '../infrastructure/InMemoryMovementRepository';
import { CreateMovement } from './CreateMovement';
import { FindMovements } from './FindMovements';

describe('FindMovements', () => {
    it('passes the filter and pagination through to the repository and returns matching views', async () => {
        const repository = new InMemoryMovementRepository();
        const create = new CreateMovement(repository);
        await create.execute({
            Type: MovementType.INGRESO,
            Amount: 100,
            Date: new Date(2026, 5, 10),
            Account: '507f1f77bcf86cd799439011',
        });
        await create.execute({
            Type: MovementType.EGRESO,
            Amount: 40,
            Date: new Date(2026, 5, 12),
            Account: '507f1f77bcf86cd799439011',
        });

        const found = await new FindMovements(repository).execute({ Type: MovementType.EGRESO });

        expect(found).toHaveLength(1);
        expect(found[0].Amount).toBe(40);
    });

    it('honors pagination', async () => {
        const repository = new InMemoryMovementRepository();
        const create = new CreateMovement(repository);
        for (let i = 0; i < 3; i += 1) {
            await create.execute({
                Type: MovementType.INGRESO,
                Amount: i,
                Date: new Date(2026, 5, 10 + i),
                Account: '507f1f77bcf86cd799439011',
            });
        }

        const page = await new FindMovements(repository).execute({}, undefined, { skip: 1, limit: 1 });

        expect(page).toHaveLength(1);
    });
});
