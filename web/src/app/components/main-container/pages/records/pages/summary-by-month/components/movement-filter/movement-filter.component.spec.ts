import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { MovementFilterComponent } from './movement-filter.component';
import { IMovementFilter, TypeMovement } from '../../../../core';
import { AccountType, IAccount, ICategory, TypeCategory } from '../../../../../../../../core/reference';
import { environment } from '../../../../../../../../../environments/environment';

describe('MovementFilterComponent', () => {
  let component: MovementFilterComponent;
  let fixture: ComponentFixture<MovementFilterComponent>;
  let httpMock: HttpTestingController;

  const mockCategories: ICategory[] = [
    { _id: 'cat-1', Name: 'Comida', Type: TypeCategory.VARIABLE },
    { _id: 'cat-2', Name: 'Alquiler', Type: TypeCategory.FIJO },
  ];
  const mockAccounts: IAccount[] = [{ _id: 'acc-1', Name: 'Efectivo', Type: AccountType.EFECTIVO, Currency: 'ARS' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementFilterComponent],
      providers: [provideExperimentalZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MovementFilterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpMock.expectOne(`${environment.apiUrl}/category`).flush(mockCategories);
    httpMock.expectOne(`${environment.apiUrl}/account`).flush(mockAccounts);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('emits a filterChange with Type when the type control changes', () => {
    const emitted: IMovementFilter[] = [];
    component.filterChange.subscribe((filter) => emitted.push(filter));

    component.form.patchValue({ type: TypeMovement.EGRESO });

    expect(emitted).toEqual([{ Type: TypeMovement.EGRESO }]);
  });

  it('emits a filterChange with Category when the category control changes', () => {
    const emitted: IMovementFilter[] = [];
    component.filterChange.subscribe((filter) => emitted.push(filter));

    component.form.patchValue({ category: 'cat-1' });

    expect(emitted).toEqual([{ Category: 'cat-1' }]);
  });

  it('emits a filterChange with Account when the account control changes', () => {
    const emitted: IMovementFilter[] = [];
    component.filterChange.subscribe((filter) => emitted.push(filter));

    component.form.patchValue({ account: 'acc-1' });

    expect(emitted).toEqual([{ Account: 'acc-1' }]);
  });

  it('combines Type, Category, and Account into a single filter when all are set', () => {
    const emitted: IMovementFilter[] = [];
    component.filterChange.subscribe((filter) => emitted.push(filter));

    component.form.setValue({
      type: TypeMovement.INGRESO,
      category: 'cat-1',
      account: 'acc-1',
    });

    expect(emitted[emitted.length - 1]).toEqual({
      Type: TypeMovement.INGRESO,
      Category: 'cat-1',
      Account: 'acc-1',
    });
  });

  it('emits an empty filter ({}) and resets controls back to "todos" when cleared', () => {
    component.form.setValue({
      type: TypeMovement.EGRESO,
      category: 'cat-1',
      account: 'acc-1',
    });

    const emitted: IMovementFilter[] = [];
    component.filterChange.subscribe((filter) => emitted.push(filter));

    component.onClear();

    expect(emitted).toEqual([{}]);
    expect(component.form.getRawValue()).toEqual({ type: '', category: '', account: '' });
  });
});
