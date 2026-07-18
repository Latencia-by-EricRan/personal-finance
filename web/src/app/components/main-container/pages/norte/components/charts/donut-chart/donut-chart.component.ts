import { Component, computed, input } from '@angular/core';

import { IDonutSegment } from '../../../core/models';

export interface IDonutArc {
  color: string;
  value: number;
  percent: number;
  angle: number;
  dashArray: string;
  dashOffset: number;
}

const DEFAULT_RADIUS = 40;
const DEFAULT_STROKE_WIDTH = 14;
const FULL_TURN_DEGREES = 360;
const PERCENT_MAX = 100;

/**
 * Pure, presentational expense-by-category donut chart. Renders the ring as
 * stacked `<circle>` strokes (stroke-dasharray/-dashoffset), which yields
 * exact, trig-rounding-free geometry for the per-slice `angle`/`percent`
 * contract while still producing a true annulus (donut) visually. When the
 * segment total is 0, no colored arcs render — only the neutral track ring
 * (`--surface-2`), never a colored/green fallback.
 */
@Component({
  selector: 'app-donut-chart',
  imports: [],
  templateUrl: './donut-chart.component.html',
  styleUrl: './donut-chart.component.scss',
})
export class DonutChartComponent {
  segments = input.required<IDonutSegment[]>();
  radius = input<number>(DEFAULT_RADIUS);
  strokeWidth = input<number>(DEFAULT_STROKE_WIDTH);

  circumference = computed(() => 2 * Math.PI * this.radius());

  viewBoxSize = computed(() => this.radius() * 2 + this.strokeWidth());

  donutArcs = computed<IDonutArc[]>(() => {
    const values = this.segments().map((segment) => Math.max(0, segment.Value));
    const total = values.reduce((sum, value) => sum + value, 0);

    if (total <= 0) {
      return [];
    }

    const circumference = this.circumference();
    let cumulativeLength = 0;

    return this.segments().map((segment, index) => {
      const value = values[index];
      const percent = (value / total) * PERCENT_MAX;
      const angle = (percent / PERCENT_MAX) * FULL_TURN_DEGREES;
      const length = (value / total) * circumference;
      const dashArray = `${length} ${circumference - length}`;
      const dashOffset = -cumulativeLength;

      cumulativeLength += length;

      return {
        color: segment.Color,
        value,
        percent,
        angle,
        dashArray,
        dashOffset,
      };
    });
  });

  isEmpty = computed(() => this.donutArcs().length === 0);
}
