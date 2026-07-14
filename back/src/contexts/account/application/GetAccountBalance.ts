import { Identity } from '../../../shared/domain/Identity';
import { ServiceError } from '../../../utils/service-error.util';
import { AccountRepository } from './ports/AccountRepository';
import { MovementGateway } from './ports/MovementGateway';

export interface AccountBalance {
    Account: string;
    Balance: number;
}

/**
 * Mirrors `AccountService.getBalance` 1:1: the 404 existence check MUST
 * happen BEFORE any movement lookup (spec's "Balance — 404 check happens
 * before computing" requirement) — `movementGateway.findByAccount` is never
 * invoked on the not-found path.
 */
export class GetAccountBalance {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly movementGateway: MovementGateway,
    ) {}

    async execute(id: string): Promise<AccountBalance> {
        const account = await this.accountRepository.findById(Identity.create(id));

        if (!account) {
            throw new ServiceError('Account not found', 404);
        }

        const movements = await this.movementGateway.findByAccount(id);
        const Balance = movements.reduce(
            (acc, movement) => (movement.Type === 'ingreso' ? acc + movement.Amount : acc - movement.Amount),
            0,
        );

        return { Account: id, Balance };
    }
}
