import { describe, expect, it } from 'vitest';
import { Identity } from '../../../shared/domain/Identity';
import { ExampleItem } from '../domain/ExampleItem';
import { ExampleItemMapper } from './ExampleItemMapper';

describe('ExampleItemMapper', () => {
    const mapper = new ExampleItemMapper();

    it('round-trips a domain entity through toPersistence -> toDomain preserving all data', () => {
        const original = ExampleItem.create(Identity.create('507f1f77bcf86cd799439011'), 'Coffee', 3);

        const persisted = mapper.toPersistence(original);
        const result = mapper.toDomain(persisted);

        expect(result.equals(original)).toBe(true);
    });

    it('preserves the original id when reading a persisted document back into the domain', () => {
        const original = ExampleItem.create(Identity.create('507f1f77bcf86cd799439011'), 'Coffee', 3);
        const persisted = mapper.toPersistence(original);

        const result = mapper.toDomain(persisted);

        expect(result.id.equals(original.id)).toBe(true);
        expect(result.id.value).toBe(original.id.value);
    });
});
