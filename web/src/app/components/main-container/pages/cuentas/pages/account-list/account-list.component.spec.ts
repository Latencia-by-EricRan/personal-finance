import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AccountListComponent } from './account-list.component';
import { AccountType, IAccount } from '../../../../../../core/reference';
import { environment } from '../../../../../../../environments/environment';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;
  let httpMock: HttpTestingController;
  const accountUrl = `${environment.apiUrl}/account`;

  const mockAccounts: IAccount[] = [
    { _id: 'acc-1', Name: 'Efectivo', Type: AccountType.EFECTIVO, Currency: 'ARS', Icon: '💵' },
    { _id: 'acc-2', Name: 'Banco', Type: AccountType.BANCO, Currency: 'ARS', Icon: '🏦' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountListComponent],
      providers: [provideExperimentalZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function loadAccounts(accounts: IAccount[]): void {
    fixture.detectChanges();
    httpMock.expectOne(accountUrl).flush(accounts);
    fixture.detectChanges();
  }

  function flushBalance(id: string, balance: number): void {
    httpMock.expectOne(`${accountUrl}/${id}/balance`).flush(balance);
  }

  it('should create', () => {
    loadAccounts([]);
    expect(component).toBeTruthy();
  });

  it('renders the empty state when there are no accounts', () => {
    loadAccounts([]);
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.account-list__empty');
    expect(empty).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.account-list__item').length).toBe(0);
  });

  describe('with accounts loaded', () => {
    beforeEach(() => {
      loadAccounts(mockAccounts);
    });

    it('renders one row per account with its name', () => {
      flushBalance('acc-1', 1000);
      flushBalance('acc-2', 2500);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.account-list__item');
      expect(rows.length).toBe(mockAccounts.length);
      expect(fixture.nativeElement.textContent).toContain('Efectivo');
      expect(fixture.nativeElement.textContent).toContain('Banco');
    });

    it('fetches and renders the balance for each account via getBalance(id)', () => {
      flushBalance('acc-1', 1000);
      flushBalance('acc-2', 2500);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('1000');
      expect(fixture.nativeElement.textContent).toContain('2500');
    });

    it('opens the transfer sheet when the transfer button is clicked', () => {
      flushBalance('acc-1', 1000);
      flushBalance('acc-2', 2500);
      fixture.detectChanges();

      expect(component.showTransferSheet()).toBeFalse();

      const button = fixture.nativeElement.querySelector('.account-list__transfer-btn');
      button.click();
      fixture.detectChanges();

      expect(component.showTransferSheet()).toBeTrue();
    });

    it('closes the transfer sheet and refreshes accounts/balances on transfer completion', () => {
      flushBalance('acc-1', 1000);
      flushBalance('acc-2', 2500);
      fixture.detectChanges();

      component.openTransfer();
      fixture.detectChanges();

      component.onTransferCompleted();
      fixture.detectChanges();

      expect(component.showTransferSheet()).toBeFalse();

      // refresh() re-fetches the account list, which re-triggers the balance
      // effect — flush with a *new* array reference (a real HTTP response
      // always deserializes into a fresh object) so the signal's default
      // Object.is equality check actually detects a change.
      httpMock.expectOne(accountUrl).flush([...mockAccounts]);
      fixture.detectChanges();
      flushBalance('acc-1', 1500);
      flushBalance('acc-2', 2000);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('1500');
      expect(fixture.nativeElement.textContent).toContain('2000');
    });
  });
});
