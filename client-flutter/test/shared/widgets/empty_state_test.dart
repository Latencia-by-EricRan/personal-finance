import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/theme/index.dart';
import 'package:client_flutter/shared/widgets/index.dart';

void main() {
  testWidgets('renders the given icon and message', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: const Scaffold(
          body: EmptyState(
            message: 'No hay movimientos este mes.',
            icon: Icons.savings_outlined,
          ),
        ),
      ),
    );

    expect(find.text('No hay movimientos este mes.'), findsOneWidget);
    expect(find.byIcon(Icons.savings_outlined), findsOneWidget);
  });

  testWidgets('defaults to a generic inbox icon', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark,
        home: const Scaffold(body: EmptyState(message: 'Nada por acá.')),
      ),
    );

    expect(find.byIcon(Icons.inbox_outlined), findsOneWidget);
  });
}
