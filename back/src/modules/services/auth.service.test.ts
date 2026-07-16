import bcrypt from 'bcryptjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const AUTH_EMAIL = 'developer@local.test';
const AUTH_PASSWORD = 'correct-password';

const loadAuthService = async () => {
    vi.resetModules();
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_EXPIRES_IN = '1d';
    process.env.AUTH_ROOT_EMAIL = AUTH_EMAIL;
    process.env.AUTH_ROOT_PASSWORD = AUTH_PASSWORD;

    const { default: AuthService } = await import('./auth.service');
    return AuthService;
};

describe('AuthService.verifyCredentials', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it('accepts the configured email and password (hashed internally by authConfig)', async () => {
        const AuthService = await loadAuthService();

        await expect(AuthService.verifyCredentials(AUTH_EMAIL, AUTH_PASSWORD)).resolves.toBe(true);
    });

    it('rejects an incorrect password without throwing', async () => {
        const AuthService = await loadAuthService();

        await expect(AuthService.verifyCredentials(AUTH_EMAIL, 'wrong-password')).resolves.toBe(false);
    });

    it('rejects an incorrect email without checking the password hash', async () => {
        const compare = vi.spyOn(bcrypt, 'compare');
        const AuthService = await loadAuthService();

        await expect(AuthService.verifyCredentials('other@local.test', AUTH_PASSWORD)).resolves.toBe(false);
        expect(compare).not.toHaveBeenCalled();
    });

    it('does not log credentials or password hashes', async () => {
        const AuthService = await loadAuthService();

        await AuthService.verifyCredentials(AUTH_EMAIL, AUTH_PASSWORD);

        expect(console.log).not.toHaveBeenCalled();
    });
});
