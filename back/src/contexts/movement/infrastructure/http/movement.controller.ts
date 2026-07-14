import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { deletedResponse, errorResponse, successResponse } from '../../../../middlewares/response.middleware';
import { checkDate } from '../../../../utils/validator.util';
import { toMessage, toPagination } from '../../../../utils/controller.util';
import { MovementProps } from '../../domain/Movement';
import { MovementPatch } from '../../application/ports/MovementRepository';
import { MovementUseCases } from '../../application/MovementUseCases';

/**
 * Inbound HTTP adapter (design D1). Factory over `MovementUseCases` — no
 * static import of `getContainer()` here, so this controller can be
 * unit-tested with plain mock use cases (mock-layer-below convention) and
 * reused by any router wiring. Mirrors `createCategoryController`'s shape.
 *
 * Response bodies are `MovementView` objects returned by the use cases
 * as-is — no DTO mapping needed, since `MovementMapper.toView` (PR2)
 * already produces the exact byte-shape the legacy raw Mongoose document
 * echoed (design D1), pinned by the PR3.1 characterization baseline
 * (`src/e2e/movement-http.characterization.e2e.test.ts`).
 */
export const createMovementController = (useCases: MovementUseCases) => {
    const getMovementsCurrentMonth = async (_: Request, res: Response) => {
        try {
            const date = new Date();
            const gte = new Date(date.getFullYear(), date.getMonth(), 0);
            gte.setHours(23, 59, 59, 999);
            const lte = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            lte.setHours(23, 59, 59, 999);

            const movements = await useCases.findMovements.execute({
                Date: {
                    $gte: gte,
                    $lte: lte,
                },
            });

            successResponse(res, movements);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const getMovementsByFilters = async (req: Request, res: Response) => {
        try {
            const { startDate, endDate } = req.params;

            const filter = {
                Date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            };

            const filterData = matchedData<Partial<Pick<MovementProps, 'Type' | 'Amount' | 'Card' | 'Category' | 'Description'>>>(
                req,
                { locations: ['body'] },
            );
            Object.assign(filter, filterData);

            const movements = await useCases.findMovements.execute(filter, undefined, toPagination(req.query));

            successResponse(res, movements);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const getSummaryByMonth = async (req: Request, res: Response) => {
        try {
            const month = Number(req.params.month);
            const year = Number(req.params.year);

            const { summary, movements } = await useCases.getMonthlySummary.execute(month, year);

            successResponse(res, {
                month,
                year,
                summary,
                movements,
            });
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const createMovement = async (req: Request, res: Response) => {
        try {
            const movement = await useCases.createMovement.execute(req.body as MovementProps);
            successResponse(res, movement, 201);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const updateMovement = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const movement = await useCases.updateMovement.execute(id, req.body as MovementPatch);
            successResponse(res, movement);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const deleteMovement = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const movement = await useCases.deleteMovement.execute(id);
            if (!movement) {
                errorResponse(res, 'Movement not found', 404);
                return;
            }
            deletedResponse(res, id);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    const saveMovements = async (req: Request, res: Response) => {
        try {
            const inputMovements = req.body.map((movement: MovementProps) => {
                if (typeof movement.Date === 'string' && checkDate(movement.Date as unknown as string)) {
                    movement.Date = new Date(movement.Date as unknown as string);
                }
                return movement;
            });
            const movements = await useCases.saveManyMovements.execute(inputMovements);
            successResponse(res, movements, 201);
        } catch (error: unknown) {
            errorResponse(res, toMessage(error));
        }
    };

    return {
        getMovementsCurrentMonth,
        getMovementsByFilters,
        getSummaryByMonth,
        createMovement,
        updateMovement,
        deleteMovement,
        saveMovements,
    };
};
