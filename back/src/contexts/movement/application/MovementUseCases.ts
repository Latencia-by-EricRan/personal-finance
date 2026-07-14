import { CreateMovement } from './CreateMovement';
import { DeleteMovement } from './DeleteMovement';
import { FindMovements } from './FindMovements';
import { GetMonthlySummary } from './GetMonthlySummary';
import { SaveManyMovements } from './SaveManyMovements';
import { UpdateMovement } from './UpdateMovement';

/**
 * Aggregate of movement use cases exposed by the composition root (wired in
 * PR3, `container.movement`) and consumed by the HTTP inbound adapter.
 * Neither side depends on the other's construction details — the
 * composition root builds this shape from `MongooseMovementRepository`, the
 * HTTP adapter only calls `.execute(...)` on each use case.
 */
export interface MovementUseCases {
    createMovement: CreateMovement;
    updateMovement: UpdateMovement;
    deleteMovement: DeleteMovement;
    findMovements: FindMovements;
    saveManyMovements: SaveManyMovements;
    getMonthlySummary: GetMonthlySummary;
}
