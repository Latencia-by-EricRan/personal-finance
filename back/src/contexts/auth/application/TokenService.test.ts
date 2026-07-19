import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { TokenService } from './TokenService';

const SECRET = 'test-jwt-secret';
const SUBJECT = 'developer@local.test';

const buildService = (expiresIn = '1d'): TokenService => new TokenService({ secret: SECRET, expiresIn });

describe('TokenService', () => {
    describe('sign', () => {
        it('signs a JWT carrying the given subject, verifiable with the configured secret', () => {
            const service = buildService();

            const token = service.sign(SUBJECT);
            const payload = jwt.verify(token, SECRET);

            expect(typeof payload).not.toBe('string');
            expect((payload as jwt.JwtPayload).sub).toBe(SUBJECT);
        });

        it('applies the configured expiresIn to the issued token', () => {
            const service = buildService('1h');

            const token = service.sign(SUBJECT);
            const payload = jwt.decode(token) as jwt.JwtPayload;

            expect(payload.exp).toBeDefined();
            expect(payload.exp! - payload.iat!).toBe(3600);
        });
    });

    describe('verify', () => {
        it('returns the decoded payload for a token signed with the same secret', () => {
            const service = buildService();
            const token = service.sign(SUBJECT);

            const payload = service.verify(token);

            expect((payload as jwt.JwtPayload).sub).toBe(SUBJECT);
        });

        it('throws for a token signed with a different secret', () => {
            const service = buildService();
            const foreignToken = jwt.sign({ sub: SUBJECT }, 'a-different-secret');

            expect(() => service.verify(foreignToken)).toThrow();
        });

        it('throws TokenExpiredError for an expired token', () => {
            const service = buildService();
            const expiredToken = jwt.sign({ sub: SUBJECT }, SECRET, { expiresIn: -1 });

            expect(() => service.verify(expiredToken)).toThrow(jwt.TokenExpiredError);
        });

        it('throws JsonWebTokenError for a malformed (non-JWT) token', () => {
            const service = buildService();

            expect(() => service.verify('not-a-real-jwt')).toThrow(jwt.JsonWebTokenError);
        });

        it('throws for a token with a tampered payload segment', () => {
            const service = buildService();
            const token = service.sign(SUBJECT);
            const [header, , signature] = token.split('.');
            const tamperedPayload = Buffer.from(JSON.stringify({ sub: 'attacker@evil.test' })).toString('base64url');
            const tamperedToken = `${header}.${tamperedPayload}.${signature}`;

            expect(() => service.verify(tamperedToken)).toThrow(jwt.JsonWebTokenError);
        });
    });
});
