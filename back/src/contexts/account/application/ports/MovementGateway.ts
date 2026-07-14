/**
 * Local union of the two movement types `account`'s transfer flow writes —
 * deliberately NOT imported from `contexts/movement` (design D5/open-item-3b):
 * this keeps `account/application` and `account/domain` completely
 * movement-free. The values are byte-identical to `MovementType.INGRESO`/
 * `MovementType.EGRESO`'s enum values, so the persisted `Type` is unchanged;
 * only `MongooseMovementGateway` (infrastructure) is allowed to know about
 * movement's real types.
 */
export type TransferMovementType = 'ingreso' | 'egreso';

/**
 * Minimal read row `GetAccountBalance`'s reduce needs — exactly the two
 * fields `account.service.ts#getBalance` touches (`Type`, `Amount`), nothing
 * else (design D5, open-item-3 resolution).
 */
export interface AccountMovementRow {
    Type: TransferMovementType;
    Amount: number;
}

/**
 * Input for one leg of a transfer. `TransferId` is generated once by the
 * `Transfer` use case (design D6 — `Identity.generate()`) and passed
 * identically into both legs; it is written as a raw document field because
 * `TransferId` is structurally excluded from `MovementProps` (see
 * `contexts/movement/domain/Movement.ts`).
 */
export interface CreateTransferMovementInput {
    Type: TransferMovementType;
    Account: string;
    Amount: number;
    Date: Date;
    Description?: string;
    TransferId: string;
}

/**
 * Echo of a raw persisted transfer-movement document — the exact field set
 * the legacy `AccountService.transfer` response serializes (design D5,
 * open-item-3 resolution).
 */
export interface TransferMovementView {
    _id: string;
    Type: TransferMovementType;
    Amount: number;
    Date: Date;
    Account: string;
    Description?: string;
    Card?: string;
    TransferId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Outbound port confining ALL of `account`'s persistence-level coupling to
 * `movement` (spec's "MovementGateway seam" requirement). Only
 * `MongooseMovementGateway` (infrastructure) implements this against real
 * movement persistence; every other `account` file only ever sees this
 * interface.
 */
export interface MovementGateway {
    findByAccount(accountId: string): Promise<AccountMovementRow[]>;
    createTransferMovement(input: CreateTransferMovementInput): Promise<TransferMovementView>;
    deleteMovement(id: string): Promise<void>;
}
