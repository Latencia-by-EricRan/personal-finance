import { describe, expect, it } from 'vitest';
import { Identity } from '../../../shared/domain/Identity';
import { Category } from './Category';

describe('Category', () => {
    describe('create', () => {
        it('creates a category defaulting Tag/Icon/Color to empty string when omitted', () => {
            const category = Category.create({ Description: 'Monthly rent', Name: 'Rent', Type: 'fijo' });

            expect(category.description).toBe('Monthly rent');
            expect(category.name).toBe('Rent');
            expect(category.type).toBe('fijo');
            expect(category.tag).toBe('');
            expect(category.icon).toBe('');
            expect(category.color).toBe('');
            expect(category.id).toBeUndefined();
        });

        it('keeps a provided Tag, Icon and Color', () => {
            const category = Category.create({
                Description: 'Utilities',
                Name: 'Utilities',
                Type: 'variable',
                Tag: 'utils-tag',
                Icon: 'bolt',
                Color: '#FF0000',
            });

            expect(category.tag).toBe('utils-tag');
            expect(category.icon).toBe('bolt');
            expect(category.color).toBe('#FF0000');
        });

        it('rejects an empty or blank Name', () => {
            expect(() => Category.create({ Description: 'x', Name: '', Type: 'variable' })).toThrow();
            expect(() => Category.create({ Description: 'x', Name: '   ', Type: 'variable' })).toThrow();
        });

        it('rejects an empty or blank Description', () => {
            expect(() => Category.create({ Description: '', Name: 'x', Type: 'variable' })).toThrow();
            expect(() => Category.create({ Description: '   ', Name: 'x', Type: 'variable' })).toThrow();
        });

        it('rejects a Type outside variable/fijo', () => {
            expect(() =>
                Category.create({ Description: 'x', Name: 'x', Type: 'bogus' as never }),
            ).toThrow();
        });

        it('only assigns whitelisted named properties, ignoring anything else on the input object (mass-assignment safe)', () => {
            const maliciousInput = {
                Description: 'x',
                Name: 'x',
                Type: 'variable',
                Admin: true,
                Balance: 999999,
            } as unknown as Parameters<typeof Category.create>[0];

            const category = Category.create(maliciousInput);

            expect((category as unknown as Record<string, unknown>).Admin).toBeUndefined();
            expect((category as unknown as Record<string, unknown>).Balance).toBeUndefined();
        });
    });

    describe('rehydrate', () => {
        it('reconstructs a persisted category carrying its identity', () => {
            const id = Identity.create('507f1f77bcf86cd799439011');

            const category = Category.rehydrate(id, {
                Description: 'Rent',
                Name: 'Rent',
                Type: 'fijo',
                Tag: 'rent-tag',
                Icon: 'home',
                Color: 'teal',
            });

            expect(category.id?.equals(id)).toBe(true);
            expect(category.name).toBe('Rent');
            expect(category.tag).toBe('rent-tag');
            expect(category.color).toBe('teal');
        });
    });

    describe('equals', () => {
        it('returns false when only Color differs', () => {
            const base = { Description: 'x', Name: 'x', Type: 'variable' as const, Tag: 'same-tag', Icon: 'same-icon' };
            const red = Category.create({ ...base, Color: 'red' });
            const blue = Category.create({ ...base, Color: 'blue' });

            expect(red.equals(blue)).toBe(false);
        });

        it('returns true when Color matches along with every other field', () => {
            const props = { Description: 'x', Name: 'x', Type: 'variable' as const, Tag: 'same-tag', Icon: 'same-icon', Color: 'red' };
            const a = Category.create(props);
            const b = Category.create(props);

            expect(a.equals(b)).toBe(true);
        });
    });

    describe('naturalKey', () => {
        it('returns {Tag: ...} when Tag is present', () => {
            const category = Category.create({ Description: 'x', Name: 'x', Type: 'variable', Tag: 'my-tag' });

            expect(category.naturalKey()).toEqual({ Tag: 'my-tag' });
        });

        it('returns {Name: ...} when Tag is absent', () => {
            const category = Category.create({ Description: 'x', Name: 'my-name', Type: 'variable' });

            expect(category.naturalKey()).toEqual({ Name: 'my-name' });
        });

        it('returns {Name: ...} when Tag is an empty string', () => {
            const category = Category.create({ Description: 'x', Name: 'my-name', Type: 'variable', Tag: '' });

            expect(category.naturalKey()).toEqual({ Name: 'my-name' });
        });
    });
});
