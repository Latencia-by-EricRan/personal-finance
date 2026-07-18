export interface MonthDateRange {
    gteDate: Date;
    lteDate: Date;
}

/**
 * Verbatim port of legacy `report.service.ts`'s inline `monthDateRange`
 * helper — the same character-for-character `new Date(year, month-1, 0)` /
 * `new Date(year, month, 0)` construction used by `budget`'s own
 * `GetBudgetStatus` (design D6 there notes it is copied, not reinterpreted).
 * Extracted as a pure function so `GetReportByCategory`/`GetReportMonthly`/
 * `GetReportCashflow` share one implementation instead of repeating it 3x.
 */
export const monthDateRange = (month: number, year: number): MonthDateRange => ({
    gteDate: new Date(year, month - 1, 0),
    lteDate: new Date(year, month, 0),
});
