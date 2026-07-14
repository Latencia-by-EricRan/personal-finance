import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Identity } from './shared/domain/Identity';
import { ExampleItem } from './contexts/_example/domain/ExampleItem';
import { RegisterExampleItem } from './contexts/_example/application/RegisterExampleItem';
import { InMemoryExampleItemRepository } from './contexts/_example/infrastructure/InMemoryExampleItemRepository';
import { MongooseExampleItemRepository } from './contexts/_example/infrastructure/MongooseExampleItemRepository';
import ExampleItemModel from './contexts/_example/infrastructure/ExampleItemModel';
import { SaveCategory } from './contexts/category/application/SaveCategory';
import { InMemoryCategoryRepository } from './contexts/category/infrastructure/InMemoryCategoryRepository';
import CategoryModel from './contexts/category/infrastructure/CategoryModel';
import { createCompositionRoot, getContainer } from './composition-root';

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

    describe('category use cases wiring (design D1)', () => {
        let mongod: MongoMemoryServer;

        beforeAll(async () => {
            mongod = await MongoMemoryServer.create();
            await mongoose.connect(mongod.getUri(), { dbName: 'composition-root-category' });
        });

        afterAll(async () => {
            await mongoose.disconnect();
            await mongod.stop();
        });

        beforeEach(async () => {
            await CategoryModel.deleteMany({});
        });

        it('resolves the real MongooseCategoryRepository-backed use cases and persists a real round trip', async () => {
            const container = createCompositionRoot();

            expect(container.category.saveCategory).toBeInstanceOf(SaveCategory);

            const saved = await container.category.saveCategory.execute({
                Name: 'Composition Category',
                Description: 'Wired via composition root',
                Type: 'variable',
                Tag: 'composition-category-tag',
            });

            const found = await container.category.findCategoryById.execute(saved.id!.value);
            expect(found?.equals(saved)).toBe(true);
        });

        it('resolves the supplied fake category repository instead of the real one', async () => {
            const fakeRepository = new InMemoryCategoryRepository();
            const container = createCompositionRoot({ categoryRepository: fakeRepository });

            const saved = await container.category.saveCategory.execute({
                Name: 'Fake Category',
                Description: 'In memory',
                Type: 'fijo',
            });

            const found = await fakeRepository.findById(saved.id!);
            expect(found?.equals(saved)).toBe(true);
        });
    });

    describe('getContainer (lazy singleton)', () => {
        it('returns the same container instance on repeated calls', () => {
            const first = getContainer();
            const second = getContainer();

            expect(first).toBe(second);
            expect(first.category.saveCategory).toBeInstanceOf(SaveCategory);
            expect(first.category.saveCategory).not.toBeInstanceOf(InMemoryCategoryRepository);
        });
    });
});
