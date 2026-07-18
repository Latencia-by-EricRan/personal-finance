import { CategoryGateway, CategoryRefView } from './ports/CategoryGateway';
import { MovementGateway } from './ports/MovementGateway';
import { monthDateRange } from './monthDateRange';

export interface CategoryReport {
    Category: CategoryRefView;
    Total: number;
}

/**
 * Ports legacy `report.service.ts#byCategory`'s `.populate('Category')`
 * cross-context join into two single-purpose gateway reads (design D13):
 * `MovementGateway.findEgresoWithRefs` returns egreso rows carrying a bare
 * Category ref (no populate), and `CategoryGateway.findByIds` resolves those
 * refs. Grouping preserves movement iteration order (first-seen category
 * wins insertion order into the totals Map, mirroring legacy's
 * `Map`-based accumulation) and silently skips any row whose ref does not
 * resolve — either because the field itself was null OR because the
 * referenced category no longer exists (dangling ref) — reproducing
 * legacy's populate-null skip byte-for-byte (design D13).
 */
export class GetReportByCategory {
    constructor(
        private readonly movementGateway: MovementGateway,
        private readonly categoryGateway: CategoryGateway,
    ) {}

    async execute(month: number, year: number): Promise<CategoryReport[]> {
        const { gteDate, lteDate } = monthDateRange(month, year);
        const rows = await this.movementGateway.findEgresoWithRefs(gteDate, lteDate);

        const referencedIds = Array.from(new Set(
            rows
                .map((row) => row.Category)
                .filter((category): category is string => category !== null),
        ));

        const categories = referencedIds.length > 0 ? await this.categoryGateway.findByIds(referencedIds) : [];
        const categoryById = new Map(categories.map((category) => [category._id, category]));

        const totals = new Map<string, CategoryReport>();
        rows.forEach((row) => {
            if (row.Category === null) {
                return;
            }
            const category = categoryById.get(row.Category);
            if (!category) {
                return;
            }
            const existing = totals.get(row.Category);
            if (existing) {
                existing.Total += row.Amount;
            } else {
                totals.set(row.Category, { Category: category, Total: row.Amount });
            }
        });

        return Array.from(totals.values());
    }
}
