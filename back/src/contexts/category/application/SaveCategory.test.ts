import { describe, expect, it } from 'vitest';
import { InMemoryCategoryRepository } from '../infrastructure/InMemoryCategoryRepository';
import { SaveCategory } from './SaveCategory';

describe('SaveCategory', () => {
    it('creates a new category and assigns it a fresh identity', async () => {
        const repository = new InMemoryCategoryRepository();
        const useCase = new SaveCategory(repository);

        const category = await useCase.execute({ Description: 'Monthly rent', Name: 'Rent', Type: 'fijo', Tag: 'rent-tag' });

        expect(category.name).toBe('Rent');
        expect(category.id).toBeDefined();
        const found = await repository.findById(category.id!);
        expect(found?.equals(category)).toBe(true);
    });

    it('upserts by Tag: saving the same Tag twice updates the same document instead of duplicating it', async () => {
        const repository = new InMemoryCategoryRepository();
        const useCase = new SaveCategory(repository);

        const first = await useCase.execute({ Description: 'Monthly rent', Name: 'Rent (first)', Type: 'fijo', Tag: 'rent-tag' });
        const second = await useCase.execute({ Description: 'Monthly rent renamed', Name: 'Rent (renamed)', Type: 'fijo', Tag: 'rent-tag' });

        expect(second.id?.equals(first.id!)).toBe(true);
        expect(second.name).toBe('Rent (renamed)');
        const all = await repository.find({});
        expect(all).toHaveLength(1);
    });

    it('upserts by Name when Tag is absent', async () => {
        const repository = new InMemoryCategoryRepository();
        const useCase = new SaveCategory(repository);

        const first = await useCase.execute({ Description: 'Utilities (first)', Name: 'Utilities', Type: 'variable' });
        const second = await useCase.execute({ Description: 'Utilities (updated)', Name: 'Utilities', Type: 'variable' });

        expect(second.id?.equals(first.id!)).toBe(true);
        expect(second.description).toBe('Utilities (updated)');
    });

    it('rejects invalid input at the domain boundary', async () => {
        const repository = new InMemoryCategoryRepository();
        const useCase = new SaveCategory(repository);

        await expect(useCase.execute({ Description: '', Name: 'x', Type: 'variable' })).rejects.toThrow();
    });
});
