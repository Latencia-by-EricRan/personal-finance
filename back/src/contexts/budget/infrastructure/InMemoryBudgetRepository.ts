import { Identity } from '../../../shared/domain/Identity';
import { Budget } from '../domain/Budget';
import { BudgetPatch, BudgetRepository, BudgetView, Pagination } from '../application/ports/BudgetRepository';

interface StoredBudget {
    Category: string;
    Month: number;
    Year: number;
    Limit: number;
}

/**
 * Shape of a raw MongoDB duplicate-key error (code `11000`), replicated
 * here so `InMemoryBudgetRepository` mirrors `MongooseBudgetRepository`'s
 * observable failure for the unique compound index (design D9) — the PR3
 * HTTP controller's `isDuplicateKeyError` guard checks `error.code === 11000`
 * regardless of which adapter threw it.
 */
class DuplicateKeyError extends Error {
    readonly code = 11000;

    constructor() {
        super('E11000 duplicate key error: Category/Month/Year must be unique');
    }
}

/**
 * Map-backed fake used by use-case tests and one side of the shared
 * `BudgetRepository.contract.test.ts`. `update` merges the patch directly
 * onto the stored record WITHOUT reconstructing through
 * `Budget.rehydrate`/`assertInvariants` — this mirrors what
 * `MongooseBudgetRepository` actually does (`findByIdAndUpdate` with
 * `runValidators:true`, no domain re-validation), matching legacy
 * `budget.service.ts`. `delete` is a REAL hard removal (design D7) — there
 * is no `Archived`/soft-delete analog for budget. `create`/`update` enforce
 * the unique `{Category,Month,Year}` compound key (design D9), throwing a
 * `DuplicateKeyError` (code `11000`) to mirror Mongo's real failure mode.
 *
 * `Category` is ALWAYS stored/echoed as a bare id string here — populate is
 * a Mongoose-specific behavior that cannot be expressed in-memory (design
 * D2's populated-vs-bare dual shape is pinned by the PR3 characterization
 * e2e, not this fake or its contract test).
 */
export class InMemoryBudgetRepository implements BudgetRepository {
    private readonly budgets = new Map<string, StoredBudget>();

    async find(filter: Record<string, unknown>, pagination?: Pagination): Promise<BudgetView[]> {
        let items = Array.from(this.budgets.entries()).filter(([, budget]) => this.matchesFilter(budget, filter));

        if (pagination) {
            items = pagination.limit > 0
                ? items.slice(pagination.skip, pagination.skip + pagination.limit)
                : items.slice(pagination.skip);
        }

        return items.map(([id, budget]) => this.toView(id, budget));
    }

    async findById(id: Identity): Promise<BudgetView | null> {
        const found = this.budgets.get(id.value);

        return found ? this.toView(id.value, found) : null;
    }

    async create(budget: Budget): Promise<BudgetView> {
        const id = Identity.generate();
        const stored: StoredBudget = {
            Category: budget.category,
            Month: budget.month,
            Year: budget.year,
            Limit: budget.limit,
        };

        this.assertUnique(stored, undefined);
        this.budgets.set(id, stored);

        return this.toView(id, stored);
    }

    async update(id: Identity, patch: BudgetPatch): Promise<BudgetView | null> {
        const existing = this.budgets.get(id.value);

        if (!existing) {
            return null;
        }

        if (patch.Month !== undefined && (!Number.isInteger(patch.Month) || patch.Month < 1 || patch.Month > 12)) {
            throw new Error(`Budget.Month must be an integer between 1 and 12, got "${String(patch.Month)}"`);
        }
        if (patch.Limit !== undefined && (typeof patch.Limit !== 'number' || patch.Limit < 0)) {
            throw new Error('Budget.Limit must be a number >= 0');
        }

        const merged: StoredBudget = {
            Category: patch.Category ?? existing.Category,
            Month: patch.Month ?? existing.Month,
            Year: patch.Year ?? existing.Year,
            Limit: patch.Limit ?? existing.Limit,
        };

        this.assertUnique(merged, id.value);
        this.budgets.set(id.value, merged);

        return this.toView(id.value, merged);
    }

    async delete(id: Identity): Promise<BudgetView | null> {
        const existing = this.budgets.get(id.value);

        if (!existing) {
            return null;
        }

        this.budgets.delete(id.value);

        return this.toView(id.value, existing);
    }

    private assertUnique(candidate: StoredBudget, excludeId: string | undefined): void {
        const collision = Array.from(this.budgets.entries()).some(
            ([id, budget]) =>
                id !== excludeId &&
                budget.Category === candidate.Category &&
                budget.Month === candidate.Month &&
                budget.Year === candidate.Year,
        );

        if (collision) {
            throw new DuplicateKeyError();
        }
    }

    private toView(id: string, budget: StoredBudget): BudgetView {
        return {
            _id: id,
            Category: budget.Category,
            Month: budget.Month,
            Year: budget.Year,
            Limit: budget.Limit,
        };
    }

    private matchesFilter(budget: StoredBudget, filter: Record<string, unknown>): boolean {
        return Object.entries(filter).every(([field, value]) => {
            switch (field) {
                case 'Category':
                    return budget.Category === value;
                case 'Month':
                    return budget.Month === value;
                case 'Year':
                    return budget.Year === value;
                case 'Limit':
                    return budget.Limit === value;
                default:
                    return true;
            }
        });
    }
}
