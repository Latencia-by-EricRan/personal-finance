import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { monthYearParamValidator, yearParamValidator } from './report.validator';

/**
 * Copied 1:1 from the legacy `modules/validators/report.validator.ts`
 * (design PR2, mirrors recurring.validator's PR1 precedent): route table/
 * validation behavior stays byte-identical, only the file's location changes
 * to become `report`'s inbound HTTP infrastructure. Legacy had no dedicated
 * test file for this validator — written test-first here (strict TDD).
 */

const mockRes = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockReq = (overrides: Partial<Request>): Request => ({ ...overrides } as unknown as Request);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('monthYearParamValidator', () => {
    it('calls next() for a valid month/year', async () => {
        const req = mockReq({ params: { month: '6', year: '2050' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await monthYearParamValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 when month is below 1', async () => {
        const req = mockReq({ params: { month: '0', year: '2050' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await monthYearParamValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when month is above 12', async () => {
        const req = mockReq({ params: { month: '13', year: '2050' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await monthYearParamValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when year is below 2000', async () => {
        const req = mockReq({ params: { month: '6', year: '1999' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await monthYearParamValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects with 400 when year is above 2100', async () => {
        const req = mockReq({ params: { month: '6', year: '2101' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await monthYearParamValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});

describe('yearParamValidator', () => {
    it('calls next() for a valid year', async () => {
        const req = mockReq({ params: { year: '2050' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await yearParamValidator(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects with 400 when year is out of range', async () => {
        const req = mockReq({ params: { year: '3000' } });
        const res = mockRes();
        const next: NextFunction = vi.fn();

        await yearParamValidator(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
