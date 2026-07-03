import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bodyValidator, idValidator, transferValidator } from './account.validator';

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
    it('calls next() when Name/Type/Currency/Icon are valid', async () => {
        const req = mockReq({ body: { Name: 'Cash', Type: 'efectivo', Currency: 'ARS', Icon: '💵' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 when Type is not one of the allowed enum values', async () => {
        const req = mockReq({ body: { Name: 'Cash', Type: 'crypto' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Name is missing on POST (create path unaffected by partial-PUT support)', async () => {
        const req = mockReq({ method: 'POST', body: { Type: 'efectivo' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when the body contains a key outside the whitelist', async () => {
        const req = mockReq({ body: { Name: 'Cash', Type: 'efectivo', Unknown: 'nope' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Name is missing on POST', async () => {
        const req = mockReq({ method: 'POST', body: { Type: 'efectivo' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('calls next() on PUT with only a partial body (Icon only)', async () => {
        const req = mockReq({ method: 'PUT', body: { Icon: '🏦' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('calls next() on PUT with only Archived', async () => {
        const req = mockReq({ method: 'PUT', body: { Archived: false } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 when Archived is not a boolean', async () => {
        const req = mockReq({ method: 'PUT', body: { Archived: 'nope' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Currency is an empty string on POST', async () => {
        const req = mockReq({ method: 'POST', body: { Name: 'Cash', Type: 'efectivo', Currency: '' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Currency is an empty string on PUT', async () => {
        const req = mockReq({ method: 'PUT', body: { Currency: '' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('calls next() when Currency is entirely absent from the body', async () => {
        const req = mockReq({ method: 'PUT', body: { Icon: '💵' } });
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

describe('transferValidator', () => {
    const validBody = {
        From: '507f1f77bcf86cd799439001',
        To: '507f1f77bcf86cd799439002',
        Amount: 500,
        Date: '2026-01-01',
    };

    it('calls next() with a fully valid transfer body', async () => {
        const req = mockReq({ body: { ...validBody } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 when From is not a valid MongoId', async () => {
        const req = mockReq({ body: { ...validBody, From: 'not-a-valid-id' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when To is not a valid MongoId', async () => {
        const req = mockReq({ body: { ...validBody, To: 'not-a-valid-id' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Amount is not positive', async () => {
        const req = mockReq({ body: { ...validBody, Amount: 0 } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Date is missing', async () => {
        const req = mockReq({ body: { ...validBody, Date: undefined } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Date is not a valid date string', async () => {
        const req = mockReq({ body: { ...validBody, Date: 'not-a-date' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('converts a valid string Date into an actual Date object before calling next()', async () => {
        const req = mockReq({ body: { ...validBody, Date: '2026-01-01' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body.Date).toBeInstanceOf(Date);
    });

    it('rejects with 400 when From === To', async () => {
        const req = mockReq({ body: { ...validBody, To: validBody.From } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('calls next() when Description is a valid optional string', async () => {
        const req = mockReq({ body: { ...validBody, Description: 'Rent split' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });
});
