import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/features/accounts/data/index.dart';
import 'package:client_flutter/features/categories/data/index.dart';
import 'package:client_flutter/features/recurring/data/index.dart';
import 'package:client_flutter/features/recurring/presentation/index.dart';
import 'package:client_flutter/shared/models/index.dart';
import 'package:client_flutter/shared/widgets/index.dart';

class _FakeRecurringRepository extends RecurringRepository {
  _FakeRecurringRepository({
    List<Recurring> recurrings = const [],
    this.getAllError,
    this.setActiveError,
    this.runResult = const [],
    this.runError,
    this.setActiveGate,
  })  : _recurrings = List.of(recurrings),
        super(Dio());

  final List<Recurring> _recurrings;
  final Object? getAllError;
  final Object? setActiveError;
  final List<Movement> runResult;
  final Object? runError;
  final Completer<void>? setActiveGate;

  var getAllCallCount = 0;
  var setActiveCallCount = 0;
  var runCallCount = 0;
  String? lastSetActiveId;
  bool? lastSetActiveValue;

  @override
  Future<List<Recurring>> getAll({int? page, int? limit}) async {
    getAllCallCount++;
    final error = getAllError;
    if (error != null) throw error;
    return List.of(_recurrings);
  }

  @override
  Future<Recurring> setActive(String id, {required bool active}) async {
    setActiveCallCount++;
    lastSetActiveId = id;
    lastSetActiveValue = active;
    final gate = setActiveGate;
    if (gate != null) await gate.future;
    final error = setActiveError;
    if (error != null) throw error;
    final index = _recurrings.indexWhere((r) => r.id == id);
    final updated = _recurrings[index].copyWith(active: active);
    _recurrings[index] = updated;
    return updated;
  }

  @override
  Future<List<Movement>> run() async {
    runCallCount++;
    final error = runError;
    if (error != null) throw error;
    return runResult;
  }
}

Recurring _recurring({
  required String id,
  MovementType type = MovementType.egreso,
  double amount = 1500,
  required String category,
  required String account,
  int dayOfMonth = 5,
  bool active = true,
}) =>
    Recurring(
      id: id,
      type: type,
      amount: amount,
      category: category,
      account: account,
      frequency: RecurringFrequency.mensual,
      dayOfMonth: dayOfMonth,
      active: active,
    );

Category _category({required String id, required String name}) => Category(
      id: id,
      description: 'desc',
      name: name,
      tag: 'tag',
      type: CategoryType.variable,
    );

Account _account({required String id, required String name}) => Account(
      id: id,
      name: name,
      type: AccountType.banco,
      currency: 'ARS',
      archived: false,
    );

