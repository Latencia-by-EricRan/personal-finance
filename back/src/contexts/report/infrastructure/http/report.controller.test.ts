import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportUseCases } from '../../application/ReportUseCases';
import { createReportController } from './report.controller';

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const makeUseCases = (): ReportUseCases => ({
    getReportByCategory: { execute: vi.fn() } as never,
    getReportMonthly: { execute: vi.fn() } as never,
    getReportCashflow: { execute: vi.fn() } as never,
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe('createReportController', () => {
    describe('getReportByCategory', () => {
        it('delegates to getReportByCategory.execute with numeric month/year and responds 200', async () => {
            const useCases = makeUseCases();
            const report = [{ Category: { _id: 'c1', Name: 'Cat A' }, Total: 150 }];
            vi.mocked(useCases.getReportByCategory.execute).mockResolvedValue(report as never);
            const controller = createReportController(useCases);
            const req = { params: { month: '6', year: '2050' } } as unknown as Request;
            const res = mockRes();

            await controller.getReportByCategory(req, res);

            expect(useCases.getReportByCategory.execute).toHaveBeenCalledWith(6, 2050);
            expect(res.json).toHaveBeenCalledWith(report);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 500 on use case error', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.getReportByCategory.execute).mockRejectedValue(new Error('boom'));
            const controller = createReportController(useCases);
            const req = { params: { month: '6', year: '2050' } } as unknown as Request;
            const res = mockRes();

            await controller.getReportByCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
        });
    });

    describe('getReportMonthly', () => {
        it('delegates to getReportMonthly.execute with numeric year and responds 200', async () => {
            const useCases = makeUseCases();
            const report = [{ Month: 1, Income: 0, Expense: 0, Net: 0 }];
            vi.mocked(useCases.getReportMonthly.execute).mockResolvedValue(report as never);
            const controller = createReportController(useCases);
            const req = { params: { year: '2051' } } as unknown as Request;
            const res = mockRes();

            await controller.getReportMonthly(req, res);

            expect(useCases.getReportMonthly.execute).toHaveBeenCalledWith(2051);
            expect(res.json).toHaveBeenCalledWith(report);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 500 on use case error', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.getReportMonthly.execute).mockRejectedValue(new Error('boom'));
            const controller = createReportController(useCases);
            const req = { params: { year: '2051' } } as unknown as Request;
            const res = mockRes();

            await controller.getReportMonthly(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
        });
    });

    describe('getReportCashflow', () => {
        it('delegates to getReportCashflow.execute with numeric month/year and responds 200', async () => {
            const useCases = makeUseCases();
            const report = { Month: 9, Year: 2052, Income: 800, Expense: 350, Net: 450 };
            vi.mocked(useCases.getReportCashflow.execute).mockResolvedValue(report as never);
            const controller = createReportController(useCases);
            const req = { params: { month: '9', year: '2052' } } as unknown as Request;
            const res = mockRes();

            await controller.getReportCashflow(req, res);

            expect(useCases.getReportCashflow.execute).toHaveBeenCalledWith(9, 2052);
            expect(res.json).toHaveBeenCalledWith(report);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('responds 500 on use case error', async () => {
            const useCases = makeUseCases();
            vi.mocked(useCases.getReportCashflow.execute).mockRejectedValue(new Error('boom'));
            const controller = createReportController(useCases);
            const req = { params: { month: '9', year: '2052' } } as unknown as Request;
            const res = mockRes();

            await controller.getReportCashflow(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'boom' });
        });
    });
});
