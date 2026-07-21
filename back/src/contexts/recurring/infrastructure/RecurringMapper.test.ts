import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { Identity } from '../../../shared/domain/Identity';
import { Recurring } from '../domain/Recurring';
import { RecurringMapper } from './RecurringMapper';

describe('RecurringMapper', () => {
    describe('toPersistence', () => {
        it('maps a domain Recurring to a persistence document (bare Category/Account id strings)', () => {
            const mapper = new RecurringMapper();
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

            const persisted = mapper.toPersistence(recurring);

            expect(persisted).toEqual({
                Type: 'egreso',
                Amount: 500,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439022',
                Description: 'Rent',
                Card: 'visa',
                Frequency: 'mensual',
                DayOfMonth: 5,
                Active: true,
                LastRunYearMonth: null,
            });
        });
    });

    describe('toDomain', () => {
        it('rehydrates a domain Recurring from a persistence document and an explicit id', () => {
            const mapper = new RecurringMapper();
            const id = Identity.create('507f1f77bcf86cd799439011');

            const recurring = mapper.toDomain(id, {
                Type: 'ingreso',
                Amount: 1000,
                Category: '507f1f77bcf86cd799439022',
                Account: '507f1f77bcf86cd799439033',
                Frequency: 'mensual',
                DayOfMonth: 1,
                Active: true,
                LastRunYearMonth: '2026-06',
            });

            expect(recurring.id?.equals(id)).toBe(true);
            expect(recurring.category).toBe('507f1f77bcf86cd799439022');
            expect(recurring.lastRunYearMonth).toBe('2026-06');
        });
    });

    describe('toView', () => {
        it('echoes bare Category/Account ObjectIds as strings, with timestamps', () => {
            const mapper = new RecurringMapper();
            const id = new Types.ObjectId();
            const categoryId = new Types.ObjectId();
            const accountId = new Types.ObjectId();
            const createdAt = new Date(2026, 5, 1);
            const updatedAt = new Date(2026, 5, 2);

            const view = mapper.toView({
                _id: id,
                Type: 'egreso',
                Amount: 500,
                Category: categoryId,
                Account: accountId,
                Description: 'Rent',
                Card: 'visa',
                Frequency: 'mensual',
                DayOfMonth: 5,
                Active: true,
                LastRunYearMonth: '2026-07',
                createdAt,
                updatedAt,
            });

            expect(view).toEqual({
                _id: id.toString(),
                Type: 'egreso',
                Amount: 500,
                Category: categoryId.toString(),
                Account: accountId.toString(),
                Description: 'Rent',
                Card: 'visa',
                Frequency: 'mensual',
                DayOfMonth: 5,
                Active: true,
                LastRunYearMonth: '2026-07',
                createdAt,
                updatedAt,
            });
        });

        it('handles a null LastRunYearMonth and missing timestamps', () => {
            const mapper = new RecurringMapper();
            const id = new Types.ObjectId();

            const view = mapper.toView({
                _id: id,
                Type: 'ingreso',
                Amount: 100,
                Category: '507f1f77bcf86cd799439011',
                Account: '507f1f77bcf86cd799439022',
                Frequency: 'mensual',
                DayOfMonth: 1,
                Active: true,
                LastRunYearMonth: null,
            });

            expect(view.LastRunYearMonth).toBeNull();
            expect(view.createdAt).toBeUndefined();
            expect(view.updatedAt).toBeUndefined();
        });
    });
});
