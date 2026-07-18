import { Routes } from '@angular/router';
import { OverviewComponent } from './pages/overview/overview.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { BudgetsComponent } from './pages/budgets/budgets.component';

const NorteRoutes: Routes = [
  { path: 'overview', component: OverviewComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'budgets', component: BudgetsComponent },
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
];

export { NorteRoutes };
