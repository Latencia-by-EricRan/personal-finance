import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/format/index.dart';
import '../../../core/theme/index.dart';
import '../../../shared/models/index.dart';
import '../../../shared/widgets/index.dart';
import '../../movements/presentation/providers/selected_month_provider.dart';
import '../data/index.dart';

Color _categoryColor(Category category) {
  final key = category.id ?? category.tag;
  return AppColors
      .categoryPalette[key.hashCode.abs() % AppColors.categoryPalette.length];
}

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> {
  static const _navRoutes = <String>[
    '/',
    '/accounts',
    '/budgets',
    '/recurring',
    '/reports',
  ];

  // The monthly bar chart is scoped by YEAR, while the app-wide
  // `selectedMonthProvider` only carries month granularity (it's shared with
  // screens like Dashboard/Presupuestos that never need year navigation on
  // their own). Only this screen's monthly chart needs a year to move
  // independently of the month picker, so it gets a plain local field
  // instead of a new shared/global provider.
  late int _year;

  @override
  void initState() {
    super.initState();
    _year = ref.read(selectedMonthProvider).year;
  }

  void _previousYear() => setState(() => _year -= 1);

  void _nextYear() => setState(() => _year += 1);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final selectedMonth = ref.watch(selectedMonthProvider);

    return Scaffold(
      body: SafeArea(
        // A fixed set of 3 known sections (not an arbitrarily-long list), so
        // a plain `SingleChildScrollView`/`Column` is the right scroll
        // container: it builds every section eagerly. A `ListView` here
        // would virtualize via `SliverList` and skip building sections that
        // fall outside the viewport + cache extent.
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 96),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Reportes', style: theme.textTheme.headlineSmall),
              const SizedBox(height: 8),
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
              const SizedBox(height: 20),
              const _CashflowSection(),
              const SizedBox(height: 24),
              const _CategoryPieSection(),
              const SizedBox(height: 24),
              _MonthlyBarSection(
                year: _year,
                onPreviousYear: _previousYear,
                onNextYear: _nextYear,
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 4,
        onDestinationSelected: (index) {
          if (index == 4) return;
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

class _CashflowSection extends ConsumerWidget {
  const _CashflowSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cashflowAsync = ref.watch(cashflowReportProvider);

    return cashflowAsync.when(
      data: (cashflow) => _CashflowCard(cashflow: cashflow),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stackTrace) => ErrorRetry(
        message: 'No pudimos cargar el flujo de caja. Probá de nuevo.',
        onRetry: () => ref.invalidate(cashflowReportProvider),
      ),
    );
  }
}

class _CashflowCard extends StatelessWidget {
  const _CashflowCard({required this.cashflow});

  final CashflowReport cashflow;

  @override
  Widget build(BuildContext context) {
    final netColor = cashflow.net >= 0 ? AppColors.income : AppColors.expense;

    return Container(
      key: const Key('cashflow-card'),
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceHigh,
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Row(
        children: [
          Expanded(
            child: _StatColumn(
              label: 'Ingresos',
              value: cashflow.income,
              color: AppColors.income,
            ),
          ),
          Expanded(
            child: _StatColumn(
              label: 'Egresos',
              value: cashflow.expense,
              color: AppColors.expense,
            ),
          ),
          Expanded(
            child: _StatColumn(
              label: 'Neto',
              value: cashflow.net,
              color: netColor,
              valueKey: const Key('cashflow-net-value'),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatColumn extends StatelessWidget {
  const _StatColumn({
    required this.label,
    required this.value,
    required this.color,
    this.valueKey,
  });

  final String label;
  final double value;
  final Color color;
  final Key? valueKey;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: theme.textTheme.labelMedium),
        const SizedBox(height: 2),
        Text(
          key: valueKey,
          AppFormatters.currency(value),
          style: theme.textTheme.labelLarge?.copyWith(
            color: color,
            fontFeatures: const [FontFeature.tabularFigures()],
          ),
        ),
      ],
    );
  }
}

class _CategoryPieSection extends ConsumerWidget {
  const _CategoryPieSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoryAsync = ref.watch(categoryReportProvider);

    return categoryAsync.when(
      data: (entries) => entries.isEmpty
          ? const EmptyState(
              message: 'No hay gastos por categoría este mes.',
            )
          : _CategoryPieChart(entries: entries),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stackTrace) => ErrorRetry(
        message: 'No pudimos cargar el gasto por categoría. Probá de nuevo.',
        onRetry: () => ref.invalidate(categoryReportProvider),
      ),
    );
  }
}

class _CategoryPieChart extends StatelessWidget {
  const _CategoryPieChart({required this.entries});

  final List<CategoryReportEntry> entries;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final total = entries.fold<double>(0, (sum, entry) => sum + entry.total);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Gastos por categoría', style: theme.textTheme.titleMedium),
        const SizedBox(height: 12),
        SizedBox(
          height: 200,
          child: PieChart(
            PieChartData(
              sectionsSpace: 2,
              centerSpaceRadius: 40,
              sections: [
                for (final entry in entries)
                  PieChartSectionData(
                    value: entry.total,
                    color: _categoryColor(entry.category),
                    radius: 70,
                    // Only larger slices get a direct percentage label —
                    // slivers below 10% would clip/overlap, so the legend
                    // stays the source of truth for exact amounts.
                    showTitle: total > 0 && (entry.total / total) >= 0.10,
                    title: total > 0
                        ? '${((entry.total / total) * 100).toStringAsFixed(0)}%'
                        : '',
                    titleStyle: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        for (final entry in entries) _CategoryLegendRow(entry: entry),
      ],
    );
  }
}

class _CategoryLegendRow extends StatelessWidget {
  const _CategoryLegendRow({required this.entry});

  final CategoryReportEntry entry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final category = entry.category;
    final key = category.id ?? category.tag;

    return Padding(
      key: Key('category-legend-$key'),
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: _categoryColor(category),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(category.name, style: theme.textTheme.bodyMedium),
          ),
          Text(
            AppFormatters.currency(entry.total),
            style: theme.textTheme.bodyMedium?.copyWith(
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
        ],
      ),
    );
  }
}

class _MonthlyBarSection extends ConsumerWidget {
  const _MonthlyBarSection({
    required this.year,
    required this.onPreviousYear,
    required this.onNextYear,
  });

  final int year;
  final VoidCallback onPreviousYear;
  final VoidCallback onNextYear;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final monthlyAsync = ref.watch(monthlyReportProvider(year));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Ingresos y egresos por mes',
              style: theme.textTheme.titleMedium,
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  key: const Key('year-picker-previous'),
                  icon: const Icon(Icons.chevron_left),
                  onPressed: onPreviousYear,
                ),
                Text('$year', style: theme.textTheme.titleMedium),
                IconButton(
                  key: const Key('year-picker-next'),
                  icon: const Icon(Icons.chevron_right),
                  onPressed: onNextYear,
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 12),
        monthlyAsync.when(
          data: (entries) => _MonthlyBarChart(entries: entries),
          loading: () => const Padding(
            padding: EdgeInsets.symmetric(vertical: 32),
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (error, stackTrace) => ErrorRetry(
            message: 'No pudimos cargar el reporte mensual. Probá de nuevo.',
            onRetry: () => ref.invalidate(monthlyReportProvider(year)),
          ),
        ),
        const SizedBox(height: 8),
        const _MonthlyLegend(),
      ],
    );
  }
}

