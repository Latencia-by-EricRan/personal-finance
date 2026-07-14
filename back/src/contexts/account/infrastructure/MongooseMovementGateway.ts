import { MovementModel, MovementType } from '../../movement';
import {
    AccountMovementRow,
    CreateTransferMovementInput,
    MovementGateway,
    TransferMovementView,
} from '../application/ports/MovementGateway';

/**
 * Real adapter and the SOLE account-side file importing movement persistence
 * types (spec's "MovementGateway seam" requirement) — imported ONLY from
 * movement's public barrel (`contexts/movement/index.ts`), never from
 * `contexts/movement/infrastructure/*` directly.
 *
 * Writes raw `MovementModel` documents (bypassing the `Movement` domain
 * aggregate) because `TransferId` is structurally excluded from
 * `MovementProps` — exactly what `AccountService.transfer` does today. This
 * intentionally does NOT add any new invariant beyond what `MovementModel`'s
 * own schema (`validateBeforeSave:true`) already enforces (design open-item-5:
 * adding one would be a behavior change, not a safety gain).
 */
export class MongooseMovementGateway implements MovementGateway {
    async findByAccount(accountId: string): Promise<AccountMovementRow[]> {
        const rows = await MovementModel.find({ Account: accountId }).lean();

        return rows.map((row) => ({
            Type: row.Type as unknown as AccountMovementRow['Type'],
            Amount: row.Amount,
        }));
    }

    async createTransferMovement(input: CreateTransferMovementInput): Promise<TransferMovementView> {
        const created = await MovementModel.create({
            Type: input.Type as unknown as MovementType,
            Account: input.Account,
            Amount: input.Amount,
            Date: input.Date,
            Description: input.Description,
            TransferId: input.TransferId,
        });
        const document = created.toObject();

        return {
            _id: String(document._id),
            Type: document.Type as unknown as TransferMovementView['Type'],
            Amount: document.Amount,
            Date: document.Date,
            Account: String(document.Account),
            Description: document.Description,
            Card: document.Card,
            TransferId: document.TransferId,
            createdAt: (document as unknown as { createdAt?: Date }).createdAt,
            updatedAt: (document as unknown as { updatedAt?: Date }).updatedAt,
        };
    }

    async deleteMovement(id: string): Promise<void> {
        await MovementModel.findByIdAndDelete(id);
    }
}
