import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:client_flutter/core/network/index.dart';
import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/features/budgets/data/index.dart';
import 'package:client_flutter/features/budgets/presentation/index.dart';
import 'package:client_flutter/features/categories/data/index.dart';
import 'package:client_flutter/features/movements/index.dart';
import 'package:client_flutter/shared/models/index.dart';

class _FixedMonthNotifier extends SelectedMonthNotifier {
  _FixedMonthNotifier(this._value);

  final MonthYear _value;

  @override
  MonthYear build() => _value;
}

class _FakeBudgetRepository extends BudgetRepository {
  _FakeBudgetRepository({
    this.budgets = const [],
    this.getAllError,
    this.createError,
    this.updateError,
    this.deleteError,
    this.gate,
    this.getAllGate,
  }) : super(Dio());

  final List<Budget> budgets;
  final Object? getAllError;
  final Object? createError;
  final Object? updateError;
  final Object? deleteError;
  final Completer<void>? gate;
  final Completer<void>? getAllGate;

  var getAllCallCount = 0;
  var createCallCount = 0;
  var updateCallCount = 0;
  var deleteCallCount = 0;
  ({String category, int month, int year, double limit})? lastCreate;
  ({
    String id,
    String? category,
    int? month,
    int? year,
    double? limit,
  })?
      lastUpdate;
  String? lastDeleteId;

  @override
  Future<List<Budget>> getAll({int? page, int? limit}) async {
    getAllCallCount++;
    final getAllGate = this.getAllGate;
    if (getAllGate != null) await getAllGate.future;
    final error = getAllError;
    if (error != null) throw error;
    return budgets;
  }

  @override
  Future<Budget> create({
    required String category,
    required int month,
    required int year,
    required double limit,
  }) async {
    createCallCount++;
    lastCreate = (category: category, month: month, year: year, limit: limit);
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = createError;
    if (error != null) throw error;
    return Budget(
      id: 'budget-created',
      category: category,
      month: month,
      year: year,
      limit: limit,
    );
  }

  @override
  Future<Budget> update(
    String id, {
    String? category,
    int? month,
    int? year,
    double? limit,
  }) async {
    updateCallCount++;
    lastUpdate = (id: id, category: category, month: month, year: year, limit: limit);
    final gate = this.gate;
    if (gate != null) await gate.future;
    final error = updateError;
    if (error != null) throw error;
    return Budget(
      id: id,
      category: category ?? 'cat-1',
      month: month ?? 7,
      year: year ?? 2026,
      limit: limit ?? 500,
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

class _FakeCategoryRepository extends CategoryRepository {
  _FakeCategoryRepository({this.categories = const []}) : super(Dio());

  final List<Category> categories;

  @override
  Future<List<Category>> getAll({int? page, int? limit}) async => categories;
}

Category _category({required String id, required String name}) => Category(
      id: id,
      description: 'desc',
      name: name,
      tag: 'food',
      type: CategoryType.variable,
    );

BudgetStatus _status({required Category category, required double limit}) =>
    BudgetStatus(
      category: category,
      limit: limit,
      spent: 100,
      remaining: limit - 100,
      percent: 20,
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
        path: '/budgets/add',
        builder: (context, state) =>
            BudgetFormScreen(initial: state.extra as BudgetStatus?),
      ),
    ],
  );
}

List<Override> _baseOverrides({
  required BudgetRepository budgetRepository,
  required _FakeCategoryRepository categoryRepository,
  MonthYear month = (month: 7, year: 2026),
}) =>
    [
      budgetRepositoryProvider.overrideWithValue(budgetRepository),
      categoryRepositoryProvider.overrideWithValue(categoryRepository),
      selectedMonthProvider.overrideWith(() => _FixedMonthNotifier(month)),
    ];

Future<void> _fillValidCreateForm(WidgetTester tester) async {
  await tester.tap(find.byKey(const Key('budget-form-category-field')));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Supermarket').last);
  await tester.pumpAndSettle();
  await tester.enterText(
    find.byKey(const Key('budget-form-limit-field')),
    '500',
  );
}

