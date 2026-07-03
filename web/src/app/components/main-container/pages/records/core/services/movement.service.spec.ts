import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../../../../../../../environments/environment';
import { MovementService } from './movement.service';
import { ICreateMovement, IMovementFilter, TypeMovement } from '../models';

describe('MovementService', () => {
  let service: MovementService;
  let httpMock: HttpTestingController;
  const movementUrl = `${environment.apiUrl}/movement`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(MovementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMovementsByMonth()', () => {
    it('GETs the summary for the given year/month', () => {
      service.getMovementsByMonth(2026, 7).subscribe();

      const req = httpMock.expectOne(`${movementUrl}/summary/7/2026`);
      expect(req.request.method).toBe('GET');
      req.flush({
        month: 7,
        year: 2026,
        summary: { items: 0, amount: { income: 0, expense: 0 } },
        movements: [],
      });
    });
  });

  describe('getMovements()', () => {
    it('sends a plain GET to /movement/:startDate/:endDate when no filter is given', () => {
      service.getMovements('2026-07-01', '2026-07-31').subscribe();

      const req = httpMock.expectOne(`${movementUrl}/2026-07-01/2026-07-31`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('sends a POST with the filter body when a filter field is set', () => {
      const filter: IMovementFilter = { Type: TypeMovement.EGRESO };

      service.getMovements('2026-07-01', '2026-07-31', filter).subscribe();

      const req = httpMock.expectOne(`${movementUrl}/2026-07-01/2026-07-31`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(filter);
      req.flush([]);
    });

    it('returns an empty list when the filter matches nothing', () => {
      let result: unknown;
      service.getMovements('2026-07-01', '2026-07-31', { Type: TypeMovement.INGRESO }).subscribe(
        (res) => (result = res),
      );

      httpMock.expectOne(`${movementUrl}/2026-07-01/2026-07-31`).flush([]);

      expect(result).toEqual([]);
    });
  });

  describe('createMovement()', () => {
    it('POSTs the dto to /movement', () => {
      const dto: ICreateMovement = {
        Type: TypeMovement.EGRESO,
        Amount: 1500,
        Category: 'cat-id',
        Account: 'acc-id',
        Date: '2026-07-02',
      };

      service.createMovement(dto).subscribe();

      const req = httpMock.expectOne(movementUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({});
    });
  });

  describe('updateMovement()', () => {
    it('PUTs the changed fields to /movement/:id', () => {
      service.updateMovement('mov-id', { Amount: 2000 }).subscribe();

      const req = httpMock.expectOne(`${movementUrl}/mov-id`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ Amount: 2000 });
      req.flush({});
    });
  });

  describe('deleteMovement()', () => {
    it('DELETEs /movement/:id', () => {
      service.deleteMovement('mov-id').subscribe();

      const req = httpMock.expectOne(`${movementUrl}/mov-id`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
