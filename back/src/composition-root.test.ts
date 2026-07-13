import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Identity } from './shared/domain/Identity';
import { ExampleItem } from './contexts/_example/domain/ExampleItem';
import { RegisterExampleItem } from './contexts/_example/application/RegisterExampleItem';
import { InMemoryExampleItemRepository } from './contexts/_example/infrastructure/InMemoryExampleItemRepository';
import { MongooseExampleItemRepository } from './contexts/_example/infrastructure/MongooseExampleItemRepository';
import ExampleItemModel from './contexts/_example/infrastructure/ExampleItemModel';
import { createCompositionRoot } from './composition-root';

describe('createCompositionRoot', () => {
    describe('default wiring (real adapter)', () => {
        let mongod: MongoMemoryServer;

        beforeAll(async () => {
            mongod = await MongoMemoryServer.create();
            await mongoose.connect(mongod.getUri(), { dbName: 'composition-root-default' });
        });

        afterAll(async () => {
            await mongoose.disconnect();
            await mongod.stop();
        });

        beforeEach(async () => {
            await ExampleItemModel.deleteMany({});
        });

        it('resolves the real Mongoose adapter and persists through a real round-trip', async () => {
            const container = createCompositionRoot();

            expect(container.exampleItemRepository).toBeInstanceOf(MongooseExampleItemRepository);

            const useCase = new RegisterExampleItem(container.exampleItemRepository);
            const item = await useCase.execute({
                id: '507f1f77bcf86cd799439021',
                name: 'Composition Coffee',
                quantity: 7,
            });

            const found = await container.exampleItemRepository.findById(item.id);
            expect(found?.equals(item)).toBe(true);
        });
    });

    describe('overridden wiring (fake adapter)', () => {
        it('resolves the supplied fake adapter instead of the real one', async () => {
            const fakeRepository = new InMemoryExampleItemRepository();
            const container = createCompositionRoot({ exampleItemRepository: fakeRepository });

            expect(container.exampleItemRepository).toBe(fakeRepository);

            const useCase = new RegisterExampleItem(container.exampleItemRepository);
            const item = await useCase.execute({
                id: '507f1f77bcf86cd799439022',
                name: 'Fake Tea',
                quantity: 2,
            });

            const found = await fakeRepository.findById(Identity.create('507f1f77bcf86cd799439022'));
            expect(found?.equals(item)).toBe(true);
            expect(found).toBeInstanceOf(ExampleItem);
        });
    });
});
