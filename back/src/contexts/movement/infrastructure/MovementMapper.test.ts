import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';
import { Identity } from '../../../shared/domain/Identity';
import { Movement, MovementType } from '../domain/Movement';
import { MovementMapper } from './MovementMapper';

describe('MovementMapper', () => {
    describe('toPersistence', () => {
        it('maps a domain Movement to a persistence document with ObjectId refs', () => {
            const mapper = new MovementMapper();
            const accountId = new Types.ObjectId().toString();
            const categoryId = new Types.ObjectId().toString();
            const movement = Movement.create({
                Type: MovementType.EGRESO,
                Amount: 40,
                Date: new Date(2026, 5, 15),
                Account: accountId,
                Category: categoryId,
                Description: 'Groceries',
                Card: 'visa',
            });

            const persisted = mapper.toPersistence(movement);

            expect(persisted.Type).toBe(MovementType.EGRESO);
            expect(persisted.Amount).toBe(40);
            expect(persisted.Account.toString()).toBe(accountId);
            expect(persisted.Category?.toString()).toBe(categoryId);
            expect(persisted.Description).toBe('Groceries');
            expect(persisted.Card).toBe('visa');
            expect(persisted.TransferId).toBeUndefined();
        });

        it('omits Category when the movement has none (e.g. transfer-generated movements)', () => {
            const mapper = new MovementMapper();
            const movement = Movement.create({
                Type: MovementType.INGRESO,
                Amount: 10,
                Date: new Date(2026, 5, 15),
                Account: new Types.ObjectId().toString(),
            });

            const persisted = mapper.toPersistence(movement);

            expect(persisted.Category).toBeUndefined();
        });
    });

    describe('toDomain', () => {
        it('rehydrates a domain Movement from a persistence document and an explicit id', () => {
            const mapper = new MovementMapper();
            const id = Identity.create('507f1f77bcf86cd799439011');
            const accountId = new Types.ObjectId();

            const movement = mapper.toDomain(id, {
                Type: MovementType.INGRESO,
                Amount: 250,
                Date: new Date(2026, 5, 1),
                Account: accountId,
            });

            expect(movement.id?.equals(id)).toBe(true);
            expect(movement.amount).toBe(250);
            expect(movement.account).toBe(accountId.toString());
        });
    });

    describe('toView', () => {
        it('maps an unpopulated Category (bare ObjectId) to a plain id string', () => {
            const mapper = new MovementMapper();
            const categoryId = new Types.ObjectId();
            const accountId = new Types.ObjectId();

            const view = mapper.toView({
                _id: new Types.ObjectId(),
                Type: MovementType.EGRESO,
                Amount: 40,
                Date: new Date(2026, 5, 15),
                Category: categoryId,
                Account: accountId,
            });

            expect(view.Category).toBe(categoryId.toString());
            expect(view.Account).toBe(accountId.toString());
        });

        it('maps a populated Category sub-document to a CategoryView object with a string _id', () => {
            const mapper = new MovementMapper();
            const categoryId = new Types.ObjectId();

            const view = mapper.toView({
                _id: new Types.ObjectId(),
                Type: MovementType.INGRESO,
                Amount: 100,
                Date: new Date(2026, 5, 1),
                Category: {
                    _id: categoryId,
                    Description: 'Salary',
                    Name: 'Salary',
                    Tag: '',
                    Type: 'fijo',
                    Icon: '',
                },
                Account: new Types.ObjectId(),
            });

            expect(view.Category).toEqual({
                _id: categoryId.toString(),
                Description: 'Salary',
                Name: 'Salary',
                Tag: '',
                Type: 'fijo',
                Icon: '',
            });
        });

        it('leaves Category undefined when the row has none', () => {
            const mapper = new MovementMapper();

            const view = mapper.toView({
                _id: new Types.ObjectId(),
                Type: MovementType.EGRESO,
                Amount: 5,
                Date: new Date(2026, 5, 1),
                Account: new Types.ObjectId(),
            });

            expect(view.Category).toBeUndefined();
        });
    });
});
