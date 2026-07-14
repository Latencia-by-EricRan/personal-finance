import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MovementGateway } from '../application/ports/MovementGateway';
import { InMemoryMovementGateway } from './InMemoryMovementGateway';
import { MongooseMovementGateway } from './MongooseMovementGateway';
import { MovementModel } from '../../movement';

/**
 * Shared port contract for `MovementGateway` (task 2b.4) — run against BOTH
 * `InMemoryMovementGateway` and the real `MongooseMovementGateway` (via
 * `mongodb-memory-server`, no mocked Mongoose calls, `MovementModel` reached
 * only via the movement barrel), same principle
 * `AccountRepository.contract.test.ts`/`MovementRepository.contract.test.ts`
 * established.
 */
interface GatewayLifecycle {
    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
    beforeEach?: () => Promise<void>;
}

const accountId = (): string => new Types.ObjectId().toString();

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

        it('createTransferMovement persists and returns a view with _id and TransferId', async () => {
            const gateway = makeGateway();
            const account = accountId();

            const created = await gateway.createTransferMovement({
                Type: 'egreso',
                Account: account,
                Amount: 50,
                Date: new Date(2026, 6, 1),
                TransferId: 'transfer-1',
            });

            expect(created._id).toBeTruthy();
            expect(created.Type).toBe('egreso');
            expect(created.Amount).toBe(50);
            expect(created.TransferId).toBe('transfer-1');
        });

        it('findByAccount returns rows scoped to the given account', async () => {
            const gateway = makeGateway();
            const account = accountId();
            const otherAccount = accountId();

            await gateway.createTransferMovement({
                Type: 'ingreso',
                Account: account,
                Amount: 100,
                Date: new Date(2026, 6, 2),
                TransferId: 'transfer-2',
            });
            await gateway.createTransferMovement({
                Type: 'egreso',
                Account: otherAccount,
                Amount: 999,
                Date: new Date(2026, 6, 2),
                TransferId: 'transfer-2',
            });

            const rows = await gateway.findByAccount(account);

            expect(rows).toHaveLength(1);
            expect(rows[0]).toEqual({ Type: 'ingreso', Amount: 100 });
        });

        it('deleteMovement removes the movement; a subsequent findByAccount excludes it', async () => {
            const gateway = makeGateway();
            const account = accountId();
            const created = await gateway.createTransferMovement({
                Type: 'egreso',
                Account: account,
                Amount: 30,
                Date: new Date(2026, 6, 3),
                TransferId: 'transfer-3',
            });

            await gateway.deleteMovement(created._id);

            const rows = await gateway.findByAccount(account);
            expect(rows).toHaveLength(0);
        });

        it('deleteMovement on a non-existent id is a no-op, not a throw', async () => {
            const gateway = makeGateway();

            await expect(gateway.deleteMovement(accountId())).resolves.not.toThrow();
        });
    });
};

runMovementGatewayContract('InMemoryMovementGateway', () => new InMemoryMovementGateway());

let mongod: MongoMemoryServer;

runMovementGatewayContract('MongooseMovementGateway', () => new MongooseMovementGateway(), {
    beforeAll: async () => {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri(), { dbName: 'account-movement-gateway-contract' });
    },
    afterAll: async () => {
        await mongoose.disconnect();
        await mongod.stop();
    },
    beforeEach: async () => {
        await MovementModel.deleteMany({});
    },
});
