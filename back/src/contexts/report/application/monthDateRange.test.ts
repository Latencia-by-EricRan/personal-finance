import { describe, expect, it } from 'vitest';
import { monthDateRange } from './monthDateRange';

describe('monthDateRange', () => {
    it('returns the inclusive [last day of prev month, last day of month] window for a mid-year month', () => {
        const result = monthDateRange(7, 2026);

        expect(result).toEqual({ gteDate: new Date(2026, 6, 0), lteDate: new Date(2026, 7, 0) });
    });

    it('rolls over correctly for January (month=1) into the previous year boundary', () => {
        const result = monthDateRange(1, 2026);

        expect(result).toEqual({ gteDate: new Date(2026, 0, 0), lteDate: new Date(2026, 1, 0) });
        expect(result.gteDate.getFullYear()).toBe(2025);
        expect(result.gteDate.getMonth()).toBe(11);
        expect(result.gteDate.getDate()).toBe(31);
    });
});
