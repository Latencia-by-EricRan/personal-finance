import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { OverviewComponent } from './overview.component';
import { BudgetService, ReportService, IBudgetStatus, IReportByCategory, IReportMonthly, IReportCashflow } from '../../core';
import { BudgetProgressComponent, DonutChartComponent, TrendChartComponent } from '../../components';
import { ICategory, TypeCategory } from '../../../../../../core/reference';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let budgetService: jasmine.SpyObj<BudgetService>;
  let reportService: jasmine.SpyObj<ReportService>;

  const category: ICategory = { _id: 'cat-1', Name: 'Comida', Tag: 'food', Color: '', Type: TypeCategory.VARIABLE };

  function buildStatus(overrides: Partial<IBudgetStatus> = {}): IBudgetStatus {
    return { Category: category, Limit: 1000, Spent: 500, Remaining: 500, Percent: 50, ...overrides };
  }

  const monthlyRows: IReportMonthly[] = Array.from({ length: 12 }, (_, index) => ({
    Month: index + 1,
    Income: 1000 + index,
    Expense: 500 + index,
    Net: 500,
  }));

  const cashflowRow: IReportCashflow = { Month: 7, Year: 2026, Income: 3000, Expense: 1200, Net: 1800 };

  beforeEach(async () => {
    const budgetServiceSpy = jasmine.createSpyObj<BudgetService>('BudgetService', ['status']);
    budgetServiceSpy.status.and.returnValue(of([]));

    const reportServiceSpy = jasmine.createSpyObj<ReportService>('ReportService', [
      'byCategory',
      'monthly',
      'cashflow',
    ]);
    reportServiceSpy.byCategory.and.returnValue(of([]));
    reportServiceSpy.monthly.and.returnValue(of(monthlyRows));
    reportServiceSpy.cashflow.and.returnValue(of(cashflowRow));

    await TestBed.configureTestingModule({
      imports: [OverviewComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: BudgetService, useValue: budgetServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
      ],
    }).compileComponents();

    budgetService = TestBed.inject(BudgetService) as jasmine.SpyObj<BudgetService>;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
  });

  /** `OverviewComponent` fetches in its constructor, so spy return values
   * must be set BEFORE the fixture (and therefore the component) is created. */
  function createComponent(): void {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    createComponent();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('calls status/byCategory/monthly/cashflow for the current month/year on init', () => {
    const now = new Date();

    createComponent();
    fixture.detectChanges();

    expect(budgetService.status).toHaveBeenCalledWith(now.getMonth() + 1, now.getFullYear());
    expect(reportService.byCategory).toHaveBeenCalledWith(now.getMonth() + 1, now.getFullYear());
    expect(reportService.monthly).toHaveBeenCalledWith(now.getFullYear());
    expect(reportService.cashflow).toHaveBeenCalledWith(now.getMonth() + 1, now.getFullYear());
  });

  it('renders the cashflow KPI (Income/Expense/Net) from cashflow()', () => {
    createComponent();
    fixture.detectChanges();

    const kpi = fixture.nativeElement.querySelector('.overview__kpi');
    expect(kpi.textContent).toContain('3000');
    expect(kpi.textContent).toContain('1200');
    expect(kpi.textContent).toContain('1800');
  });

  it('shows an empty note when there is no cashflow data', () => {
    reportService.cashflow.and.returnValue(of(null as unknown as IReportCashflow));
    createComponent();

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.overview__kpi .overview__empty')).not.toBeNull();
  });

  it('renders the Net trend chart from monthly()', () => {
    createComponent();
    fixture.detectChanges();

    const trendDebugEl = fixture.debugElement.query(By.directive(TrendChartComponent));
    const trend = trendDebugEl.componentInstance as TrendChartComponent;

    expect(trend.points().length).toBe(12);
    expect(trend.points()[0]).toEqual({ Label: '1', Value: 500 });
  });

  it('maps byCategory() rows into donut segments via categoryColor(), guarded by isPopulatedCategory', () => {
    reportService.byCategory.and.returnValue(of([{ Category: category, Total: 250 } as IReportByCategory]));
    createComponent();

    fixture.detectChanges();

    const donutDebugEl = fixture.debugElement.query(By.directive(DonutChartComponent));
    const donut = donutDebugEl.componentInstance as DonutChartComponent;

    expect(donut.segments()).toEqual([{ Label: 'Comida', Value: 250, Color: jasmine.any(String) }]);
  });

  it('falls back to a neutral color/empty label when byCategory Category is not populated', () => {
    reportService.byCategory.and.returnValue(
      of([{ Category: 'cat-1' as unknown as ICategory, Total: 100 } as IReportByCategory]),
    );
    createComponent();

    fixture.detectChanges();

    const donutDebugEl = fixture.debugElement.query(By.directive(DonutChartComponent));
    const donut = donutDebugEl.componentInstance as DonutChartComponent;

    expect(donut.segments()).toEqual([{ Label: '', Value: 100, Color: 'var(--surface-2)' }]);
  });

  it('shows an empty note for the category section when byCategory() is []', () => {
    createComponent();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-donut-chart')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.overview__empty').length).toBeGreaterThan(0);
  });

  it('renders one budget-progress row per status() entry', () => {
    budgetService.status.and.returnValue(of([buildStatus({ Percent: 92.5, Limit: 800 })]));
    createComponent();

    fixture.detectChanges();

    const progressDebugEl = fixture.debugElement.query(By.directive(BudgetProgressComponent));
    const progress = progressDebugEl.componentInstance as BudgetProgressComponent;

    expect(progress.percent()).toBe(92.5);
    expect(progress.limit()).toBe(800);
    expect(progress.label()).toBe('Comida');
  });

  it('shows an empty note for the budgets section when status() is []', () => {
    createComponent();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-budget-progress').length).toBe(0);
  });

  it('sets error() and renders the error block when budgetSvc.status() fails', () => {
    budgetService.status.and.returnValue(throwError(() => new Error('fail')));
    createComponent();

    fixture.detectChanges();

    expect(component.error()).toBe(true);
    expect(fixture.nativeElement.querySelector('.overview__error')).not.toBeNull();
  });

  it('sets error() when reportSvc.byCategory() fails', () => {
    reportService.byCategory.and.returnValue(throwError(() => new Error('fail')));
    createComponent();

    fixture.detectChanges();

    expect(component.error()).toBe(true);
  });

  it('sets error() when reportSvc.monthly() fails', () => {
    reportService.monthly.and.returnValue(throwError(() => new Error('fail')));
    createComponent();

    fixture.detectChanges();

    expect(component.error()).toBe(true);
  });

  it('sets error() when reportSvc.cashflow() fails', () => {
    reportService.cashflow.and.returnValue(throwError(() => new Error('fail')));
    createComponent();

    fixture.detectChanges();

    expect(component.error()).toBe(true);
  });
});
