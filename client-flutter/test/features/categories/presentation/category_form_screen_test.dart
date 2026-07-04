import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/features/categories/data/index.dart';
import 'package:client_flutter/features/categories/presentation/index.dart';
import 'package:client_flutter/shared/models/index.dart';

class _FakeCategoryRepository extends CategoryRepository {
  _FakeCategoryRepository({this.upsertError, this.deleteError, this.gate})
      : super(Dio());

  final Object? upsertError;
  final Object? deleteError;
  final Completer<void>? gate;

  var upsertCallCount = 0;
  var deleteCallCount = 0;
  ({
    String name,
    String description,
    CategoryType type,
    String? tag,
    String? icon,
  })? lastUpsert;
  String? lastDeleteId;

  @override
  Future<Category> upsert({
    required String name,
    required String description,
    required CategoryType type,
    String? tag,
    String? icon,
  }) async {
    upsertCallCount++;
    lastUpsert = (
      name: name,
      description: description,
      type: type,
      tag: tag,
      icon: icon,
    );
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = upsertError;
    if (error != null) throw error;
    return Category(
      id: 'cat-created',
      description: description,
      name: name,
      tag: tag ?? '',
      type: type,
      icon: icon,
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
        path: '/categories/add',
        builder: (context, state) =>
            CategoryFormScreen(initial: state.extra as Category?),
      ),
    ],
  );
}

List<Override> _baseOverrides(_FakeCategoryRepository repository) => [
      categoryRepositoryProvider.overrideWithValue(repository),
    ];

Future<void> _fillValidForm(WidgetTester tester) async {
  await tester.enterText(
    find.byKey(const Key('category-form-name-field')),
    'Supermercado',
  );
  await tester.enterText(
    find.byKey(const Key('category-form-description-field')),
    'Groceries',
  );
}

