import { Routes } from '@angular/router';
import { RecordsComponent } from './pages/records/records.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { RecordsRoutes } from './pages/records/records.routes';
import { CuentasComponent } from './pages/cuentas/cuentas.component';
import { CuentasRoutes } from './pages/cuentas/cuentas.routes';
import { NorteComponent } from './pages/norte/norte.component';
import { NorteRoutes } from './pages/norte/norte.routes';

export const MainContainerRoutes: Routes = [
  {
    path: 'records',
    component: RecordsComponent,
    children: RecordsRoutes
  },
  {
    path: 'cuentas',
    component: CuentasComponent,
    children: CuentasRoutes
  },
  {
    path: 'expenses',
    component: ExpensesComponent,
  },
  {
    path: 'norte',
    component: NorteComponent,
    children: NorteRoutes
  },
  {
    path: '', redirectTo: '/records', pathMatch: 'full'
  }
];
