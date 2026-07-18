import { Component, computed, input } from '@angular/core';

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;
const GOLD_BAND_MIN = 80;
const GOLD_BAND_MAX = 100;
const NEUTRAL_COLOR = 'var(--surface-2)';
const INCOME_COLOR = 'var(--income)';
const GOLD_COLOR = 'var(--gold)';
const EXPENSE_COLOR = 'var(--expense)';

/**
 * Pure, presentational horizontal progress bar for Spent vs Limit. Colors
 * by `percent`: `--income` below 80, `--gold` 80–100 inclusive, `--expense`
 * above 100. `Limit: 0` (so `Percent: 0` per the backend contract) is a
 * distinct neutral/empty state — `--surface-2`, rendered as a full-width
 * dashed bar rather than a 0-width fill, so it never reads as "0% spent"
 * (green, or an invisible sliver) nor as a broken/zero-width glitch.
 */
@Component({
  selector: 'app-budget-progress',
  imports: [],
  templateUrl: './budget-progress.component.html',
  styleUrl: './budget-progress.component.scss',
})
export class BudgetProgressComponent {
  percent = input.required<number>();
  limit = input.required<number>();
  label = input<string>('');

  isNeutral = computed(() => this.limit() === 0);

  bandColor = computed(() => {
    if (this.isNeutral()) {
      return NEUTRAL_COLOR;
    }

    const value = this.percent();

    if (value < GOLD_BAND_MIN) {
      return INCOME_COLOR;
    }

    if (value <= GOLD_BAND_MAX) {
      return GOLD_COLOR;
    }

    return EXPENSE_COLOR;
  });

  fillWidth = computed(() => {
    if (this.isNeutral()) {
      return '100%';
    }

    const clamped = Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, this.percent()));

    return `${clamped}%`;
  });
}
