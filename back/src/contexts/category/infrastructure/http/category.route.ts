import { Router } from 'express';
import { CategoryUseCases } from '../../application/CategoryUseCases';
import { createCategoryController } from './category.controller';
import { bodyValidator, idValidator, manySaveValidator } from './category.validator';

/**
 * start path: /category
 *
 * Router factory (design D1): `_routes.ts` calls
 * `createCategoryRouter(getContainer().category)` once at boot, instead of
 * importing a static router bound to module-level singletons.
 */
export const createCategoryRouter = (useCases: CategoryUseCases): Router => {
    const router = Router();
    const controller = createCategoryController(useCases);

    router.get('/', controller.getCategories);
    router.get('/:id', idValidator, controller.getCategoryById);
    router.post('/', bodyValidator, controller.saveCategory);
    router.post('/save', manySaveValidator, controller.manySaveCategory);
    router.delete('/:id', idValidator, controller.deleteCategory);

    return router;
};
