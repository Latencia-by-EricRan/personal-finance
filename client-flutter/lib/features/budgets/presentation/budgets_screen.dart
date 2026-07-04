import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/format/index.dart';
import '../../../core/theme/index.dart';
import '../../../shared/models/index.dart';
import '../../../shared/widgets/index.dart';
import '../../movements/presentation/providers/selected_month_provider.dart';
import '../data/index.dart';

class BudgetsScreen extends ConsumerWidget {
  const BudgetsScreen({super.key});

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
    final statusAsync = ref.watch(budgetStatusProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Presupuestos',
                          style: theme.textTheme.headlineSmall),
                      IconButton(
                        key: const Key('budgets-add-button'),
                        icon: const Icon(Icons.add),
                        onPressed: () => context.push('/budgets/add'),
                      ),
                    ],
                  ),
                  MonthPicker(
                    label: AppFormatters.monthYear(
                      selectedMonth.month,
                      selectedMonth.year,
                    ),
                    onPrevious: () => ref
                        .read(selectedMonthProvider.notifier)
                        .previousMonth(),
                    onNext: () =>
                        ref.read(selectedMonthProvider.notifier).nextMonth(),
                  ),
                ],
              ),
            ),
            Expanded(
              child: statusAsync.when(
                data: (statuses) => statuses.isEmpty
                    ? const EmptyState(
                        message: 'No hay presupuestos definidos para este mes.',
                      )
                    : ListView(
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 96),
                        children: [
                          for (final status in statuses)
                            _BudgetCard(status: status),
                        ],
                      ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stackTrace) => ErrorRetry(
                  message:
                      'No pudimos cargar los presupuestos. Probá de nuevo.',
                  onRetry: () => ref.invalidate(budgetStatusProvider),
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 2,
        onDestinationSelected: (index) {
          if (index == 2) return;
          context.go(_navRoutes[index]);
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

class _BudgetCard extends StatelessWidget {
  const _BudgetCard({required this.status});

  final BudgetStatus status;

  Color get _percentColor {
    final percent = status.percent;
    if (percent >= 100) return AppColors.expense;
    if (percent >= 70) return AppColors.warning;
    return AppColors.income;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final category = status.category;
    final cardKey = category.id ?? category.tag;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Card(
        key: Key('budget-card-$cardKey'),
        child: InkWell(
          // `BudgetStatus` is a computed/joined view returned by
          // `GET /budget/status/:month/:year` — it does not carry the
          // underlying `Budget` document's own `_id` (only the raw
          // `Budget` entity, used by the slice-2 form, has one). Best
          // effort for this slice: pass the whole `BudgetStatus` (Category
          // + Limit for this month/year) as `extra`; resolving edit-vs-create
          // from that is the slice-2 form's responsibility, not this screen's.
          onTap: () => context.push('/budgets/add', extra: status),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _CategoryAvatar(category: category),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              category.name,
                              style: theme.textTheme.titleMedium,
                            ),
                          ),
                          Text(
                            key: Key('budget-percent-$cardKey'),
                            '${status.percent.toStringAsFixed(0)}%',
                            style: theme.textTheme.labelLarge?.copyWith(
                              color: _percentColor,
                              fontFeatures: const [
                                FontFeature.tabularFigures(),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      BudgetProgressMeter(percent: status.percent),
                      const SizedBox(height: 8),
                      Text(
                        '${AppFormatters.currency(status.spent)} gastado de '
                        '${AppFormatters.currency(status.limit)}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontFeatures: const [FontFeature.tabularFigures()],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _CategoryAvatar extends StatelessWidget {
  const _CategoryAvatar({required this.category});

  final Category category;

  @override
  Widget build(BuildContext context) {
    final key = category.id ?? category.tag;
    final color = AppColors
        .categoryPalette[key.hashCode.abs() % AppColors.categoryPalette.length];
    final letters = category.name.trim();
    final monogram =
        (letters.length >= 2 ? letters.substring(0, 2) : letters).toUpperCase();

    return Container(
      width: 44,
      height: 44,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Text(
        monogram,
        style:
            const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
    );
  }
}
