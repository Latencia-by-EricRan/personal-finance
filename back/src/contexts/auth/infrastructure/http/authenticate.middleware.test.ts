import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenService } from '../../application/TokenService';
import { createAuthenticate } from './authenticate.middleware';

/**
 * Behavioral port of the legacy `middlewares/auth.middleware.ts` (design D15):
 * same Bearer-header gating and 401 shape, now built as a factory over
 * `TokenService` instead of the static `AuthService.verifyToken`. This is the
 * highest-blast-radius file in the whole migration — it gates every other
 * context router — so every legacy branch is covered explicitly.
 */

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockReq = (headers: Partial<Request['headers']> = {}): Request =>
    ({ headers } as unknown as Request);

const makeTokenService = (): TokenService => ({ verify: vi.fn() }) as unknown as TokenService;

beforeEach(() => {
    vi.clearAllMocks();
});

describe('createAuthenticate', () => {
    it('rejects with 401 when there is no Authorization header', () => {
        const tokenService = makeTokenService();
        const authenticate = createAuthenticate(tokenService);
        const req = mockReq({});
        const res = mockRes();
        const next: NextFunction = vi.fn();

        authenticate(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        expect(tokenService.verify).not.toHaveBeenCalled();
    });

    it('rejects with 401 when the Authorization header does not start with "Bearer "', () => {
        const tokenService = makeTokenService();
        const authenticate = createAuthenticate(tokenService);
        const req = mockReq({ authorization: 'Basic abc123' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        authenticate(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(tokenService.verify).not.toHaveBeenCalled();
    });

    it('rejects with 401 when tokenService.verify throws (invalid/expired token)', () => {
        const tokenService = makeTokenService();
        vi.mocked(tokenService.verify).mockImplementation(() => {
            throw new Error('invalid signature');
        });
        const authenticate = createAuthenticate(tokenService);
        const req = mockReq({ authorization: 'Bearer a-bad-token' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        authenticate(req, res, next);

        expect(tokenService.verify).toHaveBeenCalledWith('a-bad-token');
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('calls next() when the Bearer token verifies successfully', () => {
        const tokenService = makeTokenService();
        vi.mocked(tokenService.verify).mockReturnValue({ sub: 'developer@local.test' });
        const authenticate = createAuthenticate(tokenService);
        const req = mockReq({ authorization: 'Bearer a-good-token' });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        authenticate(req, res, next);

        expect(tokenService.verify).toHaveBeenCalledWith('a-good-token');
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});
