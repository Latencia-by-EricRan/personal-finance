import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AngularMaterialModule } from '../../core';
import { ISummary } from '../../../../core';

@Component({
  selector: 'app-movement-summary',
  imports: [CurrencyPipe, AngularMaterialModule],
  templateUrl: './movement-summary.component.html',
  styleUrl: './movement-summary.component.scss',
})
export class MovementSummaryComponent {
  summary = input.required<ISummary>();
}
