/**
 * Minimal read row `GetBudgetStatus`'s `Spent` reduce needs — exactly the
 * one field legacy `budget.service.ts#getStatus` touches
 * (`movements.reduce((acc, movement) => acc + movement.Amount, 0)`), nothing
 * else (design D5).
 */
export interface EgresoMovementRow {
    Amount: number;
}

/**
 * Budget-local, READ-ONLY outbound port confining `budget`'s sole
 * cross-context coupling to `movement` (spec's "MovementGateway seam"
 * requirement). Deliberately a SEPARATE interface from account's own
 * `MovementGateway` (own file, own shape) — budget only ever reads egreso
 * movements for a category/date-window; there is no write/rollback leg here
 * (unlike account's transfer flow), so this port has exactly one method.
 *
 * Only `MongooseMovementGateway` (infrastructure) implements this against
 * real movement persistence; every other `budget` file only ever sees this
 * interface.
 */
export interface MovementGateway {
    findEgresoAmounts(categoryId: string, gteDate: Date, lteDate: Date): Promise<EgresoMovementRow[]>;
}
