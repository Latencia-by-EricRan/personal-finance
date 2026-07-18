import { describe, expect, it } from 'vitest';
import { InMemoryMovementGateway } from '../infrastructure/InMemoryMovementGateway';
import { GetReportCashflow } from './GetReportCashflow';

describe('GetReportCashflow', () => {
    it('computes Income/Expense/Net from a mix of ingreso/egreso movements', async () => {
        const gateway = new InMemoryMovementGateway();
        gateway.seed({ Type: 'ingreso', Category: null, Amount: 2000, Date: new Date(2026, 6, 8) });
        gateway.seed({ Type: 'ingreso', Category: null, Amount: 500, Date: new Date(2026, 6, 20) });
        gateway.seed({ Type: 'egreso', Category: null, Amount: 800, Date: new Date(2026, 6, 12) });
        gateway.seed({ Type: 'egreso', Category: null, Amount: 200, Date: new Date(2026, 6, 25) });

        const result = await new GetReportCashflow(gateway).execute(7, 2026);

        expect(result).toEqual({ Month: 7, Year: 2026, Income: 2500, Expense: 1000, Net: 1500 });
    });

    it('returns zeroes when there are no movements in the month', async () => {
        const gateway = new InMemoryMovementGateway();

        const result = await new GetReportCashflow(gateway).execute(3, 2026);

        expect(result).toEqual({ Month: 3, Year: 2026, Income: 0, Expense: 0, Net: 0 });
    });
});
