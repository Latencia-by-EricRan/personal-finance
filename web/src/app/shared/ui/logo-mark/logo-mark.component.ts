import { Component, input } from '@angular/core';

/**
 * "Norte" brand mark: a round outer ring containing a smaller ring with the
 * letter "N", plus an "↑" glyph offset toward the top-right like a compass
 * needle pointing north. Composed entirely from two nested circle strokes
 * and two text glyphs (no vector icon asset) — matches the mockup exactly.
 * The `size` input scales the whole mark proportionally from its 64px base.
 */
@Component({
  selector: 'app-logo-mark',
  imports: [],
  templateUrl: './logo-mark.component.html',
  styleUrl: './logo-mark.component.scss',
})
export class LogoMarkComponent {
  readonly size = input<number>(64);
}
