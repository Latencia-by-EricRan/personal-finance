import { EgresoMovementRow, MovementGateway } from '../application/ports/MovementGateway';

interface StoredMovement {
    Type: 'ingreso' | 'egreso';
    Category: string;
    Amount: number;
    Date: Date;
}

/**
 * Array-backed fake used by `GetBudgetStatus` use-case tests and one side of
 * the shared `MovementGateway.contract.test.ts`. `seed` is a TEST-ONLY
 * helper — deliberately NOT part of the `MovementGateway` interface, since
 * the real port is read-only and has no write method to seed fixture data
 * through (mirrors why `InMemoryBudgetRepository` needed no equivalent: its
 * port already exposes `create`).
 */
export class InMemoryMovementGateway implements MovementGateway {
    private readonly movements: StoredMovement[] = [];

    seed(movement: StoredMovement): void {
        this.movements.push(movement);
    }

    async findEgresoAmounts(categoryId: string, gteDate: Date, lteDate: Date): Promise<EgresoMovementRow[]> {
        return this.movements
            .filter(
                (movement) =>
                    movement.Type === 'egreso' &&
                    movement.Category === categoryId &&
                    movement.Date >= gteDate &&
                    movement.Date <= lteDate,
            )
            .map((movement) => ({ Amount: movement.Amount }));
    }
}
