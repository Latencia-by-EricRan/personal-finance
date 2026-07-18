/**
 * report-local, READ-ONLY outbound port confining report's `movement`
 * cross-context coupling (design D13, mirrors budget/account's own
 * `MovementGateway` precedent — own file, own shape). Two query shapes
 * mirror the two distinct legacy `report.service.ts` queries:
 * `findEgresoWithRefs` backs `byCategory` (Category kept as a bare ref, NOT
 * populated — the join happens at the use-case level via `CategoryGateway`,
 * per design D13), and `findByDateRange` backs `monthly`/`cashflow`
 * (Type-only aggregation, no Category needed).
 */
export interface EgresoWithCategoryRefRow {
    Amount: number;
    Category: string | null;
}

export interface MovementTypeAmountRow {
    Type: 'ingreso' | 'egreso';
    Amount: number;
}

export interface MovementGateway {
    findEgresoWithRefs(gteDate: Date, lteDate: Date): Promise<EgresoWithCategoryRefRow[]>;
    findByDateRange(gteDate: Date, lteDate: Date): Promise<MovementTypeAmountRow[]>;
}
