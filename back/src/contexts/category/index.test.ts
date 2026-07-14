import { describe, expect, it } from 'vitest';
import { CategoryModel } from './index';

describe('contexts/category barrel', () => {
    it('re-exports the sole registered "Category" Mongoose model', () => {
        expect(CategoryModel.modelName).toBe('Category');
        expect(CategoryModel.collection.collectionName).toBe('categories');
    });
});
