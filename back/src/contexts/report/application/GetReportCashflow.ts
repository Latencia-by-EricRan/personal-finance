import { MovementGateway } from './ports/MovementGateway';
import { monthDateRange } from './monthDateRange';

export interface CashflowReport {
    Month: number;
    Year: number;
    Income: number;
    Expense: number;
    Net: number;
}

/**
 * Verbatim port of legacy `report.service.ts#cashflow` — movement-only, no
 * `CategoryGateway` involvement (design D13).
 */
export class GetReportCashflow {
    constructor(private readonly movementGateway: MovementGateway) {}

    async execute(month: number, year: number): Promise<CashflowReport> {
        const { gteDate, lteDate } = monthDateRange(month, year);
        const movements = await this.movementGateway.findByDateRange(gteDate, lteDate);

        const sumByType = (type: 'ingreso' | 'egreso'): number =>
            movements.filter((movement) => movement.Type === type).reduce((acc, movement) => acc + movement.Amount, 0);

        const Income = sumByType('ingreso');
        const Expense = sumByType('egreso');

        return { Month: month, Year: year, Income, Expense, Net: Income - Expense };
    }
}
