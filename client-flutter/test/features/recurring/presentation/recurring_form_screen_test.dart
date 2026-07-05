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

class _FakeRecurringRepository extends RecurringRepository {
  _FakeRecurringRepository({
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

  MovementType? lastType;
  double? lastAmount;
  String? lastCategory;
  String? lastAccount;
  int? lastDayOfMonth;
  bool? lastActive;
  String? lastDescription;

  String? lastUpdateId;

  String? lastDeleteId;

  @override
  Future<Recurring> create({
    required MovementType type,
    required double amount,
    required String category,
    required String account,
    required int dayOfMonth,
    bool active = true,
    String? description,
    String? card,
  }) async {
    createCallCount++;
    lastType = type;
    lastAmount = amount;
    lastCategory = category;
    lastAccount = account;
    lastDayOfMonth = dayOfMonth;
    lastActive = active;
    lastDescription = description;
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = createError;
    if (error != null) throw error;
    return Recurring(
      id: 'rec-created',
      type: type,
      amount: amount,
      category: category,
      account: account,
      dayOfMonth: dayOfMonth,
      frequency: RecurringFrequency.mensual,
      active: active,
      description: description,
    );
  }

  @override
  Future<Recurring> update(
    String id, {
    MovementType? type,
    double? amount,
    String? category,
    String? account,
    int? dayOfMonth,
    bool? active,
    String? description,
    String? card,
  }) async {
    updateCallCount++;
    lastUpdateId = id;
    lastType = type;
    lastAmount = amount;
    lastCategory = category;
    lastAccount = account;
    lastDayOfMonth = dayOfMonth;
    lastActive = active;
    lastDescription = description;
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = updateError;
    if (error != null) throw error;
    return Recurring(
      id: id,
      type: type ?? MovementType.egreso,
      amount: amount ?? 0,
      category: category ?? 'cat-1',
      account: account ?? 'acc-1',
      dayOfMonth: dayOfMonth ?? 1,
      frequency: RecurringFrequency.mensual,
      active: active,
      description: description,
    );
  }

  @override
  Future<void> delete(String id) async {
    deleteCallCount++;
    lastDeleteId = id;
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = deleteError;
    if (error != null) throw error;
  }
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
  description: 'Housing',
  name: 'Alquiler',
  tag: 'housing',
  type: CategoryType.fijo,
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
        path: '/recurring/add',
        builder: (context, state) =>
            RecurringFormScreen(initial: state.extra as Recurring?),
      ),
    ],
  );
}

List<Override> _baseOverrides(_FakeRecurringRepository repository) => [
      recurringRepositoryProvider.overrideWithValue(repository),
      categoriesProvider.overrideWith((ref) async => [_category1, _category2]),
      accountsProvider.overrideWith((ref) async => [_account1, _account2]),
    ];

Future<void> _fillValidForm(WidgetTester tester) async {
  await tester.enterText(
    find.byKey(const Key('recurring-form-amount-field')),
    '1500',
  );

  await tester.tap(find.byKey(const Key('recurring-form-category-field')));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Supermercado').last);
  await tester.pumpAndSettle();

  await tester.tap(find.byKey(const Key('recurring-form-account-field')));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Cuenta sueldo').last);
  await tester.pumpAndSettle();

  await tester.enterText(
    find.byKey(const Key('recurring-form-day-field')),
    '5',
  );
}

