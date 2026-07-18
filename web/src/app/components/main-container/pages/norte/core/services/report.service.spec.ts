import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../../../../../../../environments/environment';
import { TypeCategory } from '../../../../../../core/reference';
import { ReportService } from './report.service';
import { IReportByCategory, IReportCashflow, IReportMonthly } from '../models';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;
  const reportUrl = `${environment.apiUrl}/report`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('byCategory()', () => {
    it('GETs /report/by-category/:month/:year', () => {
      let result: IReportByCategory[] | undefined;
      service.byCategory(7, 2026).subscribe((res) => (result = res));

      const req = httpMock.expectOne(`${reportUrl}/by-category/7/2026`);
      expect(req.request.method).toBe('GET');
      const payload: IReportByCategory[] = [
        {
          Category: { _id: 'cat-id', Name: 'Renta', Type: TypeCategory.FIJO },
          Total: 500,
        },
      ];
      req.flush(payload);

      expect(result).toEqual(payload);
    });
  });

  describe('monthly()', () => {
    it('GETs /report/monthly/:year', () => {
      let result: IReportMonthly[] | undefined;
      service.monthly(2026).subscribe((res) => (result = res));

      const req = httpMock.expectOne(`${reportUrl}/monthly/2026`);
      expect(req.request.method).toBe('GET');
      const payload: IReportMonthly[] = Array.from({ length: 12 }, (_, i) => ({
        Month: i + 1,
        Income: 0,
        Expense: 0,
        Net: 0,
      }));
      req.flush(payload);

      expect(result).toEqual(payload);
      expect(result?.length).toBe(12);
    });
  });

  describe('cashflow()', () => {
    it('GETs /report/cashflow/:month/:year', () => {
      let result: IReportCashflow | undefined;
      service.cashflow(7, 2026).subscribe((res) => (result = res));

      const req = httpMock.expectOne(`${reportUrl}/cashflow/7/2026`);
      expect(req.request.method).toBe('GET');
      const payload: IReportCashflow = { Month: 7, Year: 2026, Income: 1000, Expense: 500, Net: 500 };
      req.flush(payload);

      expect(result).toEqual(payload);
    });
  });
});
