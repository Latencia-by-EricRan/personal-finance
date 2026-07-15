import mongoose from 'mongoose';
import { describe, expect, it } from 'vitest';
import BudgetModel from './BudgetModel';

describe('BudgetModel', () => {
    it('registers exactly one Mongoose model named "Budget"', () => {
        const registrations = mongoose.modelNames().filter((name) => name === 'Budget');

        expect(registrations).toHaveLength(1);
    });

    it('is registered under the "budgets" collection', () => {
        expect(BudgetModel.collection.collectionName).toBe('budgets');
    });

    it('preserves the PascalCase schema field parity of the legacy model', () => {
        const paths = BudgetModel.schema.paths;

        expect(paths.Category).toBeDefined();
        expect(paths.Category.instance).toBe('ObjectId');
        expect(paths.Category.isRequired).toBe(true);
        expect((paths.Category as unknown as { options: { ref: string } }).options.ref).toBe('Category');

        expect(paths.Month).toBeDefined();
        expect(paths.Month.instance).toBe('Number');
        expect(paths.Month.isRequired).toBe(true);
        expect((paths.Month as unknown as { options: { min: number; max: number } }).options.min).toBe(1);
        expect((paths.Month as unknown as { options: { min: number; max: number } }).options.max).toBe(12);

        expect(paths.Year).toBeDefined();
        expect(paths.Year.instance).toBe('Number');
        expect(paths.Year.isRequired).toBe(true);

        expect(paths.Limit).toBeDefined();
        expect(paths.Limit.instance).toBe('Number');
        expect(paths.Limit.isRequired).toBe(true);
        expect((paths.Limit as unknown as { options: { min: number } }).options.min).toBe(0);
    });

    it('enables timestamps, disables the version key, and enables autoIndex, matching legacy schema options', () => {
        expect(BudgetModel.schema.get('timestamps')).toBe(true);
        expect(BudgetModel.schema.get('versionKey')).toBe(false);
        expect(BudgetModel.schema.get('autoIndex')).toBe(true);
    });

    it('enforces a unique compound index on Category/Month/Year', () => {
        const indexes = BudgetModel.schema.indexes();
        const compoundIndex = indexes.find(([fields]) => 'Category' in fields && 'Month' in fields && 'Year' in fields);

        expect(compoundIndex).toBeDefined();
        const [fields, options] = compoundIndex as [Record<string, number>, { unique?: boolean }];
        expect(fields).toEqual({ Category: 1, Month: 1, Year: 1 });
        expect(options.unique).toBe(true);
    });
});
