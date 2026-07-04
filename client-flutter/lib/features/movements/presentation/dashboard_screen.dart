import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/format/index.dart';
import '../../../shared/models/index.dart';
import '../../../shared/widgets/index.dart';
import '../../accounts/data/index.dart';
import '../../categories/data/index.dart';
import 'providers/index.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  static const _navRoutes = <String>[
    '/',
    '/accounts',
    '/budgets',
    '/recurring',
    '/reports',
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final selectedMonth = ref.watch(selectedMonthProvider);
    final summaryAsync = ref.watch(monthSummaryProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Hola, Eric', style: theme.textTheme.bodyMedium),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      MonthPicker(
                        label: AppFormatters.monthYear(
                          selectedMonth.month,
                          selectedMonth.year,
                        ),
                        onPrevious: () =>
                            ref.read(selectedMonthProvider.notifier).previousMonth(),
                        onNext: () =>
                            ref.read(selectedMonthProvider.notifier).nextMonth(),
                      ),
                      IconButton(
                        icon: const Icon(Icons.settings_outlined),
                        onPressed: () {},
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: summaryAsync.when(
                data: (summary) => _DashboardBody(summary: summary),
                loading: () =>
                    const Center(child: CircularProgressIndicator()),
                error: (error, stackTrace) => ErrorRetry(
                  message: 'No pudimos cargar el resumen. Probá de nuevo.',
                  onRetry: () {
                    ref.invalidate(monthSummaryProvider);
                    ref.invalidate(dashboardMovementsProvider);
                  },
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        key: const Key('dashboard-fab'),
        onPressed: () => context.push('/movements/add'),
        child: const Icon(Icons.add),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        onDestinationSelected: (index) {
          final destination = _navRoutes[index];
          if (destination != '/') context.go(destination);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_rounded),
            label: 'Resumen',
          ),
          NavigationDestination(
            icon: Icon(Icons.account_balance_wallet_rounded),
            label: 'Cuentas',
          ),
          NavigationDestination(
            icon: Icon(Icons.pie_chart_rounded),
            label: 'Presupuestos',
          ),
          NavigationDestination(
            icon: Icon(Icons.autorenew_rounded),
            label: 'Recurrentes',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_rounded),
            label: 'Reportes',
          ),
        ],
      ),
    );
  }
}

class _DashboardBody extends ConsumerWidget {
  const _DashboardBody({required this.summary});

  final MovementSummaryResponse summary;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final movementsAsync = ref.watch(dashboardMovementsProvider);
    final categories = ref.watch(categoriesProvider).value ?? const [];
    final accounts = ref.watch(accountsProvider).value ?? const [];
    final filter = ref.watch(movementFilterProvider);
    final filterNotifier = ref.read(movementFilterProvider.notifier);

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 96),
      children: [
        BalanceCard(amount: summary.summary.amount),
        const SizedBox(height: 20),
        _FilterBar(
          categories: categories,
          accounts: accounts,
          filter: filter,
          notifier: filterNotifier,
        ),
        const SizedBox(height: 12),
        movementsAsync.when(
          data: (movements) => movements.isEmpty
              ? const EmptyState(message: 'No hay movimientos este mes.')
              : Column(
                  children: [
                    for (final movement in movements)
                      MovementTile(
                        movement: movement,
                        onTap: () =>
                            context.push('/movements/add', extra: movement),
                      ),
                  ],
                ),
          loading: () => const Padding(
            padding: EdgeInsets.symmetric(vertical: 32),
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (error, stackTrace) => ErrorRetry(
            message: 'No pudimos cargar los movimientos. Probá de nuevo.',
            onRetry: () => ref.invalidate(dashboardMovementsProvider),
          ),
        ),
      ],
    );
  }
}

class _FilterBar extends StatelessWidget {
  const _FilterBar({
    required this.categories,
    required this.accounts,
    required this.filter,
    required this.notifier,
  });

  final List<Category> categories;
  final List<Account> accounts;
  final MovementFilterState filter;
  final MovementFilterNotifier notifier;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _chip(
            label: 'Todos',
            selected: filter.isEmpty,
            onSelected: (_) => notifier.clearAll(),
          ),
          _chip(
            label: 'Ingresos',
            selected: filter.type == MovementType.ingreso,
            onSelected: (selected) =>
                notifier.setType(selected ? MovementType.ingreso : null),
          ),
          _chip(
            label: 'Egresos',
            selected: filter.type == MovementType.egreso,
            onSelected: (selected) =>
                notifier.setType(selected ? MovementType.egreso : null),
          ),
          for (final category in categories)
            _chip(
              label: category.name,
              selected: filter.category == category.id,
              onSelected: (selected) =>
                  notifier.setCategory(selected ? category.id : null),
            ),
          for (final account in accounts)
            _chip(
              label: account.name,
              selected: filter.account == account.id,
              onSelected: (selected) =>
                  notifier.setAccount(selected ? account.id : null),
            ),
        ],
      ),
    );
  }

  Widget _chip({
    required String label,
    required bool selected,
    required ValueChanged<bool> onSelected,
  }) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: onSelected,
      ),
    );
  }
}
