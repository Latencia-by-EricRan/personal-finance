import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { Identity } from '../../../shared/domain/Identity';
import { Budget } from '../domain/Budget';
import { BudgetMapper } from './BudgetMapper';

describe('BudgetMapper', () => {
    describe('toPersistence', () => {
        it('maps a domain Budget to a persistence document (bare Category id string)', () => {
            const mapper = new BudgetMapper();
            const budget = Budget.create({
                Category: '507f1f77bcf86cd799439011',
                Month: 6,
                Year: 2026,
                Limit: 500,
            });

            const persisted = mapper.toPersistence(budget);

            expect(persisted).toEqual({
                Category: '507f1f77bcf86cd799439011',
                Month: 6,
                Year: 2026,
                Limit: 500,
            });
        });
    });

    describe('toDomain', () => {
        it('rehydrates a domain Budget from a persistence document and an explicit id', () => {
            const mapper = new BudgetMapper();
            const id = Identity.create('507f1f77bcf86cd799439011');

            const budget = mapper.toDomain(id, {
                Category: '507f1f77bcf86cd799439022',
                Month: 6,
                Year: 2026,
                Limit: 500,
            });

            expect(budget.id?.equals(id)).toBe(true);
            expect(budget.category).toBe('507f1f77bcf86cd799439022');
            expect(budget.limit).toBe(500);
        });
    });

    describe('toView', () => {
        it('echoes a POPULATED Category sub-document verbatim (find/findById shape)', () => {
            const mapper = new BudgetMapper();
            const id = new Types.ObjectId();
            const categoryId = new Types.ObjectId();
            const createdAt = new Date(2026, 5, 1);
            const updatedAt = new Date(2026, 5, 2);
            const populatedCategory = { _id: categoryId, Name: 'Comida', Type: 'egreso' };

            const view = mapper.toView({
                _id: id,
                Category: populatedCategory,
                Month: 6,
                Year: 2026,
                Limit: 500,
                createdAt,
                updatedAt,
            });

            expect(view).toEqual({
                _id: id.toString(),
                Category: populatedCategory,
                Month: 6,
                Year: 2026,
                Limit: 500,
                createdAt,
                updatedAt,
            });
        });

        it('echoes a BARE Category id string verbatim (create/update shape)', () => {
            const mapper = new BudgetMapper();
            const id = new Types.ObjectId();

            const view = mapper.toView({
                _id: id,
                Category: '507f1f77bcf86cd799439033',
                Month: 1,
                Year: 2026,
                Limit: 0,
            });

            expect(view).toEqual({
                _id: id.toString(),
                Category: '507f1f77bcf86cd799439033',
                Month: 1,
                Year: 2026,
                Limit: 0,
                createdAt: undefined,
                updatedAt: undefined,
            });
        });
    });
});
