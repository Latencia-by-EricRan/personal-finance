import mongoose from 'mongoose';
import AccountModel from '../models/Account.model';
import MovementModel from '../models/Movement.model';
import { AccountI } from '../interfaces/account.interface';
import { MovementI, TypeMovement } from '../interfaces/movement.interface';
import { Pagination } from '../../utils/controller.util';
import { ServiceError } from '../../utils/service-error.util';

type AccountFilter = Record<string, unknown>;

interface TransferInput {
    From: string;
    To: string;
    Amount: number;
    Date: Date;
    Description?: string;
}

export default class AccountService {

    static async find(filter: AccountFilter, pagination?: Pagination): Promise<AccountI[]> {
        const query = AccountModel.find(filter);

        if (pagination) {
            query.skip(pagination.skip).limit(pagination.limit);
        }

        return query;
    }

    static async findById(id: string): Promise<AccountI | null> {
        return AccountModel.findById(id);
    }

    static async create(data: AccountI): Promise<AccountI> {
        return AccountModel.create(data);
    }

    static async update(id: string, data: AccountI): Promise<AccountI | null> {
        return AccountModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    static async archive(id: string): Promise<AccountI | null> {
        return AccountModel.findByIdAndUpdate(id, { Archived: true }, { new: true });
    }

    static async getBalance(accountId: string): Promise<number> {
        const movements = await MovementModel.find({ Account: accountId });

        return movements.reduce((acc, movement) => (
            movement.Type === TypeMovement.INGRESO ? acc + movement.Amount : acc - movement.Amount
        ), 0);
    }

    static async transfer(data: TransferInput): Promise<MovementI[]> {
        const { From, To, Amount, Date: date, Description } = data;

        if (From === To) {
            throw new ServiceError('From and To accounts must be different', 400);
        }
        if (!(Amount > 0)) {
            throw new ServiceError('Amount must be greater than 0', 400);
        }

        const [fromAccount, toAccount] = await Promise.all([
            AccountModel.findById(From),
            AccountModel.findById(To),
        ]);
        if (!fromAccount) {
            throw new ServiceError('From account not found', 404);
        }
        if (!toAccount) {
            throw new ServiceError('To account not found', 404);
        }
        if ((fromAccount as AccountI).Archived) {
            throw new ServiceError('From account is archived', 400);
        }
        if ((toAccount as AccountI).Archived) {
            throw new ServiceError('To account is archived', 400);
        }

        const TransferId = new mongoose.Types.ObjectId().toString();

        const egresoMovement = await MovementModel.create({
            Type: TypeMovement.EGRESO,
            Account: From,
            Amount,
            Date: date,
            Description,
            TransferId,
        });

        try {
            const ingresoMovement = await MovementModel.create({
                Type: TypeMovement.INGRESO,
                Account: To,
                Amount,
                Date: date,
                Description,
                TransferId,
            });

            return [egresoMovement, ingresoMovement];
        } catch (error: unknown) {
            try {
                await MovementModel.findByIdAndDelete((egresoMovement as { _id: unknown })._id);
            } catch (rollbackError: unknown) {
                console.error(
                    `AccountService.transfer: compensating rollback failed for orphaned movement ${(egresoMovement as { _id: unknown })._id as string} (TransferId: ${TransferId})`,
                    rollbackError,
                );
            }
            throw error;
        }
    }

}
