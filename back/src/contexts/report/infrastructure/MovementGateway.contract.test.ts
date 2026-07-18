import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MovementGateway } from '../application/ports/MovementGateway';
import { InMemoryMovementGateway } from './InMemoryMovementGateway';
import { MongooseMovementGateway } from './MongooseMovementGateway';
import { MovementModel } from '../../movement';

/**
 * Shared port contract for report's `MovementGateway` (task 3.2), run
 * against BOTH `InMemoryMovementGateway` and the real
 * `MongooseMovementGateway` (via `mongodb-memory-server`, no `vi.mock`,
 * `MovementModel` reached only via the movement barrel) — same principle
 * `budget`'s own `MovementGateway.contract.test.ts` established.
 *
 * `findEgresoWithRefs`' Category-ref/date-window/Type filtering is asserted
 * here; the CategoryGateway join (dangling-ref resolution) is a separate
 * contract in `CategoryGateway.contract.test.ts`, composed at the
 * `GetReportByCategory` use-case level (design D13).
 */
interface SeedMovementInput {
    Type: 'ingreso' | 'egreso';
    Category: string | null;
    Amount: number;
    Date: Date;
}

interface GatewayLifecycle {
    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
    beforeEach?: () => Promise<void>;
}

const objectId = (): string => new Types.ObjectId().toString();

const runMovementGatewayContract = (
    suiteName: string,
    makeGateway: () => MovementGateway,
    insertMovement: (gateway: MovementGateway, input: SeedMovementInput) => Promise<void>,
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

        describe('findEgresoWithRefs', () => {
            it('returns egreso rows carrying their bare Category ref within the date window', async () => {
                const gateway = makeGateway();
                const category = objectId();

                await insertMovement(gateway, {
                    Type: 'egreso', Category: category, Amount: 40, Date: new Date(2026, 6, 15),
                });

                const rows = await gateway.findEgresoWithRefs(new Date(2026, 6, 1), new Date(2026, 6, 31));

                expect(rows).toHaveLength(1);
                expect(rows[0]).toEqual({ Amount: 40, Category: category });
            });

            it('excludes ingreso movements from the same date window', async () => {
                const gateway = makeGateway();
                const category = objectId();

                await insertMovement(gateway, {
                    Type: 'ingreso', Category: category, Amount: 999, Date: new Date(2026, 6, 10),
                });

                const rows = await gateway.findEgresoWithRefs(new Date(2026, 6, 1), new Date(2026, 6, 31));

                expect(rows).toHaveLength(0);
            });

            it('excludes egreso movements outside the date window', async () => {
                const gateway = makeGateway();
                const category = objectId();

                await insertMovement(gateway, {
                    Type: 'egreso', Category: category, Amount: 15, Date: new Date(2026, 7, 1),
                });

                const rows = await gateway.findEgresoWithRefs(new Date(2026, 6, 1), new Date(2026, 6, 31));

                expect(rows).toHaveLength(0);
            });

            it('includes egreso movements dated exactly at the inclusive window boundaries', async () => {
                const gateway = makeGateway();
                const category = objectId();
                const gteDate = new Date(2026, 6, 1);
                const lteDate = new Date(2026, 6, 31);

                await insertMovement(gateway, { Type: 'egreso', Category: category, Amount: 5, Date: gteDate });
                await insertMovement(gateway, { Type: 'egreso', Category: category, Amount: 7, Date: lteDate });

                const rows = await gateway.findEgresoWithRefs(gteDate, lteDate);

                expect(rows).toHaveLength(2);
                expect(rows.reduce((acc, row) => acc + row.Amount, 0)).toBe(12);
            });
        });

        describe('findByDateRange', () => {
            it('returns Type/Amount rows for both ingreso and egreso movements within the window', async () => {
                const gateway = makeGateway();
                const category = objectId();

                await insertMovement(gateway, {
                    Type: 'ingreso', Category: category, Amount: 100, Date: new Date(2026, 6, 5),
                });
                await insertMovement(gateway, {
                    Type: 'egreso', Category: category, Amount: 40, Date: new Date(2026, 6, 20),
                });

                const rows = await gateway.findByDateRange(new Date(2026, 6, 1), new Date(2026, 6, 31));

                expect(rows).toHaveLength(2);
                expect(rows).toEqual(expect.arrayContaining([
                    { Type: 'ingreso', Amount: 100 },
                    { Type: 'egreso', Amount: 40 },
                ]));
            });

            it('excludes movements outside the date window', async () => {
                const gateway = makeGateway();
                const category = objectId();

                await insertMovement(gateway, {
                    Type: 'egreso', Category: category, Amount: 15, Date: new Date(2026, 7, 1),
                });

                const rows = await gateway.findByDateRange(new Date(2026, 6, 1), new Date(2026, 6, 31));

                expect(rows).toHaveLength(0);
            });
        });
    });
};

runMovementGatewayContract(
    'InMemoryMovementGateway',
    () => new InMemoryMovementGateway(),
    async (gateway, input) => {
        (gateway as InMemoryMovementGateway).seed(input);
    },
);

let mongod: MongoMemoryServer;

runMovementGatewayContract(
    'MongooseMovementGateway',
    () => new MongooseMovementGateway(),
    async (_gateway, input) => {
        await MovementModel.create({
            Type: input.Type,
            Category: input.Category ?? undefined,
            Account: objectId(),
            Amount: input.Amount,
            Date: input.Date,
        });
    },
    {
        beforeAll: async () => {
            mongod = await MongoMemoryServer.create();
            await mongoose.connect(mongod.getUri(), { dbName: 'report-movement-gateway-contract' });
        },
        afterAll: async () => {
            await mongoose.disconnect();
            await mongod.stop();
        },
        beforeEach: async () => {
            await MovementModel.deleteMany({});
        },
    },
);
