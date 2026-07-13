import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import supertest from 'supertest';
import type { Express } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Dummy credentials used only inside the in-memory test harness — never a
 * real/production secret. Reused by every e2e suite via `tokenFor()` so each
 * file does not have to re-implement login.
 */
export const KNOWN_EMAIL = 'e2e-harness@test.local';
export const KNOWN_PASSWORD = 'e2e-harness-password';

interface TestApp {
    app: Express;
    request: ReturnType<typeof supertest>;
    /**
     * Logs in with the harness's known dummy credentials and resolves to the
     * raw JWT string (no `Bearer ` prefix). Callers must set
     * `Authorization: Bearer <token>` themselves.
     */
    tokenFor: () => Promise<string>;
    stop: () => Promise<void>;
}

let mongod: MongoMemoryServer | undefined;

/**
 * Disconnects mongoose and stops the in-memory MongoDB instance started by
 * `startTestApp()`. Idempotent — safe to call more than once (e.g. from both
 * a test body and a trailing `afterAll`).
 */
export const stopTestApp = async (): Promise<void> => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongod) {
        await mongod.stop();
        mongod = undefined;
    }
};

/**
 * Boots a fully isolated app instance for e2e characterization tests:
 * - sets the env vars `auth.config.ts` requires at import time
 * - starts a fresh in-memory MongoDB instance
 * - points `MONGO_CONN_STR`/`MONGO_DB_NAME` at it
 * - dynamically imports `../app` (must happen AFTER the env vars are set)
 * - connects mongoose directly (does NOT import `config/database.ts`, which
 *   has import-time side effects and registers SIGTERM/SIGINT handlers that
 *   call `process.exit(0)`)
 * - builds the app via `createApp()` and wraps it with supertest
 */
export const startTestApp = async (): Promise<TestApp> => {
    process.env.JWT_SECRET = 'e2e-harness-jwt-secret';
    process.env.AUTH_EMAIL = KNOWN_EMAIL;
    process.env.AUTH_PASSWORD_HASH = bcrypt.hashSync(KNOWN_PASSWORD, 10);

    mongod = await MongoMemoryServer.create();
    process.env.MONGO_CONN_STR = mongod.getUri();
    process.env.MONGO_DB_NAME = 'e2e';

    const { createApp } = await import('../app');

    await mongoose.connect(process.env.MONGO_CONN_STR, {
        dbName: process.env.MONGO_DB_NAME,
    });

    const app = createApp();
    const request = supertest(app);

    const tokenFor = async (): Promise<string> => {
        const response = await request
            .post('/auth/login')
            .send({ Email: KNOWN_EMAIL, Password: KNOWN_PASSWORD });

        return response.body.token as string;
    };

    return { app, request, tokenFor, stop: stopTestApp };
};
