import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Identity } from '../../../../shared/domain/Identity';
import { Category } from '../../domain/Category';
import { DuplicateCategoryKeyError } from '../../application/BulkSaveCategory';
import { CategoryUseCases } from '../../application/CategoryUseCases';
import { BulkUpsertResult } from '../../application/ports/CategoryRepository';
import { createCategoryController } from './category.controller';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const makeUseCases = (): CategoryUseCases => ({
    saveCategory: { execute: vi.fn() } as never,
    bulkSaveCategory: { execute: vi.fn() } as never,
    findCategories: { execute: vi.fn() } as never,
    findCategoryById: { execute: vi.fn() } as never,
    deleteCategory: { execute: vi.fn() } as never,
});

const foodCategory = () =>
    Category.rehydrate(Identity.create('507f1f77bcf86cd799439011'), {
        Name: 'Food',
        Description: 'Groceries',
        Type: 'variable',
        Tag: 'food-tag',
    });

beforeEach(() => {
    vi.clearAllMocks();
});

describe('createCategoryController', () => {
    describe('saveCategory', () => {
        it('creates a single category via saveCategory and returns 201 with its persisted shape', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.saveCategory.execute).mockResolvedValue(foodCategory());
            const controller = createCategoryController(useCases);
            const body = { Name: 'Food', Description: 'Groceries', Type: 'variable', Tag: 'food-tag' };
            const req = { body } as unknown as Request;
            const res = mockRes();

            await controller.saveCategory(req, res);

            expect(useCases.saveCategory.execute).toHaveBeenCalledWith(body);
            expect(useCases.bulkSaveCategory.execute).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                _id: '507f1f77bcf86cd799439011',
                Description: 'Groceries',
                Name: 'Food',
                Tag: 'food-tag',
                Type: 'variable',
                Icon: '',
                Color: '',
            });
        });

        it('dispatches to bulkSaveCategory when the body is an array and returns the mapped bulk result', async () => {
            const useCases = makeUseCases();
            const bulkResult: BulkUpsertResult = {
                insertedCount: 0,
                matchedCount: 0,
                modifiedCount: 0,
                deletedCount: 0,
                upsertedCount: 2,
                upsertedIds: { 0: 'a', 1: 'b' },
                insertedIds: {},
            };
            vi.mocked(useCases.bulkSaveCategory.execute).mockResolvedValue(bulkResult);
            const controller = createCategoryController(useCases);
            const body = [
                { Name: 'Food', Description: 'Groceries', Type: 'variable' },
                { Name: 'Rent', Description: 'Monthly rent', Type: 'fijo' },
            ];
            const req = { body } as unknown as Request;
            const res = mockRes();

            await controller.saveCategory(req, res);

            expect(useCases.bulkSaveCategory.execute).toHaveBeenCalledWith(body);
            expect(useCases.saveCategory.execute).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(bulkResult);
        });

        it('maps a DuplicateCategoryKeyError from the batch use case to a 400 validation response', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.bulkSaveCategory.execute).mockRejectedValue(
                new DuplicateCategoryKeyError('food-tag', [0, 1]),
            );
            const controller = createCategoryController(useCases);
            const req = { body: [{}, {}] } as unknown as Request;
            const res = mockRes();

            await controller.saveCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation failed',
                errors: ['Duplicate Tag/Name "food-tag" at indexes [0, 1]'],
            });
        });
    });

    describe('manySaveCategory', () => {
        it('returns 201 with the mapped bulk result', async () => {
            const useCases = makeUseCases();
            const bulkResult: BulkUpsertResult = {
                insertedCount: 0,
                matchedCount: 1,
                modifiedCount: 1,
                deletedCount: 0,
                upsertedCount: 0,
                upsertedIds: {},
                insertedIds: {},
            };
            vi.mocked(useCases.bulkSaveCategory.execute).mockResolvedValue(bulkResult);
            const controller = createCategoryController(useCases);
            const body = [{ Name: 'Food', Description: 'Groceries', Type: 'variable' }];
            const req = { body } as unknown as Request;
            const res = mockRes();

            await controller.manySaveCategory(req, res);

            expect(useCases.bulkSaveCategory.execute).toHaveBeenCalledWith(body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(bulkResult);
        });

        it('maps a DuplicateCategoryKeyError to a 400 validation response', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.bulkSaveCategory.execute).mockRejectedValue(
                new DuplicateCategoryKeyError('Food', [0, 1]),
            );
            const controller = createCategoryController(useCases);
            const req = { body: [{}, {}] } as unknown as Request;
            const res = mockRes();

            await controller.manySaveCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation failed',
                errors: ['Duplicate Tag/Name "Food" at indexes [0, 1]'],
            });
        });
    });

    describe('getCategories', () => {
        it('returns 200 with the mapped list from findCategories, honoring pagination', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.findCategories.execute).mockResolvedValue([foodCategory()]);
            const controller = createCategoryController(useCases);
            const req = { query: {} } as unknown as Request;
            const res = mockRes();

            await controller.getCategories(req, res);

            expect(useCases.findCategories.execute).toHaveBeenCalledWith({}, { limit: 50, skip: 0 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([
                {
                    _id: '507f1f77bcf86cd799439011',
                    Description: 'Groceries',
                    Name: 'Food',
                    Tag: 'food-tag',
                    Type: 'variable',
                    Icon: '',
                    Color: '',
                },
            ]);
        });
    });

    describe('getCategoryById', () => {
        it('returns 200 with the mapped category when found', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.findCategoryById.execute).mockResolvedValue(foodCategory());
            const controller = createCategoryController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.getCategoryById(req, res);

            expect(useCases.findCategoryById.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                _id: '507f1f77bcf86cd799439011',
                Description: 'Groceries',
                Name: 'Food',
                Tag: 'food-tag',
                Type: 'variable',
                Icon: '',
                Color: '',
            });
        });

        it('returns 200 with null when not found (matches legacy no-404 behavior)', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.findCategoryById.execute).mockResolvedValue(null);
            const controller = createCategoryController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.getCategoryById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(null);
        });
    });

    describe('deleteCategory', () => {
        it('returns 200 with { deleted: true, id } when found', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.deleteCategory.execute).mockResolvedValue(foodCategory());
            const controller = createCategoryController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.deleteCategory(req, res);

            expect(useCases.deleteCategory.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ deleted: true, id: '507f1f77bcf86cd799439011' });
        });

        it('returns 404 when the use case resolves null', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.deleteCategory.execute).mockResolvedValue(null);
            const controller = createCategoryController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.deleteCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Category not found' });
        });
    });
});
