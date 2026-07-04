import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/shared/widgets/index.dart';

void main() {
  testWidgets('renders the message and calls onRetry when tapped', (
    tester,
  ) async {
    var retryCount = 0;
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: Scaffold(
          body: ErrorRetry(
            message: 'No pudimos cargar el resumen.',
            onRetry: () => retryCount++,
          ),
        ),
      ),
    );

    expect(find.text('No pudimos cargar el resumen.'), findsOneWidget);

    await tester.tap(find.byKey(const Key('error-retry-button')));
    await tester.pump();

    expect(retryCount, 1);
  });
}
