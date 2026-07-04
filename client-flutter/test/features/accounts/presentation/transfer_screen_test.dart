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

class _FakeAccountRepository extends AccountRepository {
  _FakeAccountRepository({this.transferError, this.gate}) : super(Dio());

  final Object? transferError;
  final Completer<void>? gate;

  var transferCallCount = 0;
  ({
    String from,
    String to,
    num amount,
    DateTime date,
    String? description
  })? lastTransferArgs;

  @override
  Future<List<Movement>> transfer({
    required String from,
    required String to,
    required num amount,
    required DateTime date,
    String? description,
  }) async {
    transferCallCount++;
    lastTransferArgs = (
      from: from,
      to: to,
      amount: amount,
      date: date,
      description: description,
    );
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = transferError;
    if (error != null) throw error;
    return [
      Movement(
        id: 'mv-egreso',
        amount: amount.toDouble(),
        date: date,
        type: MovementType.egreso,
        account: from,
        transferId: 'transfer-1',
        description: description,
      ),
      Movement(
        id: 'mv-ingreso',
        amount: amount.toDouble(),
        date: date,
        type: MovementType.ingreso,
        account: to,
        transferId: 'transfer-1',
        description: description,
      ),
    ];
  }
}

const _account1 = Account(
  id: 'acc-1',
  name: 'Cuenta sueldo',
  type: AccountType.banco,
  currency: 'ARS',
  archived: false,
);

const _account2 = Account(
  id: 'acc-2',
  name: 'Efectivo',
  type: AccountType.efectivo,
  currency: 'ARS',
  archived: false,
);

Widget _wrap({required List<Override> overrides, required GoRouter router}) {
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp.router(theme: AppTheme.dark, routerConfig: router),
  );
}

GoRouter _buildRouter() {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const Scaffold(body: Text('back-marker')),
      ),
      GoRoute(
        path: '/accounts/transfer',
        builder: (context, state) => const TransferScreen(),
      ),
    ],
  );
}

List<Override> _baseOverrides(_FakeAccountRepository repository) => [
      accountRepositoryProvider.overrideWithValue(repository),
      accountsProvider.overrideWith((ref) async => [_account1, _account2]),
    ];

Future<void> _selectAccount(
    WidgetTester tester, Key fieldKey, String name) async {
  await tester.tap(find.byKey(fieldKey));
  await tester.pumpAndSettle();
  await tester.tap(find.text(name).last);
  await tester.pumpAndSettle();
}

Future<void> _fillValidForm(WidgetTester tester) async {
  await _selectAccount(
    tester,
    const Key('transfer-form-from-field'),
    'Cuenta sueldo',
  );
  await _selectAccount(
    tester,
    const Key('transfer-form-to-field'),
    'Efectivo',
  );
  await tester.enterText(
    find.byKey(const Key('transfer-form-amount-field')),
    '500',
  );
}

void main() {
  testWidgets('empty form does not submit', (tester) async {
    final repository = _FakeAccountRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/accounts/transfer');
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('transfer-form-submit-button')));
    await tester.pumpAndSettle();

    expect(repository.transferCallCount, 0);
  });

  testWidgets(
    'selecting the same account for Desde and Hacia is blocked client-side'
    ' without calling the repository',
    (tester) async {
      final repository = _FakeAccountRepository();
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/accounts/transfer');
      await tester.pumpAndSettle();

      await _selectAccount(
        tester,
        const Key('transfer-form-from-field'),
        'Cuenta sueldo',
      );
      await _selectAccount(
        tester,
        const Key('transfer-form-to-field'),
        'Cuenta sueldo',
      );
      await tester.enterText(
        find.byKey(const Key('transfer-form-amount-field')),
        '500',
      );

      await tester.tap(find.byKey(const Key('transfer-form-submit-button')));
      await tester.pumpAndSettle();

      expect(repository.transferCallCount, 0);
      expect(
        find.text('Las cuentas de origen y destino deben ser distintas'),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    'a valid submit calls transfer with the exact right fields and pops',
    (tester) async {
      final repository = _FakeAccountRepository();
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/accounts/transfer');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);
      await tester.enterText(
        find.byKey(const Key('transfer-form-description-field')),
        'Ahorro mensual',
      );

      final expectedDate = DateUtils.dateOnly(DateTime.now());

      await tester.tap(find.byKey(const Key('transfer-form-submit-button')));
      await tester.pumpAndSettle();

      expect(repository.transferCallCount, 1);
      expect(repository.lastTransferArgs?.from, 'acc-1');
      expect(repository.lastTransferArgs?.to, 'acc-2');
      expect(repository.lastTransferArgs?.amount, 500);
      expect(repository.lastTransferArgs?.date, expectedDate);
      expect(repository.lastTransferArgs?.description, 'Ahorro mensual');
      expect(find.text('back-marker'), findsOneWidget);
      expect(find.byType(TransferScreen), findsNothing);
    },
  );

  testWidgets(
    'an ApiException failure shows the message via SnackBar without crashing',
    (tester) async {
      final repository = _FakeAccountRepository(
        transferError: const ApiException(
          message: 'Las cuentas deben ser distintas',
        ),
      );
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/accounts/transfer');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);
      await tester.tap(find.byKey(const Key('transfer-form-submit-button')));
      await tester.pumpAndSettle();

      expect(find.text('Las cuentas deben ser distintas'), findsOneWidget);
      expect(find.byType(TransferScreen), findsOneWidget);
    },
  );

  testWidgets(
    'a non-ApiException failure is still caught by the catch-all',
    (tester) async {
      final repository = _FakeAccountRepository(
        transferError: Exception('boom'),
      );
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/accounts/transfer');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);
      await tester.tap(find.byKey(const Key('transfer-form-submit-button')));
      await tester.pumpAndSettle();

      expect(
        find.text('Ocurrió un error inesperado. Probá de nuevo.'),
        findsOneWidget,
      );
      expect(find.byType(TransferScreen), findsOneWidget);
    },
  );

  testWidgets('a rapid double submit only triggers a single transfer call', (
    tester,
  ) async {
    final gate = Completer<void>();
    final repository = _FakeAccountRepository(gate: gate);
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/accounts/transfer');
    await tester.pumpAndSettle();

    await _fillValidForm(tester);

    await tester.tap(find.byKey(const Key('transfer-form-submit-button')));
    await tester.pump();

    final button = tester.widget<FilledButton>(
      find.byKey(const Key('transfer-form-submit-button')),
    );
    expect(button.onPressed, isNull);

    await tester.tap(
      find.byKey(const Key('transfer-form-submit-button')),
      warnIfMissed: false,
    );
    await tester.pump();

    gate.complete();
    await tester.pumpAndSettle();

    expect(repository.transferCallCount, 1);
  });
}
