import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TypeMovement } from '../interfaces/movement.interface';

vi.mock('../services/movement.service', () => ({
    default: {
        find: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
        saveMany: vi.fn(),
    },
}));

import MovementService from '../services/movement.service';
import {
    createMovement,
    deleteMovement,
    getMovementsByFilters,
    getMovementsCurrentMonth,
    getSummaryByMonth,
    saveMovements,
    updateMovement,
} from './movement.controller';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getMovementsCurrentMonth', () => {
    it('queries the range covering the current month', async () => {
        vi.setSystemTime(new Date(2026, 2, 15)); // March 15, 2026
        vi.mocked(MovementService.find).mockResolvedValue([]);
        const res = mockRes();

        await getMovementsCurrentMonth({} as Request, res);

        const gte = new Date(2026, 2, 0);
        gte.setHours(23, 59, 59, 999);
        const lte = new Date(2026, 3, 0);
        lte.setHours(23, 59, 59, 999);

        expect(MovementService.find).toHaveBeenCalledWith({
            Date: { $gte: gte, $lte: lte },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        vi.useRealTimers();
    });
});

describe('getSummaryByMonth', () => {
    it('computes the date range and income/expense totals', async () => {
        vi.mocked(MovementService.find).mockResolvedValue([
            { Type: TypeMovement.INGRESO, Amount: 100 },
            { Type: TypeMovement.EGRESO, Amount: 40 },
            { Type: TypeMovement.INGRESO, Amount: 50 },
        ] as never);
        const req = { params: { month: '3', year: '2026' } } as unknown as Request;
        const res = mockRes();

        await getSummaryByMonth(req, res);

        expect(MovementService.find).toHaveBeenCalledWith({
            Date: { $gte: new Date(2026, 2, 0), $lte: new Date(2026, 3, 0) },
        });
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                summary: { items: 3, amount: { income: 150, expense: 40 } },
            }),
        );
    });
});

describe('deleteMovement', () => {
    it('responds with a JSON body containing deleted and id when a movement was deleted', async () => {
        vi.mocked(MovementService.remove).mockResolvedValue({ _id: '507f1f77bcf86cd799439011' } as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await deleteMovement(req, res);

        expect(MovementService.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.json).toHaveBeenCalledWith({ deleted: true, id: '507f1f77bcf86cd799439011' });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds 404 when the service resolves nothing (id not found)', async () => {
        vi.mocked(MovementService.remove).mockResolvedValue(undefined as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await deleteMovement(req, res);

        expect(MovementService.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Movement not found' });
    });
});

describe('saveMovements', () => {
    it('converts YYYY-MM-DD string dates before saving', async () => {
        vi.mocked(MovementService.saveMany).mockResolvedValue([]);
        const req = {
            body: [
                { Date: '2026-01-15', Amount: 10 },
                { Date: new Date(2026, 1, 1), Amount: 20 },
            ],
        } as unknown as Request;
        const res = mockRes();

        await saveMovements(req, res);

        expect(MovementService.saveMany).toHaveBeenCalledWith([
            { Date: new Date('2026-01-15'), Amount: 10 },
            { Date: new Date(2026, 1, 1), Amount: 20 },
        ]);
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

describe('createMovement', () => {
    it('delegates to MovementService.create with Account in the body and responds 201', async () => {
        const body = {
            Type: 'ingreso',
            Amount: 1000,
            Category: '507f1f77bcf86cd799439011',
            Account: '507f1f77bcf86cd799439099',
            Date: new Date(2026, 0, 1),
        };
        const created = { ...body, _id: '507f1f77bcf86cd799439055' };
        vi.mocked(MovementService.create).mockResolvedValue(created as never);
        const req = { body } as unknown as Request;
        const res = mockRes();

        await createMovement(req, res);

        expect(MovementService.create).toHaveBeenCalledWith(body);
        expect(res.json).toHaveBeenCalledWith(created);
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

describe('updateMovement', () => {
    it('delegates to MovementService.update and responds with the updated movement', async () => {
        const body = { Amount: 2000 };
        const updated = { ...body, _id: '507f1f77bcf86cd799439055' };
        vi.mocked(MovementService.update).mockResolvedValue(updated as never);
        const req = { params: { id: '507f1f77bcf86cd799439055' }, body } as unknown as Request;
        const res = mockRes();

        await updateMovement(req, res);

        expect(MovementService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439055', body);
        expect(res.json).toHaveBeenCalledWith(updated);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe('getMovementsByFilters', () => {
    it('builds the date-range filter from the path params', async () => {
        vi.mocked(MovementService.find).mockResolvedValue([]);
        const req = {
            params: { startDate: '2026-01-01', endDate: '2026-01-31' },
            query: {},
        } as unknown as Request;
        const res = mockRes();

        await getMovementsByFilters(req, res);

        expect(MovementService.find).toHaveBeenCalledWith(
            { Date: { $gte: new Date('2026-01-01'), $lte: new Date('2026-01-31') } },
            undefined,
            { limit: 50, skip: 0 },
        );
    });
});
