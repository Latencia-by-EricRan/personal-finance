import { afterAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { startTestApp } from './start-test-app';

describe('startTestApp / stopTestApp harness', () => {
    let stop: () => Promise<void>;

    afterAll(async () => {
        await stop?.();
    });

    it('boots an app backed by an in-memory MongoDB and issues a working JWT via tokenFor()', async () => {
        const testApp = await startTestApp();
        stop = testApp.stop;

        expect(mongoose.connection.readyState).toBe(1);

        const token = await testApp.tokenFor();

        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3);

        const response = await testApp.request
            .get('/movement/month')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).not.toBe(401);
    });

    it('stop() disconnects mongoose cleanly and is safe to call again (idempotent)', async () => {
        await stop();
        expect(mongoose.connection.readyState).toBe(0);
        await expect(stop()).resolves.not.toThrow();
    });
});
