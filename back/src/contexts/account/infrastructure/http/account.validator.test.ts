import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bodyValidator, idValidator, transferValidator } from './account.validator';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockReq = (body: unknown, params: Record<string, string> = {}, method = 'POST'): Request =>
    ({ body, params, method } as unknown as Request);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('idValidator', () => {
    it('rejects an invalid Mongo id param with 400', async () => {
        const req = mockReq(undefined, { id: 'not-a-mongo-id' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await idValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('passes a valid Mongo id param through to next()', async () => {
        const req = mockReq(undefined, { id: '507f1f77bcf86cd799439011' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await idValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});

describe('bodyValidator', () => {
    it('rejects a POST body missing Name with 400', async () => {
        const req = mockReq({ Type: 'banco' }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects a POST body missing Type with 400', async () => {
        const req = mockReq({ Name: 'Checking' }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects an invalid Type enum value with 400', async () => {
        const req = mockReq({ Name: 'Checking', Type: 'invalid-type' }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects a body with an unexpected key (mass-assignment guard, checkKeys)', async () => {
        const req = mockReq({ Name: 'Checking', Type: 'banco', Evil: 'x' }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('passes a valid POST body through to next()', async () => {
        const req = mockReq({ Name: 'Checking', Type: 'banco' }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('does NOT require Name/Type on a PUT (partial update)', async () => {
        const req = mockReq({ Icon: '💰' }, {}, 'PUT');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('still rejects an invalid Type enum value on PUT', async () => {
        const req = mockReq({ Type: 'invalid-type' }, {}, 'PUT');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe('transferValidator', () => {
    it('coerces a string Date to a Date instance before the validation chain runs, then calls next()', async () => {
        const req = mockReq({
            From: '507f1f77bcf86cd799439011',
            To: '507f1f77bcf86cd799439022',
            Amount: 100,
            Date: '2020-01-01',
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(req.body.Date).toBeInstanceOf(Date);
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects an invalid From MongoId with 400', async () => {
        const req = mockReq({
            From: 'not-a-mongo-id',
            To: '507f1f77bcf86cd799439022',
            Amount: 100,
            Date: '2020-01-01',
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects From === To with 400', async () => {
        const req = mockReq({
            From: '507f1f77bcf86cd799439011',
            To: '507f1f77bcf86cd799439011',
            Amount: 100,
            Date: '2020-01-01',
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects a non-positive Amount with 400', async () => {
        const req = mockReq({
            From: '507f1f77bcf86cd799439011',
            To: '507f1f77bcf86cd799439022',
            Amount: 0,
            Date: '2020-01-01',
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects a missing Date with 400', async () => {
        const req = mockReq({
            From: '507f1f77bcf86cd799439011',
            To: '507f1f77bcf86cd799439022',
            Amount: 100,
        });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await transferValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
