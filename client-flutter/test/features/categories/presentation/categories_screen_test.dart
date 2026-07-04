import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/features/categories/data/index.dart';
import 'package:client_flutter/features/categories/presentation/index.dart';
import 'package:client_flutter/shared/models/index.dart';
import 'package:client_flutter/shared/widgets/index.dart';

class _FakeCategoryRepository extends CategoryRepository {
  _FakeCategoryRepository({this.categoriesResult = const [], this.error})
      : super(Dio());

  final List<Category> categoriesResult;
  final Object? error;
  var getAllCallCount = 0;

  @override
  Future<List<Category>> getAll({int? page, int? limit}) async {
    getAllCallCount++;
    final error = this.error;
    if (error != null) throw error;
    return categoriesResult;
  }
}

Category _category({
  required String id,
  required String name,
  CategoryType type = CategoryType.variable,
  String tag = '',
}) =>
    Category(id: id, description: name, name: name, tag: tag, type: type);

Widget _wrap({required List<Override> overrides}) {
  final router = GoRouter(
    initialLocation: '/categories',
    routes: [
      GoRoute(
        path: '/categories',
        builder: (context, state) => const CategoriesScreen(),
      ),
      GoRoute(
        path: '/categories/add',
        builder: (context, state) {
          final extra = state.extra;
          return Scaffold(
            body: Text(
              extra == null
                  ? 'category-form-create-marker'
                  : 'category-form-edit-marker:${(extra as Category).id}',
            ),
          );
        },
      ),
    ],
  );
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp.router(theme: AppTheme.dark, routerConfig: router),
  );
}

void main() {
  testWidgets('renders one row per category with name, type label and tag', (
    tester,
  ) async {
    final repository = _FakeCategoryRepository(
      categoriesResult: [
        _category(id: 'c1', name: 'Supermercado', tag: 'food'),
        _category(
          id: 'c2',
          name: 'Alquiler',
          type: CategoryType.fijo,
        ),
      ],
    );

    await tester.pumpWidget(
      _wrap(
        overrides: [categoryRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('category-card-c1')), findsOneWidget);
    expect(find.byKey(const Key('category-card-c2')), findsOneWidget);
    expect(find.text('Supermercado'), findsOneWidget);
    expect(find.text('Alquiler'), findsOneWidget);
    expect(find.text('Variable'), findsOneWidget);
    expect(find.text('Fijo'), findsOneWidget);
    expect(find.text('food'), findsOneWidget);
  });

  testWidgets(
    "the category avatar's color matches the categoryPalette hash used by MovementTile",
    (tester) async {
      final category = _category(id: 'c1', name: 'Supermercado', tag: 'food');
      final repository = _FakeCategoryRepository(categoriesResult: [category]);

      await tester.pumpWidget(
        _wrap(
          overrides: [
            categoryRepositoryProvider.overrideWithValue(repository),
          ],
        ),
      );
      await tester.pumpAndSettle();

      final container = tester.widget<Container>(
        find.byKey(const Key('category-avatar-c1')),
      );
      final decoration = container.decoration! as BoxDecoration;
      final expectedKey = category.id ?? category.tag;
      final expectedColor = AppColors.categoryPalette[
          expectedKey.hashCode.abs() % AppColors.categoryPalette.length];
      expect(decoration.color, expectedColor);
    },
  );

  testWidgets(
    'the category avatar falls back to a 1-letter monogram for a short name',
    (tester) async {
      final category = _category(id: 'c9', name: 'A');
      final repository = _FakeCategoryRepository(categoriesResult: [category]);

      await tester.pumpWidget(
        _wrap(
          overrides: [
            categoryRepositoryProvider.overrideWithValue(repository),
          ],
        ),
      );
      await tester.pumpAndSettle();

      expect(
        find.descendant(
          of: find.byKey(const Key('category-avatar-c9')),
          matching: find.text('A'),
        ),
        findsOneWidget,
      );
    },
  );

  testWidgets('tapping "+" navigates to /categories/add with no extra', (
    tester,
  ) async {
    final repository = _FakeCategoryRepository(categoriesResult: const []);

    await tester.pumpWidget(
      _wrap(
        overrides: [categoryRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('categories-add-button')));
    await tester.pumpAndSettle();

    expect(find.text('category-form-create-marker'), findsOneWidget);
  });

  testWidgets(
    'tapping a category row navigates to /categories/add with that category as extra',
    (tester) async {
      final repository = _FakeCategoryRepository(
        categoriesResult: [_category(id: 'c1', name: 'Supermercado')],
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            categoryRepositoryProvider.overrideWithValue(repository),
          ],
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('category-card-c1')));
      await tester.pumpAndSettle();

      expect(find.text('category-form-edit-marker:c1'), findsOneWidget);
    },
  );

  testWidgets('shows the empty state when there are no categories', (
    tester,
  ) async {
    final repository = _FakeCategoryRepository(categoriesResult: const []);

    await tester.pumpWidget(
      _wrap(
        overrides: [categoryRepositoryProvider.overrideWithValue(repository)],
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(EmptyState), findsOneWidget);
  });

  testWidgets(
    'shows the error-retry state when the categories fetch fails and refetches on retry',
    (tester) async {
      final repository = _FakeCategoryRepository(
        error: Exception('network down'),
      );

      await tester.pumpWidget(
        _wrap(
          overrides: [
            categoryRepositoryProvider.overrideWithValue(repository),
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
}
