import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { BudgetsComponent } from './budgets.component';
import { BudgetService, IBudgetStatus } from '../../core';
import { BudgetProgressComponent } from '../../components';
import { ICategory, TypeCategory } from '../../../../../../core/reference';

describe('BudgetsComponent', () => {
  let component: BudgetsComponent;
  let fixture: ComponentFixture<BudgetsComponent>;
  let budgetService: jasmine.SpyObj<BudgetService>;

  const category: ICategory = { _id: 'cat-1', Name: 'Comida', Type: TypeCategory.VARIABLE };

  function buildStatus(overrides: Partial<IBudgetStatus> = {}): IBudgetStatus {
    return { Category: category, Limit: 1000, Spent: 500, Remaining: 500, Percent: 50, ...overrides };
  }

  beforeEach(async () => {
    const budgetServiceSpy = jasmine.createSpyObj<BudgetService>('BudgetService', ['status']);
    budgetServiceSpy.status.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [BudgetsComponent],
      providers: [provideExperimentalZonelessChangeDetection(), { provide: BudgetService, useValue: budgetServiceSpy }],
    }).compileComponents();

    budgetService = TestBed.inject(BudgetService) as jasmine.SpyObj<BudgetService>;
  });

  /** `BudgetsComponent` fetches in its constructor, so the spy return value
   * must be set BEFORE the fixture (and therefore the component) is created. */
  function createComponent(): void {
    fixture = TestBed.createComponent(BudgetsComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    createComponent();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('calls BudgetService.status for the current month/year on init', () => {
    const now = new Date();

    createComponent();
    fixture.detectChanges();

    expect(budgetService.status).toHaveBeenCalledWith(now.getMonth() + 1, now.getFullYear());
  });

  it('shows the empty state when status() returns []', () => {
    createComponent();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.budgets__empty')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('app-budget-progress').length).toBe(0);
  });

  it('renders one app-budget-progress per status() row, hiding the empty state', () => {
    budgetService.status.and.returnValue(
      of([buildStatus(), buildStatus({ Category: { ...category, _id: 'cat-2', Name: 'Transporte' } })]),
    );
    createComponent();

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-budget-progress').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.budgets__empty')).toBeNull();
  });

  it('passes Percent/Limit/Category name from each status() row to budget-progress', () => {
    budgetService.status.and.returnValue(of([buildStatus({ Percent: 92.5, Limit: 800 })]));
    createComponent();

    fixture.detectChanges();

    const progressDebugEl = fixture.debugElement.query(By.directive(BudgetProgressComponent));
    const progress = progressDebugEl.componentInstance as BudgetProgressComponent;

    expect(progress.percent()).toBe(92.5);
    expect(progress.limit()).toBe(800);
    expect(progress.label()).toBe('Comida');
  });

  it('falls back to an empty label when Category is not populated (isPopulatedCategory guard)', () => {
    budgetService.status.and.returnValue(of([{ ...buildStatus(), Category: 'cat-1' as unknown as ICategory }]));
    createComponent();

    fixture.detectChanges();

    const progressDebugEl = fixture.debugElement.query(By.directive(BudgetProgressComponent));
    const progress = progressDebugEl.componentInstance as BudgetProgressComponent;

    expect(progress.label()).toBe('');
  });

  it('refetches status() when the month selector changes', () => {
    createComponent();
    fixture.detectChanges();
    expect(budgetService.status).toHaveBeenCalledTimes(1);

    component.onMonthChange(3);
    fixture.detectChanges();

    expect(budgetService.status).toHaveBeenCalledTimes(2);
    expect(budgetService.status).toHaveBeenCalledWith(3, jasmine.any(Number));
  });

  it('refetches status() when the year selector changes', () => {
    createComponent();
    fixture.detectChanges();
    expect(budgetService.status).toHaveBeenCalledTimes(1);

    component.onYearChange(2027);
    fixture.detectChanges();

    expect(budgetService.status).toHaveBeenCalledTimes(2);
    expect(budgetService.status).toHaveBeenCalledWith(jasmine.any(Number), 2027);
  });

  it('ignores an invalid year (NaN) and does not refetch or change year()', () => {
    createComponent();
    fixture.detectChanges();
    expect(budgetService.status).toHaveBeenCalledTimes(1);
    const yearBefore = component.year();

    component.onYearChange(NaN);
    fixture.detectChanges();

    expect(budgetService.status).toHaveBeenCalledTimes(1);
    expect(component.year()).toBe(yearBefore);
  });

  it('ignores an invalid year (0) and does not refetch or change year()', () => {
    createComponent();
    fixture.detectChanges();
    expect(budgetService.status).toHaveBeenCalledTimes(1);
    const yearBefore = component.year();

    component.onYearChange(0);
    fixture.detectChanges();

    expect(budgetService.status).toHaveBeenCalledTimes(1);
    expect(component.year()).toBe(yearBefore);
  });

  it('sets error() and renders the error block when status() fails', () => {
    budgetService.status.and.returnValue(throwError(() => new Error('fail')));
    createComponent();

    fixture.detectChanges();

    expect(component.error()).toBe(true);
    expect(fixture.nativeElement.querySelector('.budgets__error')).not.toBeNull();
  });

  it('resets error() on a successful reload after a prior failure', () => {
    budgetService.status.and.returnValue(throwError(() => new Error('fail')));
    createComponent();
    fixture.detectChanges();
    expect(component.error()).toBe(true);

    budgetService.status.and.returnValue(of([]));
    component.onMonthChange(3);
    fixture.detectChanges();

    expect(component.error()).toBe(false);
    expect(fixture.nativeElement.querySelector('.budgets__error')).toBeNull();
  });
});
