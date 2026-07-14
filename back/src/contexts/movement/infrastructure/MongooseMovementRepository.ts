import { Identity } from '../../../shared/domain/Identity';
import { Movement } from '../domain/Movement';
import { MovementPatch, MovementRepository, MovementView, Pagination } from '../application/ports/MovementRepository';
import { MovementMapper, MovementReadRow } from './MovementMapper';
import MovementModel from './MovementModel';

/**
 * Real adapter. The ONLY place in the codebase aware of Mongoose read rows —
 * `find` chains `.populate('Category').select(select ?? '')` +
 * optional `.skip/.limit`, then `.lean()`, mapping each row through
 * `MovementMapper.toView` (design D1).
 */
export class MongooseMovementRepository implements MovementRepository {
    private readonly mapper = new MovementMapper();

    async find(filter: Record<string, unknown>, select?: string, pagination?: Pagination): Promise<MovementView[]> {
        const query = MovementModel.find(filter).populate('Category').select(select ?? '');

        if (pagination) {
            query.skip(pagination.skip).limit(pagination.limit);
        }

        const rows = await query.lean();

        return rows.map((row) => this.mapper.toView(row as unknown as MovementReadRow));
    }

    async create(movement: Movement): Promise<MovementView> {
        const document = this.mapper.toPersistence(movement);
        const created = await MovementModel.create(document);

        return this.mapper.toView(created.toObject() as unknown as MovementReadRow);
    }

    async update(id: Identity, patch: MovementPatch): Promise<MovementView | null> {
        const updated = await MovementModel.findByIdAndUpdate(id.toObjectId(), patch, {
            new: true,
            runValidators: true,
        }).lean();

        return updated ? this.mapper.toView(updated as unknown as MovementReadRow) : null;
    }

    async remove(id: Identity): Promise<MovementView | null> {
        const removed = await MovementModel.findByIdAndDelete(id.toObjectId()).lean();

        return removed ? this.mapper.toView(removed as unknown as MovementReadRow) : null;
    }

    async saveMany(movements: Movement[]): Promise<MovementView[]> {
        const documents = movements.map((movement) => this.mapper.toPersistence(movement));
        const created = await MovementModel.insertMany(documents);

        return created.map((document) => this.mapper.toView(document.toObject() as unknown as MovementReadRow));
    }
}
