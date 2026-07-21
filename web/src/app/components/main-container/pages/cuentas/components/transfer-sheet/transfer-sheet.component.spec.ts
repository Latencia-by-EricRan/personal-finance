import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { TransferSheetComponent } from './transfer-sheet.component';
import { AccountService, AccountType, IAccount } from '../../../../../../core/reference';
import { environment } from '../../../../../../../environments/environment';

describe('TransferSheetComponent', () => {
  let component: TransferSheetComponent;
  let fixture: ComponentFixture<TransferSheetComponent>;
  let httpMock: HttpTestingController;
  let accountService: AccountService;

  const mockAccounts: IAccount[] = [
    { _id: 'acc-1', Name: 'Efectivo', Type: AccountType.EFECTIVO, Currency: 'ARS' },
    { _id: 'acc-2', Name: 'Banco', Type: AccountType.BANCO, Currency: 'ARS' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferSheetComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferSheetComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    accountService = TestBed.inject(AccountService);

    fixture.detectChanges();

    httpMock.expectOne(`${environment.apiUrl}/account`).flush(mockAccounts);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one option per account for both from and to selects', () => {
    const fromOptions = fixture.nativeElement.querySelectorAll(
      'select[formControlName="from"] option[value]:not([value=""])',
    );
    const toOptions = fixture.nativeElement.querySelectorAll(
      'select[formControlName="to"] option[value]:not([value=""])',
    );
    expect(fromOptions.length).toBe(mockAccounts.length);
    expect(toOptions.length).toBe(mockAccounts.length);
  });

  it('is invalid when from and to are the same account', () => {
    component.form.setValue({
      from: 'acc-1',
      to: 'acc-1',
      amount: 100,
      date: '2026-07-03',
      description: '',
    });
    expect(component.form.invalid).toBeTrue();
    expect(component.form.errors?.['sameAccount']).toBeTrue();
  });

  it('is invalid when amount is non-positive', () => {
    component.form.setValue({
      from: 'acc-1',
      to: 'acc-2',
      amount: 0,
      date: '2026-07-03',
      description: '',
    });
    expect(component.form.controls.amount.invalid).toBeTrue();
  });

  it('does not call AccountService.transfer() when the form is invalid (no-op)', () => {
    spyOn(accountService, 'transfer');

    component.onSubmit();

    expect(accountService.transfer).not.toHaveBeenCalled();
  });

  describe('on valid submit', () => {
    beforeEach(() => {
      component.form.setValue({
        from: 'acc-1',
        to: 'acc-2',
        amount: 500,
        date: '2026-07-03',
        description: 'Ahorro',
      });
    });

    it('calls AccountService.transfer() with the form-derived DTO', () => {
      spyOn(accountService, 'transfer').and.returnValue(of(undefined));

      component.onSubmit();

      expect(accountService.transfer).toHaveBeenCalledWith({
        From: 'acc-1',
        To: 'acc-2',
        Amount: 500,
        Date: '2026-07-03',
        Description: 'Ahorro',
      });
    });

    it('emits transferCompleted on success', () => {
      spyOn(accountService, 'transfer').and.returnValue(of(undefined));
      const spy = jasmine.createSpy('transferCompleted');
      component.transferCompleted.subscribe(spy);

      component.onSubmit();

      expect(spy).toHaveBeenCalled();
    });

    it('shows an error message and does not emit transferCompleted when transfer() fails', () => {
      spyOn(accountService, 'transfer').and.returnValue(
        throwError(() => new Error('missing or archived account')),
      );
      const spy = jasmine.createSpy('transferCompleted');
      component.transferCompleted.subscribe(spy);

      component.onSubmit();

      expect(component.errorMessage()).not.toBeNull();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  it('emits cancelled when the cancel button is clicked', () => {
    const spy = jasmine.createSpy('cancelled');
    component.cancelled.subscribe(spy);

    const cancelButton = fixture.nativeElement.querySelector('.transfer-sheet__cancel');
    cancelButton.click();

    expect(spy).toHaveBeenCalled();
  });
});
