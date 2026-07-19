import bcrypt from 'bcryptjs';
import { CredentialsConfig, TokenConfig } from '../application/ports/AuthConfig';

/**
 * Relocated, unchanged env→bcrypt.hashSync seam (design D14), formerly
 * `src/config/auth.config.ts`. Still the plaintext-env/internal-bcrypt-hash
 * scheme landed in commit `196b708`: the root password is read as plaintext
 * from `AUTH_ROOT_PASSWORD` and hashed once at import time, never persisted
 * or logged in plaintext. Not yet consumed anywhere — `contexts/auth` is
 * unwired until PR3b, so this module has zero effect on the live app.
 */
const required = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`[Auth] Missing required environment variable: ${key}`);
    return value;
};

export const credentialsConfig: CredentialsConfig = {
    email: required('AUTH_ROOT_EMAIL'),
    passwordHash: bcrypt.hashSync(required('AUTH_ROOT_PASSWORD'), 10),
};

export const tokenConfig: TokenConfig = {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
};
