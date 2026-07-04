import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/format/index.dart';
import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/shared/models/index.dart';
import 'package:client_flutter/shared/widgets/index.dart';

void main() {
  testWidgets('shows the net figure and the income/expense split', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: const Scaffold(
          body: BalanceCard(
            amount: MovementAmountSummary(income: 185000, expense: 35000),
          ),
        ),
      ),
    );

    expect(find.text('Disponible este mes'), findsOneWidget);
    expect(find.text(AppFormatters.currencyHero(150000)), findsOneWidget);
    expect(find.text(AppFormatters.currency(185000)), findsOneWidget);
    expect(find.text(AppFormatters.currency(35000)), findsOneWidget);
    expect(find.text('Ingresos'), findsOneWidget);
    expect(find.text('Egresos'), findsOneWidget);
  });

  testWidgets('shows a negative net figure when expenses exceed income', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: const Scaffold(
          body: BalanceCard(
            amount: MovementAmountSummary(income: 1000, expense: 4000),
          ),
        ),
      ),
    );

    expect(find.text(AppFormatters.currencyHero(-3000)), findsOneWidget);
  });
}
