import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthUseCases } from '../../application/AuthUseCases';
import { createAuthController } from './auth.controller';

/**
 * New test-first coverage (strict TDD): the legacy
 * `modules/controllers/auth.controller.ts` had no dedicated test file (only
 * `auth.service.test.ts` + `auth.e2e.test.ts` covered it). Byte-identical
 * response shapes/status codes: 200 `{token, expiresIn}` on success, 401
 * `{message: 'Invalid credentials'}` on bad credentials, 500 on unexpected
 * errors.
 */

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const makeUseCases = (): AuthUseCases => ({
    credentialsChecker: { verify: vi.fn() } as never,
    tokenService: { sign: vi.fn(), verify: vi.fn(), expiresIn: '1d' } as never,
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe('createAuthController', () => {
    describe('login', () => {
        it('responds 200 with {token, expiresIn} on valid credentials, signing the token for the request Email', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.credentialsChecker.verify).mockResolvedValue(true);
            vi.mocked(useCases.tokenService.sign).mockReturnValue('signed.jwt.token');
            const controller = createAuthController(useCases);
            const req = { body: { Email: 'developer@local.test', Password: 'correct-password' } } as unknown as Request;
            const res = mockRes();

            await controller.login(req, res);

            expect(useCases.credentialsChecker.verify).toHaveBeenCalledWith('developer@local.test', 'correct-password');
            expect(useCases.tokenService.sign).toHaveBeenCalledWith('developer@local.test');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ token: 'signed.jwt.token', expiresIn: '1d' });
        });

        it('responds 401 with "Invalid credentials" when credentialsChecker.verify resolves false, without signing a token', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.credentialsChecker.verify).mockResolvedValue(false);
            const controller = createAuthController(useCases);
            const req = { body: { Email: 'developer@local.test', Password: 'wrong-password' } } as unknown as Request;
            const res = mockRes();

            await controller.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
            expect(useCases.tokenService.sign).not.toHaveBeenCalled();
        });

        it('responds 500 when credentialsChecker.verify throws', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.credentialsChecker.verify).mockRejectedValue(new Error('boom'));
            const controller = createAuthController(useCases);
            const req = { body: { Email: 'developer@local.test', Password: 'correct-password' } } as unknown as Request;
            const res = mockRes();

            await controller.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
        });
    });
});
