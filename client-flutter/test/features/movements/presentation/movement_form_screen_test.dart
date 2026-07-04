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
import 'package:client_flutter/features/movements/data/index.dart';
import 'package:client_flutter/features/movements/presentation/index.dart';
import 'package:client_flutter/shared/models/index.dart';

class _FakeMovementRepository extends MovementRepository {
  _FakeMovementRepository({
    this.createError,
    this.updateError,
    this.deleteError,
    this.gate,
  }) : super(Dio());

  final Object? createError;
  final Object? updateError;
  final Object? deleteError;
  final Completer<void>? gate;

  var createCallCount = 0;
  var updateCallCount = 0;
  var deleteCallCount = 0;
  MovementWriteRequest? lastCreateRequest;
  MovementWriteRequest? lastUpdateRequest;
  String? lastUpdateId;
  String? lastDeleteId;

  @override
  Future<Movement> create(MovementWriteRequest request) async {
    createCallCount++;
    lastCreateRequest = request;
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = createError;
    if (error != null) throw error;
    return _resultFrom(request);
  }

  @override
  Future<Movement> update(String id, MovementWriteRequest request) async {
    updateCallCount++;
    lastUpdateId = id;
    lastUpdateRequest = request;
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = updateError;
    if (error != null) throw error;
    return _resultFrom(request);
  }

  @override
  Future<void> delete(String id) async {
    deleteCallCount++;
    lastDeleteId = id;
    final error = deleteError;
    if (error != null) throw error;
  }

  Movement _resultFrom(MovementWriteRequest request) => Movement(
    id: 'mv-created',
    amount: request.amount.toDouble(),
    date: request.date,
    type: request.type,
    account: request.account,
    description: request.description,
  );
}

const _category1 = Category(
  id: 'cat-1',
  description: 'Groceries',
  name: 'Supermercado',
  tag: 'food',
  type: CategoryType.variable,
);

const _category2 = Category(
  id: 'cat-2',
  description: 'Transport',
  name: 'Transporte',
  tag: 'transport',
  type: CategoryType.variable,
);

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
        path: '/movements/add',
        builder: (context, state) =>
            MovementFormScreen(initial: state.extra as Movement?),
      ),
    ],
  );
}

List<Override> _baseOverrides(_FakeMovementRepository repository) => [
  movementRepositoryProvider.overrideWithValue(repository),
  categoriesProvider.overrideWith((ref) async => [_category1, _category2]),
  accountsProvider.overrideWith((ref) async => [_account1, _account2]),
];

