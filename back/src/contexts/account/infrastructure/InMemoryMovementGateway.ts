import { Identity } from '../../../shared/domain/Identity';
import {
    AccountMovementRow,
    CreateTransferMovementInput,
    MovementGateway,
    TransferMovementView,
} from '../application/ports/MovementGateway';

interface StoredTransferMovement {
    Type: CreateTransferMovementInput['Type'];
    Amount: number;
    Date: Date;
    Account: string;
    Description?: string;
    TransferId: string;
}

/**
 * Map-backed fake used by `GetAccountBalance`/`Transfer` use-case tests and
 * one side of the shared `MovementGateway.contract.test.ts`. Keyed by
 * `Identity.generate()`, mirroring `InMemoryAccountRepository`'s pattern.
 */
export class InMemoryMovementGateway implements MovementGateway {
    private readonly movements = new Map<string, StoredTransferMovement>();

    async findByAccount(accountId: string): Promise<AccountMovementRow[]> {
        return Array.from(this.movements.values())
            .filter((movement) => movement.Account === accountId)
            .map((movement) => ({ Type: movement.Type, Amount: movement.Amount }));
    }

    async createTransferMovement(input: CreateTransferMovementInput): Promise<TransferMovementView> {
        const id = Identity.generate();
        const stored: StoredTransferMovement = {
            Type: input.Type,
            Amount: input.Amount,
            Date: input.Date,
            Account: input.Account,
            Description: input.Description,
            TransferId: input.TransferId,
        };
        this.movements.set(id, stored);

        return this.toView(id, stored);
    }

    async deleteMovement(id: string): Promise<void> {
        this.movements.delete(id);
    }

    private toView(id: string, movement: StoredTransferMovement): TransferMovementView {
        return {
            _id: id,
            Type: movement.Type,
            Amount: movement.Amount,
            Date: movement.Date,
            Account: movement.Account,
            Description: movement.Description,
            TransferId: movement.TransferId,
        };
    }
}
