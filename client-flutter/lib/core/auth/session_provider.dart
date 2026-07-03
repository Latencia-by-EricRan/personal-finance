import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'token_storage.dart';

final authTokenStoreProvider = Provider<AuthTokenStore>(
  (ref) => TokenStorage(),
);

class AuthSessionNotifier extends Notifier<bool> {
  @override
  bool build() {
    _restore();
    return false;
  }

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
