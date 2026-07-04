import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/shared/widgets/index.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Widget _wrap(Widget child) => MaterialApp(
      theme: AppTheme.dark,
      home: Scaffold(body: Center(child: SizedBox(width: 200, child: child))),
    );

FractionallySizedBox _fill(WidgetTester tester) => tester.widget(
      find.byKey(const Key('budget-progress-meter-fill')),
    );

Container _fillContainer(WidgetTester tester) => tester.widget(
      find.descendant(
        of: find.byKey(const Key('budget-progress-meter-fill')),
        matching: find.byType(Container),
      ),
    );

void main() {
  testWidgets('under 70% renders the income color', (tester) async {
    await tester.pumpWidget(_wrap(const BudgetProgressMeter(percent: 50)));

    expect(_fillContainer(tester).color, AppColors.income);
    expect(_fill(tester).widthFactor, closeTo(0.5, 0.0001));
  });

  testWidgets('between 70 and 99 percent renders the warning color', (
    tester,
  ) async {
    await tester.pumpWidget(_wrap(const BudgetProgressMeter(percent: 85)));

    expect(_fillContainer(tester).color, AppColors.warning);
    expect(_fill(tester).widthFactor, closeTo(0.85, 0.0001));
  });

  testWidgets('100 percent or more renders the expense color', (
    tester,
  ) async {
    await tester.pumpWidget(_wrap(const BudgetProgressMeter(percent: 140)));

    expect(_fillContainer(tester).color, AppColors.expense);
  });

  testWidgets('visual fill is clamped at 100% width for an over-100 value', (
    tester,
  ) async {
    await tester.pumpWidget(_wrap(const BudgetProgressMeter(percent: 140)));

    expect(_fill(tester).widthFactor, 1.0);
  });

  testWidgets('exactly 70 percent renders the warning color (boundary)', (
    tester,
  ) async {
    await tester.pumpWidget(_wrap(const BudgetProgressMeter(percent: 70)));

    expect(_fillContainer(tester).color, AppColors.warning);
  });

  testWidgets('exactly 100 percent renders the expense color (boundary)', (
    tester,
  ) async {
    await tester.pumpWidget(_wrap(const BudgetProgressMeter(percent: 100)));

    expect(_fillContainer(tester).color, AppColors.expense);
  });
}
