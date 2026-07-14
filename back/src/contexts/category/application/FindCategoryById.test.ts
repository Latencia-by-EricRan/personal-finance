import { describe, expect, it } from 'vitest';
import { Identity } from '../../../shared/domain/Identity';
import { InMemoryCategoryRepository } from '../infrastructure/InMemoryCategoryRepository';
import { SaveCategory } from './SaveCategory';
import { FindCategoryById } from './FindCategoryById';

describe('FindCategoryById', () => {
    it('returns the matching category for a known id', async () => {
        const repository = new InMemoryCategoryRepository();
        const save = new SaveCategory(repository);
        const useCase = new FindCategoryById(repository);

        const created = await save.execute({ Description: 'Rent', Name: 'Rent', Type: 'fijo' });

        const found = await useCase.execute(created.id!.value);

        expect(found?.equals(created)).toBe(true);
    });

    it('returns null for an id that does not exist', async () => {
        const repository = new InMemoryCategoryRepository();
        const useCase = new FindCategoryById(repository);

        const found = await useCase.execute(Identity.generate());

        expect(found).toBeNull();
    });
});
