import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MovementGateway } from '../application/ports/MovementGateway';
import { InMemoryMovementGateway } from './InMemoryMovementGateway';
import { MongooseMovementGateway } from './MongooseMovementGateway';
import { MovementModel } from '../../movement';

/**
 * Shared port contract for `recurring`'s WRITE `MovementGateway` (task 1.6) —
 * run against BOTH `InMemoryMovementGateway` and the real
 * `MongooseMovementGateway` (via `mongodb-memory-server`, no mocked Mongoose
 * calls, `MovementModel` reached only via the movement barrel), same
 * principle `account/infrastructure/MovementGateway.contract.test.ts`
 * established (design D12 — account's read+write precedent).
 */
interface GatewayLifecycle {
    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
    beforeEach?: () => Promise<void>;
}

const refId = (): string => new Types.ObjectId().toString();

const runMovementGatewayContract = (
    suiteName: string,
    makeGateway: () => MovementGateway,
    lifecycle: GatewayLifecycle = {},
): void => {
    describe(suiteName, () => {
        if (lifecycle.beforeAll) {
            beforeAll(lifecycle.beforeAll);
        }
        if (lifecycle.afterAll) {
            afterAll(lifecycle.afterAll);
        }
        if (lifecycle.beforeEach) {
            beforeEach(lifecycle.beforeEach);
        }

        it('createMovement persists and returns a view with _id', async () => {
            const gateway = makeGateway();

            const created = await gateway.createMovement({
                Type: 'egreso',
                Amount: 500,
                Category: refId(),
                Account: refId(),
                Description: 'Rent',
                Card: 'visa',
                Date: new Date(2026, 6, 5),
            });

            expect(created._id).toBeTruthy();
            expect(created.Type).toBe('egreso');
            expect(created.Amount).toBe(500);
            expect(created.Description).toBe('Rent');
            expect(created.Card).toBe('visa');
            expect(created.Date).toEqual(new Date(2026, 6, 5));
        });

        it('createMovement without Description/Card still persists (optional fields)', async () => {
            const gateway = makeGateway();

            const created = await gateway.createMovement({
                Type: 'ingreso',
                Amount: 1000,
                Category: refId(),
                Account: refId(),
                Date: new Date(2026, 6, 1),
            });

            expect(created._id).toBeTruthy();
            expect(created.Type).toBe('ingreso');
            expect(created.Amount).toBe(1000);
        });
    });
};

runMovementGatewayContract('InMemoryMovementGateway', () => new InMemoryMovementGateway());

let mongod: MongoMemoryServer;

runMovementGatewayContract('MongooseMovementGateway', () => new MongooseMovementGateway(), {
    beforeAll: async () => {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri(), { dbName: 'recurring-movement-gateway-contract' });
    },
    afterAll: async () => {
        await mongoose.disconnect();
        await mongod.stop();
    },
    beforeEach: async () => {
        await MovementModel.deleteMany({});
    },
});
