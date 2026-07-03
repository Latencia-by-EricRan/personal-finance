import 'package:client_flutter/core/auth/index.dart';

/// Shared in-memory [AuthTokenStore] test double.
///
/// Used by both `test/core/auth/session_provider_test.dart` and
/// `test/core/network/dio_client_test.dart`, which previously each defined
/// their own near-identical private `_FakeTokenStore`.
class FakeTokenStore implements AuthTokenStore {
  String? token;
  var clearCallCount = 0;

  @override
  Future<String?> readToken() async => token;

  @override
  Future<void> writeToken(String value) async => token = value;

  @override
  Future<void> clearToken() async {
    clearCallCount++;
    token = null;
  }
}
