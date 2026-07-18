import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecurringUseCases } from '../../application/RecurringUseCases';
import { RecurringView } from '../../application/ports/RecurringRepository';
import { createRecurringController } from './recurring.controller';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const makeUseCases = (): RecurringUseCases => ({
    findRecurrings: { execute: vi.fn() } as never,
    findRecurringById: { execute: vi.fn() } as never,
    createRecurring: { execute: vi.fn() } as never,
    updateRecurring: { execute: vi.fn() } as never,
    deleteRecurring: { execute: vi.fn() } as never,
    runRecurrings: { execute: vi.fn() } as never,
});

const recurringView = (overrides: Partial<RecurringView> = {}): RecurringView => ({
    _id: '507f1f77bcf86cd799439011',
    Type: 'egreso',
    Amount: 350,
    Category: '507f1f77bcf86cd799439022',
    Account: '507f1f77bcf86cd799439099',
    Description: 'Streaming subscription',
    Card: '',
    Frequency: 'mensual',
    DayOfMonth: 15,
    Active: true,
    LastRunYearMonth: null,
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe('createRecurringController', () => {
    describe('getRecurrings', () => {
        it('delegates to findRecurrings.execute with an empty filter and pagination, responds 200', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.findRecurrings.execute).mockResolvedValue([recurringView()]);
            const controller = createRecurringController(useCases);
            const req = { query: {} } as unknown as Request;
            const res = mockRes();

            await controller.getRecurrings(req, res);

            expect(useCases.findRecurrings.execute).toHaveBeenCalledWith({}, { limit: 50, skip: 0 });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 500 on use case error', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.findRecurrings.execute).mockRejectedValue(new Error('boom'));
            const controller = createRecurringController(useCases);
            const req = { query: {} } as unknown as Request;
            const res = mockRes();

            await controller.getRecurrings(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
        });
    });

    describe('getRecurringById', () => {
        it('responds 200 with the recurring view when found', async () => {
            const useCases = makeUseCases();
            const view = recurringView();
            vi.mocked(useCases.findRecurringById.execute).mockResolvedValue(view);
            const controller = createRecurringController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.getRecurringById(req, res);

            expect(useCases.findRecurringById.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(res.json).toHaveBeenCalledWith(view);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 404 with "Recurring not found" when the use case resolves null', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.findRecurringById.execute).mockResolvedValue(null);
            const controller = createRecurringController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.getRecurringById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Recurring not found' });
        });
    });

    describe('createRecurring', () => {
        it('delegates to createRecurring.execute with the raw body and responds 201 with the returned view', async () => {
            const body = {
                Type: 'egreso',
                Amount: 350,
                Category: '507f1f77bcf86cd799439022',
                Account: '507f1f77bcf86cd799439099',
                DayOfMonth: 15,
                Frequency: 'mensual',
            };
            const useCases = makeUseCases();
            const created = recurringView();
            vi.mocked(useCases.createRecurring.execute).mockResolvedValue(created);
            const controller = createRecurringController(useCases);
            const req = { body } as unknown as Request;
            const res = mockRes();

            await controller.createRecurring(req, res);

            expect(useCases.createRecurring.execute).toHaveBeenCalledWith(body);
            expect(res.json).toHaveBeenCalledWith(created);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('responds 500 when the use case throws', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.createRecurring.execute).mockRejectedValue(new Error('Recurring.DayOfMonth must be an integer between 1 and 31'));
            const controller = createRecurringController(useCases);
            const req = { body: {} } as unknown as Request;
            const res = mockRes();

            await controller.createRecurring(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('updateRecurring', () => {
        it('delegates to updateRecurring.execute with id + the raw patch and responds 200 with the updated view', async () => {
            const body = { Amount: 2000 };
            const useCases = makeUseCases();
            const updated = recurringView({ Amount: 2000 });
            vi.mocked(useCases.updateRecurring.execute).mockResolvedValue(updated);
            const controller = createRecurringController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' }, body } as unknown as Request;
            const res = mockRes();

            await controller.updateRecurring(req, res);

            expect(useCases.updateRecurring.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011', body);
            expect(res.json).toHaveBeenCalledWith(updated);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 404 with "Recurring not found" when the use case resolves null', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.updateRecurring.execute).mockResolvedValue(null);
            const controller = createRecurringController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' }, body: {} } as unknown as Request;
            const res = mockRes();

            await controller.updateRecurring(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Recurring not found' });
        });
    });

    describe('deleteRecurring', () => {
        it('delegates to deleteRecurring.execute and responds 200 with { deleted: true, id } on success', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.deleteRecurring.execute).mockResolvedValue(recurringView());
            const controller = createRecurringController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.deleteRecurring(req, res);

            expect(useCases.deleteRecurring.execute).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(res.json).toHaveBeenCalledWith({ deleted: true, id: '507f1f77bcf86cd799439011' });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 404 with "Recurring not found" when the use case resolves null', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.deleteRecurring.execute).mockResolvedValue(null);
            const controller = createRecurringController(useCases);
            const req = { params: { id: '507f1f77bcf86cd799439011' } } as unknown as Request;
            const res = mockRes();

            await controller.deleteRecurring(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Recurring not found' });
        });
    });

    describe('runRecurrings', () => {
        it('delegates to runRecurrings.execute and responds 200 with the created movements', async () => {
            const movements = [{ _id: 'mv1', Type: 'egreso' as const, Amount: 500, Account: 'acc1', Date: new Date() }];
            const useCases = makeUseCases();
            vi.mocked(useCases.runRecurrings.execute).mockResolvedValue(movements);
            const controller = createRecurringController(useCases);
            const req = {} as unknown as Request;
            const res = mockRes();

            await controller.runRecurrings(req, res);

            expect(useCases.runRecurrings.execute).toHaveBeenCalledWith();
            expect(res.json).toHaveBeenCalledWith(movements);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 200 with an empty array when nothing was due (not an error)', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.runRecurrings.execute).mockResolvedValue([]);
            const controller = createRecurringController(useCases);
            const req = {} as unknown as Request;
            const res = mockRes();

            await controller.runRecurrings(req, res);

            expect(res.json).toHaveBeenCalledWith([]);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds with 500 on use case error', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.runRecurrings.execute).mockRejectedValue(new Error('boom'));
            const controller = createRecurringController(useCases);
            const req = {} as unknown as Request;
            const res = mockRes();

            await controller.runRecurrings(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
        });
    });
});
