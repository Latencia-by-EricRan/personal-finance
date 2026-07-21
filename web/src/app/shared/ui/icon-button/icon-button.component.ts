import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-icon-button',
  imports: [],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
})
export class IconButtonComponent {
  readonly ariaLabel = input.required<string>();
  readonly disabled = input<boolean>(false);

  readonly pressed = output<void>();

  onClick(): void {
    if (this.disabled()) {
      return;
    }

    this.pressed.emit();
  }
}
