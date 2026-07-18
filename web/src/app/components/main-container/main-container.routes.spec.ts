import { MainContainerRoutes } from './main-container.routes';
import { RecordsComponent } from './pages/records/records.component';
import { RecordsRoutes } from './pages/records/records.routes';
import { CuentasComponent } from './pages/cuentas/cuentas.component';
import { CuentasRoutes } from './pages/cuentas/cuentas.routes';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { NorteComponent } from './pages/norte/norte.component';
import { NorteRoutes } from './pages/norte/norte.routes';

describe('MainContainerRoutes', () => {
  it('registers the norte section with its component and children routes', () => {
    const norte = MainContainerRoutes.find((route) => route.path === 'norte');

    expect(norte?.component).toBe(NorteComponent);
    expect(norte?.children).toBe(NorteRoutes);
  });

  it('resolves /norte to the overview page by default via NorteRoutes redirect', () => {
    const norte = MainContainerRoutes.find((route) => route.path === 'norte');
    const defaultChild = norte?.children?.find((child) => child.path === '');

    expect(defaultChild?.redirectTo).toBe('overview');
    expect(defaultChild?.pathMatch).toBe('full');
  });

  it('leaves the existing records/cuentas/expenses sections unchanged', () => {
    const records = MainContainerRoutes.find((route) => route.path === 'records');
    const cuentas = MainContainerRoutes.find((route) => route.path === 'cuentas');
    const expenses = MainContainerRoutes.find((route) => route.path === 'expenses');

    expect(records?.component).toBe(RecordsComponent);
    expect(records?.children).toBe(RecordsRoutes);
    expect(cuentas?.component).toBe(CuentasComponent);
    expect(cuentas?.children).toBe(CuentasRoutes);
    expect(expenses?.component).toBe(ExpensesComponent);
  });

  it('keeps the default redirect to /records as the trailing catch-all', () => {
    const catchAll = MainContainerRoutes[MainContainerRoutes.length - 1];

    expect(catchAll.path).toBe('');
    expect(catchAll.redirectTo).toBe('/records');
    expect(catchAll.pathMatch).toBe('full');
  });
});
