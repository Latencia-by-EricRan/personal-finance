import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loginValidator } from './auth.validator';

/**
 * New test-first coverage (strict TDD): the legacy
 * `modules/validators/auth.validator.ts` had no dedicated test file, mirroring
 * PR2b's `report.validator.test.ts` precedent (written test-first for a
 * legacy validator that was previously only exercised via e2e). Validation
 * logic itself is a byte-identical port — `Email` must be a valid email,
 * `Password` a non-empty string.
 */

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockReq = (body: Record<string, unknown>): Request => ({ body } as unknown as Request);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('loginValidator', () => {
    it('calls next() for a valid Email/Password body', async () => {
        const req = mockReq({ Email: 'developer@local.test', Password: 'correct-password' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await loginValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 when Email is missing', async () => {
        const req = mockReq({ Password: 'correct-password' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await loginValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Email is not a valid email address', async () => {
        const req = mockReq({ Email: 'not-an-email', Password: 'correct-password' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await loginValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Password is missing', async () => {
        const req = mockReq({ Email: 'developer@local.test' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await loginValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when Password is an empty string', async () => {
        const req = mockReq({ Email: 'developer@local.test', Password: '' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await loginValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
