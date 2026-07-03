import { BulkWriteResult } from 'mongodb';
import CategoryModel from '../models/Category.model';
import { CategoryI } from '../interfaces/category.interface';
import { Pagination } from '../../utils/controller.util';

type CategoryFilter = Record<string, unknown>;

export default class CategoryService {

    static async save(data: CategoryI | CategoryI[]): Promise<CategoryI | null | BulkWriteResult> {
        if (Array.isArray(data)) {
            return this.manySave(data);
        }

        const filter = data.Tag ? { Tag: data.Tag } : { Name: data.Name };
        return CategoryModel.findOneAndUpdate(
            filter,
            data,
            { upsert: true, new: true }
        );
    }

    static async find(filter: CategoryFilter, pagination?: Pagination): Promise<CategoryI[]> {
        const query = CategoryModel.find(filter);

        if (pagination) {
            query.skip(pagination.skip).limit(pagination.limit);
        }

        return query;
    }

    static async findById(id: string): Promise<CategoryI | null> {
        return CategoryModel.findById(id);
    }

    static async delete(id: string): Promise<CategoryI | null> {
        return CategoryModel.findByIdAndDelete(id);
    }

    static async manySave(data: CategoryI[]): Promise<BulkWriteResult> {
        const operations = data.map((item) => ({
            updateOne: {
                filter: item.Tag ? { Tag: item.Tag } : { Name: item.Name },
                update: { $set: item },
                upsert: true,
            },
        }));
        return CategoryModel.bulkWrite(operations);
    }

}
