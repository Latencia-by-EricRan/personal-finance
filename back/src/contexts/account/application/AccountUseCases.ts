import { ArchiveAccount } from './ArchiveAccount';
import { CreateAccount } from './CreateAccount';
import { FindAccountById } from './FindAccountById';
import { FindAccounts } from './FindAccounts';
import { GetAccountBalance } from './GetAccountBalance';
import { Transfer } from './Transfer';
import { UpdateAccount } from './UpdateAccount';

/**
 * Aggregate of account use cases exposed by the composition root (wired in
 * PR3, `container.account`) and consumed by the HTTP inbound adapter.
 * Neither side depends on the other's construction details — the
 * composition root builds this shape from `MongooseAccountRepository` +
 * `MongooseMovementGateway`, the HTTP adapter only calls `.execute(...)` on
 * each use case. Mirrors `MovementUseCases`/`CategoryUseCases` 1:1.
 */
export interface AccountUseCases {
    findAccounts: FindAccounts;
    findAccountById: FindAccountById;
    createAccount: CreateAccount;
    updateAccount: UpdateAccount;
    archiveAccount: ArchiveAccount;
    getAccountBalance: GetAccountBalance;
    transfer: Transfer;
}
