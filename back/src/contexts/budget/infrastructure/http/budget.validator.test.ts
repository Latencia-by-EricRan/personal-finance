import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bodyValidator, idValidator, statusParamValidator } from './budget.validator';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockReq = (
    body: unknown,
    params: Record<string, string> = {},
    method = 'POST',
): Request => ({ body, params, method } as unknown as Request);

const validCategoryId = '507f1f77bcf86cd799439011';

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
        const req = mockReq(undefined, { id: validCategoryId });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await idValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});

describe('bodyValidator', () => {
    it('rejects a POST body missing Category with 400', async () => {
        const req = mockReq({ Month: 3, Year: 2021, Limit: 100 }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects a POST body missing Month with 400', async () => {
        const req = mockReq({ Category: validCategoryId, Year: 2021, Limit: 100 }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects a POST body missing Year with 400', async () => {
        const req = mockReq({ Category: validCategoryId, Month: 3, Limit: 100 }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects a POST body missing Limit with 400', async () => {
        const req = mockReq({ Category: validCategoryId, Month: 3, Year: 2021 }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects an invalid Category (non Mongo id) with 400', async () => {
        const req = mockReq({ Category: 'not-a-mongo-id', Month: 3, Year: 2021, Limit: 100 }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects an out-of-range Month with 400', async () => {
        const req = mockReq({ Category: validCategoryId, Month: 13, Year: 2021, Limit: 100 }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects an out-of-range Year with 400', async () => {
        const req = mockReq({ Category: validCategoryId, Month: 3, Year: 1999, Limit: 100 }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects a negative Limit with 400', async () => {
        const req = mockReq({ Category: validCategoryId, Month: 3, Year: 2021, Limit: -1 }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects a body with an unexpected key (mass-assignment guard, checkKeys)', async () => {
        const req = mockReq(
            { Category: validCategoryId, Month: 3, Year: 2021, Limit: 100, Evil: 'x' },
            {},
            'POST',
        );
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('passes a valid POST body through to next()', async () => {
        const req = mockReq({ Category: validCategoryId, Month: 3, Year: 2021, Limit: 100 }, {}, 'POST');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('does NOT require Category/Month/Year/Limit on a PUT (partial update)', async () => {
        const req = mockReq({ Limit: 900 }, {}, 'PUT');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('still rejects an out-of-range Month on PUT', async () => {
        const req = mockReq({ Month: 13 }, {}, 'PUT');
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe('statusParamValidator', () => {
    it('rejects an out-of-range month param with 400', async () => {
        const req = mockReq(undefined, { month: '13', year: '2021' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await statusParamValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects an out-of-range year param with 400', async () => {
        const req = mockReq(undefined, { month: '3', year: '1999' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await statusParamValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('passes valid month/year params through to next()', async () => {
        const req = mockReq(undefined, { month: '3', year: '2021' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await statusParamValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});
