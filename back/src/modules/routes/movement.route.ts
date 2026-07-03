import { Router  } from 'express';
import {
    addUpdateValidator,
    idValidator,
    manySaveValidator,
    paramBodyValidator,
    paramDateValidator
} from '../validators/movement.validator';
import {
    createMovement,
    deleteMovement,
    getMovementsByFilters,
    getMovementsCurrentMonth,
    getSummaryByMonth,
    saveMovements,
    updateMovement,
} from '../controllers/movement.controller';


const router = Router();

/**
* start path: /movement
* */

router.get('/month',                                    getMovementsCurrentMonth);
router.get('/summary/:month/:year', paramDateValidator, getSummaryByMonth);
router.get('/:startDate/:endDate',  paramBodyValidator, getMovementsByFilters);
router.post('/:startDate/:endDate', paramBodyValidator, getMovementsByFilters);
router.post('/',                    addUpdateValidator, createMovement);
router.post('/save',                manySaveValidator,  saveMovements);
router.put('/:id',                  addUpdateValidator, updateMovement);
router.delete('/:id',               idValidator,        deleteMovement);


export default router;
