import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/features/accounts/data/index.dart';
import 'package:client_flutter/shared/models/index.dart';
import 'package:client_flutter/shared/widgets/index.dart';

Widget _wrap(Widget child, {List<Account> accounts = const []}) {
  return ProviderScope(
    overrides: [
      accountsProvider.overrideWith((ref) async => accounts),
    ],
    child: MaterialApp(theme: AppTheme.dark, home: Scaffold(body: child)),
  );
}

const _category = Category(
  id: 'cat-1',
  description: 'Groceries',
  name: 'Supermercado',
  tag: 'food',
  type: CategoryType.variable,
);

const _account = Account(
  id: 'acc-1',
  name: 'Cuenta sueldo',
  type: AccountType.banco,
  currency: 'ARS',
  archived: false,
);

void main() {
  testWidgets('shows an income movement with a plus sign and category monogram',
      (
    tester,
  ) async {
    final movement = Movement(
      id: 'mv-1',
      amount: 185000,
      category: _category,
      date: DateTime(2026, 7, 1),
      type: MovementType.ingreso,
      account: 'acc-1',
      description: 'Sueldo',
    );

    await tester.pumpWidget(
      _wrap(MovementTile(movement: movement), accounts: const [_account]),
    );
    await tester.pumpAndSettle();

    expect(find.text('Sueldo'), findsOneWidget);
    expect(find.textContaining('SU'), findsOneWidget);
    expect(find.textContaining('Cuenta sueldo'), findsOneWidget);
    expect(find.textContaining('+'), findsWidgets);
  });

  testWidgets('shows an expense movement with a minus sign', (tester) async {
    final movement = Movement(
      id: 'mv-2',
      amount: 35000,
      category: _category,
      date: DateTime(2026, 7, 2),
      type: MovementType.egreso,
      account: 'acc-1',
    );

    await tester.pumpWidget(_wrap(MovementTile(movement: movement)));
    await tester.pumpAndSettle();

    expect(find.textContaining('−'), findsWidgets);
  });

  testWidgets('falls back to a neutral avatar when category is null', (
    tester,
  ) async {
    final movement = Movement(
      id: 'mv-3',
      amount: 5000,
      date: DateTime(2026, 7, 3),
      type: MovementType.egreso,
      account: 'acc-1',
    );

    await tester.pumpWidget(_wrap(MovementTile(movement: movement)));
    await tester.pumpAndSettle();

    expect(find.byIcon(Icons.swap_horiz), findsOneWidget);
  });

  testWidgets('invokes onTap when tapped', (tester) async {
    final movement = Movement(
      id: 'mv-4',
      amount: 5000,
      date: DateTime(2026, 7, 3),
      type: MovementType.egreso,
      account: 'acc-1',
    );
    var tapCount = 0;

    await tester.pumpWidget(
      _wrap(MovementTile(movement: movement, onTap: () => tapCount++)),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('movement-tile-mv-4')));
    await tester.pumpAndSettle();

    expect(tapCount, 1);
  });
}
