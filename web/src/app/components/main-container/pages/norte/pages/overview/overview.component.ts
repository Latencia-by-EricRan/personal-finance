import { Component, computed, inject, signal } from '@angular/core';

import {
  BudgetService,
  ReportService,
  IBudgetStatus,
  IReportByCategory,
  IReportMonthly,
  IReportCashflow,
  IDonutSegment,
  ITrendPoint,
  isPopulatedCategory,
  categoryColor,
} from '../../core';
import { BudgetProgressComponent, DonutChartComponent, TrendChartComponent } from '../../components';

const NEUTRAL_COLOR = 'var(--surface-2)';

/**
 * Smart container for the Overview page: a current-month/year snapshot
 * composing the cashflow KPI, a Net trend, an expense-by-category donut,
 * and the budget-progress rows. No local selector — always the current
 * month, mirroring `SummaryByMonthComponent`'s `new Date()` convention.
 */
@Component({
  selector: 'app-overview',
  imports: [BudgetProgressComponent, DonutChartComponent, TrendChartComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  private readonly budgetSvc = inject(BudgetService);
  private readonly reportSvc = inject(ReportService);
  private readonly now = new Date();

  private readonly month = this.now.getMonth() + 1;
  private readonly year = this.now.getFullYear();

  readonly status = signal<IBudgetStatus[]>([]);
  readonly byCategory = signal<IReportByCategory[]>([]);
  readonly monthly = signal<IReportMonthly[]>([]);
  readonly cashflow = signal<IReportCashflow | null>(null);
  readonly error = signal(false);

  readonly donutSegments = computed<IDonutSegment[]>(() =>
    this.byCategory().map((row) => ({
      Label: isPopulatedCategory(row.Category) ? row.Category.Name : '',
      Value: row.Total,
      Color: isPopulatedCategory(row.Category) ? categoryColor(row.Category) : NEUTRAL_COLOR,
    })),
  );

  readonly netTrend = computed<ITrendPoint[]>(() =>
    this.monthly().map((row) => ({ Label: `${row.Month}`, Value: row.Net })),
  );

  constructor() {
    this.budgetSvc.status(this.month, this.year).subscribe({
      next: (status) => this.status.set(status),
      error: () => this.error.set(true),
    });
    this.reportSvc.byCategory(this.month, this.year).subscribe({
      next: (rows) => this.byCategory.set(rows),
      error: () => this.error.set(true),
    });
    this.reportSvc.monthly(this.year).subscribe({
      next: (rows) => this.monthly.set(rows),
      error: () => this.error.set(true),
    });
    this.reportSvc.cashflow(this.month, this.year).subscribe({
      next: (row) => this.cashflow.set(row),
      error: () => this.error.set(true),
    });
  }

  categoryName(row: IBudgetStatus): string {
    return isPopulatedCategory(row.Category) ? row.Category.Name : '';
  }
}
