import { MovementGateway } from './ports/MovementGateway';
import { monthDateRange } from './monthDateRange';

export interface MonthlyReport {
    Month: number;
    Income: number;
    Expense: number;
    Net: number;
}

/**
 * Verbatim port of legacy `report.service.ts#monthly` — movement-only, no
 * `CategoryGateway` involvement (design D13).
 */
export class GetReportMonthly {
    constructor(private readonly movementGateway: MovementGateway) {}

    async execute(year: number): Promise<MonthlyReport[]> {
        const months: MonthlyReport[] = [];

        for (let month = 1; month <= 12; month++) {
            const { gteDate, lteDate } = monthDateRange(month, year);
            const movements = await this.movementGateway.findByDateRange(gteDate, lteDate);

            const sumByType = (type: 'ingreso' | 'egreso'): number =>
                movements.filter((movement) => movement.Type === type).reduce((acc, movement) => acc + movement.Amount, 0);

            const Income = sumByType('ingreso');
            const Expense = sumByType('egreso');

            months.push({ Month: month, Income, Expense, Net: Income - Expense });
        }

        return months;
    }
}
