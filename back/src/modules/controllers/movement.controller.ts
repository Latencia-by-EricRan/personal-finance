import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import MovementService from '../services/movement.service';
import { deletedResponse, errorResponse, successResponse } from '../../middlewares/response.middleware';
import { MovementI, TypeMovement } from '../interfaces/movement.interface';
import { checkDate } from '../../utils/validator.util';
import { toMessage, toPagination } from '../../utils/controller.util';

const getMovementsCurrentMonth = async (_: Request, res: Response) => {
    try {
        const date = new Date();
        const gte = new Date(date.getFullYear(), date.getMonth(), 0);
        gte.setHours(23, 59, 59, 999);
        const lte = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        lte.setHours(23, 59, 59, 999);

        const movements = await MovementService.find({
            Date: {
                $gte: gte,
                $lte: lte
            }
        }).then((movements) => {
            movements.forEach((movement) => {
                movement.populate('Category');
            });
            return movements;
        });

        successResponse(res, movements);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
}

const getMovementsByFilters = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.params;

        const filter = {
            Date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const filterData = matchedData<Partial<Pick<MovementI, 'Type' | 'Amount' | 'Card' | 'Category' | 'Description'>>>(
            req,
            { locations: ['body'] },
        );
        Object.assign(filter, filterData);

        const movements = await MovementService.find(filter, undefined, toPagination(req.query));

        successResponse(res, movements);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
};

const getSummaryByMonth = async (req: Request, res: Response) => {
    try {
        const month = Number(req.params.month);
        const year = Number(req.params.year);
        const gteDate = new Date(year, month - 1, 0);
        const lteDate = new Date(year, month, 0);
        const filter = {
            Date: {
                $gte: gteDate,
                $lte: lteDate
            }
        };

        const movements = await MovementService.find(filter);

        const fnAccAmount = (acc: number, movement: MovementI) => acc + movement.Amount;
        const summary = {
            items: movements.length,
            amount: {
                income: movements.filter((movement) => movement.Type === TypeMovement.INGRESO).reduce(fnAccAmount, 0),
                expense: movements.filter((movement) => movement.Type === TypeMovement.EGRESO).reduce(fnAccAmount, 0),
            }
        };

        successResponse(res, {
            month,
            year,
            summary,
            movements,
        });
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
}

const createMovement = async (req: Request, res: Response) => {
    try {
        const movement = await MovementService.create(req.body);
        successResponse(res, movement, 201);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
}

const updateMovement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const movement = await MovementService.update(id, req.body);
        successResponse(res, movement);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
}

const deleteMovement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const movement = await MovementService.remove(id);
        if (!movement) {
            errorResponse(res, 'Movement not found', 404);
            return;
        }
        deletedResponse(res, id);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
}

const saveMovements = async (req: Request, res: Response) => {
    try {
        const inputMovements = req.body.map((movement: MovementI) => {
            if (typeof movement.Date === 'string' && checkDate(movement.Date)) {
                movement.Date = new Date(movement.Date);
            }
            return movement;
        });
        const movements = await MovementService.saveMany(inputMovements);
        successResponse(res, movements, 201);
    } catch (error: unknown) {
        errorResponse(res, toMessage(error));
    }
}


export {
    getMovementsByFilters,
    getMovementsCurrentMonth,
    getSummaryByMonth,
    createMovement,
    updateMovement,
    deleteMovement,
    saveMovements,
}
