import { Types } from 'mongoose';
import { Identity } from '../../../shared/domain/Identity';
import { CategoryView } from '../../category';
import { Movement } from '../domain/Movement';
import { MovementView } from '../application/ports/MovementRepository';
import { MovementDocument } from './MovementModel';

/**
 * Raw sub-document shape produced by `.populate('Category')`. Structurally
 * identical to `CategoryDocument`/`CategoryView` plus a real ObjectId `_id`
 * (populate always resolves the referenced document's id).
 */
interface RawCategoryRow extends CategoryView {
    _id: Types.ObjectId | string;
}

/**
 * Loosely-typed lean read row `MongooseMovementRepository` passes to
 * `toView` after `.find(...).populate('Category').lean()`, `.create(...)`, or
 * `.findByIdAndUpdate(...)`/`.findByIdAndDelete(...)`. `Category` is either
 * absent, a bare `ObjectId`/string (unpopulated write echo), or the
 * populated sub-document (`find` reads) — mirrors design D1.
 */
export interface MovementReadRow {
    _id: Types.ObjectId | string;
    Type: MovementDocument['Type'];
    Amount: number;
    Date: Date;
    Category?: Types.ObjectId | string | RawCategoryRow;
    Account: Types.ObjectId | string;
    TransferId?: string;
    Description?: string;
    Card?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Standalone mapper (design D-Mapper deviation from category's
 * `implements Mapper<Domain,Persistence>`): `MovementDocument` (aliased by
 * the `movement.interface.ts` shim as `MovementI`) has NO `_id` field, so
 * `toDomain` cannot recover the id from the document alone and takes it
 * explicitly. Reads are served by `toView` (design D1), not `toDomain` —
 * `toDomain` exists only for `InMemoryMovementRepository`/contract tests.
 */
export class MovementMapper {
    toPersistence(entity: Movement): MovementDocument {
        return {
            Type: entity.type,
            Amount: entity.amount,
            Date: entity.date,
            Category: entity.category ? new Types.ObjectId(entity.category) : undefined,
            Account: new Types.ObjectId(entity.account),
            Description: entity.description,
            Card: entity.card,
        };
    }

    toDomain(id: Identity, raw: MovementDocument): Movement {
        return Movement.rehydrate(id, {
            Type: raw.Type,
            Amount: raw.Amount,
            Date: raw.Date,
            Account: String(raw.Account),
            Category: raw.Category ? String(raw.Category) : undefined,
            Description: raw.Description,
            Card: raw.Card,
        });
    }

    toView(row: MovementReadRow): MovementView {
        return {
            _id: String(row._id),
            Type: row.Type,
            Amount: row.Amount,
            Date: row.Date,
            Category: this.mapCategory(row.Category),
            Account: String(row.Account),
            TransferId: row.TransferId,
            Card: row.Card,
            Description: row.Description,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }

    private mapCategory(category: MovementReadRow['Category']): MovementView['Category'] {
        if (category === undefined || category === null) {
            return undefined;
        }

        if (category instanceof Types.ObjectId) {
            return category.toString();
        }

        if (typeof category === 'string') {
            return category;
        }

        return {
            _id: String(category._id),
            Description: category.Description,
            Name: category.Name,
            Tag: category.Tag,
            Type: category.Type,
            Icon: category.Icon,
        };
    }
}
