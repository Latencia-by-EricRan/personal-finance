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
  _FakeAccountRepository({
    this.createError,
    this.updateError,
    this.archiveError,
    this.gate,
  }) : super(Dio());

  final Object? createError;
  final Object? updateError;
  final Object? archiveError;
  final Completer<void>? gate;

  var createCallCount = 0;
  var updateCallCount = 0;
  var archiveCallCount = 0;
  ({String name, AccountType type, String? currency, String? icon})?
  lastCreateArgs;
  String? lastUpdateId;
  ({String? name, AccountType? type, String? currency, String? icon, bool? archived})?
  lastUpdateArgs;
  String? lastArchiveId;

  @override
  Future<Account> create({
    required String name,
    required AccountType type,
    String? currency,
    String? icon,
  }) async {
    createCallCount++;
    lastCreateArgs = (name: name, type: type, currency: currency, icon: icon);
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = createError;
    if (error != null) throw error;
    return Account(
      id: 'acc-created',
      name: name,
      type: type,
      currency: currency ?? 'ARS',
      icon: icon,
      archived: false,
    );
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
    lastUpdateArgs = (
      name: name,
      type: type,
      currency: currency,
      icon: icon,
      archived: archived,
    );
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = updateError;
    if (error != null) throw error;
    return Account(
      id: id,
      name: name ?? 'irrelevant',
      type: type ?? AccountType.banco,
      currency: currency ?? 'ARS',
      icon: icon,
      archived: archived ?? false,
    );
  }

  @override
  Future<Account> archive(String id) async {
    archiveCallCount++;
    lastArchiveId = id;
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = archiveError;
    if (error != null) throw error;
    return Account(
      id: id,
      name: 'irrelevant',
      type: AccountType.banco,
      currency: 'ARS',
      archived: true,
    );
  }
}

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
        path: '/accounts/add',
        builder: (context, state) =>
            AccountFormScreen(initial: state.extra as Account?),
      ),
    ],
  );
}

