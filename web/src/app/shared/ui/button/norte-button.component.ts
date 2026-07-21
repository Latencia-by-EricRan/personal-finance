import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-norte-button',
  imports: [],
  templateUrl: './norte-button.component.html',
  styleUrl: './norte-button.component.scss',
})
export class NorteButtonComponent {
  readonly variant = input<'primary' | 'outline'>('primary');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input<boolean>(false);
  readonly fullWidth = input<boolean>(true);

  readonly pressed = output<void>();

  onClick(): void {
    if (this.disabled()) {
      return;
    }

    this.pressed.emit();
  }
}
