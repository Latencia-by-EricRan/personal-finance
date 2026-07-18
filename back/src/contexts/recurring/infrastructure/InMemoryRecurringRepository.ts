import { Identity } from '../../../shared/domain/Identity';
import { Recurring, RecurringFrequency, RecurringType } from '../domain/Recurring';
import { Pagination, RecurringPatch, RecurringRepository, RecurringView } from '../application/ports/RecurringRepository';

interface StoredRecurring {
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
 * Map-backed fake used by use-case tests and one side of the shared
 * `RecurringRepository.contract.test.ts`. `update` merges the patch directly
 * onto the stored record WITHOUT reconstructing through
 * `Recurring.rehydrate`/`assertInvariants` — mirrors what
 * `MongooseRecurringRepository` actually does (`findByIdAndUpdate` with
 * `runValidators:true`, no domain re-validation), matching legacy
 * `recurring.service.ts`. `delete` is a REAL hard removal, mirroring legacy.
 * `claim` simulates Mongo's atomic `findOneAndUpdate` guard: a
 * check-then-set on the stored record, sufficient for JS's single-threaded
 * execution model (design D12's "InMemory adapter must simulate the atomic
 * claim" requirement).
 */
export class InMemoryRecurringRepository implements RecurringRepository {
    private readonly recurrings = new Map<string, StoredRecurring>();

    async find(filter: Record<string, unknown>, pagination?: Pagination): Promise<RecurringView[]> {
        let items = Array.from(this.recurrings.entries()).filter(([, recurring]) => this.matchesFilter(recurring, filter));

        if (pagination) {
            items = pagination.limit > 0
                ? items.slice(pagination.skip, pagination.skip + pagination.limit)
                : items.slice(pagination.skip);
        }

        return items.map(([id, recurring]) => this.toView(id, recurring));
    }

    async findById(id: Identity): Promise<RecurringView | null> {
        const found = this.recurrings.get(id.value);

        return found ? this.toView(id.value, found) : null;
    }

    async create(recurring: Recurring): Promise<RecurringView> {
        const id = Identity.generate();
        const stored: StoredRecurring = {
            Type: recurring.type,
            Amount: recurring.amount,
            Category: recurring.category,
            Account: recurring.account,
            Description: recurring.description,
            Card: recurring.card,
            Frequency: recurring.frequency,
            DayOfMonth: recurring.dayOfMonth,
            Active: recurring.active,
            LastRunYearMonth: recurring.lastRunYearMonth,
        };
        this.recurrings.set(id, stored);

        return this.toView(id, stored);
    }

    async update(id: Identity, patch: RecurringPatch): Promise<RecurringView | null> {
        const existing = this.recurrings.get(id.value);

        if (!existing) {
            return null;
        }

        if (patch.Type !== undefined && patch.Type !== 'ingreso' && patch.Type !== 'egreso') {
            throw new Error(`Recurring.Type must be "ingreso" or "egreso", got "${String(patch.Type)}"`);
        }
        if (patch.Frequency !== undefined && patch.Frequency !== 'mensual') {
            throw new Error(`Recurring.Frequency must be "mensual", got "${String(patch.Frequency)}"`);
        }
        if (patch.DayOfMonth !== undefined && (typeof patch.DayOfMonth !== 'number' || Number.isNaN(patch.DayOfMonth) || patch.DayOfMonth < 1 || patch.DayOfMonth > 31)) {
            // Mirrors RecurringModel's schema (`min: 1, max: 31`, plain `Number` type
            // with no integer validator) — runValidators on update() does NOT reject
            // a non-integer like 5.5, only out-of-range values. Do not add an
            // integer check here or InMemory would be stricter than Mongoose.
            throw new Error(`Recurring.DayOfMonth must be a number between 1 and 31, got "${String(patch.DayOfMonth)}"`);
        }

        const merged: StoredRecurring = {
            Type: patch.Type ?? existing.Type,
            Amount: patch.Amount ?? existing.Amount,
            Category: patch.Category ?? existing.Category,
            Account: patch.Account ?? existing.Account,
            Description: patch.Description ?? existing.Description,
            Card: patch.Card ?? existing.Card,
            Frequency: patch.Frequency ?? existing.Frequency,
            DayOfMonth: patch.DayOfMonth ?? existing.DayOfMonth,
            Active: patch.Active ?? existing.Active,
            LastRunYearMonth: patch.LastRunYearMonth !== undefined ? patch.LastRunYearMonth : existing.LastRunYearMonth,
        };

        this.recurrings.set(id.value, merged);

        return this.toView(id.value, merged);
    }

    async delete(id: Identity): Promise<RecurringView | null> {
        const existing = this.recurrings.get(id.value);

        if (!existing) {
            return null;
        }

        this.recurrings.delete(id.value);

        return this.toView(id.value, existing);
    }

    async findDue(currentYearMonth: string): Promise<RecurringView[]> {
        return Array.from(this.recurrings.entries())
            .filter(([, recurring]) => recurring.Active && recurring.LastRunYearMonth !== currentYearMonth)
            .map(([id, recurring]) => this.toView(id, recurring));
    }

    async claim(id: string, currentYearMonth: string): Promise<boolean> {
        const existing = this.recurrings.get(id);

        if (!existing || existing.LastRunYearMonth === currentYearMonth) {
            return false;
        }

        existing.LastRunYearMonth = currentYearMonth;

        return true;
    }

    private toView(id: string, recurring: StoredRecurring): RecurringView {
        return {
            _id: id,
            Type: recurring.Type,
            Amount: recurring.Amount,
            Category: recurring.Category,
            Account: recurring.Account,
            Description: recurring.Description,
            Card: recurring.Card,
            Frequency: recurring.Frequency,
            DayOfMonth: recurring.DayOfMonth,
            Active: recurring.Active,
            LastRunYearMonth: recurring.LastRunYearMonth,
        };
    }

    private matchesFilter(recurring: StoredRecurring, filter: Record<string, unknown>): boolean {
        return Object.entries(filter).every(([field, value]) => {
            switch (field) {
                case 'Type':
                    return recurring.Type === value;
                case 'Category':
                    return recurring.Category === value;
                case 'Account':
                    return recurring.Account === value;
                case 'Frequency':
                    return recurring.Frequency === value;
                case 'DayOfMonth':
                    return recurring.DayOfMonth === value;
                case 'Active':
                    return recurring.Active === value;
                case 'LastRunYearMonth':
                    return recurring.LastRunYearMonth === value;
                default:
                    return true;
            }
        });
    }
}
