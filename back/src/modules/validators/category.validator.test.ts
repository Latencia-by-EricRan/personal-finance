import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bodyValidator } from './category.validator';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockReq = (body: unknown): Request => ({ body } as unknown as Request);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('validateArrayBody (via bodyValidator) — duplicate Tag/Name rejection', () => {
    it('rejects an array with two items sharing the same Name (no Tag) with 400', async () => {
        const body = [
            { Name: 'Food', Description: 'Groceries', Type: 'variable' },
            { Name: 'Food', Description: 'Other groceries', Type: 'fijo' },
        ];
        const req = mockReq(body);
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await bodyValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Validation failed',
                errors: expect.arrayContaining([expect.stringContaining('Food')]),
            }),
        );
    });

    it('passes through to next() when all items have distinct Tag/Name keys', async () => {
        const body = [
            { Name: 'Food', Description: 'Groceries', Type: 'variable' },
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
