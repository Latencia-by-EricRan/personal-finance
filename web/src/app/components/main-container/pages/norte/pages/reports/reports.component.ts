import { Component, computed, inject, signal } from '@angular/core';

import {
  ReportService,
  IReportByCategory,
  IReportMonthly,
  IBarDatum,
  IDonutSegment,
  ITrendPoint,
  isPopulatedCategory,
  categoryColor,
} from '../../core';
import { BarChartComponent, DonutChartComponent, TrendChartComponent } from '../../components';

const INCOME_COLOR = 'var(--income)';
const EXPENSE_COLOR = 'var(--expense)';
const NEUTRAL_COLOR = 'var(--surface-2)';

/**
 * Smart container for the Reports page. Owns LOCAL month/year selector
 * state (the primary interactive element on this page) and re-queries
 * `ReportService` on change — no route navigation is involved. Reports are
 * egreso-only per backend contract, so the category breakdown is always
 * labeled "Expenses by Category" — never presented as an income breakdown.
 */
@Component({
  selector: 'app-reports',
  imports: [BarChartComponent, DonutChartComponent, TrendChartComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent {
  private readonly reportSvc = inject(ReportService);
  private readonly now = new Date();

  readonly months = Array.from({ length: 12 }, (_, index) => index + 1);

  readonly month = signal(this.now.getMonth() + 1);
  readonly year = signal(this.now.getFullYear());

  readonly byCategory = signal<IReportByCategory[]>([]);
  readonly monthly = signal<IReportMonthly[]>([]);
  readonly error = signal(false);

  readonly donutSegments = computed<IDonutSegment[]>(() =>
    this.byCategory().map((row) => ({
      Label: isPopulatedCategory(row.Category) ? row.Category.Name : '',
      Value: row.Total,
      Color: isPopulatedCategory(row.Category) ? categoryColor(row.Category) : NEUTRAL_COLOR,
    })),
  );

  readonly incomeExpenseBars = computed<IBarDatum[]>(() =>
    this.monthly().flatMap((row) => [
      { Label: `${row.Month}-I`, Value: row.Income, Color: INCOME_COLOR },
      { Label: `${row.Month}-E`, Value: row.Expense, Color: EXPENSE_COLOR },
    ]),
  );

  readonly netTrend = computed<ITrendPoint[]>(() =>
    this.monthly().map((row) => ({ Label: `${row.Month}`, Value: row.Net })),
  );

  constructor() {
    this.load();
  }

  onMonthChange(month: number): void {
    this.month.set(month);
    this.load();
  }

  onYearChange(year: number): void {
    if (!Number.isInteger(year) || year <= 0) {
      return;
    }

    this.year.set(year);
    this.load();
  }

  private load(): void {
    this.error.set(false);

    const month = this.month();
    const year = this.year();

    this.reportSvc.byCategory(month, year).subscribe({
      next: (rows) => this.byCategory.set(rows),
      error: () => this.error.set(true),
    });
    this.reportSvc.monthly(year).subscribe({
      next: (rows) => this.monthly.set(rows),
      error: () => this.error.set(true),
    });
  }
}
