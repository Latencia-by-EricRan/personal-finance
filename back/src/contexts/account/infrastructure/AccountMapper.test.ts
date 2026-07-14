import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { Identity } from '../../../shared/domain/Identity';
import { Account } from '../domain/Account';
import { AccountMapper } from './AccountMapper';

describe('AccountMapper', () => {
    describe('toPersistence', () => {
        it('maps a domain Account to a persistence document', () => {
            const mapper = new AccountMapper();
            const account = Account.create({
                Name: 'Efectivo',
                Type: 'efectivo',
                Currency: 'USD',
                Icon: '💵',
                Archived: true,
            });

            const persisted = mapper.toPersistence(account);

            expect(persisted).toEqual({
                Name: 'Efectivo',
                Type: 'efectivo',
                Currency: 'USD',
                Icon: '💵',
                Archived: true,
            });
        });
    });

    describe('toDomain', () => {
        it('rehydrates a domain Account from a persistence document and an explicit id', () => {
            const mapper = new AccountMapper();
            const id = Identity.create('507f1f77bcf86cd799439011');

            const account = mapper.toDomain(id, {
                Name: 'Banco',
                Type: 'banco',
                Currency: 'ARS',
                Icon: '',
                Archived: false,
            });

            expect(account.id?.equals(id)).toBe(true);
            expect(account.name).toBe('Banco');
            expect(account.currency).toBe('ARS');
        });
    });

    describe('toView', () => {
        it('maps a read row to an AccountView, passing through createdAt/updatedAt', () => {
            const mapper = new AccountMapper();
            const id = new Types.ObjectId();
            const createdAt = new Date(2026, 5, 1);
            const updatedAt = new Date(2026, 5, 2);

            const view = mapper.toView({
                _id: id,
                Name: 'Tarjeta',
                Type: 'tarjeta',
                Currency: 'ARS',
                Icon: '',
                Archived: false,
                createdAt,
                updatedAt,
            });

            expect(view).toEqual({
                _id: id.toString(),
                Name: 'Tarjeta',
                Type: 'tarjeta',
                Currency: 'ARS',
                Icon: '',
                Archived: false,
                createdAt,
                updatedAt,
            });
        });

        it('leaves createdAt/updatedAt undefined when the row has none', () => {
            const mapper = new AccountMapper();

            const view = mapper.toView({
                _id: new Types.ObjectId(),
                Name: 'Efectivo',
                Type: 'efectivo',
                Currency: 'ARS',
                Icon: '',
                Archived: false,
            });

            expect(view.createdAt).toBeUndefined();
            expect(view.updatedAt).toBeUndefined();
        });
    });
});
