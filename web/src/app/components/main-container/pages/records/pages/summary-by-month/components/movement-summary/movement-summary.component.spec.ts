import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { MovementSummaryComponent } from './movement-summary.component';
import { ISummary } from '../../../../core';

describe('MovementSummaryComponent', () => {
  let component: MovementSummaryComponent;
  let fixture: ComponentFixture<MovementSummaryComponent>;

  const mockSummary: ISummary = {
    items: 3,
    amount: { income: 500, expense: 150 },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementSummaryComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovementSummaryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('summary', mockSummary);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computes net as income minus expense', () => {
    expect(component.net()).toBe(350);
  });

  it('renders three stat tiles: Income, Expense, Net', () => {
    const tiles = fixture.nativeElement.querySelectorAll('app-stat-tile');
    expect(tiles.length).toBe(3);

    const labels = Array.from(tiles as NodeListOf<HTMLElement>).map(
      (tile) => tile.querySelector('.stat-tile__label')?.textContent?.trim(),
    );
    expect(labels).toEqual(['Income', 'Expense', 'Net']);
  });

  it('renders the income tile with the income tone and formatted amount', () => {
    const incomeValue = fixture.nativeElement.querySelector(
      'app-stat-tile .stat-tile__value--income',
    ) as HTMLElement;

    expect(incomeValue).not.toBeNull();
    expect(incomeValue.textContent?.trim()).toContain('500');
  });

  it('renders the expense tile with the expense tone and formatted amount', () => {
    const expenseValue = fixture.nativeElement.querySelector(
      'app-stat-tile .stat-tile__value--expense',
    ) as HTMLElement;

    expect(expenseValue).not.toBeNull();
    expect(expenseValue.textContent?.trim()).toContain('150');
  });

  it('renders the net tile with the default (plain) tone, not income/expense colored', () => {
    const tiles = fixture.nativeElement.querySelectorAll('app-stat-tile');
    const netTile = tiles[2] as HTMLElement;
    const netValue = netTile.querySelector('.stat-tile__value') as HTMLElement;

    expect(netValue.classList.contains('stat-tile__value--income')).toBeFalse();
    expect(netValue.classList.contains('stat-tile__value--expense')).toBeFalse();
    expect(netValue.textContent?.trim()).toContain('350');
  });
});
