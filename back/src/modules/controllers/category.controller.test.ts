import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/category.service', () => ({
    default: {
        save: vi.fn(),
        find: vi.fn(),
        findById: vi.fn(),
        delete: vi.fn(),
        manySave: vi.fn(),
    },
}));

import CategoryService from '../services/category.service';
import { deleteCategory, saveCategory } from './category.controller';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('saveCategory', () => {
    it('always delegates to CategoryService.save, even with an array body (dispatch lives in the service)', async () => {
        const bulkResult = { matchedCount: 2, modifiedCount: 2, upsertedCount: 0 };
        vi.mocked(CategoryService.save).mockResolvedValue(bulkResult as never);
        const body = [
            { Name: 'Food', Description: 'Groceries', Type: 'variable' },
            { Name: 'Rent', Description: 'Monthly rent', Type: 'fijo' },
        ];
        const req = { body } as unknown as Request;
        const res = mockRes();

        await saveCategory(req, res);

        expect(CategoryService.save).toHaveBeenCalledWith(body);
        expect(CategoryService.manySave).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(bulkResult);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('delegates to CategoryService.save when the body is a single object', async () => {
        const saved = { Name: 'Food', Description: 'Groceries', Type: 'variable' };
        vi.mocked(CategoryService.save).mockResolvedValue(saved as never);
        const req = { body: saved } as unknown as Request;
        const res = mockRes();

        await saveCategory(req, res);

        expect(CategoryService.save).toHaveBeenCalledWith(saved);
        expect(CategoryService.manySave).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(saved);
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

describe('deleteCategory', () => {
    it('responds with a JSON body containing deleted and id when a category was deleted', async () => {
        vi.mocked(CategoryService.delete).mockResolvedValue({ _id: '507f1f77bcf86cd799439011' } as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await deleteCategory(req, res);

        expect(CategoryService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.json).toHaveBeenCalledWith({ deleted: true, id: '507f1f77bcf86cd799439011' });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds 404 when the service resolves nothing (id not found)', async () => {
        vi.mocked(CategoryService.delete).mockResolvedValue(undefined as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await deleteCategory(req, res);

        expect(CategoryService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Category not found' });
    });
});
