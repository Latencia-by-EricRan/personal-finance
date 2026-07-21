import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { ExpensesComponent } from './expenses.component';
import { IMovement, MovementService, TypeMovement } from '../records/core';
import { AccountType, IAccount, ICategory, TypeCategory } from '../../../../core/reference';
import { environment } from '../../../../../environments/environment';

describe('ExpensesComponent', () => {
  let component: ExpensesComponent;
  let fixture: ComponentFixture<ExpensesComponent>;
  let httpMock: HttpTestingController;
  let movementService: jasmine.SpyObj<MovementService>;

  const mockCategories: ICategory[] = [
    { _id: 'cat-1', Name: 'Groceries', Type: TypeCategory.VARIABLE },
    { _id: 'cat-2', Name: 'Transport', Type: TypeCategory.VARIABLE },
    { _id: 'cat-3', Name: 'Bills', Type: TypeCategory.FIJO },
    { _id: 'cat-4', Name: 'Extra', Type: TypeCategory.VARIABLE },
  ];
  const mockAccounts: IAccount[] = [
    { _id: 'acc-1', Name: 'Cash', Type: AccountType.EFECTIVO, Currency: 'ARS' },
  ];

  function currentMonthRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const toIso = (date: Date) => date.toISOString().slice(0, 10);
    return { startDate: toIso(start), endDate: toIso(end) };
  }

  async function createComponent(accounts: IAccount[] = mockAccounts): Promise<void> {
    fixture = TestBed.createComponent(ExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne(`${environment.apiUrl}/category`).flush(mockCategories);
    httpMock.expectOne(`${environment.apiUrl}/account`).flush(accounts);

    fixture.detectChanges();
  }

  beforeEach(async () => {
    const movementServiceSpy = jasmine.createSpyObj<MovementService>('MovementService', [
      'createMovement',
      'getMovements',
    ]);
    movementServiceSpy.getMovements.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ExpensesComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MovementService, useValue: movementServiceSpy },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    movementService = TestBed.inject(MovementService) as jasmine.SpyObj<MovementService>;
  });

  afterEach(() => httpMock.verify());

  it('should create', async () => {
    await createComponent();
    expect(component).toBeTruthy();
  });

  it('loads recent expenses via getMovements with the EGRESO filter for the current month range', async () => {
    const { startDate, endDate } = currentMonthRange();

    await createComponent();

    expect(movementService.getMovements).toHaveBeenCalledWith(startDate, endDate, {
      Type: TypeMovement.EGRESO,
    });
  });

  it('takes only the first 3 categories as quick-pick chips', async () => {
    await createComponent();

    expect(component.quickPickCategories().map((c) => c._id)).toEqual([
      'cat-1',
      'cat-2',
      'cat-3',
    ]);
  });

  it('toggles selectedCategoryId when a chip is selected', async () => {
    await createComponent();

    expect(component.selectedCategoryId()).toBeNull();

    component.selectCategory('cat-2');
    expect(component.selectedCategoryId()).toBe('cat-2');

    component.selectCategory('cat-1');
    expect(component.selectedCategoryId()).toBe('cat-1');
  });

  describe('quick-expense submit control', () => {
    it('is disabled when there is no amount', async () => {
      await createComponent();
      component.selectCategory('cat-1');

      expect(component.canSubmit()).toBeFalse();
    });

    it('is disabled when there is no category selected', async () => {
      await createComponent();
      component.onAmountInput('42.5');

      expect(component.canSubmit()).toBeFalse();
    });

    it('is disabled when no accounts exist', async () => {
      await createComponent([]);
      component.onAmountInput('42.5');
      component.selectCategory('cat-1');

      expect(component.canSubmit()).toBeFalse();
    });

    it('is enabled when amount, category, and an account are all present', async () => {
      await createComponent();
      component.onAmountInput('42.5');
      component.selectCategory('cat-1');

      expect(component.canSubmit()).toBeTrue();
    });
  });

  describe('on quick-expense submit', () => {
    beforeEach(async () => {
      await createComponent();
      component.onAmountInput('42.5');
      component.selectCategory('cat-1');
    });

    it('calls createMovement with Type EGRESO, the entered amount, selected category, and the default (first) account', () => {
      movementService.createMovement.and.returnValue(of({} as IMovement));

      component.submitQuickExpense();

      expect(movementService.createMovement).toHaveBeenCalledWith(
        jasmine.objectContaining({
          Type: TypeMovement.EGRESO,
          Amount: 42.5,
          Category: 'cat-1',
          Account: 'acc-1',
        }),
      );
    });

    it('resets amount and category and refetches recent expenses on success', () => {
      movementService.createMovement.and.returnValue(of({} as IMovement));
      movementService.getMovements.calls.reset();
      movementService.getMovements.and.returnValue(of([]));

      component.submitQuickExpense();

      expect(component.amount()).toBe(0);
      expect(component.selectedCategoryId()).toBeNull();
      expect(component.success()).toBeTrue();
      expect(movementService.getMovements).toHaveBeenCalledTimes(1);
    });

    it('shows an error message and does not reset state when createMovement fails', () => {
      movementService.createMovement.and.returnValue(throwError(() => new Error('network')));

      component.submitQuickExpense();

      expect(component.errorMessage()).not.toBeNull();
      expect(component.amount()).toBe(42.5);
      expect(component.selectedCategoryId()).toBe('cat-1');
    });

    it('does not call createMovement when the submit control would be disabled', () => {
      component.onAmountInput('0');

      component.submitQuickExpense();

      expect(movementService.createMovement).not.toHaveBeenCalled();
    });
  });

  describe('recent expenses list', () => {
    it('renders the empty state when there are no recent expenses', async () => {
      await createComponent();
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('app-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No expenses yet');
    });

    it('renders one row per recent expense when the list is non-empty', async () => {
      movementService.getMovements.and.returnValue(
        of([
          {
            _id: 'mov-1',
            Amount: 15,
            Category: { _id: 'cat-1', Name: 'Groceries', Type: TypeCategory.VARIABLE },
            Date: new Date('2026-07-10'),
            Type: TypeMovement.EGRESO,
          },
        ]),
      );

      await createComponent();
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.expense-row');
      expect(rows.length).toBe(1);
      expect(fixture.nativeElement.querySelector('app-empty-state')).toBeFalsy();
    });
  });
});
