import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { BudgetProgressComponent } from './budget-progress.component';

/**
 * Resolves a CSS custom property to its computed background-color value via
 * a throwaway probe element. Mirrors `sidebar-nav.component.spec.ts`'s
 * `resolveToken` pattern verbatim — `background-color`/`width` here are
 * real inline styles (`[style.background-color]`), not SVG presentation
 * attributes, so the plain HTML-element probe is sufficient and matches the
 * component's actual rendering mechanism.
 */
function resolveToken(property: 'backgroundColor', cssVar: string): string {
  const probe = document.createElement('div');
  probe.style[property] = `var(${cssVar})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe)[property];
  probe.remove();
  return value;
}

describe('BudgetProgressComponent', () => {
  let fixture: ComponentFixture<BudgetProgressComponent>;
  let component: BudgetProgressComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetProgressComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetProgressComponent);
    component = fixture.componentInstance;
  });

  function setInputs(percent: number, limit: number): void {
    fixture.componentRef.setInput('percent', percent);
    fixture.componentRef.setInput('limit', limit);
    fixture.detectChanges();
  }

  function fillEl(): HTMLElement {
    return fixture.nativeElement.querySelector('.budget-progress__fill');
  }

  // Six distinct scenarios per the spec's Budget Progress Color Bands
  // requirement — boundary cases are asserted individually, not folded.

  it('renders the income (green) band just under 80% — 79.9', () => {
    setInputs(79.9, 1000);

    expect(component.bandColor()).toBe('var(--income)');
    expect(component.fillWidth()).toBe('79.9%');
    expect(getComputedStyle(fillEl()).backgroundColor).toBe(resolveToken('backgroundColor', '--income'));
  });

  it('renders the gold band at exactly 80%', () => {
    setInputs(80, 1000);

    expect(component.bandColor()).toBe('var(--gold)');
    expect(component.fillWidth()).toBe('80%');
    expect(getComputedStyle(fillEl()).backgroundColor).toBe(resolveToken('backgroundColor', '--gold'));
  });

  it('renders the gold band just over 80% — 80.1', () => {
    setInputs(80.1, 1000);

    expect(component.bandColor()).toBe('var(--gold)');
    expect(getComputedStyle(fillEl()).backgroundColor).toBe(resolveToken('backgroundColor', '--gold'));
  });

  it('renders the gold band at exactly 100%', () => {
    setInputs(100, 1000);

    expect(component.bandColor()).toBe('var(--gold)');
    expect(component.fillWidth()).toBe('100%');
    expect(getComputedStyle(fillEl()).backgroundColor).toBe(resolveToken('backgroundColor', '--gold'));
  });

  it('renders the expense (red) band just over 100% — 100.1', () => {
    setInputs(100.1, 1000);

    expect(component.bandColor()).toBe('var(--expense)');
    expect(getComputedStyle(fillEl()).backgroundColor).toBe(resolveToken('backgroundColor', '--expense'));
  });

  it('renders a distinct neutral state for Limit: 0, Percent: 0 — not green, not a zero-width glitch', () => {
    setInputs(0, 0);

    expect(component.isNeutral()).toBe(true);
    expect(component.bandColor()).toBe('var(--surface-2)');
    expect(component.bandColor()).not.toBe('var(--income)');
    expect(component.fillWidth()).not.toBe('0%');
    expect(component.fillWidth()).toBe('100%');

    const el = fixture.nativeElement.querySelector('.budget-progress');
    expect(el.classList.contains('budget-progress--neutral')).toBe(true);
    expect(getComputedStyle(fillEl()).backgroundColor).toBe(resolveToken('backgroundColor', '--surface-2'));
  });

  it('renders a real zero-spend budget (Limit: 500, Percent: 0) as green, not neutral', () => {
    setInputs(0, 500);

    expect(component.isNeutral()).toBe(false);
    expect(component.bandColor()).toBe('var(--income)');
    expect(component.fillWidth()).toBe('0%');

    const el = fixture.nativeElement.querySelector('.budget-progress');
    expect(el.classList.contains('budget-progress--neutral')).toBe(false);
  });

  it('clamps fillWidth to 100% for over-limit percentages beyond 100', () => {
    setInputs(150, 1000);

    expect(component.bandColor()).toBe('var(--expense)');
    expect(component.fillWidth()).toBe('100%');
  });

  it('renders the track via the --surface-2 token, never a hardcoded color', () => {
    setInputs(50, 1000);

    const track = fixture.nativeElement.querySelector('.budget-progress__track');

    expect(getComputedStyle(track).backgroundColor).toBe(resolveToken('backgroundColor', '--surface-2'));
  });
});
