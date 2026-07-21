import { MovementModel, MovementType } from '../../movement';
import {
    CreateRecurringMovementInput,
    CreatedMovementView,
    MovementGateway,
} from '../application/ports/MovementGateway';

/**
 * Real adapter and the SOLE recurring-side file importing movement
 * persistence types (spec's "MovementGateway seam" requirement) — imported
 * ONLY from movement's public barrel (`contexts/movement/index.ts`), never
 * from `contexts/movement/infrastructure/*` directly. Mirrors legacy
 * `recurring.service.ts#run`'s `MovementModel.create({Type, Amount,
 * Category, Account, Description, Card, Date})` call exactly.
 */
export class MongooseMovementGateway implements MovementGateway {
    async createMovement(input: CreateRecurringMovementInput): Promise<CreatedMovementView> {
        const created = await MovementModel.create({
            Type: input.Type as unknown as MovementType,
            Amount: input.Amount,
            Category: input.Category,
            Account: input.Account,
            Description: input.Description,
            Card: input.Card,
            Date: input.Date,
        });
        const document = created.toObject();

        return {
            _id: String(document._id),
            Type: document.Type as unknown as CreatedMovementView['Type'],
            Amount: document.Amount,
            Category: document.Category ? String(document.Category) : undefined,
            Account: String(document.Account),
            Description: document.Description,
            Card: document.Card,
            Date: document.Date,
            createdAt: (document as unknown as { createdAt?: Date }).createdAt,
            updatedAt: (document as unknown as { updatedAt?: Date }).updatedAt,
        };
    }
}
