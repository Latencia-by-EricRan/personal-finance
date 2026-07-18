import { CreateRecurring } from './CreateRecurring';
import { DeleteRecurring } from './DeleteRecurring';
import { FindRecurringById } from './FindRecurringById';
import { FindRecurrings } from './FindRecurrings';
import { RunRecurrings } from './RunRecurrings';
import { UpdateRecurring } from './UpdateRecurring';

/**
 * Aggregate of recurring use cases, to be wired by the composition root in
 * PR1b (`container.recurring`) and consumed by the HTTP inbound adapter.
 * Neither side depends on the other's construction details — the
 * composition root will build this shape from `MongooseRecurringRepository`
 * + `MongooseMovementGateway` (recurring-local), the HTTP adapter only calls
 * `.execute(...)` on each use case. Mirrors `BudgetUseCases`/
 * `AccountUseCases` 1:1. PR1a leaves this unwired (design D12/D16); PR1b
 * wires it into `composition-root.ts`/`_routes.ts`.
 */
export interface RecurringUseCases {
    findRecurrings: FindRecurrings;
    findRecurringById: FindRecurringById;
    createRecurring: CreateRecurring;
    updateRecurring: UpdateRecurring;
    deleteRecurring: DeleteRecurring;
    runRecurrings: RunRecurrings;
}
