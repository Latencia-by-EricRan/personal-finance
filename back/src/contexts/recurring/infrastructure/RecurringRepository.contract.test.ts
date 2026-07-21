import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Identity } from '../../../shared/domain/Identity';
import { Recurring } from '../domain/Recurring';
import { RecurringRepository } from '../application/ports/RecurringRepository';
import { InMemoryRecurringRepository } from './InMemoryRecurringRepository';
import { MongooseRecurringRepository } from './MongooseRecurringRepository';
import RecurringModel from './RecurringModel';

/**
 * Shared port contract for `recurring` (task 1.4) — run against BOTH
 * `InMemoryRecurringRepository` and the real `MongooseRecurringRepository`
 * (via `mongodb-memory-server`, no mocked Mongoose calls), same principle
 * `BudgetRepository.contract.test.ts`/`AccountRepository.contract.test.ts`
 * established. Also covers `findDue`/`claim` — the atomic idempotency guard
 * `RunRecurrings` depends on (design D12), including the claim-race case.
 */
interface RepositoryLifecycle {
    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
    beforeEach?: () => Promise<void>;
}

const refId = (): string => new Types.ObjectId().toString();

const runRecurringContract = (
    suiteName: string,
    makeRepo: () => RecurringRepository,
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

        it('creates a recurring and returns the persisted view', async () => {
            const repo = makeRepo();

            const created = await repo.create(
                Recurring.create({
                    Type: 'egreso',
                    Amount: 500,
                    Category: refId(),
                    Account: refId(),
                    Description: 'Rent',
                    Card: 'visa',
                    Frequency: 'mensual',
                    DayOfMonth: 5,
                }),
            );

            expect(created._id).toBeTruthy();
            expect(created.Type).toBe('egreso');
            expect(created.Amount).toBe(500);
            expect(created.DayOfMonth).toBe(5);
            expect(created.Active).toBe(true);
            expect(created.LastRunYearMonth).toBeNull();
        });

        it('findById returns the recurring when it exists, null otherwise', async () => {
            const repo = makeRepo();
            const created = await repo.create(
                Recurring.create({
                    Type: 'ingreso',
                    Amount: 1000,
                    Category: refId(),
                    Account: refId(),
                    Frequency: 'mensual',
                    DayOfMonth: 1,
                }),
            );

            const found = await repo.findById(Identity.create(created._id));
            expect(found?.Amount).toBe(1000);

            const missing = await repo.findById(Identity.create(Identity.generate()));
            expect(missing).toBeNull();
        });

        it('find filters by Active and honors pagination', async () => {
            const repo = makeRepo();
            await repo.create(
                Recurring.create({
                    Type: 'egreso', Amount: 100, Category: refId(), Account: refId(),
                    Frequency: 'mensual', DayOfMonth: 1,
                }),
            );
            await repo.create(
                Recurring.create({
                    Type: 'egreso', Amount: 200, Category: refId(), Account: refId(),
                    Frequency: 'mensual', DayOfMonth: 2, Active: false,
                }),
            );

            const activeOnly = await repo.find({ Active: true });
            expect(activeOnly).toHaveLength(1);

            const page = await repo.find({}, { skip: 1, limit: 1 });
            expect(page).toHaveLength(1);
        });

        it('update applies a partial patch (only the given field changes)', async () => {
            const repo = makeRepo();
            const created = await repo.create(
                Recurring.create({
                    Type: 'egreso', Amount: 500, Category: refId(), Account: refId(),
                    Frequency: 'mensual', DayOfMonth: 5,
                }),
            );

            const updated = await repo.update(Identity.create(created._id), { Amount: 900 });

            expect(updated?.Amount).toBe(900);
            expect(updated?.DayOfMonth).toBe(5);
        });

        it('update enforces the DayOfMonth range (runValidators parity)', async () => {
            const repo = makeRepo();
            const created = await repo.create(
                Recurring.create({
                    Type: 'egreso', Amount: 500, Category: refId(), Account: refId(),
                    Frequency: 'mensual', DayOfMonth: 5,
                }),
            );

            await expect(repo.update(Identity.create(created._id), { DayOfMonth: 99 })).rejects.toThrow();
        });

        it('update returns null when the id does not exist', async () => {
            const repo = makeRepo();

            const updated = await repo.update(Identity.create(Identity.generate()), { Amount: 10 });

            expect(updated).toBeNull();
        });

        it('delete permanently removes the recurring and returns null for a missing id', async () => {
            const repo = makeRepo();
            const created = await repo.create(
                Recurring.create({
                    Type: 'egreso', Amount: 500, Category: refId(), Account: refId(),
                    Frequency: 'mensual', DayOfMonth: 5,
                }),
            );

            const deleted = await repo.delete(Identity.create(created._id));
            expect(deleted?._id).toBe(created._id);

            const afterDelete = await repo.findById(Identity.create(created._id));
            expect(afterDelete).toBeNull();

            const missing = await repo.delete(Identity.create(Identity.generate()));
            expect(missing).toBeNull();
        });

        it('findDue returns only Active recurrings whose LastRunYearMonth differs from the given month', async () => {
            const repo = makeRepo();
            const due = await repo.create(
                Recurring.create({
                    Type: 'egreso', Amount: 500, Category: refId(), Account: refId(),
                    Frequency: 'mensual', DayOfMonth: 5, Active: true, LastRunYearMonth: '2026-06',
                }),
            );
            await repo.create(
                Recurring.create({
                    Type: 'egreso', Amount: 500, Category: refId(), Account: refId(),
                    Frequency: 'mensual', DayOfMonth: 5, Active: true, LastRunYearMonth: '2026-07',
                }),
            );
            await repo.create(
                Recurring.create({
                    Type: 'egreso', Amount: 500, Category: refId(), Account: refId(),
                    Frequency: 'mensual', DayOfMonth: 5, Active: false, LastRunYearMonth: '2026-06',
                }),
            );

            const dueList = await repo.findDue('2026-07');

            expect(dueList).toHaveLength(1);
            expect(dueList[0]._id).toBe(due._id);
        });

        it('claim succeeds once and stamps LastRunYearMonth to the given month', async () => {
            const repo = makeRepo();
            const created = await repo.create(
                Recurring.create({
                    Type: 'egreso', Amount: 500, Category: refId(), Account: refId(),
                    Frequency: 'mensual', DayOfMonth: 5, LastRunYearMonth: '2026-06',
                }),
            );

            const claimed = await repo.claim(created._id, '2026-07');
            expect(claimed).toBe(true);

            const after = await repo.findById(Identity.create(created._id));
            expect(after?.LastRunYearMonth).toBe('2026-07');
        });

        it('claim fails on a race: a second claim for the same id/month returns false', async () => {
            const repo = makeRepo();
            const created = await repo.create(
                Recurring.create({
                    Type: 'egreso', Amount: 500, Category: refId(), Account: refId(),
                    Frequency: 'mensual', DayOfMonth: 5, LastRunYearMonth: '2026-06',
                }),
            );

            const firstClaim = await repo.claim(created._id, '2026-07');
            const secondClaim = await repo.claim(created._id, '2026-07');

            expect(firstClaim).toBe(true);
            expect(secondClaim).toBe(false);
        });

        it('claim on a non-existent id returns false', async () => {
            const repo = makeRepo();

            const claimed = await repo.claim(Identity.generate(), '2026-07');

            expect(claimed).toBe(false);
        });
    });
};

runRecurringContract('InMemoryRecurringRepository', () => new InMemoryRecurringRepository());

let mongod: MongoMemoryServer;

runRecurringContract('MongooseRecurringRepository', () => new MongooseRecurringRepository(), {
    beforeAll: async () => {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri(), { dbName: 'recurring-repository-contract' });
    },
    afterAll: async () => {
        await mongoose.disconnect();
        await mongod.stop();
    },
    beforeEach: async () => {
        await RecurringModel.deleteMany({});
    },
});
