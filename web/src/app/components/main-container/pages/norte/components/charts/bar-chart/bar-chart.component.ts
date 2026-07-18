import { Component, computed, input } from '@angular/core';

import { IBarDatum } from '../../../core/models';

export interface IBarGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  label: string;
}

const DEFAULT_HEIGHT = 160;
const DEFAULT_GAP = 8;
const DEFAULT_BAR_WIDTH = 24;
const DEFAULT_FILL = 'var(--gold)';

/**
 * Pure, presentational grouped/vertical bar chart. Renders a `<rect>` per
 * datum computed entirely from inputs — no service injection, no internal
 * state mutation. Colors always resolve through a `var(--...)` token: either
 * the datum's own `Color`, or `--gold` as the default fill.
 */
@Component({
  selector: 'app-bar-chart',
  imports: [],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent {
  data = input.required<IBarDatum[]>();
  height = input<number>(DEFAULT_HEIGHT);
  gap = input<number>(DEFAULT_GAP);
  barWidth = input<number>(DEFAULT_BAR_WIDTH);

  bars = computed<IBarGeometry[]>(() => {
    const data = this.data();
    const chartHeight = this.height();
    const gap = this.gap();
    const barWidth = this.barWidth();
    const scale = Math.max(0, ...data.map((datum) => datum.Value));

    return data.map((datum, index) => {
      const value = Math.max(0, datum.Value);
      const ratio = scale > 0 ? value / scale : 0;
      const barHeight = ratio * chartHeight;

      return {
        x: index * (barWidth + gap),
        y: chartHeight - barHeight,
        width: barWidth,
        height: barHeight,
        fill: datum.Color ?? DEFAULT_FILL,
        label: datum.Label,
      };
    });
  });

  chartWidth = computed(() => {
    const data = this.data();
    const gap = this.gap();
    const barWidth = this.barWidth();

    return data.length > 0 ? data.length * barWidth + (data.length - 1) * gap : 0;
  });
}
