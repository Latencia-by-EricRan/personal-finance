import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addUpdateValidator, paramBodyValidator } from './movement.validator';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockReq = (overrides: Partial<Request>): Request => ({ ...overrides } as unknown as Request);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('addUpdateValidator — Account', () => {
    it('rejects with 400 when Account is missing on POST', async () => {
        const req = mockReq({
            method: 'POST',
            body: { Type: 'ingreso', Amount: 100, Category: '507f1f77bcf86cd799439011', Date: '2026-01-01' },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await addUpdateValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Account is not a valid MongoId on POST', async () => {
        const req = mockReq({
            method: 'POST',
            body: {
                Type: 'ingreso',
                Amount: 100,
                Category: '507f1f77bcf86cd799439011',
                Account: 'not-a-valid-id',
                Date: '2026-01-01',
            },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await addUpdateValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('calls next() when Account is a valid MongoId on POST', async () => {
        const req = mockReq({
            method: 'POST',
            body: {
                Type: 'ingreso',
                Amount: 100,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439099',
                Date: '2026-01-01',
            },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await addUpdateValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('calls next() on PUT with a partial body that omits Account', async () => {
        const req = mockReq({
            method: 'PUT',
            params: { id: '507f1f77bcf86cd799439011' },
            body: { Amount: 200, Date: '2026-01-01' },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await addUpdateValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 when Account on PUT is present but not a valid MongoId', async () => {
        const req = mockReq({
            method: 'PUT',
            params: { id: '507f1f77bcf86cd799439011' },
            body: { Account: 'not-a-valid-id', Date: '2026-01-01' },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await addUpdateValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe('addUpdateValidator — TransferId whitelist', () => {
    it('rejects with 400 when a client tries to set TransferId on POST', async () => {
        const req = mockReq({
            method: 'POST',
            body: {
                Type: 'ingreso',
                Amount: 100,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439099',
                Date: '2026-01-01',
                TransferId: 'client-supplied-transfer-id',
            },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await addUpdateValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when a client tries to set TransferId on PUT', async () => {
        const req = mockReq({
            method: 'PUT',
            params: { id: '507f1f77bcf86cd799439011' },
            body: { Amount: 200, Date: '2026-01-01', TransferId: 'client-supplied-transfer-id' },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await addUpdateValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('calls next() on POST with the full legitimate whitelist (Type, Amount, Category, Account, Date, Description, Card)', async () => {
        const req = mockReq({
            method: 'POST',
            body: {
                Type: 'ingreso',
                Amount: 100,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439099',
                Date: '2026-01-01',
                Description: 'Groceries',
                Card: 'visa',
            },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await addUpdateValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});

describe('addUpdateValidator — Date', () => {
    it('calls next() with no error on PUT when Date is omitted from a partial update body', async () => {
        const req = mockReq({
            method: 'PUT',
            params: { id: '507f1f77bcf86cd799439011' },
            body: { Amount: 200 },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await addUpdateValidator(req, res, next);

        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('responds with 400 (not an unhandled next(error)) when Date is invalid on POST', async () => {
        const req = mockReq({
            method: 'POST',
            body: {
                Type: 'ingreso',
                Amount: 100,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439099',
                Date: 'not-a-date',
            },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await addUpdateValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('responds with 400 (not an unhandled next(error)) when Date is present but invalid on PUT', async () => {
        const req = mockReq({
            method: 'PUT',
            params: { id: '507f1f77bcf86cd799439011' },
            body: { Amount: 200, Date: 'not-a-date' },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await addUpdateValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe('paramBodyValidator — filter body', () => {
    it('calls next() when a GET request carries no body (no filters means match the whole date range)', async () => {
        const req = mockReq({
            method: 'GET',
            params: { startDate: '2026-01-01', endDate: '2026-01-31' },
            body: {},
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await paramBodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 when the body contains a key outside the filter whitelist', async () => {
        const req = mockReq({
            method: 'GET',
            params: { startDate: '2026-01-01', endDate: '2026-01-31' },
            body: { NotAFilter: 'value' },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await paramBodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