Future<void> _fillValidForm(WidgetTester tester) async {
  await tester.enterText(
    find.byKey(const Key('movement-form-amount-field')),
    '1500',
  );

  await tester.tap(find.byKey(const Key('movement-form-category-field')));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Supermercado').last);
  await tester.pumpAndSettle();

  await tester.tap(find.byKey(const Key('movement-form-account-field')));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Cuenta sueldo').last);
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('create mode: empty form does not submit', (tester) async {
    final repository = _FakeMovementRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/movements/add');
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('movement-form-save-button')));
    await tester.pumpAndSettle();

    expect(repository.createCallCount, 0);
    expect(find.text('Ingresá un monto'), findsOneWidget);
    expect(find.text('Seleccioná una categoría'), findsOneWidget);
    expect(find.text('Seleccioná una cuenta'), findsOneWidget);
  });

  testWidgets(
    'create mode: a valid submit calls create with the right fields and pops',
    (tester) async {
      final repository = _FakeMovementRepository();
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/movements/add');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);
      await tester.enterText(
        find.byKey(const Key('movement-form-description-field')),
        'Compra semanal',
      );

      final expectedDate = DateUtils.dateOnly(DateTime.now());

      await tester.tap(find.byKey(const Key('movement-form-save-button')));
      await tester.pumpAndSettle();

      expect(repository.createCallCount, 1);
      expect(
        repository.lastCreateRequest,
        MovementWriteRequest(
          type: MovementType.egreso,
          amount: 1500,
          category: 'cat-1',
          account: 'acc-1',
          date: expectedDate,
          description: 'Compra semanal',
        ),
      );
      expect(find.text('back-marker'), findsOneWidget);
      expect(find.byType(MovementFormScreen), findsNothing);
    },
  );

  testWidgets('edit mode: form is pre-filled from initial', (tester) async {
    final repository = _FakeMovementRepository();
    final router = _buildRouter();
    final initial = Movement(
      id: 'mv-1',
      amount: 2500,
      category: _category2,
      date: DateTime(2026, 6, 15),
      type: MovementType.ingreso,
      account: 'acc-2',
      description: 'Sueldo extra',
    );

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/movements/add', extra: initial);
    await tester.pumpAndSettle();

    expect(find.text('Editar movimiento'), findsOneWidget);
    expect(
      tester
          .widget<TextFormField>(
            find.byKey(const Key('movement-form-amount-field')),
          )
          .controller
          ?.text,
      '2500.0',
    );
    expect(find.text('Transporte'), findsOneWidget);
    expect(find.text('Efectivo'), findsOneWidget);
    expect(
      tester
          .widget<TextFormField>(
            find.byKey(const Key('movement-form-description-field')),
          )
          .controller
          ?.text,
      'Sueldo extra',
    );
  });

  testWidgets(
    'edit mode: a valid submit calls update with the right id and fields',
    (tester) async {
      final repository = _FakeMovementRepository();
      final router = _buildRouter();
      final initial = Movement(
        id: 'mv-1',
        amount: 2500,
        category: _category2,
        date: DateTime(2026, 6, 15),
        type: MovementType.ingreso,
        account: 'acc-2',
        description: 'Sueldo extra',
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/movements/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('movement-form-amount-field')),
        '3000',
      );

      await tester.tap(find.byKey(const Key('movement-form-save-button')));
      await tester.pumpAndSettle();

      expect(repository.updateCallCount, 1);
      expect(repository.lastUpdateId, 'mv-1');
      expect(
        repository.lastUpdateRequest,
        MovementWriteRequest(
          type: MovementType.ingreso,
          amount: 3000,
          category: 'cat-2',
          account: 'acc-2',
          date: DateTime(2026, 6, 15),
          description: 'Sueldo extra',
        ),
      );
      expect(find.text('back-marker'), findsOneWidget);
    },
  );

  testWidgets(
    'delete: confirming the dialog calls delete and pops',
    (tester) async {
      final repository = _FakeMovementRepository();
      final router = _buildRouter();
      final initial = Movement(
        id: 'mv-1',
        amount: 2500,
        date: DateTime(2026, 6, 15),
        type: MovementType.ingreso,
        account: 'acc-2',
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/movements/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('movement-form-delete-button')));
      await tester.pumpAndSettle();

      expect(find.text('¿Eliminar este movimiento?'), findsOneWidget);

      await tester.tap(find.text('Eliminar'));
      await tester.pumpAndSettle();

      expect(repository.deleteCallCount, 1);
      expect(repository.lastDeleteId, 'mv-1');
      expect(find.text('back-marker'), findsOneWidget);
    },
  );

  testWidgets(
    'delete: cancelling the dialog does not call delete',
    (tester) async {
      final repository = _FakeMovementRepository();
      final router = _buildRouter();
      final initial = Movement(
        id: 'mv-1',
        amount: 2500,
        date: DateTime(2026, 6, 15),
        type: MovementType.ingreso,
        account: 'acc-2',
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/movements/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('movement-form-delete-button')));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Cancelar'));
      await tester.pumpAndSettle();

      expect(repository.deleteCallCount, 0);
      expect(find.byType(MovementFormScreen), findsOneWidget);
    },
  );

  testWidgets('a rapid double submit only triggers a single create call', (
    tester,
  ) async {
    final gate = Completer<void>();
    final repository = _FakeMovementRepository(gate: gate);
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/movements/add');
    await tester.pumpAndSettle();

    await _fillValidForm(tester);

    await tester.tap(find.byKey(const Key('movement-form-save-button')));
    await tester.pump();

    final button = tester.widget<FilledButton>(
      find.byKey(const Key('movement-form-save-button')),
    );
    expect(button.onPressed, isNull);

    await tester.tap(
      find.byKey(const Key('movement-form-save-button')),
      warnIfMissed: false,
    );
    await tester.pump();

    gate.complete();
    await tester.pumpAndSettle();

    expect(repository.createCallCount, 1);
  });

  testWidgets(
    'an ApiException failure shows the message via SnackBar without crashing',
    (tester) async {
      final repository = _FakeMovementRepository(
        createError: const ApiException(message: 'Monto inválido'),
      );
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/movements/add');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);
      await tester.tap(find.byKey(const Key('movement-form-save-button')));
      await tester.pumpAndSettle();

      expect(find.text('Monto inválido'), findsOneWidget);
      expect(find.byType(MovementFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'a non-ApiException failure is still caught and shows a fallback message',
    (tester) async {
      final repository = _FakeMovementRepository(
        createError: Exception('boom'),
      );
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/movements/add');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);
      await tester.tap(find.byKey(const Key('movement-form-save-button')));
      await tester.pumpAndSettle();

      expect(
        find.text('Ocurrió un error inesperado. Probá de nuevo.'),
        findsOneWidget,
      );
      expect(find.byType(MovementFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'edit mode: an ApiException failure on update shows the message via SnackBar',
    (tester) async {
      final repository = _FakeMovementRepository(
        updateError: const ApiException(message: 'No se pudo actualizar'),
      );
      final router = _buildRouter();
      final initial = Movement(
        id: 'mv-1',
        amount: 2500,
        category: _category2,
        date: DateTime(2026, 6, 15),
        type: MovementType.ingreso,
        account: 'acc-2',
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/movements/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('movement-form-save-button')));
      await tester.pumpAndSettle();

      expect(find.text('No se pudo actualizar'), findsOneWidget);
      expect(find.byType(MovementFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'delete: an ApiException failure shows the message via SnackBar without popping',
    (tester) async {
      final repository = _FakeMovementRepository(
        deleteError: const ApiException(message: 'No se pudo eliminar'),
      );
      final router = _buildRouter();
      final initial = Movement(
        id: 'mv-1',
        amount: 2500,
        date: DateTime(2026, 6, 15),
        type: MovementType.ingreso,
        account: 'acc-2',
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/movements/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('movement-form-delete-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Eliminar'));
      await tester.pumpAndSettle();

      expect(find.text('No se pudo eliminar'), findsOneWidget);
      expect(find.byType(MovementFormScreen), findsOneWidget);
    },
  );
}
