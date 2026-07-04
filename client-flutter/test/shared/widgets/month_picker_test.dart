import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/shared/widgets/index.dart';

void main() {
  testWidgets('renders the label and calls the prev/next callbacks', (
    tester,
  ) async {
    var previousCount = 0;
    var nextCount = 0;

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: Scaffold(
          body: MonthPicker(
            label: 'Julio 2026',
            onPrevious: () => previousCount++,
            onNext: () => nextCount++,
          ),
        ),
      ),
    );

    expect(find.text('Julio 2026'), findsOneWidget);

    await tester.tap(find.byKey(const Key('month-picker-previous')));
    await tester.tap(find.byKey(const Key('month-picker-next')));
    await tester.pump();

    expect(previousCount, 1);
    expect(nextCount, 1);
  });
}
