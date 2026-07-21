import { Component, computed, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { IMovement, TypeMovement } from '../../../../core';

@Component({
    selector: 'app-movement-card',
    imports: [
        DatePipe,
        CurrencyPipe,
    ],
    templateUrl: './movement-card.component.html',
    styleUrl: './movement-card.component.scss'
})
export class MovementCardComponent {

  movement = input.required<IMovement>();

  readonly TypeMovement = TypeMovement;

  readonly isIncome = computed(() => this.movement().Type === TypeMovement.INGRESO);

  readonly title = computed(() => this.movement().Description || this.movement().Category?.Name || 'Movement');

}
