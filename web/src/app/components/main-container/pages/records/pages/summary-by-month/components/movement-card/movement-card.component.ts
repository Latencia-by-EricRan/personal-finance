import { Component, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AngularMaterialModule } from '../../core';
import { IMovement } from '../../../../core';



@Component({
    selector: 'app-movement-card',
    imports: [
        DatePipe,
        CurrencyPipe,
        MatCardModule,
        AngularMaterialModule,
    ],
    templateUrl: './movement-card.component.html',
    styleUrl: './movement-card.component.scss'
})
export class MovementCardComponent {

  movement = input.required<IMovement>();
  iconDefault = 'question_mark';

}
