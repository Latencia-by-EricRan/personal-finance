import { describe, expect, it } from 'vitest';
import { Identity } from '../../../shared/domain/Identity';
import { Movement, MovementType } from './Movement';

describe('Movement', () => {
    describe('create', () => {
        it('creates a movement defaulting Description/Card to empty string when omitted', () => {
            const movement = Movement.create({
                Type: MovementType.EGRESO,
                Amount: 40,
                Date: new Date(2026, 5, 15),
                Account: '507f1f77bcf86cd799439011',
            });

            expect(movement.type).toBe(MovementType.EGRESO);
            expect(movement.amount).toBe(40);
            expect(movement.date).toEqual(new Date(2026, 5, 15));
            expect(movement.account).toBe('507f1f77bcf86cd799439011');
            expect(movement.category).toBeUndefined();
            expect(movement.description).toBe('');
            expect(movement.card).toBe('');
            expect(movement.id).toBeUndefined();
        });

        it('keeps a provided Category, Description and Card', () => {
            const movement = Movement.create({
                Type: MovementType.INGRESO,
                Amount: 100,
                Date: new Date(2026, 5, 10),
                Account: '507f1f77bcf86cd799439011',
                Category: '507f1f77bcf86cd799439022',
                Description: 'Salary',
                Card: 'visa',
            });

            expect(movement.category).toBe('507f1f77bcf86cd799439022');
            expect(movement.description).toBe('Salary');
            expect(movement.card).toBe('visa');
        });

        it('rejects a Type outside ingreso/egreso', () => {
            expect(() =>
                Movement.create({
                    Type: 'bogus' as never,
                    Amount: 10,
                    Date: new Date(),
                    Account: '507f1f77bcf86cd799439011',
                }),
            ).toThrow();
        });

        it('rejects a non-number Amount', () => {
            expect(() =>
                Movement.create({
                    Type: MovementType.EGRESO,
                    Amount: 'ten' as unknown as number,
                    Date: new Date(),
                    Account: '507f1f77bcf86cd799439011',
                }),
            ).toThrow();
        });

        it('rejects an empty or blank Account', () => {
            expect(() =>
                Movement.create({ Type: MovementType.EGRESO, Amount: 10, Date: new Date(), Account: '' }),
            ).toThrow();
            expect(() =>
                Movement.create({ Type: MovementType.EGRESO, Amount: 10, Date: new Date(), Account: '   ' }),
            ).toThrow();
        });

        it('rejects an invalid Date', () => {
            expect(() =>
                Movement.create({
                    Type: MovementType.EGRESO,
                    Amount: 10,
                    Date: new Date('not-a-date'),
                    Account: '507f1f77bcf86cd799439011',
                }),
            ).toThrow();
        });

        it('only assigns whitelisted named properties, structurally ignoring TransferId (mass-assignment safe)', () => {
            const maliciousInput = {
                Type: MovementType.EGRESO,
                Amount: 10,
                Date: new Date(2026, 5, 15),
                Account: '507f1f77bcf86cd799439011',
                TransferId: 'client-supplied-transfer-id',
            } as unknown as Parameters<typeof Movement.create>[0];

            const movement = Movement.create(maliciousInput);

            expect((movement as unknown as Record<string, unknown>).TransferId).toBeUndefined();
        });
    });

    describe('rehydrate', () => {
        it('reconstructs a persisted movement carrying its identity', () => {
            const id = Identity.create('507f1f77bcf86cd799439011');

            const movement = Movement.rehydrate(id, {
                Type: MovementType.INGRESO,
                Amount: 250,
                Date: new Date(2026, 5, 1),
                Account: '507f1f77bcf86cd799439033',
            });

            expect(movement.id?.equals(id)).toBe(true);
            expect(movement.amount).toBe(250);
        });
    });

    describe('equals', () => {
        it('returns true when two movements share the same values and identity state', () => {
            const props = {
                Type: MovementType.EGRESO,
                Amount: 40,
                Date: new Date(2026, 5, 15),
                Account: '507f1f77bcf86cd799439011',
            };

            expect(Movement.create(props).equals(Movement.create(props))).toBe(true);
        });

        it('returns false when Amount differs', () => {
            const base = {
                Type: MovementType.EGRESO,
                Date: new Date(2026, 5, 15),
                Account: '507f1f77bcf86cd799439011',
            };

            expect(Movement.create({ ...base, Amount: 40 }).equals(Movement.create({ ...base, Amount: 41 }))).toBe(
                false,
            );
        });
    });
});
