import { Identity } from '../../../shared/domain/Identity';
import { Account, AccountType } from '../domain/Account';
import { AccountPatch, AccountRepository, AccountView, Pagination } from '../application/ports/AccountRepository';

const VALID_TYPES: AccountType[] = ['efectivo', 'banco', 'tarjeta'];

interface StoredAccount {
    Name: string;
    Type: AccountType;
    Currency: string;
    Icon: string;
    Archived: boolean;
}

/**
 * Map-backed fake used by use-case tests and one side of the shared
 * `AccountRepository.contract.test.ts`. `update`/`archive` merge the patch
 * directly onto the stored record WITHOUT reconstructing through
 * `Account.rehydrate`/`assertInvariants` — this mirrors what
 * `MongooseAccountRepository` actually does (only Mongoose's own schema
 * `Type` enum check applies via `runValidators:true`; there is no
 * Currency-blank or Name-trim enforcement on update, matching legacy
 * `account.service.ts`). The `Type` enum check below is the ONLY validation
 * kept, to preserve `runValidators` parity with the real adapter.
 */
export class InMemoryAccountRepository implements AccountRepository {
    private readonly accounts = new Map<string, StoredAccount>();

    async find(filter: Record<string, unknown>, pagination?: Pagination): Promise<AccountView[]> {
        let items = Array.from(this.accounts.entries()).filter(([, account]) => this.matchesFilter(account, filter));

        if (pagination) {
            items = pagination.limit > 0
                ? items.slice(pagination.skip, pagination.skip + pagination.limit)
                : items.slice(pagination.skip);
        }

        return items.map(([id, account]) => this.toView(id, account));
    }

    async findById(id: Identity): Promise<AccountView | null> {
        const found = this.accounts.get(id.value);

        return found ? this.toView(id.value, found) : null;
    }

    async create(account: Account): Promise<AccountView> {
        const id = Identity.generate();
        const stored: StoredAccount = {
            Name: account.name,
            Type: account.type,
            Currency: account.currency,
            Icon: account.icon,
            Archived: account.archived,
        };
        this.accounts.set(id, stored);

        return this.toView(id, stored);
    }

    async update(id: Identity, patch: AccountPatch): Promise<AccountView | null> {
        const existing = this.accounts.get(id.value);

        if (!existing) {
            return null;
        }

        if (patch.Type !== undefined && !VALID_TYPES.includes(patch.Type)) {
            throw new Error(`Account.Type must be one of ${VALID_TYPES.join(', ')}, got "${String(patch.Type)}"`);
        }

        const merged: StoredAccount = {
            Name: patch.Name ?? existing.Name,
            Type: patch.Type ?? existing.Type,
            Currency: patch.Currency ?? existing.Currency,
            Icon: patch.Icon ?? existing.Icon,
            Archived: patch.Archived ?? existing.Archived,
        };
        this.accounts.set(id.value, merged);

        return this.toView(id.value, merged);
    }

    async archive(id: Identity): Promise<AccountView | null> {
        const existing = this.accounts.get(id.value);

        if (!existing) {
            return null;
        }

        const archived: StoredAccount = { ...existing, Archived: true };
        this.accounts.set(id.value, archived);

        return this.toView(id.value, archived);
    }

    private toView(id: string, account: StoredAccount): AccountView {
        return {
            _id: id,
            Name: account.Name,
            Type: account.Type,
            Currency: account.Currency,
            Icon: account.Icon,
            Archived: account.Archived,
        };
    }

    private matchesFilter(account: StoredAccount, filter: Record<string, unknown>): boolean {
        return Object.entries(filter).every(([field, value]) => {
            switch (field) {
                case 'Name':
                    return account.Name === value;
                case 'Type':
                    return account.Type === value;
                case 'Currency':
                    return account.Currency === value;
                case 'Icon':
                    return account.Icon === value;
                case 'Archived':
                    return account.Archived === value;
                default:
                    return true;
            }
        });
    }
}
