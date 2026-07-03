import { HydratedDocument } from 'mongoose';
import MovementModel from '../models/Movement.model';
import { MovementI } from '../interfaces/movement.interface';
import { Pagination } from '../../utils/controller.util';

type MovementFilter = Record<string, unknown>;

export default class MovementService {

    static async find(filter?: MovementFilter, select?: string, pagination?: Pagination): Promise<HydratedDocument<MovementI>[]> {
        const query = MovementModel.find(filter ?? {})
            .populate('Category')
            .select(select ?? '');

        if (pagination) {
            query.skip(pagination.skip).limit(pagination.limit);
        }

        return query;
    }

    static async create(movement: MovementI): Promise<MovementI> {
        return MovementModel.create(movement);
    }

    static async update(id: string, movement: MovementI): Promise<MovementI | null> {
        return MovementModel.findByIdAndUpdate(id, movement, { new: true, runValidators: true });
    }

    static async remove(id: string): Promise<MovementI | null> {
        return MovementModel.findByIdAndDelete(id);
    }

    static async saveMany(movements: MovementI[]): Promise<MovementI[]> {
        return MovementModel.insertMany(movements);
    }

}
