import 'package:flutter/foundation.dart' show visibleForTesting;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'token_storage.dart';

final authTokenStoreProvider = Provider<AuthTokenStore>(
  (ref) => AuthTokenStorage(),
);

class AuthSessionNotifier extends Notifier<bool> {
  Future<void>? _restoreFuture;

  @override
  bool build() {
    _restoreFuture = _restore();
    return false;
  }

  /// Resolves once the initial token-store read from [build] completes.
  ///
  /// Exposed so tests can deterministically await session restoration
  /// instead of relying on a `Future.delayed(Duration.zero)` timing hack.
  @visibleForTesting
  Future<void> get restored => _restoreFuture ?? Future<void>.value();

  Future<void> _restore() async {
    final token = await ref.read(authTokenStoreProvider).readToken();
    state = token != null;
  }

  Future<void> login(String token) async {
    await ref.read(authTokenStoreProvider).writeToken(token);
    state = true;
  }

  Future<void> logout() async {
    await ref.read(authTokenStoreProvider).clearToken();
    state = false;
  }
}

final authSessionProvider = NotifierProvider<AuthSessionNotifier, bool>(
  AuthSessionNotifier.new,
);
