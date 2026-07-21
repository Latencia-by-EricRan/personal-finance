import { describe, expect, it } from 'vitest';
import { Identity } from '../../../shared/domain/Identity';
import { Recurring } from './Recurring';

describe('Recurring', () => {
    describe('create', () => {
        it('creates a recurring with the provided named properties', () => {
            const recurring = Recurring.create({
                Type: 'egreso',
                Amount: 500,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439022',
                Description: 'Rent',
                Card: 'visa',
                Frequency: 'mensual',
                DayOfMonth: 5,
            });

            expect(recurring.type).toBe('egreso');
            expect(recurring.amount).toBe(500);
            expect(recurring.category).toBe('507f1f77bcf86cd799439011');
            expect(recurring.account).toBe('507f1f77bcf86cd799439022');
            expect(recurring.description).toBe('Rent');
            expect(recurring.card).toBe('visa');
            expect(recurring.frequency).toBe('mensual');
            expect(recurring.dayOfMonth).toBe(5);
            expect(recurring.id).toBeUndefined();
        });

        it('defaults Active to true and LastRunYearMonth to null when omitted', () => {
            const recurring = Recurring.create({
                Type: 'ingreso',
                Amount: 1000,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439022',
                Frequency: 'mensual',
                DayOfMonth: 1,
            });

            expect(recurring.active).toBe(true);
            expect(recurring.lastRunYearMonth).toBeNull();
            expect(recurring.description).toBe('');
            expect(recurring.card).toBe('');
        });

        it('preserves an explicit Active:false and a non-null LastRunYearMonth', () => {
            const recurring = Recurring.create({
                Type: 'ingreso',
                Amount: 1000,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439022',
                Frequency: 'mensual',
                DayOfMonth: 1,
                Active: false,
                LastRunYearMonth: '2026-06',
            });

            expect(recurring.active).toBe(false);
            expect(recurring.lastRunYearMonth).toBe('2026-06');
        });

        it('rejects an invalid Type', () => {
            expect(() =>
                Recurring.create({
                    Type: 'invalid' as unknown as 'ingreso',
                    Amount: 100,
                    Category: '507f1f77bcf86cd799439011',
                    Account: '507f1f77bcf86cd799439022',
                    Frequency: 'mensual',
                    DayOfMonth: 1,
                }),
            ).toThrow();
        });

        it('rejects a non-number Amount', () => {
            expect(() =>
                Recurring.create({
                    Type: 'egreso',
                    Amount: NaN,
                    Category: '507f1f77bcf86cd799439011',
                    Account: '507f1f77bcf86cd799439022',
                    Frequency: 'mensual',
                    DayOfMonth: 1,
                }),
            ).toThrow();
        });

        it('rejects an empty Category (required ref)', () => {
            expect(() =>
                Recurring.create({
                    Type: 'egreso',
                    Amount: 100,
                    Category: '',
                    Account: '507f1f77bcf86cd799439022',
                    Frequency: 'mensual',
                    DayOfMonth: 1,
                }),
            ).toThrow();
        });

        it('rejects an empty Account (required ref)', () => {
            expect(() =>
                Recurring.create({
                    Type: 'egreso',
                    Amount: 100,
                    Category: '507f1f77bcf86cd799439011',
                    Account: '',
                    Frequency: 'mensual',
                    DayOfMonth: 1,
                }),
            ).toThrow();
        });

        it('rejects an invalid Frequency', () => {
            expect(() =>
                Recurring.create({
                    Type: 'egreso',
                    Amount: 100,
                    Category: '507f1f77bcf86cd799439011',
                    Account: '507f1f77bcf86cd799439022',
                    Frequency: 'anual' as unknown as 'mensual',
                    DayOfMonth: 1,
                }),
            ).toThrow();
        });

        it('accepts DayOfMonth boundaries 1 and 31', () => {
            const low = Recurring.create({
                Type: 'egreso',
                Amount: 100,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439022',
                Frequency: 'mensual',
                DayOfMonth: 1,
            });
            const high = Recurring.create({
                Type: 'egreso',
                Amount: 100,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439022',
                Frequency: 'mensual',
                DayOfMonth: 31,
            });

            expect(low.dayOfMonth).toBe(1);
            expect(high.dayOfMonth).toBe(31);
        });

        it('rejects a DayOfMonth outside 1-31', () => {
            expect(() =>
                Recurring.create({
                    Type: 'egreso',
                    Amount: 100,
                    Category: '507f1f77bcf86cd799439011',
                    Account: '507f1f77bcf86cd799439022',
                    Frequency: 'mensual',
                    DayOfMonth: 0,
                }),
            ).toThrow();
            expect(() =>
                Recurring.create({
                    Type: 'egreso',
                    Amount: 100,
                    Category: '507f1f77bcf86cd799439011',
                    Account: '507f1f77bcf86cd799439022',
                    Frequency: 'mensual',
                    DayOfMonth: 32,
                }),
            ).toThrow();
        });

        it('rejects a non-integer DayOfMonth', () => {
            expect(() =>
                Recurring.create({
                    Type: 'egreso',
                    Amount: 100,
                    Category: '507f1f77bcf86cd799439011',
                    Account: '507f1f77bcf86cd799439022',
                    Frequency: 'mensual',
                    DayOfMonth: 5.5,
                }),
            ).toThrow();
        });

        it('only assigns whitelisted named properties (mass-assignment safe)', () => {
            const maliciousInput = {
                Type: 'egreso',
                Amount: 100,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439022',
                Frequency: 'mensual',
                DayOfMonth: 1,
                _id: 'client-supplied-id',
            } as unknown as Parameters<typeof Recurring.create>[0];

            const recurring = Recurring.create(maliciousInput);

            expect((recurring as unknown as Record<string, unknown>)._id).toBeUndefined();
        });
    });

    describe('rehydrate', () => {
        it('reconstructs a persisted recurring carrying its identity', () => {
            const id = Identity.create('507f1f77bcf86cd799439011');

            const recurring = Recurring.rehydrate(id, {
                Type: 'egreso',
                Amount: 500,
                Category: '507f1f77bcf86cd799439033',
                Account: '507f1f77bcf86cd799439044',
                Frequency: 'mensual',
                DayOfMonth: 5,
                Active: true,
                LastRunYearMonth: '2026-06',
            });

            expect(recurring.id?.equals(id)).toBe(true);
            expect(recurring.category).toBe('507f1f77bcf86cd799439033');
            expect(recurring.lastRunYearMonth).toBe('2026-06');
        });
    });

    describe('equals', () => {
        it('returns true when two recurrings share the same values and identity state', () => {
            const props = {
                Type: 'egreso' as const,
                Amount: 500,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439022',
                Frequency: 'mensual' as const,
                DayOfMonth: 5,
            };

            expect(Recurring.create(props).equals(Recurring.create(props))).toBe(true);
        });

        it('returns false when Amount differs', () => {
            const base = {
                Type: 'egreso' as const,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439022',
                Frequency: 'mensual' as const,
                DayOfMonth: 5,
            };

            expect(
                Recurring.create({ ...base, Amount: 100 }).equals(Recurring.create({ ...base, Amount: 200 })),
            ).toBe(false);
        });
    });
});