class _MonthlyBarChart extends StatelessWidget {
  const _MonthlyBarChart({required this.entries});

  final List<MonthlyReportEntry> entries;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 220,
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          titlesData: FlTitlesData(
            topTitles: const AxisTitles(),
            rightTitles: const AxisTitles(),
            leftTitles: const AxisTitles(),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  final month = value.toInt() + 1;
                  if (month < 1 || month > 12) return const SizedBox.shrink();
                  return Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(AppFormatters.monthAbbreviation(month)),
                  );
                },
              ),
            ),
          ),
          barGroups: [
            for (final entry in entries)
              BarChartGroupData(
                x: entry.month - 1,
                barRods: [
                  BarChartRodData(toY: entry.income, color: AppColors.income),
                  BarChartRodData(
                    toY: entry.expense,
                    color: AppColors.expense,
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

class _MonthlyLegend extends StatelessWidget {
  const _MonthlyLegend();

  @override
  Widget build(BuildContext context) {
    return const Row(
      key: Key('monthly-legend'),
      children: [
        _LegendSwatch(color: AppColors.income, label: 'Ingresos'),
        SizedBox(width: 16),
        _LegendSwatch(color: AppColors.expense, label: 'Egresos'),
      ],
    );
  }
}

class _LegendSwatch extends StatelessWidget {
  const _LegendSwatch({required this.color, required this.label});

  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(label, style: theme.textTheme.bodySmall),
      ],
    );
  }
}
