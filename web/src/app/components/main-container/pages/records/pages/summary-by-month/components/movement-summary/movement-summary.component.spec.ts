import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { MovementSummaryComponent } from './movement-summary.component';
import { ISummary } from '../../../../core';

/** Resolves a CSS custom property to its computed color value via a throwaway probe element. */
function resolveTextToken(cssVar: string): string {
  const probe = document.createElement('div');
  probe.style.color = `var(${cssVar})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

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

  it('renders the expense figure with the --expense token, not a hardcoded color', () => {
    const expenseEl = fixture.nativeElement.querySelector('.amount-expense') as HTMLElement;

    expect(getComputedStyle(expenseEl).color).toBe(resolveTextToken('--expense'));
  });

  it('renders the income figure with the --income token, not a hardcoded color', () => {
    const incomeEl = fixture.nativeElement.querySelector('.amount-income') as HTMLElement;

    expect(getComputedStyle(incomeEl).color).toBe(resolveTextToken('--income'));
  });
});
