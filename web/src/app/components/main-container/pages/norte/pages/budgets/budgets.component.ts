import { Component, inject, signal } from '@angular/core';

import { BudgetService, IBudgetStatus, isPopulatedCategory } from '../../core';
import { BudgetProgressComponent } from '../../components';

/**
 * Smart container for the Budgets page: loads the budget `status()` for a
 * selectable month/year and renders one `budget-progress` row per entry,
 * or an explicit empty state when there are no budgets for that period.
 */
@Component({
  selector: 'app-budgets',
  imports: [BudgetProgressComponent],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss',
})
export class BudgetsComponent {
  private readonly budgetSvc = inject(BudgetService);
  private readonly now = new Date();

  readonly months = Array.from({ length: 12 }, (_, index) => index + 1);

  readonly month = signal(this.now.getMonth() + 1);
  readonly year = signal(this.now.getFullYear());
  readonly status = signal<IBudgetStatus[]>([]);
  readonly error = signal(false);

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

  categoryName(row: IBudgetStatus): string {
    return isPopulatedCategory(row.Category) ? row.Category.Name : '';
  }

  private load(): void {
    this.error.set(false);

    this.budgetSvc.status(this.month(), this.year()).subscribe({
      next: (status) => this.status.set(status),
      error: () => this.error.set(true),
    });
  }
}
