import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { IMovement, IMovementFilter, MovementService } from '../../core';
import { MovementCardComponent, MovementFilterComponent, MovementSummaryComponent } from './components';
import { MatIcon } from '@angular/material/icon';
import { MatFabButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-summary-by-month',
  imports: [
    AsyncPipe,
    MovementCardComponent,
    MovementFilterComponent,
    MovementSummaryComponent,
    MatIcon,
    MatFabButton,
    RouterLink,
  ],
  templateUrl: './summary-by-month.component.html',
  styleUrl: './summary-by-month.component.scss',
})
export class SummaryByMonthComponent {
  private readonly movementSvc = inject(MovementService);
  private readonly now = new Date();
  public readonly respMovements$ = this.movementSvc
    .getMovementsByMonth(this.now.getFullYear(), this.now.getMonth() + 1)
    .pipe(catchError(() => of(null)));

  /** `null` = no filter applied yet; render `respMovements.movements` as-is. */
  public readonly filteredMovements = signal<IMovement[] | null>(null);

  onFilterChange(filter: IMovementFilter): void {
    const { startDate, endDate } = this.currentMonthRange();
    this.movementSvc
      .getMovements(startDate, endDate, filter)
      .subscribe((movements) => this.filteredMovements.set(movements));
  }

  private currentMonthRange(): { startDate: string; endDate: string } {
    const year = this.now.getFullYear();
    const month = this.now.getMonth();
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
