import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

import { DonutChartComponent } from './donut-chart.component';
import { IDonutSegment } from '../../../core/models';

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

describe('DonutChartComponent', () => {
  let fixture: ComponentFixture<DonutChartComponent>;
  let component: DonutChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonutChartComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DonutChartComponent);
    component = fixture.componentInstance;
  });

  it('computes arc angles/percents proportional to each value share, summing to ~360 degrees', () => {
    const segments: IDonutSegment[] = [
      { Label: 'Food', Value: 30, Color: 'var(--cat-1)' },
      { Label: 'Rent', Value: 50, Color: 'var(--cat-2)' },
      { Label: 'Fun', Value: 20, Color: 'var(--cat-3)' },
    ];
    fixture.componentRef.setInput('segments', segments);
    fixture.detectChanges();

    const arcs = component.donutArcs();
    const totalAngle = arcs.reduce((sum, arc) => sum + arc.angle, 0);

    expect(totalAngle).toBeCloseTo(360, 6);
    expect(arcs[0].percent).toBeCloseTo(30, 6);
    expect(arcs[1].percent).toBeCloseTo(50, 6);
    expect(arcs[2].percent).toBeCloseTo(20, 6);
    expect(arcs[0].color).toBe('var(--cat-1)');
    expect(arcs[1].color).toBe('var(--cat-2)');
    expect(arcs[2].color).toBe('var(--cat-3)');
  });

  it('accumulates dash offsets so slices stack around the ring without overlap', () => {
    fixture.componentRef.setInput('segments', [
      { Label: 'A', Value: 25, Color: 'var(--cat-1)' },
      { Label: 'B', Value: 75, Color: 'var(--cat-2)' },
    ]);
    fixture.componentRef.setInput('radius', 40);
    fixture.detectChanges();

    const arcs = component.donutArcs();
    const circumference = component.circumference();

    expect(arcs[0].dashOffset).toBe(0);
    expect(arcs[1].dashOffset).toBeCloseTo(-(circumference * 0.25), 6);
  });

  it('renders each arc stroke resolved from its Color token, never a hardcoded hex', () => {
    fixture.componentRef.setInput('segments', [
      { Label: 'A', Value: 10, Color: 'var(--cat-4)' },
      { Label: 'B', Value: 10, Color: 'var(--cat-5)' },
    ]);
    fixture.detectChanges();

    const circles = fixture.nativeElement.querySelectorAll('circle.donut-chart__arc') as NodeListOf<SVGCircleElement>;

    expect(circles.length).toBe(2);
    expect(getComputedStyle(circles[0]).stroke).toBe(resolveSvgColor('stroke', '--cat-4'));
    expect(getComputedStyle(circles[1]).stroke).toBe(resolveSvgColor('stroke', '--cat-5'));
  });

  it('renders a single neutral --surface-2 ring with no colored arcs when total is 0', () => {
    fixture.componentRef.setInput('segments', [
      { Label: 'A', Value: 0, Color: 'var(--cat-1)' },
      { Label: 'B', Value: 0, Color: 'var(--cat-2)' },
    ]);
    fixture.detectChanges();

    expect(component.donutArcs()).toEqual([]);
    expect(component.isEmpty()).toBe(true);

    const arcs = fixture.nativeElement.querySelectorAll('circle.donut-chart__arc');
    expect(arcs.length).toBe(0);

    const track = fixture.nativeElement.querySelector('circle.donut-chart__track') as SVGCircleElement;
    expect(track).toBeTruthy();
    expect(getComputedStyle(track).stroke).toBe(resolveSvgColor('stroke', '--surface-2'));
  });

  it('clamps a negative segment Value to zero instead of an invalid negative dash length', () => {
    fixture.componentRef.setInput('segments', [
      { Label: 'Income', Value: 100, Color: 'var(--cat-1)' },
      { Label: 'Refund', Value: -20, Color: 'var(--cat-2)' },
    ]);
    fixture.detectChanges();

    const arcs = component.donutArcs();
    const negativeArc = arcs.find((arc) => arc.color === 'var(--cat-2)');

    expect(negativeArc?.value).toBe(0);
    expect(negativeArc?.percent).toBe(0);
    expect(negativeArc?.angle).toBe(0);
    const [length] = (negativeArc?.dashArray ?? '').split(' ').map(Number);
    expect(length).toBe(0);
  });

  it('renders a single neutral ring for an empty segments array, no NaN', () => {
    fixture.componentRef.setInput('segments', []);
    fixture.detectChanges();

    expect(component.donutArcs()).toEqual([]);
    expect(component.isEmpty()).toBe(true);
    expect(Number.isNaN(component.circumference())).toBe(false);
  });
});
