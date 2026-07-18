import { Identity } from '../../../../shared/domain/Identity';
import { Recurring, RecurringFrequency, RecurringProps, RecurringType } from '../../domain/Recurring';

/**
 * Application-layer pagination shape, deliberately NOT imported from
 * `src/utils/controller.util.ts` (which pulls in `express.Request`) to keep
 * the application layer framework-free — same "driver-free port" principle
 * `account`/`budget`/`category`/`movement` established.
 */
export interface Pagination {
    limit: number;
    skip: number;
}

/**
 * Read-model shape returned by every port method. Unlike `budget`, legacy
 * `recurring.service.ts` never `.populate()`s `Category`/`Account` on any
 * method (`find`/`findById`/`create`/`update`/`delete`/`run`'s internal
 * `find`), so both fields are always bare id strings here — no dual
 * populated/bare shape to preserve.
 */
export interface RecurringView {
    _id: string;
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
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Partial patch accepted by `UpdateRecurring`. `PUT /recurring/:id` is
 * genuinely partial (all fields optional on update), so this bypasses the
 * full-invariant `Recurring` aggregate on purpose — forwarded straight to
 * `repository.update`, mirroring `BudgetPatch`.
 */
export type RecurringPatch = Partial<RecurringProps>;

/**
 * Bespoke port for `recurring` (not the generic `Repository<T, Id>`) —
 * mirrors `recurring.service.ts`'s real current methods 1:1
 * (find/findById/create/update/delete), plus TWO methods `run()` needs that
 * budget's CRUD-only port does not: `findDue` (the due-recurrings query) and
 * `claim` (the atomic optimistic idempotency guard, design D12). `claim`
 * MUST be atomic at the adapter level — it is the sole seam preventing a
 * recurring from producing two Movements in the same `LastRunYearMonth`
 * under concurrent `run()` calls.
 */
export interface RecurringRepository {
    find(filter: Record<string, unknown>, pagination?: Pagination): Promise<RecurringView[]>;
    findById(id: Identity): Promise<RecurringView | null>;
    create(recurring: Recurring): Promise<RecurringView>;
    update(id: Identity, patch: RecurringPatch): Promise<RecurringView | null>;
    delete(id: Identity): Promise<RecurringView | null>;
    /** Mirrors `RecurringModel.find({Active:true, LastRunYearMonth:{$ne: currentYearMonth}})`. */
    findDue(currentYearMonth: string): Promise<RecurringView[]>;
    /**
     * Atomic optimistic claim mirroring
     * `RecurringModel.findOneAndUpdate({_id, LastRunYearMonth:{$ne: currentYearMonth}}, {LastRunYearMonth: currentYearMonth})`.
     * Returns `true` when this call won the claim, `false` when another
     * concurrent `run()` already claimed it this month (or the id does not
     * exist).
     */
    claim(id: string, currentYearMonth: string): Promise<boolean>;
}
