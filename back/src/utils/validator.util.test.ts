import { describe, expect, it } from 'vitest';
import { checkDate, checkKeys } from './validator.util';

describe('checkDate', () => {
    it('accepts a YYYY-MM-DD string', () => {
        expect(checkDate('2026-01-15')).toBe(true);
    });

    it('rejects a string in a different format', () => {
        expect(checkDate('15/01/2026')).toBe(false);
    });

    it('rejects a malformed YYYY-MM-DD-like string', () => {
        expect(checkDate('2026-1-15')).toBe(false);
    });

    it('accepts a Date instance', () => {
        expect(checkDate(new Date())).toBe(true);
    });
});

describe('checkKeys', () => {
    it('returns true when every key is in the whitelist', () => {
        expect(checkKeys(['Name', 'Type'], { Name: 'Food', Type: 'variable' })).toBe(true);
    });

    it('throws when the body has no keys', () => {
        expect(() => checkKeys(['Name'], {})).toThrow('No parameters were provided');
    });

    it('throws naming the invalid keys', () => {
        expect(() => checkKeys(['Name'], { Name: 'Food', Evil: 'x' })).toThrow('Invalid parameters: Evil');
    });
});
