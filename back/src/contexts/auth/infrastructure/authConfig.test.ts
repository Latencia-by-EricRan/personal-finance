import bcrypt from 'bcryptjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

const AUTH_EMAIL = 'developer@local.test';
const AUTH_PASSWORD = 'correct-password';

const loadAuthConfig = async () => {
    vi.resetModules();
    return import('./authConfig');
};

describe('authConfig', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        delete process.env.JWT_SECRET;
        delete process.env.JWT_EXPIRES_IN;
        delete process.env.AUTH_ROOT_EMAIL;
        delete process.env.AUTH_ROOT_PASSWORD;
    });

    it('throws at import time when AUTH_ROOT_EMAIL is missing', async () => {
        process.env.JWT_SECRET = 'test-jwt-secret';
        process.env.AUTH_ROOT_PASSWORD = AUTH_PASSWORD;

        await expect(loadAuthConfig()).rejects.toThrow(/AUTH_ROOT_EMAIL/);
    });

    it('builds credentialsConfig with the plaintext email and an internally-hashed password', async () => {
        process.env.JWT_SECRET = 'test-jwt-secret';
        process.env.AUTH_ROOT_EMAIL = AUTH_EMAIL;
        process.env.AUTH_ROOT_PASSWORD = AUTH_PASSWORD;

        const { credentialsConfig } = await loadAuthConfig();

        expect(credentialsConfig.email).toBe(AUTH_EMAIL);
        expect(credentialsConfig.passwordHash).not.toBe(AUTH_PASSWORD);
        await expect(bcrypt.compare(AUTH_PASSWORD, credentialsConfig.passwordHash)).resolves.toBe(true);
    });

    it('builds tokenConfig from JWT_SECRET, defaulting JWT_EXPIRES_IN to 1d when unset', async () => {
        process.env.JWT_SECRET = 'test-jwt-secret';
        process.env.AUTH_ROOT_EMAIL = AUTH_EMAIL;
        process.env.AUTH_ROOT_PASSWORD = AUTH_PASSWORD;

        const { tokenConfig } = await loadAuthConfig();

        expect(tokenConfig).toEqual({ secret: 'test-jwt-secret', expiresIn: '1d' });
    });

    it('honors an explicit JWT_EXPIRES_IN override', async () => {
        process.env.JWT_SECRET = 'test-jwt-secret';
        process.env.JWT_EXPIRES_IN = '2h';
        process.env.AUTH_ROOT_EMAIL = AUTH_EMAIL;
        process.env.AUTH_ROOT_PASSWORD = AUTH_PASSWORD;

        const { tokenConfig } = await loadAuthConfig();

        expect(tokenConfig.expiresIn).toBe('2h');
    });
});
