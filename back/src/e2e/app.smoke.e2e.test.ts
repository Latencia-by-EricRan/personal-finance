import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import type { Express } from 'express';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

describe('createApp (smoke)', () => {
    let app: Express;
    let server: Server;

    beforeAll(async () => {
        process.env.JWT_SECRET = 'e2e-smoke-test-secret';
        process.env.AUTH_ROOT_EMAIL = 'e2e-smoke@test.local';
        process.env.AUTH_ROOT_PASSWORD = 'e2e-smoke-test-password';

        const { createApp } = await import('../app');
        app = createApp();
    });

    afterAll(() => {
        server?.close();
    });

    it('builds the app without establishing a MongoDB connection', () => {
        expect(mongoose.connection.readyState).toBe(0);
    });

    it('responds to a request against a mounted route without hanging or throwing', async () => {
        server = app.listen(0);
        const { port } = server.address() as AddressInfo;

        const response = await fetch(`http://127.0.0.1:${port}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.message).toBe('Validation failed');
        expect(body.errors).toEqual(
            expect.arrayContaining(['Email must be a valid email address', 'Password is required']),
        );
    });
});
