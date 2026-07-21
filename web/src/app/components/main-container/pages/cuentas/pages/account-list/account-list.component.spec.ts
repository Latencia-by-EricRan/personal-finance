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
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
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

    const empty = fixture.nativeElement.querySelector('.empty-state__title');
    expect(empty?.textContent).toContain('No accounts yet');
    expect(fixture.nativeElement.querySelectorAll('.account-card').length).toBe(0);
  });

  describe('with accounts loaded', () => {
    beforeEach(() => {
      loadAccounts(mockAccounts);
    });

    it('renders one row per account with its name', () => {
      flushBalance('acc-1', 1000);
      flushBalance('acc-2', 2500);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.account-card');
      expect(rows.length).toBe(mockAccounts.length);
      expect(fixture.nativeElement.textContent).toContain('Efectivo');
      expect(fixture.nativeElement.textContent).toContain('Banco');
    });

    it('fetches and renders the balance for each account via getBalance(id)', () => {
      flushBalance('acc-1', 1000);
      flushBalance('acc-2', 2500);
      fixture.detectChanges();

      const balances = fixture.nativeElement.querySelectorAll('.account-card__balance');
      expect(balances[0].textContent).toContain('1,000.00');
      expect(balances[1].textContent).toContain('2,500.00');
    });

    it('shows a placeholder and no red tint while a balance has not loaded yet', () => {
      flushBalance('acc-1', 1000);
      // acc-2's balance request stays unresolved for this assertion.
      fixture.detectChanges();

      const balances = fixture.nativeElement.querySelectorAll('.account-card__balance');
      expect(balances[1].textContent?.trim()).toBe('—');
      expect(balances[1].classList.contains('account-card__balance--negative')).toBeFalse();

      httpMock.expectOne(`${accountUrl}/acc-2/balance`).flush(2500);
      fixture.detectChanges();
    });

    it('shows the negative-balance red tint only for accounts with a negative balance', () => {
      flushBalance('acc-1', 1000);
      flushBalance('acc-2', -410);
      fixture.detectChanges();

      const balances = fixture.nativeElement.querySelectorAll('.account-card__balance');
      expect(balances[0].classList.contains('account-card__balance--negative')).toBeFalse();
      expect(balances[1].classList.contains('account-card__balance--negative')).toBeTrue();
    });

    it('shows a "—" total balance placeholder while any balance has not loaded yet', () => {
      flushBalance('acc-1', 1000);
      fixture.detectChanges();

      const subtitle = fixture.nativeElement.querySelector('.account-list__subtitle');
      expect(subtitle.textContent).toContain('—');

      httpMock.expectOne(`${accountUrl}/acc-2/balance`).flush(2500);
      fixture.detectChanges();
    });

    it('shows the summed total balance once every account balance has loaded', () => {
      flushBalance('acc-1', 1000);
      flushBalance('acc-2', 2500);
      fixture.detectChanges();

      const subtitle = fixture.nativeElement.querySelector('.account-list__subtitle');
      expect(subtitle.textContent).toContain('3,500.00');
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

      expect(fixture.nativeElement.textContent).toContain('1,500.00');
      expect(fixture.nativeElement.textContent).toContain('2,000.00');
    });
  });
});
