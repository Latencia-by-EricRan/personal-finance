import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MovementAddComponent } from './movement-add.component';
import { ICreateMovement, IMovement, MovementService, TypeMovement } from '../../core';
import { AccountType, IAccount, ICategory, TypeCategory } from '../../../../../../core/reference';
import { environment } from '../../../../../../../environments/environment';

describe('MovementAddComponent', () => {
  let component: MovementAddComponent;
  let fixture: ComponentFixture<MovementAddComponent>;
  let httpMock: HttpTestingController;
  let movementService: jasmine.SpyObj<MovementService>;
  let router: jasmine.SpyObj<Router>;

  const mockCategories: ICategory[] = [
    { _id: 'cat-1', Name: 'Comida', Type: TypeCategory.VARIABLE },
    { _id: 'cat-2', Name: 'Alquiler', Type: TypeCategory.FIJO },
  ];
  const mockAccounts: IAccount[] = [{ _id: 'acc-1', Name: 'Efectivo', Type: AccountType.EFECTIVO, Currency: 'ARS' }];

  beforeEach(async () => {
    const movementServiceSpy = jasmine.createSpyObj<MovementService>('MovementService', ['createMovement']);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [MovementAddComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MovementService, useValue: movementServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovementAddComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    movementService = TestBed.inject(MovementService) as jasmine.SpyObj<MovementService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();

    httpMock.expectOne(`${environment.apiUrl}/category`).flush(mockCategories);
    httpMock.expectOne(`${environment.apiUrl}/account`).flush(mockAccounts);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is invalid when required fields are empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('requires Amount to be a positive number', () => {
    component.form.patchValue({ amount: 0 });
    expect(component.form.controls.amount.invalid).toBeTrue();

    component.form.patchValue({ amount: -10 });
    expect(component.form.controls.amount.invalid).toBeTrue();

    component.form.patchValue({ amount: 100 });
    expect(component.form.controls.amount.valid).toBeTrue();
  });

  it('populates the category signal from CategoryService and renders one option per category', () => {
    expect(component.categories()).toEqual(mockCategories);

    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll(
      'select[formControlName="category"] option[value]:not([value=""])',
    );
    expect(options.length).toBe(mockCategories.length);
  });

  it('populates the account signal from AccountService and renders one option per account', () => {
    expect(component.accounts()).toEqual(mockAccounts);

    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll(
      'select[formControlName="account"] option[value]:not([value=""])',
    );
    expect(options.length).toBe(mockAccounts.length);
  });

  it('does not call MovementService.createMovement() when the form is invalid (no-op)', () => {
    component.onSubmit();
    expect(movementService.createMovement).not.toHaveBeenCalled();
  });

  it('shows field-level validation errors after an invalid submit attempt', () => {
    component.onSubmit();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('.field-error');
    expect(errors.length).toBeGreaterThan(0);
  });

  describe('on valid submit', () => {
    beforeEach(() => {
      component.form.setValue({
        type: TypeMovement.EGRESO,
        amount: 1500,
        category: 'cat-1',
        account: 'acc-1',
        date: '2026-07-03',
        description: 'Supermercado',
      });
    });

    it('calls MovementService.createMovement() with the form-derived DTO', () => {
      movementService.createMovement.and.returnValue(of({} as IMovement));

      component.onSubmit();

      const expectedDto: ICreateMovement = {
        Type: TypeMovement.EGRESO,
        Amount: 1500,
        Category: 'cat-1',
        Account: 'acc-1',
        Date: '2026-07-03',
        Description: 'Supermercado',
      };
      expect(movementService.createMovement).toHaveBeenCalledWith(expectedDto);
    });

    it('navigates back to summary-by-month and shows a success indication on success', () => {
      movementService.createMovement.and.returnValue(of({} as IMovement));

      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/records/summary-by-month']);
      expect(component.success()).toBeTrue();
      expect(component.errorMessage()).toBeNull();
    });

    it('shows an error message and preserves the form values when createMovement fails', () => {
      movementService.createMovement.and.returnValue(throwError(() => new Error('network error')));

      component.onSubmit();

      expect(component.errorMessage()).not.toBeNull();
      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.form.getRawValue()).toEqual({
        type: TypeMovement.EGRESO,
        amount: 1500,
        category: 'cat-1',
        account: 'acc-1',
        date: '2026-07-03',
        description: 'Supermercado',
      });
    });
  });
});
