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
 * `mongodb-memory-server`, no `vi.mock`, `MovementModel` reached only via the
 * movement barrel), same principle `account`'s own
 * `MovementGateway.contract.test.ts` established.
 *
 * Unlike account's gateway, budget's port is READ-ONLY (`findEgresoAmounts`
 * only) — there is no write method on the interface to seed fixture data
 * through. Each suite supplies its own `insertMovement` seeding strategy:
 * the Mongoose suite writes through the real `MovementModel`; the in-memory
 * suite uses `InMemoryMovementGateway#seed`, a test-only helper that is
 * deliberately NOT part of the `MovementGateway` interface.
 *
 * NOTE: this asserts `findEgresoAmounts`' Category/date-window/Type
 * filtering only — `.populate('Category')` on the BUDGET side is
 * Mongoose-specific and pinned by the PR3 characterization e2e, not here
 * (design D2/D6). `Category` here is always a bare id string on both
 * adapters, matching what `GetBudgetStatus` passes in.
 */
interface SeedMovementInput {
    Type: 'ingreso' | 'egreso';
    Category: string;
    Amount: number;
    Date: Date;
}

interface GatewayLifecycle {
    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
    beforeEach?: () => Promise<void>;
}

// Generic id generator — used for both the Category under test and any
// other required-but-irrelevant ObjectId ref (e.g. Movement's `Account`
// field in the Mongoose seeding path below).
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

        it('findEgresoAmounts returns egreso rows for the category within the date window', async () => {
            const gateway = makeGateway();
            const category = objectId();

            await insertMovement(gateway, {
                Type: 'egreso', Category: category, Amount: 40, Date: new Date(2026, 6, 15),
            });

            const rows = await gateway.findEgresoAmounts(category, new Date(2026, 6, 1), new Date(2026, 6, 31));

            expect(rows).toHaveLength(1);
            expect(rows[0]).toEqual({ Amount: 40 });
        });

        it('includes egreso movements dated exactly at the inclusive window boundaries', async () => {
            const gateway = makeGateway();
            const category = objectId();
            const gteDate = new Date(2026, 6, 1);
            const lteDate = new Date(2026, 6, 31);

            await insertMovement(gateway, { Type: 'egreso', Category: category, Amount: 5, Date: gteDate });
            await insertMovement(gateway, { Type: 'egreso', Category: category, Amount: 7, Date: lteDate });

            const rows = await gateway.findEgresoAmounts(category, gteDate, lteDate);

            expect(rows).toHaveLength(2);
            expect(rows.reduce((acc, row) => acc + row.Amount, 0)).toBe(12);
        });

        it('excludes ingreso movements for the same category/date-window', async () => {
            const gateway = makeGateway();
            const category = objectId();

            await insertMovement(gateway, {
                Type: 'ingreso', Category: category, Amount: 999, Date: new Date(2026, 6, 10),
            });

            const rows = await gateway.findEgresoAmounts(category, new Date(2026, 6, 1), new Date(2026, 6, 31));

            expect(rows).toHaveLength(0);
        });

        it('excludes egreso movements outside the date window', async () => {
            const gateway = makeGateway();
            const category = objectId();

            await insertMovement(gateway, {
                Type: 'egreso', Category: category, Amount: 15, Date: new Date(2026, 7, 1),
            });

            const rows = await gateway.findEgresoAmounts(category, new Date(2026, 6, 1), new Date(2026, 6, 31));

            expect(rows).toHaveLength(0);
        });

        it('excludes egreso movements for a different category', async () => {
            const gateway = makeGateway();
            const category = objectId();
            const otherCategory = objectId();

            await insertMovement(gateway, {
                Type: 'egreso', Category: otherCategory, Amount: 25, Date: new Date(2026, 6, 15),
            });

            const rows = await gateway.findEgresoAmounts(category, new Date(2026, 6, 1), new Date(2026, 6, 31));

            expect(rows).toHaveLength(0);
        });

        it('returns one row per matching egreso movement (sum is the caller\'s responsibility)', async () => {
            const gateway = makeGateway();
            const category = objectId();

            await insertMovement(gateway, {
                Type: 'egreso', Category: category, Amount: 10, Date: new Date(2026, 6, 5),
            });
            await insertMovement(gateway, {
                Type: 'egreso', Category: category, Amount: 30, Date: new Date(2026, 6, 20),
            });

            const rows = await gateway.findEgresoAmounts(category, new Date(2026, 6, 1), new Date(2026, 6, 31));

            expect(rows).toHaveLength(2);
            expect(rows.reduce((acc, row) => acc + row.Amount, 0)).toBe(40);
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
            Category: input.Category,
            Account: objectId(),
            Amount: input.Amount,
            Date: input.Date,
        });
    },
    {
        beforeAll: async () => {
            mongod = await MongoMemoryServer.create();
            await mongoose.connect(mongod.getUri(), { dbName: 'budget-movement-gateway-contract' });
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