void main() {
  testWidgets('create mode: empty form does not submit', (tester) async {
    final repository = _FakeCategoryRepository();
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/categories/add');
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('category-form-save-button')));
    await tester.pumpAndSettle();

    expect(repository.upsertCallCount, 0);
    expect(find.text('Ingresá un nombre'), findsOneWidget);
    expect(find.text('Ingresá una descripción'), findsOneWidget);
  });

  testWidgets(
    'create mode: a valid submit calls upsert with the right fields and pops',
    (tester) async {
      final repository = _FakeCategoryRepository();
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/categories/add');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);

      await tester.tap(find.byKey(const Key('category-form-save-button')));
      await tester.pumpAndSettle();

      expect(repository.upsertCallCount, 1);
      expect(repository.lastUpsert?.name, 'Supermercado');
      expect(repository.lastUpsert?.description, 'Groceries');
      expect(repository.lastUpsert?.type, CategoryType.variable);
      expect(repository.lastUpsert?.tag, isNull);
      expect(repository.lastUpsert?.icon, isNull);
      expect(find.text('back-marker'), findsOneWidget);
      expect(find.byType(CategoryFormScreen), findsNothing);
    },
  );

  testWidgets(
    'create mode: tag and icon are sent when filled in, type follows the '
    'segmented selection',
    (tester) async {
      final repository = _FakeCategoryRepository();
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/categories/add');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);
      await tester.enterText(
        find.byKey(const Key('category-form-tag-field')),
        'food',
      );
      await tester.enterText(
        find.byKey(const Key('category-form-icon-field')),
        '🛒',
      );
      await tester.tap(find.text('Fijo'));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('category-form-save-button')));
      await tester.pumpAndSettle();

      expect(repository.lastUpsert?.tag, 'food');
      expect(repository.lastUpsert?.icon, '🛒');
      expect(repository.lastUpsert?.type, CategoryType.fijo);
    },
  );

  testWidgets(
    'edit mode with an existing tag: the tag field is locked, name stays '
    'editable, and submit sends the original tag unchanged',
    (tester) async {
      final repository = _FakeCategoryRepository();
      final router = _buildRouter();
      const initial = Category(
        id: 'cat-1',
        description: 'Groceries',
        name: 'Supermercado',
        tag: 'food',
        type: CategoryType.variable,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/categories/add', extra: initial);
      await tester.pumpAndSettle();

      expect(find.text('Editar categoría'), findsOneWidget);

      final tagField = tester.widget<TextFormField>(
        find.byKey(const Key('category-form-tag-field')),
      );
      expect(tagField.enabled, isFalse);

      final nameField = tester.widget<TextFormField>(
        find.byKey(const Key('category-form-name-field')),
      );
      expect(nameField.enabled, isTrue);

      await tester.enterText(
        find.byKey(const Key('category-form-name-field')),
        'Super nuevo',
      );

      await tester.tap(find.byKey(const Key('category-form-save-button')));
      await tester.pumpAndSettle();

      expect(repository.upsertCallCount, 1);
      expect(repository.lastUpsert?.name, 'Super nuevo');
      expect(repository.lastUpsert?.tag, 'food');
      expect(find.text('back-marker'), findsOneWidget);
    },
  );

  testWidgets(
    'edit mode with no existing tag: the name field is locked, tag stays '
    'editable, and submit sends the original name unchanged',
    (tester) async {
      final repository = _FakeCategoryRepository();
      final router = _buildRouter();
      const initial = Category(
        id: 'cat-2',
        description: 'Transport',
        name: 'Transporte',
        tag: '',
        type: CategoryType.variable,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/categories/add', extra: initial);
      await tester.pumpAndSettle();

      final nameField = tester.widget<TextFormField>(
        find.byKey(const Key('category-form-name-field')),
      );
      expect(nameField.enabled, isFalse);

      final tagField = tester.widget<TextFormField>(
        find.byKey(const Key('category-form-tag-field')),
      );
      expect(tagField.enabled, isTrue);

      await tester.enterText(
        find.byKey(const Key('category-form-tag-field')),
        'transport',
      );

      await tester.tap(find.byKey(const Key('category-form-save-button')));
      await tester.pumpAndSettle();

      expect(repository.upsertCallCount, 1);
      expect(repository.lastUpsert?.name, 'Transporte');
      expect(repository.lastUpsert?.tag, 'transport');
    },
  );

  testWidgets(
    'delete: confirming the dialog calls delete and pops',
    (tester) async {
      final repository = _FakeCategoryRepository();
      final router = _buildRouter();
      const initial = Category(
        id: 'cat-1',
        description: 'Groceries',
        name: 'Supermercado',
        tag: 'food',
        type: CategoryType.variable,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/categories/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('category-form-delete-button')));
      await tester.pumpAndSettle();

      expect(find.text('¿Eliminar esta categoría?'), findsOneWidget);

      await tester.tap(find.text('Eliminar'));
      await tester.pumpAndSettle();

      expect(repository.deleteCallCount, 1);
      expect(repository.lastDeleteId, 'cat-1');
      expect(find.text('back-marker'), findsOneWidget);
    },
  );

  testWidgets(
    'delete: cancelling the dialog does not call delete',
    (tester) async {
      final repository = _FakeCategoryRepository();
      final router = _buildRouter();
      const initial = Category(
        id: 'cat-1',
        description: 'Groceries',
        name: 'Supermercado',
        tag: 'food',
        type: CategoryType.variable,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/categories/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('category-form-delete-button')));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Cancelar'));
      await tester.pumpAndSettle();

      expect(repository.deleteCallCount, 0);
      expect(find.byType(CategoryFormScreen), findsOneWidget);
    },
  );

  testWidgets('a rapid double submit only triggers a single upsert call', (
    tester,
  ) async {
    final gate = Completer<void>();
    final repository = _FakeCategoryRepository(gate: gate);
    final router = _buildRouter();

    await tester.pumpWidget(
      _wrap(overrides: _baseOverrides(repository), router: router),
    );
    router.push('/categories/add');
    await tester.pumpAndSettle();

    await _fillValidForm(tester);

    await tester.tap(find.byKey(const Key('category-form-save-button')));
    await tester.pump();

    final button = tester.widget<FilledButton>(
      find.byKey(const Key('category-form-save-button')),
    );
    expect(button.onPressed, isNull);

    await tester.tap(
      find.byKey(const Key('category-form-save-button')),
      warnIfMissed: false,
    );
    await tester.pump();

    gate.complete();
    await tester.pumpAndSettle();

    expect(repository.upsertCallCount, 1);
  });

  testWidgets(
    'a rapid double delete-confirm only triggers a single delete call',
    (tester) async {
      final gate = Completer<void>();
      final repository = _FakeCategoryRepository(gate: gate);
      final router = _buildRouter();
      const initial = Category(
        id: 'cat-1',
        description: 'Groceries',
        name: 'Supermercado',
        tag: 'food',
        type: CategoryType.variable,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/categories/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('category-form-delete-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Eliminar'));
      await tester.pump();

      final button = tester.widget<IconButton>(
        find.byKey(const Key('category-form-delete-button')),
      );
      expect(button.onPressed, isNull);

      await tester.tap(
        find.byKey(const Key('category-form-delete-button')),
        warnIfMissed: false,
      );
      await tester.pump();

      gate.complete();
      await tester.pumpAndSettle();

      expect(repository.deleteCallCount, 1);
    },
  );

  testWidgets(
    'an ApiException failure on save shows the message via SnackBar without '
    'crashing',
    (tester) async {
      final repository = _FakeCategoryRepository(
        upsertError: const ApiException(message: 'Nombre inválido'),
      );
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/categories/add');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);
      await tester.tap(find.byKey(const Key('category-form-save-button')));
      await tester.pumpAndSettle();

      expect(find.text('Nombre inválido'), findsOneWidget);
      expect(find.byType(CategoryFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'a non-ApiException failure on save is still caught and shows a '
    'fallback message',
    (tester) async {
      final repository = _FakeCategoryRepository(
        upsertError: Exception('boom'),
      );
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/categories/add');
      await tester.pumpAndSettle();

      await _fillValidForm(tester);
      await tester.tap(find.byKey(const Key('category-form-save-button')));
      await tester.pumpAndSettle();

      expect(
        find.text('Ocurrió un error inesperado. Probá de nuevo.'),
        findsOneWidget,
      );
      expect(find.byType(CategoryFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'delete: an ApiException failure shows the message via SnackBar without '
    'popping',
    (tester) async {
      final repository = _FakeCategoryRepository(
        deleteError: const ApiException(message: 'No se pudo eliminar'),
      );
      final router = _buildRouter();
      const initial = Category(
        id: 'cat-1',
        description: 'Groceries',
        name: 'Supermercado',
        tag: 'food',
        type: CategoryType.variable,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/categories/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('category-form-delete-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Eliminar'));
      await tester.pumpAndSettle();

      expect(find.text('No se pudo eliminar'), findsOneWidget);
      expect(find.byType(CategoryFormScreen), findsOneWidget);
    },
  );

  testWidgets(
    'delete: a non-ApiException failure is still caught and shows a '
    'fallback message',
    (tester) async {
      final repository = _FakeCategoryRepository(
        deleteError: Exception('boom'),
      );
      final router = _buildRouter();
      const initial = Category(
        id: 'cat-1',
        description: 'Groceries',
        name: 'Supermercado',
        tag: 'food',
        type: CategoryType.variable,
      );

      await tester.pumpWidget(
        _wrap(overrides: _baseOverrides(repository), router: router),
      );
      router.push('/categories/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('category-form-delete-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Eliminar'));
      await tester.pumpAndSettle();

      expect(
        find.text('Ocurrió un error inesperado. Probá de nuevo.'),
        findsOneWidget,
      );
      expect(find.byType(CategoryFormScreen), findsOneWidget);
    },
  );
}
