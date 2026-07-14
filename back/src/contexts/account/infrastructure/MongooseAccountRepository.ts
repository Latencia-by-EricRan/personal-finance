import { Identity } from '../../../shared/domain/Identity';
import { Account } from '../domain/Account';
import { AccountPatch, AccountRepository, AccountView, Pagination } from '../application/ports/AccountRepository';
import { AccountMapper, AccountReadRow } from './AccountMapper';
import AccountModel from './AccountModel';

/**
 * Real adapter. The ONLY place in the codebase aware of Mongoose read rows —
 * mirrors `MongooseMovementRepository` shape (design D2/D3).
 */
export class MongooseAccountRepository implements AccountRepository {
    private readonly mapper = new AccountMapper();

    async find(filter: Record<string, unknown>, pagination?: Pagination): Promise<AccountView[]> {
        const query = AccountModel.find(filter);

        if (pagination) {
            query.skip(pagination.skip).limit(pagination.limit);
        }

        const rows = await query.lean();

        return rows.map((row) => this.mapper.toView(row as unknown as AccountReadRow));
    }

    async findById(id: Identity): Promise<AccountView | null> {
        const row = await AccountModel.findById(id.toObjectId()).lean();

        return row ? this.mapper.toView(row as unknown as AccountReadRow) : null;
    }

    async create(account: Account): Promise<AccountView> {
        const document = this.mapper.toPersistence(account);
        const created = await AccountModel.create(document);

        return this.mapper.toView(created.toObject() as unknown as AccountReadRow);
    }

    async update(id: Identity, patch: AccountPatch): Promise<AccountView | null> {
        const updated = await AccountModel.findByIdAndUpdate(id.toObjectId(), patch, {
            new: true,
            runValidators: true,
        }).lean();

        return updated ? this.mapper.toView(updated as unknown as AccountReadRow) : null;
    }

    async archive(id: Identity): Promise<AccountView | null> {
        const archived = await AccountModel.findByIdAndUpdate(
            id.toObjectId(),
            { Archived: true },
            { new: true },
        ).lean();

        return archived ? this.mapper.toView(archived as unknown as AccountReadRow) : null;
    }
}
