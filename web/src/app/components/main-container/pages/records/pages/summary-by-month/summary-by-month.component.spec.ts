import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { SummaryByMonthComponent } from './summary-by-month.component';
import { MovementFilterComponent } from './components';
import { IMovement, TypeMovement } from '../../core';
import { TypeCategory } from '../../../../../../core/reference';
import { environment } from '../../../../../../../environments/environment';

/** Resolves a CSS custom property to its computed color value via a throwaway probe element. */
function resolveToken(property: 'backgroundColor' | 'color', cssVar: string): string {
  const probe = document.createElement('div');
  probe.style[property] = `var(${cssVar})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe)[property];
  probe.remove();
  return value;
}

/** Mirrors SummaryByMonthComponent's own current-month range calculation. */
function currentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const toIso = (date: Date) => date.toISOString().slice(0, 10);
  return { startDate: toIso(start), endDate: toIso(end) };
}

describe('SummaryByMonthComponent', () => {
  let component: SummaryByMonthComponent;
  let fixture: ComponentFixture<SummaryByMonthComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryByMonthComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryByMonthComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpMock.expectOne(() => true).flush({
      month: 1,
      year: 2026,
      summary: { items: 0, amount: { income: 0, expense: 0 } },
      movements: [],
    });
    // Re-render so the async-piped @if block instantiates <app-movement-filter />.
    fixture.detectChanges();

    // MovementFilterComponent's constructor fires ensureLoaded() on both reference services.
    httpMock.expectOne(`${environment.apiUrl}/category`).flush([]);
    httpMock.expectOne(`${environment.apiUrl}/account`).flush([]);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the root container with --bg/--text tokens, not hardcoded colors', () => {
    const rootEl = fixture.nativeElement.querySelector('.summary-by-month') as HTMLElement;
    const style = getComputedStyle(rootEl);

    expect(style.backgroundColor).toBe(resolveToken('backgroundColor', '--bg'));
    expect(style.color).toBe(resolveToken('color', '--text'));
  });

  describe('filtering', () => {
    function emitFilter(filter: Parameters<MovementFilterComponent['filterChange']['emit']>[0]): void {
      const filterDebugEl = fixture.debugElement.query(By.directive(MovementFilterComponent));
      const filterComponent = filterDebugEl.componentInstance as MovementFilterComponent;
      filterComponent.filterChange.emit(filter);
    }

    it('calls MovementService.getMovements for the current month range with the emitted filter', () => {
      const { startDate, endDate } = currentMonthRange();

      emitFilter({ Type: TypeMovement.EGRESO });

      const req = httpMock.expectOne(`${environment.apiUrl}/movement/${startDate}/${endDate}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ Type: TypeMovement.EGRESO });
      req.flush([]);
    });

    it('renders the filtered movements returned by getMovements instead of the original list', () => {
      const { startDate, endDate } = currentMonthRange();
      const filteredMovement: IMovement = {
        _id: 'mov-1',
        Amount: 500,
        Category: { _id: 'cat-1', Name: 'Comida', Type: TypeCategory.VARIABLE },
        Date: new Date('2026-07-01'),
        Type: TypeMovement.EGRESO,
      };

      emitFilter({ Type: TypeMovement.EGRESO });
      httpMock
        .expectOne(`${environment.apiUrl}/movement/${startDate}/${endDate}`)
        .flush([filteredMovement]);
      fixture.detectChanges();

      const cards = fixture.nativeElement.querySelectorAll('app-movement-card');
      expect(cards.length).toBe(1);
    });

    it('shows an explicit empty-state message when the filter yields no matches', () => {
      const { startDate, endDate } = currentMonthRange();

      emitFilter({ Type: TypeMovement.INGRESO });
      httpMock.expectOne(`${environment.apiUrl}/movement/${startDate}/${endDate}`).flush([]);
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('.summary-by-month__empty');
      expect(emptyState).not.toBeNull();
      expect(fixture.nativeElement.querySelectorAll('app-movement-card').length).toBe(0);
    });
  });
});
