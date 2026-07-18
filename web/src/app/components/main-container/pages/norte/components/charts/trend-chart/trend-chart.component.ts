import { Component, computed, input } from '@angular/core';

import { ITrendPoint } from '../../../core/models';

export interface ITrendGeometry {
  x: number;
  y: number;
  label: string;
}

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 120;

/**
 * Pure, presentational line/area trend chart. Computes a polyline/area `d`
 * path string entirely from inputs — no service injection, no internal
 * state mutation. Guards against divide-by-zero for a single point or a
 * flat (all-equal-value) series by falling back to a mid-height flat line.
 */
@Component({
  selector: 'app-trend-chart',
  imports: [],
  templateUrl: './trend-chart.component.html',
  styleUrl: './trend-chart.component.scss',
})
export class TrendChartComponent {
  points = input.required<ITrendPoint[]>();
  width = input<number>(DEFAULT_WIDTH);
  height = input<number>(DEFAULT_HEIGHT);

  trendPoints = computed<ITrendGeometry[]>(() => {
    const points = this.points();

    if (points.length === 0) {
      return [];
    }

    const width = this.width();
    const chartHeight = this.height();
    const values = points.map((point) => point.Value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const xStep = points.length > 1 ? width / (points.length - 1) : 0;

    return points.map((point, index) => ({
      x: index * xStep,
      y: range === 0 ? chartHeight / 2 : chartHeight - ((point.Value - min) / range) * chartHeight,
      label: point.Label,
    }));
  });

  path = computed(() => {
    const points = this.trendPoints();

    if (points.length === 0) {
      return '';
    }

    return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  });

  areaPath = computed(() => {
    const points = this.trendPoints();

    if (points.length === 0) {
      return '';
    }

    const chartHeight = this.height();
    const first = points[0];
    const last = points[points.length - 1];

    return `${this.path()} L ${last.x} ${chartHeight} L ${first.x} ${chartHeight} Z`;
  });
}
