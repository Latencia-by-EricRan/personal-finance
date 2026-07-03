import RecurringModel from '../models/Recurring.model';
import MovementModel from '../models/Movement.model';
import { RecurringI } from '../interfaces/recurring.interface';
import { MovementI } from '../interfaces/movement.interface';
import { Pagination } from '../../utils/controller.util';

type RecurringFilter = Record<string, unknown>;

export default class RecurringService {

    static async find(filter?: RecurringFilter, pagination?: Pagination): Promise<RecurringI[]> {
        const query = RecurringModel.find(filter ?? {});

        if (pagination) {
            query.skip(pagination.skip).limit(pagination.limit);
        }

        return query;
    }

    static async findById(id: string): Promise<RecurringI | null> {
        return RecurringModel.findById(id);
    }

    static async create(data: RecurringI): Promise<RecurringI> {
        return RecurringModel.create(data);
    }

    static async update(id: string, data: RecurringI): Promise<RecurringI | null> {
        return RecurringModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    static async delete(id: string): Promise<RecurringI | null> {
        return RecurringModel.findByIdAndDelete(id);
    }

    static async run(): Promise<MovementI[]> {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 1-indexed current month
        const currentYearMonth = `${year}-${String(month).padStart(2, '0')}`;

        const dueRecurrings = await RecurringModel.find({
            Active: true,
            LastRunYearMonth: { $ne: currentYearMonth },
        });

        const createdMovements: MovementI[] = [];

        for (const recurring of dueRecurrings) {
            if (!recurring.Account) {
                continue;
            }

            const claimed = await RecurringModel.findOneAndUpdate(
                { _id: recurring._id, LastRunYearMonth: { $ne: currentYearMonth } },
                { LastRunYearMonth: currentYearMonth },
            );

            if (!claimed) {
                continue;
            }

            try {
                const daysInMonth = new Date(year, month, 0).getDate();
                const clampedDay = Math.min(recurring.DayOfMonth, daysInMonth);
                const targetDate = new Date(year, month - 1, clampedDay);

                const movement = await MovementModel.create({
                    Type: recurring.Type,
                    Amount: recurring.Amount,
                    Category: recurring.Category,
                    Account: recurring.Account,
                    Description: recurring.Description,
                    Card: recurring.Card,
                    Date: targetDate,
                });

                createdMovements.push(movement);
            } catch (error: unknown) {
                console.error(`RecurringService.run: failed to create Movement for recurring ${String(recurring._id)}`, error);
                continue;
            }
        }

        return createdMovements;
    }

}
