import { Identity } from '../../../../shared/domain/Identity';
import { Budget, BudgetProps } from '../../domain/Budget';

/**
 * Application-layer pagination shape, deliberately NOT imported from
 * `src/utils/controller.util.ts` (which pulls in `express.Request`) to keep
 * the application layer framework-free — same "driver-free port" principle
 * `account`/`category`/`movement` established.
 */
export interface Pagination {
    limit: number;
    skip: number;
}

/**
 * Read-model shape returned by every port method (design D2/D3, the crux of
 * this migration). The domain `Budget` aggregate guards WRITE invariants
 * only; reads echo a persistence-faithful view carrying `createdAt`/
 * `updatedAt` because `BudgetModel` has `timestamps:true`.
 *
 * `Category` is deliberately typed `unknown` and echoed VERBATIM: on
 * `find`/`findById` it is the FULL populated Category sub-document
 * (`.populate('Category')` — legacy `budget.service.ts:20,30`); on
 * `create`/`update` it is the bare Category id string (create/update do NOT
 * populate — legacy `budget.service.ts:35,38`). Narrowing this type would
 * hide that dual shape, which is the exact behavior the PR3 characterization
 * e2e pins.
 */
export interface BudgetView {
    _id: string;
    Category: unknown;
    Month: number;
    Year: number;
    Limit: number;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Partial patch accepted by `UpdateBudget` (design D3). `PUT /budget/:id` is
 * genuinely partial (all fields optional on update), so this bypasses the
 * full-invariant `Budget` aggregate on purpose — forwarded straight to
 * `repository.update`.
 */
export type BudgetPatch = Partial<BudgetProps>;

/**
 * Bespoke port for `budget` (not the generic `Repository<T, Id>`) — mirrors
 * `budget.service.ts`'s real current methods 1:1
 * (find/findById/create/update/delete), same shape account/category/movement
 * established for their own repository ports. `delete` is a REAL hard
 * delete (design D7) — budget has no `Archived`/soft-delete analog.
 */
export interface BudgetRepository {
    find(filter: Record<string, unknown>, pagination?: Pagination): Promise<BudgetView[]>;
    findById(id: Identity): Promise<BudgetView | null>;
    create(budget: Budget): Promise<BudgetView>;
    update(id: Identity, patch: BudgetPatch): Promise<BudgetView | null>;
    delete(id: Identity): Promise<BudgetView | null>;
}
