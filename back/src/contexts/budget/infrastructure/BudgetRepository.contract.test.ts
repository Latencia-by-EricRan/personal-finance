import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Identity } from '../../../shared/domain/Identity';
import { Budget } from '../domain/Budget';
import { BudgetRepository } from '../application/ports/BudgetRepository';
import { InMemoryBudgetRepository } from './InMemoryBudgetRepository';
import { MongooseBudgetRepository } from './MongooseBudgetRepository';
import BudgetModel from './BudgetModel';
// Side-effect import ONLY — `MongooseBudgetRepository.find`/`findById`
// `.populate('Category')` (design D2/D3) requires the referenced model
// registered on the connection. Unlike movement's OPTIONAL `Category`
// (populate is a no-op there when unset), budget's `Category` is REQUIRED,
// so every created budget carries a real ref that populate must resolve —
// in the real app this registration happens naturally at boot alongside
// `category`'s own composition-root wiring.
import '../../category';

/**
 * Shared port contract for `budget` (task 2a.13) — run against BOTH
 * `InMemoryBudgetRepository` and the real `MongooseBudgetRepository` (via
 * `mongodb-memory-server`, no mocked Mongoose calls), same principle
 * `AccountRepository.contract.test.ts`/`MovementRepository.contract.test.ts`
 * established.
 *
 * NOTE (design D2): this contract asserts `Category`-id equality only —
 * `.populate('Category')` is a Mongoose-specific behavior not expressible in
 * `InMemoryBudgetRepository`. The populated-vs-bare `Category` body shape is
 * pinned by the PR3 characterization e2e, not this test.
 */
interface RepositoryLifecycle {
    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
    beforeEach?: () => Promise<void>;
}

const runBudgetContract = (
    suiteName: string,
    makeRepo: () => BudgetRepository,
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

        it('creates a budget and returns the persisted view', async () => {
            const repo = makeRepo();

            const created = await repo.create(
                Budget.create({ Category: new Types.ObjectId().toString(), Month: 6, Year: 2026, Limit: 500 }),
            );

            expect(created._id).toBeTruthy();
            expect(created.Month).toBe(6);
            expect(created.Year).toBe(2026);
            expect(created.Limit).toBe(500);
        });

        it('findById returns the budget when it exists, null otherwise', async () => {
            const repo = makeRepo();
            const created = await repo.create(
                Budget.create({ Category: new Types.ObjectId().toString(), Month: 3, Year: 2026, Limit: 200 }),
            );

            const found = await repo.findById(Identity.create(created._id));
            expect(found?.Limit).toBe(200);

            const missing = await repo.findById(Identity.create(Identity.generate()));
            expect(missing).toBeNull();
        });

        it('find returns an empty list when no budgets exist for the filter', async () => {
            const repo = makeRepo();
            await repo.create(
                Budget.create({ Category: new Types.ObjectId().toString(), Month: 1, Year: 2026, Limit: 100 }),
            );

            const found = await repo.find({ Month: 2, Year: 2026 });
            expect(found).toHaveLength(0);
        });

        it('find filters by Month/Year (status use case shape) and honors pagination', async () => {
            const repo = makeRepo();
            await repo.create(
                Budget.create({ Category: new Types.ObjectId().toString(), Month: 6, Year: 2026, Limit: 100 }),
            );
            await repo.create(
                Budget.create({ Category: new Types.ObjectId().toString(), Month: 6, Year: 2026, Limit: 200 }),
            );
            await repo.create(
                Budget.create({ Category: new Types.ObjectId().toString(), Month: 7, Year: 2026, Limit: 300 }),
            );

            const forJune = await repo.find({ Month: 6, Year: 2026 });
            expect(forJune).toHaveLength(2);

            const page = await repo.find({}, { skip: 1, limit: 1 });
            expect(page).toHaveLength(1);
        });

        it('update applies a partial patch (only the given field changes)', async () => {
            const repo = makeRepo();
            const created = await repo.create(
                Budget.create({ Category: new Types.ObjectId().toString(), Month: 6, Year: 2026, Limit: 500 }),
            );

            const updated = await repo.update(Identity.create(created._id), { Limit: 900 });

            expect(updated?.Limit).toBe(900);
            expect(updated?.Month).toBe(6);
            expect(updated?.Year).toBe(2026);
        });

        it('update enforces the Month range (runValidators parity)', async () => {
            const repo = makeRepo();
            const created = await repo.create(
                Budget.create({ Category: new Types.ObjectId().toString(), Month: 6, Year: 2026, Limit: 500 }),
            );

            await expect(repo.update(Identity.create(created._id), { Month: 13 })).rejects.toThrow();
        });

        it('update returns null when the id does not exist', async () => {
            const repo = makeRepo();

            const updated = await repo.update(Identity.create(Identity.generate()), { Limit: 10 });

            expect(updated).toBeNull();
        });

        it('delete permanently removes the budget (hard delete) and returns null for a missing id', async () => {
            const repo = makeRepo();
            const created = await repo.create(
                Budget.create({ Category: new Types.ObjectId().toString(), Month: 6, Year: 2026, Limit: 500 }),
            );

            const deleted = await repo.delete(Identity.create(created._id));
            expect(deleted?._id).toBe(created._id);

            const afterDelete = await repo.findById(Identity.create(created._id));
            expect(afterDelete).toBeNull();

            const missing = await repo.delete(Identity.create(Identity.generate()));
            expect(missing).toBeNull();
        });

        it('preserves the unique compound key on {Category,Month,Year} on create (duplicate rejected)', async () => {
            const repo = makeRepo();
            const categoryId = new Types.ObjectId().toString();
            await repo.create(Budget.create({ Category: categoryId, Month: 6, Year: 2026, Limit: 100 }));

            await expect(
                repo.create(Budget.create({ Category: categoryId, Month: 6, Year: 2026, Limit: 200 })),
            ).rejects.toThrow();
        });

        it('preserves the unique compound key on {Category,Month,Year} on update (collision rejected)', async () => {
            const repo = makeRepo();
            const categoryA = new Types.ObjectId().toString();
            const categoryB = new Types.ObjectId().toString();
            await repo.create(Budget.create({ Category: categoryA, Month: 6, Year: 2026, Limit: 100 }));
            const second = await repo.create(Budget.create({ Category: categoryB, Month: 6, Year: 2026, Limit: 200 }));

            await expect(
                repo.update(Identity.create(second._id), { Category: categoryA }),
            ).rejects.toThrow();
        });
    });
};

runBudgetContract('InMemoryBudgetRepository', () => new InMemoryBudgetRepository());

let mongod: MongoMemoryServer;

runBudgetContract('MongooseBudgetRepository', () => new MongooseBudgetRepository(), {
    beforeAll: async () => {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri(), { dbName: 'budget-repository-contract' });
        // autoIndex:true builds the unique {Category,Month,Year} index in the
        // background; under full-suite load the duplicate-key tests below can
        // race ahead of that build and see a false negative. Model.init()
        // waits for index creation to finish before the suite proceeds.
        await BudgetModel.init();
    },
    afterAll: async () => {
        await mongoose.disconnect();
        await mongod.stop();
    },
    beforeEach: async () => {
        await BudgetModel.deleteMany({});
    },
});
