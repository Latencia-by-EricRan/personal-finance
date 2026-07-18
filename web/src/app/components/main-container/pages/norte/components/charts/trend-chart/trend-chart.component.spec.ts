import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { TrendChartComponent } from './trend-chart.component';
import { ITrendPoint } from '../../../core/models';

/** See `bar-chart.component.spec.ts` for the reasoning behind this helper. */
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

describe('TrendChartComponent', () => {
  let fixture: ComponentFixture<TrendChartComponent>;
  let component: TrendChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendChartComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TrendChartComponent);
    component = fixture.componentInstance;
  });

  it('computes the exact path d string for known points', () => {
    const points: ITrendPoint[] = [
      { Label: 'Jan', Value: 0 },
      { Label: 'Feb', Value: 100 },
      { Label: 'Mar', Value: 50 },
    ];
    fixture.componentRef.setInput('points', points);
    fixture.componentRef.setInput('width', 200);
    fixture.componentRef.setInput('height', 100);
    fixture.detectChanges();

    expect(component.path()).toBe('M 0 100 L 100 0 L 200 50');
  });

  it('closes the area path back to the baseline', () => {
    fixture.componentRef.setInput('points', [
      { Label: 'Jan', Value: 0 },
      { Label: 'Feb', Value: 100 },
    ]);
    fixture.componentRef.setInput('width', 200);
    fixture.componentRef.setInput('height', 100);
    fixture.detectChanges();

    expect(component.areaPath()).toBe('M 0 100 L 200 0 L 200 100 L 0 100 Z');
  });

  it('renders a flat mid-height line with no divide-by-zero when all values are equal', () => {
    fixture.componentRef.setInput('points', [
      { Label: 'Jan', Value: 20 },
      { Label: 'Feb', Value: 20 },
      { Label: 'Mar', Value: 20 },
    ]);
    fixture.componentRef.setInput('width', 200);
    fixture.componentRef.setInput('height', 100);
    fixture.detectChanges();

    const points = component.trendPoints();

    points.forEach((point) => {
      expect(point.y).toBe(50);
      expect(Number.isNaN(point.y)).toBe(false);
    });
    expect(component.path()).toBe('M 0 50 L 100 50 L 200 50');
  });

  it('renders a single point with no divide-by-zero', () => {
    fixture.componentRef.setInput('points', [{ Label: 'Jan', Value: 42 }]);
    fixture.componentRef.setInput('width', 200);
    fixture.componentRef.setInput('height', 100);
    fixture.detectChanges();

    const points = component.trendPoints();

    expect(points.length).toBe(1);
    expect(points[0].x).toBe(0);
    expect(Number.isNaN(points[0].y)).toBe(false);
    expect(component.path()).toBe(`M 0 ${points[0].y}`);
  });

  it('renders no path for empty points', () => {
    fixture.componentRef.setInput('points', []);
    fixture.detectChanges();

    expect(component.trendPoints()).toEqual([]);
    expect(component.path()).toBe('');
    expect(component.areaPath()).toBe('');
  });

  it('renders the line stroke and area fill via the --gold token, never a hardcoded color', () => {
    fixture.componentRef.setInput('points', [
      { Label: 'Jan', Value: 0 },
      { Label: 'Feb', Value: 100 },
    ]);
    fixture.detectChanges();

    const line = fixture.nativeElement.querySelector('path.trend-chart__line') as SVGPathElement;
    const area = fixture.nativeElement.querySelector('path.trend-chart__area') as SVGPathElement;

    expect(getComputedStyle(line).stroke).toBe(resolveSvgColor('stroke', '--gold'));
    expect(getComputedStyle(area).fill).toBe(resolveSvgColor('fill', '--gold'));
  });
});
