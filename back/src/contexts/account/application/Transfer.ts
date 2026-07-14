import { Identity } from '../../../shared/domain/Identity';
import { ServiceError } from '../../../utils/service-error.util';
import { AccountRepository } from './ports/AccountRepository';
import { CreateTransferMovementInput, MovementGateway, TransferMovementView } from './ports/MovementGateway';

export interface TransferInput {
    From: string;
    To: string;
    Amount: number;
    Date: Date;
    Description?: string;
}

/**
 * Byte-identical port of `AccountService.transfer` (legacy
 * `src/modules/services/account.service.ts`) onto `AccountRepository` +
 * `MovementGateway`. The ordered validation, `ServiceError` usage (400/404),
 * shared `TransferId` (`Identity.generate()`, design D6), two-leg write, and
 * compensating rollback semantics are all replicated verbatim — this is a
 * use-case-level concern, deliberately NOT delegated to the domain `Account`
 * aggregate's invariants (which throw plain `Error`, not `ServiceError`).
 */
export class Transfer {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly movementGateway: MovementGateway,
    ) {}

    async execute(input: TransferInput): Promise<[TransferMovementView, TransferMovementView]> {
        const { From, To, Amount, Date: date, Description } = input;

        if (From === To) {
            throw new ServiceError('From and To accounts must be different', 400);
        }
        if (!(Amount > 0)) {
            throw new ServiceError('Amount must be greater than 0', 400);
        }

        const [fromAccount, toAccount] = await Promise.all([
            this.accountRepository.findById(Identity.create(From)),
            this.accountRepository.findById(Identity.create(To)),
        ]);
        if (!fromAccount) {
            throw new ServiceError('From account not found', 404);
        }
        if (!toAccount) {
            throw new ServiceError('To account not found', 404);
        }
        if (fromAccount.Archived) {
            throw new ServiceError('From account is archived', 400);
        }
        if (toAccount.Archived) {
            throw new ServiceError('To account is archived', 400);
        }

        const TransferId = Identity.generate();

        const egresoInput: CreateTransferMovementInput = {
            Type: 'egreso', Account: From, Amount, Date: date, Description, TransferId,
        };
        const egresoMovement = await this.movementGateway.createTransferMovement(egresoInput);

        try {
            const ingresoInput: CreateTransferMovementInput = {
                Type: 'ingreso', Account: To, Amount, Date: date, Description, TransferId,
            };
            const ingresoMovement = await this.movementGateway.createTransferMovement(ingresoInput);

            return [egresoMovement, ingresoMovement];
        } catch (error: unknown) {
            try {
                await this.movementGateway.deleteMovement(egresoMovement._id);
            } catch (rollbackError: unknown) {
                console.error(
                    `Transfer: compensating rollback failed for orphaned movement ${egresoMovement._id} (TransferId: ${TransferId})`,
                    rollbackError,
                );
            }
            throw error;
        }
    }
}
