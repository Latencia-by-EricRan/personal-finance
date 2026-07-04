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
import 'package:client_flutter/features/accounts/presentation/index.dart';
import 'package:client_flutter/shared/models/index.dart';
import 'package:client_flutter/shared/widgets/index.dart';

class _FakeAccountRepository extends AccountRepository {
  _FakeAccountRepository({
    this.accountsResult = const [],
    this.accountsError,
    this.balances = const {},
    this.balanceErrors = const {},
    List<Account> archivedResult = const [],
    this.updateError,
    this.gate,
  })  : _archived = List.of(archivedResult),
        super(Dio());

  final List<Account> accountsResult;
  final Object? accountsError;
  final Map<String, num> balances;
  final Map<String, Object> balanceErrors;
  final Object? updateError;
  final Completer<void>? gate;
  final List<Account> _archived;
  var getAllCallCount = 0;
  var updateCallCount = 0;
  String? lastUpdateId;
  bool? lastUpdateArchived;

  @override
  Future<List<Account>> getAll({
    bool includeArchived = false,
    int? page,
    int? limit,
  }) async {
    getAllCallCount++;
    final error = accountsError;
    if (error != null) throw error;
    if (includeArchived) return [...accountsResult, ..._archived];
    return accountsResult;
  }

  @override
  Future<AccountBalance> getBalance(String accountId) async {
    final error = balanceErrors[accountId];
    if (error != null) throw error;
    return AccountBalance(
        account: accountId, balance: balances[accountId] ?? 0);
  }

  @override
  Future<Account> update(
    String id, {
    String? name,
    AccountType? type,
    String? currency,
    String? icon,
    bool? archived,
  }) async {
    updateCallCount++;
    lastUpdateId = id;
    lastUpdateArchived = archived;
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = updateError;
    if (error != null) throw error;
    if (archived == false) {
      _archived.removeWhere((account) => account.id == id);
    }
    return Account(
      id: id,
      name: name ?? 'irrelevant',
      type: type ?? AccountType.banco,
      currency: currency ?? 'ARS',
      icon: icon,
      archived: archived ?? false,
    );
  }
}

Account _account(
        {required String id,
        required String name,
        AccountType type = AccountType.banco}) =>
    Account(id: id, name: name, type: type, currency: 'ARS', archived: false);

