import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { KNOWN_EMAIL, KNOWN_PASSWORD, startTestApp, stopTestApp } from '../test-utils/start-test-app';

describe('Auth e2e', () => {
    let testApp: Awaited<ReturnType<typeof startTestApp>>;

    beforeAll(async () => {
        testApp = await startTestApp();
    });

    afterAll(async () => {
        await stopTestApp();
    });

    it('logs in with correct credentials and returns 200 with a token', async () => {
        const response = await testApp.request
            .post('/auth/login')
            .send({ Email: KNOWN_EMAIL, Password: KNOWN_PASSWORD });

        expect(response.status).toBe(200);
        expect(typeof response.body.token).toBe('string');
        expect(response.body.token.split('.')).toHaveLength(3);
    });

    it('rejects login with an incorrect password with 401', async () => {
        const response = await testApp.request
            .post('/auth/login')
            .send({ Email: KNOWN_EMAIL, Password: 'not-the-right-password' });

        expect(response.status).toBe(401);
    });

    it('rejects a protected route with no Authorization header with 401', async () => {
        const response = await testApp.request.get('/movement/month');

        expect(response.status).toBe(401);
    });

    it('allows a protected route with a valid Bearer token with 200', async () => {
        const token = await testApp.tokenFor();

        const response = await testApp.request
            .get('/movement/month')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
    });
});
