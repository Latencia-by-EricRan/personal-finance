import { Request, Response } from 'express';
import { deletedResponse, errorResponse, successResponse } from '../../middlewares/response.middleware';
import { toMessage, toPagination } from '../../utils/controller.util';
import CategoryService from '../services/category.service';

const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await CategoryService.delete(id);
        if (!category) {
            errorResponse(res, 'Category not found', 404);
            return;
        }
        deletedResponse(res, id);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await CategoryService.find({}, toPagination(req.query));
        successResponse(res, categories);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const getCategoryById = async (req: Request, res: Response) => {
    try {
        const category = await CategoryService.findById(req.params.id);
        successResponse(res, category);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const manySaveCategory = async (req: Request, res: Response) => {
    try {
        const category = await CategoryService.manySave(req.body);
        successResponse(res, category, 201);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const saveCategory = async (req: Request, res: Response) => {
    try {
        const category = await CategoryService.save(req.body);
        successResponse(res, category, 201);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};


export {
    deleteCategory,
    getCategories,
    getCategoryById,
    manySaveCategory,
    saveCategory,
}
