import { Request, Response } from 'express';
import { deletedResponse, errorResponse, successResponse } from '../../../../middlewares/response.middleware';
import { toMessage, toPagination } from '../../../../utils/controller.util';
import { Category, CategoryProps } from '../../domain/Category';
import { DuplicateCategoryKeyError } from '../../application/BulkSaveCategory';
import { CategoryUseCases } from '../../application/CategoryUseCases';

interface CategoryResponseBody {
    _id?: string;
    Description: string;
    Name: string;
    Tag: string;
    Type: string;
    Icon: string;
}

const toResponseBody = (category: Category): CategoryResponseBody => ({
    _id: category.id?.value,
    Description: category.description,
    Name: category.name,
    Tag: category.tag,
    Type: category.type,
    Icon: category.icon,
});

/**
 * Inbound HTTP adapter (design D1). Factory over the use cases exposed by
 * the composition root — no static import of `getContainer()` here, so this
 * controller can be unit-tested with plain mock use cases (mock-layer-below
 * convention) and reused by any router wiring.
 */
export const createCategoryController = (useCases: CategoryUseCases) => {
    const deleteCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const category = await useCases.deleteCategory.execute(id);
            if (!category) {
                errorResponse(res, 'Category not found', 404);
                return;
            }
            deletedResponse(res, id);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const getCategories = async (req: Request, res: Response): Promise<void> => {
        try {
            const categories = await useCases.findCategories.execute({}, toPagination(req.query));
            successResponse(res, categories.map(toResponseBody));
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const getCategoryById = async (req: Request, res: Response): Promise<void> => {
        try {
            const category = await useCases.findCategoryById.execute(req.params.id);
            successResponse(res, category ? toResponseBody(category) : null);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const manySaveCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await useCases.bulkSaveCategory.execute(req.body as CategoryProps[]);
            successResponse(res, result, 201);
        } catch (error: unknown) {
            if (error instanceof DuplicateCategoryKeyError) {
                errorResponse(res, 'Validation failed', 400, [error.message]);
                return;
            }
            errorResponse(res, toMessage(error));
        }
    };

    const saveCategory = async (req: Request, res: Response): Promise<void> => {
        if (Array.isArray(req.body)) {
            return manySaveCategory(req, res);
        }

        try {
            const category = await useCases.saveCategory.execute(req.body as CategoryProps);
            successResponse(res, toResponseBody(category), 201);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    return {
        deleteCategory,
        getCategories,
        getCategoryById,
        manySaveCategory,
        saveCategory,
    };
};
