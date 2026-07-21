import { Component, input } from '@angular/core';

@Component({
  selector: 'app-list-row',
  imports: [],
  templateUrl: './list-row.component.html',
  styleUrl: './list-row.component.scss',
})
export class ListRowComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
}
