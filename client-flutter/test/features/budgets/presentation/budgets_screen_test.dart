import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/features/budgets/data/index.dart';
import 'package:client_flutter/features/budgets/presentation/index.dart';
import 'package:client_flutter/shared/models/index.dart';
import 'package:client_flutter/shared/widgets/index.dart';

class _FakeBudgetRepository extends BudgetRepository {
  _FakeBudgetRepository({this.statuses = const [], this.error}) : super(Dio());

  final List<BudgetStatus> statuses;
  final Object? error;
  var getStatusCallCount = 0;
  int? lastMonth;
  int? lastYear;

  @override
  Future<List<BudgetStatus>> getStatus({
    required int month,
    required int year,
  }) async {
    getStatusCallCount++;
    lastMonth = month;
    lastYear = year;
    final error = this.error;
    if (error != null) throw error;
    return statuses;
  }
}

Category _category({required String id, required String name}) => Category(
      id: id,
      description: 'desc',
      name: name,
      tag: 'food',
      type: CategoryType.variable,
    );

BudgetStatus _status({
  required Category category,
  required double limit,
  required double spent,
  required double percent,
}) =>
    BudgetStatus(
      category: category,
      limit: limit,
      spent: spent,
      remaining: limit - spent,
      percent: percent,
    );

Widget _wrap({required List<Override> overrides}) {
  final router = GoRouter(
    initialLocation: '/budgets',
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
        builder: (context, state) => const BudgetsScreen(),
      ),
      GoRoute(
        path: '/budgets/add',
        builder: (context, state) {
          final extra = state.extra;
          return Scaffold(
            body: Text(
              extra == null
                  ? 'budget-form-create-marker'
                  : 'budget-form-edit-marker',
            ),
          );
        },
      ),
      GoRoute(
        path: '/recurring',
        builder: (context, state) =>
            const Scaffold(body: Text('recurring-marker')),
      ),
      GoRoute(
        path: '/reports',
        builder: (context, state) =>
            const Scaffold(body: Text('reports-marker')),
      ),
    ],
  );
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp.router(theme: AppTheme.dark, routerConfig: router),
  );
}

void main() {
  testWidgets(
    'renders one row per budget with the right meter color and percent for '
    'under/near/over-budget categories',
    (tester) async {
      final repository = _FakeBudgetRepository(
        statuses: [
          _status(
            category: _category(id: 'c1', name: 'Super'),
            limit: 500,
            spent: 200,
            percent: 40,
          ),
          _status(
            category: _category(id: 'c2', name: 'Ocio'),
            limit: 300,
            spent: 250,
            percent: 83.3,
          ),
          _status(
            category: _category(id: 'c3', name: 'Delivery'),
            limit: 100,
            spent: 140,
            percent: 140,
          ),
        ],
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [budgetRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('budget-card-c1')), findsOneWidget);
      expect(find.byKey(const Key('budget-card-c2')), findsOneWidget);
      expect(find.byKey(const Key('budget-card-c3')), findsOneWidget);
      expect(find.text('Super'), findsOneWidget);
      expect(find.text('Ocio'), findsOneWidget);
      expect(find.text('Delivery'), findsOneWidget);

      final under =
          tester.widget<Text>(find.byKey(const Key('budget-percent-c1')));
      expect(under.style?.color, AppColors.income);

      final near =
          tester.widget<Text>(find.byKey(const Key('budget-percent-c2')));
      expect(near.style?.color, AppColors.warning);

      final over =
          tester.widget<Text>(find.byKey(const Key('budget-percent-c3')));
      expect(over.style?.color, AppColors.expense);
    },
  );

  testWidgets('tapping the "+" button navigates to /budgets/add with no extra',
      (tester) async {
    final repository = _FakeBudgetRepository(statuses: const []);

    await tester.pumpWidget(
      _wrap(
        overrides: [budgetRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('budgets-add-button')));
    await tester.pumpAndSettle();

    expect(find.text('budget-form-create-marker'), findsOneWidget);
  });

  testWidgets(
    'tapping a budget row navigates to /budgets/add with that BudgetStatus as extra',
    (tester) async {
      final repository = _FakeBudgetRepository(
        statuses: [
          _status(
            category: _category(id: 'c1', name: 'Super'),
            limit: 500,
            spent: 200,
            percent: 40,
          ),
        ],
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [budgetRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('budget-card-c1')));
      await tester.pumpAndSettle();

      expect(find.text('budget-form-edit-marker'), findsOneWidget);
    },
  );

  testWidgets('shows the empty state when there are no budgets', (
    tester,
  ) async {
    final repository = _FakeBudgetRepository(statuses: const []);

    await tester.pumpWidget(
      _wrap(
        overrides: [budgetRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(EmptyState), findsOneWidget);
  });

  testWidgets(
    'shows the error-retry state when the fetch fails and refetches on retry',
    (tester) async {
      final repository = _FakeBudgetRepository(
        error: Exception('network down'),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [budgetRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(ErrorRetry), findsOneWidget);
      expect(repository.getStatusCallCount, 1);

      await tester.tap(find.byKey(const Key('error-retry-button')));
      await tester.pumpAndSettle();

      expect(repository.getStatusCallCount, 2);
    },
  );

  testWidgets(
    'bottom nav has Presupuestos selected and navigates to the other destinations',
    (tester) async {
      final repository = _FakeBudgetRepository(statuses: const []);
      final overrides = [
        budgetRepositoryProvider.overrideWithValue(repository),
      ];

      await tester.pumpWidget(_wrap(overrides: overrides));
      await tester.pumpAndSettle();
      final navBar = tester.widget<NavigationBar>(find.byType(NavigationBar));
      expect(navBar.selectedIndex, 2);

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
      await tester.tap(find.text('Recurrentes'));
      await tester.pumpAndSettle();
      expect(find.text('recurring-marker'), findsOneWidget);

      await tester.pumpWidget(_wrap(overrides: overrides));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Reportes'));
      await tester.pumpAndSettle();
      expect(find.text('reports-marker'), findsOneWidget);
    },
  );

  testWidgets(
    'tapping the month picker next arrow refetches for the next month',
    (tester) async {
      final repository = _FakeBudgetRepository(statuses: const []);

      await tester.pumpWidget(
        _wrap(
          overrides: [budgetRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      final now = DateTime.now();
      expect(repository.lastMonth, now.month);
      expect(repository.lastYear, now.year);

      await tester.tap(find.byKey(const Key('month-picker-next')));
      await tester.pumpAndSettle();

      final expectedNext = now.month == 12
          ? (month: 1, year: now.year + 1)
          : (month: now.month + 1, year: now.year);
      expect(repository.lastMonth, expectedNext.month);
      expect(repository.lastYear, expectedNext.year);
    },
  );
}