void main() {
  testWidgets('create mode: empty form does not submit', (tester) async {
    final repository = _FakeRecurringRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/recurring/add');
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('recurring-form-save-button')));
    await tester.pumpAndSettle();

    expect(repository.createCallCount, 0);
    expect(find.text('Ingresá un monto'), findsOneWidget);
    expect(find.text('Seleccioná una categoría'), findsOneWidget);
    expect(find.text('Seleccioná una cuenta'), findsOneWidget);
    expect(find.text('Ingresá un día válido (1-31)'), findsOneWidget);
  });

  testWidgets('create mode: DayOfMonth 0 does not submit', (tester) async {
    final repository = _FakeRecurringRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/recurring/add');
    await tester.pumpAndSettle();

    await _fillValidForm(tester);
    await tester.enterText(
      find.byKey(const Key('recurring-form-day-field')),
      '0',
    );

    await tester.tap(find.byKey(const Key('recurring-form-save-button')));
    await tester.pumpAndSettle();

    expect(repository.createCallCount, 0);
    expect(find.text('Ingresá un día válido (1-31)'), findsOneWidget);
  });

  testWidgets('create mode: DayOfMonth 32 does not submit', (tester) async {
    final repository = _FakeRecurringRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/recurring/add');
    await tester.pumpAndSettle();

    await _fillValidForm(tester);
    await tester.enterText(
      find.byKey(const Key('recurring-form-day-field')),
      '32',
    );

    await tester.tap(find.byKey(const Key('recurring-form-save-button')));
    await tester.pumpAndSettle();

    expect(repository.createCallCount, 0);
    expect(find.text('Ingresá un día válido (1-31)'), findsOneWidget);
  });

  testWidgets(
    'create mode: a valid submit calls create with the right fields '
    'including active: true by default',
    (tester) async {
      final repository = _FakeRecurringRepository();
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/recurring/add');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);
      await tester.enterText(
        find.byKey(const Key('recurring-form-description-field')),
        'Alquiler mensual',
      );

      await tester.tap(find.byKey(const Key('recurring-form-save-button')));
      await tester.pumpAndSettle();

      expect(repository.createCallCount, 1);
      expect(repository.lastType, MovementType.egreso);
      expect(repository.lastAmount, 1500);
      expect(repository.lastCategory, 'cat-1');
      expect(repository.lastAccount, 'acc-1');
      expect(repository.lastDayOfMonth, 5);
      expect(repository.lastActive, isTrue);
      expect(repository.lastDescription, 'Alquiler mensual');
      expect(find.text('back-marker'), findsOneWidget);
      expect(find.byType(RecurringFormScreen), findsNothing);
    },
  );

  testWidgets('edit mode: form is pre-filled from initial', (tester) async {
    final repository = _FakeRecurringRepository();
    final router = _buildRouter();
    const initial = Recurring(
      id: 'rec-1',
      type: MovementType.ingreso,
      amount: 2500,
      category: 'cat-2',
      account: 'acc-2',
      dayOfMonth: 10,
      frequency: RecurringFrequency.mensual,
      active: false,
      description: 'Sueldo extra',
    );

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/recurring/add', extra: initial);
    await tester.pumpAndSettle();

    expect(find.text('Editar recurrente'), findsOneWidget);
    expect(
      tester
          .widget<TextFormField>(
            find.byKey(const Key('recurring-form-amount-field')),
          )
          .controller
          ?.text,
      '2500.0',
    );
    expect(find.text('Alquiler'), findsOneWidget);
    expect(find.text('Efectivo'), findsOneWidget);
    expect(
      tester
          .widget<TextFormField>(
            find.byKey(const Key('recurring-form-day-field')),
          )
          .controller
          ?.text,
      '10',
    );
    expect(
      tester
          .widget<SwitchListTile>(
            find.byKey(const Key('recurring-form-active-switch')),
          )
          .value,
      isFalse,
    );
    expect(
      tester
          .widget<TextFormField>(
            find.byKey(const Key('recurring-form-description-field')),
          )
          .controller
          ?.text,
      'Sueldo extra',
    );
  });

  testWidgets('create mode: Active switch defaults to true', (tester) async {
    final repository = _FakeRecurringRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/recurring/add');
    await tester.pumpAndSettle();

    expect(
      tester
          .widget<SwitchListTile>(
            find.byKey(const Key('recurring-form-active-switch')),
          )
          .value,
      isTrue,
    );
  });

  testWidgets(
    'edit mode: a valid submit calls update with the right id and edited '
    'values',
    (tester) async {
      final repository = _FakeRecurringRepository();
      final router = _buildRouter();
      const initial = Recurring(
        id: 'rec-1',
        type: MovementType.ingreso,
        amount: 2500,
        category: 'cat-2',
        account: 'acc-2',
        dayOfMonth: 10,
        frequency: RecurringFrequency.mensual,
        active: true,
        description: 'Sueldo extra',
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/recurring/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('recurring-form-amount-field')),
        '3000',
      );
      await tester.tap(
        find.byKey(const Key('recurring-form-active-switch')),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('recurring-form-save-button')));
      await tester.pumpAndSettle();

      expect(repository.updateCallCount, 1);
      expect(repository.lastUpdateId, 'rec-1');
      expect(repository.lastAmount, 3000);
      expect(repository.lastType, MovementType.ingreso);
      expect(repository.lastCategory, 'cat-2');
      expect(repository.lastAccount, 'acc-2');
      expect(repository.lastDayOfMonth, 10);
      expect(repository.lastActive, isFalse);
      expect(repository.lastDescription, 'Sueldo extra');
      expect(find.text('back-marker'), findsOneWidget);
    },
  );

  testWidgets(
    'delete: confirming the dialog calls delete and pops',
    (tester) async {
      final repository = _FakeRecurringRepository();
      final router = _buildRouter();
      const initial = Recurring(
        id: 'rec-1',
        type: MovementType.egreso,
        amount: 1500,
        category: 'cat-1',
        account: 'acc-1',
        dayOfMonth: 5,
        frequency: RecurringFrequency.mensual,
        active: true,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/recurring/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('recurring-form-delete-button')));
      await tester.pumpAndSettle();

      expect(find.text('¿Eliminar este recurrente?'), findsOneWidget);

      await tester.tap(find.text('Eliminar'));
      await tester.pumpAndSettle();

      expect(repository.deleteCallCount, 1);
      expect(repository.lastDeleteId, 'rec-1');
      expect(find.text('back-marker'), findsOneWidget);
    },
  );

  testWidgets(
    'delete: cancelling the dialog does not call delete',
    (tester) async {
      final repository = _FakeRecurringRepository();
      final router = _buildRouter();
      const initial = Recurring(
        id: 'rec-1',
        type: MovementType.egreso,
        amount: 1500,
        category: 'cat-1',
        account: 'acc-1',
        dayOfMonth: 5,
        frequency: RecurringFrequency.mensual,
        active: true,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/recurring/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('recurring-form-delete-button')));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Cancelar'));
      await tester.pumpAndSettle();

      expect(repository.deleteCallCount, 0);
      expect(find.byType(RecurringFormScreen), findsOneWidget);
    },
  );

  testWidgets('create mode: no delete button is shown', (tester) async {
    final repository = _FakeRecurringRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/recurring/add');
    await tester.pumpAndSettle();

    expect(
      find.byKey(const Key('recurring-form-delete-button')),
      findsNothing,
    );
  });

  testWidgets('a rapid double submit only triggers a single create call', (
    tester,
  ) async {
    final gate = Completer<void>();
    final repository = _FakeRecurringRepository(gate: gate);
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/recurring/add');
    await tester.pumpAndSettle();

    await _fillValidForm(tester);

    await tester.tap(find.byKey(const Key('recurring-form-save-button')));
    await tester.pump();

    final button = tester.widget<FilledButton>(
      find.byKey(const Key('recurring-form-save-button')),
    );
    expect(button.onPressed, isNull);

    await tester.tap(
      find.byKey(const Key('recurring-form-save-button')),
      warnIfMissed: false,
    );
    await tester.pump();

    gate.complete();
    await tester.pumpAndSettle();

    expect(repository.createCallCount, 1);
  });

  testWidgets(
    'a rapid double delete-confirm only triggers a single delete call',
    (tester) async {
      final gate = Completer<void>();
      final repository = _FakeRecurringRepository(gate: gate);
      final router = _buildRouter();
      const initial = Recurring(
        id: 'rec-1',
        type: MovementType.egreso,
        amount: 1500,
        category: 'cat-1',
        account: 'acc-1',
        dayOfMonth: 5,
        frequency: RecurringFrequency.mensual,
        active: true,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/recurring/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('recurring-form-delete-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Eliminar'));
      await tester.pump();

      final button = tester.widget<IconButton>(
        find.byKey(const Key('recurring-form-delete-button')),
      );
      expect(button.onPressed, isNull);

      await tester.tap(
        find.byKey(const Key('recurring-form-delete-button')),
        warnIfMissed: false,
      );
      await tester.pump();

      gate.complete();
      await tester.pumpAndSettle();

      expect(repository.deleteCallCount, 1);
    },
  );

  testWidgets(
    'an ApiException failure on create shows the message via SnackBar '
    'without crashing',
    (tester) async {
      final repository = _FakeRecurringRepository(
        createError: const ApiException(message: 'Monto inválido'),
      );
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/recurring/add');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);
      await tester.tap(find.byKey(const Key('recurring-form-save-button')));
      await tester.pumpAndSettle();

      expect(find.text('Monto inválido'), findsOneWidget);
      expect(find.byType(RecurringFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'a non-ApiException failure on create is still caught and shows a '
    'fallback message',
    (tester) async {
      final repository = _FakeRecurringRepository(
        createError: Exception('boom'),
      );
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/recurring/add');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);
      await tester.tap(find.byKey(const Key('recurring-form-save-button')));
      await tester.pumpAndSettle();

      expect(
        find.text('Ocurrió un error inesperado. Probá de nuevo.'),
        findsOneWidget,
      );
      expect(find.byType(RecurringFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'edit mode: an ApiException failure on update shows the message via '
    'SnackBar',
    (tester) async {
      final repository = _FakeRecurringRepository(
        updateError: const ApiException(message: 'No se pudo actualizar'),
      );
      final router = _buildRouter();
      const initial = Recurring(
        id: 'rec-1',
        type: MovementType.egreso,
        amount: 1500,
        category: 'cat-1',
        account: 'acc-1',
        dayOfMonth: 5,
        frequency: RecurringFrequency.mensual,
        active: true,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/recurring/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('recurring-form-save-button')));
      await tester.pumpAndSettle();

      expect(find.text('No se pudo actualizar'), findsOneWidget);
      expect(find.byType(RecurringFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'delete: a non-ApiException failure is still caught and shows a '
    'fallback message',
    (tester) async {
      final repository = _FakeRecurringRepository(
        deleteError: Exception('boom'),
      );
      final router = _buildRouter();
      const initial = Recurring(
        id: 'rec-1',
        type: MovementType.egreso,
        amount: 1500,
        category: 'cat-1',
        account: 'acc-1',
        dayOfMonth: 5,
        frequency: RecurringFrequency.mensual,
        active: true,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/recurring/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('recurring-form-delete-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Eliminar'));
      await tester.pumpAndSettle();

      expect(
        find.text('Ocurrió un error inesperado. Probá de nuevo.'),
        findsOneWidget,
      );
      expect(find.byType(RecurringFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'delete: an ApiException failure shows the message via SnackBar '
    'without popping',
    (tester) async {
      final repository = _FakeRecurringRepository(
        deleteError: const ApiException(message: 'No se pudo eliminar'),
      );
      final router = _buildRouter();
      const initial = Recurring(
        id: 'rec-1',
        type: MovementType.egreso,
        amount: 1500,
        category: 'cat-1',
        account: 'acc-1',
        dayOfMonth: 5,
        frequency: RecurringFrequency.mensual,
        active: true,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/recurring/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('recurring-form-delete-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Eliminar'));
      await tester.pumpAndSettle();

      expect(find.text('No se pudo eliminar'), findsOneWidget);
      expect(find.byType(RecurringFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'create mode: category load error blocks submit with a clear message '
    'and never calls create',
    (tester) async {
      final repository = _FakeRecurringRepository();
      final router = _buildRouter();
      final overrides = [
        recurringRepositoryProvider.overrideWithValue(repository),
        categoriesProvider.overrideWith((ref) async {
          throw Exception('categories down');
        }),
        accountsProvider.overrideWith((ref) async => [_account1, _account2]),
      ];

      await tester.pumpWidget(_wrap(overrides: overrides, router: router));
      router.push('/recurring/add');
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('recurring-form-save-button')));
      await tester.pumpAndSettle();

      expect(
        find.text(
          'No se pudieron cargar las categorías o cuentas. Probá de nuevo.',
        ),
        findsOneWidget,
      );
      expect(repository.createCallCount, 0);
      expect(repository.updateCallCount, 0);
    },
  );

  testWidgets(
    'create mode: account load error blocks submit with a clear message '
    'and never calls create',
    (tester) async {
      final repository = _FakeRecurringRepository();
      final router = _buildRouter();
      final overrides = [
        recurringRepositoryProvider.overrideWithValue(repository),
        categoriesProvider.overrideWith(
          (ref) async => [_category1, _category2],
        ),
        accountsProvider.overrideWith((ref) async {
          throw Exception('accounts down');
        }),
      ];

      await tester.pumpWidget(_wrap(overrides: overrides, router: router));
      router.push('/recurring/add');
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('recurring-form-save-button')));
      await tester.pumpAndSettle();

      expect(
        find.text(
          'No se pudieron cargar las categorías o cuentas. Probá de nuevo.',
        ),
        findsOneWidget,
      );
      expect(repository.createCallCount, 0);
      expect(repository.updateCallCount, 0);
    },
  );

  testWidgets('create mode: a negative amount does not submit', (
    tester,
  ) async {
    final repository = _FakeRecurringRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/recurring/add');
    await tester.pumpAndSettle();

    await _fillValidForm(tester);
    await tester.enterText(
      find.byKey(const Key('recurring-form-amount-field')),
      '-5',
    );

    await tester.tap(find.byKey(const Key('recurring-form-save-button')));
    await tester.pumpAndSettle();

    expect(repository.createCallCount, 0);
    expect(find.text('Ingresá un monto válido'), findsOneWidget);
  });

  testWidgets('create mode: a zero amount does not submit', (tester) async {
    final repository = _FakeRecurringRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/recurring/add');
    await tester.pumpAndSettle();

    await _fillValidForm(tester);
    await tester.enterText(
      find.byKey(const Key('recurring-form-amount-field')),
      '0',
    );

    await tester.tap(find.byKey(const Key('recurring-form-save-button')));
    await tester.pumpAndSettle();

    expect(repository.createCallCount, 0);
    expect(find.text('Ingresá un monto válido'), findsOneWidget);
  });
}
