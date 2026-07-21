import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bodyValidator, idValidator } from './recurring.validator';

/**
 * Copied 1:1 from the legacy `modules/validators/recurring.validator.test.ts`
 * (design PR1, mirrors budget.validator's PR3 precedent): route table/
 * validation behavior stays byte-identical, only the file's location changes
 * to become `recurring`'s inbound HTTP infrastructure.
 */

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

describe('bodyValidator — Account', () => {
    const bodyWithoutAccount = {
        Type: 'ingreso',
        Amount: 1000,
        Category: '507f1f77bcf86cd799439011',
        DayOfMonth: 1,
    };
    const validPostBody = { ...bodyWithoutAccount, Account: '507f1f77bcf86cd799439099' };

    it('calls next() when Account is a valid MongoId on POST', async () => {
        const req = mockReq({ method: 'POST', body: { ...validPostBody } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 when Account is missing on POST', async () => {
        const req = mockReq({ method: 'POST', body: { ...bodyWithoutAccount } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Account is not a valid MongoId on POST', async () => {
        const req = mockReq({ method: 'POST', body: { ...validPostBody, Account: 'not-a-valid-id' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('calls next() on PUT with a partial body that omits Account', async () => {
        const req = mockReq({ method: 'PUT', body: { Amount: 2000 } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});

describe('bodyValidator — required fields on POST', () => {
    const validPostBody = {
        Type: 'ingreso',
        Amount: 1000,
        Category: '507f1f77bcf86cd799439011',
        Account: '507f1f77bcf86cd799439099',
        DayOfMonth: 1,
    };

    it('rejects with 400 when Type is missing on POST', async () => {
        const { Type, ...body } = validPostBody;
        const req = mockReq({ method: 'POST', body });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Type is not "ingreso" or "egreso"', async () => {
        const req = mockReq({ method: 'POST', body: { ...validPostBody, Type: 'invalid' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Amount is missing on POST', async () => {
        const { Amount, ...body } = validPostBody;
        const req = mockReq({ method: 'POST', body });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Amount is not a float', async () => {
        const req = mockReq({ method: 'POST', body: { ...validPostBody, Amount: 'not-a-number' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Category is missing on POST', async () => {
        const { Category, ...body } = validPostBody;
        const req = mockReq({ method: 'POST', body });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Category is not a valid MongoId', async () => {
        const req = mockReq({ method: 'POST', body: { ...validPostBody, Category: 'not-a-valid-id' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when DayOfMonth is missing on POST', async () => {
        const { DayOfMonth, ...body } = validPostBody;
        const req = mockReq({ method: 'POST', body });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when DayOfMonth is out of the 1-31 range', async () => {
        const req = mockReq({ method: 'POST', body: { ...validPostBody, DayOfMonth: 32 } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects a body with an unexpected key (mass-assignment guard, checkKeys)', async () => {
        const req = mockReq({ method: 'POST', body: { ...validPostBody, Evil: 'x' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('calls next() with a fully valid POST body', async () => {
        const req = mockReq({ method: 'POST', body: { ...validPostBody } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
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
