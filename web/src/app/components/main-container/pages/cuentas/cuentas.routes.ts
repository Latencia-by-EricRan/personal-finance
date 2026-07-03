import { Routes } from '@angular/router';
import { AccountListComponent } from './pages/account-list/account-list.component';

export const CuentasRoutes: Routes = [
  { path: 'account-list', component: AccountListComponent },
  { path: '', redirectTo: 'account-list', pathMatch: 'full' },
];
