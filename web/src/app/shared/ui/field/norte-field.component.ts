import { Component, input } from '@angular/core';

/**
 * Presentational label + wrapper. The actual form control is projected by
 * the consumer and binds directly to reactive forms as today — this
 * component is NOT a ControlValueAccessor. The projected control is
 * expected to carry `class="norte-field__control"` so the wrapper's SCSS
 * can style it consistently (chosen over `::ng-deep` since it's simpler,
 * explicit, and avoids piercing view encapsulation).
 */
@Component({
  selector: 'app-norte-field',
  imports: [],
  templateUrl: './norte-field.component.html',
  styleUrl: './norte-field.component.scss',
})
export class NorteFieldComponent {
  readonly label = input.required<string>();
  readonly errorMessage = input<string | null>(null);
}
