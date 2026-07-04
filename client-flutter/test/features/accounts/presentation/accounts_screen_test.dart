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
  }) : super(Dio());

  final List<Account> accountsResult;
  final Object? accountsError;
  final Map<String, num> balances;
  final Map<String, Object> balanceErrors;
  var getAllCallCount = 0;

  @override
  Future<List<Account>> getAll({
    bool includeArchived = false,
    int? page,
    int? limit,
  }) async {
    getAllCallCount++;
    final error = accountsError;
    if (error != null) throw error;
    return accountsResult;
  }

  @override
  Future<AccountBalance> getBalance(String accountId) async {
    final error = balanceErrors[accountId];
    if (error != null) throw error;
    return AccountBalance(account: accountId, balance: balances[accountId] ?? 0);
  }
}

Account _account({required String id, required String name, AccountType type = AccountType.banco}) =>
    Account(id: id, name: name, type: type, currency: 'ARS', archived: false);

Widget _wrap({required List<Override> overrides}) {
  final router = GoRouter(
    initialLocation: '/accounts',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const Scaffold(body: Text('resumen-marker')),
      ),
      GoRoute(
        path: '/accounts',
        builder: (context, state) => const AccountsScreen(),
      ),
      GoRoute(
        path: '/accounts/transfer',
        builder: (context, state) =>
            const Scaffold(body: Text('accounts-transfer-marker')),
      ),
      GoRoute(
        path: '/budgets',
        builder: (context, state) => const Scaffold(body: Text('budgets-marker')),
      ),
      GoRoute(
        path: '/recurring',
        builder: (context, state) =>
            const Scaffold(body: Text('recurring-marker')),
      ),
      GoRoute(
        path: '/reports',
        builder: (context, state) => const Scaffold(body: Text('reports-marker')),
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
      accountsResult: [_account(id: 'a1', name: 'Tarjeta Visa', type: AccountType.tarjeta)],
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
}
