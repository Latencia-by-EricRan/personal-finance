import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/auth/index.dart';

import '../../support/fake_token_store.dart';

void main() {
  test('starts logged out when there is no stored token', () async {
    final container = ProviderContainer(
      overrides: [
        authTokenStoreProvider.overrideWithValue(FakeTokenStore()),
      ],
    );
    addTearDown(container.dispose);

    expect(container.read(authSessionProvider), isFalse);
  });

  test('restores a logged-in session when a token already exists', () async {
    final tokenStore = FakeTokenStore()..token = 'existing-token';
    final container = ProviderContainer(
      overrides: [authTokenStoreProvider.overrideWithValue(tokenStore)],
    );
    addTearDown(container.dispose);

    container.read(authSessionProvider);
    await container.read(authSessionProvider.notifier).restored;

    expect(container.read(authSessionProvider), isTrue);
  });

  test('login stores the token and flips state to true', () async {
    final tokenStore = FakeTokenStore();
    final container = ProviderContainer(
      overrides: [authTokenStoreProvider.overrideWithValue(tokenStore)],
    );
    addTearDown(container.dispose);

    await container.read(authSessionProvider.notifier).login('new-token');

    expect(container.read(authSessionProvider), isTrue);
    expect(tokenStore.token, 'new-token');
  });

  test('logout clears the token and flips state to false', () async {
    final tokenStore = FakeTokenStore()..token = 'existing-token';
    final container = ProviderContainer(
      overrides: [authTokenStoreProvider.overrideWithValue(tokenStore)],
    );
    addTearDown(container.dispose);

    await container.read(authSessionProvider.notifier).logout();

    expect(container.read(authSessionProvider), isFalse);
    expect(tokenStore.token, isNull);
  });
}
