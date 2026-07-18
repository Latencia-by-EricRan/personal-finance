import { describe, expect, it, vi } from 'vitest';
import { InMemoryMovementGateway } from '../infrastructure/InMemoryMovementGateway';
import { GetReportMonthly } from './GetReportMonthly';

describe('GetReportMonthly', () => {
    it('returns exactly 12 entries, including months with zero movements', async () => {
        const gateway = new InMemoryMovementGateway();
        gateway.seed({ Type: 'ingreso', Category: null, Amount: 1000, Date: new Date(2026, 4, 10) });
        gateway.seed({ Type: 'egreso', Category: null, Amount: 400, Date: new Date(2026, 4, 15) });
        gateway.seed({ Type: 'egreso', Category: null, Amount: 100, Date: new Date(2026, 4, 20) });

        const result = await new GetReportMonthly(gateway).execute(2026);

        expect(result).toHaveLength(12);
        expect(result[0]).toEqual({ Month: 1, Income: 0, Expense: 0, Net: 0 });
        expect(result[4]).toEqual({ Month: 5, Income: 1000, Expense: 500, Net: 500 });
        expect(result[11]).toEqual({ Month: 12, Income: 0, Expense: 0, Net: 0 });
        expect(result.map((entry) => entry.Month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it('queries the gateway for each month using the same date-window construction as the legacy service', async () => {
        const gateway = new InMemoryMovementGateway();
        const findByDateRangeSpy = vi.spyOn(gateway, 'findByDateRange');

        await new GetReportMonthly(gateway).execute(2026);

        expect(findByDateRangeSpy).toHaveBeenNthCalledWith(7, new Date(2026, 6, 0), new Date(2026, 7, 0));
    });
});
