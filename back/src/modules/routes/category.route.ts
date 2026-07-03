import { Router  } from 'express';
import {
    deleteCategory,
    getCategories,
    getCategoryById,
    manySaveCategory,
    saveCategory
} from '../controllers/category.controller';
import { bodyValidator, idValidator, manySaveValidator } from '../validators/category.validator';

const router = Router();

/**
 * start path: /category
 * */

router.get('/',                      getCategories);
router.get('/:id',    idValidator,   getCategoryById);
router.post('/',      bodyValidator, saveCategory);
router.post('/save',  manySaveValidator, manySaveCategory);
router.delete('/:id', idValidator,   deleteCategory);

export default router;
