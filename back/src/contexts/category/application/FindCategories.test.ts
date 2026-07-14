import { describe, expect, it } from 'vitest';
import { InMemoryCategoryRepository } from '../infrastructure/InMemoryCategoryRepository';
import { SaveCategory } from './SaveCategory';
import { FindCategories } from './FindCategories';

describe('FindCategories', () => {
    it('returns all categories when no filter is given', async () => {
        const repository = new InMemoryCategoryRepository();
        const save = new SaveCategory(repository);
        const useCase = new FindCategories(repository);

        await save.execute({ Description: 'A', Name: 'A', Type: 'variable' });
        await save.execute({ Description: 'B', Name: 'B', Type: 'fijo' });

        const results = await useCase.execute({});

        expect(results).toHaveLength(2);
    });

    it('excludes a category matching a deleted-filter scenario (filters by field)', async () => {
        const repository = new InMemoryCategoryRepository();
        const save = new SaveCategory(repository);
        const useCase = new FindCategories(repository);

        await save.execute({ Description: 'A', Name: 'A', Type: 'variable' });
        await save.execute({ Description: 'B', Name: 'B', Type: 'fijo' });

        const results = await useCase.execute({ Type: 'fijo' });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('B');
    });

    it('honors pagination (skip/limit)', async () => {
        const repository = new InMemoryCategoryRepository();
        const save = new SaveCategory(repository);
        const useCase = new FindCategories(repository);

        await save.execute({ Description: 'A', Name: 'A', Type: 'variable' });
        await save.execute({ Description: 'B', Name: 'B', Type: 'variable' });
        await save.execute({ Description: 'C', Name: 'C', Type: 'variable' });

        const results = await useCase.execute({}, { skip: 1, limit: 1 });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('B');
    });
});
