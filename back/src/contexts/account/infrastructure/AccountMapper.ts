import { Types } from 'mongoose';
import { Identity } from '../../../shared/domain/Identity';
import { Account } from '../domain/Account';
import { AccountView } from '../application/ports/AccountRepository';
import { AccountDocument } from './AccountModel';

/**
 * Loosely-typed lean read row `MongooseAccountRepository` passes to `toView`
 * after `.find(...).lean()`, `.findById(...).lean()`, `.create(...)`, or
 * `.findByIdAndUpdate(...)`. Carries the persistence-only fields
 * (`_id`, `createdAt`, `updatedAt`) that the write-side `AccountDocument`
 * deliberately omits (design D7).
 */
export interface AccountReadRow {
    _id: Types.ObjectId | string;
    Name: string;
    Type: AccountDocument['Type'];
    Currency: string;
    Icon: string;
    Archived: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Standalone mapper (design D7 — deviation from category's
 * `implements Mapper<Domain,Persistence>`, mirrors movement's
 * `MovementMapper`): `AccountModel` has `timestamps:true`, so the PRIMARY
 * read seam is `toView`, not `toDomain` — `toDomain(id,raw)` exists only for
 * `InMemoryAccountRepository`/contract tests.
 */
export class AccountMapper {
    toPersistence(entity: Account): AccountDocument {
        return {
            Name: entity.name,
            Type: entity.type,
            Currency: entity.currency,
            Icon: entity.icon,
            Archived: entity.archived,
        };
    }

    toDomain(id: Identity, raw: AccountDocument): Account {
        return Account.rehydrate(id, {
            Name: raw.Name,
            Type: raw.Type,
            Currency: raw.Currency,
            Icon: raw.Icon,
            Archived: raw.Archived,
        });
    }

    toView(row: AccountReadRow): AccountView {
        return {
            _id: String(row._id),
            Name: row.Name,
            Type: row.Type,
            Currency: row.Currency,
            Icon: row.Icon,
            Archived: row.Archived,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
}
