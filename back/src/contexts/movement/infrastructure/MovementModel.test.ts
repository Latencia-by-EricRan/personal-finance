import mongoose from 'mongoose';
import { describe, expect, it } from 'vitest';
import MovementModel from './MovementModel';

describe('MovementModel', () => {
    it('registers exactly one Mongoose model named "Movement"', () => {
        const registrations = mongoose.modelNames().filter((name) => name === 'Movement');

        expect(registrations).toHaveLength(1);
    });

    it('is registered under the "movements" collection', () => {
        expect(MovementModel.collection.collectionName).toBe('movements');
    });

    it('preserves the PascalCase schema field parity of the legacy model', () => {
        const paths = MovementModel.schema.paths;

        expect(paths.Type).toBeDefined();
        expect(paths.Type.instance).toBe('String');
        expect(paths.Type.isRequired).toBe(true);
        expect((paths.Type as unknown as { enumValues: string[] }).enumValues).toEqual(['ingreso', 'egreso']);

        expect(paths.Amount).toBeDefined();
        expect(paths.Amount.instance).toBe('Number');
        expect(paths.Amount.isRequired).toBe(true);

        expect(paths.Date).toBeDefined();
        expect(paths.Date.instance).toBe('Date');
        expect(paths.Date.isRequired).toBe(true);

        expect(paths.Category).toBeDefined();
        expect(paths.Category.instance).toBe('ObjectId');
        expect(paths.Category.isRequired).toBeFalsy();
        expect((paths.Category as unknown as { options: { ref: string } }).options.ref).toBe('Category');

        expect(paths.Account).toBeDefined();
        expect(paths.Account.instance).toBe('ObjectId');
        expect(paths.Account.isRequired).toBe(true);
        expect((paths.Account as unknown as { options: { ref: string } }).options.ref).toBe('Account');

        expect(paths.TransferId).toBeDefined();
        expect(paths.TransferId.instance).toBe('String');
        expect(paths.TransferId.isRequired).toBeFalsy();

        expect(paths.Description).toBeDefined();
        expect(paths.Description.instance).toBe('String');
        expect(paths.Description.defaultValue).toBe('');

        expect(paths.Card).toBeDefined();
        expect(paths.Card.instance).toBe('String');
        expect(paths.Card.defaultValue).toBe('');
    });

    it('enables timestamps and disables the version key, matching legacy schema options', () => {
        expect(MovementModel.schema.get('timestamps')).toBe(true);
        expect(MovementModel.schema.get('versionKey')).toBe(false);
    });
});
