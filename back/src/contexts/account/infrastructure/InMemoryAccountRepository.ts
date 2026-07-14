import { Identity } from '../../../shared/domain/Identity';
import { Account } from '../domain/Account';
import { AccountPatch, AccountRepository, AccountView, Pagination } from '../application/ports/AccountRepository';

/**
 * Map-backed fake used by use-case tests and one side of the shared
 * `AccountRepository.contract.test.ts`. `update`/`archive` reconstruct
 * through `Account.rehydrate` (which re-runs `assertInvariants`) so this
 * fake enforces the same `Type` whitelist `MongooseAccountRepository`
 * enforces via `runValidators:true` — contract parity.
 */
export class InMemoryAccountRepository implements AccountRepository {
    private readonly accounts = new Map<string, Account>();

    async find(filter: Record<string, unknown>, pagination?: Pagination): Promise<AccountView[]> {
        let items = Array.from(this.accounts.values()).filter((account) => this.matchesFilter(account, filter));

        if (pagination) {
            items = items.slice(pagination.skip, pagination.skip + pagination.limit);
        }

        return items.map((account) => this.toView(account));
    }

    async findById(id: Identity): Promise<AccountView | null> {
        const found = this.accounts.get(id.value);

        return found ? this.toView(found) : null;
    }

    async create(account: Account): Promise<AccountView> {
        const saved = Account.rehydrate(Identity.create(Identity.generate()), {
            Name: account.name,
            Type: account.type,
            Currency: account.currency,
            Icon: account.icon,
            Archived: account.archived,
        });
        this.accounts.set(saved.id!.value, saved);

        return this.toView(saved);
    }

    async update(id: Identity, patch: AccountPatch): Promise<AccountView | null> {
        const existing = this.accounts.get(id.value);

        if (!existing) {
            return null;
        }

        const merged = Account.rehydrate(id, {
            Name: patch.Name ?? existing.name,
            Type: patch.Type ?? existing.type,
            Currency: patch.Currency ?? existing.currency,
            Icon: patch.Icon ?? existing.icon,
            Archived: patch.Archived ?? existing.archived,
        });
        this.accounts.set(id.value, merged);

        return this.toView(merged);
    }

    async archive(id: Identity): Promise<AccountView | null> {
        const existing = this.accounts.get(id.value);

        if (!existing) {
            return null;
        }

        const archived = Account.rehydrate(id, {
            Name: existing.name,
            Type: existing.type,
            Currency: existing.currency,
            Icon: existing.icon,
            Archived: true,
        });
        this.accounts.set(id.value, archived);

        return this.toView(archived);
    }

    private toView(account: Account): AccountView {
        return {
            _id: account.id!.value,
            Name: account.name,
            Type: account.type,
            Currency: account.currency,
            Icon: account.icon,
            Archived: account.archived,
        };
    }

    private matchesFilter(account: Account, filter: Record<string, unknown>): boolean {
        return Object.entries(filter).every(([field, value]) => {
            switch (field) {
                case 'Name':
                    return account.name === value;
                case 'Type':
                    return account.type === value;
                case 'Currency':
                    return account.currency === value;
                case 'Icon':
                    return account.icon === value;
                case 'Archived':
                    return account.archived === value;
                default:
                    return true;
            }
        });
    }
}
