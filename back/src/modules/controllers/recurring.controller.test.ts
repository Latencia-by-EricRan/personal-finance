import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/recurring.service', () => ({
    default: {
        find: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        run: vi.fn(),
    },
}));

import RecurringService from '../services/recurring.service';
import {
    createRecurring,
    deleteRecurring,
    getRecurringById,
    getRecurrings,
    runRecurrings,
    updateRecurring,
} from './recurring.controller';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getRecurrings', () => {
    it('paginates using page/limit query params', async () => {
        vi.mocked(RecurringService.find).mockResolvedValue([]);
        const req = { query: { page: '2', limit: '10' } } as unknown as Request;
        const res = mockRes();

        await getRecurrings(req, res);

        expect(RecurringService.find).toHaveBeenCalledWith({}, { limit: 10, skip: 10 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('defaults to page 1, limit 50 when no query params are given', async () => {
        vi.mocked(RecurringService.find).mockResolvedValue([]);
        const req = { query: {} } as unknown as Request;
        const res = mockRes();

        await getRecurrings(req, res);

        expect(RecurringService.find).toHaveBeenCalledWith({}, { limit: 50, skip: 0 });
    });

    it('responds with 500 on service error', async () => {
        vi.mocked(RecurringService.find).mockRejectedValue(new Error('boom'));
        const req = { query: {} } as unknown as Request;
        const res = mockRes();

        await getRecurrings(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
    });
});

describe('getRecurringById', () => {
    it('responds with the recurring when found', async () => {
        const recurring = { _id: '507f1f77bcf86cd799439011', Type: 'ingreso' };
        vi.mocked(RecurringService.findById).mockResolvedValue(recurring as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await getRecurringById(req, res);

        expect(RecurringService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.json).toHaveBeenCalledWith(recurring);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds 404 when the recurring does not exist', async () => {
        vi.mocked(RecurringService.findById).mockResolvedValue(null);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await getRecurringById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Recurring not found' });
    });
});

describe('createRecurring', () => {
    it('delegates to RecurringService.create and responds 201', async () => {
        const body = { Type: 'ingreso', Amount: 1000, Category: 'cat1', DayOfMonth: 1 };
        const created = { ...body, _id: '507f1f77bcf86cd799439011' };
        vi.mocked(RecurringService.create).mockResolvedValue(created as never);
        const req = { body } as unknown as Request;
        const res = mockRes();

        await createRecurring(req, res);

        expect(RecurringService.create).toHaveBeenCalledWith(body);
        expect(res.json).toHaveBeenCalledWith(created);
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

describe('updateRecurring', () => {
    it('delegates to RecurringService.update and responds 200', async () => {
        const body = { Amount: 2000 };
        const updated = { ...body, _id: '507f1f77bcf86cd799439011' };
        vi.mocked(RecurringService.update).mockResolvedValue(updated as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' }, body } as unknown as Request;
        const res = mockRes();

        await updateRecurring(req, res);

        expect(RecurringService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', body);
        expect(res.json).toHaveBeenCalledWith(updated);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds 404 when the recurring to update does not exist', async () => {
        vi.mocked(RecurringService.update).mockResolvedValue(null);
        const req = { params: { id: '507f1f77bcf86cd799439011' }, body: {} } as unknown as Request;
        const res = mockRes();

        await updateRecurring(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Recurring not found' });
    });
});

describe('deleteRecurring', () => {
    it('responds with a JSON body containing deleted and id when a recurring was deleted', async () => {
        vi.mocked(RecurringService.delete).mockResolvedValue({ _id: '507f1f77bcf86cd799439011' } as never);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await deleteRecurring(req, res);

        expect(RecurringService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.json).toHaveBeenCalledWith({ deleted: true, id: '507f1f77bcf86cd799439011' });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds 404 when the recurring to delete does not exist', async () => {
        vi.mocked(RecurringService.delete).mockResolvedValue(null);
        const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
        const res = mockRes();

        await deleteRecurring(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Recurring not found' });
    });
});

describe('runRecurrings', () => {
    it('delegates to RecurringService.run and responds 200 with the created movements', async () => {
        const movements = [{ _id: 'mv1', Type: 'egreso', Amount: 500 }];
        vi.mocked(RecurringService.run).mockResolvedValue(movements as never);
        const req = {} as unknown as Request;
        const res = mockRes();

        await runRecurrings(req, res);

        expect(RecurringService.run).toHaveBeenCalledWith();
        expect(res.json).toHaveBeenCalledWith(movements);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds 200 with an empty array when nothing was due (not an error)', async () => {
        vi.mocked(RecurringService.run).mockResolvedValue([]);
        const req = {} as unknown as Request;
        const res = mockRes();

        await runRecurrings(req, res);

        expect(res.json).toHaveBeenCalledWith([]);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('responds with 500 on service error', async () => {
        vi.mocked(RecurringService.run).mockRejectedValue(new Error('boom'));
        const req = {} as unknown as Request;
        const res = mockRes();

        await runRecurrings(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
    });
});
