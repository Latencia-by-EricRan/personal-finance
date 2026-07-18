import { GetReportByCategory } from './GetReportByCategory';
import { GetReportCashflow } from './GetReportCashflow';
import { GetReportMonthly } from './GetReportMonthly';

/**
 * Aggregate of report use cases, to be wired by the composition root in
 * PR2b (`container.report`) and consumed by the HTTP inbound adapter.
 * Neither side depends on the other's construction details — the
 * composition root will build this shape from `MongooseMovementGateway` +
 * `MongooseCategoryGateway` (report-local, this PR), the HTTP adapter only
 * calls `.execute(...)` on each use case. Mirrors `BudgetUseCases`/
 * `RecurringUseCases` 1:1, minus a repository (report has no domain/owned
 * aggregate, design D13). PR2a leaves this unwired; PR2b wires it into
 * `composition-root.ts`/`_routes.ts`.
 */
export interface ReportUseCases {
    getReportByCategory: GetReportByCategory;
    getReportMonthly: GetReportMonthly;
    getReportCashflow: GetReportCashflow;
}
