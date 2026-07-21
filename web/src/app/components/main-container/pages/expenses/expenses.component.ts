import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { ICreateMovement, IMovement, MovementService, TypeMovement } from '../records/core';
import { AccountService, CategoryService } from '../../../../core/reference';
import { EmptyStateComponent, IconButtonComponent } from '../../../../shared/ui';

@Component({
  selector: 'app-expenses',
  imports: [CurrencyPipe, DatePipe, EmptyStateComponent, IconButtonComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent {
  private readonly movementSvc = inject(MovementService);
  private readonly categorySvc = inject(CategoryService);
  private readonly accountSvc = inject(AccountService);

  readonly TypeMovement = TypeMovement;
  readonly accounts = this.accountSvc.accounts;

  // The mockup's 3 category "chips" (Groceries/Transport/Bills) imply a
  // favorites/quick-pick set, but ICategory has no such flag — arbitrary
  // "first 3 categories from the service" simplification, not a real feature.
  readonly quickPickCategories = computed(() => this.categorySvc.categories().slice(0, 3));

  readonly amount = signal<number>(0);
  readonly selectedCategoryId = signal<string | null>(null);

  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly recentExpenses = signal<IMovement[] | null>(null);

  readonly canSubmit = computed(
    () =>
      this.amount() > 0 &&
      this.selectedCategoryId() !== null &&
      this.accounts().length > 0 &&
      !this.submitting(),
  );

  constructor() {
    this.categorySvc.ensureLoaded();
    this.accountSvc.ensureLoaded();
    this.loadRecentExpenses();
  }

  onAmountInput(rawValue: string): void {
    const parsed = Number(rawValue);
    this.amount.set(Number.isFinite(parsed) ? parsed : 0);
  }

  selectCategory(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
  }

  submitQuickExpense(): void {
    if (!this.canSubmit()) {
      return;
    }

    // DATA-MODEL GAP: the mockup's Quick expense card has no account
    // selector, but ICreateMovement.Account is required — default to the
    // user's first available account (submit is disabled entirely above
    // when the account list is empty, since there's no account to attach to).
    const account = this.accounts()[0]?._id;
    const category = this.selectedCategoryId();
    if (!account || !category) {
      return;
    }

    this.errorMessage.set(null);
    this.success.set(false);
    this.submitting.set(true);

    const dto: ICreateMovement = {
      Type: TypeMovement.EGRESO,
      Amount: this.amount(),
      Category: category,
      Account: account,
      Date: ExpensesComponent.today(),
    };

    this.movementSvc.createMovement(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        this.amount.set(0);
        this.selectedCategoryId.set(null);
        this.loadRecentExpenses();
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Could not save the expense. Please try again.');
      },
    });
  }

  private loadRecentExpenses(): void {
    const { startDate, endDate } = ExpensesComponent.currentMonthRange();
    this.movementSvc
      .getMovements(startDate, endDate, { Type: TypeMovement.EGRESO })
      .subscribe({
        next: (movements) => this.recentExpenses.set(movements),
        error: () => this.recentExpenses.set(null),
      });
  }

  private static today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private static currentMonthRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: ExpensesComponent.toIsoDate(start),
      endDate: ExpensesComponent.toIsoDate(end),
    };
  }

  private static toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
