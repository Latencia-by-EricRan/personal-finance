import { HydratedDocument } from 'mongoose';
import BudgetModel from '../models/Budget.model';
import MovementModel from '../models/Movement.model';
import { BudgetI } from '../interfaces/budget.interface';
import { Pagination } from '../../utils/controller.util';

type BudgetFilter = Record<string, unknown>;

interface BudgetStatus {
    Category: BudgetI['Category'];
    Limit: number;
    Spent: number;
    Remaining: number;
    Percent: number;
}

export default class BudgetService {

    static async find(filter: BudgetFilter, pagination?: Pagination): Promise<HydratedDocument<BudgetI>[]> {
        const query = BudgetModel.find(filter).populate('Category');

        if (pagination) {
            query.skip(pagination.skip).limit(pagination.limit);
        }

        return query;
    }

    static async findById(id: string): Promise<HydratedDocument<BudgetI> | null> {
        return BudgetModel.findById(id).populate('Category');
    }

    static async create(data: BudgetI): Promise<BudgetI> {
        return BudgetModel.create(data);
    }

    static async update(id: string, data: BudgetI): Promise<BudgetI | null> {
        return BudgetModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    static async delete(id: string): Promise<BudgetI | null> {
        return BudgetModel.findByIdAndDelete(id);
    }

    static async getStatus(month: number, year: number): Promise<BudgetStatus[]> {
        const budgets = await BudgetModel.find({ Month: month, Year: year }).populate('Category');

        const gteDate = new Date(year, month - 1, 0);
        const lteDate = new Date(year, month, 0);

        return Promise.all(budgets.map(async (budget) => {
            const movementFilter: BudgetFilter = {
                Type: 'egreso',
                Category: budget.Category,
                Date: { $gte: gteDate, $lte: lteDate },
            };
            const movements = await MovementModel.find(movementFilter);

            const Spent = movements.reduce((acc, movement) => acc + movement.Amount, 0);
            const Percent = budget.Limit > 0 ? (Spent / budget.Limit) * 100 : 0;

            return {
                Category: budget.Category,
                Limit: budget.Limit,
                Spent,
                Remaining: budget.Limit - Spent,
                Percent,
            };
        }));
    }

}
