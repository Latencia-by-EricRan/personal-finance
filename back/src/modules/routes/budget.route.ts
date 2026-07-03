import { Router } from 'express';
import {
    createBudget,
    deleteBudget,
    getBudgetById,
    getBudgetStatus,
    getBudgets,
    updateBudget,
} from '../controllers/budget.controller';
import { bodyValidator, idValidator, statusParamValidator } from '../validators/budget.validator';

const router = Router();

/**
 * start path: /budget
 * */

router.get('/status/:month/:year', statusParamValidator,  getBudgetStatus);
router.get('/',                                            getBudgets);
router.get('/:id',    idValidator,                         getBudgetById);
router.post('/',      bodyValidator,                       createBudget);
router.put('/:id',    idValidator, bodyValidator,           updateBudget);
router.delete('/:id', idValidator,                         deleteBudget);

export default router;