void main() {
  group('create mode', () {
    testWidgets('empty form does not submit', (tester) async {
      final budgetRepository = _FakeBudgetRepository();
      final categoryRepository = _FakeCategoryRepository(
        categories: [_category(id: 'cat-1', name: 'Supermarket')],
      );
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(
          overrides: _baseOverrides(
            budgetRepository: budgetRepository,
            categoryRepository: categoryRepository,
          ),
          router: router,
        ),
      );
      router.push('/budgets/add');
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('budget-form-save-button')));
      await tester.pumpAndSettle();

      expect(budgetRepository.createCallCount, 0);
    });

    testWidgets(
      'a valid submit calls create with the exact right fields and pops',
      (tester) async {
        final budgetRepository = _FakeBudgetRepository();
        final categoryRepository = _FakeCategoryRepository(
          categories: [_category(id: 'cat-1', name: 'Supermarket')],
        );
        final router = _buildRouter();

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add');
        await tester.pumpAndSettle();

        await _fillValidCreateForm(tester);

        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(budgetRepository.createCallCount, 1);
        expect(budgetRepository.lastCreate?.category, 'cat-1');
        expect(budgetRepository.lastCreate?.month, 7);
        expect(budgetRepository.lastCreate?.year, 2026);
        expect(budgetRepository.lastCreate?.limit, 500.0);
        expect(find.text('back-marker'), findsOneWidget);
        expect(find.byType(BudgetFormScreen), findsNothing);
      },
    );

    testWidgets(
      'a 400 duplicate-constraint ApiException shows the backend message '
      'via SnackBar',
      (tester) async {
        final budgetRepository = _FakeBudgetRepository(
          createError: const ApiException(
            message:
                'A budget already exists for this category in this month/year',
            statusCode: 400,
          ),
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [_category(id: 'cat-1', name: 'Supermarket')],
        );
        final router = _buildRouter();

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add');
        await tester.pumpAndSettle();

        await _fillValidCreateForm(tester);
        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(
          find.text(
            'A budget already exists for this category in this month/year',
          ),
          findsOneWidget,
        );
        expect(find.byType(BudgetFormScreen), findsOneWidget);
      },
    );

    testWidgets(
      'a non-ApiException failure on save is still caught and shows a '
      'fallback message',
      (tester) async {
        final budgetRepository = _FakeBudgetRepository(
          createError: Exception('boom'),
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [_category(id: 'cat-1', name: 'Supermarket')],
        );
        final router = _buildRouter();

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add');
        await tester.pumpAndSettle();

        await _fillValidCreateForm(tester);
        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(
          find.text('Ocurrió un error inesperado. Probá de nuevo.'),
          findsOneWidget,
        );
        expect(find.byType(BudgetFormScreen), findsOneWidget);
      },
    );

    testWidgets('a rapid double submit only triggers a single create call', (
      tester,
    ) async {
      final gate = Completer<void>();
      final budgetRepository = _FakeBudgetRepository(gate: gate);
      final categoryRepository = _FakeCategoryRepository(
        categories: [_category(id: 'cat-1', name: 'Supermarket')],
      );
      final router = _buildRouter();

      await tester.pumpWidget(
        _wrap(
          overrides: _baseOverrides(
            budgetRepository: budgetRepository,
            categoryRepository: categoryRepository,
          ),
          router: router,
        ),
      );
      router.push('/budgets/add');
      await tester.pumpAndSettle();

      await _fillValidCreateForm(tester);

      await tester.tap(find.byKey(const Key('budget-form-save-button')));
      await tester.pump();

      final button = tester.widget<FilledButton>(
        find.byKey(const Key('budget-form-save-button')),
      );
      expect(button.onPressed, isNull);

      await tester.tap(
        find.byKey(const Key('budget-form-save-button')),
        warnIfMissed: false,
      );
      await tester.pump();

      gate.complete();
      await tester.pumpAndSettle();

      expect(budgetRepository.createCallCount, 1);
    });

    testWidgets(
      'Month = 0 (out of range) does not submit and shows the month error',
      (tester) async {
        final budgetRepository = _FakeBudgetRepository();
        final categoryRepository = _FakeCategoryRepository(
          categories: [_category(id: 'cat-1', name: 'Supermarket')],
        );
        final router = _buildRouter();

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add');
        await tester.pumpAndSettle();

        await _fillValidCreateForm(tester);
        await tester.enterText(
          find.byKey(const Key('budget-form-month-field')),
          '0',
        );

        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(budgetRepository.createCallCount, 0);
        expect(find.text('Ingresá un mes válido (1-12)'), findsOneWidget);
      },
    );

    testWidgets(
      'Month = 13 (out of range) does not submit and shows the month error',
      (tester) async {
        final budgetRepository = _FakeBudgetRepository();
        final categoryRepository = _FakeCategoryRepository(
          categories: [_category(id: 'cat-1', name: 'Supermarket')],
        );
        final router = _buildRouter();

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add');
        await tester.pumpAndSettle();

        await _fillValidCreateForm(tester);
        await tester.enterText(
          find.byKey(const Key('budget-form-month-field')),
          '13',
        );

        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(budgetRepository.createCallCount, 0);
        expect(find.text('Ingresá un mes válido (1-12)'), findsOneWidget);
      },
    );

    testWidgets(
      'Year = 1999 (out of range) does not submit and shows the year error',
      (tester) async {
        final budgetRepository = _FakeBudgetRepository();
        final categoryRepository = _FakeCategoryRepository(
          categories: [_category(id: 'cat-1', name: 'Supermarket')],
        );
        final router = _buildRouter();

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add');
        await tester.pumpAndSettle();

        await _fillValidCreateForm(tester);
        await tester.enterText(
          find.byKey(const Key('budget-form-year-field')),
          '1999',
        );

        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(budgetRepository.createCallCount, 0);
        expect(find.text('Ingresá un año válido'), findsOneWidget);
      },
    );

    testWidgets(
      'Year = 2101 (out of range) does not submit and shows the year error',
      (tester) async {
        final budgetRepository = _FakeBudgetRepository();
        final categoryRepository = _FakeCategoryRepository(
          categories: [_category(id: 'cat-1', name: 'Supermarket')],
        );
        final router = _buildRouter();

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add');
        await tester.pumpAndSettle();

        await _fillValidCreateForm(tester);
        await tester.enterText(
          find.byKey(const Key('budget-form-year-field')),
          '2101',
        );

        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(budgetRepository.createCallCount, 0);
        expect(find.text('Ingresá un año válido'), findsOneWidget);
      },
    );

    testWidgets(
      'Limit = -5 (negative) does not submit and shows the limit error',
      (tester) async {
        final budgetRepository = _FakeBudgetRepository();
        final categoryRepository = _FakeCategoryRepository(
          categories: [_category(id: 'cat-1', name: 'Supermarket')],
        );
        final router = _buildRouter();

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add');
        await tester.pumpAndSettle();

        await _fillValidCreateForm(tester);
        await tester.enterText(
          find.byKey(const Key('budget-form-limit-field')),
          '-5',
        );

        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(budgetRepository.createCallCount, 0);
        expect(find.text('Ingresá un límite válido'), findsOneWidget);
      },
    );

    testWidgets(
      'Limit = "abc" (non-numeric) does not submit and shows the limit '
      'error',
      (tester) async {
        final budgetRepository = _FakeBudgetRepository();
        final categoryRepository = _FakeCategoryRepository(
          categories: [_category(id: 'cat-1', name: 'Supermarket')],
        );
        final router = _buildRouter();

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add');
        await tester.pumpAndSettle();

        await _fillValidCreateForm(tester);
        await tester.enterText(
          find.byKey(const Key('budget-form-limit-field')),
          'abc',
        );

        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(budgetRepository.createCallCount, 0);
        expect(find.text('Ingresá un límite válido'), findsOneWidget);
      },
    );
  });

  group('edit mode', () {
    testWidgets(
      'resolves the id via getAll matching category+month+year, then shows '
      'the form with Category/Month/Year read-only and only Limit editable',
      (tester) async {
        final gate = Completer<void>();
        final category = _category(id: 'cat-1', name: 'Supermarket');
        final budgetRepository = _FakeBudgetRepository(
          budgets: [
            const Budget(
              id: 'budget-1',
              category: 'cat-1',
              month: 7,
              year: 2026,
              limit: 500,
            ),
          ],
          getAllGate: gate,
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [category],
        );
        final router = _buildRouter();
        final initial = _status(category: category, limit: 500);

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add', extra: initial);

        // Resolution is in flight: a loading indicator, no interactive form.
        // The page-transition animation must finish (Offstage clears) before
        // the loading state is queryable via `find.byType`, which is safe to
        // pump through since `getAll` is gated and won't resolve on its own.
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 300));
        expect(find.byType(CircularProgressIndicator), findsOneWidget);
        expect(
          find.byKey(const Key('budget-form-save-button')),
          findsNothing,
        );

        gate.complete();
        await tester.pumpAndSettle();

        expect(budgetRepository.getAllCallCount, 1);
        expect(find.text('Editar presupuesto'), findsOneWidget);

        final categoryField = tester.widget<TextFormField>(
          find.byKey(const Key('budget-form-category-field')),
        );
        expect(categoryField.enabled, isFalse);

        final monthField = tester.widget<TextFormField>(
          find.byKey(const Key('budget-form-month-field')),
        );
        expect(monthField.enabled, isFalse);

        final yearField = tester.widget<TextFormField>(
          find.byKey(const Key('budget-form-year-field')),
        );
        expect(yearField.enabled, isFalse);

        final limitField = tester.widget<TextFormField>(
          find.byKey(const Key('budget-form-limit-field')),
        );
        expect(limitField.enabled, isNot(false));
      },
    );

    testWidgets(
      'a valid submit calls update with the RESOLVED id and only the '
      'changed Limit',
      (tester) async {
        final category = _category(id: 'cat-1', name: 'Supermarket');
        final budgetRepository = _FakeBudgetRepository(
          budgets: [
            const Budget(
              id: 'budget-1',
              category: 'cat-1',
              month: 7,
              year: 2026,
              limit: 500,
            ),
          ],
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [category],
        );
        final router = _buildRouter();
        final initial = _status(category: category, limit: 500);

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add', extra: initial);
        await tester.pumpAndSettle();

        await tester.enterText(
          find.byKey(const Key('budget-form-limit-field')),
          '750',
        );
        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(budgetRepository.updateCallCount, 1);
        expect(budgetRepository.lastUpdate?.id, 'budget-1');
        expect(budgetRepository.lastUpdate?.limit, 750.0);
        expect(budgetRepository.lastUpdate?.category, isNull);
        expect(budgetRepository.lastUpdate?.month, isNull);
        expect(budgetRepository.lastUpdate?.year, isNull);
        expect(find.text('back-marker'), findsOneWidget);
      },
    );

    testWidgets(
      'a valid submit calls update with the correct match id, not a decoy '
      'that only partially matches category/month/year',
      (tester) async {
        final category = _category(id: 'cat-1', name: 'Supermarket');
        final budgetRepository = _FakeBudgetRepository(
          budgets: [
            // Right category, wrong year.
            const Budget(
              id: 'budget-decoy-year',
              category: 'cat-1',
              month: 7,
              year: 2025,
              limit: 100,
            ),
            // Wrong category, right month/year.
            const Budget(
              id: 'budget-decoy-category',
              category: 'cat-2',
              month: 7,
              year: 2026,
              limit: 200,
            ),
            // The actual correct match: right category AND month AND year.
            const Budget(
              id: 'budget-correct-match',
              category: 'cat-1',
              month: 7,
              year: 2026,
              limit: 500,
            ),
          ],
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [category],
        );
        final router = _buildRouter();
        final initial = _status(category: category, limit: 500);

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add', extra: initial);
        await tester.pumpAndSettle();

        await tester.enterText(
          find.byKey(const Key('budget-form-limit-field')),
          '750',
        );
        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(budgetRepository.updateCallCount, 1);
        expect(budgetRepository.lastUpdate?.id, 'budget-correct-match');
        expect(budgetRepository.lastUpdate?.id, isNot('budget-decoy-year'));
        expect(
          budgetRepository.lastUpdate?.id,
          isNot('budget-decoy-category'),
        );
      },
    );

    testWidgets(
      'an ApiException failure on update shows the message via SnackBar '
      'without popping',
      (tester) async {
        final category = _category(id: 'cat-1', name: 'Supermarket');
        final budgetRepository = _FakeBudgetRepository(
          budgets: [
            const Budget(
              id: 'budget-1',
              category: 'cat-1',
              month: 7,
              year: 2026,
              limit: 500,
            ),
          ],
          updateError: const ApiException(message: 'Límite inválido'),
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [category],
        );
        final router = _buildRouter();
        final initial = _status(category: category, limit: 500);

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add', extra: initial);
        await tester.pumpAndSettle();

        await tester.enterText(
          find.byKey(const Key('budget-form-limit-field')),
          '750',
        );
        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(find.text('Límite inválido'), findsOneWidget);
        expect(find.byType(BudgetFormScreen), findsOneWidget);
      },
    );

    testWidgets(
      'a non-ApiException failure on update is still caught and shows a '
      'fallback message',
      (tester) async {
        final category = _category(id: 'cat-1', name: 'Supermarket');
        final budgetRepository = _FakeBudgetRepository(
          budgets: [
            const Budget(
              id: 'budget-1',
              category: 'cat-1',
              month: 7,
              year: 2026,
              limit: 500,
            ),
          ],
          updateError: Exception('boom'),
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [category],
        );
        final router = _buildRouter();
        final initial = _status(category: category, limit: 500);

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add', extra: initial);
        await tester.pumpAndSettle();

        await tester.enterText(
          find.byKey(const Key('budget-form-limit-field')),
          '750',
        );
        await tester.tap(find.byKey(const Key('budget-form-save-button')));
        await tester.pumpAndSettle();

        expect(
          find.text('Ocurrió un error inesperado. Probá de nuevo.'),
          findsOneWidget,
        );
        expect(find.byType(BudgetFormScreen), findsOneWidget);
      },
    );

    testWidgets(
      'a failed resolution shows an error/retry state and does not show '
      'an editable form',
      (tester) async {
        final category = _category(id: 'cat-1', name: 'Supermarket');
        final budgetRepository = _FakeBudgetRepository(
          getAllError: Exception('network down'),
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [category],
        );
        final router = _buildRouter();
        final initial = _status(category: category, limit: 500);

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add', extra: initial);
        await tester.pumpAndSettle();

        expect(find.byKey(const Key('error-retry-button')), findsOneWidget);
        expect(
          find.byKey(const Key('budget-form-save-button')),
          findsNothing,
        );
      },
    );

    testWidgets(
      'a no-match resolution shows an error/retry state and does not show '
      'an editable form, even when a similar-but-not-exact decoy exists',
      (tester) async {
        final category = _category(id: 'cat-1', name: 'Supermarket');
        final budgetRepository = _FakeBudgetRepository(
          budgets: [
            // Right category and month, but wrong year: almost matches but
            // must NOT be accepted as a substitute for the real match.
            const Budget(
              id: 'budget-almost-match',
              category: 'cat-1',
              month: 7,
              year: 2025,
              limit: 100,
            ),
          ],
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [category],
        );
        final router = _buildRouter();
        final initial = _status(category: category, limit: 500);

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add', extra: initial);
        await tester.pumpAndSettle();

        expect(find.byKey(const Key('error-retry-button')), findsOneWidget);
        expect(
          find.byKey(const Key('budget-form-save-button')),
          findsNothing,
        );
      },
    );

    testWidgets(
      'retry re-attempts the resolution and succeeds once data is available',
      (tester) async {
        final category = _category(id: 'cat-1', name: 'Supermarket');
        var shouldFail = true;
        final budgetRepository = _FakeBudgetRepository(
          budgets: [
            const Budget(
              id: 'budget-1',
              category: 'cat-1',
              month: 7,
              year: 2026,
              limit: 500,
            ),
          ],
        );
        final failingRepository = _FailingThenSucceedingRepository(
          delegate: budgetRepository,
          shouldFail: () => shouldFail,
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [category],
        );
        final router = _buildRouter();
        final initial = _status(category: category, limit: 500);

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: failingRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add', extra: initial);
        await tester.pumpAndSettle();

        expect(find.byKey(const Key('error-retry-button')), findsOneWidget);

        shouldFail = false;
        await tester.tap(find.byKey(const Key('error-retry-button')));
        await tester.pumpAndSettle();

        expect(find.text('Editar presupuesto'), findsOneWidget);
        expect(
          find.byKey(const Key('budget-form-save-button')),
          findsOneWidget,
        );
      },
    );

    testWidgets('delete confirm calls delete with the resolved id', (
      tester,
    ) async {
      final category = _category(id: 'cat-1', name: 'Supermarket');
      final budgetRepository = _FakeBudgetRepository(
        budgets: [
          const Budget(
            id: 'budget-1',
            category: 'cat-1',
            month: 7,
            year: 2026,
            limit: 500,
          ),
        ],
      );
      final categoryRepository = _FakeCategoryRepository(
        categories: [category],
      );
      final router = _buildRouter();
      final initial = _status(category: category, limit: 500);

      await tester.pumpWidget(
        _wrap(
          overrides: _baseOverrides(
            budgetRepository: budgetRepository,
            categoryRepository: categoryRepository,
          ),
          router: router,
        ),
      );
      router.push('/budgets/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('budget-form-delete-button')));
      await tester.pumpAndSettle();

      expect(find.text('¿Eliminar este presupuesto?'), findsOneWidget);

      await tester.tap(find.text('Eliminar'));
      await tester.pumpAndSettle();

      expect(budgetRepository.deleteCallCount, 1);
      expect(budgetRepository.lastDeleteId, 'budget-1');
      expect(find.text('back-marker'), findsOneWidget);
    });

    testWidgets(
      'delete confirm calls delete with the correct match id, not a decoy '
      'that only partially matches category/month/year',
      (tester) async {
        final category = _category(id: 'cat-1', name: 'Supermarket');
        final budgetRepository = _FakeBudgetRepository(
          budgets: [
            // Right category, wrong year.
            const Budget(
              id: 'budget-decoy-year',
              category: 'cat-1',
              month: 7,
              year: 2025,
              limit: 100,
            ),
            // Wrong category, right month/year.
            const Budget(
              id: 'budget-decoy-category',
              category: 'cat-2',
              month: 7,
              year: 2026,
              limit: 200,
            ),
            // The actual correct match: right category AND month AND year.
            const Budget(
              id: 'budget-correct-match',
              category: 'cat-1',
              month: 7,
              year: 2026,
              limit: 500,
            ),
          ],
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [category],
        );
        final router = _buildRouter();
        final initial = _status(category: category, limit: 500);

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add', extra: initial);
        await tester.pumpAndSettle();

        await tester.tap(find.byKey(const Key('budget-form-delete-button')));
        await tester.pumpAndSettle();
        await tester.tap(find.text('Eliminar'));
        await tester.pumpAndSettle();

        expect(budgetRepository.deleteCallCount, 1);
        expect(budgetRepository.lastDeleteId, 'budget-correct-match');
        expect(budgetRepository.lastDeleteId, isNot('budget-decoy-year'));
        expect(
          budgetRepository.lastDeleteId,
          isNot('budget-decoy-category'),
        );
      },
    );

    testWidgets('delete cancel does not call delete', (tester) async {
      final category = _category(id: 'cat-1', name: 'Supermarket');
      final budgetRepository = _FakeBudgetRepository(
        budgets: [
          const Budget(
            id: 'budget-1',
            category: 'cat-1',
            month: 7,
            year: 2026,
            limit: 500,
          ),
        ],
      );
      final categoryRepository = _FakeCategoryRepository(
        categories: [category],
      );
      final router = _buildRouter();
      final initial = _status(category: category, limit: 500);

      await tester.pumpWidget(
        _wrap(
          overrides: _baseOverrides(
            budgetRepository: budgetRepository,
            categoryRepository: categoryRepository,
          ),
          router: router,
        ),
      );
      router.push('/budgets/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('budget-form-delete-button')));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Cancelar'));
      await tester.pumpAndSettle();

      expect(budgetRepository.deleteCallCount, 0);
      expect(find.byType(BudgetFormScreen), findsOneWidget);
    });

    testWidgets(
      'an ApiException failure on delete shows the message via SnackBar '
      'without popping',
      (tester) async {
        final category = _category(id: 'cat-1', name: 'Supermarket');
        final budgetRepository = _FakeBudgetRepository(
          budgets: [
            const Budget(
              id: 'budget-1',
              category: 'cat-1',
              month: 7,
              year: 2026,
              limit: 500,
            ),
          ],
          deleteError: const ApiException(message: 'No se pudo eliminar'),
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [category],
        );
        final router = _buildRouter();
        final initial = _status(category: category, limit: 500);

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add', extra: initial);
        await tester.pumpAndSettle();

        await tester.tap(find.byKey(const Key('budget-form-delete-button')));
        await tester.pumpAndSettle();
        await tester.tap(find.text('Eliminar'));
        await tester.pumpAndSettle();

        expect(find.text('No se pudo eliminar'), findsOneWidget);
        expect(find.byType(BudgetFormScreen), findsOneWidget);
      },
    );

    testWidgets(
      'a non-ApiException failure on delete is still caught and shows a '
      'fallback message',
      (tester) async {
        final category = _category(id: 'cat-1', name: 'Supermarket');
        final budgetRepository = _FakeBudgetRepository(
          budgets: [
            const Budget(
              id: 'budget-1',
              category: 'cat-1',
              month: 7,
              year: 2026,
              limit: 500,
            ),
          ],
          deleteError: Exception('boom'),
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [category],
        );
        final router = _buildRouter();
        final initial = _status(category: category, limit: 500);

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add', extra: initial);
        await tester.pumpAndSettle();

        await tester.tap(find.byKey(const Key('budget-form-delete-button')));
        await tester.pumpAndSettle();
        await tester.tap(find.text('Eliminar'));
        await tester.pumpAndSettle();

        expect(
          find.text('Ocurrió un error inesperado. Probá de nuevo.'),
          findsOneWidget,
        );
        expect(find.byType(BudgetFormScreen), findsOneWidget);
      },
    );

    testWidgets('a rapid double delete-confirm only triggers a single delete call',
        (tester) async {
      final gate = Completer<void>();
      final category = _category(id: 'cat-1', name: 'Supermarket');
      final budgetRepository = _FakeBudgetRepository(
        budgets: [
          const Budget(
            id: 'budget-1',
            category: 'cat-1',
            month: 7,
            year: 2026,
            limit: 500,
          ),
        ],
        gate: gate,
      );
      final categoryRepository = _FakeCategoryRepository(
        categories: [category],
      );
      final router = _buildRouter();
      final initial = _status(category: category, limit: 500);

      await tester.pumpWidget(
        _wrap(
          overrides: _baseOverrides(
            budgetRepository: budgetRepository,
            categoryRepository: categoryRepository,
          ),
          router: router,
        ),
      );
      router.push('/budgets/add', extra: initial);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('budget-form-delete-button')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Eliminar'));
      await tester.pump();

      final button = tester.widget<IconButton>(
        find.byKey(const Key('budget-form-delete-button')),
      );
      expect(button.onPressed, isNull);

      await tester.tap(
        find.byKey(const Key('budget-form-delete-button')),
        warnIfMissed: false,
      );
      await tester.pump();

      gate.complete();
      await tester.pumpAndSettle();

      expect(budgetRepository.deleteCallCount, 1);
    });

    testWidgets(
      'a rapid double tap on the retry button only triggers a single '
      'additional getAll call',
      (tester) async {
        final gate = Completer<void>();
        final category = _category(id: 'cat-1', name: 'Supermarket');
        final budgetRepository = _FirstCallFailsThenGatesRepository(
          budgets: [
            const Budget(
              id: 'budget-1',
              category: 'cat-1',
              month: 7,
              year: 2026,
              limit: 500,
            ),
          ],
          gate: gate,
        );
        final categoryRepository = _FakeCategoryRepository(
          categories: [category],
        );
        final router = _buildRouter();
        final initial = _status(category: category, limit: 500);

        await tester.pumpWidget(
          _wrap(
            overrides: _baseOverrides(
              budgetRepository: budgetRepository,
              categoryRepository: categoryRepository,
            ),
            router: router,
          ),
        );
        router.push('/budgets/add', extra: initial);
        await tester.pumpAndSettle();

        expect(find.byKey(const Key('error-retry-button')), findsOneWidget);
        expect(budgetRepository.getAllCallCount, 1);

        // Both taps land before any frame is pumped, so both still hit the
        // same on-screen retry button — this is what actually exercises
        // the `_resolving` reentrancy guard (the screen only swaps away
        // from the retry button on the next rebuild, which hasn't happened
        // yet), unlike the disabled-button check used for submit/delete.
        await tester.tap(find.byKey(const Key('error-retry-button')));
        await tester.tap(find.byKey(const Key('error-retry-button')));
        await tester.pump();

        gate.complete();
        await tester.pumpAndSettle();

        // 1 automatic call from initState's failed resolution + 1 from the
        // retry — the second rapid tap must not add a third call.
        expect(budgetRepository.getAllCallCount, 2);
      },
    );
  });
}

