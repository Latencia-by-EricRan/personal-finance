import { MovementModel, MovementType } from '../../movement';
import { EgresoWithCategoryRefRow, MovementGateway, MovementTypeAmountRow } from '../application/ports/MovementGateway';

/**
 * Real adapter and the SOLE report-side file importing movement persistence
 * (design D13's "gateways read via each context's public barrel" rule) —
 * `MovementModel` imported ONLY from movement's public barrel
 * (`contexts/movement/index.ts`), never from `contexts/movement/infrastructure/*`
 * directly.
 *
 * `findEgresoWithRefs` is copied verbatim (query shape) from legacy
 * `report.service.ts#byCategory`, MINUS `.populate('Category')` — the raw
 * Category ref is returned as a bare id string (or `null` when unset), and
 * resolving that ref against live category data is `GetReportByCategory`'s
 * job via `CategoryGateway` (design D13).
 */
export class MongooseMovementGateway implements MovementGateway {
    async findEgresoWithRefs(gteDate: Date, lteDate: Date): Promise<EgresoWithCategoryRefRow[]> {
        const rows = await MovementModel.find({
            Type: MovementType.EGRESO,
            Date: { $gte: gteDate, $lte: lteDate },
        }).lean();

        return rows.map((row) => ({
            Amount: row.Amount,
            Category: row.Category ? String(row.Category) : null,
        }));
    }

    async findByDateRange(gteDate: Date, lteDate: Date): Promise<MovementTypeAmountRow[]> {
        const rows = await MovementModel.find({
            Date: { $gte: gteDate, $lte: lteDate },
        }).lean();

        return rows.map((row) => ({ Type: row.Type, Amount: row.Amount }));
    }
}
