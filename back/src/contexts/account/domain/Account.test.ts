import { describe, expect, it } from 'vitest';
import { Identity } from '../../../shared/domain/Identity';
import { Account } from './Account';

describe('Account', () => {
    describe('create', () => {
        it('creates an account defaulting Currency/Icon/Archived when omitted', () => {
            const account = Account.create({ Name: 'Efectivo', Type: 'efectivo' });

            expect(account.name).toBe('Efectivo');
            expect(account.type).toBe('efectivo');
            expect(account.currency).toBe('ARS');
            expect(account.icon).toBe('');
            expect(account.archived).toBe(false);
            expect(account.id).toBeUndefined();
        });

        it('keeps provided Currency, Icon and Archived', () => {
            const account = Account.create({
                Name: 'Banco',
                Type: 'banco',
                Currency: 'USD',
                Icon: '🏦',
                Archived: true,
            });

            expect(account.currency).toBe('USD');
            expect(account.icon).toBe('🏦');
            expect(account.archived).toBe(true);
        });

        it('trims Name', () => {
            const account = Account.create({ Name: '  Tarjeta  ', Type: 'tarjeta' });

            expect(account.name).toBe('Tarjeta');
        });

        it('rejects an empty or blank Name', () => {
            expect(() => Account.create({ Name: '', Type: 'efectivo' })).toThrow();
            expect(() => Account.create({ Name: '   ', Type: 'efectivo' })).toThrow();
        });

        it('rejects a Type outside efectivo/banco/tarjeta', () => {
            expect(() => Account.create({ Name: 'X', Type: 'bogus' as never })).toThrow();
        });

        it('rejects a blank Currency when explicitly provided', () => {
            expect(() => Account.create({ Name: 'X', Type: 'efectivo', Currency: '   ' })).toThrow();
        });

        it('only assigns whitelisted named properties (mass-assignment safe)', () => {
            const maliciousInput = {
                Name: 'X',
                Type: 'efectivo',
                _id: 'client-supplied-id',
            } as unknown as Parameters<typeof Account.create>[0];

            const account = Account.create(maliciousInput);

            expect((account as unknown as Record<string, unknown>)._id).toBeUndefined();
        });
    });

    describe('rehydrate', () => {
        it('reconstructs a persisted account carrying its identity', () => {
            const id = Identity.create('507f1f77bcf86cd799439011');

            const account = Account.rehydrate(id, { Name: 'Efectivo', Type: 'efectivo' });

            expect(account.id?.equals(id)).toBe(true);
            expect(account.name).toBe('Efectivo');
        });
    });

    describe('equals', () => {
        it('returns true when two accounts share the same values and identity state', () => {
            const props = { Name: 'Efectivo', Type: 'efectivo' as const };

            expect(Account.create(props).equals(Account.create(props))).toBe(true);
        });

        it('returns false when Name differs', () => {
            expect(
                Account.create({ Name: 'A', Type: 'efectivo' }).equals(
                    Account.create({ Name: 'B', Type: 'efectivo' }),
                ),
            ).toBe(false);
        });
    });
});
