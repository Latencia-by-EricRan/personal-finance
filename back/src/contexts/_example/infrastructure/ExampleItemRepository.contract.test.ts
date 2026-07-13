import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Identity } from '../../../shared/domain/Identity';
import { ExampleItem } from '../domain/ExampleItem';
import { ExampleItemRepository } from '../application/ports/ExampleItemRepository';
import { InMemoryExampleItemRepository } from './InMemoryExampleItemRepository';
import { MongooseExampleItemRepository } from './MongooseExampleItemRepository';
import ExampleItemModel from './ExampleItemModel';

interface RepositoryLifecycle {
    beforeAll?: () => Promise<void>;
    afterAll?: () => Promise<void>;
    beforeEach?: () => Promise<void>;
}

const runContract = (
    suiteName: string,
    makeRepo: () => ExampleItemRepository,
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

        it('saves an entity then finds it back by id', async () => {
            const repo = makeRepo();
            const item = ExampleItem.create(Identity.create('507f1f77bcf86cd799439011'), 'Coffee', 3);

            await repo.save(item);
            const found = await repo.findById(item.id);

            expect(found?.equals(item)).toBe(true);
        });

        it('deletes an entity so it can no longer be found by id', async () => {
            const repo = makeRepo();
            const item = ExampleItem.create(Identity.create('507f1f77bcf86cd799439012'), 'Tea', 5);
            await repo.save(item);

            await repo.delete(item.id);
            const found = await repo.findById(item.id);

            expect(found).toBeNull();
        });

        it('returns null when finding by an id that was never saved', async () => {
            const repo = makeRepo();

            const found = await repo.findById(Identity.create('507f1f77bcf86cd799439013'));

            expect(found).toBeNull();
        });
    });
};

runContract('InMemoryExampleItemRepository', () => new InMemoryExampleItemRepository());

let mongod: MongoMemoryServer;

runContract('MongooseExampleItemRepository', () => new MongooseExampleItemRepository(), {
    beforeAll: async () => {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri(), { dbName: 'example-repository-contract' });
    },
    afterAll: async () => {
        await mongoose.disconnect();
        await mongod.stop();
    },
    beforeEach: async () => {
        await ExampleItemModel.deleteMany({});
    },
});
