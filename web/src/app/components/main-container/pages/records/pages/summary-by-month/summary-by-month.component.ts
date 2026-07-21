import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IMovement, IMovementFilter, IMovementResponse, MovementService } from '../../core';
import { MovementCardComponent, MovementFilterComponent, MovementSummaryComponent } from './components';
import { EmptyStateComponent, IconButtonComponent } from '../../../../../../shared/ui';

@Component({
    selector: 'app-summary-by-month',
    imports: [
      MovementCardComponent,
      MovementFilterComponent,
      MovementSummaryComponent,
      IconButtonComponent,
      EmptyStateComponent,
      RouterLink,
    ],
    templateUrl: './summary-by-month.component.html',
    styleUrl: './summary-by-month.component.scss'
})
export class SummaryByMonthComponent {

  private readonly movementSvc = inject(MovementService);
  private readonly now = new Date();

  public readonly currentYear = signal<number>(this.now.getFullYear());
  public readonly currentMonth = signal<number>(this.now.getMonth() + 1);

  public readonly movementsResponse = signal<IMovementResponse | null>(null);
  public readonly loadError = signal<boolean>(false);

  /** `null` = no filter applied yet; render `movementsResponse().movements` as-is. */
  public readonly filteredMovements = signal<IMovement[] | null>(null);

  public readonly monthLabel = computed(() =>
    new Date(this.currentYear(), this.currentMonth() - 1, 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );

  constructor() {
    this.loadMonth();
  }

  loadMonth(): void {
    this.movementSvc
      .getMovementsByMonth(this.currentYear(), this.currentMonth())
      .subscribe({
        next: (response) => {
          this.movementsResponse.set(response);
          this.loadError.set(false);
        },
        error: () => {
          this.movementsResponse.set(null);
          this.loadError.set(true);
        },
      });
  }

  goToPreviousMonth(): void {
    this.shiftMonth(-1);
  }

  goToNextMonth(): void {
    this.shiftMonth(1);
  }

  onFilterChange(filter: IMovementFilter): void {
    const { startDate, endDate } = this.currentMonthRange();
    this.movementSvc
      .getMovements(startDate, endDate, filter)
      .subscribe((movements) => this.filteredMovements.set(movements));
  }

  private shiftMonth(delta: number): void {
    let year = this.currentYear();
    let month = this.currentMonth() + delta;

    if (month > 12) {
      month = 1;
      year += 1;
    } else if (month < 1) {
      month = 12;
      year -= 1;
    }

    this.currentYear.set(year);
    this.currentMonth.set(month);
    // An active filter is scoped to the old month's date range — on month
    // change, drop back to the new month's unfiltered list. Deliberate UX
    // simplification, not a bug.
    this.filteredMovements.set(null);
    this.loadMonth();
  }

  private currentMonthRange(): { startDate: string; endDate: string } {
    const year = this.currentYear();
    const month = this.currentMonth() - 1;
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return {
      startDate: SummaryByMonthComponent.toIsoDate(start),
      endDate: SummaryByMonthComponent.toIsoDate(end),
    };
  }

  private static toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

}
