/**
 * Local union of the two movement types `recurring`'s `run()` writes —
 * deliberately NOT imported from `contexts/movement` (mirrors `account`'s
 * `TransferMovementType` precedent, design D12): this keeps
 * `recurring/application` and `recurring/domain` completely movement-free.
 * The values are byte-identical to `MovementType.INGRESO`/
 * `MovementType.EGRESO`'s enum values, so the persisted `Type` is unchanged;
 * only `MongooseMovementGateway` (infrastructure) is allowed to know about
 * movement's real types.
 */
export type RecurringMovementType = 'ingreso' | 'egreso';

/**
 * Input for the single Movement `run()` materializes per due recurring —
 * exactly the fields legacy `recurring.service.ts#run` passes to
 * `MovementModel.create(...)` (`Type`, `Amount`, `Category`, `Account`,
 * `Description`, `Card`, `Date`).
 */
export interface CreateRecurringMovementInput {
    Type: RecurringMovementType;
    Amount: number;
    Category: string;
    Account: string;
    Description?: string;
    Card?: string;
    Date: Date;
}

/**
 * Echo of a raw persisted recurring-generated movement document — the exact
 * field set legacy `recurring.service.ts#run`'s returned `MovementI[]`
 * carries.
 */
export interface CreatedMovementView {
    _id: string;
    Type: RecurringMovementType;
    Amount: number;
    Category?: string;
    Account: string;
    Description?: string;
    Card?: string;
    Date: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Recurring-local, WRITE outbound port confining `recurring`'s sole
 * cross-context coupling to `movement` (spec's "MovementGateway seam"
 * requirement, design D12 — account's read+write precedent, not budget's
 * read-only one). Only `MongooseMovementGateway` (infrastructure) implements
 * this against real movement persistence, importing ONLY movement's public
 * barrel (`contexts/movement/index.ts`), never `infrastructure/*` directly.
 */
export interface MovementGateway {
    createMovement(input: CreateRecurringMovementInput): Promise<CreatedMovementView>;
}
