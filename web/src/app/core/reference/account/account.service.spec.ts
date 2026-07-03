import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { AccountService } from './account.service';
import { AccountType, IAccount, ITransfer } from './account.model';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;
  const accountUrl = `${environment.apiUrl}/account`;

  const accounts: IAccount[] = [
    { Name: 'Efectivo', Type: AccountType.EFECTIVO, Currency: 'ARS', _id: 'acc-1' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('ensureLoaded()', () => {
    it('GETs /account on first call and populates the accounts signal', () => {
      service.ensureLoaded();

      const req = httpMock.expectOne(accountUrl);
      expect(req.request.method).toBe('GET');
      req.flush(accounts);

      expect(service.accounts()).toEqual(accounts);
    });

    it('does not issue a second request on subsequent calls', () => {
      service.ensureLoaded();
      httpMock.expectOne(accountUrl).flush(accounts);

      service.ensureLoaded();

      httpMock.expectNone(accountUrl);
      expect().nothing();
    });
  });

  describe('getBalance()', () => {
    it('GETs /account/:id/balance', () => {
      service.getBalance('acc-1').subscribe();

      const req = httpMock.expectOne(`${accountUrl}/acc-1/balance`);
      expect(req.request.method).toBe('GET');
      req.flush(1000);
    });
  });

  describe('refresh()', () => {
    it('re-fetches /account even when already loaded, bypassing the loaded guard', () => {
      service.ensureLoaded();
      httpMock.expectOne(accountUrl).flush(accounts);

      const updated: IAccount[] = [
        { Name: 'Banco', Type: AccountType.BANCO, Currency: 'ARS', _id: 'acc-2' },
      ];
      service.refresh();

      const req = httpMock.expectOne(accountUrl);
      expect(req.request.method).toBe('GET');
      req.flush(updated);

      expect(service.accounts()).toEqual(updated);
    });
  });

  describe('transfer()', () => {
    it('rejects same-account transfers without an HTTP call', (done) => {
      const dto: ITransfer = { From: 'acc-1', To: 'acc-1', Amount: 100 };

      service.transfer(dto).subscribe({
        error: (err: unknown) => {
          expect(err).toBeTruthy();
          httpMock.expectNone(`${accountUrl}/transfer`);
          done();
        },
      });
    });

    it('rejects non-positive amounts without an HTTP call', (done) => {
      const dto: ITransfer = { From: 'acc-1', To: 'acc-2', Amount: 0 };

      service.transfer(dto).subscribe({
        error: (err: unknown) => {
          expect(err).toBeTruthy();
          httpMock.expectNone(`${accountUrl}/transfer`);
          done();
        },
      });
    });

    it('POSTs a valid transfer to /account/transfer', () => {
      const dto: ITransfer = { From: 'acc-1', To: 'acc-2', Amount: 500 };

      service.transfer(dto).subscribe();

      const req = httpMock.expectOne(`${accountUrl}/transfer`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(null);
    });
  });
});
