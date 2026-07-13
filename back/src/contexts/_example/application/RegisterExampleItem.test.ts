import { describe, expect, it } from 'vitest';
import { InMemoryExampleItemRepository } from '../infrastructure/InMemoryExampleItemRepository';
import { RegisterExampleItem } from './RegisterExampleItem';

describe('RegisterExampleItem', () => {
    it('creates a new ExampleItem with a fresh Identity and saves it through the port', async () => {
        const repository = new InMemoryExampleItemRepository();
        const useCase = new RegisterExampleItem(repository);

        const item = await useCase.execute({ id: '507f1f77bcf86cd799439011', name: 'Coffee', quantity: 3 });

        expect(item.name).toBe('Coffee');
        expect(item.quantity).toBe(3);
        const found = await repository.findById(item.id);
        expect(found?.equals(item)).toBe(true);
    });

    it('rejects an invalid id at the boundary', async () => {
        const repository = new InMemoryExampleItemRepository();
        const useCase = new RegisterExampleItem(repository);

        await expect(
            useCase.execute({ id: 'not-a-valid-id', name: 'Coffee', quantity: 3 }),
        ).rejects.toThrow();
    });
});
