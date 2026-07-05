import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/auth/index.dart';
import 'package:client_flutter/core/router/index.dart';
import 'package:client_flutter/features/accounts/data/index.dart';
import 'package:client_flutter/features/accounts/presentation/index.dart';
import 'package:client_flutter/features/auth/index.dart';
import 'package:client_flutter/features/budgets/data/index.dart';
import 'package:client_flutter/features/budgets/presentation/index.dart';
import 'package:client_flutter/features/categories/index.dart';
import 'package:client_flutter/features/movements/index.dart';
import 'package:client_flutter/features/recurring/index.dart';
import 'package:client_flutter/shared/models/index.dart';

import '../../support/fake_token_store.dart';

/// Test-only provider that exposes an [AuthRefreshNotifier] built from a
/// real [Ref], so its reactivity can be asserted directly without reaching
/// into go_router's private internals.
final _authRefreshNotifierProvider = Provider<AuthRefreshNotifier>((ref) {
  final notifier = AuthRefreshNotifier(ref);
  ref.onDispose(notifier.dispose);
  return notifier;
});

/// Stands in for the real repository so rendering the real [DashboardScreen]
/// at `/` never reaches for the live `http://localhost:3000` backend.
class _FakeMovementRepository extends MovementRepository {
  _FakeMovementRepository() : super(Dio());

  @override
  Future<MovementSummaryResponse> getSummaryByMonth({
    required int month,
    required int year,
  }) async =>
      MovementSummaryResponse(
        month: month,
        year: year,
        summary: const MovementSummary(
          items: 0,
          amount: MovementAmountSummary(income: 0, expense: 0),
        ),
        movements: const [],
      );

  @override
  Future<List<Movement>> getByRange({
    required DateTime start,
    required DateTime end,
    MovementType? type,
    String? category,
    String? account,
    int? page,
    int? limit,
  }) async =>
      const [];
}

final _dashboardScreenOverrides = <Override>[
  movementRepositoryProvider.overrideWithValue(_FakeMovementRepository()),
  categoriesProvider.overrideWith((ref) async => const []),
  accountsProvider.overrideWith((ref) async => const []),
  accountsWithBalanceProvider.overrideWith((ref) async => const []),
  budgetStatusProvider.overrideWith((ref) async => const []),
  recurringsProvider.overrideWith((ref) async => const []),
];

