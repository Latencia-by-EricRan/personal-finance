import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/features/movements/presentation/providers/index.dart';

void main() {
  group('selectedMonthProvider', () {
    test('defaults to the current month and year', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final now = DateTime.now();
      final state = container.read(selectedMonthProvider);

      expect(state.month, now.month);
      expect(state.year, now.year);
    });

    test('previousMonth steps back within the same year', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final notifier = container.read(selectedMonthProvider.notifier);
      notifier.state = (month: 7, year: 2026);

      notifier.previousMonth();

      expect(container.read(selectedMonthProvider), (month: 6, year: 2026));
    });

    test('previousMonth rolls over December of the prior year from January', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final notifier = container.read(selectedMonthProvider.notifier);
      notifier.state = (month: 1, year: 2026);

      notifier.previousMonth();

      expect(container.read(selectedMonthProvider), (month: 12, year: 2025));
    });

    test('nextMonth steps forward within the same year', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final notifier = container.read(selectedMonthProvider.notifier);
      notifier.state = (month: 7, year: 2026);

      notifier.nextMonth();

      expect(container.read(selectedMonthProvider), (month: 8, year: 2026));
    });

    test('nextMonth rolls over to January of the next year from December', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final notifier = container.read(selectedMonthProvider.notifier);
      notifier.state = (month: 12, year: 2026);

      notifier.nextMonth();

      expect(container.read(selectedMonthProvider), (month: 1, year: 2027));
    });
  });
}
