import mongoose from 'mongoose';
import { describe, expect, it } from 'vitest';
import CategoryModel from './CategoryModel';

describe('CategoryModel', () => {
    it('registers exactly one Mongoose model named "Category"', () => {
        const registrations = mongoose.modelNames().filter((name) => name === 'Category');

        expect(registrations).toHaveLength(1);
    });

    it('is registered under the "Category" collection', () => {
        expect(CategoryModel.collection.collectionName).toBe('categories');
    });

    it('preserves the PascalCase schema field parity of the legacy model', () => {
        const paths = CategoryModel.schema.paths;

        expect(paths.Description).toBeDefined();
        expect(paths.Description.instance).toBe('String');
        expect(paths.Description.isRequired).toBe(true);

        expect(paths.Name).toBeDefined();
        expect(paths.Name.instance).toBe('String');
        expect(paths.Name.isRequired).toBe(true);

        expect(paths.Tag).toBeDefined();
        expect(paths.Tag.instance).toBe('String');
        expect(paths.Tag.defaultValue).toBe('');

        expect(paths.Type).toBeDefined();
        expect(paths.Type.instance).toBe('String');
        expect(paths.Type.isRequired).toBe(true);
        expect((paths.Type as unknown as { enumValues: string[] }).enumValues).toEqual(['variable', 'fijo']);

        expect(paths.Icon).toBeDefined();
        expect(paths.Icon.instance).toBe('String');
        expect(paths.Icon.defaultValue).toBe('');

        expect(paths.Color).toBeDefined();
        expect(paths.Color.instance).toBe('String');
        expect(paths.Color.defaultValue).toBe('');
    });

    it('keeps versionKey disabled and timestamps disabled, matching legacy schema options', () => {
        expect(CategoryModel.schema.get('versionKey')).toBe(false);
        expect(CategoryModel.schema.get('timestamps')).toBe(false);
    });
});
