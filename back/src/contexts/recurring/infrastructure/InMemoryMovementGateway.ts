import { Identity } from '../../../shared/domain/Identity';
import { CreateRecurringMovementInput, CreatedMovementView, MovementGateway } from '../application/ports/MovementGateway';

interface StoredRecurringMovement {
    Type: CreateRecurringMovementInput['Type'];
    Amount: number;
    Category: string;
    Account: string;
    Description?: string;
    Card?: string;
    Date: Date;
}

/**
 * Map-backed fake used by `RunRecurrings` use-case tests and one side of the
 * shared `MovementGateway.contract.test.ts`. Keyed by `Identity.generate()`,
 * mirroring `account`'s `InMemoryMovementGateway` pattern.
 */
export class InMemoryMovementGateway implements MovementGateway {
    private readonly movements = new Map<string, StoredRecurringMovement>();

    async createMovement(input: CreateRecurringMovementInput): Promise<CreatedMovementView> {
        const id = Identity.generate();
        const stored: StoredRecurringMovement = {
            Type: input.Type,
            Amount: input.Amount,
            Category: input.Category,
            Account: input.Account,
            Description: input.Description,
            Card: input.Card,
            Date: input.Date,
        };
        this.movements.set(id, stored);

        return this.toView(id, stored);
    }

    private toView(id: string, movement: StoredRecurringMovement): CreatedMovementView {
        return {
            _id: id,
            Type: movement.Type,
            Amount: movement.Amount,
            Category: movement.Category,
            Account: movement.Account,
            Description: movement.Description,
            Card: movement.Card,
            Date: movement.Date,
        };
    }
}
