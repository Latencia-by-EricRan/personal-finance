import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bodyValidator, idValidator, statusParamValidator } from './budget.validator';

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

describe('bodyValidator', () => {
    it('calls next() when Category/Month/Year/Limit are valid on POST', async () => {
        const req = mockReq({
            method: 'POST',
            body: { Category: '507f1f77bcf86cd799439011', Month: 7, Year: 2026, Limit: 1000 },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 when Category is missing on POST', async () => {
        const req = mockReq({ method: 'POST', body: { Month: 7, Year: 2026, Limit: 1000 } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Category is not a valid MongoId', async () => {
        const req = mockReq({
            method: 'POST',
            body: { Category: 'not-a-valid-id', Month: 7, Year: 2026, Limit: 1000 },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Month is out of range', async () => {
        const req = mockReq({
            method: 'POST',
            body: { Category: '507f1f77bcf86cd799439011', Month: 13, Year: 2026, Limit: 1000 },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Year is out of range', async () => {
        const req = mockReq({
            method: 'POST',
            body: { Category: '507f1f77bcf86cd799439011', Month: 7, Year: 1999, Limit: 1000 },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Limit is negative', async () => {
        const req = mockReq({
            method: 'POST',
            body: { Category: '507f1f77bcf86cd799439011', Month: 7, Year: 2026, Limit: -1 },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when the body contains a key outside the whitelist', async () => {
        const req = mockReq({
            method: 'POST',
            body: { Category: '507f1f77bcf86cd799439011', Month: 7, Year: 2026, Limit: 1000, Unknown: 'nope' },
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('calls next() on PUT with only a partial body (Limit only)', async () => {
        const req = mockReq({ method: 'PUT', body: { Limit: 500 } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 on PUT with an empty body (no parameters to update)', async () => {
        const req = mockReq({ method: 'PUT', body: {} });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe('idValidator', () => {
    it('calls next() for a valid MongoId', async () => {
        const req = mockReq({ params: { id: '507f1f77bcf86cd799439011' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await idValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 for an invalid MongoId', async () => {
        const req = mockReq({ params: { id: 'not-a-valid-id' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await idValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe('statusParamValidator', () => {
    it('calls next() for valid month/year params', async () => {
        const req = mockReq({ params: { month: '7', year: '2026' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await statusParamValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 when month is out of range', async () => {
        const req = mockReq({ params: { month: '13', year: '2026' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await statusParamValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when year is out of range', async () => {
        const req = mockReq({ params: { month: '7', year: '1999' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await statusParamValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
