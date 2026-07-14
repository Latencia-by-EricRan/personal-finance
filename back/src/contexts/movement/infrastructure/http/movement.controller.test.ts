import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MovementType } from '../../domain/Movement';
import { MovementUseCases } from '../../application/MovementUseCases';
import { MovementView } from '../../application/ports/MovementRepository';
import { createMovementController } from './movement.controller';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const makeUseCases = (): MovementUseCases => ({
    createMovement: { execute: vi.fn() } as never,
    updateMovement: { execute: vi.fn() } as never,
    deleteMovement: { execute: vi.fn() } as never,
    findMovements: { execute: vi.fn() } as never,
    saveManyMovements: { execute: vi.fn() } as never,
    getMonthlySummary: { execute: vi.fn() } as never,
});

const movementView = (overrides: Partial<MovementView> = {}): MovementView => ({
    _id: '507f1f77bcf86cd799439011',
    Type: MovementType.EGRESO,
    Amount: 500,
    Date: new Date(2026, 0, 1),
    Category: '507f1f77bcf86cd799439022',
    Account: '507f1f77bcf86cd799439033',
    Card: '',
    Description: '',
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe('createMovementController', () => {
    describe('getMovementsCurrentMonth', () => {
        it('queries the range covering the current month and returns 200 with the views', async () => {
            vi.setSystemTime(new Date(2026, 2, 15)); // March 15, 2026
            const useCases = makeUseCases();
            vi.mocked(useCases.findMovements.execute).mockResolvedValue([]);
            const controller = createMovementController(useCases);
            const res = mockRes();

            await controller.getMovementsCurrentMonth({} as Request, res);

            const gte = new Date(2026, 2, 0);
            gte.setHours(23, 59, 59, 999);
            const lte = new Date(2026, 3, 0);
            lte.setHours(23, 59, 59, 999);

            expect(useCases.findMovements.execute).toHaveBeenCalledWith({
                Date: { $gte: gte, $lte: lte },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            vi.useRealTimers();
        });
    });

    describe('getSummaryByMonth', () => {
        it('delegates to getMonthlySummary.execute and echoes month/year alongside the result', async () => {
            const useCases = makeUseCases();
            const summaryMovements = [movementView()];
            vi.mocked(useCases.getMonthlySummary.execute).mockResolvedValue({
                summary: { items: 3, amount: { income: 150, expense: 40 } },
                movements: summaryMovements,
            });
            const controller = createMovementController(useCases);
            const req = { params: { month: '3', year: '2026' } } as unknown as Request;
            const res = mockRes();

            await controller.getSummaryByMonth(req, res);

            expect(useCases.getMonthlySummary.execute).toHaveBeenCalledWith(3, 2026);
            expect(res.json).toHaveBeenCalledWith({
                month: 3,
                year: 2026,
                summary: { items: 3, amount: { income: 150, expense: 40 } },
                movements: summaryMovements,
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('createMovement', () => {
        it('delegates to createMovement.execute with the raw body and responds 201 with the returned view', async () => {
            const body = {
                Type: 'ingreso',
                Amount: 1000,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439099',
                Date: new Date(2026, 0, 1),
            };
            const useCases = makeUseCases();
            const created = movementView({ ...body, Type: MovementType.INGRESO, _id: '507f1f77bcf86cd799439055' });
            vi.mocked(useCases.createMovement.execute).mockResolvedValue(created);
            const controller = createMovementController(useCases);
            const req = { body } as unknown as Request;
            const res = mockRes();

            await controller.createMovement(req, res);

            expect(useCases.createMovement.execute).toHaveBeenCalledWith(body);
            expect(res.json).toHaveBeenCalledWith(created);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateMovement', () => {
        it('delegates to updateMovement.execute with id + the raw partial body and responds 200 with the updated view', async () => {
            const body = { Amount: 2000 };
            const useCases = makeUseCases();
            const updated = movementView({ Amount: 2000, _id: '507f1f77bcf86cd799439055' });
            vi.mocked(useCases.updateMovement.execute).mockResolvedValue(updated);
            const controller = createMovementController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439055' }, body } as unknown as Request;
            const res = mockRes();

            await controller.updateMovement(req, res);

            expect(useCases.updateMovement.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439055', body);
            expect(res.json).toHaveBeenCalledWith(updated);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('never forwards an explicit undefined-valued Category key — passes req.body through untouched (review follow-up #2)', async () => {
            const body = { Amount: 300 };
            const useCases = makeUseCases();
            vi.mocked(useCases.updateMovement.execute).mockResolvedValue(movementView({ Amount: 300 }));
            const controller = createMovementController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439055' }, body } as unknown as Request;
            const res = mockRes();

            await controller.updateMovement(req, res);

            const forwardedPatch = vi.mocked(useCases.updateMovement.execute).mock.calls[0][1];
            expect(Object.keys(forwardedPatch)).not.toContain('Category');
            expect(forwardedPatch).toBe(body);
        });
    });

    describe('deleteMovement', () => {
        it('responds 200 with { deleted: true, id } when the use case resolves a removed view', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.deleteMovement.execute).mockResolvedValue(movementView());
            const controller = createMovementController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.deleteMovement(req, res);

            expect(useCases.deleteMovement.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(res.json).toHaveBeenCalledWith({ deleted: true, id: '507f1f77bcf86cd799439011' });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 404 when the use case resolves null (id not found)', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.deleteMovement.execute).mockResolvedValue(null);
            const controller = createMovementController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.deleteMovement(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Movement not found' });
        });
    });

    describe('saveMovements', () => {
        it('converts YYYY-MM-DD string dates before delegating to saveManyMovements.execute, responds 201', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.saveManyMovements.execute).mockResolvedValue([]);
            const controller = createMovementController(useCases);
            const req = {
                body: [
                    { Date: '2026-01-15', Amount: 10 },
                    { Date: new Date(2026, 1, 1), Amount: 20 },
                ],
            } as unknown as Request;
            const res = mockRes();

            await controller.saveMovements(req, res);

            expect(useCases.saveManyMovements.execute).toHaveBeenCalledWith([
                { Date: new Date('2026-01-15'), Amount: 10 },
                { Date: new Date(2026, 1, 1), Amount: 20 },
            ]);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('getMovementsByFilters', () => {
        it('builds the date-range filter from the path params and honors pagination', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.findMovements.execute).mockResolvedValue([]);
            const controller = createMovementController(useCases);
            const req = {
                params: { startDate: '2026-01-01', endDate: '2026-01-31' },
                query: {},
            } as unknown as Request;
            const res = mockRes();

            await controller.getMovementsByFilters(req, res);

            expect(useCases.findMovements.execute).toHaveBeenCalledWith(
                { Date: { $gte: new Date('2026-01-01'), $lte: new Date('2026-01-31') } },
                undefined,
                { limit: 50, skip: 0 },
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
