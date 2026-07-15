import { Types } from 'mongoose';
import { Identity } from '../../../shared/domain/Identity';
import { Budget } from '../domain/Budget';
import { BudgetView } from '../application/ports/BudgetRepository';

/**
 * Write-shape persistence document (design D8) — bare Category id string,
 * no `_id`/timestamps. Deliberately a DIFFERENT type from `BudgetDocument`
 * exported by `BudgetModel` (whose `Category` field is typed
 * `Schema.Types.ObjectId`, the legacy SchemaType descriptor carried over
 * verbatim from `budget.interface.ts` — not a runtime value type). Mongoose
 * casts the bare id string to an ObjectId on write, mirroring
 * `budget.service.ts:35,38` (create/update never populate).
 */
export interface BudgetWriteDocument {
    Category: string;
    Month: number;
    Year: number;
    Limit: number;
}

/**
 * Loosely-typed lean read row `MongooseBudgetRepository` passes to `toView`
 * after `.find(...).populate('Category').lean()`,
 * `.findById(...).populate('Category').lean()`, `.create(...)`,
 * `.findByIdAndUpdate(...)`, or `.findByIdAndDelete(...)`. `Category` is
 * `unknown` on purpose (design D2/D3): the FULL populated Category
 * sub-document on find/findById, a bare `ObjectId`/string on
 * create/update/delete — `toView` echoes it VERBATIM, never reshaping it.
 */
export interface BudgetReadRow {
    _id: Types.ObjectId | string;
    Category: unknown;
    Month: number;
    Year: number;
    Limit: number;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Standalone mapper (design D8 — deviation from category's
 * `implements Mapper<Domain,Persistence>`, mirrors account/movement's
 * standalone mappers): `BudgetModel` has `timestamps:true` AND populates on
 * read, so the PRIMARY read seam is `toView`, not `toDomain` — `toDomain`
 * exists only for `InMemoryBudgetRepository`/contract tests.
 */
export class BudgetMapper {
    toPersistence(entity: Budget): BudgetWriteDocument {
        return {
            Category: entity.category,
            Month: entity.month,
            Year: entity.year,
            Limit: entity.limit,
        };
    }

    toDomain(id: Identity, raw: BudgetWriteDocument): Budget {
        return Budget.rehydrate(id, {
            Category: raw.Category,
            Month: raw.Month,
            Year: raw.Year,
            Limit: raw.Limit,
        });
    }

    toView(row: BudgetReadRow): BudgetView {
        return {
            _id: String(row._id),
            Category: row.Category,
            Month: row.Month,
            Year: row.Year,
            Limit: row.Limit,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
}
