import { Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { StatTileComponent } from '../../../../../../../../shared/ui';
import { ISummary } from '../../../../core';

@Component({
    selector: 'app-movement-summary',
    imports: [
        CurrencyPipe,
        StatTileComponent,
    ],
    templateUrl: './movement-summary.component.html',
    styleUrl: './movement-summary.component.scss'
})
export class MovementSummaryComponent {

  summary = input.required<ISummary>();

  net = computed(() => this.summary().amount.income - this.summary().amount.expense);

}
