import { Types } from 'mongoose';
import { Identity } from '../../../shared/domain/Identity';
import { Recurring, RecurringFrequency, RecurringType } from '../domain/Recurring';
import { RecurringView } from '../application/ports/RecurringRepository';

/**
 * Write-shape persistence document — bare `Category`/`Account` id strings,
 * no `_id`/timestamps. Unlike `BudgetMapper`, there is no populated-vs-bare
 * dual shape to preserve: legacy `recurring.service.ts` never `.populate()`s.
 */
export interface RecurringWriteDocument {
    Type: RecurringType;
    Amount: number;
    Category: string;
    Account: string;
    Description?: string;
    Card?: string;
    Frequency: RecurringFrequency;
    DayOfMonth: number;
    Active: boolean;
    LastRunYearMonth: string | null;
}

/**
 * Loosely-typed lean read row `MongooseRecurringRepository` passes to
 * `toView` after `.find(...)`, `.findById(...)`, `.create(...)`,
 * `.findByIdAndUpdate(...)`, or `.findByIdAndDelete(...)`.
 */
export interface RecurringReadRow {
    _id: Types.ObjectId | string;
    Type: RecurringType;
    Amount: number;
    Category: Types.ObjectId | string;
    Account: Types.ObjectId | string;
    Description?: string;
    Card?: string;
    Frequency: RecurringFrequency;
    DayOfMonth: number;
    Active: boolean;
    LastRunYearMonth: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Standalone mapper (mirrors `BudgetMapper`/account+movement's standalone
 * mappers): `RecurringModel` has `timestamps:true`, so `toView` is the
 * primary read seam; `toDomain` exists for `InMemoryRecurringRepository`/
 * contract-test symmetry.
 */
export class RecurringMapper {
    toPersistence(entity: Recurring): RecurringWriteDocument {
        return {
            Type: entity.type,
            Amount: entity.amount,
            Category: entity.category,
            Account: entity.account,
            Description: entity.description,
            Card: entity.card,
            Frequency: entity.frequency,
            DayOfMonth: entity.dayOfMonth,
            Active: entity.active,
            LastRunYearMonth: entity.lastRunYearMonth,
        };
    }

    toDomain(id: Identity, raw: RecurringWriteDocument): Recurring {
        return Recurring.rehydrate(id, {
            Type: raw.Type,
            Amount: raw.Amount,
            Category: raw.Category,
            Account: raw.Account,
            Description: raw.Description,
            Card: raw.Card,
            Frequency: raw.Frequency,
            DayOfMonth: raw.DayOfMonth,
            Active: raw.Active,
            LastRunYearMonth: raw.LastRunYearMonth,
        });
    }

    toView(row: RecurringReadRow): RecurringView {
        return {
            _id: String(row._id),
            Type: row.Type,
            Amount: row.Amount,
            Category: String(row.Category),
            Account: String(row.Account),
            Description: row.Description,
            Card: row.Card,
            Frequency: row.Frequency,
            DayOfMonth: row.DayOfMonth,
            Active: row.Active,
            LastRunYearMonth: row.LastRunYearMonth,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
}
