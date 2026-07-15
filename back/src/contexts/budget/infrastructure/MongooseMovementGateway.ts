import { MovementModel, MovementType } from '../../movement';
import { EgresoMovementRow, MovementGateway } from '../application/ports/MovementGateway';

/**
 * Real adapter and the SOLE budget-side file importing movement persistence
 * (spec's "MovementGateway seam" requirement) — `MovementModel` imported
 * ONLY from movement's public barrel (`contexts/movement/index.ts`), never
 * from `contexts/movement/infrastructure/*` directly.
 *
 * Query is copied verbatim from legacy `budget.service.ts#getStatus`
 * (`MovementModel.find({ Type: 'egreso', Category: budget.Category, Date: {
 * $gte, $lte } })`). The literal `'egreso'` is cast to `MovementType` ONLY
 * for TypeScript's strict `FilterQuery` typing (mirrors account's
 * `MongooseMovementGateway` cast) — the persisted/queried value is still the
 * same string, byte-identical to legacy.
 */
export class MongooseMovementGateway implements MovementGateway {
    async findEgresoAmounts(categoryId: string, gteDate: Date, lteDate: Date): Promise<EgresoMovementRow[]> {
        const rows = await MovementModel.find({
            Type: 'egreso' as unknown as MovementType,
            Category: categoryId,
            Date: { $gte: gteDate, $lte: lteDate },
        }).lean();

        return rows.map((row) => ({ Amount: row.Amount }));
    }
}
