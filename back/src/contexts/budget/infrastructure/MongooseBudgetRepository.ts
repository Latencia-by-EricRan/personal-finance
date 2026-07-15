import { Identity } from '../../../shared/domain/Identity';
import { Budget } from '../domain/Budget';
import { BudgetPatch, BudgetRepository, BudgetView, Pagination } from '../application/ports/BudgetRepository';
import { BudgetMapper, BudgetReadRow } from './BudgetMapper';
import BudgetModel, { BudgetDocument } from './BudgetModel';

/**
 * Real adapter. The ONLY place in the codebase aware of Mongoose read rows
 * for `budget` — mirrors `MongooseAccountRepository`/`MongooseMovementRepository`
 * shape (design D2/D3). `find`/`findById` `.populate('Category')` exactly as
 * legacy `budget.service.ts:20,30`; `create`/`update` do NOT populate
 * (`budget.service.ts:35,38`). `delete` is a REAL hard delete via
 * `findByIdAndDelete` (design D7). The unique compound index
 * `{Category,Month,Year}` (design D9) lives on `BudgetModel` untouched — a
 * violating `create`/`update` here throws Mongo's raw `11000` error, left
 * for the PR3 HTTP controller to translate (not caught here).
 */
export class MongooseBudgetRepository implements BudgetRepository {
    private readonly mapper = new BudgetMapper();

    async find(filter: Record<string, unknown>, pagination?: Pagination): Promise<BudgetView[]> {
        const query = BudgetModel.find(filter).populate('Category');

        if (pagination) {
            query.skip(pagination.skip).limit(pagination.limit);
        }

        const rows = await query.lean();

        return rows.map((row) => this.mapper.toView(row as unknown as BudgetReadRow));
    }

    async findById(id: Identity): Promise<BudgetView | null> {
        const row = await BudgetModel.findById(id.toObjectId()).populate('Category').lean();

        return row ? this.mapper.toView(row as unknown as BudgetReadRow) : null;
    }

    async create(budget: Budget): Promise<BudgetView> {
        const document = this.mapper.toPersistence(budget);
        // `document.Category` is the bare id string (design D8's write
        // shape). Mongoose casts it to an ObjectId automatically at runtime
        // (same as legacy `budget.service.ts:34` passing raw `req.body`);
        // the cast below is ONLY to satisfy `BudgetDocument`'s pre-existing
        // `Category: Schema.Types.ObjectId` field type (a SchemaType
        // descriptor, not a value type — kept untouched, see `BudgetModel`'s
        // note, to avoid breaking the legacy `budget.service.ts` consumer).
        const created = await BudgetModel.create(document as unknown as BudgetDocument);

        return this.mapper.toView(created.toObject() as unknown as BudgetReadRow);
    }

    async update(id: Identity, patch: BudgetPatch): Promise<BudgetView | null> {
        const updated = await BudgetModel.findByIdAndUpdate(id.toObjectId(), patch, {
            new: true,
            runValidators: true,
        }).lean();

        return updated ? this.mapper.toView(updated as unknown as BudgetReadRow) : null;
    }

    async delete(id: Identity): Promise<BudgetView | null> {
        const removed = await BudgetModel.findByIdAndDelete(id.toObjectId()).lean();

        return removed ? this.mapper.toView(removed as unknown as BudgetReadRow) : null;
    }
}
