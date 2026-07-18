import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bodyValidator, idValidator, manySaveValidator } from './category.validator';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockReq = (body: unknown, params: Record<string, string> = {}): Request =>
    ({ body, params } as unknown as Request);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('bodyValidator', () => {
    it('rejects a single body containing an unexpected key with 400 (mass-assignment guard, checkKeys)', async () => {
        const req = mockReq({ Name: 'Food', Description: 'Groceries', Type: 'variable', Evil: 'x' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('passes a valid single body through to next()', async () => {
        const req = mockReq({ Name: 'Food', Description: 'Groceries', Type: 'variable' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('passes a valid single body including Color through to next() (Color is whitelisted)', async () => {
        const req = mockReq({ Name: 'Food', Description: 'Groceries', Type: 'variable', Color: 'green' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects an array whose item is missing a required field with 400', async () => {
        const body = [
            { Name: 'Food', Description: 'Groceries', Type: 'variable' },
            { Name: '', Description: 'Bad', Type: 'variable' },
        ];
        const req = mockReq(body);
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('no longer rejects duplicate Tag/Name keys itself — passes through to next() (dedup moved to BulkSaveCategory, design D2)', async () => {
        const body = [
            { Name: 'Food', Description: 'Groceries', Type: 'variable' },
            { Name: 'Food', Description: 'Other groceries', Type: 'fijo' },
        ];
        const req = mockReq(body);
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('passes an array body where items with and without Color both validate successfully', async () => {
        const body = [
            { Name: 'Food', Description: 'Groceries', Type: 'variable', Color: 'red' },
            { Name: 'Rent', Description: 'Monthly rent', Type: 'fijo' },
        ];
        const req = mockReq(body);
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});

describe('manySaveValidator', () => {
    it('runs the same per-item validation as bodyValidator and passes valid batches through', async () => {
        const req = mockReq([{ Name: 'Food', Description: 'Groceries', Type: 'variable' }]);
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await manySaveValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    it('rejects a non-array body with 400', async () => {
        const req = mockReq({ Name: 'Food', Description: 'Groceries', Type: 'variable' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await manySaveValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
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