void main() {
  testWidgets('create mode: renders the create title with no archive button', (
    tester,
  ) async {
    final repository = _FakeAccountRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
        router: router,
      ),
    );
    router.push('/accounts/add');
    await tester.pumpAndSettle();

    expect(find.text('Nueva cuenta'), findsOneWidget);
    expect(
      find.byKey(const Key('account-form-archive-button')),
      findsNothing,
    );
  });

  testWidgets('create mode: currency field defaults to ARS', (tester) async {
    final repository = _FakeAccountRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
        router: router,
      ),
    );
    router.push('/accounts/add');
    await tester.pumpAndSettle();

    expect(
      tester
          .widget<TextFormField>(
            find.byKey(const Key('account-form-currency-field')),
          )
          .controller
          ?.text,
      'ARS',
    );
  });

  testWidgets('create mode: empty name does not submit', (tester) async {
    final repository = _FakeAccountRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
        router: router,
      ),
    );
    router.push('/accounts/add');
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('account-form-save-button')));
    await tester.pumpAndSettle();

    expect(repository.createCallCount, 0);
    expect(find.text('Ingresá un nombre'), findsOneWidget);
  });

  testWidgets('create mode: empty currency does not submit', (tester) async {
    final repository = _FakeAccountRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
        router: router,
      ),
    );
    router.push('/accounts/add');
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(const Key('account-form-name-field')),
      'Cuenta nueva',
    );
    await tester.enterText(
      find.byKey(const Key('account-form-currency-field')),
      '',
    );
    await tester.tap(find.byKey(const Key('account-form-save-button')));
    await tester.pumpAndSettle();

    expect(repository.createCallCount, 0);
    expect(find.text('Ingresá una moneda'), findsOneWidget);
  });

  testWidgets(
    'create mode: a valid submit calls create with the right fields and pops',
    (tester) async {
      final repository = _FakeAccountRepository();
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
          router: router,
        ),
      );
      router.push('/accounts/add');
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('account-form-name-field')),
        'Cuenta nueva',
      );
      await tester.tap(find.byKey(const Key('account-form-save-button')));
      await tester.pumpAndSettle();

      expect(repository.createCallCount, 1);
      expect(repository.lastCreateArgs?.name, 'Cuenta nueva');
      expect(repository.lastCreateArgs?.type, AccountType.efectivo);
      expect(repository.lastCreateArgs?.currency, 'ARS');
      expect(find.text('back-marker'), findsOneWidget);
      expect(find.byType(AccountFormScreen), findsNothing);
    },
  );

  testWidgets('edit mode: form is pre-filled from initial', (tester) async {
    final repository = _FakeAccountRepository();
    final router = _buildRouter();
    const initial = Account(
      id: 'acc-1',
      name: 'Cuenta sueldo',
      type: AccountType.tarjeta,
      currency: 'USD',
      archived: false,
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
        router: router,
      ),
    );
    router.push('/accounts/add', extra: initial);
    await tester.pumpAndSettle();

    expect(find.text('Editar cuenta'), findsOneWidget);
    expect(
      tester
          .widget<TextFormField>(
            find.byKey(const Key('account-form-name-field')),
          )
          .controller
          ?.text,
      'Cuenta sueldo',
    );
    expect(
      tester
          .widget<TextFormField>(
            find.byKey(const Key('account-form-currency-field')),
          )
          .controller
          ?.text,
      'USD',
    );
    expect(
      find.byKey(const Key('account-form-archive-button')),
      findsOneWidget,
    );
  });

  testWidgets(
    'edit mode: a valid submit calls update with the right id and fields',
    (tester) async {
      final repository = _FakeAccountRepository();
      final router = _buildRouter();
      const initial = Account(
        id: 'acc-1',
        name: 'Cuenta sueldo',
        type: AccountType.banco,
        currency: 'ARS',
        archived: false,
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
          router: router,
        ),
      );
      router.push('/accounts/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('account-form-name-field')),
        'Cuenta renombrada',
      );
      await tester.tap(find.byKey(const Key('account-form-save-button')));
      await tester.pumpAndSettle();

      expect(repository.updateCallCount, 1);
      expect(repository.lastUpdateId, 'acc-1');
      expect(repository.lastUpdateArgs?.name, 'Cuenta renombrada');
      expect(find.text('back-marker'), findsOneWidget);
    },
  );

  testWidgets(
    'archive: confirming the dialog calls archive and pops',
    (tester) async {
      final repository = _FakeAccountRepository();
      final router = _buildRouter();
      const initial = Account(
        id: 'acc-1',
        name: 'Cuenta sueldo',
        type: AccountType.banco,
        currency: 'ARS',
        archived: false,
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
          router: router,
        ),
      );
      router.push('/accounts/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('account-form-archive-button')));
      await tester.pumpAndSettle();

      expect(
        find.text('¿Archivar esta cuenta? Podés restaurarla después.'),
        findsOneWidget,
      );

      await tester.tap(find.text('Archivar'));
      await tester.pumpAndSettle();

      expect(repository.archiveCallCount, 1);
      expect(repository.lastArchiveId, 'acc-1');
      expect(find.text('back-marker'), findsOneWidget);
    },
  );

  testWidgets(
    'archive: cancelling the dialog does not call archive',
    (tester) async {
      final repository = _FakeAccountRepository();
      final router = _buildRouter();
      const initial = Account(
        id: 'acc-1',
        name: 'Cuenta sueldo',
        type: AccountType.banco,
        currency: 'ARS',
        archived: false,
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
          router: router,
        ),
      );
      router.push('/accounts/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('account-form-archive-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Cancelar'));
      await tester.pumpAndSettle();

      expect(repository.archiveCallCount, 0);
      expect(find.byType(AccountFormScreen), findsOneWidget);
    },
  );

  testWidgets('a rapid double submit only triggers a single create call', (
    tester,
  ) async {
    final gate = Completer<void>();
    final repository = _FakeAccountRepository(gate: gate);
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(
        overrides: [accountRepositoryProvider.overrideWithValue(repository)],
        router: router,
      ),
    );
    router.push('/accounts/add');
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(const Key('account-form-name-field')),
      'Cuenta nueva',
    );

    await tester.tap(find.byKey(const Key('account-form-save-button')));
    await tester.pump();

    final button = tester.widget<FilledButton>(
      find.byKey(const Key('account-form-save-button')),
    );
    expect(button.onPressed, isNull);

    await tester.tap(
      find.byKey(const Key('account-form-save-button')),
      warnIfMissed: false,
    );
    await tester.pump();

    gate.complete();
    await tester.pumpAndSettle();

    expect(repository.createCallCount, 1);
  });

  testWidgets(
    'a rapid double archive-confirm only triggers a single archive call',
    (tester) async {
      final gate = Completer<void>();
      final repository = _FakeAccountRepository(gate: gate);
      final router = _buildRouter();
      const initial = Account(
        id: 'acc-1',
        name: 'Cuenta sueldo',
        type: AccountType.banco,
        currency: 'ARS',
        archived: false,
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
          router: router,
        ),
      );
      router.push('/accounts/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('account-form-archive-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Archivar'));
      await tester.pump();

      final button = tester.widget<IconButton>(
        find.byKey(const Key('account-form-archive-button')),
      );
      expect(button.onPressed, isNull);

      await tester.tap(
        find.byKey(const Key('account-form-archive-button')),
        warnIfMissed: false,
      );
      await tester.pump();

      gate.complete();
      await tester.pumpAndSettle();

      expect(repository.archiveCallCount, 1);
    },
  );

  testWidgets(
    'an ApiException failure on save shows the message via SnackBar without crashing',
    (tester) async {
      final repository = _FakeAccountRepository(
        createError: const ApiException(message: 'Nombre inválido'),
      );
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
          router: router,
        ),
      );
      router.push('/accounts/add');
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('account-form-name-field')),
        'Cuenta nueva',
      );
      await tester.tap(find.byKey(const Key('account-form-save-button')));
      await tester.pumpAndSettle();

      expect(find.text('Nombre inválido'), findsOneWidget);
      expect(find.byType(AccountFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'a non-ApiException failure on save is caught and shows a fallback message',
    (tester) async {
      final repository = _FakeAccountRepository(createError: Exception('boom'));
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
          router: router,
        ),
      );
      router.push('/accounts/add');
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('account-form-name-field')),
        'Cuenta nueva',
      );
      await tester.tap(find.byKey(const Key('account-form-save-button')));
      await tester.pumpAndSettle();

      expect(
        find.text('Ocurrió un error inesperado. Probá de nuevo.'),
        findsOneWidget,
      );
      expect(find.byType(AccountFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'edit mode: an ApiException failure on update shows the message via SnackBar',
    (tester) async {
      final repository = _FakeAccountRepository(
        updateError: const ApiException(message: 'No se pudo actualizar'),
      );
      final router = _buildRouter();
      const initial = Account(
        id: 'acc-1',
        name: 'Cuenta sueldo',
        type: AccountType.banco,
        currency: 'ARS',
        archived: false,
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
          router: router,
        ),
      );
      router.push('/accounts/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('account-form-save-button')));
      await tester.pumpAndSettle();

      expect(find.text('No se pudo actualizar'), findsOneWidget);
      expect(find.byType(AccountFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'edit mode: a non-ApiException failure on update shows a fallback message',
    (tester) async {
      final repository = _FakeAccountRepository(
        updateError: Exception('boom'),
      );
      final router = _buildRouter();
      const initial = Account(
        id: 'acc-1',
        name: 'Cuenta sueldo',
        type: AccountType.banco,
        currency: 'ARS',
        archived: false,
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
          router: router,
        ),
      );
      router.push('/accounts/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('account-form-save-button')));
      await tester.pumpAndSettle();

      expect(
        find.text('Ocurrió un error inesperado. Probá de nuevo.'),
        findsOneWidget,
      );
      expect(find.byType(AccountFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'archive: an ApiException failure shows the message via SnackBar without popping',
    (tester) async {
      final repository = _FakeAccountRepository(
        archiveError: const ApiException(message: 'No se pudo archivar'),
      );
      final router = _buildRouter();
      const initial = Account(
        id: 'acc-1',
        name: 'Cuenta sueldo',
        type: AccountType.banco,
        currency: 'ARS',
        archived: false,
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
          router: router,
        ),
      );
      router.push('/accounts/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('account-form-archive-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Archivar'));
      await tester.pumpAndSettle();

      expect(find.text('No se pudo archivar'), findsOneWidget);
      expect(find.byType(AccountFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'archive: a non-ApiException failure is caught and shows a fallback message',
    (tester) async {
      final repository = _FakeAccountRepository(
        archiveError: Exception('boom'),
      );
      final router = _buildRouter();
      const initial = Account(
        id: 'acc-1',
        name: 'Cuenta sueldo',
        type: AccountType.banco,
        currency: 'ARS',
        archived: false,
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            accountRepositoryProvider.overrideWithValue(repository),
          ],
          router: router,
        ),
      );
      router.push('/accounts/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('account-form-archive-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Archivar'));
      await tester.pumpAndSettle();

      expect(
        find.text('Ocurrió un error inesperado. Probá de nuevo.'),
        findsOneWidget,
      );
      expect(find.byType(AccountFormScreen), findsOneWidget);
    },
  );
}
