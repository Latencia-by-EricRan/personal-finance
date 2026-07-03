import { describe, expect, it } from 'vitest';
import { loadEnvironment } from './env.config';

const validEnvironment = {
    MONGO_CONN_STR: 'mongodb://127.0.0.1:27017',
    MONGO_DB_NAME: 'personal_finance',
    PORT: '3000',
    CORS_ORIGINS: 'http://localhost:5173',
    AUTH_EMAIL: 'developer@local.test',
    AUTH_PASSWORD_HASH: '$2b$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNO123456789',
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

    it('rejects a non-bcrypt password hash', () => {
        expect(() => loadEnvironment({ ...validEnvironment, AUTH_PASSWORD_HASH: 'plain-text' })).toThrow('bcrypt');
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
