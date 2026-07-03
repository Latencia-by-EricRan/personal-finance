import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:client_flutter/core/auth/index.dart';

class _FakeTokenStore implements AuthTokenStore {
  String? token;

  @override
  Future<String?> readToken() async => token;

  @override
  Future<void> writeToken(String value) async => token = value;

  @override
  Future<void> clearToken() async => token = null;
}

void main() {
  test('starts logged out when there is no stored token', () async {
    final container = ProviderContainer(
      overrides: [
        authTokenStoreProvider.overrideWithValue(_FakeTokenStore()),
      ],
    );
    addTearDown(container.dispose);

    expect(container.read(authSessionProvider), isFalse);
  });

  test('restores a logged-in session when a token already exists', () async {
    final tokenStore = _FakeTokenStore()..token = 'existing-token';
    final container = ProviderContainer(
      overrides: [authTokenStoreProvider.overrideWithValue(tokenStore)],
    );
    addTearDown(container.dispose);

    container.read(authSessionProvider);
    await Future<void>.delayed(Duration.zero);

    expect(container.read(authSessionProvider), isTrue);
  });

  test('login stores the token and flips state to true', () async {
    final tokenStore = _FakeTokenStore();
    final container = ProviderContainer(
      overrides: [authTokenStoreProvider.overrideWithValue(tokenStore)],
    );
    addTearDown(container.dispose);

    await container.read(authSessionProvider.notifier).login('new-token');

    expect(container.read(authSessionProvider), isTrue);
    expect(tokenStore.token, 'new-token');
  });

  test('logout clears the token and flips state to false', () async {
    final tokenStore = _FakeTokenStore()..token = 'existing-token';
    final container = ProviderContainer(
      overrides: [authTokenStoreProvider.overrideWithValue(tokenStore)],
    );
    addTearDown(container.dispose);

    await container.read(authSessionProvider.notifier).logout();

    expect(container.read(authSessionProvider), isFalse);
    expect(tokenStore.token, isNull);
  });
}
