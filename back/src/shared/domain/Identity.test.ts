import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { Identity } from './Identity';

describe('Identity', () => {
    it('two instances wrapping the same id string are equal', () => {
        const a = Identity.create('507f1f77bcf86cd799439011');
        const b = Identity.create('507f1f77bcf86cd799439011');

        expect(a.equals(b)).toBe(true);
    });

    it('two instances wrapping different id strings are not equal', () => {
        const a = Identity.create('507f1f77bcf86cd799439011');
        const b = Identity.create('507f191e810c19729de860ea');

        expect(a.equals(b)).toBe(false);
    });

    it('rejects a malformed id at construction', () => {
        expect(() => Identity.create('not-a-valid-id')).toThrow();
    });

    it('accepts a valid 24-char hex id and wraps it', () => {
        const id = Identity.create('507f1f77bcf86cd799439011');

        expect(id.value).toBe('507f1f77bcf86cd799439011');
        expect(id.toString()).toBe('507f1f77bcf86cd799439011');
    });

    it('round-trips a Mongoose ObjectId through Identity and back', () => {
        const objectId = new Types.ObjectId('507f1f77bcf86cd799439011');

        const identity = Identity.fromObjectId(objectId);
        const roundTripped = identity.toObjectId();

        expect(roundTripped.toString()).toBe(objectId.toString());
    });

    it('generate() returns a 24-hex string accepted by Identity.create()', () => {
        const generated = Identity.generate();

        expect(generated).toMatch(/^[a-f0-9]{24}$/i);
        expect(() => Identity.create(generated)).not.toThrow();
    });

    it('generate() mints a fresh id on every call', () => {
        expect(Identity.generate()).not.toBe(Identity.generate());
    });
});