/// Lets the "retry re-attempts resolution" test flip [getAll] from failing
/// to succeeding without needing a second, separately-scripted repository.
class _FailingThenSucceedingRepository extends BudgetRepository {
  _FailingThenSucceedingRepository({
    required this.delegate,
    required this.shouldFail,
  }) : super(Dio());

  final _FakeBudgetRepository delegate;
  final bool Function() shouldFail;

  @override
  Future<List<Budget>> getAll({int? page, int? limit}) async {
    delegate.getAllCallCount++;
    if (shouldFail()) throw Exception('network down');
    return delegate.budgets;
  }

  @override
  Future<Budget> update(
    String id, {
    String? category,
    int? month,
    int? year,
    double? limit,
  }) =>
      delegate.update(id, category: category, month: month, year: year, limit: limit);

  @override
  Future<void> delete(String id) => delegate.delete(id);

  @override
  Future<Budget> create({
    required String category,
    required int month,
    required int year,
    required double limit,
  }) =>
      delegate.create(category: category, month: month, year: year, limit: limit);
}

/// Fails the very first `getAll` call synchronously (so the screen reaches
/// its error/retry state deterministically during `initState`), then gates
/// every subsequent call on [gate] so a rapid double-tap on the retry
/// button can be observed mid-flight.
class _FirstCallFailsThenGatesRepository extends BudgetRepository {
  _FirstCallFailsThenGatesRepository({
    required this.budgets,
    required this.gate,
  }) : super(Dio());

  final List<Budget> budgets;
  final Completer<void> gate;

  var getAllCallCount = 0;

  @override
  Future<List<Budget>> getAll({int? page, int? limit}) async {
    getAllCallCount++;
    if (getAllCallCount == 1) {
      throw Exception('network down');
    }
    await gate.future;
    return budgets;
  }
}