Widget _wrap({required List<Override> overrides}) {
  final router = GoRouter(
    initialLocation: '/accounts',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) =>
            const Scaffold(body: Text('resumen-marker')),
      ),
      GoRoute(
        path: '/accounts',
        builder: (context, state) => const AccountsScreen(),
      ),
      GoRoute(
        path: '/accounts/add',
        builder: (context, state) {
          final extra = state.extra;
          return Scaffold(
            body: Text(
              extra == null
                  ? 'account-form-create-marker'
                  : 'account-form-edit-marker:${(extra as Account).id}',
            ),
          );
        },
      ),
      GoRoute(
        path: '/accounts/transfer',
        builder: (context, state) =>
            const Scaffold(body: Text('accounts-transfer-marker')),
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
  testWidgets('renders the patrimonio total as the sum of loaded balances', (
    tester,
  ) async {
    final repository = _FakeAccountRepository(
      accountsResult: [
        _account(id: 'a1', name: 'Cuenta Sueldo'),
        _account(id: 'a2', name: 'Tarjeta Visa', type: AccountType.tarjeta),
      ],
      balances: {'a1': 1000, 'a2': -200},
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.textContaining('800,00'), findsOneWidget);
  });

  testWidgets('renders one account card per account with name and balance', (
    tester,
  ) async {
    final repository = _FakeAccountRepository(
      accountsResult: [
        _account(id: 'a1', name: 'Cuenta Sueldo'),
        _account(id: 'a2', name: 'Tarjeta Visa', type: AccountType.tarjeta),
      ],
      balances: {'a1': 1000, 'a2': -200},
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('account-card-a1')), findsOneWidget);
    expect(find.byKey(const Key('account-card-a2')), findsOneWidget);
    expect(find.text('Cuenta Sueldo'), findsOneWidget);
    expect(find.text('Tarjeta Visa'), findsOneWidget);
    expect(find.textContaining('1.000,00'), findsOneWidget);
    expect(find.textContaining('200,00'), findsOneWidget);
    expect(find.text('Cuenta bancaria'), findsOneWidget);
    expect(find.text('Tarjeta de crédito'), findsOneWidget);
  });

  testWidgets('renders the efectivo account type label', (tester) async {
    final repository = _FakeAccountRepository(
      accountsResult: [
        _account(id: 'a1', name: 'Billetera', type: AccountType.efectivo),
      ],
      balances: {'a1': 100},
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Efectivo'), findsOneWidget);
  });

  testWidgets('renders a negative balance in the expense color', (
    tester,
  ) async {
    final repository = _FakeAccountRepository(
      accountsResult: [
        _account(id: 'a1', name: 'Tarjeta Visa', type: AccountType.tarjeta)
      ],
      balances: {'a1': -200},
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    final balanceText = tester.widget<Text>(
      find.byKey(const Key('account-balance-a1')),
    );
    expect(balanceText.style?.color, AppColors.expense);
  });

  testWidgets(
    'renders a positive balance in a neutral color, never the income green',
    (tester) async {
      final repository = _FakeAccountRepository(
        accountsResult: [_account(id: 'a1', name: 'Cuenta Sueldo')],
        balances: {'a1': 1000},
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [accountRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      final balanceText = tester.widget<Text>(
        find.byKey(const Key('account-balance-a1')),
      );
      expect(balanceText.style?.color, AppColors.textPrimary);
      expect(balanceText.style?.color, isNot(AppColors.income));
    },
  );

  testWidgets('shows the empty state when there are no accounts', (
    tester,
  ) async {
    final repository = _FakeAccountRepository(accountsResult: const []);

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(EmptyState), findsOneWidget);
  });

  testWidgets(
    'shows the error-retry state when the accounts fetch fails and refetches on retry',
    (tester) async {
      final repository = _FakeAccountRepository(
        accountsError: Exception('network down'),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [accountRepositoryProvider.overrideWithValue(repository)],
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
    'falls back to a zero balance for a single account whose balance fetch fails, without failing the whole screen',
    (tester) async {
      final repository = _FakeAccountRepository(
        accountsResult: [
          _account(id: 'a1', name: 'Cuenta Sueldo'),
          _account(id: 'a2', name: 'Tarjeta Visa', type: AccountType.tarjeta),
        ],
        balances: {'a1': 500},
        balanceErrors: {
          'a2': const ApiException(message: 'boom', statusCode: 500),
        },
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [accountRepositoryProvider.overrideWithValue(repository)],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(ErrorRetry), findsNothing);
      expect(find.byKey(const Key('account-card-a2')), findsOneWidget);
      final fallbackBalance = tester.widget<Text>(
        find.byKey(const Key('account-balance-a2')),
      );
      expect(fallbackBalance.data, contains('0,00'));
    },
  );

  testWidgets('tapping the FAB navigates toward /accounts/transfer', (
    tester,
  ) async {
    final repository = _FakeAccountRepository(accountsResult: const []);

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('accounts-transfer-fab')));
    await tester.pumpAndSettle();

    expect(find.text('accounts-transfer-marker'), findsOneWidget);
  });

  testWidgets(
    'bottom nav has Cuentas selected and navigates to the other destinations',
    (tester) async {
      final repository = _FakeAccountRepository(accountsResult: const []);
      final overrides = [
        accountRepositoryProvider.overrideWithValue(repository),
      ];

      await tester.pumpWidget(_wrap(overrides: overrides));
      await tester.pumpAndSettle();
      final navBar = tester.widget<NavigationBar>(find.byType(NavigationBar));
      expect(navBar.selectedIndex, 1);

      await tester.tap(find.text('Resumen'));
      await tester.pumpAndSettle();
      expect(find.text('resumen-marker'), findsOneWidget);

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

      await tester.pumpWidget(_wrap(overrides: overrides));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Reportes'));
      await tester.pumpAndSettle();
      expect(find.text('reports-marker'), findsOneWidget);
    },
  );

  testWidgets('tapping the "+" button navigates to /accounts/add with no extra',
      (
    tester,
  ) async {
    final repository = _FakeAccountRepository(accountsResult: const []);

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('accounts-add-button')));
    await tester.pumpAndSettle();

    expect(find.text('account-form-create-marker'), findsOneWidget);
  });

  testWidgets(
    'tapping an account card navigates to /accounts/add with that account as extra',
    (tester) async {
      final repository = _FakeAccountRepository(
        accountsResult: [_account(id: 'a1', name: 'Cuenta Sueldo')],
        balances: {'a1': 1000},
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('account-card-a1')));
      await tester.pumpAndSettle();

      expect(find.text('account-form-edit-marker:a1'), findsOneWidget);
    },
  );

  testWidgets(
    'tapping "Ver archivadas" loads and shows archived accounts in a de-emphasized list',
    (tester) async {
      final repository = _FakeAccountRepository(
        accountsResult: [_account(id: 'a1', name: 'Cuenta Sueldo')],
        balances: {'a1': 1000},
        archivedResult: [
          const Account(
            id: 'a2',
            name: 'Cuenta vieja',
            type: AccountType.banco,
            currency: 'ARS',
            archived: true,
          ),
        ],
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Cuenta vieja'), findsNothing);

      await tester.tap(find.byKey(const Key('accounts-show-archived-toggle')));
      await tester.pumpAndSettle();

      expect(find.text('Cuenta vieja'), findsOneWidget);
      expect(find.byKey(const Key('archived-restore-a2')), findsOneWidget);
    },
  );

  testWidgets(
    'tapping "Restaurar" on an archived account calls update with archived:false and refreshes the list',
    (tester) async {
      final repository = _FakeAccountRepository(
        accountsResult: [_account(id: 'a1', name: 'Cuenta Sueldo')],
        balances: {'a1': 1000},
        archivedResult: [
          const Account(
            id: 'a2',
            name: 'Cuenta vieja',
            type: AccountType.banco,
            currency: 'ARS',
            archived: true,
          ),
        ],
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('accounts-show-archived-toggle')));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('archived-restore-a2')));
      await tester.pumpAndSettle();

      expect(repository.updateCallCount, 1);
      expect(repository.lastUpdateId, 'a2');
      expect(repository.lastUpdateArchived, isFalse);
      expect(find.text('Cuenta vieja'), findsNothing);
    },
  );

  testWidgets(
    'a rapid double restore-tap only triggers a single restore call',
    (tester) async {
      final gate = Completer<void>();
      final repository = _FakeAccountRepository(
        accountsResult: [_account(id: 'a1', name: 'Cuenta Sueldo')],
        balances: {'a1': 1000},
        archivedResult: [
          const Account(
            id: 'a2',
            name: 'Cuenta vieja',
            type: AccountType.banco,
            currency: 'ARS',
            archived: true,
          ),
        ],
        gate: gate,
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('accounts-show-archived-toggle')));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('archived-restore-a2')));
      await tester.pump();

      final button = tester.widget<TextButton>(
        find.byKey(const Key('archived-restore-a2')),
      );
      expect(button.onPressed, isNull);

      await tester.tap(
        find.byKey(const Key('archived-restore-a2')),
        warnIfMissed: false,
      );
      await tester.pump();

      gate.complete();
      await tester.pumpAndSettle();

      expect(repository.updateCallCount, 1);
    },
  );

  testWidgets(
    'restore failure shows the error message and keeps the account listed as archived',
    (tester) async {
      final repository = _FakeAccountRepository(
        accountsResult: [_account(id: 'a1', name: 'Cuenta Sueldo')],
        balances: {'a1': 1000},
        archivedResult: [
          const Account(
            id: 'a2',
            name: 'Cuenta vieja',
            type: AccountType.banco,
            currency: 'ARS',
            archived: true,
          ),
        ],
        updateError: const ApiException(message: 'No se pudo restaurar'),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('accounts-show-archived-toggle')));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('archived-restore-a2')));
      await tester.pumpAndSettle();

      expect(find.text('No se pudo restaurar'), findsOneWidget);
      expect(find.text('Cuenta vieja'), findsOneWidget);
    },
  );
}
