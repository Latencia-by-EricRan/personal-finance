import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/format/index.dart';
import '../../../core/network/index.dart';
import '../../../core/theme/index.dart';
import '../../../shared/models/index.dart';
import '../../../shared/widgets/index.dart';
import '../../accounts/data/index.dart';
import '../../categories/data/index.dart';
import '../../movements/presentation/providers/index.dart';
import '../data/index.dart';

class RecurringsScreen extends ConsumerStatefulWidget {
  const RecurringsScreen({super.key});

  @override
  ConsumerState<RecurringsScreen> createState() => _RecurringsScreenState();
}

class _RecurringsScreenState extends ConsumerState<RecurringsScreen> {
  static const _navRoutes = <String>[
    '/',
    '/accounts',
    '/budgets',
    '/recurring',
    '/reports',
  ];

  final _togglingIds = <String>{};
  var _running = false;

  void _showError(Object error) {
    if (!mounted) return;
    final message = error is ApiException
        ? error.message
        : 'Ocurrió un error inesperado. Probá de nuevo.';
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _toggleActive(Recurring recurring) async {
    final id = recurring.id;
    if (id == null || _togglingIds.contains(id)) return;
    setState(() => _togglingIds.add(id));
    try {
      await ref
          .read(recurringRepositoryProvider)
          .setActive(id, active: !(recurring.active ?? false));
      ref.invalidate(recurringsProvider);
    } catch (error) {
      _showError(error);
    } finally {
      if (mounted) setState(() => _togglingIds.remove(id));
    }
  }

  Future<void> _run() async {
    if (_running) return;
    setState(() => _running = true);
    try {
      final created = await ref.read(recurringRepositoryProvider).run();
      ref.invalidate(recurringsProvider);
      ref.invalidate(monthSummaryProvider);
      ref.invalidate(dashboardMovementsProvider);
      if (!mounted) return;
      final message = created.isEmpty
          ? 'No había movimientos pendientes.'
          : 'Se generaron ${created.length} movimiento'
                '${created.length == 1 ? '' : 's'}.';
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
    } catch (error) {
      _showError(error);
    } finally {
      if (mounted) setState(() => _running = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final recurringsAsync = ref.watch(recurringsProvider);
    final now = DateTime.now();

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Recurrentes', style: theme.textTheme.headlineSmall),
                  IconButton(
                    key: const Key('recurring-add-button'),
                    icon: const Icon(Icons.add),
                    onPressed: () => context.push('/recurring/add'),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              child: SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  key: const Key('recurring-run-button'),
                  onPressed: _running ? null : _run,
                  icon: const Icon(Icons.play_arrow_rounded),
                  label: Text(
                    'Ejecutar ${AppFormatters.monthYear(now.month, now.year)}',
                  ),
                ),
              ),
            ),
            Expanded(
              child: recurringsAsync.when(
                data: (recurrings) => recurrings.isEmpty
                    ? const EmptyState(
                        message:
                            'No hay movimientos recurrentes registrados.',
                      )
                    : ListView(
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 96),
                        children: [
                          for (final recurring in recurrings)
                            _RecurringCard(
                              recurring: recurring,
                              togglingIds: _togglingIds,
                              onToggle: _toggleActive,
                            ),
                        ],
                      ),
                loading: () =>
                    const Center(child: CircularProgressIndicator()),
                error: (error, stackTrace) => ErrorRetry(
                  message: 'No pudimos cargar los recurrentes. Probá de nuevo.',
                  onRetry: () => ref.invalidate(recurringsProvider),
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 3,
        onDestinationSelected: (index) {
          if (index == 3) return;
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

class _RecurringCard extends ConsumerWidget {
  const _RecurringCard({
    required this.recurring,
    required this.togglingIds,
    required this.onToggle,
  });

  final Recurring recurring;
  final Set<String> togglingIds;
  final ValueChanged<Recurring> onToggle;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final id = recurring.id;

    final categories = ref.watch(categoriesProvider).value;
    final matchingCategories = categories?.where(
      (category) => category.id == recurring.category,
    );
    final category = (matchingCategories != null && matchingCategories.isNotEmpty)
        ? matchingCategories.first
        : null;

    final accounts = ref.watch(accountsProvider).value;
    final matchingAccounts = accounts?.where(
      (account) => account.id == recurring.account,
    );
    final accountName = (matchingAccounts != null && matchingAccounts.isNotEmpty)
        ? matchingAccounts.first.name
        : recurring.account;

    final isIncome = recurring.type == MovementType.ingreso;
    final color = isIncome ? AppColors.income : AppColors.expense;
    final sign = isIncome ? '+' : '−';
    final active = recurring.active ?? false;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Card(
        key: Key('recurring-card-$id'),
        child: InkWell(
          onTap: () => context.push('/recurring/add', extra: recurring),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                _RecurringAvatar(category: category),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        category?.name ?? recurring.category,
                        style: theme.textTheme.titleMedium,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$accountName · Día ${recurring.dayOfMonth}',
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      key: Key('recurring-amount-$id'),
                      '$sign ${AppFormatters.currency(recurring.amount)}',
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: color,
                        fontFeatures: const [FontFeature.tabularFigures()],
                      ),
                    ),
                    Switch(
                      key: Key('recurring-active-switch-$id'),
                      value: active,
                      onChanged: (id == null || togglingIds.contains(id))
                          ? null
                          : (_) => onToggle(recurring),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RecurringAvatar extends StatelessWidget {
  const _RecurringAvatar({required this.category});

  final Category? category;

  @override
  Widget build(BuildContext context) {
    final category = this.category;
    if (category == null) {
      return Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: AppColors.surfaceHighest,
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        child: const Icon(Icons.autorenew_rounded, color: AppColors.textMuted),
      );
    }

    final key = category.id ?? category.tag;
    final color = AppColors.forKey(key);
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
