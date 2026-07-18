import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { BarChartComponent } from './bar-chart.component';
import { IBarDatum } from '../../../core/models';

/**
 * Resolves a CSS custom property to its computed paint value via a
 * throwaway SVG probe. Mirrors `sidebar-nav.component.spec.ts`'s
 * `resolveToken` HTML-element pattern, adapted for SVG paint properties
 * (`fill`/`stroke`) since those only reliably resolve on an SVG element.
 */
function resolveSvgColor(property: 'fill' | 'stroke', cssVar: string): string {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const probe = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  probe.style[property] = `var(${cssVar})`;
  svg.appendChild(probe);
  document.body.appendChild(svg);
  const value = getComputedStyle(probe)[property];
  svg.remove();
  return value;
}

describe('BarChartComponent', () => {
  let fixture: ComponentFixture<BarChartComponent>;
  let component: BarChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChartComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(BarChartComponent);
    component = fixture.componentInstance;
  });

  it('computes exact rect x/y/width/height for known data', () => {
    const data: IBarDatum[] = [
      { Label: 'Jan Income', Value: 100 },
      { Label: 'Jan Expense', Value: 50 },
    ];
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('height', 100);
    fixture.componentRef.setInput('gap', 8);
    fixture.componentRef.setInput('barWidth', 20);
    fixture.detectChanges();

    expect(component.bars()).toEqual([
      { x: 0, y: 0, width: 20, height: 100, fill: 'var(--gold)', label: 'Jan Income' },
      { x: 28, y: 50, width: 20, height: 50, fill: 'var(--gold)', label: 'Jan Expense' },
    ]);
    expect(component.chartWidth()).toBe(48);
  });

  it('uses the datum Color over the default gold fill when provided', () => {
    fixture.componentRef.setInput('data', [{ Label: 'Rent', Value: 10, Color: 'var(--cat-3)' }]);
    fixture.detectChanges();

    expect(component.bars()[0].fill).toBe('var(--cat-3)');
  });

  it('renders all-zero heights with no NaN when every value is zero (zero-max case)', () => {
    fixture.componentRef.setInput('data', [
      { Label: 'A', Value: 0 },
      { Label: 'B', Value: 0 },
    ]);
    fixture.componentRef.setInput('height', 120);
    fixture.detectChanges();

    const bars = component.bars();

    expect(bars.length).toBe(2);
    bars.forEach((bar) => {
      expect(bar.height).toBe(0);
      expect(bar.y).toBe(120);
      expect(Number.isNaN(bar.height)).toBe(false);
      expect(Number.isNaN(bar.y)).toBe(false);
    });
  });

  it('clamps a negative Value to a zero-height bar instead of an invalid negative height', () => {
    fixture.componentRef.setInput('data', [
      { Label: 'Income', Value: 100 },
      { Label: 'Net', Value: -50 },
    ]);
    fixture.componentRef.setInput('height', 100);
    fixture.detectChanges();

    const bars = component.bars();

    expect(bars[1].height).toBe(0);
    expect(bars[1].y).toBe(100);
    expect(bars[1].height).toBeGreaterThanOrEqual(0);
  });

  it('renders no bars and zero chart width for empty data', () => {
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();

    expect(component.bars()).toEqual([]);
    expect(component.chartWidth()).toBe(0);
  });

  it('renders the baseline stroke via the --border token, never a hardcoded color', () => {
    fixture.componentRef.setInput('data', [{ Label: 'A', Value: 5 }]);
    fixture.detectChanges();

    const baseline = fixture.nativeElement.querySelector('line.bar-chart__baseline') as SVGLineElement;

    expect(getComputedStyle(baseline).stroke).toBe(resolveSvgColor('stroke', '--border'));
  });

  it('renders each bar fill resolved from the --gold token when no Color is provided', () => {
    fixture.componentRef.setInput('data', [{ Label: 'A', Value: 5 }]);
    fixture.detectChanges();

    const rect = fixture.nativeElement.querySelector('rect.bar-chart__bar') as SVGRectElement;

    expect(getComputedStyle(rect).fill).toBe(resolveSvgColor('fill', '--gold'));
  });

  it('renders each bar fill resolved from the datum Color token when provided', () => {
    fixture.componentRef.setInput('data', [{ Label: 'A', Value: 5, Color: 'var(--cat-6)' }]);
    fixture.detectChanges();

    const rect = fixture.nativeElement.querySelector('rect.bar-chart__bar') as SVGRectElement;

    expect(getComputedStyle(rect).fill).toBe(resolveSvgColor('fill', '--cat-6'));
  });
});
