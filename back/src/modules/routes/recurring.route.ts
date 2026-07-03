import { Router } from 'express';
import {
    createRecurring,
    deleteRecurring,
    getRecurringById,
    getRecurrings,
    runRecurrings,
    updateRecurring,
} from '../controllers/recurring.controller';
import { bodyValidator, idValidator } from '../validators/recurring.validator';

const router = Router();

/**
 * start path: /recurring
 * */

router.get('/',                              getRecurrings);
router.get('/:id',    idValidator,           getRecurringById);
router.post('/',      bodyValidator,         createRecurring);
router.put('/:id',    idValidator, bodyValidator, updateRecurring);
router.delete('/:id', idValidator,           deleteRecurring);
router.post('/run',                          runRecurrings);

export default router;
