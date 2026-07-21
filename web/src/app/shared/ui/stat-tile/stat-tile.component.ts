import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-tile',
  imports: [],
  templateUrl: './stat-tile.component.html',
  styleUrl: './stat-tile.component.scss',
})
export class StatTileComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly tone = input<'default' | 'income' | 'expense'>('default');
}
