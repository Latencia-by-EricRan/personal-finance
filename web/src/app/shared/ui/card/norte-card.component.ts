import { Component, input } from '@angular/core';

@Component({
  selector: 'app-norte-card',
  imports: [],
  templateUrl: './norte-card.component.html',
  styleUrl: './norte-card.component.scss',
})
export class NorteCardComponent {
  readonly padded = input<boolean>(true);
}
