import { describe, expect, it } from 'vitest';
import { loadEnvironment } from './env.config';

const validEnvironment = {
    MONGO_CONN_STR: 'mongodb://127.0.0.1:27017',
    MONGO_DB_NAME: 'personal_finance',
    PORT: '3000',
    CORS_ORIGINS: 'http://localhost:5173',
    AUTH_ROOT_EMAIL: 'developer@local.test',
    AUTH_ROOT_PASSWORD: 'a-plain-password',
    JWT_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
    JWT_EXPIRES_IN: '1d',
};

describe('loadEnvironment', () => {
    it('parses a valid environment', () => {
        expect(loadEnvironment(validEnvironment)).toMatchObject({
            port: 3000,
            corsOrigins: ['http://localhost:5173'],
        });
    });

    it('rejects an invalid port', () => {
        expect(() => loadEnvironment({ ...validEnvironment, PORT: '70000' })).toThrow('PORT');
    });

    it('rejects an AUTH_ROOT_PASSWORD shorter than 8 characters', () => {
        expect(() => loadEnvironment({ ...validEnvironment, AUTH_ROOT_PASSWORD: 'short' })).toThrow(
            'AUTH_ROOT_PASSWORD must contain at least 8 characters',
        );
    });

    it('rejects a JWT_SECRET shorter than 6 characters', () => {
        expect(() => loadEnvironment({ ...validEnvironment, JWT_SECRET: 'abcde' })).toThrow(
            'JWT_SECRET must contain at least 6 characters',
        );
    });

    it('accepts a JWT_SECRET of exactly 6 characters', () => {
        expect(loadEnvironment({ ...validEnvironment, JWT_SECRET: 'abcdef' })).toMatchObject({
            jwtSecret: 'abcdef',
        });
    });
});
