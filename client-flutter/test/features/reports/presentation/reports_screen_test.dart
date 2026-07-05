import 'package:dio/dio.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/features/reports/data/index.dart';
import 'package:client_flutter/features/reports/presentation/index.dart';
import 'package:client_flutter/shared/models/index.dart';
import 'package:client_flutter/shared/widgets/index.dart';

class _FakeReportRepository extends ReportRepository {
  _FakeReportRepository({
    this.categoryEntries = const [],
    this.monthlyEntries = const [],
    CashflowReport? cashflow,
    this.categoryError,
    this.monthlyError,
    this.cashflowError,
  })  : cashflow = cashflow ??
            const CashflowReport(
              month: 1,
              year: 2026,
              income: 0,
              expense: 0,
              net: 0,
            ),
        super(Dio());

  final List<CategoryReportEntry> categoryEntries;
  final List<MonthlyReportEntry> monthlyEntries;
  final CashflowReport cashflow;
  final Object? categoryError;
  final Object? monthlyError;
  final Object? cashflowError;

  var getByCategoryCallCount = 0;
  var getMonthlyCallCount = 0;
  var getCashflowCallCount = 0;
  int? lastCategoryMonth;
  int? lastCategoryYear;
  int? lastMonthlyYear;
  int? lastCashflowMonth;
  int? lastCashflowYear;

  @override
  Future<List<CategoryReportEntry>> getByCategory({
    required int month,
    required int year,
  }) async {
    getByCategoryCallCount++;
    lastCategoryMonth = month;
    lastCategoryYear = year;
    final error = categoryError;
    if (error != null) throw error;
    return categoryEntries;
  }

  @override
  Future<List<MonthlyReportEntry>> getMonthly({required int year}) async {
    getMonthlyCallCount++;
    lastMonthlyYear = year;
    final error = monthlyError;
    if (error != null) throw error;
    return monthlyEntries;
  }

  @override
  Future<CashflowReport> getCashflow({
    required int month,
    required int year,
  }) async {
    getCashflowCallCount++;
    lastCashflowMonth = month;
    lastCashflowYear = year;
    final error = cashflowError;
    if (error != null) throw error;
    return cashflow;
  }
}

Category _category({required String id, required String name}) => Category(
      id: id,
      description: 'desc',
      name: name,
      tag: 'food',
      type: CategoryType.variable,
    );

List<MonthlyReportEntry> _twelveMonths(int year) => [
      for (var month = 1; month <= 12; month++)
        MonthlyReportEntry(
          month: month,
          income: 1000.0 * month,
          expense: 500.0 * month,
          net: 500.0 * month,
        ),
    ];

// Calls the real shared helper (not a hand-copied re-derivation) so this
// test actually protects against AppColors.forKey drifting in the future.
Color _expectedCategoryColor(Category category) =>
    AppColors.forKey(category.id ?? category.tag);

Widget _wrap({required List<Override> overrides}) {
  final router = GoRouter(
    initialLocation: '/reports',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) =>
            const Scaffold(body: Text('resumen-marker')),
      ),
      GoRoute(
        path: '/accounts',
        builder: (context, state) =>
            const Scaffold(body: Text('accounts-marker')),
      ),
      GoRoute(
        path: '/budgets',
        builder: (context, state) =>
            const Scaffold(body: Text('budgets-marker')),
      ),
      GoRoute(
        path: '/recurring',
        builder: (context, state) =>
            const Scaffold(body: Text('recurring-marker')),
      ),
      GoRoute(
        path: '/reports',
        builder: (context, state) => const ReportsScreen(),
      ),
    ],
  );
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp.router(theme: AppTheme.dark, routerConfig: router),
  );
}

