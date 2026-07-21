import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../../../../../../../environments/environment';
import { TypeCategory } from '../../../../../../core/reference';
import { BudgetService } from './budget.service';
import { ICreateBudget, IBudgetDeleted, IBudgetPatch, IBudgetStatus, IBudgetView } from '../models';

describe('BudgetService', () => {
  let service: BudgetService;
  let httpMock: HttpTestingController;
  const budgetUrl = `${environment.apiUrl}/budget`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(BudgetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list()', () => {
    it('GETs /budget', () => {
      let result: IBudgetView[] | undefined;
      service.list().subscribe((res) => (result = res));

      const req = httpMock.expectOne(budgetUrl);
      expect(req.request.method).toBe('GET');
      const payload: IBudgetView[] = [
        {
          _id: 'budget-id',
          Category: 'cat-id',
          Month: 7,
          Year: 2026,
          Limit: 1000,
        },
      ];
      req.flush(payload);

      expect(result).toEqual(payload);
    });
  });

  describe('status()', () => {
    it('GETs /budget/status/:month/:year with populated Category', () => {
      let result: IBudgetStatus[] | undefined;
      service.status(7, 2026).subscribe((res) => (result = res));

      const req = httpMock.expectOne(`${budgetUrl}/status/7/2026`);
      expect(req.request.method).toBe('GET');
      const payload: IBudgetStatus[] = [
        {
          Category: { _id: 'cat-id', Name: 'Renta', Type: TypeCategory.FIJO },
          Limit: 1000,
          Spent: 500,
          Remaining: 500,
          Percent: 50,
        },
      ];
      req.flush(payload);

      expect(result).toEqual(payload);
    });
  });

  describe('create()', () => {
    it('POSTs the exact write body — bare id Category, no Spent/Remaining/Percent', () => {
      const dto: ICreateBudget = {
        Category: 'cat-id',
        Month: 7,
        Year: 2026,
        Limit: 1000,
      };

      service.create(dto).subscribe();

      const req = httpMock.expectOne(budgetUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      // Flushing a populated-status-shaped response proves the service
      // narrows the response type without smuggling extra fields into the
      // write body (asymmetry trap: read shape != write shape).
      req.flush({
        _id: 'budget-id',
        Category: 'cat-id',
        Month: 7,
        Year: 2026,
        Limit: 1000,
      });
    });
  });

  describe('update()', () => {
    it('PUTs a partial patch — bare id Category when present', () => {
      const patch: IBudgetPatch = { Category: 'cat-id-2', Limit: 1500 };

      service.update('budget-id', patch).subscribe();

      const req = httpMock.expectOne(`${budgetUrl}/budget-id`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(patch);
      req.flush({
        _id: 'budget-id',
        Category: 'cat-id-2',
        Month: 7,
        Year: 2026,
        Limit: 1500,
      });
    });
  });

  describe('remove()', () => {
    it('DELETEs /budget/:id and returns { deleted, id } — not void', () => {
      let result: IBudgetDeleted | undefined;
      service.remove('budget-id').subscribe((res) => (result = res));

      const req = httpMock.expectOne(`${budgetUrl}/budget-id`);
      expect(req.request.method).toBe('DELETE');
      const payload: IBudgetDeleted = { deleted: true, id: 'budget-id' };
      req.flush(payload);

      expect(result).toEqual(payload);
    });
  });
});
