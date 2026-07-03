import { Routes } from '@angular/router';
import { SummaryByMonthComponent } from './pages/summary-by-month/summary-by-month.component';
import { MovementAddComponent } from './pages/movement-add/movement-add.component';

const RecordsRoutes: Routes = [
  { path: 'summary-by-month', component: SummaryByMonthComponent },
  { path: 'movement/add', component: MovementAddComponent },
  { path: '', redirectTo: 'summary-by-month', pathMatch: 'full' }
];

export { RecordsRoutes };
