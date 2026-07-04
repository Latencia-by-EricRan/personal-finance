import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/features/accounts/data/index.dart';
import 'package:client_flutter/features/categories/data/index.dart';
import 'package:client_flutter/features/movements/data/index.dart';
import 'package:client_flutter/features/movements/presentation/index.dart';
import 'package:client_flutter/shared/models/index.dart';
import 'package:client_flutter/shared/widgets/index.dart';

class _FakeMovementRepository extends MovementRepository {
  _FakeMovementRepository({this.summaryResult, this.summaryError})
    : super(Dio());

  final MovementSummaryResponse? summaryResult;
  final Object? summaryError;
  var summaryCallCount = 0;

  @override
  Future<MovementSummaryResponse> getSummaryByMonth({
    required int month,
    required int year,
  }) async {
    summaryCallCount++;
    final error = summaryError;
    if (error != null) throw error;
    return summaryResult!;
  }

  @override
  Future<List<Movement>> getByRange({
    required DateTime start,
    required DateTime end,
    MovementType? type,
    String? category,
    String? account,
    int? page,
    int? limit,
  }) async => const [];
}

MovementSummaryResponse _summary({
  required List<Movement> movements,
  double income = 185000,
  double expense = 35000,
}) => MovementSummaryResponse(
  month: 7,
  year: 2026,
  summary: MovementSummary(
    items: movements.length,
    amount: MovementAmountSummary(income: income, expense: expense),
  ),
  movements: movements,
);

Movement _movement(String id) => Movement(
  id: id,
  amount: 1000,
  date: DateTime(2026, 7, 1),
  type: MovementType.ingreso,
  account: 'acc-1',
  description: 'Movimiento $id',
);

Widget _wrap({required List<Override> overrides}) {
  final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (context, state) => const DashboardScreen()),
      GoRoute(
        path: '/movements/add',
        builder: (context, state) =>
            const Scaffold(body: Text('add-movement-marker')),
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
  testWidgets('renders the balance card with the unfiltered whole-month summary', (
    tester,
  ) async {
    final repository = _FakeMovementRepository(
      summaryResult: _summary(movements: [_movement('mv-1')]),
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [
          movementRepositoryProvider.overrideWithValue(repository),
          categoriesProvider.overrideWith((ref) async => const []),
          accountsProvider.overrideWith((ref) async => const []),
        ],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(BalanceCard), findsOneWidget);
    expect(find.textContaining('150.000,00'), findsOneWidget);
    expect(find.textContaining('185.000,00'), findsOneWidget);
    expect(find.textContaining('35.000,00'), findsOneWidget);
  });

  testWidgets('renders one MovementTile per movement', (tester) async {
    final repository = _FakeMovementRepository(
      summaryResult: _summary(
        movements: [_movement('mv-1'), _movement('mv-2'), _movement('mv-3')],
      ),
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [
          movementRepositoryProvider.overrideWithValue(repository),
          categoriesProvider.overrideWith((ref) async => const []),
          accountsProvider.overrideWith((ref) async => const []),
        ],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(MovementTile), findsNWidgets(3));
  });

  testWidgets('tapping the FAB navigates toward /movements/add', (
    tester,
  ) async {
    final repository = _FakeMovementRepository(
      summaryResult: _summary(movements: [_movement('mv-1')]),
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [
          movementRepositoryProvider.overrideWithValue(repository),
          categoriesProvider.overrideWith((ref) async => const []),
          accountsProvider.overrideWith((ref) async => const []),
        ],
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('dashboard-fab')));
    await tester.pumpAndSettle();

    expect(find.text('add-movement-marker'), findsOneWidget);
  });

  testWidgets('shows the empty state when the movement list is empty', (
    tester,
  ) async {
    final repository = _FakeMovementRepository(
      summaryResult: _summary(movements: const []),
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [
          movementRepositoryProvider.overrideWithValue(repository),
          categoriesProvider.overrideWith((ref) async => const []),
          accountsProvider.overrideWith((ref) async => const []),
        ],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(EmptyState), findsOneWidget);
  });

  testWidgets(
    'shows the error-retry state on a failed summary fetch and refetches on retry',
    (tester) async {
      final repository = _FakeMovementRepository(
        summaryError: Exception('network down'),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            movementRepositoryProvider.overrideWithValue(repository),
            categoriesProvider.overrideWith((ref) async => const []),
            accountsProvider.overrideWith((ref) async => const []),
          ],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(ErrorRetry), findsOneWidget);
      expect(repository.summaryCallCount, 1);

      await tester.tap(find.byKey(const Key('error-retry-button')));
      await tester.pumpAndSettle();

      expect(repository.summaryCallCount, 2);
    },
  );

  testWidgets('renders the personal greeting', (tester) async {
    final repository = _FakeMovementRepository(
      summaryResult: _summary(movements: [_movement('mv-1')]),
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [
          movementRepositoryProvider.overrideWithValue(repository),
          categoriesProvider.overrideWith((ref) async => const []),
          accountsProvider.overrideWith((ref) async => const []),
        ],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Hola, Eric'), findsOneWidget);
  });

  testWidgets('bottom nav starts on Resumen and navigates to the other destinations', (
    tester,
  ) async {
    final repository = _FakeMovementRepository(
      summaryResult: _summary(movements: [_movement('mv-1')]),
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [
          movementRepositoryProvider.overrideWithValue(repository),
          categoriesProvider.overrideWith((ref) async => const []),
          accountsProvider.overrideWith((ref) async => const []),
        ],
      ),
    );
    await tester.pumpAndSettle();

    final navBar = tester.widget<NavigationBar>(find.byType(NavigationBar));
    expect(navBar.selectedIndex, 0);

    await tester.tap(find.text('Cuentas'));
    await tester.pumpAndSettle();
    expect(find.text('accounts-marker'), findsOneWidget);
  });
}
