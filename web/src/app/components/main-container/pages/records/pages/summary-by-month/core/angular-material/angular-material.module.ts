import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

const MaterialModules = [
  MatIconModule,
  MatGridListModule
];

@NgModule({
  imports: [MaterialModules],
  exports: [MaterialModules]
})
export class AngularMaterialModule { }
