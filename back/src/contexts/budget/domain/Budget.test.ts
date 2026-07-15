import { describe, expect, it } from 'vitest';
import { Identity } from '../../../shared/domain/Identity';
import { Budget } from './Budget';

describe('Budget', () => {
    describe('create', () => {
        it('creates a budget with the provided Category/Month/Year/Limit', () => {
            const budget = Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 6, Year: 2026, Limit: 500 });

            expect(budget.category).toBe('507f1f77bcf86cd799439011');
            expect(budget.month).toBe(6);
            expect(budget.year).toBe(2026);
            expect(budget.limit).toBe(500);
            expect(budget.id).toBeUndefined();
        });

        it('accepts a Limit of exactly 0 (boundary, not rejected)', () => {
            const budget = Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 1, Year: 2026, Limit: 0 });

            expect(budget.limit).toBe(0);
        });

        it('rejects an empty Category', () => {
            expect(() =>
                Budget.create({ Category: '', Month: 6, Year: 2026, Limit: 100 }),
            ).toThrow();
        });

        it('rejects a Month outside 1-12', () => {
            expect(() =>
                Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 0, Year: 2026, Limit: 100 }),
            ).toThrow();
            expect(() =>
                Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 13, Year: 2026, Limit: 100 }),
            ).toThrow();
        });

        it('rejects a non-integer Month', () => {
            expect(() =>
                Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 6.5, Year: 2026, Limit: 100 }),
            ).toThrow();
        });

        it('rejects a missing/invalid Year', () => {
            expect(() =>
                Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 6, Year: undefined as unknown as number, Limit: 100 }),
            ).toThrow();
        });

        it('rejects a negative Limit', () => {
            expect(() =>
                Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 6, Year: 2026, Limit: -1 }),
            ).toThrow();
        });

        it('only assigns whitelisted named properties (mass-assignment safe)', () => {
            const maliciousInput = {
                Category: '507f1f77bcf86cd799439011',
                Month: 6,
                Year: 2026,
                Limit: 100,
                _id: 'client-supplied-id',
            } as unknown as Parameters<typeof Budget.create>[0];

            const budget = Budget.create(maliciousInput);

            expect((budget as unknown as Record<string, unknown>)._id).toBeUndefined();
        });
    });

    describe('rehydrate', () => {
        it('reconstructs a persisted budget carrying its identity', () => {
            const id = Identity.create('507f1f77bcf86cd799439011');

            const budget = Budget.rehydrate(id, {
                Category: '507f1f77bcf86cd799439022',
                Month: 6,
                Year: 2026,
                Limit: 500,
            });

            expect(budget.id?.equals(id)).toBe(true);
            expect(budget.category).toBe('507f1f77bcf86cd799439022');
        });
    });

    describe('equals', () => {
        it('returns true when two budgets share the same values and identity state', () => {
            const props = { Category: '507f1f77bcf86cd799439011', Month: 6, Year: 2026, Limit: 500 };

            expect(Budget.create(props).equals(Budget.create(props))).toBe(true);
        });

        it('returns false when Limit differs', () => {
            expect(
                Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 6, Year: 2026, Limit: 100 }).equals(
                    Budget.create({ Category: '507f1f77bcf86cd799439011', Month: 6, Year: 2026, Limit: 200 }),
                ),
            ).toBe(false);
        });
    });
});
