import { describe, expect, it } from 'vitest';
import { InMemoryCategoryRepository } from '../infrastructure/InMemoryCategoryRepository';
import { BulkSaveCategory, DuplicateCategoryKeyError } from './BulkSaveCategory';

describe('BulkSaveCategory', () => {
    it('bulk-upserts a batch of new categories with distinct Tags, reporting upsertedCount', async () => {
        const repository = new InMemoryCategoryRepository();
        const useCase = new BulkSaveCategory(repository);

        const result = await useCase.execute([
            { Description: 'Bulk A', Name: 'Bulk A', Type: 'variable', Tag: 'bulk-a' },
            { Description: 'Bulk B', Name: 'Bulk B', Type: 'fijo', Tag: 'bulk-b' },
        ]);

        expect(result.upsertedCount).toBe(2);
        expect(result.matchedCount).toBe(0);
        expect(Object.keys(result.upsertedIds)).toEqual(['0', '1']);

        const all = await repository.find({});
        expect(all).toHaveLength(2);
    });

    it('reports matchedCount/modifiedCount when re-saving items with existing keys', async () => {
        const repository = new InMemoryCategoryRepository();
        const useCase = new BulkSaveCategory(repository);

        await useCase.execute([{ Description: 'first', Name: 'Repeat', Type: 'variable', Tag: 'repeat' }]);
        const result = await useCase.execute([{ Description: 'updated', Name: 'Repeat', Type: 'variable', Tag: 'repeat' }]);

        expect(result.upsertedCount).toBe(0);
        expect(result.matchedCount).toBe(1);
        expect(result.modifiedCount).toBe(1);
        expect(result.upsertedIds).toEqual({});
    });

    it('throws a DuplicateCategoryKeyError when two items in the batch share the same Tag, persisting nothing', async () => {
        const repository = new InMemoryCategoryRepository();
        const useCase = new BulkSaveCategory(repository);

        await expect(
            useCase.execute([
                { Description: 'A', Name: 'A', Type: 'variable', Tag: 'dup-tag' },
                { Description: 'B', Name: 'B', Type: 'variable', Tag: 'dup-tag' },
            ]),
        ).rejects.toThrow(DuplicateCategoryKeyError);

        expect(await repository.find({})).toHaveLength(0);
    });

    it('throws a DuplicateCategoryKeyError when two items share the same Name (no Tag on either)', async () => {
        const repository = new InMemoryCategoryRepository();
        const useCase = new BulkSaveCategory(repository);

        await expect(
            useCase.execute([
                { Description: 'A', Name: 'dup-name', Type: 'variable' },
                { Description: 'B', Name: 'dup-name', Type: 'fijo' },
            ]),
        ).rejects.toThrow(DuplicateCategoryKeyError);
    });

    it('rejects the whole batch if any single item fails domain invariants, persisting nothing', async () => {
        const repository = new InMemoryCategoryRepository();
        const useCase = new BulkSaveCategory(repository);

        await expect(
            useCase.execute([
                { Description: 'A', Name: 'A', Type: 'variable', Tag: 'ok-tag' },
                { Description: '', Name: 'B', Type: 'variable', Tag: 'bad-tag' },
            ]),
        ).rejects.toThrow();

        expect(await repository.find({})).toHaveLength(0);
    });
});
