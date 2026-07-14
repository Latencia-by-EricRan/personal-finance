import { describe, expect, it } from 'vitest';
import { Identity } from '../../../shared/domain/Identity';
import { InMemoryCategoryRepository } from '../infrastructure/InMemoryCategoryRepository';
import { SaveCategory } from './SaveCategory';
import { DeleteCategory } from './DeleteCategory';

describe('DeleteCategory', () => {
    it('deletes an existing category and returns it', async () => {
        const repository = new InMemoryCategoryRepository();
        const save = new SaveCategory(repository);
        const useCase = new DeleteCategory(repository);

        const created = await save.execute({ Description: 'Rent', Name: 'Rent', Type: 'fijo' });

        const deleted = await useCase.execute(created.id!.value);

        expect(deleted?.equals(created)).toBe(true);
        expect(await repository.findById(created.id!)).toBeNull();
    });

    it('returns null when the category does not exist', async () => {
        const repository = new InMemoryCategoryRepository();
        const useCase = new DeleteCategory(repository);

        const deleted = await useCase.execute(Identity.generate());

        expect(deleted).toBeNull();
    });
});
