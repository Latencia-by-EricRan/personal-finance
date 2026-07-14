import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Identity } from '../../../shared/domain/Identity';
import { Movement, MovementType } from '../domain/Movement';
import { MovementRepository } from '../application/ports/MovementRepository';
import { InMemoryMovementRepository } from './InMemoryMovementRepository';
import { MongooseMovementRepository } from './MongooseMovementRepository';
import MovementModel from './MovementModel';

/**
 * Shared port contract for `movement` (task 2.14) — run against BOTH
 * `InMemoryMovementRepository` and the real `MongooseMovementRepository`
 * (via `mongodb-memory-server`, no mocked Mongoose calls), same principle
 * `CategoryRepository.contract.test.ts` established.
 */
interface RepositoryLifecycle {
    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
    beforeEach?: () => Promise<void>;
}

const accountId = (): string => new Types.ObjectId().toString();

const runMovementContract = (
    suiteName: string,
    makeRepo: () => MovementRepository,
    lifecycle: RepositoryLifecycle = {},
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

        it('creates a movement and returns a view with a persisted _id', async () => {
            const repo = makeRepo();

            const created = await repo.create(
                Movement.create({
                    Type: MovementType.EGRESO,
                    Amount: 40,
                    Date: new Date(2026, 5, 15),
                    Account: accountId(),
                }),
            );

            expect(created._id).toBeTruthy();
            expect(created.Amount).toBe(40);
            expect(created.Type).toBe(MovementType.EGRESO);
        });

        it('find filters by Date range and returns only movements within it', async () => {
            const repo = makeRepo();
            const account = accountId();
            await repo.create(
                Movement.create({ Type: MovementType.INGRESO, Amount: 100, Date: new Date(2026, 5, 10), Account: account }),
            );
            await repo.create(
                Movement.create({ Type: MovementType.EGRESO, Amount: 25, Date: new Date(2026, 8, 10), Account: account }),
            );

            const found = await repo.find({
                Date: { $gte: new Date(2026, 5, 1), $lte: new Date(2026, 5, 30) },
                Account: account,
            });

            expect(found).toHaveLength(1);
            expect(found[0].Amount).toBe(100);
        });

        it('find honors pagination', async () => {
            const repo = makeRepo();
            const account = accountId();
            await repo.create(
                Movement.create({ Type: MovementType.INGRESO, Amount: 1, Date: new Date(2026, 6, 1), Account: account }),
            );
            await repo.create(
                Movement.create({ Type: MovementType.INGRESO, Amount: 2, Date: new Date(2026, 6, 2), Account: account }),
            );
            await repo.create(
                Movement.create({ Type: MovementType.INGRESO, Amount: 3, Date: new Date(2026, 6, 3), Account: account }),
            );

            const page = await repo.find({ Account: account }, undefined, { skip: 1, limit: 1 });

            expect(page).toHaveLength(1);
        });

        it('update applies a partial patch (only the given field changes)', async () => {
            const repo = makeRepo();
            const created = await repo.create(
                Movement.create({
                    Type: MovementType.EGRESO,
                    Amount: 500,
                    Date: new Date(2026, 6, 5),
                    Account: accountId(),
                }),
            );

            const updated = await repo.update(Identity.create(created._id), { Amount: 750 });

            expect(updated?.Amount).toBe(750);
            expect(updated?.Type).toBe(MovementType.EGRESO);
        });

        it('update returns null when the id does not exist', async () => {
            const repo = makeRepo();

            const updated = await repo.update(Identity.create(Identity.generate()), { Amount: 1 });

            expect(updated).toBeNull();
        });

        it('remove deletes the movement and returns the removed entity; find no longer returns it', async () => {
            const repo = makeRepo();
            const account = accountId();
            const created = await repo.create(
                Movement.create({ Type: MovementType.INGRESO, Amount: 10, Date: new Date(2026, 6, 6), Account: account }),
            );

            const removed = await repo.remove(Identity.create(created._id));
            expect(removed?._id).toBe(created._id);

            const foundAfter = await repo.find({ Account: account });
            expect(foundAfter.find((movement) => movement._id === created._id)).toBeUndefined();
        });

        it('remove returns null when the id does not exist', async () => {
            const repo = makeRepo();

            const removed = await repo.remove(Identity.create(Identity.generate()));

            expect(removed).toBeNull();
        });

        it('saveMany batch-creates all movements in a single call', async () => {
            const repo = makeRepo();
            const account = accountId();

            const created = await repo.saveMany([
                Movement.create({ Type: MovementType.INGRESO, Amount: 5, Date: new Date(2026, 6, 7), Account: account }),
                Movement.create({ Type: MovementType.EGRESO, Amount: 6, Date: new Date(2026, 6, 8), Account: account }),
            ]);

            expect(created).toHaveLength(2);
            expect(created.map((movement) => movement.Amount).sort()).toEqual([5, 6]);
        });
    });
};

runMovementContract('InMemoryMovementRepository', () => new InMemoryMovementRepository());

let mongod: MongoMemoryServer;

runMovementContract('MongooseMovementRepository', () => new MongooseMovementRepository(), {
    beforeAll: async () => {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri(), { dbName: 'movement-repository-contract' });
    },
    afterAll: async () => {
        await mongoose.disconnect();
        await mongod.stop();
    },
    beforeEach: async () => {
        await MovementModel.deleteMany({});
    },
});
