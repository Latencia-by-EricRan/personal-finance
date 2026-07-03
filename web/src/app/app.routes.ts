import { Routes } from '@angular/router';
import { MainContainerRoutes, LoginComponent } from './components';
import { authGuard } from './core/auth';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', canActivateChild: [authGuard], children: MainContainerRoutes },
];
