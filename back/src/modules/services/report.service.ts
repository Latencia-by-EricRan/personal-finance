import { Types } from 'mongoose';
import MovementModel from '../models/Movement.model';
import { TypeMovement } from '../interfaces/movement.interface';
import { CategoryI } from '../interfaces/category.interface';

type ReportFilter = Record<string, unknown>;

type PopulatedCategory = CategoryI & { _id: Types.ObjectId };

interface CategoryReport {
    Category: PopulatedCategory;
    Total: number;
}

interface MonthlyReport {
    Month: number;
    Income: number;
    Expense: number;
    Net: number;
}

interface CashflowReport {
    Month: number;
    Year: number;
    Income: number;
    Expense: number;
    Net: number;
}

const monthDateRange = (month: number, year: number): { $gte: Date; $lte: Date } => ({
    $gte: new Date(year, month - 1, 0),
    $lte: new Date(year, month, 0),
});

export default class ReportService {

    static async byCategory(month: number, year: number): Promise<CategoryReport[]> {
        const filter: ReportFilter = {
            Type: TypeMovement.EGRESO,
            Date: monthDateRange(month, year),
        };

        const movements = await MovementModel.find(filter).populate('Category');

        const totals = new Map<string, CategoryReport>();
        movements.forEach((movement) => {
            const category = movement.Category as unknown as PopulatedCategory | null;
            if (!category) {
                return;
            }
            const key = category._id.toString();
            const existing = totals.get(key);
            if (existing) {
                existing.Total += movement.Amount;
            } else {
                totals.set(key, { Category: category, Total: movement.Amount });
            }
        });

        return Array.from(totals.values());
    }

    static async monthly(year: number): Promise<MonthlyReport[]> {
        const months: MonthlyReport[] = [];

        for (let month = 1; month <= 12; month++) {
            const filter: ReportFilter = { Date: monthDateRange(month, year) };
            const movements = await MovementModel.find(filter);

            const fnAccAmount = (acc: number, movement: { Amount: number }) => acc + movement.Amount;
            const Income = movements.filter((movement) => movement.Type === TypeMovement.INGRESO).reduce(fnAccAmount, 0);
            const Expense = movements.filter((movement) => movement.Type === TypeMovement.EGRESO).reduce(fnAccAmount, 0);

            months.push({ Month: month, Income, Expense, Net: Income - Expense });
        }

        return months;
    }

    static async cashflow(month: number, year: number): Promise<CashflowReport> {
        const filter: ReportFilter = { Date: monthDateRange(month, year) };
        const movements = await MovementModel.find(filter);

        const fnAccAmount = (acc: number, movement: { Amount: number }) => acc + movement.Amount;
        const Income = movements.filter((movement) => movement.Type === TypeMovement.INGRESO).reduce(fnAccAmount, 0);
        const Expense = movements.filter((movement) => movement.Type === TypeMovement.EGRESO).reduce(fnAccAmount, 0);

        return { Month: month, Year: year, Income, Expense, Net: Income - Expense };
    }

}
