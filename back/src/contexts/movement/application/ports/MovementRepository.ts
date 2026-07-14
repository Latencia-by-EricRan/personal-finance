import { Identity } from '../../../../shared/domain/Identity';
import { CategoryView } from '../../../category';
import { Movement, MovementProps, MovementType } from '../../domain/Movement';

/**
 * Application-layer pagination shape, deliberately NOT imported from
 * `src/utils/controller.util.ts` (which pulls in `express.Request`) to keep
 * the application layer framework-free — same "driver-free port" principle
 * `category` established.
 */
export interface Pagination {
    limit: number;
    skip: number;
}

/**
 * Read-model shape returned by every port method (design D1). The domain
 * `Movement` aggregate guards the WRITE side only; reads echo a
 * persistence-faithful view so `GET /movement/month` and
 * `/movement/summary/:month/:year` keep serving a POPULATED `Category`
 * sub-object exactly like the legacy `.populate('Category')` response.
 * `Category` is `(CategoryView & {_id: string}) | string` because write
 * echoes (create/update/saveMany) are unpopulated (bare id string), while
 * `find` after `.populate('Category')` returns the populated shape.
 */
export interface MovementView {
    _id: string;
    Type: MovementType;
    Amount: number;
    Date: Date;
    Category?: (CategoryView & { _id: string }) | string;
    Account: string;
    TransferId?: string;
    Card?: string;
    Description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Partial patch accepted by `UpdateMovement` (design D2). `PUT /movement/:id`
 * is genuinely partial (the validator makes Type/Amount/Category/Account
 * optional on update), so this bypasses the full-invariant `Movement`
 * aggregate on purpose — forwarded straight to `repository.update`.
 */
export type MovementPatch = Partial<MovementProps>;

/**
 * Bespoke port for `movement` (not the generic `Repository<T, Id>`) —
 * mirrors `movement.service.ts`'s real current methods 1:1 (find/create/
 * update/remove/saveMany), same shape category established for its own
 * repository port.
 */
export interface MovementRepository {
    find(filter: Record<string, unknown>, select?: string, pagination?: Pagination): Promise<MovementView[]>;
    create(movement: Movement): Promise<MovementView>;
    update(id: Identity, patch: MovementPatch): Promise<MovementView | null>;
    remove(id: Identity): Promise<MovementView | null>;
    saveMany(movements: Movement[]): Promise<MovementView[]>;
}
