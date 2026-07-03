import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/report.service', () => ({
    default: {
        byCategory: vi.fn(),
        monthly: vi.fn(),
        cashflow: vi.fn(),
    },
}));

import ReportService from '../services/report.service';
import { getReportByCategory, getReportCashflow, getReportMonthly } from './report.controller';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getReportByCategory', () => {
    it('delegates to ReportService.byCategory with numeric month/year', async () => {
        const report = [{ Category: { _id: 'cat1' }, Total: 150 }];
        vi.mocked(ReportService.byCategory).mockResolvedValue(report as never);
        const req = { params: { month: '7', year: '2026' } } as unknown as Request;
        const res = mockRes();

        await getReportByCategory(req, res);

        expect(ReportService.byCategory).toHaveBeenCalledWith(7, 2026);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(report);
    });

    it('responds 500 on service error', async () => {
        vi.mocked(ReportService.byCategory).mockRejectedValue(new Error('boom'));
        const req = { params: { month: '7', year: '2026' } } as unknown as Request;
        const res = mockRes();

        await getReportByCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
    });
});

describe('getReportMonthly', () => {
    it('delegates to ReportService.monthly with numeric year', async () => {
        const report = [{ Month: 1, Income: 0, Expense: 0, Net: 0 }];
        vi.mocked(ReportService.monthly).mockResolvedValue(report as never);
        const req = { params: { year: '2026' } } as unknown as Request;
        const res = mockRes();

        await getReportMonthly(req, res);

        expect(ReportService.monthly).toHaveBeenCalledWith(2026);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(report);
    });

    it('responds 500 on service error', async () => {
        vi.mocked(ReportService.monthly).mockRejectedValue(new Error('boom'));
        const req = { params: { year: '2026' } } as unknown as Request;
        const res = mockRes();

        await getReportMonthly(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
    });
});

describe('getReportCashflow', () => {
    it('delegates to ReportService.cashflow with numeric month/year', async () => {
        const report = { Month: 7, Year: 2026, Income: 2500, Expense: 1000, Net: 1500 };
        vi.mocked(ReportService.cashflow).mockResolvedValue(report as never);
        const req = { params: { month: '7', year: '2026' } } as unknown as Request;
        const res = mockRes();

        await getReportCashflow(req, res);

        expect(ReportService.cashflow).toHaveBeenCalledWith(7, 2026);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(report);
    });

    it('responds 500 on service error', async () => {
        vi.mocked(ReportService.cashflow).mockRejectedValue(new Error('boom'));
        const req = { params: { month: '7', year: '2026' } } as unknown as Request;
        const res = mockRes();

        await getReportCashflow(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
    });
});
