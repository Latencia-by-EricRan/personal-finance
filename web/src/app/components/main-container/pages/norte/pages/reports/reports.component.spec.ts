import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { ReportsComponent } from './reports.component';
import { ReportService, IReportByCategory, IReportMonthly } from '../../core';
import { BarChartComponent, DonutChartComponent } from '../../components';
import { ICategory, TypeCategory } from '../../../../../../core/reference';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let reportService: jasmine.SpyObj<ReportService>;

  const category: ICategory = { _id: 'cat-1', Name: 'Comida', Tag: 'food', Color: '', Type: TypeCategory.VARIABLE };

  const monthlyRows: IReportMonthly[] = Array.from({ length: 12 }, (_, index) => ({
    Month: index + 1,
    Income: 1000 + index,
    Expense: 500 + index,
    Net: 500,
  }));

  beforeEach(async () => {
    const reportServiceSpy = jasmine.createSpyObj<ReportService>('ReportService', ['byCategory', 'monthly']);
    reportServiceSpy.byCategory.and.returnValue(of([]));
    reportServiceSpy.monthly.and.returnValue(of(monthlyRows));

    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [provideExperimentalZonelessChangeDetection(), { provide: ReportService, useValue: reportServiceSpy }],
    }).compileComponents();

    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
  });

  /** `ReportsComponent` fetches in its constructor, so spy return values
   * must be set BEFORE the fixture (and therefore the component) is created. */
  function createComponent(): void {
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    createComponent();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('calls byCategory/monthly for the current month/year on init', () => {
    const now = new Date();

    createComponent();
    fixture.detectChanges();

    expect(reportService.byCategory).toHaveBeenCalledWith(now.getMonth() + 1, now.getFullYear());
    expect(reportService.monthly).toHaveBeenCalledWith(now.getFullYear());
  });

  it("refetches only this page's data when the local month selector changes (no route nav)", () => {
    createComponent();
    fixture.detectChanges();
    expect(reportService.byCategory).toHaveBeenCalledTimes(1);

    component.onMonthChange(3);
    fixture.detectChanges();

    expect(reportService.byCategory).toHaveBeenCalledTimes(2);
    expect(reportService.byCategory).toHaveBeenCalledWith(3, jasmine.any(Number));
    expect(component.month()).toBe(3);
  });

  it('refetches when the local year selector changes', () => {
    createComponent();
    fixture.detectChanges();
    expect(reportService.monthly).toHaveBeenCalledTimes(1);

    component.onYearChange(2027);
    fixture.detectChanges();

    expect(reportService.monthly).toHaveBeenCalledTimes(2);
    expect(reportService.monthly).toHaveBeenCalledWith(2027);
    expect(component.year()).toBe(2027);
  });

  it('ignores an invalid year (NaN) and does not refetch or change year()', () => {
    createComponent();
    fixture.detectChanges();
    expect(reportService.monthly).toHaveBeenCalledTimes(1);
    const yearBefore = component.year();

    component.onYearChange(NaN);
    fixture.detectChanges();

    expect(reportService.monthly).toHaveBeenCalledTimes(1);
    expect(component.year()).toBe(yearBefore);
  });

  it('ignores an invalid year (0) and does not refetch or change year()', () => {
    createComponent();
    fixture.detectChanges();
    expect(reportService.monthly).toHaveBeenCalledTimes(1);
    const yearBefore = component.year();

    component.onYearChange(0);
    fixture.detectChanges();

    expect(reportService.monthly).toHaveBeenCalledTimes(1);
    expect(component.year()).toBe(yearBefore);
  });

  it('sets error() and renders the error block when byCategory fails', () => {
    reportService.byCategory.and.returnValue(throwError(() => new Error('fail')));
    createComponent();

    fixture.detectChanges();

    expect(component.error()).toBe(true);
    expect(fixture.nativeElement.querySelector('.reports__error')).not.toBeNull();
  });

  it('sets error() and renders the error block when monthly fails', () => {
    reportService.monthly.and.returnValue(throwError(() => new Error('fail')));
    createComponent();

    fixture.detectChanges();

    expect(component.error()).toBe(true);
    expect(fixture.nativeElement.querySelector('.reports__error')).not.toBeNull();
  });

  it('resets error() on a successful reload after a prior failure', () => {
    reportService.byCategory.and.returnValue(throwError(() => new Error('fail')));
    createComponent();
    fixture.detectChanges();
    expect(component.error()).toBe(true);

    reportService.byCategory.and.returnValue(of([]));
    component.onMonthChange(3);
    fixture.detectChanges();

    expect(component.error()).toBe(false);
    expect(fixture.nativeElement.querySelector('.reports__error')).toBeNull();
  });

  it('labels the category breakdown "Expenses by Category" — never an income-by-category view', () => {
    createComponent();
    fixture.detectChanges();

    const headings = Array.from(
      fixture.nativeElement.querySelectorAll('.reports__section h2') as NodeListOf<HTMLElement>,
    ).map((el) => el.textContent?.trim());

    expect(headings).toContain('Expenses by Category');
    expect(headings.some((h) => h?.toLowerCase().includes('income by category'))).toBe(false);
  });

  it('shows an empty message and hides the donut chart when byCategory() is []', () => {
    createComponent();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.reports__empty')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-donut-chart')).toBeNull();
  });

  it('maps byCategory() rows into donut segments via categoryColor(), guarded by isPopulatedCategory', () => {
    reportService.byCategory.and.returnValue(of([{ Category: category, Total: 250 } as IReportByCategory]));
    createComponent();

    fixture.detectChanges();

    const donutDebugEl = fixture.debugElement.query(By.directive(DonutChartComponent));
    const donut = donutDebugEl.componentInstance as DonutChartComponent;

    expect(donut.segments()).toEqual([{ Label: 'Comida', Value: 250, Color: jasmine.any(String) }]);
    expect(fixture.nativeElement.querySelector('.reports__empty')).toBeNull();
  });

  it('falls back to a neutral color/empty label when Category is not populated (isPopulatedCategory guard)', () => {
    reportService.byCategory.and.returnValue(
      of([{ Category: 'cat-1' as unknown as ICategory, Total: 100 } as IReportByCategory]),
    );
    createComponent();

    fixture.detectChanges();

    const donutDebugEl = fixture.debugElement.query(By.directive(DonutChartComponent));
    const donut = donutDebugEl.componentInstance as DonutChartComponent;

    expect(donut.segments()).toEqual([{ Label: '', Value: 100, Color: 'var(--surface-2)' }]);
  });

  it('maps monthly() rows into income/expense bars bound to app-bar-chart', () => {
    createComponent();

    fixture.detectChanges();

    const barDebugEl = fixture.debugElement.query(By.directive(BarChartComponent));
    const bar = barDebugEl.componentInstance as BarChartComponent;

    expect(bar.data()).toEqual(component.incomeExpenseBars());
    expect(bar.data().length).toBe(monthlyRows.length * 2);
    expect(bar.data()[0]).toEqual({ Label: '1-I', Value: 1000, Color: jasmine.any(String) });
    expect(bar.data()[1]).toEqual({ Label: '1-E', Value: 500, Color: jasmine.any(String) });
  });
});
