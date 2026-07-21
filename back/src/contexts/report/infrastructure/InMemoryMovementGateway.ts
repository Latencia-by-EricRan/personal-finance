import { EgresoWithCategoryRefRow, MovementGateway, MovementTypeAmountRow } from '../application/ports/MovementGateway';

interface StoredMovement {
    Type: 'ingreso' | 'egreso';
    Category: string | null;
    Amount: number;
    Date: Date;
}

/**
 * Array-backed fake used by report's use-case tests and one side of the
 * shared `MovementGateway.contract.test.ts`. `seed` is a TEST-ONLY helper —
 * deliberately NOT part of the `MovementGateway` interface, mirroring why
 * `budget`'s own `InMemoryMovementGateway` needed the same pattern (the real
 * port is read-only, with no write method to seed fixture data through).
 */
export class InMemoryMovementGateway implements MovementGateway {
    private readonly movements: StoredMovement[] = [];

    seed(movement: StoredMovement): void {
        this.movements.push(movement);
    }

    async findEgresoWithRefs(gteDate: Date, lteDate: Date): Promise<EgresoWithCategoryRefRow[]> {
        return this.movements
            .filter((movement) => movement.Type === 'egreso' && movement.Date >= gteDate && movement.Date <= lteDate)
            .map((movement) => ({ Amount: movement.Amount, Category: movement.Category }));
    }

    async findByDateRange(gteDate: Date, lteDate: Date): Promise<MovementTypeAmountRow[]> {
        return this.movements
            .filter((movement) => movement.Date >= gteDate && movement.Date <= lteDate)
            .map((movement) => ({ Type: movement.Type, Amount: movement.Amount }));
    }
}
