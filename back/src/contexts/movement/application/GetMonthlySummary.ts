import { MovementType } from '../domain/Movement';
import { MovementRepository, MovementView } from './ports/MovementRepository';

export interface MonthlySummary {
    items: number;
    amount: {
        income: number;
        expense: number;
    };
}

export interface MonthlySummaryResult {
    summary: MonthlySummary;
    movements: MovementView[];
}

/**
 * Owns the income/expense reduction (design D3) — business logic that used
 * to live in the HTTP controller. Range math is verbatim from the legacy
 * controller (`new Date(year, month-1, 0)` .. `new Date(year, month, 0)`).
 */
export class GetMonthlySummary {
    constructor(private readonly repository: MovementRepository) {}

    async execute(month: number, year: number): Promise<MonthlySummaryResult> {
        const gteDate = new Date(year, month - 1, 0);
        const lteDate = new Date(year, month, 0);

        const movements = await this.repository.find({
            Date: { $gte: gteDate, $lte: lteDate },
        });

        const sumByType = (type: MovementType): number =>
            movements
                .filter((movement) => movement.Type === type)
                .reduce((accumulator, movement) => accumulator + movement.Amount, 0);

        return {
            summary: {
                items: movements.length,
                amount: {
                    income: sumByType(MovementType.INGRESO),
                    expense: sumByType(MovementType.EGRESO),
                },
            },
            movements,
        };
    }
}