void main() {
  final now = DateTime.now();

  testWidgets(
    'pie chart renders one slice/legend-entry per category with the same '
    'color MovementTile would show for that category',
    (tester) async {
      final categories = [
        _category(id: 'c1', name: 'Super'),
        _category(id: 'c2', name: 'Ocio'),
        _category(id: 'c3', name: 'Delivery'),
      ];
      final repository = _FakeReportRepository(
        categoryEntries: [
          for (final category in categories)
            CategoryReportEntry(category: category, total: 100),
        ],
        monthlyEntries: _twelveMonths(now.year),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [reportRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      final pieChart = tester.widget<PieChart>(find.byType(PieChart));
      expect(pieChart.data.sections, hasLength(categories.length));
      for (var i = 0; i < categories.length; i++) {
        expect(
          pieChart.data.sections[i].color,
          _expectedCategoryColor(categories[i]),
        );
      }

      for (final category in categories) {
        expect(
          find.byKey(Key('category-legend-${category.id}')),
          findsOneWidget,
        );
        expect(find.text(category.name), findsOneWidget);
      }
    },
  );

  testWidgets(
    'monthly bar chart renders 12 months with Income/Expense bars in the '
    'right colors',
    (tester) async {
      final repository = _FakeReportRepository(
        monthlyEntries: _twelveMonths(now.year),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [reportRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      final barChart = tester.widget<BarChart>(find.byType(BarChart));
      expect(barChart.data.barGroups, hasLength(12));
      for (final group in barChart.data.barGroups) {
        expect(group.barRods, hasLength(2));
        expect(group.barRods[0].color, AppColors.income);
        expect(group.barRods[1].color, AppColors.expense);
      }
    },
  );

  testWidgets(
    'year prev/next controls change which year is fetched for the monthly '
    'chart, independent of the shared month picker',
    (tester) async {
      final repository = _FakeReportRepository(
        monthlyEntries: _twelveMonths(now.year),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [reportRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      expect(repository.lastMonthlyYear, now.year);

      await tester.tap(find.byKey(const Key('year-picker-next')));
      await tester.pumpAndSettle();
      expect(repository.lastMonthlyYear, now.year + 1);

      await tester.tap(find.byKey(const Key('year-picker-previous')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const Key('year-picker-previous')));
      await tester.pumpAndSettle();
      expect(repository.lastMonthlyYear, now.year - 1);
    },
  );

  testWidgets(
    'the shared month picker changes both the cashflow card and the pie '
    "chart's data",
    (tester) async {
      final repository = _FakeReportRepository(
        categoryEntries: [
          CategoryReportEntry(
            category: _category(id: 'c1', name: 'Super'),
            total: 100,
          ),
        ],
        monthlyEntries: _twelveMonths(now.year),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [reportRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      expect(repository.lastCashflowMonth, now.month);
      expect(repository.lastCategoryMonth, now.month);

      await tester.tap(find.byKey(const Key('month-picker-next')));
      await tester.pumpAndSettle();

      final expectedNext = now.month == 12
          ? (month: 1, year: now.year + 1)
          : (month: now.month + 1, year: now.year);
      expect(repository.lastCashflowMonth, expectedNext.month);
      expect(repository.lastCashflowYear, expectedNext.year);
      expect(repository.lastCategoryMonth, expectedNext.month);
      expect(repository.lastCategoryYear, expectedNext.year);
    },
  );

  testWidgets(
    'shows the empty state for the category section when there is no '
    'spending this month',
    (tester) async {
      final repository = _FakeReportRepository(
        categoryEntries: const [],
        monthlyEntries: _twelveMonths(now.year),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [reportRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(EmptyState), findsOneWidget);
      expect(find.byType(PieChart), findsNothing);
    },
  );

  testWidgets(
    'shows the empty state for the monthly section when the year has no '
    'activity at all',
    (tester) async {
      final zeroMonths = [
        for (var month = 1; month <= 12; month++)
          MonthlyReportEntry(month: month, income: 0, expense: 0, net: 0),
      ];
      final repository = _FakeReportRepository(monthlyEntries: zeroMonths);

      await tester.pumpWidget(
        _wrap(
          overrides: [reportRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(EmptyState), findsWidgets);
      expect(find.byType(BarChart), findsNothing);
    },
  );

  testWidgets(
    'an error in the cashflow section shows its own ErrorRetry without '
    'blanking the pie chart or the monthly bar chart',
    (tester) async {
      final repository = _FakeReportRepository(
        categoryEntries: [
          CategoryReportEntry(
            category: _category(id: 'c1', name: 'Super'),
            total: 100,
          ),
        ],
        monthlyEntries: _twelveMonths(now.year),
        cashflowError: Exception('cashflow down'),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [reportRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(ErrorRetry), findsOneWidget);
      expect(find.byType(PieChart), findsOneWidget);
      expect(find.byType(BarChart), findsOneWidget);
    },
  );

  testWidgets(
    'an error in the category section shows its own ErrorRetry without '
    'blanking the cashflow card or the monthly bar chart',
    (tester) async {
      final repository = _FakeReportRepository(
        monthlyEntries: _twelveMonths(now.year),
        categoryError: Exception('category down'),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [reportRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(ErrorRetry), findsOneWidget);
      expect(find.byKey(const Key('cashflow-card')), findsOneWidget);
      expect(find.byType(BarChart), findsOneWidget);
    },
  );

  testWidgets(
    'an error in the monthly section shows its own ErrorRetry without '
    'blanking the cashflow card or the pie chart',
    (tester) async {
      final repository = _FakeReportRepository(
        categoryEntries: [
          CategoryReportEntry(
            category: _category(id: 'c1', name: 'Super'),
            total: 100,
          ),
        ],
        monthlyError: Exception('monthly down'),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [reportRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(ErrorRetry), findsOneWidget);
      expect(find.byKey(const Key('cashflow-card')), findsOneWidget);
      expect(find.byType(PieChart), findsOneWidget);
    },
  );

  testWidgets('cashflow card colors Neto by sign', (tester) async {
    final repository = _FakeReportRepository(
      monthlyEntries: _twelveMonths(now.year),
      cashflow: CashflowReport(
        month: now.month,
        year: now.year,
        income: 100,
        expense: 500,
        net: -400,
      ),
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [reportRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    final netText =
        tester.widget<Text>(find.byKey(const Key('cashflow-net-value')));
    expect(netText.style?.color, AppColors.expense);
  });

  testWidgets(
    'bottom nav has Reportes selected and navigates to the other '
    'destinations',
    (tester) async {
      final repository = _FakeReportRepository(
        monthlyEntries: _twelveMonths(now.year),
      );
      final overrides = [
        reportRepositoryProvider.overrideWithValue(repository),
      ];

      await tester.pumpWidget(_wrap(overrides: overrides));
      await tester.pumpAndSettle();
      final navBar = tester.widget<NavigationBar>(find.byType(NavigationBar));
      expect(navBar.selectedIndex, 4);

      await tester.tap(find.text('Resumen'));
      await tester.pumpAndSettle();
      expect(find.text('resumen-marker'), findsOneWidget);

      await tester.pumpWidget(_wrap(overrides: overrides));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Cuentas'));
      await tester.pumpAndSettle();
      expect(find.text('accounts-marker'), findsOneWidget);

      await tester.pumpWidget(_wrap(overrides: overrides));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Presupuestos'));
      await tester.pumpAndSettle();
      expect(find.text('budgets-marker'), findsOneWidget);

      await tester.pumpWidget(_wrap(overrides: overrides));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Recurrentes'));
      await tester.pumpAndSettle();
      expect(find.text('recurring-marker'), findsOneWidget);
    },
  );
}
