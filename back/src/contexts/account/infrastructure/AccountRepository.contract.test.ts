import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Identity } from '../../../shared/domain/Identity';
import { Account } from '../domain/Account';
import { AccountRepository } from '../application/ports/AccountRepository';
import { InMemoryAccountRepository } from './InMemoryAccountRepository';
import { MongooseAccountRepository } from './MongooseAccountRepository';
import AccountModel from './AccountModel';

/**
 * Shared port contract for `account` (task 2a.13) — run against BOTH
 * `InMemoryAccountRepository` and the real `MongooseAccountRepository` (via
 * `mongodb-memory-server`, no mocked Mongoose calls), same principle
 * `MovementRepository.contract.test.ts` established.
 */
interface RepositoryLifecycle {
    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
    beforeEach?: () => Promise<void>;
}

const runAccountContract = (
    suiteName: string,
    makeRepo: () => AccountRepository,
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

        it('creates an account applying schema defaults', async () => {
            const repo = makeRepo();

            const created = await repo.create(Account.create({ Name: 'Efectivo', Type: 'efectivo' }));

            expect(created._id).toBeTruthy();
            expect(created.Name).toBe('Efectivo');
            expect(created.Type).toBe('efectivo');
            expect(created.Currency).toBe('ARS');
            expect(created.Icon).toBe('');
            expect(created.Archived).toBe(false);
        });

        it('findById returns the account when it exists, null otherwise', async () => {
            const repo = makeRepo();
            const created = await repo.create(Account.create({ Name: 'Banco', Type: 'banco' }));

            const found = await repo.findById(Identity.create(created._id));
            expect(found?.Name).toBe('Banco');

            const missing = await repo.findById(Identity.create(Identity.generate()));
            expect(missing).toBeNull();
        });

        it('find filters by Archived and honors pagination', async () => {
            const repo = makeRepo();
            await repo.create(Account.create({ Name: 'Active 1', Type: 'efectivo' }));
            await repo.create(Account.create({ Name: 'Active 2', Type: 'efectivo' }));
            await repo.create(Account.create({ Name: 'Archived 1', Type: 'efectivo', Archived: true }));

            const active = await repo.find({ Archived: false });
            expect(active).toHaveLength(2);

            const page = await repo.find({ Archived: false }, { skip: 1, limit: 1 });
            expect(page).toHaveLength(1);
        });

        it('update applies a partial patch (only the given field changes)', async () => {
            const repo = makeRepo();
            const created = await repo.create(Account.create({ Name: 'Tarjeta', Type: 'tarjeta' }));

            const updated = await repo.update(Identity.create(created._id), { Icon: '💳' });

            expect(updated?.Icon).toBe('💳');
            expect(updated?.Name).toBe('Tarjeta');
            expect(updated?.Type).toBe('tarjeta');
        });

        it('update enforces the Type enum (runValidators parity)', async () => {
            const repo = makeRepo();
            const created = await repo.create(Account.create({ Name: 'Tarjeta', Type: 'tarjeta' }));

            await expect(
                repo.update(Identity.create(created._id), { Type: 'invalid-type' as never }),
            ).rejects.toThrow();
        });

        it('update returns null when the id does not exist', async () => {
            const repo = makeRepo();

            const updated = await repo.update(Identity.create(Identity.generate()), { Icon: 'x' });

            expect(updated).toBeNull();
        });

        it('archive soft-flips Archived to true and returns null when the id does not exist', async () => {
            const repo = makeRepo();
            const created = await repo.create(Account.create({ Name: 'To archive', Type: 'efectivo' }));

            const archived = await repo.archive(Identity.create(created._id));
            expect(archived?.Archived).toBe(true);
            expect(archived?.Name).toBe('To archive');

            const missing = await repo.archive(Identity.create(Identity.generate()));
            expect(missing).toBeNull();
        });
    });
};

runAccountContract('InMemoryAccountRepository', () => new InMemoryAccountRepository());

let mongod: MongoMemoryServer;

runAccountContract('MongooseAccountRepository', () => new MongooseAccountRepository(), {
    beforeAll: async () => {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri(), { dbName: 'account-repository-contract' });
    },
    afterAll: async () => {
        await mongoose.disconnect();
        await mongod.stop();
    },
    beforeEach: async () => {
        await AccountModel.deleteMany({});
    },
});
