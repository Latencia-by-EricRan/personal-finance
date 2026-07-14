import mongoose from 'mongoose';
import { describe, expect, it } from 'vitest';
import AccountModel from './AccountModel';

describe('AccountModel', () => {
    it('registers exactly one Mongoose model named "Account"', () => {
        const registrations = mongoose.modelNames().filter((name) => name === 'Account');

        expect(registrations).toHaveLength(1);
    });

    it('is registered under the "accounts" collection', () => {
        expect(AccountModel.collection.collectionName).toBe('accounts');
    });

    it('preserves the PascalCase schema field parity of the legacy model', () => {
        const paths = AccountModel.schema.paths;

        expect(paths.Name).toBeDefined();
        expect(paths.Name.instance).toBe('String');
        expect(paths.Name.isRequired).toBe(true);

        expect(paths.Type).toBeDefined();
        expect(paths.Type.instance).toBe('String');
        expect(paths.Type.isRequired).toBe(true);
        expect((paths.Type as unknown as { enumValues: string[] }).enumValues).toEqual(['efectivo', 'banco', 'tarjeta']);

        expect(paths.Currency).toBeDefined();
        expect(paths.Currency.instance).toBe('String');
        expect(paths.Currency.defaultValue).toBe('ARS');

        expect(paths.Icon).toBeDefined();
        expect(paths.Icon.instance).toBe('String');
        expect(paths.Icon.defaultValue).toBe('');

        expect(paths.Archived).toBeDefined();
        expect(paths.Archived.instance).toBe('Boolean');
        expect(paths.Archived.defaultValue).toBe(false);
    });

    it('enables timestamps, disables the version key, and enables autoIndex, matching legacy schema options', () => {
        expect(AccountModel.schema.get('timestamps')).toBe(true);
        expect(AccountModel.schema.get('versionKey')).toBe(false);
        expect(AccountModel.schema.get('autoIndex')).toBe(true);
    });
});