Widget _wrap({required List<Override> overrides}) {
  final router = GoRouter(
    initialLocation: '/recurring',
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
        builder: (context, state) => const RecurringsScreen(),
      ),
      GoRoute(
        path: '/recurring/add',
        builder: (context, state) {
          final extra = state.extra;
          return Scaffold(
            body: Text(
              extra == null
                  ? 'recurring-form-create-marker'
                  : 'recurring-form-edit-marker:${(extra as Recurring).id}',
            ),
          );
        },
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
    'renders one row per recurring template with resolved category/account '
    'names and the right amount color',
    (tester) async {
      final repository = _FakeRecurringRepository(
        recurrings: [
          _recurring(
            id: 'rec-1',
            category: 'cat-1',
            account: 'acc-1',
          ),
          _recurring(
            id: 'rec-2',
            type: MovementType.ingreso,
            amount: 3000,
            category: 'cat-2',
            account: 'acc-1',
          ),
        ],
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            recurringRepositoryProvider.overrideWithValue(repository),
            categoriesProvider.overrideWith((ref) async => [
                  _category(id: 'cat-1', name: 'Alquiler'),
                  _category(id: 'cat-2', name: 'Sueldo'),
                ]),
            accountsProvider.overrideWith(
              (ref) async => [_account(id: 'acc-1', name: 'Cuenta sueldo')],
            ),
          ],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('recurring-card-rec-1')), findsOneWidget);
      expect(find.byKey(const Key('recurring-card-rec-2')), findsOneWidget);
      expect(find.text('Alquiler'), findsOneWidget);
      expect(find.text('Sueldo'), findsOneWidget);
      expect(find.text('Cuenta sueldo · Día 5'), findsNWidgets(2));

      final expenseAmount = tester.widget<Text>(
        find.byKey(const Key('recurring-amount-rec-1')),
      );
      expect(expenseAmount.style?.color, AppColors.expense);

      final incomeAmount = tester.widget<Text>(
        find.byKey(const Key('recurring-amount-rec-2')),
      );
      expect(incomeAmount.style?.color, AppColors.income);
    },
  );

  testWidgets(
    'toggling the switch calls setActive with the flipped value and the '
    'row reflects the backend response after refetch',
    (tester) async {
      final repository = _FakeRecurringRepository(
        recurrings: [
          _recurring(
            id: 'rec-1',
            category: 'cat-1',
            account: 'acc-1',
            active: true,
          ),
        ],
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            recurringRepositoryProvider.overrideWithValue(repository),
            categoriesProvider.overrideWith(
              (ref) async => [_category(id: 'cat-1', name: 'Alquiler')],
            ),
            accountsProvider.overrideWith(
              (ref) async => [_account(id: 'acc-1', name: 'Cuenta sueldo')],
            ),
          ],
        ),
      );
      await tester.pumpAndSettle();

      final switchFinder = find.byKey(
        const Key('recurring-active-switch-rec-1'),
      );
      expect(tester.widget<Switch>(switchFinder).value, isTrue);

      await tester.tap(switchFinder);
      await tester.pumpAndSettle();

      expect(repository.setActiveCallCount, 1);
      expect(repository.lastSetActiveId, 'rec-1');
      expect(repository.lastSetActiveValue, isFalse);
      expect(tester.widget<Switch>(switchFinder).value, isFalse);
    },
  );

  testWidgets(
    'a failed toggle shows the error message and leaves the switch matching '
    "the backend's actual (unchanged) state",
    (tester) async {
      final repository = _FakeRecurringRepository(
        recurrings: [
          _recurring(
            id: 'rec-1',
            category: 'cat-1',
            account: 'acc-1',
            active: true,
          ),
        ],
        setActiveError: const ApiException(message: 'No se pudo actualizar'),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            recurringRepositoryProvider.overrideWithValue(repository),
            categoriesProvider.overrideWith((ref) async => const []),
            accountsProvider.overrideWith((ref) async => const []),
          ],
        ),
      );
      await tester.pumpAndSettle();

      final switchFinder = find.byKey(
        const Key('recurring-active-switch-rec-1'),
      );

      await tester.tap(switchFinder);
      await tester.pumpAndSettle();

      expect(find.text('No se pudo actualizar'), findsOneWidget);
      expect(tester.widget<Switch>(switchFinder).value, isTrue);
    },
  );

  testWidgets(
    'a rapid double-tap on the same switch only fires one setActive call',
    (tester) async {
      final gate = Completer<void>();
      final repository = _FakeRecurringRepository(
        recurrings: [
          _recurring(id: 'rec-1', category: 'cat-1', account: 'acc-1'),
        ],
        setActiveGate: gate,
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            recurringRepositoryProvider.overrideWithValue(repository),
            categoriesProvider.overrideWith((ref) async => const []),
            accountsProvider.overrideWith((ref) async => const []),
          ],
        ),
      );
      await tester.pumpAndSettle();

      final switchFinder = find.byKey(
        const Key('recurring-active-switch-rec-1'),
      );

      await tester.tap(switchFinder);
      await tester.pump();

      final switchWidget = tester.widget<Switch>(switchFinder);
      expect(switchWidget.onChanged, isNull);

      await tester.tap(switchFinder, warnIfMissed: false);
      await tester.pump();

      gate.complete();
      await tester.pumpAndSettle();

      expect(repository.setActiveCallCount, 1);
    },
  );

  testWidgets('tapping "+" navigates to /recurring/add with no extra',
      (tester) async {
    final repository = _FakeRecurringRepository();

    await tester.pumpWidget(
      _wrap(
        overrides: [
          recurringRepositoryProvider.overrideWithValue(repository),
          categoriesProvider.overrideWith((ref) async => const []),
          accountsProvider.overrideWith((ref) async => const []),
        ],
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('recurring-add-button')));
    await tester.pumpAndSettle();

    expect(find.text('recurring-form-create-marker'), findsOneWidget);
  });

  testWidgets(
    'tapping a row navigates to /recurring/add with that Recurring as extra',
    (tester) async {
      final repository = _FakeRecurringRepository(
        recurrings: [
          _recurring(id: 'rec-1', category: 'cat-1', account: 'acc-1'),
        ],
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            recurringRepositoryProvider.overrideWithValue(repository),
            categoriesProvider.overrideWith((ref) async => const []),
            accountsProvider.overrideWith((ref) async => const []),
          ],
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('recurring-card-rec-1')));
      await tester.pumpAndSettle();

      expect(find.text('recurring-form-edit-marker:rec-1'), findsOneWidget);
    },
  );

  testWidgets(
    'tapping "Ejecutar [mes]" calls run and shows the generated count',
    (tester) async {
      final repository = _FakeRecurringRepository(
        runResult: [
          Movement(
            id: 'mv-1',
            amount: 1500,
            date: DateTime(2026, 7, 5),
            type: MovementType.egreso,
            account: 'acc-1',
          ),
          Movement(
            id: 'mv-2',
            amount: 200,
            date: DateTime(2026, 7, 5),
            type: MovementType.egreso,
            account: 'acc-1',
          ),
        ],
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            recurringRepositoryProvider.overrideWithValue(repository),
            categoriesProvider.overrideWith((ref) async => const []),
            accountsProvider.overrideWith((ref) async => const []),
          ],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('Ejecutar'), findsOneWidget);

      await tester.tap(find.byKey(const Key('recurring-run-button')));
      await tester.pumpAndSettle();

      expect(repository.runCallCount, 1);
      expect(find.text('Se generaron 2 movimientos.'), findsOneWidget);
    },
  );

  testWidgets('a zero-length run shows the "no pending movements" message',
      (tester) async {
    final repository = _FakeRecurringRepository(runResult: const []);

    await tester.pumpWidget(
      _wrap(
        overrides: [
          recurringRepositoryProvider.overrideWithValue(repository),
          categoriesProvider.overrideWith((ref) async => const []),
          accountsProvider.overrideWith((ref) async => const []),
        ],
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('recurring-run-button')));
    await tester.pumpAndSettle();

    expect(find.text('No había movimientos pendientes.'), findsOneWidget);
  });

  testWidgets('a failed run shows an error message without crashing',
      (tester) async {
    final repository = _FakeRecurringRepository(
      runError: const ApiException(message: 'No se pudo ejecutar'),
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [
          recurringRepositoryProvider.overrideWithValue(repository),
          categoriesProvider.overrideWith((ref) async => const []),
          accountsProvider.overrideWith((ref) async => const []),
        ],
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('recurring-run-button')));
    await tester.pumpAndSettle();

    expect(find.text('No se pudo ejecutar'), findsOneWidget);
  });

  testWidgets('shows the empty state when there are no recurring templates',
      (tester) async {
    final repository = _FakeRecurringRepository();

    await tester.pumpWidget(
      _wrap(
        overrides: [
          recurringRepositoryProvider.overrideWithValue(repository),
          categoriesProvider.overrideWith((ref) async => const []),
          accountsProvider.overrideWith((ref) async => const []),
        ],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(EmptyState), findsOneWidget);
  });

  testWidgets(
    'shows the error-retry state on fetch failure and refetches on retry',
    (tester) async {
      final repository = _FakeRecurringRepository(
        getAllError: Exception('network down'),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            recurringRepositoryProvider.overrideWithValue(repository),
            categoriesProvider.overrideWith((ref) async => const []),
            accountsProvider.overrideWith((ref) async => const []),
          ],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(ErrorRetry), findsOneWidget);
      expect(repository.getAllCallCount, 1);

      await tester.tap(find.byKey(const Key('error-retry-button')));
      await tester.pumpAndSettle();

      expect(repository.getAllCallCount, 2);
    },
  );

  testWidgets(
    'bottom nav has Recurrentes selected and navigates to the other '
    'destinations',
    (tester) async {
      final repository = _FakeRecurringRepository();
      final overrides = [
        recurringRepositoryProvider.overrideWithValue(repository),
        categoriesProvider.overrideWith((ref) async => const []),
        accountsProvider.overrideWith((ref) async => const []),
      ];

      await tester.pumpWidget(_wrap(overrides: overrides));
      await tester.pumpAndSettle();
      final navBar = tester.widget<NavigationBar>(find.byType(NavigationBar));
      expect(navBar.selectedIndex, 3);

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
      await tester.tap(find.text('Reportes'));
      await tester.pumpAndSettle();
      expect(find.text('reports-marker'), findsOneWidget);
    },
  );
}
