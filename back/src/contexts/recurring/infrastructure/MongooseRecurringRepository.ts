import { Identity } from '../../../shared/domain/Identity';
import { Recurring } from '../domain/Recurring';
import { Pagination, RecurringPatch, RecurringRepository, RecurringView } from '../application/ports/RecurringRepository';
import { RecurringMapper, RecurringReadRow } from './RecurringMapper';
import RecurringModel, { RecurringDocument } from './RecurringModel';

/**
 * Real adapter. The ONLY place in the codebase aware of Mongoose read rows
 * for `recurring` — mirrors `MongooseBudgetRepository`'s shape. No
 * `.populate()` anywhere (legacy `recurring.service.ts` never populates).
 * `delete` is a REAL hard delete via `findByIdAndDelete`, mirroring legacy.
 */
export class MongooseRecurringRepository implements RecurringRepository {
    private readonly mapper = new RecurringMapper();

    async find(filter: Record<string, unknown>, pagination?: Pagination): Promise<RecurringView[]> {
        const query = RecurringModel.find(filter);

        if (pagination) {
            query.skip(pagination.skip).limit(pagination.limit);
        }

        const rows = await query.lean();

        return rows.map((row) => this.mapper.toView(row as unknown as RecurringReadRow));
    }

    async findById(id: Identity): Promise<RecurringView | null> {
        const row = await RecurringModel.findById(id.toObjectId()).lean();

        return row ? this.mapper.toView(row as unknown as RecurringReadRow) : null;
    }

    async create(recurring: Recurring): Promise<RecurringView> {
        const document = this.mapper.toPersistence(recurring);
        // `document.Category`/`document.Account` are bare id strings (the
        // write shape). Mongoose casts them to ObjectIds automatically at
        // runtime; the cast below is ONLY to satisfy `RecurringDocument`'s
        // pre-existing `Schema.Types.ObjectId` field types (SchemaType
        // descriptors, not value types — same quirk `MongooseBudgetRepository`
        // works around locally).
        const created = await RecurringModel.create(document as unknown as RecurringDocument);

        return this.mapper.toView(created.toObject() as unknown as RecurringReadRow);
    }

    async update(id: Identity, patch: RecurringPatch): Promise<RecurringView | null> {
        const updated = await RecurringModel.findByIdAndUpdate(id.toObjectId(), patch, {
            new: true,
            runValidators: true,
        }).lean();

        return updated ? this.mapper.toView(updated as unknown as RecurringReadRow) : null;
    }

    async delete(id: Identity): Promise<RecurringView | null> {
        const removed = await RecurringModel.findByIdAndDelete(id.toObjectId()).lean();

        return removed ? this.mapper.toView(removed as unknown as RecurringReadRow) : null;
    }

    async findDue(currentYearMonth: string): Promise<RecurringView[]> {
        const rows = await RecurringModel.find({
            Active: true,
            LastRunYearMonth: { $ne: currentYearMonth },
        }).lean();

        return rows.map((row) => this.mapper.toView(row as unknown as RecurringReadRow));
    }

    async claim(id: string, currentYearMonth: string): Promise<boolean> {
        const claimed = await RecurringModel.findOneAndUpdate(
            { _id: id, LastRunYearMonth: { $ne: currentYearMonth } },
            { LastRunYearMonth: currentYearMonth },
        );

        return claimed !== null;
    }
}