void main() {
  group('authRedirect', () {
    test('sends an unauthenticated user to /login', () {
      expect(
        authRedirect(isLoggedIn: false, location: '/'),
        loginRoute,
      );
      expect(
        authRedirect(isLoggedIn: false, location: '/accounts'),
        loginRoute,
      );
    });

    test('leaves an unauthenticated user already on /login alone', () {
      expect(authRedirect(isLoggedIn: false, location: loginRoute), isNull);
    });

    test('sends an authenticated user away from /login', () {
      expect(authRedirect(isLoggedIn: true, location: loginRoute), '/');
    });

    test('leaves an authenticated user on any other route alone', () {
      expect(authRedirect(isLoggedIn: true, location: '/budgets'), isNull);
      expect(authRedirect(isLoggedIn: true, location: '/'), isNull);
    });
  });

  group('buildAppRouter wiring', () {
    testWidgets('redirects to /login when logged out', (tester) async {
      final router = buildAppRouter(isLoggedIn: () => false);
      await tester.pumpWidget(
        ProviderScope(child: MaterialApp.router(routerConfig: router)),
      );
      await tester.pumpAndSettle();

      expect(find.byType(LoginScreen), findsOneWidget);
    });

    testWidgets('redirects away from /login when logged in', (tester) async {
      final router = buildAppRouter(isLoggedIn: () => true);
      router.go(loginRoute);
      await tester.pumpWidget(
        ProviderScope(
          overrides: _dashboardScreenOverrides,
          child: MaterialApp.router(routerConfig: router),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(DashboardScreen), findsOneWidget);
    });

    testWidgets('renders the movement form on /movements/add', (tester) async {
      final router = buildAppRouter(isLoggedIn: () => true);
      await tester.pumpWidget(
        ProviderScope(
          overrides: _dashboardScreenOverrides,
          child: MaterialApp.router(routerConfig: router),
        ),
      );

      router.go('/movements/add');
      await tester.pumpAndSettle();

      expect(find.byType(MovementFormScreen), findsOneWidget);
      expect(find.text('Nuevo movimiento'), findsOneWidget);
    });

    testWidgets(
      'renders the movement form in edit mode when extra carries a Movement',
      (tester) async {
        final router = buildAppRouter(isLoggedIn: () => true);
        await tester.pumpWidget(
          ProviderScope(
            overrides: _dashboardScreenOverrides,
            child: MaterialApp.router(routerConfig: router),
          ),
        );

        final movement = Movement(
          id: 'mv-1',
          amount: 1000,
          date: DateTime(2026, 7, 1),
          type: MovementType.egreso,
          account: 'acc-1',
        );
        router.go('/movements/add', extra: movement);
        await tester.pumpAndSettle();

        expect(find.text('Editar movimiento'), findsOneWidget);
      },
    );

    testWidgets('exposes stub placeholders for every remaining Fase 0 route', (
      tester,
    ) async {
      final router = buildAppRouter(isLoggedIn: () => true);
      await tester.pumpWidget(
        ProviderScope(
          overrides: _dashboardScreenOverrides,
          child: MaterialApp.router(routerConfig: router),
        ),
      );

      for (final route in ['/recurring/add', '/reports']) {
        router.go(route);
        await tester.pumpAndSettle();
        expect(find.textContaining('TODO:'), findsOneWidget);
      }
    });

    testWidgets('renders the real recurrings screen on /recurring', (
      tester,
    ) async {
      final router = buildAppRouter(isLoggedIn: () => true);
      await tester.pumpWidget(
        ProviderScope(
          overrides: _dashboardScreenOverrides,
          child: MaterialApp.router(routerConfig: router),
        ),
      );

      router.go('/recurring');
      await tester.pumpAndSettle();

      expect(find.byType(RecurringsScreen), findsOneWidget);
    });

    testWidgets('renders the real budgets screen on /budgets', (
      tester,
    ) async {
      final router = buildAppRouter(isLoggedIn: () => true);
      await tester.pumpWidget(
        ProviderScope(
          overrides: _dashboardScreenOverrides,
          child: MaterialApp.router(routerConfig: router),
        ),
      );

      router.go('/budgets');
      await tester.pumpAndSettle();

      expect(find.byType(BudgetsScreen), findsOneWidget);
    });

    testWidgets('renders the budget form on /budgets/add', (tester) async {
      final router = buildAppRouter(isLoggedIn: () => true);
      await tester.pumpWidget(
        ProviderScope(
          overrides: _dashboardScreenOverrides,
          child: MaterialApp.router(routerConfig: router),
        ),
      );

      router.go('/budgets/add');
      await tester.pumpAndSettle();

      expect(find.byType(BudgetFormScreen), findsOneWidget);
      expect(find.text('Nuevo presupuesto'), findsOneWidget);
    });

    testWidgets('renders the real accounts screen on /accounts', (
      tester,
    ) async {
      final router = buildAppRouter(isLoggedIn: () => true);
      await tester.pumpWidget(
        ProviderScope(
          overrides: _dashboardScreenOverrides,
          child: MaterialApp.router(routerConfig: router),
        ),
      );

      router.go('/accounts');
      await tester.pumpAndSettle();

      expect(find.byType(AccountsScreen), findsOneWidget);
    });

    testWidgets('renders the account form on /accounts/add', (tester) async {
      final router = buildAppRouter(isLoggedIn: () => true);
      await tester.pumpWidget(
        ProviderScope(
          overrides: _dashboardScreenOverrides,
          child: MaterialApp.router(routerConfig: router),
        ),
      );

      router.go('/accounts/add');
      await tester.pumpAndSettle();

      expect(find.byType(AccountFormScreen), findsOneWidget);
      expect(find.text('Nueva cuenta'), findsOneWidget);
    });

    testWidgets(
      'renders the account form in edit mode when extra carries an Account',
      (tester) async {
        final router = buildAppRouter(isLoggedIn: () => true);
        await tester.pumpWidget(
          ProviderScope(
            overrides: _dashboardScreenOverrides,
            child: MaterialApp.router(routerConfig: router),
          ),
        );

        const account = Account(
          id: 'acc-1',
          name: 'Cuenta sueldo',
          type: AccountType.banco,
          currency: 'ARS',
          archived: false,
        );
        router.go('/accounts/add', extra: account);
        await tester.pumpAndSettle();

        expect(find.text('Editar cuenta'), findsOneWidget);
      },
    );

    testWidgets('renders the real categories screen on /categories', (
      tester,
    ) async {
      final router = buildAppRouter(isLoggedIn: () => true);
      await tester.pumpWidget(
        ProviderScope(
          overrides: _dashboardScreenOverrides,
          child: MaterialApp.router(routerConfig: router),
        ),
      );

      router.go('/categories');
      await tester.pumpAndSettle();

      expect(find.byType(CategoriesScreen), findsOneWidget);
    });

    testWidgets('renders the category form on /categories/add', (
      tester,
    ) async {
      final router = buildAppRouter(isLoggedIn: () => true);
      await tester.pumpWidget(
        ProviderScope(
          overrides: _dashboardScreenOverrides,
          child: MaterialApp.router(routerConfig: router),
        ),
      );

      router.go('/categories/add');
      await tester.pumpAndSettle();

      expect(find.byType(CategoryFormScreen), findsOneWidget);
      expect(find.text('Nueva categoría'), findsOneWidget);
    });

    testWidgets(
      'renders the category form in edit mode when extra carries a Category',
      (tester) async {
        final router = buildAppRouter(isLoggedIn: () => true);
        await tester.pumpWidget(
          ProviderScope(
            overrides: _dashboardScreenOverrides,
            child: MaterialApp.router(routerConfig: router),
          ),
        );

        const category = Category(
          id: 'cat-1',
          description: 'Groceries',
          name: 'Supermercado',
          tag: 'food',
          type: CategoryType.variable,
        );
        router.go('/categories/add', extra: category);
        await tester.pumpAndSettle();

        expect(find.text('Editar categoría'), findsOneWidget);
      },
    );

    testWidgets('renders the transfer screen on /accounts/transfer', (
      tester,
    ) async {
      final router = buildAppRouter(isLoggedIn: () => true);
      await tester.pumpWidget(
        ProviderScope(
          overrides: _dashboardScreenOverrides,
          child: MaterialApp.router(routerConfig: router),
        ),
      );

      router.go('/accounts/transfer');
      await tester.pumpAndSettle();

      expect(find.byType(TransferScreen), findsOneWidget);
      expect(find.text('Transferir entre cuentas'), findsOneWidget);
    });
  });

  group('appRouterProvider reactivity', () {
    test(
      'returns the same GoRouter instance across an auth-state change',
      () async {
        final tokenStore = FakeTokenStore();
        final container = ProviderContainer(
          overrides: [authTokenStoreProvider.overrideWithValue(tokenStore)],
        );
        addTearDown(container.dispose);

        final routerBefore = container.read(appRouterProvider);
        await container.read(authSessionProvider.notifier).login('token');
        final routerAfter = container.read(appRouterProvider);

        expect(identical(routerBefore, routerAfter), isTrue);
      },
    );

    test('AuthRefreshNotifier notifies listeners on login/logout', () async {
      final tokenStore = FakeTokenStore();
      final container = ProviderContainer(
        overrides: [authTokenStoreProvider.overrideWithValue(tokenStore)],
      );
      addTearDown(container.dispose);

      final notifier = container.read(_authRefreshNotifierProvider);
      var notifyCount = 0;
      notifier.addListener(() => notifyCount++);

      await container.read(authSessionProvider.notifier).login('token');

      expect(notifyCount, greaterThan(0));
    });
  });
}
