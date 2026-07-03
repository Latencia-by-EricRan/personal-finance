import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../models/Category.model', () => ({
    default: {
        findOneAndUpdate: vi.fn(),
        bulkWrite: vi.fn(),
    },
}));

import CategoryModel from '../models/Category.model';
import CategoryService from './category.service';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('CategoryService.save', () => {
    it('upserts a single category via findOneAndUpdate when given an object', async () => {
        const data = { Name: 'Food', Description: 'Groceries', Type: 'variable' as const };
        vi.mocked(CategoryModel.findOneAndUpdate).mockResolvedValue(data as never);

        const result = await CategoryService.save(data);

        expect(CategoryModel.findOneAndUpdate).toHaveBeenCalledWith(
            { Name: 'Food' },
            data,
            { upsert: true, new: true },
        );
        expect(CategoryModel.bulkWrite).not.toHaveBeenCalled();
        expect(result).toBe(data);
    });

    it('delegates to manySave (bulkWrite) when given an array', async () => {
        const data = [
            { Name: 'Food', Description: 'Groceries', Type: 'variable' as const },
            { Name: 'Rent', Description: 'Monthly rent', Type: 'fijo' as const },
        ];
        const bulkResult = { matchedCount: 0, modifiedCount: 0, upsertedCount: 2 };
        vi.mocked(CategoryModel.bulkWrite).mockResolvedValue(bulkResult as never);

        const result = await CategoryService.save(data);

        expect(CategoryModel.bulkWrite).toHaveBeenCalledWith([
            { updateOne: { filter: { Name: 'Food' }, update: { $set: data[0] }, upsert: true } },
            { updateOne: { filter: { Name: 'Rent' }, update: { $set: data[1] }, upsert: true } },
        ]);
        expect(CategoryModel.findOneAndUpdate).not.toHaveBeenCalled();
        expect(result).toBe(bulkResult);
    });
});
