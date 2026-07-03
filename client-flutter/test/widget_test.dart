import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/main.dart';

void main() {
  testWidgets('NorteApp boots and renders the themed preview', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const NorteApp());

    expect(find.text('Julio 2026'), findsOneWidget);
    expect(find.text(r'$122.600,00'), findsOneWidget);
  });
}
