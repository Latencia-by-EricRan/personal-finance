import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/features/movements/presentation/providers/index.dart';
import 'package:client_flutter/shared/models/index.dart';

void main() {
  group('movementFilterProvider', () {
    test('defaults to an all-null (no filter) state', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final state = container.read(movementFilterProvider);

      expect(state.type, isNull);
      expect(state.category, isNull);
      expect(state.account, isNull);
      expect(state.isEmpty, isTrue);
    });

    test('setType sets only the type field', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final notifier = container.read(movementFilterProvider.notifier);

      notifier.setType(MovementType.ingreso);

      final state = container.read(movementFilterProvider);
      expect(state.type, MovementType.ingreso);
      expect(state.isEmpty, isFalse);
    });

    test('clearType resets only the type field', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final notifier = container.read(movementFilterProvider.notifier);
      notifier.setType(MovementType.egreso);
      notifier.setCategory('cat-1');

      notifier.clearType();

      final state = container.read(movementFilterProvider);
      expect(state.type, isNull);
      expect(state.category, 'cat-1');
    });

    test('setCategory sets only the category field', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final notifier = container.read(movementFilterProvider.notifier);

      notifier.setCategory('cat-1');

      final state = container.read(movementFilterProvider);
      expect(state.category, 'cat-1');
      expect(state.type, isNull);
      expect(state.account, isNull);
    });

    test('clearCategory resets only the category field', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final notifier = container.read(movementFilterProvider.notifier);
      notifier.setCategory('cat-1');
      notifier.setAccount('acc-1');

      notifier.clearCategory();

      final state = container.read(movementFilterProvider);
      expect(state.category, isNull);
      expect(state.account, 'acc-1');
    });

    test('setAccount sets only the account field', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final notifier = container.read(movementFilterProvider.notifier);

      notifier.setAccount('acc-1');

      final state = container.read(movementFilterProvider);
      expect(state.account, 'acc-1');
    });

    test('clearAccount resets only the account field', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final notifier = container.read(movementFilterProvider.notifier);
      notifier.setAccount('acc-1');

      notifier.clearAccount();

      expect(container.read(movementFilterProvider).account, isNull);
    });

    test('clearAll resets every field regardless of what was set', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final notifier = container.read(movementFilterProvider.notifier);
      notifier.setType(MovementType.ingreso);
      notifier.setCategory('cat-1');
      notifier.setAccount('acc-1');

      notifier.clearAll();

      expect(container.read(movementFilterProvider).isEmpty, isTrue);
    });
  });
}
